/**
 * MEMORAI Service API Implementation
 * Standardized database and storage API using CODAI standards
 */

import express from 'express';
import {
    setupCodaiMiddleware,
    createStandardApiConfig,
    jwtAuthMiddleware,
    validate,
    generateServiceOpenApiSpec,
    globalErrorHandler,
    notFoundHandler
} from '@codai/api-standards';
import { OpenAPIV3 } from 'openapi-types';
import swaggerUi from 'swagger-ui-express';
import { z } from 'zod';

const app = express();
const config = createStandardApiConfig('memorai', 4002);

// Setup universal CODAI middleware
setupCodaiMiddleware(app, config);

// MEMORAI specific validation schemas
const MemoraiSchemas = {
    createMemory: z.object({
        agentId: z.string().min(1),
        content: z.string().min(1),
        memoryType: z.enum(['EPISODIC', 'SEMANTIC', 'PROCEDURAL']).default('EPISODIC'),
        importance: z.number().min(0).max(1).default(0.5),
        confidence: z.number().min(0).max(1).default(0.8),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional(),
        sessionId: z.string().optional()
    }),

    updateMemory: z.object({
        content: z.string().min(1).optional(),
        importance: z.number().min(0).max(1).optional(),
        confidence: z.number().min(0).max(1).optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional()
    }),

    searchMemories: z.object({
        agentId: z.string().min(1),
        query: z.string().min(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        minImportance: z.number().min(0).max(1).optional(),
        memoryType: z.enum(['EPISODIC', 'SEMANTIC', 'PROCEDURAL']).optional(),
        category: z.string().optional()
    }),

    recallMemory: z.object({
        agentId: z.string().min(1),
        query: z.string().min(1),
        contextSize: z.coerce.number().int().min(1).max(20).default(5)
    })
};

// MEMORAI Service specific paths for OpenAPI
const memoraiServicePaths: OpenAPIV3.PathsObject = {
    '/memories': {
        get: {
            tags: ['Memory'],
            summary: 'List memories',
            description: 'Retrieve memories for an agent',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'agentId',
                    in: 'query',
                    required: true,
                    description: 'Agent identifier',
                    schema: { type: 'string' }
                },
                {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of memories to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
                },
                {
                    name: 'memoryType',
                    in: 'query',
                    description: 'Type of memory to filter by',
                    schema: {
                        type: 'string',
                        enum: ['EPISODIC', 'SEMANTIC', 'PROCEDURAL']
                    }
                }
            ],
            responses: {
                '200': {
                    description: 'List of memories',
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
                                                    memories: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Memory' }
                                                    },
                                                    count: { type: 'integer' },
                                                    agentId: { type: 'string' }
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
                '401': { $ref: '#/components/responses/Unauthorized' }
            }
        },
        post: {
            tags: ['Memory'],
            summary: 'Store new memory',
            description: 'Create and store a new memory for an agent',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateMemoryRequest' }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Memory created successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Memory' }
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
    '/memories/{id}': {
        get: {
            tags: ['Memory'],
            summary: 'Get memory by ID',
            description: 'Retrieve a specific memory by its ID',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Memory ID',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'Memory details',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Memory' }
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
            tags: ['Memory'],
            summary: 'Update memory',
            description: 'Update an existing memory',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Memory ID',
                    schema: { type: 'string' }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateMemoryRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Memory updated successfully',
                    content: {
                        'application/json': {
                            schema: {
                                allOf: [
                                    { $ref: '#/components/schemas/CodaiResponse' },
                                    {
                                        type: 'object',
                                        properties: {
                                            data: { $ref: '#/components/schemas/Memory' }
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
            tags: ['Memory'],
            summary: 'Delete memory',
            description: 'Delete a memory',
            security: [{ BearerAuth: [] }],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Memory ID',
                    schema: { type: 'string' }
                }
            ],
            responses: {
                '200': {
                    description: 'Memory deleted successfully',
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
    '/memories/search': {
        post: {
            tags: ['Memory'],
            summary: 'Search memories',
            description: 'Search for memories using query string',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/SearchMemoriesRequest' }
                    }
                }
            },
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
                                                    memories: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Memory' }
                                                    },
                                                    total: { type: 'integer' },
                                                    query: { type: 'string' }
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
    '/memories/recall': {
        post: {
            tags: ['Memory'],
            summary: 'Recall memories',
            description: 'Recall relevant memories for a given context',
            security: [{ BearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/RecallMemoryRequest' }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Recalled memories',
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
                                                    memories: {
                                                        type: 'array',
                                                        items: { $ref: '#/components/schemas/Memory' }
                                                    },
                                                    context: { type: 'string' },
                                                    relevanceScore: { type: 'number' }
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
    }
};

// MEMORAI Service specific schemas
const memoraiServiceSchemas: OpenAPIV3.ComponentsObject['schemas'] = {
    Memory: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'Unique memory identifier'
            },
            agentId: {
                type: 'string',
                description: 'Agent identifier that owns this memory'
            },
            content: {
                type: 'string',
                description: 'Memory content'
            },
            summary: {
                type: 'string',
                description: 'Memory summary'
            },
            memoryType: {
                type: 'string',
                enum: ['EPISODIC', 'SEMANTIC', 'PROCEDURAL'],
                description: 'Type of memory'
            },
            importance: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                description: 'Memory importance score'
            },
            confidence: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                description: 'Memory confidence score'
            },
            category: {
                type: 'string',
                description: 'Memory category'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Memory tags'
            },
            metadata: {
                type: 'object',
                description: 'Additional metadata'
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
            },
            lastAccessed: {
                type: 'string',
                format: 'date-time',
                description: 'Last access timestamp'
            }
        },
        required: ['id', 'agentId', 'content', 'memoryType', 'importance', 'confidence', 'createdAt']
    },
    CreateMemoryRequest: {
        type: 'object',
        properties: {
            agentId: {
                type: 'string',
                minLength: 1,
                description: 'Agent identifier'
            },
            content: {
                type: 'string',
                minLength: 1,
                description: 'Memory content'
            },
            memoryType: {
                type: 'string',
                enum: ['EPISODIC', 'SEMANTIC', 'PROCEDURAL'],
                default: 'EPISODIC',
                description: 'Type of memory'
            },
            importance: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                default: 0.5,
                description: 'Memory importance score'
            },
            confidence: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                default: 0.8,
                description: 'Memory confidence score'
            },
            category: {
                type: 'string',
                description: 'Memory category'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Memory tags'
            },
            metadata: {
                type: 'object',
                description: 'Additional metadata'
            },
            sessionId: {
                type: 'string',
                description: 'Session identifier'
            }
        },
        required: ['agentId', 'content']
    },
    UpdateMemoryRequest: {
        type: 'object',
        properties: {
            content: {
                type: 'string',
                minLength: 1,
                description: 'Memory content'
            },
            importance: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                description: 'Memory importance score'
            },
            confidence: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                description: 'Memory confidence score'
            },
            category: {
                type: 'string',
                description: 'Memory category'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Memory tags'
            },
            metadata: {
                type: 'object',
                description: 'Additional metadata'
            }
        }
    },
    SearchMemoriesRequest: {
        type: 'object',
        properties: {
            agentId: {
                type: 'string',
                minLength: 1,
                description: 'Agent identifier'
            },
            query: {
                type: 'string',
                minLength: 1,
                description: 'Search query'
            },
            limit: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 10,
                description: 'Maximum number of results'
            },
            minImportance: {
                type: 'number',
                minimum: 0,
                maximum: 1,
                description: 'Minimum importance threshold'
            },
            memoryType: {
                type: 'string',
                enum: ['EPISODIC', 'SEMANTIC', 'PROCEDURAL'],
                description: 'Memory type filter'
            },
            category: {
                type: 'string',
                description: 'Category filter'
            }
        },
        required: ['agentId', 'query']
    },
    RecallMemoryRequest: {
        type: 'object',
        properties: {
            agentId: {
                type: 'string',
                minLength: 1,
                description: 'Agent identifier'
            },
            query: {
                type: 'string',
                minLength: 1,
                description: 'Context for memory recall'
            },
            contextSize: {
                type: 'integer',
                minimum: 1,
                maximum: 20,
                default: 5,
                description: 'Number of memories to recall'
            }
        },
        required: ['agentId', 'query']
    }
};

