# UX Overview: Startup Partner O2O

> **Owner**: UX Designer
> **Purpose**: Module-level UX overview connecting all 15 epics — screen map, navigation, shared layout, cross-epic flow.
> **When to read**: Before `/write-ux-spec` (mandatory), before `/write-frontend-spec`.
> **When to update**: UX Designer updates via `/write-ux-spec` (add screen details), UI Developer updates via `/write-frontend-spec` (shared components).

**Date:** 2026-03-26
**Status:** ⚪ Draft
**App Context:** Cross-App (startup-partner-platform + admin-platform + seller-platform + buyer-platform)
**Component Registry:** `docs/architecture/registries/startup-partner-components.md` (SP Portal), `docs/architecture/registries/admin-components.md` (Admin Portal)

## Change Log

| Version | Date | Changes | Updated By | Status |
|---------|------|---------|------------|--------|
| v1.0 | 2026-03-26 | Initial module UX overview — 15 epics, ~54 screens, 4 app contexts | UX Designer | ⚪ Draft |

---

## 1. Module Position

### App Context

This module is **cross-app** — it spans 4 platforms:

| Platform | Role | Epics |
|----------|------|-------|
| **startup-partner-platform** (port 3002) | SP Portal — primary app for SPs | EPIC-01, 02, 05, 06, 07, 08, 09, 11 (SP), 12, 13, 14 |
| **admin-platform** (port 3003) | Admin Portal — management & operations | EPIC-03, 11 (Admin), 13 (Admin), 14 (Admin), 15 |
| **seller-platform** (port 3001) | Enhanced — SP program opt-in, RFQ response, messaging | EPIC-04, 08 (Seller side) |
| **buyer-platform** (port 3000) | Enhanced — O2O checkout via Magic Link | EPIC-10 |

### Position in App Navigation

**SP Portal (startup-partner-platform)**:
- Primary sidebar navigation
- All SP-facing features accessible after login + certification

**Admin Portal (admin-platform)**:
- Dedicated admin sidebar
- SP management, commission, disputes, user management

**Seller Portal (seller-platform)**:
- New "SP Program" sidebar menu item under existing navigation
- RFQ inbox and messaging integrated

**Buyer Portal (buyer-platform)**:
- Magic Link entry point (`/offers/{token}`) — no navigation change, accessed via external link

### Entry Points

| Entry Point | How User Arrives | Platform |
|-------------|-----------------|----------|
| SP Registration | Direct URL, marketing campaign, referral | startup-partner-platform |
| SP Login | Direct URL, bookmark | startup-partner-platform |
| Admin Dashboard | Internal staff login | admin-platform |
| Seller SP Program | Seller Portal sidebar | seller-platform |
| Buyer Offer Hub | Magic Link shared via LINE/WhatsApp/SMS | buyer-platform |

### Relationship to Other Modules

- **Authentication Module**: SSO via Allkons ID / Keycloak (shared across all apps)
- **Customer Management (B2B CRM)**: Shadow Account auto-provisioning for buyers
- **Product Management**: Product catalog for SP product discovery
- **Order Management (Mac 5)**: Order data feeds commission calculation
- **Fee Management**: Calculates Platform Fee and SP Commission
- **EBPP**: Collects Platform Fee from sellers, triggers commission confirmation

---

## 2. Module-Level User Journey

### SP Happy Path (Primary Flow)

```
[Register]        [Training]         [Product Discovery]      [RFQ]              [Quotes]           [Magic Link]        [Commission]
    │                  │                     │                   │                    │                    │                   │
    ▼                  ▼                     ▼                   ▼                    ▼                    ▼                   ▼
 Register ──→ Complete ──→ Search     ──→ Create   ──→ Compare    ──→ Generate  ──→ Track
 with KYC     Training     Products       RFQ with      Quotes        Magic         Commission
    │          & Cert       by keyword    products      side-by-      Link &         Earnings
    ▼             │          & AI          & stores      side          Share          & Request
 Wait for        ▼                            │              │         with           Payout
 Approval    Certified                        ▼              ▼         Buyer              │
    │         (Live                      Stores          Select                          ▼
    ▼         Selling                    submit          best                        Receive
 Approved     Enabled)                   quotes          combination                 Payment
    │                                                                     │
    └──────────────────────────────────────────────────────────────────────┘
                              Repeat for each buyer request

EPIC-01  EPIC-02  EPIC-14      EPIC-05       EPIC-06    EPIC-07      EPIC-09      EPIC-11
  SSO   Register  Training     Products       RFQ       Quotes      Magic Link   Commission
```

