/**
 * CODAI Project Orchestration - Deployment Manager
 * Advanced automated deployment pipeline management system
 */

import { EventEmitter } from 'events';
import {
  ProjectOrchestrationConfig,
  DeploymentPipeline,
  DeploymentStage,
  DeploymentTask,
  DeploymentExecution,
  DeploymentMetrics,
  DeploymentEnvironment,
  RollbackStrategy
} from '../types.js';

/**
 * Deployment execution tracking
 */
export interface DeploymentExecution {
  id: string;
  projectId: string;
  pipelineId: string;

  // Execution details
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back' | 'cancelled';
  startTime: Date;
  endTime?: Date;

  // Deployment context
  services: string[];
  targetEnvironment: string;
  version: string;

  // Stage tracking
  currentStage?: string;
  completedStages: string[];
  failedStages: string[];

  // Task tracking
  completedTasks: DeploymentTaskResult[];
  failedTasks: DeploymentTaskResult[];
  totalTasks: number;
  progress: number;

  // Configuration and parameters
  configuration: Record<string, any>;
  parameters: Record<string, any>;

  // Results and artifacts
  deploymentArtifacts: DeploymentArtifact[];
  serviceEndpoints: ServiceEndpoint[];
  healthCheckResults: HealthCheckResult[];

  // Metrics and monitoring
  metrics: DeploymentMetrics;
  logs: DeploymentLog[];

  // Error handling and rollback
  errors: DeploymentError[];
  rollbackPlan?: RollbackPlan;
  rollbackExecution?: RollbackExecution;
}

export interface DeploymentTaskResult {
  taskId: string;
  stageId: string;
  status: 'completed' | 'failed' | 'skipped';
  startTime: Date;
  endTime: Date;
  duration: number;
  outputs: Record<string, any>;
  artifacts: string[];
  error?: string;
  retryCount: number;
}

export interface DeploymentArtifact {
  id: string;
  name: string;
  type: 'container_image' | 'package' | 'configuration' | 'script' | 'manifest';
  version: string;
  location: string;
  checksum: string;
  size: number;
  metadata: Record<string, any>;
}

export interface ServiceEndpoint {
  serviceName: string;
  url: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc' | 'tcp' | 'udp';
  healthCheckUrl?: string;
  status: 'active' | 'inactive' | 'degraded';
}

export interface HealthCheckResult {
  serviceName: string;
  endpoint: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  timestamp: Date;
  details: Record<string, any>;
}

export interface DeploymentLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context: Record<string, any>;
  source: string;
}

export interface DeploymentError {
  timestamp: Date;
  stage?: string;
  task?: string;
  type: string;
  message: string;
  stack?: string;
  context: Record<string, any>;
  recoverable: boolean;
  retryable: boolean;
}

export interface RollbackPlan {
  id: string;
  strategy: RollbackStrategy;
  triggers: string[];
  steps: RollbackStep[];
  verification: VerificationStep[];
  timeout: number;
}

export interface RollbackStep {
  id: string;
  name: string;
  type: 'service_rollback' | 'configuration_revert' | 'data_restore' | 'custom';
  configuration: Record<string, any>;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface VerificationStep {
  id: string;
  name: string;
  type: 'health_check' | 'performance_test' | 'integration_test' | 'smoke_test';
  configuration: Record<string, any>;
  successCriteria: string[];
  timeout: number;
}

export interface RollbackExecution {
  id: string;
  planId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  completedSteps: string[];
  failedSteps: string[];
  results: Record<string, any>;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelay: number;
  maxDelay: number;
  retryConditions: string[];
}

/**
 * Advanced Deployment Manager
 * Handles automated deployment pipelines with intelligent coordination and rollback capabilities
 */
export class DeploymentManager extends EventEmitter {
  private config: ProjectOrchestrationConfig;
  private isInitialized: boolean = false;

  // Pipeline registry and executions
  private pipelineRegistry: Map<string, DeploymentPipeline> = new Map();
  private activeDeployments: Map<string, DeploymentExecution> = new Map();
  private deploymentHistory: Map<string, DeploymentExecution[]> = new Map();

  // Deployment components
  private pipelineExecutor: PipelineExecutor;
  private environmentManager: EnvironmentManager;
  private serviceDeployer: ServiceDeployer;
  private healthChecker: HealthChecker;
  private rollbackManager: RollbackManager;

