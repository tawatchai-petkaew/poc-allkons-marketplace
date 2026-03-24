# Test Specification: [Epic Name]

**Author/Owner**: [Author/Owner] — QA Analyst (Phase 1) / QA Automation (Phase 2)
**Epic**: [Epic ID] — [Epic Name]
**Module**: [Module Name]
**Date**: [YYYY-MM-DD]
**Status**: [Status]

## Change Log

| Version | Date | Changes | Updated By | Role | Status |
|---------|------|---------|------------|------|--------|
| v1.0 | [YYYY-MM-DD] | Initial test plan — test cases designed from BRD + Epic + Tech Spec + Frontend Spec | QA Analyst | QA Analyst | [Status] |

> **💡 Two-phase document:**
> - **Phase 1 (QA Analyst)**: Design test plan, coverage matrix, and test cases — **before** Developer starts coding. Fill Sections 1–5.
> - **Phase 2 (QA Automation)**: Execute tests, log results, report bugs — **after** Developer completes implementation. Fill Sections 6–9.

---

## References

- **BRD**: `docs/modules/[module-name]/brd.md`
- **Epic**: `docs/modules/[module-name]/[epic-name]/01-epic.md`
- **Tech Spec**: `docs/modules/[module-name]/[epic-name]/02-technical-spec.md`
- **Frontend Spec**: `docs/modules/[module-name]/[epic-name]/03-frontend-spec.md`

---

# Phase 1: Test Design (QA Analyst — before Developer starts)

> Filled by `/design-test-cases [module-name] [epic-name]`. Input: BRD, Epic, Tech Spec, Frontend Spec.

---

## 1. Test Plan Summary

### Scope
Test the [epic/feature] for [Module Name], covering:
- [US-01]: [User story 1 summary]
- [US-02]: [User story 2 summary]
- [US-03]: [User story 3 summary]
- _(Add more user stories as needed)_

### Test Strategy
| Type | Coverage | Priority |
|------|----------|----------|
| Functional (Happy Path) | All user stories — end-to-end | P0 |
| Functional (Negative) | Validation errors, API errors, edge cases | P0 |
| Boundary Value | [Relevant fields: format, length, min/max] | P0 |
| State Transition | Step navigation, loading states | P1 |
| Security | [Relevant security scenarios] | P1 |
| UI/UX | Responsive layout, animations, accessibility | P2 |
| Cross-Browser | Chrome, Safari, Firefox, Edge | P2 |

### Test Environment
| Component | Details |
|-----------|---------|
| Environment | [Environment — e.g. SIT] |
| Frontend URL | [Frontend URL] |
| Backend API | [Backend API / service name] |
| Browser | Chrome 120+, Safari 17+, Firefox 120+, Edge 120+ |

### Entry Criteria
- [ ] BRD, Epic, Tech Spec, Frontend Spec all at 🟢 Final / Approved
- [ ] SIT environment deployed and accessible
- [ ] API endpoints reachable and returning expected structures

### Exit Criteria
- [ ] All P0 test cases pass
- [ ] No Critical or High severity bugs open
- [ ] Test coverage ≥ 90% of acceptance criteria
- [ ] Security test cases (if any) pass

---

## 2. Coverage Matrix

### User Story → Test Case Mapping

| User Story | AC | Test Case IDs | Coverage |
|-----------|-----|---------------|----------|
| US-01: [User Story Name] | AC-01 | UAT_[EPIC]_TC001 | [Coverage description] |
| US-01 | AC-02 | UAT_[EPIC]_TC002 | [Coverage description] |
| US-01 | AC-03 | UAT_[EPIC]_TC003 | [Coverage description] |
| US-01 | Edge | UAT_[EPIC]_TC004 | [Coverage description] |
| US-02: [User Story Name] | AC-01 | UAT_[EPIC]_TC005 | [Coverage description] |
| _(Add rows for every US-xx and AC)_ | | | |

### Functional Requirement → Test Case Mapping

| FR ID | Description | Test Case IDs |
|-------|-------------|---------------|
| FR-001 | [Description] | UAT_[EPIC]_TC001, TC002, TC003 |
| FR-002 | [Description] | UAT_[EPIC]_TC005, TC006 |
| _(Add rows for every FR-xxx)_ | | |

---

## 3. Test Cases

> Repeat this block for each test case; ensure every US-xx and FR-xxx is covered. Use IDs: `UAT_[EPIC]_TC###` (e.g. UAT_REG_TC001). Replace [EPIC] with short epic code (e.g. REG, LOGIN).

### UAT_[EPIC]_TC001: [Title] (Happy Path)
| Field | Value |
|-------|-------|
| **Test Case ID** | UAT_[EPIC]_TC001 |
| **Title** | [Full title — e.g. Valid input leads to success] |
| **Priority** | P0 |
| **Type** | Functional / Happy Path |
| **Maps to** | US-01 AC-01, FR-001 |

**Preconditions:**
- [Precondition 1 — e.g. User is on [screen/page]]
- [Precondition 2 — e.g. Test data available]

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | [Action] | [Expected result] |
| 2 | [Action] | [Expected result] |
| 3 | [Action] | [Expected result] |

**Expected Result:** [Summary of overall expected outcome]

**Test Data:**
| Data | Value |
|------|-------|
| [Data name] | [Value] |
| [Data name] | [Value] |

---

