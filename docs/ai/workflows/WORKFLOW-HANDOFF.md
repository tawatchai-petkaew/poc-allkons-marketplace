# Workflow Handoff System

## Overview

This document defines how work flows between roles, what artifacts each role produces, and how they communicate results to the next role.

---

## 📋 Role Workflow Chain (Strict Approval Process)

```
[PO] Needs/Prompt → PRD (Draft) → PO Reviews/Approves → Final PRD
       ↓
[BSA] Final PRD → BRD (Draft: cards, flow, architecture) → BSA Reviews/Approves → Final BRD
       ↓
[Tech Lead] Final BRD + Epic → Technical Spec (Draft: DB schema, API contracts, architecture) → Tech Lead Reviews/Approves → Final Tech Spec
       ↓                          ↘
[UX Designer] Final BRD + Epic + Tech Spec →  (Tech Lead & UX Designer can work in parallel)
       UX Design (Phase 1 of 03-frontend-spec.md) → UX Designer Reviews/Approves
       ↓
[UI Developer] Approved UX Design + Tech Spec → Component Structure + Mock TSX (Phase 2 of 03-frontend-spec.md) → UI Developer Approves
       ↓
[QA Analyst] Final BRD + Tech Spec + Frontend Spec → Test Cases (Phase 1 of 05-test-spec.md) → QA Analyst Approves
       ↓                          ↘
[DEV] Final Tech Spec + Frontend Spec + Mock TSX →  (QA Analyst & Developer can work in parallel)
       Integration & Implementation → DEV Approves → Deploy to SIT
       ↓
[QA Automation] Test Cases (Phase 1) + Deployed SIT → Execute Tests + Automation (Phase 2) → QA Automation Approves → Sign-off
```

---

## 1️⃣ Product Owner (PO)
**Flow**: Prompt -> PRD (Draft/Non-Approve) -> PO Rechecks & Approves -> Final PRD

### PO Creates:
**Document:** `docs/modules/[module-name]/{module-name}.md`

**Approval Status**: Must include `Status: ⚪ Draft` changing to `🟢 Final / Approved` upon review.

**Template:**
```markdown
# PRD: [Module Name]

**Date:** [YYYY-MM-DD]
**Status:** Draft

## Change Log
| Version | Date | Changes | Updated By | Status |
|---------|------|---------|------------|--------|
| v1.0 | [YYYY-MM-DD] | Initial version | PO | ⚪ Draft |

> **💡 When updating:** Change Status to 🟢 Final / Approved ONLY AFTER explicit PO approval.

## Business Context
- **Problem Statement**: What user problem are we solving?
- **Business Goal**: Revenue/retention/engagement target
- **Priority**: P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low)
- **Target Release**: Sprint/Date

## User Stories
As a [role], I want [action], so that [benefit]

### Story 1: [Title]
- **User Type**: Seller Admin / Merchant Owner
- **Scenario**: Describe the user journey
- **Acceptance Criteria**:
  - [ ] Criterion 1
  - [ ] Criterion 2
  - [ ] Criterion 3

## Success Metrics
- Metric 1: [e.g., 80% of sellers complete import in < 5 mins]
- Metric 2: [e.g., Reduce support tickets by 30%]

## Out of Scope
- List what's NOT included in this release

## Dependencies
- Backend API: [list required endpoints]
- External Service: [e.g., file storage service]

## Questions for BA
- [ ] Question 1
- [ ] Question 2
```

**Handoff Checklist:**
- [ ] PRD file created in `docs/modules/[module-name]/` as Draft
- [ ] PO has reviewed the Draft PRD
- [ ] PRD terms aligned with `docs/shared/glossary.md`
- [ ] PRD is marked as `🟢 Final / Approved`
- [ ] Fully ready for BSA to consume

---

## 2️⃣ Business System Analyst (BSA)
**Flow**: Consumes Final PRD -> Breaks into cards, flow, architecture, data flow -> BRD (Draft/Non-Approve) -> BSA Rechecks & Approves -> Final BRD

### BSA Creates:
**Document:** `docs/modules/[module-name]/{module-name}.md`

**Approval Status**: Must include `Status: ⚪ Draft` changing to `🟢 Final / Approved` upon review.

