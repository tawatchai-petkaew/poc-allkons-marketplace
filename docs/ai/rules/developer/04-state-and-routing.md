# 04 — State Management & Routing

> Rules for Zustand stores, React Context, state selection, routing, and the business context hierarchy (User → Organization → Merchant).

---

## State Architecture Overview

The project uses **three** complementary state solutions. Each serves a distinct purpose — do **not** mix responsibilities.

| Solution             | Purpose                                    | Persistence         | Example                                     |
| -------------------- | ------------------------------------------ | -------------------- | ------------------------------------------- |
| **TanStack Query**   | All server/API state — fetching, caching   | In-memory cache      | Product lists, user profile, organizations  |
| **Zustand**          | Persisted client state across sessions     | `localStorage`       | Active merchant, active organization, user  |
| **React Context**    | Cross-cutting concerns, shared providers   | Session (in-memory)  | Auth session, notification API              |

### When to Use Each

```
"Do I need to fetch/cache data from an API?"
  → YES → TanStack Query (useQuery / useMutation)

"Do I need to persist client-side selections across page reloads?"
  → YES → Zustand store (persisted to localStorage)

"Do I need to share a provider/service across the component tree?"
  → YES → React Context (useAuth, useNotification)

"Is it local to a single component?"
  → YES → React useState / useReducer
```

---

## Zustand Store

### File Organization

Stores live in `src/store/` with one file per domain:

```
src/store/
  user.store.ts        # User, merchant, and organization selections
```

### Store Pattern

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 1. Define the state interface
interface IStoreStateUser {
  user: IAuthResponseUserProfile | null;
  merchant: MerchantSelection | null;
  organization: OrganizationSelection | null;
  setUser: (user: IAuthResponseUserProfile | null) => void;
  setMerchant: (merchant: MerchantSelection | null) => void;
  setOrganization: (organization: OrganizationSelection | null) => void;
  clearStore: () => void;
}

