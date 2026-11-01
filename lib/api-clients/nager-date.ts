import { getEnv } from '../config/env';
import { type Result, ok, err } from '../result/result';
import type { PublicHoliday } from '../schemas/api-schemas';
import { secureFetch } from '../security/secure-fetch';

export async function fetchPublicHolidays(
  year: number,
  countryCode: string,
): Promise<Result<PublicHoliday[], { code: string; message: string }>> {
  const env = getEnv();
  const url = `${env.NAGER_DATE_BASE_URL}/api/v3/PublicHolidays/${year}/${encodeURIComponent(countryCode.toUpperCase())}`;

  try {
    const res = await secureFetch(url, { timeoutMs: 8000 });
    if (!res.ok) {
      return err({
        code: 'UPSTREAM_ERROR',
        message: `Nager.Date returned status ${res.status}`,
      });
    }

    const data = (await res.json()) as Array<{ date?: string; name?: string; localName?: string }>;
    if (!Array.isArray(data)) {
      return ok([]);
    }

    const holidays: PublicHoliday[] = data
      .filter((h) => typeof h.date === 'string' && typeof h.name === 'string')
      .map((h) => ({
        date: h.date as string,
        name: (h.name as string) || (h.localName as string) || 'Public Holiday',
      }));

    return ok(holidays);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Network error';
    return err({
      code: 'NETWORK_ERROR',
      message: `Failed to fetch public holidays: ${msg}`,
    });
  }
}
