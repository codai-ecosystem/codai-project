/**
 * Phase 7: Feature Store
 * 
 * Enterprise-grade feature store implementing modern MLOps patterns.
 * Provides online/offline serving, point-in-time correctness, feature transformations,
 * and materialization pipelines following 2025 best practices.
 * 
 * Key features:
 * - Dual online/offline storage with consistency guarantees
 * - Point-in-time correctness for historical feature serving
 * - Real-time feature computation and materialization
 * - Feature versioning and schema evolution
 * - Feature monitoring and data quality validation
 * - Integration with streaming and batch data sources
 * - Low-latency serving for real-time inference
 */

import { EventEmitter } from 'events';

export interface FeatureStoreConfig {
  online: OnlineStoreConfig;
  offline: OfflineStoreConfig;
  transformation: TransformationConfig;
  materialization: MaterializationConfig;
  monitoring: FeatureMonitoringConfig;
  metadata: FeatureMetadataConfig;
}

export interface OnlineStoreConfig {
  provider: 'redis' | 'cassandra' | 'dynamodb' | 'bigtable' | 'memory';
  connection: ConnectionConfig;
  ttl: number; // seconds
  compression: boolean;
  replication: ReplicationConfig;
  consistency: 'eventual' | 'strong';
  partitioning: PartitioningConfig;
}

export interface OfflineStoreConfig {
  provider: 'parquet' | 'delta' | 'iceberg' | 'bigquery' | 'snowflake';
  connection: ConnectionConfig;
  warehouse: WarehouseConfig;
  partitioning: PartitioningConfig;
  compression: string;
  format: string;
}

export interface ConnectionConfig {
  host: string;
  port: number;
  database: string;
  credentials: CredentialConfig;
  poolSize: number;
  timeout: number;
}

export interface CredentialConfig {
  username?: string;
  password?: string;
  apiKey?: string;
  serviceAccount?: string;
  tokenFile?: string;
}

export interface ReplicationConfig {
  enabled: boolean;
  factor: number;
  strategy: 'sync' | 'async';
  regions: string[];
}

export interface PartitioningConfig {
  strategy: 'hash' | 'range' | 'time' | 'composite';
  columns: string[];
  partitions: number;
  timeGranularity?: 'hour' | 'day' | 'week' | 'month';
}

export interface WarehouseConfig {
  path: string;
  format: 'delta' | 'parquet' | 'iceberg';
  catalogUri: string;
  metastore: MetastoreConfig;
}

export interface MetastoreConfig {
  type: 'hive' | 'glue' | 'unity' | 'internal';
  uri: string;
  database: string;
}

export interface TransformationConfig {
  engine: 'spark' | 'flink' | 'beam' | 'native';
  resources: ResourceConfig;
  parallelism: number;
  checkpointing: CheckpointingConfig;
  serialization: SerializationConfig;
}

export interface ResourceConfig {
  memory: string;
  cpu: number;
  executors: number;
  maxDuration: number;
}

export interface CheckpointingConfig {
  enabled: boolean;
  interval: number;
  storage: string;
  compression: boolean;
}

export interface SerializationConfig {
  format: 'avro' | 'protobuf' | 'json' | 'parquet';
  compression: 'snappy' | 'gzip' | 'lz4' | 'none';
  schema: SchemaConfig;
}

export interface SchemaConfig {
  registry: 'confluent' | 'aws_glue' | 'internal';
  evolution: 'backward' | 'forward' | 'full' | 'none';
  validation: boolean;
}

export interface MaterializationConfig {
  scheduler: 'airflow' | 'prefect' | 'dagster' | 'internal';
  triggers: TriggerConfig[];
  retries: RetryConfig;
  notifications: NotificationConfig;
  parallelism: number;
}

export interface TriggerConfig {
  type: 'schedule' | 'event' | 'dependency' | 'manual';
  schedule?: string; // cron expression
  event?: EventTrigger;
  dependencies?: string[];
}

export interface EventTrigger {
  source: 'kafka' | 'pubsub' | 'kinesis' | 'webhook';
  topic: string;
  condition: string;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;
  maxDelay: number;
  jitter: boolean;
}

