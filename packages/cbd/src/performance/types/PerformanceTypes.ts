/**
 * Performance Optimization Types - Comprehensive Type Definitions
 * 
 * This file contains all type definitions for the CBD Database Performance 
 * Optimization system, implementing 2025 industry best practices for 
 * enterprise database performance management.
 * 
 * @version 1.0.0
 * @description CBD Performance Optimization Type System
 */

// Core configuration types
export interface PerformanceConfig {
  queryOptimization: QueryOptimizationConfig;
  indexOptimization: IndexOptimizationConfig;
  caching: CachingConfig;
  resourceManagement: ResourceManagementConfig;
  monitoring: MonitoringConfig;
  adaptiveExecution: AdaptiveExecutionConfig;
  materializedViews: MaterializedViewConfig;
  compression: CompressionConfig;
  connectionPooling: ConnectionPoolConfig;
  partitioning: PartitioningConfig;
}

export interface QueryOptimizationConfig {
  enabled: boolean;
  slowQueryThreshold: number; // milliseconds
  maxOptimizationTime: number; // milliseconds
  cacheOptimizations: boolean;
  adaptiveExecution: boolean;
  parallelizationEnabled: boolean;
  costBasedOptimization: boolean;
  hintGeneration: boolean;
  rewriteRules: QueryRewriteRule[];
  statisticsUpdateFrequency: number; // hours
}

export interface IndexOptimizationConfig {
  enabled: boolean;
  autoCreateIndexes: boolean;
  autoDropUnusedIndexes: boolean;
  fragmentationThreshold: number; // percentage
  unusedThresholdDays: number;
  minimumImpactThreshold: number; // percentage
  minimumCompositeImpact: number; // percentage
  maxIndexesPerTable: number;
  maintenanceWindowHours: number[];
  fillFactorOptimization: boolean;
}

export interface CachingConfig {
  enabled: boolean;
  defaultEvictionPolicy: 'LRU' | 'LFU' | 'FIFO' | 'adaptive';
  targetHitRate: number; // percentage as decimal (0.85 = 85%)
  optimizationCacheMaxAge: number; // milliseconds
  l1Cache: CacheLayerConfig;
  l2Cache: CacheLayerConfig;
  l3Cache: CacheLayerConfig;
  cdnCache: CacheLayerConfig;
  warmingSchedule: CacheWarmingSchedule;
  ttlStrategies: TTLStrategy[];
  compressionEnabled: boolean;
}

export interface CacheLayerConfig {
  enabled: boolean;
  maxSize: number; // MB
  ttl: number; // seconds
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO' | 'adaptive';
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  replicationFactor?: number;
}

export interface CacheWarmingSchedule {
  enabled: boolean;
  schedules: Array<{
    cron: string;
    queries: string[];
    priority: 'low' | 'medium' | 'high';
  }>;
}

export interface TTLStrategy {
  pattern: string; // SQL pattern or cache key pattern
  ttl: number; // seconds
  refreshAhead: boolean;
  refreshThreshold: number; // percentage (0.1 = refresh when 10% of TTL remains)
}

export interface ResourceManagementConfig {
  enabled: boolean;
  bufferPoolSize: number; // MB
  sortMemorySize: number; // MB
  tempTableMemorySize: number; // MB
  networkCompression: boolean;
  keepAliveSettings: KeepAliveSettings;
  autoScaling: AutoScalingConfig;
  resourceLimits: ResourceLimits;
}

export interface KeepAliveSettings {
  enabled: boolean;
  idleTimeout: number; // seconds
  maxLifetime: number; // seconds
  keepAliveInterval: number; // seconds
}

export interface AutoScalingConfig {
  enabled: boolean;
  scaleUpThresholds: ScalingThresholds;
  scaleDownThresholds: ScalingThresholds;
  cooldownPeriods: CooldownPeriods;
  maxScaleUpFactor: number;
  predictiveScaling: boolean;
}

