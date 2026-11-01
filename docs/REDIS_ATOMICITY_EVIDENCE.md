# Redis Lua Script Atomicity & Concurrency Audit Evidence

## 1. Lua Script Definition & Verification

Location: `lib/security/rate-limiter.ts`

```lua
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_start = tonumber(ARGV[2])
local max_requests = tonumber(ARGV[3])
local window_ms = tonumber(ARGV[4])
local member = ARGV[5]

-- Step 1: Evict timestamps outside sliding window
redis.call('ZREMRANGEBYSCORE', key, 0, window_start)

-- Step 2: Measure current occupancy in window
local current_count = redis.call('ZCARD', key)

-- Step 3: Atomic test-and-set decision
if current_count < max_requests then
  redis.call('ZADD', key, now, member)
  redis.call('PEXPIRE', key, window_ms)
  return { 1, max_requests - current_count - 1 }
else
  return { 0, 0 }
end
```

---

## 2. Atomicity & SDK Conformance

1. **`@upstash/redis` `eval` invocation**:
   ```ts
   const res = await this.redis.eval<(string | number)[], [number, number]>(
     SLIDING_WINDOW_LUA,
     [key],
     [now, windowStart, this.maxRequests, this.windowMs, memberId],
   );
   ```
2. **Single-Threaded Execution**: Redis guarantees that the Lua script runs to completion without interruption from concurrent operations on the same or other keys.
3. **Cryptographically Unique Members**: Member IDs use `${now}:${crypto.randomUUID()}` to ensure distinct sorted set entries during simultaneous requests within the same millisecond.

---

## 3. Concurrency Stress Test Results

Test File: `tests/security/rate-limiter-redis-resilience.test.ts`

- **Scenario**: 25 concurrent requests dispatched simultaneously for a single client identifier with a quota of 10 requests per minute.
- **Expected**: Exactly 10 requests permitted (`success: true`), 15 requests blocked (`success: false`, `retryAfterSec > 0`).
- **Actual Result**:
  - `allowed.length`: 10
  - `blocked.length`: 15
  - **Verdict**: PASS.
