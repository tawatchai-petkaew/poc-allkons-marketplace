# 05 — TypeScript Conventions

> Naming, typing, interfaces, enums, and type safety rules for the Allkons Seller Platform.

---

## Strict Mode

TypeScript strict mode is **enabled** (`"strict": true` in `tsconfig.json`). All code must satisfy strict type checking.

---

## File Extensions & Export Patterns

**File extensions**: Use `.tsx` if file contains JSX, otherwise `.ts`

**Exports**: Components use default export. Hooks & Providers use named export.

---

## Interface Naming

### `I` Prefix Rule

All interfaces use the **`I` prefix** — this is a project-wide convention (not a general TypeScript recommendation, but consistent within this codebase).

### Naming Patterns

| Type             | Pattern                              | Example                                     |
| ---------------- | ------------------------------------ | ------------------------------------------- |
| API Response     | `I[Domain]Response[Description]`     | `IAuthResponseCheckPhoneNumber`             |
| API Request      | `I[Domain]Request[Action]Payload`    | `IAuthRequestLoginWithPhoneOtpPayload`      |
| Query Params     | `IRequestQuery[Description]`         | `IRequestQueryProductMerchant`              |
| Store state      | `IStoreState[Domain]`               | `IStoreStateUser`                           |
| Entity           | `I[Domain][Entity]`                 | `IAuthUser`, `IAuthOrganization`            |
| Sub-entity       | `I[Parent][Child]`                  | `IMerchantStore`, `IProductVariant`         |

```ts
// Response interface
export interface IAuthResponseCheckPhoneNumber {
  isRegistered: boolean;
  isVerified: boolean;
}

// Request payload interface
export interface IAuthRequestCheckPhoneNumberPayload {
  phoneNumber: string;
  countryCode: string;
}

// Query params interface
export interface IRequestQueryProductMerchant {
  page: number;
  pageLimit: number;
  search?: string;
  status?: string;
}
```

---

## Interface File Organization

### Two Files Per Domain

```
src/interfaces/[domain]/
  [domain].request.interface.ts    # Payloads sent TO the API
  [domain].response.interface.ts   # Data received FROM the API
```

```
src/interfaces/
  auth/
    auth.request.interface.ts
    auth.response.interface.ts
  product/
    product.request.interface.ts
    product.response.interface.ts
  organization/
    organization.request.interface.ts
    organization.response.interface.ts
  merchant/
    merchant.request.interface.ts
    merchant.response.interface.ts
  user/
    user.request.interface.ts
    user.response.interface.ts
  consent/
    consent.request.interface.ts
    consent.response.interface.ts
  category/
    category.response.interface.ts
  location/
    location.response.interface.ts
```

### Usage

Response interfaces type the API layer's generic:

```ts
customerAPI.post<ApiResponse<IAuthResponseCheckPhoneNumber>>("/v1/register/check-phone", payload);
```

Request interfaces type the function parameter:

```ts
export const checkPhoneNumber = async (payload: IAuthRequestCheckPhoneNumberPayload) => { ... };
```

---

## Common Types

### `ApiResponse<T>` — API Wrapper

All API responses are wrapped in this generic type:

```ts
// src/types/common.type.ts
export type ApiResponse<T> = {
  statusCode: string | number;
  message: string;
  data: T | null;
};
```

### `PaginationResponse` — Paginated Data

```ts
export type PaginationResponse = {
  page: number;
  pageLimit: number;
  totalItems: number;
  totalPages: number;
};
```

### Usage in API Layer

```ts
const response = await productAPI.get<
  ApiResponse<{
    items: IProductResponseMerchantProduct[];
    pagination: PaginationResponse;
  }>
>(`/v1/product/merchant/${merchantSlug}`, { params });
return response.data;
```

---

## Enums

### File Organization

Enums live in `src/constants/enum/[domain].enum.ts` — one file per domain.

```
src/constants/enum/
  organization.enum.ts
  user.enum.ts
  consent.enum.ts
  document.enum.ts
```

### Naming Convention

| Element     | Convention            | Example                         |
| ----------- | --------------------- | ------------------------------- |
| Enum name   | **PascalCase**        | `OrganizationType`              |
| Enum values | **SCREAMING_SNAKE**   | `REGISTERED_INDIVIDUAL`         |

```ts
// src/constants/enum/organization.enum.ts
export enum OrganizationType {
  PERSONAL = "PERSONAL",
  REGISTERED_INDIVIDUAL = "REGISTERED_INDIVIDUAL",
  JURISTIC = "JURISTIC",
}

export enum OrganizationKycStatus {
  NONE = "NONE",
  WAIT_FOR_APPROVE = "WAIT_FOR_APPROVE",
  REQUEST_MORE = "REQUEST_MORE",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
}

// src/constants/enum/user.enum.ts
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum UserRole {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}
```

### When to Use Enums vs Union Types

| Use Case | Approach |
| -------- | -------- |
| API contract values | `enum` — shared between request/response interfaces |
| Component prop options | Union type — `"small" \| "middle" \| "large"` |
| Backend-defined codes | `enum` — mirrors backend enum exactly |
| Local state variants | Union type — not worth a separate enum file |

```ts
// Enum — for API values
export enum OrganizationType {
  PERSONAL = "PERSONAL",
  JURISTIC = "JURISTIC",
}

// Union type — for component props
type Size = "small" | "middle" | "large";
type Variant = "primary" | "error" | "neutral";
```

---

## Form Field Types

Form field types are **plain interfaces** (no `I` prefix) and are **co-located** with their module — not in `src/interfaces/`.

