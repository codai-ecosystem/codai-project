/**
 * Phase 7: AI/ML Integration Types
 * 
 * Comprehensive type definitions for enterprise AI/ML integration based on 2025 MLOps best practices.
 * Implements Azure Machine Learning patterns including AutoML, model registry, feature stores,
 * inference pipelines, and federated learning capabilities.
 * 
 * Features:
 * - AutoML with hyperparameter optimization and neural architecture search
 * - Model registry with versioning and metadata management
 * - Feature store with temporal joins and point-in-time correctness
 * - Real-time and batch inference with sub-500ms latency targets
 * - Federated learning with privacy-preserving aggregation
 * - MLOps with CI/CD, monitoring, and automated retraining
 * - Model serving with A/B testing and canary deployments
 * - Edge deployment with quantization and pruning
 */

export interface MLModel {
  id: string;
  name: string;
  version: string;
  type: 'classification' | 'regression' | 'clustering' | 'generative' | 'multimodal' | 'foundation';
  framework: 'tensorflow' | 'pytorch' | 'scikit-learn' | 'xgboost' | 'lightgbm' | 'onnx' | 'custom';
  algorithm: string;
  hyperparameters: Record<string, any>;
  metrics: ModelMetrics;
  metadata: ModelMetadata;
  artifactUri: string;
  checksum: string;
  status: 'training' | 'trained' | 'validating' | 'validated' | 'deployed' | 'archived' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  rmse?: number;
  mae?: number;
  r2Score?: number;
  logloss?: number;
  perplexity?: number;
  bleuScore?: number;
  rougeScore?: number;
  trainingTime: number;
  inferenceLatency: number;
  modelSize: number;
  memoryUsage: number;
  customMetrics: Record<string, number>;
}

export interface ModelMetadata {
  description: string;
  author: string;
  license: string;
  datasetName: string;
  datasetVersion: string;
  trainingConfig: TrainingConfig;
  featuresUsed: string[];
  targetVariable: string;
  preprocessingSteps: string[];
  postprocessingSteps: string[];
  dependencies: Record<string, string>;
  hardwareRequirements: HardwareRequirements;
  complianceInfo: ComplianceInfo;
}

export interface TrainingConfig {
  batchSize: number;
  epochs: number;
  learningRate: number;
  optimizer: string;
  lossFunction: string;
  regularization: RegularizationConfig;
  dataAugmentation: DataAugmentationConfig;
  crossValidation: CrossValidationConfig;
  earlyStopping: EarlyStoppingConfig;
  distributedTraining: DistributedTrainingConfig;
}

export interface RegularizationConfig {
  type: 'l1' | 'l2' | 'elastic_net' | 'dropout' | 'batch_norm';
  strength: number;
  dropoutRate?: number;
}

export interface DataAugmentationConfig {
  enabled: boolean;
  techniques: string[];
  augmentationFactor: number;
}

export interface CrossValidationConfig {
  folds: number;
  strategy: 'k_fold' | 'stratified' | 'time_series' | 'group';
  randomSeed: number;
}

export interface EarlyStoppingConfig {
  enabled: boolean;
  patience: number;
  monitorMetric: string;
  minDelta: number;
}

export interface DistributedTrainingConfig {
  enabled: boolean;
  strategy: 'data_parallel' | 'model_parallel' | 'pipeline_parallel' | 'hybrid';
  numWorkers: number;
  communicationBackend: 'nccl' | 'mpi' | 'gloo';
}

export interface HardwareRequirements {
  minCpuCores: number;
  minMemoryGb: number;
  gpuRequired: boolean;
  gpuMemoryGb?: number;
  gpuType?: string;
  tpuRequired?: boolean;
  storageGb: number;
  networkBandwidth: number;
}

export interface ComplianceInfo {
  gdprCompliant: boolean;
  hipaaCompliant: boolean;
  ccpaCompliant: boolean;
  fairnessAudited: boolean;
  biasChecked: boolean;
  explainabilityRequired: boolean;
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  actor: string;
  details: Record<string, any>;
}

export interface AutoMLConfig {
  taskType: 'classification' | 'regression' | 'forecasting' | 'nlp' | 'computer_vision';
  primaryMetric: string;
  optimizationGoal: 'maximize' | 'minimize';
  maxTrials: number;
  maxConcurrentTrials: number;
  trialTimeout: number;
  experimentTimeout: number;
  algorithms: string[];
  blockedAlgorithms: string[];
  featurization: FeaturizationConfig;
  hyperparameterTuning: HyperparameterTuningConfig;
  neuralArchitectureSearch: NeuralArchitectureSearchConfig;
  earlyTermination: EarlyTerminationConfig;
  ensembling: EnsemblingConfig;
  dataGuardrails: DataGuardrailsConfig;
}

export interface FeaturizationConfig {
  mode: 'auto' | 'custom' | 'off';
  transformers: FeatureTransformer[];
  scalingMethod: 'standard' | 'min_max' | 'robust' | 'quantile_uniform';
  imputationStrategy: 'mean' | 'median' | 'most_frequent' | 'constant' | 'knn';
  encodingMethod: 'one_hot' | 'target' | 'binary' | 'ordinal' | 'hash';
  featureSelection: FeatureSelectionConfig;
}

export interface FeatureTransformer {
  name: string;
  type: 'numerical' | 'categorical' | 'text' | 'datetime' | 'image';
  columns: string[];
  parameters: Record<string, any>;
}

export interface FeatureSelectionConfig {
  enabled: boolean;
  method: 'variance_threshold' | 'univariate' | 'rfe' | 'feature_importance' | 'permutation';
  maxFeatures: number;
  threshold: number;
}

export interface HyperparameterTuningConfig {
  strategy: 'random' | 'grid' | 'bayesian' | 'population_based' | 'hyperband';
  maxIterations: number;
  parallelism: number;
  bandwidth: number;
  acquisitionFunction: 'ei' | 'pi' | 'lcb';
  searchSpace: Record<string, SearchSpace>;
}

export interface SearchSpace {
  type: 'choice' | 'uniform' | 'loguniform' | 'normal' | 'lognormal' | 'randint';
  values?: any[];
  low?: number;
  high?: number;
  mu?: number;
  sigma?: number;
}

