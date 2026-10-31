import type { EventPlan, BudgetItem } from '../schemas/event-plan';

export interface TradeoffOption {
  readonly id: 'reduce_guests' | 'trim_flexible' | 'use_contingency';
  readonly title: string;
  readonly impactMinor: number;
  readonly description: string;
}

function buildGuestReductionOption(plan: EventPlan, overAmount: number): TradeoffOption | null {
  const cateringItem = plan.budgetItems.find(
    (b) =>
      b.category.toLowerCase().includes('catering') || b.category.toLowerCase().includes('food'),
  );

  if (!cateringItem || cateringItem.allocatedMinor <= 0 || plan.guestCount <= 10) {
    return null;
  }

  const costPerGuest = Math.floor(cateringItem.allocatedMinor / plan.guestCount);
  if (costPerGuest <= 0) return null;

  const maxReduction = Math.floor(plan.guestCount * 0.4);
  const neededReduction = Math.ceil(overAmount / costPerGuest);
  const suggestedReduction = Math.min(neededReduction, maxReduction);

  if (suggestedReduction <= 0) return null;

  const potentialSavings = suggestedReduction * costPerGuest;
  return {
    id: 'reduce_guests',
    title: `Reduce Guest Count by ${suggestedReduction}`,
    impactMinor: potentialSavings,
    description: `Adjust guest list from ${plan.guestCount} to ${
      plan.guestCount - suggestedReduction
    } guests to save ${potentialSavings / 100} ${plan.currency}.`,
  };
}

function buildFlexibleTrimOption(plan: EventPlan, overAmount: number): TradeoffOption | null {
  const flexible = plan.budgetItems.filter(
    (b) =>
      !b.category.toLowerCase().includes('venue') &&
      !b.category.toLowerCase().includes('catering') &&
      !b.category.toLowerCase().includes('contingency') &&
      b.allocatedMinor > 0,
  );

  const totalFlexibleMinor = flexible.reduce((sum, b) => sum + b.allocatedMinor, 0);
  if (totalFlexibleMinor <= 0) return null;

  const trimSavings = Math.min(overAmount, Math.floor(totalFlexibleMinor * 0.35));
  if (trimSavings <= 0) return null;

  return {
    id: 'trim_flexible',
    title: 'Proportionally Trim Non-Essential Categories',
    impactMinor: trimSavings,
    description: `Proportionally scale down flexible expenses (decor, favors, entertainment) to recover ${
      trimSavings / 100
    } ${plan.currency}.`,
  };
}

function buildContingencyOption(plan: EventPlan, overAmount: number): TradeoffOption | null {
  const contingency = plan.budgetItems.find((b) =>
    b.category.toLowerCase().includes('contingency'),
  );

  if (!contingency || contingency.allocatedMinor <= 0) return null;

  const usableContingency = Math.min(overAmount, contingency.allocatedMinor);
  return {
    id: 'use_contingency',
    title: 'Absorb with Contingency Reserve',
    impactMinor: usableContingency,
    description: `Draw ${usableContingency / 100} ${plan.currency} from your emergency buffer (${(
      contingency.allocatedMinor / 100
    ).toFixed(2)} ${plan.currency} available).`,
  };
}

/**
 * Deterministically generates trade-off options when spending exceeds total budget.
 */
export function generateOverBudgetTradeoffs(plan: EventPlan): TradeoffOption[] {
  const totalBudget = plan.totalBudgetMinor;
  const currentAllocated = plan.budgetItems.reduce((acc, b) => acc + b.allocatedMinor, 0);

  if (currentAllocated <= totalBudget) {
    return [];
  }

  const overAmount = currentAllocated - totalBudget;
  const candidates = [
    buildGuestReductionOption(plan, overAmount),
    buildFlexibleTrimOption(plan, overAmount),
    buildContingencyOption(plan, overAmount),
  ];

  return candidates.filter((c): c is TradeoffOption => c !== null);
}

function applyContingency(plan: EventPlan, overAmount: number): EventPlan {
  const updatedItems = plan.budgetItems.map((item) => {
    if (item.category.toLowerCase().includes('contingency')) {
      const reduction = Math.min(overAmount, item.allocatedMinor);
      return { ...item, allocatedMinor: item.allocatedMinor - reduction };
    }
    return item;
  });

  return { ...plan, budgetItems: updatedItems, updatedAt: new Date().toISOString() };
}

function applyTrimFlexible(plan: EventPlan, overAmount: number): EventPlan {
  const flexible = plan.budgetItems.filter(
    (b) =>
      !b.category.toLowerCase().includes('venue') &&
      !b.category.toLowerCase().includes('catering') &&
      !b.category.toLowerCase().includes('contingency') &&
      b.allocatedMinor > 0,
  );
  const totalFlexible = flexible.reduce((sum, b) => sum + b.allocatedMinor, 0);
  if (totalFlexible === 0) return plan;

  const trimAmount = Math.min(overAmount, Math.floor(totalFlexible * 0.35));
  let remainingToTrim = trimAmount;

  const updatedItems = plan.budgetItems.map((item) => {
    const isFlexible =
      !item.category.toLowerCase().includes('venue') &&
      !item.category.toLowerCase().includes('catering') &&
      !item.category.toLowerCase().includes('contingency');

    if (!isFlexible || item.allocatedMinor === 0 || remainingToTrim <= 0) {
      return item;
    }

    const proportion = item.allocatedMinor / totalFlexible;
    const reduction = Math.min(item.allocatedMinor, Math.floor(trimAmount * proportion));
    remainingToTrim -= reduction;
    return { ...item, allocatedMinor: item.allocatedMinor - reduction };
  });

  return { ...plan, budgetItems: updatedItems, updatedAt: new Date().toISOString() };
}

function applyReduceGuests(plan: EventPlan, overAmount: number): EventPlan {
  const catering = plan.budgetItems.find(
    (b) =>
      b.category.toLowerCase().includes('catering') || b.category.toLowerCase().includes('food'),
  );
  if (!catering || catering.allocatedMinor === 0) return plan;

  const costPerGuest = Math.floor(catering.allocatedMinor / plan.guestCount);
  if (costPerGuest <= 0) return plan;

  const guestReduction = Math.min(
    Math.ceil(overAmount / costPerGuest),
    Math.floor(plan.guestCount * 0.4),
  );
  const savings = guestReduction * costPerGuest;

  const updatedItems: BudgetItem[] = plan.budgetItems.map((item) => {
    if (
      item.category.toLowerCase().includes('catering') ||
      item.category.toLowerCase().includes('food')
    ) {
      return { ...item, allocatedMinor: Math.max(0, item.allocatedMinor - savings) };
    }
    return item;
  });

  return {
    ...plan,
    guestCount: plan.guestCount - guestReduction,
    budgetItems: updatedItems,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Applies a selected trade-off option to the event plan deterministically.
 */
export function applyTradeoffOption(plan: EventPlan, optionId: string): EventPlan {
  const currentAllocated = plan.budgetItems.reduce((acc, b) => acc + b.allocatedMinor, 0);
  const overAmount = currentAllocated - plan.totalBudgetMinor;

  if (overAmount <= 0) return plan;

  switch (optionId) {
    case 'use_contingency':
      return applyContingency(plan, overAmount);
    case 'trim_flexible':
      return applyTrimFlexible(plan, overAmount);
    case 'reduce_guests':
      return applyReduceGuests(plan, overAmount);
    default:
      return plan;
  }
}
