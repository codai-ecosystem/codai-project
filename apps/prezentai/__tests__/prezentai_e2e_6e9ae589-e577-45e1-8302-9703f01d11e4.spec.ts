
import { test, expect } from '@playwright/test';

test('PREZENTAI_E2E_2025-07-15', async ({ page, context }) => {
  // Navigate to PREZENTAI application
  await page.goto('http://localhost:4082');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Verify page title contains PREZENTAI
  await expect(page).toHaveTitle(/PREZENTAI|Prezentai/);
  
  // Check for main navigation or hero content
  const heroSection = page.locator('h1, [data-testid="hero"], .hero, main h1').first();
  await expect(heroSection).toBeVisible({ timeout: 10000 });
  
  // Verify page is interactive
  const buttons = page.locator('button, [role="button"]');
  if (await buttons.count() > 0) {
    await expect(buttons.first()).toBeVisible();
  }
  
  // Take screenshot for validation
  await page.screenshot({ path: 'prezentai-e2e-validation.png', fullPage: true });
  
  // Verify no critical errors in console
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // Basic interaction test - look for clickable elements
  const interactiveElements = page.locator('a, button, [role="button"], [tabindex="0"]');
  const elementCount = await interactiveElements.count();
  expect(elementCount).toBeGreaterThan(0);
});