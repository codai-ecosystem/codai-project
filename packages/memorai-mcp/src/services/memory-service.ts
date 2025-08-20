/**
 * Memory Service
 * Core business logic for memory management operations
 * Date: August 6, 2025
 */

import { Memory, SearchResult, SearchRequest, APIResponse, AdvancedMetadata } from '../core/types.js';
import { Logger } from '../utils/logger.js';
import { database } from '../core/database-manager.js';
import { HybridSearchEngine } from '../engines/search/hybrid-search.js';
import { v4 as uuidv4 } from 'uuid';

export interface MemoryCreateRequest {
    agentId: string;
    content: string;
    metadata?: Partial<AdvancedMetadata>;
}

export interface MemorySearchRequest extends SearchRequest {
    useHybridSearch?: boolean;
}

export interface MemoryStats {
    totalMemories: number;
    memoriesByAgent: Record<string, number>;
    memoriesByEntityType: Record<string, number>;
    averageImportance: number;
    searchEngineStats: any;
}

export class MemoryService {
    private static instance: MemoryService;
    private logger: Logger;
    private searchEngine: HybridSearchEngine;
    private isInitialized: boolean;
    private memoryCache: Map<string, Memory>;

    private constructor() {
        this.logger = new Logger('MemoryService');
        this.searchEngine = new HybridSearchEngine();
        this.isInitialized = false;
        this.memoryCache = new Map();
    }

    public static getInstance(): MemoryService {
        if (!MemoryService.instance) {
            MemoryService.instance = new MemoryService();
        }
        return MemoryService.instance;
    }

    /**
     * Initialize the memory service
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            this.logger.warn('Memory service already initialized');
            return;
        }

        this.logger.info('Initializing memory service');

        try {
            // Check database health
            const isHealthy = await database.isHealthy();
            if (!isHealthy) {
                throw new Error('Database is not healthy');
            }

            // Get existing memories to initialize search engine
            // Note: This is a placeholder for getting all memories
            // In practice, we might want to do this differently for performance
            const memories: Memory[] = []; // Would be populated from database

            // Initialize search engine
            await this.searchEngine.initialize(memories);

            this.isInitialized = true;
            this.logger.info('Memory service initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize memory service:', error);
            throw error;
        }
    }

    /**
     * Store a new memory
     */
    public async remember(request: MemoryCreateRequest): Promise<APIResponse<Memory>> {
        try {
            this.logger.debug('Storing new memory', { agentId: request.agentId, contentLength: request.content.length });

            // Create enhanced metadata
            const enhancedMetadata = this.createEnhancedMetadata(request.metadata, request.agentId);

            // Create memory object
            const memoryToStore: Omit<Memory, 'id' | 'structuredKey' | 'timestamp'> = {
                agentId: request.agentId,
                content: request.content,
                metadata: enhancedMetadata
            };

            // Store in database
            const dbResponse = await database.storeMemory(memoryToStore);

            if (dbResponse.success && dbResponse.data) {
                const storedMemory = dbResponse.data;

                // Add to search index
                await this.searchEngine.addMemory(storedMemory);

                // Cache the memory
                this.memoryCache.set(storedMemory.id, storedMemory);

                this.logger.info('Memory stored successfully', {
                    memoryId: storedMemory.id,
                    agentId: storedMemory.agentId,
                    entityType: storedMemory.metadata.entityType
                });

                return {
                    success: true,
                    data: storedMemory,
                    metadata: {
                        timestamp: new Date(),
                        requestId: this.generateRequestId(),
                        processingTime: 0
                    }
                };
            }

            return dbResponse;
        } catch (error) {
            this.logger.error('Failed to store memory:', error);
            return {
                success: false,
                error: {
                    code: 'MEMORY_STORE_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to store memory',
                    timestamp: new Date()
                }
            };
        }
    }

    /**
     * Search memories using hybrid search
     */
    public async recall(request: MemorySearchRequest): Promise<APIResponse<SearchResult[]>> {
        try {
            this.logger.debug('Searching memories', {
                query: request.query,
                agentId: request.agentId,
                useHybridSearch: request.useHybridSearch
            });

            if (request.useHybridSearch !== false) {
                // Use hybrid search engine
                const { results, metrics } = await this.searchEngine.search(request);

                this.logger.info('Hybrid search completed', {
                    query: request.query,
                    resultsCount: results.length,
                    searchTime: metrics.totalSearchTime,
                    cacheHit: metrics.cacheHit
                });

                return {
                    success: true,
                    data: results,
                    metadata: {
                        timestamp: new Date(),
                        requestId: this.generateRequestId(),
                        processingTime: metrics.totalSearchTime,
                        cacheHit: metrics.cacheHit
                    }
                };
            } else {
                // Use basic database search
                const dbResponse = await database.searchMemories(
                    request.query,
                    request.agentId,
                    request.limit
                );

                if (dbResponse.success && dbResponse.data) {
                    const searchResults: SearchResult[] = dbResponse.data.map(memory => ({
                        memory,
                        relevanceScore: 1.0,
                        matchType: 'exact',
                        highlights: []
                    }));

                    return {
                        success: true,
                        data: searchResults,
                        metadata: dbResponse.metadata
                    };
                }

                return {
                    success: false,
                    error: dbResponse.error
                };
            }
        } catch (error) {
            this.logger.error('Failed to search memories:', error);
            return {
                success: false,
                error: {
                    code: 'MEMORY_SEARCH_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to search memories',
                    timestamp: new Date()
                }
            };
        }
    }

