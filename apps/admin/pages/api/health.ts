/**
 * Admin Service Health Check Endpoint
 * Required by API Gateway for service monitoring
 */

interface HealthResponse {
    service: string;
    status: 'healthy' | 'unhealthy' | 'degraded';
    description: string;
    timestamp: string;
    uptime: number;
    version: string;
    dependencies: {
        [key: string]: 'healthy' | 'unhealthy' | 'unknown';
    };
    metadata: {
        nodeVersion: string;
        memoryUsage: any;
        platform: string;
    };
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            service: 'admin',
            status: 'unhealthy',
            description: 'Method not allowed',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '2.0.0',
            dependencies: {},
            metadata: {
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                platform: process.platform
            }
        });
    }

    try {
        // Check dependencies
        const dependencies: { [key: string]: 'healthy' | 'unhealthy' | 'unknown' } = {};

        // Check database connection (placeholder for future implementation)
        dependencies.database = 'unknown';
        
        // Check external services
        dependencies.auth = 'unknown';
        dependencies.storage = 'unknown';
        dependencies.gateway = 'unknown';

        // Check memory usage
        const memoryUsage = process.memoryUsage();
        const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        
        // Determine overall health status
        let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
        let description = 'Administration and user management platform is operational';

        // Check for degraded conditions
        if (memoryUsagePercent > 90) {
            status = 'degraded';
            description = 'High memory usage detected';
        }

        // Check for unhealthy conditions
        if (memoryUsagePercent > 95) {
            status = 'unhealthy';
            description = 'Critical memory usage - service may be unstable';
        }

        const healthResponse: HealthResponse = {
            service: 'admin',
            status,
            description,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '2.0.0',
            dependencies,
            metadata: {
                nodeVersion: process.version,
                memoryUsage,
                platform: process.platform
            }
        };

        // Set appropriate HTTP status code
        const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
        
        res.status(httpStatus).json(healthResponse);

    } catch (error) {
        console.error('Health check error:', error);
        
        const errorResponse: HealthResponse = {
            service: 'admin',
            status: 'unhealthy',
            description: 'Health check failed',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '2.0.0',
            dependencies: {},
            metadata: {
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                platform: process.platform
            }
        };

        res.status(503).json(errorResponse);
    }
}
