/**
 * CODAI Project Orchestration - Workflow Utilities
 * Utilities for creating, validating, and optimizing workflows
 */

import { WorkflowDefinition } from '../types.js';

/**
 * Workflow templates for common use cases
 */
export const WORKFLOW_TEMPLATES = {
  'simple-deployment': {
    id: 'simple-deployment',
    name: 'Simple Deployment Workflow',
    description: 'Basic deployment workflow for single service',
    tasks: [
      {
        id: 'build',
        name: 'Build Service',
        type: 'build',
        dependencies: [],
        timeout: 600000,
        retryAttempts: 2,
        parameters: {
          buildCommand: 'npm run build',
          dockerImage: true,
        },
      },
      {
        id: 'test',
        name: 'Run Tests',
        type: 'test',
        dependencies: ['build'],
        timeout: 300000,
        retryAttempts: 3,
        parameters: {
          testCommand: 'npm test',
          coverage: true,
        },
      },
      {
        id: 'deploy',
        name: 'Deploy Service',
        type: 'deploy',
        dependencies: ['test'],
        timeout: 900000,
        retryAttempts: 1,
        parameters: {
          environment: 'production',
          healthCheck: true,
        },
      },
    ],
    triggers: [
      {
        id: 'git-push',
        type: 'git',
        event: 'push',
        branch: 'main',
      },
    ],
    metadata: {
      category: 'deployment',
      complexity: 'simple',
      estimatedDuration: 1800000, // 30 minutes
    },
  },

  'microservices-deployment': {
    id: 'microservices-deployment',
    name: 'Microservices Deployment Workflow',
    description: 'Complex deployment workflow for multiple microservices',
    tasks: [
      {
        id: 'dependency-analysis',
        name: 'Analyze Dependencies',
        type: 'analysis',
        dependencies: [],
        timeout: 300000,
        retryAttempts: 2,
        parameters: {
          analysisType: 'dependency',
          depth: 5,
        },
      },
      {
        id: 'build-services',
        name: 'Build All Services',
        type: 'parallel_build',
        dependencies: ['dependency-analysis'],
        timeout: 1200000,
        retryAttempts: 2,
        parameters: {
          services: ['api', 'web', 'worker'],
          buildCommand: 'npm run build',
          parallel: true,
        },
      },
      {
        id: 'integration-tests',
        name: 'Integration Tests',
        type: 'test',
        dependencies: ['build-services'],
        timeout: 600000,
        retryAttempts: 2,
        parameters: {
          testType: 'integration',
          testCommand: 'npm run test:integration',
        },
      },
      {
        id: 'deploy-database',
        name: 'Deploy Database Changes',
        type: 'database_deploy',
        dependencies: ['integration-tests'],
        timeout: 900000,
        retryAttempts: 1,
        parameters: {
          migrationCommand: 'npm run migrate',
          rollbackSupport: true,
        },
      },
      {
        id: 'deploy-services',
        name: 'Deploy Services',
        type: 'service_deploy',
        dependencies: ['deploy-database'],
        timeout: 1800000,
        retryAttempts: 1,
        parameters: {
          deploymentStrategy: 'rolling',
          services: ['api', 'web', 'worker'],
          healthCheck: true,
        },
      },
      {
        id: 'smoke-tests',
        name: 'Smoke Tests',
        type: 'test',
        dependencies: ['deploy-services'],
        timeout: 300000,
        retryAttempts: 3,
        parameters: {
          testType: 'smoke',
          testCommand: 'npm run test:smoke',
        },
      },
    ],
    triggers: [
      {
        id: 'git-push-main',
        type: 'git',
        event: 'push',
        branch: 'main',
      },
      {
        id: 'scheduled',
        type: 'schedule',
        schedule: '0 2 * * *', // Daily at 2 AM
      },
    ],
    metadata: {
      category: 'deployment',
      complexity: 'complex',
      estimatedDuration: 3600000, // 60 minutes
    },
  },

  'ci-cd-pipeline': {
    id: 'ci-cd-pipeline',
    name: 'Complete CI/CD Pipeline',
    description: 'Full CI/CD pipeline with quality gates',
    tasks: [
      {
        id: 'checkout',
        name: 'Checkout Code',
        type: 'git',
        dependencies: [],
        timeout: 60000,
        retryAttempts: 3,
        parameters: {
          repository: 'main',
          branch: 'auto',
        },
      },
      {
        id: 'security-scan',
        name: 'Security Scan',
        type: 'security',
        dependencies: ['checkout'],
        timeout: 600000,
        retryAttempts: 1,
        parameters: {
          scanType: 'comprehensive',
          failOnHigh: true,
        },
      },
      {
        id: 'code-quality',
        name: 'Code Quality Analysis',
        type: 'quality',
        dependencies: ['checkout'],
        timeout: 300000,
        retryAttempts: 2,
        parameters: {
          linting: true,
          typeChecking: true,
          codeComplexity: true,
        },
      },
      {
        id: 'unit-tests',
        name: 'Unit Tests',
        type: 'test',
        dependencies: ['code-quality'],
        timeout: 600000,
        retryAttempts: 2,
        parameters: {
          testType: 'unit',
          coverage: true,
          minCoverage: 80,
        },
      },
      {
        id: 'build-artifacts',
        name: 'Build Artifacts',
        type: 'build',
        dependencies: ['unit-tests', 'security-scan'],
        timeout: 900000,
        retryAttempts: 2,
        parameters: {
          buildType: 'production',
          optimization: true,
          artifacts: ['docker', 'static'],
        },
      },
      {
        id: 'deploy-staging',
        name: 'Deploy to Staging',
        type: 'deploy',
        dependencies: ['build-artifacts'],
        timeout: 1200000,
        retryAttempts: 1,
        parameters: {
          environment: 'staging',
          deploymentStrategy: 'blue-green',
        },
      },
      {
        id: 'e2e-tests',
        name: 'End-to-End Tests',
        type: 'test',
        dependencies: ['deploy-staging'],
        timeout: 1800000,
        retryAttempts: 2,
        parameters: {
          testType: 'e2e',
          browser: 'chromium',
          parallel: true,
        },
      },
      {
        id: 'performance-tests',
        name: 'Performance Tests',
        type: 'test',
        dependencies: ['deploy-staging'],
        timeout: 1800000,
        retryAttempts: 1,
        parameters: {
          testType: 'performance',
          loadTest: true,
          thresholds: {
            responseTime: 200,
            throughput: 1000,
          },
        },
      },
      {
        id: 'deploy-production',
        name: 'Deploy to Production',
        type: 'deploy',
        dependencies: ['e2e-tests', 'performance-tests'],
        timeout: 2400000,
        retryAttempts: 1,
        parameters: {
          environment: 'production',
          deploymentStrategy: 'canary',
          approvalRequired: true,
        },
      },
    ],
    triggers: [
      {
        id: 'pr-merge',
        type: 'git',
        event: 'merge',
        branch: 'main',
      },
    ],
    metadata: {
      category: 'ci-cd',
      complexity: 'enterprise',
      estimatedDuration: 5400000, // 90 minutes
    },
  },
} as const;

