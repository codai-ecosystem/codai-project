import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'

// Custom metrics for Romanian AGI performance
const romanianResponseRate = new Rate('romanian_response_success')
const culturalAccuracyRate = new Rate('cultural_accuracy_success') 
const mathAccuracyRate = new Rate('mathematical_accuracy_success')
const responseTime = new Trend('romanian_response_time')
const errorCount = new Counter('errors')
const diacriticAccuracy = new Rate('diacritic_accuracy')

// Test configuration for different load scenarios
export const options = {
  stages: [
    // Warm-up phase
    { duration: '30s', target: 5 },
    // Load testing phase
    { duration: '2m', target: 20 },
    // Stress testing phase
    { duration: '1m', target: 50 },
    // Peak load phase
    { duration: '30s', target: 100 },
    // Recovery phase
    { duration: '1m', target: 20 },
    // Cool-down phase
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    // Performance thresholds for production readiness
    http_req_duration: ['p(50)<500', 'p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.1'], // Less than 10% errors
    romanian_response_success: ['rate>0.95'], // 95% Romanian responses
    cultural_accuracy_success: ['rate>0.90'], // 90% cultural accuracy
    mathematical_accuracy_success: ['rate>0.98'], // 98% math accuracy
    diacritic_accuracy: ['rate>0.95'], // 95% diacritic accuracy
    romanian_response_time: ['p(95)<3000'], // 95% under 3 seconds
  },
}

// Test data for Romanian cultural and mathematical queries
const romanianQueries = [
  // Mathematical queries in Romanian
  {
    type: 'mathematical',
    query: 'Calculați √144 + 25²',
    expectedPattern: /637|6.*3.*7/,
    culturalContext: false,
    expectedDiacritics: /Calculați|rezultat|răspuns/
  },
  {
    type: 'mathematical', 
    query: 'Rezolvați ecuația 2x + 5 = 17',
    expectedPattern: /x.*=.*6|6/,
    culturalContext: false,
    expectedDiacritics: /Rezolvați|ecuația|soluția/
  },
  {
    type: 'mathematical',
    query: 'Care este aria unui cerc cu raza de 5 metri?',
    expectedPattern: /78\.5|π.*25|25.*π/,
    culturalContext: false,
    expectedDiacritics: /aria|cerc|raza|metri/
  },
  
  // Cultural queries requiring Romanian knowledge
  {
    type: 'cultural',
    query: 'Cine a fost Mihai Eminescu?',
    expectedPattern: /poet|național|român|literatura/i,
    culturalContext: true,
    expectedDiacritics: /română|națională|literatură/
  },
  {
    type: 'cultural',
    query: 'Explică tradiția mărțișorului în România',
    expectedPattern: /martie|primăvar|tradiție|România/i,
    culturalContext: true,
    expectedDiacritics: /mărțișor|tradiția|România/
  },
  {
    type: 'cultural',
    query: 'Povestește despre Castelul Bran',
    expectedPattern: /Dracula|Transilvania|castel|istoric/i,
    culturalContext: true,
    expectedDiacritics: /Povestește|România|istoric/
  },
  {
    type: 'cultural',
    query: 'Ce înseamnă expresia "A băga bațul prin gard"?',
    expectedPattern: /conflict|problemă|ceartă|discord/i,
    culturalContext: true,
    expectedDiacritics: /înseamnă|băga/
  },
  
  // Linguistic processing queries
  {
    type: 'linguistic',
    query: 'Analizează cuvântul "frumusețe" din punct de vedere morfologic',
    expectedPattern: /substantiv|feminin|morfem|rădăcin/i,
    culturalContext: false,
    expectedDiacritics: /Analizează|frumusețe|morfologic/
  },
  {
    type: 'linguistic',
    query: 'Conjugă verbul "a înțelege" la prezent, persoana I, singular',
    expectedPattern: /înțeleg/i,
    culturalContext: false,
    expectedDiacritics: /înțelege|înțeleg/
  },
  
  // Complex reasoning queries
  {
    type: 'reasoning',
    query: 'Toate trandafirii sunt flori. Aceasta este un trandafir. Ce putem concluziona?',
    expectedPattern: /floare|concluzie|silogism|logic/i,
    culturalContext: false,
    expectedDiacritics: /trandafirii|concluziona/
  }
]

