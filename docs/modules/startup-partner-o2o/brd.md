# Business Requirements Document (BRD)
**Module**: Startup Partner O2O (Offline-to-Online)

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-03-26 | BSA | Prototype validation updates: LINE OA notifications (replacing SMS), mandatory training/certification before live selling (EPIC-14 full detail), AI text-based product sourcing, manual entry without SKU match, public RFQs, favorite stores (inline + settings), buyer info privacy (name/phone not shared with seller), QT delivery/unloading/partial-purchase flags, AI best combination recommendation, price breakdown, buyer-centric RFQ view, admin training progress visibility, commission policy approval workflow, EPIC-15 User Management & Role/Permission system |
| 1.9 | 2024-03-22 | BSA | Expanded Allkons Admin scope for SP Commission Management: Added 7 new admin user stories (US-17J to US-17P) for comprehensive commission domain management; US-17J: Admin Manage Commission Policies with Global/Category/Seller/Seller+Category/SP Tier/Campaign scopes; US-17K: Admin Configure Category-Based Commission Rules; US-17L: Admin Configure Seller-Based Commission Rules; US-17M: Admin Monitor Fee Collection and Commission Lifecycle; US-17N: Admin Manage Payout Batches; US-17O: Admin Handle Commission Exceptions; US-17P: Admin Review Commission Audit Logs; Added 50 new business rules (BR-221 to BR-270) covering policy management, rule precedence (Campaign/Override → Seller+Category → Category → Seller → SP Tier → Global), conflict detection, fee-to-commission monitoring, payout batch management, exception handling, role-based admin access, audit governance; Added 23 new functional requirements (FR-098 to FR-120); Added 3 new data models (CommissionPolicy, PayoutBatch, CommissionAuditLog) with 4 new enums (PolicyType, ScopeType, PayoutBatchStatus, AuditActionType); Defined 5 admin roles (Commission Viewer, Commission Manager, Payout Manager, Finance Admin, Super Admin) with permission matrix; Documented admin menu structure for Commission Management with Dashboard, Policy Setup, Fee Monitoring, Commission Monitoring, Payout Batches, Exceptions & Adjustments, Audit Logs; Added 7 new open questions and 6 new assumptions for commission policy operations; Updated EPIC-11 scope and success criteria to include admin capabilities; Seller Sales Commission remains out of functional display scope |
| 1.8 | 2024-03-22 | BSA | Complete redesign of EPIC-11 (SP Commission Management & Payout): Replaced US-17, US-18, US-18A with 9 new user stories (US-17A to US-17I); Clear separation of SP Commission (in scope) from Seller Sales Commission (out of scope); Commission calculated from Platform Fee only (2% of order), not Payment Fee; Implemented 3-layer transaction model (Buyer↔Seller, Seller↔Allkons, Allkons↔SP); Fee collection dependency: commission confirmed only after Platform Fee collected; 5 THB withdrawal fee per payout; Comprehensive status model: Order (Ordered, Delivering, Completed, Cancelled, Refunded), Fee (Not Calculated, Calculated, Invoiced, Collection Pending, Collected, Failed, Waived), Commission (Not Eligible, Estimated, Awaiting Fee Collection, Confirmed, Ready for Payout, Processing, Paid, Failed, Reversed); Separated Orders and Commissions menus; Commission visibility restricted in product discovery; Added 42 new business rules (BR-179 to BR-220); Replaced FR-076-078 and added FR-082-097 (16 new FRs); Added 4 new data models (CommissionSourceRecord, FeeCollectionRecord, CommissionPayoutRecord, CommissionAdjustment) with enums (FeeCollectionStatus, CommissionStatus); Added Fee Management System dependency; Role-based access (SP, SP Leader read-only, Admin full); Added commission domain assumptions and open questions |
| 1.7 | 2024-03-22 | BSA | Added comprehensive Admin, SP, and Buyer enhancements: CIS integration for application review (US-06A); Region/Province/District service area management; Supervisor assignment; Individual SP network management (US-06B); SP Leader transaction visibility (US-19A); Buyer Magic Link modification before approval (US-13A); Multi-seller payment separation clarification; Enhanced SP registration with SMS/Email notifications, login-required status checking, and limited access before approval; Topic-based threaded communication (US-12); SP transaction/order visibility after payment (US-18A); Added 42 new business rules (BR-137 to BR-178); Added 9 new functional requirements (FR-076 to FR-084); Updated data models for StartupPartner (region, province, district, supervisorId, suspensionReason), MagicLink (lastModifiedBy, lastModifiedByName, lastModifiedAt, buyerModifiedSelection), WorkArea interface; Added CIS integration dependency; Enhanced access control for SP statuses (Pending, InfoRequested, Approved, Rejected, Suspended) |
| 1.6 | 2024-03-22 | BSA | Added Quote Management with Hybrid Approach: Individual quote detail view (US-11A) and centralized quote management dashboard (US-11B); Updated EPIC-07 scope to include quote detail view, quote management dashboard, filtering/sorting, and cross-RFQ tracking; Added 7 new business rules (BR-074 to BR-080); Added 5 new functional requirements (FR-071 to FR-075); Added 5 UX Designer questions (Q42-Q46) and 5 Developer questions (Q63-Q67) for Quote Management implementation |
| 1.5 | 2024-03-22 | BSA | Added AI-powered product acquisition: Manual search (US-10D), AI image analysis (US-10E), hybrid workflow (US-10F); Added buyer type classification (INDIVIDUAL/CORPORATE); Added comprehensive tax invoice information capture with auto-population; Added 34 new business rules (BR-103 to BR-136); Added 21 new functional requirements (FR-050 to FR-070); Added AIProductExtraction, ProductSourceType, BuyerType, TaxInvoiceAddressOption, and TaxInvoiceInfo data models; Added API contracts for product search and AI extraction; Added Dependencies section with AI vendor and Elasticsearch; Added 14 new assumptions, 16 new open questions, 11 new UX questions, and 14 new developer questions; Updated Business Glossary with 13 new terms |
| 1.4 | 2024-03-22 | BSA | Updated to align with PRD v1.5: Added buyer-centric, round-based workflows; Enhanced RFQ commercial fields (project info, payment method including store credit with approval, delivery type/address/time slot, contact info, tax invoice requirement, additional notes); Improved store selection with location-based filtering and favorite stores management; Updated data models to support all enhanced fields; Added comprehensive business rules, validation rules, and acceptance criteria for all new features |
| 1.3 | 2024-03-20 | BSA | Added EPIC-14 for SP training and support; Enhanced buyer onboarding with Shadow Account auto-provisioning via CRM module; Updated checkout flow with decoupled multi-seller support; Refined commission tracking with clawback mechanism |
| 1.2 | 2024-03-15 | BSA | Added EPIC-12 for SP hierarchy (Leader-Member); Enhanced dispute resolution with circumvention reporting; Updated RFQ creation with buyer grouping |
| 1.1 | 2024-03-10 | BSA | Added EPIC-11 for commission tracking; Enhanced Magic Link generation with 14-day expiration; Updated quote comparison with multi-seller selection |
| 1.0 | 2024-03-01 | BSA | Initial draft with core epics (SSO, SP registration, product discovery, RFQ creation, quote comparison, buyer onboarding, checkout) |

> **💡 When updating:** Change Status to 🟢 Final / Approved ONLY AFTER explicit approval.

**PRD Reference:** `docs/modules/startup-partner-o2o/startup-partner-o2o prd.md` (Status: 🟢 Final / Approved v1.5)

---

## Epic List

| Epic ID | Epic Name | PRD Section | Priority | Description |
|---------|-----------|-------------|----------|-------------|
| EPIC-01 | Single Sign-On (SSO) & Unified Authentication | §6.1 | P0 | Integrate with Authentication Center and Allkons ID for unified auth across all platforms |
| EPIC-02 | SP Registration & Onboarding | §6.2 | P0 | Standalone SP Portal for public freelance sales agent registration with KYC |
| EPIC-03 | Admin SP Management | §6.2 | P0 | Admin portal for reviewing, approving, and managing SP applications and network |
| EPIC-04 | Seller Opt-In & Configuration | §6.3 | P1 | Enable stores/branches to opt-in to SP program and configure settings |
| EPIC-05 | Product Discovery & Sourcing | §6.4 | P1 | Enable SPs to search and discover products from stores in their service areas and manage favorite stores |
| EPIC-06 | RFQ Creation & Management | §6.5 | P1 | Enable SPs to create buyer-centric, round-based RFQs with comprehensive commercial, delivery, and contact information to multiple stores |
| EPIC-07 | Quote Comparison & Selection | §6.6 | P1 | Display side-by-side quote comparison for SPs to select best combination |
| EPIC-08 | In-App SP-to-Seller Communication | §6.7 | P1 | Messaging system between SP and Store Sales rep for negotiation |
| EPIC-09 | Magic Link Offer Generation | §6.8 | P0 | Generate shareable web links containing compared quotes for buyers |
| EPIC-10 | Buyer O2O Checkout Flow | §6.9 | P0 | Streamlined Offer Hub checkout with auto-provisioned Shadow Accounts and KYC exemption |
| EPIC-11 | Commission Tracking & Payment | §6.10 | P0 | Configurable commission engine with tracking and payment processing |
| EPIC-12 | SP Hierarchy Management | §6.11 | P1 | Support 2-level hierarchy with Leaders supervising Members |
| EPIC-13 | Dispute Resolution & Platform Mediation | §6.12 | P1 | Dispute resolution workflows with Admin as mediator |
| EPIC-14 | SP Training & Certification | §6.13 | P0 | Mandatory training modules, knowledge assessments, workflow simulations, and certification before live selling access |
| EPIC-15 | User Management & Role/Permission | §6.14 | P1 | Super Admin user management, role & permission configuration, and role-based access enforcement across portal |

---

## Epics & User Stories

### EPIC-01: Single Sign-On (SSO) & Unified Authentication

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-01 |
| **Goal** | Provide seamless authentication across all Allkons M platforms (SP Portal, Buyer Portal, Seller Portal, Admin Portal) using OAuth 2.0 and Keycloak |
| **Scope** | Integration with Authentication Center and Allkons ID modules, single credential management, cross-platform session management, profile synchronization |
| **Out of Scope** | Multi-factor authentication (MFA), biometric authentication, social login (Google, Facebook) |
| **Success Criteria** | Users can login once and access all authorized platforms without re-authentication; session timeout managed centrally; profile updates sync across platforms |
| **Maps to** | FR-001, FR-002, FR-003, FR-004 |

#### US-01: User Single Sign-On Across Platforms
**As a** user (SP/Buyer/Seller/Admin), **I want to** login once and access all authorized Allkons M platforms without re-authentication, **so that** I have a seamless experience across the ecosystem.

**Preconditions:**
- Authentication Center and Allkons ID modules are operational
- User has valid credentials (phone number + password)
- User has appropriate role assignments in Keycloak

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-001 | Users must have one credential (phone number + password) across all Allkons M systems | P0 |
| BR-002 | Login via Authentication Center grants access to all authorized platforms based on Keycloak roles | P0 |
| BR-003 | Session token is OAuth 2.0 compliant and valid across all platforms | P0 |
| BR-004 | Session timeout is configurable by Authentication Center (default: 24 hours) | P1 |
| BR-005 | Logout from one platform logs out from all platforms via Authentication Center | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Phone Number | Must be 10 digits, Thai format (0X-XXXX-XXXX) | กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (10 หลัก) |
| Password | Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number | รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | User is not logged in | User enters valid credentials in SP Portal | User is authenticated via Authentication Center and redirected to SP Portal dashboard |
| AC-02 | User is logged in to SP Portal | User navigates to Seller Portal URL | User is automatically authenticated and sees Seller Portal (if authorized) without re-login |
| AC-03 | User is logged in to multiple platforms | User clicks logout in any platform | User is logged out from all platforms and redirected to login page |
| AC-04 | User session is active | Session timeout period expires | User is automatically logged out from all platforms and must re-authenticate |
| AC-05 | User has "Remember Me" enabled | User closes browser and reopens | User session persists and user remains logged in across platforms |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-01 | User tries to access platform without appropriate Keycloak role | Display error "คุณไม่มีสิทธิ์เข้าถึงระบบนี้ กรุณาติดต่อผู้ดูแลระบบ" and redirect to login |
| EC-02 | Authentication Center is temporarily unavailable | Display error "ระบบไม่สามารถเชื่อมต่อได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" with retry option |
| EC-03 | User changes password in one platform | Password change syncs to Authentication Center and applies to all platforms immediately |
| EC-04 | Concurrent login from different devices | Both sessions remain active; logout from one device does not affect other device session |
| EC-05 | OAuth token expires during active session | System automatically refreshes token transparently without user interruption |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Invalid credentials | Wrong phone/password | ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง | Allow retry, show "Forgot Password" link |
| Account blocked | User account suspended | บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ | Contact support |
| Session expired | Timeout reached | เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง | Redirect to login page |
| OAuth error | Token validation fails | เกิดข้อผิดพลาดในการยืนยันตัวตน กรุณาเข้าสู่ระบบใหม่ | Force re-login |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|
| Loading | Authentication in progress | Show loading spinner with "กำลังเข้าสู่ระบบ..." |
| Success | Authentication successful | Redirect to target platform dashboard |
| Error | Authentication fails | Display error message with retry option |
| Logged Out | User logs out or session expires | Clear all session data, redirect to login page |

#### US-02: Existing User Registration for SP Program
**As an** existing Allkons M user (Buyer or Seller), **I want to** register for the SP program using my existing credentials, **so that** I don't need to create a new account.

**Preconditions:**
- User has existing Allkons M account with verified phone number
- User is logged in via Allkons ID
- SP program registration is open

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-006 | Existing users can register for SP program using their Allkons ID credentials | P0 |
| BR-007 | System recognizes existing user via Allkons ID and links SP profile to existing account | P0 |
| BR-008 | No need to create new password; existing password is used | P0 |
| BR-009 | User profile managed centrally by Allkons ID; updates sync across all platforms | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Phone Number | Must match existing Allkons ID account | หมายเลขโทรศัพท์นี้ไม่ตรงกับบัญชีที่เข้าสู่ระบบ |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-06 | Existing user is logged in | User navigates to SP registration page | System pre-fills phone number and name from Allkons ID profile |
| AC-07 | Existing user submits SP application | User completes KYC and service area selection | SP profile is linked to existing Allkons ID account without creating new credentials |
| AC-08 | SP application is approved | Admin approves application | User can access SP Portal using existing Allkons ID credentials |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-06 | User already has SP profile | Display message "คุณมีบัญชี Startup Partner อยู่แล้ว" and redirect to SP Portal |
| EC-07 | User updates profile in Buyer Portal | Changes sync to Allkons ID and reflect in SP Portal immediately |
| EC-08 | User has multiple ORGs in Buyer/Seller role | SP profile is independent; user can switch between roles seamlessly |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Profile sync failure | Allkons ID unavailable | ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง | Retry button |
| Duplicate SP application | User already applied | คุณได้ยื่นใบสมัครแล้ว กรุณารอการอนุมัติ | Redirect to application status page |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|
| Loading | Fetching profile from Allkons ID | Show skeleton loader for form fields |
| Success | Profile loaded | Display pre-filled form with user data |
| Error | Profile fetch fails | Show error message with retry option |

---

### EPIC-02: SP Registration & Onboarding

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-02 |
| **Goal** | Provide standalone SP Portal for public freelance sales agents to register, submit KYC documents, and select service areas |
| **Scope** | Registration form, KYC document upload, OTP verification, service area selection, target shops selection, auto-generated password, application submission and tracking |
| **Out of Scope** | Automated KYC verification, video KYC, in-person verification, multi-language support |
| **Success Criteria** | Public users can complete SP registration in under 10 minutes; KYC documents uploaded successfully; application submitted for admin review |
| **Maps to** | FR-005, FR-006, FR-007, FR-008, FR-009 |

#### US-03: Public SP Registration with KYC
**As a** public freelance sales agent, **I want to** register as a Startup Partner by submitting my information and KYC documents, **so that** I can start earning commissions by connecting buyers with sellers.

**Preconditions:**
- User has valid Thai ID card
- User has bank account
- User has smartphone with camera for selfie
- SP program registration is open

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-010 | Phone number is primary identifier and becomes username | P0 |
| BR-011 | OTP must be verified before registration proceeds | P0 |
| BR-012 | OTP is 6 digits, expires in 3 minutes, maximum 5 attempts | P0 |
| BR-013 | ID card number must be 13 digits and unique in system | P0 |
| BR-014 | Service area selection uses Region → Province → District hierarchy | P0 |
| BR-015 | User selects Region (ภาค) first; system auto-populates all provinces in that region | P0 |
| BR-016 | User can select specific provinces; system auto-populates all districts in selected provinces | P0 |
| BR-017 | Database stores district-level service areas for granular control | P0 |
| BR-018 | Admin can adjust district-level scope after approval (EPIC-03 US-06) | P1 |
| BR-019 | Target shops selection is optional; only shops that opted-in to SP Program (US-08) are shown | P1 |
| BR-020 | Shop list filtered by: (1) Opted-in to SP Program, (2) Located in SP's selected service areas | P0 |
| BR-021 | All 3 KYC documents (ID card front/back, selfie with ID) are mandatory | P0 |
| BR-022 | Each KYC document must be JPG/PNG/HEIC/PDF, max 10MB | P0 |
| BR-023 | System auto-converts HEIC files to PNG format for storage | P0 |
| BR-024 | System generates preview images from PDF files (first page thumbnail); stores original PDF | P0 |
| BR-025 | User can preview uploaded files before submission | P0 |
| BR-026 | System auto-generates secure password and sends via LINE OA notification (with SMS as fallback) after approval | P0 |
| BR-027 | SP program terms and conditions must be accepted before submission | P0 |
| BR-028 | System logs consent to Consent Center API with timestamp, user ID, consent type, IP address | P0 |
| BR-029 | Consent Center API must respond successfully before application submission completes | P0 |
| BR-271 | SP must complete mandatory training and certification before accessing live selling features (RFQ creation, seller messaging, Magic Link generation) | P0 |
| BR-272 | Non-certified SPs can access portal in demo/read-only mode only | P0 |
| BR-273 | Training completion status must be tracked and visible in SP profile | P0 |
| BR-274 | All status change notifications (submitted, approved, rejected, info requested) must be sent via LINE OA as primary channel | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Phone Number | 10 digits, Thai format, not already registered | กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (10 หลัก) |
| OTP | 6 digits, must match sent code | OTP ไม่ถูกต้อง กรุณากรอกใหม่ (เหลือ N ครั้ง) |
| First Name | Required, Thai characters only, max 100 chars | กรุณากรอกชื่อ (ภาษาไทยเท่านั้น) |
| Last Name | Required, Thai characters only, max 100 chars | กรุณากรอกนามสกุล (ภาษาไทยเท่านั้น) |
| Email | Valid email format, max 255 chars | กรุณากรอกอีเมลให้ถูกต้อง |
| ID Card Number | Exactly 13 digits, unique | กรุณากรอกเลขบัตรประชาชน 13 หลัก |
| Region | At least 1 region required | กรุณาเลือกภูมิภาคอย่างน้อย 1 ภาค |
| Province | At least 1 province in selected region required | กรุณาเลือกจังหวัดอย่างน้อย 1 จังหวัด |
| KYC Documents | JPG/PNG/HEIC/PDF, max 10MB each, all 3 required, auto-convert HEIC to PNG, auto-generate PDF preview | กรุณาอัปโหลดเอกสารให้ครบถ้วน (รูปภาพ JPG/PNG/HEIC/PDF ขนาดไม่เกิน 10MB) |
| Terms Consent | Must be checked, logged to Consent Center API | กรุณายอมรับเงื่อนไขการให้บริการ |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-09 | User is on SP registration page | User enters phone number and clicks "ถัดไป" | System sends 6-digit OTP via SMS and shows OTP input screen |
| AC-10 | OTP sent to user | User enters correct OTP within 3 minutes | System verifies OTP and proceeds to personal info form |
| AC-11 | User completes personal info form | User fills all required fields and uploads 3 KYC documents | System validates all fields, shows file previews, and enables "ยืนยัน" button |
| AC-11a | User uploads HEIC file | User selects HEIC image from iPhone | System shows preview and auto-converts to PNG on upload |
| AC-12 | User selects service areas | User selects at least 1 region | System auto-populates all provinces in that region |
| AC-12b | User selects provinces | User selects at least 1 province from region | System auto-populates all districts in selected provinces |
| AC-12a | User views target shops | User clicks "เลือกร้านค้า" | System displays only shops that opted-in to SP Program in selected service areas |
| AC-13 | User accepts terms and submits | User checks terms consent and clicks "ยืนยัน" | System logs consent to Consent Center API, creates application with status "Pending", displays application ID, and shows status tracking page |
| AC-14 | Application submitted successfully | System processes submission | User receives LINE OA notification (with SMS as fallback) confirmation with application ID |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-09 | User enters OTP incorrectly 5 times | Block OTP verification for 24 hours, display "คุณกรอก OTP ผิดเกินจำนวนที่กำหนด กรุณาลองใหม่อีกครั้งใน 24 ชั่วโมง" |
| EC-10 | User uploads image larger than 10MB | Display error "ไฟล์มีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ขนาดไม่เกิน 10MB" and prevent upload |
| EC-11 | User tries to register with duplicate ID card number | Display error "เลขบัตรประชาชนนี้ถูกใช้สมัครแล้ว กรุณาติดต่อผู้ดูแลระบบ" |
| EC-12 | User closes browser during registration | System saves progress; user can resume from last completed step when returning |
| EC-13 | User uploads non-supported file (DOCX, XLS) | Display error "กรุณาอัปโหลดไฟล์รูปภาพหรือ PDF (JPG, PNG, HEIC, PDF) เท่านั้น" |
| EC-14 | HEIC conversion fails | Display error "ไม่สามารถแปลงไฟล์ได้ กรุณาลองใหม่หรือใช้ไฟล์ JPG/PNG" and allow retry |
| EC-14a | PDF preview generation fails | Display error "ไม่สามารถสร้างตัวอย่างไฟล์ PDF ได้ กรุณาลองใหม่" but allow submission with original PDF |
| EC-14b | Corrupted PDF file uploaded | Display error "ไฟล์ PDF เสียหาย กรุณาอัปโหลดไฟล์ใหม่" and prevent upload |
| EC-15 | No shops opted-in in selected service area | Display "ยังไม่มีร้านค้าในพื้นที่นี้เข้าร่วมโปรแกรม SP" in target shops section |
| EC-15a | Region selected has no provinces with opted-in shops | Display "ยังไม่มีร้านค้าในภูมิภาคนี้เข้าร่วมโปรแกรม SP" |
| EC-16 | Consent Center API fails | Display error "ไม่สามารถบันทึกการยอมรับเงื่อนไขได้ กรุณาลองใหม่" and prevent submission |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| OTP send failure | SMS gateway error | ไม่สามารถส่ง OTP ได้ กรุณาลองใหม่อีกครั้ง | Retry button |
| File upload failure | Network error during upload | การอัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่ | Retry upload |
| Submission failure | Server error | ไม่สามารถส่งใบสมัครได้ กรุณาลองใหม่ภายหลัง | Save draft, allow retry |
| HEIC conversion failure | Image processing error | ไม่สามารถแปลงไฟล์ได้ กรุณาลองใหม่หรือใช้ไฟล์ JPG/PNG | Allow retry or file replacement |
| PDF preview generation failure | PDF processing error | ไม่สามารถสร้างตัวอย่างไฟล์ PDF ได้ | Allow submission with original PDF, log warning |
| Corrupted PDF file | Invalid PDF format | ไฟล์ PDF เสียหาย กรุณาอัปโหลดไฟล์ใหม่ | Reject upload, allow retry |
| Consent Center API failure | API unavailable or timeout | ไม่สามารถบันทึกการยอมรับเงื่อนไขได้ กรุณาลองใหม่ | Retry consent logging |
| Duplicate phone | Phone already registered | เบอร์โทรศัพท์นี้ถูกใช้สมัครแล้ว กรุณาใช้เบอร์อื่น | Clear form, allow new entry |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|
| Loading | OTP sending, file uploading, form submitting | Show loading spinner with appropriate message |
| Empty | Initial form load | Show empty form with placeholders |
| Success | Application submitted | Show success message with application ID and "ตรวจสอบสถานะ" button |
| Error | Validation fails or submission error | Highlight error fields with red border and show error messages |

#### US-04: Application Status Tracking
**As an** SP applicant, **I want to** track my application status and view admin feedback, **so that** I know the progress and can take action if needed.

**Preconditions:**
- User has submitted SP application
- User has application ID

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-028 | Application status can be: Pending, InfoRequested, Approved, Rejected, Suspended | P0 |
| BR-029 | Application status tracking requires login (no public status checking) | P0 |
| BR-030 | Pending/InfoRequested/Rejected SPs can login but cannot access main SP Portal functions | P0 |
| BR-031 | Pending/InfoRequested/Rejected SPs can only access: Application Status page, Profile view, Document view, Logout | P0 |
| BR-032 | If status is "InfoRequested", user can edit application data and documents, then resubmit | P0 |
| BR-033 | Resubmission changes status from InfoRequested back to Pending for Admin review | P0 |
| BR-034 | If status is "Rejected", user can view rejection reason and reapply with new application | P0 |
| BR-035 | Admin feedback is displayed for "InfoRequested" and "Rejected" statuses | P0 |
| BR-163 | Application status tracking must require login | P0 |
| BR-164 | Logged-in applicant should see status, feedback, and requested actions | P0 |
| BR-165 | Only approved SPs may access full SP operational modules | P0 |
| BR-166 | Pending/Info Requested applicants may only access application follow-up features | P0 |
| BR-167 | Limited-access users cannot access RFQ creation, product search, quote comparison, Magic Link generation | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Application ID | Required, must exist in system | ไม่พบใบสมัครนี้ กรุณาตรวจสอบหมายเลขอีกครั้ง |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-15 | User has application ID | User enters application ID on status page | System displays current status and timeline |
| AC-16 | Application status is "Pending" | User logs in and views status | Display "รอการตรวจสอบ" with estimated review time (< 48 hours) |
| AC-16a | SP status is Pending | SP logs in | System redirects to Application Status page only, disables main portal navigation |
| AC-17 | Application status is "InfoRequested" | User logs in and views status | Display admin message with reason and "แก้ไขข้อมูล" button, send LINE OA notification (with SMS as fallback) and Email notification |
| AC-17a | User clicks "แก้ไขข้อมูล" | User edits application | System pre-fills previous data, allows editing all fields and documents |
| AC-17b | User updates info and resubmits | User clicks "ส่งใบสมัครอีกครั้ง" | System changes status to Pending, notifies Admin, displays "ส่งใบสมัครอีกครั้งสำเร็จ" |
| AC-18 | Application status is "Approved" | User logs in and views status | Display "อนุมัติแล้ว" with credentials sent via LINE OA notification (with SMS as fallback) and Email, enable full portal access |
| AC-19 | Application status is "Rejected" | User logs in and views status | Display rejection reason via LINE OA notification (with SMS as fallback) and Email, allow viewing application data and documents, show "สมัครใหม่" button |
| AC-71 | Application approved | Admin approves | SP receives LINE OA notification (with SMS as fallback) and Email notification with credentials |
| AC-72 | Application rejected | Admin rejects | SP receives LINE OA notification (with SMS as fallback) and Email with rejection reason |
| AC-73 | Applicant logs in | Applicant accesses portal | System displays application status dashboard |
| AC-74 | Anonymous user tries to check status | User attempts status check without login | System redirects to login page |
| AC-75 | Pending applicant logs in | Applicant accesses portal | Can only access application status and resubmission, no RFQ/product search access |
| AC-76 | Pending applicant tries to create RFQ | Applicant clicks RFQ menu | System denies with "กรุณารอการอนุมัติใบสมัครก่อนใช้งาน" message |
| AC-77 | Approved SP logs in | SP accesses portal | Full access to all SP Portal features |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-17 | User checks status multiple times per day | System allows unlimited status checks without throttling |
| EC-18 | Admin requests info after 24 hours | User receives LINE OA notification (with SMS as fallback) with link to status page |
| EC-19 | User edits application after info request | Previous submission data is pre-filled; user can modify and resubmit |
| EC-20 | Pending SP tries to access RFQ creation | System blocks access, displays "กรุณารอการอนุมัติใบสมัครก่อนใช้งาน" |
| EC-21 | User resubmits without making changes | System allows resubmission, notifies Admin for re-review |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Invalid application ID | ID not found | ไม่พบใบสมัครนี้ กรุณาตรวจสอบหมายเลขอีกครั้ง | Allow re-entry |
| Status fetch failure | Server error | ไม่สามารถโหลดสถานะได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|
| Loading | Fetching status | Show loading spinner |
| Success | Status loaded | Display status timeline with current step highlighted |
| Error | Fetch fails | Show error message with retry option |

---

### EPIC-03: Admin SP Management

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-03 |
| **Goal** | Enable Allkons M admins to review, approve, reject, or request additional information from SP applications, and manage the SP network |
| **Scope** | Application review dashboard with CIS integration, KYC document verification, admin actions (approve/reject/request info), service area assignment (Region/Province/District), supervisor assignment, individual SP network management (edit work area, suspend access), fraud detection, Thammasorn SP auto-provisioning |
| **Out of Scope** | Automated KYC verification, AI-powered fraud detection, bulk approval operations |
| **Success Criteria** | Admins can review and approve SP applications in under 10 minutes with CIS data context; manual KYC verification completed; SP network health monitored; individual SP records manageable |
| **Maps to** | FR-010, FR-011, FR-012, FR-013, FR-014, FR-079, FR-080, FR-081 |

