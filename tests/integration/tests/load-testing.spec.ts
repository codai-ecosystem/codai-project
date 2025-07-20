import { test, expect } from '@playwright/test';
import {
    IntegrationAuthHelper,
    LoadTestHelper,
    TEST_CONFIG
} from '../integration-helpers';

/**
 * CODAI Ecosystem Load and Performance Integration Testing
 * Testing system performance under realistic load conditions
 */

test.describe('Load and Performance Integration Testing', () => {
    let authHelper: IntegrationAuthHelper;
    let loadHelper: LoadTestHelper;

    test.beforeEach(async () => {
        authHelper = new IntegrationAuthHelper();
        loadHelper = new LoadTestHelper(authHelper);
    });

    test.describe('Concurrent User Load Testing', () => {
        test('System handles 25 concurrent users', async () => {
            test.setTimeout(300000); // 5 minutes

            const results = await loadHelper.simulateConcurrentUsers(25, 120); // 25 users for 2 minutes

            expect(results.totalRequests).toBeGreaterThan(100);
            expect(results.averageResponseTime).toBeLessThan(TEST_CONFIG.PERFORMANCE_THRESHOLDS.response_time);

            const errorRate = results.failedRequests / results.totalRequests;
            expect(errorRate).toBeLessThan(TEST_CONFIG.PERFORMANCE_THRESHOLDS.error_rate);

            console.log('Load Test Results (25 users):', {
                totalRequests: results.totalRequests,
                successRate: `${((results.successfulRequests / results.totalRequests) * 100).toFixed(1)}%`,
                avgResponseTime: `${results.averageResponseTime.toFixed(0)}ms`,
                maxResponseTime: `${results.maxResponseTime}ms`
            });
        });

        test('System handles 50 concurrent users', async () => {
            test.setTimeout(420000); // 7 minutes

            const results = await loadHelper.simulateConcurrentUsers(50, 180); // 50 users for 3 minutes

            expect(results.totalRequests).toBeGreaterThan(200);
            expect(results.averageResponseTime).toBeLessThan(TEST_CONFIG.PERFORMANCE_THRESHOLDS.response_time * 1.5);

            const errorRate = results.failedRequests / results.totalRequests;
            expect(errorRate).toBeLessThan(TEST_CONFIG.PERFORMANCE_THRESHOLDS.error_rate * 2);

            console.log('Load Test Results (50 users):', {
                totalRequests: results.totalRequests,
                successRate: `${((results.successfulRequests / results.totalRequests) * 100).toFixed(1)}%`,
                avgResponseTime: `${results.averageResponseTime.toFixed(0)}ms`,
                maxResponseTime: `${results.maxResponseTime}ms`
            });
        });

        test('System stability under sustained load', async () => {
            test.setTimeout(600000); // 10 minutes

            // Test sustained moderate load over longer period
            const results = await loadHelper.simulateConcurrentUsers(20, 300); // 20 users for 5 minutes

            expect(results.totalRequests).toBeGreaterThan(400);

            // Under sustained load, we allow slightly higher response times
            expect(results.averageResponseTime).toBeLessThan(TEST_CONFIG.PERFORMANCE_THRESHOLDS.response_time * 2);

            const errorRate = results.failedRequests / results.totalRequests;
            expect(errorRate).toBeLessThan(TEST_CONFIG.PERFORMANCE_THRESHOLDS.error_rate * 1.5);

            // Check for performance degradation over time
            const firstQuarter = results.responseTimes.slice(0, Math.floor(results.responseTimes.length / 4));
            const lastQuarter = results.responseTimes.slice(-Math.floor(results.responseTimes.length / 4));

            const firstQuarterAvg = firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length;
            const lastQuarterAvg = lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length;

            // Performance shouldn't degrade more than 100% over time
            expect(lastQuarterAvg).toBeLessThan(firstQuarterAvg * 2);

            console.log('Sustained Load Test Results:', {
                totalRequests: results.totalRequests,
                successRate: `${((results.successfulRequests / results.totalRequests) * 100).toFixed(1)}%`,
                avgResponseTime: `${results.averageResponseTime.toFixed(0)}ms`,
                performanceDegradation: `${(((lastQuarterAvg - firstQuarterAvg) / firstQuarterAvg) * 100).toFixed(1)}%`
            });
        });
    });

    test.describe('API Gateway Load Testing', () => {
        test('API Gateway handles concurrent requests', async ({ request }) => {
            test.setTimeout(180000); // 3 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            const concurrentRequests = 100;
            const requestPromises = [];

            const startTime = Date.now();

            // Create concurrent requests to different services through gateway
            for (let i = 0; i < concurrentRequests; i++) {
                const serviceNames = Object.keys(TEST_CONFIG.SERVICES);
                const randomService = serviceNames[Math.floor(Math.random() * serviceNames.length)];
                const serviceName = TEST_CONFIG.SERVICES[randomService].name;

                requestPromises.push(
                    request.get(`${TEST_CONFIG.API_GATEWAY}/${serviceName}/health`, {
                        headers,
                        timeout: 30000
                    }).catch(error => ({ error: error.message }))
                );
            }

            const results = await Promise.allSettled(requestPromises);
            const totalTime = Date.now() - startTime;

            const successfulRequests = results.filter(r =>
                r.status === 'fulfilled' && r.value.status && r.value.status() === 200
            ).length;

            const failedRequests = concurrentRequests - successfulRequests;
            const successRate = successfulRequests / concurrentRequests;
            const throughput = concurrentRequests / (totalTime / 1000); // requests per second

            expect(successRate).toBeGreaterThan(0.8); // 80% success rate minimum
            expect(throughput).toBeGreaterThan(10); // At least 10 requests per second

            console.log('API Gateway Load Test Results:', {
                concurrentRequests,
                successfulRequests,
                failedRequests,
                successRate: `${(successRate * 100).toFixed(1)}%`,
                throughput: `${throughput.toFixed(1)} req/s`,
                totalTime: `${totalTime}ms`
            });
        });

        test('Gateway routing performance under load', async ({ request }) => {
            test.setTimeout(240000); // 4 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            const routingTests = [];

            // Test routing to each service under concurrent load
            for (const [serviceName, serviceConfig] of Object.entries(TEST_CONFIG.SERVICES)) {
                const serviceRequests = [];

                for (let i = 0; i < 20; i++) { // 20 concurrent requests per service
                    serviceRequests.push(
                        request.get(`${TEST_CONFIG.API_GATEWAY}/${serviceConfig.name}/health`, {
                            headers,
                            timeout: 20000
                        }).then(response => ({
                            service: serviceName,
                            status: response.status(),
                            responseTime: response.headers()['x-response-time'] || 0
                        })).catch(error => ({
                            service: serviceName,
                            error: error.message
                        }))
                    );
                }

                routingTests.push(...serviceRequests);
            }

            const results = await Promise.allSettled(routingTests);

            // Analyze results by service
            const serviceResults = {};

            for (const result of results) {
                if (result.status === 'fulfilled' && result.value.service) {
                    const serviceName = result.value.service;
                    if (!serviceResults[serviceName]) {
                        serviceResults[serviceName] = { successful: 0, failed: 0, totalResponseTime: 0 };
                    }

                    if (result.value.status === 200) {
                        serviceResults[serviceName].successful++;
                        serviceResults[serviceName].totalResponseTime += parseInt(result.value.responseTime || 0);
                    } else {
                        serviceResults[serviceName].failed++;
                    }
                }
            }

            // Verify each service had reasonable success rate
            for (const [serviceName, stats] of Object.entries(serviceResults)) {
                const total = stats.successful + stats.failed;
                const successRate = stats.successful / total;
                const avgResponseTime = stats.successful > 0 ? stats.totalResponseTime / stats.successful : 0;

                expect(successRate).toBeGreaterThan(0.7); // 70% success rate minimum per service
                expect(avgResponseTime).toBeLessThan(5000); // 5 seconds max average response time

                console.log(`Service ${serviceName} Performance:`, {
                    successRate: `${(successRate * 100).toFixed(1)}%`,
                    avgResponseTime: `${avgResponseTime}ms`,
                    totalRequests: total
                });
            }
        });
    });

    test.describe('Database and Storage Load Testing', () => {
        test('MEMORAI handles concurrent memory operations', async ({ request }) => {
            test.setTimeout(300000); // 5 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            const concurrentOperations = 50;
            const operationPromises = [];

            // Create concurrent memory operations
            for (let i = 0; i < concurrentOperations; i++) {
                const memoryData = {
                    content: `Load test memory ${i}`,
                    type: 'load_test',
                    metadata: { test_id: Date.now(), operation_id: i }
                };

                operationPromises.push(
                    request.post(`${TEST_CONFIG.API_GATEWAY}/memorai/memories`, {
                        headers,
                        data: memoryData,
                        timeout: 30000
                    }).catch(error => ({ error: error.message }))
                );
            }

            const results = await Promise.allSettled(operationPromises);

            const successful = results.filter(r =>
                r.status === 'fulfilled' && r.value.status && r.value.status() === 201
            ).length;

            const successRate = successful / concurrentOperations;
            expect(successRate).toBeGreaterThan(0.8); // 80% success rate

            console.log('MEMORAI Load Test Results:', {
                concurrentOperations,
                successful,
                successRate: `${(successRate * 100).toFixed(1)}%`
            });

            // Test concurrent reads
            const readPromises = [];
            for (let i = 0; i < 30; i++) {
                readPromises.push(
                    request.get(`${TEST_CONFIG.API_GATEWAY}/memorai/memories`, {
                        headers,
                        timeout: 20000
                    })
                );
            }

            const readResults = await Promise.allSettled(readPromises);
            const successfulReads = readResults.filter(r =>
                r.status === 'fulfilled' && r.value.status() === 200
            ).length;

            const readSuccessRate = successfulReads / 30;
            expect(readSuccessRate).toBeGreaterThan(0.9); // 90% success rate for reads

            console.log('MEMORAI Read Load Test:', {
                successfulReads,
                readSuccessRate: `${(readSuccessRate * 100).toFixed(1)}%`
            });
        });

        test('File upload/download performance under load', async ({ request }) => {
            test.setTimeout(420000); // 7 minutes

            const token = await authHelper.authenticateUser();
            const headers = { Authorization: `Bearer ${token}` };

            // Test concurrent file uploads
            const fileUploads = [];
            const testFileContent = 'Test file content for load testing. '.repeat(1000); // ~35KB file

            for (let i = 0; i < 20; i++) {
                const formData = new FormData();
                formData.append('file', new Blob([testFileContent]), `load-test-file-${i}.txt`);
                formData.append('metadata', JSON.stringify({ test_id: Date.now(), file_id: i }));

                fileUploads.push(
                    request.post(`${TEST_CONFIG.API_GATEWAY}/memorai/files`, {
                        headers,
                        multipart: {
                            file: {
                                name: `load-test-file-${i}.txt`,
                                mimeType: 'text/plain',
                                buffer: Buffer.from(testFileContent)
                            }
                        },
                        timeout: 60000
                    }).catch(error => ({ error: error.message }))
                );
            }

            const uploadResults = await Promise.allSettled(fileUploads);
            const successfulUploads = uploadResults.filter(r =>
                r.status === 'fulfilled' && r.value.status && r.value.status() === 201
            ).length;

            const uploadSuccessRate = successfulUploads / 20;
            expect(uploadSuccessRate).toBeGreaterThan(0.7); // 70% success rate for file uploads

            console.log('File Upload Load Test Results:', {
                totalUploads: 20,
                successfulUploads,
                uploadSuccessRate: `${(uploadSuccessRate * 100).toFixed(1)}%`
            });
        });
    });

    test.describe('Cross-Service Workflow Load Testing', () => {
        test('Complete workflow performance under concurrent load', async () => {
            test.setTimeout(600000); // 10 minutes

            // Simulate 15 users performing complete workflows concurrently
            const workflowUsers = 15;
            const workflowPromises = [];

            for (let i = 0; i < workflowUsers; i++) {
                workflowPromises.push(
                    this.simulateCompleteWorkflow(i)
                );
            }

            const workflowResults = await Promise.allSettled(workflowPromises);
            const successfulWorkflows = workflowResults.filter(r =>
                r.status === 'fulfilled' && r.value === true
            ).length;

            const workflowSuccessRate = successfulWorkflows / workflowUsers;
            expect(workflowSuccessRate).toBeGreaterThan(0.6); // 60% success rate for complex workflows

            console.log('Workflow Load Test Results:', {
                totalWorkflows: workflowUsers,
                successfulWorkflows,
                workflowSuccessRate: `${(workflowSuccessRate * 100).toFixed(1)}%`
            });
        });

    async simulateCompleteWorkflow(userId: number): Promise < boolean > {
            try {
                const token = await authHelper.authenticateUser(`loaduser${userId}`, 'loadpass');
                const headers = { Authorization: `Bearer ${token}` };

                // Step 1: Create project
                const projectResponse = await fetch(`${TEST_CONFIG.API_GATEWAY}/codai/projects`, {
                    method: 'POST',
                    headers: { ...headers, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: `Load Test Project ${userId}`,
                        description: 'Testing workflow under load'
                    })
                });

                if(!projectResponse.ok) return false;

    // Step 2: Add to MEMORAI
    const memoryResponse = await fetch(`${TEST_CONFIG.API_GATEWAY}/memorai/memories`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `Load test project ${userId} details`,
            type: 'project'
        })
    });

    if (!memoryResponse.ok) return false;

    // Step 3: Analyze in ANALIZAI
    const analysisResponse = await fetch(`${TEST_CONFIG.API_GATEWAY}/analizai/analyze`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            data: `Load test project ${userId}`,
            type: 'project_analysis'
        })
    });

    if (!analysisResponse.ok) return false;

    // Step 4: Check HUB
    const hubResponse = await fetch(`${TEST_CONFIG.API_GATEWAY}/hub/dashboard`, {
        headers
    });

    return hubResponse.ok;

} catch (error) {
    console.error(`Workflow ${userId} failed:`, error);
    return false;
}
    }

