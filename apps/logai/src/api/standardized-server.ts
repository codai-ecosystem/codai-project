/**
 * LOGAI Service API Implementation
 * Standardized logging and analytics API using CODAI standards
 */

import express from 'express';
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

const app = express();
const config = createStandardApiConfig('logai', 4004);

// Setup universal CODAI middleware
setupCodaiMiddleware(app, config);

// LOGAI specific validation schemas
const LogaiSchemas = {
    createLog: z.object({
        level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']),
        message: z.string().min(1),
        service: z.string().min(1),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional(),
        userId: z.string().optional(),
        sessionId: z.string().optional(),
        requestId: z.string().optional(),
        timestamp: z.string().datetime().optional()
    }),

    searchLogs: z.object({
        service: z.string().optional(),
        level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']).optional(),
        category: z.string().optional(),
        message: z.string().optional(),
        userId: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.coerce.number().int().min(1).max(1000).default(100),
        offset: z.coerce.number().int().min(0).default(0)
    }),

    createEvent: z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        service: z.string().min(1),
        userId: z.string().optional(),
        sessionId: z.string().optional(),
        properties: z.record(z.any()).optional(),
        value: z.number().optional(),
        timestamp: z.string().datetime().optional()
    }),

    queryAnalytics: z.object({
        metric: z.enum(['events', 'users', 'sessions', 'errors', 'performance']),
        service: z.string().optional(),
        category: z.string().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        groupBy: z.enum(['hour', 'day', 'week', 'month']).default('day'),
        filters: z.record(z.any()).optional()
    })
};

