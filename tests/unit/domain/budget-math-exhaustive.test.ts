import { describe, it, expect } from 'vitest';
import {
  getCurrencyExponent,
  majorToMinor,
  minorToMajor,
  formatMinorUnits,
  allocateBudgetLargestRemainder,
  rebalanceAllocations,
  convertCurrency,
} from '../../../lib/domain/budget-math';

describe('Exhaustive Budget Math & Precision Arithmetic', () => {
  describe('Zero-Decimal ISO Currencies', () => {
    it.each([
      'JPY',
      'KRW',
      'CLP',
      'VND',
      'ISK',
      'PYG',
      'UGX',
      'RWF',
      'BIF',
      'DJF',
      'GNF',
      'KMF',
      'XOF',
      'XAF',
      'XPF',
    ])('maps %s to exponent 0', (code) => {
      expect(getCurrencyExponent(code)).toBe(0);
      expect(majorToMinor(100, code)).toBe(100);
      expect(minorToMajor(100, code)).toBe(100);
    });
  });

  describe('Three-Decimal ISO Currencies', () => {
    it.each(['BHD', 'KWD', 'OMR', 'JOD', 'TND', 'IQD', 'LYD'])('maps %s to exponent 3', (code) => {
      expect(getCurrencyExponent(code)).toBe(3);
      expect(majorToMinor(1.234, code)).toBe(1234);
      expect(minorToMajor(1234, code)).toBe(1.234);
    });
  });

  describe('Standard Two-Decimal Currencies & Defaults', () => {
    it.each(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'CHF', 'SGD'])(
      'maps %s to exponent 2',
      (code) => {
        expect(getCurrencyExponent(code)).toBe(2);
        expect(majorToMinor(50.5, code)).toBe(5050);
        expect(minorToMajor(5050, code)).toBe(50.5);
      },
    );

    it('defaults unknown currencies to exponent 2', () => {
      expect(getCurrencyExponent('UNKNOWN_XYZ')).toBe(2);
      expect(getCurrencyExponent('')).toBe(2);
    });

    it('is case-insensitive for currency codes', () => {
      expect(getCurrencyExponent('jpy')).toBe(0);
      expect(getCurrencyExponent('kwd')).toBe(3);
      expect(getCurrencyExponent('inr')).toBe(2);
    });
  });

  describe('Decimal Formatting Edge Cases', () => {
    it('formats 0 minor units with correct decimal digits', () => {
      expect(formatMinorUnits(0, 'JPY')).toBe('0');
      expect(formatMinorUnits(0, 'USD')).toBe('0.00');
      expect(formatMinorUnits(0, 'BHD')).toBe('0.000');
    });

    it('formats single minor unit amounts cleanly', () => {
      expect(formatMinorUnits(1, 'JPY')).toBe('1');
      expect(formatMinorUnits(1, 'USD')).toBe('0.01');
      expect(formatMinorUnits(1, 'KWD')).toBe('0.001');
    });

    it('formats large numbers with commas where appropriate', () => {
      expect(formatMinorUnits(100000000, 'USD')).toContain('000.00');
      expect(formatMinorUnits(5000000, 'JPY')).toContain('000');
    });
  });

  describe('Largest-Remainder Allocation Boundary Cases', () => {
    it('returns empty array when categories are empty', () => {
      expect(allocateBudgetLargestRemainder(10000, [])).toEqual([]);
    });

    it('allocates 0 to all categories when totalMinor is 0', () => {
      const res = allocateBudgetLargestRemainder(0, [
        { category: 'Venue', weight: 50 },
        { category: 'Food', weight: 50 },
      ]);
      expect(res).toEqual([
        { category: 'Venue', allocatedMinor: 0 },
        { category: 'Food', allocatedMinor: 0 },
      ]);
    });

    it('allocates 0 to all categories when totalMinor is negative', () => {
      const res = allocateBudgetLargestRemainder(-5000, [{ category: 'Venue', weight: 10 }]);
      expect(res[0]?.allocatedMinor).toBe(0);
    });

    it('distributes equally if all category weights are zero', () => {
      const res = allocateBudgetLargestRemainder(100, [
        { category: 'A', weight: 0 },
        { category: 'B', weight: 0 },
      ]);
      expect(res.reduce((s, r) => s + r.allocatedMinor, 0)).toBe(100);
      expect(res[0]?.allocatedMinor).toBe(50);
      expect(res[1]?.allocatedMinor).toBe(50);
    });

    it('handles negative weights by treating them as 0', () => {
      const res = allocateBudgetLargestRemainder(100, [
        { category: 'A', weight: -10 },
        { category: 'B', weight: 100 },
      ]);
      expect(res[0]?.allocatedMinor).toBe(0);
      expect(res[1]?.allocatedMinor).toBe(100);
    });

    it('correctly handles 1 unit split across 3 equal categories with stable tie-break', () => {
      const res = allocateBudgetLargestRemainder(1, [
        { category: 'A', weight: 10 },
        { category: 'B', weight: 10 },
        { category: 'C', weight: 10 },
      ]);
      expect(res.reduce((s, r) => s + r.allocatedMinor, 0)).toBe(1);
      expect(res[0]?.allocatedMinor).toBe(1);
      expect(res[1]?.allocatedMinor).toBe(0);
      expect(res[2]?.allocatedMinor).toBe(0);
    });

    it('correctly handles 2 units split across 3 equal categories', () => {
      const res = allocateBudgetLargestRemainder(2, [
        { category: 'A', weight: 10 },
        { category: 'B', weight: 10 },
        { category: 'C', weight: 10 },
      ]);
      expect(res.reduce((s, r) => s + r.allocatedMinor, 0)).toBe(2);
      expect(res[0]?.allocatedMinor).toBe(1);
      expect(res[1]?.allocatedMinor).toBe(1);
      expect(res[2]?.allocatedMinor).toBe(0);
    });
  });

  describe('Rebalancing Logic With Locks', () => {
    it('returns identical items if all categories are locked', () => {
      const items = [
        { category: 'A', allocatedMinor: 4000, isLocked: true },
        { category: 'B', allocatedMinor: 6000, isLocked: true },
      ];
      const res = rebalanceAllocations(10000, items);
      expect(res).toEqual([
        { category: 'A', allocatedMinor: 4000 },
        { category: 'B', allocatedMinor: 6000 },
      ]);
    });

    it('preserves locked items and divides remaining among unlocked', () => {
      const items = [
        { category: 'Venue', allocatedMinor: 5000, isLocked: true },
        { category: 'Decor', allocatedMinor: 2500, isLocked: false },
        { category: 'Music', allocatedMinor: 2500, isLocked: false },
      ];
      const res = rebalanceAllocations(10000, items);
      expect(res[0]?.allocatedMinor).toBe(5000);
      expect(res[1]?.allocatedMinor + (res[2]?.allocatedMinor ?? 0)).toBe(5000);
    });

    it('gives 0 to unlocked items when locked total exceeds budget cap', () => {
      const items = [
        { category: 'A', allocatedMinor: 12000, isLocked: true },
        { category: 'B', allocatedMinor: 2000, isLocked: false },
      ];
      const res = rebalanceAllocations(10000, items);
      expect(res[0]?.allocatedMinor).toBe(12000);
      expect(res[1]?.allocatedMinor).toBe(0);
    });
  });

  describe('Currency Conversion Calculations', () => {
    it('returns 0 if rate is 0 or negative', () => {
      expect(convertCurrency(5000, 'USD', 'EUR', 0)).toBe(0);
      expect(convertCurrency(5000, 'USD', 'EUR', -1.25)).toBe(0);
    });

    it('returns 0 if amount is 0 or negative', () => {
      expect(convertCurrency(0, 'USD', 'EUR', 0.9)).toBe(0);
      expect(convertCurrency(-100, 'USD', 'EUR', 0.9)).toBe(0);
    });

    it('accurately converts across different decimal exponents (USD to JPY)', () => {
      // 100 USD (10000 minor) at rate 150 = 15,000 JPY (15000 minor)
      expect(convertCurrency(10000, 'USD', 'JPY', 150)).toBe(15000);
    });

    it('accurately converts across different decimal exponents (JPY to USD)', () => {
      // 15,000 JPY (15000 minor) at rate 0.00666667 = 100 USD (10000 minor)
      expect(convertCurrency(15000, 'JPY', 'USD', 1 / 150)).toBe(10000);
    });

    it('accurately converts between 2-decimal and 3-decimal currencies (USD to KWD)', () => {
      // 1000 USD (100000 minor) at rate 0.31 = 310 KWD (310000 minor)
      expect(convertCurrency(100000, 'USD', 'KWD', 0.31)).toBe(310000);
    });
  });
});
