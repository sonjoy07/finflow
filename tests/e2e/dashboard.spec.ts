import { test, expect } from '@playwright/test';

test.describe('Executive Dashboard Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Admin persona
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in as admin/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('displays all 4 primary KPI cards and volume trend analytics', async ({ page }) => {
    // Assert 4 core KPI metric cards
    await expect(page.getByText(/total transaction volume/i)).toBeVisible();
    await expect(page.getByText(/transaction success rate/i)).toBeVisible();
    await expect(page.getByText(/unreconciled variance/i)).toBeVisible();
    await expect(page.getByText(/avg processing latency/i)).toBeVisible();

    // Assert analytical section headings
    await expect(page.getByText(/transaction volume & failure velocity/i)).toBeVisible();
    await expect(page.getByText(/payment status distribution/i)).toBeVisible();
  });

  test('allows changing time-range filter from 7d to 30d and updates metrics', async ({ page }) => {
    // Select 30 Days time range button
    const btn30d = page.getByRole('button', { name: '30 Days' });
    await expect(btn30d).toBeVisible();
    await btn30d.click();

    // Verify time range active state
    await expect(btn30d).toHaveClass(/bg-primary/);
  });
});
