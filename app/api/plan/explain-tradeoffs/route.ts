import { NextResponse } from 'next/server';
import {
  explainTradeoffsRequestSchema,
  explainTradeoffsResponseSchema,
} from '@/lib/schemas/api-schemas';
import { generateGeminiStructured } from '@/lib/api-clients/gemini';
import { buildExplainTradeoffsPrompt } from '@/lib/prompts/planning-prompts';
import { validateJsonBody } from '@/lib/http/validated-json';

export async function POST(request: Request) {
  const validation = await validateJsonBody(request, explainTradeoffsRequestSchema);
  if (!validation.success) {
    return validation.response;
  }

  const { planTitle, currency, totalBudgetMinor, allocatedMinor, options } = validation.data;
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