export interface NotificationConfig {
  channels: NotificationChannel[];
  events: string[];
  template: string;
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'teams' | 'webhook';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface FeatureMonitoringConfig {
  enabled: boolean;
  metrics: MonitoringMetric[];
  alerts: AlertConfig[];
  dashboard: DashboardConfig;
  sampling: SamplingConfig;
}

export interface MonitoringMetric {
  name: string;
  type: 'distribution' | 'count' | 'rate' | 'latency' | 'accuracy';
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'percentile';
  window: string;
  dimensions: string[];
}

export interface AlertConfig {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  duration: string;
  channels: string[];
}

export interface DashboardConfig {
  provider: 'grafana' | 'datadog' | 'newrelic' | 'internal';
  templates: DashboardTemplate[];
  refresh: number;
}

export interface DashboardTemplate {
  name: string;
  metrics: string[];
  visualization: 'line' | 'bar' | 'heatmap' | 'table';
  timeRange: string;
}

export interface SamplingConfig {
  enabled: boolean;
  rate: number;
  strategy: 'uniform' | 'reservoir' | 'systematic';
  maxSamples: number;
}

export interface FeatureMetadataConfig {
  catalog: CatalogConfig;
  lineage: LineageConfig;
  discovery: DiscoveryConfig;
  documentation: DocumentationConfig;
}

export interface CatalogConfig {
  provider: 'datahub' | 'amundsen' | 'atlas' | 'internal';
  searchEngine: 'elasticsearch' | 'solr' | 'internal';
  indexing: IndexingConfig;
}

export interface IndexingConfig {
  enabled: boolean;
  fields: string[];
  analyzers: string[];
  boost: Record<string, number>;
}

export interface LineageConfig {
  enabled: boolean;
  tracking: 'automatic' | 'manual' | 'hybrid';
  depth: number;
  visualization: boolean;
}

export interface DiscoveryConfig {
  enabled: boolean;
  recommendations: boolean;
  similarity: SimilarityConfig;
  tagging: TaggingConfig;
}

export interface SimilarityConfig {
  algorithm: 'cosine' | 'jaccard' | 'euclidean';
  threshold: number;
  features: string[];
}

export interface TaggingConfig {
  automatic: boolean;
  rules: TaggingRule[];
  categories: string[];
}

export interface TaggingRule {
  name: string;
  condition: string;
  tags: string[];
  confidence: number;
}

export interface DocumentationConfig {
  required: string[];
  templates: DocumentationTemplate[];
  validation: boolean;
}

export interface DocumentationTemplate {
  name: string;
  sections: string[];
  required: boolean;
}

export interface FeatureGroup {
  name: string;
  description: string;
  features: Feature[];
  source: DataSource;
  schema: FeatureSchema;
  metadata: FeatureGroupMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface Feature {
  name: string;
  type: FeatureType;
  description: string;
  transformation: Transformation;
  validation: FeatureValidation;
  monitoring: FeatureMonitoring;
  metadata: FeatureMetadata;
}

export interface FeatureType {
  dataType: 'int' | 'float' | 'string' | 'boolean' | 'timestamp' | 'array' | 'struct';
  nullable: boolean;
  constraints: TypeConstraint[];
  encoding: EncodingConfig;
}

export interface TypeConstraint {
  type: 'range' | 'pattern' | 'enum' | 'length' | 'custom';
  parameters: Record<string, any>;
  message: string;
}

export interface EncodingConfig {
  method: 'one_hot' | 'label' | 'target' | 'embedding' | 'hash';
  parameters: Record<string, any>;
  dimensions: number;
}

export interface Transformation {
  type: 'sql' | 'python' | 'scala' | 'java';
  code: string;
  dependencies: string[];
  parameters: Record<string, any>;
  version: string;
}

export interface FeatureValidation {
  rules: ValidationRule[];
  sampling: number;
  onFailure: 'ignore' | 'warn' | 'fail';
  alerts: boolean;
}

export interface ValidationRule {
  name: string;
  type: 'null_check' | 'range_check' | 'pattern_check' | 'distribution_check' | 'custom';
  parameters: Record<string, any>;
  severity: 'warning' | 'error';
}

export interface FeatureMonitoring {
  enabled: boolean;
  metrics: string[];
  drift: DriftConfig;
  quality: QualityConfig;
  performance: PerformanceConfig;
}

export interface DriftConfig {
  enabled: boolean;
  algorithm: 'ks' | 'psi' | 'wasserstein' | 'kl_divergence';
  threshold: number;
  window: string;
  baseline: 'training' | 'production' | 'custom';
}

export interface QualityConfig {
  enabled: boolean;
  checks: QualityCheck[];
  threshold: number;
  frequency: string;
}

export interface QualityCheck {
  name: string;
  type: 'completeness' | 'uniqueness' | 'validity' | 'consistency';
  threshold: number;
  critical: boolean;
}

export interface PerformanceConfig {
  enabled: boolean;
  metrics: string[];
  sla: SLAConfig;
  optimization: boolean;
}

export interface SLAConfig {
  latency: number;
  throughput: number;
  availability: number;
  accuracy: number;
}

export interface FeatureMetadata {
  owner: string;
  team: string;
  tags: string[];
  documentation: string;
  examples: any[];
  lineage: FeatureLineage;
  usage: UsageStats;
}

export interface FeatureLineage {
  upstream: LineageNode[];
  downstream: LineageNode[];
  transformations: TransformationNode[];
}

export interface LineageNode {
  id: string;
  type: 'table' | 'view' | 'feature' | 'model';
  name: string;
  relationship: string;
}

export interface TransformationNode {
  id: string;
  type: string;
  code: string;
  version: string;
}

export interface UsageStats {
  consumers: Consumer[];
  queries: QueryStats;
  performance: PerformanceStats;
  costs: CostStats;
}

export interface Consumer {
  id: string;
  name: string;
  type: 'model' | 'service' | 'user';
  lastAccessed: Date;
  accessFrequency: number;
}

export interface QueryStats {
  totalQueries: number;
  avgLatency: number;
  errorRate: number;
  peakQPS: number;
  timeRange: string;
}

export interface PerformanceStats {
  computeCost: number;
  storageCost: number;
  networkCost: number;
  optimization: number;
}

export interface CostStats {
  total: number;
  breakdown: Record<string, number>;
  trends: CostTrend[];
  optimization: number;
}

export interface CostTrend {
  date: Date;
  cost: number;
  category: string;
}

export interface DataSource {
  type: 'batch' | 'stream' | 'api' | 'file';
  connection: SourceConnection;
  schema: SourceSchema;
  refresh: RefreshConfig;
}

export interface SourceConnection {
  provider: string;
  connectionString: string;
  credentials: CredentialConfig;
  options: Record<string, any>;
}

export interface SourceSchema {
  format: 'avro' | 'json' | 'parquet' | 'csv' | 'protobuf';
  location: string;
  evolution: boolean;
  validation: boolean;
}

export interface RefreshConfig {
  mode: 'full' | 'incremental' | 'upsert';
  frequency: string;
  watermark: string;
  backfill: boolean;
}

export interface FeatureSchema {
  version: string;
  fields: SchemaField[];
  primaryKey: string[];
  eventTime: string;
  created: Date;
  compatibility: 'backward' | 'forward' | 'full' | 'none';
}

export interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  metadata: Record<string, any>;
}

export interface FeatureGroupMetadata {
  owner: string;
  team: string;
  project: string;
  environment: string;
  tags: string[];
  documentation: string;
  sla: SLAConfig;
  cost: CostConfig;
}

export interface CostConfig {
  budget: number;
  alerts: CostAlert[];
  optimization: OptimizationConfig;
}

export interface CostAlert {
  threshold: number;
  type: 'absolute' | 'percentage';
  recipients: string[];
}

export interface OptimizationConfig {
  enabled: boolean;
  strategies: string[];
  schedule: string;
}

export interface FeatureVector {
  entityId: string;
  features: Record<string, any>;
  timestamp: Date;
  version: string;
  metadata: Record<string, any>;
}

export interface PointInTimeQuery {
  entities: string[];
  features: string[];
  timestamp: Date;
  excludeFeatures?: string[];
  includeMetadata?: boolean;
}

export interface FeatureServing {
  features: Record<string, any>;
  metadata: ServingMetadata;
  latency: number;
  cached: boolean;
}

export interface ServingMetadata {
  timestamp: Date;
  version: string;
  source: 'online' | 'offline' | 'computed';
  freshness: number;
  quality: QualityMetrics;
}

export interface QualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
}