export interface NeuralArchitectureSearchConfig {
  enabled: boolean;
  searchSpace: 'macro' | 'micro' | 'hybrid';
  searchStrategy: 'random' | 'evolutionary' | 'differentiable' | 'reinforcement_learning';
  maxArchitectures: number;
  resourceConstraints: ResourceConstraints;
}

export interface ResourceConstraints {
  maxParams: number;
  maxFlops: number;
  maxLatency: number;
  maxMemory: number;
}

export interface EarlyTerminationConfig {
  policy: 'bandit' | 'median_stopping' | 'truncation_selection';
  slackFactor?: number;
  slackAmount?: number;
  evaluationInterval: number;
  delayEvaluation: number;
}

export interface EnsemblingConfig {
  enabled: boolean;
  stackEnsembleSize: number;
  votingEnsembleSize: number;
  stackMetaLearner: string;
  votingStrategy: 'soft' | 'hard';
  ensembleIterations: number;
}

export interface DataGuardrailsConfig {
  enableDataDriftDetection: boolean;
  enableTargetLeakageDetection: boolean;
  enableClassImbalanceDetection: boolean;
  enableHighCardinalityDetection: boolean;
  enableMissingValueDetection: boolean;
  enableOutlierDetection: boolean;
  classImbalanceThreshold: number;
  cardinalityThreshold: number;
  missingValueThreshold: number;
  outlierThreshold: number;
}

