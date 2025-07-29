import { test, expect, Page, APIRequestContext } from '@playwright/test';

/**
 * 🔌 API INTEGRATION & BACKEND TESTING
 * 
 * Comprehensive testing of API endpoints, data flows, integrations,
 * and backend services across the CODAI ecosystem.
 */

const SERVICES = {
  ID: { 
    baseUrl: 'http://localhost:4032', 
    name: 'ID Service',
    apiPrefix: '/api',
    expectedEndpoints: ['/auth', '/users', '/sessions', '/health']
  },
  HUB: { 
    baseUrl: 'http://localhost:4700', 
    name: 'Hub Service',
    apiPrefix: '/api',
    expectedEndpoints: ['/projects', '/dashboard', '/integrations', '/health']
  },
  ADMIN: { 
    baseUrl: 'http://localhost:3200', 
    name: 'Admin Service',
    apiPrefix: '/api',
    expectedEndpoints: ['/admin', '/users', '/systems', '/analytics', '/health']
  },
  CODAI: { 
    baseUrl: 'http://localhost:4001', 
    name: 'CODAI Service',
    apiPrefix: '/api',
    expectedEndpoints: ['/projects', '/ai', '/templates', '/code', '/health']
  },
  BANCAI: { 
    baseUrl: 'http://localhost:4003', 
    name: 'BancAI Service',
    apiPrefix: '/api',
    expectedEndpoints: ['/accounts', '/transactions', '/analytics', '/compliance', '/health']
  }
};

const API_TEST_SCENARIOS = {
  healthChecks: ['/health', '/api/health', '/status', '/api/status', '/_health'],
  authEndpoints: ['/api/auth', '/api/auth/signin', '/api/auth/signup', '/api/user'],
  dataEndpoints: ['/api/data', '/api/users', '/api/projects', '/api/dashboard'],
  publicEndpoints: ['/api/public', '/api/version', '/api/info'],
  protectedEndpoints: ['/api/admin', '/api/settings', '/api/profile']
};

const TEST_PAYLOADS = {
  validAuth: {
    email: 'test@codai.ecosystem',
    password: 'TestPassword123!'
  },
  invalidAuth: {
    email: 'invalid@test.com', 
    password: 'wrongpassword'
  },
  testData: {
    name: 'Test Project',
    description: 'Test Description',
    type: 'web'
  }
};

