# Team Collaboration Guide

> **Quick Start**: Read this file first, then see [`docs/ai/workflows/WORKFLOW-HANDOFF.md`](docs/ai/workflows/WORKFLOW-HANDOFF.md) for workflow details.

---

## 🎯 Purpose

This project uses a **structured handoff system** where each role (PO, BA, Designer, Developer, Tester) creates specific documents that get passed to the next role. This ensures:

✅ Clear communication between roles
✅ No missed requirements
✅ Easy onboarding for new team members
✅ AI assistance works better with structured docs

---

## 👥 Team Roles & Responsibilities

### 1. Product Owner (PO)

**What you do**: Define WHAT we're building and WHY
**You create**: PRD (Product Requirements Document)
**You hand off to**: Business Analyst
**Your files**: `docs/modules/[module-name]/{module-name}.md`

### 2. Business Analyst (BA)

**What you do**: Define HOW it works (business rules, data, APIs)
**You create**: BRD (Business Requirements Document)
**You hand off to**: UX Designer + Tech Lead
**Your files**: `docs/modules/[module-name]/{module-name}.md`

### 3. UX Designer

**What you do**: Design user flows, screens, states, interactions, accessibility & responsive concepts
**You create**: Phase 1 of Frontend Spec (`03-frontend-spec.md` Sections 1–7)
**You hand off to**: UI Developer
**Your files**: `docs/modules/[module-name]/[epic]/03-frontend-spec.md` (Phase 1)

### 4. UI Developer

**What you do**: Build component structure, mock TSX files, design tokens, traceability
**You create**: Phase 2 of Frontend Spec (`03-frontend-spec.md` Sections 8–14) + mock TSX
**You hand off to**: Developer + QA Analyst
**Your files**: `docs/modules/[module-name]/[epic]/03-frontend-spec.md` (Phase 2) + `src/app/design-mocks/` (route-based, mirrors production paths)

### 5. Developer (Frontend)

**What you do**: Build the module based on specs
**You create**: Implementation Doc
**You hand off to**: Tester
**Your files**: `docs/modules/[module-name]/[epic]/{module-name}.md`

### 5. Tester / QA

**What you do**: Test module, find bugs, verify requirements
**You create**: Test Report + Bug Reports
**You hand off to**: PO (for approval) + Developer (for bug fixes)
**Your files**:

- `docs/modules/[module-name]/{module-name}.md`
- `docs/modules/[module-name]/bugs/BUG-{number}.md`

---

## 🔄 How Work Flows

```
User Need
    ↓
PO writes PRD → "Here's WHAT users need"                          (/write-prd)
    ↓
BA writes BRD + Epics → "Here's HOW it works (business rules)"    (/write-brd)
    ↓
Tech Lead writes Tech Spec → "Here's the ARCHITECTURE"            (/write-tech-spec)
    ↓
UX Designer designs UX → "Here's the EXPERIENCE (Phase 1)"        (/write-ux-spec)
    ↓
UI Developer builds mocks → "Here's the PROTOTYPE (Phase 2)"      (/write-frontend-spec)
    ↓
Developer implements → "Here's what I BUILT"                       (/implement-feature)
    ↓
QA Analyst designs tests → "Here's what to TEST"                   (/design-test-cases)
    ↓
QA Automation executes → "Here's what PASSED/FAILED"               (/execute-tests)
    ↓
Release (or back to Dev if bugs found)
```

---

## 📂 File Structure

