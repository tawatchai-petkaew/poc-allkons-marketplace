# QA Automation Guide - Using AI Assistant

**Role scope:** The QA Automation operates **after** the Developer deploys to SIT. The approved `05-test-spec.md` (Phase 1 — test cases designed by QA Analyst) and `04-develop-spec.md` (🟢 Final) are treated as upstream truth. The QA Automation does **not** design new test cases — that is the QA Analyst's responsibility (see `docs/ai/roles/qa-analyst.md`).

> **Executable skill:** For the step-by-step test execution and automation process, run `/execute-tests [module-name] [epic-name]` — see `docs/ai/skills/execute-tests/SKILL.md`.

---

## 🎯 How AI Can Help You

As QA Automation, AI can assist with:

- ✅ Executing test cases and recording results (`/execute-tests`)
- ✅ Filing detailed bug reports with reproduction steps
- ✅ Generating Playwright automation scripts from test cases
- ✅ Analyzing test failures and assessing severity
- ✅ Creating regression test suites
- ✅ Generating test execution summaries and recommendations

---

## 🧠 QA Automation Cognitive Protocol

### Purpose

The QA Automation bridges test design and quality verification — executing the test cases designed by QA Analyst, recording results, filing bugs, and converting manual tests into automation scripts.

### Core Competencies

| Competency          | Key Skills                                                    |
| ------------------- | ------------------------------------------------------------- |
| **Test Execution**  | Manual test execution, result recording, screenshot capture   |
| **Defect Analysis** | Root cause analysis, severity assessment, bug report writing  |
| **Automation**      | Playwright scripting, test data management, CI/CD integration |
| **Reporting**       | Execution summaries, recommendations, sign-off requests       |

### Cognitive Protocol

A 3-step systematic framework applied when executing tests and writing automation:

| Step | Name            | Purpose                                                              | Applied In                  |
| ---- | --------------- | -------------------------------------------------------------------- | --------------------------- |
| 1    | Test Execution  | Execute each test case on SIT, record pass/fail, capture screenshots | Step 3: Execute Tests       |
| 2    | Defect Analysis | Analyze failures, file bug reports, assess severity                  | Step 4: File Bugs           |
| 3    | Automation      | Convert manual test cases to Playwright automation scripts           | Step 5: Generate Automation |

### Mandatory Thinking Triggers

**Rule:** QA Automation must always ask internally at every stage:

- Have I executed **every test case** from Phase 1?
- Did I record **actual results** for every test case (pass/fail/blocked)?
- For every failure, did I capture a **screenshot** and file a **bug report**?
- Did I verify the module on **all browsers** listed in Section 6?
- Did I test with the **exact test data** specified in Section 7?
- Did I update the **Test Execution Summary** (Section 8) with accurate counts?
- Is my **recommendation** (Section 12) based on evidence, not assumptions?

---

## 📚 Documents You Should Reference

When working with AI, tell it to read:

- `docs/modules/[module-name]/[epic]/05-test-spec.md` - Test spec (Phase 1 MUST be filled)
- `docs/modules/[module-name]/[epic]/04-develop-spec.md` - Development spec (MUST be `🟢 Final`)
- `docs/modules/[module-name]/brd.md` - BRD (for context)
- `docs/modules/[module-name]/[epic]/01-epic.md` - Epic (for context)
- `docs/ai/rules/developer/01-project-structure.md` - Technical architecture
- `docs/ai/rules/testing/06-testing-and-quality.md` - Testing best practices
- `docs/ai/rules/testing/testing-ids.md` - Test ID naming conventions (data-testid)
- `docs/shared/test-data/[module]/test-data.md` - Test data per module (test accounts, credentials, valid/invalid inputs)
- `docs/shared/error-handling.md` - Error display patterns and error code catalog (for verifying error UI)

---

## 📝 Output Template (What You Produce)

Your output artifact is **Phase 2 of the Test Specification** (Sections 8–12). You update the existing file:

- Template: `docs/modules/template-module/01-Epic1/05-test-spec.md` (Phase 2 sections)

Update in-place:

- `docs/modules/[module-name]/[epic]/05-test-spec.md`

You also fill the **results columns** of Phase 1 test case tables (Test Result by QA, Time Stamp, Actual Result, Defect).

> **Note:** Phase 1 (Sections 1–7: test case design) is produced by **QA Analyst** — see `docs/ai/roles/qa-analyst.md`. Do **not** modify test case design — only fill results columns.

---

## 💬 Common AI Prompts

### Executing Test Cases

```
"I'm executing tests for [module-name] [epic-name].
Read these documents:
1. docs/modules/[module-name]/[epic]/05-test-spec.md (test cases from Phase 1)
2. docs/modules/[module-name]/[epic]/04-develop-spec.md (deployment info)

Execute each test case:
- Record Pass/Fail/Blocked
- Capture actual results
- Note any deviations from expected results
- File bugs for failures

Update the test spec with Phase 2 results."
```

### Filing Bug Reports

```
"Test case [UAT_TC0xx] failed.

Expected: [expected result from test case]
Actual: [what actually happened]

Help me write a detailed bug report with:
- Severity assessment
- Steps to reproduce (from test case)
- Expected vs actual result
- Environment details
- Screenshot reference
- Related test case ID and US-xx"
```

### Generating Playwright Automation

