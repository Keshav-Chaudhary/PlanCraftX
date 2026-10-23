import { describe, it, expect } from 'vitest';
import {
  EVENT_TYPES,
  EVENT_CATEGORIES,
  TIMELINE_PHASES,
  PHASE_IDEAL_LEAD_DAYS,
  VENDOR_STATUSES,
  TIMELINE_STATUSES,
} from '@/lib/domain/event-rules';

describe('Event Domain Rules & Taxonomies', () => {
  it('defines valid event types and statuses', () => {
    expect(EVENT_TYPES).toEqual(['wedding', 'birthday', 'community']);
    const sampleVendorStatus: VendorStatus = 'booked';
    const sampleTimelineStatus: TimelineStatus = 'completed';
    expect(VENDOR_STATUSES).toContain(sampleVendorStatus);
    expect(TIMELINE_STATUSES).toContain(sampleTimelineStatus);
  });

  it('guarantees unique categories and distinct behavior per event type', () => {
    for (const eventType of EVENT_TYPES) {
      const categories = EVENT_CATEGORIES[eventType];
      expect(categories.length).toBeGreaterThanOrEqual(5);

      // Verify no duplicates
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
    }

    // Weddings include officiant/legal formalities
    expect(EVENT_CATEGORIES.wedding).toContain('Officiant & Legal Formalities');
    // Birthdays include cake/dessert
    expect(EVENT_CATEGORIES.birthday).toContain('Cake & Dessert');
    // Community events include municipal permits & safety
    expect(EVENT_CATEGORIES.community).toContain('Permits & Municipal Licensing');
  });

  it('provides sequenced timeline phases and lead-time schedules', () => {
    for (const eventType of EVENT_TYPES) {
      const phases = TIMELINE_PHASES[eventType];
      const leadDays = PHASE_IDEAL_LEAD_DAYS[eventType];

      expect(phases.length).toBeGreaterThan(0);
      expect(leadDays.length).toBe(phases.length);

      // Lead days must be non-increasing (moving towards event day 0)
      for (let i = 1; i < leadDays.length; i++) {
        const prev = leadDays[i - 1] ?? 0;
        const curr = leadDays[i] ?? 0;
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    }
  });
});
