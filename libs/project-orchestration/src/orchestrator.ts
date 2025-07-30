/**
 * CODAI Project Orchestration Engine - Core Orchestrator
 * Master system for complex multi-service workflow management and coordination
 */

import { EventEmitter } from 'events';
import {
  ProjectOrchestrationConfig,
  WorkflowDefinition,
  DeploymentPipeline,
  ResourcePool,
  DependencyGraph,
  ProgressTracker,
  OrchestrationEvent,
  OrchestrationState,
  PerformanceProfile,
  QualityGateConfig,
  SecurityPolicyConfig
} from './types.js';
import { WorkflowManager } from './workflow/manager.js';
import { DeploymentManager } from './deployment/manager.js';
import { ResourceManager } from './resource/manager.js';
import { DependencyAnalyzer } from './dependency/analyzer.js';
import { ProgressManager } from './progress/manager.js';
import { SecurityManager } from './security/manager.js';
import { QualityGateManager } from './quality/manager.js';
import { EventProcessor } from './events/processor.js';
import { StateManager } from './state/manager.js';
import { MonitoringSystem } from './monitoring/system.js';
import { AlertingSystem } from './alerting/system.js';
import { ReportingEngine } from './reporting/engine.js';

/**
 * Core Project Orchestration Engine
 * Manages complex multi-service projects with automated workflows and intelligent coordination
 */
export class ProjectOrchestrationEngine extends EventEmitter {
  private config: ProjectOrchestrationConfig;
  private isInitialized: boolean = false;
  private isRunning: boolean = false;

  // Core Management Systems
  private workflowManager: WorkflowManager;
  private deploymentManager: DeploymentManager;
  private resourceManager: ResourceManager;
  private dependencyAnalyzer: DependencyAnalyzer;
  private progressManager: ProgressManager;
  private securityManager: SecurityManager;
  private qualityGateManager: QualityGateManager;

  // Supporting Systems
  private eventProcessor: EventProcessor;
  private stateManager: StateManager;
  private monitoringSystem: MonitoringSystem;
  private alertingSystem: AlertingSystem;
  private reportingEngine: ReportingEngine;

  // Internal State
  private activeProjects: Map<string, OrchestrationState> = new Map();
  private workflowRegistry: Map<string, WorkflowDefinition> = new Map();
  private resourcePools: Map<string, ResourcePool> = new Map();
  private deploymentPipelines: Map<string, DeploymentPipeline> = new Map();

  constructor(config: ProjectOrchestrationConfig) {
    super();
    this.config = config;
    this.initializeManagers();
  }

  /**
   * Initialize all management systems
   */
  private initializeManagers(): void {
    console.log('🔧 Initializing Project Orchestration Engine...');

    // Core Managers
    this.workflowManager = new WorkflowManager(this.config);
    this.deploymentManager = new DeploymentManager(this.config);
    this.resourceManager = new ResourceManager(this.config);
    this.dependencyAnalyzer = new DependencyAnalyzer(this.config);
    this.progressManager = new ProgressManager(this.config);
    this.securityManager = new SecurityManager(this.config);
    this.qualityGateManager = new QualityGateManager(this.config);

    // Supporting Systems
    this.eventProcessor = new EventProcessor(this.config);
    this.stateManager = new StateManager(this.config);
    this.monitoringSystem = new MonitoringSystem(this.config);
    this.alertingSystem = new AlertingSystem(this.config);
    this.reportingEngine = new ReportingEngine(this.config);

    // Setup event handling
    this.setupEventHandling();

    console.log('✅ Project Orchestration Engine initialized successfully');
  }

