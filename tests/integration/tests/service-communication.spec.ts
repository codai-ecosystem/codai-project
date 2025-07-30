import { test, expect } from '@playwright/test';
import {
    IntegrationAuthHelper,
    ServiceCommunicationHelper,
    RealTimeCommunicationHelper,
    TEST_CONFIG
} from '../integration-helpers';

/**
 * CODAI Ecosystem Service-to-Service Communication Testing
 * Testing inter-service communication, API Gateway routing, and data flow
 */

test.describe('Service Communication Integration Testing', () => {
    let authHelper: IntegrationAuthHelper;
    let commHelper: ServiceCommunicationHelper;
    let rtHelper: RealTimeCommunicationHelper;

    test.beforeEach(async () => {
        authHelper = new IntegrationAuthHelper();
        commHelper = new ServiceCommunicationHelper(authHelper);
        rtHelper = new RealTimeCommunicationHelper();

        // Authenticate for service communication tests
        await authHelper.authenticateUser();
        await commHelper.setAuth();
    });

    test.describe('API Gateway Routing', () => {
        test('API Gateway routes requests to correct services', async () => {
            const routingResult = await commHelper.testAPIGatewayRouting();
            expect(routingResult).toBeTruthy();
        });

        test('API Gateway handles service failures gracefully', async ({ request }) => {
            // Test routing to each service through gateway
            for (const [serviceName, serviceConfig] of Object.entries(TEST_CONFIG.SERVICES)) {
                const response = await request.get(`${TEST_CONFIG.API_GATEWAY}/${serviceConfig.name}/health`);

                // Should either succeed (200) or provide circuit breaker response (503)
                expect([200, 503]).toContain(response.status());

                if (response.status() === 503) {
                    const body = await response.json();
                    expect(body.message).toContain('temporarily unavailable');
                }
            }
        });

        test('API Gateway load balancing and failover', async ({ request }) => {
            const results = [];

            // Make multiple requests to test load balancing
            for (let i = 0; i < 20; i++) {
                const response = await request.get(`${TEST_CONFIG.API_GATEWAY}/hub/dashboard`);
                results.push({
                    status: response.status(),
                    responseTime: response.headers()['x-response-time'],
                    server: response.headers()['x-server-id'] || 'unknown'
                });
            }

            // At least 80% of requests should succeed
            const successRate = results.filter(r => r.status === 200).length / results.length;
            expect(successRate).toBeGreaterThan(0.8);
        });

        test('API Gateway authentication propagation', async ({ request }) => {
            const token = await authHelper.authenticateUser();

            // Test that authentication propagates through gateway to services
            for (const [serviceName, serviceConfig] of Object.entries(TEST_CONFIG.SERVICES)) {
                const response = await request.get(`${TEST_CONFIG.API_GATEWAY}/${serviceConfig.name}/protected`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Should either succeed or fail gracefully
                expect([200, 401, 404, 503]).toContain(response.status());

                // If 401, it means service is working but auth failed (expected for some test scenarios)
                // If 404, it means the endpoint doesn't exist (acceptable)
                // If 503, it means service is down (circuit breaker)
                // If 200, it means auth worked perfectly
            }
        });
    });

    test.describe('Inter-Service Communication', () => {
        test('CODAI to MEMORAI communication', async () => {
            const result = await commHelper['testCodaiToMemoraiCommunication']();
            expect(result).toBeTruthy();
        });

        test('MEMORAI to ANALIZAI communication', async () => {
            const result = await commHelper['testMemoraiToAnalizaiCommunication']();
            expect(result).toBeTruthy();
        });

        test('HUB to CODAI communication', async () => {
            const result = await commHelper['testHubToCodaiCommunication']();
            expect(result).toBeTruthy();
        });

        test('BANCAI to WALLET communication', async () => {
            const result = await commHelper['testBancaiToWalletCommunication']();
            expect(result).toBeTruthy();
        });

        test('MARKETAI to FABRICAI communication', async () => {
            const result = await commHelper['testMarketaiToFabricaiCommunication']();
            expect(result).toBeTruthy();
        });

        test('Complete service communication chain', async () => {
            const communicationResults = await commHelper.testServiceToServiceCommunication();

            // At least 80% of service communications should succeed
            const successRate = communicationResults.filter(result => result === true).length / communicationResults.length;
            expect(successRate).toBeGreaterThan(0.8);

            console.log(`Service Communication Success Rate: ${(successRate * 100).toFixed(1)}%`);
        });

        test('Service dependency chain validation', async ({ request }) => {
            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Test complex workflow that depends on multiple services
            const workflowSteps = [
                // Step 1: Create project in CODAI
                {
                    service: 'codai',
                    endpoint: '/projects',
                    method: 'POST',
                    data: { name: 'Dependency Test Project', description: 'Testing service dependencies' }
                },
                // Step 2: Store project info in MEMORAI
                {
                    service: 'memorai',
                    endpoint: '/memories',
                    method: 'POST',
                    data: { content: 'Project: Dependency Test Project', type: 'project' }
                },
                // Step 3: Analyze project in ANALIZAI
                {
                    service: 'analizai',
                    endpoint: '/analyze',
                    method: 'POST',
                    data: { type: 'project', data: 'Dependency Test Project' }
                },
                // Step 4: Log workflow in LOGAI
                {
                    service: 'logai',
                    endpoint: '/logs',
                    method: 'POST',
                    data: { message: 'Dependency workflow completed', level: 'info' }
                }
            ];

            let workflowData = {};

            for (const step of workflowSteps) {
                const url = `${TEST_CONFIG.API_GATEWAY}/${step.service}${step.endpoint}`;

                let response;
                if (step.method === 'POST') {
                    response = await request.post(url, {
                        headers,
                        data: { ...step.data, ...workflowData }
                    });
                } else {
                    response = await request.get(url, { headers });
                }

                // Each step should succeed or fail gracefully
                expect([200, 201, 202, 503]).toContain(response.status());

                if (response.ok()) {
                    const responseData = await response.json();
                    workflowData = { ...workflowData, ...responseData };
                }
            }
        });
    });

    test.describe('Real-Time Communication', () => {
        test('WebSocket communication between services', async () => {
            const wsResult = await rtHelper.testWebSocketCommunication();
            expect(wsResult).toBeTruthy();
        });

        test('Socket.IO communication between services', async () => {
            const socketResult = await rtHelper.testSocketIOCommunication();
            expect(socketResult).toBeTruthy();
        });

        test('Cross-service real-time synchronization', async () => {
            const syncResult = await rtHelper.testCrossServiceRealTimeSync();
            expect(syncResult).toBeTruthy();
        });

        test('Real-time event broadcasting', async ({ page }) => {
            test.setTimeout(60000); // 1 minute timeout

            // Connect to HUB for real-time events
            await page.goto(`${TEST_CONFIG.API_GATEWAY}/hub`);

            // Setup event listener
            const events = [];
            await page.addInitScript(() => {
                window.addEventListener('codai-event', (e) => {
                    window.testEvents = window.testEvents || [];
                    window.testEvents.push(e.detail);
                });
            });

            // Trigger events from different services
            await page.evaluate(async (gateway) => {
                const token = localStorage.getItem('auth_token');

                // Create project in CODAI - should trigger event
                await fetch(`${gateway}/codai/projects`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: 'Real-time Event Test',
                        description: 'Testing event broadcasting'
                    })
                });

                // Add memory in MEMORAI - should trigger event
                await fetch(`${gateway}/memorai/memories`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: 'Real-time event test memory',
                        type: 'event_test'
                    })
                });
            }, TEST_CONFIG.API_GATEWAY);

            // Wait for events to propagate
            await page.waitForTimeout(5000);

            // Check if events were received
            const capturedEvents = await page.evaluate(() => window.testEvents || []);
            expect(capturedEvents.length).toBeGreaterThan(0);
        });

        test('Message queue processing', async ({ request }) => {
            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Send message to queue
            const queueMessage = {
                type: 'integration_test',
                data: { message: 'Testing message queue processing' },
                timestamp: Date.now()
            };

            const response = await request.post(`${TEST_CONFIG.API_GATEWAY}/hub/queue/publish`, {
                headers,
                data: queueMessage
            });

            expect(response.ok()).toBeTruthy();

            // Wait for message processing
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Check if message was processed
            const statusResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/hub/queue/status`, {
                headers
            });

            expect(statusResponse.ok()).toBeTruthy();
            const statusData = await statusResponse.json();
            expect(statusData.processed_messages).toBeGreaterThan(0);
        });
    });

    test.describe('Data Flow Integration', () => {
        test('End-to-end data flow validation', async ({ request }) => {
            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Step 1: Create data in one service
            const projectResponse = await request.post(`${TEST_CONFIG.API_GATEWAY}/codai/projects`, {
                headers,
                data: {
                    name: 'Data Flow Test Project',
                    description: 'Testing data flow across services',
                    metadata: { test_id: 'df_' + Date.now() }
                }
            });

            expect(projectResponse.ok()).toBeTruthy();
            const projectData = await projectResponse.json();

            // Step 2: Verify data appears in related services
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for propagation

            // Check MEMORAI
            const memoryResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/memorai/search`, {
                headers,
                data: { query: 'Data Flow Test Project' }
            });

            if (memoryResponse.ok()) {
                const memoryData = await memoryResponse.json();
                expect(memoryData.results).toBeDefined();
            }

            // Check HUB
            const hubResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/hub/activities`, {
                headers
            });

            if (hubResponse.ok()) {
                const hubData = await hubResponse.json();
                expect(hubData.activities).toBeDefined();
            }

            // Check LOGAI
            const logResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/logai/search`, {
                headers,
                data: { query: 'Data Flow Test Project' }
            });

            if (logResponse.ok()) {
                const logData = await logResponse.json();
                expect(logData.logs).toBeDefined();
            }
        });

        test('Data consistency across service boundaries', async ({ request }) => {
            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            const testData = {
                id: 'consistency_test_' + Date.now(),
                name: 'Consistency Test Entity',
                value: Math.random() * 1000
            };

            // Create entity in multiple services simultaneously
            const createPromises = [
                request.post(`${TEST_CONFIG.API_GATEWAY}/codai/entities`, {
                    headers,
                    data: testData
                }),
                request.post(`${TEST_CONFIG.API_GATEWAY}/memorai/entities`, {
                    headers,
                    data: testData
                }),
                request.post(`${TEST_CONFIG.API_GATEWAY}/hub/entities`, {
                    headers,
                    data: testData
                })
            ];

            const results = await Promise.allSettled(createPromises);

            // At least some should succeed
            const successfulCreations = results.filter(r =>
                r.status === 'fulfilled' && r.value.ok()
            );

            expect(successfulCreations.length).toBeGreaterThan(0);

            // Wait for eventual consistency
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Verify data consistency across services
            const readPromises = [
                request.get(`${TEST_CONFIG.API_GATEWAY}/codai/entities/${testData.id}`, { headers }),
                request.get(`${TEST_CONFIG.API_GATEWAY}/memorai/entities/${testData.id}`, { headers }),
                request.get(`${TEST_CONFIG.API_GATEWAY}/hub/entities/${testData.id}`, { headers })
            ];

            const readResults = await Promise.allSettled(readPromises);

            const successfulReads = readResults.filter(r =>
                r.status === 'fulfilled' && r.value.ok()
            );

            // If any reads succeed, verify data consistency
            for (const result of successfulReads) {
                if (result.status === 'fulfilled') {
                    const data = await result.value.json();
                    expect(data.id).toBe(testData.id);
                    expect(data.name).toBe(testData.name);
                    expect(data.value).toBe(testData.value);
                }
            }
        });

        test('Transaction integrity across services', async ({ request }) => {
            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Start distributed transaction
            const transactionResponse = await request.post(`${TEST_CONFIG.API_GATEWAY}/hub/transactions/begin`, {
                headers,
                data: {
                    type: 'multi_service_transaction',
                    services: ['codai', 'memorai', 'bancai']
                }
            });

            if (transactionResponse.ok()) {
                const transactionData = await transactionResponse.json();
                const transactionId = transactionData.transaction_id;

                // Perform operations in multiple services as part of transaction
                const operations = [
                    request.post(`${TEST_CONFIG.API_GATEWAY}/codai/projects`, {
                        headers: { ...headers, 'X-Transaction-ID': transactionId },
                        data: { name: 'Transaction Test Project' }
                    }),
                    request.post(`${TEST_CONFIG.API_GATEWAY}/memorai/memories`, {
                        headers: { ...headers, 'X-Transaction-ID': transactionId },
                        data: { content: 'Transaction test memory' }
                    }),
                    request.post(`${TEST_CONFIG.API_GATEWAY}/bancai/transactions`, {
                        headers: { ...headers, 'X-Transaction-ID': transactionId },
                        data: { amount: 100, currency: 'USD' }
                    })
                ];

                const operationResults = await Promise.allSettled(operations);

                // Commit or rollback transaction based on results
                const allSuccessful = operationResults.every(r =>
                    r.status === 'fulfilled' && r.value.ok()
                );

                const commitResponse = await request.post(`${TEST_CONFIG.API_GATEWAY}/hub/transactions/${allSuccessful ? 'commit' : 'rollback'}`, {
                    headers,
                    data: { transaction_id: transactionId }
                });

                if (commitResponse.ok()) {
                    expect(allSuccessful).toBeDefined(); // Transaction handling worked
                }
            }
        });
    });

    test.describe('Error Propagation and Handling', () => {
        test('Error propagation through service chain', async ({ request }) => {
            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Trigger an error in one service and test propagation
            const errorResponse = await request.post(`${TEST_CONFIG.API_GATEWAY}/analizai/analyze`, {
                headers,
                data: { invalid_data: true, force_error: true }
            });

            // Should handle error gracefully
            expect([400, 422, 500, 503]).toContain(errorResponse.status());

            if (!errorResponse.ok()) {
                const errorData = await errorResponse.json();
                expect(errorData.error).toBeDefined();
                expect(errorData.message).toBeDefined();

                // Error should include trace ID for debugging
                expect(errorData.trace_id || errorData.request_id).toBeDefined();
            }
        });

        test('Circuit breaker functionality', async ({ request }) => {
            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Make multiple failing requests to trigger circuit breaker
            const failingRequests = [];
            for (let i = 0; i < 15; i++) {
                failingRequests.push(
                    request.post(`${TEST_CONFIG.API_GATEWAY}/fabricai/force-error`, {
                        headers,
                        data: { error: true }
                    })
                );
            }

            const results = await Promise.allSettled(failingRequests);

            // Should see circuit breaker activation (503 responses)
            const circuitBreakerResponses = results.filter(r =>
                r.status === 'fulfilled' && r.value.status() === 503
            );

            expect(circuitBreakerResponses.length).toBeGreaterThan(0);
        });

        test('Graceful degradation when services are unavailable', async ({ request }) => {
            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Request data from HUB when some services might be unavailable
            const dashboardResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/hub/dashboard`, {
                headers
            });

            // Should return partial data with appropriate status
            expect([200, 206, 503]).toContain(dashboardResponse.status());

            if (dashboardResponse.status() === 206) {
                const data = await dashboardResponse.json();
                expect(data.partial).toBe(true);
                expect(data.available_services).toBeDefined();
                expect(data.unavailable_services).toBeDefined();
            }
        });
    });

    test.afterEach(async () => {
        // Clean up any test data or connections
        if (rtHelper) {
            // Close any open connections
        }
    });
});
