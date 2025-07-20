/**
 * Universal API Middleware for CODAI Ecosystem
 * Standardized middleware for all services
 */

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
// Generate UUID manually since uuid is not installed
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
import { CodaiApiConfig } from './standards';
import { CodaiResponseBuilder, sendCodaiResponse } from './response';

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            requestId: string;
            startTime: number;
            responseBuilder: CodaiResponseBuilder;
            user?: {
                id: string;
                email: string;
                roles: string[];
            };
        }
    }
}

/**
 * Request ID middleware - Adds unique request ID to every request
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.header('X-Request-ID') || generateUUID();
    req.requestId = requestId;
    req.startTime = Date.now();

    res.setHeader('X-Request-ID', requestId);
    next();
};

/**
 * Service identification middleware
 */
export const serviceMiddleware = (serviceName: string, version: string = 'v1') => {
    return (req: Request, res: Response, next: NextFunction) => {
        req.responseBuilder = new CodaiResponseBuilder(serviceName, req.requestId, version);

        res.setHeader('X-Service-Name', serviceName);
        res.setHeader('X-API-Version', version);

        next();
    };
};

/**
 * Security middleware setup
 */
export const securityMiddleware = (config: CodaiApiConfig) => {
    return [
        // Helmet for security headers
        helmet({
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "https://api.codai.ro"],
                },
            },
        }),

        // CORS configuration
        cors({
            origin: config.corsOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Request-ID',
                'X-API-Key',
                'X-Client-Version',
            ],
            exposedHeaders: [
                'X-Request-ID',
                'X-Service-Name',
                'X-API-Version',
                'X-Rate-Limit-Remaining',
                'X-Rate-Limit-Reset',
            ],
        }),

        // Compression
        compression(),
    ];
};

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware = (config: CodaiApiConfig) => {
    return rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
        message: {
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests from this IP',
            },
            timestamp: new Date().toISOString(),
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req: Request) => {
            // Use user ID if authenticated, otherwise IP
            return req.user?.id || req.ip || 'anonymous';
        },
        skip: (req: Request) => {
            // Skip rate limiting for health checks
            return req.path === '/health' || req.path === '/ready';
        },
    });
};

/**
 * Logging middleware
 */
export const loggingMiddleware = (serviceName: string) => {
    // Custom morgan format for structured logging
    const format = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :req[X-Request-ID]';

    return morgan(format, {
        stream: {
            write: (message: string) => {
                // Parse morgan log and create structured log
                const parts = message.trim().split(' ');
                const logData = {
                    service: serviceName,
                    ip: parts[0],
                    timestamp: new Date().toISOString(),
                    method: parts[5]?.replace('"', ''),
                    url: parts[6],
                    status: parseInt(parts[8]),
                    responseTime: parts[parts.length - 2],
                    requestId: parts[parts.length - 1],
                };

                console.log(JSON.stringify(logData));
            },
        },
        skip: (req: Request) => {
            // Skip logging for health checks in production
            const isProd = process.env.NODE_ENV === 'production';
            return isProd && (req.path === '/health' || req.path === '/ready');
        },
    });
};

/**
 * Error handling middleware
 */
export const errorHandlingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body?: any) {
        // If it's already a CODAI response, use it as is
        if (body && typeof body === 'object' && 'success' in body) {
            return originalSend.call(this, body);
        }

        // Otherwise wrap in standard response
        const response = req.responseBuilder?.success(body) || {
            success: true,
            data: body,
            timestamp: new Date().toISOString(),
        };

        return originalSend.call(this, response);
    };

    next();
};

/**
 * Global error handler
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global error:', {
        error: err.message,
        stack: err.stack,
        requestId: req.requestId,
        service: req.responseBuilder?.serviceName || 'unknown',
        path: req.path,
        method: req.method,
    });

    // If response already sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    const responseBuilder = req.responseBuilder || new CodaiResponseBuilder('unknown', req.requestId || 'unknown');

    let response;

    // Handle different error types
    if (err.name === 'ValidationError') {
        response = responseBuilder.validationError(err.field || 'unknown', err.message, err.details);
    } else if (err.name === 'UnauthorizedError' || err.status === 401) {
        response = responseBuilder.authError(err.message);
    } else if (err.status === 403) {
        response = responseBuilder.forbiddenError(err.message);
    } else if (err.status === 404) {
        response = responseBuilder.notFoundError(err.message);
    } else if (err.status === 409) {
        response = responseBuilder.conflictError(err.message);
    } else if (err.status === 429) {
        response = responseBuilder.rateLimitError(err.message);
    } else {
        // Default to server error
        const isDev = process.env.NODE_ENV === 'development';
        response = responseBuilder.serverError(
            err.message || 'Internal server error',
            isDev ? { stack: err.stack } : undefined
        );
    }

    sendCodaiResponse(res, response);
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
    const responseBuilder = req.responseBuilder || new CodaiResponseBuilder('unknown', req.requestId || 'unknown');
    const response = responseBuilder.notFoundError(`Route ${req.method} ${req.path} not found`);
    sendCodaiResponse(res, response, 404);
};

/**
 * Health check middleware
 */
export const healthCheckMiddleware = (serviceName: string, additionalChecks?: () => Promise<any>) => {
    return async (req: Request, res: Response) => {
        try {
            const health: any = {
                service: serviceName,
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
            };

            // Run additional health checks if provided
            if (additionalChecks) {
                health.checks = await additionalChecks();
            }

            const response = req.responseBuilder.success(health);
            sendCodaiResponse(res, response);
        } catch (error: any) {
            const response = req.responseBuilder.serverError('Health check failed', { error: error.message });
            sendCodaiResponse(res, response, 503);
        }
    };
};

/**
 * Ready check middleware (simpler than health check)
 */
export const readyCheckMiddleware = (req: Request, res: Response) => {
    const response = req.responseBuilder.success({
        status: 'ready',
        timestamp: new Date().toISOString(),
    });
    sendCodaiResponse(res, response);
};

/**
 * Complete middleware setup for a CODAI service
 */
export const setupCodaiMiddleware = (app: express.Application, config: CodaiApiConfig) => {
    // Basic middleware
    app.use(requestIdMiddleware);
    app.use(serviceMiddleware(config.serviceName, config.apiVersion));
    app.use(loggingMiddleware(config.serviceName));

    // Security middleware
    app.use(securityMiddleware(config));

    // Rate limiting
    app.use(rateLimitMiddleware(config));

    // Error handling setup
    app.use(errorHandlingMiddleware);

    // Health endpoints
    app.get('/health', healthCheckMiddleware(config.serviceName));
    app.get('/ready', readyCheckMiddleware);

    return app;
};