test('Real-time synchronization under load', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    // Open multiple tabs to simulate concurrent users
    const tabs = [];
    const tabCount = 5;

    for (let i = 0; i < tabCount; i++) {
        const tab = await page.context().newPage();
        tabs.push(tab);
    }

    try {
        // Authenticate all tabs
        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            await tab.goto(`${TEST_CONFIG.API_GATEWAY}/id`);
            await tab.fill('[data-testid="username"]', `syncuser${i}`);
            await tab.fill('[data-testid="password"]', 'syncpass');
            await tab.click('[data-testid="login-button"]');
            await tab.waitForSelector('[data-testid="dashboard"]');
        }

        // Navigate all tabs to HUB for real-time updates
        for (const tab of tabs) {
            await tab.goto(`${TEST_CONFIG.API_GATEWAY}/hub`);
        }

        // Create activities from different tabs
        const activities = [];
        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];

            // Create project in CODAI
            await tab.goto(`${TEST_CONFIG.API_GATEWAY}/codai`);
            await tab.click('[data-testid="new-project"]');
            await tab.fill('[data-testid="project-name"]', `Sync Test Project ${i}`);
            await tab.click('[data-testid="create-project"]');
            await tab.waitForSelector('[data-testid="project-created"]');

            activities.push(`Sync Test Project ${i}`);
        }

        // Verify real-time updates in all tabs
        for (const tab of tabs) {
            await tab.goto(`${TEST_CONFIG.API_GATEWAY}/hub`);
            await tab.waitForTimeout(3000); // Allow time for synchronization

            // Check that activities from other tabs are visible
            for (const activity of activities) {
                await expect(tab.locator('[data-testid="recent-activities"]')).toContainText(activity, { timeout: 10000 });
            }
        }

    } finally {
        // Clean up tabs
        for (const tab of tabs) {
            await tab.close();
        }
    }
});
  });

