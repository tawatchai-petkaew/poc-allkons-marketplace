# Design System & Components: admin-platform

> **Owner**: UI Developer (maintain), UX Designer + UI Developer (read before working)
> **Purpose**: One-stop reference for admin-platform design system and components.
> **When to read**: Before `/write-ux-overview`, `/write-ux-spec`, or `/write-frontend-spec` for admin-platform modules.
> **Note**: This app shares the same design system as startup-partner-platform (copied, not symlinked). See `apps/admin-platform/src/design-system/`.

## 1. Design System Structure

### Folder Structure
- Design System Components: `apps/admin-platform/src/design-system/components/` (folder-per-component)
- Barrel Export: `apps/admin-platform/src/design-system/components/index.ts`
- Token Files: `apps/admin-platform/src/design-system/tokens/`
- Icons: `apps/admin-platform/src/design-system/components/icons/`

### Token Architecture
- **3-layer token system**: primitives.ts -> alias.ts -> tailwind.config.ts
- Layer 1 — **Primitives** (`tokens/primitives.ts`): Raw color scales (green-25..green-900, gray-25..gray-900, etc.)
- Layer 2 — **Aliases** (`tokens/alias.ts`): Semantic mappings (e.g., `color.bg.primary` -> `primitives.green-600`)
- Layer 3 — **Tailwind** (`tailwind.config.ts`): Consumes alias tokens via extend.colors, making them available as utility classes
- Token source files:
  - `apps/admin-platform/src/design-system/tokens/primitives.ts`
  - `apps/admin-platform/src/design-system/tokens/alias.ts`
  - `apps/admin-platform/tailwind.config.ts`

### Styling Approach
- UI Library: **No Ant Design for UI components** — only `ConfigProvider` used for global theme configuration
- CSS: Tailwind CSS with design tokens
- Variant Management: **CVA (class-variance-authority)** for all component variant definitions
- Icons: Custom icon components in `design-system/components/icons/`
- Typography: Custom Typography component with full scale (h1-h6, subtitle, body, caption, overline)

### Figma Source
- Design System: **Allkons DS1**

### Storybook
- Available: **Yes** — accessible at `localhost:6006`
- Stories located in: `apps/admin-platform/src/stories/`

## 2. Component Catalog

> **Import convention**: All design-system components are exported from the barrel file.
> Use `import { ComponentName } from '@/design-system/components'` for all components below.

### Buttons

#### Button
- **Import**: `import { Button } from '@/design-system/components'`
- **Purpose**: Primary action button with comprehensive variant system
- **Variants (12 total)**: primary, secondary-gray, secondary-color, tertiary-gray, tertiary-color, link-gray, link-color, destructive-primary, destructive-secondary, destructive-tertiary, destructive-link, disabled
- **Sizes**: sm (36px), md (40px), lg (44px)
- **Key Props**: variant, size, disabled, loading, leftIcon, rightIcon, onClick
- **Stories**: `src/stories/components/Button.stories.tsx`

### Badges

#### Badge
- **Import**: `import { Badge } from '@/design-system/components'`
- **Purpose**: Status indicators and labels
- **Types**: pill, badge
- **Styles**: ghost, outline, solid
- **Colors**: gray, brand, error, warning, success, blue, indigo (7 colors)
- **Key Props**: type, style, color, label, icon
- **Stories**: `src/stories/components/Badge.stories.tsx`

### Data Entry

#### TextField
- **Import**: `import { TextField } from '@/design-system/components'`
- **Purpose**: Text input with label, hint, validation, and icon support
- **Sizes**: sm (36px), md (40px), lg (44px)
- **Key Props**: label, placeholder, hint, error, required, disabled, leftIcon, rightIcon, size
- **Stories**: `src/stories/components/TextField.stories.tsx`

#### TextArea
- **Import**: `import { TextArea } from '@/design-system/components'`
- **Purpose**: Multi-line text input
- **Key Props**: label, placeholder, hint, error, required, disabled, rows

#### Checkbox
- **Import**: `import { Checkbox } from '@/design-system/components'`
- **Purpose**: Checkbox with label and description
- **Key Props**: label, description, checked, indeterminate, disabled, onChange
- **Stories**: `src/stories/components/Checkbox.stories.tsx`

#### Radio
- **Import**: `import { Radio } from '@/design-system/components'`
- **Purpose**: Radio button group
- **Key Props**: options, value, disabled, onChange
- **Stories**: `src/stories/components/Radio.stories.tsx`

#### Toggle
- **Import**: `import { Toggle } from '@/design-system/components'`
- **Purpose**: Toggle switch on/off
- **Key Props**: checked, disabled, label, onChange
- **Stories**: `src/stories/components/Toggle.stories.tsx`

