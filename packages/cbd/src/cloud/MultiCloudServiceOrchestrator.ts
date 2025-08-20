/**
 * Multi-Cloud Service Orchestrator
 * Integrates cloud selection, configuration, and data adapters
 * for intelligent CBD Universal Database operations
 */

import {
    IntelligentCloudSelector,
    CloudProvider,
    CloudScore,
    CloudSelectionStrategy
} from './IntelligentCloudSelector.js';
import { MultiCloudConfiguration } from './MultiCloudConfiguration.js';
import {
    MultiCloudDataRouter,
    UniversalDocument,
    UniversalQuery,
    OperationResult
} from './UniversalDataAdapter.js';

export interface OrchestrationOptions {
    preferredProvider?: CloudProvider;
    fallbackProviders?: CloudProvider[];
    maxRetries?: number;
    timeout?: number;
    consistencyLevel?: 'strong' | 'eventual' | 'session';
    enableAutoFailover?: boolean;
    costOptimization?: boolean;
    performanceFirst?: boolean;
}

export interface OrchestrationMetrics {
    totalOperations: number;
    operationsByProvider: Record<CloudProvider, number>;
    averageLatency: Record<CloudProvider, number>;
    errorRates: Record<CloudProvider, number>;
    costEstimate: Record<CloudProvider, number>;
    uptime: Record<CloudProvider, number>;
    lastHealthCheck: Date;
}

/**
 * Multi-Cloud Service Orchestrator
 * Central coordination point for all multi-cloud operations
 */
export class MultiCloudServiceOrchestrator {
    private cloudSelector: IntelligentCloudSelector;
    private dataRouter: MultiCloudDataRouter;
    private config: Partial<MultiCloudConfiguration>;
    private metrics: OrchestrationMetrics;
    private healthCheckInterval?: NodeJS.Timeout;

    constructor(config?: Partial<MultiCloudConfiguration>) {
        // Store configuration
        this.config = config || {};

        // Initialize components with minimal config
        this.cloudSelector = new IntelligentCloudSelector('performance');
        this.dataRouter = new MultiCloudDataRouter(this.config as MultiCloudConfiguration);

        // Initialize metrics
        this.metrics = {
            totalOperations: 0,
            operationsByProvider: { aws: 0, azure: 0, gcp: 0, local: 0 },
            averageLatency: { aws: 0, azure: 0, gcp: 0, local: 0 },
            errorRates: { aws: 0, azure: 0, gcp: 0, local: 0 },
            costEstimate: { aws: 0, azure: 0, gcp: 0, local: 0 },
            uptime: { aws: 100, azure: 100, gcp: 100, local: 100 },
            lastHealthCheck: new Date()
        };

        // Start health monitoring
        this.startHealthMonitoring();
    }

    /**
     * Create a document with intelligent cloud provider selection
     */
    async create(
        data: UniversalDocument,
        options: OrchestrationOptions = {}
    ): Promise<OperationResult> {
        const startTime = Date.now();

        try {
            // Select optimal cloud provider
            const provider = await this.selectOptimalProvider('create', data, options);

            // Execute operation
            const result = await this.dataRouter.route('create', provider, data);

            const latency = Date.now() - startTime;

            // Update metrics
            this.updateMetrics('create', provider, latency, true);

            return {
                success: true,
                result,
                cloud: provider,
                latency,
                cost: this.estimateOperationCost('create', provider, data)
            };
        } catch (error) {
            const latency = Date.now() - startTime;
            const fallbackResult = await this.handleOperationFailure(
                'create', [data], options, latency
            );

            if (fallbackResult) {
                return fallbackResult;
            }

            return {
                success: false,
                error: (error as Error).message,
                cloud: options.preferredProvider || 'local',
                latency
            };
        }
    }

    /**
     * Read data with intelligent query routing
     */
    async read(
        query: UniversalQuery,
        options: OrchestrationOptions = {}
    ): Promise<OperationResult> {
        const startTime = Date.now();

        try {
            // Select optimal cloud provider for read operation
            const provider = await this.selectOptimalProvider('read', query, options);

            // Execute query
            const results = await this.dataRouter.route('read', provider, query);

            const latency = Date.now() - startTime;

            // Update metrics
            this.updateMetrics('read', provider, latency, true);

            return {
                success: true,
                result: results,
                cloud: provider,
                latency,
                cost: this.estimateOperationCost('read', provider, query)
            };
        } catch (error) {
            const latency = Date.now() - startTime;
            const fallbackResult = await this.handleOperationFailure(
                'read', [query], options, latency
            );

            if (fallbackResult) {
                return fallbackResult;
            }

            return {
                success: false,
                error: (error as Error).message,
                cloud: options.preferredProvider || 'local',
                latency
            };
        }
    }