test.describe('Performance Regression Testing', () => {
    test('Response time performance baselines', async ({ request }) => {
        test.setTimeout(180000); // 3 minutes

        const token = await authHelper.authenticateUser();
        const headers = { Authorization: `Bearer ${token}` };

        const performanceTests = [
            { service: 'hub', endpoint: '/dashboard', expectedMaxTime: 2000 },
            { service: 'codai', endpoint: '/projects', expectedMaxTime: 3000 },
            { service: 'memorai', endpoint: '/memories', expectedMaxTime: 2500 },
            { service: 'analizai', endpoint: '/status', expectedMaxTime: 1500 },
            { service: 'bancai', endpoint: '/accounts', expectedMaxTime: 2000 }
        ];

        for (const test of performanceTests) {
            const measurements = [];

            // Take 10 measurements
            for (let i = 0; i < 10; i++) {
                const startTime = Date.now();
                const response = await request.get(`${TEST_CONFIG.API_GATEWAY}${test.endpoint}`, {
                    headers,
                    timeout: 15000
                });
                const responseTime = Date.now() - startTime;

                if (response.ok()) {
                    measurements.push(responseTime);
                }
            }

            if (measurements.length > 0) {
                const avgResponseTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
                const maxResponseTime = Math.max(...measurements);

                expect(avgResponseTime).toBeLessThan(test.expectedMaxTime);
                expect(maxResponseTime).toBeLessThan(test.expectedMaxTime * 1.5);

                console.log(`${test.service} Performance:`, {
                    avgResponseTime: `${avgResponseTime.toFixed(0)}ms`,
                    maxResponseTime: `${maxResponseTime}ms`,
                    measurements: measurements.length
                });
            }
        }
    });

    test('Memory usage under load', async ({ request }) => {
        test.setTimeout(240000); // 4 minutes

        // Get initial memory usage
        const initialMemoryResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/metrics`);
        let initialMemory = 0;

        if (initialMemoryResponse.ok()) {
            const data = await initialMemoryResponse.json();
            initialMemory = data.memory?.used || 0;
        }

        // Generate load
        const token = await authHelper.authenticateUser();
        const headers = { Authorization: `Bearer ${token}` };

        const loadRequests = [];
        for (let i = 0; i < 100; i++) {
            loadRequests.push(
                request.post(`${TEST_CONFIG.API_GATEWAY}/memorai/memories`, {
                    headers,
                    data: {
                        content: 'Memory load test content. '.repeat(100), // ~2.6KB per memory
                        type: 'load_test'
                    }
                })
            );
        }

        await Promise.allSettled(loadRequests);

        // Wait for processing
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check memory usage after load
        const finalMemoryResponse = await request.get(`${TEST_CONFIG.API_GATEWAY}/admin/metrics`);
        let finalMemory = 0;

        if (finalMemoryResponse.ok()) {
            const data = await finalMemoryResponse.json();
            finalMemory = data.memory?.used || 0;
        }

        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

        // Memory increase should be reasonable (less than 500MB for 100 operations)
        expect(memoryIncreaseMB).toBeLessThan(500);

        console.log('Memory Usage Test:', {
            initialMemory: `${(initialMemory / (1024 * 1024)).toFixed(1)}MB`,
            finalMemory: `${(finalMemory / (1024 * 1024)).toFixed(1)}MB`,
            memoryIncrease: `${memoryIncreaseMB.toFixed(1)}MB`
        });
    });
});

test.afterEach(async () => {
    // Clean up any test data or state
});
});
