# Gemini Secret Boundary & Client Bundle Isolation Audit

## 1. Executive Summary

This audit verifies that the Google Gemini API key (`GEMINI_API_KEY`) and upstream Google GenAI SDK constructs are completely isolated within server-side execution boundaries. At no point in the build or runtime lifecycle are API credentials bundled into client JavaScript assets or exposed to browser runtimes.

---

## 2. Architecture & Data Flow

```
[ Client Browser ]
        │
        │ HTTP JSON Request (Cookies / Anonymous Header)
        ▼
[ Next.js Edge / Serverless Route Handler ] (`app/api/*`)
        │
        ├─► Client IP Validation & Rate Limiter (`lib/security/client-ip.ts`)
        ├─► Zod Input Schema Validation (`lib/schemas/api-schemas.ts`)
        │
        ▼
[ Server-Side Gemini Client ] (`lib/api-clients/gemini.ts`)
        │
        ├─► Reads `process.env.GEMINI_API_KEY` exclusively via `getEnv()` (`lib/config/env.ts`)
        ├─► Invokes `@google/genai` with fallback chain (`gemini-2.5-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-2.5-flash-lite`)
        ├─► Sanitizes error messages to redact upstream credentials/tokens
        │
        ▼ HTTPS
[ Google Generative Language API ] (`generativelanguage.googleapis.com`)
```

---

## 3. Verification Controls & Automated Audits

### 3.1 Bundle AST & Code Analysis (`tests/security/gemini-secret-audit.test.ts`)

1. **Forbidden Import Gate**:
   - Asserts that zero client-facing components in `components/`, `features/`, and `hooks/` import from `lib/api-clients/gemini` or directly from `@google/genai`.
2. **Public Environment Variable Defense**:
   - Audits all source code to ensure `NEXT_PUBLIC_GEMINI_API_KEY` is never defined, queried, or referenced.
3. **Static Output Audit (`out/_next/static/chunks/`)**:
   - Scans every compiled client chunk in the production export directory for Google API key patterns (`AIzaSy...`) or plaintext environment variable names (`GEMINI_API_KEY`).
   - Verified 0 occurrences.

### 3.2 Error Redaction & Token Scrubbing

- All upstream error strings from Google GenAI calls (structured generation and streaming) pass through `sanitizeErrorMessage()`:
  - Query parameter keys (`key=...` ➔ `key=[REDACTED]`)
  - Authorization headers (`Bearer ...` ➔ `Bearer [REDACTED]`)
  - Hex/base64 token signatures (`[a-zA-Z0-9_\-]{32,}` ➔ `[REDACTED_TOKEN]`)
- Prevents accidental token leakage in server logs or client-facing 500 error payloads.

---

## 4. Static Export (`output: export`) Invariant

In pure static CDN hosting (Firebase Hosting CDN), static HTML and JS are served directly. Route handlers in `/api/*` require dynamic SSR/serverless runtimes (Firebase Cloud Functions or Cloud Run). If deployed purely to static CDN without backend runtimes, `/api/*` routes are unreachable rather than insecure, completely eliminating client-side credential injection risk.
