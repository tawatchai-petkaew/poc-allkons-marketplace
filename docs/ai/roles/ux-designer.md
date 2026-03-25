# UX Designer Guide - Using AI Assistant

**Role scope:** The UX Designer operates after BRD and Tech Spec are approved — **before** the UI Developer starts. The approved BRD, `01-epic.md`, and `02-technical-spec.md` are treated as upstream truth. The UX Designer produces Phase 1 of the Frontend Specification (`03-frontend-spec.md`) — user flows, screens, states, interactions, accessibility & responsive concepts. The UX Designer does **not** write code, TSX, or component implementations — that is the UI Developer's responsibility (see `docs/ai/roles/ui-developer.md`).

> **Executable skill:** For the step-by-step UX design process, run `/write-ux-spec [module-name] [epic-name]` — see `docs/ai/skills/write-ux-spec/SKILL.md`.

---

## 🎯 How AI Can Help You

As a UX Designer, AI can assist with:

- ✅ Designing user flows from BRD and Epic user stories (`/write-ux-spec`)
- ✅ Inventorying screens and mapping to user stories (US-xx)
- ✅ Designing all UI states (empty, loading, error, success, partial success)
- ✅ Specifying interactions and transitions
- ✅ Defining accessibility concepts (keyboard flow, screen reader intent, WCAG AA)
- ✅ Planning responsive layouts (desktop, tablet, mobile)
- ✅ Designing validation UX (error placement, messages)

---

## 🧠 UX Designer Cognitive Protocol

### Purpose

The UX Designer bridges business requirements and user experience — translating user stories, business rules, and API contracts into visual flows, screens, states, and interaction patterns that can be implemented by the UI Developer.

### Core Competencies

| Competency              | Key Skills                                                       |
| ----------------------- | ---------------------------------------------------------------- |
| **Requirement Mapping** | Map US-xx / FR-xxx to screens, flows, interactions               |
| **State Design**        | Empty, Loading, Error, Success, Partial Success for every view   |
| **Interaction Design**  | Trigger → behavior → feedback → animation concept                |
| **Accessibility**       | Keyboard flow, screen reader intent, WCAG AA contrast            |
| **Responsive**          | Desktop / Tablet / Mobile layout strategy                        |
| **UX Writing / Copy**   | Maintain central glossary, consistent terminology across modules |

### Cognitive Protocol

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
- Have I followed the **UX Writing rule**? (`docs/ai/rules/ux-designer/03-ux-writing.md`) — all UI text uses glossary templates
- Have I checked the **IA sitemap** to understand where my screens fit in the app?
- Does my **navigation design** match the existing app navigation pattern?
- Am I **referencing existing components** from the component registry before inventing new UI?
- Is my design consistent with the app's **Visual Theme Direction**?

### Big Picture Protocol

**Rule:** Before designing any screens for an epic, UX Designer must first understand the big picture:

1. **What app context** does this module belong to? (buyer/seller/startup-partner) → Read `APP-CONTEXT-GUIDE.md`
2. **What other modules** exist in this app? → Read `INFORMATION-ARCHITECTURE.md`
3. **What other epics** exist in this module? → Read `MODULE-UX-OVERVIEW.md`
4. **What navigation pattern** does the app use? (sidebar/top-nav/etc.) → Check app section in IA sitemap
5. **What components already exist** that can be reused? → Read component registry for the app

This ensures designs feel like part of one unified app, not isolated pages per epic.

> **New module?** Run `/write-ux-overview [module-name]` first to create the module-level overview before designing individual epics.

---

## 📚 Documents You Should Reference

When working with AI, tell it to read:

- `docs/architecture/INFORMATION-ARCHITECTURE.md` — Global IA sitemap (where does this module sit in the app?)
- `docs/architecture/APP-CONTEXT-GUIDE.md` — Which app context, what components exist, **Visual Theme Direction**
- `docs/architecture/registries/[app]-components.md` — Existing component catalog for the target app (buyer/seller/startup-partner)
- `docs/modules/[module-name]/MODULE-UX-OVERVIEW.md` — Cross-epic navigation, shared layouts, module screen map
- `docs/modules/[module-name]/brd.md` - BRD (must be `🟢 Final / Approved`)
- `docs/modules/[module-name]/[epic]/01-epic.md` - Epic spec, focus on:
  - **Section 2: User Stories** — AC, BR, validation rules, edge cases, state behavior
  - **Section 6: Role and Permission Matrix** — who can do what
  - **Section 8: Requirements** — FR-xxx functional requirements
