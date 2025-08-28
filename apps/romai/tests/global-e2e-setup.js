import { chromium } from '@playwright/test'
import axios from 'axios'

/**
 * Global Playwright Setup for ROMAI E2E Tests
 * 
 * Sets up:
 * - Romanian test data and cultural content
 * - AGI server health verification
 * - Database seeding for Romanian language tests
 * - Authentication tokens for secure endpoints
 */

async function globalSetup() {
  console.log('🚀 Setting up ROMAI E2E Test Environment...')
  
  // 1. Verify AGI Server is healthy
  await verifyRomaiServerHealth()
  
  // 2. Seed Romanian test data
  await seedRomanianTestData()
  
  // 3. Create test authentication tokens
  await createTestAuthTokens()
  
  // 4. Warm up AGI models with Romanian content
  await warmupRomanianModels()
  
  // 5. Set up browser contexts with Romanian settings
  await setupRomanianBrowserContexts()
  
  console.log('✅ ROMAI E2E Test Environment Ready!')
}

async function verifyRomaiServerHealth() {
  console.log('🏥 Verifying ROMAI AGI Server Health...')
  
  const maxRetries = 30 // 5 minutes max wait
  let retries = 0
  
  while (retries < maxRetries) {
    try {
      const healthResponse = await axios.get('http://localhost:6101/health', {
        timeout: 5000
      })
      
      if (healthResponse.status === 200 && healthResponse.data.status === 'healthy') {
        console.log('✅ ROMAI Server is healthy and ready')
        
        // Verify Romanian capabilities are loaded
        const capabilitiesResponse = await axios.get('http://localhost:6101/api/v1/capabilities', {
          timeout: 5000
        })
        
        if (capabilitiesResponse.status === 200) {
          const capabilities = capabilitiesResponse.data
          console.log(`📊 Models loaded: ${capabilities.models_loaded || 0}`)
          console.log(`🇷🇴 Romanian language: ${capabilities.romanian_enabled ? 'Enabled' : 'Disabled'}`)
          console.log(`🎭 Cultural processing: ${capabilities.cultural_processing ? 'Active' : 'Inactive'}`)
          
          if (capabilities.models_loaded > 0) {
            return
          }
        }
      }
    } catch (error) {
      console.log(`⏳ Waiting for ROMAI Server... (${retries + 1}/${maxRetries})`)
    }
    
    retries++
    await new Promise(resolve => setTimeout(resolve, 10000)) // Wait 10 seconds
  }
  
  throw new Error('ROMAI AGI Server failed to start within timeout period')
}

async function seedRomanianTestData() {
  console.log('🌱 Seeding Romanian Test Data...')
  
  const testData = {
    mathematicalProblems: [
      {
        query: 'Calculați √144 + 25²',
        expectedResult: '637',
        difficulty: 'medium'
      },
      {
        query: 'Rezolvați ecuația 2x + 5 = 17',
        expectedResult: 'x = 6',
        difficulty: 'easy'
      },
      {
        query: 'Care este aria unui cerc cu raza de 5 metri?',
        expectedResult: '78.5',
        difficulty: 'medium'
      }
    ],
    
    culturalQuestions: [
      {
        query: 'Cine a fost Mihai Eminescu?',
        expectedKeywords: ['poet', 'național', 'român', 'literatura'],
        category: 'literature'
      },
      {
        query: 'Explică tradiția mărțișorului în România',
        expectedKeywords: ['martie', 'primăvar', 'tradiție', 'România'],
        category: 'traditions'
      },
      {
        query: 'Povestește despre Castelul Bran',
        expectedKeywords: ['Dracula', 'Transilvania', 'castel', 'istoric'],
        category: 'history'
      },
      {
        query: 'Ce înseamnă expresia "A băga bațul prin gard"?',
        expectedKeywords: ['conflict', 'problemă', 'ceartă'],
        category: 'expressions'
      }
    ],
    
    linguisticTests: [
      {
        query: 'Analizează cuvântul "frumusețe" din punct de vedere morfologic',
        expectedKeywords: ['substantiv', 'feminin', 'morfem'],
        category: 'morphology'
      },
      {
        query: 'Conjugă verbul "a înțelege" la prezent, persoana I, singular',
        expectedResult: 'înțeleg',
        category: 'conjugation'
      }
    ]
  }
  
  // Store test data in global state for test access
  global.ROMAI_TEST_DATA = testData
  
  try {
    // Pre-load some test queries to warm up the system
    const testClient = axios.create({
      baseURL: 'http://localhost:6101',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'ro-RO'
      }
    })
    
    // Test a simple mathematical query
    await testClient.post('/api/v1/reasoning/query', {
      query: 'Test pre-încărcare: 2 + 2',
      language: 'ro'
    })
    
    console.log('✅ Romanian test data seeded successfully')
  } catch (error) {
    console.warn('⚠️ Failed to seed some test data, but continuing...', error.message)
  }
}

