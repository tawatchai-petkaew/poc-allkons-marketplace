---
name: write-ux-spec
description: Design user flows, screens, states, interactions, accessibility & responsive concepts from BRD + Epic + Tech Spec — producing Phase 1 of the Frontend Specification
---

# Write UX Spec

Designs comprehensive UX specifications from approved BRD, Epic, and Tech Spec, producing Phase 1 of the Frontend Specification (`03-frontend-spec.md`).

**Role scope:** The UX Designer operates after BRD and Tech Spec are approved — **before** the UI Developer starts. The approved BRD, `01-epic.md`, and `02-technical-spec.md` are treated as upstream truth. The UX Designer does **not** write code or TSX — that is the UI Developer's responsibility.

> **Role guide:** See `docs/ai/roles/ux-designer.md` for the UX Designer's full role context, cognitive protocol, and quality checklist. Output template: `docs/modules/template-module/01-Epic1/03-frontend-spec.md`.

---

## UX Designer Cognitive Protocol

A 3-step systematic design framework:

| Step | Name                             | Purpose                                                       | Applied In                   |
| ---- | -------------------------------- | ------------------------------------------------------------- | ---------------------------- |
| 1    | Requirement Mapping              | Map each US-xx / FR-xxx to screens, states, and interactions  | Step 3: Analyze Requirements |
| 2    | UX Design                        | Design user flows, screen inventory, all states, interactions | Step 4: Generate UX Spec     |
| 3    | Accessibility & Responsive Audit | Verify keyboard nav, screen reader, WCAG, responsive          | Step 5: Validation           |

### Mandatory Thinking Triggers

**Rule:** UX Designer must always ask internally at every stage:

- Have I designed the **error state** for this interaction?
- Have I designed the **empty state** for this view?
- Is this component **accessible via keyboard**?
- Does the **mobile layout** work without horizontal scroll?
- Does every screen **trace back to a US-xx or FR-xxx**?
- Have I specified **loading states** for all async operations?
- Have I designed the **partial success** state (some items succeed, some fail)?
- Have I checked the **glossary** for consistent terminology? (`docs/shared/glossary.md`)
- Have I referenced the **validation rules** file? (`docs/ai/rules/ux-designer/01-validation-rules.md`)
- Have I documented the **error handling pattern**? (`docs/shared/error-handling.md`)
- Have I checked the **IA sitemap** to understand where this epic's screens fit in the app?
- Am I reusing **existing components** from the app's component registry?
- Does the **navigation** in this epic connect consistently with other epics in the module (MODULE-UX-OVERVIEW.md)?
- Is my design consistent with the app's **Visual Theme Direction**? (color mood, layout feel, density)
- Have I updated the **MODULE-UX-OVERVIEW.md** screen map with new screens from this epic?

---

## Usage

```bash
/write-ux-spec [module-name] [epic-name]
```

## Instructions

When the user invokes `/write-ux-spec [module-name] [epic-name]`:

**Step 0: Prerequisite — Module UX Overview**
Check if `docs/modules/$1/MODULE-UX-OVERVIEW.md` exists.

If it does NOT exist, tell user:
```
❌ Module UX Overview not found: docs/modules/$1/MODULE-UX-OVERVIEW.md

UX Designer must create the module-level overview before designing individual epics.
Please run /write-ux-overview $1 first to establish:
- Module position in app
- Cross-epic screen map
- Shared navigation & layout
- Cross-epic dependencies

Then run /write-ux-spec $1 $2 to design this epic.
```

**Step 1: Read Final BRD, Epic, and Tech Spec**
Read:

1. `docs/modules/$1/brd.md` - Business requirements (MUST be `🟢 Final / Approved`)
2. `docs/modules/$1/$2/01-epic.md` - Epic spec, focus on:
   - **Section 2: User Stories** — AC, BR, validation rules, edge cases, state behavior
   - **Section 6: Role and Permission Matrix** — who can do what
   - **Section 8: Requirements** — FR-xxx functional requirements
3. `docs/modules/$1/$2/02-technical-spec.md` - Tech spec, focus on:
   - **Section 3: API Contracts** — endpoints, error codes (for error state design)
   - **Section 6: Security** — auth, permissions (for permission-denied states)
4. `docs/modules/template-module/01-Epic1/03-frontend-spec.md` - Canonical template (Phase 1 sections only)

If BRD doesn't exist or is still marked `⚪ Draft`, tell user:

