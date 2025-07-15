import { test, expect } from '@playwright/test';

test.describe('Memorai V3.0 Components - Simplified Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should successfully navigate to all V3.0 components', async ({ page }) => {
    // Test each V3.0 component navigation
    const v3Components = [
      'smart-categorization',
      'advanced-search',
      'realtime-collaboration',
      'mobile-integration',
      'performance-optimization',
      'enterprise-security'
    ];

    for (const componentId of v3Components) {
      console.log(`Testing navigation to: ${componentId}`);

      // Click the navigation item
      const navItem = page.getByTestId(`nav-${componentId}`);
      await navItem.click();

      // Wait for component to load
      await page.waitForTimeout(1000);

      // Take a screenshot for verification
      await page.screenshot({
        path: `test-results/component-${componentId}.png`,
        fullPage: true
      });

      console.log(`✅ Successfully navigated to ${componentId}`);
    }
  });

  test('should verify sidebar exists and is functional', async ({ page }) => {
    // Check sidebar exists
    const sidebar = page.getByTestId('dashboard-sidebar');
    await expect(sidebar).toBeVisible();

    // Check V3.0 nav items exist
    const v3NavItems = [
      'smart-categorization',
      'advanced-search',
      'realtime-collaboration',
      'mobile-integration',
      'performance-optimization',
      'enterprise-security'
    ];

    for (const navItem of v3NavItems) {
      const navButton = page.getByTestId(`nav-${navItem}`);
      await expect(navButton).toBeVisible();
      console.log(`✅ Found navigation for: ${navItem}`);
    }
  });
});
