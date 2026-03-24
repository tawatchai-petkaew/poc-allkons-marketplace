---
name: dev-final-test
description: Final quality gate for an epic — verify performance targets and security requirements are met before merging to staging
---

# Dev Final Test

Runs a final quality check on a completed epic before it merges to staging. Validates performance benchmarks and security requirements by inspecting the implemented code. Reports pass/fail with actionable fixes.

## Usage

```bash
/dev-final-test [module-name] [epic-name]
```

## Prerequisites

- `/dev-integrate $1 $2` completed ✅
- All pages and API functions implemented
- `docs/modules/$1/$2/02-technical-spec.md` available for reference

---

## Workflow

### Step 1: Determine Output File Number

List all files in `docs/modules/$1/$2/`. Find the highest numeric prefix and use the next number. Name the output file `[next]-dev-final-test.md`.

### Step 2: Locate All Implemented Files

Read the `[N-1]-dev-integrate.md` file in `docs/modules/$1/$2/` to get the list of created files, then read:
- All page files created for this epic
- `src/api/$1.api.ts`
- Relevant interface files

### Step 2: Performance Check

Inspect the implementation for these patterns:

| Check | Pass Condition |
|---|---|
| **No blocking synchronous operations** | No `fs.readFileSync`, no long loops on main thread in API route handlers |
| **React Query caching** | `useQuery` calls have appropriate `staleTime` / `gcTime` set |
| **No redundant API calls** | No duplicate `useQuery` with same key on the same page |
| **Pagination used** | List endpoints use pagination (not fetching all records) |
| **Image optimization** | `next/image` used instead of `<img>` tags |
| **No unnecessary re-renders** | `useMemo` / `useCallback` applied where props cause child re-renders in loops |
| **Bundle size** | No full library imports (e.g., `import _ from 'lodash'` → should be `import debounce from 'lodash/debounce'`) |

**Targets from technical spec:**
- API response time target: per spec (default < 500ms)
- Page initial load: < 2000ms
- Time to Interactive: < 3000ms

### Step 3: Security Check

Inspect the implementation for these patterns:

| Check | Pass Condition |
|---|---|
| **Input sanitization** | Form inputs use `Form.Item` validation rules; no raw `innerHTML` usage |
| **XSS prevention** | No `dangerouslySetInnerHTML` without explicit sanitization |
| **Auth headers present** | API functions that require auth have `CurrentMerchantSlug` or `Authorization` headers |
| **No secrets in client code** | No API keys, tokens, or passwords hardcoded in `src/` |
| **HTTPS-only URLs** | No `http://` hardcoded external URLs in production code |
| **Sensitive data not in localStorage** | Tokens stored in httpOnly cookies, not `localStorage.setItem` |
| **Error messages safe** | User-facing errors don't expose stack traces or internal paths |
| **Input length limits** | Form fields have `maxLength` where spec defines field limits |

### Step 4: Code Quality Check

| Check | Pass Condition |
|---|---|
| **No `any` types** | TypeScript `any` not used; proper interfaces used |
| **No console.log in production code** | No `console.log` / `console.error` left in `src/` (only in dev/test) |
| **Error boundaries** | Pages that fetch data have error state handling |
| **Accessibility basics** | `<button>` not replaced by `<div onClick>`, form labels linked to inputs |

### Step 5: Report Results

```
🔍 Final Test Report — $1 / $2
================================

## Performance
- [x] No blocking synchronous operations
- [x] React Query staleTime configured
- [x] No redundant API calls
- [ ] ⚠️  <img> tag found in src/app/login/page.tsx:L245 — use next/image

## Security
- [x] All inputs use Form.Item validation
- [x] No dangerouslySetInnerHTML
- [x] Auth headers present on protected endpoints
- [x] No secrets in client code
- [ ] ⚠️  console.log found in src/api/$1.api.ts:L34

## Code Quality
- [x] No any types
- [x] Error states handled on all pages
- [x] Accessibility: labels linked

---
✅ 11 / 13 checks passed
⚠️  2 issues found
```

### Step 6: Fix All Issues

Fix every failing check immediately, then re-verify and output the final clean report.

---

## Output — Final Clean Report

```
✅ Final Test Passed — $1 / $2

## Performance   ✅ 7 / 7
## Security      ✅ 8 / 8
## Code Quality  ✅ 4 / 4

All 19 checks passed. Epic is ready for code review and merge to staging.
📋 docs/modules/$1/$2/[N]-dev-final-test.md

▶ Next steps:
1. Open PR: feat/$1-$2 → staging
2. Request code review
3. After merge, deploy to SIT and share URL with QA team
```

## Reference

- Technical spec: `docs/modules/$1/$2/02-technical-spec.md`
- Developer rules: `docs/ai/rules/developer/`
- Error handling: `docs/shared/error-handling.md`