// 2. Create the store with persist middleware
export const useUserStore = create<IStoreStateUser>()(
  persist(
    (set) => ({
      user: null,
      merchant: null,
      organization: null,
      setUser: (user) => set({ user }),
      setMerchant: (merchant) => set({ merchant }),
      setOrganization: (organization) => set({ organization }),
      clearStore: () =>
        set({ user: null, merchant: null, organization: null }),
    }),
    {
      name: "user-storage",                        // localStorage key
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
```

### Naming Conventions

| Element            | Convention               | Example                    |
| ------------------ | ------------------------ | -------------------------- |
| State interface    | `IStoreState[Domain]`    | `IStoreStateUser`          |
| Store hook         | `use[Domain]Store`       | `useUserStore`             |
| Setter             | `set[Field]`             | `setUser`, `setMerchant`   |
| Clear method       | `clearStore`             | Always required            |
| localStorage key   | `[domain]-storage`       | `"user-storage"`           |

### Rules

| Rule | Detail |
| ---- | ------ |
| Always include `clearStore()` | Resets all fields to initial values — called on logout |
| Persist only what's needed | Don't store API response caches — that's TanStack Query's job |
| Keep stores flat | Avoid deeply nested state objects — use separate fields |
| Type all state | No `any` in store interfaces |
| Use selectors | Access only the fields you need to avoid unnecessary re-renders |

### Selector Usage

```tsx
// ✅ Good — only subscribes to merchant changes
const merchant = useUserStore((state) => state.merchant);
const setMerchant = useUserStore((state) => state.setMerchant);

// ✅ Also good — destructure multiple related fields
const { merchant, organization, setMerchant } = useUserStore();

// ❌ Avoid — subscribes to entire store, re-renders on any change
const store = useUserStore();
```

---

## React Context

### Existing Contexts

| Context               | File                              | Provides                              |
| --------------------- | --------------------------------- | ------------------------------------- |
| **AuthProvider**      | `src/hooks/useAuth.tsx`           | `userSession`, `setSession`, `logout`, `getSession`, `loading` |
| **NotificationProvider** | `src/hooks/useNotification.tsx` | Ant Design `notification` API handle with custom styling |

### Auth Context Pattern

```tsx
// Provider (in useAuth.tsx)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userSession, setUserSessionState] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from cookie on mount
  useEffect(() => {
    const session = getSessionFromCookie();
    if (session) setUserSessionState(session);
    setLoading(false);
  }, []);

  const setSession = (session: Session) => {
    setCookieSession(session);  // Client cookie (7 days)
    setUserSessionState(session);
    // Also set httpOnly cookie via API route
    fetch("/api/auth/login", { method: "POST", body: JSON.stringify(session) });
  };

  const logout = () => {
    clearCookies();
    useUserStore.getState().clearStore(); // Clear Zustand
    setUserSessionState(null);
    fetch("/api/auth/logout", { method: "POST" });
    router.push(routes.login());
  };

  return (
    <AuthContext.Provider value={{ userSession, setSession, logout, loading, getSession }}>
      {children}
    </AuthContext.Provider>
  );
};

// Consumer hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
```

### When to Create a New Context

Create a new React Context only when:
- The value needs to be available to **many components** across the tree
- It wraps a **browser API** or **third-party service** (e.g., notification, analytics)
- It manages **session-level state** that shouldn't persist to localStorage

For everything else, prefer Zustand (persistent state) or TanStack Query (server state).

---

## Routing

### Route Constants

All routes are defined as **functions** in `src/constants/routing.constants.ts`:

```ts
export const routes = {
  home: () => "/",
  login: () => "/login",
  merchantList: () => "/merchant-list",
  productList: () => "/products/manage-products",
  organizationList: () => "/organizations",
  organizationCreate: () => "/organizations/create",
  user: () => "/user",
  terms: () => "/terms",
  privacy: () => "/privacy",
};
```

### Never Hardcode Route Strings

```ts
// ✅ Correct — always use routes.*()
router.push(routes.login());
router.push(routes.merchantList());
redirect(routes.home());
<Link href={routes.productList()}>Products</Link>

// ❌ Wrong — never hardcode paths
router.push("/login");
router.push("/merchant-list");
<Link href="/products/manage-products">Products</Link>
```

This applies to:
- `router.push()`, `router.replace()`
- `redirect()` (from `next/navigation`)
- `<Link href={...}>`
- Middleware path matching

### Adding a New Route

1. Add the route function to `routing.constants.ts`
2. Create the page file at the corresponding path
3. If protected, place under `src/app/(auth)/[module]/page.tsx`
4. If public, place under `src/app/[module]/page.tsx`
5. Add to sidebar menu if it needs navigation (in `Sidebar/index.tsx`)

---

## Route Groups

### Protected Routes — `(auth)`

All authenticated pages live under `src/app/(auth)/`:

```
src/app/(auth)/
  layout.tsx            # Auth guard + Sidebar + Navbar
  page.tsx              # Home page (redirects to merchant-list)
  merchant-list/
  organizations/
  products/
  user/
```

The `(auth)/layout.tsx`:
1. Checks auth session via `useAuth()`
2. Redirects to `/login` if not authenticated
3. Renders `Sidebar` + `Navbar` + content area
4. Hides sidebar for organization/user management paths

### Public Routes

```
src/app/
  login/page.tsx        # Login/Register flow
  terms/page.tsx        # Terms of service
  privacy/page.tsx      # Privacy policy
```

### Middleware

```ts
// middleware.ts
// Protects routes at the edge:
// - Unauthenticated user on protected route → redirect to /login
// - Authenticated user on /login → redirect to /
// Uses auth-session cookie for checks (fast, no DB call)
```

---

## URL State — `useTab` Hook

For tab-based navigation that should be **synced with the URL**:

```tsx
import useTab from "@/hooks/useTab";

const ProductsPage = () => {
  const { currentTab, setTab } = useTab("status", "all");

  return (
    <Tabs
      activeKey={currentTab}
      onChange={(key) => setTab(key)}
      items={[
        { key: "all", label: "ทั้งหมด" },
        { key: "active", label: "กำลังขาย" },
        { key: "hidden", label: "ซ่อน" },
      ]}
    />
  );
};
```

This updates the URL search params (e.g., `?status=active`) so the tab state survives page refreshes and can be shared via URL.

---

## Business Context Flow

### Entity Hierarchy

```
User (authenticated session)
  └── Organization[]               ← User can have multiple organizations
       ├── Type: PERSONAL | REGISTERED_INDIVIDUAL | JURISTIC
       ├── KYC Status: NONE | WAIT_FOR_APPROVE | APPROVE | REJECT | REQUEST_MORE
       ├── Role: Owner | Member | Admin | Super Admin
       └── Merchant[]              ← Each org can have multiple merchants (stores)
            ├── Store info
            └── Product[]          ← Products belong to a merchant
                 └── ProductVariant[]
```

### Active Context Selection

The active organization and merchant are stored in **Zustand** (persists across page reloads):

```tsx
// Reading active context
const merchant = useUserStore((state) => state.merchant);
const organization = useUserStore((state) => state.organization);

// Setting active context (e.g., from Navbar org/merchant pickers)
const setMerchant = useUserStore((state) => state.setMerchant);
const setOrganization = useUserStore((state) => state.setOrganization);

// Merchant slug used for all product/order API calls
const merchantSlug = merchant?.merchantSlug;
```

### Context-Scoped Data Fetching

All product and order queries should include the active merchant in their query key:

```tsx
const { data: products } = useQuery({
  queryKey: ["merchantProducts", merchantSlug, page, pageSize],
  queryFn: () => getProducts(merchantSlug!, page, pageSize),
  enabled: !!merchantSlug, // Don't fetch without a selected merchant
});
```

### Organization/Merchant Switching

When a user switches organization or merchant in the Navbar:

1. Update Zustand store → `setOrganization(newOrg)`, `setMerchant(newMerchant)`
2. Invalidate relevant queries → `queryClient.invalidateQueries({ queryKey: ["merchantProducts"] })`
3. If only one merchant exists in the org, auto-select it

```tsx
const handleOrganizationChange = (org: OrganizationSelection) => {
  setOrganization(org);
  setMerchant(null); // Clear merchant until user selects one

  // If org has exactly one merchant, auto-select
  const merchants = org.merchants;
  if (merchants?.length === 1) {
    setMerchant({
      merchantId: merchants[0].id,
      merchantSlug: merchants[0].slug,
      merchantName: merchants[0].name,
    });
  }
};
```

---

## Logout Flow

When a user logs out, **all state must be cleared**:

```tsx
const logout = () => {
  // 1. Clear client cookies (auth-session)
  Cookies.remove("auth-session");

  // 2. Clear server httpOnly cookies
  fetch("/api/auth/logout", { method: "POST" });

  // 3. Clear Zustand store (user, merchant, organization)
  useUserStore.getState().clearStore();

  // 4. Clear React Context state
  setUserSession(null);

  // 5. Redirect to login
  router.push(routes.login());
};
```

---

## State Management Decision Matrix

| Scenario                                      | Solution            |
| --------------------------------------------- | ------------------- |
| Fetching product list from API                | TanStack Query      |
| Storing active merchant selection             | Zustand (persisted) |
| Managing auth session                         | React Context       |
| Form field values                             | Ant Design Form     |
| Multi-step wizard state                       | `useReducer`        |
| URL-synced tab/filter state                   | `useTab` hook (URL) |
| Debounced search input                        | `useDebounce` hook  |
| Short-lived UI state (modal open/close)       | `useState`          |
| Notification API handle                       | React Context       |
