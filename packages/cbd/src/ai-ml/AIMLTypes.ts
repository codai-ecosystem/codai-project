import { EventEmitter } from 'events';

/**
 * MLOps Pipeline Configuration and Types
 */

export interface MLOpsPipeline {
  id: string;
  name: string;
  description: string;
  templateId: string;
  steps: WorkflowStep[];
  triggers: AutomationTrigger[];
  schedule?: string; // Cron expression
  environment: string;
  resourceRequirements: ResourceRequirements;
  gitOpsConfig?: GitOpsConfig;
  cicdConfig?: CICDIntegration;
  governancePolicy?: string;
  rollbackPolicy?: RollbackPolicy;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    tags: string[];
  };
  status: 'draft' | 'active' | 'disabled' | 'archived';
  isActive: boolean;
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  trigger: AutomationTrigger;
  parameters: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  steps: StepExecution[];
  artifacts: ExecutionArtifact[];
  metrics: Record<string, any>;
  logs: ExecutionLog[];
  error?: string;
}

export interface StepExecution {
  stepId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  artifacts: ExecutionArtifact[];
  logs: ExecutionLog[];
  metrics: Record<string, any>;
  error?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  dependencies: string[];
  parameters: Record<string, any>;
  resourceRequirements?: ResourceRequirements;
  retryPolicy?: RetryPolicy;
  failureStrategy?: FailureStrategy;
  timeout?: number;
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  defaultResources: ResourceRequirements;
}

export interface AutomationTrigger {
  type: 'manual' | 'scheduled' | 'webhook' | 'automated' | 'git' | 'data-change';
  source: string;
  timestamp: Date;
  data?: Record<string, any>;
}

export interface ResourceRequirements {
  cpu: string;
  memory: string;
  gpu?: string;
  disk?: string;
  network?: string;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'constant';
  backoffMultiplier?: number;
  maxBackoffTime?: number;
}

export interface FailureStrategy {
  continueOnFailure: boolean;
  notificationChannels: string[];
  escalationPolicy?: string;
}

export interface ExecutionArtifact {
  id: string;
  name: string;
  type: string;
  uri: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface ExecutionLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source: string;
  metadata?: Record<string, any>;
}

/**
 * Model Lifecycle and Deployment Types
 */

export type ModelLifecycleStage = 
  | 'development' 
  | 'testing' 
  | 'staging' 
  | 'production' 
  | 'archived' 
  | 'deprecated';

export interface DeploymentStrategy {
  type: 'blue-green' | 'canary' | 'rolling' | 'shadow' | 'a-b-test';
  config: BlueGreenDeploymentConfig | CanaryDeploymentConfig | RollingDeploymentConfig | ModelShadowingConfig | ABTestConfig;
}

export interface BlueGreenDeploymentConfig {
  healthCheckPath: string;
  healthCheckTimeout: number;
  switchoverDelay: number;
  rollbackOnFailure: boolean;
}

export interface CanaryDeploymentConfig {
  initialTrafficPercentage: number;
  incrementPercentage: number;
  incrementInterval: number;
  maxTrafficPercentage: number;
  successThreshold: number;
  rollbackThreshold: number;
  monitoringDuration: number;
}

export interface RollingDeploymentConfig {
  batchSize: number;
  healthCheckPath: string;
  healthCheckTimeout: number;
  rollbackOnFailure: boolean;
}

export interface ModelShadowingConfig {
  shadowTrafficPercentage: number;
  comparisonMetrics: string[];
  monitoringDuration: number;
  alertingThresholds: Record<string, number>;
}

export interface ABTestConfig {
  controlModel: string;
  treatmentModel: string;
  trafficSplit: {
    control: number;
    treatment: number;
  };
  duration: number;
  successMetrics: string[];
  minimumSampleSize: number;
  statisticalSignificance: number;
}

export interface DeploymentEnvironment {
  id: string;
  name: string;
  type: 'development' | 'testing' | 'staging' | 'production';
  kubernetesConfig?: KubernetesConfig;
  resourceLimits: ResourceRequirements;
  secrets: Record<string, string>;
  environmentVariables: Record<string, string>;
  monitoring: MonitoringConfig;
  compliance: ComplianceConfig;
}

export interface KubernetesConfig {
  namespace: string;
  cluster: string;
  serviceAccount: string;
  imagePullSecrets: string[];
  nodeSelector?: Record<string, string>;
  tolerations?: any[];
  affinity?: any;
}

/**
 * Monitoring and Performance Types
 */

export interface ModelPerformanceMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  latency?: number;
  throughput?: number;
  errorRate?: number;
  customMetrics?: Record<string, number>;
}

export interface DataDriftMetrics {
  statisticalTests: string[];
  thresholds: Record<string, number>;
  monitoringWindow: number;
  alertingSensitivity: 'low' | 'medium' | 'high';
}

export interface MonitoringAlert {
  id: string;
  modelId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata: Record<string, any>;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number;
  alertingChannels: string[];
  dashboardUrl?: string;
  customMetrics?: Record<string, any>;
}

export interface ComplianceConfig {
  enabled: boolean;
  frameworks: string[];
  auditLevel: 'basic' | 'standard' | 'comprehensive';
  retentionPeriod: number;
}

/**
 * Retraining and Lifecycle Management Types
 */

export interface RetrainingTrigger {
  id: string;
  modelId: string;
  triggerType: 'performance-degradation' | 'data-drift' | 'scheduled' | 'manual';
  thresholds: Record<string, number>;
  schedule?: string;
  minSeverity: 'low' | 'medium' | 'high' | 'critical';
  alertTypes: string[];
  targetEnvironment?: string;
  automaticApproval: boolean;
}

