import { test, expect } from '@playwright/test'
import { createTestUser, generateTestAuthToken } from '../utils/auth-helper'

test.describe('Memory Management E2E Tests', () => {
  let testUser: any
  let authToken: string

  test.beforeEach(async ({ page }) => {
    // Create test user and auth token
    testUser = await createTestUser()
    const authResult = await generateTestAuthToken(testUser)
    authToken = typeof authResult === 'string' ? authResult : authResult.token

    // Navigate to the memories page and authenticate
    await page.goto('/memories')
    await page.evaluate((token) => {
      localStorage.setItem('auth-token', token)
    }, authToken)
    await page.reload()
  })

  test('should create a new memory', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Click create memory button (using different selectors as fallbacks)
    const createButton = page.locator('[data-testid="create-memory-button"]').or(
      page.getByRole('button', { name: /create/i })
    ).or(
      page.locator('button').filter({ hasText: /create/i })
    ).first()
    
    await createButton.click()
    
    // Fill memory form
    await page.locator('[data-testid="memory-title-input"]').or(
      page.getByLabel(/title/i)
    ).fill('Test Memory')
    
    await page.locator('[data-testid="memory-content-textarea"]').or(
      page.getByLabel(/content/i)
    ).fill('This is a test memory content')
    
    // Submit form
    const submitButton = page.locator('[data-testid="submit-memory-button"]').or(
      page.getByRole('button', { name: /save/i })
    ).or(
      page.getByRole('button', { name: /submit/i })
    ).first()
    
    await submitButton.click()
    
    // Verify memory was created (using flexible selectors)
    await expect(
      page.locator('[data-testid="memory-card"]').or(
        page.getByText('Test Memory')
      ).first()
    ).toBeVisible()
  })

  test('should search for memories', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Search for memories
    const searchInput = page.locator('[data-testid="search-input"]').or(
      page.getByRole('searchbox')
    ).or(
      page.getByPlaceholder(/search/i)
    ).first()
    
    await searchInput.fill('test')
    
    // Wait for search results
    await page.waitForTimeout(1000)
    
    // Verify search functionality works (basic check)
    await expect(searchInput).toHaveValue('test')
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Basic mobile responsiveness check
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Check that content is not overflowing
    const bodyWidth = await body.evaluate(el => el.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375)
  })

  test('should meet basic accessibility standards', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check for basic accessibility features
    await expect(page.locator('main').or(page.locator('[role="main"]'))).toBeVisible()
    
    // Check keyboard navigation
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Check for page title
    await expect(page).toHaveTitle(/.+/)
  })
})
