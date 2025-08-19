import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { UltimateMemoryService, type MemoryServiceConfig } from '../lib/memory-service';
import { EntityTypeSchema, RelationTypeSchema } from '../types/memory';

// Initialize memory service with complete config
const memoryServiceConfig: MemoryServiceConfig = {
    maxEntities: 100000,
    maxRelations: 500000,
    enableVectorSearch: true,
    enableRealTimeSync: true,
    enableAnalytics: true,
    cleanupInterval: 3600000,
    maxAccessLogSize: 10000,
    cacheSize: 1000,
    vectorDimensions: 1536,
    embeddingProvider: 'openai',
    persistentStorage: false,
    storageBackend: 'memory',
    encryptionEnabled: false,
    compressionEnabled: true,
    enableCache: true,
    cacheTTL: 300000,
    enableSecurityAudit: true,
    maxRequestsPerMinute: 100,
    enableCompression: true,
    enableEncryption: false
};

const memoryService = new UltimateMemoryService(memoryServiceConfig);

// Request/Response schemas
const CreateEntityRequestSchema = z.object({
    name: z.string(),
    entityType: EntityTypeSchema,
    content: z.string().optional(),
    metadata: z.record(z.any()).default({}),
    tags: z.array(z.string()).default([]),
    observations: z.array(z.string()).default([]),
    priority: z.number().default(1),
    confidence: z.number().default(1.0),
    project_id: z.string().optional(),
    user_id: z.string().optional()
});

const UpdateEntityRequestSchema = CreateEntityRequestSchema.partial().extend({
    id: z.string()
});

const SearchRequestSchema = z.object({
    text: z.string().optional(),
    embedding: z.array(z.number()).optional(),
    entityTypes: z.array(EntityTypeSchema).optional(),
    tags: z.array(z.string()).optional(),
    minScore: z.number().optional(),
    maxResults: z.number().optional(),
    project_id: z.string().optional(),
    user_id: z.string().optional(),
    timeRange: z.object({
        start: z.string().datetime(),
        end: z.string().datetime()
    }).optional()
});

const CreateRelationRequestSchema = z.object({
    sourceId: z.string(),
    targetId: z.string(),
    relationType: RelationTypeSchema,
    metadata: z.record(z.any()).optional()
});

/**
 * Register memory-related routes for the ultimate memory MCP system
 */
