import { execSync } from 'node:child_process';

const steps = [
  { name: 'Format Check', command: 'npm run format:check' },
  { name: 'ESLint Strict', command: 'npm run lint' },
  { name: 'TypeScript Typecheck', command: 'npm run typecheck' },
  { name: 'Repo Hygiene Scan', command: 'npm run hygiene' },
  { name: 'Unit & Coverage Tests', command: 'npm run test:coverage' },
  { name: 'Production Dependency Audit', command: 'npm run audit' },
];

console.log('=== PlanCraft Verification Suite ===\n');
let hasFailure = false;

for (const step of steps) {
  process.stdout.write(`[RUNNING] ${step.name}... `);
  const start = Date.now();
  try {
    execSync(step.command, { stdio: 'pipe', encoding: 'utf-8' });
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`✓ PASSED (${elapsed}s)`);
  } catch (error) {
    console.log(`✗ FAILED`);
    console.error(`\nError in ${step.name}:`);
    console.error(error.stdout || error.message);
    hasFailure = true;
    break;
  }
}

if (hasFailure) {
  console.error('\nVerification failed. Resolve issues before proceeding.');
  process.exit(1);
} else {
  console.log('\n✓ All verification checks passed genuinely!');
  process.exit(0);
}