export interface ScalingThresholds {
  cpu: number; // percentage
  memory: number; // percentage
  connections: number; // percentage of max
  responseTime: number; // milliseconds
}

export interface CooldownPeriods {
  scaleUp: number; // seconds
  scaleDown: number; // seconds
}

export interface ResourceLimits {
  maxConnections: number;
  maxCpuUsage: number; // percentage
  maxMemoryUsage: number; // percentage
  maxIOPS: number;
  maxBandwidth: number; // Mbps
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsCollectionInterval: number; // seconds
  detailedRetention: number; // days
  aggregatedRetention: number; // days
  alertRetention: number; // days
  alertThresholds: AlertThresholds;
  anomalyDetection: AnomalyDetectionConfig;
  notificationChannels: NotificationChannel[];
  customMetrics: CustomMetricConfig[];
  autoRemediation: boolean;
}

export interface AlertThresholds {
  responseTime: number; // milliseconds
  errorRate: number; // percentage
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  diskUsage: number; // percentage
  connectionCount: number; // absolute number
  cacheHitRate: number; // percentage
}

export interface AnomalyDetectionConfig {
  enabled: boolean;
  algorithm: 'statistical' | 'machine_learning' | 'hybrid';
  sensitivity: 'low' | 'medium' | 'high';
  learningPeriod: number; // days
  minimumConfidence: number; // percentage
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  config: Record<string, any>;
  severity: Array<'info' | 'warning' | 'critical'>;
}

export interface CustomMetricConfig {
  name: string;
  query: string;
  interval: number; // seconds
  unit: string;
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count';
}

export interface AdaptiveExecutionConfig {
  enabled: boolean;
  learningEnabled: boolean;
  adaptationThreshold: number; // percentage improvement required
  maxExecutionPlans: number;
  planCacheSize: number; // MB
  statisticsUpdateFrequency: number; // hours
}

export interface MaterializedViewConfig {
  enabled: boolean;
  autoRefreshEnabled: boolean;
  refreshStrategies: RefreshStrategy[];
  maxViews: number;
  storageOptimization: boolean;
}

export interface RefreshStrategy {
  pattern: string; // table or view pattern
  strategy: 'immediate' | 'scheduled' | 'on_demand';
  schedule?: string; // cron expression
  incrementalRefresh: boolean;
}

export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'lz4' | 'zstd' | 'adaptive';
  level: number; // compression level (1-9)
  minSizeThreshold: number; // bytes
  excludePatterns: string[];
}

export interface ConnectionPoolConfig {
  minConnections: number;
  maxConnections: number;
  idleTimeout: number; // seconds
  connectionTimeout: number; // seconds
  validationQuery: string;
  testOnBorrow: boolean;
  testOnReturn: boolean;
  testWhileIdle: boolean;
}

export interface PartitioningConfig {
  enabled: boolean;
  autoPartitioning: boolean;
  strategies: PartitioningStrategy[];
  maintenanceEnabled: boolean;
}

export interface PartitioningStrategy {
  tableName: string;
  type: 'range' | 'hash' | 'list' | 'composite';
  column: string;
  partitionCount?: number;
  partitionSize?: number; // MB
  retentionPolicy?: PartitionRetentionPolicy;
}

export interface PartitionRetentionPolicy {
  enabled: boolean;
  retentionPeriod: number; // days
  archiveOldPartitions: boolean;
  archiveLocation?: string;
}

// Query optimization types
export interface QueryOptimizer {
  analyzeQuery(sql: string, parameters?: Record<string, any>): Promise<QueryAnalysis>;
  generateOptimizedQuery(analysis: QueryAnalysis): Promise<OptimizedQuery>;
  suggestIndexes(analysis: QueryAnalysis): Promise<IndexSuggestion[]>;
  estimateExecutionCost(query: string, parameters?: Record<string, any>): Promise<ExecutionCost>;
}

