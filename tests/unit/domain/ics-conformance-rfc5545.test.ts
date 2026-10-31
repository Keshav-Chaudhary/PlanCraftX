import { describe, it, expect } from 'vitest';
import {
  escapeIcsText,
  foldIcsLine,
  formatIcsDate,
  generateIcsCalendar,
} from '../../../lib/domain/ics-generator';

describe('RFC 5545 iCalendar Strict Conformance & Folding', () => {
  describe('Special Character Escaping', () => {
    it('escapes backslashes as double backslash', () => {
      expect(escapeIcsText('Path\\To\\File')).toBe('Path\\\\To\\\\File');
    });

    it('escapes semicolons with backslash', () => {
      expect(escapeIcsText('Key;Value;Item')).toBe('Key\\;Value\\;Item');
    });

    it('escapes commas with backslash', () => {
      expect(escapeIcsText('Apples, Oranges, Bananas')).toBe('Apples\\, Oranges\\, Bananas');
    });

    it('escapes carriage return newlines as \\n', () => {
      expect(escapeIcsText('Line 1\r\nLine 2')).toBe('Line 1\\nLine 2');
    });

    it('escapes simple linefeed newlines as \\n', () => {
      expect(escapeIcsText('Line 1\nLine 2')).toBe('Line 1\\nLine 2');
    });

    it('handles text without special characters cleanly', () => {
      expect(escapeIcsText('Clean text without tokens')).toBe('Clean text without tokens');
    });
  });

  describe('RFC 5545 75-Octet Line Folding', () => {
    it('does not fold lines shorter than 75 octets', () => {
      const short = 'SUMMARY:Book wedding venue';
      expect(foldIcsLine(short)).toBe(short);
    });

    it('does not fold a line exactly 75 octets long', () => {
      const line75 = 'A'.repeat(75);
      expect(foldIcsLine(line75)).toBe(line75);
    });

    it('folds a 76-octet ASCII line with CRLF and leading space', () => {
      const line76 = 'A'.repeat(76);
      const folded = foldIcsLine(line76);
      const parts = folded.split('\r\n');
      expect(parts.length).toBe(2);
      expect(parts[0]?.length).toBe(75);
      expect(parts[1]).toBe(' A');
    });

    it('correctly handles multi-byte UTF-8 Hindi characters (Devanagari)', () => {
      // 'शादी' (Wedding in Hindi) uses 3 bytes per character
      const hindiSummary = 'SUMMARY:शादी की तैयारी और हॉल की बुकिंग का समय ' + 'X'.repeat(50);
      const folded = foldIcsLine(hindiSummary);
      const lines = folded.split('\r\n');
      for (const line of lines) {
        const byteLen = new TextEncoder().encode(line).length;
        expect(byteLen).toBeLessThanOrEqual(75);
      }
    });

    it('correctly handles 4-byte UTF-8 emojis', () => {
      const emojiLine = 'SUMMARY:' + '🎉🎂💍🎪'.repeat(10);
      const folded = foldIcsLine(emojiLine);
      const lines = folded.split('\r\n');
      for (const line of lines) {
        const byteLen = new TextEncoder().encode(line).length;
        expect(byteLen).toBeLessThanOrEqual(75);
      }
    });
  });

  describe('Date Formatting', () => {
    it('strips dashes from ISO date string YYYY-MM-DD -> YYYYMMDD', () => {
      expect(formatIcsDate('2026-10-15')).toBe('20261015');
      expect(formatIcsDate('2026-01-01')).toBe('20260101');
      expect(formatIcsDate('2024-02-29')).toBe('20240229');
    });
  });

  describe('Full VCALENDAR Generation', () => {
    it('generates standard RFC 5545 envelope headers and footers', () => {
      const ics = generateIcsCalendar('PlanCraftX Schedule', [], '2026-05-01T12:00:00.000Z');
      expect(ics).toContain('BEGIN:VCALENDAR\r\n');
      expect(ics).toContain('VERSION:2.0\r\n');
      expect(ics).toContain('PRODID:-//PlanCraftX//GenAI Event Planning Assistant//EN\r\n');
      expect(ics).toContain('CALSCALE:GREGORIAN\r\n');
      expect(ics).toContain('METHOD:PUBLISH\r\n');
      expect(ics).toContain('X-WR-CALNAME:PlanCraftX Schedule\r\n');
      expect(ics).toContain('END:VCALENDAR\r\n');
    });

    it('generates valid VEVENT records for milestones', () => {
      const events = [
        {
          id: 'm1',
          summary: 'Book Venue & Catering',
          description: 'Confirm deposit and guest minimums.',
          startDate: '2026-06-01',
          location: 'Grand Palace Hotel',
        },
      ];
      const ics = generateIcsCalendar('Wedding Plan', events, '2026-05-01T12:00:00.000Z');
      expect(ics).toContain('BEGIN:VEVENT\r\n');
      expect(ics).toContain('UID:m1@PlanCraftX.app\r\n');
      expect(ics).toContain('DTSTART;VALUE=DATE:20260601\r\n');
      expect(ics).toContain('SUMMARY:Book Venue & Catering\r\n');
      expect(ics).toContain('LOCATION:Grand Palace Hotel\r\n');
      expect(ics).toContain('STATUS:CONFIRMED\r\n');
      expect(ics).toContain('END:VEVENT\r\n');
    });

    it('supports exclusive endDate when provided', () => {
      const events = [
        {
          id: 'festival-weekend',
          summary: 'Community Music Festival',
          startDate: '2026-07-10',
          endDate: '2026-07-13',
        },
      ];
      const ics = generateIcsCalendar('Festival', events, '2026-05-01T12:00:00.000Z');
      expect(ics).toContain('DTEND;VALUE=DATE:20260713\r\n');
    });

    it('ends every generated output with a CRLF newline', () => {
      const ics = generateIcsCalendar('Test Cal', []);
      expect(ics.endsWith('\r\n')).toBe(true);
    });
  });
});
