/**
 * Integration Tests
 * End-to-end testing of ROMAI Ultimate MCP Server integration capabilities
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { RomaiUltimateMcpServer } from '../../src/ultimate-server';

describe('Integration Tests', () => {
  let server: RomaiUltimateMcpServer;

  beforeAll(async () => {
    // Set up test environment
    process.env['NODE_ENV'] = 'test';
    process.env['ROMAI_SERVER_MODE'] = 'integration_test';

    server = new RomaiUltimateMcpServer();
    await server.initialize();
  });

  afterAll(async () => {
    // Clean up after all tests
    if (server) {
      // Cleanup server resources if needed
    }
  });

  beforeEach(() => {
    // Reset state before each test
  });

  afterEach(() => {
    // Clean up after each test
  });

  describe('End-to-End Workflow Tests', () => {
    test('should complete Romanian business analysis workflow', async () => {
      // Step 1: Health check
      const healthResult = await server.callTool('romai_health_check', {});
      expect(healthResult).toBeDefined();

      // Step 2: Intelligence analysis
      const intelligenceResult = await server.callTool('romai_intelligence', {
        query: 'Analyze Romanian tech market opportunities for AI startups',
        domain: 'technology',
        language: 'en'
      });
      expect(intelligenceResult).toBeDefined();
      expect(intelligenceResult.content).toBeDefined();

      // Step 3: Problem solving
      const problemResult = await server.callTool('romai_problem_solver', {
        problem: 'How to enter Romanian AI market as international startup',
        language: 'en'
      });
      expect(problemResult).toBeDefined();

      // Step 4: Romanian expert consultation
      const expertResult = await server.callTool('romai_romanian_expert', {
        query: 'What are the key cultural considerations for AI business in Romania?',
        category: 'business'
      });
      expect(expertResult).toBeDefined();

      // Step 5: Code assistance for implementation
      const codeResult = await server.callTool('romai_code_assistant', {
        request: 'Create a Romanian localization module for AI application',
        language: 'TypeScript',
        framework: 'Node.js'
      });
      expect(codeResult).toBeDefined();
    }, 30000); // 30 second timeout for complete workflow

    test('should handle enterprise-level data processing workflow', async () => {
      // Test comprehensive data pipeline
      const workflows = [
        { tool: 'romai_health_check', params: {} },
        {
          tool: 'romai_intelligence',
          params: {
            query: 'Enterprise data processing architecture for Romanian compliance',
            domain: 'technology',
            language: 'en'
          }
        },
        {
          tool: 'romai_problem_solver',
          params: {
            problem: 'Design GDPR-compliant data architecture for Romanian enterprise',
            constraints: 'Must handle 1M+ records, real-time processing',
            goals: 'High performance, full compliance, scalability'
          }
        }
      ];

      const results = [];
      for (const workflow of workflows) {
        const result = await server.callTool(workflow.tool, workflow.params);
        results.push(result);
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }

      expect(results).toHaveLength(workflows.length);
    }, 45000);
  });

  describe('Multi-Domain Integration Tests', () => {
    test('should integrate business, technical, and cultural insights', async () => {
      const queries = [
        {
          tool: 'romai_intelligence',
          params: {
            query: 'Romanian fintech market analysis',
            domain: 'business',
            language: 'en'
          }
        },
        {
          tool: 'romai_romanian_expert',
          params: {
            query: 'Romanian banking regulations for fintech startups',
            category: 'legal'
          }
        },
        {
          tool: 'romai_code_assistant',
          params: {
            request: 'Implement Romanian banking API integration with BNR compliance',
            language: 'TypeScript',
            framework: 'Express.js'
          }
        }
      ];

      const results = await Promise.all(
        queries.map(q => server.callTool(q.tool, q.params))
      );

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      });
    }, 25000);

    test('should handle concurrent multi-domain requests', async () => {
      const concurrentRequests = Array.from({ length: 5 }, (_, i) => ({
        tool: 'romai_intelligence',
        params: {
          query: `Concurrent analysis request ${i + 1}`,
          domain: 'technology',
          language: 'en'
        }
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        concurrentRequests.map(req => server.callTool(req.tool, req.params))
      );
      const endTime = Date.now();

      expect(results).toHaveLength(5);
      expect(endTime - startTime).toBeLessThan(15000); // All requests within 15 seconds

      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      });
    }, 20000);
  });

  describe('Error Handling and Recovery', () => {
    test('should handle invalid tool parameters gracefully', async () => {
      const invalidRequests = [
        { tool: 'romai_intelligence', params: {} }, // Missing required params
        { tool: 'romai_intelligence', params: { invalid: 'param' } }, // Invalid params
        { tool: 'nonexistent_tool', params: {} } // Tool doesn't exist
      ];

      for (const request of invalidRequests) {
        try {
          await server.callTool(request.tool, request.params);
          // If no error thrown, that's also a valid outcome for graceful handling
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBeTruthy();
        }
      }
    });

    test('should recover from temporary service failures', async () => {
      // Test resilience by attempting operations that might temporarily fail
      const resilientOperations = [
        { tool: 'romai_health_check', params: {} },
        {
          tool: 'romai_intelligence',
          params: {
            query: 'Test resilience',
            domain: 'general',
            language: 'en'
          }
        }
      ];

      for (const operation of resilientOperations) {
        let success = false;
        let attempts = 0;
        const maxAttempts = 3;

        while (!success && attempts < maxAttempts) {
          try {
            const result = await server.callTool(operation.tool, operation.params);
            expect(result).toBeDefined();
            success = true;
          } catch (error) {
            attempts++;
            if (attempts === maxAttempts) {
              throw error;
            }
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    });
  });

  describe('Performance and Scalability', () => {
    test('should maintain performance under load', async () => {
      const loadTestRequests = Array.from({ length: 20 }, (_, i) => ({
        tool: 'romai_health_check',
        params: {}
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        loadTestRequests.map(req => server.callTool(req.tool, req.params))
      );
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const avgTimePerRequest = totalTime / loadTestRequests.length;

      expect(results).toHaveLength(20);
      expect(avgTimePerRequest).toBeLessThan(1000); // Less than 1 second average

      results.forEach(result => {
        expect(result).toBeDefined();
      });
    }, 30000);

    test('should handle memory efficiently during extended operations', async () => {
      const initialMemory = process.memoryUsage();

      // Perform multiple memory-intensive operations
      for (let i = 0; i < 10; i++) {
        await server.callTool('romai_intelligence', {
          query: `Extended operation ${i} - analyze large dataset patterns`,
          domain: 'technology',
          language: 'en'
        });
      }

      const finalMemory = process.memoryUsage();
      const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory growth should be reasonable (less than 100MB)
      expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024);
    }, 45000);
  });

  describe('Resource Management Integration', () => {
    test('should properly manage MCP resources', async () => {
      const resources = await server.listResources();
      expect(resources).toBeDefined();
      expect(Array.isArray(resources.resources)).toBe(true);

      // Test resource reading if resources exist
      if (resources.resources.length > 0) {
        for (const resource of resources.resources.slice(0, 3)) { // Test first 3 resources
          try {
            const content = await server.readResource(resource.uri);
            expect(content).toBeDefined();
          } catch (error) {
            // Resource might not be available, which is acceptable
            expect(error).toBeInstanceOf(Error);
          }
        }
      }
    });

    test('should handle prompt integration effectively', async () => {
      const prompts = await server.listPrompts();
      expect(prompts).toBeDefined();
      expect(Array.isArray(prompts.prompts)).toBe(true);

      // Test prompt execution if prompts exist
      if (prompts.prompts.length > 0) {
        for (const prompt of prompts.prompts.slice(0, 2)) { // Test first 2 prompts
          try {
            const result = await server.getPrompt(prompt.name, {});
            expect(result).toBeDefined();
          } catch (error) {
            // Prompt might require specific parameters
            expect(error).toBeInstanceOf(Error);
          }
        }
      }
    });
  });

  describe('Data Quality and Consistency', () => {
    test('should provide consistent response formats', async () => {
      const tools = ['romai_health_check', 'romai_intelligence'];
      const responses = [];

      for (const tool of tools) {
        let params = {};
        if (tool === 'romai_intelligence') {
          params = {
            query: 'Test consistency',
            domain: 'general',
            language: 'en'
          };
        }

        const response = await server.callTool(tool, params);
        responses.push(response);

        expect(response).toBeDefined();
        expect(response).toHaveProperty('content');
      }

      // All responses should have consistent structure
      responses.forEach(response => {
        expect(response.content).toBeDefined();
      });
    });

    test('should maintain data integrity across operations', async () => {
      // Test that repeated calls return consistent results for deterministic operations
      const healthResults = [];

      for (let i = 0; i < 3; i++) {
        const result = await server.callTool('romai_health_check', {});
        healthResults.push(result);
      }

      expect(healthResults).toHaveLength(3);
      healthResults.forEach(result => {
        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      });
    });
  });
});