async function createTestAuthTokens() {
  console.log('🔑 Creating Test Authentication Tokens...')
  
  // For E2E tests, we'll use mock tokens that match our test configuration
  global.ROMAI_TEST_TOKENS = {
    validUser: 'test-user-token-e2e-' + Date.now(),
    adminUser: 'test-admin-token-e2e-' + Date.now(),
    restrictedUser: 'test-restricted-token-e2e-' + Date.now()
  }
  
  console.log('✅ Test authentication tokens created')
}

async function warmupRomanianModels() {
  console.log('🔥 Warming up Romanian AGI Models...')
  
  try {
    const testClient = axios.create({
      baseURL: 'http://localhost:6101',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'ro-RO'
      }
    })
    
    const warmupQueries = [
      'Salut! Testez sistemul românesc.',
      'Calculează 5 + 3',
      'Cine a fost primul rege al României?'
    ]
    
    // Send warmup queries in parallel
    const warmupPromises = warmupQueries.map(query =>
      testClient.post('/api/v1/reasoning/query', {
        query: query,
        language: 'ro'
      }).catch(error => {
        console.warn(`⚠️ Warmup query failed: "${query}"`, error.message)
      })
    )
    
    await Promise.all(warmupPromises)
    console.log('✅ Romanian models warmed up successfully')
  } catch (error) {
    console.warn('⚠️ Model warmup partially failed, but continuing...', error.message)
  }
}

async function setupRomanianBrowserContexts() {
  console.log('🌐 Setting up Romanian Browser Contexts...')
  
  // Create shared browser context configurations for Romanian locale
  global.ROMAI_BROWSER_CONTEXTS = {
    romanianDesktop: {
      locale: 'ro-RO',
      timezoneId: 'Europe/Bucharest',
      extraHTTPHeaders: {
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
        'Accept-Charset': 'utf-8'
      }
    },
    
    romanianMobile: {
      ...chromium.devices['iPhone 13'],
      locale: 'ro-RO',
      timezoneId: 'Europe/Bucharest',
      extraHTTPHeaders: {
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
        'Accept-Charset': 'utf-8'
      }
    },
    
    highContrastRomanian: {
      locale: 'ro-RO',
      timezoneId: 'Europe/Bucharest',
      colorScheme: 'dark',
      reducedMotion: 'reduce',
      forcedColors: 'active',
      extraHTTPHeaders: {
        'Accept-Language': 'ro-RO,ro;q=0.9,en;q=0.8',
        'Accept-Charset': 'utf-8'
      }
    }
  }
  
  console.log('✅ Romanian browser contexts configured')
}

// Store Romanian text validation utilities in global scope
global.ROMAI_TEXT_UTILS = {
  hasRomanianDiacritics: (text) => /[ăâîșț]/i.test(text),
  
  validateRomanianResponse: (response, expectedKeywords = []) => {
    const hasRomanianChars = /[ăâîșț]/i.test(response)
    const hasExpectedContent = expectedKeywords.length === 0 || 
      expectedKeywords.some(keyword => 
        response.toLowerCase().includes(keyword.toLowerCase())
      )
    
    return {
      hasRomanianChars,
      hasExpectedContent,
      isValid: hasRomanianChars && hasExpectedContent,
      length: response.length
    }
  },
  
  extractRomanianWords: (text) => {
    // Extract words containing Romanian diacritics
    const romanianWordPattern = /\b\w*[ăâîșț]\w*\b/gi
    return text.match(romanianWordPattern) || []
  }
}

// Performance monitoring utilities
global.ROMAI_PERFORMANCE = {
  startTime: Date.now(),
  
  measureResponseTime: async (fn) => {
    const start = Date.now()
    const result = await fn()
    const end = Date.now()
    
    return {
      result,
      responseTime: end - start,
      isAcceptable: (end - start) < 10000 // 10 seconds max
    }
  }
}

export default globalSetup