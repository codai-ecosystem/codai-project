/**
 * CODAI Project Orchestration Engine - Core Types & Interfaces
 * Comprehensive type definitions for advanced project management and workflow coordination
 */

// Core Project Management Types
export interface ProjectOrchestrationConfig {
  // System Configuration
  systemSettings: {
    maxConcurrentProjects: number;
    defaultResourceAllocation: number;
    automationLevel: 'manual' | 'semi_automated' | 'fully_automated';
    scalingThresholds: ScalingThresholds;
    performanceTargets: PerformanceTargets;
  };

  // Integration Settings
  integrations: {
    cicdPipelines: CiCdConfig[];
    containerOrchestration: ContainerConfig;
    cloudProviders: CloudProviderConfig[];
    monitoringServices: MonitoringConfig[];
    communicationChannels: CommunicationConfig[];
  };

  // Quality & Compliance
  qualityGates: QualityGateConfig[];
  complianceRequirements: ComplianceConfig[];
  securityPolicies: SecurityPolicyConfig[];
}

export interface ScalingThresholds {
  cpuUtilization: number;
  memoryUtilization: number;
  requestLatency: number;
  errorRate: number;
  throughputRps: number;
}

export interface PerformanceTargets {
  responseTime: number;
  availability: number;
  throughput: number;
  errorRate: number;
  resourceEfficiency: number;
}

// Multi-Service Workflow Management
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'deployment' | 'testing' | 'integration' | 'monitoring' | 'custom';

  // Workflow Structure
  stages: WorkflowStage[];
  dependencies: WorkflowDependency[];
  parallelExecution: ParallelExecutionConfig;

  // Resource Requirements
  resourceRequirements: ResourceRequirement[];
  serviceTargets: ServiceTarget[];

  // Execution Context
  triggers: WorkflowTrigger[];
  conditions: ExecutionCondition[];

  // Monitoring & Alerting
  healthChecks: HealthCheckConfig[];
  alertingRules: AlertingRule[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  status: 'active' | 'inactive' | 'deprecated';
}

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  type: 'sequential' | 'parallel' | 'conditional';

  // Stage Configuration
  tasks: WorkflowTask[];
  timeout: number;
  retryPolicy: RetryPolicyConfig;

  // Dependencies & Prerequisites
  dependsOn: string[];
  prerequisites: PrerequisiteCheck[];

  // Resource Allocation
  resourceLimits: ResourceLimits;
  serviceBindings: ServiceBinding[];

  // Success Criteria
  successCriteria: SuccessCriteria[];
  rollbackPolicy: RollbackPolicy;
}

export interface WorkflowTask {
  id: string;
  name: string;
  type: 'build' | 'test' | 'deploy' | 'validate' | 'notify' | 'custom';

  // Task Execution
  command: string;
  arguments: string[];
  environment: Record<string, string>;
  workingDirectory: string;

  // Resource & Time Constraints
  timeout: number;
  resourceRequirements: TaskResourceRequirements;

  // Input/Output
  inputs: TaskInput[];
  outputs: TaskOutput[];
  artifacts: ArtifactConfig[];

  // Validation & Quality
  validationRules: ValidationRule[];
  qualityChecks: QualityCheck[];
}

// Automated Deployment Pipeline Types
export interface DeploymentPipeline {
  id: string;
  name: string;
  description: string;

  // Pipeline Configuration
  stages: DeploymentStage[];
  strategy: DeploymentStrategy;

  // Environment Management
  environments: DeploymentEnvironment[];
  promotionRules: PromotionRule[];

  // Rollback & Recovery
  rollbackStrategy: RollbackStrategy;
  recoveryProcedures: RecoveryProcedure[];

  // Security & Compliance
  securityScanning: SecurityScanConfig[];
  complianceChecks: ComplianceCheck[];

  // Monitoring & Observability
  monitoring: PipelineMonitoringConfig;
  logging: LoggingConfig;
  metrics: MetricsConfig;
}

export interface DeploymentStage {
  id: string;
  name: string;
  environment: string;

  // Deployment Configuration
  deploymentTasks: DeploymentTask[];
  preDeploymentHooks: Hook[];
  postDeploymentHooks: Hook[];

  // Validation & Testing
  smokeTests: TestConfig[];
  integrationTests: TestConfig[];
  performanceTests: TestConfig[];

