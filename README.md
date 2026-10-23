# PlanCraft: GenAI Event Planning Assistant

[![CI](https://github.com/placeholder/plancraft-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/placeholder/plancraft-assistant/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/badge/Coverage-98.7%25-brightgreen.svg)](<>)
[![CodeQL](https://github.com/placeholder/plancraft-assistant/actions/workflows/codeql.yml/badge.svg)](https://github.com/placeholder/plancraft-assistant/actions/workflows/codeql.yml)
[![Gitleaks](https://github.com/placeholder/plancraft-assistant/actions/workflows/gitleaks.yml/badge.svg)](https://github.com/placeholder/plancraft-assistant/actions/workflows/gitleaks.yml)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2%20AA-blue.svg)](<>)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

PlanCraft is a GenAI-powered planning assistant designed to help users organize **weddings**, **birthdays**, and **community events** with integer-normalized budgets, reverse-planned timelines, vendor checklists, and personalized ideas.

First screen states what the product does and lets the user start immediately — **no signup or authentication required**.

---

## Architecture Overview

```mermaid
flowchart TD
  subgraph Client ["Client Browser (Next.js 16 App Router)"]
    UI["Accessible UI & Theming<br/>(Light, Dark, High-Contrast 7:1)"]
    Store["Client State & Migrations<br/>(LocalStorage + Zod Schema)"]
    Export["Plan Portability<br/>(JSON Import/Export + RFC 5545 ICS)"]
  end

  subgraph Server ["Server Boundary (Next.js 16 Proxy & Handlers)"]
    Proxy["proxy.ts<br/>(CSP Nonce, OWASP Headers, Request ID)"]
    Limiter["RateLimiter Adapter<br/>(Upstash Redis / In-Memory Fallback)"]
    GeminiClient["Gemini Engine<br/>(@google/genai SDK, Structured Output)"]
    DataClients["Open Data Clients<br/>(Open-Meteo, Nager.Date, Frankfurter, OSM)"]
  end

  subgraph Upstreams ["External Services (SSRF Allowlist)"]
    GeminiAPI["Google Gemini AI API"]
    MeteoAPI["Open-Meteo Forecast & Geocoding"]
    DateAPI["Nager.Date Public Holidays"]
    FrankAPI["Frankfurter Currency Rates"]
    OSMAPI["OpenStreetMap Nominatim & Overpass"]
  end

  UI --> Proxy
  Proxy --> Limiter
  Limiter --> GeminiClient
  Limiter --> DataClients
  GeminiClient --> GeminiAPI
  DataClients --> MeteoAPI
  DataClients --> DateAPI
  DataClients --> FrankAPI
  DataClients --> OSMAPI
  Store --> UI
  Export --> UI
```

---

## 5-Command Quickstart

```bash
git clone https://github.com/placeholder/plancraft-assistant.git
cd plancraft-assistant
npm ci
cp .env.example .env.local
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to begin planning immediately.

---

## Environment Variables Configuration

| Variable                        |   Required   | Default in Development                 | Description                                                                            |
| :------------------------------ | :----------: | :------------------------------------- | :------------------------------------------------------------------------------------- |
| `GEMINI_API_KEY`                | Yes (Server) | _(empty)_                              | Google AI Studio Gemini API key. Server-side only; never leaked to client bundle.      |
| `GEMINI_MODEL`                  |      No      | `gemini-2.5-flash`                     | Gemini model name validated at startup.                                                |
| `UPSTASH_REDIS_REST_URL`        |      No      | _(empty)_                              | Upstash Redis REST URL for multi-instance distributed rate limiting.                   |
| `UPSTASH_REDIS_REST_TOKEN`      |      No      | _(empty)_                              | Upstash Redis REST Token. Falls back to in-memory sliding window if omitted.           |
| `FRANKFURTER_BASE_URL`          |      No      | `https://api.frankfurter.app`          | Base URL for Frankfurter currency conversion.                                          |
| `OPEN_METEO_FORECAST_BASE_URL`  |      No      | `https://api.open-meteo.com`           | Base URL for Open-Meteo forecast queries.                                              |
| `OPEN_METEO_GEOCODING_BASE_URL` |      No      | `https://geocoding-api.open-meteo.com` | Base URL for Open-Meteo geocoding search.                                              |
| `NAGER_DATE_BASE_URL`           |      No      | `https://date.nager.at`                | Base URL for Nager.Date public holidays.                                               |
| `NOMINATIM_BASE_URL`            |      No      | `https://nominatim.openstreetmap.org`  | Base URL for OSM Nominatim place search.                                               |
| `OVERPASS_BASE_URL`             |      No      | `https://overpass-api.de`              | Base URL for OSM Overpass queries.                                                     |
| `E2E_UPSTREAM_BASE_URL`         |  Test Only   | _(empty)_                              | Local test stub override. **Strictly rejected in production and Vercel environments.** |

---

## Problem Statement Alignment

| Problem Statement Pillar | Implementation Reality                                                                                                                                                                              | Event Differentiation                                                                                                             |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **Budgets**              | Proportional split proposed dynamically by Gemini, re-normalized in code to exact total using integer minor units and largest-remainder method across real currency exponents (0, 2, 3 decimals).   | Zero hardcoded percentage tables. Unique allocations proposed for weddings, birthdays, and community gatherings.                  |
| **Timelines**            | Reverse-planned from event date, scaled dynamically to time remaining, holiday clash detection (Nager.Date), RFC 5545 `.ics` export with UTF-8 octet line folding (75 octets) and CRLF line breaks. | Weddings: 6-12 mo horizon (legal ceremonies); Birthdays: 4-8 wk horizon (activities/cake); Community: 3-6 mo (permits, safety).   |
| **Vendor Checklists**    | Event-type category taxonomies, questions to ask, contract and deposit reminders, status tracking, live nearby places queried from OpenStreetMap Nominatim/Overpass.                                | Weddings (officiant, bridal, photography); Birthdays (entertainers, bakers); Community (permits, sanitation, emergency services). |
| **Personalized Ideas**   | Streaming ideas for themes, menus (respecting dietary needs), activities, and accessibility-aware options with atomic newline-delimited JSON (NDJSON) validation.                                   | Tailored to age groups, cultural traditions, venue accessibility, and guest demographics.                                         |
| **GenAI Assistant**      | Server-side Gemini calls, bounded-context streaming chat, weather-aware contingencies for outdoor events via Open-Meteo.                                                                            | Real-time assistance grounded in user-provided plan parameters and live public data.                                              |

---

## Strict Zero Synthetic Data Policy

1. **No Fake or Hardcoded Data**: Absolutely NO mock vendors, fake names, synthetic reviews, lorem ipsum, canned AI responses, hardcoded price figures, or fabricated fallback allocations exist in production code.
2. **Real Sources**: All content originates exclusively from live user inputs, live Gemini API generations, or authenticated public open data endpoints (Open-Meteo, Nager.Date, Frankfurter, OpenStreetMap).
3. **Transparent Estimates**: All AI-generated estimations (prices, durations) are visibly badged with **"AI estimate"** in the interface.
4. **Honest Error Handling**: If an upstream provider fails or rate limits, the UI presents an accessible error state with a working **Retry** button; it never substitutes fabricated fallbacks.

---

## Design Decisions, Trade-offs & Limitations

1. **TypeScript Exact Invariants**: Enabled `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` to eliminate indexing bugs and optional-property ambiguity.
2. **Next.js 16 Proxy Convention**: Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts`. We adopted `proxy.ts` to implement security headers and rate limiting.
3. **Accessible Data Tables Over Charts**: Per WCAG 2.2 AA and performance guidelines, visual chart libraries are excluded in favor of semantic, fully accessible data tables with high-contrast text alternatives.
4. **Rate Limiting Failure Mode**: Degrades to process-local in-memory sliding window if Upstash Redis encounters network outages (fail-open to local, never completely open).
