import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Status interfaces
 */
export interface ServiceStatus {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    lastChecked: string;
    version?: string;
    uptime?: number;
    details?: Record<string, any>;
}

export interface SystemStatus {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: ServiceStatus[];
    timestamp: string;
    version?: string;
    environment?: string;
    uptime?: number;
    metadata?: Record<string, any>;
}

export interface StatusCheck {
    name: string;
    check: () => Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details?: Record<string, any>;
        responseTime?: number;
    }>;
}

/**
 * Validation schemas
 */
export const serviceStatusSchema = z.object({
    name: z.string(),
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    responseTime: z.number().optional(),
    lastChecked: z.string().datetime(),
    version: z.string().optional(),
    uptime: z.number().optional(),
    details: z.record(z.any()).optional()
});

export const systemStatusSchema = z.object({
    overall: z.enum(['healthy', 'degraded', 'unhealthy']),
    services: z.array(serviceStatusSchema),
    timestamp: z.string().datetime(),
    version: z.string().optional(),
    environment: z.string().optional(),
    uptime: z.number().optional(),
    metadata: z.record(z.any()).optional()
});

/**
 * Status repository interface for dependency injection
 */
export interface StatusRepository {
    getSystemStatus(): Promise<SystemStatus>;
    getServiceStatus(serviceName: string): Promise<ServiceStatus | null>;
    updateServiceStatus(status: ServiceStatus): Promise<void>;
    getStatusHistory(serviceName?: string, hours?: number): Promise<ServiceStatus[]>;
}

/**
 * Create GET /api/status endpoint
 */
export function createStatusEndpoint(
    statusRepo?: StatusRepository,
    checks: StatusCheck[] = []
) {
    return async function GET(request: NextRequest): Promise<NextResponse> {
        try {
            let systemStatus: SystemStatus;

            if (statusRepo) {
                // Use repository if provided
                systemStatus = await statusRepo.getSystemStatus();
            } else {
                // Run checks directly
                const serviceResults = await Promise.allSettled(
                    checks.map(async (check) => {
                        const startTime = Date.now();
                        try {
                            const result = await check.check();
                            return {
                                name: check.name,
                                status: result.status,
                                responseTime: result.responseTime || Date.now() - startTime,
                                lastChecked: new Date().toISOString(),
                                details: result.details
                            } as ServiceStatus;
                        } catch (error) {
                            return {
                                name: check.name,
                                status: 'unhealthy' as const,
                                responseTime: Date.now() - startTime,
                                lastChecked: new Date().toISOString(),
                                details: {
                                    error: error instanceof Error ? error.message : 'Unknown error'
                                }
                            } as ServiceStatus;
                        }
                    })
                );

                const services = serviceResults.map(result =>
                    result.status === 'fulfilled' ? result.value : {
                        name: 'unknown',
                        status: 'unhealthy' as const,
                        responseTime: 0,
                        lastChecked: new Date().toISOString(),
                        details: { error: 'Failed to execute check' }
                    }
                );

                // Determine overall status
                const healthyCount = services.filter(s => s.status === 'healthy').length;
                const degradedCount = services.filter(s => s.status === 'degraded').length;

                let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
                if (services.length === 0 || services.every(s => s.status === 'unhealthy')) {
                    overall = 'unhealthy';
                } else if (degradedCount > 0 || healthyCount < services.length) {
                    overall = 'degraded';
                }

                systemStatus = {
                    overall,
                    services,
                    timestamp: new Date().toISOString(),
                    version: process.env.npm_package_version,
                    environment: process.env.NODE_ENV || 'unknown',
                    uptime: process.uptime()
                };
            }

            // Set appropriate HTTP status code
            let httpStatus = 200;
            if (systemStatus.overall === 'degraded') httpStatus = 207;
            if (systemStatus.overall === 'unhealthy') httpStatus = 503;

            return NextResponse.json(systemStatus, { status: httpStatus });

        } catch (error) {
            console.error('Status endpoint error:', error);
            return NextResponse.json(
                {
                    overall: 'unhealthy',
                    services: [],
                    timestamp: new Date().toISOString(),
                    metadata: {
                        error: error instanceof Error ? error.message : 'Unknown error'
                    }
                } as SystemStatus,
                { status: 503 }
            );
        }
    };
}

/**
 * Create GET /api/status/[service] endpoint
 */