```
"Read my test spec at docs/modules/[module-name]/[epic]/05-test-spec.md

Generate Playwright automation scripts for:
- All P0 (Critical) test cases first
- Then P1 (High) test cases

Follow:
- docs/ai/rules/testing/testing-ids.md for data-testid selectors
- docs/ai/rules/testing/06-testing-and-quality.md for best practices

Save scripts to tests/[module-name]/[epic]/"
```

### Retesting After Bug Fix

```
"Bugs [BUG-001, BUG-002] have been fixed and redeployed.

Read:
1. docs/modules/[module-name]/[epic]/05-test-spec.md
2. The related test cases for these bugs

Re-execute only the affected test cases.
Update results and bug status."
```

### Creating Test Execution Summary

```
"Generate executive summary for [module-name] [epic-name] testing:

Results:
- Total: [X] | Passed: [X] | Failed: [X] | Blocked: [X]
- Bugs: [list bug IDs and severities]

Include:
- Risk assessment
- Recommendation (Pass / Conditional / Fail)
- Outstanding issues
- Sign-off request for PO and Tech Lead"
```

---

## 🔄 Typical Workflow

> **Full step-by-step process** is in `docs/ai/skills/execute-tests/SKILL.md`. This section summarizes the stages and **key QA Automation decisions**.

### Stage 1: Execute Tests → Cognitive Protocol Step 1 (Test Execution)

**Key QA Automation decisions:**

- Is the SIT environment stable and accessible?
- Am I using the correct test data from Section 7?
- Am I testing on all browsers from Section 6?
- Are there known issues from `04-develop-spec.md` to avoid false failures?

**Done when:** Every test case has a result (Pass/Fail/Blocked) with timestamp.

### Stage 2: Analyze & Report Defects → Cognitive Protocol Step 2 (Defect Analysis)

**Key QA Automation decisions:**

- Is this a real bug or a known limitation?
- What severity should I assign?
- Can I reproduce consistently?
- Which developer should be assigned?

**Done when:** Every failure has a bug report with reproduction steps and severity.

### Stage 3: Automate → Cognitive Protocol Step 3 (Automation)

**Key QA Automation decisions:**

- Which test cases should be automated first (P0, P1)?
- Are data-testid attributes available in the UI?
- Should I use page objects or inline selectors?
- How to handle test data setup/teardown?

**Done when:** Automation scripts created, Section 11 updated with script paths.

---

## 📋 Quality Checklist

Before marking Phase 2 as approved, verify:

```
"Review my test execution at docs/modules/[module-name]/[epic]/05-test-spec.md

Verify:
- [ ] Every test case has a result (Pass/Fail/Blocked)
- [ ] Every failure has a bug report in Section 10
- [ ] Bug reports have reproduction steps and severity
- [ ] Test Execution Summary (Section 8) has accurate counts
- [ ] Browser compatibility (Section 6) tested on all browsers
- [ ] Non-functional tests (Section 5) executed
- [ ] Known Issues (Section 9) documented
- [ ] Automation scripts generated for P0/P1 test cases
- [ ] Recommendation (Section 12) is evidence-based

What's missing?"
```

---

## 💡 Pro Tips

### 1. Check Known Issues First

```
"Read 04-develop-spec.md Known Issues section.
Before marking a test as 'Failed', check if the behavior
is a documented known limitation vs an actual bug."
```

### 2. Prioritize Automation

```
"Automate in this order:
1. P0 (Critical) — core user workflows
2. P1 (High) — important business rules
3. Regression — tests that should run on every deploy
Skip P2/P3 unless time allows."
```

### 3. Screenshot Every Failure

```
"For every failed test case:
1. Take screenshot of the actual result
2. Save to docs/modules/[module-name]/[epic]/screenshots/
3. Reference in the Actual Result column
This helps developers reproduce without asking questions."
```

---

## 🆘 Common Questions

**Q: What's the difference between QA Analyst and QA Automation?**
A: QA Analyst designs **test cases** (Phase 1) from specs before dev starts. QA Automation **executes tests** and writes **automation scripts** (Phase 2) after dev deploys to SIT.

**Q: What if Phase 1 test cases are missing or incomplete?**
A: Do NOT design new test cases. Ask QA Analyst to update Phase 1 first using `/design-test-cases`. QA Automation only executes what QA Analyst designed.

**Q: What if the dev spec is still Draft?**
A: Wait. QA Automation can only start after `04-develop-spec.md` is `🟢 Final / Approved` and deployed to SIT.

**Q: Should I modify test case descriptions?**
A: No. Only fill the results columns (Test Result by QA, Time Stamp, Actual Result, Defect). If test cases need changes, flag to QA Analyst.

**Q: What automation framework should I use?**
A: Playwright. Follow `docs/ai/rules/testing/testing-ids.md` for data-testid selectors.

---

## 📞 Getting Help

If you're stuck:

1. Read `docs/ai/rules/testing/06-testing-and-quality.md` for testing best practices
2. Check `04-develop-spec.md` for deployment info and known issues
3. Read `docs/ai/rules/testing/testing-ids.md` for test ID conventions
4. Ask AI to help write bug reports
5. Apply the QA Automation Cognitive Protocol (3-step analysis)
6. Use the Mandatory Thinking Triggers to identify blind spots
7. Add useful prompts you discover to this guide!
