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

describe('Budget Math & Integer Minor Units Domain Engine', () => {
  describe('Currency Exponents', () => {
    it('correctly maps 0-decimal currencies', () => {
      expect(getCurrencyExponent('JPY')).toBe(0);
      expect(getCurrencyExponent('KRW')).toBe(0);
      expect(getCurrencyExponent('CLP')).toBe(0);
      expect(getCurrencyExponent('VND')).toBe(0);
    });

    it('correctly maps 2-decimal currencies', () => {
      expect(getCurrencyExponent('USD')).toBe(2);
      expect(getCurrencyExponent('EUR')).toBe(2);
      expect(getCurrencyExponent('GBP')).toBe(2);
      expect(getCurrencyExponent('INR')).toBe(2);
    });

    it('correctly maps 3-decimal currencies', () => {
      expect(getCurrencyExponent('KWD')).toBe(3);
      expect(getCurrencyExponent('BHD')).toBe(3);
      expect(getCurrencyExponent('OMR')).toBe(3);
      expect(getCurrencyExponent('JOD')).toBe(3);
    });
  });

  describe('Conversions (Major <-> Minor Units)', () => {
    it('converts major to minor accurately across exponents', () => {
      expect(majorToMinor(5000, 'JPY')).toBe(5000);
      expect(majorToMinor(123.45, 'USD')).toBe(12345);
      expect(majorToMinor(10.125, 'KWD')).toBe(10125);
    });

    it('converts minor to major accurately', () => {
      expect(minorToMajor(5000, 'JPY')).toBe(5000);
      expect(minorToMajor(12345, 'USD')).toBe(123.45);
      expect(minorToMajor(10125, 'KWD')).toBe(10.125);
    });

    it('formats minor units accurately with proper decimal points', () => {
      expect(formatMinorUnits(5000, 'JPY')).toBe('5,000');
      expect(formatMinorUnits(12345, 'USD')).toBe('123.45');
      expect(formatMinorUnits(10125, 'KWD')).toBe('10.125');
    });
  });

  describe('Largest-Remainder Method (Hamilton-Hare)', () => {
    it('guarantees exact sum of allocated minor units matches totalMinor', () => {
      const categories = [
        { category: 'Venue', weight: 45 },
        { category: 'Catering', weight: 30 },
        { category: 'Music', weight: 15 },
        { category: 'Flowers', weight: 10 },
      ];
      // Total 10,001 minor units (indivisible without remainders)
      const totalMinor = 10001;
      const allocations = allocateBudgetLargestRemainder(totalMinor, categories);

      const sumAllocated = allocations.reduce((acc, a) => acc + a.allocatedMinor, 0);
      expect(sumAllocated).toBe(totalMinor);
    });

    it('handles zero budget safely', () => {
      const categories = [
        { category: 'Venue', weight: 10 },
        { category: 'Food', weight: 10 },
      ];
      const allocations = allocateBudgetLargestRemainder(0, categories);
      expect(allocations).toEqual([
        { category: 'Venue', allocatedMinor: 0 },
        { category: 'Food', allocatedMinor: 0 },
      ]);
    });

    it('handles zero or negative weights gracefully via equal distribution', () => {
      const categories = [
        { category: 'A', weight: 0 },
        { category: 'B', weight: 0 },
      ];
      const allocations = allocateBudgetLargestRemainder(101, categories);
      const sum = allocations.reduce((acc, a) => acc + a.allocatedMinor, 0);
      expect(sum).toBe(101);
      expect(allocations[0]?.allocatedMinor).toBe(51);
      expect(allocations[1]?.allocatedMinor).toBe(50);
    });

    it('handles empty categories array', () => {
      expect(allocateBudgetLargestRemainder(1000, [])).toEqual([]);
    });
  });

  describe('Rebalancing Allocations with User Edits and Locks', () => {
    it('preserves locked items and redistributes remaining budget across unlocked items', () => {
      const totalMinor = 10000;
      const items = [
        { category: 'Venue', allocatedMinor: 4000, isLocked: true },
        { category: 'Catering', allocatedMinor: 3000, isLocked: false, weight: 30 },
        { category: 'Music', allocatedMinor: 3000, isLocked: false, weight: 30 },
      ];

      const rebalanced = rebalanceAllocations(totalMinor, items);
      expect(rebalanced[0]?.allocatedMinor).toBe(4000);
      expect(rebalanced[1]?.allocatedMinor).toBe(3000);
      expect(rebalanced[2]?.allocatedMinor).toBe(3000);

      const sum = rebalanced.reduce((acc, it) => acc + it.allocatedMinor, 0);
      expect(sum).toBe(totalMinor);
    });

    it('adjusts unlocked items when a locked item allocation is modified', () => {
      const totalMinor = 10000;
      // User locks Venue at 6000 (up from 4000)
      const items = [
        { category: 'Venue', allocatedMinor: 6000, isLocked: true },
        { category: 'Catering', allocatedMinor: 2000, isLocked: false, weight: 50 },
        { category: 'Music', allocatedMinor: 2000, isLocked: false, weight: 50 },
      ];

      const rebalanced = rebalanceAllocations(totalMinor, items);
      expect(rebalanced[0]?.allocatedMinor).toBe(6000);
      expect(rebalanced[1]?.allocatedMinor).toBe(2000);
      expect(rebalanced[2]?.allocatedMinor).toBe(2000);

      const sum = rebalanced.reduce((acc, it) => acc + it.allocatedMinor, 0);
      expect(sum).toBe(totalMinor);
    });
  });

  describe('Currency Conversion', () => {
    it('converts between different currency exponents and rounds accurately', () => {
      // 100 USD (10000 minor) to JPY (rate 155.5) -> 15550 JPY (15550 minor, 0 exp)
      const jpyMinor = convertCurrency(10000, 'USD', 'JPY', 155.5);
      expect(jpyMinor).toBe(15550);

      // 100 USD to KWD (rate 0.31) -> 31 KWD (31000 minor, 3 exp)
      const kwdMinor = convertCurrency(10000, 'USD', 'KWD', 0.31);
      expect(kwdMinor).toBe(31000);
    });

    it('returns zero for invalid rate or non-positive amount', () => {
      expect(convertCurrency(0, 'USD', 'EUR', 0.95)).toBe(0);
      expect(convertCurrency(1000, 'USD', 'EUR', 0)).toBe(0);
    });
  });
});
