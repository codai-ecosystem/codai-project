/**
 * Production Deployment Configuration for MemorAI MCP
 * 
 * Enterprise-grade deployment configuration following Microsoft Azure
 * and Docker best practices for 2025.
 * 
 * Features:
 * - Multi-stage Docker builds with security hardening
 * - Non-root user execution
 * - Health checks and readiness probes
 * - Resource limits and security policies
 * - Production-optimized Node.js settings
 * 
 * @version 2.0.0
 * @author MemorAI Development Team
 */

import { ProductionMonitoringSystem, DEFAULT_MONITORING_CONFIG, MonitoringConfig } from './production-monitoring.js';
import { EnhancedMemoryStore } from './enhanced-memory-store.js';
import { CrossAgentPermissionManager } from './cross-agent-permissions.js';

// Production environment configuration
export interface ProductionConfig {
    // Server configuration
    server: {
        port: number;
        host: string;
        timeout: number; // ms
        keepAlive: boolean;
        maxConnections: number;
    };

    // Security configuration
    security: {
        enableHttps: boolean;
        rateLimiting: {
            enabled: boolean;
            windowMs: number;
            maxRequests: number;
            skipSuccessfulRequests: boolean;
        };
        cors: {
            enabled: boolean;
            origins: string[];
            credentials: boolean;
        };
        helmet: {
            enabled: boolean;
            contentSecurityPolicy: boolean;
            hsts: boolean;
        };
    };

    // Performance configuration
    performance: {
        clustering: {
            enabled: boolean;
            workers: number | 'auto';
        };
        caching: {
            enabled: boolean;
            ttl: number; // seconds
            maxKeys: number;
        };
        compression: {
            enabled: boolean;
            level: number;
            threshold: number; // bytes
        };
    };

    // Database configuration
    database: {
        connectionPool: {
            min: number;
            max: number;
            idle: number; // ms
        };
        retryPolicy: {
            enabled: boolean;
            maxAttempts: number;
            backoffMs: number;
        };
    };

    // Monitoring configuration
    monitoring: MonitoringConfig;

    // Backup and recovery
    backup: {
        enabled: boolean;
        interval: number; // ms
        retention: number; // days
        destinations: string[];
    };
}

/**
 * Production-optimized MemorAI MCP Server
 */
export class ProductionMemorAIMCPServer {
    private monitoringSystem!: ProductionMonitoringSystem;
    private memoryStore!: EnhancedMemoryStore;
    private permissionManager!: CrossAgentPermissionManager;
    private isShuttingDown = false;

    constructor(private config: ProductionConfig) {
        this.initializeComponents();
    }

    /**
     * Initialize all production components
     */
    private initializeComponents(): void {
        // Initialize monitoring system
        this.monitoringSystem = new ProductionMonitoringSystem(this.config.monitoring);

        // Setup health checks
        this.setupHealthChecks();

        // Initialize core components with monitoring
        this.initializeCoreComponents();

        // Setup graceful shutdown handling
        this.setupGracefulShutdown();

        this.monitoringSystem.log('info', 'Production MemorAI MCP Server initialized', {
            config: {
                clustering: this.config.performance.clustering.enabled,
                caching: this.config.performance.caching.enabled,
                monitoring: this.config.monitoring.performanceCollection.enabled,
                backup: this.config.backup.enabled
            }
        });
    }

