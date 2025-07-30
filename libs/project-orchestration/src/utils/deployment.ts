/**
 * CODAI Project Orchestration - Deployment Utilities
 * Utilities for creating, validating, and optimizing deployment pipelines
 */

import { DeploymentPipeline, DeploymentTarget } from '../types.js';

/**
 * Deployment pipeline templates for common scenarios
 */
export const DEPLOYMENT_TEMPLATES = {
  'simple-web-app': {
    id: 'simple-web-app',
    name: 'Simple Web Application Deployment',
    description: 'Basic deployment pipeline for single web application',
    stages: [
      {
        id: 'build',
        name: 'Build Application',
        type: 'build',
        timeout: 600000,
        retryAttempts: 2,
        parallelExecution: false,
        steps: [
          {
            id: 'install-deps',
            name: 'Install Dependencies',
            command: 'npm ci',
            workingDirectory: '.',
            timeout: 300000,
          },
          {
            id: 'build-app',
            name: 'Build Application',
            command: 'npm run build',
            workingDirectory: '.',
            timeout: 300000,
          },
        ],
        artifacts: ['dist/', 'build/'],
        healthChecks: [],
      },
      {
        id: 'test',
        name: 'Run Tests',
        type: 'test',
        timeout: 300000,
        retryAttempts: 3,
        parallelExecution: false,
        steps: [
          {
            id: 'unit-tests',
            name: 'Unit Tests',
            command: 'npm test',
            workingDirectory: '.',
            timeout: 180000,
          },
          {
            id: 'lint',
            name: 'Lint Code',
            command: 'npm run lint',
            workingDirectory: '.',
            timeout: 60000,
          },
        ],
        artifacts: ['coverage/', 'test-results/'],
        healthChecks: [],
      },
      {
        id: 'deploy-staging',
        name: 'Deploy to Staging',
        type: 'deploy',
        timeout: 900000,
        retryAttempts: 2,
        parallelExecution: false,
        steps: [
          {
            id: 'deploy-files',
            name: 'Deploy Files',
            command: 'rsync -avz dist/ staging:/var/www/app/',
            workingDirectory: '.',
            timeout: 300000,
          },
          {
            id: 'restart-service',
            name: 'Restart Service',
            command: 'systemctl restart nginx',
            workingDirectory: '.',
            timeout: 60000,
          },
        ],
        artifacts: [],
        healthChecks: [
          {
            id: 'health-check',
            name: 'Application Health Check',
            url: 'https://staging.example.com/health',
            expectedStatus: 200,
            timeout: 30000,
            retryAttempts: 5,
          },
        ],
      },
      {
        id: 'deploy-production',
        name: 'Deploy to Production',
        type: 'deploy',
        timeout: 1800000,
        retryAttempts: 1,
        parallelExecution: false,
        approvalRequired: true,
        steps: [
          {
            id: 'backup-current',
            name: 'Backup Current Version',
            command: 'cp -r /var/www/app /var/www/app.backup.$(date +%Y%m%d_%H%M%S)',
            workingDirectory: '.',
            timeout: 300000,
          },
          {
            id: 'deploy-files',
            name: 'Deploy Files',
            command: 'rsync -avz dist/ production:/var/www/app/',
            workingDirectory: '.',
            timeout: 600000,
          },
          {
            id: 'restart-service',
            name: 'Restart Service',
            command: 'systemctl restart nginx',
            workingDirectory: '.',
            timeout: 60000,
          },
        ],
        artifacts: [],
        healthChecks: [
          {
            id: 'health-check',
            name: 'Production Health Check',
            url: 'https://production.example.com/health',
            expectedStatus: 200,
            timeout: 30000,
            retryAttempts: 10,
          },
          {
            id: 'smoke-test',
            name: 'Smoke Test',
            url: 'https://production.example.com/api/status',
            expectedStatus: 200,
            timeout: 30000,
            retryAttempts: 3,
          },
        ],
      },
    ],
    triggers: [
      {
        id: 'manual',
        type: 'manual',
        description: 'Manual deployment trigger',
      },
      {
        id: 'git-tag',
        type: 'git',
        event: 'tag',
        pattern: 'v*',
      },
    ],
    rollbackStrategy: {
      enabled: true,
      type: 'filesystem',
      maxRollbackVersions: 5,
      rollbackTimeout: 300000,
    },
    notifications: [
      {
        id: 'slack-deploy',
        type: 'slack',
        webhook: '${SLACK_WEBHOOK_URL}',
        events: ['deploy_start', 'deploy_success', 'deploy_failure'],
      },
    ],
    metadata: {
      category: 'web',
      complexity: 'simple',
      estimatedDuration: 1800000, // 30 minutes
    },
  },

  'microservices-k8s': {
    id: 'microservices-k8s',
    name: 'Microservices Kubernetes Deployment',
    description: 'Complex deployment pipeline for microservices on Kubernetes',
    stages: [
      {
        id: 'build-images',
        name: 'Build Docker Images',
        type: 'build',
        timeout: 1200000,
        retryAttempts: 2,
        parallelExecution: true,
        steps: [
          {
            id: 'build-api',
            name: 'Build API Service',
            command: 'docker build -t api:${BUILD_VERSION} ./services/api',
            workingDirectory: '.',
            timeout: 600000,
          },
          {
            id: 'build-web',
            name: 'Build Web Service',
            command: 'docker build -t web:${BUILD_VERSION} ./services/web',
            workingDirectory: '.',
            timeout: 600000,
          },
          {
            id: 'build-worker',
            name: 'Build Worker Service',
            command: 'docker build -t worker:${BUILD_VERSION} ./services/worker',
            workingDirectory: '.',
            timeout: 600000,
          },
        ],
        artifacts: ['api:${BUILD_VERSION}', 'web:${BUILD_VERSION}', 'worker:${BUILD_VERSION}'],
        healthChecks: [],
      },
      {
        id: 'security-scan',
        name: 'Security Scan',
        type: 'security',
        timeout: 900000,
        retryAttempts: 1,
        parallelExecution: true,
        steps: [
          {
            id: 'scan-api',
            name: 'Scan API Image',
            command: 'trivy image api:${BUILD_VERSION}',
            workingDirectory: '.',
            timeout: 300000,
          },
          {
            id: 'scan-web',
            name: 'Scan Web Image',
            command: 'trivy image web:${BUILD_VERSION}',
            workingDirectory: '.',
            timeout: 300000,
          },
          {
            id: 'scan-worker',
            name: 'Scan Worker Image',
            command: 'trivy image worker:${BUILD_VERSION}',
            workingDirectory: '.',
            timeout: 300000,
          },
        ],
        artifacts: ['security-reports/'],
        healthChecks: [],
      },
      {
        id: 'push-images',
        name: 'Push Docker Images',
        type: 'publish',
        timeout: 900000,
        retryAttempts: 3,
        parallelExecution: true,
        steps: [
          {
            id: 'push-api',
            name: 'Push API Image',
            command: 'docker push ${REGISTRY}/api:${BUILD_VERSION}',
            workingDirectory: '.',
            timeout: 300000,
          },
          {
            id: 'push-web',
            name: 'Push Web Image',
            command: 'docker push ${REGISTRY}/web:${BUILD_VERSION}',
            workingDirectory: '.',
            timeout: 300000,
          },
          {
            id: 'push-worker',
            name: 'Push Worker Image',
            command: 'docker push ${REGISTRY}/worker:${BUILD_VERSION}',
            workingDirectory: '.',
            timeout: 300000,
          },
        ],
        artifacts: [],
        healthChecks: [],
      },
      {
        id: 'deploy-staging',
        name: 'Deploy to Staging',
        type: 'deploy',
        timeout: 1800000,
        retryAttempts: 2,
        parallelExecution: false,
        steps: [
          {
            id: 'update-manifests',
            name: 'Update Kubernetes Manifests',
            command: 'envsubst < k8s/staging.yaml | kubectl apply -f -',
            workingDirectory: '.',
            timeout: 300000,
          },
          {
            id: 'rollout-api',
            name: 'Rollout API Service',
            command: 'kubectl rollout status deployment/api -n staging',
            workingDirectory: '.',
            timeout: 600000,
          },
          {
            id: 'rollout-web',
            name: 'Rollout Web Service',
            command: 'kubectl rollout status deployment/web -n staging',
            workingDirectory: '.',
            timeout: 600000,
          },
          {
            id: 'rollout-worker',
            name: 'Rollout Worker Service',
            command: 'kubectl rollout status deployment/worker -n staging',
            workingDirectory: '.',
            timeout: 600000,
          },
        ],
        artifacts: [],
        healthChecks: [
          {
            id: 'api-health',
            name: 'API Health Check',
            url: 'https://api-staging.example.com/health',
            expectedStatus: 200,
            timeout: 30000,
            retryAttempts: 10,
          },
          {
            id: 'web-health',
            name: 'Web Health Check',
            url: 'https://web-staging.example.com/health',
            expectedStatus: 200,
            timeout: 30000,
            retryAttempts: 10,
          },
        ],
      },
      {
        id: 'integration-tests',
        name: 'Integration Tests',
        type: 'test',
        timeout: 1800000,
        retryAttempts: 2,
        parallelExecution: false,
        steps: [
          {
            id: 'api-tests',
            name: 'API Integration Tests',
            command: 'npm run test:integration:api',
            workingDirectory: './tests',
            timeout: 900000,
          },
          {
            id: 'e2e-tests',
            name: 'End-to-End Tests',
            command: 'npm run test:e2e',
            workingDirectory: './tests',
            timeout: 900000,
          },
        ],
        artifacts: ['test-results/', 'screenshots/'],
        healthChecks: [],
      },
      {
        id: 'deploy-production',
        name: 'Deploy to Production',
        type: 'deploy',
        timeout: 3600000,
        retryAttempts: 1,
        parallelExecution: false,
        approvalRequired: true,
        steps: [
          {
            id: 'canary-deploy',
            name: 'Canary Deployment',
            command: 'kubectl apply -f k8s/production-canary.yaml',
            workingDirectory: '.',
            timeout: 600000,
          },
          {
            id: 'canary-validation',
            name: 'Validate Canary',
            command: 'kubectl wait --for=condition=available deployment/api-canary -n production --timeout=600s',
            workingDirectory: '.',
            timeout: 600000,
          },
          {
            id: 'full-deploy',
            name: 'Full Production Deployment',
            command: 'kubectl apply -f k8s/production.yaml',
            workingDirectory: '.',
            timeout: 1200000,
          },
          {
            id: 'cleanup-canary',
            name: 'Cleanup Canary',
            command: 'kubectl delete -f k8s/production-canary.yaml',
            workingDirectory: '.',
            timeout: 300000,
          },
        ],
        artifacts: [],
        healthChecks: [
          {
            id: 'api-production-health',
            name: 'Production API Health',
            url: 'https://api.example.com/health',
            expectedStatus: 200,
            timeout: 30000,
            retryAttempts: 15,
          },
          {
            id: 'web-production-health',
            name: 'Production Web Health',
            url: 'https://www.example.com/health',
            expectedStatus: 200,
            timeout: 30000,
            retryAttempts: 15,
          },
        ],
      },
    ],
    triggers: [
      {
        id: 'release-branch',
        type: 'git',
        event: 'push',
        branch: 'release/*',
      },
    ],
    rollbackStrategy: {
      enabled: true,
      type: 'kubernetes',
      maxRollbackVersions: 10,
      rollbackTimeout: 600000,
    },
    notifications: [
      {
        id: 'slack-deploy',
        type: 'slack',
        webhook: '${SLACK_WEBHOOK_URL}',
        events: ['deploy_start', 'deploy_success', 'deploy_failure'],
      },
      {
        id: 'email-production',
        type: 'email',
        recipients: ['ops@example.com'],
        events: ['deploy_success', 'deploy_failure'],
      },
    ],
    metadata: {
      category: 'microservices',
      complexity: 'enterprise',
      estimatedDuration: 5400000, // 90 minutes
    },
  },

  'serverless-deployment': {
    id: 'serverless-deployment',
    name: 'Serverless Function Deployment',
    description: 'Deployment pipeline for serverless functions',
    stages: [
      {
        id: 'package-functions',
        name: 'Package Functions',
        type: 'build',
        timeout: 600000,
        retryAttempts: 2,
        parallelExecution: true,
        steps: [
          {
            id: 'install-deps',
            name: 'Install Dependencies',
            command: 'npm ci --production',
            workingDirectory: '.',
            timeout: 300000,
          },
          {
            id: 'package-lambda',
            name: 'Package Lambda Functions',
            command: 'zip -r functions.zip . -x "*.git*" "node_modules/.cache/*"',
            workingDirectory: '.',
            timeout: 300000,
          },
        ],
        artifacts: ['functions.zip'],
        healthChecks: [],
      },
      {
        id: 'deploy-functions',
        name: 'Deploy Functions',
        type: 'deploy',
        timeout: 900000,
        retryAttempts: 2,
        parallelExecution: false,
        steps: [
          {
            id: 'update-function-code',
            name: 'Update Function Code',
            command: 'aws lambda update-function-code --function-name ${FUNCTION_NAME} --zip-file fileb://functions.zip',
            workingDirectory: '.',
            timeout: 300000,
          },
          {
            id: 'update-configuration',
            name: 'Update Configuration',
            command: 'aws lambda update-function-configuration --function-name ${FUNCTION_NAME} --environment Variables="{NODE_ENV=production}"',
            workingDirectory: '.',
            timeout: 120000,
          },
          {
            id: 'publish-version',
            name: 'Publish Version',
            command: 'aws lambda publish-version --function-name ${FUNCTION_NAME}',
            workingDirectory: '.',
            timeout: 120000,
          },
        ],
        artifacts: [],
        healthChecks: [
          {
            id: 'function-health',
            name: 'Function Health Check',
            url: 'https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com/prod/health',
            expectedStatus: 200,
            timeout: 30000,
            retryAttempts: 5,
          },
        ],
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
    rollbackStrategy: {
      enabled: true,
      type: 'lambda_version',
      maxRollbackVersions: 20,
      rollbackTimeout: 300000,
    },
    notifications: [
      {
        id: 'sns-deploy',
        type: 'sns',
        topicArn: '${SNS_TOPIC_ARN}',
        events: ['deploy_success', 'deploy_failure'],
      },
    ],
    metadata: {
      category: 'serverless',
      complexity: 'simple',
      estimatedDuration: 900000, // 15 minutes
    },
  },
} as const;

/**
 * Create deployment pipeline from template
 */
export function createDeploymentFromTemplate(
  templateId: keyof typeof DEPLOYMENT_TEMPLATES,
  overrides?: Partial<DeploymentPipeline>
): DeploymentPipeline {
  const template = DEPLOYMENT_TEMPLATES[templateId];

  const pipeline: DeploymentPipeline = {
    id: `${template.id}-${Date.now()}`,
    name: template.name,
    description: template.description,
    version: '1.0.0',
    stages: template.stages.map(stage => ({
      ...stage,
      id: `${stage.id}-${Date.now()}`,
    })),
    triggers: template.triggers,
    rollbackStrategy: template.rollbackStrategy,
    notifications: template.notifications,
    variables: {},
    metadata: {
      ...template.metadata,
      createdAt: new Date(),
      template: templateId,
    },
  };

  if (overrides) {
    return { ...pipeline, ...overrides };
  }

  return pipeline;
}

/**
 * Validate deployment pipeline
 */
export function validateDeploymentPipeline(pipeline: DeploymentPipeline): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Validate required fields
  if (!pipeline.id) {
    errors.push('Pipeline ID is required');
  }
  if (!pipeline.name) {
    errors.push('Pipeline name is required');
  }
  if (!pipeline.stages || pipeline.stages.length === 0) {
    errors.push('Pipeline must have at least one stage');
  }

  // Validate stages
  const stageIds = new Set<string>();
  for (const stage of pipeline.stages) {
    // Check for duplicate stage IDs
    if (stageIds.has(stage.id)) {
      errors.push(`Duplicate stage ID: ${stage.id}`);
    }
    stageIds.add(stage.id);

    // Validate stage steps
    if (!stage.steps || stage.steps.length === 0) {
      errors.push(`Stage ${stage.id} must have at least one step`);
    }

    // Validate stage timeout
    if (stage.timeout && stage.timeout < 30000) {
      warnings.push(`Stage ${stage.id} has very short timeout (${stage.timeout}ms)`);
    }

    // Validate retry attempts
    if (stage.retryAttempts > 3) {
      warnings.push(`Stage ${stage.id} has excessive retry attempts (${stage.retryAttempts})`);
    }

    // Validate approval requirements for production deployments
    if (stage.type === 'deploy' && stage.id.includes('production') && !stage.approvalRequired) {
      suggestions.push(`Stage ${stage.id} should require approval for production deployment`);
    }

    // Validate health checks for deployment stages
    if (stage.type === 'deploy' && (!stage.healthChecks || stage.healthChecks.length === 0)) {
      warnings.push(`Deployment stage ${stage.id} has no health checks`);
    }
  }

  // Validate rollback strategy
  if (!pipeline.rollbackStrategy || !pipeline.rollbackStrategy.enabled) {
    warnings.push('Pipeline has no rollback strategy defined');
  }

  // Validate triggers
  if (!pipeline.triggers || pipeline.triggers.length === 0) {
    warnings.push('Pipeline has no triggers defined');
  }

  // Validate notifications
  if (!pipeline.notifications || pipeline.notifications.length === 0) {
    suggestions.push('Consider adding notifications for deployment events');
  }

  // Generate security suggestions
  const hasSecurityStage = pipeline.stages.some(stage => stage.type === 'security');
  if (!hasSecurityStage) {
    suggestions.push('Consider adding a security scanning stage');
  }

  // Generate performance suggestions
  const hasTestStage = pipeline.stages.some(stage => stage.type === 'test');
  if (!hasTestStage) {
    suggestions.push('Consider adding automated testing stages');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Optimize deployment pipeline for performance
 */
export function optimizeDeploymentPipeline(pipeline: DeploymentPipeline): {
  optimizedPipeline: DeploymentPipeline;
  optimizations: DeploymentOptimization[];
  estimatedImprovements: {
    timeReduction: number; // percentage
    reliabilityIncrease: number; // percentage
    parallelizationGain: number; // percentage
  };
} {
  const optimizedPipeline = JSON.parse(JSON.stringify(pipeline)) as DeploymentPipeline;
  const optimizations: DeploymentOptimization[] = [];

  // Optimize stage parallelization
  const parallelizationOpportunities = findStageParallelizationOpportunities(pipeline.stages);
  for (const opportunity of parallelizationOpportunities) {
    optimizations.push({
      type: 'parallelization',
      description: `Stages ${opportunity.stages.join(', ')} can run in parallel`,
      impact: 'high',
      implementation: 'Enable parallel execution for independent stages',
      estimatedGain: opportunity.estimatedTimeReduction
    });
  }

  // Optimize health check strategies
  for (const stage of optimizedPipeline.stages) {
    if (stage.type === 'deploy' && stage.healthChecks) {
      for (const healthCheck of stage.healthChecks) {
        if (healthCheck.retryAttempts > 10) {
          const originalRetries = healthCheck.retryAttempts;
          healthCheck.retryAttempts = 10;
          optimizations.push({
            type: 'health_check_optimization',
            description: `Reduced health check retries for ${healthCheck.name} from ${originalRetries} to 10`,
            impact: 'medium',
            implementation: 'Use exponential backoff for health checks',
            estimatedGain: 10
          });
        }
      }
    }
  }

  // Optimize timeout values
  for (const stage of optimizedPipeline.stages) {
    if (stage.timeout && stage.timeout > 3600000 && stage.type !== 'deploy') { // 1 hour
      const originalTimeout = stage.timeout;
      stage.timeout = Math.min(1800000, stage.timeout); // 30 minutes max for non-deploy stages
      optimizations.push({
        type: 'timeout_optimization',
        description: `Reduced timeout for stage ${stage.name} from ${originalTimeout}ms to ${stage.timeout}ms`,
        impact: 'low',
        implementation: 'Use more appropriate timeout values',
        estimatedGain: 5
      });
    }
  }

  // Add caching optimizations
  const buildStages = optimizedPipeline.stages.filter(stage => stage.type === 'build');
  for (const stage of buildStages) {
    const hasCaching = stage.steps.some(step =>
      step.command.includes('cache') || step.command.includes('--cache-from')
    );
    if (!hasCaching) {
      optimizations.push({
        type: 'caching',
        description: `Add build caching to stage ${stage.name}`,
        impact: 'high',
        implementation: 'Implement Docker layer caching or dependency caching',
        estimatedGain: 30
      });
    }
  }

  // Calculate estimated improvements
  const estimatedImprovements = calculateDeploymentImprovements(optimizations);

  return {
    optimizedPipeline,
    optimizations,
    estimatedImprovements
  };
}

/**
 * Generate deployment targets for different environments
 */
export function generateDeploymentTargets(): Record<string, DeploymentTarget> {
  return {
    development: {
      id: 'development',
      name: 'Development Environment',
      type: 'development',
      configuration: {
        replicas: 1,
        resources: {
          cpu: '100m',
          memory: '128Mi',
        },
        environment: {
          NODE_ENV: 'development',
          LOG_LEVEL: 'debug',
          ENABLE_DEBUG: 'true',
        },
      },
      healthChecks: [
        {
          id: 'dev-health',
          name: 'Development Health Check',
          url: 'http://localhost:3000/health',
          expectedStatus: 200,
          timeout: 10000,
          retryAttempts: 3,
        },
      ],
      constraints: {
        region: 'us-east-1',
        availabilityZone: 'us-east-1a',
        nodeSelector: {
          'node-type': 'development',
        },
      },
      metadata: {
        maintainer: 'dev-team@example.com',
        costCenter: 'development',
        environment: 'dev',
      },
    },

    staging: {
      id: 'staging',
      name: 'Staging Environment',
      type: 'staging',
      configuration: {
        replicas: 2,
        resources: {
          cpu: '500m',
          memory: '512Mi',
        },
        environment: {
          NODE_ENV: 'staging',
          LOG_LEVEL: 'info',
          ENABLE_METRICS: 'true',
        },
      },
      healthChecks: [
        {
          id: 'staging-health',
          name: 'Staging Health Check',
          url: 'https://staging.example.com/health',
          expectedStatus: 200,
          timeout: 30000,
          retryAttempts: 5,
        },
        {
          id: 'staging-api-health',
          name: 'Staging API Health',
          url: 'https://api-staging.example.com/health',
          expectedStatus: 200,
          timeout: 30000,
          retryAttempts: 5,
        },
      ],
      constraints: {
        region: 'us-east-1',
        availabilityZone: ['us-east-1a', 'us-east-1b'],
        nodeSelector: {
          'node-type': 'staging',
        },
      },
      metadata: {
        maintainer: 'qa-team@example.com',
        costCenter: 'staging',
        environment: 'staging',
      },
    },

    production: {
      id: 'production',
      name: 'Production Environment',
      type: 'production',
      configuration: {
        replicas: 5,
        resources: {
          cpu: '1000m',
          memory: '1Gi',
        },
        environment: {
          NODE_ENV: 'production',
          LOG_LEVEL: 'warn',
          ENABLE_METRICS: 'true',
          ENABLE_TRACING: 'true',
        },
      },
      healthChecks: [
        {
          id: 'production-health',
          name: 'Production Health Check',
          url: 'https://www.example.com/health',
          expectedStatus: 200,
          timeout: 30000,
          retryAttempts: 10,
        },
        {
          id: 'production-api-health',
          name: 'Production API Health',
          url: 'https://api.example.com/health',
          expectedStatus: 200,
          timeout: 30000,
          retryAttempts: 10,
        },
        {
          id: 'production-readiness',
          name: 'Production Readiness Check',
          url: 'https://www.example.com/ready',
          expectedStatus: 200,
          timeout: 30000,
          retryAttempts: 5,
        },
      ],
      constraints: {
        region: 'us-east-1',
        availabilityZone: ['us-east-1a', 'us-east-1b', 'us-east-1c'],
        nodeSelector: {
          'node-type': 'production',
        },
        antiAffinity: true,
      },
      metadata: {
        maintainer: 'ops-team@example.com',
        costCenter: 'production',
        environment: 'prod',
        sla: '99.9%',
      },
    },
  };
}

/**
 * Generate deployment report
 */
export function generateDeploymentReport(pipeline: DeploymentPipeline): {
  summary: DeploymentSummary;
  analysis: DeploymentAnalysis;
  security: DeploymentSecurityAnalysis;
  recommendations: DeploymentRecommendation[];
} {
  const validation = validateDeploymentPipeline(pipeline);
  const optimization = optimizeDeploymentPipeline(pipeline);

  const summary: DeploymentSummary = {
    id: pipeline.id,
    name: pipeline.name,
    stageCount: pipeline.stages.length,
    complexity: calculateDeploymentComplexity(pipeline),
    estimatedDuration: pipeline.metadata?.estimatedDuration || calculateEstimatedDeploymentDuration(pipeline.stages),
    isValid: validation.isValid,
    errorCount: validation.errors.length,
    warningCount: validation.warnings.length,
    hasRollbackStrategy: !!pipeline.rollbackStrategy?.enabled,
    hasSecurityStage: pipeline.stages.some(stage => stage.type === 'security'),
  };

  const analysis: DeploymentAnalysis = {
    stageDistribution: analyzeStageDistribution(pipeline.stages),
    parallelizationScore: calculateDeploymentParallelizationScore(pipeline.stages),
    reliabilityScore: calculateReliabilityScore(pipeline),
    securityScore: calculateSecurityScore(pipeline),
    criticalPath: findDeploymentCriticalPath(pipeline.stages),
    bottlenecks: findDeploymentBottlenecks(pipeline.stages),
    riskFactors: identifyDeploymentRiskFactors(pipeline),
  };

  const security: DeploymentSecurityAnalysis = {
    hasSecurityScanning: pipeline.stages.some(stage => stage.type === 'security'),
    hasApprovalGates: pipeline.stages.some(stage => stage.approvalRequired),
    hasRollbackCapability: !!pipeline.rollbackStrategy?.enabled,
    vulnerabilityScanning: analyzeVulnerabilityScanning(pipeline),
    accessControl: analyzeAccessControl(pipeline),
    secretsManagement: analyzeSecretsManagement(pipeline),
  };

  const recommendations: DeploymentRecommendation[] = [
    ...validation.suggestions.map(suggestion => ({
      type: 'structure' as const,
      priority: 'medium' as const,
      title: 'Pipeline Structure',
      description: suggestion,
      implementation: 'Review pipeline structure and add missing components',
      expectedBenefit: 'Improved reliability and maintainability'
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
    security,
    recommendations
  };
}

// Helper functions

function findStageParallelizationOpportunities(stages: any[]): StageParallelizationOpportunity[] {
  const opportunities: StageParallelizationOpportunity[] = [];

  // Group stages by type that can potentially run in parallel
  const buildStages = stages.filter(stage => stage.type === 'build');
  const testStages = stages.filter(stage => stage.type === 'test');

  if (buildStages.length > 1) {
    opportunities.push({
      stages: buildStages.map(s => s.id),
      estimatedTimeReduction: 40,
      complexity: 'medium'
    });
  }

  if (testStages.length > 1) {
    opportunities.push({
      stages: testStages.map(s => s.id),
      estimatedTimeReduction: 30,
      complexity: 'low'
    });
  }

  return opportunities;
}

function calculateDeploymentImprovements(optimizations: DeploymentOptimization[]): {
  timeReduction: number;
  reliabilityIncrease: number;
  parallelizationGain: number;
} {
  let timeReduction = 0;
  let reliabilityIncrease = 0;
  let parallelizationGain = 0;

  for (const opt of optimizations) {
    switch (opt.type) {
      case 'parallelization':
        parallelizationGain += opt.estimatedGain;
        timeReduction += opt.estimatedGain * 0.9;
        break;
      case 'caching':
        timeReduction += opt.estimatedGain;
        break;
      case 'health_check_optimization':
        reliabilityIncrease += opt.estimatedGain * 0.5;
        timeReduction += opt.estimatedGain * 0.3;
        break;
      case 'timeout_optimization':
        timeReduction += opt.estimatedGain * 0.2;
        break;
    }
  }

  return {
    timeReduction: Math.min(60, timeReduction),
    reliabilityIncrease: Math.min(30, reliabilityIncrease),
    parallelizationGain: Math.min(50, parallelizationGain)
  };
}

function calculateDeploymentComplexity(pipeline: DeploymentPipeline): 'simple' | 'medium' | 'complex' | 'enterprise' {
  const stageCount = pipeline.stages.length;
  const stepCount = pipeline.stages.reduce((total, stage) => total + (stage.steps?.length || 0), 0);
  const hasApprovals = pipeline.stages.some(stage => stage.approvalRequired);
  const hasSecurity = pipeline.stages.some(stage => stage.type === 'security');

  let complexityScore = stageCount + (stepCount * 0.5);
  if (hasApprovals) complexityScore += 5;
  if (hasSecurity) complexityScore += 3;

  if (complexityScore < 10) return 'simple';
  if (complexityScore < 25) return 'medium';
  if (complexityScore < 50) return 'complex';
  return 'enterprise';
}

function calculateEstimatedDeploymentDuration(stages: any[]): number {
  // Sum of all stage timeouts (assuming sequential execution)
  return stages.reduce((total, stage) => total + (stage.timeout || 300000), 0);
}

function analyzeStageDistribution(stages: any[]): Record<string, number> {
  const distribution: Record<string, number> = {};

  for (const stage of stages) {
    distribution[stage.type] = (distribution[stage.type] || 0) + 1;
  }

  return distribution;
}

function calculateDeploymentParallelizationScore(stages: any[]): number {
  const parallelStages = stages.filter(stage => stage.parallelExecution).length;
  return Math.round((parallelStages / stages.length) * 100);
}

function calculateReliabilityScore(pipeline: DeploymentPipeline): number {
  let score = 0;

  // Rollback strategy
  if (pipeline.rollbackStrategy?.enabled) score += 25;

  // Health checks
  const stagesWithHealthChecks = pipeline.stages.filter(stage =>
    stage.healthChecks && stage.healthChecks.length > 0
  ).length;
  score += (stagesWithHealthChecks / pipeline.stages.length) * 25;

  // Retry mechanisms
  const stagesWithRetry = pipeline.stages.filter(stage =>
    stage.retryAttempts && stage.retryAttempts > 0
  ).length;
  score += (stagesWithRetry / pipeline.stages.length) * 25;

  // Approval gates
  const stagesWithApproval = pipeline.stages.filter(stage => stage.approvalRequired).length;
  score += (stagesWithApproval / pipeline.stages.length) * 25;

  return Math.round(score);
}

function calculateSecurityScore(pipeline: DeploymentPipeline): number {
  let score = 0;

  // Security scanning stage
  if (pipeline.stages.some(stage => stage.type === 'security')) score += 40;

  // Approval requirements for production
  const productionStages = pipeline.stages.filter(stage =>
    stage.id.includes('production') || stage.name.toLowerCase().includes('production')
  );
  const approvedProductionStages = productionStages.filter(stage => stage.approvalRequired);
  if (productionStages.length > 0) {
    score += (approvedProductionStages.length / productionStages.length) * 30;
  }

  // Rollback capability
  if (pipeline.rollbackStrategy?.enabled) score += 30;

  return Math.round(score);
}

function findDeploymentCriticalPath(stages: any[]): string[] {
  // Simplified critical path - longest sequential chain
  return stages.filter(stage => !stage.parallelExecution).map(stage => stage.id);
}

function findDeploymentBottlenecks(stages: any[]): string[] {
  const bottlenecks: string[] = [];

  // Stages with very long timeouts
  for (const stage of stages) {
    if (stage.timeout && stage.timeout > 1800000 && !stage.parallelExecution) { // 30 minutes
      bottlenecks.push(stage.id);
    }
  }

  return bottlenecks;
}

function identifyDeploymentRiskFactors(pipeline: DeploymentPipeline): string[] {
  const risks: string[] = [];

  // No rollback strategy
  if (!pipeline.rollbackStrategy?.enabled) {
    risks.push('No rollback strategy defined');
  }

  // Production deployments without approval
  const productionStages = pipeline.stages.filter(stage =>
    stage.id.includes('production') && !stage.approvalRequired
  );
  if (productionStages.length > 0) {
    risks.push(`${productionStages.length} production stages without approval gates`);
  }

  // Stages without health checks
  const deployStagesWithoutHealthChecks = pipeline.stages.filter(stage =>
    stage.type === 'deploy' && (!stage.healthChecks || stage.healthChecks.length === 0)
  );
  if (deployStagesWithoutHealthChecks.length > 0) {
    risks.push(`${deployStagesWithoutHealthChecks.length} deployment stages without health checks`);
  }

  return risks;
}

function analyzeVulnerabilityScanning(pipeline: DeploymentPipeline): {
  enabled: boolean;
  coverage: number;
  tools: string[];
} {
  const securityStages = pipeline.stages.filter(stage => stage.type === 'security');
  const scanningTools: string[] = [];

  for (const stage of securityStages) {
    for (const step of stage.steps || []) {
      if (step.command.includes('trivy')) scanningTools.push('Trivy');
      if (step.command.includes('snyk')) scanningTools.push('Snyk');
      if (step.command.includes('clair')) scanningTools.push('Clair');
    }
  }

  return {
    enabled: securityStages.length > 0,
    coverage: securityStages.length > 0 ? 100 : 0,
    tools: [...new Set(scanningTools)]
  };
}

function analyzeAccessControl(pipeline: DeploymentPipeline): {
  hasApprovalGates: boolean;
  approvalCoverage: number;
  restrictedStages: string[];
} {
  const approvalStages = pipeline.stages.filter(stage => stage.approvalRequired);
  const productionStages = pipeline.stages.filter(stage =>
    stage.id.includes('production') || stage.name.toLowerCase().includes('production')
  );

  return {
    hasApprovalGates: approvalStages.length > 0,
    approvalCoverage: pipeline.stages.length > 0 ?
      Math.round((approvalStages.length / pipeline.stages.length) * 100) : 0,
    restrictedStages: productionStages.map(stage => stage.id)
  };
}

function analyzeSecretsManagement(pipeline: DeploymentPipeline): {
  hasSecretReferences: boolean;
  secretSources: string[];
  riskLevel: 'low' | 'medium' | 'high';
} {
  const secretSources: string[] = [];
  let hasSecretReferences = false;

  // Check for environment variable references
  const envVarPattern = /\$\{[^}]+\}/g;

  for (const stage of pipeline.stages) {
    for (const step of stage.steps || []) {
      if (envVarPattern.test(step.command)) {
        hasSecretReferences = true;
        secretSources.push('Environment Variables');
      }
    }
  }

  // Check for specific secret management tools
  for (const stage of pipeline.stages) {
    for (const step of stage.steps || []) {
      if (step.command.includes('vault')) secretSources.push('HashiCorp Vault');
      if (step.command.includes('aws secretsmanager')) secretSources.push('AWS Secrets Manager');
      if (step.command.includes('kubectl get secret')) secretSources.push('Kubernetes Secrets');
    }
  }

  const riskLevel = secretSources.length === 0 ? 'high' :
    secretSources.includes('Environment Variables') ? 'medium' : 'low';

  return {
    hasSecretReferences,
    secretSources: [...new Set(secretSources)],
    riskLevel
  };
}

// Interfaces

interface DeploymentOptimization {
  type: 'parallelization' | 'health_check_optimization' | 'timeout_optimization' | 'caching';
  description: string;
  impact: 'low' | 'medium' | 'high';
  implementation: string;
  estimatedGain: number;
}

interface StageParallelizationOpportunity {
  stages: string[];
  estimatedTimeReduction: number;
  complexity: 'low' | 'medium' | 'high';
}

interface DeploymentSummary {
  id: string;
  name: string;
  stageCount: number;
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
  estimatedDuration: number;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  hasRollbackStrategy: boolean;
  hasSecurityStage: boolean;
}

interface DeploymentAnalysis {
  stageDistribution: Record<string, number>;
  parallelizationScore: number;
  reliabilityScore: number;
  securityScore: number;
  criticalPath: string[];
  bottlenecks: string[];
  riskFactors: string[];
}

interface DeploymentSecurityAnalysis {
  hasSecurityScanning: boolean;
  hasApprovalGates: boolean;
  hasRollbackCapability: boolean;
  vulnerabilityScanning: {
    enabled: boolean;
    coverage: number;
    tools: string[];
  };
  accessControl: {
    hasApprovalGates: boolean;
    approvalCoverage: number;
    restrictedStages: string[];
  };
  secretsManagement: {
    hasSecretReferences: boolean;
    secretSources: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

interface DeploymentRecommendation {
  type: 'structure' | 'performance' | 'reliability' | 'security';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  implementation: string;
  expectedBenefit: string;
}
