/**
 * Multi-Cloud Configuration Interface
 * Defines configuration patterns for AWS, Azure, and GCP integration
 */

import { CloudProvider, CloudSelectionStrategy } from './IntelligentCloudSelector.js';

export interface MultiCloudConfiguration {
    readonly strategy: CloudSelectionStrategy;
    readonly primaryCloud: CloudProvider;
    readonly fallbackClouds: CloudProvider[];
    readonly aws: AWSConfiguration;
    readonly azure: AzureConfiguration;
    readonly gcp: GCPConfiguration;
    readonly local: LocalConfiguration;
    readonly monitoring: MonitoringConfiguration;
    readonly cost: CostOptimizationConfiguration;
}

export interface AWSConfiguration {
    readonly region: string;
    readonly credentials: {
        readonly accessKeyId?: string;
        readonly secretAccessKey?: string;
        readonly sessionToken?: string;
        readonly role?: string;
    };
    readonly services: {
        readonly dynamodb: DynamoDBConfiguration;
        readonly opensearch: OpenSearchConfiguration;
        readonly rds: RDSConfiguration;
        readonly s3: S3Configuration;
        readonly lambda: LambdaConfiguration;
    };
}

export interface AzureConfiguration {
    readonly tenantId: string;
    readonly clientId: string;
    readonly clientSecret?: string;
    readonly subscriptionId: string;
    readonly resourceGroup: string;
    readonly services: {
        readonly cosmosDb: CosmosDBConfiguration;
        readonly cognitiveSearch: CognitiveSearchConfiguration;
        readonly sqlDatabase: SQLDatabaseConfiguration;
        readonly blobStorage: BlobStorageConfiguration;
        readonly functions: AzureFunctionsConfiguration;
    };
}

export interface GCPConfiguration {
    readonly projectId: string;
    readonly keyFilename?: string;
    readonly credentials?: any;
    readonly region: string;
    readonly services: {
        readonly firestore: FirestoreConfiguration;
        readonly spanner: SpannerConfiguration;
        readonly bigquery: BigQueryConfiguration;
        readonly cloudStorage: CloudStorageConfiguration;
        readonly cloudFunctions: CloudFunctionsConfiguration;
    };
}

export interface LocalConfiguration {
    readonly dataPath: string;
    readonly backupPath: string;
    readonly maxMemoryMB: number;
    readonly enablePersistence: boolean;
    readonly compressionEnabled: boolean;
}

export interface MonitoringConfiguration {
    readonly enabled: boolean;
    readonly metricsInterval: number;
    readonly cloudWatch: boolean;
    readonly azureMonitor: boolean;
    readonly gcpOperations: boolean;
    readonly customEndpoint?: string;
}

export interface CostOptimizationConfiguration {
    readonly enabled: boolean;
    readonly maxMonthlyCost: number;
    readonly costAlerts: boolean;
    readonly autoScaling: boolean;
    readonly spotInstances: boolean;
}

// AWS Service Configurations
export interface DynamoDBConfiguration {
    readonly endpoint?: string;
    readonly region: string;
    readonly consistentReads: boolean;
    readonly billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
    readonly readCapacityUnits?: number;
    readonly writeCapacityUnits?: number;
}

export interface OpenSearchConfiguration {
    readonly endpoint: string;
    readonly region: string;
    readonly version: string;
    readonly instanceType: string;
    readonly instanceCount: number;
}

export interface RDSConfiguration {
    readonly engine: 'postgres' | 'mysql' | 'aurora-postgresql' | 'aurora-mysql';
    readonly instanceClass: string;
    readonly allocatedStorage: number;
    readonly multiAZ: boolean;
    readonly backupRetentionPeriod: number;
}

export interface S3Configuration {
    readonly bucket: string;
    readonly region: string;
    readonly storageClass: 'STANDARD' | 'STANDARD_IA' | 'GLACIER' | 'DEEP_ARCHIVE';
    readonly versioning: boolean;
    readonly encryption: boolean;
}

