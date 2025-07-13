/**
 * Ultimate Memory Engine - Fixed Implementation
 * The most advanced memory system for AI coding agents
 */

import { EventEmitter } from 'node:events';
import type {
    AgentContext,
    KnowledgeGraph,
    MemoryAnalytics,
    MemoryConversation,
    MemoryCreateRequest,
    MemoryEntity,
    MemoryMetrics,
    MemoryProject,
    MemoryQuery,
    MemoryRelation,
    MemoryResult,
    MemorySearchOptions,
    MemoryUpdateRequest,
    RelationType,
    VectorSearchOptions
} from '../types/memory';

export interface MemoryEngineEvents {
    entityCreated: [entity: MemoryEntity];
    entityUpdated: [entity: MemoryEntity, previous: MemoryEntity];
    entityDeleted: [entityId: string];
    relationCreated: [relation: MemoryRelation];
    relationDeleted: [relationId: string];
    conversationStarted: [conversation: MemoryConversation];
    conversationEnded: [conversationId: string];
    memoryAccessed: [entityId: string, context: AgentContext];
    analyticsUpdated: [analytics: MemoryAnalytics];
    error: [error: Error, context?: string];
}

/**
 * Ultimate Memory Engine
 * The most advanced memory system for AI coding agents
 */
export class UltimateMemoryEngine extends EventEmitter {
    private entities: Map<string, MemoryEntity> = new Map();
    private relations: Map<string, MemoryRelation> = new Map();
    private conversations: Map<string, MemoryConversation> = new Map();
    private projects: Map<string, MemoryProject> = new Map();
    private analytics: MemoryAnalytics;
    private searchIndex: Map<string, string[]> = new Map();
    private vectorIndex: Map<string, number[]> = new Map();
    private accessLog: Array<{ entityId: string; timestamp: Date; context: AgentContext; }> = [];
    private performanceMetrics: MemoryMetrics = {
        totalEntities: 0,
        totalRelations: 0,
        totalConversations: 0,
        avgQueryTime: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        lastUpdated: new Date()
    };    constructor() {
        super();
        this.analytics = {
            id: this.generateId(),
            period_start: new Date(),
            period_end: new Date(Date.now() + 24 * 60 * 60 * 1000),
            metrics: {
                total_entities: 0,
                total_relations: 0,
                entity_growth_rate: 0,
                relation_growth_rate: 0,
                most_active_entity_types: [],
                most_common_relations: [],
                search_patterns: [],
                top_entities: [],
                memory_efficiency: 1.0,
                knowledge_density: 0,
                graph_connectivity: 0
            },
            insights: [],
            created_at: new Date()
        };

        this.setupCleanupTasks();
    }

    // ============================================================================
    // CORE MEMORY OPERATIONS
    // ============================================================================

    /**
     * Create a new memory entity with advanced features
     */
    async createEntity(request: MemoryCreateRequest): Promise<MemoryEntity> {
        const startTime = Date.now();

        try {
            const entity: MemoryEntity = {
                id: this.generateId(),
                name: request.name,
                entityType: request.entityType,
                description: request.description,
                observations: request.observations || [],
                metadata: request.metadata || {},
                tags: request.tags || [],
                priority: request.priority || 5,
                confidence: request.confidence || 1,
                source: request.source,
                context: request.context,
                embedding: request.embedding,
                created_at: new Date(),
                updated_at: new Date(),
                accessed_at: new Date(),
                access_count: 0,
                version: 1,
                archived: false,
                project_id: request.project_id,
                user_id: request.user_id,
                session_id: request.session_id
            };

            // Store entity
            this.entities.set(entity.id, entity);

            // Update search index
            this.updateSearchIndex(entity);

            // Update vector index if embedding provided
            if (entity.embedding) {
                this.vectorIndex.set(entity.id, entity.embedding);
            }

            // Update analytics
            this.updateAnalytics('entityCreated', entity);

            // Update performance metrics
            this.updatePerformanceMetrics('create', Date.now() - startTime);

            // Emit event
            this.emit('entityCreated', entity);

            return entity;
        } catch (error) {
            this.emit('error', error as Error, 'createEntity');
            throw error;
        }
    }

