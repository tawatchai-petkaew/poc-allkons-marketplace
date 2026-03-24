# docs Directory Structure Summary

**Last Updated**: 2024-03-03

---

## 📋 Quick Reference

This document provides a complete overview of the `docs/` directory structure after all migrations and reorganizations.

---

## 🗂️ Complete Directory Tree

```
docs/
├── README.md                           # Directory navigation index
├── TEAM-COLLABORATION.md               # Team collaboration guide
├── VERSION-MANAGEMENT-GUIDE.md         # How to handle version changes
├── MIGRATION-SUMMARY.md                # First migration (PROJECT.md → .cursorrules / project rules)
├── AI-DOCS-MIGRATION.md               # Second migration (ai_docs → docs)
├── HANDOFF-MIGRATION.md                # Third migration (document-type → module-based)
├── STRUCTURE-SUMMARY.md                # This file
│
├── skills/                             # Custom automation skills (FLAT STRUCTURE)
│   ├── commit/
│   │   └── SKILL.md                    # /commit - Git commit automation
│   ├── write-prd/
│   │   └── SKILL.md                    # /write-prd - Generate PRD
│   ├── write-brd/
│   │   └── SKILL.md                    # /write-brd - Generate BRD
│   ├── write-ux-spec/
│   │   └── SKILL.md                    # /write-ux-spec - UX Design (UX Designer)
│   ├── write-frontend-spec/
│   │   └── SKILL.md                    # /write-frontend-spec - Frontend Spec + Mock TSX (UI Developer)
│   ├── implement-feature/
│   │   └── SKILL.md                    # /implement-feature - Generate Implementation
│   ├── design-test-cases/
│   │   └── SKILL.md                    # /design-test-cases - Design Test Cases (QA Analyst)
│   └── execute-tests/
│       └── SKILL.md                    # /execute-tests - Execute Tests & Automate (QA Automation)
│
├── roles/                              # Role-specific guides
│   ├── README.md
│   ├── product-owner.md
│   ├── business-analyst.md
│   ├── ux-designer.md
│   ├── ui-developer.md
│   ├── developer.md
│   ├── qa-analyst.md
│   └── qa-automation.md
│
├── docs/                               # Reference documentation
│   ├── CODE-STANDARDS.md              # Tech stack overview (from ai_docs)
│   ├── WORKFLOW-HANDOFF.md            # Complete workflow templates
│   └── QUICK-REFERENCE.md             # Quick lookup guide
│
├── rules/                              # Detailed coding rules
│   ├── developer/                      # Developer-specific (from ai_docs)
│   │   ├── 01-project-structure.md
│   │   ├── 02-components.md
│   │   ├── 03-api-and-data-fetching.md
│   │   ├── 04-state-and-routing.md
│   │   ├── 05-typescript-conventions.md
│   │   └── 07-nextjs-antd-best-practices.md
│   └── testing/                        # Testing rules (from ai_docs)
│       ├── 06-testing-and-quality.md
│       └── testing-ids.md
│
├── handoffs/                           # Work artifacts (MODULE-BASED)
│   ├── README.md                       # Handoff workflow guide
│   ├── features/                       # Module-based organization
│   │   └── [module-name]/            # Each module has own folder
│   │       ├── 01-prd.md              # Product Owner → BA
│   │       ├── 02-brd.md              # BA → Designer + Dev
│   │       ├── 03-design.md           # Designer → Dev
│   │       ├── 04-implementation.md   # Dev → Tester
│   │       ├── 05-test-plan.md        # Tester → Team
│   │       └── history/               # Archived versions (v2.0+ only)
│   ├── bugs/                           # Bug reports
│   │   └── EXAMPLE-BUG-001-selection-cleared.md
│   └── examples/                       # Reference examples
│       ├── product-bulk-edit/         # Shows normal evolution (v1.0 → v1.1)
│       │   ├── 01-prd.md
│       │   ├── 02-brd.md
│       │   └── 03-design.md
│       └── inventory-sync/            # Shows major rewrite (v1.0 → v2.0)
│           ├── 01-prd.md              # Current v2.0
│           ├── history/
│           │   └── 01-prd-v1.0-manual-sync.md  # Archived v1.0
│           └── README.md
│
├── templates/                          # File templates
│   ├── README.md
│   └── *.local-template.md             # Optional personal settings template
│
├── agents/                             # Custom agents (future)
├── tasks/                              # Task definitions (future)
└── memory/                             # Auto memory (gitignored)
```

