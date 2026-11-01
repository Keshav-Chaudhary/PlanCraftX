import { NextResponse } from 'next/server';
import { holidaysRequestSchema } from '@/lib/schemas/api-schemas';
import { fetchPublicHolidays } from '@/lib/api-clients/nager-date';
import { validateJsonBody } from '@/lib/http/validated-json';

export async function POST(request: Request) {
  const validation = await validateJsonBody(request, holidaysRequestSchema);
  if (!validation.success) {
    return validation.response;
  }

  const { year, countryCode } = validation.data;
  const holidaysRes = await fetchPublicHolidays(year, countryCode);

  if (!holidaysRes.success) {
    return NextResponse.json(
      { error: holidaysRes.error.code, message: holidaysRes.error.message, canRetry: true },
      { status: 502 },
    );
  }

  return NextResponse.json({ holidays: holidaysRes.value }, { status: 200 });
}
