---
name: implement-feature
description: Generate complete module implementation from BRD and Design Spec, following project architecture patterns
---

# Implement Module

Generates a complete module implementation from BRD and Design Spec.

## Usage

```bash
/implement-feature [module-name] [epic-name]

# With options:
/implement-feature [module-name] [epic-name] --api-only
/implement-feature [module-name] [epic-name] --ui-only
```

## Instructions

When the user invokes `/implement-feature [module-name] [epic-name]`:

**Step 1: Read Final Requirements**
Read in order:

1. `docs/modules/$1/brd.md` - Business requirements (MUST be `🟢 Final / Approved`)
2. `docs/modules/$1/$2/01-epic.md` - Epic stories and rules
3. `docs/modules/$1/$2/02-technical-spec.md` - Architecture, schema, and API specs (MUST be `🟢 Final / Approved`)
4. `docs/modules/$1/$2/03-frontend-spec.md` - Frontend spec (Phase 1: UX Design + Phase 2: Frontend Implementation — both MUST be `🟢 Final / Approved`)
5. `docs/ai/rules/developer/01-project-structure.md` - Technical architecture overview
6. `docs/ai/rules/developer/` - Detailed coding rules (read relevant files based on implementation needs)
8. `docs/shared/glossary.md` - Central UX writing glossary (UI text consistency)
9. `docs/shared/error-handling.md` - Error display patterns and error code catalog
10. `docs/shared/test-data/$1/test-data.md` - Test data for the module (if exists)
11. `docs/ai/rules/ux-designer/01-validation-rules.md` - Global field validation rules
12. `docs/ai/rules/ux-designer/02-ux-ui-patterns.md` - Reusable UX/UI pattern library
13. `docs/ai/rules/ux-designer/03-ux-writing.md` - UX Writing & Copy Standards (UI strings must match glossary)

If any required document doesn't exist or is marked `⚪ Draft`, tell user:

```
❌ Final specifications not found or not approved.

Please ensure BSA, Tech Lead, UX Designer, and UI Developer have reviewed and approved their respective documents to "🟢 Final / Approved" before DEV can start implementation.
```

**Step 2: Analyze and Plan**
Determine what needs to be implemented:

```
Implementation Plan for: $1 - $2

Files to CREATE:
- src/app/(auth)/[route]/page.tsx
- src/api/$1.api.ts
- src/interfaces/[domain]/$1.*.interface.ts
- src/components/[ComponentName]/index.tsx

Files to MODIFY:
- src/constants/routing.constants.ts
- [Other files that need updates]

Dependencies:
- [Any new packages needed]
```

**Step 3: Generate TypeScript Interfaces**
From BRD data models, create interfaces:

```typescript
// src/interfaces/[domain]/$1.request.interface.ts
/**
 * Request payload for $1
 */
export interface I[ModuleName]Request {
  // Follow docs/ai/rules/developer/05-typescript-conventions.md conventions
  // Use camelCase
  // Add JSDoc comments
  // Import shared types
}

// src/interfaces/[domain]/$1.response.interface.ts
import { ApiResponse } from '@/types/common.type';

export interface I[ModuleName]Response {
  // Response data structure from BRD
}
```

**Step 4: Generate API Integration**
Create API functions following docs/ai/rules/developer/03-api-and-data-fetching.md patterns:

```typescript
// src/api/$1.api.ts
import { productAPI } from '@/libs/axios'; // or customerAPI, orderAPI
import type { I[Module]Request, I[Module]Response } from '@/interfaces/...';
import type { ApiResponse } from '@/types/common.type';

/**
 * [Description from BRD]
 */
export const [functionName] = async (
  merchantSlug: string,
  data: I[Module]Request
): Promise<ApiResponse<I[Module]Response>> => {
  const response = await productAPI.post<ApiResponse<I[Module]Response>>(
    '/v1/[endpoint-from-BRD]',
    data,
    {
      headers: {
        CurrentMerchantSlug: merchantSlug,
      },
    }
  );
  return response.data;
};
```

**Step 5: Generate React Components**
From design spec, create components:

```typescript
// src/app/(auth)/[route]/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Modal, Form, message } from 'antd';
import { useUserStore } from '@/store/user.store';
import { [apiFunction] } from '@/api/$1.api';

export default function [ModuleName]Page() {
  const { merchantSlug } = useUserStore();

  // React Query for data fetching
  const { data, isLoading } = useQuery({
    queryKey: ['$1', merchantSlug],
    queryFn: () => [apiFunction](merchantSlug),
    enabled: !!merchantSlug,
  });

  // Mutation for updates
  const mutation = useMutation({
    mutationFn: [apiFunction],
    onSuccess: () => {
      message.success('Success message');
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  // Implement all states from design spec:
  // - Empty state
  // - Loading state
  // - Error state
  // - Success state

  return (
    <div>
      {/* Implementation following design spec */}
    </div>
  );
}
```

