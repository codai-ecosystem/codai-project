/**
 * CBD Phase 4: Ecosystem Type Definitions
 * 
 * Type definitions for developer ecosystem, future technologies,
 * and next-generation database features.
 * 
 * @version 4.0.0
 * @since Phase 4: Innovation & Scale
 */

export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'local';

export interface ApiConfiguration {
    readonly baseUrl: string;
    readonly version: string;
    readonly authentication: {
        readonly type: 'api_key' | 'oauth2' | 'azure_ad';
        readonly keyName?: string;
        readonly scopes?: readonly string[];
    };
    readonly rateLimit: {
        readonly enabled: boolean;
        readonly requestsPerMinute: number;
        readonly burstLimit: number;
    };
    readonly monitoring: {
        readonly enabled: boolean;
        readonly metricsProvider: 'azure_monitor' | 'aws_cloudwatch' | 'gcp_monitoring';
        readonly loggingLevel: 'debug' | 'info' | 'warn' | 'error';
    };
}

export interface DeveloperTools {
    readonly sdkGeneration: {
        readonly supportedLanguages: readonly string[];
        readonly autoUpdate: boolean;
        readonly documentation: boolean;
        readonly examples: boolean;
    };
    readonly cicd: {
        readonly githubActions: boolean;
        readonly azureDevOps: boolean;
        readonly awsCodePipeline: boolean;
        readonly gcpCloudBuild: boolean;
    };
    readonly testing: {
        readonly unitTestGeneration: boolean;
        readonly integrationTestGeneration: boolean;
        readonly performanceTestGeneration: boolean;
        readonly e2eTestGeneration: boolean;
    };
    readonly documentation: {
        readonly apiDocs: boolean;
        readonly tutorials: boolean;
        readonly samples: boolean;
        readonly interactive: boolean;
    };
}

export interface RecordId {
    readonly value: string;
    readonly type: 'uuid' | 'auto' | 'custom';
}

export interface DataContainer {
    readonly type: 'relational' | 'document' | 'graph' | 'vector' | 'timeseries' | 'keyvalue';
    readonly data: unknown;
    readonly metadata?: Record<string, unknown>;
}

export interface IndexMetadata {
    readonly name: string;
    readonly type: 'btree' | 'hash' | 'vector' | 'text' | 'spatial';
    readonly columns: readonly string[];
    readonly unique: boolean;
    readonly performance: {
        readonly estimatedSize: number;
        readonly lastOptimized: Date;
        readonly usageCount: number;
    };
}

export interface RecordMetadata {
    readonly created: Date;
    readonly updated: Date;
    readonly version: number;
    readonly etag: string;
    readonly size: number;
    readonly cloudProvider?: CloudProvider;
    readonly region?: string;
}

export interface Version {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly build?: string;
}

export interface AzureStorageMetadata {
    readonly accountName: string;
    readonly containerName: string;
    readonly blobName: string;
    readonly tier: 'hot' | 'cool' | 'archive';
    readonly accessTier?: 'premium' | 'standard';
    readonly lastModified: Date;
    readonly etag: string;
    readonly contentLength: number;
    readonly contentType: string;
}

export interface PerformanceConfiguration {
    readonly cacheSize: number;
    readonly maxConnections: number;
    readonly queryTimeout: number;
    readonly batchSize: number;
    readonly parallelism: number;
    readonly compression: {
        readonly enabled: boolean;
        readonly algorithm: 'gzip' | 'brotli' | 'lz4';
        readonly level: number;
    };
}

export interface AzureMonitoringConfig {
    readonly applicationInsights: {
        readonly enabled: boolean;
        readonly instrumentationKey?: string;
        readonly samplingRate: number;
    };
    readonly logAnalytics: {
        readonly enabled: boolean;
        readonly workspaceId?: string;
        readonly customTables: readonly string[];
    };
    readonly alerts: {
        readonly enabled: boolean;
        readonly rules: readonly AlertRule[];
    };
}

export interface AlertRule {
    readonly name: string;
    readonly condition: string;
    readonly threshold: number;
    readonly severity: 'critical' | 'error' | 'warning' | 'informational';
    readonly actionGroups: readonly string[];
}

// Document Database Types
export interface DocumentResult {
    readonly id: string;
    readonly document: Record<string, unknown>;
    readonly metadata: {
        readonly statusCode: number;
        readonly requestCharge?: number;
        readonly timestamp: Date;
    };
}

// Vector Database Types
export interface VectorDocument {
    readonly id: string;
    readonly vector: readonly number[];
    readonly metadata: Record<string, unknown>;
}

export interface VectorResult {
    readonly id: string;
    readonly similarity: number;
    readonly metadata?: Record<string, unknown>;
}

export interface VectorSearchOptions {
    readonly limit?: number;
    readonly threshold?: number;
    readonly includeMetadata?: boolean;
    readonly maxLatency?: number;
}

