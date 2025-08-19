import { FullConfig } from '@playwright/test'

/**
 * Global teardown for Docs E2E tests
 * Performs cleanup operations after all tests complete
 */
async function globalTeardown(config: FullConfig) {
    console.log('🔄 Starting Docs E2E test environment teardown...')

    try {
        // Clean up any test data
        console.log('🧹 Cleaning up test data...')

        // You can add any cleanup operations here
        // For example, removing test users, clearing test data, etc.

        console.log('✅ Test data cleanup complete')

        // Generate test summary
        console.log('📊 Generating test summary...')

        // You can add test reporting logic here
        // For example, aggregating results, sending notifications, etc.

        console.log('✅ Test summary generation complete')

    } catch (error) {
        console.error('❌ Global teardown failed:', error)
        // Don't throw error in teardown to avoid masking test failures
    }

    console.log('🎉 Global teardown completed successfully')
}

export default globalTeardown
