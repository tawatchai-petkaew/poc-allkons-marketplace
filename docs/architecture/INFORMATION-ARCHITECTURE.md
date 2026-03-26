# Information Architecture — Allkons Marketplace Ecosystem

> **Owner**: UX Designer (sole updater)
> **Purpose**: App-context level IA sitemap — the "god view" of all apps, modules, and screens in the ecosystem.
> **When to read**: Before starting any UX/UI work. This is the first document UX Designer reads.
> **When to update**: UX Designer updates via `/write-ux-overview` (new module) and `/write-ux-spec` (new screens per epic).

---

## Cross-App Overview

| App | Target Users | Navigation Pattern | Port | Status |
|-----|-------------|-------------------|------|--------|
| **buyer-platform** | Buyers / Consumers | Top navbar with search + category sidebar | 3000 | Production |
| **seller-platform** | Sellers / Merchants | Sidebar + top navbar with merchant context | 3001 | Production |
| **startup-partner-platform** | Startup Partners (SP Portal) | Sidebar + top navbar (SP Portal) | 3002 | PRD/BRD Approved — In Planning |
| **admin-platform** | Allkons Admin | Sidebar + top navbar (Admin Portal) | 3003 | Scaffolded — In Planning |

### Shared Infrastructure

- **Shared Types**: `packages/shared-types` — user, merchant, product type definitions
- **Shared Utils**: `packages/shared-utils` — utility functions
- **Backend Services**: api-customer (4000), api-order (4001), api-product (4002)
- **Auth Pattern**: Cookie-based (`auth-session`), 401 → redirect to /login

---

## buyer-platform

**Target Users**: Buyers and consumers browsing, purchasing, and managing orders
**Navigation**: Top navbar with search bar, category dropdown, cart counter, user/org switcher
**Layout**: Single-level — top navbar with full-width content area
**Design System**: Ant Design wrappers + Tailwind (hardcoded tokens)
**Component Registry**: `docs/architecture/registries/buyer-components.md`

### Module Map

| Module | Route Prefix | Screens | Status | MODULE-UX-OVERVIEW |
|--------|-------------|---------|--------|-------------------|
| Home & Browse | `/`, `/catalog`, `/category`, `/product`, `/search` | 7 | Production | — |
| Cart & Checkout | `/cart`, `/checkout` | 2 | Production | — |
| Orders | `/my-order` | 1 | Production | — |
| Organization Mgmt | `/organization` | 6+ | Production | — |
| Legal | `/privacy`, `/terms` | 2 | Production | — |
| O2O Checkout (Magic Link) | `/offers/{token}`, `/offers/{token}/checkout` | 4 | In Planning | `docs/modules/startup-partner-o2o/` |

### App-Level Navigation

```
┌─────────────────────────────────────────────────────────┐
│ [Logo] [Search Bar ──────────────] [Cart] [User/Org ▾]  │  ← Top Navbar
├─────────────────────────────────────────────────────────┤
│ [Categories ▾] [Flash Sales] [Best Sellers] [Catalog]   │  ← Category Bar
├─────────────────────────────────────────────────────────┤
│                                                         │
│                   Content Area                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Cross-Module Shared Patterns

- **User Auth Flow**: Login popup → OTP → Set Password → Set User Profile
- **Organization Context**: Global store with org switcher in navbar
- **Product Cards**: Shared `CardProduct` component across Home, Category, Search, Catalog

---

## seller-platform

**Target Users**: Sellers managing products, organizations, merchants, and orders
**Navigation**: Collapsible sidebar (80px collapsed / 290px expanded) + top navbar with merchant context switcher
**Layout**: Two-level — sidebar + top navbar, content area with background
**Auth**: Route group `(auth)/` with auth guard redirect
**Design System**: Ant Design wrappers + Tailwind (hardcoded tokens)
**Component Registry**: `docs/architecture/registries/seller-components.md`

### Module Map

| Module | Route Prefix | Screens | Status | MODULE-UX-OVERVIEW |
|--------|-------------|---------|--------|-------------------|
| Authentication | `/login` | 6 | Production | — |
| Organization Mgmt | `/(auth)/organizations` | 8+ | Production | — |
| Product Mgmt | `/(auth)/products` | 4 | Production | — |
| Merchant Mgmt | `/(auth)/merchant-list` | 1 | Production | — |
| User Profile | `/(auth)/user` | 1 | Production | — |
| Legal | `/privacy`, `/terms` | 2 | Production | — |
| SP Program Management | `/seller/sp-program` | 3 | In Planning | `docs/modules/startup-partner-o2o/` |
| SP RFQ Management | `/seller/rfqs` | 3 | In Planning | `docs/modules/startup-partner-o2o/` |
| SP Messaging | `/seller/messages` | 2 | In Planning | `docs/modules/startup-partner-o2o/` |

### App-Level Navigation

```
┌────────┬──────────────────────────────────────────────┐
│        │ [Org/Merchant Switcher]          [User ▾]    │  ← Top Navbar
│ S      ├──────────────────────────────────────────────┤
│ I      │                                              │
│ D      │                                              │
│ E      │              Content Area                    │
│ B      │                                              │
│ A      │                                              │
│ R      │                                              │
│        │                                              │
└────────┴──────────────────────────────────────────────┘