// LOGAI Service specific paths for OpenAPI
const logaiServicePaths: OpenAPIV3.PathsObject = {
    '/logs': {
        get: {
            tags: ['Logs'],
            summary: 'Search logs',
            description: 'Search and retrieve logs with filtering options',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'service',
                    in: 'query',
                    description: 'Filter by service name',
                    schema: { type: 'string' }
                },
                {
                    name: 'level',
                    in: 'query',
                    description: 'Filter by log level',
                    schema: {
                        type: 'string',
                        enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']
                    }
                },
                {
                    name: 'category',
                    in: 'query',
                    description: 'Filter by category',
                    schema: { type: 'string' }
                },
                {
                    name: 'message',
                    in: 'query',
                    description: 'Search in log messages',
                    schema: { type: 'string' }
                },
                {
                    name: 'userId',
                    in: 'query',
                    description: 'Filter by user ID',
                    schema: { type: 'string' }
                },
                {
                    name: 'startDate',
                    in: 'query',
                    description: 'Start date for log search',
                    schema: { type: 'string', format: 'date-time' }
                },
                {
                    name: 'endDate',
                    in: 'query',
                    description: 'End date for log search',
                    schema: { type: 'string', format: 'date-time' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of logs to return',
                    schema: { type: 'integer', minimum: 1, maximum: 1000, default: 100 }
                },
                {
                    name: 'offset',
                    in: 'query',
                    description: 'Number of logs to skip',
                    schema: { type: 'integer', minimum: 0, default: 0 }
                }
            ],
            responses: {
                '200': {
                    description: 'Search results',
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
                                                    logs: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/LogEntry' }
                                                    },
                                                    total: { type: 'integer' },
                                                    offset: { type: 'integer' },
                                                    limit: { type: 'integer' }
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
            tags: ['Logs'],
            summary: 'Create log entry',
            description: 'Create a new log entry',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateLogRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Log entry created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/LogEntry' }
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
    '/events': {
        get: {
            tags: ['Events'],
            summary: 'List events',
            description: 'Retrieve analytics events',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'service',
                    in: 'query',
                    description: 'Filter by service name',
                    schema: { type: 'string' }
                },
                {
                    name: 'category',
                    in: 'query',
                    description: 'Filter by category',
                    schema: { type: 'string' }
                },
                {
                    name: 'userId',
                    in: 'query',
                    description: 'Filter by user ID',
                    schema: { type: 'string' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of events to return',
                    schema: { type: 'integer', minimum: 1, maximum: 1000, default: 100 }
                }
            ],
            responses: {
                '200': {
                    description: 'List of events',
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
                                                    events: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Event' }
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
            tags: ['Events'],
            summary: 'Track event',
            description: 'Track a new analytics event',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateEventRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Event tracked successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Event' }
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
    '/analytics': {
        post: {
            tags: ['Analytics'],
            summary: 'Query analytics',
            description: 'Query analytics data with aggregation',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/QueryAnalyticsRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Analytics data',
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
                                                    metric: { type: 'string' },
                                                    data: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'object',
                                                            properties: {
                                                                timestamp: { type: 'string', format: 'date-time' },
                                                                value: { type: 'number' },
                                                                labels: { type: 'object' }
                                                            }
                                                        }
                                                    },
                                                    total: { type: 'number' },
                                                    period: { type: 'object' }
                                                }
                                            }
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
    '/dashboards': {
        get: {
            tags: ['Dashboards'],
            summary: 'List dashboards',
            description: 'Get available analytics dashboards',
            security: [{ BearerAuth: [] }],
            responses: {
                '200': {
                    description: 'List of dashboards',
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
                                                    dashboards: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Dashboard' }
                                                    }
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
        }
    }
};

// LOGAI Service specific schemas
const logaiServiceSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    LogEntry: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'Log entry ID'
            },
            level: {
                type: 'string',
                enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
                description: 'Log level'
            },
            message: {
                type: 'string',
                description: 'Log message'
            },
            service: {
                type: 'string',
                description: 'Service name'
            },
            category: {
                type: 'string',
                description: 'Log category'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Log tags'
            },
            metadata: {
                type: 'object',
                description: 'Additional metadata'
            },
            userId: {
                type: 'string',
                description: 'User ID'
            },
            sessionId: {
                type: 'string',
                description: 'Session ID'
            },
            requestId: {
                type: 'string',
                description: 'Request ID'
            },
            timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Log timestamp'
            }
        },
        required: ['id', 'level', 'message', 'service', 'timestamp']
    },
    CreateLogRequest: {
        type: 'object',
        properties: {
            level: {
                type: 'string',
                enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
                description: 'Log level'
            },
            message: {
                type: 'string',
                minLength: 1,
                description: 'Log message'
            },
            service: {
                type: 'string',
                minLength: 1,
                description: 'Service name'
            },
            category: {
                type: 'string',
                description: 'Log category'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Log tags'
            },
            metadata: {
                type: 'object',
                description: 'Additional metadata'
            },
            userId: {
                type: 'string',
                description: 'User ID'
            },
            sessionId: {
                type: 'string',
                description: 'Session ID'
            },
            requestId: {
                type: 'string',
                description: 'Request ID'
            },
            timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Log timestamp'
            }
        },
        required: ['level', 'message', 'service']
    },
    Event: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'Event ID'
            },
            name: {
                type: 'string',
                description: 'Event name'
            },
            category: {
                type: 'string',
                description: 'Event category'
            },
            service: {
                type: 'string',
                description: 'Service name'
            },
            userId: {
                type: 'string',
                description: 'User ID'
            },
            sessionId: {
                type: 'string',
                description: 'Session ID'
            },
            properties: {
                type: 'object',
                description: 'Event properties'
            },
            value: {
                type: 'number',
                description: 'Event value'
            },
            timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Event timestamp'
            }
        },
        required: ['id', 'name', 'category', 'service', 'timestamp']
    },
    CreateEventRequest: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                minLength: 1,
                description: 'Event name'
            },
            category: {
                type: 'string',
                minLength: 1,
                description: 'Event category'
            },
            service: {
                type: 'string',
                minLength: 1,
                description: 'Service name'
            },
            userId: {
                type: 'string',
                description: 'User ID'
            },
            sessionId: {
                type: 'string',
                description: 'Session ID'
            },
            properties: {
                type: 'object',
                description: 'Event properties'
            },
            value: {
                type: 'number',
                description: 'Event value'
            },
            timestamp: {
                type: 'string',
                format: 'date-time',
                description: 'Event timestamp'
            }
        },
        required: ['name', 'category', 'service']
    },
    QueryAnalyticsRequest: {
        type: 'object',
        properties: {
            metric: {
                type: 'string',
                enum: ['events', 'users', 'sessions', 'errors', 'performance'],
                description: 'Metric to query'
            },
            service: {
                type: 'string',
                description: 'Filter by service'
            },
            category: {
                type: 'string',
                description: 'Filter by category'
            },
            startDate: {
                type: 'string',
                format: 'date-time',
                description: 'Start date for query'
            },
            endDate: {
                type: 'string',
                format: 'date-time',
                description: 'End date for query'
            },
            groupBy: {
                type: 'string',
                enum: ['hour', 'day', 'week', 'month'],
                default: 'day',
                description: 'Group results by time period'
            },
            filters: {
                type: 'object',
                description: 'Additional filters'
            }
        },
        required: ['metric']
    },
    Dashboard: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'Dashboard ID'
            },
            name: {
                type: 'string',
                description: 'Dashboard name'
            },
            description: {
                type: 'string',
                description: 'Dashboard description'
            },
            widgets: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        title: { type: 'string' },
                        query: { type: 'object' }
                    }
                },
                description: 'Dashboard widgets'
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Creation timestamp'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Last update timestamp'
            }
        },
        required: ['id', 'name', 'widgets']
    }
};

