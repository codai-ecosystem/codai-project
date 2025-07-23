/**
 * HUB Service API Implementation  
 * Standardized service discovery and orchestration API using CODAI standards
 */

import express, { Express } from 'express';
import {
    setupCodaiMiddleware,
    createStandardApiConfig,
    jwtAuthMiddleware,
    validate,
    CodaiValidationSchemas,
    generateServiceOpenApiSpec,
    globalErrorHandler,
    notFoundHandler
} from '@codai/api-standards';
import { OpenAPIV3 } from 'openapi-types';
import swaggerUi from 'swagger-ui-express';
import { z } from 'zod';

const app: Express = express();
const config = createStandardApiConfig('hub', 4003);

// Setup universal CODAI middleware
setupCodaiMiddleware(app, config);

// HUB specific validation schemas
const HubSchemas = {
    registerService: z.object({
        name: z.string().min(1),
        version: z.string().min(1),
        type: z.enum(['API', 'WEB', 'MOBILE', 'CLI', 'WORKER']),
        endpoint: z.string().url(),
        status: z.enum(['HEALTHY', 'DEGRADED', 'UNHEALTHY']).default('HEALTHY'),
        capabilities: z.array(z.string()).optional(),
        dependencies: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional(),
        healthCheckEndpoint: z.string().optional(),
        documentation: z.string().url().optional()
    }),

    updateService: z.object({
        version: z.string().min(1).optional(),
        endpoint: z.string().url().optional(),
        status: z.enum(['HEALTHY', 'DEGRADED', 'UNHEALTHY']).optional(),
        capabilities: z.array(z.string()).optional(),
        dependencies: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional(),
        healthCheckEndpoint: z.string().optional(),
        documentation: z.string().url().optional()
    }),

    findServices: z.object({
        type: z.enum(['API', 'WEB', 'MOBILE', 'CLI', 'WORKER']).optional(),
        status: z.enum(['HEALTHY', 'DEGRADED', 'UNHEALTHY']).optional(),
        capability: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50)
    }),

    createRoute: z.object({
        path: z.string().min(1),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
        targetService: z.string().min(1),
        targetPath: z.string().min(1).optional(),
        description: z.string().optional(),
        authentication: z.boolean().default(true),
        rateLimit: z.number().int().min(1).optional(),
        timeout: z.number().int().min(1000).default(30000)
    }),

    updateRoute: z.object({
        targetService: z.string().min(1).optional(),
        targetPath: z.string().min(1).optional(),
        description: z.string().optional(),
        authentication: z.boolean().optional(),
        rateLimit: z.number().int().min(1).optional(),
        timeout: z.number().int().min(1000).optional(),
        isActive: z.boolean().optional()
    })
};

