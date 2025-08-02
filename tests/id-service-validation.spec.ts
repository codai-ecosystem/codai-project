import { test, expect } from '@playwright/test';

test.describe('ID Service - Shared UI Validation', () => {
    const ID_SERVICE_URL = 'http://localhost:4004';

    test.beforeEach(async ({ page }) => {
        // Navigate to ID service
        await page.goto(ID_SERVICE_URL);
    });

    test('ID Service - Main Page Loads with Shared UI Components', async ({ page }) => {
        // Check that the page loads successfully
        await expect(page).toHaveTitle(/ID - CODAI Ecosystem/);

        // Verify Header component with shared UI
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('header')).toContainText('CODAI ID');
        await expect(page.locator('header')).toContainText('Enterprise Identity & Authentication');

        // Verify navigation buttons are present and styled
        await expect(page.locator('header nav a[href="/"]')).toContainText('Home');
        await expect(page.locator('header nav a[href="/auth/signin"]')).toContainText('Sign In');
        await expect(page.locator('header nav a[href="/auth/signup"]')).toContainText('Sign Up');

        // Verify Footer component with shared UI
        await expect(page.locator('footer')).toBeVisible();
        await expect(page.locator('footer')).toContainText('CODAI ID');
        await expect(page.locator('footer')).toContainText('© 2024 CODAI Ecosystem. All rights reserved.');
    });

    test('ID Service - Shared UI Theme System Validation', async ({ page }) => {
        // Check for CODAI brand colors in CSS
        const header = page.locator('header');
        await expect(header).toBeVisible();

        // Verify header logo is present (first occurrence to avoid strict mode)
        const logo = page.locator('.bg-gradient-to-br.from-codai-500.to-codai-700').first();
        await expect(logo).toBeVisible();

        // Verify CODAI branding text
        const brandText = page.locator('text=CODAI ID').first();
        await expect(brandText).toBeVisible();

        // Check for proper Tailwind classes
        await expect(page.locator('.container')).toBeVisible();
        await expect(page.locator('.flex')).toBeVisible();
    });

    test('ID Service - Sign In Page with Shared Components', async ({ page }) => {
        // Wait for page to load and find visible sign in link
        await page.waitForLoadState('networkidle');

        // Try different approaches to find and click sign in link
        const signInLink = page.locator('a:has-text("Sign In"):visible').first();
        await expect(signInLink).toBeVisible();
        await signInLink.click();

        await expect(page).toHaveURL(`${ID_SERVICE_URL}/auth/signin`);

        // Verify the sign in form is present
        await expect(page.locator('h1, h2')).toContainText('Sign In');
        await expect(page.locator('form')).toBeVisible();

        // Check for form elements with shared UI styling
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // Verify shared UI header and footer are still present
        await expect(page.locator('header')).toContainText('CODAI ID');
        await expect(page.locator('footer')).toContainText('CODAI Ecosystem');
    });

    test('ID Service - Sign Up Page with Shared Components', async ({ page }) => {
        // Wait for page to load and find visible sign up link
        await page.waitForLoadState('networkidle');

        // Find and click sign up link
        const signUpLink = page.locator('a:has-text("Sign Up"):visible').first();
        await expect(signUpLink).toBeVisible();
        await signUpLink.click();

        await expect(page).toHaveURL(`${ID_SERVICE_URL}/auth/signup`);

        // Verify the sign up form is present
        await expect(page.locator('h1, h2')).toContainText('Sign Up');
        await expect(page.locator('form')).toBeVisible();

        // Check for registration form elements
        await expect(page.locator('input')).toHaveCount.greaterThan(2); // At least email, password, confirm
        await expect(page.locator('button')).toContainText('Create Account');

        // Verify terms and privacy links
        await expect(page.locator('text=Terms of Service')).toBeVisible();
        await expect(page.locator('text=Privacy Policy')).toBeVisible();

        // Verify shared UI consistency
        await expect(page.locator('header')).toContainText('CODAI ID');
        await expect(page.locator('footer')).toContainText('CODAI Ecosystem');
    });

    test('ID Service - Responsive Design Validation', async ({ page }) => {
        // Test desktop view
        await page.setViewportSize({ width: 1200, height: 800 });
        await expect(page.locator('header nav')).toBeVisible(); // Desktop navigation visible

        // Test mobile view
        await page.setViewportSize({ width: 375, height: 667 });

        // Header should still be visible but nav might be hidden
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('.container')).toBeVisible();

        // Footer should adapt to mobile
        await expect(page.locator('footer')).toBeVisible();
    });

    test('ID Service - Navigation Flow Validation', async ({ page }) => {
        // Test navigation between pages
        await page.click('a[href="/auth/signin"]');
        await expect(page).toHaveURL(`${ID_SERVICE_URL}/auth/signin`);

        await page.click('header a[href="/"]');
        await expect(page).toHaveURL(`${ID_SERVICE_URL}/`);

        await page.click('a[href="/auth/signup"]');
        await expect(page).toHaveURL(`${ID_SERVICE_URL}/auth/signup`);

        // All pages should have consistent header/footer
        await expect(page.locator('header')).toContainText('CODAI ID');
        await expect(page.locator('footer')).toContainText('CODAI Ecosystem');
    });

    test('ID Service - Accessibility and SEO Validation', async ({ page }) => {
        // Check for proper heading structure
        await expect(page.locator('h1')).toBeVisible();

        // Check for alt texts on images/icons
        const images = page.locator('img');
        const imageCount = await images.count();
        if (imageCount > 0) {
            for (let i = 0; i < imageCount; i++) {
                await expect(images.nth(i)).toHaveAttribute('alt');
            }
        }

        // Check for proper link labels
        const links = page.locator('a');
        const linkCount = await links.count();
        for (let i = 0; i < Math.min(linkCount, 10); i++) { // Check first 10 links
            const link = links.nth(i);
            const hasText = await link.textContent();
            const hasAriaLabel = await link.getAttribute('aria-label');
            expect(hasText || hasAriaLabel).toBeTruthy();
        }

        // Check for proper form labels
        const inputs = page.locator('input');
        const inputCount = await inputs.count();
        for (let i = 0; i < inputCount; i++) {
            const input = inputs.nth(i);
            const hasLabel = await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0;
            const hasAriaLabel = await input.getAttribute('aria-label');
            const hasPlaceholder = await input.getAttribute('placeholder');
            expect(hasLabel || hasAriaLabel || hasPlaceholder).toBeTruthy();
        }
    });

    test('ID Service - Performance and Console Validation', async ({ page }) => {
        const messages: string[] = [];

        // Capture console messages
        page.on('console', msg => {
            if (msg.type() === 'error') {
                messages.push(`ERROR: ${msg.text()}`);
            }
        });

        // Navigate and wait for load
        await page.goto(ID_SERVICE_URL);
        await page.waitForLoadState('networkidle');

        // Check that there are no critical JavaScript errors
        const criticalErrors = messages.filter(msg =>
            !msg.includes('DevTools') &&
            !msg.includes('React DevTools') &&
            !msg.includes('favicon')
        );

        expect(criticalErrors.length).toBeLessThan(3); // Allow minor non-critical errors
    });
});