// Generate OpenAPI specification
const openApiSpec = generateServiceOpenApiSpec('LOGAI', logaiServicePaths, { schemas: logaiServiceSchemas });

// Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'LOGAI Service API Documentation',
}));

// Authentication middleware for protected routes
const authMiddleware = jwtAuthMiddleware({
    jwtSecret: config.auth.jwtSecret,
    skipPaths: ['/health', '/ready', '/docs']
});

// API Routes
app.use('/api/v1', authMiddleware);

// Logs endpoints
app.get('/api/v1/logs',
    validate({ query: LogaiSchemas.searchLogs }),
    async (req, res) => {
        // Mock implementation
        const logs = [
            {
                id: 'log-123e4567-e89b-12d3-a456-426614174000',
                level: 'INFO',
                message: 'User authentication successful',
                service: 'id',
                category: 'auth',
                tags: ['authentication', 'success'],
                metadata: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0' },
                userId: 'user-123',
                sessionId: 'session-456',
                requestId: 'req-789',
                timestamp: new Date().toISOString()
            },
            {
                id: 'log-223e4567-e89b-12d3-a456-426614174001',
                level: 'ERROR',
                message: 'Database connection failed',
                service: 'memorai',
                category: 'database',
                tags: ['database', 'error'],
                metadata: { error: 'Connection timeout', retries: 3 },
                timestamp: new Date().toISOString()
            }
        ];

        const filteredLogs = logs.filter(log => {
            if (req.query.service && log.service !== req.query.service) return false;
            if (req.query.level && log.level !== req.query.level) return false;
            if (req.query.category && log.category !== req.query.category) return false;
            if (req.query.userId && log.userId !== req.query.userId) return false;
            return true;
        });

        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 100;
        const response = req.responseBuilder.success({
            logs: filteredLogs.slice(offset, offset + limit),
            total: filteredLogs.length,
            offset: offset,
            limit: limit
        });

        res.json(response);
    }
);

app.post('/api/v1/logs',
    validate({ body: LogaiSchemas.createLog }),
    async (req, res) => {
        // Mock implementation
        const newLog = {
            id: 'log-' + Date.now(),
            ...req.body,
            timestamp: req.body.timestamp || new Date().toISOString()
        };

        const response = req.responseBuilder.success(newLog);
        res.status(201).json(response);
    }
);

// Events endpoints
app.get('/api/v1/events', async (req, res) => {
    // Mock implementation
    const events = [
        {
            id: 'event-123e4567-e89b-12d3-a456-426614174000',
            name: 'page_view',
            category: 'navigation',
            service: 'web',
            userId: 'user-123',
            sessionId: 'session-456',
            properties: { page: '/dashboard', referrer: '/' },
            value: 1,
            timestamp: new Date().toISOString()
        }
    ];

    const response = req.responseBuilder.success({
        events,
        total: events.length
    });

    res.json(response);
});

app.post('/api/v1/events',
    validate({ body: LogaiSchemas.createEvent }),
    async (req, res) => {
        // Mock implementation
        const newEvent = {
            id: 'event-' + Date.now(),
            ...req.body,
            timestamp: req.body.timestamp || new Date().toISOString()
        };

        const response = req.responseBuilder.success(newEvent);
        res.status(201).json(response);
    }
);

// Analytics endpoints
app.post('/api/v1/analytics',
    validate({ body: LogaiSchemas.queryAnalytics }),
    async (req, res) => {
        // Mock implementation
        const data = [
            {
                timestamp: new Date().toISOString(),
                value: Math.floor(Math.random() * 1000),
                labels: { service: req.body.service || 'all' }
            }
        ];

        const response = req.responseBuilder.success({
            metric: req.body.metric,
            data,
            total: data.reduce((sum, item) => sum + item.value, 0),
            period: {
                start: req.body.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                end: req.body.endDate || new Date().toISOString(),
                groupBy: req.body.groupBy || 'day'
            }
        });

        res.json(response);
    }
);

// Dashboards endpoints
app.get('/api/v1/dashboards', async (req, res) => {
    // Mock implementation
    const dashboards = [
        {
            id: 'dashboard-system-overview',
            name: 'System Overview',
            description: 'General system health and performance metrics',
            widgets: [
                {
                    type: 'metric',
                    title: 'Total Events',
                    query: { metric: 'events', groupBy: 'day' }
                },
                {
                    type: 'chart',
                    title: 'Error Rate',
                    query: { metric: 'errors', groupBy: 'hour' }
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    const response = req.responseBuilder.success({ dashboards });
    res.json(response);
});

// Error handling
app.use(globalErrorHandler);
app.use(notFoundHandler);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`📊 LOGAI Service API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;
