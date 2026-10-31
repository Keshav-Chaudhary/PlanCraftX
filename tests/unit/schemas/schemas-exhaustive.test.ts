import { describe, it, expect } from 'vitest';
import {
  budgetItemSchema,
  timelineItemSchema,
  vendorItemSchema,
  personalizedIdeaSchema,
} from '../../../lib/schemas/event-plan';

describe('Exhaustive Zod Schema Boundaries & Invariant Validation', () => {
  describe('BudgetItemSchema Boundaries', () => {
    it('accepts valid budget item with default spentMinor and isEstimate', () => {
      const valid = budgetItemSchema.parse({
        id: 'b-1',
        category: 'Venue Rental',
        allocatedMinor: 500000,
      });
      expect(valid.spentMinor).toBe(0);
      expect(valid.isEstimate).toBe(true);
    });

    it('rejects negative allocatedMinor', () => {
      expect(() =>
        budgetItemSchema.parse({
          id: 'b-2',
          category: 'Catering',
          allocatedMinor: -50,
        }),
      ).toThrow();
    });

    it('rejects fractional non-integer minor units', () => {
      expect(() =>
        budgetItemSchema.parse({
          id: 'b-3',
          category: 'Decor',
          allocatedMinor: 100.5,
        }),
      ).toThrow();
    });

    it('rejects empty category string', () => {
      expect(() =>
        budgetItemSchema.parse({
          id: 'b-4',
          category: '',
          allocatedMinor: 1000,
        }),
      ).toThrow();
    });

    it('rejects empty id string', () => {
      expect(() =>
        budgetItemSchema.parse({
          id: '',
          category: 'Photography',
          allocatedMinor: 1000,
        }),
      ).toThrow();
    });
  });

  describe('TimelineItemSchema Boundaries', () => {
    it('accepts valid timeline milestone with default pending status', () => {
      const item = timelineItemSchema.parse({
        id: 't-1',
        phase: 'Initial Planning',
        title: 'Lock Venue Deposit',
        dueDate: '2026-06-30',
      });
      expect(item.status).toBe('pending');
      expect(item.isEstimate).toBe(true);
    });

    it.each(['2026/06/30', '30-06-2026', '2026-6-30', 'invalid-date', ''])(
      'rejects invalid date format "%s"',
      (badDate) => {
        expect(() =>
          timelineItemSchema.parse({
            id: 't-2',
            phase: 'Phase 1',
            title: 'Milestone',
            dueDate: badDate,
          }),
        ).toThrow();
      },
    );

    it.each(['pending', 'in_progress', 'completed'] as const)(
      'accepts valid timeline status "%s"',
      (status) => {
        const item = timelineItemSchema.parse({
          id: 't-status',
          phase: 'Phase 1',
          title: 'Milestone',
          dueDate: '2026-08-01',
          status,
        });
        expect(item.status).toBe(status);
      },
    );

    it('rejects unsupported timeline status', () => {
      expect(() =>
        timelineItemSchema.parse({
          id: 't-bad-status',
          phase: 'Phase 1',
          title: 'Milestone',
          dueDate: '2026-08-01',
          // @ts-expect-error Testing invalid runtime enum
          status: 'cancelled',
        }),
      ).toThrow();
    });
  });

  describe('VendorItemSchema Boundaries', () => {
    it('accepts valid vendor with default to_contact status', () => {
      const v = vendorItemSchema.parse({
        id: 'v-1',
        category: 'Catering',
        name: 'Fine Delicacies Co',
      });
      expect(v.status).toBe('to_contact');
      expect(v.isEstimate).toBe(true);
    });

    it.each(['to_contact', 'quoted', 'booked', 'paid'] as const)(
      'accepts allowed vendor status "%s"',
      (status) => {
        const v = vendorItemSchema.parse({
          id: 'v-stat',
          category: 'Music',
          name: 'DJ Spark',
          status,
        });
        expect(v.status).toBe(status);
      },
    );

    it('rejects negative estimatedCostMinor', () => {
      expect(() =>
        vendorItemSchema.parse({
          id: 'v-neg',
          category: 'Decor',
          name: 'Decor Ltd',
          estimatedCostMinor: -100,
        }),
      ).toThrow();
    });

    it('supports optional OpenStreetMap ID tag', () => {
      const v = vendorItemSchema.parse({
        id: 'v-osm',
        category: 'Venue',
        name: 'Town Hall',
        osmId: 'node/12345678',
      });
      expect(v.osmId).toBe('node/12345678');
    });
  });

  describe('PersonalizedIdeaSchema Boundaries', () => {
    it.each(['theme', 'menu', 'activity', 'accessibility', 'logistics'] as const)(
      'accepts idea category "%s"',
      (category) => {
        const idea = personalizedIdeaSchema.parse({
          id: 'idea-1',
          title: 'Eco-Friendly Favors',
          category,
          description: 'Plantable seed paper invitations and favors.',
        });
        expect(idea.category).toBe(category);
      },
    );

    it('accepts optional dietary tags', () => {
      const idea = personalizedIdeaSchema.parse({
        id: 'idea-diet',
        title: 'Vegan Live Pasta Station',
        category: 'menu',
        description: 'Made-to-order vegan pasta bar.',
        dietaryTags: ['Vegan', 'Gluten-Free', 'Dairy-Free'],
      });
      expect(idea.dietaryTags).toHaveLength(3);
    });

    it('rejects empty title or description', () => {
      expect(() =>
        personalizedIdeaSchema.parse({
          id: 'idea-empty',
          title: '',
          category: 'theme',
          description: '',
        }),
      ).toThrow();
    });
  });
});
