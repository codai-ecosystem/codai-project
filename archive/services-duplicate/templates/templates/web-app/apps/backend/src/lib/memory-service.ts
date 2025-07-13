/**
 * Ultimate Memory Service - Enterprise-Grade Memory Management
 * Provides high-level memory operations with caching, security, and optimization
 */

import type {
    AgentContext,
    EntityType,
    KnowledgeGraph,
    MemoryConfig,
    MemoryCreateRequest,
    MemoryEntity,
    MemoryMetrics,
    MemoryQuery,
    MemoryRelation,
    MemoryResult,
    MemorySearchOptions,
    MemoryUpdateRequest,
    RelationType
} from '../types/memory';
import { UltimateMemoryEngine } from './memory-engine';

export interface MemoryServiceConfig extends MemoryConfig {
    enableCache: boolean;
    cacheSize: number;
    cacheTTL: number;
    enableSecurityAudit: boolean;
    maxRequestsPerMinute: number;
    enableCompression: boolean;
    enableEncryption: boolean;
}

export interface MemoryOperationResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metadata: {
        operationId: string;
        timestamp: Date;
        executionTime: number;
        cacheHit?: boolean;
        securityAudit?: boolean;
    };
}

export interface BulkOperationRequest {
    entities?: MemoryCreateRequest[];
    relations?: Array<{
        sourceId: string;
        targetId: string;
        relationType: RelationType;
        metadata?: Record<string, any>;
    }>;
    updates?: Array<{ id: string; request: MemoryUpdateRequest; }>;
    deletions?: string[];
}

export interface MemoryInsight {
    type: 'pattern' | 'anomaly' | 'recommendation' | 'optimization';
    title: string;
    description: string;
    confidence: number;
    actionable: boolean;
    priority: 'low' | 'medium' | 'high' | 'critical';
    data?: Record<string, any>;
}

/**
 * Ultimate Memory Service
 * Enterprise-grade memory management with advanced features
 */
export class UltimateMemoryService {
    private engine: UltimateMemoryEngine;
    private cache: Map<string, { data: any; timestamp: Date; ttl: number; }> = new Map();
    private rateLimiter: Map<string, { count: number; resetTime: Date; }> = new Map();
    private auditLog: Array<{
        operation: string;
        userId?: string;
        timestamp: Date;
        success: boolean;
        details: Record<string, any>;
    }> = [];

    constructor(private config: MemoryServiceConfig) {
        this.engine = new UltimateMemoryEngine(config);
        this.setupEventListeners();
        this.setupCleanupTasks();
    }

    // ============================================================================
    // ENHANCED CORE OPERATIONS
    // ============================================================================

