## QA Testing Rules

This document defines **how QA is expected to test this project**:

- what QA owns
- which types of tests are required
- how tests, data, and bugs must be documented
- how this connects to the Allkons Seller Center architecture (Playwright, docs structure, etc.)

It applies to:

- QA Analysts
- QA Automation Engineers
- AI QA Agents
- Developers doing their own QA

The main goals are:

- consistent test coverage across modules
- reliable automation (stable Playwright runs in CI)
- clear and reproducible bug reports
- traceable test artifacts (specs, data, evidence all live in the repo)

---

## 1. QA Responsibilities

QA is responsible for validating **system quality, behaviour, and reliability** for each change.

### 1.1 Core responsibilities

| Area                | Responsibility                            |
| ------------------- | ------------------------------------------ |
| Requirement review  | Check that requirements are clear/testable |
| Test design         | Design structured test cases               |
| Functional testing  | Validate business behaviour                |
| API testing         | Verify backend contracts                   |
| UI testing          | Validate main user flows                   |
| Automation          | Maintain Playwright tests                  |
| Regression testing  | Protect existing features from regressions |
| Bug reporting       | Report clear, reproducible issues          |
| Release validation  | Validate readiness before release          |

If a requirement is **ambiguous, conflicting, or not testable**, QA must raise a clarification with BA/PO/Tech Lead before marking the story as ready to test.

---

## 2. Test Design Rules

Every feature must have a **test specification** before or during implementation.  
For each module/feature the test spec lives at:

```text
docs/modules/[module]/[feature]/05-test-spec.md
```

### 2.1 What every test spec must contain

At minimum:

- Test Plan Summary (scope, in/out of scope, risks)
- Coverage Matrix (mapping user stories / AC → test cases)
- Detailed Test Cases (steps, expected result)
- Security Test Cases (auth, permissions, injection, etc.)
- Non-functional Test Cases (performance, reliability where relevant)

### 2.2 Required test types

Each feature must consider and, where relevant, include tests for:

| Test Type      | Description                            |
| -------------- | -------------------------------------- |
| Happy Path     | Normal successful flow                 |
| Validation     | Invalid / missing user inputs          |
| Negative       | Invalid states and incorrect behaviour |
| Boundary       | Min/max values, limits, thresholds     |
| Error Handling | System and API failures                |
| Integration    | Interaction with other services/flows  |

> For critical modules (e.g. authentication, payments, checkout) **happy path + validation + error handling are mandatory**.

### 2.3 Test case naming convention

Manual / UAT test cases must follow:

```text
UAT_[MODULE]_TC###
```

Examples:

```text
UAT_REG_TC001
UAT_LOGIN_TC002
UAT_PRODUCT_TC003
```

Security-focused tests:

```text
UAT_[MODULE]_SEC###
```

Performance-focused tests:

```text
UAT_[MODULE]_PERF###
```

---

## 3. Test Coverage Rules

Every requirement must be testable and explicitly covered.

### 3.1 Coverage mapping

Coverage must map:

| Artifact              | Must be mapped to… |
| --------------------- | ------------------ |
| User Story (US-XX)    | Test Cases         |
| Acceptance Criteria   | Test Cases         |
| Functional Requirement| Test Cases         |

Example:

| Requirement | Test Case      |
| ---------- | -------------- |
| AC-01      | UAT_REG_TC001  |
| AC-02      | UAT_REG_TC002  |

QA must **flag missing coverage** before the story can be considered “dev complete”.

---

## 4. API Testing Rules

For this project, **Playwright API testing** is the standard for automated API tests.

### 4.1 Location

```text
playwright/tests/[module]/[feature]/api/
```

### 4.2 Required API coverage

For each critical endpoint, tests should cover:

| Test Type       | Required |
| --------------- | -------- |
| Happy Path      | ✓        |
| Validation Error| ✓        |
| Unauthorized    | ✓        |
| Forbidden       | ✓        |
| Edge Cases      | ✓        |

### 4.3 API assertions

API tests must validate at least:

- HTTP status code
- response schema (shape and required fields)
- business code (e.g. success / error codes)
- error message structure for failures