### Seller Flow

```
Opt-In ──→ Receive RFQs ──→ Create Quote ──→ Negotiate via Messaging ──→ Fulfill Order
EPIC-04       EPIC-06          EPIC-06              EPIC-08                  (Order Mgmt)
```

### Buyer Flow (via Magic Link)

```
Receive    ──→  View Offer  ──→  Login      ──→  Checkout    ──→  Track Order
Magic Link      Hub (Guest)      (Shadow Acct     per Seller
(LINE/SMS)      No Auth          or Existing)     (Decoupled)
                EPIC-09          EPIC-10           EPIC-10        (Order Mgmt)
```

### Admin Flow

```
Review SP    ──→  Monitor      ──→  Manage         ──→  Process      ──→  Handle
Applications      Training          Commission          Payout           Disputes
                  Progress          Policies             Batches
EPIC-03          EPIC-14           EPIC-11              EPIC-11          EPIC-13
                                   EPIC-15 (Users/Roles)
```

### Decision Points

| Decision | Options | Impact |
|----------|---------|--------|
| SP Application | Approve / Reject / Request Info | Gates all SP features |
| Training Certification | Pass / Fail / Retrain | Gates live selling |
| RFQ Product Source | Manual Search / AI Image / AI Text / Hybrid | Product list composition |
| RFQ Visibility | Private (selected stores) / Public (all opted-in stores) | Quote pool size |
| Quote Selection | Single store / Multi-store combination | Magic Link content |
| Buyer Payment | Payment Gateway / Direct Transfer / Store Credit | KYC requirement |
| Commission Confirmation | Fee Collected / Fee Pending | Payout eligibility |

---

## 3. Screen Map (All Epics)

### SP Portal Screens (startup-partner-platform)

