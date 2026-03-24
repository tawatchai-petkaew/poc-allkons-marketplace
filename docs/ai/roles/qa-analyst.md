# QA Analyst Guide - Using AI Assistant

**Role scope:** The QA Analyst operates after BRD, Tech Spec, and Frontend Spec are approved — **before** the Developer starts coding. The approved BRD, `01-epic.md`, `02-technical-spec.md`, and `03-frontend-spec.md` are treated as upstream truth. The QA Analyst designs test cases only — test execution and automation are the QA Automation's responsibility (see `docs/ai/roles/qa-automation.md`).

> **Executable skill:** For the step-by-step test case design process, run `/design-test-cases [module-name] [epic-name]` — see `docs/ai/skills/design-test-cases/SKILL.md`.

---

## 🎯 How AI Can Help You

As a QA Analyst, AI can assist with:
- ✅ Designing test cases from BRD, Tech Spec, and Frontend Spec (`/design-test-cases`)
- ✅ Mapping requirements to test coverage (US-xx → test cases)
- ✅ Generating negative and edge case scenarios
- ✅ Creating test data requirements
- ✅ Reviewing test coverage completeness
- ✅ Designing non-functional tests (performance, security, accessibility)

---

## 🧠 QA Analyst Cognitive Protocol

### Purpose

The QA Analyst bridges specifications and quality assurance — translating user stories, API contracts, and UI designs into comprehensive test cases that verify the system works correctly before code is written.

### Core Competencies

| Competency | Key Skills |
|------------|-----------|
| **Requirement Analysis** | Extract testable conditions from BRD, Epic, Tech Spec |
| **Test Design** | Happy path, negative, edge case, boundary value analysis |
| **Traceability** | US-xx → FR-xxx → Test Case mapping |
| **Risk Assessment** | Prioritize test cases by impact and likelihood |

### Cognitive Protocol

A 3-step systematic framework applied when designing test cases:

| Step | Name | Purpose | Applied In |
|------|------|---------|------------|
| 1 | Requirement Coverage Mapping | Map every US-xx / FR-xxx to test cases | Step 3: Map Requirements |
| 2 | Test Design | Design test steps, expected results, pre-conditions, test data | Step 4: Generate Test Cases |
| 3 | Traceability Audit | Verify every US-xx has coverage, no orphans, all UI states tested | Step 5: Validation |

### Mandatory Thinking Triggers

**Rule:** QA Analyst must always ask internally at every stage:

- Have I covered **every user story** (US-xx) from `01-epic.md` Section 2?
- Does every test case map to a **FR-xxx** or **US-xx**?
- Have I designed **negative test cases** for every validation rule (BR-xxx)?
- Have I tested all **UI states** (empty, loading, error, success, permission denied)?
- Have I included **boundary value** tests for every numeric/text field?
- Have I covered **permission-based** scenarios from `01-epic.md` Section 6?
- Have I designed tests for **error responses** from `02-technical-spec.md` API contracts?
- Have I verified **expected UI text** in test cases matches `docs/shared/glossary.md` exactly?

---

## 📚 Documents You Should Reference

When working with AI, tell it to read:
- `docs/modules/[module-name]/brd.md` - BRD (must be `🟢 Final / Approved`)
- `docs/modules/[module-name]/[epic]/01-epic.md` - Epic spec, focus on:
  - **Section 2: User Stories** — AC, BR, validation rules, edge cases
  - **Section 6: Role and Permission Matrix** — auth/permission per scenario
  - **Section 8: Requirements** — FR-xxx functional requirements
  - **Section 11: Data Dictionary** — entity attributes for test data
- `docs/modules/[module-name]/[epic]/02-technical-spec.md` - Tech spec, focus on:
  - **Section 3: API Contracts** — endpoints, error codes, validation rules
  - **Section 6: Security** — auth, permissions, merchant isolation
  - **Section 9: Traceability Matrix** — US-xx → API → DB mapping
- `docs/modules/[module-name]/[epic]/03-frontend-spec.md` - Frontend spec, focus on:
  - **UI states**: empty, loading, error, success
  - **Form validations**: field rules, error messages
  - **Responsive behavior**: desktop, mobile, tablet
