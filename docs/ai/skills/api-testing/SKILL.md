---
name: api-testing
description: QA Automation skill — design and run API-level tests from technical spec (contracts, status codes, error responses) against SIT or mock
---

# API Testing

Supports the QA Automation role in **testing APIs directly** (HTTP requests) — separate from E2E UI tests.

This skill is used when you need to verify **API contracts**, **status codes**, **response schema**, and **error codes** without going through the browser. It **complements** E2E tests (see `execute-automate-tests`), not replaces them.

## Role Scope

The QA Automation (API testing):

- reads API contracts from `02-technical-spec.md`
- reads API-related test cases from `05-test-spec.md`
- designs or generates API test scripts (e.g. Playwright `request` context, or other HTTP client)
- runs tests against SIT (or mock) and records results
- validates status codes, response body, and error codes per contract

The QA Automation does **not** (in this skill):

- design new test cases (that is `design-test-cases`)
- run full E2E flows in the browser (that is `execute-automate-tests`)
- change approved API contracts or acceptance criteria

> **Role guide:** `docs/ai/roles/qa-automation.md`

---

## Objective

Deliver API-level test coverage by:

1. reading API contracts and error codes from technical spec
2. mapping test cases that target API behaviour
3. generating or maintaining API test scripts
4. executing against SIT (or mock) and recording results
5. reporting failures and coverage per endpoint

---

## When to Use

Use this skill when the user asks to:

- test APIs directly (contract / regression)
- verify status codes and response schema for endpoints
- test multiple error codes (4xx/5xx) without running the full UI
- add or run API tests in CI (fast feedback, no browser)
- generate API test scripts from technical spec

Examples:

- `/api-testing authentication 01-RegisterFlow`
- `สร้าง API tests สำหรับ check-phone, verify-otp`
- `ทดสอบ API ของ Register flow ตาม 02-technical-spec`
- `รัน API contract tests ต่อ SIT`

---

## When in the Workflow

API testing fits into the handoff pipeline as follows:

| Phase | What you can do |
|-------|------------------|
| **After Tech Spec (02-technical-spec) approved** | Design and write API test cases/scripts from API contracts. No execution yet unless a mock exists. |
| **If mock is available** | Run API tests against the mock before SIT is ready. |
| **After Dev deploys to SIT** | Run API tests against real SIT. Same precondition as E2E (see `execute-automate-tests`). |

**Recommended order after SIT is ready:**

1. **Run API tests first** — faster, no browser; if the API is broken, you find out before running E2E.
2. **Then run E2E** — validate full user flows through the UI.

This order gives quicker feedback and reduces debugging time when API contract or backend behaviour is wrong.

---

## Required Inputs

| Input | Path |
|------|------|
| Technical Spec (API contracts) | `docs/modules/[module-name]/[epic-name]/02-technical-spec.md` |
| Test Spec (API-related cases) | `docs/modules/[module-name]/[epic-name]/05-test-spec.md` |
| Development Spec (endpoints) | `docs/modules/[module-name]/[epic-name]/04-develop-spec.md` |
| Error Handling | `docs/shared/error-handling.md` |

Optional inputs:

| Input | Path |
|------|------|
| Testing Rules | `docs/ai/rules/testing/06-testing-and-quality.md` |
| Test ID Rules | `docs/ai/rules/testing/testing-ids.md` |
| Shared Test Data | `docs/shared/test-data/[module-name]/test-data.md` |
| Existing API tests | `playwright/tests/[module-name]/[epic-name]/api/` |

---

## Preconditions

Before using this skill, confirm:

- API contracts are documented in `02-technical-spec.md` (endpoints, request/response, error codes)
- SIT (or mock) is available and base URL / proxy is known
- Request format (headers, auth) is clear from `04-develop-spec.md` or technical spec

If API contracts are missing or incomplete, ask Tech Lead / Developer to update the technical spec first.

---

## Responsibilities

- Read API contracts (path, method, request/response, error codes) from technical spec
- Map test cases to endpoints (success + error scenarios)
- Generate or update API test scripts
- Run tests against SIT (or mock) and record Pass / Fail
- Report failures with request/response details
- Optionally document coverage per endpoint

---

## Core Workflow

### Step 1 — Read API contracts and test scope

Read:

- `02-technical-spec.md` — Section API Contracts (endpoints, request/response, error codes)
- `05-test-spec.md` — test cases that reference API behaviour (e.g. "API returns REGISTER_SUCC003", "API returns blockUntil")
- `04-develop-spec.md` — proxy pattern, base URL, auth if needed
- `docs/shared/error-handling.md` — expected error messages and codes

Extract:

- list of endpoints (path, method)
- success response (status, body shape)
- error responses (status, code, message)
- required headers (e.g. `app-id`, auth when applicable)

### Step 2 — Design or generate API tests

- One or more tests per endpoint: success case + relevant error cases
- Use project-chosen tool (e.g. Playwright `request` context, Vitest + fetch/axios)
- Base URL: SIT frontend proxy (e.g. `/api/customer/...`) or backend URL if tests run in environment that can call backend directly
- Reuse shared test data (phones, payloads) where defined

### Step 3 — Execute and record

- Run API test suite against SIT (or mock)
- Record Pass / Fail per test
- On failure: capture request + response (status, body) for bug report

### Step 4 — Report

- Summarise: total / passed / failed
- Link failures to test case IDs and defect reports if needed
- Optionally: coverage matrix endpoint × scenario (success, error code X, error code Y)

---

## Outputs

| Output | Description |
|--------|-------------|
| API test scripts | `playwright/tests/[module-name]/[epic-name]/api/*.spec.ts` |
| Execution result | Pass / Fail per test |
| Failure evidence | Request + response (status, body) for bugs |
| Optional summary | Coverage per endpoint / scenario |

---

## Relationship to Other Skills

- **design-test-cases** — Designs test cases (including API-related ones) in `05-test-spec.md` Phase 1. API testing **consumes** those cases and technical spec to implement and run API-level tests.
- **execute-automate-tests** — Implements and runs **E2E** tests (Playwright UI). API testing is **separate**: same role (QA Automation), different scope (API only). Use both when you want E2E + API coverage.

---

## Script and Environment Notes

- **Proxy:** Client-side calls go through Next.js proxy (`/api/customer/*`, etc.). API tests that run in Node (e.g. Playwright, Vitest) can target the same proxy URL (SIT) or a dedicated API base URL if available.
- **Auth:** For endpoints that require auth, use tokens or test accounts as defined in test data or dev spec.

---

## Reference

- `docs/ai/roles/qa-automation.md`
- `docs/ai/skills/design-test-cases/SKILL.md`
- `docs/ai/skills/execute-automate-tests/SKILL.md`
- `docs/ai/rules/developer/03-api-and-data-fetching.md` (proxy pattern, API usage)
- `docs/shared/error-handling.md`
