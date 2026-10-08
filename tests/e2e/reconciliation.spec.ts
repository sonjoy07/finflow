import { test, expect } from '@playwright/test';

test.describe('Settlement Reconciliation & Discrepancy Resolution', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in as admin/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/reconciliation');
    await expect(page).toHaveURL(/\/reconciliation/);
  });

  test('displays reconciliation summary KPI cards and batch settlement table', async ({ page }) => {
    await expect(page.getByText(/total batch volume/i)).toBeVisible();
    await expect(page.getByText(/balanced settlement/i)).toBeVisible();
    await expect(page.getByText(/variance exceptions/i)).toBeVisible();

    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible();
  });

  test('opens discrepancy comparison drawer when inspecting a record', async ({ page }) => {
    const compareBtn = page.getByRole('button', { name: /compare record/i }).first();
    await expect(compareBtn).toBeVisible();
    await compareBtn.click();

    // Verify comparison drawer renders ledger vs provider
    await expect(page.getByText(/internal ledger/i)).toBeVisible();
    await expect(page.getByText(/provider settlement/i)).toBeVisible();
    await expect(page.getByText(/synthetic bank reconciliation sandbox/i)).toBeVisible();
  });
});
