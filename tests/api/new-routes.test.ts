import { describe, it, expect, vi } from 'vitest';
import { POST as intakeRoute } from '../../app/api/plan/intake/route';
import { POST as quoteExtractRoute } from '../../app/api/plan/quote-extract/route';
import { POST as explainTradeoffsRoute } from '../../app/api/plan/explain-tradeoffs/route';
import { POST as planReviewRoute } from '../../app/api/plan/review/route';

vi.mock('@/lib/api-clients/gemini', () => ({
  generateGeminiStructured: vi.fn().mockImplementation((_prompt, schema) => {
    // Check which schema is being parsed and mock appropriate result
    const schemaShape = (schema as { _def?: { typeName?: string } })?._def?.typeName;
    if (schemaShape === 'ZodObject') {
      return Promise.resolve({
        success: true,
        value: {
          eventType: 'wedding',
          title: 'Carmel Beach Wedding',
          guestCount: 120,
          totalBudgetMajor: 35000,
          currency: 'USD',
          eventDate: '2026-09-15',
          location: 'Carmel, CA',
          isOutdoor: true,
          vendorName: 'Seaside Catering',
          totalPriceMinor: 1200000,
          pricePerPersonMinor: null,
          guestMinimum: 100,
          advancePercent: 50,
          taxIncluded: true,
          cancellationPolicy: 'Full refund 60 days before',
          flags: ['Taxes included', 'Guest minimum required'],
          inquiryDraft: 'Dear Seaside Catering, we would love to confirm...',
          effectiveCostVsBudget: 'Within catering budget allocation',
          summary: 'Your event plan is in excellent health.',
          actionSteps: [
            'Confirm Seaside Catering',
            'Reserve Beach Pavilion',
            'Send save-the-dates',
          ],
          explanations: [
            {
              optionId: 'reduce_guests',
              plainTextExplanation: 'Trim guest list slightly to save catering costs.',
              pros: 'Direct savings',
              cons: 'Smaller attendance',
            },
          ],
        },
      });
    }
    return Promise.resolve({
      success: false,
      error: { code: 'UPSTREAM_FAILURE', message: 'Mock error' },
    });
  }),
}));

describe('New AI-Powered API Route Handlers Integration Tests', () => {
  describe('/api/plan/intake', () => {
    it('returns 400 for invalid json', async () => {
      const req = new Request('http://localhost:3000/api/plan/intake', {
        method: 'POST',
        body: 'bad-json',
      });
      const res = await intakeRoute(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 when description is too short', async () => {
      const req = new Request('http://localhost:3000/api/plan/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'hi' }),
      });
      const res = await intakeRoute(req);
      expect(res.status).toBe(400);
    });

    it('returns 200 with structured event params on valid description', async () => {
      const req = new Request('http://localhost:3000/api/plan/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Wedding in Carmel for 120 guests with 35k budget' }),
      });
      const res = await intakeRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.eventType).toBe('wedding');
      expect(data.guestCount).toBe(120);
    });
  });

  describe('/api/plan/quote-extract', () => {
    it('returns 400 on invalid input', async () => {
      const req = new Request('http://localhost:3000/api/plan/quote-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteText: 'short' }),
      });
      const res = await quoteExtractRoute(req);
      expect(res.status).toBe(400);
    });

    it('returns 200 with extracted proposal analysis on valid input', async () => {
      const req = new Request('http://localhost:3000/api/plan/quote-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteText: 'Seaside Catering quote: $12,000 for 100 guests, 50% deposit, taxes included',
          category: 'Catering',
          categoryBudgetMinor: 1500000,
        }),
      });
      const res = await quoteExtractRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.vendorName).toBe('Seaside Catering');
      expect(data.advancePercent).toBe(50);
    });
  });

  describe('/api/plan/explain-tradeoffs', () => {
    it('returns 200 with plain-language explanations of tradeoffs', async () => {
      const req = new Request('http://localhost:3000/api/plan/explain-tradeoffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planTitle: 'Beach Wedding',
          currency: 'USD',
          totalBudgetMinor: 2000000,
          allocatedMinor: 2300000,
          overAmountMinor: 300000,
          options: [
            {
              id: 'reduce_guests',
              title: 'Reduce guests',
              impactMinor: 200000,
              description: 'Reduce from 100 to 85 guests',
            },
          ],
        }),
      });
      const res = await explainTradeoffsRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary).toBeDefined();
    });
  });

  describe('/api/plan/review', () => {
    it('returns 200 with executive review and action steps', async () => {
      const req = new Request('http://localhost:3000/api/plan/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          findings: [
            {
              priority: 'urgent',
              title: 'Over budget',
              details: 'By $500',
              recommendedAction: 'Rebalance',
            },
          ],
        }),
      });
      const res = await planReviewRoute(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.actionSteps.length).toBeGreaterThan(0);
    });
  });
});