/**
 * Create workflow from template
 */
export function createWorkflowFromTemplate(
  templateId: keyof typeof WORKFLOW_TEMPLATES,
  overrides?: Partial<WorkflowDefinition>
): WorkflowDefinition {
  const template = WORKFLOW_TEMPLATES[templateId];

  const workflow: WorkflowDefinition = {
    id: `${template.id}-${Date.now()}`,
    name: template.name,
    description: template.description,
    version: '1.0.0',
    tasks: template.tasks.map(task => ({
      ...task,
      id: `${task.id}-${Date.now()}`,
    })),
    triggers: template.triggers,
    variables: {},
    conditions: [],
    metadata: {
      ...template.metadata,
      createdAt: new Date(),
      template: templateId,
    },
  };

  if (overrides) {
    return { ...workflow, ...overrides };
  }

  return workflow;
}

/**
 * Validate workflow definition
 */
export function validateWorkflow(workflow: WorkflowDefinition): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Validate required fields
  if (!workflow.id) {
    errors.push('Workflow ID is required');
  }
  if (!workflow.name) {
    errors.push('Workflow name is required');
  }
  if (!workflow.tasks || workflow.tasks.length === 0) {
    errors.push('Workflow must have at least one task');
  }

  // Validate tasks
  const taskIds = new Set<string>();
  for (const task of workflow.tasks) {
    // Check for duplicate task IDs
    if (taskIds.has(task.id)) {
      errors.push(`Duplicate task ID: ${task.id}`);
    }
    taskIds.add(task.id);

    // Validate task dependencies
    for (const dep of task.dependencies) {
      if (!taskIds.has(dep) && !workflow.tasks.some(t => t.id === dep)) {
        errors.push(`Task ${task.id} depends on non-existent task: ${dep}`);
      }
    }

    // Validate task timeout
    if (task.timeout && task.timeout < 10000) {
      warnings.push(`Task ${task.id} has very short timeout (${task.timeout}ms)`);
    }

    // Validate retry attempts
    if (task.retryAttempts > 5) {
      warnings.push(`Task ${task.id} has excessive retry attempts (${task.retryAttempts})`);
    }
  }

  // Check for circular dependencies
  const circularDependencies = detectCircularDependencies(workflow.tasks);
  if (circularDependencies.length > 0) {
    errors.push(`Circular dependencies detected: ${circularDependencies.join(', ')}`);
  }

  // Check for unreachable tasks
  const unreachableTasks = findUnreachableTasks(workflow.tasks);
  if (unreachableTasks.length > 0) {
    warnings.push(`Unreachable tasks found: ${unreachableTasks.join(', ')}`);
  }

  // Validate triggers
  if (!workflow.triggers || workflow.triggers.length === 0) {
    warnings.push('Workflow has no triggers defined');
  }

  // Generate suggestions
  if (workflow.tasks.length > 20) {
    suggestions.push('Consider breaking down this workflow into smaller, more manageable workflows');
  }

  const maxDepth = calculateWorkflowDepth(workflow.tasks);
  if (maxDepth > 10) {
    suggestions.push('Workflow has deep dependency chains, consider parallelizing some tasks');
  }

  if (!workflow.metadata?.estimatedDuration) {
    suggestions.push('Consider adding estimated duration to workflow metadata');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Optimize workflow for performance
 */
export function optimizeWorkflow(workflow: WorkflowDefinition): {
  optimizedWorkflow: WorkflowDefinition;
  optimizations: WorkflowOptimization[];
  estimatedImprovements: {
    timeReduction: number; // percentage
    resourceEfficiency: number; // percentage
    parallelizationGain: number; // percentage
  };
} {
  const optimizedWorkflow = JSON.parse(JSON.stringify(workflow)) as WorkflowDefinition;
  const optimizations: WorkflowOptimization[] = [];

  // Optimize task parallelization
  const parallelizationOpportunities = findParallelizationOpportunities(workflow.tasks);
  for (const opportunity of parallelizationOpportunities) {
    optimizations.push({
      type: 'parallelization',
      description: `Tasks ${opportunity.tasks.join(', ')} can run in parallel`,
      impact: 'high',
      implementation: 'Remove unnecessary dependencies between independent tasks',
      estimatedGain: opportunity.estimatedTimeReduction
    });
  }

  // Optimize resource usage
  const resourceOptimizations = analyzeResourceUsage(workflow.tasks);
  for (const optimization of resourceOptimizations) {
    optimizations.push(optimization);
  }

  // Optimize retry strategies
  for (const task of optimizedWorkflow.tasks) {
    if (task.retryAttempts > 3 && task.type !== 'deploy') {
      const originalRetries = task.retryAttempts;
      task.retryAttempts = 3;
      optimizations.push({
        type: 'retry_optimization',
        description: `Reduced retry attempts for task ${task.id} from ${originalRetries} to 3`,
        impact: 'medium',
        implementation: 'Use more appropriate retry strategy',
        estimatedGain: 15
      });
    }
  }

  // Optimize timeouts
  for (const task of optimizedWorkflow.tasks) {
    if (task.timeout && task.timeout > 3600000 && task.type !== 'deploy') { // 1 hour
      const originalTimeout = task.timeout;
      task.timeout = Math.min(1800000, task.timeout); // 30 minutes max
      optimizations.push({
        type: 'timeout_optimization',
        description: `Reduced timeout for task ${task.id} from ${originalTimeout}ms to ${task.timeout}ms`,
        impact: 'low',
        implementation: 'Use more appropriate timeout value',
        estimatedGain: 5
      });
    }
  }

  // Calculate estimated improvements
  const estimatedImprovements = calculateEstimatedImprovements(optimizations);

  return {
    optimizedWorkflow,
    optimizations,
    estimatedImprovements
  };
}

/**
 * Generate workflow report
 */
export function generateWorkflowReport(workflow: WorkflowDefinition): {
  summary: WorkflowSummary;
  analysis: WorkflowAnalysis;
  performance: WorkflowPerformanceAnalysis;
  recommendations: WorkflowRecommendation[];
} {
  const validation = validateWorkflow(workflow);
  const optimization = optimizeWorkflow(workflow);

  const summary: WorkflowSummary = {
    id: workflow.id,
    name: workflow.name,
    taskCount: workflow.tasks.length,
    complexity: calculateWorkflowComplexity(workflow),
    estimatedDuration: workflow.metadata?.estimatedDuration || calculateEstimatedDuration(workflow.tasks),
    isValid: validation.isValid,
    errorCount: validation.errors.length,
    warningCount: validation.warnings.length,
  };

  const analysis: WorkflowAnalysis = {
    dependencyDepth: calculateWorkflowDepth(workflow.tasks),
    parallelizationScore: calculateParallelizationScore(workflow.tasks),
    resourceEfficiency: calculateResourceEfficiency(workflow.tasks),
    criticalPath: findCriticalPath(workflow.tasks),
    bottlenecks: findBottlenecks(workflow.tasks),
    riskFactors: identifyRiskFactors(workflow),
  };

  const performance: WorkflowPerformanceAnalysis = {
    throughput: calculateWorkflowThroughput(workflow.tasks),
    resourceUtilization: analyzeResourceUtilization(workflow.tasks),
    failurePoints: identifyFailurePoints(workflow.tasks),
    optimizationOpportunities: optimization.optimizations.length,
    estimatedImprovements: optimization.estimatedImprovements,
  };

  const recommendations: WorkflowRecommendation[] = [
    ...validation.suggestions.map(suggestion => ({
      type: 'structure' as const,
      priority: 'medium' as const,
      title: 'Workflow Structure',
      description: suggestion,
      implementation: 'Review workflow structure and dependencies',
      expectedBenefit: 'Improved maintainability and reliability'
    })),
    ...optimization.optimizations.map(opt => ({
      type: 'performance' as const,
      priority: opt.impact === 'high' ? 'high' as const : 'medium' as const,
      title: opt.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: opt.description,
      implementation: opt.implementation,
      expectedBenefit: `${opt.estimatedGain}% improvement`
    }))
  ];

  return {
    summary,
    analysis,
    performance,
    recommendations
  };
}

// Helper functions

function detectCircularDependencies(tasks: any[]): string[] {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[] = [];

  function dfs(taskId: string, path: string[]): void {
    if (recursionStack.has(taskId)) {
      const cycleStart = path.indexOf(taskId);
      cycles.push(path.slice(cycleStart).join(' -> ') + ' -> ' + taskId);
      return;
    }

    if (visited.has(taskId)) return;

    visited.add(taskId);
    recursionStack.add(taskId);

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      for (const dep of task.dependencies) {
        dfs(dep, [...path, taskId]);
      }
    }

    recursionStack.delete(taskId);
  }

  for (const task of tasks) {
    if (!visited.has(task.id)) {
      dfs(task.id, []);
    }
  }

  return cycles;
}

