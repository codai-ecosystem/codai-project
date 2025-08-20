/**
 * Custom error classes for CODAI SDK
 */

export class CodeaiError extends Error {
    public readonly status: number;
    public readonly code: string;
    public readonly timestamp: string;
    public readonly details?: any;

    constructor(
        message: string,
        status: number = 500,
        code: string = 'CODAI_ERROR',
        details?: any
    ) {
        super(message);
        this.name = 'CodeaiError';
        this.status = status;
        this.code = code;
        this.timestamp = new Date().toISOString();
        this.details = details;

        // Maintain proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CodeaiError);
        }
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            code: this.code,
            timestamp: this.timestamp,
            details: this.details
        };
    }
}

export class AuthenticationError extends CodeaiError {
    constructor(message: string = 'Authentication failed', details?: any) {
        super(message, 401, 'AUTH_ERROR', details);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends CodeaiError {
    constructor(message: string = 'Authorization failed', details?: any) {
        super(message, 403, 'AUTHZ_ERROR', details);
        this.name = 'AuthorizationError';
    }
}

export class ValidationError extends CodeaiError {
    constructor(message: string = 'Validation failed', details?: any) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends CodeaiError {
    constructor(message: string = 'Resource not found', details?: any) {
        super(message, 404, 'NOT_FOUND', details);
        this.name = 'NotFoundError';
    }
}

export class NetworkError extends CodeaiError {
    constructor(message: string = 'Network error', details?: any) {
        super(message, 0, 'NETWORK_ERROR', details);
        this.name = 'NetworkError';
    }
}

export class TimeoutError extends CodeaiError {
    constructor(message: string = 'Request timeout', details?: any) {
        super(message, 408, 'TIMEOUT_ERROR', details);
        this.name = 'TimeoutError';
    }
}

export class RateLimitError extends CodeaiError {
    constructor(message: string = 'Rate limit exceeded', details?: any) {
        super(message, 429, 'RATE_LIMIT_ERROR', details);
        this.name = 'RateLimitError';
    }
}

export class ServiceUnavailableError extends CodeaiError {
    constructor(message: string = 'Service unavailable', details?: any) {
        super(message, 503, 'SERVICE_UNAVAILABLE', details);
        this.name = 'ServiceUnavailableError';
    }
}

/**
 * Create appropriate error instance based on HTTP status code
 */
export function createErrorFromResponse(
    status: number,
    message: string,
    details?: any
): CodeaiError {
    switch (status) {
        case 400:
            return new ValidationError(message, details);
        case 401:
            return new AuthenticationError(message, details);
        case 403:
            return new AuthorizationError(message, details);
        case 404:
            return new NotFoundError(message, details);
        case 408:
            return new TimeoutError(message, details);
        case 429:
            return new RateLimitError(message, details);
        case 503:
            return new ServiceUnavailableError(message, details);
        default:
            return new CodeaiError(message, status, 'HTTP_ERROR', details);
    }
}