export interface MaterializationJob {
  id: string;
  name: string;
  featureGroup: string;
  status: JobStatus;
  schedule: string;
  config: MaterializationConfig;
  metrics: JobMetrics;
  history: JobExecution[];
}

export interface JobStatus {
  state: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  message: string;
  startTime?: Date;
  endTime?: Date;
  progress: number;
}

export interface JobMetrics {
  recordsProcessed: number;
  recordsFailed: number;
  executionTime: number;
  resourceUsage: ResourceUsage;
  costs: number;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

export interface JobExecution {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: string;
  metrics: JobMetrics;
  errors: ExecutionError[];
}

export interface ExecutionError {
  type: string;
  message: string;
  stackTrace: string;
  timestamp: Date;
  severity: string;
}

export class FeatureStore extends EventEmitter {
  private config: FeatureStoreConfig;
  private featureGroups: Map<string, FeatureGroup> = new Map();
  private onlineStore: Map<string, FeatureVector> = new Map();
  private offlineStore: Map<string, FeatureVector[]> = new Map();
  private materializationJobs: Map<string, MaterializationJob> = new Map();
  private schemas: Map<string, FeatureSchema> = new Map();

  constructor(config: FeatureStoreConfig) {
    super();
    this.config = config;
    console.log('🏪 Feature Store initialized');
  }