    /**
     * Update an existing memory entity
     */
    async updateEntity(id: string, request: MemoryUpdateRequest): Promise<MemoryEntity> {
        const startTime = Date.now();

        try {
            const existing = this.entities.get(id);
            if (!existing) {
                throw new Error(`Entity not found: ${id}`);
            }

            const previous = { ...existing }; const updated: MemoryEntity = {
                ...existing,
                ...request,
                id, // Ensure ID doesn't change
                updated_at: new Date(),
                version: existing.version + 1,
                // Ensure required fields are properly handled
                name: request.name || existing.name,
                entityType: request.entityType || existing.entityType,
                priority: request.priority ?? existing.priority,
                confidence: request.confidence ?? existing.confidence,
                observations: request.observations || existing.observations,
                metadata: request.metadata || existing.metadata,
                tags: request.tags || existing.tags,
                created_at: existing.created_at,
                accessed_at: existing.accessed_at,
                access_count: existing.access_count,
                archived: existing.archived
            };

            // Store updated entity
            this.entities.set(id, updated);

            // Update search index
            this.updateSearchIndex(updated);

            // Update vector index if embedding provided
            if (updated.embedding) {
                this.vectorIndex.set(id, updated.embedding);
            }

            // Update analytics
            this.updateAnalytics('entityUpdated', updated);

            // Update performance metrics
            this.updatePerformanceMetrics('update', Date.now() - startTime);

            // Emit event
            this.emit('entityUpdated', updated, previous);

            return updated;
        } catch (error) {
            this.emit('error', error as Error, 'updateEntity');
            throw error;
        }
    }

    /**
     * Delete a memory entity and its relations
     */
    async deleteEntity(id: string): Promise<boolean> {
        const startTime = Date.now();

        try {
            const entity = this.entities.get(id);
            if (!entity) {
                return false;
            }

            // Remove entity
            this.entities.delete(id);

            // Remove from search index
            this.removeFromSearchIndex(id);

            // Remove from vector index
            this.vectorIndex.delete(id);

            // Remove related relations
            const relationsToDelete = Array.from(this.relations.values()).filter(
                r => r.from_entity_id === id || r.to_entity_id === id
            );

            for (const relation of relationsToDelete) {
                this.relations.delete(relation.id);
                this.emit('relationDeleted', relation.id);
            }

            // Update analytics
            this.updateAnalytics('entityDeleted', entity);

            // Update performance metrics
            this.updatePerformanceMetrics('delete', Date.now() - startTime);

            // Emit event
            this.emit('entityDeleted', id);

            return true;
        } catch (error) {
            this.emit('error', error as Error, 'deleteEntity');
            throw error;
        }
    }

    /**
     * Get entity by ID with access tracking
     */
    async getEntity(id: string, context?: AgentContext): Promise<MemoryEntity | null> {
        const startTime = Date.now();

        try {
            const entity = this.entities.get(id);
            if (!entity) {
                return null;
            }

            // Update access tracking
            entity.accessed_at = new Date();
            entity.access_count++;

            if (context) {
                this.accessLog.push({ entityId: id, timestamp: new Date(), context });
                this.emit('memoryAccessed', id, context);
            }

            // Update performance metrics
            this.updatePerformanceMetrics('read', Date.now() - startTime);

            return entity;
        } catch (error) {
            this.emit('error', error as Error, 'getEntity');
            throw error;
        }
    }

    // ============================================================================
    // ADVANCED SEARCH & QUERY
    // ============================================================================