  // Monitoring and optimization
  private deploymentMonitor: DeploymentMonitor;
  private metricsCollector: DeploymentMetricsCollector;
  private securityScanner: SecurityScanner;
  private qualityValidator: QualityValidator;

  constructor(config: ProjectOrchestrationConfig) {
    super();
    this.config = config;
    this.initializeComponents();
  }

  /**
   * Initialize deployment manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🔧 Initializing Deployment Manager...');

    try {
      // Initialize components
      await this.pipelineExecutor.initialize();
      await this.environmentManager.initialize();
      await this.serviceDeployer.initialize();
      await this.healthChecker.initialize();
      await this.rollbackManager.initialize();
      await this.deploymentMonitor.initialize();
      await this.metricsCollector.initialize();
      await this.securityScanner.initialize();
      await this.qualityValidator.initialize();

      // Load existing pipelines and deployments
      await this.loadPipelineRegistry();
      await this.loadActiveDeployments();

      // Start background processes
      this.startBackgroundProcesses();

      this.isInitialized = true;
      console.log('✅ Deployment Manager initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Deployment Manager:', error);
      throw error;
    }
  }

  /**
   * Register a deployment pipeline
   */
  public async registerPipeline(pipeline: DeploymentPipeline): Promise<void> {
    console.log(`📝 Registering deployment pipeline: ${pipeline.name}`);

    try {
      // Validate pipeline definition
      await this.validatePipelineDefinition(pipeline);

      // Optimize pipeline configuration
      const optimizedPipeline = await this.optimizePipeline(pipeline);

      // Store pipeline
      this.pipelineRegistry.set(pipeline.id, optimizedPipeline);

      // Setup environment configurations
      await this.environmentManager.setupPipelineEnvironments(optimizedPipeline);

      // Save to persistent storage
      await this.savePipelineDefinition(optimizedPipeline);

      this.emit('pipeline:registered', { pipelineId: pipeline.id, pipeline: optimizedPipeline });
      console.log(`✅ Pipeline ${pipeline.name} registered successfully`);

    } catch (error) {
      console.error(`❌ Failed to register pipeline ${pipeline.name}:`, error);
      throw error;
    }
  }