**Template:**
```markdown
# BRD: [Module Name]

## Business Requirements

### Functional Requirements
**FR-001: [Requirement Title]**
- **Description**: Detailed functional requirement
- **Business Rules**:
  - Rule 1: [e.g., Max file size: 50MB]
  - Rule 2: [e.g., Supported formats: CSV, XLSX]
- **Data Requirements**:
  - Input: [fields required]
  - Output: [expected result]
- **Validation Rules**:
  - Field validations
  - Business logic validations

**FR-002: [Next Requirement]**
...

### Non-Functional Requirements
- **Performance**: [e.g., Import 10,000 products in < 30 seconds]
- **Security**: [e.g., Role-based access control]
- **Scalability**: [e.g., Support up to 100K products per merchant]

### Data Models
```typescript
// Expected data structures
interface ProductImportData {
  merchantSlug: string;
  products: Array<{
    name: string;
    sku: string;
    price: number;
    // ...
  }>;
}
```

### API Contracts
**Endpoint:** `POST /api/product/v1/import`
**Request:**
```json
{
  "merchantSlug": "string",
  "file": "multipart/form-data"
}
```
**Response:**
```json
{
  "success": true,
  "importedCount": 1234,
  "errors": []
}
```

### Business Glossary
- **Term 1**: Definition in business context
- **Term 2**: Definition in business context

### Edge Cases & Error Scenarios
1. **Scenario**: Duplicate SKU in file
   - **Expected**: Show error with row numbers
   - **User Action**: User can fix and re-upload

2. **Scenario**: Invalid file format
   - **Expected**: Show format error before upload
   - **User Action**: Download template

### State Transitions
```
[Initial] → [Uploading] → [Validating] → [Processing] → [Complete]
                ↓             ↓              ↓
            [Error]      [Error]        [Partial Success]
```

## Questions for UX Designer / UI Developer
- [ ] Question about UI flow
- [ ] Question about user feedback

## Questions for Developer
- [ ] Question about technical feasibility
- [ ] Question about API availability
```

**Handoff Checklist:**
- [ ] BRD file created in `docs/modules/[module-name]/` as Draft
- [ ] Cards, architecture, and data flow detailed
- [ ] BSA has reviewed the Draft BRD
- [ ] BRD is marked as `🟢 Final / Approved`
- [ ] Business Glossary terms aligned with `docs/shared/glossary.md`
- [ ] All validation/error messages follow `docs/ai/rules/ux-designer/03-ux-writing.md` templates
- [ ] New Thai UI text added to `docs/shared/glossary.md`
- [ ] Fully ready for UX Designer, UI Developer & DEV to consume

---

## 3️⃣ UX Designer + UI Developer (Two-Phase Frontend Spec)

### Pre-Phase: Module UX Overview (NEW)
**Flow**: Consumes Final BRD + ALL Epics → Module-Level UX Overview (`MODULE-UX-OVERVIEW.md`) → UX Designer Reviews
**Skill**: `/write-ux-overview [module-name]`
**Output**: `docs/modules/[module-name]/MODULE-UX-OVERVIEW.md`
**Also updates**: `docs/architecture/INFORMATION-ARCHITECTURE.md` (IA sitemap)

> **Mandatory**: UX Designer must run `/write-ux-overview` before `/write-ux-spec`. This establishes the module's screen map, navigation, shared layout, and cross-epic flow.

### Phase 1: UX Designer
**Flow**: Consumes Final BRD + Epic + Tech Spec → UX Design (Phase 1 of `03-frontend-spec.md`: user flows, screens, states, interactions) → UX Designer Reviews/Approves

### Phase 2: UI Developer
**Flow**: Consumes approved Phase 1 + Tech Spec → Component Structure + Mock TSX (Phase 2 of `03-frontend-spec.md`) → UI Developer Reviews/Approves

### Output:
**Document:** `docs/modules/[module-name]/[epic]/03-frontend-spec.md` (Phase 1 + Phase 2)
**Code:** `src/app/design-mocks/[production-route]/page.tsx` (Mock Route UI — route-based, mirrors production paths)

**Approval Status**: `⚪ Draft` → `🟡 Phase 1 Approved (UX Design)` → `🟢 Phase 1 + Phase 2 Final`

