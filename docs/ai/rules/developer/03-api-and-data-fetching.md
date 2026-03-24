# 03 — API Layer & Data Fetching (TanStack Query)

> Rules for API communication, service architecture, and TanStack React Query usage.

---

## API Proxy Architecture

Client-side code **never** calls the backend microservices directly. All requests go through the Next.js API proxy:

```
Browser → /api/{service}/... (Next.js API Route) → Backend microservice
```

### Why Proxy?

- **httpOnly cookies** — The proxy sets auth cookies as httpOnly (not accessible via JavaScript)
- **Same-origin** — Avoids CORS issues and enables CSRF protection
- **Environment isolation** — Backend URLs stay server-side only
- **Header forwarding** — Cookies, Authorization, and custom headers (`CurrentMerchantSlug`) are forwarded automatically

### Service Instances

Three pre-configured Axios instances are available from `@/libs/axios`:

| Instance      | Proxy Route       | Backend Service  | Used By                                     |
| ------------- | ----------------- | ---------------- | ------------------------------------------- |
| `customerAPI` | `/api/customer`   | `api-customer`   | Auth, User, Organization, Merchant, Consent, File Upload, Location |
| `productAPI`  | `/api/product`    | `api-product`    | Product, Category                            |
| `orderAPI`    | `/api/order`      | `api-order`      | Orders (future)                              |

```ts
import { customerAPI, productAPI, orderAPI } from "@/libs/axios";
```

### Interceptors (Automatic)

The Axios instances automatically:
1. **Attach `Bearer` token** from `auth-session` cookie on every request
2. **Attach `CurrentMerchantSlug`** header from Zustand store (for merchant-scoped operations)
3. **Handle 401 responses** — clears cookies + Zustand store → redirects to `/login`

> You do NOT need to manually attach auth headers or handle 401 errors in API functions.

---

## API File Organization

### One File Per Domain

Each domain has a dedicated API file at `src/api/[domain].api.ts`:

```
src/api/
  auth.api.ts          # Authentication & registration
  user.api.ts          # User profile management
  organization.api.ts  # Organization CRUD
  merchant.api.ts      # Merchant CRUD
  product.api.ts       # Product management
  consent.api.ts       # Consent management
  category.api.ts      # Categories
  file-upload.api.ts   # File uploads
  location.api.ts      # Location data (provinces, districts)
```

### API Function Pattern

Every API function is an **exported `async` arrow function** that:

1. Calls the appropriate service instance
2. Generic-types the Axios response as `ApiResponse<IResponseType>`
3. Returns `response.data`

```ts
import { customerAPI } from "@/libs/axios";
import type { ApiResponse } from "@/types/common.type";
import type { IAuthResponseCheckPhoneNumber } from "@/interfaces/auth/auth.response.interface";
import type { IAuthRequestCheckPhoneNumberPayload } from "@/interfaces/auth/auth.request.interface";

export const checkPhoneNumber = async (
  payload: IAuthRequestCheckPhoneNumberPayload,
) => {
  const response = await customerAPI.post<
    ApiResponse<IAuthResponseCheckPhoneNumber>
  >("/v1/register/check-phone", payload);
  return response.data;
};
```

### Function Signature Rules

| Rule | Detail |
| ---- | ------ |
| Export | Always `export const functionName = async (...) => { ... }` |
| Parameters | Use typed interfaces for payloads |
| Return | Always return `response.data` (unwrap Axios response layer) |
| Generics | Always type `ApiResponse<IResponseType>` on the Axios call |
| Naming | Verb-first: `get*`, `create*`, `update*`, `delete*`, `check*`, `send*`, `verify*` |
| No error handling | Let errors propagate — callers (mutations/queries) handle them |

### Special Headers

For operations scoped to a specific merchant, the `CurrentMerchantSlug` header is attached automatically by the Axios interceptor. For explicit header needs:

```ts
// File upload — explicit Content-Type
export const uploadDocument = async (formData: FormData, documentId: number) => {
  const response = await customerAPI.patch<ApiResponse<IUploadResponse>>(
    `/v1/organization/upload-document/${documentId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

// Registration flow — explicit token (user not yet logged in)
export const registerUserProfile = async (
  payload: IAuthRequestRegisterUserProfilePayload,
  accessToken: string,
) => {
  const response = await customerAPI.post<ApiResponse<IRegisterResponse>>(
    "/v1/register/user-profile",
    payload,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return response.data;
};
```

---

## TanStack React Query

### Provider Configuration

Default options are set in `src/app/providers.tsx`:

```ts
const [queryClient] = useState(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 minute — data considered fresh
      gcTime: 5 * 60 * 1000,       // 5 minutes — garbage collect unused cache
      refetchOnWindowFocus: false,  // No refetch on tab focus
      retry: 1,                     // Retry once on failure
    },
    mutations: {
      retry: 1,
    },
  },
}));
```

> Do NOT override these defaults unless there is a specific requirement for a particular query.

---

### Queries — `useQuery`

Use `useQuery` **directly in page or component files** for data fetching.

#### Basic Usage

```tsx
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/api/user.api";