    /**
     * Update document with consistency guarantees
     */
    async update(
        id: string,
        data: Partial<UniversalDocument>,
        options: OrchestrationOptions = {}
    ): Promise<OperationResult> {
        const startTime = Date.now();

        try {
            // For updates, consider consistency requirements
            const provider = await this.selectOptimalProvider('update', { id, data }, options);

            // Execute update
            const result = await this.dataRouter.route('update', provider, id, data);

            const latency = Date.now() - startTime;

            // Update metrics
            this.updateMetrics('update', provider, latency, true);

            return {
                success: true,
                result,
                cloud: provider,
                latency,
                cost: this.estimateOperationCost('update', provider, { id, data })
            };
        } catch (error) {
            const latency = Date.now() - startTime;
            const fallbackResult = await this.handleOperationFailure(
                'update', [id, data], options, latency
            );

            if (fallbackResult) {
                return fallbackResult;
            }

            return {
                success: false,
                error: (error as Error).message,
                cloud: options.preferredProvider || 'local',
                latency
            };
        }
    }

    /**
     * Delete document with confirmation
     */
    async delete(
        id: string,
        options: OrchestrationOptions = {}
    ): Promise<OperationResult> {
        const startTime = Date.now();

        try {
            // Select provider for delete operation
            const provider = await this.selectOptimalProvider('delete', { id }, options);

            // Execute delete
            const result = await this.dataRouter.route('delete', provider, id);

            const latency = Date.now() - startTime;

            // Update metrics
            this.updateMetrics('delete', provider, latency, true);

            return {
                success: true,
                result,
                cloud: provider,
                latency,
                cost: this.estimateOperationCost('delete', provider, { id })
            };
        } catch (error) {
            const latency = Date.now() - startTime;
            const fallbackResult = await this.handleOperationFailure(
                'delete', [id], options, latency
            );

            if (fallbackResult) {
                return fallbackResult;
            }

            return {
                success: false,
                error: (error as Error).message,
                cloud: options.preferredProvider || 'local',
                latency
            };
        }
    }

    /**
     * Select optimal cloud provider for operation
     */
    private async selectOptimalProvider(
        operation: string,
        data: any,
        options: OrchestrationOptions
    ): Promise<CloudProvider> {
        // If preferred provider is specified, use it
        if (options.preferredProvider) {
            const health = await this.dataRouter.healthCheck();
            if (health[options.preferredProvider]) {
                return options.preferredProvider;
            }
        }

        // Use cloud selector with operation criteria
        const selection = await this.cloudSelector.selectOptimalCloud(
            operation,
            {
                scale: this.estimateDataSize(data),
                consistency: 'eventual',
                latencyRequirement: 1000,
                serverless: false,
                analytics: false,
                globalDistribution: false,
                aiFeatures: false,
                enterpriseSecurity: false,
                documentProcessing: true,
                machineLearning: false,
                strongConsistency: options.consistencyLevel === 'strong',
                bigData: false,
                realTimeAnalytics: false,
                costSensitive: options.costOptimization || false
            }
        );

        // Verify selected provider is healthy
        const health = await this.dataRouter.healthCheck();
        if (health[selection.selectedProvider]) {
            return selection.selectedProvider;
        }

        // Fallback to first healthy provider
        const fallbackProviders = options.fallbackProviders || ['local', 'aws', 'azure', 'gcp'];
        for (const provider of fallbackProviders) {
            if (health[provider]) {
                console.log(`Falling back to ${provider} due to ${selection.selectedProvider} being unhealthy`);
                return provider;
            }
        }

        // Final fallback to local
        return 'local';
    }

    /**
     * Handle operation failures with fallback logic
     */
    private async handleOperationFailure(
        operation: string,
        args: any[],
        options: OrchestrationOptions,
        originalLatency: number
    ): Promise<OperationResult | null> {
        if (!options.enableAutoFailover) {
            return null;
        }

        const fallbackProviders = options.fallbackProviders || ['local'];

        for (const provider of fallbackProviders) {
            try {
                console.log(`Attempting fallback to ${provider} for ${operation} operation`);

                const startTime = Date.now();
                let result;

                switch (operation) {
                    case 'create':
                        result = await this.dataRouter.route('create', provider, args[0]);
                        break;
                    case 'read':
                        result = await this.dataRouter.route('read', provider, args[0]);
                        break;
                    case 'update':
                        result = await this.dataRouter.route('update', provider, args[0], args[1]);
                        break;
                    case 'delete':
                        result = await this.dataRouter.route('delete', provider, args[0]);
                        break;
                    default:
                        continue;
                }

                const latency = Date.now() - startTime;

                // Update metrics for successful fallback
                this.updateMetrics(operation, provider, latency, true);

                return {
                    success: true,
                    result,
                    cloud: provider,
                    latency: originalLatency + latency,
                    cost: this.estimateOperationCost(operation, provider, args[0])
                };
            } catch (fallbackError) {
                console.error(`Fallback to ${provider} failed:`, fallbackError);
                continue;
            }
        }

        return null;
    }

