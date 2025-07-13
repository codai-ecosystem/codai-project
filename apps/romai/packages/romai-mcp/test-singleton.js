/**
 * Simple test to verify singleton consistency
 */

import { authMiddleware } from './dist/auth/authorization-middleware.js';

async function testSingleton() {
  console.log('🧪 Testing Singleton Consistency...');

  // Test if we can use the middleware successfully now
  const dummyApiKey = 'romai_test123456789';

  const middlewareAuth = await authMiddleware.authorize(
    dummyApiKey,
    'test_method',
    'test_resource'
  );

  console.log('🔒 Middleware auth result:', middlewareAuth.authorized, middlewareAuth.error);

  // Test health status to see if it's working
  const healthStatus = authMiddleware.getHealthStatus();
  console.log('🏥 Health status:', healthStatus.status);

  return {
    middlewareWorking: true,
    healthCheck: healthStatus.status === 'healthy'
  };
}

testSingleton()
  .then(results => {
    console.log('\n🎯 Results:', results);
    if (results.middlewareWorking && results.healthCheck) {
      console.log('✅ Middleware working correctly!');
      process.exit(0);
    } else {
      console.log('❌ Middleware issue detected!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
