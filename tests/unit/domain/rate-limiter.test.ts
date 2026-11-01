import { describe, it, expect, vi } from 'vitest';
import {
  InMemoryRateLimiter,
  UpstashRedisRateLimiter,
  createRateLimiter,
} from '@/lib/security/rate-limiter';

describe('Rate Limiter Domain & Adapters', () => {
  it('enforces in-memory sliding window limits and supports clearing', async () => {
    const limiter = new InMemoryRateLimiter({ maxRequests: 3, windowMs: 10_000 });

    const r1 = await limiter.limit('user-1');
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r1.mode).toBe('memory');

    const r2 = await limiter.limit('user-1');
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = await limiter.limit('user-1');
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);

    const r4 = await limiter.limit('user-1');
    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.retryAfterSec).toBeGreaterThanOrEqual(1);

    // Test clear
    limiter.clear();
    const rAfterClear = await limiter.limit('user-1');
    expect(rAfterClear.success).toBe(true);
  });

  it('isolates different client identifiers', async () => {
    const limiter = new InMemoryRateLimiter({ maxRequests: 1, windowMs: 10_000 });

    const clientA = await limiter.limit('client-a');
    expect(clientA.success).toBe(true);

    const clientB = await limiter.limit('client-b');
    expect(clientB.success).toBe(true);

    const clientABlocked = await limiter.limit('client-a');
    expect(clientABlocked.success).toBe(false);
  });

  it('handles Upstash Redis normal execution and rate exceeded via atomic Lua eval', async () => {
    const redisLimiter = new UpstashRedisRateLimiter(
      'https://mock-redis.upstash.io',
      'mock-token',
      { maxRequests: 5, windowMs: 60_000 },
    );

    // Mock successful redis eval execution under limit: [1 (allowed), 2 (remaining)]
    vi.spyOn(redisLimiter, 'executeAtomic').mockResolvedValue([1, 2]);

    const resAllowed = await redisLimiter.limit('redis-user');
    expect(resAllowed.success).toBe(true);
    expect(resAllowed.mode).toBe('redis');
    expect(resAllowed.remaining).toBe(2);

    // Mock Redis eval when count exceeds maxRequests: [0 (blocked), 0]
    vi.spyOn(redisLimiter, 'executeAtomic').mockResolvedValue([0, 0]);

    const resBlocked = await redisLimiter.limit('redis-user');
    expect(resBlocked.success).toBe(false);
    expect(resBlocked.mode).toBe('redis');
    expect(resBlocked.remaining).toBe(0);
    expect(resBlocked.retryAfterSec).toBe(60);
  });

  it('gracefully degrades to in-memory limiter on Redis outage in non-production', async () => {
    const fallbackLimiter = new InMemoryRateLimiter({ maxRequests: 2, windowMs: 10_000 });
    const redisLimiter = new UpstashRedisRateLimiter(
      'https://mock-redis.upstash.io',
      'mock-token',
      { maxRequests: 2, windowMs: 10_000, failClosed: false },
      fallbackLimiter,
    );

    // Mock Redis network failure
    vi.spyOn(redisLimiter, 'executeAtomic').mockRejectedValue(
      new Error('ECONNREFUSED - Redis unreachable'),
    );

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const res1 = await redisLimiter.limit('degraded-user');
    expect(res1.success).toBe(true);
    expect(res1.mode).toBe('memory');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        'Upstash Redis outage or unreachable; degrading to local in-memory limiter',
      ),
    );

    const res2 = await redisLimiter.limit('degraded-user');
    expect(res2.success).toBe(true);

    // Third request should be limited by the in-memory fallback
    const res3 = await redisLimiter.limit('degraded-user');
    expect(res3.success).toBe(false);
    expect(res3.remaining).toBe(0);

    warnSpy.mockRestore();
  });

  it('factory returns UpstashRedisRateLimiter when Redis env is provided', () => {
    const limiter = createRateLimiter('https://mock.upstash.io', 'token');
    expect(limiter).toBeInstanceOf(UpstashRedisRateLimiter);
  });

  it('factory returns InMemoryRateLimiter when Redis env is omitted', () => {
    const limiter = createRateLimiter(undefined, undefined);
    expect(limiter).toBeInstanceOf(InMemoryRateLimiter);
  });
});