- `docs/ai/rules/testing/06-testing-and-quality.md` - Testing best practices
- `docs/ai/rules/testing/testing-ids.md` - Test ID naming conventions
- `docs/shared/test-data/[module]/test-data.md` - Test data per module (test accounts, valid/invalid inputs)
- `docs/shared/error-handling.md` - Error display patterns and error code catalog
- `docs/ai/rules/ux-designer/03-ux-writing.md` - UX Writing & Copy Standards (verify expected UI text matches glossary)
- `docs/shared/glossary.md` - Central UX writing glossary (for verifying UI text in tests)
- `docs/ai/rules/ux-designer/01-validation-rules.md` - Global field validation rules (for designing validation tests)

---

## 📝 Output Template (What You Produce)

Your output artifact is **Phase 1 of the Test Specification** (Sections 1–5). Use this template:
- Template: `docs/modules/template-module/02-Epic2/05-test-spec.md`

Save your results to:
- `docs/modules/[module-name]/[epic]/05-test-spec.md`

> **Note:** Phase 2 (Sections 6–9: execution results, bugs, automation) is produced by **QA Automation** — see `docs/ai/roles/qa-automation.md`.

---

## 💬 Common AI Prompts

### Designing Test Cases from Specs

```
"I'm designing test cases for [module-name] [epic-name].
Read these documents:
1. docs/modules/[module-name]/brd.md (BRD)
2. docs/modules/[module-name]/[epic]/01-epic.md (Epic — Section 2, 6, 8, 11)
3. docs/modules/[module-name]/[epic]/02-technical-spec.md (Tech Spec — Section 3, 6, 9)
4. docs/modules/[module-name]/[epic]/03-frontend-spec.md (Frontend Spec — UI states, forms)

For each User Story (US-xx), design:
- 1 Positive test (happy path)
- 1-2 Negative tests (validation failures, error responses)
- 1 Edge Case test (boundary values)

Use the UAT table format from 05-test-spec.md template."
```

### Reviewing Test Coverage

```
"Review my test spec at docs/modules/[module-name]/[epic]/05-test-spec.md

Check:
- Does every US-xx have at least 1 test case?
- Does every FR-xxx have test coverage?
- Are all validation rules (BR-xxx) tested with negative cases?
- Are all UI states tested (empty, loading, error, success)?
- Are permission scenarios covered (from Section 6)?

What test cases am I missing?"
```

### Generating Negative Test Cases

```
"Read 01-epic.md Section 2 (User Stories) for [module-name] [epic].
For each business rule (BR-xxx) and validation rule:
- Design a test case that violates the rule
- Specify exact error message expected (from BRD/Epic)
- Include boundary values (min-1, max+1)

Format as UAT table."
```

### Designing Security Test Cases

```
"Read 02-technical-spec.md Section 6 (Security) and 01-epic.md Section 6 (Permissions).
Design test cases for:
- Unauthorized access (wrong role)
- Merchant isolation (wrong merchant via CurrentMerchantSlug)
- XSS injection in text fields
- Permission escalation attempts

Include pre-conditions, test steps, and expected results."
```

### Designing Test Data

```
"Read 01-epic.md Section 11 (Data Dictionary) for [module-name] [epic].
Design test data sets for:
- Valid data (happy path)
- Invalid data (for negative tests — violates validation rules)
- Edge case data (boundary values, empty, max length)
- Permission data (different user roles)

Format as table: Data | Description | Source | For Test Cases"
```

---

## 🔄 Typical Workflow

> **Full step-by-step process** is in `docs/ai/skills/design-test-cases/SKILL.md`. This section summarizes the stages and **key QA Analyst decisions**.

### Stage 1: Analyze Specs → Cognitive Protocol Step 1 (Requirement Coverage Mapping)

**Key QA Analyst decisions:**
- Which user stories need the most test coverage?
- What validation rules exist (BR-xxx)?
- What error responses are defined in API contracts?
- What permissions are required per scenario?

