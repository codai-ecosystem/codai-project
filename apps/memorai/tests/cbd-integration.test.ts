/**
 * MemorAI CBD Integration Test Suite
 * Comprehensive testing for CBD-based memory operations
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MemorAICBDServer } from '../cbd-mcp-server';
import { MemorAILegacyMigration } from '../migrate-to-cbd';
import { loadConfig } from '../config/memorai.config';

describe('MemorAI CBD Integration', () => {
  let mcpServer: MemorAICBDServer;
  let testConfig: any;

  beforeAll(async () => {
    // Load test configuration
    testConfig = loadConfig({
      cbd: {
        dataPath: './test-memorai-cbd-data',
        embeddingModel: 'local', // Use local embeddings for testing
        dimensions: 384,
        cacheSize: 1000
      },
      mcp: {
        logLevel: 'error' // Reduce noise during testing
      }
    });

    // Initialize MCP server for testing
    mcpServer = new MemorAICBDServer(testConfig);
  });

  afterAll(async () => {
    if (mcpServer) {
      await mcpServer.stop();
    }
  });

  describe('Memory Storage Operations', () => {
    test('should store memory with structured key generation', async () => {
      const result = await mcpServer['handleRemember']({
        agentId: 'test-agent',
        content: 'This is a test memory for CBD storage',
        metadata: {
          project: 'test-project',
          session: 'test-session',
          priority: 'high'
        }
      });

      expect(result.success).toBe(true);
      expect(result.data.structuredKey).toBeDefined();
      expect(result.data.agentId).toBe('test-agent');
      expect(result.data.projectName).toBe('test-project');
    });

    test('should handle missing required parameters', async () => {
      await expect(async () => {
        await mcpServer['handleRemember']({
          content: 'Missing agent ID'
        });
      }).rejects.toThrow('agentId and content are required');
    });

    test('should store multiple memories with unique keys', async () => {
      const memories = [
        { agentId: 'agent1', content: 'First memory' },
        { agentId: 'agent1', content: 'Second memory' },
        { agentId: 'agent2', content: 'Third memory' }
      ];

      const results = [];
      for (const memory of memories) {
        const result = await mcpServer['handleRemember'](memory);
        results.push(result);
      }

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);

      // Verify unique structured keys
      const keys = results.map(r => r.data.structuredKey);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(3);
    });
  });

  describe('Memory Retrieval Operations', () => {
    beforeEach(async () => {
      // Store test memories for retrieval tests
      await mcpServer['handleRemember']({
        agentId: 'retrieval-agent',
        content: 'This is about database performance optimization',
        metadata: { project: 'performance', session: 'optimization' }
      });

      await mcpServer['handleRemember']({
        agentId: 'retrieval-agent',
        content: 'This discusses memory management strategies',
        metadata: { project: 'performance', session: 'memory' }
      });
    });

    test('should recall memories with semantic search', async () => {
      const result = await mcpServer['handleRecall']({
        agentId: 'retrieval-agent',
        query: 'database optimization',
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data.memories).toBeDefined();
      expect(result.data.summary).toBeDefined();
      expect(result.data.totalFound).toBeGreaterThan(0);
    });

    test('should filter memories by project', async () => {
      const result = await mcpServer['handleRecall']({
        agentId: 'retrieval-agent',
        query: 'performance',
        project: 'performance',
        limit: 10
      });

      expect(result.success).toBe(true);
      if (result.data.memories.length > 0) {
        expect(result.data.memories.every(m => m.projectName === 'performance')).toBe(true);
      }
    });

    test('should support cross-agent search', async () => {
      const result = await mcpServer['handleRecall']({
        agentId: 'all',
        query: 'database',
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('Memory Key Operations', () => {
    test('should search for similar memory keys', async () => {
      const result = await mcpServer['handleSearchKeys']({
        query: 'performance optimization',
        limit: 5,
        minScore: 0.1
      });

      expect(result.success).toBe(true);
      expect(result.data.keys).toBeDefined();
      expect(Array.isArray(result.data.keys)).toBe(true);
    });

    test('should retrieve memory by exact key', async () => {
      // First store a memory to get its key
      const storeResult = await mcpServer['handleRemember']({
        agentId: 'key-test-agent',
        content: 'Memory for key retrieval test'
      });

      const structuredKey = storeResult.data.structuredKey;

      // Then retrieve it by key
      const result = await mcpServer['handleGetMemory']({
        structuredKey
      });

      expect(result.success).toBe(true);
      expect(result.data.structuredKey).toBe(structuredKey);
      expect(result.data.content).toBe('Memory for key retrieval test');
    });
  });

  describe('Context Operations', () => {
    test('should get recent context for agent', async () => {
      const result = await mcpServer['handleContext']({
        agentId: 'retrieval-agent',
        contextSize: 3
      });

      expect(result.success).toBe(true);
      expect(result.data.agentId).toBe('retrieval-agent');
      expect(result.data.memories).toBeDefined();
      expect(result.data.contextSize).toBeLessThanOrEqual(3);
    });
  });

  describe('Health and Monitoring', () => {
    test('should return basic health status', async () => {
      const result = await mcpServer['handleHealthCheck']({});

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('healthy');
      expect(result.data.server).toBeDefined();
      expect(result.data.cbd).toBeDefined();
    });

    test('should return detailed health status', async () => {
      const result = await mcpServer['handleHealthCheck']({ detailed: true });

      expect(result.success).toBe(true);
      expect(result.data.config).toBeDefined();
      expect(result.data.performance).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid search queries gracefully', async () => {
      const result = await mcpServer['handleRecall']({
        agentId: 'test-agent',
        query: '',
        limit: 10
      });

      // Should handle empty query without throwing
      expect(result).toBeDefined();
    });

    test('should handle non-existent memory key retrieval', async () => {
      const result = await mcpServer['handleGetMemory']({
        structuredKey: 'non_existent_key'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Memory not found');
    });
  });
});

describe('Legacy Data Migration', () => {
  let migration: MemorAILegacyMigration;

  beforeAll(() => {
    migration = new MemorAILegacyMigration();
  });

  describe('Data Format Normalization', () => {
    test('should normalize various legacy memory formats', () => {
      const legacyMemories = [
        {
          structured_key: 'test_20240101_session_1',
          content: 'Test content',
          project_name: 'test-project',
          agent_id: 'test-agent'
        },
        {
          key: 'alt_key_format',
          user_request: 'User query',
          assistant_response: 'Assistant response',
          project: 'alt-project'
        }
      ];

      legacyMemories.forEach(memory => {
        const normalized = migration['normalizeMemoryFormat'](memory);

        expect(normalized.structuredKey).toBeDefined();
        expect(normalized.content).toBeDefined();
        expect(normalized.projectName).toBeDefined();
        expect(normalized.agentId).toBeDefined();
      });
    });
  });

  describe('Migration Validation', () => {
    test('should validate migration readiness', async () => {
      const validation = await migration.validateMigration();

      expect(validation).toBeDefined();
      expect(typeof validation.valid).toBe('boolean');
      expect(typeof validation.cbdMemoryCount).toBe('number');
      expect(Array.isArray(validation.errors)).toBe(true);
    });
  });
});

describe('Performance Tests', () => {
  test('should handle concurrent memory operations', async () => {
    const concurrentOperations = 10;
    const operations = [];

    for (let i = 0; i < concurrentOperations; i++) {
      operations.push(
        mcpServer['handleRemember']({
          agentId: `concurrent-agent-${i}`,
          content: `Concurrent test memory ${i}`,
          metadata: { session: 'performance-test' }
        })
      );
    }

    const results = await Promise.all(operations);

    expect(results).toHaveLength(concurrentOperations);
    expect(results.every(r => r.success)).toBe(true);
  });

  test('should maintain response time under load', async () => {
    const startTime = Date.now();

    await mcpServer['handleRecall']({
      agentId: 'performance-agent',
      query: 'performance test query',
      limit: 50
    });

    const responseTime = Date.now() - startTime;

    // Should respond within 5 seconds for reasonable queries
    expect(responseTime).toBeLessThan(5000);
  });
});

describe('Integration with CBD Engine', () => {
  test('should leverage CBD vector search capabilities', async () => {
    // Store memories with different semantic content
    await mcpServer['handleRemember']({
      agentId: 'semantic-agent',
      content: 'JavaScript programming language features',
      metadata: { topic: 'programming' }
    });

    await mcpServer['handleRemember']({
      agentId: 'semantic-agent',
      content: 'Python data science libraries',
      metadata: { topic: 'programming' }
    });

    await mcpServer['handleRemember']({
      agentId: 'semantic-agent',
      content: 'Recipe for chocolate cake',
      metadata: { topic: 'cooking' }
    });

    // Search for programming-related content
    const result = await mcpServer['handleRecall']({
      agentId: 'semantic-agent',
      query: 'programming languages',
      limit: 10
    });

    expect(result.success).toBe(true);
    expect(result.data.memories.length).toBeGreaterThan(0);

    // Should find programming-related memories with higher relevance
    if (result.data.memories.length > 0) {
      const topResult = result.data.memories[0];
      expect(topResult.content).toMatch(/(JavaScript|Python|programming)/i);
    }
  });
});
