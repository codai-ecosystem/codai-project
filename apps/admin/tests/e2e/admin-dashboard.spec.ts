import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard - End-to-End Testing', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to admin dashboard
        await page.goto('/admin')

        // Wait for the dashboard to load
        await page.waitForSelector('[data-testid="admin-dashboard"]', { timeout: 10000 })
    })

    test.describe('Dashboard Loading & Initial State', () => {
        test('should load admin dashboard successfully', async ({ page }) => {
            // Verify main elements are visible
            await expect(page.locator('text=ADMIN')).toBeVisible()
            await expect(page.locator('text=System Administration & Management')).toBeVisible()
            await expect(page.locator('text=Administrator')).toBeVisible()
        })

        test('should display all system status cards', async ({ page }) => {
            await expect(page.locator('text=Server Status')).toBeVisible()
            await expect(page.locator('text=Active Users')).toBeVisible()
            await expect(page.locator('text=Database Health')).toBeVisible()
            await expect(page.locator('text=Security Score')).toBeVisible()
        })

        test('should show system status values', async ({ page }) => {
            await expect(page.locator('text=Online')).toBeVisible()
            await expect(page.locator('text=1,847')).toBeVisible()
            await expect(page.locator('text=Optimal')).toBeVisible()
            await expect(page.locator('text=98/100')).toBeVisible()
        })
    })

    test.describe('Demo Mode Functionality', () => {
        test('should show demo mode with URL parameter', async ({ page }) => {
            await page.goto('/admin?demo=true')
            await page.waitForSelector('text=Demo Mode Active')

            await expect(page.locator('text=Demo Mode Active')).toBeVisible()
            await expect(page.locator('text=Full admin functionality available for testing')).toBeVisible()
        })

        test('should hide demo mode in production-like environment', async ({ page }) => {
            await page.goto('/admin')

            // Demo mode should not be visible without explicit activation
            await expect(page.locator('text=Demo Mode Active')).not.toBeVisible()
        })
    })

    test.describe('System Resources Monitoring', () => {
        test('should display system resources section', async ({ page }) => {
            await expect(page.locator('text=System Resources')).toBeVisible()
            await expect(page.locator('text=Real-time system performance monitoring')).toBeVisible()
        })

        test('should show resource usage metrics', async ({ page }) => {
            await expect(page.locator('text=CPU Usage')).toBeVisible()
            await expect(page.locator('text=67%')).toBeVisible()

            await expect(page.locator('text=Memory')).toBeVisible()
            await expect(page.locator('text=54%')).toBeVisible()

            await expect(page.locator('text=Disk Space')).toBeVisible()
            await expect(page.locator('text=23%')).toBeVisible()
        })

        test('should render progress bars for resources', async ({ page }) => {
            const progressBars = page.locator('.bg-gray-700.rounded-full.h-2')
            await expect(progressBars).toHaveCount(3)

            // Check that progress bars have filled portions
            const filledBars = page.locator('[style*="width: 67%"], [style*="width: 54%"], [style*="width: 23%"]')
            await expect(filledBars).toHaveCount(3)
        })
    })

    test.describe('Recent Activities Display', () => {
        test('should show recent activities section', async ({ page }) => {
            await expect(page.locator('text=Recent Activities')).toBeVisible()
            await expect(page.locator('text=Latest system events and actions')).toBeVisible()
        })

        test('should display activity entries with timestamps', async ({ page }) => {
            await expect(page.locator('text=Database backup completed')).toBeVisible()
            await expect(page.locator('text=2 minutes ago')).toBeVisible()

            await expect(page.locator('text=High memory usage detected')).toBeVisible()
            await expect(page.locator('text=15 minutes ago')).toBeVisible()

            await expect(page.locator('text=New admin user created')).toBeVisible()
            await expect(page.locator('text=1 hour ago')).toBeVisible()
        })

        test('should display appropriate activity icons', async ({ page }) => {
            // Check for SVG icons in activities section
            const activitiesSection = page.locator('text=Recent Activities').locator('..')
            const icons = activitiesSection.locator('svg')

            await expect(icons).toHaveCount(4) // Including section header icon
        })
    })

    test.describe('Quick Actions Interface', () => {
        test('should display quick actions section', async ({ page }) => {
            await expect(page.locator('text=Quick Actions')).toBeVisible()
            await expect(page.locator('text=Common administrative tasks and system controls')).toBeVisible()
        })

        test('should show all quick action buttons', async ({ page }) => {
            await expect(page.locator('button', { hasText: 'User Management' })).toBeVisible()
            await expect(page.locator('button', { hasText: 'Database Admin' })).toBeVisible()
            await expect(page.locator('button', { hasText: 'Security Settings' })).toBeVisible()
            await expect(page.locator('button', { hasText: 'Analytics' })).toBeVisible()
            await expect(page.locator('button', { hasText: 'System Backup' })).toBeVisible()
            await expect(page.locator('button', { hasText: 'System Config' })).toBeVisible()
        })

        test('should handle button interactions', async ({ page }) => {
            const userManagementButton = page.locator('button', { hasText: 'User Management' })

            // Test hover effect
            await userManagementButton.hover()

            // Test click interaction
            await userManagementButton.click()

            // Button should remain visible after click
            await expect(userManagementButton).toBeVisible()
        })

        test('should support keyboard navigation', async ({ page }) => {
            // Focus first button with tab
            await page.keyboard.press('Tab')

            const firstButton = page.locator('button', { hasText: 'User Management' })
            await expect(firstButton).toBeFocused()

            // Navigate to next button
            await page.keyboard.press('Tab')

            const secondButton = page.locator('button', { hasText: 'Database Admin' })
            await expect(secondButton).toBeFocused()

            // Activate with Enter
            await page.keyboard.press('Enter')
            await expect(secondButton).toBeFocused()
        })
    })

    test.describe('Responsive Design Testing', () => {
        test('should work correctly on mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 })

            // Main content should still be visible
            await expect(page.locator('text=ADMIN')).toBeVisible()
            await expect(page.locator('text=System Administration & Management')).toBeVisible()

            // Status cards should stack vertically
            const statusCards = page.locator('article').first()
            await expect(statusCards).toBeVisible()
        })

        test('should work correctly on tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 })

            // All main sections should be visible
            await expect(page.locator('text=System Resources')).toBeVisible()
            await expect(page.locator('text=Recent Activities')).toBeVisible()
            await expect(page.locator('text=Quick Actions')).toBeVisible()
        })

        test('should work correctly on desktop viewport', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 })

            // All elements should be properly arranged
            await expect(page.locator('text=ADMIN')).toBeVisible()

            // Quick actions should be in a 6-column grid on large screens
            const quickActionsGrid = page.locator('text=Quick Actions').locator('..')
            const buttons = quickActionsGrid.locator('button')
            await expect(buttons).toHaveCount(6)
        })
    })

    test.describe('Visual Integrity Testing', () => {
        test('should maintain consistent visual appearance', async ({ page }) => {
            // Take screenshot for visual regression testing
            await expect(page).toHaveScreenshot('admin-dashboard-full.png')
        })

        test('should display gradient backgrounds correctly', async ({ page }) => {
            const mainContainer = page.locator('.min-h-screen').first()

            // Check computed styles for gradient
            const backgroundImage = await mainContainer.evaluate(el =>
                window.getComputedStyle(el).backgroundImage
            )

            expect(backgroundImage).toContain('gradient')
        })

        test('should apply backdrop blur effects', async ({ page }) => {
            const blurElements = page.locator('.backdrop-blur-sm')

            // Should have multiple elements with backdrop blur
            await expect(blurElements).toHaveCount(6) // Header + 5 cards/sections
        })
    })

    test.describe('Performance Testing', () => {
        test('should load within acceptable time limits', async ({ page }) => {
            const startTime = Date.now()

            await page.goto('/admin')
            await page.waitForSelector('text=ADMIN')

            const loadTime = Date.now() - startTime
            expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
        })

        test('should handle rapid interactions without issues', async ({ page }) => {
            const buttons = page.locator('button')

            // Rapidly click multiple buttons
            for (let i = 0; i < 5; i++) {
                await buttons.nth(0).click()
                await buttons.nth(1).click()
                await buttons.nth(2).click()
            }

            // Dashboard should remain stable
            await expect(page.locator('text=ADMIN')).toBeVisible()
        })
    })

    test.describe('Cross-Browser Compatibility', () => {
        test('should display correctly in different browsers', async ({ page, browserName }) => {
            // Test basic functionality across browsers
            await expect(page.locator('text=ADMIN')).toBeVisible()
            await expect(page.locator('text=System Status')).toBeVisible()

            // Quick actions should work in all browsers
            const button = page.locator('button', { hasText: 'User Management' })
            await button.click()
            await expect(button).toBeVisible()

            console.log(`Test passed in ${browserName}`)
        })
    })

    test.describe('Security & Error Handling', () => {
        test('should handle navigation errors gracefully', async ({ page }) => {
            // Test with invalid query parameters
            await page.goto('/admin?invalid=test&malicious=<script>')

            // Should still load normally
            await expect(page.locator('text=ADMIN')).toBeVisible()
        })

        test('should sanitize demo mode parameter', async ({ page }) => {
            // Test with potentially malicious demo parameter
            await page.goto('/admin?demo=true&xss=<script>alert("xss")</script>')

            // Should show demo mode but not execute scripts
            await expect(page.locator('text=Demo Mode Active')).toBeVisible()

            // No alert should appear
            page.on('dialog', () => {
                throw new Error('Unexpected alert dialog')
            })
        })
    })

    test.describe('Integration Testing', () => {
        test('should integrate with parent application layout', async ({ page }) => {
            // Admin dashboard should work within the larger app context
            await expect(page.locator('text=ADMIN')).toBeVisible()

            // Check that styles don't conflict with parent styles
            const adminTitle = page.locator('text=ADMIN')
            const titleColor = await adminTitle.evaluate(el =>
                window.getComputedStyle(el).color
            )

            // Should have gradient text (transparent color)
            expect(titleColor).toBe('rgba(0, 0, 0, 0)')
        })

        test('should maintain state across page interactions', async ({ page }) => {
            // Interact with multiple elements
            await page.locator('button', { hasText: 'User Management' }).click()
            await page.locator('button', { hasText: 'Analytics' }).click()

            // Status values should remain consistent
            await expect(page.locator('text=Online')).toBeVisible()
            await expect(page.locator('text=1,847')).toBeVisible()
        })
    })
})
