# UI Developer Guide - Using AI Assistant

**Role scope:** The UI Developer operates after UX Design (Phase 1 of `03-frontend-spec.md`) is approved. The approved UX spec and `02-technical-spec.md` are treated as upstream truth. The UI Developer produces Phase 2 of the Frontend Specification — component structure, mock TSX files, design tokens, form validation rules, and traceability matrix. The UI Developer does **not** design user flows or interaction patterns — that is the UX Designer's responsibility (see `docs/ai/roles/ux-designer.md`).

> **Executable skill:** For the step-by-step frontend spec + mock generation process, run `/write-frontend-spec [module-name] [epic-name]` — see `docs/ai/skills/write-frontend-spec/SKILL.md`.

---

## 🎯 How AI Can Help You

As a UI Developer, AI can assist with:

- ✅ Generating component structure from UX design (`/write-frontend-spec`)
- ✅ Creating mock TSX files in real Next.js routes for live preview
- ✅ Suggesting Ant Design components with correct project wrappers
- ✅ Implementing responsive breakpoints with Tailwind
- ✅ Building form validation with error feedback
- ✅ Creating traceability from US-xx → Components → Screens → States
- ✅ Generating design tokens from `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` theme

---

## 🧠 UI Developer Cognitive Protocol

### Purpose

The UI Developer bridges UX design and implementation — translating user flows, screens, and state designs into real React/Next.js components, mock routes, and a technical frontend specification that the Developer can implement.

### Core Competencies

| Competency | Key Skills |
|------------|-----------|
| **Component Architecture** | React component hierarchy, props design, state management |
| **Ant Design + Tailwind** | Correct component usage, project wrappers, responsive classes |
| **Mock Prototyping** | `useState` toggles, mock data, live preview routes |
| **Design Token Implementation** | Colors, typography, spacing from `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` theme |
| **Traceability** | US-xx → Component → Screen → States → FR-xxx mapping |

### Cognitive Protocol

A 3-step systematic framework:

| Step | Name                         | Purpose                                                                 | Applied In                     |
| ---- | ---------------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| 1    | Component Mapping            | Map UX screens/states to React components, identify reusable wrappers   | Step 3: Analyze UX Spec        |
| 2    | Mock Implementation          | Create TSX files with all states togglable, form validation, responsive | Step 4: Generate Frontend Spec |
| 3    | Traceability & Quality Audit | Verify every component maps to US-xx, correct props, accessibility      | Step 5: Validation             |

### Mandatory Thinking Triggers

**Rule:** UI Developer must always ask internally at every stage:

- Am I **reusing an existing component** from `src/components/` before creating a new one?
- Does every component **trace back to a US-xx or FR-xxx**?
- Am I using the **correct props** for custom components (`Button` uses `color` not `type`)?
- Is the mock rendering the **default happy-path** state realistically (no debug panels, no state toggles)?
- Is the mock at `src/app/design-mocks/` (public, no login required)?
- Have I applied **design tokens** from `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` (not hardcoded values)?
- Are **Tailwind breakpoints** correct for responsive behavior?
- Have I verified all **UI text matches** `docs/shared/glossary.md`? (no rogue Thai strings)
- Have I **created/updated** `docs/shared/test-data/[module]/test-data.md` from `mockData.ts` + epic validation rules?
- Am I using the correct **app context**? (buyer/seller use Ant Design, startup-partner uses custom design system)
- Does my mock use the **shared layout** from MODULE-UX-OVERVIEW.md?
- Have I updated the **component registry** with new shared components?
- Are all colors from **design tokens** (not hardcoded hex)?
- Have I created **Storybook stories** for new components? (startup-partner-platform)
- Is the visual style consistent with the **Visual Theme Direction** from APP-CONTEXT-GUIDE.md?

### Prototype Continuity Rules

Mocks must feel like one unified app, not isolated pages:

1. **Shared Layout**: Every mock page must use the module's shared layout (sidebar, header, breadcrumbs) from `_shared/[module]/layout.tsx`
2. **Working Navigation**: Links between mock pages must use `router.push()` to navigate to other mock pages in the same module — not placeholder buttons or `alert()`
3. **Consistent Spacing**: Use the same container widths, padding, and margins as other epics in the module
4. **State Continuity**: If a user completes flow A (Epic 1) and enters flow B (Epic 2), the mock should show a realistic transition
5. **Visual Consistency**: Shadow depth, border radius, card styles, and typography must be consistent across all epics in the module

---

## 📚 Documents You Should Reference

When working with AI, tell it to read:

