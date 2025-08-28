/**
 * CBD 2.0 Main Engine Integration
 * Integrating HTAP Processing Engine with Multi-Paradigm Storage
 * Phase 1 implementation entry point
 */

import { EventEmitter } from 'events';
import { Logger } from './utils/logger.js';
import {
    CBDHTAPProcessingEngine,
    HTAPConfig,
    DEFAULT_HTAP_CONFIG,
    QueryContext,
    QueryResult
} from './htap/HTAPProcessingEngine.js';
import {
    CBDMultiParadigmEngine,
    MultiParadigmQuery,
    DBParadigm,
    DEFAULT_MULTIPARADIGM_CONFIG
} from './multiparadigm/MultiParadigmEngine.js';

// CBD 2.0 Engine Configuration
export interface CBD2Config {
    htap: HTAPConfig;
    multiParadigm: typeof DEFAULT_MULTIPARADIGM_CONFIG;
    clustering: {
        enabled: boolean;
        nodes: string[];
        replicationFactor: number;
    };
    security: {
        encryptionEnabled: boolean;
        rbacEnabled: boolean;
        auditEnabled: boolean;
    };
    monitoring: {
        metricsEnabled: boolean;
        healthCheckInterval: number;
        alertThresholds: {
            cpuUsage: number;
            memoryUsage: number;
            diskUsage: number;
        };
    };
}

// Default CBD 2.0 configuration
export const DEFAULT_CBD2_CONFIG: CBD2Config = {
    htap: DEFAULT_HTAP_CONFIG,
    multiParadigm: DEFAULT_MULTIPARADIGM_CONFIG,
    clustering: {
        enabled: false,
        nodes: ['localhost:5432'],
        replicationFactor: 1
    },
    security: {
        encryptionEnabled: true,
        rbacEnabled: true,
        auditEnabled: true
    },
    monitoring: {
        metricsEnabled: true,
        healthCheckInterval: 30000, // 30 seconds
        alertThresholds: {
            cpuUsage: 80,
            memoryUsage: 85,
            diskUsage: 90
        }
    }
};

// Engine health status
export interface EngineHealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'stopped';
    uptime: number; // milliseconds
    htapStatus: 'active' | 'inactive' | 'error';
    paradigmsStatus: Record<DBParadigm, 'active' | 'inactive' | 'error'>;
    lastHealthCheck: Date;
    metrics: {
        totalQueries: number;
        avgResponseTimeMs: number;
        errorRate: number;
        throughputPerSecond: number;
    };
    errors: string[];
}

/**
 * CBD 2.0 Main Engine
 * Orchestrates HTAP processing with multi-paradigm storage
 */
export class CBD2MainEngine extends EventEmitter {
    private config: CBD2Config;
    private logger: Logger;
    private startTime: Date;
    private isRunning = false;

    // Core engines
    private htapEngine: CBDHTAPProcessingEngine;
    private multiParadigmEngine: CBDMultiParadigmEngine;

    // Health monitoring
    private healthStatus: EngineHealthStatus;
    private healthCheckTimer?: NodeJS.Timeout;

    // Statistics tracking
    private queryCount = 0;
    private totalResponseTime = 0;
    private errorCount = 0;

    constructor(config: CBD2Config = DEFAULT_CBD2_CONFIG) {
        super();
        this.config = config;
        this.logger = new Logger('CBD2MainEngine');
        this.startTime = new Date();

        // Initialize core engines
        this.htapEngine = new CBDHTAPProcessingEngine(config.htap);
        this.multiParadigmEngine = new CBDMultiParadigmEngine(this.htapEngine);

        // Initialize health status
        this.healthStatus = this.initializeHealthStatus();

        // Set up event handlers
        this.setupEventHandlers();
    }