export interface LambdaConfiguration {
    readonly runtime: string;
    readonly timeout: number;
    readonly memorySize: number;
    readonly environment: Record<string, string>;
}

// Azure Service Configurations
export interface CosmosDBConfiguration {
    readonly endpoint: string;
    readonly primaryKey: string;
    readonly databaseName: string;
    readonly consistencyLevel: 'Strong' | 'BoundedStaleness' | 'Session' | 'ConsistentPrefix' | 'Eventual';
    readonly requestUnits: number;
    readonly multiRegion: boolean;
}

export interface CognitiveSearchConfiguration {
    readonly endpoint: string;
    readonly apiKey: string;
    readonly indexName: string;
    readonly tier: 'free' | 'basic' | 'standard' | 'standard2' | 'standard3' | 'storage_optimized_l1' | 'storage_optimized_l2';
}

export interface SQLDatabaseConfiguration {
    readonly server: string;
    readonly database: string;
    readonly username: string;
    readonly password: string;
    readonly tier: 'Basic' | 'Standard' | 'Premium' | 'GeneralPurpose' | 'BusinessCritical' | 'Hyperscale';
    readonly maxSizeMB: number;
}

export interface BlobStorageConfiguration {
    readonly accountName: string;
    readonly accountKey: string;
    readonly containerName: string;
    readonly tier: 'Hot' | 'Cool' | 'Archive';
    readonly redundancy: 'LRS' | 'ZRS' | 'GRS' | 'GZRS';
}

export interface AzureFunctionsConfiguration {
    readonly appName: string;
    readonly resourceGroup: string;
    readonly runtime: string;
    readonly version: string;
    readonly consumptionPlan: boolean;
}

// GCP Service Configurations
export interface FirestoreConfiguration {
    readonly projectId: string;
    readonly databaseId: string;
    readonly location: string;
    readonly type: 'firestore-native' | 'datastore';
}

export interface SpannerConfiguration {
    readonly instanceId: string;
    readonly databaseId: string;
    readonly nodeCount: number;
    readonly processingUnits: number;
}

export interface BigQueryConfiguration {
    readonly datasetId: string;
    readonly location: string;
    readonly defaultTableExpirationMs?: number;
    readonly labels?: Record<string, string>;
}

export interface CloudStorageConfiguration {
    readonly bucketName: string;
    readonly location: string;
    readonly storageClass: 'STANDARD' | 'NEARLINE' | 'COLDLINE' | 'ARCHIVE';
    readonly uniformBucketLevelAccess: boolean;
}

export interface CloudFunctionsConfiguration {
    readonly runtime: string;
    readonly region: string;
    readonly memory: number;
    readonly timeout: number;
    readonly environmentVariables: Record<string, string>;
}

/**
 * Default multi-cloud configuration
 */
