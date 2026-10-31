import { NextResponse } from 'next/server';
import {
  explainTradeoffsRequestSchema,
  explainTradeoffsResponseSchema,
} from '@/lib/schemas/api-schemas';
import { generateGeminiStructured } from '@/lib/api-clients/gemini';
import { buildExplainTradeoffsPrompt } from '@/lib/prompts/planning-prompts';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const parsed = explainTradeoffsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation Error', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { planTitle, currency, totalBudgetMinor, allocatedMinor, options } = parsed.data;
  const prompt = buildExplainTradeoffsPrompt(
    planTitle,
    currency,
    totalBudgetMinor,
    allocatedMinor,
    options,
  );

  const aiRes = await generateGeminiStructured(prompt, explainTradeoffsResponseSchema);

  if (!aiRes.success) {
    return NextResponse.json(
      {
        error: aiRes.error.code,
        message: aiRes.error.message,
      },
      { status: aiRes.error.code === 'RATE_LIMITED' ? 429 : 502 },
    );
  }

  return NextResponse.json(aiRes.value);
}