  /**
   * Deploy services using a pipeline
   */
  public async deployServices(
    projectId: string,
    pipeline: DeploymentPipeline,
    services: string[],
    targetEnvironment: string,
    parameters: Record<string, any> = {}
  ): Promise<string> {
    console.log(`🚀 Deploying services: ${services.join(', ')} to ${targetEnvironment}`);

    try {
      // Validate deployment request
      await this.validateDeploymentRequest(pipeline, services, targetEnvironment);

      // Create deployment execution
      const deployment: DeploymentExecution = {
        id: `deploy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        pipelineId: pipeline.id,
        status: 'pending',
        startTime: new Date(),
        services,
        targetEnvironment,
        version: parameters.version || 'latest',
        currentStage: undefined,
        completedStages: [],
        failedStages: [],
        completedTasks: [],
        failedTasks: [],
        totalTasks: this.countPipelineTasks(pipeline),
        progress: 0,
        configuration: parameters.configuration || {},
        parameters,
        deploymentArtifacts: [],
        serviceEndpoints: [],
        healthCheckResults: [],
        metrics: this.initializeDeploymentMetrics(),
        logs: [],
        errors: []
      };

      // Store deployment
      this.activeDeployments.set(deployment.id, deployment);

      // Prepare rollback plan
      deployment.rollbackPlan = await this.rollbackManager.createRollbackPlan(
        deployment,
        pipeline.rollbackStrategy
      );

      // Start deployment execution
      await this.startDeploymentExecution(deployment, pipeline);

      this.emit('deployment:started', {
        deploymentId: deployment.id,
        projectId,
        services,
        targetEnvironment
      });

      console.log(`✅ Deployment started: ${deployment.id}`);
      return deployment.id;

    } catch (error) {
      console.error(`❌ Failed to deploy services:`, error);
      throw error;
    }
  }

  /**
   * Get deployment status
   */
  public getDeploymentStatus(deploymentId: string): DeploymentExecution | undefined {
    return this.activeDeployments.get(deploymentId);
  }

  /**
   * Get all active deployments for a project
   */
  public getProjectDeployments(projectId: string): DeploymentExecution[] {
    return Array.from(this.activeDeployments.values())
      .filter(deployment => deployment.projectId === projectId);
  }

  /**
   * Cancel a deployment
   */
  public async cancelDeployment(deploymentId: string, reason: string = 'User cancelled'): Promise<void> {
    console.log(`🛑 Cancelling deployment: ${deploymentId}`);

    const deployment = this.activeDeployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    try {
      // Stop current deployment tasks
      await this.pipelineExecutor.cancelDeployment(deploymentId);

      // Update deployment status
      deployment.status = 'cancelled';
      deployment.endTime = new Date();
      deployment.errors.push({
        timestamp: new Date(),
        type: 'cancellation',
        message: reason,
        context: { deploymentId },
        recoverable: false,
        retryable: false
      });

      // Trigger rollback if necessary
      if (deployment.completedStages.length > 0) {
        await this.triggerRollback(deployment, 'Deployment cancelled');
      }

      // Move to history
      await this.moveDeploymentToHistory(deployment);

      this.emit('deployment:cancelled', {
        deploymentId,
        projectId: deployment.projectId,
        reason
      });

      console.log(`✅ Deployment cancelled: ${deploymentId}`);

    } catch (error) {
      console.error(`❌ Failed to cancel deployment ${deploymentId}:`, error);
      throw error;
    }
  }

  /**
   * Rollback a deployment
   */
  public async rollbackDeployment(
    deploymentId: string,
    reason: string = 'Manual rollback'
  ): Promise<string> {
    console.log(`🔄 Rolling back deployment: ${deploymentId}`);

    const deployment = this.activeDeployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    if (!deployment.rollbackPlan) {
      throw new Error(`No rollback plan available for deployment ${deploymentId}`);
    }

    try {
      // Execute rollback
      const rollbackExecution = await this.rollbackManager.executeRollback(
        deployment.rollbackPlan,
        { reason, triggeredBy: 'manual' }
      );

      // Update deployment
      deployment.rollbackExecution = rollbackExecution;
      deployment.status = 'rolled_back';

      this.emit('deployment:rollback_started', {
        deploymentId,
        rollbackExecutionId: rollbackExecution.id,
        reason
      });

      console.log(`✅ Rollback started: ${rollbackExecution.id}`);
      return rollbackExecution.id;

    } catch (error) {
      console.error(`❌ Failed to rollback deployment ${deploymentId}:`, error);
      throw error;
    }
  }

  /**
   * Get deployment metrics and analytics
   */
  public async getDeploymentMetrics(deploymentId: string): Promise<DeploymentMetrics> {
    const deployment = this.activeDeployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    return await this.metricsCollector.calculateDeploymentMetrics(deployment);
  }

  /**
   * Get deployment logs
   */
  public getDeploymentLogs(deploymentId: string): DeploymentLog[] {
    const deployment = this.activeDeployments.get(deploymentId);
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`);
    }

    return deployment.logs;
  }

  /**
   * Get global deployment statistics
   */
  public getGlobalStatistics(): any {
    return {
      totalPipelines: this.pipelineRegistry.size,
      activeDeployments: this.activeDeployments.size,
      totalDeployments: Array.from(this.deploymentHistory.values())
        .reduce((sum, deployments) => sum + deployments.length, this.activeDeployments.size),
      successRate: this.calculateGlobalSuccessRate(),
      averageDeploymentTime: this.calculateAverageDeploymentTime(),
      rollbackRate: this.calculateRollbackRate()
    };
  }

  // Private methods

  private initializeComponents(): void {
    this.pipelineExecutor = new PipelineExecutor(this.config);
    this.environmentManager = new EnvironmentManager(this.config);
    this.serviceDeployer = new ServiceDeployer(this.config);
    this.healthChecker = new HealthChecker(this.config);
    this.rollbackManager = new RollbackManager(this.config);
    this.deploymentMonitor = new DeploymentMonitor(this.config);
    this.metricsCollector = new DeploymentMetricsCollector(this.config);
    this.securityScanner = new SecurityScanner(this.config);
    this.qualityValidator = new QualityValidator(this.config);

    // Setup event handling
    this.setupEventHandling();
  }