  /**
   * Start the orchestration engine
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ Orchestration Engine is already running');
      return;
    }

    try {
      console.log('🚀 Starting Project Orchestration Engine...');

      // Initialize all systems
      await this.initializeSystems();

      // Load existing state
      await this.loadExistingState();

      // Start monitoring and processing
      await this.startSystemProcessing();

      this.isRunning = true;
      this.isInitialized = true;

      this.emit('orchestrator:started');
      console.log('✅ Project Orchestration Engine started successfully');

    } catch (error) {
      console.error('❌ Failed to start Orchestration Engine:', error);
      throw error;
    }
  }

  /**
   * Stop the orchestration engine
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('⚠️ Orchestration Engine is not running');
      return;
    }

    try {
      console.log('🛑 Stopping Project Orchestration Engine...');

      // Gracefully stop all systems
      await this.stopSystemProcessing();

      // Save current state
      await this.saveCurrentState();

      // Cleanup resources
      await this.cleanupResources();

      this.isRunning = false;

      this.emit('orchestrator:stopped');
      console.log('✅ Project Orchestration Engine stopped successfully');

    } catch (error) {
      console.error('❌ Failed to stop Orchestration Engine:', error);
      throw error;
    }
  }

  /**
   * Create a new orchestrated project
   */
  public async createProject(projectConfig: {
    id: string;
    name: string;
    description: string;
    type: string;
    workflows: string[];
    resources: string[];
    dependencies: string[];
    securityPolicies: string[];
    qualityGates: string[];
  }): Promise<OrchestrationState> {
    console.log(`🆕 Creating orchestrated project: ${projectConfig.name}`);

    try {
      // Validate project configuration
      await this.validateProjectConfiguration(projectConfig);

      // Analyze dependencies
      const dependencyGraph = await this.dependencyAnalyzer.analyzeDependencies(
        projectConfig.id,
        projectConfig.dependencies
      );

      // Allocate initial resources
      const resourceAllocations = await this.resourceManager.allocateResources(
        projectConfig.id,
        projectConfig.resources
      );

      // Setup security policies
      await this.securityManager.applySecurityPolicies(
        projectConfig.id,
        projectConfig.securityPolicies
      );

      // Configure quality gates
      await this.qualityGateManager.setupQualityGates(
        projectConfig.id,
        projectConfig.qualityGates
      );

      // Create initial project state
      const projectState: OrchestrationState = {
        projectId: projectConfig.id,
        currentPhase: 'initialization',
        activeWorkflows: [],
        resourceAllocations: resourceAllocations.map(r => r.id),
        stateHistory: [],
        transitions: [],
        context: {
          projectConfig,
          dependencyGraph,
          resourceAllocations,
          createdAt: new Date()
        },
        locks: [],
        version: 1,
        lastUpdated: new Date(),
        checksum: this.calculateStateChecksum({})
      };

      // Store project state
      this.activeProjects.set(projectConfig.id, projectState);
      await this.stateManager.saveProjectState(projectState);

      // Initialize progress tracking
      await this.progressManager.initializeTracking(projectConfig.id);

      // Start monitoring
      await this.monitoringSystem.startProjectMonitoring(projectConfig.id);

      this.emit('project:created', { projectId: projectConfig.id, state: projectState });
      console.log(`✅ Project ${projectConfig.name} created successfully`);

      return projectState;

    } catch (error) {
      console.error(`❌ Failed to create project ${projectConfig.name}:`, error);
      throw error;
    }
  }

