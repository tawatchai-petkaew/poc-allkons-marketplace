# 06 — Testing, Quality & Error Handling

> Data test IDs, error handling patterns, XSS protection, performance, and code quality rules.

---

## Data Test IDs

### Convention — BEM-Like Structure

All test IDs follow the pattern:

```
<type>--<module>-<detail>
```

| Part       | Description                    | Example           |
| ---------- | ------------------------------ | ----------------- |
| `<type>`   | Element type prefix            | `btn`, `input`    |
| `<module>` | Module or page scope           | `login`, `register` |
| `<detail>` | Specific action or identifier  | `submit`, `phone` |

**Full example**: `btn--register-submit` → Button, in register module, for submit action.

### Allowed Type Prefixes

| Prefix     | Used For                     |
| ---------- | ---------------------------- |
| `page`     | Page root container          |
| `modal`    | Modal / dialog               |
| `section`  | Major section within a page  |
| `form`     | Form container               |
| `btn`      | Button                       |
| `input`    | Text input field             |
| `select`   | Dropdown                     |
| `checkbox` | Checkbox                     |
| `radio`    | Radio button                 |
| `table`    | Table                        |
| `row`      | Table row                    |
| `cell`     | Table cell                   |
| `toast`    | Notification/toast           |
| `alert`    | Error / warning message      |
| `txt`      | Static text / label          |
| `img`      | Image                        |
| `title`    | Heading / title              |
| `link`     | Link                         |
| `tab`      | Tab                          |
| `group`    | Group container              |
| `badge`    | Badge / tag                  |
| `bar`      | Progress bar                 |
| `rule`     | Validation rule indicator    |
| `card`     | Card element                 |
| `screen`   | Full screen / result screen  |
| `help`     | Help text                    |

### Auto-Generated vs Manual IDs

The project provides `useDataTestIdWithPath()` from `@/utils/DataTestId/data-test-id.utils` that auto-generates IDs in the format `{path}-{type}-{name}`.

**When to use manual IDs** (preferred for documented flows):

```tsx
// Manual — always preferred when a specific test ID is documented
<TextField dataTestId="input--login-phone" name="phoneNumber" />
<TextField dataTestId="input--register-phone" name="phoneNumber" />
<CustomButton dataTestId="btn--login-submit">เข้าสู่ระบบ</CustomButton>
```

**When auto-generated is acceptable**:

```tsx
// Auto-generated — fine for non-critical, non-ambiguous elements
<TextField name="search" />
// → produces: products-manage-products-text-field-search
```

**Override rule**: Always prefer manual `dataTestId` when:
- A specific test ID is documented in `ai_docs/test_id.md`
- The same `name` prop appears in multiple contexts (e.g., `phoneNumber` in login AND register)
- QA has specified the ID in their test plan

### Reference

See `ai_docs/test_id.md` for the complete list of documented test IDs organized by auth flow step.

---

## Error Handling

### Error Flow Architecture

```
API Error (4xx / 5xx)
  │
  ├── 401 Unauthorized
  │     └── Axios interceptor (automatic)
  │           → Clear auth cookies
  │           → Clear Zustand store
  │           → Redirect to /login
  │
  ├── 422 Validation Error
  │     └── Mutation onError callback
  │           → form.setFields([{ name: "field", errors: ["message"] }])
  │
  ├── Other API Errors (400, 403, 404, 500...)
  │     └── Mutation onError callback
  │           → showPopup("error", { statusCode, title, description })
  │
  └── Network Error
        └── Axios interceptor or mutation retry
              → Default retry: 1 attempt (configured in QueryClient)
```

### Standard Mutation Error Handler

```tsx
import { AxiosError } from "axios";
import type { ApiResponse } from "@/types/common.type";

const { mutate } = useMutation({
  mutationFn: (payload) => createProduct(payload),
  onSuccess: (response) => {
    showPopup("success", {
      title: "สำเร็จ",
      description: "สร้างสินค้าเรียบร้อยแล้ว",
    });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
  onError: (error) => {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    showPopup("error", {
      statusCode: axiosError?.response?.status,
      title: axiosError?.response?.data?.message || "เกิดข้อผิดพลาด",
      description: "กรุณาลองใหม่อีกครั้ง",
    });
  },
});
```

### Form Validation Errors from API

When the API returns field-level validation errors, map them to form fields:

```tsx
onError: (error) => {
  const axiosError = error as AxiosError<ApiResponse<null>>;
  if (axiosError?.response?.status === 422) {
    form.setFields([
      { name: "phoneNumber", errors: ["หมายเลขโทรศัพท์นี้ถูกใช้งานแล้ว"] },
    ]);
    return; // Don't show popup for field-level errors
  }
  // Show popup for other errors
  showPopup("error", { ... });
}
```

### Error Type Guard

Use a type guard for safe error property access:

```ts
import { AxiosError } from "axios";

const isAxiosError = (error: unknown): error is AxiosError<ApiResponse<null>> => {
  return error instanceof AxiosError;
};

// Usage
const handleError = (error: unknown) => {
  if (isAxiosError(error)) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.message;
    // Safe access to typed error properties
  }
};
```

### Rules

