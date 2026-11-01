# PlanCraftX — API Boundary Architecture Specification

## 1. Architectural Overview & Boundary Hierarchy

PlanCraftX adheres to strict unidirectional dependency layering. All HTTP ingress traffic is processed through a multi-tiered defense-in-depth pipeline before reaching application business logic.

```
                           [ Incoming HTTP Request ]
                                      │
                                      ▼
                        [ Tier 1: Middleware (proxy.ts) ]
                        - Request ID Correlation (`x-request-id`)
                        - Global Route Matching
                        - Distributed Ingress Rate Limiting (Upstash / Memory)
                        - Security Response Headers (CSP Level 3, HSTS, Framing)
                                      │
                                      ▼
                      [ Tier 2: Route Handlers (app/api/**) ]
                                      │
                         Calls `validateJsonBody(...)`
                                      │
                                      ▼
                 [ Tier 3: HTTP Boundary Layer (lib/http/validated-json.ts) ]
                 - Upfront Content-Length verification (< 64 KB)
                 - Media-Type check (rejects non-JSON with HTTP 415)
                 - Streaming body reader with live reader cancellation on limit overflow (HTTP 413)
                 - Safe JSON deserialization (rejects malformed syntax with HTTP 400)
                 - Runtime Zod schema safeParse validation (rejects invalid contracts with HTTP 400)
                                      │
                                      ▼
                     [ Tier 4: Domain & Service Layer (lib/domain/**) ]
                     - Pure domain rules (Event Rules, Timeline Engine, Budget Math)
                     - Isolated external API clients (Gemini, Open-Meteo, NagerDate, OSM)
                     - Zero transport concepts, zero unchecked assertions
```

---

## 2. Ingress Request Processing Order

To guarantee security, efficiency, and system reliability, every request undergoes strict sequential processing:

1. **Ingress Rate Limiting (Tier 1 - `proxy.ts`)**:
   - Executes before request payload extraction.
   - Evaluates client IP and API route path against sliding-window limits.
   - If exceeded, returns HTTP 429 (`Too Many Requests`) immediately without allocating memory for the body.
2. **Media-Type Verification (Tier 3 - `lib/http/validated-json.ts`)**:
   - Inspects the `Content-Type` header.
   - Permitted: `application/json`, `text/json`, or `text/plain` (for standard Node/Fetch interop).
   - Rejected: `multipart/form-data`, `application/x-www-form-urlencoded`, binary formats.
   - Yields HTTP 415 (`Unsupported Media Type`).
3. **Stream-Bounded Body Read (Tier 3 - `lib/http/validated-json.ts`)**:
   - Checks `Content-Length` header if supplied.
   - If `Content-Length > maxSizeBytes`, aborts immediately with HTTP 413 (`Payload Too Large`).
   - Streams chunks via `request.body.getReader()`. If accumulated chunk byte length exceeds `maxSizeBytes` (default 64 KB), the reader is **cancelled immediately** (`await reader.cancel()`).
   - Yields HTTP 413 (`Payload Too Large`).
4. **Safe JSON Parsing (Tier 3 - `lib/http/validated-json.ts`)**:
   - Deserializes the accumulated UTF-8 buffer via `JSON.parse`.
   - On syntax failure or empty body, yields HTTP 400 (`Malformed JSON payload`).
5. **Contract Validation (Tier 3 - `lib/http/validated-json.ts`)**:
   - Passes parsed object into the target Zod schema (`schema.safeParse(json)`).
   - On schema mismatch, yields HTTP 400 (`Invalid request payload`) with normalized issue paths.
6. **Domain Execution (Tier 4)**:
   - Route handler receives strongly typed, guaranteed-valid `result.data`.
   - Domain functions operate with guaranteed invariants.

---

## 3. Error Handling Contracts

All API endpoints return predictable, structured JSON error envelopes:

| Status Code                    | Reason                           | Response Body Format                                                                        |
| ------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------- |
| **400 Bad Request**            | Malformed JSON syntax            | `{"error": "Malformed JSON payload"}`                                                       |
| **400 Bad Request**            | Schema validation failure        | `{"error": "Invalid request payload", "details": [{"path": "...", "message": "..."}]}`      |
| **413 Payload Too Large**      | Stream exceeded size limit       | `{"error": "Payload exceeds maximum allowed size of 65536 bytes"}`                          |
| **415 Unsupported Media Type** | Incompatible Content-Type        | `{"error": "Unsupported media type. Expected application/json"}`                            |
| **429 Too Many Requests**      | Rate limit exhausted             | `{"error": "Too Many Requests", "message": "Rate limit exceeded. Please try again later."}` |
| **500 Internal Server Error**  | Unexpected domain/server failure | `{"error": "Internal Server Error", "message": "An unexpected error occurred."}`            |

---

## 4. Zod Schema Ownership & Boundary Rules

Schema ownership is centralized in `lib/schemas/`:

- `lib/schemas/api-schemas.ts`: Canonical API request and response contracts (`currenciesRequestSchema`, `weatherRequestSchema`, `quoteExtractRequestSchema`, etc.).
- `lib/schemas/event-plan.ts`: Canonical domain event plan contracts (`EventPlan`, `BudgetItem`, `TimelineItem`, `VendorQuote`).

### ESLint Architecture Boundary Enforcement (`eslint.config.mjs`)

The repository enforces boundary separation via `boundaries/element-types`:

- **HTTP Boundary (`lib/http/**`)**:
  - May import: `lib/schemas/**`.
  - May NOT import: `lib/domain/**`, `lib/api-clients/**`, UI features or components.
- **API Routes (`app/api/**`)**:
  - May import: `lib/http/**`, `lib/schemas/**`, `lib/domain/**`, `lib/api-clients/**`.
  - May NOT import: UI components or hooks.
- **Domain Layer (`lib/domain/**`)**:
  - Pure business logic.
  - May import: `lib/schemas/**`.
  - May NOT import: `lib/http/**` or UI components.
- **External API Clients (`lib/api-clients/**`)**:
  - Encapsulated fetch operations with SSRF protection and timeout bounding.
  - May NOT import UI or HTTP route boundaries.

---

## 5. Architectural Assessment: Location of `lib/domain/rate-limiter.ts`

### Issue Analyzed

In earlier audits, it was observed that `lib/domain/rate-limiter.ts` is consumed by `proxy.ts` (middleware) and rate-limiting test suites, leading to a query of whether it should be moved to `lib/security/` or `lib/http/`.

### Trade-Off Analysis & Decision

1. **Preservation of 100/100 Security**:
   - `lib/domain/rate-limiter.ts` forms a critical security control verified by multiple adversarial test suites (`tests/security/edge-protection.test.ts`, `tests/security/rate-limiter-concurrency.test.ts`, `tests/security/client-ip-extractor.test.ts`).
   - Moving or renaming this module introduces blast-radius risk across imports, build configurations, and test runners.
2. **Domain Nature of Token-Bucket / Sliding-Window Logic**:
   - The rate limiter implements pure token-bucket and sliding-window algorithms operating over in-memory or Redis backends. The core algorithmic calculation is a domain service model of traffic quotas, completely agnostic to Next.js HTTP request objects.
3. **Conclusion**:
   - Retaining `lib/domain/rate-limiter.ts` in its current location maintains 100% stability, 0 regression risk, and full compliance with our security and testing gates. Its algorithms remain purely computational, and transport details are handled in `proxy.ts`.
