import { test, expect, type Page } from '@playwright/test';

async function navigateWorkspace(page: Page, tabId: string) {
  const menuToggle = page.locator('#workspace-menu-toggle');
  if (await menuToggle.isVisible()) {
    const isExpanded = (await menuToggle.getAttribute('aria-expanded')) === 'true';
    if (!isExpanded) {
      await menuToggle.click();
    }
  }
  await page.click(`#nav-${tabId}`);
}

test.describe('Event Taxonomy Differentiation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('creates a birthday plan with age-appropriate categories and milestones', async ({
    page,
  }) => {
    await page.goto('/plan/event');

    // Select Birthday
    const bdayBtn = page.locator('button:has-text("Birthday")');
    await bdayBtn.click();
    await expect(bdayBtn).toHaveAttribute('aria-pressed', 'true');

    await page.fill('#event-date', '2026-08-10');
    await page.fill('#event-location', 'Denver, CO');
    await page.fill('#guest-count', '35');
    await page.fill('#total-budget', '3500');
    await page.selectOption('#currency-select', 'USD');
    await page.fill('#priorities-input', 'Laser tag and custom superhero cake');

    const submitBtn = page.locator('#generate-plan-submit-btn');
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click({ force: true });
    await expect(page).toHaveURL(/\/plan$/, { timeout: 15000 });

    // Verify Birthday badge and title
    await expect(page.locator('h1').first()).toContainText('BIRTHDAY');

    // Verify Birthday budget categories
    await navigateWorkspace(page, 'budget');
    await expect(page.locator('text=Cake & Dessert').first()).toBeVisible();
    await expect(page.locator('text=Activities & Games').first()).toBeVisible();
    await expect(page.locator('text=Party Favors & Gifts').first()).toBeVisible();

    // Verify Birthday timeline phases
    await navigateWorkspace(page, 'timeline');
    await expect(page.locator('text=Theme & Venue Selection').first()).toBeVisible();
    await expect(page.locator('text=Event Day Execution').first()).toBeVisible();
  });

  test('creates a community event plan with logistics and municipal categories', async ({
    page,
  }) => {
    await page.goto('/plan/event');

    // Select Community Event
    const commBtn = page.locator('button:has-text("Community")');
    await commBtn.click();
    await expect(commBtn).toHaveAttribute('aria-pressed', 'true');

    await page.fill('#event-date', '2026-10-04');
    await page.fill('#event-location', 'Seattle, WA');
    await page.fill('#guest-count', '500');
    await page.fill('#total-budget', '12000');
    await page.selectOption('#currency-select', 'USD');
    await page.fill('#accessibility-input', 'ASL interpreters, ADA wheelchair ramps');

    const submitBtn = page.locator('#generate-plan-submit-btn');
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click({ force: true });
    await expect(page).toHaveURL(/\/plan$/, { timeout: 15000 });

    // Verify Community badge
    await expect(page.locator('h1').first()).toContainText('COMMUNITY');

    // Verify Community budget categories
    await navigateWorkspace(page, 'budget');
    await expect(page.locator('text=Permits & Municipal Licensing').first()).toBeVisible();
    await expect(page.locator('text=Public Safety & First Aid').first()).toBeVisible();
    await expect(page.locator('text=Volunteer Hospitality').first()).toBeVisible();

    // Verify Community timeline phases
    await navigateWorkspace(page, 'timeline');
    await expect(page.locator('text=Planning Committee & Permits').first()).toBeVisible();
    await expect(page.locator('text=Event Day Operations').first()).toBeVisible();
  });
});