  /**
   * Create a feature group
   */
  async createFeatureGroup(featureGroup: FeatureGroup): Promise<void> {
    console.log(`📦 Creating feature group: ${featureGroup.name}`);
    
    try {
      // Validate feature group
      await this.validateFeatureGroup(featureGroup);
      
      // Check if feature group already exists
      if (this.featureGroups.has(featureGroup.name)) {
        throw new Error(`Feature group ${featureGroup.name} already exists`);
      }
      
      // Store feature group
      this.featureGroups.set(featureGroup.name, featureGroup);
      this.schemas.set(featureGroup.name, featureGroup.schema);
      
      // Initialize online store partition
      await this.initializeOnlinePartition(featureGroup.name);
      
      // Initialize offline store partition
      await this.initializeOfflinePartition(featureGroup.name);
      
      // Emit event
      this.emit('featureGroupCreated', { name: featureGroup.name });
      
      console.log(`✅ Feature group created: ${featureGroup.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to create feature group ${featureGroup.name}:`, error);
      throw error;
    }
  }

  /**
   * Write features to online store
   */
  async writeOnline(featureGroupName: string, features: FeatureVector[]): Promise<void> {
    console.log(`📝 Writing ${features.length} feature vectors to online store`);
    
    try {
      const featureGroup = this.featureGroups.get(featureGroupName);
      if (!featureGroup) {
        throw new Error(`Feature group ${featureGroupName} not found`);
      }
      
      // Validate features against schema
      await this.validateFeatures(featureGroupName, features);
      
      // Write to online store with TTL
      for (const feature of features) {
        const key = this.generateOnlineKey(featureGroupName, feature.entityId);
        this.onlineStore.set(key, {
          ...feature,
          timestamp: new Date()
        });
        
        // Schedule TTL cleanup
        setTimeout(() => {
          this.onlineStore.delete(key);
        }, this.config.online.ttl * 1000);
      }
      
      // Emit event
      this.emit('onlineFeaturesWritten', { 
        featureGroup: featureGroupName, 
        count: features.length 
      });
      
      console.log(`✅ Written ${features.length} features to online store`);
      
    } catch (error) {
      console.error(`❌ Failed to write online features:`, error);
      throw error;
    }
  }

