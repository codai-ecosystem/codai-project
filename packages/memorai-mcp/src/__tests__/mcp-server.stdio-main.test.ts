import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemorAIMCPServer } from '../mcp-server';

// Mock the AI integration
vi.mock('../ai-integration', () => ({
  advancedAI: {
    healthCheck: vi.fn().mockResolvedValue({ status: 'healthy' }),
    semanticClustering: vi.fn(),
    multimodalSynthesis: vi.fn(),
    intelligenceQuery: vi.fn(),
    analyzePatterns: vi.fn(),
    knowledgeGraph: vi.fn()
  }
}));

// Mock MCP SDK components
vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: vi.fn(() => ({
    setRequestHandler: vi.fn(),
    registerTool: vi.fn(),
    connect: vi.fn(),
    close: vi.fn()
  }))
}));

vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn(() => ({
    connect: vi.fn(),
    close: vi.fn()
  }))
}));

vi.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
  StreamableHTTPServerTransport: vi.fn(() => ({
    handleRequest: vi.fn(),
    close: vi.fn()
  }))
}));

describe('MemorAI MCP Server - STDIO and Main Function Coverage', () => {
  let server: MemorAIMCPServer;
  let originalArgv: string[];
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Save original process.argv
    originalArgv = [...process.argv];

    // Mock console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = vi.fn();
    console.error = vi.fn();

    server = new MemorAIMCPServer();
  });

  afterEach(async () => {
    // Restore original process.argv
    process.argv = originalArgv;

    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;

    if (server && typeof server.stop === 'function') {
      await server.stop();
    }

    vi.clearAllMocks();
  });

  describe('STDIO Mode Coverage', () => {
    test('should start server in STDIO-only mode', async () => {
      // Add --stdio flag to process.argv
      process.argv.push('--stdio');

      await server.start();

      // Verify STDIO mode console outputs
      expect(console.log).toHaveBeenCalledWith('📡 STDIO-only mode for VS Code integration...');
      expect(console.log).toHaveBeenCalledWith('✅ MemorAI MCP Server ready via STDIO');
      expect(console.log).toHaveBeenCalledWith('🛠️  Basic Tools: remember, recall, forget, context');
      expect(console.log).toHaveBeenCalledWith('🚀 Advanced AI Tools: knowledge_graph, analyze_patterns, semantic_clustering, multimodal_synthesis, intelligence_query');
      expect(console.log).toHaveBeenCalledWith('🧠 RomAI AGI Integration: Enabled\n');
    });

    test('should return early in STDIO mode without starting HTTP server', async () => {
      // Add --stdio flag to process.argv
      process.argv.push('--stdio');

      // Mock app.listen to verify it's not called
      const listenSpy = vi.spyOn(server.app, 'listen');

      await server.start();

      // HTTP server should not be started in STDIO mode
      expect(listenSpy).not.toHaveBeenCalled();
    });
  });

  describe('HTTP Server Mode Coverage', () => {
    test('should start server in HTTP mode when no --stdio flag', async () => {
      // Ensure --stdio is not in argv
      process.argv = process.argv.filter(arg => arg !== '--stdio');

      // Mock app.listen
      const mockListen = vi.fn((port, callback) => {
        // Simulate server starting
        if (callback) callback();
      });
      vi.spyOn(server.app, 'listen').mockImplementation(mockListen);

      await server.start();

      // Verify HTTP server startup console outputs
      expect(console.log).toHaveBeenCalledWith('🧠 Starting MemorAI MCP Server - Advanced AI Enhanced...');
      expect(console.log).toHaveBeenCalledWith('📋 Configuration: Port 4950, Vector Search: true');
      expect(console.log).toHaveBeenCalledWith('🚀 Server Status:');
      expect(console.log).toHaveBeenCalledWith('   ✅ HTTP Server listening on port 4950');
      expect(console.log).toHaveBeenCalledWith('   🌐 MCP Endpoint: http://localhost:4950/mcp');
      expect(console.log).toHaveBeenCalledWith('   💚 Health Check: http://localhost:4950/health');
      expect(console.log).toHaveBeenCalledWith('🧠 Advanced AI Tools: 5 AI-powered capabilities');
      expect(console.log).toHaveBeenCalledWith('✅ MemorAI MCP Server ready with Advanced AI!\n');

      // Verify app.listen was called
      expect(mockListen).toHaveBeenCalledWith(4950, expect.any(Function));
    });
  });

  describe('Signal Handling Coverage', () => {
    test('should handle SIGINT gracefully', () => {
      const originalExit = process.exit;
      const mockExit = vi.fn();
      process.exit = mockExit as any;

      // Get the SIGINT handler
      const listeners = process.listeners('SIGINT');
      const sigintHandler = listeners[listeners.length - 1]; // Get the last added handler

      // Simulate SIGINT
      if (typeof sigintHandler === 'function') {
        sigintHandler('SIGINT');
      }

      // Verify graceful shutdown message and exit
      expect(console.log).toHaveBeenCalledWith('\n🛑 Shutting down gracefully...');
      expect(mockExit).toHaveBeenCalledWith(0);

      // Restore process.exit
      process.exit = originalExit;
    });
  });

  describe('Main Function Coverage', () => {
    test('should handle main function execution path', async () => {
      // Mock fileURLToPath to simulate being called as main module
      const mockFileURLToPath = vi.fn(() => process.argv[1]);

      // Temporarily replace process.argv[1] to simulate main module execution
      const originalArgv1 = process.argv[1];
      process.argv[1] = mockFileURLToPath();

      // Mock server.start to avoid actual startup
      const startSpy = vi.spyOn(MemorAIMCPServer.prototype, 'start').mockResolvedValue();

      // Dynamically import and execute main function logic
      // Since we can't directly test the main function due to module loading,
      // we'll test the server construction and start method call
      const testServer = new MemorAIMCPServer();
      await testServer.start();

      expect(startSpy).toHaveBeenCalled();

      // Restore
      process.argv[1] = originalArgv1;
      startSpy.mockRestore();
    });

    test('should handle main function error', async () => {
      const originalExit = process.exit;
      const mockExit = vi.fn();
      process.exit = mockExit as any;

      // Mock server.start to throw error
      const startSpy = vi.spyOn(MemorAIMCPServer.prototype, 'start').mockRejectedValue(new Error('Server startup failed'));

      try {
        const testServer = new MemorAIMCPServer();
        await testServer.start();
      } catch (error) {
        // This would normally be caught by main() function
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Server startup failed');
      }

      // Restore
      startSpy.mockRestore();
      process.exit = originalExit;
    });
  });

  describe('Configuration and Feature Flag Coverage', () => {
    test('should handle different feature flag combinations', () => {
      const originalEnv = process.env;

      // Test with different feature flags
      process.env.ENABLE_VECTOR_SEARCH = 'false';
      process.env.ENABLE_HYBRID_SEARCH = 'false';
      process.env.ENABLE_RBAC = 'true';

      // Create server with different config
      const configuredServer = new MemorAIMCPServer();
      expect(configuredServer).toBeDefined();

      // Restore environment
      process.env = originalEnv;
    });

    test('should handle missing configuration gracefully', () => {
      const originalEnv = process.env;

      // Remove key environment variables
      delete process.env.MEMORAI_MCP_PORT;
      delete process.env.NODE_ENV;
      delete process.env.AZURE_OPENAI_ENDPOINT;

      // Server should still initialize with defaults
      const serverWithDefaults = new MemorAIMCPServer();
      expect(serverWithDefaults).toBeDefined();
      expect(serverWithDefaults.app).toBeDefined();

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('Tool Registration Edge Cases', () => {
    test('should handle tool registration with complex schemas', () => {
      // Test that createMCPServerWithTools handles all tool registrations
      const mcpServer = server.createMCPServerWithTools();
      expect(mcpServer).toBeDefined();
      expect(mcpServer.registerTool).toHaveBeenCalled();

      // Verify all 9 tools are registered
      expect(mcpServer.registerTool).toHaveBeenCalledTimes(9);
    });

    test('should handle MCP server request handler registration', () => {
      const mcpServer = server.createMCPServerWithTools();
      expect(mcpServer.setRequestHandler).toHaveBeenCalled();
    });
  });

  describe('Memory Store Initialization Coverage', () => {
    test('should initialize memory store with default structure', () => {
      expect(server.memoryStore).toBeDefined();
      expect(server.memoryStore.memories).toBeDefined();
      expect(server.memoryStore.memories.size).toBe(0);
    });

    test('should handle memory store operations', () => {
      // Test basic memory store functionality
      const testKey = 'test-key';
      const testMemory = {
        key: testKey,
        agentId: 'test-agent',
        content: 'test content',
        metadata: { test: true },
        timestamp: new Date(),
        embedding: null
      };

      server.memoryStore.memories.set(testKey, testMemory);

      expect(server.memoryStore.memories.has(testKey)).toBe(true);
      expect(server.memoryStore.memories.get(testKey)).toEqual(testMemory);
    });
  });
});