### UAT_[EPIC]_TC002: [Title] (Negative / Validation)
| Field | Value |
|-------|-------|
| **Test Case ID** | UAT_[EPIC]_TC002 |
| **Title** | [Full title — e.g. Invalid input shows validation error] |
| **Priority** | P0 |
| **Type** | Validation / Negative |
| **Maps to** | US-01 AC-02, BR-xxx |

**Preconditions:**
- [Precondition]

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | [Action] | [Expected result] |
| 2 | [Action] | Validation error: "[Exact message from spec]" |

**Expected Result:** [Summary]

**Test Data:** _(if needed)_
| Data | Value |
|------|-------|
| [Invalid/edge value] | [Expected error] |

---

### UAT_[EPIC]_TC003: [Title] (Edge / Boundary)
| Field | Value |
|-------|-------|
| **Test Case ID** | UAT_[EPIC]_TC003 |
| **Title** | [Full title] |
| **Priority** | P1 |
| **Type** | Edge Case / Boundary Value |
| **Maps to** | US-01 EC-xx, BR-xxx |

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | [Action] | [Expected result] |

---

_(Add more test case blocks for every scenario. Ensure positive, negative, boundary, and security-related cases.)_

---

## 4. Security Test Cases

### UAT_[EPIC]_SEC001: [Security scenario name]
| Field | Value |
|-------|-------|
| **Test Case ID** | UAT_[EPIC]_SEC001 |
| **Priority** | P0 / P1 |
| **Maps to** | BR-xxx, FR-xxx |

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | [Action — e.g. Attempt unauthorized access] | [Expected — e.g. 403 or block] |
| 2 | [Action] | [Expected result] |

_(Add SEC002, SEC003 as needed — e.g. token storage, input sanitization / XSS.)_

---

## 5. Non-Functional Test Cases

### UAT_[EPIC]_PERF001: Page Load Performance
| Field | Value |
|-------|-------|
| **Test Case ID** | UAT_[EPIC]_PERF001 |
| **Priority** | P2 |

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to [key page] on 4G connection | Page fully loaded within [X] seconds |
| 2 | Measure LCP (Largest Contentful Paint) | < [X] seconds |

### UAT_[EPIC]_PERF002: API Response Time
| Field | Value |
|-------|-------|
| **Test Case ID** | UAT_[EPIC]_PERF002 |
| **Priority** | P2 |

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Monitor [API name] in Network tab | Response < [X]ms |
| 2 | Monitor [API name] | Response < [X]ms |

### UAT_[EPIC]_RESP001: Mobile Responsive
| Field | Value |
|-------|-------|
| **Test Case ID** | UAT_[EPIC]_RESP001 |
| **Priority** | P2 |

**Test Steps:**
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open [key page] on [device / viewport] | Full-width layout, no horizontal scroll |
| 2 | Navigate through [key flows] | All forms usable, no layout overflow |

---

# Phase 2: Test Execution (QA Automation — after Developer completes)

> ⚠️ **NOT YET FILLED** — Phase 2 will be completed after the Developer implements the module (04-develop-spec.md).

## 6. Test Execution Summary

| Date | Scope | Result | Notes |
|------|--------|--------|-------|
| [YYYY-MM-DD] | [Test scope / script path] | [Pass/Fail summary] | [Notes] |

_To be filled by QA Automation._

## 7. Bugs Found
_To be filled by QA Automation._

## 8. Test Automation

| Script | Path | Notes |
|--------|------|--------|
| [E2E / UI] | `playwright/tests/[module]/[epic]/ui/[spec].spec.ts` | Run: `npm run test:e2e` (or from playwright/: `npx playwright test tests/...`) |
| [API] | `playwright/tests/[module]/[epic]/api/[spec].api.spec.ts` | Set `PLAYWRIGHT_BASE_URL` for env. Run: `npx playwright test tests/.../api/` |

## 9. Sign-off
| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| QA Analyst | | | | [Phase 1 Approved / Pending] |
| QA Automation | | | | ⏳ Pending Phase 2 |
| Product Owner | | | | ⏳ Pending |

---

## Glossary (TH/EN)

_(Optional — include if the epic uses Thai or localized terms.)_

| Thai (TH) | English (EN) | Context |
|-----------|--------------|---------|
| [Term TH] | [Term EN] | [Context] |
| [Term TH] | [Term EN] | [Context] |

---

## Example Prompt — QA Analyst

```
I need to create the Test Specification (Phase 1) for the [epic name] epic.
Use the /design-test-cases skill. Output must match the format of this file (Phase 1: Sections 1–5).

Input documents:
- docs/modules/[module-name]/brd.md (functional requirements, business rules)
- docs/modules/[module-name]/[epic-name]/01-epic.md (user stories, acceptance criteria, edge cases)
- docs/modules/[module-name]/[epic-name]/02-technical-spec.md (API contracts, error codes)
- docs/modules/[module-name]/[epic-name]/03-frontend-spec.md (UI states, validation rules)

Each test case must:
- Have a unique ID: UAT_[EPIC]_TC###
- Map to specific US, AC, FR, and BR references
- Include preconditions, test steps, expected results, and test data
- Cover happy path, negative, boundary value, edge cases, and security

Create a Coverage Matrix mapping every US/AC to test case IDs.
Include security tests where applicable (e.g. auth, token storage, XSS prevention).
Include performance tests for page load and API response time.

Read docs/ai/roles/qa-analyst.md for the role guide.
```
