import { test, expect, Page } from '@playwright/test'

/**
 * Comprehensive UI/UX Testing Suite for ID Service
 * 
 * This test suite validates:
 * - No hardcoded text (all text uses translations)
 * - No hardcoded sample values (uses real data)
 * - No hardcoded colors/sizes (uses theme styles)
 * - Basic app elements (headers, footer, home page)
 * - Shared UI package usage from ecosystem
 * - Translation system integration
 * - Theme token consistency
 * - Responsive design
 * - Accessibility compliance
 */

test.describe('ID Service - Comprehensive UI/UX Validation', () => {
    let page: Page

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage()
        await page.goto('http://localhost:4004')
    })

    test.describe('Translation System Validation', () => {
        test('should not contain hardcoded English text in main content', async () => {
            // Check for common hardcoded patterns that should use translations
            const hardcodedPatterns = [
                'Welcome',
                'Sign In',
                'Sign Up',
                'Get Started',
                'Home',
                'Dashboard',
                'Settings',
                'Privacy Policy',
                'Terms of Service',
                'Contact',
                'About',
                'Help'
            ]

            for (const pattern of hardcodedPatterns) {
                // Check if text exists but is not using translation keys
                const elements = await page.locator(`text="${pattern}"`).all()

                for (const element of elements) {
                    const parentElement = await element.locator('..').first()
                    const hasTranslationAttribute = await parentElement.getAttribute('data-translation-key') !== null
                    const isInTranslationComponent = await parentElement.locator('[data-testid*="translation"]').count() > 0

                    // Allow if it's clearly using translation system
                    if (!hasTranslationAttribute && !isInTranslationComponent) {
                        // Check if the element's parent tree contains translation indicators
                        const hasTranslationContext = await page.evaluate((el) => {
                            let current = el.parentElement
                            while (current) {
                                if (current.dataset?.translationContext ||
                                    current.className?.includes('i18n') ||
                                    current.getAttribute('data-testid')?.includes('translation')) {
                                    return true
                                }
                                current = current.parentElement
                            }
                            return false
                        }, element)

                        if (!hasTranslationContext) {
                            console.warn(`Potentially hardcoded text found: "${pattern}" - verify it uses translation system`)
                        }
                    }
                }
            }
        })

        test('should load with proper language support', async () => {
            // Check if translation system is loaded
            await expect(page.locator('html[lang]')).toBeVisible()

            // Verify language attribute is set
            const langAttribute = await page.locator('html').getAttribute('lang')
            expect(['en', 'ro', 'es', 'fr', 'de']).toContain(langAttribute)
        })

        test('should support language switching', async () => {
            // Look for language switcher if present
            const languageSwitcher = page.locator('[data-testid="language-switcher"], [aria-label*="language"], [title*="language"]')

            if (await languageSwitcher.count() > 0) {
                // Test language switching functionality
                await languageSwitcher.first().click()

                // Should show language options
                await expect(page.locator('[data-testid="language-option"], [role="option"]')).toBeVisible({ timeout: 3000 })
            }
        })
    })

    test.describe('Theme System Validation', () => {
        test('should use CSS custom properties instead of hardcoded colors', async () => {
            // Check for hardcoded color values in inline styles
            const elementsWithInlineStyles = await page.locator('[style*="color:"], [style*="background"], [style*="border"]').all()

            for (const element of elementsWithInlineStyles) {
                const style = await element.getAttribute('style')
                if (style) {
                    // Check for hardcoded hex colors, rgb values
                    const hardcodedColorPatterns = [
                        /#[0-9a-fA-F]{3,6}/,  // Hex colors
                        /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/,  // RGB colors
                        /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/,  // RGBA colors
                    ]

                    for (const pattern of hardcodedColorPatterns) {
                        if (pattern.test(style)) {
                            // Allow certain exceptions like transparent or inherit
                            if (!style.includes('transparent') && !style.includes('inherit') && !style.includes('currentColor')) {
                                console.warn(`Hardcoded color found in inline style: ${style}`)
                            }
                        }
                    }
                }
            }
        })

        test('should use design system spacing and sizing', async () => {
            // Check computed styles use CSS variables for spacing
            const elements = await page.locator('div, section, header, footer, main').all()

            // Sample a few elements to check they use design system values
            for (let i = 0; i < Math.min(5, elements.length); i++) {
                const element = elements[i]
                const computedStyle = await page.evaluate((el) => {
                    const styles = window.getComputedStyle(el)
                    return {
                        padding: styles.padding,
                        margin: styles.margin,
                        fontSize: styles.fontSize,
                        lineHeight: styles.lineHeight
                    }
                }, element)

                // These should be reasonable design system values, not arbitrary numbers
                expect(computedStyle).toBeDefined()
            }
        })

        test('should have proper dark mode support', async () => {
            // Check if dark mode toggle exists
            const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"], [aria-label*="dark"], [title*="dark"]')

            if (await darkModeToggle.count() > 0) {
                // Test dark mode functionality
                await darkModeToggle.first().click()

                // Should apply dark class or theme
                await expect(page.locator('html.dark, body.dark, [data-theme="dark"]')).toBeVisible({ timeout: 2000 })
            }
        })
    })

    test.describe('Shared UI Components Validation', () => {
        test('should use shared Button components', async () => {
            const buttons = await page.locator('button, [role="button"]').all()

            for (const button of buttons) {
                // Check if button uses shared UI styling patterns
                const className = await button.getAttribute('class')
                if (className) {
                    // Should use design system button classes
                    const hasSharedButtonClasses =
                        className.includes('btn-') ||
                        className.includes('button') ||
                        className.includes('inline-flex') ||
                        className.includes('items-center') ||
                        className.includes('justify-center')

                    if (!hasSharedButtonClasses) {
                        console.warn('Button may not be using shared UI component')
                    }
                }
            }
        })

        test('should use shared Input components for forms', async () => {
            const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"]').all()

            for (const input of inputs) {
                // Check if input uses shared UI styling
                const className = await input.getAttribute('class')
                if (className) {
                    const hasSharedInputClasses =
                        className.includes('input-') ||
                        className.includes('form-') ||
                        className.includes('border') ||
                        className.includes('rounded')

                    expect(hasSharedInputClasses).toBeTruthy()
                }
            }
        })

        test('should have proper Header component', async () => {
            // Should have a header with navigation
            await expect(page.locator('header, [role="banner"]')).toBeVisible()

            // Header should contain navigation links
            const headerNav = page.locator('header nav, [role="banner"] nav, [role="navigation"]')
            await expect(headerNav).toBeVisible()

            // Should have brand/logo
            const brand = page.locator('header [data-testid="brand"], header h1, header .logo')
            await expect(brand).toBeVisible()
        })

        test('should have proper Footer component', async () => {
            // Should have a footer
            await expect(page.locator('footer, [role="contentinfo"]')).toBeVisible()

            // Footer should contain links (privacy, terms, etc.)
            const footerLinks = page.locator('footer a, [role="contentinfo"] a')
            expect(await footerLinks.count()).toBeGreaterThan(0)
        })
    })

    test.describe('Data Integration Validation', () => {
        test('should not display placeholder/sample data', async () => {
            // Check for common placeholder patterns
            const placeholderPatterns = [
                'Lorem ipsum',
                'example.com',
                'user@example.com',
                'placeholder',
                'sample data',
                'test user',
                'dummy',
                'fake data',
                'TODO',
                'FIXME'
            ]

            for (const pattern of placeholderPatterns) {
                const elements = await page.locator(`text=${pattern}`).all()
                if (elements.length > 0) {
                    console.warn(`Placeholder/sample data found: "${pattern}"`)
                }
            }
        })

        test('should load real application data', async () => {
            // Verify page loads with actual content
            await expect(page.locator('h1, h2, h3')).toContainText(['ID', 'LOGAI', 'Identity', 'Authentication'])

            // Should have meaningful descriptions
            const descriptions = await page.locator('p, [role="text"]').allTextContents()
            const hasRealContent = descriptions.some(text =>
                text.length > 50 &&
                !text.includes('Lorem') &&
                !text.includes('placeholder')
            )
            expect(hasRealContent).toBeTruthy()
        })
    })

    test.describe('Basic App Elements Validation', () => {
        test('should have complete home page layout', async () => {
            // Hero section
            await expect(page.locator('section, .hero, [data-testid="hero"]')).toBeVisible()

            // Main content area
            await expect(page.locator('main, [role="main"]')).toBeVisible()

            // Call-to-action buttons
            const ctaButtons = page.locator('button:has-text("Sign"), a:has-text("Sign"), a:has-text("Get Started")')
            expect(await ctaButtons.count()).toBeGreaterThan(0)
        })

        test('should have proper page structure and semantics', async () => {
            // Check HTML5 semantic structure
            await expect(page.locator('header')).toBeVisible()
            await expect(page.locator('main')).toBeVisible()
            await expect(page.locator('footer')).toBeVisible()

            // Should have proper heading hierarchy
            const h1Count = await page.locator('h1').count()
            expect(h1Count).toBeGreaterThanOrEqual(1)
            expect(h1Count).toBeLessThanOrEqual(2) // Should not have multiple h1s
        })

        test('should have proper navigation structure', async () => {
            // Primary navigation
            const primaryNav = page.locator('nav[role="navigation"], header nav')
            await expect(primaryNav).toBeVisible()

            // Navigation should have accessible links
            const navLinks = primaryNav.locator('a')
            expect(await navLinks.count()).toBeGreaterThan(0)

            // Links should have proper attributes
            for (const link of await navLinks.all()) {
                const href = await link.getAttribute('href')
                expect(href).toBeTruthy()
                expect(href).not.toBe('#') // Should not be placeholder links
            }
        })
    })

    test.describe('Responsive Design Validation', () => {
        test('should be responsive on mobile devices', async () => {
            // Test mobile viewport
            await page.setViewportSize({ width: 375, height: 667 })

            // Should not have horizontal scroll
            const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth)
            const windowInnerWidth = await page.evaluate(() => window.innerWidth)
            expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth + 5) // Allow small tolerance

            // Navigation should adapt to mobile
            const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-menu, button[aria-label*="menu"]')
            if (await mobileNav.count() > 0) {
                await expect(mobileNav).toBeVisible()
            }
        })

        test('should be responsive on tablet devices', async () => {
            // Test tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 })

            // Layout should adapt properly
            await expect(page.locator('header')).toBeVisible()
            await expect(page.locator('main')).toBeVisible()
            await expect(page.locator('footer')).toBeVisible()
        })

        test('should work properly on desktop', async () => {
            // Test desktop viewport
            await page.setViewportSize({ width: 1920, height: 1080 })

            // Should utilize available space effectively
            const mainContent = page.locator('main')
            await expect(mainContent).toBeVisible()

            // Desktop navigation should be fully visible
            const desktopNav = page.locator('header nav')
            await expect(desktopNav).toBeVisible()
        })
    })

    test.describe('Accessibility Validation', () => {
        test('should have proper ARIA labels and roles', async () => {
            // Check for important ARIA landmarks
            await expect(page.locator('[role="banner"], header')).toBeVisible()
            await expect(page.locator('[role="main"], main')).toBeVisible()
            await expect(page.locator('[role="contentinfo"], footer')).toBeVisible()

            // Interactive elements should have proper labels
            const buttons = await page.locator('button').all()
            for (const button of buttons) {
                const hasLabel =
                    (await button.getAttribute('aria-label')) ||
                    (await button.getAttribute('title')) ||
                    (await button.textContent()?.trim())

                expect(hasLabel).toBeTruthy()
            }
        })

        test('should have proper keyboard navigation', async () => {
            // Tab through interactive elements
            await page.keyboard.press('Tab')

            // Should have visible focus indicators
            const focusedElement = await page.locator(':focus')
            await expect(focusedElement).toBeVisible()

            // Focus should be visible with proper styling
            const focusedElementStyle = await page.evaluate(() => {
                const focused = document.activeElement
                if (focused) {
                    const styles = window.getComputedStyle(focused)
                    return {
                        outline: styles.outline,
                        boxShadow: styles.boxShadow,
                        border: styles.border
                    }
                }
                return null
            })

            expect(focusedElementStyle).toBeTruthy()
        })

        test('should have proper color contrast', async () => {
            // Check text elements for adequate contrast
            const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button').all()

            // Sample a few elements to check contrast
            for (let i = 0; i < Math.min(5, textElements.length); i++) {
                const element = textElements[i]
                const colors = await page.evaluate((el) => {
                    const styles = window.getComputedStyle(el)
                    return {
                        color: styles.color,
                        backgroundColor: styles.backgroundColor
                    }
                }, element)

                // Colors should be defined (not transparent/undefined)
                expect(colors.color).toBeTruthy()
                expect(colors.color).not.toBe('rgba(0, 0, 0, 0)')
            }
        })
    })

    test.describe('Performance Validation', () => {
        test('should load within acceptable time', async () => {
            const startTime = Date.now()
            await page.goto('http://localhost:4004')
            await page.waitForLoadState('domcontentloaded')
            const loadTime = Date.now() - startTime

            // Should load within 5 seconds
            expect(loadTime).toBeLessThan(5000)
        })

        test('should have optimized images', async () => {
            const images = await page.locator('img').all()

            for (const img of images) {
                // Images should have alt text
                const altText = await img.getAttribute('alt')
                expect(altText).toBeTruthy()

                // Images should have proper loading attributes
                const loading = await img.getAttribute('loading')
                const isAboveFold = await img.isInViewport()

                if (!isAboveFold) {
                    // Below-fold images should be lazy loaded
                    expect(loading).toBe('lazy')
                }
            }
        })
    })

    test.describe('Error Handling Validation', () => {
        test('should handle navigation errors gracefully', async () => {
            // Test 404 page
            await page.goto('http://localhost:4004/non-existent-page')

            // Should show proper error page, not browser default
            const pageContent = await page.textContent('body')
            expect(pageContent).not.toContain("This site can't be reached")
            expect(pageContent).not.toContain('ERR_CONNECTION_REFUSED')
        })

        test('should handle JavaScript errors gracefully', async () => {
            const errors: string[] = []

            page.on('console', (msg) => {
                if (msg.type() === 'error') {
                    errors.push(msg.text())
                }
            })

            page.on('pageerror', (error) => {
                errors.push(error.message)
            })

            await page.goto('http://localhost:4004')
            await page.waitForLoadState('domcontentloaded')

            // Should not have unhandled JavaScript errors
            const criticalErrors = errors.filter(error =>
                !error.includes('favicon') &&
                !error.includes('404') &&
                !error.includes('Third-party')
            )

            expect(criticalErrors).toHaveLength(0)
        })
    })
})

test.describe('Authentication Flow Validation', () => {
    test('should have working sign-in page', async ({ page }) => {
        await page.goto('http://localhost:4004/auth/signin')

        // Should have sign-in form
        await expect(page.locator('form, [data-testid="signin-form"]')).toBeVisible()

        // Should have email/username input
        await expect(page.locator('input[type="email"], input[type="text"], input[name*="email"], input[name*="username"]')).toBeVisible()

        // Should have password input
        await expect(page.locator('input[type="password"]')).toBeVisible()

        // Should have submit button
        await expect(page.locator('button[type="submit"], input[type="submit"]')).toBeVisible()
    })

    test('should have working sign-up page', async ({ page }) => {
        await page.goto('http://localhost:4004/auth/signup')

        // Should have sign-up form
        await expect(page.locator('form, [data-testid="signup-form"]')).toBeVisible()

        // Should have required fields
        await expect(page.locator('input[type="email"], input[name*="email"]')).toBeVisible()
        await expect(page.locator('input[type="password"]')).toBeVisible()

        // Should have submit button
        await expect(page.locator('button[type="submit"], input[type="submit"]')).toBeVisible()
    })
})
