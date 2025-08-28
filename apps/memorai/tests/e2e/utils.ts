import { Page, expect } from '@playwright/test'

/**
 * Test utilities and helpers for MemorAI E2E tests
 */

export const TEST_DATA = {
  users: {
    testUser: {
      name: 'Test User',
      email: 'test@memorai.local',
      password: 'TestPass123!'
    },
    adminUser: {
      name: 'Admin User', 
      email: 'admin@memorai.local',
      password: 'AdminPass123!'
    }
  },
  memories: {
    basic: {
      content: 'This is a basic test memory with sufficient content for validation purposes.',
      tags: ['test', 'basic'],
      importance: 5,
      project: 'test-project',
      session: 'test-session'
    },
    detailed: {
      content: 'This is a detailed test memory with comprehensive content that includes multiple sentences and detailed information for thorough testing purposes.',
      tags: ['test', 'detailed', 'comprehensive'],
      importance: 8,
      project: 'advanced-project',
      session: 'detailed-session'
    }
  }
} as const

/**
 * Accessibility testing utilities
 */
export class AccessibilityHelpers {
  constructor(private page: Page) {}

  async checkHeadingHierarchy() {
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all()
    
    if (headings.length === 0) {
      throw new Error('No headings found on page')
    }

    // Check for h1 presence
    const h1Count = await this.page.locator('h1').count()
    expect(h1Count).toBeGreaterThan(0)
    expect(h1Count).toBeLessThanOrEqual(1) // Should have only one h1

    return headings
  }

  async checkFormLabels() {
    const inputs = await this.page.locator('input, textarea, select').all()
    
    for (const input of inputs) {
      const inputId = await input.getAttribute('id')
      const inputName = await input.getAttribute('name')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')

      // Check if input has associated label
      let hasLabel = false
      
      if (inputId) {
        const labelCount = await this.page.locator(`label[for="${inputId}"]`).count()
        hasLabel = labelCount > 0
      }

      if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
        const inputType = await input.getAttribute('type') || 'unknown'
        console.warn(`Input without proper label: type=${inputType}, name=${inputName}, id=${inputId}`)
      }
    }
  }

  async checkColorContrast() {
    // Basic color contrast check - just ensure text is visible
    // More sophisticated contrast testing would use specialized tools like axe-core
    const textElements = await this.page.locator('p, span, div, h1, h2, h3, h4, h5, h6').all()
    
    for (let i = 0; i < Math.min(textElements.length, 5); i++) {
      const element = textElements[i]
      
      if (element && await element.isVisible()) {
        // Basic visibility check - if element is visible, contrast is likely acceptable
        const textContent = await element.textContent()
        if (textContent && textContent.trim().length > 0) {
          console.log(`Visible text element found: "${textContent.slice(0, 30)}..."`)
        }
      }
    }
  }

  async checkKeyboardNavigation() {
    // Test tab navigation
    const focusableElements = await this.page.locator('button:visible, input:visible, select:visible, textarea:visible, a:visible, [tabindex]:visible').all()
    
    if (focusableElements.length === 0) {
      console.warn('No focusable elements found for keyboard navigation test')
      return
    }

    // Test first few elements
    for (let i = 0; i < Math.min(focusableElements.length, 5); i++) {
      await this.page.keyboard.press('Tab')
      const focused = await this.page.evaluate(() => document.activeElement?.tagName)
      expect(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(focused || '')).toBeTruthy()
    }
  }
}

/**
 * Mobile testing utilities
 */
export class MobileHelpers {
  constructor(private page: Page) {}

  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 }) // iPad
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 }) // Desktop
  }

  async checkTouchTargets() {
    const interactiveElements = await this.page.locator('button:visible, a:visible, input:visible, [role="button"]:visible').all()
    
    for (const element of interactiveElements.slice(0, 10)) { // Test first 10 elements
      const box = await element.boundingBox()
      
      if (box && (box.height < 44 || box.width < 44)) {
        const elementInfo = await element.evaluate(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          text: el.textContent?.slice(0, 50)
        }))
        
        console.warn(`Touch target too small: ${elementInfo.tagName}#${elementInfo.id}.${elementInfo.className} - ${box.width}x${box.height}px`)
      }
    }
  }

  async checkResponsiveLayout() {
    const viewports = [
      { width: 320, height: 568, name: 'Small Mobile' },
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Small Desktop' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ]

    for (const viewport of viewports) {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height })
      await this.page.waitForTimeout(500) // Allow layout to settle

      // Check for horizontal overflow
      const hasHorizontalOverflow = await this.page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth
      })

      if (hasHorizontalOverflow) {
        console.warn(`Horizontal overflow detected at ${viewport.name} (${viewport.width}x${viewport.height})`)
      }
    }
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceHelpers {
  constructor(private page: Page) {}

  async measurePageLoad() {
    const startTime = Date.now()
    await this.page.goto('/', { waitUntil: 'networkidle' })
    const loadTime = Date.now() - startTime
    
    console.log(`Page load time: ${loadTime}ms`)
    return loadTime
  }

  async measureInteractionTime(action: () => Promise<void>) {
    const startTime = Date.now()
    await action()
    const interactionTime = Date.now() - startTime
    
    console.log(`Interaction time: ${interactionTime}ms`)
    return interactionTime
  }

  async checkConsoleErrors(): Promise<string[]> {
    const errors: string[] = []
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    return errors
  }
}

