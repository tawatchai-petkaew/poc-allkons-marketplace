# Product Requirements Document (PRD)
**Author/Owner**: Product Owner (PO)
**Module**: Startup Partner O2O (Offline-to-Online)
**Date**: 2026-03-20
**Status**: 🟢 Final / Approved
**Priority**: P1 (High)
**Target Release**: Q3 2026
**Approved By**: Product Owner
**Approval Date**: 2026-03-14

## Change Log
| Version | Date | Changes | Updated By | Status |
|---------|------|---------|------------|--------|
| v1.0 | 2026-03-14 | Initial version | PO | ⚪ Draft |
| v1.1 | 2026-03-14 | Added SSO across all platforms, streamlined O2O registration for unregistered buyers, KYC exemption for non-credit payments, responsive mobile design, configurable commission engine, decoupled multi-seller checkout (Offer Hub), SP training requirement, and dispute resolution workflows. | PO | ⚪ Draft |
| v1.2 | 2026-03-14 | Answered open questions: SSO via Authentication Center/Allkons ID (OAuth 2.0, Keycloak), commission percentage configurable by Admin, manual KYC verification, optional training, simultaneous quote display in Offer Hub. Moved SP performance metrics, termination policy, and circumvention penalties to out-of-scope (next phase). | PO | ⚪ Draft |
| v1.3 | 2026-03-14 | Final open questions answered: Multi-seller payment sequence is buyer's choice, fraud detection relies on manual admin review, SP reapplication allowed immediately (no cooldown). | PO | 🟢 Final / Approved |
| v1.4 | 2026-03-17 | Replaced "Streamlined Buyer Registration" (OTP self-registration) with "Frictionless Buyer Onboarding (Auto-Provisioning)": guest checkout remains prohibited; Seller inputs Buyer details when generating the quote; system auto-provisions a Shadow Account (with a default password) if new, or matches an existing Allkons M account by Phone/Email; Buyer simply logs in (or resets password) from the Magic Link — no upfront self-registration. Aligned with Customer Management (B2B CRM) module's Quote-to-CRM auto-provisioning flow. | PO | 🟢 Final / Approved |
| v1.5 | 2026-03-20 | Aligned with BRD v1.3: Added Region/Province/District cascading hierarchy for service areas, HEIC/PDF support for KYC documents with auto-conversion and preview generation, expanded RFQ fields (buyer info, delivery location/time, delivery schedule with max 5 rounds, SP reference auto-population), increased RFQ store selection limit to max 12 partner stores, Consent Center API integration for terms acceptance logging, enhanced application status workflow with limited access for Pending/InfoRequested/Rejected SPs and resubmission capability, RFQ buyer grouping for customer management. | PO | 🟢 Final / Approved |

> **💡 When updating:** Change Status to 🟢 Final / Approved ONLY AFTER explicit PO approval.

---

## 1. Executive Summary

The Startup Partner O2O (Offline-to-Online) platform is an affiliate and referral system that bridges traditional offline B2B sales relationships with the Allkons M digital marketplace. The platform enables freelance sales agents (Startup Partners or "SPs") to act as concierge services for low-tech B2B buyers, sourcing construction materials, negotiating quotes from multiple stores, and bundling offers into shareable "Magic Links" that buyers can approve and purchase with a single click.

The system addresses a critical gap in the market: low-tech B2B buyers (contractors, technicians, project owners) who struggle with traditional e-commerce shopping UX and prefer human interaction. These buyers waste time sourcing products, negotiating with multiple stores, and merging quotes manually. Simultaneously, sellers on Allkons M need more leads but lack the localized sales force to capture offline B2B relationships.

The Startup Partner O2O platform consists of three interconnected components: (1) A standalone SP Portal for partner registration, onboarding, and operations, (2) Enhanced Seller Portal features for stores to opt-in to the affiliate program and manage SP-driven quotes, and (3) A streamlined Buyer O2O Checkout flow for completing purchases from SP-generated offer links. The platform supports a hierarchical structure where Thammasorn Co., Ltd internal sales reps act as global supervisors, while public freelance SPs are assigned to specific geographic service areas. When transactions complete through SP referrals, Allkons M pays commissions based on transaction fees.

## 2. Problem Statement

The current Allkons M marketplace faces critical challenges in serving low-tech B2B buyers and expanding seller reach:

**Low-Tech Buyer Friction:**
- Low-tech B2B buyers (contractors, technicians, project owners) struggle with traditional e-commerce "shopping mode" UX
- These buyers prefer human interaction, phone calls, and personal relationships over digital self-service
- Buyers waste significant time sourcing products across multiple stores
- Negotiating prices with multiple stores is time-consuming and inefficient
- Manually merging and comparing quotes from different stores is complex and error-prone
- No concierge service exists to help buyers navigate the marketplace

**Seller Lead Generation Gap:**
- Sellers on Allkons M need more leads to increase revenue
- Sellers lack localized sales force to capture offline B2B relationships
- Sellers cannot reach buyers who prefer offline interaction
- No mechanism exists for sellers to leverage affiliate partners for lead generation
- Sellers miss opportunities from buyers outside their traditional customer base

**Offline-to-Online Conversion Barrier:**
- Strong offline B2B relationships exist but are not captured in the digital marketplace
- Freelance sales agents and local representatives have buyer networks but no platform to monetize them
- No system exists to bridge offline sales relationships with online transaction processing
- Buyers who prefer offline interaction are excluded from the digital marketplace benefits (price transparency, payment security, order tracking)

**Operational Inefficiency:**
- Manual quote sourcing and comparison is time-consuming for buyers
- No standardized process for affiliate sales agents to work with multiple stores
- Lack of transparency in pricing and quote comparison
- No commission tracking or payment system for affiliate partners

## 3. Goals & Success Metrics (KPIs)

### Business Goals
- **Partner Acquisition:** Acquire 500 new registered Startup Partners in Q3 2026
- **Platform Growth:** Increase overall platform transaction volume by 25% through SP-driven sales
- **Seller Revenue:** Increase participating seller revenue by 30% through SP-generated leads
- **Market Expansion:** Capture offline B2B relationships and convert them to digital transactions
- **Commission Revenue:** Generate new revenue stream through transaction fees from SP-driven sales

### User Goals
- **Startup Partners:** Monetize existing buyer relationships by earning commissions on successful transactions
- **Buyers:** Receive personalized concierge service for sourcing and negotiating construction materials
- **Sellers:** Receive qualified leads from SPs without hiring additional sales staff
- **Admins:** Efficiently manage and scale the SP network

### Success Metrics (KPIs)
- **SP Acquisition:** 500 registered and approved SPs by end of Q3 2026
- **SP Activation Rate:** 70% of approved SPs complete at least one RFQ within first month
- **Seller Participation:** 20% of stores/branches opt-in to SP program within 6 months
- **Transaction Volume:** SP-driven transactions account for 15% of total platform GMV within 6 months
- **Quote Response Rate:** 80% of RFQs receive at least one quote within 24 hours
- **Buyer Conversion:** 60% of buyers who click SP Magic Links complete purchase
- **SP Retention:** 80% of active SPs remain active after 3 months
- **Average Commission:** Average SP commission per transaction ≥ 500 THB

