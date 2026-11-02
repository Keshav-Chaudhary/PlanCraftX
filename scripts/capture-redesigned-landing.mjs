import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const V2_DIR = path.resolve(process.cwd(), 'docs/frontend-evidence/v2');
const AFTER_DIR = path.resolve(process.cwd(), 'docs/frontend-evidence/after');
const BRAIN_DIR = 'C:/Users/skesh/.gemini/antigravity/brain/7e3174fe-6a45-4bbd-82d2-75ef06e5816f';
const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('Capturing redesigned landing page in Dark and Light themes...');
  const browser = await chromium.launch({ headless: true });

  // 1. Dark Mode Desktop (1440 x 900)
  const darkContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const darkPage = await darkContext.newPage();
  await darkPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await darkPage.evaluate(() => {
    localStorage.setItem('PlanCraftX_theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await darkPage.reload({ waitUntil: 'networkidle' });
  await darkPage.locator('h1').waitFor({ state: 'visible' });
  await darkPage.locator('#hero-quick-prompt-btn').waitFor({ state: 'visible' });
  await darkPage.waitForTimeout(2000);

  const outDarkDesktopV2 = path.join(V2_DIR, '01-landing-desktop.png');
  const outDarkDesktopAfter = path.join(AFTER_DIR, '01-landing-desktop.png');
  const outDarkDesktopBrain = path.join(BRAIN_DIR, '01-landing-desktop-dark-themed.png');

  await darkPage.screenshot({ path: outDarkDesktopV2, fullPage: false });
  fs.copyFileSync(outDarkDesktopV2, outDarkDesktopAfter);
  fs.copyFileSync(outDarkDesktopV2, outDarkDesktopBrain);
  console.log('Saved Dark Desktop screenshot to:', outDarkDesktopBrain);

  // 2. Light Mode Desktop (1440 x 900) - Dynamic theme toggle verification
  const lightContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const lightPage = await lightContext.newPage();
  await lightPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await lightPage.evaluate(() => {
    localStorage.setItem('PlanCraftX_theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
  });
  await lightPage.reload({ waitUntil: 'networkidle' });
  await lightPage.locator('h1').waitFor({ state: 'visible' });
  await lightPage.locator('#hero-quick-prompt-btn').waitFor({ state: 'visible' });
  await lightPage.waitForTimeout(2000);

  const outLightDesktopBrain = path.join(BRAIN_DIR, '01-landing-desktop-light-themed.png');
  await lightPage.screenshot({ path: outLightDesktopBrain, fullPage: false });
  console.log('Saved Light Desktop screenshot to:', outLightDesktopBrain);

  // 3. Mobile Dark (390 x 844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
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
  await mobilePage.waitForTimeout(2000);

  const outDarkMobileV2 = path.join(V2_DIR, '01-landing-mobile.png');
  const outDarkMobileAfter = path.join(AFTER_DIR, '01-landing-mobile.png');
  await mobilePage.screenshot({ path: outDarkMobileV2, fullPage: false });
  fs.copyFileSync(outDarkMobileV2, outDarkMobileAfter);
  console.log('Saved Mobile screenshot to:', outDarkMobileV2);

  await browser.close();
  console.log('Finished capturing all dynamic theme screenshots!');
}

main().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
