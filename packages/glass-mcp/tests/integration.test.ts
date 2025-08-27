/**
 * Glass MCP v7.0 - Integration Test Suite
 * 
 * End-to-end integration tests for the complete Glass MCP system.
 * Tests all phases and components working together.
 * 
 * @version 7.0.0-alpha.1
 * @since 2025-08-26
 */

import { AdvancedAutomationOrchestrator } from '../src/automation/automation-orchestrator';
import {
  AutomationWorkflow,
  AutomationTask,
  AutomationContext,
  TaskType,
  WorkflowPriority,
  TaskPriority,
  AutomationConfiguration,
  ExecutionMode
} from '../src/automation/automation-types';

import { IntelligenceProviderFactory } from '../src/automation/intelligence-adapters';
import { createMockAutomationContext, delay, measurePerformance } from './setup';

describe('Glass MCP v7.0 Integration Tests', () => {
  let orchestrator: AdvancedAutomationOrchestrator;
  let config: AutomationConfiguration;

  beforeAll(async () => {
    // Create production-like configuration
    config = {
      maxConcurrentWorkflows: 3,
      maxConcurrentTasks: 8,
      defaultTimeout: 30000,
      defaultRetryCount: 2,
      providers: {
        automation: {
          enabled: true,
          settings: { enableAdvancedFeatures: true },
          timeout: 10000,
          retryCount: 2
        }
      },
      performanceSettings: {
        enableCaching: true,
        cacheSize: 1000,
        enableOptimizations: true,
        monitoringInterval: 5000,
        performanceThreshold: 0.8,
        alertingEnabled: true
      }
    };

    orchestrator = new AdvancedAutomationOrchestrator(config);
    await orchestrator.initialize();
  });

  afterAll(async () => {
    if (orchestrator) {
      await orchestrator.shutdown();
    }
  });

  describe('Complete System Integration', () => {
    it('should integrate all Glass MCP components successfully', async () => {
      // Create intelligence stack
      const intelligenceStack = await IntelligenceProviderFactory.createIntelligenceStack();
      
      expect(intelligenceStack.contextAnalyzer).toBeDefined();
      expect(intelligenceStack.decisionEngine).toBeDefined();
      expect(intelligenceStack.learningSystem).toBeDefined();
      
      // Test intelligence components
      const mockContext = createMockAutomationContext();
      
      const analysisResult = await intelligenceStack.contextAnalyzer.analyzeContext(mockContext);
      expect(analysisResult.confidence).toBeGreaterThan(0);
      
      const decisionResult = await intelligenceStack.decisionEngine.makeDecision(
        mockContext, 
        ['option1', 'option2', 'option3']
      );
      expect(decisionResult.confidence).toBeGreaterThan(0);
      
      const learningFeedback = await intelligenceStack.learningSystem.learn({
        success: true,
        performance: 0.85,
        context: mockContext
      });
      expect(learningFeedback.success).toBe(true);
    });

    it('should execute complete automation workflow with all phases', async () => {
      const comprehensiveWorkflow: AutomationWorkflow = {
        id: 'comprehensive-integration-test',
        name: 'Complete Glass MCP Integration Workflow',
        description: 'Tests all phases of Glass MCP working together',
        priority: WorkflowPriority.HIGH,
        executionMode: ExecutionMode.SEQUENTIAL,
        tasks: [
          // Phase 1: Screen Vision (simulated)
          {
            id: 'screen-capture-task',
            name: 'Capture Screen Region',
            type: TaskType.SCREEN_CAPTURE,
            priority: TaskPriority.HIGH,
            parameters: {
              region: { x: 0, y: 0, width: 1920, height: 1080 },
              format: 'PNG'
            },
            timeout: 5000,
            retryAttempts: 2
          },
          
          // Phase 2: AI Intelligence Analysis
          {
            id: 'ai-analysis-task',
            name: 'AI Context Analysis',
            type: TaskType.AI_ANALYSIS,
            priority: TaskPriority.HIGH,
            parameters: {
              analysisType: 'context_understanding',
              enableLearning: true
            },
            timeout: 8000,
            retryAttempts: 2,
            dependencies: ['screen-capture-task']
          },
          
          // Phase 3: Drawing Intelligence (simulated)
          {
            id: 'shape-recognition-task',
            name: 'Shape Recognition and Path Optimization',
            type: TaskType.DRAWING_OPERATION,
            priority: TaskPriority.NORMAL,
            parameters: {
              operation: 'shape_recognition',
              optimization: 'path_smoothing',
              mlInference: true
            },
            timeout: 6000,
            retryAttempts: 1,
            dependencies: ['ai-analysis-task']
          },
          
          // Phase 4: Advanced Automation
          {
            id: 'ui-automation-task',
            name: 'UI Interaction Automation',
            type: TaskType.UI_INTERACTION,
            priority: TaskPriority.HIGH,
            parameters: {
              action: 'click',
              target: 'button[data-automation="submit"]',
              waitForElement: true
            },
            timeout: 10000,
            retryAttempts: 3,
            dependencies: ['shape-recognition-task']
          },
          
          // Validation and feedback
          {
            id: 'validation-task',
            name: 'Workflow Validation',
            type: TaskType.VALIDATION,
            priority: TaskPriority.HIGH,
            parameters: {
              validationType: 'workflow_completion',
              successCriteria: ['all_tasks_completed', 'performance_threshold_met']
            },
            timeout: 3000,
            retryAttempts: 1,
            dependencies: ['ui-automation-task']
          }
        ],
        context: createMockAutomationContext(),
        metadata: {
          version: '1.0',
          author: 'integration-test-suite',
          tags: ['integration', 'full-workflow', 'all-phases'],
          testScenario: 'complete-system-integration'
        }
      };

      const startTime = Date.now();
      const result = await orchestrator.executeWorkflow(comprehensiveWorkflow, comprehensiveWorkflow.context);
      const executionTime = Date.now() - startTime;

      // Validate workflow execution
      expect(result.workflowId).toBe(comprehensiveWorkflow.id);
      expect(result.status).toBe('completed');
      expect(result.taskResults.length).toBe(comprehensiveWorkflow.tasks.length);

      // Validate performance
      expect(executionTime).toBeLessThan(60000); // Should complete within 1 minute

      // Validate all tasks were processed
      const taskIds = result.taskResults.map(tr => tr.taskId);
      comprehensiveWorkflow.tasks.forEach(task => {
        expect(taskIds).toContain(task.id);
      });

      // Validate task dependencies were respected
      const screenCaptureResult = result.taskResults.find(tr => tr.taskId === 'screen-capture-task');
      const aiAnalysisResult = result.taskResults.find(tr => tr.taskId === 'ai-analysis-task');
      expect(screenCaptureResult?.startTime.getTime()).toBeLessThan(aiAnalysisResult?.startTime.getTime() || 0);
    });

    it('should handle complex parallel workflows', async () => {
      const parallelWorkflows = [
        createTestWorkflow('parallel-1', WorkflowPriority.HIGH),
        createTestWorkflow('parallel-2', WorkflowPriority.NORMAL),
        createTestWorkflow('parallel-3', WorkflowPriority.LOW)
      ];

      const startTime = Date.now();
      const results = await Promise.all(
        parallelWorkflows.map(workflow => 
          orchestrator.executeWorkflow(workflow, workflow.context)
        )
      );
      const executionTime = Date.now() - startTime;

      // Validate all workflows completed
      expect(results.length).toBe(3);
      results.forEach((result, index) => {
        expect(result.workflowId).toBe(parallelWorkflows[index].id);
        expect(result.status).toBe('completed');
      });

      // Parallel execution should be efficient
      expect(executionTime).toBeLessThan(20000); // Less than 20 seconds for all three
    });

    it('should maintain system health under load', async () => {
      // Get initial health report
      const initialHealth = await orchestrator.getSystemHealth();
      expect(initialHealth.overall).toBe('healthy');

      // Create multiple concurrent workflows to stress test
      const loadTestWorkflows = Array.from({ length: 10 }, (_, i) => 
        createTestWorkflow(`load-test-${i}`, WorkflowPriority.NORMAL)
      );

      const loadTestPromises = loadTestWorkflows.map(workflow =>
        orchestrator.executeWorkflow(workflow, workflow.context)
      );

      // Execute under load
      const results = await Promise.all(loadTestPromises);

      // Validate all workflows completed successfully
      results.forEach(result => {
        expect(result.status).toBe('completed');
      });

      // Check final health status
      const finalHealth = await orchestrator.getSystemHealth();
      expect(['healthy', 'degraded'].includes(finalHealth.overall)).toBe(true);

      // Get performance metrics
      const metrics = await orchestrator.getPerformanceMetrics();
      expect(metrics.totalWorkflowsExecuted).toBeGreaterThan(10);
      expect(metrics.successfulWorkflows).toBeGreaterThan(8); // At least 80% success rate
    });

    it('should demonstrate end-to-end automation capabilities', async () => {
      // Create a realistic automation scenario
      const realisticWorkflow: AutomationWorkflow = {
        id: 'realistic-automation-scenario',
        name: 'Document Processing Automation',
        description: 'Complete document processing with OCR, analysis, and data extraction',
        priority: WorkflowPriority.HIGH,
        executionMode: ExecutionMode.SEQUENTIAL,
        tasks: [
          {
            id: 'document-capture',
            name: 'Capture Document Screen',
            type: TaskType.SCREEN_CAPTURE,
            priority: TaskPriority.HIGH,
            parameters: {
              documentRegion: true,
              enhanceQuality: true,
              preprocessForOCR: true
            },
            timeout: 8000,
            retryAttempts: 2
          },
          {
            id: 'ocr-extraction',
            name: 'Extract Text with OCR',
            type: TaskType.OCR_EXTRACTION,
            priority: TaskPriority.HIGH,
            parameters: {
              language: 'eng',
              outputFormat: 'structured',
              confidenceThreshold: 0.8
            },
            timeout: 15000,
            retryAttempts: 2,
            dependencies: ['document-capture']
          },
          {
            id: 'ai-content-analysis',
            name: 'AI-Powered Content Analysis',
            type: TaskType.AI_ANALYSIS,
            priority: TaskPriority.HIGH,
            parameters: {
              analysisTypes: ['sentiment', 'classification', 'entity_extraction'],
              confidence: 0.85,
              contextWindow: 4096
            },
            timeout: 12000,
            retryAttempts: 2,
            dependencies: ['ocr-extraction']
          },
          {
            id: 'data-transformation',
            name: 'Transform and Structure Data',
            type: TaskType.DATA_TRANSFORMATION,
            priority: TaskPriority.NORMAL,
            parameters: {
              outputFormat: 'json',
              schema: 'document_analysis_v1',
              validation: true
            },
            timeout: 5000,
            retryAttempts: 1,
            dependencies: ['ai-content-analysis']
          },
          {
            id: 'final-validation',
            name: 'Validate Processing Results',
            type: TaskType.VALIDATION,
            priority: TaskPriority.HIGH,
            parameters: {
              validationRules: ['data_completeness', 'quality_threshold', 'format_compliance'],
              requireAllPassed: true
            },
            timeout: 3000,
            retryAttempts: 1,
            dependencies: ['data-transformation']
          }
        ],
        context: createMockAutomationContext(),
        metadata: {
          version: '2.0',
          author: 'glass-mcp-integration',
          tags: ['document-processing', 'ocr', 'ai-analysis', 'realistic-scenario'],
          businessProcess: 'document_automation'
        }
      };

      const result = await orchestrator.executeWorkflow(realisticWorkflow, realisticWorkflow.context);

      // Comprehensive validation
      expect(result.status).toBe('completed');
      expect(result.taskResults.length).toBe(5);
      expect(result.duration).toBeDefined();
      expect(result.duration).toBeLessThan(60000); // Complete within 1 minute

      // Validate task completion order
      const taskCompletionTimes = result.taskResults.map(tr => ({
        id: tr.taskId,
        time: tr.startTime
      })).sort((a, b) => a.time.getTime() - b.time.getTime());

      expect(taskCompletionTimes[0].id).toBe('document-capture');
      expect(taskCompletionTimes[4].id).toBe('final-validation');
    });
  });

  describe('Performance and Scalability', () => {
    it('should meet performance benchmarks', async () => {
      const benchmarkWorkflow = createTestWorkflow('performance-benchmark', WorkflowPriority.HIGH);
      
      const performance = await measurePerformance(
        async () => await orchestrator.executeWorkflow(benchmarkWorkflow, benchmarkWorkflow.context),
        5
      );

      // Performance assertions
      expect(performance.averageTime).toBeLessThan(5000); // Average under 5 seconds
      expect(performance.totalTime).toBeLessThan(30000); // Total under 30 seconds

      console.log(`📊 Performance Benchmark Results:`);
      console.log(`  Average execution time: ${performance.averageTime.toFixed(2)}ms`);
      console.log(`  Total time for ${performance.iterations} runs: ${performance.totalTime.toFixed(2)}ms`);
    });

    it('should scale with increased concurrent operations', async () => {
      const scalabilityTests = [
        { concurrency: 2, name: 'Low Load' },
        { concurrency: 5, name: 'Medium Load' },
        { concurrency: 8, name: 'High Load' }
      ];

      const results = [];

      for (const test of scalabilityTests) {
        const workflows = Array.from({ length: test.concurrency }, (_, i) => 
          createTestWorkflow(`scalability-${test.name.toLowerCase().replace(' ', '-')}-${i}`, WorkflowPriority.NORMAL)
        );

        const startTime = Date.now();
        const workflowResults = await Promise.all(
          workflows.map(workflow => 
            orchestrator.executeWorkflow(workflow, workflow.context)
          )
        );
        const endTime = Date.now();

        const successCount = workflowResults.filter(r => r.status === 'completed').length;
        const successRate = successCount / test.concurrency;
        const averageTime = (endTime - startTime) / test.concurrency;

        results.push({
          ...test,
          successRate,
          averageTime,
          totalTime: endTime - startTime
        });

        expect(successRate).toBeGreaterThan(0.8); // At least 80% success rate
      }

      console.log(`📈 Scalability Test Results:`);
      results.forEach(result => {
        console.log(`  ${result.name}: ${(result.successRate * 100).toFixed(1)}% success, ${result.averageTime.toFixed(2)}ms avg`);
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle and recover from failures gracefully', async () => {
      const failingWorkflow: AutomationWorkflow = {
        id: 'failure-recovery-test',
        name: 'Failure Recovery Test',
        description: 'Tests system recovery from failures',
        priority: WorkflowPriority.NORMAL,
        executionMode: ExecutionMode.SEQUENTIAL,
        tasks: [
          {
            id: 'success-task-1',
            name: 'Successful Task 1',
            type: TaskType.VALIDATION,
            priority: TaskPriority.NORMAL,
            parameters: { validate: true },
            timeout: 2000,
            retryAttempts: 1
          },
          {
            id: 'failing-task',
            name: 'Intentionally Failing Task',
            type: TaskType.CUSTOM,
            priority: TaskPriority.HIGH,
            parameters: { simulateFailure: true },
            timeout: 1000,
            retryAttempts: 2,
            dependencies: ['success-task-1']
          },
          {
            id: 'recovery-task',
            name: 'Recovery Task',
            type: TaskType.VALIDATION,
            priority: TaskPriority.HIGH,
            parameters: { validateRecovery: true },
            timeout: 2000,
            retryAttempts: 1,
            dependencies: ['failing-task']
          }
        ],
        context: createMockAutomationContext(),
        metadata: {
          version: '1.0',
          author: 'error-handling-test',
          tags: ['error-handling', 'recovery', 'resilience']
        }
      };

      const result = await orchestrator.executeWorkflow(failingWorkflow, failingWorkflow.context);

      // System should handle failures gracefully
      expect(result).toBeDefined();
      expect(result.workflowId).toBe(failingWorkflow.id);
      
      // Check that system remains healthy despite failures
      const healthReport = await orchestrator.getSystemHealth();
      expect(['healthy', 'degraded'].includes(healthReport.overall)).toBe(true);
    });
  });
});

// Helper function to create test workflows
function createTestWorkflow(id: string, priority: WorkflowPriority): AutomationWorkflow {
  return {
    id,
    name: `Test Workflow ${id}`,
    description: 'Generated test workflow for integration testing',
    priority,
    executionMode: ExecutionMode.SEQUENTIAL,
    tasks: [
      {
        id: `${id}-task-1`,
        name: 'Initial Task',
        type: TaskType.VALIDATION,
        priority: TaskPriority.NORMAL,
        parameters: { test: true, phase: 'initial' },
        timeout: 3000,
        retryAttempts: 1
      },
      {
        id: `${id}-task-2`,
        name: 'Processing Task',
        type: TaskType.AI_ANALYSIS,
        priority: TaskPriority.HIGH,
        parameters: { test: true, phase: 'processing' },
        timeout: 5000,
        retryAttempts: 2,
        dependencies: [`${id}-task-1`]
      },
      {
        id: `${id}-task-3`,
        name: 'Completion Task',
        type: TaskType.NOTIFICATION,
        priority: TaskPriority.LOW,
        parameters: { test: true, phase: 'completion' },
        timeout: 2000,
        retryAttempts: 1,
        dependencies: [`${id}-task-2`]
      }
    ],
    context: createMockAutomationContext(),
    metadata: {
      version: '1.0',
      author: 'integration-test',
      tags: ['test', 'integration', 'generated']
    }
  };
}