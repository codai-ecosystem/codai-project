import { test, expect } from '@playwright/test';

test.describe('AIDE Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ARIA labels and roles', async ({ page }) => {
    // Check main navigation has proper ARIA labels
    const mainNav = page.getByRole('navigation');
    await expect(mainNav).toBeVisible();

    // Check buttons have accessible names
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const accessibleName = await button.getAttribute('aria-label') || await button.textContent();
      expect(accessibleName).toBeTruthy();
    }

    // Check headings structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('Keyboard navigation', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);

    // Continue tabbing and ensure focus is visible
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');

      // Check that there's always a focused element
      focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).not.toBe('BODY');
    }
  });

  test('Screen reader compatibility', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // Should have exactly one H1

    // Check that images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const altText = await img.getAttribute('alt');
      expect(altText).toBeTruthy();
    }

    // Check form labels
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('Color contrast and visual accessibility', async ({ page }) => {
    // Check that text is readable
    const textElements = page.locator('p, span, div, a, button, h1, h2, h3, h4, h5, h6');
    const elementCount = await textElements.count();

    // Sample a few elements for color contrast
    const sampleSize = Math.min(10, elementCount);
    for (let i = 0; i < sampleSize; i++) {
      const element = textElements.nth(i);
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize
        };
      });

      // Basic check that color is not transparent
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
      expect(styles.color).not.toBe('transparent');
    }
  });

  test('Focus management', async ({ page }) => {
    // Navigate to chat page
    await page.getByRole('button', { name: /Get Started/i }).click();

    // Check that focus moves appropriately
    const chatInput = page.getByPlaceholder(/Type your message/);
    await expect(chatInput).toBeFocused();

    // Test modal focus management (if modal exists)
    const newProjectBtn = page.getByText(/New Project/);
    if (await newProjectBtn.isVisible()) {
      await newProjectBtn.click();

      // Focus should move to modal
      const modalInput = page.getByPlaceholder(/Project name/);
      if (await modalInput.isVisible()) {
        await expect(modalInput).toBeFocused();
      }
    }
  });

  test('Zoom and scaling', async ({ page }) => {
    // Test 200% zoom
    await page.setViewportSize({ width: 640, height: 480 });
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });

    // Check that content is still accessible
    await expect(page.getByRole('heading', { name: /AIDE/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  test('Reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Page should still function normally
    await expect(page.getByRole('heading', { name: /AIDE/ })).toBeVisible();

    // Animations should respect reduced motion
    const animatedElements = page.locator('[class*="animate"], [style*="animation"]');
    const count = await animatedElements.count();

    // If there are animated elements, they should respect reduced motion
    if (count > 0) {
      const firstAnimated = animatedElements.first();
      const animationDuration = await firstAnimated.evaluate((el) => {
        return window.getComputedStyle(el).animationDuration;
      });

      // Animation should be disabled or very short
      expect(animationDuration === '0s' || animationDuration === 'none').toBeTruthy();
    }
  });

  test('Language and internationalization', async ({ page }) => {
    // Check that lang attribute is set
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBeTruthy();

    // Check for proper direction attribute if needed
    const htmlDir = await page.getAttribute('html', 'dir');
    if (htmlDir) {
      expect(['ltr', 'rtl']).toContain(htmlDir);
    }
  });
});