export function registerMemoryRoutes(fastify: FastifyInstance): void {
    console.log('Memory routes being registered');

    // Add debug route for development
    if (process.env['NODE_ENV'] !== 'production') {
        fastify.get('/api/memory/debug', () => {
            console.log('Memory debug route accessed!');
            return { debug: 'Memory routes are registered', service: 'active' };
        });
    }

    // ============================================================================
    // ENTITY ROUTES
    // ============================================================================

    // Create entity
    fastify.post<{
        Body: z.infer<typeof CreateEntityRequestSchema>;
    }>('/api/memory/entities', {
        schema: {
            description: 'Create a new memory entity',
            tags: ['Memory'],
            body: CreateEntityRequestSchema,
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Body: z.infer<typeof CreateEntityRequestSchema>; }>, reply: FastifyReply) => {
        try {
            const result = await memoryService.createEntity(request.body);
            return reply.code(200).send(result);
        } catch (error) {
            console.error('Error creating entity:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Get entity by ID
    fastify.get<{
        Params: { id: string; };
    }>('/api/memory/entities/:id', {
        schema: {
            description: 'Get entity by ID',
            tags: ['Memory'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Params: { id: string; }; }>, reply: FastifyReply) => {
        try {
            const { id } = request.params;
            const context = {
                agentId: 'memory-api',
                capabilities: ['read'],
                preferences: {},
                timestamp: new Date(),
                userId: request.ip,
                sessionId: request.headers['x-session-id'] as string || undefined
            };

            const result = await memoryService.getEntity(id, context);

            if (!result.success) {
                return reply.code(400).send(result);
            }

            if (!result.data) {
                return reply.code(404).send({
                    success: false,
                    error: 'Entity not found'
                });
            }

            return reply.send(result);
        } catch (error) {
            console.error('Error getting entity:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Update entity
    fastify.put<{
        Body: z.infer<typeof UpdateEntityRequestSchema>;
    }>('/api/memory/entities', {
        schema: {
            description: 'Update an existing memory entity',
            tags: ['Memory'],
            body: UpdateEntityRequestSchema,
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Body: z.infer<typeof UpdateEntityRequestSchema>; }>, reply: FastifyReply) => {
        try {
            const { id, ...updateData } = request.body;
            const context = {
                agentId: 'memory-api',
                capabilities: ['write'],
                preferences: {},
                timestamp: new Date(),
                userId: request.ip,
                sessionId: request.headers['x-session-id'] as string || undefined
            };

            const result = await memoryService.updateEntity(id, updateData, context);

            if (!result.success) {
                return reply.code(400).send(result);
            }

            return reply.send(result);
        } catch (error) {
            console.error('Error updating entity:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Delete entity
    fastify.delete<{
        Params: { id: string; };
    }>('/api/memory/entities/:id', {
        schema: {
            description: 'Delete entity by ID',
            tags: ['Memory'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string' }
                },
                required: ['id']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Params: { id: string; }; }>, reply: FastifyReply) => {
        try {
            const { id } = request.params;
            const context = {
                agentId: 'memory-api',
                capabilities: ['delete'],
                preferences: {},
                timestamp: new Date(),
                userId: request.ip,
                sessionId: request.headers['x-session-id'] as string || undefined
            };

            const result = await memoryService.deleteEntity(id, context);

            if (!result.success) {
                return reply.code(400).send(result);
            }
            return reply.send(result);
        } catch (error) {
            console.error('Error deleting entity:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // ============================================================================
    // SEARCH ROUTES
    // ============================================================================

    // Search memories
    fastify.post<{
        Body: z.infer<typeof SearchRequestSchema>;
    }>('/api/memory/search', {
        schema: {
            description: 'Search memory entities',
            tags: ['Memory'],
            body: SearchRequestSchema,
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Body: z.infer<typeof SearchRequestSchema>; }>, reply: FastifyReply) => {
        try {
            const { timeRange, ...restBody } = request.body;

            const searchQuery = {
                ...restBody,
                minScore: restBody.minScore ?? 0.1,
                maxResults: restBody.maxResults ?? 10,
                // Convert string dates to Date objects if timeRange is provided
                ...(timeRange && {
                    timeRange: {
                        start: new Date(timeRange.start),
                        end: new Date(timeRange.end)
                    }
                })
            };

            const result = await memoryService.search(searchQuery);
            return reply.code(200).send(result);
        } catch (error) {
            console.error('Error searching entities:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Get suggestions based on context
    fastify.post<{
        Body: { context: string; projectId?: string; limit?: number; };
    }>('/api/memory/suggestions', {
        schema: {
            description: 'Get context-aware suggestions',
            tags: ['Memory'],
            body: {
                type: 'object',
                properties: {
                    context: { type: 'string' },
                    projectId: { type: 'string' },
                    limit: { type: 'number' }
                },
                required: ['context']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Body: { context: string; projectId?: string; limit?: number; }; }>, reply: FastifyReply) => {
        try {
            const { context, projectId, limit = 5 } = request.body; const result = await memoryService.suggestEntities(context, projectId, limit);
            return reply.code(200).send(result);
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // ============================================================================
    // RELATION ROUTES
    // ============================================================================

    // Create relation (Note: This will need to be implemented in memory service)
    fastify.post<{
        Body: z.infer<typeof CreateRelationRequestSchema>;
    }>('/api/memory/relations', {
        schema: {
            description: 'Create a new memory relation',
            tags: ['Memory'],
            body: CreateRelationRequestSchema,
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Body: z.infer<typeof CreateRelationRequestSchema>; }>, reply: FastifyReply) => {
        try {
            const { sourceId, targetId, relationType, metadata } = request.body;
            const context = {
                agentId: 'memory-api',
                capabilities: ['write'],
                preferences: {},
                timestamp: new Date(),
                userId: request.ip,
                sessionId: request.headers['x-session-id'] as string || undefined
            };

            const result = await memoryService.createRelation(sourceId, targetId, relationType, metadata, context);

            if (!result.success) {
                return reply.code(400).send(result);
            }

            return reply.send(result);
        } catch (error) {
            console.error('Error creating relation:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Get knowledge graph
    fastify.get<{
        Querystring: { projectId?: string; };
    }>('/api/memory/graph', {
        schema: {
            description: 'Get knowledge graph',
            tags: ['Memory'],
            querystring: {
                type: 'object',
                properties: {
                    projectId: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Querystring: { projectId?: string; }; }>, reply: FastifyReply) => {
        try {
            const result = await memoryService.getKnowledgeGraph(request.query.projectId);
            return reply.code(200).send(result);
        } catch (error) {
            console.error('Error getting knowledge graph:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // ============================================================================
    // ANALYTICS ROUTES
    // ============================================================================

    // Get analytics
    fastify.get<{
        Querystring: { projectId?: string; };
    }>('/api/memory/analytics', {
        schema: {
            description: 'Get memory analytics',
            tags: ['Memory'],
            querystring: {
                type: 'object',
                properties: {
                    projectId: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Querystring: { projectId?: string; }; }>, reply: FastifyReply) => {
        try {
            const { projectId } = request.query;

            // Use generateInsights for analytics data
            const result = await memoryService.generateInsights(projectId);

            if (!result.success) {
                return reply.code(400).send(result);
            }

            return reply.send(result);
        } catch (error) {
            console.error('Error getting analytics:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Get insights
    fastify.get<{
        Querystring: { projectId?: string; };
    }>('/api/memory/insights', {
        schema: {
            description: 'Get memory insights',
            tags: ['Memory'],
            querystring: {
                type: 'object',
                properties: {
                    projectId: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'array' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Querystring: { projectId?: string; }; }>, reply: FastifyReply) => {
        try {
            const result = await memoryService.generateInsights(request.query.projectId);
            return reply.code(200).send(result);
        } catch (error) {
            console.error('Error getting insights:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // ============================================================================
    // UTILITY ROUTES
    // ============================================================================

    // Export data
    fastify.get<{
        Querystring: { projectId?: string; format?: 'json' | 'csv' | 'yaml'; };
    }>('/api/memory/export', {
        schema: {
            description: 'Export memory data',
            tags: ['Memory'],
            querystring: {
                type: 'object',
                properties: {
                    projectId: { type: 'string' },
                    format: { type: 'string', enum: ['json', 'csv', 'yaml'] }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'string' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (request: FastifyRequest<{ Querystring: { projectId?: string; format?: 'json' | 'csv' | 'yaml'; }; }>, reply: FastifyReply) => {
        try {
            const { projectId, format = 'json' } = request.query;
            const result = await memoryService.exportData(projectId, format);
            return reply.code(200).send(result);
        } catch (error) {
            console.error('Error exporting data:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Health check for memory service
    fastify.get('/api/memory/health', {
        schema: {
            description: 'Memory service health check',
            tags: ['Memory'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        data: { type: 'object' },
                        operationId: { type: 'string' },
                        timing: { type: 'object' }
                    }
                }
            }
        }
    }, async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await memoryService.getHealthStatus();
            return reply.code(200).send({
                success: true,
                data: result,
                operationId: 'memory-health-check',
                timing: { executionTime: 0 }
            });
        } catch (error) {
            console.error('Error getting memory health:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Clear cache
    fastify.post('/api/memory/cache/clear', {
        schema: {
            description: 'Clear memory cache',
            tags: ['Memory'],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            await memoryService.clearCache();

            return reply.code(200).send({
                success: true,
                message: 'Cache cleared successfully'
            });
        } catch (error) {
            console.error('Error clearing cache:', error);
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    console.log('✅ Memory routes registered successfully');
}

export { memoryService };