const ProfilePage = () => {
  const { data: userProfile, isLoading, refetch } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => getProfile(),
  });

  if (isLoading) return <Skeleton />;

  return <div>{userProfile?.data?.firstName}</div>;
};
```

#### Query Key Rules

| Rule | Example |
| ---- | ------- |
| Simple string array | `["userProfile"]` |
| Include dependencies | `["products", merchantSlug, page, pageSize]` |
| Domain-first | `["merchant", merchantId]`, `["product", "list", filters]` |
| Consistent order | Key must be deterministic — same inputs = same key |

```ts
// ✅ Good query keys
queryKey: ["userProfile"]
queryKey: ["dataConsent"]
queryKey: ["merchantProducts", merchantSlug, page, pageLimit]
queryKey: ["organization", organizationId]
queryKey: ["juristicTypeList"]
queryKey: ["provinces"]

// ❌ Bad — object in key without stable reference
queryKey: ["products", { ...formValues }]  // unstable reference
```

#### Conditional Fetching

Use the `enabled` option to defer execution:

```ts
const { data } = useQuery({
  queryKey: ["dataConsent"],
  queryFn: () => getConsent(),
  enabled: !!userId,              // Only fetch when userId exists
});

const { data: merchants } = useQuery({
  queryKey: ["merchants", organizationId],
  queryFn: () => getMerchants(organizationId!),
  enabled: !!organizationId,      // Only fetch when org is selected
});
```

#### Data Access Pattern

API responses are wrapped in `ApiResponse<T>`, so data access follows:

```ts
const { data } = useQuery({ ... });

// Access the actual data
const profile = data?.data;           // ApiResponse.data → actual payload
const firstName = data?.data?.firstName;
```

#### Select for Transformation

Use `select` to transform/filter data close to the query:

```ts
const { data: activeProducts } = useQuery({
  queryKey: ["products", merchantSlug],
  queryFn: () => getProducts(merchantSlug),
  select: (response) => response.data?.items.filter(p => p.status === "ACTIVE"),
});
```

---

### Mutations — `useMutation`

#### Mutation Hook Pattern (Preferred)

Group related mutations in a **dedicated hook file**: `src/hooks/use[Domain]Mutations.ts`.
Each mutation is exported as an **individual custom hook**.

```ts
// src/hooks/useAuthMutations.ts

export const useCheckRegister = () => {
  return useMutation({
    mutationKey: ["checkRegister"],
    mutationFn: (payload: PhonePayload) =>
      checkPhoneNumber({
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
      }),
  });
};

export const useSendToken = () => {
  return useMutation({
    mutationKey: ["sendToken"],
    mutationFn: (payload: PhonePayload) =>
      sendOtpToPhoneNumber({
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
      }),
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationKey: ["verifyOtp"],
    mutationFn: (payload: OtpPayload) =>
      verifyOtp({
        otp: payload.otp,
        token: payload.token,
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
      }),
    retry: false, // Disable retry for sensitive operations
  });
};
```

#### Naming Convention

- Hook name: `use[Action]` — e.g., `useCheckRegister`, `useSendToken`, `useVerifyOtp`, `useLoginOtp`
- Mutation key: `["actionName"]` — mirrors the hook name in camelCase
- File name: `use[Domain]Mutations.ts`

#### Payload Types in Mutations

Mutation hooks can define **inline payload types** that differ from the raw API interface:

```ts
// Inline payload type — specific to the hook's needs
export interface PhonePayload {
  phoneNumber: string;
  email?: string;
  countryCode: string;
}

