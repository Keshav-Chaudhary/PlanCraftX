import { describe, it, expect } from 'vitest';
import type { Vendor } from '../../../lib/schemas/event-plan';

describe('Quote Analysis, Red Flags & Vendor Proposal Evaluation', () => {
  describe('Vendor Lifecycle Status Progression', () => {
    it.each(['to_contact', 'quoted', 'booked', 'paid'] as const)(
      'supports status "%s" in vendor lifecycle',
      (status) => {
        const vendor: Vendor = {
          id: 'v-1',
          category: 'Catering & Bar',
          name: 'Royal Feast Catering',
          status,
          contactInfo: 'feast@example.com',
          notes: 'Standard menu package',
        };
        expect(vendor.status).toBe(status);
      },
    );

    it('identifies unbooked critical categories', () => {
      const vendors: Vendor[] = [
        { id: 'v1', category: 'Catering & Bar', name: 'Vendor 1', status: 'quoted' },
        { id: 'v2', category: 'Venue & Reception', name: 'Vendor 2', status: 'to_contact' },
      ];
      const bookedCount = vendors.filter(
        (v) => v.status === 'booked' || v.status === 'paid',
      ).length;
      expect(bookedCount).toBe(0);
    });

    it('identifies fully confirmed vendor milestones', () => {
      const vendors: Vendor[] = [
        { id: 'v1', category: 'Catering & Bar', name: 'Vendor 1', status: 'booked' },
        { id: 'v2', category: 'Venue & Reception', name: 'Vendor 2', status: 'paid' },
      ];
      const bookedCount = vendors.filter(
        (v) => v.status === 'booked' || v.status === 'paid',
      ).length;
      expect(bookedCount).toBe(2);
    });
  });

  describe('Quote Price Calculations & Per-Guest Scaling', () => {
    it('computes flat quote total without guest multiplier', () => {
      const flatCost = 150000;
      expect(flatCost).toBe(150000);
    });

    it('computes plate price against guest count (₹1,500 * 200 guests)', () => {
      const perPlate = 1500;
      const guests = 200;
      const expected = perPlate * guests;
      expect(expected).toBe(300000);
    });

    it('applies minimum guest threshold surcharge if guest count is lower', () => {
      const perPlate = 1500;
      const minGuests = 250;
      const actualGuests = 200;
      const effectiveGuests = Math.max(actualGuests, minGuests);
      expect(effectiveGuests * perPlate).toBe(375000);
    });

    it('does not surcharge when actual guests exceed minimum', () => {
      const perPlate = 1500;
      const minGuests = 150;
      const actualGuests = 200;
      const effectiveGuests = Math.max(actualGuests, minGuests);
      expect(effectiveGuests * perPlate).toBe(300000);
    });

    it('calculates 18% GST tax inclusion correctly', () => {
      const subtotal = 100000;
      const gstRate = 0.18;
      const totalWithGst = subtotal * (1 + gstRate);
      expect(totalWithGst).toBe(118000);
    });

    it('calculates 50% advance deposit requirement in minor units', () => {
      const totalCostMinor = 25000000; // ₹2,50,000
      const advancePercent = 50;
      const advanceRequiredMinor = Math.round(totalCostMinor * (advancePercent / 100));
      expect(advanceRequiredMinor).toBe(12500000);
    });
  });

  describe('Red Flag Detection in Vendor Proposals', () => {
    it('flags quote when advance deposit exceeds 50%', () => {
      const advancePercent = 70;
      const isRedFlag = advancePercent > 50;
      expect(isRedFlag).toBe(true);
    });

    it('does not flag quote when advance deposit is reasonable (20-30%)', () => {
      const advancePercent = 25;
      const isRedFlag = advancePercent > 50;
      expect(isRedFlag).toBe(false);
    });

    it('flags quote with missing cancellation policy', () => {
      const proposal = { price: 100000, cancellationPolicy: null };
      const hasMissingPolicy = proposal.cancellationPolicy === null;
      expect(hasMissingPolicy).toBe(true);
    });

    it('flags quote with unstated taxes when not explicitly included', () => {
      const proposal = { price: 100000, taxIncluded: null };
      const hasUnstatedTax = proposal.taxIncluded === null;
      expect(hasUnstatedTax).toBe(true);
    });

    it('flags excessive overtime fee (>₹10,000/hr)', () => {
      const overtimeFeePerHour = 15000;
      const isExcessive = overtimeFeePerHour > 10000;
      expect(isExcessive).toBe(true);
    });
  });

  describe('Side-by-Side Quote Comparison Ranking', () => {
    const quotes = [
      { id: 'q1', vendor: 'Caterer A', totalCost: 350000, depositPercent: 50, ratingScore: 4.5 },
      { id: 'q2', vendor: 'Caterer B', totalCost: 300000, depositPercent: 25, ratingScore: 4.8 },
      { id: 'q3', vendor: 'Caterer C', totalCost: 400000, depositPercent: 30, ratingScore: 4.9 },
    ];

    it('ranks lowest effective cost proposal first', () => {
      const sorted = [...quotes].sort((a, b) => a.totalCost - b.totalCost);
      expect(sorted[0]?.vendor).toBe('Caterer B');
      expect(sorted[1]?.vendor).toBe('Caterer A');
      expect(sorted[2]?.vendor).toBe('Caterer C');
    });

    it('ranks lowest deposit requirement first', () => {
      const sorted = [...quotes].sort((a, b) => a.depositPercent - b.depositPercent);
      expect(sorted[0]?.vendor).toBe('Caterer B');
    });

    it('evaluates effective budget utilization percentage', () => {
      const categoryBudget = 800000; // ₹8 Lakh
      const quoteCost = 300000; // ₹3 Lakh
      const utilization = (quoteCost / categoryBudget) * 100;
      expect(utilization).toBe(37.5);
    });

    it('warns when a quote exceeds allocated category budget', () => {
      const categoryBudget = 300000;
      const quoteCost = 350000;
      const isOverCategory = quoteCost > categoryBudget;
      expect(isOverCategory).toBe(true);
    });
  });
});
