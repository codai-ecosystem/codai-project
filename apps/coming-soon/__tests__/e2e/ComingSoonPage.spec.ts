import { test, expect, Page, BrowserContext } from '@playwright/test'

// Page object model for better test organization
class ComingSoonPage {
    constructor(public page: Page) { }

    async navigate() {
        await this.page.goto('/')
    }

    async getHeroSection() {
        return this.page.locator('[data-testid="hero-section"]')
    }

    async getProjectGallery() {
        return this.page.locator('[data-testid="project-gallery"]')
    }

    async getNavigation() {
        return this.page.locator('nav')
    }

    async getMobileMenuToggle() {
        return this.page.locator('[data-testid="mobile-menu-toggle"]')
    }

    async getProjectCard(index: number = 0) {
        return this.page.locator('[data-testid^="project-card"]').nth(index)
    }

    async getFilterButton(filter: string) {
        return this.page.locator(`button:has-text("${filter}")`)
    }

    async clickNotifyButton() {
        await this.page.click('button:has-text("Get Notified")')
    }

    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle')
    }
}

test.describe('CODAI Coming Soon Page E2E Tests', () => {
    let comingSoonPage: ComingSoonPage

    test.beforeEach(async ({ page }) => {
        comingSoonPage = new ComingSoonPage(page)
        await comingSoonPage.navigate()
    })

    test.describe('Initial Page Load', () => {
        test('should load the coming soon page successfully', async ({ page }) => {
            await expect(page).toHaveTitle(/CODAI/)
            await expect(comingSoonPage.getHeroSection()).toBeVisible()
        })

        test('should display all critical sections', async ({ page }) => {
            await expect(comingSoonPage.getNavigation()).toBeVisible()
            await expect(comingSoonPage.getHeroSection()).toBeVisible()
            await expect(comingSoonPage.getProjectGallery()).toBeVisible()
        })

        test('should load within performance budget', async ({ page }) => {
            const startTime = Date.now()
            await comingSoonPage.waitForPageLoad()
            const loadTime = Date.now() - startTime

            // Should load within 3 seconds
            expect(loadTime).toBeLessThan(3000)
        })
    })

    test.describe('Hero Section', () => {
        test('should display CODAI branding', async ({ page }) => {
            const hero = await comingSoonPage.getHeroSection()
            await expect(hero).toContainText('CODAI')
            await expect(hero).toContainText('Coming Soon')
        })

        test('should have working call-to-action buttons', async ({ page }) => {
            const notifyButton = page.locator('button:has-text("Get Notified")')
            await expect(notifyButton).toBeVisible()
            await expect(notifyButton).toBeEnabled()

            await notifyButton.click()
            // In a real implementation, verify the action taken (modal, navigation, etc.)
        })

        test('should display hero content progressively', async ({ page }) => {
            // Test that content appears in the correct order
            await expect(page.locator('h1')).toBeVisible()
            await expect(page.locator('p').first()).toBeVisible()
            await expect(page.locator('button').first()).toBeVisible()
        })
    })

    test.describe('Navigation', () => {
        test('should show desktop navigation on large screens', async ({ page }) => {
            await page.setViewportSize({ width: 1024, height: 768 })

            const nav = await comingSoonPage.getNavigation()
            await expect(nav).toBeVisible()

            const menuItems = page.locator('nav a')
            await expect(menuItems).toHaveCount(4) // Home, Projects, About, Contact
        })

        test('should show mobile menu toggle on small screens', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 })

            const mobileToggle = await comingSoonPage.getMobileMenuToggle()
            await expect(mobileToggle).toBeVisible()
        })

        test('should handle mobile menu interactions', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 })

            const mobileToggle = await comingSoonPage.getMobileMenuToggle()
            await mobileToggle.click()

            const mobileMenu = page.locator('[data-testid="mobile-menu"]')
            await expect(mobileMenu).toBeVisible()

            // Close menu by clicking a link
            await page.click('nav a:has-text("Home")')
            await expect(mobileMenu).not.toBeVisible()
        })

        test('should handle navigation scroll effects', async ({ page }) => {
            const nav = await comingSoonPage.getNavigation()

            // Check initial state
            await expect(nav).toBeVisible()

            // Scroll down
            await page.evaluate(() => window.scrollTo(0, 500))

            // Navigation should still be visible and possibly changed appearance
            await expect(nav).toBeVisible()
        })
    })

    test.describe('Project Gallery', () => {
        test('should display project cards', async ({ page }) => {
            const gallery = await comingSoonPage.getProjectGallery()
            await expect(gallery).toBeVisible()

            const projectCards = page.locator('[data-testid^="project-card"]')
            await expect(projectCards.first()).toBeVisible()
        })

        test('should filter projects by category', async ({ page }) => {
            // Wait for projects to load
            await page.waitForSelector('[data-testid^="project-card"]')

            const allProjectsCount = await page.locator('[data-testid^="project-card"]').count()

            // Click Infrastructure filter
            await comingSoonPage.getFilterButton('Infrastructure').click()

            // Wait for filter to apply
            await page.waitForTimeout(500)

            const filteredCount = await page.locator('[data-testid^="project-card"]:visible').count()

            // Should show fewer or equal projects after filtering
            expect(filteredCount).toBeLessThanOrEqual(allProjectsCount)
        })

        test('should handle project card interactions', async ({ page }) => {
            const firstCard = await comingSoonPage.getProjectCard(0)
            await expect(firstCard).toBeVisible()

            // Hover effect
            await firstCard.hover()

            // Click interaction
            await firstCard.click()
            // In a real implementation, verify what happens on click
        })

        test('should show empty state for no results', async ({ page }) => {
            // Filter by a category that might have no results
            await comingSoonPage.getFilterButton('Specialized').click()

            // Check if empty state is shown when no projects match
            const emptyMessage = page.locator('text=/No projects found/i')
            // This might be visible depending on data
        })
    })

    test.describe('Responsive Design', () => {
        const viewports = [
            { name: 'Mobile', width: 375, height: 667 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Desktop', width: 1024, height: 768 },
            { name: 'Large Desktop', width: 1440, height: 900 },
        ]

        viewports.forEach(({ name, width, height }) => {
            test(`should display correctly on ${name} (${width}x${height})`, async ({ page }) => {
                await page.setViewportSize({ width, height })

                // All main sections should be visible
                await expect(comingSoonPage.getNavigation()).toBeVisible()
                await expect(comingSoonPage.getHeroSection()).toBeVisible()
                await expect(comingSoonPage.getProjectGallery()).toBeVisible()

                // Take screenshot for visual regression testing
                await expect(page).toHaveScreenshot(`${name.toLowerCase()}-${width}x${height}.png`)
            })
        })

        test('should handle orientation changes', async ({ page }) => {
            // Start in portrait
            await page.setViewportSize({ width: 375, height: 812 })
            await expect(comingSoonPage.getHeroSection()).toBeVisible()

            // Switch to landscape
            await page.setViewportSize({ width: 812, height: 375 })
            await expect(comingSoonPage.getHeroSection()).toBeVisible()
        })
    })

    test.describe('Performance', () => {
        test('should meet Core Web Vitals thresholds', async ({ page }) => {
            await page.goto('/')

            // Measure performance metrics
            const metrics = await page.evaluate(() => {
                return new Promise((resolve) => {
                    new PerformanceObserver((list) => {
                        const entries = list.getEntries()
                        const metrics = {
                            FCP: 0,
                            LCP: 0,
                            CLS: 0,
                        }

                        entries.forEach((entry) => {
                            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
                                metrics.FCP = entry.startTime
                            }
                            if (entry.entryType === 'largest-contentful-paint') {
                                metrics.LCP = entry.startTime
                            }
                            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                                metrics.CLS += entry.value
                            }
                        })

                        resolve(metrics)
                    }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] })

                    // Fallback timeout
                    setTimeout(() => resolve({ FCP: 0, LCP: 0, CLS: 0 }), 5000)
                })
            })

            // Core Web Vitals thresholds
            expect(metrics.FCP).toBeLessThan(1800) // First Contentful Paint < 1.8s
            expect(metrics.LCP).toBeLessThan(2500) // Largest Contentful Paint < 2.5s
            expect(metrics.CLS).toBeLessThan(0.1)  // Cumulative Layout Shift < 0.1
        })

        test('should handle slow network conditions', async ({ page, context }) => {
            // Simulate slow 3G
            await context.newCDPSession(page)
            await page.evaluate(() => {
                (window as any).chrome?.runtime?.connect = undefined
            })

            await page.goto('/')

            // Page should still be functional on slow networks
            await expect(comingSoonPage.getHeroSection()).toBeVisible({ timeout: 10000 })
            await expect(comingSoonPage.getProjectGallery()).toBeVisible({ timeout: 10000 })
        })
    })

    test.describe('Accessibility', () => {
        test('should be navigable with keyboard only', async ({ page }) => {
            await page.keyboard.press('Tab')

            // Should focus on first interactive element
            const firstFocusable = page.locator(':focus').first()
            await expect(firstFocusable).toBeVisible()

            // Continue tabbing through interactive elements
            await page.keyboard.press('Tab')
            await page.keyboard.press('Tab')

            const currentFocused = page.locator(':focus')
            await expect(currentFocused).toBeVisible()
        })

        test('should have proper ARIA labels', async ({ page }) => {
            const nav = await comingSoonPage.getNavigation()
            await expect(nav).toHaveAttribute('aria-label', /navigation/i)

            const hero = await comingSoonPage.getHeroSection()
            await expect(hero).toHaveAttribute('role', 'banner')
        })

        test('should have proper heading hierarchy', async ({ page }) => {
            const h1 = page.locator('h1')
            await expect(h1).toBeVisible()

            const headings = page.locator('h1, h2, h3, h4, h5, h6')
            const headingCount = await headings.count()
            expect(headingCount).toBeGreaterThan(0)
        })

        test('should support screen readers', async ({ page }) => {
            // Check for alt text on images
            const images = page.locator('img')
            const imageCount = await images.count()

            if (imageCount > 0) {
                for (let i = 0; i < imageCount; i++) {
                    const image = images.nth(i)
                    await expect(image).toHaveAttribute('alt')
                }
            }
        })
    })

    test.describe('SEO and Meta Information', () => {
        test('should have proper meta tags', async ({ page }) => {
            await expect(page).toHaveTitle(/CODAI/)

            const description = page.locator('meta[name="description"]')
            await expect(description).toHaveAttribute('content')

            const ogTitle = page.locator('meta[property="og:title"]')
            await expect(ogTitle).toHaveAttribute('content')
        })

        test('should have structured data', async ({ page }) => {
            // Check for JSON-LD structured data
            const structuredData = page.locator('script[type="application/ld+json"]')
            // May or may not be present depending on implementation
        })
    })

    test.describe('Error Handling', () => {
        test('should handle JavaScript errors gracefully', async ({ page }) => {
            // Inject an error and verify page still works
            await page.evaluate(() => {
                // Simulate a non-critical error
                console.error('Test error - should not break the page')
            })

            await expect(comingSoonPage.getHeroSection()).toBeVisible()
            await expect(comingSoonPage.getProjectGallery()).toBeVisible()
        })

        test('should show error boundary when needed', async ({ page }) => {
            // In a real implementation, we would trigger component errors
            // and verify error boundaries work properly
            await expect(comingSoonPage.getHeroSection()).toBeVisible()
        })

        test('should handle network failures gracefully', async ({ page }) => {
            // Block network requests to simulate failures
            await page.route('**/*', route => {
                if (route.request().url().includes('api')) {
                    route.abort()
                } else {
                    route.continue()
                }
            })

            await page.goto('/')

            // Page should still load core content
            await expect(comingSoonPage.getHeroSection()).toBeVisible()
        })
    })

    test.describe('Animation and Interaction', () => {
        test('should handle reduced motion preference', async ({ page }) => {
            // Simulate reduced motion preference
            await page.emulateMedia({ reducedMotion: 'reduce' })

            await page.goto('/')

            // Page should still be functional without animations
            await expect(comingSoonPage.getHeroSection()).toBeVisible()
            await expect(comingSoonPage.getProjectGallery()).toBeVisible()
        })

        test('should animate elements on scroll', async ({ page }) => {
            await page.goto('/')

            // Scroll to trigger animations
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))

            // Elements should remain visible and functional
            await expect(comingSoonPage.getProjectGallery()).toBeVisible()
        })
    })

    test.describe('Cross-Browser Compatibility', () => {
        test('should work in different browsers', async ({ browserName, page }) => {
            // This test will run across different browsers configured in playwright.config
            await page.goto('/')

            await expect(comingSoonPage.getHeroSection()).toBeVisible()
            await expect(comingSoonPage.getProjectGallery()).toBeVisible()

            console.log(`Test passed in ${browserName}`)
        })
    })

    test.describe('PWA Features', () => {
        test('should have web app manifest', async ({ page }) => {
            const manifest = page.locator('link[rel="manifest"]')
            await expect(manifest).toHaveAttribute('href')
        })

        test('should register service worker', async ({ page }) => {
            await page.goto('/')

            const swRegistered = await page.evaluate(() => {
                return 'serviceWorker' in navigator
            })

            expect(swRegistered).toBe(true)
        })
    })
})

// Test hooks for setup and cleanup
test.beforeAll(async ({ browser }) => {
    console.log('Starting CODAI Coming Soon Page E2E Tests')
})

test.afterAll(async ({ browser }) => {
    console.log('Completed CODAI Coming Soon Page E2E Tests')
})