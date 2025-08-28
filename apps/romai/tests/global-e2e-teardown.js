import axios from 'axios'

/**
 * Global Playwright Teardown for ROMAI E2E Tests
 * 
 * Cleans up:
 * - Test data and temporary files
 * - Romanian language test sessions
 * - Authentication tokens
 * - Performance metrics collection
 * - Test result reporting
 */

async function globalTeardown() {
  console.log('🧹 Cleaning up ROMAI E2E Test Environment...')
  
  // 1. Collect and report performance metrics
  await collectPerformanceMetrics()
  
  // 2. Clean up test data
  await cleanupTestData()
  
  // 3. Generate Romanian language test report
  await generateRomanianTestReport()
  
  // 4. Clean up authentication tokens
  await cleanupAuthTokens()
  
  // 5. Archive test artifacts
  await archiveTestArtifacts()
  
  console.log('✅ ROMAI E2E Test Environment Cleaned Up!')
}

async function collectPerformanceMetrics() {
  console.log('📊 Collecting Performance Metrics...')
  
  try {
    // Calculate total test duration
    const totalDuration = Date.now() - (global.ROMAI_PERFORMANCE?.startTime || Date.now())
    
    const metrics = {
      totalTestDuration: totalDuration,
      testTimestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }
    
    // Try to get final server health metrics
    try {
      const healthResponse = await axios.get('http://localhost:6101/health', {
        timeout: 5000
      })
      
      if (healthResponse.status === 200) {
        metrics.finalServerHealth = healthResponse.data
      }
      
      // Get server performance metrics if available
      const metricsResponse = await axios.get('http://localhost:6101/api/v1/metrics', {
        timeout: 5000
      })
      
      if (metricsResponse.status === 200) {
        metrics.serverMetrics = metricsResponse.data
      }
    } catch (error) {
      console.log('ℹ️ Server metrics not available (server may be shutting down)')
    }
    
    // Store metrics for reporting
    global.ROMAI_FINAL_METRICS = metrics
    
    console.log(`✅ Performance metrics collected (${totalDuration}ms total duration)`)
  } catch (error) {
    console.warn('⚠️ Failed to collect some performance metrics:', error.message)
  }
}

async function cleanupTestData() {
  console.log('🗑️ Cleaning up test data...')
  
  try {
    // Clear global test data
    if (global.ROMAI_TEST_DATA) {
      delete global.ROMAI_TEST_DATA
    }
    
    // Clear browser contexts
    if (global.ROMAI_BROWSER_CONTEXTS) {
      delete global.ROMAI_BROWSER_CONTEXTS
    }
    
    // Clear text utilities
    if (global.ROMAI_TEXT_UTILS) {
      delete global.ROMAI_TEXT_UTILS
    }
    
    // Try to clear server-side test data if cleanup endpoint exists
    try {
      await axios.post('http://localhost:6101/api/v1/test/cleanup', {
        testSession: 'e2e-playwright-' + Date.now()
      }, {
        timeout: 5000
      })
      
      console.log('✅ Server-side test data cleaned up')
    } catch (error) {
      // Server may not have cleanup endpoint or may be shutting down
      console.log('ℹ️ Server-side cleanup not available')
    }
    
    console.log('✅ Test data cleanup completed')
  } catch (error) {
    console.warn('⚠️ Some test data cleanup failed:', error.message)
  }
}

async function generateRomanianTestReport() {
  console.log('📝 Generating Romanian Language Test Report...')
  
  try {
    const metrics = global.ROMAI_FINAL_METRICS || {}
    const testData = global.ROMAI_TEST_DATA || {}
    
    const report = {
      title: '🇷🇴 ROMAI E2E Test Report',
      timestamp: new Date().toISOString(),
      summary: {
        testDuration: `${Math.round((metrics.totalTestDuration || 0) / 1000)}s`,
        romanianQueriesCount: (testData.mathematicalProblems?.length || 0) + 
                             (testData.culturalQuestions?.length || 0) + 
                             (testData.linguisticTests?.length || 0),
        environment: metrics.environment || 'Unknown'
      },
      coverage: {
        mathematicalReasoning: testData.mathematicalProblems?.length || 0,
        culturalIntelligence: testData.culturalQuestions?.length || 0,
        linguisticProcessing: testData.linguisticTests?.length || 0
      }
    }
    
    // Generate markdown report
    const markdownReport = `
# ${report.title}

**Generated**: ${report.timestamp}  
**Duration**: ${report.summary.testDuration}  
**Environment**: ${JSON.stringify(report.summary.environment)}

## Test Coverage Summary

- **Mathematical Reasoning**: ${report.coverage.mathematicalReasoning} test cases
- **Cultural Intelligence**: ${report.coverage.culturalIntelligence} test cases  
- **Linguistic Processing**: ${report.coverage.linguisticProcessing} test cases
- **Total Romanian Queries**: ${report.summary.romanianQueriesCount}

## Test Categories Validated

### 🧮 Mathematical Reasoning
- Romanian mathematical terminology
- Numerical calculations in Romanian context
- Word problems with cultural references

### 🎭 Cultural Intelligence  
- Romanian historical knowledge
- Traditional customs and celebrations
- Literary and cultural figures
- Regional expressions and idioms

### 🔤 Linguistic Processing
- Romanian diacritic handling (ăâîșț)
- Morphological analysis
- Verb conjugation
- Grammar validation

## Performance Metrics

${metrics.finalServerHealth ? `
### Server Health
- Status: ${metrics.finalServerHealth.status}
- Models Loaded: ${metrics.finalServerHealth.models_loaded || 'N/A'}
- Romanian Enabled: ${metrics.finalServerHealth.romanian_enabled ? 'Yes' : 'No'}
` : '### Server Health\n- Not available at teardown'}

${metrics.serverMetrics ? `
### Server Performance
- Average Response Time: ${metrics.serverMetrics.avg_response_time || 'N/A'}ms
- Total Queries Processed: ${metrics.serverMetrics.total_queries || 'N/A'}
- Error Rate: ${metrics.serverMetrics.error_rate || 'N/A'}%
` : '### Server Performance\n- Not available at teardown'}

---
*Generated by ROMAI E2E Test Suite*
`
    
    // Store report in global state for potential file output
    global.ROMAI_TEST_REPORT = {
      json: report,
      markdown: markdownReport
    }
    
    console.log('✅ Romanian language test report generated')
  } catch (error) {
    console.warn('⚠️ Failed to generate complete test report:', error.message)
  }
}

