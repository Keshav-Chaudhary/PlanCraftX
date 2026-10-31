import { describe, it, expect } from 'vitest';
import { escapeIcsText, foldIcsLine, generateIcsCalendar } from '../../../lib/domain/ics-generator';

describe('RFC 5545 iCalendar Generator Invariants', () => {
  describe('Special Character Escaping', () => {
    it('escapes backslashes, semicolons, commas, and newlines per RFC 5545', () => {
      const raw = 'Meeting; with Bob, Alice & Charlie\\Dave\nSecond Line\r\nThird Line';
      const escaped = escapeIcsText(raw);
      expect(escaped).toBe(
        'Meeting\\; with Bob\\, Alice & Charlie\\\\Dave\\nSecond Line\\nThird Line',
      );
    });
  });

  describe('UTF-8 Octet Line Folding (<= 75 octets)', () => {
    it('does not fold lines with 75 octets or fewer', () => {
      const shortLine = 'SUMMARY:Quick meeting';
      expect(foldIcsLine(shortLine)).toBe(shortLine);
    });

    it('folds long ASCII lines so that no line exceeds 75 octets', () => {
      const longLine =
        'DESCRIPTION:This is an extremely detailed and comprehensive description of an upcoming milestone event that must be folded properly.';
      const folded = foldIcsLine(longLine);

      const lines = folded.split('\r\n');
      expect(lines.length).toBeGreaterThan(1);

      const encoder = new TextEncoder();
      lines.forEach((line, idx) => {
        const bytes = encoder.encode(line).length;
        expect(bytes).toBeLessThanOrEqual(75);
        if (idx > 0) {
          expect(line.startsWith(' ')).toBe(true);
        }
      });
    });

    it('accurately counts multi-byte UTF-8 octets when folding (emojis and non-ASCII)', () => {
      // 4-byte emoji 💍 repeated
      const emojiLine = 'SUMMARY:' + '💍'.repeat(30);
      const folded = foldIcsLine(emojiLine);

      const lines = folded.split('\r\n');
      expect(lines.length).toBeGreaterThan(1);

      const encoder = new TextEncoder();
      lines.forEach((line, idx) => {
        const bytes = encoder.encode(line).length;
        expect(bytes).toBeLessThanOrEqual(75);
        if (idx > 0) {
          expect(line.startsWith(' ')).toBe(true);
        }
      });
    });
  });

  describe('RFC 5545 Calendar Generation Structure', () => {
    it('generates compliant VCALENDAR and VEVENT blocks with CRLF line breaks', () => {
      const events = [
        {
          id: 'milestone-1',
          summary: 'Venue & Caterer Deposit',
          description: 'Pay deposit to secure venue; bring contract copy.',
          startDate: '2026-06-01',
          location: 'Grand Ballroom, NY',
        },
      ];

      const ics = generateIcsCalendar('My Wedding Plan', events, '2026-01-01T12:00:00Z');

      // Every line ending must be CRLF
      expect(ics).toMatch(/\r\n/);
      expect(ics.includes('BEGIN:VCALENDAR\r\n')).toBe(true);
      expect(ics.includes('END:VCALENDAR\r\n')).toBe(true);
      expect(ics.includes('BEGIN:VEVENT\r\n')).toBe(true);
      expect(ics.includes('UID:milestone-1@PlanCraftX.app\r\n')).toBe(true);
      expect(ics.includes('DTSTART;VALUE=DATE:20260601\r\n')).toBe(true);
      expect(ics.includes('SUMMARY:Venue & Caterer Deposit\r\n')).toBe(true);
    });

    it('includes DTEND when endDate is provided', () => {
      const events = [
        {
          id: 'milestone-2',
          summary: 'Multi-day venue hold',
          startDate: '2026-06-01',
          endDate: '2026-06-03',
        },
      ];
      const ics = generateIcsCalendar('Multi-day Event', events);
      expect(ics).toContain('DTEND;VALUE=DATE:20260603\r\n');
    });
  });
});
