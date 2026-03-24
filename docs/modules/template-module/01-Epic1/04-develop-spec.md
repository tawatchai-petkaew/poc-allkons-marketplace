# Development Specification
**Author/Owner**: Developer
**Epic**: [Epic Number] — [Epic Name]
**Module**: [Module Name]
**Date**: [YYYY-MM-DD]
**Status**: ⚪ Draft

## Change Log
| Version | Date | Changes | Updated By | Status |
|---------|------|---------|------------|--------|
| v1.0 | [YYYY-MM-DD] | Initial version | Developer | ⚪ Draft |

> **💡 When updating:** Change Status to 🟢 Final / Approved ONLY AFTER explicit approval.

---

## References
- **BRD**: `docs/modules/[module-name]/brd.md`
- **Epic**: `docs/modules/[module-name]/[epic]/01-epic.md`
- **Tech Spec**: `docs/modules/[module-name]/[epic]/02-technical-spec.md`
- **Frontend Spec**: `docs/modules/[module-name]/[epic]/03-frontend-spec.md`
- **Test Spec**: `docs/modules/[module-name]/[epic]/05-test-spec.md`

---

## Summary
Brief description of what was implemented.

---

## Traceability

| User Story | FR / API Endpoint Implemented | Files | Status |
|------------|-------------------------------|-------|--------|
| US-01 | FR-001 / `GET /api/[service]/v1/[resource]` | `src/app/...`, `src/api/...` | ⬜ Pending |
| US-02 | FR-002 / `POST /api/[service]/v1/[resource]` | `src/app/...`, `src/api/...` | ⬜ Pending |

---

## Changes Made

### New Files Created
| File | Description | Maps to |
|------|-------------|---------|
| `src/app/(auth)/[route]/page.tsx` | [Description] | US-xx |
| `src/api/[module].api.ts` | [Description] | FR-xxx |
| `src/interfaces/[domain]/[module].interface.ts` | [Description] | Tech Spec Section 5 |

### Modified Files
| File | What Changed | Maps to |
|------|-------------|---------|
| `src/constants/routing.constants.ts` | Added route | — |

### API Endpoints Integrated
| Method | Endpoint | Description | Maps to |
|--------|----------|-------------|---------|
| `GET` | `/api/[service]/v1/[resource]` | [Description] | FR-xxx, US-xx |
| `POST` | `/api/[service]/v1/[resource]` | [Description] | FR-xxx, US-xx |

---

## Implementation Details

### Tech Stack Used
- Libraries, frameworks, patterns used

### Architecture Decisions
- Key decisions made during implementation and rationale

### Key Functions
```typescript
// Example key function
async function mainFunction() {
  // Implementation details
}
```

### State Management
- What state is managed (Zustand / React Query / Component state)
- How data flows between components

---

## Testing Instructions

### Prerequisites
- Login as [role]
- Prepare [test data]
- Ensure [service] is running on [environment]

### Manual Testing Flow
1. Navigate to [page]
2. Perform [action]
3. Verify [result]

### Test Data
| Data | Value | Purpose |
|------|-------|---------|
| [Data 1] | [Value] | [For testing scenario X] |

### States to Verify
- [ ] Empty state — no data available
- [ ] Loading state — data is being fetched
- [ ] Success state — data loaded correctly
- [ ] Error state — API returns error
- [ ] Permission denied — user lacks access

---

## Deployment Info
- **Branch**: `feat/[module-name]`
- **PR**: #[number]
- **Environment**: [SIT/Staging URL]
- **Deployed At**: [YYYY-MM-DD HH:MM]

---

## Known Issues / Limitations
| Issue | Severity | Workaround | Planned Fix |
|-------|----------|------------|-------------|
| [Issue 1] | [Low/Medium/High] | [Workaround] | [When] |

---

## Questions for QA
- [ ] Question 1
- [ ] Question 2

---

## Sign-off Required From
- [ ] Developer
- [ ] Tech Lead
