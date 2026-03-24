# 07 — Next.js + Ant Design + TanStack Query Best Practices

> Framework-specific patterns, integration rules, performance optimizations, and security practices for the Allkons Seller Platform stack.

---

## Next.js App Router

### Server vs Client Components

Next.js App Router defaults to **Server Components**. Only add `"use client"` when required.

| Need `"use client"` | Keep as Server Component |
| -------------------- | ----------------------- |
| `useState`, `useEffect`, `useReducer` | Static content rendering |
| `onClick`, `onChange`, event handlers | Data fetching with `async/await` |
| Browser APIs (`window`, `document`) | Reading cookies/headers (server-side) |
| Ant Design interactive components | Layout containers, wrappers |
| TanStack Query hooks | Metadata generation |
| Zustand store access | Static imports, constants |

```tsx
// Server Component (default) — no directive needed
const TermsPage = () => {
  return (
    <div className="p-8">
      <h1>Terms of Service</h1>
      <p>Static content...</p>
    </div>
  );
};

// Client Component — explicit directive
"use client";
const ProductList = () => {
  const { data } = useQuery({ ... });  // Needs client
  return <Table dataSource={data} />;   // Interactive Ant Design component
};
```

### React Compiler

The project has **React Compiler enabled** (`reactCompiler: true` in `next.config.ts`). This automatically optimizes re-renders, reducing the need for manual `React.memo`, `useMemo`, and `useCallback`.

**Still use explicit memoization when**:
- The intent needs to be documented (complex computations)
- You're passing callbacks to deeply nested children
- Performance profiling shows a bottleneck

### API Routes as Proxy

All client-to-backend communication goes through Next.js API routes:

```
src/app/api/
  [service]/
    [...path]/
      route.ts          # Generic proxy — forwards to backend microservice
  auth/
    login/route.ts      # Sets httpOnly auth cookie
    logout/route.ts     # Clears httpOnly auth cookie
```

**Rules**:
- Never expose backend URLs to the client (`NEXT_PUBLIC_*` should NOT contain backend URLs)
- The proxy route forwards: cookies, `Authorization` header, `CurrentMerchantSlug` header
- The proxy handles `FormData` and binary responses (file downloads)
- Auth routes specifically handle httpOnly cookie management

### Middleware

```ts
// middleware.ts — runs on the Edge Runtime
// - Checks auth-session cookie
// - Unauthenticated on protected route → redirect to /login
// - Authenticated on /login → redirect to /
// - Lightweight — no DB calls, no heavy computation
```

