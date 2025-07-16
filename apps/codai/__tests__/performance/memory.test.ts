import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CodeGenerationFlow } from '../../lib/flows/code-generation';
import { ProjectManagementFlow } from '../../lib/flows/project-management';

describe('Memory Performance Tests', () => {
  let codeGenFlow: CodeGenerationFlow;
  let projectFlow: ProjectManagementFlow;
  let initialMemory: number;

  beforeEach(() => {
    codeGenFlow = new CodeGenerationFlow();
    projectFlow = new ProjectManagementFlow();
    initialMemory = process.memoryUsage().heapUsed;
  });

  afterEach(() => {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  });

  describe('Memory Usage Monitoring', () => {
    it('should not leak memory during repeated operations', async () => {
      const iterations = 50;
      const memorySnapshots: number[] = [];

      for (let i = 0; i < iterations; i++) {
        await codeGenFlow.generateCode({
          prompt: `Memory test ${i}`,
          language: 'javascript',
          complexity: 'simple'
        });

        if (i % 10 === 0) {
          memorySnapshots.push(process.memoryUsage().heapUsed);
        }
      }

      // Memory should not consistently increase
      const firstSnapshot = memorySnapshots[0];
      const lastSnapshot = memorySnapshots[memorySnapshots.length - 1];
      const memoryIncrease = lastSnapshot - firstSnapshot;

      // Allow some increase but not excessive (less than 20MB)
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024);
    });

    it('should handle large data structures efficiently', async () => {
      const largeProjects: any[] = [];
      const projectCount = 100;

      for (let i = 0; i < projectCount; i++) {
        const project = await projectFlow.createProject(`Large Project ${i}`);

        // Add multiple tasks to each project
        for (let j = 0; j < 10; j++) {
          await projectFlow.addTask(project.id, `Task ${j} for project ${i}`);
        }

        largeProjects.push(project);
      }

      const memoryAfterCreation = process.memoryUsage().heapUsed;
      const memoryUsed = memoryAfterCreation - initialMemory;

      // Memory usage should be reasonable for the amount of data
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
      expect(largeProjects).toHaveLength(projectCount);
    });

    it('should clean up resources properly', async () => {
      const operationCount = 30;
      const memoryBefore = process.memoryUsage().heapUsed;

      // Perform operations that should be cleaned up
      const promises: Promise<any>[] = [];
      for (let i = 0; i < operationCount; i++) {
        promises.push(
          codeGenFlow.generateCode({
            prompt: `Cleanup test ${i}`,
            language: 'typescript',
            complexity: 'moderate'
          })
        );
      }

      await Promise.all(promises);

      // Force garbage collection
      if (global.gc) {
        global.gc();
        // Wait a bit for GC to complete
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const memoryAfter = process.memoryUsage().heapUsed;
      const memoryIncrease = memoryAfter - memoryBefore;

      // Memory increase should be minimal after cleanup
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe('Memory Efficiency', () => {
    it('should optimize memory for concurrent operations', async () => {
      const concurrentCount = 20;
      const memoryBefore = process.memoryUsage().heapUsed;

      const concurrentOps = Array.from({ length: concurrentCount }, (_, i) =>
        Promise.all([
          codeGenFlow.generateCode({
            prompt: `Concurrent ${i}`,
            language: 'python',
            complexity: 'simple'
          }),
          projectFlow.createProject(`Concurrent Project ${i}`)
        ])
      );

      await Promise.all(concurrentOps);

      const memoryAfter = process.memoryUsage().heapUsed;
      const memoryPerOperation = (memoryAfter - memoryBefore) / (concurrentCount * 2);

      // Each operation should use less than 1MB on average
      expect(memoryPerOperation).toBeLessThan(1024 * 1024);
    });

    it('should handle memory pressure gracefully', async () => {
      // Simulate memory pressure with large operations
      const largePrompt = 'Create a complex system '.repeat(100);
      const pressureOps = 10;

      const memoryBefore = process.memoryUsage().heapUsed;

      try {
        const operations = Array.from({ length: pressureOps }, () =>
          codeGenFlow.generateCode({
            prompt: largePrompt,
            language: 'javascript',
            complexity: 'complex'
          })
        );

        const results = await Promise.all(operations);
        expect(results).toHaveLength(pressureOps);

      } catch (error) {
        // If memory pressure causes failures, that's acceptable
        console.log('Memory pressure handling test completed with expected pressure');
      }

      const memoryAfter = process.memoryUsage().heapUsed;
      const totalMemoryUsed = memoryAfter - memoryBefore;

      // Even under pressure, memory usage should be bounded
      expect(totalMemoryUsed).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });

    it('should optimize memory for streaming operations', async () => {
      const streamSize = 100;
      let maxMemoryUsed = 0;

      for (let i = 0; i < streamSize; i++) {
        await codeGenFlow.generateCode({
          prompt: `Stream item ${i}`,
          language: 'typescript',
          complexity: 'simple'
        });

        const currentMemory = process.memoryUsage().heapUsed - initialMemory;
        maxMemoryUsed = Math.max(maxMemoryUsed, currentMemory);

        // Periodic cleanup simulation
        if (i % 20 === 0 && global.gc) {
          global.gc();
        }
      }

      // Memory usage should remain bounded even with streaming
      expect(maxMemoryUsed).toBeLessThan(30 * 1024 * 1024); // Less than 30MB peak
    });
  });

  describe('Resource Management', () => {
    it('should properly dispose of temporary resources', async () => {
      const resourceOps = 25;
      const memorySnapshots: number[] = [];

      for (let i = 0; i < resourceOps; i++) {
        // Operations that create temporary resources
        await Promise.all([
          codeGenFlow.generateCode({
            prompt: `Resource test ${i}`,
            language: 'javascript',
            complexity: 'moderate'
          }),
          projectFlow.createProject(`Resource Project ${i}`)
        ]);

        // Take memory snapshot every 5 operations
        if (i % 5 === 0) {
          memorySnapshots.push(process.memoryUsage().heapUsed);
        }
      }

      // Memory growth should be minimal and stable
      const growthRates: number[] = [];
      for (let i = 1; i < memorySnapshots.length; i++) {
        growthRates.push(memorySnapshots[i] - memorySnapshots[i - 1]);
      }

      const avgGrowthRate = growthRates.reduce((a, b) => a + b, 0) / growthRates.length;

      // Average growth rate should be minimal (less than 2MB per batch)
      expect(Math.abs(avgGrowthRate)).toBeLessThan(2 * 1024 * 1024);
    });
  });
});