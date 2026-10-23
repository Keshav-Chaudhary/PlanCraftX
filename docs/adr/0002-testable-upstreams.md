# ADR 0002: Testable Upstream Services Architecture & SSRF Guardrails

## Status

Accepted

## Context

The planning assistant integrates multiple live external services:

1. Google Gemini AI API (`generativelanguage.googleapis.com`)
2. Open-Meteo Weather & Geocoding (`api.open-meteo.com`, `geocoding-api.open-meteo.com`)
3. Frankfurter Currency Conversion (`api.frankfurter.app`)
4. Nager.Date Public Holidays (`date.nager.at`)
5. OpenStreetMap Nominatim & Overpass (`nominatim.openstreetmap.org`, `overpass-api.de`)

In end-to-end (E2E) testing with Playwright, client-side network interception (`page.route()`) cannot intercept outbound HTTP requests initiated server-side by Next.js route handlers. Furthermore, tests must run reliably offline in CI without real API keys, cost, or flaky external network calls.

## Verified Upstream Documentation

- **Google Gemini API**: Official `@google/genai` SDK, Server-Side only. [Docs](https://ai.google.dev/docs)
- **Frankfurter API**: ECB exchange rates, endpoint `/latest?from=USD&to=EUR`. [Docs](https://frankfurter.dev)
- **Open-Meteo**: Weather forecast (up to 16 days daily forecast) and Geocoding search (`count`, `name`). [Docs](https://open-meteo.com/en/docs)
- **Nager.Date**: Global public holidays (`/api/v3/PublicHolidays/{year}/{countryCode}`). [Docs](https://date.nager.at/Api)
- **Nominatim**: OpenStreetMap search (`/search?q={query}&format=json&limit=5`), requires custom User-Agent and max 1 req/s rate limit. [Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- **Overpass API**: OpenStreetMap query interpreter (`/api/interpreter`). [Docs](https://wiki.openstreetmap.org/wiki/Overpass_API)

## Decision

1. All upstream base URLs are read from strict Zod-validated environment variables (`lib/config/env.ts`).
2. Production base URLs default to the verified upstream hostnames.
3. In production (`NODE_ENV === 'production'`) or when deployed on Vercel (`VERCEL_ENV` defined), outbound requests are strictly locked to the approved hostname allowlist.
4. For automated testing and local development only, an environment override `E2E_UPSTREAM_BASE_URL` is permitted to point server handlers to a local HTTP stub server started by Playwright.
5. If `E2E_UPSTREAM_BASE_URL` is present when `NODE_ENV === 'production'` or `VERCEL_ENV` is set, configuration validation fails fast at process startup and aborts execution.
6. Server-side outbound calls implement AbortController timeouts (5000ms max) and never forward unvalidated user URLs (preventing SSRF).

## Consequences

- E2E tests run fully offline in CI with 100% deterministic test data and zero API spend.
- Production environment cannot be hijacked to point to arbitrary hosts.
- Verified by automated unit tests in `tests/unit/config/env.test.ts`.
