/**
 * AjutAI Global E2E Test Teardown
 * Cleans up test environment after running Playwright tests
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting AjutAI E2E Test Global Teardown...')
  
  // Launch browser for cleanup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Navigate to application
    await page.goto('http://localhost:4007')
    
    // Clean up test data
    console.log('🗑️ Cleaning up test data...')
    
    await page.evaluate(async () => {
      try {
        await fetch('/api/test-setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'cleanup_test_data'
          })
        })
      } catch (error) {
        console.log('Note: Test cleanup endpoint not available:', error.message)
      }
    })
    
    // Clear browser storage
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    
    console.log('✅ Global teardown completed successfully')
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error to avoid failing the entire test suite
  } finally {
    await browser.close()
  }
}

export default globalTeardown