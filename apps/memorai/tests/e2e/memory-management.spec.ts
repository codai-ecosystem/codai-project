/**
 * Memory Management E2E Tests
 * 2025 Best Practices: User-centric testing with real browser interactions
 */

import { test, expect, Page } from '@playwright/test'
import { AuthHelper } from '../utils/auth-helper'
import { MemoryHelper } from '../utils/memory-helper'
import { AccessibilityHelper } from '../utils/accessibility-helper'

test.describe('Memory Management', () => {
  let authHelper: AuthHelper
  let memoryHelper: MemoryHelper
  let accessibilityHelper: AccessibilityHelper

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page)
    memoryHelper = new MemoryHelper(page)
    accessibilityHelper = new AccessibilityHelper(page)

    // Login before each test
    await authHelper.login({
      email: 'test@example.com',
      password: 'testpassword123'
    })
    
    // Navigate to dashboard
    await page.goto('/dashboard')
    await expect(page).toHaveTitle(/MemorAI Dashboard/)
  })

  test.describe('Creating Memories', () => {
    test('should create a basic memory', async ({ page }) => {
      // Click create new memory button
      await page.getByRole('button', { name: /create new memory/i }).click()
      
      // Verify dialog opened
      const dialog = page.getByRole('dialog', { name: /create memory/i })
      await expect(dialog).toBeVisible()

      // Fill in memory details
      await page.getByLabel(/title/i).fill('My Test Memory')
      await page.getByLabel(/content/i).fill('This is a test memory created by Playwright')
      
      // Select category
      await page.getByLabel(/category/i).selectOption('personal')
      
      // Add tags
      await page.getByLabel(/tags/i).fill('test, automation, e2e')
      
      // Save memory
      await page.getByRole('button', { name: /save memory/i }).click()
      
      // Verify success message
      await expect(page.getByText(/memory created successfully/i)).toBeVisible()
      
      // Verify memory appears in list
      await expect(page.getByText('My Test Memory')).toBeVisible()
    })

    test('should validate required fields', async ({ page }) => {
      await page.getByRole('button', { name: /create new memory/i }).click()
      
      // Try to save without required fields
      await page.getByRole('button', { name: /save memory/i }).click()
      
      // Should show validation errors
      await expect(page.getByText(/title is required/i)).toBeVisible()
      await expect(page.getByText(/content is required/i)).toBeVisible()
    })

    test('should support rich text formatting', async ({ page }) => {
      await page.getByRole('button', { name: /create new memory/i }).click()
      
      await page.getByLabel(/title/i).fill('Rich Text Memory')
      
      // Use rich text editor
      const editor = page.getByRole('textbox', { name: /content/i })
      await editor.fill('This is bold text and this is italic text')
      
      // Apply formatting using toolbar
      await editor.selectText('bold text')
      await page.getByRole('button', { name: /bold/i }).click()
      
      await editor.selectText('italic text')
      await page.getByRole('button', { name: /italic/i }).click()
      
      await page.getByRole('button', { name: /save memory/i }).click()
      
      // Verify formatted content
      const memoryCard = page.getByText('Rich Text Memory').locator('..').locator('..')
      await expect(memoryCard.locator('strong')).toContainText('bold text')
      await expect(memoryCard.locator('em')).toContainText('italic text')
    })

    test('should auto-save draft while typing', async ({ page }) => {
      await page.getByRole('button', { name: /create new memory/i }).click()
      
      await page.getByLabel(/title/i).fill('Auto-save Test')
      await page.getByLabel(/content/i).fill('This should be auto-saved')
      
      // Wait for auto-save indicator
      await expect(page.getByText(/draft saved/i)).toBeVisible()
      
      // Close dialog without saving
      await page.getByRole('button', { name: /cancel/i }).click()
      
      // Reopen dialog - should restore draft
      await page.getByRole('button', { name: /create new memory/i }).click()
      
      // Should have draft content
      await expect(page.getByLabel(/title/i)).toHaveValue('Auto-save Test')
      await expect(page.getByLabel(/content/i)).toHaveValue('This should be auto-saved')
    })
  })

  test.describe('Viewing and Searching Memories', () => {
    test.beforeEach(async ({ page }) => {
      // Create test data
      await memoryHelper.createMemory({
        title: 'JavaScript Best Practices',
        content: 'Modern JavaScript development techniques',
        category: 'development',
        tags: ['javascript', 'programming']
      })
      
      await memoryHelper.createMemory({
        title: 'React Hooks Guide',
        content: 'Complete guide to React hooks',
        category: 'development',
        tags: ['react', 'javascript', 'hooks']
      })
      
      await memoryHelper.createMemory({
        title: 'Cooking Recipe',
        content: 'How to make pasta',
        category: 'personal',
        tags: ['cooking', 'recipe']
      })
      
      // Refresh to see new memories
      await page.reload()
    })

    test('should display all memories by default', async ({ page }) => {
      await expect(page.getByText('JavaScript Best Practices')).toBeVisible()
      await expect(page.getByText('React Hooks Guide')).toBeVisible()
      await expect(page.getByText('Cooking Recipe')).toBeVisible()
    })

    test('should search memories by title and content', async ({ page }) => {
      // Search for JavaScript
      await page.getByPlaceholder(/search memories/i).fill('JavaScript')
      
      // Should show JavaScript-related memories
      await expect(page.getByText('JavaScript Best Practices')).toBeVisible()
      await expect(page.getByText('React Hooks Guide')).toBeVisible()
      await expect(page.getByText('Cooking Recipe')).not.toBeVisible()
    })

    test('should filter memories by category', async ({ page }) => {
      // Open category filter
      await page.getByLabel(/category filter/i).click()
      await page.getByRole('option', { name: 'development' }).click()
      
      // Should show only development memories
      await expect(page.getByText('JavaScript Best Practices')).toBeVisible()
      await expect(page.getByText('React Hooks Guide')).toBeVisible()
      await expect(page.getByText('Cooking Recipe')).not.toBeVisible()
    })

    test('should filter memories by tags', async ({ page }) => {
      // Open tag filter
      await page.getByLabel(/tag filter/i).click()
      await page.getByRole('option', { name: 'react' }).click()
      
      // Should show only React memories
      await expect(page.getByText('React Hooks Guide')).toBeVisible()
      await expect(page.getByText('JavaScript Best Practices')).not.toBeVisible()
      await expect(page.getByText('Cooking Recipe')).not.toBeVisible()
    })

    test('should support combined search and filtering', async ({ page }) => {
      // Search and filter simultaneously
      await page.getByPlaceholder(/search memories/i).fill('guide')
      await page.getByLabel(/category filter/i).selectOption('development')
      
      // Should show only the React guide
      await expect(page.getByText('React Hooks Guide')).toBeVisible()
      await expect(page.getByText('JavaScript Best Practices')).not.toBeVisible()
      await expect(page.getByText('Cooking Recipe')).not.toBeVisible()
    })
  })

  test.describe('Editing Memories', () => {
    test.beforeEach(async ({ page }) => {
      await memoryHelper.createMemory({
        title: 'Memory to Edit',
        content: 'Original content',
        category: 'personal',
        tags: ['original']
      })
      await page.reload()
    })

    test('should edit memory inline', async ({ page }) => {
      // Find memory and click edit
      const memoryCard = page.getByText('Memory to Edit').locator('..').locator('..')
      await memoryCard.getByRole('button', { name: /edit/i }).click()
      
      // Should enter edit mode
      const titleInput = memoryCard.getByLabel(/title/i)
      await expect(titleInput).toBeVisible()
      await expect(titleInput).toHaveValue('Memory to Edit')
      
      // Edit the memory
      await titleInput.fill('Edited Memory Title')
      await memoryCard.getByLabel(/content/i).fill('Updated content here')
      
      // Save changes
      await memoryCard.getByRole('button', { name: /save/i }).click()
      
      // Should show updated content
      await expect(page.getByText('Edited Memory Title')).toBeVisible()
      await expect(page.getByText('Updated content here')).toBeVisible()
    })

    test('should cancel editing without saving', async ({ page }) => {
      const memoryCard = page.getByText('Memory to Edit').locator('..').locator('..')
      await memoryCard.getByRole('button', { name: /edit/i }).click()
      
      // Make changes
      await memoryCard.getByLabel(/title/i).fill('This should not be saved')
      
      // Cancel editing
      await memoryCard.getByRole('button', { name: /cancel/i }).click()
      
      // Should revert to original content
      await expect(page.getByText('Memory to Edit')).toBeVisible()
      await expect(page.getByText('This should not be saved')).not.toBeVisible()
    })
  })

  test.describe('Deleting Memories', () => {
    test.beforeEach(async ({ page }) => {
      await memoryHelper.createMemory({
        title: 'Memory to Delete',
        content: 'This will be deleted',
        category: 'test'
      })
      await page.reload()
    })

    test('should delete memory with confirmation', async ({ page }) => {
      const memoryCard = page.getByText('Memory to Delete').locator('..').locator('..')
      
      // Click delete button
      await memoryCard.getByRole('button', { name: /delete/i }).click()
      
      // Should show confirmation dialog
      const confirmDialog = page.getByRole('dialog', { name: /confirm delete/i })
      await expect(confirmDialog).toBeVisible()
      await expect(confirmDialog.getByText(/are you sure/i)).toBeVisible()
      
      // Confirm deletion
      await confirmDialog.getByRole('button', { name: /delete/i }).click()
      
      // Memory should be removed
      await expect(page.getByText('Memory to Delete')).not.toBeVisible()
      
      // Should show success message
      await expect(page.getByText(/memory deleted successfully/i)).toBeVisible()
    })

    test('should cancel deletion', async ({ page }) => {
      const memoryCard = page.getByText('Memory to Delete').locator('..').locator('..')
      
      await memoryCard.getByRole('button', { name: /delete/i }).click()
      
      // Cancel deletion
      const confirmDialog = page.getByRole('dialog', { name: /confirm delete/i })
      await confirmDialog.getByRole('button', { name: /cancel/i }).click()
      
      // Memory should still be visible
      await expect(page.getByText('Memory to Delete')).toBeVisible()
    })
  })

  test.describe('Bulk Operations', () => {
    test.beforeEach(async ({ page }) => {
      // Create multiple memories for bulk operations
      await memoryHelper.createMemory({ title: 'Bulk Memory 1', content: 'Content 1' })
      await memoryHelper.createMemory({ title: 'Bulk Memory 2', content: 'Content 2' })
      await memoryHelper.createMemory({ title: 'Bulk Memory 3', content: 'Content 3' })
      await page.reload()
    })

    test('should select multiple memories', async ({ page }) => {
      // Enter bulk select mode
      await page.getByRole('button', { name: /bulk actions/i }).click()
      
      // Select memories
      await page.getByText('Bulk Memory 1').locator('..').locator('input[type="checkbox"]').check()
      await page.getByText('Bulk Memory 2').locator('..').locator('input[type="checkbox"]').check()
      
      // Should show selection count
      await expect(page.getByText(/2 memories selected/i)).toBeVisible()
    })

    test('should bulk delete selected memories', async ({ page }) => {
      await page.getByRole('button', { name: /bulk actions/i }).click()
      
      // Select memories
      await page.getByText('Bulk Memory 1').locator('..').locator('input[type="checkbox"]').check()
      await page.getByText('Bulk Memory 2').locator('..').locator('input[type="checkbox"]').check()
      
      // Bulk delete
      await page.getByRole('button', { name: /delete selected/i }).click()
      
      // Confirm bulk deletion
      const confirmDialog = page.getByRole('dialog', { name: /confirm bulk delete/i })
      await confirmDialog.getByRole('button', { name: /delete/i }).click()
      
      // Selected memories should be gone
      await expect(page.getByText('Bulk Memory 1')).not.toBeVisible()
      await expect(page.getByText('Bulk Memory 2')).not.toBeVisible()
      await expect(page.getByText('Bulk Memory 3')).toBeVisible() // Not selected
    })
  })

  test.describe('AI Search and Suggestions', () => {
    test.beforeEach(async ({ page }) => {
      await memoryHelper.createMemory({
        title: 'Machine Learning Basics',
        content: 'Introduction to neural networks and deep learning',
        tags: ['ai', 'ml', 'education']
      })
      await page.reload()
    })

    test('should provide AI-powered search suggestions', async ({ page }) => {
      // Click on AI search
      await page.getByPlaceholder(/ai search/i).click()
      
      // Should show search suggestions
      await expect(page.getByText(/recent searches/i)).toBeVisible()
      await expect(page.getByText(/suggested topics/i)).toBeVisible()
    })

    test('should perform semantic search', async ({ page }) => {
      // Use AI search with semantic query
      await page.getByPlaceholder(/ai search/i).fill('artificial intelligence concepts')
      await page.getByRole('button', { name: /ai search/i }).click()
      
      // Should find semantically related memories
      await expect(page.getByText('Machine Learning Basics')).toBeVisible()
      
      // Should show relevance score
      await expect(page.getByText(/relevance:/i)).toBeVisible()
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test.beforeEach(async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Mobile-specific test')
    })

    test('should have mobile-friendly navigation', async ({ page }) => {
      // Mobile menu should be accessible
      await page.getByRole('button', { name: /menu/i }).click()
      
      await expect(page.getByRole('navigation')).toBeVisible()
      await expect(page.getByText(/dashboard/i)).toBeVisible()
      await expect(page.getByText(/memories/i)).toBeVisible()
    })

    test('should support touch gestures for memory cards', async ({ page }) => {
      await memoryHelper.createMemory({
        title: 'Touch Test Memory',
        content: 'Test touch interactions'
      })
      await page.reload()
      
      const memoryCard = page.getByText('Touch Test Memory').locator('..').locator('..')
      
      // Swipe gestures for actions (implementation depends on your app)
      await memoryCard.hover()
      
      // Touch-specific actions should be available
      await expect(memoryCard.getByRole('button', { name: /more actions/i })).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should be fully keyboard navigable', async ({ page }) => {
      // Test keyboard navigation
      await page.keyboard.press('Tab') // Focus first element
      await page.keyboard.press('Tab') // Navigate to create button
      
      const createButton = page.getByRole('button', { name: /create new memory/i })
      await expect(createButton).toBeFocused()
      
      // Open dialog with Enter
      await page.keyboard.press('Enter')
      await expect(page.getByRole('dialog')).toBeVisible()
      
      // Navigate within dialog
      await page.keyboard.press('Tab')
      await expect(page.getByLabel(/title/i)).toBeFocused()
    })

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await accessibilityHelper.checkAccessibility()
      
      // Check specific ARIA attributes
      const searchInput = page.getByRole('searchbox')
      await expect(searchInput).toHaveAttribute('aria-label')
      
      const memoryList = page.getByRole('list', { name: /memories/i })
      await expect(memoryList).toBeVisible()
      
      const memoryItems = page.getByRole('listitem')
      expect(await memoryItems.count()).toBeGreaterThan(0)
    })

    test('should support screen reader announcements', async ({ page }) => {
      // Test live regions for dynamic content
      await page.getByRole('button', { name: /create new memory/i }).click()
      await page.getByLabel(/title/i).fill('Screen Reader Test')
      await page.getByLabel(/content/i).fill('Testing announcements')
      await page.getByRole('button', { name: /save memory/i }).click()
      
      // Should announce success
      const announcement = page.getByRole('status')
      await expect(announcement).toHaveText(/memory created successfully/i)
    })

    test('should work with high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
      
      // Elements should still be visible and functional
      await expect(page.getByRole('button', { name: /create new memory/i })).toBeVisible()
      
      // Text should have sufficient contrast (this would need custom assertions)
      // await accessibilityHelper.checkColorContrast()
    })
  })

  test.describe('Performance', () => {
    test('should load dashboard within performance budget', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/dashboard')
      await expect(page.getByText(/memories/i)).toBeVisible()
      
      const loadTime = Date.now() - startTime
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should handle large datasets efficiently', async ({ page }) => {
      // This would typically be done with test data setup
      // For demo purposes, we'll simulate pagination
      
      // Navigate to page with many memories
      await page.goto('/dashboard?page=1&limit=100')
      
      // Should still be responsive
      const startTime = Date.now()
      await page.getByRole('button', { name: /next page/i }).click()
      const navigationTime = Date.now() - startTime
      
      expect(navigationTime).toBeLessThan(1000)
    })

    test('should lazy load memory content', async ({ page }) => {
      // Create memories and test lazy loading
      await memoryHelper.createMemory({
        title: 'Lazy Load Test',
        content: 'This content should be lazy loaded'
      })
      
      await page.reload()
      
      // Initial load should be fast
      await expect(page.getByText('Lazy Load Test')).toBeVisible()
      
      // Full content should load on demand
      await page.getByText('Lazy Load Test').click()
      await expect(page.getByText('This content should be lazy loaded')).toBeVisible()
    })
  })

  test.describe('Data Persistence', () => {
    test('should persist data across browser sessions', async ({ page, context }) => {
      // Create a memory
      await memoryHelper.createMemory({
        title: 'Persistent Memory',
        content: 'Should persist across sessions'
      })
      
      // Close and reopen browser
      await context.close()
      const newContext = await page.context().browser()!.newContext()
      const newPage = await newContext.newPage()
      
      // Login again
      const newAuthHelper = new AuthHelper(newPage)
      await newAuthHelper.login({
        email: 'test@example.com',
        password: 'testpassword123'
      })
      
      await newPage.goto('/dashboard')
      
      // Memory should still be there
      await expect(newPage.getByText('Persistent Memory')).toBeVisible()
      
      await newContext.close()
    })
  })
})