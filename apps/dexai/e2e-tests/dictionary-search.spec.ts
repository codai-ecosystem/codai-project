import { test, expect } from '@playwright/test';

test.describe('DEXAI Dictionary Search', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dictionary');
        // Wait for the page to load completely
        await page.waitForLoadState('networkidle');
    });

    test('should display the main search interface', async ({ page }) => {
        // Check main search elements
        await expect(page.locator('h1')).toContainText('DEXAI');
        await expect(page.locator('input[type="text"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // Check placeholder text
        const searchInput = page.locator('input[type="text"]');
        await expect(searchInput).toHaveAttribute('placeholder', /caută.*cuvânt/i);
    });
    test('should search for Romanian word "carte"', async ({ page }) => {
        console.log('🔍 Testing search for "carte"');

        // Monitor network requests
        const networkLogs: string[] = [];
        page.on('request', request => {
            networkLogs.push(`➡️ ${request.method()} ${request.url()}`);
        });
        page.on('response', response => {
            networkLogs.push(`⬅️ ${response.status()} ${response.url()}`);
        });

        // Monitor console logs and errors
        page.on('console', msg => {
            console.log(`🖥️ Console: ${msg.text()}`);
        });
        page.on('pageerror', error => {
            console.log(`❌ Page Error: ${error.message}`);
        });

        const searchInput = page.locator('input[type="text"]');

        // Perform search using Enter key to bypass button state issues
        await searchInput.fill('carte');
        console.log('📝 Filled input with "carte"');

        await searchInput.press('Enter');
        console.log('⌨️ Pressed Enter key');

        // Wait a bit to see if any requests are made
        await page.waitForTimeout(2000);
        console.log('📊 Network logs:', networkLogs);

        // Take a screenshot to see the current state
        await page.screenshot({ path: 'test-results/debug-search-state.png' });
        console.log('📸 Screenshot taken');

        // Check what's currently on the page
        const pageContent = await page.content();
        console.log('📄 Page contains search-results?', pageContent.includes('data-testid="search-results"'));
        console.log('📄 Page contains "Rezultate pentru"?', pageContent.includes('Rezultate pentru'));

        // Wait for results to load
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
        // Check for search results
        const results = page.locator('[data-testid="dictionary-entry"]');
        await expect(results.first()).toBeVisible();

        // Check if "carte" appears in the dictionary entry (not just the heading)
        await expect(page.locator('[data-testid="dictionary-entry"]').locator('text=carte')).toBeVisible();

        // Check for definition
        await expect(page.locator('text=Lucrare tipărită')).toBeVisible();
    });

    test('should search for Romanian word "dragoste"', async ({ page }) => {
        const searchInput = page.locator('input[type="text"]');
        await searchInput.fill('dragoste');
        await searchInput.press('Enter');

        // Wait for results
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });

        // Check results
        await expect(page.locator('[data-testid="dictionary-entry"]').locator('text=dragoste')).toBeVisible();
        await expect(page.locator('text=Sentiment de atracție')).toBeVisible();
    });

    test('should show synonyms and antonyms', async ({ page }) => {
        await page.locator('input[type="text"]').fill('carte');
        await page.locator('input[type="text"]').press('Enter');

        await page.waitForSelector('[data-testid="search-results"]');

        // Check for synonyms section and click tab
        await expect(page.locator('text=Sinonime')).toBeVisible();
        await page.locator('text=Sinonime').click();
        await expect(page.locator('text=volum')).toBeVisible();
        await expect(page.locator('text=lucrare')).toBeVisible();

        // Check for antonyms section
        await expect(page.locator('text=Antonime')).toBeVisible();
        await page.locator('text=Antonime').click();
        await expect(page.locator('text=analfabetism')).toBeVisible();
        await expect(page.locator('text=ignoranță')).toBeVisible();
    });

    test('should show rhyming words', async ({ page }) => {
        console.log('🔍 Testing rhymes for "carte"');

        await page.locator('input[type="text"]').fill('carte');
        await page.locator('button[type="submit"]').click();

        await page.waitForSelector('[data-testid="search-results"]');

        // Check for rhymes section and click tab
        await expect(page.locator('text=Rime')).toBeVisible();
        await page.locator('text=Rime').click();
        await expect(page.locator('text=parte')).toBeVisible();
        await expect(page.locator('text=artă').first()).toBeVisible();
        await expect(page.locator('text=hartă')).toBeVisible();
        await expect(page.locator('text=spartă')).toBeVisible();
    });

    test('should display example sentences with translations', async ({ page }) => {
        console.log('🔍 Testing examples for "carte"');

        await page.locator('input[type="text"]').fill('carte');
        await page.locator('button[type="submit"]').click();

        await page.waitForSelector('[data-testid="search-results"]');

        // Check for examples and click tab
        await expect(page.locator('text=Exemple')).toBeVisible();
        await page.locator('text=Exemple').click();
        await expect(page.locator('text=Am citit o carte')).toBeVisible();
        await expect(page.locator('text=I read a very interesting book')).toBeVisible();
    });

    test('should handle empty search gracefully', async ({ page }) => {
        console.log('🔍 Testing empty search');

        const searchButton = page.locator('button[type="submit"]');
        await searchButton.click();

        // Should not show loading or error
        await expect(page.locator('[data-testid="loading"]')).not.toBeVisible();
        await expect(page.locator('[data-testid="search-results"]')).not.toBeVisible();
    });

    test('should show loading state during search', async ({ page }) => {
        console.log('🔍 Testing loading state');

        const searchInput = page.locator('input[type="text"]');
        await searchInput.fill('fericire');

        // Start search and immediately check for loading
        const searchPromise = searchInput.press('Enter');
        await expect(page.locator('[data-testid="loading"]')).toBeVisible();

        await searchPromise;
        await page.waitForSelector('[data-testid="search-results"]');

        // Loading should disappear
        await expect(page.locator('[data-testid="loading"]')).not.toBeVisible();
    });

    test('should search for color words', async ({ page }) => {
        console.log('🔍 Testing color words');

        // Test "roșu" (red)
        await page.locator('input[type="text"]').fill('roșu');
        await page.locator('button[type="submit"]').click();

        await page.waitForSelector('[data-testid="search-results"]');
        await expect(page.locator('text=Culoarea sângelui')).toBeVisible();

        // Test "albastru" (blue)
        await page.locator('input[type="text"]').clear();
        await page.locator('input[type="text"]').fill('albastru');
        await page.locator('button[type="submit"]').click();

        await page.waitForSelector('[data-testid="search-results"]');
        await expect(page.locator('text=Culoarea cerului')).toBeVisible();
    });

    test('should search for animal words', async ({ page }) => {
        console.log('🔍 Testing animal words');

        // Test "câine" (dog)
        await page.locator('input[type="text"]').fill('câine');
        await page.locator('button[type="submit"]').click();

        await page.waitForSelector('[data-testid="search-results"]');
        await expect(page.locator('text=Mamifer domestic carnivor')).toBeVisible();
        await expect(page.locator('text=cel mai bun prieten')).toBeVisible();
    });

    test('should show related words with relationships', async ({ page }) => {
        console.log('🔍 Testing related words');

        await page.locator('input[type="text"]').fill('carte');
        await page.locator('button[type="submit"]').click();

        await page.waitForSelector('[data-testid="search-results"]');

        // Check for related words section
        await expect(page.locator('text=Cuvinte asociate')).toBeVisible();
        await expect(page.locator('text=bibliotecă')).toBeVisible();
    });

    test('should display difficulty and frequency information', async ({ page }) => {
        console.log('🔍 Testing word metadata');

        await page.locator('input[type="text"]').fill('înțelepciune');
        await page.locator('button[type="submit"]').click();

        await page.waitForSelector('[data-testid="search-results"]');

        // Check for difficulty level
        await expect(page.locator('text=avansat')).toBeVisible();

        // Check for part of speech
        await expect(page.locator('text=substantiv feminin')).toBeVisible();
    });
});
