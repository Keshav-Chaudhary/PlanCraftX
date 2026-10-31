import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const FORBIDDEN_TOKENS = [
  'TODO',
  'FIXME',
  'console.log',
  '@ts-ignore',
  'dangerouslySetInnerHTML',
  'lorem ipsum',
];

const IGNORED_DIRS = new Set([
  '.git',
  '.next',
  '.firebase',
  'out',
  'node_modules',
  'coverage',
  'playwright-report',
  'test-results',
  'reports',
]);

function isTestOrDocFile(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  return (
    norm.includes('/tests/') ||
    norm.startsWith('tests/') ||
    norm.endsWith('.test.ts') ||
    norm.endsWith('.test.tsx') ||
    norm.endsWith('.spec.ts') ||
    norm.endsWith('.md') ||
    norm.includes('scripts/')
  );
}

function scanDirectory(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else if (entry.isFile()) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

console.log('--- PlanCraftX Repository Hygiene Check ---');
const allFiles = scanDirectory(ROOT_DIR);
let violationCount = 0;

for (const file of allFiles) {
  const relPath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf-8');

  // Check forbidden tokens in app and lib code
  if (!isTestOrDocFile(relPath) && !relPath.startsWith('scripts/')) {
    for (const token of FORBIDDEN_TOKENS) {
      if (content.includes(token)) {
        console.error(`[VIOLATION] Found forbidden token "${token}" in ${relPath}`);
        violationCount++;
      }
    }
  }

  // Check fake/mock/dummy in production code
  if (!isTestOrDocFile(relPath)) {
    const lowerContent = content.toLowerCase();
    const fakeTokens = ['dummy', 'fake', 'mock vendor', 'canned reply'];
    for (const ft of fakeTokens) {
      if (lowerContent.includes(ft)) {
        console.error(`[VIOLATION: NO-FAKE-DATA] Found "${ft}" in production file ${relPath}`);
        violationCount++;
      }
    }

    // Amendment A: No percentage table in lib/ or features/
    if (relPath.startsWith('lib/') || relPath.startsWith('features/')) {
      const percentageTablePattern = /\b\d{1,2}\s*%\s*[-–]\s*\d{1,2}\s*%/;
      if (percentageTablePattern.test(content)) {
        console.error(
          `[VIOLATION: AMENDMENT-A] Hardcoded budget percentage range found in ${relPath}`,
        );
        violationCount++;
      }
    }
  }
}

// Check repository size
let trackedSize = 0;
for (const file of allFiles) {
  const stat = fs.statSync(file);
  trackedSize += stat.size;
}
const trackedSizeMb = (trackedSize / (1024 * 1024)).toFixed(2);
console.log(`Tracked source size (excluding ignored build artifacts): ${trackedSizeMb} MB`);

if (trackedSize > 10 * 1024 * 1024) {
  console.error(`[VIOLATION] Tracked repository size exceeds 10 MB limit: ${trackedSizeMb} MB`);
  violationCount++;
}

if (violationCount > 0) {
  console.error(`Hygiene check failed with ${violationCount} violations.`);
  process.exit(1);
} else {
  console.log('✓ All repository hygiene invariants passed cleanly with 0 violations.');
  process.exit(0);
}