- `docs/architecture/APP-CONTEXT-GUIDE.md` — Which app context, component system, and **Visual Theme Direction**
- `docs/architecture/registries/[app]-components.md` — Complete component catalog and design system structure for the target app
- `docs/modules/[module-name]/MODULE-UX-OVERVIEW.md` — Shared layout, navigation pattern for prototype continuity
- `docs/modules/[module-name]/[epic]/03-frontend-spec.md` - Phase 1 (UX spec, MUST be approved)
- `docs/modules/[module-name]/[epic]/02-technical-spec.md` - Tech spec (API endpoints, data models)
- `docs/modules/[module-name]/[epic]/01-epic.md` - Epic (Section 2: User Stories for traceability)
- `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` - Ant Design config, theme, design tokens
- `docs/ai/rules/developer/01-project-structure.md` - Technical architecture (proxy pattern, tech stack)
- `docs/ai/rules/developer/` - **Detailed coding rules** (same as Developer role):
  - `01-project-structure.md` - Project organization
  - `02-components.md` - Existing component patterns and correct props
  - `03-api-and-data-fetching.md` - API integration patterns (for mock data structure)
  - `04-state-and-routing.md` - State management & routing
  - `05-typescript-conventions.md` - TypeScript best practices
  - `07-nextjs-antd-best-practices.md` - Next.js & Ant Design patterns
- `docs/shared/glossary.md` - Central UX writing glossary (UI text consistency)
- `docs/shared/error-handling.md` - Error display patterns and error code catalog
- `docs/ai/rules/ux-designer/03-ux-writing.md` - UX Writing & Copy Standards (all hardcoded strings must match glossary)
- `docs/ai/rules/ux-designer/01-validation-rules.md` - Global field validation rules
- `docs/ai/rules/ux-designer/02-ux-ui-patterns.md` - Reusable UX/UI pattern library

---

## 📝 Output Template (What You Produce)

Your output artifact is **Phase 2 of the Frontend Specification** (Sections 8–14) + **mock TSX files**. You update the existing file:

- Template: `docs/modules/template-module/01-Epic1/03-frontend-spec.md` (Phase 2 sections)

Update in-place:

- `docs/modules/[module-name]/[epic]/03-frontend-spec.md`

Also create:
- `src/app/design-mocks/[production-route]/page.tsx` + `_shared/[module]/mockData.ts` (route-based, mirroring production paths)

### Phase 2 Sections

| # | Section | Key Content |
|---|---------|-------------|
| 8 | Component Structure | Per component: mock location, target path, Maps to US-xx, reused wrappers, props |
| 9 | Mock Frontend Files | Directory tree, live preview URL, mock requirements |
| 10 | Design Tokens | Colors, typography, responsive breakpoints from `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` |
| 11 | Form Validation Rules | Per field: rules from Epic BR-xxx, error messages, mock behavior |
| 12 | Traceability Matrix | US-xx → Component → Screen → States → FR-xxx |
| 13 | Developer Handoff Notes | Mock-to-implementation steps, testing checklist |
| 14 | Questions for Developer | Open questions |

> **Note:** Phase 1 (Sections 1–7: UX design) is produced by **UX Designer** — see `docs/ai/roles/ux-designer.md`. Do **not** modify UX design sections — only fill Phase 2.

---

## 💬 Common AI Prompts

### Analyzing UX Spec for Components

```
"Read the UX spec at docs/modules/[module-name]/[epic]/03-frontend-spec.md (Phase 1)

For each screen in the Screen Inventory (Section 2):
1. What React components are needed?
2. Which existing components from src/components/ can be reused?
3. What new components need to be created?
4. What props does each component need?

Check docs/ai/rules/developer/02-components.md for existing wrappers."
```

### Creating Mock TSX

```
"Based on the UX spec at docs/modules/[module-name]/[epic]/03-frontend-spec.md (Phase 1):

Create mock TSX files at src/app/design-mocks/[production-route]/page.tsx

Requirements:
- Import from @/components/ for existing wrappers
- Render default happy-path state (no debug panels, no state toggles)
- Use router.push() for navigation (not alert())
- Include form validation from Section 7 (Validation UX)
- Follow docs/ai/rules/developer/06-nextjs-antd-best-practices.md for Ant Design + Tailwind patterns"
```

### Choosing Components

```
"For this UI requirement from the UX spec: [describe]
What Ant Design components should I use?
Read docs/ai/rules/developer/06-nextjs-antd-best-practices.md for our design system and
docs/ai/rules/developer/02-components.md for existing wrappers.

Show me:
- Component names
- Correct props (Button uses 'color' not 'type')
- Import paths (@/components/ vs antd)"
```

### Building Traceability Matrix

```
"Read:
1. docs/modules/[module-name]/[epic]/01-epic.md (Section 2: User Stories)
2. docs/modules/[module-name]/[epic]/03-frontend-spec.md (Phase 1 + my Phase 2 components)

Build a traceability matrix:
| User Story | Component | Screen | States Covered | FR Reference |

Every US-xx must appear at least once."
```

### Responsive Implementation

