import { chromium, FullConfig } from '@playwright/test'

/**
 * Global setup for Docs E2E tests
 * Performs environment validation and initial setup
 */
async function globalSetup(config: FullConfig) {
    console.log('🔄 Starting Docs E2E test environment setup...')

    const browser = await chromium.launch()
    const page = await browser.newPage()

    try {
        // Check if the application is running
        console.log('🌐 Checking if Docs application is accessible...')

        const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000'

        // Wait for the application to be ready
        await page.goto(baseURL, {
            waitUntil: 'networkidle',
            timeout: 30000
        })

        // Verify basic page structure
        await page.waitForSelector('body', { timeout: 10000 })

        console.log('✅ Docs application is accessible and ready for testing')

        // Pre-populate any test data if needed
        console.log('📊 Setting up test data...')

        // You can add any global test data setup here
        // For example, creating test users, seeding data, etc.

        console.log('✅ Test data setup complete')

    } catch (error) {
        console.error('❌ Global setup failed:', error)
        throw error
    } finally {
        await browser.close()
    }

    console.log('🎉 Global setup completed successfully')
}

export default globalSetup
