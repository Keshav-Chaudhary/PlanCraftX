import { z } from 'zod';
import { getEnv } from '../config/env';
import { type Result, ok, err } from '../result/result';
import type { PublicHoliday } from '../schemas/api-schemas';
import { secureFetch } from '../security/secure-fetch';

const nagerHolidayItemSchema = z.object({
  date: z.string(),
  name: z.string().optional(),
  localName: z.string().optional(),
});

const nagerHolidaysSchema = z.array(nagerHolidayItemSchema);

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

    const rawJson: unknown = await res.json();
    const parsed = nagerHolidaysSchema.safeParse(rawJson);
    if (!parsed.success) {
      return ok([]);
    }

    const holidays: PublicHoliday[] = parsed.data.map((h) => ({
      date: h.date,
      name: h.name || h.localName || 'Public Holiday',
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
