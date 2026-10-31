import type { EventPlan, BudgetItem, TimelineItem, VendorItem } from '@/lib/schemas/event-plan';
import { EVENT_CATEGORIES, type EventType } from './event-rules';
import { majorToMinor, allocateBudgetLargestRemainder } from './budget-math';
import { calculateTimelinePhases } from './timeline-engine';

export interface PlanGenerationInput {
  readonly eventType: EventType;
  readonly eventDate: string;
  readonly location: string;
  readonly guestCount: number;
  readonly totalBudgetMajor: number;
  readonly currency: string;
  readonly isOutdoor: boolean;
  readonly themeOrCulture?: string | undefined;
  readonly targetAgeGroup?: string | undefined;
  readonly dietaryRequirements?: string | undefined;
  readonly accessibilityNeeds?: string | undefined;
  readonly freeTextVision?: string | undefined;
  readonly priorities?: string | undefined;
}

export function buildEventPlan(
  data: PlanGenerationInput,
  customWeights?: ReadonlyArray<{ readonly category: string; readonly weight: number }>,
): EventPlan {
  const categories = EVENT_CATEGORIES[data.eventType];
  const totalMinor = majorToMinor(data.totalBudgetMajor, data.currency);

  const categoryWeights =
    customWeights && customWeights.length > 0
      ? customWeights.map((w) => ({ category: w.category, weight: w.weight }))
      : categories.map((cat) => ({
          category: cat,
          weight: 100 / categories.length,
        }));

  const allocations = allocateBudgetLargestRemainder(totalMinor, categoryWeights);
  const budgetItems: BudgetItem[] = allocations.map((alloc, idx) => ({
    id: `budget-${idx + 1}`,
    category: alloc.category,
    allocatedMinor: alloc.allocatedMinor,
    spentMinor: 0,
    isEstimate: true,
  }));

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

  const vendorItems: VendorItem[] = categories.map((cat, idx) => ({
    id: `vendor-${idx + 1}`,
    category: cat,
    name: `Required: ${cat}`,
    status: 'to_contact',
    isEstimate: true,
    notes: `Identify and reach out to local ${cat.toLowerCase()} providers.`,
  }));

  const now = new Date().toISOString();
  return {
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
    ...(data.themeOrCulture ? { themeOrCulture: data.themeOrCulture } : {}),
    ...(data.targetAgeGroup ? { targetAgeGroup: data.targetAgeGroup } : {}),
    ...(data.dietaryRequirements ? { dietaryRequirements: data.dietaryRequirements } : {}),
    ...(data.accessibilityNeeds ? { accessibilityNeeds: data.accessibilityNeeds } : {}),
    ...(data.freeTextVision ? { freeTextVision: data.freeTextVision } : {}),
    budgetItems,
    timelineItems,
    vendorItems,
    ideas: [],
    createdAt: now,
    updatedAt: now,
  };
}
