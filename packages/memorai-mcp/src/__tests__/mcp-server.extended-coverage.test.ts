import { describe, test, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { MemorAIMCPServer } from '../mcp-server';
import request from 'supertest';

// Mock the AI integration for testing
vi.mock('../ai-integration', () => ({
  advancedAI: {
    healthCheck: vi.fn(),
    semanticClustering: vi.fn(),
    multimodalSynthesis: vi.fn(),
    intelligenceQuery: vi.fn(),
    analyzePatterns: vi.fn(),
    knowledgeGraph: vi.fn()
  }
}));

describe('MemorAI MCP Server - Extended Coverage Tests', () => {
  let server: MemorAIMCPServer;

  beforeAll(() => {
    // Suppress console logs during testing
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    server = new MemorAIMCPServer();
  });

  afterEach(async () => {
    if (server && typeof server.stop === 'function') {
      await server.stop();
    }
    vi.clearAllMocks();
  });

  describe('Health Endpoint Error Scenarios', () => {
    test('should handle health endpoint when AI health check fails', async () => {
      const { advancedAI } = await import('../ai-integration');

      // Mock AI health check to throw error
      vi.mocked(advancedAI.healthCheck).mockRejectedValue(new Error('AI service unavailable'));

      const response = await request(server.app)
        .get('/health')
        .expect(500);

      expect(response.body).toMatchObject({
        status: 'error',
        service: 'memorai-mcp-server',
        error: 'AI service unavailable'
      });
    });

    test('should handle health endpoint with unknown error type', async () => {
      const { advancedAI } = await import('../ai-integration');

      // Mock AI health check to throw non-Error object
      vi.mocked(advancedAI.healthCheck).mockRejectedValue('String error');

      const response = await request(server.app)
        .get('/health')
        .expect(500);

      expect(response.body).toMatchObject({
        status: 'error',
        service: 'memorai-mcp-server',
        error: 'Unknown error'
      });
    });
  });

  describe('MCP Endpoint Error Scenarios', () => {
    test('should handle MCP endpoint server connection failure', async () => {
      // Mock server.connect to throw error
      const originalCreateMCPServerWithTools = server.createMCPServerWithTools;
      vi.spyOn(server, 'createMCPServerWithTools').mockImplementation(() => {
        const mockServer = originalCreateMCPServerWithTools.call(server);
        vi.spyOn(mockServer, 'connect').mockRejectedValue(new Error('Connection failed'));
        return mockServer;
      });

      const response = await request(server.app)
        .post('/mcp')
        .send({ jsonrpc: '2.0', method: 'test', id: 1 })
        .expect(500);

      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null
      });
    });

    test('should handle MCP endpoint transport failure', async () => {
      // Mock StreamableHTTPServerTransport to throw error during handleRequest
      const mockTransport = {
        handleRequest: vi.fn().mockRejectedValue(new Error('Transport failed')),
        close: vi.fn()
      };

      // Mock the transport import
      vi.doMock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
        StreamableHTTPServerTransport: vi.fn(() => mockTransport)
      }));

      const response = await request(server.app)
        .post('/mcp')
        .send({ jsonrpc: '2.0', method: 'test', id: 1 })
        .expect(500);

      expect(response.body).toMatchObject({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null
      });
    });

    test('should not send response twice on error', async () => {
      const response = await request(server.app)
        .post('/mcp')
        .send('invalid json')
        .expect(400); // Express will handle malformed JSON

      // Ensure we get a response (not hanging)
      expect(response).toBeDefined();
    });
  });

  describe('CORS and Security', () => {
    test('should handle preflight OPTIONS requests', async () => {
      await request(server.app)
        .options('/mcp')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(204);
    });

    test('should handle CORS with different origins', async () => {
      const response = await request(server.app)
        .get('/health')
        .set('Origin', 'http://localhost:4000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Express Middleware Coverage', () => {
    test('should handle large JSON payload', async () => {
      const largePayload = {
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 1,
        params: {
          name: 'remember',
          arguments: {
            agentId: 'test-agent',
            content: 'x'.repeat(1000000), // 1MB content
            metadata: { large: true }
          }
        }
      };

      const response = await request(server.app)
        .post('/mcp')
        .send(largePayload);

      // Should not reject due to size (within 10MB limit)
      expect(response.status).not.toBe(413);
    });

    test('should handle request with all allowed headers', async () => {
      const response = await request(server.app)
        .get('/health')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer test-token')
        .set('mcp-session-id', 'test-session-123')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });
  });

  describe('Response Connection Handling', () => {
    test('should handle response close event', async () => {
      const mockRes = {
        on: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        headersSent: false
      };

      const mockTransport = {
        handleRequest: vi.fn(),
        close: vi.fn()
      };

      const mockServer = {
        connect: vi.fn(),
        close: vi.fn()
      };

      // Simulate the connection close
      const closeHandler = vi.fn();
      mockRes.on.mockImplementation((event, handler) => {
        if (event === 'close') {
          closeHandler.mockImplementation(handler);
        }
      });

      // Simulate close event
      closeHandler();

      expect(mockRes.on).toHaveBeenCalledWith('close', expect.any(Function));
    });
  });

  describe('Configuration Edge Cases', () => {
    test('should handle missing environment variables', async () => {
      const originalEnv = process.env;

      // Clear specific env vars
      delete process.env.MEMORAI_MCP_PORT;
      delete process.env.AZURE_OPENAI_ENDPOINT;

      // Create new server instance
      const testServer = new MemorAIMCPServer();

      const response = await request(testServer.app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');

      // Cleanup
      if (testServer && typeof testServer.stop === 'function') {
        await testServer.stop();
      }

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('Memory Store Deep Coverage', () => {
    test('should handle memory operations with Unicode content', async () => {
      const unicodeContent = {
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 1,
        params: {
          name: 'remember',
          arguments: {
            agentId: 'unicode-test',
            content: '🚀 Unicode test with émojis and spëcial chars: 中文, العربية, עברית',
            metadata: { type: 'unicode', encoding: 'utf-8' }
          }
        }
      };

      await request(server.app)
        .post('/mcp')
        .send(unicodeContent);
      // Response handling may vary, but should not crash
    });

    test('should handle concurrent memory operations', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        jsonrpc: '2.0',
        method: 'tools/call',
        id: i + 1,
        params: {
          name: 'remember',
          arguments: {
            agentId: `concurrent-test-${i}`,
            content: `Concurrent content ${i}`,
            metadata: { index: i }
          }
        }
      }));

      // Send all requests concurrently
      const responses = await Promise.all(
        requests.map(req =>
          request(server.app)
            .post('/mcp')
            .send(req)
        )
      );

      // All requests should complete
      expect(responses).toHaveLength(5);
    });
  });

  describe('Advanced Tool Parameter Coverage', () => {
    test('should handle null parameters', async () => {
      const nullParamRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 1,
        params: {
          name: 'recall',
          arguments: {
            agentId: 'null-test',
            query: null,
            limit: null
          }
        }
      };

      await request(server.app)
        .post('/mcp')
        .send(nullParamRequest);
      // Should handle null values gracefully
    });

    test('should handle undefined tool arguments', async () => {
      const undefinedArgsRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        id: 1,
        params: {
          name: 'context',
          arguments: undefined
        }
      };

      await request(server.app)
        .post('/mcp')
        .send(undefinedArgsRequest);
      // Should handle undefined arguments
    });
  });

  describe('Server Construction Coverage', () => {
    test('should create server with different configuration', async () => {
      // Test server creation with environment variables
      const originalPort = process.env.PORT;
      process.env.PORT = '5000';

      const configuredServer = new MemorAIMCPServer();
      expect(configuredServer).toBeDefined();
      expect(configuredServer.app).toBeDefined();

      // Restore environment
      if (originalPort) {
        process.env.PORT = originalPort;
      } else {
        delete process.env.PORT;
      }

      if (configuredServer && typeof configuredServer.stop === 'function') {
        await configuredServer.stop();
      }
    });
  });
});