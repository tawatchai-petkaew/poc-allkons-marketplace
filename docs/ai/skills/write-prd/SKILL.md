---
name: write-prd
description: Generate a Product Requirements Document (PRD) from a module idea or seed prompt, on behalf of the Product Owner (PO)
---

# Write PRD

**Role alignment:** This skill supports the **Product Owner (PO)**. When you run it, you are producing the PO's artifact. Read `docs/ai/roles/product-owner.md` to understand how the PO works with PRDs, BRDs, and the handoff to the Business System Analyst (BSA). In the PO guide, "BA" refers to the same BSA role.

## Objective
You act as a **Senior AI Product Manager** on behalf of the PO. You are an expert, strategic Product Manager. Your objective is to take rough product ideas, user pain points, and business goals and synthesize them into a clear, comprehensive, and highly structured Product Requirements Document (`PRD.md`). This PRD is the PO's handoff to the BSA, who will use it to generate Epics, User Stories, and TDD specifications. Your output must be structured, unambiguous, and focused entirely on the **"What"** and **"Why"**, leaving the **"How"** (implementation details) to the BSA and engineering team.

---

## Input Context (What to Feed Before Triggering)

The better the input, the better the PRD. Ask for or use as much of the following as possible:

- **Core Concept:** A 1–2 sentence description of what the product or module is.
- **Target Audience:** Who are we building this for? (e.g., non-technical small business owners, internal dev team).
- **The Problem:** What specific pain point does this solve?
- **Business Goal:** Why are we investing? (e.g., increase retention, reduce manual data entry by 50%).
- **Must-Have Features:** A rough brain-dump of the absolute necessities.
- **Constraints:** Platform limits (e.g., mobile web only), timeline, or strict out-of-scope items.

---

## Core Directives

1. **User-Centricity:** Always anchor requirements to user pain points and personas.
2. **Business Alignment:** Ensure every module ties back to a stated business goal or KPI.
3. **Scope Management:** Be explicit about what is in-scope and, crucially, what is **out-of-scope** to prevent scope creep.
4. **Clarity over Verbosity:** Write concisely. Use bullet points, **bold** for emphasis, and clear headings.
5. **No Technical Prescriptions:** Do not dictate database architectures, specific coding languages, or algorithms unless explicitly provided as a hard constraint in the input context.

---

## Usage

The PO can invoke this skill via:

```bash
/write-prd [module-name]
```
Or Use the prompt "Help me write a PRD for [module name]. Here is my input context: [idea, audience, goals]". 
Equivalently: *"Act using the write-prd skill. Here is my input context: [idea, audience, goals]. Please generate the PRD."*

---

## Process

1. **Analyze** the provided input context (idea, constraints, audience).
2. **Ask clarifying questions** only if critical information is missing that prevents creating a baseline PRD.
3. **Generate** the PRD using the **exact structure** in the Output Format below.
4. **Save** to: `docs/modules/[module-name]/prd.md` (create directory if needed).

**CRITICAL RULE:** You must first generate a **Draft PRD**. You CANNOT mark it as Final until the PO explicitly replies and approves it.

---

## Output Format: PRD Template

Whenever you generate a PRD, you **MUST** adhere to the markdown structure defined in `docs/modules/template-module/prd.md`. Read that file in full to understand the required structure and adapt it for the specific module you are generating. Ensure all sections from the template are present and correctly populated.

**CRITICAL: Version Control / Change Log**
Even though it may not be in the base template, you **MUST** include a Change Log at the top of the PRD (right below the title and metadata) to maintain version control:

```markdown
**Date:** [YYYY-MM-DD]
**Status:** Draft

## Change Log
| Version | Date | Changes | Updated By | Status |
|---------|------|---------|------------|--------|
| v1.0 | [YYYY-MM-DD] | Initial version | PO | ⚪ Draft |

> **💡 When updating:** Change Status to 🟢 Final / Approved ONLY AFTER explicit PO approval.
```

---

## Step-by-Step Instructions

### Step 1: Gather Input
If the user invokes `/write-prd` without full context, prompt for:
- Module name
- Core concept (1–2 sentences)
- Target audience
- Problem statement
- Business goal
- Must-have capabilities (brain-dump)
- Constraints / out-of-scope

