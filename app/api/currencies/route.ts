import { NextResponse } from 'next/server';
import { currencyRatesRequestSchema } from '@/lib/schemas/api-schemas';
import { fetchExchangeRate } from '@/lib/api-clients/frankfurter';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const parsed = currencyRatesRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation Error', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { from, to } = parsed.data;
  const rateRes = await fetchExchangeRate(from, to);

  if (!rateRes.success) {
    return NextResponse.json(
      { error: rateRes.error.code, message: rateRes.error.message, canRetry: true },
      { status: 502 },
    );
  }

  return NextResponse.json({ from, to, rate: rateRes.value }, { status: 200 });
}
