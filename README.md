# Test Harness 3-4

Playwright end-to-end tests for the Team Star Elephant Diagram shop: the frontend
(`team-star-elephant-diagram-frontend`, port 3000) and the backend API
(`team-star-elephant-diagram-backend`, port 3001).

## Setup

```sh
npm ci
npx playwright install chromium
cp .env.example .env
```

Set `E2E_ADMIN_PASSWORD` in `.env` to the password of the seeded staff accounts
(the `ADMIN_SEED_PASSWORD` used when seeding the backend). Without it the admin
tests are skipped. `.env` is git-ignored; keep credentials and personal data out
of the repository.

## Running the apps for testing

Both apps limit how often one IP address can log in, register or change a basket.
The suite does that far more often than a real user, so start both apps with
`RATE_LIMIT_MAX` for local test runs (it is ignored when `NODE_ENV=production`):

```sh
# backend
docker compose up -d
npm run db:deploy
ADMIN_SEED_PASSWORD=<your test password> npm run db:seed
RATE_LIMIT_MAX=1000 npm run dev

# frontend
RATE_LIMIT_MAX=1000 npm run dev
```

The seed only sets `ADMIN_SEED_PASSWORD` on staff accounts that still have their
placeholder password. Use `http://localhost`, not `http://0.0.0.0`: login cookies
are `Secure`, which browsers only accept over plain HTTP on `localhost`.

## Running the tests

```sh
npm run test:e2e        # all end-to-end and API tests, headless
npm run report          # open the HTML report from the last run
npx playwright test --project=tests tests/basket.spec.ts   # one file
npm test                # BDD features plus every test, in a visible browser
```

Every test registers its own customer through the backend API, so tests run in
parallel without sharing baskets. Those `e2e-…@example.com` customers stay in your
local database. Products come from the backend seed; run `npm run db:seed` in the
backend if the catalogue is empty.

## What is covered

| Area | Files |
| --- | --- |
| Customer pages | `tests/home`, `register`, `logintest`, `passwordReset`, `products`, `basket`, `checkout`, `payment`, `profile` |
| Staff portal | `tests/admin/adminAuth`, `adminUsers`, `adminBaskets`, `adminRoles` |
| Backend API | `tests/api/productsApi`, `customerAuthApi`, `basketApi`, `passwordResetApi`, `adminApi`, `tests/loginAPItest` |
| Health checks | `tests/health` |

Page objects live in `pages/` (one class per page) and the backend API client in
`api/backendApi.ts`. Shared fixtures in `fixtures/testFixtures.ts` provide:

- `customer` and `customerToken`: a newly registered customer and their access token
- `loggedInPage`: `page` already logged in as that customer
- `inStockProduct`: a seeded product with at least 10 in stock
- `loginAsAdmin(role)`: logs `page` in as a seeded staff account for that role
- `api`: the backend API client

The full password reset journey is not covered because the reset link is only
written to the backend console.

## Known bugs

Tests that hit a known app bug are marked `test.fail(...)` with a reason from
`fixtures/knownBugs.ts`. They pass while the bug exists. Once the bug is fixed,
the test fails with "Expected to fail, but passed"; remove its `test.fail` line
then.
