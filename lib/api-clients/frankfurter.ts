import { getEnv } from '../config/env';
import { type Result, ok, err } from '../result/result';

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
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      return err({
        code: 'UPSTREAM_ERROR',
        message: `Frankfurter API returned status ${res.status}`,
      });
    }

    const data = (await res.json()) as { rates?: Record<string, number> };
    const ratesMap = new Map<string, number>(Object.entries(data.rates || {}));
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
