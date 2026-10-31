import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { allocateBudgetLargestRemainder } from '../../lib/domain/budget-math';

describe('Property-Based Test: Budget Math Largest-Remainder Invariants', () => {
  it('strictly satisfies sum(allocatedMinor) === totalMinor for ALL inputs', () => {
    fc.assert(
      fc.property(
        // Total minor units from 0 up to 100,000,000
        fc.integer({ min: 0, max: 100_000_000 }),
        // Category array with 1 to 15 categories, positive weights
        fc.array(
          fc.record({
            category: fc.string({ minLength: 1, maxLength: 20 }),
            weight: fc.float({ min: Math.fround(0.01), max: Math.fround(100.0), noNaN: true }),
          }),
          { minLength: 1, maxLength: 15 },
        ),
        (totalMinor, categories) => {
          const allocations = allocateBudgetLargestRemainder(totalMinor, categories);

          // Invariant 1: Result has same length as input categories
          expect(allocations).toHaveLength(categories.length);

          // Invariant 2: Every allocation is a non-negative integer
          for (const item of allocations) {
            expect(Number.isInteger(item.allocatedMinor)).toBe(true);
            expect(item.allocatedMinor).toBeGreaterThanOrEqual(0);
          }

          // Invariant 3: Exact sum of allocations MUST equal totalMinor
          const sum = allocations.reduce((acc, it) => acc + it.allocatedMinor, 0);
          expect(sum).toBe(totalMinor);
        },
      ),
      { numRuns: 100 },
    );
  });
});
