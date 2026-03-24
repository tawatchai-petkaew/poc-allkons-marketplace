# Business Requirements Document (BRD)
**Module**: [Module Name]
**Date**: [YYYY-MM-DD]
**Status**: ⚪ Draft

## Change Log
| Version | Date | Changes | Updated By | Status |
|---------|------|---------|------------|--------|
| v1.0 | [YYYY-MM-DD] | Initial version | BSA | ⚪ Draft |

> **💡 When updating:** Change Status to 🟢 Final / Approved ONLY AFTER explicit approval.

**PRD Reference:** `docs/modules/[module-name]/prd.md` (provided by PO, Status: 🟢 Final / Approved)

---

## Epic List

| Epic ID | Epic Name | PRD Section | Priority | Description |
|---------|-----------|-------------|----------|-------------|
| EPIC-01 | [Name] | [PRD §X.X] | P0/P1 | [Brief description] |
| EPIC-02 | [Name] | [PRD §X.X] | P0/P1 | [Brief description] |

---

## Epics & User Stories

### EPIC-01: [Epic Name]

| Field | Value |
|-------|-------|
| **Epic ID** | EPIC-01 |
| **Goal** | [Business goal linked to PRD] |
| **Scope** | [In-scope items] |
| **Out of Scope** | [Out-of-scope items] |
| **Success Criteria** | [Measurable criteria] |
| **Maps to** | FR-001, FR-002 |

#### US-01: [User Story Title]
**As a** [user type], **I want to** [action], **so that** [benefit].

**Preconditions:**
- [Precondition 1]

**Business Rules:**
| Rule ID | Rule Description | Priority |
|---------|------------------|----------|
| BR-001 | [Specific rule with exact thresholds] | P0/P1 |

**Validation Rules:**
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| [Field] | [Rule] | [Message] |

**Acceptance Criteria:**
| # | Given | When | Then |
|---|-------|------|------|
| AC-01 | [Precondition] | [Action] | [Expected result] |
| AC-02 | [Precondition] | [Action] | [Expected result] |

**Edge Cases (minimum 3):**
| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| EC-01 | [Edge case] | [Behavior] |
| EC-02 | [Edge case] | [Behavior] |
| EC-03 | [Edge case] | [Behavior] |

**Error Handling:**
| Error | Trigger | User Feedback | Recovery |
|-------|---------|---------------|----------|
| [Type] | [Condition] | [Message] | [Path] |

**State Behavior:**
| State | When | UI Requirements |
|-------|------|-----------------|
| Loading | [Trigger] | [Spec] |
| Empty | [Condition] | [Spec] |
| Success | [Condition] | [Spec] |
| Error | [Condition] | [Spec] |

#### US-02: [User Story Title]
(Same structure as US-01)

### EPIC-02: [Epic Name]
(Same structure as EPIC-01)

---

## Functional Requirements

| FR ID | Description | Epic | User Story | Priority |
|-------|-------------|------|------------|----------|
| FR-001 | [Description] | EPIC-01 | US-01 | P0 |

---

## Non-Functional Requirements
- **Performance:** [Specific thresholds]
- **Security:** [RBAC, auth requirements]
- **Scalability:** [Limits]

---

## Data Models
(TypeScript interfaces following project conventions)

**Data Governance checklist** (per entity):
- [ ] Data classification assigned (public / internal / confidential / restricted)
- [ ] Data ownership documented (owner → steward → custodian → consumer)
- [ ] 6 quality dimensions verified: accuracy, completeness, consistency, timeliness, validity, uniqueness
- [ ] Data lifecycle considered (creation → storage → usage → archival → deletion)

---

## API Contracts
(Endpoints, headers, request/response, error formats)

---

## Business Glossary
| Term | Definition |
|------|------------|
| [Term] | [Definition] |

---

## Traceability Matrix

| PRD Requirement | Epic | User Story | FR | BR | AC |
|-----------------|------|------------|----|----|----|
| [PRD §X.X] | EPIC-01 | US-01 | FR-001 | BR-001 | AC-01 |

---

## Open Questions
| # | Question | Raised By | Status | Answer |
|---|----------|-----------|--------|--------|
| OQ-01 | [Question] | BSA | Open | — |

## Assumptions
| # | Assumption | Impact if Wrong | Status |
|---|------------|-----------------|--------|
| A-01 | [Assumption] | [Impact] | Pending PO confirmation |

## Questions for UX Designer / Developer
- [Question 1]
- [Question 2]
