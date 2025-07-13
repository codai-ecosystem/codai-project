/**
 * Ultimate Server Tests
 * Comprehensive test suite for the ROMAI Ultimate MCP Server
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { RomaiUltimateMcpServer } from '../../src/ultimate-server';

describe('RomaiUltimateMcpServer', () => {
  let server: RomaiUltimateMcpServer;

  beforeEach(() => {
    // Mock environment variables
    process.env['ROMAI_SERVER_MODE'] = 'test';
    process.env['NODE_ENV'] = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (server) {
      // Clean up server if needed
    }
  });

  describe('Server Initialization', () => {
    test('should create server instance', () => {
      server = new RomaiUltimateMcpServer();
      expect(server).toBeDefined();
      expect(server).toBeInstanceOf(RomaiUltimateMcpServer);
    });

    test('should initialize with correct server metadata', () => {
      server = new RomaiUltimateMcpServer();
      expect(server).toBeDefined();

      // Verify server has proper configuration
      const serverInfo = (server as any).server;
      expect(serverInfo).toBeDefined();
    });

    test('should initialize integration manager', async () => {
      server = new RomaiUltimateMcpServer();
      await expect(server.initialize()).resolves.not.toThrow();
    });
  });

  describe('Tool Registration', () => {
    test('should register all 33+ tools', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      const tools = await server.listTools();
      expect(tools).toBeDefined();
      expect(tools.tools.length).toBeGreaterThanOrEqual(33);
    });

    test('should include Romanian business intelligence tools', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      const tools = await server.listTools();
      const romanianTools = tools.tools.filter(tool =>
        tool.name.includes('romai') ||
        tool.description.toLowerCase().includes('romanian')
      );

      expect(romanianTools.length).toBeGreaterThan(0);
    });

    test('should include all integration domain tools', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      const tools = await server.listTools();
      const toolNames = tools.tools.map(t => t.name);

      // Check for filesystem tools
      const filesystemTools = toolNames.filter(name => name.includes('file') || name.includes('directory'));
      expect(filesystemTools.length).toBeGreaterThan(0);

      // Check for git tools
      const gitTools = toolNames.filter(name => name.includes('git'));
      expect(gitTools.length).toBeGreaterThan(0);

      // Check for database tools
      const dbTools = toolNames.filter(name => name.includes('db') || name.includes('database'));
      expect(dbTools.length).toBeGreaterThan(0);
    });
  });

  describe('Resource Management', () => {
    test('should provide MCP resources', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      const resources = await server.listResources();
      expect(resources).toBeDefined();
      expect(Array.isArray(resources.resources)).toBe(true);
    });

    test('should handle resource reading', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      const resources = await server.listResources();
      if (resources.resources.length > 0) {
        const firstResource = resources.resources[0];
        const resourceContent = await server.readResource(firstResource.uri);
        expect(resourceContent).toBeDefined();
      }
    });
  });

  describe('Prompt Management', () => {
    test('should provide MCP prompts', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      const prompts = await server.listPrompts();
      expect(prompts).toBeDefined();
      expect(Array.isArray(prompts.prompts)).toBe(true);
    });

    test('should handle prompt execution', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      const prompts = await server.listPrompts();
      if (prompts.prompts.length > 0) {
        const firstPrompt = prompts.prompts[0];
        const promptResult = await server.getPrompt(firstPrompt.name, {});
        expect(promptResult).toBeDefined();
      }
    });
  });

  describe('Tool Execution', () => {
    test('should execute Romanian intelligence tool', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      const result = await server.callTool('romai_intelligence', {
        query: 'Test query for enterprise assessment',
        domain: 'technology',
        language: 'en'
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
    });

    test('should execute health check tool', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      const result = await server.callTool('romai_health_check', {});

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      const content = Array.isArray(result.content) ? result.content[0] : result.content;
      if (content && 'text' in content) {
        const healthData = JSON.parse(content.text);
        expect(healthData).toHaveProperty('status');
      }
    });

    test('should handle tool execution errors gracefully', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      await expect(
        server.callTool('nonexistent_tool', {})
      ).rejects.toThrow();
    });

    test('should validate tool parameters', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      // Test with invalid parameters
      await expect(
        server.callTool('romai_intelligence', { invalid: 'parameter' })
      ).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    test('should initialize within reasonable time', async () => {
      const startTime = Date.now();
      server = new RomaiUltimateMcpServer();
      await server.initialize();
      const endTime = Date.now();

      const initTime = endTime - startTime;
      expect(initTime).toBeLessThan(5000); // Less than 5 seconds
    });

    test('should handle concurrent tool calls', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      const promises = Array.from({ length: 5 }, () =>
        server.callTool('romai_health_check', {})
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle initialization failures gracefully', async () => {
      // Mock a failing initialization scenario
      const originalEnv = process.env['ROMAI_SERVER_MODE'];
      process.env['ROMAI_SERVER_MODE'] = 'failing-mode';

      server = new RomaiUltimateMcpServer();
      await expect(server.initialize()).resolves.not.toThrow();

      process.env['ROMAI_SERVER_MODE'] = originalEnv;
    });

    test('should provide meaningful error messages', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      try {
        await server.callTool('invalid_tool', {});
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBeTruthy();
      }
    });
  });

  describe('Integration Health', () => {
    test('should report integration health status', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      const healthCheck = await server.callTool('romai_health_check', {});
      expect(healthCheck).toBeDefined();

      const content = Array.isArray(healthCheck.content) ? healthCheck.content[0] : healthCheck.content;
      if (content && 'text' in content) {
        const healthData = JSON.parse(content.text);
        expect(healthData.status).toBeDefined();
      }
    });
  });

  describe('Memory and Resources', () => {
    test('should manage memory efficiently', async () => {
      server = new RomaiUltimateMcpServer();
      await server.initialize();

      // Monitor memory usage during tool execution
      const initialMemory = process.memoryUsage();

      // Execute multiple tools
      for (let i = 0; i < 10; i++) {
        await server.callTool('romai_health_check', {});
      }

      const finalMemory = process.memoryUsage();

      // Memory growth should be reasonable
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Less than 50MB growth
    });
  });
});
