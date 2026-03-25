# 02 — Component Rules & Patterns

> **Scope**: This file documents component patterns for the **seller-platform** (Ant Design + Tailwind). For other app contexts, see:
> - buyer-platform: `docs/architecture/registries/buyer-components.md`
> - startup-partner-platform: `docs/architecture/registries/startup-partner-components.md`
> - Context guide: `docs/architecture/APP-CONTEXT-GUIDE.md`

> Conventions for building, styling, and composing UI components in the Allkons Seller Platform.

---

## General Rules

### `"use client"` Directive

Every component that uses **any** of the following **must** start with `"use client"`:
- React hooks (`useState`, `useEffect`, `useCallback`, …)
- Event handlers (`onClick`, `onChange`, `onSubmit`, …)
- Browser APIs (`window`, `document`, `localStorage`, …)
- Ant Design interactive components (`Form`, `Table`, `Select`, `Modal`, …)

```tsx
"use client";

const MyComponent: React.FC<Props> = ({ ... }) => {
  // interactive logic
};

export default MyComponent;
```

> Server Components are the default in Next.js App Router. Only add `"use client"` when interactivity is genuinely required.

### Default Export

All components use **default export**. Named exports are reserved for hooks, types, and utilities.

```tsx
// ✅ Correct
const CustomButton: React.FC<CustomButtonProps> = (props) => { ... };
export default CustomButton;

// ❌ Wrong
export const CustomButton: React.FC<CustomButtonProps> = (props) => { ... };
```

### Props Interface

Define the props interface **inline** in the same component file — never in `src/interfaces/`.

```tsx
"use client";

interface CustomButtonProps {
  dataTestId?: string;
  name?: string;
  fullWidth?: boolean;
  variant?: "primary" | "error" | "neutral";
  size?: "small" | "middle" | "large";
}

const CustomButton: React.FC<CustomButtonProps> = ({ dataTestId, name, variant = "primary", size = "middle", ...rest }) => {
  // ...
};

export default CustomButton;
```

### `dataTestId` Prop

Every interactive component **must** accept an optional `dataTestId?: string` prop and apply it to the root or primary interactive element.

```tsx
interface TextFieldProps {
  dataTestId?: string;
  // ... other props
}
```

Use `useDataTestIdWithPath` from `@/utils/DataTestId` for auto-generated IDs. Override with the manual `dataTestId` prop when a specific test ID is documented.

---

## DataEntry Components (Form Fields)

All form field components in `src/components/DataEntry/` wrap an Ant Design primitive and follow a **strict consistent pattern**.

### Pattern Requirements

1. **Accept `dataTestId` prop** — apply via `useDataTestIdWithPath`
2. **Auto-wrap in `<Form.Item>`** when `name`, `label`, or `rules` props are provided
3. **Custom required asterisk** — set `required={false}` on `Form.Item`, render asterisk manually
4. **Reset margin** — always add `className="!mb-0"` on `Form.Item`
5. **No colon** — always set `colon={false}` on `Form.Item`
6. **Size classes** — map `small | middle | large` to fixed heights

### Size Mapping

| Size     | Height | Tailwind Class |
| -------- | ------ | -------------- |
| `small`  | 32px   | `h-[32px]`     |
| `middle` | 40px   | `h-[40px]`     |
| `large`  | 48px   | `h-[48px]`     |

### Template

