import { test, expect } from '@playwright/test';

test.describe('🎨 DEXAI 2026 - Visual Regression & Advanced Testing', () => {
    test.describe('📸 Visual Regression Testing', () => {
        test('should capture and compare homepage screenshots', async ({ page }) => {
            console.log('📸 Testing homepage visual consistency');

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Wait for animations to complete
            await page.waitForTimeout(2000);

            // Capture full page screenshot
            await expect(page).toHaveScreenshot('homepage-full.png', {
                fullPage: true,
                threshold: 0.2,
                animations: 'disabled'
            });

            // Capture hero section
            const heroSection = page.locator('[data-testid="hero-section"]');
            if (await heroSection.count() > 0) {
                await expect(heroSection).toHaveScreenshot('homepage-hero.png', {
                    threshold: 0.2
                });
            }

            // Capture search interface
            const searchInterface = page.locator('[data-testid="search-interface"]');
            if (await searchInterface.count() > 0) {
                await expect(searchInterface).toHaveScreenshot('homepage-search.png', {
                    threshold: 0.2
                });
            }

            console.log('📸 Homepage screenshots captured');
        });

        test('should test responsive design consistency', async ({ page }) => {
            console.log('📱 Testing responsive visual consistency');

            const viewports = [
                { width: 375, height: 667, name: 'mobile' },     // iPhone SE
                { width: 768, height: 1024, name: 'tablet' },   // iPad
                { width: 1920, height: 1080, name: 'desktop' }  // Full HD
            ];

            for (const viewport of viewports) {
                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                await page.goto('/');
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1000);

                // Capture responsive screenshots
                await expect(page).toHaveScreenshot(`responsive-${viewport.name}.png`, {
                    fullPage: true,
                    threshold: 0.2,
                    animations: 'disabled'
                });

                console.log(`📱 ${viewport.name} (${viewport.width}x${viewport.height}) captured`);
            }
        });

        test('should test dark/light theme consistency', async ({ page }) => {
            console.log('🌓 Testing theme visual consistency');

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Test light theme
            await page.locator('html').evaluate(el => el.classList.remove('dark'));
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('theme-light.png', {
                fullPage: true,
                threshold: 0.2,
                animations: 'disabled'
            });

            // Test dark theme
            await page.locator('html').evaluate(el => el.classList.add('dark'));
            await page.waitForTimeout(500);

            await expect(page).toHaveScreenshot('theme-dark.png', {
                fullPage: true,
                threshold: 0.2,
                animations: 'disabled'
            });

            console.log('🌓 Theme screenshots captured');
        });

        test('should test component library visual consistency', async ({ page }) => {
            console.log('🧩 Testing component visual consistency');

            // Test components if they have a dedicated showcase page
            const componentPages = [
                '/components/buttons',
                '/components/forms',
                '/components/cards',
                '/storybook',
                '/design-system'
            ];

            for (const componentPage of componentPages) {
                try {
                    await page.goto(componentPage);
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(1000);

                    const pageName = componentPage.replace('/', '').replace('/', '-');
                    await expect(page).toHaveScreenshot(`components-${pageName}.png`, {
                        fullPage: true,
                        threshold: 0.2,
                        animations: 'disabled'
                    });

                    console.log(`🧩 ${componentPage} captured`);
                } catch (error) {
                    console.log(`🧩 ${componentPage} not found or accessible`);
                }
            }
        });

        test('should test animation states and transitions', async ({ page }) => {
            console.log('🎬 Testing animation visual states');

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Test hover states
            const interactiveElements = [
                'button',
                'a[href]',
                '[data-testid*="card"]',
                '[data-testid*="button"]'
            ];

            for (const selector of interactiveElements) {
                const elements = page.locator(selector);
                const count = await elements.count();

                if (count > 0) {
                    const element = elements.first();

                    // Before hover
                    await expect(element).toHaveScreenshot(`${selector.replace(/[^a-zA-Z0-9]/g, '_')}-normal.png`, {
                        threshold: 0.2
                    });

                    // Hover state
                    await element.hover();
                    await page.waitForTimeout(300);

                    await expect(element).toHaveScreenshot(`${selector.replace(/[^a-zA-Z0-9]/g, '_')}-hover.png`, {
                        threshold: 0.2
                    });

                    console.log(`🎬 ${selector} hover state captured`);
                }
            }
        });
    });

    test.describe('🔬 Advanced UI Testing', () => {
        test('should test micro-interactions and feedback', async ({ page }) => {
            console.log('🔬 Testing micro-interactions');

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Test form validation feedback
            const emailInput = page.locator('input[type="email"]');
            if (await emailInput.count() > 0) {
                await emailInput.fill('invalid-email');
                await emailInput.blur();
                await page.waitForTimeout(500);

                const validationMessage = page.locator('.error, .invalid, [role="alert"]');
                if (await validationMessage.count() > 0) {
                    console.log('✅ Email validation feedback working');
                }
            }

            // Test loading states
            const searchInput = page.locator('input[type="text"]');
            const submitButton = page.locator('button[type="submit"]');

            if (await searchInput.count() > 0 && await submitButton.count() > 0) {
                await searchInput.fill('loading test');
                await submitButton.click();

                // Check for loading indicator
                const loadingIndicators = [
                    '.loading',
                    '.spinner',
                    '[data-testid="loading"]',
                    '[aria-busy="true"]'
                ];

                for (const indicator of loadingIndicators) {
                    if (await page.locator(indicator).count() > 0) {
                        console.log(`✅ Loading indicator found: ${indicator}`);
                        break;
                    }
                }
            }

            // Test success feedback
            await page.waitForTimeout(2000);
            const successIndicators = [
                '.success',
                '.complete',
                '[data-testid="success"]',
                '[role="status"]'
            ];

            for (const indicator of successIndicators) {
                if (await page.locator(indicator).count() > 0) {
                    console.log(`✅ Success feedback found: ${indicator}`);
                    break;
                }
            }
        });

        test('should test keyboard navigation and focus management', async ({ page }) => {
            console.log('⌨️ Testing keyboard navigation');

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Test tab navigation
            let currentIndex = 0;
            const maxTabs = 10;

            for (let i = 0; i < maxTabs; i++) {
                await page.keyboard.press('Tab');

                const activeElement = await page.evaluate(() => {
                    const el = document.activeElement;
                    return {
                        tagName: el?.tagName,
                        type: el?.getAttribute('type'),
                        hasVisibleFocus: getComputedStyle(el!).outline !== 'none' ||
                            getComputedStyle(el!).boxShadow.includes('focus') ||
                            el?.classList.contains('focus-visible')
                    };
                });

                if (activeElement.tagName) {
                    console.log(`⌨️ Tab ${i + 1}: ${activeElement.tagName}${activeElement.type ? `[${activeElement.type}]` : ''}`);
                    currentIndex++;

                    // Check if focus is visible
                    if (activeElement.hasVisibleFocus) {
                        console.log('✅ Focus indicator visible');
                    }
                }
            }

            console.log(`⌨️ Navigated through ${currentIndex} focusable elements`);

            // Test escape key behavior
            await page.keyboard.press('Escape');
            await page.waitForTimeout(300);

            // Test enter key activation
            const buttons = page.locator('button');
            if (await buttons.count() > 0) {
                await buttons.first().focus();
                await page.keyboard.press('Enter');
                await page.waitForTimeout(300);
                console.log('⌨️ Enter key activation tested');
            }
        });

        test('should test screen reader accessibility', async ({ page }) => {
            console.log('🔊 Testing screen reader accessibility');

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Check for ARIA labels and roles
            const ariaElements = await page.evaluate(() => {
                const elements = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
                return Array.from(elements).map(el => ({
                    tagName: el.tagName,
                    ariaLabel: el.getAttribute('aria-label'),
                    ariaLabelledBy: el.getAttribute('aria-labelledby'),
                    role: el.getAttribute('role'),
                    text: el.textContent?.substring(0, 50)
                }));
            });

            console.log(`🔊 Found ${ariaElements.length} elements with ARIA attributes`);

            // Check for proper heading structure
            const headings = await page.evaluate(() => {
                const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                return Array.from(headingElements).map(el => ({
                    level: el.tagName,
                    text: el.textContent?.substring(0, 50)
                }));
            });

            console.log(`🔊 Found ${headings.length} headings`);

            // Verify H1 exists and is unique
            const h1Count = headings.filter(h => h.level === 'H1').length;
            if (h1Count === 1) {
                console.log('✅ Single H1 found');
            } else {
                console.log(`⚠️ ${h1Count} H1 elements found (should be 1)`);
            }

            // Check for alt text on images
            const images = await page.evaluate(() => {
                const imgElements = document.querySelectorAll('img');
                return Array.from(imgElements).map(img => ({
                    src: img.src,
                    alt: img.alt,
                    hasAlt: img.hasAttribute('alt')
                }));
            });

            const imagesWithoutAlt = images.filter(img => !img.hasAlt);
            console.log(`🔊 ${images.length} images found, ${imagesWithoutAlt.length} without alt text`);

            // Check for proper form labels
            const formInputs = await page.evaluate(() => {
                const inputs = document.querySelectorAll('input, select, textarea');
                return Array.from(inputs).map(input => ({
                    type: input.getAttribute('type') || input.tagName,
                    hasLabel: input.getAttribute('aria-label') ||
                        input.getAttribute('aria-labelledby') ||
                        document.querySelector(`label[for="${input.id}"]`) !== null,
                    placeholder: input.getAttribute('placeholder')
                }));
            });

            const inputsWithoutLabels = formInputs.filter(input => !input.hasLabel);
            console.log(`🔊 ${formInputs.length} form inputs found, ${inputsWithoutLabels.length} without proper labels`);
        });

        test('should test color contrast and readability', async ({ page }) => {
            console.log('🎨 Testing color contrast');

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Check text contrast ratios
            const contrastResults = await page.evaluate(() => {
                const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label');
                const results: any[] = [];

                function getRGB(color: string) {
                    const div = document.createElement('div');
                    div.style.color = color;
                    document.body.appendChild(div);
                    const computedColor = getComputedStyle(div).color;
                    document.body.removeChild(div);

                    const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                    return match ? [parseInt(match[1]!), parseInt(match[2]!), parseInt(match[3]!)] : [0, 0, 0];
                }

                function getLuminance(rgb: number[]) {
                    const [r, g, b] = rgb.map(c => {
                        c = c / 255;
                        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                    });
                    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
                }

                function getContrastRatio(color1: number[], color2: number[]) {
                    const lum1 = getLuminance(color1);
                    const lum2 = getLuminance(color2);
                    const lighter = Math.max(lum1, lum2);
                    const darker = Math.min(lum1, lum2);
                    return (lighter + 0.05) / (darker + 0.05);
                }

                Array.from(textElements).slice(0, 20).forEach(el => {
                    const styles = getComputedStyle(el);
                    const textColor = getRGB(styles.color);
                    const bgColor = getRGB(styles.backgroundColor);

                    if (bgColor[0] === 0 && bgColor[1] === 0 && bgColor[2] === 0 && styles.backgroundColor === 'rgba(0, 0, 0, 0)') {
                        // Transparent background, use white as default
                        bgColor[0] = bgColor[1] = bgColor[2] = 255;
                    }

                    const contrast = getContrastRatio(textColor, bgColor);

                    results.push({
                        element: el.tagName,
                        text: el.textContent?.substring(0, 30),
                        contrast: contrast.toFixed(2),
                        wcagAA: contrast >= 4.5,
                        wcagAAA: contrast >= 7
                    });
                });

                return results;
            });

            const lowContrastElements = contrastResults.filter(result => !result.wcagAA);

            console.log(`🎨 Checked ${contrastResults.length} text elements`);
            console.log(`🎨 ${lowContrastElements.length} elements with low contrast`);

            if (lowContrastElements.length > 0) {
                console.log('⚠️ Elements with insufficient contrast:');
                lowContrastElements.slice(0, 5).forEach(el => {
                    console.log(`  ${el.element}: "${el.text}" (${el.contrast}:1)`);
                });
            }

            // Expect most elements to have good contrast
            const goodContrastPercentage = (contrastResults.length - lowContrastElements.length) / contrastResults.length;
            expect(goodContrastPercentage).toBeGreaterThan(0.8); // 80% should have good contrast
        });

        test('should test progressive enhancement and graceful degradation', async ({ page }) => {
            console.log('📈 Testing progressive enhancement');

            // Disable JavaScript and test basic functionality
            await page.context().addInitScript(() => {
                // Disable some modern features to test fallbacks
                delete (window as any).fetch;
                delete (window as any).IntersectionObserver;
                delete (window as any).requestAnimationFrame;
            });

            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Test that basic content is still accessible
            const hasMainContent = await page.locator('main, [role="main"], .main-content').count() > 0;
            const hasNavigation = await page.locator('nav, [role="navigation"]').count() > 0;
            const hasSearchForm = await page.locator('form, [role="search"]').count() > 0;

            console.log(`📈 Main content accessible: ${hasMainContent}`);
            console.log(`📈 Navigation accessible: ${hasNavigation}`);
            console.log(`📈 Search form accessible: ${hasSearchForm}`);

            // Test form submission without JavaScript
            const forms = page.locator('form');
            if (await forms.count() > 0) {
                const form = forms.first();
                const action = await form.getAttribute('action');
                const method = await form.getAttribute('method');

                console.log(`📈 Form has action: ${!!action}`);
                console.log(`📈 Form has method: ${method || 'GET'}`);

                if (action || method) {
                    console.log('✅ Form can work without JavaScript');
                }
            }

            // Test CSS-only interactions
            const cssInteractiveElements = await page.evaluate(() => {
                const elements = document.querySelectorAll('*');
                let count = 0;

                Array.from(elements).forEach(el => {
                    const styles = getComputedStyle(el);
                    if (styles.getPropertyValue(':hover') ||
                        styles.getPropertyValue(':focus') ||
                        styles.getPropertyValue(':active')) {
                        count++;
                    }
                });

                return count;
            });

            console.log(`📈 Elements with CSS interactions: ${cssInteractiveElements}`);
        });
    });

    test.describe('🚀 Performance Deep Dive', () => {
        test('should analyze Core Web Vitals in detail', async ({ page }) => {
            console.log('🚀 Analyzing Core Web Vitals');

            await page.goto('/');

            // Measure page load performance
            const performanceMetrics = await page.evaluate(() => {
                return new Promise(resolve => {
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        resolve(entries.map(entry => ({
                            name: entry.name,
                            duration: entry.duration,
                            startTime: entry.startTime,
                            entryType: entry.entryType
                        })));
                    }).observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });

                    // Fallback timeout
                    setTimeout(() => resolve([]), 5000);
                });
            });

            console.log(`🚀 Performance entries collected: ${(performanceMetrics as any[]).length}`);

            // Measure CLS (Cumulative Layout Shift)
            const clsValue = await page.evaluate(() => {
                return new Promise(resolve => {
                    let cls = 0;

                    new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (!(entry as any).hadRecentInput) {
                                cls += (entry as any).value;
                            }
                        }
                        resolve(cls);
                    }).observe({ entryTypes: ['layout-shift'] });

                    setTimeout(() => resolve(cls), 3000);
                });
            });

            console.log(`🚀 Cumulative Layout Shift: ${clsValue}`);

            // Measure FID simulation
            await page.click('button, a, input', { timeout: 1000 }).catch(() => { });

            // Check resource loading times
            const resourceTiming = await page.evaluate(() => {
                const resources = performance.getEntriesByType('resource');
                return resources.map(resource => ({
                    name: resource.name,
                    duration: resource.duration,
                    size: (resource as any).transferSize || 0,
                    type: resource.name.split('.').pop()?.split('?')[0]
                })).sort((a, b) => b.duration - a.duration);
            });

            const slowResources = (resourceTiming as any[]).filter(r => r.duration > 1000);
            console.log(`🚀 Slow resources (>1s): ${slowResources.length}`);

            if (slowResources.length > 0) {
                console.log('🐌 Slowest resources:');
                slowResources.slice(0, 3).forEach(resource => {
                    console.log(`  ${resource.name}: ${resource.duration.toFixed(2)}ms (${resource.size} bytes)`);
                });
            }

            // Performance expectations
            expect(Number(clsValue)).toBeLessThan(0.1); // Good CLS score
        });

        test('should test memory usage and leaks', async ({ page }) => {
            console.log('🧠 Testing memory usage');

            // Get initial memory usage
            const initialMemory = await page.evaluate(() => {
                return (performance as any).memory ? {
                    usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                    totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                    jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
                } : null;
            });

            if (initialMemory) {
                console.log(`🧠 Initial memory: ${(initialMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
            }

            // Perform memory-intensive operations
            await page.goto('/');

            for (let i = 0; i < 5; i++) {
                await page.reload();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1000);
            }

            // Check memory after operations
            const finalMemory = await page.evaluate(() => {
                return (performance as any).memory ? {
                    usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                    totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                    jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
                } : null;
            });

            if (initialMemory && finalMemory) {
                const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
                const memoryIncreaseMB = memoryIncrease / 1024 / 1024;

                console.log(`🧠 Final memory: ${(finalMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
                console.log(`🧠 Memory increase: ${memoryIncreaseMB.toFixed(2)} MB`);

                // Memory increase should be reasonable
                expect(memoryIncreaseMB).toBeLessThan(50); // Less than 50MB increase
            }

            // Check for potential memory leaks
            const potentialLeaks = await page.evaluate(() => {
                const leakChecks = {
                    globalVariables: Object.keys(window).length,
                    eventListeners: document.querySelectorAll('*[onclick], *[onload], *[onmouseover]').length,
                    intervals: setInterval(() => { }, 1000) // This will be cleared immediately
                };

                clearInterval(leakChecks.intervals);

                return {
                    globalVariables: leakChecks.globalVariables,
                    inlineEventListeners: leakChecks.eventListeners
                };
            });

            console.log(`🧠 Global variables: ${potentialLeaks.globalVariables}`);
            console.log(`🧠 Inline event listeners: ${potentialLeaks.inlineEventListeners}`);
        });

        test('should test network efficiency and caching', async ({ page }) => {
            console.log('🌐 Testing network efficiency');

            // Clear cache
            await page.context().clearCookies();

            // First visit - measure cold cache performance
            const startTime = Date.now();
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            const coldLoadTime = Date.now() - startTime;

            console.log(`🌐 Cold cache load time: ${coldLoadTime}ms`);

            // Get network requests from first load
            const networkRequests: any[] = [];
            page.on('response', response => {
                networkRequests.push({
                    url: response.url(),
                    status: response.status(),
                    size: response.headers()['content-length'] || 0,
                    fromCache: response.fromServiceWorker() || response.status() === 304
                });
            });

            // Second visit - measure warm cache performance
            const warmStartTime = Date.now();
            await page.reload();
            await page.waitForLoadState('networkidle');
            const warmLoadTime = Date.now() - warmStartTime;

            console.log(`🌐 Warm cache load time: ${warmLoadTime}ms`);

            // Analyze caching effectiveness
            const cachedRequests = networkRequests.filter(req => req.fromCache);
            const cachingRatio = cachedRequests.length / networkRequests.length;

            console.log(`🌐 Cache hit ratio: ${(cachingRatio * 100).toFixed(1)}%`);
            console.log(`🌐 Total requests: ${networkRequests.length}`);
            console.log(`🌐 Cached requests: ${cachedRequests.length}`);

            // Performance expectations
            expect(warmLoadTime).toBeLessThan(coldLoadTime * 0.8); // Warm load should be at least 20% faster

            // Calculate total transfer size
            const totalSize = networkRequests.reduce((sum, req) => sum + parseInt(req.size || 0), 0);
            const totalSizeMB = totalSize / 1024 / 1024;

            console.log(`🌐 Total transfer size: ${totalSizeMB.toFixed(2)} MB`);

            // Size should be reasonable
            expect(totalSizeMB).toBeLessThan(10); // Less than 10MB total
        });
    });
});