    /**
     * Setup comprehensive health checks
     */
    private setupHealthChecks(): void {
        // Add memory store health check
        this.config.monitoring.healthChecks.endpoints.push({
            name: 'memory-store',
            check: async () => {
                try {
                    // Test memory store functionality
                    const testResult = await this.testMemoryStore();
                    return {
                        status: testResult.success ? 'healthy' : 'degraded',
                        component: 'memory-store',
                        timestamp: Date.now(),
                        latency: testResult.latency,
                        details: testResult.details
                    };
                } catch (error) {
                    return {
                        status: 'unhealthy',
                        component: 'memory-store',
                        timestamp: Date.now(),
                        latency: 0,
                        errors: [error instanceof Error ? error.message : String(error)]
                    };
                }
            }
        });

        // Add database health check
        this.config.monitoring.healthChecks.endpoints.push({
            name: 'database',
            check: async () => {
                try {
                    const testResult = await this.testDatabase();
                    return {
                        status: testResult.success ? 'healthy' : 'degraded',
                        component: 'database',
                        timestamp: Date.now(),
                        latency: testResult.latency,
                        details: testResult.details
                    };
                } catch (error) {
                    return {
                        status: 'unhealthy',
                        component: 'database',
                        timestamp: Date.now(),
                        latency: 0,
                        errors: [error instanceof Error ? error.message : String(error)]
                    };
                }
            }
        });

        // Add Azure OpenAI health check
        this.config.monitoring.healthChecks.endpoints.push({
            name: 'azure-openai',
            check: async () => {
                try {
                    const testResult = await this.testAzureOpenAI();
                    return {
                        status: testResult.success ? 'healthy' : 'degraded',
                        component: 'azure-openai',
                        timestamp: Date.now(),
                        latency: testResult.latency,
                        details: testResult.details
                    };
                } catch (error) {
                    return {
                        status: 'unhealthy',
                        component: 'azure-openai',
                        timestamp: Date.now(),
                        latency: 0,
                        errors: [error instanceof Error ? error.message : String(error)]
                    };
                }
            }
        });
    }

    /**
     * Initialize core components with production settings
     */
    private initializeCoreComponents(): void {
        // Initialize enhanced memory store
        this.memoryStore = new EnhancedMemoryStore({
            enableVectorSearch: true,
            enableHybridSearch: true,
            vectorSearchWeight: 0.7,
            keywordSearchWeight: 0.3,
            maxResults: 50,
            enableFuzzySearch: true,
            cbdIntegration: {
                enabled: true,
                baseUrl: process.env.CBD_BASE_URL || 'http://localhost:4180',
                timeout: 10000
            },
            azure: {
                endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
                apiKey: process.env.AZURE_OPENAI_API_KEY!,
                deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'text-embedding-3-large',
                apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'
            }
        });

        // Initialize permission manager
        this.permissionManager = new CrossAgentPermissionManager();
    }

    /**
     * Test memory store functionality
     */
    private async testMemoryStore(): Promise<{
        success: boolean;
        latency: number;
        details: Record<string, any>;
    }> {
        const start = Date.now();

        try {
            // Test basic memory operations
            const testMemory = {
                content: 'Production health check test',
                metadata: {
                    importance: 5,
                    tags: ['health-check', 'production'],
                    project: 'memorai-mcp'
                }
            };

            // Store and retrieve test memory
            const stored = await this.memoryStore.store('health-check-agent', testMemory.content, testMemory.metadata);
            const recalled = await this.memoryStore.recall('health-check-agent', 'health check test');

            // Clean up test memory
            await this.memoryStore.forget('health-check-agent', stored.structuredKey);

            const latency = Date.now() - start;

            return {
                success: recalled.length > 0,
                latency,
                details: {
                    stored: !!stored,
                    recalled: recalled.length,
                    searchTime: latency
                }
            };
        } catch (error) {
            return {
                success: false,
                latency: Date.now() - start,
                details: {
                    error: error instanceof Error ? error.message : String(error)
                }
            };
        }
    }

    /**
     * Test database connectivity
     */
    private async testDatabase(): Promise<{
        success: boolean;
        latency: number;
        details: Record<string, any>;
    }> {
        const start = Date.now();

        try {
            // Test CBD database connection
            const response = await fetch(`${process.env.CBD_BASE_URL || 'http://localhost:4180'}/health`, {
                method: 'GET',
                timeout: 5000
            } as any);

            const result = await response.json();
            const latency = Date.now() - start;

            return {
                success: response.ok && result.status === 'healthy',
                latency,
                details: {
                    status: result.status,
                    service: result.service,
                    version: result.version
                }
            };
        } catch (error) {
            return {
                success: false,
                latency: Date.now() - start,
                details: {
                    error: error instanceof Error ? error.message : String(error)
                }
            };
        }
    }

