# 01 — Project Structure & File Organization

> Allkons Seller Platform — Product management for users, organizations, and merchants.

---

## Tech Stack

| Area             | Technology                  | Version |
| ---------------- | --------------------------- | ------- |
| Framework        | Next.js (App Router)        | 16.x    |
| React            | React                       | 19.x    |
| UI Library       | Ant Design                  | ^5.25   |
| Styling          | Tailwind CSS                | ^3.4    |
| State Management | Zustand (persisted)         | ^5.0    |
| Server State     | TanStack React Query        | ^5.90   |
| HTTP Client      | Axios                       | ^1.13   |
| Icons            | Remix Icon                  | ^4.8    |
| Language         | TypeScript (strict)         | ^5      |
| Package Manager  | pnpm (workspace)            | —       |
| React Compiler   | babel-plugin-react-compiler | 1.0.0   |

---

## Folder Layout

```
src/
  api/               # API call functions — one file per domain
  app/               # Next.js App Router pages & layouts
    (auth)/           # Protected routes (require session)
    design-mocks/     # Mock UI routes — public, mirrors production paths (not docs structure)
      _shared/        # Shared mock components & data (underscore = no route)
    login/            # Public login/register flow
    api/              # Next.js API proxy routes
  components/         # Reusable UI components (folder-per-component)
    DataEntry/        # Form field wrappers (TextField, Select, Checkbox…)
    Form/             # Complex form components (Organization forms…)
  constants/          # Shared constants & option arrays
    enum/             # TypeScript enums — one file per domain
  hooks/              # Custom hooks & global contexts (queries, mutations, UI utilities)
  interfaces/         # Request / response TypeScript interfaces
  libs/               # Utility libraries (axios instances, auth, DOMPurify)
  store/              # Zustand stores — one file per domain
  types/              # Shared TypeScript types (ApiResponse, common)
  utils/              # Helper utilities (format, DataTestId…)
```

---

## Path Alias

All imports **must** use the `@/*` alias which maps to `./src/*`.

```ts
// ✅ Correct
import CustomButton from '@/components/Button';
import { routes } from '@/constants/routing.constants';
import { useUserStore } from '@/store/user.store';

// ❌ Wrong — never use relative paths to reach outside the current folder
import CustomButton from '../../components/Button';
```

**Exception**: Relative imports are acceptable **within the same component folder** (e.g., importing a co-located `.css` file or sub-component).

---

## File Naming Conventions

| Category             | Convention                                | Example                                                     |
| -------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| Component folder     | **PascalCase**                            | `Button/`, `DataEntry/TextField/`                           |
| Component entry file | `index.tsx`                               | `Button/index.tsx`                                          |
| Hook file (.ts)      | **camelCase** with `use` prefix (no JSX)  | `useAuthMutations.ts`, `useDebounce.ts`                     |
| Hook file (.tsx)     | **camelCase** with `use` prefix (has JSX) | `useAuth.tsx`, `useNotification.tsx`, `useConfirmPopup.tsx` |
| Context file         | **PascalCase** `Context.tsx`              | `ProductSelectionContext.tsx`, `AddProductsContext.tsx`     |
| API file             | **kebab-case** `.api.ts`                  | `product.api.ts`, `file-upload.api.ts`                      |
| Interface file       | **kebab-case** `.interface.ts`            | `auth.request.interface.ts`                                 |
| Constant file        | **kebab-case** `.constants.ts`            | `routing.constants.ts`                                      |
| Enum file            | **kebab-case** `.enum.ts`                 | `organization.enum.ts`                                      |
| Store file           | **kebab-case** `.store.ts`                | `user.store.ts`                                             |
| Type file            | **kebab-case** `.type.ts`                 | `common.type.ts`                                            |
| CSS override file    | **kebab-case** `.css`                     | `custom-table.css`, `typography.css`                        |
| Page file            | `page.tsx`                                | `src/app/(auth)/products/page.tsx`                          |
| Layout file          | `layout.tsx`                              | `src/app/(auth)/layout.tsx`                                 |

---

## Folder-Per-Component Pattern

Every reusable component lives in `src/components/` as a folder with `index.tsx` as the entry point. Co-locate custom CSS when Ant Design overrides are needed.

```
src/components/
  Button/
    index.tsx               # Component code + props interface
  Table/
    index.tsx
    custom-table.css         # Ant Design table overrides
  Typography/
    index.tsx
    typography.css
  DataEntry/
    TextField/
      index.tsx
      custom.css
    Select/
      index.tsx
      custom.css
  Popup/
    index.tsx
    custom.css
    Consent/                # Sub-component folder
      index.tsx
```

**Rules**:

- One component per folder
- Props interface defined **inline** in the same `index.tsx` — not in a separate interface file
- Default export always
- Sub-components live in nested folders under the parent

---

## Domain Mapping

Each business domain gets a consistent set of files across layers:

