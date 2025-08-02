import { test, expect } from '@playwright/test';

const ID_SERVICE_URL = 'http://localhost:4004';

test.describe('ID Service - Shared UI Validation', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to ID service
        await page.goto(ID_SERVICE_URL);
        await page.waitForLoadState('networkidle');
    });

    test('ID Service - Main Page Loads with Shared UI Components', async ({ page }) => {
        // Verify page title
        await expect(page).toHaveTitle(/CODAI/);

        // Verify main branding elements
        await expect(page.locator('text=CODAI ID')).toBeVisible();
        await expect(page.locator('text=Enterprise Identity & Authentication Platform')).toBeVisible();

        // Verify shared UI header components
        await expect(page.locator('header')).toContainText('CODAI ID');
        await expect(page.locator('header')).toContainText('Home');
        await expect(page.locator('header')).toContainText('Sign In');
        await expect(page.locator('header')).toContainText('Sign Up');

        // Verify shared UI footer components
        await expect(page.locator('footer')).toContainText('© 2024 CODAI Ecosystem');
        await expect(page.locator('footer')).toContainText('Privacy Policy');
        await expect(page.locator('footer')).toContainText('Terms of Service');
    });

    test('ID Service - Shared UI Theme System Validation', async ({ page }) => {
        // Verify header is visible and styled
        const header = page.locator('header');
        await expect(header).toBeVisible();

        // Verify CODAI gradient logo in header (first occurrence)
        const logo = page.locator('.bg-gradient-to-br.from-codai-500.to-codai-700').first();
        await expect(logo).toBeVisible();

        // Verify main CODAI branding text
        await expect(page.locator('text=CODAI ID').first()).toBeVisible();

        // Check for proper Tailwind classes indicating shared UI is working
        await expect(page.locator('.container')).toBeVisible();
        await expect(page.locator('.flex')).toBeVisible();
    });

    test('ID Service - Navigation to Sign In', async ({ page }) => {
        // Find and click the Sign In button in the main content area (not header)
        const signInButton = page.locator('text=Sign In').nth(1); // Second occurrence (main content)
        await expect(signInButton).toBeVisible();
        await signInButton.click();

        // Should navigate to sign in page
        await expect(page).toHaveURL(/signin/);

        // Verify we're on the sign in page
        await expect(page.locator('h1, h2')).toContainText(/Sign In/i);
    });

    test('ID Service - Navigation to Sign Up', async ({ page }) => {
        // Find and click the Sign Up button in the main content area  
        const signUpButton = page.locator('text=Sign Up').nth(1); // Second occurrence (main content)
        await expect(signUpButton).toBeVisible();
        await signUpButton.click();

        // Should navigate to sign up page
        await expect(page).toHaveURL(/signup/);

        // Verify we're on the sign up page
        await expect(page.locator('h1, h2')).toContainText(/Sign Up/i);
    });

    test('ID Service - Responsive Design Basic Check', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify main elements are still visible
        await expect(page.locator('text=CODAI ID')).toBeVisible();
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();

        // Test desktop viewport
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify elements are still properly displayed
        await expect(page.locator('text=CODAI ID')).toBeVisible();
        await expect(page.locator('text=Enterprise Identity & Authentication Platform')).toBeVisible();
    });

    test('ID Service - Performance and Console Validation', async ({ page }) => {
        // Check for console errors
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Verify no critical console errors
        const criticalErrors = consoleErrors.filter(error =>
            !error.includes('favicon') &&
            !error.includes('Third-party cookie') &&
            !error.includes('DevTools')
        );

        expect(criticalErrors).toHaveLength(0);

        // Basic performance check - page should load reasonably fast
        const startTime = Date.now();
        await page.reload();
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Should load within 10 seconds
        expect(loadTime).toBeLessThan(10000);
    });
});
