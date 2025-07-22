import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { CBDEngineAdapter } from '../../packages/memorai-mcp/cbd-database-adapter.js';

describe('CBD Engine Adapter Unit Tests', () => {
    let adapter;
    const testConfig = {
        host: process.env.CBD_HOST || 'localhost',
        port: parseInt(process.env.CBD_PORT) || 8080,
        database: process.env.CBD_DATABASE || 'memorai_test',
        apiKey: process.env.CBD_API_KEY || 'test-key'
    };

    beforeAll(async () => {
        adapter = new CBDEngineAdapter(testConfig);
        await adapter.initialize();
    });

    afterAll(async () => {
        await adapter.close();
    });

    beforeEach(async () => {
        // Clean test database
        await adapter.clearAllMemories();
    });

    describe('Memory Storage Operations', () => {
        test('should store and retrieve a memory successfully', async () => {
            const testMemory = {
                agentId: 'test-agent',
                content: 'This is a test memory for unit testing',
                metadata: {
                    entityType: 'test',
                    importance: 'high',
                    tags: ['unit-test', 'storage']
                }
            };

            // Store memory
            const stored = await adapter.storeMemory(testMemory);
            expect(stored).toBeDefined();
            expect(stored.structuredKey).toMatch(/^test-agent_\d{8}_default_\d+$/);

            // Retrieve memory
            const retrieved = await adapter.getMemory(stored.structuredKey);
            expect(retrieved).toBeDefined();
            expect(retrieved.content).toBe(testMemory.content);
            expect(retrieved.agentId).toBe(testMemory.agentId);
            expect(retrieved.metadata.entityType).toBe('test');
        });

        test('should handle memory updates correctly', async () => {
            const testMemory = {
                agentId: 'test-agent',
                content: 'Original content',
                metadata: { entityType: 'test' }
            };

            // Store original memory
            const stored = await adapter.storeMemory(testMemory);

            // Update memory
            const updatedMemory = {
                ...testMemory,
                content: 'Updated content',
                metadata: { entityType: 'test', updated: true }
            };

            const updated = await adapter.updateMemory(stored.structuredKey, updatedMemory);
            expect(updated.content).toBe('Updated content');
            expect(updated.metadata.updated).toBe(true);

            // Verify persistence
            const retrieved = await adapter.getMemory(stored.structuredKey);
            expect(retrieved.content).toBe('Updated content');
        });

        test('should delete memories correctly', async () => {
            const testMemory = {
                agentId: 'test-agent',
                content: 'Memory to be deleted',
                metadata: { entityType: 'test' }
            };

            // Store and delete memory
            const stored = await adapter.storeMemory(testMemory);
            const deleted = await adapter.deleteMemory(stored.structuredKey);
            expect(deleted).toBe(true);

            // Verify deletion
            const retrieved = await adapter.getMemory(stored.structuredKey);
            expect(retrieved).toBeNull();
        });
    });

    describe('Vector Search Operations', () => {
        const testMemories = [
            {
                agentId: 'search-agent',
                content: 'JavaScript is a programming language for web development',
                metadata: { entityType: 'knowledge', domain: 'programming' }
            },
            {
                agentId: 'search-agent',
                content: 'Python is great for data science and machine learning',
                metadata: { entityType: 'knowledge', domain: 'programming' }
            },
            {
                agentId: 'search-agent',
                content: 'React is a popular JavaScript library for building user interfaces',
                metadata: { entityType: 'knowledge', domain: 'frontend' }
            }
        ];

        beforeEach(async () => {
            // Store test memories for search
            for (const memory of testMemories) {
                await adapter.storeMemory(memory);
            }
            // Wait for vector indexing
            await new Promise(resolve => setTimeout(resolve, 1000));
        });

        test('should perform semantic search correctly', async () => {
            const searchResults = await adapter.semanticSearch(
                'search-agent',
                'web development frameworks',
                { limit: 10 }
            );

            expect(searchResults).toBeDefined();
            expect(Array.isArray(searchResults)).toBe(true);
            expect(searchResults.length).toBeGreaterThan(0);

            // Should find JavaScript and React related memories
            const contents = searchResults.map(r => r.content);
            const hasJavaScript = contents.some(c => c.includes('JavaScript'));
            const hasReact = contents.some(c => c.includes('React'));

            expect(hasJavaScript || hasReact).toBe(true);
        });

        test('should respect search limits and filters', async () => {
            const limitedResults = await adapter.semanticSearch(
                'search-agent',
                'programming',
                {
                    limit: 2,
                    minSimilarity: 0.3,
                    filters: { domain: 'programming' }
                }
            );

            expect(limitedResults.length).toBeLessThanOrEqual(2);
            limitedResults.forEach(result => {
                expect(result.similarity).toBeGreaterThanOrEqual(0.3);
                expect(result.metadata.domain).toBe('programming');
            });
        });

        test('should handle empty search results gracefully', async () => {
            const results = await adapter.semanticSearch(
                'search-agent',
                'quantum physics advanced mathematics',
                { limit: 10 }
            );

            expect(Array.isArray(results)).toBe(true);
            // Results might be empty or have low similarity scores
        });
    });

    describe('Transaction Handling', () => {
        test('should support transaction rollback on error', async () => {
            const testMemories = [
                {
                    agentId: 'tx-agent',
                    content: 'Memory 1',
                    metadata: { entityType: 'test' }
                },
                {
                    agentId: 'tx-agent',
                    content: 'Memory 2',
                    metadata: { entityType: 'test' }
                }
            ];

            try {
                await adapter.executeInTransaction(async (tx) => {
                    await tx.storeMemory(testMemories[0]);
                    await tx.storeMemory(testMemories[1]);

                    // Force an error to trigger rollback
                    throw new Error('Transaction test error');
                });
            } catch (error) {
                expect(error.message).toBe('Transaction test error');
            }

            // Verify no memories were persisted due to rollback
            const memories = await adapter.getMemoriesByAgent('tx-agent');
            expect(memories.length).toBe(0);
        });

        test('should commit transaction successfully', async () => {
            const testMemories = [
                {
                    agentId: 'tx-agent',
                    content: 'Committed Memory 1',
                    metadata: { entityType: 'test' }
                },
                {
                    agentId: 'tx-agent',
                    content: 'Committed Memory 2',
                    metadata: { entityType: 'test' }
                }
            ];

            await adapter.executeInTransaction(async (tx) => {
                await tx.storeMemory(testMemories[0]);
                await tx.storeMemory(testMemories[1]);
                // Transaction completes successfully
            });

            // Verify memories were persisted
            const memories = await adapter.getMemoriesByAgent('tx-agent');
            expect(memories.length).toBe(2);
            expect(memories.some(m => m.content === 'Committed Memory 1')).toBe(true);
            expect(memories.some(m => m.content === 'Committed Memory 2')).toBe(true);
        });
    });

    describe('Error Handling and Resilience', () => {
        test('should handle network errors gracefully', async () => {
            // Create adapter with invalid host
            const invalidAdapter = new CBDEngineAdapter({
                ...testConfig,
                host: 'invalid-host-12345.local'
            });

            await expect(invalidAdapter.initialize()).rejects.toThrow();
        });

        test('should validate input parameters', async () => {
            // Test invalid memory data
            const invalidMemory = {
                agentId: '', // Empty agent ID
                content: '', // Empty content
            };

            await expect(adapter.storeMemory(invalidMemory)).rejects.toThrow();
        });

        test('should handle concurrent operations safely', async () => {
            const concurrentOps = [];

            for (let i = 0; i < 10; i++) {
                concurrentOps.push(
                    adapter.storeMemory({
                        agentId: 'concurrent-agent',
                        content: `Concurrent memory ${i}`,
                        metadata: { entityType: 'test', index: i }
                    })
                );
            }

            // All operations should complete successfully
            const results = await Promise.all(concurrentOps);
            expect(results.length).toBe(10);
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result.structuredKey).toBeTruthy();
            });

            // Verify all memories were stored
            const storedMemories = await adapter.getMemoriesByAgent('concurrent-agent');
            expect(storedMemories.length).toBe(10);
        });
    });

    describe('Performance Characteristics', () => {
        test('should maintain reasonable response times', async () => {
            const startTime = Date.now();

            await adapter.storeMemory({
                agentId: 'perf-agent',
                content: 'Performance test memory with sufficient content length to simulate real usage patterns',
                metadata: {
                    entityType: 'performance',
                    timestamp: new Date().toISOString()
                }
            });

            const duration = Date.now() - startTime;

            // Should complete within 1 second
            expect(duration).toBeLessThan(1000);
        });

        test('should handle batch operations efficiently', async () => {
            const batchSize = 50;
            const memories = Array.from({ length: batchSize }, (_, i) => ({
                agentId: 'batch-agent',
                content: `Batch memory ${i} with varying content lengths and complexity`,
                metadata: {
                    entityType: 'batch',
                    index: i,
                    timestamp: new Date().toISOString()
                }
            }));

            const startTime = Date.now();

            const promises = memories.map(memory => adapter.storeMemory(memory));
            await Promise.all(promises);

            const duration = Date.now() - startTime;
            const avgTimePerOp = duration / batchSize;

            // Average should be less than 100ms per operation
            expect(avgTimePerOp).toBeLessThan(100);

            // Verify all memories were stored
            const stored = await adapter.getMemoriesByAgent('batch-agent');
            expect(stored.length).toBe(batchSize);
        });
    });

    describe('Memory Context and Retrieval', () => {
        test('should retrieve contextual memories correctly', async () => {
            const contextMemories = [
                {
                    agentId: 'context-agent',
                    content: 'User prefers TypeScript for development',
                    metadata: { entityType: 'preference', context: 'coding' }
                },
                {
                    agentId: 'context-agent',
                    content: 'Project deadline is next Friday',
                    metadata: { entityType: 'deadline', context: 'project' }
                },
                {
                    agentId: 'context-agent',
                    content: 'Team uses Docker for containerization',
                    metadata: { entityType: 'tech-stack', context: 'infrastructure' }
                }
            ];

            // Store context memories
            for (const memory of contextMemories) {
                await adapter.storeMemory(memory);
            }

            // Get recent context
            const context = await adapter.getContext('context-agent', { contextSize: 5 });

            expect(context).toBeDefined();
            expect(Array.isArray(context)).toBe(true);
            expect(context.length).toBeGreaterThan(0);
            expect(context.length).toBeLessThanOrEqual(5);

            // Verify memories are in reverse chronological order (most recent first)
            for (let i = 1; i < context.length; i++) {
                const prev = new Date(context[i - 1].timestamp);
                const curr = new Date(context[i].timestamp);
                expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime());
            }
        });
    });
});
