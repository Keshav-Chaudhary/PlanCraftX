import { NextResponse } from 'next/server';
import { currencyRatesRequestSchema } from '@/lib/schemas/api-schemas';
import { fetchExchangeRate } from '@/lib/api-clients/frankfurter';
import { validateJsonBody } from '@/lib/http/validated-json';

export async function POST(request: Request) {
  const validation = await validateJsonBody(request, currencyRatesRequestSchema);
  if (!validation.success) {
    return validation.response;
  }

  const { from, to } = validation.data;
  const rateRes = await fetchExchangeRate(from, to);

  if (!rateRes.success) {
    return NextResponse.json(
      { error: rateRes.error.code, message: rateRes.error.message, canRetry: true },
      { status: 502 },
    );
  }

  return NextResponse.json({ from, to, rate: rateRes.value }, { status: 200 });
}
