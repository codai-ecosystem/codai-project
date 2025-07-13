import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UltimateMemoryEngine } from '../../src/lib/memory-engine';
import { UltimateMemoryService, type MemoryServiceConfig } from '../../src/lib/memory-service';
import type { MemoryConfig, MemoryQuery } from '../../src/types/memory';

describe('Ultimate Memory System Integration Tests', () => {
    let memoryEngine: UltimateMemoryEngine;
    let memoryService: UltimateMemoryService;

    const testConfig: MemoryConfig = {
        maxEntities: 1000,
        maxRelations: 5000,
        enableVectorSearch: true,
        enableRealTimeSync: false,
        enableAnalytics: true,
        cleanupInterval: 60000,
        maxAccessLogSize: 100,
        cacheSize: 50,
        vectorDimensions: 384,
        embeddingProvider: 'test',
        persistentStorage: false,
        storageBackend: 'memory',
        encryptionEnabled: false,
        compressionEnabled: false
    };

    const testServiceConfig: MemoryServiceConfig = {
        ...testConfig,
        enableCache: true,
        cacheTTL: 30000,
        enableSecurityAudit: false,
        maxRequestsPerMinute: 100,
        enableCompression: false,
        enableEncryption: false
    };

    beforeEach(() => {
        memoryEngine = new UltimateMemoryEngine(testConfig);
        memoryService = new UltimateMemoryService(testServiceConfig);
    });

    afterEach(async () => {
        await memoryEngine.close();
        await memoryService.close();
    });

    describe('Memory Engine Core Functionality', () => {
        it('should create and store entities', async () => {
            const entityData = {
                name: 'Test Entity',
                entityType: 'function' as const,
                metadata: { test: true },
                tags: ['test', 'function'],
                observations: ['Created for testing'],
                priority: 1,
                confidence: 1.0,
                project_id: 'test-project'
            };

            const result = await memoryEngine.createEntity(entityData);

            // Memory engine returns the entity directly, not wrapped in result object
            expect(result).toBeDefined();
            expect(result.name).toBe('Test Entity');
            expect(result.entityType).toBe('function');
            expect(result.id).toBeDefined();
        });

        it('should search entities by text', async () => {
            // Create test entities
            await memoryEngine.createEntity({
                name: 'JavaScript Function',
                entityType: 'function' as const,
                metadata: {},
                tags: ['javascript', 'processing'],
                observations: [],
                priority: 1,
                confidence: 1.0
            });

            await memoryEngine.createEntity({
                name: 'Python Script',
                entityType: 'file' as const,
                metadata: {},
                tags: ['python', 'analysis'],
                observations: [],
                priority: 1,
                confidence: 1.0
            });

            // Search for entities
            const searchQuery: MemoryQuery = {
                text: 'javascript',
                minScore: 0.1,
                maxResults: 10
            };

            const searchResult = await memoryEngine.search(searchQuery, { limit: 10 });
            expect(searchResult).toBeDefined();
            expect(Array.isArray(searchResult)).toBe(true);
        });

        it('should handle analytics and metrics', async () => {
            // Create some test data
            await memoryEngine.createEntity({
                name: 'Analytics Test Entity',
                entityType: 'component' as const,
                metadata: {},
                tags: ['test'],
                observations: [],
                priority: 1,
                confidence: 1.0
            });

            const analytics = await memoryEngine.getAnalytics();
            expect(analytics).toBeDefined();
            expect(analytics.metrics.total_entities).toBeGreaterThan(0);
        });

        it('should generate knowledge graph', async () => {
            // Create entities and relations
            const entity1 = await memoryEngine.createEntity({
                name: 'Entity 1',
                entityType: 'class' as const,
                metadata: {},
                tags: [],
                observations: [],
                priority: 1,
                confidence: 1.0
            });

            const entity2 = await memoryEngine.createEntity({
                name: 'Entity 2',
                entityType: 'function' as const,
                metadata: {},
                tags: [],
                observations: [],
                priority: 1,
                confidence: 1.0
            });

            if (entity1 && entity2) {
                await memoryEngine.createRelation(
                    entity1.id,
                    entity2.id,
                    'contains',
                    { description: 'Test relation' }
                );
            }

            const graph = await memoryEngine.getKnowledgeGraph();
            expect(graph).toBeDefined();
            expect(graph.entities).toBeDefined();
            expect(graph.relations).toBeDefined();
        });
    });

    describe('Memory Service Advanced Features', () => {
        it('should create entities through service layer', async () => {
            const entityData = {
                name: 'Service Test Entity',
                entityType: 'service' as const,
                metadata: { source: 'service-test' },
                tags: ['service', 'test'],
                observations: ['Created via service layer'],
                priority: 2,
                confidence: 0.9,
                project_id: 'service-test-project'
            };

            const result = await memoryService.createEntity(entityData);
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });

        it('should search with advanced options', async () => {
            // Create test entity
            await memoryService.createEntity({
                name: 'Advanced Search Entity',
                entityType: 'api_endpoint' as const,
                metadata: { category: 'search' },
                tags: ['advanced', 'search'],
                observations: ['Supports advanced search'],
                priority: 3,
                confidence: 0.95,
                project_id: 'search-test'
            });

            const searchQuery: MemoryQuery = {
                text: 'advanced search',
                minScore: 0.1,
                maxResults: 5,
                entityTypes: ['api_endpoint'],
                tags: ['advanced'],
                project_id: 'search-test'
            };

            const result = await memoryService.search(searchQuery);
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });

        it('should generate insights', async () => {
            // Create diverse test data
            const entities = [
                { name: 'High Priority Task', entityType: 'task' as const, priority: 5 },
                { name: 'Medium Priority Task', entityType: 'task' as const, priority: 3 },
                { name: 'Low Priority Task', entityType: 'task' as const, priority: 1 }
            ];

            for (const entity of entities) {
                await memoryService.createEntity({
                    ...entity,
                    metadata: {},
                    tags: ['task'],
                    observations: [],
                    confidence: 1.0
                });
            }

            const insights = await memoryService.generateInsights();
            expect(insights.success).toBe(true);
            expect(Array.isArray(insights.data)).toBe(true);
        });

        it('should suggest relevant entities', async () => {
            // Create entities with related metadata
            await memoryService.createEntity({
                name: 'React Component',
                entityType: 'component' as const,
                metadata: { framework: 'react' },
                tags: ['react', 'frontend'],
                observations: ['Uses modern React patterns'],
                priority: 1,
                confidence: 1.0
            });

            await memoryService.createEntity({
                name: 'React Hook',
                entityType: 'function' as const,
                metadata: { framework: 'react' },
                tags: ['react', 'hooks'],
                observations: ['Reusable state logic'],
                priority: 1,
                confidence: 1.0
            });

            const suggestions = await memoryService.suggestEntities('React development', undefined, 3);
            expect(suggestions.success).toBe(true);
            expect(Array.isArray(suggestions.data)).toBe(true);
        });

        it('should export data in JSON format', async () => {
            // Create test data
            await memoryService.createEntity({
                name: 'Export Test Entity',
                entityType: 'documentation' as const,
                metadata: { exportable: true },
                tags: ['export', 'test'],
                observations: ['For export functionality'],
                priority: 1,
                confidence: 1.0
            });

            // Test JSON export
            const jsonExport = await memoryService.exportData(undefined, 'json');
            expect(jsonExport.success).toBe(true);
            expect(jsonExport.data).toBeDefined();

            // Verify it's valid JSON
            expect(() => JSON.parse(jsonExport.data || '')).not.toThrow();
        });

        it('should provide health status', async () => {
            const healthStatus = await memoryService.getHealthStatus();
            expect(healthStatus).toBeDefined();
            expect(healthStatus.status).toBeDefined();
            expect(healthStatus.metrics).toBeDefined();
        });

        it('should get knowledge graph with analytics', async () => {
            // Create test graph
            await memoryService.createEntity({
                name: 'Graph Node 1',
                entityType: 'class' as const,
                metadata: {},
                tags: ['graph'],
                observations: [],
                priority: 1,
                confidence: 1.0
            });

            const result = await memoryService.getKnowledgeGraph();
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle search with no results', async () => {
            const searchQuery: MemoryQuery = {
                text: 'nonexistent_unique_term_12345',
                minScore: 0.9,
                maxResults: 10
            };

            const result = await memoryEngine.search(searchQuery, { limit: 10 });
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        it('should handle concurrent operations', async () => {
            const promises = [];

            // Create multiple entities concurrently
            for (let i = 0; i < 5; i++) {
                promises.push(
                    memoryService.createEntity({
                        name: `Concurrent Entity ${i}`,
                        entityType: 'test_case' as const,
                        metadata: { index: i },
                        tags: ['concurrent'],
                        observations: [],
                        priority: 1,
                        confidence: 1.0
                    })
                );
            }

            const results = await Promise.all(promises);
            results.forEach(result => {
                expect(result.success).toBe(true);
            });
        });
    });

    describe('Performance Tests', () => {
        it('should handle multiple entities efficiently', async () => {
            const startTime = Date.now();
            const promises = [];

            // Create 20 entities
            for (let i = 0; i < 20; i++) {
                promises.push(
                    memoryService.createEntity({
                        name: `Performance Entity ${i}`,
                        entityType: 'test_case' as const,
                        metadata: {
                            index: i,
                            category: i % 5 === 0 ? 'category_a' : 'category_b',
                        },
                        tags: ['performance', `batch_${Math.floor(i / 10)}`],
                        observations: [`Created in batch`, `Index: ${i}`],
                        priority: Math.floor(Math.random() * 5) + 1,
                        confidence: Math.random()
                    })
                );
            }

            await Promise.all(promises);
            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete within reasonable time
            expect(duration).toBeLessThan(3000); // 3 seconds

            // Verify entities were created
            const analytics = await memoryEngine.getAnalytics();
            expect(analytics.metrics.total_entities).toBeGreaterThanOrEqual(20);
        });

        it('should search efficiently', async () => {
            const searchStartTime = Date.now();

            const searchQuery: MemoryQuery = {
                text: 'performance',
                minScore: 0.1,
                maxResults: 20
            };

            const result = await memoryService.search(searchQuery);
            const searchEndTime = Date.now();
            const searchDuration = searchEndTime - searchStartTime;

            expect(result.success).toBe(true);
            expect(searchDuration).toBeLessThan(1000); // 1 second
        });
    });
});
