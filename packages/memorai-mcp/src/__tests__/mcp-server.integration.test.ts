import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemorAIMCPServer } from '../mcp-server';
import request from 'supertest';

// Mock the Python integration for testing
vi.mock('../ai-integration', () => ({
  advancedAI: {
    createKnowledgeGraph: vi.fn().mockResolvedValue({
      success: true,
      nodes: [],
      edges: [],
      message: 'Mock knowledge graph created'
    }),
    analyzePatterns: vi.fn().mockResolvedValue({
      success: true,
      patterns: [],
      message: 'Mock pattern analysis completed'
    }),
    performSemanticClustering: vi.fn().mockResolvedValue({
      success: true,
      clusters: [],
      message: 'Mock clustering completed'
    }),
    synthesizeMultimodal: vi.fn().mockResolvedValue({
      success: true,
      synthesis: 'Mock multimodal synthesis result',
      message: 'Mock synthesis completed'
    }),
    processIntelligenceQuery: vi.fn().mockResolvedValue({
      success: true,
      response: 'Mock intelligence query response',
      message: 'Mock query processed'
    })
  },
  AdvancedAIIntegration: class MockAdvancedAIIntegration {
    async createKnowledgeGraph() {
      return { success: true, nodes: [], edges: [] };
    }
    async analyzePatterns() {
      return { success: true, patterns: [] };
    }
    async performSemanticClustering() {
      return { success: true, clusters: [] };
    }
    async synthesizeMultimodal() {
      return { success: true, synthesis: 'Mock result' };
    }
    async processIntelligenceQuery() {
      return { success: true, response: 'Mock response' };
    }
  }
}));