Project-level rules: `.cursorrules` at repo root; detailed rules: `docs/ai/rules/developer/`.

---

## 📊 File Count by Type

| Type                 | Count    | Purpose                                              |
| -------------------- | -------- | ---------------------------------------------------- |
| **Skills**           | 6 active | Automation commands (/write-prd, /write-brd, etc.)   |
| **Role Guides**      | 5        | How each role uses AI assistant                      |
| **Documentation**    | 3        | Reference docs (CODE-STANDARDS, WORKFLOW, QUICK-REF) |
| **Developer Rules**  | 6        | Detailed coding standards                            |
| **Testing Rules**    | 2        | Test conventions                                     |
| **Handoff Examples** | 3        | product-bulk-edit, inventory-sync, bug example       |
| **Migration Docs**   | 4        | History of changes                                   |
| **Total Files**      | ~40      | Complete documentation system                        |

---

## 🎯 Purpose of Each Section

### **Root Files**

- `.cursorrules` (repo root) and `docs/ai/rules/developer/01-project-structure.md` - Technical architecture
- `*.local.md` - Personal settings (optional, create from template if needed)
- `docs/README.md` and this STRUCTURE-SUMMARY - Guide for non-developers
- `TEAM-COLLABORATION.md` - Team collaboration system explanation
- `VERSION-MANAGEMENT-GUIDE.md` - How to track requirement changes
- `README.md` - Quick navigation index

### **skills/**

Custom automation commands (FLAT STRUCTURE - no role folders):

| Skill             | Command                             | Who Uses         |
| ----------------- | ----------------------------------- | ---------------- |
| Write PRD         | `/write-prd [module-name]`         | Product Owner    |
| Write BRD         | `/write-brd [module-name]`         | Business Analyst |
| Write UX Spec     | `/write-ux-spec [module] [epic]`     | UX Designer      |
| Write Frontend Spec | `/write-frontend-spec [module] [epic]` | UI Developer |
| Implement Module  | `/implement-feature [module-name]` | Developer        |
| Design Test Cases | `/design-test-cases [module] [epic]` | QA Analyst       |
| Execute Tests     | `/execute-tests [module] [epic]`     | QA Automation    |
| Commit            | `/commit`                           | Everyone         |

**Why flat?** AI assistant discovers skills at `docs/ai/skills/[skill-name]/SKILL.md`

### **roles/**

Guides for how each role uses AI assistant:

- Common prompts for each role
- What documents to reference
- Workflow patterns
- Tips and best practices

### **docs/**

Reference documentation:

- `CODE-STANDARDS.md` - Tech stack, general conventions (overview)
- `WORKFLOW-HANDOFF.md` - Complete workflow with all templates
- `QUICK-REFERENCE.md` - Quick lookup tables and diagrams

### **rules/**

Detailed coding standards (load contextually):

- `developer/` - 6 files covering project structure, components, API, state, TypeScript, Next.js
- `testing/` - 2 files covering testing practices and test ID conventions

### **handoffs/** (MODULE-BASED ORGANIZATION)

Work artifacts organized by module, not document type:

**Structure**:

- `features/[module-name]/` - All documents for a module in one place
  - `01-prd.md` - Product Owner → Business Analyst
  - `02-brd.md` - Business Analyst → Designer + Developer
  - `03-design.md` - Designer → Developer
  - `04-implementation.md` - Developer → Tester
  - `05-test-plan.md` - Tester → Team
  - `history/` - Archived versions (only for major rewrites)

**Benefits**:

