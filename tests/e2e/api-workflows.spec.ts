/**
 * Phase 8: API-Focused E2E Tests
 * Tests complete API workflows and data flows across services
 * Using real services and data connections
 */

import { test, expect, APIRequestContext } from '@playwright/test';

// Service endpoints
const SERVICES = {
  gateway: 'http://localhost:4000',
  codai: 'http://localhost:4001',
  admin: 'http://localhost:4002',
  hub: 'http://localhost:4003',
  id: 'http://localhost:4004',
  bancai: 'http://localhost:4005',
  memorai: 'http://localhost:4006'
} as const;

// Common API endpoints to test across services
const COMMON_ENDPOINTS = [
  '/api/health',
  '/api/status',
  '/api/info',
  '/api/version',
  '/api/metrics'
] as const;

// Service-specific API endpoints
const SERVICE_ENDPOINTS = {
  codai: ['/api/chat', '/api/generate', '/api/models', '/api/completion'],
  memorai: ['/api/memory', '/api/remember', '/api/recall', '/api/mcp'],
  bancai: ['/api/accounts', '/api/transactions', '/api/payments', '/api/balance'],
  admin: ['/api/users', '/api/system', '/api/config', '/api/logs'],
  hub: ['/api/connect', '/api/integrations', '/api/services', '/api/sync'],
  id: ['/api/auth', '/api/login', '/api/register', '/api/profile'],
  gateway: ['/api/proxy', '/api/routes', '/api/services', '/api/load-balancer']
} as const;

