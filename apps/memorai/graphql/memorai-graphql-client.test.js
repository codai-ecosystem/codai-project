const MemorAIGraphQLClient = require('./memorai-graphql-client');

describe('MemorAI GraphQL Client', () => {
  let client;

  beforeAll(() => {
    client = new MemorAIGraphQLClient({
      endpoint: 'http://localhost:4500/graphql'
    });
  });

  describe('Memory Operations', () => {
    let testMemoryId;

    test('should create a memory', async () => {
      const input = {
        content: 'Test memory content for GraphQL',
        category: 'test',
        tags: ['graphql', 'testing'],
        metadata: { test: true, source: 'jest' }
      };

      const memory = await client.createMemory(input);

      expect(memory).toBeDefined();
      expect(memory.id).toBeDefined();
      expect(memory.content).toBe(input.content);
      expect(memory.category).toBe(input.category);
      expect(memory.tags).toEqual(expect.arrayContaining(input.tags));

      testMemoryId = memory.id;
    });

    test('should get a memory by id', async () => {
      if (!testMemoryId) {
        throw new Error('No test memory ID available');
      }

      const memory = await client.getMemory(testMemoryId);

      expect(memory).toBeDefined();
      expect(memory.id).toBe(testMemoryId);
      expect(memory.content).toBeDefined();
    });

    test('should get memories with options', async () => {
      const memories = await client.getMemories({
        limit: 10,
        category: 'test'
      });

      expect(Array.isArray(memories)).toBe(true);
      expect(memories.length).toBeGreaterThan(0);
    });

    test('should update a memory', async () => {
      if (!testMemoryId) {
        throw new Error('No test memory ID available');
      }

      const updateInput = {
        content: 'Updated test memory content for GraphQL',
        tags: ['graphql', 'testing', 'updated']
      };

      const updatedMemory = await client.updateMemory(testMemoryId, updateInput);

      expect(updatedMemory).toBeDefined();
      expect(updatedMemory.id).toBe(testMemoryId);
      expect(updatedMemory.content).toBe(updateInput.content);
      expect(updatedMemory.tags).toEqual(expect.arrayContaining(updateInput.tags));
    });

    test('should delete a memory', async () => {
      if (!testMemoryId) {
        throw new Error('No test memory ID available');
      }

      const result = await client.deleteMemory(testMemoryId);

      expect(result).toBe(true);
    });
  });

  describe('Search Operations', () => {
    test('should search memories', async () => {
      const searchResult = await client.search('test', {
        algorithm: 'SEMANTIC',
        limit: 5
      });

      expect(searchResult).toBeDefined();
      expect(searchResult.memories).toBeDefined();
      expect(Array.isArray(searchResult.memories)).toBe(true);
      expect(searchResult.total).toBeDefined();
      expect(searchResult.queryTime).toBeDefined();
      expect(searchResult.algorithmUsed).toBeDefined();
    });

    test('should get similar memories', async () => {
      // First create a test memory
      const testMemory = await client.createMemory({
        content: 'Test memory for similarity search',
        category: 'test',
        tags: ['similarity', 'test']
      });

      const similarMemories = await client.getSimilarMemories(testMemory.id, 5);

      expect(Array.isArray(similarMemories)).toBe(true);

      // Cleanup
      await client.deleteMemory(testMemory.id);
    });
  });

  describe('Analytics Operations', () => {
    test('should get general analytics', async () => {
      const analytics = await client.getAnalytics();

      expect(analytics).toBeDefined();
      expect(analytics.totalMemories).toBeDefined();
      expect(analytics.totalSearches).toBeDefined();
      expect(analytics.categories).toBeDefined();
      expect(Array.isArray(analytics.categories)).toBe(true);
      expect(analytics.performanceMetrics).toBeDefined();
    });

    test('should get memory analytics', async () => {
      const memoryAnalytics = await client.getMemoryAnalytics();

      expect(memoryAnalytics).toBeDefined();
      expect(memoryAnalytics.totalMemories).toBeDefined();
      expect(memoryAnalytics.categories).toBeDefined();
    });

    test('should get search analytics', async () => {
      const searchAnalytics = await client.getSearchAnalytics();

      expect(searchAnalytics).toBeDefined();
      expect(searchAnalytics.totalSearches).toBeDefined();
      expect(searchAnalytics.averageQueryTime).toBeDefined();
    });
  });

  describe('Batch Operations', () => {
    test('should perform batch memory operations', async () => {
      const operations = [
        {
          operation: 'CREATE',
          data: {
            content: 'Batch test memory 1',
            category: 'batch-test',
            tags: ['batch', 'test1']
          }
        },
        {
          operation: 'CREATE',
          data: {
            content: 'Batch test memory 2',
            category: 'batch-test',
            tags: ['batch', 'test2']
          }
        }
      ];

      const batchResult = await client.batchMemories(operations);

      expect(batchResult).toBeDefined();
      expect(batchResult.success).toBe(true);
      expect(batchResult.processed).toBe(2);
      expect(Array.isArray(batchResult.results)).toBe(true);
      expect(batchResult.results.length).toBe(2);

      // Cleanup
      for (const memory of batchResult.results) {
        await client.deleteMemory(memory.id);
      }
    });

    test('should import memories', async () => {
      const memories = [
        {
          content: 'Imported memory 1',
          category: 'import-test',
          tags: ['import', 'test1']
        },
        {
          content: 'Imported memory 2',
          category: 'import-test',
          tags: ['import', 'test2']
        }
      ];

      const importResult = await client.importMemories(memories);

      expect(importResult).toBeDefined();
      expect(importResult.success).toBe(true);
      expect(importResult.processed).toBe(2);

      // Cleanup
      for (const memory of importResult.results) {
        await client.deleteMemory(memory.id);
      }
    });
  });

  describe('System Operations', () => {
    test('should get system info', async () => {
      const systemInfo = await client.getSystemInfo();

      expect(systemInfo).toBeDefined();
      expect(systemInfo.version).toBeDefined();
      expect(systemInfo.status).toBeDefined();
      expect(systemInfo.memoryUsage).toBeDefined();
      expect(systemInfo.dbStats).toBeDefined();
    });

    test('should check health', async () => {
      const health = await client.getHealth();

      expect(health).toBeDefined();
      expect(health.version).toBeDefined();
      expect(health.status).toBeDefined();
    });

    test('should clear cache', async () => {
      const result = await client.clearCache();

      expect(result).toBe(true);
    });
  });

  describe('Advanced Queries', () => {
    test('should get memories by date range', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const to = new Date();

      const memories = await client.getMemoriesByDateRange(from, to);

      expect(Array.isArray(memories)).toBe(true);
    });

    test('should get memories by pattern', async () => {
      const memories = await client.getMemoriesByPattern('test.*memory');

      expect(Array.isArray(memories)).toBe(true);
    });
  });

  describe('Memory Management', () => {
    let testMemoryId;

    beforeAll(async () => {
      const testMemory = await client.createMemory({
        content: 'Memory for management tests',
        category: 'management-test',
        tags: ['management', 'test']
      });
      testMemoryId = testMemory.id;
    });

    afterAll(async () => {
      if (testMemoryId) {
        try {
          await client.deleteMemory(testMemoryId);
        } catch (error) {
          // Memory might already be deleted
        }
      }
    });

    test('should archive memory', async () => {
      const archivedMemory = await client.archiveMemory(testMemoryId);

      expect(archivedMemory).toBeDefined();
      expect(archivedMemory.id).toBe(testMemoryId);
    });

    test('should restore memory', async () => {
      const restoredMemory = await client.restoreMemory(testMemoryId);

      expect(restoredMemory).toBeDefined();
      expect(restoredMemory.id).toBe(testMemoryId);
    });

    test('should duplicate memory', async () => {
      const duplicatedMemory = await client.duplicateMemory(testMemoryId);

      expect(duplicatedMemory).toBeDefined();
      expect(duplicatedMemory.id).not.toBe(testMemoryId);
      expect(duplicatedMemory.content).toBeDefined();

      // Cleanup duplicate
      await client.deleteMemory(duplicatedMemory.id);
    });
  });
});

