/**
 * Universal API Response Handler
 * Consistent response formatting across all CODAI services
 */

import { CodaiApiResponse, CodaiApiError, CodaiApiMeta, CodaiPagination } from './standards';

export class CodaiResponseBuilder {
    public requestId: string;
    public serviceName: string;
    public version: string;
    private startTime: number;

    constructor(serviceName: string, requestId: string, version: string = 'v1') {
        this.serviceName = serviceName;
        this.requestId = requestId;
        this.version = version;
        this.startTime = Date.now();
    }

    /**
     * Create a successful response
     */
    success<T>(data?: T, pagination?: CodaiPagination): CodaiApiResponse<T> {
        const duration = Date.now() - this.startTime;

        return {
            success: true,
            data,
            meta: {
                version: this.version,
                service: this.serviceName,
                requestId: this.requestId,
                duration,
                pagination,
            },
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Create an error response
     */
    error(
        code: string,
        message: string,
        details?: any,
        field?: string,
        statusCode: number = 500
    ): CodaiApiResponse {
        const duration = Date.now() - this.startTime;

        const error: CodaiApiError = {
            code,
            message,
            details,
            field,
            traceId: this.requestId,
        };

        return {
            success: false,
            error,
            meta: {
                version: this.version,
                service: this.serviceName,
                requestId: this.requestId,
                duration,
            },
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Create a validation error response
     */
    validationError(field: string, message: string, details?: any): CodaiApiResponse {
        return this.error('VALIDATION_ERROR', message, details, field, 422);
    }

    /**
     * Create an authentication error response
     */
    authError(message: string = 'Authentication required'): CodaiApiResponse {
        return this.error('AUTH_ERROR', message, undefined, undefined, 401);
    }

    /**
     * Create a forbidden error response
     */
    forbiddenError(message: string = 'Access forbidden'): CodaiApiResponse {
        return this.error('FORBIDDEN', message, undefined, undefined, 403);
    }

    /**
     * Create a not found error response
     */
    notFoundError(message: string = 'Resource not found'): CodaiApiResponse {
        return this.error('NOT_FOUND', message, undefined, undefined, 404);
    }

    /**
     * Create a conflict error response
     */
    conflictError(message: string = 'Resource already exists'): CodaiApiResponse {
        return this.error('CONFLICT', message, undefined, undefined, 409);
    }

    /**
     * Create a rate limit error response
     */
    rateLimitError(message: string = 'Too many requests'): CodaiApiResponse {
        return this.error('RATE_LIMIT_EXCEEDED', message, undefined, undefined, 429);
    }

    /**
     * Create an internal server error response
     */
    serverError(message: string = 'Internal server error', details?: any): CodaiApiResponse {
        return this.error('INTERNAL_ERROR', message, details, undefined, 500);
    }
}

// Express.js Response Helper
export const sendCodaiResponse = (res: any, response: CodaiApiResponse, statusCode?: number) => {
    // Determine status code from error code or use provided
    let status = statusCode || 200;

    if (!response.success && response.error) {
        switch (response.error.code) {
            case 'VALIDATION_ERROR':
                status = 422;
                break;
            case 'AUTH_ERROR':
                status = 401;
                break;
            case 'FORBIDDEN':
                status = 403;
                break;
            case 'NOT_FOUND':
                status = 404;
                break;
            case 'CONFLICT':
                status = 409;
                break;
            case 'RATE_LIMIT_EXCEEDED':
                status = 429;
                break;
            default:
                status = 500;
        }
    }

    return res.status(status).json(response);
};

// Next.js Response Helper
export const createNextResponse = (response: CodaiApiResponse, statusCode?: number) => {
    // Determine status code from error code or use provided
    let status = statusCode || 200;

    if (!response.success && response.error) {
        switch (response.error.code) {
            case 'VALIDATION_ERROR':
                status = 422;
                break;
            case 'AUTH_ERROR':
                status = 401;
                break;
            case 'FORBIDDEN':
                status = 403;
                break;
            case 'NOT_FOUND':
                status = 404;
                break;
            case 'CONFLICT':
                status = 409;
                break;
            case 'RATE_LIMIT_EXCEEDED':
                status = 429;
                break;
            default:
                status = 500;
        }
    }

    // For Next.js 13+ App Router
    if (typeof Response !== 'undefined') {
        return new Response(JSON.stringify(response), {
            status,
            headers: {
                'Content-Type': 'application/json',
                'X-Service-Name': response.meta?.service || 'unknown',
                'X-Request-ID': response.meta?.requestId || 'unknown',
                'X-API-Version': response.meta?.version || 'v1',
            },
        });
    }

    // Fallback for older environments
    return { response, status };
};

// Pagination Helper
export const createPagination = (
    page: number,
    limit: number,
    total: number
): CodaiPagination => {
    const pages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
    };
};

// Standard Error Codes
export const ERROR_CODES = {
    // Authentication & Authorization
    AUTH_ERROR: 'Authentication required',
    INVALID_TOKEN: 'Invalid or expired token',
    FORBIDDEN: 'Access forbidden',

    // Validation
    VALIDATION_ERROR: 'Validation failed',
    INVALID_INPUT: 'Invalid input provided',
    REQUIRED_FIELD: 'Required field missing',

    // Resources
    NOT_FOUND: 'Resource not found',
    CONFLICT: 'Resource already exists',
    GONE: 'Resource no longer available',

    // Rate Limiting
    RATE_LIMIT_EXCEEDED: 'Too many requests',

    // Server Errors
    INTERNAL_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    TIMEOUT: 'Request timeout',

    // External Services
    EXTERNAL_SERVICE_ERROR: 'External service error',
    DATABASE_ERROR: 'Database operation failed',
    NETWORK_ERROR: 'Network connection failed',
} as const;
