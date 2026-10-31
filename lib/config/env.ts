import { z } from 'zod';

/**
 * Strict allowlist of permitted external API hostnames in production.
 * Outbound server requests are strictly prevented from contacting unapproved domains (SSRF defense).
 */
export const ALLOWED_UPSTREAM_HOSTS = [
  'generativelanguage.googleapis.com',
  'api.frankfurter.app',
  'api.open-meteo.com',
  'geocoding-api.open-meteo.com',
  'date.nager.at',
  'nominatim.openstreetmap.org',
  'overpass-api.de',
] as const;

const urlWithHostnameValidation = (defaultUrl: string) =>
  z
    .string()
    .url()
    .default(defaultUrl)
    .refine(
      (val) => {
        try {
          const parsed = new URL(val);
          // In test/development, local stub URLs are permitted if explicitly configured
          if (
            process.env['NODE_ENV'] !== 'production' &&
            !process.env['VERCEL_ENV'] &&
            (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
          ) {
            return true;
          }
          return (ALLOWED_UPSTREAM_HOSTS as readonly string[]).includes(parsed.hostname);
        } catch {
          return false;
        }
      },
      {
        message: 'Host must be in the approved upstream allowlist',
      },
    );

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),

    // Google Gemini AI Configuration (server-side only)
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY must be provided').optional(),
    GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),

    // Upstash Redis Distributed Rate Limiting (optional)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

    // Verified Upstream Base URLs (default to real production endpoints)
    FRANKFURTER_BASE_URL: urlWithHostnameValidation('https://api.frankfurter.app'),
    OPEN_METEO_FORECAST_BASE_URL: urlWithHostnameValidation('https://api.open-meteo.com'),
    OPEN_METEO_GEOCODING_BASE_URL: urlWithHostnameValidation(
      'https://geocoding-api.open-meteo.com',
    ),
    NAGER_DATE_BASE_URL: urlWithHostnameValidation('https://date.nager.at'),
    NOMINATIM_BASE_URL: urlWithHostnameValidation('https://nominatim.openstreetmap.org'),
    OVERPASS_BASE_URL: urlWithHostnameValidation('https://overpass-api.de'),

    // Test-Only Upstream Stub Override
    E2E_UPSTREAM_BASE_URL: z.string().url().optional(),
  })
  .superRefine((data, ctx) => {
    // In production environments (or when deployed on Vercel), test-stub overrides are strictly rejected
    const isProd = data.NODE_ENV === 'production' || Boolean(data.VERCEL_ENV);
    if (isProd && data.E2E_UPSTREAM_BASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['E2E_UPSTREAM_BASE_URL'],
        message:
          'E2E_UPSTREAM_BASE_URL override is strictly forbidden in production and Vercel environments.',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Validates and retrieves current environment variables.
 * Fails fast with clear descriptive error messages if invariants are violated.
 */
export function getEnv(overrideProcessEnv?: Record<string, string | undefined>): Env {
  if (!overrideProcessEnv && cachedEnv) {
    return cachedEnv;
  }

  const raw = overrideProcessEnv ?? {
    NODE_ENV: process.env['NODE_ENV'],
    VERCEL_ENV: process.env['VERCEL_ENV'] as Env['VERCEL_ENV'],
    GEMINI_API_KEY: process.env['GEMINI_API_KEY'],
    GEMINI_MODEL: process.env['GEMINI_MODEL'],
    UPSTASH_REDIS_REST_URL: process.env['UPSTASH_REDIS_REST_URL'],
    UPSTASH_REDIS_REST_TOKEN: process.env['UPSTASH_REDIS_REST_TOKEN'],
    FRANKFURTER_BASE_URL: process.env['FRANKFURTER_BASE_URL'],
    OPEN_METEO_FORECAST_BASE_URL: process.env['OPEN_METEO_FORECAST_BASE_URL'],
    OPEN_METEO_GEOCODING_BASE_URL: process.env['OPEN_METEO_GEOCODING_BASE_URL'],
    NAGER_DATE_BASE_URL: process.env['NAGER_DATE_BASE_URL'],
    NOMINATIM_BASE_URL: process.env['NOMINATIM_BASE_URL'],
    OVERPASS_BASE_URL: process.env['OVERPASS_BASE_URL'],
    E2E_UPSTREAM_BASE_URL: process.env['E2E_UPSTREAM_BASE_URL'],
  };

  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Environment validation failed: ${errorDetails}`);
  }

  if (!overrideProcessEnv) {
    cachedEnv = parsed.data;
  }
  return parsed.data;
}

/**
 * Resets the cached environment singleton. Used in tests when altering process.env.
 */
export function resetEnvCache(): void {
  cachedEnv = null;
}
