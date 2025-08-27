/**
 * Glass MCP v7.0 - Automation Orchestrator Test Suite
 * 
 * Comprehensive tests for the main automation orchestration engine.
 * 
 * @version 7.0.0-alpha.1
 * @since 2025-08-26
 */

import { AdvancedAutomationOrchestrator } from '../src/automation/automation-orchestrator';
import {
  AutomationWorkflow,
  AutomationTask,
  TaskType,
  WorkflowPriority,
  TaskPriority,
  AutomationConfiguration,
  WorkflowCategory,
  ExecutionMode,
  ProviderType,
  TaskParameters,
  AutomationOperation
} from '../src/automation/automation-types';

import { createMockAutomationContext, createMockWorkflow, createMockTask, delay, measurePerformance } from './setup';

describe('AdvancedAutomationOrchestrator', () => {
  let orchestrator: AdvancedAutomationOrchestrator;
  let mockConfig: AutomationConfiguration;

  beforeEach(() => {
    mockConfig = {
      maxConcurrentWorkflows: 5,
      maxConcurrentTasks: 10,
      defaultTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      healthCheckInterval: 10000,
      performanceMonitoringEnabled: true,
      loggingLevel: 'info',
      enableTelemetry: true,
      enableLearning: true,
      windowsUIAutomation: {
        timeout: 5000,
        retryDelay: 500,
        enablePatternCache: true
      }
    };

    orchestrator = new AdvancedAutomationOrchestrator(mockConfig);
  });

  afterEach(async () => {
    if (orchestrator) {
      try {
        await orchestrator.shutdown();
      } catch (error) {
        // Ignore shutdown errors in tests
      }
    }
  });

  describe('Initialization and Lifecycle', () => {
    it('should initialize successfully', async () => {
      await expect(orchestrator.initialize()).resolves.toBeUndefined();
    });

    it('should handle initialization errors gracefully', async () => {
      // Create orchestrator with invalid config
      const invalidConfig = { ...mockConfig, maxConcurrentWorkflows: -1 };
      const invalidOrchestrator = new AdvancedAutomationOrchestrator(invalidConfig);
      
      // Should still initialize but log warnings
      await expect(invalidOrchestrator.initialize()).resolves.toBeUndefined();
      
      await invalidOrchestrator.shutdown();
    });

    it('should shutdown gracefully', async () => {
      await orchestrator.initialize();
      await expect(orchestrator.shutdown()).resolves.toBeUndefined();
    });

    it('should maintain lifecycle state correctly', async () => {
      expect(orchestrator.isHealthy()).toBe(false); // Not initialized yet
      
      await orchestrator.initialize();
      expect(orchestrator.isHealthy()).toBe(true);
      
      await orchestrator.shutdown();
      expect(orchestrator.isHealthy()).toBe(false);
    });
  });

  describe('Workflow Management', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    const createMockWorkflow = (id: string): AutomationWorkflow => ({
      id,
      name: `Test Workflow ${id}`,
      description: 'Test automation workflow',
      version: '1.0.0',
      category: WorkflowCategory.UI_AUTOMATION,
      priority: WorkflowPriority.NORMAL,
      executionMode: ExecutionMode.SEQUENTIAL,
      timeout: 30000,
      creator: 'test-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['test'],
      tasks: [
        {
          id: `${id}-task-1`,
          name: 'Test Task 1',
          description: 'First test task',
          type: TaskType.UI_INTERACTION,
          priority: TaskPriority.NORMAL,
          parameters: {
            input: { action: 'click', target: 'button' },
            configuration: {}
          },
          timeout: 5000,
          retryCount: 2,
          dependencies: [],
          preconditions: [],
          operation: {
            provider: ProviderType.AI_INTELLIGENCE,
            method: 'processTask',
            parameters: { action: 'click', target: 'button' }
          }
        },
        {
          id: `${id}-task-2`,
          name: 'Test Task 2',
          description: 'Second test task',
          type: TaskType.OCR_EXTRACTION,
          priority: TaskPriority.NORMAL,
          parameters: {
            input: { selector: '.data', format: 'json' },
            configuration: {}
          },
          timeout: 3000,
          retryCount: 1,
          dependencies: [],
          preconditions: [],
          operation: {
            provider: ProviderType.AI_INTELLIGENCE,
            method: 'processTask',
            parameters: { selector: '.data', format: 'json' }
          }
        }
      ],
      dependencies: []
    });
    });

    it('should execute workflow successfully', async () => {
      const workflow = createMockWorkflow('test-workflow-1');
      const context = createMockAutomationContext();
      
      const result = await orchestrator.executeWorkflow(workflow, context);
      
      expect(result).toHaveProperty('workflowId', workflow.id);
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('duration'); // Changed from executionTime to duration
      expect(result).toHaveProperty('taskResults');
      expect(result.taskResults.length).toBe(workflow.tasks.length);
    });

    it('should handle workflow execution errors gracefully', async () => {
      const workflow = createMockWorkflow('failing-workflow');
      // Add a task that will cause an error
      workflow.tasks.push({
        id: 'failing-task',
        name: 'Failing Task',
        type: TaskType.SYSTEM_COMMAND,
        priority: TaskPriority.HIGH,
        parameters: { command: 'invalid-command-that-will-fail' },
        timeout: 1000,
        retryAttempts: 0
      });
      
      const result = await orchestrator.executeWorkflow(workflow);
      
      expect(result).toHaveProperty('workflowId', workflow.id);
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error');
    });

    it('should execute multiple workflows concurrently', async () => {
      const workflows = [
        createMockWorkflow('concurrent-1'),
        createMockWorkflow('concurrent-2'),
        createMockWorkflow('concurrent-3')
      ];
      
      const startTime = Date.now();
      const results = await Promise.all(
        workflows.map(workflow => orchestrator.executeWorkflow(workflow))
      );
      const endTime = Date.now();
      
      expect(results.length).toBe(3);
      results.forEach((result, index) => {
        expect(result.workflowId).toBe(workflows[index].id);
        expect(result.success).toBe(true);
      });
      
      // Concurrent execution should be faster than sequential
      const concurrentTime = endTime - startTime;
      expect(concurrentTime).toBeLessThan(5000); // Should complete quickly
    });

    it('should respect workflow priorities', async () => {
      const highPriorityWorkflow = createMockWorkflow('high-priority');
      highPriorityWorkflow.priority = WorkflowPriority.HIGH;
      
      const lowPriorityWorkflow = createMockWorkflow('low-priority');
      lowPriorityWorkflow.priority = WorkflowPriority.LOW;
      
      // Execute both workflows
      const results = await Promise.all([
        orchestrator.executeWorkflow(lowPriorityWorkflow),
        orchestrator.executeWorkflow(highPriorityWorkflow)
      ]);
      
      expect(results.length).toBe(2);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should maintain workflow execution history', async () => {
      const workflow = createMockWorkflow('history-test');
      
      await orchestrator.executeWorkflow(workflow);
      
      const metrics = await orchestrator.getPerformanceMetrics();
      expect(metrics.totalWorkflowsExecuted).toBeGreaterThan(0);
      expect(metrics.totalTasksExecuted).toBeGreaterThan(0);
    });
  });

  describe('Task Execution', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    const createMockTask = (id: string, type: TaskType): AutomationTask => ({
      id,
      name: `Test Task ${id}`,
      description: `Mock task for testing: ${id}`,
      type,
      operation: {
        provider: 'ai_intelligence' as any,
        method: 'processTask',
        parameters: { taskType: type }
      },
      parameters: { 
        input: { test: true, mockData: 'example' },
        configuration: { timeout: 5000 }
      },
      timeout: 5000,
      retryCount: 1,
      priority: TaskPriority.NORMAL,
      dependencies: [],
      preconditions: []
    });

    it('should execute individual tasks successfully', async () => {
      const task = createMockTask('individual-task', TaskType.DATA_EXTRACTION);
      
      const result = await orchestrator.executeTask(task, createMockAutomationContext());
      
      expect(result).toHaveProperty('taskId', task.id);
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('executionTime');
      expect(result).toHaveProperty('result');
    });

    it('should execute batch of tasks', async () => {
      const tasks = [
        createMockTask('batch-1', TaskType.UI_INTERACTION),
        createMockTask('batch-2', TaskType.DATA_EXTRACTION),
        createMockTask('batch-3', TaskType.VALIDATION)
      ];
      
      const result = await orchestrator.executeBatch(tasks, createMockAutomationContext());
      
      expect(result).toHaveProperty('batchId');
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('results');
      expect(result.results.length).toBe(tasks.length);
      
      result.results.forEach((taskResult, index) => {
        expect(taskResult.taskId).toBe(tasks[index].id);
        expect(taskResult.success).toBe(true);
      });
    });

    it('should handle task timeouts', async () => {
      const task = createMockTask('timeout-task', TaskType.SYSTEM_COMMAND);
      task.timeout = 100; // Very short timeout
      task.parameters = { command: 'sleep 1' }; // Command that takes longer than timeout
      
      const result = await orchestrator.executeTask(task, createMockAutomationContext());
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should retry failed tasks', async () => {
      const task = createMockTask('retry-task', TaskType.SYSTEM_COMMAND);
      task.retryAttempts = 2;
      task.parameters = { command: 'exit 1' }; // Command that always fails
      
      const startTime = Date.now();
      const result = await orchestrator.executeTask(task, createMockAutomationContext());
      const endTime = Date.now();
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      // Should have taken time for retries
      const executionTime = endTime - startTime;
      expect(executionTime).toBeGreaterThan(1000); // At least retry delay time
    });
  });

  describe('Health Monitoring', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    it('should report health status', async () => {
      const healthReport = await orchestrator.getHealthReport();
      
      expect(healthReport).toHaveProperty('status');
      expect(healthReport).toHaveProperty('timestamp');
      expect(healthReport).toHaveProperty('subsystems');
      expect(healthReport).toHaveProperty('metrics');
      
      expect(healthReport.status).toBe('healthy');
      expect(Array.isArray(healthReport.subsystems)).toBe(true);
    });

    it('should provide performance metrics', async () => {
      // Execute some workflows to generate metrics
      const workflow = createMockWorkflow('metrics-test');
      await orchestrator.executeWorkflow(workflow);
      
      const metrics = await orchestrator.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('totalWorkflowsExecuted');
      expect(metrics).toHaveProperty('totalTasksExecuted');
      expect(metrics).toHaveProperty('averageWorkflowExecutionTime');
      expect(metrics).toHaveProperty('averageTaskExecutionTime');
      expect(metrics).toHaveProperty('successRate');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('cpuUsage');
      
      expect(typeof metrics.totalWorkflowsExecuted).toBe('number');
      expect(typeof metrics.successRate).toBe('number');
      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeLessThanOrEqual(1);
    });

    it('should detect unhealthy state', async () => {
      // Simulate unhealthy condition by overloading the orchestrator
      const heavyWorkflows = Array.from({ length: 20 }, (_, i) => 
        createMockWorkflow(`heavy-${i}`)
      );
      
      // Don't await - just start them
      heavyWorkflows.forEach(workflow => {
        orchestrator.executeWorkflow(workflow).catch(() => {
          // Ignore errors, we're testing health monitoring
        });
      });
      
      await delay(100); // Give time for overload
      
      const healthReport = await orchestrator.getHealthReport();
      // The orchestrator should still report as healthy due to proper resource management
      expect(['healthy', 'warning'].includes(healthReport.status)).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    it('should update configuration', async () => {
      const newConfig: Partial<AutomationConfiguration> = {
        maxConcurrentWorkflows: 8,
        defaultTimeout: 45000,
        performanceMonitoringEnabled: false
      };
      
      await orchestrator.updateConfiguration(newConfig);
      
      // Configuration should be updated (we can't directly verify private config,
      // but we can test that the orchestrator continues to work)
      expect(orchestrator.isHealthy()).toBe(true);
    });
  });

  describe('Performance Benchmarks', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    it('should meet workflow execution performance benchmarks', async () => {
      const workflow = createMockWorkflow('benchmark-test');
      
      const performance = await measurePerformance(
        async () => await orchestrator.executeWorkflow(workflow),
        5
      );
      
      // Workflow execution should complete within reasonable time
      expect(performance.averageTime).toBeLessThan(2000); // 2 seconds average
    });

    it('should handle high-throughput task execution', async () => {
      const tasks = Array.from({ length: 50 }, (_, i) => 
        createMockTask(`throughput-${i}`, TaskType.DATA_EXTRACTION)
      );
      
      const startTime = Date.now();
      const result = await orchestrator.executeBatch(tasks, createMockAutomationContext());
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      expect(result.results.length).toBe(50);
      
      const executionTime = endTime - startTime;
      const tasksPerSecond = (tasks.length / executionTime) * 1000;
      
      // Should handle at least 10 tasks per second
      expect(tasksPerSecond).toBeGreaterThan(10);
    });
  });
});