---
name: design-test-cases
description: QA Analyst skill — read requirements, specs, and shared test data to generate structured test cases in 05-test-spec.md Phase 1
---

# Design Test Cases

Supports the QA Analyst role in creating **Phase 1 of the Test Specification**.

This skill is used **before development starts** or during refinement, after BRD / Epic / Tech Spec / Frontend Spec are approved.

## Role Scope

The QA Analyst:
- reads requirements and specifications
- reviews shared test data
- designs test cases and coverage
- writes Phase 1 of `05-test-spec.md`

The QA Analyst does **not**:
- execute tests
- generate Playwright scripts
- update actual results
- create execution summary
- create release recommendation

> **Role guide:** `docs/ai/roles/qa-analyst.md`

---

## Objective

Generate structured test cases from approved requirements and available test data.

Output must follow the **canonical format** (see Output Format below) and be saved to:

`docs/modules/[module-name]/[epic-name]/05-test-spec.md`

Fill **Phase 1 only** (Sections 1–5). Phase 2 (Sections 6–9) is filled by QA Automation after development.

**Format reference:** `docs/modules/authentication/01-RegisterFlow/05-test-spec.md` — output must match this structure.

**Filled by:** `/design-test-cases [module-name] [epic-name]`

---

## When to Use

Use this skill when the user asks to:

- create test cases
- design test scenarios
- prepare QA coverage before development
- generate test plan / coverage matrix
- write Phase 1 of `05-test-spec.md`
- derive test cases from PRD / BRD / Epic / Tech Spec / Frontend Spec

Examples:
- `/design-test-cases authentication 01-RegisterFlow`
- `ออกแบบ test case สำหรับ Register Flow`
- `ช่วยเขียน 05-test-spec.md Phase 1`
- `สร้าง coverage matrix จาก epic นี้`

---

## Required Inputs

Read inputs in this order when available:

| Input | Path |
|------|------|
| PRD | `docs/modules/[module-name]/prd.md` |
| BRD | `docs/modules/[module-name]/brd.md` |
| Epic | `docs/modules/[module-name]/[epic-name]/01-epic.md` |
| Tech Spec | `docs/modules/[module-name]/[epic-name]/02-technical-spec.md` |
| Frontend Spec | `docs/modules/[module-name]/[epic-name]/03-frontend-spec.md` |
| Shared Test Data | `docs/shared/test-data/[module-name]/test-data.md` |
| Error Handling | `docs/shared/error-handling.md` |
| Glossary | `docs/shared/glossary.md` |
| Testing Rules | `docs/ai/rules/testing/06-testing-and-quality.md` |
| Test ID Rules | `docs/ai/rules/testing/testing-ids.md` |

If PRD is not available, continue from BRD onward.

**Read order:** BRD → Epic → Tech Spec → Frontend Spec → shared test data, error-handling, glossary, testing rules. In Epic focus on Section 2 (User Stories, AC, BR), Section 6 (Role/Permission), Section 8 (FR-xxx). In Tech Spec focus on Section 3 (API contracts, error codes), Section 6 (Security). In Frontend Spec focus on Section 3 (UI states), Section 7 (Validation UX). If BRD/Epic/Tech Spec/Frontend Spec are not Final or Approved, tell the user to get them approved before designing test cases.

---

## Responsibilities

- Read requirements and specs
- Read available shared test data
- Map User Stories / FR / AC / BR to test coverage
- Design test cases
- Design test scenarios
- Define measurable expected results
- Define scope and coverage
- Fill Phase 1 of `05-test-spec.md`

---

## Expected Outputs

| Output | Description |
|--------|-------------|
| Test Plan Summary | Scope, strategy, environment, entry/exit criteria |
| Coverage Matrix | Maps US / AC / FR to test cases |
| Test Cases | ID, title, priority, type, preconditions, steps, expected result |
| Security Test Cases | If required by requirement/spec |
| Non-Functional Test Cases | If required by requirement/spec |
| Test Data Mapping | Which test data is used by which test case |

---

## Design Principles

For each User Story / FR, generate coverage including:

- **Happy Path** — positive flow with valid inputs
- **Negative Case** — validation failure, API error, incorrect input
- **Boundary Case** — min/max/empty/limit where applicable
- **Integration Case** — cross-step / cross-module / API + UI for critical flow

Critical user journeys should have end-to-end coverage.

Examples:
- Register → OTP → Set Password → Profile → Organization → Merchant
- Register → Login → Complete Profile
- Wrong OTP → Blocked State → Retry

**Per User Story:** design at least 1 Positive (happy path), 1–2 Negative (validation/API errors), 1 Edge (boundary, empty, limits). Map every US/AC/FR/BR to test cases.

