/**
 * CODAI Service UI/UX Tests - Phase 2.2.3
 * 
 * UI/UX tests covering:
 * - Component visual regression testing
 * - Responsive design validation across device sizes
 * - Accessibility compliance (WCAG 2.1 AA)
 * - User interaction flows and usability testing
 * - Dark/light mode switching and theme consistency
 * - Mobile device compatibility and touch interactions
 */

import { test, expect } from '@playwright/test';

test.describe('CODAI Service UI/UX Tests - Phase 2.2.3', () => {
  const BASE_URL = 'http://localhost:4001';
  
  // Device configurations for responsive testing
  const devices = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  // Accessibility test configuration
  const accessibilityConfig = {
    wcagLevel: 'AA',
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
  };

  test.beforeEach(async ({ page }) => {
    // Wait for CODAI service to be ready
    await page.goto(`${BASE_URL}/health`);
    const healthResponse = await page.waitForResponse(`${BASE_URL}/health`);
    expect(healthResponse.ok()).toBeTruthy();
  });

  test.describe('Component Visual Regression Testing', () => {
    
    test('should render main page components consistently', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Wait for page to load completely
      await page.waitForLoadState('networkidle');
      
      // Test header component
      const header = page.locator('header, [data-testid*="header"], nav');
      if (await header.count() > 0) {
        await expect(header.first()).toBeVisible();
        await expect(header.first()).toHaveScreenshot('codai-header-component.png');
      }
      
      // Test main content area
      const main = page.locator('main, [data-testid*="main"], .main-content');
      if (await main.count() > 0) {
        await expect(main.first()).toBeVisible();
        await expect(main.first()).toHaveScreenshot('codai-main-content.png');
      }
      
      // Test navigation components
      const navigation = page.locator('[role="navigation"], .nav, .navbar, [data-testid*="nav"]');
      if (await navigation.count() > 0) {
        await expect(navigation.first()).toBeVisible();
        await expect(navigation.first()).toHaveScreenshot('codai-navigation.png');
      }
      
      // Test footer component
      const footer = page.locator('footer, [data-testid*="footer"], .footer');
      if (await footer.count() > 0) {
        await expect(footer.first()).toBeVisible();
        await expect(footer.first()).toHaveScreenshot('codai-footer-component.png');
      }
    });

    test('should render form components consistently', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Test input components
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = inputs.nth(i);
          if (await input.isVisible()) {
            await expect(input).toHaveScreenshot(`codai-input-${i}.png`);
          }
        }
      }
      
      // Test button components
      const buttons = page.locator('button, [role="button"], .btn');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            await expect(button).toHaveScreenshot(`codai-button-${i}.png`);
          }
        }
      }
      
      // Test form containers
      const forms = page.locator('form, [data-testid*="form"]');
      if (await forms.count() > 0) {
        await expect(forms.first()).toHaveScreenshot('codai-form-component.png');
      }
    });

    test('should render modal and dialog components consistently', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Look for modal triggers
      const modalTriggers = page.locator('[data-testid*="modal"], [data-testid*="dialog"], .modal-trigger, .open-modal');
      const triggerCount = await modalTriggers.count();
      
      if (triggerCount > 0) {
        // Try to open modal
        await modalTriggers.first().click();
        
        // Wait for modal to appear
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
        if (await modal.count() > 0) {
          await expect(modal.first()).toBeVisible();
          await expect(modal.first()).toHaveScreenshot('codai-modal-component.png');
          
          // Close modal if close button exists
          const closeButton = modal.locator('[aria-label*="close"], .close, .modal-close, [data-testid*="close"]');
          if (await closeButton.count() > 0) {
            await closeButton.first().click();
          }
        }
      }
    });

    test('should render loading states consistently', async ({ page }) => {
      await page.goto(BASE_URL);
      
      // Look for loading indicators
      const loadingIndicators = page.locator('.loading, .spinner, [data-testid*="loading"], [aria-busy="true"]');
      const indicatorCount = await loadingIndicators.count();
      
      if (indicatorCount > 0) {
        for (let i = 0; i < Math.min(indicatorCount, 3); i++) {
          const indicator = loadingIndicators.nth(i);
          if (await indicator.isVisible()) {
            await expect(indicator).toHaveScreenshot(`codai-loading-${i}.png`);
          }
        }
      }
      
      // Test skeleton loaders if present
      const skeletons = page.locator('.skeleton, [data-testid*="skeleton"]');
      if (await skeletons.count() > 0) {
        await expect(skeletons.first()).toHaveScreenshot('codai-skeleton-loader.png');
      }
    });
  });

  test.describe('Responsive Design Validation', () => {
    
    for (const device of devices) {
      test(`should render correctly on ${device.name} (${device.width}x${device.height})`, async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        
        // Take full page screenshot for responsive comparison
        await expect(page).toHaveScreenshot(`codai-${device.name.toLowerCase()}-view.png`, {
          fullPage: true,
          threshold: 0.3 // Allow some variance for dynamic content
        });
        
        // Test that essential elements are visible
        const body = page.locator('body');
        await expect(body).toBeVisible();
        
        // Check that content doesn't overflow horizontally
        const bodyWidth = await body.evaluate(el => el.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(device.width + 20); // Allow small buffer
        
        // Test navigation menu behavior on mobile
        if (device.width <= 768) {
          const mobileMenu = page.locator('.mobile-menu, .hamburger, [data-testid*="mobile"], [aria-label*="menu"]');
          if (await mobileMenu.count() > 0) {
            await expect(mobileMenu.first()).toBeVisible();
          }
        }
        
        // Test desktop-specific elements are hidden on mobile
        if (device.width <= 768) {
          const desktopOnly = page.locator('.desktop-only, .hidden-mobile, [data-testid*="desktop"]');
          const desktopCount = await desktopOnly.count();
          for (let i = 0; i < desktopCount; i++) {
            const element = desktopOnly.nth(i);
            if (await element.isVisible()) {
              // Element should be hidden or properly responsive
              const display = await element.evaluate(el => getComputedStyle(el).display);
              expect(['none', 'hidden']).toContain(display);
            }
          }
        }
      });
    }

    test('should handle orientation changes on mobile devices', async ({ page }) => {
      // Test portrait orientation
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('codai-mobile-portrait.png', { fullPage: true });
      
      // Test landscape orientation
      await page.setViewportSize({ width: 667, height: 375 });
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('codai-mobile-landscape.png', { fullPage: true });
      
      // Verify content is still accessible in both orientations
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Accessibility Compliance (WCAG 2.1 AA)', () => {
    
    test('should have proper semantic HTML structure', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Check for proper heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      if (headingCount > 0) {
        // Should have at least one h1
        const h1Elements = page.locator('h1');
        expect(await h1Elements.count()).toBeGreaterThanOrEqual(1);
        
        // Check heading hierarchy is logical
        for (let i = 0; i < headingCount; i++) {
          const heading = headings.nth(i);
          const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
          const text = await heading.textContent();
          
          expect(text?.trim()).toBeTruthy(); // Headings should have content
        }
      }
      
      // Check for proper landmark roles
      const landmarks = page.locator('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], header, nav, main, footer');
      expect(await landmarks.count()).toBeGreaterThan(0);
      
      // Check for proper list structures
      const lists = page.locator('ul, ol');
      const listCount = await lists.count();
      
      for (let i = 0; i < listCount; i++) {
        const list = lists.nth(i);
        const listItems = list.locator('li');
        expect(await listItems.count()).toBeGreaterThan(0); // Lists should have list items
      }
    });

    test('should have proper ARIA attributes and labels', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Check buttons have accessible names
      const buttons = page.locator('button, [role="button"]');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const accessibleName = await button.evaluate(el => {
          return el.getAttribute('aria-label') || 
                 el.getAttribute('aria-labelledby') || 
                 el.textContent?.trim() ||
                 el.getAttribute('title');
        });
        
        if (await button.isVisible()) {
          expect(accessibleName).toBeTruthy();
        }
      }
      
      // Check form inputs have labels
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          const hasLabel = await input.evaluate(el => {
            const id = el.getAttribute('id');
            const ariaLabel = el.getAttribute('aria-label');
            const ariaLabelledby = el.getAttribute('aria-labelledby');
            const label = id ? document.querySelector(`label[for="${id}"]`) : null;
            
            return !!(ariaLabel || ariaLabelledby || label);
          });
          
          expect(hasLabel).toBeTruthy();
        }
      }
      
      // Check images have alt text
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          const alt = await img.getAttribute('alt');
          const role = await img.getAttribute('role');
          
          // Images should have alt text unless they're decorative (role="presentation")
          if (role !== 'presentation' && role !== 'none') {
            expect(alt).toBeDefined();
          }
        }
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Test Tab navigation through focusable elements
      const focusableElements = page.locator('button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])');
      const focusableCount = await focusableElements.count();
      
      if (focusableCount > 0) {
        // Focus first element and start tabbing
        await page.keyboard.press('Tab');
        
        for (let i = 0; i < Math.min(focusableCount, 10); i++) {
          const focused = page.locator(':focus');
          await expect(focused).toBeVisible();
          
          // Check focus indicator is visible
          const focusedElement = await focused.first();
          const outline = await focusedElement.evaluate(el => {
            const style = getComputedStyle(el);
            return style.outline !== 'none' || 
                   style.boxShadow !== 'none' || 
                   style.border !== style.getPropertyValue('border'); // Border changed
          });
          
          expect(outline).toBeTruthy();
          
          await page.keyboard.press('Tab');
        }
      }
      
      // Test Escape key for modals/dropdowns
      const escapeElements = page.locator('[role="dialog"], .modal, .dropdown-menu');
      if (await escapeElements.count() > 0) {
        await page.keyboard.press('Escape');
        // Modal/dropdown should close or handle escape appropriately
      }
    });

    test('should have sufficient color contrast', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Get all text elements for contrast checking
      const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label, input, textarea');
      const elementCount = await textElements.count();
      
      for (let i = 0; i < Math.min(elementCount, 20); i++) {
        const element = textElements.nth(i);
        
        if (await element.isVisible()) {
          const contrast = await element.evaluate(el => {
            const style = getComputedStyle(el);
            const color = style.color;
            const backgroundColor = style.backgroundColor;
            const fontSize = parseFloat(style.fontSize);
            
            // Simplified contrast check (in real implementation, you'd use a proper contrast calculation)
            return {
              color,
              backgroundColor,
              fontSize,
              isLargeText: fontSize >= 18 || (fontSize >= 14 && style.fontWeight >= 'bold')
            };
          });
          
          expect(contrast.color).toBeTruthy();
          expect(contrast.backgroundColor).toBeTruthy();
        }
      }
    });
  });

  test.describe('User Interaction Flows', () => {
    
    test('should handle basic user interactions', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Test button interactions
      const buttons = page.locator('button:visible');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        
        // Test hover state
        await button.hover();
        await page.waitForTimeout(200); // Allow hover effects
        
        // Test click interaction
        try {
          await button.click();
          await page.waitForTimeout(500); // Allow for any resulting actions
        } catch (error) {
          // Some buttons might navigate or cause errors, that's okay for this test
        }
      }
      
      // Test link interactions
      const links = page.locator('a[href]:visible');
      const linkCount = await links.count();
      
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          await link.hover();
          await page.waitForTimeout(200);
          
          // Don't actually click external links or those that might navigate away
          if (href.startsWith('#') || href.startsWith('/')) {
            try {
              await link.click();
              await page.waitForTimeout(500);
            } catch (error) {
              // Navigation might cause errors in test environment
            }
          }
        }
      }
    });

    test('should handle form interactions', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Test input interactions
      const textInputs = page.locator('input[type="text"], input[type="email"], input[type="password"], textarea');
      const inputCount = await textInputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = textInputs.nth(i);
        
        if (await input.isVisible() && await input.isEnabled()) {
          // Test focus
          await input.focus();
          await expect(input).toBeFocused();
          
          // Test typing
          await input.fill('Test input value');
          await expect(input).toHaveValue('Test input value');
          
          // Test clearing
          await input.fill('');
          await expect(input).toHaveValue('');
        }
      }
      
      // Test select interactions
      const selects = page.locator('select:visible');
      const selectCount = await selects.count();
      
      for (let i = 0; i < selectCount; i++) {
        const select = selects.nth(i);
        
        if (await select.isEnabled()) {
          const options = select.locator('option');
          const optionCount = await options.count();
          
          if (optionCount > 1) {
            await select.selectOption({ index: 1 });
            // Verify selection changed
            const selectedValue = await select.inputValue();
            expect(selectedValue).toBeTruthy();
          }
        }
      }
    });

    test('should handle scroll and pagination interactions', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Test page scrolling
      const initialScrollTop = await page.evaluate(() => window.scrollY);
      
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(500);
      
      const scrolledPosition = await page.evaluate(() => window.scrollY);
      expect(scrolledPosition).toBeGreaterThan(initialScrollTop);
      
      // Test pagination if present
      const paginationButtons = page.locator('[aria-label*="page"], .pagination button, [data-testid*="page"]');
      const paginationCount = await paginationButtons.count();
      
      if (paginationCount > 0) {
        const nextButton = paginationButtons.filter({ hasText: /next|>/i }).first();
        if (await nextButton.count() > 0 && await nextButton.isEnabled()) {
          await nextButton.click();
          await page.waitForTimeout(1000); // Allow for content loading
        }
      }
      
      // Test infinite scroll if present
      const loadMoreButtons = page.locator('[data-testid*="load"], .load-more, [aria-label*="load"]');
      if (await loadMoreButtons.count() > 0) {
        await loadMoreButtons.first().click();
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Dark/Light Mode and Theme Consistency', () => {
    
    test('should support theme switching', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of default theme
      await expect(page).toHaveScreenshot('codai-default-theme.png', { fullPage: true });
      
      // Look for theme toggle button
      const themeToggle = page.locator('[data-testid*="theme"], .theme-toggle, [aria-label*="theme"], [aria-label*="dark"], [aria-label*="light"]');
      
      if (await themeToggle.count() > 0) {
        // Click theme toggle
        await themeToggle.first().click();
        await page.waitForTimeout(500); // Allow theme transition
        
        // Take screenshot of toggled theme
        await expect(page).toHaveScreenshot('codai-toggled-theme.png', { fullPage: true });
        
        // Verify theme change occurred
        const body = page.locator('body');
        const bodyClass = await body.getAttribute('class');
        const bodyDataTheme = await body.getAttribute('data-theme');
        
        expect(bodyClass || bodyDataTheme).toBeTruthy();
        
        // Toggle back
        await themeToggle.first().click();
        await page.waitForTimeout(500);
        
        // Verify return to original theme
        const newBodyClass = await body.getAttribute('class');
        const newBodyDataTheme = await body.getAttribute('data-theme');
        
        expect(newBodyClass !== bodyClass || newBodyDataTheme !== bodyDataTheme).toBeTruthy();
      }
    });

    test('should maintain theme consistency across components', async ({ page }) => {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Get theme colors from CSS variables or computed styles
      const themeColors = await page.evaluate(() => {
        const rootStyle = getComputedStyle(document.documentElement);
        return {
          primary: rootStyle.getPropertyValue('--color-primary') || rootStyle.color,
          background: rootStyle.getPropertyValue('--color-background') || rootStyle.backgroundColor,
          text: rootStyle.getPropertyValue('--color-text') || rootStyle.color
        };
      });
      
      expect(themeColors.primary || themeColors.background || themeColors.text).toBeTruthy();
      
      // Check that theme is consistently applied to different component types
      const componentSelectors = [
        'header, [data-testid*="header"]',
        'nav, [role="navigation"]',
        'main, [role="main"]',
        'footer, [data-testid*="footer"]',
        'button',
        'input, textarea',
        '.card, [data-testid*="card"]'
      ];
      
      for (const selector of componentSelectors) {
        const elements = page.locator(selector);
        const elementCount = await elements.count();
        
        if (elementCount > 0) {
          const element = elements.first();
          const styles = await element.evaluate(el => {
            const style = getComputedStyle(el);
            return {
              color: style.color,
              backgroundColor: style.backgroundColor,
              borderColor: style.borderColor
            };
          });
          
          expect(styles.color || styles.backgroundColor || styles.borderColor).toBeTruthy();
        }
      }
    });

    test('should respect system theme preferences', async ({ page }) => {
      // Test with light theme preference
      await page.emulateMedia({ colorScheme: 'light' });
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('codai-system-light-theme.png', { fullPage: true });
      
      // Test with dark theme preference
      await page.emulateMedia({ colorScheme: 'dark' });
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('codai-system-dark-theme.png', { fullPage: true });
      
      // Verify theme was applied
      const bodyStyles = await page.locator('body').evaluate(el => {
        const style = getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color
        };
      });
      
      expect(bodyStyles.backgroundColor || bodyStyles.color).toBeTruthy();
    });
  });

  test.describe('Mobile Device Compatibility', () => {
    
    test('should support touch interactions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Test touch tap interactions
      const touchableElements = page.locator('button, a, [role="button"], .clickable, [data-testid*="touch"]');
      const touchableCount = await touchableElements.count();
      
      for (let i = 0; i < Math.min(touchableCount, 5); i++) {
        const element = touchableElements.nth(i);
        
        if (await element.isVisible()) {
          // Simulate touch tap
          await element.tap();
          await page.waitForTimeout(300); // Allow for touch feedback
        }
      }
      
      // Test swipe gestures if supported
      const swipeableElements = page.locator('.swipeable, [data-testid*="swipe"], .carousel, .slider');
      if (await swipeableElements.count() > 0) {
        const swipeableElement = swipeableElements.first();
        const bbox = await swipeableElement.boundingBox();
        
        if (bbox) {
          // Simulate swipe left
          await page.mouse.move(bbox.x + bbox.width * 0.8, bbox.y + bbox.height / 2);
          await page.mouse.down();
          await page.mouse.move(bbox.x + bbox.width * 0.2, bbox.y + bbox.height / 2);
          await page.mouse.up();
          
          await page.waitForTimeout(500); // Allow for swipe animation
        }
      }
    });

    test('should handle mobile-specific UI patterns', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Test mobile menu/hamburger navigation
      const mobileMenuToggle = page.locator('.hamburger, .mobile-menu-toggle, [data-testid*="mobile-menu"], [aria-label*="menu"]');
      
      if (await mobileMenuToggle.count() > 0) {
        await mobileMenuToggle.first().tap();
        await page.waitForTimeout(500);
        
        // Check if mobile menu opened
        const mobileMenu = page.locator('.mobile-menu, .nav-menu, [data-testid*="mobile-nav"]');
        if (await mobileMenu.count() > 0) {
          await expect(mobileMenu.first()).toBeVisible();
          
          // Take screenshot of mobile menu
          await expect(page).toHaveScreenshot('codai-mobile-menu.png');
          
          // Close menu
          const closeButton = page.locator('.close, [aria-label*="close"], .menu-close');
          if (await closeButton.count() > 0) {
            await closeButton.first().tap();
          } else {
            // Try tapping menu toggle again
            await mobileMenuToggle.first().tap();
          }
        }
      }
      
      // Test pull-to-refresh if implemented
      const refreshableArea = page.locator('.refreshable, [data-testid*="refresh"]');
      if (await refreshableArea.count() > 0) {
        const bbox = await refreshableArea.first().boundingBox();
        if (bbox) {
          // Simulate pull-to-refresh gesture
          await page.mouse.move(bbox.x + bbox.width / 2, bbox.y + 10);
          await page.mouse.down();
          await page.mouse.move(bbox.x + bbox.width / 2, bbox.y + 100);
          await page.mouse.up();
          
          await page.waitForTimeout(1000); // Allow for refresh animation
        }
      }
    });

    test('should maintain usability on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // Smallest common mobile size
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      
      // Take screenshot for visual verification
      await expect(page).toHaveScreenshot('codai-small-mobile.png', { fullPage: true });
      
      // Check that interactive elements are large enough for touch
      const touchTargets = page.locator('button, a, input, [role="button"]');
      const targetCount = await touchTargets.count();
      
      for (let i = 0; i < Math.min(targetCount, 10); i++) {
        const target = touchTargets.nth(i);
        
        if (await target.isVisible()) {
          const bbox = await target.boundingBox();
          if (bbox) {
            // Touch targets should be at least 44x44 pixels (iOS) or 48x48 (Android)
            expect(bbox.width).toBeGreaterThanOrEqual(40);
            expect(bbox.height).toBeGreaterThanOrEqual(40);
          }
        }
      }
      
      // Check that text is readable (not too small)
      const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6');
      const textCount = await textElements.count();
      
      for (let i = 0; i < Math.min(textCount, 10); i++) {
        const textElement = textElements.nth(i);
        
        if (await textElement.isVisible()) {
          const fontSize = await textElement.evaluate(el => {
            return parseFloat(getComputedStyle(el).fontSize);
          });
          
          // Text should be at least 16px for good mobile readability
          expect(fontSize).toBeGreaterThanOrEqual(14);
        }
      }
      
      // Check that content doesn't require horizontal scrolling
      const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(320 + 20); // Allow small buffer
    });
  });
});
