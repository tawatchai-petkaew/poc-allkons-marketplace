---
name: write-tech-spec
description: Generate a Technical Specification from BRD + Epic, on behalf of the Tech Lead — DB schema, API contracts, sequence diagrams, and traceability
---

# Write Tech Spec

Generates the Technical Specification (`02-technical-spec.md`) from approved BRD and Epic, producing DB schema, API contracts, sequence diagrams, security review, and traceability matrix.

**Role scope:** The Tech Lead operates downstream from the BSA. The approved BRD and `01-epic.md` (Section 2: User Stories, Section 11: Data Dictionary, Section 14: Draft Technical Design) are treated as upstream truth. The Tech Lead does **not** create or own the BRD or Epic.

> **Role guide:** See `docs/ai/roles/tech-lead.md` for the Tech Lead's full role context, cognitive protocol, and quality checklist. Output template: `docs/modules/template-module/01-Epic1/02-technical-spec.md`.

---

## Tech Lead Cognitive Protocol

A 3-step systematic framework applied when generating technical specs:

| Step | Name                          | Purpose                                                                                | Applied In                      |
| ---- | ----------------------------- | -------------------------------------------------------------------------------------- | ------------------------------- |
| 1    | Requirement-to-Schema Mapping | Map US-xx / FR-xxx to DB tables, columns, relationships, and API endpoints             | Step 3: Analyze Requirements    |
| 2    | API Contract Design           | Design request/response payloads, error codes, validation rules, and sequence diagrams | Step 4: Generate Technical Spec |
| 3    | Security & Traceability Audit | Verify auth, permissions, merchant isolation, audit trail, and US-xx traceability      | Step 6: Validation              |

### Mandatory Thinking Triggers

**Rule:** Tech Lead must always ask internally at every stage:

- Have I designed the **error response** for every API endpoint?
- Does this API enforce **permission checks** from `01-epic.md` Section 6?
- Is the DB schema **normalized** and does it match `01-epic.md` Section 11 (Data Dictionary)?
- Am I using the **proxy pattern** (`/api/[service]/*`) — never direct backend URLs?
- Does every API endpoint **trace back to a US-xx or FR-xxx**?
- Have I included **merchant isolation** (`CurrentMerchantSlug`) on all merchant-scoped endpoints?
- Have I specified **audit trail** requirements from `01-epic.md` Section 12?

---

## Usage

```bash
/write-tech-spec [module-name] [epic-name]
```

## Instructions

When the user invokes `/write-tech-spec [module-name] [epic-name]`:

**Step 1: Read Final PRD, BRD and Epic**
Read:

1. `docs/modules/$1/prd.md` - Product requirements (PRD from PO — for high-level product intent and scope)
2. `docs/modules/$1/brd.md` - Business requirements (MUST be `🟢 Final / Approved`)
3. `docs/modules/$1/$2/01-epic.md` - Epic spec, focus on:
   - **Section 2: User Stories** — AC, BR, validation rules, edge cases, error handling
   - **Section 6: Role and Permission Matrix** — auth/permission per API
   - **Section 11: Data Dictionary** — entity attributes, relationships → DB schema
   - **Section 12: Audit Trail Requirements** — what to log per action
   - **Section 14: Draft Technical Design** — BSA's preliminary API endpoints, DB schema
4. `docs/modules/template-module/01-Epic1/02-technical-spec.md` - Canonical template (10-section structure)

If BRD doesn't exist or is still marked `⚪ Draft`, tell user:

```
❌ Final BRD not found or not approved: docs/modules/$1/brd.md

Please ensure BSA has reviewed and approved the BRD to "🟢 Final / Approved" before Tech Lead can start the Technical Spec.
```

**Step 2: Read Architecture & Standards**
Read:

- `docs/ai/rules/developer/01-project-structure.md` - Technical architecture overview (microservice proxy pattern, tech stack, development commands)
- `docs/modules/$1/architecture.md` - Module-level architecture (if exists: services, data model, cross-epic decisions)
- `docs/ai/rules/developer/03-api-and-data-fetching.md` - API design patterns, proxy architecture, Axios instances
- `docs/ai/rules/developer/05-typescript-conventions.md` - TypeScript interface patterns, naming conventions
- `docs/shared/error-handling.md` - Error display patterns and error code catalog (for consistent error response design)
- `docs/shared/glossary.md` - Central glossary (for consistent naming in API fields)
- `docs/ai/rules/ux-designer/03-ux-writing.md` - UX Writing & Copy Standards (API error messages must align with glossary)

**Step 3: Analyze Requirements** _(Cognitive Protocol Step 1: Requirement-to-Schema Mapping)_

From BRD and `01-epic.md`, extract and map:

- **User stories (US-xx)** → API endpoints needed
- **Data Dictionary (Section 11)** → DB tables, columns, types, constraints
- **Business rules (BR-xxx)** → Server-side validation rules per endpoint
- **Permissions (Section 6)** → Auth/permission requirements per endpoint
- **State behavior** → Loading/empty/success/error responses

Build a preliminary traceability map:

```
US-xx → API Endpoint → DB Table → FR-xxx
```

**Step 4: Generate Technical Spec** _(Cognitive Protocol Step 2: API Contract Design)_

Use the canonical template. Fill all 10 sections:

**Section 1: System Architecture**

- System context, architecture diagram, tech stack
- Microservice mapping (service → proxy route)
- Key architecture decisions

**Section 2: External Dependencies**

- External microservices, npm packages, third-party APIs
- Version pinning and purpose for each

**Section 3: Database Design**

- ER diagram (Mermaid erDiagram)
- Schema definitions: tables, columns, types, constraints, defaults
- Indexes for foreign keys and common query patterns
- Audit columns: `createdAt`, `updatedAt`, `createdBy`, `updatedBy` on every table
- Map each table to Data Dictionary entity from `01-epic.md` Section 11

**Section 4: Data Models (TypeScript)**

- Request/response interfaces following `docs/ai/rules/developer/05-typescript-conventions.md`

**Section 5: API Specifications**
For each endpoint:

- Method, route (proxy pattern: `/api/[service]/v1/...`)
- `Maps to: FR-xxx, US-xx`
- Auth and permission requirements (from Section 6)
- Request payload (TypeScript interface)
- Response payload (TypeScript interface) — follow `{ success, data }` / `{ success, message }` / `{ success, errors }` format
- Validation rules (from Section 2 BR-xxx)
- Error responses: 400, 401, 403, 404, 409, 500

**Section 6: Sequence Diagrams**

- Key flows: User → Frontend → Proxy → Backend → DB
- Include error branches

**Section 7: Security & Permissions**

- Auth requirements per endpoint
- Permission checks from `01-epic.md` Section 6
- Merchant isolation (`CurrentMerchantSlug` header)
- XSS/injection prevention
- Rate limiting on write endpoints

**Section 8: Audit Trail**

- From `01-epic.md` Section 12
- What to log per CRUD action, retention period

**Section 9: Traceability Matrix**

- Complete mapping: US-xx → API Endpoint → DB Table → FR-xxx
- Every US-xx must appear at least once

**Section 10: Open Questions**

- Questions for BSA / Developer
- Assumptions

**Step 5: Save Technical Spec**
Write to: `docs/modules/$1/$2/02-technical-spec.md`

**Step 6: Validation** _(Cognitive Protocol Step 3: Security & Traceability Audit)_

Run this checklist before finalizing:

### Structure & Completeness

- [ ] All 10 numbered sections present
- [ ] Change Log with BRD Version column
- [ ] Status set to `⚪ Draft`

### Database

