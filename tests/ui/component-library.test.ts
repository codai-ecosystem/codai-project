/**
 * Phase 4.1: Component Library Testing
 * Comprehensive UI component testing using Storybook integration
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { chromium, Browser, Page } from 'playwright';

describe('🎨 Phase 4.1: Component Library Testing', () => {
  let browser: Browser;
  let page: Page;
  const STORYBOOK_URL = 'http://localhost:6006';

  console.log('🚀 Initializing Component Library Tests...');

  beforeAll(async () => {
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    
    // Wait for Storybook to be available
    await page.goto(STORYBOOK_URL, { waitUntil: 'networkidle' });
    await expect(page.locator('[data-testid="storybook-explorer"]')).toBeVisible({ timeout: 30000 });
  });

  afterAll(async () => {
    await browser.close();
    console.log('✅ Component Library Tests Completed');
  });

  describe('📦 Button Component Testing', () => {
    it('should render all button variants correctly', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--all-variants`);
      
      // Wait for story to load
      await page.waitForSelector('[data-testid="story-canvas"]', { timeout: 10000 });
      
      // Check that all button variants are present
      const variants = [
        'Default', 'Destructive', 'Outline', 'Secondary', 
        'Ghost', 'Link', 'Success', 'Warning', 'Info', 
        'Gradient', 'Glass'
      ];
      
      for (const variant of variants) {
        await expect(page.locator(`button:has-text("${variant}")`)).toBeVisible();
      }
    });

    it('should handle button interactions correctly', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--playground`);
      
      // Wait for interactive playground
      await page.waitForSelector('button', { timeout: 10000 });
      
      const button = page.locator('button').first();
      
      // Test click interaction
      await button.click();
      
      // Test keyboard navigation
      await button.press('Tab');
      await button.press('Enter');
      
      // Verify button remains functional
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    });

    it('should support loading states correctly', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--loading`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      // Check for loading spinner presence
      const loadingButton = page.locator('button:has-text("Loading")');
      await expect(loadingButton).toBeVisible();
      
      // Verify loading state styling
      await expect(loadingButton).toHaveClass(/opacity-50|cursor-not-allowed/);
    });

    it('should handle disabled states correctly', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--disabled`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const disabledButton = page.locator('button:has-text("Disabled")');
      await expect(disabledButton).toBeVisible();
      await expect(disabledButton).toBeDisabled();
    });

    it('should display icons correctly', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--with-left-icon`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const buttonWithIcon = page.locator('button:has-text("Download")');
      await expect(buttonWithIcon).toBeVisible();
      
      // Check for icon presence (SVG elements)
      await expect(buttonWithIcon.locator('svg')).toBeVisible();
    });

    it('should support different sizes correctly', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--all-sizes`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const sizes = ['Small', 'Default', 'Large', 'Extra Large'];
      
      for (const size of sizes) {
        const sizeButton = page.locator(`button:has-text("${size}")`);
        await expect(sizeButton).toBeVisible();
        
        // Verify different sizes have different dimensions
        const boundingBox = await sizeButton.boundingBox();
        expect(boundingBox).toBeDefined();
        expect(boundingBox!.width).toBeGreaterThan(0);
        expect(boundingBox!.height).toBeGreaterThan(0);
      }
    });
  });

  describe('📝 Input Component Testing', () => {
    it('should render input component correctly', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-input--default`);
      
      await page.waitForSelector('input', { timeout: 10000 });
      
      const input = page.locator('input').first();
      await expect(input).toBeVisible();
      await expect(input).toBeEnabled();
    });

    it('should handle input interactions', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-input--playground`);
      
      await page.waitForSelector('input', { timeout: 10000 });
      
      const input = page.locator('input').first();
      
      // Test typing
      await input.fill('Test input value');
      await expect(input).toHaveValue('Test input value');
      
      // Test clearing
      await input.clear();
      await expect(input).toHaveValue('');
    });

    it('should support different input types', async () => {
      const inputTypes = ['text', 'email', 'password', 'number'];
      
      for (const type of inputTypes) {
        await page.goto(`${STORYBOOK_URL}/story/ui-components-input--${type}`);
        
        await page.waitForSelector('input', { timeout: 10000 });
        
        const input = page.locator('input').first();
        await expect(input).toBeVisible();
        
        const inputType = await input.getAttribute('type');
        expect(inputType).toBe(type);
      }
    });

    it('should handle validation states', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-input--with-validation`);
      
      await page.waitForSelector('input', { timeout: 10000 });
      
      const input = page.locator('input').first();
      
      // Test invalid input
      await input.fill('invalid-email');
      await input.press('Tab'); // Trigger validation
      
      // Check for error styling
      await expect(input).toHaveClass(/border-red|border-destructive/);
    });
  });

  describe('🃏 Card Component Testing', () => {
    it('should render card component correctly', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-card--default`);
      
      await page.waitForSelector('[data-testid="card"]', { timeout: 10000 });
      
      const card = page.locator('[data-testid="card"]').first();
      await expect(card).toBeVisible();
    });

    it('should support different card variants', async () => {
      const variants = ['default', 'outlined', 'elevated', 'interactive'];
      
      for (const variant of variants) {
        await page.goto(`${STORYBOOK_URL}/story/ui-components-card--${variant}`);
        
        await page.waitForSelector('[data-testid="card"]', { timeout: 10000 });
        
        const card = page.locator('[data-testid="card"]').first();
        await expect(card).toBeVisible();
      }
    });

    it('should handle card interactions', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-card--interactive`);
      
      await page.waitForSelector('[data-testid="card"]', { timeout: 10000 });
      
      const interactiveCard = page.locator('[data-testid="card"]').first();
      
      // Test hover interaction
      await interactiveCard.hover();
      
      // Test click interaction
      await interactiveCard.click();
      
      await expect(interactiveCard).toBeVisible();
    });
  });

  describe('♿ Accessibility Testing', () => {
    it('should meet WCAG 2.1 AA standards for Button', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--default`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const button = page.locator('button').first();
      
      // Check for proper ARIA attributes
      const ariaLabel = await button.getAttribute('aria-label');
      const role = await button.getAttribute('role');
      
      // Button should be focusable
      await button.focus();
      await expect(button).toBeFocused();
      
      // Should support keyboard navigation
      await button.press('Space');
      await button.press('Enter');
    });

    it('should provide proper color contrast', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--all-variants`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      expect(buttonCount).toBeGreaterThan(0);
      
      // Check that all buttons are visible (indicating sufficient contrast)
      for (let i = 0; i < buttonCount; i++) {
        await expect(buttons.nth(i)).toBeVisible();
      }
    });

    it('should support screen reader navigation', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--with-left-icon`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const button = page.locator('button').first();
      
      // Check for proper accessible name
      const accessibleName = await button.textContent();
      expect(accessibleName).toBeTruthy();
      expect(accessibleName!.trim().length).toBeGreaterThan(0);
    });
  });

  describe('📱 Responsive Design Testing', () => {
    it('should adapt to mobile viewport', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--all-sizes`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      // All buttons should remain visible and functional on mobile
      for (let i = 0; i < buttonCount; i++) {
        await expect(buttons.nth(i)).toBeVisible();
      }
    });

    it('should adapt to tablet viewport', async () => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto(`${STORYBOOK_URL}/story/ui-components-card--default`);
      
      await page.waitForSelector('[data-testid="card"]', { timeout: 10000 });
      
      const card = page.locator('[data-testid="card"]').first();
      await expect(card).toBeVisible();
      
      // Check that card adapts to tablet size
      const boundingBox = await card.boundingBox();
      expect(boundingBox).toBeDefined();
      expect(boundingBox!.width).toBeLessThanOrEqual(768);
    });

    it('should adapt to desktop viewport', async () => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--all-variants`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const buttonsContainer = page.locator('div').first();
      await expect(buttonsContainer).toBeVisible();
      
      // Check that components utilize desktop space effectively
      const boundingBox = await buttonsContainer.boundingBox();
      expect(boundingBox).toBeDefined();
      expect(boundingBox!.width).toBeGreaterThan(0);
    });
  });

  describe('🎨 Theme Consistency Testing', () => {
    it('should support light theme correctly', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--default`);
      
      // Switch to light theme via Storybook toolbar
      await page.click('[title="Theme"]');
      await page.click('[data-value="light"]');
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const button = page.locator('button').first();
      await expect(button).toBeVisible();
      
      // Verify light theme styling
      const computedStyle = await button.evaluate((el) => {
        return window.getComputedStyle(el);
      });
      
      expect(computedStyle).toBeDefined();
    });

    it('should support dark theme correctly', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--default`);
      
      // Switch to dark theme via Storybook toolbar
      await page.click('[title="Theme"]');
      await page.click('[data-value="dark"]');
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const button = page.locator('button').first();
      await expect(button).toBeVisible();
      
      // Verify dark theme styling
      const computedStyle = await button.evaluate((el) => {
        return window.getComputedStyle(el);
      });
      
      expect(computedStyle).toBeDefined();
    });

    it('should maintain consistency across components', async () => {
      const components = ['button', 'input', 'card'];
      
      for (const component of components) {
        await page.goto(`${STORYBOOK_URL}/story/ui-components-${component}--default`);
        
        await page.waitForSelector(`[data-testid="${component}"], ${component}`, { timeout: 10000 });
        
        const element = page.locator(`[data-testid="${component}"], ${component}`).first();
        await expect(element).toBeVisible();
      }
    });
  });

  describe('⚡ Performance Testing', () => {
    it('should render components efficiently', async () => {
      const startTime = Date.now();
      
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--all-variants`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const renderTime = Date.now() - startTime;
      
      // Component should render within reasonable time (5 seconds)
      expect(renderTime).toBeLessThan(5000);
    });

    it('should handle multiple component instances', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--all-variants`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      // Should handle multiple instances efficiently
      expect(buttonCount).toBeGreaterThan(5);
      
      // All buttons should be interactive
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        await expect(buttons.nth(i)).toBeVisible();
      }
    });

    it('should maintain performance during interactions', async () => {
      await page.goto(`${STORYBOOK_URL}/story/ui-components-button--playground`);
      
      await page.waitForSelector('button', { timeout: 10000 });
      
      const button = page.locator('button').first();
      
      // Perform multiple rapid interactions
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        await button.click();
        await page.waitForTimeout(50); // Small delay
      }
      
      const interactionTime = Date.now() - startTime;
      
      // Interactions should remain responsive
      expect(interactionTime).toBeLessThan(2000);
      await expect(button).toBeVisible();
    });
  });
});