// HUB Service specific paths for OpenAPI
const hubServicePaths: OpenAPIV3.PathsObject = {
    '/services': {
        get: {
            tags: ['Services'],
            summary: 'List registered services',
            description: 'Retrieve all registered services with optional filtering',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'type',
                    in: 'query',
                    description: 'Filter by service type',
                    schema: {
                        type: 'string',
                        enum: ['API', 'WEB', 'MOBILE', 'CLI', 'WORKER']
                    }
                },
                {
                    name: 'status',
                    in: 'query',
                    description: 'Filter by service status',
                    schema: {
                        type: 'string',
                        enum: ['HEALTHY', 'DEGRADED', 'UNHEALTHY']
                    }
                },
                {
                    name: 'capability',
                    in: 'query',
                    description: 'Filter by service capability',
                    schema: { type: 'string' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of services to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 }
                }
            ],
            responses: {
                '200': {
                    description: 'List of services',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    services: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Service' }
                                                    },
                                                    total: { type: 'integer' }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' }
            }
        },
        post: {
            tags: ['Services'],
            summary: 'Register new service',
            description: 'Register a new service with the hub',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/RegisterServiceRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Service registered successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Service' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '400': { $ref: '#/components/responses/BadRequest' },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    },
    '/services/{name}': {
        get: {
            tags: ['Services'],
            summary: 'Get service details',
            description: 'Get detailed information about a specific service',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'name',
                    in: 'path',
                    required: true,
                    description: 'Service name',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'Service details',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Service' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '404': { $ref: '#/components/responses/NotFound' }
            }
        },
        put: {
            tags: ['Services'],
            summary: 'Update service',
            description: 'Update an existing service registration',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'name',
                    in: 'path',
                    required: true,
                    description: 'Service name',
                    schema: { type: 'string' }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateServiceRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Service updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Service' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '404': { $ref: '#/components/responses/NotFound' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        },
        delete: {
            tags: ['Services'],
            summary: 'Unregister service',
            description: 'Remove a service from the registry',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'name',
                    in: 'path',
                    required: true,
                    description: 'Service name',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'Service unregistered successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CodaiResponse' }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '404': { $ref: '#/components/responses/NotFound' }
            }
        }
    },
    '/services/{name}/health': {
        get: {
            tags: ['Services'],
            summary: 'Check service health',
            description: 'Perform health check on a registered service',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'name',
                    in: 'path',
                    required: true,
                    description: 'Service name',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'Service health status',
                    content: {
                        'application/json': {
                            schema: {
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
                                                        enum: ['HEALTHY', 'DEGRADED', 'UNHEALTHY']
                                                    },
                                                    responseTime: { type: 'number' },
                                                    lastChecked: { type: 'string', format: 'date-time' },
                                                    details: { type: 'object' }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '404': { $ref: '#/components/responses/NotFound' }
            }
        }
    },
    '/routes': {
        get: {
            tags: ['Routes'],
            summary: 'List API routes',
            description: 'Get all registered API routes',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'List of routes',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    routes: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Route' }
                                                    },
                                                    total: { type: 'integer' }
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '401': { $ref: '#/components/responses/Unauthorized' }
            }
        },
        post: {
            tags: ['Routes'],
            summary: 'Create new route',
            description: 'Register a new API route',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateRouteRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Route created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Route' }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                },
                '400': { $ref: '#/components/responses/BadRequest' },
                '401': { $ref: '#/components/responses/Unauthorized' },
                '422': { $ref: '#/components/responses/ValidationError' }
            }
        }
    }
};