  private setupEventHandling(): void {
    this.pipelineExecutor.on('stage:completed', this.handleStageCompleted.bind(this));
    this.pipelineExecutor.on('stage:failed', this.handleStageFailed.bind(this));
    this.pipelineExecutor.on('task:completed', this.handleTaskCompleted.bind(this));
    this.pipelineExecutor.on('task:failed', this.handleTaskFailed.bind(this));
    this.healthChecker.on('health:check:failed', this.handleHealthCheckFailed.bind(this));
    this.rollbackManager.on('rollback:completed', this.handleRollbackCompleted.bind(this));
    this.rollbackManager.on('rollback:failed', this.handleRollbackFailed.bind(this));
  }

  private async validatePipelineDefinition(pipeline: DeploymentPipeline): Promise<void> {
    if (!pipeline.id || !pipeline.name || !pipeline.stages || pipeline.stages.length === 0) {
      throw new Error('Invalid pipeline definition: missing required fields');
    }

    // Validate stages
    for (const stage of pipeline.stages) {
      if (!stage.id || !stage.name || !stage.deploymentTasks || stage.deploymentTasks.length === 0) {
        throw new Error(`Invalid stage definition: ${stage.id}`);
      }

      // Validate tasks
      for (const task of stage.deploymentTasks) {
        if (!task.id || !task.name || !task.type) {
          throw new Error(`Invalid task definition: ${task.id}`);
        }
      }
    }

    // Validate environments
    for (const environment of pipeline.environments) {
      await this.environmentManager.validateEnvironment(environment);
    }
  }

  private async validateDeploymentRequest(
    pipeline: DeploymentPipeline,
    services: string[],
    targetEnvironment: string
  ): Promise<void> {
    // Validate target environment exists
    const environment = pipeline.environments.find(env => env.name === targetEnvironment);
    if (!environment) {
      throw new Error(`Environment ${targetEnvironment} not found in pipeline`);
    }

    // Validate services
    for (const service of services) {
      await this.serviceDeployer.validateService(service);
    }

    // Check environment availability
    await this.environmentManager.checkEnvironmentAvailability(targetEnvironment);
  }

  private async optimizePipeline(pipeline: DeploymentPipeline): Promise<DeploymentPipeline> {
    // Optimize pipeline stages and tasks for better performance
    return pipeline; // Simplified implementation
  }

  private countPipelineTasks(pipeline: DeploymentPipeline): number {
    return pipeline.stages.reduce((total, stage) => total + stage.deploymentTasks.length, 0);
  }

  private initializeDeploymentMetrics(): DeploymentMetrics {
    return {
      deploymentTime: 0,
      taskCompletionTimes: {},
      resourceUtilization: {},
      successRate: 0,
      errorRate: 0,
      rollbackRate: 0,
      serviceStartupTimes: {},
      healthCheckResults: {},
      deploymentCosts: {},
      totalCost: 0
    };
  }

  private async startDeploymentExecution(
    deployment: DeploymentExecution,
    pipeline: DeploymentPipeline
  ): Promise<void> {
    deployment.status = 'running';

    // Start pipeline execution
    await this.pipelineExecutor.executeDeploymentPipeline(deployment, pipeline);

    // Start health monitoring
    await this.healthChecker.startHealthMonitoring(deployment.id, deployment.services);

    // Start metrics collection
    await this.metricsCollector.startMetricsCollection(deployment.id);
  }

  private async handleStageCompleted(event: any): Promise<void> {
    const { deploymentId, stageId } = event;
    const deployment = this.activeDeployments.get(deploymentId);

    if (deployment) {
      deployment.completedStages.push(stageId);

      // Check if deployment is completed
      const pipeline = this.pipelineRegistry.get(deployment.pipelineId);
      if (pipeline && deployment.completedStages.length === pipeline.stages.length) {
        await this.completeDeployment(deployment);
      }
    }
  }

  private async handleStageFailed(event: any): Promise<void> {
    const { deploymentId, stageId, error } = event;
    const deployment = this.activeDeployments.get(deploymentId);

    if (deployment) {
      deployment.failedStages.push(stageId);
      deployment.errors.push({
        timestamp: new Date(),
        stage: stageId,
        type: 'stage_failure',
        message: error,
        context: event,
        recoverable: false,
        retryable: true
      });

      // Trigger automatic rollback if configured
      const pipeline = this.pipelineRegistry.get(deployment.pipelineId);
      if (pipeline?.rollbackStrategy.automatic) {
        await this.triggerRollback(deployment, `Stage ${stageId} failed: ${error}`);
      } else {
        await this.failDeployment(deployment, error);
      }
    }
  }

