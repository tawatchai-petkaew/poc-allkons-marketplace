---
name: dev-integrate
description: Duplicate mock UI from the frontend spec into a real page component and wire up real API calls — replacing all hardcoded/mock data with live API integration
---

# Dev Integrate

Takes the mock UI defined in `03-frontend-spec.md` and the verified API layer from `/dev-api`, then:
1. Creates the real page/component files that match the mock exactly
2. Replaces all hardcoded / mock data with real API calls using React Query
3. Connects state management (Zustand), loading states, and error handling

## Usage

```bash
/dev-integrate [module-name] [epic-name]
```

## Prerequisites

- `/dev-api $1 $2` completed ✅
- `/dev-test-api $1 $2` passed ✅ (all endpoints verified)
- `docs/modules/$1/$2/03-frontend-spec.md` must be `🟢 Final / Approved`

---

## Workflow

### Step 1: Determine Output File Number

List all files in `docs/modules/$1/$2/`. Find the highest numeric prefix and use the next number. Name the output file `[next]-dev-integrate.md`.

### Step 2: Read Required Context

Read in parallel:
1. `docs/modules/$1/$2/03-frontend-spec.md` — mock UI structure, component tree, form fields, validation rules, UX flows
2. `src/api/$1.api.ts` — all available API functions
3. `src/interfaces/[domain]/$1.request.interface.ts`
4. `src/interfaces/[domain]/$1.response.interface.ts`
5. `docs/shared/error-handling.md` — error display patterns
6. `docs/shared/glossary.md` — UX copy and label text
7. `docs/ai/rules/ux-designer/` — UX patterns (form validation, feedback messages)

### Step 2: Map Mock → Real

For each screen/step in the frontend spec:

| Mock Element | Real Implementation |
|---|---|
| Hardcoded display data | `useQuery` fetching from API |
| Form submit handler | `useMutation` calling API function |
| `setTimeout` / fake delay | Removed; use `isPending` state |
| Static success/error message | API response-driven feedback |
| Mock state variables | Zustand store or React Query cache |
| Disabled/placeholder buttons | Connected to real mutation state |

### Step 3: Create Real Page

```typescript
// src/app/[route]/page.tsx  (or matching path from frontend spec)
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Form, Button, message, Spin, Alert } from 'antd';
import { useUserStore } from '@/store/user.store';
import { [apiFunction] } from '@/api/$1.api';
import type { I[Feature]Request } from '@/interfaces/[domain]/$1.request.interface';

export default function [FeatureName]Page() {
  const [form] = Form.useForm();
  // Add state for multi-step flows if spec defines steps
  const [step, setStep] = useState<number>(1);

  const mutation = useMutation({
    mutationFn: (values: I[Feature]Request) => [apiFunction](values),
    onSuccess: (res) => {
      // Handle response codes per spec (success, conditional flows)
      message.success('...');
      setStep(prev => prev + 1);
    },
    onError: (err) => {
      // Map error codes to user-facing messages per error-handling.md
      message.error(err.message || 'An error occurred');
    },
  });

  return (
    // Matches mock UI layout exactly
    // All text from glossary.md
    // Validation rules from frontend spec
  );
}
```

### Step 4: Integration Rules

**Form validation** — mirror the spec exactly:
- Required fields: use `Form.Item rules={[{ required: true, message: '...' }]}`
- Pattern validation: regex from spec
- Cross-field validation: use `getFieldValue` in validator

**Multi-step flows** — manage step state locally or in Zustand:
- Pass data between steps via state or query cache
- On back navigation, restore previous step data

**Loading states**:
- Disable submit button while `mutation.isPending`
- Show `<Spin>` overlay on full-page loading
- Skeleton loaders for data fetching (`isLoading`)

**Error handling** — follow `docs/shared/error-handling.md`:
- 400: Show field-level validation error (inline)
- 401/403: Redirect to login
- 409/410: Show specific user-facing message from spec
- 500: Show generic error banner

**Routing** — add route constant if missing:
```typescript
// src/constants/routing.constants.ts
export const ROUTE = {
  [FEATURE_NAME]: '/[route]',
} as const;
```

### Step 5: Output Todo Checklist

Create `docs/modules/$1/$2/[N]-dev-integrate.md` and report completion:

```
✅ Integration Complete — $1 / $2

📋 docs/modules/$1/$2/[N]-dev-integrate.md

## Pages / Components
- [x] src/app/[route]/page.tsx — created, matches mock UI
- [x] Multi-step state wired (steps 1–4)

## API Integration
- [x] functionName → replaced mock data
- [x] functionName → form submit connected
- [x] functionName → conditional flow on response code

## UX / State
- [x] Loading states on all mutations
- [x] Error messages map to spec error codes
- [x] Form validation matches spec rules
- [x] Routing constant added

▶ Next: run /dev-final-test $1 $2
```

## Reference

- Frontend spec: `docs/modules/$1/$2/03-frontend-spec.md`
- Error handling: `docs/shared/error-handling.md`
- UX rules: `docs/ai/rules/ux-designer/`
- API layer: `src/api/$1.api.ts`
