import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  InMemoryRateLimiter,
  UpstashRedisRateLimiter,
  createRateLimiter,
} from '../../lib/security/rate-limiter';
import type { Redis } from '@upstash/redis';

describe('Security: Rate Limiter Concurrency & Boundary Hardening Matrix', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  describe('InMemoryRateLimiter Invariants & Sliding Window Boundaries', () => {
    it('permits initial request and correctly decrements remaining tokens', async () => {
      const limiter = new InMemoryRateLimiter({ maxRequests: 5, windowMs: 10_000 });
      const res = await limiter.limit('client-1');
      expect(res.success).toBe(true);
      expect(res.limit).toBe(5);
      expect(res.remaining).toBe(4);
      expect(res.mode).toBe('memory');
    });

    it('permits requests up to maxRequests capacity', async () => {
      const limiter = new InMemoryRateLimiter({ maxRequests: 3, windowMs: 10_000 });
      const r1 = await limiter.limit('client-1');
      const r2 = await limiter.limit('client-1');
      const r3 = await limiter.limit('client-1');
      expect(r1.success && r2.success && r3.success).toBe(true);
      expect(r3.remaining).toBe(0);
    });

    it('blocks the request immediately after exceeding maxRequests', async () => {
      const limiter = new InMemoryRateLimiter({ maxRequests: 2, windowMs: 10_000 });
      await limiter.limit('client-block');
      await limiter.limit('client-block');
      const blocked = await limiter.limit('client-block');
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterSec).toBeGreaterThanOrEqual(1);
    });

    it('isolates different clients completely so Client A does not exhaust Client B', async () => {
      const limiter = new InMemoryRateLimiter({ maxRequests: 2, windowMs: 10_000 });
      await limiter.limit('client-A');
      await limiter.limit('client-A');
      const blockedA = await limiter.limit('client-A');
      const allowedB = await limiter.limit('client-B');

      expect(blockedA.success).toBe(false);
      expect(allowedB.success).toBe(true);
      expect(allowedB.remaining).toBe(1);
    });

    it('clears all rate history when clear() is invoked', async () => {
      const limiter = new InMemoryRateLimiter({ maxRequests: 1, windowMs: 10_000 });
      await limiter.limit('client-wipe');
      expect((await limiter.limit('client-wipe')).success).toBe(false);

      limiter.clear();
      expect((await limiter.limit('client-wipe')).success).toBe(true);
    });

    it('handles concurrency burst via Promise.all accurately', async () => {
      const limiter = new InMemoryRateLimiter({ maxRequests: 10, windowMs: 10_000 });
      const promises = Array.from({ length: 15 }, () => limiter.limit('burst-client'));
      const results = await Promise.all(promises);

      const successful = results.filter((r) => r.success);
      const blocked = results.filter((r) => !r.success);

      expect(successful).toHaveLength(10);
      expect(blocked).toHaveLength(5);
    });

    it('calculates retryAfterSec as integer rounded up to nearest second', async () => {
      const limiter = new InMemoryRateLimiter({ maxRequests: 1, windowMs: 5_500 });
      await limiter.limit('client-time');
      const blocked = await limiter.limit('client-time');
      expect(blocked.retryAfterSec).toBeGreaterThanOrEqual(5);
      expect(blocked.retryAfterSec).toBeLessThanOrEqual(6);
    });

    it('handles single-request limit capacity (strict 1 req per window)', async () => {
      const limiter = new InMemoryRateLimiter({ maxRequests: 1, windowMs: 60_000 });
      const first = await limiter.limit('one-shot');
      const second = await limiter.limit('one-shot');
      expect(first.success).toBe(true);
      expect(first.remaining).toBe(0);
      expect(second.success).toBe(false);
    });
  });

  describe('UpstashRedisRateLimiter Atomic Lua Execution & Fail-Closed Policies', () => {
    it('executes atomic Lua script with ratelimit: prefixed key and member UUID', async () => {
      const mockEval = vi.fn().mockResolvedValue([1, 19]);
      const mockRedis = { eval: mockEval } as unknown as Redis;

      const limiter = new UpstashRedisRateLimiter(
        'https://fake.upstash.io',
        'fake-token',
        { maxRequests: 20, windowMs: 60_000 },
        undefined,
        mockRedis,
      );

      const res = await limiter.limit('test-user');
      expect(mockEval).toHaveBeenCalledWith(
        expect.any(String),
        ['ratelimit:test-user'],
        expect.arrayContaining([expect.any(Number), 20, 60_000]),
      );
      expect(res.success).toBe(true);
      expect(res.remaining).toBe(19);
      expect(res.mode).toBe('redis');
    });

    it('returns success: false when Lua script returns allowed=0', async () => {
      const mockEval = vi.fn().mockResolvedValue([0, 0]);
      const mockRedis = { eval: mockEval } as unknown as Redis;

      const limiter = new UpstashRedisRateLimiter(
        'https://fake.upstash.io',
        'fake-token',
        { maxRequests: 10, windowMs: 30_000 },
        undefined,
        mockRedis,
      );

      const res = await limiter.limit('over-limit-user');
      expect(res.success).toBe(false);
      expect(res.remaining).toBe(0);
      expect(res.mode).toBe('redis');
      expect(res.retryAfterSec).toBe(30);
    });

    it('fails closed in production environment when Redis throws connection error', async () => {
      process.env.NODE_ENV = 'production';
      const mockEval = vi.fn().mockRejectedValue(new Error('Redis connection refused'));
      const mockRedis = { eval: mockEval } as unknown as Redis;

      const limiter = new UpstashRedisRateLimiter(
        'https://fake.upstash.io',
        'fake-token',
        { maxRequests: 10, windowMs: 60_000 },
        undefined,
        mockRedis,
      );

      const res = await limiter.limit('fail-closed-user');
      expect(res.success).toBe(false);
      expect(res.remaining).toBe(0);
      expect(res.mode).toBe('redis');
    });

    it('degrades to local in-memory fallback in non-production environment', async () => {
      process.env.NODE_ENV = 'test';
      const mockEval = vi.fn().mockRejectedValue(new Error('Redis network timeout'));
      const mockRedis = { eval: mockEval } as unknown as Redis;

      const limiter = new UpstashRedisRateLimiter(
        'https://fake.upstash.io',
        'fake-token',
        { maxRequests: 5, windowMs: 60_000 },
        undefined,
        mockRedis,
      );

      const res = await limiter.limit('fallback-user');
      expect(res.success).toBe(true);
      expect(res.mode).toBe('memory');
    });

    it('honors explicit failClosed: true even when NODE_ENV is not production', async () => {
      process.env.NODE_ENV = 'development';
      const mockEval = vi.fn().mockRejectedValue(new Error('Cluster timeout'));
      const mockRedis = { eval: mockEval } as unknown as Redis;

      const limiter = new UpstashRedisRateLimiter(
        'https://fake.upstash.io',
        'fake-token',
        { maxRequests: 5, windowMs: 60_000, failClosed: true },
        undefined,
        mockRedis,
      );

      const res = await limiter.limit('strict-user');
      expect(res.success).toBe(false);
      expect(res.mode).toBe('redis');
    });

    it('honors explicit failClosed: false in production to force in-memory degradation', async () => {
      process.env.NODE_ENV = 'production';
      const mockEval = vi.fn().mockRejectedValue(new Error('Fail soft'));
      const mockRedis = { eval: mockEval } as unknown as Redis;

      const limiter = new UpstashRedisRateLimiter(
        'https://fake.upstash.io',
        'fake-token',
        { maxRequests: 5, windowMs: 60_000, failClosed: false },
        undefined,
        mockRedis,
      );

      const res = await limiter.limit('soft-user');
      expect(res.success).toBe(true);
      expect(res.mode).toBe('memory');
    });

    it('safely handles non-array responses from Redis eval', async () => {
      const mockEval = vi.fn().mockResolvedValue(null);
      const mockRedis = { eval: mockEval } as unknown as Redis;

      const limiter = new UpstashRedisRateLimiter(
        'https://fake.upstash.io',
        'fake-token',
        { maxRequests: 5, windowMs: 60_000 },
        undefined,
        mockRedis,
      );

      const [allowed, remaining] = await limiter.executeAtomic('test', 1000, 500, 'm1');
      expect(allowed).toBe(0);
      expect(remaining).toBe(0);
    });
  });

  describe('createRateLimiter Factory', () => {
    it('creates InMemoryRateLimiter when credentials are omitted', () => {
      const limiter = createRateLimiter();
      expect(limiter).toBeInstanceOf(InMemoryRateLimiter);
    });

    it('creates UpstashRedisRateLimiter when URL and token are provided', () => {
      const limiter = createRateLimiter('https://valid.upstash.io', 'token-123');
      expect(limiter).toBeInstanceOf(UpstashRedisRateLimiter);
    });

    it('creates InMemoryRateLimiter when only URL is provided without token', () => {
      const limiter = createRateLimiter('https://valid.upstash.io', undefined);
      expect(limiter).toBeInstanceOf(InMemoryRateLimiter);
    });

    it('creates InMemoryRateLimiter when only token is provided without URL', () => {
      const limiter = createRateLimiter(undefined, 'token-123');
      expect(limiter).toBeInstanceOf(InMemoryRateLimiter);
    });

    it('passes custom options (maxRequests, windowMs) through to the instance', async () => {
      const limiter = createRateLimiter(undefined, undefined, {
        maxRequests: 2,
        windowMs: 50_000,
      });
      const r1 = await limiter.limit('opt-user');
      const r2 = await limiter.limit('opt-user');
      const r3 = await limiter.limit('opt-user');
      expect(r1.limit).toBe(2);
      expect(r1.remaining).toBe(1);
      expect(r2.remaining).toBe(0);
      expect(r3.success).toBe(false);
    });
  });
});