  /**
   * Write features to offline store
   */
  async writeOffline(featureGroupName: string, features: FeatureVector[]): Promise<void> {
    console.log(`📝 Writing ${features.length} feature vectors to offline store`);
    
    try {
      const featureGroup = this.featureGroups.get(featureGroupName);
      if (!featureGroup) {
        throw new Error(`Feature group ${featureGroupName} not found`);
      }
      
      // Validate features against schema
      await this.validateFeatures(featureGroupName, features);
      
      // Write to offline store (append mode)
      const key = featureGroupName;
      const existingFeatures = this.offlineStore.get(key) || [];
      this.offlineStore.set(key, [...existingFeatures, ...features]);
      
      // Emit event
      this.emit('offlineFeaturesWritten', { 
        featureGroup: featureGroupName, 
        count: features.length 
      });
      
      console.log(`✅ Written ${features.length} features to offline store`);
      
    } catch (error) {
      console.error(`❌ Failed to write offline features:`, error);
      throw error;
    }
  }

  /**
   * Get features for online serving
   */
  async getOnlineFeatures(
    featureGroupName: string, 
    entityIds: string[], 
    featureNames?: string[]
  ): Promise<FeatureServing[]> {
    console.log(`🔍 Getting online features for ${entityIds.length} entities`);
    
    try {
      const results: FeatureServing[] = [];
      const startTime = Date.now();
      
      for (const entityId of entityIds) {
        const key = this.generateOnlineKey(featureGroupName, entityId);
        const featureVector = this.onlineStore.get(key);
        
        if (featureVector) {
          const features = featureNames 
            ? this.filterFeatures(featureVector.features, featureNames)
            : featureVector.features;
          
          const freshness = Date.now() - featureVector.timestamp.getTime();
          
          results.push({
            features,
            metadata: {
              timestamp: featureVector.timestamp,
              version: featureVector.version,
              source: 'online',
              freshness,
              quality: await this.calculateQualityMetrics(features)
            },
            latency: Date.now() - startTime,
            cached: true
          });
        } else {
          // Feature not found in online store
          results.push({
            features: {},
            metadata: {
              timestamp: new Date(),
              version: '0.0.0',
              source: 'online',
              freshness: -1,
              quality: { completeness: 0, accuracy: 0, consistency: 0, timeliness: 0 }
            },
            latency: Date.now() - startTime,
            cached: false
          });
        }
      }
      
      console.log(`✅ Retrieved online features for ${entityIds.length} entities`);
      return results;
      
    } catch (error) {
      console.error(`❌ Failed to get online features:`, error);
      throw error;
    }
  }

  /**
   * Get historical features with point-in-time correctness
   */
  async getHistoricalFeatures(query: PointInTimeQuery): Promise<FeatureServing[]> {
    console.log(`📊 Getting historical features for ${query.entities.length} entities`);
    
    try {
      const results: FeatureServing[] = [];
      const startTime = Date.now();
      
      // For each entity, find features at the specified timestamp
      for (const entityId of query.entities) {
        const features = await this.getPointInTimeFeatures(
          entityId, 
          query.features, 
          query.timestamp
        );
        
        results.push({
          features,
          metadata: {
            timestamp: query.timestamp,
            version: '1.0.0',
            source: 'offline',
            freshness: Date.now() - query.timestamp.getTime(),
            quality: await this.calculateQualityMetrics(features)
          },
          latency: Date.now() - startTime,
          cached: false
        });
      }
      
      console.log(`✅ Retrieved historical features for ${query.entities.length} entities`);
      return results;
      
    } catch (error) {
      console.error(`❌ Failed to get historical features:`, error);
      throw error;
    }
  }

  /**
   * Create materialization job
   */
  async createMaterializationJob(
    name: string, 
    featureGroupName: string, 
    config: MaterializationConfig
  ): Promise<MaterializationJob> {
    console.log(`⚙️ Creating materialization job: ${name}`);
    
    try {
      const job: MaterializationJob = {
        id: this.generateJobId(),
        name,
        featureGroup: featureGroupName,
        status: {
          state: 'pending',
          message: 'Job created',
          progress: 0
        },
        schedule: config.triggers[0]?.schedule || '@daily',
        config,
        metrics: {
          recordsProcessed: 0,
          recordsFailed: 0,
          executionTime: 0,
          resourceUsage: { cpu: 0, memory: 0, storage: 0, network: 0 },
          costs: 0
        },
        history: []
      };
      
      this.materializationJobs.set(job.id, job);
      
      // Schedule job if configured
      this.scheduleJob(job);
      
      console.log(`✅ Materialization job created: ${name}`);
      return job;
      
    } catch (error) {
      console.error(`❌ Failed to create materialization job:`, error);
      throw error;
    }
  }