// Generate OpenAPI specification
const openApiSpec = generateServiceOpenApiSpec('MEMORAI', memoraiServicePaths, { schemas: memoraiServiceSchemas });

// Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MEMORAI Service API Documentation',
}));

// Authentication middleware for protected routes
const authMiddleware = jwtAuthMiddleware({
    jwtSecret: config.auth.jwtSecret,
    skipPaths: ['/health', '/ready', '/docs']
});

// API Routes
app.use('/api/v1', authMiddleware);

// Memories endpoints
app.get('/api/v1/memories',
    validate({
        query: z.object({
            agentId: z.string().min(1),
            limit: z.coerce.number().int().min(1).max(100).default(10),
            memoryType: z.enum(['EPISODIC', 'SEMANTIC', 'PROCEDURAL']).optional()
        })
    }),
    async (req, res) => {
        // Mock implementation
        const memories = [
            {
                id: 'mem-123e4567-e89b-12d3-a456-426614174000',
                agentId: req.query.agentId,
                content: 'Sample memory content',
                summary: 'Sample summary',
                memoryType: 'EPISODIC',
                importance: 0.8,
                confidence: 0.9,
                category: 'learning',
                tags: ['ai', 'development'],
                metadata: { source: 'api-test' },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString()
            }
        ];

        const response = req.responseBuilder.success({
            memories,
            count: memories.length,
            agentId: req.query.agentId
        });

        res.json(response);
    }
);