## 4. User Personas

### Persona 1: Freelance Startup Partner (Public SP)
- **Profile:** 25-40 years old, freelance sales agent, has network of contractors and project owners in local area
- **Primary Motivation:** Earn commission by connecting buyers with sellers, monetize existing relationships
- **Key Pain Point:** Has buyer relationships but no platform to facilitate transactions and earn commission
- **Success Criteria:** Can source products, request quotes, and generate offer links in under 10 minutes per buyer request

### Persona 2: Thammasorn Internal Sales Rep (SP Supervisor)
- **Profile:** 30-50 years old, employed by Thammasorn Co., Ltd, manages team of public SPs
- **Primary Motivation:** Supervise public SPs, ensure quality service, maximize team performance
- **Key Pain Point:** No system to manage and monitor public SP team performance
- **Success Criteria:** Can view team performance, provide guidance, and ensure service quality standards

### Persona 3: Low-Tech B2B Buyer
- **Profile:** 35-55 years old, contractor or project owner, prefers phone calls and personal service over e-commerce
- **Primary Motivation:** Source construction materials quickly with best prices without navigating complex e-commerce sites
- **Key Pain Point:** Struggles with traditional e-commerce UX, wastes time sourcing and comparing quotes manually
- **Success Criteria:** Receives personalized offer link from SP, can view and approve quotes in under 5 minutes, completes purchase seamlessly

### Persona 4: Store/Branch Sales Rep (Seller)
- **Profile:** 25-45 years old, manages sales for construction material store/branch
- **Primary Motivation:** Receive qualified leads from SPs to increase sales revenue
- **Key Pain Point:** Lacks localized sales force to reach buyers outside traditional customer base
- **Success Criteria:** Receives RFQs from SPs, can respond with quotes quickly, closes sales through SP channel

### Persona 5: Allkons M Admin
- **Profile:** 25-35 years old, manages SP network operations
- **Primary Motivation:** Efficiently onboard, verify, and manage growing SP network
- **Key Pain Point:** Manual verification and management of SPs is time-consuming and doesn't scale
- **Success Criteria:** Can review and approve SP applications in under 10 minutes, monitor SP network health, manage service area assignments

## 5. Scope

### 5.1 In-Scope

**Single Sign-On (SSO) & Unified Authentication:**
- Users have single credential across all Allkons M systems (SP Portal, Buyer Portal, Seller Portal, Admin Portal)
- Existing Allkons M users can register/login to SP program with their existing account credentials
- Seamless authentication across all platforms without re-login
- Unified user profile across all systems

**SP Onboarding & Admin (Standalone SP Portal):**
- Dedicated standalone website for public SP registration and operations
- SP application form with KYC document upload (ID card, bank book, selfie with ID)
- Service area selection (province + district) during registration
- Admin portal for reviewing, approving, rejecting, or requesting additional info from SP applications
- Assign public SPs to Thammasorn SP supervisors (Leader → Member hierarchy)
- Auto-provision Thammasorn internal sales reps as global SPs (no application required)
- SP profile management and service area updates
- SP status management (Active, Suspended, Terminated)

**Seller Opt-In (Enhanced Seller Portal):**
- Toggle for stores/branches to opt-in or opt-out of SP O2O program
- Configure which products are available for SP sourcing
- Set SP-specific pricing or use standard pricing
- View SP-generated RFQs and respond with quotes
- In-app messaging with SPs for quote negotiation
- Notification system for new RFQs from SPs

**Sourcing & Quoting Workflow (SP Portal):**
- Product search within SP's assigned service areas
- Filter products by category, brand, store
- Request for Quotation (RFQ) creation with multiple products
- Send RFQs to multiple stores simultaneously
- View and track RFQ status (Submitted, Quoted, Expired, Cancelled)
- Side-by-side quote comparison from multiple stores
- Select best quotes or combination of quotes for buyer

**In-App SP-to-Seller Communication:**
- Messaging system strictly between SP and Store Sales rep
- Negotiate pricing, delivery terms, and product specifications
- Attach images or documents to messages
- Notification system for new messages
- Message history and threading

**Magic Link Offer Generation (SP Portal):**
- Generate shareable web link containing compared quotes
- SP's "best combination" suggestion highlighted
- Link includes product details, pricing, store information
- Link expiration (e.g., 30 days)
- Link tracking (views, clicks, conversions)
- Regenerate link if quotes change

**Buyer O2O Checkout (Partial New Buyer Flow):**
- Buyers click Magic Link to view offer (guest viewing allowed, no auth required)
- Display side-by-side quote comparison as "Offer Hub"
- Highlight SP's recommended combination
- **Frictionless Buyer Onboarding (Auto-Provisioning):** Guest checkout is prohibited. When the Seller generates the requested quote for the SP, the Seller inputs the Buyer's details. The system auto-provisions a Shadow Account (with a default password) if the buyer is new, or matches them to an existing Allkons M account based on Phone/Email. When the Buyer clicks the SP's Magic Link, they simply log in (or reset their password) to access the Offer Hub — eliminating upfront registration friction entirely.
- Buyers must log into their Allkons M account (provisioned by the Seller or pre-existing) to complete purchase (guest checkout not allowed for purchasing)
- **KYC Exemption:** Existing Allkons M buyers can purchase without KYC if paying without using store's credit
- Approve and pay for each seller's quotation individually within Offer Hub (decoupled checkout per seller)
- Support multiple payment methods per seller's criteria
- Order confirmation and tracking
- Order history accessible in buyer account

**Commission Tracking & Payment:**
- **Configurable Commission Engine:** Automatically calculate SP commission as percentage of transaction fee collected from seller
- Commission percentage configurable by Allkons M Admins (not hard-coded)
- Track SP commissions based on completed transactions
- Commission dashboard for SPs to view earnings
- Commission payment processing (monthly or configurable)
- Commission history and statements
- Commission clawback mechanism for refunds

**Dispute Resolution & Mediation:**
- Allkons M Admin acts as sole mediator for platform disputes
- Digital Quotation (approved via Offer Link) is absolute legal source of truth
- Offline promises by SPs not recognized by platform
- Post-payment disputes (damaged goods, etc.) handled between Buyer and Seller using standard Allkons M return policies
- SP commission clawback if full refund occurs
- Reporting mechanism for SPs to flag Sellers attempting to bypass platform and steal leads

**SP Training & Support:**
- Training materials for new SPs (videos, guides, documentation)
- Onboarding support before SPs can start operating
- Best practices documentation
- FAQ and troubleshooting guides

**Responsive Mobile Design:**
- All related systems (SP Portal, Enhanced Seller Portal, Buyer O2O Checkout) support responsive design for mobile devices
- Mobile-optimized UI for SPs working in the field
- Touch-friendly interfaces

**Phased Rollout Strategy:**
- Phase 1: Build standalone SP site + Enhanced Seller site + Partial Buyer O2O checkout
- Phase 2: Rollout new Seller site to pilot group of branches
- Phase 3: Buyers use existing legacy site for standard shopping, routed to new O2O checkout when clicking SP Magic Links

