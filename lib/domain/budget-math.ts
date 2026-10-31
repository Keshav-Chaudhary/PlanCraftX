/**
 * Pure domain logic for integer-minor-unit budget arithmetic.
 * Implements the largest-remainder method (Hamilton-Hare) to guarantee
 * that allocated category sums always equal the total budget exactly.
 */

import type { EventPlan, BudgetItem } from '@/lib/schemas/event-plan';

const CURRENCY_EXPONENTS = new Map<string, number>([
  // Zero-decimal currencies
  ['JPY', 0],
  ['KRW', 0],
  ['CLP', 0],
  ['VND', 0],
  ['ISK', 0],
  ['PYG', 0],
  ['UGX', 0],
  ['RWF', 0],
  ['BIF', 0],
  ['DJF', 0],
  ['GNF', 0],
  ['KMF', 0],
  ['XOF', 0],
  ['XAF', 0],
  ['XPF', 0],
  // Three-decimal currencies
  ['BHD', 3],
  ['KWD', 3],
  ['OMR', 3],
  ['JOD', 3],
  ['TND', 3],
  ['IQD', 3],
  ['LYD', 3],
]);

/**
 * Returns the minor unit exponent for a given ISO 4217 currency code.
 * Defaults to 2 for standard currencies (USD, EUR, GBP, INR, etc.).
 */
export function getCurrencyExponent(currency: string): number {
  const upper = currency.toUpperCase();
  const exp = CURRENCY_EXPONENTS.get(upper);
  return exp !== undefined ? exp : 2;
}

/**
 * Converts a major decimal amount to an exact integer number of minor units.
 */
export function majorToMinor(major: number, currency: string): number {
  const exp = getCurrencyExponent(currency);
  const factor = Math.pow(10, exp);
  return Math.round(major * factor);
}

/**
 * Converts an integer minor unit amount to major decimal representation.
 */
export function minorToMajor(minor: number, currency: string): number {
  const exp = getCurrencyExponent(currency);
  const factor = Math.pow(10, exp);
  return minor / factor;
}

/**
 * Formats integer minor units into an exact string with correct decimal places.
 */
export function formatMinorUnits(minor: number, currency: string): string {
  const exp = getCurrencyExponent(currency);
  const major = minorToMajor(minor, currency);
  return major.toLocaleString(undefined, {
    minimumFractionDigits: exp,
    maximumFractionDigits: exp,
  });
}

export interface CategoryWeight {
  readonly category: string;
  readonly weight: number;
}

export interface CategoryAllocation {
  readonly category: string;
  readonly allocatedMinor: number;
}

/**
 * Allocates total minor units across categories using the Largest-Remainder Method.
 * Guarantees that sum(allocatedMinor) === totalMinor down to the exact integer unit.
 */
export function allocateBudgetLargestRemainder(
  totalMinor: number,
  categories: readonly CategoryWeight[],
): CategoryAllocation[] {
  if (categories.length === 0) {
    return [];
  }
  if (totalMinor <= 0) {
    return categories.map((c) => ({ category: c.category, allocatedMinor: 0 }));
  }

  const totalWeight = categories.reduce((sum, c) => sum + Math.max(0, c.weight), 0);
  if (totalWeight <= 0) {
    // Equal distribution if all weights are zero
    const equalWeight = 1 / categories.length;
    return allocateBudgetLargestRemainder(
      totalMinor,
      categories.map((c) => ({ category: c.category, weight: equalWeight })),
    );
  }

  // Calculate quotas, floors, and remainders
  const quotas = categories.map((c, index) => {
    const w = Math.max(0, c.weight);
    const quota = (w / totalWeight) * totalMinor;
    const floor = Math.floor(quota);
    const remainder = quota - floor;
    return { index, category: c.category, floor, remainder };
  });

  const sumFloors = quotas.reduce((acc, q) => acc + q.floor, 0);
  const remainderUnits = totalMinor - sumFloors;

  // Sort by remainder descending, with index as stable tie-breaker
  const sorted = [...quotas].sort((a, b) => {
    if (b.remainder !== a.remainder) {
      return b.remainder - a.remainder;
    }
    return a.index - b.index;
  });

  const bonuses = new Set<number>();
  for (const item of sorted.slice(0, remainderUnits)) {
    bonuses.add(item.index);
  }

  return quotas.map((q) => ({
    category: q.category,
    allocatedMinor: q.floor + (bonuses.has(q.index) ? 1 : 0),
  }));
}

