# Practice Software Testing — E2E Tests

Scalable, low-flakiness end-to-end test framework built with
**Playwright + TypeScript** for [practicesoftwaretesting.com](https://practicesoftwaretesting.com)
(Angular frontend, Laravel REST API).

- **UI:** `https://practicesoftwaretesting.com`
- **API:** `https://api.practicesoftwaretesting.com`

Tests target the hosted environment. Both URLs live in `.env` so a local target
can be switched in later.

## Prerequisites

- **Node** as pinned in [`.nvmrc`](.nvmrc) (`nvm use`). Requires Node >= 20.
- **npm** (the package manager for this project).

## Install

```powershell
npm ci          # or: npm install
npx playwright install   # download browser binaries (add --with-deps on Linux/CI)
```

### PowerShell execution policy

If npm/npx scripts are blocked by Windows execution policy, allow them for the
**current session only**:

```powershell
Set-ExecutionPolicy Bypass -Scope Process
```

## Environment setup

Copy the template and fill in real values:

```powershell
Copy-Item .env.example .env
```

`.env` (gitignored) contains:

| Variable            | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `BASE_URL`          | UI base URL (default: hosted)            |
| `API_URL`           | API base URL (default: hosted)           |
| `CUSTOMER_EMAIL`    | Seeded customer login                    |
| `CUSTOMER_PASSWORD` | Seeded customer password                 |
| `ADMIN_EMAIL`       | Seeded admin login                       |
| `ADMIN_PASSWORD`    | Seeded admin password                    |

The committed `.env` is pre-populated with the app's **seeded** demo credentials
(from `API/database/seeders/UserSeeder.php`). `.env.example` uses placeholders.

> **Data reset:** `global.setup.ts` always health-checks the API. It only resets
> the database (`POST /refresh`, a global/destructive `migrate:fresh --seed`)
> when `RESET_DB=true`. Leave it off against the shared public demo.

## Running tests

```powershell
npm test                 # all tests (chromium locally; full matrix on CI)
npm run test:headed      # headed browser
npm run test:ui          # Playwright UI mode
npm run test:debug       # step-through debugger
npm run test:chromium    # chromium projects only

# By tag
npm run test:smoke       # @smoke
npm run test:regression  # @regression

# Single file / project
npx playwright test tests/public/home.spec.ts
npx playwright test --project=no-auth-chromium
```

### Browsers

- **Locally:** chromium only, for both the `no-auth` and `authenticated` project
  splits.
- **CI:** the same two-project split is replicated across chromium, firefox,
  webkit and a mobile (Pixel 5) viewport.

## Viewing the report

```powershell
npm run report           # opens the HTML report (playwright-report/)
```

A fresh HTML report is generated locally on every run. On CI the HTML and blob
reports are uploaded as build artifacts.

## Authentication / refreshing auth states

Login is **API-driven**: `tests/auth.setup.ts` requests a JWT for each role and
saves a storage state (`.auth/customer.json`, `.auth/admin.json`). The
`authenticated-*` projects depend on the `setup` project, so states are
regenerated automatically before authenticated specs run. A missing or expired
state is regenerated on the next run.

To refresh them manually:

```powershell
npm run auth             # runs only the setup project
```

`.auth/` is gitignored — never commit storage states.

## Project structure

```
.auth/                  Saved storage states per role (gitignored)
.github/workflows/      CI workflow
lib/
  api/                  Typed API client + types (auth, data setup/teardown)
  datafactory/          Faker-backed builders (seedFaker for determinism)
  fixtures/pages.ts     Custom fixtures; extends base test
  helpers/              Pure utilities (e.g. storage-state builder)
  pages/                Page Object Model classes
tests/
  auth.setup.ts         Per-role API login -> storage state
  public/               No-auth specs
  authenticated/        Logged-in specs
global.setup.ts         API health check + optional data reset
playwright.config.ts
```

## Conventions

See [`CLAUDE.md`](CLAUDE.md) for the full testing conventions (locator priority,
Page Object Model, fixtures, tagging). In short: locators live in POMs, POMs come
from fixtures, tests import `test` from `lib/fixtures/pages.ts`, and credentials
come from `.env`.

## Code quality

```powershell
npm run lint             # ESLint (+ eslint-plugin-playwright)
npm run lint:fix
npm run format           # Prettier
```
