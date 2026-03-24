---
name: execute-automate-tests
description: QA Automation skill — read approved test cases and development spec, generate Playwright scripts, execute tests, and update Phase 2 results
---

# Execute and Automate Tests

Supports the QA Automation role in performing **Phase 2 of the Test Specification**.

This skill is used **after Developer implementation is complete and deployed to SIT**.

## Role Scope

The QA Automation:
- reads approved test cases from `05-test-spec.md`
- reads implementation details from `04-develop-spec.md`
- generates Playwright automation scripts
- executes tests on SIT
- records actual results
- files bugs for failures
- updates execution summary and recommendation

The QA Automation does **not**:
- design new test cases
- change approved test design scope
- rewrite acceptance criteria
- redefine coverage that belongs to QA Analyst

> **Role guide:** `docs/ai/roles/qa-automation.md`

---

## Objective

Take approved test cases and continue the workflow through:

1. automation script generation
2. test execution
3. result recording
4. bug reporting
5. execution summary
6. release recommendation

---

## When to Use

Use this skill when the user asks to:

- execute test cases on SIT
- generate Playwright scripts from approved test cases
- update Phase 2 of `05-test-spec.md`
- record Pass / Fail / Blocked
- write bug reports for failed cases
- create execution summary
- provide release recommendation

Examples:
- `/execute-automate-tests authentication 01-RegisterFlow`
- `เอา test case ไปเขียน Playwright และ execute ต่อ`
- `ช่วย fill 05-test-spec.md Phase 2`
- `generate automation จาก approved test cases`

---

## Required Inputs

| Input | Path |
|------|------|
| Test Spec (Phase 1 approved) | `docs/modules/[module-name]/[epic-name]/05-test-spec.md` |
| Development Spec | `docs/modules/[module-name]/[epic-name]/04-develop-spec.md` |
| Shared Test Data | `docs/shared/test-data/[module-name]/test-data.md` |
| Error Handling | `docs/shared/error-handling.md` |
| Testing Rules | `docs/ai/rules/testing/06-testing-and-quality.md` |
| Test ID Rules | `docs/ai/rules/testing/testing-ids.md` |

Optional inputs:
| Input | Path |
|------|------|
| Existing Playwright tests | `playwright/tests/` (UI: `.../ui/`, API: `.../api/`) |
| Page Objects | `playwright/page-objects/` |
| Fixtures | `playwright/fixtures/` |
| Constants | `playwright/constants/` |
| Screenshots | `docs/modules/[module-name]/[epic-name]/screenshots/` |
| Bugs Folder | `docs/modules/[module-name]/[epic-name]/bugs/` |

---

## Preconditions

Before using this skill, confirm:

- `05-test-spec.md` Phase 1 is approved
- `04-develop-spec.md` exists and is ready for QA use
- SIT environment is available
- test accounts / test data are available
- test scope is already defined

If test cases are missing or incomplete, send the task back to QA Analyst.

---

## Responsibilities

- Read approved Phase 1 test cases
- Map test cases to automation scope
- Generate Playwright scripts
- Reuse existing Page Objects / fixtures / constants
- Execute tests on SIT
- Record Pass / Fail / Blocked
- Capture screenshot / trace for failures
- Write bug reports
- Fill Phase 2 of `05-test-spec.md`

---

## Core Workflow

### Step 1 — Read approved sources
Read:
- `05-test-spec.md`
- `04-develop-spec.md`
- shared test data
- error-handling rules

Extract:
- test case IDs
- priority
- steps
- expected results
- required test data
- SIT URL / environment details
- known issues / limitations

### Step 2 — Generate automation
Generate or update Playwright scripts under:

`playwright/tests/[module-name]/[epic-name]/ui/`

Use:
- Page Object Model
- shared test data
- shared error constants
- project naming conventions

Prioritize:
- `P0` first
- `P1` second
- `P2/P3` only if requested or time allows

### Step 3 — Execute tests
Run tests against SIT and record:
- Pass
- Fail
- Blocked
- timestamp
- actual result
- screenshot / trace path

### Step 4 — Analyze failures
For every failed test:
- determine product bug / flaky / environment issue
- assign severity
- create bug report
- reference screenshot and trace

### Step 5 — Update Phase 2
Update:
- execution summary
- bug list
- automation table
- recommendation / sign-off status

---

## Outputs

| Output | Description |
|--------|-------------|
| Playwright Script | `playwright/tests/[module-name]/[epic-name]/ui/*.spec.ts` |
| Execution Result | Pass / Fail / Blocked per test case |
| Screenshots | Failure evidence |
| Trace Files | Playwright trace if available |
| Bug Reports | Defect documentation |
| Test Summary | Total / Passed / Failed / Blocked |
| Recommendation | `PASS` / `CONDITIONAL PASS` / `FAIL` |

---

## Output Target

### A. Update existing test spec
Update:

`docs/modules/[module-name]/[epic-name]/05-test-spec.md`

Fill these sections:

- Section 6 — Test Execution Summary
- Section 7 — Bugs Found
- Section 8 — Test Automation
- Section 9 — Sign-off

If the project template supports result columns in test case tables, also update:
- Test Result by QA
- Time Stamp
- Actual Result
- Defect ID
- Script Path

### B. Generate scripts
Save automation to:

`playwright/tests/[module-name]/[epic-name]/ui/`

Example:

`playwright/tests/authentication/01-RegisterFlow/ui/register-flow.spec.ts`

### C. Save evidence
Save artifacts to:

- `docs/modules/[module-name]/[epic-name]/screenshots/`
- `docs/modules/[module-name]/[epic-name]/bugs/`

---

## Script Generation Rules

Generated Playwright automation should:

- follow existing project structure
- reuse existing Page Objects when available
- reuse fixtures and shared test data
- use constants for expected errors/messages when available
- keep one source of truth for locators when possible
- avoid duplicate alternate test suites
- map script titles to approved test case IDs

Recommended title format:

```ts
test("[UAT_REG_TC001] valid phone leads to OTP screen", async ({ page }) => {
  // ...
});
```

---

## Usage

```bash
/execute-automate-tests [module-name] [epic-name]
```

---

## Reference

- `docs/ai/roles/qa-automation.md`
- `docs/ai/skills/execute-tests/SKILL.md`
- `docs/ai/rules/testing/06-testing-and-quality.md`
- `docs/ai/rules/testing/testing-ids.md`
- `docs/shared/error-handling.md`
