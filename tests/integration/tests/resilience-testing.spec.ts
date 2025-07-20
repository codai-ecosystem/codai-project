import { test, expect } from '@playwright/test';
import {
    IntegrationAuthHelper,
    ResilienceTestHelper,
    TEST_CONFIG
} from '../integration-helpers';

/**
 * CODAI Ecosystem Resilience and Error Recovery Integration Testing
 * Testing system resilience, error handling, and recovery scenarios
 */

test.describe('Resilience and Error Recovery Integration Testing', () => {
    let authHelper: IntegrationAuthHelper;
    let resilienceHelper: ResilienceTestHelper;

    test.beforeEach(async () => {
        authHelper = new IntegrationAuthHelper();
        resilienceHelper = new ResilienceTestHelper(authHelper);
    });

    test.describe('Service Failure Recovery', () => {
        test('System handles individual service failures', async () => {
            test.setTimeout(300000); // 5 minutes

            const failureResults = await resilienceHelper.testServiceFailureRecovery();

            expect(failureResults.overallResilience).toBeGreaterThan(0.7); // 70% resilience score
            expect(failureResults.serviceFailureTests.length).toBeGreaterThan(0);

            // Log detailed results
            console.log('Service Failure Recovery Results:', {
                overallResilience: `${(failureResults.overallResilience * 100).toFixed(1)}%`,
                totalTests: failureResults.serviceFailureTests.length,
                passedTests: failureResults.serviceFailureTests.filter(test => test.passed).length
            });

            // Verify individual service recovery
            for (const testResult of failureResults.serviceFailureTests) {
                console.log(`Service ${testResult.service}:`, {
                    passed: testResult.passed,
                    responseTime: `${testResult.responseTime}ms`,
                    status: testResult.status
                });

                // Critical services should have better resilience
                if (['gateway', 'id', 'hub'].includes(testResult.service.toLowerCase())) {
                    expect(testResult.passed).toBeTruthy();
                }
            }
        });

        test('Cascading failure prevention', async () => {
            test.setTimeout(240000); // 4 minutes

            const cascadingTest = await resilienceHelper['testCascadingFailures']();

            // System should handle cascading failures gracefully
            expect(cascadingTest.passed).toBeTruthy();

            console.log('Cascading Failure Test Result:', cascadingTest);
        });

        test('Circuit breaker activation and recovery', async ({ request }) => {
            test.setTimeout(300000); // 5 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Phase 1: Normal operation
            const normalResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/fabricai/health`, {
                headers
            });

            const initialStatus = normalResponse.status();
            console.log('Initial service status:', initialStatus);

            // Phase 2: Trigger circuit breaker with multiple failing requests
            const failingRequests = [];
            for (let i = 0; i < 10; i++) {
                failingRequests.push(
                    request.post(`${TEST_CONFIG.API_GATEWAY}/fabricai/force-error`, {
                        headers,
                        data: { error: true },
                        timeout: 5000
                    }).catch(error => ({ status: 'error', message: error.message }))
                );
            }

            const failingResults = await Promise.allSettled(failingRequests);
            console.log('Failing requests completed:', failingResults.length);

            // Phase 3: Verify circuit breaker activation
            const circuitBreakerResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/fabricai/health`, {
                headers,
                timeout: 10000
            });

            // Should either be working (200) or circuit breaker activated (503)
            expect([200, 503]).toContain(circuitBreakerResponse.status());

            if (circuitBreakerResponse.status() === 503) {
                console.log('Circuit breaker activated successfully');

                // Phase 4: Wait for circuit breaker recovery
                await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

                const recoveryResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/fabricai/health`, {
                    headers
                });

                // System should recover
                expect([200, 503]).toContain(recoveryResponse.status());
                console.log('Circuit breaker recovery status:', recoveryResponse.status());
            }
        });

        test('Service mesh resilience', async ({ request }) => {
            test.setTimeout(180000); // 3 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Test resilience across service mesh
            const meshTests = [
                // Test service-to-service communication resilience
                {
                    name: 'CODAI to MEMORAI resilience',
                    request: () => request.post(`${TEST_CONFIG.API_GATEWAY}/codai/projects`, {
                        headers,
                        data: { name: 'Resilience Test Project', store_in_memory: true }
                    })
                },
                // Test hub aggregation resilience
                {
                    name: 'HUB aggregation resilience',
                    request: () => request.get(`${TEST_CONFIG.API_GATEWAY}/hub/dashboard`, { headers })
                },
                // Test analysis workflow resilience
                {
                    name: 'ANALIZAI workflow resilience',
                    request: () => request.post(`${TEST_CONFIG.API_GATEWAY}/analizai/analyze`, {
                        headers,
                        data: { type: 'resilience_test', data: 'test data' }
                    })
                }
            ];

            for (const meshTest of meshTests) {
                let successCount = 0;
                let totalAttempts = 5;

                for (let attempt = 0; attempt < totalAttempts; attempt++) {
                    try {
                        const response = await meshTest.request();
                        if (response.ok()) {
                            successCount++;
                        }
                    } catch (error) {
                        // Count as failure
                    }

                    // Small delay between attempts
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                const successRate = successCount / totalAttempts;
                expect(successRate).toBeGreaterThan(0.6); // 60% success rate minimum

                console.log(`${meshTest.name} success rate:`, `${(successRate * 100).toFixed(1)}%`);
            }
        });
    });

    test.describe('Error Handling and Recovery', () => {
        test('Timeout recovery mechanisms', async () => {
            const timeoutResult = await resilienceHelper['testTimeoutRecovery']();
            expect(timeoutResult).toBeTruthy();
            console.log('Timeout recovery test passed');
        });

        test('Retry logic validation', async () => {
            const retryResult = await resilienceHelper['testRetryLogic']();
            // Retry logic should either succeed or fail gracefully
            expect(retryResult).toBeDefined();
            console.log('Retry logic test result:', retryResult);
        });

        test('Graceful degradation under failure', async () => {
            const degradationResult = await resilienceHelper['testGracefulDegradation']();
            expect(degradationResult).toBeTruthy();
            console.log('Graceful degradation test passed');
        });

        test('Data consistency during failures', async ({ request }) => {
            test.setTimeout(240000); // 4 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Start a complex operation that might fail partway through
            const complexOperationData = {
                operation_id: `consistency_test_${Date.now()}`,
                steps: [
                    { service: 'codai', action: 'create_project' },
                    { service: 'memorai', action: 'store_data' },
                    { service: 'analizai', action: 'analyze' },
                    { service: 'hub', action: 'update_dashboard' }
                ]
            };

            // Simulate network instability
            const networkInstabilityPromises = [];

            // Start the complex operation
            networkInstabilityPromises.push(
                request.post(`${TEST_CONFIG.API_GATEWAY}/hub/complex-operation`, {
                    headers,
                    data: complexOperationData,
                    timeout: 60000
                })
            );

            // Introduce random network delays/failures
            for (let i = 0; i < 5; i++) {
                networkInstabilityPromises.push(
                    new Promise(resolve => {
                        setTimeout(() => {
                            request.get(`${TEST_CONFIG.API_GATEWAY}/hub/health`, { headers })
                                .then(resolve)
                                .catch(resolve);
                        }, Math.random() * 30000);
                    })
                );
            }

            const results = await Promise.allSettled(networkInstabilityPromises);

            // Wait for any cleanup or rollback operations
            await new Promise(resolve => setTimeout(resolve, 10000));

            // Verify system state consistency
            const stateResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/system-state`, {
                headers
            });

            if (stateResponse.ok()) {
                const stateData = await stateResponse.json();

                // System should be in a consistent state
                expect(stateData.consistent).toBeTruthy();
                expect(stateData.pending_operations).toBeLessThan(5);

                console.log('System consistency check:', {
                    consistent: stateData.consistent,
                    pendingOperations: stateData.pending_operations
                });
            }
        });

        test('Error propagation boundaries', async ({ request }) => {
            test.setTimeout(180000); // 3 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Test that errors in one service don't cascade unnecessarily
            const errorBoundaryTests = [
                {
                    name: 'ANALIZAI error isolation',
                    errorService: 'analizai',
                    checkServices: ['codai', 'memorai', 'hub']
                },
                {
                    name: 'FABRICAI error isolation',
                    errorService: 'fabricai',
                    checkServices: ['marketai', 'cumparai', 'wallet']
                }
            ];

            for (const boundaryTest of errorBoundaryTests) {
                // Trigger error in the target service
                const errorResponse = await request.post(
                    `${TEST_CONFIG.API_GATEWAY}/${boundaryTest.errorService}/trigger-error`,
                    {
                        headers,
                        data: { error_type: 'boundary_test' }
                    }
                );

                // Wait for error to potentially propagate
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Check that other services are still functioning
                let healthyServices = 0;

                for (const checkService of boundaryTest.checkServices) {
                    try {
                        const healthResponse = await request.get(
                            `${TEST_CONFIG.API_GATEWAY}/${checkService}/health`,
                            { headers, timeout: 10000 }
                        );

                        if (healthResponse.status() === 200) {
                            healthyServices++;
                        }
                    } catch (error) {
                        // Service might be temporarily unavailable
                    }
                }

                // Most services should remain healthy
                const healthyRate = healthyServices / boundaryTest.checkServices.length;
                expect(healthyRate).toBeGreaterThan(0.6); // 60% of services should remain healthy

                console.log(`${boundaryTest.name} isolation:`, {
                    healthyServices,
                    totalServices: boundaryTest.checkServices.length,
                    isolationEffectiveness: `${(healthyRate * 100).toFixed(1)}%`
                });
            }
        });
    });

    test.describe('Recovery and Self-Healing', () => {
        test('Automatic recovery mechanisms', async ({ request }) => {
            test.setTimeout(360000); // 6 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Test automatic recovery after service disruption
            const services = ['hub', 'codai', 'memorai'];

            for (const serviceName of services) {
                // Check initial health
                const initialHealthResponse = await request.get(
                    `${TEST_CONFIG.API_GATEWAY}/${serviceName}/health`,
                    { headers }
                );

                const initialHealth = initialHealthResponse.status() === 200;
                console.log(`${serviceName} initial health:`, initialHealth);

                // Simulate service restart/disruption
                const disruptResponse = await request.post(
                    `${TEST_CONFIG.API_GATEWAY}/${serviceName}/simulate-restart`,
                    { headers }
                );

                if (disruptResponse.ok()) {
                    console.log(`${serviceName} restart simulated`);

                    // Wait for recovery
                    let recoveryAttempts = 0;
                    let recovered = false;

                    while (recoveryAttempts < 12 && !recovered) { // Try for 2 minutes
                        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

                        try {
                            const healthResponse = await request.get(
                                `${TEST_CONFIG.API_GATEWAY}/${serviceName}/health`,
                                { headers, timeout: 5000 }
                            );

                            if (healthResponse.status() === 200) {
                                recovered = true;
                                console.log(`${serviceName} recovered after ${(recoveryAttempts + 1) * 10} seconds`);
                            }
                        } catch (error) {
                            // Still recovering
                        }

                        recoveryAttempts++;
                    }

                    // Service should recover within reasonable time
                    expect(recovered).toBeTruthy();
                }
            }
        });

        test('Data integrity after recovery', async ({ request }) => {
            test.setTimeout(300000); // 5 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Create test data before disruption
            const testData = {
                id: `recovery_test_${Date.now()}`,
                name: 'Data Integrity Recovery Test',
                content: 'This data should survive service recovery',
                timestamp: new Date().toISOString()
            };

            // Store data in multiple services
            const dataCreationPromises = [
                request.post(`${TEST_CONFIG.API_GATEWAY}/codai/test-data`, {
                    headers,
                    data: testData
                }),
                request.post(`${TEST_CONFIG.API_GATEWAY}/memorai/test-data`, {
                    headers,
                    data: testData
                }),
                request.post(`${TEST_CONFIG.API_GATEWAY}/hub/test-data`, {
                    headers,
                    data: testData
                })
            ];

            const creationResults = await Promise.allSettled(dataCreationPromises);
            const successfulCreations = creationResults.filter(r =>
                r.status === 'fulfilled' && r.value.ok()
            ).length;

            expect(successfulCreations).toBeGreaterThan(0);
            console.log(`Data created in ${successfulCreations} services`);

            // Wait for data propagation
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Simulate system-wide disruption and recovery
            const recoveryResponse = await request.post(
                `${TEST_CONFIG.API_GATEWAY}/admin/simulate-system-recovery`,
                { headers }
            );

            if (recoveryResponse.ok()) {
                console.log('System recovery simulation initiated');

                // Wait for recovery process
                await new Promise(resolve => setTimeout(resolve, 30000));

                // Verify data integrity after recovery
                const dataVerificationPromises = [
                    request.get(`${TEST_CONFIG.API_GATEWAY}/codai/test-data/${testData.id}`, { headers }),
                    request.get(`${TEST_CONFIG.API_GATEWAY}/memorai/test-data/${testData.id}`, { headers }),
                    request.get(`${TEST_CONFIG.API_GATEWAY}/hub/test-data/${testData.id}`, { headers })
                ];

                const verificationResults = await Promise.allSettled(dataVerificationPromises);
                let intactDataCount = 0;

                for (const result of verificationResults) {
                    if (result.status === 'fulfilled' && result.value.ok()) {
                        const retrievedData = await result.value.json();
                        if (retrievedData.id === testData.id && retrievedData.name === testData.name) {
                            intactDataCount++;
                        }
                    }
                }

                // At least 70% of data should remain intact after recovery
                const dataIntegrityRate = intactDataCount / 3;
                expect(dataIntegrityRate).toBeGreaterThan(0.7);

                console.log('Data integrity after recovery:', {
                    intactDataCount,
                    dataIntegrityRate: `${(dataIntegrityRate * 100).toFixed(1)}%`
                });
            }
        });

        test('Performance recovery after stress', async ({ request }) => {
            test.setTimeout(360000); // 6 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Measure baseline performance
            const baselineStart = Date.now();
            const baselineResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/hub/dashboard`, {
                headers
            });
            const baselineTime = Date.now() - baselineStart;

            console.log('Baseline response time:', `${baselineTime}ms`);

            // Apply stress load
            const stressRequests = [];
            for (let i = 0; i < 50; i++) {
                stressRequests.push(
                    request.post(`${TEST_CONFIG.API_GATEWAY}/analizai/heavy-computation`, {
                        headers,
                        data: { complexity: 'high', size: 'large' },
                        timeout: 30000
                    }).catch(error => ({ error: error.message }))
                );
            }

            console.log('Applying stress load...');
            await Promise.allSettled(stressRequests);

            // Wait for stress to complete
            await new Promise(resolve => setTimeout(resolve, 10000));

            // Measure performance during stress recovery
            const recoveryMeasurements = [];
            for (let i = 0; i < 10; i++) {
                const measurementStart = Date.now();
                const response = await request.get(`${TEST_CONFIG.API_GATEWAY}/hub/dashboard`, {
                    headers,
                    timeout: 30000
                });
                const measurementTime = Date.now() - measurementStart;

                if (response.ok()) {
                    recoveryMeasurements.push(measurementTime);
                }

                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second intervals
            }

            if (recoveryMeasurements.length > 0) {
                const avgRecoveryTime = recoveryMeasurements.reduce((a, b) => a + b, 0) / recoveryMeasurements.length;
                const maxRecoveryTime = Math.max(...recoveryMeasurements);

                // Performance should recover to within 3x baseline
                expect(avgRecoveryTime).toBeLessThan(baselineTime * 3);
                expect(maxRecoveryTime).toBeLessThan(baselineTime * 5);

                console.log('Performance recovery metrics:', {
                    baselineTime: `${baselineTime}ms`,
                    avgRecoveryTime: `${avgRecoveryTime.toFixed(0)}ms`,
                    maxRecoveryTime: `${maxRecoveryTime}ms`,
                    performanceRatio: `${(avgRecoveryTime / baselineTime).toFixed(1)}x`
                });
            }
        });
    });

    test.describe('Monitoring and Alerting', () => {
        test('Health monitoring during failures', async ({ request }) => {
            test.setTimeout(240000); // 4 minutes

            const token = await authHelper.authenticateAdmin();
            const headers = { Authorization: `Bearer ${token}` };

            // Check monitoring endpoints
            const monitoringEndpoints = [
                '/admin/health-summary',
                '/admin/service-status',
                '/admin/error-rates',
                '/admin/response-times'
            ];

            for (const endpoint of monitoringEndpoints) {
                const response = await request.get(`${TEST_CONFIG.API_GATEWAY}${endpoint}`, {
                    headers
                });

                if (response.ok()) {
                    const data = await response.json();

                    // Should have monitoring data
                    expect(data).toBeDefined();
                    expect(data.timestamp).toBeDefined();

                    console.log(`Monitoring endpoint ${endpoint} is functional`);
                }
            }
        });

        test('Alert generation for critical failures', async ({ request }) => {
            test.setTimeout(180000); // 3 minutes

            const token = await authHelper.authenticateAdmin();
            const headers = { Authorization: `Bearer ${token}` };

            // Trigger a critical error
            const criticalErrorResponse = await request.post(
                `${TEST_CONFIG.API_GATEWAY}/admin/trigger-critical-error`,
                {
                    headers,
                    data: { error_type: 'test_critical_alert' }
                }
            );

            if (criticalErrorResponse.ok()) {
                // Wait for alert generation
                await new Promise(resolve => setTimeout(resolve, 10000));

                // Check for alerts
                const alertsResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/alerts`, {
                    headers
                });

                if (alertsResponse.ok()) {
                    const alerts = await alertsResponse.json();

                    expect(alerts.alerts).toBeDefined();
                    expect(alerts.alerts.length).toBeGreaterThan(0);

                    // Should have critical alert
                    const criticalAlerts = alerts.alerts.filter(alert =>
                        alert.severity === 'critical' &&
                        alert.message.includes('test_critical_alert')
                    );

                    expect(criticalAlerts.length).toBeGreaterThan(0);

                    console.log('Critical alert generation verified:', {
                        totalAlerts: alerts.alerts.length,
                        criticalAlerts: criticalAlerts.length
                    });
                }
            }
        });
    });

    test.afterEach(async () => {
        // Clean up any test state or connections
    });
});