### 5.2 Out-of-Scope (Crucial)

**Explicitly NOT included in this iteration:**
- **SP-to-Buyer Chat System:** Buyers and SPs communicate offline (Phone, LINE, WhatsApp). System only handles final Offer Link and checkout
- **Full Buyer Platform Revamp:** Buyers continue using existing legacy site for standard shopping; only O2O checkout flow is new
- **Inventory Management:** Real-time inventory sync and stock management (separate module)
- **Delivery/Logistics Management:** Delivery tracking, logistics coordination (separate module)
- **Advanced Commission Structures:** Multi-level marketing, tiered commissions, performance bonuses (future iteration)
- **SP Performance Metrics & Analytics:** Detailed analytics dashboard for SP performance evaluation (deferred to next phase)
- **SP Termination Policy & Automation:** Automated SP suspension/termination based on performance thresholds (deferred to next phase)
- **Circumvention Penalties & Enforcement:** Specific penalty structures and automated enforcement for platform bypass attempts (deferred to next phase)
- **Buyer CRM:** Customer relationship management for buyers (future iteration)
- **Mobile App:** Web application only; no native mobile apps (responsive web design provided)
- **International Expansion:** Thailand market only; no multi-language or multi-currency support
- **AI-Powered Recommendations:** AI-based product recommendations for SPs (future iteration)
- **Automated Quote Generation:** Sellers must manually create quotes; no automated quote generation
- **Automated KYC Verification:** KYC verification is manual by admin (automated verification deferred to future)

## 6. Key Product Requirements

### 6.1 Single Sign-On (SSO) & Unified Authentication

**Requirement:** Integrate with Authentication Center and Allkons ID modules to provide unified authentication across all Allkons M systems (SP Portal, Buyer Portal, Seller Portal, Admin Portal) using OAuth 2.0 and Keycloak.

**User Value:** Eliminates need for multiple accounts and passwords, provides seamless experience across all Allkons M platforms.

**Acceptance Criteria (High-Level):**
- **Integration with Authentication Center:**
  - Integrate with existing Authentication Center module
  - Integrate with Allkons ID module for identity management
  - Use OAuth 2.0 protocol for authentication
  - Use Keycloak as identity provider
  - Follow Authentication Center's authentication flows and standards
- **Single Credential:**
  - Users have one credential (phone number + password) across all Allkons M systems
  - Login once via Authentication Center, access all authorized platforms without re-authentication
  - Session managed by Authentication Center and shared across SP Portal, Buyer Portal, Seller Portal, Admin Portal
- **Existing User Registration:**
  - Existing Allkons M users (Buyers, Sellers) can register for SP program using their existing Allkons ID credentials
  - No need to create new account or password
  - System recognizes existing user via Allkons ID and links SP profile to existing account
  - Unified user profile managed by Allkons ID
- **Cross-Platform Navigation:**
  - Users can switch between platforms without re-login (SSO session maintained)
  - Consistent navigation and user experience
  - Role-based access control via Keycloak (users see only platforms they have access to)
- **Session Management:**
  - Single OAuth 2.0 session token valid across all platforms
  - Session timeout managed by Authentication Center (configurable)
  - Logout from one platform logs out from all platforms via Authentication Center
  - Remember me functionality works across platforms
- **Profile Synchronization:**
  - User profile managed centrally by Allkons ID
  - Profile updates (name, email, phone) sync across all platforms via Allkons ID
  - Password changes managed by Authentication Center, apply to all platforms
  - Profile photo and preferences shared via Allkons ID

### 6.2 SP Registration & Onboarding (Standalone SP Portal)

**Requirement:** Provide a dedicated standalone website for public freelance sales agents to register as Startup Partners, submit KYC documents, and select service areas.

**User Value:** Enables anyone to become an SP and start earning commissions by leveraging their buyer networks.

**Acceptance Criteria (High-Level):**
- **Registration Form:**
  - Phone number (primary identifier, becomes username)
  - First name, Last name (Thai)
  - Email address
  - ID card number (13 digits)
  - Service area selection using Region → Province → District cascading hierarchy:
    - User selects Region (ภาค) first
    - System auto-populates all provinces in selected region
    - User selects specific provinces
    - System auto-populates all districts in selected provinces
    - Database stores district-level service areas for granular control
    - Admin can adjust district-level scope after approval
  - Target shops selection (optional: select specific shops to work with; only shops that opted-in to SP Program are shown)
- **KYC Document Upload:**
  - ID card front and back (JPG/PNG/HEIC/PDF, max 10MB each)
  - Bank book copy (JPG/PNG/HEIC/PDF, max 10MB)
  - Selfie with ID card (JPG/PNG/HEIC/PDF, max 10MB)
  - File validation (format, size, image quality)
  - HEIC file support: System auto-converts iPhone HEIC files to PNG format for storage
  - PDF file support: System generates preview images from PDF files (first page thumbnail); stores original PDF
  - User can preview uploaded files before submission
  - All 3 KYC documents are mandatory
- **Terms & Conditions:**
  - SP program terms and conditions
  - Commission structure disclosure
  - Service area exclusivity rules
  - Mandatory acceptance before submission
  - System logs consent to Consent Center API with timestamp, user ID, consent type, IP address
  - Consent Center API must respond successfully before application submission completes
- **OTP Verification:**
  - Send OTP to phone number for verification
  - 6-digit OTP code
  - 3-minute expiration
  - Maximum 5 attempts
- **Auto-Generated Password:**
  - System auto-generates secure password
  - Password sent via SMS after approval
  - Phone number becomes username for login
- **Application Submission:**
  - Submit application for admin review
  - Display application status page
  - Application ID for tracking
- **Application Status Tracking:**
  - View application status: Pending, InfoRequested, Approved, Rejected, Suspended
  - Display admin feedback or requests for additional information
  - **Limited Access for Non-Approved SPs:**
    - Pending/InfoRequested/Rejected SPs can login but cannot access main SP Portal functions
    - Access restricted to: Application Status page, Profile view, Document view, Logout
    - Cannot access: RFQ creation, Product search, Quote comparison, Magic Link generation
  - **Resubmission Capability:**
    - If status is "InfoRequested", user can edit application data and documents, then resubmit
    - Resubmission changes status from InfoRequested back to Pending for Admin review
    - If status is "Rejected", user can view rejection reason and reapply with new application
    - Rejected SPs can reapply immediately (no cooldown period)

### 6.2 Admin SP Management (Admin Portal)

**Requirement:** Enable Allkons M admins to review, approve, reject, or request additional information from SP applications, and manage the SP network.

**User Value:** Ensures quality control of SP network, prevents fraud, and enables efficient scaling of affiliate program.

**Acceptance Criteria (High-Level):**
- **Application Review Dashboard:**
  - List of pending SP applications
  - Filter by: Status, Date, Service Area, Application ID
  - Search by: Name, Phone, ID card number
  - Sort by: Date submitted, Priority