  /**
   * Execute workflow for a project
   */
  public async executeWorkflow(
    projectId: string,
    workflowId: string,
    parameters: Record<string, any> = {}
  ): Promise<string> {
    console.log(`🔄 Executing workflow ${workflowId} for project ${projectId}`);

    try {
      // Validate project exists
      const projectState = this.activeProjects.get(projectId);
      if (!projectState) {
        throw new Error(`Project ${projectId} not found`);
      }

      // Get workflow definition
      const workflow = this.workflowRegistry.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Check security policies
      await this.securityManager.validateWorkflowExecution(projectId, workflowId);

      // Verify resource availability
      await this.resourceManager.verifyResourceAvailability(projectId, workflow.resourceRequirements);

      // Check dependencies
      await this.dependencyAnalyzer.validateDependencies(projectId, workflow.dependencies);

      // Execute workflow
      const executionId = await this.workflowManager.executeWorkflow(
        projectId,
        workflow,
        parameters
      );

      // Update project state
      projectState.activeWorkflows.push(executionId);
      projectState.lastUpdated = new Date();
      projectState.version++;

      await this.stateManager.saveProjectState(projectState);

      this.emit('workflow:started', { projectId, workflowId, executionId });
      console.log(`✅ Workflow ${workflowId} started with execution ID: ${executionId}`);

      return executionId;

    } catch (error) {
      console.error(`❌ Failed to execute workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Deploy services for a project
   */
  public async deployServices(
    projectId: string,
    pipelineId: string,
    services: string[],
    targetEnvironment: string
  ): Promise<string> {
    console.log(`🚀 Deploying services for project ${projectId} to ${targetEnvironment}`);

    try {
      // Validate project and pipeline
      const projectState = this.activeProjects.get(projectId);
      if (!projectState) {
        throw new Error(`Project ${projectId} not found`);
      }

      const pipeline = this.deploymentPipelines.get(pipelineId);
      if (!pipeline) {
        throw new Error(`Deployment pipeline ${pipelineId} not found`);
      }

      // Run pre-deployment quality gates
      await this.qualityGateManager.executeQualityGates(
        projectId,
        'pre-deployment',
        { services, targetEnvironment }
      );

      // Execute deployment
      const deploymentId = await this.deploymentManager.deployServices(
        projectId,
        pipeline,
        services,
        targetEnvironment
      );

      // Update progress tracking
      await this.progressManager.trackDeployment(projectId, deploymentId);

      this.emit('deployment:started', { projectId, deploymentId, services, targetEnvironment });
      console.log(`✅ Deployment started with ID: ${deploymentId}`);

      return deploymentId;

    } catch (error) {
      console.error(`❌ Failed to deploy services:`, error);
      throw error;
    }
  }

  /**
   * Get project status and metrics
   */
  public async getProjectStatus(projectId: string): Promise<{
    state: OrchestrationState;
    progress: any;
    resources: any;
    dependencies: any;
    security: any;
    quality: any;
    performance: PerformanceProfile;
  }> {
    const projectState = this.activeProjects.get(projectId);
    if (!projectState) {
      throw new Error(`Project ${projectId} not found`);
    }

    const [progress, resources, dependencies, security, quality, performance] = await Promise.all([
      this.progressManager.getProjectProgress(projectId),
      this.resourceManager.getProjectResources(projectId),
      this.dependencyAnalyzer.getDependencyStatus(projectId),
      this.securityManager.getSecurityStatus(projectId),
      this.qualityGateManager.getQualityStatus(projectId),
      this.monitoringSystem.getPerformanceProfile(projectId)
    ]);

    return {
      state: projectState,
      progress,
      resources,
      dependencies,
      security,
      quality,
      performance
    };
  }

  /**
   * Register a new workflow definition
   */
  public async registerWorkflow(workflow: WorkflowDefinition): Promise<void> {
    console.log(`📝 Registering workflow: ${workflow.name}`);

    try {
      // Validate workflow definition
      await this.validateWorkflowDefinition(workflow);

      // Store workflow
      this.workflowRegistry.set(workflow.id, workflow);

      // Update workflow manager
      await this.workflowManager.registerWorkflow(workflow);

      this.emit('workflow:registered', { workflowId: workflow.id });
      console.log(`✅ Workflow ${workflow.name} registered successfully`);

    } catch (error) {
      console.error(`❌ Failed to register workflow ${workflow.name}:`, error);
      throw error;
    }
  }

  /**
   * Register a deployment pipeline
   */
  public async registerDeploymentPipeline(pipeline: DeploymentPipeline): Promise<void> {
    console.log(`🔧 Registering deployment pipeline: ${pipeline.name}`);

    try {
      // Validate pipeline definition
      await this.validatePipelineDefinition(pipeline);

      // Store pipeline
      this.deploymentPipelines.set(pipeline.id, pipeline);

      // Update deployment manager
      await this.deploymentManager.registerPipeline(pipeline);

      this.emit('pipeline:registered', { pipelineId: pipeline.id });
      console.log(`✅ Pipeline ${pipeline.name} registered successfully`);

    } catch (error) {
      console.error(`❌ Failed to register pipeline ${pipeline.name}:`, error);
      throw error;
    }
  }

  /**
   * Register a resource pool
   */
  public async registerResourcePool(pool: ResourcePool): Promise<void> {
    console.log(`💾 Registering resource pool: ${pool.name}`);

    try {
      // Validate resource pool
      await this.validateResourcePool(pool);

      // Store resource pool
      this.resourcePools.set(pool.id, pool);

      // Update resource manager
      await this.resourceManager.registerResourcePool(pool);

      this.emit('resource_pool:registered', { poolId: pool.id });
      console.log(`✅ Resource pool ${pool.name} registered successfully`);

    } catch (error) {
      console.error(`❌ Failed to register resource pool ${pool.name}:`, error);
      throw error;
    }
  }

  /**
   * Generate comprehensive project report
   */
  public async generateProjectReport(
    projectId: string,
    reportType: 'summary' | 'detailed' | 'executive'
  ): Promise<any> {
    console.log(`📊 Generating ${reportType} report for project ${projectId}`);

    try {
      const projectStatus = await this.getProjectStatus(projectId);

      return await this.reportingEngine.generateProjectReport(
        projectId,
        reportType,
        projectStatus
      );

    } catch (error) {
      console.error(`❌ Failed to generate report:`, error);
      throw error;
    }
  }

  /**
   * Get global orchestration metrics
   */
  public async getGlobalMetrics(): Promise<any> {
    return {
      activeProjects: this.activeProjects.size,
      totalWorkflows: this.workflowRegistry.size,
      totalPipelines: this.deploymentPipelines.size,
      totalResourcePools: this.resourcePools.size,
      systemHealth: await this.monitoringSystem.getSystemHealth(),
      performance: await this.monitoringSystem.getGlobalPerformanceMetrics(),
      resourceUtilization: await this.resourceManager.getGlobalUtilization(),
      securityStatus: await this.securityManager.getGlobalSecurityStatus()
    };
  }

  // Private helper methods

  private async initializeSystems(): Promise<void> {
    const systems = [
      this.workflowManager,
      this.deploymentManager,
      this.resourceManager,
      this.dependencyAnalyzer,
      this.progressManager,
      this.securityManager,
      this.qualityGateManager,
      this.eventProcessor,
      this.stateManager,
      this.monitoringSystem,
      this.alertingSystem,
      this.reportingEngine
    ];

    for (const system of systems) {
      await system.initialize();
    }
  }

  private async loadExistingState(): Promise<void> {
    const savedProjects = await this.stateManager.loadAllProjectStates();
    for (const project of savedProjects) {
      this.activeProjects.set(project.projectId, project);
    }
  }

  private async startSystemProcessing(): Promise<void> {
    await Promise.all([
      this.eventProcessor.start(),
      this.monitoringSystem.start(),
      this.alertingSystem.start()
    ]);
  }

  private async stopSystemProcessing(): Promise<void> {
    await Promise.all([
      this.eventProcessor.stop(),
      this.monitoringSystem.stop(),
      this.alertingSystem.stop()
    ]);
  }

  private async saveCurrentState(): Promise<void> {
    const savePromises = Array.from(this.activeProjects.values()).map(
      project => this.stateManager.saveProjectState(project)
    );
    await Promise.all(savePromises);
  }

  private async cleanupResources(): Promise<void> {
    // Cleanup any system resources
    await this.resourceManager.cleanup();
  }

  private setupEventHandling(): void {
    // Setup cross-system event handling
    this.workflowManager.on('workflow:completed', this.handleWorkflowCompleted.bind(this));
    this.workflowManager.on('workflow:failed', this.handleWorkflowFailed.bind(this));
    this.deploymentManager.on('deployment:completed', this.handleDeploymentCompleted.bind(this));
    this.deploymentManager.on('deployment:failed', this.handleDeploymentFailed.bind(this));
    this.resourceManager.on('resource:allocated', this.handleResourceAllocated.bind(this));
    this.resourceManager.on('resource:released', this.handleResourceReleased.bind(this));
    this.securityManager.on('security:violation', this.handleSecurityViolation.bind(this));
    this.qualityGateManager.on('quality:gate:failed', this.handleQualityGateFailed.bind(this));
  }

  private async handleWorkflowCompleted(event: any): Promise<void> {
    const { projectId, workflowId, executionId } = event;
    console.log(`✅ Workflow completed: ${workflowId} (${executionId})`);

    const projectState = this.activeProjects.get(projectId);
    if (projectState) {
      projectState.activeWorkflows = projectState.activeWorkflows.filter(id => id !== executionId);
      projectState.lastUpdated = new Date();
      projectState.version++;
      await this.stateManager.saveProjectState(projectState);
    }

    this.emit('workflow:completed', event);
  }

  private async handleWorkflowFailed(event: any): Promise<void> {
    const { projectId, workflowId, executionId, error } = event;
    console.error(`❌ Workflow failed: ${workflowId} (${executionId}) - ${error}`);

    await this.alertingSystem.sendAlert({
      type: 'workflow_failure',
      severity: 'high',
      projectId,
      message: `Workflow ${workflowId} failed: ${error}`,
      metadata: { workflowId, executionId }
    });

    this.emit('workflow:failed', event);
  }

  private async handleDeploymentCompleted(event: any): Promise<void> {
    console.log(`✅ Deployment completed: ${event.deploymentId}`);
    this.emit('deployment:completed', event);
  }

  private async handleDeploymentFailed(event: any): Promise<void> {
    console.error(`❌ Deployment failed: ${event.deploymentId} - ${event.error}`);

    await this.alertingSystem.sendAlert({
      type: 'deployment_failure',
      severity: 'critical',
      projectId: event.projectId,
      message: `Deployment ${event.deploymentId} failed: ${event.error}`,
      metadata: event
    });

    this.emit('deployment:failed', event);
  }

  private async handleResourceAllocated(event: any): Promise<void> {
    console.log(`📦 Resource allocated: ${event.resourceId} to project ${event.projectId}`);
    this.emit('resource:allocated', event);
  }

  private async handleResourceReleased(event: any): Promise<void> {
    console.log(`📤 Resource released: ${event.resourceId} from project ${event.projectId}`);
    this.emit('resource:released', event);
  }

  private async handleSecurityViolation(event: any): Promise<void> {
    console.error(`🚨 Security violation detected: ${event.type}`);

    await this.alertingSystem.sendAlert({
      type: 'security_violation',
      severity: 'critical',
      projectId: event.projectId,
      message: `Security violation: ${event.type}`,
      metadata: event
    });

    this.emit('security:violation', event);
  }

  private async handleQualityGateFailed(event: any): Promise<void> {
    console.warn(`⚠️ Quality gate failed: ${event.gateId} for project ${event.projectId}`);

    await this.alertingSystem.sendAlert({
      type: 'quality_gate_failure',
      severity: 'medium',
      projectId: event.projectId,
      message: `Quality gate ${event.gateId} failed`,
      metadata: event
    });

    this.emit('quality:gate:failed', event);
  }

  private async validateProjectConfiguration(config: any): Promise<void> {
    // Validate project configuration
    if (!config.id || !config.name) {
      throw new Error('Project must have id and name');
    }
  }

  private async validateWorkflowDefinition(workflow: WorkflowDefinition): Promise<void> {
    // Validate workflow definition
    if (!workflow.id || !workflow.name || !workflow.stages) {
      throw new Error('Workflow must have id, name, and stages');
    }
  }

  private async validatePipelineDefinition(pipeline: DeploymentPipeline): Promise<void> {
    // Validate pipeline definition
    if (!pipeline.id || !pipeline.name || !pipeline.stages) {
      throw new Error('Pipeline must have id, name, and stages');
    }
  }

  private async validateResourcePool(pool: ResourcePool): Promise<void> {
    // Validate resource pool
    if (!pool.id || !pool.name || !pool.totalCapacity) {
      throw new Error('Resource pool must have id, name, and capacity');
    }
  }

  private calculateStateChecksum(state: any): string {
    // Simple checksum calculation (in production, use proper hashing)
    return Date.now().toString(36);
  }
}

export default ProjectOrchestrationEngine;
