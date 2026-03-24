# Tech Lead Guide - Using AI Assistant

**Role scope:** The Tech Lead operates downstream from the BSA. The approved BRD and `01-epic.md` (Section 2: User Stories, Section 11: Data Dictionary, Section 14: Draft Technical Design) are treated as upstream truth. The Tech Lead does **not** create or own the BRD or Epic.

> **Executable skill:** For the step-by-step technical spec generation process, run `/write-tech-spec [module-name] [epic-name]` — see `docs/ai/skills/write-tech-spec/SKILL.md`.

---

## 🎯 How AI Can Help You

As a Tech Lead, AI can assist with:

- ✅ Generating Technical Specifications from BRD and Epic (`/write-tech-spec`)
- ✅ Designing database schemas and ER diagrams from Data Dictionary
- ✅ Designing API contracts with request/response payloads and error handling
- ✅ Creating sequence diagrams for key flows
- ✅ Generating TypeScript interfaces for request/response models
- ✅ Security review (auth, permissions, merchant isolation)
- ✅ Traceability audit (US-xx → API → DB → FR-xxx)

---

## 🧠 Tech Lead Cognitive Protocol

### Purpose

The Tech Lead bridges business requirements and technical implementation — translating user stories, data dictionaries, and business rules into database schemas, API contracts, and architecture decisions.

### Core Competencies

| Competency                | Key Skills                                                                   |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Architecture Design**   | System architecture, microservice mapping, component interaction diagrams    |
| **Database Design**       | ER diagrams, schema definitions, indexes, migration planning                 |
| **API Contract Design**   | Endpoint design, request/response payloads, validation rules, error handling |
| **Security & Compliance** | Auth, permissions, merchant isolation, audit trail, data protection          |

### Cognitive Protocol

A 3-step systematic framework applied when generating technical specs:

| Step | Name                          | Purpose                                                                                | Applied In                      |
| ---- | ----------------------------- | -------------------------------------------------------------------------------------- | ------------------------------- |
| 1    | Requirement-to-Schema Mapping | Map US-xx / FR-xxx to DB tables, columns, relationships, and API endpoints             | Step 3: Analyze Requirements    |
| 2    | API Contract Design           | Design request/response payloads, error codes, validation rules, and sequence diagrams | Step 4: Generate Technical Spec |
| 3    | Security & Traceability Audit | Verify auth, permissions, merchant isolation, audit trail, and US-xx traceability      | Step 7: Validation              |

### Mandatory Thinking Triggers

**Rule:** Tech Lead must always ask internally at every stage:

- Have I designed the **error response** for every API endpoint?
- Does this API enforce **permission checks** from `01-epic.md` Section 6?
- Do **API error messages** align with `docs/shared/error-handling.md` error code catalog and `docs/shared/glossary.md`?
- Is the DB schema **normalized** and does it match `01-epic.md` Section 11 (Data Dictionary)?
- Am I using the **proxy pattern** (`/api/[service]/*`) — never direct backend URLs?
- Does every API endpoint **trace back to a US-xx or FR-xxx**?
- Have I included **merchant isolation** (`CurrentMerchantSlug`) on all merchant-scoped endpoints?
- Have I specified **audit trail** requirements from `01-epic.md` Section 12?

---

## 📚 Documents You Should Reference

When working with AI, tell it to read:

- `docs/modules/[module-name]/brd.md` - BRD from BSA (must be `🟢 Final / Approved`)
- `docs/modules/[module-name]/[epic]/01-epic.md` - Epic spec, focus on:
  - **Section 2: User Stories** — AC, BR, validation rules, edge cases, error handling
  - **Section 6: Role and Permission Matrix** — auth/permission per API
  - **Section 11: Data Dictionary** — entity attributes, relationships → DB schema
  - **Section 12: Audit Trail Requirements** — what to log per action
  - **Section 14: Draft Technical Design** — BSA's preliminary API endpoints, DB schema
- `docs/ai/rules/developer/01-project-structure.md` - Technical architecture & project structure (microservice proxy pattern, tech stack, file organization)
- `docs/ai/rules/developer/03-api-and-data-fetching.md` - API design patterns, proxy architecture
- `docs/ai/rules/developer/05-typescript-conventions.md` - TypeScript interface conventions
- `docs/ai/workflows/WORKFLOW-HANDOFF.md` - Overall workflow and handoff process
- `docs/shared/error-handling.md` - Error display patterns (for consistent error response design)
- `docs/ai/rules/ux-designer/03-ux-writing.md` - UX Writing & Copy Standards (API error messages must align with glossary)
- `docs/shared/glossary.md` - Central glossary (for consistent API field naming)

---

## 📝 Output Template (What You Produce)

Your output artifact is the **Technical Specification**. Use this template:

- Template: `docs/modules/template-module/01-Epic1/02-technical-spec.md`

Save your results to:

- `docs/modules/[module-name]/[epic]/02-technical-spec.md`