    /**
     * Test Azure OpenAI connectivity
     */
    private async testAzureOpenAI(): Promise<{
        success: boolean;
        latency: number;
        details: Record<string, any>;
    }> {
        const start = Date.now();

        try {
            // Test Azure OpenAI embeddings
            const response = await fetch(
                `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}/embeddings?api-version=${process.env.AZURE_OPENAI_API_VERSION}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': process.env.AZURE_OPENAI_API_KEY!
                    },
                    body: JSON.stringify({
                        input: 'health check test',
                        user: 'health-check-system'
                    }),
                    timeout: 10000
                } as any
            );

            const result = await response.json();
            const latency = Date.now() - start;

            return {
                success: response.ok && result.data && result.data.length > 0,
                latency,
                details: {
                    embedding_length: result.data?.[0]?.embedding?.length || 0,
                    usage: result.usage
                }
            };
        } catch (error) {
            return {
                success: false,
                latency: Date.now() - start,
                details: {
                    error: error instanceof Error ? error.message : String(error)
                }
            };
        }
    }

    /**
     * Setup graceful shutdown handling
     */
    private setupGracefulShutdown(): void {
        const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

        signals.forEach(signal => {
            process.on(signal, async () => {
                if (this.isShuttingDown) return;

                this.monitoringSystem.log('info', `Received ${signal}, starting graceful shutdown`);
                this.isShuttingDown = true;

                try {
                    await this.shutdown();
                    process.exit(0);
                } catch (error) {
                    this.monitoringSystem.log('error', 'Error during shutdown', { error });
                    process.exit(1);
                }
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.monitoringSystem.log('error', 'Uncaught exception', { error: error.message, stack: error.stack });
            process.exit(1);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            this.monitoringSystem.log('error', 'Unhandled promise rejection', { reason, promise });
            process.exit(1);
        });
    }

    /**
     * Get comprehensive system status
     */
    public getSystemStatus() {
        return this.monitoringSystem.getSystemStatus();
    }

    /**
     * Get Prometheus metrics
     */
    public getPrometheusMetrics(): string {
        return this.monitoringSystem.exportMetrics();
    }

    /**
     * Execute operation with full production monitoring
     */
    public async executeWithMonitoring<T>(
        operation: string,
        fn: () => Promise<T>,
        correlationId?: string
    ): Promise<T> {
        return this.monitoringSystem.executeWithCircuitBreaker(
            operation,
            fn,
            correlationId
        );
    }

    /**
     * Graceful shutdown
     */
    public async shutdown(): Promise<void> {
        this.monitoringSystem.log('info', 'Starting graceful shutdown sequence');

        // Stop accepting new requests
        this.isShuttingDown = true;

        // Shutdown monitoring system
        await this.monitoringSystem.shutdown();

        this.monitoringSystem.log('info', 'Graceful shutdown completed');
    }
}

// Default production configuration
export const DEFAULT_PRODUCTION_CONFIG: ProductionConfig = {
    server: {
        port: parseInt(process.env.MEMORAI_MCP_PORT || '4950'),
        host: process.env.MEMORAI_MCP_HOST || '0.0.0.0',
        timeout: 30000, // 30 seconds
        keepAlive: true,
        maxConnections: 1000
    },
    security: {
        enableHttps: process.env.NODE_ENV === 'production',
        rateLimiting: {
            enabled: true,
            windowMs: 60000, // 1 minute
            maxRequests: 1000,
            skipSuccessfulRequests: false
        },
        cors: {
            enabled: true,
            origins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:4006').split(','),
            credentials: true
        },
        helmet: {
            enabled: true,
            contentSecurityPolicy: true,
            hsts: true
        }
    },
    performance: {
        clustering: {
            enabled: process.env.NODE_ENV === 'production',
            workers: 'auto'
        },
        caching: {
            enabled: true,
            ttl: 300, // 5 minutes
            maxKeys: 10000
        },
        compression: {
            enabled: true,
            level: 6,
            threshold: 1024 // 1KB
        }
    },
    database: {
        connectionPool: {
            min: 2,
            max: 10,
            idle: 10000 // 10 seconds
        },
        retryPolicy: {
            enabled: true,
            maxAttempts: 3,
            backoffMs: 1000
        }
    },
    monitoring: DEFAULT_MONITORING_CONFIG,
    backup: {
        enabled: process.env.NODE_ENV === 'production',
        interval: 3600000, // 1 hour
        retention: 30, // 30 days
        destinations: ['local', 'azure-blob']
    }
};