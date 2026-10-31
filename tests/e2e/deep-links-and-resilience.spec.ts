import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Deep Linking, Route Resilience & Accessibility', () => {
  const routes = [
    '/',
    '/plan',
    '/plan/event',
    '/plan/budget',
    '/plan/timeline',
    '/plan/vendors',
    '/plan/ideas',
    '/plan/assistant',
    '/plan/export',
    '/settings/privacy',
  ];

  for (const route of routes) {
    test(`deep links directly to ${route} without hanging`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(route);

      // Verify that "Loading planning workspace..." does not persist indefinitely
      await expect(page.locator('text=Loading planning workspace...')).toHaveCount(0);

      // Verify page has rendered a meaningful heading
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Refresh to verify refresh-safety
      await page.reload();
      await expect(page.locator('text=Loading planning workspace...')).toHaveCount(0);
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // Check for zero unhandled React/Next.js runtime errors
      const criticalErrors = consoleErrors.filter(
        (err) =>
          !err.includes('favicon') &&
          !err.includes('404') &&
          !err.includes('download') &&
          !err.includes('eval() is not supported'),
      );
      expect(criticalErrors).toEqual([]);
    });
  }

  test('gracefully recovers when localStorage contains malformed JSON', async ({ page }) => {
    await page.goto('/');
    // Inject corrupt data
    await page.evaluate(() => {
      localStorage.setItem('PlanCraftX_current_plan', '{corrupt-json-data: true,');
    });

    await page.goto('/plan');
    // Verify it does NOT hang in loading spinner; falls back cleanly to empty workspace
    await expect(page.locator('#empty-plan-heading')).toBeVisible();
    await expect(page.locator('text=Welcome to PlanCraftX Workspace')).toBeVisible();
  });

  test('operates accessible mobile navigation on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/plan');

    // Menu toggle button should be visible on mobile
    const toggleBtn = page.locator('#workspace-menu-toggle');
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    // Click toggle to open
    await toggleBtn.click();
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
  });

  test('landing page and privacy settings pass automated axe-core accessibility audit', async ({
    page,
  }) => {
    await page.goto('/');
    const landingAxe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(landingAxe.violations).toEqual([]);

    await page.goto('/settings/privacy');
    const privacyAxe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(privacyAxe.violations).toEqual([]);
  });
});
