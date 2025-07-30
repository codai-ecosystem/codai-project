/**
 * CODAI Advanced Service Integrations - Main Index
 * Enterprise-grade service integration and orchestration system
 */

// Core Integration Engine
export { ServiceIntegrationEngine } from './ServiceIntegrationEngine';
export type {
    ServiceIntegrationEngineConfig,
    ServiceCallOptions,
    AggregatedMetrics
} from './ServiceIntegrationEngine';

// API Gateway
export { APIGatewayManager } from './APIGatewayManager';
export type {
    GatewayMetrics,
    GatewayHealthStatus,
    RouteMetrics
} from './APIGatewayManager';

// WebSocket Manager
export { WebSocketManager } from './WebSocketManager';
export type {
    RoomInfo,
    WebSocketMetrics,
    WebSocketHealthStatus
} from './WebSocketManager';

// Message Queue Manager
export { MessageQueueManager } from './MessageQueueManager';
export type {
    SendMessageOptions,
    ConsumerOptions,
    MessageHandler,
    QueueMetrics,
    QueueHealthStatus
} from './MessageQueueManager';

// Type Definitions
export * from './types';

// Utility Functions
export const ServiceIntegrationUtils = {
    /**
     * Generate unique service ID
     */
    generateServiceId: (prefix: string = 'service'): string => {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    },

    /**
     * Validate service configuration
     */
    validateServiceConfig: (config: any): boolean => {
        return !!(config.serviceId && config.name && config.baseUrl);
    },

    /**
     * Calculate error rate percentage
     */
    calculateErrorRate: (totalRequests: number, totalErrors: number): number => {
        return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    },

    /**
     * Calculate availability percentage
     */
    calculateAvailability: (uptime: number, totalTime: number): number => {
        return totalTime > 0 ? (uptime / totalTime) * 100 : 0;
    },

    /**
     * Format bytes to human readable string
     */
    formatBytes: (bytes: number, decimals: number = 2): string => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    /**
     * Format duration in milliseconds to human readable string
     */
    formatDuration: (milliseconds: number): string => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
        }
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        }
        if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        return `${seconds}s`;
    },

    /**
     * Deep merge configuration objects
     */
    mergeConfigs: <T>(target: T, source: Partial<T>): T => {
        const result = { ...target };

        for (const key in source) {
            if (source[key] !== undefined) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    (result as any)[key] = ServiceIntegrationUtils.mergeConfigs(
                        (target as any)[key] || {},
                        source[key] as any
                    );
                } else {
                    (result as any)[key] = source[key];
                }
            }
        }

        return result;
    },

    /**
     * Create retry backoff delay
     */
    calculateBackoffDelay: (
        attempt: number,
        strategy: 'linear' | 'exponential' | 'fixed',
        baseDelay: number,
        maxDelay: number,
        multiplier: number = 2,
        jitter: boolean = false
    ): number => {
        let delay: number;

        switch (strategy) {
            case 'linear':
                delay = baseDelay * attempt;
                break;
            case 'exponential':
                delay = baseDelay * Math.pow(multiplier, attempt - 1);
                break;
            case 'fixed':
            default:
                delay = baseDelay;
                break;
        }

        // Apply maximum delay limit
        delay = Math.min(delay, maxDelay);

        // Apply jitter if enabled
        if (jitter) {
            delay = delay * (0.5 + Math.random() * 0.5);
        }

        return Math.floor(delay);
    },

    /**
     * Check if error is retryable
     */
    isRetryableError: (error: any): boolean => {
        // Network errors
        if (error.code === 'ECONNRESET' ||
            error.code === 'ETIMEDOUT' ||
            error.code === 'ECONNREFUSED') {
            return true;
        }

        // HTTP 5xx errors
        if (error.response && error.response.status >= 500) {
            return true;
        }

        // Rate limiting
        if (error.response && error.response.status === 429) {
            return true;
        }

        return false;
    },

    /**
     * Generate cache key
     */
    generateCacheKey: (
        serviceId: string,
        endpoint: string,
        params?: Record<string, any>
    ): string => {
        const baseKey = `${serviceId}:${endpoint}`;

        if (!params || Object.keys(params).length === 0) {
            return baseKey;
        }

        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}=${JSON.stringify(params[key])}`)
            .join('&');

        return `${baseKey}:${Buffer.from(sortedParams).toString('base64')}`;
    },

    /**
     * Parse connection string
     */
    parseConnectionString: (connectionString: string): {
        protocol: string;
        username?: string;
        password?: string;
        host: string;
        port: number;
        database?: string;
        params?: Record<string, string>;
    } => {
        const url = new URL(connectionString);

        const params: Record<string, string> = {};
        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        return {
            protocol: url.protocol.replace(':', ''),
            username: url.username || undefined,
            password: url.password || undefined,
            host: url.hostname,
            port: parseInt(url.port) || 80,
            database: url.pathname.replace('/', '') || undefined,
            params: Object.keys(params).length > 0 ? params : undefined
        };
    },

    /**
     * Create health check function
     */
    createHealthChecker: (config: {
        endpoint: string;
        timeout: number;
        expectedStatus: number[];
    }) => {
        return async (): Promise<{ healthy: boolean; responseTime: number; error?: string }> => {
            const startTime = Date.now();

            try {
                // This would use actual HTTP client in real implementation
                const response = await fetch(config.endpoint, {
                    method: 'GET',
                    signal: AbortSignal.timeout(config.timeout)
                });

                const responseTime = Date.now() - startTime;
                const healthy = config.expectedStatus.includes(response.status);

                return {
                    healthy,
                    responseTime,
                    error: healthy ? undefined : `Unexpected status: ${response.status}`
                };

            } catch (error: any) {
                return {
                    healthy: false,
                    responseTime: Date.now() - startTime,
                    error: error.message
                };
            }
        };
    },

    /**
     * Create circuit breaker state machine
     */
    createCircuitBreakerState: () => {
        let state: 'closed' | 'open' | 'half-open' = 'closed';
        let failureCount = 0;
        let lastFailureTime = 0;
        let successCount = 0;

        return {
            getState: () => state,
            getFailureCount: () => failureCount,
            getSuccessCount: () => successCount,

            recordSuccess: () => {
                failureCount = 0;
                successCount++;

                if (state === 'half-open') {
                    state = 'closed';
                }
            },

            recordFailure: (threshold: number, timeout: number) => {
                failureCount++;
                lastFailureTime = Date.now();

                if (state === 'closed' && failureCount >= threshold) {
                    state = 'open';
                } else if (state === 'half-open') {
                    state = 'open';
                }
            },

            canExecute: (timeout: number) => {
                if (state === 'closed') {
                    return true;
                }

                if (state === 'open') {
                    if (Date.now() - lastFailureTime > timeout) {
                        state = 'half-open';
                        return true;
                    }
                    return false;
                }

                // half-open state
                return true;
            }
        };
    },

    /**
     * Create rate limiter
     */
    createRateLimiter: (
        requestsPerSecond: number,
        burstSize: number,
        windowSize: number = 1000
    ) => {
        const tokens = new Map<string, { count: number; lastRefill: number }>();

        return {
            checkLimit: (key: string): boolean => {
                const now = Date.now();
                const bucket = tokens.get(key) || { count: burstSize, lastRefill: now };

                // Refill tokens
                const timePassed = now - bucket.lastRefill;
                const tokensToAdd = Math.floor((timePassed / windowSize) * requestsPerSecond);

                bucket.count = Math.min(burstSize, bucket.count + tokensToAdd);
                bucket.lastRefill = now;

                // Check if request can be processed
                if (bucket.count > 0) {
                    bucket.count--;
                    tokens.set(key, bucket);
                    return true;
                }

                tokens.set(key, bucket);
                return false;
            },

            getRemainingTokens: (key: string): number => {
                return tokens.get(key)?.count || 0;
            },

            reset: (key?: string) => {
                if (key) {
                    tokens.delete(key);
                } else {
                    tokens.clear();
                }
            }
        };
    }
};

// Default configurations
export const DefaultConfigs = {
    /**
     * Default service integration configuration
     */
    serviceIntegration: {
        timeout: {
            connection: 5000,
            request: 30000,
            response: 30000
        },
        retry: {
            enabled: true,
            maxAttempts: 3,
            backoffStrategy: 'exponential' as const,
            initialDelay: 1000,
            maxDelay: 10000,
            multiplier: 2,
            jitter: true,
            retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED']
        },
        healthCheck: {
            enabled: true,
            endpoint: '/health',
            method: 'GET' as const,
            interval: 30000,
            timeout: 5000,
            retryAttempts: 3,
            expectedStatus: [200],
            failureThreshold: 3,
            recoveryThreshold: 2
        },
        monitoring: {
            enabled: true,
            metrics: {
                enabled: true,
                provider: 'prometheus' as const,
                prefix: 'codai_service_integration'
            },
            tracing: {
                enabled: true,
                provider: 'opentelemetry' as const,
                samplingRate: 0.1
            },
            logging: {
                enabled: true,
                level: 'info' as const,
                format: 'json' as const,
                destination: 'console' as const
            }
        }
    },

    /**
     * Default API Gateway configuration
     */
    apiGateway: {
        cors: {
            enabled: true,
            origins: ['*'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            headers: ['Content-Type', 'Authorization'],
            credentials: false,
            maxAge: 86400,
            preflightContinue: false
        },
        compression: {
            enabled: true,
            threshold: 1024,
            level: 6,
            chunkSize: 16384
        },
        rateLimit: {
            enabled: true,
            global: {
                requestsPerSecond: 100,
                burstSize: 200,
                windowSize: 60
            }
        }
    },

    /**
     * Default WebSocket configuration
     */
    webSocket: {
        authentication: {
            enabled: false,
            type: 'jwt' as const
        },
        rateLimit: {
            enabled: true,
            messagesPerSecond: 10,
            burstSize: 20,
            windowSize: 60
        },
        heartbeat: {
            enabled: true,
            interval: 30000,
            timeout: 5000,
            maxFailures: 3
        },
        compression: {
            enabled: true,
            threshold: 1024
        }
    },

    /**
     * Default Message Queue configuration
     */
    messageQueue: {
        deadLetterQueue: {
            enabled: true,
            maxRetries: 3,
            retryDelay: 5000
        },
        monitoring: {
            enabled: true,
            metrics: {
                enabled: true,
                interval: 30
            }
        }
    }
};