#### Dropdown
- **Import**: `import { Dropdown } from '@/design-system/components'`
- **Purpose**: Dropdown select with search and multi-select support
- **Key Props**: options, value, placeholder, searchable, multiple, disabled, onChange
- **Stories**: `src/stories/components/Dropdown.stories.tsx`

#### FileUpload
- **Import**: `import { FileUpload } from '@/design-system/components'`
- **Purpose**: File upload with drag-and-drop support
- **Key Props**: accept, maxSize, multiple, onUpload, onRemove
- **Stories**: `src/stories/components/FileUpload.stories.tsx`

### Content & Display

#### Typography
- **Import**: `import { Typography } from '@/design-system/components'`
- **Purpose**: Full typographic scale for consistent text rendering
- **Variants**: h1, h2, h3, h4, h5, h6, subtitle-lg, subtitle-md, subtitle-sm, body-lg, body-md, body-sm, caption, overline
- **Key Props**: variant, weight, color, align, children
- **Stories**: `src/stories/components/Typography.stories.tsx` (part of design-system stories)

#### Avatar
- **Import**: `import { Avatar } from '@/design-system/components'`
- **Purpose**: User/entity avatar display
- **Sizes**: xs (24px), sm (32px), md (40px), lg (48px), xl (56px)
- **Types**: image, initials, icon
- **Key Props**: src, name, size, type, fallbackIcon
- **Stories**: `src/stories/components/Avatar.stories.tsx`

#### EmptyState
- **Import**: `import { EmptyState } from '@/design-system/components'`
- **Purpose**: Empty content state with illustration, title, and action
- **Key Props**: title, description, illustration, actionLabel, onAction
- **Stories**: `src/stories/components/EmptyState.stories.tsx`

#### Illustration
- **Import**: `import { Illustration } from '@/design-system/components'`
- **Purpose**: Decorative illustrations for empty states, onboarding, etc.
- **Key Props**: name, size
- **Stories**: `src/stories/components/Illustration.stories.tsx`

#### AllkonsLogo
- **Import**: `import { AllkonsLogo } from '@/design-system/components'`
- **Purpose**: Allkons brand logo mark and logotype
- **Key Props**: variant (mark/full), size
- **Stories**: `src/stories/components/Logo.stories.tsx`

#### IconWithRing
- **Import**: `import { IconWithRing } from '@/design-system/components'`
- **Purpose**: Icon wrapped in a colored ring for feature highlights
- **Key Props**: icon, color, size
- **Stories**: `src/stories/components/IconWithRing.stories.tsx`

#### ProgressBar
- **Import**: `import { ProgressBar } from '@/design-system/components'`
- **Purpose**: Linear progress indicator
- **Key Props**: value, max, color, label, showPercentage
- **Stories**: `src/stories/components/ProgressBar.stories.tsx`

#### ProgressSteps
- **Import**: `import { ProgressSteps } from '@/design-system/components'`
- **Purpose**: Multi-step progress indicator for wizards/workflows
- **Key Props**: steps, currentStep, orientation
- **Stories**: `src/stories/components/ProgressSteps.stories.tsx`

### Navigation

#### Tabs
- **Import**: `import { Tabs } from '@/design-system/components'`
- **Purpose**: Tab navigation for content sections
- **Styles**: default, underline
- **Key Props**: items, activeKey, style, onChange
- **Stories**: `src/stories/components/Tabs.stories.tsx`

#### Breadcrumbs
- **Import**: `import { Breadcrumbs } from '@/design-system/components'`
- **Purpose**: Breadcrumb navigation for page hierarchy
- **Key Props**: items (label + href), separator
- **Stories**: `src/stories/components/Breadcrumbs.stories.tsx`

#### Pagination
- **Import**: `import { Pagination } from '@/design-system/components'`
- **Purpose**: Page navigation for paginated data
- **Key Props**: current, total, pageSize, onChange
- **Stories**: `src/stories/components/Pagination.stories.tsx`

### Layout & Containers

#### PageHeader
- **Import**: `import { PageHeader } from '@/design-system/components'`
- **Purpose**: Page-level header with title, breadcrumbs, and actions
- **Key Props**: title, subtitle, breadcrumbs, actions
- **Stories**: `src/stories/components/PageHeader.stories.tsx`

#### CardHeader
- **Import**: `import { CardHeader } from '@/design-system/components'`
- **Purpose**: Card section header with title, subtitle, and action slot
- **Key Props**: title, subtitle, action
- **Stories**: `src/stories/components/CardHeader.stories.tsx`

#### CardTable
- **Import**: `import { CardTable } from '@/design-system/components'`
- **Purpose**: Table wrapped in a card container with header, filters, and pagination
- **Key Props**: columns, data, cardHeader, pagination, onRowClick
- **Stories**: `src/stories/components/CardTable.stories.tsx`

