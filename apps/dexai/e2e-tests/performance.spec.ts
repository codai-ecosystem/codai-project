import { test, expect } from '@playwright/test';

test.describe('Performance & SEO', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load quickly (under 3 seconds)
    expect(loadTime).toBeLessThan(3000);

    // Check for key performance indicators
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    await page.goto('/');

    // Check essential meta tags
    await expect(page).toHaveTitle(/DEXAI/);

    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content');

    const metaViewport = page.locator('meta[name="viewport"]');
    await expect(metaViewport).toHaveAttribute('content');
  });

  test('should have Open Graph meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for Open Graph tags count
    const ogTagsCount = await page.locator('meta[property^="og:"]').count();
    expect(ogTagsCount).toBeGreaterThan(0);
  });

  test('should have proper caching headers', async ({ page }) => {
    const response = await page.goto('/');

    // Check that the response includes caching headers
    const cacheControl = response?.headers()['cache-control'];
    expect(cacheControl).toBeDefined();
  });
});
