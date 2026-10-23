import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  readonly success: boolean;
  readonly limit: number;
  readonly remaining: number;
  readonly resetMs: number;
  readonly retryAfterSec: number;
  readonly mode: 'redis' | 'memory';
}

export interface RateLimiter {
  limit(identifier: string): Promise<RateLimitResult>;
}

export interface RateLimiterOptions {
  /** Maximum requests permitted in the window */
  readonly maxRequests: number;
  /** Window duration in milliseconds */
  readonly windowMs: number;
}

/**
 * High-performance sliding-window in-memory rate limiter.
 * Tracks timestamps per identifier to guarantee accurate rate bounding.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly storage = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(options: RateLimiterOptions = { maxRequests: 20, windowMs: 60_000 }) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const timestamps = this.storage.get(identifier) ?? [];
    // Discard timestamps older than current window
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      const oldestInWindow = validTimestamps[0] ?? now;
      const resetMs = Math.max(0, oldestInWindow + this.windowMs - now);
      const retryAfterSec = Math.max(1, Math.ceil(resetMs / 1000));

      this.storage.set(identifier, validTimestamps);
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        resetMs,
        retryAfterSec,
        mode: 'memory',
      };
    }

    validTimestamps.push(now);
    this.storage.set(identifier, validTimestamps);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - validTimestamps.length,
      resetMs: this.windowMs,
      retryAfterSec: 0,
      mode: 'memory',
    };
  }

  /**
   * Resets stored rates (used primarily in tests).
   */
  clear(): void {
    this.storage.clear();
  }
}

/**
 * Distributed Upstash Redis rate limiter with automatic graceful degradation.
 * If Redis is unreachable or throws a network error, it logs a redacted warning
 * and immediately falls back to the in-memory limiter (fail-open to local, never fully open).
 */
export class UpstashRedisRateLimiter implements RateLimiter {
  private readonly redis: Redis;
  private readonly fallback: InMemoryRateLimiter;
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(
    url: string,
    token: string,
    options: RateLimiterOptions = { maxRequests: 20, windowMs: 60_000 },
    fallbackLimiter?: InMemoryRateLimiter,
  ) {
    this.redis = new Redis({ url, token });
    this.fallback = fallbackLimiter ?? new InMemoryRateLimiter(options);
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    try {
      const key = `ratelimit:${identifier}`;
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // Sliding window via sorted set in Redis
      const pipeline = this.redis.pipeline();
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zadd(key, { score: now, member: `${now}:${Math.random()}` });
      pipeline.zcard(key);
      pipeline.pexpire(key, this.windowMs);

      const results = await pipeline.exec();
      const count = Number(results[2] ?? 0);

      if (count > this.maxRequests) {
        return {
          success: false,
          limit: this.maxRequests,
          remaining: 0,
          resetMs: this.windowMs,
          retryAfterSec: Math.ceil(this.windowMs / 1000),
          mode: 'redis',
        };
      }

      return {
        success: true,
        limit: this.maxRequests,
        remaining: Math.max(0, this.maxRequests - count),
        resetMs: this.windowMs,
        retryAfterSec: 0,
        mode: 'redis',
      };
    } catch {
      // Degrade to local in-memory sliding window limiter (fail-open to local, never fully open)
      console.warn(
        '[RateLimiter] Upstash Redis outage or unreachable; degrading to local in-memory limiter.',
      );
      return this.fallback.limit(identifier);
    }
  }
}

/**
 * Creates the appropriate rate limiter instance based on provided environment config.
 */
export function createRateLimiter(
  redisUrl?: string,
  redisToken?: string,
  options?: RateLimiterOptions,
): RateLimiter {
  if (redisUrl && redisToken) {
    return new UpstashRedisRateLimiter(redisUrl, redisToken, options);
  }
  return new InMemoryRateLimiter(options);
}