export interface QueryAnalysis {
  originalSql: string;
  normalizedSql: string;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'MERGE';
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  estimatedRows: number;
  estimatedCost: number;
  bottlenecks: QueryBottleneck[];
  indexUsage: IndexUsageInfo[];
  joinAnalysis: JoinAnalysis[];
  filterAnalysis: FilterAnalysis[];
  aggregationAnalysis?: AggregationAnalysis;
  subqueryAnalysis?: SubqueryAnalysis[];
}

export interface OptimizedQuery {
  sql: string;
  parameters?: Record<string, any>;
  hints: QueryHint[];
  estimatedImprovement: number; // percentage
  confidence: number; // percentage
}

export interface QueryBottleneck {
  type: 'missing_index' | 'table_scan' | 'inefficient_join' | 'subquery' | 'sort' | 'aggregation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: number; // percentage
  recommendation: string;
}

export interface IndexUsageInfo {
  indexName: string;
  tableName: string;
  usage: 'full' | 'partial' | 'none';
  selectivity: number; // percentage
  cost: number;
}

export interface JoinAnalysis {
  joinType: 'inner' | 'left' | 'right' | 'full' | 'cross';
  leftTable: string;
  rightTable: string;
  joinCondition: string;
  estimatedRows: number;
  indexSupport: boolean;
  recommendation?: string;
}

export interface FilterAnalysis {
  column: string;
  operator: string;
  selectivity: number; // percentage
  indexSupport: boolean;
  distribution: 'uniform' | 'skewed' | 'clustered';
}

export interface AggregationAnalysis {
  groupByColumns: string[];
  aggregateFunctions: AggregateFunction[];
  estimatedGroups: number;
  sortRequired: boolean;
  indexSupport: boolean;
}

export interface AggregateFunction {
  function: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'DISTINCT';
  column: string;
  nullable: boolean;
}

export interface SubqueryAnalysis {
  type: 'scalar' | 'exists' | 'in' | 'correlated';
  complexity: 'simple' | 'moderate' | 'complex';
  canBeFlattenned: boolean;
  estimatedRows: number;
  recommendation?: string;
}

export interface QueryHint {
  type: 'index' | 'join' | 'execution' | 'resource';
  hint: string;
  reasoning: string;
}

export interface IndexSuggestion {
  tableName: string;
  columns: string[];
  type: 'clustered' | 'nonclustered' | 'unique' | 'filtered' | 'columnstore';
  estimatedBenefit: number; // percentage
  estimatedCost: number; // MB
  priority: 'low' | 'medium' | 'high';
  createStatement: string;
}

export interface ExecutionCost {
  cpuCost: number;
  ioCost: number;
  memoryCost: number;
  networkCost: number;
  totalCost: number;
  unit: 'cost_units' | 'time_ms' | 'resources';
}

export interface QueryRewriteRule {
  name: string;
  pattern: string; // regex pattern
  replacement: string;
  conditions: string[];
  description: string;
  enabled: boolean;
}

// Execution plan types
export interface QueryExecutionPlan {
  planId: string;
  query: string;
  estimatedCost: number;
  actualCost?: number;
  estimatedRows: number;
  actualRows?: number;
  executionTime?: number; // milliseconds
  operators: ExecutionOperator[];
  warnings: PlanWarning[];
  recommendations: PlanRecommendation[];
  statistics: ExecutionStatistics;
}

export interface ExecutionOperator {
  operatorId: string;
  type: string;
  description: string;
  cost: number;
  rows: number;
  children: ExecutionOperator[];
  properties: Record<string, any>;
}

export interface PlanWarning {
  type: 'missing_index' | 'implicit_conversion' | 'scan_operation' | 'sort_spill';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  affectedOperator?: string;
}

export interface PlanRecommendation {
  type: 'index' | 'statistics' | 'query_rewrite' | 'configuration';
  priority: 'low' | 'medium' | 'high';
  description: string;
  expectedBenefit: number; // percentage
  implementation: string;
}

