import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'out');
const firebaseJsonPath = path.join(rootDir, 'firebase.json');

if (!fs.existsSync(outDir)) {
  console.log('[CSP Hashes] No out/ directory found. Skipping static CSP hash extraction.');
  process.exit(0);
}

function findHtmlFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = findHtmlFiles(outDir);
const hashes = new Set();

for (const htmlFile of htmlFiles) {
  const content = fs.readFileSync(htmlFile, 'utf-8');
  // Match inline <script> tags without src attribute
  const matches = [...content.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of matches) {
    const scriptBody = match[1];
    if (scriptBody && scriptBody.trim()) {
      const hash = crypto.createHash('sha256').update(scriptBody, 'utf-8').digest('base64');
      hashes.add(`'sha256-${hash}'`);
    }
  }
}

const sortedHashes = Array.from(hashes).sort();
console.log(
  `[CSP Hashes] Extracted ${sortedHashes.length} inline script hash(es) across ${htmlFiles.length} HTML files:`,
);
sortedHashes.forEach((h) => console.log(`  - ${h}`));

if (fs.existsSync(firebaseJsonPath)) {
  const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf-8'));
  const headerRules = config.hosting?.headers ?? [];
  let updated = false;

  for (const rule of headerRules) {
    const cspHeader = rule.headers?.find((h) => h.key === 'Content-Security-Policy');
    if (cspHeader) {
      let csp = cspHeader.value;
      const scriptSrcMatch = csp.match(/script-src\s+([^;]+)/);
      if (scriptSrcMatch) {
        // Ensure 'self' and 'unsafe-inline' are kept
        const requiredTokens = new Set(["'self'", "'unsafe-inline'", ...sortedHashes]);
        const newTokens = Array.from(requiredTokens).join(' ');
        csp = csp.replace(/script-src\s+[^;]+/, `script-src ${newTokens}`);
        cspHeader.value = csp;
        updated = true;
      }
    }
  }

  if (updated && process.argv.includes('--update')) {
    fs.writeFileSync(firebaseJsonPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
    console.log('[CSP Hashes] Successfully updated firebase.json with strict script hashes.');
  }
}