```tsx
"use client";

import { Form, Input } from "antd";
import type { Rule } from "antd/es/form";
import useDataTestIdWithPath from "@/utils/DataTestId/data-test-id.utils";

interface TextFieldProps {
  dataTestId?: string;
  name?: string;
  label?: string;
  rules?: Rule[];
  isRequired?: boolean;
  size?: "small" | "middle" | "large";
  formItemProps?: Record<string, unknown>;
  // ... Ant Design Input props
}

const TextField: React.FC<TextFieldProps> = ({
  dataTestId,
  name,
  label,
  rules,
  isRequired = false,
  size = "middle",
  formItemProps,
  ...rest
}) => {
  const { testIdNode } = useDataTestIdWithPath({
    dataTestId,
    type: "text-field",
    name: name ?? "",
  });

  const sizeClass = {
    small: "h-[32px]",
    middle: "h-[40px]",
    large: "h-[48px]",
  }[size];

  const renderLabel = () => {
    if (label) {
      return (
        <span>
          {label}
          {isRequired && <span className="text-primary ml-1 text-xs">*</span>}
        </span>
      );
    }
    return undefined;
  };

  const inputNode = (
    <Input
      data-testid={testIdNode}
      className={sizeClass}
      {...rest}
    />
  );

  if (name || label || rules) {
    return (
      <Form.Item
        name={name}
        label={renderLabel()}
        rules={rules}
        required={false}
        colon={false}
        className="!mb-0"
        {...formItemProps}
      >
        {inputNode}
      </Form.Item>
    );
  }

  return inputNode;
};

export default TextField;
```

### Input Validation Types (TextField specific)

| Type               | Allowed Characters                          |
| ------------------ | ------------------------------------------- |
| `textOnly`         | Thai + English letters, spaces              |
| `numberOnly`       | Digits 0-9                                  |
| `textWithSymbols`  | Thai + English + digits + common symbols    |
| `tel`              | Digits, +, -, (, ), spaces                  |
| (default)          | No restriction                              |

Validation is enforced via `onKeyPress` and `onPaste` handlers.

---

## Forms

### Ant Design Form — The Only Form Library

Use **Ant Design `<Form>`** exclusively. Do **not** use `react-hook-form`, `formik`, or any other form library.

```tsx
const [form] = Form.useForm<ProfileFormFields>();

<Form
  form={form}
  onFinish={handleSubmit}
  layout="vertical"
>
  <TextField name="firstName" label="ชื่อ" rules={[{ required: true }]} />
  <SelectField name="gender" label="เพศ" options={genderOptions} />
</Form>
```

### Form Best Practices

| Rule | Detail |
| ---- | ------ |
| Type the form | `Form.useForm<T>()` — always provide a typed fields interface |
| Layout | Use `layout="vertical"` for most forms |
| Submit handler | Use `onFinish` callback (already validated) |
| Field errors from API | Use `form.setFields([{ name: "fieldName", errors: ["message"] }])` |
| Watch values | Use `Form.useWatch("fieldName", form)` for reactive dependencies |
| Reset | Use `form.resetFields()` or `form.setFieldsValue(initialValues)` |
| Multiple forms | Create separate `Form.useForm()` instances — name them clearly |

### Multi-Step Form Pattern

For complex flows like registration, use a **reducer-based state machine** (see `useLoginState.ts`):

```tsx
// Manage multiple form instances
const [loginForm] = Form.useForm<LoginFormFields>();
const [registerForm] = Form.useForm<RegisterFormFields>();
const [otpForm] = Form.useForm<OtpFormFields>();
const [passwordForm] = Form.useForm<PasswordFormFields>();
const [profileForm] = Form.useForm<ProfileFormFields>();
const [organizationForm] = Form.useForm<OrganizationFormFields>();

// Use reducer for step transitions
const [state, dispatch] = useReducer(authReducer, initialState);

// Render current step conditionally
{state.step === "SET_PROFILE" && <ProfileStep form={profileForm} />}
{state.step === "SET_ORGANIZATION" && <OrgStep form={organizationForm} />}
```

---

## Styling Approach

### Tailwind CSS — Primary Styling

Use Tailwind for all **layout, spacing, typography, and colors**.

```tsx
<div className="flex flex-col gap-4 p-6">
  <h2 className="text-xl font-semibold text-text-primary">Title</h2>
  <p className="text-sm text-text-secondary">Description</p>
</div>
```

### Custom Color Tokens