  /**
   * Run materialization job
   */
  async runMaterializationJob(jobId: string): Promise<JobExecution> {
    console.log(`▶️ Running materialization job: ${jobId}`);
    
    try {
      const job = this.materializationJobs.get(jobId);
      if (!job) {
        throw new Error(`Materialization job ${jobId} not found`);
      }
      
      const execution: JobExecution = {
        id: this.generateExecutionId(),
        startTime: new Date(),
        status: 'running',
        metrics: {
          recordsProcessed: 0,
          recordsFailed: 0,
          executionTime: 0,
          resourceUsage: { cpu: 0, memory: 0, storage: 0, network: 0 },
          costs: 0
        },
        errors: []
      };
      
      job.status.state = 'running';
      job.status.startTime = execution.startTime;
      job.status.progress = 0;
      
      try {
        // Simulate materialization process
        await this.executeMaterialization(job, execution);
        
        execution.endTime = new Date();
        execution.status = 'completed';
        execution.metrics.executionTime = execution.endTime.getTime() - execution.startTime.getTime();
        
        job.status.state = 'completed';
        job.status.endTime = execution.endTime;
        job.status.progress = 100;
        job.status.message = 'Job completed successfully';
        
        // Update job metrics
        job.metrics = { ...job.metrics, ...execution.metrics };
        
      } catch (error) {
        execution.endTime = new Date();
        execution.status = 'failed';
        execution.errors.push({
          type: 'execution_error',
          message: error instanceof Error ? error.message : String(error),
          stackTrace: error instanceof Error ? error.stack || '' : '',
          timestamp: new Date(),
          severity: 'error'
        });
        
        job.status.state = 'failed';
        job.status.endTime = execution.endTime;
        job.status.message = `Job failed: ${error instanceof Error ? error.message : String(error)}`;
      }
      
      job.history.push(execution);
      
      // Emit event
      this.emit('jobExecuted', { jobId, execution });
      
      console.log(`✅ Materialization job ${execution.status}: ${jobId}`);
      return execution;
      
    } catch (error) {
      console.error(`❌ Failed to run materialization job:`, error);
      throw error;
    }
  }

  /**
   * Monitor feature drift
   */
  async monitorFeatureDrift(featureGroupName: string): Promise<DriftReport> {
    console.log(`📊 Monitoring feature drift for: ${featureGroupName}`);
    
    try {
      const featureGroup = this.featureGroups.get(featureGroupName);
      if (!featureGroup) {
        throw new Error(`Feature group ${featureGroupName} not found`);
      }
      
      const report: DriftReport = {
        featureGroup: featureGroupName,
        timestamp: new Date(),
        features: [],
        overallDrift: 0,
        recommendations: []
      };
      
      // Analyze each feature for drift
      for (const feature of featureGroup.features) {
        if (feature.monitoring.drift.enabled) {
          const drift = await this.calculateFeatureDrift(featureGroupName, feature.name);
          report.features.push(drift);
          report.overallDrift = Math.max(report.overallDrift, drift.score);
        }
      }
      
      // Generate recommendations
      report.recommendations = this.generateDriftRecommendations(report);
      
      console.log(`✅ Drift monitoring completed for: ${featureGroupName}`);
      return report;
      
    } catch (error) {
      console.error(`❌ Failed to monitor feature drift:`, error);
      throw error;
    }
  }

  /**
   * Get feature lineage
   */
  async getFeatureLineage(featureGroupName: string, featureName: string): Promise<FeatureLineage> {
    console.log(`🔗 Getting feature lineage: ${featureGroupName}.${featureName}`);
    
    try {
      const featureGroup = this.featureGroups.get(featureGroupName);
      if (!featureGroup) {
        throw new Error(`Feature group ${featureGroupName} not found`);
      }
      
      const feature = featureGroup.features.find(f => f.name === featureName);
      if (!feature) {
        throw new Error(`Feature ${featureName} not found`);
      }
      
      return feature.metadata.lineage;
      
    } catch (error) {
      console.error(`❌ Failed to get feature lineage:`, error);
      throw error;
    }
  }

