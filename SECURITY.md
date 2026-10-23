# Security Policy & Threat Model (STRIDE & OWASP ASVS)

PlanCraft is architected and implemented following defensive engineering practices aligned with OWASP Top 10 (2021) and the OWASP Application Security Verification Standard (ASVS).

---

## 1. STRIDE Threat Model & Control Matrix

| STRIDE Threat              | Potential Vector                                                          | Engineering Control                                                                                        | Source Code Reference                                           |
| :------------------------- | :------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| **Spoofing**               | Forged client IP or API request tampering                                 | Request correlation IDs (`x-request-id`), rate limiter identifier tracking, and same-origin form actions.  | `proxy.ts`<br>`lib/domain/rate-limiter.ts`                      |
| **Tampering**              | Parameter manipulation, malformed JSON injection, client state corruption | Strict runtime Zod schema validation on every API endpoint, request body, and LocalStorage load.           | `lib/config/env.ts`<br>`lib/schemas/`                           |
| **Repudiation**            | Lack of traceability on server failures                                   | Structured JSON logging with request IDs, error boundaries, and no PII recording.                          | `app/error.tsx`<br>`proxy.ts`                                   |
| **Information Disclosure** | API key leak, private plan leaks, cross-user caching leaks                | Server-only Gemini key with automated CI bundle scan, no shared cross-user AI caching, strict CSP headers. | `.github/workflows/ci.yml`<br>`proxy.ts`<br>`lib/config/env.ts` |
| **Denial of Service**      | Upstream quota flooding, large payload attacks, recursive regex           | Dual-mode sliding window rate limiter (Upstash Redis + in-memory fallback), body size caps, regex audit.   | `proxy.ts`<br>`lib/domain/rate-limiter.ts`                      |
| **Elevation of Privilege** | SSRF to internal network, prototype pollution, unsafe HTML eval           | Strict upstream hostname allowlist, ESLint ban on `dangerouslySetInnerHTML`, no auth surface to hijack.    | `lib/config/env.ts`<br>`eslint.config.mjs`                      |

---

## 2. OWASP Top 10 (2021) Mapping

1. **A01: Broken Access Control**: The app eliminates authorization risks by requiring no server-side user accounts, passwords, or session tokens. All plan data remains in user-controlled local storage.
2. **A02: Cryptographic Failures**: HTTPS enforced via HSTS in production (`Strict-Transport-Security`). No secrets stored in git. Gitleaks scans 100% of commit history in CI.
3. **A03: Injection**:
   - **XSS**: React 19 automatic escaping, strict Content Security Policy (`script-src 'self'`), ESLint ban on `dangerouslySetInnerHTML`.
   - **Prompt Injection**: System instructions are strictly isolated from user parameters; user inputs are passed as delimited data blocks; output schemas are enforced by Gemini and code re-validated with Zod.
   - **Formula Injection**: Exported data is sanitised; calendar exports use RFC 5545 parameter escaping.
4. **A04: Insecure Design**: Pure domain logic, property-based invariant testing, functional error handling via `Result<T,E>`.
5. **A05: Security Misconfiguration**: Automated headers via `proxy.ts` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, CSP). Disabled `poweredByHeader`.
6. **A06: Vulnerable and Outdated Components**: Zero production vulnerabilities (`npm audit --omit=dev`), weekly Dependabot updates, and CodeQL security analysis.
7. **A07: Identification and Authentication Failures**: N/A; application deliberately requires no user credentials.
8. **A08: Software and Data Integrity Failures**: Pinned dependencies and package lockfile. JSON import files validated with versioned schemas and migrations.
9. **A09: Security Logging and Monitoring Failures**: Correlation IDs per request; zero logging of credentials, prompts, or personal data.
10. **A10: Server-Side Request Forgery (SSRF)**: Outbound requests strictly locked to the verified domain allowlist (`generativelanguage.googleapis.com`, `api.open-meteo.com`, `date.nager.at`, `api.frankfurter.app`, `nominatim.openstreetmap.org`, `overpass-api.de`). Local test stub override rejected in production.

---

## 3. Reporting a Vulnerability

If you discover a potential security issue in this repository, please do NOT file a public issue. Email the project maintainers directly or use GitHub Private Vulnerability Reporting. We aim to acknowledge receipt within 48 hours and provide a remediation timeline.
