// Global test teardown for ROMAI AGI testing environment
async function globalTeardown() {
  console.log('🛑 Tearing down ROMAI AGI test environment...')
  
  // Stop ROMAI server
  if (global.__ROMAI_SERVER__) {
    try {
      console.log('🔌 Stopping ROMAI AGI server...')
      global.__ROMAI_SERVER__.kill('SIGTERM')
      
      // Wait for graceful shutdown
      await new Promise((resolve) => {
        global.__ROMAI_SERVER__.on('close', resolve)
        setTimeout(resolve, 5000) // Force close after 5 seconds
      })
      
      console.log('✅ ROMAI AGI server stopped')
    } catch (error) {
      console.error('⚠️ Error stopping ROMAI server:', error)
    }
  }
  
  // Cleanup test data
  try {
    console.log('🧹 Cleaning up test data...')
    
    // Clear global test data
    delete global.ROMANIAN_CULTURAL_DATA
    delete global.AGI_MATHEMATICAL_TESTS
    delete global.AGI_LOGICAL_TESTS
    delete global.AGI_CULTURAL_TESTS
    delete global.AGI_PERFORMANCE_BENCHMARKS
    
    // Clear any temporary files created during testing
    // Note: Add cleanup of temporary Romanian cultural data files if needed
    
    console.log('✅ Test data cleanup complete')
  } catch (error) {
    console.error('⚠️ Warning: Error during test data cleanup:', error)
  }
  
  // Final cleanup
  console.log('✨ ROMAI test environment teardown complete!')
}

module.exports = globalTeardown