export interface RebalanceItem {
  readonly category: string;
  readonly allocatedMinor: number;
  readonly isLocked?: boolean | undefined;
  readonly weight?: number | undefined;
}

/**
 * Rebalances unlocked category allocations when an item is manually updated by the user.
 * Locked items remain unchanged; remaining minor units are distributed via largest-remainder.
 */
export function rebalanceAllocations(
  totalMinor: number,
  items: readonly RebalanceItem[],
): CategoryAllocation[] {
  const lockedTotal = items
    .filter((it) => it.isLocked)
    .reduce((sum, it) => sum + Math.max(0, it.allocatedMinor), 0);

  const remainingBudget = Math.max(0, totalMinor - lockedTotal);
  const unlocked = items.filter((it) => !it.isLocked);

  if (unlocked.length === 0) {
    return items.map((it) => ({ category: it.category, allocatedMinor: it.allocatedMinor }));
  }

  const weights: CategoryWeight[] = unlocked.map((it) => ({
    category: it.category,
    weight: it.weight !== undefined && it.weight > 0 ? it.weight : Math.max(1, it.allocatedMinor),
  }));

  const reallocated = allocateBudgetLargestRemainder(remainingBudget, weights);
  const reallocatedMap = new Map(reallocated.map((r) => [r.category, r.allocatedMinor]));

  return items.map((it) => {
    if (it.isLocked) {
      return { category: it.category, allocatedMinor: it.allocatedMinor };
    }
    const alloc = reallocatedMap.get(it.category);
    return { category: it.category, allocatedMinor: alloc !== undefined ? alloc : 0 };
  });
}

/**
 * Converts minor units between currencies using an exchange rate.
 * Rounds to nearest integer minor unit in target currency exponent.
 */
export function convertCurrency(
  amountMinor: number,
  fromCurrency: string,
  toCurrency: string,
  rate: number,
): number {
  if (rate <= 0 || amountMinor <= 0) {
    return 0;
  }
  const fromMajor = minorToMajor(amountMinor, fromCurrency);
  const toMajor = fromMajor * rate;
  return majorToMinor(toMajor, toCurrency);
}

/**
 * Immutably updates a single budget item allocation in a plan and rebalances remaining categories.
 */
export function updateBudgetItemAllocation(
  plan: EventPlan,
  itemId: string,
  newAllocatedMajor: number,
): EventPlan {
  if (isNaN(newAllocatedMajor) || newAllocatedMajor < 0) {
    return plan;
  }

  const newMinor = majorToMinor(newAllocatedMajor, plan.currency);
  const updatedItems = plan.budgetItems.map((it) => ({
    category: it.category,
    allocatedMinor: it.id === itemId ? newMinor : it.allocatedMinor,
    isLocked: it.id === itemId,
  }));

  const rebalanced = rebalanceAllocations(plan.totalBudgetMinor, updatedItems);
  const rebalancedMap = new Map(rebalanced.map((r) => [r.category, r.allocatedMinor]));

  const newBudgetItems: BudgetItem[] = plan.budgetItems.map((it) => {
    const updatedAlloc = rebalancedMap.get(it.category);
    return {
      ...it,
      allocatedMinor: updatedAlloc !== undefined ? updatedAlloc : it.allocatedMinor,
    };
  });

  return {
    ...plan,
    budgetItems: newBudgetItems,
    updatedAt: new Date().toISOString(),
  };
}
