---
name: write-test-case
description: Design comprehensive test cases from BRD, Epic, Tech Spec, and Frontend Spec — before development starts
---

> **Deprecated.** Use **`/design-test-cases`** instead — see `docs/ai/skills/design-test-cases/SKILL.md`. This skill is kept for reference only; all docs now point to design-test-cases, which produces the same 05-test-spec format (canonical: Register Flow).

# Write Test Case

Designs comprehensive test cases from approved specifications, producing Phase 1 of the Test Specification (`05-test-spec.md`).

**Role scope:** The QA Analyst operates after BRD, Tech Spec, and Frontend Spec are approved — **before** the Developer starts coding. The approved BRD, `01-epic.md`, `02-technical-spec.md`, and `03-frontend-spec.md` are treated as upstream truth. The QA Analyst does **not** execute tests or write automation scripts — that is the QA Automation's responsibility.

> **Role guide:** See `docs/ai/roles/qa-analyst.md` for the QA Analyst's full role context, cognitive protocol, and quality checklist. Output template: `docs/modules/template-module/01-Epic1/05-test-spec.md`.

---

## QA Analyst Cognitive Protocol

A 3-step systematic framework applied when designing test cases:

| Step | Name | Purpose | Applied In |
|------|------|---------|------------|
| 1 | Requirement Coverage Mapping | Map every US-xx / FR-xxx to test cases (1 happy path + 2 error + 1 edge case per US) | Step 3: Map Requirements |
| 2 | Test Design | Design test steps, expected results, pre-conditions, and test data for each test case | Step 4: Generate Test Cases |
| 3 | Traceability Audit | Verify every US-xx has test coverage, no orphan test cases, all UI states tested | Step 5: Validation |

### Mandatory Thinking Triggers

**Rule:** QA Analyst must always ask internally at every stage:

- Have I covered **every user story** (US-xx) from `01-epic.md` Section 2?
- Does every test case map to a **FR-xxx** or **US-xx**?
- Have I designed **negative test cases** for every validation rule (BR-xxx)?
- Have I tested all **UI states** (empty, loading, error, success, permission denied)?
- Have I included **boundary value** tests for every numeric/text field?
- Have I covered **permission-based** scenarios from `01-epic.md` Section 6?
- Have I designed tests for **error responses** from `02-technical-spec.md` API contracts?

---

## Usage

```bash
/write-test-case [module-name] [epic-name]

# With options:
/write-test-case [module-name] [epic-name] --type functional
/write-test-case [module-name] [epic-name] --type security
/write-test-case [module-name] [epic-name] --priority P0,P1
```

## Instructions

When the user invokes `/write-test-case [module-name] [epic-name]`:

**Step 1: Read Approved Specifications**
Read in order:
1. `docs/modules/$1/brd.md` - Business requirements (MUST be `🟢 Final / Approved`)
2. `docs/modules/$1/$2/01-epic.md` - Epic spec, focus on:
   - **Section 2: User Stories** — AC, BR, validation rules, edge cases, error handling
   - **Section 6: Role and Permission Matrix** — who can do what
   - **Section 8: Requirements** — FR-xxx functional requirements
   - **Section 11: Data Dictionary** — entity attributes for test data design
3. `docs/modules/$1/$2/02-technical-spec.md` - Tech spec, focus on:
   - **Section 3: API Contracts** — endpoints, request/response, error codes
   - **Section 6: Security** — auth, permissions, merchant isolation
   - **Section 9: Traceability Matrix** — US-xx → API → DB mapping
4. `docs/modules/$1/$2/03-frontend-spec.md` - Frontend spec (Phase 1 UX Design sufficient for test design), focus on:
   - **Section 3: UI States** — empty, loading, error, success, partial success
   - **Section 7: Validation UX** — field rules, error messages, error display
   - **Section 6: Responsive Concept** — desktop, tablet, mobile behavior
5. `docs/modules/template-module/01-Epic1/05-test-spec.md` - Canonical template (Phase 1 sections only)

If any required document doesn't exist or is marked `⚪ Draft`, tell user:
```
❌ Final specifications not found or not approved.

Please ensure BSA, Tech Lead, and UX Designer have reviewed and approved their respective documents to "🟢 Final / Approved" before QA Analyst can design test cases.
```

**Step 2: Read Test Standards & Shared Documentation**
Read:
1. `docs/ai/rules/testing/06-testing-and-quality.md` - Testing best practices
2. `docs/ai/rules/testing/testing-ids.md` - Test ID naming conventions (data-testid)
3. `docs/shared/test-data/$1/test-data.md` - Test data for the module (test accounts, valid/invalid inputs). **If not exists, auto-create** from `docs/shared/test-data/_template.md` using `01-epic.md` Section 2 (validation rules, error handling, edge cases) + `mockData.ts` from `src/app/design-mocks/_shared/` (if exists)
4. `docs/shared/error-handling.md` - Error display patterns and error code catalog
5. `docs/shared/glossary.md` - Central UX writing glossary (for verifying UI text in expected results)
6. `docs/ai/rules/ux-designer/01-validation-rules.md` - Global field validation rules (for designing validation tests)
7. `docs/ai/rules/ux-designer/03-ux-writing.md` - UX Writing & Copy Standards (verify expected UI text matches glossary)

**Step 3: Map Requirements to Test Cases** *(Cognitive Protocol Step 1: Requirement Coverage Mapping)*