**Template:**
```markdown
# Design Spec: [Module Name]

## Figma Links
- **Main Flow**: [Figma link]
- **Components**: [Figma component library link]
- **Prototype**: [Interactive prototype link]

## User Flow
```
[Landing Page] → [Click Import] → [Upload Modal] → [Validation] → [Progress] → [Result]
```

## Screens & Components

### Screen 1: Product Import Page
**Figma Frame**: [Link to specific frame]

**Components Used:**
- `<Button variant="primary">` - Import button
- `<Upload accept=".csv,.xlsx">` - File uploader
- `<Table>` - Product preview table
- `<ProgressBar>` - Import progress

**Interactions:**
1. **On Page Load**: Show empty state with "Import Products" button
2. **On Button Click**: Open upload modal
3. **On File Select**: Validate format → Show preview
4. **On Submit**: Show progress bar → Redirect to product list

**States:**
- Empty State: [Screenshot/description]
- Loading State: Spinner in button
- Error State: Red border + error message below input
- Success State: Green checkmark + success message

### Component Specifications

**Upload Modal:**
- **Size**: 600px × 400px
- **Padding**: 24px
- **Title**: "Import Products" (Typography.Title level={3})
- **Close Button**: Top-right (X icon)
- **Layout**: [Component tree structure]

### Design Tokens
```typescript
// Use existing theme from /src/app/providers.tsx
colors: {
  primary: '#00AF43',
  error: '#DA2110',
  border: '#D9D9D9'
}

spacing: {
  modal: '24px',
  input: '16px'
}

typography: {
  title: 'Typography.Title level={3}',
  body: 'Typography.Text'
}
```

### Responsive Behavior
- **Desktop (>1024px)**: Full modal 600px
- **Tablet (768-1024px)**: Modal 90% width
- **Mobile (<768px)**: Full-screen modal

### Animation/Transitions
- Modal: Fade in + slide up (0.3s ease-out)
- Progress bar: Smooth fill animation
- Success message: Fade in after 0.5s

### Accessibility
- Modal: `role="dialog"` `aria-labelledby="modal-title"`
- Close button: `aria-label="Close modal"`
- Upload input: `aria-describedby="file-requirements"`
- Error messages: `role="alert"`

### Assets
- Icons: Use Ant Design icons (`UploadOutlined`, `CheckCircleFilled`)
- Images: Product placeholder (`/public/images/product-placeholder.png`)

## Design System References
- All components should use Ant Design from existing design system
- Custom styles only for brand-specific colors
- Refer to `docs/docs/DESIGN-SYSTEM.md` for component usage

## Edge Cases UI
1. **File too large**: Show warning toast
2. **Invalid format**: Red error text below upload
3. **Partial import success**: Show summary table (X succeeded, Y failed)

## Questions for Developer
- [ ] Is the upload size limit technically feasible?
- [ ] Can we show real-time progress or just percentage?
```

**Handoff Checklist:**
- [ ] MODULE-UX-OVERVIEW.md created/updated with screen map and navigation
- [ ] IA sitemap updated at docs/architecture/INFORMATION-ARCHITECTURE.md
- [ ] Designs reference existing components from app component registry
- [ ] Phase 1 (UX Design, Sections 1–7) created as Draft
- [ ] UX Designer reviewed and approved Phase 1
- [ ] Shared docs updated: `docs/shared/glossary.md`, `docs/shared/error-handling.md`, validation rules, UX patterns
- [ ] All UI text follows `docs/ai/rules/ux-designer/03-ux-writing.md` conventions
- [ ] Phase 2 (Frontend Implementation, Sections 8–14) created by UI Developer
- [ ] Mock TSX strings match `docs/shared/glossary.md` (no rogue Thai strings)
- [ ] Mock TSX created in `design-mocks/` route and reviewed
- [ ] Test data auto-created/updated at `docs/shared/test-data/[module]/test-data.md` from `mockData.ts` + epic
- [ ] Frontend Spec is marked as `🟢 Phase 1 + Phase 2 Final`

---

## 4️⃣ Developer (DEV)
**Flow**: Consumes Final BRD + UI in Real Route -> Designs APIs, Integrates with UI -> DEV Approves -> Deploys to SIT

### Developer Creates:
**Document:** `docs/modules/[module-name]/[epic]/04-implementation.md`