- `docs/modules/[module-name]/[epic]/02-technical-spec.md` - Tech spec, focus on:
  - **Section 3: API Contracts** — endpoints, error codes (for error state design)
  - **Section 6: Security** — auth, permissions (for permission-denied states)
- `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` - Ant Design config, theme (for error state design)
- `docs/shared/glossary.md` - Central UX writing glossary (all UI text, labels, messages)
- `docs/shared/error-handling.md` - Error display patterns and error code catalog
- `docs/ai/rules/ux-designer/03-ux-writing.md` - UX Writing & Copy Standards (message templates, tone, glossary-first workflow)
- `docs/shared/test-data/[module]/test-data.md` - Test data per module
- `docs/ai/rules/ux-designer/01-validation-rules.md` - Global field validation rules
- `docs/ai/rules/ux-designer/02-ux-ui-patterns.md` - Reusable UX/UI pattern library

---

## 📝 Output Template (What You Produce)

Your output artifact is **Phase 1 of the Frontend Specification** (Sections 1–7). Use this template:

- Template: `docs/modules/template-module/01-Epic1/03-frontend-spec.md`

Save your results to:

- `docs/modules/[module-name]/[epic]/03-frontend-spec.md`

### Phase 1 Sections

| #   | Section                    | Key Content                                                   |
| --- | -------------------------- | ------------------------------------------------------------- |
| 1   | Design Overview            | User flow diagram, key screens, Figma links                   |
| 2   | Screen Inventory           | Screen → US-xx mapping, states per screen                     |
| 3   | UI States & Behaviors      | Empty, Loading, Error, Success, Partial Success — visual spec |
| 4   | Interactions & Transitions | Trigger → behavior → animation concept                        |
| 5   | Accessibility Concept      | Keyboard flow, screen reader intent, WCAG AA, focus mgmt      |
| 6   | Responsive Concept         | Desktop / Tablet / Mobile layout strategy                     |
| 7   | Validation UX              | Error display position, messages, required indicators         |

> **Note:** Phase 2 (Sections 8–14: component structure, mock TSX, design tokens, traceability) is produced by **UI Developer** — see `docs/ai/roles/ui-developer.md`.

---

## ✍️ UX Writing & Copy Guidelines

The UX Designer is responsible for maintaining consistent UI text across all modules.

### Central Glossary

- **File:** `docs/shared/glossary.md`
- Contains all UI labels, button text, placeholders, error messages, success messages, and consent text
- **Rule:** All new UI text MUST be added to the glossary when introduced
- **Rule:** Before writing new text, check the glossary for existing terms to ensure consistency

### When Designing a New Module

1. Check `docs/shared/glossary.md` for existing terms that can be reused
2. Write new UI text in Thai (primary) with English key for reference
3. Add all new terms to the glossary before marking the spec as complete
4. Ensure error messages follow the patterns in `docs/shared/error-handling.md`
5. Ensure validation messages follow the templates in `docs/ai/rules/ux-designer/01-validation-rules.md`

### Naming Conventions

- **Button labels:** Action-oriented, concise (e.g., เข้าสู่ระบบ, ถัดไป, ยืนยัน)
- **Form labels:** Noun-based (e.g., หมายเลขโทรศัพท์, ชื่อผู้ใช้)
- **Placeholders:** Start with กรุณากรอก or กรอก (e.g., กรุณากรอกชื่อ)
- **Error messages:** Start with กรุณา for required fields, descriptive for format errors
- **Success messages:** [Action]สำเร็จ (e.g., เข้าสู่ระบบสำเร็จ)

---

## 💬 Common AI Prompts

### Understanding Requirements

```
"Read the BRD at docs/modules/[module-name]/brd.md
and Epic at docs/modules/[module-name]/[epic]/01-epic.md

Explain in plain language:
1. What screens do I need to design?
2. What user interactions are required?
3. What data validations affect the UI?
4. What error states need to be designed?"
```

### Designing User Flows

```
"Based on 01-epic.md Section 2 (User Stories):
Design the main user flow for [module].

Include:
- Happy path (start → success)
- Error branches (validation, API errors)
- Decision points (conditional flows)
- Entry and exit points

Format as flow diagram."
```

### Designing All States

```
"For [Screen Name] that maps to US-xx:
Design all 5 required states:
1. Empty — no data exists
2. Loading — data is being fetched
3. Error — API failure or validation error
4. Success — data loaded / action completed
5. Partial Success — some items succeed, some fail

For each state, specify: visual elements, message text, user actions available."
```