app.post('/api/v1/memories',
    validate({ body: MemoraiSchemas.createMemory }),
    async (req, res) => {
        // Mock implementation
        const newMemory = {
            id: 'mem-' + Date.now(),
            ...req.body,
            summary: req.body.content.substring(0, 100) + (req.body.content.length > 100 ? '...' : ''),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString()
        };

        const response = req.responseBuilder.success(newMemory);
        res.status(201).json(response);
    }
);

app.get('/api/v1/memories/:id', async (req, res) => {
    // Mock implementation
    const memory = {
        id: req.params.id,
        agentId: 'agent-123',
        content: 'Retrieved memory content',
        summary: 'Retrieved summary',
        memoryType: 'EPISODIC',
        importance: 0.7,
        confidence: 0.8,
        category: 'retrieval',
        tags: ['test'],
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
    };

    const response = req.responseBuilder.success(memory);
    res.json(response);
});

app.post('/api/v1/memories/search',
    validate({ body: MemoraiSchemas.searchMemories }),
    async (req, res) => {
        // Mock implementation
        const memories = [
            {
                id: 'mem-search-result',
                agentId: req.body.agentId,
                content: `Memory matching "${req.body.query}"`,
                summary: 'Search result summary',
                memoryType: 'SEMANTIC',
                importance: 0.9,
                confidence: 0.85,
                category: 'search',
                tags: ['search', 'result'],
                metadata: { query: req.body.query },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString()
            }
        ];

        const response = req.responseBuilder.success({
            memories,
            total: memories.length,
            query: req.body.query
        });

        res.json(response);
    }
);

app.post('/api/v1/memories/recall',
    validate({ body: MemoraiSchemas.recallMemory }),
    async (req, res) => {
        // Mock implementation
        const memories = [
            {
                id: 'mem-recalled',
                agentId: req.body.agentId,
                content: `Recalled memory for context: ${req.body.query}`,
                summary: 'Recalled memory summary',
                memoryType: 'PROCEDURAL',
                importance: 0.95,
                confidence: 0.9,
                category: 'recall',
                tags: ['recall', 'context'],
                metadata: { context: req.body.query },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastAccessed: new Date().toISOString()
            }
        ];

        const response = req.responseBuilder.success({
            memories,
            context: req.body.query,
            relevanceScore: 0.92
        });

        res.json(response);
    }
);

// Error handling
app.use(globalErrorHandler);
app.use(notFoundHandler);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`🧠 MEMORAI Service API running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

export default app;