  private async handleTaskCompleted(event: any): Promise<void> {
    const { deploymentId, taskId, stageId, outputs, artifacts } = event;
    const deployment = this.activeDeployments.get(deploymentId);

    if (deployment) {
      const taskResult: DeploymentTaskResult = {
        taskId,
        stageId,
        status: 'completed',
        startTime: event.startTime,
        endTime: new Date(),
        duration: Date.now() - event.startTime.getTime(),
        outputs,
        artifacts: artifacts || [],
        retryCount: event.retryCount || 0
      };

      deployment.completedTasks.push(taskResult);
      deployment.progress = (deployment.completedTasks.length / deployment.totalTasks) * 100;

      // Add artifacts
      if (artifacts) {
        deployment.deploymentArtifacts.push(...artifacts);
      }
    }
  }

  private async handleTaskFailed(event: any): Promise<void> {
    const { deploymentId, taskId, stageId, error } = event;
    const deployment = this.activeDeployments.get(deploymentId);

    if (deployment) {
      const taskResult: DeploymentTaskResult = {
        taskId,
        stageId,
        status: 'failed',
        startTime: event.startTime,
        endTime: new Date(),
        duration: Date.now() - event.startTime.getTime(),
        outputs: {},
        artifacts: [],
        error,
        retryCount: event.retryCount || 0
      };

      deployment.failedTasks.push(taskResult);
      deployment.errors.push({
        timestamp: new Date(),
        task: taskId,
        stage: stageId,
        type: 'task_failure',
        message: error,
        context: event,
        recoverable: true,
        retryable: true
      });
    }
  }

  private async handleHealthCheckFailed(event: any): Promise<void> {
    const { deploymentId, serviceName, error } = event;
    const deployment = this.activeDeployments.get(deploymentId);

    if (deployment) {
      deployment.errors.push({
        timestamp: new Date(),
        type: 'health_check_failure',
        message: `Health check failed for service ${serviceName}: ${error}`,
        context: event,
        recoverable: true,
        retryable: true
      });

      // Consider triggering rollback based on configuration
      const pipeline = this.pipelineRegistry.get(deployment.pipelineId);
      const shouldRollback = pipeline?.rollbackStrategy.triggers.includes('health_check_failure');

      if (shouldRollback) {
        await this.triggerRollback(deployment, `Health check failed for ${serviceName}`);
      }
    }
  }

  private async handleRollbackCompleted(event: any): Promise<void> {
    const { deploymentId, rollbackExecutionId } = event;
    const deployment = this.activeDeployments.get(deploymentId);

    if (deployment && deployment.rollbackExecution) {
      deployment.rollbackExecution.status = 'completed';
      deployment.rollbackExecution.endTime = new Date();
      deployment.status = 'rolled_back';
      deployment.endTime = new Date();

      await this.moveDeploymentToHistory(deployment);

      this.emit('deployment:rollback_completed', { deploymentId, rollbackExecutionId });
      console.log(`✅ Deployment rollback completed: ${deploymentId}`);
    }
  }

  private async handleRollbackFailed(event: any): Promise<void> {
    const { deploymentId, rollbackExecutionId, error } = event;
    const deployment = this.activeDeployments.get(deploymentId);

    if (deployment && deployment.rollbackExecution) {
      deployment.rollbackExecution.status = 'failed';
      deployment.rollbackExecution.endTime = new Date();
      deployment.status = 'failed';
      deployment.endTime = new Date();

      deployment.errors.push({
        timestamp: new Date(),
        type: 'rollback_failure',
        message: `Rollback failed: ${error}`,
        context: event,
        recoverable: false,
        retryable: false
      });

      await this.moveDeploymentToHistory(deployment);

      this.emit('deployment:rollback_failed', { deploymentId, rollbackExecutionId, error });
      console.error(`❌ Deployment rollback failed: ${deploymentId} - ${error}`);
    }
  }