#### US-05: Admin Review SP Applications
**As an** Allkons M admin, **I want to** review SP applications and verify KYC documents, **so that** I can ensure quality control and prevent fraud.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "SP Manager" role
- SP applications exist in "Pending" status

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-025 | Admin must manually review and verify all 3 KYC documents (ID card, bank book, selfie with ID) | P0 |
| BR-026 | Admin must verify ID card number is not duplicate in system | P0 |
| BR-027 | Admin can approve, reject, or request additional info | P0 |
| BR-028 | When approved, system auto-generates password and sends via LINE OA notification (with SMS as fallback) | P0 |
| BR-029 | When rejected, admin must provide rejection reason | P0 |
| BR-030 | When requesting info, admin must specify what is needed | P0 |
| BR-031 | Rejected SPs can reapply immediately (no cooldown period) | P0 |
| BR-032 | Manual fraud detection and review (no automated fraud detection in this iteration) | P0 |
| BR-140 | Service area assignment must support Region/Province/District 3-level hierarchy | P0 |
| BR-141 | Admin must be able to assign or update service area at all three levels during approval | P0 |
| BR-142 | Service area assignment applies during approval and later profile management | P0 |
| BR-143 | Admin must be able to assign Supervisor to SP during approval | P1 |
| BR-144 | Supervisor assignment must be editable later by Admin | P1 |
| BR-275 | Admin must see SP training/certification progress in application review and SP detail views | P0 |
| BR-276 | Admin receives LINE OA notification when new SP application is submitted | P1 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Rejection Reason | Required when rejecting, max 500 chars | กรุณาระบุเหตุผลในการปฏิเสธ |
| Info Request Message | Required when requesting info, max 500 chars | กรุณาระบุข้อมูลที่ต้องการเพิ่มเติม |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-20 | Admin is on application review dashboard | Admin views pending applications | System displays list of pending applications with filters (Status, Date, Service Area, Application ID) |
| AC-21 | Admin clicks on application | Admin views application detail | System displays all application info, uploaded KYC documents (viewable), and action buttons |
| AC-22 | Admin verifies KYC documents | Admin reviews ID card, bank book, selfie | Admin can zoom, download documents for verification |
| AC-23 | Admin approves application | Admin clicks "อนุมัติ", assigns service area (Region/Province/District), optionally assigns Supervisor, confirms | System generates credentials, sends LINE OA notification (with SMS as fallback) with username/password, updates status to "Approved", enables full portal access |
| AC-24 | Admin rejects application | Admin clicks "ปฏิเสธ", enters reason, confirms | System updates status to "Rejected", sends LINE OA notification (with SMS as fallback) with reason, allows SP to reapply |
| AC-25 | Admin requests additional info | Admin clicks "ขอข้อมูลเพิ่มเติม", specifies requirements, confirms | System updates status to "InfoRequested", sends LINE OA notification (with SMS as fallback), allows applicant to edit and resubmit |
| AC-57 | Admin assigns service area | Admin selects Region → Province → District hierarchy | System validates and saves 3-level service area assignment |
| AC-58 | Admin assigns Supervisor | Admin selects Supervisor from dropdown during approval | System assigns Supervisor and notifies both SP and Supervisor |
| AC-58a | Admin reviews SP application | Admin views application detail | System displays training progress section showing: modules completed, assessments passed, certification status |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-17 | Admin finds duplicate ID card number | System highlights duplicate warning; admin can flag for fraud investigation |
| EC-18 | KYC documents appear fraudulent (photoshopped) | Admin can flag application for fraud investigation and reject with reason |
| EC-19 | Admin accidentally approves wrong application | Admin can suspend SP account immediately and contact applicant |
| EC-20 | Multiple admins review same application concurrently | System uses optimistic locking; first admin action wins, second admin sees "ใบสมัครนี้ถูกดำเนินการแล้ว" |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Approval failure | SMS gateway error | ไม่สามารถส่ง SMS ได้ กรุณาลองใหม่ | Retry approval |
| Concurrent update | Another admin updated | ใบสมัครนี้ถูกดำเนินการแล้ว กรุณารีเฟรชหน้า | Refresh page |
| Document load failure | File storage error | ไม่สามารถโหลดเอกสารได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|
| Loading | Fetching applications or documents | Show loading spinner |
| Empty | No pending applications | Display "ไม่มีใบสมัครรอตรวจสอบ" with icon |
| Success | Applications loaded | Display list with filters and search |
| Error | Fetch fails | Show error message with retry option |

#### US-06A: Admin Review Application with CIS Integration
**As an** Allkons M admin, **I want to** view applicant's existing CIS data alongside new application data, **so that** I can make informed decisions based on complete user history.

**Preconditions:**
- Admin is reviewing SP application
- CIS integration is available
- Applicant may have existing account in CIS

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-137 | System must integrate with CIS to retrieve existing account and user profile data | P0 |
| BR-138 | System must display previously available user information including KYC and bank account data | P0 |
| BR-139 | Admin must be able to review both new application data and historical CIS data in one context | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-54 | Admin reviews application | Admin opens application detail | System retrieves and displays CIS account data if exists |
| AC-55 | CIS data available | Admin views application | System shows previously stored KYC documents, bank information, and account history |
| AC-56 | Admin compares data | Admin reviews both datasets | Admin can compare new application data with existing CIS records side-by-side |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-24 | No CIS data exists for applicant | Display "ไม่พบข้อมูลในระบบ CIS" message, proceed with new application review only |
| EC-25 | CIS API timeout | Display warning "ไม่สามารถเชื่อมต่อ CIS ได้ กรุณาลองใหม่", allow Admin to proceed without CIS data |
| EC-26 | Conflicting data between application and CIS | Highlight differences, allow Admin to request clarification from applicant |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| CIS API unavailable | Service down | ไม่สามารถดึงข้อมูล CIS ได้ในขณะนี้ | Allow review without CIS data, log for retry |
| CIS data incomplete | Partial response | แสดงข้อมูลบางส่วนจาก CIS | Display available data, note incomplete status |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|
| Loading | Fetching CIS data | Show loading spinner with "กำลังดึงข้อมูลจาก CIS..." |
| Success | CIS data loaded | Display CIS data panel alongside application data |
| Empty | No CIS data | Display "ไม่พบข้อมูลใน CIS" message |
| Error | CIS fetch fails | Show warning, allow proceeding without CIS data |

#### US-06: SP Network Management
**As an** Allkons M admin, **I want to** manage the SP network by viewing all active SPs, suspending or terminating accounts, and reassigning service areas, **so that** I can maintain network quality and handle issues.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "SP Manager" role
- Active SPs exist in system

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-033 | Admin can view all SPs with status (Active, Suspended, Terminated) | P0 |
| BR-034 | Admin can suspend SP account (temporary) or terminate (permanent) | P0 |
| BR-035 | Admin can reassign SPs to different supervisors (Leaders) | P1 |
| BR-036 | Admin can update SP service area assignments (Region/Province/District) | P1 |
| BR-037 | Suspended SPs cannot login or perform operations | P0 |
| BR-038 | Terminated SPs cannot login; account is permanently disabled | P0 |
| BR-145 | Admin must be able to edit assigned work area for individual SP | P0 |
| BR-146 | Admin must be able to suspend SP usage/account access | P0 |
| BR-147 | Suspension must be reflected in status and access control rules | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Suspension Reason | Required when suspending, max 500 chars | กรุณาระบุเหตุผลในการระงับ |
| Termination Reason | Required when terminating, max 500 chars | กรุณาระบุเหตุผลในการยกเลิก |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-26 | Admin is on SP network page | Admin views all SPs | System displays list with filters (Status, Service Area, Supervisor, Performance) |
| AC-27 | Admin suspends SP account | Admin clicks "ระงับ", enters reason, confirms | System updates status to "Suspended", sends LINE OA notification (with SMS as fallback), SP cannot login |
| AC-28 | Admin terminates SP account | Admin clicks "ยกเลิก", enters reason, confirms | System updates status to "Terminated", sends LINE OA notification (with SMS as fallback), SP account permanently disabled |
| AC-29 | Admin reassigns SP to different supervisor | Admin selects new supervisor, confirms | System updates SP hierarchy, notifies both old and new supervisors |
| AC-59 | Admin edits SP work area | Admin updates Region/Province/District assignment | System updates and notifies SP of service area change |
| AC-60 | Admin suspends SP | Admin clicks "ระงับ", enters reason | System blocks SP access to operational features, SP can only view suspension notice |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-21 | Admin suspends SP with active RFQs | System allows suspension; active RFQs remain accessible but SP cannot create new ones |
| EC-22 | Admin terminates SP with pending commissions | System flags pending commissions for manual review before termination |
| EC-23 | Admin tries to reassign SP to non-existent supervisor | Display error "ไม่พบหัวหน้าทีมนี้ กรุณาเลือกใหม่" |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Suspension failure | Server error | ไม่สามารถระงับบัญชีได้ กรุณาลองใหม่ | Retry button |
| SMS notification failure | SMS gateway error | บัญชีถูกระงับแล้ว แต่ไม่สามารถส่ง SMS แจ้งเตือนได้ | Log error, continue |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|
| Loading | Fetching SP list | Show loading spinner |
| Empty | No SPs in system | Display "ยังไม่มี Startup Partner ในระบบ" |
| Success | SP list loaded | Display table with filters, search, and actions |
| Error | Fetch fails | Show error message with retry option |

#### US-06B: Admin Manage Individual SP Records
**As an** Allkons M admin, **I want to** manage individual SP records including editing work areas and suspending access, **so that** I can maintain network quality and handle policy violations.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "SP Manager" role
- SP record exists in system

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-145 | Admin must be able to edit assigned work area for individual SP | P0 |
| BR-146 | Admin must be able to suspend SP usage/account access | P0 |
| BR-147 | Suspension must be reflected in status and access control rules | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Suspension Reason | Required when suspending, max 500 chars | กรุณาระบุเหตุผลในการระงับ |
| Service Area | At least one Region/Province/District must be selected | กรุณาเลือกพื้นที่ให้บริการอย่างน้อย 1 พื้นที่ |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-59 | Admin edits SP work area | Admin updates Region/Province/District assignment | System updates and notifies SP of service area change |
| AC-60 | Admin suspends SP | Admin clicks "ระงับ", enters reason | System blocks SP access to operational features, SP can only view suspension notice |
| AC-61 | Suspended SP logs in | SP attempts to access portal | System displays suspension notice with reason and contact support option |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-27 | Admin suspends SP with active RFQs | System allows suspension; active RFQs remain accessible but SP cannot create new ones |
| EC-28 | Admin suspends SP with pending commissions | System flags pending commissions for manual review; suspension proceeds |
| EC-29 | Admin changes work area to region with no stores | System warns "ไม่มีร้านค้าในพื้นที่นี้" but allows change |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Update failure | Server error | ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่ | Retry button |
| Notification failure | SMS/Email error | อัปเดตสำเร็จ แต่ไม่สามารถส่งการแจ้งเตือนได้ | Log error, continue |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|
| Loading | Updating SP record | Show loading spinner with "กำลังอัปเดต..." |
| Success | Update completed | Display success message "อัปเดตข้อมูลสำเร็จ" |
| Error | Update fails | Show error message with retry option |

#### US-07: Thammasorn SP Auto-Provisioning
**As a** Thammasorn internal sales rep, **I want to** be automatically provisioned as a global SP Leader, **so that** I can supervise public SPs without going through application process.

**Preconditions:**
- User is Thammasorn employee
- User has valid Allkons M account
- User is designated as SP supervisor

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-039 | Thammasorn sales reps are automatically provisioned as Leaders (no application required) | P0 |
| BR-040 | Leaders have global service area access (all provinces/districts) | P0 |
| BR-041 | Leaders cannot be demoted or removed by standard admins | P0 |
| BR-042 | Leaders can view and manage assigned Members | P1 |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-30 | Thammasorn employee is added to system | Admin provisions employee as Leader | System creates SP Leader account with global service areas, no application required |
| AC-31 | Leader logs in to SP Portal | Leader accesses dashboard | System displays Leader view with team management features |
| AC-32 | Leader views assigned Members | Leader clicks "ทีมของฉัน" | System displays list of assigned public SPs with performance metrics |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-24 | Standard admin tries to suspend Leader account | System prevents action, displays "ไม่สามารถระงับบัญชีหัวหน้าทีมได้ กรุณาติดต่อผู้ดูแลระบบระดับสูง" |
| EC-25 | Leader leaves Thammasorn company | Super admin can manually demote to Member or terminate account |
| EC-26 | Leader tries to access Member-only features | System allows access; Leaders have all Member permissions plus supervision features |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Provisioning failure | Server error | ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่ | Retry provisioning |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|
| Loading | Provisioning account | Show loading spinner |
| Success | Account created | Display success message and login credentials |
| Error | Provisioning fails | Show error message with retry option |

---

### EPIC-04: Seller Opt-In & Configuration

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-04 |
| **Goal** | Enable stores/branches to opt-in to SP program and configure participation settings |
| **Scope** | Seller Portal enhancements for SP program opt-in, service area configuration, RFQ notification preferences |
| **Out of Scope** | Automated store onboarding, bulk opt-in operations, commission negotiation |
| **Success Criteria** | Stores can opt-in to SP program in under 5 minutes; RFQ notifications delivered reliably |
| **Maps to** | FR-015, FR-016, FR-017 |

#### US-08: Seller Opt-In to SP Program
**As a** store owner or branch manager, **I want to** opt-in to the SP program and configure my participation settings, **so that** I can receive leads from Startup Partners in my area.

**Preconditions:**
- User is logged in to Seller Portal
- User has "Store Owner" or "Branch Manager" role
- Store/branch is verified and active

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-043 | Stores can opt-in or opt-out of SP program at any time | P0 |
| BR-044 | Opt-in is per branch (not organization-wide) | P0 |
| BR-045 | Stores can configure which service areas they accept RFQs from | P1 |
| BR-046 | Stores can set RFQ notification preferences (in-app, SMS, email) | P1 |
| BR-047 | Opted-in stores are visible to SPs in their configured service areas | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Service Areas | At least 1 service area must be selected if opting in | กรุณาเลือกพื้นที่ให้บริการอย่างน้อย 1 พื้นที่ |
| Notification Preference | At least 1 notification method must be selected | กรุณาเลือกช่องทางการแจ้งเตือนอย่างน้อย 1 ช่องทาง |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-33 | Store is not opted-in to SP program | Store owner clicks "เข้าร่วมโปรแกรม SP" in Seller Portal | System displays opt-in form with service area selector and notification preferences |
| AC-34 | Store owner completes opt-in form | Store owner selects service areas, notification preferences, and clicks "ยืนยัน" | System saves settings, updates store status to "SP Program Active", displays success message |
| AC-35 | Store is opted-in | Store appears in SP product search for selected service areas | SPs in those areas can see store products and send RFQs |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-27 | Store opts out while having active RFQs | System allows opt-out; existing RFQs remain active but store won't receive new ones |
| EC-28 | Store changes service areas after opt-in | System updates immediately; SPs in removed areas can no longer see store |
| EC-29 | Store has multiple branches with different opt-in status | Each branch manages opt-in independently |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Opt-in failure | Server error | ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Saving opt-in settings | Show loading spinner with "กำลังบันทึก..." |
| Success | Opt-in completed | Display success message "เข้าร่วมโปรแกรม SP สำเร็จ" |
| Error | Save fails | Show error message with retry option |

---

### EPIC-05: Product Discovery & Sourcing

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-05 |
| **Goal** | Enable SPs to search and discover products from participating stores in their assigned service areas |
| **Scope** | Product search by keyword, category, store; service area filtering; product detail view; add to RFQ cart |
| **Out of Scope** | AI-powered product recommendations, price comparison across stores, product reviews |
| **Success Criteria** | SPs can find products in under 30 seconds; search returns results in under 2 seconds; product details are accurate |
| **Maps to** | FR-018, FR-019, FR-020 |

#### US-09: SP Search Products by Keyword
**As a** Startup Partner, **I want to** search for products by keyword across all participating stores in my service areas, **so that** I can find the right products for my buyers.

**Preconditions:**
- SP is logged in to SP Portal
- SP has assigned service areas
- Participating stores exist in SP's service areas

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-048 | Product search is scoped to SP's assigned service areas only | P0 |
| BR-049 | Search returns products from opted-in stores only | P0 |
| BR-050 | Search supports Thai keyword matching (product name, SKU, category) | P0 |
| BR-051 | Search results display product name, image, price range, store name, location | P0 |
| BR-052 | Search results are paginated (20 products per page) | P1 |
| BR-053 | SP can filter results by category, price range, store, district | P1 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Search Keyword | Minimum 2 characters | กรุณากรอกคำค้นหาอย่างน้อย 2 ตัวอักษร |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-36 | SP is on product search page | SP enters keyword and clicks "ค้นหา" | System returns matching products from opted-in stores in SP's service areas within 2 seconds |
| AC-37 | Search returns results | SP views search results | System displays product cards with image, name, price range, store name, location |
| AC-38 | SP clicks on product card | SP views product detail | System displays full product info (description, specs, pricing, stock status, store contact) |
| AC-39 | SP wants to add product to RFQ | SP clicks "เพิ่มใน RFQ" on product detail | System adds product to RFQ cart and shows confirmation |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-30 | Search keyword matches no products | Display "ไม่พบสินค้าที่ค้นหา กรุณาลองคำค้นหาอื่น" with search suggestions |
| EC-31 | SP searches for product outside service areas | No results returned; display "ไม่พบสินค้าในพื้นที่ให้บริการของคุณ" |
| EC-32 | Product stock status changes during search | Display current stock status; if out of stock, show "สินค้าหมด" badge |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Search timeout | Query takes > 5 seconds | ระบบค้นหาช้ากว่าปกติ กรุณารอสักครู่ | Continue waiting or retry |
| Search service unavailable | Backend error | ไม่สามารถค้นหาได้ในขณะนี้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Search in progress | Show loading spinner with "กำลังค้นหา..." |
| Empty | No results found | Display empty state with search suggestions |
| Success | Results loaded | Display product grid with filters |
| Error | Search fails | Show error message with retry option |

#### US-09A: Manage Favorite Stores
**As a** Startup Partner, **I want to** mark stores as favorites and manage my favorite stores list, **so that** I can quickly select preferred stores when creating RFQs.

**Preconditions:**
- SP is logged in and approved
- SP has access to store directory
- Participating stores exist in SP's service areas

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-053A | SP can mark any eligible store as favorite | P1 |
| BR-053B | Favorite stores are SP-specific (not shared across SPs) | P0 |
| BR-053C | SP can add/remove stores from favorites at any time | P1 |
| BR-053D | No limit on number of favorite stores | P1 |
| BR-053E | Favorite stores must still meet RFQ eligibility criteria (opted-in, service area match) | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Store | Store must be opted-in to SP program | ร้านค้านี้ยังไม่เข้าร่วมโปรแกรม SP |
| Store | Store must be active and not suspended | ร้านค้านี้ถูกระงับการใช้งาน |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-39A | SP is viewing store list | SP clicks star icon on store card | System marks store as favorite and displays confirmation "เพิ่มร้านค้าโปรดสำเร็จ" |
| AC-39B | SP has favorite stores | SP navigates to "ร้านค้าโปรด" page | System displays list of all favorite stores with option to remove |
| AC-39C | SP wants to remove favorite | SP clicks "ลบออกจากรายการโปรด" | System removes store from favorites and displays confirmation |
| AC-39D | SP creates new RFQ | SP views store selection page | System shows favorite stores with star indicator for easy identification |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-32A | SP marks store as favorite, then store opts out | Favorite status persists but store won't appear in RFQ eligible stores |
| EC-32B | SP has no favorite stores | Display empty state "คุณยังไม่มีร้านค้าโปรด กรุณาเพิ่มร้านค้าที่คุณชื่นชอบ" |
| EC-32C | SP tries to favorite suspended store | Display error "ไม่สามารถเพิ่มร้านค้านี้เป็นรายการโปรดได้ ร้านค้าถูกระงับการใช้งาน" |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Add favorite fails | Server error | ไม่สามารถเพิ่มร้านค้าโปรดได้ กรุณาลองใหม่ | Retry button |
| Remove favorite fails | Server error | ไม่สามารถลบร้านค้าโปรดได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Adding/removing favorite | Show loading spinner |
| Success | Favorite added/removed | Display success message and update UI |
| Error | Operation fails | Show error message with retry option |

---

### EPIC-06: RFQ Creation & Management

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-06 |
| **Goal** | Enable SPs to create buyer-centric, round-based RFQs with comprehensive commercial, delivery, and contact information to multiple stores using multiple product acquisition methods |
| **Scope** | RFQ creation form with project info, payment method, delivery type/address/time slot, contact info, tax invoice requirement, buyer type, buyer information, delivery requirements, delivery schedule, product selection (manual search, AI image analysis, hybrid), quantity input, store selection with location-based and favorite filtering, deadline setting, RFQ submission, RFQ tracking, RFQ expiration, buyer grouping, AI text-based product sourcing, manual entry without Master SKU match, public RFQs, favorite stores (inline + settings page), buyer name/phone privacy (not shared with seller) |
| **Out of Scope** | RFQ templates, bulk RFQ creation, RFQ scheduling, automated payment method validation, real-time credit limit checking, automated Tax ID verification, AI-powered store recommendation |
| **Success Criteria** | SPs can create and submit comprehensive RFQ in under 10 minutes; RFQs delivered to stores reliably with all commercial details; RFQ status tracked accurately; store selection enhanced with location and favorite filtering; product list can be built from manual search, AI extraction, or hybrid methods; AI extraction completes within 10 seconds (sync) or 5 minutes (async) |
| **Maps to** | FR-021, FR-022, FR-023, FR-024, FR-050 to FR-070 |

#### US-10: SP Create RFQ with Multiple Products
**As a** Startup Partner, **I want to** create an RFQ with multiple products and send it to multiple stores, **so that** I can get competitive quotes for my buyer.