export interface ExecutionStatistics {
  compileTime: number; // milliseconds
  executionTime: number; // milliseconds
  cpuTime: number; // milliseconds
  ioReads: number;
  ioWrites: number;
  logicalReads: number;
  physicalReads: number;
  memoryGrant: number; // KB
  parallelism: number; // degree of parallelism
}

// Index optimization types
export interface IndexOptimizer {
  analyzeIndexUsage(timeRange: { start: Date; end: Date }): Promise<IndexUsageReport>;
  suggestNewIndexes(queries: string[]): Promise<IndexSuggestion[]>;
  identifyFragmentedIndexes(threshold: number): Promise<FragmentedIndex[]>;
  findUnusedIndexes(unusedDays: number): Promise<UnusedIndex[]>;
  generateMaintenancePlan(): Promise<IndexMaintenancePlan>;
}

export interface IndexUsageReport {
  totalIndexes: number;
  usedIndexes: number;
  unusedIndexes: number;
  fragmentedIndexes: number;
  indexDetails: IndexDetail[];
  recommendations: IndexRecommendation[];
  timeRange: { start: Date; end: Date };
}

export interface IndexDetail {
  indexName: string;
  tableName: string;
  type: string;
  columns: string[];
  size: number; // MB
  usage: IndexUsage;
  fragmentation: IndexFragmentation;
  maintenance: IndexMaintenance;
}

export interface IndexUsage {
  seeks: number;
  scans: number;
  lookups: number;
  updates: number;
  lastUsed: Date | null;
  avgUserImpact: number; // percentage
}

export interface IndexFragmentation {
  avgFragmentationPercent: number;
  fragmentCount: number;
  avgFragmentSizePages: number;
  pageCount: number;
}

export interface IndexMaintenance {
  lastRebuilt: Date | null;
  lastReorganized: Date | null;
  maintenanceFrequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  estimatedMaintenanceCost: number; // minutes
}

export interface FragmentedIndex {
  indexName: string;
  tableName: string;
  fragmentationPercent: number;
  pageCount: number;
  recommendedAction: 'rebuild' | 'reorganize';
  estimatedBenefit: number; // percentage
  maintenanceWindow: number; // minutes
}

export interface UnusedIndex {
  indexName: string;
  tableName: string;
  daysUnused: number;
  size: number; // MB
  maintenanceOverhead: number; // cost per day
  dropStatement: string;
  impactAssessment: string;
}

export interface IndexMaintenancePlan {
  schedule: IndexMaintenanceTask[];
  estimatedDuration: number; // minutes
  estimatedBenefit: number; // percentage performance improvement
  resourceRequirements: MaintenanceResourceRequirements;
}

export interface IndexMaintenanceTask {
  indexName: string;
  tableName: string;
  action: 'rebuild' | 'reorganize' | 'update_statistics';
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number; // minutes
  maintenanceWindow: string; // cron expression
  prerequisites: string[];
}

export interface MaintenanceResourceRequirements {
  minCpuCores: number;
  minMemory: number; // MB
  minDiskSpace: number; // MB
  estimatedIO: number; // IOPS
}

export interface IndexAnalysis {
  type: 'missing' | 'fragmented' | 'unused' | 'composite' | 'duplicate';
  tableName: string;
  indexName?: string;
  columns?: string[];
  action: 'create' | 'rebuild' | 'reorganize' | 'drop' | 'merge';
  estimatedImpact?: number;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  estimatedSize?: number;
  maintenanceCost?: number;
  sql?: string;
}

export interface IndexRecommendation {
  type: 'create' | 'modify' | 'drop' | 'maintain';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  estimatedBenefit: number; // percentage
  estimatedCost: number; // implementation cost
  riskLevel: 'low' | 'medium' | 'high';
  implementation: IndexImplementation;
}