function findUnreachableTasks(tasks: any[]): string[] {
  const reachable = new Set<string>();
  const taskMap = new Map(tasks.map(t => [t.id, t]));

  // Find root tasks (no dependencies)
  const rootTasks = tasks.filter(t => t.dependencies.length === 0);

  function markReachable(taskId: string): void {
    if (reachable.has(taskId)) return;
    reachable.add(taskId);

    // Mark all tasks that depend on this task
    for (const task of tasks) {
      if (task.dependencies.includes(taskId)) {
        markReachable(task.id);
      }
    }
  }

  // Mark all reachable tasks starting from root tasks
  for (const rootTask of rootTasks) {
    markReachable(rootTask.id);
  }

  // Return tasks that are not reachable
  return tasks.filter(t => !reachable.has(t.id)).map(t => t.id);
}

function calculateWorkflowDepth(tasks: any[]): number {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const depths = new Map<string, number>();

  function calculateDepth(taskId: string): number {
    if (depths.has(taskId)) return depths.get(taskId)!;

    const task = taskMap.get(taskId);
    if (!task || task.dependencies.length === 0) {
      depths.set(taskId, 0);
      return 0;
    }

    const maxDepth = Math.max(...task.dependencies.map(dep => calculateDepth(dep) + 1));
    depths.set(taskId, maxDepth);
    return maxDepth;
  }

  let maxDepth = 0;
  for (const task of tasks) {
    maxDepth = Math.max(maxDepth, calculateDepth(task.id));
  }

  return maxDepth;
}

