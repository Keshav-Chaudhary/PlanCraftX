import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const V2_DIR = path.resolve(process.cwd(), 'docs/frontend-evidence/v2');
const AFTER_DIR = path.resolve(process.cwd(), 'docs/frontend-evidence/after');
const BRAIN_DIR = 'C:/Users/skesh/.gemini/antigravity/brain/7e3174fe-6a45-4bbd-82d2-75ef06e5816f';
const PORT = 55801;
const BASE_URL = `http://localhost:${PORT}`;

async function main() {
  console.log('Capturing fully-rendered 01-landing-desktop.png with full animation settlement delay...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

  // Ensure dark mode is active
  await page.evaluate(() => {
    localStorage.setItem('PlanCraftX_theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.reload({ waitUntil: 'networkidle' });

  // Wait for key elements to be visible
  await page.locator('h1').waitFor({ state: 'visible' });
  await page.locator('#hero-quick-prompt-btn').waitFor({ state: 'visible' });

  // Wait 2500ms so all CSS stagger delays (up to 480ms) and rise animations (800ms) fully complete
  console.log('Waiting 2500ms for all animations and renders to fully settle...');
  await page.waitForTimeout(2500);

  // Verify opacity of headline and elements is 1
  const h1Opacity = await page.locator('h1').evaluate((el) => window.getComputedStyle(el).opacity);
  console.log('H1 computed opacity after settlement:', h1Opacity);

  const outPathV2 = path.join(V2_DIR, '01-landing-desktop.png');
  const outPathAfter = path.join(AFTER_DIR, '01-landing-desktop.png');
  const outPathBrain = path.join(BRAIN_DIR, '01-landing-desktop-settled.png');

  await page.screenshot({ path: outPathV2, fullPage: false });
  fs.copyFileSync(outPathV2, outPathAfter);
  fs.copyFileSync(outPathV2, outPathBrain);

  console.log('Saved fully-settled 01-landing-desktop.png to:');
  console.log(' -', outPathV2);
  console.log(' -', outPathAfter);
  console.log(' -', outPathBrain);

  // Also do mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await mobilePage.evaluate(() => {
    localStorage.setItem('PlanCraftX_theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await mobilePage.reload({ waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2500);

  const mobPathV2 = path.join(V2_DIR, '01-landing-mobile.png');
  const mobPathAfter = path.join(AFTER_DIR, '01-landing-mobile.png');
  await mobilePage.screenshot({ path: mobPathV2, fullPage: false });
  fs.copyFileSync(mobPathV2, mobPathAfter);

  await browser.close();
  console.log('Both desktop and mobile fully settled screenshots updated!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

