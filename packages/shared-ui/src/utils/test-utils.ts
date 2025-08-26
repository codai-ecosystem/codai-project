/**
 * Comprehensive Testing Utilities for CODAI Ecosystem
 * Provides testing helpers for unit tests, integration tests, and E2E tests
 */

import { test as base, expect, type Page, type Locator } from '@playwright/test'
import { type AppName, appThemes } from '../config/app-themes'
import { ACCESSIBILITY_CONFIG, PERFORMANCE_THRESHOLDS, SECURITY_CONFIG } from '../config/test-config'

// Extended test with custom fixtures
export const test = base.extend<{
    appPage: Page
    authenticatedPage: Page
}>({
    appPage: async ({ page }, use) => {
        // Custom page setup for CODAI apps
        await page.goto('/')
        await page.waitForLoadState('networkidle')
        await use(page)
    },
    authenticatedPage: async ({ page }, use) => {
        // Login and authenticate
        await page.goto('/login')
        await page.fill('[data-testid="email"]', 'test@codai.ro')
        await page.fill('[data-testid="password"]', 'test123')
        await page.click('[data-testid="login-button"]')
        await page.waitForURL('/dashboard')
        await use(page)
    }
})

// Custom expect matchers
export { expect }

// App-specific testing utilities
export class AppTestUtils {
    constructor(private page: Page, private appName: AppName) { }

    async validateTheme() {
        const theme = appThemes[this.appName]

        // Check if theme is applied
        const htmlElement = this.page.locator('html')
        await expect(htmlElement).toHaveAttribute('data-app', this.appName)

        // Validate gradient background
        const bodyStyle = await this.page.evaluate(() => {
            return window.getComputedStyle(document.body).background
        })

        expect(bodyStyle).toContain('linear-gradient')

        // Check CSS custom properties
        const primaryColor = await this.page.evaluate(() => {
            return window.getComputedStyle(document.documentElement)
                .getPropertyValue('--color-primary')
        })

        expect(primaryColor).toBeTruthy()
    }

    async validateI18n(locale: 'en' | 'ro' = 'en') {
        // Check language attribute
        const htmlElement = this.page.locator('html')
        await expect(htmlElement).toHaveAttribute('lang', locale)

        // Validate no hardcoded text (should use translation keys)
        const textContent = await this.page.textContent('body')

        // Common hardcoded patterns to avoid
        const hardcodedPatterns = [
            /Hello World/i,
            /Click here/i,
            /Lorem ipsum/i,
            /Test text/i
        ]

        for (const pattern of hardcodedPatterns) {
            expect(textContent).not.toMatch(pattern)
        }
    }

    async validateAccessibility() {
        // Check for proper heading hierarchy
        const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all()
        expect(headings.length).toBeGreaterThan(0)

        // Validate main landmark
        const main = this.page.locator('main')
        await expect(main).toBeVisible()

        // Check for skip links
        const skipLink = this.page.locator('[href="#main"], [href="#content"]')
        expect(await skipLink.count()).toBeGreaterThan(0)

        // Validate form labels
        const inputs = await this.page.locator('input:not([type="hidden"])').all()
        for (const input of inputs) {
            const id = await input.getAttribute('id')
            if (id) {
                const label = this.page.locator(`label[for="${id}"]`)
                await expect(label).toBeVisible()
            }
        }
    }

    async validateResponsiveDesign() {
        const viewports = [
            { width: 320, height: 568, name: 'mobile' },
            { width: 768, height: 1024, name: 'tablet' },
            { width: 1024, height: 768, name: 'desktop' },
            { width: 1920, height: 1080, name: 'large-desktop' }
        ]

        for (const viewport of viewports) {
            await this.page.setViewportSize({ width: viewport.width, height: viewport.height })
            await this.page.waitForTimeout(500) // Allow layout to settle

            // Check that navigation is accessible
            const nav = this.page.locator('nav, [role="navigation"]')
            await expect(nav).toBeVisible()

            // Validate no horizontal scroll
            const horizontalScroll = await this.page.evaluate(() => {
                return document.documentElement.scrollWidth > document.documentElement.clientWidth
            })

            expect(horizontalScroll).toBeFalsy()
        }
    }

    async validatePerformance() {
        // Start performance measurement
        await this.page.goto(this.page.url(), { waitUntil: 'networkidle' })

        const performanceMetrics = await this.page.evaluate(() => {
            const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.startTime,
                loadComplete: timing.loadEventEnd - timing.startTime,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
            }
        })

