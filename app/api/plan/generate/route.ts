import { NextResponse } from 'next/server';
import { planGenerationRequestSchema, aiBudgetProposalSchema } from '@/lib/schemas/api-schemas';
import { generateGeminiStructured } from '@/lib/api-clients/gemini';
import { buildBudgetProposalPrompt } from '@/lib/prompts/planning-prompts';
import { buildEventPlan } from '@/lib/domain/plan-generator';
import { validateJsonBody } from '@/lib/http/validated-json';

export async function POST(request: Request) {
  const validation = await validateJsonBody(request, planGenerationRequestSchema);
  if (!validation.success) {
    return validation.response;
  }

  const data = validation.data;

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
