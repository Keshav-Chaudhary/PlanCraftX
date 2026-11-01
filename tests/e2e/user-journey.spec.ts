import { test, expect, type Page } from '@playwright/test';

async function navigateWorkspace(page: Page, tabId: string) {
  const menuToggle = page.locator('#workspace-menu-toggle');
  if (await menuToggle.isVisible()) {
    const isExpanded = (await menuToggle.getAttribute('aria-expanded')) === 'true';
    if (!isExpanded) {
      await menuToggle.click();
      await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    }
  }
  const link = page.locator(`#nav-${tabId}`);
  await expect(link).toBeVisible();
  await link.click();
}

test.describe('End-to-End Core Planning Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure fresh session
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('completes full wedding planning journey across all required routes', async ({ page }) => {
    test.setTimeout(60000);
    // 1. Landing Page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('GenAI Event Planning Assistant');
    const startBtn = page.locator('#start-planning-btn');
    await expect(startBtn).toBeVisible();

    // 2. Navigate to /plan (Fresh state shows empty state)
    await startBtn.click();
    await expect(page).toHaveURL(/\/plan/);
    await expect(page.locator('#empty-plan-heading')).toBeVisible();
    await expect(page.locator('text=Welcome to PlanCraftX Workspace')).toBeVisible();

    // 3. Navigate to Event Setup Wizard
    const createBtn = page.locator('#empty-state-create-btn');
    await createBtn.click();
    await expect(page).toHaveURL(/\/plan\/event/);

    // 4. Fill Event Setup Form (Wedding)
    const weddingBtn = page.locator('button:has-text("Wedding")');
    await weddingBtn.click();
    await expect(weddingBtn).toHaveAttribute('aria-pressed', 'true');

    await page.fill('#event-date', '2026-11-20');
    await page.fill('#event-location', 'Chicago, IL');
    await page.fill('#guest-count', '120');
    await page.fill('#total-budget', '25000');
    await page.selectOption('#currency-select', 'USD');
    await page.check('#is-outdoor');
    await page.fill('#dietary-input', 'Vegetarian, Nut-Free');
    await page.fill('#accessibility-input', 'Wheelchair Ramps');
    await page.fill('#priorities-input', 'Focus on live acoustic music');

    // 5. Submit Event Creation
    const submitBtn = page.locator('#generate-plan-submit-btn');
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click({ force: true });

    // 6. Verify Redirection to /plan with Active Plan Overview
    await expect(page).toHaveURL(/\/plan\/?$/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Planning: Chicago, IL');
    await expect(page.locator('text=Outdoor Venue')).toBeVisible();
    await expect(page.locator('#quick-link-budget')).toBeVisible();

    // 7. Verify Budget Planner route and sum invariants
    await navigateWorkspace(page, 'budget');
    await expect(page).toHaveURL(/\/plan\/budget/);
    await expect(page.locator('h1')).toContainText('Budget Planner');
    await expect(page.locator('text=Venue & Reception').first()).toBeVisible();

    // Edit an allocation and verify rebalancing
    const editBtn = page.locator('button:has-text("Edit & Rebalance")').first();
    await editBtn.click();
    const allocInput = page.locator('input[aria-label*="Edit allocated amount"]').first();
    await expect(allocInput).toBeVisible();
    await allocInput.fill('11500');
    await page.locator('button:has-text("Save")').click();
    await expect(page.locator('text=11,500.00 USD')).toBeVisible();

    // Refresh page to verify persistence across page reload
    await page.reload();
    await expect(page.locator('h1')).toContainText('Budget Planner');
    await expect(page.locator('text=11,500.00 USD')).toBeVisible();

    // 8. Verify Timeline & Milestones route
    await navigateWorkspace(page, 'timeline');
    await expect(page).toHaveURL(/\/plan\/timeline/);
    await expect(page.locator('h1')).toContainText('Timeline & Milestones');
    await expect(page.locator('text=Vision & Budget Alignment').first()).toBeVisible();

    // Toggle milestone status button and verify persistence
    const milestoneStatusBtn = page.locator('button:has-text("○ Pending")').first();
    await milestoneStatusBtn.click();
    await expect(page.locator('button:has-text("⏳ In Progress")').first()).toBeVisible();
    await page.reload();
    await expect(page.locator('button:has-text("⏳ In Progress")').first()).toBeVisible();

    // Test status filter dropdown
    await page.selectOption('#timeline-status-filter', 'in_progress');
    await expect(page.locator('button:has-text("⏳ In Progress")').first()).toBeVisible();

    // Test RFC 5545 .ics calendar export download
    const icsBtn = page.locator('#export-ics-btn');
    await icsBtn.scrollIntoViewIfNeeded();
    const icsPromise = page.waitForEvent('download');
    await icsBtn.click({ force: true });
    const icsDownload = await icsPromise;
    expect(icsDownload.suggestedFilename()).toContain('.ics');

    // 9. Verify Vendor Checklist route
    await navigateWorkspace(page, 'vendors');
    await expect(page).toHaveURL(/\/plan\/vendors/);
    await expect(page.locator('h1')).toContainText('Vendor Checklist');
    await expect(page.locator('strong:has-text("Required: Catering & Bar")')).toBeVisible();

    // Test vendor category filter dropdown
    await page.selectOption('#vendor-cat-filter', 'all');

    // 10. Verify AI Ideas route
    await navigateWorkspace(page, 'ideas');
    await expect(page).toHaveURL(/\/plan\/ideas/);
    await expect(page.locator('h1')).toContainText('Personalized Event Ideas');

    // Test ideas category filter dropdown
    await page.selectOption('#idea-category-filter', 'all');

    // 11. Verify AI Assistant route
    await navigateWorkspace(page, 'assistant');
    await expect(page).toHaveURL(/\/plan\/assistant/);
    await expect(page.locator('h1')).toContainText('GenAI Planning Assistant');
    await expect(page.locator('text=Outdoor Event Weather Forecast')).toBeVisible();

    // Submit a chat message
    const chatInput = page.locator('#chat-assistant-input');
    await chatInput.fill('What are the key preparation steps?');
    const sendBtn = page.locator('button[type="submit"]:has-text("Send")');
    await sendBtn.scrollIntoViewIfNeeded();
    await sendBtn.click({ force: true });
    await expect(page.locator('text=What are the key preparation steps?')).toBeVisible();

    // 12. Verify Export & Portability route
    await navigateWorkspace(page, 'export');
    await expect(page).toHaveURL(/\/plan\/export/);
    await expect(page.locator('h1')).toContainText('Export, Portability & Backups');
    await expect(page.locator('#export-json-btn')).toBeVisible();

    // Test JSON plan export download
    const jsonPromise = page.waitForEvent('download');
    await page.click('#export-json-btn');
    const jsonDownload = await jsonPromise;
    expect(jsonDownload.suggestedFilename()).toContain('wedding-plan.json');

    // 13. Verify Privacy Settings & Data Purge with Modal Cancel/Confirm
    await page.goto('/settings/privacy');
    await expect(page.locator('h1')).toContainText('Privacy Policy & Data Ownership');
    await expect(page.locator('#privacy-delete-all-btn')).toBeVisible();

    // Trigger delete confirmation modal
    const deleteBtn = page.locator('#privacy-delete-all-btn');
    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.click({ force: true });
    await expect(page.locator('#confirm-delete-title')).toBeVisible();

    // Test modal cancellation
    await page.click('#confirm-delete-cancel-btn');
    await expect(page.locator('#confirm-delete-title')).toHaveCount(0);

    // Re-trigger and confirm deletion
    await deleteBtn.click({ force: true });
    await page.click('#confirm-delete-final-btn', { force: true });
    await expect(
      page.locator('text=All local PlanCraftX data has been permanently cleared'),
    ).toBeVisible();

    // Navigate back to /plan and verify workspace is completely cleared
    await page.goto('/plan');
    await expect(page.locator('#empty-plan-heading')).toBeVisible();
  });
});
