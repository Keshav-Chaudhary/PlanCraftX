# System Architecture & Technical Specifications

## 1. High-Level Architectural Principles

PlanCraftX follows clean architectural boundaries where dependencies flow strictly inward:
`UI Components (features/, app/) -> Domain Logic (lib/domain/) -> Pure Schemas (lib/schemas/)`

- **Domain Purity**: Domain logic (`lib/domain/`) is 100% pure TypeScript. It never imports React, DOM APIs, UI components, or network clients.
- **Fail-Fast Boundary Validation**: All incoming requests, outgoing API payloads, AI responses, and persisted local storage states are validated with Zod schemas.
- **Functional Result Monad**: Operations that can fail return typed `Result<T, E>` unions rather than throwing unhandled exceptions.

---

## 2. Directory Layout & Module Responsibilities

```
app/                        # Next.js 16 App Router pages, layout, and API route handlers
├── api/                    # Server-side route handlers with rate limiting & schema validation
├── globals.css             # Tailwind CSS 4 tokens, theme definitions, focus styles
├── layout.tsx              # Root HTML layout with accessibility landmarks and skip link
└── page.tsx                # Immediate planning entrypoint (no auth wall)

features/                   # Feature slices (co-located components, state, hooks)
├── wizard/                 # Multi-step accessible planning wizard
├── budget/                 # Integer minor-unit budget allocation & table views
├── timeline/               # Reverse-planned timeline view & ICS calendar export
├── vendors/                # Categorized vendor checklists & live OpenStreetMap search
├── ideas/                  # Streaming NDJSON ideas with atomic per-line validation
├── chat/                   # Context-aware streaming assistant chat
└── export/                 # Plan import, export, print view & privacy panel

lib/                        # Core application library
├── domain/                 # Pure domain business logic & mathematical algorithms
│   ├── event-rules.ts      # Event taxonomies, lead-time rules (zero fake data/percentages)
│   └── rate-limiter.ts     # Sliding window rate limiter & Upstash Redis adapter
├── schemas/                # Runtime Zod schemas for validation
├── config/                 # Startup environment validation & SSRF allowlist
├── api-clients/            # Outbound clients for Gemini, Open-Meteo, Nager, Frankfurter, OSM
├── prompts/                # Typed, versioned prompt templates (no inline strings)
└── result/                 # Pure functional Result<T, E> monad implementation

tests/                      # Comprehensive test pyramid
├── unit/                   # Fast domain and config unit tests
├── property/               # fast-check property tests (math invariants, ICS folding)
├── component/              # React Testing Library & user-event component tests
├── api/                    # MSW-mocked API integration tests
└── e2e/                    # Playwright cross-browser suites (Chromium, Firefox, WebKit)
```

---

## 3. Dependency Boundary Enforcement

Architectural boundaries are enforced automatically via `eslint-plugin-boundaries` during CI:

1. `domain` modules can only import from `domain`, `schemas`, and `result`.
2. `schemas` modules cannot import from any other internal module.
3. Violations trigger build failure.

---

## 4. Security & Isolation Boundaries

- **Gemini Key Isolation**: The Gemini API key (`GEMINI_API_KEY`) is read exclusively inside server-side route handlers. A dedicated CI security step scans client build chunks to guarantee no API keys are bundled into client-facing JavaScript.
- **Outbound SSRF Protection**: All outbound server requests are restricted to an allowlist of approved hostnames (`lib/config/env.ts`). Arbitrary user-supplied URLs are never fetched.
- **Dual-Mode Rate Limiting**: Next.js 16 `proxy.ts` applies sliding-window rate limits across all `/api/*` routes, defaulting to local in-memory bounding if Upstash Redis is unreachable.
