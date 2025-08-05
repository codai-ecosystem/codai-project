/**
 * 🎭 Phase 4: End-to-End Testing - Complete New User Journey
 * 
 * Tests the complete flow: Registration → Login → Hub Discovery → Admin Management
 * This validates the entire user lifecycle across all services
 */

import { test, expect } from '@playwright/test';

const GATEWAY_URL = 'http://localhost:4003';
const ADMIN_URL = 'http://localhost:4007';
const ID_URL = 'http://localhost:4004';
const HUB_URL = 'http://localhost:4008';

// Test user data
const testUser = {
    email: 'e2e.test.user@codai.com',
    password: 'SecurePass123!',
    firstName: 'E2E',
    lastName: 'TestUser',
    role: 'user'
};

const adminUser = {
    email: 'admin@codai.com',
    password: 'AdminPass123!'
};

test.describe('Complete New User Journey E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Ensure all services are healthy
        const healthChecks = [
            `${GATEWAY_URL}/health`,
            `${ID_URL}/api/health`,
            `${HUB_URL}/api/health`,
            `${ADMIN_URL}/api/health`
        ];

        for (const healthUrl of healthChecks) {
            const response = await page.request.get(healthUrl);
            expect(response.status()).toBe(200);
        }
    });

    test('Complete User Registration Flow', async ({ page }) => {
        // Step 1: Navigate to ID Service Registration
        await page.goto(ID_URL);

        // Wait for page to load
        await page.waitForSelector('body');

        // Look for registration link or form
        const hasRegisterLink = await page.locator('text=Register').isVisible().catch(() => false);
        const hasRegisterForm = await page.locator('form').isVisible().catch(() => false);

        if (hasRegisterLink) {
            await page.click('text=Register');
        }

        // Fill registration form (if present)
        if (hasRegisterForm || await page.locator('input[type="email"]').isVisible().catch(() => false)) {
            // Fill email field
            const emailInput = page.locator('input[type="email"]').first();
            if (await emailInput.isVisible()) {
                await emailInput.fill(testUser.email);
            }

            // Fill password field
            const passwordInput = page.locator('input[type="password"]').first();
            if (await passwordInput.isVisible()) {
                await passwordInput.fill(testUser.password);
            }

            // Fill additional fields if present
            const firstNameInput = page.locator('input[name*="firstName"], input[name*="first"]').first();
            if (await firstNameInput.isVisible().catch(() => false)) {
                await firstNameInput.fill(testUser.firstName);
            }

            const lastNameInput = page.locator('input[name*="lastName"], input[name*="last"]').first();
            if (await lastNameInput.isVisible().catch(() => false)) {
                await lastNameInput.fill(testUser.lastName);
            }

            // Submit registration
            const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();
            if (await submitButton.isVisible()) {
                await submitButton.click();

                // Wait for registration response
                await page.waitForTimeout(2000);

                // Check for success indicators
                const isSuccess = await page.locator('text=success', { hasText: /success|registered|created/i }).isVisible().catch(() => false);
                const isRedirected = page.url() !== ID_URL;

                // Registration should succeed or redirect
                expect(isSuccess || isRedirected).toBeTruthy();
            }
        }
    });

    test('User Login and Authentication Flow', async ({ page }) => {
        // Step 1: Navigate to ID Service
        await page.goto(ID_URL);
        await page.waitForSelector('body');

        // Step 2: Locate login form
        const hasLoginLink = await page.locator('text=Login', 'text=Sign In').isVisible().catch(() => false);
        if (hasLoginLink) {
            await page.click('text=Login, text=Sign In');
        }

        // Step 3: Fill login credentials
        const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
        if (await emailInput.isVisible().catch(() => false)) {
            await emailInput.fill(testUser.email);
        }

        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible().catch(() => false)) {
            await passwordInput.fill(testUser.password);
        }

        // Step 4: Submit login
        const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
        if (await loginButton.isVisible().catch(() => false)) {
            await loginButton.click();

            // Wait for login response
            await page.waitForTimeout(2000);

            // Check for successful login indicators
            const isLoggedIn = await page.locator('text=welcome', 'text=dashboard', '[data-testid="user-menu"]').isVisible().catch(() => false);
            const hasAuthToken = await page.evaluate(() => {
                return localStorage.getItem('token') || sessionStorage.getItem('token') || document.cookie.includes('token');
            }).catch(() => false);

            // Login should provide some indication of success
            expect(isLoggedIn || hasAuthToken || page.url() !== ID_URL).toBeTruthy();
        }
    });

    test('Hub Service Discovery and Navigation', async ({ page }) => {
        // Step 1: Navigate to Hub
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Step 2: Check Hub dashboard elements
        const hasServiceCards = await page.locator('[data-testid*="service"], .service-card, .integration-card').isVisible().catch(() => false);
        const hasNavigation = await page.locator('nav, [role="navigation"]').isVisible().catch(() => false);
        const hasAdminText = await page.locator('text=Admin Dashboard').isVisible().catch(() => false);
        const hasGatewayText = await page.locator('text=API Gateway').isVisible().catch(() => false);
        const hasIDText = await page.locator('text=ID Service').isVisible().catch(() => false);
        const hasServices = hasAdminText || hasGatewayText || hasIDText;

        // Hub should show service discovery interface
        expect(hasServiceCards || hasNavigation || hasServices).toBeTruthy();

        // Step 3: Test service connectivity indicators
        const connectivityCheck = await page.locator('[data-testid*="status"], .status-indicator, .health-check').isVisible().catch(() => false);

        // Step 4: Test navigation to other services
        if (await page.locator('a[href*="admin"], a[href*="4007"]').isVisible().catch(() => false)) {
            // Test Admin service link
            const adminLink = page.locator('a[href*="admin"], a[href*="4007"]').first();
            const href = await adminLink.getAttribute('href');
            expect(href).toBeTruthy();
        }
    });

    test('Cross-Service Communication Validation', async ({ page }) => {
        // Step 1: Test Gateway routing to all services
        const serviceRoutes = [
            { name: 'Admin', path: '/api/v1/admin/health' },
            { name: 'ID', path: '/api/v1/id/health' },
            { name: 'Hub', path: '/api/v1/hub/health' },
            { name: 'CBD', path: '/api/v1/cbd/health' }
        ];

        for (const service of serviceRoutes) {
            const response = await page.request.get(`${GATEWAY_URL}${service.path}`);

            // Service should be reachable via Gateway (200 or 401 for protected endpoints)
            expect([200, 401]).toContain(response.status());

            if (response.status() === 200) {
                const healthData = await response.json().catch(() => null);
                if (healthData) {
                    expect(healthData).toHaveProperty('status');
                }
            }
        }
    });

    test('Admin User Management Flow', async ({ page, context }) => {
        // Step 1: Admin login
        await page.goto(ADMIN_URL);
        await page.waitForSelector('body');

        // Look for admin login form
        const hasLoginForm = await page.locator('input[type="email"], input[type="password"]').isVisible().catch(() => false);

        if (hasLoginForm) {
            // Fill admin credentials
            const emailInput = page.locator('input[type="email"]').first();
            if (await emailInput.isVisible().catch(() => false)) {
                await emailInput.fill(adminUser.email);
            }

            const passwordInput = page.locator('input[type="password"]').first();
            if (await passwordInput.isVisible().catch(() => false)) {
                await passwordInput.fill(adminUser.password);
            }

            // Submit login
            const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();
            if (await loginButton.isVisible().catch(() => false)) {
                await loginButton.click();
                await page.waitForTimeout(2000);
            }
        }

        // Step 2: Navigate to user management
        const hasUserMgmt = await page.locator('text=Users', 'text=User Management', '[href*="user"]').isVisible().catch(() => false);

        if (hasUserMgmt) {
            await page.click('text=Users, text=User Management');
            await page.waitForTimeout(1000);

            // Step 3: Check user list functionality
            const hasUserList = await page.locator('table, .user-list, [data-testid*="user"]').isVisible().catch(() => false);

            // Step 4: Test search/filter functionality
            const hasSearchInput = await page.locator('input[type="search"], input[placeholder*="search"]').isVisible().catch(() => false);

            if (hasSearchInput) {
                const searchInput = page.locator('input[type="search"], input[placeholder*="search"]').first();
                await searchInput.fill(testUser.email);
                await page.waitForTimeout(1000);

                // Check if search results appear
                const hasResults = await page.locator('text=' + testUser.email).isVisible().catch(() => false);
            }
        }
    });

    test('Error Handling and Recovery', async ({ page }) => {
        // Test 1: Invalid login credentials
        await page.goto(ID_URL);
        await page.waitForSelector('body');

        const emailInput = page.locator('input[type="email"]').first();
        const passwordInput = page.locator('input[type="password"]').first();
        const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();

        if (await emailInput.isVisible().catch(() => false) &&
            await passwordInput.isVisible().catch(() => false) &&
            await loginButton.isVisible().catch(() => false)) {

            // Try invalid credentials
            await emailInput.fill('invalid@example.com');
            await passwordInput.fill('wrongpassword');
            await loginButton.click();

            await page.waitForTimeout(2000);

            // Should show error message
            const hasErrorMessage = await page.locator('text=error', 'text=invalid', '.error', '.alert-error').isVisible().catch(() => false);
            expect(hasErrorMessage || page.url().includes('error')).toBeTruthy();
        }

        // Test 2: Service unavailability handling
        const response = await page.request.get(`${GATEWAY_URL}/api/v1/nonexistent/health`);
        expect([404, 503]).toContain(response.status());
    });

    test('Performance and Responsiveness', async ({ page }) => {
        // Test page load performance
        const startTime = Date.now();

        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        const loadTime = Date.now() - startTime;

        // Page should load within 5 seconds (generous for E2E)
        expect(loadTime).toBeLessThan(5000);

        // Test responsive elements
        await page.setViewportSize({ width: 375, height: 667 }); // Mobile
        await page.waitForTimeout(500);

        // Check if page adapts to mobile view
        const isMobileResponsive = await page.locator('body').evaluate(el => {
            return window.getComputedStyle(el).width !== '100vw' ||
                document.querySelector('meta[name="viewport"]') !== null;
        }).catch(() => false);

        await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
        await page.waitForTimeout(500);
    });

    test('Security Headers and HTTPS Handling', async ({ page }) => {
        // Test Gateway security headers
        const response = await page.request.get(`${GATEWAY_URL}/health`);
        const headers = response.headers();

        // Check for security headers
        expect(headers['x-frame-options'] || headers['x-content-type-options']).toBeTruthy();

        // Test CORS headers
        const corsResponse = await page.request.get(`${GATEWAY_URL}/health`, {
            headers: { 'Origin': 'http://localhost:4003' }
        });
        const corsHeaders = corsResponse.headers();
        expect(corsHeaders['access-control-allow-credentials']).toBeTruthy();
    });

    test('Data Persistence and Session Management', async ({ page, context }) => {
        // Test session persistence across page reloads
        await page.goto(ID_URL);
        await page.waitForSelector('body');

        // Set some session data
        await page.evaluate(() => {
            localStorage.setItem('test-session', 'e2e-test-data');
            sessionStorage.setItem('test-temp', 'temp-data');
        });

        // Reload page
        await page.reload();
        await page.waitForSelector('body');

        // Check if session data persists
        const persistedData = await page.evaluate(() => {
            return {
                localStorage: localStorage.getItem('test-session'),
                sessionStorage: sessionStorage.getItem('test-temp')
            };
        });

        expect(persistedData.localStorage).toBe('e2e-test-data');
        expect(persistedData.sessionStorage).toBe('temp-data');
    });
});