        // Validate against thresholds
        expect(performanceMetrics.firstContentfulPaint).toBeLessThan(PERFORMANCE_THRESHOLDS['first-contentful-paint'])
        expect(performanceMetrics.domContentLoaded).toBeLessThan(3000)
        expect(performanceMetrics.loadComplete).toBeLessThan(5000)
    }

    async validateSecurity() {
        const response = await this.page.goto(this.page.url())
        const headers = response?.headers() || {}

        // Check security headers
        for (const header of SECURITY_CONFIG.headers) {
            expect(headers[header.toLowerCase()]).toBeTruthy()
        }

        // Check for secure cookies
        const cookies = await this.page.context().cookies()
        const secureCookies = cookies.filter(cookie => cookie.secure)
        expect(secureCookies.length).toBeGreaterThan(0)

        // Validate HTTPS in production
        if (process.env.NODE_ENV === 'production') {
            expect(this.page.url()).toMatch(/^https:\/\//)
        }
    }

    async validateSharedUIIntegration() {
        // Check if shared-ui components are loaded
        const sharedUIComponents = [
            '[data-component="Button"]',
            '[data-component="Card"]',
            '[data-component="Input"]',
            '[data-component="Layout"]'
        ]

        let foundComponents = 0
        for (const selector of sharedUIComponents) {
            const count = await this.page.locator(selector).count()
            if (count > 0) foundComponents++
        }

        expect(foundComponents).toBeGreaterThan(0)
    }
}

// Testing helpers for different component types
export class ComponentTestUtils {
    constructor(private page: Page) { }

    async testButton(selector: string) {
        const button = this.page.locator(selector)

        // Visibility and accessibility
        await expect(button).toBeVisible()
        await expect(button).toBeEnabled()

        // Keyboard navigation
        await button.focus()
        await expect(button).toBeFocused()

        // Click interaction
        await button.click()

        // Check for proper button attributes
        const role = await button.getAttribute('role')
        const ariaLabel = await button.getAttribute('aria-label')

        expect(role === 'button' || await button.evaluate(el => el.tagName.toLowerCase() === 'button')).toBeTruthy()
    }

    async testForm(formSelector: string) {
        const form = this.page.locator(formSelector)
        await expect(form).toBeVisible()

        // Find all form inputs
        const inputs = await form.locator('input, select, textarea').all()

        for (const input of inputs) {
            const type = await input.getAttribute('type')
            const required = await input.getAttribute('required')

            // Test required field validation
            if (required !== null) {
                await input.focus()
                await input.blur()

                // Check for validation message
                const validationMessage = form.locator('.error-message, .validation-error, [role="alert"]')
                await expect(validationMessage).toBeVisible()
            }
        }
    }

    async testModal(triggerSelector: string, modalSelector: string) {
        // Open modal
        await this.page.click(triggerSelector)
        const modal = this.page.locator(modalSelector)
        await expect(modal).toBeVisible()

        // Check accessibility
        await expect(modal).toHaveAttribute('role', 'dialog')
        await expect(modal).toHaveAttribute('aria-modal', 'true')

        // Test escape key closing
        await this.page.keyboard.press('Escape')
        await expect(modal).not.toBeVisible()

        // Test overlay click closing
        await this.page.click(triggerSelector)
        await expect(modal).toBeVisible()

        const overlay = modal.locator('..').first()
        await overlay.click({ position: { x: 10, y: 10 } })
        await expect(modal).not.toBeVisible()
    }

    async testNavigation(navSelector: string) {
        const nav = this.page.locator(navSelector)
        await expect(nav).toBeVisible()

        // Find navigation links
        const links = await nav.locator('a, [role="link"]').all()
        expect(links.length).toBeGreaterThan(0)

        for (const link of links) {
            // Check accessibility
            const href = await link.getAttribute('href')
            const ariaLabel = await link.getAttribute('aria-label')
            const textContent = await link.textContent()

            expect(href || ariaLabel || textContent).toBeTruthy()

            // Test keyboard navigation
            await link.focus()
            await expect(link).toBeFocused()
        }
    }
}

// Utility functions for common test scenarios
export async function setupTestApp(page: Page, appName: AppName) {
    const appUtils = new AppTestUtils(page, appName)

    // Set app-specific context
    await page.addInitScript((name) => {
        (window as any).__CODAI_APP_NAME__ = name
    }, appName)

    return appUtils
}

export async function takeAccessibilitySnapshot(page: Page, name: string) {
    // Take screenshot for visual regression testing
    await page.screenshot({
        path: `test-results/accessibility-${name}.png`,
        fullPage: true
    })
}

export async function validateCrossAppCommunication(page: Page, targetApp: string) {
    // Test PostMessage API between apps
    const messageReceived = page.waitForEvent('console', msg =>
        msg.text().includes(`Message from ${targetApp}`)
    )

    await page.evaluate((app) => {
        window.postMessage({
            type: 'CODAI_APP_MESSAGE',
            source: (window as any).__CODAI_APP_NAME__,
            target: app,
            data: { test: true }
        }, '*')
    }, targetApp)

    await messageReceived
}

// Export main testing utilities
export default {
    AppTestUtils,
    ComponentTestUtils,
    setupTestApp,
    takeAccessibilitySnapshot,
    validateCrossAppCommunication
}
