import { describe, it, expect } from 'vitest';
import {
  parseCalendarDate,
  formatCalendarDate,
  addCalendarDays,
  differenceInCalendarDays,
  calculateTimelinePhases,
  checkHolidayClash,
} from '../../../lib/domain/timeline-engine';

describe('Advanced Timeline Compression & Calendar Math', () => {
  describe('Calendar Date Parsing & Validation', () => {
    it('parses regular standard dates correctly', () => {
      expect(parseCalendarDate('2026-06-15')).toEqual({ year: 2026, month: 6, day: 15 });
    });

    it('parses leap day 2024-02-29 correctly', () => {
      expect(parseCalendarDate('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 });
    });

    it('parses century leap day 2000-02-29 correctly', () => {
      expect(parseCalendarDate('2000-02-29')).toEqual({ year: 2000, month: 2, day: 29 });
    });

    it.each(['invalid-date', '2026/06/15', '2026-6-15', '2026-06-5', '', '20260615', '15-06-2026'])(
      'throws error on invalid date string "%s"',
      (badDate) => {
        expect(() => parseCalendarDate(badDate)).toThrow(/Invalid calendar date format/);
      },
    );
  });

  describe('Calendar Date Formatting', () => {
    it('pads single-digit month and day with zeros', () => {
      expect(formatCalendarDate({ year: 2026, month: 4, day: 7 })).toBe('2026-04-07');
    });

    it('handles two-digit month and day without altering', () => {
      expect(formatCalendarDate({ year: 2026, month: 11, day: 28 })).toBe('2026-11-28');
    });
  });

  describe('Add Calendar Days Math & Boundary Rollovers', () => {
    it('adds 0 days with no change', () => {
      expect(addCalendarDays('2026-06-15', 0)).toBe('2026-06-15');
    });

    it('handles month boundaries going forward', () => {
      expect(addCalendarDays('2026-01-31', 1)).toBe('2026-02-01');
    });

    it('handles month boundaries going backwards', () => {
      expect(addCalendarDays('2026-03-01', -1)).toBe('2026-02-28');
    });

    it('handles leap year leap day transition backwards', () => {
      expect(addCalendarDays('2024-03-01', -1)).toBe('2024-02-29');
    });

    it('handles leap day to next day forward', () => {
      expect(addCalendarDays('2024-02-29', 1)).toBe('2024-03-01');
    });

    it('handles year boundary forward (New Year rollover)', () => {
      expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01');
    });

    it('handles year boundary backward', () => {
      expect(addCalendarDays('2027-01-01', -1)).toBe('2026-12-31');
    });

    it('handles large multi-year shifts accurately (+730 days)', () => {
      expect(addCalendarDays('2024-01-01', 730)).toBe('2025-12-31');
    });
  });

  describe('Difference in Calendar Days', () => {
    it('returns 0 for the same date', () => {
      expect(differenceInCalendarDays('2026-05-10', '2026-05-10')).toBe(0);
    });

    it('returns positive days when toDate is in future', () => {
      expect(differenceInCalendarDays('2026-05-10', '2026-05-20')).toBe(10);
    });

    it('returns negative days when toDate is in past', () => {
      expect(differenceInCalendarDays('2026-05-20', '2026-05-10')).toBe(-10);
    });

    it('accounts for leap years in day differences (2024 vs 2025)', () => {
      expect(differenceInCalendarDays('2024-02-01', '2024-03-01')).toBe(29);
      expect(differenceInCalendarDays('2025-02-01', '2025-03-01')).toBe(28);
    });
  });

  describe('Dynamic Timeline Compression for Close Horizons', () => {
    it('does not compress wedding phases when runway is ample (300+ days)', () => {
      const phases = calculateTimelinePhases('wedding', '2027-05-01', '2026-05-01');
      expect(phases[0]?.isCompressed).toBe(false);
      expect(phases[0]?.daysBeforeEvent).toBe(270);
      expect(phases[0]?.dueDate).toBe('2026-08-04');
    });

    it('dynamically compresses wedding phases when runway is short (45 days)', () => {
      const phases = calculateTimelinePhases('wedding', '2026-06-15', '2026-05-01');
      expect(phases[0]?.isCompressed).toBe(true);
      expect(phases[0]?.daysBeforeEvent).toBeLessThanOrEqual(45);
      // Strictly decreasing daysBeforeEvent
      for (let i = 1; i < phases.length - 2; i++) {
        const prev = phases[i - 1]?.daysBeforeEvent ?? 0;
        const curr = phases[i]?.daysBeforeEvent ?? 0;
        expect(prev).toBeGreaterThan(curr);
      }
    });

    it('compresses birthday phases for a 14-day runway', () => {
      const phases = calculateTimelinePhases('birthday', '2026-05-20', '2026-05-06');
      expect(phases[0]?.isCompressed).toBe(true);
      expect(phases[0]?.daysBeforeEvent).toBeLessThanOrEqual(14);
      expect(phases.length).toBe(5);
    });

    it('compresses community festival phases for a 30-day runway', () => {
      const phases = calculateTimelinePhases('community', '2026-06-01', '2026-05-02');
      expect(phases[0]?.isCompressed).toBe(true);
      expect(phases.length).toBe(6);
    });

    it('keeps event day (0) and wrap-up (-2) anchored even when compressed', () => {
      const phases = calculateTimelinePhases('community', '2026-05-10', '2026-05-01');
      const eventDay = phases.find((p) => p.daysBeforeEvent === 0);
      const wrapUp = phases.find((p) => p.daysBeforeEvent === -2);
      expect(eventDay?.dueDate).toBe('2026-05-10');
      expect(wrapUp?.dueDate).toBe('2026-05-12');
    });
  });

  describe('Public Holiday Clash Detection', () => {
    const mockHolidays = [
      { date: '2026-01-26', name: 'Republic Day' },
      { date: '2026-08-15', name: 'Independence Day' },
      { date: '2026-10-02', name: 'Gandhi Jayanti' },
      { date: '2026-12-25', name: 'Christmas Day' },
    ];

    it('detects an exact match clash with public holiday', () => {
      const result = checkHolidayClash('2026-08-15', mockHolidays);
      expect(result.hasClash).toBe(true);
      expect(result.holidayName).toBe('Independence Day');
    });

    it('returns false for dates that do not clash with holidays', () => {
      const result = checkHolidayClash('2026-08-16', mockHolidays);
      expect(result.hasClash).toBe(false);
      expect(result.holidayName).toBeUndefined();
    });

    it('handles empty holiday list gracefully without crashing', () => {
      const result = checkHolidayClash('2026-08-15', []);
      expect(result.hasClash).toBe(false);
    });
  });
});
