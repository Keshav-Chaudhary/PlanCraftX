import { NextResponse } from 'next/server';
import { planGenerationRequestSchema, aiBudgetProposalSchema } from '@/lib/schemas/api-schemas';
import { generateGeminiStructured } from '@/lib/api-clients/gemini';
import { buildBudgetProposalPrompt } from '@/lib/prompts/planning-prompts';
import { buildEventPlan } from '@/lib/domain/plan-generator';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const parsed = planGenerationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation Error', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Attempt dynamic budget proportions from Gemini
  const prompt = buildBudgetProposalPrompt(data);
  const aiProposalRes = await generateGeminiStructured(prompt, aiBudgetProposalSchema);

  const customWeights =
    aiProposalRes.success && aiProposalRes.value.proportions.length > 0
      ? aiProposalRes.value.proportions.map((p) => ({
          category: p.category,
          weight: p.weight,
        }))
      : undefined;

  const plan = buildEventPlan(data, customWeights);
  return NextResponse.json(plan, { status: 200 });
}
