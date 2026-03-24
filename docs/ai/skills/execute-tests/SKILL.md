---
name: execute-tests
description: Execute test cases on SIT environment, record results, file bugs, and generate automation scripts from approved test cases
---

# Execute Tests

Executes the test cases designed by QA Analyst (Phase 1 of `05-test-spec.md`), records results, files bugs, and generates automation scripts — producing Phase 2 of the Test Specification.

**Role scope:** The QA Automation operates **after** the Developer deploys to SIT. The approved `05-test-spec.md` (Phase 1 — test cases designed by QA Analyst) and `04-develop-spec.md` (🟢 Final) are treated as upstream truth. The QA Automation does **not** design new test cases — that is the QA Analyst's responsibility.

> **Role guide:** See `docs/ai/roles/qa-automation.md` for the QA Automation's full role context, cognitive protocol, and quality checklist. Output template: `docs/modules/template-module/01-Epic1/05-test-spec.md` (Phase 2 sections).

---

## QA Automation Cognitive Protocol

A 3-step systematic framework applied when executing tests and writing automation:

| Step | Name | Purpose | Applied In |
|------|------|---------|------------|
| 1 | Test Execution | Execute each test case on SIT, record pass/fail, capture screenshots | Step 3: Execute Tests |
| 2 | Defect Analysis | Analyze failures, file bug reports with reproduction steps, assess severity | Step 4: File Bugs |
| 3 | Automation | Convert manual test cases to Playwright automation scripts | Step 5: Generate Automation |

### Mandatory Thinking Triggers

**Rule:** QA Automation must always ask internally at every stage:

- Have I executed **every test case** from Phase 1?
- Did I record **actual results** for every test case (pass/fail/blocked)?
- For every failure, did I capture a **screenshot** and file a **bug report**?
- Did I verify the feature on **all browsers** listed in Section 6?
- Did I test with the **exact test data** specified in Section 7?
- Did I update the **Test Execution Summary** (Section 8) with accurate counts?
- Is my **recommendation** (Section 12) based on evidence, not assumptions?

---

## Usage

```bash
/execute-tests [module-name] [epic-name]

# With options:
/execute-tests [module-name] [epic-name] --manual-only
/execute-tests [module-name] [epic-name] --automate-only
/execute-tests [module-name] [epic-name] --retest [bug-ids]
```

## Instructions

When the user invokes `/execute-tests [module-name] [epic-name]`:

**Step 1: Read Test Cases & Implementation**
Read in order:
1. `docs/modules/$1/$2/05-test-spec.md` - Test spec (Phase 1 MUST be filled by QA Analyst)
2. `docs/modules/$1/$2/04-develop-spec.md` - Development spec (MUST be `🟢 Final / Approved` and deployed to SIT)
3. `docs/modules/$1/brd.md` - Business requirements (for context)
4. `docs/modules/$1/$2/01-epic.md` - Epic stories (for context)
5. `.cursorrules` - Technical architecture
6. `docs/ai/rules/testing/06-testing-and-quality.md` - Testing best practices
7. `docs/ai/rules/testing/testing-ids.md` - Test ID naming conventions
8. `docs/shared/test-data/$1/test-data.md` - Test data for the module (test accounts, credentials — if exists)
9. `docs/shared/error-handling.md` - Error display patterns and error code catalog (for verifying error UI)

If Phase 1 sections (1–7) are empty or `04-develop-spec.md` is not Final, tell user:
```
❌ Test cases not designed or implementation not deployed.

Please ensure:
1. QA Analyst has designed test cases (Phase 1 of 05-test-spec.md) using /write-test-case
2. Developer has approved and deployed 04-develop-spec.md to SIT

Only then can QA Automation execute tests.
```

**Step 2: Prepare Execution Environment**
From `04-develop-spec.md`, extract:
- SIT/Staging URL
- Test accounts and credentials
- Test data requirements
- Known issues/limitations (avoid false failures)