    /**
     * Create entity with enhanced validation and caching
     */
    async createEntity(
        request: MemoryCreateRequest,
        context?: AgentContext
    ): Promise<MemoryOperationResult<MemoryEntity>> {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        try {
            // Rate limiting
            if (context?.userId && !this.checkRateLimit(context.userId)) {
                throw new Error('Rate limit exceeded');
            }

            // Input validation
            this.validateEntityRequest(request);

            // Security audit
            if (this.config.enableSecurityAudit && context) {
                await this.auditOperation('createEntity', context, request);
            }

            // Create entity
            const entity = await this.engine.createEntity(request);

            // Cache the result
            if (this.config.enableCache) {
                this.setCacheItem(`entity:${entity.id}`, entity, this.config.cacheTTL);
            }

            const result: MemoryOperationResult<MemoryEntity> = {
                success: true,
                data: entity,
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime,
                    securityAudit: this.config.enableSecurityAudit
                }
            };

            this.logAudit('createEntity', context?.userId, true, { entityId: entity.id });
            return result;

        } catch (error) {
            const result: MemoryOperationResult<MemoryEntity> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

            this.logAudit('createEntity', context?.userId, false, { error: result.error });
            return result;
        }
    }

    /**
     * Get entity by ID with caching and rate limiting
     */
    async getEntity(
        id: string,
        context?: AgentContext
    ): Promise<MemoryOperationResult<MemoryEntity | null>> {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        try {
            // Rate limiting
            if (context?.userId && !this.checkRateLimit(context.userId)) {
                throw new Error('Rate limit exceeded');
            }

            // Check cache first
            if (this.config.enableCache) {
                const cached = this.getCacheItem(`entity:${id}`);
                if (cached) {
                    return {
                        success: true,
                        data: cached,
                        metadata: {
                            operationId,
                            timestamp: new Date(),
                            executionTime: Date.now() - startTime,
                            cacheHit: true
                        }
                    };
                }
            }

            // Security audit
            if (this.config.enableSecurityAudit && context) {
                await this.auditOperation('getEntity', context, { id });
            }

            // Get entity from engine
            const entity = await this.engine.getEntity(id, context);

            // Cache the result if found
            if (entity && this.config.enableCache) {
                this.setCacheItem(`entity:${id}`, entity, this.config.cacheTTL);
            }

            const result: MemoryOperationResult<MemoryEntity | null> = {
                success: true,
                data: entity,
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime,
                    cacheHit: false,
                    securityAudit: this.config.enableSecurityAudit
                }
            };

            this.logAudit('getEntity', context?.userId, true, { entityId: id, found: !!entity });
            return result;

        } catch (error) {
            const result: MemoryOperationResult<MemoryEntity | null> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

            this.logAudit('getEntity', context?.userId, false, { error: result.error });
            return result;
        }
    }

    /**
     * Update entity with enhanced validation and caching
     */
    async updateEntity(
        id: string,
        request: MemoryUpdateRequest,
        context?: AgentContext
    ): Promise<MemoryOperationResult<MemoryEntity>> {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        try {      // Rate limiting
            if (context?.userId && !this.checkRateLimit(context.userId)) {
                throw new Error('Rate limit exceeded');
            }

            // Security audit
            if (this.config.enableSecurityAudit && context) {
                await this.auditOperation('updateEntity', context, { id, request });
            }

            // Update entity
            const entity = await this.engine.updateEntity(id, request);

            // Update cache
            if (this.config.enableCache) {
                this.setCacheItem(`entity:${id}`, entity, this.config.cacheTTL);
                this.invalidateSearchCache(); // Invalidate search cache
            }

            const result: MemoryOperationResult<MemoryEntity> = {
                success: true,
                data: entity,
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime,
                    securityAudit: this.config.enableSecurityAudit
                }
            };

            this.logAudit('updateEntity', context?.userId, true, { entityId: id });
            return result;

        } catch (error) {
            const result: MemoryOperationResult<MemoryEntity> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

            this.logAudit('updateEntity', context?.userId, false, { error: result.error });
            return result;
        }
    }

    /**
     * Delete entity with security audit and cache cleanup
     */
    async deleteEntity(
        id: string,
        context?: AgentContext
    ): Promise<MemoryOperationResult<boolean>> {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        try {
            // Rate limiting
            if (context?.userId && !this.checkRateLimit(context.userId)) {
                throw new Error('Rate limit exceeded');
            }

            // Security audit
            if (this.config.enableSecurityAudit && context) {
                await this.auditOperation('deleteEntity', context, { id });
            }

            // Delete entity
            const deleted = await this.engine.deleteEntity(id);

            // Remove from cache
            if (this.config.enableCache) {
                this.cache.delete(`entity:${id}`);
                this.invalidateSearchCache(); // Invalidate search cache
            }

            const result: MemoryOperationResult<boolean> = {
                success: true,
                data: deleted,
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime,
                    securityAudit: this.config.enableSecurityAudit
                }
            };

            this.logAudit('deleteEntity', context?.userId, true, { entityId: id, deleted });
            return result;

        } catch (error) {
            const result: MemoryOperationResult<boolean> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

            this.logAudit('deleteEntity', context?.userId, false, { error: result.error });
            return result;
        }
    }

    /**
     * Create relation between entities
     */
    async createRelation(
        sourceId: string,
        targetId: string,
        relationType: RelationType,
        metadata: Record<string, any> = {},
        context?: AgentContext
    ): Promise<MemoryOperationResult<MemoryRelation>> {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        try {
            // Rate limiting
            if (context?.userId && !this.checkRateLimit(context.userId)) {
                throw new Error('Rate limit exceeded');
            }

            // Security audit
            if (this.config.enableSecurityAudit && context) {
                await this.auditOperation('createRelation', context, { sourceId, targetId, relationType });
            }

            // Create relation
            const relation = await this.engine.createRelation(sourceId, targetId, relationType, metadata);

            // Invalidate relevant cache entries
            if (this.config.enableCache) {
                this.invalidateSearchCache();
                this.cache.delete(`entity:${sourceId}`);
                this.cache.delete(`entity:${targetId}`);
            }

            const result: MemoryOperationResult<MemoryRelation> = {
                success: true,
                data: relation,
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime,
                    securityAudit: this.config.enableSecurityAudit
                }
            };

            this.logAudit('createRelation', context?.userId, true, { relationId: relation.id });
            return result;

        } catch (error) {
            const result: MemoryOperationResult<MemoryRelation> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

            this.logAudit('createRelation', context?.userId, false, { error: result.error });
            return result;
        }
    }

    /**
     * Clear cache
     */
    async clearCache(): Promise<void> {
        this.cache.clear();
    }

    /**
     * Advanced search with caching and optimization
     */
    async search(
        query: MemoryQuery,
        options: Partial<MemorySearchOptions> = {},
        context?: AgentContext
    ): Promise<MemoryOperationResult<MemoryResult[]>> {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        try {
            // Generate cache key
            const cacheKey = this.generateCacheKey('search', query, options);

            // Check cache first
            if (this.config.enableCache) {
                const cached = this.getCacheItem(cacheKey);
                if (cached) {
                    return {
                        success: true,
                        data: cached,
                        metadata: {
                            operationId,
                            timestamp: new Date(),
                            executionTime: Date.now() - startTime,
                            cacheHit: true
                        }
                    };
                }
            }

            // Rate limiting
            if (context?.userId && !this.checkRateLimit(context.userId)) {
                throw new Error('Rate limit exceeded');
            }

            // Execute search
            const results = await this.engine.search(query, options);

            // Cache results
            if (this.config.enableCache) {
                this.setCacheItem(cacheKey, results, this.config.cacheTTL);
            }

            const result: MemoryOperationResult<MemoryResult[]> = {
                success: true,
                data: results,
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime,
                    cacheHit: false
                }
            };

            this.logAudit('search', context?.userId, true, {
                queryType: this.getQueryType(query),
                resultCount: results.length
            });

            return result;

        } catch (error) {
            const result: MemoryOperationResult<MemoryResult[]> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

            this.logAudit('search', context?.userId, false, { error: result.error });
            return result;
        }
    }

    /**
     * Bulk operations with transaction support
     */
    async bulkOperation(
        request: BulkOperationRequest,
        context?: AgentContext
    ): Promise<MemoryOperationResult<{
        entities: MemoryEntity[];
        relations: MemoryRelation[];
        updated: MemoryEntity[];
        deleted: string[];
    }>> {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        try {
            const results = {
                entities: [] as MemoryEntity[],
                relations: [] as MemoryRelation[],
                updated: [] as MemoryEntity[],
                deleted: [] as string[]
            };

            // Create entities
            if (request.entities) {
                for (const entityRequest of request.entities) {
                    const entity = await this.engine.createEntity(entityRequest);
                    results.entities.push(entity);
                }
            }

            // Create relations
            if (request.relations) {
                for (const relationRequest of request.relations) {
                    const relation = await this.engine.createRelation(
                        relationRequest.sourceId,
                        relationRequest.targetId,
                        relationRequest.relationType,
                        relationRequest.metadata || {}
                    );
                    results.relations.push(relation);
                }
            }

            // Update entities
            if (request.updates) {
                for (const updateRequest of request.updates) {
                    const updated = await this.engine.updateEntity(updateRequest.id, updateRequest.request);
                    results.updated.push(updated);
                }
            }

            // Delete entities
            if (request.deletions) {
                for (const entityId of request.deletions) {
                    const deleted = await this.engine.deleteEntity(entityId);
                    if (deleted) {
                        results.deleted.push(entityId);
                    }
                }
            }

            // Invalidate relevant cache entries
            if (this.config.enableCache) {
                this.invalidateSearchCache();
            }

            const result: MemoryOperationResult<typeof results> = {
                success: true,
                data: results,
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

            this.logAudit('bulkOperation', context?.userId, true, {
                entitiesCreated: results.entities.length,
                relationsCreated: results.relations.length,
                entitiesUpdated: results.updated.length,
                entitiesDeleted: results.deleted.length
            });

            return result;

        } catch (error) {
            const result: MemoryOperationResult<any> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

            this.logAudit('bulkOperation', context?.userId, false, { error: result.error });
            return result;
        }
    }

    // ============================================================================
    // KNOWLEDGE GRAPH OPERATIONS
    // ============================================================================

    /**
     * Get enhanced knowledge graph with analytics
     */
    async getKnowledgeGraph(
        projectId?: string,
        options: {
            depth?: number;
            includeAnalytics?: boolean;
            filterByType?: EntityType[];
            minConnections?: number;
        } = {}
    ): Promise<MemoryOperationResult<KnowledgeGraph & { analytics?: any; }>> {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        try {
            const graph = await this.engine.getKnowledgeGraph(projectId, options.depth);

            // Add analytics if requested
            let analytics;
            if (options.includeAnalytics) {
                analytics = await this.generateKnowledgeGraphAnalytics(graph);
            }

            const result: MemoryOperationResult<KnowledgeGraph & { analytics?: any; }> = {
                success: true,
                data: { ...graph, analytics },
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

            return result;

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };
        }
    }

    /**
     * Generate intelligent insights from memory data
     */
    async generateInsights(projectId?: string): Promise<MemoryOperationResult<MemoryInsight[]>> {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        try {
            const insights: MemoryInsight[] = [];

            // Get analytics
            const analytics = await this.engine.getAnalytics(projectId);      // Pattern detection
            if (analytics.metrics.search_patterns.length > 0) {
                const topPattern = analytics.metrics.search_patterns[0];
                if (topPattern) {
                    insights.push({
                        type: 'pattern',
                        title: 'Frequent Search Pattern Detected',
                        description: `The query "${topPattern.query}" is searched ${topPattern.frequency} times with ${topPattern.avg_results.toFixed(1)} average results`,
                        confidence: 0.9,
                        actionable: true,
                        priority: 'medium',
                        data: { pattern: topPattern }
                    });
                }
            }

            // Performance recommendations
            const metrics = await this.engine.getMetrics();
            if (metrics.avgQueryTime > 1000) {
                insights.push({
                    type: 'optimization',
                    title: 'Query Performance Issue',
                    description: `Average query time is ${metrics.avgQueryTime.toFixed(0)}ms. Consider optimizing search indices.`,
                    confidence: 0.95,
                    actionable: true,
                    priority: 'high',
                    data: { avgQueryTime: metrics.avgQueryTime }
                });
            }

            // Memory usage monitoring
            if (metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
                insights.push({
                    type: 'optimization',
                    title: 'High Memory Usage',
                    description: `Memory usage is ${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB. Consider implementing data archiving.`,
                    confidence: 0.8,
                    actionable: true,
                    priority: 'medium',
                    data: { memoryUsage: metrics.memoryUsage }
                });
            }

            return {
                success: true,
                data: insights,
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };
        }
    }

    // ============================================================================
    // ADVANCED FEATURES
    // ============================================================================

    /**
     * Smart entity suggestion based on context
     */
    async suggestEntities(
        context: string,
        projectId?: string,
        limit: number = 5
    ): Promise<MemoryOperationResult<MemoryEntity[]>> {
        const operationId = this.generateOperationId();
        const startTime = Date.now(); try {
            // Search for entities based on context
            const query: MemoryQuery = {
                text: context,
                project_id: projectId,
                maxResults: limit * 2, // Get more to filter
                minScore: 0.1 // Add required field
            };

            const searchResult = await this.engine.search(query, { limit: limit * 2 });

            // Score and rank suggestions
            const suggestions = searchResult
                .map(result => ({
                    entity: result.entity,
                    relevanceScore: result.score,
                    contextMatch: this.calculateContextMatch(result.entity, context)
                }))
                .sort((a, b) => (b.relevanceScore + b.contextMatch) - (a.relevanceScore + a.contextMatch))
                .slice(0, limit)
                .map(suggestion => suggestion.entity);

            return {
                success: true,
                data: suggestions,
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };
        }
    }

    /**
     * Export memory data with encryption
     */
    async exportData(
        projectId?: string,
        format: 'json' | 'csv' | 'yaml' = 'json'
    ): Promise<MemoryOperationResult<string>> {
        const operationId = this.generateOperationId();
        const startTime = Date.now();

        try {
            const graph = await this.engine.getKnowledgeGraph(projectId);
            const analytics = await this.engine.getAnalytics(projectId);

            const exportData = {
                metadata: {
                    exportedAt: new Date(),
                    version: '1.0',
                    projectId,
                    format
                },
                entities: graph.entities,
                relations: graph.relations,
                analytics
            };

            let serializedData: string;
            switch (format) {
                case 'json':
                    serializedData = JSON.stringify(exportData, null, 2);
                    break;
                case 'yaml':
                    // In a real implementation, you'd use a YAML library
                    serializedData = JSON.stringify(exportData, null, 2);
                    break;
                case 'csv':
                    // In a real implementation, you'd convert to CSV format
                    serializedData = this.convertToCSV(exportData);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            // Encrypt if enabled
            if (this.config.enableEncryption) {
                serializedData = await this.encryptData(serializedData);
            }

            return {
                success: true,
                data: serializedData,
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    operationId,
                    timestamp: new Date(),
                    executionTime: Date.now() - startTime
                }
            };
        }
    }

    // ============================================================================
    // MONITORING & HEALTH
    // ============================================================================

    /**
     * Get comprehensive health status
     */
    async getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        metrics: MemoryMetrics;
        cacheStats: {
            size: number;
            hitRate: number;
            memoryUsage: number;
        };
        auditStats: {
            totalOperations: number;
            successRate: number;
            recentErrors: number;
        };
        recommendations: string[];
    }> {
        const metrics = await this.engine.getMetrics();
        const cacheStats = this.getCacheStats();
        const auditStats = this.getAuditStats();

        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
        const recommendations: string[] = [];

        // Health checks
        if (metrics.avgQueryTime > 2000) {
            status = 'degraded';
            recommendations.push('Query performance is slow. Consider optimizing indices.');
        }

        if (auditStats.successRate < 0.95) {
            status = 'unhealthy';
            recommendations.push('High error rate detected. Check system logs.');
        }

        if (metrics.memoryUsage > 500 * 1024 * 1024) { // 500MB
            status = 'degraded';
            recommendations.push('High memory usage. Consider data archiving.');
        }

        return {
            status,
            metrics,
            cacheStats,
            auditStats,
            recommendations
        };
    }

    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================

    private setupEventListeners(): void {
        this.engine.on('entityCreated', (_entity) => {
            if (this.config.enableCache) {
                this.invalidateSearchCache();
            }
        });

        this.engine.on('entityUpdated', (entity) => {
            if (this.config.enableCache) {
                this.cache.delete(`entity:${entity.id}`);
                this.invalidateSearchCache();
            }
        });

        this.engine.on('entityDeleted', (entityId) => {
            if (this.config.enableCache) {
                this.cache.delete(`entity:${entityId}`);
                this.invalidateSearchCache();
            }
        });
    }

    private setupCleanupTasks(): void {
        // Cache cleanup every 5 minutes
        setInterval(() => {
            this.cleanupExpiredCache();
        }, 5 * 60 * 1000);

        // Rate limiter cleanup every minute
        setInterval(() => {
            this.cleanupRateLimiter();
        }, 60 * 1000);

        // Audit log cleanup every hour
        setInterval(() => {
            this.cleanupAuditLog();
        }, 60 * 60 * 1000);
    }

    private generateOperationId(): string {
        return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private validateEntityRequest(request: MemoryCreateRequest): void {
        if (!request.name || request.name.trim().length === 0) {
            throw new Error('Entity name is required');
        }
        if (request.name.length > 500) {
            throw new Error('Entity name too long (max 500 characters)');
        }
        if (request.observations && request.observations.length > 100) {
            throw new Error('Too many observations (max 100)');
        }
    }

    private checkRateLimit(userId: string): boolean {
        const now = new Date();
        const userLimit = this.rateLimiter.get(userId);

        if (!userLimit || now > userLimit.resetTime) {
            this.rateLimiter.set(userId, {
                count: 1,
                resetTime: new Date(now.getTime() + 60 * 1000) // 1 minute
            });
            return true;
        }

        if (userLimit.count >= this.config.maxRequestsPerMinute) {
            return false;
        }

        userLimit.count++;
        return true;
    }

    private generateCacheKey(operation: string, ...args: any[]): string {
        const serialized = JSON.stringify(args);
        return `${operation}:${Buffer.from(serialized).toString('base64')}`;
    }

    private setCacheItem(key: string, data: any, ttl: number): void {
        this.cache.set(key, {
            data,
            timestamp: new Date(),
            ttl
        });
    }

    private getCacheItem(key: string): any | null {
        const item = this.cache.get(key);
        if (!item) return null;

        const now = Date.now();
        const age = now - item.timestamp.getTime();

        if (age > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    private invalidateSearchCache(): void {
        for (const [key] of this.cache) {
            if (key.startsWith('search:')) {
                this.cache.delete(key);
            }
        }
    }

    private cleanupExpiredCache(): void {
        const now = Date.now();
        for (const [key, item] of this.cache) {
            const age = now - item.timestamp.getTime();
            if (age > item.ttl) {
                this.cache.delete(key);
            }
        }
    }

    private cleanupRateLimiter(): void {
        const now = new Date();
        for (const [userId, limit] of this.rateLimiter) {
            if (now > limit.resetTime) {
                this.rateLimiter.delete(userId);
            }
        }
    }

    private cleanupAuditLog(): void {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
        this.auditLog = this.auditLog.filter(entry => entry.timestamp > cutoff);
    }

    private async auditOperation(operation: string, context: AgentContext, data: any): Promise<void> {
        // Implement security audit logic
        console.log(`Security audit: ${operation}`, { context, data });
    }
    private logAudit(operation: string, userId?: string, success: boolean = true, details: Record<string, any> = {}): void {
        this.auditLog.push({
            operation,
            ...(userId && { userId }),
            timestamp: new Date(),
            success,
            details
        });
    }

    private getQueryType(query: MemoryQuery): string {
        const types: string[] = [];
        if (query.text) types.push('text');
        if (query.embedding) types.push('vector');
        if (query.entityTypes) types.push('type-filter');
        if (query.tags) types.push('tag-filter');
        return types.join('+') || 'generic';
    }

    private async generateKnowledgeGraphAnalytics(graph: KnowledgeGraph): Promise<any> {
        // Generate advanced analytics for the knowledge graph
        return {
            centralityScores: this.calculateCentralityScores(graph),
            clusteringCoefficient: this.calculateClusteringCoefficient(graph),
            shortestPaths: this.calculateShortestPaths(graph),
            communityDetection: this.detectCommunities(graph)
        };
    }

    private calculateContextMatch(entity: MemoryEntity, context: string): number {
        // Simple context matching algorithm
        const contextWords = context.toLowerCase().split(/\s+/);
        const entityText = [
            entity.name,
            entity.description || '',
            ...entity.observations,
            ...entity.tags
        ].join(' ').toLowerCase();

        let matches = 0;
        for (const word of contextWords) {
            if (entityText.includes(word)) matches++;
        }

        return matches / contextWords.length;
    }

    private convertToCSV(data: any): string {
        // Simple CSV conversion - in reality, you'd use a proper CSV library
        return JSON.stringify(data);
    }

    private async encryptData(data: string): Promise<string> {
        // Implement encryption - for now, just return the data
        // In a real implementation, you'd use crypto libraries
        return Buffer.from(data).toString('base64');
    }

    private getCacheStats(): { size: number; hitRate: number; memoryUsage: number; } {
        return {
            size: this.cache.size,
            hitRate: 0.85, // Mock value - implement real calculation
            memoryUsage: this.cache.size * 1024 // Rough estimate
        };
    }

    private getAuditStats(): { totalOperations: number; successRate: number; recentErrors: number; } {
        const total = this.auditLog.length;
        const successful = this.auditLog.filter(entry => entry.success).length;
        const recentErrors = this.auditLog.filter(
            entry => !entry.success && entry.timestamp > new Date(Date.now() - 60 * 60 * 1000)
        ).length;

        return {
            totalOperations: total,
            successRate: total > 0 ? successful / total : 1,
            recentErrors
        };
    }

    private calculateCentralityScores(graph: KnowledgeGraph): Record<string, number> {
        // Mock implementation - in reality, implement proper centrality algorithms
        const scores: Record<string, number> = {};
        for (const entity of graph.entities) {
            scores[entity.id] = Math.random();
        }
        return scores;
    }

    private calculateClusteringCoefficient(_graph: KnowledgeGraph): number {
        // Mock implementation
        return Math.random();
    }

    private calculateShortestPaths(_graph: KnowledgeGraph): Record<string, Record<string, number>> {
        // Mock implementation
        return {};
    }

    private detectCommunities(_graph: KnowledgeGraph): Array<{ id: string; entities: string[]; }> {
        // Mock implementation
        return [];
    }

    /**
     * Close the service and cleanup resources
     */
    async close(): Promise<void> {
        await this.engine.close();
        this.cache.clear();
        this.rateLimiter.clear();
        this.auditLog.length = 0;
    }
}