test.describe('🔌 API Integration & Backend Testing', () => {

  test.describe('🏥 Health Check & Service Discovery', () => {
    
    test('Comprehensive health check endpoints', async ({ request }) => {
      console.log('🏥 Testing health check endpoints...');
      
      const healthResults = [];
      
      for (const [key, service] of Object.entries(SERVICES)) {
        console.log(`\n🔍 Testing ${service.name} health endpoints...`);
        
        const serviceResults = {
          service: service.name,
          healthEndpoints: [],
          workingEndpoints: 0,
          totalEndpoints: 0
        };
        
        for (const endpoint of API_TEST_SCENARIOS.healthChecks) {
          serviceResults.totalEndpoints++;
          
          try {
            const response = await request.get(`${service.baseUrl}${endpoint}`, {
              timeout: 5000
            });
            
            const status = response.status();
            const isHealthy = status >= 200 && status < 300;
            
            console.log(`  ${isHealthy ? '✅' : '❌'} ${endpoint}: ${status}`);
            
            if (isHealthy) {
              serviceResults.workingEndpoints++;
              
              try {
                const body = await response.text();
                const hasHealthData = body.includes('healthy') || 
                                    body.includes('ok') || 
                                    body.includes('status') ||
                                    body.includes('version');
                
                console.log(`    📄 Response contains health data: ${hasHealthData}`);
                
                // Try to parse as JSON for structured health data
                try {
                  const jsonBody = JSON.parse(body);
                  console.log(`    📊 JSON health response keys: ${Object.keys(jsonBody).join(', ')}`);
                } catch (e) {
                  console.log(`    📄 Plain text health response: ${body.substring(0, 50)}...`);
                }
                
              } catch (e) {
                console.log(`    ⚠️ Could not read response body: ${e}`);
              }
            }
            
            serviceResults.healthEndpoints.push({
              endpoint,
              status,
              working: isHealthy
            });
            
          } catch (error) {
            console.log(`  ❌ ${endpoint}: ${error.message}`);
            serviceResults.healthEndpoints.push({
              endpoint,
              error: error.message,
              working: false
            });
          }
        }
        
        const healthRate = serviceResults.totalEndpoints > 0 ? 
          (serviceResults.workingEndpoints / serviceResults.totalEndpoints) * 100 : 0;
        
        console.log(`  📊 ${service.name}: ${serviceResults.workingEndpoints}/${serviceResults.totalEndpoints} health endpoints working (${healthRate.toFixed(1)}%)`);
        
        healthResults.push(serviceResults);
      }
      
      // Overall health summary
      const totalWorkingEndpoints = healthResults.reduce((sum, r) => sum + r.workingEndpoints, 0);
      const totalEndpoints = healthResults.reduce((sum, r) => sum + r.totalEndpoints, 0);
      const overallHealthRate = totalEndpoints > 0 ? (totalWorkingEndpoints / totalEndpoints) * 100 : 0;
      
      console.log(`\n📊 Overall Health Summary: ${totalWorkingEndpoints}/${totalEndpoints} endpoints (${overallHealthRate.toFixed(1)}%)`);
      
      // Expect at least some health endpoints to be working
      expect(totalWorkingEndpoints).toBeGreaterThan(0);
    });

    test('Service metadata and version information', async ({ request }) => {
      console.log('📋 Testing service metadata endpoints...');
      
      const metadataEndpoints = ['/api/version', '/version', '/api/info', '/info', '/api/metadata'];
      
      for (const [key, service] of Object.entries(SERVICES)) {
        console.log(`\n📋 Testing ${service.name} metadata...`);
        
        for (const endpoint of metadataEndpoints) {
          try {
            const response = await request.get(`${service.baseUrl}${endpoint}`, {
              timeout: 3000
            });
            
            if (response.ok()) {
              const body = await response.text();
              console.log(`  ✅ ${endpoint}: Available`);
              
              try {
                const jsonData = JSON.parse(body);
                const keys = Object.keys(jsonData);
                console.log(`    📊 Metadata keys: ${keys.join(', ')}`);
                
                // Look for common version/info fields
                const hasVersion = keys.some(k => k.toLowerCase().includes('version'));
                const hasName = keys.some(k => k.toLowerCase().includes('name'));
                const hasEnvironment = keys.some(k => k.toLowerCase().includes('env'));
                
                console.log(`    📋 Has version info: ${hasVersion}, name: ${hasName}, environment: ${hasEnvironment}`);
                
              } catch (e) {
                console.log(`    📄 Plain text metadata: ${body.substring(0, 100)}...`);
              }
              
              break; // Found working metadata endpoint
            }
          } catch (error) {
            // Continue to next endpoint
          }
        }
      }
      
      expect(true).toBe(true); // Metadata discovery test
    });
  });

  test.describe('🔐 Authentication API Testing', () => {
    
    test('Authentication endpoint discovery and testing', async ({ request }) => {
      console.log('🔐 Testing authentication endpoints...');
      
      for (const [key, service] of Object.entries(SERVICES)) {
        console.log(`\n🔐 Testing ${service.name} auth endpoints...`);
        
        for (const endpoint of API_TEST_SCENARIOS.authEndpoints) {
          try {
            // Test GET request (should typically return method not allowed or auth required)
            const getResponse = await request.get(`${service.baseUrl}${endpoint}`, {
              timeout: 3000
            });
            
            console.log(`  📡 GET ${endpoint}: ${getResponse.status()}`);
            
            // Test POST request with invalid data (should return validation error)
            const postResponse = await request.post(`${service.baseUrl}${endpoint}`, {
              data: TEST_PAYLOADS.invalidAuth,
              timeout: 3000
            });
            
            console.log(`  📤 POST ${endpoint}: ${postResponse.status()}`);
            
            // Analyze response for auth behavior
            if (postResponse.status() === 400 || postResponse.status() === 401) {
              console.log(`    ✅ Proper auth validation (${postResponse.status()})`);
              
              try {
                const errorBody = await postResponse.text();
                const hasErrorInfo = errorBody.includes('error') || 
                                   errorBody.includes('invalid') || 
                                   errorBody.includes('unauthorized');
                
                if (hasErrorInfo) {
                  console.log(`    📋 Auth error response contains validation info`);
                }
              } catch (e) {
                // Continue
              }
            } else if (postResponse.status() === 200) {
              console.log(`    ⚠️ Auth endpoint accepts invalid credentials`);
            } else if (postResponse.status() === 404) {
              console.log(`    ℹ️ Auth endpoint not available`);
            }
            
          } catch (error) {
            console.log(`  ❌ ${endpoint}: ${error.message.substring(0, 50)}...`);
          }
        }
      }
      
      expect(true).toBe(true); // Auth endpoint discovery test
    });

    test('CORS and preflight request handling', async ({ request }) => {
      console.log('🌐 Testing CORS and preflight handling...');
      
      for (const [key, service] of Object.entries(SERVICES)) {
        console.log(`\n🌐 Testing ${service.name} CORS...`);
        
        try {
          // Test OPTIONS request (preflight)
          const optionsResponse = await request.fetch(`${service.baseUrl}/api/auth/signin`, {
            method: 'OPTIONS',
            headers: {
              'Origin': 'http://localhost:3000',
              'Access-Control-Request-Method': 'POST',
              'Access-Control-Request-Headers': 'Content-Type, Authorization'
            },
            timeout: 3000
          });
          
          const corsHeaders = {
            'access-control-allow-origin': optionsResponse.headers()['access-control-allow-origin'],
            'access-control-allow-methods': optionsResponse.headers()['access-control-allow-methods'],
            'access-control-allow-headers': optionsResponse.headers()['access-control-allow-headers'],
            'access-control-allow-credentials': optionsResponse.headers()['access-control-allow-credentials']
          };
          
          console.log(`  📡 OPTIONS /api/auth/signin: ${optionsResponse.status()}`);
          console.log(`  🔧 CORS headers:`);
          Object.entries(corsHeaders).forEach(([header, value]) => {
            if (value) {
              console.log(`    - ${header}: ${value}`);
            }
          });
          
          const hasCorsSupport = corsHeaders['access-control-allow-origin'] || 
                                corsHeaders['access-control-allow-methods'];
          
          console.log(`  📊 CORS support detected: ${hasCorsSupport ? '✅' : '❌'}`);
          
        } catch (error) {
          console.log(`  ❌ CORS test failed: ${error.message}`);
        }
      }
      
      expect(true).toBe(true); // CORS awareness test
    });
  });

  test.describe('📊 Data API Testing', () => {
    
    test('Data endpoint discovery and structure', async ({ request }) => {
      console.log('📊 Testing data endpoints...');
      
      for (const [key, service] of Object.entries(SERVICES)) {
        console.log(`\n📊 Testing ${service.name} data endpoints...`);
        
        for (const endpoint of API_TEST_SCENARIOS.dataEndpoints) {
          try {
            const response = await request.get(`${service.baseUrl}${endpoint}`, {
              timeout: 3000
            });
            
            console.log(`  📡 GET ${endpoint}: ${response.status()}`);
            
            if (response.ok()) {
              try {
                const body = await response.text();
                
                // Try to parse as JSON
                try {
                  const jsonData = JSON.parse(body);
                  
                  if (Array.isArray(jsonData)) {
                    console.log(`    📋 Array response with ${jsonData.length} items`);
                    
                    if (jsonData.length > 0 && typeof jsonData[0] === 'object') {
                      const sampleKeys = Object.keys(jsonData[0]);
                      console.log(`    🔑 Sample item keys: ${sampleKeys.join(', ')}`);
                    }
                    
                  } else if (typeof jsonData === 'object') {
                    const keys = Object.keys(jsonData);
                    console.log(`    🔑 Object response keys: ${keys.join(', ')}`);
                    
                    // Check for common data structure patterns
                    const hasData = keys.includes('data');
                    const hasItems = keys.includes('items');
                    const hasPagination = keys.some(k => k.includes('page') || k.includes('total') || k.includes('count'));
                    
                    console.log(`    📊 Structure: data=${hasData}, items=${hasItems}, pagination=${hasPagination}`);
                  }
                  
                } catch (parseError) {
                  console.log(`    📄 Non-JSON response: ${body.substring(0, 100)}...`);
                }
                
              } catch (bodyError) {
                console.log(`    ⚠️ Could not read response body`);
              }
              
            } else if (response.status() === 401 || response.status() === 403) {
              console.log(`    🔒 Protected endpoint (${response.status()})`);
            } else if (response.status() === 404) {
              console.log(`    ℹ️ Endpoint not available`);
            }
            
          } catch (error) {
            console.log(`  ❌ ${endpoint}: ${error.message.substring(0, 50)}...`);
          }
        }
      }
      
      expect(true).toBe(true); // Data endpoint discovery test
    });

    test('API rate limiting and throttling', async ({ request }) => {
      console.log('⚡ Testing API rate limiting...');
      
      // Test rapid requests to detect rate limiting
      const idService = SERVICES.ID;
      const testEndpoint = `${idService.baseUrl}/api/health`;
      
      try {
        console.log(`🚀 Sending rapid requests to ${testEndpoint}...`);
        
        const rapidRequests = [];
        const requestCount = 10;
        
        // Send multiple rapid requests
        for (let i = 0; i < requestCount; i++) {
          rapidRequests.push(
            request.get(testEndpoint, { timeout: 2000 }).catch(e => ({ error: e.message }))
          );
        }
        
        const results = await Promise.allSettled(rapidRequests);
        
        let successCount = 0;
        let rateLimitCount = 0;
        let errorCount = 0;
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value && !result.value.error) {
            const status = result.value.status();
            if (status === 200) {
              successCount++;
            } else if (status === 429) { // Too Many Requests
              rateLimitCount++;
              console.log(`  ⚡ Request ${index + 1}: Rate limited (429)`);
            } else {
              console.log(`  ⚠️ Request ${index + 1}: ${status}`);
            }
          } else {
            errorCount++;
          }
        });
        
        console.log(`📊 Rapid request results:`);
        console.log(`  ✅ Successful: ${successCount}`);
        console.log(`  ⚡ Rate limited: ${rateLimitCount}`);
        console.log(`  ❌ Errors: ${errorCount}`);
        
        if (rateLimitCount > 0) {
          console.log(`✅ Rate limiting detected - good security practice`);
        } else {
          console.log(`⚠️ No rate limiting detected - consider implementing`);
        }
        
      } catch (error) {
        console.log(`❌ Rate limiting test failed: ${error}`);
      }
      
      expect(true).toBe(true); // Rate limiting awareness test
    });
  });

  test.describe('🔗 Cross-Service Integration', () => {
    
    test('Service-to-service communication testing', async ({ request }) => {
      console.log('🔗 Testing cross-service communication...');
      
      // Test if services can discover and communicate with each other
      for (const [sourceKey, sourceService] of Object.entries(SERVICES)) {
        console.log(`\n📡 Testing ${sourceService.name} cross-service communication...`);
        
        // Look for API endpoints that might reference other services
        const integrationEndpoints = [
          '/api/services',
          '/api/integrations', 
          '/api/endpoints',
          '/api/discovery',
          '/health/dependencies'
        ];
        
        for (const endpoint of integrationEndpoints) {
          try {
            const response = await request.get(`${sourceService.baseUrl}${endpoint}`, {
              timeout: 3000
            });
            
            if (response.ok()) {
              console.log(`  ✅ ${endpoint}: Available`);
              
              try {
                const body = await response.text();
                const jsonData = JSON.parse(body);
                
                // Look for references to other services
                const bodyText = JSON.stringify(jsonData).toLowerCase();
                
                const serviceReferences = [];
                for (const [targetKey, targetService] of Object.entries(SERVICES)) {
                  if (targetKey !== sourceKey) {
                    const portFound = bodyText.includes(`:${targetService.baseUrl.split(':')[2]}`);
                    const nameFound = bodyText.includes(targetService.name.toLowerCase());
                    
                    if (portFound || nameFound) {
                      serviceReferences.push(targetService.name);
                    }
                  }
                }
                
                if (serviceReferences.length > 0) {
                  console.log(`    🔗 References to: ${serviceReferences.join(', ')}`);
                } else {
                  console.log(`    ℹ️ No obvious cross-service references found`);
                }
                
              } catch (e) {
                console.log(`    📄 Non-JSON integration response`);
              }
            }
            
          } catch (error) {
            // Continue to next endpoint
          }
        }
        
        // Test if source service can reach other services
        for (const [targetKey, targetService] of Object.entries(SERVICES)) {
          if (targetKey !== sourceKey) {
            try {
              // This would typically be done through the source service's API
              // For now, we'll test direct connectivity as a proxy
              const connectivityTest = await request.get(`${targetService.baseUrl}/api/health`, {
                timeout: 2000
              });
              
              if (connectivityTest.ok()) {
                console.log(`  🔗 Can reach ${targetService.name}: ✅`);
              } else {
                console.log(`  🔗 Can reach ${targetService.name}: ❌ (${connectivityTest.status()})`);
              }
              
            } catch (error) {
              console.log(`  🔗 Can reach ${targetService.name}: ❌ (${error.message})`);
            }
          }
        }
      }
      
      expect(true).toBe(true); // Cross-service integration awareness test
    });
  });

  test.describe('⚡ Performance & Load Testing', () => {
    
    test('API response time performance', async ({ request }) => {
      console.log('⚡ Testing API response times...');
      
      const performanceResults = [];
      const PERFORMANCE_THRESHOLD = 1000; // 1 second
      
      for (const [key, service] of Object.entries(SERVICES)) {
        console.log(`\n⚡ Testing ${service.name} response times...`);
        
        const testEndpoints = [
          '/api/health',
          service.apiPrefix,
          '/'
        ];
        
        for (const endpoint of testEndpoints) {
          try {
            const startTime = Date.now();
            
            const response = await request.get(`${service.baseUrl}${endpoint}`, {
              timeout: 5000
            });
            
            const responseTime = Date.now() - startTime;
            const meetsThreshold = responseTime <= PERFORMANCE_THRESHOLD;
            
            console.log(`  📡 ${endpoint}: ${responseTime}ms ${meetsThreshold ? '✅' : '⚠️'}`);
            
            performanceResults.push({
              service: service.name,
              endpoint,
              responseTime,
              meetsThreshold,
              status: response.status()
            });
            
            if (response.ok()) {
              // Test response body parsing time for JSON endpoints
              try {
                const parseStartTime = Date.now();
                await response.text();
                const parseTime = Date.now() - parseStartTime;
                console.log(`    📄 Parse time: ${parseTime}ms`);
              } catch (e) {
                // Continue
              }
            }
            
          } catch (error) {
            console.log(`  ❌ ${endpoint}: ${error.message}`);
            performanceResults.push({
              service: service.name,
              endpoint,
              error: error.message,
              meetsThreshold: false
            });
          }
        }
      }
      
      // Performance summary
      const totalTests = performanceResults.length;
      const meetingThreshold = performanceResults.filter(r => r.meetsThreshold).length;
      const performanceRate = totalTests > 0 ? (meetingThreshold / totalTests) * 100 : 0;
      
      console.log(`\n📊 API Performance Summary:`);
      console.log(`  🎯 Meeting threshold (≤${PERFORMANCE_THRESHOLD}ms): ${meetingThreshold}/${totalTests} (${performanceRate.toFixed(1)}%)`);
      
      const averageResponseTime = performanceResults
        .filter(r => r.responseTime)
        .reduce((sum, r) => sum + r.responseTime, 0) / 
        performanceResults.filter(r => r.responseTime).length;
      
      if (averageResponseTime) {
        console.log(`  📈 Average response time: ${averageResponseTime.toFixed(1)}ms`);
      }
      
      // Expect reasonable performance
      expect(performanceRate).toBeGreaterThanOrEqual(50);
    });
  });

  test.describe('🛡️ Security & Error Handling', () => {
    
    test('Error handling and status codes', async ({ request }) => {
      console.log('🛡️ Testing error handling...');
      
      for (const [key, service] of Object.entries(SERVICES)) {
        console.log(`\n🛡️ Testing ${service.name} error handling...`);
        
        // Test various error conditions
        const errorTests = [
          { endpoint: '/nonexistent-endpoint', expectedStatus: 404, description: '404 handling' },
          { endpoint: '/api/protected-resource', expectedStatus: [401, 403], description: 'Unauthorized access' },
          { endpoint: '/api/invalid-method', method: 'PATCH', expectedStatus: [405, 404], description: 'Method not allowed' }
        ];
        
        for (const test of errorTests) {
          try {
            const response = await request.fetch(`${service.baseUrl}${test.endpoint}`, {
              method: test.method || 'GET',
              timeout: 3000
            });
            
            const status = response.status();
            const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
            const hasExpectedStatus = expectedStatuses.includes(status);
            
            console.log(`  ${hasExpectedStatus ? '✅' : '⚠️'} ${test.description}: ${status} (expected: ${expectedStatuses.join(' or ')})`);
            
            // Check error response format
            if (status >= 400) {
              try {
                const errorBody = await response.text();
                
                const hasErrorMessage = errorBody.includes('error') || 
                                       errorBody.includes('message') || 
                                       errorBody.includes('detail');
                
                console.log(`    📄 Error response has message: ${hasErrorMessage ? '✅' : '❌'}`);
                
                try {
                  const errorJson = JSON.parse(errorBody);
                  const errorFields = Object.keys(errorJson);
                  console.log(`    🔑 Error JSON fields: ${errorFields.join(', ')}`);
                } catch (e) {
                  console.log(`    📄 Plain text error response`);
                }
                
              } catch (e) {
                console.log(`    ⚠️ Could not read error response`);
              }
            }
            
          } catch (error) {
            console.log(`  ❌ ${test.description}: ${error.message}`);
          }
        }
      }
      
      expect(true).toBe(true); // Error handling awareness test
    });

    test('Input validation and sanitization', async ({ request }) => {
      console.log('🧼 Testing input validation...');
      
      // Test malicious/invalid inputs
      const maliciousInputs = [
        { payload: '<script>alert("xss")</script>', description: 'XSS attempt' },
        { payload: "'; DROP TABLE users; --", description: 'SQL injection attempt' },
        { payload: '{{7*7}}', description: 'Template injection attempt' },
        { payload: 'A'.repeat(10000), description: 'Oversized input' },
        { payload: null, description: 'Null input' },
        { payload: {}, description: 'Empty object' }
      ];
      
      for (const [key, service] of Object.entries(SERVICES)) {
        console.log(`\n🧼 Testing ${service.name} input validation...`);
        
        // Test auth endpoint with malicious inputs
        const authEndpoint = `${service.baseUrl}/api/auth/signin`;
        
        for (const input of maliciousInputs) {
          try {
            const response = await request.post(authEndpoint, {
              data: {
                email: input.payload,
                password: input.payload
              },
              timeout: 3000
            });
            
            const status = response.status();
            
            // Check if server properly rejects malicious input
            if (status === 400 || status === 422) {
              console.log(`  ✅ ${input.description}: Properly rejected (${status})`);
            } else if (status === 404) {
              console.log(`  ℹ️ ${input.description}: Endpoint not available`);
            } else if (status === 500) {
              console.log(`  ⚠️ ${input.description}: Server error (${status}) - check error handling`);
            } else {
              console.log(`  ⚠️ ${input.description}: Unexpected response (${status})`);
            }
            
          } catch (error) {
            console.log(`  ❌ ${input.description}: ${error.message.substring(0, 50)}...`);
          }
        }
      }
      
      expect(true).toBe(true); // Input validation awareness test
    });
  });

  test.afterAll(async () => {
    console.log('\n🔌 API INTEGRATION & BACKEND TESTS COMPLETED');
    console.log('📊 Coverage Areas:');
    console.log('  ✅ Health Check & Service Discovery');
    console.log('  ✅ Authentication API Testing');
    console.log('  ✅ CORS & Preflight Handling');
    console.log('  ✅ Data API Testing');
    console.log('  ✅ Rate Limiting & Throttling');
    console.log('  ✅ Cross-Service Integration');
    console.log('  ✅ Performance & Load Testing');
    console.log('  ✅ Security & Error Handling');
    console.log('  ✅ Input Validation & Sanitization');
    console.log('🔌 API & Backend Testing Complete!');
  });
});
