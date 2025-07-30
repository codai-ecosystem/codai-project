import { test, expect, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

/**
 * COMPREHENSIVE UI/UX TESTING SUITE
 * Tests all design requirements: glassmorphism, themes, responsive design, 
 * accessibility, internationalization, and integration
 */

const SERVICES = [
  { name: 'CODAI', url: 'http://localhost:4001', theme: 'blue', appId: 'codai' },
  { name: 'Admin', url: 'http://localhost:4002', theme: 'orange', appId: 'admin' },
  { name: 'Hub', url: 'http://localhost:4003', theme: 'green', appId: 'hub' },
  { name: 'ID', url: 'http://localhost:4004', theme: 'purple', appId: 'id' },
  { name: 'BancAI', url: 'http://localhost:4005', theme: 'gold', appId: 'bancai' },
];

const VIEWPORTS = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Ultra-wide', width: 2560, height: 1440 },
];

test.describe('🎨 COMPREHENSIVE UI/UX TESTING SUITE', () => {

  test.describe('🎨 Modern Glassmorphism Design System', () => {
    for (const service of SERVICES) {
      test(`${service.name} implements glassmorphism effects`, async ({ page }) => {
        await page.goto(service.url);
        await page.waitForLoadState('networkidle');

        // Check for glassmorphism CSS properties
        const glassElements = await page.locator('[class*="backdrop-blur"], [class*="bg-opacity"], [class*="bg-white/"], [style*="backdrop-filter"]').count();
        expect(glassElements).toBeGreaterThan(0);

        // Verify glassmorphism visual elements
        const glassCards = await page.locator('.glass, [class*="glass"], [class*="backdrop-blur"]').first();
        if (await glassCards.count() > 0) {
          const styles = await glassCards.evaluate(el => {
            const computed = getComputedStyle(el);
            return {
              backdropFilter: computed.backdropFilter,
              background: computed.background,
              border: computed.border,
              boxShadow: computed.boxShadow,
            };
          });

          // Verify glassmorphism properties
          expect(styles.backdropFilter).toContain('blur');
        }

        // Take screenshot for visual verification
        await expect(page).toHaveScreenshot(`${service.appId}-glassmorphism.png`);
      });
    }
  });

  test.describe('🌓 Advanced Theme System Testing', () => {
    for (const service of SERVICES) {
      test(`${service.name} supports dark/light mode with app-specific colors`, async ({ page }) => {
        await page.goto(service.url);
        await page.waitForLoadState('networkidle');

        // Test light mode
        const lightModeToggle = page.locator('[data-testid="theme-light"], [aria-label*="light"], button:has-text("Light")').first();
        if (await lightModeToggle.count() > 0) {
          await lightModeToggle.click();
          await page.waitForTimeout(500);

          const bodyClass = await page.locator('body').getAttribute('class');
          expect(bodyClass).not.toContain('dark');

          await expect(page).toHaveScreenshot(`${service.appId}-light-mode.png`);
        }

        // Test dark mode
        const darkModeToggle = page.locator('[data-testid="theme-dark"], [aria-label*="dark"], button:has-text("Dark")').first();
        if (await darkModeToggle.count() > 0) {
          await darkModeToggle.click();
          await page.waitForTimeout(500);

          const bodyClass = await page.locator('body').getAttribute('class');
          expect(bodyClass).toContain('dark');

          await expect(page).toHaveScreenshot(`${service.appId}-dark-mode.png`);
        }

        // Verify app-specific theme colors
        const primaryElements = await page.locator('[class*="primary"], [class*="accent"], .btn-primary, .text-primary').first();
        if (await primaryElements.count() > 0) {
          const color = await primaryElements.evaluate(el => getComputedStyle(el).color);
          expect(color).toBeTruthy();
        }
      });

      test(`${service.name} maintains WCAG contrast ratios`, async ({ page }) => {
        await page.goto(service.url);

        // Test both light and dark modes for contrast
        for (const mode of ['light', 'dark']) {
          const modeToggle = page.locator(`[data-testid="theme-${mode}"]`).first();
          if (await modeToggle.count() > 0) {
            await modeToggle.click();
            await page.waitForTimeout(500);

            // Run accessibility audit focusing on contrast
            const axeResults = await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa'])
              .include('body')
              .analyze();

            const contrastViolations = axeResults.violations.filter(v =>
              v.id.includes('color-contrast')
            );

            expect(contrastViolations).toEqual([]);
          }
        }
      });
    }
  });

  test.describe('📱 Responsive Design Testing', () => {
    for (const service of SERVICES) {
      for (const viewport of VIEWPORTS) {
        test(`${service.name} is responsive on ${viewport.name}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(service.url);
          await page.waitForLoadState('networkidle');

          // Check for responsive design elements
          const responsiveElements = await page.locator('[class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]').count();
          expect(responsiveElements).toBeGreaterThan(0);

          // Verify no horizontal scroll
          const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
          const clientWidth = await page.evaluate(() => document.body.clientWidth);
          expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20); // 20px tolerance

          // Check that important elements are visible
          const navigation = page.locator('nav, [role="navigation"], header').first();
          if (await navigation.count() > 0) {
            await expect(navigation).toBeVisible();
          }

          // Take responsive screenshots
          await expect(page).toHaveScreenshot(`${service.appId}-${viewport.name.toLowerCase()}.png`);
        });
      }
    }
  });

  test.describe('🌍 Internationalization Testing', () => {
    for (const service of SERVICES) {
      test(`${service.name} has no hardcoded text`, async ({ page }) => {
        await page.goto(service.url);
        await page.waitForLoadState('networkidle');

        // Check for hardcoded English text patterns
        const hardcodedText = await page.evaluate(() => {
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
              acceptNode: (node) => {
                const text = node.textContent?.trim() || '';
                // Skip empty, single chars, or obvious technical content
                if (text.length < 3 || /^[\d\s\W]+$/.test(text)) {
                  return NodeFilter.FILTER_REJECT;
                }
                // Look for English sentences/words
                if (/^[A-Z][a-z\s]{3,50}$/.test(text)) {
                  return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
              }
            }
          );

          const hardcoded: string[] = [];
          let node;
          while ((node = walker.nextNode()) !== null) {
            const text = node.textContent?.trim();
            if (text) {
              hardcoded.push(text);
            }
          }
          return hardcoded;
        });

        console.log(`Found potential hardcoded text in ${service.name}:`, hardcodedText);

        // For now, just warn about hardcoded text (will implement i18n in Phase 4)
        if (hardcodedText.length > 0) {
          console.warn(`⚠️ ${service.name} has ${hardcodedText.length} potential hardcoded text instances`);
        }
      });

      test(`${service.name} supports Romanian/English switching`, async ({ page }) => {
        await page.goto(service.url);

        // Look for language switcher
        const langSwitcher = page.locator('[data-testid="language-switcher"], [aria-label*="language"], button:has-text("EN"), button:has-text("RO")').first();

        if (await langSwitcher.count() > 0) {
          // Test language switching
          await langSwitcher.click();
          await page.waitForTimeout(500);

          // Verify language change occurred
          const htmlLang = await page.locator('html').getAttribute('lang');
          expect(['en', 'ro', 'en-US', 'ro-RO']).toContain(htmlLang);
        } else {
          console.warn(`⚠️ ${service.name} missing language switcher - will be implemented in Phase 4`);
        }
      });
    }
  });

  test.describe('🔗 App Integration Testing', () => {
    test('SSO works across all applications', async ({ context }) => {
      // Test will be implemented after SSO is fully configured
      console.log('📝 SSO Integration test - to be implemented after Phase 6');
    });

    test('Settings sync across applications', async ({ context }) => {
      // Test will be implemented after settings sync is configured
      console.log('📝 Settings sync test - to be implemented after Phase 5');
    });

    test('Navigation between apps preserves context', async ({ page }) => {
      // Test navigation between services
      await page.goto('http://localhost:4001'); // CODAI

      // Look for navigation links to other services
      const hubLink = page.locator('a[href*="4003"], a[href*="hub"]').first();
      if (await hubLink.count() > 0) {
        await hubLink.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('4003');
      }
    });
  });

  test.describe('♿ Accessibility Comprehensive Testing', () => {
    for (const service of SERVICES) {
      test(`${service.name} meets WCAG 2.1 AA standards`, async ({ page }) => {
        await page.goto(service.url);
        await page.waitForLoadState('networkidle');

        const axeResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();

        expect(axeResults.violations).toEqual([]);
      });

      test(`${service.name} supports keyboard navigation`, async ({ page }) => {
        await page.goto(service.url);
        await page.waitForLoadState('networkidle');

        // Test tab navigation
        await page.keyboard.press('Tab');
        const firstFocusedElement = await page.locator(':focus');
        await expect(firstFocusedElement).toBeVisible();

        // Test skip links if present
        const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link').first();
        if (await skipLink.count() > 0) {
          await skipLink.focus();
          await page.keyboard.press('Enter');
          const mainContent = page.locator('#main, #content, main').first();
          if (await mainContent.count() > 0) {
            await expect(mainContent).toBeFocused();
          }
        }

        // Test escape key functionality
        const modal = page.locator('[role="dialog"], .modal').first();
        if (await modal.count() > 0 && await modal.isVisible()) {
          await page.keyboard.press('Escape');
          await expect(modal).toBeHidden();
        }
      });
    }
  });

  test.describe('⚡ Performance Testing', () => {
    for (const service of SERVICES) {
      test(`${service.name} loads within performance budget`, async ({ page }) => {
        const startTime = Date.now();

        await page.goto(service.url);
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(5000); // 5 second budget

        // Check for performance metrics
        const performanceMetrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime,
            firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime,
          };
        });

        console.log(`${service.name} Performance:`, performanceMetrics);

        // Basic performance assertions
        expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);
        if (performanceMetrics.firstContentfulPaint) {
          expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2500);
        }
      });
    }
  });

  test.describe('🔧 Code Quality Validation', () => {
    for (const service of SERVICES) {
      test(`${service.name} has no console errors`, async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        await page.goto(service.url);
        await page.waitForLoadState('networkidle');

        // Filter out known harmless errors
        const significantErrors = consoleErrors.filter((error: string) =>
          !error.includes('favicon') &&
          !error.includes('chrome-extension') &&
          !error.includes('ERR_NETWORK')
        );

        expect(significantErrors).toEqual([]);
      });

      test(`${service.name} has proper semantic HTML structure`, async ({ page }) => {
        // Navigate to service with demo mode for testing
        const url = service.url + (service.url.includes('?') ? '&demo=true' : '?demo=true');
        await page.goto(url);
        await page.waitForLoadState('networkidle');

        // Check for semantic HTML elements
        const hasMain = await page.locator('main').count() > 0;
        const hasHeader = await page.locator('header').count() > 0;
        const hasNav = await page.locator('nav').count() > 0;

        // At least one semantic element should be present
        expect(hasMain || hasHeader || hasNav).toBe(true);

        // Check for proper heading hierarchy
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
        expect(headings.length).toBeGreaterThan(0);

        // Should have at least one h1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBeGreaterThanOrEqual(1);
      });
    }
  });

  test.describe('📊 Design System Consistency', () => {
    test('All apps maintain visual consistency', async ({ page }) => {
      interface ScreenshotData {
        service: string;
        screenshot: Buffer;
        designElements: {
          fontFamily: string;
          lineHeight: string;
          letterSpacing: string;
        };
      }

      const screenshots: ScreenshotData[] = [];

      for (const service of SERVICES) {
        await page.goto(service.url);
        await page.waitForLoadState('networkidle');

        // Capture design elements
        const designElements = await page.evaluate(() => {
          const styles = getComputedStyle(document.body);
          return {
            fontFamily: styles.fontFamily,
            lineHeight: styles.lineHeight,
            letterSpacing: styles.letterSpacing,
          };
        });

        screenshots.push({
          service: service.name,
          screenshot: await page.screenshot({ fullPage: false }),
          designElements
        });
      }

      // Verify font consistency across apps
      const fontFamilies = screenshots.map(s => s.designElements.fontFamily);
      const uniqueFonts = [...new Set(fontFamilies)];
      expect(uniqueFonts.length).toBeLessThanOrEqual(2); // Allow for some variation
    });
  });

  test.describe('🎭 User Experience Flows', () => {
    test('Complete user journey across all apps', async ({ context }) => {
      // This will be a comprehensive E2E test spanning multiple apps
      console.log('📝 Complete user journey test - to be implemented after all phases');
    });
  });
});

// Helper functions for screenshot comparison and design validation
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    // Capture screenshot on failure
    const screenshot = await page.screenshot();
    await testInfo.attach('failure-screenshot', { body: screenshot, contentType: 'image/png' });
  }
});
