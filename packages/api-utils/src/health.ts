import { NextRequest, NextResponse } from 'next/server';

/**
 * Standardized health check response interface
 */
export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy' | 'degraded';
    service: string;
    version?: string;
    timestamp: string;
    uptime: number;
    checks: {
        database?: HealthCheckStatus;
        memory?: HealthCheckStatus;
        disk?: HealthCheckStatus;
        external?: HealthCheckStatus[];
    };
    metadata?: Record<string, any>;
}

export interface HealthCheckStatus {
    status: 'ok' | 'warn' | 'error';
    message?: string;
    responseTime?: number;
    details?: Record<string, any>;
}

export interface HealthCheckConfig {
    serviceName: string;
    version?: string;
    checks?: {
        database?: () => Promise<HealthCheckStatus>;
        memory?: () => Promise<HealthCheckStatus>;
        disk?: () => Promise<HealthCheckStatus>;
        external?: Array<{
            name: string;
            check: () => Promise<HealthCheckStatus>;
        }>;
    };
    metadata?: Record<string, any>;
}

/**
 * Creates a standardized health check endpoint
 */
export function createHealthEndpoint(config: HealthCheckConfig) {
    return async function GET(request: NextRequest): Promise<NextResponse> {
        const startTime = Date.now();

        try {
            const checks: HealthCheckResponse['checks'] = {};
            let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

            // Run database check
            if (config.checks?.database) {
                checks.database = await config.checks.database();
                if (checks.database.status === 'error') overallStatus = 'unhealthy';
                else if (checks.database.status === 'warn') overallStatus = 'degraded';
            }

            // Run memory check
            if (config.checks?.memory) {
                checks.memory = await config.checks.memory();
                if (checks.memory.status === 'error') overallStatus = 'unhealthy';
                else if (checks.memory.status === 'warn' && overallStatus === 'healthy') overallStatus = 'degraded';
            }

            // Run disk check
            if (config.checks?.disk) {
                checks.disk = await config.checks.disk();
                if (checks.disk.status === 'error') overallStatus = 'unhealthy';
                else if (checks.disk.status === 'warn' && overallStatus === 'healthy') overallStatus = 'degraded';
            }

            // Run external service checks
            if (config.checks?.external && config.checks.external.length > 0) {
                checks.external = [];
                for (const externalCheck of config.checks.external) {
                    const result = await externalCheck.check();
                    checks.external.push({
                        ...result,
                        details: { ...result.details, name: externalCheck.name }
                    });
                    if (result.status === 'error') overallStatus = 'unhealthy';
                    else if (result.status === 'warn' && overallStatus === 'healthy') overallStatus = 'degraded';
                }
            }

            const response: HealthCheckResponse = {
                status: overallStatus,
                service: config.serviceName,
                version: config.version || 'unknown',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                checks,
                metadata: {
                    ...config.metadata,
                    responseTime: Date.now() - startTime
                }
            };

            const statusCode = overallStatus === 'healthy' ? 200 :
                overallStatus === 'degraded' ? 200 : 503;

            return NextResponse.json(response, { status: statusCode });

        } catch (error) {
            const response: HealthCheckResponse = {
                status: 'unhealthy',
                service: config.serviceName,
                version: config.version || 'unknown',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                checks: {},
                metadata: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    responseTime: Date.now() - startTime
                }
            };

            return NextResponse.json(response, { status: 503 });
        }
    };
}

/**
 * Simple health check for basic services
 */
export function createSimpleHealthEndpoint(serviceName: string, version?: string) {
    return createHealthEndpoint({
        serviceName,
        version: version || 'unknown',
        checks: {
            memory: async (): Promise<HealthCheckStatus> => {
                const memUsage = process.memoryUsage();
                const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

                return {
                    status: memUsagePercent > 90 ? 'error' : memUsagePercent > 70 ? 'warn' : 'ok',
                    message: `Memory usage: ${memUsagePercent.toFixed(2)}%`,
                    details: { memoryUsage: memUsage }
                };
            }
        }
    });
}

/**
 * Status endpoint (lighter version of health)
 */
export function createStatusEndpoint(serviceName: string, version?: string) {
    return async function GET(request: NextRequest): Promise<NextResponse> {
        const response = {
            status: 'ok',
            service: serviceName,
            version,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };

        return NextResponse.json(response);
    };
}

/**
 * Common health check utilities
 */
export const healthUtils = {
    /**
     * Check if a URL is accessible
     */
    async checkUrl(url: string, timeout = 5000): Promise<HealthCheckStatus> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const startTime = Date.now();
            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;

            return {
                status: response.ok ? 'ok' : 'error',
                message: `${response.status} ${response.statusText}`,
                responseTime,
                details: { url, status: response.status }
            };
        } catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'URL check failed',
                details: { url }
            };
        }
    },

    /**
     * Check database connection (generic)
     */
    async checkDatabase(checkFn: () => Promise<any>): Promise<HealthCheckStatus> {
        try {
            const startTime = Date.now();
            await checkFn();
            const responseTime = Date.now() - startTime;

            return {
                status: 'ok',
                message: 'Database connection successful',
                responseTime
            };
        } catch (error) {
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'Database check failed'
            };
        }
    }
};