```
❌ Final BRD not found or not approved: docs/modules/$1/brd.md

Please ensure BSA has reviewed and approved the BRD to "🟢 Final / Approved" before UX Designer can start.
```

**Step 1.5: Read Global & Module Context**
Read:
1. `docs/architecture/INFORMATION-ARCHITECTURE.md` — Understand where this module sits in the app ecosystem
2. `docs/architecture/APP-CONTEXT-GUIDE.md` — Understand the app's technical context and **Visual Theme Direction**
3. `docs/architecture/registries/[app]-components.md` — Know what components already exist in this app
4. `docs/modules/$1/MODULE-UX-OVERVIEW.md` — **Mandatory**: Understand module-level navigation, shared layout, cross-epic screen map
5. Other epics' `03-frontend-spec.md` in the same module — Check for screens that connect to this epic

**Step 2: Read Design Standards**
Read:
- `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` - Ant Design, Tailwind patterns and available components
- `docs/ai/rules/ux-designer/01-validation-rules.md` - Global field validation rules (reuse before creating new)
- `docs/ai/rules/ux-designer/02-ux-ui-patterns.md` - Reusable UX/UI pattern library (reuse before creating new)
- `docs/shared/glossary.md` - Central UX writing glossary (check existing terms first)
- `docs/shared/error-handling.md` - Error display patterns and error code catalog
- `docs/ai/rules/ux-designer/03-ux-writing.md` - UX Writing & Copy Standards (message templates, tone, glossary-first workflow)

**Step 3: Analyze Requirements** _(Cognitive Protocol Step 1: Requirement Mapping)_

Extract from BRD and `01-epic.md` Section 2:

- User stories (US-01, US-02, ...) with acceptance criteria
- Business rules (BR-xxx) and validation rules per user story
- Edge cases (EC-xxx) per user story
- State behavior per user story (Loading/Empty/Success/Error)

For each user story, determine:

- What screens are needed
- What user flow connects the screens
- What states need to be designed (all 5: empty, loading, error, success, partial success)
- What interactions are required
- What responsive behavior is needed

**Step 4: Generate UX Spec** _(Cognitive Protocol Step 2: UX Design)_

Use the canonical template. Fill Phase 1 sections (1–7):

**Section 1: Design Overview**

- User flow diagram (text-based flow with decision points)
- Key screens table: Screen → Purpose → Maps to US-xx
- Figma / design links (placeholder if not yet created)

**Section 2: Screen Inventory**

- Table: Screen → Description → User Stories → States → Entry Point
- Every US-xx must map to at least one screen

**Section 3: UI States & Behaviors**
For each of the 5 states:

- **When** the state occurs
- **Visual spec**: what the user sees (description, not code)
- **Figma frame** link (placeholder if not yet created)

**Section 4: Interactions & Transitions**
For each interaction:

- **Trigger**: what the user does
- **Maps to**: US-xx AC-xx
- **Behavior**: step-by-step what happens
- **Animation concept**: transition type and duration

**Section 5: Accessibility Concept**

- Keyboard navigation flow (Tab order, Enter, Escape, Arrow keys)
- Screen reader intent (what gets announced, ARIA concepts)
- Color & contrast (WCAG AA 4.5:1)
- Focus management (modals, dynamic content)

**Section 6: Responsive Concept**

- Desktop (> 1024px): full layout
- Tablet (768px – 1024px): adapted layout
- Mobile (< 768px): mobile layout
- What changes at each breakpoint

**Section 7: Validation UX**
For each field with validation rules (from `01-epic.md` Section 2 BR-xxx):

- Rules (required, format, min/max)
- Error display: position, message, style
- All error messages **must** use templates from `docs/ai/rules/ux-designer/03-ux-writing.md`. New terms **must** be added to glossary in Step 6b.
- Questions for UI Developer

**Step 5: Validation** _(Cognitive Protocol Step 3: Accessibility & Responsive Audit)_

Run this checklist before saving:

### Coverage Checks

- [ ] Every US-xx from `01-epic.md` Section 2 has at least 1 screen
- [ ] Screen inventory maps all screens to user stories
- [ ] User flow includes happy path and error branches

### State Checks

- [ ] All 5 states designed: empty, loading, error, success, partial success
- [ ] Error messages reference BRD/Epic exact text
- [ ] All UI text follows `docs/ai/rules/ux-designer/03-ux-writing.md` conventions (glossary templates, tone, naming)
- [ ] Loading states cover all async operations