**Template:**
```markdown
# Implementation: [Module Name]

## Summary
Brief description of what was implemented

## Changes Made

### New Files Created
- `src/app/(auth)/products/import/page.tsx` - Import page component
- `src/api/product-import.api.ts` - Import API calls
- `src/interfaces/product/import.interface.ts` - Type definitions

### Modified Files
- `src/app/(auth)/products/manage-products/page.tsx` - Added import button
- `src/constants/routing.constants.ts` - Added import route

### API Endpoints Used
- `POST /api/product/v1/import` - Import products from file
- `GET /api/product/v1/import/:importId/status` - Check import status

## Implementation Details

### Tech Stack Used
- React Query for data fetching
- Ant Design Upload component
- Zustand for merchant context

### Key Functions
```typescript
// Main import function
async function importProducts(file: File) {
  // Implementation details for testers to understand
}
```

### Environment Variables
None required (uses existing `NEXT_PUBLIC_API_HOST_URL`)

### Database Changes
None (backend handles via existing product table)

### Feature Flags
None

## Testing Instructions

### Prerequisites
- Login as merchant admin
- Have test CSV file ready (sample: `/public/samples/product-import-template.csv`)

### Manual Testing Flow
1. Navigate to `/products/manage-products`
2. Click "Import Products" button
3. Upload CSV file (use sample template)
4. Verify validation messages for invalid formats
5. Submit valid file
6. Verify progress indicator shows
7. Verify success message and redirect to product list
8. Verify imported products appear in table

### Test Data
**Valid CSV:**
```csv
name,sku,price,stock
Product 1,SKU001,100,50
Product 2,SKU002,200,30
```

**Invalid CSV (for error testing):**
```csv
name,sku,price,stock
Product 1,DUPLICATE,100,50
Product 2,DUPLICATE,200,30
```

### Known Issues / Limitations
- File size limit: 50MB (backend constraint)
- Only CSV and XLSX supported
- Import is asynchronous (may take 30s for large files)

### Browser Testing Required
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Deployment Info
- **Branch**: `feat/product-import`
- **PR**: #123
- **Staging URL**: https://staging.allkons-seller.com
- **Staging Credentials**: [Link to credential vault]

## Questions for Tester
- [ ] Do you need additional test data?
- [ ] Any specific edge cases to prioritize?
```

**Handoff Checklist:**
- [ ] Implementation doc created
- [ ] APIs designed and integrated into the real route UI components
- [ ] DEV has approved the final implementation
- [ ] Shared docs updated if needed: `docs/shared/error-handling.md`, `docs/shared/test-data/[module]/test-data.md`
- [ ] All UI text matches `docs/shared/glossary.md` (no rogue strings)
- [ ] Successfully deployed to SIT environment ready for QA

---

## 5️⃣ Quality Assurance (QA)
**Two-phase flow:**
- **Phase 1 (QA Analyst)**: Consumes Final BRD + Tech Spec + Frontend Spec → Designs Test Cases (Phase 1 of `05-test-spec.md`) → QA Analyst Approves — **before** dev starts
- **Phase 2 (QA Automation)**: Consumes Test Cases (Phase 1) + Deployed SIT → Executes Tests + Automation (Phase 2 of `05-test-spec.md`) → QA Automation Approves → Sign-off

### QA Creates:
**Document:** `docs/modules/[module-name]/[epic]/05-test-spec.md`

**Approval Status**: `Status: ⚪ Draft` → `🟡 Phase 1 Approved (Test Cases)` → `🟢 Phase 2 Complete (Executed + Automated)`

**Template:**
```markdown
# Bug Report: [Bug Title]

## Bug ID
BUG-001

## Severity
- [ ] Critical (Blocker - cannot release)
- [ ] High (Major functionality broken)
- [ ] Medium (Minor functionality issue)
- [ ] Low (UI/UX polish, typos)

## Environment
- **URL**: https://staging.allkons-seller.com/products/import
- **Browser**: Chrome 120.0.6099.109
- **OS**: macOS Sonoma 14.1
- **User Role**: Merchant Admin
- **Merchant**: test-merchant-001

## Steps to Reproduce
1. Login as merchant admin
2. Navigate to Products > Manage Products
3. Click "Import Products"
4. Upload file with 10,001 rows
5. Click "Submit"

## Expected Result
Show error message: "File exceeds maximum 10,000 products"

## Actual Result
Page hangs, no error message shown, browser becomes unresponsive

## Screenshots/Videos
[Attach screenshot or Loom video]

## Console Errors
```
Uncaught RangeError: Maximum call stack size exceeded
    at validateRows (product-import.tsx:45)
