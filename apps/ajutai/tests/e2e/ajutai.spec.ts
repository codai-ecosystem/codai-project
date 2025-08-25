/**
 * AjutAI E2E Tests
 * End-to-end testing of user workflows
 */

import { test, expect } from '@playwright/test'

test.describe('AjutAI Customer Support Platform', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to AjutAI application
    await page.goto('http://localhost:4007') // Assuming AjutAI runs on port 4007
    await page.waitForLoadState('networkidle')
  })

  test.describe('Homepage', () => {
    test('displays welcome message and system status', async ({ page }) => {
      // Check homepage content
      await expect(page.locator('h1')).toContainText(/welcome to ajutai/i)
      await expect(page.locator('text=Intelligent Customer Support')).toBeVisible()
      
      // Verify system status section
      await expect(page.locator('text=System Status')).toBeVisible()
      
      // Check quick action buttons
      await expect(page.locator('text=Create Ticket')).toBeVisible()
      await expect(page.locator('text=View Analytics')).toBeVisible()
      await expect(page.locator('text=Search Knowledge')).toBeVisible()
    })

    test('navigates to different sections via quick actions', async ({ page }) => {
      // Navigate to tickets via quick action
      await page.click('text=Create Ticket')
      await expect(page.url()).toContain('/tickets')
      
      // Go back to home
      await page.goto('/')
      
      // Navigate to analytics via quick action
      await page.click('text=View Analytics')
      await expect(page.url()).toContain('/analytics')
    })
  })

  test.describe('Ticket Management', () => {
    test('creates a new support ticket', async ({ page }) => {
      // Navigate to tickets page
      await page.goto('/tickets')
      await expect(page.locator('h1')).toContainText(/support tickets/i)
      
      // Click create new ticket
      await page.click('text=Create New Ticket')
      
      // Fill out ticket form
      await page.fill('input[name="title"]', 'Login Issue - Cannot Access Dashboard')
      await page.fill('textarea[name="description"]', 'User is unable to log into the dashboard after password reset')
      await page.selectOption('select[name="priority"]', 'high')
      
      // Submit ticket
      await page.click('button:has-text("Create Ticket")')
      
      // Verify ticket was created
      await expect(page.locator('text=Login Issue - Cannot Access Dashboard')).toBeVisible()
      await expect(page.locator('text=high')).toBeVisible()
      await expect(page.locator('text=open')).toBeVisible()
    })

    test('filters tickets by status', async ({ page }) => {
      await page.goto('/tickets')
      
      // Apply status filter
      await page.selectOption('select[aria-label="Filter by status"]', 'open')
      
      // Verify URL contains filter parameter
      await expect(page.url()).toContain('status=open')
      
      // Check that only open tickets are displayed
      const ticketCards = page.locator('[data-testid="ticket-card"]')
      const count = await ticketCards.count()
      
      for (let i = 0; i < count; i++) {
        await expect(ticketCards.nth(i).locator('text=open')).toBeVisible()
      }
    })

    test('updates ticket status', async ({ page }) => {
      await page.goto('/tickets')
      
      // Click on first ticket
      const firstTicket = page.locator('[data-testid="ticket-card"]').first()
      await firstTicket.click()
      
      // Update status
      await page.selectOption('select[name="status"]', 'in-progress')
      await page.click('button:has-text("Update Ticket")')
      
      // Verify status change
      await expect(page.locator('text=in-progress')).toBeVisible()
      await expect(page.locator('text=Ticket updated successfully')).toBeVisible()
    })

    test('searches tickets by title', async ({ page }) => {
      await page.goto('/tickets')
      
      // Use search functionality
      await page.fill('input[placeholder*="Search tickets"]', 'Login')
      await page.press('input[placeholder*="Search tickets"]', 'Enter')
      
      // Verify search results
      const searchResults = page.locator('[data-testid="ticket-card"]')
      const count = await searchResults.count()
      
      for (let i = 0; i < count; i++) {
        await expect(searchResults.nth(i)).toContainText(/login/i)
      }
    })
  })

  test.describe('Analytics Dashboard', () => {
    test('displays support metrics and charts', async ({ page }) => {
      await page.goto('/analytics')
      
      // Check page title
      await expect(page.locator('h1')).toContainText(/support analytics/i)
      
      // Verify metric cards are present
      await expect(page.locator('text=Open Tickets')).toBeVisible()
      await expect(page.locator('text=Resolved Tickets')).toBeVisible()
      await expect(page.locator('text=Average Response Time')).toBeVisible()
      await expect(page.locator('text=Customer Satisfaction')).toBeVisible()
      
      // Check for charts/visualizations
      await expect(page.locator('[data-testid="support-chart"]')).toBeVisible()
      await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible()
    })

    test('refreshes analytics data', async ({ page }) => {
      await page.goto('/analytics')
      
      // Get initial metric values
      const openTicketsText = await page.locator('[data-testid="open-tickets-count"]').textContent()
      
      // Click refresh button
      await page.click('button:has-text("Refresh")')
      
      // Verify loading state
      await expect(page.locator('text=Loading...')).toBeVisible()
      
      // Wait for data to load
      await page.waitForSelector('[data-testid="open-tickets-count"]')
      
      // Data should be refreshed (might be the same values, but the API was called)
      await expect(page.locator('[data-testid="open-tickets-count"]')).toBeVisible()
    })

    test('displays activity timeline with recent actions', async ({ page }) => {
      await page.goto('/analytics')
      
      // Check activity timeline section
      await expect(page.locator('text=Activity Timeline')).toBeVisible()
      
      // Verify timeline items
      const timelineItems = page.locator('[data-testid="timeline-item"]')
      const count = await timelineItems.count()
      
      if (count > 0) {
        // Check first timeline item has required elements
        const firstItem = timelineItems.first()
        await expect(firstItem.locator('[data-testid="timeline-timestamp"]')).toBeVisible()
        await expect(firstItem.locator('[data-testid="timeline-description"]')).toBeVisible()
      }
    })
  })

  test.describe('Knowledge Base', () => {
    test('searches knowledge base articles', async ({ page }) => {
      await page.goto('/knowledge')
      
      // Search for articles
      await page.fill('input[placeholder*="Search knowledge base"]', 'password reset')
      await page.click('button:has-text("Search")')
      
      // Verify search results
      await expect(page.locator('text=Search Results')).toBeVisible()
      
      const searchResults = page.locator('[data-testid="knowledge-article"]')
      const count = await searchResults.count()
      
      if (count > 0) {
        // Check first result contains search term
        await expect(searchResults.first()).toContainText(/password/i)
      }
    })

    test('creates new knowledge article', async ({ page }) => {
      await page.goto('/knowledge')
      
      // Click create article
      await page.click('button:has-text("Create Article")')
      
      // Fill article form
      await page.fill('input[name="title"]', 'How to Reset Your Password')
      await page.selectOption('select[name="category"]', 'account')
      await page.fill('textarea[name="content"]', 'Step-by-step instructions for password reset...')
      
      // Submit article
      await page.click('button:has-text("Create Article")')
      
      // Verify article was created
      await expect(page.locator('text=How to Reset Your Password')).toBeVisible()
      await expect(page.locator('text=Article created successfully')).toBeVisible()
    })
  })

  test.describe('System Health Monitoring', () => {
    test('displays system health status', async ({ page }) => {
      await page.goto('/health')
      
      // Check health monitoring page
      await expect(page.locator('h1')).toContainText(/system health/i)
      
      // Verify service status indicators
      await expect(page.locator('text=CBD Database')).toBeVisible()
      await expect(page.locator('text=MemorAI App')).toBeVisible()
      await expect(page.locator('text=RomAI AGI')).toBeVisible()
      
      // Check health status badges
      const healthBadges = page.locator('[data-testid="health-badge"]')
      const count = await healthBadges.count()
      
      for (let i = 0; i < count; i++) {
        const badge = healthBadges.nth(i)
        const status = await badge.textContent()
        expect(['healthy', 'warning', 'error']).toContain(status?.toLowerCase())
      }
    })

    test('runs system health check', async ({ page }) => {
      await page.goto('/health')
      
      // Run health check
      await page.click('button:has-text("Run Health Check")')
      
      // Verify loading state
      await expect(page.locator('text=Running health check...')).toBeVisible()
      
      // Wait for results
      await page.waitForSelector('text=Health check completed')
      await expect(page.locator('text=Health check completed')).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('adapts to mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
      
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]')
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
      
      // Verify navigation items
      await expect(page.locator('text=Tickets')).toBeVisible()
      await expect(page.locator('text=Analytics')).toBeVisible()
      await expect(page.locator('text=Knowledge')).toBeVisible()
    })

    test('adapts to tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/')
      
      // Check tablet layout
      await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible()
      
      // Verify responsive grid layout
      await expect(page.locator('[data-testid="metric-cards"]')).toHaveClass(/grid-cols-2/)
    })
  })

  test.describe('Performance', () => {
    test('loads homepage within performance budget', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('handles large ticket lists efficiently', async ({ page }) => {
      await page.goto('/tickets')
      
      // Check if pagination or virtual scrolling is working
      const ticketCards = page.locator('[data-testid="ticket-card"]')
      const count = await ticketCards.count()
      
      // Should not render more than a reasonable number at once
      expect(count).toBeLessThanOrEqual(50)
      
      // If there are more tickets, pagination should be present
      if (count === 50) {
        await expect(page.locator('[data-testid="pagination"]')).toBeVisible()
      }
    })
  })

  test.describe('Error Handling', () => {
    test('handles API errors gracefully', async ({ page }) => {
      // Mock API failure by blocking network requests
      await page.route('**/api/**', route => route.abort())
      
      await page.goto('/')
      
      // Should show error message instead of crashing
      await expect(page.locator('text=Unable to load')).toBeVisible()
      
      // Error should be user-friendly
      await expect(page.locator('text=Please try again later')).toBeVisible()
    })

    test('displays 404 page for invalid routes', async ({ page }) => {
      await page.goto('/non-existent-page')
      
      // Should show 404 page
      await expect(page.locator('text=Page Not Found')).toBeVisible()
      await expect(page.locator('text=Go Home')).toBeVisible()
    })
  })
})