  // Approval & Gates
  approvalRequired: boolean;
  approvers: string[];
  gateConditions: GateCondition[];

  // Monitoring & Rollback
  healthChecks: HealthCheck[];
  rollbackTriggers: RollbackTrigger[];
}

export interface DeploymentTask {
  id: string;
  name: string;
  type: 'containerDeploy' | 'databaseMigration' | 'configUpdate' | 'serviceRestart' | 'custom';

  // Task Configuration
  configuration: Record<string, any>;
  resources: string[];
  dependencies: string[];

  // Execution Settings
  parallel: boolean;
  timeout: number;
  retryPolicy: RetryPolicy;

  // Validation
  preConditions: Condition[];
  postConditions: Condition[];
  successCriteria: SuccessCriteria[];
}

// Resource Allocation & Optimization Types
export interface ResourcePool {
  id: string;
  name: string;
  type: 'compute' | 'storage' | 'network' | 'database' | 'hybrid';

  // Capacity Management
  totalCapacity: ResourceCapacity;
  availableCapacity: ResourceCapacity;
  allocatedResources: ResourceAllocation[];

  // Performance Characteristics
  performanceProfile: PerformanceProfile;
  costProfile: CostProfile;

  // Allocation Policies
  allocationPolicies: AllocationPolicy[];
  priorityRules: PriorityRule[];

  // Monitoring & Optimization
  utilizationMetrics: UtilizationMetrics;
  optimizationRules: OptimizationRule[];

  // Scaling Configuration
  autoScaling: AutoScalingConfig;
  scalingHistory: ScalingEvent[];
}

export interface ResourceCapacity {
  cpu: number; // cores
  memory: number; // GB
  storage: number; // GB
  network: number; // Mbps
  customResources: Record<string, number>;
}

export interface ResourceAllocation {
  id: string;
  projectId: string;
  serviceName: string;

  // Allocated Resources
  allocatedCapacity: ResourceCapacity;
  reservedCapacity: ResourceCapacity;

  // Allocation Metadata
  priority: 'low' | 'medium' | 'high' | 'critical';
  duration: AllocationDuration;

  // Performance & Cost
  performanceRequirements: PerformanceRequirement[];
  costConstraints: CostConstraint[];

  // Lifecycle
  createdAt: Date;
  expiresAt?: Date;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
}

// Dependency Management Types
export interface DependencyGraph {
  id: string;
  projectId: string;

  // Graph Structure
  nodes: DependencyNode[];
  edges: DependencyEdge[];

  // Analysis Results
  criticalPath: string[];
  circularDependencies: CircularDependency[];
  optimizationOpportunities: OptimizationOpportunity[];

  // Validation
  validationResults: DependencyValidation[];
  conflictResolution: ConflictResolution[];

  // Metadata
  lastAnalyzed: Date;
  complexity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DependencyNode {
  id: string;
  name: string;
  type: 'service' | 'library' | 'database' | 'external' | 'infrastructure';

  // Node Properties
  version: string;
  status: 'available' | 'pending' | 'unavailable' | 'deprecated';

  // Resource Information
  resourceRequirements: ResourceRequirement[];
  performanceCharacteristics: PerformanceCharacteristics;

  // Lifecycle Information
  lifecycle: NodeLifecycle;
  supportStatus: SupportStatus;

  // Metadata
  maintainers: string[];
  documentation: string;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;

  // Relationship Properties
  relationship: 'requires' | 'provides' | 'recommends' | 'conflicts' | 'replaces';
  strength: 'weak' | 'moderate' | 'strong' | 'critical';

  // Constraint Information
  versionConstraints: VersionConstraint[];
  platformConstraints: PlatformConstraint[];

  // Impact Analysis
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  changeFrequency: number;
  stabilityScore: number;
}

// Progress Tracking & Reporting Types
export interface ProgressTracker {
  id: string;
  projectId: string;

  // Tracking Configuration
  trackingPeriod: TrackingPeriod;
  milestones: ProjectMilestone[];

  // Progress Metrics
  overallProgress: ProgressMetrics;
  stageProgress: StageProgressMetrics[];
  teamProgress: TeamProgressMetrics[];

  // Reporting
  reports: ProgressReport[];
  dashboards: ProgressDashboard[];