```ts
// src/app/login/types.ts
interface LoginFormFields {
  phoneNumber: string;
  countryCode: string;
}

interface RegisterFormFields {
  phoneNumber: string;
  countryCode: string;
}

interface OtpFormFields {
  otp: string;
}

interface PasswordFormFields {
  password: string;
  confirmPassword: string;
}

interface ProfileFormFields {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
}
```

These types are used with `Form.useForm<T>()`:

```tsx
const [form] = Form.useForm<ProfileFormFields>();
```

---

## Mutation Payload Types

Mutation hooks can define **inline payload interfaces** in the hook file when the payload differs from the raw API interface:

```ts
// src/hooks/useAuthMutations.ts

// Inline payload types — specific to the hook's needs
export interface PhonePayload {
  phoneNumber: string;
  email?: string;
  countryCode: string;
}

export interface OtpPayload {
  otp: string;
  token: string;
  phoneNumber: string;
  countryCode: string;
}

export interface LoginOtpPayload {
  countryCode: string;
  phoneNumber: string;
  pin: string;
  token: string;
}
```

### When to Use Inline vs Shared Interfaces

| Scenario | Approach |
| -------- | -------- |
| Hook payload matches API interface exactly | Import from `interfaces/` |
| Hook payload simplifies or remaps API interface | Define inline in hook file |
| Compound payload (payload + extra context) | Define inline object type |

```ts
// Compound payload — inline type
export const useRegisterUserProfile = () => {
  return useMutation({
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

---

## Discriminated Unions

For complex reducer actions, use **discriminated unions** with a `type` property:

```ts
type AuthAction =
  | { type: "GO_TO_LOGIN" }
  | { type: "GO_TO_REGISTER" }
  | { type: "GO_TO_OTP"; payload: { flow: "login" | "register" } }
  | { type: "GO_TO_SET_PASSWORD" }
  | { type: "GO_TO_SET_PROFILE" }
  | { type: "GO_TO_SET_ORGANIZATION" }
  | { type: "GO_TO_BLOCKED" }
  | { type: "GO_TO_SUCCESS" }
  | { type: "SET_OTP_TOKEN"; payload: { token: string } }
  | { type: "SET_ACCESS_TOKEN"; payload: { accessToken: string } };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "GO_TO_OTP":
      return { ...state, step: "OTP", flow: action.payload.flow };
    case "SET_OTP_TOKEN":
      return { ...state, otpToken: action.payload.token };
    // ...
  }
};
```

---

## Type Safety Rules

### Avoid `any`

```ts
// ❌ Wrong
const handleError = (error: any) => { ... }
const formData: any = {};

// ✅ Correct — use unknown + type guards
const handleError = (error: unknown) => {
  if (isAxiosError(error)) {
    const statusCode = error.response?.status;
  }
};

// ✅ Correct — use proper types
const formData: ProfileFormFields = { firstName: "", lastName: "", email: "" };
```

### Type Guards

Use type guards for safe error handling and API responses:

```ts
import { AxiosError } from "axios";

// Type guard for Axios errors
const isAxiosError = (error: unknown): error is AxiosError<ApiResponse<null>> => {
  return error instanceof AxiosError;
};

// Usage
onError: (error: unknown) => {
  if (isAxiosError(error)) {
    showPopup("error", {
      statusCode: error.response?.status,
      title: error.response?.data?.message || "เกิดข้อผิดพลาด",
    });
  }
}
```

### Null Safety

Always handle nullable fields when accessing API data:

```ts
// API responses can be null
const { data } = useQuery({ ... });
const profile = data?.data;                    // ApiResponse.data can be null
const firstName = data?.data?.firstName ?? ""; // Default for nullable fields
```

### Generic Typing

Type all generic functions and components:

```ts
// API calls — type the response
customerAPI.post<ApiResponse<IAuthResponseCheckPhoneNumber>>("/v1/...", payload);

// Form instances — type the fields
const [form] = Form.useForm<ProfileFormFields>();

// Table columns — type the row data
const columns: ColumnsType<ProductRow> = [ ... ];

// Store — type the state
export const useUserStore = create<IStoreStateUser>()( ... );
```

---

## Constants

### Naming Convention

| Type | Convention | Example |
| ---- | ---------- | ------- |
| Top-level constant | **SCREAMING_SNAKE_CASE** | `INITIAL_AUTH_STATE`, `MAX_OTP_ATTEMPTS` |
| Option arrays | **camelCase** | `organizationBusinessTypeOptions` |
| Route functions | **camelCase** | `routes.merchantList()` |
| Config objects | **camelCase** | `defaultQueryOptions` |

```ts
// src/constants/organization.constants.ts
export const organizationBusinessTypeOptions = [
  { label: "บุคคลธรรมดา", value: OrganizationType.PERSONAL },
  { label: "บุคคลธรรมดาที่จดทะเบียนพาณิชย์", value: OrganizationType.REGISTERED_INDIVIDUAL },
  { label: "นิติบุคคล", value: OrganizationType.JURISTIC },
];

// Module-specific constants can be co-located
// src/app/login/constants.ts
export const INITIAL_AUTH_STATE: AuthState = {
  step: "LOGIN",
  flow: "login",
  otpToken: null,
  accessToken: null,
};
```

---

## Import Types

Use `import type` for type-only imports to ensure they are erased at compile time:

```ts
// ✅ Correct — type-only import
import type { ApiResponse } from "@/types/common.type";
import type { IAuthResponseCheckPhoneNumber } from "@/interfaces/auth/auth.response.interface";

// ❌ Avoid — imports type as value (may cause side effects in some bundlers)
import { ApiResponse } from "@/types/common.type";
```

**Exception**: When importing both values and types from the same module, use inline type:

```ts
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
```