const baseUrl = __ENV.BASE_URL || 'http://localhost:6101'

export default function() {
  // Select random query for this iteration
  const queryData = romanianQueries[Math.floor(Math.random() * romanianQueries.length)]
  
  // Test AGI endpoint
  const payload = {
    query: queryData.query,
    language: 'ro',
    context: 'romanian_cultural',
    performance_tracking: true
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8'
  }
  
  const startTime = new Date()
  
  // Make request to AGI reasoning endpoint
  const response = http.post(`${baseUrl}/api/v1/reasoning/query`, JSON.stringify(payload), {
    headers: headers,
    timeout: '10s'
  })
  
  const endTime = new Date()
  const duration = endTime - startTime
  
  // Record response time
  responseTime.add(duration)
  
  // Basic response validation
  const responseSuccess = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 10s': (r) => r.timings.duration < 10000,
    'has response body': (r) => r.body.length > 0,
    'content type is JSON': (r) => r.headers['Content-Type']?.includes('application/json')
  })
  
  if (!responseSuccess) {
    errorCount.add(1)
    romanianResponseRate.add(false)
    return
  }
  
  let responseData
  try {
    responseData = JSON.parse(response.body)
  } catch (e) {
    console.error('Failed to parse JSON response:', e)
    errorCount.add(1)
    romanianResponseRate.add(false)
    return
  }
  
  // Validate Romanian response structure
  const hasRomanianResponse = check(responseData, {
    'has result field': (data) => 'result' in data,
    'has confidence score': (data) => 'confidence' in data,
    'has processing time': (data) => 'processing_time' in data,
    'confidence > 0.7': (data) => data.confidence > 0.7
  })
  
  if (!hasRomanianResponse) {
    romanianResponseRate.add(false)
    errorCount.add(1)
    return
  }
  
  const result = responseData.result
  romanianResponseRate.add(true)
  
  // Validate response contains Romanian diacritics
  const hasDiacritics = /[ăâîșț]/.test(result)
  diacriticAccuracy.add(hasDiacritics)
  
  // Type-specific validation
  if (queryData.type === 'mathematical') {
    // Validate mathematical accuracy
    const mathAccurate = queryData.expectedPattern.test(result)
    mathAccuracyRate.add(mathAccurate)
    
    if (!mathAccurate) {
      console.warn(`Mathematical accuracy failed for query: "${queryData.query}"`)
      console.warn(`Expected pattern: ${queryData.expectedPattern}`)
      console.warn(`Actual result: ${result}`)
    }
  }
  
  if (queryData.type === 'cultural' && queryData.culturalContext) {
    // Validate cultural knowledge accuracy
    const culturalAccurate = queryData.expectedPattern.test(result)
    culturalAccuracyRate.add(culturalAccurate)
    
    if (!culturalAccurate) {
      console.warn(`Cultural accuracy failed for query: "${queryData.query}"`)
      console.warn(`Expected pattern: ${queryData.expectedPattern}`)
      console.warn(`Actual result: ${result}`)
    }
  }
  
  // Test concurrent health check
  if (Math.random() < 0.1) { // 10% of iterations
    const healthResponse = http.get(`${baseUrl}/health`, { timeout: '5s' })
    check(healthResponse, {
      'health check successful': (r) => r.status === 200,
      'server is healthy': (r) => JSON.parse(r.body).status === 'healthy'
    })
  }
  
  // Simulate user think time
  sleep(Math.random() * 2 + 0.5) // 0.5-2.5 seconds
}

// Setup function - runs once before test
export function setup() {
  console.log('🚀 Starting Romanian AGI Performance Test')
  console.log(`Base URL: ${baseUrl}`)
  console.log(`Test queries: ${romanianQueries.length}`)
  
  // Warm-up request to ensure server is ready
  const warmupResponse = http.get(`${baseUrl}/health`)
  if (warmupResponse.status !== 200) {
    throw new Error(`Server not ready: ${warmupResponse.status}`)
  }
  
  console.log('✅ Server warm-up successful')
  return { startTime: new Date() }
}