For each User Story (US-xx) in `01-epic.md` Section 2:
- Extract acceptance criteria, business rules (BR-xxx), validation rules
- Map to FR-xxx from Section 8
- Map to API endpoints from `02-technical-spec.md` Section 3
- Design test cases:
  - **1 Positive** (happy path — AC met)
  - **1-2 Negative** (validation failures, BR violations, error responses)
  - **1 Edge Case** (boundary values, empty states, max limits)

Build the Test Coverage Matrix (Section 2 of template):
```
| User Story | FR | API Endpoint | Test Case IDs | Coverage |
```

**Step 4: Generate Test Cases** *(Cognitive Protocol Step 2: Test Design)*

For each test case, fill the UAT table format from the template:

```
| Test case ID | Module | Role | Test Case Description | Test case type | Test Device | Data Test | Pre-Condition | Test Step | Expected Result | Test Result by QA | Time Stamp | Test by QA | Test Result by User | Time Stamp | Actual Result (Screenshot) | Defect |
```

Rules:
- **Test case ID**: Use format `UAT_TC001`, `UAT_TC002`, etc.
- **Test Steps**: Numbered, specific, actionable (e.g., "1. Navigate to /products<br>2. Click 'Add Product' button")
- **Expected Result**: Specific, measurable (e.g., "1. Modal opens with empty form<br>2. All required fields marked with *")
- **Pre-Condition**: Login state, test data, permissions required
- **Leave results columns empty**: `Test Result by QA`, `Time Stamp`, `Test by QA`, `Test Result by User`, `Actual Result`, `Defect` — these are filled by QA Automation in Phase 2

Also generate:
- **Section 5: Non-Functional Tests** — performance, security, accessibility test cases
- **Section 6: Browser Compatibility** — mark all browsers as ⬜ Pending
- **Section 7: Test Data Requirements** — specific test data needed per test case

**Step 5: Validation** *(Cognitive Protocol Step 3: Traceability Audit)*

Run this checklist before saving:

### Coverage Checks
- [ ] Every US-xx from `01-epic.md` Section 2 has at least 1 test case
- [ ] Every FR-xxx from Section 8 is covered
- [ ] Test Coverage Matrix (Section 2) is complete — no empty rows
- [ ] Every API endpoint from `02-technical-spec.md` has error scenario tests

### Design Quality Checks
- [ ] Every test case has specific, numbered test steps (not vague)
- [ ] Every test case has measurable expected results
- [ ] Pre-conditions specify login role, test data, and environment
- [ ] Negative tests cover all validation rules (BR-xxx)
- [ ] Edge cases cover boundary values for numeric/text fields

### UI State Checks
- [ ] Empty state tested (no data)
- [ ] Loading state tested (skeleton/spinner)
- [ ] Error state tested (API failure)
- [ ] Success state tested (data loaded)
- [ ] Permission denied state tested (wrong role)

### Security Checks
- [ ] Unauthorized access test (wrong role)
- [ ] Merchant isolation test (wrong merchant)
- [ ] XSS test (script in text fields)
- [ ] Permission escalation test

**Step 6: Save Test Spec (Phase 1 only)**
Write to: `docs/modules/$1/$2/05-test-spec.md`

Only fill Phase 1 sections (1–7). Leave Phase 2 sections (8–12) empty with their template placeholders.

**Step 7: Provide Next Steps**
Tell the user:
```
✅ Draft Test Cases designed: docs/modules/$1/$2/05-test-spec.md (Phase 1)

Test Summary:
- Total test cases: [X]
  - Functional: [X] (Positive: [X], Negative: [X], Edge Case: [X])
  - Non-Functional: [X]
- Coverage: [X] / [X] User Stories covered (100%)

Next steps for QA Analyst:
1. Review the test cases and coverage matrix.
2. Verify test steps are specific enough for execution.
3. If you approve, reply "I approve" so I can mark Phase 1 as Final.
4. Once Phase 1 is approved, Developer can start implementation.
5. After Developer deploys to SIT, QA Automation will execute tests (Phase 2) using /execute-tests.
```

## Tips for AI

- **Follow testing standards**: Read `docs/ai/rules/testing/06-testing-and-quality.md` for best practices
- **Use correct test IDs**: Follow `docs/ai/rules/testing/testing-ids.md` for data-testid naming
- **Cover all requirements**: Every US-xx and FR-xxx needs test cases
- **Be specific**: Exact test steps, not vague instructions
- **Use spec data**: Reference exact business rules, limits, error messages from BRD/Epic
- **Verify UI text**: Expected Result text for UI verification MUST match `docs/shared/glossary.md` exactly. Follow `docs/ai/rules/ux-designer/03-ux-writing.md` for message templates.
- **Include test data**: Specify what data to use for each test
- **Think like attacker**: Try to break the module with negative/edge cases
- **Consider user workflow**: Test realistic end-to-end scenarios, not just individual functions
- **Design for execution**: Test steps should be clear enough for QA Automation to execute without asking questions

## Options

- `--type functional`: Generate only functional tests
- `--type security`: Generate only security tests
- `--type performance`: Generate only performance tests
- `--priority P0,P1`: Generate only high-priority tests

## Reference

Read `docs/ai/roles/qa-analyst.md` for the QA Analyst's full role context, cognitive protocol, and quality checklist.
