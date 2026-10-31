import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { foldIcsLine } from '../../lib/domain/ics-generator';

describe('Property-Based Test: RFC 5545 Line Folding 75-Octet Invariant', () => {
  it('strictly satisfies that NO line exceeds 75 UTF-8 octets for ANY unicode string', () => {
    const encoder = new TextEncoder();

    fc.assert(
      fc.property(
        // Arbitrary Unicode string from 0 to 500 characters, including emojis and multi-byte scripts
        fc.unicodeString({ minLength: 0, maxLength: 500 }),
        (rawText) => {
          // Replace raw CR/LF from random input so we test a single content line
          const cleanLine = rawText.replace(/[\r\n]/g, ' ');
          const folded = foldIcsLine(cleanLine);
          const lines = folded.split('\r\n');

          lines.forEach((line, index) => {
            const byteLength = encoder.encode(line).length;
            // Every folded line must not exceed 75 UTF-8 octets
            expect(byteLength).toBeLessThanOrEqual(75);

            // Continuation lines must start with space
            if (index > 0) {
              expect(line.startsWith(' ')).toBe(true);
            }
          });
        },
      ),
      { numRuns: 100 },
    );
  });
});
