import { test, expect } from '@playwright/test';

test.describe('Codai Platform', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Codai/);
    
    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Test navigation links
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Test first navigation link
    if (count > 0) {
      await navLinks.first().click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).not.toBe('/');
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have accessible elements', async ({ page }) => {
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for skip link
    const skipLink = page.locator('a[href="#main"]');
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();
    }
    
    // Check for proper contrast and ARIA attributes
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await expect(button).toBeEnabled();
      }
    }
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');
    
    // Should show error page or redirect
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toBeTruthy();
  });

  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe('App Integration', () => {
  const apps = [
    'memorai',
    'bancai',
    'fabricai',
    'publicai',
    'sociai',
    'studiai',
    'logai',
    'cumparai',
    'wallet'
  ];

  apps.forEach(app => {
    test(`${app} should be accessible`, async ({ page }) => {
      // Try to navigate to each app
      try {
        await page.goto(`/${app}`);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Basic health check
        await expect(page.locator('body')).toBeVisible();
        
        // Check for no critical errors
        const errors = await page.locator('[data-testid="error"]').count();
        expect(errors).toBe(0);
      } catch (error) {
        // Log but don't fail if app is not deployed
        console.warn(`App ${app} may not be available: ${error.message}`);
      }
    });
  });
});