> **Full 10-section structure, validation checklist, and authoring rules** are defined in `docs/ai/skills/write-tech-spec/SKILL.md` (Steps 4–7). Do not duplicate them here.

---

## 💬 Common AI Prompts

### Starting a Technical Spec

```
"I'm creating a technical spec for [module-name] [epic-name].
Read these documents:
1. docs/modules/[module-name]/brd.md (BRD)
2. docs/modules/[module-name]/[epic]/01-epic.md (Epic — focus on Section 2, 6, 11, 12, 14)
3. docs/ai/rules/developer/01-project-structure.md (architecture)
4. docs/ai/rules/developer/03-api-and-data-fetching.md (API patterns)

Generate:
- System architecture diagram
- Database schema from Section 11 Data Dictionary
- API contracts from Section 14 Draft Technical Design
- Sequence diagrams for key flows
- Traceability matrix (US-xx → API → DB → FR-xxx)"
```

### Designing Database Schema

```
"Read 01-epic.md Section 11 (Data Dictionary) for [module-name] [epic].
Generate:
- ER diagram (Mermaid erDiagram)
- Schema definitions with columns, types, constraints, defaults
- Indexes for foreign keys and common query patterns
- Include audit columns: createdAt, updatedAt, createdBy, updatedBy

Map each table to a Data Dictionary entity."
```

### Designing API Contracts

```
"Read 01-epic.md Section 2 (User Stories) and Section 14 (Draft Technical Design).
Design API contracts for each user story.

For each endpoint include:
- Method, route (proxy pattern: /api/[service]/v1/...)
- Maps to: FR-xxx, US-xx
- Auth and permission requirements (from Section 6)
- Request/response JSON payloads
- Validation rules (from Section 2 BR-xxx)
- Error responses (400, 401, 403, 404, 409, 500)

Follow response format: { success, data } / { success, message } / { success, errors }"
```

### Security & Permissions Review

```
"Review my technical spec at docs/modules/[module-name]/[epic]/02-technical-spec.md

Check:
- Auth requirements per endpoint
- Permission checks from 01-epic.md Section 6
- Merchant isolation (CurrentMerchantSlug header)
- Audit trail from 01-epic.md Section 12
- SQL injection prevention
- XSS prevention
- Rate limiting on write endpoints"
```

### Traceability Audit

```
"Review my technical spec's Traceability Matrix (Section 9).
Compare against 01-epic.md Section 2 (User Stories).

Verify:
- Every US-xx appears at least once
- Every API endpoint traces to a US-xx and FR-xxx
- Every DB table maps to a Data Dictionary entity
- No orphan endpoints (endpoints without traceability)"
```

---

## 🔄 Typical Workflow

> **Full 8-step process** with templates, validation checklists, and authoring rules is in `docs/ai/skills/write-tech-spec/SKILL.md`. This section summarizes the stages and the **key Tech Lead decisions** at each stage.

### Stage 1: Analyze Requirements → Cognitive Protocol Step 1 (Requirement-to-Schema Mapping)

**Key Tech Lead decisions:**

- What DB tables/columns are needed (new or modified)?
- What API endpoints are required (CRUD + custom)?
- What validation rules apply server-side?
- What permissions are needed (from Section 6)?

**Done when:** Traceability map built: US-xx → API Endpoint → DB Table → FR-xxx

### Stage 2: Design Database → Cognitive Protocol Step 1 (continued)

**Key Tech Lead decisions:**

- ER diagram reflects all entities from Data Dictionary
- Schema definitions have proper types, constraints, indexes
- Audit columns (createdAt, updatedAt, createdBy, updatedBy) on every table
- Migration considerations documented

**Done when:** Every table maps to `01-epic.md` Section 11 entity, indexes cover FK and common queries.

### Stage 3: Design API Contracts → Cognitive Protocol Step 2 (API Contract Design)

**Key Tech Lead decisions:**

- Every endpoint uses proxy pattern (`/api/[service]/v1/...`)
- Request/response payloads match project's `{ success, data }` format
- Validation rules come from `01-epic.md` Section 2 (BR-xxx)
- Error responses cover all codes (400, 401, 403, 404, 409, 500)
- Sequence diagrams show proxy flow (User → Frontend → Proxy → Backend → DB)

**Done when:** Every endpoint has `Maps to: FR-xxx, US-xx` traceability.

### Stage 4: Validate → Cognitive Protocol Step 3 (Security & Traceability Audit)

**Key Tech Lead decisions:**

- All 7 thinking triggers answered
- Section 9 (Traceability Matrix) covers all user stories
- Security checklist completed
- Audit trail requirements from Section 12 addressed

**Done when:** All 20 validation checks pass (see SKILL.md Step 7).

---

## 📋 Quality Checklist

Before marking tech spec as `🟢 Final / Approved`, verify:

```
"Review my technical spec at docs/modules/[module-name]/[epic]/02-technical-spec.md

Verify:
- [ ] All 10 numbered sections present
- [ ] Change Log with BRD Version column
- [ ] ER diagram uses valid Mermaid syntax
- [ ] Every table maps to Data Dictionary entity
- [ ] Every API endpoint has Maps to: FR-xxx, US-xx
- [ ] All routes use proxy pattern (/api/[service]/v1/...)
- [ ] Validation rules match 01-epic.md Section 2
- [ ] Error responses cover 400, 401, 403, 404, 409, 500
- [ ] Auth/permissions from Section 6 specified per endpoint
- [ ] Merchant isolation via CurrentMerchantSlug
- [ ] Audit trail from Section 12 addressed
- [ ] Traceability Matrix covers all user stories
- [ ] TypeScript interfaces follow conventions

What's missing?"
```

> **Full validation checklist** (20 checks across 5 categories) is in `docs/ai/skills/write-tech-spec/SKILL.md` Step 7. Use it as the definitive gate before handoff.

#### Mandatory Thinking Triggers (Final Check)

- [ ] Have I designed the error response for every API endpoint?
- [ ] Does every API enforce permission checks from Section 6?
- [ ] Is the DB schema normalized and matches Section 11?
- [ ] Am I using the proxy pattern — never direct backend URLs?
- [ ] Does every endpoint trace back to US-xx / FR-xxx?
- [ ] Merchant isolation included on all merchant-scoped endpoints?
- [ ] Audit trail requirements from Section 12 specified?

---

## 🎓 Learning Resources

### Technical Architecture
See: `docs/ai/rules/developer/01-project-structure.md` - **Read this first!**

### API Patterns

See: `docs/ai/rules/developer/03-api-and-data-fetching.md` - Proxy architecture, Axios instances, interceptors

### TypeScript Conventions

See: `docs/ai/rules/developer/05-typescript-conventions.md` - Interface naming, type patterns

### Template

See: `docs/modules/template-module/01-Epic1/02-technical-spec.md` - Canonical 10-section template

### Full Workflow Guide

See: `docs/ai/workflows/WORKFLOW-HANDOFF.md`

---

## 💡 Pro Tips

### 1. Start from Data Dictionary

```
"Read 01-epic.md Section 11 (Data Dictionary) first.
Map each entity → DB table, each attribute → column.
Then derive API endpoints from user stories that operate on those entities."
```

### 2. Validate Proxy Pattern

```
"Check all API routes in my tech spec.
Verify every route follows /api/[service]/v1/[resource] format.
Flag any direct backend URLs."
```

### 3. Error Response Completeness

```
"For each API endpoint in my tech spec, verify error responses cover:
- 400 Bad Request (validation failure)
- 401 Unauthorized (missing/invalid token)
- 403 Forbidden (insufficient permissions)
- 404 Not Found (resource doesn't exist)
- 409 Conflict (duplicate resource)
- 500 Internal Server Error

Flag any missing error codes."
```

### 4. Parallel with Designer

```
"Tech Lead and Designer can work in parallel after BSA approval.
Tech Lead designs API contracts → Designer designs UI.
Both must be 🟢 Final before Developer starts implementation."
```

---

## 🆘 Common Questions

**Q: What's the difference between Tech Lead and Developer?**
A: Tech Lead designs the **architecture** (DB schema, API contracts, security). Developer **implements** the code based on tech spec + frontend spec. Tech Lead produces `02-technical-spec.md`; Developer produces `04-develop-spec.md` + code.

**Q: When should I approve the tech spec?**
A: After verifying all 20 validation checks in SKILL.md Step 7 pass. Key gates: all 10 sections present, traceability matrix complete, error responses comprehensive, security checklist done.

**Q: What if BSA's Draft Technical Design (Section 14) is incomplete?**
A: Refine it, don't ignore it. Use it as a starting point. Document missing information in "Questions for BSA / Developer" (Section 10).

**Q: Can Tech Lead and Designer work in parallel?**
A: Yes. After BSA's BRD is `🟢 Final`, Tech Lead designs API contracts while Designer designs UI. Developer waits for both to be approved.

**Q: Should I design backend implementation details?**
A: No. Focus on **contracts** (what the API accepts/returns), **schema** (what the DB stores), and **architecture** (how components interact). Backend implementation details are the Developer's responsibility.

---

## 📞 Getting Help

If you're stuck:
1. Read `docs/ai/rules/developer/01-project-structure.md` to understand technical architecture
2. Check template: `docs/modules/template-module/01-Epic1/02-technical-spec.md`
3. Read `docs/ai/rules/developer/03-api-and-data-fetching.md` for API patterns
4. Ask AI to compare your tech spec with the template
5. Apply the Tech Lead Cognitive Protocol (3-step analysis)
6. Use the Mandatory Thinking Triggers to identify blind spots
7. Add useful prompts you discover to this guide!