// Teardown function - runs once after test
export function teardown(data) {
  const endTime = new Date()
  const totalDuration = (endTime - data.startTime) / 1000
  
  console.log('📊 Romanian AGI Performance Test Complete')
  console.log(`Total test duration: ${totalDuration}s`)
  console.log('Check detailed metrics above for performance analysis')
}

// Handle summary data
export function handleSummary(data) {
  const summary = {
    test_type: 'Romanian AGI Performance Test',
    timestamp: new Date().toISOString(),
    duration_seconds: data.state.testRunDurationMs / 1000,
    
    // HTTP metrics
    total_requests: data.metrics.http_reqs?.count || 0,
    failed_requests: data.metrics.http_req_failed?.count || 0,
    avg_response_time: Math.round(data.metrics.http_req_duration?.avg || 0),
    p95_response_time: Math.round(data.metrics.http_req_duration?.['p(95)'] || 0),
    p99_response_time: Math.round(data.metrics.http_req_duration?.['p(99)'] || 0),
    
    // Romanian-specific metrics
    romanian_success_rate: Math.round((data.metrics.romanian_response_success?.rate || 0) * 100),
    cultural_accuracy_rate: Math.round((data.metrics.cultural_accuracy_success?.rate || 0) * 100),
    mathematical_accuracy_rate: Math.round((data.metrics.mathematical_accuracy_success?.rate || 0) * 100),
    diacritic_accuracy_rate: Math.round((data.metrics.diacritic_accuracy?.rate || 0) * 100),
    
    // Performance assessment
    production_ready: (
      (data.metrics.http_req_failed?.rate || 1) < 0.1 &&
      (data.metrics.romanian_response_success?.rate || 0) > 0.95 &&
      (data.metrics.mathematical_accuracy_success?.rate || 0) > 0.98 &&
      (data.metrics.http_req_duration?.['p(95)'] || Infinity) < 2000
    )
  }
  
  // Generate detailed report
  const report = `
# 🇷🇴 Romanian AGI Performance Test Report

## Test Summary
- **Test Type**: ${summary.test_type}
- **Timestamp**: ${summary.timestamp}
- **Duration**: ${summary.duration_seconds}s
- **Total Requests**: ${summary.total_requests}
- **Failed Requests**: ${summary.failed_requests}

## Performance Metrics
- **Average Response Time**: ${summary.avg_response_time}ms
- **95th Percentile**: ${summary.p95_response_time}ms
- **99th Percentile**: ${summary.p99_response_time}ms

## Romanian AGI Accuracy
- **Romanian Response Success**: ${summary.romanian_success_rate}%
- **Cultural Knowledge Accuracy**: ${summary.cultural_accuracy_rate}%
- **Mathematical Accuracy**: ${summary.mathematical_accuracy_rate}%
- **Diacritic Accuracy**: ${summary.diacritic_accuracy_rate}%

## Production Readiness
**Status**: ${summary.production_ready ? '✅ READY' : '❌ NOT READY'}

### Success Criteria:
- Error Rate < 10%: ${(data.metrics.http_req_failed?.rate || 1) < 0.1 ? '✅' : '❌'}
- Romanian Success > 95%: ${(data.metrics.romanian_response_success?.rate || 0) > 0.95 ? '✅' : '❌'}
- Math Accuracy > 98%: ${(data.metrics.mathematical_accuracy_success?.rate || 0) > 0.98 ? '✅' : '❌'}
- P95 Response < 2s: ${(data.metrics.http_req_duration?.['p(95)'] || Infinity) < 2000 ? '✅' : '❌'}

---
Generated by K6 Romanian AGI Performance Test Suite
`
  
  return {
    'performance-report.md': report,
    'performance-summary.json': JSON.stringify(summary, null, 2)
  }
}