export const defaultMultiCloudConfig: MultiCloudConfiguration = {
    strategy: 'performance',
    primaryCloud: 'local',
    fallbackClouds: ['aws', 'azure', 'gcp'],

    aws: {
        region: 'us-east-1',
        credentials: {
            // Will be loaded from environment or IAM role
        },
        services: {
            dynamodb: {
                region: 'us-east-1',
                consistentReads: false,
                billingMode: 'PAY_PER_REQUEST'
            },
            opensearch: {
                endpoint: '',
                region: 'us-east-1',
                version: '2.3',
                instanceType: 't3.small.search',
                instanceCount: 1
            },
            rds: {
                engine: 'postgres',
                instanceClass: 'db.t3.micro',
                allocatedStorage: 20,
                multiAZ: false,
                backupRetentionPeriod: 7
            },
            s3: {
                bucket: 'cbd-universal-storage',
                region: 'us-east-1',
                storageClass: 'STANDARD',
                versioning: true,
                encryption: true
            },
            lambda: {
                runtime: 'nodejs18.x',
                timeout: 30,
                memorySize: 512,
                environment: {}
            }
        }
    },

    azure: {
        tenantId: '',
        clientId: '',
        subscriptionId: '',
        resourceGroup: 'cbd-resources',
        services: {
            cosmosDb: {
                endpoint: '',
                primaryKey: '',
                databaseName: 'cbd-universal',
                consistencyLevel: 'Session',
                requestUnits: 400,
                multiRegion: false
            },
            cognitiveSearch: {
                endpoint: '',
                apiKey: '',
                indexName: 'cbd-vectors',
                tier: 'basic'
            },
            sqlDatabase: {
                server: '',
                database: 'cbd-relational',
                username: '',
                password: '',
                tier: 'Basic',
                maxSizeMB: 250
            },
            blobStorage: {
                accountName: '',
                accountKey: '',
                containerName: 'cbd-files',
                tier: 'Hot',
                redundancy: 'LRS'
            },
            functions: {
                appName: 'cbd-functions',
                resourceGroup: 'cbd-resources',
                runtime: 'node',
                version: '18',
                consumptionPlan: true
            }
        }
    },

    gcp: {
        projectId: '',
        region: 'us-central1',
        services: {
            firestore: {
                projectId: '',
                databaseId: '(default)',
                location: 'us-central1',
                type: 'firestore-native'
            },
            spanner: {
                instanceId: 'cbd-instance',
                databaseId: 'cbd-database',
                nodeCount: 1,
                processingUnits: 1000
            },
            bigquery: {
                datasetId: 'cbd_analytics',
                location: 'US'
            },
            cloudStorage: {
                bucketName: 'cbd-gcp-storage',
                location: 'US',
                storageClass: 'STANDARD',
                uniformBucketLevelAccess: true
            },
            cloudFunctions: {
                runtime: 'nodejs18',
                region: 'us-central1',
                memory: 512,
                timeout: 60,
                environmentVariables: {}
            }
        }
    },

    local: {
        dataPath: './data',
        backupPath: './backup',
        maxMemoryMB: 2048,
        enablePersistence: true,
        compressionEnabled: true
    },

    monitoring: {
        enabled: true,
        metricsInterval: 60000, // 1 minute
        cloudWatch: false,
        azureMonitor: false,
        gcpOperations: false
    },

    cost: {
        enabled: true,
        maxMonthlyCost: 100, // $100/month
        costAlerts: true,
        autoScaling: true,
        spotInstances: false
    }
};

/**
 * Configuration builder for multi-cloud setup
 */
export class MultiCloudConfigBuilder {
    private config: Partial<MultiCloudConfiguration> = {};

    static create(): MultiCloudConfigBuilder {
        return new MultiCloudConfigBuilder();
    }

    withStrategy(strategy: CloudSelectionStrategy): MultiCloudConfigBuilder {
        (this.config as any).strategy = strategy;
        return this;
    }

    withPrimaryCloud(cloud: CloudProvider): MultiCloudConfigBuilder {
        (this.config as any).primaryCloud = cloud;
        return this;
    }

    withFallbackClouds(clouds: CloudProvider[]): MultiCloudConfigBuilder {
        (this.config as any).fallbackClouds = clouds;
        return this;
    }

    withAWS(config: Partial<AWSConfiguration>): MultiCloudConfigBuilder {
        (this.config as any).aws = { ...defaultMultiCloudConfig.aws, ...config };
        return this;
    }

    withAzure(config: Partial<AzureConfiguration>): MultiCloudConfigBuilder {
        (this.config as any).azure = { ...defaultMultiCloudConfig.azure, ...config };
        return this;
    }

    withGCP(config: Partial<GCPConfiguration>): MultiCloudConfigBuilder {
        (this.config as any).gcp = { ...defaultMultiCloudConfig.gcp, ...config };
        return this;
    }

    withLocal(config: Partial<LocalConfiguration>): MultiCloudConfigBuilder {
        (this.config as any).local = { ...defaultMultiCloudConfig.local, ...config };
        return this;
    }

    withMonitoring(config: Partial<MonitoringConfiguration>): MultiCloudConfigBuilder {
        (this.config as any).monitoring = { ...defaultMultiCloudConfig.monitoring, ...config };
        return this;
    }

