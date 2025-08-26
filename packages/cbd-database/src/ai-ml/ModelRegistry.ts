/**
 * Phase 7: Model Registry
 * 
 * Enterprise-grade model registry implementing Azure ML model management patterns.
 * Provides versioning, metadata management, deployment tracking, and lifecycle governance
 * following 2025 MLOps best practices.
 * 
 * Key features:
 * - Model versioning with semantic versioning and branching
 * - Comprehensive metadata and lineage tracking
 * - Model approval workflows and governance
 * - Asset management with artifact storage
 * - Integration with deployment pipelines
 * - Model performance monitoring and drift detection
 * - Compliance and audit trail management
 */

import { MLModel, ModelMetadata, ModelMetrics, AuditEntry, ComplianceInfo } from './AIMLTypes';

export interface ModelRegistryConfig {
  storage: StorageConfig;
  versioning: VersioningConfig;
  governance: GovernanceConfig;
  metadata: MetadataConfig;
  security: SecurityConfig;
}

export interface StorageConfig {
  provider: 'local' | 's3' | 'azure_blob' | 'gcs';
  bucket: string;
  encryption: boolean;
  compression: boolean;
  replication: boolean;
  accessControl: 'private' | 'public' | 'organization';
}

export interface VersioningConfig {
  strategy: 'semantic' | 'sequential' | 'timestamp' | 'hash';
  autoVersioning: boolean;
  branchingEnabled: boolean;
  mergeStrategies: MergeStrategy[];
  retentionPolicy: RetentionPolicy;
}

export interface MergeStrategy {
  name: string;
  description: string;
  automatic: boolean;
  conflictResolution: 'manual' | 'latest_wins' | 'performance_based';
}

export interface RetentionPolicy {
  enabled: boolean;
  maxVersions: number;
  maxAge: number; // days
  archiveStrategy: 'delete' | 'archive' | 'compress';
  exceptions: string[]; // model patterns to exclude from cleanup
}

export interface GovernanceConfig {
  approvalRequired: boolean;
  approvalWorkflow: ApprovalWorkflow;
  complianceChecks: ComplianceCheck[];
  auditTrail: AuditConfig;
  accessControl: AccessControlConfig;
}

export interface ApprovalWorkflow {
  stages: ApprovalStage[];
  timeout: number;
  escalation: EscalationRule[];
  notifications: NotificationRule[];
}

export interface ApprovalStage {
  name: string;
  approvers: string[];
  requiredApprovals: number;
  criteria: ApprovalCriteria;
  timeout: number;
}

export interface ApprovalCriteria {
  minAccuracy?: number;
  maxBias?: number;
  securityScan: boolean;
  performanceThresholds: Record<string, number>;
  customChecks: CustomCheck[];
}

export interface CustomCheck {
  name: string;
  description: string;
  script: string;
  required: boolean;
}

export interface EscalationRule {
  stage: string;
  timeout: number;
  action: 'notify' | 'auto_approve' | 'auto_reject';
  recipients: string[];
}

export interface NotificationRule {
  event: 'approval_requested' | 'approved' | 'rejected' | 'deployed';
  channels: string[];
  recipients: string[];
  template: string;
}

