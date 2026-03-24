# Frontend Specification: [Epic Name]

**Author/Owner**: UX Designer (Phase 1) / UI Developer (Phase 2)
**Epic**: EPIC-01 — [Epic Name]
**Module**: [Module Name]
**Date**: [YYYY-MM-DD]
**Status**: ⚪ Draft

## Change Log

| Version | Date | Changes | Updated By | Role | Status |
|---------|------|---------|------------|------|--------|
| v1.0 | [YYYY-MM-DD] | Initial UX design — screens, flows, states | UX Designer | UX Designer | ⚪ Draft |

> **💡 Two-phase document:**
> - **Phase 1 (UX Designer)**: Design user flows, screens, states, interactions, accessibility & responsive concepts from BRD + Epic + Tech Spec — **before** UI Developer starts. Fill Sections 1–7.
> - **Phase 2 (UI Developer)**: Implement component structure, mock TSX, design tokens, form validation, traceability — **after** UX Design is approved. Fill Sections 8–14.

---

## References

- **BRD**: `docs/modules/[module-name]/brd.md`
- **Epic**: `docs/modules/[module-name]/[epic]/01-epic.md` (Section 2: User Stories)
- **Tech Spec**: `docs/modules/[module-name]/[epic]/02-technical-spec.md`

---

# Phase 1: UX Design (UX Designer — after BRD + Tech Spec approved)

> Filled by `/write-ux-spec [module] [epic]`. Input: BRD, Epic, Tech Spec.

---

## 1. Design Overview

### User Flow
```
[Step 1] → [Step 2] → [Step 3] → [Success]
             ↓
         [Error handling]
```

### Key Screens
| # | Screen Name | Purpose | Maps to |
|---|-------------|---------|---------|
| 1 | [Screen 1] | Main entry point | US-01 |
| 2 | [Screen 2] | [Purpose] | US-02 |

### Figma / Design Links
- **Main Flow**: [Figma link]
- **Components**: [Figma component library link]
- **Prototype**: [Interactive prototype link]

---

## 2. Screen Inventory

| Screen | Description | User Stories | States | Entry Point |
|--------|-------------|-------------|--------|-------------|
| [Screen 1] | [Description] | US-01, US-02 | Empty, Loading, Success, Error | Navigation / URL |
| [Screen 2] | [Description] | US-03 | Loading, Success, Error | From Screen 1 |

---

## 3. UI States & Behaviors

### State 1: Empty State
**When**: No data available
**Visual Spec**:
- Illustration or icon
- Message: "[Empty state message]"
- CTA: "[Button text]" (if applicable)
- Figma frame: [link]

### State 2: Loading State
**When**: Fetching data from API
**Visual Spec**:
- Skeleton loaders for content areas
- All interactive elements disabled
- Stable layout (no layout shift)
- Figma frame: [link]

### State 3: Error State
**When**: API error or validation failure
**Visual Spec**:
- Error alert with icon
- Error message (exact text from BRD FR-XXX)
- Retry button
- Figma frame: [link]

### State 4: Success State
**When**: Operation completed successfully
**Visual Spec**:
- Success notification (toast / inline)
- Updated UI reflecting changes
- Figma frame: [link]

### State 5: Partial Success
**When**: Some items succeeded, some failed
**Visual Spec**:
- Summary (X succeeded, Y failed)
- Error details for failed items
- Figma frame: [link]

---

## 4. Interactions & Transitions

### Interaction 1: [Action Name]
**Trigger**: User clicks [button/element]
**Maps to**: US-01 AC-01
**Behavior**:
1. Show loading state
2. Perform action (API call from FR-XXX)
3. On success: Show success message, update UI
4. On error: Show error message (from BRD)

**Animation Concept**: `0.3s ease-out` fade transition

### Interaction 2: [Action Name]
(Same structure as Interaction 1)

---

## 5. Accessibility Concept

### Keyboard Navigation Flow
- **Tab**: Navigate through interactive elements (specify order)
- **Enter**: Activate buttons, submit forms
- **Escape**: Close modals, cancel actions
- **Arrow keys**: Navigate table rows, menu items

### Screen Reader Intent
- Icon buttons must have descriptive labels
- Form fields must have associated help text
- Error messages must be announced as alerts
- Dynamic content changes must be announced

### Color & Contrast
- Text on background: 4.5:1 minimum (WCAG AA)
- Error messages: Use both color AND icon (not color alone)

### Focus Management
- Visible focus indicators on all interactive elements
- Focus trapped in modals when open
- Focus returns to trigger element on modal close

---

## 6. Responsive Concept

### Desktop (> 1024px)
- Full layout with sidebar
- Table shows all columns
- Actions in toolbar

### Tablet (768px – 1024px)
- Collapsed sidebar
- Table shows essential columns only
- Actions in dropdown menu

### Mobile (< 768px)
- No sidebar (hamburger menu)
- Card layout instead of table
- Stacked actions

---

## 7. Validation UX

### Field 1: [Field Name]
**Rules** (from `01-epic.md` Section 2 BR-xxx):
- Required: Yes
- Format: [Regex or description]
- Min/Max: [Values]

**Error Display**:
- Position: Inline below field
- Message: "[Field] is required" / "[Field] must be [format]"
- Style: Red text + error icon

### Field 2: [Field Name]
(Same structure as Field 1)

### Questions for UI Developer
- [ ] [Question 1]
- [ ] [Question 2]

---

# Phase 2: Frontend Implementation (UI Developer — after UX Design approved)

> Filled by `/write-frontend-spec [module] [epic]`. Input: This spec (Phase 1) + Tech Spec + `docs/ai/rules/developer/`.

