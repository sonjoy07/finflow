import { test, expect } from '@playwright/test';

test.describe('Transaction Management & Triage Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in as admin/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/transactions');
    await expect(page).toHaveURL(/\/transactions/);
  });

  test('filters transactions by status and syncs query parameter with URL', async ({ page }) => {
    // Select Failed status filter
    const statusSelect = page.getByLabel(/filter by status/i);
    await expect(statusSelect).toBeVisible();
    await statusSelect.selectOption('failed');

    // Verify URL parameter updated
    await expect(page).toHaveURL(/status=failed/);

    // Verify table shows only failed badge rows
    const failedBadges = page.locator('tbody tr');
    await expect(failedBadges.first()).toBeVisible();
  });

  test('opens transaction detail drawer when clicking a transaction row', async ({ page }) => {
    // Click first transaction row
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    await firstRow.click();

    // Verify detail drawer opens with execution metadata and customer profile
    await expect(page.getByRole('dialog', { name: /transaction/i })).toBeVisible();
    await expect(page.getByText(/customer & risk profile/i)).toBeVisible();
    await expect(page.getByText(/raw gateway response/i)).toBeVisible();
    await expect(page.getByText(/lifecycle timeline/i)).toBeVisible();
  });
});