```
docs/
├── ai/                              # 🤖 AI agent documentation
│   ├── workflows/                   # High-level workflow guides
│   │   ├── TEAM-COLLABORATION.md    # This file (read first!)
│   │   └── WORKFLOW-HANDOFF.md      # Complete handoff templates & approval process
│   │
│   ├── roles/                       # Role-specific AI guides
│   │   ├── README.md                # Role overview & quick-start
│   │   ├── product-owner.md         # PO → PRD
│   │   ├── business-analyst.md      # BA → BRD + Epics
│   │   ├── tech-lead.md             # Tech Lead → Technical Spec
│   │   ├── ux-designer.md           # UX Designer → Frontend Spec Phase 1
│   │   ├── ui-developer.md          # UI Developer → Frontend Spec Phase 2 + Mock TSX
│   │   ├── developer.md             # Developer → Implementation + Code
│   │   ├── qa-analyst.md            # QA Analyst → Test Cases (Phase 1)
│   │   └── qa-automation.md         # QA Automation → Test Execution (Phase 2)
│   │
│   ├── skills/                      # Executable skills (/slash-commands)
│   │   ├── commit/SKILL.md          # /commit - Create commits
│   │   ├── write-prd/SKILL.md       # /write-prd - Generate PRD (PO)
│   │   ├── write-brd/SKILL.md       # /write-brd - Generate BRD + Epics (BA)
│   │   ├── write-tech-spec/SKILL.md # /write-tech-spec - Generate Tech Spec (Tech Lead)
│   │   ├── write-ux-spec/SKILL.md   # /write-ux-spec - Design UX (UX Designer)
│   │   ├── write-frontend-spec/SKILL.md  # /write-frontend-spec - Build mocks (UI Developer)
│   │   ├── implement-feature/SKILL.md    # /implement-feature - Implement (Developer)
│   │   ├── design-test-cases/SKILL.md    # /design-test-cases - Design tests (QA Analyst)
│   │   └── execute-tests/SKILL.md        # /execute-tests - Execute tests (QA Automation)
│   │
│   └── rules/                       # Detailed rules per discipline
│       ├── developer/               # Developer coding rules (6 files)
│       │   ├── 01-project-structure.md
│       │   ├── 02-components.md
│       │   ├── 03-api-and-data-fetching.md
│       │   ├── 04-state-and-routing.md
│       │   ├── 05-typescript-conventions.md
│       │   └── 07-nextjs-antd-best-practices.md
│       ├── testing/                 # Testing rules (2 files)
│       │   ├── 06-testing-and-quality.md
│       │   └── testing-ids.md
│       └── ux-designer/             # UX Designer rules (3 files)
│           ├── 01-validation-rules.md   # Global field validation rules
│           ├── 02-ux-ui-patterns.md     # Reusable UX/UI pattern library
│           └── 03-ux-writing.md         # UX Writing & Copy Standards (cross-role)
│
├── shared/                          # 📚 Cross-role shared documentation
│   ├── glossary.md                  # Central UX writing glossary (all UI text)
│   ├── error-handling.md            # Error display patterns & error code catalog
│   └── test-data/                   # Test data per module
│       ├── _template.md             # Template for new modules
│       └── [module]/test-data.md    # e.g. authentication/test-data.md
│
├── modules/                         # 🔥 Main work area (per-module artifacts)
│   ├── template-module/             # Canonical templates
│   │   ├── prd.md
│   │   ├── brd.md
│   │   └── 01-Epic1/
│   │       ├── 01-epic.md
│   │       ├── 02-technical-spec.md
│   │       ├── 03-frontend-spec.md
│   │       ├── 04-develop-spec.md
│   │       └── 05-test-spec.md
│   └── [module-name]/               # Actual module artifacts
│       ├── prd.md                   # PO
│       ├── brd.md                   # BA
│       └── [epic]/
│           ├── 01-epic.md           # BA
│           ├── 02-technical-spec.md # Tech Lead
│           ├── 03-frontend-spec.md  # UX Designer (Phase 1) + UI Developer (Phase 2)
│           ├── 04-develop-spec.md   # Developer
│           └── 05-test-spec.md      # QA Analyst (Phase 1) + QA Automation (Phase 2)
│
└── docs/ai/rules/developer/           # Technical architecture & code standards
```

---

## 🚀 Getting Started

### Step 1: Read Your Role Guide

