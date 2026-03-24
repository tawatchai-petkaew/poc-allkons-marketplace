Playwright end-to-end tests for this repository.

Quick start

1. Install Playwright test runner and browsers:

```bash
pnpm add -D @playwright/test
npx playwright install
```

2. Add scripts to `package.json` (examples):

```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:report": "playwright show-report"
}
```

3. Run the tests:

```bash
pnpm run test:e2e
```

Notes

- Ensure your app is running at `http://localhost:3000` or set `PLAYWRIGHT_BASE_URL`.
- Update selectors in `playwright/tests` and `page-objects` to match your app.
