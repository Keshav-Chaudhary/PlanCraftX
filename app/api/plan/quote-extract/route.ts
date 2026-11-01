import { NextResponse } from 'next/server';
import { quoteExtractRequestSchema, quoteExtractResponseSchema } from '@/lib/schemas/api-schemas';
import { generateGeminiStructured } from '@/lib/api-clients/gemini';
import { buildQuoteExtractPrompt } from '@/lib/prompts/planning-prompts';
import { validateJsonBody } from '@/lib/http/validated-json';

export async function POST(request: Request) {
  const validation = await validateJsonBody(request, quoteExtractRequestSchema);
  if (!validation.success) {
    return validation.response;
  }

  const { quoteText, category, categoryBudgetMinor } = validation.data;
  const prompt = buildQuoteExtractPrompt(quoteText, category, categoryBudgetMinor);
  const aiRes = await generateGeminiStructured(prompt, quoteExtractResponseSchema);

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
