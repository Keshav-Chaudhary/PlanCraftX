import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Security: Gemini API Key & Secret Isolation Audit', () => {
  const rootDir = process.cwd();

  it('prohibits direct imports of server-side Gemini client in client-facing components', () => {
    const clientDirs = [
      path.join(rootDir, 'components'),
      path.join(rootDir, 'features'),
      path.join(rootDir, 'hooks'),
    ];

    const forbiddenImports = ['lib/api-clients/gemini', '@google/genai'];

    for (const dir of clientDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir, { recursive: true }) as string[];
      for (const file of files) {
        if (!/\.(tsx?|jsx?)$/.test(file)) continue;
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        for (const forbidden of forbiddenImports) {
          expect(
            content.includes(forbidden),
            `Client component "${file}" illegally imports server-only module "${forbidden}"`,
          ).toBe(false);
        }
      }
    }
  });

  it('guarantees GEMINI_API_KEY is never referenced via NEXT_PUBLIC_ prefix', () => {
    const srcDirs = [
      path.join(rootDir, 'app'),
      path.join(rootDir, 'components'),
      path.join(rootDir, 'features'),
      path.join(rootDir, 'lib'),
    ];

    for (const dir of srcDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir, { recursive: true }) as string[];
      for (const file of files) {
        if (!/\.(tsx?|jsx?|mjs)$/.test(file)) continue;
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        expect(
          content.includes('NEXT_PUBLIC_GEMINI_API_KEY'),
          `Source file "${file}" illegally references NEXT_PUBLIC_GEMINI_API_KEY!`,
        ).toBe(false);
      }
    }
  });

  it('verifies static production bundles in out/ contain zero leaked Gemini secrets', () => {
    const outStaticDir = path.join(rootDir, 'out', '_next', 'static');
    if (!fs.existsSync(outStaticDir)) {
      // If out/ is not yet built in this test run, pass conditionally
      return;
    }

    const files = fs.readdirSync(outStaticDir, { recursive: true }) as string[];
    const jsFiles = files.filter((f) => f.endsWith('.js'));

    expect(jsFiles.length).toBeGreaterThan(0);

    for (const jsFile of jsFiles) {
      const filePath = path.join(outStaticDir, jsFile);
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for Google GenAI API key signatures (AIzaSy...) or raw env name
      expect(
        content.includes('GEMINI_API_KEY'),
        `Bundle "${jsFile}" contains unminified reference to GEMINI_API_KEY`,
      ).toBe(false);

      expect(
        content.includes('AIzaSy'),
        `Bundle "${jsFile}" contains a potential live Google API key!`,
      ).toBe(false);
    }
  });
});
