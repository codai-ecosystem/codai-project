import { chromium, FullConfig } from '@playwright/test'

/**
 * Global setup for Playwright tests
 * Sets up test environment before all tests run
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Global Playwright Setup Starting...')

  // Create a browser instance for setup
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Wait for development server to be ready
    const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000'
    console.log(`⏳ Waiting for server at ${baseURL}...`)

    // Try to connect to the server with retries
    let serverReady = false
    let attempts = 0
    const maxAttempts = 30 // 30 seconds max wait
    
    while (!serverReady && attempts < maxAttempts) {
      try {
        await page.goto(baseURL, { timeout: 2000 })
        serverReady = true
        console.log('✅ Development server is ready!')
      } catch (error) {
        attempts++
        await page.waitForTimeout(1000)
        if (attempts % 5 === 0) {
          console.log(`⏳ Still waiting for server... (${attempts}/${maxAttempts})`)
        }
      }
    }

    if (!serverReady) {
      throw new Error(`❌ Development server not ready after ${maxAttempts} seconds`)
    }

    // Optional: Set up test data or authentication state here
    // For example, create test users, seed database, etc.
    
    // Create storage state for authenticated user (optional)
    // This can speed up tests that need authentication
    /*
    await page.goto('/auth/login')
    await page.fill('[data-testid="email-input"]', 'test@memorai.local')
    await page.fill('[data-testid="password-input"]', 'TestPass123!')
    await page.click('[data-testid="login-button"]')
    
    // Wait for successful login
    await page.waitForURL('/memories')
    
    // Save authentication state
    await context.storageState({ path: 'tests/e2e/auth-state.json' })
    */

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }

  console.log('✅ Global Playwright Setup Complete!')
}

export default globalSetup