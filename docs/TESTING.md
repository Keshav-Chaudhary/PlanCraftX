# Testing Strategy & Test Pyramid Specification

## 1. Testing Philosophy & Quality Gates

PlanCraft enforces a test pyramid combining unit tests, property-based tests, component interaction tests, API integration tests with MSW, cross-browser End-to-End tests with Playwright, accessibility tests with Axe-core, and mutation testing with Stryker.

### Enforced Coverage Thresholds

- **Pure Domain Logic (`lib/domain/`)**: 100% Statements / Lines / Functions target.
- **Overall Application Code**: $\ge 90\%$ Statements / Lines / Functions, $\ge 85\%$ Branches.

---

## 2. Test Execution Commands

| Test Suite               | Command                 | Environment    | Description                                                 |
| :----------------------- | :---------------------- | :------------- | :---------------------------------------------------------- |
| **All Tests**            | `npm run test`          | jsdom / Vitest | Runs all unit, property, and security test files.           |
| **Coverage Report**      | `npm run test:coverage` | Vitest + v8    | Generates full coverage summary and enforces thresholds.    |
| **Accessibility**        | `npm run test:a11y`     | vitest-axe     | Automated accessibility audits on component states.         |
| **End-to-End (E2E)**     | `npm run test:e2e`      | Playwright     | Cross-browser flows (Chromium, Firefox, WebKit, Mobile).    |
| **Hygiene & Invariants** | `npm run hygiene`       | Node script    | Full repository scan for forbidden tokens and fake data.    |
| **Full Verification**    | `npm run verify`        | Node script    | Runs format, lint, typecheck, coverage, audit, and hygiene. |

---

## 3. Testable Server-Side Upstreams Architecture (Amendment B)

Playwright cannot intercept outbound HTTP calls made by server-side Next.js route handlers. To achieve reliable, deterministic, and offline testing in CI without paid Gemini API keys:

1. Every upstream base URL is read from `lib/config/env.ts`.
2. An environment variable `E2E_UPSTREAM_BASE_URL` allows pointing all services to a local stub server started by Playwright's `webServer` configuration.
3. The stub server runs strictly under `tests/` and mocks external API contracts (Gemini structured JSON, Open-Meteo weather, Nager.Date holidays, Frankfurter rates, OSM places).
4. `lib/config/env.ts` contains a fail-fast assertion: if `NODE_ENV === 'production'` or `VERCEL_ENV` is set, `E2E_UPSTREAM_BASE_URL` is rejected immediately.
5. This architecture is covered by automated unit tests in `tests/unit/config/env.test.ts`.

---

## 4. Current Milestone Coverage Status

```
 % Coverage report from v8 (Milestone 1)
------------------|---------|----------|---------|---------|-------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------|---------|----------|---------|---------|-------------------
All files         |   98.79 |    93.47 |     100 |   98.78 |
 config           |      96 |    95.45 |     100 |      96 |
  env.ts          |      96 |    95.45 |     100 |      96 | 91
 domain           |     100 |    88.88 |     100 |     100 |
  event-rules.ts  |     100 |      100 |     100 |     100 |
  rate-limiter.ts |     100 |    88.88 |     100 |     100 | 46,119
 result           |     100 |      100 |     100 |     100 |
  result.ts       |     100 |      100 |     100 |     100 |
------------------|---------|----------|---------|---------|-------------------
```