async function cleanupAuthTokens() {
  console.log('🔐 Cleaning up authentication tokens...')
  
  try {
    // Clear test tokens from global state
    if (global.ROMAI_TEST_TOKENS) {
      const tokenCount = Object.keys(global.ROMAI_TEST_TOKENS).length
      delete global.ROMAI_TEST_TOKENS
      console.log(`✅ Cleaned up ${tokenCount} test authentication tokens`)
    }
    
    // If we have an enterprise API cleanup endpoint, use it
    try {
      await axios.post('http://localhost:8001/api/v1/auth/cleanup-test-tokens', {
        testSession: 'e2e-playwright'
      }, {
        timeout: 5000
      })
      
      console.log('✅ Server-side auth tokens cleaned up')
    } catch (error) {
      // Enterprise API may not be running or may not have cleanup endpoint
      console.log('ℹ️ Server-side auth cleanup not available')
    }
  } catch (error) {
    console.warn('⚠️ Auth token cleanup partially failed:', error.message)
  }
}

async function archiveTestArtifacts() {
  console.log('📦 Archiving test artifacts...')
  
  try {
    // In a real implementation, you might save artifacts to file system
    // For now, we'll just log the availability of artifacts
    
    const availableArtifacts = {
      testReport: !!global.ROMAI_TEST_REPORT,
      performanceMetrics: !!global.ROMAI_FINAL_METRICS,
      playwrightReport: 'playwright-report/',
      testResults: 'test-results/',
      videos: 'test-results/videos/',
      screenshots: 'test-results/screenshots/',
      traces: 'test-results/traces/'
    }
    
    console.log('📋 Available test artifacts:')
    Object.entries(availableArtifacts).forEach(([artifact, available]) => {
      const status = typeof available === 'boolean' ? (available ? '✅' : '❌') : '📁'
      console.log(`  ${status} ${artifact}: ${available}`)
    })
    
    // Performance summary
    if (global.ROMAI_FINAL_METRICS) {
      const metrics = global.ROMAI_FINAL_METRICS
      console.log('\n📊 Final Performance Summary:')
      console.log(`  ⏱️ Total Test Duration: ${Math.round((metrics.totalTestDuration || 0) / 1000)}s`)
      console.log(`  🖥️ Platform: ${metrics.environment?.platform || 'Unknown'}`)
      console.log(`  📦 Node Version: ${metrics.environment?.nodeVersion || 'Unknown'}`)
    }
    
    // Romanian language summary
    if (global.ROMAI_TEST_REPORT) {
      const report = global.ROMAI_TEST_REPORT.json
      console.log('\n🇷🇴 Romanian Language Test Summary:')
      console.log(`  🧮 Mathematical Tests: ${report.coverage?.mathematicalReasoning || 0}`)
      console.log(`  🎭 Cultural Tests: ${report.coverage?.culturalIntelligence || 0}`)
      console.log(`  🔤 Linguistic Tests: ${report.coverage?.linguisticProcessing || 0}`)
    }
    
    console.log('\n✅ Test artifacts catalogued successfully')
  } catch (error) {
    console.warn('⚠️ Failed to archive some test artifacts:', error.message)
  }
}

// Final cleanup of global variables
function finalCleanup() {
  try {
    // Clean up all ROMAI globals
    const romaiGlobals = Object.keys(global).filter(key => key.startsWith('ROMAI_'))
    romaiGlobals.forEach(key => {
      delete global[key]
    })
    
    if (romaiGlobals.length > 0) {
      console.log(`🧹 Cleaned up ${romaiGlobals.length} global variables`)
    }
  } catch (error) {
    console.warn('⚠️ Final cleanup had minor issues:', error.message)
  }
}

// Main teardown function with error handling
async function safeTeardown() {
  try {
    await globalTeardown()
  } catch (error) {
    console.error('❌ Error during teardown:', error.message)
  } finally {
    finalCleanup()
  }
}

export default safeTeardown