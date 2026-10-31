import { NextResponse } from 'next/server';
import { planReviewRequestSchema, planReviewResponseSchema } from '@/lib/schemas/api-schemas';
import { generateGeminiStructured } from '@/lib/api-clients/gemini';
import { buildPlanReviewPrompt } from '@/lib/prompts/planning-prompts';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const parsed = planReviewRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation Error', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const prompt = buildPlanReviewPrompt(parsed.data.findings);
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