  private async completeDeployment(deployment: DeploymentExecution): Promise<void> {
    // Run post-deployment health checks
    const healthResults = await this.healthChecker.runPostDeploymentChecks(
      deployment.id,
      deployment.services
    );
    deployment.healthCheckResults = healthResults;

    // Verify all services are healthy
    const allHealthy = healthResults.every(result => result.status === 'healthy');

    if (allHealthy) {
      deployment.status = 'completed';
      deployment.endTime = new Date();
      deployment.progress = 100;

      // Calculate final metrics
      deployment.metrics = await this.metricsCollector.calculateDeploymentMetrics(deployment);

      await this.moveDeploymentToHistory(deployment);

      this.emit('deployment:completed', {
        deploymentId: deployment.id,
        projectId: deployment.projectId,
        services: deployment.services,
        targetEnvironment: deployment.targetEnvironment,
        metrics: deployment.metrics
      });

      console.log(`✅ Deployment completed successfully: ${deployment.id}`);
    } else {
      // Trigger rollback due to health check failures
      await this.triggerRollback(deployment, 'Post-deployment health checks failed');
    }
  }

  private async failDeployment(deployment: DeploymentExecution, error: string): Promise<void> {
    deployment.status = 'failed';
    deployment.endTime = new Date();

    await this.moveDeploymentToHistory(deployment);

    this.emit('deployment:failed', {
      deploymentId: deployment.id,
      projectId: deployment.projectId,
      error
    });

    console.error(`❌ Deployment failed: ${deployment.id} - ${error}`);
  }

  private async triggerRollback(deployment: DeploymentExecution, reason: string): Promise<void> {
    if (!deployment.rollbackPlan) {
      await this.failDeployment(deployment, `Rollback required but no rollback plan available: ${reason}`);
      return;
    }

    console.log(`🔄 Triggering automatic rollback for deployment: ${deployment.id}`);

    try {
      const rollbackExecution = await this.rollbackManager.executeRollback(
        deployment.rollbackPlan,
        { reason, triggeredBy: 'automatic' }
      );

      deployment.rollbackExecution = rollbackExecution;

      this.emit('deployment:rollback_triggered', {
        deploymentId: deployment.id,
        rollbackExecutionId: rollbackExecution.id,
        reason
      });

    } catch (error) {
      console.error(`❌ Failed to trigger rollback:`, error);
      await this.failDeployment(deployment, `Rollback failed: ${error}`);
    }
  }

  private async moveDeploymentToHistory(deployment: DeploymentExecution): Promise<void> {
    // Remove from active deployments
    this.activeDeployments.delete(deployment.id);

    // Add to history
    const projectHistory = this.deploymentHistory.get(deployment.projectId) || [];
    projectHistory.push(deployment);
    this.deploymentHistory.set(deployment.projectId, projectHistory);

    // Save to persistent storage
    await this.saveDeploymentHistory(deployment);
  }

  private calculateGlobalSuccessRate(): number {
    const allDeployments = [
      ...Array.from(this.activeDeployments.values()),
      ...Array.from(this.deploymentHistory.values()).flat()
    ];

    if (allDeployments.length === 0) return 0;

    const successfulDeployments = allDeployments.filter(d => d.status === 'completed');
    return (successfulDeployments.length / allDeployments.length) * 100;
  }

  private calculateAverageDeploymentTime(): number {
    const completedDeployments = [
      ...Array.from(this.activeDeployments.values()),
      ...Array.from(this.deploymentHistory.values()).flat()
    ].filter(d => d.status === 'completed' && d.endTime);

    if (completedDeployments.length === 0) return 0;

    const totalTime = completedDeployments.reduce((sum, deployment) => {
      const duration = deployment.endTime!.getTime() - deployment.startTime.getTime();
      return sum + duration;
    }, 0);

    return totalTime / completedDeployments.length;
  }

  private calculateRollbackRate(): number {
    const allDeployments = [
      ...Array.from(this.activeDeployments.values()),
      ...Array.from(this.deploymentHistory.values()).flat()
    ];

    if (allDeployments.length === 0) return 0;

    const rolledBackDeployments = allDeployments.filter(d => d.status === 'rolled_back');
    return (rolledBackDeployments.length / allDeployments.length) * 100;
  }

  private startBackgroundProcesses(): void {
    // Start periodic cleanup
    setInterval(() => {
      this.cleanupOldDeployments();
    }, 3600000); // Every hour

    // Start metrics collection
    setInterval(() => {
      this.collectGlobalMetrics();
    }, 60000); // Every minute
  }

