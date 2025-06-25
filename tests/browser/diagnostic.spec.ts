import { test, expect } from '@playwright/test';

test.describe('Diagnostic Tests', () => {
    test('should connect to Codai service and show page content', async ({ page }) => {
        // Navigate to the service
        await page.goto('http://localhost:4000/');

        // Wait a bit for the page to load
        await page.waitForTimeout(2000);

        // Get the page title
        const title = await page.title();
        console.log('Page title:', title);

        // Get the page content
        const content = await page.content();
        console.log('Page content length:', content.length);
        console.log('Page content preview:', content.substring(0, 500));

        // Take a screenshot
        await page.screenshot({ path: 'diagnostic-screenshot.png', fullPage: true });

        // Check if page loaded successfully (not an error page)
        expect(title).not.toContain('Error');
        expect(content).not.toContain('Cannot GET');
    });
});