**Step 3: Execute Tests** *(Cognitive Protocol Step 1: Test Execution)*

For each test case in Phase 1 (Sections 4–6), execute and fill the results columns:
- **Test Result by QA**: Pass / Fail / Blocked
- **Time Stamp**: Execution date/time
- **Test by QA**: Tester name
- **Actual Result (Screenshot)**: Link to screenshot or description
- **Defect**: Bug ID if failed

Also execute:
- **Section 5: Non-Functional Tests** — run performance, security, accessibility tests
- **Section 6: Browser Compatibility** — test on all listed browsers, update status

**Step 4: File Bugs** *(Cognitive Protocol Step 2: Defect Analysis)*

For each failed test case:
1. Analyze root cause
2. Assess severity (Critical / High / Medium / Low)
3. File bug report with:
   - Steps to reproduce (from test case)
   - Expected vs actual result
   - Screenshot/video
   - Environment details
   - Related test case ID

Fill **Section 10: Bugs Found** table.

**Step 5: Generate Automation Scripts** *(Cognitive Protocol Step 3: Automation)*

For each test case, generate Playwright automation script:

```typescript
import { test, expect } from '@playwright/test';

test.describe('[Module] - [User Story]', () => {
  test('[UAT_TC001] [Test Case Description]', async ({ page }) => {
    // Pre-conditions
    await page.goto('[SIT URL]');
    
    // Test steps (from Phase 1)
    // Step 1
    // Step 2
    
    // Expected results
    await expect(page.locator('[data-testid="..."]')).toBeVisible();
  });
});
```

Fill **Section 11: Automation** table with script paths and status.

**Step 6: Complete Phase 2**

Fill remaining Phase 2 sections:
- **Section 8: Test Execution Summary** — total/passed/failed/blocked counts
- **Section 9: Known Issues** — issues discovered during testing
- **Section 10: Bugs Found** — all bugs filed
- **Section 11: Automation** — automation script status
- **Section 12: Recommendation** — Pass / Conditional Approval / Fail with evidence

**Step 7: Save Updated Test Spec**
Update: `docs/modules/$1/$2/05-test-spec.md` (fill Phase 2 sections, preserve Phase 1)

**Step 8: Provide Next Steps**
Tell the user:
```
✅ Test Execution complete: docs/modules/$1/$2/05-test-spec.md (Phase 2)

Execution Summary:
- Total: [X] | Passed: [X] | Failed: [X] | Blocked: [X]
- Bugs filed: [X] ([Bug IDs])
- Automation scripts: [X] / [X] complete

Recommendation: [Pass / Conditional Approval / Fail]

Next steps for QA Automation:
1. Review the execution results and bug reports.
2. If you approve, reply "I approve" so I can mark Phase 2 as Final.
3. Share the test report with PO and Tech Lead for sign-off.
4. If bugs are fixed, use /execute-tests --retest [bug-ids] to re-verify.
```

## Tips for AI

- **Preserve Phase 1**: Never modify test case design (Sections 1–7) — only fill results columns
- **Follow testing standards**: Read `docs/ai/rules/testing/06-testing-and-quality.md`
- **Use correct test IDs**: Follow `docs/ai/rules/testing/testing-ids.md` for data-testid in automation
- **Be specific in bugs**: Exact reproduction steps, not vague descriptions
- **Screenshot everything**: Every failure needs visual evidence
- **Check known issues**: Read `04-develop-spec.md` Known Issues to avoid false failures
- **Automate wisely**: Prioritize P0/P1 test cases for automation first
- **Regression awareness**: Note if existing features are affected

## Options

- `--manual-only`: Execute manual tests only, skip automation generation
- `--automate-only`: Generate automation scripts only, skip manual execution
- `--retest [bug-ids]`: Re-execute test cases related to specific bug fixes

## Reference

Read `docs/ai/roles/qa-automation.md` for the QA Automation's full role context, cognitive protocol, and quality checklist.