  private async cleanupOldDeployments(): Promise<void> {
    const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago

    for (const [projectId, deployments] of this.deploymentHistory.entries()) {
      const recentDeployments = deployments.filter(
        deployment => deployment.endTime && deployment.endTime.getTime() > cutoffTime
      );
      this.deploymentHistory.set(projectId, recentDeployments);
    }
  }

  private async collectGlobalMetrics(): Promise<void> {
    const metrics = this.getGlobalStatistics();
    await this.metricsCollector.storeGlobalMetrics(metrics);
  }

  private async loadPipelineRegistry(): Promise<void> {
    // Load pipeline definitions from persistent storage
  }

  private async loadActiveDeployments(): Promise<void> {
    // Load active deployments from persistent storage
  }

  private async savePipelineDefinition(pipeline: DeploymentPipeline): Promise<void> {
    // Save pipeline definition to persistent storage
  }

  private async saveDeploymentHistory(deployment: DeploymentExecution): Promise<void> {
    // Save deployment to persistent storage
  }
}

// Supporting classes (simplified implementations)
class PipelineExecutor extends EventEmitter {
  constructor(private config: ProjectOrchestrationConfig) { super(); }
  async initialize(): Promise<void> { }
  async executeDeploymentPipeline(deployment: DeploymentExecution, pipeline: DeploymentPipeline): Promise<void> { }
  async cancelDeployment(deploymentId: string): Promise<void> { }
}

class EnvironmentManager {
  constructor(private config: ProjectOrchestrationConfig) { }
  async initialize(): Promise<void> { }
  async setupPipelineEnvironments(pipeline: DeploymentPipeline): Promise<void> { }
  async validateEnvironment(environment: DeploymentEnvironment): Promise<void> { }
  async checkEnvironmentAvailability(environmentName: string): Promise<void> { }
}

class ServiceDeployer {
  constructor(private config: ProjectOrchestrationConfig) { }
  async initialize(): Promise<void> { }
  async validateService(serviceName: string): Promise<void> { }
}

class HealthChecker extends EventEmitter {
  constructor(private config: ProjectOrchestrationConfig) { super(); }
  async initialize(): Promise<void> { }
  async startHealthMonitoring(deploymentId: string, services: string[]): Promise<void> { }
  async runPostDeploymentChecks(deploymentId: string, services: string[]): Promise<HealthCheckResult[]> {
    return [];
  }
}

class RollbackManager extends EventEmitter {
  constructor(private config: ProjectOrchestrationConfig) { super(); }
  async initialize(): Promise<void> { }
  async createRollbackPlan(deployment: DeploymentExecution, strategy: RollbackStrategy): Promise<RollbackPlan> {
    return {
      id: `rollback-${Date.now()}`,
      strategy,
      triggers: [],
      steps: [],
      verification: [],
      timeout: 300000
    };
  }
  async executeRollback(plan: RollbackPlan, context: any): Promise<RollbackExecution> {
    return {
      id: `rollback-exec-${Date.now()}`,
      planId: plan.id,
      status: 'pending',
      startTime: new Date(),
      completedSteps: [],
      failedSteps: [],
      results: {}
    };
  }
}

class DeploymentMonitor {
  constructor(private config: ProjectOrchestrationConfig) { }
  async initialize(): Promise<void> { }
}

class DeploymentMetricsCollector {
  constructor(private config: ProjectOrchestrationConfig) { }
  async initialize(): Promise<void> { }
  async startMetricsCollection(deploymentId: string): Promise<void> { }
  async calculateDeploymentMetrics(deployment: DeploymentExecution): Promise<DeploymentMetrics> {
    return {
      deploymentTime: 0,
      taskCompletionTimes: {},
      resourceUtilization: {},
      successRate: 100,
      errorRate: 0,
      rollbackRate: 0,
      serviceStartupTimes: {},
      healthCheckResults: {},
      deploymentCosts: {},
      totalCost: 0
    };
  }
  async storeGlobalMetrics(metrics: any): Promise<void> { }
}

class SecurityScanner {
  constructor(private config: ProjectOrchestrationConfig) { }
  async initialize(): Promise<void> { }
}

class QualityValidator {
  constructor(private config: ProjectOrchestrationConfig) { }
  async initialize(): Promise<void> { }
}

export default DeploymentManager;