**Preconditions:**
- SP is logged in to SP Portal
- SP has selected products via search/browse
- Participating stores exist in SP's service areas

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-054 | RFQ must contain at least 1 product | P0 |
| BR-055 | RFQ can contain up to 50 products | P0 |
| BR-056 | Each product must have quantity specified (minimum 1 unit) | P0 |
| BR-057 | RFQ must be sent to at least 1 store | P0 |
| BR-058 | RFQ can be sent to up to 12 partner stores simultaneously (only opted-in stores) | P0 |
| BR-059 | RFQ deadline is mandatory (minimum 24 hours, maximum 7 days from creation) | P0 |
| BR-060 | RFQ automatically expires after deadline; no new quotes accepted | P0 |
| BR-061 | SP can add notes/special requirements to RFQ (optional, max 500 chars) | P1 |
| BR-062 | Buyer information is mandatory: First name, Last name, Phone number | P0 |
| BR-063 | Buyer phone must be 10 digits Thai format | P0 |
| BR-064 | Delivery location is mandatory (max 500 chars) | P0 |
| BR-065 | Delivery time is mandatory (must be after deadline + minimum 24 hours lead time) | P0 |
| BR-066 | Delivery schedule is optional; SP can specify multiple delivery rounds (max 5 rounds) | P1 |
| BR-067 | Each delivery round specifies: Round number, Location, Date/Time | P1 |
| BR-068 | SP reference (SP ID) is auto-populated from logged-in SP account | P0 |
| BR-069 | SP can view RFQs grouped by buyer for better customer management | P1 |
| BR-070 | Project Name is required for all RFQs (max 200 chars) | P0 |
| BR-071 | Project Name helps organize RFQs by buyer project | P1 |
| BR-072 | Payment Method is required for all RFQs | P0 |
| BR-073 | Payment Method affects quotation approval workflow | P0 |
| BR-074 | If Payment Method = Store Credit, store reviews buyer credit eligibility during quotation | P0 |
| BR-075 | Store Credit is seller-specific credit agreement (not Allkons credit product) | P0 |
| BR-076 | Store can approve/reject quotation based on credit policy for Store Credit payment method | P0 |
| BR-077 | Delivery Type is required (Self Pickup or Store Delivery) | P0 |
| BR-078 | If Delivery Type = Store Delivery, Delivery Address is required | P0 |
| BR-079 | If Delivery Type = Self Pickup, Delivery Address is optional | P1 |
| BR-080 | Google Maps Location Link is optional but recommended for Store Delivery | P1 |
| BR-081 | Delivery Date is required and must be future date (minimum 24 hours from RFQ submission) | P0 |
| BR-082 | Delivery Time Slot is required but can be set as Unspecified | P0 |
| BR-083 | Delivery information flows to quotation and affects delivery terms | P0 |
| BR-084 | Contact Name is required (max 100 chars) | P0 |
| BR-085 | Contact Phone Number is required (10 digits Thai format) | P0 |
| BR-086 | Contact Email is optional | P1 |
| BR-087 | Contact information is used for order communication and delivery coordination | P0 |
| BR-088 | Tax Invoice requirement must be explicitly captured (Yes/No) | P0 |
| BR-089 | Tax Invoice requirement affects quotation pricing and documentation | P0 |
| BR-090 | Additional Notes is optional (max 1000 chars) | P1 |
| BR-091 | Additional Notes can include special instructions, preferences, or requirements | P1 |
| BR-092 | System filters stores whose service areas include delivery address region/province/district | P0 |
| BR-093 | Within eligible stores, system sorts by proximity to delivery address | P1 |
| BR-094 | Proximity calculation uses geocoding of delivery address and store location | P1 |
| BR-095 | Location filter is applied automatically based on delivery address | P0 |
| BR-096 | SP can toggle "Show Favorite Stores Only" filter | P1 |
| BR-097 | Favorite filter only shows stores marked as favorite by that SP | P1 |
| BR-098 | Favorite filter respects service area and participation eligibility | P0 |
| BR-099 | If no favorite stores match criteria, display "No favorite stores available" message | P1 |
| BR-100 | Location and favorite filters can be combined | P1 |
| BR-101 | Filter priority: Service area eligibility → Favorite status → Proximity sort | P0 |
| BR-102 | Store selection remains constrained by existing participation and service area rules | P0 |
| BR-103 | System must support search by product name, barcode number, master SKU number, description | P0 |
| BR-104 | Search powered by Elasticsearch with Thai language support | P0 |
| BR-105 | Search scoped to SP service areas | P0 |
| BR-106 | SP can add products from search results to RFQ product list | P0 |
| BR-107 | Product list source type tracked as MANUAL_SEARCH | P1 |
| BR-108 | System must allow SP to upload images for AI product extraction | P0 |
| BR-109 | Max 5 images per upload, 10MB each, formats: JPG/PNG/HEIC | P0 |
| BR-110 | System sends images to external AI vendor (AI All in team) | P0 |
| BR-111 | AI vendor processes images and returns structured product list | P0 |
| BR-112 | AI processing supports synchronous (real-time) and asynchronous (job-based) modes | P0 |
| BR-113 | Synchronous mode: results within 10 seconds; Asynchronous mode: results via polling/webhook | P0 |
| BR-114 | AI results stored with extraction metadata (job ID, vendor name, timestamp) | P1 |
| BR-115 | Confidence scores logged internally but not displayed to SP | P1 |
| BR-116 | AI extraction status tracked: PENDING → PROCESSING → COMPLETED | FAILED | P0 |
| BR-117 | AI-extracted products displayed in editable review state | P0 |
| BR-118 | SP must review and confirm AI results before adding to RFQ | P0 |
| BR-119 | SP can edit product name, quantity, unit for each AI-extracted item | P1 |
| BR-120 | SP can remove unwanted AI-extracted items | P1 |
| BR-121 | SP can add additional products via manual search after AI extraction | P1 |
| BR-122 | Product list source type tracked as AI_IMAGE_ANALYSIS or HYBRID | P1 |
| BR-123 | HYBRID = AI extraction + manual additions/edits | P1 |
| BR-124 | RFQ submission blocked until SP confirms product list | P0 |
| BR-125 | SP can discard AI results and start over with manual search | P1 |
| BR-126 | Buyer Type is required (INDIVIDUAL or CORPORATE) | P0 |
| BR-127 | If requireTaxInvoice = Yes, tax invoice information is required | P0 |
| BR-128 | Tax invoice address option is required if requireTaxInvoice = Yes | P0 |
| BR-129 | Tax invoice address option: USE_DELIVERY_ADDRESS or PROVIDE_SEPARATE | P0 |
| BR-130 | If USE_DELIVERY_ADDRESS selected, delivery address auto-populates to tax invoice fields (editable) | P0 |
| BR-131 | If PROVIDE_SEPARATE selected, SP must enter separate tax invoice address | P0 |
| BR-132 | For INDIVIDUAL buyer type: Tax invoice requires full name and Tax ID (13 digits) | P0 |
| BR-133 | For CORPORATE buyer type: Tax invoice requires company name, Tax ID (13 digits), branch, company address, phone | P0 |
| BR-134 | Tax ID must be 13 digits for both individual and corporate | P0 |
| BR-135 | Branch field is optional for corporate (default "สำนักงานใหญ่" if not specified) | P1 |
| BR-136 | Tax invoice information flows to quotation and affects documentation | P0 |
| BR-277 | SP can paste or type long free-form text and AI will extract product info, quantities, delivery address, and contact information to auto-fill form fields | P1 |
| BR-278 | When product search returns no results, SP can manually enter product name/description without Master SKU match | P0 |
| BR-279 | Product unit field is optional — RFQ can be submitted without specifying unit | P1 |
| BR-280 | SP can mark an RFQ as "public" — any opted-in store in the service area can view and submit a QT | P1 |
| BR-281 | SP can mark stores as favorites via star icon during store selection or via My Favorite Stores in Profile/Settings | P1 |
| BR-282 | Favorite stores appear first in store selection list | P1 |
| BR-283 | Buyer name and phone number are optional fields in RFQ | P0 |
| BR-284 | CRITICAL: Even if buyer name/phone is provided, it must NOT be shared with Seller to prevent platform bypass | P0 |
| BR-285 | Delivery date is required; time slot options: ไม่ระบุ (unspecified), ช่วงเช้า (morning), ช่วงบ่าย (afternoon) | P0 |
| BR-286 | SP specifies buyer's preferred payment method: Direct transfer, Allkons Payment Gateway (Thai QR/Credit Card), or Store Credit | P1 |
| BR-287 | Store search must support text search term + location filter down to district level (อำเภอ) | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Project Name | Required, max 200 chars | กรุณากรอกชื่อโครงการ |
| Payment Method | Required, must be one of enum values | กรุณาเลือกวิธีการชำระเงิน |
| Delivery Type | Required, must be SELF_PICKUP or STORE_DELIVERY | กรุณาเลือกประเภทการจัดส่ง |
| Delivery Address | Required if Delivery Type = STORE_DELIVERY, max 500 chars | กรุณากรอกที่อยู่จัดส่ง |
| Google Maps Link | Optional, must be valid URL if provided | กรุณากรอก URL ที่ถูกต้อง |
| Delivery Date | Required, must be future date (min 24 hours ahead) | กรุณาเลือกวันที่จัดส่ง (อย่างน้อย 24 ชั่วโมงล่วงหน้า) |
| Delivery Time Slot | Required, must be MORNING, AFTERNOON, or UNSPECIFIED | กรุณาเลือกช่วงเวลาจัดส่ง |
| Contact Name | Required, max 100 chars | กรุณากรอกชื่อผู้ติดต่อ |
| Contact Phone | Required, 10 digits Thai format | กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (10 หลัก) |
| Contact Email | Optional, valid email format if provided | กรุณากรอกอีเมลให้ถูกต้อง |
| Require Tax Invoice | Required, must be Yes or No | กรุณาระบุความต้องการใบกำกับภาษี |
| Additional Notes | Optional, max 1000 chars | หมายเหตุไม่เกิน 1000 ตัวอักษร |
| Buyer First Name | Required, Thai characters, max 100 chars | กรุณากรอกชื่อลูกค้า |
| Buyer Last Name | Required, Thai characters, max 100 chars | กรุณากรอกนามสกุลลูกค้า |
| Buyer Phone Number | Required, 10 digits Thai format | กรุณากรอกเบอร์โทรศัพท์ลูกค้า (10 หลัก) |
| Delivery Location | Required, max 500 chars | กรุณากรอกสถานที่จัดส่ง |
| Delivery Time | Required, must be after deadline + 24 hours | กรุณาเลือกเวลาจัดส่ง (หลังกำหนดเวลาอย่างน้อย 24 ชั่วโมง) |
| Delivery Schedule | Optional, max 5 rounds, each with location and time | รอบจัดส่งสูงสุด 5 รอบ |
| Product List | At least 1 product required | กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ |
| Product Quantity | Must be positive integer, max 9999 | กรุณากรอกจำนวนสินค้า (1-9999) |
| Store Selection | At least 1 store required, max 12 partner stores | กรุณาเลือกร้านค้าอย่างน้อย 1 ร้าน (สูงสุด 12 ร้าน) |
| Deadline | Must be 24 hours to 7 days from now | กรุณาเลือกกำหนดเวลา (24 ชั่วโมง - 7 วัน) |
| Notes | Max 500 characters | หมายเหตุต้องไม่เกิน 500 ตัวอักษร |
| Buyer Type | Required, must be INDIVIDUAL or CORPORATE | กรุณาเลือกประเภทผู้ซื้อ |
| Tax Invoice Address Option | Required if requireTaxInvoice = Yes | กรุณาเลือกวิธีระบุที่อยู่ใบกำกับภาษี |
| Tax ID (Individual) | Required if buyer type = INDIVIDUAL and requireTaxInvoice = Yes, 13 digits | กรุณากรอกเลขประจำตัวผู้เสียภาษี (13 หลัก) |
| Tax Invoice Name (Individual) | Required if buyer type = INDIVIDUAL and requireTaxInvoice = Yes, max 200 chars | กรุณากรอกชื่อผู้เสียภาษี |
| Tax Invoice Address (Individual) | Required if PROVIDE_SEPARATE selected, max 500 chars | กรุณากรอกที่อยู่ใบกำกับภาษี |
| Company Name | Required if buyer type = CORPORATE and requireTaxInvoice = Yes, max 200 chars | กรุณากรอกชื่อบริษัท |
| Company Tax ID | Required if buyer type = CORPORATE and requireTaxInvoice = Yes, 13 digits | กรุณากรอกเลขประจำตัวผู้เสียภาษีนิติบุคคล (13 หลัก) |
| Company Branch | Optional, max 100 chars, default "สำนักงานใหญ่" | สาขา (ถ้ามี) |
| Company Address | Required if buyer type = CORPORATE and requireTaxInvoice = Yes and PROVIDE_SEPARATE selected, max 500 chars | กรุณากรอกที่อยู่บริษัท |
| Company Phone | Required if buyer type = CORPORATE and requireTaxInvoice = Yes, 10 digits Thai format | กรุณากรอกเบอร์โทรศัพท์บริษัท (10 หลัก) |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-40 | SP has products in RFQ cart | SP clicks "สร้าง RFQ" | System displays comprehensive RFQ creation form with all field groups: project info, payment method, delivery type/address/time slot, contact info, tax invoice, buyer info, delivery details, product list, store selector, deadline |
| AC-40a | SP enters project information | SP fills project name | System validates max 200 chars |
| AC-40b | SP selects payment method | SP selects from dropdown (4 options) | System displays selected payment method; if Store Credit selected, shows info message about credit approval during quotation |
| AC-40c | SP selects delivery type | SP selects Self Pickup or Store Delivery | If Store Delivery selected, delivery address field becomes required; if Self Pickup, address is optional/hidden |
| AC-40d | SP enters delivery details | SP fills delivery address, Google Maps link, delivery date, time slot | System validates delivery date is future date (min 24 hours ahead) |
| AC-40e | SP enters contact information | SP fills contact name, phone, email | System validates phone format (10 digits) |
| AC-40f | SP specifies tax invoice requirement | SP selects Yes or No | System captures tax invoice requirement |
| AC-40g | SP enters additional notes (optional) | SP fills additional notes field | System allows up to 1000 chars |
| AC-40h | SP enters buyer information | SP fills buyer first name, last name, phone number | System validates buyer phone format (10 digits) |
| AC-40i | SP enters delivery information | SP fills delivery location and delivery time | System validates delivery time is at least 24 hours after deadline |
| AC-40j | SP adds delivery schedule (optional) | SP adds multiple delivery rounds with location/time | System allows up to 5 delivery rounds |
| AC-40k | SP reference auto-populated | SP views RFQ form | System auto-fills SP ID from logged-in account (read-only) |
| AC-41 | SP completes RFQ form | SP fills all required fields and clicks "ส่ง RFQ" | System validates all fields, creates RFQ with complete commercial details, sends notifications to selected stores (max 12), displays RFQ ID and tracking page |
| AC-41a | SP views RFQ list | SP navigates to "RFQ ของฉัน" | System displays RFQs grouped by buyer name with expandable sections showing project name and payment method |
| AC-42 | RFQ submitted successfully | System processes submission | Selected stores receive RFQ notifications with all commercial details; SP receives LINE OA notification (with SMS as fallback) confirmation |
| AC-40m | SP selects buyer type | SP selects INDIVIDUAL or CORPORATE | System displays appropriate tax invoice fields based on buyer type |
| AC-40n | SP enables tax invoice requirement | SP selects requireTaxInvoice = Yes | System displays tax invoice address option selector |
| AC-40o | SP selects USE_DELIVERY_ADDRESS | SP chooses "Use Delivery Address" option | System auto-populates delivery address to tax invoice address fields (editable) |
| AC-40p | SP selects PROVIDE_SEPARATE | SP chooses "Provide Separate Information" | System displays empty tax invoice address fields for manual entry |
| AC-40q | SP enters individual tax invoice info | Buyer type = INDIVIDUAL, requireTaxInvoice = Yes | System requires: Tax invoice name, Tax ID (13 digits), Address (if PROVIDE_SEPARATE) |
| AC-40r | SP enters corporate tax invoice info | Buyer type = CORPORATE, requireTaxInvoice = Yes | System requires: Company name, Tax ID (13 digits), Branch (optional), Company address (if PROVIDE_SEPARATE), Company phone |
| AC-40s | SP edits auto-populated tax address | USE_DELIVERY_ADDRESS selected, SP modifies address | System allows editing of auto-populated tax invoice address |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-33 | SP tries to send RFQ to opted-out store | System filters out opted-out stores from selector; displays only partner stores |
| EC-34 | SP sets deadline less than 24 hours | Display validation error "กำหนดเวลาต้องมากกว่า 24 ชั่วโมงจากตอนนี้" |
| EC-35 | SP selects more than 12 stores | Display error "สามารถเลือกร้านค้าได้สูงสุด 12 ร้าน" and disable selection |
| EC-35a | SP adds more than 50 products | Display error "สามารถเพิ่มสินค้าได้สูงสุด 50 รายการ" and disable add button |
| EC-35b | SP sets delivery time before deadline | Display error "เวลาจัดส่งต้องหลังกำหนดเวลาอย่างน้อย 24 ชั่วโมง" |
| EC-35c | SP adds more than 5 delivery rounds | Display error "สามารถเพิ่มรอบจัดส่งได้สูงสุด 5 รอบ" and disable add button |
| EC-35d | Invalid buyer phone number format | Display error "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)" |
| EC-35e | SP selects Self Pickup but enters delivery address | System allows optional address entry; address not required for validation |
| EC-35f | SP selects Store Delivery but doesn't enter address | Display error "กรุณากรอกที่อยู่จัดส่งสำหรับการจัดส่งโดยร้านค้า" |
| EC-35g | SP enters invalid Google Maps URL | Display error "กรุณากรอก URL ของ Google Maps ที่ถูกต้อง" |
| EC-35h | SP selects Store Credit payment method | Display info message "ร้านค้าจะตรวจสอบวงเงินเครดิตของลูกค้าเมื่อสร้างใบเสนอราคา" |
| EC-35i | SP enters delivery date less than 24 hours ahead | Display error "กรุณาเลือกวันที่จัดส่งอย่างน้อย 24 ชั่วโมงล่วงหน้า" |
| EC-35j | SP enters contact phone in invalid format | Display error "กรุณากรอกหมายเลขโทรศัพท์ผู้ติดต่อให้ถูกต้อง (10 หลัก)" |
| EC-35k | SP changes buyer type after entering tax info | System clears tax invoice fields and displays appropriate fields for new buyer type |
| EC-35l | SP changes from USE_DELIVERY_ADDRESS to PROVIDE_SEPARATE | System clears auto-populated address, requires manual entry |
| EC-35m | SP changes delivery address after selecting USE_DELIVERY_ADDRESS | System updates tax invoice address automatically (if not manually edited) |
| EC-35n | SP enters invalid Tax ID format | Display error "กรุณากรอกเลขประจำตัวผู้เสียภาษีให้ถูกต้อง (13 หลัก)" |
| EC-35o | Corporate buyer doesn't specify branch | System defaults to "สำนักงานใหญ่" |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Submission failure | Server error | ไม่สามารถส่ง RFQ ได้ กรุณาลองใหม่ | Save draft, retry button |
| Notification failure | SMS/email gateway error | RFQ ถูกสร้างแล้ว แต่ไม่สามารถส่งการแจ้งเตือนได้ | Log error, continue |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Submitting RFQ | Show loading spinner with "กำลังส่ง RFQ..." |
| Success | RFQ created | Display success message with RFQ ID and "ดู RFQ" button |
| Error | Submission fails | Show error message with retry option |

#### US-10C: Filter and Select Stores with Location and Favorites
**As a** Startup Partner, **I want to** filter eligible stores by location relevance and favorite status, **so that** I can quickly select the most appropriate stores for my RFQ.

**Preconditions:**
- SP is creating RFQ
- SP has entered delivery address (for location filtering)
- Eligible stores exist (opted-in, service area match)

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-092 | System filters stores whose service areas include delivery address region/province/district | P0 |
| BR-093 | Within eligible stores, system sorts by proximity to delivery address | P1 |
| BR-094 | Proximity calculation uses geocoding of delivery address and store location | P1 |
| BR-095 | Location filter is applied automatically based on delivery address | P0 |
| BR-096 | SP can toggle "Show Favorite Stores Only" filter | P1 |
| BR-097 | Favorite filter only shows stores marked as favorite by that SP | P1 |
| BR-098 | Favorite filter respects service area and participation eligibility | P0 |
| BR-099 | If no favorite stores match criteria, display "No favorite stores available" message | P1 |
| BR-100 | Location and favorite filters can be combined | P1 |
| BR-101 | Filter priority: Service area eligibility → Favorite status → Proximity sort | P0 |
| BR-102 | Store selection remains constrained by existing participation and service area rules | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Delivery Address | Must be entered before location filtering can work | กรุณากรอกที่อยู่จัดส่งก่อนกรองร้านค้า |
| Store Selection | At least one store must remain eligible after filtering | ไม่พบร้านค้าที่ตรงกับเงื่อนไข กรุณาปรับการกรอง |
| Store Selection | Selected stores must not exceed 12-store limit | สามารถเลือกร้านค้าได้สูงสุด 12 ร้าน |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-42A | SP enters delivery address in RFQ form | System processes address | System automatically filters stores by service area match to delivery address |
| AC-42B | Eligible stores are identified | System displays store list | Stores are sorted by proximity to delivery address (nearest first) with distance shown |
| AC-42C | SP wants to filter favorites | SP toggles "Show Favorite Stores Only" checkbox | System shows only SP's favorite stores that match service area criteria |
| AC-42D | Favorite filter is enabled | SP views filtered list | Only favorite stores are shown, still subject to service area and eligibility rules |
| AC-42E | SP views store list | System displays stores | Each store shows distance from delivery address in kilometers |
| AC-42F | SP selects stores for RFQ | SP selects 1-12 stores from filtered list | System allows selection up to 12 stores maximum |
| AC-42G | No stores match filters | System evaluates criteria | Display helpful message "ไม่พบร้านค้าที่ตรงกับเงื่อนไข กรุณาปรับการกรอง" with filter adjustment suggestions |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-35K | Delivery address is outside all store service areas | Display "ไม่มีร้านค้าให้บริการในพื้นที่นี้ กรุณาเปลี่ยนที่อยู่จัดส่ง" |
| EC-35L | SP has no favorite stores | Favorite filter shows empty list with "คุณยังไม่มีร้านค้าโปรด กรุณาเพิ่มร้านค้าที่คุณชื่นชอบ" |
| EC-35M | All favorite stores are outside delivery service area | Display "ร้านค้าโปรดของคุณไม่ให้บริการในพื้นที่นี้" with option to view all eligible stores |
| EC-35N | Delivery Type = Self Pickup | Location filter uses SP service area instead of delivery address |
| EC-35O | SP changes delivery address after selecting stores | System re-filters stores; previously selected stores outside new service area are deselected with notification |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Geocoding failure | Invalid delivery address | ไม่สามารถระบุตำแหน่งที่อยู่ได้ กรุณาตรวจสอบที่อยู่ | Allow manual address correction |
| No eligible stores | All stores filtered out | ไม่มีร้านค้าที่ตรงกับเงื่อนไข | Suggest removing filters or changing delivery address |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Filtering stores by location | Show loading spinner with "กำลังค้นหาร้านค้า..." |
| Success | Stores filtered and sorted | Display store list with distance indicators and favorite badges |
| Empty | No stores match criteria | Display empty state with filter adjustment suggestions |
| Error | Filtering fails | Show error message with retry option |

#### US-10D: SP Create RFQ Product List via Manual Search
**As a** Startup Partner, **I want to** search for products by name, barcode, SKU, or description and add them to my RFQ, **so that** I can build an accurate product list for quotation.

**Preconditions:**
- SP is creating RFQ
- Elasticsearch service is operational
- Product catalog is available in SP's service areas

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-103 | System must support search by product name, barcode number, master SKU number, description | P0 |
| BR-104 | Search powered by Elasticsearch with Thai language support | P0 |
| BR-105 | Search scoped to SP service areas | P0 |
| BR-106 | SP can add products from search results to RFQ product list | P0 |
| BR-107 | Product list source type tracked as MANUAL_SEARCH | P1 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Search Query | Min 2 chars, max 200 chars | กรุณากรอกคำค้นหาอย่างน้อย 2 ตัวอักษร |
| Product Selection | At least 1 product must be added to RFQ | กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-42H | SP enters search query | SP types product name/barcode/SKU/description | System returns matching products from Elasticsearch |
| AC-42I | SP selects product from results | SP clicks "Add to RFQ" | Product added to RFQ product list with source=MANUAL_SEARCH |
| AC-42J | SP searches multiple times | SP performs multiple searches | SP can build product list incrementally from different searches |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-36 | No search results found | Display "ไม่พบสินค้าที่ตรงกับคำค้นหา กรุณาลองคำค้นหาอื่น" |
| EC-37 | Elasticsearch service unavailable | Display error "ไม่สามารถค้นหาได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง" with retry button |
| EC-38 | SP adds duplicate product | System warns "สินค้านี้มีอยู่ในรายการแล้ว คุณต้องการเพิ่มจำนวนหรือไม่?" |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Search timeout | Elasticsearch timeout | การค้นหาใช้เวลานานเกินไป กรุณาลองใหม่ | Retry button |
| Service unavailable | Elasticsearch down | ไม่สามารถค้นหาได้ในขณะนี้ | Fallback to AI image upload or manual entry |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Search in progress | Show loading spinner with "กำลังค้นหา..." |
| Success | Results loaded | Display product list with "Add to RFQ" buttons |
| Empty | No results | Display empty state with search suggestions |
| Error | Search fails | Show error message with retry option |

#### US-10E: SP Upload Images for AI Product Extraction
**As a** Startup Partner, **I want to** upload product images for AI analysis, **so that** the system can automatically extract product information and save me time.

**Preconditions:**
- SP is creating RFQ
- AI vendor service (AI All in team) is available
- SP has product images to upload

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-108 | System must allow SP to upload images for AI product extraction | P0 |
| BR-109 | Max 5 images per upload, 10MB each, formats: JPG/PNG/HEIC | P0 |
| BR-110 | System sends images to external AI vendor (AI All in team) | P0 |
| BR-111 | AI vendor processes images and returns structured product list | P0 |
| BR-112 | AI processing supports synchronous (real-time) and asynchronous (job-based) modes | P0 |
| BR-113 | Synchronous mode: results within 10 seconds; Asynchronous mode: results via polling/webhook | P0 |
| BR-114 | AI results stored with extraction metadata (job ID, vendor name, timestamp) | P1 |
| BR-115 | Confidence scores logged internally but not displayed to SP | P1 |
| BR-116 | AI extraction status tracked: PENDING → PROCESSING → COMPLETED \| FAILED | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Image Count | 1-5 images required | กรุณาอัปโหลดรูปภาพ 1-5 รูป |
| Image Size | Max 10MB per image | ขนาดไฟล์ต้องไม่เกิน 10MB |
| Image Format | JPG, PNG, HEIC only | รองรับเฉพาะไฟล์ JPG, PNG, HEIC |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-42K | SP uploads images | SP selects 1-5 images and clicks "Upload" | System validates and sends to AI vendor |
| AC-42L | Synchronous mode selected | AI processes quickly | SP sees loading → results appear within 10 seconds |
| AC-42M | Asynchronous mode selected | AI processes slowly | SP sees "Processing..." → can continue other tasks → notified when ready |
| AC-42N | AI extraction completes | AI returns product list | Results displayed in editable review state (not auto-added to RFQ) |
| AC-42O | System logs AI metadata | AI extraction completes | System logs AI job ID, vendor name, extraction status |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-39 | AI vendor timeout (sync mode) | Display error "การวิเคราะห์ใช้เวลานานเกินไป กรุณาลองใหม่" after 30 seconds |
| EC-40 | Invalid image format uploaded | Display error "รองรับเฉพาะไฟล์ JPG, PNG, HEIC" |
| EC-41 | AI extraction fails | Display error "ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่หรือใช้การค้นหาแบบปกติ" |
| EC-42 | No products detected in images | Display "ไม่พบรายการสินค้าในรูปภาพ กรุณาลองอัปโหลดรูปภาพอื่นหรือใช้การค้นหาแบบปกติ" |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Vendor unavailable | AI service down | ไม่สามารถเชื่อมต่อบริการ AI ได้ กรุณาลองใหม่ | Fallback to manual search |
| Timeout (sync) | 30 seconds elapsed | การวิเคราะห์ใช้เวลานานเกินไป | Retry or switch to async mode |
| Timeout (async) | 5 minutes elapsed | การวิเคราะห์ใช้เวลานานเกินไป | Retry or use manual search |
| Extraction failure | AI processing error | ไม่สามารถวิเคราะห์รูปภาพได้ | Retry or use manual search |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Uploading | Images being uploaded | Show progress bar "กำลังอัปโหลด..." |
| Processing (Sync) | AI analyzing (< 10s) | Show spinner "กำลังวิเคราะห์..." |
| Processing (Async) | AI analyzing (> 10s) | Show "กำลังประมวลผล... คุณสามารถทำงานอื่นต่อได้" |
| Completed | AI extraction done | Display "วิเคราะห์เสร็จสิ้น" with review button |
| Failed | AI extraction failed | Show error message with retry option |

#### US-10F: SP Review and Refine AI-Extracted Product List
**As a** Startup Partner, **I want to** review and edit AI-extracted product suggestions, **so that** I can ensure accuracy before submitting the RFQ.

**Preconditions:**
- AI extraction completed successfully
- AI results available for review

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-117 | AI-extracted products displayed in editable review state | P0 |
| BR-118 | SP must review and confirm AI results before adding to RFQ | P0 |
| BR-119 | SP can edit product name, quantity, unit for each AI-extracted item | P1 |
| BR-120 | SP can remove unwanted AI-extracted items | P1 |
| BR-121 | SP can add additional products via manual search after AI extraction | P1 |
| BR-122 | Product list source type tracked as AI_IMAGE_ANALYSIS or HYBRID | P1 |
| BR-123 | HYBRID = AI extraction + manual additions/edits | P1 |
| BR-124 | RFQ submission blocked until SP confirms product list | P0 |
| BR-125 | SP can discard AI results and start over with manual search | P1 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Product List | At least 1 product must remain after review | กรุณาเก็บสินค้าอย่างน้อย 1 รายการ |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-42P | AI results available | SP views review screen | AI results displayed with "Review & Confirm" UI |
| AC-42Q | SP wants to edit item | SP clicks edit on AI-extracted item | SP can modify product name, quantity, unit |
| AC-42R | SP wants to add more products | SP clicks "Add More Products" | SP can search and add products (source becomes HYBRID) |
| AC-42S | SP confirms product list | SP clicks "Confirm Product List" | Products added to RFQ with source metadata (AI_IMAGE_ANALYSIS or HYBRID) |
| AC-42T | SP discards AI results | SP clicks "Discard and Start Over" | Returns to empty product list, can use manual search |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-43 | All AI items removed by SP | Display warning "กรุณาเก็บสินค้าอย่างน้อย 1 รายการหรือเพิ่มสินค้าใหม่" |
| EC-44 | SP adds manual items after AI | Source type changes to HYBRID automatically |
| EC-45 | SP discards and retries AI | Previous AI results cleared, can upload new images |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Validation failure on confirm | No products remaining | กรุณาเก็บสินค้าอย่างน้อย 1 รายการ | Add products before confirming |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Review | AI results loaded | Display editable product list with confirm/discard buttons |
| Editing | SP modifying items | Show inline edit fields |
| Confirming | SP clicks confirm | Show loading "กำลังบันทึก..." |
| Confirmed | Products added to RFQ | Display success message, return to RFQ form |

---

### EPIC-07: Quote Comparison & Selection

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-07 |
| **Goal** | Enable SPs to view and compare quotes from multiple stores side-by-side and select best combination for buyer |
| **Scope** | Quote display (Offer Hub), side-by-side comparison, quote selection, multi-seller combination, quote validity tracking, individual quote detail view, centralized quote management dashboard, quote filtering/sorting, cross-RFQ quote tracking |
| **Out of Scope** | Automated quote ranking, price negotiation automation, quote analytics |
| **Success Criteria** | SPs can compare quotes in under 2 minutes; quote comparison is clear and accurate; SPs can select optimal combination; SPs can access quotes through RFQ context or centralized dashboard |
| **Maps to** | FR-025, FR-026, FR-027, FR-071, FR-072, FR-073, FR-074, FR-075 |

#### US-11: SP View and Compare Quotes Side-by-Side
**As a** Startup Partner, **I want to** view all received quotes side-by-side in a comparison table (Offer Hub), **so that** I can easily identify the best prices and terms for my buyer.

**Preconditions:**
- SP has submitted RFQ
- Stores have submitted quotes to RFQ
- Quotes are within validity period

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-062 | Quotes displayed in side-by-side comparison table (Offer Hub) showing all quotes simultaneously | P0 |
| BR-063 | Comparison shows: Store name, product prices, total per store, delivery terms, payment terms | P0 |
| BR-064 | SP can sort quotes by: Total price, Store name, Quote date | P1 |
| BR-065 | Quote validity period is set by seller (displayed in quote) | P0 |
| BR-066 | Expired quotes are marked but remain visible for reference | P1 |
| BR-067 | Display up to 10 quotes simultaneously (responsive layout adapts for mobile/desktop) | P0 |
| BR-288 | Quote must display the date and time the store can deliver | P0 |
| BR-289 | Quote must indicate whether delivery price includes unloading (ค่ายกสินค้าลง) or not | P1 |
| BR-290 | Store can specify in QT whether buyer can purchase individual items or must buy the entire QT as a whole | P1 |
| BR-291 | AI analyzes all received QTs and suggests the optimal combination considering price, delivery terms, and availability | P1 |
| BR-292 | Total price display must separate: product cost (ค่าสินค้า), delivery cost (ค่าจัดส่ง), tax (ภาษี), and other fees | P0 |
| BR-293 | RFQ view must support buyer-centric grouping — group all RFQs by buyer across time | P1 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-43 | SP has RFQ with received quotes | SP clicks "เปรียบเทียบใบเสนอราคา" | System displays Offer Hub with all quotes in side-by-side comparison table |
| AC-44 | SP views comparison table | SP sees all quote details | System displays store names, product-by-product pricing, totals, delivery terms, payment terms |
| AC-45 | SP wants to sort quotes | SP clicks column header to sort | System re-orders quotes by selected criterion |
| AC-46 | Quote validity expires | System checks quote validity | System marks expired quotes with "หมดอายุ" badge but keeps visible |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-36 | Only 1 store submits quote | Display single quote with message "รอใบเสนอราคาจากร้านค้าอื่น" |
| EC-37 | Stores quote different product sets (partial quotes) | Display all quotes; mark missing products as "ไม่มีสินค้า" |
| EC-38 | Quote prices vary significantly (outliers) | Highlight best price per product in green; no automatic filtering |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Quote load failure | Server error | ไม่สามารถโหลดใบเสนอราคาได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Fetching quotes | Show loading spinner |
| Empty | No quotes received yet | Display "ยังไม่มีใบเสนอราคา กรุณารอร้านค้าตอบกลับ" |
| Success | Quotes loaded | Display comparison table with all quotes |
| Error | Fetch fails | Show error message with retry option |

#### US-11A: SP View Quote Details for Individual Store
**As a** Startup Partner, **I want to** view detailed information for a single store's quote from my RFQ, **so that** I can review complete quote details before making decisions.

**Preconditions:**
- SP has submitted RFQ
- Store has submitted quote to RFQ
- SP is viewing RFQ detail page

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-074 | Quote detail shows complete store quote information (products, pricing, terms, validity) | P0 |
| BR-075 | Quote detail accessible from RFQ quote list | P0 |
| BR-076 | Quote detail shows quote status (Active, Expired, Accepted, Rejected) | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-47 | SP viewing RFQ with quotes | SP clicks individual quote in quote list | System displays quote detail modal/page with complete information |
| AC-48 | Quote detail displayed | SP reviews quote | System shows store name, contact, all products with pricing, delivery terms, payment terms, validity period, quote status |
| AC-49 | SP in quote detail view | SP wants to compare or return | System provides "เปรียบเทียบทั้งหมด" button to open Offer Hub and "กลับ" button to return to RFQ |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-39 | Quote expired | Display "หมดอายุ" badge with expiration date; disable selection actions |
| EC-40 | Partial quote (missing products) | Highlight missing products with "ไม่มีสินค้า" indicator; show available products only |
| EC-41 | Quote modified by store | Show modification history with timestamp and "แก้ไขล่าสุด" indicator |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Quote load failure | Server error | ไม่สามารถโหลดรายละเอียดใบเสนอราคาได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Fetching quote details | Show loading spinner with "กำลังโหลด..." |
| Success | Quote loaded | Display complete quote information |
| Error | Fetch fails | Show error message with retry option |