| Screen | Epic | Route | User Story | Status | Dependencies |
|--------|------|-------|-----------|--------|-------------|
| SSO Login | EPIC-01 | `/sp/login` | US-01 | Planned | — |
| SSO Callback | EPIC-01 | `/sp/callback` | US-01 | Planned | — |
| Registration Step 1 (Phone) | EPIC-02 | `/sp/register` | US-03 | Planned | — |
| Registration Step 2 (OTP) | EPIC-02 | `/sp/register/otp` | US-03 | Planned | — |
| Registration Step 3 (Personal Info) | EPIC-02 | `/sp/register/personal` | US-03 | Planned | — |
| Registration Step 4 (KYC Upload) | EPIC-02 | `/sp/register/kyc` | US-03 | Planned | — |
| Registration Step 5 (Service Areas) | EPIC-02 | `/sp/register/service-areas` | US-03 | Planned | — |
| Registration Step 6 (Target Shops) | EPIC-02 | `/sp/register/target-shops` | US-03 | Planned | — |
| Registration Step 7 (Consent) | EPIC-02 | `/sp/register/consent` | US-03 | Planned | — |
| Application Status | EPIC-02 | `/sp/application-status` | US-04 | Planned | Registration |
| SP Profile | EPIC-02 | `/sp/profile` | US-04 | Planned | Registration |
| Training Dashboard | EPIC-14 | `/sp/training` | US-20A | Planned | Approval |
| Training Module Content | EPIC-14 | `/sp/training/:moduleId` | US-20A | Planned | — |
| Workflow Simulation | EPIC-14 | `/sp/training/simulation` | US-20B | Planned | Modules complete |
| Compliance Acknowledgment | EPIC-14 | `/sp/training/compliance` | US-20C | Planned | Simulation complete |
| Product Search | EPIC-05 | `/sp/products` | US-09 | Planned | Certification |
| Product Detail | EPIC-05 | `/sp/products/:productId` | US-09 | Planned | — |
| Favorite Stores | EPIC-05 | `/sp/products/favorites` | US-09A | Planned | — |
| RFQ List | EPIC-06 | `/sp/rfq` | US-10 | Planned | Certification |
| RFQ Creation Wizard | EPIC-06 | `/sp/rfq/create` | US-10 | Planned | Products |
| RFQ Detail / Tracking | EPIC-06 | `/sp/rfq/:rfqId` | US-10 | Planned | — |
| Quote Comparison (Offer Hub) | EPIC-07 | `/sp/rfq/:rfqId/compare` | US-11 | Planned | RFQ + Quotes |
| Quote Detail | EPIC-07 | `/sp/rfq/:rfqId/quote/:quoteId` | US-11A | Planned | — |
| Quote Dashboard | EPIC-07 | `/sp/quotes` | US-11B | Planned | — |
| RFQ Messages | EPIC-08 | `/sp/rfq/:rfqId/messages` | US-12 | Planned | RFQ |
| Magic Link Management | EPIC-09 | `/sp/magic-links` | US-13 | Planned | Quotes selected |
| Magic Link Create | EPIC-09 | `/sp/magic-links/create` | US-13 | Planned | — |
| Commission Dashboard | EPIC-11 | `/sp/commissions` | US-17B | Planned | Orders |
| Commission Transactions | EPIC-11 | `/sp/commissions/transactions` | US-17C | Planned | — |
| Payout Request | EPIC-11 | `/sp/commissions/payout` | US-17D | Planned | — |
| Payout History | EPIC-11 | `/sp/commissions/payouts` | US-17E | Planned | — |
| Commission Adjustments | EPIC-11 | `/sp/commissions/adjustments` | US-17F | Planned | — |
| Orders List | EPIC-11 | `/sp/orders` | US-17I | Planned | — |
| Team Dashboard (Leader) | EPIC-12 | `/sp/team` | US-19 | Planned | Leader role |
| Team Members | EPIC-12 | `/sp/team/members` | US-19 | Planned | — |
| Team Member Detail | EPIC-12 | `/sp/team/members/:memberId` | US-19 | Planned | — |
| Team Transactions | EPIC-12 | `/sp/team/transactions` | US-19A | Planned | — |
| Dispute List | EPIC-13 | `/sp/disputes` | US-20 | Planned | — |
| Dispute Create | EPIC-13 | `/sp/disputes/create` | US-20 | Planned | — |
| Dispute Detail | EPIC-13 | `/sp/disputes/:disputeId` | US-20 | Planned | — |

### Admin Portal Screens (admin-platform)

| Screen | Epic | Route | User Story | Status | Dependencies |
|--------|------|-------|-----------|--------|-------------|
| SP Application List | EPIC-03 | `/admin/sp-partners/applications` | US-05 | Planned | — |
| SP Application Detail | EPIC-03 | `/admin/sp-partners/applications/:id` | US-05, US-06A | Planned | — |
| SP Network Directory | EPIC-03 | `/admin/sp-partners` | US-06 | Planned | — |
| SP Detail (Individual) | EPIC-03 | `/admin/sp-partners/:spId` | US-06B | Planned | — |
| SP Training Progress | EPIC-14 | `/admin/sp-partners/:spId/training` | US-20D | Planned | — |
| Commission Policies | EPIC-11 | `/admin/commissions/policies` | US-17J | Planned | — |
| Create Commission Policy | EPIC-11 | `/admin/commissions/policies/create` | US-17J | Planned | — |
| Category Commission Rules | EPIC-11 | `/admin/commissions/policies/category` | US-17K | Planned | — |
| Seller Commission Rules | EPIC-11 | `/admin/commissions/policies/seller` | US-17L | Planned | — |
| Fee Monitoring | EPIC-11 | `/admin/commissions/fee-monitoring` | US-17M | Planned | — |
| Commission Monitoring | EPIC-11 | `/admin/commissions/monitoring` | US-17M | Planned | — |
| Payout Batch List | EPIC-11 | `/admin/commissions/payouts` | US-17N | Planned | — |
| Create Payout Batch | EPIC-11 | `/admin/commissions/payouts/create` | US-17N | Planned | — |
| Payout Batch Detail | EPIC-11 | `/admin/commissions/payouts/:batchId` | US-17N | Planned | — |
| Exception Queue | EPIC-11 | `/admin/commissions/exceptions` | US-17O | Planned | — |
| Audit Logs | EPIC-11 | `/admin/commissions/audit-logs` | US-17P | Planned | — |
| Dispute List (Admin) | EPIC-13 | `/admin/disputes` | US-20 | Planned | — |
| Dispute Detail (Admin) | EPIC-13 | `/admin/disputes/:disputeId` | US-20 | Planned | — |
| User List | EPIC-15 | `/admin/users` | US-21 | Planned | — |
| User Detail / Edit | EPIC-15 | `/admin/users/:userId` | US-21 | Planned | — |
| Role List | EPIC-15 | `/admin/roles` | US-22 | Planned | — |
| Role Detail / Permissions | EPIC-15 | `/admin/roles/:roleId` | US-22 | Planned | — |

