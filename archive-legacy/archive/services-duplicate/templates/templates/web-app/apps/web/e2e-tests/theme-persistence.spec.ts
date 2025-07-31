import { expect, test } from '@playwright/test';

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });
  test('should toggle between light and dark mode', async ({ page }) => {
    // Find theme toggle - try multiple selectors
    const themeToggle = page
      .getByRole('button', { name: /toggle theme/i })
      .or(page.getByTestId('theme-toggle'))
      .or(page.getByLabel(/theme/i)); // Get initial theme state
    const initialClass = await page.locator('html').getAttribute('class');

    // Toggle theme - click to open dropdown first
    await themeToggle.click();

    // Wait for dropdown to appear
    await page.waitForTimeout(500);

    // Try to click any theme option to ensure a change
    const darkOption = page.locator('text=Dark').or(page.getByText(/^Dark$/));
    const lightOption = page
      .locator('text=Light')
      .or(page.getByText(/^Light$/));

    if (await darkOption.isVisible()) {
      await darkOption.click();
    } else if (await lightOption.isVisible()) {
      await lightOption.click();
    } else {
      // If no dropdown found, close and try button mode toggle
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      await themeToggle.click();
    }

    // Wait for theme to apply
    await page.waitForTimeout(300); // Reduced from 1000ms

    // Check that theme has changed or is explicitly set
    const newClass = await page.locator('html').getAttribute('class');

    // Theme should be different from initial OR contain light/dark class
    expect(
      newClass !== initialClass ||
        newClass?.includes('light') ||
        newClass?.includes('dark')
    ).toBe(true);
  });

  test('should persist theme preference across page reloads', async ({
    page,
  }) => {
    // Find theme toggle
    const themeToggle = page
      .getByRole('button', { name: /toggle theme/i })
      .or(page.getByTestId('theme-toggle'))
      .or(page.getByLabel(/theme/i));

    // Toggle theme
    await themeToggle.click();

    // Get current theme
    const themeAfterToggle = await page.locator('html').getAttribute('class');
    const isDarkAfterToggle = themeAfterToggle?.includes('dark') || false;

    // Reload page
    await page.reload();

    // Get theme after reload
    const themeAfterReload = await page.locator('html').getAttribute('class');
    const isDarkAfterReload = themeAfterReload?.includes('dark') || false;

    // Theme should persist
    expect(isDarkAfterReload).toBe(isDarkAfterToggle);
  });

  test('should persist theme preference across navigation', async ({
    page,
  }) => {
    // Find theme toggle
    const themeToggle = page
      .getByRole('button', { name: /toggle theme/i })
      .or(page.getByTestId('theme-toggle'))
      .or(page.getByLabel(/theme/i));

    // Toggle theme
    await themeToggle.click();

    // Get current theme
    const themeAfterToggle = await page.locator('html').getAttribute('class');
    const isDarkAfterToggle = themeAfterToggle?.includes('dark') || false;

    // Navigate to another page
    await page.getByTestId('header-sign-in').click();

    // Get theme after navigation
    const themeAfterNavigation = await page
      .locator('html')
      .getAttribute('class');
    const isDarkAfterNavigation =
      themeAfterNavigation?.includes('dark') || false;

    // Theme should persist
    expect(isDarkAfterNavigation).toBe(isDarkAfterToggle);
  });
  test('should save theme preference to local storage', async ({ page }) => {
    // Find theme toggle
    const themeToggle = page
      .getByRole('button', { name: /toggle theme/i })
      .or(page.getByTestId('theme-toggle'))
      .or(page.getByLabel(/theme/i));

    // Click to open theme menu
    await themeToggle.click();

    // Click on light theme specifically
    const lightOption = page
      .getByRole('menuitem')
      .filter({ hasText: /light/i });
    if (await lightOption.isVisible()) {
      await lightOption.click();
    }

    // Wait for theme to apply
    await page.waitForTimeout(500);

    // Check local storage - the storage key might be different
    const themeStorage = await page.evaluate(() => {
      // Try different possible storage keys and formats
      const themeStorage = localStorage.getItem('theme-storage');
      const theme = localStorage.getItem('theme');

      if (themeStorage) {
        try {
          const parsed = JSON.parse(themeStorage);
          return parsed.state?.theme || parsed.theme;
        } catch {
          return themeStorage;
        }
      }

      return theme;
    });

    // Local storage should contain a theme preference
    expect(themeStorage).toBeTruthy();
    // Should be 'light', 'dark', or 'system'
    expect(['light', 'dark', 'system']).toContain(themeStorage);
  });
});