export interface IndexImplementation {
  steps: string[];
  sql: string[];
  rollbackPlan: string[];
  testingRecommendations: string[];
}

// Cache optimization types
export interface CacheStrategy {
  layers: CacheLayerStrategy[];
  evictionPolicy: EvictionPolicy;
  invalidationStrategy: InvalidationStrategy;
  warmingStrategy: WarmingStrategy;
  compressionStrategy: CompressionStrategy;
}

export interface CacheLayerStrategy {
  layer: 'L1' | 'L2' | 'L3' | 'CDN';
  enabled: boolean;
  maxSize: number; // MB
  ttl: number; // seconds
  hitRateTarget: number; // percentage
  keyPatterns: string[];
}

export interface EvictionPolicy {
  algorithm: 'LRU' | 'LFU' | 'FIFO' | 'Random' | 'Adaptive';
  parameters: Record<string, any>;
  customRules: EvictionRule[];
}

export interface EvictionRule {
  condition: string;
  action: 'evict' | 'extend_ttl' | 'promote' | 'demote';
  priority: number;
}

export interface InvalidationStrategy {
  timeBasedRules: TTLRule[];
  eventBasedRules: EventRule[];
  dependencyBasedRules: DependencyRule[];
  manualInvalidationEnabled: boolean;
}

export interface TTLRule {
  pattern: string;
  ttl: number; // seconds
  refreshAhead: boolean;
  refreshThreshold: number; // percentage
}

export interface EventRule {
  event: string;
  patterns: string[];
  propagate: boolean;
}

export interface DependencyRule {
  sourcePattern: string;
  dependentPatterns: string[];
  invalidationType: 'immediate' | 'lazy' | 'scheduled';
}

export interface WarmingStrategy {
  enabled: boolean;
  criticalQueries: string[];
  schedule: WarmingSchedule[];
  preemptiveWarming: boolean;
}

export interface WarmingSchedule {
  cron: string;
  queries: string[];
  priority: 'low' | 'medium' | 'high';
  concurrency: number;
}

export interface CompressionStrategy {
  enabled: boolean;
  algorithm: 'gzip' | 'lz4' | 'zstd';
  level: number;
  minSize: number; // bytes
  patterns: string[];
}

export interface CacheMetrics {
  l1Cache?: CacheLayerMetrics;
  l2Cache?: CacheLayerMetrics;
  l3Cache?: CacheLayerMetrics;
  cdnCache?: CacheLayerMetrics;
  overallHitRate: number;
  memoryUtilization: number;
  networkLatencyReduction?: number;
  costSavings?: number;
  optimizationsApplied?: any[];
  recommendations?: any[];
  timestamp: Date;
}

export interface CacheLayerMetrics {
  hitRate: number; // percentage
  missRate: number; // percentage
  evictionRate: number; // per second
  memoryUsage: number; // MB
  avgResponseTime: number; // milliseconds
  throughput: number; // requests per second
  errors: number;
}

// Resource management types
export interface ResourceManager {
  monitorUtilization(): Promise<ResourceUtilization>;
  optimizeAllocation(workload: WorkloadProfile): Promise<OptimizationResult>;
  scaleResources(direction: 'up' | 'down', factor: number): Promise<ScalingResult>;
  generateResourceReport(): Promise<ResourceReport>;
}

export interface ResourceUtilization {
  cpu?: {
    usage: number; // percentage
    optimization?: any;
    efficiency?: number;
    parallelizationLevel?: number;
  };
  memory?: {
    usage: number; // percentage
    optimization?: any;
    bufferHitRate?: number;
    memoryPressure?: number;
  };
  io?: {
    metrics?: any;
    optimization?: any;
    throughputImprovement?: number;
    latencyReduction?: number;
  };
  network?: {
    metrics?: any;
    optimization?: any;
    bandwidthUtilization?: number;
    latencyOptimization?: number;
  };
  bottlenecks?: ResourceBottleneck[];
  recommendations?: string[];
  timestamp: Date;
}

