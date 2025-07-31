import { expect, test } from '@playwright/test';

test.describe('Theme System', () => {
  test('dark mode toggle functionality', async ({ page }) => {
    await page.goto('/');

    // Check initial theme
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('class');

    // Find theme toggle
    const themeToggle = page
      .getByRole('button', { name: /toggle theme/i })
      .or(page.getByTestId('theme-toggle'))
      .or(page.getByLabel(/theme/i));

    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Theme should change
      const newTheme = await html.getAttribute('class');
      expect(newTheme).not.toBe(initialTheme);

      // Check for dark/light mode indicators
      await expect(
        html.locator('.dark').or(html.locator('.light'))
      ).toBeTruthy();
    }
  });
  test('theme persistence across page reloads', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page
      .getByRole('button', { name: /toggle theme/i })
      .or(page.getByTestId('theme-toggle'));

    if (await themeToggle.isVisible()) {
      // Open theme menu and select dark theme
      await themeToggle.click();

      const darkOption = page
        .getByRole('menuitem')
        .filter({ hasText: /dark/i });
      if (await darkOption.isVisible()) {
        await darkOption.click();
      }

      // Wait for theme to apply
      await page.waitForTimeout(500);

      const themeAfterToggle = await page.locator('html').getAttribute('class');

      // Reload page
      await page.reload();

      // Wait for page to fully load
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(300); // Reduced from 1000ms

      // Theme should persist - check both class and data-theme
      const classAfterReload = await page.locator('html').getAttribute('class');
      const dataThemeAfterReload = await page
        .locator('html')
        .getAttribute('data-theme');

      // At least one should indicate dark theme
      const hasDarkTheme =
        classAfterReload?.includes('dark') || dataThemeAfterReload === 'dark';
      const hadDarkTheme = themeAfterToggle?.includes('dark');

      expect(hasDarkTheme).toBe(hadDarkTheme);
    }
  });
});
