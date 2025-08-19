import { expect, test } from '@playwright/test';

test.describe('PWA Features', () => {
  test('service worker registration', async ({ page }) => {
    await page.goto('/');

    // Check if service worker is registered
    const swRegistration = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });

    expect(swRegistration).toBe(true);
  });

  test('manifest.json accessibility', async ({ page }) => {
    const response = await page.goto('/site.webmanifest');
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('icons');
  });
});
