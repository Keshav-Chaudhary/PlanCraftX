import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  readonly success: boolean;
  readonly limit: number;
  readonly remaining: number;
  readonly resetMs: number;
  readonly retryAfterSec: number;
  readonly mode: 'redis' | 'memory' | 'fallback-memory';
}

export interface RateLimiter {
  limit(identifier: string): Promise<RateLimitResult>;
}

export interface RateLimiterOptions {
  /** Maximum requests permitted in the window */
  readonly maxRequests: number;
  /** Window duration in milliseconds */
  readonly windowMs: number;
  /**
   * When true or when running in production, fails closed (denies requests)
   * on Redis connection failures to prevent multi-instance bypasses.
   * Defaults to false in non-production environments to aid local development.
   */
  readonly failClosed?: boolean;
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
 * Atomic Lua script implementing a sliding window rate limiter in Redis.
 * Executes atomically across read, count, and insert operations to eliminate race conditions
 * between concurrent serverless/container workers.
 */
const SLIDING_WINDOW_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_start = tonumber(ARGV[2])
local max_requests = tonumber(ARGV[3])
local window_ms = tonumber(ARGV[4])
local member = ARGV[5]

redis.call('ZREMRANGEBYSCORE', key, 0, window_start)
local current_count = redis.call('ZCARD', key)

if current_count < max_requests then
  redis.call('ZADD', key, now, member)
  redis.call('PEXPIRE', key, window_ms)
  return { 1, max_requests - current_count - 1 }
else
  return { 0, 0 }
end
`;

/**
 * Distributed Upstash Redis rate limiter with atomic Lua script execution.
 * Defends against distributed race conditions and supports fail-closed semantics in production.
 */
export class UpstashRedisRateLimiter implements RateLimiter {
  private readonly redis: Redis;
  private readonly fallback: InMemoryRateLimiter;
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly failClosed?: boolean | undefined;

  constructor(
    url: string,
    token: string,
    options: RateLimiterOptions = { maxRequests: 20, windowMs: 60_000 },
    fallbackLimiter?: InMemoryRateLimiter,
    customRedis?: Redis,
  ) {
    this.redis = customRedis ?? new Redis({ url, token });
    this.fallback = fallbackLimiter ?? new InMemoryRateLimiter(options);
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
    this.failClosed = options.failClosed;
  }

  /**
   * Executes atomic sliding window Lua script on Redis.
   * Exposed for direct verification and isolated atomic testing.
   */
  async executeAtomic(
    key: string,
    now: number,
    windowStart: number,
    memberId: string,
  ): Promise<[number, number]> {
    const res = await this.redis.eval<(string | number)[], [number, number]>(
      SLIDING_WINDOW_LUA,
      [key],
      [now, windowStart, this.maxRequests, this.windowMs, memberId],
    );
    if (Array.isArray(res) && res.length >= 2) {
      return [Number(res[0]), Number(res[1])];
    }
    return [0, 0];
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    try {
      const key = `ratelimit:${identifier}`;
      const now = Date.now();
      const windowStart = now - this.windowMs;
      const memberId = `${now}:${crypto.randomUUID()}`;

      // Atomic execution eliminates race conditions between concurrent requests
      const [allowedNum, remainingNum] = await this.executeAtomic(key, now, windowStart, memberId);

      const isAllowed = allowedNum === 1;

      if (!isAllowed) {
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
        remaining: Math.max(0, remainingNum ?? 0),
        resetMs: this.windowMs,
        retryAfterSec: 0,
        mode: 'redis',
      };
    } catch {
      const isProduction = process.env['NODE_ENV'] === 'production';
      const shouldFailClosed = this.failClosed ?? isProduction;

      if (shouldFailClosed) {
        console.warn(
          '[RateLimiter] Upstash Redis outage in production; failing closed to protect upstream resources.',
        );
        return {
          success: false,
          limit: this.maxRequests,
          remaining: 0,
          resetMs: this.windowMs,
          retryAfterSec: Math.ceil(this.windowMs / 1000),
          mode: 'redis',
        };
      }

      // Degrade to local in-memory sliding window limiter in development/test
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
