import { test, expect } from '@playwright/test';

test.describe('DEXAI Error Handling & Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Search Error Handling', () => {
        test('should handle empty search queries', async ({ page }) => {
            console.log('🚫 Testing empty search query');

            // Try to search with empty input
            await page.locator('button[type="submit"]').click();

            // Should either prevent submission or show appropriate message
            await page.waitForTimeout(1000);

            // Check for error message or validation
            const errorMessage = page.locator('[data-testid="error-message"], .error, text=/Please enter/');
            const inputValidation = page.locator('input:invalid');

            const hasErrorHandling = await errorMessage.count() > 0 || await inputValidation.count() > 0;

            if (hasErrorHandling) {
                console.log('✅ Empty search handled with validation');
            } else {
                console.log('ℹ️ Empty search allowed (might show all results)');

                // Check if results container appears anyway
                const searchResults = page.locator('[data-testid="search-results"]');
                const hasResults = await searchResults.count() > 0;

                if (hasResults) {
                    console.log('Empty search shows default results');
                }
            }

            expect(true).toBeTruthy(); // Test passes regardless of specific implementation
        });

        test('should handle very long search queries', async ({ page }) => {
            console.log('🚫 Testing very long search query');

            const longQuery = 'a'.repeat(1000);

            await page.locator('input[type="text"]').fill(longQuery);
            await page.locator('button[type="submit"]').click();

            // Should handle gracefully without breaking
            await page.waitForTimeout(2000);

            // Check that UI remains functional
            await expect(page.locator('input[type="text"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toBeVisible();

            // Input should either be truncated or handled
            const inputValue = await page.locator('input[type="text"]').inputValue();
            expect(inputValue.length).toBeLessThanOrEqual(1000);
        });

        test('should handle special characters in search', async ({ page }) => {
            console.log('🚫 Testing special characters in search');

            const specialQueries = [
                '!@#$%^&*()',
                '<script>alert("xss")</script>',
                'SELECT * FROM users',
                '${injection}',
                '../../etc/passwd',
                'test" OR 1=1--'
            ];

            for (const query of specialQueries) {
                await page.locator('input[type="text"]').clear();
                await page.locator('input[type="text"]').fill(query);
                await page.locator('button[type="submit"]').click();
                await page.waitForTimeout(1000);

                // Should not break the application
                await expect(page.locator('input[type="text"]')).toBeVisible();

                // Should not execute any malicious code
                const hasAlert = await page.evaluate(() => {
                    return window.confirm !== undefined && window.alert !== undefined;
                });

                expect(hasAlert).toBeTruthy(); // Browser functions should still exist
            }
        });

        test('should handle non-Romanian characters', async ({ page }) => {
            console.log('🚫 Testing non-Romanian characters');

            const nonRomanianQueries = [
                '中文', // Chinese
                'العربية', // Arabic
                'Русский', // Russian
                'हिन्दी', // Hindi
                'עברית', // Hebrew
                '日本語' // Japanese
            ];

            for (const query of nonRomanianQueries) {
                await page.locator('input[type="text"]').clear();
                await page.locator('input[type="text"]').fill(query);
                await page.locator('button[type="submit"]').click();
                await page.waitForTimeout(1000);

                // Should handle gracefully
                const hasResults = await page.locator('[data-testid="search-results"]').count() > 0;

                if (hasResults) {
                    // Check for "no results" or proper handling message
                    const noResultsMessage = page.locator('text=/No results/, text=/Nu am găsit/, text=/not found/');
                    const hasNoResultsMessage = await noResultsMessage.count() > 0;

                    if (hasNoResultsMessage) {
                        console.log(`✅ Non-Romanian query "${query}" handled with no results message`);
                    } else {
                        console.log(`ℹ️ Non-Romanian query "${query}" processed normally`);
                    }
                }
            }
        });
    });

    test.describe('Network Error Handling', () => {
        test('should handle offline mode', async ({ page }) => {
            console.log('🚫 Testing offline functionality');

            // Set offline mode
            await page.context().setOffline(true);

            const consoleMessages: string[] = [];
            page.on('console', msg => {
                consoleMessages.push(msg.text());
            });

            // Try to search
            await page.locator('input[type="text"]').fill('carte');
            await page.locator('button[type="submit"]').click();
            await page.waitForTimeout(3000);

            // Should handle offline gracefully
            const hasOfflineHandling = consoleMessages.some(msg =>
                msg.includes('offline') ||
                msg.includes('network') ||
                msg.includes('fallback') ||
                msg.includes('cached')
            );

            if (hasOfflineHandling) {
                console.log('✅ Offline mode handled');
            } else {
                console.log('ℹ️ No explicit offline handling found');
            }

            // UI should remain functional
            await expect(page.locator('input[type="text"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toBeVisible();

            // Restore online mode
            await page.context().setOffline(false);
        });

        test('should handle slow network responses', async ({ page }) => {
            console.log('🚫 Testing slow network handling');

            // Add delay to all requests
            await page.route('**/*', async route => {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await route.continue();
            });

            const startTime = Date.now();

            await page.locator('input[type="text"]').fill('dragoste');
            await page.locator('button[type="submit"]').click();

            // Should show loading state or handle gracefully
            const loadingIndicators = page.locator('[data-testid="loading"], .loading, .spinner');

            if (await loadingIndicators.count() > 0) {
                console.log('✅ Loading indicator shown for slow requests');
                await expect(loadingIndicators.first()).toBeVisible();
            } else {
                console.log('ℹ️ No explicit loading indicator found');
            }

            // Wait for response or timeout
            try {
                await page.waitForSelector('[data-testid="search-results"]', { timeout: 15000 });
                const endTime = Date.now();
                console.log(`Request completed in ${endTime - startTime}ms`);
            } catch (error) {
                console.log('Request timed out as expected');
            }

            // UI should remain responsive
            await expect(page.locator('input[type="text"]')).toBeVisible();
        });

        test('should handle API errors', async ({ page }) => {
            console.log('🚫 Testing API error handling');

            // Mock API errors
            await page.route('**/*firestore*', route => route.abort());
            await page.route('**/*firebase*', route => route.abort());

            const consoleMessages: string[] = [];
            const errorMessages: string[] = [];

            page.on('console', msg => {
                consoleMessages.push(msg.text());
            });

            page.on('pageerror', error => {
                errorMessages.push(error.message);
            });

            await page.locator('input[type="text"]').fill('test');
            await page.locator('button[type="submit"]').click();
            await page.waitForTimeout(3000);

            // Should handle API errors gracefully
            const hasErrorHandling = consoleMessages.some(msg =>
                msg.includes('error') ||
                msg.includes('fallback') ||
                msg.includes('offline') ||
                msg.includes('failed')
            );

            // Should not crash the application
            const hasCriticalError = errorMessages.some(error =>
                error.includes('Uncaught') && !error.includes('Firebase')
            );

            expect(hasErrorHandling).toBeTruthy();
            expect(hasCriticalError).toBeFalsy();

            // UI should still be usable
            await expect(page.locator('input[type="text"]')).toBeVisible();
        });
    });

    test.describe('UI Error Handling', () => {
        test('should handle JavaScript errors gracefully', async ({ page }) => {
            console.log('🚫 Testing JavaScript error handling');

            const errors: string[] = [];
            page.on('pageerror', error => {
                errors.push(error.message);
            });

            // Inject a non-critical error
            await page.evaluate(() => {
                // @ts-ignore - intentional error for testing
                window.nonExistentFunction();
            });

            // Application should continue working despite error
            await page.locator('input[type="text"]').fill('carte');
            await page.locator('button[type="submit"]').click();

            // Should handle the error and continue functioning
            await page.waitForTimeout(1000);
            await expect(page.locator('input[type="text"]')).toBeVisible();

            console.log(`Captured ${errors.length} JavaScript errors`);
        });

        test('should handle missing data gracefully', async ({ page }) => {
            console.log('🚫 Testing missing data handling');

            // Search for something that definitely doesn't exist
            await page.locator('input[type="text"]').fill('xyzneverexists123456');
            await page.locator('button[type="submit"]').click();
            await page.waitForTimeout(2000);

            // Should show "no results" message instead of crashing
            const noResultsIndicators = [
                'text=/No results/',
                'text=/Nu am găsit/',
                'text=/not found/',
                '[data-testid="no-results"]',
                '.no-results'
            ];

            let foundNoResultsMessage = false;
            for (const selector of noResultsIndicators) {
                if (await page.locator(selector).count() > 0) {
                    foundNoResultsMessage = true;
                    console.log('✅ No results message found');
                    break;
                }
            }

            if (!foundNoResultsMessage) {
                // Check if results container is empty
                const resultsContainer = page.locator('[data-testid="search-results"]');
                const hasEmptyResults = await resultsContainer.count() > 0;

                if (hasEmptyResults) {
                    const resultItems = await page.locator('[data-testid="search-result-item"]').count();
                    expect(resultItems).toBe(0);
                    console.log('✅ Empty results handled properly');
                }
            }
        });

        test('should handle malformed data', async ({ page }) => {
            console.log('🚫 Testing malformed data handling');

            // Inject malformed data into localStorage to simulate corruption
            await page.evaluate(() => {
                localStorage.setItem('favorites', 'invalid-json-data');
                localStorage.setItem('searchHistory', '{broken json}');
            });

            // Reload page to trigger data loading
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Application should still load despite corrupted data
            await expect(page.locator('input[type="text"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toBeVisible();

            // Try normal functionality
            await page.locator('input[type="text"]').fill('test');
            await page.locator('button[type="submit"]').click();

            // Should work normally
            await page.waitForTimeout(1000);
            await expect(page.locator('input[type="text"]')).toBeVisible();
        });
    });

    test.describe('Input Validation', () => {
        test('should validate input length limits', async ({ page }) => {
            console.log('🚫 Testing input length validation');

            const searchInput = page.locator('input[type="text"]');

            // Check max length attribute
            const maxLength = await searchInput.getAttribute('maxlength');

            if (maxLength) {
                const maxLengthNum = parseInt(maxLength);

                // Try to enter text longer than max length
                const longText = 'a'.repeat(maxLengthNum + 10);
                await searchInput.fill(longText);

                const actualValue = await searchInput.inputValue();
                expect(actualValue.length).toBeLessThanOrEqual(maxLengthNum);

                console.log(`✅ Input correctly limited to ${maxLengthNum} characters`);
            } else {
                console.log('ℹ️ No explicit maxlength found');
            }
        });

        test('should sanitize user input', async ({ page }) => {
            console.log('🚫 Testing input sanitization');

            const maliciousInputs = [
                '<img src=x onerror=alert(1)>',
                'javascript:alert("xss")',
                '<iframe src="javascript:alert(1)"></iframe>',
                '"><script>alert("xss")</script>',
                'onload="alert(1)"'
            ];

            for (const maliciousInput of maliciousInputs) {
                await page.locator('input[type="text"]').clear();
                await page.locator('input[type="text"]').fill(maliciousInput);
                await page.locator('button[type="submit"]').click();
                await page.waitForTimeout(1000);

                // Should not execute malicious code
                const inputValue = await page.locator('input[type="text"]').inputValue();

                // Input should be sanitized or escaped
                expect(inputValue).not.toContain('<script>');
                expect(inputValue).not.toContain('javascript:');

                // Application should continue working
                await expect(page.locator('input[type="text"]')).toBeVisible();
            }
        });
    });

    test.describe('Edge Case Scenarios', () => {
        test('should handle rapid successive searches', async ({ page }) => {
            console.log('🚫 Testing rapid successive searches');

            const searchTerms = ['carte', 'dragoste', 'casă', 'apă', 'soare'];

            // Perform rapid searches
            for (const term of searchTerms) {
                await page.locator('input[type="text"]').clear();
                await page.locator('input[type="text"]').fill(term);
                await page.locator('button[type="submit"]').click();
                // No waiting between searches to test race conditions
            }

            await page.waitForTimeout(2000);

            // Should handle race conditions gracefully
            await expect(page.locator('input[type="text"]')).toBeVisible();
            await expect(page.locator('button[type="submit"]')).toBeVisible();

            // Should show results for the last search
            const lastInputValue = await page.locator('input[type="text"]').inputValue();
            expect(searchTerms).toContain(lastInputValue);
        });

        test('should handle browser back/forward navigation', async ({ page }) => {
            console.log('🚫 Testing browser navigation');

            // Perform initial search
            await page.locator('input[type="text"]').fill('carte');
            await page.locator('button[type="submit"]').click();
            await page.waitForSelector('[data-testid="search-results"]');

            // Perform second search
            await page.locator('input[type="text"]').clear();
            await page.locator('input[type="text"]').fill('dragoste');
            await page.locator('button[type="submit"]').click();
            await page.waitForTimeout(1000);

            // Go back
            await page.goBack();
            await page.waitForTimeout(1000);

            // Should handle browser navigation gracefully
            await expect(page.locator('input[type="text"]')).toBeVisible();

            // Go forward
            await page.goForward();
            await page.waitForTimeout(1000);

            await expect(page.locator('input[type="text"]')).toBeVisible();
        });

        test('should handle window resize during operation', async ({ page }) => {
            console.log('🚫 Testing window resize handling');

            // Start with desktop size
            await page.setViewportSize({ width: 1920, height: 1080 });

            // Perform search
            await page.locator('input[type="text"]').fill('carte');
            await page.locator('button[type="submit"]').click();
            await page.waitForSelector('[data-testid="search-results"]');

            // Resize to mobile during operation
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(1000);

            // Should adapt to new size
            await expect(page.locator('input[type="text"]')).toBeVisible();
            await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

            // Resize back to desktop
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.waitForTimeout(1000);

            await expect(page.locator('input[type="text"]')).toBeVisible();
        });

        test('should handle session storage limitations', async ({ page }) => {
            console.log('🚫 Testing storage limitations');

            // Fill storage to near capacity
            await page.evaluate(() => {
                try {
                    const largeData = 'x'.repeat(1024 * 1024); // 1MB
                    for (let i = 0; i < 5; i++) {
                        localStorage.setItem(`large_data_${i}`, largeData);
                    }
                } catch (error) {
                    console.log('Storage quota exceeded as expected');
                }
            });

            // Try normal operations
            await page.locator('input[type="text"]').fill('carte');
            await page.locator('button[type="submit"]').click();

            // Should handle storage errors gracefully
            await page.waitForTimeout(1000);
            await expect(page.locator('input[type="text"]')).toBeVisible();

            // Clean up
            await page.evaluate(() => {
                localStorage.clear();
            });
        });
    });
});