function findParallelizationOpportunities(tasks: any[]): ParallelizationOpportunity[] {
  const opportunities: ParallelizationOpportunity[] = [];

  // Group tasks by dependency level
  const levels = groupTasksByLevel(tasks);

  for (const level of levels) {
    if (level.length > 1) {
      // Check if tasks in the same level can be parallelized
      const independentGroups = findIndependentGroups(level, tasks);
      for (const group of independentGroups) {
        if (group.length > 1) {
          opportunities.push({
            tasks: group.map(t => t.id),
            estimatedTimeReduction: calculateTimeReduction(group),
            complexity: 'low'
          });
        }
      }
    }
  }

  return opportunities;
}

function groupTasksByLevel(tasks: any[]): any[][] {
  const levels: any[][] = [];
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const levelMap = new Map<string, number>();

  function calculateLevel(taskId: string): number {
    if (levelMap.has(taskId)) return levelMap.get(taskId)!;

    const task = taskMap.get(taskId);
    if (!task || task.dependencies.length === 0) {
      levelMap.set(taskId, 0);
      return 0;
    }

    const maxLevel = Math.max(...task.dependencies.map(dep => calculateLevel(dep))) + 1;
    levelMap.set(taskId, maxLevel);
    return maxLevel;
  }

  // Calculate levels for all tasks
  for (const task of tasks) {
    const level = calculateLevel(task.id);
    if (!levels[level]) levels[level] = [];
    levels[level].push(task);
  }

  return levels.filter(level => level && level.length > 0);
}

