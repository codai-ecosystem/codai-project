// Global test setup for ROMAI AGI testing environment
const { spawn } = require('child_process')
const axios = require('axios')

let romaIServer

async function globalSetup() {
  console.log('🚀 Setting up ROMAI AGI test environment...')
  
  // Start ROMAI server for integration tests
  try {
    console.log('📡 Starting ROMAI AGI server for testing...')
    
    // Set test environment variables
    process.env.ROMAI_ENV = 'test'
    process.env.ROMAI_LOG_LEVEL = 'ERROR'
    process.env.ROMAI_TEST_MODE = 'true'
    process.env.ROMAI_MODEL_CACHE = 'false'
    
    // Start the server in test mode
    romaIServer = spawn('python', ['-m', 'uvicorn', 'ml.serving.model_server:app', '--host', '0.0.0.0', '--port', '6102'], {
      cwd: process.cwd() + '/src',
      env: {
        ...process.env,
        PYTHONPATH: process.cwd() + '/src'
      },
      stdio: 'pipe'
    })
    
    // Wait for server to be ready
    console.log('⏳ Waiting for ROMAI server to initialize...')
    await waitForServer('http://localhost:6102/health', 30000)
    
    console.log('✅ ROMAI AGI server ready for testing on port 6102')
    
    // Store server process for cleanup
    global.__ROMAI_SERVER__ = romaIServer
    
  } catch (error) {
    console.error('❌ Failed to start ROMAI server for testing:', error)
    throw error
  }
  
  // Initialize Romanian test data
  try {
    console.log('📚 Loading Romanian cultural test data...')
    await initializeRomanianTestData()
    console.log('✅ Romanian test data initialized')
  } catch (error) {
    console.error('⚠️ Warning: Could not load Romanian test data:', error)
  }
  
  // Initialize AGI test fixtures
  try {
    console.log('🧠 Initializing AGI test fixtures...')
    await initializeAGITestFixtures()
    console.log('✅ AGI test fixtures ready')
  } catch (error) {
    console.error('⚠️ Warning: Could not initialize AGI test fixtures:', error)
  }
  
  console.log('🎯 ROMAI test environment setup complete!')
}

async function waitForServer(url, timeout = 30000) {
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    try {
      await axios.get(url, { timeout: 2000 })
      return
    } catch (error) {
      // Server not ready yet, wait and retry
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  throw new Error(`Server at ${url} did not start within ${timeout}ms`)
}

async function initializeRomanianTestData() {
  // Romanian cultural test dataset
  global.ROMANIAN_CULTURAL_DATA = {
    traditionalGreetings: [
      { romanian: 'Bună ziua!', english: 'Good day!', formality: 'formal' },
      { romanian: 'Salut!', english: 'Hi!', formality: 'informal' },
      { romanian: 'Sărutmâna!', english: 'I kiss your hand!', formality: 'traditional' }
    ],
    culturalExpressions: [
      {
        expression: 'A băga bățul prin gard',
        meaning: 'To cause trouble or conflict',
        type: 'idiom',
        culturalSignificance: 0.85
      },
      {
        expression: 'Cât trăiești, înveți',
        meaning: 'You learn as long as you live',
        type: 'proverb', 
        culturalSignificance: 0.90
      },
      {
        expression: 'Cu vorba bună treci și pe la Dumnezeu în casă',
        meaning: 'With kind words, you can enter even God\'s house',
        type: 'proverb',
        culturalSignificance: 0.88
      }
    ],
    historicalFigures: [
      {
        name: 'Mihai Eminescu',
        field: 'literatura română',
        period: 'secolele XIX-XX',
        importance: 0.98,
        description: 'Poetul național al României'
      },
      {
        name: 'Constantin Brâncuși',
        field: 'arta română',
        period: 'secolul XX',
        importance: 0.95,
        description: 'Sculptor de renume mondial'
      },
      {
        name: 'George Enescu',
        field: 'muzica românească',
        period: 'secolul XX',
        importance: 0.93,
        description: 'Compozitor și violonist'
      }
    ],
    linguisticFeatures: {
      diacritics: ['ă', 'â', 'î', 'ș', 'ț'],
      commonWords: ['și', 'cu', 'de', 'la', 'în', 'pe', 'pentru', 'dar', 'dacă'],
      grammaticalCases: ['nominativ', 'acuzativ', 'genitiv', 'dativ', 'vocativ']
    }
  }
}

async function initializeAGITestFixtures() {
  // Mathematical test problems with Romanian context
  global.AGI_MATHEMATICAL_TESTS = [
    {
      problem: 'Calculați √144',
      expectedResult: 12,
      difficulty: 'easy',
      romanianContext: true
    },
    {
      problem: 'Rezolvați ecuația: 2x + 5 = 17',
      expectedResult: 6,
      difficulty: 'medium',
      romanianContext: true
    },
    {
      problem: 'Calculați integrata ∫(2x + 3)dx de la 0 la 5',
      expectedResult: 40,
      difficulty: 'hard',
      romanianContext: true
    }
  ]
  
  // Logical reasoning test cases
  global.AGI_LOGICAL_TESTS = [
    {
      premise: 'Toate rozele sunt flori. Aceasta este o roză.',
      expectedConclusion: 'Aceasta este o floare',
      reasoningType: 'deductive',
      romanianContext: true
    },
    {
      premise: 'Dacă plouă, atunci strada este udă. Strada este udă.',
      expectedConclusion: 'Nu putem concluziona sigur că plouă',
      reasoningType: 'logical_fallacy_detection',
      romanianContext: true
    }
  ]
  
  // Cultural intelligence test scenarios
  global.AGI_CULTURAL_TESTS = [
    {
      query: 'Explică-mi importanța Zilei Naționale a României',
      expectedElements: ['1 Decembrie', 'Marea Unire', '1918'],
      culturalDepth: 'deep',
      expectedAccuracy: 0.95
    },
    {
      query: 'Ce reprezintă hora în cultura românească?',
      expectedElements: ['dans tradițional', 'unire', 'comunitate'],
      culturalDepth: 'deep',
      expectedAccuracy: 0.90
    }
  ]
  
  // Performance benchmarks
  global.AGI_PERFORMANCE_BENCHMARKS = {
    maxResponseTime: {
      simple: 300,    // ms
      medium: 800,    // ms
      complex: 1500   // ms
    },
    minConfidence: {
      mathematical: 0.95,
      logical: 0.90,
      cultural: 0.88
    },
    memoryLimits: {
      maxMemoryMb: 500,
      maxCpuPercent: 80
    }
  }
}

module.exports = globalSetup