export interface FeatureStore {
  id: string;
  name: string;
  description: string;
  featureGroups: FeatureGroup[];
  onlineStore: OnlineStoreConfig;
  offlineStore: OfflineStoreConfig;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface FeatureGroup {
  id: string;
  name: string;
  description: string;
  features: Feature[];
  primaryKey: string[];
  eventTimestamp: string;
  source: DataSource;
  materialization: MaterializationConfig;
  transformation: TransformationConfig;
  validation: ValidationConfig;
  freshness: FreshnessConfig;
  tags: string[];
}

export interface Feature {
  name: string;
  type: 'string' | 'int32' | 'int64' | 'float32' | 'float64' | 'boolean' | 'timestamp' | 'array' | 'map';
  description: string;
  transformationFunction?: string;
  validationRules: ValidationRule[];
  statisticalProfile: StatisticalProfile;
  tags: string[];
}

export interface ValidationRule {
  type: 'not_null' | 'unique' | 'range' | 'pattern' | 'custom';
  parameters: Record<string, any>;
  severity: 'error' | 'warning';
}

export interface StatisticalProfile {
  count: number;
  nullCount: number;
  uniqueCount: number;
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  percentiles?: Record<string, number>;
  histogram?: HistogramBin[];
}

export interface HistogramBin {
  lower: number;
  upper: number;
  count: number;
}

export interface DataSource {
  type: 'file' | 'database' | 'stream' | 'api' | 'kafka' | 'kinesis';
  connectionString: string;
  query?: string;
  schema?: string;
  format?: 'parquet' | 'csv' | 'json' | 'avro' | 'delta';
  compressionType?: 'gzip' | 'snappy' | 'lz4' | 'zstd';
}

export interface MaterializationConfig {
  schedule: ScheduleConfig;
  backfillEnabled: boolean;
  retentionDays: number;
  partitioning: PartitioningConfig;
  compaction: CompactionConfig;
}

export interface ScheduleConfig {
  type: 'cron' | 'interval';
  expression: string;
  timezone: string;
}

export interface PartitioningConfig {
  columns: string[];
  strategy: 'hash' | 'range' | 'list';
  numPartitions?: number;
}

export interface CompactionConfig {
  enabled: boolean;
  trigger: 'size' | 'time' | 'files';
  threshold: number;
  strategy: 'full' | 'incremental';
}

export interface TransformationConfig {
  language: 'python' | 'sql' | 'scala';
  code: string;
  dependencies: string[];
  resources: ComputeResourceConfig;
}

export interface ComputeResourceConfig {
  cpu: number;
  memory: number;
  gpu?: number;
  timeout: number;
}

export interface ValidationConfig {
  enabled: boolean;
  rules: ValidationRule[];
  sampleSize: number;
  failureThreshold: number;
  notificationConfig: NotificationConfig;
}

export interface NotificationConfig {
  channels: NotificationChannel[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  configuration: Record<string, any>;
}

export interface FreshnessConfig {
  maxAge: number;
  unit: 'minutes' | 'hours' | 'days';
  alertThreshold: number;
}

export interface OnlineStoreConfig {
  provider: 'redis' | 'dynamodb' | 'cassandra' | 'hbase' | 'bigquery';
  connectionConfig: Record<string, any>;
  ttl: number;
  caching: CachingConfig;
  consistency: 'strong' | 'eventual';
}

export interface OfflineStoreConfig {
  provider: 'parquet' | 'delta' | 'iceberg' | 'hudi' | 'bigquery' | 's3' | 'adls';
  location: string;
  configuration: Record<string, any>;
  compressionFormat: 'snappy' | 'gzip' | 'lz4' | 'zstd';
}

export interface CachingConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'random';
}

export interface InferencePipeline {
  id: string;
  name: string;
  description: string;
  model: MLModel;
  featureRetrieval: FeatureRetrievalConfig;
  preprocessing: PreprocessingStep[];
  postprocessing: PostprocessingStep[];
  serving: ServingConfig;
  monitoring: MonitoringConfig;
  version: string;
  status: 'draft' | 'testing' | 'staging' | 'production' | 'deprecated';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface FeatureRetrievalConfig {
  featureGroups: string[];
  pointInTime: boolean;
  maxAge: number;
  fallbackValues: Record<string, any>;
  cachingStrategy: 'none' | 'memory' | 'redis' | 'hybrid';
}

export interface PreprocessingStep {
  name: string;
  type: 'scaling' | 'encoding' | 'imputation' | 'transformation' | 'validation';
  parameters: Record<string, any>;
  order: number;
}

export interface PostprocessingStep {
  name: string;
  type: 'threshold' | 'calibration' | 'explanation' | 'bias_mitigation';
  parameters: Record<string, any>;
  order: number;
}

export interface ServingConfig {
  endpoint: EndpointConfig;
  deployment: DeploymentConfig;
  routing: RoutingConfig;
  autoscaling: AutoscalingConfig;
  security: SecurityConfig;
}

export interface EndpointConfig {
  type: 'real_time' | 'batch' | 'streaming';
  protocol: 'http' | 'grpc' | 'websocket';
  format: 'json' | 'protobuf' | 'avro';
  timeout: number;
  maxRequestSize: number;
  rateLimiting: RateLimitingConfig;
}

export interface DeploymentConfig {
  strategy: 'blue_green' | 'canary' | 'rolling' | 'shadow';
  replicas: number;
  resources: ResourceRequirements;
  healthChecks: HealthCheckConfig;
  rollbackConfig: RollbackConfig;
}

export interface ResourceRequirements {
  cpu: string;
  memory: string;
  gpu?: string;
  storage: string;
}

export interface HealthCheckConfig {
  enabled: boolean;
  path: string;
  interval: number;
  timeout: number;
  retries: number;
  initialDelay: number;
}

export interface RollbackConfig {
  enabled: boolean;
  triggerConditions: TriggerCondition[];
  maxRollbackAttempts: number;
}

export interface TriggerCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number;
}

export interface RoutingConfig {
  rules: RoutingRule[];
  defaultRoute: string;
  stickySession: boolean;
  loadBalancing: 'round_robin' | 'least_connections' | 'weighted_round_robin' | 'hash';
}

export interface RoutingRule {
  condition: string;
  route: string;
  weight: number;
  priority: number;
}

export interface AutoscalingConfig {
  enabled: boolean;
  minReplicas: number;
  maxReplicas: number;
  targetUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
  metrics: ScalingMetric[];
}

export interface ScalingMetric {
  type: 'cpu' | 'memory' | 'requests_per_second' | 'queue_length' | 'custom';
  threshold: number;
  weight: number;
}

export interface SecurityConfig {
  authentication: AuthenticationConfig;
  authorization: AuthorizationConfig;
  encryption: EncryptionConfig;
  auditLogging: boolean;
}

export interface AuthenticationConfig {
  enabled: boolean;
  methods: AuthMethod[];
  tokenExpiry: number;
}

export interface AuthMethod {
  type: 'api_key' | 'jwt' | 'oauth2' | 'mTLS' | 'basic';
  configuration: Record<string, any>;
}

export interface AuthorizationConfig {
  enabled: boolean;
  model: 'rbac' | 'abac' | 'acl';
  policies: AuthorizationPolicy[];
}

export interface AuthorizationPolicy {
  subject: string;
  resource: string;
  action: string;
  effect: 'allow' | 'deny';
  conditions: Record<string, any>;
}

export interface EncryptionConfig {
  inTransit: boolean;
  atRest: boolean;
  keyManagement: 'aws_kms' | 'azure_key_vault' | 'gcp_kms' | 'hashicorp_vault';
  algorithm: 'aes_256' | 'rsa_2048' | 'ecc_p256';
}

export interface RateLimitingConfig {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  burstSize: number;
  strategy: 'token_bucket' | 'sliding_window' | 'fixed_window';
}

export interface MonitoringConfig {
  metrics: MetricConfig[];
  alerts: AlertConfig[];
  logging: LoggingConfig;
  tracing: TracingConfig;
  profiling: ProfilingConfig;
}

export interface MetricConfig {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  labels: string[];
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  retention: number;
}

export interface AlertConfig {
  name: string;
  condition: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: NotificationChannel[];
  cooldown: number;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  destination: 'file' | 'elasticsearch' | 'splunk' | 'datadog';
  retention: number;
  sampling: SamplingConfig;
}

export interface TracingConfig {
  enabled: boolean;
  provider: 'jaeger' | 'zipkin' | 'datadog' | 'new_relic';
  sampleRate: number;
  maxSpans: number;
}

export interface ProfilingConfig {
  enabled: boolean;
  type: 'cpu' | 'memory' | 'heap' | 'all';
  interval: number;
  duration: number;
}

export interface SamplingConfig {
  enabled: boolean;
  rate: number;
  strategy: 'random' | 'adaptive' | 'priority_based';
}

export interface FederatedLearningConfig {
  id: string;
  name: string;
  description: string;
  algorithm: 'fedavg' | 'fedprox' | 'fedopt' | 'scaffold' | 'fednova';
  participants: Participant[];
  coordinator: CoordinatorConfig;
  rounds: number;
  minParticipants: number;
  maxParticipants: number;
  clientSelection: ClientSelectionConfig;
  participantSelection: ParticipantSelectionConfig;
  aggregation: AggregationConfig;
  privacy: PrivacyConfig;
  privacyConfig: PrivacyConfig;
  communication: CommunicationConfig;
  convergence: ConvergenceConfig;
  security: FederatedSecurityConfig;
  secureAggregation: SecureAggregationConfig;
  compliance: ComplianceConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  id: string;
  name: string;
  type: 'mobile' | 'edge' | 'hospital' | 'enterprise' | 'iot';
  capabilities: ParticipantCapabilities;
  dataProfile: DataProfile;
  trustLevel: number;
  reputation: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface ParticipantCapabilities {
  computePower: number;
  memorySize: number;
  storageCapacity: number;
  networkBandwidth: number;
  batteryLife?: number;
  availability: number;
}

export interface DataProfile {
  dataSize: number;
  dataQuality: number;
  labelQuality: number;
  dataDistribution: Record<string, number>;
  statisticalHeterogeneity: number;
  systemHeterogeneity: number;
}

export interface CoordinatorConfig {
  type: 'centralized' | 'decentralized' | 'hierarchical';
  aggregationFrequency: number;
  modelBroadcastStrategy: 'push' | 'pull' | 'gossip';
  faultTolerance: FaultToleranceConfig;
}

export interface FaultToleranceConfig {
  byzantineRobustness: boolean;
  dropoutTolerance: number;
  timeoutHandling: 'skip' | 'wait' | 'impute';
  redundancy: number;
}

export interface ClientSelectionConfig {
  strategy: 'random' | 'representative' | 'clustered' | 'incentive_based' | 'reputation_based';
  selectionRatio: number;
  minParticipants: number;
  maxParticipants: number;
  criteria: SelectionCriteria;
}

export interface ParticipantSelectionConfig {
  strategy: 'random' | 'performance' | 'data_diversity' | 'fairness_aware' | 'adaptive';
  selectionRatio: number;
  criteria: SelectionCriteria;
}

export interface SelectionCriteria {
  minDataSize: number;
  minComputePower: number;
  minTrustLevel: number;
  maxLatency: number;
  geographicDiversity: boolean;
  dataQualityThreshold: number;
}

export interface AggregationConfig {
  method: 'weighted_average' | 'median' | 'trimmed_mean' | 'krum' | 'bulyan';
  weightingStrategy: 'uniform' | 'data_size' | 'performance' | 'reputation' | 'adaptive';
  byzantineThreshold: number;
  compressionEnabled: boolean;
  compressionRatio: number;
}

export interface PrivacyConfig {
  level: 'basic' | 'enhanced' | 'maximum';
  mechanism: 'differential_privacy' | 'homomorphic_encryption' | 'secure_aggregation' | 'trusted_execution';
  differentialPrivacy: DifferentialPrivacyConfig;
  homomorphicEncryption: HomomorphicEncryptionConfig;
  secureAggregation: SecureAggregationConfig;
  trustedExecution: TrustedExecutionConfig;
}

export interface DifferentialPrivacyConfig {
  enabled: boolean;
  epsilon: number;
  delta: number;
  mechanism: 'laplace' | 'gaussian' | 'exponential';
  clippingThreshold: number;
  noiseMultiplier: number;
}

export interface HomomorphicEncryptionConfig {
  scheme: 'ckks' | 'bfv' | 'bgv';
  keySize: number;
  polynomialDegree: number;
  plaintextModulus: number;
}

export interface SecureAggregationConfig {
  threshold: number;
  maskingVectors: boolean;
  dropoutResilient: boolean;
}

export interface TrustedExecutionConfig {
  provider: 'intel_sgx' | 'arm_trustzone' | 'amd_sev';
  attestationRequired: boolean;
  enclaveSize: number;
}

export interface CommunicationConfig {
  protocol: 'grpc' | 'http' | 'websocket' | 'mqtt';
  compression: 'gzip' | 'snappy' | 'lz4' | 'none';
  encryption: 'tls' | 'dtls' | 'noise_protocol';
  maxMessageSize: number;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'exponential' | 'linear' | 'constant';
  baseDelay: number;
  maxDelay: number;
}

export interface ConvergenceConfig {
  criteria: 'loss_threshold' | 'accuracy_threshold' | 'rounds_limit' | 'time_limit' | 'custom';
  threshold: number;
  patience: number;
  evaluationFrequency: number;
  earlyStoppingEnabled: boolean;
}

export interface FederatedSecurityConfig {
  participantVerification: boolean;
  modelIntegrity: boolean;
  auditLogging: boolean;
  accessControl: AccessControlConfig;
  threatDetection: ThreatDetectionConfig;
}

export interface ComplianceConfig {
  frameworks: string[];
  level: 'basic' | 'enhanced' | 'maximum';
  auditEnabled: boolean;
  reporting: ComplianceReporting;
  validation: ComplianceValidation;
}

export interface ComplianceReporting {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: 'json' | 'pdf' | 'csv';
  recipients: string[];
}

export interface ComplianceValidation {
  enabled: boolean;
  rules: ComplianceRule[];
  automated: boolean;
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: 'data_privacy' | 'model_security' | 'audit_trail' | 'access_control';
  severity: 'low' | 'medium' | 'high' | 'critical';
  automated: boolean;
}

export interface AccessControlConfig {
  authentication: 'certificate' | 'token' | 'biometric';
  authorization: 'role_based' | 'attribute_based';
  sessionManagement: SessionManagementConfig;
}

export interface SessionManagementConfig {
  timeout: number;
  renewalRequired: boolean;
  concurrentSessions: number;
}

export interface ThreatDetectionConfig {
  poisoningDetection: boolean;
  backdoorDetection: boolean;
  eavesdroppingProtection: boolean;
  signatureValidation: boolean;
}

export interface MLOpsConfig {
  pipeline: MLOpsPipeline;
  monitoring: MLOpsMonitoring;
  governance: GovernanceConfig;
  experimentation: ExperimentationConfig;
  deployment: MLOpsDeploymentConfig;
  dataManagement: DataManagementConfig;
}

export interface MLOpsPipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  triggers: PipelineTrigger[];
  schedule: ScheduleConfig;
  parallelism: ParallelismConfig;
  artifacts: ArtifactConfig;
  notifications: NotificationConfig;
}

export interface PipelineStage {
  name: string;
  type: 'data_validation' | 'training' | 'evaluation' | 'testing' | 'deployment' | 'monitoring';
  dependencies: string[];
  configuration: Record<string, any>;
  resources: ComputeResourceConfig;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface PipelineTrigger {
  type: 'schedule' | 'data_change' | 'model_drift' | 'performance_degradation' | 'manual';
  condition: string;
  enabled: boolean;
}

export interface ParallelismConfig {
  enabled: boolean;
  maxParallelStages: number;
  resourceSharing: boolean;
}

export interface ArtifactConfig {
  storage: 'local' | 's3' | 'azure_blob' | 'gcs';
  versioning: boolean;
  compression: boolean;
  encryption: boolean;
  retention: number;
}

export interface MLOpsMonitoring {
  modelPerformance: ModelPerformanceMonitoring;
  dataDrift: DataDriftMonitoring;
  infrastructure: InfrastructureMonitoring;
  businessMetrics: BusinessMetricsMonitoring;
  alerting: AlertingConfig;
}

export interface ModelPerformanceMonitoring {
  enabled: boolean;
  metrics: string[];
  thresholds: Record<string, number>;
  evaluationFrequency: number;
  baselineComparison: boolean;
  statisticalTests: string[];
}

export interface DataDriftMonitoring {
  enabled: boolean;
  features: string[];
  methods: 'ks_test' | 'psi' | 'js_divergence' | 'wasserstein' | 'all';
  thresholds: Record<string, number>;
  referenceWindow: number;
  detectionWindow: number;
}

export interface InfrastructureMonitoring {
  enabled: boolean;
  metrics: InfrastructureMetric[];
  alertThresholds: Record<string, number>;
  logAggregation: boolean;
}

export interface InfrastructureMetric {
  name: string;
  type: 'system' | 'application' | 'business';
  unit: string;
  aggregation: 'sum' | 'avg' | 'min' | 'max';
}

export interface BusinessMetricsMonitoring {
  enabled: boolean;
  kpis: BusinessKPI[];
  dashboard: DashboardConfig;
  reporting: ReportingConfig;
}

export interface BusinessKPI {
  name: string;
  description: string;
  calculation: string;
  target: number;
  trend: 'higher_better' | 'lower_better' | 'stable';
}

export interface DashboardConfig {
  enabled: boolean;
  refreshInterval: number;
  widgets: DashboardWidget[];
  sharing: SharingConfig;
}

export interface DashboardWidget {
  type: 'chart' | 'table' | 'metric' | 'alert';
  title: string;
  query: string;
  visualization: VisualizationConfig;
}

export interface VisualizationConfig {
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap';
  xAxis: string;
  yAxis: string;
  groupBy: string[];
  timeRange: string;
}

export interface SharingConfig {
  public: boolean;
  allowedUsers: string[];
  allowedRoles: string[];
  externalSharing: boolean;
}

export interface ReportingConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  format: 'pdf' | 'html' | 'excel';
  recipients: string[];
  customization: ReportCustomization;
}

export interface ReportCustomization {
  includeSummary: boolean;
  includeTrends: boolean;
  includeAlerts: boolean;
  includeRecommendations: boolean;
  branding: BrandingConfig;
}

export interface BrandingConfig {
  logo: string;
  colors: string[];
  fonts: string[];
  watermark: string;
}

export interface AlertingConfig {
  channels: AlertChannel[];
  escalation: EscalationConfig;
  suppression: SuppressionConfig;
  routing: AlertRoutingConfig;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface EscalationConfig {
  enabled: boolean;
  levels: EscalationLevel[];
  timeouts: number[];
}

export interface EscalationLevel {
  name: string;
  recipients: string[];
  channels: string[];
}

export interface SuppressionConfig {
  enabled: boolean;
  rules: SuppressionRule[];
}

export interface SuppressionRule {
  condition: string;
  duration: number;
  reason: string;
}

export interface AlertRoutingConfig {
  rules: AlertRoutingRule[];
  defaultRoute: string;
}

export interface AlertRoutingRule {
  condition: string;
  route: string;
  priority: number;
}

export interface GovernanceConfig {
  modelApproval: ModelApprovalConfig;
  compliance: ComplianceConfig;
  auditTrail: AuditTrailConfig;
  dataGovernance: DataGovernanceConfig;
  riskManagement: RiskManagementConfig;
}

export interface ModelApprovalConfig {
  enabled: boolean;
  workflow: ApprovalWorkflow;
  criteria: ApprovalCriteria;
  reviewers: Reviewer[];
}

export interface ApprovalWorkflow {
  stages: ApprovalStage[];
  parallelReview: boolean;
  timeoutDays: number;
  autoApprovalRules: AutoApprovalRule[];
}

export interface ApprovalStage {
  name: string;
  type: 'technical' | 'business' | 'compliance' | 'security';
  requiredApprovals: number;
  timeoutDays: number;
}

export interface AutoApprovalRule {
  condition: string;
  stages: string[];
  enabled: boolean;
}

export interface ApprovalCriteria {
  minAccuracy: number;
  maxBias: number;
  performanceThresholds: Record<string, number>;
  securityChecks: string[];
  complianceChecks: string[];
}

export interface Reviewer {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  workload: number;
}

export interface ComplianceConfig {
  frameworks: ComplianceFramework[];
  checks: ComplianceCheck[];
  reporting: ComplianceReporting;
  certification: CertificationConfig;
}

export interface ComplianceFramework {
  name: string;
  version: string;
  requirements: ComplianceRequirement[];
  auditFrequency: number;
}

export interface ComplianceRequirement {
  id: string;
  description: string;
  controls: string[];
  testProcedure: string;
  evidence: string[];
}

export interface ComplianceCheck {
  id: string;
  name: string;
  type: 'automated' | 'manual' | 'hybrid';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly';
  script: string;
  expectedResult: any;
}

export interface ComplianceReporting {
  enabled: boolean;
  frequency: string;
  format: string;
  recipients: string[];
  retention: number;
}

export interface CertificationConfig {
  target: string[];
  auditor: string;
  schedule: string;
  scope: string[];
  evidence: EvidenceConfig;
}

export interface EvidenceConfig {
  collection: 'automated' | 'manual' | 'hybrid';
  storage: string;
  retention: number;
  format: string[];
}

export interface AuditTrailConfig {
  enabled: boolean;
  events: AuditEvent[];
  storage: AuditStorageConfig;
  retention: number;
  immutability: boolean;
}

export interface AuditEvent {
  type: string;
  description: string;
  severity: string;
  attributes: string[];
}

export interface AuditStorageConfig {
  provider: 'database' | 'file' | 'blockchain' | 'cloud';
  encryption: boolean;
  compression: boolean;
  replication: boolean;
}

export interface DataGovernanceConfig {
  classification: DataClassificationConfig;
  lineage: DataLineageConfig;
  quality: DataQualityConfig;
  privacy: DataPrivacyConfig;
}

export interface DataClassificationConfig {
  enabled: boolean;
  levels: ClassificationLevel[];
  rules: ClassificationRule[];
  automation: boolean;
}

export interface ClassificationLevel {
  name: string;
  sensitivity: number;
  handling: HandlingRequirement[];
  retention: number;
}

export interface HandlingRequirement {
  type: 'encryption' | 'access_control' | 'audit' | 'masking';
  specification: Record<string, any>;
}

export interface ClassificationRule {
  pattern: string;
  level: string;
  confidence: number;
}

export interface DataLineageConfig {
  enabled: boolean;
  granularity: 'dataset' | 'table' | 'column' | 'record';
  tracking: TrackingConfig;
  visualization: boolean;
}

export interface TrackingConfig {
  sources: boolean;
  transformations: boolean;
  destinations: boolean;
  processing: boolean;
  metadata: boolean;
}

export interface DataQualityConfig {
  enabled: boolean;
  rules: DataQualityRule[];
  monitoring: QualityMonitoringConfig;
  remediation: RemediationConfig;
}

export interface DataQualityRule {
  name: string;
  type: 'completeness' | 'accuracy' | 'consistency' | 'validity' | 'timeliness';
  condition: string;
  threshold: number;
  action: 'alert' | 'block' | 'fix' | 'quarantine';
}

export interface QualityMonitoringConfig {
  frequency: string;
  metrics: string[];
  reporting: boolean;
  dashboard: boolean;
}

export interface RemediationConfig {
  automatic: boolean;
  workflows: RemediationWorkflow[];
  approval: boolean;
}

export interface RemediationWorkflow {
  trigger: string;
  actions: RemediationAction[];
  notification: boolean;
}

export interface RemediationAction {
  type: 'fix' | 'flag' | 'remove' | 'isolate';
  parameters: Record<string, any>;
}

export interface DataPrivacyConfig {
  enabled: boolean;
  techniques: PrivacyTechnique[];
  policies: PrivacyPolicy[];
  consent: ConsentManagement;
}

export interface PrivacyTechnique {
  name: string;
  type: 'anonymization' | 'pseudonymization' | 'masking' | 'tokenization';
  configuration: Record<string, any>;
}

export interface PrivacyPolicy {
  id: string;
  description: string;
  rules: PrivacyRule[];
  enforcement: 'strict' | 'advisory';
}

export interface PrivacyRule {
  subject: string;
  purpose: string[];
  retention: number;
  sharing: SharingConstraint[];
}

export interface SharingConstraint {
  recipient: string;
  conditions: string[];
  approval: boolean;
}

export interface ConsentManagement {
  enabled: boolean;
  granularity: 'global' | 'purpose' | 'data_type';
  withdrawal: boolean;
  tracking: boolean;
}

export interface RiskManagementConfig {
  assessment: RiskAssessmentConfig;
  mitigation: RiskMitigationConfig;
  monitoring: RiskMonitoringConfig;
  reporting: RiskReportingConfig;
}

export interface RiskAssessmentConfig {
  frequency: string;
  methodology: string;
  factors: RiskFactor[];
  scoring: RiskScoringConfig;
}

export interface RiskFactor {
  name: string;
  category: string;
  weight: number;
  assessment: string;
}

export interface RiskScoringConfig {
  scale: string;
  aggregation: string;
  thresholds: Record<string, number>;
}

export interface RiskMitigationConfig {
  strategies: MitigationStrategy[];
  controls: RiskControl[];
  contingency: ContingencyPlanning;
}

export interface MitigationStrategy {
  name: string;
  type: 'avoidance' | 'mitigation' | 'transfer' | 'acceptance';
  implementation: string;
  effectiveness: number;
}

export interface RiskControl {
  name: string;
  type: 'preventive' | 'detective' | 'corrective';
  automation: boolean;
  testing: ControlTesting;
}

export interface ControlTesting {
  frequency: string;
  method: string;
  criteria: string;
}

export interface ContingencyPlanning {
  enabled: boolean;
  scenarios: ContingencyScenario[];
  procedures: ContingencyProcedure[];
}

export interface ContingencyScenario {
  name: string;
  description: string;
  probability: number;
  impact: number;
  triggers: string[];
}

export interface ContingencyProcedure {
  scenario: string;
  steps: string[];
  resources: string[];
  timeline: number;
}

export interface RiskMonitoringConfig {
  enabled: boolean;
  indicators: RiskIndicator[];
  alerting: boolean;
  dashboard: boolean;
}

export interface RiskIndicator {
  name: string;
  metric: string;
  threshold: number;
  trend: string;
}

export interface RiskReportingConfig {
  frequency: string;
  recipients: string[];
  format: string;
  automation: boolean;
}

export interface ExperimentationConfig {
  platform: ExperimentPlatform;
  tracking: ExperimentTracking;
  comparison: ExperimentComparison;
  automation: ExperimentAutomation;
}

export interface ExperimentPlatform {
  provider: 'mlflow' | 'wandb' | 'neptune' | 'tensorboard' | 'custom';
  configuration: Record<string, any>;
  integration: IntegrationConfig;
}

export interface IntegrationConfig {
  cicd: boolean;
  notebook: boolean;
  ide: boolean;
  monitoring: boolean;
}

export interface ExperimentTracking {
  metadata: MetadataTracking;
  artifacts: ArtifactTracking;
  metrics: MetricTracking;
  versioning: VersioningConfig;
}

export interface MetadataTracking {
  enabled: boolean;
  automatic: boolean;
  custom: CustomMetadata[];
  schema: MetadataSchema;
}

export interface CustomMetadata {
  name: string;
  type: string;
  required: boolean;
  validation: string;
}

export interface MetadataSchema {
  version: string;
  fields: SchemaField[];
  validation: SchemaValidation;
}

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface SchemaValidation {
  enabled: boolean;
  rules: ValidationRule[];
  strict: boolean;
}

export interface ArtifactTracking {
  enabled: boolean;
  types: ArtifactType[];
  storage: ArtifactStorageConfig;
  versioning: boolean;
}

export interface ArtifactType {
  name: string;
  extensions: string[];
  size_limit: number;
  versioning: boolean;
}

export interface ArtifactStorageConfig {
  provider: string;
  location: string;
  encryption: boolean;
  compression: boolean;
}

export interface MetricTracking {
  enabled: boolean;
  automatic: boolean;
  custom: CustomMetric[];
  aggregation: MetricAggregationConfig;
}

export interface CustomMetric {
  name: string;
  type: 'scalar' | 'histogram' | 'image' | 'text';
  frequency: 'step' | 'epoch' | 'manual';
}

export interface MetricAggregationConfig {
  enabled: boolean;
  methods: string[];
  window: number;
}

export interface VersioningConfig {
  strategy: 'semantic' | 'timestamp' | 'hash' | 'sequential';
  automatic: boolean;
  branching: boolean;
  tagging: TaggingConfig;
}

export interface TaggingConfig {
  enabled: boolean;
  automatic: string[];
  custom: boolean;
  validation: boolean;
}

export interface ExperimentComparison {
  enabled: boolean;
  methods: ComparisonMethod[];
  visualization: ComparisonVisualization;
  reporting: ComparisonReporting;
}

export interface ComparisonMethod {
  name: string;
  type: 'statistical' | 'visual' | 'ranking';
  configuration: Record<string, any>;
}

export interface ComparisonVisualization {
  enabled: boolean;
  charts: ChartConfig[];
  interactive: boolean;
  export: boolean;
}

export interface ChartConfig {
  type: string;
  metrics: string[];
  grouping: string[];
  filters: ChartFilter[];
}

export interface ChartFilter {
  field: string;
  operator: string;
  value: any;
}

export interface ComparisonReporting {
  enabled: boolean;
  template: string;
  automation: boolean;
  distribution: string[];
}

export interface ExperimentAutomation {
  enabled: boolean;
  triggers: AutomationTrigger[];
  workflows: AutomationWorkflow[];
  optimization: OptimizationConfig;
}

export interface AutomationTrigger {
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
}

export interface AutomationWorkflow {
  name: string;
  steps: WorkflowStep[];
  schedule: ScheduleConfig;
  dependencies: string[];
}

export interface WorkflowStep {
  name: string;
  type: string;
  configuration: Record<string, any>;
  timeout: number;
}

export interface OptimizationConfig {
  enabled: boolean;
  objective: string;
  algorithm: string;
  budget: number;
  parallelism: number;
}

export interface MLOpsDeploymentConfig {
  strategy: DeploymentStrategy;
  environments: Environment[];
  promotion: PromotionConfig;
  rollback: MLOpsRollbackConfig;
}

export interface DeploymentStrategy {
  type: 'blue_green' | 'canary' | 'rolling' | 'a_b_testing' | 'shadow';
  configuration: Record<string, any>;
  validation: DeploymentValidation;
}

export interface DeploymentValidation {
  gates: ValidationGate[];
  tests: DeploymentTest[];
  approval: boolean;
}

export interface ValidationGate {
  name: string;
  type: 'performance' | 'security' | 'compliance' | 'business';
  criteria: string;
  timeout: number;
}

export interface DeploymentTest {
  name: string;
  type: 'unit' | 'integration' | 'performance' | 'smoke';
  script: string;
  timeout: number;
}

export interface Environment {
  name: string;
  type: 'development' | 'staging' | 'production' | 'canary';
  configuration: EnvironmentConfig;
  promotion: EnvironmentPromotion;
}

export interface EnvironmentConfig {
  resources: ResourceAllocation;
  security: EnvironmentSecurity;
  monitoring: EnvironmentMonitoring;
  networking: NetworkingConfig;
}

export interface ResourceAllocation {
  cpu: string;
  memory: string;
  storage: string;
  gpu?: string;
  scaling: ScalingConfig;
}

export interface ScalingConfig {
  type: 'manual' | 'automatic';
  min: number;
  max: number;
  metrics: ScalingMetric[];
}

export interface EnvironmentSecurity {
  isolation: boolean;
  access: AccessConfiguration;
  secrets: SecretsManagement;
  network: NetworkSecurity;
}

export interface AccessConfiguration {
  authentication: boolean;
  authorization: boolean;
  roles: string[];
  policies: string[];
}

export interface SecretsManagement {
  provider: string;
  encryption: boolean;
  rotation: boolean;
  audit: boolean;
}

export interface NetworkSecurity {
  firewall: boolean;
  vpn: boolean;
  ssl: boolean;
  intrusion_detection: boolean;
}

export interface EnvironmentMonitoring {
  enabled: boolean;
  metrics: string[];
  logging: boolean;
  alerting: boolean;
}

export interface NetworkingConfig {
  vpc: string;
  subnets: string[];
  security_groups: string[];
  load_balancer: LoadBalancerConfig;
}

export interface LoadBalancerConfig {
  type: string;
  algorithm: string;
  health_checks: boolean;
  ssl_termination: boolean;
}

export interface EnvironmentPromotion {
  automatic: boolean;
  criteria: PromotionCriteria;
  approval: boolean;
  testing: boolean;
}

export interface PromotionConfig {
  pipeline: PromotionPipeline;
  gates: PromotionGate[];
  notification: boolean;
}

export interface PromotionPipeline {
  stages: string[];
  parallel: boolean;
  timeout: number;
}

export interface PromotionGate {
  stage: string;
  type: string;
  criteria: string;
  automatic: boolean;
}

export interface PromotionCriteria {
  performance: Record<string, number>;
  security: string[];
  compliance: string[];
  business: Record<string, any>;
}

export interface MLOpsRollbackConfig {
  automatic: boolean;
  triggers: RollbackTrigger[];
  strategy: string;
  validation: boolean;
}

export interface RollbackTrigger {
  metric: string;
  threshold: number;
  duration: number;
  enabled: boolean;
}

export interface DataManagementConfig {
  ingestion: DataIngestionConfig;
  processing: DataProcessingConfig;
  validation: DataValidationConfig;
  versioning: DataVersioningConfig;
}

export interface DataIngestionConfig {
  sources: DataSourceConfig[];
  scheduling: DataSchedulingConfig;
  monitoring: DataMonitoringConfig;
  quality: DataQualityGates;
}

export interface DataSourceConfig {
  type: string;
  connection: ConnectionConfig;
  schema: DataSchemaConfig;
  incremental: boolean;
}

export interface ConnectionConfig {
  protocol: string;
  host: string;
  port: number;
  credentials: CredentialsConfig;
  ssl: boolean;
}

export interface CredentialsConfig {
  type: 'password' | 'key' | 'token' | 'certificate';
  vault: string;
  rotation: boolean;
}

export interface DataSchemaConfig {
  format: string;
  validation: boolean;
  evolution: boolean;
  registry: string;
}

export interface DataSchedulingConfig {
  frequency: string;
  dependency: string[];
  timeout: number;
  retry: RetryConfig;
}

export interface RetryConfig {
  attempts: number;
  backoff: string;
  conditions: string[];
}

export interface DataMonitoringConfig {
  enabled: boolean;
  metrics: DataMetric[];
  alerting: boolean;
  profiling: boolean;
}

export interface DataMetric {
  name: string;
  type: string;
  calculation: string;
  threshold: number;
}

export interface DataQualityGates {
  enabled: boolean;
  rules: DataQualityRule[];
  action: 'block' | 'warn' | 'proceed';
  reporting: boolean;
}

export interface DataProcessingConfig {
  engine: ProcessingEngine;
  pipelines: ProcessingPipeline[];
  optimization: ProcessingOptimization;
  lineage: ProcessingLineage;
}

export interface ProcessingEngine {
  type: 'spark' | 'flink' | 'beam' | 'dask';
  configuration: EngineConfig;
  resources: ProcessingResources;
}

export interface EngineConfig {
  parallelism: number;
  memory: string;
  checkpointing: boolean;
  optimization: EngineOptimization;
}

export interface EngineOptimization {
  enabled: boolean;
  techniques: string[];
  adaptive: boolean;
}

export interface ProcessingResources {
  cpu: string;
  memory: string;
  storage: string;
  scaling: ProcessingScaling;
}

export interface ProcessingScaling {
  type: 'fixed' | 'dynamic';
  min: number;
  max: number;
  metrics: string[];
}

export interface ProcessingPipeline {
  name: string;
  steps: ProcessingStep[];
  schedule: string;
  dependencies: string[];
}

export interface ProcessingStep {
  name: string;
  type: 'transform' | 'filter' | 'aggregate' | 'join' | 'validate';
  function: string;
  parameters: Record<string, any>;
}

export interface ProcessingOptimization {
  caching: boolean;
  partitioning: PartitioningStrategy;
  indexing: IndexingStrategy;
  compression: CompressionStrategy;
}

export interface PartitioningStrategy {
  enabled: boolean;
  columns: string[];
  strategy: string;
}

export interface IndexingStrategy {
  enabled: boolean;
  columns: string[];
  type: string;
}

export interface CompressionStrategy {
  enabled: boolean;
  algorithm: string;
  level: number;
}

export interface ProcessingLineage {
  enabled: boolean;
  granularity: string;
  storage: string;
  visualization: boolean;
}

export interface DataValidationConfig {
  enabled: boolean;
  rules: DataValidationRule[];
  profiling: DataProfilingConfig;
  testing: DataTestingConfig;
}

export interface DataValidationRule {
  name: string;
  type: string;
  expression: string;
  severity: string;
}

export interface DataProfilingConfig {
  enabled: boolean;
  frequency: string;
  metrics: ProfilingMetric[];
  comparison: boolean;
}

export interface ProfilingMetric {
  name: string;
  type: string;
  aggregation: string;
}

export interface DataTestingConfig {
  enabled: boolean;
  suites: TestSuite[];
  automation: boolean;
  reporting: boolean;
}

export interface TestSuite {
  name: string;
  tests: DataTest[];
  schedule: string;
  scope: string;
}

export interface DataTest {
  name: string;
  type: string;
  query: string;
  assertion: string;
}

export interface DataVersioningConfig {
  enabled: boolean;
  strategy: 'delta' | 'copy' | 'reference';
  retention: VersionRetention;
  branching: VersionBranching;
}

export interface VersionRetention {
  policy: string;
  duration: number;
  criteria: string[];
}

export interface VersionBranching {
  enabled: boolean;
  strategy: string;
  merging: boolean;
}

// Training and Inference Pipeline Events
export interface TrainingStartedEvent {
  modelId: string;
  experimentId: string;
  config: TrainingConfig;
  timestamp: Date;
}

export interface TrainingCompletedEvent {
  modelId: string;
  metrics: ModelMetrics;
  artifacts: string[];
  timestamp: Date;
}

export interface InferenceRequestEvent {
  requestId: string;
  modelId: string;
  input: any;
  timestamp: Date;
}

export interface InferenceResponseEvent {
  requestId: string;
  output: any;
  latency: number;
  timestamp: Date;
}

export interface ModelDriftDetectedEvent {
  modelId: string;
  driftScore: number;
  driftFeatures: string[];
  timestamp: Date;
}

export interface DataDriftDetectedEvent {
  datasetId: string;
  driftScore: number;
  driftFeatures: string[];
  timestamp: Date;
}

// Additional Federated Learning Types for FederatedLearningManager
export interface FederatedLearningParticipant extends Participant {
  publicKey: string;
  privateKey?: string;
  endpoint: string;
  lastActivity: Date;
  participationHistory: ParticipationRecord[];
  complianceStatus: 'compliant' | 'non_compliant' | 'pending';
}

export interface ParticipationRecord {
  roundId: string;
  timestamp: Date;
  contribution: number;
  performance: number;
  privacyLoss: number;
}

export interface FederatedLearningRound {
  id: string;
  roundNumber: number;
  startTime: Date;
  endTime: Date | null;
  participants: string[];
  globalModel: ModelUpdate;
  localUpdates: Map<string, LocalUpdate>;
  aggregatedUpdate: ModelUpdate | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  privacyLoss: number;
  performanceMetrics: RoundPerformanceMetrics;
}

export interface LocalUpdate {
  update: ModelUpdate;
  timestamp: Date;
  privacyLoss: number;
  qualityScore: number;
}

export interface RoundPerformanceMetrics {
  participationRate: number;
  convergenceRate: number;
  communicationCost: number;
  aggregationTime: number;
  modelQuality: number;
}

export interface FederatedLearningResult {
  totalRounds: number;
  activeParticipants: number;
  aggregatedModel: ModelUpdate | null;
  performanceMetrics: FederatedPerformanceMetrics;
  privacyMetrics: FederatedPrivacyMetrics;
  communicationEfficiency: CommunicationEfficiencyMetrics;
  auditTrail: AuditRecord[];
  timestamp: Date;
}

export interface FederatedPerformanceMetrics {
  averageAccuracy: number;
  convergenceSpeed: number;
  participationRate: number;
  dropoutRate: number;
  modelStability: number;
}

export interface FederatedPrivacyMetrics {
  privacyLoss: number;
  privacyBudgetUsed: number;
  complianceStatus: 'compliant' | 'non_compliant' | 'partial';
}

export interface CommunicationEfficiencyMetrics {
  totalCommunicationCost: number;
  averageLatency: number;
  bandwidthUtilization: number;
  compressionRatio: number;
}

export interface ModelUpdate {
  weights: Record<string, Float32Array>;
  biases: Record<string, Float32Array>;
  gradients?: Record<string, Float32Array>;
  metadata: UpdateMetadata;
}

export interface UpdateMetadata {
  updateSize: number;
  compressionRatio: number;
  timestamp: Date;
  participantId: string;
  roundId: string;
  qualityScore: number;
}

export interface AuditRecord {
  id: string;
  timestamp: Date;
  eventType: string;
  participantId: string;
  action: string;
  resource: string;
  metadata: Record<string, any>;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending';
}

export interface CommunicationProtocol {
  protocol: 'grpc' | 'http' | 'websocket' | 'mqtt' | 'secure_websocket';
  encryption: 'AES_256_GCM' | 'ChaCha20_Poly1305' | 'TLS_1_3';
  authentication: 'mutual_tls' | 'jwt' | 'oauth2' | 'certificate_based';
  compression: 'gzip' | 'snappy' | 'lz4' | 'none';
  timeout: number;
}