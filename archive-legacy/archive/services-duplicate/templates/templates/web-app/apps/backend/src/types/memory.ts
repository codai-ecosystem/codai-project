/**
 * Ultimate Memory MCP System - Type Definitions
 * The most advanced memory system for AI coding agents
 */

import { z } from 'zod';

// ============================================================================
// CORE ENTITY SYSTEM
// ============================================================================

export const EntityTypeSchema = z.enum([
    // Project & Code
    'project', 'repository', 'codebase', 'file', 'function', 'class', 'module',
    'component', 'service', 'api_endpoint', 'database_schema', 'configuration',

    // Development Process
    'task', 'feature', 'bug', 'requirement', 'test_case', 'deployment', 'release',
    'code_review', 'pull_request', 'commit', 'branch', 'merge', 'conflict_resolution',

    // Knowledge & Documentation
    'documentation', 'tutorial', 'example', 'pattern', 'best_practice', 'guideline',
    'decision', 'architecture', 'design_pattern', 'solution', 'workaround',

    // Team & Collaboration
    'user', 'team', 'role', 'permission', 'meeting', 'discussion', 'agreement',
    'feedback', 'review', 'approval', 'assignment', 'milestone', 'deadline',

    // AI & Automation
    'agent', 'prompt', 'conversation', 'context', 'instruction', 'template',
    'workflow', 'automation', 'script', 'tool', 'integration', 'api_call',

    // Performance & Analytics
    'metric', 'benchmark', 'performance', 'optimization', 'bottleneck', 'issue',
    'error', 'warning', 'log', 'trace', 'profiling', 'monitoring',

    // Business & Strategy
    'goal', 'objective', 'strategy', 'plan', 'roadmap', 'priority', 'stakeholder',
    'customer', 'market', 'competitor', 'opportunity', 'risk', 'constraint'
]);

export const RelationTypeSchema = z.enum([
    // Hierarchical Relations
    'contains', 'belongs_to', 'part_of', 'child_of', 'parent_of', 'inherits_from',
    'extends', 'implements', 'includes', 'composed_of', 'depends_on',

    // Functional Relations
    'calls', 'invokes', 'triggers', 'handles', 'processes', 'transforms',
    'produces', 'consumes', 'validates', 'formats', 'parses', 'serializes',

    // Temporal Relations
    'precedes', 'follows', 'blocks', 'enables', 'requires', 'supersedes',
    'replaces', 'updates', 'modifies', 'creates', 'destroys', 'archives',

    // Logical Relations
    'implies', 'contradicts', 'supports', 'conflicts_with', 'relates_to',
    'similar_to', 'different_from', 'equivalent_to', 'analogous_to',

    // Collaborative Relations
    'assigned_to', 'reviewed_by', 'approved_by', 'owned_by', 'managed_by',
    'contributed_to', 'collaborated_on', 'mentored_by', 'delegated_to',

    // Quality Relations
    'tests', 'validates', 'covers', 'protects', 'monitors', 'measures',
    'benchmarks', 'compares', 'evaluates', 'rates', 'scores',

    // Communication Relations
    'discusses', 'explains', 'documents', 'clarifies', 'questions',
    'answers', 'suggests', 'recommends', 'warns', 'informs'
]);

export type EntityType = z.infer<typeof EntityTypeSchema>;
export type RelationType = z.infer<typeof RelationTypeSchema>;

// ============================================================================
// MEMORY ENTITY SYSTEM
// ============================================================================

export const MemoryEntitySchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(500),
    entityType: EntityTypeSchema,
    description: z.string().optional(),
    observations: z.array(z.string()).default([]),
    metadata: z.record(z.any()).default({}),
    tags: z.array(z.string()).default([]),
    priority: z.number().int().min(0).max(10).default(5),
    confidence: z.number().min(0).max(1).default(1),
    source: z.string().optional(),
    context: z.string().optional(),
    embedding: z.array(z.number()).optional(),
    created_at: z.date().default(() => new Date()),
    updated_at: z.date().default(() => new Date()),
    accessed_at: z.date().default(() => new Date()),
    access_count: z.number().int().min(0).default(0),
    version: z.number().int().min(1).default(1),
    archived: z.boolean().default(false),
    project_id: z.string().optional(),
    user_id: z.string().optional(),
    session_id: z.string().optional()
});

