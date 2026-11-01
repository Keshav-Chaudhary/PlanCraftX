# Security Policy & Defensive Engineering (STRIDE, OWASP Top 10 2025 & ASVS 5.0.0)

PlanCraftX is engineered following defensive application security principles aligned with **OWASP Top 10 (2025)**, **OWASP API Security Top 10 (2023)**, and the **OWASP Application Security Verification Standard (ASVS 5.0.0)**.

---

## 1. STRIDE Threat Model & Control Matrix

| STRIDE Threat              | Potential Vector                                                          | Engineering Control                                                                                                                | Source Reference                                                 |
| :------------------------- | :------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| **Spoofing**               | Forged client IP via `X-Forwarded-For` injection or API tampering         | Edge-verified proxy IP extraction (`x-appengine-user-ip`, `cf-connecting-ip`, rightmost hop traversal) and `x-request-id` tracing. | `lib/security/client-ip.ts`<br>`proxy.ts`                        |
| **Tampering**              | Parameter manipulation, malformed JSON injection, prototype pollution     | Strict runtime Zod schema validation and recursive `sanitizePrototypePollution` on all imports.                                    | `lib/domain/storage-migration.ts`<br>`lib/schemas/`              |
| **Repudiation**            | Lack of traceability on server failures                                   | Structured correlation IDs (`x-request-id`) injected on all incoming requests; zero PII logging.                                   | `proxy.ts`<br>`app/error.tsx`                                    |
| **Information Disclosure** | API key leak, private plan leaks, system fingerprinting                   | Server-only Gemini key, masked Node/OS diagnostics in production, strict Content Security Policy.                                  | `firebase.json`<br>`proxy.ts`<br>`app/api/metrics/route.ts`      |
| **Denial of Service**      | Upstream quota flooding, large payload attacks, unbounded response bodies | Dual-mode sliding window rate limiter (Upstash Redis + in-memory fallback), response size caps (2 MB), timeouts (8s).              | `lib/security/secure-fetch.ts`<br>`lib/security/rate-limiter.ts` |
| **Elevation of Privilege** | SSRF to cloud metadata, prototype poisoning, unsafe HTML eval             | Outbound request destination allowlist, redirect locks (`redirect: 'error'`), ESLint ban on `dangerouslySetInnerHTML`.             | `lib/security/secure-fetch.ts`<br>`eslint.config.mjs`            |

---

## 2. OWASP Top 10 (2025) & API Security (2023) Mapping

1. **A01: Broken Access Control**: Deliberately requires no server-side user credentials or session tokens; all planning data is user-owned in local storage.
2. **A02: Cryptographic Failures**: Enforced HSTS (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`). Zero secrets stored in source; automated Gitleaks scanning in CI.
3. **A03: Injection & SSRF**:
   - **XSS**: React 19 automatic encoding, strict CSP (`default-src 'self'`), `object-src 'none'`, and `frame-ancestors 'none'` enforced in both `firebase.json` and `proxy.ts`.
   - **SSRF**: Locked to verified hostname allowlist via `secureFetch`; redirects disabled (`redirect: 'error'`); private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, 169.254.0.0/16) strictly blocked.
   - **Prompt Injection**: System safety preambles isolate instructions from user data; inputs are sanitized against `<user_data>` tag escapes via `sanitizePromptInput`.
   - **Prototype Pollution**: Uploaded JSON is stripped of `__proto__`, `constructor`, and `prototype` keys via `sanitizePrototypePollution`.
4. **A04: Insecure Design**: Pure domain logic, integer minor-currency math, and functional `Result<T,E>` error boundaries.
5. **A05: Security Misconfiguration**: Authoritative security headers on both Firebase CDN and Next.js middleware (`nosniff`, `DENY`, `same-origin`, HSTS).
6. **A06: Vulnerable Components**: Zero production vulnerabilities (`npm audit --omit=dev`), automated CodeQL scanning, and GitHub Actions pinned with least-privilege `permissions: contents: read`.
7. **A07: Identification Failures**: N/A; zero server-side authentication surface to compromise.
8. **A08: Software & Data Integrity**: Pinned npm lockfile, versioned migration schemas, and prototype-neutralized JSON import parsing.
9. **A09: Security Logging**: Correlation IDs per request; zero logging of credentials, prompts, or personal data.
10. **A10: Server-Side Request Forgery**: Guaranteed single-destination egress; third-party redirects to cloud metadata endpoints are strictly rejected.

---

## 3. Reporting a Vulnerability

If you discover a potential security issue in this repository, please do NOT file a public issue. Email the project maintainers directly or use GitHub Private Vulnerability Reporting. We aim to acknowledge receipt within 48 hours and provide a remediation timeline.
