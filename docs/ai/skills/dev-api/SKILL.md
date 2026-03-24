---
name: dev-api
description: Implement the API layer for an epic — create request/response interfaces and API functions, then output a todo checklist of what was done
---

# Dev API

Implements the full API layer for a given module/epic: reads the technical spec, creates TypeScript interfaces and API functions, then reports a todo checklist of completed and remaining items.

## Usage

```bash
/dev-api [module-name] [epic-name]
```

## Required Input Data

Read and verify these are `🟢 Final / Approved` before starting:

1. `docs/modules/$1/$2/02-technical-spec.md` — API endpoints, request/response shapes, error codes
2. `docs/ai/rules/developer/` — Coding standards
3. `docs/shared/error-handling.md` — Error handling patterns
4. `.cursorrules` — Architecture overview (which service API to use)

If any document is missing or `⚪ Draft`:

```
❌ Technical spec not found or not approved.
Please have the Tech Lead approve docs/modules/$1/$2/02-technical-spec.md before running /dev-api.
```

---

## Workflow

### Step 1: Read the Technical Spec

Extract from `02-technical-spec.md`:
- Which service API to use: `productAPI` / `customerAPI` / `orderAPI`
- All endpoints: method, path, request body fields, response fields, error codes
- Authentication requirements (`CurrentMerchantSlug` header or Bearer token)
- Data types and enums

### Step 2: Determine Output File Number

List all files in `docs/modules/$1/$2/`. Find the highest numeric prefix (e.g. `06-...` → next is `07`). Name the output file `[next]-dev-api.md`.

Example: if the folder already has `01-epic.md`, `02-technical-spec.md`, `03-frontend-spec.md` → output is `04-dev-api.md`.

### Step 3: Create Todo List & Implement

Create `docs/modules/$1/$2/[N]-dev-api.md` with the checklist below, then **immediately implement each item**.

```markdown
# API Implementation — $1 / $2

## Interfaces
- [ ] Request interface: `src/interfaces/[domain]/$1.request.interface.ts`
- [ ] Response interface: `src/interfaces/[domain]/$1.response.interface.ts`

## API Functions
<!-- one item per endpoint from the technical spec -->
- [ ] `[functionName]` — [METHOD] /v1/[endpoint]
- [ ] `[functionName]` — [METHOD] /v1/[endpoint]

## Done
- [ ] All interfaces match technical spec field names and types
- [ ] All API functions use correct service API instance
- [ ] JSDoc added to every exported function
- [ ] Error handling included in each function
```

### Step 3: Implement Interfaces

```typescript
// src/interfaces/[domain]/$1.request.interface.ts

/** Payload for [endpoint description] */
export interface I[Feature]Request[Name] {
  /** [field description] */
  fieldName: string;
}
```

```typescript
// src/interfaces/[domain]/$1.response.interface.ts

export enum [Feature]ResponseCode {
  SUCCESS = 'CODE001',
}

export interface I[Feature]Response[Name] {
  code: [Feature]ResponseCode;
  data: {
    fieldName: string;
  };
}
```

### Step 4: Implement API Functions

```typescript
// src/api/$1.api.ts
import { [serviceAPI] } from '@/libs/axios'; // productAPI | customerAPI | orderAPI

/**
 * [What this function does — from tech spec]
 * @param data - [request description]
 */
export const [functionName] = async (
  data: I[Feature]RequestPayload,
): Promise<I[Feature]Response> => {
  const response = await [serviceAPI].post<I[Feature]Response>(
    '/v1/[endpoint]',
    data,
  );
  return response.data;
};
```

> **Auth header pattern** — when `CurrentMerchantSlug` is required:
> ```typescript
> { headers: { CurrentMerchantSlug: merchantSlug } }
> ```

---

## Output — Todo Checklist

After implementing, respond with the updated `[N]-dev-api.md` checklist showing:
- `[x]` for completed items
- `[ ]` for anything that could not be completed (with reason)

Example:

```
✅ API Layer Complete — $1 / $2

📋 docs/modules/$1/$2/[N]-dev-api.md

## Interfaces
- [x] Request interface: src/interfaces/auth/$1.request.interface.ts
- [x] Response interface: src/interfaces/auth/$1.response.interface.ts

## API Functions
- [x] checkPhoneNumber — POST /v1/register/check-phone-number
- [x] sendOtp — POST /v1/register/send-otp
- [x] verifyOtp — POST /v1/register/verify-otp

## Done
- [x] All interfaces match technical spec
- [x] JSDoc added
- [x] Error handling included

▶ Next: run /dev-test-api $1 $2
```

## Reference

- Code standards: `docs/ai/rules/developer/`
- Error handling: `docs/shared/error-handling.md`
- Architecture: `.cursorrules`
```

## Reference

- Code standards: `docs/ai/rules/developer/`
- Error handling: `docs/shared/error-handling.md`
- Architecture: `.cursorrules`