#### US-11B: SP Access Quote Management Dashboard
**As a** Startup Partner, **I want to** view and manage all quotes across all my RFQs in a centralized dashboard, **so that** I can efficiently track quote status and respond to opportunities.

**Preconditions:**
- SP is logged in to SP Portal
- SP has submitted at least one RFQ

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-077 | Quote dashboard displays all quotes from all RFQs | P0 |
| BR-078 | Quotes filterable by: Status (All, Pending, Received, Expired), RFQ, Store, Date range | P1 |
| BR-079 | Quotes sortable by: Date (newest/oldest), Price (low/high), Store name, RFQ | P1 |
| BR-080 | Each quote entry shows: RFQ reference, Store name, Total price, Status, Validity, Action buttons | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Date Range Filter | Start date must be before end date | กรุณาเลือกวันที่เริ่มต้นก่อนวันที่สิ้นสุด |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-50 | SP logged in with RFQs | SP clicks "ใบเสนอราคา" menu | System displays quote dashboard with all quotes from all RFQs |
| AC-51 | SP viewing quote dashboard | SP applies filters (status, RFQ, store, date) | System updates quote list based on selected filters |
| AC-52 | SP viewing filtered quotes | SP clicks quote entry | System opens quote detail view (US-11A) |
| AC-53 | Quote dashboard displayed | SP views summary | Dashboard shows quote counts by status (Pending: 5, Received: 12, Expired: 3) |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-42 | No quotes yet (new SP) | Display empty state "ยังไม่มีใบเสนอราคา กรุณาสร้าง RFQ เพื่อรับใบเสนอราคา" with "สร้าง RFQ" button |
| EC-43 | All quotes expired | Show message "ใบเสนอราคาทั้งหมดหมดอายุแล้ว" with filter to view expired quotes |
| EC-44 | Large number of quotes (100+) | Implement pagination (20 quotes per page) with page navigation |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Dashboard load failure | Server error | ไม่สามารถโหลดรายการใบเสนอราคาได้ กรุณาลองใหม่ | Retry button |
| Filter application failure | Invalid filter params | ไม่สามารถกรองข้อมูลได้ กรุณาลองใหม่ | Reset filters |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Fetching quotes | Show loading spinner with "กำลังโหลดใบเสนอราคา..." |
| Empty | No quotes exist | Display empty state with call-to-action |
| Success | Quotes loaded | Display quote list with filters and summary counts |
| Error | Fetch fails | Show error message with retry option |

---

### EPIC-08: In-App SP-to-Seller Communication

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-08 |
| **Goal** | Provide messaging system between SP and Store Sales rep for negotiation and clarification |
| **Scope** | In-app messaging with topic-based threaded structure, message notifications, message history, file attachments |
| **Out of Scope** | Video calls, voice calls, group chat, chatbot automation |
| **Success Criteria** | Messages delivered in under 3 seconds; message history persists; notifications delivered reliably; topics and threads organized clearly |
| **Maps to** | FR-028, FR-029, FR-030, FR-084 |

#### US-12: SP Send Messages to Store Sales Rep
**As a** Startup Partner, **I want to** send messages to store sales reps to negotiate pricing and clarify product details, **so that** I can get the best deal for my buyer.

**Preconditions:**
- SP is logged in to SP Portal
- SP has active RFQ with store
- Store is opted-in to SP program

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-068 | Messaging is scoped to specific RFQ (not general store chat) | P0 |
| BR-069 | Both SP and Store Sales rep can send messages | P0 |
| BR-070 | Messages support text (max 1000 chars) and file attachments (images, PDFs, max 10MB) | P0 |
| BR-071 | Message notifications sent via in-app and SMS | P0 |
| BR-072 | Message history persists for audit trail | P0 |
| BR-073 | Messages are timestamped and show read status | P1 |
| BR-168 | Chat must support topic creation | P0 |
| BR-169 | Chat must support threaded discussion under each topic | P0 |
| BR-170 | Users must be able to create a topic | P0 |
| BR-171 | Users must be able to reply within the thread of that topic | P0 |
| BR-172 | Message history must remain grouped under topic/thread context | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Message Text | Max 1000 characters | ข้อความต้องไม่เกิน 1000 ตัวอักษร |
| File Attachment | JPG/PNG/PDF, max 10MB | ไฟล์ต้องเป็น JPG, PNG หรือ PDF ขนาดไม่เกิน 10MB |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-47 | SP is viewing RFQ detail | SP clicks "ส่งข้อความ" | System displays message input with text field and file upload |
| AC-48 | SP types message and clicks send | SP sends message | System delivers message to store, sends notification, displays in message thread |
| AC-49 | Store replies to message | Store sends message | SP receives in-app and SMS notification; message appears in thread |
| AC-50 | SP wants to attach file | SP clicks attach and selects file | System validates file, uploads, and includes in message |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-39 | SP sends message while store is offline | Message queued; delivered when store comes online; notification sent |
| EC-40 | File upload fails due to size | Display error "ไฟล์มีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ขนาดไม่เกิน 10MB" |
| EC-41 | SP sends multiple messages rapidly | All messages delivered in order; no rate limiting for first 10 messages/minute |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Message send failure | Server error | ไม่สามารถส่งข้อความได้ กรุณาลองใหม่ | Retry button |
| File upload failure | Network error | การอัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่ | Retry upload |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Sending message | Show loading spinner on send button |
| Success | Message sent | Display message in thread with timestamp |
| Error | Send fails | Show error message with retry option |

---

### EPIC-09: Magic Link Offer Generation

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-09 |
| **Goal** | Generate shareable web links (Magic Links) containing compared quotes for buyers to view and purchase |
| **Scope** | Link generation, link security (secure tokens), link expiration (14 days), buyer-side offer modification before approval, modification audit trail, OGP metadata for rich previews, deep link support (LINE, WhatsApp) |
| **Out of Scope** | Custom link domains, link analytics, link password protection |
| **Success Criteria** | Links generated in under 2 seconds; links are secure and cannot be guessed; links work in all messaging apps; buyers can modify offer selection before approval |
| **Maps to** | FR-031, FR-032, FR-033, FR-034, FR-083 |

#### US-13: SP Generate Magic Link for Buyer
**As a** Startup Partner, **I want to** generate a shareable Magic Link containing the compared quotes, **so that** I can send it to my buyer via LINE/WhatsApp for easy viewing and purchasing.

**Preconditions:**
- SP has received quotes from stores
- SP has selected quotes to share with buyer
- Quotes are within validity period

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-074 | Magic Link contains secure token that cannot be guessed or brute-forced | P0 |
| BR-075 | Magic Link expires after 14 days from generation | P0 |
| BR-076 | Magic Link displays all selected quotes in Offer Hub format | P0 |
| BR-077 | Magic Link includes OGP metadata for rich link previews in messaging apps | P0 |
| BR-078 | Magic Link supports deep linking to LINE and WhatsApp | P1 |
| BR-079 | SP can regenerate expired links with same quote data | P1 |
| BR-080 | Digital Quotation (approved via Magic Link) serves as legal source of truth | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Quote Selection | At least 1 quote must be selected | กรุณาเลือกใบเสนอราคาอย่างน้อย 1 รายการ |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-51 | SP has selected quotes | SP clicks "สร้าง Magic Link" | System generates secure link, displays link and sharing options (LINE, WhatsApp, Copy) |
| AC-52 | SP clicks "แชร์ผ่าน LINE" | SP shares via LINE | System opens LINE app with pre-filled message and link |
| AC-53 | SP clicks "คัดลอกลิงก์" | SP copies link | System copies link to clipboard and shows confirmation |
| AC-54 | Buyer opens Magic Link | Buyer clicks link in messaging app | System displays Offer Hub with all quotes, no login required for viewing |
| AC-55 | Magic Link expires after 14 days | System checks link validity | System displays "ลิงก์หมดอายุ กรุณาติดต่อ SP" with SP contact info |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-42 | SP generates link for expired quotes | System warns "ใบเสนอราคาบางรายการหมดอายุแล้ว" but allows link generation |
| EC-43 | Buyer opens link multiple times | Link remains valid; no usage limit |
| EC-44 | SP tries to regenerate expired link | System generates new link with same quote data and new 14-day expiration |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Link generation failure | Server error | ไม่สามารถสร้างลิงก์ได้ กรุณาลองใหม่ | Retry button |
| Invalid link token | Tampered or malformed link | ลิงก์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง | Contact SP |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Generating link | Show loading spinner with "กำลังสร้างลิงก์..." |
| Success | Link generated | Display link with sharing buttons and copy option |
| Error | Generation fails | Show error message with retry option |

#### US-13A: Buyer Modify Offer Selection Before Approval
**As a** buyer, **I want to** modify the offer selection after receiving the Magic Link, **so that** I can adjust items or switch stores before final approval.

**Preconditions:**
- Buyer has opened Magic Link
- Buyer is viewing Offer Hub
- Quotes are within validity period

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-151 | Buyer may modify offer composition before approval | P0 |
| BR-152 | Buyer can select items from different stores | P0 |
| BR-153 | Buyer can switch to full quotation from another store | P0 |
| BR-154 | System must save modified buyer-side selection | P0 |
| BR-155 | System must record audit information (lastModifiedBy, lastModifiedByName, lastModifiedAt) | P0 |
| BR-156 | Checkout may proceed only after buyer approval of final selected version | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Selection | At least 1 item must be selected | กรุณาเลือกสินค้าอย่างน้อย 1 รายการ |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-65 | Buyer opens Magic Link | Buyer views Offer Hub | Buyer can view and modify offer selection |
| AC-66 | Buyer changes store selection | Buyer selects different store for item | System saves modification with audit trail (lastModifiedBy, lastModifiedByName, lastModifiedAt) |
| AC-67 | Buyer approves modified selection | Buyer clicks "อนุมัติและชำระเงิน" | System proceeds to checkout with modified selection |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-45 | Buyer modifies after quote expiration | System warns "ใบเสนอราคาบางรายการหมดอายุแล้ว" and prevents approval |
| EC-46 | Buyer removes all items | System prevents approval with "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ" |
| EC-47 | Multiple buyers open same link | Each buyer's modifications are tracked separately by user session |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Save failure | Server error | ไม่สามารถบันทึกการเปลี่ยนแปลงได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Saving modifications | Show loading spinner with "กำลังบันทึก..." |
| Success | Modifications saved | Display success message "บันทึกการเปลี่ยนแปลงสำเร็จ" |
| Error | Save fails | Show error message with retry option |

---

### EPIC-10: Buyer O2O Checkout Flow

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-10 |
| **Goal** | Provide streamlined Offer Hub checkout for buyers with auto-provisioned Shadow Accounts and KYC exemption for non-credit payments |
| **Scope** | Offer Hub display, guest viewing, auto-provisioned Shadow Account login, multi-seller decoupled checkout, KYC exemption logic, order tracking |
| **Out of Scope** | Full buyer platform revamp, guest checkout for purchasing, buyer self-registration, buyer profile management |
| **Success Criteria** | Buyers can view offers without login; buyers login with pre-provisioned credentials; checkout completes in under 30 seconds; KYC exemption works correctly |
| **Maps to** | FR-035, FR-036, FR-037, FR-038, FR-039 |

#### US-14: Buyer View Offer Hub Without Login
**As a** buyer, **I want to** view the Offer Hub with compared quotes without creating an account, **so that** I can see the offers before deciding to purchase.

**Preconditions:**
- Buyer has Magic Link from SP
- Magic Link is not expired

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-081 | Buyers can view Offer Hub without login (guest viewing) | P0 |
| BR-082 | Offer Hub displays all quotes with product details, prices, delivery terms, payment terms | P0 |
| BR-083 | Buyers must login to pre-provisioned account to proceed to payment (guest checkout prohibited) | P0 |
| BR-084 | Buyer accounts are pre-provisioned by Seller via Customer Management (B2B CRM) module before Magic Link is sent | P0 |
| BR-085 | When Seller generates quote, Seller inputs buyer details (Name, Phone, Email) into CRM inline flow | P0 |
| BR-086 | System performs duplicate check by Phone/Email: Match found = link existing account; No match = auto-provision Shadow Account | P0 |
| BR-087 | Shadow Account created with system-generated default password sent via SMS/Email | P0 |
| BR-088 | Buyer clicks Magic Link and logs in with pre-provisioned credentials (or uses "Forgot Password") | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-56 | Buyer has Magic Link | Buyer opens link | System displays Offer Hub with all quotes, no login required |
| AC-57 | Buyer views Offer Hub | Buyer sees quote details | System displays product-by-product comparison, totals, delivery terms, payment terms |
| AC-58 | Buyer wants to purchase | Buyer clicks "สั่งซื้อ" | System prompts for login with pre-provisioned credentials (Phone + Password or "Forgot Password") |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-45 | Buyer opens expired Magic Link | Display "ลิงก์หมดอายุ กรุณาติดต่อ SP" with SP contact info |
| EC-46 | Buyer shares link with others | Link works for anyone; no user-specific restrictions |
| EC-47 | Buyer views link on mobile | Responsive layout adapts; all quotes visible (stacked view) |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Invalid link | Tampered or malformed link | ลิงก์ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง | Contact SP |
| Offer load failure | Server error | ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading Offer Hub | Show loading spinner |
| Success | Offers loaded | Display comparison table with all quotes |
| Error | Load fails | Show error message with retry option |

#### US-15: Buyer Multi-Seller Decoupled Checkout
**As a** buyer, **I want to** purchase from multiple sellers in my chosen order, **so that** I have flexibility in payment sequencing.

**Preconditions:**
- Buyer has logged in with pre-provisioned account (Shadow Account or existing Allkons M account)
- Buyer has selected quotes from multiple sellers

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-089 | KYC exemption for non-credit payment methods (cash, bank transfer, credit card) | P0 |
| BR-090 | KYC required only for credit-based payments (30/60/90 day terms) | P0 |
| BR-091 | Each seller's order is independent (decoupled checkout) | P0 |
| BR-092 | Buyer chooses payment sequence for multi-seller orders | P0 |
| BR-093 | Each seller order has separate payment, delivery, and tracking | P0 |
| BR-094 | Buyer can complete partial checkout (pay some sellers, skip others) | P0 |
| BR-095 | SP commission triggered only when buyer completes payment | P0 |
| BR-157 | Multi-seller checkout remains decoupled per seller | P0 |
| BR-158 | Direct transfer payment must be handled separately per seller | P0 |
| BR-159 | Payment gateway payment must be handled separately per seller | P0 |
| BR-160 | Checkout flow must reflect per-seller payment handling and status | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Payment Method | Must select payment method for each seller | กรุณาเลือกวิธีการชำระเงิน |
| Delivery Address | Required for each seller | กรุณากรอกที่อยู่จัดส่ง |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-63 | Buyer has selected quotes from multiple sellers | Buyer proceeds to checkout | System displays separate checkout for each seller with payment options |
| AC-64 | Buyer selects payment sequence | Buyer chooses which seller to pay first | System processes payments in buyer's chosen order |
| AC-65 | Buyer completes payment for one seller | Payment confirmed | System creates order for that seller, triggers SP commission, allows buyer to proceed to next seller |
| AC-66 | Buyer skips payment for some sellers | Buyer completes partial checkout | System creates orders only for paid sellers; unpaid sellers remain in cart |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-51 | Payment fails for one seller | Buyer can retry payment or skip to next seller |
| EC-52 | Buyer abandons checkout mid-sequence | Completed payments processed; remaining sellers stay in cart |
| EC-53 | Seller becomes inactive during checkout | Display warning; allow buyer to remove seller and continue |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Payment failure | Payment gateway error | การชำระเงินล้มเหลว กรุณาลองใหม่ | Retry payment |
| Order creation failure | Server error | ไม่สามารถสร้างคำสั่งซื้อได้ กรุณาลองใหม่ | Retry order creation |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Processing payment | Show loading spinner with "กำลังดำเนินการ..." |
| Success | Payment completed | Display order confirmation with tracking link |
| Error | Payment fails | Show error message with retry option |

---

### EPIC-11: SP Commission Management & Payout

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-11 |
| **Goal** | Enable SPs to track commission earnings based on Platform Fee collection, view payout readiness, request withdrawals, and monitor adjustments; Enable Allkons Admin to manage full commission domain including policy setup, fee-to-commission monitoring, payout batch processing, exception handling, and audit governance with clear separation from Seller Sales Commission |
| **Scope** | SP commission calculation from Platform Fee only, estimated vs confirmed commission lifecycle, fee collection dependency tracking, payout with 5 THB withdrawal fee, commission adjustments/clawback, separate Orders and Commissions menus, role-based visibility (SP/Leader/Admin), 3-layer transaction model (Buyer↔Seller, Seller↔Allkons, Allkons↔SP), commission status flows, fee collection modes support; Admin commission policy management (Global/Category/Seller/Seller+Category/SP Tier/Campaign), rule precedence and conflict detection, fee-to-commission lifecycle monitoring, payout batch management, exception handling, comprehensive audit logging, role-based admin access (Viewer/Manager/Payout Manager/Finance Admin/Super Admin) |
| **Out of Scope** | Seller Sales Commission display, commission negotiation, automated payout approval without fee collection confirmation, commission display in early product discovery, SP transaction management rights, commission rule stacking (single rule per transaction) |
| **Success Criteria** | SP commissions calculated accurately from Platform Fee; commission becomes confirmed only after fee collection; payout displays gross amount, 5 THB withdrawal fee, and net amount; Orders and Commissions separated into different menus; commission visibility restricted in product discovery; role-based access enforced; Admin can create and manage commission policies with category/seller rules; Admin can monitor fee collection and commission lifecycle; Admin can create and process payout batches; Admin can handle exceptions and adjustments; All admin actions auditable |
| **Maps to** | FR-085 to FR-097, FR-098 to FR-120 |

#### US-17A: Admin Configure SP Commission Engine
**As an** Allkons M admin, **I want to** configure SP commission base rates calculated from Platform Fee, **so that** I can adjust commission structure based on business needs while maintaining clear separation from Seller Sales Commission.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "Commission Manager" role

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-179 | Seller Sales Commission is out of display scope for this module | P0 |
| BR-180 | Startup Partner Commission is the only commission type in functional UI/reporting scope | P0 |
| BR-181 | SP commission must be calculated from Platform Fee only | P0 |
| BR-182 | Payment Fee must not be used as commission base | P0 |
| BR-183 | SP Commission = Platform Fee × Base Commission Rate | P0 |
| BR-184 | Platform Fee = 2% of Sale Order | P0 |
| BR-185 | Commission rate is configurable by Admin | P0 |
| BR-186 | Different commission rates can be set for different SP tiers, product categories, or sellers | P1 |
| BR-187 | Commission rate changes apply to future transactions only (not retroactive) | P0 |
| BR-188 | Audit log of commission rate changes required | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Commission Rate | Must be 0-100%, decimal allowed | กรุณากรอกอัตราค่าคอมมิชชัน (0-100%) |
| Platform Fee Percentage | Must be positive number | กรุณากรอกเปอร์เซ็นต์ค่าธรรมเนียมแพลตฟอร์ม |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-86 | Admin is on SP commission settings page | Admin views current rates | System displays SP commission rates by tier/category/seller with Platform Fee base calculation |
| AC-87 | Admin updates SP commission rate | Admin enters new rate and clicks "บันทึก" | System saves new rate, applies to future transactions, logs change with timestamp and admin name |
| AC-88 | Admin views audit log | Admin clicks "ประวัติการเปลี่ยนแปลง" | System displays all SP commission rate changes with timestamp, admin name, old/new values |
| AC-89 | Admin views commission calculation formula | Admin hovers over info icon | System displays "SP Commission = Platform Fee (2% of Order) × Base Rate" |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-69 | Admin sets rate to 0% | System allows; SPs earn no commission (valid for testing or special cases) |
| EC-70 | Admin sets rate above 100% | Display validation error "อัตราต้องไม่เกิน 100%" |
| EC-71 | Rate change during active transaction | Old rate applies to that transaction; new rate applies to next |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Save failure | Server error | ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Saving settings | Show loading spinner |
| Success | Settings saved | Display success message "บันทึกอัตราค่าคอมมิชชัน SP สำเร็จ" |
| Error | Save fails | Show error message with retry option |

#### US-17B: SP View Commission Overview Dashboard
**As a** Startup Partner, **I want to** view my commission overview dashboard with clear separation from Orders menu, **so that** I can track estimated, confirmed, and payout-ready earnings based on Platform Fee collection.

**Preconditions:**
- SP is logged in to SP Portal
- SP has access to Commissions menu (separate from Orders)

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-189 | SP commission becomes confirmed only after Platform Fee is successfully collected from seller | P0 |
| BR-190 | Estimated commission may be created after order completion and fee calculation | P0 |
| BR-191 | Commission remains pending until platform fee collection is successful | P0 |
| BR-192 | Commission lifecycle must track: Not Eligible, Estimated, Awaiting Fee Collection, Confirmed, Ready for Payout, Payout Processing, Paid, Failed, Reversed/Clawed Back | P0 |
| BR-205 | Commissions and Orders must be separated in information architecture | P0 |
| BR-206 | Orders menu is for operational transaction and order tracking | P0 |
| BR-207 | Commissions menu is for earnings, fee dependency, payout readiness, payout history, adjustments | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-90 | SP navigates to Commissions menu | SP clicks "ค่าคอมมิชชัน" | System displays commission overview dashboard separate from Orders menu |
| AC-91 | SP views commission overview | SP sees dashboard | System displays: Estimated Commission, Confirmed Commission, Ready to Withdraw, Processing Payout, Paid This Month, Adjusted/Reversed |
| AC-92 | SP views estimated commission | SP sees estimated section | System shows commissions where order completed but fee not yet collected |
| AC-93 | SP views confirmed commission | SP sees confirmed section | System shows commissions where Platform Fee successfully collected |
| AC-94 | SP views ready to withdraw | SP sees payout section | System shows confirmed commissions above minimum threshold ready for payout |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-72 | SP with no commissions yet | Display "คุณยังไม่มีค่าคอมมิชชัน เริ่มต้นด้วยการสร้าง RFQ" |
| EC-73 | All commissions awaiting fee collection | Estimated section shows amounts, Confirmed section shows 0 |
| EC-74 | Confirmed amount below minimum threshold | Display "ยอดคงเหลือต่ำกว่าขั้นต่ำในการถอน (500 THB)" |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Dashboard load failure | Server error | ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading dashboard | Show loading spinner with "กำลังโหลดข้อมูลค่าคอมมิชชัน..." |
| Empty | No commissions yet | Display empty state with "เริ่มต้นสร้าง RFQ" button |
| Success | Data loaded | Display commission overview with all status sections |
| Error | Load fails | Show error message with retry option |

#### US-17C: SP View Commission Transactions
**As a** Startup Partner, **I want to** view detailed commission transaction list with Platform Fee, fee collection status, and commission status, **so that** I can track earnings progression from estimated to confirmed.

**Preconditions:**
- SP is logged in to SP Portal
- SP navigates to Commissions > Transactions

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-193 | Fee lifecycle must track: Not Calculated, Calculated, Invoiced/Billed, Collection Pending, Collected, Collection Failed, Waived/Adjusted | P0 |
| BR-194 | System must support 3 fee collection modes: Payment Gateway, Direct Transfer, Store Credit | P0 |
| BR-195 | Fee collection mode affects commission confirmation timing | P0 |
| BR-196 | If fee included in order and collected immediately, commission moves to confirmed faster | P0 |
| BR-197 | If fee collected later, commission remains in "Awaiting Fee Collection" status | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-95 | SP views commission transactions | SP clicks "ธุรกรรม" tab | System displays transaction table with: Order ID, Buyer Name, Seller/Branch, Order Amount, Platform Fee, Base Rate, Estimated Commission, Confirmed Commission, Fee Collection Status, Commission Status, Order Completion Date, Payout Batch/Date |
| AC-96 | SP filters transactions | SP selects status filter | System filters by commission status (Estimated, Awaiting Fee Collection, Confirmed, Paid, Reversed) |
| AC-97 | SP filters by date range | SP selects date range | System filters transactions by order completion date |
| AC-98 | SP exports commission statement | SP clicks "ดาวน์โหลดรายงาน" | System generates PDF/Excel with commission transaction details |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-75 | Transaction with fee collection pending | Show Estimated Commission, Fee Collection Status: "Collection Pending", Commission Status: "Awaiting Fee Collection" |
| EC-76 | Transaction with fee collected | Show Confirmed Commission, Fee Collection Status: "Collected", Commission Status: "Confirmed" |
| EC-77 | No transactions yet | Display "ยังไม่มีธุรกรรมค่าคอมมิชชัน" |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Transaction load failure | Server error | ไม่สามารถโหลดข้อมูลธุรกรรมได้ กรุณาลองใหม่ | Retry button |
| Export failure | Report generation error | ไม่สามารถสร้างรายงานได้ กรุณาลองใหม่ | Retry export |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading transactions | Show loading spinner |
| Empty | No transactions | Display empty state |
| Success | Data loaded | Display transaction table with filters |
| Error | Load fails | Show error message with retry option |

#### US-17D: SP Request Commission Payout
**As a** Startup Partner, **I want to** request commission payout with clear visibility of gross amount, 5 THB withdrawal fee, and net amount, **so that** I understand the final payout I will receive.

**Preconditions:**
- SP is logged in to SP Portal
- SP has confirmed commission above minimum threshold (500 THB)

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-198 | Commission payout to SP must deduct 5 THB withdrawal fee per payout transaction | P0 |
| BR-199 | System must show gross amount, withdrawal fee, and net payout amount | P0 |
| BR-200 | SP must see amount ready for payout and final net amount after fee deduction | P0 |
| BR-201 | Minimum payout threshold applies (e.g., 500 THB) | P0 |
| BR-202 | Payout processed through Allkons payment gateway | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Payout Amount | Must be >= 500 THB | ยอดถอนขั้นต่ำ 500 THB |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-99 | SP has confirmed commission >= 500 THB | SP navigates to payout section | System displays gross amount, 5 THB withdrawal fee, net amount, and "ขอถอนเงิน" button |
| AC-100 | SP requests payout | SP clicks "ขอถอนเงิน" and confirms | System creates payout request, deducts 5 THB fee, displays net amount, updates status to "Processing Payout" |
| AC-101 | SP has confirmed commission < 500 THB | SP views payout section | System displays "ยอดคงเหลือต่ำกว่าขั้นต่ำในการถอน (500 THB)" with disabled button |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-78 | Confirmed amount exactly 500 THB | Allow payout, net amount = 495 THB (500 - 5) |
| EC-79 | Confirmed amount 499 THB | Disable payout button, show threshold message |
| EC-80 | Multiple payout requests in same month | Each payout deducts 5 THB fee separately |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Payout request failure | Server error | ไม่สามารถส่งคำขอถอนเงินได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Processing payout request | Show loading spinner |
| Success | Payout requested | Display success message with net amount |
| Error | Request fails | Show error message with retry option |

#### US-17E: SP View Payout History
**As a** Startup Partner, **I want to** view my payout history with batch ID, gross amount, withdrawal fee, and net amount, **so that** I can track all my commission payouts.

**Preconditions:**
- SP is logged in to SP Portal
- SP navigates to Commissions > Payouts

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-203 | Payout history must display: batch ID, gross amount, 5 THB withdrawal fee, net amount, status, date, reference | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-102 | SP views payout history | SP clicks "ประวัติการถอน" tab | System displays payout table with: Payout Batch ID, Gross Amount, Withdrawal Fee (5 THB), Net Amount, Payout Status, Payout Date, Payout Reference |
| AC-103 | SP filters payout history | SP selects date range | System filters payouts by payout date |
| AC-104 | SP exports payout history | SP clicks "ดาวน์โหลด" | System generates PDF/Excel with payout history |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-81 | No payouts yet | Display "ยังไม่มีประวัติการถอนเงิน" |
| EC-82 | Payout failed | Show status "Failed" with retry option |
| EC-83 | Payout processing | Show status "Processing" with estimated completion time |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| History load failure | Server error | ไม่สามารถโหลดประวัติการถอนเงินได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading payout history | Show loading spinner |
| Empty | No payouts | Display empty state |
| Success | Data loaded | Display payout history table |
| Error | Load fails | Show error message with retry option |

#### US-17F: SP View Commission Adjustments
**As a** Startup Partner, **I want to** view commission adjustments including clawbacks for refunds, **so that** I understand changes to my commission earnings.

**Preconditions:**
- SP is logged in to SP Portal
- SP navigates to Commissions > Adjustments

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-204 | Refund, fee reversal, or manual correction must support commission adjustment or clawback | P0 |
| BR-205 | Full refund triggers full commission clawback | P0 |
| BR-206 | Partial refund triggers proportional commission adjustment | P0 |
| BR-207 | Manual adjustments require Admin approval and reason | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-105 | SP views adjustments | SP clicks "รายการปรับปรุง" tab | System displays adjustment table with: Order Reference, Adjustment Reason, Adjustment Type, Adjustment Amount, Before/After, Created Date |
| AC-106 | Full refund occurs | Order fully refunded | System creates clawback adjustment, displays in adjustment list |
| AC-107 | Partial refund occurs | Order partially refunded | System creates proportional adjustment, displays calculation |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-84 | No adjustments yet | Display "ยังไม่มีรายการปรับปรุงค่าคอมมิชชัน" |
| EC-85 | Multiple adjustments for same order | Display all adjustments chronologically |
| EC-86 | Adjustment reduces confirmed commission below 0 | Display negative balance, deduct from next confirmed commission |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Adjustment load failure | Server error | ไม่สามารถโหลดรายการปรับปรุงได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading adjustments | Show loading spinner |
| Empty | No adjustments | Display empty state |
| Success | Data loaded | Display adjustment table |
| Error | Load fails | Show error message with retry option |

