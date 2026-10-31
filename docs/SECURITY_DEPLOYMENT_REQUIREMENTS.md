# PlanCraftX — Security Deployment Requirements & Topology

## Overview

This document specifies the operational configuration, environment variable specifications, and reverse-proxy header requirements for PlanCraftX across production hosting environments.

---

## 1. Hosting Topology & Header Propagation

PlanCraftX supports two deployment modes:

1. **Static CDN Export (Default / Firebase Hosting)**: Built via `output: 'export'`. Static HTML/JS assets served via Firebase Hosting CDN with headers configured in `firebase.json`.
2. **Dynamic / SSR Node Runtime (Firebase App Hosting / Cloud Run / Docker)**: Served via `next start` with request filtering, rate limiting, and security header injection executed by `proxy.ts`.

### Security Header Requirements

| Header                         | Production Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Enforcement Layer            |
| :----------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------- |
| `Content-Security-Policy`      | `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.tile.openstreetmap.org; font-src 'self' data:; connect-src 'self' https://generativelanguage.googleapis.com https://api.frankfurter.app https://api.open-meteo.com https://geocoding-api.open-meteo.com https://date.nager.at https://nominatim.openstreetmap.org https://overpass-api.de; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'` | `firebase.json` & `proxy.ts` |
| `Strict-Transport-Security`    | `max-age=63072000; includeSubDomains; preload`                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `firebase.json` & `proxy.ts` |
| `X-Content-Type-Options`       | `nosniff`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `firebase.json` & `proxy.ts` |
| `X-Frame-Options`              | `DENY`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `firebase.json` & `proxy.ts` |
| `Referrer-Policy`              | `strict-origin-when-cross-origin`                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `firebase.json` & `proxy.ts` |
| `Permissions-Policy`           | `camera=(), microphone=(), geolocation=(), interest-cohort=()`                                                                                                                                                                                                                                                                                                                                                                                                                                      | `firebase.json` & `proxy.ts` |
| `Cross-Origin-Opener-Policy`   | `same-origin`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `firebase.json` & `proxy.ts` |
| `Cross-Origin-Resource-Policy` | `same-origin`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `firebase.json` & `proxy.ts` |

---

## 2. Reverse Proxy Client-IP Configuration

To prevent rate-limit identity spoofing, the application expects reverse proxies to set one of the following edge-verified headers:

1. **Google Cloud / Firebase Hosting**: `X-AppEngine-User-IP` (immutable by client).
2. **Cloudflare**: `CF-Connecting-IP` (immutable by client).
3. **Standard Nginx / Traefik**: `X-Real-IP`.

If relying on `X-Forwarded-For`, the application evaluates the rightmost valid entry to defeat client-prepended headers.

---

## 3. Environment Variables Specification

| Variable                   | Scope           |   Required in Prod?   | Purpose                                                            |
| :------------------------- | :-------------- | :-------------------: | :----------------------------------------------------------------- |
| `GEMINI_API_KEY`           | Server-only     | Yes (for AI features) | Google Gemini 2.5 Flash API credentials. Never exposed to browser. |
| `GEMINI_MODEL`             | Server-only     |       Optional        | Defaults to `gemini-2.5-flash`.                                    |
| `UPSTASH_REDIS_REST_URL`   | Server-only     |       Optional        | Distributed rate-limiting Redis endpoint.                          |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only     |       Optional        | Distributed rate-limiting Redis authentication token.              |
| `NODE_ENV`                 | Build & Runtime |          Yes          | Set to `production` in live environments.                          |