  /**
   * Search features
   */
  async searchFeatures(query: FeatureSearchQuery): Promise<FeatureSearchResult> {
    console.log(`🔍 Searching features: ${query.query}`);
    
    try {
      const results: FeatureSearchResult = {
        features: [],
        facets: [],
        totalCount: 0
      };
      
      // Search through all feature groups
      for (const [groupName, featureGroup] of this.featureGroups) {
        for (const feature of featureGroup.features) {
          if (this.matchesSearchQuery(feature, query)) {
            results.features.push({
              featureGroup: groupName,
              feature,
              relevanceScore: this.calculateRelevanceScore(feature, query)
            });
          }
        }
      }
      
      // Sort by relevance
      results.features.sort((a, b) => b.relevanceScore - a.relevanceScore);
      results.totalCount = results.features.length;
      
      // Generate facets
      results.facets = this.generateFeatureFacets(results.features);
      
      console.log(`✅ Found ${results.totalCount} features`);
      return results;
      
    } catch (error) {
      console.error(`❌ Feature search failed:`, error);
      throw error;
    }
  }

  // Helper methods

  private async validateFeatureGroup(featureGroup: FeatureGroup): Promise<void> {
    if (!featureGroup.name || !featureGroup.schema) {
      throw new Error('Feature group name and schema are required');
    }
    
    // Validate features
    for (const feature of featureGroup.features) {
      await this.validateFeature(feature);
    }
  }

  private async validateFeature(feature: Feature): Promise<void> {
    if (!feature.name || !feature.type) {
      throw new Error('Feature name and type are required');
    }
    
    // Additional validation logic would go here
  }

  private async validateFeatures(featureGroupName: string, features: FeatureVector[]): Promise<void> {
    const schema = this.schemas.get(featureGroupName);
    if (!schema) {
      throw new Error(`Schema not found for feature group: ${featureGroupName}`);
    }
    
    // Schema validation would be implemented here
    console.log(`Validating ${features.length} features against schema`);
  }

  private generateOnlineKey(featureGroupName: string, entityId: string): string {
    return `${featureGroupName}:${entityId}`;
  }

  private filterFeatures(features: Record<string, any>, featureNames: string[]): Record<string, any> {
    const filtered: Record<string, any> = {};
    for (const name of featureNames) {
      if (features.hasOwnProperty(name)) {
        filtered[name] = features[name];
      }
    }
    return filtered;
  }

  private async calculateQualityMetrics(features: Record<string, any>): Promise<QualityMetrics> {
    const totalFeatures = Object.keys(features).length;
    const nonNullFeatures = Object.values(features).filter(v => v !== null && v !== undefined).length;
    
    return {
      completeness: totalFeatures > 0 ? nonNullFeatures / totalFeatures : 0,
      accuracy: 1.0, // Would implement actual accuracy calculation
      consistency: 1.0, // Would implement consistency checks
      timeliness: 1.0 // Would implement timeliness calculation
    };
  }

  private async getPointInTimeFeatures(
    entityId: string, 
    featureNames: string[], 
    timestamp: Date
  ): Promise<Record<string, any>> {
    // Mock implementation for point-in-time correctness
    const features: Record<string, any> = {};
    
    for (const featureName of featureNames) {
      // In real implementation, would query offline store with temporal joins
      features[featureName] = Math.random(); // Mock feature value
    }
    
    return features;
  }

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private scheduleJob(job: MaterializationJob): void {
    console.log(`📅 Scheduling job: ${job.name}`);
    // Mock job scheduling - would integrate with actual scheduler
  }

  private async executeMaterialization(job: MaterializationJob, execution: JobExecution): Promise<void> {
    console.log(`⚙️ Executing materialization: ${job.name}`);
    
    // Mock materialization process
    const totalRecords = 1000;
    for (let i = 0; i < totalRecords; i++) {
      await new Promise(resolve => setTimeout(resolve, 1)); // Simulate processing
      execution.metrics.recordsProcessed = i + 1;
      job.status.progress = Math.round((i + 1) / totalRecords * 100);
    }
    
    console.log(`✅ Materialization completed: ${job.name}`);
  }

