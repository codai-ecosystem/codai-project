/**
 * Error Handling Utilities for CODAI APIs
 * Standardized error handling and logging
 */

import { Request, Response, NextFunction } from 'express';
import { CodaiApiResponse } from './standards';
import { sendCodaiResponse } from './response';

export class CodaiError extends Error {
    public code: string;
    public statusCode: number;
    public details?: any;
    public field?: string;

    constructor(
        code: string,
        message: string,
        statusCode: number = 500,
        details?: any,
        field?: string
    ) {
        super(message);
        this.name = 'CodaiError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.field = field;
    }
}

export class ValidationError extends CodaiError {
    constructor(field: string, message: string, details?: any) {
        super('VALIDATION_ERROR', message, 422, details, field);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends CodaiError {
    constructor(message: string = 'Authentication required') {
        super('AUTH_ERROR', message, 401);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends CodaiError {
    constructor(message: string = 'Access forbidden') {
        super('FORBIDDEN', message, 403);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends CodaiError {
    constructor(message: string = 'Resource not found') {
        super('NOT_FOUND', message, 404);
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends CodaiError {
    constructor(message: string = 'Resource already exists') {
        super('CONFLICT', message, 409);
        this.name = 'ConflictError';
    }
}

export class RateLimitError extends CodaiError {
    constructor(message: string = 'Too many requests') {
        super('RATE_LIMIT_EXCEEDED', message, 429);
        this.name = 'RateLimitError';
    }
}

/**
 * Async error wrapper for Express route handlers
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Error logging utility
 */
export const logError = (error: Error, context?: any) => {
    const logData = {
        timestamp: new Date().toISOString(),
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
        context,
    };

    console.error('CODAI API Error:', JSON.stringify(logData, null, 2));

    // In production, you might want to send to external logging service
    if (process.env.NODE_ENV === 'production') {
        // Send to logging service (Datadog, LogRocket, etc.)
    }
};

/**
 * Convert unknown error to CodaiError
 */
export const normalizeError = (error: unknown): CodaiError => {
    if (error instanceof CodaiError) {
        return error;
    }

    if (error instanceof Error) {
        return new CodaiError('INTERNAL_ERROR', error.message, 500);
    }

    return new CodaiError(
        'UNKNOWN_ERROR',
        'An unknown error occurred',
        500,
        { originalError: error }
    );
};