- **Application Detail View:**
  - Display all application information
  - View uploaded KYC documents (ID card, bank book, selfie with ID)
  - **Manual KYC Verification:** Admin manually reviews and verifies KYC documents for authenticity
  - Verify ID card number (check for duplicates in system)
  - Verify service area availability
  - View target shops selected
  - Flag suspicious applications for further review
- **Admin Actions:**
  - Approve application after successful KYC verification (provision SP account, send credentials via SMS)
  - Reject application (provide reason, rejected SPs can reapply immediately - no cooldown period)
  - Request additional information or clearer document photos (send message to applicant, set application to "Info Requested" status)
  - Assign to Thammasorn SP supervisor (Leader)
  - Flag for fraud investigation if KYC documents appear fraudulent
  - Manual fraud detection and review (no automated fraud detection in this iteration)
- **SP Network Management:**
  - View all active SPs with status, service areas, performance metrics
  - Suspend or terminate SP accounts
  - Reassign SPs to different supervisors
  - Update service area assignments
  - View SP hierarchy (Leader → Members)
- **Thammasorn SP Auto-Provisioning:**
  - Automatically provision Thammasorn internal sales reps as global SPs
  - Global service area access (all provinces/districts)
  - Supervisor role assignment
  - No application or approval required

### 6.3 Seller Opt-In & Configuration (Enhanced Seller Portal)

**Requirement:** Enable stores/branches on the Allkons M Seller site to toggle their participation in the SP O2O program and configure SP-specific settings.

**User Value:** Gives sellers control over affiliate program participation and allows them to manage SP-driven sales channel.

**Acceptance Criteria (High-Level):**
- **SP Program Toggle:**
  - On/Off toggle for participating in SP O2O program
  - Display program benefits and commission structure
  - Confirmation dialog before enabling/disabling
  - Status indicator showing current participation status
- **Product Availability Configuration:**
  - Select which products are available for SP sourcing
  - Bulk enable/disable products for SP program
  - Filter by category, brand, or status
  - Default: All published products available to SPs
- **Pricing Configuration:**
  - Option to set SP-specific pricing (different from standard buyer pricing)
  - Option to use standard pricing for SP orders
  - Bulk pricing adjustments for SP channel
- **Service Area Visibility:**
  - Display which service areas the store serves
  - SPs in those areas can discover and request quotes from the store
- **RFQ Management:**
  - View incoming RFQs from SPs
  - Filter by: Status, Date, SP name, Product category
  - Respond to RFQs with quotes
  - Decline RFQs with reason
- **SP Communication:**
  - In-app messaging with SPs
  - Negotiate pricing and terms
  - Notification for new messages from SPs

### 6.4 Product Discovery & Sourcing (SP Portal)

**Requirement:** Enable SPs to search and discover products from stores in their assigned service areas to fulfill buyer requests.

**User Value:** Allows SPs to quickly find products matching buyer needs from participating stores in their territory.