#### US-17G: Admin Manage Commission Adjustments
**As an** Allkons M admin, **I want to** create manual commission adjustments and process clawbacks, **so that** I can correct commission errors and handle refund scenarios.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "Commission Manager" role

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-208 | Admin can create manual adjustments with reason | P0 |
| BR-209 | System automatically creates clawback adjustments for refunds | P0 |
| BR-210 | All adjustments require approval and audit trail | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Adjustment Reason | Required, max 500 chars | กรุณาระบุเหตุผลในการปรับปรุง |
| Adjustment Amount | Must be non-zero | กรุณากรอกจำนวนเงินที่ต้องการปรับปรุง |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-108 | Admin creates manual adjustment | Admin enters SP, amount, reason, clicks "บันทึก" | System creates adjustment, notifies SP, logs in audit trail |
| AC-109 | Admin views adjustment history | Admin clicks "ประวัติการปรับปรุง" | System displays all adjustments with SP, amount, reason, created by, date |
| AC-110 | Refund processed | Order refunded in system | System automatically creates clawback adjustment |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-87 | Adjustment for SP with no commissions | Allow adjustment, create negative balance |
| EC-88 | Large adjustment amount | Require additional approval for amounts > 10,000 THB |
| EC-89 | Adjustment reversal needed | Admin can create offsetting adjustment |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Adjustment creation failure | Server error | ไม่สามารถสร้างรายการปรับปรุงได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Creating adjustment | Show loading spinner |
| Success | Adjustment created | Display success message |
| Error | Creation fails | Show error message with retry option |

#### US-17H: SP Leader View Team Commission Data
**As a** SP Leader, **I want to** view team commission data in read-only mode, **so that** I can monitor team performance without editing capabilities.

**Preconditions:**
- SP Leader is logged in to SP Portal
- Leader has assigned team members

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-211 | SP Leader sees team-level SP commission data in read-only mode | P0 |
| BR-212 | SP Leader cannot edit commission data or request payouts for team members | P0 |
| BR-213 | SP Leader can filter by team member, date range, status | P1 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-111 | Leader views team commission | Leader clicks "ค่าคอมมิชชันทีม" | System displays team commission overview (read-only) |
| AC-112 | Leader views team transactions | Leader clicks team member | System shows member's commission transactions (read-only) |
| AC-113 | Leader attempts to edit | Leader tries to modify commission | System denies with "ดูข้อมูลเท่านั้น" message |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-90 | Leader with no team members | Display "ยังไม่มีสมาชิกในทีม" |
| EC-91 | Team member with no commissions | Display "สมาชิกยังไม่มีค่าคอมมิชชัน" |
| EC-92 | Leader views own commissions | Show separately from team view |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Team data load failure | Server error | ไม่สามารถโหลดข้อมูลทีมได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading team data | Show loading spinner |
| Empty | No team data | Display empty state |
| Success | Data loaded | Display team commission data (read-only) |
| Error | Load fails | Show error message with retry option |

#### US-17I: SP View Orders with Commission Status
**As a** Startup Partner, **I want to** view orders with commission status badges in a separate Orders menu, **so that** I can track operational fulfillment while seeing related commission status without detailed calculations.

**Preconditions:**
- SP is logged in to SP Portal
- SP navigates to Orders menu (separate from Commissions)

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-214 | Orders menu is for operational transaction and order tracking | P0 |
| BR-215 | Orders view may show commission status badge but not detailed calculations | P0 |
| BR-216 | Detailed commission calculations belong in Commissions menu only | P0 |
| BR-217 | Cancelled/Refunded orders should be tabs/filters within Orders menu for phase 1, not separate top-level menu | P0 |
| BR-218 | Order fulfillment status must track: Ordered, Delivering, Completed, Cancelled, Refunded/Partially Refunded | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-114 | SP views Orders menu | SP clicks "คำสั่งซื้อ" | System displays order list with tabs: All, In Progress, Completed, Cancelled, Refunded |
| AC-115 | SP views order details | SP clicks order | System shows: Order ID, Buyer Name, Seller/Branch, Order Amount, Payment Method, Payment Status, Fulfillment Status, Order Created Date, Delivery Date, Commission Status Badge |
| AC-116 | SP sees commission badge | SP views order | System displays badge: "No Commission Yet", "Estimated", "Awaiting Fee Collection", "Confirmed", "Paid", "Adjusted/Reversed" |
| AC-117 | SP clicks commission badge | SP wants commission details | System redirects to Commissions menu with that transaction highlighted |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-93 | Order with no commission eligibility | Display "No Commission Yet" badge |
| EC-94 | Order completed but fee not collected | Display "Awaiting Fee Collection" badge |
| EC-95 | Refunded order with clawback | Display "Adjusted/Reversed" badge |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Order load failure | Server error | ไม่สามารถโหลดคำสั่งซื้อได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading orders | Show loading spinner |
| Empty | No orders | Display "ยังไม่มีคำสั่งซื้อ" |
| Success | Data loaded | Display order list with commission badges |
| Error | Load fails | Show error message with retry option |

#### US-17J: Admin Manage Commission Policies
**As an** Allkons M admin, **I want to** create and manage commission policies with different scope types, **so that** I can configure flexible commission rules for Global, Category, Seller, Seller+Category, SP Tier, and Campaign scenarios.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "Commission Manager" role or higher

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-221 | System must support commission policy management for Global, Category, Seller, Seller+Category, SP Tier, Campaign scopes | P0 |
| BR-222 | Commission engine must apply only one commission rule per commission source unless future policy enables stacking | P0 |
| BR-223 | Rule precedence order: Campaign/Override → Seller+Category → Category → Seller → SP Tier → Global Base Rate | P0 |
| BR-224 | Most specific matching rule must override more general rules | P0 |
| BR-225 | Global base commission rate used only as fallback when no specific rule matches | P0 |
| BR-226 | System must detect overlapping commission rules with same scope and effective period | P0 |
| BR-227 | System must warn Admin of policy conflicts before save | P0 |
| BR-228 | System must display which rule will be applied based on priority and specificity | P0 |
| BR-229 | Commission policies must support effective date ranges (effectiveFrom, effectiveTo) | P0 |
| BR-230 | Admin can activate/deactivate policies without deletion | P0 |
| BR-231 | Policy changes must not be retroactive (apply to future transactions only) | P0 |
| BR-232 | All policy changes must be auditable with version history | P0 |
| BR-294 | Commission policy creation requires approval workflow (maker/checker pattern): Creator submits → Approver reviews → Approved/Rejected | P1 |
| BR-295 | Super Admin sees all commission data across the entire organization | P0 |
| BR-296 | Leader sees team commission data plus related data (sales, orders) | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Policy Name | Required, max 200 chars | กรุณากรอกชื่อนโยบาย |
| Commission Rate | Must be 0-100%, decimal allowed | กรุณากรอกอัตราค่าคอมมิชชัน (0-100%) |
| Effective From | Required, must be valid date | กรุณาเลือกวันที่เริ่มต้น |
| Scope Value | Required for non-global policies | กรุณาระบุขอบเขตนโยบาย |
| Priority | Must be positive integer | กรุณากรอกลำดับความสำคัญ |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-118 | Admin creates new policy | Admin enters policy details and clicks "บันทึก" | System creates policy, logs in audit trail, displays success message |
| AC-119 | Admin creates overlapping policy | Admin saves policy with same scope and period | System warns "นโยบายนี้ทับซ้อนกับนโยบายที่มีอยู่" with conflict details |
| AC-120 | Admin views policy list | Admin navigates to Policy Setup | System displays all policies with name, type, scope, rate, effective dates, status |
| AC-121 | Admin activates policy | Admin clicks "เปิดใช้งาน" | System activates policy, applies to future transactions, logs action |
| AC-122 | Admin deactivates policy | Admin clicks "ปิดใช้งาน" | System deactivates policy, stops applying to new transactions, logs action |
| AC-123 | Admin views policy history | Admin clicks "ประวัติการเปลี่ยนแปลง" | System displays all changes with timestamp, admin name, before/after values |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-96 | Multiple policies match same transaction | System applies highest priority/most specific rule only |
| EC-97 | Policy effective date in past | System applies to transactions from effective date forward, not retroactively |
| EC-98 | Admin tries to delete active policy | System prevents deletion, requires deactivation first |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Policy save failure | Server error | ไม่สามารถบันทึกนโยบายได้ กรุณาลองใหม่ | Retry button |
| Invalid scope value | Category/Seller ID not found | ไม่พบหมวดหมู่/ร้านค้าที่ระบุ | Correct scope value |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Saving policy | Show loading spinner |
| Success | Policy saved | Display success message with policy details |
| Warning | Conflict detected | Display warning dialog with conflict details and option to proceed |
| Error | Save fails | Show error message with retry option |

#### US-17K: Admin Configure Category-Based Commission Rules
**As an** Allkons M admin, **I want to** configure category-specific commission rates, **so that** I can offer different commission rates for different product categories.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "Commission Manager" role or higher
- Product categories exist in system

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-233 | Category-based commission rules must reference valid product categories | P0 |
| BR-234 | Category rules override global base rate for matching transactions | P0 |
| BR-235 | Multiple category rules can exist with different effective periods | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Category ID | Must exist in product catalog | ไม่พบหมวดหมู่สินค้าที่ระบุ |
| Commission Rate | Must be 0-100% | กรุณากรอกอัตราค่าคอมมิชชัน (0-100%) |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-124 | Admin creates category rule | Admin selects category, enters rate, clicks "บันทึก" | System creates category-based policy, validates category exists |
| AC-125 | Transaction matches category rule | Order contains product from category with specific rule | System applies category rule instead of global base rate |
| AC-126 | Admin views category rules | Admin filters by policy type "Category" | System displays all category-based policies |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-99 | Product belongs to multiple categories | System applies highest priority category rule |
| EC-100 | Category deleted from catalog | System marks policy as invalid, requires admin review |
| EC-101 | Order with mixed categories | System applies appropriate rule per product line item |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Invalid category | Category ID not found | ไม่พบหมวดหมู่สินค้าที่ระบุ | Select valid category |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading categories | Show loading spinner |
| Success | Rule saved | Display success message |
| Error | Validation fails | Show error message with details |

#### US-17L: Admin Configure Seller-Based Commission Rules
**As an** Allkons M admin, **I want to** configure seller-specific and seller+category commission rates, **so that** I can offer customized commission structures for strategic partnerships.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "Commission Manager" role or higher
- Sellers exist in system

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-236 | Seller-based commission rules must reference valid seller IDs | P0 |
| BR-237 | Seller+Category rules must have higher priority than individual Category or Seller rules | P0 |
| BR-238 | Seller rules override global base rate and category rules for matching transactions | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Seller ID | Must exist in seller database | ไม่พบร้านค้าที่ระบุ |
| Category ID (if combination) | Must exist in product catalog | ไม่พบหมวดหมู่สินค้าที่ระบุ |
| Commission Rate | Must be 0-100% | กรุณากรอกอัตราค่าคอมมิชชัน (0-100%) |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-127 | Admin creates seller rule | Admin selects seller, enters rate, clicks "บันทึก" | System creates seller-based policy, validates seller exists |
| AC-128 | Admin creates seller+category rule | Admin selects seller and category, enters rate | System creates combination policy with highest priority |
| AC-129 | Transaction matches seller+category | Order from specific seller with specific category | System applies seller+category rule (highest specificity) |
| AC-130 | Admin views seller rules | Admin filters by policy type "Seller" | System displays all seller-based policies |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-102 | Seller has both seller rule and seller+category rule | System applies seller+category rule for matching category, seller rule for others |
| EC-103 | Seller deactivated in system | System marks policy as invalid, requires admin review |
| EC-104 | Multi-seller order | System applies appropriate rule per seller |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Invalid seller | Seller ID not found | ไม่พบร้านค้าที่ระบุ | Select valid seller |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading sellers | Show loading spinner |
| Success | Rule saved | Display success message |
| Error | Validation fails | Show error message with details |

#### US-17M: Admin Monitor Fee Collection and Commission Lifecycle
**As an** Allkons M admin, **I want to** monitor the full chain from order completion to fee collection to commission confirmation, **so that** I can identify and resolve bottlenecks and exceptions.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "Commission Viewer" role or higher

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-239 | Admin must be able to monitor full chain: Order → Fee Calculation → Fee Collection → Commission Confirmation → Payout | P0 |
| BR-240 | System must track and display fee lifecycle status per order | P0 |
| BR-241 | System must track and display commission lifecycle status per commission source | P0 |
| BR-242 | Admin dashboard must show exception cases requiring attention | P0 |
| BR-243 | System must support filtering and searching across fee and commission monitoring views | P1 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-131 | Admin views fee monitoring | Admin navigates to Fee Monitoring | System displays orders grouped by: Fee Not Calculated, Fee Calculated Not Collected, Fee Collection Pending, Fee Collected |
| AC-132 | Admin views commission monitoring | Admin navigates to Commission Monitoring | System displays commissions grouped by: Estimated, Awaiting Fee Collection, Confirmed, Ready for Payout |
| AC-133 | Admin views exception queue | Admin clicks "Exception Cases" | System displays failed fee collections, stuck commissions, policy conflicts |
| AC-134 | Admin filters by date range | Admin selects date range | System filters monitoring views by order completion date |
| AC-135 | Admin searches by order ID | Admin enters order ID | System displays matching order with full lifecycle status |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-105 | Fee collection stuck for > 30 days | System highlights in exception queue with "Overdue" flag |
| EC-106 | Commission without matching fee record | System flags as data integrity issue |
| EC-107 | Large volume of exceptions | System paginates and provides export functionality |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Monitoring load failure | Server error | ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading monitoring data | Show loading spinner |
| Success | Data loaded | Display monitoring dashboard with metrics and lists |
| Error | Load fails | Show error message with retry option |

#### US-17N: Admin Manage Payout Batches
**As an** Allkons M admin, **I want to** create and process payout batches for confirmed commissions, **so that** I can efficiently pay multiple SPs and track payout execution.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "Payout Manager" role or higher
- Confirmed commissions exist above minimum threshold

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-244 | Admin must be able to create payout batches from confirmed commissions | P0 |
| BR-245 | Payout batch must calculate total gross amount, total withdrawal fee (5 THB × count), total net amount | P0 |
| BR-246 | Payout batch statuses: Draft, Ready, Processing, Completed, Failed, Partially Completed, Cancelled | P0 |
| BR-247 | Admin must be able to review batch details before processing | P0 |
| BR-248 | Payout processing must integrate with Allkons payment gateway | P0 |
| BR-249 | System must track payout batch creation, processing, and completion timestamps | P0 |
| BR-250 | Failed payouts must be retryable without creating duplicates | P0 |
| BR-251 | Partially completed batches must track which SPs were paid and which failed | P0 |
| BR-252 | Admin must be able to reconcile payout data with payment gateway records | P0 |
| BR-253 | Payout batches must be auditable with full history | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Batch Name | Required, max 200 chars | กรุณากรอกชื่อชุดการจ่าย |
| Commission Selection | At least 1 commission required | กรุณาเลือกค่าคอมมิชชันอย่างน้อย 1 รายการ |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-136 | Admin creates payout batch | Admin selects confirmed commissions, enters batch name, clicks "สร้างชุด" | System creates batch with Draft status, calculates totals |
| AC-137 | Admin reviews batch | Admin views batch details | System displays: SP list, gross amounts, withdrawal fees (5 THB each), net amounts, total summary |
| AC-138 | Admin processes batch | Admin clicks "ดำเนินการจ่าย" | System changes status to Processing, initiates payment gateway integration |
| AC-139 | Batch completes successfully | All payouts succeed | System updates status to Completed, marks commissions as Paid |
| AC-140 | Batch partially fails | Some payouts fail | System updates status to Partially Completed, tracks failed SPs, allows retry |
| AC-141 | Admin retries failed payouts | Admin clicks "ลองใหม่" on failed items | System retries only failed payouts without duplicating successful ones |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-108 | Batch with 1000+ SPs | System processes in chunks, provides progress indicator |
| EC-109 | Payment gateway timeout | System marks batch as Failed, allows retry |
| EC-110 | SP bank account invalid | System marks that SP payout as Failed, continues with others |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Batch creation failure | Server error | ไม่สามารถสร้างชุดการจ่ายได้ กรุณาลองใหม่ | Retry button |
| Payment gateway error | Gateway unavailable | ไม่สามารถเชื่อมต่อระบบจ่ายเงินได้ กรุณาลองใหม่ภายหลัง | Retry later |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Draft | Batch created | Show edit options, allow modifications |
| Ready | Batch finalized | Show process button, prevent edits |
| Processing | Payment in progress | Show progress indicator, disable actions |
| Completed | All payouts successful | Show success summary, allow export |
| Failed | All payouts failed | Show error details, allow retry |
| Partially Completed | Some payouts failed | Show mixed status, allow retry of failed items |

#### US-17O: Admin Handle Commission Exceptions
**As an** Allkons M admin, **I want to** handle commission exceptions including fee failures, refunds, and manual adjustments, **so that** I can maintain commission accuracy and resolve edge cases.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "Finance Admin" role or higher

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-254 | Full refund must trigger full commission clawback | P0 |
| BR-255 | Partial refund must trigger proportional commission adjustment | P0 |
| BR-256 | Fee collection failure must prevent commission confirmation | P0 |
| BR-257 | Fee waiver must be handled as exception requiring manual decision | P0 |
| BR-258 | Manual adjustments must require reason and admin approval | P0 |
| BR-259 | Payout retry must check for existing successful payout to prevent duplicates | P0 |
| BR-260 | Exception queue must prioritize by impact and age | P1 |
| BR-261 | All exception handling actions must be auditable | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Adjustment Reason | Required, max 500 chars | กรุณาระบุเหตุผลในการปรับปรุง |
| Adjustment Amount | Must be non-zero | กรุณากรอกจำนวนเงินที่ต้องการปรับปรุง |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-142 | Full refund processed | Order fully refunded | System automatically creates clawback adjustment, updates commission status to Reversed |
| AC-143 | Partial refund processed | Order partially refunded | System calculates proportional adjustment, creates adjustment record |
| AC-144 | Admin creates manual adjustment | Admin enters amount, reason, clicks "บันทึก" | System creates adjustment, requires approval if > threshold, logs in audit trail |
| AC-145 | Admin views exception queue | Admin navigates to Exceptions | System displays: fee collection failures, stuck commissions, policy conflicts, sorted by priority |
| AC-146 | Admin retries failed payout | Admin clicks "ลองใหม่" | System checks for duplicate, retries payout if safe |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-111 | Clawback exceeds SP balance | System creates negative balance, deducts from future commissions |
| EC-112 | Multiple refunds for same order | System creates separate adjustment for each refund |
| EC-113 | Fee waived by management | Admin manually marks fee as Waived, decides commission treatment |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Adjustment creation failure | Server error | ไม่สามารถสร้างรายการปรับปรุงได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Processing exception | Show loading spinner |
| Success | Exception resolved | Display success message, remove from queue |
| Error | Resolution fails | Show error message with retry option |

#### US-17P: Admin Review Commission Audit Logs
**As an** Allkons M admin, **I want to** review comprehensive audit logs for all commission operations, **so that** I can ensure compliance, investigate issues, and maintain governance.

**Preconditions:**
- Admin is logged in to Admin Portal
- Admin has "Commission Viewer" role or higher

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-262 | All commission policy creation and updates must be logged with admin user, timestamp, before/after values | P0 |
| BR-263 | All payout batch actions must be logged (creation, processing, completion, cancellation) | P0 |
| BR-264 | All manual adjustments must record reason, actor, timestamp, before/after values | P0 |
| BR-265 | All clawback actions must be logged with reason and related refund reference | P0 |
| BR-266 | Audit logs must be immutable and retained per regulatory requirements | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-147 | Admin views audit logs | Admin navigates to Audit Logs | System displays all commission-related actions with timestamp, admin, action type, entity |
| AC-148 | Admin filters by action type | Admin selects "Policy Changes" | System filters to show only policy creation/update/activation/deactivation |
| AC-149 | Admin filters by date range | Admin selects date range | System filters logs by action timestamp |
| AC-150 | Admin views log details | Admin clicks on log entry | System displays full details: before/after values, reason, IP address |
| AC-151 | Admin exports audit report | Admin clicks "ดาวน์โหลดรายงาน" | System generates CSV/PDF with filtered audit logs |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-114 | Large audit log volume | System paginates results, provides search functionality |
| EC-115 | Admin searches for specific order | System finds all related audit entries across policies, commissions, payouts |
| EC-116 | Audit log export for compliance | System includes all required fields per regulatory standards |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Audit log load failure | Server error | ไม่สามารถโหลดประวัติการตรวจสอบได้ กรุณาลองใหม่ | Retry button |
| Export failure | Report generation error | ไม่สามารถสร้างรายงานได้ กรุณาลองใหม่ | Retry export |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading audit logs | Show loading spinner |
| Success | Data loaded | Display audit log table with filters |
| Error | Load fails | Show error message with retry option |

---

### EPIC-12: SP Hierarchy Management

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-12 |
| **Goal** | Support 2-level hierarchy where Thammasorn internal sales reps (Leaders) supervise public freelance SPs (Members) |
| **Scope** | Leader-Member hierarchy, Leader capabilities, Member assignment, performance visibility, Leader transaction visibility (read-only), auto-provisioning for Thammasorn reps |
| **Out of Scope** | Multi-level hierarchy (>2 levels), commission sharing between Leader and Member, Leader performance bonuses, Leader transaction management rights |
| **Success Criteria** | Leaders can view and manage assigned Members; Member assignment works correctly; performance metrics visible; Leaders can view team transaction data in read-only mode |
| **Maps to** | FR-044, FR-045, FR-046, FR-082 |

#### US-19: Leader View and Manage Team Members
**As a** Leader (Thammasorn internal sales rep), **I want to** view and manage my assigned Members, **so that** I can provide guidance and support.

**Preconditions:**
- Leader is logged in to SP Portal
- Leader has assigned Members

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-108 | Leader level: Thammasorn internal sales reps (global service areas) | P0 |
| BR-109 | Member level: Public freelance SPs (assigned service areas) | P0 |
| BR-110 | Each Member assigned to one Leader | P0 |
| BR-111 | Leaders can have multiple Members | P0 |
| BR-112 | Leaders can view Member performance metrics but cannot edit Member data or commissions | P0 |
| BR-113 | Leaders can provide feedback or recommendations to Admin | P1 |
| BR-297 | Leader and Admin can track each SP's training and certification status, including module progress and assessment outcomes | P0 |
| BR-298 | Leader and Admin can assign retraining to specific SPs | P1 |
| BR-299 | Leader and Admin can control activation/deactivation of live selling permissions based on certification status | P0 |
| BR-300 | SP detail view must show comprehensive data including: profile, service areas, training status, sales, orders, commissions | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-74 | Leader is on team page | Leader views assigned Members | System displays list of Members with performance metrics (RFQs submitted, Quotes received, Conversions, Commissions earned) |
| AC-75 | Leader clicks on Member | Leader views Member detail | System displays Member profile, service areas, performance history |
| AC-76 | Leader wants to communicate with Member | Leader clicks "ส่งข้อความ" | System opens messaging interface |
| AC-77 | Leader provides feedback | Leader submits feedback to Admin | System sends feedback to Admin for review |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-60 | Leader has no assigned Members yet | Display "คุณยังไม่มีสมาชิกในทีม รอการมอบหมายจากแอดมิน" |
| EC-61 | Member performance is poor | Leader can flag for Admin review but cannot suspend Member |
| EC-62 | Leader tries to edit Member commission | System prevents action; display "ไม่สามารถแก้ไขค่าคอมมิชชันได้" |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Team load failure | Server error | ไม่สามารถโหลดข้อมูลทีมได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Loading team data | Show loading spinner |
| Empty | No Members assigned | Display empty state with message |
| Success | Data loaded | Display Member list with performance metrics |
| Error | Load fails | Show error message with retry option |

#### US-19A: SP Leader View Team Transaction Data
**As a** Leader (Thammasorn internal sales rep), **I want to** view transaction data of my team members, **so that** I can monitor team performance and provide support.

**Preconditions:**
- Leader is logged in to SP Portal
- Leader has assigned Members
- Members have completed transactions

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-148 | SP Leaders can view transaction data for their team members | P0 |
| BR-149 | Leader transaction visibility must be display-only (read-only) | P0 |
| BR-150 | Leaders must not be able to edit, override, or operate on transaction records | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| N/A | N/A | N/A |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-62 | Leader views team dashboard | Leader clicks "ธุรกรรมทีม" | System displays member transaction summary (read-only) |
| AC-63 | Leader clicks member transaction | Leader views transaction details | System shows transaction details (read-only) |
| AC-64 | Leader attempts to edit transaction | Leader tries to modify transaction | System denies with "ดูข้อมูลเท่านั้น ไม่สามารถแก้ไขได้" message |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-63 | Leader with no members | Display "ไม่มีสมาชิกในทีม" message |
| EC-64 | Leader viewing own transactions | System shows leader's own transactions separately from team view |
| EC-65 | Member has no transactions yet | Display "สมาชิกยังไม่มีธุรกรรม" for that member |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Transaction load failure | Server error | ไม่สามารถโหลดข้อมูลธุรกรรมได้ กรุณาลองใหม่ | Retry button |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Fetching transaction data | Show loading spinner with "กำลังโหลดธุรกรรม..." |
| Empty | No transactions | Display "ยังไม่มีธุรกรรม" message |
| Success | Data loaded | Display transaction list (read-only) |
| Error | Load fails | Show error message with retry option |

---

### EPIC-13: Dispute Resolution & Platform Mediation

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-13 |
| **Goal** | Provide dispute resolution workflows with Allkons M Admin as sole mediator and mechanisms to prevent platform circumvention |
| **Scope** | Dispute creation, dispute categorization, Admin mediation, circumvention reporting, dispute resolution history |
| **Out of Scope** | Automated dispute resolution, third-party arbitration, legal proceedings |
| **Success Criteria** | Disputes resolved within 7 days; circumvention reports investigated; dispute history maintained |
| **Maps to** | FR-047, FR-048, FR-049 |

#### US-20: SP Report Platform Circumvention
**As a** Startup Partner, **I want to** report sellers who attempt to bypass the platform, **so that** my commissions are protected.

**Preconditions:**
- SP is logged in to SP Portal
- SP has evidence of circumvention attempt

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-114 | Digital Quotation (approved via Offer Link) is the absolute legal source of truth for all transactions | P0 |
| BR-115 | Offline promises made by SPs are not recognized by the platform | P0 |
| BR-116 | Admin portal includes reporting mechanism for SPs to flag Sellers attempting to bypass platform | P0 |
| BR-117 | Admin investigates circumvention reports | P0 |
| BR-118 | Penalties for Sellers found guilty of circumvention (suspension from SP program, account suspension) | P0 |
| BR-119 | Evidence collection: Message history, timestamps, buyer confirmation | P0 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Description | Required, max 1000 chars | กรุณาระบุรายละเอียดการรายงาน |
| Evidence | At least 1 file attachment (screenshot, document) | กรุณาแนบหลักฐาน |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-78 | SP suspects circumvention | SP clicks "รายงานปัญหา" | System displays report form with description field and file upload |
| AC-79 | SP submits report | SP fills form and clicks "ส่งรายงาน" | System creates dispute with status "Open", notifies Admin, displays confirmation |
| AC-80 | Admin investigates report | Admin reviews evidence | Admin can request additional info, contact parties, make decision |
| AC-81 | Admin finds seller guilty | Admin confirms circumvention | System suspends seller from SP program, notifies SP and seller |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-63 | SP reports without sufficient evidence | Admin requests additional evidence before proceeding |
| EC-64 | Seller denies circumvention | Admin reviews message history and buyer confirmation to determine truth |
| EC-65 | Multiple SPs report same seller | Admin consolidates reports and investigates once |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Report submission failure | Server error | ไม่สามารถส่งรายงานได้ กรุณาลองใหม่ | Retry button |
| File upload failure | Network error | การอัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่ | Retry upload |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|  
| Loading | Submitting report | Show loading spinner |
| Success | Report submitted | Display confirmation with report ID |
| Error | Submission fails | Show error message with retry option |

---

### EPIC-14: SP Training & Certification

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-14 |
| **Goal** | Ensure all Startup Partners complete mandatory training, pass assessments, and achieve certification before accessing live selling features; enable Admin/Leader to track training progress and manage certifications |
| **Scope** | Training module delivery, knowledge assessments, workflow simulations, compliance acknowledgment, certification gate for live selling, retraining, Admin/Leader training management |
| **Out of Scope** | LMS platform integration, video hosting (use external links), gamification, training content creation tools |
| **Success Criteria** | All SPs complete training before live selling; assessment pass rate tracked; certification gate enforced; Admin can view training progress; retraining assignable |
| **Maps to** | FR-121 to FR-130 |

#### US-20A: SP Complete Required Training Modules
**As a** newly approved Startup Partner, **I want to** complete required training modules covering portal features, RFQ workflow, and compliance, **so that** I understand how to use the platform effectively and can earn my certification.

