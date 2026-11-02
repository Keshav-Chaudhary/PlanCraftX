import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), 'docs/frontend-evidence/v2');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('Launching browser to capture v2 evidence screenshots...');
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop context
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const desktopPage = await desktopContext.newPage();

  // 2. Mobile context
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  // ── Route 1: Landing Page (/) ──
  console.log('Capturing Route 1: Landing Page...');
  await desktopPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '01-landing-desktop.png'),
    fullPage: true,
  });

  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '01-landing-mobile.png'),
    fullPage: false,
  });

  // ── Route 2: Workspace Empty State (/plan) ──
  console.log('Capturing Route 2: Workspace Empty State...');
  await desktopPage.evaluate(() => localStorage.clear());
  await desktopPage.goto(`${BASE_URL}/plan`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '02-workspace-empty-desktop.png'),
    fullPage: true,
  });

  await mobilePage.evaluate(() => localStorage.clear());
  await mobilePage.goto(`${BASE_URL}/plan`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '02-workspace-empty-mobile.png'),
    fullPage: false,
  });

  // ── Route 3: Event Setup Form (/plan/event) ──
  console.log('Capturing Route 3: Event Setup Wizard...');
  await desktopPage.goto(`${BASE_URL}/plan/event`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  const weddingBtn = desktopPage.locator('button:has-text("Wedding")');
  if (await weddingBtn.isVisible()) {
    await weddingBtn.click();
  }
  await desktopPage.fill('#event-date', '2026-11-20');
  await desktopPage.fill('#event-location', 'Chicago, IL');
  await desktopPage.fill('#guest-count', '120');
  await desktopPage.fill('#total-budget', '25000');
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '03-event-creation-desktop.png'),
    fullPage: true,
  });

  await mobilePage.goto(`${BASE_URL}/plan/event`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  const weddingBtnM = mobilePage.locator('button:has-text("Wedding")');
  if (await weddingBtnM.isVisible()) {
    await weddingBtnM.click();
  }
  await mobilePage.fill('#event-date', '2026-11-20');
  await mobilePage.fill('#event-location', 'Chicago, IL');
  await mobilePage.fill('#guest-count', '120');
  await mobilePage.fill('#total-budget', '25000');
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '03-event-creation-mobile.png'),
    fullPage: false,
  });

  // Submit on desktop to populate plan
  console.log('Submitting plan creation on desktop...');
  const submitBtn = desktopPage.locator('#generate-plan-submit-btn');
  if (await submitBtn.isVisible()) {
    await submitBtn.click({ force: true });
    await desktopPage.waitForURL(/\/plan\/?$/, { timeout: 15000 });
  }

  // Also submit on mobile
  const submitBtnM = mobilePage.locator('#generate-plan-submit-btn');
  if (await submitBtnM.isVisible()) {
    await submitBtnM.click({ force: true });
    await mobilePage.waitForURL(/\/plan\/?$/, { timeout: 15000 });
  }

  // ── Route 4: Workspace Populated (/plan) ──
  console.log('Capturing Route 4: Populated Workspace...');
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '02-workspace-populated-desktop.png'),
    fullPage: true,
  });

  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '02-workspace-populated-mobile.png'),
    fullPage: false,
  });

  // ── Route 5: Budget Planner (/plan/budget) ──
  console.log('Capturing Route 5: Budget Planner...');
  await desktopPage.goto(`${BASE_URL}/plan/budget`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '04-budget-planner-desktop.png'),
    fullPage: true,
  });

  await mobilePage.goto(`${BASE_URL}/plan/budget`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({
    path: path.join(OUT_DIR, '04-budget-planner-mobile.png'),
    fullPage: false,
  });

  // ── Route 6: Timeline & Milestones (/plan/timeline) ──
  console.log('Capturing Route 6: Timeline & Milestones...');
  await desktopPage.goto(`${BASE_URL}/plan/timeline`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '05-timeline-milestones-desktop.png'),
    fullPage: true,
  });

  // ── Route 7: Vendor Checklist (/plan/vendors) ──
  console.log('Capturing Route 7: Vendor Checklist...');
  await desktopPage.goto(`${BASE_URL}/plan/vendors`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '06-vendor-checklist-desktop.png'),
    fullPage: true,
  });

  // ── Route 8: AI Ideas Studio (/plan/ideas) ──
  console.log('Capturing Route 8: AI Ideas Studio...');
  await desktopPage.goto(`${BASE_URL}/plan/ideas`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '07-ai-ideas-desktop.png'),
    fullPage: true,
  });

  // ── Route 9: AI Planning Assistant (/plan/assistant) ──
  console.log('Capturing Route 9: AI Assistant...');
  await desktopPage.goto(`${BASE_URL}/plan/assistant`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '08-ai-assistant-desktop.png'),
    fullPage: true,
  });

  // ── Route 10: Export & Portability (/plan/export) ──
  console.log('Capturing Route 10: Export & Portability...');
  await desktopPage.goto(`${BASE_URL}/plan/export`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '09-export-portability-desktop.png'),
    fullPage: true,
  });

  // ── Route 11: Privacy Settings (/settings/privacy) ──
  console.log('Capturing Route 11: Privacy Settings...');
  await desktopPage.goto(`${BASE_URL}/settings/privacy`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.screenshot({
    path: path.join(OUT_DIR, '10-privacy-settings-desktop.png'),
    fullPage: true,
  });

  // ── Bonus Route 12: Workspace Settings Overlay on /plan ──
  console.log('Capturing Workspace Settings Modal Overlay...');
  await desktopPage.goto(`${BASE_URL}/plan`, { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(800);
  const settingsBtn = desktopPage.locator('#sidebar-settings-button');
  if (await settingsBtn.isVisible()) {
    await settingsBtn.click();
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({
      path: path.join(OUT_DIR, '11-workspace-settings-modal-desktop.png'),
      fullPage: false,
    });
  }

  await browser.close();
  console.log('Successfully captured all v2 screenshots in:', OUT_DIR);
}

run().catch((err) => {
  console.error('Failed to capture evidence:', err);
  process.exit(1);
});

