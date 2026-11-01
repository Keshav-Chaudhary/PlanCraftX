# Production Security Enforcement & Cloud Ingress Architecture

## 1. Cloud Ingress & Client Identity Trust Model

PlanCraftX extracts client identities for distributed rate limiting via `extractClientIp` (`lib/security/client-ip.ts`).

### Trusted Header Hierarchy:

1. **`x-appengine-user-ip` (Google Cloud / Firebase Hosting / Cloud Run)**:
   - Injected by Google Front End (GFE).
   - Stripped from incoming client requests and replaced with the verified socket IP.
   - Guaranteed authentic when running behind Firebase Hosting or Cloud Run.
2. **`cf-connecting-ip` (Cloudflare CDN / Cloudflare Tunnel)**:
   - Injected by Cloudflare edge nodes.
   - Cannot be modified or spoofed when origin accepts traffic exclusively from Cloudflare IP ranges.
3. **`x-real-ip` (Trusted Reverse Proxies / NGINX / Caddy)**:
   - Assigned by edge ingress via `proxy_set_header X-Real-IP $remote_addr`.
4. **`x-forwarded-for` (Fallback Chain)**:
   - Evaluated rightmost first to prevent client prepending spoof attacks (`client-ip, intermediate-proxy, edge-proxy`).
5. **Fallback Default (`127.0.0.1`)**:
   - Assigned when all headers are absent, malformed, or fail linear IPv4/IPv6 validation.

---

## 2. Ingress Integrity Requirements

For production environments, direct origin access must be prevented:

- In Google Cloud / Firebase: Enforce ingress controls to require traffic routing through Firebase Hosting CDN or Cloud Armor.
- In Cloudflare: Authenticate origin requests using Cloudflare Authenticated Origin Pulls (TLS client certificates).

---

## 3. Production Outage Behavior & Resiliency

| Subsystem                 | Development / Test Mode                                               | Production Mode (`NODE_ENV === 'production'`)                                                                     |
| ------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Upstash Redis Outage**  | Degrades gracefully to process-local in-memory sliding-window limiter | **Fails closed** (`success: false`, `mode: 'redis'`, HTTP 429/503), preventing distributed traffic multiplication |
| **Upstream AI Outage**    | Route returns structured error (`AI_UNAVAILABLE` / `RATE_LIMITED`)    | Returns HTTP 502/429; frontend UI gracefully falls back to deterministic engine                                   |
| **Outbound HTTP Latency** | Aborts after timeout signal (default 8000ms)                          | Aborts after 8000ms deadline covering both headers and body stream                                                |
| **CSP Violation**         | Emits console warning in browser devtools                             | Browser blocks unhashed inline scripts and prevents unauthorized execution                                        |
