---
name: write-frontend-spec
description: Generate Frontend Specification (Phase 2) with component structure, mock TSX files, design tokens, and traceability from approved UX Design
---

# Write Frontend Spec

Generates Phase 2 of the Frontend Specification (`03-frontend-spec.md`) — component structure, mock TSX files, design tokens, form validation rules, and traceability matrix — from approved UX Design (Phase 1).

**Role scope:** The UI Developer operates after UX Design (Phase 1) is approved. The approved UX spec, `02-technical-spec.md`, and `docs/ai/rules/developer/` are treated as upstream truth. The UI Developer does **not** design user flows or interaction patterns — that is the UX Designer's responsibility.

> **Role guide:** See `docs/ai/roles/ui-developer.md` for prompts, workflow, and quality checklist. Output template: `docs/modules/template-module/01-Epic1/03-frontend-spec.md` (Phase 2 sections).

---

## UI Developer Cognitive Protocol

A 3-step systematic framework:

| Step | Name                         | Purpose                                                                 | Applied In                     |
| ---- | ---------------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| 1    | Component Mapping            | Map UX screens/states to React components, identify reusable wrappers   | Step 3: Analyze UX Spec        |
| 2    | Mock Implementation          | Create TSX files with all states togglable, form validation, responsive | Step 4: Generate Frontend Spec |
| 3    | Traceability & Quality Audit | Verify every component maps to US-xx, correct props, accessibility impl | Step 6: Validation             |

### Mandatory Thinking Triggers

**Rule:** UI Developer must always ask internally at every stage:

- Am I **reusing an existing component** from `src/components/` before creating a new one?
- Does every component **trace back to a US-xx or FR-xxx**?
- Am I using the **correct props** for custom components (`Button` uses `color` not `type`)?
- Have I implemented **all 5 states** in the mock (empty, loading, error, success, partial success)?
- Does the mock work within the **`(auth)` layout** with correct context?
- Have I applied **design tokens** from `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` (not hardcoded values)?
- Are **Tailwind breakpoints** correct for responsive behavior?

---

## Usage

```bash
/write-frontend-spec [module-name] [epic-name]
```

## Instructions

When the user invokes `/write-frontend-spec [module-name] [epic-name]`:

**Step 1: Read UX Spec (Phase 1), Tech Spec, and Templates**
Read:

1. `docs/modules/$1/$2/03-frontend-spec.md` - Phase 1 (UX spec — MUST have Sections 1–7 filled)
2. `docs/modules/$1/$2/02-technical-spec.md` - Tech spec (API endpoints, data models, error codes)
3. `docs/modules/$1/$2/01-epic.md` - Epic (Section 2: User Stories for traceability)
4. `docs/modules/$1/brd.md` - BRD (for context)
5. `docs/modules/template-module/01-Epic1/03-frontend-spec.md` - Canonical template (Phase 2 sections)

If Phase 1 sections (1–7) are empty or still in template placeholder state, tell user:

```
❌ UX Design (Phase 1) not found or not complete: docs/modules/$1/$2/03-frontend-spec.md

Phase 1 sections (1–7) must be filled by UX Designer before UI Developer can start.
Please run /write-ux-spec $1 $2 first, then get UX Designer approval.
```

**Step 2: Read Design Standards & Available Components**
Read:
- `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` - Ant Design, Tailwind, theme config
- `docs/ai/rules/developer/` - **All developer coding rules**:
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
- Scan `src/components/` and `src/components/shared/` to identify reusable components.

**Step 3: Analyze UX Spec** _(Cognitive Protocol Step 1: Component Mapping)_

From Phase 1 sections, extract:

- **Section 1 (Design Overview)**: Screens, user flow
- **Section 2 (Screen Inventory)**: Screen → US-xx mapping
- **Section 3 (UI States)**: What states each screen needs
- **Section 4 (Interactions)**: What triggers and behaviors to implement
- **Section 5 (Accessibility)**: Keyboard nav, ARIA requirements
- **Section 6 (Responsive)**: Breakpoint strategy
- **Section 7 (Validation UX)**: Field rules, error display

For each screen, determine:

- What React components are needed
- Which existing components from `src/components/` can be reused
- What new components must be created
- What props each component needs
- How states will be toggled in mock

**Step 4: Generate Frontend Spec (Phase 2)** _(Cognitive Protocol Step 2: Mock Implementation)_

Fill Phase 2 sections (8–14) in the existing `03-frontend-spec.md`. Do **NOT** modify Phase 1 sections.

