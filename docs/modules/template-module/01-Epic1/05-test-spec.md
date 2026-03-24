# Test Specification
**Author/Owner**: QA
**Epic**: [Epic Number] — [Epic Name]
**Module**: [Module Name]
**Date**: [YYYY-MM-DD]
**Status**: ⚪ Draft

## Change Log
| Version | Date | Changes | Updated By | Role | Status |
|---------|------|---------|------------|------|--------|
| v1.0 | [YYYY-MM-DD] | Initial test cases designed | QA Analyst | QA Analyst | ⚪ Draft |

> **💡 Two-phase document:**
> - **Phase 1 (QA Analyst)**: Design test cases from BRD + Tech Spec + Frontend Spec — **before** dev starts. Fill Sections 1–7.
> - **Phase 2 (QA Automation)**: Execute tests + write automation — **after** dev deploys to SIT. Fill Sections 8–12.

---

## References
- **BRD**: `docs/modules/[module-name]/brd.md`
- **Epic**: `docs/modules/[module-name]/[epic]/01-epic.md`
- **Tech Spec**: `docs/modules/[module-name]/[epic]/02-technical-spec.md`
- **Frontend Spec**: `docs/modules/[module-name]/[epic]/03-frontend-spec.md`
- **Develop Spec**: `docs/modules/[module-name]/[epic]/04-develop-spec.md`

---

# Phase 1: Test Case Design (QA Analyst — before dev)

> Filled by `/design-test-cases [module] [epic]`. Input: BRD, Epic, Tech Spec, Frontend Spec.

---

## 1. Test Plan Summary
- **Module**: [Module Name]
- **Designed By**: [QA Analyst Name]
- **Design Date**: [YYYY-MM-DD]
- **Total Test Cases**: [Count]
  - Functional: [Count]
  - Non-Functional: [Count]
  - Edge Cases: [Count]

---

## 2. Test Coverage Matrix

| User Story | FR | API Endpoint | Test Case IDs | Coverage |
|------------|-----|-------------|---------------|----------|
| US-01 | FR-001 | `GET /api/[service]/v1/[resource]` | UAT_TC001, UAT_TC002, UAT_TC003 | ✅ |
| US-02 | FR-002 | `POST /api/[service]/v1/[resource]` | UAT_TC004, UAT_TC005 | ✅ |

---

## 3. Test Cases Format

Use this format for all test cases:

| Test case ID | Module | Role | Test Case Description | Test case type | Test Device | Data Test | Pre-Condition | Test Step | Expected Result | Test Result by QA | Time Stamp | Test by QA | Test Result by User | Time Stamp | Actual Result (Screenshot) | Defect |
|--------------|--------|------|----------------------|----------------|-------------|-----------|---------------|-----------|------------------|-------------------|------------|------------|---------------------|------------|---------------------------|--------|
| UAT_TC001 | [Module] | [Role] | [Description] | Positive | Desktop | - | [Pre-condition] | 1. [Step 1]<br>2. [Step 2] | 1. [Expected 1]<br>2. [Expected 2] | | | | | | | |

### Test Case Type Options
- `Positive` - Happy path testing
- `Negative` - Error/validation testing
- `Edge Case` - Boundary conditions

### Test Device Options
- `Desktop` - Desktop browsers (Chrome, Safari, Firefox)
- `Mobile` - Mobile browsers (iOS Safari, Android Chrome)
- `Tablet` - Tablet browsers (iPad Safari, Android Tablet)

---

## 4. Functional Test Cases

### US-01: [User Story Name]

| Test case ID | Module | Role | Test Case Description | Test case type | Test Device | Data Test | Pre-Condition | Test Step | Expected Result | Test Result by QA | Time Stamp | Test by QA | Test Result by User | Time Stamp | Actual Result (Screenshot) | Defect |
|--------------|--------|------|----------------------|----------------|-------------|-----------|---------------|-----------|------------------|-------------------|------------|------------|---------------------|------------|---------------------------|--------|
| | | | | | | | | | | | | | | | | |

### US-02: [User Story Name]

| Test case ID | Module | Role | Test Case Description | Test case type | Test Device | Data Test | Pre-Condition | Test Step | Expected Result | Test Result by QA | Time Stamp | Test by QA | Test Result by User | Time Stamp | Actual Result (Screenshot) | Defect |
|--------------|--------|------|----------------------|----------------|-------------|-----------|---------------|-----------|------------------|-------------------|------------|------------|---------------------|------------|---------------------------|--------|
| | | | | | | | | | | | | | | | | |

---

## 5. Non-Functional Tests

| Test Case ID | Test Case | Test Type | Expected | Test Device | Pre-Condition | Test Step | Expected Result | Status |
|--------------|-----------|-----------|----------|-------------|---------------|-----------|-----------------|--------|
| | | Performance | | Desktop | | | | ⬜ Pending |
| | | Security | | Desktop | | | | ⬜ Pending |
| | | Accessibility | | Desktop | | | | ⬜ Pending |

---

## 6. Browser Compatibility

| Browser | Status | Issues |
|---------|--------|--------|
| Chrome (latest) | ⬜ Pending | |
| Safari (latest) | ⬜ Pending | |
| Firefox (latest) | ⬜ Pending | |
| Mobile Safari | ⬜ Pending | |
| Mobile Chrome | ⬜ Pending | |

---

## 7. Test Data Requirements

| Data | Description | Source | For Test Cases |
|------|-------------|--------|----------------|
| [Data 1] | [Description] | [Source] | UAT_TC001, UAT_TC002 |

---

# Phase 2: Test Execution & Automation (QA Automation — after dev deploys)

> Filled by `/execute-tests [module] [epic]`. Input: This test spec (Phase 1) + `04-develop-spec.md` + SIT environment.

---

## 8. Test Execution Summary

| Metric | Count |
|--------|-------|
| Total Test Cases | |
| Passed | |
| Failed | |
| Blocked | |
| Not Executed | |

- **Environment**: [SIT/Staging URL]
- **Executed By**: [QA Automation Name]
- **Execution Date**: [YYYY-MM-DD]
- **Build/Deploy Version**: [Version]

---

## 9. Known Issues
- [ ] None identified yet

---

## 10. Bugs Found

| Bug ID | Severity | Test Case ID | Description | Status | Assigned To |
|--------|----------|-------------|-------------|--------|-------------|
| | | | | | |

---

## 11. Automation

| Test Case ID | Automation Status | Script Path | Framework |
|--------------|-------------------|-------------|-----------|
| | ⬜ Not Started | | Playwright |

---

## 12. Recommendation
[Pending testing]

---

## Sign-off Required From
- [ ] QA Analyst (Phase 1 — test cases designed)
- [ ] QA Automation (Phase 2 — tests executed)
- [ ] Product Owner
- [ ] Tech Lead
