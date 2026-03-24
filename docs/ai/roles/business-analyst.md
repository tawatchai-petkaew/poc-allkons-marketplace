# Business Analyst Guide - Using AI Assistant

**Role scope:** The BA/BSA operates downstream from the Product Owner (PO). The PRD provided by PO is treated as upstream truth and the primary input to all BA/BSA outputs. The BA/BSA does **not** create or own the PRD.

> **Executable skill:** For the step-by-step BRD generation process, run `/write-brd [module-name]` — see `docs/ai/skills/write-brd/SKILL.md`.

---

## 🎯 How AI Can Help You

As a Business Analyst / Business System Analyst (BA/BSA), AI can assist with:

- ✅ Generating BRD with Epic-first hierarchy from PRD (`/write-brd`)
- ✅ Creating data models (TypeScript interfaces) and API contract specifications
- ✅ Identifying edge cases, error scenarios, and writing business rules
- ✅ Systematic business analysis using the BSA Cognitive Protocol
- ✅ Risk assessment, stakeholder analysis, and data governance analysis
- ✅ Validating requirement completeness against PRD

---

## 🧠 BA/BSA Cognitive Protocol

The BSA applies a 4-step systematic analysis framework (Problem Framing → Requirement Decomposition → Risk Scan → Output Format) across all workflow stages. Full protocol, risk categories, risk matrix, and data governance details are embedded in `docs/ai/skills/write-brd/SKILL.md` (Steps 2–5).

---

## 📚 Documents You Should Reference

When working with AI, tell it to read:

- `docs/modules/[module-name]/` - Product Owner's requirements
- `docs/modules/[module-name]/prd.md` - PRD provided by PO (upstream truth)
- `docs/ai/rules/developer/01-project-structure.md` - Technical architecture and patterns
- `docs/ai/workflows/WORKFLOW-HANDOFF.md` - BRD template (Section 2)
- `docs/shared/glossary.md` - Central UX writing glossary (align Business Glossary terms with central glossary)
- `docs/shared/error-handling.md` - Error display patterns (for consistent error handling in BRD edge cases)
- `docs/ai/rules/ux-designer/03-ux-writing.md` - UX Writing & Copy Standards (all validation/error messages must follow these templates)
- `docs/ai/rules/developer/03-api-and-data-fetching.md` - API patterns (for API contract design)
- `docs/ai/rules/developer/05-typescript-conventions.md` - TypeScript conventions (for data model interfaces)

---

## 📝 Output Template (What You Produce)

Your output artifacts are the **BRD** and **Epic user stories**:

| Artifact          | Template                                           | Save to                                                       |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| Module BRD        | `docs/modules/template-module/brd.md`              | `docs/modules/[module-name]/brd.md`                           |
| Epic stories & AC | `docs/modules/template-module/01-Epic1/01-epic.md` | `docs/modules/[module-name]/[epic]/01-epic.md`                |
| PRD (input)       | —                                                  | `docs/modules/[module-name]/prd.md` — **read-only, PO-owned** |

> **Full BRD structure, ID scheme, Epic template (15 sections), validation checklist, and Definition of Done** are defined in `docs/ai/skills/write-brd/SKILL.md` (Steps 5–8). Do not duplicate them here.

---

## 💬 Common AI Prompts

### Creating BRDs

```
"Help me create a BRD for [module-name].
Read the PRD at docs/modules/[module-name]/prd.md
Read docs/ai/rules/developer/01-project-structure.md to understand our architecture.

Generate:
1. Functional requirements
2. Data models (TypeScript interfaces)
3. API contract specifications
4. Business rules
5. Edge cases"
```

### Generating Data Models

```
"Based on this requirement: [paste requirement]

Generate TypeScript interfaces that match our existing patterns.
Read docs/ai/rules/developer/05-typescript-conventions.md for our interface standards."
```

```
"Convert this PRD user story into data models:
[paste user story]

Include:
- Request interface
- Response interface
- Validation rules"
```

### Creating API Specifications

```
"I need to define an API contract for [module description].

Read docs/ai/rules/developer/03-api-and-data-fetching.md.
Generate:
- Endpoint URL following our conventions
- Request payload (TypeScript interface)
- Response payload (TypeScript interface)
- Required headers (refer to `docs/ai/rules/developer/03-api-and-data-fetching.md` 'Custom Headers')
- Error response formats"
```

### Identifying Edge Cases

```
"Read this functional requirement:
[paste requirement]

List all edge cases and error scenarios I should document.
Consider:
- Invalid inputs
- Concurrent operations
- Partial failures
- Network issues
- Permission errors"
```

### Validating Against Architecture

```
"Review my BRD at docs/modules/[module-name]/brd.md

Check if it follows our technical architecture in docs/ai/rules/developer/:
- Uses correct API proxy pattern
- Headers match our standards
- Data models follow our TypeScript conventions
- State management approach aligns with Zustand patterns"
```

### BSA Cognitive Analysis (Research-Enhanced)