- **Product Owners**: [`docs/ai/roles/product-owner.md`](docs/ai/roles/product-owner.md)
- **Business Analysts**: [`docs/ai/roles/business-analyst.md`](docs/ai/roles/business-analyst.md)
- **Tech Leads**: [`docs/ai/roles/tech-lead.md`](docs/ai/roles/tech-lead.md)
- **UX Designers**: [`docs/ai/roles/ux-designer.md`](docs/ai/roles/ux-designer.md)
- **UI Developers**: [`docs/ai/roles/ui-developer.md`](docs/ai/roles/ui-developer.md)
- **Developers**: [`docs/ai/roles/developer.md`](docs/ai/roles/developer.md)
- **QA Analysts**: [`docs/ai/roles/qa-analyst.md`](docs/ai/roles/qa-analyst.md)
- **QA Automation**: [`docs/ai/roles/qa-automation.md`](docs/ai/roles/qa-automation.md)

### Step 2: Start Working on Modules

#### For Product Owners

1. Read: [`docs/ai/workflows/WORKFLOW-HANDOFF.md`](docs/ai/workflows/WORKFLOW-HANDOFF.md) (Section 1)
2. See example: [`docs/modules/template-module/prd.md`](docs/modules/template-module/prd.md)
3. Create your PRD:
   ```bash
   cp docs/modules/template-module/prd.md \
      docs/modules/[module-name]/your-module-name.md
   ```
4. Fill in user stories and acceptance criteria
5. Tag BA in Jira/GitHub

### For Business Analysts

1. Read the PRD from PO (in `docs/modules/[module-name]/`)
2. See example: [`docs/modules/template-module/brd.md`](docs/modules/template-module/brd.md)
3. Create your BRD with same filename as PRD
4. Define business rules, data models, APIs
5. Tag UX Designer + Tech Lead

### For Tech Leads

1. Read the BRD + Epic from BA (focus on Section 2, 6, 11, 12, 14)
2. See template: [`docs/modules/template-module/01-Epic1/02-technical-spec.md`](docs/modules/template-module/01-Epic1/02-technical-spec.md)
3. Create technical spec: DB schema, API contracts, sequence diagrams
4. See role guide: [`docs/ai/roles/tech-lead.md`](docs/ai/roles/tech-lead.md)
5. Tag UX Designer + Developer + QA Analyst

### For UX Designers

1. Read BRD + Epic + Tech Spec (after BRD is 🟢 Final)
2. See template: [`docs/modules/template-module/01-Epic1/03-frontend-spec.md`](docs/modules/template-module/01-Epic1/03-frontend-spec.md) (Phase 1 sections)
3. Design user flows, screens, states, interactions, accessibility & responsive concepts
4. Create Figma mockups and add links to Section 1
5. See role guide: [`docs/ai/roles/ux-designer.md`](docs/ai/roles/ux-designer.md)
6. Tag UI Developer (Phase 1 approved, ready for Phase 2)

### For UI Developers

1. Read approved UX Design (Phase 1 of `03-frontend-spec.md`) + Tech Spec
2. See template: [`docs/modules/template-module/01-Epic1/03-frontend-spec.md`](docs/modules/template-module/01-Epic1/03-frontend-spec.md) (Phase 2 sections)
3. Build component structure, mock TSX files, design tokens, traceability
4. See role guide: [`docs/ai/roles/ui-developer.md`](docs/ai/roles/ui-developer.md)
5. Tag QA Analyst + Developer (Phase 2 approved, ready for implementation)

### For QA Analysts

1. Read BRD + Epic + Tech Spec + Frontend Spec (after all are 🟢 Final)
2. See template: [`docs/modules/template-module/01-Epic1/05-test-spec.md`](docs/modules/template-module/01-Epic1/05-test-spec.md)
3. Design test cases (Phase 1 of `05-test-spec.md`) — **before** dev starts
4. See role guide: [`docs/ai/roles/qa-analyst.md`](docs/ai/roles/qa-analyst.md)
5. Tag Developer (test cases ready for reference)