  // Alerts & Notifications
  alertingRules: ProgressAlertRule[];
  notifications: NotificationConfig[];
}

export interface ProgressMetrics {
  // Completion Metrics
  completionPercentage: number;
  tasksCompleted: number;
  totalTasks: number;

  // Time Metrics
  timeSpent: number; // hours
  estimatedRemaining: number; // hours
  scheduleVariance: number; // percentage

  // Quality Metrics
  qualityScore: number;
  defectRate: number;
  reworkPercentage: number;

  // Velocity Metrics
  currentVelocity: number;
  averageVelocity: number;
  velocityTrend: 'increasing' | 'stable' | 'decreasing';

  // Resource Metrics
  resourceUtilization: number;
  budgetUtilization: number;
  teamEfficiency: number;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;

  // Timing
  plannedDate: Date;
  actualDate?: Date;

  // Status
  status: 'upcoming' | 'in_progress' | 'completed' | 'delayed' | 'at_risk';
  completionPercentage: number;

  // Criteria & Dependencies
  completionCriteria: CompletionCriteria[];
  dependencies: string[];

  // Deliverables
  deliverables: Deliverable[];
  qualityGates: QualityGate[];

  // Stakeholders
  stakeholders: string[];
  approvers: string[];
}

// Configuration Support Types
export interface CiCdConfig {
  provider: 'jenkins' | 'github_actions' | 'gitlab_ci' | 'azure_devops' | 'custom';
  endpoint: string;
  credentials: CredentialConfig;
  configuration: Record<string, any>;
}

export interface ContainerConfig {
  orchestrator: 'kubernetes' | 'docker_swarm' | 'ecs' | 'custom';
  clusters: ClusterConfig[];
  registries: RegistryConfig[];
}

export interface CloudProviderConfig {
  provider: 'aws' | 'azure' | 'gcp' | 'hybrid';
  regions: string[];
  credentials: CredentialConfig;
  services: CloudService[];
}

export interface MonitoringConfig {
  service: 'prometheus' | 'datadog' | 'new_relic' | 'custom';
  endpoint: string;
  metrics: MetricDefinition[];
  alerting: AlertingConfig;
}

export interface CommunicationConfig {
  channel: 'slack' | 'teams' | 'email' | 'webhook' | 'custom';
  configuration: Record<string, any>;
  templates: NotificationTemplate[];
}

// Event & State Management Types
export interface OrchestrationEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;

  // Event Data
  data: Record<string, any>;
  metadata: EventMetadata;

  // Processing Status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;

  // Correlation
  correlationId?: string;
  parentEventId?: string;
  childEvents: string[];
}

export interface OrchestrationState {
  projectId: string;

  // Current State
  currentPhase: string;
  activeWorkflows: string[];
  resourceAllocations: string[];

  // State History
  stateHistory: StateSnapshot[];
  transitions: StateTransition[];

  // Context
  context: Record<string, any>;
  locks: StateLock[];

  // Metadata
  version: number;
  lastUpdated: Date;
  checksum: string;
}

export interface StateSnapshot {
  timestamp: Date;
  state: Record<string, any>;
  version: number;
  trigger: string;
}

export interface StateTransition {
  id: string;
  fromState: string;
  toState: string;
  trigger: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  metadata: Record<string, any>;
}

// Performance & Quality Types
export interface PerformanceProfile {
  baseline: PerformanceBaseline;
  current: PerformanceMetrics;
  trends: PerformanceTrend[];
  benchmarks: PerformanceBenchmark[];
}

export interface PerformanceBaseline {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
}

export interface QualityGateConfig {
  id: string;
  name: string;
  stage: string;

  // Quality Criteria
  criteria: QualityCriteria[];
  thresholds: QualityThreshold[];

  // Actions
  passActions: Action[];
  failActions: Action[];

  // Configuration
  required: boolean;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface QualityCriteria {
  metric: string;
  operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq';
  value: number;
  weight: number;
  description: string;
}

// Security & Compliance Types
export interface SecurityPolicyConfig {
  id: string;
  name: string;
  type: 'access_control' | 'data_protection' | 'network_security' | 'compliance';

  // Policy Rules
  rules: SecurityRule[];
  exceptions: SecurityException[];

  // Enforcement
  enforcementLevel: 'advisory' | 'warning' | 'blocking';
  auditRequirements: AuditRequirement[];

