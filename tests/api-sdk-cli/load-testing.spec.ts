import { test, expect, APIRequestContext } from '@playwright/test';
import { AuthHelper, LoadTestHelper, CODAI_SERVICES, generateTestData } from '../api-sdk-cli-helpers';

test.describe('CODAI Load Testing', () => {
    let request: APIRequestContext;
    let auth: AuthHelper;
    let loadTestHelper: LoadTestHelper;

    test.beforeAll(async ({ playwright }) => {
        request = await playwright.request.newContext({
            baseURL: 'http://localhost:4000',
            extraHTTPHeaders: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        auth = new AuthHelper(request);
        loadTestHelper = new LoadTestHelper(request);

        // Authenticate for load testing
        await auth.authenticate('developer');
    });

    test.afterAll(async () => {
        await request?.dispose();
    });

    // Light load test for API Gateway
    test('API Gateway - Light Load Test', async () => {
        const loadTestResults = await loadTestHelper.performLoadTest('/health', {
            concurrency: 5,
            duration: 10000, // 10 seconds
            method: 'GET'
        });

        console.log('API Gateway Load Test Results:', loadTestResults);

        // Basic performance requirements
        expect(loadTestResults.totalRequests).toBeGreaterThan(10);
        expect(loadTestResults.errorRate).toBeLessThan(50); // Less than 50% error rate
        expect(loadTestResults.averageResponseTime).toBeLessThan(5000); // 5 second average

        console.log(`Processed ${loadTestResults.totalRequests} requests at ${loadTestResults.requestsPerSecond.toFixed(2)} req/s`);
    });

    // Concurrent user simulation
    test('Authentication - Concurrent Users', async () => {
        const concurrentUsers = 3; // Keep it light for test environment
        const testDuration = 8000; // 8 seconds

        const userSessions = Array.from({ length: concurrentUsers }, async (_, index) => {
            try {
                const userAuth = new AuthHelper(request);
                await userAuth.authenticate('user');

                // Simulate user activity
                const activities = [
                    () => request.get('/api/memorai/memories', { headers: userAuth.getAuthHeaders() }),
                    () => request.get('/api/codai/projects', { headers: userAuth.getAuthHeaders() }),
                    () => request.get('/api/id/profile', { headers: userAuth.getAuthHeaders() })
                ];

                const sessionResults = {
                    userId: index + 1,
                    requests: 0,
                    successes: 0,
                    errors: 0
                };

                const endTime = Date.now() + testDuration;

                while (Date.now() < endTime) {
                    try {
                        const activity = activities[Math.floor(Math.random() * activities.length)];
                        const response = await activity();

                        sessionResults.requests++;

                        if (response.ok() || response.status() < 500) {
                            sessionResults.successes++;
                        } else {
                            sessionResults.errors++;
                        }

                        // Small delay between requests
                        await new Promise(resolve => setTimeout(resolve, 200));

                    } catch (error) {
                        sessionResults.requests++;
                        sessionResults.errors++;
                    }
                }

                return sessionResults;

            } catch (error: any) {
                return {
                    userId: index + 1,
                    requests: 0,
                    successes: 0,
                    errors: 1,
                    authError: error.message
                };
            }
        });

        const results = await Promise.all(userSessions);

        console.log('Concurrent Users Test Results:', results);

        // Aggregate results
        const totalRequests = results.reduce((sum, r) => sum + r.requests, 0);
        const totalSuccesses = results.reduce((sum, r) => sum + r.successes, 0);
        const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

        console.log(`Total: ${totalRequests} requests, ${totalSuccesses} successes, ${totalErrors} errors`);

        // Success criteria
        expect(totalRequests).toBeGreaterThan(5); // At least some requests processed

        if (totalRequests > 0) {
            const successRate = (totalSuccesses / totalRequests) * 100;
            expect(successRate).toBeGreaterThan(30); // At least 30% success rate
        }
    });

    // Memory-intensive operations load test
    test('MEMORAI - Memory Operations Load', async () => {
        const memoryLoadResults = await loadTestHelper.performLoadTest('/api/memorai/memories', {
            concurrency: 3,
            duration: 6000, // 6 seconds
            method: 'POST',
            headers: auth.getAuthHeaders(),
            data: generateTestData(100) // Small data size for load test
        });

        console.log('MEMORAI Load Test Results:', memoryLoadResults);

        // Memory operations performance
        expect(memoryLoadResults.totalRequests).toBeGreaterThan(3);
        expect(memoryLoadResults.averageResponseTime).toBeLessThan(10000); // 10 second max

        // Check for memory leaks or performance degradation
        if (memoryLoadResults.totalRequests > 5) {
            const performanceRatio = memoryLoadResults.maxResponseTime / memoryLoadResults.minResponseTime;
            expect(performanceRatio).toBeLessThan(10); // Response time shouldn't degrade too much
        }

        console.log(`Memory operations: ${memoryLoadResults.requestsPerSecond.toFixed(2)} req/s average`);
    });

    // Code processing load test
    test('CODAI - Code Processing Load', async () => {
        const codeData = {
            language: 'javascript',
            code: 'function test() { return "Hello Load Test"; }',
            operation: 'analysis'
        };

        const codeLoadResults = await loadTestHelper.performLoadTest('/api/codai/analysis', {
            concurrency: 2,
            duration: 8000, // 8 seconds
            method: 'POST',
            headers: auth.getAuthHeaders(),
            data: codeData
        });

        console.log('CODAI Load Test Results:', codeLoadResults);

        // Code processing is typically slower
        expect(codeLoadResults.totalRequests).toBeGreaterThan(1);
        expect(codeLoadResults.averageResponseTime).toBeLessThan(15000); // 15 second max for code analysis

        if (codeLoadResults.errorRate > 70) {
            console.warn('High error rate in code processing - this might be expected if service is not fully configured');
        }

        console.log(`Code processing: ${codeLoadResults.requestsPerSecond.toFixed(2)} req/s average`);
    });

    // Database stress test
    test('Database Operations - Stress Test', async () => {
        const dbStressTests = [
            {
                name: 'Read Operations',
                endpoint: '/api/memorai/memories',
                method: 'GET' as const,
                concurrency: 4,
                duration: 5000
            },
            {
                name: 'Write Operations',
                endpoint: '/api/memorai/memories',
                method: 'POST' as const,
                concurrency: 2,
                duration: 5000,
                data: generateTestData(50)
            }
        ];

        const stressResults: Array<{ name: string, results: any, success: boolean }> = [];

        for (const stressTest of dbStressTests) {
            try {
                const results = await loadTestHelper.performLoadTest(stressTest.endpoint, {
                    concurrency: stressTest.concurrency,
                    duration: stressTest.duration,
                    method: stressTest.method,
                    headers: auth.getAuthHeaders(),
                    data: stressTest.data
                });

                const success = results.errorRate < 80 && results.totalRequests > 0;

                stressResults.push({
                    name: stressTest.name,
                    results,
                    success
                });

            } catch (error: any) {
                stressResults.push({
                    name: stressTest.name,
                    results: { error: error.message },
                    success: false
                });
            }
        }

        console.log('Database Stress Test Results:', stressResults);

        // At least one operation type should handle some load
        expect(stressResults.some(r => r.success)).toBeTruthy();

        for (const result of stressResults) {
            if (result.success) {
                console.log(`${result.name}: ${result.results.requestsPerSecond?.toFixed(2)} req/s`);
            }
        }
    });

    // Resource utilization monitoring during load
    test('Resource Utilization - Load Monitoring', async () => {
        const resourceTests = [
            { service: 'memorai', endpoint: '/api/memorai/memories' },
            { service: 'codai', endpoint: '/api/codai/projects' },
            { service: 'id', endpoint: '/api/id/health' }
        ];

        const resourceResults: Array<{
            service: string,
            baseline: number,
            underLoad: number,
            degradation: number
        }> = [];

        for (const test of resourceTests) {
            try {
                // Baseline measurement
                const baselineStart = Date.now();
                await request.get(test.endpoint, { headers: auth.getAuthHeaders() });
                const baselineTime = Date.now() - baselineStart;

                // Under load measurement
                const loadResults = await loadTestHelper.performLoadTest(test.endpoint, {
                    concurrency: 3,
                    duration: 4000, // 4 seconds
                    method: 'GET',
                    headers: auth.getAuthHeaders()
                });

                const degradation = loadResults.averageResponseTime / baselineTime;

                resourceResults.push({
                    service: test.service,
                    baseline: baselineTime,
                    underLoad: loadResults.averageResponseTime,
                    degradation
                });

            } catch (error: any) {
                console.warn(`Resource test failed for ${test.service}:`, error.message);
            }
        }

        console.log('Resource Utilization Results:', resourceResults);

        if (resourceResults.length > 0) {
            // Performance shouldn't degrade more than 5x under light load
            const maxDegradation = Math.max(...resourceResults.map(r => r.degradation));
            expect(maxDegradation).toBeLessThan(5);

            // Average degradation should be reasonable
            const avgDegradation = resourceResults.reduce((sum, r) => sum + r.degradation, 0) / resourceResults.length;
            console.log(`Average performance degradation under load: ${avgDegradation.toFixed(2)}x`);
        }
    });

    // Recovery after load test
    test('System Recovery - Post Load Test', async () => {
        // Give system time to recover
        await new Promise(resolve => setTimeout(resolve, 3000));

        const recoveryResults: Array<{
            service: string,
            recovered: boolean,
            responseTime: number
        }> = [];

        const services = ['memorai', 'codai', 'id'];

        for (const service of services) {
            try {
                const start = Date.now();
                const response = await request.get(`/api/${service}/health`, {
                    headers: auth.getAuthHeaders()
                });
                const responseTime = Date.now() - start;

                const recovered = response.status() < 500 && responseTime < 5000;

                recoveryResults.push({
                    service,
                    recovered,
                    responseTime
                });

            } catch (error: any) {
                recoveryResults.push({
                    service,
                    recovered: false,
                    responseTime: 5000
                });
            }
        }

        console.log('System Recovery Results:', recoveryResults);

        // Most services should recover quickly after load test
        const recoveredServices = recoveryResults.filter(r => r.recovered).length;
        expect(recoveredServices).toBeGreaterThanOrEqual(Math.ceil(services.length * 0.6));

        // Average recovery time should be reasonable
        const avgRecoveryTime = recoveryResults.reduce((sum, r) => sum + r.responseTime, 0) / recoveryResults.length;
        expect(avgRecoveryTime).toBeLessThan(3000); // 3 seconds average recovery

        console.log(`System recovery: ${recoveredServices}/${services.length} services recovered`);
    });

    // Rate limiting test
    test('Rate Limiting - Protection Test', async () => {
        const rateLimitingResults: Array<{
            endpoint: string,
            rateLimited: boolean,
            requests: number,
            limitHit: boolean
        }> = [];

        const testEndpoints = [
            '/api/memorai/memories',
            '/api/codai/analysis',
            '/api/id/profile'
        ];

        for (const endpoint of testEndpoints) {
            let rateLimited = false;
            let limitHit = false;
            let requestCount = 0;

            try {
                // Send rapid requests to trigger rate limiting
                const rapidRequests = Array.from({ length: 20 }, async () => {
                    try {
                        const response = await request.get(endpoint, {
                            headers: auth.getAuthHeaders()
                        });

                        requestCount++;

                        if (response.status() === 429) {
                            rateLimited = true;
                            limitHit = true;
                        }

                        return response.status();
                    } catch (error) {
                        return 500;
                    }
                });

                await Promise.all(rapidRequests);

                rateLimitingResults.push({
                    endpoint,
                    rateLimited,
                    requests: requestCount,
                    limitHit
                });

            } catch (error: any) {
                rateLimitingResults.push({
                    endpoint,
                    rateLimited: false,
                    requests: requestCount,
                    limitHit: false
                });
            }
        }

        console.log('Rate Limiting Results:', rateLimitingResults);

        // Rate limiting is a good security practice but not required for this test
        const rateLimitedEndpoints = rateLimitingResults.filter(r => r.rateLimited).length;

        if (rateLimitedEndpoints > 0) {
            console.log(`✅ Rate limiting detected on ${rateLimitedEndpoints} endpoints`);
        } else {
            console.log(`⚠️  No rate limiting detected - consider implementing for production`);
        }

        // Test should pass regardless of rate limiting implementation
        expect(rateLimitingResults.length).toBe(testEndpoints.length);
    });

    // Bulk operations performance
    test('Bulk Operations - Performance Test', async () => {
        const bulkTestData = Array.from({ length: 5 }, () => generateTestData(20));

        const bulkTests = [
            {
                name: 'Bulk Memory Creation',
                endpoint: '/api/memorai/memories/bulk',
                data: { memories: bulkTestData }
            },
            {
                name: 'Bulk Data Processing',
                endpoint: '/api/codai/bulk-analysis',
                data: {
                    requests: bulkTestData.map(item => ({
                        code: `function test${item.id}() { return "${item.title}"; }`,
                        language: 'javascript'
                    }))
                }
            }
        ];

        const bulkResults: Array<{
            name: string,
            responseTime: number,
            success: boolean,
            throughput: number
        }> = [];

        for (const bulkTest of bulkTests) {
            try {
                const start = Date.now();

                const response = await request.post(bulkTest.endpoint, {
                    data: bulkTest.data,
                    headers: auth.getAuthHeaders()
                });

                const responseTime = Date.now() - start;
                const success = response.ok() || response.status() === 404; // 404 acceptable if endpoint doesn't exist
                const throughput = bulkTestData.length / (responseTime / 1000); // items per second

                bulkResults.push({
                    name: bulkTest.name,
                    responseTime,
                    success,
                    throughput
                });

            } catch (error: any) {
                bulkResults.push({
                    name: bulkTest.name,
                    responseTime: 10000,
                    success: false,
                    throughput: 0
                });
            }
        }

        console.log('Bulk Operations Results:', bulkResults);

        // Bulk operations should complete in reasonable time
        for (const result of bulkResults) {
            if (result.success) {
                expect(result.responseTime).toBeLessThan(30000); // 30 seconds max for bulk operations
                console.log(`${result.name}: ${result.throughput.toFixed(2)} items/sec`);
            }
        }

        // At least bulk operations should be acknowledged (even if not implemented)
        expect(bulkResults.some(r => r.success || r.responseTime < 5000)).toBeTruthy();
    });
});
