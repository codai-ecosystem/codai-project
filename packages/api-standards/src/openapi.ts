/**
 * OpenAPI Specification Generator for CODAI Services
 * Automated OpenAPI 3.0 documentation generation
 */

import { OpenAPIV3 } from 'openapi-types';
import { CODAI_SERVICES, CodaiServiceName } from './standards';

export interface CodaiOpenApiOptions {
    serviceName: string;
    title: string;
    description: string;
    version: string;
    port: number;
    additionalPaths?: OpenAPIV3.PathsObject;
    additionalComponents?: OpenAPIV3.ComponentsObject;
}

/**
 * Create standardized OpenAPI specification for a CODAI service
 */
export const createCodaiOpenApiSpec = (options: CodaiOpenApiOptions): OpenAPIV3.Document => {
    const { serviceName, title, description, version, port, additionalPaths, additionalComponents } = options;

    const baseSpec: OpenAPIV3.Document = {
        openapi: '3.0.3',
        info: {
            title,
            description,
            version,
            contact: {
                name: 'CodAI Team',
                email: 'team@codai.ro',
                url: 'https://codai.ro',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
            termsOfService: 'https://codai.ro/terms',
        },
        servers: [
            {
                url: `http://localhost:${port}/api/v1`,
                description: 'Development server',
            },
            {
                url: `https://${serviceName}.codai.ro/api/v1`,
                description: 'Production server',
            },
        ],
        tags: [
            {
                name: 'Health',
                description: 'Service health and status endpoints',
            },
            {
                name: 'Authentication',
                description: 'Authentication and authorization endpoints',
            },
            {
                name: 'Core',
                description: `Core ${serviceName} functionality`,
            },
        ],
        paths: {
            // Standard health endpoints
            '/health': {
                get: {
                    tags: ['Health'],
                    summary: 'Health check',
                    description: 'Check service health and dependencies',
                    operationId: 'healthCheck',
                    responses: {
                        '200': {
                            description: 'Service is healthy',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/HealthResponse',
                                    },
                                },
                            },
                        },
                        '503': {
                            description: 'Service is unhealthy',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ErrorResponse',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/ready': {
                get: {
                    tags: ['Health'],
                    summary: 'Readiness check',
                    description: 'Check if service is ready to accept requests',
                    operationId: 'readyCheck',
                    responses: {
                        '200': {
                            description: 'Service is ready',
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/ReadyResponse',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            ...additionalPaths,
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token from CODAI ID service',
                },
                CookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'codai_session',
                    description: 'Session cookie from CODAI ID service',
                },
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                    description: 'API key for service-to-service communication',
                },
            },
            schemas: {
                // Standard response schemas
                CodaiResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            description: 'Indicates if the request was successful',
                        },
                        data: {
                            description: 'Response data (varies by endpoint)',
                        },
                        error: {
                            $ref: '#/components/schemas/CodaiError',
                        },
                        meta: {
                            $ref: '#/components/schemas/CodaiMeta',
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'ISO timestamp of the response',
                        },
                    },
                    required: ['success', 'timestamp'],
                },
                CodaiError: {
                    type: 'object',
                    properties: {
                        code: {
                            type: 'string',
                            description: 'Error code',
                            example: 'VALIDATION_ERROR',
                        },
                        message: {
                            type: 'string',
                            description: 'Human-readable error message',
                            example: 'The provided data is invalid',
                        },
                        details: {
                            description: 'Additional error details',
                        },
                        field: {
                            type: 'string',
                            description: 'Field that caused the error (for validation errors)',
                            example: 'email',
                        },
                        traceId: {
                            type: 'string',
                            description: 'Request trace ID for debugging',
                            example: 'req-123e4567-e89b-12d3-a456-426614174000',
                        },
                    },
                    required: ['code', 'message'],
                },
                CodaiMeta: {
                    type: 'object',
                    properties: {
                        version: {
                            type: 'string',
                            description: 'API version',
                            example: 'v1',
                        },
                        service: {
                            type: 'string',
                            description: 'Service name',
                            example: serviceName,
                        },
                        requestId: {
                            type: 'string',
                            description: 'Unique request identifier',
                            example: 'req-123e4567-e89b-12d3-a456-426614174000',
                        },
                        duration: {
                            type: 'number',
                            description: 'Request processing time in milliseconds',
                            example: 245,
                        },
                        pagination: {
                            $ref: '#/components/schemas/Pagination',
                        },
                    },
                    required: ['version', 'service', 'requestId'],
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'integer',
                            minimum: 1,
                            description: 'Current page number',
                            example: 1,
                        },
                        limit: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 100,
                            description: 'Number of items per page',
                            example: 20,
                        },
                        total: {
                            type: 'integer',
                            minimum: 0,
                            description: 'Total number of items',
                            example: 150,
                        },
                        pages: {
                            type: 'integer',
                            minimum: 0,
                            description: 'Total number of pages',
                            example: 8,
                        },
                        hasNext: {
                            type: 'boolean',
                            description: 'Whether there is a next page',
                            example: true,
                        },
                        hasPrev: {
                            type: 'boolean',
                            description: 'Whether there is a previous page',
                            example: false,
                        },
                    },
                    required: ['page', 'limit', 'total', 'pages', 'hasNext', 'hasPrev'],
                },
                HealthResponse: {
                    allOf: [
                        { $ref: '#/components/schemas/CodaiResponse' },
                        {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'object',
                                    properties: {
                                        service: {
                                            type: 'string',
                                            example: serviceName,
                                        },
                                        status: {
                                            type: 'string',
                                            enum: ['healthy', 'unhealthy'],
                                            example: 'healthy',
                                        },
                                        version: {
                                            type: 'string',
                                            example: '1.0.0',
                                        },
                                        uptime: {
                                            type: 'number',
                                            description: 'Service uptime in seconds',
                                            example: 3661.45,
                                        },
                                        memory: {
                                            type: 'object',
                                            properties: {
                                                rss: { type: 'number' },
                                                heapTotal: { type: 'number' },
                                                heapUsed: { type: 'number' },
                                                external: { type: 'number' },
                                            },
                                        },
                                    },
                                    required: ['service', 'status', 'version', 'uptime'],
                                },
                            },
                        },
                    ],
                },
                ReadyResponse: {
                    allOf: [
                        { $ref: '#/components/schemas/CodaiResponse' },
                        {
                            type: 'object',
                            properties: {
                                data: {
                                    type: 'object',
                                    properties: {
                                        status: {
                                            type: 'string',
                                            enum: ['ready'],
                                            example: 'ready',
                                        },
                                    },
                                    required: ['status'],
                                },
                            },
                        },
                    ],
                },
                ErrorResponse: {
                    allOf: [
                        { $ref: '#/components/schemas/CodaiResponse' },
                        {
                            type: 'object',
                            properties: {
                                success: {
                                    type: 'boolean',
                                    enum: [false],
                                },
                            },
                        },
                    ],
                },
                ...additionalComponents?.schemas,
            },
            responses: {
                BadRequest: {
                    description: 'Bad Request - Invalid request format',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse',
                            },
                        },
                    },
                },
                Unauthorized: {
                    description: 'Unauthorized - Authentication required',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse',
                            },
                        },
                    },
                },
                Forbidden: {
                    description: 'Forbidden - Access denied',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse',
                            },
                        },
                    },
                },
                NotFound: {
                    description: 'Not Found - Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse',
                            },
                        },
                    },
                },
                Conflict: {
                    description: 'Conflict - Resource already exists',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse',
                            },
                        },
                    },
                },
                ValidationError: {
                    description: 'Unprocessable Entity - Validation failed',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse',
                            },
                        },
                    },
                },
                TooManyRequests: {
                    description: 'Too Many Requests - Rate limit exceeded',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse',
                            },
                        },
                    },
                },
                InternalServerError: {
                    description: 'Internal Server Error - Server error',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse',
                            },
                        },
                    },
                },
                ...additionalComponents?.responses,
            },
            parameters: {
                Page: {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        default: 1,
                    },
                },
                Limit: {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of items per page',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        default: 20,
                    },
                },
                RequestId: {
                    name: 'X-Request-ID',
                    in: 'header',
                    description: 'Unique request identifier',
                    schema: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
                ...additionalComponents?.parameters,
            },
            ...additionalComponents,
        },
        security: [
            { BearerAuth: [] },
            { CookieAuth: [] },
        ],
    };

    return baseSpec;
};

/**
 * Get OpenAPI specification for a specific CODAI service
 */
export const getCodaiServiceOpenApiSpec = (serviceName: CodaiServiceName): OpenAPIV3.Document => {
    const service = CODAI_SERVICES[serviceName];

    return createCodaiOpenApiSpec({
        serviceName: service.name,
        title: `${service.name.toUpperCase()} API`,
        description: service.description,
        version: '1.0.0',
        port: service.port,
    });
};

/**
 * Generate OpenAPI spec with service-specific endpoints
 */
export const generateServiceOpenApiSpec = (
    serviceName: CodaiServiceName,
    additionalPaths: OpenAPIV3.PathsObject,
    additionalComponents?: OpenAPIV3.ComponentsObject
): OpenAPIV3.Document => {
    const service = CODAI_SERVICES[serviceName];

    return createCodaiOpenApiSpec({
        serviceName: service.name,
        title: `${service.name.toUpperCase()} API`,
        description: service.description,
        version: '1.0.0',
        port: service.port,
        additionalPaths,
        additionalComponents,
    });
};
