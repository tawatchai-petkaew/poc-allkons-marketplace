# Design System & Components: seller-platform

> **Owner**: UI Developer (maintain), UX Designer + UI Developer (read before working)
> **Purpose**: One-stop reference for seller-platform design system and components.
> **When to read**: Before `/write-ux-overview`, `/write-ux-spec`, or `/write-frontend-spec` for seller-platform modules.

## 1. Design System Structure

### Folder Structure
- Components: `apps/seller-platform/src/components/` (folder-per-component)
- No dedicated design-system folder — uses Ant Design wrappers + Tailwind

### Token Architecture
- **No formal token layer** — colors hardcoded in `tailwind.config.ts`
- Primary Green: defined in Tailwind config extend.colors
- Token source files: `apps/seller-platform/tailwind.config.ts`

### Styling Approach
- UI Library: Ant Design with custom wrappers
- CSS: Tailwind CSS
- Icons: Remix Icon (ri-* classes)
- Typography: Custom Typography component wrapping Ant Design

### Figma Source
- Not formally linked

### Storybook
- Available: No

## 2. Component Catalog

### Navigation & Layout

#### Sidebar
- **Import**: `import Sidebar from '@/components/Sidebar'`
- **Purpose**: Dashboard side navigation with collapsible menu items
- **States**: Expanded/Collapsed

#### Navbar
- **Import**: `import Navbar from '@/components/Navbar'`
- **Purpose**: Top navigation bar for dashboard with user menu and notifications

### Buttons

#### Button
- **Import**: `import Button from '@/components/Button'`
- **Purpose**: Primary action button
- **Key Props**: variant, color, size, disabled, loading, onClick

#### BackButton
- **Import**: `import BackButton from '@/components/BackButton'`
- **Purpose**: Navigation back button for page headers

### Content & Display

#### CustomTable
- **Import**: `import CustomTable from '@/components/Table'`
- **Purpose**: Data table with pagination, sorting, and row actions

#### Typography
- **Import**: `import Typography from '@/components/Typography'`
- **Purpose**: Text elements with consistent styling variants

#### BadgeLabel
- **Import**: `import BadgeLabel from '@/components/BadgeLabel'`
- **Purpose**: Status badge/label for order states, verification status, etc.

#### EmptyState
- **Import**: `import EmptyState from '@/components/EmptyState'`
- **Purpose**: Empty content state display with icon and message

#### SectionIcon
- **Import**: `import SectionIcon from '@/components/Section/SectionIcon'`
- **Purpose**: Icon display for section headers and feature highlights

### Data Entry

#### TextField
- **Import**: `import TextField from '@/components/DataEntry/TextField'`
- **Purpose**: Text input with label, validation, and error display
- **Key Props**: label, placeholder, error, required, disabled

#### Checkbox
- **Import**: `import Checkbox from '@/components/DataEntry/Checkbox'`
- **Purpose**: Checkbox with label

#### RadioGroup
- **Import**: `import RadioGroup from '@/components/DataEntry/RadioGroup'`
- **Purpose**: Radio option group

#### Select
- **Import**: `import Select from '@/components/DataEntry/Select'`
- **Purpose**: Dropdown select

#### DatePicker
- **Import**: `import DatePicker from '@/components/DataEntry/DatePicker'`
- **Purpose**: Date selection

#### ToggleSwitch
- **Import**: `import ToggleSwitch from '@/components/DataEntry/ToggleSwitch'`
- **Purpose**: Toggle on/off

#### FileDragger
- **Import**: `import FileDragger from '@/components/DataEntry/Upload/FileDragger'`
- **Purpose**: Drag-and-drop file upload

### Cards

#### Card
- **Import**: `import Card from '@/components/Card'`
- **Purpose**: Generic card container for dashboard content

#### SelectionCard
- **Import**: `import SelectionCard from '@/components/Card/Selection'`
- **Purpose**: Selectable card for options (e.g., business type selection)

### Forms

#### RegisteredIndividualForm
- **Import**: `import RegisteredIndividualForm from '@/components/Form/RegisteredIndividual'`
- **Purpose**: Individual seller registration form

#### JuristicForm
- **Import**: `import JuristicForm from '@/components/Form/Juristic'`
- **Purpose**: Juristic/company seller registration form

### Popups & Modals

#### Popup (base)
- **Import**: `import Popup from '@/components/Popup'`
- **Purpose**: Generic modal wrapper

#### ConfirmPopup
- **Import**: `import ConfirmPopup from '@/components/Popup/ConfirmPopup'`
- **Purpose**: Confirmation dialog with accept/cancel actions

#### ConsentPopup
- **Import**: `import ConsentPopup from '@/components/Popup/Consent'`
- **Purpose**: Terms/consent modal for seller agreements

### Utilities

#### Image
- **Import**: `import Image from '@/components/Image'`
- **Purpose**: Optimized image component with fallback handling

#### ActionTooltip
- **Import**: `import ActionTooltip from '@/components/ActionTooltip'`
- **Purpose**: Tooltip with action buttons for table row actions

#### TextWithTooltip
- **Import**: `import TextWithTooltip from '@/components/TextWithTooltip'`
- **Purpose**: Truncated text with full content shown on hover tooltip

#### LoadingOverlay
- **Import**: `import LoadingOverlay from '@/components/LoadingOverlay'`
- **Purpose**: Full-page or section loading spinner overlay

## 3. Decision Rules

### When to Reuse
- ALWAYS check this catalog first before creating a new component
- If a component already exists, use it — extend with new props if needed
- Prefer existing Card variants for new dashboard content displays
- Use CustomTable for all tabular data — do not create ad-hoc table markup

### When to Create New
- No existing component serves the same purpose
- Must be documented in this catalog immediately after creation

## 4. Update Responsibility Matrix

| Event | Who Updates | Skill | Section to Update |
|-------|-----------|-------|-------------------|
| New mock component created | **UI Developer** | `/write-frontend-spec` | Section 2: Add entry |
| New production component | **Developer** | `/implement-feature` | Section 2: Update import path |
| Token/theme changes | **UI Developer** | manual | Section 1: Token Architecture |
| New variant for existing component | **UI Developer** | `/write-frontend-spec` | Section 2: Update entry |
| Component deprecated | **Developer / Tech Lead** | manual | Section 2: Mark deprecated |