**Section 8: Component Structure**
Per component:

- Mock location path
- Target path (where it should live in production)
- `Maps to: US-xx` reference
- Reused project components (`@/components/Button`, etc.)
- Ant Design fallbacks (only if no wrapper exists)
- TSX structure
- Props table with Type, Source, Description

**Section 9: Mock Frontend Files**

- Repository/Folder path
- Live preview URL
- Directory tree of generated files
- Mock requirements (imports, realistic rendering, responsive)

**Section 10: Design Tokens**
- Colors from `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` Ant Design theme
- Typography with Tailwind classes
- Responsive breakpoints (Tailwind)

**Section 11: Form Validation Rules**
Per field (from Phase 1 Section 7 + `01-epic.md` BR-xxx):

- Mock behavior (how to trigger in mock)
- Rules (required, format, min/max)
- Error messages

**Section 12: Traceability Matrix**

- Every US-xx → Component → Screen → States Covered → FR-xxx
- Every US-xx from `01-epic.md` must appear at least once

**Section 13: Developer Handoff Notes**

- Mock-to-implementation steps
- Testing checklist (states, responsive, validation, accessibility, design tokens)

**Section 14: Questions for Developer**

- Open questions for the Developer

**Key rules for Step 4:**

- Every component **must** have a `Maps to: US-xx` reference
- Reuse existing components from `src/components/` before using raw Ant Design
- `Button` uses `color` prop (not `type`), `Typography` uses valid `variant` — check `02-components.md`
- All form validation rules must come from Phase 1 Section 7 / `01-epic.md` Section 2
- Traceability Matrix is **mandatory** — every US-xx must appear

**Step 5: Generate Mock TSX Files**

Create functional React/Next.js mock files at `src/app/design-mocks/`. Mock paths **mirror production routes** — NOT organized by module/epic docs folder.

```
src/app/design-mocks/
├── _shared/                              # Shared mock components (underscore = no route)
│   └── [module-name]/                   # e.g., partner-enrollment/
│       ├── mockData.ts                   # Mock data, types, constants
│       └── [SharedComponent].tsx         # Shared components (KYC upload, etc.)
├── [production-route-mirror]/            # Mirror production paths
│   └── page.tsx                          # Inline components (realistic, no debug panel)
```

**Example** — if production routes are `/sp/register`, `/sp/apply`, `/admin/sp/applications`:

```
src/app/design-mocks/
├── _shared/partner-enrollment/
│   ├── mockData.ts
│   ├── KYCDocumentUpload.tsx
│   └── CascadingAreaSelector.tsx
├── sp/register/page.tsx
├── sp/apply/page.tsx
├── admin/sp/applications/page.tsx
└── admin/sp/applications/[id]/page.tsx
```

The mock must:

- Import from `@/components/` for existing wrappers (Button, Typography, etc.)
- Render the **default happy-path state** — no debug panels, no state toggle checkboxes
- Use `router.push()` for navigation (not `alert()`)
- Handle loading/error states internally with realistic patterns (e.g., `Skeleton`, `Alert`)
- Include form validation with visual error feedback (matching Phase 1 Section 7)
- Implement responsive behavior with Tailwind (matching Phase 1 Section 6)
- **Inline page components** directly in `page.tsx` (no separate `components/` subfolder per route)
- **Shared components** go in `_shared/[module-name]/` and are imported via relative paths

**Step 6: Validation** _(Cognitive Protocol Step 3: Traceability & Quality Audit)_

#### Phase 2 Validation Checklist

**Structure & Completeness:**

- [ ] All 7 Phase 2 sections present (8–14)
- [ ] Phase 1 sections (1–7) preserved — NOT modified
- [ ] Change Log updated with Phase 2 entry

**Component & Traceability:**

- [ ] Every component has `Maps to: US-xx` reference
- [ ] Section 12 (Traceability Matrix) covers all user stories from `01-epic.md` Section 2
- [ ] Existing shared components reused (e.g., `@/components/Button`)
- [ ] Correct props for custom components (`Button` uses `color` not `type`)
- [ ] Exact target path for where new components should live

**Mock TSX Files:**

- [ ] Mock route paths exist under `src/app/design-mocks/` mirroring production routes
- [ ] Default happy-path rendered (no debug panel, no state toggles)
- [ ] All hardcoded Thai strings in mock TSX match `docs/shared/glossary.md`
- [ ] Form validation implements Phase 1 Section 7 rules
- [ ] Responsive matches Phase 1 Section 6 breakpoints
- [ ] Design tokens from `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` (not hardcoded)