```

## Network Logs
```
POST /api/product/v1/import - PENDING (timeout after 60s)
```

## Additional Context
- Issue only occurs with files > 10,000 rows
- CSV files work fine, XLSX files hang
- Issue started after commit abc123

## Reproducibility
- [x] Always reproducible
- [ ] Sometimes reproducible (50%)
- [ ] Rare (<10%)

## Suggested Fix
Add file row validation before upload to prevent large files

## Related Tickets
- Related to BRD requirement: FR-003 (max 10K products per import)
```

#### B) Test Report
**Document:** `docs/modules/[module-name]/{module-name}.md`

**Template:**
```markdown
# Test Report: [Module Name]

## Test Summary
- **Module**: Product Import
- **Version**: v1.0.0
- **Tested By**: [Tester Name]
- **Test Date**: 2024-03-02
- **Environment**: Staging
- **Status**: ✅ Passed / ⚠️ Passed with Minor Issues / ❌ Failed

## Test Coverage

### Functional Tests
| Test Case | Status | Notes |
|-----------|--------|-------|
| Upload valid CSV | ✅ Pass | Imported 100 products successfully |
| Upload valid XLSX | ✅ Pass | Imported 50 products successfully |
| Upload invalid format (PDF) | ✅ Pass | Error message shown correctly |
| Upload file > 50MB | ✅ Pass | Size validation works |
| Duplicate SKU validation | ⚠️ Partial | Error shown but row numbers incorrect |
| Import progress indicator | ✅ Pass | Shows percentage correctly |
| Success redirect | ✅ Pass | Redirects to product list |

### Non-Functional Tests
| Test Case | Status | Performance |
|-----------|--------|-------------|
| Import 1,000 products | ✅ Pass | 5 seconds |
| Import 5,000 products | ✅ Pass | 18 seconds |
| Import 10,000 products | ⚠️ Warning | 45 seconds (slower than 30s target) |
| Concurrent imports | ❌ Fail | Second import blocked |

### Browser Compatibility
| Browser | Status | Issues |
|---------|--------|--------|
| Chrome 120 | ✅ Pass | None |
| Safari 17 | ✅ Pass | None |
| Firefox 121 | ⚠️ Partial | Progress bar animation glitchy |
| Mobile Safari | ✅ Pass | None |
| Mobile Chrome | ✅ Pass | None |

### Accessibility Tests
| Test | Status | Notes |
|------|--------|-------|
| Keyboard navigation | ✅ Pass | Can navigate without mouse |
| Screen reader (VoiceOver) | ⚠️ Partial | Error messages not announced |
| Color contrast | ✅ Pass | WCAG AA compliant |
| Focus indicators | ✅ Pass | Visible on all inputs |

## Bugs Found
1. **BUG-001** (Medium): Duplicate SKU error shows wrong row numbers
2. **BUG-002** (High): Concurrent imports blocked (should queue)
3. **BUG-003** (Low): Firefox progress bar animation glitch

## Test Data Used
- Valid CSV: 100 rows
- Large CSV: 10,000 rows
- Invalid formats: PDF, TXT, JSON
- Edge cases: Empty file, single row, special characters

## Regression Tests
| Area | Status | Notes |
|------|--------|-------|
| Existing product list | ✅ Pass | Not affected by import module |
| Product search | ✅ Pass | New products searchable |
| Product edit | ✅ Pass | Can edit imported products |
| Merchant switching | ✅ Pass | Import respects merchant context |

## Security Tests
| Test | Status | Notes |
|------|--------|-------|
| Unauthorized access | ✅ Pass | Requires merchant admin role |
| File injection | ✅ Pass | Validated on backend |
| XSS in product names | ✅ Pass | Properly escaped |

## Performance Metrics
- **Page Load**: 1.2s
- **Time to Interactive**: 2.1s
- **File Upload (10MB)**: 3.5s
- **Import Processing (1000 products)**: 5s

## Recommendation
⚠️ **Conditional Approval**: Module can be released with BUG-001 and BUG-003 as low priority fixes. BUG-002 (concurrent imports) should be fixed before production release.

## Sign-off Required From
- [ ] QA Lead
- [ ] Product Owner
- [ ] Tech Lead
```

**Handoff Checklist:**
- [ ] Test report created in `docs/modules/[module-name]/`
- [ ] All test cases executed
- [ ] Bugs filed in `docs/modules/[module-name]/bugs/`
- [ ] Screenshots/videos attached
- [ ] Performance metrics recorded
- [ ] UI text verified against `docs/shared/glossary.md` during testing
- [ ] Sign-off request sent to stakeholders

