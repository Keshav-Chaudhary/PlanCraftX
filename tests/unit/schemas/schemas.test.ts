import { describe, it, expect } from 'vitest';
import {
  planGenerationRequestSchema,
  aiBudgetProposalSchema,
  aiMilestoneProposalSchema,
  ideasRequestSchema,
  chatRequestSchema,
  placesRequestSchema,
  weatherRequestSchema,
  holidaysRequestSchema,
  currencyRatesRequestSchema,
} from '../../../lib/schemas/api-schemas';
import { eventPlanSchema } from '../../../lib/schemas/event-plan';

describe('Zod Schema Validation & Invariant Testing', () => {
  describe('PlanGenerationRequest Schema', () => {
    it('validates a correct request for wedding', () => {
      const valid = {
        eventType: 'wedding',
        eventDate: '2026-09-18',
        location: 'San Francisco, CA',
        guestCount: 150,
        totalBudgetMajor: 35000,
        currency: 'USD',
        isOutdoor: false,
      };
      const res = planGenerationRequestSchema.safeParse(valid);
      expect(res.success).toBe(true);
    });

    it('rejects invalid currency code or negative budget', () => {
      expect(
        planGenerationRequestSchema.safeParse({
          eventType: 'wedding',
          eventDate: '2026-09-18',
          location: 'SF',
          guestCount: 150,
          totalBudgetMajor: -500,
          currency: 'USD',
        }).success,
      ).toBe(false);

      expect(
        planGenerationRequestSchema.safeParse({
          eventType: 'wedding',
          eventDate: '2026-09-18',
          location: 'SF',
          guestCount: 150,
          totalBudgetMajor: 500,
          currency: 'INVALID',
        }).success,
      ).toBe(false);
    });
  });

  describe('AI Budget and Milestone Proposal Schemas', () => {
    it('validates AI budget proposals with positive weights', () => {
      const proposal = {
        proportions: [
          { category: 'Venue', weight: 40, rationale: 'Core reception site' },
          { category: 'Catering', weight: 35 },
          { category: 'Photo', weight: 25 },
        ],
        rationaleSummary: 'Balanced wedding budget',
      };
      expect(aiBudgetProposalSchema.safeParse(proposal).success).toBe(true);
    });

    it('validates AI milestone proposals with negative and positive lead days', () => {
      const milestones = {
        milestones: [
          { phase: 'Early Planning', title: 'Permit filing', daysBeforeEvent: 90 },
          { phase: 'Breakdown', title: 'Site cleanup', daysBeforeEvent: -2 },
        ],
      };
      expect(aiMilestoneProposalSchema.safeParse(milestones).success).toBe(true);
    });
  });

  describe('Ideas & Chat Schemas', () => {
    it('validates ideas request', () => {
      const req = {
        eventType: 'birthday',
        guestCount: 25,
        location: 'Miami, FL',
        isOutdoor: true,
        dietaryRequirements: 'Nut allergy',
      };
      expect(ideasRequestSchema.safeParse(req).success).toBe(true);
    });

    it('validates chat request with context', () => {
      const req = {
        messages: [{ role: 'user', content: 'What cake flavors do you recommend?' }],
        eventContext: {
          eventType: 'birthday',
          eventDate: '2026-05-12',
          location: 'Miami, FL',
          guestCount: 25,
          currency: 'USD',
          totalBudgetMinor: 200000,
          isOutdoor: false,
        },
      };
      expect(chatRequestSchema.safeParse(req).success).toBe(true);
    });
  });

  describe('Places, Weather, Holidays & Currencies Schemas', () => {
    it('validates places request', () => {
      expect(
        placesRequestSchema.safeParse({ query: 'bakery', location: 'Austin, TX' }).success,
      ).toBe(true);
      expect(placesRequestSchema.safeParse({ query: 'a', location: 'Austin' }).success).toBe(false);
    });

    it('validates weather request coordinates', () => {
      expect(
        weatherRequestSchema.safeParse({
          latitude: 40.7128,
          longitude: -74.006,
          startDate: '2026-06-01',
          endDate: '2026-06-01',
        }).success,
      ).toBe(true);
    });

    it('validates holidays request country code', () => {
      expect(holidaysRequestSchema.safeParse({ countryCode: 'US', year: 2026 }).success).toBe(true);
      expect(holidaysRequestSchema.safeParse({ countryCode: 'USA', year: 2026 }).success).toBe(
        false,
      );
    });

    it('validates currency rates request', () => {
      expect(currencyRatesRequestSchema.safeParse({ from: 'USD', to: 'EUR' }).success).toBe(true);
      expect(currencyRatesRequestSchema.safeParse({ from: 'US', to: 'EURO' }).success).toBe(false);
    });
  });

  describe('EventPlan Full Domain Schema', () => {
    it('validates a complete event plan with all required fields', () => {
      const fullPlan = {
        id: 'plan-1',
        schemaVersion: 1,
        title: 'Community Festival 2026',
        eventType: 'community',
        eventDate: '2026-08-15',
        location: 'Seattle, WA',
        guestCount: 500,
        totalBudgetMinor: 1000000,
        currency: 'USD',
        isOutdoor: true,
        budgetItems: [
          {
            id: 'b1',
            category: 'Permits',
            allocatedMinor: 200000,
            spentMinor: 50000,
            isEstimate: false,
          },
        ],
        timelineItems: [
          {
            id: 't1',
            phase: 'Permits',
            title: 'Submit city application',
            dueDate: '2026-05-15',
            status: 'pending',
            isEstimate: false,
          },
        ],
        vendorItems: [
          { id: 'v1', category: 'Permits', name: 'City Hall', status: 'booked', isEstimate: false },
        ],
        ideas: [
          { id: 'i1', title: 'Eco Zone', category: 'activity', description: 'Composting workshop' },
        ],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };

      expect(eventPlanSchema.safeParse(fullPlan).success).toBe(true);
    });
  });
});