    /**
     * Advanced memory search with multiple strategies
     */
    async search(query: MemoryQuery, options: Partial<MemorySearchOptions> = {}): Promise<MemoryResult[]> {
        const startTime = Date.now();

        try {
            // Set default options
            const searchOptions: MemorySearchOptions = {
                sortBy: 'relevance',
                sortOrder: 'desc',
                offset: 0,
                limit: 50,
                includeArchived: false,
                includeRelations: true,
                fuzzySearch: true,
                expandResults: false,
                ...options
            };

            let results: MemoryEntity[] = [];

            // Text search
            if (query.text) {
                const textResults = this.performTextSearch(query.text, searchOptions);
                results.push(...textResults);
            }

            // Vector search
            if (query.embedding) {
                const vectorOptions: VectorSearchOptions = {
                    limit: searchOptions.limit,
                    threshold: 0.7,
                    algorithm: 'cosine',
                    includeMetadata: true
                };
                const vectorResults = await this.performVectorSearch(query.embedding, vectorOptions);
                results.push(...vectorResults);
            }

            // Filter by type
            if (query.entityTypes?.length) {
                results = results.filter(e => query.entityTypes!.includes(e.entityType));
            }

            // Filter by tags
            if (query.tags?.length) {
                results = results.filter(e =>
                    query.tags!.some((tag: string) => e.tags.includes(tag))
                );
            }

            // Filter by project
            if (query.project_id) {
                results = results.filter(e => e.project_id === query.project_id);
            }

            // Filter by user
            if (query.user_id) {
                results = results.filter(e => e.user_id === query.user_id);
            }

            // Filter by time range
            if (query.timeRange) {
                results = results.filter(e => {
                    const timestamp = searchOptions.sortBy === 'accessed_at' ? e.accessed_at :
                        searchOptions.sortBy === 'updated_at' ? e.updated_at : e.created_at;
                    return timestamp >= query.timeRange!.start && timestamp <= query.timeRange!.end;
                });
            }

            // Sort results
            this.sortResults(results, searchOptions);

            // Apply pagination
            const { offset = 0, limit = 50 } = searchOptions;
            const paginatedResults = results.slice(offset, offset + limit);

            // Convert to MemoryResult format
            const memoryResults: MemoryResult[] = paginatedResults.map(entity => ({
                entity,
                score: this.calculateRelevanceScore(entity, query),
                snippet: this.generateSnippet(entity, query),
                relations: this.getEntityRelations(entity.id),
                metadata: {
                    rank: results.indexOf(entity) + 1,
                    totalMatches: results.length,
                    searchTime: Date.now() - startTime,
                    searchStrategy: this.getSearchStrategy(query)
                }
            }));

            // Update analytics
            this.updateQueryAnalytics(query, memoryResults, Date.now() - startTime);

            return memoryResults;
        } catch (error) {
            this.emit('error', error as Error, 'search');
            throw error;
        }
    }

    /**
     * Advanced vector similarity search
     */
    async performVectorSearch(queryEmbedding: number[], options: Partial<VectorSearchOptions> = {}): Promise<MemoryEntity[]> {
        const searchOptions: VectorSearchOptions = {
            limit: 10,
            threshold: 0.7,
            algorithm: 'cosine',
            includeMetadata: true,
            ...options
        };

        const similarities: Array<{ id: string; score: number; }> = [];

        for (const [entityId, embedding] of this.vectorIndex) {
            const similarity = this.calculateCosineSimilarity(queryEmbedding, embedding);
            if (similarity >= searchOptions.threshold) {
                similarities.push({ id: entityId, score: similarity });
            }
        }

        // Sort by similarity score
        similarities.sort((a, b) => b.score - a.score);

        // Get top results
        const topSimilarities = similarities.slice(0, searchOptions.limit);
        const results: MemoryEntity[] = [];

        for (const { id } of topSimilarities) {
            const entity = this.entities.get(id);
            if (entity) {
                results.push(entity);
            }
        }

        return results;
    }

    // ============================================================================
    // KNOWLEDGE GRAPH OPERATIONS
    // ============================================================================

    /**
     * Create a relation between entities
     */
    async createRelation(
        sourceId: string,
        targetId: string,
        relationType: RelationType,
        metadata: Record<string, any> = {}
    ): Promise<MemoryRelation> {
        try {
            const sourceEntity = this.entities.get(sourceId);
            const targetEntity = this.entities.get(targetId);

            if (!sourceEntity || !targetEntity) {
                throw new Error('Source or target entity not found');
            } const relation: MemoryRelation = {
                id: this.generateId(),
                from_entity_id: sourceId,
                to_entity_id: targetId,
                relation_type: relationType,
                description: metadata['description'] as string,
                metadata: { ...metadata, strength: metadata['strength'] || 1.0 },
                weight: (metadata['weight'] as number) || 1.0,
                confidence: (metadata['confidence'] as number) || 1.0,
                bidirectional: (metadata['bidirectional'] as boolean) || false,
                context: metadata['context'] as string,
                created_at: new Date(),
                updated_at: new Date(),
                version: 1,
                archived: false,
                project_id: sourceEntity.project_id,
                user_id: sourceEntity.user_id
            };

            this.relations.set(relation.id, relation);
            this.updateAnalytics('relationCreated', relation);
            this.emit('relationCreated', relation);

            return relation;
        } catch (error) {
            this.emit('error', error as Error, 'createRelation');
            throw error;
        }
    }

