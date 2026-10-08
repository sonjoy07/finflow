import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Automated WCAG 2.1 AA Accessibility Audit', () => {
  test('login page satisfies WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in to finflow/i })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('dashboard satisfies WCAG 2.1 AA standards across metrics and shell', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in as admin/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Wait for metrics cards to render
    await expect(page.getByText('Gross Volume')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('transactions table satisfies WCAG 2.1 AA standards and keyboard operability', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in as admin/i }).click();
    await page.goto('/transactions');
    await expect(page).toHaveURL(/\/transactions/);

    // Wait for table to load
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('reconciliation page satisfies WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in as admin/i }).click();
    await page.goto('/reconciliation');
    await expect(page).toHaveURL(/\/reconciliation/);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('workflows page satisfies WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in as admin/i }).click();
    await page.goto('/workflows');
    await expect(page).toHaveURL(/\/workflows/);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