- ✅ Complete story in one place
- ✅ Easy progress tracking (which phase is module at?)
- ✅ Better context (read all related docs without jumping)
- ✅ Simple archiving (move entire folder when done)

**Version Management**:

- Changelog table in each document tracks changes
- Small changes (v1.0 → v1.1): Update changelog only
- Major rewrites (v1.0 → v2.0): Archive old version to `history/`

---

## 📚 Key Conventions

### File Naming

- Shared docs: `UPPERCASE.md` (e.g., `README.md`, `STRUCTURE-SUMMARY.md`)
- Personal files: `*.local.md` (auto-gitignored)
- Role guides: `lowercase-hyphen.md`
- Rules: `##-descriptive-name.md`
- Handoffs: `##-document-type.md` (inside module folders)

### Directory Organization

- **Skills**: Flat structure at `docs/ai/skills/[skill-name]/`
- **Handoffs**: Module-based at `docs/modules/[module-name]/`
- **Rules**: By role at `docs/ai/rules/[role]/`
- **Docs**: By type at `docs/docs/`

### Gitignore Pattern

- `*.local.*` files are auto-gitignored
- Explicitly listed in `.gitignore` for clarity
- `memory/` directory is auto-created and gitignored

---

## 🎓 Learning Path

### For New Team Members

1. Read `TEAM-COLLABORATION.md` (team system overview)
2. Read `docs/README.md` (navigation and overview)
3. Read `.cursorrules` and `docs/ai/rules/developer/01-project-structure.md` (technical architecture)
4. Read `roles/[your-role].md` (role-specific guide)
5. Create optional `*.local.md` from template if needed (personal settings)
6. Review `docs/ai/rules/developer/` (tech stack and standards)
7. Browse `rules/[your-role]/` (detailed standards)

### For Non-Developers (PO, BA, Designer, Tester)

1. **Start here**: `docs/README.md` (explains structure and where to read)
2. **Team workflow**: `TEAM-COLLABORATION.md`
3. **Your role**: `roles/[your-role].md`
4. **Handoff examples**: `handoffs/examples/product-bulk-edit/`
5. **Try a skill**: `/write-prd test-module` or `/write-brd test-module`

### For Developers

1. **Architecture**: `.cursorrules` and `docs/ai/rules/developer/01-project-structure.md`
2. **Standards**: `docs/ai/rules/developer/`
3. **Detailed Rules**: `rules/developer/*.md` (all 6 files)
4. **Skills**: Try `/implement-feature` on a small task

### For Testers

1. **Architecture**: `.cursorrules` and `docs/ai/rules/developer/01-project-structure.md` (understand the system)
2. **Testing Rules**: `rules/testing/*.md`
3. **Workflow**: `docs/WORKFLOW-HANDOFF.md` (Section 5)
4. **Skills**: Try `/design-test-cases` to design test cases, `/execute-tests` to execute

---

## 🚀 Common Tasks

### "I'm starting a new module"

```bash
# PO: Generate PRD
/write-prd module-name
# Result: docs/modules/module-name/prd.md

# BA: Generate BRD from PRD
/write-brd module-name
# Result: docs/modules/module-name/brd.md

# UX Designer: Design user flows, screens, states
/write-ux-spec module-name epic-name
# Result: docs/modules/module-name/epic-name/03-frontend-spec.md (Phase 1)

# UI Developer: Build components, mock TSX, design tokens
/write-frontend-spec module-name epic-name
# Result: docs/modules/module-name/epic-name/03-frontend-spec.md (Phase 2) + mock TSX

# Dev: Implement from Tech Spec + Frontend Spec
/implement-feature module-name epic-name
# Result: docs/modules/module-name/epic-name/04-develop-spec.md

# QA: Generate test cases
/design-test-cases module-name epic-name
# Result: docs/modules/module-name/epic-name/05-test-spec.md (Phase 1)

# QA Automation: Execute tests after dev deploys
/execute-tests module-name epic-name
# Result: docs/modules/module-name/epic-name/05-test-spec.md (Phase 2)
```

### "Requirements changed, need to update"