| Rule | Detail |
| ---- | ------ |
| Never catch 401 manually | The Axios interceptor handles it globally |
| Always show user feedback | Every mutation error should trigger a popup or form error |
| Use Thai messages | All user-facing error text in Thai |
| Don't swallow errors | Log unexpected errors, show generic message to user |
| Retry policy | Default is 1 retry. Set `retry: false` for sensitive operations (OTP, payments) |
| No `console.log` in production | Remove or guard all console statements |

---

## XSS Protection

### DOMPurify

All user-generated HTML **must** be sanitized before rendering:

```ts
import { sanitize } from "@/libs/dom-purify";

// Before rendering any HTML from API or user input
const cleanHtml = sanitize(rawHtmlString);
<div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
```

### Rules

| Rule | Detail |
| ---- | ------ |
| Never use `dangerouslySetInnerHTML` without sanitization | Always pass through `sanitize()` first |
| Sanitize API-provided HTML | Even "trusted" API content should be sanitized |
| Prefer text content | Use `textContent` or React text rendering over HTML injection when possible |

---

## Performance

### Memoization

```tsx
// useCallback for handler functions passed as props
const handleSubmit = useCallback((values: FormFields) => {
  mutate(values);
}, [mutate]);

// useMemo for expensive computations
const filteredProducts = useMemo(() => {
  return products.filter(p => p.status === activeFilter);
}, [products, activeFilter]);

// React.memo for list item components
const ProductRow = React.memo<ProductRowProps>(({ product, onEdit }) => {
  return <div>...</div>;
});
```

> Note: With React Compiler enabled (`reactCompiler: true`), many memoizations are auto-applied. Still use explicit `useCallback`/`useMemo` for **clarity and documentation** of intent.

### Lazy Loading

```tsx
import dynamic from "next/dynamic";

// Lazy load heavy components
const HeavyChart = dynamic(() => import("@/components/Chart"), {
  loading: () => <Skeleton />,
  ssr: false, // Disable SSR for client-only components
});
```

### Query Performance

| Pattern | Benefit |
| ------- | ------- |
| `enabled: !!dependency` | Prevent unnecessary fetches |
| `staleTime: 60_000` | Avoid refetching fresh data |
| `select` in useQuery | Transform data without extra renders |
| Query key with dependencies | Auto-refetch when context changes |
| `placeholderData: keepPreviousData` | Smooth pagination transitions |

### Image Optimization

```tsx
import Image from "next/image";

// Always use next/image for optimized loading
<Image
  src="/home/banner.png"
  alt="Banner"
  width={1200}
  height={400}
  priority // For above-the-fold images
/>
```

---

## Code Quality Rules

### ESLint

The project uses ESLint flat config with `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`. All code must pass linting without errors.

### General Rules

| Rule | Detail |
| ---- | ------ |
| No `any` type | Use `unknown` with type guards, or proper types |
| No `console.log` | Remove before committing; use proper error handling |
| No commented-out code | Remove dead code; use git history for reference |
| No hardcoded strings for routes | Use `routes.*()` from routing constants |
| No hardcoded colors | Use Tailwind tokens from `tailwind.config.ts` |
| No relative imports crossing folder boundaries | Use `@/*` alias |
| No inline styles | Use Tailwind classes or co-located CSS |
| No external form libraries | Use Ant Design Form exclusively |
| No Ant Design icons for UI | Use Remix Icon (`ri-*-line`, `ri-*-fill`) |

### File Hygiene

| Rule | Detail |
| ---- | ------ |
| Remove unused imports | ESLint catches these — fix them |
| Remove unused variables | Prefix with `_` if intentionally unused (e.g., `_event`) |
| Keep files focused | One component per file, one store per file |
| Max file size guideline | If a component exceeds ~300 lines, consider splitting into sub-components |
| Sort imports | Follow the import order convention (see `01-project-structure.md`) |

### Naming Hygiene

| Element | Convention | Example |
| ------- | ---------- | ------- |
| Boolean props/variables | `is*`, `has*`, `should*`, `can*` | `isLoading`, `hasError`, `isRequired` |
| Event handlers | `handle*` (internal), `on*` (prop) | `handleSubmit`, `onClick` |
| API functions | Verb-first | `getProducts`, `createOrganization`, `deleteProduct` |
| Query keys | Noun-first | `["userProfile"]`, `["products", slug]` |
| Mutation keys | Verb-first (camelCase) | `["createProduct"]`, `["verifyOtp"]` |

---

## Accessibility & Localization

### Thai Language

All user-facing text **must** be in Thai:
- Form labels, placeholders, validation messages
- Button text, dialog titles, descriptions
- Table headers, empty states, pagination text
- Error messages, success messages, confirmations

```tsx
// ✅ Correct — Thai text
<TextField label="ชื่อจริง" placeholder="กรอกชื่อจริง" />
<CustomButton>บันทึก</CustomButton>

// ❌ Wrong — English in UI
<TextField label="First Name" placeholder="Enter first name" />
<CustomButton>Save</CustomButton>
```

### Font

The primary fonts are **Kanit** and **Noto Sans Thai Looped** — configured in `tailwind.config.ts` and loaded via `next/font`. Do not add additional font imports.

### Date & Number Formatting

```ts
import dayjs from "dayjs";

// Thai date formatting
dayjs(date).format("DD/MM/BBBB");  // Buddhist Era
dayjs(date).format("DD MMM YYYY"); // Standard

// Currency formatting
const formatBaht = (amount: number) =>
  new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
  }).format(amount);
```