    /**
     * Delete a memory by structured key
     */
    public async forget(structuredKey: string, agentId: string): Promise<APIResponse<boolean>> {
        try {
            this.logger.debug('Deleting memory', { structuredKey, agentId });

            // Find memory ID for search index removal
            const memoryInCache = Array.from(this.memoryCache.values())
                .find(m => m.structuredKey === structuredKey && m.agentId === agentId);

            // Delete from database
            const dbResponse = await database.deleteMemory(structuredKey, agentId);

            if (dbResponse.success) {
                // Remove from search index
                if (memoryInCache) {
                    this.searchEngine.removeMemory(memoryInCache.id);
                    this.memoryCache.delete(memoryInCache.id);
                }

                this.logger.info('Memory deleted successfully', { structuredKey, agentId });
            }

            return dbResponse;
        } catch (error) {
            this.logger.error('Failed to delete memory:', error);
            return {
                success: false,
                error: {
                    code: 'MEMORY_DELETE_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to delete memory',
                    timestamp: new Date()
                }
            };
        }
    }

    /**
     * Get recent context for an agent
     */
    public async getContext(agentId: string, contextSize: number = 5): Promise<APIResponse<Memory[]>> {
        try {
            this.logger.debug('Getting context', { agentId, contextSize });

            const dbResponse = await database.getContext(agentId, contextSize);

            if (dbResponse.success && dbResponse.data) {
                // Cache retrieved memories
                for (const memory of dbResponse.data) {
                    this.memoryCache.set(memory.id, memory);
                }
            }

            return dbResponse;
        } catch (error) {
            this.logger.error('Failed to get context:', error);
            return {
                success: false,
                error: {
                    code: 'CONTEXT_RETRIEVAL_FAILED',
                    message: error instanceof Error ? error.message : 'Failed to retrieve context',
                    timestamp: new Date()
                }
            };
        }
    }

    /**
     * Get memory statistics
     */
    public async getStats(): Promise<MemoryStats> {
        // In a full implementation, this would query the database for statistics
        const searchEngineStats = this.searchEngine.getStats();

        return {
            totalMemories: this.memoryCache.size,
            memoriesByAgent: this.calculateAgentStats(),
            memoriesByEntityType: this.calculateEntityTypeStats(),
            averageImportance: this.calculateAverageImportance(),
            searchEngineStats
        };
    }

    /**
     * Create enhanced metadata with automatic scoring
     */
    private createEnhancedMetadata(
        providedMetadata: Partial<AdvancedMetadata> | undefined,
        agentId: string
    ): AdvancedMetadata {
        const now = new Date();

        return {
            entityType: providedMetadata?.entityType || 'knowledge',
            importance: providedMetadata?.importance || this.calculateImportance(providedMetadata),
            tags: providedMetadata?.tags || [],
            project: providedMetadata?.project,
            session: providedMetadata?.session,
            createdBy: agentId,
            lastAccessed: now,
            accessCount: 0,
            priority: providedMetadata?.priority || 'medium',
            category: providedMetadata?.category
        };
    }

    /**
     * Calculate importance score automatically
     */
    private calculateImportance(metadata: Partial<AdvancedMetadata> | undefined): number {
        let score = 5; // Base score

        // Adjust based on entity type
        switch (metadata?.entityType) {
            case 'user_instructions':
            case 'prompt':
                score += 3;
                break;
            case 'plan':
            case 'task':
                score += 2;
                break;
            case 'context':
                score += 1;
                break;
            default:
                break;
        }

        // Adjust based on priority
        switch (metadata?.priority) {
            case 'critical':
                score += 3;
                break;
            case 'high':
                score += 2;
                break;
            case 'medium':
                score += 0;
                break;
            case 'low':
                score -= 1;
                break;
        }

        // Ensure score is within bounds
        return Math.max(1, Math.min(10, score));
    }

    /**
     * Calculate agent statistics
     */
    private calculateAgentStats(): Record<string, number> {
        const stats: Record<string, number> = {};

        for (const memory of this.memoryCache.values()) {
            stats[memory.agentId] = (stats[memory.agentId] || 0) + 1;
        }

        return stats;
    }

    /**
     * Calculate entity type statistics
     */
    private calculateEntityTypeStats(): Record<string, number> {
        const stats: Record<string, number> = {};

        for (const memory of this.memoryCache.values()) {
            const entityType = memory.metadata.entityType;
            stats[entityType] = (stats[entityType] || 0) + 1;
        }

        return stats;
    }

    /**
     * Calculate average importance score
     */
    private calculateAverageImportance(): number {
        if (this.memoryCache.size === 0) return 0;

        const total = Array.from(this.memoryCache.values())
            .reduce((sum, memory) => sum + memory.metadata.importance, 0);

        return total / this.memoryCache.size;
    }

    /**
     * Generate unique request ID
     */
    private generateRequestId(): string {
        return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clear memory cache
     */
    public clearCache(): void {
        this.memoryCache.clear();
        this.searchEngine.clearCache();
        this.logger.info('Memory cache cleared');
    }

    /**
     * Check if service is initialized
     */
    public isServiceInitialized(): boolean {
        return this.isInitialized;
    }
}

// Singleton instance
export const memoryService = MemoryService.getInstance();
