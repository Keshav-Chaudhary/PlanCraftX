import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function getSourceFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getSourceFiles(fullPath, fileList);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      if (!entry.name.includes('.test.') && !entry.name.includes('.spec.')) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

describe('Absolute Invariant: Zero Hardcoded Budget Data (Amendment A)', () => {
  it('strictly forbids hardcoded percentage split tables in lib/ and features/', () => {
    const rootDir = process.cwd();
    const libFiles = getSourceFiles(path.join(rootDir, 'lib'));
    const featureFiles = getSourceFiles(path.join(rootDir, 'features'));
    const targetFiles = [...libFiles, ...featureFiles];

    // Regex for percentage allocations like "40%", "40-50%", "40 - 50 %"
    const percentageSplitRegex = /\b\d{1,2}\s*%\s*(?:[-–]\s*\d{1,2}\s*%)?/;

    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        // Exclude generic comments or percentage sign in non-allocation contexts
        if (
          percentageSplitRegex.test(line) &&
          !line.includes('// Regex') &&
          !line.includes('Strictly forbids')
        ) {
          violations.push({
            file: path.relative(rootDir, file).replace(/\\/g, '/'),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(
      violations,
      `Detected hardcoded budget percentages in production code: ${JSON.stringify(violations, null, 2)}`,
    ).toHaveLength(0);
  });

  it('strictly forbids hardcoded vendor prices or fabricated cost literals in lib/ and features/', () => {
    const rootDir = process.cwd();
    const libFiles = getSourceFiles(path.join(rootDir, 'lib'));
    const featureFiles = getSourceFiles(path.join(rootDir, 'features'));
    const targetFiles = [...libFiles, ...featureFiles];

    // Check for hardcoded dollar/euro/currency price figures e.g. "$1,500", "€2500"
    const priceLiteralRegex = /(?:\$|€|£|¥)\s*\d+(?:,\d{3})*(?:\.\d{2})?/;

    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of targetFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (priceLiteralRegex.test(line) && !line.includes('priceLiteralRegex')) {
          violations.push({
            file: path.relative(rootDir, file).replace(/\\/g, '/'),
            line: index + 1,
            text: line.trim(),
          });
        }
      });
    }

    expect(
      violations,
      `Detected hardcoded price literals in production code: ${JSON.stringify(violations, null, 2)}`,
    ).toHaveLength(0);
  });
});