**Done when:** Coverage matrix built: US-xx → FR-xxx → Test Case IDs

### Stage 2: Design Test Cases → Cognitive Protocol Step 2 (Test Design)

**Key QA Analyst decisions:**
- Are test steps specific and actionable?
- Are expected results measurable?
- Is test data defined for each scenario?
- Are pre-conditions clear (login role, data state)?

**Done when:** Every test case has numbered steps, measurable expected results, and specified test data.

### Stage 3: Validate Coverage → Cognitive Protocol Step 3 (Traceability Audit)

**Key QA Analyst decisions:**
- Every US-xx has at least 1 test case?
- All UI states tested (empty, loading, error, success, permission denied)?
- All validation rules have negative tests?
- Security scenarios covered?

**Done when:** All validation checks pass (see SKILL.md Step 5).

---

## 📋 Quality Checklist

Before marking Phase 1 as approved, verify:

```
"Review my test spec at docs/modules/[module-name]/[epic]/05-test-spec.md

Verify:
- [ ] Test Coverage Matrix (Section 2) covers all US-xx
- [ ] Every FR-xxx has at least 1 test case
- [ ] Positive, Negative, and Edge Case types present
- [ ] Test steps are numbered and specific
- [ ] Expected results are measurable
- [ ] Pre-conditions specify role, data, and environment
- [ ] Negative tests cover all BR-xxx validation rules
- [ ] UI states tested: empty, loading, error, success
- [ ] Permission scenarios from Section 6 covered
- [ ] Security tests designed (unauthorized, XSS, merchant isolation)
- [ ] Browser compatibility section has all browsers listed
- [ ] Test data requirements specified per test case

What's missing?"
```

---

## 💡 Pro Tips

### 1. Start from User Stories
```
"Read 01-epic.md Section 2 first.
For each US-xx, extract:
- Acceptance Criteria → Positive test cases
- Business Rules (BR-xxx) → Negative test cases
- Edge Cases → Edge case test cases
This ensures 100% US coverage."
```

### 2. Use API Error Codes for Negative Tests
```
"Read 02-technical-spec.md API contracts.
For each endpoint, design tests that trigger:
- 400 Bad Request → test with invalid payload
- 401 Unauthorized → test without token
- 403 Forbidden → test with wrong role
- 404 Not Found → test with non-existent ID
- 409 Conflict → test with duplicate data"
```

### 3. Test Before Dev Starts
```
"Design test cases NOW, before development begins.
Benefits:
- Developer can read test cases to understand expected behavior
- Test cases are ready the moment code deploys to SIT
- No waiting time between deploy and testing"
```

---

## 🆘 Common Questions

**Q: What's the difference between QA Analyst and QA Automation?**
A: QA Analyst designs **test cases** (Phase 1) from specs before dev starts. QA Automation **executes tests** and writes **automation scripts** (Phase 2) after dev deploys to SIT.

**Q: When should I design test cases?**
A: As soon as BRD + Tech Spec + Frontend Spec are `🟢 Final / Approved`. You can work in parallel with the Developer — you design tests while they code.

**Q: What if a spec is unclear or missing information?**
A: Document it in the test spec as "Questions for BSA / Tech Lead" and flag the specific US-xx or FR-xxx that needs clarification.

**Q: Should I design automation scripts?**
A: No. Focus on test case design only. QA Automation will convert your test cases into Playwright scripts after execution.

**Q: How detailed should test steps be?**
A: Detailed enough that QA Automation can execute without asking questions. "Click button" is too vague; "Click the 'Save' button at the bottom of the form" is specific enough.

---

## 📞 Getting Help

If you're stuck:
1. Read `docs/ai/rules/testing/06-testing-and-quality.md` for testing best practices
2. Check template: `docs/modules/template-module/02-Epic2/05-test-spec.md`
3. Read BRD/Epic to clarify requirements
4. Ask AI to compare your test spec with the template
5. Apply the QA Analyst Cognitive Protocol (3-step analysis)
6. Use the Mandatory Thinking Triggers to identify blind spots
7. Add useful prompts you discover to this guide!
