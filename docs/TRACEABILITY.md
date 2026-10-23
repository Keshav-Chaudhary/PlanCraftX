# Requirement Traceability Matrix

This matrix establishes end-to-end traceability between the problem statement requirements, source implementation files, and automated test files. It is strictly maintained across every milestone.

## Problem Statement

> "Create a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas."

---

## Traceability Mapping Table

| Requirement Phrase                                       | Architectural Feature                                            | Source Files                                                                                | Test Files                                                                                                                                            | Status            | Event Differentiation                                                                                              |
| :------------------------------------------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------- | :----------------------------------------------------------------------------------------------------------------- |
| **"organize weddings, birthdays, and community events"** | Event Taxonomy & Distinct Rule Engine                            | `lib/domain/event-rules.ts`<br>`app/page.tsx`<br>`app/layout.tsx`                           | `tests/unit/domain/event-rules.test.ts`<br>`tests/security/no-hardcoded-budget.test.ts`                                                               | **M1 Complete**   | Distinct categories, lead times, and phases across weddings, birthdays, and community events.                      |
| **"with budgets"**                                       | Budget Math & Currency Processing (Exact integer minor unit sum) | `lib/domain/event-rules.ts` _(Budget math engine in M2)_                                    | `tests/security/no-hardcoded-budget.test.ts` _(Property tests in M2)_                                                                                 | **M1 Foundation** | Zero hardcoded percentage tables; dynamically proposed by Gemini, exact integer sum normalized in code.            |
| **"timelines"**                                          | Sequential Phases & Lead-Time Scheduling                         | `lib/domain/event-rules.ts` _(Timeline engine & ICS in M2)_                                 | `tests/unit/domain/event-rules.test.ts` _(Timeline tests in M2)_                                                                                      | **M1 Foundation** | Weddings: 270d horizon; Birthdays: 60d horizon; Community: 120d horizon with post-event breakdown.                 |
| **"vendor checklists"**                                  | Categorized Vendor Taxonomies & Questions                        | `lib/domain/event-rules.ts` _(OSM client in M3)_                                            | `tests/unit/domain/event-rules.test.ts`                                                                                                               | **M1 Foundation** | Wedding-specific (officiant, attire); Birthday (entertainers, cake); Community (permits, safety, sanitation).      |
| **"personalized ideas"**                                 | Streaming AI Ideas Engine & Validation                           | _(API route & prompt in M3)_                                                                | _(Route tests in M3)_                                                                                                                                 | Planned M3        | Ideas streamed as newline-delimited JSON (NDJSON) with atomic per-line Zod validation.                             |
| **"GenAI-powered planning assistant"**                   | Core Gemini Engine & Proxy Rate Limiting                         | `lib/domain/rate-limiter.ts`<br>`proxy.ts`<br>`lib/config/env.ts`<br>`lib/result/result.ts` | `tests/unit/domain/rate-limiter.test.ts`<br>`tests/unit/config/env.test.ts`<br>`tests/unit/result/result.test.ts`<br>`tests/security/headers.test.ts` | **M1 Complete**   | Strict server-side only execution, SSRF-safe allowlist, dual-mode rate limiting (Upstash Redis + memory fallback). |
| **Zero Fabricated Data Invariant**                       | Anti-Mocking & Clean Data Policy                                 | Full Repository                                                                             | `scripts/repo-hygiene.mjs`<br>`tests/security/no-hardcoded-budget.test.ts`                                                                            | **M1 Complete**   | Automated scanning prevents dummy/fake vendors, hardcoded price literals, and fixed percentage tables.             |

---

## Problem Statement Guard Report (End of M1)

- **Scope Drift Check**: Zero unmapped routes, zero auth systems, zero social/chat-room features, zero commercial payment integrations.
- **Event Differentiation**: Verified by `tests/unit/domain/event-rules.test.ts`. Taxonomies, phases, and lead times genuinely differ between wedding, birthday, and community event types.
- **Immediate Value**: Verified by `app/page.tsx`. First screen immediately explains capabilities and provides planning action without login walls.