function findIndependentGroups(tasks: any[], allTasks: any[]): any[][] {
  // Simplified implementation - in reality would need more complex analysis
  return [tasks]; // For now, assume all tasks at same level can be parallelized
}

function calculateTimeReduction(tasks: any[]): number {
  // Simplified calculation - in reality would depend on task durations
  return Math.min(50, tasks.length * 10);
}

function analyzeResourceUsage(tasks: any[]): WorkflowOptimization[] {
  const optimizations: WorkflowOptimization[] = [];

  // Analyze CPU-intensive tasks
  const cpuIntensiveTasks = tasks.filter(t =>
    t.type === 'build' || t.type === 'test' || t.type === 'analysis'
  );

  if (cpuIntensiveTasks.length > 3) {
    optimizations.push({
      type: 'resource_optimization',
      description: 'Multiple CPU-intensive tasks detected, consider resource pooling',
      impact: 'medium',
      implementation: 'Implement resource pools and task scheduling',
      estimatedGain: 20
    });
  }

  return optimizations;
}

function calculateEstimatedImprovements(optimizations: WorkflowOptimization[]): {
  timeReduction: number;
  resourceEfficiency: number;
  parallelizationGain: number;
} {
  let timeReduction = 0;
  let resourceEfficiency = 0;
  let parallelizationGain = 0;

  for (const opt of optimizations) {
    switch (opt.type) {
      case 'parallelization':
        parallelizationGain += opt.estimatedGain;
        timeReduction += opt.estimatedGain * 0.8;
        break;
      case 'resource_optimization':
        resourceEfficiency += opt.estimatedGain;
        break;
      case 'retry_optimization':
      case 'timeout_optimization':
        timeReduction += opt.estimatedGain * 0.5;
        break;
    }
  }

  return {
    timeReduction: Math.min(50, timeReduction),
    resourceEfficiency: Math.min(40, resourceEfficiency),
    parallelizationGain: Math.min(60, parallelizationGain)
  };
}

