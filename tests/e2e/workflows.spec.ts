import { test, expect } from '@playwright/test';

test.describe('Workflow Automation & Rule Authoring', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in as admin/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.goto('/workflows');
    await expect(page).toHaveURL(/\/workflows/);
  });

  test('displays configured automation rules with execution stats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /workflow automation/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /new workflow/i })).toBeVisible();

    const workflowCards = page.locator('article, .rounded-xl');
    await expect(workflowCards.first()).toBeVisible();
  });

  test('opens workflow builder modal and renders dynamic condition controls', async ({ page }) => {
    await page.getByRole('button', { name: /new workflow/i }).click();

    // Verify modal elements
    await expect(page.getByRole('heading', { name: /author automation rule/i })).toBeVisible();
    await expect(page.getByLabel(/rule name/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /add condition/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /add action/i })).toBeVisible();

    // Cancel modal
    await page.getByRole('button', { name: /cancel/i }).click();
  });
});
