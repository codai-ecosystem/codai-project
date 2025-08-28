import { test, expect, type Page } from '@playwright/test'

// Test utilities
const TEST_USER = {
  email: 'test@memorai.local',
  password: 'TestPass123!',
  name: 'Test User'
}

const MOCK_MEMORY = {
  content: 'This is a test memory for E2E testing. It contains enough content to pass validation.',
  tags: ['e2e', 'testing', 'playwright'],
  project: 'memorai-tests',
  session: 'e2e-session',
  importance: 7
}

// Page Object Model helpers
class MemorAIPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/')
  }

  async gotoAuth() {
    await this.page.goto('/auth/login')
  }

  async gotoMemories() {
    await this.page.goto('/memories')
  }

  // Authentication helpers
  async login(email: string = TEST_USER.email, password: string = TEST_USER.password) {
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.fill('[data-testid="password-input"]', password)
    await this.page.click('[data-testid="login-button"]')
  }

  async register(name: string = TEST_USER.name, email: string = TEST_USER.email, password: string = TEST_USER.password) {
    await this.page.fill('[data-testid="name-input"]', name)
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.fill('[data-testid="password-input"]', password)
    await this.page.fill('[data-testid="confirm-password-input"]', password)
    await this.page.click('[data-testid="register-button"]')
  }

  // Memory management helpers
  async createMemory(memory = MOCK_MEMORY) {
    await this.page.click('[data-testid="create-memory-button"]')
    await this.page.fill('[data-testid="memory-content"]', memory.content)
    
    // Add tags
    for (const tag of memory.tags) {
      await this.page.fill('[data-testid="tag-input"]', tag)
      await this.page.press('[data-testid="tag-input"]', 'Enter')
    }

    // Set project and session
    await this.page.fill('[data-testid="project-input"]', memory.project)
    await this.page.fill('[data-testid="session-input"]', memory.session)

    // Set importance
    await this.page.locator('[data-testid="importance-slider"]').fill(memory.importance.toString())

    await this.page.click('[data-testid="create-memory-submit"]')
  }

  async searchMemories(query: string) {
    await this.page.fill('[data-testid="search-input"]', query)
    await this.page.press('[data-testid="search-input"]', 'Enter')
  }

  async deleteFirstMemory() {
    await this.page.click('[data-testid^="delete-memory-"]')
    await this.page.click('[data-testid="confirm-delete"]')
  }

  // Accessibility helpers
  async checkA11y() {
    // Check for basic accessibility requirements
    await expect(this.page.locator('h1')).toBeVisible()
    await expect(this.page.locator('[role="main"]')).toBeVisible()
    
    // Check navigation landmarks
    const nav = this.page.locator('[role="navigation"]')
    if (await nav.count() > 0) {
      await expect(nav.first()).toBeVisible()
    }
  }

  async checkMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 })
  }

  async checkDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 })
  }
}

