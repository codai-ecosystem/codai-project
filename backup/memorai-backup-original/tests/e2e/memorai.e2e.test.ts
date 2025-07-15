/**
 * MEMORAI E2E Test Suite
 * Playwright-based end-to-end testing
 */

import { test, expect } from '@playwright/test'

test.describe('MEMORAI E2E Tests', () => {

  test('should load the main page successfully', async ({ page }) => {
    await page.goto('/')

    // Check for essential elements
    await expect(page.locator('header, nav, main')).toBeVisible()
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    expect(errors).toHaveLength(0)
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/')

    // Check mobile layout
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle performance within limits', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(10000) // Should load in less than 10 seconds
  })

})