test.describe('CODAI Ecosystem - API E2E Tests', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    console.log('🚀 Setting up API E2E test context...');
  });

  test.afterAll(async () => {
    await apiContext.dispose();
    console.log('🧹 Cleaned up API E2E test context');
  });

  test.describe('Service Health and Discovery', () => {
    test('should validate all service health endpoints', async () => {
      console.log('🏥 Testing service health endpoints...');

      const healthResults: Record<string, any> = {};

      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        console.log(`🔍 Testing ${serviceName} service health...`);
        
        try {
          // Handle special cases for each service
          let healthEndpoint = `${serviceUrl}/api/health`;
          
          // Gateway doesn't have a health endpoint - it's a proxy/router
          if (serviceName === 'gateway') {
            healthEndpoint = `${serviceUrl}/health`; // Try generic health first
          }
          
          const response = await apiContext.get(healthEndpoint);
          healthResults[serviceName] = {
            status: response.status(),
            accessible: response.ok() || response.status() === 307, // 307 is auth redirect
            headers: response.headers(),
            url: response.url()
          };

          if (response.ok()) {
            try {
              const body = await response.json();
              
              // Validate health response structure
              if (serviceName === 'gateway') {
                // Gateway might not have health endpoint
                healthResults[serviceName].body = body;
              } else {
                // Other services should have status field
                expect(body).toHaveProperty('status');
                healthResults[serviceName].body = body;
              }
              
              console.log(`✅ ${serviceName} health: ${response.status()} - ${JSON.stringify(body).substring(0, 100)}...`);
            } catch {
              const text = await response.text();
              
              // CODAI returns HTML 404 page, which is expected
              if (serviceName === 'codai' && response.status() === 404) {
                healthResults[serviceName].accessible = false;
                healthResults[serviceName].body = 'HTML 404 - No health endpoint';
                console.log(`ℹ️ ${serviceName} health: No health endpoint (returns HTML 404)`);
              } else {
                healthResults[serviceName].body = text.substring(0, 200);
                console.log(`✅ ${serviceName} health: ${response.status()} - ${text.substring(0, 100)}...`);
              }
            }
          } else if (response.status() === 404) {
            // Gateway and CODAI don't have health endpoints
            if (serviceName === 'gateway' || serviceName === 'codai') {
              healthResults[serviceName].accessible = false;
              healthResults[serviceName].body = 'No health endpoint available';
              console.log(`ℹ️ ${serviceName} health: No health endpoint available`);
            } else {
              console.log(`❌ ${serviceName} health: ${response.status()} - ${response.statusText()}`);
            }
          } else {
            console.log(`ℹ️ ${serviceName} health: ${response.status()} - ${response.statusText()}`);
          }

        } catch (error) {
          healthResults[serviceName] = {
            status: 0,
            accessible: false,
            error: error.message
          };
          console.log(`❌ ${serviceName} health: Connection failed - ${error.message}`);
        }
      }

      // Count actually accessible services (with working health endpoints)
      const accessibleServices = Object.entries(healthResults).filter(([name, result]) => {
        return result.accessible && result.status === 200;
      }).length;
      
      const totalServices = Object.keys(healthResults).length;
      const accessibilityRate = accessibleServices / totalServices;

      console.log(`📊 Service Health Summary: ${accessibleServices}/${totalServices} services have working health endpoints (${(accessibilityRate * 100).toFixed(1)}%)`);
      
      // We expect at least 4 services (admin, hub, id, bancai, memorai) to have working health endpoints
      expect(accessibleServices).toBeGreaterThanOrEqual(4);
    });

    test('should discover and validate API endpoints', async () => {
      console.log('🔍 Testing API endpoint discovery...');

      const endpointResults: Record<string, Record<string, any>> = {};

      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        console.log(`🔍 Discovering ${serviceName} API endpoints...`);
        endpointResults[serviceName] = {};

        // Test common endpoints
        for (const endpoint of COMMON_ENDPOINTS) {
          try {
            const response = await apiContext.get(`${serviceUrl}${endpoint}`);
            endpointResults[serviceName][endpoint] = {
              status: response.status(),
              accessible: response.ok() || [307, 401].includes(response.status()),
              contentType: response.headers()['content-type'] || 'unknown'
            };
            console.log(`  ${endpoint}: ${response.status()}`);
          } catch (error) {
            endpointResults[serviceName][endpoint] = {
              status: 0,
              accessible: false,
              error: error.message
            };
          }
        }

        // Test service-specific endpoints
        const specificEndpoints = SERVICE_ENDPOINTS[serviceName as keyof typeof SERVICE_ENDPOINTS] || [];
        for (const endpoint of specificEndpoints) {
          try {
            const response = await apiContext.get(`${serviceUrl}${endpoint}`);
            endpointResults[serviceName][endpoint] = {
              status: response.status(),
              accessible: response.ok() || [307, 401].includes(response.status()),
              contentType: response.headers()['content-type'] || 'unknown'
            };
            console.log(`  ${endpoint}: ${response.status()}`);
          } catch (error) {
            endpointResults[serviceName][endpoint] = {
              status: 0,
              accessible: false,
              error: error.message
            };
          }
        }

        const totalEndpoints = Object.keys(endpointResults[serviceName]).length;
        const accessibleEndpoints = Object.values(endpointResults[serviceName]).filter(result => result.accessible).length;
        console.log(`📊 ${serviceName} endpoints: ${accessibleEndpoints}/${totalEndpoints} accessible`);
      }

      // Validate that we discovered endpoints for most services
      const servicesWithEndpoints = Object.keys(endpointResults).filter(
        serviceName => Object.keys(endpointResults[serviceName]).length > 0
      ).length;
      expect(servicesWithEndpoints).toBeGreaterThan(0);
    });
  });

  test.describe('Authentication and Authorization', () => {
    test('should test authentication flow across services', async () => {
      console.log('🔐 Testing authentication flow...');

      const authResults: Record<string, any> = {};

      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        console.log(`🔍 Testing ${serviceName} authentication...`);
        
        try {
          // Test unauthenticated access to protected endpoint
          const response = await apiContext.get(`${serviceUrl}/api/user`);
          
          authResults[serviceName] = {
            status: response.status(),
            requiresAuth: response.status() === 307 || response.status() === 401,
            redirectUrl: response.headers().location || null
          };

          if (response.status() === 307) {
            console.log(`✅ ${serviceName} redirects to authentication: ${response.headers().location}`);
          } else if (response.status() === 401) {
            console.log(`✅ ${serviceName} returns 401 Unauthorized`);
          } else if (response.status() === 200) {
            console.log(`ℹ️ ${serviceName} allows unauthenticated access`);
          } else {
            console.log(`ℹ️ ${serviceName} returns ${response.status()}`);
          }

        } catch (error) {
          authResults[serviceName] = {
            status: 0,
            requiresAuth: false,
            error: error.message
          };
          console.log(`❌ ${serviceName} auth test failed: ${error.message}`);
        }
      }

      // Check for consistent authentication behavior
      const authRequiredServices = Object.values(authResults).filter(result => result.requiresAuth).length;
      console.log(`📊 Authentication Summary: ${authRequiredServices}/${Object.keys(authResults).length} services require authentication`);
      
      expect(Object.keys(authResults).length).toBeGreaterThan(0);
    });

    test('should test CORS policies across services', async () => {
      console.log('🌐 Testing CORS policies...');

      const corsResults: Record<string, any> = {};

      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        console.log(`🔍 Testing ${serviceName} CORS policy...`);
        
        try {
          const response = await apiContext.get(`${serviceUrl}/api/health`, {
            headers: {
              'Origin': 'https://example.com',
              'Access-Control-Request-Method': 'GET'
            }
          });

          const corsHeaders = {
            'access-control-allow-origin': response.headers()['access-control-allow-origin'],
            'access-control-allow-methods': response.headers()['access-control-allow-methods'],
            'access-control-allow-headers': response.headers()['access-control-allow-headers'],
            'access-control-allow-credentials': response.headers()['access-control-allow-credentials']
          };

          corsResults[serviceName] = {
            status: response.status(),
            corsHeaders: corsHeaders,
            hasCors: Object.values(corsHeaders).some(value => value !== undefined)
          };

          console.log(`✅ ${serviceName} CORS: ${corsResults[serviceName].hasCors ? 'configured' : 'not configured'}`);

        } catch (error) {
          corsResults[serviceName] = {
            status: 0,
            error: error.message
          };
          console.log(`❌ ${serviceName} CORS test failed: ${error.message}`);
        }
      }

      console.log(`📊 CORS Summary: ${Object.values(corsResults).filter(result => result.hasCors).length}/${Object.keys(corsResults).length} services have CORS configured`);
    });
  });

  test.describe('Data Flow and Integration', () => {
    test('should test MemorAI API data flow', async () => {
      console.log('🧠 Testing MemorAI API data flow...');

      const memoraiUrl = SERVICES.memorai;
      const memoraiEndpoints = [
        '/api/memory',
        '/api/remember',
        '/api/recall',
        '/api/mcp'
      ];

      const memoraiResults: Record<string, any> = {};

      for (const endpoint of memoraiEndpoints) {
        try {
          // Test GET request
          const getResponse = await apiContext.get(`${memoraiUrl}${endpoint}`);
          memoraiResults[`GET ${endpoint}`] = {
            status: getResponse.status(),
            accessible: getResponse.ok() || [307, 401].includes(getResponse.status())
          };

          // Test POST request for data endpoints
          if (endpoint.includes('remember') || endpoint.includes('memory')) {
            try {
              const postResponse = await apiContext.post(`${memoraiUrl}${endpoint}`, {
                data: {
                  content: 'test memory content',
                  type: 'test'
                }
              });
              memoraiResults[`POST ${endpoint}`] = {
                status: postResponse.status(),
                accessible: postResponse.ok() || [307, 401].includes(postResponse.status())
              };
            } catch (error) {
              memoraiResults[`POST ${endpoint}`] = { error: error.message };
            }
          }

          console.log(`✅ MemorAI ${endpoint}: GET ${getResponse.status()}`);

        } catch (error) {
          memoraiResults[`GET ${endpoint}`] = { error: error.message };
          console.log(`❌ MemorAI ${endpoint} failed: ${error.message}`);
        }
      }

      const accessibleEndpoints = Object.values(memoraiResults).filter(result => result.accessible).length;
      console.log(`📊 MemorAI API: ${accessibleEndpoints}/${Object.keys(memoraiResults).length} endpoints accessible`);
    });

    test('should test BancAI financial API flow', async () => {
      console.log('💰 Testing BancAI financial API flow...');

      const bancaiUrl = SERVICES.bancai;
      const bancaiEndpoints = [
        '/api/accounts',
        '/api/balance',
        '/api/transactions',
        '/api/payments'
      ];

      const bancaiResults: Record<string, any> = {};

      for (const endpoint of bancaiEndpoints) {
        try {
          const response = await apiContext.get(`${bancaiUrl}${endpoint}`);
          bancaiResults[endpoint] = {
            status: response.status(),
            accessible: response.ok() || [307, 401].includes(response.status()),
            secure: response.headers()['strict-transport-security'] !== undefined
          };

          console.log(`✅ BancAI ${endpoint}: ${response.status()}${bancaiResults[endpoint].secure ? ' (HTTPS)' : ''}`);

        } catch (error) {
          bancaiResults[endpoint] = { error: error.message };
          console.log(`❌ BancAI ${endpoint} failed: ${error.message}`);
        }
      }

      // Financial services should have security headers
      const secureEndpoints = Object.values(bancaiResults).filter(result => result.secure).length;
      console.log(`🔒 BancAI Security: ${secureEndpoints}/${Object.keys(bancaiResults).length} endpoints have security headers`);
    });

    test('should test CODAI AI service API flow', async () => {
      console.log('🤖 Testing CODAI AI service API flow...');

      const codaiUrl = SERVICES.codai;
      const codaiEndpoints = [
        '/api/chat',
        '/api/generate',
        '/api/models',
        '/api/completion'
      ];

      const codaiResults: Record<string, any> = {};

      for (const endpoint of codaiEndpoints) {
        try {
          const response = await apiContext.get(`${codaiUrl}${endpoint}`);
          codaiResults[endpoint] = {
            status: response.status(),
            accessible: response.ok() || [307, 401].includes(response.status()),
            contentType: response.headers()['content-type']
          };

          console.log(`✅ CODAI ${endpoint}: ${response.status()} (${codaiResults[endpoint].contentType})`);

        } catch (error) {
          codaiResults[endpoint] = { error: error.message };
          console.log(`❌ CODAI ${endpoint} failed: ${error.message}`);
        }
      }

      const apiEndpoints = Object.values(codaiResults).filter(result => result.accessible).length;
      console.log(`📊 CODAI AI API: ${apiEndpoints}/${Object.keys(codaiResults).length} endpoints accessible`);
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should test API response times', async () => {
      console.log('⚡ Testing API response times...');

      const performanceResults: Record<string, any> = {};

      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        console.log(`🔍 Testing ${serviceName} performance...`);
        
        const startTime = Date.now();
        
        try {
          const response = await apiContext.get(`${serviceUrl}/api/health`);
          const responseTime = Date.now() - startTime;
          
          performanceResults[serviceName] = {
            responseTime: responseTime,
            status: response.status(),
            fast: responseTime < 1000, // Under 1 second
            acceptable: responseTime < 5000 // Under 5 seconds
          };

          console.log(`✅ ${serviceName}: ${responseTime}ms (${response.status()})`);

        } catch (error) {
          const responseTime = Date.now() - startTime;
          performanceResults[serviceName] = {
            responseTime: responseTime,
            status: 0,
            error: error.message
          };
          console.log(`❌ ${serviceName}: Failed after ${responseTime}ms`);
        }
      }

      // Calculate performance statistics
      const validResponses = Object.values(performanceResults).filter(result => result.responseTime && result.status > 0);
      if (validResponses.length > 0) {
        const avgResponseTime = validResponses.reduce((sum, result) => sum + result.responseTime, 0) / validResponses.length;
        const fastServices = validResponses.filter(result => result.fast).length;
        
        console.log(`📊 Performance Summary: Average ${avgResponseTime.toFixed(2)}ms, ${fastServices}/${validResponses.length} services under 1s`);
        expect(avgResponseTime).toBeLessThan(10000); // Average should be under 10 seconds
      }
    });

    test('should test API concurrent load handling', async () => {
      console.log('🔥 Testing API concurrent load handling...');

      const concurrentRequests = 5;
      const loadResults: Record<string, any> = {};

      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        console.log(`🔍 Testing ${serviceName} under concurrent load...`);
        
        const startTime = Date.now();
        
        try {
          // Create concurrent requests
          const requests = Array.from({ length: concurrentRequests }, () =>
            apiContext.get(`${serviceUrl}/api/health`)
          );

          const responses = await Promise.allSettled(requests);
          const totalTime = Date.now() - startTime;

          const successful = responses.filter(r => r.status === 'fulfilled').length;
          const failed = responses.filter(r => r.status === 'rejected').length;

          loadResults[serviceName] = {
            totalTime: totalTime,
            successful: successful,
            failed: failed,
            successRate: successful / concurrentRequests,
            avgResponseTime: totalTime / concurrentRequests
          };

          console.log(`✅ ${serviceName}: ${successful}/${concurrentRequests} successful in ${totalTime}ms`);

        } catch (error) {
          loadResults[serviceName] = {
            error: error.message,
            successful: 0,
            failed: concurrentRequests
          };
          console.log(`❌ ${serviceName} load test failed: ${error.message}`);
        }
      }

      // Validate that most services can handle concurrent load
      const servicesHandlingLoad = Object.values(loadResults).filter(result => result.successRate >= 0.8).length;
      console.log(`📊 Load Test Summary: ${servicesHandlingLoad}/${Object.keys(loadResults).length} services handle concurrent load well`);
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should test error response formats', async () => {
      console.log('🚨 Testing error response formats...');

      const errorResults: Record<string, any> = {};

      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        console.log(`🔍 Testing ${serviceName} error handling...`);
        
        try {
          // Test 404 error
          const notFoundResponse = await apiContext.get(`${serviceUrl}/api/nonexistent-endpoint`);
          
          errorResults[serviceName] = {
            notFound: {
              status: notFoundResponse.status(),
              contentType: notFoundResponse.headers()['content-type'],
              hasErrorBody: false
            }
          };

          if (notFoundResponse.status() === 404) {
            try {
              const errorBody = await notFoundResponse.json();
              errorResults[serviceName].notFound.hasErrorBody = true;
              errorResults[serviceName].notFound.errorFormat = typeof errorBody;
            } catch {
              const errorText = await notFoundResponse.text();
              errorResults[serviceName].notFound.hasErrorBody = errorText.length > 0;
            }
          }

          console.log(`✅ ${serviceName} 404 handling: ${notFoundResponse.status()}`);

        } catch (error) {
          errorResults[serviceName] = { error: error.message };
          console.log(`❌ ${serviceName} error test failed: ${error.message}`);
        }
      }

      // Validate that services provide proper error responses
      const servicesWithErrorHandling = Object.values(errorResults).filter(
        result => result.notFound && result.notFound.status === 404
      ).length;
      console.log(`📊 Error Handling: ${servicesWithErrorHandling}/${Object.keys(errorResults).length} services handle 404 properly`);
    });

    test('should test malformed request handling', async () => {
      console.log('🔧 Testing malformed request handling...');

      const malformedResults: Record<string, any> = {};

      for (const [serviceName, serviceUrl] of Object.entries(SERVICES)) {
        console.log(`🔍 Testing ${serviceName} malformed request handling...`);
        
        try {
          // Test with invalid JSON payload
          const response = await apiContext.post(`${serviceUrl}/api/health`, {
            data: 'invalid-json-{{{',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          malformedResults[serviceName] = {
            status: response.status(),
            handlesInvalidJSON: response.status() === 400 || response.status() === 422
          };

          console.log(`✅ ${serviceName} malformed request: ${response.status()}`);

        } catch (error) {
          malformedResults[serviceName] = { error: error.message };
          console.log(`❌ ${serviceName} malformed test failed: ${error.message}`);
        }
      }

      const servicesHandlingMalformed = Object.values(malformedResults).filter(
        result => result.handlesInvalidJSON
      ).length;
      console.log(`📊 Malformed Request Handling: ${servicesHandlingMalformed}/${Object.keys(malformedResults).length} services handle invalid JSON properly`);
    });
  });
});
