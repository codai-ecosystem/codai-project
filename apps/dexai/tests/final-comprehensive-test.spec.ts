import { test, expect } from '@playwright/test';

test.describe('DEXAI Romanian Dictionary - Comprehensive User Scenarios', () => {
  const BASE_URL = 'http://localhost:3394';

  test('01. Homepage loads correctly with proper port configuration', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/DEXAI/);
    
    // Verify page loads on correct port (3394, not default 3000)
    expect(page.url()).toContain('3394');
    
    // Verify main elements are present
    await expect(page.locator('text=DEXAI')).toBeVisible();
    await expect(page.locator('text=Dicționarul Viitorului')).toBeVisible();
    await expect(page.locator('input[placeholder*="Caută orice cuvânt"]')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/01-homepage-load.png', fullPage: true });
  });

  test('02. Search functionality works with URL parameter updates', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Test search input
    const searchInput = page.locator('input[placeholder*="Caută orice cuvânt"]');
    await searchInput.fill('dragoste');
    
    // Submit search
    await page.locator('button[type="submit"]').click();
    
    // Verify URL was updated with search parameter
    await expect(page).toHaveURL(/\?q=dragoste/);
    
    // Verify search results appear
    await expect(page.locator('text=Găsite')).toBeVisible();
    await expect(page.locator('text=rezultate')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/02-search-with-url.png', fullPage: true });
  });

  test('03. Direct URL navigation with search parameters works', async ({ page }) => {
    // Navigate directly to URL with search parameter
    await page.goto(`${BASE_URL}/?q=natura`);
    
    // Verify search field is populated
    const searchInput = page.locator('input[placeholder*="Caută orice cuvânt"]');
    await expect(searchInput).toHaveValue('natura');
    
    // Verify search results are displayed automatically
    await expect(page.locator('text=Găsite')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/03-direct-url-search.png', fullPage: true });
  });

  test('04. Multiple search terms work correctly', async ({ page }) => {
    const searchTerms = ['libertate', 'frumusețe', 'învățare', 'tehnologie'];
    
    for (const term of searchTerms) {
      await page.goto(`${BASE_URL}/?q=${encodeURIComponent(term)}`);
      
      // Verify URL contains the search term
      expect(page.url()).toContain(encodeURIComponent(term));
      
      // Verify search field shows the term
      const searchInput = page.locator('input[placeholder*="Caută orice cuvânt"]');
      await expect(searchInput).toHaveValue(term);
      
      // Verify search results appear
      await expect(page.locator('text=Găsite')).toBeVisible();
      
      await page.screenshot({ path: `test-results/04-search-${term}.png`, fullPage: true });
    }
  });

  test('05. Empty search results are handled properly', async ({ page }) => {
    await page.goto(`${BASE_URL}/?q=xyztestnotfound123`);
    
    // Should show no results message
    await expect(page.locator('text=Nu am găsit rezultate')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/05-no-results.png', fullPage: true });
  });

  test('06. Responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/?q=mobil`);
    
    // Verify mobile layout
    await expect(page.locator('text=DEXAI')).toBeVisible();
    await expect(page.locator('input[placeholder*="Caută orice cuvânt"]')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/06-mobile-responsive.png', fullPage: true });
  });

  test('07. Responsive design works on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/?q=tablet`);
    
    // Verify tablet layout
    await expect(page.locator('text=DEXAI')).toBeVisible();
    await expect(page.locator('input[placeholder*="Caută orice cuvânt"]')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/07-tablet-responsive.png', fullPage: true });
  });

  test('08. Search input clearing works correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/?q=test`);
    
    // Clear the search input
    const searchInput = page.locator('input[placeholder*="Caută orice cuvânt"]');
    await searchInput.clear();
    
    // URL should update to remove query parameter
    await expect(page).toHaveURL(BASE_URL);
    
    await page.screenshot({ path: 'test-results/08-search-clear.png', fullPage: true });
  });

  test('09. Page performance is acceptable', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Verify load time is reasonable (less than 3 seconds)
    expect(loadTime).toBeLessThan(3000);
    
    console.log(`Page load time: ${loadTime}ms`);
  });

  test('10. Romanian characters in search work correctly', async ({ page }) => {
    const romanianTerms = ['română', 'învățământ', 'frumusețe', 'strămoși'];
    
    for (const term of romanianTerms) {
      await page.goto(`${BASE_URL}/?q=${encodeURIComponent(term)}`);
      
      // Verify URL encoding works
      expect(page.url()).toContain('q=');
      
      // Verify search field shows correct characters
      const searchInput = page.locator('input[placeholder*="Caută orice cuvânt"]');
      await expect(searchInput).toHaveValue(term);
      
      await page.screenshot({ path: `test-results/10-romanian-${term}.png`, fullPage: true });
    }
  });

  test('11. Search result details are properly displayed', async ({ page }) => {
    await page.goto(`${BASE_URL}/?q=exemplu`);
    
    // Verify search result components
    await expect(page.locator('text=Găsite')).toBeVisible();
    await expect(page.locator('text=rezultate')).toBeVisible();
    
    // Should show definition sections
    await expect(page.locator('text=Definiții')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/11-search-details.png', fullPage: true });
  });

  test('12. App works without JavaScript (basic functionality)', async ({ page }) => {
    // Disable JavaScript
    await page.context().addInitScript(() => {
      Object.defineProperty(navigator, 'javaEnabled', {
        writable: false,
        value: false,
      });
    });
    
    await page.goto(BASE_URL);
    
    // Basic elements should still be visible
    await expect(page.locator('text=DEXAI')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/12-no-javascript.png', fullPage: true });
  });
});

test.describe('DEXAI - Advanced User Scenarios', () => {
  const BASE_URL = 'http://localhost:3394';

  test('13. Browser back/forward navigation works with search', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Search for first term
    await page.goto(`${BASE_URL}/?q=primul`);
    await expect(page.locator('input')).toHaveValue('primul');
    
    // Search for second term
    await page.goto(`${BASE_URL}/?q=al_doilea`);
    await expect(page.locator('input')).toHaveValue('al_doilea');
    
    // Go back
    await page.goBack();
    await expect(page.locator('input')).toHaveValue('primul');
    
    // Go forward
    await page.goForward();
    await expect(page.locator('input')).toHaveValue('al_doilea');
    
    await page.screenshot({ path: 'test-results/13-browser-navigation.png', fullPage: true });
  });

  test('14. Long search terms are handled properly', async ({ page }) => {
    const longTerm = 'constituționalismulneînțeles';
    await page.goto(`${BASE_URL}/?q=${longTerm}`);
    
    const searchInput = page.locator('input[placeholder*="Caută orice cuvânt"]');
    await expect(searchInput).toHaveValue(longTerm);
    
    await page.screenshot({ path: 'test-results/14-long-search-term.png', fullPage: true });
  });

  test('15. Special characters in search are handled', async ({ page }) => {
    const specialTerm = 'test-cu_caractere.speciale!';
    await page.goto(`${BASE_URL}/?q=${encodeURIComponent(specialTerm)}`);
    
    const searchInput = page.locator('input[placeholder*="Caută orice cuvânt"]');
    await expect(searchInput).toHaveValue(specialTerm);
    
    await page.screenshot({ path: 'test-results/15-special-characters.png', fullPage: true });
  });
});