function calculateWorkflowComplexity(workflow: WorkflowDefinition): 'simple' | 'medium' | 'complex' | 'enterprise' {
  const taskCount = workflow.tasks.length;
  const depthScore = calculateWorkflowDepth(workflow.tasks);
  const complexityScore = taskCount + (depthScore * 2);

  if (complexityScore < 10) return 'simple';
  if (complexityScore < 25) return 'medium';
  if (complexityScore < 50) return 'complex';
  return 'enterprise';
}

function calculateEstimatedDuration(tasks: any[]): number {
  // Simplified calculation based on critical path
  const criticalPath = findCriticalPath(tasks);
  return criticalPath.reduce((total, taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return total + (task?.timeout || 300000); // Default 5 minutes
  }, 0);
}

function calculateParallelizationScore(tasks: any[]): number {
  const totalTasks = tasks.length;
  const levels = groupTasksByLevel(tasks);
  const maxParallelTasks = Math.max(...levels.map(level => level.length));

  return Math.round((maxParallelTasks / totalTasks) * 100);
}

function calculateResourceEfficiency(tasks: any[]): number {
  // Simplified calculation based on task types and parallelization
  const parallelizableCount = tasks.filter(t =>
    !['deploy', 'database_deploy'].includes(t.type)
  ).length;

  return Math.round((parallelizableCount / tasks.length) * 100);
}

function findCriticalPath(tasks: any[]): string[] {
  // Simplified critical path calculation
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const longestPath: string[] = [];

  function findLongestPath(taskId: string, currentPath: string[]): string[] {
    const task = taskMap.get(taskId);
    if (!task) return currentPath;

    const newPath = [...currentPath, taskId];

    if (task.dependencies.length === 0) {
      return newPath;
    }

    let longest = newPath;
    for (const dep of task.dependencies) {
      const path = findLongestPath(dep, newPath);
      if (path.length > longest.length) {
        longest = path;
      }
    }

    return longest;
  }

  // Find the longest path from any leaf task
  for (const task of tasks) {
    const dependents = tasks.filter(t => t.dependencies.includes(task.id));
    if (dependents.length === 0) { // Leaf task
      const path = findLongestPath(task.id, []);
      if (path.length > longestPath.length) {
        longestPath.splice(0, longestPath.length, ...path);
      }
    }
  }

  return longestPath.reverse();
}