export interface ResourceBottleneck {
  resource: 'cpu' | 'memory' | 'io' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  currentUtilization: number; // percentage
  impact: string;
  recommendation: string;
  estimatedCost: number;
}

export interface WorkloadProfile {
  queryTypes: QueryTypeDistribution;
  concurrency: ConcurrencyProfile;
  dataAccess: DataAccessProfile;
  temporalPatterns: TemporalPattern[];
}

export interface QueryTypeDistribution {
  select: number; // percentage
  insert: number; // percentage
  update: number; // percentage
  delete: number; // percentage
  complex: number; // percentage (analytical queries)
}

export interface ConcurrencyProfile {
  avgConcurrentQueries: number;
  peakConcurrentQueries: number;
  concurrencyPatterns: ConcurrencyPattern[];
}

export interface ConcurrencyPattern {
  timeRange: { start: string; end: string }; // HH:MM format
  avgConcurrency: number;
  peakConcurrency: number;
  queryMix: QueryTypeDistribution;
}

export interface DataAccessProfile {
  hotData: number; // percentage of data accessed frequently
  warmData: number; // percentage of data accessed occasionally
  coldData: number; // percentage of data rarely accessed
  accessPatterns: AccessPattern[];
}

export interface AccessPattern {
  pattern: 'sequential' | 'random' | 'clustered' | 'mixed';
  frequency: number; // percentage
  dataSize: number; // MB
  locality: 'high' | 'medium' | 'low';
}

export interface TemporalPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  peakHours: string[]; // ['09:00', '17:00']
  pattern: 'consistent' | 'bursty' | 'gradual' | 'irregular';
  scalingFactor: number; // multiplier during peak
}

export interface ScalingResult {
  success: boolean;
  newConfiguration: ResourceConfiguration;
  estimatedImpact: ScalingImpact;
  cost: ScalingCost;
}

export interface ResourceConfiguration {
  cpuCores: number;
  memoryGB: number;
  storageGB: number;
  iops: number;
  networkBandwidthMbps: number;
}

export interface ScalingImpact {
  performanceImprovement: number; // percentage
  capacityIncrease: number; // percentage
  availabilityImprovement?: number; // percentage
  estimatedBenefit: string;
}

export interface ScalingCost {
  setupCost: number;
  recurringCost: number; // per month
  downtimeCost?: number;
  totalFirstYearCost: number;
}

export interface ResourceReport {
  currentUtilization: ResourceUtilization;
  trends: ResourceTrend[];
  recommendations: ResourceRecommendation[];
  forecastedNeeds: ResourceForecast[];
  costOptimization: CostOptimizationSuggestion[];
}

export interface ResourceTrend {
  resource: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  changeRate: number; // percentage per time period
  timePeriod: string;
  confidence: number; // percentage
}

export interface ResourceRecommendation {
  type: 'scale' | 'optimize' | 'redistribute' | 'upgrade';
  resource: string;
  priority: 'low' | 'medium' | 'high';
  description: string;
  estimatedBenefit: number; // percentage
  estimatedCost: number;
  timeframe: string;
}

export interface ResourceForecast {
  resource: string;
  timeHorizon: '1month' | '3months' | '6months' | '1year';
  forecastedUtilization: number; // percentage
  confidence: number; // percentage
  recommendations: string[];
}

export interface CostOptimizationSuggestion {
  type: 'rightsizing' | 'scheduling' | 'compression' | 'archival' | 'caching';
  description: string;
  estimatedSavings: number; // per month
  implementationEffort: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
}

// Monitoring types
export interface MonitoringMetrics {
  timestamp: Date;
  queryMetrics: QueryMetrics;
  resourceMetrics: ResourceMetrics;
  cacheMetrics: CachePerformanceMetrics;
  indexMetrics: IndexPerformanceMetrics;
  systemMetrics: SystemMetrics;
}