### Seller Portal Screens (seller-platform)

| Screen | Epic | Route | User Story | Status | Dependencies |
|--------|------|-------|-----------|--------|-------------|
| SP Program Settings | EPIC-04 | `/seller/sp-program` | US-08 | Planned | — |
| RFQ Messages (Seller) | EPIC-08 | `/seller/rfq/:rfqId/messages` | US-12 | Planned | RFQ received |

### Buyer Portal Screens (buyer-platform)

| Screen | Epic | Route | User Story | Status | Dependencies |
|--------|------|-------|-----------|--------|-------------|
| Offer Hub (Guest) | EPIC-09/10 | `/offers/{token}` | US-13A, US-14 | Planned | Magic Link |
| Buyer Login | EPIC-10 | `/offers/{token}/login` | US-14A | Planned | — |
| Multi-Seller Checkout | EPIC-10 | `/offers/{token}/checkout` | US-14A | Planned | Login |
| Order Confirmation | EPIC-10 | `/offers/{token}/orders` | US-14A | Planned | Checkout |

> **Total**: ~66 screens across 4 platforms

---

## 4. Navigation Pattern

### SP Portal Navigation

```
┌────────────────────┬────────────────────────────────────────┐
│                    │ [SP Name] [Status Badge]    [User ▾]   │
│  ┌──────────────┐  ├────────────────────────────────────────┤
│  │ 🏠 Home      │  │                                        │
│  │ 📦 Products  │  │                                        │
│  │ 📋 RFQs      │  │          Content Area                  │
│  │ 💬 Messages  │  │                                        │
│  │ 🔗 Magic Links│  │                                        │
│  │ 📦 Orders    │  │                                        │
│  │ 💰 Commissions│  │                                        │
│  │ 👥 Team *    │  │                                        │
│  │ ⚠️ Disputes  │  │                                        │
│  │ 📚 Training  │  │                                        │
│  │ ⚙️ Settings  │  │                                        │
│  └──────────────┘  │                                        │
└────────────────────┴────────────────────────────────────────┘
* Team menu visible to Leaders only
```

### Admin Portal Navigation

```
┌────────────────────┬────────────────────────────────────────┐
│                    │ [Allkons Admin]              [User ▾]  │
│  ┌──────────────┐  ├────────────────────────────────────────┤
│  │ SP Management │  │                                        │
│  │  ├ Applications│  │                                        │
│  │  ├ SP Network │  │          Content Area                  │
│  │  └ Training   │  │                                        │
│  │ Commission    │  │                                        │
│  │  ├ Policies   │  │                                        │
│  │  ├ Fee Monitor│  │                                        │
│  │  ├ Comm Monitor│ │                                        │
│  │  ├ Payouts    │  │                                        │
│  │  ├ Exceptions │  │                                        │
│  │  └ Audit Logs │  │                                        │
│  │ Disputes      │  │                                        │
│  │ System        │  │                                        │
│  │  ├ Users      │  │                                        │
│  │  └ Roles      │  │                                        │
│  └──────────────┘  │                                        │
└────────────────────┴────────────────────────────────────────┘
```

