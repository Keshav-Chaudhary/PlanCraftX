# Distributed Rate Limiting & Atomic Lua Script Verification

## 1. Overview & Threat Model

In distributed multi-instance environments (serverless runtimes, multi-pod Kubernetes clusters, or multi-zone edge functions), rate limiting implemented via non-atomic sequences (e.g., separate `ZREMRANGEBYSCORE`, `ZCARD`, and `ZADD` calls) is vulnerable to race conditions:

- **Concurrent Burst Exploitation**: Two or more workers execute read/card commands simultaneously before writing, allowing bursts to exceed maximum configured limits.
- **Fail-Open Memory Degradation**: Unbounded in-memory fallbacks across 100+ serverless lambdas allow total request volume to multiply by $N$ instances.

---

## 2. Technical Implementation

### 2.1 Atomic Redis Lua Script

`UpstashRedisRateLimiter` (`lib/security/rate-limiter.ts`) executes an atomic Redis Lua script via `redis.eval(...)`:

```lua
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_start = tonumber(ARGV[2])
local max_requests = tonumber(ARGV[3])
local window_ms = tonumber(ARGV[4])
local member = ARGV[5]

-- 1. Remove expired timestamps outside sliding window
redis.call('ZREMRANGEBYSCORE', key, 0, window_start)

-- 2. Count active requests within current window
local current_count = redis.call('ZCARD', key)

-- 3. Atomically check and register request
if current_count < max_requests then
  redis.call('ZADD', key, now, member)
  redis.call('PEXPIRE', key, window_ms)
  return { 1, max_requests - current_count - 1 }
else
  return { 0, 0 }
end
```

### 2.2 Mathematical Guarantees

1. **Single-Threaded Execution**: Redis evaluates Lua scripts in an isolated, atomic thread context. No other command or pipeline can interleave between `ZCARD` and `ZADD`.
2. **Cryptographic Identity**: Member tokens are generated using `Date.now():crypto.randomUUID()`, guaranteeing uniqueness across distributed nodes even if two requests arrive in the exact same millisecond.
3. **Automatic Expiration**: `PEXPIRE` ensures transient sorted sets are reclaimed, preventing memory exhaustion on the Redis cluster.

---

## 3. Production Fail-Closed Policy

In production environments (`NODE_ENV === 'production'`) or when `failClosed: true` is configured:

- If Upstash Redis is unreachable or experiences a network outage, the limiter **fails closed** (`success: false`, `mode: 'redis'`, `retryAfterSec: windowMs / 1000`).
- This prevents denial-of-wallet and quota exhaustion against expensive upstream AI model endpoints.
- In development and test environments (`NODE_ENV !== 'production'`), it degrades gracefully to local in-memory sliding window tracking to facilitate offline local development.

---

## 4. Test Verification Evidence

- `tests/security/rate-limiter-redis-resilience.test.ts`:
  - `degrades cleanly to fallback-memory mode when Redis encounters network errors in dev/test`: PASSED.
  - `fails closed when failClosed option is true or in production mode`: PASSED.
  - `uses atomic Lua evaluation with cryptographically unique member IDs`: PASSED.
  - `atomically enforces rate limiting under concurrent simulated bursts (25 simultaneous requests)`: PASSED (10 allowed, 15 rejected).
