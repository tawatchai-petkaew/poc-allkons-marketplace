---
name: write-ux-overview
description: Create a module-level UX overview — screen map, navigation, shared layout, cross-epic flow — before designing individual epics. Produces MODULE-UX-OVERVIEW.md and updates the IA sitemap.
---

# Write UX Overview

Creates a module-level UX overview that connects all epics together, establishing the big picture before individual epic design begins.

**Role scope:** The UX Designer runs this skill **before** `/write-ux-spec`. It produces `MODULE-UX-OVERVIEW.md` — the module's screen map, navigation pattern, shared layout, and cross-epic flow. This document becomes the mandatory context for all subsequent epic-level UX and UI work in the module.

> **Role guide:** See `docs/ai/roles/ux-designer.md` for the UX Designer's full role context.

---

## Usage

```bash
/write-ux-overview [module-name]
```

## Instructions

When the user invokes `/write-ux-overview [module-name]`:

**Step 1: Read App-Level IA**
Read:
1. `docs/architecture/INFORMATION-ARCHITECTURE.md` — Understand the full ecosystem: what apps exist, what modules exist in each app, where does this module fit
2. Identify which app this module belongs to (buyer-platform / seller-platform / startup-partner-platform)

If IA sitemap does not exist, tell user:
```
⚠️ IA sitemap not found: docs/architecture/INFORMATION-ARCHITECTURE.md
Creating module overview without global context. Please create the IA sitemap for full cross-app visibility.
```

**Step 2: Read App Context & Component Registry**
Read:
1. `docs/architecture/APP-CONTEXT-GUIDE.md` — Understand the app's technical context and **Visual Theme Direction**
2. `docs/architecture/registries/[app]-components.md` — Know what components already exist
   - buyer-platform → `docs/architecture/registries/buyer-components.md`
   - seller-platform → `docs/architecture/registries/seller-components.md`
   - startup-partner-platform → `docs/architecture/registries/startup-partner-components.md`

**Step 3: Read Module Documents**
Read:
1. `docs/modules/$1/brd.md` — Business Requirements (must be approved)
2. **ALL** `docs/modules/$1/*/01-epic.md` — Read EVERY epic in the module, not just one
   - Focus on: User Stories, Screens needed, User flows, Role matrix
3. `docs/modules/$1/*/02-technical-spec.md` — Tech specs if available (for API context)

If BRD doesn't exist or is not approved, tell user:
```
❌ BRD not found or not approved: docs/modules/$1/brd.md
Please ensure BSA has created and approved the BRD before UX can start.
```

**Step 4: Define Module Position** (mandatory)

For the MODULE-UX-OVERVIEW.md, clearly define:
- **App Context**: Which app does this module belong to
- **Position in App**: Where does it sit in the app's navigation (e.g., which sidebar item, which section of the navbar)
- **Relationship to Other Modules**: How does it connect to existing modules in the same app
- **Entry Points**: How do users reach this module from within the app

**Step 5: Design Module-Level IA**

Create the module-level information architecture:

1. **Screen Map** — List ALL screens across ALL epics in one table:
   | Screen | Epic | Route | User Story | Status | Dependencies |

2. **Module-Level User Journey** — How the user flows through the module:
   - Happy path across epics
   - Decision points
   - Cross-epic transitions

3. **Navigation Pattern** — How navigation works within this module:
   - Must be consistent with the app's navigation pattern (from APP-CONTEXT-GUIDE.md)
   - Breadcrumbs, sidebar items, back navigation

4. **Shared Layout Concept** — The layout shell for all screens in this module:
   - Header/sidebar consistent with app
   - Common elements (breadcrumbs, back button, etc.)
   - Mock layout path: `src/app/design-mocks/_shared/[module-name]/layout.tsx`

5. **Cross-Epic Dependencies** — Which epics depend on which:
   - Epic execution order
   - Shared state between epics

**Step 6: Identify Shared Components**

Components that will be reused across multiple epics:
| Component | Used In (Epics) | Source | Notes |
- Check component registry first — reuse existing components
- Only list NEW components that need to be created

