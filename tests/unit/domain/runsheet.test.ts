import { describe, it, expect } from 'vitest';
import { generateEventDayRunsheet } from '@/lib/domain/runsheet';

describe('Event Day Run-Sheet Deterministic Generator', () => {
  it('generates chronological wedding day schedule with lead roles', () => {
    const sheet = generateEventDayRunsheet('wedding');
    expect(sheet.length).toBeGreaterThanOrEqual(7);
    expect(sheet[0]?.time).toBe('08:00');
    expect(sheet[0]?.activity).toContain('Preparation');
    expect(sheet.some((s) => s.activity.includes('Ceremony'))).toBe(true);
    expect(sheet.some((s) => s.activity.includes('Send-Off'))).toBe(true);
  });

  it('generates chronological birthday party schedule', () => {
    const sheet = generateEventDayRunsheet('birthday');
    expect(sheet.length).toBeGreaterThanOrEqual(5);
    expect(sheet[0]?.time).toBe('10:00');
    expect(sheet.some((s) => s.activity.includes('Cake Cutting'))).toBe(true);
    expect(sheet.some((s) => s.activity.includes('Games'))).toBe(true);
  });

  it('generates civic community festival schedule', () => {
    const sheet = generateEventDayRunsheet('community');
    expect(sheet.length).toBeGreaterThanOrEqual(5);
    expect(sheet[0]?.time).toBe('07:00');
    expect(sheet.some((s) => s.activity.includes('Permit'))).toBe(true);
    expect(sheet.some((s) => s.activity.includes('Breakdown'))).toBe(true);
  });
});
