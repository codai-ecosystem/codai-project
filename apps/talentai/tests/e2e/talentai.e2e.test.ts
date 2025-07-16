/**
 * 🧪 talentai End-to-End Tests
 * Complete user journey testing with Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('talentai E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/talentai/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate through main sections', async ({ page }) => {
    // Test navigation
    await page.click('[data-testid="nav-link"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should handle user interactions', async ({ page }) => {
    // Test user interactions
    await page.click('button');
    await expect(page.locator('[data-testid="result"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toBeVisible();
  });

  test('should meet accessibility standards', async ({ page }) => {
    // Basic accessibility check
    await expect(page.locator('main')).toHaveAttribute('role', 'main');
  });

  test('should handle error states', async ({ page }) => {
    // Test error handling
    await page.route('**/api/**', route => route.abort());
    await page.reload();
    await expect(page.locator('[data-testid="error"]')).toBeVisible();
  });

  test('should perform within performance budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3 second budget
  });
});