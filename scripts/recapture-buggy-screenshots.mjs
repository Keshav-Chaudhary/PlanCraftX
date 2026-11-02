import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const V2_DIR = path.resolve(process.cwd(), 'docs/frontend-evidence/v2');
const AFTER_DIR = path.resolve(process.cwd(), 'docs/frontend-evidence/after');
const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('Recapturing 01-landing-desktop.png and 10-privacy-settings-desktop.png...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // 1. Recapture 01-landing-desktop.png
  console.log('Capturing Landing Page (with all sections revealed)...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  // Scroll through page to trigger any remaining IntersectionObservers
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);

  const landingPathV2 = path.join(V2_DIR, '01-landing-desktop.png');
  const landingPathAfter = path.join(AFTER_DIR, '01-landing-desktop.png');
  await page.screenshot({ path: landingPathV2, fullPage: true });
  fs.copyFileSync(landingPathV2, landingPathAfter);
  console.log('Saved 01-landing-desktop.png to v2 and after.');

  // 2. Recapture 10-privacy-settings-desktop.png (Workspace Settings Modal Overlay on populated /plan)
  console.log('Capturing Workspace Settings Modal Overlay on /plan...');
  // Ensure a plan is populated so the workspace dashboard is active underneath
  await page.goto(`${BASE_URL}/plan/event`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const weddingBtn = page.locator('button:has-text("Wedding")');
  if (await weddingBtn.isVisible()) {
    await weddingBtn.click();
  }
  await page.fill('#event-date', '2026-11-20');
  await page.fill('#event-location', 'Chicago, IL');
  await page.fill('#guest-count', '120');
  await page.fill('#total-budget', '25000');
  const submitBtn = page.locator('#generate-plan-submit-btn');
  if (await submitBtn.isVisible()) {
    await submitBtn.click({ force: true });
    await page.waitForURL(/\/plan\/?$/, { timeout: 15000 });
  }

  // Now open the Workspace Settings modal overlay
  await page.goto(`${BASE_URL}/plan#settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const dialog = page.locator('[role="dialog"]');
  await dialog.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(500);

  const privacyPathV2 = path.join(V2_DIR, '10-privacy-settings-desktop.png');
  const privacyPathAfter = path.join(AFTER_DIR, '10-privacy-settings-desktop.png');
  await page.screenshot({ path: privacyPathV2, fullPage: false });
  fs.copyFileSync(privacyPathV2, privacyPathAfter);
  console.log('Saved 10-privacy-settings-desktop.png to v2 and after.');

  await browser.close();
  console.log('All recaptured successfully!');
}

main().catch((err) => {
  console.error('Error during recapture:', err);
  process.exit(1);
});

