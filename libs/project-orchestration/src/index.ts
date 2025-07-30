/**
 * CODAI Project Orchestration Engine
 * Advanced multi-service project coordination and workflow management system
 * 
 * @version 1.0.0
 * @author CODAI Development Team
 * @description Enterprise-grade orchestration system for complex multi-service projects
 */

// Main orchestration engine
export { default as ProjectOrchestrationEngine } from './orchestrator.js';

// Core managers
export { default as WorkflowManager } from './workflow/manager.js';
export { default as DeploymentManager } from './deployment/manager.js';
export { default as ResourceManager } from './resource/manager.js';
export { default as DependencyAnalyzer } from './dependency/analyzer.js';
export { default as ProgressManager } from './progress/manager.js';

// Types and interfaces
export * from './types.js';

// Workflow management
export type {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowMetrics,
  TaskDefinition,
  TaskExecution,
  WorkflowEvent,
  ExecutionContext,
  WorkflowOptimizationResult
} from './workflow/manager.js';

// Deployment management
export type {
  DeploymentPipeline,
  DeploymentExecution,
  DeploymentMetrics,
  EnvironmentConfig,
  ServiceDeployment,
  DeploymentEvent,
  RollbackPlan,
  DeploymentOptimizationResult
} from './deployment/manager.js';

// Resource management
export type {
  ResourceAllocationRequest,
  OptimizationRecommendation,
  DependencyValidationResult,
  ResourcePerformanceMetrics,
  GlobalUtilizationMetrics,
  CapacityForecast
} from './resource/manager.js';

// Dependency analysis
export type {
  DependencyAnalysisResult,
  CircularDependency,
  MissingDependency,
  VersionConflict,
  DependencyValidationResult,
  DependencyOptimizationResult,
  DependencyImpactAnalysis,
  OptimizationGoals
} from './dependency/analyzer.js';

// Progress tracking
export type {
  TaskExecutionStatus,
  MilestoneStatus,
  ProgressAnalytics,
  AdvancedProgressReport,
  ProjectForecasting,
  ProgressRecommendation,
  ProgressTrackingConfig
} from './progress/manager.js';

// Utility functions
export {
  createOrchestrationConfig,
  validateConfiguration,
  optimizeConfiguration,
  generateConfigurationReport
} from './utils/config.js';

export {
  createWorkflowFromTemplate,
  validateWorkflow,
  optimizeWorkflow,
  generateWorkflowReport
} from './utils/workflow.js';

export {
  createDeploymentPipeline,
  validateDeploymentPipeline,
  optimizeDeploymentPipeline,
  generateDeploymentReport
} from './utils/deployment.js';

// Constants and defaults
export const ORCHESTRATION_DEFAULTS = {
  // Workflow defaults
  workflow: {
    maxConcurrentTasks: 10,
    defaultTimeout: 300000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 5000, // 5 seconds
    healthCheckInterval: 30000, // 30 seconds
    metricsCollectionInterval: 60000, // 1 minute
  },

  // Deployment defaults
  deployment: {
    maxConcurrentDeployments: 5,
    defaultTimeout: 1800000, // 30 minutes
    healthCheckTimeout: 300000, // 5 minutes
    rollbackTimeout: 600000, // 10 minutes
    preDeploymentChecks: true,
    postDeploymentValidation: true,
  },

  // Resource defaults
  resource: {
    allocationTimeout: 300000, // 5 minutes
    utilizationThreshold: 80, // 80%
    optimizationInterval: 3600000, // 1 hour
    capacityBuffer: 20, // 20%
    autoScalingEnabled: true,
    costOptimizationEnabled: true,
  },

  // Progress tracking defaults
  progress: {
    updateInterval: 60000, // 1 minute
    reportingInterval: 3600000, // 1 hour
    milestoneCheckInterval: 300000, // 5 minutes
    riskAssessmentInterval: 1800000, // 30 minutes
    enableRealTimeUpdates: true,
    enableAutomatedReporting: true,
  },

  // Dependency analysis defaults
  dependency: {
    analysisDepth: 5,
    circularDependencyTolerance: 0,
    versionConflictTolerance: 'minor',
    optimizationGoals: {
      reduceCoupling: true,
      minimizeDeploymentTime: true,
      improveStability: true,
      optimizePerformance: false,
    },
  },
} as const;