    withCostOptimization(config: Partial<CostOptimizationConfiguration>): MultiCloudConfigBuilder {
        (this.config as any).cost = { ...defaultMultiCloudConfig.cost, ...config };
        return this;
    }

    build(): MultiCloudConfiguration {
        return { ...defaultMultiCloudConfig, ...this.config };
    }

    /**
     * Load configuration from environment variables
     */
    fromEnvironment(): MultiCloudConfigBuilder {
        // AWS Configuration
        if (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            const credentials: any = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            };

            if (process.env.AWS_SESSION_TOKEN) {
                credentials.sessionToken = process.env.AWS_SESSION_TOKEN;
            }

            this.withAWS({
                region: process.env.AWS_REGION,
                credentials
            });
        }

        // Azure Configuration
        if (process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_ID && process.env.AZURE_SUBSCRIPTION_ID) {
            const azureConfig: any = {
                tenantId: process.env.AZURE_TENANT_ID,
                clientId: process.env.AZURE_CLIENT_ID,
                subscriptionId: process.env.AZURE_SUBSCRIPTION_ID
            };

            if (process.env.AZURE_CLIENT_SECRET) {
                azureConfig.clientSecret = process.env.AZURE_CLIENT_SECRET;
            }

            this.withAzure(azureConfig);
        }

        // GCP Configuration
        if (process.env.GOOGLE_CLOUD_PROJECT) {
            const gcpConfig: any = {
                projectId: process.env.GOOGLE_CLOUD_PROJECT,
                region: process.env.GOOGLE_CLOUD_REGION || 'us-central1'
            };

            if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                gcpConfig.keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            }

            this.withGCP(gcpConfig);
        }

        // Strategy from environment
        if (process.env.CBD_CLOUD_STRATEGY) {
            const strategy = process.env.CBD_CLOUD_STRATEGY as CloudSelectionStrategy;
            if (['performance', 'cost', 'latency', 'availability'].includes(strategy)) {
                this.withStrategy(strategy);
            }
        }

        return this;
    }

    /**
     * Load configuration from file
     */
    static fromFile(filePath: string): MultiCloudConfiguration {
        try {
            const fs = require('fs');
            const configData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return { ...defaultMultiCloudConfig, ...configData };
        } catch (error) {
            console.warn(`Failed to load config from ${filePath}, using defaults:`, error);
            return defaultMultiCloudConfig;
        }
    }

    /**
     * Validate configuration
     */
    static validate(config: MultiCloudConfiguration): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validate strategy
        if (!['performance', 'cost', 'latency', 'availability'].includes(config.strategy)) {
            errors.push(`Invalid strategy: ${config.strategy}`);
        }

        // Validate primary cloud
        if (!['aws', 'azure', 'gcp', 'local'].includes(config.primaryCloud)) {
            errors.push(`Invalid primary cloud: ${config.primaryCloud}`);
        }

        // Validate fallback clouds
        if (!Array.isArray(config.fallbackClouds)) {
            errors.push('Fallback clouds must be an array');
        } else {
            for (const cloud of config.fallbackClouds) {
                if (!['aws', 'azure', 'gcp', 'local'].includes(cloud)) {
                    errors.push(`Invalid fallback cloud: ${cloud}`);
                }
            }
        }

        // AWS specific validation
        if (config.primaryCloud === 'aws' || config.fallbackClouds.includes('aws')) {
            if (!config.aws.region) {
                errors.push('AWS region is required when using AWS');
            }
        }

        // Azure specific validation
        if (config.primaryCloud === 'azure' || config.fallbackClouds.includes('azure')) {
            if (!config.azure.tenantId || !config.azure.subscriptionId) {
                errors.push('Azure tenant ID and subscription ID are required when using Azure');
            }
        }

        // GCP specific validation
        if (config.primaryCloud === 'gcp' || config.fallbackClouds.includes('gcp')) {
            if (!config.gcp.projectId) {
                errors.push('GCP project ID is required when using GCP');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