---

## Test Case Format

Each test case must include:

- **Test Case ID**
- **Title**
- **Priority** (`P0`, `P1`, `P2`)
- **Type** (`Happy Path`, `Negative`, `Boundary`, `Integration`, `Security`, `Non-Functional`)
- **Maps to** (US / AC / FR / BR references)
- **Preconditions**
- **Test Steps**
- **Expected Result**
- **Test Data**

Expected result must be:
- measurable
- aligned to AC / BR / UI state / API response / error handling
- consistent with glossary and system messages

---

## ID Naming Rules

Use project naming convention from:

`docs/ai/rules/testing/testing-ids.md`

Recommended examples:
- `UAT_REG_TC001`
- `UAT_LOGIN_TC001`
- `UAT_AUTH_TC001`
- `UAT_[EPIC]_TCnnn`

Keep naming consistent within the same epic.

---

## Output Target

Update:

`docs/modules/[module-name]/[epic-name]/05-test-spec.md`

Fill **Phase 1 only** (Sections 1–5). Do **not** fill Phase 2 (Sections 6–9). Do **not** invent execution results.

---

## Output Format (Canonical)

Match the structure of `docs/modules/authentication/01-RegisterFlow/05-test-spec.md`:

**Header**
- Title: `# Test Specification: [Epic Name]`
- Lines: **Author/Owner**, **Epic**, **Module**, **Date**, **Status**
- **Change Log:** table `| Version | Date | Changes | Updated By | Role | Status |`
- **Two-phase note:** Phase 1 = Sections 1–5 (before dev), Phase 2 = Sections 6–9 (after dev)
- **References:** BRD, Epic, Tech Spec, Frontend Spec (paths under `docs/modules/...`)

**Phase 1: Test Design**
- **Section 1 — Test Plan Summary**
  - **Scope:** bullet list of what is tested (user stories / areas)
  - **Test Strategy:** table `| Type | Coverage | Priority |`
  - **Test Environment:** table `| Component | Details |`
  - **Entry Criteria** / **Exit Criteria:** checklist items
- **Section 2 — Coverage Matrix**
  - **User Story → Test Case Mapping:** table `| User Story | AC | Test Case IDs | Coverage |`
  - **Functional Requirement → Test Case Mapping:** table `| FR ID | Description | Test Case IDs |`
- **Section 3 — Test Cases**
  - Each case: `### UAT_xxx_TCnnn: Title`
  - Then table `| Field | Value |` with: Test Case ID, Title, Priority, Type, Maps to
  - **Preconditions:** (bullet or paragraph)
  - **Test Steps:** table `| Step | Action | Expected Result |`
  - **Test Data:** (if needed) table or list
- **Section 4 — Security Test Cases:** same block format (e.g. `UAT_xxx_SEC001`)
- **Section 5 — Non-Functional Test Cases:** same block format (e.g. `UAT_xxx_PERF001`, `UAT_xxx_RESP001`)

**Phase 2 (placeholder only)**
- Section 6 — Test Execution Summary
- Section 7 — Bugs Found
- Section 8 — Test Automation
- Section 9 — Sign-off

**Glossary (optional)**  
If the epic uses Thai/localized terms: table `| Thai (TH) | English (EN) | Context |`

---

## Acceptance Rules for This Skill

Before finalizing output, verify:

**Coverage**
- Every US-xx from Epic Section 2 has at least one test case
- Every FR-xxx is covered in the Coverage Matrix
- Every API endpoint from Tech Spec has at least one error-scenario test
- Coverage Matrix has no empty rows

**Design quality**
- Every test case has specific, numbered test steps and measurable expected results
- Preconditions specify login state, test data, and environment
- Negative tests cover all validation rules (BR-xxx)
- Boundary cases exist for numeric/text fields where applicable

**UI and behaviour**
- Empty, loading, error, success states are covered where applicable
- Error handling uses expected messages or states from specs/glossary
- Output matches the canonical format (Register Flow 05-test-spec structure)

---

## Out of Scope

This skill must **not**:
- execute tests
- generate Playwright scripts
- mark Pass / Fail / Blocked
- write bug reports
- create test execution summary
- create release recommendation

If the user asks for those tasks, route to QA Automation / execution skill instead.

---

## Usage

```bash
/design-test-cases [module-name] [epic-name]
```

---

## Reference

- `docs/ai/roles/qa-analyst.md`
- `docs/ai/rules/testing/06-testing-and-quality.md`
- `docs/ai/rules/testing/testing-ids.md`
- **Format reference:** `docs/modules/authentication/01-RegisterFlow/05-test-spec.md`