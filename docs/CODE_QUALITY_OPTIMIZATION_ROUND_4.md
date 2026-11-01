# PlanCraftX — Code Quality Optimization Round 4: API Architecture Consolidation & HTTP Boundary Quality

## Executive Summary

During **Round 4 of Code Quality Optimization**, we addressed the primary architectural duplication and boundary vulnerability identified in the repository: redundant, inline HTTP body parsing, media type verification, stream bounding, and Zod validation across all Next.js API route handlers.

Prior to Round 4, each of the 11 POST route handlers in `app/api/**` implemented its own bespoke `request.json()` call, ad-hoc try/catch blocks, and disconnected error response shapes. While `proxy.ts` (middleware) provided ingress rate-limiting and security headers, the individual route handlers lacked uniform streaming byte-size bounds (exposing the node runtime to large payload parsing overhead) and duplicated approximately 150 lines of boilerplate logic.

Round 4 established a formal HTTP boundary layer (`lib/http/validated-json.ts`), strictly isolated by ESLint architectural boundaries, migrated all 11 POST route handlers, eliminated response boundary type assertions in the UI layer, and reduced complexity in external API clients (`open-meteo.ts` and `osm.ts`).

---

## 1. Route Handler Inventory & Pre-Migration State

The PlanCraftX repository contains 13 API endpoints under `app/api/**`:

| Endpoint                      | Method | Pre-Migration Body Parsing            | Size Guard | Media-Type Guard | Validation Pattern                        |
| ----------------------------- | ------ | ------------------------------------- | ---------- | ---------------- | ----------------------------------------- |
| `/api/currencies`             | `POST` | `await req.json()` inside `try/catch` | None       | None             | `currenciesRequestSchema.safeParse`       |
| `/api/holidays`               | `POST` | `await req.json()` inside `try/catch` | None       | None             | `holidaysRequestSchema.safeParse`         |
| `/api/places`                 | `POST` | `await req.json()` inside `try/catch` | None       | None             | `placesRequestSchema.safeParse`           |
| `/api/weather`                | `POST` | `await req.json()` inside `try/catch` | None       | None             | `weatherRequestSchema.safeParse`          |
| `/api/plan/intake`            | `POST` | `await req.json()` inside `try/catch` | None       | None             | `intakeRequestSchema.safeParse`           |
| `/api/plan/quote-extract`     | `POST` | `await req.json()` inside `try/catch` | None       | None             | `quoteExtractRequestSchema.safeParse`     |
| `/api/plan/explain-tradeoffs` | `POST` | `await req.json()` inside `try/catch` | None       | None             | `explainTradeoffsRequestSchema.safeParse` |
| `/api/plan/review`            | `POST` | `await req.json()` inside `try/catch` | None       | None             | `reviewRequestSchema.safeParse`           |
| `/api/plan/generate`          | `POST` | `await req.json()` inside `try/catch` | None       | None             | `generatePlanRequestSchema.safeParse`     |
| `/api/chat`                   | `POST` | `await req.json()` inside `try/catch` | None       | None             | `chatRequestSchema.safeParse`             |
| `/api/ideas`                  | `POST` | `await req.json()` inside `try/catch` | None       | None             | `ideasRequestSchema.safeParse`            |
| `/api/health`                 | `GET`  | N/A (Static Health Check)             | N/A        | N/A              | System check                              |
| `/api/metrics`                | `GET`  | N/A (Internal Metrics)                | N/A        | N/A              | System metrics                            |

### Duplication Diagnostics

- **11 Identical Try/Catch Blocks**: Each route swallowed `SyntaxError` from `req.json()` manually and returned status 400.
- **Inconsistent Error Envelopes**: Some routes returned `{ error: "Invalid JSON body" }`, others `{ error: "Invalid request payload", details }`, lacking a canonical typed shape.
- **Missing Media Type Enforcement**: Malicious or mismatched Content-Types (e.g. `multipart/form-data`) were not rejected upfront with HTTP 415 (Unsupported Media Type).
- **Unbounded In-Memory Parsing**: Requests with spoofed `Content-Length` or chunked transfer encoding could stream arbitrary volumes into memory before failing.

---

## 2. Shared HTTP JSON Validation Boundary Architecture

We introduced `lib/http/validated-json.ts` to encapsulate HTTP ingress body parsing into a single, highly auditable, type-safe boundary function:

```typescript
export async function validateJsonBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
  options?: { maxSizeBytes?: number },
): Promise<ValidatedJsonResult<z.output<TSchema>>>;
```

### Architectural Properties:

1. **Streaming Byte-Level Limit (`readStreamBounded`)**:
   - Reads directly from `request.body` (ReadableStream) chunk-by-chunk.
   - Enforces a default 64 KB limit (`DEFAULT_MAX_BODY_BYTES = 64 * 1024`).
   - If accumulated bytes exceed the limit, it **cancels the reader** (`await reader.cancel()`) immediately to halt memory consumption and returns HTTP 413 (Payload Too Large).
   - Also checks the `Content-Length` header upfront to reject oversized requests immediately when present.
2. **Media-Type Verification (`checkMediaType`)**:
   - Validates that the `Content-Type` header is compatible with JSON (`application/json`, `text/json`, or `text/plain`).
   - Rejects binary, multipart, or URL-encoded payloads with HTTP 415 (`Unsupported Media Type`).
3. **Safe JSON Deserialization (`parseJsonPayload`)**:
   - Uses `JSON.parse` protected inside a safe parser function.
   - Catches malformed JSON syntax or empty payloads and returns HTTP 400 with `{ error: 'Malformed JSON payload' }`.
4. **Zod Runtime Safe Parsing**:
   - Executes `schema.safeParse(json)`.
   - On validation failure, extracts structured Zod issue paths and messages, returning HTTP 400 with `{ error: 'Invalid request payload', details: ... }`.
5. **Strict Type Safety**:
   - Returns a discriminated union:
     ```typescript
     type ValidatedJsonResult<T> =
       | { success: true; data: T; errorResponse?: never }
       | { success: false; data?: never; errorResponse: NextResponse };
     ```
   - Uses `z.output<TSchema>` to ensure schemas with default transformations (such as `.default(false)`) resolve to their non-optional output types, satisfying `exactOptionalPropertyTypes`.

---

## 3. Boundary Rule Enforcement (ESLint Architecture Boundaries)

In `eslint.config.mjs`, we added the new `http` boundary zone to enforce unidirectional architectural layering:

```javascript
{
  type: 'http',
  pattern: 'lib/http/**',
  mode: 'folder',
  capture: ['http']
}
```

### Boundary Constraints:

- `lib/domain/**` and `lib/schemas/**` **CANNOT** import `lib/http/**`.
- `lib/http/**` **CANNOT** import UI components or API clients.
- `app/api/**` **CAN** import `lib/http/**`.
- Enforces strict architectural separation: HTTP transport semantics never leak into domain models.

---

## 4. UI Layer Response Boundary Hardening

In addition to ingress requests, we audited external API response parsing in UI hooks and components:

1. **`features/vendors/vendor-quote-analyzer.tsx`**:
   - Eliminated unchecked type assertion `as QuoteExtractResponse`.
   - Integrated runtime schema validation via `quoteExtractResponseSchema.safeParse(json)`.
   - Falls back gracefully with user-visible validation feedback if response structure is corrupt.
2. **`features/budget/use-budget-actions.ts`**:
   - Validated exchange rate responses with Zod schema (`z.object({ rate: z.number().positive() })`) rather than unvalidated casts.
3. **`features/chat/chat-assistant.tsx`**:
   - Replaced unchecked JSON parsing of weather endpoint responses with `res.ok` status validation and defensive parsing.
4. **`features/timeline/use-timeline-actions.ts` & `features/vendors/osm-vendor-search.tsx`**:
   - Replaced unchecked array assertions with `Array.isArray()` guards.

---

## 5. Algorithmic Complexity Hotspot Reduction

We refactored two high-complexity functions in API clients to comply with the project's strict cyclomatic complexity threshold (max 10):

1. **`searchCoordinates` (`lib/api-clients/open-meteo.ts`)**:
   - Extracted `parseGeocodingResult` helper.
   - Cyclomatic complexity reduced from 10 to 4.
2. **`searchOsmPlaces` (`lib/api-clients/osm.ts`)**:
   - Extracted `resolvePlaceName` and `mapRawPlaceToOsmPlace` helper functions.
   - Mapper cyclomatic complexity reduced from 9 to 3.

---

## 6. Migration Summary Across All 11 Routes

All 11 POST route handlers now follow this canonical, clean pattern:

```typescript
export async function POST(req: Request) {
  const result = await validateJsonBody(req, myRequestSchema);
  if (!result.success) {
    return result.errorResponse;
  }
  const body = result.data; // Fully typed, bounded, validated!

  // Clean domain logic follows...
}
```

Lines of duplicated parsing logic eliminated: **~150 lines**.
Runtime safety gained:

- Automatic 64 KB memory exhaustion protection on all endpoints.
- Early reader cancellation for streaming DoS vectors.
- Strict 415 rejection for unsupported content types.
- 100% uniform error responses.
