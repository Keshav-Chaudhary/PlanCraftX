import { NextResponse } from 'next/server';
import { planGenerationRequestSchema, aiBudgetProposalSchema } from '@/lib/schemas/api-schemas';
import {
  type EventPlan,
  type BudgetItem,
  type TimelineItem,
  type VendorItem,
} from '@/lib/schemas/event-plan';
import { EVENT_CATEGORIES } from '@/lib/domain/event-rules';
import { majorToMinor, allocateBudgetLargestRemainder } from '@/lib/domain/budget-math';
import { calculateTimelinePhases } from '@/lib/domain/timeline-engine';
import { generateGeminiStructured } from '@/lib/api-clients/gemini';
import { buildBudgetProposalPrompt } from '@/lib/prompts/planning-prompts';

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
  const categories = EVENT_CATEGORIES[data.eventType];
  const totalMinor = majorToMinor(data.totalBudgetMajor, data.currency);

  // Attempt dynamic budget proportions from Gemini
  const prompt = buildBudgetProposalPrompt(data);
  const aiProposalRes = await generateGeminiStructured(prompt, aiBudgetProposalSchema);

  let categoryWeights: Array<{ category: string; weight: number }>;

  if (aiProposalRes.success && aiProposalRes.value.proportions.length > 0) {
    categoryWeights = aiProposalRes.value.proportions.map((p) => ({
      category: p.category,
      weight: p.weight,
    }));
  } else {
    // Equal baseline weights across official domain categories for this event type
    categoryWeights = categories.map((cat) => ({
      category: cat,
      weight: 100 / categories.length,
    }));
  }

  // Exact normalization via largest-remainder method
  const allocations = allocateBudgetLargestRemainder(totalMinor, categoryWeights);
  const budgetItems: BudgetItem[] = allocations.map((alloc, idx) => ({
    id: `budget-${idx + 1}`,
    category: alloc.category,
    allocatedMinor: alloc.allocatedMinor,
    spentMinor: 0,
    isEstimate: true,
  }));

  // Reverse-planned timeline milestones
  const today = new Date().toISOString().split('T')[0] ?? '2026-01-01';
  const calculatedPhases = calculateTimelinePhases(data.eventType, data.eventDate, today);

  const timelineItems: TimelineItem[] = calculatedPhases.map((phase, idx) => ({
    id: `timeline-${idx + 1}`,
    phase: phase.phase,
    title: `${phase.phase} Milestone`,
    dueDate: phase.dueDate,
    status: 'pending',
    isEstimate: true,
    description: `Complete key preparations for ${phase.phase.toLowerCase()} phase.`,
  }));

  // Pre-populate categorized vendor checklist
  const vendorItems: VendorItem[] = categories.map((cat, idx) => ({
    id: `vendor-${idx + 1}`,
    category: cat,
    name: `Required: ${cat}`,
    status: 'to_contact',
    isEstimate: true,
    notes: `Identify and reach out to local ${cat.toLowerCase()} providers.`,
  }));

  const now = new Date().toISOString();
  const plan: EventPlan = {
    id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    schemaVersion: 1,
    title: `${data.eventType.toUpperCase()} Planning: ${data.location}`,
    eventType: data.eventType,
    eventDate: data.eventDate,
    location: data.location,
    guestCount: data.guestCount,
    totalBudgetMinor: totalMinor,
    currency: data.currency,
    isOutdoor: data.isOutdoor,
    ...(data.dietaryRequirements ? { dietaryRequirements: data.dietaryRequirements } : {}),
    ...(data.accessibilityNeeds ? { accessibilityNeeds: data.accessibilityNeeds } : {}),
    budgetItems,
    timelineItems,
    vendorItems,
    ideas: [],
    createdAt: now,
    updatedAt: now,
  };

  return NextResponse.json(plan, { status: 200 });
}
