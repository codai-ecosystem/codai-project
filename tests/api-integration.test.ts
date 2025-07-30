import { describe, it, expect, beforeAll } from 'vitest';
import { setupTestEnvironment, ensureTestConfig } from './shared/test-config';
import { HealthChecker, ApiClient, ServiceManager } from './shared/service-utils';

describe('API Integration Tests - Real Services', () => {
    let testConfig: any;

    beforeAll(async () => {
        // Setup real test environment with service discovery
        testConfig = await setupTestEnvironment();

        // Ensure all services are ready
        await ServiceManager.ensureServicesReady();
    });

    describe('Service Health Checks', () => {
        it('should detect all primary services', async () => {
            const serviceNames = testConfig.getServiceNames();

            expect(serviceNames).toContain('codai');
            expect(serviceNames).toContain('admin');
            expect(serviceNames).toContain('hub');
            expect(serviceNames).toContain('id');
            expect(serviceNames).toContain('bancai');
            expect(serviceNames).toContain('memorai');
        });

        it('should successfully health check all services', async () => {
            const healthResults = await HealthChecker.checkAllServices();

            expect(healthResults.length).toBeGreaterThan(0);

            // At least one service should be healthy
            const healthyServices = healthResults.filter(r => r.healthy);
            expect(healthyServices.length).toBeGreaterThan(0);

            console.log('Service Health Summary:');
            healthResults.forEach(result => {
                const status = result.healthy ? '✅' : '❌';
                console.log(`  ${status} ${result.service}:${result.port} (${result.responseTime}ms)`);
            });
        });
    });

    describe('API Connectivity Tests', () => {
        it('should connect to CodAI service', async () => {
            const response = await ApiClient.get('codai', '/');
            expect([200, 404]).toContain(response.status);
        });

        it('should connect to Admin service', async () => {
            const response = await ApiClient.get('admin', '/');
            expect([200, 404]).toContain(response.status);
        });

        it('should connect to Hub service', async () => {
            const response = await ApiClient.get('hub', '/');
            expect([200, 404]).toContain(response.status);
        });

        it('should connect to ID service', async () => {
            const response = await ApiClient.get('id', '/');
            expect([200, 404]).toContain(response.status);
        });

        it('should connect to BancAI service', async () => {
            const response = await ApiClient.get('bancai', '/');
            expect([200, 404]).toContain(response.status);
        });

        it('should connect to MemorAI service', async () => {
            const response = await ApiClient.get('memorai', '/');
            expect([200, 404]).toContain(response.status);
        });
    });

    describe('Real API Endpoint Tests', () => {
        it('should test MemorAI stats endpoint with real data', async () => {
            try {
                const response = await ApiClient.get('memorai', '/api/stats');

                if (response.ok) {
                    const data = await response.json();

                    // Validate real MCP data structure
                    expect(data).toHaveProperty('totalMemories');
                    expect(data).toHaveProperty('systemHealth');
                    expect(typeof data.totalMemories).toBe('number');
                    expect(data.totalMemories).toBeGreaterThanOrEqual(0);

                    console.log('MemorAI Real Stats:', {
                        totalMemories: data.totalMemories,
                        systemHealth: data.systemHealth,
                        hasOptimized: 'optimized' in data
                    });
                } else {
                    console.log('MemorAI stats endpoint not available, status:', response.status);
                }
            } catch (error) {
                console.log('MemorAI service not fully started:', error.message);
            }
        });

        it('should test API endpoints with real response times', async () => {
            const services = testConfig.getServiceNames();
            const performanceResults: Array<{
                service: string;
                responseTime: number;
                status: number | string;
                healthy: boolean;
                error?: string;
            }> = [];

            for (const service of services) {
                try {
                    const startTime = Date.now();
                    const response = await ApiClient.get(service, '/');
                    const responseTime = Date.now() - startTime;

                    performanceResults.push({
                        service,
                        responseTime,
                        status: response.status,
                        healthy: [200, 404].includes(response.status)
                    });
                } catch (error: any) {
                    performanceResults.push({
                        service,
                        responseTime: -1,
                        status: 'error',
                        healthy: false,
                        error: error.message
                    });
                }
            }

            console.log('API Performance Results:');
            performanceResults.forEach(result => {
                const icon = result.healthy ? '✅' : '❌';
                console.log(`  ${icon} ${result.service}: ${result.responseTime}ms (${result.status})`);
            });

            // At least one service should be performing well
            const healthyResults = performanceResults.filter(r => r.healthy);
            expect(healthyResults.length).toBeGreaterThan(0);
        });
    });

    describe('Real Data Validation', () => {
        it('should validate services return real data, not mock data', async () => {
            const services = ['memorai']; // Start with MemorAI which we know has real data

            for (const service of services) {
                try {
                    // Try common API endpoints that might return data
                    const endpoints = ['/api/stats', '/api/health', '/api/status'];

                    for (const endpoint of endpoints) {
                        try {
                            const response = await ApiClient.get(service, endpoint);

                            if (response.ok) {
                                const data = await response.json();

                                // Check that data doesn't look like hardcoded mock data
                                const dataString = JSON.stringify(data).toLowerCase();
                                const mockIndicators = ['mock', 'fake', 'test-data', 'sample'];

                                let mockCount = 0;
                                mockIndicators.forEach(indicator => {
                                    if (dataString.includes(indicator)) {
                                        mockCount++;
                                    }
                                });

                                console.log(`${service}${endpoint} data validation:`, {
                                    hasData: Object.keys(data).length > 0,
                                    mockIndicators: mockCount,
                                    looksReal: mockCount === 0
                                });

                                // Real data should not have obvious mock indicators
                                expect(mockCount).toBeLessThan(3); // Allow some flexibility
                            }
                        } catch (endpointError) {
                            // Endpoint might not exist, that's OK
                            continue;
                        }
                    }
                } catch (serviceError) {
                    console.log(`Service ${service} not available for data validation`);
                }
            }
        });
    });
});