**Preconditions:**
- SP is approved (status = Approved)
- SP has not yet completed certification

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-301 | Training is mandatory — SP cannot access live selling without certification | P0 |
| BR-302 | Training modules include: Portal Navigation, RFQ Creation, Quote Comparison, Magic Link Generation, Commission Understanding, Compliance & Code of Conduct, Dispute Resolution | P0 |
| BR-303 | Each module has learning content (text/video/screenshots) and a knowledge assessment | P0 |
| BR-304 | SP must pass each assessment with minimum 80% score | P0 |
| BR-305 | Failed assessments can be retried unlimited times | P1 |
| BR-306 | Training progress is saved — SP can resume where they left off | P0 |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-110 | SP is approved but not certified | SP logs into portal | System shows training dashboard with module list and progress |
| AC-111 | SP opens a training module | SP clicks module | System displays learning content with next/previous navigation |
| AC-112 | SP completes a module | SP finishes content and takes assessment | System records pass/fail and updates progress |
| AC-113 | SP fails assessment | Score below 80% | System shows "ไม่ผ่าน — กรุณาลองใหม่" with retry option |
| AC-114 | SP passes all modules | All 7 modules passed | System shows "ยินดีด้วย! คุณผ่านการอบรมแล้ว" |

**Edge Cases:**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-90 | SP closes browser during training | Progress saved, resume on next login |
| EC-91 | Training content updated after SP started | SP sees updated content, completed modules remain valid |
| EC-92 | SP approved but training system unavailable | Show error with retry, do not block portal access for status/profile |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| Module load failure | Server error | ไม่สามารถโหลดบทเรียนได้ กรุณาลองใหม่ | Retry button |
| Assessment submit failure | Server error | ไม่สามารถส่งคำตอบได้ กรุณาลองใหม่ | Retry, answers preserved |

#### US-20B: SP Complete Workflow Simulations
**As a** Startup Partner in training, **I want to** practice RFQ creation, quote comparison, and Magic Link generation in a sandbox environment, **so that** I can learn by doing before working with real sellers and buyers.

**Preconditions:**
- SP has completed all training modules
- SP has not yet completed certification

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-307 | Workflow simulations use sandbox/demo data (not real sellers or buyers) | P0 |
| BR-308 | Simulations cover: Create RFQ → View Quotes → Compare → Generate Magic Link | P0 |
| BR-309 | SP must complete all simulation steps to proceed to compliance acknowledgment | P0 |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-115 | SP completed all training modules | SP enters simulation section | System shows sandbox environment with demo data |
| AC-116 | SP creates practice RFQ | SP fills form and submits | System simulates RFQ submission with demo stores |
| AC-117 | SP completes all simulation steps | All steps done | System marks simulations as complete |

#### US-20C: SP Acknowledge Compliance Policies
**As a** Startup Partner completing certification, **I want to** review and digitally acknowledge compliance policies, **so that** I understand the rules and responsibilities of being a certified SP.

**Preconditions:**
- SP has completed training modules and simulations

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-310 | SP must read and acknowledge: Code of Conduct, Commission Structure, Dispute Resolution Process, Circumvention Penalties, Data Privacy Policy | P0 |
| BR-311 | Acknowledgment is digital signature with timestamp | P0 |
| BR-312 | All acknowledgments logged via Consent Center API | P0 |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-118 | SP completed modules and simulations | SP enters compliance section | System displays policies requiring acknowledgment |
| AC-119 | SP acknowledges all policies | SP checks all boxes and clicks "ยืนยัน" | System records acknowledgment, SP becomes "Certified", live selling unlocked |
| AC-120 | SP tries to skip acknowledgment | SP tries to access live selling | System blocks with "กรุณาอ่านและยอมรับนโยบายก่อน" |

#### US-20D: Admin/Leader Manage Training & Certification
**As an** Admin or Leader, **I want to** track SP training progress, view assessment outcomes, assign retraining, and control live selling activation, **so that** I can ensure all SPs are properly trained before serving real buyers.

**Preconditions:**
- Admin or Leader is logged in

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-313 | Admin sees training status for all SPs | P0 |
| BR-314 | Leader sees training status for team members only | P0 |
| BR-315 | Admin/Leader can assign retraining to specific modules | P1 |
| BR-316 | Admin/Leader can revoke certification (disable live selling) | P0 |
| BR-317 | Training progress notification sent via LINE OA when SP completes certification | P1 |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-121 | Admin views SP network | Admin clicks SP detail | System shows training section: modules completed, assessment scores, certification status, simulation completion |
| AC-122 | Admin assigns retraining | Admin selects modules and clicks "มอบหมายอบรมใหม่" | System resets selected modules for SP, sends LINE OA notification |
| AC-123 | Admin revokes certification | Admin clicks "ระงับสิทธิ์การขาย" | System disables live selling, SP sees "สิทธิ์การขายถูกระงับ — กรุณาติดต่อผู้ดูแล" |

---

### EPIC-15: User Management & Role/Permission

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-15 |
| **Goal** | Enable Super Admin to manage portal users and configure role-based access control across the SP Portal and Admin Portal |
| **Scope** | User CRUD operations, role definition, permission matrix, role assignment, role-based access enforcement |
| **Out of Scope** | SSO provider management (handled by Allkons ID/Keycloak), buyer/seller user management (separate portals) |
| **Success Criteria** | Super Admin can create/edit/suspend users; roles and permissions configurable; access enforced per role across all portal features |
| **Maps to** | FR-131 to FR-140 |

#### US-21: Super Admin Manage Users
**As a** Super Admin, **I want to** create, edit, suspend, and manage user accounts in the SP Portal and Admin Portal, **so that** I can control who has access to the system.

**Preconditions:**
- User is logged in with Super Admin role

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-318 | Super Admin can create new admin/leader accounts | P0 |
| BR-319 | Super Admin can edit user profiles and role assignments | P0 |
| BR-320 | Super Admin can suspend/reactivate user accounts | P0 |
| BR-321 | Super Admin can view all users across the organization | P0 |
| BR-322 | User changes are audit-logged with timestamp and actor | P0 |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-124 | Super Admin on user management page | Admin views user list | System displays all users with: name, email, role, status, last login |
| AC-125 | Super Admin creates new user | Admin fills form and clicks "สร้างผู้ใช้" | System creates account, sends credentials via LINE OA/email |
| AC-126 | Super Admin suspends user | Admin clicks "ระงับบัญชี" | System suspends user, revokes active sessions |
| AC-127 | Super Admin changes user role | Admin selects new role | System updates permissions immediately, logs change |

#### US-22: Super Admin Manage Roles & Permissions
**As a** Super Admin, **I want to** define roles and configure permission matrices, **so that** I can control what each role can access across the portal.

**Preconditions:**
- User is logged in with Super Admin role

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-323 | System has predefined roles: Super Admin, Admin, Leader, SP (Member) | P0 |
| BR-324 | Super Admin can create custom roles with specific permission sets | P1 |
| BR-325 | Permissions are per-module: SP Management, Commission, Payout, RFQ, Training, Disputes, Audit, User Management | P0 |
| BR-326 | Permission levels per module: No Access, View Only, Edit, Full Control | P0 |
| BR-327 | Role changes apply immediately to all users with that role | P0 |
| BR-328 | At least one Super Admin must exist at all times (cannot remove last Super Admin) | P0 |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-128 | Super Admin on role management page | Admin views roles | System displays role list with permission summary |
| AC-129 | Super Admin edits role permissions | Admin toggles permission checkboxes | System saves changes, applies to all users with that role |
| AC-130 | Super Admin tries to remove last Super Admin | Admin attempts action | System blocks with "ไม่สามารถลบ Super Admin คนสุดท้ายได้" |

#### US-23: Role-Based Access Enforcement
**As the** system, **I want to** enforce role-based access control across all portal features, **so that** users can only access what their role permits.

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-329 | Every API endpoint must check user's role and permissions before processing | P0 |
| BR-330 | UI must hide/disable features the user's role cannot access | P0 |
| BR-331 | Unauthorized access attempts are logged for security audit | P0 |
| BR-332 | Role-based access applies to both SP Portal and Admin Portal | P0 |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-131 | User with "View Only" on Commission | User tries to edit commission policy | System shows "คุณไม่มีสิทธิ์ในการดำเนินการนี้" |
| AC-132 | Leader user | Leader accesses SP network | System shows team members only, not all SPs |
| AC-133 | Admin without Payout permission | Admin tries to create payout batch | System blocks access, shows permission error |

---

## Functional Requirements

| FR ID | Requirement | Epic | User Story | Priority |
|-------|-------------|------|------------|----------|
| FR-001 | Integrate with Authentication Center for unified SSO | EPIC-01 | US-01 | P0 |
| FR-002 | Support OAuth 2.0 and Keycloak authentication | EPIC-01 | US-01 | P0 |
| FR-003 | Sync user profiles across all platforms | EPIC-01 | US-02 | P0 |
| FR-004 | Manage cross-platform sessions centrally | EPIC-01 | US-01 | P0 |
| FR-005 | Public SP registration form with KYC document upload | EPIC-02 | US-03 | P0 |
| FR-006 | OTP verification for SP phone numbers | EPIC-02 | US-03 | P0 |
| FR-007 | Cascading area-shop selector for service area assignment | EPIC-02 | US-03 | P0 |
| FR-008 | Admin review and approval workflow for SP applications | EPIC-03 | US-04, US-05 | P0 |
| FR-009 | Admin can approve, reject, or request more info on SP applications | EPIC-03 | US-04, US-05 | P0 |
| FR-010 | Application status tracking for SPs | EPIC-02 | US-03 | P0 |
| FR-011 | Admin can suspend or reactivate SP accounts | EPIC-03 | US-06 | P0 |
| FR-012 | Admin can update SP service areas | EPIC-03 | US-06 | P0 |
| FR-013 | Allkons ID account auto-provisioning for approved SPs | EPIC-03 | US-07 | P0 |
| FR-014 | Auto-generated credentials sent via SMS | EPIC-03 | US-07 | P0 |
| FR-015 | Seller opt-in/opt-out to SP program | EPIC-04 | US-08 | P0 |
| FR-016 | Seller configure service areas for RFQ acceptance | EPIC-04 | US-08 | P1 |
| FR-017 | Seller set RFQ notification preferences (in-app, SMS, email) | EPIC-04 | US-08 | P1 |
| FR-018 | Product search by keyword scoped to SP service areas | EPIC-05 | US-09 | P0 |
| FR-019 | Product search supports Thai keyword matching | EPIC-05 | US-09 | P0 |
| FR-020 | Product detail view with pricing and store info | EPIC-05 | US-09 | P0 |
| FR-021 | RFQ creation with multiple products (up to 50) | EPIC-06 | US-10 | P0 |
| FR-022 | RFQ submission to multiple stores (up to 10) simultaneously | EPIC-06 | US-10 | P0 |
| FR-023 | RFQ deadline setting (24 hours to 7 days) | EPIC-06 | US-10 | P0 |
| FR-024 | RFQ automatic expiration after deadline | EPIC-06 | US-10 | P0 |
| FR-025 | Quote comparison in Offer Hub (side-by-side display) | EPIC-07 | US-11 | P0 |
| FR-026 | Display up to 10 quotes simultaneously | EPIC-07 | US-11 | P0 |
| FR-027 | Quote validity tracking and expired quote marking | EPIC-07 | US-11 | P0 |
| FR-028 | In-app messaging between SP and Store Sales rep | EPIC-08 | US-12 | P0 |
| FR-029 | Message file attachments (images, PDFs, max 10MB) | EPIC-08 | US-12 | P0 |
| FR-030 | Message notifications via in-app and SMS | EPIC-08 | US-12 | P0 |
| FR-031 | Magic Link generation with secure tokens | EPIC-09 | US-13 | P0 |
| FR-032 | Magic Link expiration after 14 days | EPIC-09 | US-13 | P0 |
| FR-033 | OGP metadata for rich link previews in messaging apps | EPIC-09 | US-13 | P0 |
| FR-034 | Deep link support for LINE and WhatsApp | EPIC-09 | US-13 | P1 |
| FR-035 | Guest viewing of Offer Hub without login | EPIC-10 | US-14 | P0 |
| FR-036 | Buyer auto-provisioning via Customer Management (B2B CRM) module | EPIC-10 | US-14 | P0 |
| FR-037 | Shadow Account creation with default password sent via SMS/Email | EPIC-10 | US-14 | P0 |
| FR-038 | KYC exemption for non-credit payment methods | EPIC-10 | US-15 | P0 |
| FR-039 | Multi-seller decoupled checkout with payment sequencing | EPIC-10 | US-15 | P0 |
| FR-040 | Configurable commission engine with admin controls | EPIC-11 | US-17 | P0 |
| FR-041 | Commission calculation as percentage of transaction fee | EPIC-11 | US-17 | P0 |
| FR-042 | SP commission dashboard with earnings breakdown | EPIC-11 | US-18 | P0 |
| FR-043 | Commission clawback mechanism for refunds | EPIC-11 | US-18 | P0 |
| FR-044 | 2-level SP hierarchy (Leader-Member) | EPIC-12 | US-19 | P0 |
| FR-045 | Leader view and manage assigned Members | EPIC-12 | US-19 | P0 |
| FR-046 | Leader view Member performance metrics | EPIC-12 | US-19 | P0 |
| FR-047 | Dispute creation and categorization | EPIC-13 | US-20 | P0 |
| FR-048 | Admin mediation workflow for disputes | EPIC-13 | US-20 | P0 |
| FR-049 | Circumvention reporting mechanism for SPs | EPIC-13 | US-20 | P0 |
| FR-050 | Product search by name, barcode number, master SKU number, and description | EPIC-06 | US-10D | P0 |
| FR-051 | Elasticsearch integration for product search with Thai language support | EPIC-06 | US-10D | P0 |
| FR-052 | Image upload for AI-based product extraction (max 5 images, 10MB each, JPG/PNG/HEIC) | EPIC-06 | US-10E | P0 |
| FR-053 | Integration with external AI vendor service (AI All in team) | EPIC-06 | US-10E | P0 |
| FR-054 | Synchronous AI processing mode (real-time results within 10 seconds) | EPIC-06 | US-10E | P0 |
| FR-055 | Asynchronous AI processing mode (job-based with polling/webhook) | EPIC-06 | US-10E | P0 |
| FR-056 | AI extraction result storage with metadata (job ID, vendor, status, timestamp) | EPIC-06 | US-10E | P1 |
| FR-057 | Editable AI result review interface | EPIC-06 | US-10F | P0 |
| FR-058 | Manual refinement of AI-extracted product lists | EPIC-06 | US-10F | P1 |
| FR-059 | Mixed-source RFQ product list creation (MANUAL_SEARCH \| AI_IMAGE_ANALYSIS \| HYBRID) | EPIC-06 | US-10D, US-10E, US-10F | P1 |
| FR-060 | Product list source type tracking and validation | EPIC-06 | US-10D, US-10E, US-10F | P1 |
| FR-061 | Capture buyer type (INDIVIDUAL or CORPORATE) for all RFQs | EPIC-06 | US-10 | P0 |
| FR-062 | Conditional tax invoice information capture based on requireTaxInvoice flag | EPIC-06 | US-10 | P0 |
| FR-063 | Tax invoice address option selector (USE_DELIVERY_ADDRESS or PROVIDE_SEPARATE) | EPIC-06 | US-10 | P0 |
| FR-064 | Auto-populate delivery address to tax invoice address when USE_DELIVERY_ADDRESS selected | EPIC-06 | US-10 | P0 |
| FR-065 | Allow editing of auto-populated tax invoice address | EPIC-06 | US-10 | P1 |
| FR-066 | Individual tax invoice information capture (name, Tax ID, address) | EPIC-06 | US-10 | P0 |
| FR-067 | Corporate tax invoice information capture (company name, Tax ID, branch, address, phone) | EPIC-06 | US-10 | P0 |
| FR-068 | Tax ID validation (13 digits) for both individual and corporate | EPIC-06 | US-10 | P0 |
| FR-069 | Default branch to "สำนักงานใหญ่" for corporate if not specified | EPIC-06 | US-10 | P1 |
| FR-070 | Tax invoice information flows to quotation and affects documentation | EPIC-06 | US-10 | P0 |
| FR-071 | Individual quote detail view from RFQ context | EPIC-07 | US-11A | P0 |
| FR-072 | Centralized quote management dashboard | EPIC-07 | US-11B | P1 |
| FR-073 | Quote filtering by status, RFQ, store, date range | EPIC-07 | US-11B | P1 |
| FR-074 | Quote sorting by date, price, store name, RFQ | EPIC-07 | US-11B | P1 |
| FR-075 | Quote status tracking across all RFQs | EPIC-07 | US-11B | P0 |
| FR-076 | CIS integration for applicant profile and KYC retrieval | EPIC-03 | US-06A | P0 |
| FR-077 | Region/Province/District service area assignment | EPIC-03 | US-05, US-06 | P0 |
| FR-078 | Supervisor assignment during approval and profile management | EPIC-03 | US-05, US-06 | P1 |
| FR-079 | SP Leader transaction visibility (read-only) | EPIC-12 | US-19A | P0 |
| FR-080 | Buyer-side offer modification before approval with audit trail | EPIC-09 | US-13A | P0 |
| FR-081 | Topic-based threaded communication structure | EPIC-08 | US-12 | P0 |
| FR-082 | SP transaction/order visibility (read-only) after successful payment | EPIC-11 | US-17I | P0 |
| FR-083 | Display multi-seller orders separately per seller/order | EPIC-11 | US-17I | P0 |
| FR-084 | Prevent SP access to unrelated transactions | EPIC-11 | US-17I | P0 |
| FR-085 | SP commission calculation from Platform Fee only | EPIC-11 | US-17A | P0 |
| FR-086 | Estimated vs confirmed commission lifecycle based on fee collection | EPIC-11 | US-17B, US-17C | P0 |
| FR-087 | Fee collection dependency tracking before payout | EPIC-11 | US-17C | P0 |
| FR-088 | Payout visibility with 5 THB withdrawal fee deduction | EPIC-11 | US-17D, US-17E | P0 |
| FR-089 | SP commission transaction view with comprehensive fields | EPIC-11 | US-17C | P0 |
| FR-090 | SP Leader team commission visibility (read-only) | EPIC-11 | US-17H | P0 |
| FR-091 | Admin commission management and adjustments | EPIC-11 | US-17G | P0 |
| FR-092 | Commission adjustment/clawback flow for refunds | EPIC-11 | US-17F, US-17G | P0 |
| FR-093 | Separate Orders and Commissions menu structure | EPIC-11 | US-17I, US-17B | P0 |
| FR-094 | Order tracking with cancellation/refund filtering | EPIC-11 | US-17I | P0 |
| FR-095 | Commission eligibility indicator without amount display in product/store discovery | EPIC-11 | US-17A | P1 |
| FR-096 | 3-layer transaction model support (Buyer↔Seller, Seller↔Allkons, Allkons↔SP) | EPIC-11 | All US | P0 |
| FR-097 | Commission status model with Order, Fee, and Commission lifecycles | EPIC-11 | All US | P0 |
| FR-098 | Admin commission policy management (create, edit, activate, deactivate) | EPIC-11 | US-17J | P0 |
| FR-099 | Category-based commission rule configuration | EPIC-11 | US-17K | P0 |
| FR-100 | Seller-based commission rule configuration | EPIC-11 | US-17L | P0 |
| FR-101 | Seller + Category combination commission rules | EPIC-11 | US-17L | P0 |
| FR-102 | Rule priority and precedence handling | EPIC-11 | US-17J, US-17K, US-17L | P0 |
| FR-103 | Policy conflict detection and warning system | EPIC-11 | US-17J | P0 |
| FR-104 | Applied rule preview and simulation | EPIC-11 | US-17J | P0 |
| FR-105 | Fee lifecycle monitoring dashboard | EPIC-11 | US-17M | P0 |
| FR-106 | Commission lifecycle monitoring dashboard | EPIC-11 | US-17M | P0 |
| FR-107 | Exception case identification and alerting | EPIC-11 | US-17M | P0 |
| FR-108 | Payout batch creation from confirmed commissions | EPIC-11 | US-17N | P0 |
| FR-109 | Payout batch processing and status tracking | EPIC-11 | US-17N | P0 |
| FR-110 | Payment gateway reconciliation for payouts | EPIC-11 | US-17N | P0 |
| FR-111 | Fee collection failure handling | EPIC-11 | US-17O | P0 |
| FR-112 | Refund-triggered clawback automation | EPIC-11 | US-17O | P0 |
| FR-113 | Manual adjustment with reason and approval | EPIC-11 | US-17O | P0 |
| FR-114 | Payout retry without duplication | EPIC-11 | US-17O | P0 |
| FR-115 | Commission policy audit logging | EPIC-11 | US-17P | P0 |
| FR-116 | Payout action audit logging | EPIC-11 | US-17P | P0 |
| FR-117 | Adjustment and clawback audit logging | EPIC-11 | US-17P | P0 |
| FR-118 | Role-based admin access control for commission operations | EPIC-11 | All Admin US | P0 |
| FR-119 | Policy versioning and effective date management | EPIC-11 | US-17J | P0 |
| FR-120 | Admin dashboard for commission operations overview | EPIC-11 | US-17M | P0 |

---

## Non-Functional Requirements

### Performance
| NFR ID | Requirement | Target | Priority |
|--------|-------------|--------|----------|
| NFR-001 | SP Portal page load time | < 3 seconds | P0 |
| NFR-002 | Product search response time | < 2 seconds | P0 |
| NFR-003 | RFQ submission completion time | < 5 seconds | P0 |
| NFR-004 | Magic Link generation time | < 2 seconds | P0 |
| NFR-005 | Buyer checkout completion time | < 30 seconds (excluding payment processing) | P0 |
| NFR-006 | Concurrent users support (standard load) | 500 concurrent SPs | P0 |
| NFR-007 | Concurrent users support (peak load) | 2,000 concurrent SPs | P1 |
| NFR-008 | Message delivery time | < 3 seconds | P0 |

### Security
| NFR ID | Requirement | Target | Priority |
|--------|-------------|--------|----------|
| NFR-009 | Authentication security | OAuth 2.0 + Keycloak | P0 |
| NFR-010 | Authorization model | Role-based access control (RBAC) | P0 |
| NFR-011 | Data encryption | All sensitive data encrypted at rest and in transit (HTTPS/TLS) | P0 |
| NFR-012 | KYC document security | Secure storage with restricted access | P0 |
| NFR-013 | Payment security | PCI DSS compliance | P0 |
| NFR-014 | Magic Link security | Secure tokens, cannot be guessed or brute-forced | P0 |
| NFR-015 | OWASP compliance | Pass OWASP Top 10 security checklist | P0 |
| NFR-016 | Audit logging | All critical operations logged | P0 |

### Scalability
| NFR ID | Requirement | Target | Priority |
|--------|-------------|--------|----------|
| NFR-017 | Horizontal scaling | Support auto-scaling for peak loads | P1 |
| NFR-018 | Database performance | Optimized queries with indexing | P0 |
| NFR-019 | Caching strategy | Implement caching for frequently accessed data | P1 |

### Usability
| NFR ID | Requirement | Target | Priority |
|--------|-------------|--------|----------|
| NFR-020 | Language support | Thai language (primary) | P0 |
| NFR-021 | Terminology consistency | Use terms from `docs/shared/glossary.md` | P0 |
| NFR-022 | Mobile-first design | Optimized for mobile devices (320px+) | P0 |
| NFR-023 | Responsive design | Support desktop (1280px+), tablet (768px+), mobile (320px+) | P0 |
| NFR-024 | Cross-browser compatibility | Chrome, Safari, Edge (latest 2 versions) | P0 |
| NFR-025 | Touch-friendly UI | Large touch targets, swipe gestures | P0 |

### Reliability
| NFR ID | Requirement | Target | Priority |
|--------|-------------|--------|----------|
| NFR-026 | System uptime | 99.5% during business hours (8 AM - 8 PM Bangkok time) | P0 |
| NFR-027 | Data backup | Daily backups of all critical data | P0 |
| NFR-028 | Disaster recovery | RTO < 4 hours, RPO < 1 hour | P0 |
| NFR-029 | Graceful degradation | Display error messages and suggest alternatives when services fail | P0 |

---

## Data Models

### StartupPartner
```typescript
interface StartupPartner {
  id: string; // UUID
  allkonsId: string; // Reference to Allkons ID account
  firstName: string;
  lastName: string;
  phoneNumber: string; // 10 digits, Thai format
  email?: string; // Optional
  idCardNumber: string; // Thai ID card, 13 digits
  kycDocuments: KYCDocument[]; // ID card front/back, selfie
  serviceAreas: ServiceArea[]; // Assigned service areas (Region/Province/District)
  region?: string; // Assigned region (ภาค)
  province?: string; // Assigned province (จังหวัด)
  district?: string; // Assigned district (อำเภอ)
  assignedWorkAreas?: WorkArea[]; // 3-level hierarchy work areas
  targetShops: string[]; // Preferred shop IDs
  applicationStatus: 'Pending' | 'Approved' | 'Rejected' | 'InfoRequested' | 'Suspended';
  rejectionReason?: string;
  infoRequestMessage?: string;
  suspensionReason?: string; // Reason for suspension
  leaderId?: string; // Reference to Leader (if Member)
  supervisorId?: string; // Assigned supervisor ID
  assignedSupervisor?: string; // Supervisor name/reference
  hierarchy: 'Leader' | 'Member';
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string; // Admin ID
  suspendedAt?: Date;
  suspendedBy?: string; // Admin ID
}

interface WorkArea {
  region: string; // Region (ภาค)
  province: string; // Province (จังหวัด)
  district: string; // District (อำเภอ)
}

interface KYCDocument {
  id: string;
  type: 'IdCardFront' | 'IdCardBack' | 'Selfie';
  url: string; // Secure storage URL (PNG for images, PDF for documents)
  originalFormat: 'JPG' | 'PNG' | 'HEIC' | 'PDF'; // Track original upload format
  previewUrl?: string; // Preview image URL (for PDF files, first page thumbnail)
  uploadedAt: Date;
}

interface ServiceArea {
  region: string; // Region (ภาค)
  provinces: string[]; // Provinces in selected region
  districts: string[]; // Districts in selected provinces
  // UI: Region → Province → District hierarchy; system auto-populates at each level
}

interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'SPProgramTerms';
  timestamp: Date;
  ipAddress: string;
  consentCenterApiResponse: string; // Response from Consent Center API
}
```

### RFQ (Request for Quotation)
```typescript
interface RFQ {
  id: string; // UUID
  spId: string; // Auto-populated from logged-in SP account
  
  // Project Information
  projectName: string; // Required, max 200 chars
  
  // Payment Method
  paymentMethod: PaymentMethod; // Required, enum
  
  // Delivery Type & Information
  deliveryType: DeliveryType; // Required, enum (SELF_PICKUP or STORE_DELIVERY)
  deliveryAddress?: string; // Required if deliveryType = STORE_DELIVERY, max 500 chars
  googleMapLocationLink?: string; // Optional, URL format
  deliveryDate: Date; // Required, future date (min 24 hours ahead)
  deliveryTimeSlot: DeliveryTimeSlot; // Required, enum (MORNING, AFTERNOON, UNSPECIFIED)
  
  // Contact Information
  contactName: string; // Required, max 100 chars
  contactPhone: string; // Required, 10 digits Thai format
  contactEmail?: string; // Optional, valid email format
  
  // Tax Invoice Requirement
  requireTaxInvoice: boolean; // Required, true/false
  
  // Additional Notes
  additionalNotes?: string; // Optional, max 1000 chars
  
  // Buyer Information (from PRD)
  buyer: BuyerInfo; // Buyer information (required)
  
  // Delivery Requirements (from PRD)
  deliveryLocation: string; // Delivery address (required, max 500 chars)
  deliveryTime: Date; // Preferred delivery date/time (required, must be after deadline + 24 hours)
  deliverySchedule?: DeliveryRound[]; // Optional multiple delivery rounds (max 5)
  
  // Product Information
  products: RFQProduct[];
  
  // Store Selection
  targetStores: string[]; // Store IDs (1-12 partner stores only)
  
  // RFQ Metadata
  deadline: Date; // 24 hours to 7 days from creation
  notes?: string; // Max 500 chars (legacy field, use additionalNotes instead)
  status: 'Pending' | 'QuotesReceived' | 'Expired' | 'Cancelled';
  createdAt: Date;
  expiresAt: Date;
  cancelledAt?: Date;
  
  // Buyer Grouping (from PRD)
  buyerGroupId?: string; // For grouping RFQs by buyer for customer management
  
  // Buyer Type (NEW)
  buyerType: BuyerType; // Required
  
  // Tax Invoice Information (NEW)
  taxInvoiceAddressOption?: TaxInvoiceAddressOption; // Required if requireTaxInvoice = true
  taxInvoiceInfo?: TaxInvoiceInfo; // Required if requireTaxInvoice = true
}

enum PaymentMethod {
  DIRECT_BANK_TRANSFER = 'DIRECT_BANK_TRANSFER',
  STORE_CREDIT = 'STORE_CREDIT',
  ALLKONS_GATEWAY_CREDIT_CARD = 'ALLKONS_GATEWAY_CREDIT_CARD',
  ALLKONS_GATEWAY_PROMPTPAY_QR = 'ALLKONS_GATEWAY_PROMPTPAY_QR'
}

enum DeliveryType {
  SELF_PICKUP = 'SELF_PICKUP',
  STORE_DELIVERY = 'STORE_DELIVERY'
}

enum DeliveryTimeSlot {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  UNSPECIFIED = 'UNSPECIFIED'
}

enum BuyerType {
  INDIVIDUAL = 'INDIVIDUAL',
  CORPORATE = 'CORPORATE'
}

enum TaxInvoiceAddressOption {
  USE_DELIVERY_ADDRESS = 'USE_DELIVERY_ADDRESS',
  PROVIDE_SEPARATE = 'PROVIDE_SEPARATE'
}

interface TaxInvoiceInfo {
  // For INDIVIDUAL buyers
  individualName?: string; // Required if buyerType = INDIVIDUAL
  individualTaxId?: string; // 13 digits, required if buyerType = INDIVIDUAL
  individualAddress?: string; // Required if PROVIDE_SEPARATE
  
  // For CORPORATE buyers
  companyName?: string; // Required if buyerType = CORPORATE
  companyTaxId?: string; // 13 digits, required if buyerType = CORPORATE
  companyBranch?: string; // Optional, default "สำนักงานใหญ่"
  companyAddress?: string; // Required if buyerType = CORPORATE and PROVIDE_SEPARATE
  companyPhone?: string; // 10 digits, required if buyerType = CORPORATE
}

interface BuyerInfo {
  firstName: string; // Thai characters, max 100 chars
  lastName: string; // Thai characters, max 100 chars
  phoneNumber: string; // 10 digits Thai format
}

interface DeliveryRound {
  roundNumber: number; // 1-5
  location: string; // Delivery location for this round
  dateTime: Date; // Delivery date/time for this round
}

interface RFQProduct {
  productId: string;
  productName: string;
  quantity: number; // 1-9999
  unit: string;
  sourceType: ProductSourceType; // NEW: Track how product was added
  sourceReferenceId?: string; // NEW: AI extraction ID or search query ID
}

enum ProductSourceType {
  MANUAL_SEARCH = 'MANUAL_SEARCH',
  AI_IMAGE_ANALYSIS = 'AI_IMAGE_ANALYSIS',
  HYBRID = 'HYBRID'
}
```