export const MemoryRelationSchema = z.object({
    id: z.string().uuid(),
    from_entity_id: z.string().uuid(),
    to_entity_id: z.string().uuid(),
    relation_type: RelationTypeSchema,
    description: z.string().optional(),
    metadata: z.record(z.any()).default({}),
    weight: z.number().min(0).max(1).default(1),
    confidence: z.number().min(0).max(1).default(1),
    bidirectional: z.boolean().default(false),
    context: z.string().optional(),
    created_at: z.date().default(() => new Date()),
    updated_at: z.date().default(() => new Date()),
    version: z.number().int().min(1).default(1),
    archived: z.boolean().default(false),
    project_id: z.string().optional(),
    user_id: z.string().optional()
});

export type MemoryEntity = z.infer<typeof MemoryEntitySchema>;
export type MemoryRelation = z.infer<typeof MemoryRelationSchema>;

// ============================================================================
// CONVERSATION & CONTEXT SYSTEM
// ============================================================================

export const ConversationSchema = z.object({
    id: z.string().uuid(),
    title: z.string().optional(),
    description: z.string().optional(),
    context: z.string().optional(),
    metadata: z.record(z.any()).default({}),
    user_id: z.string().optional(),
    project_id: z.string().optional(),
    agent_id: z.string().optional(),
    created_at: z.date().default(() => new Date()),
    updated_at: z.date().default(() => new Date()),
    ended_at: z.date().optional(),
    message_count: z.number().int().min(0).default(0),
    archived: z.boolean().default(false)
});

export const ConversationMessageSchema = z.object({
    id: z.string().uuid(),
    conversation_id: z.string().uuid(),
    role: z.enum(['user', 'assistant', 'system', 'tool']),
    content: z.string(),
    metadata: z.record(z.any()).default({}),
    entity_mentions: z.array(z.string()).default([]),
    created_entities: z.array(z.string()).default([]),
    updated_entities: z.array(z.string()).default([]),
    created_relations: z.array(z.string()).default([]),
    tool_calls: z.array(z.record(z.any())).default([]),
    attachments: z.array(z.record(z.any())).default([]),
    embedding: z.array(z.number()).optional(),
    created_at: z.date().default(() => new Date()),
    token_count: z.number().int().min(0).default(0),
    processing_time: z.number().min(0).optional()
});

export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;

// ============================================================================
// PROJECT & CODEBASE INTEGRATION
// ============================================================================

export const ProjectSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    repository_url: z.string().url().optional(),
    local_path: z.string().optional(),
    language: z.string().optional(),
    framework: z.string().optional(),
    metadata: z.record(z.any()).default({}),
    settings: z.record(z.any()).default({}),
    created_at: z.date().default(() => new Date()),
    updated_at: z.date().default(() => new Date()),
    last_sync_at: z.date().optional(),
    entity_count: z.number().int().min(0).default(0),
    relation_count: z.number().int().min(0).default(0),
    archived: z.boolean().default(false)
});

export const CodeAnalysisSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().uuid(),
    file_path: z.string(),
    content_hash: z.string(),
    language: z.string(),
    analysis_result: z.record(z.any()),
    entities_found: z.array(z.string()).default([]),
    relations_found: z.array(z.string()).default([]),
    complexity_score: z.number().min(0).optional(),
    quality_score: z.number().min(0).max(1).optional(),
    created_at: z.date().default(() => new Date()),
    updated_at: z.date().default(() => new Date())
});

export type Project = z.infer<typeof ProjectSchema>;
export type CodeAnalysis = z.infer<typeof CodeAnalysisSchema>;

// ============================================================================
// SEARCH & RETRIEVAL SYSTEM
// ============================================================================