export interface RollbackPolicy {
  automaticRollback: boolean;
  healthCheckTimeout: number;
  rollbackTriggers: string[];
  maxRollbackTime: number;
  notificationChannels: string[];
  approvalRequired?: boolean;
  approvers?: string[];
}

export interface ModelGovernancePolicy {
  id: string;
  name: string;
  modelId?: string;
  modelType?: string;
  environment?: string;
  rules: GovernanceRule[];
  allowAutomatedRetraining: boolean;
  requiredApprovals: number;
  approvers: string[];
  complianceChecks: string[];
  auditLevel: 'basic' | 'standard' | 'comprehensive';
}

export interface GovernanceRule {
  id: string;
  type: 'approval' | 'compliance' | 'performance' | 'security';
  condition: string;
  action: 'block' | 'warn' | 'require-approval';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ModelApprovalWorkflow {
  id: string;
  modelId: string;
  version: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approvals: Approval[];
  requiredApprovals: number;
  comments: WorkflowComment[];
  metadata: Record<string, any>;
}

export interface Approval {
  approver: string;
  approvedAt: Date;
  decision: 'approved' | 'rejected';
  comments: string;
  metadata: Record<string, any>;
}

export interface WorkflowComment {
  author: string;
  timestamp: Date;
  message: string;
  type: 'comment' | 'system';
}

export interface AuditTrail {
  id: string;
  entityType: 'pipeline' | 'model' | 'deployment' | 'rollback';
  entityId: string;
  action: string;
  actor: string;
  timestamp: Date;
  details: Record<string, any>;
  result: 'success' | 'failure' | 'partial';
  metadata: Record<string, any>;
}

/**
 * CI/CD and GitOps Integration Types
 */

export interface CICDIntegration {
  provider: 'github-actions' | 'azure-devops' | 'gitlab-ci' | 'jenkins';
  repositoryUrl: string;
  branch: string;
  triggers: CICDTrigger[];
  buildConfig: BuildConfig;
  testConfig: TestConfig;
  deploymentConfig: CICDDeploymentConfig;
}

export interface CICDTrigger {
  type: 'push' | 'pull-request' | 'tag' | 'scheduled';
  condition: string;
  branches?: string[];
  paths?: string[];
}

export interface BuildConfig {
  dockerfile?: string;
  buildContext: string;
  buildArgs: Record<string, string>;
  target?: string;
  cache: boolean;
}

export interface TestConfig {
  unitTests: boolean;
  integrationTests: boolean;
  performanceTests: boolean;
  securityTests: boolean;
  testCommand: string;
  testPath: string;
  coverageThreshold: number;
}

export interface CICDDeploymentConfig {
  environments: string[];
  approvalRequired: boolean;
  approvers: string[];
  rollbackPolicy: RollbackPolicy;
  notifications: NotificationConfig[];
}

export interface GitOpsConfig {
  repository: string;
  branch: string;
  path: string;
  syncInterval: number;
  autoSync: boolean;
  pruneResources: boolean;
  notifications: NotificationConfig[];
}

export interface NotificationConfig {
  channel: 'email' | 'slack' | 'webhook' | 'teams';
  recipients: string[];
  events: string[];
  template?: string;
}

export interface ArtifactRepository {
  type: 'docker' | 's3' | 'gcs' | 'azure-blob';
  uri: string;
  credentials: Record<string, string>;
  retention: RetentionPolicy;
}

export interface RetentionPolicy {
  maxVersions: number;
  maxAge: number; // days
  autoCleanup: boolean;
}

/**
 * Feature Flags and Experimentation Types
 */

export interface FeatureFlagConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rules: FeatureFlagRule[];
  variants: FeatureFlagVariant[];
  rolloutPercentage: number;
  targetAudience?: TargetAudience;
}

export interface FeatureFlagRule {
  id: string;
  condition: string;
  variant: string;
  percentage: number;
}

export interface FeatureFlagVariant {
  id: string;
  name: string;
  configuration: Record<string, any>;
  weight: number;
}

export interface TargetAudience {
  userSegments: string[];
  geoRegions: string[];
  userPercentage: number;
  customAttributes: Record<string, any>;
}

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  variants: ExperimentVariant[];
  trafficSplit: Record<string, number>;
  successMetrics: string[];
  guardrailMetrics: string[];
  duration: number;
  minimumSampleSize: number;
  statisticalSignificance: number;
  status: 'draft' | 'running' | 'completed' | 'cancelled';
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  modelVersion?: string;
}

/**
 * MLOps Configuration Types
 */

export interface MLOpsConfig {
  scheduler: {
    maxConcurrentPipelines: number;
    defaultTimeout: number;
    retryPolicy: RetryPolicy;
  };
  deployment: {
    defaultStrategy: DeploymentStrategy;
    environments: string[];
    resourceLimits: ResourceRequirements;
  };
  monitoring: {
    metricsInterval: number;
    alertingChannels: string[];
    retentionPeriod: number;
  };
  compliance: {
    enabled: boolean;
    frameworks: string[];
    auditLevel: 'basic' | 'standard' | 'comprehensive';
  };
  resources: {
    defaultLimits: ResourceRequirements;
    scalingPolicy: 'manual' | 'auto';
    nodeSelector?: Record<string, string>;
  };
  cicd: CICDIntegration;
  gitops: GitOpsConfig;
  governance: {
    enabled: boolean;
    defaultPolicy: string;
    approvalWorkflow: boolean;
  };
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  framework: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  checkType: 'automated' | 'manual';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly';
  condition: string;
  remediation: string;
}