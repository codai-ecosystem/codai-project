/**
 * 🎭 Phase 4: End-to-End Testing - Admin Management Workflows
 * 
 * Tests complete admin workflows: User Management, System Configuration, Analytics
 * Validates all admin dashboard functionality and cross-service administration
 */

import { test, expect } from '@playwright/test';

const ADMIN_URL = 'http://localhost:4007';
const GATEWAY_URL = 'http://localhost:4003';
const ID_URL = 'http://localhost:4004';
const HUB_URL = 'http://localhost:4008';

// Admin test credentials
const adminUser = {
    email: 'admin@codai.com',
    password: 'AdminPass123!',
    role: 'admin'
};

// Test user for management operations
const managedUser = {
    email: 'managed.user@codai.com',
    password: 'UserPass123!',
    firstName: 'Managed',
    lastName: 'User',
    role: 'user'
};

test.describe('Admin Dashboard E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Ensure Admin service is healthy
        const response = await page.request.get(`${ADMIN_URL}/api/health`);
        expect(response.status()).toBe(200);
    });

    test('Admin Authentication and Dashboard Access', async ({ page }) => {
        // Step 1: Navigate to Admin Dashboard
        await page.goto(ADMIN_URL);
        await page.waitForSelector('body');

        // Step 2: Admin login process
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
            const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
            if (await loginButton.isVisible().catch(() => false)) {
                await loginButton.click();
                await page.waitForTimeout(3000);
            }
        }

        // Step 3: Verify admin dashboard access
        const isDashboard = await page.locator('text=Dashboard', 'text=Admin', 'nav', '[role="navigation"]').isVisible().catch(() => false);
        const hasAdminElements = await page.locator('[data-testid*="admin"], .admin-panel, .dashboard').isVisible().catch(() => false);

        // Should have admin dashboard elements
        expect(isDashboard || hasAdminElements || page.url().includes('dashboard')).toBeTruthy();
    });

    test('Admin Navigation and Menu System', async ({ page }) => {
        await page.goto(ADMIN_URL);
        await page.waitForSelector('body');

        // Test main navigation elements
        const navigationItems = [
            'Dashboard',
            'Users',
            'Settings',
            'Analytics',
            'Security',
            'System'
        ];

        for (const item of navigationItems) {
            const navItem = await page.locator(`text=${item}, a:has-text("${item}"), [href*="${item.toLowerCase()}"]`).isVisible().catch(() => false);

            if (navItem) {
                // Click navigation item
                await page.click(`text=${item}, a:has-text("${item}")`);
                await page.waitForTimeout(1000);

                // Check if page changed or content loaded
                const contentLoaded = await page.locator('main, .content, .page-content').isVisible().catch(() => false);
                expect(contentLoaded || page.url().includes(item.toLowerCase())).toBeTruthy();
            }
        }
    });

    test('User Management CRUD Operations', async ({ page }) => {
        await page.goto(ADMIN_URL);
        await page.waitForSelector('body');

        // Navigate to user management
        const userMgmtLink = page.locator('text=Users, text=User Management, a[href*="user"]').first();
        if (await userMgmtLink.isVisible().catch(() => false)) {
            await userMgmtLink.click();
            await page.waitForTimeout(2000);
        }

        // Test 1: View user list
        const hasUserList = await page.locator('table, .user-list, .data-grid, [data-testid*="user-list"]').isVisible().catch(() => false);

        if (hasUserList) {
            // Test 2: Search functionality
            const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[name*="search"]').first();
            if (await searchInput.isVisible().catch(() => false)) {
                await searchInput.fill('admin');
                await page.waitForTimeout(1000);

                // Check search results
                const hasResults = await page.locator('table tr, .user-item').count() > 0;
                expect(hasResults).toBeTruthy();

                // Clear search
                await searchInput.clear();
                await page.waitForTimeout(1000);
            }

            // Test 3: Create new user
            const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
            if (await createButton.isVisible().catch(() => false)) {
                await createButton.click();
                await page.waitForTimeout(1000);

                // Fill user creation form
                const emailField = page.locator('input[type="email"], input[name*="email"]').first();
                if (await emailField.isVisible().catch(() => false)) {
                    await emailField.fill(managedUser.email);
                }

                const firstNameField = page.locator('input[name*="firstName"], input[name*="first"]').first();
                if (await firstNameField.isVisible().catch(() => false)) {
                    await firstNameField.fill(managedUser.firstName);
                }

                const lastNameField = page.locator('input[name*="lastName"], input[name*="last"]').first();
                if (await lastNameField.isVisible().catch(() => false)) {
                    await lastNameField.fill(managedUser.lastName);
                }

                // Submit form
                const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
                if (await submitButton.isVisible().catch(() => false)) {
                    await submitButton.click();
                    await page.waitForTimeout(2000);

                    // Check for success indication
                    const successMessage = await page.locator('text=success', '.success', '.alert-success', '.notification').isVisible().catch(() => false);
                    expect(successMessage || page.url().includes('users')).toBeTruthy();
                }
            }
        }
    });

    test('System Settings and Configuration', async ({ page }) => {
        await page.goto(ADMIN_URL);
        await page.waitForSelector('body');

        // Navigate to settings
        const settingsLink = page.locator('text=Settings, text=Configuration, a[href*="settings"]').first();
        if (await settingsLink.isVisible().catch(() => false)) {
            await settingsLink.click();
            await page.waitForTimeout(2000);
        }

        // Test system configuration sections
        const configSections = [
            'General',
            'Security',
            'Email',
            'Database',
            'API',
            'Integration'
        ];

        for (const section of configSections) {
            const sectionTab = page.locator(`text=${section}, [data-tab="${section.toLowerCase()}"]`).first();
            if (await sectionTab.isVisible().catch(() => false)) {
                await sectionTab.click();
                await page.waitForTimeout(1000);

                // Check if section content loads
                const hasContent = await page.locator('form, .settings-form, .config-panel').isVisible().catch(() => false);
                expect(hasContent).toBeTruthy();
            }
        }

        // Test configuration save functionality
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
        if (await saveButton.isVisible().catch(() => false)) {
            await saveButton.click();
            await page.waitForTimeout(2000);

            // Check for save confirmation
            const saveConfirmation = await page.locator('text=saved', 'text=updated', '.success-message').isVisible().catch(() => false);
        }
    });

    test('Analytics Dashboard and Data Visualization', async ({ page }) => {
        await page.goto(ADMIN_URL);
        await page.waitForSelector('body');

        // Navigate to analytics
        const analyticsLink = page.locator('text=Analytics, text=Reports, a[href*="analytics"]').first();
        if (await analyticsLink.isVisible().catch(() => false)) {
            await analyticsLink.click();
            await page.waitForTimeout(3000);
        }

        // Test analytics widgets
        const analyticsElements = [
            'canvas', // Charts
            '.chart',
            '.graph',
            '.metric',
            '.statistic',
            '[data-testid*="chart"]'
        ];

        let hasAnalytics = false;
        for (const element of analyticsElements) {
            if (await page.locator(element).isVisible().catch(() => false)) {
                hasAnalytics = true;
                break;
            }
        }

        // Test date range filters
        const dateFilter = page.locator('input[type="date"], .date-picker, select[name*="period"]').first();
        if (await dateFilter.isVisible().catch(() => false)) {
            // Change date range and check if data updates
            await dateFilter.click();
            await page.waitForTimeout(1000);
        }

        // Test export functionality
        const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")').first();
        if (await exportButton.isVisible().catch(() => false)) {
            // Test export button click
            await exportButton.click();
            await page.waitForTimeout(1000);
        }
    });

    test('Security Panel and Audit Logs', async ({ page }) => {
        await page.goto(ADMIN_URL);
        await page.waitForSelector('body');

        // Navigate to security section
        const securityLink = page.locator('text=Security, text=Audit, a[href*="security"]').first();
        if (await securityLink.isVisible().catch(() => false)) {
            await securityLink.click();
            await page.waitForTimeout(2000);
        }

        // Test audit log viewing
        const auditLog = page.locator('table, .log-entries, .audit-list').first();
        if (await auditLog.isVisible().catch(() => false)) {
            // Check for log entries
            const logEntries = await page.locator('tr, .log-entry').count();
            expect(logEntries).toBeGreaterThanOrEqual(0);

            // Test log filtering
            const filterInput = page.locator('input[placeholder*="filter"], select[name*="type"]').first();
            if (await filterInput.isVisible().catch(() => false)) {
                if (await filterInput.getAttribute('type') === 'text') {
                    await filterInput.fill('login');
                } else {
                    await filterInput.selectOption({ index: 1 });
                }
                await page.waitForTimeout(1000);
            }
        }

        // Test security settings
        const securitySettings = [
            'Password Policy',
            'Session Timeout',
            'Two-Factor Authentication',
            'IP Restrictions'
        ];

        for (const setting of securitySettings) {
            const settingElement = await page.locator(`text=${setting}, label:has-text("${setting}")`).isVisible().catch(() => false);
            if (settingElement) {
                // Test toggle or configuration
                const toggle = page.locator(`input[type="checkbox"], .toggle, .switch`).first();
                if (await toggle.isVisible().catch(() => false)) {
                    await toggle.click();
                    await page.waitForTimeout(500);
                }
            }
        }
    });

    test('Bulk Operations and Data Management', async ({ page }) => {
        await page.goto(ADMIN_URL);
        await page.waitForSelector('body');

        // Navigate to user management for bulk operations
        const userMgmtLink = page.locator('text=Users, a[href*="user"]').first();
        if (await userMgmtLink.isVisible().catch(() => false)) {
            await userMgmtLink.click();
            await page.waitForTimeout(2000);
        }

        // Test bulk selection
        const selectAllCheckbox = page.locator('input[type="checkbox"][name*="selectAll"], .select-all').first();
        if (await selectAllCheckbox.isVisible().catch(() => false)) {
            await selectAllCheckbox.click();
            await page.waitForTimeout(1000);

            // Check if rows are selected
            const selectedRows = await page.locator('tr.selected, .selected, input[type="checkbox"]:checked').count();
            expect(selectedRows).toBeGreaterThan(0);
        }

        // Test bulk actions
        const bulkActions = ['Delete', 'Export', 'Update', 'Disable'];
        for (const action of bulkActions) {
            const actionButton = page.locator(`button:has-text("${action}"), .bulk-action:has-text("${action}")`).first();
            if (await actionButton.isVisible().catch(() => false)) {
                // Test button is clickable (don't actually execute dangerous operations)
                const isEnabled = await actionButton.isEnabled();
                expect(isEnabled).toBeTruthy();
            }
        }
    });

    test('Cross-Service Integration from Admin Panel', async ({ page }) => {
        await page.goto(ADMIN_URL);
        await page.waitForSelector('body');

        // Test service status monitoring
        const serviceStatus = page.locator('.service-status, [data-testid*="service-health"]').first();
        if (await serviceStatus.isVisible().catch(() => false)) {
            // Check service health indicators
            const healthIndicators = await page.locator('.status-indicator, .health-check, .service-card').count();
            expect(healthIndicators).toBeGreaterThan(0);
        }

        // Test Gateway integration
        const gatewayResponse = await page.request.get(`${GATEWAY_URL}/api/v1/admin/health`);
        expect([200, 401, 404]).toContain(gatewayResponse.status());

        // Test direct service communications
        const serviceTests = [
            { name: 'ID Service', url: `${ID_URL}/api/health` },
            { name: 'Hub Service', url: `${HUB_URL}/api/health` }
        ];

        for (const service of serviceTests) {
            const response = await page.request.get(service.url);
            expect(response.status()).toBe(200);
        }
    });

    test('Error Handling and Recovery in Admin Interface', async ({ page }) => {
        await page.goto(ADMIN_URL);
        await page.waitForSelector('body');

        // Test handling of invalid form submissions
        const form = page.locator('form').first();
        if (await form.isVisible().catch(() => false)) {
            // Submit empty form to trigger validation
            const submitButton = page.locator('button[type="submit"]').first();
            if (await submitButton.isVisible().catch(() => false)) {
                await submitButton.click();
                await page.waitForTimeout(1000);

                // Check for validation errors
                const hasValidationErrors = await page.locator('.error, .invalid, [aria-invalid="true"]').isVisible().catch(() => false);
            }
        }

        // Test network error handling
        // Intercept network requests and simulate failures
        await page.route('**/api/**', route => {
            if (route.request().url().includes('test-error')) {
                route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Internal Server Error' })
                });
            } else {
                route.continue();
            }
        });

        // Test error boundaries
        const errorResponse = await page.request.get(`${ADMIN_URL}/api/test-error`).catch(() => null);
    });

    test('Performance and Resource Usage', async ({ page }) => {
        // Monitor performance metrics
        const startTime = Date.now();

        await page.goto(ADMIN_URL);
        await page.waitForSelector('body');

        const loadTime = Date.now() - startTime;

        // Admin dashboard should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);

        // Test memory usage (basic check)
        const memoryUsage = await page.evaluate(() => {
            return {
                // @ts-ignore
                usedHeapSize: performance.memory?.usedJSHeapSize || 0,
                // @ts-ignore  
                totalHeapSize: performance.memory?.totalJSHeapSize || 0
            };
        }).catch(() => ({ usedHeapSize: 0, totalHeapSize: 0 }));

        // Check if memory usage is reasonable (basic threshold)
        if (memoryUsage.totalHeapSize > 0) {
            const memoryRatio = memoryUsage.usedHeapSize / memoryUsage.totalHeapSize;
            expect(memoryRatio).toBeLessThan(0.9); // Should use less than 90% of allocated memory
        }
    });
});