### For Developers

1. Read Tech Spec + Design Spec + Test Cases (05-test-spec.md Phase 1)
2. Read technical docs: [`docs/ai/rules/developer/`](docs/ai/rules/developer/)
3. Implement module
4. Create implementation doc in `docs/modules/[module-name]/[epic]/`
5. Deploy to staging and tag QA Automation

### For QA Automation

1. Read test cases (Phase 1 of `05-test-spec.md`) + implementation doc (`04-develop-spec.md`)
2. Execute tests on SIT environment
3. Record results, file bugs in `docs/modules/[module-name]/bugs/`
4. Generate automation scripts (Playwright)
5. See role guide: [`docs/ai/roles/qa-automation.md`](docs/ai/roles/qa-automation.md)
6. Tag stakeholders for approval

---

## ⚡ Quick Tips

### ✅ DO:

- **Always read previous role's document** before starting work
- **Ask questions** if requirements are unclear (tag previous role)
- **Use the examples** as templates (see EXAMPLE-\* files)
- **Keep documents updated** if requirements change
- **Link related documents** (PRD → BRD → Design → Implementation)

### ❌ DON'T:

- Don't skip creating handoff documents (even for small modules)
- Don't assume - if unclear, ask!
- Don't hand off incomplete work without documenting what's missing
- Don't forget to tag the next role when you're done

---

## 🆘 Help & Questions

### "I'm new to the team, where do I start?"

1. Read this file (TEAM-COLLABORATION.md) - you're here! ✅
2. Read your role guide: [`docs/ai/roles/`](docs/ai/roles/)
3. Read [`docs/ai/workflows/WORKFLOW-HANDOFF.md`](docs/ai/workflows/WORKFLOW-HANDOFF.md)
4. Look at EXAMPLE files in [`docs/modules/`](docs/modules/)
5. Ask your team lead for a recent completed module to study

### "I received incomplete handoff docs"

- Tag the previous role with specific questions
- Document what's missing in your own handoff doc
- Don't block yourself - proceed with what you have and flag unknowns

### "My role isn't listed (DevOps, Backend, etc.)"

This system is designed for **frontend module development**. Backend devs should:

- Read BRDs from BA to understand API requirements
- Create API docs that Frontend devs reference
- You can create `docs/modules/backend/` for your docs

---

## 📚 Detailed Documentation

- **Role Guides**: [`docs/ai/roles/`](docs/ai/roles/) - How each role uses AI
- **Workflow Guide**: [`docs/ai/workflows/WORKFLOW-HANDOFF.md`](docs/ai/workflows/WORKFLOW-HANDOFF.md) - Complete templates and examples
- **Shared Glossary**: [`docs/shared/glossary.md`](docs/shared/glossary.md) - Central UX writing glossary
- **Error Handling**: [`docs/shared/error-handling.md`](docs/shared/error-handling.md) - Error display patterns
- **UX Writing Rule**: [`docs/ai/rules/ux-designer/03-ux-writing.md`](docs/ai/rules/ux-designer/03-ux-writing.md) - Cross-role UX writing standards (message templates, tone, glossary-first workflow)
- **Technical Arch**: [`docs/ai/rules/developer/`](docs/ai/rules/developer/) - For developers (API, routing, state management)

---

## 🎓 Learning Path

**Week 1**: Read documentation and examples
**Week 2**: Shadow someone in your role for 1 module
**Week 3**: Lead a module with mentorship
**Week 4**: Fully autonomous on modules

---

## 🔗 External Tools

- **Jira/Linear**: Project management and sprint planning
- **Figma**: Design mockups and prototypes
- **GitHub**: Code repository and pull requests
- **Slack**: Real-time communication (but document in `docs/modules/`!)

---

## 📝 Feedback

Have suggestions to improve this system?

- Create a GitHub issue
- Tag #process-improvement in Slack
- Talk to your team lead

---

**Last Updated**: 2024-03-02
**Maintained By**: Engineering Team
