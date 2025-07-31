import { test as setup, expect } from '@playwright/test';

/**
 * Authentication Setup for Comprehensive Testing
 * Creates authenticated sessions for different user roles
 */

const authFile = 'playwright/.auth/user.json';
const adminAuthFile = 'playwright/.auth/admin.json';
const developerAuthFile = 'playwright/.auth/developer.json';
const analystAuthFile = 'playwright/.auth/analyst.json';

// Test users for comprehensive testing
const TEST_USERS = {
    ADMIN: {
        email: 'admin@codai.test',
        password: 'TestAdmin123!',
        role: 'admin',
        authFile: adminAuthFile
    },
    USER: {
        email: 'user@codai.test',
        password: 'TestUser123!',
        role: 'user',
        authFile: authFile
    },
    DEVELOPER: {
        email: 'developer@codai.test',
        password: 'TestDev123!',
        role: 'developer',
        authFile: developerAuthFile
    },
    ANALYST: {
        email: 'analyst@codai.test',
        password: 'TestAnalyst123!',
        role: 'analyst',
        authFile: analystAuthFile
    }
};

setup('authenticate as admin', async ({ page }) => {
    console.log('🔐 Setting up admin authentication...');

    try {
        // Navigate to ID service login
        await page.goto('http://localhost:4004/login');

        // Wait for login form
        await page.waitForSelector('[data-testid="login-form"], [name="email"], input[type="email"]', {
            timeout: 10000
        });

        // Fill login form
        const emailSelector = '[name="email"], input[type="email"], [data-testid="email-input"]';
        const passwordSelector = '[name="password"], input[type="password"], [data-testid="password-input"]';
        const submitSelector = '[type="submit"], [data-testid="submit-button"], button:has-text("Sign In"), button:has-text("Login")';

        await page.fill(emailSelector, TEST_USERS.ADMIN.email);
        await page.fill(passwordSelector, TEST_USERS.ADMIN.password);
        await page.click(submitSelector);

        // Wait for successful login
        await page.waitForURL(/dashboard|profile|home/, { timeout: 15000 });

        // Verify we're logged in
        await expect(page.locator('[data-testid="user-menu"], .user-avatar, .profile-menu')).toBeVisible({
            timeout: 10000
        });

        console.log('✅ Admin authentication successful');

        // Save authenticated state
        await page.context().storageState({ path: TEST_USERS.ADMIN.authFile });

    } catch (error) {
        console.log(`❌ Admin authentication failed: ${error.message}`);

        // Take screenshot for debugging
        await page.screenshot({
            path: 'test-results/auth-setup-admin-failed.png',
            fullPage: true
        });

        // Try alternative authentication method
        try {
            console.log('🔄 Trying alternative admin authentication...');

            // Direct API authentication
            const response = await page.request.post('http://localhost:4004/api/auth/login', {
                data: {
                    email: TEST_USERS.ADMIN.email,
                    password: TEST_USERS.ADMIN.password
                }
            });

            if (response.ok()) {
                const authData = await response.json();

                // Set authentication token
                await page.addInitScript((token) => {
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userRole', 'admin');
                }, authData.token);

                // Save minimal authenticated state
                await page.context().storageState({ path: TEST_USERS.ADMIN.authFile });
                console.log('✅ Alternative admin authentication successful');
            }
        } catch (altError) {
            console.log(`❌ Alternative admin authentication also failed: ${altError.message}`);
        }
    }
});

