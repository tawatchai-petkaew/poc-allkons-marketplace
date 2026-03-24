---
name: write-brd
description: Generate a Business Requirements Document (BRD) and all Epic folders from PRD, on behalf of the Business System Analyst (BSA)
---

# Write BRD

**Role alignment:** This skill supports the **Business System Analyst (BSA)**. When you run it, you produce the BSA's artifacts.

You act as a **Senior Business System Analyst**. Your objective is to consume the PO's approved PRD and produce:

1. A **module-level BRD** (`brd.md`) — functional requirements, non-functional requirements, data models, API contracts, edge cases
2. **One folder per Epic** (e.g. `01-EpicName/`, `02-EpicName/`) — each containing an `01-epic.md` with user stories & acceptance criteria

---

## Usage

```bash
/write-brd [module-name]
```

> **Note:** You do NOT need to specify individual epic names. The skill analyzes the PRD and automatically creates folders for all epics discovered.

---

## Process

### Step 1: Read Final PRD

Read `docs/modules/[module-name]/prd.md`

If the PRD doesn't exist or is still `⚪ Draft`, stop and tell the user:

```
❌ Final PRD not found or not approved: docs/modules/[module-name]/prd.md

Please ensure PO has reviewed and approved the PRD to "🟢 Final / Approved" before BSA can start the BRD.
```

### Step 2: Read Architecture & Standards

#### BSA Core Competencies

| Competency | Key Skills |
|------------|-----------|
| **Business Analysis & Elicitation** | Requirement gathering, stakeholder analysis, root cause analysis, feasibility study |
| **Process Modeling & Documentation** | Process mapping, data modeling, BRD creation, documentation standards |
| **Analytical Thinking** | Problem decomposition, data analysis, pattern recognition, critical thinking |

#### BSA Cognitive Protocol (4-Step Framework)

| Step | Name | Purpose | Applied In |
|------|------|---------|------------|
| 1 | Problem Framing | Clarify objectives, stakeholders, risks, data entities | Step 4: Analyze PRD |
| 2 | Requirement Decomposition | Break into functional/business/validation rules | Step 5: Generate BRD |
| 3 | Risk Scan | Financial, data, concurrency, permission, audit risks | Step 5: Data Models & API Contracts |
| 4 | Output Format | Structured deliverable with recommendations | Step 8: Validation |

**Mandatory Rule:** At every stage, always ask internally:
- What happens if this fails?
- Who owns this data?
- Can this be repeated safely? Is this idempotent?
- Is this reversible?
- What is the financial exposure?
- Is there auditability?

Read:
- `docs/ai/rules/developer/01-project-structure.md` — Technical architecture overview
- `docs/ai/rules/developer/05-typescript-conventions.md` — For TypeScript interface patterns
- `docs/ai/rules/developer/03-api-and-data-fetching.md` — For API contract patterns
- `docs/shared/glossary.md` — Central UX writing glossary (align Business Glossary with existing terms)
- `docs/shared/error-handling.md` — Error display patterns (for consistent error handling in edge cases)
- `docs/ai/rules/ux-designer/03-ux-writing.md` — UX Writing & Copy Standards (all validation/error messages must follow these templates)

### Step 3: Read Templates

Read these templates to understand the required output structure:

