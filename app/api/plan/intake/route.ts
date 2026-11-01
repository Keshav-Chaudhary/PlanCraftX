import { NextResponse } from 'next/server';
import { intakeRequestSchema, intakeResponseSchema } from '@/lib/schemas/api-schemas';
import { generateGeminiStructured } from '@/lib/api-clients/gemini';
import { buildIntakePrompt } from '@/lib/prompts/planning-prompts';
import { validateJsonBody } from '@/lib/http/validated-json';

export async function POST(request: Request) {
  const validation = await validateJsonBody(request, intakeRequestSchema);
  if (!validation.success) {
    return validation.response;
  }

  const prompt = buildIntakePrompt(validation.data.description);
  const aiRes = await generateGeminiStructured(prompt, intakeResponseSchema);

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