### Breadcrumb Structure

**SP Portal**: `Home > [Section] > [Screen]`
- Example: `Home > RFQs > RFQ-001 > Quote Comparison`

**Admin Portal**: `Admin > [Category] > [Screen]`
- Example: `Admin > Commission > Policies > Create Policy`

---

## 5. Shared Layout

### Layout Description

All screens share:
- **Sidebar**: Collapsible, 240px expanded / 64px collapsed
- **Top Navbar**: App name, user profile dropdown, notification bell
- **Content Area**: Max-width 1280px, centered, with padding
- **Breadcrumbs**: Below navbar, above content

### Mock Layout Paths

```
src/app/design-mocks/_shared/startup-partner-o2o/layout.tsx       (SP Portal shell)
src/app/design-mocks/_shared/startup-partner-o2o/admin-layout.tsx  (Admin Portal shell)
```

> **UI Developer**: Create these shared layouts when building the first epic's mocks. All subsequent epic mocks must use them.

---

## 6. Shared Components (Cross-Epic)

| Component | Used In (Epics) | Source | Notes |
|-----------|----------------|--------|-------|
| Button | All | Component Registry | 12 variants, 3 sizes |
| Typography | All | Component Registry | Full variant set |
| TextField | EPIC-02, 06, 08, 11 | Component Registry | With validation states |
| Dialog / ConfirmationDialog | EPIC-02, 03, 06, 09, 11, 15 | Component Registry | For confirmations |
| Alert | EPIC-02, 06, 10, 11 | Component Registry | Error/success/warning/info |
| Badge | EPIC-02, 03, 06, 07, 11, 12 | Component Registry | Status indicators |
| Pagination | EPIC-03, 06, 07, 11 | Component Registry | List pagination |
| Tabs | EPIC-06, 07, 11, 12 | Component Registry | Content sections |
| FileUpload | EPIC-02, 06, 08, 13 | Component Registry | KYC, AI images, evidence |
| ProgressSteps | EPIC-02, 14 | Component Registry | Registration wizard, training |
| ProgressBar | EPIC-14 | Component Registry | Training progress |
| CardTable | EPIC-03, 06, 07, 11, 12, 15 | Component Registry | Data tables |
| EmptyState | All list screens | Component Registry | No data views |
| PageHeader | All screens | Component Registry | Screen titles |
| Breadcrumbs | All screens | Component Registry | Navigation path |
| SelectionCard | EPIC-02, 06 | Component Registry | Service area, store selection |
| **StatusBadge** (NEW) | EPIC-02, 03, 06, 11 | To Create | SP status, RFQ status, commission status |
| **QuoteComparisonTable** (NEW) | EPIC-07 | To Create | Side-by-side quote display |
| **MessageThread** (NEW) | EPIC-08 | To Create | Topic-threaded messaging UI |
| **CommissionSummaryCard** (NEW) | EPIC-11, 12 | To Create | Estimated/confirmed/paid totals |
| **ServiceAreaSelector** (NEW) | EPIC-02, 03 | To Create | Region → Province → District cascading |
| **TrainingModuleCard** (NEW) | EPIC-14 | To Create | Training module with progress |

---

## 7. Cross-Epic Dependencies

| Epic | Depends On | Shared State | Notes |
|------|-----------|-------------|-------|
| EPIC-01 (SSO) | — | Auth tokens, user session | Foundation — all epics depend on this |
| EPIC-02 (Registration) | EPIC-01 | SP profile, approval status | Must complete before anything else |
| EPIC-14 (Training) | EPIC-02 | Certification status | Must certify before live selling |
| EPIC-03 (Admin SP) | EPIC-02 | SP applications, approval decisions | Admin reviews what SP submitted |
| EPIC-04 (Seller Opt-In) | — | Store opt-in status | Enables SP product/store visibility |
| EPIC-05 (Products) | EPIC-04, EPIC-14 | Product catalog, favorites | Requires opted-in stores + certification |
| EPIC-06 (RFQ) | EPIC-05, EPIC-14 | RFQ data, store selections | Core transaction creation |
| EPIC-07 (Quotes) | EPIC-06 | Quote data from stores | Comparison requires RFQ responses |
| EPIC-08 (Messaging) | EPIC-04, EPIC-06 | Message threads per RFQ | Contextual to specific RFQ |
| EPIC-09 (Magic Link) | EPIC-07 | Selected quotes, link tokens | Generates from quote selection |
| EPIC-10 (Checkout) | EPIC-09 | Magic Link token, buyer account | Buyer accesses via link |
| EPIC-11 (Commission) | EPIC-10 | Order completion, fee collection | Triggered by completed purchase |
| EPIC-12 (Hierarchy) | EPIC-03 | Leader-Member assignments | Admin sets hierarchy |
| EPIC-13 (Disputes) | EPIC-11, EPIC-09 | Transaction evidence | Protects commissions |
| EPIC-15 (User Mgmt) | EPIC-01 | User accounts, roles | Admin manages system users |

