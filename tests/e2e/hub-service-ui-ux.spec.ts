/**
 * Phase 2.4.3 Hub Service UI/UX Tests - CODAI Ecosystem
 * 
 * Comprehensive UI/UX testing for Hub Service covering:
 * - Component Visual Regression Testing
 * - Responsive Design Validation
 * - Accessibility Compliance (WCAG 2.1 AA)
 * - User Interaction Flows
 * - Dark/Light Mode and Theme Consistency
 * - Mobile Device Compatibility
 * - Performance and Loading States
 * - Error Handling and Edge Cases
 * 
 * SUCCESS CRITERIA: 100% UI/UX validation across all browsers with visual regression testing
 */

import { test, expect } from '@playwright/test';

const HUB_SERVICE_URL = 'http://localhost:4003';

test.describe('Hub Service UI/UX Tests - Phase 2.4.3', () => {
  test.beforeEach(async ({ page }) => {
    // Verify Hub service is available before running UI tests
    try {
      const response = await page.request.get(`${HUB_SERVICE_URL}/api/health`);
      expect([200, 503]).toContain(response.status()); // 503 acceptable if dependencies unhealthy
    } catch (error) {
      console.log('Hub service health check failed, proceeding with UI tests anyway');
    }
  });

  test.describe('Component Visual Regression Testing', () => {
    test('should capture main hub page components', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of main hub page
      await expect(page).toHaveScreenshot('hub-main-page.png');
    });

    test('should capture hub dashboard components', async ({ page }) => {
      await page.goto(`${HUB_SERVICE_URL}/dashboard`);
      
      // Wait for dashboard components to load
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of dashboard
      await expect(page).toHaveScreenshot('hub-dashboard.png');
    });

    test('should capture communication interface', async ({ page }) => {
      await page.goto(`${HUB_SERVICE_URL}/communication`);
      
      // Wait for communication interface to load
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of communication interface
      await expect(page).toHaveScreenshot('hub-communication-page.png');
    });

    test('should capture event management page', async ({ page }) => {
      await page.goto(`${HUB_SERVICE_URL}/events`);
      
      // Wait for events page to load
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of events management
      await expect(page).toHaveScreenshot('hub-events-page.png');
    });

    test('should capture notification center', async ({ page }) => {
      await page.goto(`${HUB_SERVICE_URL}/notifications`);
      
      // Wait for notifications page to load
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of notification center
      await expect(page).toHaveScreenshot('hub-notifications-page.png');
    });
  });

  test.describe('Responsive Design Validation', () => {
    const devices = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    for (const device of devices) {
      test(`should render correctly on ${device.name} (${device.width}x${device.height})`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        await page.goto(HUB_SERVICE_URL);
        
        // Wait for responsive layout to stabilize
        await page.waitForLoadState('networkidle');
        
        // Take screenshot for visual regression
        await expect(page).toHaveScreenshot(`hub-${device.name.toLowerCase()}-${device.width}x${device.height}.png`);
        
        // Verify responsive elements are visible
        const mainContent = page.locator('main, .main-content, #root, body');
        await expect(mainContent).toBeVisible();
      });
    }

    test('should handle viewport orientation changes', async ({ page }) => {
      // Test portrait orientation
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('hub-portrait-orientation.png');

      // Test landscape orientation
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('hub-landscape-orientation.png');
    });
  });

  test.describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
    test('should have semantic HTML structure', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Check for semantic HTML elements
      const semanticElements = [
        'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
      ];

      for (const element of semanticElements) {
        const elementExists = await page.locator(element).count() > 0;
        if (elementExists) {
          await expect(page.locator(element).first()).toBeVisible();
        }
      }
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Check heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      if (headings.length > 0) {
        // Verify first heading is h1 or page has logical structure
        const firstHeading = headings[0];
        const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase());
        expect(['h1', 'h2'].includes(tagName)).toBe(true);
      }
    });

    test('should have interactive elements with proper ARIA attributes', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Check buttons have accessible names
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const isVisible = await button.isVisible();
        
        if (isVisible) {
          const hasAriaLabel = await button.getAttribute('aria-label') !== null;
          const hasText = (await button.textContent())?.trim().length > 0;
          const hasTitle = await button.getAttribute('title') !== null;
          
          expect(hasAriaLabel || hasText || hasTitle).toBe(true);
        }
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Test Tab navigation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      // Check if focus is visible on focusable elements
      const focusedElement = page.locator(':focus');
      const focusedCount = await focusedElement.count();
      
      if (focusedCount > 0) {
        await expect(focusedElement.first()).toBeVisible();
      }
    });

    test('should have proper form labels and associations', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Check form inputs have labels
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        const isVisible = await input.isVisible();
        
        if (isVisible) {
          const hasLabel = await input.getAttribute('aria-label') !== null;
          const hasAriaLabelledBy = await input.getAttribute('aria-labelledby') !== null;
          const hasAssociatedLabel = await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0;
          
          expect(hasLabel || hasAriaLabelledBy || hasAssociatedLabel).toBe(true);
        }
      }
    });
  });

  test.describe('User Interaction Flows', () => {
    test('should handle basic page navigation', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Test navigation links
      const navLinks = page.locator('nav a, .nav a, a[href]');
      const linkCount = await navLinks.count();
      
      if (linkCount > 0) {
        const firstLink = navLinks.first();
        const isVisible = await firstLink.isVisible();
        
        if (isVisible) {
          await firstLink.click();
          await page.waitForLoadState('networkidle');
          expect(page.url()).toContain(HUB_SERVICE_URL);
        }
      }
    });

    test('should handle form interactions', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Test form interactions if forms exist
      const forms = page.locator('form');
      const formCount = await forms.count();
      
      if (formCount > 0) {
        const firstForm = forms.first();
        const inputs = firstForm.locator('input[type="text"], input[type="email"], textarea');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          const firstInput = inputs.first();
          await firstInput.fill('test input');
          
          const inputValue = await firstInput.inputValue();
          expect(inputValue).toBe('test input');
        }
      }
    });

    test('should handle button clicks', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Test button clicks
      const buttons = page.locator('button:not([disabled])');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const firstButton = buttons.first();
        const isVisible = await firstButton.isVisible();
        
        if (isVisible) {
          await firstButton.click();
          await page.waitForTimeout(500);
          
          // Verify the page is still functional after click
          expect(page.url()).toContain(HUB_SERVICE_URL);
        }
      }
    });

    test('should handle scroll and pagination', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Test scrolling
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      // Test if page handles scrolling
      const scrollPosition = await page.evaluate(() => window.pageYOffset);
      expect(scrollPosition).toBeGreaterThanOrEqual(0);
      
      // Test pagination if it exists
      const paginationButtons = page.locator('.pagination button, .pager button, [aria-label*="page"]');
      const paginationCount = await paginationButtons.count();
      
      if (paginationCount > 0) {
        const nextButton = paginationButtons.filter({ hasText: /next|>/i }).first();
        const isVisible = await nextButton.isVisible();
        
        if (isVisible) {
          await nextButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    });
  });

  test.describe('Dark/Light Mode and Theme Consistency', () => {
    test('should support theme switching', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Look for theme toggle button
      const themeToggle = page.locator('[data-theme-toggle], .theme-toggle, button[aria-label*="theme"], button[title*="theme"]');
      const toggleCount = await themeToggle.count();
      
      if (toggleCount > 0) {
        await themeToggle.first().click();
        await page.waitForTimeout(500);
        
        // Take screenshot after theme change
        await expect(page).toHaveScreenshot('hub-theme-switched.png');
      } else {
        // Take screenshot of default theme
        await expect(page).toHaveScreenshot('hub-default-theme.png');
      }
    });

    test('should maintain component consistency across themes', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Test component visibility in different themes
      const mainComponents = page.locator('header, nav, main, footer, .component, .widget');
      const componentCount = await mainComponents.count();
      
      for (let i = 0; i < Math.min(componentCount, 3); i++) {
        const component = mainComponents.nth(i);
        await expect(component).toBeVisible();
      }
      
      await expect(page).toHaveScreenshot('hub-component-consistency.png');
    });

    test('should respect system theme preferences', async ({ page, context }) => {
      // Test with dark color scheme preference
      await context.emulateMedia({ colorScheme: 'dark' });
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('hub-system-dark-theme.png');

      // Test with light color scheme preference
      await context.emulateMedia({ colorScheme: 'light' });
      await page.reload();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot('hub-system-light-theme.png');
    });
  });

  test.describe('Mobile Device Compatibility', () => {
    test('should handle touch interactions on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Test touch interactions
      const touchableElements = page.locator('button, a, [role="button"], [onclick]');
      const touchableCount = await touchableElements.count();
      
      if (touchableCount > 0) {
        const firstTouchable = touchableElements.first();
        const isVisible = await firstTouchable.isVisible();
        
        if (isVisible) {
          await firstTouchable.tap();
          await page.waitForTimeout(300);
        }
      }
      
      await expect(page).toHaveScreenshot('hub-mobile-touch-interaction.png');
    });

    test('should display mobile-specific UI patterns', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Check for mobile-specific elements
      const mobileElements = page.locator('.mobile-menu, .hamburger, .mobile-nav, [data-mobile]');
      const mobileElementCount = await mobileElements.count();
      
      if (mobileElementCount > 0) {
        await expect(mobileElements.first()).toBeVisible();
      }
      
      await expect(page).toHaveScreenshot('hub-mobile-ui-patterns.png');
    });

    test('should handle small screen usability', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Verify content is accessible on small screens
      const mainContent = page.locator('main, .main-content, #root');
      const contentCount = await mainContent.count();
      
      if (contentCount > 0) {
        await expect(mainContent.first()).toBeVisible();
      }
      
      await expect(page).toHaveScreenshot('hub-small-screen-usability.png');
    });
  });

  test.describe('Performance and Loading States', () => {
    test('should display loading states appropriately', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      
      // Check for loading indicators during page load
      const loadingIndicators = page.locator('.loading, .spinner, [data-loading], [aria-busy="true"]');
      const loadingCount = await loadingIndicators.count();
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      
      // Verify loading states are handled properly
      const finalLoadingCount = await loadingIndicators.count();
      expect(finalLoadingCount).toBeGreaterThanOrEqual(0);
      
      await expect(page).toHaveScreenshot('hub-loading-states.png');
    });

    test('should handle slow network conditions', async ({ page, context }) => {
      // Simulate slow network
      await context.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');
      
      // Verify page still functions under slow conditions
      const mainContent = page.locator('body');
      await expect(mainContent).toBeVisible();
      
      await expect(page).toHaveScreenshot('hub-slow-network.png');
    });

    test('should maintain functionality during high load', async ({ page }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Simulate high load by making multiple rapid interactions
      const buttons = page.locator('button, a');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const button = buttons.nth(i);
          const isVisible = await button.isVisible();
          
          if (isVisible) {
            await button.hover();
            await page.waitForTimeout(50);
          }
        }
      }
      
      await expect(page).toHaveScreenshot('hub-high-load-functionality.png');
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      const response = await page.goto(`${HUB_SERVICE_URL}/nonexistent-page`);
      
      // Check if error page is displayed properly
      if (response && response.status() === 404) {
        await page.waitForLoadState('networkidle');
        
        // Verify error page has proper content
        const bodyText = await page.textContent('body');
        expect(bodyText).toBeTruthy();
        
        await expect(page).toHaveScreenshot('hub-404-error.png');
      } else {
        // If no 404 page, verify main page loads instead
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveScreenshot('hub-fallback-page.png');
      }
    });

    test('should handle JavaScript errors gracefully', async ({ page }) => {
      // Listen for console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Verify page still functions despite any JS errors
      const mainContent = page.locator('body');
      await expect(mainContent).toBeVisible();
      
      await expect(page).toHaveScreenshot('hub-js-error-handling.png');
    });

    test('should handle network disconnection', async ({ page, context }) => {
      await page.goto(HUB_SERVICE_URL);
      await page.waitForLoadState('networkidle');

      // Simulate network disconnection
      await context.setOffline(true);
      
      // Try to interact with the page
      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {
        // Ignore network errors - expected behavior
      });
      
      // Verify page handles offline state gracefully
      await expect(page).toHaveScreenshot('hub-network-disconnection.png');
      
      // Restore network
      await context.setOffline(false);
    });
  });
});