**Acceptance Criteria (High-Level):**
- **Product Search:**
  - Search by: Product name, Barcode, Brand, Category, Sub-category
  - Filter by: Store/Branch, Price range, Availability
  - Area-scoped search (only shows products from stores in SP's service areas)
  - Display product details: Name, Image, SKU, Brand, Category, Price, Store name
- **Store Discovery:**
  - View list of participating stores in SP's service areas
  - Filter stores by: Location, Product categories, Rating
  - View store profile: Name, Location, Product count, Response rate
- **Product Details:**
  - View detailed product information
  - View pricing (if available)
  - View store information
  - Check product availability
- **Add to RFQ Cart:**
  - Add products to RFQ cart for quote request
  - Specify quantity for each product
  - Add notes or special requirements
  - RFQ cart persists across sessions
- **Multi-Store Selection:**
  - Add products from multiple stores to single RFQ
  - System automatically groups products by store for quote requests

### 6.5 RFQ Creation & Management (SP Portal)

**Requirement:** Enable SPs to create Request for Quotations (RFQs) with multiple products and send them to multiple stores simultaneously.

**User Value:** Streamlines the quote sourcing process, allowing SPs to efficiently gather competitive quotes for buyers.

**Acceptance Criteria (High-Level):**
- **RFQ Creation:**
  - Review RFQ cart before submission
  - **Add buyer information (mandatory):**
    - Buyer First Name (Thai characters, max 100 chars)
    - Buyer Last Name (Thai characters, max 100 chars)
    - Buyer Phone Number (10 digits Thai format)
  - **Add delivery requirements (mandatory):**
    - Delivery Location (max 500 chars)
    - Delivery Time (must be after deadline + minimum 24 hours lead time)
  - **Add delivery schedule (optional):**
    - Multiple delivery rounds (max 5 rounds)
    - Each round specifies: Round number, Location, Date/Time
  - Add payment preferences (cash, credit, installment)
  - Add special notes or requirements (optional, max 500 chars)
  - **SP reference:** Auto-populated SP ID from logged-in SP account
  - Select target stores to send RFQ (1-12 partner stores maximum; only opted-in stores shown)
- **RFQ Submission:**
  - Submit RFQ to selected stores simultaneously
  - Display confirmation with RFQ ID
  - Estimated response time (e.g., "Stores typically respond within 24 hours")
- **RFQ Tracking:**
  - View list of submitted RFQs
  - **RFQ Buyer Grouping:** RFQs can be grouped by buyer name for better customer management
  - Filter by: Status (Submitted, Quoted, Expired, Cancelled), Date, Store, Buyer
  - Search by: RFQ ID, Product name, Store name, Buyer name
  - Display RFQ status for each store
- **RFQ Status:**
  - Submitted: RFQ sent to store, awaiting response
  - Quoted: Store responded with quote
  - Expired: Store did not respond within 7 days
  - Cancelled: SP cancelled RFQ
- **RFQ Expiration:**
  - RFQs automatically expire after 7 days if no response
  - Display expiration countdown
  - Option to extend expiration or resend RFQ
- **RFQ Cancellation:**
  - SP can cancel RFQ before store responds
  - Confirmation dialog with warning if store is already working on quote
  - Notify store of cancellation

### 6.6 Quote Comparison & Selection (SP Portal)

**Requirement:** Display side-by-side comparison of quotes received from multiple stores, enabling SPs to select the best combination for their buyers.

**User Value:** Provides transparency and enables SPs to make informed decisions on behalf of buyers, ensuring best value.

**Acceptance Criteria (High-Level):**
- **Quote Comparison View (Simultaneous Display):**
  - Display all quotes simultaneously in side-by-side comparison (up to 4 stores)
  - No pagination or navigation required - all quotes visible at once
  - Display for each quote: Store name, Product details, Unit price, Quantity, Subtotal, Delivery terms, Payment terms
  - Highlight differences between quotes (price, delivery time, payment terms)
  - Calculate total cost for each quote
  - Display savings compared to highest quote
  - Responsive layout adapts for mobile (stacked view) and desktop (side-by-side)
- **Quote Selection:**
  - Select entire quote from single store
  - Select individual items from different stores (mix and match)
  - Calculate combined total for mixed selection
  - Display delivery and payment term conflicts for mixed selections
- **SP Recommendation:**
  - Mark SP's recommended combination
  - Add recommendation notes for buyer
  - Highlight best value or best terms
- **Quote Validity:**
  - Display quote expiration date
  - Expired quotes marked clearly
  - Option to request quote refresh from store
- **Quote Details:**
  - View detailed breakdown of each quote
  - View store contact information
  - View delivery and payment terms
  - View any special conditions or notes from store

### 6.7 In-App SP-to-Seller Communication

**Requirement:** Provide messaging system strictly between SP and Store Sales rep for negotiating quotes and finalizing terms.

**User Value:** Enables efficient negotiation and clarification without requiring external communication tools.

**Acceptance Criteria (High-Level):**
- **Messaging Interface:**
  - Chat-style messaging interface
  - Real-time message delivery
  - Message threading by RFQ
  - Display sender name and timestamp
- **Message Features:**
  - Text messages (max 1000 characters)
  - Attach images (JPG/PNG, max 5MB, up to 3 images per message)
  - Attach documents (PDF, max 10MB)
  - Quick reply templates for common responses
- **Notifications:**
  - In-app notification for new messages
  - SMS notification for new messages (configurable)
  - Unread message count indicator
  - Push notifications (if mobile web)
- **Message History:**
  - View complete message history for each RFQ
  - Search messages by keyword
  - Export message history for record-keeping
- **Access Control:**
  - Only SP and assigned Store Sales rep can view messages
  - Messages tied to specific RFQ
  - Messages archived when RFQ is completed or cancelled

### 6.8 Magic Link Offer Generation (SP Portal)

**Requirement:** Enable SPs to generate shareable web links containing compared quotes and their recommended combination to send to buyers.

**User Value:** Provides seamless handoff from SP to buyer, enabling buyers to review and approve offers at their convenience.

**Acceptance Criteria (High-Level):**
- **Link Generation:**
  - Generate unique, secure web link for quote bundle
  - Link contains: Selected quotes, SP recommendation, Product details, Pricing, Store information
  - Link is shareable via SMS, LINE, WhatsApp, Email, or copy-paste
  - Link preview with Open Graph Protocol (OGP) metadata for rich previews in messaging apps
- **Link Configuration:**
  - Set link expiration (default: 30 days, configurable)
  - Add personalized message for buyer
  - Include SP contact information
  - Option to require buyer login before viewing
- **Link Management:**
  - View list of generated links
  - Track link status: Active, Viewed, Converted, Expired, Revoked
  - View link analytics: Views, Unique visitors, Conversion rate
  - Regenerate link (invalidates old link)
  - Revoke link manually
- **Link Sharing:**
  - Copy link to clipboard
  - Share via SMS (direct integration)
  - Share via LINE, WhatsApp (deep links)
  - Share via Email
  - QR code generation for in-person sharing

### 6.9 Buyer O2O Checkout Flow (Partial New Buyer Platform)

**Requirement:** Provide streamlined "Offer Hub" checkout experience for buyers who click SP Magic Links. Buyer accounts are pre-provisioned by the Seller (via the Quote-to-CRM Auto-Provisioning flow) before the Magic Link is sent — eliminating any self-registration step for the buyer. KYC exemption applies for non-credit payments.

**User Value:** Enables buyers to easily review, approve, and purchase SP-curated offers with minimal friction while maintaining account security and order tracking.

**Acceptance Criteria (High-Level):**
- **Link Landing Page (View-Only, Guest Viewing Allowed):**
  - Display quote comparison from Magic Link as "Offer Hub"
  - Show SP's recommended combination
  - Display product details, pricing, store information
  - Display delivery and payment terms
  - Show total cost breakdown per seller
  - Display SP contact information
  - Guest viewing allowed (no authentication required to view)
  - Call-to-action: "Login to Purchase"
- **Frictionless Buyer Onboarding (Auto-Provisioning — Quote-to-CRM Flow):**
  - Guest checkout is prohibited. There is **no self-registration step** for the buyer at checkout.
  - When the Seller generates the requested quote for the SP, the Seller inputs the Buyer's details (Name, Phone, Email) into the Customer Management (CRM) module inline flow.
  - The system performs a duplicate check by Phone Number or Email against the global Allkons M user database:
    - **Match Found (Existing Account):** The existing Allkons M user is linked to the Seller's CRM — no new account is created.
    - **No Match (New Buyer):** The system auto-provisions a Shadow Account with a system-generated default password and sends the Buyer an SMS/Email containing their username (phone number), default password, and a prompt to log in and change their password.
  - The Magic Link is then generated and shared with the Buyer by the SP.
  - When the Buyer clicks the Magic Link, they simply **log in** with their pre-provisioned credentials (or use "Forgot Password") to access the Offer Hub — **no upfront registration flow is presented**.
  - This approach is fully aligned with the Customer Management (B2B CRM) module's Shadow Account provisioning standard.
- **Authentication Gate:**
  - Buyers must log into their Allkons M account (pre-provisioned by the Seller or pre-existing) to complete a purchase (guest checkout not allowed for purchasing).
  - Login flow: Phone number (username) + Password.
  - "Forgot Password" flow available at any time (OTP-based reset to registered phone number).
  - After successful login, the system returns the buyer to the Offer Hub with purchase capability enabled.
- **KYC Exemption for Non-Credit Payments:**
  - Existing Allkons M buyers can purchase without KYC if paying without using store's credit
  - KYC required only for credit-based payments (30/60/90 day terms)
  - Cash, bank transfer, credit card payments do not require KYC
  - Display KYC requirement clearly if buyer selects credit payment option
- **Decoupled Multi-Seller Checkout (Offer Hub):**
  - Present quotes as "Offer Hub" with multiple seller quotations
  - Buyer cannot make single lump-sum payment (different sellers have different tax invoicing and payment terms)
  - Buyer must explicitly approve and pay for each seller's quotation individually within Offer Hub
  - Display clear separation between sellers
  - Buyer chooses payment sequence (which seller to pay first, second, etc.)
  - Track payment status for each seller separately
- **Quote Approval & Selection:**
  - Select which quotes to purchase (can select SP's recommendation or customize)
  - Modify quantities if needed
  - View updated total cost per seller
  - Confirm selection before proceeding to payment
  - Buyer can choose to pay all sellers or only selected sellers
- **Individual Seller Payment (Buyer's Choice Sequence):**
  - Buyer chooses which seller to pay first (flexible payment sequence)
  - Separate payment for each seller based on seller's payment criteria (Cash, Credit, Bank Transfer, etc.)
  - Display payment options available for each seller
  - Process payment for each seller individually in buyer-selected order
  - Payment confirmation for each seller
  - Buyer can pause and resume payment process (e.g., pay one seller now, another later)
  - Handle partial payment failures gracefully (some sellers paid, some failed)
  - Display clear status for each seller: Pending Payment, Paid, Failed
- **Order Confirmation:**
  - Display order confirmation with order IDs (one per seller)
  - Send confirmation SMS and email
  - Provide order tracking links for each seller
  - Display estimated delivery timeline per seller
  - Display SP who facilitated the transaction
- **Order History:**
  - Buyers can view order history in their account
  - Track order status for each seller separately
  - View SP who facilitated the transaction
  - Reorder capability
  - Digital Quotation serves as legal source of truth

### 6.10 Commission Tracking & Payment (SP Portal & Admin)

**Requirement:** Automatically calculate and track SP commissions based on completed transactions using a configurable commission engine, with commission clawback for refunds.

**User Value:** Provides transparency and trust in the commission system, motivating SPs to drive more sales while protecting against refund abuse.

**Acceptance Criteria (High-Level):**
- **Configurable Commission Engine:**
  - Commission calculated as percentage of transaction fee Allkons M collects from seller
  - Commission percentage is configurable variable managed by Allkons M Admins in SP Admin Portal (not hard-coded)
  - Different commission rates can be set for different SP tiers, product categories, or sellers
  - Commission rate changes apply to future transactions only (not retroactive)
  - Audit log of commission rate changes
- **Commission Calculation:**
  - Automatically calculate commission upon completed transaction
  - Commission triggered only when buyer completes payment
  - Commission calculated per transaction per seller
  - Display commission breakdown: Transaction value, Transaction fee, Commission percentage, Commission amount
  - Commission clawback mechanism: If full refund occurs, SP commission is clawed back
  - Partial refunds result in proportional commission adjustment
- **Commission Dashboard (SP View):**
  - Display total earnings (lifetime, monthly, weekly)
  - Display pending commissions (transactions not yet paid out)
  - Display paid commissions (historical)
  - List of transactions with commission details
  - Filter by: Date range, Status (Pending, Paid), Store
- **Commission Payment:**
  - Monthly commission payout (configurable schedule)
  - Minimum payout threshold (e.g., 500 THB)
  - Payment via bank transfer to registered bank account
  - Payment confirmation notification
  - Payment receipt/statement generation
- **Commission History:**
  - View complete commission history
  - Export commission statements to PDF or Excel
  - Tax documentation (if required)
- **Admin Commission Management:**
  - View all SP commissions
  - Approve commission payouts
  - Handle commission disputes
  - Adjust commissions manually if needed (with audit log)
  - Generate commission reports for accounting

### 6.11 SP Hierarchy Management (Admin Portal)

**Requirement:** Support 2-level hierarchy where Thammasorn internal sales reps (Leaders) supervise public freelance SPs (Members).

**User Value:** Enables quality control, mentorship, and performance management of public SP network.

**Acceptance Criteria (High-Level):**
- **Hierarchy Structure:**
  - Leader level: Thammasorn internal sales reps (global service areas)
  - Member level: Public freelance SPs (assigned service areas)
  - Each Member assigned to one Leader
  - Leaders can have multiple Members
- **Leader Capabilities:**
  - View list of assigned Members
  - View Member performance metrics
  - Communicate with Members (messaging)
  - Provide guidance and support
  - Escalate issues to Admin
- **Member Assignment:**
  - Admin assigns public SPs to Leaders during approval process
  - Reassign Members to different Leaders if needed
  - Unassign Members (make them independent)
- **Performance Visibility:**
  - Leaders can view Member performance: RFQs submitted, Quotes received, Conversions, Commissions earned
  - Leaders cannot edit Member data or commissions
  - Leaders can provide feedback or recommendations to Admin
- **Auto-Provisioning:**
  - Thammasorn sales reps automatically provisioned as Leaders
  - No application or approval required
  - Global service area access
  - Cannot be demoted or removed by standard admins

### 6.12 Dispute Resolution & Platform Mediation

**Requirement:** Provide dispute resolution workflows with Allkons M Admin as sole mediator, using digital Quotation as legal source of truth, and mechanisms to prevent platform circumvention.

**User Value:** Protects all parties (SP, Buyer, Seller) with clear dispute resolution process and prevents platform bypass that would harm SP commissions.

**Acceptance Criteria (High-Level):**
- **Source of Truth:**
  - Digital Quotation (approved via Offer Link) is the absolute legal source of truth for all transactions
  - Offline promises made by SPs are not recognized by the platform
  - All disputes must reference the digital Quotation
- **Admin as Sole Mediator:**
  - Allkons M Admin acts as sole mediator for all platform disputes
  - Admin portal includes dispute management interface
  - Dispute resolution workflow with status tracking
  - Communication channel between Admin and disputing parties
- **Fulfillment Disputes (Post-Payment):**
  - Post-payment disputes (damaged goods, wrong items, delivery issues) are strictly between Buyer and Seller
  - Use standard Allkons M return and refund policies
  - SP commissions may be clawed back if full refund occurs
  - Partial refunds result in proportional commission adjustment
  - Dispute does not affect SP unless refund is issued
- **Circumvention Prevention:**
  - Admin portal includes reporting mechanism for SPs to flag Sellers attempting to bypass platform
  - SPs can report Sellers who try to steal offline leads (e.g., contacting buyer directly to complete transaction outside platform)
  - Admin investigates circumvention reports
  - Penalties for Sellers found guilty of circumvention (suspension from SP program, account suspension)
  - Evidence collection: Message history, timestamps, buyer confirmation
- **Dispute Workflows:**
  - Dispute creation by SP, Buyer, or Seller
  - Dispute categorization: Fulfillment issue, Circumvention, Commission dispute, Other
  - Dispute status: Open, Under Review, Resolved, Closed
  - Admin can request additional information from parties
  - Admin decision is final and binding
  - Dispute resolution history and audit trail

### 6.13 SP Training & Support Materials

**Requirement:** Provide comprehensive training materials and onboarding support for new SPs as optional/recommended resources.

**User Value:** Helps SPs understand platform operations, best practices, and policies, leading to better service quality and higher success rates.

**Acceptance Criteria (High-Level):**
- **Training Materials:**
  - Video tutorials covering: Registration, Product search, RFQ creation, Quote comparison, Magic Link generation, Commission tracking
  - Step-by-step guides with screenshots
  - Best practices documentation
  - Do's and don'ts for SP operations
  - Sample scenarios and case studies
- **Optional Onboarding Checklist:**
  - New SPs are encouraged (but not required) to complete onboarding checklist
  - Checklist items: Watch training videos, Read policies, Complete practice RFQ, Generate test Magic Link
  - Track onboarding completion status for analytics
  - Display completion badge or indicator for SPs who complete training
- **Support Resources:**
  - FAQ section covering common questions
  - Troubleshooting guides
  - Contact support mechanism (phone, email, in-app chat)
  - Help center with searchable articles
- **Policy Documentation:**
  - SP code of conduct
  - Commission structure and payment terms
  - Dispute resolution policies
  - Platform circumvention penalties
  - Service area guidelines

## 7. Non-Functional Requirements (NFRs)

### Performance
- **Page Load Time:** SP Portal pages load in < 3 seconds
- **Search Performance:** Product search returns results in < 2 seconds
- **RFQ Submission:** RFQ submission completes in < 5 seconds
- **Magic Link Generation:** Link generation completes in < 2 seconds
- **Buyer Checkout:** Checkout flow completes in < 30 seconds (excluding payment processing time)
- **Concurrent Users:** Support 500 concurrent SPs (standard load)
- **Scalable Architecture:** Capable of handling 2,000 concurrent SPs (peak load)

### Security & Compliance
- **Authentication:** Secure authentication for SP Portal, Seller Portal, and Buyer Checkout
- **Authorization:** Role-based access control (SP, Seller, Buyer, Admin)
- **Data Encryption:** All sensitive data encrypted at rest and in transit (HTTPS/TLS)
- **KYC Document Security:** KYC documents stored securely with restricted access
- **Payment Security:** PCI DSS compliance for payment processing
- **API Security:** Magic Links use secure tokens, cannot be guessed or brute-forced
- **OWASP Top 10:** Must pass OWASP Top 10 security checklist
- **Audit Logging:** All critical operations logged (SP registration, quote creation, purchases, commission payments)

### Platform/Device
- **Responsive Web Application:** All related systems (SP Portal, Enhanced Seller Portal, Buyer O2O Checkout) must support responsive design for mobile devices (hard requirement)
- **Mobile-First Design:** Optimized for mobile devices (320px+) as SPs often work in the field
- **Touch-Friendly UI:** Large touch targets, swipe gestures, mobile-optimized forms
- **Desktop Support:** Full functionality on desktop/laptop (1280px+)
- **Tablet Support:** Optimized for tablet devices (768px+)
- **Cross-Browser Compatibility:** Chrome, Safari, Edge (latest 2 versions)
- **Mobile Browser Optimization:** Optimized for mobile Safari (iOS) and Chrome (Android)
- **Progressive Web App (PWA):** Consider PWA for offline capability and app-like experience

### Reliability & Availability
- **System Uptime:** 99.5% uptime during business hours (8 AM - 8 PM Bangkok time)
- **Graceful Degradation:** If messaging system fails, display error and suggest offline communication
- **Data Backup:** Daily backups of SP data, RFQs, quotes, and commission records
- **Disaster Recovery:** RTO < 4 hours, RPO < 1 hour

### Usability
- **Intuitive Interface:** Designed for freelance sales agents with varying technical skills
- **Thai Language:** Primary language is Thai
- **Clear Workflow:** Step-by-step guidance for SP registration, RFQ creation, and link generation
- **Visual Feedback:** Clear success/error messages, loading indicators
- **Consistent Terminology:** Aligned with [`docs/shared/glossary.md`](allkons-m-revamp/allkons-seller-platform/docs/shared/glossary.md)
- **Mobile-Friendly:** Touch-friendly UI elements, easy navigation on small screens
- **Offline Communication:** Clear guidance that SP-Buyer communication happens offline

### Integration
- **SMS Integration:** Send OTP, passwords, notifications via SMS
- **Payment Gateway:** Integration with payment providers
- **Deep Links:** Support LINE, WhatsApp deep links for sharing Magic Links
- **OGP Metadata:** Rich link previews in messaging apps

## 8. Open Questions & Assumptions

### Assumptions
- Thammasorn Co., Ltd internal sales reps are willing to act as SP supervisors
- Public freelance SPs are motivated by commission-based earnings
- Buyers are willing to create full Allkons M accounts to complete purchases (guest checkout not allowed for purchasing, but allowed for viewing)
- Sellers see value in SP-driven leads and are willing to participate
- SP-Buyer communication via phone/LINE/WhatsApp is acceptable (no in-app chat needed)
- 14-day Magic Link expiration is sufficient
- 7-day RFQ expiration is sufficient
- Monthly commission payout is acceptable for SPs
- 500 THB minimum payout threshold is acceptable
- Multiple SPs can serve the same service area (no exclusivity)
- SPs can work with any participating store in their service areas
- Commission percentage is configurable by Allkons M Admins in SP Admin Portal (not hard-coded)
- Manual KYC verification by Allkons Admin is acceptable (no automated verification in this iteration)
- Existing Allkons M buyers can purchase without KYC if not using store credit
- Buyers trust SP recommendations and are willing to purchase through Magic Links
- Authentication Center and Allkons ID modules are available for SSO integration (OAuth 2.0, Keycloak)
- Buyer accounts are pre-provisioned by the Seller via the Quote-to-CRM auto-provisioning flow (Customer Management CRM module) before the Magic Link is sent; no OTP-based self-registration step exists for buyers at the Offer Hub checkout
- Quote validity period is determined by seller in quotation (not system-enforced)
- Training materials are optional/recommended (not mandatory for SP activation)
- Digital Quotation as legal source of truth is acceptable to all parties
- Commission clawback for refunds is acceptable to SPs
- Offer Hub displaying all quotes simultaneously is technically feasible and provides good UX
- SP performance metrics, termination policies, and circumvention penalties can be deferred to next phase
- Buyer's choice for multi-seller payment sequence provides flexibility and better UX
- Manual fraud detection by admin is sufficient for this iteration (no automated fraud detection needed)
- Immediate reapplication for rejected SPs is acceptable (no cooldown period required)
- Region/Province/District cascading hierarchy data is available and accurate in the system
- HEIC to PNG conversion service/library is available and operational for iPhone image support
- PDF preview generation library/service is available and operational for document thumbnails
- Consent Center API is operational and accessible for logging SP program terms acceptance
- Consent logging is synchronous; application submission waits for Consent Center response
- Limited access control for non-approved SPs can be implemented at route/middleware level
- Delivery time validation considers deadline + 24 hours minimum lead time
- Delivery schedule with multiple rounds (max 5) is stored efficiently in database
- RFQ buyer grouping UI supports filtering and display by buyer name
- 12-store limit for RFQ submission is sufficient for competitive quote gathering

### Open Questions
1. **Commission Percentage Default:** What is the exact default commission percentage when Admin first configures the system? 5%, 10%, or other?
2. **Commission Clawback Timeline:** How long after a transaction can a refund trigger commission clawback? 30 days, 90 days, or unlimited?
3. **Session Duration:** What is the appropriate session timeout for SSO managed by Authentication Center? 24 hours, 7 days, or configurable?
4. **Quote Validity Enforcement:** Should system enforce quote expiration based on seller-provided validity period, or is it informational only?

### Questions for BSA
1. **System Architecture:** Should SP Portal be completely separate application, or subdomain of main Allkons M platform?
2. **Database Design:** Should SP data be in separate database, or shared database with logical separation?
3. **Authentication Center Integration:** What is the API contract for integrating with Authentication Center and Allkons ID? OAuth 2.0 flows, token management, session handling?
4. **Keycloak Configuration:** How should SP Portal be configured as a client in Keycloak? Realm configuration, role mapping, scope definitions?
5. **Messaging Implementation:** What technology should be used for in-app messaging? WebSockets, polling, or third-party service?
6. **Magic Link Security:** How should Magic Links be secured? JWT tokens, signed URLs, or other mechanism?
7. **Link Expiration:** How should expired links be handled? Display error, or allow SP to regenerate?
8. **Payment Integration:** Which payment gateways should be integrated? How to handle sequential multi-seller payments in Offer Hub?
9. **Commission Calculation:** Should commission be calculated in real-time or batch processed? How to handle commission clawback for refunds?
10. **Configurable Commission Engine:** How should commission rates be stored and managed? Database configuration, admin UI with validation, or configuration files?
11. **Notification System:** What notification infrastructure should be used? SMS gateway, push notification service?
12. **File Storage:** Where should KYC documents and message attachments be stored? S3, Azure Blob, or other?
13. **Search Implementation:** Should product search use ElasticSearch, database queries, or hybrid?
14. **Phased Rollout:** What is the detailed rollout plan for Phase 1, 2, and 3? Timeline and success criteria for each phase?
15. **Legacy Integration:** How should new Buyer O2O checkout integrate with existing legacy buyer platform? Routing logic, shared session via Authentication Center, or iframe embedding?
16. **Performance Optimization:** How to optimize for 500-2000 concurrent SPs? Caching, CDN, load balancing?
17. **KYC Exemption Logic:** How should system determine if buyer needs KYC? Check payment method selection, or pre-check buyer KYC status?
18. **Dispute Resolution Workflow:** What is the technical implementation for dispute management? Ticketing system, workflow engine, or custom solution?
19. **Offer Hub Responsive Layout:** How should simultaneous quote display adapt for mobile devices? Stacked vertical layout, horizontal scroll, or tabs?
20. **Commission Clawback Automation:** Should commission clawback be automatic when refund is processed, or require manual admin approval?
21. **HEIC Conversion Service:** Which library/service will be used for HEIC to PNG conversion? (e.g., Sharp, ImageMagick, cloud service?) Performance implications?
22. **PDF Preview Generation:** Which library/service for PDF to image conversion? (e.g., pdf.js, ImageMagick, Puppeteer?) Performance impact?
23. **Consent Center Integration:** What is the Consent Center API contract? Timeout handling? Retry logic? Fallback if unavailable?
24. **Region-Province-District Data:** Where is Region-Province-District mapping stored? (Database table, JSON config, or external API?)
25. **District Auto-Population:** How should district auto-population be implemented? (Database query, cached mapping, or API call?)
26. **Limited Access Middleware:** How to implement route-level access control for Pending/InfoRequested/Rejected SPs? (Middleware, guard, or decorator?)
27. **Delivery Time Validation:** How to validate delivery time is after deadline + 24 hours? (Client-side, server-side, or both?)
28. **Delivery Schedule Storage:** Should delivery rounds be stored in separate table or JSON array in RFQ table?
29. **Buyer Grouping Implementation:** How to efficiently query and group RFQs by buyer? (Indexing strategy, materialized view, or cache?)

## 9. Dependencies

| Dependency | Type | Status | Owner | Notes |
|------------|------|--------|-------|-------|
| Authentication Center Module | Internal | Ready | Auth Team | OAuth 2.0 based authentication service for SSO across all platforms |
| Allkons ID Module | Internal | Ready | Auth Team | Unified identity management using Keycloak |
| **Customer Management (B2B CRM) Module** | **Internal** | **⚪ Draft PRD** | **Product / Dev** | **Provides Quote-to-CRM inline customer creation and Shadow Account auto-provisioning; buyer accounts are pre-provisioned here before Magic Links are sent** |
| Product Management Module | Internal | Ready | Product Team | Provides product catalog for SP product discovery |
| Product Pricing Engine | Internal | In Progress | Pricing Team | Provides pricing data for quotes |
| Seller Portal (Enhanced) | Internal | In Progress | Seller Team | Requires enhancements for SP opt-in and RFQ management |
| Buyer Platform (Partial O2O Checkout) | Internal | In Progress | Buyer Team | New checkout flow for Magic Link purchases |
| SMS Gateway | External | Ready | Telecom Provider | Send OTP, passwords, notifications |
| Payment Gateway | External | Ready | Payment Provider | Process buyer payments (support multi-seller sequential payments) |
| File Storage Service (CDN) | Infrastructure | Ready | DevOps Team | Store KYC documents and message attachments |
| Messaging Infrastructure | Infrastructure | In Progress | DevOps Team | Real-time messaging between SP and Seller |
| Notification Service | Infrastructure | In Progress | DevOps Team | Push notifications, email notifications |
| Design System Components | Internal | Ready | UX Team | UI components for consistent design (must support responsive mobile) |
| Consent Center API | Internal | Ready | Compliance Team | Logs user consent for SP program terms and conditions |
| HEIC Conversion Service | Infrastructure | Ready | DevOps Team | Converts iPhone HEIC images to PNG format |
| PDF Processing Service | Infrastructure | Ready | DevOps Team | Generates preview thumbnails from PDF documents |
| API Gateway | Infrastructure | Ready | DevOps Team | API routing and rate limiting |
| Monitoring & Logging Service | Infrastructure | Ready | DevOps Team | Application monitoring and error tracking |

---

## Next Steps for BSA

After PO approval of this PRD, the BSA should:

1. **Review and Validate:** Ensure all product requirements are clear and testable, with emphasis on multi-platform integration (SP Portal, Seller Portal, Buyer Checkout)
2. **Create BRD:** Break down requirements into Epics and User Stories with detailed acceptance criteria
3. **Technical Specification:** Work with Tech Lead to define:
   - SP Portal architecture (standalone vs. integrated)
   - Database design for SP data, RFQs, quotes, commissions
   - Messaging system implementation
   - Magic Link security and generation mechanism
   - Multi-seller checkout flow
   - Commission calculation and payment processing
4. **Coordinate with Multiple Teams:**
   - **Seller Team:** Define enhancements needed for SP opt-in and RFQ management
   - **Buyer Team:** Define partial O2O checkout flow and integration with legacy platform
   - **Pricing Team:** Define API for retrieving pricing data for quotes
   - **Product Team:** Define API for product discovery and search
5. **Answer Open Questions:** Collaborate with stakeholders to resolve open questions and document decisions
6. **Define API Contracts:** Specify API endpoints for:
   - SP Portal ↔ Seller Portal integration (RFQ submission, quote retrieval)
   - SP Portal ↔ Buyer Checkout integration (Magic Link data)
   - SP Portal ↔ Product Management (product search)
   - SP Portal ↔ Pricing Engine (pricing data)
7. **Phased Rollout Planning:** Create detailed plan for:
   - Phase 1: Build standalone SP site + Enhanced Seller site + Partial Buyer O2O checkout
   - Phase 2: Pilot rollout to selected branches
   - Phase 3: Integration with legacy buyer platform for Magic Link routing
8. **Create Test Scenarios:** Define comprehensive test cases for SIT, including:
   - End-to-end SP workflow (registration → RFQ → quote → Magic Link → buyer purchase)
   - Multi-seller checkout scenarios
   - Commission calculation accuracy
   - Messaging system reliability
   - Magic Link security and expiration
9. **Estimate Effort:** Provide effort estimates for each Epic to validate Q3 2026 timeline
10. **Identify Risks:** Document technical risks and mitigation strategies, especially around:
   - Multi-platform integration complexity
   - Legacy buyer platform integration
   - Payment processing for multi-seller transactions
   - Messaging system scalability
   - Commission calculation accuracy

---

**End of PRD**