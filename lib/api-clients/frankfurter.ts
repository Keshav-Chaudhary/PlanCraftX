import { z } from 'zod';
import { getEnv } from '../config/env';
import { type Result, ok, err } from '../result/result';
import { secureFetch } from '../security/secure-fetch';

const frankfurterResponseSchema = z.object({
  rates: z.record(z.string(), z.number()).optional(),
});

export async function fetchExchangeRate(
  from: string,
  to: string,
): Promise<Result<number, { code: string; message: string }>> {
  const fromUpper = from.toUpperCase();
  const toUpper = to.toUpperCase();

  if (fromUpper === toUpper) {
    return ok(1);
  }

  const env = getEnv();
  const url = `${env.FRANKFURTER_BASE_URL}/latest?from=${fromUpper}&to=${toUpper}`;

  try {
    const res = await secureFetch(url, { timeoutMs: 8000 });
    if (!res.ok) {
      return err({
        code: 'UPSTREAM_ERROR',
        message: `Frankfurter API returned status ${res.status}`,
      });
    }

    const rawJson: unknown = await res.json();
    const parsed = frankfurterResponseSchema.safeParse(rawJson);
    if (!parsed.success) {
      return err({
        code: 'UPSTREAM_ERROR',
        message: 'Invalid response structure from Frankfurter API',
      });
    }

    const ratesMap = new Map<string, number>(Object.entries(parsed.data.rates || {}));
    const rate = ratesMap.get(toUpper);

    if (typeof rate !== 'number' || rate <= 0) {
      return err({
        code: 'RATE_NOT_AVAILABLE',
        message: `Conversion rate between ${fromUpper} and ${toUpper} is not available.`,
      });
    }

    return ok(rate);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return err({
      code: 'NETWORK_ERROR',
      message: `Failed to fetch exchange rate: ${msg}`,
    });
  }
}