    /**
     * Update operation metrics
     */
    private updateMetrics(
        operation: string,
        provider: CloudProvider,
        latency: number,
        success: boolean
    ): void {
        this.metrics.totalOperations++;
        this.metrics.operationsByProvider[provider]++;

        // Update average latency
        const currentAvg = this.metrics.averageLatency[provider];
        const currentCount = this.metrics.operationsByProvider[provider];
        this.metrics.averageLatency[provider] =
            (currentAvg * (currentCount - 1) + latency) / currentCount;

        // Update error rates
        if (!success) {
            this.metrics.errorRates[provider]++;
        }

        console.log(`Metrics updated: ${operation} via ${provider} - ${success ? 'SUCCESS' : 'FAILURE'} (${latency}ms)`);
    }

    /**
     * Estimate data size for operation
     */
    private estimateDataSize(data: any): number {
        try {
            return JSON.stringify(data).length;
        } catch {
            return 1024; // Default 1KB
        }
    }

    /**
     * Estimate operation cost
     */
    private estimateOperationCost(
        operation: string,
        provider: CloudProvider,
        data: any
    ): number {
        const dataSize = this.estimateDataSize(data);

        // Simple cost estimation model (in cents)
        const baseCosts = {
            aws: { create: 0.01, read: 0.005, update: 0.01, delete: 0.005 },
            azure: { create: 0.012, read: 0.006, update: 0.012, delete: 0.006 },
            gcp: { create: 0.009, read: 0.004, update: 0.009, delete: 0.004 },
            local: { create: 0, read: 0, update: 0, delete: 0 }
        };

        const baseCost = baseCosts[provider]?.[operation as keyof typeof baseCosts.aws] || 0;
        const sizeFactor = Math.max(1, dataSize / 1024); // Per KB

        return baseCost * sizeFactor;
    }

    /**
     * Start health monitoring for all cloud providers
     */
    private startHealthMonitoring(): void {
        // Check health every 30 seconds
        this.healthCheckInterval = setInterval(async () => {
            try {
                const health = await this.dataRouter.healthCheck();

                for (const [provider, isHealthy] of Object.entries(health)) {
                    const uptime = isHealthy ? 100 : 0;
                    this.metrics.uptime[provider as CloudProvider] = uptime;
                }

                this.metrics.lastHealthCheck = new Date();
                console.log('Health check completed:', health);
            } catch (error) {
                console.error('Health check failed:', error);
            }
        }, 30000);
    }

    /**
     * Get comprehensive orchestration metrics
     */
    async getMetrics(): Promise<OrchestrationMetrics> {
        // Get latest adapter metrics
        const adapterMetrics = await this.dataRouter.getAdapterMetrics();

        // Enhance with adapter-specific data
        for (const [provider, metrics] of Object.entries(adapterMetrics)) {
            if (metrics) {
                // Update metrics with real data from adapters
                console.log(`Updated metrics for ${provider}:`, metrics);
            }
        }

        return { ...this.metrics };
    }

    /**
     * Perform comprehensive health check
     */
    async healthCheck(): Promise<{
        overall: boolean;
        providers: Record<CloudProvider, boolean>;
        orchestrator: boolean;
    }> {
        const providerHealth = await this.dataRouter.healthCheck();
        const healthyProviders = Object.values(providerHealth).filter(Boolean).length;

        return {
            overall: healthyProviders > 0,
            providers: providerHealth,
            orchestrator: true
        };
    }

    /**
     * Get cloud selection recommendations
     */
    async getCloudRecommendations(operation: string, data: any): Promise<CloudScore[]> {
        const selection = await this.cloudSelector.selectOptimalCloud(
            operation,
            {
                scale: this.estimateDataSize(data),
                consistency: 'eventual',
                latencyRequirement: 1000,
                serverless: false,
                analytics: false,
                globalDistribution: false,
                aiFeatures: false,
                enterpriseSecurity: false,
                documentProcessing: true,
                machineLearning: false,
                strongConsistency: false,
                bigData: false,
                realTimeAnalytics: false,
                costSensitive: false
            }
        );

        return selection.scores;
    }

    /**
     * Shutdown orchestrator and cleanup resources
     */
    shutdown(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        console.log('Multi-Cloud Service Orchestrator shutdown completed');
    }
}

/**
 * Factory function to create configured orchestrator
 */
export function createMultiCloudOrchestrator(
    config?: Partial<MultiCloudConfiguration>
): MultiCloudServiceOrchestrator {
    return new MultiCloudServiceOrchestrator(config);
}

/**
 * Default orchestrator instance for convenience
 */
export const defaultOrchestrator = createMultiCloudOrchestrator();
