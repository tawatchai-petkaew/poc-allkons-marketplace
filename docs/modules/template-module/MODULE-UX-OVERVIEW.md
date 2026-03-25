# UX Overview: [Module Name]

> **Owner**: UX Designer (created by `/write-ux-overview`)
> **Purpose**: Module-level UX overview connecting all epics — screen map, navigation, shared layout, cross-epic flow.
> **When to read**: Before `/write-ux-spec` (mandatory), before `/write-frontend-spec`.
> **When to update**: UX Designer updates via `/write-ux-spec` (add screen details), UI Developer updates via `/write-frontend-spec` (shared components).

**Date:** [YYYY-MM-DD]
**Status:** ⚪ Draft
**App Context:** [buyer-platform | seller-platform | startup-partner-platform]
**Component Registry:** `docs/architecture/registries/[app]-components.md`

## Change Log

| Version | Date | Changes | Updated By | Status |
|---------|------|---------|------------|--------|
| v1.0 | [YYYY-MM-DD] | Initial module UX overview | UX Designer | ⚪ Draft |

---

## 1. Module Position

### App Context

[Which app does this module belong to? Reference `docs/architecture/APP-CONTEXT-GUIDE.md`]

### Position in App Navigation

[Where does this module sit in the app's navigation? Which sidebar item, navbar section, or flow?]

### Entry Points

[How do users reach this module from within the app? List all entry points.]

### Relationship to Other Modules

[How does this module connect to other modules in the same app? Shared state, navigation links, etc.]

---

## 2. Module-Level User Journey

### Happy Path

```
[Flow diagram showing the main user journey across ALL epics in this module]

Example:
[Landing] → [Registration] → [Application Form] → [Document Upload] → [Review] → [Status Tracking]
  Epic 1        Epic 1            Epic 2              Epic 2          Epic 2      Epic 3
```

### Decision Points

[Key decision points in the journey that affect which screens the user sees]

---

## 3. Screen Map (All Epics)

| Screen | Epic | Route | User Story | Status | Dependencies |
|--------|------|-------|-----------|--------|-------------|
| [Screen Name] | [Epic Name] | `/route/path` | US-xx | Planned / In Design / Done | [Other screens] |

> **Rule**: Every screen across ALL epics must be listed here. UX Designer updates this table each time `/write-ux-spec` is run.

---

## 4. Navigation Pattern

### Module Navigation

[How users navigate within this module — must be consistent with the app's navigation pattern from `APP-CONTEXT-GUIDE.md`]

### Breadcrumb Structure

```
[App Name] > [Module Name] > [Section] > [Current Screen]
```

---

## 5. Shared Layout

### Layout Description

[Common layout elements that ALL screens in this module share: header, sidebar, breadcrumbs, footer, etc.]

### Mock Layout Path

```
src/app/design-mocks/_shared/[module-name]/layout.tsx
```

> **UI Developer**: Create this shared layout when building the first epic's mocks. All subsequent epic mocks must use it.

---

## 6. Shared Components (Cross-Epic)

| Component | Used In (Epics) | Source | Notes |
|-----------|----------------|--------|-------|
| [Component Name] | Epic 1, Epic 2 | Component Registry / New | [Reuse existing or create new] |

> **Rule**: Check `docs/architecture/registries/[app]-components.md` first. Only list NEW components if no existing component serves the same purpose.
> **UI Developer**: Update this table when creating new shared components via `/write-frontend-spec`.

---

## 7. Cross-Epic Dependencies

| Epic | Depends On | Shared State | Notes |
|------|-----------|-------------|-------|
| [Epic Name] | [Other Epic] | [What state is shared] | [Execution order notes] |

---

## 8. Cross-Epic UX Decisions

### Navigation

[Shared navigation decisions that apply across all epics in this module]

### Layout

[Shared layout decisions — container widths, card styles, spacing patterns]

### State Persistence

[What state carries between screens across epics — user progress, form data, selections]

---

## 9. Visual Theme Reference

> See `docs/architecture/APP-CONTEXT-GUIDE.md` — Section: [app-name]
>
> All designs in this module must follow the app's Visual Theme Direction.
> Pull actual design values from the component registry, not from the theme description.
