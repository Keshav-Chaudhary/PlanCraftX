import { chromium } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Mobile-360', width: 360, height: 740 },
  { name: 'Mobile-375', width: 375, height: 667 },
  { name: 'Mobile-390', width: 390, height: 844 },
  { name: 'Tablet-768', width: 768, height: 1024 },
  { name: 'Laptop-1024', width: 1024, height: 768 },
  { name: 'Laptop-1280', width: 1280, height: 800 },
  { name: 'Desktop-1440', width: 1440, height: 900 },
];

async function main() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = vp.width;

    console.log(`[${vp.name}] (${innerWidth}px) -> scrollWidth: ${scrollWidth}px, Overflow: ${hasHorizontalOverflow ? 'YES (BUG!)' : 'NO'}`);

    if (hasHorizontalOverflow) {
      // Find which elements exceed viewport width
      const overflowingElements = await page.evaluate(() => {
        const docW = window.innerWidth;
        const bad = [];
        document.querySelectorAll('*').forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > docW + 2) {
            bad.push({
              tag: el.tagName,
              id: el.id,
              class: el.className?.toString().slice(0, 60),
              right: Math.round(rect.right),
              excess: Math.round(rect.right - docW),
            });
          }
        });
        return bad.slice(0, 5);
      });
      console.log('   Overflowing elements:', JSON.stringify(overflowingElements, null, 2));
    }

    await page.close();
  }

  await browser.close();
}

main().catch(console.error);

