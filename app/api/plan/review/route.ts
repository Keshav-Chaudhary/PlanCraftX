import { NextResponse } from 'next/server';
import { planReviewRequestSchema, planReviewResponseSchema } from '@/lib/schemas/api-schemas';
import { generateGeminiStructured } from '@/lib/api-clients/gemini';
import { buildPlanReviewPrompt } from '@/lib/prompts/planning-prompts';
import { validateJsonBody } from '@/lib/http/validated-json';

export async function POST(request: Request) {
  const validation = await validateJsonBody(request, planReviewRequestSchema);
  if (!validation.success) {
    return validation.response;
  }

  const prompt = buildPlanReviewPrompt(validation.data.findings);
  const aiRes = await generateGeminiStructured(prompt, planReviewResponseSchema);

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