// HUB Service specific schemas
const hubServiceSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    Service: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'Service name'
            },
            version: {
                type: 'string',
                description: 'Service version'
            },
            type: {
                type: 'string',
                enum: ['API', 'WEB', 'MOBILE', 'CLI', 'WORKER'],
                description: 'Service type'
            },
            endpoint: {
                type: 'string',
                format: 'uri',
                description: 'Service endpoint URL'
            },
            status: {
                type: 'string',
                enum: ['HEALTHY', 'DEGRADED', 'UNHEALTHY'],
                description: 'Service health status'
            },
            capabilities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Service capabilities'
            },
            dependencies: {
                type: 'array',
                items: { type: 'string' },
                description: 'Service dependencies'
            },
            metadata: {
                type: 'object',
                description: 'Additional service metadata'
            },
            healthCheckEndpoint: {
                type: 'string',
                description: 'Health check endpoint path'
            },
            documentation: {
                type: 'string',
                format: 'uri',
                description: 'Service documentation URL'
            },
            registeredAt: {
                type: 'string',
                format: 'date-time',
                description: 'Registration timestamp'
            },
            lastHealthCheck: {
                type: 'string',
                format: 'date-time',
                description: 'Last health check timestamp'
            }
        },
        required: ['name', 'version', 'type', 'endpoint', 'status']
    },
    RegisterServiceRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                description: 'Service name'
            },
            version: {
                type: 'string',
                minLength: 1,
                description: 'Service version'
            },
            type: {
                type: 'string',
                enum: ['API', 'WEB', 'MOBILE', 'CLI', 'WORKER'],
                description: 'Service type'
            },
            endpoint: {
                type: 'string',
                format: 'uri',
                description: 'Service endpoint URL'
            },
            status: {
                type: 'string',
                enum: ['HEALTHY', 'DEGRADED', 'UNHEALTHY'],
                default: 'HEALTHY',
                description: 'Service health status'
            },
            capabilities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Service capabilities'
            },
            dependencies: {
                type: 'array',
                items: { type: 'string' },
                description: 'Service dependencies'
            },
            metadata: {
                type: 'object',
                description: 'Additional service metadata'
            },
            healthCheckEndpoint: {
                type: 'string',
                description: 'Health check endpoint path'
            },
            documentation: {
                type: 'string',
                format: 'uri',
                description: 'Service documentation URL'
            }
        },
        required: ['name', 'version', 'type', 'endpoint']
    },
    UpdateServiceRequest: {
        type: 'object',
        properties: {
            version: {
                type: 'string',
                minLength: 1,
                description: 'Service version'
            },
            endpoint: {
                type: 'string',
                format: 'uri',
                description: 'Service endpoint URL'
            },
            status: {
                type: 'string',
                enum: ['HEALTHY', 'DEGRADED', 'UNHEALTHY'],
                description: 'Service health status'
            },
            capabilities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Service capabilities'
            },
            dependencies: {
                type: 'array',
                items: { type: 'string' },
                description: 'Service dependencies'
            },
            metadata: {
                type: 'object',
                description: 'Additional service metadata'
            },
            healthCheckEndpoint: {
                type: 'string',
                description: 'Health check endpoint path'
            },
            documentation: {
                type: 'string',
                format: 'uri',
                description: 'Service documentation URL'
            }
        }
    },
    Route: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'Route identifier'
            },
            path: {
                type: 'string',
                description: 'Route path pattern'
            },
            method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                description: 'HTTP method'
            },
            targetService: {
                type: 'string',
                description: 'Target service name'
            },
            targetPath: {
                type: 'string',
                description: 'Target service path'
            },
            description: {
                type: 'string',
                description: 'Route description'
            },
            authentication: {
                type: 'boolean',
                description: 'Authentication required'
            },
            rateLimit: {
                type: 'integer',
                description: 'Rate limit per minute'
            },
            timeout: {
                type: 'integer',
                description: 'Request timeout in milliseconds'
            },
            isActive: {
                type: 'boolean',
                description: 'Route is active'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Creation timestamp'
            }
        },
        required: ['id', 'path', 'method', 'targetService', 'authentication']
    },
    CreateRouteRequest: {
        type: 'object',
        properties: {
            path: {
                type: 'string',
                minLength: 1,
                description: 'Route path pattern'
            },
            method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                description: 'HTTP method'
            },
            targetService: {
                type: 'string',
                minLength: 1,
                description: 'Target service name'
            },
            targetPath: {
                type: 'string',
                minLength: 1,
                description: 'Target service path'
            },
            description: {
                type: 'string',
                description: 'Route description'
            },
            authentication: {
                type: 'boolean',
                default: true,
                description: 'Authentication required'
            },
            rateLimit: {
                type: 'integer',
                minimum: 1,
                description: 'Rate limit per minute'
            },
            timeout: {
                type: 'integer',
                minimum: 1000,
                default: 30000,
                description: 'Request timeout in milliseconds'
            }
        },
        required: ['path', 'method', 'targetService']
    }
};

// Generate OpenAPI specification
const openApiSpec = generateServiceOpenApiSpec('HUB', hubServicePaths, { schemas: hubServiceSchemas });

// Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HUB Service API Documentation',
}));

// Authentication middleware for protected routes
const authMiddleware = jwtAuthMiddleware({
    jwtSecret: config.auth.jwtSecret,
    skipPaths: ['/health', '/ready', '/docs']
});

// API Routes
app.use('/api/v1', authMiddleware);

