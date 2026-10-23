import { describe, it, expect } from 'vitest';
import { getEnv, ALLOWED_UPSTREAM_HOSTS } from '@/lib/config/env';

describe('Environment Configuration & Upstream Security', () => {
  it('validates default upstream URLs against approved allowlist', () => {
    const env = getEnv({
      NODE_ENV: 'test',
    });

    expect(env.FRANKFURTER_BASE_URL).toBe('https://api.frankfurter.app');
    expect(env.OPEN_METEO_FORECAST_BASE_URL).toBe('https://api.open-meteo.com');
    expect(env.OPEN_METEO_GEOCODING_BASE_URL).toBe('https://geocoding-api.open-meteo.com');
    expect(env.NAGER_DATE_BASE_URL).toBe('https://date.nager.at');
    expect(env.NOMINATIM_BASE_URL).toBe('https://nominatim.openstreetmap.org');
    expect(env.OVERPASS_BASE_URL).toBe('https://overpass-api.de');

    const frankfurterHost = new URL(env.FRANKFURTER_BASE_URL).hostname;
    expect(ALLOWED_UPSTREAM_HOSTS).toContain(frankfurterHost);
  });

  it('strictly rejects E2E_UPSTREAM_BASE_URL when NODE_ENV is production (Amendment B)', () => {
    expect(() =>
      getEnv({
        NODE_ENV: 'production',
        E2E_UPSTREAM_BASE_URL: 'http://localhost:8080',
      }),
    ).toThrowError(/E2E_UPSTREAM_BASE_URL override is strictly forbidden in production/);
  });

  it('strictly rejects E2E_UPSTREAM_BASE_URL when VERCEL_ENV is set (Amendment B)', () => {
    expect(() =>
      getEnv({
        NODE_ENV: 'development',
        VERCEL_ENV: 'preview',
        E2E_UPSTREAM_BASE_URL: 'http://localhost:8080',
      }),
    ).toThrowError(/E2E_UPSTREAM_BASE_URL override is strictly forbidden in production/);
  });

  it('permits localhost stub URLs in non-production environments', () => {
    const env = getEnv({
      NODE_ENV: 'test',
      FRANKFURTER_BASE_URL: 'http://localhost:9090',
    });
    expect(env.FRANKFURTER_BASE_URL).toBe('http://localhost:9090');
  });

  it('rejects unapproved external hosts in production to prevent SSRF', () => {
    expect(() =>
      getEnv({
        NODE_ENV: 'production',
        FRANKFURTER_BASE_URL: 'https://malicious-api.evil.com',
      }),
    ).toThrowError(/Host must be in the approved upstream allowlist/);
  });

  it('rejects malformed URLs', () => {
    expect(() =>
      getEnv({
        NODE_ENV: 'test',
        FRANKFURTER_BASE_URL: 'not-a-valid-url',
      }),
    ).toThrowError(/Invalid url/);
  });

  it('successfully retrieves env without overrides from process.env', () => {
    const env = getEnv();
    expect(env).toBeDefined();
    expect(env.GEMINI_MODEL).toBe('gemini-2.5-flash');
  });
});