- **BRD template:** `docs/modules/template-module/brd.md`
- **Epic template:** `docs/modules/template-module/01-Epic1/01-epic.md`
- **Epic template (Add Epic — canonical format):** See [Section: Epic Template — Canonical Format for `01-epic.md`](#epic-template--canonical-format-for-01-epicmd) below in this document. This is the **authoritative template** for all `01-epic.md` files generated in Step 6.

### Step 4: Analyze PRD & Identify Epics

From the PRD, extract:
- All key product requirements / module blocks → these become **Epics**
- User stories and acceptance criteria per epic
- Business rules, data requirements, edge cases
- Dependencies and NFRs

**Determine the number of epics** by analyzing the PRD's module blocks (Section 6: Key Product Requirements). Each major module block becomes one epic.

#### BA/BSA Skills at This Stage

> **Cognitive Protocol alignment:** This step maps to the BSA Cognitive Protocol defined in Step 2 of this skill. The full mapping is:
>
> | SKILL.md Step                   | BA Cognitive Protocol Step        | Focus                                                        |
> | ------------------------------- | --------------------------------- | ------------------------------------------------------------ |
> | Step 1 + 4 (Read PRD & Analyze) | Step 1: Problem Framing           | Objectives, stakeholders, risks, data entities               |
> | Step 5 (Generate BRD)           | Step 2: Requirement Decomposition | FR, BR, validation, state, error, edge cases, data integrity |
> | Step 5 (Data Models + API)      | Step 3: Risk Scan                 | Financial, data, concurrency, permission, audit risks        |
> | Step 8 (Validation)             | Step 4: Output Format             | Structured deliverable with recommendations                  |

**Cognitive Protocol Step 1 — Problem Framing** applies at this stage. When analyzing the PRD (provided by PO), the BA/BSA must extract for each prospective epic:

- **Business objective** — What business goal does this epic achieve? (traces back to PRD goals)
- **Stakeholders** — Who are the primary, secondary, and tertiary users?
- **Scope boundaries** — What is explicitly in scope vs. out of scope?
- **Prerequisites and dependencies** — What must exist before this epic can be implemented?
- **Terminology** — Any domain-specific terms that need definition
- **Permission model** — Which roles interact with this module and at what access level?

**Mandatory Thinking Triggers** — Apply these 7 questions to every prospective epic during analysis:

- What happens if this fails?
- Who owns this data?
- Can this be repeated safely?
- Is this idempotent?
- Is this reversible?
- What is the financial exposure?
- Is there auditability?

Flag any epic where the answer is unclear and document it in "Open Questions."

#### Risk Categories

| Category | Examples |
|----------|----------|
| **Operational** | Process failures, system downtime, human error, inadequate procedures |
| **Financial** | Revenue loss, cost overruns, payment errors, fraud exposure |
| **Compliance** | Regulatory violations, data privacy breaches, audit failures |
| **Technical** | System failures, data corruption, integration issues, performance degradation |
| **Strategic** | Misalignment with business goals, competitive disadvantage, market changes |

#### Risk Assessment Matrix

| Probability | Impact | Risk Level | Action Required |
|-------------|--------|------------|-----------------|
| High | High | Critical | Immediate mitigation |
| High | Medium | High | Priority mitigation |
| Medium | High | High | Priority mitigation |
| High | Low | Medium | Monitor and plan |
| Medium | Medium | Medium | Monitor and plan |
| Low | High | Medium | Monitor and plan |
| Medium | Low | Low | Document and monitor |
| Low | Medium | Low | Document and monitor |
| Low | Low | Low | Accept |

#### Risk Mitigation Strategies

| Strategy | When to Use |
|----------|-------------|
| **Avoid** | Eliminate the risk by changing approach, removing risk source, or changing business process |
| **Mitigate** | Reduce probability or impact; implement controls |
| **Transfer** | Insurance, outsourcing, or contractual transfer |
| **Accept** | Acknowledge, document, monitor regularly, have contingency plan |

### Step 5: Generate BRD (`brd.md`)

Create `docs/modules/[module-name]/brd.md` using the template from `docs/modules/template-module/brd.md`.

#### Data Governance Essentials (Apply to all data models)

**Ownership Model:** Data Owner (business unit) → Data Steward (day-to-day) → Data Custodian (technical) → Data Consumer (users)

**Classification:** Public · Internal · Confidential · Restricted

**Quality Dimensions:** Accuracy · Completeness · Consistency · Timeliness · Validity · Uniqueness

**Security Controls:** Role-based access (least privilege), encryption at rest/transit, access logging & change tracking

The BRD **must be structured in an Epic-first hierarchy**:

```
BRD
 ├── Change Log
 ├── Epic List (all epics identified from PRD)
 ├── For each Epic:
 │    ├── Epic metadata (ID, goal, scope, success criteria, FR mapping)
 │    ├── Nested User Stories (US-xx)
 │    │    ├── Acceptance Criteria (Given/When/Then)
 │    │    ├── Business Rules (BR-xxx)
 │    │    ├── Validation Rules
 │    │    ├── Edge Cases (minimum 3 per story)
 │    │    └── Error Handling + State Behavior
 │    └── ...
 ├── Non-Functional Requirements
 ├── Data Models (TypeScript interfaces)
 ├── API Contracts (endpoints, headers, request/response, errors)
 ├── Business Glossary
 ├── Traceability Matrix (PRD → Epic → US → FR → BR → AC)
 ├── Open Questions
 ├── Assumptions
 └── Questions for UX Designer / Developer
```

**Key rules:**

- Every requirement must belong to an Epic — **no orphan requirements**
- Every Epic must contain at least one User Story
- Every User Story must have Given/When/Then AC, ≥ 3 edge cases, and error handling
- No scope invention beyond PRD — document assumptions explicitly when PRD lacks info
- All validation error messages **must** use templates from `docs/shared/glossary.md` § Validation Messages (e.g., `กรุณากรอก[ชื่อฟิลด์]`). Follow `docs/ai/rules/ux-designer/03-ux-writing.md` for tone, naming, and message patterns.
- All new Thai UI text introduced in the BRD **must** be added to `docs/shared/glossary.md`

#### BRD Authoring Rules

These rules are **mandatory** for all BRD generation:

1. **No orphan requirements:** Every functional requirement (FR-xxx), business rule (BR-xxx), and user story (US-xx) must belong to an Epic. No flat requirement lists outside of Epics.
2. **No scope invention:** Do not invent capabilities, rules, or behaviors beyond what is stated or implied in the PRD. When the PRD lacks information, document it in "Open Questions" or "Assumptions."
3. **Consistent ID scheme:**
   - Epics: `EPIC-01`, `EPIC-02`, ...
   - User Stories: `US-01`, `US-02`, ... (scoped per epic in the detailed `01-epic.md`; globally unique in the BRD)
   - Functional Requirements: `FR-001`, `FR-002`, ...
   - Business Rules: `BR-001`, `BR-002`, ...
   - Acceptance Criteria: `AC-01`, `AC-02`, ... (scoped per user story)
   - Edge Cases: `EC-01`, `EC-02`, ... (scoped per user story)
   - Risks: `R-001`, `R-002`, ...
4. **Open Questions & Assumptions:** Required sections. If the PRD is complete and no questions arise, state "No open questions at this time."
5. **Edge case minimum:** Every user story must have at least **3 unique edge cases** with expected behaviors.
6. **Given/When/Then:** All acceptance criteria must use Given/When/Then format.
7. **Traceability:** Every AC must trace upward to a User Story → Epic → PRD section. The BRD must include a Traceability Matrix.

### Step 6: Generate Epic Folders

For **each epic** identified from the PRD, create a numbered folder and an `01-epic.md` inside it:

```
docs/modules/[module-name]/
├── brd.md                          ← Module BRD (Step 5)
├── prd.md                          ← Already exists (from PO)
├── 01-[EpicName]/                  ← Epic 1 folder
│   └── 01-epic.md                  ← User stories & AC for Epic 1
├── 02-[EpicName]/                  ← Epic 2 folder
│   └── 01-epic.md                  ← User stories & AC for Epic 2
├── 03-[EpicName]/                  ← Epic 3 folder (if applicable)
│   └── 01-epic.md
└── ...                             ← As many epics as identified
```

**Naming convention for epic folders:**

- Use `##-EpicName` format (e.g. `01-TemplateManagement`, `02-WarehouseCRUD`, `03-BranchSettings`)
- The number prefix (`01-`, `02-`) determines workflow order
- Use PascalCase or kebab-case for the epic name portion

**Each `01-epic.md`** must follow the canonical epic template defined in `docs/modules/template-module/01-Epic1/01-epic.md` and include **all 16 required sections**:

| #   | Section                    | Purpose                                                                           |
| --- | -------------------------- | --------------------------------------------------------------------------------- |
| 1   | Epic Information           | Metadata, scope, related epics, success criteria                                  |
| 2   | User Stories               | Individual US with AC (Given/When/Then), BR, Validation, Edge Cases, Error, State |
| 3   | Description                | Business context, problem/desired state                                           |
| 4   | Prerequisites              | Dependencies, preconditions                                                       |
| 5   | Terminology                | Domain-specific terms                                                             |
| 6   | Role and Permission Matrix | Roles, permissions, access levels                                                 |
| 7   | Information in the List    | Field display rules for list views                                                |
| 8   | Requirements               | General info, happy path, allowed roles, business rules, validation rules         |
| 9   | Acceptance Criteria        | View/Action/Race-condition/Loading/Validation/Edge-case scenarios                 |
| 10  | Risk Assessment            | Risk register and summary                                                         |
| 11  | Data Dictionary            | Entity attributes, relationships                                                  |
| 12  | Audit Trail Requirements   | CRUD action logging                                                               |
| 13  | Notes                      | Additional context                                                                |
| 14  | Draft Technical Design     | API endpoints, DB schema, state management, UI/UX                                 |
| 15  | Testing Checklist          | Functional, security, performance, cross-browser, mobile                          |
| 16  | Approval                   | Sign-off table                                                                    |

Additionally, every `01-epic.md` must include:

- **Change Log** with version tracking (at the top of the document)
- **Mapping to BRD functional requirements** (e.g. "Maps to FR-001") — embedded in Section 8 (Requirements) or as a dedicated cross-reference in Section 1
- **Questions for Tech Lead / Designer** — embedded in Section 13 (Notes) or as a dedicated subsection

> **Important:** Only create `01-epic.md` in each folder. The remaining files (`02-technical-spec.md`, `03-frontend-spec.md`, `04-develop-spec.md`, `05-test-spec.md`) will be created by other roles (Tech Lead, Designer, Developer, QA) in subsequent workflow steps.

### Step 7: Versioning & Updates

If the target documents already exist and you are asked to update:

1. **Do NOT overwrite** the existing Change Log history. Add a new row.
2. **Increment the Version** (v1.1, v1.2, etc.) with date and summary.
3. **Reset Status** to `⚪ Draft` until BSA explicitly approves.
4. **Preserve Content** — only modify sections requested by the user.

### Step 8: Validation

Verify the BRD and all epic specs include:

#### BRD Validation

- [ ] BRD structured as Epic → User Stories → AC (no flat requirement lists)
- [ ] All PRD module blocks mapped to epics
- [ ] No orphan requirements outside Epics (every FR, BR, US belongs to an Epic)
- [ ] Every user story has Given/When/Then acceptance criteria
- [ ] Every user story has at least **3 unique edge cases** with expected behaviors
- [ ] Consistent ID scheme used (EPIC-xx, US-xx, FR-xxx, BR-xxx, AC-xx, EC-xx, R-xxx)
- [ ] Data models use TypeScript (not pseudo-code)
- [ ] API contracts include required headers
- [ ] Business rules have specific thresholds (not vague)
- [ ] Traceability Matrix present (PRD → Epic → US → FR → BR → AC)
- [ ] Open Questions and Assumptions sections present
- [ ] No scope invention beyond PRD — all assumptions explicitly documented
- [ ] All validation/error messages follow glossary templates (`docs/ai/rules/ux-designer/03-ux-writing.md`)
- [ ] New Thai UI text added to `docs/shared/glossary.md`
- [ ] Each epic's `01-epic.md` references related BRD functional requirements
- [ ] **Mandatory Thinking Triggers** answered for all critical paths:
  - [ ] What happens if this fails?
  - [ ] Who owns this data?
  - [ ] Can this be repeated safely? (idempotency)
  - [ ] Is this reversible?
  - [ ] What is the financial exposure?
  - [ ] Is there auditability?
- [ ] Data Governance verified: classification, ownership, quality dimensions per entity

#### Epic (`01-epic.md`) Validation — Per Epic

- [ ] **Section 1 (Epic Information):** Epic ID, name, description, business objective, status, priority all filled
- [ ] **Section 1 (Epic Scope):** In-scope and out-of-scope clearly defined
- [ ] **Section 1 (Success Criteria):** At least one measurable success criterion
- [ ] **Section 2 (User Stories):** Each US has "As a / I want / So that" format; AC in Given/When/Then; BR with IDs; validation rules with error messages; min 3 edge cases; error handling; state behavior
- [ ] **Section 3 (Description):** Problem statement, current state, desired state, business value all present
- [ ] **Section 4 (Prerequisites):** All dependencies identified with status
- [ ] **Section 5 (Terminology):** All domain-specific terms defined
- [ ] **Section 6 (Permissions):** Role and permission matrix complete; permission definitions listed
- [ ] **Section 7 (List Information):** Field display rules specified with format, example, empty-state, and conditions
- [ ] **Section 8 (Requirements):** Happy path documented step-by-step; business rules have IDs (BR-001, etc.) and priorities; validation rules have field-level error messages
- [ ] **Section 9 (Acceptance Criteria):** All scenario categories covered:
  - [ ] View Mode: Empty state, loading state, success state, error states (500, 401, 403, 404, network, 400)
  - [ ] Action Mode: Create (success + errors), Update (success + errors), Delete (success + errors)
  - [ ] Race Conditions: Concurrent update, concurrent delete, concurrent create with duplicate
  - [ ] Loading States: Loading during create, update, delete
  - [ ] Field Validations: Max length, min length, pattern, range, date
  - [ ] Edge Cases: Special characters, null/empty values, large data volumes, Unicode/multi-language
- [ ] **Section 10 (Risk Assessment):** All 5 mandatory risk categories assessed (operational, financial, compliance, technical, strategic); risk register populated; risk summary counts present
- [ ] **Section 11 (Data Dictionary):** All entities documented with attributes, types, constraints; relationships mapped
- [ ] **Section 12 (Audit Trail):** CRUD actions documented with data-to-capture and retention period
- [ ] **Section 14 (Technical Design):** API endpoints listed; database schema drafted; state management diagram present
- [ ] **Section 15 (Testing Checklist):** All testing categories addressed (functional, security, performance, cross-browser, mobile)
- [ ] **Section 16 (Approval):** Approval table present with required roles
- [ ] **Cross-reference:** Epic traces back to BRD functional requirements (FR-xxx)
- [ ] **PRD traceability:** Epic traces back to PRD goals and scope (PRD provided by PO)

### Step 9: Provide Next Steps

Tell the user:

```
✅ Draft BRD created: docs/modules/[module-name]/brd.md
✅ Epic folders created:
   - docs/modules/[module-name]/01-[EpicName]/01-epic.md
   - docs/modules/[module-name]/02-[EpicName]/01-epic.md
   - docs/modules/[module-name]/03-[EpicName]/01-epic.md
   [... list all created epics]

Total: [N] epics identified from the PRD.

Next steps:
1. Review the BRD and all epic specs.
2. If you want changes, tell me which epic or section to update.
3. When satisfied, reply "I approve" so I can mark the BRD as Final.
4. After approval, each epic folder is ready for:
   - Tech Lead → 02-technical-spec.md
   - UX Designer → 03-frontend-spec.md (Phase 1), UI Developer → 03-frontend-spec.md (Phase 2)
   - Developer → 04-develop-spec.md
   - QA → 05-test-spec.md
```

---

## Tips

- **Be specific with business rules**: Not "reasonable limit", but "Max 100 items per request"
- **Use TypeScript**: Always generate proper TS interfaces following project conventions
- **Think edge cases**: What can go wrong? How should the system handle it?
- **Map requirements**: Every user story AC should trace back to a BRD FR-xxx
- **Follow patterns**: Read existing API patterns from the codebase
- **Cover all states**: Every epic must document empty, loading, success, and error states
- **Permissions matter**: Always define the role and permission matrix per epic — don't assume access levels
- **Race conditions**: Consider concurrent operations for every create/update/delete action
- **Audit trail**: Every state-changing action (create, update, delete) must specify what to log
- **Test coverage**: The testing checklist is a deliverable, not an afterthought — fill it in during authoring

---

## Reference

- `docs/ai/roles/business-analyst.md` — BSA role guide, prompts, quality checklist
- `docs/modules/template-module/brd.md` — BRD template
- `docs/modules/template-module/01-Epic1/01-epic.md` — Epic template
- `docs/ai/workflows/WORKFLOW-HANDOFF.md` — Full handoff chain (PO → BSA → UX Designer → UI Developer → DEV → QA)

> **Epic Template:** Follow the structure defined in `docs/modules/template-module/01-Epic1/01-epic.md`. All placeholders in `[brackets]` must be replaced with actual values derived from the PRD and BRD analysis.

