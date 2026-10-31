import { describe, it, expect } from 'vitest';
import { InMemoryRateLimiter, createRateLimiter } from '../../../lib/domain/rate-limiter';

describe('Sliding-Window Rate Limiter Deep & Concurrency Invariants', () => {
  it('defaults to 20 requests per 60,000ms window', () => {
    const limiter = new InMemoryRateLimiter();
    expect(limiter['maxRequests']).toBe(20);
    expect(limiter['windowMs']).toBe(60000);
  });

  it('allows exactly N requests within the window and denies N+1', async () => {
    const limitCount = 5;
    const limiter = new InMemoryRateLimiter({ maxRequests: limitCount, windowMs: 5000 });

    for (let i = 0; i < limitCount; i++) {
      const res = await limiter.limit('ip-test');
      expect(res.success).toBe(true);
      expect(res.remaining).toBe(limitCount - 1 - i);
    }

    const denied = await limiter.limit('ip-test');
    expect(denied.success).toBe(false);
    expect(denied.remaining).toBe(0);
    expect(denied.retryAfterSec).toBeGreaterThanOrEqual(1);
    expect(denied.mode).toBe('memory');
  });

  it('provides distinct quota buckets per IP identifier', async () => {
    const limiter = new InMemoryRateLimiter({ maxRequests: 2, windowMs: 10000 });

    await limiter.limit('192.168.1.1');
    await limiter.limit('192.168.1.1');
    const ip1Denied = await limiter.limit('192.168.1.1');
    expect(ip1Denied.success).toBe(false);

    // Different IP is untouched
    const ip2Allowed = await limiter.limit('10.0.0.1');
    expect(ip2Allowed.success).toBe(true);
    expect(ip2Allowed.remaining).toBe(1);
  });

  it('creates in-memory limiter fallback when redis env is absent', () => {
    const limiter = createRateLimiter();
    expect(limiter).toBeInstanceOf(InMemoryRateLimiter);
  });

  it('clear() empties all active tracking buckets', async () => {
    const limiter = new InMemoryRateLimiter({ maxRequests: 1, windowMs: 10000 });
    await limiter.limit('client-x');
    expect((await limiter.limit('client-x')).success).toBe(false);

    limiter.clear();
    expect((await limiter.limit('client-x')).success).toBe(true);
  });
});