```
"Perform a BSA Cognitive Analysis for [module-name].
Read the PRD at docs/modules/[module-name]/prd.md

Apply the 4-step cognitive protocol:
1. Problem Framing: Identify business objectives, stakeholders, risks, data entities, downstream impact
2. Requirement Decomposition: Break into functional requirements, business rules, validation rules, state handling, error handling, edge cases, data integrity constraints
3. Risk Scan: Assess financial, data corruption, concurrency, permission, and audit trail risks
4. Output: Structured recommendation with stakeholder impact and risk mitigation"
```

### Stakeholder Impact Assessment

```
"For the module described in docs/modules/[module-name]/prd.md

Identify all stakeholders:
- Primary: Direct users
- Secondary: Indirect users or affected parties
- Tertiary: Oversight, compliance, or audit roles
- External: Customers, partners, regulators

For each, assess: impact level (high/medium/low), communication needs, training requirements."
```

### Define Validation Rules

```
"For bulk product edit, what validation rules should I document?
Consider:
- Input formats
- Business constraints
- Data integrity"
```

### Error Response Design

```
"Design error response format for partial success scenario:
50 products updated successfully, 10 failed.

Follow our API response format in docs/ai/rules/developer/03-api-and-data-fetching.md"
```

### Business Glossary

```
"Generate a business glossary for bulk edit module.
Include terms: merchant, SKU, bulk operation, partial success.
Define each in business context (not technical)."
```

### Data Dictionary Generation

```
"Create a data dictionary for all entities in my BRD at docs/modules/[module-name]/brd.md

For each entity include:
- Entity name and description
- Primary key
- All attributes (name, type, length, required, unique, default, description)
- Relationships with other entities
- Business rules
- Data classification (public/internal/confidential/restricted)"
```

---

## 🔄 Typical Workflow

> **Full 9-step process** with templates, validation checklists, and epic generation rules is in `docs/ai/skills/write-brd/SKILL.md`. This section summarizes the stages and the **key BSA decisions** at each stage.

### Stage 1: Analyzing PRD → Cognitive Protocol Step 1 (Problem Framing)

**Key BSA decisions:**

- Which stakeholders are in scope? (Primary / Secondary / Tertiary / External)
- What is the business risk profile?
- What data entities are involved?
- What downstream systems or integrations are affected?

**Done when:** Stakeholders classified, business objective linked to PRD, initial risk list created, data entities catalogued, questions for PO documented.

### Stage 2: Generating BRD Sections → Cognitive Protocol Step 2 (Requirement Decomposition)

**Decompose each requirement into 7 categories:**

| Category                   | What to Document                                 |
| -------------------------- | ------------------------------------------------ |
| **Functional Requirement** | System actions, input/output specs               |
| **Business Rule**          | Constraints, formulas, conditional logic         |
| **Validation Rule**        | Format, range, mandatory fields, cross-field     |
| **State Handling**         | Loading, empty, success, error states            |
| **Error Handling**         | Messages, recovery, fallback, logging            |
| **Edge Case**              | Boundaries, nulls, concurrency, volumes          |
| **Data Integrity**         | PK/FK, unique constraints, referential integrity |

**Done when:** Every PRD module block → Epic, every Epic → User Stories with AC (Given/When/Then), ≥ 3 edge cases per story, no scope invention.

### Stage 3: Creating Data Models → Cognitive Protocol Step 3 (Risk Scan — data-focused)

**Key BSA decisions:**

- Data classification level? (public / internal / confidential / restricted)
- Data owner, steward, custodian, consumer?
- Data lifecycle requirements?
- Cross-entity integrity constraints?

**Done when:** TypeScript interfaces use exact types, data dictionary created, data ownership documented, 6 quality dimensions verified.

### Stage 4: Documenting API Contracts → Cognitive Protocol Step 3 (Risk Scan — system-focused)

**Key BSA decisions:**

- Partial failure handling strategy?
- Idempotency and reversibility plan?
- Permission and authorization model?
- Audit trail requirements?

**Done when:** API contracts include request/response/headers/errors, all risk categories assessed, permission model defined, audit trail specified.

---

## 📋 Quality Checklist

Before handing off to Designer & Developer, ask AI:

```
"Review my BRD at docs/modules/[module-name]/brd.md

Verify:
- [ ] All PRD user stories are covered
- [ ] Data models use TypeScript (not pseudo-code)
- [ ] API contracts include request/response/headers
- [ ] Business rules are specific (not vague)
- [ ] Edge cases identified with expected behaviors
- [ ] Validation rules are clear
- [ ] References docs/ai/rules/developer/ architecture
- [ ] All validation/error messages follow glossary templates (docs/ai/rules/ux-designer/03-ux-writing.md)
- [ ] New Thai UI text added to docs/shared/glossary.md

What's missing?"
```

> **Full validation checklist** (BRD + per-Epic) is in `docs/ai/skills/write-brd/SKILL.md` Step 8. Use it as the definitive gate before handoff.

#### Mandatory Thinking Triggers (Final Check)

- [ ] What happens if this fails? — answered for all critical paths
- [ ] Who owns this data? — documented for all entities
- [ ] Can this be repeated safely? — idempotency verified
- [ ] Is this reversible? — rollback plan documented
- [ ] What is the financial exposure? — financial risk assessed
- [ ] Is there auditability? — audit trail specified

