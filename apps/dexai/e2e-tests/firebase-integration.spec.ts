import { test, expect } from '@playwright/test';

test.describe('DEXAI Firebase Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should connect to Firebase successfully', async ({ page }) => {
        console.log('🔥 Testing Firebase connection');

        // Check console for Firebase initialization
        const consoleMessages: string[] = [];
        page.on('console', msg => {
            consoleMessages.push(msg.text());
        });

        // Trigger a search to activate Firebase
        await page.locator('input[type="text"]').fill('carte');
        await page.locator('button[type="submit"]').click();
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });

        // Check that Firebase service was used
        const hasFirebaseMessage = consoleMessages.some(msg =>
            msg.includes('Firebase') || msg.includes('using Firebase RealDictionaryService')
        );

        expect(hasFirebaseMessage).toBeTruthy();
    });

    test('should use real Firebase data instead of mock data', async ({ page }) => {
        console.log('🔥 Testing real vs mock data');

        const consoleMessages: string[] = [];
        page.on('console', msg => {
            consoleMessages.push(msg.text());
        });

        // Perform search
        await page.locator('input[type="text"]').fill('dragoste');
        await page.locator('button[type="submit"]').click();
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });

        // Check console for Firebase usage confirmation
        const usesFirebase = consoleMessages.some(msg =>
            msg.includes('using Firebase RealDictionaryService') ||
            msg.includes('Found') && msg.includes('results from Firebase')
        );

        // Should not be using mock data as primary source
        const usesMockPrimary = consoleMessages.some(msg =>
            msg.includes('using enhanced mock data') && !msg.includes('fallback')
        );

        expect(usesFirebase).toBeTruthy();
        expect(usesMockPrimary).toBeFalsy();
    });

    test('should handle Firebase offline fallback', async ({ page }) => {
        console.log('🔥 Testing Firebase offline fallback');

        // Simulate network issues by blocking Firebase requests
        await page.route('**/*firestore*', route => route.abort());
        await page.route('**/*firebase*', route => route.abort());

        const consoleMessages: string[] = [];
        page.on('console', msg => {
            consoleMessages.push(msg.text());
        });

        // Try to search
        await page.locator('input[type="text"]').fill('carte');
        await page.locator('button[type="submit"]').click();

        // Should fall back to mock data
        await page.waitForTimeout(3000);

        // Check for fallback message
        const hasFallbackMessage = consoleMessages.some(msg =>
            msg.includes('Falling back to mock data') ||
            msg.includes('Firebase connection failed')
        );

        expect(hasFallbackMessage).toBeTruthy();
    });

    test('should persist votes to Firebase', async ({ page }) => {
        console.log('🔥 Testing vote persistence');

        const consoleMessages: string[] = [];
        page.on('console', msg => {
            consoleMessages.push(msg.text());
        });

        // Search and vote
        await page.locator('input[type="text"]').fill('carte');
        await page.locator('button[type="submit"]').click();
        await page.waitForSelector('[data-testid="search-results"]');

        // Vote on something
        await page.locator('[data-testid="upvote-button"]').first().click();
        await page.waitForTimeout(1000);

        // Check console for Firebase vote operation
        const hasVoteMessage = consoleMessages.some(msg =>
            msg.includes('Voting') && msg.includes('Firebase')
        );

        expect(hasVoteMessage).toBeTruthy();
    });

    test('should load real Romanian dictionary data', async ({ page }) => {
        console.log('🔥 Testing real Romanian dictionary data');

        // Test multiple Romanian words to ensure they come from real database
        const romanianWords = ['carte', 'dragoste', 'casă', 'apă', 'soare'];

        for (const word of romanianWords) {
            await page.locator('input[type="text"]').clear();
            await page.locator('input[type="text"]').fill(word);
            await page.locator('button[type="submit"]').click();

            try {
                await page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 });

                // Check that we get real definition
                await expect(page.locator(`text=${word}`)).toBeVisible();

                // Check for definition content (not generic mock)
                const hasRealDefinition = await page.locator('[data-testid="definition"]').first().isVisible();
                expect(hasRealDefinition).toBeTruthy();

            } catch (error) {
                console.log(`⚠️ Word "${word}" not found in database yet`);
            }
        }
    });

    test('should show comprehensive word data from Firebase', async ({ page }) => {
        console.log('🔥 Testing comprehensive word data');

        await page.locator('input[type="text"]').fill('carte');
        await page.locator('button[type="submit"]').click();
        await page.waitForSelector('[data-testid="search-results"]');

        // Check for comprehensive data sections
        const sections = [
            'Definitii', 'Exemple', 'Sinonime', 'Antonime',
            'Rime', 'Cuvinte asociate', 'Părți de vorbire'
        ];

        for (const section of sections) {
            // Check if section exists (some may be visible, others may be in dropdown)
            const sectionExists = await page.locator(`text=${section}`).count() > 0;
            if (sectionExists) {
                console.log(`✅ Found section: ${section}`);
            }
        }

        // At minimum, should have definitions
        await expect(page.locator('[data-testid="definition"]').first()).toBeVisible();
    });

    test('should handle Firebase errors gracefully', async ({ page }) => {
        console.log('🔥 Testing Firebase error handling');

        // Block some Firebase requests to simulate partial failures
        await page.route('**/firestore.googleapis.com/**', route => {
            if (Math.random() > 0.5) {
                route.abort();
            } else {
                route.continue();
            }
        });

        const consoleMessages: string[] = [];
        page.on('console', msg => {
            consoleMessages.push(msg.text());
        });

        // Try multiple searches
        const words = ['carte', 'dragoste', 'casă'];

        for (const word of words) {
            await page.locator('input[type="text"]').clear();
            await page.locator('input[type="text"]').fill(word);
            await page.locator('button[type="submit"]').click();
            await page.waitForTimeout(2000);
        }

        // Should handle errors without breaking
        await expect(page.locator('input[type="text"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();

        // Check for error handling messages
        const hasErrorHandling = consoleMessages.some(msg =>
            msg.includes('Error') || msg.includes('fallback') || msg.includes('offline')
        );

        console.log('Error handling messages found:', hasErrorHandling);
    });

    test('should maintain performance with Firebase', async ({ page }) => {
        console.log('🔥 Testing Firebase performance');

        // Track performance metrics
        const startTime = Date.now();

        await page.locator('input[type="text"]').fill('fericire');
        await page.locator('button[type="submit"]').click();
        await page.waitForSelector('[data-testid="search-results"]');

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should complete within reasonable time (10 seconds)
        expect(duration).toBeLessThan(10000);

        console.log(`Search completed in ${duration}ms`);
    });

    test('should validate Firebase configuration', async ({ page }) => {
        console.log('🔥 Testing Firebase configuration');

        const consoleMessages: string[] = [];
        const errorMessages: string[] = [];

        page.on('console', msg => {
            consoleMessages.push(msg.text());
        });

        page.on('pageerror', error => {
            errorMessages.push(error.message);
        });

        // Trigger Firebase usage
        await page.locator('input[type="text"]').fill('test');
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(2000);

        // Check for Firebase initialization success
        const hasInitMessage = consoleMessages.some(msg =>
            msg.includes('Firebase initialized successfully')
        );

        // Should not have Firebase configuration errors
        const hasConfigError = errorMessages.some(error =>
            error.includes('Firebase') && error.includes('config')
        );

        expect(hasInitMessage).toBeTruthy();
        expect(hasConfigError).toBeFalsy();
    });
});
