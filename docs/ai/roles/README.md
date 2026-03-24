# Role-Specific AI Assistant Guides

This directory contains guides for how each team role can effectively use AI assistants.

## Available Guides

- [**Product Owner**](product-owner.md) - Writing PRDs, requirements analysis
- [**Business Analyst**](business-analyst.md) - Creating BRDs, data modeling, API specs
- [**Tech Lead**](tech-lead.md) - Technical specifications, DB schema, API contracts, architecture
- [**UX Designer**](ux-designer.md) - User flows, screens, states, interactions, accessibility & responsive concepts
- [**UI Developer**](ui-developer.md) - Component structure, mock TSX, design tokens, form validation, traceability
- [**Developer**](developer.md) - Implementation, code generation, debugging
- [**QA Analyst**](qa-analyst.md) - Test case design, requirement coverage, test planning
- [**QA Automation**](qa-automation.md) - Test execution, bug reporting, automation scripts

## How to Use

1. **Read your role's guide** to understand how AI can help you
2. **Reference these guides** when working with AI on modules

## Example Workflow

```
1. PO creates PRD → Uses prompts from product-owner.md
2. BA reads PRD → Uses prompts from business-analyst.md to generate BRD
3. Tech Lead reads BRD + Epic → Uses prompts from tech-lead.md for technical spec
4. UX Designer reads BRD + Epic + Tech Spec → Uses prompts from ux-designer.md for UX design (Phase 1)
   (Tech Lead and UX Designer can work in parallel after BSA approval)
5. UI Developer reads UX Spec + Tech Spec → Uses prompts from ui-developer.md for frontend spec + mock TSX (Phase 2)
6. QA Analyst reads specs → Uses prompts from qa-analyst.md to design test cases (before dev)
   (QA Analyst can work in parallel with Developer)
7. Developer reads Tech Spec + Frontend Spec → Uses prompts from developer.md to implement
8. QA Automation reads test cases + deploy → Uses prompts from qa-automation.md to execute & automate
```

## Personal vs Shared

| File | Personal or Shared? | Purpose |
|------|---------------------|---------|
| `docs/ai/roles/*.md` | 👥 Shared (committed) | Role guides |
| `docs/ai/rules/developer/` | 👥 Shared (committed) | Technical docs & coding standards |

## Contributing

If you discover helpful AI prompts for your role, please add them to your role's guide!
