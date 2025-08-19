/**
 * Error Handler Middleware for MemorAI API
 * Centralized error handling with logging and user-friendly responses
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger.js';

export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
    isOperational?: boolean;
}

export class MemorAIError extends Error implements ApiError {
    public statusCode: number;
    public code: string;
    public details?: any;
    public isOperational: boolean = true;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        details?: any
    ) {
        super(message);
        this.name = 'MemorAIError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;

        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MemorAIError);
        }
    }
}

// Common error types
export class ValidationError extends MemorAIError {
    constructor(message: string, details?: any) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends MemorAIError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

export class UnauthorizedError extends MemorAIError {
    constructor(message: string = 'Unauthorized access') {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends MemorAIError {
    constructor(message: string = 'Forbidden access') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}

export class ConflictError extends MemorAIError {
    constructor(message: string, details?: any) {
        super(message, 409, 'CONFLICT', details);
        this.name = 'ConflictError';
    }
}

export class RateLimitError extends MemorAIError {
    constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
        super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfter });
        this.name = 'RateLimitError';
    }
}

export class ServiceUnavailableError extends MemorAIError {
    constructor(service: string = 'Service') {
        super(`${service} is currently unavailable`, 503, 'SERVICE_UNAVAILABLE');
        this.name = 'ServiceUnavailableError';
    }
}

/**
 * Format error response for API consumers
 */
const formatErrorResponse = (error: ApiError, req: Request) => {
    const isDevelopment = process.env.NODE_ENV === 'development';

    const response: any = {
        success: false,
        error: error.message,
        code: error.code || 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    };

    // Add details in development or for operational errors
    if ((isDevelopment || error.isOperational) && error.details) {
        response.details = error.details;
    }

    // Add stack trace in development
    if (isDevelopment && error.stack) {
        response.stack = error.stack;
    }

    // Add request ID if available
    if (req.headers['x-request-id']) {
        response.requestId = req.headers['x-request-id'];
    }

    return response;
};

/**
 * Main error handling middleware
 */
export const errorHandler = (
    error: Error | ApiError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // If response was already sent, delegate to default Express error handler
    if (res.headersSent) {
        next(error);
        return;
    }

    const apiError = error as ApiError;
    const statusCode = apiError.statusCode || 500;
    const isOperationalError = apiError.isOperational || false;

    // Log error with appropriate level
    const errorContext = {
        message: error.message,
        stack: error.stack,
        statusCode,
        code: apiError.code,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        requestId: req.headers['x-request-id']
    };

    if (statusCode >= 500) {
        logger.error('Internal server error:', errorContext);
    } else if (statusCode >= 400) {
        logger.warn('Client error:', errorContext);
    } else {
        logger.info('Request error:', errorContext);
    }

    // Send error response
    const response = formatErrorResponse(apiError, req);
    res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    const error = new NotFoundError(`Route ${req.method} ${req.path}`);

    logger.warn('Route not found:', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    const response = formatErrorResponse(error, req);
    res.status(404).json(response);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Validation error handler for request validation
 */
export const handleValidationErrors = (errors: any[]): ValidationError => {
    const formattedErrors = errors.map(error => ({
        field: error.path || error.param,
        message: error.msg || error.message,
        value: error.value
    }));

    return new ValidationError('Validation failed', {
        errors: formattedErrors,
        count: errors.length
    });
};

/**
 * Database error handler
 */
export const handleDatabaseError = (error: any): MemorAIError => {
    // Handle common database errors
    if (error.code === 'ECONNREFUSED') {
        return new ServiceUnavailableError('Database');
    }

    if (error.code === 'ETIMEDOUT') {
        return new MemorAIError('Database operation timed out', 503, 'DATABASE_TIMEOUT');
    }

    if (error.code === '23505') { // PostgreSQL unique violation
        return new ConflictError('Resource already exists');
    }

    if (error.code === '23503') { // PostgreSQL foreign key violation
        return new ValidationError('Referenced resource does not exist');
    }

    // Generic database error
    return new MemorAIError(
        'Database operation failed',
        500,
        'DATABASE_ERROR',
        { originalError: error.message }
    );
};

/**
 * JWT error handler
 */
export const handleJWTError = (error: any): UnauthorizedError => {
    if (error.name === 'TokenExpiredError') {
        return new UnauthorizedError('Token has expired');
    }

    if (error.name === 'JsonWebTokenError') {
        return new UnauthorizedError('Invalid token');
    }

    if (error.name === 'NotBeforeError') {
        return new UnauthorizedError('Token not active yet');
    }

    return new UnauthorizedError('Token verification failed');
};

/**
 * CBD service error handler
 */
export const handleCBDError = (error: any): MemorAIError => {
    if (error.code === 'ECONNREFUSED') {
        return new ServiceUnavailableError('CBD Database');
    }

    if (error.code === 'ETIMEDOUT') {
        return new MemorAIError('CBD operation timed out', 503, 'CBD_TIMEOUT');
    }

    if (error.status === 404) {
        return new NotFoundError('Memory');
    }

    if (error.status === 401) {
        return new UnauthorizedError('CBD authentication failed');
    }

    if (error.status === 403) {
        return new ForbiddenError('CBD access denied');
    }

    return new MemorAIError(
        'CBD operation failed',
        500,
        'CBD_ERROR',
        { originalError: error.message }
    );
};

/**
 * Create error response helper
 */
export const createErrorResponse = (
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
) => {
    return {
        success: false,
        error: message,
        code,
        details,
        timestamp: new Date().toISOString()
    };
};

export default {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    MemorAIError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    RateLimitError,
    ServiceUnavailableError,
    handleValidationErrors,
    handleDatabaseError,
    handleJWTError,
    handleCBDError,
    createErrorResponse
};