  // Compliance
  complianceFrameworks: string[];
  lastReview: Date;
  nextReview: Date;
}

export interface ComplianceConfig {
  framework: 'sox' | 'gdpr' | 'hipaa' | 'pci_dss' | 'iso27001' | 'custom';
  requirements: ComplianceRequirement[];
  controls: ComplianceControl[];
  auditing: ComplianceAuditConfig;
}

// Utility & Support Types
export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'custom';
  baseDelay: number;
  maxDelay: number;
  retryConditions: string[];
}

export interface CredentialConfig {
  type: 'api_key' | 'token' | 'certificate' | 'username_password' | 'oauth';
  configuration: Record<string, any>;
  rotation: CredentialRotationConfig;
}

export interface MetricDefinition {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labels: string[];
  help: string;
  unit?: string;
}

// Additional specialized types for comprehensive orchestration
export interface WorkflowDependency {
  id: string;
  source: string;
  target: string;
  type: 'sequential' | 'parallel' | 'conditional';
  conditions: string[];
}

export interface ParallelExecutionConfig {
  enabled: boolean;
  maxConcurrency: number;
  resourceSharing: boolean;
  failureHandling: 'fail_fast' | 'continue' | 'partial_success';
}

export interface ResourceRequirement {
  resource: string;
  minimum: number;
  preferred: number;
  maximum: number;
  unit: string;
}

export interface ServiceTarget {
  serviceName: string;
  version: string;
  environment: string;
  configuration: Record<string, any>;
}

export interface WorkflowTrigger {
  type: 'schedule' | 'event' | 'manual' | 'api' | 'webhook';
  configuration: Record<string, any>;
  conditions: string[];
}

export interface ExecutionCondition {
  expression: string;
  variables: Record<string, any>;
  timeout?: number;
}

export interface HealthCheckConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  expectedStatus: number;
  timeout: number;
  interval: number;
  retries: number;
}

export interface AlertingRule {
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  suppressionRules: string[];
}

export interface TaskResourceRequirements {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  gpu?: number;
}

export interface TaskInput {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule;
}

export interface TaskOutput {
  name: string;
  type: string;
  description: string;
  path?: string;
}

export interface ArtifactConfig {
  name: string;
  type: 'file' | 'directory' | 'container_image' | 'package';
  path: string;
  retention: RetentionPolicy;
}

export interface ValidationRule {
  type: string;
  parameters: Record<string, any>;
  message: string;
}

export interface QualityCheck {
  type: 'code_quality' | 'security_scan' | 'performance_test' | 'compliance_check';
  configuration: Record<string, any>;
  failureAction: 'continue' | 'warn' | 'fail';
}

// Additional types for comprehensive system coverage
export interface DeploymentStrategy {
  type: 'rolling' | 'blue_green' | 'canary' | 'recreate';
  configuration: Record<string, any>;
  rollbackTriggers: string[];
}

export interface DeploymentEnvironment {
  name: string;
  type: 'development' | 'staging' | 'production' | 'test';
  configuration: EnvironmentConfig;
  resources: string[];
}

export interface PromotionRule {
  fromEnvironment: string;
  toEnvironment: string;
  criteria: PromotionCriteria[];
  approvals: ApprovalConfig[];
}

export interface RollbackStrategy {
  automatic: boolean;
  triggers: RollbackTrigger[];
  procedures: RollbackProcedure[];
  verification: VerificationStep[];
}

export interface RecoveryProcedure {
  id: string;
  name: string;
  triggers: string[];
  steps: RecoveryStep[];
  rollback: boolean;
}

export interface SecurityScanConfig {
  type: 'sast' | 'dast' | 'dependency' | 'container' | 'infrastructure';
  tool: string;
  configuration: Record<string, any>;
  thresholds: SecurityThreshold[];
}

export interface ComplianceCheck {
  framework: string;
  controls: string[];
  evidence: EvidenceRequirement[];
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly';
}

export interface PipelineMonitoringConfig {
  metrics: string[];
  dashboards: string[];
  alerts: AlertConfig[];
  reporting: ReportingConfig;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  destinations: LogDestination[];
  retention: RetentionPolicy;
  structured: boolean;
}

export interface MetricsConfig {
  collectors: MetricCollector[];
  exporters: MetricExporter[];
  aggregation: AggregationConfig;
  retention: RetentionPolicy;
}
