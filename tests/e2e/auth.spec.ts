import { test, expect } from '@playwright/test';

test.describe('Authentication and Persona Authorization Journey', () => {
  test('redirects unauthenticated visitors to login page with from parameter', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?from=%2Fdashboard/);

    // Verify brand title and login form elements
    await expect(page.getByRole('heading', { name: /sign in to finflow/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in as admin/i })).toBeVisible();
  });

  test('allows logging in with pre-selected Admin persona', async ({ page }) => {
    await page.goto('/login');

    // Click Sign In button
    const submitBtn = page.getByRole('button', { name: /sign in as admin/i });
    await submitBtn.click();

    // Verify successful redirect into the main dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /operational dashboard/i })).toBeVisible();

    // Verify current persona in Topbar
    const personaButton = page.getByRole('button', { name: /current persona/i });
    await expect(personaButton).toBeVisible();
    await expect(personaButton).toContainText('Sarah Connor');
  });

  test('allows switching persona to Operations Manager from topbar', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in as admin/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Open operator persona dropdown
    const personaButton = page.getByRole('button', { name: /current persona/i });
    await personaButton.click();

    // Select Elena Vance (Operations Manager)
    const opsLeadItem = page.getByRole('menuitem', { name: /Elena Vance/i });
    await opsLeadItem.click();

    // Verify updated persona badge in topbar
    await expect(personaButton).toContainText('Elena Vance');
    await expect(personaButton).toContainText('Operations Manager');
  });
});