    /**
     * Get the complete knowledge graph
     */
    async getKnowledgeGraph(projectId?: string, depth: number = 3): Promise<KnowledgeGraph> {
        try {
            let entities = Array.from(this.entities.values());
            let relations = Array.from(this.relations.values());

            if (projectId) {
                entities = entities.filter(e => e.project_id === projectId);
                const entityIds = new Set(entities.map(e => e.id));
                relations = relations.filter(r =>
                    entityIds.has(r.from_entity_id) && entityIds.has(r.to_entity_id)
                );
            }

            return {
                entities,
                relations,
                metadata: {
                    totalNodes: entities.length,
                    totalEdges: relations.length,
                    depth,
                    generated_at: new Date(),
                    project_id: projectId
                }
            };
        } catch (error) {
            this.emit('error', error as Error, 'getKnowledgeGraph');
            throw error;
        }
    }

    /**
     * Find shortest path between two entities
     */
    async findPath(sourceId: string, targetId: string, maxDepth: number = 5): Promise<MemoryEntity[]> {
        try {
            const visited = new Set<string>();
            const queue: Array<{ id: string; path: string[]; }> = [{ id: sourceId, path: [sourceId] }];

            while (queue.length > 0) {
                const { id, path } = queue.shift()!;

                if (id === targetId) {
                    return path.map(entityId => this.entities.get(entityId)!).filter(Boolean);
                }

                if (path.length >= maxDepth || visited.has(id)) {
                    continue;
                }

                visited.add(id);

                // Find connected entities
                const connectedRelations = Array.from(this.relations.values()).filter(
                    r => r.from_entity_id === id || r.to_entity_id === id
                );

                for (const relation of connectedRelations) {
                    const nextId = relation.from_entity_id === id ?
                        relation.to_entity_id : relation.from_entity_id;

                    if (!visited.has(nextId)) {
                        queue.push({ id: nextId, path: [...path, nextId] });
                    }
                }
            }

            return []; // No path found
        } catch (error) {
            this.emit('error', error as Error, 'findPath');
            throw error;
        }
    }

    // ============================================================================
    // CONVERSATION MANAGEMENT
    // ============================================================================

    /**
     * Start a new conversation
     */
    async startConversation(
        agentId: string,
        projectId?: string,
        metadata: Record<string, any> = {}
    ): Promise<MemoryConversation> {
        try {
            const conversation: MemoryConversation = {
                id: this.generateId(),
                agent_id: agentId,
                project_id: projectId,
                messages: [],
                context_entities: [],
                metadata,
                started_at: new Date(),
                last_activity: new Date(),
                status: 'active'
            };

            this.conversations.set(conversation.id, conversation);
            this.updateAnalytics('conversationStarted', conversation);
            this.emit('conversationStarted', conversation);

            return conversation;
        } catch (error) {
            this.emit('error', error as Error, 'startConversation');
            throw error;
        }
    }

    /**
     * Add message to conversation with context tracking
     */
    async addMessage(
        conversationId: string,
        message: string,
        role: 'user' | 'assistant' | 'system',
        contextEntityIds: string[] = []
    ): Promise<MemoryConversation> {
        try {
            const conversation = this.conversations.get(conversationId);
            if (!conversation) {
                throw new Error(`Conversation not found: ${conversationId}`);
            }

            conversation.messages.push({
                id: this.generateId(),
                role,
                content: message,
                timestamp: new Date(),
                context_entity_ids: contextEntityIds
            });

            conversation.context_entities = [
                ...new Set([...conversation.context_entities, ...contextEntityIds])
            ];

            conversation.last_activity = new Date();

            this.conversations.set(conversationId, conversation);
            return conversation;
        } catch (error) {
            this.emit('error', error as Error, 'addMessage');
            throw error;
        }
    }

