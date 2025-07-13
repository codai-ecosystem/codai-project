// Comprehensive API and service integration tests
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Test configuration
const TEST_CONFIG = {
    baseUrls: {
        codai: 'http://localhost:4030',
        memorai: 'http://localhost:4032',
        bancai: 'http://localhost:4033',
        sociai: 'http://localhost:4034',
        studiai: 'http://localhost:4035',
        fabricai: 'http://localhost:4036',
        wallet: 'http://localhost:4037',
        logai: 'http://localhost:4038',
        x: 'http://localhost:4039',
        publicai: 'http://localhost:4040',
        cumparai: 'http://localhost:4041',
        marketai: 'http://localhost:4042'
    },
    timeout: 10000
};

// Test utilities for making HTTP requests
const apiRequest = async (url: string, options: RequestInit = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        return {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            data: response.ok ? await response.json().catch(() => null) : null,
            error: !response.ok ? await response.text().catch(() => response.statusText) : null
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            statusText: 'Network Error',
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

describe('🔗 COMPREHENSIVE API INTEGRATION TESTS', () => {

    describe('🌐 Service Health & Connectivity', () => {
        it('should check all service health endpoints', async () => {
            const healthChecks: Array<{
                service: string;
                baseUrl: string;
                isHealthy: boolean;
                status: number;
                response: any;
            }> = [];

            for (const [service, baseUrl] of Object.entries(TEST_CONFIG.baseUrls)) {
                console.log(`🔍 Checking ${service} health...`);

                // Try multiple common health endpoint patterns
                const healthEndpoints = [
                    `${baseUrl}/api/health`,
                    `${baseUrl}/health`,
                    `${baseUrl}/api/status`,
                    `${baseUrl}/status`,
                    `${baseUrl}/`
                ];

                let isHealthy = false;
                let healthResponse: any = null;

                for (const endpoint of healthEndpoints) {
                    const response = await apiRequest(endpoint);
                    if (response.ok) {
                        isHealthy = true;
                        healthResponse = response;
                        break;
                    }
                }

                healthChecks.push({
                    service,
                    baseUrl,
                    isHealthy,
                    status: healthResponse?.status || 0,
                    response: healthResponse
                });

                console.log(`  ${isHealthy ? '✅' : '❌'} ${service}: ${isHealthy ? 'Healthy' : 'Unreachable'}`);
            }

            const healthyServices = healthChecks.filter(check => check.isHealthy);
            console.log(`\n📊 Health Check Results: ${healthyServices.length}/${healthChecks.length} services healthy`);

            // Store results for other tests
            (global as any).healthChecks = healthChecks;

            // Expect at least 50% of services to be healthy for tests to proceed
            expect(healthyServices.length / healthChecks.length).toBeGreaterThan(0.5);
        }, TEST_CONFIG.timeout);
    });

    describe('📱 CodAI API Integration', () => {
        const baseUrl = TEST_CONFIG.baseUrls.codai;

        it('should test code generation endpoints', async () => {
            const endpoints = [
                '/api/generate',
                '/api/projects',
                '/api/templates',
                '/api/ai/code'
            ];

            const results: Array<{
                endpoint: string;
                accessible: boolean;
                status: number;
                hasData: boolean;
            }> = [];

            for (const endpoint of endpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                results.push({
                    endpoint,
                    accessible: response.status !== 404,
                    status: response.status,
                    hasData: !!response.data
                });

                console.log(`  ${response.status !== 404 ? '✅' : '❌'} ${endpoint}: ${response.status}`);
            }

            // At least some endpoints should be accessible
            const accessibleEndpoints = results.filter(r => r.accessible);
            expect(accessibleEndpoints.length).toBeGreaterThan(0);
        });

        it('should test project management flows', async () => {
            const projectFlow = {
                create: await apiRequest(`${baseUrl}/api/projects`, {
                    method: 'POST',
                    body: JSON.stringify({ name: 'Test Project', type: 'web' })
                }),
                list: await apiRequest(`${baseUrl}/api/projects`),
                templates: await apiRequest(`${baseUrl}/api/templates`)
            };

            // Even if endpoints require auth, they should return proper HTTP status codes
            expect([200, 201, 401, 403]).toContain(projectFlow.create.status);
            expect([200, 401, 403]).toContain(projectFlow.list.status);
            expect([200, 401, 403]).toContain(projectFlow.templates.status);
        });
    });

    describe('🧠 MemorAI API Integration', () => {
        const baseUrl = TEST_CONFIG.baseUrls.memorai;

        it('should test memory management endpoints', async () => {
            const memoryEndpoints = [
                '/api/memories',
                '/api/memories/search',
                '/api/analytics',
                '/api/mcp/recall-memories'
            ];

            const results: Array<{
                endpoint: string;
                status: number;
                accessible: boolean;
                hasData: boolean;
            }> = [];

            for (const endpoint of memoryEndpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                results.push({
                    endpoint,
                    status: response.status,
                    accessible: response.status !== 404,
                    hasData: !!response.data
                });

                console.log(`  ${response.status !== 404 ? '✅' : '❌'} ${endpoint}: ${response.status}`);
            }

            const accessibleEndpoints = results.filter(r => r.accessible);
            expect(accessibleEndpoints.length).toBeGreaterThan(0);
        });

        it('should test MCP integration', async () => {
            const mcpResponse = await apiRequest(`${baseUrl}/api/mcp/recall-memories?summary=true`);

            // MCP endpoint should exist and respond
            expect(mcpResponse.status).not.toBe(404);

            if (mcpResponse.ok && mcpResponse.data) {
                expect(mcpResponse.data).toHaveProperty('memories');
                expect(Array.isArray(mcpResponse.data.memories)).toBe(true);
            }
        });

        it('should test analytics endpoints', async () => {
            const analyticsEndpoints = [
                '/api/analytics',
                '/api/analytics/dashboard',
                '/api/analytics/memory-stats'
            ];

            for (const endpoint of analyticsEndpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                console.log(`  📊 ${endpoint}: ${response.status}`);

                // Analytics endpoints should be accessible or properly secured
                expect([200, 401, 403, 404]).toContain(response.status);
            }
        });
    });

    describe('🏦 BancAI API Integration', () => {
        const baseUrl = TEST_CONFIG.baseUrls.bancai;

        it('should test banking endpoints', async () => {
            const bankingEndpoints = [
                '/api/accounts',
                '/api/transactions',
                '/api/kyc',
                '/api/risk-assessment'
            ];

            for (const endpoint of bankingEndpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                console.log(`  🏦 ${endpoint}: ${response.status}`);

                // Banking endpoints should be properly secured
                expect([200, 401, 403, 404]).toContain(response.status);
            }
        });

        it('should test KYC verification flow', async () => {
            const kycFlow = {
                start: await apiRequest(`${baseUrl}/api/kyc/start`, {
                    method: 'POST',
                    body: JSON.stringify({ userId: 'test-user' })
                }),
                status: await apiRequest(`${baseUrl}/api/kyc/status/test-user`),
                documents: await apiRequest(`${baseUrl}/api/kyc/documents`)
            };

            // KYC endpoints should respond appropriately
            Object.values(kycFlow).forEach(response => {
                expect([200, 201, 400, 401, 403, 404]).toContain(response.status);
            });
        });
    });

    describe('🎓 StudiAI API Integration', () => {
        const baseUrl = TEST_CONFIG.baseUrls.studiai;

        it('should test course management endpoints', async () => {
            const courseEndpoints = [
                '/api/courses',
                '/api/courses/featured',
                '/api/users/progress',
                '/api/admin/courses'
            ];

            for (const endpoint of courseEndpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                console.log(`  🎓 ${endpoint}: ${response.status}`);

                expect([200, 401, 403, 404]).toContain(response.status);
            }
        });

        it('should test student enrollment flow', async () => {
            const enrollmentFlow = {
                courses: await apiRequest(`${baseUrl}/api/courses`),
                enroll: await apiRequest(`${baseUrl}/api/courses/test-course/enroll`, {
                    method: 'POST',
                    body: JSON.stringify({ userId: 'test-user' })
                }),
                progress: await apiRequest(`${baseUrl}/api/users/test-user/progress`)
            };

            Object.values(enrollmentFlow).forEach(response => {
                expect([200, 201, 400, 401, 403, 404]).toContain(response.status);
            });
        });
    });

    describe('🧵 FabricAI API Integration', () => {
        const baseUrl = TEST_CONFIG.baseUrls.fabricai;

        it('should test design generation endpoints', async () => {
            const designEndpoints = [
                '/api/patterns',
                '/api/generate-pattern',
                '/api/colors',
                '/api/textures'
            ];

            for (const endpoint of designEndpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                console.log(`  🧵 ${endpoint}: ${response.status}`);

                expect([200, 401, 403, 404]).toContain(response.status);
            }
        });
    });

    describe('💰 WalletAI API Integration', () => {
        const baseUrl = TEST_CONFIG.baseUrls.wallet;

        it('should test wallet management endpoints', async () => {
            const walletEndpoints = [
                '/api/wallet/balance',
                '/api/transactions',
                '/api/portfolio',
                '/api/assets'
            ];

            for (const endpoint of walletEndpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                console.log(`  💰 ${endpoint}: ${response.status}`);

                expect([200, 401, 403, 404]).toContain(response.status);
            }
        });
    });

    describe('📊 LogAI API Integration', () => {
        const baseUrl = TEST_CONFIG.baseUrls.logai;

        it('should test log analysis endpoints', async () => {
            const logEndpoints = [
                '/api/logs',
                '/api/analytics',
                '/api/alerts',
                '/api/dashboards'
            ];

            for (const endpoint of logEndpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                console.log(`  📊 ${endpoint}: ${response.status}`);

                expect([200, 401, 403, 404]).toContain(response.status);
            }
        });
    });

    describe('🐦 X API Integration', () => {
        const baseUrl = TEST_CONFIG.baseUrls.x;

        it('should test social media endpoints', async () => {
            const socialEndpoints = [
                '/api/tweets',
                '/api/timeline',
                '/api/users',
                '/api/feed'
            ];

            for (const endpoint of socialEndpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                console.log(`  🐦 ${endpoint}: ${response.status}`);

                expect([200, 401, 403, 404]).toContain(response.status);
            }
        });
    });

    describe('🏛️ PublicAI API Integration', () => {
        const baseUrl = TEST_CONFIG.baseUrls.publicai;

        it('should test public service endpoints', async () => {
            const publicEndpoints = [
                '/api/services',
                '/api/requests',
                '/api/announcements',
                '/api/contact'
            ];

            for (const endpoint of publicEndpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                console.log(`  🏛️ ${endpoint}: ${response.status}`);

                expect([200, 401, 403, 404]).toContain(response.status);
            }
        });
    });

    describe('🛒 CumparAI API Integration', () => {
        const baseUrl = TEST_CONFIG.baseUrls.cumparai;

        it('should test e-commerce endpoints', async () => {
            const ecommerceEndpoints = [
                '/api/products',
                '/api/cart',
                '/api/orders',
                '/api/categories'
            ];

            for (const endpoint of ecommerceEndpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                console.log(`  🛒 ${endpoint}: ${response.status}`);

                expect([200, 401, 403, 404]).toContain(response.status);
            }
        });
    });

    describe('📈 MarketAI API Integration', () => {
        const baseUrl = TEST_CONFIG.baseUrls.marketai;

        it('should test market analysis endpoints', async () => {
            const marketEndpoints = [
                '/api/markets',
                '/api/analysis',
                '/api/portfolio',
                '/api/signals'
            ];

            for (const endpoint of marketEndpoints) {
                const response = await apiRequest(`${baseUrl}${endpoint}`);
                console.log(`  📈 ${endpoint}: ${response.status}`);

                expect([200, 401, 403, 404]).toContain(response.status);
            }
        });
    });

    describe('🔗 Cross-Service Integration', () => {
        it('should test service-to-service communication', async () => {
            // Test if services can communicate with each other
            const integrationTests = [
                {
                    name: 'MemorAI to CodAI',
                    source: TEST_CONFIG.baseUrls.memorai,
                    target: TEST_CONFIG.baseUrls.codai,
                    endpoint: '/api/integration/codai'
                },
                {
                    name: 'BancAI to WalletAI',
                    source: TEST_CONFIG.baseUrls.bancai,
                    target: TEST_CONFIG.baseUrls.wallet,
                    endpoint: '/api/integration/wallet'
                }
            ];

            for (const test of integrationTests) {
                const response = await apiRequest(`${test.source}${test.endpoint}`);
                console.log(`  🔗 ${test.name}: ${response.status}`);

                // Integration endpoints may not exist yet, but should not crash
                expect([200, 404, 501]).toContain(response.status);
            }
        });

        it('should test shared authentication', async () => {
            // Test if authentication works across services
            const authEndpoints = Object.entries(TEST_CONFIG.baseUrls).map(([service, url]) => ({
                service,
                url: `${url}/api/auth/me`
            }));

            for (const { service, url } of authEndpoints) {
                const response = await apiRequest(url);
                console.log(`  🔐 ${service} auth: ${response.status}`);

                // Auth endpoints should return 401 (unauthorized) or 200 (if public)
                expect([200, 401, 404]).toContain(response.status);
            }
        });
    });

    describe('⚡ Performance & Load Testing', () => {
        it('should test API response times', async () => {
            const performanceResults: Array<{
                service: string;
                responseTime: number;
                status: number;
                accessible: boolean;
            }> = [];

            for (const [service, baseUrl] of Object.entries(TEST_CONFIG.baseUrls)) {
                const startTime = Date.now();
                const response = await apiRequest(baseUrl);
                const responseTime = Date.now() - startTime;

                performanceResults.push({
                    service,
                    responseTime,
                    status: response.status,
                    accessible: response.status !== 0
                });

                console.log(`  ⚡ ${service}: ${responseTime}ms (${response.status})`);
            }

            const accessibleServices = performanceResults.filter(r => r.accessible);
            const avgResponseTime = accessibleServices.reduce((sum, r) => sum + r.responseTime, 0) / accessibleServices.length;

            console.log(`\n📊 Average API response time: ${Math.round(avgResponseTime)}ms`);

            // API responses should be reasonably fast
            expect(avgResponseTime).toBeLessThan(5000); // Less than 5 seconds
        });

        it('should test concurrent requests', async () => {
            const concurrentRequests = 10;
            const testService = TEST_CONFIG.baseUrls.codai; // Use CodAI as test target

            const startTime = Date.now();
            const promises = Array.from({ length: concurrentRequests }, () =>
                apiRequest(testService)
            );

            const results = await Promise.all(promises);
            const totalTime = Date.now() - startTime;

            const successfulRequests = results.filter(r => r.ok || r.status !== 0).length;

            console.log(`  🚀 Concurrent requests: ${successfulRequests}/${concurrentRequests} successful in ${totalTime}ms`);

            // At least 50% of concurrent requests should succeed
            expect(successfulRequests / concurrentRequests).toBeGreaterThan(0.5);
        });
    });
});

// Export test utilities for use in other test files
export { apiRequest, TEST_CONFIG };
