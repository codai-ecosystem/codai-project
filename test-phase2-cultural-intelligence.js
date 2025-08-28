#!/usr/bin/env node

/**
 * 🇷🇴 Phase 2 Cultural Intelligence Validation Script
 * 
 * Standalone test script to validate Romanian cultural intelligence features
 * without complex test framework dependencies
 */

const axios = require('axios');

// Configuration
const ROMAI_SERVER_URL = 'http://localhost:6101';
const timeout = 30000;

// Test results tracking
let passed = 0;
let failed = 0;
let testResults = [];

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    'info': '📝',
    'success': '✅',
    'error': '❌',
    'warning': '⚠️'
  }[type] || '📝';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function assert(condition, testName, details = '') {
  if (condition) {
    passed++;
    log(`${testName} PASSED ${details}`, 'success');
    testResults.push({ test: testName, status: 'PASSED', details });
  } else {
    failed++;
    log(`${testName} FAILED ${details}`, 'error');
    testResults.push({ test: testName, status: 'FAILED', details });
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test server health
async function testServerHealth() {
  log('Testing RomAI server health...', 'info');
  
  try {
    const response = await axios.get(`${ROMAI_SERVER_URL}/health`, { timeout: 5000 });
    assert(response.status === 200, 'Server Health Check', `Status: ${response.status}`);
    assert(response.data.status === 'healthy', 'Server Status Healthy', `Response: ${response.data.status}`);
    return true;
  } catch (error) {
    assert(false, 'Server Health Check', `Error: ${error.message}`);
    return false;
  }
}

// Test enhanced cultural intelligence
async function testEnhancedCulturalIntelligence() {
  log('Testing Enhanced Cultural Intelligence...', 'info');
  
  const testCases = [
    {
      name: 'Moldovan Regional Context',
      problem: 'În Moldova, Ion cultivă grâu pe 5 pogoane. Dacă un pogon produce 400 kg grâu, câte kilograme produce în total?',
      expectedAnswer: 2000,
      expectedRegion: 'moldova',
      expectedCulturalObjects: ['grâu', 'pogon']
    },
    {
      name: 'Transylvanian Cultural Context', 
      problem: 'La Brașov, Ana face papricaș pentru 12 persoane. Dacă pentru 4 persoane folosește 2 kg carne, câtă carne îi trebuie în total?',
      expectedAnswer: 6,
      expectedRegion: 'transilvania',
      expectedCulturalObjects: ['papricaș']
    },
    {
      name: 'Christmas Cultural Context',
      problem: 'Pentru masa de Crăciun, Maria face cozonac pentru 16 persoane. Dacă pentru 4 persoane folosește 6 ouă, câte ouă îi trebuie în total?',
      expectedAnswer: 24,
      expectedCulturalElements: ['cozonac', 'Crăciun']
    }
  ];

  for (const testCase of testCases) {
    try {
      log(`Testing: ${testCase.name}`, 'info');
      
      const response = await axios.post(`${ROMAI_SERVER_URL}/analyze_romanian_word_problem`, {
        problem: testCase.problem
      }, { timeout });

      // Check response success
      assert(response.status === 200, `${testCase.name} - Response Status`, `Status: ${response.status}`);
      assert(response.data.success === true, `${testCase.name} - Success Flag`, `Success: ${response.data.success}`);
      
      if (response.data.success && response.data.analysis) {
        const analysis = response.data.analysis;
        
        // Check mathematical correctness
        const resultValue = parseFloat(analysis.result);
        assert(Math.abs(resultValue - testCase.expectedAnswer) < 0.1, 
          `${testCase.name} - Mathematical Result`, 
          `Expected: ${testCase.expectedAnswer}, Got: ${resultValue}`);
        
        // Check cultural context
        if (analysis.cultural_context) {
          if (testCase.expectedRegion && analysis.enhanced_metadata?.cultural_analysis?.region) {
            assert(analysis.enhanced_metadata.cultural_analysis.region === testCase.expectedRegion,
              `${testCase.name} - Regional Detection`,
              `Expected: ${testCase.expectedRegion}, Got: ${analysis.enhanced_metadata.cultural_analysis.region}`);
          }
          
          if (testCase.expectedCulturalObjects && analysis.cultural_context.cultural_objects) {
            for (const expectedObj of testCase.expectedCulturalObjects) {
              const found = analysis.cultural_context.cultural_objects.some(obj => 
                obj.toLowerCase().includes(expectedObj.toLowerCase())
              );
              assert(found, `${testCase.name} - Cultural Object Detection`, 
                `Expected object: ${expectedObj} in ${JSON.stringify(analysis.cultural_context.cultural_objects)}`);
            }
          }
          
          if (testCase.expectedCulturalElements && analysis.enhanced_metadata?.cultural_analysis) {
            const culturalObjects = analysis.enhanced_metadata.cultural_analysis.cultural_objects || [];
            const authenticity = analysis.enhanced_metadata.cultural_analysis.authenticity_indicators || [];
            
            for (const expectedElement of testCase.expectedCulturalElements) {
              const found = culturalObjects.some(obj => obj.toLowerCase().includes(expectedElement.toLowerCase())) ||
                           authenticity.some(auth => auth.toLowerCase().includes(expectedElement.toLowerCase()));
              assert(found, `${testCase.name} - Cultural Element Detection`,
                `Expected element: ${expectedElement}`);
            }
          }
        }
        
        // Check confidence scores
        assert(analysis.confidence_score > 0.6, `${testCase.name} - Confidence Score`,
          `Score: ${analysis.confidence_score} (should be > 0.6)`);
        
        if (analysis.cultural_context?.cultural_relevance_score) {
          assert(analysis.cultural_context.cultural_relevance_score > 0.5,
            `${testCase.name} - Cultural Relevance`,
            `Score: ${analysis.cultural_context.cultural_relevance_score} (should be > 0.5)`);
        }
      }
      
      await delay(1000); // Prevent overwhelming the server
      
    } catch (error) {
      assert(false, `${testCase.name} - Request`, `Error: ${error.message}`);
    }
  }
}

// Test traditional measurement handling
async function testTraditionalMeasurements() {
  log('Testing Traditional Romanian Measurements...', 'info');
  
  const measurementTests = [
    {
      name: 'Pogon Measurement',
      problem: 'Țăranul are 3 pogoane de pământ. Câte pogoane are în total?',
      expectedMeasurement: 'pogon',
      expectedAnswer: 3
    },
    {
      name: 'Oca Measurement', 
      problem: 'La piață, negustorul vinde 8 oci de făină la 12 lei oca. Câți lei încasează în total?',
      expectedMeasurement: 'oca',
      expectedAnswer: 96
    }
  ];

  for (const test of measurementTests) {
    try {
      log(`Testing: ${test.name}`, 'info');
      
      const response = await axios.post(`${ROMAI_SERVER_URL}/analyze_romanian_word_problem`, {
        problem: test.problem
      }, { timeout });

      assert(response.status === 200, `${test.name} - Response Status`);
      
      if (response.data.success && response.data.analysis) {
        const analysis = response.data.analysis;
        
        // Check mathematical result
        const result = parseFloat(analysis.result);
        assert(Math.abs(result - test.expectedAnswer) < 0.1, 
          `${test.name} - Mathematical Result`,
          `Expected: ${test.expectedAnswer}, Got: ${result}`);
        
        // Check traditional measurement detection
        if (analysis.cultural_context?.traditional_measurements) {
          const found = analysis.cultural_context.traditional_measurements.some(measurement =>
            measurement.toLowerCase().includes(test.expectedMeasurement.toLowerCase())
          );
          assert(found, `${test.name} - Measurement Detection`,
            `Expected: ${test.expectedMeasurement} in ${JSON.stringify(analysis.cultural_context.traditional_measurements)}`);
        }
      }
      
      await delay(1000);
      
    } catch (error) {
      assert(false, `${test.name} - Request`, `Error: ${error.message}`);
    }
  }
}

// Test performance with complex problems
async function testPerformance() {
  log('Testing Performance with Complex Cultural Processing...', 'info');
  
  const complexProblem = `
    În Moldova, în timpul sărbătorii de Crăciun, familia Popescu pregătește masa 
    festivă pentru 20 de persoane. Maria face cozonac folosind 6 ouă pentru fiecare 
    cozonac și vrea să facă 4 cozonate. Ion cumpără de la piața din Iași 8 oci de 
    făină la 15 lei oca și 5 pogoane de grâu la 400 kg pogonul. Calculează câte 
    ouă folosește Maria în total și câți lei cheltuiește Ion pentru făină.
  `;

  try {
    const startTime = Date.now();
    
    const response = await axios.post(`${ROMAI_SERVER_URL}/analyze_romanian_word_problem`, {
      problem: complexProblem
    }, { timeout });

    const processingTime = Date.now() - startTime;
    
    assert(response.status === 200, 'Complex Problem - Response Status');
    assert(response.data.success === true, 'Complex Problem - Success Flag');
    assert(processingTime < 15000, 'Complex Problem - Processing Time', 
      `Time: ${processingTime}ms (should be < 15s)`);
    
    if (response.data.analysis) {
      const analysis = response.data.analysis;
      
      assert(analysis.confidence_score > 0.6, 'Complex Problem - Confidence',
        `Score: ${analysis.confidence_score}`);
        
      if (analysis.cultural_context?.cultural_relevance_score) {
        assert(analysis.cultural_context.cultural_relevance_score > 0.6,
          'Complex Problem - Cultural Relevance',
          `Score: ${analysis.cultural_context.cultural_relevance_score}`);
      }
      
      // Check enhanced metadata presence
      assert(analysis.enhanced_metadata !== undefined, 'Complex Problem - Enhanced Metadata Present');
      
      if (analysis.enhanced_metadata) {
        assert(analysis.enhanced_metadata.cultural_analysis !== undefined,
          'Complex Problem - Cultural Analysis Present');
        assert(analysis.enhanced_metadata.terminology_analysis !== undefined,
          'Complex Problem - Terminology Analysis Present');
      }
    }
    
  } catch (error) {
    assert(false, 'Complex Problem - Request', `Error: ${error.message}`);
  }
}

// Generate test summary
function generateSummary() {
  log('\n' + '='.repeat(60), 'info');
  log('🇷🇴 PHASE 2 CULTURAL INTELLIGENCE TEST SUMMARY', 'info');
  log('='.repeat(60), 'info');
  
  const total = passed + failed;
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  
  log(`✅ Tests Passed: ${passed}`, 'success');
  log(`❌ Tests Failed: ${failed}`, 'error');
  log(`📊 Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warning');
  
  if (failed > 0) {
    log('\nFailed Tests:', 'warning');
    testResults.filter(r => r.status === 'FAILED').forEach(result => {
      log(`  - ${result.test}: ${result.details}`, 'error');
    });
  }
  
  log('\n' + '='.repeat(60), 'info');
  
  if (successRate >= 80) {
    log('🏆 PHASE 2 CULTURAL INTELLIGENCE: SUCCESS!', 'success');
    log('🇷🇴 Romanian AGI cultural processing capabilities validated', 'success');
  } else {
    log('⚠️  PHASE 2 CULTURAL INTELLIGENCE: NEEDS IMPROVEMENT', 'warning');
    log(`Success rate ${successRate}% below 80% threshold`, 'warning');
  }
}

// Main test execution
async function runTests() {
  log('🇷🇴 Starting Phase 2 Cultural Intelligence Tests...', 'info');
  log('='.repeat(60), 'info');
  
  // Test server availability first
  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    log('❌ Server not available. Please start RomAI server first.', 'error');
    log('Command: python apps/romai/src/ml/serving/model_server.py', 'info');
    return;
  }
  
  await delay(2000);
  
  // Run comprehensive tests
  await testEnhancedCulturalIntelligence();
  await delay(2000);
  
  await testTraditionalMeasurements();
  await delay(2000);
  
  await testPerformance();
  
  // Generate final summary
  generateSummary();
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'error');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection: ${reason}`, 'error');
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  log(`Test execution error: ${error.message}`, 'error');
  process.exit(1);
});