    // ============================================================================
    // ANALYTICS & MONITORING
    // ============================================================================

    /**
     * Get comprehensive analytics
     */
    async getAnalytics(projectId?: string): Promise<MemoryAnalytics> {
        try {
            // Update real-time metrics
            this.analytics.metrics.total_entities = this.entities.size;
            this.analytics.metrics.total_relations = this.relations.size;

            // Update performance metrics
            this.performanceMetrics.totalEntities = this.entities.size;
            this.performanceMetrics.totalRelations = this.relations.size;
            this.performanceMetrics.totalConversations = this.conversations.size;
            this.performanceMetrics.lastUpdated = new Date();

            if (projectId) {
                return this.getProjectAnalytics(projectId);
            }

            return this.analytics;
        } catch (error) {
            this.emit('error', error as Error, 'getAnalytics');
            throw error;
        }
    }

    /**
     * Get performance metrics
     */
    async getMetrics(): Promise<MemoryMetrics> {
        return { ...this.performanceMetrics };
    }

    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================

    private generateId(): string {
        return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private updateSearchIndex(entity: MemoryEntity): void {
        const searchableText = [
            entity.name,
            entity.description || '',
            ...entity.observations,
            ...entity.tags,
            JSON.stringify(entity.metadata)
        ].join(' ').toLowerCase();

        const tokens = searchableText.split(/\s+/).filter(token => token.length > 2);
        this.searchIndex.set(entity.id, tokens);
    }

    private removeFromSearchIndex(entityId: string): void {
        this.searchIndex.delete(entityId);
    }

    private performTextSearch(query: string, _options: MemorySearchOptions): MemoryEntity[] {
        const queryTokens = query.toLowerCase().split(/\s+/).filter(token => token.length > 2);
        const scores: Array<{ entity: MemoryEntity; score: number; }> = [];

        for (const [entityId, tokens] of this.searchIndex) {
            const entity = this.entities.get(entityId);
            if (!entity || entity.archived) continue;

            let score = 0;
            for (const queryToken of queryTokens) {
                const matches = tokens.filter(token => token.includes(queryToken)).length;
                score += matches;
            }

            if (score > 0) {
                scores.push({ entity, score });
            }
        }

        scores.sort((a, b) => b.score - a.score);
        return scores.map(s => s.entity);
    }

    private calculateCosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0; for (let i = 0; i < a.length; i++) {
            const aVal = a[i] ?? 0;
            const bVal = b[i] ?? 0;
            dotProduct += aVal * bVal;
            normA += aVal * aVal;
            normB += bVal * bVal;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private calculateRelevanceScore(entity: MemoryEntity, query: MemoryQuery): number {
        let score = 0;

        // Text relevance
        if (query.text) {
            const tokens = this.searchIndex.get(entity.id) || [];
            const queryTokens = query.text.toLowerCase().split(/\s+/);
            const matches = queryTokens.filter(qt => tokens.some(t => t.includes(qt))).length;
            score += (matches / queryTokens.length) * 0.4;
        }

        // Recency boost
        const daysSinceUpdate = (Date.now() - entity.updated_at.getTime()) / (1000 * 60 * 60 * 24);
        score += Math.max(0, (30 - daysSinceUpdate) / 30) * 0.2;

        // Access frequency boost
        score += Math.min(entity.access_count / 100, 1) * 0.2;

        // Priority boost
        score += (entity.priority / 10) * 0.1;

        // Confidence boost
        score += entity.confidence * 0.1;

        return Math.min(score, 1);
    }

    private generateSnippet(entity: MemoryEntity, query: MemoryQuery): string {
        const text = [entity.description, ...entity.observations].join(' ');
        if (!query.text || text.length <= 200) return text.substring(0, 200);

        const queryTokens = query.text.toLowerCase().split(/\s+/);
        const words = text.split(/\s+/);

        let bestIndex = 0;
        let maxMatches = 0;

        for (let i = 0; i < words.length - 50; i++) {
            const window = words.slice(i, i + 50).join(' ').toLowerCase();
            const matches = queryTokens.filter(token => window.includes(token)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                bestIndex = i;
            }
        }

        return words.slice(bestIndex, bestIndex + 50).join(' ') + '...';
    }

    private getEntityRelations(entityId: string): MemoryRelation[] {
        return Array.from(this.relations.values()).filter(
            r => r.from_entity_id === entityId || r.to_entity_id === entityId
        );
    }

    private getSearchStrategy(query: MemoryQuery): string {
        const strategies: string[] = [];
        if (query.text) strategies.push('text');
        if (query.embedding) strategies.push('vector');
        if (query.entityTypes?.length) strategies.push('type-filter');
        if (query.tags?.length) strategies.push('tag-filter');
        return strategies.join('+');
    }

    private sortResults(results: MemoryEntity[], options: MemorySearchOptions): void {
        const { sortBy = 'relevance', sortOrder = 'desc' } = options;

        results.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'created_at':
                    comparison = a.created_at.getTime() - b.created_at.getTime();
                    break;
                case 'updated_at':
                    comparison = a.updated_at.getTime() - b.updated_at.getTime();
                    break;
                case 'accessed_at':
                    comparison = a.accessed_at.getTime() - b.accessed_at.getTime();
                    break;
                case 'access_count':
                    comparison = a.access_count - b.access_count;
                    break;
                case 'priority':
                    comparison = a.priority - b.priority;
                    break;
                case 'confidence':
                    comparison = a.confidence - b.confidence;
                    break;
                default: // relevance
                    comparison = 0; // Will be handled by search scoring
            }

            return sortOrder === 'desc' ? -comparison : comparison;
        });
    }

    private updateAnalytics(operation: string, _data: any): void {
        // Add to insights
        this.analytics.insights.unshift({
            type: operation,
            description: `Operation: ${operation}`,
            confidence: 1.0,
            actionable: false
        });

        // Keep only recent 100 activities
        this.analytics.insights = this.analytics.insights.slice(0, 100);

        this.emit('analyticsUpdated', this.analytics);
    }

    private updateQueryAnalytics(query: MemoryQuery, results: MemoryResult[], _responseTime: number): void {
        // Update search patterns
        if (query.text) {
            const existingPattern = this.analytics.metrics.search_patterns.find(p => p.query === query.text);
            if (existingPattern) {
                existingPattern.frequency++;
                existingPattern.avg_results = (existingPattern.avg_results + results.length) / 2;
            } else {
                this.analytics.metrics.search_patterns.push({
                    query: query.text,
                    frequency: 1,
                    avg_results: results.length
                });
            }
        }
    }

    private updatePerformanceMetrics(_operation: string, duration: number): void {
        this.performanceMetrics.avgQueryTime =
            (this.performanceMetrics.avgQueryTime + duration) / 2;
        this.performanceMetrics.memoryUsage = this.calculateTotalMemoryUsage();
        this.performanceMetrics.lastUpdated = new Date();
    }

    private calculateTotalMemoryUsage(): number {
        // Rough estimation of memory usage in bytes
        return (
            this.entities.size * 1024 +
            this.relations.size * 256 +
            (this.searchIndex.size + this.vectorIndex.size) * 512
        );
    }

    private getProjectAnalytics(projectId: string): MemoryAnalytics {
        const projectEntities = Array.from(this.entities.values()).filter(
            e => e.project_id === projectId
        );
        const projectRelations = Array.from(this.relations.values()).filter(
            r => r.project_id === projectId
        );

        return {
            ...this.analytics,
            metrics: {
                ...this.analytics.metrics,
                total_entities: projectEntities.length,
                total_relations: projectRelations.length
            },
            project_id: projectId
        };
    }

    private setupCleanupTasks(): void {
        // Cleanup old access logs every hour
        setInterval(() => {
            const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
            this.accessLog = this.accessLog.filter(log => log.timestamp > cutoff);
        }, 60 * 60 * 1000);
    }

    /**
     * Close the memory engine and cleanup resources
     */
    async close(): Promise<void> {
        this.removeAllListeners();
        this.entities.clear();
        this.relations.clear();
        this.conversations.clear();
        this.projects.clear();
        this.searchIndex.clear();
        this.vectorIndex.clear();
        this.accessLog.length = 0;
    }
}