### Quote
```typescript
interface Quote {
  id: string; // UUID
  rfqId: string; // Reference to RFQ
  storeId: string;
  storeName: string;
  products: QuoteProduct[];
  deliveryTerms: string;
  paymentTerms: string;
  
  // Payment Method Handling
  paymentMethod: PaymentMethod; // From RFQ
  creditApprovalStatus?: CreditApprovalStatus; // Only if paymentMethod = STORE_CREDIT
  creditApprovalNotes?: string; // Store's credit decision notes
  
  // Tax Invoice
  includesTaxInvoice: boolean; // From RFQ requireTaxInvoice
  
  // Quote Metadata
  validUntil: Date; // Quote validity period
  totalAmount: number;
  status: 'Active' | 'Expired' | 'Selected';
  createdAt: Date;
}

enum CreditApprovalStatus {
  PENDING = 'PENDING', // Store hasn't reviewed yet
  APPROVED = 'APPROVED', // Store approved credit for this buyer
  REJECTED = 'REJECTED', // Store rejected credit for this buyer
  CONDITIONAL = 'CONDITIONAL' // Store approved with conditions (e.g., reduced credit limit)
}

interface QuoteProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  available: boolean; // false if store doesn't have product
}
```

### MagicLink
```typescript
interface MagicLink {
  id: string; // UUID
  token: string; // Secure random token (unguessable)
  spId: string; // Reference to StartupPartner
  rfqId: string; // Reference to RFQ
  selectedQuotes: string[]; // Quote IDs
  expiresAt: Date; // 14 days from generation
  lastModifiedBy?: string; // User ID of last modifier
  lastModifiedByName?: string; // Name of last modifier
  lastModifiedAt?: Date; // Timestamp of last modification
  buyerModifiedSelection?: boolean; // Flag indicating buyer modified the offer
  createdAt: Date;
  viewCount: number; // Track how many times link was opened
  lastViewedAt?: Date;
}
```

### Commission Domain Models

#### CommissionSourceRecord
```typescript
interface CommissionSourceRecord {
  commissionSourceId: string; // UUID
  orderId: string; // Reference to Order
  sellerOrderId: string; // Seller-specific order ID
  buyerId: string; // Reference to Buyer
  sellerId: string; // Reference to Seller
  spId: string; // Reference to StartupPartner
  spLeaderId?: string; // Reference to SP Leader (if applicable)
  commissionType: 'SP_COMMISSION'; // Only SP Commission in scope
  orderAmount: number; // Total order value
  platformFeeAmount: number; // 2% of order (Platform Fee)
  paymentFeeAmount: number; // Payment gateway fee (not used for commission base)
  commissionBaseAmount: number; // = platformFeeAmount (Platform Fee only)
  baseCommissionRate: number; // % of Platform Fee
  estimatedCommissionAmount: number; // Calculated after order completion
  confirmedCommissionAmount?: number; // Set after fee collection
  feeCollectionStatus: FeeCollectionStatus;
  commissionStatus: CommissionStatus;
  createdAt: Date;
  updatedAt: Date;
}

enum FeeCollectionStatus {
  NOT_CALCULATED = 'NOT_CALCULATED',
  CALCULATED = 'CALCULATED',
  INVOICED = 'INVOICED',
  COLLECTION_PENDING = 'COLLECTION_PENDING',
  COLLECTED = 'COLLECTED',
  COLLECTION_FAILED = 'COLLECTION_FAILED',
  WAIVED_ADJUSTED = 'WAIVED_ADJUSTED'
}

enum CommissionStatus {
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
  ESTIMATED = 'ESTIMATED',
  AWAITING_FEE_COLLECTION = 'AWAITING_FEE_COLLECTION',
  CONFIRMED = 'CONFIRMED',
  READY_FOR_PAYOUT = 'READY_FOR_PAYOUT',
  PAYOUT_PROCESSING = 'PAYOUT_PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REVERSED_CLAWED_BACK = 'REVERSED_CLAWED_BACK'
}
```

#### FeeCollectionRecord
```typescript
interface FeeCollectionRecord {
  feeCollectionId: string; // UUID
  orderId: string; // Reference to Order
  sellerOrderId: string; // Seller-specific order ID
  sellerId: string; // Reference to Seller
  platformFeeAmount: number; // 2% of order
  feeCollectionMethod: 'PAYMENT_GATEWAY' | 'DIRECT_TRANSFER' | 'STORE_CREDIT';
  billingStatus: string;
  billedAt?: Date;
  paidAt?: Date;
  collectionStatus: FeeCollectionStatus;
  sourceSystem: string; // Fee Management System
}
```

#### CommissionPayoutRecord
```typescript
interface CommissionPayoutRecord {
  payoutId: string; // UUID
  spId: string; // Reference to StartupPartner
  payoutBatchId: string; // Batch identifier
  grossAmount: number; // Total confirmed commission amount
  withdrawalFee: number; // 5 THB per transaction
  netAmount: number; // grossAmount - withdrawalFee
  payoutStatus: 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  payoutMethod: string; // Allkons payment gateway
  payoutRequestedAt?: Date;
  payoutProcessedAt?: Date;
  payoutCompletedAt?: Date;
  gatewayTxRef?: string; // Payment gateway transaction reference
}
```

#### CommissionAdjustment
```typescript
interface CommissionAdjustment {
  adjustmentId: string; // UUID
  commissionSourceId: string; // Reference to CommissionSourceRecord
  adjustmentType: 'CLAWBACK' | 'MANUAL_CORRECTION' | 'REFUND_ADJUSTMENT';
  adjustmentAmount: number; // Positive or negative
  reason: string; // Required explanation
  createdBy: string; // Admin ID
  createdAt: Date;
  approvedBy?: string; // Admin ID
  approvedAt?: Date;
}
```

#### CommissionPolicy
```typescript
interface CommissionPolicy {
  policyId: string; // UUID
  policyName: string; // Human-readable name
  policyType: PolicyType;
  scopeType: ScopeType;
  scopeValue?: string; // Category ID, Seller ID, or combination
  commissionRate: number; // % of Platform Fee
  priority: number; // Higher number = higher priority
  effectiveFrom: Date;
  effectiveTo?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  stackable: boolean; // Future use, currently false
  createdBy: string; // Admin ID
  updatedBy?: string; // Admin ID
  createdAt: Date;
  updatedAt: Date;
}

enum PolicyType {
  BASE = 'BASE',
  CATEGORY = 'CATEGORY',
  SELLER = 'SELLER',
  SELLER_CATEGORY = 'SELLER_CATEGORY',
  SP_TIER = 'SP_TIER',
  CAMPAIGN = 'CAMPAIGN'
}

enum ScopeType {
  GLOBAL = 'GLOBAL',
  CATEGORY = 'CATEGORY',
  SELLER = 'SELLER',
  SELLER_CATEGORY = 'SELLER_CATEGORY',
  SP_TIER = 'SP_TIER',
  CAMPAIGN = 'CAMPAIGN'
}
```

#### PayoutBatch
```typescript
interface PayoutBatch {
  payoutBatchId: string; // UUID
  batchName: string;
  batchStatus: PayoutBatchStatus;
  commissionSourceIds: string[]; // References to CommissionSourceRecord
  spIds: string[]; // Unique SPs in this batch
  totalGrossAmount: number;
  totalWithdrawalFee: number; // 5 THB × SP count
  totalNetAmount: number; // totalGrossAmount - totalWithdrawalFee
  createdBy: string; // Admin ID
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedPayouts?: FailedPayout[];
}

enum PayoutBatchStatus {
  DRAFT = 'DRAFT',
  READY = 'READY',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
  CANCELLED = 'CANCELLED'
}

interface FailedPayout {
  spId: string;
  amount: number;
  reason: string;
  retryable: boolean;
}
```

#### CommissionAuditLog
```typescript
interface CommissionAuditLog {
  auditId: string; // UUID
  actionType: AuditActionType;
  entityType: 'POLICY' | 'COMMISSION' | 'PAYOUT' | 'ADJUSTMENT';
  entityId: string;
  adminUserId: string;
  adminUserName: string;
  adminRole: string;
  actionDescription: string;
  beforeValue?: string; // JSON snapshot
  afterValue?: string; // JSON snapshot
  reason?: string;
  timestamp: Date;
  ipAddress?: string;
}

enum AuditActionType {
  POLICY_CREATE = 'POLICY_CREATE',
  POLICY_UPDATE = 'POLICY_UPDATE',
  POLICY_ACTIVATE = 'POLICY_ACTIVATE',
  POLICY_DEACTIVATE = 'POLICY_DEACTIVATE',
  PAYOUT_BATCH_CREATE = 'PAYOUT_BATCH_CREATE',
  PAYOUT_BATCH_PROCESS = 'PAYOUT_BATCH_PROCESS',
  PAYOUT_BATCH_COMPLETE = 'PAYOUT_BATCH_COMPLETE',
  PAYOUT_BATCH_CANCEL = 'PAYOUT_BATCH_CANCEL',
  ADJUSTMENT_CREATE = 'ADJUSTMENT_CREATE',
  CLAWBACK_CREATE = 'CLAWBACK_CREATE',
  PAYOUT_RETRY = 'PAYOUT_RETRY'
}
```

### Dispute
```typescript
interface Dispute {
  id: string; // UUID
  reporterId: string; // SP, Buyer, or Seller ID
  reporterType: 'SP' | 'Buyer' | 'Seller';
  category: 'Fulfillment' | 'Circumvention' | 'Commission' | 'Other';
  description: string; // Max 1000 chars
  evidence: DisputeEvidence[];
  status: 'Open' | 'UnderReview' | 'Resolved' | 'Closed';
  adminNotes?: string;
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string; // Admin ID
}

interface DisputeEvidence {
  id: string;
  type: 'Screenshot' | 'Document' | 'MessageHistory';
  url: string;
  uploadedAt: Date;
}
```

### FavoriteStore
```typescript
interface FavoriteStore {
  id: string; // UUID
  spId: string; // Reference to StartupPartner
  storeId: string; // Reference to Store
  addedAt: Date;
  notes?: string; // Optional SP notes about this store
}
```

### AIProductExtraction
```typescript
interface AIProductExtraction {
  id: string; // UUID
  spId: string; // Reference to StartupPartner
  rfqId?: string; // Reference to RFQ (if confirmed)
  uploadedImages: UploadedImage[]; // 1-5 images
  aiVendorName: string; // 'AI_All_In_Team'
  aiJobId: string; // Vendor's job/request ID
  processingMode: 'SYNCHRONOUS' | 'ASYNCHRONOUS';
  extractionStatus: ExtractionStatus;
  extractedItems: ExtractedProduct[];
  confidenceScores?: Record<string, number>; // Internal only, not displayed
  rawResponse?: string; // Vendor raw JSON response (internal)
  reviewStatus: 'PENDING_REVIEW' | 'CONFIRMED' | 'DISCARDED';
  createdAt: Date;
  completedAt?: Date;
  confirmedAt?: Date;
}

enum ExtractionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT'
}

interface UploadedImage {
  id: string;
  url: string; // Secure storage URL
  originalFormat: 'JPG' | 'PNG' | 'HEIC';
  fileSize: number; // bytes
  uploadedAt: Date;
}

interface ExtractedProduct {
  id: string; // Temp ID for review
  productName: string;
  quantity?: number;
  unit?: string;
  confidenceScore?: number; // Internal only
  matchedProductId?: string; // If matched to Master SKU
  reviewAction?: 'KEEP' | 'EDIT' | 'REMOVE'; // SP's decision
}
```

### Data Governance Checklist
- [ ] **Data Ownership**: All SP data owned by Allkons M; SPs have access to their own data only
- [ ] **Data Classification**: KYC documents classified as "Confidential"; commission data as "Internal"
- [ ] **Data Quality**: Phone numbers validated with OTP; ID card numbers validated with checksum
- [ ] **Data Retention**: SP applications retained for 7 years; RFQs and quotes retained for 3 years
- [ ] **Access Controls**: KYC documents accessible only to Admins with "KYC Reviewer" role
- [ ] **Encryption**: All PII encrypted at rest (AES-256) and in transit (TLS 1.3)
- [ ] **Audit Trail**: All data access and modifications logged with timestamp and user ID
- [ ] **PDPA Compliance**: Right to access, rectify, and delete personal data per Thailand PDPA

---

## API Contracts

### Consent Center Integration
```
POST /api/v1/consent-center/log
Request:
{
  "userId": string,
  "consentType": "SPProgramTerms",
  "timestamp": Date, // ISO 8601
  "ipAddress": string,
  "userAgent": string
}
Response: 200 OK
{
  "consentId": string,
  "status": "Logged",
  "message": "Consent logged successfully"
}
```

### SP Registration
```
POST /api/v1/startup-partners/register
Request:
{
  "firstName": string,
  "lastName": string,
  "phoneNumber": string, // 10 digits
  "email": string?, // Optional
  "idCardNumber": string, // 13 digits
  "kycDocuments": {
    "idCardFront": File, // JPG/PNG/HEIC/PDF, max 10MB, auto-convert HEIC to PNG, auto-generate PDF preview
    "idCardBack": File, // JPG/PNG/HEIC/PDF, max 10MB, auto-convert HEIC to PNG, auto-generate PDF preview
    "selfie": File // JPG/PNG/HEIC/PDF, max 10MB, auto-convert HEIC to PNG, auto-generate PDF preview
  },
  "serviceAreas": [
    {
      "region": string, // Region (ภาค)
      "provinces": string[], // Provinces in selected region (auto-populated)
      "districts": string[] // Districts in selected provinces (auto-populated)
    }
  ],
  "targetShops": string[], // Shop IDs (only opted-in shops)
  "termsConsent": boolean,
  "consentMetadata": {
    "timestamp": Date,
    "ipAddress": string
  }
}
Response: 201 Created
{
  "applicationId": string,
  "status": "Pending",
  "consentId": string, // From Consent Center API
  "message": "ใบสมัครของคุณถูกส่งแล้ว รอการตรวจสอบจากแอดมิน"
}
```

### Create RFQ
```
POST /api/v1/rfqs
Request:
{
  "spId": string, // Auto-populated from logged-in SP account
  "buyer": {
    "firstName": string, // Thai characters, max 100 chars
    "lastName": string, // Thai characters, max 100 chars
    "phoneNumber": string // 10 digits Thai format
  },
  "deliveryLocation": string, // Required, max 500 chars
  "deliveryTime": Date, // ISO 8601, must be after deadline + 24 hours
  "deliverySchedule": [ // Optional, max 5 rounds
    {
      "roundNumber": number, // 1-5
      "location": string,
      "dateTime": Date // ISO 8601
    }
  ],
  "products": [
    {
      "productId": string,
      "quantity": number
    }
  ],
  "targetStores": string[], // 1-12 partner store IDs (opted-in only)
  "deadline": Date, // ISO 8601 format
  "notes": string? // Max 500 chars
}
Response: 201 Created
{
  "rfqId": string,
  "buyer": {
    "firstName": string,
    "lastName": string,
    "phoneNumber": string
  },
  "deliveryLocation": string,
  "deliveryTime": Date,
  "status": "Pending",
  "expiresAt": Date,
  "message": "RFQ ถูกส่งไปยังร้านค้าแล้ว"
}
```

### Product Search
```
GET /api/v1/products/search
Query Parameters:
  - q: string (search query)
  - searchType: 'name' | 'barcode' | 'sku' | 'description'
  - serviceAreaId: string
  - limit: number (default 20, max 50)
Response: 200 OK
{
  "products": [
    {
      "productId": string,
      "productName": string,
      "barcode": string,
      "masterSKU": string,
      "description": string,
      "unit": string,
      "storeId": string,
      "storeName": string
    }
  ],
  "total": number
}
```

### AI Image Upload & Extraction
```
POST /api/v1/ai/product-extraction
Request:
{
  "spId": string,
  "images": [
    {
      "imageData": string, // Base64 or multipart
      "format": "JPG" | "PNG" | "HEIC"
    }
  ],
  "processingMode": "SYNCHRONOUS" | "ASYNCHRONOUS"
}
Response: 201 Created
{
  "extractionId": string,
  "aiJobId": string,
  "status": "PENDING" | "PROCESSING" | "COMPLETED",
  "extractedItems": [ // Only if SYNCHRONOUS and COMPLETED
    {
      "productName": string,
      "quantity": number,
      "unit": string,
      "matchedProductId": string
    }
  ],
  "message": "AI extraction initiated"
}
```

### AI Extraction Status (for async)
```
GET /api/v1/ai/product-extraction/{extractionId}
Response: 200 OK
{
  "extractionId": string,
  "status": "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
  "extractedItems": [...],
  "completedAt": Date
}
```

### Confirm AI Results
```
POST /api/v1/ai/product-extraction/{extractionId}/confirm
Request:
{
  "confirmedItems": [
    {
      "productName": string,
      "quantity": number,
      "unit": string,
      "productId": string
    }
  ],
  "additionalManualItems": [...] // Optional
}
Response: 200 OK
{
  "extractionId": string,
  "reviewStatus": "CONFIRMED",
  "sourceType": "AI_IMAGE_ANALYSIS" | "HYBRID",
  "message": "Product list confirmed"
}
```

### Generate Magic Link
```
POST /api/v1/magic-links
Request:
{
  "spId": string,
  "rfqId": string,
  "selectedQuotes": string[] // Quote IDs
}
Response: 201 Created
{
  "linkId": string,
  "token": string,
  "url": string, // Full Magic Link URL
  "expiresAt": Date,
  "message": "ลิงก์ถูกสร้างแล้ว"
}
```

### Buyer Auto-Provisioning (via Customer Management CRM Module)
```
Note: Buyer accounts are auto-provisioned by the Seller when generating quotes.
The Seller uses the Customer Management (B2B CRM) module's inline customer creation flow.

Refer to Customer Management (B2B CRM) Module API documentation for:
- POST /api/v1/crm/customers (inline customer creation)
- Shadow Account auto-provisioning logic
- Duplicate detection by Phone/Email
- Default password generation and SMS/Email delivery

The Magic Link assumes buyer accounts are already provisioned before the link is sent.
Buyers authenticate using:
- Phone Number (username) + Default Password (sent via SMS/Email)
- "Forgot Password" flow for password reset
```

### Commission Dashboard
```
GET /api/v1/startup-partners/{spId}/commissions
Query Parameters:
  - status: 'Pending' | 'Paid' | 'ClawedBack'
  - dateFrom: Date
  - dateTo: Date
Response: 200 OK
{
  "totalEarnings": number,
  "pendingCommissions": number,
  "paidCommissions": number,
  "commissions": [
    {
      "id": string,
      "orderId": string,
      "transactionValue": number,
      "commissionAmount": number,
      "status": string,
      "createdAt": Date
    }
  ]
}
```

---

## Admin Menu Structure for Commission Management

The following menu structure provides Allkons Admin with comprehensive commission management capabilities:

```
Admin Portal > Commission Management
├── Dashboard
│   └── Overview metrics: Total Commissions, Pending Payouts, Active Policies, Exception Count
├── Policy Setup
│   ├── Global Base Rate
│   ├── Category Rules
│   ├── Seller Rules
│   ├── Seller + Category Rules
│   └── Policy Conflicts / Preview
├── Fee Monitoring
│   ├── Orders Completed (Fee Not Calculated)
│   ├── Fee Calculated (Not Collected)
│   ├── Fee Collection Pending
│   └── Fee Collection Failed
├── Commission Monitoring
│   ├── Estimated Commissions
│   ├── Awaiting Fee Collection
│   ├── Confirmed Commissions
│   └── Ready for Payout
├── Payout Batches
│   ├── Create New Batch
│   ├── Active Batches
│   ├── Batch History
│   └── Failed Payouts
├── Exceptions & Adjustments
│   ├── Exception Queue
│   ├── Manual Adjustments
│   ├── Clawbacks
│   └── Payout Retries
└── Audit Logs
    ├── Policy Changes
    ├── Payout Actions
    ├── Adjustments
    └── Export Reports
```

### Policy Setup View Fields
- Policy Name
- Policy Type (Global, Category, Seller, Seller+Category, SP Tier, Campaign)
- Scope Type
- Scope Value (Category ID, Seller ID, or combination)
- Commission Rate (% of Platform Fee)
- Priority (higher number = higher priority)
- Effective From
- Effective To
- Status (Active, Inactive, Draft)

### Fee Monitoring View Fields
- Order ID
- Seller / Branch
- Platform Fee Amount
- Fee Collection Method (Payment Gateway, Direct Transfer, Store Credit)
- Billing Status
- Fee Collection Status
- Paid At
- Source System

### Commission Monitoring View Fields
- Order ID
- SP Name
- SP Leader Name
- Seller / Branch
- Platform Fee
- Applied Rule (Policy Name)
- Estimated Commission
- Confirmed Commission
- Commission Status
- Payout Status

### Adjustment / Clawback View Fields
- Adjustment ID
- Related Order ID
- Related Commission Source ID
- Adjustment Type (Clawback, Manual Correction, Refund Adjustment)
- Adjustment Amount
- Reason
- Created By (Admin Name)
- Created At

---

## Access Control for Commission Management

### Admin Role Definitions

| Role | Permissions | Description |
|------|-------------|-------------|
| **Commission Viewer** | View all commission data, policies, payouts (read-only) | Read-only access to all commission operations for reporting and analysis |
| **Commission Manager** | Commission Viewer + Create/edit/activate/deactivate policies, view monitoring dashboards | Manage commission policies and monitor fee/commission lifecycle |
| **Payout Manager** | Commission Viewer + Create and process payout batches, retry failed payouts | Manage payout batch creation and processing |
| **Finance Admin** | Commission Manager + Payout Manager + Manual adjustments and clawbacks | Full commission management including sensitive financial operations |
| **Super Admin** | All permissions + Role configuration and sensitive approvals | Complete control over commission domain and role management |

### Permission Matrix

| Action | Commission Viewer | Commission Manager | Payout Manager | Finance Admin | Super Admin |
|--------|-------------------|-------------------|----------------|---------------|-------------|
| View commission data | ✓ | ✓ | ✓ | ✓ | ✓ |
| View policies | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create/edit policies | ✗ | ✓ | ✗ | ✓ | ✓ |
| Activate/deactivate policies | ✗ | ✓ | ✗ | ✓ | ✓ |
| View fee monitoring | ✓ | ✓ | ✓ | ✓ | ✓ |
| View commission monitoring | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create payout batches | ✗ | ✗ | ✓ | ✓ | ✓ |
| Process payout batches | ✗ | ✗ | ✓ | ✓ | ✓ |
| Retry failed payouts | ✗ | ✗ | ✓ | ✓ | ✓ |
| Create manual adjustments | ✗ | ✗ | ✗ | ✓ | ✓ |
| Create clawbacks | ✗ | ✗ | ✗ | ✓ | ✓ |
| View audit logs | ✓ | ✓ | ✓ | ✓ | ✓ |
| Export audit reports | ✓ | ✓ | ✓ | ✓ | ✓ |
| Configure roles | ✗ | ✗ | ✗ | ✗ | ✓ |
| Approve large adjustments (> 10,000 THB) | ✗ | ✗ | ✗ | ✗ | ✓ |

### Business Rules for Admin Access

| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-267 | Commission policy editing restricted to Commission Manager role or higher | P0 |
| BR-268 | Payout execution restricted to Payout Manager or Finance Admin roles | P0 |
| BR-269 | Manual adjustments and clawbacks restricted to Finance Admin or Super Admin roles | P0 |
| BR-270 | All admin roles must be auditable with action logging | P0 |

---

## Business Glossary

| Term | Thai Term | Definition |
|------|-----------|------------|
| Startup Partner (SP) | สตาร์ทอัพพาร์ทเนอร์ | Freelance sales agent who bridges offline buyers with online marketplace |
| Leader | ลีดเดอร์ | Thammasorn internal sales rep who supervises Members (global service areas) |
| Member | สมาชิก | Public freelance SP assigned to specific service areas |
| RFQ | ใบขอใบเสนอราคา | Request for Quotation sent to multiple stores with comprehensive commercial details |
| Project Name | ชื่อโครงการ | Buyer's project identifier for organizing RFQs |
| Payment Method | วิธีการชำระเงิน | Buyer's intended payment method (bank transfer, store credit, credit card, PromptPay) |
| Store Credit | เครดิตร้านค้า | Seller-specific credit agreement between buyer and seller (not Allkons credit product) |
| Credit Approval | การอนุมัติเครดิต | Store's decision to approve/reject buyer's credit eligibility during quotation |
| Delivery Type | ประเภทการจัดส่ง | Self Pickup (buyer collects) or Store Delivery (store delivers) |
| Delivery Time Slot | ช่วงเวลาจัดส่ง | Morning, Afternoon, or Unspecified delivery window |
| Tax Invoice Requirement | ความต้องการใบกำกับภาษี | Whether buyer requires tax invoice for purchase |
| Favorite Stores | ร้านค้าโปรด | SP-designated preferred stores for quick selection |
| Location-Based Filtering | การกรองตามสถานที่ | Filtering stores by service area match and proximity to delivery address |
| Offer Hub | ฮับเปรียบเทียบใบเสนอราคา | Side-by-side quote comparison interface |
| Magic Link | ลิงก์พิเศษ | Shareable secure link containing compared quotes for buyers |
| Service Area | พื้นที่ให้บริการ | Geographic area (province + districts) where SP operates |
| KYC | การยืนยันตัวตน | Know Your Customer - identity verification process |
| Commission | ค่าคอมมิชชัน | Percentage of transaction fee earned by SP |
| Clawback | การเรียกคืนค่าคอมมิชชัน | Commission reversal due to refund |
| Circumvention | การหลีกเลี่ยงแพลตฟอร์ม | Attempt to bypass platform and complete transaction offline |
| Digital Quotation | ใบเสนอราคาดิจิทัล | Approved quote via Offer Link (legal source of truth) |
| Decoupled Checkout | การชำระเงินแยกตามร้านค้า | Independent checkout for each seller in multi-seller order |
| AI Product Extraction | การสกัดรายการสินค้าด้วย AI | AI-powered analysis of uploaded images to extract product lists |
| Product Source Type | ประเภทแหล่งที่มาของสินค้า | Origin of RFQ product items (manual search, AI extraction, or hybrid) |
| Hybrid Product List | รายการสินค้าแบบผสม | RFQ product list built from both AI extraction and manual search |
| AI Vendor | ผู้ให้บริการ AI | External service provider (AI All in team) for product extraction |
| Extraction Job | งานสกัดข้อมูล | AI processing task for analyzing uploaded images |
| Synchronous Processing | การประมวลผลแบบทันที | Real-time AI extraction with immediate results |
| Asynchronous Processing | การประมวลผลแบบไม่ทันที | Job-based AI extraction with delayed results |
| Buyer Type | ประเภทผู้ซื้อ | Classification of buyer as Individual or Corporate Entity |
| Individual Buyer | ผู้ซื้อบุคคลธรรมดา | Individual person purchasing products |
| Corporate Buyer | ผู้ซื้อนิติบุคคล | Company or corporate entity purchasing products |
| Tax Invoice Address Option | ตัวเลือกที่อยู่ใบกำกับภาษี | Method of providing tax invoice address (use delivery address or provide separate) |
| Tax ID | เลขประจำตัวผู้เสียภาษี | 13-digit tax identification number for individuals or companies |
| Company Branch | สาขา | Branch designation for corporate entities (default "สำนักงานใหญ่") |

