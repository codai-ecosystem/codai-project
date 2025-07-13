import { expect, test } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test('service worker should be registered and manifest should exist', async ({
    page,
  }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Check if service worker is registered
    const isServiceWorkerRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    });

    expect(isServiceWorkerRegistered).toBeTruthy();

    // Check if manifest is properly linked
    const manifestLink = await page
      .locator('link[rel="manifest"]')
      .getAttribute('href');

    // The correct manifest file path (could be site.webmanifest or manifest.json)
    const manifestPath = manifestLink || '/site.webmanifest';
    expect(manifestLink).toBeTruthy();

    // Check if manifest file is accessible
    const manifestResponse = await page.request.get(manifestPath);
    expect(manifestResponse.ok()).toBeTruthy();

    // Verify manifest contains essential fields
    const manifestContent = await manifestResponse.json();
    expect(manifestContent).toHaveProperty('name');
    expect(manifestContent).toHaveProperty('short_name');
    expect(manifestContent).toHaveProperty('icons');
    expect(Array.isArray(manifestContent.icons)).toBeTruthy();
  });
  test('PWA Installer should render when installable', async ({ page }) => {
    // Mock the beforeinstallprompt event to simulate PWA installability
    await page.addInitScript(() => {
      window.addEventListener('DOMContentLoaded', () => {
        // Create a mock beforeinstallprompt event
        const event = new Event('beforeinstallprompt');
        // Add the required methods
        Object.defineProperty(event, 'prompt', {
          value: () => Promise.resolve(),
        });
        Object.defineProperty(event, 'userChoice', {
          value: Promise.resolve({ outcome: 'accepted' }),
        });
        // Dispatch the event
        window.dispatchEvent(event);
      });
    });

    // Navigate to the homepage
    await page.goto('/');

    // Check for the Install App button (may appear after a short delay)
    await expect(
      page.getByRole('button', { name: /Install App/i })
    ).toBeVisible({ timeout: 5000 });
  });

  test('PWA Offline indicator should render when offline', async ({ page }) => {
    // Mock the offline state
    await page.addInitScript(() => {
      // Override the navigator.onLine property
      Object.defineProperty(navigator, 'onLine', {
        get: () => false,
      });

      // Dispatch the offline event
      window.dispatchEvent(new Event('offline'));
    });

    // Navigate to the homepage
    await page.goto('/');

    // Check for the Offline indicator
    await expect(page.getByText('Offline')).toBeVisible({ timeout: 5000 });
  });

  test('site.webmanifest accessibility', async ({ page }) => {
    const response = await page.goto('/site.webmanifest');
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest).toHaveProperty('name');
    expect(manifest).toHaveProperty('short_name');
    expect(manifest).toHaveProperty('icons');
  });
});