export interface ComplianceCheck {
  name: string;
  description: string;
  type: 'security' | 'privacy' | 'fairness' | 'performance' | 'regulatory';
  automated: boolean;
  script?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditConfig {
  enabled: boolean;
  events: AuditableEvent[];
  storage: AuditStorageConfig;
  retention: number;
  immutable: boolean;
}

export interface AuditableEvent {
  type: string;
  description: string;
  sensitive: boolean;
  required: boolean;
}

export interface AuditStorageConfig {
  provider: 'database' | 'file' | 'blockchain';
  encryption: boolean;
  compression: boolean;
  replication: boolean;
}

export interface AccessControlConfig {
  rbac: RoleBasedAccessControl;
  abac: AttributeBasedAccessControl;
  apiKeys: ApiKeyConfig;
  sessions: SessionConfig;
}

export interface RoleBasedAccessControl {
  enabled: boolean;
  roles: Role[];
  defaultRole: string;
  inheritance: boolean;
}

export interface Role {
  name: string;
  description: string;
  permissions: Permission[];
  inherits: string[];
}

export interface Permission {
  resource: string;
  actions: string[];
  conditions: Record<string, any>;
}

export interface AttributeBasedAccessControl {
  enabled: boolean;
  policies: ABACPolicy[];
  attributes: Attribute[];
}

export interface ABACPolicy {
  name: string;
  description: string;
  rule: string;
  effect: 'allow' | 'deny';
  priority: number;
}

export interface Attribute {
  name: string;
  type: 'user' | 'resource' | 'environment' | 'action';
  dataType: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
}

export interface ApiKeyConfig {
  enabled: boolean;
  expiration: number;
  rotation: boolean;
  encryption: boolean;
  scopes: string[];
}

export interface SessionConfig {
  timeout: number;
  maxSessions: number;
  persistence: boolean;
  encryption: boolean;
}

export interface MetadataConfig {
  required: string[];
  optional: string[];
  customFields: CustomField[];
  schema: MetadataSchema;
  validation: ValidationConfig;
}

export interface CustomField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  validation: FieldValidation;
  description: string;
}

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: any[];
}

export interface MetadataSchema {
  version: string;
  definitions: SchemaDefinition[];
  validation: SchemaValidation;
}

export interface SchemaDefinition {
  field: string;
  type: string;
  required: boolean;
  constraints: Record<string, any>;
}

export interface SchemaValidation {
  strict: boolean;
  allowAdditional: boolean;
  validateOnUpdate: boolean;
}

export interface ValidationConfig {
  enabled: boolean;
  onRegister: boolean;
  onUpdate: boolean;
  rules: ValidationRule[];
}

export interface ValidationRule {
  name: string;
  field: string;
  validator: string;
  parameters: Record<string, any>;
  severity: 'error' | 'warning';
}

export interface SecurityConfig {
  encryption: EncryptionConfig;
  authentication: AuthConfig;
  authorization: AuthzConfig;
  audit: SecurityAuditConfig;
}

export interface EncryptionConfig {
  atRest: boolean;
  inTransit: boolean;
  keyManagement: KeyManagementConfig;
  algorithms: string[];
}

export interface KeyManagementConfig {
  provider: 'local' | 'aws_kms' | 'azure_key_vault' | 'gcp_kms';
  keyRotation: boolean;
  keyBackup: boolean;
  keyRecovery: boolean;
}

export interface AuthConfig {
  methods: string[];
  mfa: boolean;
  tokenExpiry: number;
  refreshTokens: boolean;
}

export interface AuthzConfig {
  model: 'rbac' | 'abac' | 'hybrid';
  enforcement: 'mandatory' | 'advisory';
  caching: boolean;
}

export interface SecurityAuditConfig {
  logAccess: boolean;
  logChanges: boolean;
  logFailures: boolean;
  alerting: AlertingConfig;
}

export interface AlertingConfig {
  enabled: boolean;
  thresholds: AlertThreshold[];
  channels: AlertChannel[];
}

export interface AlertThreshold {
  metric: string;
  threshold: number;
  window: number;
  severity: string;
}

