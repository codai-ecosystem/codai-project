async function globalTeardown() {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Perform any cleanup tasks
    console.log('✅ Cleaning up test environment...');
    
    // You can add cleanup tasks here
    // Example: cleanup test data, close connections, etc.
    
    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw here to avoid masking test failures
  }
}

export default globalTeardown;