### Recommended Build Order

```
Phase 1: EPIC-01 (SSO) → EPIC-02 (Registration) → EPIC-14 (Training)
Phase 2: EPIC-04 (Seller Opt-In) → EPIC-05 (Products) → EPIC-06 (RFQ)
Phase 3: EPIC-07 (Quotes) → EPIC-08 (Messaging) → EPIC-09 (Magic Link)
Phase 4: EPIC-10 (Checkout) → EPIC-11 (Commission)
Phase 5: EPIC-03 (Admin SP) → EPIC-12 (Hierarchy) → EPIC-13 (Disputes) → EPIC-15 (User Mgmt)

Parallel: EPIC-03 can start alongside Phase 2. EPIC-15 can start alongside Phase 3.
```

---

## 8. Cross-Epic UX Decisions

### Navigation

- SP Portal and Admin Portal are **separate apps** (different ports, different sidebars)
- Seller Portal features are **integrated** into existing seller-platform sidebar
- Buyer Portal uses **no navigation** — Magic Link is a standalone entry point
- SP status badge in navbar shows current approval/certification status

### Layout

- All screens use **sidebar + navbar** pattern (consistent with app context)
- Content area max-width: **1280px** with responsive breakpoints
- Cards with **soft shadows** and **rounded corners** (per Visual Theme Direction)
- Tables use **CardTable** component (not raw HTML tables)
- Forms use **step-by-step wizard** pattern for complex flows (registration, RFQ creation)

### State Persistence

| State | Scope | Persistence |
|-------|-------|-------------|
| Auth session | Cross-app (SSO) | Cookie (`auth-session`) |
| SP profile & status | SP Portal | Zustand (persisted) |
| Current RFQ draft | RFQ creation | Zustand (session) |
| Selected quotes | Quote comparison | Zustand (session) |
| Training progress | Training | Server-side (API) |
| Commission data | Commission views | TanStack Query (cache) |

### Key UX Patterns

| Pattern | Where Used | Description |
|---------|-----------|-------------|
| **Step Wizard** | Registration (7 steps), RFQ Creation, Training | Multi-step form with progress indicator |
| **Status Timeline** | Application status, Commission lifecycle | Vertical timeline showing status progression |
| **Side-by-Side Comparison** | Quote Comparison (Offer Hub) | Up to 12 columns comparing quotes |
| **Cascading Selector** | Service area selection | Region → Province → District hierarchy |
| **Threaded Messages** | SP-Seller communication | Topic-based threads per RFQ |
| **Dashboard Cards** | Commission, Team, Admin | Summary cards with key metrics |
| **Buyer-Centric View** | RFQ list | Group RFQs by buyer name across time |

---

## 9. Visual Theme Reference

> See `docs/architecture/APP-CONTEXT-GUIDE.md` — Section: startup-partner-platform
>
> **Theme Summary**: High-fidelity modern SaaS partner portal, minimal and elegant, generous whitespace, clean white background with soft neutral tones, green as primary action color, soft rounded corners throughout, floating cards with very subtle shadows, step-by-step wizard flows, Thai typography with professional yet approachable feel, fully mobile-responsive.
>
> All designs in this module must follow the app's Visual Theme Direction.
> Pull actual design values from the component registry, not from the theme description.
