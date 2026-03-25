# Design System & Components: buyer-platform

> **Owner**: UI Developer (maintain), UX Designer + UI Developer (read before working)
> **Purpose**: One-stop reference for buyer-platform design system and components.
> **When to read**: Before `/write-ux-overview`, `/write-ux-spec`, or `/write-frontend-spec` for buyer-platform modules.

## 1. Design System Structure

### Folder Structure
- Components: `apps/buyer-platform/src/components/` (folder-per-component)
- No dedicated design-system folder — uses Ant Design wrappers + Tailwind

### Token Architecture
- **No formal token layer** — colors hardcoded in `tailwind.config.js`
- Primary Green: defined in Tailwind config extend.colors
- Token source files: `apps/buyer-platform/tailwind.config.js`

### Styling Approach
- UI Library: Ant Design v5.25.1 with custom wrappers
- CSS: Tailwind CSS v3.4.17
- Icons: Remix Icon v4.6.0 (ri-* classes)
- Typography: Custom Typography component wrapping Ant Design

### Figma Source
- Not formally linked

### Storybook
- Available: No

## 2. Component Catalog

### Navigation & Layout

#### Navbar
- **Import**: `import Navbar from '@/components/Navbar'`
- **Purpose**: Main top navigation with search, cart, user menu, org switcher
- **Sub-components**: CategoryDropdown, MenuList, MobileCategoryMenu, MobileUserAuthMenu
- **States**: Authenticated/Guest, Mobile/Desktop

#### Footer
- **Import**: `import Footer from '@/components/Footer'`
- **Purpose**: Page footer with links and company info

### Buttons

#### Button
- **Import**: `import Button from '@/components/Button'`
- **Purpose**: Primary action button
- **Variants**: outlined, dashed, solid, ghost, link
- **Colors**: primary, error, neutral
- **Sizes**: small (32px), middle (40px), large (48px)
- **Key Props**: variant, color, size, disabled, loading, onClick

#### TabButton
- **Import**: `import TabButton from '@/components/Button/TabButton'`
- **Purpose**: Tab navigation button

#### ProductVariantButton
- **Import**: `import ProductVariantButton from '@/components/Button/ProductVariant'`
- **Purpose**: Product variant selector button

### Cards

#### CardProduct
- **Import**: `import CardProduct from '@/components/Card/Product'`
- **Purpose**: Product display card with image, price, discount
- **Key Props**: product (IProduct)

#### CardCategory
- **Import**: `import CardCategory from '@/components/Card/Category'`
- **Purpose**: Category display card

#### CardCatalog
- **Import**: `import CardCatalog from '@/components/Card/Catalog'`
- **Purpose**: Catalog item card

#### CardPromotion
- **Import**: `import CardPromotion from '@/components/Card/Promotion'`
- **Purpose**: Promotion/banner card

#### CardBlog
- **Import**: `import CardBlog from '@/components/Card/Blog'`
- **Purpose**: Article/blog card

#### CardStore
- **Import**: `import CardStore from '@/components/Card/Store'`
- **Purpose**: Seller/store card

#### CardRadio
- **Import**: `import CardRadio from '@/components/Card/Radio'`
- **Purpose**: Radio option as card

#### SelectionCard (Address)
- **Import**: `import AddressSelectionCard from '@/components/Card/Selection/Address'`
- **Purpose**: Address selection card

#### SelectionCard (Transaction)
- **Import**: `import TransactionSelectionCard from '@/components/Card/Selection/Transaction'`
- **Purpose**: Payment method card

### Data Entry

#### TextField
- **Import**: `import TextField from '@/components/DataEntry/TextField'`
- **Purpose**: Text input with validation
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

### Content & Display

#### CustomTable
- **Import**: `import CustomTable from '@/components/Table/CustomTable'`
- **Purpose**: Data table with pagination and sorting

#### Typography
- **Import**: `import Typography from '@/components/Typography'`
- **Purpose**: Text elements with variants

#### HighlightText
- **Import**: `import HighlightText from '@/components/Typography/HighlightText'`
- **Purpose**: Highlighted text snippet (search results)

#### Carousel
- **Import**: `import Carousel from '@/components/Carousel'`
- **Purpose**: Image/product carousel with arrows

#### EmptyState
- **Import**: `import EmptyState from '@/components/EmptyState'`
- **Purpose**: Empty content state display

#### CountdownTimer
- **Import**: `import CountdownTimer from '@/components/CountdownTimer'`
- **Purpose**: Time remaining display (flash sales)

#### Label / Badge
- **Import**: `import Label from '@/components/Label'`
- **Purpose**: Status label/badge
- **Sub-components**: LabelGroup, LabelStatus

### Popups & Modals

#### Popup (base)
- **Import**: `import Popup from '@/components/Popup'`
- **Purpose**: Generic modal wrapper

#### NewLoginPopup
- **Import**: `import NewLoginPopup from '@/components/Popup/NewLogin'`
- **Purpose**: Multi-step login workflow

#### LocationPopup
- **Import**: `import LocationPopup from '@/components/Popup/Location'`
- **Purpose**: Location selection

#### ConsentPopup
- **Import**: `import ConsentPopup from '@/components/Popup/Consent'`
- **Purpose**: Terms/consent modal

### Forms

#### LoginForm
- **Import**: `import LoginForm from '@/components/Form/Login'`
- **Purpose**: Email/password login

#### RegisterForm
- **Import**: `import RegisterForm from '@/components/Form/Register'`
- **Purpose**: User registration

#### OtpForm
- **Import**: `import OtpForm from '@/components/Form/Otp'`
- **Purpose**: OTP verification

#### AddressForm
- **Import**: `import AddressForm from '@/components/Form/Address'`
- **Purpose**: Shipping address form

### Home Page Sections

#### BannerSection
- **Import**: `import BannerSection from '@/components/HomeSections/BannerSection'`

#### CategorySection
- **Import**: `import CategorySection from '@/components/HomeSections/CategorySection'`

#### FlashSalesSection
- **Import**: `import FlashSalesSection from '@/components/HomeSections/FlashSalesSection'`

#### BestSellerSection
- **Import**: `import BestSellerSection from '@/components/HomeSections/BestSellerSection'`

#### CatalogSection
- **Import**: `import CatalogSection from '@/components/HomeSections/CatalogSection'`

### Drawers

#### ProductVariantDrawer
- **Import**: `import ProductVariantDrawer from '@/components/Drawer/ProductVariant'`
- **Purpose**: Product variant selection drawer

#### SelectAddressDrawer
- **Import**: `import SelectAddressDrawer from '@/components/Drawer/SelectAddress'`
- **Purpose**: Address selection drawer

### Utilities

#### AntdProvider
- **Import**: `import AntdProvider from '@/components/AntdProvider'`
- **Purpose**: Ant Design theme provider

#### RouteGuard
- **Import**: `import RouteGuard from '@/components/RouteGuard'`
- **Purpose**: Auth route protection

#### GoogleMap
- **Import**: `import GoogleMap from '@/components/Map/GoogleMap'`
- **Purpose**: Google Maps integration

## 3. Decision Rules

### When to Reuse
- ALWAYS check this catalog first before creating a new component
- If a component already exists, use it — extend with new props if needed
- Prefer existing Card variants for new product/content displays

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
