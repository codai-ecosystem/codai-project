import { test, expect, type Page } from '@playwright/test';

test.describe('RomAI Dashboard UI Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Mock API responses for consistent testing
        await page.route('**/health', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'healthy',
                    service: 'RomAI AGI Server',
                    uptime: 3600,
                    models_loaded: 15
                })
            });
        });

        await page.route('**/api/v1/mathematical-reasoning/solve', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    result: 42.0,
                    method: 'cache_bypass',
                    cache_bypassed: true,
                    success: true
                })
            });
        });
    });

    test('should render dashboard with theme toggle', async ({ page }) => {
        await page.goto('/dashboard');

        // Check for main dashboard elements
        await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
        await expect(page.getByRole('heading', { name: /RomAI/i })).toBeVisible();

        // Test theme toggle functionality
        const themeToggle = page.getByRole('button', { name: /switch to.*mode/i });
        await expect(themeToggle).toBeVisible();

        // Toggle theme and verify class changes
        await themeToggle.click();
        await expect(page.locator('html')).toHaveClass(/dark/);

        await themeToggle.click();
        await expect(page.locator('html')).not.toHaveClass(/dark/);

        console.log('✅ Theme toggle working correctly');
    });

    test('should display AGI system metrics', async ({ page }) => {
        await page.goto('/dashboard');

        // Wait for dashboard to load
        await page.waitForLoadState('networkidle');

        // Check for metrics cards
        const metricsCards = page.locator('.grid').filter({ hasText: /Sistema Status|Modele|Performanță/ });
        await expect(metricsCards).toBeVisible();

        // Verify status indicators
        const statusIndicator = page.locator('.bg-green-500, .animate-pulse').first();
        await expect(statusIndicator).toBeVisible();

        console.log('✅ AGI metrics displayed correctly');
    });

    test('should handle Romanian/English internationalization', async ({ page }) => {
        await page.goto('/dashboard');

        // Check for Romanian text
        await expect(page.getByText(/Inteligența Artificială Românească/i)).toBeVisible();
        await expect(page.getByText(/Sistema Status|Activ/i)).toBeVisible();

        // Check for English text
        await expect(page.getByText(/Romanian Artificial Intelligence/i)).toBeVisible();
        await expect(page.getByText(/Advanced Romanian AGI System/i)).toBeVisible();

        console.log('✅ Bilingual interface working correctly');
    });

    test('should validate responsive design', async ({ page }) => {
        // Test desktop view
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.goto('/dashboard');

        await expect(page.locator('.grid-cols-4, .lg\\:grid-cols-4')).toBeVisible();

        // Test tablet view
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(page.locator('.md\\:grid-cols-2')).toBeVisible();

        // Test mobile view
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(page.locator('.grid-cols-1')).toBeVisible();

        console.log('✅ Responsive design working correctly');
    });

    test('should validate animations and interactions', async ({ page }) => {
        await page.goto('/dashboard');

        // Test hover animations on metric cards
        const metricCard = page.locator('.hover\\:shadow-xl').first();
        await expect(metricCard).toBeVisible();

        await metricCard.hover();

        // Test animated elements
        const animatedIcons = page.locator('.animate-pulse');
        await expect(animatedIcons.first()).toBeVisible();

        // Test gradient text elements
        const gradientText = page.locator('.bg-gradient-to-r').first();
        await expect(gradientText).toBeVisible();

        console.log('✅ Animations and interactions working correctly');
    });
});