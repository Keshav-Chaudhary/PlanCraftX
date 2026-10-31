/**
 * Pure domain logic for timeline reverse-planning, lead-time scaling,
 * leap-year and DST safe date math, and holiday clash checks.
 */

import { type EventType, TIMELINE_PHASES, PHASE_IDEAL_LEAD_DAYS } from './event-rules';

export interface CalendarDateParts {
  readonly year: number;
  readonly month: number; // 1-12
  readonly day: number; // 1-31
}

/**
 * Parses a YYYY-MM-DD string into calendar date components.
 * Independent of timezone and daylight saving offset.
 */
export function parseCalendarDate(isoDate: string): CalendarDateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match || !match[1] || !match[2] || !match[3]) {
    throw new Error(`Invalid calendar date format (expected YYYY-MM-DD): "${isoDate}"`);
  }
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  return { year, month, day };
}

/**
 * Formats calendar date components into YYYY-MM-DD string.
 */
export function formatCalendarDate(parts: CalendarDateParts): string {
  const y = String(parts.year).padStart(4, '0');
  const m = String(parts.month).padStart(2, '0');
  const d = String(parts.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Adds (or subtracts) an exact integer count of days to/from a calendar date.
 * Uses local date constructor to remain completely unaffected by DST transitions
 * or timezone boundaries.
 */
export function addCalendarDays(isoDate: string, days: number): string {
  const { year, month, day } = parseCalendarDate(isoDate);
  // Date constructor with year, monthIndex (0-11), day automatically handles
  // leap years, month rollover, and year rollover safely.
  const date = new Date(year, month - 1, day + days);
  return formatCalendarDate({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

/**
 * Computes exact difference in calendar days between two YYYY-MM-DD dates (to - from).
 */
export function differenceInCalendarDays(fromIso: string, toIso: string): number {
  const fromParts = parseCalendarDate(fromIso);
  const toParts = parseCalendarDate(toIso);

  const utcFrom = Date.UTC(fromParts.year, fromParts.month - 1, fromParts.day);
  const utcTo = Date.UTC(toParts.year, toParts.month - 1, toParts.day);

  const MS_PER_DAY = 86_400_000;
  return Math.round((utcTo - utcFrom) / MS_PER_DAY);
}

export interface CalculatedPhase {
  readonly phase: string;
  readonly daysBeforeEvent: number;
  readonly dueDate: string;
  readonly isCompressed: boolean;
}

function getPhases(eventType: EventType): readonly string[] {
  switch (eventType) {
    case 'wedding':
      return TIMELINE_PHASES.wedding;
    case 'birthday':
      return TIMELINE_PHASES.birthday;
    case 'community':
      return TIMELINE_PHASES.community;
  }
}

function getIdealLeads(eventType: EventType): readonly number[] {
  switch (eventType) {
    case 'wedding':
      return PHASE_IDEAL_LEAD_DAYS.wedding;
    case 'birthday':
      return PHASE_IDEAL_LEAD_DAYS.birthday;
    case 'community':
      return PHASE_IDEAL_LEAD_DAYS.community;
  }
}

/**
 * Calculates phase due dates reverse-planned from the event date.
 * If actual days remaining is less than ideal horizon, dynamically scales phases
 * while preserving sequence ordering.
 */
export function calculateTimelinePhases(
  eventType: EventType,
  eventDate: string,
  referenceDate: string,
): CalculatedPhase[] {
  const phases = getPhases(eventType);
  const idealLeads = getIdealLeads(eventType);

  const availableDays = differenceInCalendarDays(referenceDate, eventDate);
  const maxIdealLead = idealLeads[0] !== undefined ? idealLeads[0] : 60;

  const isCompressed = availableDays > 0 && availableDays < maxIdealLead;
  const scaleRatio = isCompressed ? availableDays / maxIdealLead : 1;

  let lastDays = Infinity;

  return phases.map((phase, idx) => {
    const idealLead = idealLeads.at(idx) ?? 0;
    let actualLead: number;

    if (idealLead <= 0) {
      // Event day (0) or post-event (-2) remains anchored to event date
      actualLead = idealLead;
    } else if (isCompressed) {
      // Scale lead time proportionally
      const scaled = Math.round(idealLead * scaleRatio);
      // Ensure strictly decreasing lead days so phases stay sequential
      actualLead = Math.min(scaled, lastDays - 1);
      actualLead = Math.max(1, actualLead);
    } else {
      actualLead = idealLead;
    }

    lastDays = actualLead;
    const dueDate = addCalendarDays(eventDate, -actualLead);

    return {
      phase,
      daysBeforeEvent: actualLead,
      dueDate,
      isCompressed,
    };
  });
}

export interface PublicHoliday {
  readonly date: string;
  readonly name: string;
}

export interface MilestoneClashCheck {
  readonly dueDate: string;
  readonly holidayName?: string | undefined;
  readonly hasClash: boolean;
}

/**
 * Checks whether any milestone dates clash with public holidays.
 */
export function checkHolidayClash(
  dueDate: string,
  holidays: readonly PublicHoliday[],
): MilestoneClashCheck {
  const matched = holidays.find((h) => h.date === dueDate);
  if (matched) {
    return {
      dueDate,
      holidayName: matched.name,
      hasClash: true,
    };
  }
  return {
    dueDate,
    hasClash: false,
  };
}
