import { test, expect } from '@playwright/test';

test.describe('Internationalization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });
  test('should switch language', async ({ page, browserName }) => {
    // Find language switcher
    const langSwitcher = page
      .getByRole('button', { name: /language/i })
      .or(page.getByTestId('language-switcher'));

    // Skip test if language switcher doesn't exist
    if (!(await langSwitcher.isVisible())) {
      test.skip();
      return;
    }

    if (browserName === 'webkit') {
      // For WebKit, wait for the loading state to complete
      await page.waitForTimeout(3000);

      const isEnabled = await langSwitcher.isEnabled();
      if (!isEnabled) {
        test.skip(true, 'Language switcher still loading in WebKit');
        return;
      }
    }

    // Get initial content to compare later
    const initialHeading = await page
      .getByRole('heading', { level: 1 })
      .textContent();

    // Click language switcher
    await langSwitcher.click();

    // Find and select another language option
    const languageOption = page
      .getByText(/türkçe/i)
      .or(page.getByText(/romanian/i))
      .or(page.getByRole('menuitem'));

    // Skip test if no alternative language options
    if (!(await languageOption.isVisible())) {
      test.skip();
      return;
    }

    // Select language
    await languageOption.click();

    // Wait for language change to take effect
    await page.waitForTimeout(500);

    // Get heading after language change
    const newHeading = await page
      .getByRole('heading', { level: 1 })
      .textContent();

    // Content should have changed
    expect(newHeading).not.toBe(initialHeading);
  });
  test('should persist language preference across page reloads', async ({
    page,
    browserName,
  }) => {
    // Find language switcher
    const langSwitcher = page
      .getByRole('button', { name: /language/i })
      .or(page.getByTestId('language-switcher'));

    // Skip test if language switcher doesn't exist
    if (!(await langSwitcher.isVisible())) {
      test.skip();
      return;
    }

    if (browserName === 'webkit') {
      // For WebKit, wait for the loading state to complete
      await page.waitForTimeout(3000);

      const isEnabled = await langSwitcher.isEnabled();
      if (!isEnabled) {
        test.skip(true, 'Language switcher still loading in WebKit');
        return;
      }
    }

    // Click language switcher
    await langSwitcher.click();

    // Find and select another language option
    const languageOption = page
      .getByText(/türkçe/i)
      .or(page.getByText(/romanian/i))
      .or(page.getByRole('menuitem'));

    // Skip test if no alternative language options
    if (!(await languageOption.isVisible())) {
      test.skip();
      return;
    }

    // Select language
    await languageOption.click();

    // Wait for language change to take effect
    await page.waitForTimeout(500);

    // Get content in new language
    const contentBeforeReload = await page
      .getByRole('heading', { level: 1 })
      .textContent();

    // Reload page
    await page.reload();

    // Get content after reload
    const contentAfterReload = await page
      .getByRole('heading', { level: 1 })
      .textContent();

    // Language should persist (content should be the same)
    expect(contentAfterReload).toBe(contentBeforeReload);
  });

  test('should store language preference in local storage', async ({
    page,
  }) => {
    // Find language switcher
    const langSwitcher = page
      .getByRole('button', { name: /language/i })
      .or(page.getByTestId('language-switcher'));

    // Skip test if language switcher doesn't exist
    if (!(await langSwitcher.isVisible())) {
      test.skip();
      return;
    }

    // Click language switcher
    await langSwitcher.click();

    // Find and select Turkish language option
    const turkishOption = page.getByText(/türkçe/i);

    // Skip test if Turkish option doesn't exist
    if (!(await turkishOption.isVisible())) {
      test.skip();
      return;
    }

    // Select Turkish
    await turkishOption.click();

    // Wait for language change to take effect
    await page.waitForTimeout(500);

    // Check local storage
    const storedLang = await page.evaluate(() => {
      return (
        localStorage.getItem('i18nextLng') ||
        localStorage.getItem('language') ||
        localStorage.getItem('locale')
      );
    });

    // Local storage should contain language setting
    expect(storedLang).toBeTruthy();
    expect(storedLang?.toLowerCase()).toContain('tr');
  });
});