### Accessibility Design

```
"For this user flow: [describe flow]
Design the accessibility concept:
- Keyboard navigation order (Tab sequence)
- Screen reader announcements for dynamic changes
- Focus management for modals
- Color contrast requirements (WCAG AA)
- Error states: use both color AND icon"
```

### Responsive Layout Strategy

```
"For [Screen Name]:
Design responsive behavior for:
- Desktop (> 1024px): [full layout]
- Tablet (768px – 1024px): [adapted layout]
- Mobile (< 768px): [mobile layout]

Specify what changes at each breakpoint:
- Navigation (sidebar → hamburger)
- Data display (table → cards)
- Actions (toolbar → dropdown)"
```

---

## 🔄 Typical Workflow

### Stage 1: Analyze Requirements → Cognitive Protocol Step 1

**Key UX Designer decisions:**

- What screens are needed for each user story?
- What states must each screen handle?
- What is the primary user flow?

**Done when:** Screen inventory built, each screen maps to US-xx.

### Stage 2: Design UX → Cognitive Protocol Step 2

**Key UX Designer decisions:**

- Is the user flow intuitive?
- Are all 5 states designed for every view?
- Are interactions clear and consistent?
- Is validation UX user-friendly?

**Done when:** Sections 1–7 filled with visual specs and Figma links.

### Stage 3: Validate → Cognitive Protocol Step 3

**Key UX Designer decisions:**

- Can the flow be completed via keyboard only?
- Do error states use both color AND icon?
- Does mobile layout work without horizontal scroll?
- Is every screen traceable to a US-xx?

**Done when:** All validation checks pass.

---

## 📋 Quality Checklist

Before marking Phase 1 as approved, verify:

```
"Review my UX spec at docs/modules/[module-name]/[epic]/03-frontend-spec.md (Phase 1)

Verify:
- [ ] All 7 Phase 1 sections present
- [ ] Every screen maps to a US-xx
- [ ] All 5 states designed (empty, loading, error, success, partial success)
- [ ] Every interaction has Maps to: US-xx AC-xx
- [ ] Keyboard navigation flow specified
- [ ] Screen reader intent documented
- [ ] Color contrast WCAG AA confirmed
- [ ] Responsive layout for desktop, tablet, mobile
- [ ] Validation UX with error position and messages
- [ ] Figma links included for key screens

What's missing?"
```

---

## 💡 Pro Tips

### 1. Start from User Stories

```
"Read 01-epic.md Section 2.
For each US-xx, identify:
- What screen(s) are needed?
- What states must be designed?
- What interactions are required?
This ensures 100% coverage."
```

### 2. Design Error States First

```
"For each screen, design the error state FIRST.
If you can handle errors well, the happy path
is easy. Check 02-technical-spec.md API contracts
for all possible error responses."
```

### 3. Think Mobile First

```
"Design mobile layout first, then expand to tablet and desktop.
This forces you to prioritize content and simplify interactions."
```

---

## 🆘 Common Questions

**Q: What's the difference between UX Designer and UI Developer?**
A: UX Designer designs **user flows, screens, states, and interactions** (Phase 1) from specs. UI Developer **implements components, writes mock TSX, and builds the prototype** (Phase 2) from the UX design.

**Q: When should I start designing?**
A: As soon as BRD + Tech Spec are `🟢 Final / Approved`. You can work in parallel with the Tech Lead if BRD is already approved.

**Q: Should I write React code?**
A: No. Focus on UX design — flows, states, interactions, Figma. The UI Developer will translate your design into React/Next.js code.

**Q: How detailed should Figma mockups be?**
A: Detailed enough that a UI Developer can implement without asking questions about visual appearance, state behavior, or interaction flow.

**Q: What if the BRD is unclear about a user flow?**
A: Document it in Section 7 "Questions for UI Developer" and flag to BSA for clarification.

---

## 📞 Getting Help

If you're stuck:
1. Read `docs/ai/rules/developer/01-project-structure.md` to understand technical context
2. Ask AI to explain technical concepts in designer terms
3. Check template: `docs/modules/template-module/01-Epic1/03-frontend-spec.md` (Phase 1)
4. Review BRD/Epic to clarify requirements
5. Apply the UX Designer Cognitive Protocol (3-step framework)
6. Use the Mandatory Thinking Triggers to identify blind spots
7. Add useful prompts you discover to this guide!