export const SearchQuerySchema = z.object({
    query: z.string().min(1),
    entity_types: z.array(EntityTypeSchema).optional(),
    relation_types: z.array(RelationTypeSchema).optional(),
    project_ids: z.array(z.string()).optional(),
    user_ids: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    metadata_filters: z.record(z.any()).optional(),
    date_range: z.object({
        start: z.date().optional(),
        end: z.date().optional()
    }).optional(),
    similarity_threshold: z.number().min(0).max(1).default(0.7),
    max_results: z.number().int().min(1).max(1000).default(50),
    include_relations: z.boolean().default(true),
    include_context: z.boolean().default(true),
    search_type: z.enum(['semantic', 'keyword', 'hybrid']).default('hybrid'),
    boost_factors: z.record(z.number()).optional()
});

export const SearchResultSchema = z.object({
    entity: MemoryEntitySchema,
    relations: z.array(MemoryRelationSchema).default([]),
    score: z.number().min(0).max(1),
    explanation: z.string().optional(),
    context_snippet: z.string().optional()
});

export const SearchResponseSchema = z.object({
    query: SearchQuerySchema,
    results: z.array(SearchResultSchema),
    total_count: z.number().int().min(0),
    search_time: z.number().min(0),
    suggestions: z.array(z.string()).default([]),
    related_queries: z.array(z.string()).default([])
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// ============================================================================
// ANALYTICS & INSIGHTS SYSTEM
// ============================================================================

export const MemoryAnalyticsSchema = z.object({
    id: z.string().uuid(),
    project_id: z.string().optional(),
    user_id: z.string().optional(),
    period_start: z.date(),
    period_end: z.date(),
    metrics: z.object({
        total_entities: z.number().int().min(0),
        total_relations: z.number().int().min(0),
        entity_growth_rate: z.number(),
        relation_growth_rate: z.number(),
        most_active_entity_types: z.array(z.object({
            type: EntityTypeSchema,
            count: z.number().int().min(0)
        })),
        most_common_relations: z.array(z.object({
            type: RelationTypeSchema,
            count: z.number().int().min(0)
        })),
        search_patterns: z.array(z.object({
            query: z.string(),
            frequency: z.number().int().min(0),
            avg_results: z.number().min(0)
        })),
        top_entities: z.array(z.object({
            id: z.string(),
            name: z.string(),
            access_count: z.number().int().min(0),
            connection_count: z.number().int().min(0)
        })),
        memory_efficiency: z.number().min(0).max(1),
        knowledge_density: z.number().min(0),
        graph_connectivity: z.number().min(0).max(1)
    }),
    insights: z.array(z.object({
        type: z.string(),
        description: z.string(),
        confidence: z.number().min(0).max(1),
        actionable: z.boolean()
    })).default([]),
    created_at: z.date().default(() => new Date())
});

export type MemoryAnalytics = z.infer<typeof MemoryAnalyticsSchema>;

// ============================================================================
// API REQUEST/RESPONSE SCHEMAS
// ============================================================================

export const CreateEntityRequestSchema = z.object({
    name: z.string().min(1).max(500),
    entityType: EntityTypeSchema,
    description: z.string().optional(),
    observations: z.array(z.string()).default([]),
    metadata: z.record(z.any()).default({}),
    tags: z.array(z.string()).default([]),
    priority: z.number().int().min(0).max(10).default(5),
    context: z.string().optional(),
    project_id: z.string().optional()
});

export const UpdateEntityRequestSchema = CreateEntityRequestSchema.partial().extend({
    id: z.string().uuid()
});

export const CreateRelationRequestSchema = z.object({
    from_entity_id: z.string().uuid(),
    to_entity_id: z.string().uuid(),
    relation_type: RelationTypeSchema,
    description: z.string().optional(),
    metadata: z.record(z.any()).default({}),
    weight: z.number().min(0).max(1).default(1),
    bidirectional: z.boolean().default(false),
    context: z.string().optional()
});

export const BulkOperationRequestSchema = z.object({
    entities: z.array(CreateEntityRequestSchema).default([]),
    relations: z.array(CreateRelationRequestSchema).default([]),
    updates: z.array(UpdateEntityRequestSchema).default([]),
    deletions: z.array(z.string().uuid()).default([])
});

export type CreateEntityRequest = z.infer<typeof CreateEntityRequestSchema>;
export type UpdateEntityRequest = z.infer<typeof UpdateEntityRequestSchema>;
export type CreateRelationRequest = z.infer<typeof CreateRelationRequestSchema>;
export type BulkOperationRequest = z.infer<typeof BulkOperationRequestSchema>;

// ============================================================================
// EXPORT ALL SCHEMAS FOR VALIDATION
// ============================================================================

// ============================================================================
// ADDITIONAL TYPES FOR ULTIMATE MEMORY ENGINE
// ============================================================================

export const MemoryConfigSchema = z.object({
    maxEntities: z.number().int().min(0).default(100000),
    maxRelations: z.number().int().min(0).default(500000),
    enableVectorSearch: z.boolean().default(true),
    enableRealTimeSync: z.boolean().default(true),
    enableAnalytics: z.boolean().default(true),
    cleanupInterval: z.number().int().min(0).default(3600000), // 1 hour
    maxAccessLogSize: z.number().int().min(0).default(10000),
    cacheSize: z.number().int().min(0).default(1000),
    vectorDimensions: z.number().int().min(0).default(1536),
    embeddingProvider: z.string().default('openai'),
    persistentStorage: z.boolean().default(true),
    storageBackend: z.enum(['memory', 'firebase', 'postgresql']).default('memory'),
    encryptionEnabled: z.boolean().default(false),
    compressionEnabled: z.boolean().default(true)
});

export const MemoryQuerySchema = z.object({
    text: z.string().optional(),
    embedding: z.array(z.number()).optional(),
    entityTypes: z.array(EntityTypeSchema).optional(),
    relationTypes: z.array(RelationTypeSchema).optional(),
    tags: z.array(z.string()).optional(),
    project_id: z.string().optional(),
    user_id: z.string().optional(),
    timeRange: z.object({
        start: z.date(),
        end: z.date()
    }).optional(),
    metadata: z.record(z.any()).optional(),
    minScore: z.number().min(0).max(1).default(0),
    maxResults: z.number().int().min(1).max(1000).default(50)
});

export const MemoryResultSchema = z.object({
    entity: MemoryEntitySchema,
    score: z.number().min(0).max(1),
    snippet: z.string(),
    relations: z.array(MemoryRelationSchema).default([]),
    metadata: z.record(z.any()).default({})
});

export const MemorySearchOptionsSchema = z.object({
    sortBy: z.enum(['relevance', 'created_at', 'updated_at', 'accessed_at', 'access_count', 'priority', 'confidence']).default('relevance'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    offset: z.number().int().min(0).default(0),
    limit: z.number().int().min(1).max(1000).default(50),
    includeArchived: z.boolean().default(false),
    includeRelations: z.boolean().default(true),
    fuzzySearch: z.boolean().default(true),
    expandResults: z.boolean().default(false)
});

export const VectorSearchOptionsSchema = z.object({
    limit: z.number().int().min(1).max(1000).default(10),
    threshold: z.number().min(0).max(1).default(0.7),
    algorithm: z.enum(['cosine', 'euclidean', 'manhattan']).default('cosine'),
    includeMetadata: z.boolean().default(true)
});

export const MemoryCreateRequestSchema = z.object({
    name: z.string().min(1).max(500),
    entityType: EntityTypeSchema,
    description: z.string().optional(),
    observations: z.array(z.string()).default([]),
    metadata: z.record(z.any()).default({}),
    tags: z.array(z.string()).default([]),
    priority: z.number().int().min(0).max(10).default(5),
    confidence: z.number().min(0).max(1).default(1),
    source: z.string().optional(),
    context: z.string().optional(),
    embedding: z.array(z.number()).optional(),
    project_id: z.string().optional(),
    user_id: z.string().optional(),
    session_id: z.string().optional()
});

export const MemoryUpdateRequestSchema = MemoryCreateRequestSchema.partial();

export const AgentContextSchema = z.object({
    agentId: z.string(),
    sessionId: z.string().optional(),
    userId: z.string().optional(),
    projectId: z.string().optional(),
    capabilities: z.array(z.string()).default([]),
    preferences: z.record(z.any()).default({}),
    timestamp: z.date().default(() => new Date())
});

export const MemoryMetricsSchema = z.object({
    totalEntities: z.number().int().min(0),
    totalRelations: z.number().int().min(0),
    totalConversations: z.number().int().min(0),
    avgQueryTime: z.number().min(0),
    cacheHitRate: z.number().min(0).max(1),
    memoryUsage: z.number().min(0),
    lastUpdated: z.date()
});

export const KnowledgeGraphSchema = z.object({
    entities: z.array(MemoryEntitySchema),
    relations: z.array(MemoryRelationSchema),
    metadata: z.object({
        totalNodes: z.number().int().min(0),
        totalEdges: z.number().int().min(0),
        depth: z.number().int().min(0),
        generated_at: z.date(),
        project_id: z.string().optional()
    })
});

export const MemoryConversationSchema = z.object({
    id: z.string(),
    agent_id: z.string(),
    project_id: z.string().optional(),
    messages: z.array(z.object({
        id: z.string(),
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
        timestamp: z.date(),
        context_entity_ids: z.array(z.string()).default([])
    })).default([]),
    context_entities: z.array(z.string()).default([]),
    metadata: z.record(z.any()).default({}),
    started_at: z.date(),
    last_activity: z.date(),
    status: z.enum(['active', 'paused', 'ended']).default('active')
});

export const MemoryProjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    entity_count: z.number().int().min(0).default(0),
    relation_count: z.number().int().min(0).default(0),
    created_at: z.date(),
    updated_at: z.date(),
    settings: z.record(z.any()).default({})
});

// Export all types
export type MemoryConfig = z.infer<typeof MemoryConfigSchema>;
export type MemoryQuery = z.infer<typeof MemoryQuerySchema>;
export type MemoryResult = z.infer<typeof MemoryResultSchema>;
export type MemorySearchOptions = z.infer<typeof MemorySearchOptionsSchema>;
export type VectorSearchOptions = z.infer<typeof VectorSearchOptionsSchema>;
export type MemoryCreateRequest = z.infer<typeof MemoryCreateRequestSchema>;
export type MemoryUpdateRequest = z.infer<typeof MemoryUpdateRequestSchema>;
export type AgentContext = z.infer<typeof AgentContextSchema>;
export type MemoryMetrics = z.infer<typeof MemoryMetricsSchema>;
export type KnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;
export type MemoryConversation = z.infer<typeof MemoryConversationSchema>;
export type MemoryProject = z.infer<typeof MemoryProjectSchema>;

export const MemorySchemas = {
    Entity: MemoryEntitySchema,
    Relation: MemoryRelationSchema,
    Conversation: ConversationSchema,
    ConversationMessage: ConversationMessageSchema,
    Project: ProjectSchema,
    CodeAnalysis: CodeAnalysisSchema,
    SearchQuery: SearchQuerySchema,
    SearchResult: SearchResultSchema,
    SearchResponse: SearchResponseSchema,
    MemoryAnalytics: MemoryAnalyticsSchema,
    CreateEntityRequest: CreateEntityRequestSchema,
    UpdateEntityRequest: UpdateEntityRequestSchema,
    CreateRelationRequest: CreateRelationRequestSchema,
    BulkOperationRequest: BulkOperationRequestSchema,
    MemoryConfig: MemoryConfigSchema,
    MemoryQuery: MemoryQuerySchema,
    MemoryResult: MemoryResultSchema,
    MemorySearchOptions: MemorySearchOptionsSchema,
    VectorSearchOptions: VectorSearchOptionsSchema,
    MemoryCreateRequest: MemoryCreateRequestSchema,
    MemoryUpdateRequest: MemoryUpdateRequestSchema,
    AgentContext: AgentContextSchema,
    MemoryMetrics: MemoryMetricsSchema,
    KnowledgeGraph: KnowledgeGraphSchema,
    MemoryConversation: MemoryConversationSchema,
    MemoryProject: MemoryProjectSchema
} as const;