---

## 📁 Directory Structure for Handoffs

```
docs/modules/
├── prd/                      # Product requirements from PO
│   ├── product-import.md
│   ├── bulk-edit.md
│   └── ...
├── brd/                      # Business requirements from BA
│   ├── product-import.md
│   ├── bulk-edit.md
│   └── ...
├── design/                   # Frontend specs from UX Designer + UI Developer
│   ├── product-import.md
│   ├── bulk-edit.md
│   └── ...
├── implementation/           # Implementation docs from Dev
│   ├── product-import.md
│   ├── bulk-edit.md
│   └── ...
├── test-reports/             # Test reports from QA
│   ├── product-import.md
│   ├── bulk-edit.md
│   └── ...
└── bugs/                     # Bug reports from QA
    ├── BUG-001-duplicate-sku-error.md
    ├── BUG-002-concurrent-imports.md
    └── ...
```

---

## 🔄 Complete Workflow Example

### Module: Product Bulk Import

**Week 1:**
1. PO creates `prd/product-import.md` → Tags BA
2. BA reviews, asks questions, then creates `brd/product-import.md` → Tags UX Designer + Tech Lead

**Week 2:**
3. UX Designer creates user flows & screens (Phase 1 of `03-frontend-spec.md`) → Tags UI Developer
4. UI Developer builds component structure + mock TSX (Phase 2) → Tags Developer + QA Analyst
5. Developer reviews frontend spec, estimates 5 days → Sprint planning

**Week 3:**
5. Developer implements module, creates `implementation/product-import.md` → Tags QA
6. QA tests on staging, finds 3 bugs, files in `bugs/` → Tags Developer

**Week 4:**
7. Developer fixes bugs → Tags QA
8. QA retests, creates `test-reports/product-import.md` → Tags PO + PM
9. PO reviews test report, approves release → Module deployed to production

---

## 🛠️ Tools Integration

### Recommended Tools
- **Project Management**: Jira / Linear / GitHub Projects
- **Design**: Figma (link Figma files in handoff docs)
- **Documentation**: Markdown files in `docs/modules/`
- **Communication**: Slack channels per module

### Linking Handoffs to Tools
Each handoff document should reference:
```markdown
## Related Links
- **Jira Ticket**: [PROJ-123](https://jira.com/PROJ-123)
- **GitHub PR**: [#456](https://github.com/org/repo/pull/456)
- **Figma**: [Design Link](https://figma.com/...)
- **Slack Thread**: [#product-import discussion](https://slack.com/...)
```

---

## ✅ Quality Checklist

Before handing off to next role, verify:

**PO → BA:**
- [ ] User stories have acceptance criteria
- [ ] Success metrics defined
- [ ] Dependencies identified
- [ ] PRD terms aligned with `docs/shared/glossary.md`

**BA → UX Designer:**
- [ ] All functional requirements clear
- [ ] Data models documented
- [ ] Edge cases identified
- [ ] Validation/error messages use glossary templates (`docs/ai/rules/ux-designer/03-ux-writing.md`)

**UX Designer → UI Developer:**
- [ ] Phase 1 (Sections 1–7) complete and approved
- [ ] Figma links included
- [ ] All states designed (empty, loading, error, success, partial success)
- [ ] New UI text added to `docs/shared/glossary.md`

**UI Developer → Developer:**
- [ ] Phase 2 (Sections 8–14) complete and approved
- [ ] Mock TSX files accessible at design-mocks route
- [ ] Mock TSX strings match `docs/shared/glossary.md`
- [ ] Responsive breakpoints implemented
- [ ] Traceability Matrix complete
- [ ] Component registry updated with new shared components
- [ ] Mock uses shared layout for prototype continuity
- [ ] Zero hardcoded hex colors — all use design tokens
- [ ] Storybook stories created for new components (where applicable)

**Developer → QA:**
- [ ] Deployed to staging
- [ ] Test data prepared
- [ ] Known issues documented
- [ ] UI text matches `docs/shared/glossary.md` (no rogue strings)

**QA → Team:**
- [ ] All test cases executed
- [ ] Bugs filed with reproduction steps
- [ ] UI text verified against `docs/shared/glossary.md`
- [ ] Sign-off recommendation given

---

## 📝 Templates Location

All templates are available in:
- `docs/templates/handoff-templates.md`

To use: Copy template → Rename with module name → Fill in sections → Tag next role