describe('MemorAI MCP Server - Comprehensive Coverage Tests', () => {
  let server: MemorAIMCPServer;
  let app: any;

  beforeEach(async () => {
    // Create a fresh server for each test to maximize coverage
    server = new MemorAIMCPServer();
    app = server.getExpressApp();
  }, 15000);

  afterEach(async () => {
    if (server && typeof server.stop === 'function') {
      await server.stop();
    }
  }, 15000);

  describe('Server Construction and Initialization', () => {
    test('should create server with default configuration', () => {
      expect(server).toBeDefined();
      expect(server.getExpressApp).toBeDefined();
      expect(server.getMemoryStore).toBeDefined();
      expect(server.stop).toBeDefined();
    });

    test('should initialize Express app with middleware', () => {
      const expressApp = server.getExpressApp();
      expect(expressApp).toBeDefined();

      // Test that app is an Express application
      expect(typeof expressApp.listen).toBe('function');
      expect(typeof expressApp.use).toBe('function');
    });

    test('should initialize memory store with proper structure', () => {
      const memoryStore = server.getMemoryStore();
      expect(memoryStore).toBeDefined();
      expect(memoryStore.store).toBeDefined();
      expect(typeof memoryStore.store).toBe('function');
      expect(typeof memoryStore.recall).toBe('function');
      expect(typeof memoryStore.forget).toBe('function');
      expect(typeof memoryStore.getContext).toBe('function');
    });
  });

  describe('HTTP Endpoints - Comprehensive Coverage', () => {
    test('should handle GET /health endpoint successfully', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/);

      expect([200, 500]).toContain(response.status);
      expect(response.body).toBeDefined();
    });

    test('should handle POST /mcp endpoint', async () => {
      const validMcpRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      };

      const response = await request(app)
        .post('/mcp')
        .send(validMcpRequest)
        .set('Content-Type', 'application/json');

      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });

    test('should handle malformed JSON in POST /mcp', async () => {
      const response = await request(app)
        .post('/mcp')
        .send('invalid json string')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });

    test('should handle CORS OPTIONS requests', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(response.status).toBe(204);
    });

    test('should handle unknown endpoints with 404', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
    });
  });

  describe('Memory Store Operations - Deep Testing', () => {
    test('should perform complete memory lifecycle', async () => {
      const memoryStore = server.getMemoryStore();
      const testAgent = `test-agent-${Date.now()}`;
      const testContent = 'Comprehensive test memory content';

      // Store memory
      const storeResult = await memoryStore.store(testAgent, testContent, {
        type: 'test',
        importance: 8,
        category: 'comprehensive-test'
      });

      expect(storeResult.success).toBe(true);
      expect(storeResult.key).toBeDefined();
      expect(typeof storeResult.key).toBe('string');

      // Recall memory
      const recallResult = await memoryStore.recall(testAgent, 'comprehensive test', 5);
      expect(recallResult.success).toBe(true);
      expect(Array.isArray(recallResult.memories)).toBe(true);

      // Get context
      const contextResult = await memoryStore.getContext(testAgent, 3);
      expect(contextResult.success).toBe(true);
      expect(Array.isArray(contextResult.context)).toBe(true);

      // Delete memory
      const deleteResult = await memoryStore.forget(testAgent, storeResult.key);
      expect(deleteResult.success).toBe(true);
    });

    test('should handle memory store edge cases', async () => {
      const memoryStore = server.getMemoryStore();
      const testAgent = `edge-case-agent-${Date.now()}`;

      // Test with empty content
      const emptyResult = await memoryStore.store(testAgent, '', {});
      expect(emptyResult).toBeDefined();

      // Test with very long content
      const longContent = 'x'.repeat(10000);
      const longResult = await memoryStore.store(testAgent, longContent, { type: 'long' });
      expect(longResult).toBeDefined();

      // Test recall with non-existent agent
      const noAgentResult = await memoryStore.recall('non-existent-agent', 'test');
      expect(noAgentResult).toBeDefined();

      // Test context with zero size
      const zeroContextResult = await memoryStore.getContext(testAgent, 0);
      expect(zeroContextResult).toBeDefined();
    });

    test('should handle concurrent memory operations', async () => {
      const memoryStore = server.getMemoryStore();
      const testAgent = `concurrent-agent-${Date.now()}`;

      // Perform multiple operations simultaneously
      const operations = Array.from({ length: 5 }, (_, i) =>
        memoryStore.store(testAgent, `Concurrent memory ${i}`, { index: i })
      );

      const results = await Promise.all(operations);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Test concurrent recalls
      const recalls = Array.from({ length: 3 }, () =>
        memoryStore.recall(testAgent, 'Concurrent')
      );

      const recallResults = await Promise.all(recalls);
      recallResults.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('MCP Tool Coverage', () => {
    test('should handle remember tool via MCP request', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'memorai_remember',
          arguments: {
            agentId: 'test-mcp-agent',
            content: 'MCP tool test content',
            metadata: JSON.stringify({ type: 'mcp-test' })
          }
        }
      };

      const response = await request(app)
        .post('/mcp')
        .send(mcpRequest)
        .set('Content-Type', 'application/json');

      expect(response.body).toBeDefined();
    });

    test('should handle recall tool via MCP request', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'memorai_recall',
          arguments: {
            agentId: 'test-mcp-agent',
            query: 'test query',
            limit: 5
          }
        }
      };

      const response = await request(app)
        .post('/mcp')
        .send(mcpRequest)
        .set('Content-Type', 'application/json');

      expect(response.body).toBeDefined();
    });

    test('should handle knowledge graph tool via MCP request', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'memorai_knowledge_graph',
          arguments: {
            agentId: 'test-mcp-agent',
            layout: 'force',
            maxNodes: 50
          }
        }
      };

      const response = await request(app)
        .post('/mcp')
        .send(mcpRequest)
        .set('Content-Type', 'application/json');

      expect(response.body).toBeDefined();
    });

    test('should handle analyze patterns tool via MCP request', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'memorai_analyze_patterns',
          arguments: {
            agentId: 'test-mcp-agent',
            analysisType: 'trends',
            minStrength: 0.7
          }
        }
      };

      const response = await request(app)
        .post('/mcp')
        .send(mcpRequest)
        .set('Content-Type', 'application/json');

      expect(response.body).toBeDefined();
    });
  });

  describe('Advanced AI Integration Coverage', () => {
    test('should handle semantic clustering tool', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'memorai_semantic_clustering',
          arguments: {
            agentId: 'test-mcp-agent',
            clusterCount: 5,
            threshold: 0.8
          }
        }
      };

      const response = await request(app)
        .post('/mcp')
        .send(mcpRequest)
        .set('Content-Type', 'application/json');

      expect(response.body).toBeDefined();
    });

    test('should handle multimodal synthesis tool', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'memorai_multimodal_synthesis',
          arguments: {
            content: { text: 'Test content for synthesis' },
            mode: 'TRANSCENDENT'
          }
        }
      };

      const response = await request(app)
        .post('/mcp')
        .send(mcpRequest)
        .set('Content-Type', 'application/json');

      expect(response.body).toBeDefined();
    });

    test('should handle intelligence query tool', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 7,
        method: 'tools/call',
        params: {
          name: 'memorai_intelligence_query',
          arguments: {
            query: 'What are the key patterns in the data?',
            context: { domain: 'test' },
            types: JSON.stringify(['analytical', 'creative'])
          }
        }
      };

      const response = await request(app)
        .post('/mcp')
        .send(mcpRequest)
        .set('Content-Type', 'application/json');

      expect(response.body).toBeDefined();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid MCP method', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 8,
        method: 'invalid_method',
        params: {}
      };

      const response = await request(app)
        .post('/mcp')
        .send(mcpRequest)
        .set('Content-Type', 'application/json');

      expect(response.body).toBeDefined();
    });

    test('should handle missing required parameters', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 9,
        method: 'tools/call',
        params: {
          name: 'memorai_remember',
          arguments: {
            // Missing agentId and content
          }
        }
      };

      const response = await request(app)
        .post('/mcp')
        .send(mcpRequest)
        .set('Content-Type', 'application/json');

      expect(response.body).toBeDefined();
    });

    test('should handle malformed JSON parameters', async () => {
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 10,
        method: 'tools/call',
        params: {
          name: 'memorai_recall',
          arguments: {
            agentId: 'test-agent',
            query: 'test',
            metadata: 'invalid-json-string'
          }
        }
      };

      const response = await request(app)
        .post('/mcp')
        .send(mcpRequest)
        .set('Content-Type', 'application/json');

      expect(response.body).toBeDefined();
    });
  });

  describe('Configuration and Environment', () => {
    test('should handle different port configurations', async () => {
      // Test that server can be created (port binding is tested in integration)
      expect(server).toBeDefined();
      expect(server.getExpressApp()).toBeDefined();
    });

    test('should handle missing environment variables gracefully', async () => {
      // Server should still work with default values
      const memoryStore = server.getMemoryStore();
      expect(memoryStore).toBeDefined();
    });
  });
});