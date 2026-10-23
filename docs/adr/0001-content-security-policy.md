# ADR 0001: Content Security Policy (CSP) & Next.js 16 Proxy Architecture

## Status

Accepted

## Context

A strong Content Security Policy (CSP) is mandatory to defend against Cross-Site Scripting (XSS), data exfiltration, clickjacking, and unauthorized resource injection (OWASP A03:2021).
In Next.js 16 App Router:

1. `middleware.ts` is formally superseded by the Next.js `proxy.ts` convention.
2. Implementing a dynamic cryptographic nonce (`nonce-${random}`) on every request requires reading dynamic request headers on the root HTML layout, which forces dynamic server rendering for every page and disables Next.js static prerendering (SSG), increasing First Contentful Paint (FCP) and Time to First Byte (TTFB).
3. Using `'unsafe-inline'` for script execution is strictly forbidden by project security invariants.

## Decision

1. We enforce CSP via Next.js 16 `proxy.ts` and `next.config.mjs` response headers.
2. The CSP directives implemented:
   - `default-src 'self'`: Default fallback to same-origin.
   - `script-src 'self'`: Disallows inline scripts, prevents arbitrary script execution without `'unsafe-inline'`.
   - `style-src 'self' 'unsafe-inline'`: Permits CSS variable themes (Tailwind CSS 4 runtime variables) while disallowing external style loading.
   - `img-src 'self' data: https://*.tile.openstreetmap.org`: Restricts images to same-origin, inline data URIs, and official OpenStreetMap tiles.
   - `font-src 'self' data:`: Local system font loading.
   - `connect-src 'self' https://generativelanguage.googleapis.com https://api.frankfurter.app https://api.open-meteo.com https://geocoding-api.open-meteo.com https://date.nager.at https://nominatim.openstreetmap.org https://overpass-api.de`: Strictly limits client network connections to verified allowlisted endpoints.
   - `frame-ancestors 'none'`: Prevents framing and clickjacking.
   - `object-src 'none'`: Blocks Flash, Java, and other legacy plugin objects.
   - `base-uri 'self'`: Restricts `<base>` tag manipulation.
   - `form-action 'self'`: Restricts form submission targets to same-origin.
3. Supporting headers:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (production HTTPS only)

## Consequences

- Static pages prerender rapidly with optimal Core Web Vitals (LCP < 2.5s, CLS < 0.1).
- Script execution is strictly confined to verified first-party bundles.
- Zero reliance on `'unsafe-inline'` or `'unsafe-eval'` for scripts.