---

## Traceability Matrix

| PRD Section | Epic | User Story | FR | BR | AC |
|-------------|------|------------|----|----|----|
| §6.1 SSO & Unified Auth | EPIC-01 | US-01, US-02 | FR-001 to FR-004 | BR-001 to BR-009 | AC-01 to AC-08 |
| §6.2 SP Registration & Onboarding | EPIC-02 | US-03, US-04 | FR-005 to FR-010 | BR-010 to BR-035 | AC-09 to AC-21 |
| §6.2 Admin SP Management | EPIC-03 | US-05 to US-07 | FR-008 to FR-014 | BR-036 to BR-053 | AC-22 to AC-32 |
| §6.3 Seller Opt-In | EPIC-04 | US-08 | FR-015 to FR-017 | BR-054 to BR-058 | AC-33 to AC-36 |
| §6.4 Product Discovery | EPIC-05 | US-09 | FR-018 to FR-020 | BR-059 to BR-064 | AC-36 to AC-40 |
| §6.5 RFQ Creation | EPIC-06 | US-10 | FR-021 to FR-024 | BR-065 to BR-074 | AC-40 to AC-43 |
| §6.6 Quote Comparison | EPIC-07 | US-11 | FR-025 to FR-027 | BR-075 to BR-080 | AC-43 to AC-46 |
| §6.7 In-App Communication | EPIC-08 | US-12 | FR-028 to FR-030 | BR-081 to BR-086 | AC-47 to AC-50 |
| §6.8 Magic Link Generation | EPIC-09 | US-13 | FR-031 to FR-034 | BR-087 to BR-093 | AC-51 to AC-55 |
| §6.9 Buyer O2O Checkout | EPIC-10 | US-14 to US-16 | FR-035 to FR-039 | BR-094 to BR-108 | AC-56 to AC-66 |
| §6.10 Commission Tracking | EPIC-11 | US-17, US-18 | FR-040 to FR-043 | BR-109 to BR-120 | AC-67 to AC-73 |
| §6.11 SP Hierarchy | EPIC-12 | US-19 | FR-044 to FR-046 | BR-121 to BR-126 | AC-74 to AC-77 |
| §6.12 Dispute Resolution | EPIC-13 | US-20 | FR-047 to FR-049 | BR-127 to BR-132 | AC-78 to AC-81 |

---

## Open Questions

1. **SP Commission Base Rate**: What is the initial SP commission percentage of Platform Fee? (e.g., 30% of Platform Fee)
2. **Minimum Payout Threshold**: What is the minimum commission amount required for payout? (Assumed 500 THB, needs confirmation)
3. **Payment Schedule**: Monthly payout on which day of the month? (e.g., 1st of each month)
3a. **Fee Collection Timing**: For Payment Gateway mode, is Platform Fee included in order payment or collected separately?
3b. **Fee Collection Retry Logic**: How many retries for failed fee collection before marking as "Collection Failed"?
3c. **Commission Eligibility Display**: Should product/store discovery show commission eligibility indicator, or hide completely?
3d. **Payout Batch Processing**: How are payout batches created? (Daily, weekly, monthly, or on-demand?)
3e. **Adjustment Approval Threshold**: What adjustment amount requires additional approval? (Assumed > 10,000 THB)
3f. **Negative Balance Handling**: How to handle SP with negative commission balance after clawback?
3g. **Fee Management System SLA**: What is the expected response time for fee collection status updates?
3h. **Policy Priority Numbering**: What is the default rule priority numbering scheme? (e.g., 1-100, with higher = higher priority?)
3i. **Policy Effective Dates**: Should policy effective dates support time-of-day, or date-only?
3j. **Audit Log Retention**: How long should audit logs be retained? (Assumed 7 years per financial regulations)
3k. **Payout Batch Automation**: Should payout batches be created automatically on schedule, or always manually by Admin?
3l. **Payout Batch Size Limit**: What is the maximum batch size for payout processing? (Performance consideration)
3m. **Category ID Stability**: Are category IDs stable and not frequently changed? (Impacts policy validity)
3n. **Seller ID Stability**: Are seller IDs stable and not frequently changed? (Impacts policy validity)
4. **Leader Assignment**: How are Members assigned to Leaders? (Admin manual assignment or automatic based on service area?)
5. **KYC Verification**: Is KYC verification automated or manual? (Manual review by Admin or integration with third-party KYC service?)
6. **Magic Link Domain**: What domain will be used for Magic Links? (e.g., `offers.allkons.com` or `allkons.com/offers`)
7. **SMS Gateway**: Which SMS gateway provider will be used for OTP and notifications? (e.g., Twilio, AWS SNS)
8. **File Storage**: Where will KYC documents and message attachments be stored? (AWS S3, Google Cloud Storage, or other?)
9. **HEIC Conversion Service**: Which library/service will be used for HEIC to PNG conversion? (e.g., Sharp, ImageMagick, cloud service?)
10. **Consent Center API**: What is the API contract and SLA for Consent Center integration? (Response time, retry logic, fallback?)
11. **Consent Center Timeout**: What is the acceptable timeout for Consent Center API? (e.g., 5 seconds before fallback?)
12. **District Auto-Population**: Should district auto-population be immediate or configurable by Admin after approval?
13. **Region Mapping Data**: What is the source for Region-Province-District mapping data? (Government database, custom mapping, or third-party service?)
14. **PDF Processing Service**: Which library/service will be used for PDF preview generation? (e.g., pdf.js, ImageMagick, cloud service?)
15. **PDF Preview Quality**: What resolution/quality should PDF preview thumbnails be? (e.g., 800x600px, 150 DPI?)
16. **Delivery Time Validation**: Should delivery time validation consider business hours, holidays, or weekends?
17. **Delivery Schedule Conflicts**: How should system handle overlapping delivery rounds (same time, different locations)?
18. **Buyer Phone Verification**: Should buyer phone numbers be verified via OTP before RFQ submission?
19. **SP ID Format**: What format should SP ID use? (UUID, sequential number, or custom format like SP-2024-001234?)
20. **Dispute SLA**: What is the target resolution time for disputes? (Assumed 7 days, needs confirmation)
21. **Training Materials**: Will training materials be created by internal team or outsourced?
22. **AI Vendor Contract**: What is the exact API contract for AI All in team's product extraction service?
23. **AI Vendor Authentication**: How does Allkons M authenticate with the AI vendor service? (API key, OAuth, other?)
24. **AI Vendor Timeout Handling**: What is the retry logic if AI vendor times out?
25. **AI Vendor Rate Limits**: Are there rate limits or quotas for AI extraction requests?
26. **AI Webhook Support**: Does AI vendor support webhooks for asynchronous results, or polling only?
27. **AI Extraction Accuracy**: What is the expected accuracy/confidence threshold for AI-extracted products?
28. **Product Matching Logic**: How are AI-extracted product names matched to Master SKU database?
29. **Fuzzy Matching**: Should system support fuzzy matching for AI-extracted product names?
30. **Image Pre-Processing**: Does Allkons M need to pre-process images (resize, compress) before sending to AI vendor?
31. **AI Cost Model**: Is there a cost per AI extraction request? Usage limits?
32. **Tax ID Verification**: Should system verify Tax ID against government database or format validation only?
33. **Branch Code**: Should corporate branch use standardized branch codes or free text?
34. **Tax Invoice Template**: What is the tax invoice template format required by accounting system?
35. **Tax Invoice Pricing Impact**: How does buyer type and tax invoice requirement affect quotation pricing calculation?
36. **Multiple Branches**: Can one corporate buyer have multiple branches in different RFQs?
37. **Tax Invoice Delivery**: How is the tax invoice delivered to buyer? (Email, physical mail, download from system?)

---

## Dependencies

### External AI Engine Vendor Service (AI All in Team)
- **Purpose**: Image-based product extraction from uploaded photos/material lists
- **Integration**: REST API
- **Processing Modes**: Synchronous (real-time) and Asynchronous (job-based)
- **SLA**: Synchronous < 10 seconds, Asynchronous < 5 minutes
- **Owned by**: AI All in team
- **Contract**: API endpoint, authentication, request/response format
- **Fallback**: Manual search if AI unavailable

### Elasticsearch Service
- **Purpose**: Product search by name, barcode, SKU, description
- **Integration**: Elasticsearch client library
- **Thai Language Support**: Required
- **Scope**: Scoped to SP service areas
- **Performance**: < 2 seconds response time

### Authentication Center
- **Purpose**: Unified SSO across all Allkons platforms
- **Integration**: OAuth 2.0 with Keycloak
- **Owned by**: Platform team

### Customer Management (B2B CRM) Module
- **Purpose**: Quote-to-CRM inline customer creation and Shadow Account auto-provisioning
- **Integration**: Internal API
- **Owned by**: CRM team

### Consent Center
- **Purpose**: Log user consent for PDPA compliance
- **Integration**: REST API
- **SLA**: < 5 seconds response time
- **Owned by**: Compliance team

### Payment Gateway
- **Purpose**: Process payments (credit card, PromptPay QR)
- **Integration**: Gateway API
- **Owned by**: Payment team

### SMS Gateway
- **Purpose**: Send OTP and notifications
- **Integration**: SMS API (Twilio, AWS SNS, or other)
- **Owned by**: Infrastructure team

### File Storage
- **Purpose**: Store KYC documents, message attachments, product images
- **Integration**: AWS S3, Google Cloud Storage, or similar
- **Owned by**: Infrastructure team

### CIS (Customer Information System)
- **Purpose**: Retrieve existing applicant profile, KYC documents, and bank account information
- **Integration**: CIS API
- **Owned by**: Customer data team
- **Usage**: Admin application review to view historical user data

### Fee Management System
- **Purpose**: Calculate Platform Fee (2% of order), track fee collection status, support 3 fee collection modes (Payment Gateway, Direct Transfer, Store Credit)
- **Integration**: Fee Management API
- **Owned by**: Finance/Billing team
- **Usage**: Provides fee calculation, billing status, and collection confirmation for SP commission lifecycle
- **Data Provided**: Platform Fee amount, Payment Fee amount, fee collection status, fee collection method, billing/payment timestamps

---

## Assumptions

1. **Authentication Center Integration**: Authentication Center and Allkons ID modules are already implemented and available for integration
2. **Customer Management (B2B CRM) Module**: Customer Management (B2B CRM) module is operational and provides Quote-to-CRM inline customer creation and Shadow Account auto-provisioning functionality
3. **Seller Portal Exists**: Seller Portal is already operational and can be enhanced with SP program opt-in features and CRM inline customer creation
4. **Payment Gateway Integration**: Payment gateway is already integrated and supports multiple payment methods (cash, bank transfer, credit, installment)
5. **SMS Gateway Available**: SMS gateway is configured and operational for OTP and notifications
6. **File Storage Infrastructure**: Secure file storage infrastructure exists for KYC documents and attachments
7. **Master SKU System**: Master SKU system is operational for product search and discovery
8. **Order Management System**: Order management system exists and can handle multi-seller decoupled checkout
9. **Admin Portal Exists**: Admin Portal is operational and can be enhanced with SP management features
10. **Mobile-First Design**: All UI components will be designed mobile-first per platform standards
11. **Thai Language Primary**: All UI text will be in Thai language, following `docs/shared/glossary.md`
12. **Phased Rollout**: Module will be rolled out in phases (pilot with internal Leaders, then public SPs)
13. **Commission Calculation**: SP commission is calculated from Platform Fee only (not Payment Fee or order value)
13a. **Platform Fee Percentage**: Platform Fee is 2% of Sale Order
13b. **Withdrawal Fee**: Payout withdrawal fee is 5 THB per transaction
13c. **Fee Collection Dependency**: Commission becomes confirmed only after Platform Fee is successfully collected from seller
13d. **Fee Management System Integration**: Fee Management System provides real-time fee collection status updates
13e. **Commission Visibility Restriction**: Commission amounts not displayed in product discovery/store selection views
13f. **Commission Policy Evaluation**: Commission policies are evaluated at order completion time, not at RFQ or quote time
13g. **Rule Precedence Deterministic**: Rule precedence is deterministic based on specificity and priority
13h. **Payout Batch Processing**: Payout batches are processed synchronously with payment gateway
13i. **Failed Payout Retry**: Failed payouts can be retried individually without recreating entire batch
13j. **Category and Seller ID Stability**: Category IDs and Seller IDs are stable and not frequently changed
13k. **Commission Rule Stacking**: Commission rules are not stacked; only one rule applies per transaction
14. **Digital Quotation as Source of Truth**: All disputes must reference the digital quotation approved via Offer Link
15. **No SP-to-Buyer Chat**: Direct SP-to-Buyer chat is out of scope; communication via Magic Link only
16. **No Automated KYC**: KYC verification is manual by Admin (no third-party automation in v1)
17. **No Buyer Self-Registration**: Buyers do not self-register at checkout; accounts are pre-provisioned by Seller via CRM module
18. **Shadow Account Auto-Provisioning**: Customer Management (B2B CRM) module handles Shadow Account creation with default passwords
19. **HEIC Conversion Available**: HEIC to PNG conversion service/library is available and operational
20. **Consent Center API Available**: Consent Center API is operational and accessible for logging consent
21. **Consent Center Synchronous**: Consent logging is synchronous; application submission waits for Consent Center response
22. **Province-District Mapping**: Complete province-district mapping data is available in the system
23. **Region-Province-District Mapping**: Complete Region-Province-District hierarchy data is available and accurate
24. **PDF Processing Library**: PDF preview generation library/service is available and operational
25. **PDF Storage**: System can store both original PDF files and generated preview images
26. **Buyer Grouping UI**: RFQ list UI supports grouping and filtering by buyer name
27. **Delivery Time Flexibility**: Delivery time can be any future date/time (no business hours restriction in v1)
28. **Buyer Account Pre-Provisioning**: Buyer accounts are pre-provisioned before Magic Link is sent (no checkout registration flow)
29. **SP ID Auto-Generation**: System auto-generates unique SP ID upon account creation
30. **CRM Inline Flow**: Sellers use CRM inline customer creation when generating quotes for SPs
31. **Project Name Organizational**: Project name is for organizational purposes only (no validation against external project database)
32. **Payment Method Binding**: Payment method selection is binding (cannot be changed after RFQ submission)
33. **Store Credit Discretion**: Store credit approval is store's discretion (no centralized credit scoring)
34. **Geocoding Service Available**: Delivery address geocoding service is available and accurate
35. **Proximity Calculation**: Proximity calculation uses straight-line distance (not driving distance)
36. **Favorite Stores Unlimited**: Favorite stores list has no maximum limit
37. **Tax Invoice Pricing**: Tax invoice requirement affects pricing (VAT included if Yes)
38. **Contact Info Delivery Only**: Contact information is used for delivery coordination only (not marketing)
39. **Google Maps Link Optional**: Google Maps link is optional and not validated for accuracy
40. **Delivery Time Slots General**: Delivery time slots are general guidelines (not strict time windows)
41. **Self Pickup Address Optional**: Self Pickup delivery address is optional (buyer picks up from store location)
42. **14-Day Magic Link Expiration**: 14-day Magic Link expiration is sufficient for buyer decision-making
43. **7-Day RFQ Expiration**: 7-day RFQ expiration is sufficient for store quote submission
44. **Monthly Commission Payout**: Monthly commission payout is acceptable for SPs
45. **500 THB Minimum Payout**: 500 THB minimum payout threshold is acceptable
46. **Manual KYC Verification**: Manual KYC verification is acceptable (no automated verification in v1)
47. **Training Materials Optional**: Training materials are optional/recommended (not mandatory for SP onboarding)
48. **Immediate Reapplication**: Immediate reapplication for rejected SPs is acceptable (no cooldown period)
49. **Region/Province/District Data Available**: Region/Province/District cascading hierarchy data is available and accurate
50. **HEIC/PDF Conversion Operational**: HEIC conversion and PDF processing services are operational
51. **AI Vendor Service Available**: External AI vendor service (AI All in team) is operational and accessible
52. **AI Vendor SLA**: AI vendor meets SLA (synchronous < 10s, asynchronous < 5min)
53. **Elasticsearch Operational**: Elasticsearch service is configured for product search
54. **Image Storage Available**: Secure storage for uploaded product images
55. **AI Results Non-Binding**: AI extraction results are recommendations only, not auto-final
56. **SP Validation Required**: SP must confirm all product lists before RFQ submission
57. **Confidence Scores Internal**: AI confidence scores logged but not displayed to SP
58. **Mixed-Source Supported**: One RFQ can have products from multiple sources (manual + AI)
59. **Buyer Type Required**: All RFQs must specify buyer type (INDIVIDUAL or CORPORATE)
60. **Tax ID Format Standard**: Tax ID is 13 digits for both individuals and corporates (Thailand standard)
61. **Branch Default**: Corporate branch defaults to "สำนักงานใหญ่" (head office) if not specified
62. **Tax Invoice Address Editable**: Auto-populated tax invoice address from delivery address can be edited by SP
63. **Tax Invoice Affects Pricing**: Tax invoice requirement and buyer type may affect quotation pricing and documentation
64. **No Tax ID Validation Service**: Tax ID format validated but not verified against government database (v1)

---

## Questions for UX Designer

1. **SP Registration Flow**: Should the registration flow be single-page or multi-step wizard? (Recommendation: Multi-step for better mobile UX)
2. **Service Area Selector**: How should the cascading area-shop selector be designed for mobile? (Dropdown, modal, or bottom sheet?)
3. **Offer Hub Layout**: How should the side-by-side comparison adapt for mobile? (Stacked cards or horizontal scroll?)
4. **Magic Link Sharing**: What sharing options should be prioritized? (LINE, WhatsApp, Copy link, or others?)
5. **Commission Dashboard**: What visualizations should be included? (Charts, graphs, or tables only?)
6. **Empty States**: What empty state messages and illustrations should be used for each screen?
7. **Loading States**: What loading indicators should be used? (Spinners, skeleton screens, or progress bars?)
8. **Error States**: How should errors be displayed? (Toast, modal, inline, or banner?)
9. **Status Timeline**: How should the application status timeline be visualized? (Stepper, timeline, or checklist?)
10. **Mobile Navigation**: How should SP Portal navigation be structured for mobile? (Bottom nav, hamburger menu, or tabs?)
11. **File Preview**: How should uploaded files (including HEIC) be previewed before submission? (Thumbnail, full-screen modal, or inline?)
12. **Province Selector**: Should province selection use dropdown, searchable modal, or map-based interface?
13. **Limited Access UI**: How should the UI indicate limited access for Pending/InfoRequested/Rejected SPs? (Banner, disabled nav items, or redirect-only?)
14. **Buyer Input**: Should buyer name be free-text input, searchable dropdown, or autocomplete with previous buyers?
15. **RFQ Grouping**: How should RFQs grouped by buyer be displayed? (Accordion, tabs, or separate pages?)
16. **Region Selector**: How should Region → Province → District cascading selector be designed? (Nested dropdowns, multi-step modal, or tree view?)
17. **PDF Preview Display**: How should PDF preview thumbnails be displayed? (Inline with upload button, separate preview section, or lightbox?)
18. **Delivery Schedule UI**: How should multiple delivery rounds be input and displayed? (Table, card list, or timeline view?)
19. **Buyer Info Form**: Should buyer information be in separate section or inline with RFQ form?
20. **Store Selection Limit**: How to indicate 12-store limit visually? (Counter, disabled checkboxes after 12, or warning message?)
21. **Payment Method Selector**: How should payment method selection be displayed? (Radio buttons, dropdown, or card selection?)
22. **Delivery Type Toggle**: How should delivery type selection be designed? (Toggle switch, radio buttons, or segmented control?)
23. **Contact Info Section**: Should contact info be in separate section or grouped with delivery info?
24. **Tax Invoice Toggle**: How should tax invoice requirement be displayed? (Checkbox, toggle switch, or Yes/No radio buttons?)
25. **Favorite Store Indicator**: How should favorite stores be indicated in store list? (Star icon, heart icon, or badge?)
26. **Store Distance Display**: How should distance from delivery address be displayed? (Inline text, badge, or separate column?)
27. **Location Filter UI**: How should location-based filtering be visualized? (Auto-applied with indicator, or manual toggle?)
28. **Favorite Filter Toggle**: How should "Show Favorite Stores Only" filter be designed? (Checkbox, toggle switch, or filter button?)
29. **Credit Approval Info**: How should store credit approval info message be displayed? (Tooltip, info banner, or modal?)
30. **Additional Notes Field**: How should additional notes field be designed? (Text area, expandable field, or separate section?)
31. **Product Acquisition UI**: How should the 3 product acquisition methods be presented? (Tabs, buttons, wizard?)
32. **AI Upload Interface**: How should image upload for AI extraction be designed? (Drag-drop, camera, gallery?)
33. **AI Processing Indicator**: How to show AI processing status? (Progress bar, spinner, estimated time?)
34. **AI Results Review**: How should AI-extracted products be displayed for review? (Table, cards, list?)
35. **Edit AI Results**: How should SP edit AI-extracted items? (Inline edit, modal, side panel?)
36. **Mixed-Source Indicator**: How to show which products came from AI vs manual search? (Icons, badges, color coding?)
37. **Buyer Type Selector**: How should buyer type selection be designed? (Radio buttons, toggle, dropdown?)
38. **Tax Invoice Section**: Should tax invoice information be in separate section or inline with buyer info?
39. **Address Auto-Population**: How to indicate that tax invoice address is auto-populated from delivery address?
40. **Corporate Fields Layout**: How should corporate tax invoice fields be grouped? (Single section, collapsible, tabs?)
41. **Branch Default Indicator**: How to show that branch defaults to "สำนักงานใหญ่"? (Placeholder, pre-filled, helper text?)
42. **Quote Detail View Display**: How should quote detail view be displayed? (Modal overlay, side panel, full page?)
43. **Quote Status Badges**: How should quote status badges be designed? (Color coding, icons, text labels?)
44. **Quote Dashboard Mobile**: How should quote dashboard adapt for mobile? (Cards, list view, table with horizontal scroll?)
45. **Quote Filtering UI**: How should quote filtering UI be designed? (Dropdown menus, filter chips, sidebar panel?)
46. **RFQ Quote Grouping**: How to indicate which quotes belong to same RFQ in dashboard? (Visual grouping, color coding, RFQ badge?)

---

## Questions for Developer

1. **Authentication Integration**: What is the API contract for Authentication Center and Allkons ID integration?
2. **File Upload**: What is the maximum file size and allowed formats for KYC documents and message attachments?
3. **Token Generation**: What algorithm should be used for Magic Link token generation? (UUID v4, nanoid, or custom?)
4. **Database Schema**: Should StartupPartner be a separate table or extend the User table?
5. **Commission Calculation**: Should commission calculation be real-time or batch processed?
6. **Message Storage**: Should messages be stored in relational DB or NoSQL (e.g., MongoDB for chat history)?
7. **Search Implementation**: Should product search use Elasticsearch or database full-text search?
8. **Caching Strategy**: What should be cached? (Product search results, quote comparisons, commission data?)
9. **Rate Limiting**: What rate limits should be applied to API endpoints? (e.g., 100 requests/minute per user)
10. **Webhook Integration**: Do we need webhooks for payment confirmation, order updates, or other events?
11. **Background Jobs**: What background jobs are needed? (RFQ expiration, commission payout, notification sending?)
12. **API Versioning**: Should we use URL versioning (`/api/v1/`) or header versioning?
13. **HEIC Conversion**: Which library/service for HEIC to PNG conversion? (Sharp, ImageMagick, cloud service?) Performance implications?
14. **Consent Center Integration**: What is the Consent Center API contract? Timeout handling? Retry logic? Fallback if unavailable?
15. **District Auto-Population**: How should district auto-population be implemented? (Database query, cached mapping, or API call?)
16. **Buyer Reference**: Should buyerId link to existing Buyer table or remain as free-text? Indexing strategy for grouping queries?
17. **Shop Filtering**: How to efficiently query shops that opted-in to SP Program in specific service areas? (Join query, materialized view, or cache?)
18. **Limited Access Middleware**: How to implement route-level access control for Pending/InfoRequested/Rejected SPs? (Middleware, guard, or decorator?)
19. **File Format Detection**: How to detect HEIC files reliably? (MIME type, file extension, or magic number?)
20. **Consent Center Fallback**: What happens if Consent Center API is down? (Block submission, log locally and sync later, or allow with warning?)
21. **Region-Province-District Data**: Where is Region-Province-District mapping stored? (Database table, JSON config, or external API?)
22. **PDF Preview Generation**: Which library for PDF to image conversion? (pdf.js, ImageMagick, Puppeteer?) Performance impact?
23. **PDF Storage Strategy**: Store original PDF + preview image separately or generate preview on-demand?
24. **Delivery Time Validation**: How to validate delivery time is after deadline + 24 hours? (Client-side, server-side, or both?)
25. **Delivery Schedule Conflicts**: Should system detect/prevent overlapping delivery rounds? (Validation rule or warning only?)
26. **Buyer Phone Storage**: Store buyer phone in RFQ table or create separate Buyer reference table?
27. **SP ID Generation**: When is SP ID generated? (On registration submission or on approval?)
28. **RFQ Store Limit**: How to enforce 12-store limit? (Database constraint, application logic, or both?)
29. **Multi-Round Delivery**: Should delivery rounds be stored in separate table or JSON array in RFQ table?
30. **CRM Integration**: What is the API contract for Customer Management (B2B CRM) module's inline customer creation?
31. **Shadow Account Flow**: How does the Shadow Account auto-provisioning work? Duplicate detection logic? Password generation?
32. **CRM Dependency**: What happens if CRM module is unavailable when Seller tries to generate quote?
33. **Buyer Account Linking**: How to link pre-provisioned buyer accounts to Magic Link offers?
34. **Geocoding Service**: Which geocoding service will be used for delivery address to coordinates conversion? (Google Maps API, OpenStreetMap, or other?)
35. **Proximity Calculation**: What algorithm should be used for proximity calculation? (Haversine formula for straight-line distance?)
36. **Proximity Limit**: Should there be a maximum distance limit for store filtering? (e.g., only show stores within 50km)
37. **Payment Method Enum**: Should payment method enum values be stored in database or hardcoded in application?
38. **Credit Approval Timeout**: How long does store have to approve/reject credit before quotation expires?
39. **Credit Limit Display**: Should system display buyer's credit limit with each store (if available)?
40. **Partial Credit Approval**: If store approves credit conditionally (e.g., reduced limit), how is this communicated to SP and buyer?
41. **Delivery Address Validation**: Should system validate delivery address format or geocoding accuracy before RFQ submission?
42. **Google Maps Link Validation**: Should system verify Google Maps link points to valid location?
43. **Tax Invoice Pricing Logic**: Does tax invoice requirement affect quotation pricing calculation? (e.g., VAT inclusion logic)
44. **Self Pickup Location**: For self pickup, should system display store pickup address to buyer in Offer Hub?
45. **Multiple Delivery Addresses**: Can one RFQ have multiple delivery addresses for different items?
46. **Delivery Location vs Address**: Should deliveryLocation and deliveryAddress fields be consolidated or kept separate?
47. **Favorite Store Sync**: Should favorite stores be synced across devices/sessions in real-time or eventually consistent?
48. **Store Filtering Performance**: What is the expected performance for store filtering with geocoding? (< 2 seconds acceptable?)
49. **AI Vendor API Contract**: What is the exact endpoint, authentication, and request/response format for AI vendor?
50. **AI Vendor Timeout**: What timeout values for synchronous (10s?) and asynchronous (5min?) modes?
51. **AI Vendor Retry Logic**: Should system retry failed AI requests? How many times?
52. **Image Storage Location**: Where to store uploaded images? (S3, GCS, local?)
53. **Image Retention**: How long to retain uploaded images after RFQ submission?
54. **Elasticsearch Schema**: What fields are indexed for product search?
55. **Search Performance**: Expected response time for product search? (< 2 seconds?)
56. **AI Result Caching**: Should AI extraction results be cached? For how long?
57. **Concurrent AI Requests**: Can multiple SPs trigger AI extractions simultaneously? Rate limiting?
58. **Tax ID Validation Algorithm**: What checksum algorithm for Tax ID validation? (Mod 11 for Thailand?)
59. **Address Field Sync**: When delivery address changes, should tax invoice address auto-update if USE_DELIVERY_ADDRESS?
60. **Tax Invoice Data Storage**: Store tax invoice info in RFQ table or separate TaxInvoice table?
61. **Buyer Type Migration**: How to handle existing RFQs without buyer type? (Default to INDIVIDUAL?)
62. **Tax Invoice PDF Generation**: Does system need to generate tax invoice PDF or handled by accounting module?
63. **Quote Detail Route**: Should quote detail be a separate route or modal component?
64. **Quote Data Caching**: How to handle quote data caching? (Cache per RFQ or global quote cache?)
65. **Quote Dashboard Real-time**: Should quote dashboard support real-time updates? (WebSocket, polling, manual refresh?)
66. **Quote Pagination Strategy**: What pagination strategy for quote list? (Offset-based, cursor-based, infinite scroll?)
67. **Quote Filtering Location**: Should quote filtering be client-side or server-side?

---

**End of BRD**

> **Next Steps:**
> 1. Review and approve this consolidated BRD
> 2. Tech Lead runs `/write-tech-spec` for each epic
> 3. UX Designer runs `/write-ux-spec` for each epic
> 4. UI Developer implements frontend per epic
> 5. Developer implements backend per epic
> 6. QA Analyst creates test cases per epic

