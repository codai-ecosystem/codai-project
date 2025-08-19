/**
 * Winston Logger Configuration for MemorAI API Service
 * Structured logging with different levels and formats
 */

import winston from 'winston';
import { config } from '@/config/environment.js';

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Create logger instance
export const logger = winston.createLogger({
    level: config.logLevel,
    format: logFormat,
    defaultMeta: {
        service: 'memorai-api',
        version: '1.0.0',
        environment: config.nodeEnv
    },
    transports: [
        // Console transport (always enabled)
        new winston.transports.Console({
            format: config.nodeEnv === 'development' ? consoleFormat : logFormat
        }),

        // File transports for production
        ...(config.nodeEnv === 'production' ? [
            new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            }),
            new winston.transports.File({
                filename: 'logs/combined.log',
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            })
        ] : [])
    ],
    exceptionHandlers: [
        new winston.transports.Console({
            format: consoleFormat
        }),
        ...(config.nodeEnv === 'production' ? [
            new winston.transports.File({
                filename: 'logs/exceptions.log'
            })
        ] : [])
    ],
    rejectionHandlers: [
        new winston.transports.Console({
            format: consoleFormat
        }),
        ...(config.nodeEnv === 'production' ? [
            new winston.transports.File({
                filename: 'logs/rejections.log'
            })
        ] : [])
    ]
});

// Request logging middleware helper
export const logRequest = (req: any, res: any, responseTime?: number) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection?.remoteAddress,
        userId: req.user?.id,
        responseTime: responseTime ? `${responseTime}ms` : undefined
    };

    if (res.statusCode >= 400) {
        logger.warn('HTTP Request', logData);
    } else {
        logger.info('HTTP Request', logData);
    }
};

// Database operation logging
export const logDbOperation = (operation: string, collection: string, duration?: number, error?: any) => {
    const logData = {
        operation,
        collection,
        duration: duration ? `${duration}ms` : undefined,
        error: error?.message
    };

    if (error) {
        logger.error('Database Operation Failed', logData);
    } else {
        logger.debug('Database Operation', logData);
    }
};

// Authentication logging
export const logAuth = (event: string, userId?: string, error?: any) => {
    const logData = {
        event,
        userId,
        error: error?.message
    };

    if (error) {
        logger.warn('Authentication Event', logData);
    } else {
        logger.info('Authentication Event', logData);
    }
};

// Performance monitoring
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
    const logData = {
        operation,
        duration: `${duration}ms`,
        ...metadata
    };

    if (duration > 1000) {
        logger.warn('Slow Operation', logData);
    } else {
        logger.debug('Performance', logData);
    }
};

export default logger;