export const useCheckRegister = () => {
  return useMutation({
    mutationFn: (payload: PhonePayload) =>
      checkPhoneNumber({
        phoneNumber: payload.phoneNumber,
        countryCode: payload.countryCode,
      }),
  });
};
```

This is acceptable when the hook payload shape differs from (or simplifies) the raw API request interface.

#### Compound Payloads

When a mutation needs extra context beyond the API payload (e.g., an access token):

```ts
export const useRegisterUserProfile = () => {
  return useMutation({
    mutationKey: ["registerUserProfile"],
    mutationFn: ({
      payload,
      accessToken,
    }: {
      payload: IAuthRequestRegisterUserProfilePayload;
      accessToken: string;
    }) => registerUserProfile(payload, accessToken),
  });
};
```

#### Inline Mutations (Page-Specific)

For **one-off mutations** that don't need reuse, `useMutation` can be used inline in a page component:

```tsx
const { mutate: submitOrganization, isPending } = useMutation({
  mutationFn: (payload: CreateOrgPayload) => createOrganization(payload),
  onSuccess: (response) => {
    showPopup("success", { title: "สร้างองค์กรสำเร็จ" });
    queryClient.invalidateQueries({ queryKey: ["organizations"] });
    router.push(routes.organizationList());
  },
  onError: (error) => {
    showPopup("error", {
      statusCode: (error as AxiosError)?.response?.status,
      title: "เกิดข้อผิดพลาด",
    });
  },
});
```

---

### Cache Invalidation

After data-changing mutations, **invalidate** related queries to trigger a refetch:

```ts
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// After creating/updating/deleting
const { mutate } = useMutation({
  mutationFn: (payload) => updateProduct(payload),
  onSuccess: () => {
    // Invalidate all queries with this key prefix
    queryClient.invalidateQueries({ queryKey: ["products"] });
    // Optionally invalidate specific query
    queryClient.invalidateQueries({ queryKey: ["product", productId] });
  },
});
```

#### Invalidation Rules

| Rule | Detail |
| ---- | ------ |
| Invalidate on success | Always invalidate in `onSuccess`, not `onSettled` |
| Prefix matching | `queryKey: ["products"]` invalidates all keys starting with `["products", ...]` |
| Avoid `setQueryData` for complex objects | Prefer invalidation — simpler, avoids stale data bugs |
| Cross-domain invalidation | If creating an org affects merchant lists, invalidate both |

---

### Sensitive Operations

For operations where retrying could cause problems (OTP verification, payments):

```ts
export const useVerifyOtp = () => {
  return useMutation({
    mutationKey: ["verifyOtp"],
    mutationFn: (payload: OtpPayload) => verifyOtp(payload),
    retry: false, // ← Disable retry
  });
};
```

---

### Error Handling in Data Fetching

#### API Error Flow

```
API Error (4xx/5xx)
  ├── 401 Unauthorized → Axios interceptor auto-handles (clear session → redirect to login)
  ├── Mutation onError → showPopup("error", { statusCode, ... })
  └── Query error → Component checks isError, shows inline error UI
```

#### Standard Mutation Error Handler

```tsx
onError: (error) => {
  const axiosError = error as AxiosError<ApiResponse<null>>;
  showPopup("error", {
    statusCode: axiosError?.response?.status,
    title: axiosError?.response?.data?.message || "เกิดข้อผิดพลาด",
  });
}
```

#### Form Validation Errors from API

When the API returns field-level validation errors, map them back to form fields:

```tsx
onError: (error) => {
  const apiError = error as AxiosError<ApiResponse<null>>;
  if (apiError?.response?.status === 422) {
    form.setFields([
      { name: "phoneNumber", errors: ["หมายเลขโทรศัพท์ซ้ำในระบบ"] },
    ]);
  }
}
```

---

### Query Key Factory Pattern (Recommended for Large Domains)

As the product grows, organize query keys with a factory:

```ts
// src/constants/queryKeys.ts (future pattern)
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Usage
useQuery({
  queryKey: productKeys.list({ merchantSlug, page, pageSize }),
  queryFn: () => getProducts(merchantSlug, page, pageSize),
});

// Invalidation — all product queries
queryClient.invalidateQueries({ queryKey: productKeys.all });
```

---

## Data Flow Summary

```
Component
  │ useQuery({ queryKey, queryFn: () => apiFunction() })
  │ useMutation({ mutationFn: (payload) => apiFunction(payload) })
  ▼
API Layer (src/api/[domain].api.ts)
  │ customerAPI.post<ApiResponse<T>>("/v1/endpoint", payload)
  ▼
Axios Instance (src/libs/axios.ts)
  │ Auto-attach: Authorization header, CurrentMerchantSlug
  │ Auto-handle: 401 → clear session → redirect
  ▼
Next.js API Proxy (src/app/api/[service]/[...path]/route.ts)
  │ Forward request + cookies → Backend
  ▼
Backend Microservice
```