**Step 7: Output MODULE-UX-OVERVIEW.md**

Write to: `docs/modules/$1/MODULE-UX-OVERVIEW.md`

Use this structure:
```markdown
# UX Overview: [Module Name]

**Date:** [YYYY-MM-DD]
**Status:** ⚪ Draft
**App Context:** [buyer-platform | seller-platform | startup-partner-platform]
**Component Registry:** docs/architecture/registries/[app]-components.md

## Change Log
| Version | Date | Changes | Updated By | Status |
|---------|------|---------|------------|--------|
| v1.0 | [date] | Initial module UX overview | UX Designer | ⚪ Draft |

## 1. Module Position

### App Context
[Which app, where it sits, how it connects]

### Position in App Navigation
[Sidebar item, navbar section, entry point from other modules]

### Entry Points
[How users reach this module]

### Relationship to Other Modules
[Connections, shared flows, dependencies]

## 2. Module-Level User Journey

### Happy Path
```
[Flow diagram showing the main journey across epics]
```

### Decision Points
[Key decision points in the journey]

## 3. Screen Map (All Epics)

| Screen | Epic | Route | User Story | Status | Dependencies |
|--------|------|-------|-----------|--------|-------------|
| ... | ... | ... | US-xx | Planned | ... |

## 4. Navigation Pattern

### Module Navigation
[How users navigate within this module]

### Breadcrumb Structure
[Breadcrumb pattern for screens in this module]

## 5. Shared Layout

### Layout Description
[Common layout elements: header, sidebar, breadcrumbs]

### Mock Layout Path
`src/app/design-mocks/_shared/[module-name]/layout.tsx`

## 6. Shared Components (Cross-Epic)

| Component | Used In (Epics) | Source | Notes |
|-----------|----------------|--------|-------|
| ... | Epic 1, 2 | Component Registry | Reuse existing |

## 7. Cross-Epic Dependencies

| Epic | Depends On | Shared State | Notes |
|------|-----------|-------------|-------|
| ... | ... | ... | ... |

## 8. Cross-Epic UX Decisions

### Navigation
[Shared navigation decisions]

### Layout
[Shared layout decisions]

### State Persistence
[What state carries between screens/epics]

## 9. Visual Theme Reference

App Visual Theme Direction: See `docs/architecture/APP-CONTEXT-GUIDE.md` Section [app-name]
```

**Step 8: Update IA Sitemap (bidirectional)**

Read `docs/architecture/INFORMATION-ARCHITECTURE.md` and update:
1. Add/update the module row in the correct app's Module Map table
2. Set Screen count, Epic count, Status, and link to MODULE-UX-OVERVIEW.md

**Step 9: Provide Next Steps**

Tell the user:
```
✅ Module UX Overview created: docs/modules/$1/MODULE-UX-OVERVIEW.md

Overview Summary:
- App Context: [app-name]
- Epics covered: [X]
- Total screens: [X]
- Shared components: [X]
- Cross-epic dependencies: [X]

IA Sitemap updated: docs/architecture/INFORMATION-ARCHITECTURE.md

Next steps:
1. Review the screen map and navigation pattern.
2. If approved, start designing individual epics with /write-ux-spec $1 [epic-name]
3. Each /write-ux-spec will use this overview as mandatory context.
```

## Tips for AI

- **Read ALL epics first**: Don't design from a single epic — read every 01-epic.md in the module
- **Check existing modules**: Read the IA sitemap to see what other modules exist in the app
- **Reuse components**: Check the component registry before proposing new components
- **Follow app navigation**: Module navigation must be consistent with the app's pattern
- **Think cross-epic**: The whole point is to connect epics — don't design in isolation
- **Visual Theme**: Reference the app's Visual Theme Direction for design consistency
- **No code**: This is UX architecture — describe layouts and flows, don't write TSX

## Reference

- UX Designer role: `docs/ai/roles/ux-designer.md`
- IA Sitemap: `docs/architecture/INFORMATION-ARCHITECTURE.md`
- App Context: `docs/architecture/APP-CONTEXT-GUIDE.md`
- Component Registries: `docs/architecture/registries/`