export function createServiceStatusEndpoint(
    statusRepo: StatusRepository,
    checks: StatusCheck[] = []
) {
    return async function GET(
        request: NextRequest,
        { params }: { params: { service: string } }
    ): Promise<NextResponse> {
        try {
            const { service } = params;

            // Try to get from repository first
            let serviceStatus = await statusRepo.getServiceStatus(service);

            // If not found in repo, try to run check directly
            if (!serviceStatus) {
                const check = checks.find(c => c.name === service);
                if (check) {
                    const startTime = Date.now();
                    try {
                        const result = await check.check();
                        serviceStatus = {
                            name: service,
                            status: result.status,
                            responseTime: result.responseTime || Date.now() - startTime,
                            lastChecked: new Date().toISOString(),
                            details: result.details
                        };
                    } catch (error) {
                        serviceStatus = {
                            name: service,
                            status: 'unhealthy',
                            responseTime: Date.now() - startTime,
                            lastChecked: new Date().toISOString(),
                            details: {
                                error: error instanceof Error ? error.message : 'Unknown error'
                            }
                        };
                    }
                }
            }

            if (!serviceStatus) {
                return NextResponse.json(
                    { error: 'Service not found' },
                    { status: 404 }
                );
            }

            // Set appropriate HTTP status code
            let httpStatus = 200;
            if (serviceStatus.status === 'degraded') httpStatus = 207;
            if (serviceStatus.status === 'unhealthy') httpStatus = 503;

            return NextResponse.json(serviceStatus, { status: httpStatus });

        } catch (error) {
            console.error('Service status error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create GET /api/status/history endpoint
 */
export function createStatusHistoryEndpoint(statusRepo: StatusRepository) {
    return async function GET(request: NextRequest): Promise<NextResponse> {
        try {
            const { searchParams } = new URL(request.url);
            const serviceName = searchParams.get('service') || undefined;
            const hours = parseInt(searchParams.get('hours') || '24');

            const history = await statusRepo.getStatusHistory(serviceName, hours);

            return NextResponse.json({
                history,
                timeRange: {
                    hours,
                    from: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
                    to: new Date().toISOString()
                },
                service: serviceName
            });

        } catch (error) {
            console.error('Status history error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Status check utilities
 */
export const statusUtils = {
    /**
     * Create database status check
     */
    createDatabaseCheck(name: string, checkFunction: () => Promise<boolean>): StatusCheck {
        return {
            name,
            check: async () => {
                try {
                    const isHealthy = await checkFunction();
                    return {
                        status: isHealthy ? 'healthy' : 'unhealthy',
                        details: {
                            connected: isHealthy,
                            type: 'database'
                        }
                    };
                } catch (error) {
                    return {
                        status: 'unhealthy',
                        details: {
                            connected: false,
                            type: 'database',
                            error: error instanceof Error ? error.message : 'Unknown error'
                        }
                    };
                }
            }
        };
    },

    /**
     * Create HTTP service check
     */
    createHttpServiceCheck(name: string, url: string, timeout = 5000): StatusCheck {
        return {
            name,
            check: async () => {
                const startTime = Date.now();
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeout);

                    const response = await fetch(url, {
                        method: 'HEAD',
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);
                    const responseTime = Date.now() - startTime;

                    const status = response.ok ? 'healthy' :
                        response.status >= 500 ? 'unhealthy' : 'degraded';

                    return {
                        status,
                        responseTime,
                        details: {
                            url,
                            statusCode: response.status,
                            type: 'http_service'
                        }
                    };
                } catch (error) {
                    return {
                        status: 'unhealthy',
                        responseTime: Date.now() - startTime,
                        details: {
                            url,
                            type: 'http_service',
                            error: error instanceof Error ? error.message : 'Unknown error'
                        }
                    };
                }
            }
        };
    },

    /**
     * Create memory usage check
     */
    createMemoryCheck(name: string, thresholdMB = 1000): StatusCheck {
        return {
            name,
            check: async () => {
                const memUsage = process.memoryUsage();
                const usedMB = memUsage.heapUsed / 1024 / 1024;

                const status = usedMB > thresholdMB * 0.9 ? 'unhealthy' :
                    usedMB > thresholdMB * 0.7 ? 'degraded' : 'healthy';

                return {
                    status,
                    details: {
                        type: 'memory',
                        heapUsed: Math.round(usedMB),
                        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                        threshold: thresholdMB,
                        unit: 'MB'
                    }
                };
            }
        };
    },

    /**
     * Create custom check
     */
    createCustomCheck(
        name: string,
        checkFunction: () => Promise<{
            healthy: boolean;
            details?: Record<string, any>;
            responseTime?: number
        }>
    ): StatusCheck {
        return {
            name,
            check: async () => {
                try {
                    const result = await checkFunction();
                    return {
                        status: result.healthy ? 'healthy' : 'unhealthy',
                        details: result.details,
                        responseTime: result.responseTime
                    };
                } catch (error) {
                    return {
                        status: 'unhealthy',
                        details: {
                            error: error instanceof Error ? error.message : 'Unknown error'
                        }
                    };
                }
            }
        };
    },

    /**
     * Combine multiple checks with weighted scoring
     */
    combineChecks(
        name: string,
        checks: Array<{ check: StatusCheck; weight?: number }>
    ): StatusCheck {
        return {
            name,
            check: async () => {
                const results = await Promise.allSettled(
                    checks.map(async ({ check, weight = 1 }) => ({
                        result: await check.check(),
                        weight
                    }))
                );

                let totalWeight = 0;
                let healthyWeight = 0;
                let degradedWeight = 0;
                const details: Record<string, any> = {};

                results.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                        const { result: checkResult, weight } = result.value;
                        totalWeight += weight;

                        if (checkResult.status === 'healthy') {
                            healthyWeight += weight;
                        } else if (checkResult.status === 'degraded') {
                            degradedWeight += weight;
                        }

                        details[checks[index].check.name] = checkResult;
                    } else {
                        details[checks[index].check.name] = {
                            status: 'unhealthy',
                            error: result.reason
                        };
                        totalWeight += checks[index].weight || 1;
                    }
                });

                const healthyRatio = healthyWeight / totalWeight;
                const degradedRatio = degradedWeight / totalWeight;

                let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
                if (healthyRatio < 0.5) {
                    status = 'unhealthy';
                } else if (healthyRatio < 0.8 || degradedRatio > 0.2) {
                    status = 'degraded';
                }

                return {
                    status,
                    details: {
                        ...details,
                        summary: {
                            totalChecks: checks.length,
                            healthyRatio: Math.round(healthyRatio * 100) / 100,
                            degradedRatio: Math.round(degradedRatio * 100) / 100
                        }
                    }
                };
            }
        };
    }
};