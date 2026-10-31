import { describe, it, expect, vi } from 'vitest';
import { UpstashRedisRateLimiter, InMemoryRateLimiter } from '../../lib/domain/rate-limiter';

describe('Security: Upstash Redis Rate Limiter Resilience & Fail-Safe Mode', () => {
  it('degrades cleanly to fallback-memory mode when Redis encounters network errors', async () => {
    const memoryFallback = new InMemoryRateLimiter({ maxRequests: 5, windowMs: 10000 });
    const redisLimiter = new UpstashRedisRateLimiter(
      'https://mock-redis.upstash.io',
      'mock-token',
      { maxRequests: 5, windowMs: 10000 },
      memoryFallback,
    );

    // Mock Redis pipeline failure
    vi.spyOn(redisLimiter['redis'], 'pipeline').mockImplementation(() => {
      throw new Error('Connection refused by Upstash Redis');
    });

    const result = await redisLimiter.limit('user-test-1');
    expect(result.success).toBe(true);
    expect(result.mode).toBe('memory');
    expect(result.limit).toBe(5);
  });

  it('uses cryptographically unique members in Redis zadd pipeline', async () => {
    const memoryFallback = new InMemoryRateLimiter({ maxRequests: 5, windowMs: 10000 });
    const redisLimiter = new UpstashRedisRateLimiter(
      'https://mock-redis.upstash.io',
      'mock-token',
      { maxRequests: 5, windowMs: 10000 },
      memoryFallback,
    );

    let capturedMember = '';
    const mockExec = vi.fn().mockResolvedValue([0, 1, 1, 1]);
    const mockPipeline = {
      zremrangebyscore: vi.fn(),
      zadd: vi.fn((_key, item: { member: string }) => {
        capturedMember = item.member;
      }),
      zcard: vi.fn(),
      pexpire: vi.fn(),
      exec: mockExec,
    };

    vi.spyOn(redisLimiter['redis'], 'pipeline').mockReturnValue(
      mockPipeline as unknown as ReturnType<(typeof redisLimiter)['redis']['pipeline']>,
    );

    const result = await redisLimiter.limit('user-uuid-test');
    expect(result.success).toBe(true);
    expect(result.mode).toBe('redis');
    // Ensure member contains a UUID pattern
    expect(capturedMember).toMatch(/^[0-9]+:[0-9a-f-]{36}$/);
  });
});
