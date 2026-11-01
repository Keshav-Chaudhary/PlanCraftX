# Gemini Browser Boundary & Network Request Audit Evidence

## 1. Complete AI Request Trace Matrix

Every GenAI operation in PlanCraftX has been audited from user interface interaction to backend execution.

| AI Operation                      | Triggering Component                                                    | Client Endpoint                    | Server Route Handler                      | Execution Location   | API Key Source                              | Client Request Contains Key? |
| --------------------------------- | ----------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------- | -------------------- | ------------------------------------------- | :--------------------------: |
| **Natural Language Event Intake** | `WizardAiIntake` (`features/wizard/wizard-ai-intake.tsx`)               | `POST /api/plan/intake`            | `app/api/plan/intake/route.ts`            | Server Route Handler | `process.env.GEMINI_API_KEY` via `getEnv()` |            **NO**            |
| **Dynamic Budget Proportions**    | `EventWizard` (`features/wizard/event-wizard.tsx`)                      | `POST /api/plan/generate`          | `app/api/plan/generate/route.ts`          | Server Route Handler | `process.env.GEMINI_API_KEY` via `getEnv()` |            **NO**            |
| **Interactive Event Assistant**   | `ChatAssistant` (`features/chat/chat-assistant.tsx`)                    | `POST /api/chat`                   | `app/api/chat/route.ts`                   | Server Route Handler | `process.env.GEMINI_API_KEY` via `getEnv()` |            **NO**            |
| **Brainstorming Ideas Stream**    | `IdeasStream` (`features/ideas/ideas-stream.tsx`)                       | `POST /api/ideas`                  | `app/api/ideas/route.ts`                  | Server Route Handler | `process.env.GEMINI_API_KEY` via `getEnv()` |            **NO**            |
| **Vendor Quote Analysis**         | `VendorQuoteAnalyzer` (`features/vendors/vendor-quote-analyzer.tsx`)    | `POST /api/plan/quote-extract`     | `app/api/plan/quote-extract/route.ts`     | Server Route Handler | `process.env.GEMINI_API_KEY` via `getEnv()` |            **NO**            |
| **Budget Tradeoff Explanations**  | `BudgetTradeoffBanner` (`features/budget/budget-tradeoff-banner.tsx`)   | `POST /api/plan/explain-tradeoffs` | `app/api/plan/explain-tradeoffs/route.ts` | Server Route Handler | `process.env.GEMINI_API_KEY` via `getEnv()` |            **NO**            |
| **Plan Readiness Review**         | `OverviewInsightsCard` (`features/overview/overview-insights-card.tsx`) | `POST /api/plan/review`            | `app/api/plan/review/route.ts`            | Server Route Handler | `process.env.GEMINI_API_KEY` via `getEnv()` |            **NO**            |

---

## 2. Production Static Bundle Inspection

- Scanned all 18 compiled JavaScript chunks in `out/_next/static/chunks/`.
- **String search for `GEMINI_API_KEY`**: 0 occurrences.
- **Pattern match for Google API Key (`AIzaSy...`)**: 0 occurrences.
- **AST Import Audit**: No client component imports from `@google/genai` or `lib/api-clients/gemini`.

---

## 3. Resiliency Invariant

If the server route handlers are unreachable (such as in a static CDN-only deployment without a serverless backend), every component handles network errors gracefully and falls back to the deterministic local engine:

- `EventWizard`: Generates verified mathematical budget allocations and reverse-planned timeline milestones locally.
- `ChatAssistant`: Displays safe offline message directing user to local planning tools.
- `VendorQuoteAnalyzer`: Allows manual quote entry and price tracking.
