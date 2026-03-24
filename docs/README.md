# 📚 Documentation Quick Start Guide

Welcome to the documentation directory! This folder is the central hub for all project documentation, structured to be highly accessible for both human collaborators and AI agents.

---

## 🗂️ Directory Overview

### 1. `ai/` (AI Agent Context & Automation)
Contains configurations, coding rules, and custom skills to help AI agents assist you efficiently.
- **Rules (`ai/rules/`)**: Detailed coding standards, component patterns, API conventions, and testing practices.
- **Skills (`ai/skills/`)**: Custom automation prompts (e.g., generating PRDs, BRDs, or implementations).
- **Workflows (`ai/workflows/`)**: Team collaboration and handoff guides.

### 2. `architecture/` (System Design & Organization)
Provides high-level overviews of the project system, directory structures, and migration histories.
- Read `architecture/STRUCTURE-SUMMARY.md` for a complete breakdown of where everything belongs.
- Contains guides on version management.

### 3. `modules/` (Module & Epic Handoffs & Specs)
Work artifacts organized entirely by module and epic.
- Inside `modules/[module-name]/`, you will find the module-wide PRD (`prd.md`) and BRD (`brd.md`).
- Inside `modules/[module-name]/[epic-name]/`, you will find the complete lifecycle: `01-epic`, `02-technical-spec`, `03-frontend-spec`, `04-develop-spec`, and `05-test-spec`.
- This ensures all context for a functional area remains in one accessible location.

---

## 🚀 Quick Actions

- **Understanding coding standards:** Read through `docs/ai/rules/developer/`.
- **Starting a new module/epic:** Review `docs/ai/workflows/WORKFLOW-HANDOFF.md`, then create a new folder under `docs/modules/`.
- **Using AI Skills:** Try providing one of the commands found in `docs/ai/skills/` to your AI assistant (e.g., `/write-prd [module-name]`).

---

## 🛠️ How to Use This Workflow

When starting a new module or epic, collaborate with your AI assistant using the custom skills provided. Here is the standard end-to-end workflow:

1. **Product Owner (PO): Generate PRD**
   ```bash
   /write-prd [module-name]
   ```
   *Result*: `docs/modules/[module-name]/prd.md`

2. **Business Analyst (BA): Generate BRD & Epic Spec**
   ```bash
   /write-brd [module-name] [epic-name]
   ```
   *Result*: `docs/modules/[module-name]/brd.md` and `docs/modules/[module-name]/[epic-name]/01-epic.md`

3. **Tech Lead: Generate Technical Spec**
   ```bash
   /write-tech-spec [module-name] [epic-name]
   ```
   *Result*: `docs/modules/[module-name]/[epic-name]/02-technical-spec.md`

4. **UX Designer: Design User Flows & Screens** (Phase 1 of Frontend Spec)
   ```bash
   /write-ux-spec [module-name] [epic-name]
   ```
   *Result*: `docs/modules/[module-name]/[epic-name]/03-frontend-spec.md` (Phase 1: Sections 1–7)

5. **UI Developer: Build Components & Mock TSX** (Phase 2 of Frontend Spec, after UX approved)
   ```bash
   /write-frontend-spec [module-name] [epic-name]
   ```
   *Result*: `docs/modules/[module-name]/[epic-name]/03-frontend-spec.md` (Phase 2: Sections 8–14) + mock TSX files

6. **Developer: Implement from Specs**
   ```bash
   /implement-feature [module-name] [epic-name]
   ```
   *Result*: `docs/modules/[module-name]/[epic-name]/04-develop-spec.md`

7. **QA Analyst: Design Test Cases** (before dev starts)
   ```bash
   /design-test-cases [module-name] [epic-name]
   ```
   *Result*: `docs/modules/[module-name]/[epic-name]/05-test-spec.md` (Phase 1)

8. **QA Automation: Execute Tests & Automate** (after dev deploys to SIT)
   ```bash
   /execute-tests [module-name] [epic-name]
   ```
   *Result*: `docs/modules/[module-name]/[epic-name]/05-test-spec.md` (Phase 2)

*For more details on the latest migration and restructuring of AI/Docs files, see `docs/architecture/STRUCTURE-SUMMARY.md`.*