---

## 8. Component Structure

> **⚠️ CRITICAL**: Reuse existing components from `src/components/` (Button, Typography, Label, Card, etc.) before using raw Ant Design. See `docs/ai/rules/developer/02-components.md`.

### Component 1: [ComponentName]

**Mock Location**: `src/app/design-mocks/[production-route]/page.tsx` (inline) or `_shared/[module]/[ComponentName].tsx` (shared)
**Target Path**: `src/components/[ComponentName]/index.tsx` (or `src/app/[route]/components/` if route-specific)
**Maps to**: US-01 (from `01-epic.md` Section 2)

**Reused Project Components**:
- `@/components/Button` — Standardized buttons
- `@/components/Typography` — Standardized text

**Ant Design Fallback** (only if no custom wrapper exists):
- `Table` — Data display with selection
- `Modal` — Confirmation dialog

**Structure**:
```tsx
<Layout>
  <Header>
    <Title>[Title]</Title>
    <Actions>
      <Button color="primary">[Action]</Button>
    </Actions>
  </Header>
  <Content>
    [Main content]
  </Content>
</Layout>
```

**Props**:
| Prop | Type | Source | Description |
|------|------|--------|-------------|
| `data` | `IResource[]` | FR-001 | Data from API |
| `onSelect` | `(ids: string[]) => void` | US-01 AC-01 | Selection handler |
| `loading` | `boolean` | — | Loading state |

### Component 2: [ComponentName]
(Same structure as Component 1)

---

## 9. Mock Frontend Files

**Repository/Folder**: `src/app/design-mocks/` (route-based, mirrors production paths)
**Live Preview**: `http://localhost:3000/design-mocks/[production-route]`

```bash
# To view mock frontend locally:
pnpm dev
# Open: http://localhost:3000/design-mocks/[production-route]
```

```
src/app/design-mocks/
├── _shared/                              # Shared mock components (underscore = no route)
│   └── [module-name]/                   # e.g., partner-enrollment/
│       ├── mockData.ts                   # Mock data, types, constants
│       └── [SharedComponent].tsx         # Shared components
├── [production-route-mirror]/            # Mirror production paths
│   └── page.tsx                          # Inline components (realistic, no debug panel)
```

The mock must:
- Import from `@/components/` for existing wrappers (Button, Typography, etc.)
- Render the **default happy-path state** — no debug panels, no state toggle checkboxes
- Use `router.push()` for navigation (not `alert()`)
- Handle loading/error internally with realistic patterns (e.g., `Skeleton`, `Alert`)
- Include form validation with visual error feedback
- **Inline page components** directly in `page.tsx` (no separate `components/` subfolder)
- **Shared components** go in `_shared/[module-name]/` and are imported via relative paths

---

## 10. Design Tokens

### Colors (from `docs/ai/rules/developer/06-nextjs-antd-best-practices.md` Ant Design theme)
| Token | Value | Usage |
|-------|-------|-------|
| `--primary-color` | #00AF43 | Primary actions |
| `--error-color` | #DA2110 | Destructive actions, errors |
| `--success-color` | #52C41A | Success indicators |
| `--warning-color` | #FAAD14 | Warnings |
| `--text-primary` | #262626 | Body text |
| `--text-secondary` | #8C8C8C | Helper text |
| `--border-color` | #D9D9D9 | Borders |

### Typography
| Element | Tailwind Classes |
|---------|-----------------|
| Page title | `text-2xl font-bold` |
| Section header | `text-lg font-medium` |
| Body text | `text-base` |
| Helper text | `text-sm text-gray-600` |

### Responsive Breakpoints (Tailwind)
```css
/* Mobile first */
.component { /* mobile styles */ }
@media (min-width: 768px) { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
```

---

## 11. Form Validation Rules

### Field 1: [Field Name]
**Mock**: Submit form in `page.tsx` without entering data
**Rules** (from `01-epic.md` Section 2 BR-xxx):
- Required: Yes
- Format: [Regex or description]
- Min/Max: [Values]

**Error Messages**:
- Empty: "[Field] is required"
- Invalid: "[Field] must be [format]"

### Field 2: [Field Name]
(Same structure as Field 1)

---

## 12. Traceability Matrix

| User Story | Component | Screen | States Covered | FR Reference |
|-----------|-----------|--------|----------------|-------------|
| US-01 | [ComponentName] | Screen 1 | Empty, Loading, Success, Error | FR-001 |
| US-02 | [ComponentName] | Screen 2 | Loading, Success, Error | FR-002 |

---

## 13. Developer Handoff Notes

### From Mock to Implementation
1. **Move Components**: Extract inline components from `design-mocks/[route]/page.tsx` and shared components from `_shared/[module]/` to final `src/components/` or `src/app/.../components/`
2. **Replace Mock State**: Replace `useState` + `setTimeout` with React Query hooks calling real API
3. **Check Layout Contexts**: Mock runs inside `(auth)` layout — ensure real context (`organizeId`, `merchantSlug`) is passed

### Testing Checklist
- [ ] All states implemented (loading, error, empty, success, partial success)
- [ ] Responsive design matches mock (desktop, tablet, mobile)
- [ ] Interactions match mock behavior
- [ ] Form validation matches BRD rules
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] Colors match design tokens
- [ ] Spacing matches Tailwind classes

---

## 14. Questions for Developer
- [ ] [Question 1]
- [ ] [Question 2]

---

## Sign-off Required From
- [ ] UX Designer (Phase 1 — UX design approved)
- [ ] UI Developer (Phase 2 — frontend spec + mock complete)
- [ ] Product Owner
- [ ] Tech Lead