Example (conceptual):

```ts
expect(response.status()).toBe(200);
expect(body.code).toBe("SUCCESS");
```

---

## 5. UI Automation Rules

UI tests validate **end-to-end user behaviour**, not just individual components.

### 5.1 Framework and location

- Framework: **Playwright**
- Location:

```text
playwright/tests/[module]/[feature]/ui/
```

### 5.2 Minimum UI automation coverage

Critical flows that should have automation include (non‑exhaustive):

- authentication (login, register)
- registration flows (multi‑step)
- checkout
- payment
- account / profile management

### 5.3 Automation principles

| Rule                     | Description                          |
| ------------------------ | ------------------------------------ |
| Use Page Object Model    | Avoid duplicated selectors           |
| Use stable selectors     | Prefer `data-testid` over CSS/XPath  |
| Isolate tests            | No dependency between tests          |
| Avoid hard waits         | No `waitForTimeout()` in normal flow |
| Capture artifacts        | Screenshots + traces on failure      |

Bad example:

```ts
await page.waitForTimeout(3000);
```

Recommended:

```ts
await expect(page.getByTestId("btn--register-submit")).toBeVisible();
```

---

## 6. Test Data Rules

Test data must be **reusable, documented, and centralized**.

### 6.1 Location

```text
docs/shared/test-data/
```

### 6.2 Data categories

| Type       | Purpose                 |
| ---------- | ----------------------- |
| Valid      | Correct data            |
| Invalid    | Invalid inputs          |
| Boundary   | Edge values / limits    |
| Duplicate  | Already-existing records|
| Unauthorized| Permission validation  |

Example keys:

```text
TEST_DATA.register.phone.valid
TEST_DATA.register.phone.duplicate
```

**Never** use real customer data in any environment.

---

## 7. Exploratory Testing

Exploratory testing is required for **major features** (e.g. new flows, big UX changes).

QA should actively explore:

- unexpected navigation paths
- UI behaviour under stress
- unusual user input
- multi-step workflows
- network interruptions

Example scenarios:

- Refreshing during checkout
- Double-clicking the submit button
- Switching network during OTP verification
- Navigating back during registration

Findings from exploratory testing must be logged as **bugs** or **improvement tasks**.

---

## 8. Regression Testing

Regression testing ensures that **existing functionality remains stable** after changes.

### 8.1 Regression scope

High‑risk areas include:

- authentication
- payment flows
- core APIs
- user / organization management

Automation should cover as much regression scope as possible.  
Manual regression is still required for:

- usability validation
- cross‑browser behaviour
- responsive layouts

---

## 9. Bug Reporting Rules

All bugs must be:

- **reproducible**
- clearly linked to test cases and requirements

### 9.1 Required bug fields

| Field            | Description              |
| ---------------- | ------------------------ |
| Bug ID           | Unique identifier        |
| Test Case ID     | Related test case        |
| Environment      | SIT / UAT / PROD (if any)|
| Steps to Reproduce | Detailed numbered steps|
| Expected Result  | Correct behaviour        |
| Actual Result    | Observed behaviour       |
| Evidence         | Screenshots / logs / video|

Example bug ID format:

```text
BUG-REG-001
```

---

## 10. Automation Failure Evidence

Automation failures must include **evidence** to debug quickly.

### 10.1 Required artifacts

When a Playwright run fails, capture:

- Screenshot
- Playwright trace file
- Network logs (for API‑related failures)
- Request/response samples (for API tests)

Artifacts should live under the related feature, for example:

```text
docs/modules/[module]/[feature]/bugs/
```

---

## 11. Performance Validation

QA must validate basic performance for **critical flows**.

### 11.1 Typical targets (guideline)

| Metric        | Target      |
| ------------- | ----------- |
| API response  | < 500 ms    |
| Page load     | < 3 seconds |
| OTP request   | < 2 seconds |

If a flow does not meet expectations, log a performance issue with **measurable data** (timestamps, counts, screenshots).

---

## 12. Release Validation Rules

Before a release, QA must verify that:

- critical flows are working
- APIs are healthy
- automation pass rate is acceptable
- there are no unresolved critical bugs