export interface QueryMetrics {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  avgResponseTime: number; // milliseconds
  medianResponseTime: number; // milliseconds
  p95ResponseTime: number; // milliseconds
  p99ResponseTime: number; // milliseconds
  slowQueries: SlowQuery[];
  queryTypeBreakdown: QueryTypeDistribution;
}

export interface SlowQuery {
  sql: string;
  executionTime: number; // milliseconds
  timestamp: Date;
  executionCount: number;
  avgExecutionTime: number; // milliseconds
}

export interface ResourceMetrics {
  cpu: {
    usage: number; // percentage
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number; // MB
    used: number; // MB
    bufferPool: number; // MB
    cached: number; // MB
  };
  io: {
    readOps: number;
    writeOps: number;
    readThroughput: number; // MB/s
    writeThroughput: number; // MB/s
    avgLatency: number; // milliseconds
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    avgLatency: number; // milliseconds
  };
  averageUtilization?: any;
}

export interface CachePerformanceMetrics {
  hitRate: number; // percentage
  missRate: number; // percentage
  evictionRate: number; // per minute
  avgLookupTime: number; // milliseconds
  memoryUsage: number; // MB
  keyCount: number;
}

export interface IndexPerformanceMetrics {
  seekOperations: number;
  scanOperations: number;
  avgSeekTime: number; // milliseconds
  avgScanTime: number; // milliseconds
  indexMaintenanceTime: number; // seconds
  fragmentationLevel: number; // percentage
}

export interface SystemMetrics {
  uptime: number; // seconds
  connections: {
    total: number;
    active: number;
    idle: number;
  };
  locks: {
    total: number;
    waiting: number;
    deadlocks: number;
  };
  transactions: {
    committed: number;
    rolledBack: number;
    active: number;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'slow_query' | 'high_cpu' | 'memory_pressure' | 'cache_miss_rate' | 'disk_space' | 'connection_limit';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  metrics: Record<string, any>;
  queryId?: string;
  query?: string;
  threshold: number;
  currentValue: number;
  recommendations: string[];
  autoResolved: boolean;
}

// Optimization result types
export interface OptimizationResult {
  queryId: string;
  originalSql: string;
  optimizedSql?: string;
  executionPlan?: QueryExecutionPlan;
  estimatedImprovement?: number;
  recommendations?: OptimizationRecommendation[];
  appliedOptimizations?: string[];
  cacheStrategy?: CacheStrategy;
  indexRecommendations?: IndexSuggestion[];
  resourceRequirements?: ResourceRequirement[];
  error?: string;
  timestamp: Date;
  optimizationTime?: number;
  confidence?: number;
}

export interface OptimizationRecommendation {
  type: 'query' | 'index' | 'cache' | 'resource' | 'configuration';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  actions: string[];
  estimatedBenefit?: number; // percentage
  estimatedCost?: number;
  timeframe?: string;
  prerequisites?: string[];
}

export interface ResourceRequirement {
  resource: 'cpu' | 'memory' | 'io' | 'network';
  current: number;
  recommended: number;
  unit: string;
  impact: string;
}

export interface PerformanceBaseline {
  averageQueryTime: number; // milliseconds
  cacheHitRate: number; // percentage
  cpuUtilization: number; // percentage
  memoryUtilization: number; // percentage
  throughput: number; // queries per second
  timestamp: Date;
}

// Adaptive execution types
export interface AdaptiveQueryExecution {
  optimizedSql: string;
  executionPlan: QueryExecutionPlan;
  performanceGain: number; // percentage
  appliedOptimizations: string[];
  resourceRequirements: ResourceRequirement[];
  confidence: number; // percentage
}

export interface AdaptiveQueryExecutionConfig {
  enabled: boolean;
  learningEnabled: boolean;
  adaptationThreshold: number;
  maxExecutionPlans: number;
  planCacheSize: number;
  statisticsUpdateFrequency: number;
}