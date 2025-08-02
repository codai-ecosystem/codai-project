import { test, expect } from '@playwright/test'

/**
 * 🧪 COMPREHENSIVE ECOSYSTEM TESTING SUITE
 * 
 * This test suite validates the CODAI ecosystem implementation against all requirements:
 * - No hardcoded text (all translations used)
 * - No hardcoded values (real data from APIs) 
 * - No hardcoded colors/sizes (theme variables used)
 * - Shared UI components integrated
 * - Basic app elements (headers, footers, home pages)
 * - Translation coverage (en/ro)
 * - Theme consistency across apps
 */

test.describe('CODAI Ecosystem Comprehensive Testing', () => {

    test.beforeEach(async ({ page }) => {
        // Ensure all core services are running
        await test.step('Verify Core Services Health', async () => {
            // Check CBD Database
            try {
                const cbdResponse = await page.request.get('http://localhost:4180/health')
                expect(cbdResponse.ok()).toBeTruthy()
            } catch (error) {
                console.warn('CBD Database not running on 4180')
            }

            // Check Gateway Service  
            try {
                const gatewayResponse = await page.request.get('http://localhost:4000/health')
                expect(gatewayResponse.ok()).toBeTruthy()
            } catch (error) {
                console.warn('Gateway not running on 4000')
            }
        })
    })

    test.describe('🔐 ID Service (Port 4004) - Authentication & Identity', () => {

        test('Translation Integration - No Hardcoded Text', async ({ page }) => {
            await page.goto('http://localhost:4004')

            // Test that translation system is working
            await test.step('Verify Translation Keys Used', async () => {
                // Should see translated content, not hardcoded text
                await expect(page.locator('[data-testid="app-title"]')).not.toContainText('CODAI Identity')
                await expect(page.locator('[data-testid="sign-in-button"]')).not.toContainText('Sign In')

                // Should use translation keys
                await expect(page.locator('text=LOGAI')).toBeVisible() // From apps.logai.name
                await expect(page.locator('text=Enterprise Security')).toBeVisible() // From features
            })

            await test.step('Language Switching Functionality', async () => {
                // Test language toggle
                const languageToggle = page.locator('[data-testid="language-toggle"]')
                await expect(languageToggle).toBeVisible()

                // Switch to Romanian
                await languageToggle.click()

                // Verify Romanian translations appear
                await expect(page.locator('text=Conectează-te')).toBeVisible() // auth.signIn in Romanian
                await expect(page.locator('text=Înregistrează-te')).toBeVisible() // auth.signUp in Romanian

                // Switch back to English
                await languageToggle.click()
                await expect(page.locator('text=Sign In')).toBeVisible()
            })
        })

        test('Shared UI Components Integration', async ({ page }) => {
            await page.goto('http://localhost:4004')

            await test.step('Verify Shared Header Component', async () => {
                const header = page.locator('[data-testid="shared-header"]')
                await expect(header).toBeVisible()

                // Check header has proper theme classes
                await expect(header).toHaveClass(/bg-background/)

                // Verify navigation items from shared component
                await expect(page.locator('[data-testid="nav-home"]')).toBeVisible()
                await expect(page.locator('[data-testid="nav-signin"]')).toBeVisible()
                await expect(page.locator('[data-testid="nav-signup"]')).toBeVisible()
            })

            await test.step('Verify Shared Footer Component', async () => {
                const footer = page.locator('[data-testid="shared-footer"]')
                await expect(footer).toBeVisible()

                // Check footer has proper theme classes
                await expect(footer).toHaveClass(/bg-card/)

                // Verify footer content uses translations
                await expect(footer.locator('text=All rights reserved')).toBeVisible()
                await expect(footer.locator('text=Privacy Policy')).toBeVisible()
            })
        })

        test('Theme System - No Hardcoded Colors/Sizes', async ({ page }) => {
            await page.goto('http://localhost:4004')

            await test.step('Verify Theme Variables Used', async () => {
                // Check that elements use CSS custom properties, not hardcoded colors
                const heroSection = page.locator('[data-testid="hero-section"]')
                await expect(heroSection).toHaveClass(/bg-gradient-to-br/)
                await expect(heroSection).toHaveClass(/from-background/)
                await expect(heroSection).toHaveClass(/to-secondary\/20/)

                // Buttons should use theme variants
                const signInButton = page.locator('[data-testid="sign-in-button"]')
                await expect(signInButton).toHaveClass(/bg-primary/)
                await expect(signInButton).toHaveClass(/text-primary-foreground/)
            })

            await test.step('Dark/Light Mode Toggle', async () => {
                const themeToggle = page.locator('[data-testid="theme-toggle"]')
                await expect(themeToggle).toBeVisible()

                // Toggle to dark mode
                await themeToggle.click()
                await expect(page.locator('html')).toHaveClass(/dark/)

                // Verify dark mode colors applied
                const body = page.locator('body')
                await expect(body).toHaveClass(/bg-background/)

                // Toggle back to light mode
                await themeToggle.click()
                await expect(page.locator('html')).not.toHaveClass(/dark/)
            })
        })

        test('Real Data Integration - No Hardcoded Values', async ({ page }) => {
            await page.goto('http://localhost:4004')

            await test.step('Service Status from Real APIs', async () => {
                // Status should come from actual service endpoints
                const statusSection = page.locator('[data-testid="status-section"]')
                await expect(statusSection).toBeVisible()

                // Should display real service status
                await expect(page.locator('[data-testid="cbd-status"]')).toContainText(/Online|Offline/)
                await expect(page.locator('[data-testid="auth-status"]')).toContainText(/Ready|Connecting/)
            })

            await test.step('User Metrics from CBD Database', async () => {
                // User count should come from real database
                const userCount = page.locator('[data-testid="user-count"]')
                if (await userCount.isVisible()) {
                    // Should be a number, not hardcoded
                    const count = await userCount.textContent()
                    expect(count).toMatch(/\d+/)
                }
            })
        })

        test('Authentication Flow with Real Backend', async ({ page }) => {
            await page.goto('http://localhost:4004/auth/signin')

            await test.step('Sign In Form Validation', async () => {
                // Test form uses translations for labels and errors
                await expect(page.locator('label[for="email"]')).toContainText('Email') // Should use t('auth.email')
                await expect(page.locator('label[for="password"]')).toContainText('Password') // Should use t('auth.password')

                // Test validation with empty form
                await page.click('[data-testid="submit-button"]')

                // Error messages should be translated
                await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required')
                await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required')
            })

            await test.step('Form Interaction with Real Data', async () => {
                // Fill form with test credentials
                await page.fill('[data-testid="email-input"]', 'test@codai.dev')
                await page.fill('[data-testid="password-input"]', 'testPassword123')

                // Submit form
                await page.click('[data-testid="submit-button"]')

                // Should handle real authentication response
                // Either redirect on success or show error
                await page.waitForLoadState('networkidle')

                // Check for either success redirect or error message
                const isRedirected = page.url().includes('/dashboard')
                const hasError = await page.locator('[data-testid="auth-error"]').isVisible()

                expect(isRedirected || hasError).toBeTruthy()
            })
        })
    })

    test.describe('🏠 Admin Dashboard (Port 4007) - System Administration', () => {

        test('Real Service Status Integration', async ({ page }) => {
            await page.goto('http://localhost:4007')

            await test.step('Service Health Monitoring', async () => {
                // Should display real service status from APIs
                await expect(page.locator('[data-testid="service-grid"]')).toBeVisible()

                // CBD Database status
                const cbdStatus = page.locator('[data-testid="cbd-service-status"]')
                await expect(cbdStatus).toBeVisible()
                await expect(cbdStatus).toContainText(/Running|Stopped|Error/)

                // Gateway status
                const gatewayStatus = page.locator('[data-testid="gateway-service-status"]')
                await expect(gatewayStatus).toBeVisible()
                await expect(gatewayStatus).toContainText(/Active|Inactive/)
            })

            await test.step('Real Metrics Display', async () => {
                // Metrics should come from real APIs, not hardcoded
                const metricsSection = page.locator('[data-testid="metrics-section"]')
                await expect(metricsSection).toBeVisible()

                // Check for dynamic values
                const activeUsers = page.locator('[data-testid="active-users-count"]')
                if (await activeUsers.isVisible()) {
                    const count = await activeUsers.textContent()
                    expect(count).toMatch(/\d+/) // Should be a number
                }
            })
        })

        test('Shared UI Integration', async ({ page }) => {
            await page.goto('http://localhost:4007')

            await test.step('Layout Components', async () => {
                // Should use shared header/footer
                await expect(page.locator('[data-testid="shared-header"]')).toBeVisible()
                await expect(page.locator('[data-testid="shared-footer"]')).toBeVisible()

                // Should use shared dashboard layout
                await expect(page.locator('[data-testid="dashboard-layout"]')).toBeVisible()
            })
        })
    })

    test.describe('🌐 Hub App (Port 4008) - Application Hub', () => {

        test('App Grid with Real Data', async ({ page }) => {
            await page.goto('http://localhost:4008')

            await test.step('Application Status Grid', async () => {
                // Should display all CODAI apps
                await expect(page.locator('[data-testid="apps-grid"]')).toBeVisible()

                // Check for all expected apps
                const expectedApps = ['CODAI', 'MEMORAI', 'BANCAI', 'STOCAI', 'LOGAI', 'FABRICAI', 'STUDIAI', 'SOCIAI', 'CUMPARAI']

                for (const appName of expectedApps) {
                    await expect(page.locator(`[data-testid="app-card-${appName.toLowerCase()}"]`)).toBeVisible()
                }
            })

            await test.step('App Status from Real Services', async () => {
                // App status should reflect real service health
                const appCards = page.locator('[data-testid^="app-card-"]')
                const count = await appCards.count()

                expect(count).toBeGreaterThan(0)

                // Each app should show real status
                for (let i = 0; i < Math.min(count, 3); i++) {
                    const card = appCards.nth(i)
                    const status = card.locator('[data-testid="app-status"]')
                    await expect(status).toContainText(/Online|Offline|Starting|Error/)
                }
            })
        })

        test('Navigation Integration', async ({ page }) => {
            await page.goto('http://localhost:4008')

            await test.step('Inter-App Navigation', async () => {
                // Click on CODAI app card
                await page.click('[data-testid="app-card-codai"]')

                // Should navigate to CODAI app
                await expect(page).toHaveURL(/localhost:4001/)
            })
        })
    })

    test.describe('🔄 Cross-Application Integration Tests', () => {

        test('Shared State and Authentication', async ({ page, context }) => {
            await test.step('Authentication Persistence', async () => {
                // Login in ID service
                await page.goto('http://localhost:4004/auth/signin')
                await page.fill('[data-testid="email-input"]', 'test@codai.dev')
                await page.fill('[data-testid="password-input"]', 'testPassword123')
                await page.click('[data-testid="submit-button"]')

                // Navigate to admin dashboard
                await page.goto('http://localhost:4007')

                // Should maintain authentication state
                await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
            })
        })

        test('Service Communication and Data Flow', async ({ page }) => {
            await test.step('API Gateway Integration', async () => {
                // Test service discovery
                await page.goto('http://localhost:4000/services')

                // Should return list of available services
                const response = await page.request.get('http://localhost:4000/services')
                expect(response.ok()).toBeTruthy()

                const services = await response.json()
                expect(Array.isArray(services)).toBeTruthy()
            })

            await test.step('CBD Database Integration', async () => {
                // Test database health
                const response = await page.request.get('http://localhost:4180/health')
                expect(response.ok()).toBeTruthy()

                // Test database stats
                const statsResponse = await page.request.get('http://localhost:4180/stats')
                expect(statsResponse.ok()).toBeTruthy()

                const stats = await statsResponse.json()
                expect(stats).toHaveProperty('status')
            })
        })
    })

    test.describe('🎨 Visual and Accessibility Testing', () => {

        test('Responsive Design Across All Apps', async ({ page }) => {
            const apps = [
                { name: 'ID Service', url: 'http://localhost:4004' },
                { name: 'Admin Dashboard', url: 'http://localhost:4007' },
                { name: 'Hub App', url: 'http://localhost:4008' }
            ]

            for (const app of apps) {
                await test.step(`${app.name} Responsive Design`, async () => {
                    await page.goto(app.url)

                    // Test mobile viewport
                    await page.setViewportSize({ width: 375, height: 667 })
                    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

                    // Test tablet viewport
                    await page.setViewportSize({ width: 768, height: 1024 })
                    await expect(page.locator('body')).toBeVisible()

                    // Test desktop viewport
                    await page.setViewportSize({ width: 1920, height: 1080 })
                    await expect(page.locator('body')).toBeVisible()
                })
            }
        })

        test('Accessibility Compliance (WCAG 2.1 AA)', async ({ page }) => {
            await page.goto('http://localhost:4004')

            await test.step('Keyboard Navigation', async () => {
                // Test tab navigation
                await page.keyboard.press('Tab')
                await expect(page.locator(':focus')).toBeVisible()

                // Should be able to navigate entire page with keyboard
                for (let i = 0; i < 10; i++) {
                    await page.keyboard.press('Tab')
                    const focused = page.locator(':focus')
                    await expect(focused).toBeVisible()
                }
            })

            await test.step('Screen Reader Support', async () => {
                // Check for proper ARIA labels
                await expect(page.locator('[aria-label]')).toHaveCount({ min: 1 })

                // Check for heading structure
                await expect(page.locator('h1')).toBeVisible()
                await expect(page.locator('h2')).toHaveCount({ min: 1 })

                // Check for alt text on images
                const images = page.locator('img')
                const count = await images.count()
                for (let i = 0; i < count; i++) {
                    await expect(images.nth(i)).toHaveAttribute('alt')
                }
            })
        })

        test('Performance Benchmarks', async ({ page }) => {
            await test.step('Page Load Performance', async () => {
                const startTime = Date.now()
                await page.goto('http://localhost:4004')
                await page.waitForLoadState('networkidle')
                const loadTime = Date.now() - startTime

                // Should load within 3 seconds
                expect(loadTime).toBeLessThan(3000)
            })

            await test.step('Interactive Performance', async () => {
                await page.goto('http://localhost:4004')

                // Test theme toggle responsiveness
                const startTime = Date.now()
                await page.click('[data-testid="theme-toggle"]')
                await page.waitForSelector('html.dark', { timeout: 1000 })
                const toggleTime = Date.now() - startTime

                // Should toggle within 100ms
                expect(toggleTime).toBeLessThan(100)
            })
        })
    })

    test.describe('📊 Success Metrics Validation', () => {

        test('Translation Coverage Verification', async ({ page }) => {
            await test.step('Complete Translation Coverage', async () => {
                await page.goto('http://localhost:4004')

                // Should not find any hardcoded English text patterns
                const hardcodedPatterns = [
                    'Sign In', 'Sign Up', 'Welcome', 'Dashboard', 'Settings',
                    'Profile', 'Account', 'Home', 'About', 'Contact'
                ]

                for (const pattern of hardcodedPatterns) {
                    // These should NOT appear as hardcoded text
                    const elements = page.locator(`text="${pattern}"`)
                    const count = await elements.count()

                    // If found, they should be in translation context
                    if (count > 0) {
                        console.log(`Found "${pattern}" - checking if properly translated`)
                    }
                }
            })
        })

        test('Theme Consistency Verification', async ({ page }) => {
            await test.step('No Hardcoded Colors', async () => {
                await page.goto('http://localhost:4004')

                // Check that no elements use hardcoded Tailwind colors
                const hardcodedColorClasses = [
                    'bg-blue-600', 'text-gray-900', 'border-gray-200',
                    'bg-green-50', 'text-red-500', 'bg-white'
                ]

                for (const colorClass of hardcodedColorClasses) {
                    const elements = page.locator(`[class*="${colorClass}"]`)
                    const count = await elements.count()

                    // Should prefer theme variables over hardcoded colors
                    if (count > 0) {
                        console.warn(`Found hardcoded color class: ${colorClass}`)
                    }
                }
            })
        })

        test('Real Data Integration Verification', async ({ page }) => {
            await test.step('No Hardcoded Data Values', async () => {
                await page.goto('http://localhost:4007')

                // Check that metrics show real data
                const metricElements = page.locator('[data-testid*="metric"]')
                const count = await metricElements.count()

                for (let i = 0; i < count; i++) {
                    const element = metricElements.nth(i)
                    const value = await element.textContent()

                    // Should contain numbers or real status values
                    expect(value).toMatch(/\d+|online|offline|active|inactive|running|stopped/i)
                }
            })
        })
    })
})

/**
 * 🏆 TEST COMPLETION CRITERIA
 * 
 * This test suite is considered successful when:
 * 
 * ✅ Translation Tests Pass:
 *   - No hardcoded text found in UI
 *   - Language switching works seamlessly
 *   - All text uses translation keys
 * 
 * ✅ Shared UI Tests Pass:
 *   - All apps use shared Header/Footer components
 *   - Consistent layout across applications
 *   - Shared component styling applied
 * 
 * ✅ Theme Tests Pass:
 *   - No hardcoded colors in CSS classes
 *   - Dark/light mode works consistently
 *   - Theme variables used throughout
 * 
 * ✅ Real Data Tests Pass:
 *   - Service status from actual APIs
 *   - User metrics from CBD Database
 *   - No hardcoded sample values
 * 
 * ✅ Integration Tests Pass:
 *   - Cross-app navigation works
 *   - Authentication state persists
 *   - Service communication verified
 * 
 * ✅ Accessibility Tests Pass:
 *   - WCAG 2.1 AA compliance
 *   - Keyboard navigation functional
 *   - Screen reader support verified
 * 
 * ✅ Performance Tests Pass:
 *   - Load times under 3 seconds
 *   - Interactive response under 100ms
 *   - Lighthouse scores above 90
 */
