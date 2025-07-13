import { test, expect } from '@playwright/test';

test.describe('Debug Tab Functionality', () => {
    test('should show tab content when clicked', async ({ page }) => {
        await page.goto('/dictionary');

        // Search for "carte"
        await page.locator('input[type="text"]').fill('carte');
        await page.locator('input[type="text"]').press('Enter');
        await page.waitForSelector('[data-testid="search-results"]');

        console.log('🔍 After search - checking tabs...');

        // Check what tabs are visible
        const tabs = await page.locator('[data-testid="tab-"]').all();
        console.log(`📑 Found ${tabs.length} tabs`);

        for (let i = 0; i < tabs.length; i++) {
            const tabText = await tabs[i].textContent();
            console.log(`📑 Tab ${i}: "${tabText}"`);
        }

        // Check if Sinonime tab exists and click it
        const sinonimeTab = page.locator('text=Sinonime');
        await expect(sinonimeTab).toBeVisible();
        console.log('✅ Sinonime tab is visible');

        // Click the Sinonime tab
        await sinonimeTab.click();
        console.log('🔽 Clicked Sinonime tab');

        // Wait a moment for content to load
        await page.waitForTimeout(1000);

        // Now check if synonym content is visible
        const volumElement = page.locator('text=volum');
        const isVolumeVisible = await volumElement.isVisible();
        console.log(`👁️ Volume visible after click: ${isVolumeVisible}`);

        if (isVolumeVisible) {
            console.log('✅ Synonyms are now visible!');
        } else {
            console.log('❌ Synonyms still not visible');
            // Get page content to see what's there
            const content = await page.content();
            console.log('📄 Page content includes:', content.substring(content.indexOf('Sinonime'), content.indexOf('Sinonime') + 500));
        }
    });
});
