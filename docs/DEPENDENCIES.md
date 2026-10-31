# Dependency Manifest & Technical Justifications

## 1. Runtime Toolchain & Engine Pinning

| Runtime / Engine | Version Specification           | Justification                                                                  |
| :--------------- | :------------------------------ | :----------------------------------------------------------------------------- |
| **Node.js**      | `>=20.9.0` (Active: `v24.20.0`) | Required by Next.js 16/15 and supported on Vercel deployment targets.          |
| **npm**          | `>=10.0.0` (Active: `10.7.0`)   | Pinned lockfile `package-lock.json` with npm workspaces and overrides support. |

---

## 2. Production Dependencies (`dependencies`)

_Note: Audited with `npm audit --omit=dev` confirming **0 vulnerabilities**._

| Package              | Version    | Purpose & Architecture Justification                                                                                                             |
| :------------------- | :--------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| **`next`**           | `16.4.2`   | Core full-stack framework providing App Router, React 19 Server Components, SSR, static prerendering, and optimized proxy middleware convention. |
| **`react`**          | `^19.0.0`  | Modern React UI runtime supporting Server Actions, streaming suspense boundaries, and improved DOM reconciliation.                               |
| **`react-dom`**      | `^19.0.0`  | DOM bindings for React 19.                                                                                                                       |
| **`@google/genai`**  | `^2.30.0`  | Official Google GenAI SDK for server-side Gemini integration with structured JSON response schema and streaming.                                 |
| **`zod`**            | `^3.24.2`  | Runtime validation for environment variables, API route inputs/outputs, AI structured schemas, and LocalStorage data schemas.                    |
| **`@upstash/redis`** | `^1.34.3`  | Serverless REST-based Redis client for distributed rate limiting across Vercel multi-instance lambdas.                                           |
| **`lucide-react`**   | `^0.475.0` | Accessible SVG icons with customizable ARIA attributes and zero runtime styling overhead.                                                        |
| **`clsx`**           | `^2.1.1`   | Lightweight conditional class concatenation utility.                                                                                             |
| **`tailwind-merge`** | `^2.6.0`   | Utility to merge conflicting Tailwind CSS class definitions safely.                                                                              |

---

## 3. Development Dependencies (`devDependencies`)

