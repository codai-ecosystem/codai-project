/**
 * Health Check Routes for MemorAI API
 * Provides system health and status endpoints
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler.js';
import { logger } from '@/utils/logger.js';
import { cbdService } from '@/services/cbdService.js';
import { config } from '@/config/environment.js';

const router = Router();

interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    environment: string;
    services: {
        [key: string]: {
            status: 'up' | 'down';
            responseTime?: number;
            error?: string;
        };
    };
    system: {
        memory: {
            used: number;
            total: number;
            usage: number;
        };
        cpu: {
            usage: number;
        };
    };
}

/**
 * Basic health check endpoint
 * GET /health
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        // Check CBD service health
        const cbdHealth = await checkCBDHealth();

        const healthData: HealthCheckResponse = {
            status: cbdHealth.status === 'up' ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            uptime: Math.floor(process.uptime()),
            environment: config.nodeEnv,
            services: {
                cbd: cbdHealth
            },
            system: getSystemMetrics()
        };

        const responseTime = Date.now() - startTime;

        logger.info('Health check completed', {
            status: healthData.status,
            responseTime,
            services: Object.keys(healthData.services).length
        });

        // Set appropriate status code based on health
        const statusCode = healthData.status === 'unhealthy' ? 503 : 200;

        res.status(statusCode).json({
            success: true,
            data: healthData,
            meta: {
                responseTime,
                requestId: req.headers['x-request-id']
            }
        });
    } catch (error) {
        logger.error('Health check failed:', error);

        res.status(503).json({
            success: false,
            error: 'Health check failed',
            data: {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0',
                uptime: Math.floor(process.uptime()),
                environment: config.nodeEnv,
                services: {},
                system: getSystemMetrics()
            }
        });
    }
}));

/**
 * Detailed health check endpoint
 * GET /health/detailed
 */
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        // Run all health checks in parallel
        const [cbdHealth, systemHealth] = await Promise.allSettled([
            checkCBDHealth(),
            checkSystemHealth()
        ]);

        const services: any = {};

        // Process CBD health check result
        if (cbdHealth.status === 'fulfilled') {
            services.cbd = cbdHealth.value;
        } else {
            services.cbd = {
                status: 'down',
                error: cbdHealth.reason?.message || 'Health check failed'
            };
        }

        // Process system health check result
        const systemMetrics = systemHealth.status === 'fulfilled'
            ? systemHealth.value
            : getSystemMetrics();

        // Determine overall status
        const serviceStatuses = Object.values(services).map((service: any) => service.status);
        const overallStatus = serviceStatuses.every(status => status === 'up')
            ? 'healthy'
            : serviceStatuses.some(status => status === 'up')
                ? 'degraded'
                : 'unhealthy';

        const healthData: HealthCheckResponse = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            uptime: Math.floor(process.uptime()),
            environment: config.nodeEnv,
            services,
            system: systemMetrics
        };

        const responseTime = Date.now() - startTime;

        logger.info('Detailed health check completed', {
            status: overallStatus,
            responseTime,
            servicesChecked: Object.keys(services).length
        });

        const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

        res.status(statusCode).json({
            success: true,
            data: healthData,
            meta: {
                responseTime,
                checksPerformed: Object.keys(services).length,
                requestId: req.headers['x-request-id']
            }
        });
    } catch (error) {
        logger.error('Detailed health check failed:', error);

        res.status(503).json({
            success: false,
            error: 'Detailed health check failed',
            timestamp: new Date().toISOString()
        });
    }
}));

/**
 * Readiness probe endpoint
 * GET /health/ready
 */
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
    try {
        // Check if all critical services are ready
        const cbdReady = cbdService.isConnected();

        const isReady = cbdReady;

        if (isReady) {
            res.status(200).json({
                success: true,
                ready: true,
                timestamp: new Date().toISOString(),
                services: {
                    cbd: cbdReady ? 'ready' : 'not ready'
                }
            });
        } else {
            res.status(503).json({
                success: false,
                ready: false,
                timestamp: new Date().toISOString(),
                services: {
                    cbd: cbdReady ? 'ready' : 'not ready'
                }
            });
        }
    } catch (error) {
        logger.error('Readiness check failed:', error);

        res.status(503).json({
            success: false,
            ready: false,
            error: 'Readiness check failed',
            timestamp: new Date().toISOString()
        });
    }
}));

/**
 * Liveness probe endpoint
 * GET /health/live
 */
router.get('/live', (req: Request, res: Response) => {
    // Simple liveness check - if this endpoint responds, the app is alive
    res.status(200).json({
        success: true,
        alive: true,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime())
    });
});

/**
 * Service version endpoint
 * GET /health/version
 */
router.get('/version', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        data: {
            name: 'MemorAI API',
            version: process.env.npm_package_version || '1.0.0',
            environment: config.nodeEnv,
            nodeVersion: process.version,
            buildTime: process.env.BUILD_TIME || 'unknown',
            commit: process.env.GIT_COMMIT || 'unknown'
        }
    });
});

/**
 * Check CBD service health
 */
const checkCBDHealth = async () => {
    const startTime = Date.now();

    try {
        if (!cbdService.isConnected()) {
            // Try to reconnect
            await cbdService.initialize();
        }

        // Simple health check - this should be fast
        const response = await fetch(`${config.cbdDatabaseUrl}/health`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
            return {
                status: 'up' as const,
                responseTime
            };
        } else {
            return {
                status: 'down' as const,
                responseTime,
                error: `HTTP ${response.status}: ${response.statusText}`
            };
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        return {
            status: 'down' as const,
            responseTime,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * Check system health metrics
 */
const checkSystemHealth = async () => {
    // This would typically check things like disk space, database connections, etc.
    return getSystemMetrics();
};

/**
 * Get system metrics
 */
const getSystemMetrics = () => {
    const memoryUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();

    return {
        memory: {
            used: memoryUsage.heapUsed,
            total: totalMemory,
            usage: Math.round((memoryUsage.heapUsed / totalMemory) * 100) / 100
        },
        cpu: {
            usage: Math.round(process.cpuUsage().user / 1000000) / 100 // Convert to percentage approximation
        }
    };
};

export default router;
