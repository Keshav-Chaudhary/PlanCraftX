import { describe, it, expect } from 'vitest';
import {
  parseCalendarDate,
  formatCalendarDate,
  addCalendarDays,
  differenceInCalendarDays,
  calculateTimelinePhases,
  checkHolidayClash,
} from '../../../lib/domain/timeline-engine';

describe('Timeline Engine & Calendar Invariants', () => {
  describe('Calendar Date Parsing & Formatting', () => {
    it('accurately parses YYYY-MM-DD components', () => {
      expect(parseCalendarDate('2025-06-15')).toEqual({ year: 2025, month: 6, day: 15 });
      expect(parseCalendarDate('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 });
    });

    it('rejects malformed date strings', () => {
      expect(() => parseCalendarDate('invalid-date')).toThrow();
      expect(() => parseCalendarDate('2025/06/15')).toThrow();
    });

    it('formats date parts with zero padding', () => {
      expect(formatCalendarDate({ year: 2025, month: 4, day: 8 })).toBe('2025-04-08');
    });
  });

  describe('Leap Year and Month Boundary Calculations', () => {
    it('correctly steps across leap day in leap year (2024)', () => {
      expect(addCalendarDays('2024-02-28', 1)).toBe('2024-02-29');
      expect(addCalendarDays('2024-02-29', 1)).toBe('2024-03-01');
    });

    it('correctly steps across February in non-leap year (2025)', () => {
      expect(addCalendarDays('2025-02-28', 1)).toBe('2025-03-01');
      expect(addCalendarDays('2025-03-01', -1)).toBe('2025-02-28');
    });

    it('handles month and year rollover correctly', () => {
      expect(addCalendarDays('2025-01-31', 1)).toBe('2025-02-01');
      expect(addCalendarDays('2024-12-31', 1)).toBe('2025-01-01');
      expect(addCalendarDays('2025-01-01', -1)).toBe('2024-12-31');
    });

    it('accurately calculates calendar day differences across month boundaries', () => {
      expect(differenceInCalendarDays('2024-02-28', '2024-03-01')).toBe(2); // 2024 is leap year
      expect(differenceInCalendarDays('2025-02-28', '2025-03-01')).toBe(1); // 2025 is standard year
      expect(differenceInCalendarDays('2025-06-01', '2025-05-01')).toBe(-31);
    });
  });

  describe('Reverse-Planned Timeline Generation by Event Type', () => {
    it('generates wedding phases reverse-planned with 270d horizon', () => {
      const eventDate = '2026-10-01';
      const referenceDate = '2025-10-01'; // 1 year before, plenty of time
      const phases = calculateTimelinePhases('wedding', eventDate, referenceDate);

      expect(phases).toHaveLength(6);
      expect(phases[0]?.phase).toBe('Vision & Budget Alignment');
      expect(phases[0]?.daysBeforeEvent).toBe(270);
      expect(phases[5]?.phase).toBe('Event Day Execution');
      expect(phases[5]?.daysBeforeEvent).toBe(0);
      expect(phases[5]?.dueDate).toBe('2026-10-01');
    });

    it('generates birthday phases reverse-planned with 60d horizon', () => {
      const eventDate = '2026-06-15';
      const referenceDate = '2026-01-01';
      const phases = calculateTimelinePhases('birthday', eventDate, referenceDate);

      expect(phases).toHaveLength(5);
      expect(phases[0]?.phase).toBe('Theme & Venue Selection');
      expect(phases[0]?.daysBeforeEvent).toBe(60);
      expect(phases[4]?.phase).toBe('Event Day Execution');
      expect(phases[4]?.daysBeforeEvent).toBe(0);
    });

    it('generates community event phases with post-event breakdown (-2 days)', () => {
      const eventDate = '2026-08-20';
      const referenceDate = '2026-01-01';
      const phases = calculateTimelinePhases('community', eventDate, referenceDate);

      expect(phases).toHaveLength(6);
      expect(phases[0]?.phase).toBe('Planning Committee & Permits');
      expect(phases[0]?.daysBeforeEvent).toBe(120);
      // Post-event breakdown phase
      const lastPhase = phases[5];
      expect(lastPhase?.phase).toBe('Post-Event Breakdown & Reporting');
      expect(lastPhase?.daysBeforeEvent).toBe(-2);
      expect(lastPhase?.dueDate).toBe('2026-08-22');
    });

    it('dynamically compresses lead times when event is planned on short notice', () => {
      const eventDate = '2026-06-01';
      const referenceDate = '2026-05-01'; // Only 31 days remaining for a wedding!
      const phases = calculateTimelinePhases('wedding', eventDate, referenceDate);

      expect(phases[0]?.isCompressed).toBe(true);
      // Initial phase should be scaled down from 270d to fit within remaining timeframe
      expect(phases[0]?.daysBeforeEvent).toBeLessThanOrEqual(31);
      // Phases must remain strictly sequential
      for (let i = 1; i < phases.length; i++) {
        const prev = phases[i - 1]?.daysBeforeEvent ?? 0;
        const curr = phases[i]?.daysBeforeEvent ?? 0;
        expect(curr).toBeLessThan(prev);
      }
    });
  });

  describe('Public Holiday Clash Detection', () => {
    const mockHolidays = [
      { date: '2026-07-04', name: 'Independence Day' },
      { date: '2026-12-25', name: 'Christmas Day' },
    ];

    it('flags milestone clashing with public holiday', () => {
      const check = checkHolidayClash('2026-07-04', mockHolidays);
      expect(check.hasClash).toBe(true);
      expect(check.holidayName).toBe('Independence Day');
    });

    it('returns no clash when dates do not conflict', () => {
      const check = checkHolidayClash('2026-07-05', mockHolidays);
      expect(check.hasClash).toBe(false);
      expect(check.holidayName).toBeUndefined();
    });
  });
});