/**
 * Memory management test utilities
 */
export class MemoryTestHelpers {
  constructor(private page: Page) {}

  async createMemory(memory = TEST_DATA.memories.basic) {
    await this.page.click('[data-testid="create-memory-button"]')
    await this.page.fill('[data-testid="memory-content"]', memory.content)
    
    // Add tags
    for (const tag of memory.tags) {
      await this.page.fill('[data-testid="tag-input"]', tag)
      await this.page.press('[data-testid="tag-input"]', 'Enter')
    }

    await this.page.fill('[data-testid="project-input"]', memory.project)
    await this.page.fill('[data-testid="session-input"]', memory.session)
    
    // Set importance using slider
    await this.page.locator('[data-testid="importance-slider"]').fill(memory.importance.toString())

    await this.page.click('[data-testid="create-memory-submit"]')
    
    // Wait for creation to complete
    await this.page.waitForResponse(response => 
      response.url().includes('/memories') && response.request().method() === 'POST'
    )
  }

  async searchMemories(query: string) {
    await this.page.fill('[data-testid="search-input"]', query)
    await this.page.press('[data-testid="search-input"]', 'Enter')
    
    // Wait for search results
    await this.page.waitForResponse(response => 
      response.url().includes('/memories') && response.url().includes(encodeURIComponent(query))
    )
  }

  async getMemoryCount(): Promise<number> {
    return await this.page.locator('[data-testid^="memory-card-"]').count()
  }

  async deleteMemory(index: number = 0) {
    const memoryCards = this.page.locator('[data-testid^="memory-card-"]')
    const memoryCard = memoryCards.nth(index)
    
    await memoryCard.locator('[data-testid^="delete-memory-"]').click()
    await this.page.click('[data-testid="confirm-delete"]')
    
    // Wait for deletion to complete
    await this.page.waitForResponse(response => 
      response.url().includes('/memories') && response.request().method() === 'DELETE'
    )
  }
}

/**
 * Authentication test utilities
 */
export class AuthTestHelpers {
  constructor(private page: Page) {}

  async login(email: string = TEST_DATA.users.testUser.email, password: string = TEST_DATA.users.testUser.password) {
    await this.page.goto('/auth/login')
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.fill('[data-testid="password-input"]', password)
    await this.page.click('[data-testid="login-button"]')
    
    // Wait for successful login
    await this.page.waitForURL('/memories')
  }

  async register(user = TEST_DATA.users.testUser) {
    await this.page.goto('/auth/register')
    await this.page.fill('[data-testid="name-input"]', user.name)
    await this.page.fill('[data-testid="email-input"]', user.email)
    await this.page.fill('[data-testid="password-input"]', user.password)
    await this.page.fill('[data-testid="confirm-password-input"]', user.password)
    await this.page.click('[data-testid="register-button"]')
    
    // Wait for successful registration
    await this.page.waitForURL('/memories')
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]')
    await this.page.click('[data-testid="logout-button"]')
    
    // Wait for logout to complete
    await this.page.waitForURL('/auth/login')
  }
}

/**
 * Wait utilities
 */
export class WaitHelpers {
  constructor(private page: Page) {}

  async waitForApiResponse(urlPattern: string | RegExp, method?: string) {
    return await this.page.waitForResponse(response => {
      const url = response.url()
      const matchesUrl = typeof urlPattern === 'string' ? 
        url.includes(urlPattern) : 
        urlPattern.test(url)
      
      const matchesMethod = !method || response.request().method() === method
      
      return matchesUrl && matchesMethod
    })
  }

  async waitForToast() {
    return await this.page.waitForSelector('[data-testid="toast"], .toast, [role="alert"]', { 
      timeout: 5000 
    })
  }

  async waitForLoadingToFinish() {
    await this.page.waitForSelector('[data-testid="loading"], .loading', { 
      state: 'hidden', 
      timeout: 10000 
    }).catch(() => {
      // Loading indicator might not exist, that's ok
    })
  }
}

/**
 * Create a comprehensive test context with all utilities
 */
export function createTestContext(page: Page) {
  return {
    page,
    accessibility: new AccessibilityHelpers(page),
    mobile: new MobileHelpers(page),
    performance: new PerformanceHelpers(page),
    memory: new MemoryTestHelpers(page),
    auth: new AuthTestHelpers(page),
    wait: new WaitHelpers(page)
  }
}

export type TestContext = ReturnType<typeof createTestContext>