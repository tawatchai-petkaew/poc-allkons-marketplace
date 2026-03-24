# Product Owner Guide - Using AI Assistant

---

## PO Scope

The Product Owner creates **only** the PRD (Product Requirements Document):

- **PRD** captures "what" and "why" — problem, goals, personas, scope, key product requirements, and high-level acceptance criteria
- **BSA** (Business System Analyst) consumes the approved PRD and produces the BRD (user stories, detailed acceptance criteria, specs)
- PO **does not create** BRD, user stories, or technical specs — PO owns and approves the PRD

**Writing level:** One PRD per **Module** — saved at `docs/modules/[module-name]/prd.md`

---

## How AI Helps PO

- **Creating and editing the PRD** — use `docs/ai/skills/product-owner/SKILL.md` (invoke `/write-prd [Module-name]`)
- Structuring problem statement, goals, personas, scope, and key product requirements
- Defining high-level acceptance criteria and success metrics in the PRD
- Analyzing PRD completeness and clarity
- Understanding technical constraints (for context only; no technical specs in the PRD)

---

## Documents to Reference

When working with AI, tell it to read:

- **Required:** `docs/ai/skills/product-owner/SKILL.md` — full write-prd skill
- **Required:** `docs/ai/workflows/WORKFLOW-HANDOFF.md` — handoff chain
- **Required:** `docs/modules/template-module/prd.md` — PRD structure (Input Data maps to this)
- `docs/modules/[module-name]/` — Your PRD documents

---

## Output

Your output artifact is the **PRD**:
- Template: `docs/modules/template-module/prd.md`
- Save to: `docs/modules/[module-name]/prd.md`

---

## Common AI Prompts

### Writing PRDs
```
"Help me write a PRD for [Module name].
Use the write-prd skill (docs/ai/skills/product-owner/SKILL.md) and our template.
The module should [describe problem, audience, and goals]."
```

```
"Review this section of my PRD and suggest improvements:
[paste requirement or section]
Check that the requirement and high-level acceptance criteria are clear and testable."
```

### Analyzing Requirements
```
"Read my PRD at docs/modules/[module-name]/prd.md
Tell me:
1. Are my acceptance criteria specific and testable?
2. What edge cases am I missing?
3. Are success metrics measurable?"
```

### Understanding Technical Feasibility
```
"Read docs/ai/rules/developer/01-project-structure.md to understand our technical architecture, then suggest technical constraints I should be aware of for [module description]."
```

### Generating Success Metrics
```
"Based on this module: [describe module]
Suggest 3-5 quantifiable success metrics that we can track after release."
```


---

## Pro Tips

1. **Be specific with context:** Instead of "Help me write a module", say "Help me write a PRD for product bulk editing that allows merchants to update prices for 100+ products at once"
2. **Reference existing docs:** Always tell AI to read `docs/ai/skills/product-owner/SKILL.md` and `docs/modules/template-module/prd.md` so it understands the structure
3. **Iterate:** Start with a rough draft, then ask AI to refine specific sections
4. **Validate with team:** AI can help draft the PRD, but always review and approve before the BSA takes over; align with BSA and Tech Lead as needed
5. **Active voice:** "Users can select products" not "Products may be selected."
6. **Measurable criteria:** e.g., "Completes in < 5 seconds" not "Fast."
7. **Ask clarifying questions** only when critical information is missing — otherwise produce a strong baseline PRD and iterate.

---

## Relation to PO Responsibilities

| PO responsibility | How this skill helps |
|-------------------|----------------------|
| Writing PRDs with clear structure | Generates PRD using the template (Executive Summary → Open Questions) |
| Defining acceptance criteria | Fills Section 6 (Key Product Requirements) with high-level acceptance criteria; BSA expands into testable criteria and user stories |
| Generating success metrics | Section 3 (Goals & Success Metrics) captures business goals, user goals, and KPIs |
| Out of scope and dependencies | Section 5.2 (Out-of-Scope) and Section 8 (Questions for BSA) support clean handoff |

PO owns the PRD from Draft to Final — this skill produces the draft; only the PO may approve and mark Final.

---

## Common Questions

**Q: Can AI write the entire PRD for me?**  
A: AI can generate a solid draft based on your description, but you should always review and refine to match user needs and business goals.

**Q: How do I know if my requirements are clear enough?**  
A: Ask AI to read your PRD and explain the module back to you. If AI misunderstands, your BSA and developers likely will too.


---

## Getting Help

1. Check `docs/ai/skills/product-owner/SKILL.md` for the full write-prd process
2. Look at example PRDs in `docs/modules/template-module/*`
3. Ask your team lead for guidance
4. Suggest new prompts to add to this guide