// Error types
export class OrchestrationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'OrchestrationError';
  }
}

export class WorkflowError extends OrchestrationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'WORKFLOW_ERROR', context);
    this.name = 'WorkflowError';
  }
}

export class DeploymentError extends OrchestrationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DEPLOYMENT_ERROR', context);
    this.name = 'DeploymentError';
  }
}

export class ResourceError extends OrchestrationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'RESOURCE_ERROR', context);
    this.name = 'ResourceError';
  }
}

export class DependencyError extends OrchestrationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DEPENDENCY_ERROR', context);
    this.name = 'DependencyError';
  }
}

export class ProgressError extends OrchestrationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'PROGRESS_ERROR', context);
    this.name = 'ProgressError';
  }
}

// Version information
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();
export const COMPATIBILITY_VERSION = '1.x';

// Feature flags
export const FEATURES = {
  ADVANCED_WORKFLOW_ENGINE: true,
  INTELLIGENT_DEPLOYMENT: true,
  DYNAMIC_RESOURCE_ALLOCATION: true,
  PREDICTIVE_DEPENDENCY_ANALYSIS: true,
  REAL_TIME_PROGRESS_TRACKING: true,
  AUTOMATED_OPTIMIZATION: true,
  MACHINE_LEARNING_INSIGHTS: true,
  MULTI_CLOUD_SUPPORT: true,
  ENTERPRISE_SECURITY: true,
  AUDIT_COMPLIANCE: true,
} as const;

// System limits
export const LIMITS = {
  MAX_CONCURRENT_PROJECTS: 100,
  MAX_SERVICES_PER_PROJECT: 500,
  MAX_WORKFLOW_DEPTH: 20,
  MAX_DEPLOYMENT_PARALLELISM: 50,
  MAX_RESOURCE_POOLS: 200,
  MAX_DEPENDENCIES_PER_SERVICE: 100,
  MAX_MILESTONES_PER_PROJECT: 1000,
  MAX_REPORT_HISTORY: 10000,
} as const;

// Performance benchmarks
export const PERFORMANCE_BENCHMARKS = {
  WORKFLOW_EXECUTION_TIME: 5000, // 5 seconds
  DEPLOYMENT_STARTUP_TIME: 30000, // 30 seconds
  RESOURCE_ALLOCATION_TIME: 10000, // 10 seconds
  DEPENDENCY_ANALYSIS_TIME: 15000, // 15 seconds
  PROGRESS_UPDATE_TIME: 1000, // 1 second
  REPORT_GENERATION_TIME: 60000, // 1 minute
} as const;

// Monitoring and observability
export const MONITORING = {
  HEALTH_CHECK_ENDPOINTS: [
    '/health',
    '/metrics',
    '/status',
    '/readiness',
    '/liveness'
  ],

  METRICS_CATEGORIES: [
    'orchestration',
    'workflow',
    'deployment',
    'resource',
    'dependency',
    'progress',
    'performance',
    'security'
  ],

  LOG_LEVELS: [
    'error',
    'warn',
    'info',
    'debug',
    'trace'
  ],

  ALERT_CHANNELS: [
    'email',
    'slack',
    'webhook',
    'sms',
    'dashboard'
  ]
} as const;

// Integration points
export const INTEGRATIONS = {
  SUPPORTED_CI_CD: [
    'jenkins',
    'github-actions',
    'gitlab-ci',
    'azure-devops',
    'circleci',
    'bamboo'
  ],

  SUPPORTED_CLOUD_PROVIDERS: [
    'aws',
    'azure',
    'gcp',
    'digitalocean',
    'linode',
    'vultr'
  ],

  SUPPORTED_CONTAINER_ORCHESTRATORS: [
    'kubernetes',
    'docker-swarm',
    'nomad',
    'ecs',
    'aci',
    'cloud-run'
  ],

  SUPPORTED_MONITORING_SYSTEMS: [
    'prometheus',
    'grafana',
    'datadog',
    'new-relic',
    'splunk',
    'elastic'
  ]
} as const;

/**
 * Create a new orchestration engine instance with default configuration
 */
export function createOrchestrationEngine(
  config?: Partial<ProjectOrchestrationConfig>
): ProjectOrchestrationEngine {
  const defaultConfig: ProjectOrchestrationConfig = {
    projectId: `project-${Date.now()}`,
    orchestration: {
      enableAdvancedWorkflows: true,
      enableIntelligentDeployment: true,
      enableDynamicResourceAllocation: true,
      enablePredictiveDependencyAnalysis: true,
      enableRealTimeProgressTracking: true,
      enableAutomatedOptimization: true,
      maxConcurrentProjects: LIMITS.MAX_CONCURRENT_PROJECTS,
      healthCheckInterval: ORCHESTRATION_DEFAULTS.workflow.healthCheckInterval,
      metricsCollectionInterval: ORCHESTRATION_DEFAULTS.workflow.metricsCollectionInterval,
    },
    workflow: ORCHESTRATION_DEFAULTS.workflow,
    deployment: ORCHESTRATION_DEFAULTS.deployment,
    resource: ORCHESTRATION_DEFAULTS.resource,
    progress: ORCHESTRATION_DEFAULTS.progress,
    dependency: ORCHESTRATION_DEFAULTS.dependency,
    security: {
      enableAuditLogging: true,
      enableAccessControl: true,
      enableEncryption: true,
      auditLevel: 'comprehensive',
    },
    monitoring: {
      enableHealthChecks: true,
      enableMetricsCollection: true,
      enableAlerts: true,
      retentionDays: 90,
    },
    integration: {
      ciCdProvider: 'github-actions',
      cloudProvider: 'aws',
      containerOrchestrator: 'kubernetes',
      monitoringSystem: 'prometheus',
    },
  };

  const mergedConfig = { ...defaultConfig, ...config };
  return new ProjectOrchestrationEngine(mergedConfig);
}

/**
 * Validate orchestration engine configuration
 */
export function validateOrchestrationConfig(
  config: ProjectOrchestrationConfig
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!config.projectId) {
    errors.push('Project ID is required');
  }

  // Validate limits
  if (config.orchestration.maxConcurrentProjects > LIMITS.MAX_CONCURRENT_PROJECTS) {
    warnings.push(`Max concurrent projects exceeds recommended limit of ${LIMITS.MAX_CONCURRENT_PROJECTS}`);
  }

  // Validate intervals
  if (config.orchestration.healthCheckInterval < 10000) {
    warnings.push('Health check interval is very frequent, may impact performance');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get system information
 */
export function getSystemInfo() {
  return {
    version: VERSION,
    buildDate: BUILD_DATE,
    compatibilityVersion: COMPATIBILITY_VERSION,
    features: Object.keys(FEATURES).filter(key => FEATURES[key as keyof typeof FEATURES]),
    limits: LIMITS,
    benchmarks: PERFORMANCE_BENCHMARKS,
    integrations: INTEGRATIONS,
  };
}

/**
 * Export everything for convenience
 */
export default {
  // Main classes
  ProjectOrchestrationEngine,
  WorkflowManager,
  DeploymentManager,
  ResourceManager,
  DependencyAnalyzer,
  ProgressManager,

  // Utilities
  createOrchestrationEngine,
  validateOrchestrationConfig,
  getSystemInfo,

  // Constants
  ORCHESTRATION_DEFAULTS,
  LIMITS,
  PERFORMANCE_BENCHMARKS,
  FEATURES,
  VERSION,

  // Error classes
  OrchestrationError,
  WorkflowError,
  DeploymentError,
  ResourceError,
  DependencyError,
  ProgressError,
};