**Step 6: Update Routing**
Add route to constants:

```typescript
// src/constants/routing.constants.ts
export const routes = {
  // ... existing routes
  [featureName]: () => "/[route-path]",
};
```

**Step 7: Create Implementation Doc**
Generate handoff document:

```markdown
# Implementation: $1

## Summary

[Brief description of what was implemented]

## Changes Made

### New Files Created

- src/app/(auth)/[...]/page.tsx - [Description]
- src/api/$1.api.ts - [Description]
- src/interfaces/[...]/$1.\*.interface.ts - [Description]

### Modified Files

- [List files modified]

### API Endpoints Used

- POST /api/[service]/v1/[endpoint] - [Description]

## Testing Instructions

### Prerequisites

- Login as [role]
- Have test data ready: [location]

### Manual Testing Flow

1. Navigate to [URL]
2. [Step 2]
3. [Step 3]
4. Verify [expected result]

### Test Data

[Provide sample test data]

### Known Issues / Limitations

- [List any known issues]

## Deployment Info

- **Branch**: feat/$1-$2
- **Staging URL**: [URL]

## Related Documents

- **BRD**: docs/modules/$1/brd.md
- **Epic**: docs/modules/$1/$2/01-epic.md
- **Tech Spec**: docs/modules/$1/$2/02-technical-spec.md
- **Design Spec**: docs/modules/$1/$2/03-frontend-spec.md
```

Save to: `docs/modules/$1/$2/04-develop-spec.md`

**Step 7b: Update Shared Documentation**
After implementation, update these shared files if new items were introduced:

1. `docs/shared/error-handling.md` — Add any new error codes or error display patterns discovered during implementation
2. `docs/shared/test-data/$1/test-data.md` — **Create (if not exists) or update** test data with new test scenarios, accounts, or edge cases found during implementation. If creating, use `docs/shared/test-data/_template.md` as format and populate from `01-epic.md` Section 2 + `mockData.ts` (if exists)
3. `docs/shared/glossary.md` — Add any new UI terms or messages introduced in the implementation

**Step 8: Update Component Registry**
If new shared/reusable components were created during implementation:

1. Determine which app this module belongs to (buyer/seller/startup-partner)
2. Update `docs/architecture/registries/[app]-components.md`:
   - Add new components to Section 2 (Component Catalog)
   - Update import paths from mock paths to production paths
   - Add props interface, variants, and states

**Step 9: Provide Next Steps**
Tell the user:

```
✅ Draft Implementation complete!

Files created/modified:
- [List files]
- Implementation doc: docs/modules/$1/$2/04-develop-spec.md

Next steps for Developer:
1. Review the generated code and APIs.
2. Test locally: `pnpm dev`
3. If you approve the implementation, please reply "I approve" so I can mark this Implementation as Final.
4. Once marked Final, deploy to the SIT Environment.
5. Only after it is Final and deployed to SIT can QA take over to write the Test Plan.
```

## Tips for AI

- **Read rules first**: Check `docs/ai/rules/developer/` for specific patterns before implementing
- **Follow patterns**: Read existing code in similar modules
- **Code standards**: Follow `docs/ai/rules/developer/05-typescript-conventions.md` strictly
- **Component patterns**: Reference `docs/ai/rules/developer/02-components.md` for component structure
- **API patterns**: Follow `docs/ai/rules/developer/03-api-and-data-fetching.md` for all API calls
- **Handle all states**: Empty, loading, error, success (from design spec)
- **Error handling**: Always catch and display user-friendly errors
- **UX Writing**: All UI strings (labels, messages, errors) MUST match `docs/shared/glossary.md`. Do not introduce new Thai text without updating the glossary. Follow `docs/ai/rules/ux-designer/03-ux-writing.md`.
- **Accessibility**: Add ARIA labels, keyboard navigation
- **TypeScript strict**: No 'any' types (see TypeScript conventions rule)
- **Merchant context**: Always use CurrentMerchantSlug header (see API rule)
- **API proxy**: Use /api/[service]/* not direct backend URLs (see `docs/ai/rules/developer/03-api-and-data-fetching.md`)

## Options

- `--api-only`: Generate only API integration (no UI)
- `--ui-only`: Generate only UI components (assume API exists)

## Reference

Read `docs/ai/roles/developer.md` for more development patterns and tips.