export interface AlertChannel {
  type: string;
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface ModelRegistration {
  model: MLModel;
  approvalStatus: ApprovalStatus;
  deployments: Deployment[];
  performance: PerformanceMetrics;
  governance: GovernanceRecord;
}

export interface ApprovalStatus {
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  stage: string;
  approvals: Approval[];
  rejections: Rejection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Approval {
  approver: string;
  stage: string;
  timestamp: Date;
  comments: string;
  conditions: Record<string, any>;
}

export interface Rejection {
  approver: string;
  stage: string;
  timestamp: Date;
  reason: string;
  recommendations: string[];
}

export interface Deployment {
  id: string;
  environment: string;
  endpoint: string;
  status: 'deploying' | 'deployed' | 'failed' | 'retired';
  version: string;
  createdAt: Date;
  updatedAt: Date;
  configuration: DeploymentConfig;
}

export interface DeploymentConfig {
  replicas: number;
  resources: ResourceConfig;
  scaling: ScalingConfig;
  monitoring: MonitoringConfig;
}

export interface ResourceConfig {
  cpu: string;
  memory: string;
  storage: string;
  gpu?: string;
}

export interface ScalingConfig {
  enabled: boolean;
  minReplicas: number;
  maxReplicas: number;
  metrics: ScalingMetric[];
}

export interface ScalingMetric {
  name: string;
  threshold: number;
  type: 'cpu' | 'memory' | 'requests' | 'custom';
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: string[];
  dashboards: string[];
  alerts: Alert[];
}

export interface Alert {
  name: string;
  condition: string;
  severity: string;
  actions: string[];
}

export interface PerformanceMetrics {
  current: ModelMetrics;
  baseline: ModelMetrics;
  trend: TrendAnalysis;
  drift: DriftAnalysis;
}

export interface TrendAnalysis {
  direction: 'improving' | 'degrading' | 'stable';
  confidence: number;
  significance: number;
  timeWindow: string;
}

export interface DriftAnalysis {
  detected: boolean;
  severity: 'low' | 'medium' | 'high';
  features: string[];
  recommendation: string;
  lastChecked: Date;
}

export interface GovernanceRecord {
  compliance: ComplianceRecord;
  approvals: Approval[];
  audits: AuditRecord[];
  risks: RiskAssessment[];
}

export interface ComplianceRecord {
  frameworks: string[];
  status: 'compliant' | 'non_compliant' | 'under_review';
  checks: ComplianceCheckResult[];
  lastAssessment: Date;
}

export interface ComplianceCheckResult {
  check: string;
  status: 'passed' | 'failed' | 'warning';
  findings: string[];
  remediation: string[];
}

export interface AuditRecord {
  id: string;
  event: string;
  actor: string;
  timestamp: Date;
  details: Record<string, any>;
  impact: 'low' | 'medium' | 'high';
}

export interface RiskAssessment {
  id: string;
  category: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string[];
  assessedAt: Date;
  assessor: string;
}

export interface ModelSearchQuery {
  name?: string;
  algorithm?: string;
  framework?: string;
  tags?: string[];
  minAccuracy?: number;
  maxLatency?: number;
  status?: string[];
  dateRange?: DateRange;
  sort?: SortConfig;
  pagination?: PaginationConfig;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  size: number;
}

export interface ModelSearchResult {
  models: ModelRegistration[];
  totalCount: number;
  page: number;
  pageSize: number;
  facets: SearchFacet[];
}

export interface SearchFacet {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
}

export class ModelRegistry {
  private config: ModelRegistryConfig;
  private models: Map<string, ModelRegistration> = new Map();
  private versions: Map<string, Map<string, ModelRegistration>> = new Map();
  private auditTrail: AuditEntry[] = [];

  constructor(config: ModelRegistryConfig) {
    this.config = config;
    console.log('📚 Model Registry initialized');
  }

