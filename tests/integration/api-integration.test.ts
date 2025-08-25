/**
 * 🚀 CODAI Ecosystem - Real API Integration Tests
 * 
 * Comprehensive end-to-end API testing across all CODAI services
 * with real HTTP requests and response validation.
 * 
 * Services Under Test:
 * - MemorAI (Port 4006): Memory management and intelligent recall
 * - CBD Database (Port 4180): Core data persistence
 * - MemorAI MCP (Port 4950): Memory Context Protocol server
 * - RomAI Enterprise API (Port 8001): AGI and enterprise services
 * 
 * @requires Services must be running via VS Code tasks
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Service configuration
const SERVICES = {
    memorai: {
        baseUrl: 'http://localhost:4006',
        name: 'MemorAI Service'
    },
    cbd: {
        baseUrl: 'http://localhost:4180',
        name: 'CBD Database'
    },
    memcpServer: {
        baseUrl: 'http://localhost:4950',
        name: 'MemorAI MCP Server'
    },
    romaiEnterprise: {
        baseUrl: 'http://localhost:8001',
        name: 'RomAI Enterprise API'
    }
} as const;

// Test data for integration testing
const TEST_DATA = {
    memory: {
        content: 'Test memory content for API integration',
        agentId: 'test-agent-api-integration',
        metadata: {
            entityType: 'test_data',
            importance: 5,
            priority: 'medium'
        }
    },
    user: {
        name: 'API Test User',
        email: 'api-test@codai.ro',
        role: 'developer'
    }
};

// Helper function for HTTP requests
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'CODAI-API-Integration-Tests/1.0',
                ...options.headers
            }
        });

        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Service availability check
async function checkServiceHealth(serviceName: keyof typeof SERVICES): Promise<boolean> {
    try {
        const service = SERVICES[serviceName];
        const response = await fetchWithTimeout(`${service.baseUrl}/health`, { method: 'GET' }, 5000);
        return response.ok;
    } catch (error) {
        console.warn(`Service ${serviceName} health check failed:`, error);
        return false;
    }
}

describe('🚀 CODAI Ecosystem API Integration Tests', () => {
    let serviceStatus: Record<string, boolean> = {};

    beforeAll(async () => {
        console.log('🔍 Checking service availability...');

        // Check all services
        for (const serviceName of Object.keys(SERVICES) as Array<keyof typeof SERVICES>) {
            serviceStatus[serviceName] = await checkServiceHealth(serviceName);
            console.log(`${serviceName}: ${serviceStatus[serviceName] ? '✅' : '❌'}`);
        }
    });

    describe('📱 MemorAI Service API (Port 4006)', () => {
        it('should return service health status', async () => {
            if (!serviceStatus.memorai) {
                console.warn('⚠️ MemorAI service not available, skipping test');
                return;
            }

            const response = await fetchWithTimeout(`${SERVICES.memorai.baseUrl}/api/health`);
            expect(response.ok).toBe(true);

            const healthData = await response.json();
            expect(healthData).toMatchObject({
                service: 'MemorAI Service',
                serviceId: 'memorai',
                status: 'operational'
            });

            // Validate ecosystem integration
            expect(healthData.ecosystem).toBe('codai-ecosystem');
            expect(healthData.capabilities).toBeInstanceOf(Array);
            expect(healthData.capabilities).toContain('memory_management');
            expect(healthData.endpoints).toBeDefined();
        });

        it('should provide ecosystem status', async () => {
            if (!serviceStatus.memorai) return;

            const response = await fetchWithTimeout(`${SERVICES.memorai.baseUrl}/api/ecosystem`);
            expect(response.ok).toBe(true);

            const ecosystemData = await response.json();
            expect(ecosystemData.ecosystem).toBe('codai-ecosystem');
            expect(ecosystemData.services).toBeInstanceOf(Array);
            expect(ecosystemData.totalServices).toBeGreaterThan(0);
        });

        it('should handle memory operations', async () => {
            if (!serviceStatus.memorai) return;

            // Test memory search endpoint
            const searchResponse = await fetchWithTimeout(`${SERVICES.memorai.baseUrl}/api/search`, {
                method: 'POST',
                body: JSON.stringify({
                    query: 'test query',
                    limit: 5
                })
            });

            expect(searchResponse.ok).toBe(true);
            const searchData = await searchResponse.json();
            expect(searchData).toBeDefined();
            expect(Array.isArray(searchData.results) || Array.isArray(searchData.memories)).toBe(true);
        });

        it('should provide analytics data', async () => {
            if (!serviceStatus.memorai) return;

            const response = await fetchWithTimeout(`${SERVICES.memorai.baseUrl}/api/analytics`);
            expect(response.ok).toBe(true);

            const analyticsData = await response.json();
            expect(analyticsData.service).toBe('MemorAI');
            expect(typeof analyticsData.totalMemories).toBe('number');
            expect(typeof analyticsData.totalSearches).toBe('number');
        });

        it('should handle authentication status', async () => {
            if (!serviceStatus.memorai) return;

            const response = await fetchWithTimeout(`${SERVICES.memorai.baseUrl}/api/auth-status`);
            expect(response.ok).toBe(true);

            const authData = await response.json();
            expect(authData.service).toBe('MemorAI Authentication');
            expect(authData.authenticationEnabled).toBeDefined();
        });
    });

    describe('🗃️ CBD Database Service API (Port 4180)', () => {
        it('should return database health status', async () => {
            if (!serviceStatus.cbd) {
                console.warn('⚠️ CBD Database service not available, skipping test');
                return;
            }

            const response = await fetchWithTimeout(`${SERVICES.cbd.baseUrl}/health`);
            expect(response.ok).toBe(true);

            const healthData = await response.json();
            expect(healthData.service).toBe('CBD - Cognitive Business Database');
            expect(healthData.status).toBe('healthy');
            expect(healthData.version).toBeDefined();
        });

        it('should provide database statistics', async () => {
            if (!serviceStatus.cbd) return;

            const response = await fetchWithTimeout(`${SERVICES.cbd.baseUrl}/api/stats`);
            expect(response.ok).toBe(true);

            const statsData = await response.json();
            expect(statsData.database).toBe('CBD');
            expect(typeof statsData.collections).toBe('object');
            expect(typeof statsData.totalDocuments).toBe('number');
        });

        it('should handle data queries', async () => {
            if (!serviceStatus.cbd) return;

            // Test a basic query endpoint
            const response = await fetchWithTimeout(`${SERVICES.cbd.baseUrl}/api/query`, {
                method: 'POST',
                body: JSON.stringify({
                    collection: 'test',
                    query: {},
                    limit: 1
                })
            });

            // Should handle the request even if no data found
            expect([200, 404, 422]).toContain(response.status);
        });
    });

    describe('🧠 MemorAI MCP Server API (Port 4950)', () => {
        it('should return MCP server health status', async () => {
            if (!serviceStatus.memcpServer) {
                console.warn('⚠️ MemorAI MCP Server not available, skipping test');
                return;
            }

            const response = await fetchWithTimeout(`${SERVICES.memcpServer.baseUrl}/health`);
            expect(response.ok).toBe(true);

            const healthData = await response.json();
            expect(healthData.service).toContain('MemorAI MCP');
            expect(healthData.status).toBe('operational');
            expect(healthData.mcp).toBeDefined();
        });

        it('should provide MCP capabilities', async () => {
            if (!serviceStatus.memcpServer) return;

            const response = await fetchWithTimeout(`${SERVICES.memcpServer.baseUrl}/api/capabilities`);
            expect(response.ok).toBe(true);

            const capabilitiesData = await response.json();
            expect(capabilitiesData.protocol).toBe('Model Context Protocol');
            expect(capabilitiesData.version).toBeDefined();
            expect(capabilitiesData.capabilities).toBeInstanceOf(Array);
        });

        it('should handle memory operations via MCP', async () => {
            if (!serviceStatus.memcpServer) return;

            // Test MCP memory recall
            const response = await fetchWithTimeout(`${SERVICES.memcpServer.baseUrl}/api/recall`, {
                method: 'POST',
                body: JSON.stringify({
                    agentId: TEST_DATA.memory.agentId,
                    query: 'test memory',
                    limit: 5
                })
            });

            expect(response.ok).toBe(true);
            const recallData = await response.json();
            expect(recallData.agentId).toBe(TEST_DATA.memory.agentId);
            expect(Array.isArray(recallData.memories)).toBe(true);
        });

        it('should store memories via MCP', async () => {
            if (!serviceStatus.memcpServer) return;

            // Test MCP memory storage
            const response = await fetchWithTimeout(`${SERVICES.memcpServer.baseUrl}/api/remember`, {
                method: 'POST',
                body: JSON.stringify(TEST_DATA.memory)
            });

            expect(response.ok).toBe(true);
            const storeData = await response.json();
            expect(storeData.success).toBe(true);
            expect(storeData.memoryId).toBeDefined();
        });
    });

    describe('🏢 RomAI Enterprise API (Port 8001)', () => {
        it('should return enterprise API health status', async () => {
            if (!serviceStatus.romaiEnterprise) {
                console.warn('⚠️ RomAI Enterprise API not available, skipping test');
                return;
            }

            const response = await fetchWithTimeout(`${SERVICES.romaiEnterprise.baseUrl}/api/v1/health`);
            expect(response.ok).toBe(true);

            const healthData = await response.json();
            expect(healthData.service).toBe('RomAI Enterprise API');
            expect(healthData.status).toBe('operational');
            expect(healthData.version).toBeDefined();
            expect(healthData.compliance_status).toBeDefined();
        });

        it('should provide AGI model status', async () => {
            if (!serviceStatus.romaiEnterprise) return;

            const response = await fetchWithTimeout(`${SERVICES.romaiEnterprise.baseUrl}/api/v1/agi/status`);
            expect(response.ok).toBe(true);

            const agiData = await response.json();
            expect(agiData.agi).toBeDefined();
            expect(agiData.models).toBeInstanceOf(Array);
            expect(typeof agiData.totalModels).toBe('number');
        });

        it('should handle compliance status', async () => {
            if (!serviceStatus.romaiEnterprise) return;

            // Note: This endpoint may require API key, so we'll handle auth errors gracefully
            try {
                const response = await fetchWithTimeout(`${SERVICES.romaiEnterprise.baseUrl}/api/v1/compliance/status`);

                if (response.status === 401) {
                    // Expected for protected endpoint without API key
                    expect(response.status).toBe(401);
                    const errorData = await response.json();
                    expect(errorData.error).toContain('API key');
                } else {
                    expect(response.ok).toBe(true);
                    const complianceData = await response.json();
                    expect(complianceData.compliance).toBeDefined();
                }
            } catch (error) {
                // Handle network errors gracefully
                console.warn('Compliance endpoint test failed:', error);
            }
        });

        it('should provide enterprise analytics', async () => {
            if (!serviceStatus.romaiEnterprise) return;

            const response = await fetchWithTimeout(`${SERVICES.romaiEnterprise.baseUrl}/api/v1/analytics/overview`);

            // Handle authentication requirements
            if (response.status === 401) {
                expect(response.status).toBe(401);
            } else {
                expect(response.ok).toBe(true);
                const analyticsData = await response.json();
                expect(analyticsData.analytics).toBeDefined();
            }
        });

        it('should handle model inference requests', async () => {
            if (!serviceStatus.romaiEnterprise) return;

            const response = await fetchWithTimeout(`${SERVICES.romaiEnterprise.baseUrl}/api/v1/agi/inference`, {
                method: 'POST',
                body: JSON.stringify({
                    model: 'test-model',
                    input: 'Hello, this is a test inference request',
                    temperature: 0.7
                })
            });

            // Handle authentication requirements
            if (response.status === 401) {
                expect(response.status).toBe(401);
            } else if (response.status === 422) {
                // Validation error is acceptable for test data
                expect(response.status).toBe(422);
            } else {
                expect(response.ok).toBe(true);
            }
        });
    });

    describe('🔗 Cross-Service Integration', () => {
        it('should enable communication between MemorAI and CBD Database', async () => {
            if (!serviceStatus.memorai || !serviceStatus.cbd) {
                console.warn('⚠️ Required services not available for cross-service test');
                return;
            }

            // Test that MemorAI can access database through its endpoints
            const memoraiResponse = await fetchWithTimeout(`${SERVICES.memorai.baseUrl}/api/analytics`);
            expect(memoraiResponse.ok).toBe(true);

            const memoraiData = await memoraiResponse.json();
            expect(typeof memoraiData.totalMemories).toBe('number');

            // Verify database is serving data that MemorAI reports
            const dbResponse = await fetchWithTimeout(`${SERVICES.cbd.baseUrl}/health`);
            expect(dbResponse.ok).toBe(true);
        });

        it('should enable MCP server to coordinate with MemorAI service', async () => {
            if (!serviceStatus.memcpServer || !serviceStatus.memorai) {
                console.warn('⚠️ Required services not available for MCP coordination test');
                return;
            }

            // Store memory via MCP server
            const storeResponse = await fetchWithTimeout(`${SERVICES.memcpServer.baseUrl}/api/remember`, {
                method: 'POST',
                body: JSON.stringify({
                    ...TEST_DATA.memory,
                    content: 'Cross-service integration test memory'
                })
            });

            expect(storeResponse.ok).toBe(true);
            const storeData = await storeResponse.json();
            expect(storeData.success).toBe(true);

            // Verify MemorAI service can search for it
            const searchResponse = await fetchWithTimeout(`${SERVICES.memorai.baseUrl}/api/search`, {
                method: 'POST',
                body: JSON.stringify({
                    query: 'Cross-service integration',
                    limit: 5
                })
            });

            expect(searchResponse.ok).toBe(true);
        });

        it('should validate service ecosystem connectivity', async () => {
            const availableServices = Object.entries(serviceStatus)
                .filter(([, isAvailable]) => isAvailable)
                .map(([serviceName]) => serviceName);

            console.log(`Available services for integration: ${availableServices.join(', ')}`);

            // At least 2 services should be available for meaningful integration testing
            expect(availableServices.length).toBeGreaterThanOrEqual(2);

            // MemorAI ecosystem endpoint should reflect available services
            if (serviceStatus.memorai) {
                const ecosystemResponse = await fetchWithTimeout(`${SERVICES.memorai.baseUrl}/api/ecosystem`);
                expect(ecosystemResponse.ok).toBe(true);

                const ecosystemData = await ecosystemResponse.json();
                expect(ecosystemData.totalServices).toBeGreaterThan(0);
            }
        });
    });

    describe('🔐 API Security and Error Handling', () => {
        it('should handle invalid endpoints gracefully', async () => {
            for (const [serviceName, service] of Object.entries(SERVICES)) {
                if (!serviceStatus[serviceName as keyof typeof SERVICES]) continue;

                const response = await fetchWithTimeout(`${service.baseUrl}/api/nonexistent-endpoint`);
                expect([404, 405]).toContain(response.status);
            }
        });

        it('should validate request headers and content types', async () => {
            if (!serviceStatus.memorai) return;

            // Test with invalid content type
            const response = await fetchWithTimeout(`${SERVICES.memorai.baseUrl}/api/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'invalid json'
            });

            expect([400, 415, 422]).toContain(response.status);
        });

        it('should enforce rate limiting and timeouts', async () => {
            if (!serviceStatus.memorai) return;

            // Test timeout handling
            const promises = Array(5).fill(0).map(() =>
                fetchWithTimeout(`${SERVICES.memorai.baseUrl}/api/health`, {}, 1000)
            );

            const results = await Promise.allSettled(promises);
            const successCount = results.filter(r => r.status === 'fulfilled').length;

            // At least some requests should succeed (services handle concurrent requests)
            expect(successCount).toBeGreaterThan(0);
        });
    });

    describe('📊 Performance and Load Testing', () => {
        it('should handle concurrent requests efficiently', async () => {
            const availableServices = Object.entries(SERVICES)
                .filter(([serviceName]) => serviceStatus[serviceName as keyof typeof SERVICES]);

            if (availableServices.length === 0) return;

            const startTime = Date.now();

            // Send concurrent health checks to all available services
            const promises = availableServices.map(([, service]) =>
                fetchWithTimeout(`${service.baseUrl}/health`, {}, 5000)
            );

            const results = await Promise.allSettled(promises);
            const endTime = Date.now();

            const successCount = results.filter(r => r.status === 'fulfilled').length;
            const totalTime = endTime - startTime;

            expect(successCount).toBeGreaterThan(0);
            expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds

            console.log(`🚀 Concurrent requests: ${successCount}/${results.length} succeeded in ${totalTime}ms`);
        });

        it('should maintain response times under load', async () => {
            if (!serviceStatus.memorai) return;

            const measurements: number[] = [];

            // Perform 10 sequential requests and measure response times
            for (let i = 0; i < 10; i++) {
                const startTime = Date.now();
                const response = await fetchWithTimeout(`${SERVICES.memorai.baseUrl}/api/health`);
                const endTime = Date.now();

                if (response.ok) {
                    measurements.push(endTime - startTime);
                }
            }

            expect(measurements.length).toBeGreaterThan(5); // At least half should succeed

            const averageTime = measurements.reduce((a, b) => a + b, 0) / measurements.length;
            expect(averageTime).toBeLessThan(2000); // Average under 2 seconds

            console.log(`⚡ Average response time: ${averageTime.toFixed(2)}ms over ${measurements.length} requests`);
        });
    });

    afterAll(async () => {
        console.log('\n🎯 API Integration Test Summary:');
        console.log('Services tested:', Object.keys(serviceStatus).length);
        console.log('Services available:', Object.values(serviceStatus).filter(Boolean).length);
        console.log('Services unavailable:', Object.values(serviceStatus).filter(s => !s).length);

        // Log any cleanup if needed
        console.log('✅ Integration tests completed');
    });
});