// Integration Test Suite
describe('GraphQL Integration Tests', () => {
  let client;

  beforeAll(() => {
    client = new MemorAIGraphQLClient({
      endpoint: 'http://localhost:4500/graphql'
    });
  });

  test('should handle complex search with facets', async () => {
    // Create test memories with different categories and tags
    const testMemories = await Promise.all([
      client.createMemory({
        content: 'First test memory',
        category: 'category1',
        tags: ['tag1', 'common']
      }),
      client.createMemory({
        content: 'Second test memory',
        category: 'category2',
        tags: ['tag2', 'common']
      }),
      client.createMemory({
        content: 'Third test memory',
        category: 'category1',
        tags: ['tag3', 'common']
      })
    ]);

    // Perform search with facets
    const searchResult = await client.search('test memory', {
      algorithm: 'SEMANTIC',
      limit: 10,
      includeEmbeddings: false
    });

    expect(searchResult.facets).toBeDefined();
    expect(searchResult.facets.categories).toBeDefined();
    expect(searchResult.facets.tags).toBeDefined();

    // Cleanup
    await Promise.all(testMemories.map(memory => client.deleteMemory(memory.id)));
  }, 30000);

  test('should handle error cases gracefully', async () => {
    // Test with invalid memory ID
    await expect(client.getMemory('invalid-id')).rejects.toThrow();

    // Test with invalid search parameters
    await expect(client.search('', { limit: -1 })).rejects.toThrow();
  });

  test('should maintain data consistency across operations', async () => {
    // Create memory
    const originalMemory = await client.createMemory({
      content: 'Consistency test memory',
      category: 'consistency',
      tags: ['test', 'consistency']
    });

    // Update memory
    const updatedMemory = await client.updateMemory(originalMemory.id, {
      content: 'Updated consistency test memory',
      tags: ['test', 'consistency', 'updated']
    });

    // Verify changes
    const retrievedMemory = await client.getMemory(originalMemory.id);

    expect(retrievedMemory.content).toBe(updatedMemory.content);
    expect(retrievedMemory.tags).toEqual(expect.arrayContaining(['updated']));

    // Cleanup
    await client.deleteMemory(originalMemory.id);
  });
});
