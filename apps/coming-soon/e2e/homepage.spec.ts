import { test, expect } from '@playwright/test';

test.describe('CODAI Coming Soon Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('loads the page successfully', async ({ page }) => {
        // Check if the main heading is present
        await expect(page.getByText('CODAI')).toBeVisible();
        await expect(page.getByText(/The Future of/i)).toBeVisible();
    });

    test('has proper page title and meta description', async ({ page }) => {
        await expect(page).toHaveTitle(/CODAI - The Ultimate AI Ecosystem/);

        // Check meta description
        const metaDescription = page.locator('meta[name="description"]');
        await expect(metaDescription).toHaveAttribute('content', /AI-driven business automation/);
    });

    test('theme toggle works correctly', async ({ page }) => {
        // Find and click theme toggle button
        const themeToggle = page.getByRole('button', { name: /switch to.*mode/i });
        await expect(themeToggle).toBeVisible();

        // Click to toggle theme
        await themeToggle.click();

        // Verify theme changed by checking if dark class is added to html
        const html = page.locator('html');
        await expect(html).toHaveClass(/dark/);

        // Click again to toggle back
        await themeToggle.click();
        await expect(html).not.toHaveClass(/dark/);
    });

    test('email subscription form works', async ({ page }) => {
        const emailInput = page.getByPlaceholder(/enter your email/i);
        const subscribeButton = page.getByRole('button', { name: /notify me|subscribe/i });

        await expect(emailInput).toBeVisible();
        await expect(subscribeButton).toBeVisible();

        // Test email input
        await emailInput.fill('test@example.com');
        await expect(emailInput).toHaveValue('test@example.com');

        // Click subscribe button
        await subscribeButton.click();

        // In a real app, we'd check for success message or redirect
    });

    test('CTA buttons are clickable', async ({ page }) => {
        const exploreButton = page.getByRole('button', { name: /explore ecosystem/i });
        const joinButton = page.getByRole('button', { name: /join waitlist/i });

        await expect(exploreButton).toBeVisible();
        await expect(joinButton).toBeVisible();

        await exploreButton.click();
        await joinButton.click();
    });

    test('displays project statistics', async ({ page }) => {
        // Check for key statistics
        await expect(page.getByText('49+')).toBeVisible();
        await expect(page.getByText('AI Models')).toBeVisible();
        await expect(page.getByText('100+')).toBeVisible();
        await expect(page.getByText('Services')).toBeVisible();
    });

    test('shows individual project sections', async ({ page }) => {
        // Wait for individual project sections to load
        await expect(page.getByText('CODAI Ecosystem')).toBeVisible();

        // Check for specific projects
        await expect(page.getByText('RomAI')).toBeVisible();
        await expect(page.getByText('BancAI')).toBeVisible();
        await expect(page.getByText('CodAI')).toBeVisible();
    });

    test('project search functionality', async ({ page }) => {
        // Find search input
        const searchInput = page.getByPlaceholder(/search projects/i);
        await expect(searchInput).toBeVisible();

        // Search for a specific project
        await searchInput.fill('RomAI');

        // Should show RomAI project
        await expect(page.getByText('RomAI')).toBeVisible();

        // Search for non-existent project
        await searchInput.clear();
        await searchInput.fill('NonExistentProject');

        // Should show no results message
        await expect(page.getByText(/no projects found/i)).toBeVisible();
    });

    test('category filtering works', async ({ page }) => {
        // Click on AI & Machine Learning category
        const aiCategory = page.getByRole('button', { name: /AI & Machine Learning/i });
        await aiCategory.click();

        // Should show AI projects
        await expect(page.getByText('RomAI')).toBeVisible();

        // Click All Categories to reset
        const allCategories = page.getByRole('button', { name: /all categories/i });
        await allCategories.click();

        // Should show all projects again
        await expect(page.getByText('RomAI')).toBeVisible();
        await expect(page.getByText('BancAI')).toBeVisible();
    });

    test('project cards show learn more functionality', async ({ page }) => {
        // Find and click a Learn More button
        const learnMoreButton = page.getByRole('button', { name: /learn more/i }).first();
        await learnMoreButton.click();

        // Should show expanded details
        await expect(page.getByText(/key features/i)).toBeVisible();
        await expect(page.getByText(/technologies/i)).toBeVisible();
    });

    test('footer contains all required sections', async ({ page }) => {
        // Scroll to footer
        await page.getByRole('contentinfo').scrollIntoViewIfNeeded();

        // Check footer sections
        await expect(page.getByText(/AI Solutions/i)).toBeVisible();
        await expect(page.getByText(/Developer Tools/i)).toBeVisible();
        await expect(page.getByText(/Resources/i)).toBeVisible();
        await expect(page.getByText(/Company/i)).toBeVisible();

        // Check social links
        await expect(page.getByRole('link', { name: /github/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /linkedin/i })).toBeVisible();
    });

    test('smooth scrolling works', async ({ page }) => {
        // Check if scroll indicator is present
        await expect(page.getByText(/discover our applications/i)).toBeVisible();

        // Page should scroll smoothly (visual test - hard to assert)
        const projectsSection = page.getByText('CODAI Ecosystem').first();
        await projectsSection.scrollIntoViewIfNeeded();
        await expect(projectsSection).toBeVisible();
    });

    test('page is responsive on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Check if main elements are still visible and properly arranged
        await expect(page.getByText('CODAI')).toBeVisible();

        // Theme toggle should still be accessible
        const themeToggle = page.getByRole('button', { name: /switch to.*mode/i });
        await expect(themeToggle).toBeVisible();

        // Email form should be responsive
        const emailInput = page.getByPlaceholder(/enter your email/i);
        await expect(emailInput).toBeVisible();
    });

    test('page loads fast and has good performance', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;

        // Page should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);

        // Check if main content is visible quickly
        await expect(page.getByText('CODAI')).toBeVisible();
    });

    test('accessibility: keyboard navigation works', async ({ page }) => {
        // Test tab navigation through interactive elements
        await page.keyboard.press('Tab');
        await expect(page.locator(':focus')).toBeVisible();

        // Continue tabbing through several elements
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Tab');
            await expect(page.locator(':focus')).toBeVisible();
        }
    });

    test('accessibility: has proper ARIA labels and roles', async ({ page }) => {
        // Check for proper button roles
        const buttons = page.getByRole('button');
        expect(await buttons.count()).toBeGreaterThan(0);

        // Check for proper input labels
        const emailInput = page.getByPlaceholder(/enter your email/i);
        await expect(emailInput).toHaveAttribute('type', 'email');

        // Check for proper headings hierarchy
        const mainHeading = page.getByRole('heading', { level: 1 });
        await expect(mainHeading).toBeVisible();
    });
});