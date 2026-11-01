import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRateLimiter } from './lib/security/rate-limiter';
import { getRateLimitIdentifier } from './lib/security/client-ip';

// Global singleton rate limiter instance for request proxying
const rateLimiter = createRateLimiter(
  process.env['UPSTASH_REDIS_REST_URL'],
  process.env['UPSTASH_REDIS_REST_TOKEN'],
  { maxRequests: 30, windowMs: 60_000 },
);

export default async function proxy(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const response = NextResponse.next();

  // Set correlation ID for structured tracing
  response.headers.set('x-request-id', requestId);

  // Rate Limiting on API endpoints
  if (request.nextUrl.pathname.startsWith('/api')) {
    const identifier = getRateLimitIdentifier(request.headers, request.nextUrl.pathname);

    const limitResult = await rateLimiter.limit(identifier);

    response.headers.set('X-RateLimit-Limit', limitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', limitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', limitResult.resetMs.toString());
    response.headers.set('X-RateLimit-Mode', limitResult.mode);

    if (!limitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please retry after the duration specified.',
          retryAfterSec: limitResult.retryAfterSec,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': limitResult.retryAfterSec.toString(),
            'X-RateLimit-Limit': limitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': limitResult.resetMs.toString(),
            'X-RateLimit-Mode': limitResult.mode,
            'x-request-id': requestId,
          },
        },
      );
    }
  }

  // Content-Security-Policy (CSP)
  // React DevTools and Next.js hot module replacement require eval() in development mode
  const isDev = process.env.NODE_ENV === 'development';
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  const cspHeader = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://*.tile.openstreetmap.org",
    "font-src 'self' data:",
    "connect-src 'self' https://generativelanguage.googleapis.com https://api.frankfurter.app https://api.open-meteo.com https://geocoding-api.open-meteo.com https://date.nager.at https://nominatim.openstreetmap.org https://overpass-api.de",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );
  if (!isDev) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