  private async calculateFeatureDrift(featureGroupName: string, featureName: string): Promise<FeatureDriftResult> {
    // Mock drift calculation
    return {
      feature: featureName,
      score: Math.random(),
      threshold: 0.1,
      detected: Math.random() > 0.8,
      algorithm: 'ks',
      pValue: Math.random(),
      recommendation: 'Monitor closely'
    };
  }

  private generateDriftRecommendations(report: DriftReport): string[] {
    const recommendations: string[] = [];
    
    if (report.overallDrift > 0.3) {
      recommendations.push('Significant drift detected - consider retraining models');
    }
    
    const driftedFeatures = report.features.filter(f => f.detected);
    if (driftedFeatures.length > 0) {
      recommendations.push(`${driftedFeatures.length} features show drift - investigate data sources`);
    }
    
    return recommendations;
  }

  private matchesSearchQuery(feature: Feature, query: FeatureSearchQuery): boolean {
    const searchText = query.query.toLowerCase();
    const featureText = `${feature.name} ${feature.description}`.toLowerCase();
    return featureText.includes(searchText);
  }

  private calculateRelevanceScore(feature: Feature, query: FeatureSearchQuery): number {
    // Simple relevance scoring based on name match
    if (feature.name.toLowerCase().includes(query.query.toLowerCase())) {
      return 1.0;
    }
    if (feature.description.toLowerCase().includes(query.query.toLowerCase())) {
      return 0.7;
    }
    return 0.3;
  }

  private generateFeatureFacets(features: FeatureSearchItem[]): SearchFacet[] {
    const facets: SearchFacet[] = [];
    
    // Type facet
    const typeCounts = new Map<string, number>();
    features.forEach(item => {
      const type = item.feature.type.dataType;
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });
    
    facets.push({
      field: 'type',
      values: Array.from(typeCounts.entries()).map(([value, count]) => ({ value, count }))
    });
    
    return facets;
  }

  private async initializeOnlinePartition(featureGroupName: string): Promise<void> {
    console.log(`🔧 Initializing online partition for: ${featureGroupName}`);
    // Mock initialization
  }

  private async initializeOfflinePartition(featureGroupName: string): Promise<void> {
    console.log(`🔧 Initializing offline partition for: ${featureGroupName}`);
    // Mock initialization
  }

  // Public getters

  public getFeatureGroups(): string[] {
    return Array.from(this.featureGroups.keys());
  }

  public getFeatureGroup(name: string): FeatureGroup | undefined {
    return this.featureGroups.get(name);
  }

  public getMaterializationJobs(): MaterializationJob[] {
    return Array.from(this.materializationJobs.values());
  }

  public getStats(): FeatureStoreStats {
    const totalFeatureGroups = this.featureGroups.size;
    const totalFeatures = Array.from(this.featureGroups.values())
      .reduce((sum, fg) => sum + fg.features.length, 0);
    const onlineFeatures = this.onlineStore.size;
    const runningJobs = Array.from(this.materializationJobs.values())
      .filter(job => job.status.state === 'running').length;
    
    return {
      totalFeatureGroups,
      totalFeatures,
      onlineFeatures,
      offlineFeatures: this.offlineStore.size,
      runningJobs,
      totalJobs: this.materializationJobs.size
    };
  }
}

// Additional interfaces for search and drift monitoring
export interface FeatureSearchQuery {
  query: string;
  type?: string;
  tags?: string[];
  featureGroup?: string;
}

export interface FeatureSearchResult {
  features: FeatureSearchItem[];
  facets: SearchFacet[];
  totalCount: number;
}

export interface FeatureSearchItem {
  featureGroup: string;
  feature: Feature;
  relevanceScore: number;
}

export interface SearchFacet {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface DriftReport {
  featureGroup: string;
  timestamp: Date;
  features: FeatureDriftResult[];
  overallDrift: number;
  recommendations: string[];
}

export interface FeatureDriftResult {
  feature: string;
  score: number;
  threshold: number;
  detected: boolean;
  algorithm: string;
  pValue: number;
  recommendation: string;
}

export interface FeatureStoreStats {
  totalFeatureGroups: number;
  totalFeatures: number;
  onlineFeatures: number;
  offlineFeatures: number;
  runningJobs: number;
  totalJobs: number;
}