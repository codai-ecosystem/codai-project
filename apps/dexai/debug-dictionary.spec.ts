import { test, expect } from '@playwright/test';

test.describe('Dictionary Debug', () => {
    test('should show current page content after search', async ({ page }) => {
        await page.goto('/dictionary');

        // Search for a word
        await page.locator('input[type="text"]').fill('carte');
        await page.locator('button[type="submit"]').click();

        // Wait for results
        await page.waitForSelector('[data-testid="search-results"]');

        // Take screenshot
        await page.screenshot({ path: 'debug-search-results.png' });

        // Get all text content
        const pageContent = await page.textContent('body');
        console.log('Full page content:', pageContent);

        // Check for any buttons
        const buttons = await page.locator('button').allTextContents();
        console.log('All buttons:', buttons);

        // Check specifically for tabs
        const tabTexts = await page.locator('nav button').allTextContents();
        console.log('Tab buttons:', tabTexts);

        // Check for our enhanced data
        const hasVolum = pageContent?.includes('volum');
        const hasParte = pageContent?.includes('parte');
        const hasSinonime = pageContent?.includes('Sinonime');

        console.log('Data check:');
        console.log('- Has volum (synonym):', hasVolum);
        console.log('- Has parte (rhyme):', hasParte);
        console.log('- Has Sinonime tab:', hasSinonime);

        // Force pass so we can see output
        expect(true).toBe(true);
    });
});
