import { describe, it, expect, vi } from 'vitest';
import { UpstashRedisRateLimiter, InMemoryRateLimiter } from '../../lib/security/rate-limiter';
import type { Redis } from '@upstash/redis';

describe('Security: Upstash Redis Rate Limiter Resilience & Fail-Safe Mode', () => {
  it('degrades cleanly to fallback-memory mode when Redis encounters network errors in dev/test', async () => {
    const memoryFallback = new InMemoryRateLimiter({ maxRequests: 5, windowMs: 10000 });
    const redisLimiter = new UpstashRedisRateLimiter(
      'https://mock-redis.upstash.io',
      'mock-token',
      { maxRequests: 5, windowMs: 10000, failClosed: false },
      memoryFallback,
    );

    // Mock Redis execution failure
    vi.spyOn(redisLimiter, 'executeAtomic').mockRejectedValue(
      new Error('Connection refused by Upstash Redis'),
    );

    const result = await redisLimiter.limit('user-test-1');
    expect(result.success).toBe(true);
    expect(result.mode).toBe('memory');
    expect(result.limit).toBe(5);
  });

  it('fails closed when failClosed option is true or in production mode', async () => {
    const memoryFallback = new InMemoryRateLimiter({ maxRequests: 5, windowMs: 10000 });
    const redisLimiter = new UpstashRedisRateLimiter(
      'https://mock-redis.upstash.io',
      'mock-token',
      { maxRequests: 5, windowMs: 10000, failClosed: true },
      memoryFallback,
    );

    // Mock Redis execution failure
    vi.spyOn(redisLimiter, 'executeAtomic').mockRejectedValue(
      new Error('Connection timeout to Upstash Redis'),
    );

    const result = await redisLimiter.limit('user-prod-fail');
    expect(result.success).toBe(false);
    expect(result.mode).toBe('redis');
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSec).toBe(10);
  });

  it('uses atomic Lua evaluation with cryptographically unique member IDs', async () => {
    let capturedScript = '';
    let capturedKeys: string[] = [];
    let capturedArgs: (string | number)[] = [];

    const mockRedis = {
      eval: vi.fn(async (script, keys, args): Promise<[number, number]> => {
        capturedScript = script as string;
        capturedKeys = keys as string[];
        capturedArgs = args as (string | number)[];
        return [1, 4];
      }),
    } as unknown as Redis;

    const redisLimiter = new UpstashRedisRateLimiter(
      'https://mock-redis.upstash.io',
      'mock-token',
      { maxRequests: 5, windowMs: 10000 },
      undefined,
      mockRedis,
    );

    const result = await redisLimiter.limit('user-uuid-test');
    expect(result.success).toBe(true);
    expect(result.mode).toBe('redis');
    expect(result.remaining).toBe(4);

    expect(capturedScript).toContain('ZREMRANGEBYSCORE');
    expect(capturedScript).toContain('ZCARD');
    expect(capturedScript).toContain('ZADD');
    expect(capturedKeys).toEqual(['ratelimit:user-uuid-test']);

    // Check captured memberId in args (ARGV[5])
    const memberArg = capturedArgs[4];
    expect(typeof memberArg).toBe('string');
    expect(memberArg).toMatch(/^[0-9]+:[0-9a-f-]{36}$/);
  });

  it('atomically enforces rate limiting under concurrent simulated bursts', async () => {
    const redisLimiter = new UpstashRedisRateLimiter(
      'https://mock-redis.upstash.io',
      'mock-token',
      { maxRequests: 10, windowMs: 60000 },
    );

    let currentTokens = 0;
    vi.spyOn(redisLimiter, 'executeAtomic').mockImplementation(async () => {
      currentTokens += 1;
      if (currentTokens <= 10) {
        return [1, 10 - currentTokens];
      }
      return [0, 0];
    });

    // 25 concurrent requests dispatched simultaneously
    const requests = Array.from({ length: 25 }, () => redisLimiter.limit('concurrent-user'));
    const results = await Promise.all(requests);

    const allowed = results.filter((r) => r.success);
    const blocked = results.filter((r) => !r.success);

    expect(allowed.length).toBe(10);
    expect(blocked.length).toBe(15);
  });
});