export interface VectorSearchResult {
    readonly id: string;
    readonly similarity: number;
    readonly metadata: Record<string, unknown>;
    readonly vector?: readonly number[];
}

// Graph Database Types  
export interface GraphNode {
    readonly id: string;
    readonly labels: readonly string[];
    readonly properties: Record<string, unknown>;
}

export interface GraphEdge {
    readonly id: string;
    readonly from: string;
    readonly to: string;
    readonly type: string;
    readonly properties: Record<string, unknown>;
}

export interface GraphResult {
    readonly id: string;
    readonly type: 'node' | 'edge';
    readonly data: GraphNode | GraphEdge;
}

export interface GraphQueryResult {
    readonly nodes: readonly GraphNode[];
    readonly edges: readonly GraphEdge[];
    readonly paths?: readonly GraphPath[];
}

export interface GraphPath {
    readonly nodes: readonly string[];
    readonly edges: readonly string[];
    readonly length: number;
}

// AI Services Types
export interface MLTrainingData {
    readonly features: readonly number[][];
    readonly labels: readonly (string | number)[];
    readonly algorithm: 'random_forest' | 'gradient_boosting' | 'neural_network' | 'svm';
    readonly hyperparameters?: Record<string, unknown>;
}

export interface MLTrainingResult {
    readonly modelId: string;
    readonly algorithm: string;
    readonly accuracy: number;
    readonly trainingTime: number;
    readonly hyperparameters: Record<string, unknown>;
    readonly metrics: Record<string, number>;
}

export interface NLPOptions {
    readonly language?: string;
    readonly tasks?: readonly ('sentiment' | 'entities' | 'emotions' | 'topics')[];
    readonly model?: string;
}

export interface NLPResult {
    readonly text: string;
    readonly language: string;
    readonly sentiment: {
        readonly label: 'positive' | 'negative' | 'neutral';
        readonly confidence: number;
    };
    readonly entities?: readonly NLPEntity[];
    readonly emotions?: Record<string, number>;
    readonly topics?: readonly string[];
}

export interface NLPEntity {
    readonly text: string;
    readonly type: string;
    readonly confidence: number;
    readonly offset: number;
    readonly length: number;
}

export interface DocumentInput {
    readonly content: string | Buffer;
    readonly contentType: string;
    readonly filename?: string;
}

export interface DocumentAnalysisResult {
    readonly documentType: string;
    readonly confidence: number;
    readonly extractedData: Record<string, unknown>;
    readonly structure: {
        readonly pages: number;
        readonly tables: number;
        readonly images: number;
    };
}

// Time Series Types
export interface TimeSeriesData {
    readonly timestamp: Date;
    readonly value: number;
    readonly tags?: Record<string, string>;
    readonly metadata?: Record<string, unknown>;
}

export interface TimeSeriesResult {
    readonly id: string;
    readonly timestamp: Date;
    readonly value: number;
    readonly metadata?: Record<string, unknown>;
}

export interface TimeSeriesQueryOptions {
    readonly startTime?: Date;
    readonly endTime?: Date;
    readonly tags?: Record<string, string>;
    readonly aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
    readonly interval?: string;
    readonly limit?: number;
}

// Multi-Cloud Types
export interface MultiCloudConsistencyLevel {
    readonly level: 'eventual' | 'session' | 'bounded_staleness' | 'strong' | 'consistent_prefix';
    readonly maxStaleness?: number;
    readonly maxLag?: number;
}

export interface OperationType {
    readonly category: 'read' | 'write' | 'query' | 'analytics';
    readonly paradigm: 'document' | 'vector' | 'graph' | 'keyvalue' | 'timeseries' | 'file';
    readonly complexity: 'simple' | 'moderate' | 'complex';
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface OperationMetadata {
    readonly scale: number;
    readonly consistency: 'eventual' | 'strong';
    readonly serverless: boolean;
    readonly analytics: boolean;
    readonly globalDistribution: boolean;
    readonly aiFeatures: boolean;
    readonly enterpriseSecurity: boolean;
    readonly documentProcessing: boolean;
    readonly latencyRequirement?: number;
}

export interface OperationCriteria {
    readonly scale: number;
    readonly consistency: 'eventual' | 'strong';
    readonly serverless: boolean;
    readonly analytics: boolean;
    readonly globalDistribution: boolean;
    readonly aiFeatures: boolean;
    readonly enterpriseSecurity: boolean;
    readonly documentProcessing: boolean;
    readonly latencyRequirement?: number;
}

// Phase 4 Specific Types
export interface EcosystemMetrics {
    readonly totalIntegrations: number;
    readonly activeSessions: number;
    readonly apiCallsPerMinute: number;
    readonly responseTimeP95: number;
    readonly errorRate: number;
    readonly developersOnboarded: number;
    readonly sdksGenerated: number;
    readonly workflowsCreated: number;
}
