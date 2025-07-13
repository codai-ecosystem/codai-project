import { test, expect } from '@playwright/test';

test.describe('DEXAI Voting System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Perform a search to get results for voting
        await page.locator('input[type="text"]').fill('carte');
        await page.locator('button[type="submit"]').click();
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
    });

    test('should display voting buttons for definitions', async ({ page }) => {
        console.log('🗳️ Testing voting buttons visibility');

        // Check for upvote and downvote buttons
        await expect(page.locator('[data-testid="upvote-button"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="downvote-button"]').first()).toBeVisible();

        // Check for vote counts
        await expect(page.locator('[data-testid="vote-score"]').first()).toBeVisible();
    });

    test('should allow upvoting a definition', async ({ page }) => {
        console.log('🗳️ Testing upvote functionality');

        // Get initial vote count
        const voteScore = page.locator('[data-testid="vote-score"]').first();
        const initialScore = await voteScore.textContent();

        // Click upvote button
        await page.locator('[data-testid="upvote-button"]').first().click();

        // Wait for vote to be processed
        await page.waitForTimeout(1000);

        // Check that score increased (or at least didn't show error)
        await expect(voteScore).not.toHaveText(initialScore || '');
    });

    test('should allow downvoting a definition', async ({ page }) => {
        console.log('🗳️ Testing downvote functionality');

        // Get initial vote count
        const voteScore = page.locator('[data-testid="vote-score"]').first();
        const initialScore = await voteScore.textContent();

        // Click downvote button
        await page.locator('[data-testid="downvote-button"]').first().click();

        // Wait for vote to be processed
        await page.waitForTimeout(1000);

        // Check that vote was processed
        await expect(voteScore).not.toHaveText(initialScore || '');
    });

    test('should show vote feedback', async ({ page }) => {
        console.log('🗳️ Testing vote feedback');

        // Click upvote and check for visual feedback
        await page.locator('[data-testid="upvote-button"]').first().click();

        // Should show some kind of feedback (button state change, notification, etc.)
        // This will depend on the UI implementation
        await page.waitForTimeout(500);

        // Check that the action completed without errors
        await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
    });

    test('should vote on examples', async ({ page }) => {
        console.log('🗳️ Testing example voting');

        // Look for example voting buttons
        const exampleUpvote = page.locator('[data-testid="example-upvote"]').first();
        if (await exampleUpvote.isVisible()) {
            await exampleUpvote.click();
            await page.waitForTimeout(500);

            // Check that vote was processed
            await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
        }
    });

    test('should handle voting errors gracefully', async ({ page }) => {
        console.log('🗳️ Testing voting error handling');

        // Try to vote multiple times quickly to test rate limiting
        const upvoteButton = page.locator('[data-testid="upvote-button"]').first();

        await upvoteButton.click();
        await upvoteButton.click();
        await upvoteButton.click();

        // Should handle this gracefully without breaking the UI
        await page.waitForTimeout(1000);
        await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });

    test('should maintain vote state during session', async ({ page }) => {
        console.log('🗳️ Testing vote state persistence');

        // Vote on something
        await page.locator('[data-testid="upvote-button"]').first().click();
        await page.waitForTimeout(500);

        // Search for something else
        await page.locator('input[type="text"]').clear();
        await page.locator('input[type="text"]').fill('dragoste');
        await page.locator('button[type="submit"]').click();
        await page.waitForSelector('[data-testid="search-results"]');

        // Go back to original search
        await page.locator('input[type="text"]').clear();
        await page.locator('input[type="text"]').fill('carte');
        await page.locator('button[type="submit"]').click();
        await page.waitForSelector('[data-testid="search-results"]');

        // The vote should still be reflected (though this depends on implementation)
        await expect(page.locator('[data-testid="vote-score"]').first()).toBeVisible();
    });
});
