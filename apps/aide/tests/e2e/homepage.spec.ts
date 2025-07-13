import { test, expect } from '@playwright/test';

test.describe('AIDE Core Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads successfully', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/AIDE/);

    // Check main navigation elements
    await expect(page.getByRole('heading', { name: /AIDE/ })).toBeVisible();

    // Verify key sections are present
    await expect(page.getByText(/AI Development Environment/)).toBeVisible();
    await expect(page.getByText(/Intelligent Code Generation/)).toBeVisible();
    await expect(page.getByText(/Real-time Collaboration/)).toBeVisible();
  });

  test('navigation to chat interface works', async ({ page }) => {
    // Click on chat/get started button
    await page.getByRole('button', { name: /Get Started/i }).click();

    // Verify we're on the chat page
    await expect(page).toHaveURL(/\/chat/);

    // Check that chat interface elements are present
    await expect(page.getByPlaceholder(/Type your message/)).toBeVisible();
    await expect(page.getByText(/Projects/)).toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that elements are still visible and accessible
    await expect(page.getByRole('heading', { name: /AIDE/ })).toBeVisible();

    // Check mobile navigation if exists
    const mobileNav = page.locator('[data-testid="mobile-nav"]');
    if (await mobileNav.isVisible()) {
      await expect(mobileNav).toBeVisible();
    }
  });

  test('performance metrics - page load time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Expect page to load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('accessibility - keyboard navigation', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Should be able to navigate through main elements
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
  });
});