**Rules**:
- Keep middleware minimal — only auth redirects
- Use `routes.*()` constants for redirect paths
- Match only necessary routes (don't run on static assets)

### Image & Font Optimization

```tsx
// Images — always use next/image
import Image from "next/image";
<Image src="/home/logo.png" alt="Logo" width={120} height={40} priority />

// Fonts — already configured in layout via next/font
// Primary: Noto Sans Thai Looped, Secondary: Kanit
// Do NOT add additional font imports or <link> tags
```

### Dynamic Imports

Lazy load heavy components to reduce initial bundle:

```tsx
import dynamic from "next/dynamic";

// Heavy component — load on demand
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  loading: () => <Skeleton active />,
  ssr: false,
});

// Map component — client-only
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
});
```

---

## Ant Design 5 Integration

### SSR Compatibility — `AntdRegistry`

`@ant-design/nextjs-registry` is required at the root layout to prevent style flickering during SSR:

```tsx
// src/app/layout.tsx
import { AntdRegistry } from "@ant-design/nextjs-registry";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
```

**Rules**:
- `AntdRegistry` must wrap **everything** that uses Ant Design
- It must be in the root layout (not in a nested layout)
- Do NOT use `@ant-design/cssinjs` directly — `AntdRegistry` handles it

### ConfigProvider — Thai Locale & Theme

```tsx
// src/app/providers.tsx
import { ConfigProvider } from "antd";
import thTH from "antd/locale/th_TH";

<ConfigProvider
  locale={thTH}
  theme={{
    token: {
      colorPrimary: "#00AF43",
    },
  }}
>
  {children}
</ConfigProvider>
```

**Rules**:
- Always use Thai locale (`thTH`) for Ant Design components
- Primary color is `#00AF43` — set via `ConfigProvider` theme token
- Do NOT override Ant Design's global CSS variables directly — use `ConfigProvider` or Tailwind bracket notation

### Ant Design + Tailwind CSS Coexistence

#### Spacing & Layout → Tailwind

```tsx
<div className="flex flex-col gap-4 p-6 rounded-lg bg-background-primary">
  <Form layout="vertical">...</Form>
</div>
```

#### Ant Design Internal Overrides → Tailwind Bracket Notation

```tsx
<Table
  className="
    [&_.ant-table-thead>tr>th]:!bg-background-secondary
    [&_.ant-table-thead>tr>th]:!border-none
    [&_.ant-table-thead>tr>th]:!font-normal
    [&_.ant-table-thead>tr>th]:!text-text-secondary
    [&_.ant-pagination-item-active]:!bg-primary
    [&_.ant-pagination-item-active]:!border-primary
    [&_.ant-pagination-item-active>a]:!text-white
  "
/>
```

#### Complex Overrides → Co-located CSS

```css
/* components/DataEntry/TextField/custom.css */
.custom-text-field .ant-input-affix-wrapper {
  border-radius: 8px !important;
}
.custom-text-field .ant-input-affix-wrapper:focus-within {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 0 2px rgba(0, 175, 67, 0.1) !important;
}
```

#### Priority Order

1. Tailwind utility classes (layout, spacing, colors)
2. Bracket notation overrides (Ant Design internals)
3. Co-located CSS files (complex selectors, animations)
4. `ConfigProvider` theme tokens (global Ant Design theming)

> Never use `!important` in global CSS files. Keep overrides scoped to components.

### Form Integration

Ant Design `<Form>` is the **only** form solution:

```tsx
"use client";
import { Form } from "antd";
import TextField from "@/components/DataEntry/TextField";
import SelectField from "@/components/DataEntry/Select";

interface ProductFormFields {
  name: string;
  categoryId: number;
  price: number;
  description?: string;
}

const ProductForm = () => {
  const [form] = Form.useForm<ProductFormFields>();

  const handleSubmit = (values: ProductFormFields) => {
    mutate(values);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <TextField name="name" label="ชื่อสินค้า" rules={[{ required: true, message: "กรุณากรอกชื่อสินค้า" }]} isRequired />
      <SelectField name="categoryId" label="หมวดหมู่" options={categoryOptions} isRequired />
      <TextField name="price" label="ราคา" inputType="numberOnly" rules={[{ required: true }]} isRequired />
      <TextField name="description" label="รายละเอียด" />
    </Form>
  );
};
```

**Never use**: `react-hook-form`, `formik`, `final-form`, or any other form library.

### Responsive Design

Use `Grid.useBreakpoint()` for responsive logic:

```tsx
import { Grid } from "antd";

const { useBreakpoint } = Grid;

const MyComponent = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.sm;  // < 576px
  const isTablet = screens.sm && !screens.lg; // 576px - 1023px
  const isDesktop = screens.lg;  // ≥ 1024px

  if (isMobile) return <MobileLayout />;
  if (isTablet) return <TabletLayout />;
  return <DesktopLayout />;
};
```

**Breakpoints** (from `tailwind.config.ts`):

| Name  | Min Width |
| ----- | --------- |
| `sm`  | 576px     |
| `md`  | 768px     |
| `lg`  | 1024px    |
| `xl`  | 1280px    |
| `2xl` | 1536px    |

### Modal vs Drawer Pattern

Standard responsive dialog pattern used throughout the app:

| Viewport    | Component     |
| ----------- | ------------- |
| Desktop ≥ sm | `<Modal>`    |
| Mobile < sm  | `<Drawer placement="bottom">` |

This is encapsulated in the `Popup` component and exposed via `usePopup` and `useConfirmModal` hooks.

---

## TanStack Query 5 Best Practices

### Provider Setup

```tsx
// src/app/providers.tsx
const [queryClient] = useState(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 min — data considered "fresh"
      gcTime: 5 * 60 * 1000,       // 5 min — garbage collect unused cache
      refetchOnWindowFocus: false,  // No surprise refetches
      retry: 1,                     // One retry on failure
    },
    mutations: {
      retry: 1,
    },
  },
}));

// DevTools included for development
<ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
```

### Query Patterns by Use Case

#### List with Pagination (Products, Merchants)

```tsx
const { data, isLoading } = useQuery({
  queryKey: ["merchantProducts", merchantSlug, page, pageLimit, search, status],
  queryFn: () => getProductsByMerchant(merchantSlug!, { page, pageLimit, search, status }),
  enabled: !!merchantSlug,
  placeholderData: keepPreviousData, // Smooth pagination
});
```

#### Single Entity (Organization, User Profile)

```tsx
const { data: profile } = useQuery({
  queryKey: ["userProfile"],
  queryFn: () => getProfile(),
});
```

#### Dependent Queries (Organization → Merchants)

```tsx
const { data: orgData } = useQuery({
  queryKey: ["organization", orgId],
  queryFn: () => getOrganization(orgId!),
  enabled: !!orgId,
});

const { data: merchants } = useQuery({
  queryKey: ["merchants", orgData?.data?.id],
  queryFn: () => getMerchantsByOrg(orgData!.data!.id),
  enabled: !!orgData?.data?.id, // Only after org is loaded
});
```

#### Static/Reference Data (Categories, Provinces)

```tsx
const { data: categories } = useQuery({
  queryKey: ["categories"],
  queryFn: () => getCategories(),
  staleTime: Infinity,    // Never goes stale — reference data rarely changes
  gcTime: 30 * 60 * 1000, // Keep in cache for 30 min
});
```

### Mutation Patterns

#### Mutation Hook + Cache Invalidation

```tsx
// In hook file
export const useCreateProduct = () => {
  return useMutation({
    mutationKey: ["createProduct"],
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
  });
};

// In component
const queryClient = useQueryClient();
const { mutate, isPending } = useCreateProduct();

const handleSubmit = (values: ProductFormFields) => {
  mutate(values, {
    onSuccess: () => {
      showPopup("success", { title: "สร้างสินค้าสำเร็จ" });
      queryClient.invalidateQueries({ queryKey: ["merchantProducts"] });
      router.push(routes.productList());
    },
    onError: (error) => {
      showPopup("error", { ... });
    },
  });
};
```

#### Loading States

```tsx
const { isPending } = useCreateProduct();

<CustomButton
  dataTestId="btn--product-submit"
  loading={isPending}    // Ant Design Button loading prop
  disabled={isPending}
>
  บันทึก
</CustomButton>
```

### Anti-Patterns to Avoid

| Anti-Pattern | Correct Approach |
| ------------ | --------------- |
| `queryClient.setQueryData` for complex mutations | Use `invalidateQueries` — simpler, avoids stale data |
| Fetching in `useEffect` + `setState` | Use `useQuery` — built-in caching, loading, error states |
| Storing API data in Zustand | Use TanStack Query for server state, Zustand for client selections |
| Global query key strings without structure | Use consistent key patterns or query key factories |
| Polling with `setInterval` | Use `refetchInterval` option in `useQuery` |
| Manual cache management | Let TanStack Query handle it via `staleTime` + `gcTime` |

---

## Security Best Practices

### Authentication

| Rule | Detail |
| ---- | ------ |
| httpOnly cookies | Auth tokens stored as httpOnly cookies via API route — not accessible to JavaScript |
| Client cookie for middleware | `auth-session` cookie (js-cookie, 7 days) for Edge middleware checks |
| Dual cookie strategy | API route sets httpOnly + middleware reads client cookie |
| Token refresh | Not implemented yet — if token expires, user re-authenticates |
| Auto-logout on 401 | Axios interceptor clears all state and redirects |

### Environment Variables

```bash
# ✅ Server-only (not exposed to client)
API_CUSTOMER_URL=http://api-customer:8080
API_PRODUCT_URL=http://api-product:8080
JWT_SECRET=...

# ✅ Client-safe (prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_APP_NAME=Allkons Seller Platform
NEXT_PUBLIC_APP_ENV=production

# ❌ NEVER expose backend URLs to client
NEXT_PUBLIC_API_URL=http://api-customer:8080  # WRONG!
```

### XSS Prevention

```ts
import { sanitize } from "@/libs/dom-purify";

// Always sanitize before rendering HTML
<div dangerouslySetInnerHTML={{ __html: sanitize(htmlContent) }} />
```

### CSRF Protection

The proxy architecture provides inherent CSRF protection:
- All API calls go through same-origin Next.js API routes
- No cross-origin requests from the browser
- Cookies are same-site

---

## Business-Specific Patterns

### Product Management Context

Products are always scoped to a merchant. Every product-related operation must:

1. **Check merchant selection** — Don't allow product operations without an active merchant
2. **Include merchant slug** — The Axios interceptor auto-attaches `CurrentMerchantSlug`
3. **Scope query keys** — Include `merchantSlug` in all product query keys

```tsx
// ✅ Correct — scoped to merchant
const merchantSlug = useUserStore((state) => state.merchant?.merchantSlug);

const { data } = useQuery({
  queryKey: ["products", merchantSlug, page],
  queryFn: () => getProducts(merchantSlug!),
  enabled: !!merchantSlug,
});

// ❌ Wrong — no merchant context
const { data } = useQuery({
  queryKey: ["products", page],
  queryFn: () => getProducts(),  // Missing merchant scope
});
```

### Organization KYC Flow

Organizations have a KYC status that affects available actions:

```ts
enum OrganizationKycStatus {
  NONE = "NONE",                    // Not submitted
  WAIT_FOR_APPROVE = "WAIT_FOR_APPROVE", // Under review
  REQUEST_MORE = "REQUEST_MORE",    // Additional docs needed
  APPROVE = "APPROVE",             // Verified
  REJECT = "REJECT",              // Rejected
}
```

UI should conditionally enable/disable merchant creation and product management based on KYC status.

### Multi-Tenant Context Switching

When user switches organization or merchant:

```tsx
const handleOrgSwitch = (newOrg: Organization) => {
  // 1. Update Zustand
  setOrganization(newOrg);
  setMerchant(null); // Reset merchant

  // 2. Invalidate merchant-scoped data
  queryClient.invalidateQueries({ queryKey: ["merchantProducts"] });
  queryClient.invalidateQueries({ queryKey: ["merchants"] });

  // 3. Auto-select single merchant
  if (newOrg.merchants?.length === 1) {
    setMerchant(newOrg.merchants[0]);
  }

  // 4. Navigate to merchant selection if multiple
  if (newOrg.merchants?.length > 1) {
    router.push(routes.merchantList());
  }
};
```

---

## Summary — Integration Checklist

When building a new module, verify:

- [ ] `"use client"` added only where necessary
- [ ] Ant Design components wrapped in project wrappers (CustomButton, TextField, etc.)
- [ ] TanStack Query used for all API data (not `useEffect` + `fetch`)
- [ ] Query keys include merchant/organization context where appropriate
- [ ] `enabled` option used for conditional fetching
- [ ] Mutations handle both `onSuccess` (popup + invalidate) and `onError` (popup)
- [ ] `isPending` state shown on submit buttons
- [ ] Zustand only stores client selections (not API cache)
- [ ] Routes use `routes.*()` constants
- [ ] `dataTestId` props added to all interactive elements
- [ ] Thai text for all user-facing strings
- [ ] Tailwind tokens for all colors (no hardcoded hex)
- [ ] Responsive design via `Grid.useBreakpoint()` or Tailwind breakpoints