function findBottlenecks(tasks: any[]): string[] {
  const bottlenecks: string[] = [];

  for (const task of tasks) {
    const dependents = tasks.filter(t => t.dependencies.includes(task.id));
    if (dependents.length > 3) { // Task with many dependents
      bottlenecks.push(task.id);
    }
  }

  return bottlenecks;
}

function identifyRiskFactors(workflow: WorkflowDefinition): string[] {
  const risks: string[] = [];

  // Check for tasks with no retries
  const noRetryTasks = workflow.tasks.filter(t => !t.retryAttempts || t.retryAttempts === 0);
  if (noRetryTasks.length > 0) {
    risks.push(`${noRetryTasks.length} tasks have no retry mechanism`);
  }

  // Check for very long timeouts
  const longTimeoutTasks = workflow.tasks.filter(t => t.timeout && t.timeout > 3600000);
  if (longTimeoutTasks.length > 0) {
    risks.push(`${longTimeoutTasks.length} tasks have very long timeouts`);
  }

  // Check for single points of failure
  const criticalTasks = workflow.tasks.filter(task => {
    const dependents = workflow.tasks.filter(t => t.dependencies.includes(task.id));
    return dependents.length > workflow.tasks.length * 0.5;
  });
  if (criticalTasks.length > 0) {
    risks.push(`${criticalTasks.length} tasks are single points of failure`);
  }

  return risks;
}

function calculateWorkflowThroughput(tasks: any[]): number {
  // Simplified throughput calculation
  const levels = groupTasksByLevel(tasks);
  const avgTasksPerLevel = tasks.length / levels.length;
  return Math.round(avgTasksPerLevel * 10) / 10; // Tasks per level
}

function analyzeResourceUtilization(tasks: any[]): ResourceUtilization {
  const cpuIntensive = tasks.filter(t => ['build', 'test'].includes(t.type)).length;
  const ioIntensive = tasks.filter(t => ['deploy', 'database_deploy'].includes(t.type)).length;
  const networkIntensive = tasks.filter(t => ['git', 'download'].includes(t.type)).length;

  return {
    cpu: Math.round((cpuIntensive / tasks.length) * 100),
    io: Math.round((ioIntensive / tasks.length) * 100),
    network: Math.round((networkIntensive / tasks.length) * 100),
    memory: 50 // Simplified
  };
}

function identifyFailurePoints(tasks: any[]): string[] {
  const failurePoints: string[] = [];

  // Tasks with external dependencies
  const externalTasks = tasks.filter(t =>
    ['deploy', 'git', 'download', 'api_call'].includes(t.type)
  );

  failurePoints.push(...externalTasks.map(t =>
    `${t.id}: External dependency failure risk`
  ));

  return failurePoints;
}

// Interfaces

interface WorkflowOptimization {
  type: 'parallelization' | 'resource_optimization' | 'retry_optimization' | 'timeout_optimization';
  description: string;
  impact: 'low' | 'medium' | 'high';
  implementation: string;
  estimatedGain: number;
}

interface ParallelizationOpportunity {
  tasks: string[];
  estimatedTimeReduction: number;
  complexity: 'low' | 'medium' | 'high';
}

interface WorkflowSummary {
  id: string;
  name: string;
  taskCount: number;
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  estimatedDuration: number;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
}

interface WorkflowAnalysis {
  dependencyDepth: number;
  parallelizationScore: number;
  resourceEfficiency: number;
  criticalPath: string[];
  bottlenecks: string[];
  riskFactors: string[];
}

interface WorkflowPerformanceAnalysis {
  throughput: number;
  resourceUtilization: ResourceUtilization;
  failurePoints: string[];
  optimizationOpportunities: number;
  estimatedImprovements: {
    timeReduction: number;
    resourceEfficiency: number;
    parallelizationGain: number;
  };
}

interface ResourceUtilization {
  cpu: number;
  io: number;
  network: number;
  memory: number;
}

interface WorkflowRecommendation {
  type: 'structure' | 'performance' | 'reliability' | 'security';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  implementation: string;
  expectedBenefit: string;
}