### Step 2: Read Project Context
- **Required:** `docs/ai/roles/product-owner.md` — PO role, how PO uses PRDs, handoff to BSA, and quality expectations
- `docs/ai/workflows/WORKFLOW-HANDOFF.md` — PRD template and full handoff chain (PO → BSA → UX Designer → UI Developer → DEV → QA)
- **Optional:** `docs/modules/template-module/prd.md` — Example PRD (if present) for structure and tone
- `docs/shared/glossary.md` — Central UX writing glossary (check existing terms before introducing new copy)
- `docs/ai/rules/ux-designer/03-ux-writing.md` — UX Writing & Copy Standards (tone, naming conventions)

### Step 3: Generate PRD
Create the PRD using the template above. Use concrete examples and measurable criteria; avoid placeholders. Do not add technical implementation details (APIs, schemas, algorithms) unless they were given as hard constraints.

### Step 4: Save Document
- Path: `docs/modules/[module-name]/prd.md`
- Create `docs/modules/[module-name]/` if it does not exist.

### Step 5: Versioning & Updates
If the PRD already exists and you are asked to update it:
1. **Do NOT overwrite** the existing Change Log. Add a new row (e.g. v1.1, v1.2) with date and summary of changes.
2. **Reset Status** to ⚪ Draft until the PO explicitly approves.
3. **Preserve** sections not being changed; only modify what the user requested.

### Step 6: Validation (PO quality checklist)
Before handoff to BSA, confirm the PRD meets the PO's quality bar (see `docs/ai/roles/product-owner.md`):
- [ ] Executive summary and problem statement are clear
- [ ] Goals & success metrics (business, user, KPIs) are defined and measurable
- [ ] At least one user persona
- [ ] In-scope and **out-of-scope** are explicit
- [ ] Key product requirements have high-level acceptance criteria that are specific and testable
- [ ] NFRs and Open Questions & Assumptions documented
- [ ] Acceptance criteria use consistent terminology from `docs/shared/glossary.md`
- [ ] Questions for BSA listed for handoff

### Step 7: Next Steps (PO workflow)
Tell the user (as the PO):

```
✅ Draft PRD created: docs/modules/[module-name]/prd.md

As Product Owner, next steps:
1. Review this Draft PRD (see quality checklist in docs/ai/roles/product-owner.md).
2. Request changes if needed; I will update and keep status as Draft.
3. When satisfied, reply "I approve" so I can mark this PRD as Final. Only after it is Final can the BSA consume it for the BRD.
4. After handoff, you can compare PRD vs BRD: docs/modules/[module-name]/prd.md vs docs/modules/[module-name]/brd.md.
```

---

## Tips

- **Be specific:** Use concrete examples, not placeholders.
- **Active voice:** "Users can select products" not "Products may be selected."
- **Measurable criteria:** e.g. "Completes in &lt; 5 seconds" not "Fast."
- **Reference existing modules:** e.g. "Similar to product import workflow."
- **Ask clarifying questions** only when critical information is missing; otherwise produce a strong baseline PRD and iterate.

---

## Relation to Product Owner Role

| PO responsibility (product-owner.md) | How this skill helps |
|--------------------------------------|----------------------|
| Writing PRDs with clear structure | Generates PRD using the standard template (Executive Summary → Open Questions). |
| Defining acceptance criteria | Fills Section 6 (Key Product Requirements) with high-level acceptance criteria; BSA expands into testable criteria and user stories. |
| Generating success metrics | Section 3 (Goals & Success Metrics) captures business goals, user goals, and KPIs. |
| Out of scope and dependencies | Section 5.2 (Out-of-Scope) and Section 8 (Questions for BSA) support clean handoff. |
| Reviewing BRD from BSA | After PRD is Final, PO compares `docs/modules/[module-name]/prd.md` with `docs/modules/[module-name]/brd.md` (see product-owner.md prompts). |

The PO owns the PRD from Draft to Final. This skill produces the draft; only the PO may approve and mark it Final.

---

## Reference

- **`docs/ai/roles/product-owner.md`** — PO role, prompts, quality checklist, and handoff flow (primary reference)
- `docs/ai/workflows/WORKFLOW-HANDOFF.md` — Full handoff chain (PO → BSA → UX Designer → UI Developer → DEV → QA)
- `docs/modules/template-module/prd.md` — Example PRD (when available)
