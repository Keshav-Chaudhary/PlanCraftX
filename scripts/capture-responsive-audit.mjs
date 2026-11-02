import { chromium } from '@playwright/test';
import path from 'node:path';

const BRAIN_DIR = 'C:/Users/skesh/.gemini/antigravity/brain/7e3174fe-6a45-4bbd-82d2-75ef06e5816f';
const SIZES = [
  { name: '375-mobile', width: 375, height: 812 },
  { name: '768-tablet', width: 768, height: 1024 },
  { name: '1024-laptop', width: 1024, height: 768 },
  { name: '1280-desktop', width: 1280, height: 800 },
];

async function main() {
  const browser = await chromium.launch({ headless: true });

  for (const s of SIZES) {
    const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const out = path.join(BRAIN_DIR, `responsive-${s.name}.png`);
    await page.screenshot({ path: out, fullPage: false });
    console.log(`Captured ${s.name} -> ${out}`);
    await page.close();
  }

  await browser.close();
}

main().catch(console.error);