| Package                               | Version   | Purpose & Architecture Justification                                                                          |
| :------------------------------------ | :-------- | :------------------------------------------------------------------------------------------------------------ |
| **`typescript`**                      | `^5.7.3`  | Type system enforcing `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.                     |
| **`tailwindcss`**                     | `^4.3.3`  | Utility-first styling with modern CSS engine, eliminates legacy `chokidar` and `postcss-nested` dependencies. |
| **`@tailwindcss/postcss`**            | `^4.3.3`  | PostCSS plugin for Tailwind CSS 4 integration.                                                                |
| **`postcss`**                         | `^8.5.31` | CSS processor for Tailwind transformations with security patches.                                             |
| **`eslint`**                          | `^9.20.0` | Code quality and syntax linter with Flat Config.                                                              |
| **`eslint-config-next`**              | `16.4.2`  | Next.js-recommended lint rules including core-web-vitals.                                                     |
| **`typescript-eslint`**               | `^8.24.0` | ESLint rules for TypeScript strict type safety.                                                               |
| **`eslint-plugin-security`**          | `^3.0.1`  | Static analysis for OWASP security vulnerabilities (regex DoS, prototype pollution, dangerous methods).       |
| **`eslint-plugin-jsx-a11y`**          | `^6.10.2` | Real-time WCAG 2.2 accessibility linting for JSX elements.                                                    |
| **`eslint-plugin-boundaries`**        | `^7.2.1`  | Architectural boundary enforcement (e.g. Domain logic never imports UI or API clients).                       |
| **`prettier`**                        | `^3.5.0`  | Code formatter enforcing LF line endings and consistent 2-space indentation.                                  |
| **`prettier-plugin-tailwindcss`**     | `^0.6.11` | Automatic ordering of Tailwind CSS utility classes.                                                           |
| **`vitest`**                          | `^5.0.5`  | Next-generation fast unit and integration test runner.                                                        |
| **`@vitest/coverage-v8`**             | `^5.0.5`  | V8 code coverage provider enforcing strict line, branch, and statement thresholds.                            |
| **`@vitejs/plugin-react`**            | `^4.3.4`  | Vite plugin providing JSX transformation during Vitest runs.                                                  |
| **`fast-check`**                      | `^3.23.2` | Property-based testing library for budget normalization, ICS folding, and date math invariants.               |
| **`@testing-library/react`**          | `^16.2.0` | Component testing library focused on user-centric testing patterns.                                           |
| **`@testing-library/user-event`**     | `^14.6.1` | Realistic user interaction simulation (keyboard, clicks, focus).                                              |
| **`@testing-library/dom`**            | `^10.4.0` | DOM testing utilities.                                                                                        |
| **`jsdom`**                           | `^26.0.0` | Pure JavaScript implementation of DOM standards for headless test environments.                               |
| **`msw`**                             | `^2.7.0`  | Mock Service Worker for server-side API request interception in integration tests.                            |
| **`vitest-axe`**                      | `^0.1.0`  | Axe-core accessibility matchers for Vitest component tests.                                                   |
| **`@playwright/test`**                | `^1.50.1` | Cross-browser End-to-End test framework (Chromium, Firefox, WebKit, Mobile).                                  |
| **`@axe-core/playwright`**            | `^4.10.1` | Automated accessibility test engine integrated into Playwright browser suites.                                |
| **`@stryker-mutator/core`**           | `^10.0.0` | Mutation testing framework measuring domain test suite effectiveness.                                         |
| **`@stryker-mutator/vitest-runner`**  | `^10.0.0` | Vitest test runner plugin for Stryker mutation testing.                                                       |
| **`size-limit`**                      | `^11.1.6` | Client bundle size budget analyzer enforcing $\le 150\text{ kB}$ gzip limit.                                  |
| **`@size-limit/file`**                | `^11.1.6` | File analyzer for size-limit.                                                                                 |
| **`knip`**                            | `^5.44.0` | Static analysis tool to identify unused files, exports, and dependencies.                                     |
| **`husky`**                           | `^9.1.7`  | Git hooks manager for pre-commit linting and commit message validation.                                       |
| **`lint-staged`**                     | `^15.4.3` | Runs formatters and linters exclusively on staged git files.                                                  |
| **`@commitlint/cli`**                 | `^19.7.1` | Linter enforcing Conventional Commits standard.                                                               |
| **`@commitlint/config-conventional`** | `^19.7.1` | Standard conventional commits rule configuration.                                                             |

---

## 4. Transitive Advisory Disclosure & Mitigation

- **GHSA-vfj7-8cjw-p6xm (`braces <= 3.0.3`)**:
  - An advisory exists in the GitHub Advisory Database for `braces <= 3.0.3` regarding deep recursive pattern parsing.
  - This is exclusively a transitive subdependency inside dev-only tooling (`fast-glob`, `knip`, `eslint`) and is **never** bundled or included in production code or runtime bundles.

- **GHSA-mrhx-c7xc-m3w5 (`zod < 4.6.6`)**:
  - Advisory regarding potential memory exhaustion when validating unbounded or oversized constrained collections in Zod 3.x.
  - **PlanCraftX Architectural Mitigations**:
    1. Strict 1 MB file-size ceiling enforced in [`lib/domain/storage-migration.ts`](file:///d:/Side_Projects/001_H2Skill/PromptWars_Challenge5/lib/domain/storage-migration.ts) before JSON parsing or validation begins.
    2. Strict array length limits (`.max(100)`) on all collection schemas in [`lib/schemas/event-plan.ts`](file:///d:/Side_Projects/001_H2Skill/PromptWars_Challenge5/lib/schemas/event-plan.ts) and [`lib/schemas/api-schemas.ts`](file:///d:/Side_Projects/001_H2Skill/PromptWars_Challenge5/lib/schemas/api-schemas.ts).
    3. Next.js 16 Proxy middleware payload inspection preventing denial-of-service payload ingestion.
  - Production runtime dependencies have **0 critical vulnerabilities** verified by `npm audit --omit=dev --audit-level=critical`.