### 12.1 Example release criteria

| Metric              | Requirement |
| ------------------- | ----------- |
| Automation pass rate| ≥ 95%       |
| Critical bugs       | 0           |
| High severity bugs  | Resolved or accepted with sign‑off |

---

## 13. QA Artifact Locations

All QA artifacts must be stored **inside this repository** so that they can be versioned with the code.

| Artifact           | Location                              |
| ------------------ | ------------------------------------- |
| Test Specification | `docs/modules/.../05-test-spec.md`   |
| Automation Scripts | `playwright/tests`                   |
| Test Data          | `docs/shared/test-data`              |
| Bug Reports        | `docs/modules/.../bugs`              |

These rules are the **default expectations** for QA in this project.  
If a team needs an exception (for technical or timeline reasons), it should be clearly documented in the relevant `05-test-spec.md` and, if needed, in the epic’s testing notes.

# QA Testing Rules

This document defines the **testing standards and responsibilities for QA** in this repository.

These rules apply to:

- QA Analysts
- QA Automation Engineers
- AI QA Agents
- Developers performing QA validation

The goal is to ensure:

- consistent test coverage
- reliable automation
- reproducible bug reports
- traceable testing artifacts
- stable CI/CD test execution

---

# 1. QA Responsibilities

QA is responsible for validating **system quality, behaviour, and reliability**.

QA responsibilities include:

| Area | Responsibility |
|-----|----------------|
Requirement validation | ensure requirements are testable |
Test design | create structured test cases |
Functional testing | validate business behaviour |
API testing | verify backend contracts |
UI testing | validate user flows |
Automation | maintain Playwright automation |
Regression testing | ensure existing features remain stable |
Bug reporting | document reproducible issues |
Release validation | verify readiness for release |

QA must raise clarification issues when requirements are ambiguous or not testable.

---

# 2. Test Design Rules

All features must have a documented test specification before execution.

Test specifications must be stored in:


docs/modules/[module]/[feature]/05-test-spec.md


Test specifications must include:

- Test Plan Summary
- Coverage Matrix
- Detailed Test Cases
- Security Test Cases
- Non-functional Test Cases

---

## 2.1 Required Test Types

Each feature must include tests for:

| Test Type | Description |
|----------|-------------|
Happy Path | normal successful flow |
Validation | invalid user inputs |
Negative | unexpected behaviour |
Boundary | min/max values |
Error Handling | system failures |
Integration | interaction with other services |

---

## 2.2 Test Case Naming Convention

All test cases must follow this format:


UAT_[MODULE]_TC###


Examples:


UAT_REG_TC001
UAT_LOGIN_TC002
UAT_PRODUCT_TC003


Security tests:


UAT_[MODULE]_SEC###


Performance tests:


UAT_[MODULE]_PERF###


---

# 3. Test Coverage Rules

Every requirement must be testable.

Coverage must map:

| Artifact | Coverage |
|--------|----------|
User Story | Test Cases |
Acceptance Criteria | Test Cases |
Functional Requirements | Test Cases |

Example:

| Requirement | Test Case |
|------------|-----------|
AC1 | UAT_REG_TC001 |
AC2 | UAT_REG_TC002 |

QA must flag missing coverage before development is considered complete.

---

# 4. API Testing Rules

Critical APIs must be validated through automated tests.

API automation framework:


Playwright API testing


Test location:


playwright/tests/[module]/[feature]/api/


---

## 4.1 Required API Coverage

Each endpoint must include tests for:

| Test Type | Required |
|----------|----------|
Happy Path | ✓ |
Validation Error | ✓ |
Unauthorized | ✓ |
Forbidden | ✓ |
Edge Cases | ✓ |

---

## 4.2 API Assertions

API tests must validate:

- HTTP status code
- response schema
- response business code
- required fields
- error message structure

Example:

```ts
expect(response.status()).toBe(200)
expect(body.code).toBe("SUCCESS")

## 5. UI Automation Rules

UI tests validate **complete user behaviour and flows**, not just components.

### 5.1 Framework and location

- **Framework:** Playwright  
- **Test location:**

```text
playwright/tests/[module]/[feature]/ui/
```

### 5.2 UI automation coverage

Critical flows that should be automated:

- authentication
- registration
- checkout
- payment
- account management

### 5.3 Automation principles

| Rule                    | Description                      |
| ----------------------- | -------------------------------- |
| Use Page Object Model   | Avoid duplicated selectors       |
| Use stable selectors    | Prefer `data-testid`             |
| Tests must be isolated  | No dependency between tests      |
| Avoid hard waits        | Do not use `waitForTimeout()`    |
| Capture artifacts       | Screenshot and trace on failure  |

**Bad practice:**

```ts
await page.waitForTimeout(3000);
```

**Recommended:**

```ts
await expect(page.getByTestId("btn--register-submit")).toBeVisible();
```

---

## 6. Test Data Rules

Test data must be **reusable and centralized**.

### 6.1 Location

```text
docs/shared/test-data/
```

### 6.2 Test data categories

| Type        | Purpose              |
| ----------- | -------------------- |
| Valid       | Correct data         |
| Invalid     | Invalid inputs       |
| Boundary    | Edge cases           |
| Duplicate   | Existing records     |
| Unauthorized| Permission validation|

Example keys:

```text
TEST_DATA.register.phone.valid
TEST_DATA.register.phone.duplicate
```

Sensitive **real user data must never be used** in tests.

---

## 7. Exploratory Testing

Exploratory testing is required for **major features**.

QA should explore:

- unexpected navigation
- UI behaviour under stress
- unusual user input
- multi-step workflows
- network interruptions

Example scenarios:

- refreshing during checkout
- double-clicking submit
- switching network during OTP verification
- navigating back during registration

All findings must be logged as **bugs** or **improvement tasks**.

---

## 8. Regression Testing

Regression testing ensures existing functionality remains **stable**.

### 8.1 Regression scope

Typical regression scope includes:

- authentication
- payment flows
- core APIs
- user management

Automation should cover **most regression scenarios**.  
Manual regression testing is required for:

- usability validation
- cross-browser behaviour
- responsive layouts

---

## 9. Bug Reporting Rules

All bugs must be **reproducible**.

### 9.1 Required bug fields

Bug reports must include:

| Field            | Description        |
| ---------------- | ------------------ |
| Bug ID           | Unique identifier  |
| Test Case ID     | Related test case  |
| Environment      | SIT / UAT          |
| Steps to reproduce | Detailed steps   |
| Expected result  | Correct behaviour  |
| Actual result    | Observed behaviour |
| Evidence         | Screenshots or logs|

Example bug ID:

```text
BUG-REG-001
```

---

## 10. Automation Failure Evidence

Automation failures must include **evidence**.

### 10.1 Required artifacts

- screenshot
- Playwright trace
- network logs
- request/response (for API failures)

Artifacts should be stored under:

```text
docs/modules/[module]/[feature]/bugs/
```

---

## 11. Performance Validation

QA must validate performance for **critical flows**.

### 11.1 Typical expectations

| Metric        | Target      |
| ------------- | ----------- |
| API response  | < 500 ms    |
| Page load     | < 3 seconds |
| OTP request   | < 2 seconds |

Performance issues must be documented with **measurable metrics** (numbers, timestamps, screenshots).

---

## 12. Release Validation Rules

Before a release, QA must verify:

- critical flows are working
- API health is acceptable
- automation pass rate is acceptable
- there are no unresolved critical bugs

### 12.1 Example release criteria

| Metric              | Requirement |
| ------------------- | ----------- |
| Automation pass rate| ≥ 95%       |
| Critical bugs       | 0           |
| High severity bugs  | Resolved or formally accepted |

---

## 13. QA Artifact Locations

All QA artifacts must be stored **inside the repository**.

| Artifact           | Location                            |
| ------------------ | ----------------------------------- |
| Test Specification | `docs/modules/.../05-test-spec.md` |
| Automation Scripts | `playwright/tests`                  |
| Test Data          | `docs/shared/test-data`            |
| Bug Reports        | `docs/modules/.../bugs`            |