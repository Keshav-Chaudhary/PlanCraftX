/**
 * Pure domain logic for generating RFC 5545 compliant iCalendar (.ics) exports.
 * Adheres strictly to RFC 5545: CRLF line endings (\r\n), UTF-8 octet-aware line folding
 * at 75 octets max, backslash/comma/semicolon escaping, and deterministic UIDs.
 */

export interface CalendarEventInput {
  readonly id: string;
  readonly summary: string;
  readonly description?: string | undefined;
  readonly startDate: string; // YYYY-MM-DD
  readonly endDate?: string | undefined; // YYYY-MM-DD (exclusive, defaults to same day)
  readonly location?: string | undefined;
  readonly uidDomain?: string | undefined;
}

/**
 * Escapes characters with special meaning in RFC 5545 TEXT values:
 * backslash, semicolon, comma, and newline.
 */
export function escapeIcsText(raw: string): string {
  return raw
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Folds a single content line so that no line exceeds 75 octets (UTF-8 byte length).
 * Continuation lines begin with a single space (0x20).
 */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(line);

  if (bytes.length <= 75) {
    return line;
  }

  const chunks: string[] = [];
  let currentString = '';
  let currentOctetLength = 0;
  // First line can be up to 75 octets; continuation lines can be up to 74 octets (+ 1 leading space = 75 octets)
  let maxOctetsForCurrent = 75;

  for (const char of line) {
    const charBytes = encoder.encode(char);
    if (currentOctetLength + charBytes.length > maxOctetsForCurrent) {
      chunks.push(currentString);
      currentString = char;
      currentOctetLength = charBytes.length;
      maxOctetsForCurrent = 74; // Subsequent lines start with space (1 octet)
    } else {
      currentString += char;
      currentOctetLength += charBytes.length;
    }
  }

  if (currentString.length > 0) {
    chunks.push(currentString);
  }

  // Join chunks with CRLF followed by single space
  return chunks.join('\r\n ');
}

/**
 * Converts a YYYY-MM-DD string to RFC 5545 DATE format YYYYMMDD.
 */
export function formatIcsDate(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

/**
 * Generates an RFC 5545 VCALENDAR payload from a list of timeline milestones.
 */
export function generateIcsCalendar(
  calendarTitle: string,
  events: readonly CalendarEventInput[],
  createdTimestamp: string = new Date().toISOString(),
): string {
  const dtstamp = createdTimestamp.replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlanCraftX//GenAI Event Planning Assistant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarTitle)}`,
  ];

  for (const event of events) {
    const domain = event.uidDomain ?? 'PlanCraftX.app';
    const uid = `${event.id}@${domain}`;
    const startFormatted = formatIcsDate(event.startDate);

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtstamp}`);
    lines.push(`DTSTART;VALUE=DATE:${startFormatted}`);

    if (event.endDate) {
      lines.push(`DTEND;VALUE=DATE:${formatIcsDate(event.endDate)}`);
    }

    lines.push(`SUMMARY:${escapeIcsText(event.summary)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    }
    if (event.location) {
      lines.push(`LOCATION:${escapeIcsText(event.location)}`);
    }

    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  // Fold each line at 75 octets and join with CRLF
  const foldedLines = lines.map(foldIcsLine);
  return foldedLines.join('\r\n') + '\r\n';
}
