---
name: dev-test-api
description: Verify all API endpoints in an epic are correctly implemented before UI integration — checks method, path, types, headers, and error handling
---

# Dev Test API

Verifies every API endpoint defined in the technical spec is correctly implemented in the API layer. Reads `02-technical-spec.md`, then checks each function in `src/api/$1.api.ts` against it. Reports pass/fail per endpoint with clear remediation steps.

## Usage

```bash
/dev-test-api [module-name] [epic-name]
```

## Prerequisites

- `/dev-api $1 $2` must be completed first
- `docs/modules/$1/$2/02-technical-spec.md` must be `🟢 Final / Approved`
- `src/api/$1.api.ts` must exist

---

## Workflow

### Step 1: Determine Output File Number

List all files in `docs/modules/$1/$2/`. Find the highest numeric prefix and use the next number. Name the output file `[next]-dev-test-api.md`.

### Step 2: Load Spec & Implementation

Read in parallel:
1. `docs/modules/$1/$2/02-technical-spec.md` — extract all endpoint definitions
2. `src/api/$1.api.ts` — read all implemented functions
3. `src/interfaces/[domain]/$1.request.interface.ts`
4. `src/interfaces/[domain]/$1.response.interface.ts`

### Step 2: Verify Each Endpoint

For every endpoint in the technical spec, check:

| Check | Pass Condition |
|---|---|
| **Function exists** | Exported function found in `$1.api.ts` |
| **HTTP method** | `.post` / `.get` / `.put` / `.delete` matches spec |
| **URL path** | Exact string matches spec (no trailing slash differences) |
| **Request type** | Parameter type matches request interface fields and types |
| **Response type** | Return type matches response interface |
| **Auth header** | `CurrentMerchantSlug` present if spec requires it |
| **Bearer token** | `Authorization: Bearer` flow present if spec requires it |
| **Error codes** | All spec error codes (4xx/5xx) are represented in interfaces/enums |

### Step 3: Verify Interfaces

For every interface field in the spec:
- Field name is `camelCase` (not `snake_case`)
- TypeScript type matches spec type (`string`, `number`, `boolean`, enum)
- Optional fields are marked with `?`
- Enums cover all response codes listed in the spec

### Step 4: Report Results

Output a checklist per endpoint:

```
🔍 API Verification — $1 / $2

## Endpoint: checkPhoneNumber
- [x] Function exported from src/api/$1.api.ts
- [x] Method: POST
- [x] Path: /v1/register/check-phone-number
- [x] Request type: IAuthRequestCheckPhonePayload
- [x] Response type: IAuthResponseCheckPhone
- [x] No auth header required (pre-auth endpoint) ✓
- [x] Error codes: 400, 409, 500 covered in interfaces

## Endpoint: verifyOtp
- [x] Function exported
- [x] Method: POST
- [x] Path: /v1/register/verify-otp
- [x] Request type matches spec
- [x] Response type matches spec
- [ ] ⚠️ Missing error code 410 (OTP expired) in ResponseCode enum

---
✅ 8 / 9 checks passed
⚠️  1 issue found — fix before running /dev-integrate
```

### Step 5: Fix Issues

If any check fails, immediately fix it:
- Missing function → implement it
- Wrong HTTP method or path → correct it
- Missing error code enum → add it
- Wrong field type → update the interface

Re-verify after fixing and output the final clean checklist.

---

## Output Format

Final response must include:

```
✅ API Verified — $1 / $2

All [N] endpoints pass verification.

📋 docs/modules/$1/$2/[N]-dev-test-api.md

Endpoint Summary:
- [x] functionName — POST /v1/path
- [x] functionName — GET /v1/path
...

▶ Next: run /dev-integrate $1 $2
```

Or if issues remain unfixed:

```
⚠️ API Verification Incomplete — $1 / $2

[N] issues remain:
1. [description of issue + file + line]
2. ...

Fix these before running /dev-integrate.
```
```

## Reference

- Technical spec: `docs/modules/$1/$2/02-technical-spec.md`
- API implementation: `src/api/$1.api.ts`
- Developer rules: `docs/ai/rules/developer/`
