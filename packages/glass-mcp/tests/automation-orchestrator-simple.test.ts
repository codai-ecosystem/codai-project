/**
 * Glass MCP v7.0 - Automation Orchestrator Simple Test Suite
 * 
 * Focused tests for the main automation orchestration engine.
 */

import { AdvancedAutomationOrchestrator } from '../src/automation/automation-orchestrator';
import {
  AutomationConfiguration,
} from '../src/automation/automation-types';
import { createMockAutomationContext, createMockWorkflow } from './setup';

describe('AdvancedAutomationOrchestrator - Simple Tests', () => {
  let orchestrator: AdvancedAutomationOrchestrator;
  let mockConfig: AutomationConfiguration;

  beforeEach(() => {
    mockConfig = {
      maxConcurrentWorkflows: 5,
      maxConcurrentTasks: 10,
      defaultTimeout: 30000,
      defaultRetryCount: 3,
      providers: {
        'ai_intelligence': {
          enabled: true,
          settings: {},
          timeout: 30000,
          retryCount: 3
        }
      },
      performanceSettings: {
        enableCaching: true,
        cacheSize: 100,
        enableOptimizations: true,
        maxResourceUsage: {
          maxCpuUsage: 0.8,
          maxMemoryUsage: 1024,
          maxDiskUsage: 500
        }
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
      await orchestrator.initialize();
      expect(orchestrator.isHealthy()).toBe(true);
    });
  });

  describe('Workflow Management', () => {
    beforeEach(async () => {
      await orchestrator.initialize();
    });

    it('should execute workflow successfully', async () => {
      const workflow = createMockWorkflow('test-workflow-1');
      const context = createMockAutomationContext();
      
      const result = await orchestrator.executeWorkflow(workflow, context);
      
      expect(result).toHaveProperty('workflowId', workflow.id);
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('taskResults');
      expect(result.taskResults.length).toBe(workflow.tasks.length);
    });
  });
});