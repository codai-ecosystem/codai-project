import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`should be responsive on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');

      // Main content should be visible
      await expect(page.getByRole('main')).toBeVisible();

      // Navigation should be accessible
      const nav = page.getByRole('navigation').first();
      await expect(nav).toBeVisible();

      // On mobile, there might be a hamburger menu
      if (width < 768) {
        const hamburger = page
          .getByRole('button', { name: /menu/i })
          .or(page.getByTestId('mobile-menu-trigger'));

        // Hamburger menu might exist on mobile
        if (await hamburger.isVisible()) {
          await hamburger.click();
          // Menu should open
        }
      }
    });
  });
});
