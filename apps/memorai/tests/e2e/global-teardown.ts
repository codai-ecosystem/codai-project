import { FullConfig } from '@playwright/test'

/**
 * Global teardown for Playwright tests
 * Cleans up after all tests complete
 */
async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Global Playwright Teardown Starting...')

  try {
    // Clean up test data if needed
    // For example: delete test users, clean database, etc.
    
    // Remove any temporary files created during tests
    const fs = await import('fs/promises')
    const path = await import('path')

    // Clean up auth state files
    try {
      await fs.unlink(path.join(__dirname, 'auth-state.json'))
    } catch (error) {
      // File doesn't exist, ignore
    }

    // Clean up any screenshots or videos from failed tests (optional)
    // This is usually handled by Playwright automatically

    console.log('✅ Test environment cleaned up successfully')

  } catch (error) {
    console.error('⚠️ Warning: Teardown encountered issues:', error)
    // Don't throw error here as it would mark the entire test suite as failed
  }

  console.log('✅ Global Playwright Teardown Complete!')
}

export default globalTeardown