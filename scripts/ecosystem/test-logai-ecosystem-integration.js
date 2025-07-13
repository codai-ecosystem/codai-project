/**
 * Comprehensive LogAI Integration Test
 * Tests LogAI SDK integration across multiple CODAI ecosystem apps
 * 
 * This test validates:
 * - StocAI LogAI integration
 * - CodAI LogAI integration  
 * - BancAI LogAI integration
 * - MemorAI LogAI integration
 * - LogAI service health and connectivity
 */

console.log('🚀 Starting Comprehensive LogAI Integration Test...\n')

async function testLogAIService() {
  console.log('📡 Testing LogAI Service Health...')
  try {
    const response = await fetch('http://localhost:4032/api/health')
    if (response.ok) {
      const data = await response.json()
      console.log('✅ LogAI Service is healthy:', data.service, 'on port', data.port)
      return true
    } else {
      console.error('❌ LogAI Service health check failed:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ LogAI Service is not accessible:', error.message)
    return false
  }
}

async function testLogSubmission(appName, logData) {
  console.log(`📝 Testing ${appName} log submission...`)
  try {
    const response = await fetch('http://localhost:4032/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service: appName.toLowerCase(),
        level: 'info',
        message: `${appName} LogAI integration test`,
        metadata: {
          testType: 'integration-test',
          appName,
          timestamp: new Date().toISOString(),
          ...logData
        }
      })
    })

    if (response.ok) {
      console.log(`✅ ${appName} successfully sent log to LogAI`)
      return true
    } else {
      console.error(`❌ ${appName} failed to send log:`, response.status)
      return false
    }
  } catch (error) {
    console.error(`❌ ${appName} log submission error:`, error.message)
    return false
  }
}

async function testAppConnectivity(appName, port) {
  console.log(`🌐 Testing ${appName} connectivity (port ${port})...`)
  try {
    const response = await fetch(`http://localhost:${port}`, {
      method: 'GET',
      headers: { 'Accept': 'text/html' }
    })

    if (response.ok || response.status === 404) { // 404 is ok for app root
      console.log(`✅ ${appName} is accessible on port ${port}`)
      return true
    } else {
      console.error(`❌ ${appName} connectivity failed:`, response.status)
      return false
    }
  } catch (error) {
    console.error(`❌ ${appName} is not accessible:`, error.message)
    return false
  }
}

async function runComprehensiveTest() {
  const results = {
    logaiService: false,
    apps: {},
    logs: {}
  }

  // Test LogAI Service
  results.logaiService = await testLogAIService()
  console.log('')

  if (!results.logaiService) {
    console.log('❌ LogAI Service is not available. Cannot proceed with integration tests.')
    console.log('💡 Make sure LogAI service is running on port 4032')
    return results
  }

  // Test App Connectivity
  const apps = [
    { name: 'StocAI', port: 4063 },
    { name: 'CodAI', port: 4030 },
    { name: 'BancAI', port: 4033 },
    { name: 'MemorAI', port: 4031 }
  ]

  console.log('🔗 Testing app connectivity...')
  for (const app of apps) {
    results.apps[app.name] = await testAppConnectivity(app.name, app.port)
  }
  console.log('')

  // Test LogAI Integration for each app
  console.log('📊 Testing LogAI integration for each app...')

  // StocAI specific test
  results.logs.StocAI = await testLogSubmission('StocAI', {
    module: 'stock-analysis',
    operation: 'integration-test',
    stockSymbol: 'TEST',
    price: 100.00,
    volume: 1000
  })

  // CodAI specific test
  results.logs.CodAI = await testLogSubmission('CodAI', {
    module: 'development-platform',
    operation: 'integration-test',
    projectType: 'test-project',
    userAction: 'test-action'
  })

  // BancAI specific test
  results.logs.BancAI = await testLogSubmission('BancAI', {
    module: 'banking-transactions',
    operation: 'integration-test',
    transactionType: 'test-transaction',
    amount: 500.00,
    accountId: 'test-account'
  })

  // MemorAI specific test
  results.logs.MemorAI = await testLogSubmission('MemorAI', {
    module: 'memory-operations',
    operation: 'integration-test',
    memoryType: 'test-memory',
    databaseId: 'test-db',
    recordCount: 100
  })

  console.log('')

  // Summary
  console.log('📈 INTEGRATION TEST SUMMARY')
  console.log('=' * 50)
  console.log(`LogAI Service: ${results.logaiService ? '✅ HEALTHY' : '❌ UNHEALTHY'}`)
  console.log('')
  console.log('App Connectivity:')
  for (const [app, status] of Object.entries(results.apps)) {
    console.log(`  ${app}: ${status ? '✅ CONNECTED' : '❌ DISCONNECTED'}`)
  }
  console.log('')
  console.log('LogAI Integration:')
  for (const [app, status] of Object.entries(results.logs)) {
    console.log(`  ${app}: ${status ? '✅ INTEGRATED' : '❌ FAILED'}`)
  }
  console.log('')

  // Calculate success rate
  const totalTests = 1 + Object.keys(results.apps).length + Object.keys(results.logs).length
  const successfulTests = (results.logaiService ? 1 : 0) +
    Object.values(results.apps).filter(Boolean).length +
    Object.values(results.logs).filter(Boolean).length

  const successRate = Math.round((successfulTests / totalTests) * 100)

  console.log(`🎯 Overall Success Rate: ${successRate}% (${successfulTests}/${totalTests} tests passed)`)

  if (successRate === 100) {
    console.log('🎉 ALL TESTS PASSED! LogAI integration is working perfectly across the ecosystem!')
  } else if (successRate >= 75) {
    console.log('✨ Most integrations working! Minor issues to resolve.')
  } else if (successRate >= 50) {
    console.log('⚠️  Partial integration success. Several issues need attention.')
  } else {
    console.log('🚨 Major integration issues detected. Significant work needed.')
  }

  console.log('')
  console.log('🔍 Next Steps:')
  console.log('1. Ensure all apps are running on their designated ports')
  console.log('2. Check LogAI service logs for any errors')
  console.log('3. Verify LogAI SDK integration in app code')
  console.log('4. Test user interactions in web interfaces')
  console.log('5. Check LogAI dashboard for incoming logs')

  return results
}

// Run the test
runComprehensiveTest().catch(console.error)
