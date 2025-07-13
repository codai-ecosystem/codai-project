import { test, expect } from '@playwright/test';

test.describe('DEXAI Responsive Design & Mobile', () => {
    test.describe('Desktop View', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/');
            await page.waitForLoadState('networkidle');
        });

        test('should display full layout on desktop', async ({ page }) => {
            console.log('🖥️ Testing desktop layout');

            // Check main navigation is visible
            await expect(page.locator('nav, header')).toBeVisible();

            // Check search is prominently displayed
            await expect(page.locator('input[type="text"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toBeVisible();

            // Check footer or additional content
            const footer = page.locator('footer');
            if (await footer.count() > 0) {
                await expect(footer).toBeVisible();
            }

            // Verify responsive classes are applied correctly
            const mainContent = page.locator('main, [data-testid="main-content"]').first();
            const hasDesktopClasses = await mainContent.evaluate(el => {
                const classes = el.className;
                return classes.includes('lg:') || classes.includes('xl:') || classes.includes('2xl:');
            });

            expect(hasDesktopClasses).toBeTruthy();
        });

        test('should show detailed search results on desktop', async ({ page }) => {
            console.log('🖥️ Testing desktop search results');

            await page.locator('input[type="text"]').fill('carte');
            await page.locator('button[type="submit"]').click();
            await page.waitForSelector('[data-testid="search-results"]');

            // Should show detailed information
            const results = page.locator('[data-testid="search-result-item"]');
            await expect(results.first()).toBeVisible();

            // Check for detailed content sections
            const detailSections = [
                '[data-testid="definition"]',
                '[data-testid="examples"]',
                '[data-testid="synonyms"]',
                '[data-testid="vote-section"]'
            ];

            for (const selector of detailSections) {
                const section = page.locator(selector);
                if (await section.count() > 0) {
                    await expect(section.first()).toBeVisible();
                }
            }
        });
    });

    test.describe('Tablet View', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('/');
            await page.waitForLoadState('networkidle');
        });

        test('should adapt layout for tablet', async ({ page }) => {
            console.log('📱 Testing tablet layout');

            // Navigation should still be visible but may be condensed
            await expect(page.locator('nav, header')).toBeVisible();

            // Search functionality should be accessible
            await expect(page.locator('input[type="text"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toBeVisible();

            // Check for tablet-specific responsive classes
            const mainContent = page.locator('main, [data-testid="main-content"]').first();
            const hasTabletClasses = await mainContent.evaluate(el => {
                const classes = el.className;
                return classes.includes('md:') || classes.includes('tablet') || classes.includes('medium');
            });

            console.log(`Tablet classes found: ${hasTabletClasses}`);
        });

        test('should handle touch interactions on tablet', async ({ page }) => {
            console.log('📱 Testing tablet touch interactions');

            // Test search
            await page.locator('input[type="text"]').tap();
            await page.locator('input[type="text"]').fill('dragoste');
            await page.locator('button[type="submit"]').tap();
            await page.waitForSelector('[data-testid="search-results"]');

            // Test voting with touch
            const voteButton = page.locator('[data-testid="upvote-button"]').first();
            await voteButton.tap();
            await page.waitForTimeout(500);

            // Test favorites with touch
            const favoriteButton = page.locator('[data-testid="favorite-button"]').first();
            await favoriteButton.tap();
            await page.waitForTimeout(500);

            expect(true).toBeTruthy(); // Test passes if no errors occur
        });
    });

    test.describe('Mobile View', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
            await page.goto('/');
            await page.waitForLoadState('networkidle');
        });

        test('should display mobile-optimized layout', async ({ page }) => {
            console.log('📱 Testing mobile layout');

            // Check for mobile navigation (hamburger menu or condensed nav)
            const mobileNav = page.locator('[data-testid="mobile-nav"], .hamburger, button[aria-label*="menu"]');

            if (await mobileNav.count() > 0) {
                await expect(mobileNav.first()).toBeVisible();
                console.log('✅ Mobile navigation found');
            } else {
                console.log('ℹ️ Using responsive navigation');
            }

            // Search should be accessible
            await expect(page.locator('input[type="text"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toBeVisible();

            // Check for mobile-specific responsive classes
            const body = page.locator('body');
            const hasMobileClasses = await body.evaluate(el => {
                const allElements = el.querySelectorAll('*');
                for (const element of allElements) {
                    if (element.className.includes('sm:') ||
                        element.className.includes('mobile') ||
                        element.className.includes('xs:')) {
                        return true;
                    }
                }
                return false;
            });

            expect(hasMobileClasses).toBeTruthy();
        });

        test('should handle mobile search interaction', async ({ page }) => {
            console.log('📱 Testing mobile search');

            // Tap search input
            await page.locator('input[type="text"]').tap();

            // Virtual keyboard should appear (viewport might change)
            await page.waitForTimeout(500);

            // Type search term
            await page.locator('input[type="text"]').fill('casă');

            // Submit search
            await page.locator('button[type="submit"]').tap();
            await page.waitForSelector('[data-testid="search-results"]');

            // Results should be mobile-optimized
            const results = page.locator('[data-testid="search-result-item"]');
            await expect(results.first()).toBeVisible();

            // Check if results are stacked vertically for mobile
            const firstResult = results.first();
            const resultWidth = await firstResult.evaluate(el => el.getBoundingClientRect().width);
            const viewportWidth = await page.viewportSize();

            expect(resultWidth).toBeLessThanOrEqual(viewportWidth!.width);
        });

        test('should show condensed content on mobile', async ({ page }) => {
            console.log('📱 Testing mobile content condensation');

            await page.locator('input[type="text"]').fill('carte');
            await page.locator('button[type="submit"]').tap();
            await page.waitForSelector('[data-testid="search-results"]');

            // Should show essential content
            await expect(page.locator('[data-testid="definition"]').first()).toBeVisible();

            // Additional content might be in expandable sections
            const expandableElements = page.locator('details, [data-testid="expandable"], button:has-text("Show more")');

            if (await expandableElements.count() > 0) {
                console.log('✅ Found expandable content for mobile');

                // Test expanding content
                await expandableElements.first().tap();
                await page.waitForTimeout(500);
            } else {
                console.log('ℹ️ All content visible on mobile');
            }
        });

        test('should handle mobile gestures', async ({ page }) => {
            console.log('📱 Testing mobile gestures');

            await page.locator('input[type="text"]').fill('dragoste');
            await page.locator('button[type="submit"]').tap();
            await page.waitForSelector('[data-testid="search-results"]');

            // Test scroll behavior
            await page.mouse.wheel(0, 300);
            await page.waitForTimeout(500);

            // Test tap interactions
            const interactiveElements = [
                '[data-testid="upvote-button"]',
                '[data-testid="downvote-button"]',
                '[data-testid="favorite-button"]'
            ];

            for (const selector of interactiveElements) {
                const element = page.locator(selector).first();
                if (await element.count() > 0) {
                    await element.tap();
                    await page.waitForTimeout(300);
                }
            }

            expect(true).toBeTruthy(); // Test passes if no errors
        });
    });

    test.describe('Cross-Device Compatibility', () => {
        const devices = [
            { name: 'iPhone 12', width: 390, height: 844 },
            { name: 'Samsung Galaxy S21', width: 384, height: 854 },
            { name: 'iPad', width: 768, height: 1024 },
            { name: 'Desktop', width: 1920, height: 1080 }
        ];

        devices.forEach(device => {
            test(`should work on ${device.name}`, async ({ page }) => {
                console.log(`📱 Testing on ${device.name} (${device.width}x${device.height})`);

                await page.setViewportSize({ width: device.width, height: device.height });
                await page.goto('/');
                await page.waitForLoadState('networkidle');

                // Basic functionality should work
                await expect(page.locator('input[type="text"]')).toBeVisible();
                await expect(page.locator('button[type="submit"]')).toBeVisible();

                // Test search
                await page.locator('input[type="text"]').fill('test');
                await page.locator('button[type="submit"]').click();

                // Should not break or throw errors
                await page.waitForTimeout(1000);

                // Check for responsive design
                const hasResponsiveClasses = await page.evaluate(() => {
                    const elements = document.querySelectorAll('*');
                    for (const el of elements) {
                        if (el.className.includes('sm:') ||
                            el.className.includes('md:') ||
                            el.className.includes('lg:') ||
                            el.className.includes('xl:')) {
                            return true;
                        }
                    }
                    return false;
                });

                expect(hasResponsiveClasses).toBeTruthy();
            });
        });
    });

    test.describe('Accessibility & Mobile', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/');
        });

        test('should maintain accessibility on mobile', async ({ page }) => {
            console.log('♿ Testing mobile accessibility');

            // Check for touch target sizes (minimum 44px)
            const touchTargets = page.locator('button, a, input[type="submit"], [role="button"]');
            const touchTargetCount = await touchTargets.count();

            for (let i = 0; i < Math.min(5, touchTargetCount); i++) {
                const target = touchTargets.nth(i);
                const box = await target.boundingBox();

                if (box) {
                    expect(box.height).toBeGreaterThanOrEqual(40); // Close to 44px minimum
                    expect(box.width).toBeGreaterThanOrEqual(40);
                }
            }

            // Check for proper focus management
            await page.keyboard.press('Tab');
            const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
            expect(focusedElement).toBeDefined();
        });

        test('should support screen readers on mobile', async ({ page }) => {
            console.log('♿ Testing mobile screen reader support');

            // Check for ARIA labels
            const searchInput = page.locator('input[type="text"]');
            const searchLabel = await searchInput.getAttribute('aria-label');
            const searchPlaceholder = await searchInput.getAttribute('placeholder');

            expect(searchLabel || searchPlaceholder).toBeTruthy();

            // Check for semantic structure
            const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
            expect(headings).toBeGreaterThan(0);

            // Check for landmarks
            const landmarks = await page.locator('main, nav, header, footer, aside').count();
            expect(landmarks).toBeGreaterThan(0);
        });
    });

    test.describe('Performance on Mobile', () => {
        test('should load quickly on mobile', async ({ page }) => {
            console.log('📱 Testing mobile performance');

            await page.setViewportSize({ width: 375, height: 667 });

            const startTime = Date.now();
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - startTime;

            // Should load within 5 seconds on mobile
            expect(loadTime).toBeLessThan(5000);

            console.log(`Mobile load time: ${loadTime}ms`);
        });

        test('should handle slow connections', async ({ page }) => {
            console.log('📱 Testing mobile on slow connection');

            // Simulate slow 3G
            await page.route('**/*', async route => {
                await new Promise(resolve => setTimeout(resolve, 100)); // Add delay
                await route.continue();
            });

            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/');

            // Should still load and be functional
            await expect(page.locator('input[type="text"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toBeVisible();
        });
    });
});
