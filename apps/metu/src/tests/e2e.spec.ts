import { test, expect } from '@playwright/test';

test.describe('METU Voice AI - End-to-End User Flows', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:4400/');
    });

    test('complete app initialization flow', async ({ page }) => {
        // Wait for app to load completely
        await expect(page.locator('h1:has-text("METU")')).toBeVisible();

        // Check all main sections are loaded
        await expect(page.locator('text=METU').first()).toBeVisible();
        await expect(page.locator('button[title="Settings"]')).toBeVisible();

        // Check conversation area exists
        await expect(page.locator('text=Ready for Natural Conversation')).toBeVisible();

        // Check initial state
        await expect(page.locator('text=METU listens continuously')).toBeVisible();
    });

    test('settings panel full workflow', async ({ page }) => {
        // Open settings
        await page.locator('button[title="Settings"]').click();
        await expect(page.locator('text=METU Settings')).toBeVisible();

        // Navigate through tabs
        await page.locator('text=🔧 General').click();
        await expect(page.locator('text=Voice Recognition Language')).toBeVisible();

        await page.locator('text=🎤 Audio').click();
        await expect(page.locator('text=Confidence Threshold')).toBeVisible();

        await page.locator('text=🔌 MCP Config').click();
        // MCP Config content should be visible

        // Test language selection
        await page.locator('text=🔧 General').click();
        const languageOptions = page.locator('select, [role="listbox"]').first();
        if (await languageOptions.count() > 0) {
            await languageOptions.click();
        }

        // Test theme selection
        const themeButtons = page.locator('button').filter({ hasText: /Light|Dark|Auto/ });
        if (await themeButtons.count() > 0) {
            await themeButtons.first().click();
        }

        // Close settings
        await page.locator('.fixed.inset-0').click();
        await expect(page.locator('text=METU Settings')).not.toBeVisible();
    });

    test('voice interaction simulation', async ({ page }) => {
        // Test voice button interaction
        const voiceButton = page.locator('button').filter({ hasText: /Ready to listen/ }).first();

        if (await voiceButton.count() > 0) {
            await voiceButton.click();

            // State should change (in a real scenario, would show "Listening")
            // Since we can't access real speech recognition, just verify no crashes
            await expect(page.locator('text=METU Voice AI')).toBeVisible();
        }

        // Try to click the microphone button
        const micButton = page.locator('button:has(div:text("🎤"))');
        if (await micButton.count() > 0) {
            await micButton.click();
            // Should not crash
            await expect(page.locator('h1:has-text("METU")')).toBeVisible();
        }
    });

    test('responsive design full workflow', async ({ page }) => {
        const viewports = [
            { width: 375, height: 667, name: 'Mobile' },
            { width: 768, height: 1024, name: 'Tablet' },
            { width: 1920, height: 1080, name: 'Desktop' }
        ];

        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });

            // Check main components are visible
            await expect(page.locator('h1:has-text("METU")')).toBeVisible();

            // Test settings on each viewport
            await page.getByRole('button', { name: 'Settings' }).click();
            await expect(page.locator('text=METU Settings')).toBeVisible();

            // Close settings
            await page.keyboard.press('Escape');
            await expect(page.locator('text=METU Settings')).not.toBeVisible();      // Test scrolling if needed
            if (viewport.height < 800) {
                await page.keyboard.press('End');
                await page.waitForTimeout(500);
                await page.keyboard.press('Home');
            }
        }
    });

    test('keyboard navigation full flow', async ({ page }) => {
        // Test tab navigation
        await page.keyboard.press('Tab');
        let focusedElement = await page.locator(':focus').first();
        await expect(focusedElement).toBeVisible();

        // Continue tabbing through interactive elements
        for (let i = 0; i < 5; i++) {
            await page.keyboard.press('Tab');
            focusedElement = await page.locator(':focus').first();
            if (await focusedElement.count() > 0) {
                await expect(focusedElement).toBeVisible();
            }
        }

        // Test Ctrl+Space shortcut
        await page.keyboard.press('Control+Space');

        // Should not crash
        await expect(page.locator('text=METU Voice AI')).toBeVisible();

        // Test Escape key
        await page.getByRole('button', { name: 'Settings' }).click();
        await page.keyboard.press('Escape');
        await expect(page.locator('text=METU Settings')).not.toBeVisible();
    });

    test('error handling and edge cases', async ({ page }) => {
        // Test with JavaScript disabled speech recognition
        await page.evaluate(() => {
            (window as any).SpeechRecognition = undefined;
            (window as any).webkitSpeechRecognition = undefined;
        });

        await page.reload();

        // Should show appropriate error message
        const errorMessage = page.locator('text=Voice recognition not supported');
        if (await errorMessage.count() > 0) {
            await expect(errorMessage).toBeVisible();
        }

        // App should still be functional
        await expect(page.locator('h1:has-text("METU")')).toBeVisible();
        await page.getByRole('button', { name: 'Settings' }).click();
        await expect(page.locator('text=METU Settings')).toBeVisible();
    });

    test('performance and loading states', async ({ page }) => {
        // Reload page and check loading
        await page.reload();

        // Main content should load quickly
        await expect(page.locator('h1:has-text("METU")')).toBeVisible({ timeout: 5000 });

        // All main sections should be visible
        await expect(page.locator('text=METU').first()).toBeVisible();
        await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
        await expect(page.getByRole('heading', { name: '💬 Conversation' })).toBeVisible();

        // Check for any loading states
        const loadingElements = page.locator('[data-testid*="loading"], .loading, .spinner');
        if (await loadingElements.count() > 0) {
            // Loading elements should eventually disappear
            await expect(loadingElements.first()).not.toBeVisible({ timeout: 10000 });
        }
    });

    test('conversation area functionality', async ({ page }) => {
        // Check conversation area is properly set up
        const conversationArea = page.locator('text=Ready for Natural Conversation').locator('..');
        await expect(conversationArea).toBeVisible();

        // Check if scrollable
        const scrollableArea = page.locator('.overflow-y-auto').first();
        await expect(scrollableArea).toBeVisible();

        // Test clear functionality if messages exist
        const clearButton = page.locator('text=Clear');
        if (await clearButton.count() > 0) {
            await clearButton.click();
        }
    });

    test('visual consistency check', async ({ page }) => {
        // Check that styling is consistent
        await expect(page.locator('h1:has-text("METU")')).toBeVisible();

        // Check gradient text is applied
        const title = page.locator('h1').first();
        const titleClasses = await title.getAttribute('class');
        expect(titleClasses).toContain('bg-gradient-to-r');

        // Check glass effect is applied to cards
        const cards = page.locator('.voice-card');
        expect(await cards.count()).toBeGreaterThan(0);

        // Check animations are present
        const animatedElements = page.locator('[class*="animate-"]');
        expect(await animatedElements.count()).toBeGreaterThan(0);
    });

    test('cross-browser compatibility basics', async ({ page, browserName }) => {
        // Basic functionality should work across browsers
        await expect(page.locator('h1:has-text("METU")')).toBeVisible();

        // Settings should work
        await page.getByRole('button', { name: 'Settings' }).click();
        await expect(page.locator('text=METU Settings')).toBeVisible();

        // CSS should render properly
        const title = page.locator('h1').first();
        const isVisible = await title.isVisible();
        expect(isVisible).toBe(true);

        console.log(`Test passed on ${browserName}`);
    });
});