// Services endpoints
app.get('/api/v1/services',
    validate({ query: HubSchemas.findServices }),
    async (req, res) => {
        // Mock implementation
        const services = [
            {
                name: 'memorai',
                version: '1.0.0',
                type: 'API',
                endpoint: 'https://memorai.codai.ro',
                status: 'HEALTHY',
                capabilities: ['memory-storage', 'recall', 'search'],
                dependencies: ['id'],
                metadata: { port: 4002 },
                healthCheckEndpoint: '/health',
                documentation: 'https://memorai.codai.ro/docs',
                registeredAt: new Date().toISOString(),
                lastHealthCheck: new Date().toISOString()
            },
            {
                name: 'id',
                version: '1.0.0',
                type: 'API',
                endpoint: 'https://id.codai.ro',
                status: 'HEALTHY',
                capabilities: ['authentication', 'user-management'],
                dependencies: [],
                metadata: { port: 4001 },
                healthCheckEndpoint: '/health',
                documentation: 'https://id.codai.ro/docs',
                registeredAt: new Date().toISOString(),
                lastHealthCheck: new Date().toISOString()
            }
        ];

        const filteredServices = services.filter(service => {
            if (req.query.type && service.type !== req.query.type) return false;
            if (req.query.status && service.status !== req.query.status) return false;
            if (req.query.capability && !service.capabilities.includes(req.query.capability as string)) return false;
            return true;
        });

        const limit = parseInt(req.query.limit as string) || 50;

        const response = req.responseBuilder.success({
            services: filteredServices.slice(0, limit),
            total: filteredServices.length
        });

        res.json(response);
    }
);

app.post('/api/v1/services',
    validate({ body: HubSchemas.registerService }),
    async (req, res) => {
        // Mock implementation
        const newService = {
            ...req.body,
            registeredAt: new Date().toISOString(),
            lastHealthCheck: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newService);
        res.status(201).json(response);
    }
);

app.get('/api/v1/services/:name', async (req, res) => {
    // Mock implementation
    const service = {
        name: req.params.name,
        version: '1.0.0',
        type: 'API',
        endpoint: `https://${req.params.name}.codai.ro`,
        status: 'HEALTHY',
        capabilities: ['service-capability'],
        dependencies: ['id'],
        metadata: {},
        healthCheckEndpoint: '/health',
        documentation: `https://${req.params.name}.codai.ro/docs`,
        registeredAt: new Date().toISOString(),
        lastHealthCheck: new Date().toISOString()
    };

    const response = req.responseBuilder.success(service);
    res.json(response);
});

app.get('/api/v1/services/:name/health', async (req, res) => {
    // Mock implementation
    const healthStatus = {
        status: 'HEALTHY',
        responseTime: Math.random() * 100 + 50,
        lastChecked: new Date().toISOString(),
        details: {
            uptime: Math.random() * 86400,
            memory: { used: Math.random() * 100, total: 512 },
            cpu: Math.random() * 100
        }
    };

    const response = req.responseBuilder.success(healthStatus);
    res.json(response);
});

// Routes endpoints
app.get('/api/v1/routes', async (req, res) => {
    // Mock implementation
    const routes = [
        {
            id: 'route-1',
            path: '/api/v1/memories',
            method: 'GET',
            targetService: 'memorai',
            targetPath: '/api/v1/memories',
            description: 'Memory management endpoints',
            authentication: true,
            rateLimit: 100,
            timeout: 30000,
            isActive: true,
            createdAt: new Date().toISOString()
        }
    ];

    const response = req.responseBuilder.success({
        routes,
        total: routes.length
    });

    res.json(response);
});

app.post('/api/v1/routes',
    validate({ body: HubSchemas.createRoute }),
    async (req, res) => {
        // Mock implementation
        const newRoute = {
            id: 'route-' + Date.now(),
            ...req.body,
            targetPath: req.body.targetPath || req.body.path,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newRoute);
        res.status(201).json(response);
    }
);

// Error handling
app.use(globalErrorHandler);
app.use(notFoundHandler);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🌐 HUB Service API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;