### Accessibility Checks

- [ ] Keyboard navigation flow specified
- [ ] Screen reader intent documented
- [ ] Color contrast WCAG AA (4.5:1) confirmed
- [ ] Focus management for modals documented
- [ ] Error states use both color AND icon

### Responsive Checks

- [ ] Desktop, Tablet, Mobile layouts defined
- [ ] Mobile layout works without horizontal scroll
- [ ] Navigation adapts (sidebar → hamburger)
- [ ] Data display adapts (table → cards)

### Cross-Epic Consistency Checks

- [ ] Navigation pattern matches MODULE-UX-OVERVIEW.md shared layout
- [ ] Screen designs reference existing components from app component registry
- [ ] New screens added to MODULE-UX-OVERVIEW.md screen map
- [ ] IA sitemap screen count updated
- [ ] Design follows app's Visual Theme Direction

**Step 6: Save UX Spec (Phase 1 only)**
Write to: `docs/modules/$1/$2/03-frontend-spec.md`

Only fill Phase 1 sections (1–7). Leave Phase 2 sections (8–14) empty with their template placeholders.

**Step 6b: Update Shared Documentation**
After saving the UX spec, update these shared files:

1. `docs/shared/glossary.md` — Add any new UI terms, labels, messages introduced in this spec
2. `docs/shared/test-data/$1/test-data.md` — **Auto-create** from `docs/shared/test-data/_template.md` if not exists, or **update** if exists. Populate sections:
   - **Test Accounts**: One per user story flow (happy path + key error scenarios from AC/EC tables)
   - **Valid Inputs**: From validation rules in `01-epic.md` Section 2 (field, regex, error message)
   - **Error Scenarios**: From error handling tables in `01-epic.md` Section 2 (trigger, code, Thai message, UI behavior)
   - **Flow-Specific Behavior**: From state behavior tables (e.g., OTP rules, status transitions, re-application rules)
3. `docs/shared/error-handling.md` — Add any new error codes and display patterns
4. `docs/ai/rules/ux-designer/01-validation-rules.md` — Add any new field validation rules
5. `docs/ai/rules/ux-designer/02-ux-ui-patterns.md` — Add any new UX/UI patterns

**Step 6c: Update Module & Global Context**
After saving the UX spec, update these documents:

1. `docs/modules/$1/MODULE-UX-OVERVIEW.md` — Add new screens from this epic to the Screen Map table, update cross-epic dependencies if changed
2. `docs/architecture/INFORMATION-ARCHITECTURE.md` — Update the module's Screen count and Status in the app's Module Map

**Step 7: Versioning & Iteration Rules**
If the target document already exists and you are asked to update it:

1. **Do NOT overwrite the existing Change Log history.**
2. **Increment the Version**: Add a new row to the Change Log table.
3. **Reset Status**: Down-grade to `⚪ Draft` until explicit UX Designer approval.
4. **Preserve Phase 2**: If Phase 2 is already filled by UI Developer, do NOT modify it.

**Step 8: Provide Next Steps**
Tell the user:

```
✅ Draft UX Spec designed: docs/modules/$1/$2/03-frontend-spec.md (Phase 1)

Design Summary:
- Screens: [X]
- States designed: [X] (all 5 per screen)
- Interactions: [X]
- Responsive: Desktop, Tablet, Mobile

Next steps for UX Designer:
1. Review the user flows and screen inventory.
2. Create Figma mockups and add links to Section 1.
3. If you approve, reply "I approve" so I can mark Phase 1 as Final.
4. Once Phase 1 is approved, UI Developer can start building components and mock TSX using /write-frontend-spec.
```

## Tips for AI

- **Read User Stories first**: `01-epic.md` Section 2 is the primary source
- **Design all 5 states**: Empty, Loading, Error, Success, Partial Success — every view needs all 5
- **Accessibility is not optional**: Keyboard nav, screen reader, WCAG AA are required
- **Be visual, not technical**: Describe what the user sees, not how to code it
- **Think mobile first**: If mobile works, desktop is easy
- **Use BRD error messages**: Reference exact text from BRD/Epic for error states
- **Don't write code**: No TSX, no React, no component props — that's UI Developer's job
- **Cognitive Protocol**: Apply the 3-step framework at every stage
- **Thinking Triggers**: Run all 7 mandatory thinking triggers

## Reference

Read `docs/ai/roles/ux-designer.md` for the UX Designer's full role context, cognitive protocol, and quality checklist.
