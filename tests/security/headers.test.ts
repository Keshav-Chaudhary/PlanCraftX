import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import proxy from '@/proxy';

describe('HTTP Security Headers & Rate Limiting Proxy', () => {
  it('injects required OWASP security headers and correlation ID', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'));
    const response = await proxy(request);

    expect(response.headers.get('x-request-id')).toBeDefined();
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(response.headers.get('Permissions-Policy')).toContain('camera=()');

    const csp = response.headers.get('Content-Security-Policy');
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain("'unsafe-inline' 'unsafe-eval'");
  });

  it('enforces rate limits on /api endpoints and attaches rate-limit headers', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/api/plan/test'), {
      headers: {
        'x-forwarded-for': '192.0.2.1',
      },
    });

    const response = await proxy(request);
    expect(response.headers.get('X-RateLimit-Limit')).toBe('30');
    expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
    expect(response.headers.get('X-RateLimit-Mode')).toMatch(/^(redis|memory)$/);
  });

  it('permits unsafe-eval only in development mode for React hot reload and devtools', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      // @ts-expect-error test override
      process.env.NODE_ENV = 'development';
      const devRequest = new NextRequest(new URL('http://localhost:3000/'));
      const devResponse = await proxy(devRequest);
      const devCsp = devResponse.headers.get('Content-Security-Policy');
      expect(devCsp).toContain("'unsafe-eval'");

      // @ts-expect-error test override
      process.env.NODE_ENV = 'production';
      const prodRequest = new NextRequest(new URL('http://localhost:3000/'));
      const prodResponse = await proxy(prodRequest);
      const prodCsp = prodResponse.headers.get('Content-Security-Policy');
      expect(prodCsp).not.toContain("'unsafe-eval'");
    } finally {
      // @ts-expect-error test restore
      process.env.NODE_ENV = originalEnv;
    }
  });
});
