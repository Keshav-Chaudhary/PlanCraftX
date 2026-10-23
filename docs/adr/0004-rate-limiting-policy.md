# ADR 0004: Dual-Mode Rate Limiting & Proxy Protection Policy

## Status

Accepted

## Context

Public APIs deployed on serverless multi-instance platforms (such as Vercel) can be subjected to Denial of Service (DoS) attacks or upstream quota exhaustion. Pure in-memory rate limiting is process-local and does not synchronize state across multiple lambdas. Conversely, requiring an external Redis connection can introduce a single point of failure if the service experiences downtime.

## Decision

1. **Limiter Interface**:
   - `RateLimiter` abstraction with two implementations: `UpstashRedisRateLimiter` and `InMemoryRateLimiter`.
   - When `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are configured, the Redis distributed adapter is instantiated.
   - When Redis environment variables are absent, the sliding-window in-memory adapter is used.

2. **Failure & Outage Policy**:
   - If Upstash Redis is configured but throws an error (network failure, TLS timeout, or unreachable endpoint), the limiter immediately **degrades to the local in-memory sliding window limiter** (fail-open to local, never completely open).
   - A redacted warning is emitted to server logs: `[RateLimiter] Upstash Redis outage or unreachable; degrading to local in-memory limiter.`
   - Requests continue to be bound by the in-memory window, ensuring protection against localized flood attacks.

3. **Coverage & Scope**:
   - Rate limiting is enforced across **all** `/api/*` endpoints in `proxy.ts`, including public data proxies (`/api/weather`, `/api/holidays`, `/api/currency`, `/api/places`).
   - Every proxy endpoint strictly validates query parameters with Zod schemas to ensure it cannot be abused as an open proxy or SSRF vector.

4. **HTTP Headers**:
   - Rate-limited responses return HTTP `429 Too Many Requests` with:
     - `Retry-After: <seconds>`
     - `X-RateLimit-Limit: <max>`
     - `X-RateLimit-Remaining: 0`
     - `X-RateLimit-Reset: <resetMs>`
     - `X-RateLimit-Mode: redis | memory`

## Consequences

- Honest transparency: documentation and response headers declare whether rate limiting is operating in distributed `redis` mode or process-local `memory` mode.
- System resilience: external Redis outages never result in unhandled 500 crashes or unrestricted traffic floods.
