# CLAUDE.md

Guidance for working in this repository.

## What this is

A Playwright + TypeScript end-to-end test framework for the **Practice Software
Testing** web app (Angular frontend + Laravel REST API).

- UI base URL: `https://practicesoftwaretesting.com`
- API URL: `https://api.practicesoftwaretesting.com`

The app under test is **not** in this repo. Its source (for reference) lives at
`C:\Users\luwan\source\repos3\practice-software-testing` (the live app maps to
`sprint5/`). All URLs and credentials come from `.env`.

## Project layout

```
.auth/                  Saved storage states per role (gitignored)
.github/workflows/      CI workflow
lib/
  api/                  Typed API client (auth + data setup/teardown) + types
  datafactory/          Faker-backed test-data builders (deterministic via seedFaker)
  fixtures/pages.ts     Custom fixtures; extends base test (import test from here)
  helpers/              Pure utility functions
  pages/                Page Object Model classes
tests/
  auth.setup.ts         Logs in per role (API), saves storage state to .auth/
  public/               No-auth specs (home, catalog, login, sign-up, contact...)
  authenticated/        Specs that require a logged-in session
global.setup.ts         API health check + optional data reset
playwright.config.ts
```

## Key facts (from app inspection)

- **Seeded credentials** (`API/database/seeders/UserSeeder.php`):
  admin `admin@practicesoftwaretesting.com` / customer
  `customer@practicesoftwaretesting.com`, both password `welcome01`.
- **Login**: `POST /users/login` `{ email, password }` →
  `{ access_token, token_type, expires_in }`.
- **Auth persistence**: the Angular app stores the JWT in `localStorage` under
  `auth-token`. Storage states seed this key, so API login + saved state = an
  already-logged-in session (no UI login needed).
- **Health check**: `GET /status`. **Data reset**: `POST /refresh`
  (migrate:fresh --seed — global and destructive; gated behind `RESET_DB=true`).
- **Selectors**: the app is instrumented with `data-test` attributes throughout;
  the config sets `testIdAttribute: 'data-test'`.

## Commands

```bash
npm test                 # all tests
npm run test:headed      # headed
npm run test:ui          # Playwright UI mode
npm run test:debug       # debug
npm run test:smoke       # @smoke only
npm run test:regression  # @regression only
npm run test:chromium    # chromium projects only (setup + both splits)
npm run auth             # run only the auth setup (regenerate .auth states)
npm run report           # open HTML report
npm run lint             # eslint
npm run lint:fix
npm run format           # prettier --write
```

## Path aliases

`@lib/*`, `@api/*`, `@pages/*`, `@fixtures/*`, `@datafactory/*`, `@helpers/*`
(see `tsconfig.json`).

---

# Testing Conventions

## Playwright locator priority

Identify elements using this order:

1. `getByRole()` — preferred for accessibility
2. `getByLabel()` — form inputs
3. `getByText()` — visible text
4. `getByPlaceholder()` — inputs with placeholder
5. `getByTestId()` — when a data-test attribute is available
6. `getByAltText()` — images
7. CSS selector — only if the above don't apply
8. XPath — last resort only

**App-specific exception:** this application is instrumented with `data-test`
attributes throughout, and the config sets `testIdAttribute: 'data-test'`. Prefer
`getByTestId()` whenever a stable `data-test` value exists, as the developers
provided it intentionally for automation.

## Page Object Model

- Always use POM for page locators and actions.
- All locators are defined inside the relevant POM class — never inline in tests.
- All actions (clicks, fills, navigation) are methods on the POM class.
- Test blocks call POM methods only — no direct `page.locator()` / `page.click()`
  in tests.
- POM files live in `lib/pages/`.

## POM fixtures

- Always instantiate POMs via Playwright fixtures — never `new SomePage(page)`
  inside a test.
- Define all POM fixtures in `lib/fixtures/pages.ts` and extend the base test
  there.
- Tests import `test` from the fixtures file, not from `@playwright/test`.

```ts
// Good
test('login', async ({ loginPage }) => {
  await loginPage.login(process.env.CUSTOMER_EMAIL!, process.env.CUSTOMER_PASSWORD!);
});

// Bad — inline locators/actions, no fixture
test('login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.locator('#email').fill('user@example.com');
  await page.locator('#password').fill('password');
  await page.locator('.btn-login').click();
});
```

## Other conventions

- Strict TypeScript (`strict: true`); no `any` without justification.
- Spec files named `*.spec.ts`, organised by feature under `tests/`.
- Tag tests with `@smoke` and `@regression` for selective runs.
- Tests create their own data and clean up after themselves via the API; do not
  depend on shared mutable state.