---

## 🎓 Learning Resources

### Example BRD

See: `docs/modules/template-module/brd.md`

### Technical Architecture

See: `docs/ai/rules/developer/01-project-structure.md` - Study this to understand our system

### Full Workflow Guide

See: `docs/ai/workflows/WORKFLOW-HANDOFF.md` (Section 2)

---

## 💡 Pro Tips

### 1. Generate Data Models Fast

```
"Convert these fields to TypeScript interface:
- Product UUID (string)
- Adjustment type (percentage or fixed)
- Adjustment value (number)

Follow our naming convention (camelCase)."
```

### 2. Validate Business Rules

```
"Are these business rules specific enough?
1. Price cannot be negative
2. Maximum 100 products allowed

If not, suggest improvements with exact thresholds."
```

### 3. Cross-Reference Architecture

```
"Does my BRD conflict with our architecture?
Read docs/ai/rules/developer/03-api-and-data-fetching.md and check if my API design follows:
- Proxy pattern
- Authentication flow
- Header requirements"
```

### 4. Generate Test Scenarios

```
"Based on my BRD functional requirements, generate:
- Happy path test scenario
- 3 error scenarios
- 2 edge case scenarios

Format for QA team."
```

### 5. Apply Mandatory Thinking Triggers

```
"For each functional requirement in my BRD, answer:
- What happens if this fails?
- Who owns this data?
- Can this be repeated safely?
- Is this idempotent?
- Is this reversible?

Flag any requirement where the answer is unclear."
```

### 6. Perform Risk Scan

```
"Scan my BRD for risks across these categories:
- Financial risk (revenue impact, payment errors)
- Data corruption risk (partial updates, concurrent modification)
- Concurrency risk (race conditions, deadlocks)
- Permission risk (unauthorized access, privilege escalation)
- Audit trail impact (compliance logging, data lineage)

Suggest mitigation strategies for each risk found."
```

---

## 🔍 Advanced Techniques

### Analyzing Existing Modules

```
"I need to design a bulk edit module similar to product import.
Search the codebase for product import implementation.
Tell me:
1. What API pattern they used
2. How they handled errors
3. What I should replicate in my BRD"
```

### Generating State Diagrams

```
"Based on my BRD, create a state transition diagram for the bulk edit flow:
Starting from 'No Selection' to 'Complete' or 'Error'"
```

### API Contract Validation

```
"Compare my API contract with existing product APIs.
Read docs/api/product.api.ts
Are my request/response structures consistent?"
```

### Full Cognitive Analysis

```
"Perform a complete BSA Cognitive Analysis for my BRD at docs/modules/[module-name]/brd.md

Step 1 - Problem Framing:
- Business objectives, stakeholders, risks, data entities, downstream impact

Step 2 - Requirement Decomposition:
- Functional requirements, business rules, validation rules, state handling, error handling, edge cases, data integrity

Step 3 - Risk Scan:
- Financial, data corruption, concurrency, permission, audit trail

Step 4 - Output:
- Business understanding, stakeholder impact, requirement breakdown, business rules summary, risk & edge cases, recommendation

Answer all mandatory thinking triggers."
```

---

## 🆘 Common Questions

**Q: How detailed should my data models be?**
A: Use TypeScript interfaces with exact types. Ask AI: _"Is this interface specific enough for developers to implement without questions?"_

**Q: Should I design the backend API or just document what's needed?**
A: Document what's needed. If backend API exists, read the docs. If not, specify the contract and let backend team design implementation.

**Q: How do I know if I've covered all edge cases?**
A: Ask AI to review your BRD and list scenarios you haven't addressed. Also apply the 7-category requirement decomposition (functional, business rule, validation, state, error, edge case, data integrity) to ensure nothing is missed.

**Q: Can AI generate the entire BRD?**
A: AI can generate a solid draft, but you must validate business rules with stakeholders and verify technical feasibility with Tech Lead.

**Q: What is the relationship between BA/BSA and PO?**
A: The PO creates the PRD (upstream truth). The BA/BSA receives the PRD as input and produces the BRD and epic user stories. Do not duplicate PO responsibilities or rewrite PRD content.

**Q: When should I perform a full Cognitive Analysis?**
A: For any P0 or P1 module, or any module involving financial data, sensitive data, or complex multi-system integrations. For simpler modules, the standard workflow (Steps 1-4) with quality checklists is sufficient.

**Q: How do I handle conflicting stakeholder requirements?**
A: Document both perspectives, perform root cause analysis on the conflict, evaluate options objectively, and present a recommendation with supporting evidence to the PO for final decision.

---

## 📞 Getting Help

If you're stuck:
1. Read `docs/ai/rules/developer/01-project-structure.md` to understand technical context
2. Check example BRD: `docs/modules/template-module/*`
3. Ask AI to compare your work with the example
4. Consult with Tech Lead for architecture questions
5. Apply the BSA Cognitive Protocol (4-step analysis) for complex problems
6. Use the Mandatory Thinking Triggers to identify blind spots
7. Add useful prompts you discover to this guide!
