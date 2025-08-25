/**
 * AjutAI Global E2E Test Setup
 * Prepares the test environment before running Playwright tests
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting AjutAI E2E Test Global Setup...')
  
  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Wait for application to be ready
    console.log('⏳ Waiting for AjutAI application to be ready...')
    await page.goto('http://localhost:4007', { timeout: 60000 })
    
    // Wait for key elements to ensure app is fully loaded
    await page.waitForSelector('h1', { timeout: 30000 })
    
    // Check if API endpoints are responding
    const healthResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/health')
        return response.ok
      } catch {
        return false
      }
    })
    
    if (healthResponse) {
      console.log('✅ AjutAI application is ready for testing')
    } else {
      console.log('⚠️ AjutAI API endpoints may not be fully ready')
    }
    
    // Set up test data if needed
    console.log('📋 Setting up test data...')
    
    // Create test tickets for e2e testing
    await page.evaluate(async () => {
      try {
        await fetch('/api/test-setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_test_data',
            data: {
              tickets: [
                {
                  title: 'E2E Test Ticket - Login Issue',
                  description: 'Test ticket for e2e automation',
                  priority: 'high',
                  status: 'open'
                },
                {
                  title: 'E2E Test Ticket - Feature Request',
                  description: 'Test feature request ticket',
                  priority: 'low',
                  status: 'closed'
                }
              ]
            }
          })
        })
      } catch (error) {
        console.log('Note: Test data setup endpoint not available:', error.message)
      }
    })
    
    console.log('✅ Global setup completed successfully')
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup