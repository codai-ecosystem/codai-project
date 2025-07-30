/**
 * CODAI Project Orchestration - Configuration Utilities
 * Utilities for creating, validating, and optimizing orchestration configurations
 */

import { ProjectOrchestrationConfig } from '../types.js';

/**
 * Configuration validation result
 */
export interface ConfigurationValidationResult {
  isValid: boolean;
  errors: ConfigurationError[];
  warnings: ConfigurationWarning[];
  score: number; // 0-100
  recommendations: ConfigurationRecommendation[];
}

export interface ConfigurationError {
  field: string;
  message: string;
  severity: 'error' | 'critical';
  fix: string;
}

export interface ConfigurationWarning {
  field: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface ConfigurationRecommendation {
  category: 'performance' | 'security' | 'reliability' | 'cost';
  title: string;
  description: string;
  implementation: string;
  benefit: string;
  effort: 'low' | 'medium' | 'high';
}

/**
 * Configuration optimization result
 */
export interface ConfigurationOptimizationResult {
  originalConfig: ProjectOrchestrationConfig;
  optimizedConfig: ProjectOrchestrationConfig;
  improvements: ConfigurationImprovement[];
  performanceGain: number; // percentage
  costSavings: number; // percentage
  reliabilityImprovement: number; // percentage
}

export interface ConfigurationImprovement {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  expectedBenefit: string;
}

/**
 * Configuration templates
 */
export const CONFIGURATION_TEMPLATES = {
  development: {
    orchestration: {
      enableAdvancedWorkflows: true,
      enableIntelligentDeployment: false,
      enableDynamicResourceAllocation: false,
      enablePredictiveDependencyAnalysis: true,
      enableRealTimeProgressTracking: true,
      enableAutomatedOptimization: false,
      maxConcurrentProjects: 10,
      healthCheckInterval: 60000,
      metricsCollectionInterval: 120000,
    },
    workflow: {
      maxConcurrentTasks: 5,
      defaultTimeout: 180000,
      retryAttempts: 2,
      retryDelay: 3000,
      healthCheckInterval: 45000,
      metricsCollectionInterval: 90000,
    },
    resource: {
      allocationTimeout: 180000,
      utilizationThreshold: 70,
      optimizationInterval: 7200000,
      capacityBuffer: 30,
      autoScalingEnabled: false,
      costOptimizationEnabled: false,
    },
  },

  staging: {
    orchestration: {
      enableAdvancedWorkflows: true,
      enableIntelligentDeployment: true,
      enableDynamicResourceAllocation: true,
      enablePredictiveDependencyAnalysis: true,
      enableRealTimeProgressTracking: true,
      enableAutomatedOptimization: true,
      maxConcurrentProjects: 25,
      healthCheckInterval: 45000,
      metricsCollectionInterval: 90000,
    },
    workflow: {
      maxConcurrentTasks: 8,
      defaultTimeout: 240000,
      retryAttempts: 3,
      retryDelay: 4000,
      healthCheckInterval: 30000,
      metricsCollectionInterval: 75000,
    },
    resource: {
      allocationTimeout: 240000,
      utilizationThreshold: 75,
      optimizationInterval: 5400000,
      capacityBuffer: 25,
      autoScalingEnabled: true,
      costOptimizationEnabled: true,
    },
  },

  production: {
    orchestration: {
      enableAdvancedWorkflows: true,
      enableIntelligentDeployment: true,
      enableDynamicResourceAllocation: true,
      enablePredictiveDependencyAnalysis: true,
      enableRealTimeProgressTracking: true,
      enableAutomatedOptimization: true,
      maxConcurrentProjects: 100,
      healthCheckInterval: 30000,
      metricsCollectionInterval: 60000,
    },
    workflow: {
      maxConcurrentTasks: 15,
      defaultTimeout: 300000,
      retryAttempts: 3,
      retryDelay: 5000,
      healthCheckInterval: 30000,
      metricsCollectionInterval: 60000,
    },
    resource: {
      allocationTimeout: 300000,
      utilizationThreshold: 80,
      optimizationInterval: 3600000,
      capacityBuffer: 20,
      autoScalingEnabled: true,
      costOptimizationEnabled: true,
    },
  },

  enterprise: {
    orchestration: {
      enableAdvancedWorkflows: true,
      enableIntelligentDeployment: true,
      enableDynamicResourceAllocation: true,
      enablePredictiveDependencyAnalysis: true,
      enableRealTimeProgressTracking: true,
      enableAutomatedOptimization: true,
      maxConcurrentProjects: 500,
      healthCheckInterval: 15000,
      metricsCollectionInterval: 30000,
    },
    workflow: {
      maxConcurrentTasks: 25,
      defaultTimeout: 600000,
      retryAttempts: 5,
      retryDelay: 2000,
      healthCheckInterval: 15000,
      metricsCollectionInterval: 30000,
    },
    resource: {
      allocationTimeout: 120000,
      utilizationThreshold: 85,
      optimizationInterval: 1800000,
      capacityBuffer: 15,
      autoScalingEnabled: true,
      costOptimizationEnabled: true,
    },
  },
} as const;

/**
 * Create orchestration configuration from template
 */
export function createOrchestrationConfig(
  projectId: string,
  template: keyof typeof CONFIGURATION_TEMPLATES = 'production',
  overrides?: Partial<ProjectOrchestrationConfig>
): ProjectOrchestrationConfig {
  const templateConfig = CONFIGURATION_TEMPLATES[template];

  const baseConfig: ProjectOrchestrationConfig = {
    projectId,
    orchestration: templateConfig.orchestration,
    workflow: templateConfig.workflow,
    deployment: {
      maxConcurrentDeployments: template === 'enterprise' ? 20 : template === 'production' ? 10 : 5,
      defaultTimeout: template === 'enterprise' ? 2400000 : template === 'production' ? 1800000 : 1200000,
      healthCheckTimeout: 300000,
      rollbackTimeout: 600000,
      preDeploymentChecks: true,
      postDeploymentValidation: true,
    },
    resource: templateConfig.resource,
    progress: {
      updateInterval: template === 'enterprise' ? 30000 : template === 'production' ? 60000 : 120000,
      reportingInterval: template === 'enterprise' ? 1800000 : 3600000,
      milestoneCheckInterval: 300000,
      riskAssessmentInterval: template === 'enterprise' ? 900000 : 1800000,
      enableRealTimeUpdates: template !== 'development',
      enableAutomatedReporting: template === 'production' || template === 'enterprise',
    },
    dependency: {
      analysisDepth: template === 'enterprise' ? 10 : template === 'production' ? 7 : 5,
      circularDependencyTolerance: 0,
      versionConflictTolerance: 'minor',
      optimizationGoals: {
        reduceCoupling: true,
        minimizeDeploymentTime: true,
        improveStability: true,
        optimizePerformance: template === 'production' || template === 'enterprise',
      },
    },
    security: {
      enableAuditLogging: template === 'production' || template === 'enterprise',
      enableAccessControl: template !== 'development',
      enableEncryption: template === 'production' || template === 'enterprise',
      auditLevel: template === 'enterprise' ? 'comprehensive' : template === 'production' ? 'standard' : 'basic',
    },
    monitoring: {
      enableHealthChecks: true,
      enableMetricsCollection: true,
      enableAlerts: template !== 'development',
      retentionDays: template === 'enterprise' ? 365 : template === 'production' ? 180 : 90,
    },
    integration: {
      ciCdProvider: 'github-actions',
      cloudProvider: 'aws',
      containerOrchestrator: 'kubernetes',
      monitoringSystem: 'prometheus',
    },
  };

  // Apply overrides
  if (overrides) {
    return deepMerge(baseConfig, overrides);
  }

  return baseConfig;
}

/**
 * Validate orchestration configuration
 */
export function validateConfiguration(config: ProjectOrchestrationConfig): ConfigurationValidationResult {
  const errors: ConfigurationError[] = [];
  const warnings: ConfigurationWarning[] = [];
  const recommendations: ConfigurationRecommendation[] = [];

  // Validate required fields
  if (!config.projectId || config.projectId.trim().length === 0) {
    errors.push({
      field: 'projectId',
      message: 'Project ID is required and cannot be empty',
      severity: 'critical',
      fix: 'Provide a valid project ID'
    });
  }

  // Validate orchestration settings
  if (config.orchestration.maxConcurrentProjects < 1) {
    errors.push({
      field: 'orchestration.maxConcurrentProjects',
      message: 'Maximum concurrent projects must be at least 1',
      severity: 'error',
      fix: 'Set maxConcurrentProjects to a positive number'
    });
  }

  if (config.orchestration.maxConcurrentProjects > 1000) {
    warnings.push({
      field: 'orchestration.maxConcurrentProjects',
      message: 'Very high concurrent project limit may impact performance',
      impact: 'high',
      recommendation: 'Consider using a more conservative limit or ensure adequate resources'
    });
  }

  // Validate workflow settings
  if (config.workflow.maxConcurrentTasks < 1) {
    errors.push({
      field: 'workflow.maxConcurrentTasks',
      message: 'Maximum concurrent tasks must be at least 1',
      severity: 'error',
      fix: 'Set maxConcurrentTasks to a positive number'
    });
  }

  if (config.workflow.defaultTimeout < 10000) {
    warnings.push({
      field: 'workflow.defaultTimeout',
      message: 'Very short timeout may cause premature task failures',
      impact: 'medium',
      recommendation: 'Consider increasing timeout to at least 30 seconds'
    });
  }

  if (config.workflow.retryAttempts > 10) {
    warnings.push({
      field: 'workflow.retryAttempts',
      message: 'Excessive retry attempts may delay failure detection',
      impact: 'medium',
      recommendation: 'Consider reducing retry attempts to 3-5'
    });
  }

  // Validate deployment settings
  if (config.deployment.maxConcurrentDeployments < 1) {
    errors.push({
      field: 'deployment.maxConcurrentDeployments',
      message: 'Maximum concurrent deployments must be at least 1',
      severity: 'error',
      fix: 'Set maxConcurrentDeployments to a positive number'
    });
  }

  // Validate resource settings
  if (config.resource.utilizationThreshold < 10 || config.resource.utilizationThreshold > 95) {
    warnings.push({
      field: 'resource.utilizationThreshold',
      message: 'Utilization threshold should be between 10% and 95%',
      impact: 'medium',
      recommendation: 'Set threshold between 70-85% for optimal performance'
    });
  }

  if (config.resource.capacityBuffer < 5) {
    warnings.push({
      field: 'resource.capacityBuffer',
      message: 'Very low capacity buffer may cause resource shortages',
      impact: 'high',
      recommendation: 'Consider increasing buffer to at least 15%'
    });
  }

  // Validate progress settings
  if (config.progress.updateInterval < 5000) {
    warnings.push({
      field: 'progress.updateInterval',
      message: 'Very frequent progress updates may impact performance',
      impact: 'medium',
      recommendation: 'Consider increasing interval to at least 30 seconds'
    });
  }

  // Validate dependency settings
  if (config.dependency.analysisDepth < 1) {
    errors.push({
      field: 'dependency.analysisDepth',
      message: 'Dependency analysis depth must be at least 1',
      severity: 'error',
      fix: 'Set analysisDepth to a positive number'
    });
  }

  if (config.dependency.analysisDepth > 20) {
    warnings.push({
      field: 'dependency.analysisDepth',
      message: 'Very deep dependency analysis may be slow',
      impact: 'medium',
      recommendation: 'Consider limiting depth to 10 or less'
    });
  }

  // Generate recommendations
  if (config.orchestration.enableAutomatedOptimization === false) {
    recommendations.push({
      category: 'performance',
      title: 'Enable Automated Optimization',
      description: 'Automated optimization can improve system performance and resource utilization',
      implementation: 'Set orchestration.enableAutomatedOptimization to true',
      benefit: 'Improved performance and cost efficiency',
      effort: 'low'
    });
  }

  if (config.security.enableAuditLogging === false) {
    recommendations.push({
      category: 'security',
      title: 'Enable Audit Logging',
      description: 'Audit logging helps with compliance and security monitoring',
      implementation: 'Set security.enableAuditLogging to true',
      benefit: 'Enhanced security and compliance',
      effort: 'low'
    });
  }

  if (config.resource.autoScalingEnabled === false) {
    recommendations.push({
      category: 'reliability',
      title: 'Enable Auto-scaling',
      description: 'Auto-scaling helps handle varying workloads automatically',
      implementation: 'Set resource.autoScalingEnabled to true',
      benefit: 'Better resource utilization and cost management',
      effort: 'medium'
    });
  }

  // Calculate configuration score
  const score = calculateConfigurationScore(config, errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score,
    recommendations
  };
}

/**
 * Optimize orchestration configuration
 */
export function optimizeConfiguration(
  config: ProjectOrchestrationConfig,
  optimizationGoals: {
    prioritizePerformance?: boolean;
    prioritizeCost?: boolean;
    prioritizeReliability?: boolean;
    prioritizeSecurity?: boolean;
  } = {}
): ConfigurationOptimizationResult {
  const originalConfig = deepClone(config);
  const optimizedConfig = deepClone(config);
  const improvements: ConfigurationImprovement[] = [];

  // Performance optimizations
  if (optimizationGoals.prioritizePerformance !== false) {
    // Optimize workflow concurrency
    if (optimizedConfig.workflow.maxConcurrentTasks < 10) {
      improvements.push({
        field: 'workflow.maxConcurrentTasks',
        oldValue: optimizedConfig.workflow.maxConcurrentTasks,
        newValue: Math.min(15, optimizedConfig.workflow.maxConcurrentTasks * 2),
        reason: 'Increase task concurrency for better performance',
        expectedBenefit: 'Faster workflow execution'
      });
      optimizedConfig.workflow.maxConcurrentTasks = Math.min(15, optimizedConfig.workflow.maxConcurrentTasks * 2);
    }

    // Optimize health check intervals
    if (optimizedConfig.orchestration.healthCheckInterval > 30000) {
      improvements.push({
        field: 'orchestration.healthCheckInterval',
        oldValue: optimizedConfig.orchestration.healthCheckInterval,
        newValue: 30000,
        reason: 'Reduce health check interval for faster issue detection',
        expectedBenefit: 'Quicker failure detection and recovery'
      });
      optimizedConfig.orchestration.healthCheckInterval = 30000;
    }

    // Enable advanced features
    if (!optimizedConfig.orchestration.enableAutomatedOptimization) {
      improvements.push({
        field: 'orchestration.enableAutomatedOptimization',
        oldValue: false,
        newValue: true,
        reason: 'Enable automated optimization for better performance',
        expectedBenefit: 'Continuous performance improvements'
      });
      optimizedConfig.orchestration.enableAutomatedOptimization = true;
    }
  }

  // Cost optimizations
  if (optimizationGoals.prioritizeCost !== false) {
    // Enable cost optimization
    if (!optimizedConfig.resource.costOptimizationEnabled) {
      improvements.push({
        field: 'resource.costOptimizationEnabled',
        oldValue: false,
        newValue: true,
        reason: 'Enable cost optimization to reduce expenses',
        expectedBenefit: 'Lower operational costs'
      });
      optimizedConfig.resource.costOptimizationEnabled = true;
    }

    // Optimize utilization threshold
    if (optimizedConfig.resource.utilizationThreshold < 80) {
      improvements.push({
        field: 'resource.utilizationThreshold',
        oldValue: optimizedConfig.resource.utilizationThreshold,
        newValue: 80,
        reason: 'Increase utilization threshold to reduce waste',
        expectedBenefit: 'Better resource efficiency and cost savings'
      });
      optimizedConfig.resource.utilizationThreshold = 80;
    }

    // Reduce capacity buffer
    if (optimizedConfig.resource.capacityBuffer > 20) {
      improvements.push({
        field: 'resource.capacityBuffer',
        oldValue: optimizedConfig.resource.capacityBuffer,
        newValue: 20,
        reason: 'Reduce capacity buffer to minimize idle resources',
        expectedBenefit: 'Lower resource costs'
      });
      optimizedConfig.resource.capacityBuffer = 20;
    }
  }

  // Reliability optimizations
  if (optimizationGoals.prioritizeReliability !== false) {
    // Enable auto-scaling
    if (!optimizedConfig.resource.autoScalingEnabled) {
      improvements.push({
        field: 'resource.autoScalingEnabled',
        oldValue: false,
        newValue: true,
        reason: 'Enable auto-scaling for better reliability',
        expectedBenefit: 'Automatic handling of load variations'
      });
      optimizedConfig.resource.autoScalingEnabled = true;
    }

    // Increase retry attempts
    if (optimizedConfig.workflow.retryAttempts < 3) {
      improvements.push({
        field: 'workflow.retryAttempts',
        oldValue: optimizedConfig.workflow.retryAttempts,
        newValue: 3,
        reason: 'Increase retry attempts for better fault tolerance',
        expectedBenefit: 'Improved resilience to transient failures'
      });
      optimizedConfig.workflow.retryAttempts = 3;
    }

    // Enable deployment validation
    if (!optimizedConfig.deployment.postDeploymentValidation) {
      improvements.push({
        field: 'deployment.postDeploymentValidation',
        oldValue: false,
        newValue: true,
        reason: 'Enable post-deployment validation for reliability',
        expectedBenefit: 'Early detection of deployment issues'
      });
      optimizedConfig.deployment.postDeploymentValidation = true;
    }
  }

  // Security optimizations
  if (optimizationGoals.prioritizeSecurity !== false) {
    // Enable audit logging
    if (!optimizedConfig.security.enableAuditLogging) {
      improvements.push({
        field: 'security.enableAuditLogging',
        oldValue: false,
        newValue: true,
        reason: 'Enable audit logging for security compliance',
        expectedBenefit: 'Enhanced security monitoring and compliance'
      });
      optimizedConfig.security.enableAuditLogging = true;
    }

    // Enable encryption
    if (!optimizedConfig.security.enableEncryption) {
      improvements.push({
        field: 'security.enableEncryption',
        oldValue: false,
        newValue: true,
        reason: 'Enable encryption for data protection',
        expectedBenefit: 'Enhanced data security'
      });
      optimizedConfig.security.enableEncryption = true;
    }

    // Enable access control
    if (!optimizedConfig.security.enableAccessControl) {
      improvements.push({
        field: 'security.enableAccessControl',
        oldValue: false,
        newValue: true,
        reason: 'Enable access control for security',
        expectedBenefit: 'Better access management and security'
      });
      optimizedConfig.security.enableAccessControl = true;
    }
  }

  // Calculate improvement metrics
  const performanceGain = calculatePerformanceGain(originalConfig, optimizedConfig);
  const costSavings = calculateCostSavings(originalConfig, optimizedConfig);
  const reliabilityImprovement = calculateReliabilityImprovement(originalConfig, optimizedConfig);

  return {
    originalConfig,
    optimizedConfig,
    improvements,
    performanceGain,
    costSavings,
    reliabilityImprovement
  };
}

/**
 * Generate configuration report
 */
export function generateConfigurationReport(config: ProjectOrchestrationConfig): {
  summary: ConfigurationSummary;
  analysis: ConfigurationAnalysis;
  recommendations: ConfigurationRecommendation[];
  compliance: ComplianceReport;
} {
  const validation = validateConfiguration(config);
  const optimization = optimizeConfiguration(config);

  const summary: ConfigurationSummary = {
    projectId: config.projectId,
    configurationScore: validation.score,
    isValid: validation.isValid,
    errorCount: validation.errors.length,
    warningCount: validation.warnings.length,
    optimizationOpportunities: optimization.improvements.length,
    estimatedPerformanceGain: optimization.performanceGain,
    estimatedCostSavings: optimization.costSavings,
  };

  const analysis: ConfigurationAnalysis = {
    strengths: generateStrengthsAnalysis(config),
    weaknesses: generateWeaknessesAnalysis(validation.errors, validation.warnings),
    riskAreas: generateRiskAnalysis(config),
    bestPracticesAlignment: assessBestPracticesAlignment(config),
  };

  const compliance: ComplianceReport = {
    securityCompliance: assessSecurityCompliance(config),
    reliabilityCompliance: assessReliabilityCompliance(config),
    performanceCompliance: assessPerformanceCompliance(config),
    overallCompliance: 0, // Will be calculated
  };

  compliance.overallCompliance =
    (compliance.securityCompliance + compliance.reliabilityCompliance + compliance.performanceCompliance) / 3;

  return {
    summary,
    analysis,
    recommendations: [...validation.recommendations, ...generateOptimizationRecommendations(optimization)],
    compliance
  };
}

// Helper functions

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function deepClone(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

function calculateConfigurationScore(
  config: ProjectOrchestrationConfig,
  errors: ConfigurationError[],
  warnings: ConfigurationWarning[]
): number {
  let score = 100;

  // Deduct points for errors
  score -= errors.length * (errors.some(e => e.severity === 'critical') ? 25 : 15);

  // Deduct points for warnings
  score -= warnings.length * 5;

  // Bonus points for enabled features
  if (config.orchestration.enableAutomatedOptimization) score += 5;
  if (config.security.enableAuditLogging) score += 5;
  if (config.resource.autoScalingEnabled) score += 5;
  if (config.monitoring.enableAlerts) score += 5;

  return Math.max(0, Math.min(100, score));
}

function calculatePerformanceGain(original: ProjectOrchestrationConfig, optimized: ProjectOrchestrationConfig): number {
  let gain = 0;

  // Calculate performance improvements
  if (optimized.workflow.maxConcurrentTasks > original.workflow.maxConcurrentTasks) {
    gain += 15;
  }
  if (optimized.orchestration.enableAutomatedOptimization && !original.orchestration.enableAutomatedOptimization) {
    gain += 20;
  }
  if (optimized.orchestration.healthCheckInterval < original.orchestration.healthCheckInterval) {
    gain += 10;
  }

  return Math.min(50, gain);
}

function calculateCostSavings(original: ProjectOrchestrationConfig, optimized: ProjectOrchestrationConfig): number {
  let savings = 0;

  // Calculate cost savings
  if (optimized.resource.costOptimizationEnabled && !original.resource.costOptimizationEnabled) {
    savings += 20;
  }
  if (optimized.resource.utilizationThreshold > original.resource.utilizationThreshold) {
    savings += 15;
  }
  if (optimized.resource.capacityBuffer < original.resource.capacityBuffer) {
    savings += 10;
  }

  return Math.min(40, savings);
}

function calculateReliabilityImprovement(original: ProjectOrchestrationConfig, optimized: ProjectOrchestrationConfig): number {
  let improvement = 0;

  // Calculate reliability improvements
  if (optimized.resource.autoScalingEnabled && !original.resource.autoScalingEnabled) {
    improvement += 25;
  }
  if (optimized.workflow.retryAttempts > original.workflow.retryAttempts) {
    improvement += 15;
  }
  if (optimized.deployment.postDeploymentValidation && !original.deployment.postDeploymentValidation) {
    improvement += 10;
  }

  return Math.min(50, improvement);
}

function generateStrengthsAnalysis(config: ProjectOrchestrationConfig): string[] {
  const strengths: string[] = [];

  if (config.orchestration.enableAutomatedOptimization) {
    strengths.push('Automated optimization enabled for continuous improvements');
  }
  if (config.security.enableAuditLogging) {
    strengths.push('Comprehensive audit logging for security and compliance');
  }
  if (config.resource.autoScalingEnabled) {
    strengths.push('Auto-scaling enabled for dynamic resource management');
  }
  if (config.monitoring.enableHealthChecks) {
    strengths.push('Health monitoring enabled for proactive issue detection');
  }

  return strengths;
}

function generateWeaknessesAnalysis(errors: ConfigurationError[], warnings: ConfigurationWarning[]): string[] {
  const weaknesses: string[] = [];

  errors.forEach(error => {
    weaknesses.push(`Critical issue: ${error.message}`);
  });

  warnings.filter(w => w.impact === 'high').forEach(warning => {
    weaknesses.push(`High-impact warning: ${warning.message}`);
  });

  return weaknesses;
}

function generateRiskAnalysis(config: ProjectOrchestrationConfig): string[] {
  const risks: string[] = [];

  if (!config.security.enableEncryption) {
    risks.push('Data encryption is disabled, potential security risk');
  }
  if (!config.deployment.preDeploymentChecks) {
    risks.push('Pre-deployment checks disabled, risk of failed deployments');
  }
  if (config.resource.capacityBuffer < 15) {
    risks.push('Low capacity buffer may cause resource shortages under load');
  }

  return risks;
}

function assessBestPracticesAlignment(config: ProjectOrchestrationConfig): number {
  let score = 0;
  let total = 0;

  // Check various best practices
  const practices = [
    { check: config.orchestration.enableAutomatedOptimization, weight: 10 },
    { check: config.security.enableAuditLogging, weight: 15 },
    { check: config.resource.autoScalingEnabled, weight: 10 },
    { check: config.monitoring.enableHealthChecks, weight: 10 },
    { check: config.deployment.preDeploymentChecks, weight: 10 },
    { check: config.workflow.retryAttempts >= 3, weight: 5 },
    { check: config.resource.utilizationThreshold >= 70, weight: 5 },
    { check: config.orchestration.healthCheckInterval <= 60000, weight: 5 },
  ];

  practices.forEach(practice => {
    total += practice.weight;
    if (practice.check) {
      score += practice.weight;
    }
  });

  return Math.round((score / total) * 100);
}

function assessSecurityCompliance(config: ProjectOrchestrationConfig): number {
  let score = 0;
  const checks = [
    config.security.enableAuditLogging,
    config.security.enableAccessControl,
    config.security.enableEncryption,
    config.security.auditLevel !== 'basic',
  ];

  score = (checks.filter(Boolean).length / checks.length) * 100;
  return Math.round(score);
}

function assessReliabilityCompliance(config: ProjectOrchestrationConfig): number {
  let score = 0;
  const checks = [
    config.resource.autoScalingEnabled,
    config.deployment.preDeploymentChecks,
    config.deployment.postDeploymentValidation,
    config.workflow.retryAttempts >= 3,
    config.monitoring.enableHealthChecks,
  ];

  score = (checks.filter(Boolean).length / checks.length) * 100;
  return Math.round(score);
}

function assessPerformanceCompliance(config: ProjectOrchestrationConfig): number {
  let score = 0;
  const checks = [
    config.orchestration.enableAutomatedOptimization,
    config.workflow.maxConcurrentTasks >= 5,
    config.orchestration.healthCheckInterval <= 60000,
    config.resource.utilizationThreshold >= 70,
    config.progress.updateInterval <= 120000,
  ];

  score = (checks.filter(Boolean).length / checks.length) * 100;
  return Math.round(score);
}

function generateOptimizationRecommendations(optimization: ConfigurationOptimizationResult): ConfigurationRecommendation[] {
  return optimization.improvements.map(improvement => ({
    category: 'performance' as const,
    title: `Optimize ${improvement.field}`,
    description: improvement.reason,
    implementation: `Update ${improvement.field} from ${improvement.oldValue} to ${improvement.newValue}`,
    benefit: improvement.expectedBenefit,
    effort: 'low' as const
  }));
}

// Additional interfaces
interface ConfigurationSummary {
  projectId: string;
  configurationScore: number;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  optimizationOpportunities: number;
  estimatedPerformanceGain: number;
  estimatedCostSavings: number;
}

interface ConfigurationAnalysis {
  strengths: string[];
  weaknesses: string[];
  riskAreas: string[];
  bestPracticesAlignment: number;
}

interface ComplianceReport {
  securityCompliance: number;
  reliabilityCompliance: number;
  performanceCompliance: number;
  overallCompliance: number;
}