Sidebar Menu Items:
├── Stores
├── Business Insights
├── Orders
├── Products ← Active module
├── Services
├── Customer Management
├── Marketing
├── Content
├── Finance
├── Catalogs
├── Merchant Center
├── Categories
├── Marketplace
├── Merchant Theme
└── Applications
```

### Cross-Module Shared Patterns

- **Auth Guard**: `(auth)` route group with useAuth hook
- **Merchant Context**: `CurrentMerchantSlug` header sent with all API requests
- **Org Management**: Shared across org detail sub-pages (KYC, members, whitelist, roles)
- **Data Tables**: `CustomTable` wrapper with Thai localization

---

## startup-partner-platform

**Target Users**: Freelance Startup Partners (SPs), SP Leaders (Thammasorn internal reps), Allkons M Admin
**Navigation**: Sidebar navigation (SP Portal) + separate Admin sidebar
**Layout**: Sidebar + top navbar with SP context, similar to seller-platform pattern
**Auth**: SSO via OAuth 2.0 / Keycloak (Allkons ID); design-mocks are public (no auth)
**Design System**: Custom 3-layer token system (NO Ant Design for UI components), Storybook available
**Component Registry**: `docs/architecture/registries/startup-partner-components.md`
**PRD**: `docs/modules/startup-partner-o2o/startup-partner-o2o prd.md` (v1.5, Final)
**BRD**: `docs/modules/startup-partner-o2o/brd.md` (v1.3, Final)

### Module Map

| Module | Route Prefix | Screens | Status | MODULE-UX-OVERVIEW |
|--------|-------------|---------|--------|-------------------|
| SP Authentication & SSO | `/sp/login`, `/sp/callback` | 2 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |
| SP Registration & Onboarding | `/sp/register/*`, `/sp/application-status`, `/sp/profile` | 9 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |
| SP Training & Certification | `/sp/training/*` | 4 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |
| Product Discovery | `/sp/products/*` | 3 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |
| RFQ Management | `/sp/rfq/*` | 3 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |
| Quote Comparison (Offer Hub) | `/sp/rfq/:id/compare`, `/sp/quotes` | 3 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |
| SP-Seller Messaging | `/sp/rfq/:id/messages` | 1 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |
| Magic Links | `/sp/magic-links/*` | 2 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |
| Commission & Earnings | `/sp/commissions/*` | 5 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |
| SP Orders | `/sp/orders` | 1 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |
| Team Management (Leaders) | `/sp/team/*` | 4 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |
| Dispute Resolution | `/sp/disputes/*` | 3 | In Planning | [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) |

> **Total**: ~40 SP Portal screens (see [MODULE-UX-OVERVIEW](docs/modules/startup-partner-o2o/MODULE-UX-OVERVIEW.md) for complete 66-screen map across all 4 apps)

### App-Level Navigation

```
SP Portal:
┌────────┬──────────────────────────────────────────────┐
│        │ [SP Name / Status]                [User ▾]   │  ← Top Navbar
│ S      ├──────────────────────────────────────────────┤
│ I      │                                              │
│ D      │              Content Area                    │
│ E      │                                              │
│ B      │                                              │
│ A      │                                              │
│ R      │                                              │
└────────┴──────────────────────────────────────────────┘

SP Sidebar Menu Items:
├── Home / Dashboard
├── Products (Search & Discovery)
├── RFQs (Request for Quotation)
├── Messages
├── Magic Links
├── Orders
├── Commissions
├── Team (Leaders only)
├── Disputes
└── Profile & Settings

Admin Sidebar (separate):
├── SP Applications
├── SP Network
├── Commission Policies
├── Fee Monitoring
├── Payout Batches
├── Disputes
└── Audit Logs
```

> **Note**: Exact navigation to be finalized by UX Designer via `/write-ux-overview startup-partner-o2o`

### Cross-Module Shared Patterns

- **Design System**: 26 components in `src/design-system/components/`
- **Storybook**: Full component preview at `localhost:6006`
- **Token System**: primitives → alias → component (3-layer)
- **SSO**: OAuth 2.0 via Keycloak (Allkons ID) — shared with buyer/seller
- **SP Context**: SP profile, approval status, and service area scoped throughout portal
- **Commission Lifecycle**: Estimated → Awaiting Fee Collection → Confirmed → Paid (shared across SP & Admin views)

---

## admin-platform

**Target Users**: Allkons M Admin (Super Admin, Admin, Commission Manager, Payout Manager, Finance Admin)
**Navigation**: Sidebar navigation + top navbar with admin context
**Layout**: Sidebar + top navbar, content area
**Auth**: SSO via OAuth 2.0 / Keycloak (Allkons ID); role-based access control
**Design System**: Same as startup-partner-platform (Custom 3-layer token system, Storybook)
**Component Registry**: `docs/architecture/registries/admin-components.md`

### Module Map

| Module | Route Prefix | Screens | Status | MODULE-UX-OVERVIEW |
|--------|-------------|---------|--------|-------------------|
| SP Applications | `/admin/sp-partners/applications` | 3 | In Planning | `docs/modules/startup-partner-o2o/` |
| SP Network | `/admin/sp-partners` | 4 | In Planning | `docs/modules/startup-partner-o2o/` |
| Training Management | `/admin/training` | 3 | In Planning | `docs/modules/startup-partner-o2o/` |
| Commission Policies | `/admin/commissions/policies` | 4 | In Planning | `docs/modules/startup-partner-o2o/` |
| Fee Monitoring | `/admin/commissions/fee-monitoring` | 2 | In Planning | `docs/modules/startup-partner-o2o/` |
| Commission Monitoring | `/admin/commissions/monitoring` | 2 | In Planning | `docs/modules/startup-partner-o2o/` |
| Payout Batches | `/admin/commissions/payouts` | 3 | In Planning | `docs/modules/startup-partner-o2o/` |
| Exceptions & Adjustments | `/admin/commissions/exceptions` | 2 | In Planning | `docs/modules/startup-partner-o2o/` |
| Disputes | `/admin/disputes` | 3 | In Planning | `docs/modules/startup-partner-o2o/` |
| Audit Logs | `/admin/commissions/audit-logs` | 1 | In Planning | `docs/modules/startup-partner-o2o/` |
| User Management | `/admin/users` | 3 | In Planning | `docs/modules/startup-partner-o2o/` |
| Roles & Permissions | `/admin/roles` | 2 | In Planning | `docs/modules/startup-partner-o2o/` |

> **Total**: ~32 screens across 12 modules

### App-Level Navigation

```
┌────────┬──────────────────────────────────────────────┐
│        │ [Allkons Admin]                   [User ▾]   │  ← Top Navbar
│ S      ├──────────────────────────────────────────────┤
│ I      │                                              │
│ D      │              Content Area                    │
│ E      │                                              │
│ B      │                                              │
│ A      │                                              │
│ R      │                                              │
└────────┴──────────────────────────────────────────────┘

Sidebar Menu Items:
├── SP Applications
├── SP Network
├── Training Management
├── Commission Policies
├── Fee Monitoring
├── Commission Monitoring
├── Payout Batches
├── Exceptions & Adjustments
├── Disputes
├── Audit Logs
├── User Management
└── Roles & Permissions
```

### Cross-Module Shared Patterns

- **Design System**: Same as startup-partner-platform (26 components)
- **SSO**: OAuth 2.0 via Keycloak (Allkons ID)
- **Role-Based Access**: 5 admin roles with permission matrix (Viewer, Manager, Payout Manager, Finance Admin, Super Admin)
- **Audit Logging**: All admin actions logged with timestamp and actor
- **Data Tables**: Extensive use of CardTable and data filtering across all modules

---

## Cross-App Modules

### Startup Partner O2O (Cross-App)

The SP O2O module spans **all 3 apps** — this is the first cross-app module in the ecosystem.

```
┌─────────────────────┐     RFQ / Quotes     ┌─────────────────────┐
│ startup-partner-     │ ──────────────────→  │ seller-platform     │
│ platform             │ ←──────────────────  │ (Enhanced)          │
│                      │     Messaging        │                     │
│ SP Portal:           │                      │ New modules:        │
│ • Registration/KYC   │                      │ • SP Program Opt-in │
│ • Product Discovery  │                      │ • RFQ Management    │
│ • RFQ Creation       │                      │ • Quote Creation    │
│ • Quote Comparison   │                      │ • SP Messaging      │
│ • Magic Links        │                      │                     │
│ • Commissions        │                      └─────────────────────┘
│ • Team Management    │
│ • Disputes           │     Magic Link       ┌─────────────────────┐
│                      │ ──────────────────→  │ buyer-platform      │
│ Admin Portal:        │                      │ (Enhanced)          │
│ • SP Applications    │                      │                     │
│ • Commission Mgmt    │                      │ New module:         │
│ • Payout Batches     │                      │ • O2O Checkout      │
│ • Dispute Resolution │                      │   (Offer Hub)       │
└─────────────────────┘                      └─────────────────────┘
```

**Cross-App Flows**:
1. **SP → Seller (RFQ Flow)**: SP creates RFQ → Seller receives & creates quote → SP compares quotes
2. **SP → Buyer (Magic Link Flow)**: SP generates Magic Link → Buyer views Offer Hub → Buyer logs in → Buyer checks out per seller
3. **Seller → Buyer (Quote-to-CRM)**: Seller approves quote → Shadow Account auto-provisioned for Buyer
4. **Admin spans all**: Admin reviews SP applications, manages commissions, handles disputes across all parties

**Key Data Flows**:
- Commission lifecycle: Order (buyer↔seller) → Platform Fee (seller→Allkons) → Commission (Allkons→SP)
- 3-layer transaction model: Buyer↔Seller purchase, Seller↔Allkons fee, Allkons↔SP commission

---

## Cross-App Shared Patterns

### Authentication & SSO

All 3 apps share authentication via **Allkons ID**:
- **SSO**: OAuth 2.0 via Keycloak (single credential across all portals)
- Cookie-based auth (`auth-session`)
- Phone number + OTP verification (6-digit, 3-min expiry, max 5 attempts)
- Bearer token attached via Axios interceptor
- 401 → redirect to /login
- **Shadow Accounts**: Auto-provisioned for B2B buyers via Quote-to-CRM (buyer-platform)

### Business Entity Hierarchy

```
User (login session — Allkons ID)
  ├── StartupPartner (SP role)
  │    ├── type: Leader (Thammasorn internal) | Member (public freelance)
  │    ├── status: Pending | InfoRequested | Approved | Rejected | Suspended
  │    ├── serviceAreas: Region[] → Province[] → District[]
  │    └── hierarchy: Leader → Member[] (2-level)
  │
  └── Organization[] (Seller/Buyer role)
       ├── type: PERSONAL | REGISTERED_INDIVIDUAL | JURISTIC
       ├── role: Owner | Member | Admin | Super Admin
       └── Merchant[]
            └── Product[]
                 └── ProductVariant[]
```

### API Proxy Architecture

```
Browser → /api/{service}/... → Backend microservice
```
- `customerAPI` → api-customer (port 4000) — Auth, User, Organization, Merchant, SP, Consent, File Upload, Location
- `productAPI` → api-product (port 4002) — Product, Category, Search (Elasticsearch)
- `orderAPI` → api-order (port 4001) — Orders, RFQ, Quotes, Magic Links, Commissions

### Integration Dependencies (SP O2O)

- **Authentication Center**: SSO via OAuth 2.0, Keycloak
- **Allkons ID Module**: Identity management
- **Customer Management (B2B CRM)**: Quote-to-CRM, Shadow Account auto-provisioning
- **Elasticsearch**: Product search with Thai language support
- **AI Vendor (AI All in team)**: Product extraction from images
- **SMS Gateway**: OTP and notifications
- **Payment Gateway**: Multi-seller sequential payment processing
- **File Storage (CDN)**: KYC documents, message attachments
- **HEIC/PDF Conversion**: Document processing

---

## How to Update This Document

### When `/write-ux-overview` runs (new module):
1. Read this document first to understand where the new module sits
2. Add a new row to the relevant app's Module Map table
3. Set initial Screen count and Status
4. Link to the MODULE-UX-OVERVIEW.md

### When `/write-ux-spec` runs (new epic screens):
1. Update the Screen count in the Module Map
2. Update Status if changed

### Rules:
- Only UX Designer updates this document
- PO/BSA do NOT update IA — UX owns information architecture
- Keep Module Map rows sorted by route prefix
- Update Screen counts accurately
