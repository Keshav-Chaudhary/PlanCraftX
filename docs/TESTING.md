# Testing Strategy & Test Pyramid Specification

## 1. Testing Philosophy & Quality Gates

PlanCraftX enforces a test pyramid combining unit tests, property-based tests, component interaction tests, API integration tests with MSW, cross-browser End-to-End tests with Playwright, accessibility tests with Axe-core, and mutation testing with Stryker.

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

## 4. Current Test Status & Coverage

- **Vitest Unit/Component/Property Suite**: 30 test files, 173 automated tests passed cleanly.
- **Playwright E2E Suite**: 64 cross-browser tests passed cleanly across Chromium, WebKit, Mobile Chrome, and Mobile Safari.
- **Automated Axe-core Audit**: Zero accessibility violations across all interactive and static views.

```text
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   97.60 |    86.13 |   98.59 |   98.39 |
 features          |   94.11 |    90.00 |  100.00 |   94.04 |
 features/budget   |   98.30 |    87.50 |  100.00 |  100.00 |
 features/chat     |   92.98 |    81.81 |  100.00 |  100.00 |
 features/export   |   92.50 |    83.33 |  100.00 |   94.87 |
 features/ideas    |   92.98 |    77.41 |  100.00 |   92.45 |
 features/overview |  100.00 |    90.00 |  100.00 |  100.00 |
 features/timeline |  100.00 |    84.37 |  100.00 |  100.00 |
 features/vendors  |   96.07 |    79.16 |   90.47 |   95.91 |
 features/wizard   |  100.00 |    90.00 |  100.00 |  100.00 |
 lib/api-clients   |   99.28 |    80.18 |  100.00 |  100.00 |
 lib/config        |  100.00 |   100.00 |  100.00 |  100.00 |
 lib/domain        |   99.20 |    88.18 |   97.87 |   99.58 |
 lib/prompts       |  100.00 |   100.00 |  100.00 |  100.00 |
 lib/result        |  100.00 |   100.00 |  100.00 |  100.00 |
 lib/schemas       |  100.00 |   100.00 |  100.00 |  100.00 |
-------------------|---------|----------|---------|---------|-------------------
```
