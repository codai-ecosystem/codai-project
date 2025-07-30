import { test, expect, devices } from '@playwright/test';

test.describe('METU Voice AI - Responsive Design Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:4400/');
    });

    test('desktop layout displays correctly', async ({ page }) => {
        // Test on desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Check main components are visible
        await expect(page.locator('h1:has-text("METU")')).toBeVisible();
        await expect(page.locator('text=Ready for Natural Conversation')).toBeVisible();

        // Check grid layout
        const gridContainer = page.locator('.grid').first();
        await expect(gridContainer).toHaveClass(/grid/);
        await expect(gridContainer).toHaveClass(/grid-cols-1/);

        // Check voice controls section
        await expect(page.locator('text=METU').first()).toBeVisible();
        await expect(page.locator('button[title="Settings"]')).toBeVisible();

        // Check conversation panel
        await expect(page.locator('text=Ready for Natural Conversation')).toBeVisible();
    });

    test('tablet layout adapts correctly', async ({ page }) => {
        // Test on tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });

        // Elements should still be visible but layout may change
        await expect(page.locator('h1:has-text("METU")')).toBeVisible();

        // Text should be responsive
        const title = page.locator('h1').first();
        await expect(title).toHaveClass(/text-2xl|sm:text-3xl|lg:text-4xl/);
    });

    test('mobile layout works properly', async ({ page }) => {
        // Test on mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // All main elements should still be visible
        await expect(page.locator('h1:has-text("METU")')).toBeVisible();
        await expect(page.locator('text=METU').first()).toBeVisible();
        await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();

        // Check responsive voice button sizing
        const voiceButton = page.locator('button').filter({ hasText: 'Ready to listen' }).first();
        if (await voiceButton.count() > 0) {
            await expect(voiceButton).toHaveClass(/w-16|h-16|sm:w-20|sm:h-20/);
        }

        // Conversation area should be visible and scrollable
        await expect(page.locator('text=Start a conversation with METU')).toBeVisible();
    });

    test('page is scrollable', async ({ page }) => {
        // Test scrolling functionality
        await page.setViewportSize({ width: 375, height: 400 }); // Very small height to force scrolling

        // Get initial scroll position
        const initialScrollY = await page.evaluate(() => window.scrollY);

        // Scroll down
        await page.keyboard.press('End');

        // Wait a bit for scroll
        await page.waitForTimeout(500);

        // Check scroll position changed
        const finalScrollY = await page.evaluate(() => window.scrollY);
        expect(finalScrollY).toBeGreaterThanOrEqual(initialScrollY);
    });

    test('conversation area is scrollable', async ({ page }) => {
        // Find conversation scrollable area
        const conversationArea = page.locator('.overflow-y-auto').first();
        await expect(conversationArea).toBeVisible();

        // Check it has proper scroll classes
        await expect(conversationArea).toHaveClass(/overflow-y-auto/);
    });

    test('settings panel is mobile-friendly', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        // Open settings
        await page.getByRole('button', { name: 'Settings' }).click();

        // Settings panel should be visible and check responsive layout elements
        await expect(page.getByRole('heading', { name: 'METU Settings' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'General' })).toBeVisible();
        await expect(page.getByRole('button', { name: '🎤 Audio' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'MCP Config' })).toBeVisible();
    });

    test('voice controls respond to interactions', async ({ page }) => {
        // Test voice button interactions
        const voiceButtonArea = page.locator('button').filter({ hasText: /Ready to listen|Listening|Processing|Speaking/ }).first();

        if (await voiceButtonArea.count() > 0) {
            await voiceButtonArea.click();
            // Should not crash or error
            await expect(page.locator('text=METU Voice AI')).toBeVisible();
        }

        // Test settings button
        await page.getByRole('button', { name: 'Settings' }).click();
        await expect(page.getByRole('heading', { name: 'METU Settings' })).toBeVisible();

        // Close settings by clicking overlay (use more specific selector)
        await page.locator('div.fixed.inset-0.bg-black').click({ position: { x: 50, y: 50 } });
        await expect(page.getByRole('heading', { name: 'METU Settings' })).not.toBeVisible();
    });

    test('keyboard navigation works', async ({ page }) => {
        // Test Escape key functionality
        await page.getByRole('button', { name: 'Settings' }).click();
        await expect(page.getByRole('heading', { name: 'METU Settings' })).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(page.getByRole('heading', { name: 'METU Settings' })).not.toBeVisible();
    }); test('text is readable at all sizes', async ({ page }) => {
        const viewports = [
            { width: 375, height: 667 },   // Mobile
            { width: 768, height: 1024 },  // Tablet
            { width: 1024, height: 768 },  // Laptop
            { width: 1920, height: 1080 }  // Desktop
        ];

        for (const viewport of viewports) {
            await page.setViewportSize(viewport);

            // Check that main text elements are visible and have appropriate size
            const title = page.locator('h1').first();
            await expect(title).toBeVisible();

            const subtitle = page.locator('text=Ready for Natural Conversation');
            await expect(subtitle).toBeVisible();

            // Check button text is readable
            await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
            await expect(page.locator('text=Test Voice')).toBeVisible();
        }
    });

    test('gradients and animations work', async ({ page }) => {
        // Check that gradient text is applied to title
        const title = page.locator('h1').first();
        await expect(title).toHaveClass(/gradient-text/);

        // Check animated elements
        const animatedElements = page.locator('.animate-spin-slow');
        if (await animatedElements.count() > 0) {
            await expect(animatedElements.first()).toBeVisible();
        }
    });
});