| Domain         | API File              | Interfaces Folder          | Hooks                      | Service Instance |
| -------------- | --------------------- | -------------------------- | -------------------------- | ---------------- |
| Authentication | `auth.api.ts`         | `interfaces/auth/`         | `useAuthMutations.ts`      | `customerAPI`    |
| User           | `user.api.ts`         | `interfaces/user/`         | —                          | `customerAPI`    |
| Organization   | `organization.api.ts` | `interfaces/organization/` | —                          | `customerAPI`    |
| Merchant       | `merchant.api.ts`     | `interfaces/merchant/`     | —                          | `customerAPI`    |
| Product        | `product.api.ts`      | `interfaces/product/`      | —                          | `productAPI`     |
| Consent        | `consent.api.ts`      | `interfaces/consent/`      | (in `useAuthMutations.ts`) | `customerAPI`    |
| Category       | `category.api.ts`     | `interfaces/category/`     | —                          | `productAPI`     |
| File Upload    | `file-upload.api.ts`  | —                          | —                          | `customerAPI`    |
| Location       | `location.api.ts`     | `interfaces/location/`     | —                          | `customerAPI`    |

---

## Business Entity Hierarchy

```
User (login session)
  └── Organization[]
       ├── type: PERSONAL | REGISTERED_INDIVIDUAL | JURISTIC
       ├── role: Owner | Member | Admin | Super Admin
       └── Merchant[]
            └── Product[]
                 └── ProductVariant[]
```

**Active context flow**: User logs in → selects an Organization → selects a Merchant under it → all product/order operations are scoped to that merchant via `CurrentMerchantSlug` header.

---

## Co-Location Rules

| Content Type               | Location                                                    |
| -------------------------- | ----------------------------------------------------------- |
| Shared constants           | `src/constants/`                                            |
| Module-specific constants  | Co-located with module (e.g., `src/app/login/constants.ts`) |
| Shared enums               | `src/constants/enum/`                                       |
| Shared types               | `src/types/`                                                |
| Component props interfaces | Inline in the component file                                |
| API request/response types | `src/interfaces/[domain]/`                                  |

---

## Context Organization

**Global contexts** (used everywhere) → `/hooks/useContextName.tsx` (Context + Provider + Hook in one file, named exports)

**Module-specific contexts** (used in one module) → `/app/[module]/context/ContextName.tsx` (colocated with module)

---

## Adding a New Module — Checklist

1. **Define routes** — Add to `src/constants/routing.constants.ts`
2. **Create interfaces** — Add `src/interfaces/[domain]/[domain].request.interface.ts` and `[domain].response.interface.ts`
3. **Create API functions** — Add `src/api/[domain].api.ts`, type responses with `ApiResponse<IResponseType>`
4. **Create mutation hooks** — Add `src/hooks/use[Domain]Mutations.ts`, export individual `use[Action]()` hooks
5. **Create page** — Add under `src/app/(auth)/[module]/page.tsx` (protected) or `src/app/[module]/page.tsx` (public)
6. **Create components** — Reusable pieces to `src/components/`, module-specific pieces co-located with the page
7. **Add constants/enums** — Add to `src/constants/` or `src/constants/enum/`
8. **Add test IDs** — Follow `<type>--<module>-<detail>` convention, pass via `dataTestId` prop

---

## Import Order Convention

Organize imports in this order, separated by blank lines:

```ts
// 1. React / Next.js
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Button } from 'antd';

// 3. Internal — API / hooks / store
import { getProducts } from '@/api/product.api';
import { useUserStore } from '@/store/user.store';
import { useAuth } from '@/hooks/useAuth';

// 4. Internal — components
import CustomButton from '@/components/Button';
import TextField from '@/components/DataEntry/TextField';

// 5. Internal — types / interfaces / constants / utils
import type { ApiResponse } from '@/types/common.type';
import { routes } from '@/constants/routing.constants';
import { OrganizationType } from '@/constants/enum/organization.enum';
```

---

## AI Handoff & Developer Instructions

Module development passes through strict checkpoints before coding begins. The AI must act as specific roles depending on the user's instructions.

### Documentation Knowledge Base

All AI configurations, skills, roles, and rules are stored in:

- **`docs/ai/rules/`** — Strict coding conventions. **READ ALL FILES IN THIS FOLDER BEFORE CODING.**
- **`docs/ai/skills/`** — Skill commands (e.g., `write-prd`, `implement-feature`). Execute sequentially.
- **`docs/ai/roles/`** — Persona guidelines for Product Owner, BA, Designer, Developer, and Tester.
- **`docs/ai/workflows/WORKFLOW-HANDOFF.md`** — The strict approval pipeline.
- **`docs/modules/[module-name]/`** — Module spec files (PRD → BRD → Epic → Tech Spec → Design → Dev → Test).

**Before implementing any code:** Always scan `docs/ai/rules/` and the relevant `docs/modules/[module-name]/` folder to establish full context.