Always use the project's design tokens defined in `tailwind.config.ts` — never hardcode hex values.

| Token Category         | Examples                                                   |
| ---------------------- | ---------------------------------------------------------- |
| **Primary**            | `text-primary`, `bg-primary`, `border-primary`             |
| **Status**             | `text-error`, `text-success`, `text-warning`, `text-info`  |
| **Text**               | `text-text-primary`, `text-text-secondary`, `text-text-disabled` |
| **Background**         | `bg-background-primary`, `bg-background-secondary`         |
| **Border**             | `border-border-primary`, `border-neutral-300`              |
| **Button**             | `bg-button-primary`, `bg-button-secondary`                 |

```tsx
// ✅ Correct — use design tokens
<span className="text-error">Error message</span>
<div className="bg-background-secondary border border-border-primary rounded-lg p-4">

// ❌ Wrong — never hardcode colors
<span style={{ color: "#ff4d4f" }}>Error message</span>
<div className="bg-[#f5f5f5] border-[#d9d9d9]">
```

### Ant Design Overrides

Override Ant Design internal classes using Tailwind's `!important` prefix with **bracket notation** selectors:

```tsx
<Table
  className="
    [&_.ant-table-thead>tr>th]:!border-none
    [&_.ant-table-thead>tr>th]:!font-normal
    [&_.ant-table-thead>tr>th]:!bg-background-secondary
    [&_.ant-pagination-item-active]:!bg-primary
    [&_.ant-pagination-item-active]:!border-primary
    [&_.ant-pagination-item-active>a]:!text-white
  "
/>
```

**Rules**:
- Prefer bracket notation overrides on the component element over global CSS files
- Use co-located `.css` files for complex overrides that are hard to express in Tailwind
- Always use `!` prefix to ensure overrides win specificity

### When to Use Co-located CSS

Create a `custom.css` file alongside `index.tsx` when:
- The override involves complex selectors, pseudo-elements, or `:where()` / `:is()`
- The bracket notation becomes unreadable (> 5 overrides)
- Animation or transition definitions are needed

```css
/* components/Table/custom-table.css */
.custom-table .ant-table-thead > tr > th {
  border-bottom: none !important;
  background: var(--color-background-secondary) !important;
}
```

---

## Responsive Design

### Grid.useBreakpoint()

Use Ant Design's `Grid.useBreakpoint()` for responsive logic — not media queries in JavaScript or `window.innerWidth`.

```tsx
import { Grid } from "antd";

const MyComponent = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.sm; // < 576px

  return isMobile ? <MobileView /> : <DesktopView />;
};
```

### Modal vs Drawer Pattern (Popup)

The standard responsive pattern for dialogs:
- **Desktop** (≥ 576px): Use `<Modal>`
- **Mobile** (< 576px): Use `<Drawer>` anchored at bottom

This is implemented in the `Popup` component and should be reused via the `usePopup` hook.

```tsx
const { PopupComponent, showPopup } = usePopup();

showPopup("success", {
  title: "สำเร็จ",
  description: "บันทึกข้อมูลเรียบร้อย",
});

return <>{PopupComponent}</>;
```

---

## Icon Usage

### Remix Icon Only

Use **Remix Icon** for all UI icons. Never use Ant Design icons (`@ant-design/icons`) for general UI.

```tsx
// ✅ Correct — Remix Icon
<i className="ri-search-line text-xl text-icon-primary" />
<i className="ri-add-line text-lg" />
<i className="ri-delete-bin-line text-error" />

// ❌ Wrong — Ant Design icons
import { SearchOutlined } from "@ant-design/icons";
<SearchOutlined />
```

**Naming convention**: `ri-{name}-line` (outline) or `ri-{name}-fill` (filled).

---

## Typography

Use the `CustomTypography` component with the `variant` prop for all text rendering. Never use raw HTML heading/paragraph tags.