#### SelectionCard
- **Import**: `import { SelectionCard } from '@/design-system/components'`
- **Purpose**: Selectable card for option choices (e.g., plan selection, type selection)
- **Key Props**: title, description, icon, selected, disabled, onClick
- **Stories**: `src/stories/components/SelectionCard.stories.tsx`

### Feedback & Overlays

#### Dialog
- **Import**: `import { Dialog } from '@/design-system/components'`
- **Purpose**: Modal dialog for focused interactions
- **Sizes**: sm (400px), md (560px), lg (720px)
- **Key Props**: open, onClose, title, size, children, footer
- **Stories**: `src/stories/components/Dialog.stories.tsx`

#### ConfirmationDialog
- **Import**: `import { ConfirmationDialog } from '@/design-system/components'`
- **Purpose**: Pre-built confirmation dialog with confirm/cancel actions
- **Key Props**: open, onConfirm, onCancel, title, message, confirmLabel, variant (danger/warning/info)

#### Alert
- **Import**: `import { Alert } from '@/design-system/components'`
- **Purpose**: Inline alert messages and full-width banners
- **Types**: alert (inline), banner (full-width)
- **Severities**: error, warning, success, info
- **Key Props**: type, severity, title, message, closable, onClose
- **Stories**: `src/stories/components/Alert.stories.tsx`

### Icon Components

#### Dot
- **Import**: `import { Dot } from '@/design-system/components/icons'`
- **Purpose**: Small colored dot indicator

#### FeatureIcon
- **Import**: `import { FeatureIcon } from '@/design-system/components/icons'`
- **Purpose**: Feature highlight icon with background styling

#### PaymentIcon
- **Import**: `import { PaymentIcon } from '@/design-system/components/icons'`
- **Purpose**: Payment method icons (credit card brands, e-wallets, etc.)
- **Stories**: `src/stories/components/Icons.stories.tsx`

#### CountryIcon
- **Import**: `import { CountryIcon } from '@/design-system/components/icons'`
- **Purpose**: Country flag icons
- **Stories**: `src/stories/components/Icons.stories.tsx`

#### Bank
- **Import**: `import { Bank } from '@/design-system/components/icons'`
- **Purpose**: Bank logo icons
- **Stories**: `src/stories/components/Icons.stories.tsx`

#### SocialIcon
- **Import**: `import { SocialIcon } from '@/design-system/components/icons'`
- **Purpose**: Social media platform icons
- **Stories**: `src/stories/components/Icons.stories.tsx`

#### FileTypeIcon
- **Import**: `import { FileTypeIcon } from '@/design-system/components/icons'`
- **Purpose**: File type icons (PDF, DOC, XLS, etc.)
- **Stories**: `src/stories/components/Icons.stories.tsx`

## 3. Decision Rules

### When to Reuse
- ALWAYS check this catalog first before creating a new component
- If a component already exists, use it — extend with new props if needed
- ALWAYS import from the barrel export (`@/design-system/components`) for design-system components
- Use CVA pattern for any new variant definitions — follow existing component patterns
- Prefer existing icon components (PaymentIcon, CountryIcon, Bank, SocialIcon, FileTypeIcon) over raw SVGs

### When to Create New
- No existing component serves the same purpose
- New component must follow the 3-layer token architecture (primitives -> alias -> Tailwind)
- Must use CVA for variant management
- Must include a Storybook story in `src/stories/components/`
- Must be exported from the barrel file (`design-system/components/index.ts`)
- Must be documented in this catalog immediately after creation

### Token Usage Rules
- NEVER hardcode color values — always use Tailwind classes that map to alias tokens
- When adding new colors, add to all 3 layers: primitives.ts -> alias.ts -> tailwind.config.ts
- Semantic naming required: use `bg-primary`, `text-secondary`, etc. — not raw color names

## 4. Update Responsibility Matrix

| Event | Who Updates | Skill | Section to Update |
|-------|-----------|-------|-------------------|
| New mock component created | **UI Developer** | `/write-frontend-spec` | Section 2: Add entry |
| New production component | **Developer** | `/implement-feature` | Section 2: Update import path |
| Token/theme changes | **UI Developer** | manual | Section 1: Token Architecture |
| New variant for existing component | **UI Developer** | `/write-frontend-spec` | Section 2: Update entry |
| New Storybook story added | **UI Developer** | manual | Section 2: Add stories path |
| Figma design system updated | **UX Designer** | manual | Section 1: Figma Source |
| Component deprecated | **Developer / Tech Lead** | manual | Section 2: Mark deprecated |
| New icon type added | **UI Developer** | `/write-frontend-spec` | Section 2: Icon Components |