  /**
   * Register a new model
   */
  async registerModel(model: MLModel): Promise<ModelRegistration> {
    console.log(`📝 Registering model: ${model.name}`);
    
    try {
      // Validate model
      await this.validateModel(model);
      
      // Check if model already exists
      const existingModel = this.findModelByName(model.name);
      if (existingModel && !this.config.versioning.autoVersioning) {
        throw new Error(`Model ${model.name} already exists`);
      }
      
      // Generate version if auto-versioning is enabled
      if (this.config.versioning.autoVersioning) {
        model.version = await this.generateVersion(model.name, model.version);
      }
      
      // Create registration
      const registration: ModelRegistration = {
        model,
        approvalStatus: await this.initializeApprovalProcess(model),
        deployments: [],
        performance: await this.initializePerformanceMetrics(model),
        governance: await this.initializeGovernanceRecord(model)
      };
      
      // Store model
      this.storeModel(registration);
      
      // Audit log
      await this.auditLog('model_registered', 'system', { modelId: model.id, version: model.version });
      
      console.log(`✅ Model registered: ${model.name} v${model.version}`);
      return registration;
      
    } catch (error) {
      console.error(`❌ Failed to register model ${model.name}:`, error);
      throw error;
    }
  }

  /**
   * Get model by ID and version
   */
  async getModel(modelId: string, version?: string): Promise<ModelRegistration | null> {
    try {
      const modelVersions = this.versions.get(modelId);
      if (!modelVersions) {
        return null;
      }
      
      if (version) {
        return modelVersions.get(version) || null;
      } else {
        // Return latest version
        const latestVersion = this.getLatestVersion(modelVersions);
        return latestVersion || null;
      }
    } catch (error) {
      console.error(`❌ Failed to get model ${modelId}:`, error);
      return null;
    }
  }

