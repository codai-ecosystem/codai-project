import { test, expect, type Page } from '@playwright/test';

test.describe('Cautai Web Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test.describe('Landing Page', () => {
    test('should display the main landing page correctly', async ({ page }) => {
      // Check for main heading
      await expect(page.getByRole('heading', { name: /cautai/i })).toBeVisible();
      
      // Check for search interface
      await expect(page.getByPlaceholder(/search/i)).toBeVisible();
      
      // Check for key features section
      await expect(page.getByText(/AI-first search engine/i)).toBeVisible();
    });

    test('should have working navigation', async ({ page }) => {
      // Check navigation links
      const nav = page.getByRole('navigation');
      await expect(nav.getByText(/features/i)).toBeVisible();
      await expect(nav.getByText(/about/i)).toBeVisible();
      await expect(nav.getByText(/contact/i)).toBeVisible();
      
      // Test navigation
      await nav.getByText(/features/i).click();
      await expect(page.url()).toContain('/features');
    });

    test('should support theme switching', async ({ page }) => {
      // Find theme toggle button
      const themeToggle = page.getByRole('button', { name: /theme/i });
      await expect(themeToggle).toBeVisible();
      
      // Click theme toggle
      await themeToggle.click();
      
      // Check if theme changed (look for dark mode class or attribute)
      await expect(page.locator('html')).toHaveClass(/dark/);
      
      // Toggle back
      await themeToggle.click();
      await expect(page.locator('html')).not.toHaveClass(/dark/);
    });
  });

  test.describe('Search Functionality', () => {
    test('should perform basic search', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      const searchButton = page.getByRole('button', { name: /search/i });
      
      // Enter search query
      await searchInput.fill('artificial intelligence');
      await searchButton.click();
      
      // Wait for results to load
      await page.waitForSelector('[data-testid="search-results"]', { timeout: 10000 });
      
      // Check for results
      const results = page.getByTestId('search-results');
      await expect(results).toBeVisible();
      
      // Check for result items
      const resultItems = page.getByTestId('search-result-item');
      await expect(resultItems.first()).toBeVisible();
      
      // Check result structure
      await expect(resultItems.first().getByTestId('result-title')).toBeVisible();
      await expect(resultItems.first().getByTestId('result-url')).toBeVisible();
      await expect(resultItems.first().getByTestId('result-snippet')).toBeVisible();
    });

    test('should handle search with filters', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      
      // Open search filters
      const filtersButton = page.getByRole('button', { name: /filters/i });
      await filtersButton.click();
      
      // Select language filter
      const languageSelect = page.getByLabel(/language/i);
      await languageSelect.selectOption('en');
      
      // Select max results
      const maxResultsInput = page.getByLabel(/max results/i);
      await maxResultsInput.fill('20');
      
      // Perform search
      await searchInput.fill('machine learning');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Wait for filtered results
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Verify results respect filters
      const resultItems = page.getByTestId('search-result-item');
      const count = await resultItems.count();
      expect(count).toBeLessThanOrEqual(20);
    });

    test('should handle empty search results gracefully', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      
      // Search for something that should return no results
      await searchInput.fill('asdfghqwerty1234567890');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Wait for response
      await page.waitForSelector('[data-testid="no-results"]', { timeout: 10000 });
      
      // Check no results message
      await expect(page.getByTestId('no-results')).toBeVisible();
      await expect(page.getByText(/no results found/i)).toBeVisible();
    });

    test('should handle search errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/search', route => {
        route.abort('failed');
      });
      
      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('test query');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Wait for error message
      await page.waitForSelector('[data-testid="search-error"]', { timeout: 5000 });
      
      // Check error message
      await expect(page.getByTestId('search-error')).toBeVisible();
      await expect(page.getByText(/error/i)).toBeVisible();
    });

    test('should support search result pagination', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      
      // Perform search that should have many results
      await searchInput.fill('technology');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Wait for results
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Check if pagination exists (might be implemented later)
      const pagination = page.getByTestId('pagination');
      if (await pagination.isVisible()) {
        // Test pagination
        const nextButton = pagination.getByRole('button', { name: /next/i });
        await nextButton.click();
        
        // Wait for new results to load
        await page.waitForLoadState('networkidle');
        
        // Verify page changed
        await expect(page.url()).toMatch(/page=2/);
      }
    });
  });

  test.describe('Internationalization', () => {
    test('should support Romanian language', async ({ page }) => {
      // Find language switcher
      const languageButton = page.getByRole('button', { name: /language/i });
      await languageButton.click();
      
      // Select Romanian
      await page.getByText(/română/i).click();
      
      // Check if content changed to Romanian
      await expect(page.getByText(/căutare/i)).toBeVisible(); // "search" in Romanian
    });

    test('should maintain language preference', async ({ page, context }) => {
      // Set Romanian language
      const languageButton = page.getByRole('button', { name: /language/i });
      await languageButton.click();
      await page.getByText(/română/i).click();
      
      // Reload page
      await page.reload();
      
      // Check if Romanian is still active
      await expect(page.getByText(/căutare/i)).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if mobile menu is visible
      const mobileMenuButton = page.getByRole('button', { name: /menu/i });
      await expect(mobileMenuButton).toBeVisible();
      
      // Test mobile search
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
      
      await searchInput.fill('mobile test');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Wait for results on mobile
      await page.waitForSelector('[data-testid="search-results"]');
      await expect(page.getByTestId('search-results')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Test tablet layout
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toBeVisible();
      
      // Search interface should be properly sized
      const searchContainer = page.getByTestId('search-container');
      await expect(searchContainer).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper keyboard navigation', async ({ page }) => {
      // Tab through main elements
      await page.keyboard.press('Tab');
      await expect(page.getByPlaceholder(/search/i)).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: /search/i })).toBeFocused();
      
      // Test search with keyboard
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.type('keyboard navigation test');
      await page.keyboard.press('Enter');
      
      // Wait for results
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Tab through results
      await page.keyboard.press('Tab');
      const firstResult = page.getByTestId('search-result-item').first();
      await expect(firstResult.getByRole('link')).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check main search input
      const searchInput = page.getByPlaceholder(/search/i);
      await expect(searchInput).toHaveAttribute('aria-label', /search/i);
      
      // Check search button
      const searchButton = page.getByRole('button', { name: /search/i });
      await expect(searchButton).toHaveAttribute('aria-label');
      
      // Perform search to check results accessibility
      await searchInput.fill('accessibility test');
      await searchButton.click();
      
      // Wait for results
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Check results have proper labels
      const results = page.getByTestId('search-results');
      await expect(results).toHaveAttribute('aria-label', /search results/i);
    });
  });

  test.describe('Performance', () => {
    test('should load initial page quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Page should load in under 3 seconds
    });

    test('should handle concurrent searches', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      const searchButton = page.getByRole('button', { name: /search/i });
      
      // Start multiple searches quickly
      const searches = ['query 1', 'query 2', 'query 3'];
      
      for (const query of searches) {
        await searchInput.fill(query);
        await searchButton.click();
        // Don't wait for results, immediately start next search
      }
      
      // Wait for final results
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Should show results for the last query
      await expect(page.getByText('query 3')).toBeVisible();
    });
  });

  test.describe('Search Result Interactions', () => {
    test('should allow clicking on search results', async ({ page, context }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      
      await searchInput.fill('clickable results test');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Wait for results
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Click on first result (should open in new tab)
      const firstResultLink = page.getByTestId('search-result-item').first().getByRole('link');
      
      // Listen for new page
      const pagePromise = context.waitForEvent('page');
      await firstResultLink.click();
      const newPage = await pagePromise;
      
      // Verify new page opened
      expect(newPage.url()).toMatch(/^https?:\/\//);
    });

    test('should show result metadata', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      
      await searchInput.fill('metadata test');
      await page.getByRole('button', { name: /search/i }).click();
      
      // Wait for results
      await page.waitForSelector('[data-testid="search-results"]');
      
      // Check for metadata
      const firstResult = page.getByTestId('search-result-item').first();
      
      // Should show score, processing time, or other metadata
      await expect(firstResult.getByTestId('result-metadata')).toBeVisible();
    });
  });
});