    /**
     * Initialize CBD 2.0 engine
     */
    async initialize(): Promise<void> {
        try {
            this.logger.info('Initializing CBD 2.0 Main Engine...');

            // Initialize HTAP engine
            await this.htapEngine.initialize();
            this.logger.info('HTAP Processing Engine initialized');

            // Initialize multi-paradigm engine
            // (Already initialized in constructor)
            this.logger.info('Multi-Paradigm Engine initialized');

            // Start health monitoring
            if (this.config.monitoring.metricsEnabled) {
                this.startHealthMonitoring();
            }

            // Update status
            this.isRunning = true;
            this.healthStatus.status = 'healthy';
            this.healthStatus.htapStatus = 'active';

            // Initialize all paradigms as active
            Object.values(DBParadigm).forEach(paradigm => {
                this.healthStatus.paradigmsStatus[paradigm] = 'active';
            });

            this.emit('initialized', this.getHealthStatus());
            this.logger.info('CBD 2.0 Main Engine initialized successfully');

        } catch (error) {
            this.logger.error('Failed to initialize CBD 2.0 engine:', error);
            this.healthStatus.status = 'unhealthy';
            this.healthStatus.errors.push(error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }

    /**
     * Execute unified query (SQL, NoSQL, Vector, Graph, etc.)
     */
    async executeQuery(query: string | MultiParadigmQuery | QueryContext): Promise<any> {
        if (!this.isRunning) {
            throw new Error('CBD 2.0 engine is not running');
        }

        const startTime = performance.now();
        this.queryCount++;

        try {
            let result: any;

            // Handle different query types
            if (typeof query === 'string') {
                // Assume SQL query
                result = await this.executeSQLQuery(query);
            } else if ('paradigm' in query) {
                // Multi-paradigm query
                result = await this.multiParadigmEngine.executeQuery(query as MultiParadigmQuery);
            } else {
                // HTAP query context
                result = await this.htapEngine.executeQuery(query as QueryContext);
            }

            // Update statistics
            const responseTime = performance.now() - startTime;
            this.totalResponseTime += responseTime;

            this.emit('queryExecuted', { query, result, responseTime });
            return result;

        } catch (error) {
            this.errorCount++;
            const responseTime = performance.now() - startTime;
            this.totalResponseTime += responseTime;

            this.logger.error('Query execution failed:', error);
            this.emit('queryError', { query, error, responseTime });
            throw error;
        }
    }

    /**
     * Execute SQL query through HTAP engine
     */
    async executeSQLQuery(sql: string, params: any[] = []): Promise<QueryResult> {
        const context: QueryContext = {
            queryId: this.generateQueryId(),
            type: this.classifySQLQuery(sql),
            sql,
            parameters: params,
            priority: 'medium',
            metadata: { source: 'cbd2_main_engine' }
        };

        return await this.htapEngine.executeQuery(context);
    }

    /**
     * Execute multi-paradigm query
     */
    async executeMultiParadigmQuery(query: MultiParadigmQuery): Promise<any> {
        return await this.multiParadigmEngine.executeQuery(query);
    }

    /**
     * Get comprehensive health status
     */
    getHealthStatus(): EngineHealthStatus {
        const now = new Date();
        const uptime = now.getTime() - this.startTime.getTime();

        return {
            ...this.healthStatus,
            uptime,
            lastHealthCheck: now,
            metrics: {
                totalQueries: this.queryCount,
                avgResponseTimeMs: this.queryCount > 0 ? this.totalResponseTime / this.queryCount : 0,
                errorRate: this.queryCount > 0 ? (this.errorCount / this.queryCount) * 100 : 0,
                throughputPerSecond: this.calculateThroughput()
            }
        };
    }

    /**
     * Get detailed engine statistics
     */
    async getDetailedStats(): Promise<{
        engine: EngineHealthStatus;
        htap: any;
        paradigms: any[];
    }> {
        const [htapStats, paradigmStats] = await Promise.all([
            this.htapEngine.getStats(),
            Promise.resolve(this.multiParadigmEngine.getParadigmStats())
        ]);

        return {
            engine: this.getHealthStatus(),
            htap: htapStats,
            paradigms: paradigmStats
        };
    }

    /**
     * Shutdown CBD 2.0 engine gracefully
     */
    async shutdown(): Promise<void> {
        this.logger.info('Shutting down CBD 2.0 Main Engine...');

        try {
            // Stop accepting new queries
            this.isRunning = false;

            // Stop health monitoring
            if (this.healthCheckTimer) {
                clearInterval(this.healthCheckTimer);
            }

            // Shutdown engines
            await this.htapEngine.shutdown();
            this.logger.info('HTAP engine shut down');

            // Clean up multi-paradigm engine
            this.multiParadigmEngine.removeAllListeners();
            this.logger.info('Multi-paradigm engine shut down');

            // Update status
            this.healthStatus.status = 'stopped';
            this.healthStatus.htapStatus = 'inactive';
            Object.keys(this.healthStatus.paradigmsStatus).forEach(paradigm => {
                this.healthStatus.paradigmsStatus[paradigm as DBParadigm] = 'inactive';
            });

            // Clean up event listeners
            this.removeAllListeners();

            this.emit('shutdown');
            this.logger.info('CBD 2.0 Main Engine shut down successfully');

        } catch (error) {
            this.logger.error('Error during CBD 2.0 engine shutdown:', error);
            throw error;
        }
    }

    // Private methods

    /**
     * Initialize health status object
     */
    private initializeHealthStatus(): EngineHealthStatus {
        const paradigmsStatus: Record<DBParadigm, 'active' | 'inactive' | 'error'> =
            {} as Record<DBParadigm, 'active' | 'inactive' | 'error'>;

        Object.values(DBParadigm).forEach(paradigm => {
            paradigmsStatus[paradigm] = 'inactive';
        });

        return {
            status: 'stopped',
            uptime: 0,
            htapStatus: 'inactive',
            paradigmsStatus,
            lastHealthCheck: new Date(),
            metrics: {
                totalQueries: 0,
                avgResponseTimeMs: 0,
                errorRate: 0,
                throughputPerSecond: 0
            },
            errors: []
        };
    }

    /**
     * Set up event handlers for engines
     */
    private setupEventHandlers(): void {
        // HTAP engine events
        this.htapEngine.on('queryExecuted', (data) => {
            this.emit('htapQueryExecuted', data);
        });

        this.htapEngine.on('statsUpdated', (stats) => {
            this.emit('htapStatsUpdated', stats);
        });

        // Multi-paradigm engine events
        this.multiParadigmEngine.on('queryExecuted', (data) => {
            this.emit('paradigmQueryExecuted', data);
        });

        // Error handling
        this.htapEngine.on('error', (error) => {
            this.logger.error('HTAP engine error:', error);
            this.healthStatus.htapStatus = 'error';
            this.healthStatus.errors.push(`HTAP: ${error.message}`);
        });

        this.multiParadigmEngine.on('error', (error) => {
            this.logger.error('Multi-paradigm engine error:', error);
            this.healthStatus.errors.push(`MultiParadigm: ${error.message}`);
        });
    }

    /**
     * Start health monitoring
     */
    private startHealthMonitoring(): void {
        this.healthCheckTimer = setInterval(() => {
            this.performHealthCheck();
        }, this.config.monitoring.healthCheckInterval);

        this.logger.info('Health monitoring started');
    }

    /**
     * Perform health check
     */
    private performHealthCheck(): void {
        try {
            // Check system resources
            const cpuUsage = this.getCurrentCpuUsage();
            const memoryUsage = this.getCurrentMemoryUsage();

            // Update health status based on thresholds
            const thresholds = this.config.monitoring.alertThresholds;

            if (cpuUsage > thresholds.cpuUsage || memoryUsage > thresholds.memoryUsage) {
                this.healthStatus.status = 'degraded';
            } else {
                this.healthStatus.status = 'healthy';
            }

            // Emit health check event
            this.emit('healthCheck', this.getHealthStatus());

        } catch (error) {
            this.logger.error('Health check failed:', error);
            this.healthStatus.status = 'unhealthy';
            this.healthStatus.errors.push(`Health check: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Classify SQL query type
     */
    private classifySQLQuery(sql: string): any {
        const sqlLower = sql.toLowerCase().trim();
        if (sqlLower.startsWith('select')) return 'OLAP_ANALYTICAL';
        if (sqlLower.startsWith('insert') || sqlLower.startsWith('update') || sqlLower.startsWith('delete')) {
            return 'OLTP_TRANSACTIONAL';
        }
        return 'MIXED_WORKLOAD';
    }

    /**
     * Generate unique query ID
     */
    private generateQueryId(): string {
        return `cbd2_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Calculate current throughput
     */
    private calculateThroughput(): number {
        const uptimeSeconds = (new Date().getTime() - this.startTime.getTime()) / 1000;
        return uptimeSeconds > 0 ? this.queryCount / uptimeSeconds : 0;
    }

    // Mock system metrics (in production these would use actual system APIs)
    private getCurrentCpuUsage(): number {
        return Math.random() * 100;
    }

    private getCurrentMemoryUsage(): number {
        return Math.random() * 100;
    }
}

// Export for easy integration
export default CBD2MainEngine;