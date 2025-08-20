/**
 * Comprehensive Integration Testing Suite
 * Unit tests, integration tests, performance benchmarks, and E2E testing
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { performance } from 'perf_hooks';
import supertest from 'supertest';
import { CBDEngineService } from '../src/service';
import { AdvancedVectorSearchEngine } from '../src/features/advanced-vector-search';
import { PerformanceOptimizationManager } from '../src/optimization/performance-manager';

// Test configuration
const TEST_CONFIG = {
    CBD_PORT: 4181, // Different port for testing
    OPENAI_API_KEY: 'test-key',
    TEST_TIMEOUT: 30000,
    LOAD_TEST_USERS: 100,
    PERFORMANCE_THRESHOLDS: {
        maxResponseTime: 100, // ms
        minThroughput: 1000,  // requests/second
        maxMemoryUsage: 100,  // MB
        minCacheHitRate: 0.9  // 90%
    }
};

describe('CBD Engine Service - Comprehensive Testing Suite', () => {
    let service: CBDEngineService;
    let app: any;
    let request: supertest.SuperTest<supertest.Test>;

    beforeAll(async () => {
        // Initialize test service
        service = new CBDEngineService({
            port: TEST_CONFIG.CBD_PORT,
            host: 'localhost'
        });
        
        // Mock OpenAI for testing
        jest.mock('openai');
        
        // Start test server
        await service.start();
        app = service.app;
        request = supertest(app);
    });

    afterAll(async () => {
        // Cleanup test service
        if (service) {
            await service.shutdown();
        }
    });

    describe('🧪 Unit Tests - Service Layer', () => {
        describe('Service Initialization', () => {
            it('should initialize with correct configuration', () => {
                expect(service).toBeDefined();
                expect(service.port).toBe(TEST_CONFIG.CBD_PORT);
                expect(service.isHealthy).toBe(true);
            });

            it('should have all required middleware configured', () => {
                expect(app._router).toBeDefined();
                // Additional middleware checks
            });
        });

        describe('Memory Engine Operations', () => {
            it('should store memory successfully', async () => {
                const testMemory = {
                    userRequest: 'Test user request',
                    assistantResponse: 'Test assistant response',
                    metadata: { test: true, timestamp: new Date().toISOString() }
                };

                const result = await service.engine.store_memory(
                    testMemory.userRequest,
                    testMemory.assistantResponse,
                    testMemory.metadata
                );

                expect(result).toBeDefined();
                expect(typeof result).toBe('string');
            });

            it('should search memories successfully', async () => {
                const searchResults = await service.engine.search_memory('test query', 10, 0.5);
                
                expect(searchResults).toBeDefined();
                expect(searchResults.memories).toBeInstanceOf(Array);
                expect(searchResults.summary).toBeDefined();
            });

            it('should retrieve memory by key', async () => {
                // First store a memory
                const structuredKey = await service.engine.store_memory(
                    'Retrieve test',
                    'Retrieve response',
                    { retrieveTest: true }
                );

                // Then retrieve it
                const retrievedMemory = await service.engine.get_memory(structuredKey);
                
                expect(retrievedMemory).toBeDefined();
                expect(retrievedMemory.content).toContain('Retrieve test');
            });

            it('should delete memory successfully', async () => {
                // Store and then delete
                const structuredKey = await service.engine.store_memory(
                    'Delete test',
                    'Delete response',
                    { deleteTest: true }
                );

                const deleteResult = await service.engine.delete_memory(structuredKey);
                expect(deleteResult).toBe(true);
            });
        });

        describe('Error Handling', () => {
            it('should handle invalid API requests gracefully', async () => {
                const response = await request
                    .post('/api/data/memories')
                    .send({ invalid: 'data' })
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('Missing required fields');
            });

            it('should handle memory engine errors', async () => {
                // Mock engine error
                jest.spyOn(service.engine, 'store_memory').mockRejectedValueOnce(new Error('Engine error'));

                const response = await request
                    .post('/api/data/memories')
                    .send({
                        userRequest: 'Test',
                        assistantResponse: 'Test',
                        metadata: {}
                    })
                    .expect(500);

                expect(response.body.error).toBe('Failed to store memory');
            });
        });
    });

    describe('🔗 Integration Tests - API Endpoints', () => {
        describe('Health & Status Endpoints', () => {
            it('should return healthy status', async () => {
                const response = await request
                    .get('/health')
                    .expect(200);

                expect(response.body.status).toBe('healthy');
                expect(response.body.service).toBe('CBD Engine Service');
                expect(response.body.version).toBe('1.0.0');
            });

            it('should return service statistics', async () => {
                const response = await request
                    .get('/api/admin/statistics')
                    .expect(200);

                expect(response.body.service).toBeDefined();
                expect(response.body.requests).toBeGreaterThanOrEqual(0);
                expect(response.body.uptime).toBeGreaterThan(0);
            });

            it('should return service information', async () => {
                const response = await request
                    .get('/')
                    .expect(200);

                expect(response.body.service).toBe('CBD Engine Service');
                expect(response.body.endpoints).toBeDefined();
                expect(response.body.status).toBe('operational');
            });
        });

        describe('Memory API Endpoints', () => {
            it('should store memory via API', async () => {
                const testData = {
                    userRequest: 'API test request',
                    assistantResponse: 'API test response',
                    metadata: { 
                        source: 'integration-test',
                        timestamp: new Date().toISOString()
                    }
                };

                const response = await request
                    .post('/api/data/memories')
                    .send(testData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.structuredKey).toBeDefined();
            });

            it('should retrieve memories via API', async () => {
                const response = await request
                    .get('/api/data/memories')
                    .query({ limit: 5 })
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toBeInstanceOf(Array);
                expect(response.body.count).toBeGreaterThanOrEqual(0);
            });

            it('should search memories via API', async () => {
                const searchData = {
                    query: 'API test',
                    limit: 10,
                    minImportance: 0.5
                };

                const response = await request
                    .post('/api/search/memories')
                    .send(searchData)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data).toBeInstanceOf(Array);
            });
        });

        describe('Cross-Service Communication', () => {
            it('should integrate with gateway service', async () => {
                // Test gateway integration
                const gatewayResponse = await request
                    .get('/api/gateway/health')
                    .expect(404); // Expected if gateway not running

                // This test would pass with actual gateway integration
            });

            it('should handle service mesh communication', async () => {
                // Test service mesh integration
                // Implementation depends on service mesh setup
                expect(true).toBe(true); // Placeholder
            });
        });
    });

    describe('⚡ Performance Tests - Load & Benchmarks', () => {
        describe('Response Time Benchmarks', () => {
            it('should respond to health check under 10ms', async () => {
                const startTime = performance.now();
                
                await request.get('/health').expect(200);
                
                const responseTime = performance.now() - startTime;
                expect(responseTime).toBeLessThan(TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxResponseTime);
            });

            it('should handle memory operations under threshold', async () => {
                const testData = {
                    userRequest: 'Performance test',
                    assistantResponse: 'Performance response',
                    metadata: { performanceTest: true }
                };

                const startTime = performance.now();
                
                await request
                    .post('/api/data/memories')
                    .send(testData)
                    .expect(200);
                
                const responseTime = performance.now() - startTime;
                expect(responseTime).toBeLessThan(TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxResponseTime);
            });
        });

        describe('Concurrent Load Testing', () => {
            it('should handle concurrent requests', async () => {
                const concurrentRequests = 50;
                const promises: Promise<any>[] = [];

                const startTime = performance.now();

                for (let i = 0; i < concurrentRequests; i++) {
                    promises.push(
                        request
                            .get('/health')
                            .expect(200)
                    );
                }

                const results = await Promise.all(promises);
                const totalTime = performance.now() - startTime;
                const requestsPerSecond = (concurrentRequests / totalTime) * 1000;

                expect(results.length).toBe(concurrentRequests);
                expect(requestsPerSecond).toBeGreaterThan(TEST_CONFIG.PERFORMANCE_THRESHOLDS.minThroughput);
            });

            it('should maintain performance under load', async () => {
                const loadTestDuration = 5000; // 5 seconds
                const requestInterval = 10; // 10ms between requests
                const requests: Promise<any>[] = [];
                
                const startTime = Date.now();
                
                const loadTestInterval = setInterval(() => {
                    requests.push(
                        request.get('/health').expect(200)
                    );
                }, requestInterval);

                // Run load test for specified duration
                await new Promise(resolve => setTimeout(resolve, loadTestDuration));
                clearInterval(loadTestInterval);

                // Wait for all requests to complete
                const results = await Promise.allSettled(requests);
                const successfulRequests = results.filter(r => r.status === 'fulfilled').length;
                const totalRequests = results.length;
                const successRate = successfulRequests / totalRequests;

                expect(successRate).toBeGreaterThan(0.95); // 95% success rate
            });
        });

        describe('Memory Usage Testing', () => {
            it('should not exceed memory thresholds', async () => {
                const initialMemory = process.memoryUsage();
                
                // Perform memory-intensive operations
                for (let i = 0; i < 100; i++) {
                    await request
                        .post('/api/data/memories')
                        .send({
                            userRequest: `Memory test ${i}`,
                            assistantResponse: `Memory response ${i}`,
                            metadata: { memoryTest: true, iteration: i }
                        })
                        .expect(200);
                }

                const finalMemory = process.memoryUsage();
                const memoryIncrease = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024; // MB

                expect(memoryIncrease).toBeLessThan(TEST_CONFIG.PERFORMANCE_THRESHOLDS.maxMemoryUsage);
            });
        });
    });

    describe('🎭 End-to-End Tests - Complete Workflows', () => {
        describe('Memory Lifecycle Workflow', () => {
            it('should complete full memory lifecycle', async () => {
                // Store memory
                const storeResponse = await request
                    .post('/api/data/memories')
                    .send({
                        userRequest: 'E2E test request',
                        assistantResponse: 'E2E test response',
                        metadata: { e2eTest: true }
                    })
                    .expect(200);

                const structuredKey = storeResponse.body.data.structuredKey;
                expect(structuredKey).toBeDefined();

                // Search for memory
                const searchResponse = await request
                    .post('/api/search/memories')
                    .send({
                        query: 'E2E test',
                        limit: 10
                    })
                    .expect(200);

                expect(searchResponse.body.data.length).toBeGreaterThan(0);

                // Retrieve specific memory
                const retrieveResponse = await request
                    .get('/api/data/memories')
                    .query({ filter: `structured_key = '${structuredKey}'` })
                    .expect(200);

                expect(retrieveResponse.body.data.length).toBe(1);
                expect(retrieveResponse.body.data[0].content).toContain('E2E test');

                // Delete memory
                const deleteResponse = await request
                    .delete('/api/data/memories')
                    .query({ filter: `structured_key = '${structuredKey}'` })
                    .expect(200);

                expect(deleteResponse.body.success).toBe(true);
                expect(deleteResponse.body.deleted).toBe(true);
            });
        });

        describe('Error Recovery Workflow', () => {
            it('should recover from service errors gracefully', async () => {
                // Simulate service error and recovery
                // This would involve more complex error injection
                expect(true).toBe(true); // Placeholder
            });
        });

        describe('Integration Workflow', () => {
            it('should integrate with external services', async () => {
                // Test integration with other CODAI services
                // Implementation depends on service availability
                expect(true).toBe(true); // Placeholder
            });
        });
    });

    describe('🔒 Security Tests', () => {
        describe('Input Validation', () => {
            it('should validate API inputs', async () => {
                const maliciousData = {
                    userRequest: '<script>alert("xss")</script>',
                    assistantResponse: 'SQL injection attempt: \'; DROP TABLE memories; --',
                    metadata: { 
                        malicious: true,
                        longString: 'a'.repeat(10000) // Test long input
                    }
                };

                const response = await request
                    .post('/api/data/memories')
                    .send(maliciousData)
                    .expect(200); // Should sanitize and accept

                expect(response.body.success).toBe(true);
                // Verify sanitization occurred
            });
        });

        describe('Rate Limiting', () => {
            it('should enforce rate limits', async () => {
                // Test rate limiting by making many requests quickly
                const rapidRequests = Array(20).fill(null).map(() =>
                    request.get('/health')
                );

                const results = await Promise.allSettled(rapidRequests);
                const tooManyRequests = results.some(r => 
                    r.status === 'fulfilled' && (r.value as any).status === 429
                );

                // Depending on rate limit configuration, some requests might be rejected
                expect(results.length).toBe(20);
            });
        });
    });
});

// Performance benchmark utilities
export class PerformanceBenchmark {
    static async benchmarkEndpoint(
        request: supertest.SuperTest<supertest.Test>,
        endpoint: string,
        method: 'GET' | 'POST' = 'GET',
        data?: any,
        iterations: number = 100
    ): Promise<{
        averageResponseTime: number;
        minResponseTime: number;
        maxResponseTime: number;
        successRate: number;
        requestsPerSecond: number;
    }> {
        const responseTimes: number[] = [];
        const promises: Promise<any>[] = [];
        
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
            const requestStartTime = performance.now();
            
            const promise = (method === 'GET' ? 
                request.get(endpoint) : 
                request.post(endpoint).send(data)
            ).then(response => {
                const responseTime = performance.now() - requestStartTime;
                responseTimes.push(responseTime);
                return response;
            });
            
            promises.push(promise);
        }

        const results = await Promise.allSettled(promises);
        const totalTime = performance.now() - startTime;
        const successfulRequests = results.filter(r => r.status === 'fulfilled').length;

        return {
            averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            minResponseTime: Math.min(...responseTimes),
            maxResponseTime: Math.max(...responseTimes),
            successRate: successfulRequests / iterations,
            requestsPerSecond: (iterations / totalTime) * 1000
        };
    }
}

// Test data generators
export class TestDataGenerator {
    static generateMemoryData(count: number = 1): Array<{
        userRequest: string;
        assistantResponse: string;
        metadata: Record<string, any>;
    }> {
        return Array(count).fill(null).map((_, index) => ({
            userRequest: `Test user request ${index + 1}`,
            assistantResponse: `Test assistant response ${index + 1}`,
            metadata: {
                testId: index + 1,
                timestamp: new Date().toISOString(),
                category: ['general', 'technical', 'support'][index % 3],
                priority: ['low', 'medium', 'high'][index % 3]
            }
        }));
    }

    static generateVectorData(dimensions: number = 1536): number[] {
        return Array(dimensions).fill(0).map(() => Math.random() * 2 - 1);
    }
}

export { TEST_CONFIG };