  /**
   * Update model metadata
   */
  async updateModel(modelId: string, version: string, updates: Partial<MLModel>): Promise<ModelRegistration> {
    console.log(`📝 Updating model: ${modelId} v${version}`);
    
    try {
      const registration = await this.getModel(modelId, version);
      if (!registration) {
        throw new Error(`Model ${modelId} v${version} not found`);
      }
      
      // Apply updates
      registration.model = { ...registration.model, ...updates };
      
      // Validate updated model
      await this.validateModel(registration.model);
      
      // Update storage
      this.storeModel(registration);
      
      // Audit log
      await this.auditLog('model_updated', 'system', { modelId, version, updates });
      
      console.log(`✅ Model updated: ${modelId} v${version}`);
      return registration;
      
    } catch (error) {
      console.error(`❌ Failed to update model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Delete model
   */
  async deleteModel(modelId: string, version?: string): Promise<void> {
    console.log(`🗑️ Deleting model: ${modelId} ${version ? `v${version}` : '(all versions)'}`);
    
    try {
      if (version) {
        // Delete specific version
        const modelVersions = this.versions.get(modelId);
        if (modelVersions) {
          modelVersions.delete(version);
          if (modelVersions.size === 0) {
            this.versions.delete(modelId);
          }
        }
        this.models.delete(`${modelId}:${version}`);
      } else {
        // Delete all versions
        this.versions.delete(modelId);
        const keysToDelete = Array.from(this.models.keys()).filter(key => key.startsWith(`${modelId}:`));
        keysToDelete.forEach(key => this.models.delete(key));
      }
      
      // Audit log
      await this.auditLog('model_deleted', 'system', { modelId, version });
      
      console.log(`✅ Model deleted: ${modelId} ${version ? `v${version}` : '(all versions)'}`);
      
    } catch (error) {
      console.error(`❌ Failed to delete model ${modelId}:`, error);
      throw error;
    }
  }

  /**
   * Search models
   */
  async searchModels(query: ModelSearchQuery): Promise<ModelSearchResult> {
    console.log('🔍 Searching models...');
    
    try {
      let filteredModels = Array.from(this.models.values());
      
      // Apply filters
      if (query.name) {
        filteredModels = filteredModels.filter(m => 
          m.model.name.toLowerCase().includes(query.name!.toLowerCase())
        );
      }
      
      if (query.algorithm) {
        filteredModels = filteredModels.filter(m => m.model.algorithm === query.algorithm);
      }
      
      if (query.framework) {
        filteredModels = filteredModels.filter(m => m.model.framework === query.framework);
      }
      
      if (query.tags && query.tags.length > 0) {
        filteredModels = filteredModels.filter(m => 
          query.tags!.every(tag => m.model.tags.includes(tag))
        );
      }
      
      if (query.minAccuracy) {
        filteredModels = filteredModels.filter(m => 
          (m.model.metrics.accuracy || 0) >= query.minAccuracy!
        );
      }
      
      if (query.maxLatency) {
        filteredModels = filteredModels.filter(m => 
          m.model.metrics.inferenceLatency <= query.maxLatency!
        );
      }
      
      if (query.status && query.status.length > 0) {
        filteredModels = filteredModels.filter(m => 
          query.status!.includes(m.model.status)
        );
      }
      
      if (query.dateRange) {
        filteredModels = filteredModels.filter(m => 
          m.model.createdAt >= query.dateRange!.start && 
          m.model.createdAt <= query.dateRange!.end
        );
      }
      
      // Sort results
      if (query.sort) {
        filteredModels = this.sortModels(filteredModels, query.sort);
      }
      
      // Generate facets
      const facets = this.generateSearchFacets(filteredModels);
      
      // Apply pagination
      const totalCount = filteredModels.length;
      const pagination = query.pagination || { page: 1, size: 10 };
      const startIndex = (pagination.page - 1) * pagination.size;
      const endIndex = startIndex + pagination.size;
      const paginatedModels = filteredModels.slice(startIndex, endIndex);
      
      console.log(`✅ Found ${totalCount} models`);
      
      return {
        models: paginatedModels,
        totalCount,
        page: pagination.page,
        pageSize: pagination.size,
        facets
      };
      
    } catch (error) {
      console.error('❌ Model search failed:', error);
      throw error;
    }
  }

  /**
   * List all model versions
   */
  async listVersions(modelId: string): Promise<ModelRegistration[]> {
    const modelVersions = this.versions.get(modelId);
    if (!modelVersions) {
      return [];
    }
    
    return Array.from(modelVersions.values())
      .sort((a, b) => b.model.createdAt.getTime() - a.model.createdAt.getTime());
  }

  /**
   * Compare model versions
   */
  async compareModels(
    modelId1: string, 
    version1: string, 
    modelId2: string, 
    version2: string
  ): Promise<ModelComparison> {
    const model1 = await this.getModel(modelId1, version1);
    const model2 = await this.getModel(modelId2, version2);
    
    if (!model1 || !model2) {
      throw new Error('One or both models not found');
    }
    
    return this.generateModelComparison(model1, model2);
  }

  /**
   * Get model lineage
   */
  async getModelLineage(modelId: string): Promise<ModelLineage> {
    // Mock implementation - would track actual lineage in real system
    return {
      modelId,
      ancestors: [],
      descendants: [],
      branches: [],
      merges: []
    };
  }

  /**
   * Approve model
   */
  async approveModel(modelId: string, version: string, approver: string, comments?: string): Promise<void> {
    const registration = await this.getModel(modelId, version);
    if (!registration) {
      throw new Error(`Model ${modelId} v${version} not found`);
    }
    
    const approval: Approval = {
      approver,
      stage: registration.approvalStatus.stage,
      timestamp: new Date(),
      comments: comments || '',
      conditions: {}
    };
    
    registration.approvalStatus.approvals.push(approval);
    
    // Check if all approvals are met
    if (this.checkApprovalComplete(registration.approvalStatus)) {
      registration.approvalStatus.status = 'approved';
    }
    
    this.storeModel(registration);
    await this.auditLog('model_approved', approver, { modelId, version, comments });
    
    console.log(`✅ Model approved: ${modelId} v${version} by ${approver}`);
  }

  /**
   * Reject model
   */
  async rejectModel(
    modelId: string, 
    version: string, 
    rejector: string, 
    reason: string, 
    recommendations?: string[]
  ): Promise<void> {
    const registration = await this.getModel(modelId, version);
    if (!registration) {
      throw new Error(`Model ${modelId} v${version} not found`);
    }
    
    const rejection: Rejection = {
      approver: rejector,
      stage: registration.approvalStatus.stage,
      timestamp: new Date(),
      reason,
      recommendations: recommendations || []
    };
    
    registration.approvalStatus.rejections.push(rejection);
    registration.approvalStatus.status = 'rejected';
    
    this.storeModel(registration);
    await this.auditLog('model_rejected', rejector, { modelId, version, reason });
    
    console.log(`❌ Model rejected: ${modelId} v${version} by ${rejector}`);
  }

  // Helper methods

  private async validateModel(model: MLModel): Promise<void> {
    // Basic validation
    if (!model.name || !model.version || !model.algorithm) {
      throw new Error('Model name, version, and algorithm are required');
    }
    
    // Metadata validation
    if (this.config.metadata.validation.enabled) {
      await this.validateMetadata(model.metadata);
    }
    
    // Custom validations
    for (const rule of this.config.metadata.validation.rules) {
      await this.applyValidationRule(model, rule);
    }
  }

  private findModelByName(name: string): ModelRegistration | undefined {
    return Array.from(this.models.values()).find(m => m.model.name === name);
  }

  private async generateVersion(modelName: string, requestedVersion?: string): Promise<string> {
    if (requestedVersion) {
      return requestedVersion;
    }
    
    const existingVersions = this.getExistingVersions(modelName);
    
    switch (this.config.versioning.strategy) {
      case 'semantic':
        return this.generateSemanticVersion(existingVersions);
      case 'sequential':
        return this.generateSequentialVersion(existingVersions);
      case 'timestamp':
        return this.generateTimestampVersion();
      case 'hash':
        return this.generateHashVersion();
      default:
        return '1.0.0';
    }
  }

  private getExistingVersions(modelName: string): string[] {
    return Array.from(this.models.values())
      .filter(m => m.model.name === modelName)
      .map(m => m.model.version)
      .sort();
  }

  private generateSemanticVersion(existingVersions: string[]): string {
    if (existingVersions.length === 0) {
      return '1.0.0';
    }
    
    const latestVersion = existingVersions[existingVersions.length - 1];
    const [major, minor, patch] = latestVersion.split('.').map(Number);
    
    return `${major}.${minor}.${patch + 1}`;
  }

  private generateSequentialVersion(existingVersions: string[]): string {
    return (existingVersions.length + 1).toString();
  }

  private generateTimestampVersion(): string {
    return Date.now().toString();
  }

  private generateHashVersion(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private async initializeApprovalProcess(model: MLModel): Promise<ApprovalStatus> {
    if (!this.config.governance.approvalRequired) {
      return {
        status: 'approved',
        stage: 'none',
        approvals: [],
        rejections: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    return {
      status: 'pending',
      stage: this.config.governance.approvalWorkflow.stages[0]?.name || 'initial',
      approvals: [],
      rejections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async initializePerformanceMetrics(model: MLModel): Promise<PerformanceMetrics> {
    return {
      current: model.metrics,
      baseline: model.metrics,
      trend: {
        direction: 'stable',
        confidence: 0.0,
        significance: 0.0,
        timeWindow: '30d'
      },
      drift: {
        detected: false,
        severity: 'low',
        features: [],
        recommendation: 'No action required',
        lastChecked: new Date()
      }
    };
  }

  private async initializeGovernanceRecord(model: MLModel): Promise<GovernanceRecord> {
    return {
      compliance: {
        frameworks: [],
        status: 'under_review',
        checks: [],
        lastAssessment: new Date()
      },
      approvals: [],
      audits: [],
      risks: []
    };
  }

  private storeModel(registration: ModelRegistration): void {
    const key = `${registration.model.id}:${registration.model.version}`;
    this.models.set(key, registration);
    
    // Store in version map
    if (!this.versions.has(registration.model.id)) {
      this.versions.set(registration.model.id, new Map());
    }
    this.versions.get(registration.model.id)!.set(registration.model.version, registration);
  }

  private getLatestVersion(versions: Map<string, ModelRegistration>): ModelRegistration | null {
    const versionArray = Array.from(versions.values());
    if (versionArray.length === 0) {
      return null;
    }
    
    return versionArray.sort((a, b) => b.model.createdAt.getTime() - a.model.createdAt.getTime())[0];
  }

  private sortModels(models: ModelRegistration[], sort: SortConfig): ModelRegistration[] {
    return models.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sort.field) {
        case 'name':
          aValue = a.model.name;
          bValue = b.model.name;
          break;
        case 'createdAt':
          aValue = a.model.createdAt;
          bValue = b.model.createdAt;
          break;
        case 'accuracy':
          aValue = a.model.metrics.accuracy || 0;
          bValue = b.model.metrics.accuracy || 0;
          break;
        default:
          return 0;
      }
      
      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  private generateSearchFacets(models: ModelRegistration[]): SearchFacet[] {
    const facets: SearchFacet[] = [];
    
    // Algorithm facet
    const algorithmCounts = new Map<string, number>();
    models.forEach(m => {
      algorithmCounts.set(m.model.algorithm, (algorithmCounts.get(m.model.algorithm) || 0) + 1);
    });
    
    facets.push({
      field: 'algorithm',
      values: Array.from(algorithmCounts.entries()).map(([value, count]) => ({ value, count }))
    });
    
    // Framework facet
    const frameworkCounts = new Map<string, number>();
    models.forEach(m => {
      frameworkCounts.set(m.model.framework, (frameworkCounts.get(m.model.framework) || 0) + 1);
    });
    
    facets.push({
      field: 'framework',
      values: Array.from(frameworkCounts.entries()).map(([value, count]) => ({ value, count }))
    });
    
    return facets;
  }

  private generateModelComparison(model1: ModelRegistration, model2: ModelRegistration): ModelComparison {
    return {
      models: [model1, model2],
      metrics: this.compareMetrics(model1.model.metrics, model2.model.metrics),
      features: this.compareFeatures(model1.model, model2.model),
      recommendations: this.generateComparisonRecommendations(model1, model2)
    };
  }

  private compareMetrics(metrics1: ModelMetrics, metrics2: ModelMetrics): MetricComparison[] {
    const comparisons: MetricComparison[] = [];
    
    const metricFields = ['accuracy', 'precision', 'recall', 'f1Score', 'auc', 'rmse', 'mae', 'r2Score'];
    
    metricFields.forEach(field => {
      const value1 = (metrics1 as any)[field];
      const value2 = (metrics2 as any)[field];
      
      if (value1 !== undefined && value2 !== undefined) {
        comparisons.push({
          metric: field,
          value1,
          value2,
          difference: value2 - value1,
          improvement: value2 > value1
        });
      }
    });
    
    return comparisons;
  }

  private compareFeatures(model1: MLModel, model2: MLModel): FeatureComparison {
    const features1 = new Set(model1.metadata.featuresUsed);
    const features2 = new Set(model2.metadata.featuresUsed);
    
    const common = Array.from(features1).filter(f => features2.has(f));
    const only1 = Array.from(features1).filter(f => !features2.has(f));
    const only2 = Array.from(features2).filter(f => !features1.has(f));
    
    return {
      common,
      onlyInModel1: only1,
      onlyInModel2: only2,
      similarity: common.length / Math.max(features1.size, features2.size)
    };
  }

  private generateComparisonRecommendations(
    model1: ModelRegistration, 
    model2: ModelRegistration
  ): string[] {
    const recommendations: string[] = [];
    
    // Performance comparison
    const accuracy1 = model1.model.metrics.accuracy || 0;
    const accuracy2 = model2.model.metrics.accuracy || 0;
    
    if (accuracy2 > accuracy1) {
      recommendations.push(`Model 2 shows ${((accuracy2 - accuracy1) * 100).toFixed(2)}% better accuracy`);
    } else if (accuracy1 > accuracy2) {
      recommendations.push(`Model 1 shows ${((accuracy1 - accuracy2) * 100).toFixed(2)}% better accuracy`);
    }
    
    // Latency comparison
    const latency1 = model1.model.metrics.inferenceLatency;
    const latency2 = model2.model.metrics.inferenceLatency;
    
    if (latency2 < latency1) {
      recommendations.push(`Model 2 is ${((latency1 - latency2) / latency1 * 100).toFixed(2)}% faster`);
    } else if (latency1 < latency2) {
      recommendations.push(`Model 1 is ${((latency2 - latency1) / latency2 * 100).toFixed(2)}% faster`);
    }
    
    return recommendations;
  }

  private checkApprovalComplete(approvalStatus: ApprovalStatus): boolean {
    // Mock approval logic - in real system would check workflow requirements
    return approvalStatus.approvals.length >= 1;
  }

  private async validateMetadata(metadata: ModelMetadata): Promise<void> {
    // Mock metadata validation
    if (!metadata.description) {
      throw new Error('Model description is required');
    }
  }

  private async applyValidationRule(model: MLModel, rule: ValidationRule): Promise<void> {
    // Mock validation rule application
    console.log(`Applying validation rule: ${rule.name}`);
  }

  private async auditLog(event: string, actor: string, details: Record<string, any>): Promise<void> {
    const auditEntry: AuditEntry = {
      timestamp: new Date(),
      action: event,
      actor,
      details
    };
    
    this.auditTrail.push(auditEntry);
    
    // In real system, would persist to audit storage
    console.log(`📝 Audit: ${event} by ${actor}`);
  }

  // Public getters
  public getAuditTrail(): AuditEntry[] {
    return [...this.auditTrail];
  }

  public getStats(): ModelRegistryStats {
    const totalModels = this.models.size;
    const totalVersions = Array.from(this.versions.values()).reduce((sum, versions) => sum + versions.size, 0);
    const approvedModels = Array.from(this.models.values()).filter(m => m.approvalStatus.status === 'approved').length;
    const deployedModels = Array.from(this.models.values()).filter(m => m.deployments.length > 0).length;
    
    return {
      totalModels,
      totalVersions,
      approvedModels,
      deployedModels,
      pendingApprovals: totalModels - approvedModels,
      storageUsage: 0 // Would calculate actual storage usage
    };
  }
}

// Additional interfaces for comparison and lineage
export interface ModelComparison {
  models: [ModelRegistration, ModelRegistration];
  metrics: MetricComparison[];
  features: FeatureComparison;
  recommendations: string[];
}

export interface MetricComparison {
  metric: string;
  value1: number;
  value2: number;
  difference: number;
  improvement: boolean;
}

export interface FeatureComparison {
  common: string[];
  onlyInModel1: string[];
  onlyInModel2: string[];
  similarity: number;
}

export interface ModelLineage {
  modelId: string;
  ancestors: LineageNode[];
  descendants: LineageNode[];
  branches: BranchInfo[];
  merges: MergeInfo[];
}

export interface LineageNode {
  modelId: string;
  version: string;
  relationship: 'parent' | 'child' | 'branch' | 'merge';
  timestamp: Date;
}

export interface BranchInfo {
  name: string;
  createdFrom: string;
  createdAt: Date;
  active: boolean;
}

export interface MergeInfo {
  fromBranch: string;
  toBranch: string;
  mergedAt: Date;
  strategy: string;
}

export interface ModelRegistryStats {
  totalModels: number;
  totalVersions: number;
  approvedModels: number;
  deployedModels: number;
  pendingApprovals: number;
  storageUsage: number;
}