```
"The UX spec defines these responsive concepts:
- Desktop: [description]
- Tablet: [description]
- Mobile: [description]

Translate to Tailwind breakpoints and implement in the mock TSX.
Use mobile-first approach."
```

---

## 🔄 Typical Workflow

### Stage 1: Analyze UX Spec → Cognitive Protocol Step 1

**Key UI Developer decisions:**

- Which components already exist in `src/components/`?
- What new components are needed?
- What props and state management pattern to use?

**Done when:** Component list mapped from UX screens with reuse plan.

### Stage 2: Build Mock + Spec → Cognitive Protocol Step 2

**Key UI Developer decisions:**

- Are all states togglable in the mock?
- Is the mock at `src/app/design-mocks/` (public, no login required)?
- Do mock paths mirror production routes (not docs folder structure)?
- Are design tokens from `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` applied?
- Is form validation implemented?

**Done when:** Mock TSX live at preview URL, Phase 2 sections filled.

### Stage 3: Validate → Cognitive Protocol Step 3

**Key UI Developer decisions:**

- Does every component map to US-xx?
- Are correct props used for custom wrappers?
- Is the traceability matrix complete?
- Can Developer implement from handoff notes?

**Done when:** All validation checks pass, mock reviewed.

---

## 📋 Quality Checklist

Before marking Phase 2 as approved, verify:

```
"Review my frontend spec at docs/modules/[module-name]/[epic]/03-frontend-spec.md (Phase 2)

Verify:
- [ ] All 7 Phase 2 sections present (8–14)
- [ ] Every component has 'Maps to: US-xx' reference
- [ ] Existing components reused from src/components/ (Button, Typography, etc.)
- [ ] Correct props for custom components (Button uses 'color' not 'type')
- [ ] Mock TSX exists at design-mocks/[production-route]/page.tsx (route-based)
- [ ] Default happy-path rendered (no debug panel, no state toggles)
- [ ] Design tokens from docs/ai/rules/developer/06-nextjs-antd-best-practices.md applied (not hardcoded colors)
- [ ] Responsive breakpoints implemented with Tailwind
- [ ] Form validation matches UX spec Section 7 rules
- [ ] Traceability Matrix covers all US-xx from 01-epic.md
- [ ] Developer Handoff Notes include mock-to-implementation steps

What's missing?"
```

---

## 💡 Pro Tips

### 1. Component Reuse First

```
"Before creating any new component:
1. Search src/components/ for existing wrappers
2. Check docs/ai/rules/developer/02-components.md for patterns
3. Use @/components/Button, Typography, Label, Card etc.
4. Only use raw Ant Design if no wrapper exists"
```

### 2. Realistic Mock — No Debug Panel

```
"In page.tsx, render the default happy-path state directly.
Handle loading/error internally with realistic patterns (Skeleton, Alert).
Use router.push() for navigation — never alert().
Do NOT add debug panels, state toggle checkboxes, or device indicators.
The mock should look and behave like the real web app."
```

### 3. Design Tokens from Theme

```
"Never hardcode colors. Use:
- Ant Design theme tokens from docs/ai/rules/developer/06-nextjs-antd-best-practices.md
- Tailwind classes for spacing/layout
- CSS variables for custom values

Check docs/ai/rules/developer/06-nextjs-antd-best-practices.md 'Ant Design Configuration' section."
```

---

## 🆘 Common Questions

**Q: What's the difference between UX Designer and UI Developer?**
A: UX Designer designs **user flows, screens, states, and interactions** (Phase 1) from specs. UI Developer **implements components, writes mock TSX, and builds the prototype** (Phase 2) from the UX design.

**Q: What if Phase 1 UX design is incomplete?**
A: Do NOT design new flows or states. Ask UX Designer to update Phase 1 first using `/write-ux-spec`. UI Developer only implements what UX Designer designed.

**Q: Should I write the final production code?**
A: No. You create **mock TSX** in `design-mocks/` routes. The Developer will move components to production routes and replace mock state with real API calls.

**Q: What if an Ant Design component doesn't match the UX design?**
A: Document it in Section 14 "Questions for Developer" and propose the closest alternative. Consult with Tech Lead on feasibility.

**Q: How do I handle state management in mocks?**
A: Use `useState` for simple toggles. No need for Zustand or React Query in mocks — that's for the Developer to implement.

---

## 📞 Getting Help

If you're stuck:
1. Read `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` for Ant Design config
2. Check `docs/ai/rules/developer/02-components.md` for existing component patterns
3. Check template: `docs/modules/template-module/01-Epic1/03-frontend-spec.md` (Phase 2)
4. Review UX spec (Phase 1) for design intent
5. Apply the UI Developer Cognitive Protocol (3-step framework)
6. Use the Mandatory Thinking Triggers to identify blind spots
7. Add useful prompts you discover to this guide!