```tsx
import CustomTypography from "@/components/Typography";

<CustomTypography variant="h4">Section Title</CustomTypography>
<CustomTypography variant="paragraph1-regular">Body text goes here</CustomTypography>
<CustomTypography variant="label-medium">Form Label</CustomTypography>
```

### Available Variant Categories

| Category    | Variants                                                      |
| ----------- | ------------------------------------------------------------- |
| Display     | `display1` through `display6`                                 |
| Heading     | `h1` through `h6`                                             |
| Paragraph   | `paragraph{1-4}-{regular,medium,semibold,bold}`               |
| Label       | `label-{regular,medium,semibold,bold}`                         |
| Button      | `button-{large,medium,small}`                                  |
| Link        | `link-{large,medium,small}`                                    |
| Caption     | `caption-{regular,medium,semibold,bold}`                       |
| Overline    | `overline-{regular,medium,semibold,bold}`                      |

---

## Table Component

Use the `CustomTable` wrapper for all data tables. It provides:

- Thai-localized pagination ("จากทั้งหมด X รายการ")
- Custom empty state with Remix Icon
- Consistent styling with Ant Design overrides
- Default page sizes: `[10, 20, 50, 100]`

```tsx
import CustomTable from "@/components/Table";
import type { ColumnsType } from "antd/es/table";

const columns: ColumnsType<ProductRow> = [
  { title: "ชื่อสินค้า", dataIndex: "name", key: "name" },
  { title: "ราคา", dataIndex: "price", key: "price" },
  { title: "สถานะ", dataIndex: "status", key: "status" },
];

<CustomTable
  dataTestId="table--product-list"
  columns={columns}
  dataSource={products}
  pagination={{
    current: page,
    pageSize: pageSize,
    total: totalItems,
    onChange: handlePageChange,
  }}
/>
```

---

## BadgeLabel Component

Use `BadgeLabel` for status indicators with consistent styling:

```tsx
import BadgeLabel from "@/components/BadgeLabel";

<BadgeLabel
  label="กำลังขาย"
  color="success"
  variant="modern"
  size="medium"
/>
```

| Color      | Use Case                    |
| ---------- | --------------------------- |
| `success`  | Active, approved, selling   |
| `error`    | Rejected, failed            |
| `warning`  | Pending, awaiting review    |
| `info`     | Informational status        |
| `neutral`  | Default, inactive           |
| `primary`  | Highlighted/featured        |
| `lavender` | Special category            |
| `brand`    | Brand-related               |

---

## Popup & Confirm Modal

### usePopup — Status Feedback

For success/error/info/warning feedback after operations:

```tsx
const { PopupComponent, showPopup } = usePopup();

// After successful mutation
showPopup("success", {
  title: "สำเร็จ",
  description: "สร้างร้านค้าเรียบร้อยแล้ว",
  buttonText: "ตกลง",
  onButtonClick: () => router.push(routes.merchantList()),
});

// After API error  
showPopup("error", {
  statusCode: error?.response?.status,
  title: "เกิดข้อผิดพลาด",
  description: "กรุณาลองใหม่อีกครั้ง",
});
```

### useConfirmPopup — Confirmations & Warnings

For confirmations, warnings, and dialogs. Use `showConfirm()` with `type`: `"confirm"` | `"warn"` | `"info"`. Returns `{confirmPopup, showConfirm}`. Responsive (Modal on desktop, Drawer on mobile).

---

## Component Composition Rules

| Rule | Detail |
| ---- | ------ |
| Single responsibility | Each component does one thing well |
| Composition over prop drilling | Use children, render props, or context for deep data |
| No business logic in shared components | Keep `src/components/` generic — business logic lives in pages/hooks |
| Memoize expensive renders | Use `useCallback` for handler props, `useMemo` for computed values |
| Controlled components | Prefer controlled pattern with explicit `value`/`onChange` |
| Default props | Use destructuring defaults, not `defaultProps` |