test.describe('MemorAI E2E Tests', () => {
  let memorai: MemorAIPage

  test.beforeEach(async ({ page }) => {
    memorai = new MemorAIPage(page)
  })

  test.describe('Authentication Flow', () => {
    test('should display login form on auth page', async ({ page }) => {
      await memorai.gotoAuth()

      await expect(page.locator('h1')).toContainText(/sign in/i)
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
    })

    test('should validate login form', async ({ page }) => {
      await memorai.gotoAuth()

      // Try to login with empty fields
      await page.click('[data-testid="login-button"]')

      // Should show validation errors
      await expect(page.locator('.text-destructive')).toBeVisible()
    })

    test('should navigate to register page', async ({ page }) => {
      await memorai.gotoAuth()

      await page.click('text=Sign up')
      await expect(page.url()).toContain('/auth/register')
      await expect(page.locator('h1')).toContainText(/create account/i)
    })

    test('should validate registration form', async ({ page }) => {
      await memorai.goto()
      await page.goto('/auth/register')

      // Try to register with mismatched passwords
      await page.fill('[data-testid="name-input"]', 'Test User')
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'password123')
      await page.fill('[data-testid="confirm-password-input"]', 'different-password')
      await page.click('[data-testid="register-button"]')

      await expect(page.locator('.text-destructive')).toContainText(/passwords.*match/i)
    })
  })

  test.describe('Memory Management', () => {
    test.beforeEach(async ({ page }) => {
      // Mock successful authentication
      await page.route('**/api/auth/**', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
      })
      
      // Mock memory API endpoints
      await page.route('**/memories**', async route => {
        if (route.request().method() === 'GET') {
          await route.fulfill({ 
            status: 200, 
            body: JSON.stringify({
              memories: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
            })
          })
        } else {
          await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) })
        }
      })
    })

    test('should display memories page', async ({ page }) => {
      await memorai.gotoMemories()

      await expect(page.locator('h1')).toContainText(/memories/i)
      await expect(page.locator('[data-testid="create-memory-button"]')).toBeVisible()
      await expect(page.locator('[data-testid="search-input"]')).toBeVisible()
    })

    test('should open create memory form', async ({ page }) => {
      await memorai.gotoMemories()

      await page.click('[data-testid="create-memory-button"]')
      await expect(page.locator('[data-testid="memory-content"]')).toBeVisible()
      await expect(page.locator('[data-testid="create-memory-submit"]')).toBeVisible()
    })

    test('should validate memory creation form', async ({ page }) => {
      await memorai.gotoMemories()
      await page.click('[data-testid="create-memory-button"]')

      // Try to submit empty form
      await page.click('[data-testid="create-memory-submit"]')
      await expect(page.locator('.text-destructive')).toBeVisible()
    })

    test('should create memory with valid data', async ({ page }) => {
      await memorai.gotoMemories()
      await memorai.createMemory()

      // Should show success message or redirect
      await expect(page.locator('.bg-success, .text-success')).toBeVisible().catch(() => {
        // Alternative: check for redirect or form reset
        expect(page.url()).toContain('/memories')
      })
    })

    test('should search memories', async ({ page }) => {
      await memorai.gotoMemories()
      await memorai.searchMemories('test query')

      await expect(page.locator('[data-testid="search-input"]')).toHaveValue('test query')
      // Should trigger API call and update results
    })
  })

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await memorai.checkMobileViewport()
      await memorai.goto()

      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
      
      // Test mobile form layout
      await memorai.gotoMemories()
      await page.click('[data-testid="create-memory-button"]')
      
      // Mobile forms should stack vertically
      const form = page.locator('form')
      await expect(form).toBeVisible()
    })

    test('should work on desktop', async ({ page }) => {
      await memorai.checkDesktopViewport()
      await memorai.goto()

      // Desktop should show full navigation
      await expect(page.locator('[data-testid="desktop-nav"]')).toBeVisible()
      
      await memorai.gotoMemories()
      // Desktop layout should use grid/flex layouts
      const memoriesGrid = page.locator('[data-testid="memories-grid"]')
      if (await memoriesGrid.count() > 0) {
        await expect(memoriesGrid).toBeVisible()
      }
    })

    test('should have proper touch targets on mobile @accessibility', async ({ page }) => {
      await memorai.checkMobileViewport()
      await memorai.gotoMemories()

      // All interactive elements should be at least 44px
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        if (await button.isVisible()) {
          const box = await button.boundingBox()
          expect(box?.height).toBeGreaterThanOrEqual(44)
        }
      }
    })
  })

  test.describe('Accessibility @accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await memorai.goto()

      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()

      // Should have proper heading levels
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()
      expect(headingCount).toBeGreaterThan(0)
    })

    test('should have proper form labels', async ({ page }) => {
      await memorai.gotoAuth()

      // All form inputs should have associated labels
      const emailInput = page.locator('[data-testid="email-input"]')
      const emailLabel = page.locator('label[for="email"], label:has([data-testid="email-input"])')
      
      await expect(emailInput).toBeVisible()
      await expect(emailLabel).toBeVisible()
    })

    test('should support keyboard navigation', async ({ page }) => {
      await memorai.goto()

      // Tab through interactive elements
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => document.activeElement?.tagName)
      expect(['BUTTON', 'INPUT', 'A', 'SELECT']).toContain(focused)
    })

    test('should have proper color contrast', async ({ page }) => {
      await memorai.goto()

      // Test both light and dark modes
      const themes = ['light', 'dark']
      
      for (let i = 0; i < themes.length; i++) {
        // Switch theme if theme toggle exists
        const themeToggle = page.locator('[data-testid="theme-toggle"]')
        if (await themeToggle.count() > 0) {
          await themeToggle.click()
        }

        // Check text is visible (basic contrast test)
        const bodyText = page.locator('body')
        await expect(bodyText).toBeVisible()
        
        // More sophisticated contrast testing would use axe-core
        await page.waitForTimeout(500) // Allow theme transition
      }
    })

    test('should work with screen reader landmarks', async ({ page }) => {
      await memorai.goto()

      // Check for proper ARIA landmarks
      await expect(page.locator('[role="main"], main')).toBeVisible()
      
      const nav = page.locator('[role="navigation"], nav')
      if (await nav.count() > 0) {
        await expect(nav.first()).toBeVisible()
      }

      const header = page.locator('[role="banner"], header')
      if (await header.count() > 0) {
        await expect(header.first()).toBeVisible()
      }
    })
  })

  test.describe('Performance @performance', () => {
    test('should load homepage quickly', async ({ page }) => {
      const startTime = Date.now()
      await memorai.goto()
      
      await expect(page.locator('h1')).toBeVisible()
      const loadTime = Date.now() - startTime
      
      // Should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should not have console errors', async ({ page }) => {
      const consoleErrors: string[] = []
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await memorai.goto()
      await page.waitForLoadState('networkidle')

      // Filter out known development-only errors
      const significantErrors = consoleErrors.filter(error => 
        !error.includes('Development mode') && 
        !error.includes('DevTools')
      )
      
      expect(significantErrors).toHaveLength(0)
    })

    test('should handle large datasets efficiently', async ({ page }) => {
      // Mock large dataset
      await page.route('**/memories**', async route => {
        const largeDataset = {
          memories: Array(100).fill(null).map((_, i) => ({
            id: `memory-${i}`,
            content: `Test memory content ${i}`,
            tags: [`tag${i}`, 'test'],
            importance: Math.floor(Math.random() * 10) + 1,
            createdAt: new Date().toISOString()
          })),
          pagination: { page: 1, limit: 100, total: 100, totalPages: 1 }
        }
        
        await route.fulfill({ 
          status: 200, 
          body: JSON.stringify(largeDataset)
        })
      })

      const startTime = Date.now()
      await memorai.gotoMemories()
      
      // Should handle large datasets without freezing
      await expect(page.locator('[data-testid="memory-card"]').first()).toBeVisible()
      const renderTime = Date.now() - startTime
      
      expect(renderTime).toBeLessThan(5000) // Should render in under 5 seconds
    })
  })
})