```bash
# 1. Read VERSION-MANAGEMENT-GUIDE.md
# 2. Decide: Small change (v1.0 → v1.1) or Major rewrite (v1.0 → v2.0)?
# 3. Small: Update changelog table in document
# 4. Major: Archive old version to history/ folder, create new version
```

### "I need coding standards"

```
# Overview
"Read docs/ai/rules/developer/01-project-structure.md"

# Specific topic
"Read docs/ai/rules/developer/02-components.md"
```

### "I need to understand the workflow"

```
# Quick overview
"Read docs/docs/QUICK-REFERENCE.md"

# Complete details
"Read docs/ai/workflows/WORKFLOW-HANDOFF.md"
```

---

## 🔍 Finding Information

| I need...              | Look here...                                           |
| ---------------------- | ------------------------------------------------------ |
| Project architecture   | `docs/ai/rules/developer/01-project-structure.md`   |
| Non-developer guide    | `docs/README.md`                                    |
| Tech stack overview    | `docs/ai/rules/developer/01-project-structure.md`   |
| Component patterns     | `docs/ai/rules/developer/02-components.md`             |
| API integration        | `docs/ai/rules/developer/03-api-and-data-fetching.md`  |
| TypeScript conventions | `docs/ai/rules/developer/05-typescript-conventions.md` |
| Test ID naming         | `docs/ai/rules/testing/testing-ids.md`                 |
| Workflow templates     | `docs/ai/workflows/WORKFLOW-HANDOFF.md`                |
| Role-specific tips     | `docs/ai/roles/[role].md`                              |
| Custom skills          | `docs/ai/skills/`                                      |
| Module examples        | `docs/modules/examples/`                           |
| Version management     | `docs/architecture/VERSION-MANAGEMENT-GUIDE.md`                  |

---

## ✅ What's Committed vs Gitignored

### ✅ Committed to Git (Shared)

- `.cursorrules` - Project rules (repo root); `docs/ai/rules/` - Detailed standards
- `skills/` - Custom team skills
- `roles/` - Role guides
- `docs/` - Reference documentation
- `rules/` - Coding standards
- `handoffs/` - Work artifacts
- `templates/` - File templates
- All README and migration docs

### ❌ Gitignored (Personal)

- `*.local.md` - Personal settings
- `settings.local.json` - Personal config
- `memory/` - Auto memory
- `worktrees/` - Temporary files

---

## 📝 Maintenance

### Adding New Content

- **New skill**: Create `docs/ai/skills/[skill-name]/SKILL.md` (flat structure!)
- **New rule**: Add to appropriate `rules/[role]/` directory
- **New doc**: Add to `docs/` with descriptive name
- **New role**: Create `roles/[role].md` and update role guides
- **New module**: Use `/write-prd [module-name]` to auto-create folder

### Updating Existing

- Keep `.cursorrules` concise; put detailed rules in `docs/ai/rules/developer/`
- Update role guides when adding new skills
- Add examples to handoffs for reference
- Update this STRUCTURE-SUMMARY.md when major changes
- Use changelog tables for tracking document versions

### Important Notes

- **Skills must be flat**: `docs/ai/skills/[skill-name]/`, NOT `docs/ai/skills/[role]/[skill-name]/`
- **Handoffs are module-based**: `docs/modules/[module-name]/`, NOT by document type
- **Version history sparse**: Only create `history/` folder for major rewrites (v2.0+), not enhancements

---

## 📜 Migration History

1. **First Migration** (`MIGRATION-SUMMARY.md`) - PROJECT.md → .cursorrules / project rules
2. **Second Migration** (`AI-DOCS-MIGRATION.md`) - ai_docs/ → docs/ai/rules/
3. **Third Migration** (`HANDOFF-MIGRATION.md`) - Document-type → Module-based organization
4. **Fourth Update** (2024-03-03) - Skills flattened from role folders to flat structure

---

**Maintained by**: Engineering Team
**Questions?**: See `docs/ai/workflows/TEAM-COLLABORATION.md`
