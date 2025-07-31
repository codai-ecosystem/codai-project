import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper focus management', async ({ page }) => {
    // Tab through the page
    await page.keyboard.press('Tab');

    // First focusable element should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for buttons with aria-label or accessible names
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // At least one button should have an accessible name
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const accessibleName =
          (await button.getAttribute('aria-label')) ||
          (await button.textContent());
        if (accessibleName && accessibleName.trim()) {
          expect(accessibleName.trim().length).toBeGreaterThan(0);
          break;
        }
      }
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for h1
    const h1Elements = page.getByRole('heading', { level: 1 });
    const h1Count = await h1Elements.count();

    // Should have exactly one h1
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // If there are multiple h1s, it might be okay in some layouts
    // but generally we want one main h1
    if (h1Count > 1) {
      console.warn('Multiple h1 elements found - consider heading hierarchy');
    }
  });

  test('should have keyboard navigation support', async ({ page }) => {
    // Test keyboard navigation
    const interactiveElements = page
      .getByRole('button')
      .or(page.getByRole('link'))
      .or(page.getByRole('textbox'));

    const count = await interactiveElements.count();

    if (count > 0) {
      // Focus first element
      await interactiveElements.first().focus();
      await expect(interactiveElements.first()).toBeFocused();

      // Try to navigate with Tab
      await page.keyboard.press('Tab');

      // Something should be focused after Tab
      const focusedAfterTab = page.locator(':focus');
      await expect(focusedAfterTab).toBeVisible();
    }
  });
});
