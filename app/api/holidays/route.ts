import { NextResponse } from 'next/server';
import { holidaysRequestSchema } from '@/lib/schemas/api-schemas';
import { fetchPublicHolidays } from '@/lib/api-clients/nager-date';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const parsed = holidaysRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation Error', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { year, countryCode } = parsed.data;
  const holidaysRes = await fetchPublicHolidays(year, countryCode);

  if (!holidaysRes.success) {
    return NextResponse.json(
      { error: holidaysRes.error.code, message: holidaysRes.error.message, canRetry: true },
      { status: 502 },
    );
  }

  return NextResponse.json({ holidays: holidaysRes.value }, { status: 200 });
}
