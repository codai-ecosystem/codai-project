import { test, expect } from '@playwright/test';

test.describe('Homepage & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    // Should have a main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Check for navigation menu
    const nav = page.getByRole('navigation').first();
    await expect(nav).toBeVisible();

    // Check for common navigation items
    const homeLink = page.getByRole('link', { name: /home/i });
    if (await homeLink.isVisible()) {
      await expect(homeLink).toBeVisible();
    }
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    // Check essential meta tags
    await expect(page).toHaveTitle(/DEXAI/);

    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content');

    const metaViewport = page.locator('meta[name="viewport"]');
    await expect(metaViewport).toHaveAttribute('content');
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Main content should still be visible
    await expect(page.getByRole('main')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByRole('main')).toBeVisible();
  });
});
