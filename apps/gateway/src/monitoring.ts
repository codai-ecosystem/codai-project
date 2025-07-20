/**
 * Advanced monitoring and logging for CODAI API Gateway
 */

import winston from 'winston';
import prometheus from 'prom-client';
import express from 'express';

// Prometheus metrics registry
const register = new prometheus.Registry();

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code', 'service'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestsTotal = new prometheus.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'service']
});

const serviceHealthGauge = new prometheus.Gauge({
    name: 'service_health_status',
    help: 'Health status of services (1 = healthy, 0 = unhealthy)',
    labelNames: ['service_id', 'service_name', 'category']
});

const gatewayUptime = new prometheus.Gauge({
    name: 'gateway_uptime_seconds',
    help: 'Gateway uptime in seconds'
});

const activeConnections = new prometheus.Gauge({
    name: 'active_connections_total',
    help: 'Total number of active connections'
});

const rateLimitHits = new prometheus.Counter({
    name: 'rate_limit_hits_total',
    help: 'Total number of rate limit hits',
    labelNames: ['endpoint', 'ip']
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(serviceHealthGauge);
register.registerMetric(gatewayUptime);
register.registerMetric(activeConnections);
register.registerMetric(rateLimitHits);

// Add default Node.js metrics
prometheus.collectDefaultMetrics({ register });

// Winston logger configuration
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'codai-gateway' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Request logging middleware
export const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add request ID to request object
    (req as any).requestId = requestId;

    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);

    // Log incoming request
    logger.info('Incoming request', {
        requestId,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // Override res.json to capture response details
    const originalJson = res.json;
    const originalSend = res.send;

    const logResponse = () => {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Log response
        logger.info('Request completed', {
            requestId,
            method: req.method,
            url: req.url,
            statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        });

        // Update Prometheus metrics
        const serviceMatch = req.path.match(/^\/api\/v1\/([^\/]+)/);
        const service = serviceMatch ? serviceMatch[1] : 'gateway';

        httpRequestDuration
            .labels(req.method, req.path, statusCode.toString(), service)
            .observe(duration / 1000);

        httpRequestsTotal
            .labels(req.method, req.path, statusCode.toString(), service)
            .inc();
    };

    res.json = function (obj: any) {
        logResponse();
        return originalJson.call(res, obj);
    };

    res.send = function (body: any) {
        logResponse();
        return originalSend.call(res, body);
    };

    next();
};

// Error logging middleware
export const errorLogger = (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const requestId = (req as any).requestId;

    logger.error('Request error', {
        requestId,
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });

    next(error);
};

// Service health monitoring
export const updateServiceHealth = (serviceId: string, serviceName: string, category: string, isHealthy: boolean) => {
    serviceHealthGauge
        .labels(serviceId, serviceName, category)
        .set(isHealthy ? 1 : 0);

    logger.debug('Service health updated', {
        serviceId,
        serviceName,
        category,
        isHealthy,
        timestamp: new Date().toISOString()
    });
};

// Rate limit logging
export const logRateLimitHit = (endpoint: string, ip: string) => {
    rateLimitHits.labels(endpoint, ip).inc();

    logger.warn('Rate limit exceeded', {
        endpoint,
        ip,
        timestamp: new Date().toISOString()
    });
};

// Metrics endpoint
export const createMetricsEndpoint = () => {
    const app = express();

    app.get('/metrics', async (req, res) => {
        try {
            // Update uptime metric
            gatewayUptime.set(process.uptime());

            const metrics = await register.metrics();
            res.set('Content-Type', register.contentType);
            res.end(metrics);
        } catch (error) {
            logger.error('Error generating metrics', { error: (error as Error).message });
            res.status(500).end('Error generating metrics');
        }
    });

    app.get('/health', (req, res) => {
        const healthStatus = {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
        };

        res.json(healthStatus);
    });

    return app;
};

// Performance monitoring
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private requestCounts: Map<string, number> = new Map();
    private responseTimes: Map<string, number[]> = new Map();

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    recordRequest(service: string, responseTime: number) {
        // Update request count
        const currentCount = this.requestCounts.get(service) || 0;
        this.requestCounts.set(service, currentCount + 1);

        // Update response times (keep last 100 for moving average)
        const times = this.responseTimes.get(service) || [];
        times.push(responseTime);
        if (times.length > 100) {
            times.shift();
        }
        this.responseTimes.set(service, times);
    }

    getServiceStats(service: string) {
        const count = this.requestCounts.get(service) || 0;
        const times = this.responseTimes.get(service) || [];

        if (times.length === 0) {
            return { count, avgResponseTime: 0, minResponseTime: 0, maxResponseTime: 0 };
        }

        const avgResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
        const minResponseTime = Math.min(...times);
        const maxResponseTime = Math.max(...times);

        return {
            count,
            avgResponseTime: Math.round(avgResponseTime),
            minResponseTime,
            maxResponseTime
        };
    }

    getAllStats() {
        const stats: Record<string, any> = {};

        for (const service of this.requestCounts.keys()) {
            stats[service] = this.getServiceStats(service);
        }

        return {
            services: stats,
            totalRequests: Array.from(this.requestCounts.values()).reduce((a, b) => a + b, 0),
            timestamp: new Date().toISOString()
        };
    }
}

// Alerting system
export class AlertManager {
    private static instance: AlertManager;
    private alerts: Array<{
        id: string;
        type: 'error' | 'warning' | 'info';
        message: string;
        service?: string;
        timestamp: Date;
        resolved: boolean;
    }> = [];

    static getInstance(): AlertManager {
        if (!AlertManager.instance) {
            AlertManager.instance = new AlertManager();
        }
        return AlertManager.instance;
    }

    createAlert(type: 'error' | 'warning' | 'info', message: string, service?: string) {
        const alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            message,
            service,
            timestamp: new Date(),
            resolved: false
        };

        this.alerts.push(alert);

        logger.log(type, `Alert created: ${message}`, {
            alertId: alert.id,
            service,
            timestamp: alert.timestamp.toISOString()
        });

        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }

        return alert.id;
    }

    resolveAlert(alertId: string) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            logger.info(`Alert resolved: ${alert.message}`, {
                alertId,
                service: alert.service,
                timestamp: new Date().toISOString()
            });
        }
    }

    getActiveAlerts() {
        return this.alerts.filter(a => !a.resolved).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    getAllAlerts() {
        return this.alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
}

// Health check utilities
export const createHealthCheck = (serviceId: string, serviceUrl: string, healthPath: string = '/health') => {
    return async (): Promise<boolean> => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${serviceUrl}${healthPath}`, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const isHealthy = response.ok;

            if (!isHealthy) {
                AlertManager.getInstance().createAlert(
                    'warning',
                    `Service ${serviceId} health check failed with status ${response.status}`,
                    serviceId
                );
            }

            return isHealthy;
        } catch (error) {
            AlertManager.getInstance().createAlert(
                'error',
                `Service ${serviceId} health check failed: ${(error as Error).message}`,
                serviceId
            );
            return false;
        }
    };
};

export { logger, register, prometheus };