- [ ] ER diagram uses valid Mermaid syntax
- [ ] Every table maps to a Data Dictionary entity (Section 11)
- [ ] Audit columns on every table (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`)
- [ ] Indexes cover FK and common query patterns

### API Contracts

- [ ] Every endpoint has `Maps to: FR-xxx, US-xx`
- [ ] All routes use proxy pattern (`/api/[service]/v1/...`)
- [ ] Request/response use TypeScript interfaces (not pseudo-code)
- [ ] Validation rules match `01-epic.md` Section 2 (BR-xxx)
- [ ] Error responses cover 400, 401, 403, 404, 409, 500
- [ ] Error response messages align with `docs/shared/error-handling.md` error code catalog and `docs/shared/glossary.md`

### Security

- [ ] Auth/permissions from Section 6 specified per endpoint
- [ ] Merchant isolation via `CurrentMerchantSlug`
- [ ] Audit trail from Section 12 addressed

### Traceability

- [ ] Traceability Matrix (Section 9) covers all user stories from `01-epic.md` Section 2
- [ ] No orphan endpoints (endpoints without US-xx mapping)

### Mandatory Thinking Triggers (Final Check)

- [ ] Error response designed for every endpoint?
- [ ] Permission checks enforced per endpoint?
- [ ] DB schema normalized and matches Data Dictionary?
- [ ] Proxy pattern used — never direct backend URLs?
- [ ] Every endpoint traces to US-xx / FR-xxx?
- [ ] Merchant isolation on all merchant-scoped endpoints?
- [ ] Audit trail requirements specified?

**Step 7: Versioning & Updates**
If the target document already exists and you are asked to update:

1. **Do NOT overwrite** the existing Change Log history. Add a new row.
2. **Increment the Version** (v1.1, v1.2, etc.) with date and summary.
3. **Reset Status** to `⚪ Draft` until Tech Lead explicitly approves.
4. **Preserve Content** — only modify sections requested by the user.

**Step 8: Provide Next Steps**
Tell the user:

```
✅ Draft Technical Spec created: docs/modules/$1/$2/02-technical-spec.md

Technical Summary:
- DB Tables: [X]
- API Endpoints: [X]
- Sequence Diagrams: [X]
- Traceability: [X] / [X] User Stories covered (100%)

Next steps for Tech Lead:
1. Review the database schema, API contracts, and security section.
2. If you want changes, tell me which section to update.
3. When satisfied, reply "I approve" so I can mark this Tech Spec as Final.
4. After approval:
   - UX Designer can start Phase 1 of Frontend Spec using /write-ux-spec
   - (Tech Lead and UX Designer can work in parallel after BRD approval)
```

## Tips for AI

- **Start from Data Dictionary**: `01-epic.md` Section 11 → DB tables → API endpoints
- **Proxy pattern is mandatory**: All routes must follow `/api/[service]/v1/[resource]`
- **Error responses are required**: Every endpoint needs 400, 401, 403, 404, 409, 500 coverage
- **TypeScript strict**: Use exact types from `docs/ai/rules/developer/05-typescript-conventions.md`
- **Merchant isolation**: Every merchant-scoped endpoint needs `CurrentMerchantSlug` header
- **Don't implement**: No code files — only the spec document. Developer implements later.
- **Sequence diagrams**: Include proxy flow (User → Frontend → Proxy → Backend → DB)
- **Cognitive Protocol**: Apply the 3-step framework at every stage
- **Thinking Triggers**: Run all 7 mandatory thinking triggers

## Reference

- `docs/ai/roles/tech-lead.md` — Tech Lead role guide, prompts, quality checklist
- `docs/modules/template-module/01-Epic1/02-technical-spec.md` — Canonical template
- `docs/ai/rules/developer/03-api-and-data-fetching.md` — API patterns, proxy architecture
- `docs/ai/rules/developer/05-typescript-conventions.md` — TypeScript conventions
- `docs/ai/workflows/WORKFLOW-HANDOFF.md` — Full handoff chain
- `docs/shared/error-handling.md` — Error display patterns and error code catalog
- `docs/shared/glossary.md` — Central glossary for consistent naming