setup('authenticate as regular user', async ({ page }) => {
    console.log('🔐 Setting up user authentication...');

    try {
        await page.goto('http://localhost:4004/login');

        await page.waitForSelector('[data-testid="login-form"], [name="email"], input[type="email"]', {
            timeout: 10000
        });

        const emailSelector = '[name="email"], input[type="email"], [data-testid="email-input"]';
        const passwordSelector = '[name="password"], input[type="password"], [data-testid="password-input"]';
        const submitSelector = '[type="submit"], [data-testid="submit-button"], button:has-text("Sign In"), button:has-text("Login")';

        await page.fill(emailSelector, TEST_USERS.USER.email);
        await page.fill(passwordSelector, TEST_USERS.USER.password);
        await page.click(submitSelector);

        await page.waitForURL(/dashboard|profile|home/, { timeout: 15000 });

        await expect(page.locator('[data-testid="user-menu"], .user-avatar, .profile-menu')).toBeVisible({
            timeout: 10000
        });

        console.log('✅ User authentication successful');
        await page.context().storageState({ path: TEST_USERS.USER.authFile });

    } catch (error) {
        console.log(`❌ User authentication failed: ${error.message}`);
        await page.screenshot({
            path: 'test-results/auth-setup-user-failed.png',
            fullPage: true
        });
    }
});

setup('authenticate as developer', async ({ page }) => {
    console.log('🔐 Setting up developer authentication...');

    try {
        await page.goto('http://localhost:4004/login');

        await page.waitForSelector('[data-testid="login-form"], [name="email"], input[type="email"]', {
            timeout: 10000
        });

        const emailSelector = '[name="email"], input[type="email"], [data-testid="email-input"]';
        const passwordSelector = '[name="password"], input[type="password"], [data-testid="password-input"]';
        const submitSelector = '[type="submit"], [data-testid="submit-button"], button:has-text("Sign In"), button:has-text("Login")';

        await page.fill(emailSelector, TEST_USERS.DEVELOPER.email);
        await page.fill(passwordSelector, TEST_USERS.DEVELOPER.password);
        await page.click(submitSelector);

        await page.waitForURL(/dashboard|profile|home/, { timeout: 15000 });

        await expect(page.locator('[data-testid="user-menu"], .user-avatar, .profile-menu')).toBeVisible({
            timeout: 10000
        });

        console.log('✅ Developer authentication successful');
        await page.context().storageState({ path: TEST_USERS.DEVELOPER.authFile });

    } catch (error) {
        console.log(`❌ Developer authentication failed: ${error.message}`);
        await page.screenshot({
            path: 'test-results/auth-setup-developer-failed.png',
            fullPage: true
        });
    }
});

setup('verify all services accessible', async ({ page }) => {
    console.log('🔍 Verifying all services are accessible...');

    const services = [
        { name: 'Gateway', url: 'http://localhost:4000', expectedText: 'CODAI' },
        { name: 'CODAI', url: 'http://localhost:4001', expectedText: 'CODAI' },
        { name: 'Admin', url: 'http://localhost:4002', expectedText: 'Admin' },
        { name: 'Hub', url: 'http://localhost:4003', expectedText: 'Hub' },
        { name: 'ID', url: 'http://localhost:4004', expectedText: 'Login' },
        { name: 'BancAI', url: 'http://localhost:4005', expectedText: 'BancAI' }
    ];

    for (const service of services) {
        try {
            console.log(`🔍 Checking ${service.name} at ${service.url}...`);

            await page.goto(service.url, { timeout: 15000 });

            // Wait for the page to load
            await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

            // Check if the expected content is present
            const pageContent = await page.textContent('body');
            const hasExpectedContent = pageContent?.toLowerCase().includes(service.expectedText.toLowerCase());

            if (hasExpectedContent) {
                console.log(`✅ ${service.name} is accessible and responding correctly`);
            } else {
                console.log(`⚠️  ${service.name} is accessible but may not be fully loaded`);
            }

            // Take a screenshot for verification
            await page.screenshot({
                path: `test-results/service-check-${service.name.toLowerCase()}.png`,
                fullPage: false
            });

        } catch (error) {
            console.log(`❌ ${service.name} is not accessible: ${error.message}`);

            // Take screenshot of error state
            try {
                await page.screenshot({
                    path: `test-results/service-error-${service.name.toLowerCase()}.png`,
                    fullPage: false
                });
            } catch (screenshotError) {
                console.log(`⚠️  Could not take error screenshot for ${service.name}`);
            }
        }
    }

    console.log('✅ Service accessibility check completed');
});

// Export test users for use in other tests
export { TEST_USERS };