**Step 6b: Update Shared Documentation**
After validation passes, update these shared files if new items were introduced:

1. `docs/shared/glossary.md` — Add any new UI terms, labels, or messages introduced in Phase 2 components
2. `docs/shared/error-handling.md` — Add any new error display patterns discovered during mock implementation
3. `docs/ai/rules/ux-designer/02-ux-ui-patterns.md` — Add any new reusable UX/UI patterns created in the mock
4. `docs/shared/test-data/$1/test-data.md` — **Auto-create or update** test data for the module. This is mandatory since `mockData.ts` is the richest test data source. Use `docs/shared/test-data/_template.md` as format. Populate from:
   - **Test Accounts**: Extract from `mockData.ts` mock objects (e.g., `MOCK_APPLICATIONS`, `MOCK_APPLICATION_DETAIL`)
   - **Valid Inputs**: Extract from `01-epic.md` Section 2 validation rules (fields, regex, error messages)
   - **Error Scenarios**: Extract from `01-epic.md` Section 2 error handling tables + edge cases
   - **Flow-Specific Behavior**: Extract from `01-epic.md` Section 2 state behavior tables (OTP rules, status transitions, etc.)
   - **Mock Preview URLs**: List all `design-mocks/` routes created in Step 5

**Step 7: Versioning & Iteration Rules**
If updating an existing document:

1. **Do NOT overwrite Phase 1** or existing Change Log history.
2. **Increment the Version**: Add a new row to the Change Log table.
3. **Reset Status**: Down-grade to `⚪ Draft` until explicit UI Developer approval of both the spec and the mock route UI.
4. **Preserve Phase 1**: Only modify Phase 2 sections (8–14).

**Step 8: Provide Next Steps**
Tell the user:

```
✅ Frontend Spec (Phase 2) created: docs/modules/$1/$2/03-frontend-spec.md

Implementation Summary:
- Components: [X]
- Mock TSX files: [X]
- States implemented: all 5 per screen
- Traceability: [X] user stories covered

Next steps for UI Developer:
1. Mock TSX created at src/app/design-mocks/ (route-based, mirroring production paths)
2. Test locally at http://localhost:3000/design-mocks/[production-route]
3. Review Traceability Matrix (Section 12) for completeness.
4. If you approve, reply "I approve" so I can mark Phase 2 as Final.
5. Once both Phase 1 + Phase 2 are Final, Developer can start using /implement-feature to implement the module.
```

## Tips for AI

- **Read Phase 1 first**: UX spec (Sections 1–7) is your primary input — implement what UX Designer designed
- **Do NOT modify Phase 1**: Only fill Phase 2 sections (8–14)
- **Traceability is mandatory**: Every component must map to US-xx. Section 12 must cover all user stories
- **Component Reuse is Mandatory**: Search `src/components/` first, then use raw Ant Design as fallback
- **Mock all 5 states**: Empty, Loading, Error, Success, Partial Success — use `useState` toggles
- **Design tokens**: Use `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` Ant Design config — never hardcode colors
- **Responsive**: Implement Tailwind breakpoints matching Phase 1 Section 6
- **Correct props**: `Button` uses `color` not `type` — check `02-components.md`
- **Developer handoff**: Section 13 should make it trivial for Developer to go from mock to production

## Frontend Spec Authoring Rules

These rules are **mandatory** for all Phase 2 generation:

1. **No orphan components:** Every component must trace back to a US-xx or FR-xxx.
2. **No scope invention:** Do not invent UI capabilities beyond what UX Designer specified in Phase 1. Document gaps in "Questions for Developer."
3. **Realistic rendering:** Default happy-path state rendered. No debug panels or state toggle checkboxes. Use `router.push()` for navigation.
4. **Reuse before create:** Always check `src/components/` for existing wrappers before using raw Ant Design.
5. **Correct props:** Verify against `docs/ai/rules/developer/02-components.md`.
6. **Traceability Matrix:** Section 12 is required. Every US-xx must appear at least once.
7. **Form validation from Phase 1:** All validation rules must come from Phase 1 Section 7 / `01-epic.md` Section 2.
8. **Preserve Phase 1:** Never modify Sections 1–7.

## Reference

Read `docs/ai/roles/ui-developer.md` for the UI Developer's full role context, cognitive protocol, and quality checklist.
