/**
 * Test REST API Server functionality
 */

import { MemoraiService } from '../src/services/MemoraiService'
import { MemoraiAPIServer } from '../src/api/server'

async function testAPIServer() {
  console.log('🧪 Testing MEMORAI API Server...')

  try {
    // Create minimal config
    const config = {
      database: {
        url: 'file:./test.db',
        type: 'sqlite' as const
      }
    }

    // Initialize services
    console.log('📦 Initializing services...')
    const memoraiService = await MemoraiService.create(config)
    
    // Create API server
    console.log('🌐 Creating API server...')
    const apiServer = new MemoraiAPIServer(memoraiService, memoraiService.configuration)
    
    // Start server
    console.log('🚀 Starting API server...')
    await apiServer.start(3002, 'localhost')
    
    console.log('✅ API Server started successfully!')
    
    // Test health endpoint
    console.log('🏥 Testing health endpoint...')
    const response = await fetch('http://localhost:3002/health')
    const health = await response.json()
    
    console.log('Health check result:', health)
    
    if (health.status === 'healthy') {
      console.log('✅ Health check passed!')
    } else {
      console.log('❌ Health check failed!')
    }
    
    // Stop server
    console.log('🛑 Stopping server...')
    await apiServer.stop()
    
    console.log('🎉 Test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testAPIServer()
}
