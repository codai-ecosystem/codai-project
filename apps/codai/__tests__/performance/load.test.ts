import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CodeGenerationFlow } from '../../lib/flows/code-generation';
import { ProjectManagementFlow } from '../../lib/flows/project-management';

describe('Load Performance Tests', () => {
  let codeGenFlow: CodeGenerationFlow;
  let projectFlow: ProjectManagementFlow;

  beforeEach(() => {
    codeGenFlow = new CodeGenerationFlow();
    projectFlow = new ProjectManagementFlow();
  });

  describe('Code Generation Load Tests', () => {
    it('should handle concurrent code generation requests', async () => {
      const startTime = Date.now();
      const concurrentRequests = 10;

      const requests = Array.from({ length: concurrentRequests }, (_, i) =>
        codeGenFlow.generateCode({
          prompt: `Function ${i}`,
          language: 'javascript',
          complexity: 'simple'
        })
      );

      const results = await Promise.all(requests);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(concurrentRequests);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      results.forEach(result => {
        expect(result.generatedCode).toBeTruthy();
      });
    });

    it('should maintain performance under sustained load', async () => {
      const iterations = 50;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await codeGenFlow.generateCode({
          prompt: `Sustained test ${i}`,
          language: 'typescript',
          complexity: 'moderate'
        });
        times.push(Date.now() - start);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);

      expect(avgTime).toBeLessThan(100); // Average under 100ms
      expect(maxTime).toBeLessThan(500); // No request over 500ms
    });

    it('should handle memory efficiently during bulk operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      const bulkRequests = Array.from({ length: 100 }, (_, i) =>
        codeGenFlow.generateCode({
          prompt: `Bulk request ${i}`,
          language: 'python',
          complexity: 'simple'
        })
      );

      await Promise.all(bulkRequests);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Project Management Load Tests', () => {
    it('should handle rapid project creation', async () => {
      const startTime = Date.now();
      const projectCount = 50;

      const projects = await Promise.all(
        Array.from({ length: projectCount }, (_, i) =>
          projectFlow.createProject(`Load Test Project ${i}`)
        )
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(projects).toHaveLength(projectCount);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds

      // Verify all projects have unique IDs
      const ids = projects.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(projectCount);
    });

    it('should handle bulk task operations', async () => {
      const project = await projectFlow.createProject('Bulk Task Test');
      const taskCount = 100;

      const startTime = Date.now();
      const tasks = await Promise.all(
        Array.from({ length: taskCount }, (_, i) =>
          projectFlow.addTask(project.id, `Task ${i}`)
        )
      );
      const endTime = Date.now();

      expect(tasks).toHaveLength(taskCount);
      expect(endTime - startTime).toBeLessThan(1000); // Under 1 second
    });
  });

  describe('Mixed Workflow Load Tests', () => {
    it('should handle mixed operations under load', async () => {
      const operations: Promise<any>[] = [];
      const operationCount = 30;

      // Mix of different operations
      for (let i = 0; i < operationCount; i++) {
        if (i % 3 === 0) {
          operations.push(
            codeGenFlow.generateCode({
              prompt: `Mixed test ${i}`,
              language: 'javascript',
              complexity: 'simple'
            })
          );
        } else if (i % 3 === 1) {
          operations.push(projectFlow.createProject(`Mixed Project ${i}`));
        } else {
          operations.push(
            projectFlow.addTask('dummy-id', `Mixed Task ${i}`)
          );
        }
      }

      const startTime = Date.now();
      const results = await Promise.allSettled(operations);
      const endTime = Date.now();

      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(operationCount * 0.8); // At least 80% success
      expect(endTime - startTime).toBeLessThan(3000); // Under 3 seconds
    });

    it('should maintain responsiveness during peak load', async () => {
      const peakOperations = 100;
      const responseTimes: number[] = [];

      for (let i = 0; i < peakOperations; i++) {
        const start = Date.now();

        await Promise.race([
          codeGenFlow.generateCode({
            prompt: `Peak test ${i}`,
            language: 'typescript',
            complexity: 'simple'
          }),
          new Promise(resolve => setTimeout(resolve, 1000)) // 1 second timeout
        ]);

        responseTimes.push(Date.now() - start);
      }

      const p95 = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];
      expect(p95).toBeLessThan(1000); // 95th percentile under 1 second
    });
  });
});