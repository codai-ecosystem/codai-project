/**
 * Enhanced Memory Store - Phases 1, 2, 3, and 4 Implementation
 * Now includes advanced analytics, summarization, and cross-agent permissions
 */

import { randomUUID } from 'node:crypto';
import { OpenAI } from 'openai';
import { PersistentMemoryStore } from './persistent-memory-store.js';
import { AdvancedMemoryAnalytics, MemoryCluster, MemoryInsight, TemporalPattern } from './advanced-memory-analytics.js';
import { IntelligentMemorySummarization, SummarizedMemory, SummarizationOptions } from './intelligent-memory-summarization.js';
import { CrossAgentPermissionManager, PermissionRule, AccessRequest, AccessResult, MemoryAuditLog } from './cross-agent-permissions.js';



interface MemoryMetadata {
    importance?: number;
    entityType?: string;
    priority?: string;
    project?: string;
    session?: string;
    tags?: string[];
    [key: string]: any;
}

interface StoredMemory {
    id: string;
    agentId: string;
    content: string;
    metadata: MemoryMetadata;
    structuredKey: string;
    timestamp: string;
    embeddings?: number[];
    crossAgent?: boolean;
    sourceAgent?: string;
}

interface SearchOptions {
    limit?: number;
    minImportance?: number;
    project?: string;
    session?: string;
    includeOtherAgents?: boolean;
}

interface ScoredMemory extends StoredMemory {
    relevanceScore?: number;
    hybridScore?: number;
    scoreBreakdown?: {
        vectorScore?: number;
        keywordScore?: number;
        metadataScore?: number;
        importanceScore?: number;
    };
}

export class EnhancedMemoryStore {
    private memories: Map<string, StoredMemory[]> = new Map();
    private embeddings: Map<string, number[]> = new Map();
    private azureClient: OpenAI;
    private persistentStore?: PersistentMemoryStore;

    // Phase 4 Advanced Components
    private analytics: AdvancedMemoryAnalytics;
    private summarization: IntelligentMemorySummarization;
    private permissions: CrossAgentPermissionManager;

    constructor(azureConfig?: any, persistentStore?: PersistentMemoryStore) {
        console.error('[MemorAI] Enhanced Memory Store initialized with Azure OpenAI Phase 2+3+4');

        this.persistentStore = persistentStore;

        // Use provided config or environment variables  
        const config = azureConfig || {};

        // Initialize Azure OpenAI client
        this.azureClient = new OpenAI({
            apiKey: config.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
            baseURL: `${(config.endpoint || process.env.AZURE_OPENAI_ENDPOINT || '').replace(/\/$/, '')}/openai/deployments/${config.deploymentName || process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
            defaultQuery: { 'api-version': config.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-10-21' },
            defaultHeaders: {
                'api-key': config.apiKey || process.env.AZURE_OPENAI_API_KEY || '',
            },
        });

        // Initialize Phase 4 components
        this.analytics = new AdvancedMemoryAnalytics(config);
        this.summarization = new IntelligentMemorySummarization(config);
        this.permissions = new CrossAgentPermissionManager();

        console.error('[MemorAI] Azure OpenAI configured:', {
            endpoint: (config.endpoint || process.env.AZURE_OPENAI_ENDPOINT) ? 'configured' : 'missing',
            deployment: config.deploymentName || process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'not set',
            apiVersion: config.apiVersion || process.env.AZURE_OPENAI_API_VERSION || '2024-10-21',
            persistentStorage: this.persistentStore ? 'enabled' : 'disabled',
            advancedAnalytics: 'enabled',
            intelligentSummarization: 'enabled',
            crossAgentPermissions: 'enabled'
        });
    }

    async store(agentId: string, content: string, metadata: MemoryMetadata = {}): Promise<StoredMemory> {
        const structuredKey = `${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const memory: StoredMemory = {
            id: randomUUID(),
            agentId,
            content,
            metadata: {
                importance: 5,
                entityType: 'memory',
                ...metadata
            },
            structuredKey,
            timestamp: new Date().toISOString()
        };

        // Store memory
        const agentMemories = this.memories.get(agentId) || [];
        agentMemories.push(memory);
        this.memories.set(agentId, agentMemories);

        // Generate embeddings if enabled (placeholder for now)
        try {
            const embedding = await this.generateEmbedding(content);
            if (embedding) {
                this.embeddings.set(memory.id, embedding);
                memory.embeddings = embedding;
            }
        } catch (error) {
            console.warn('Embedding generation failed:', error instanceof Error ? error.message : String(error));
        }

        console.log(`✅ Memory stored: ${structuredKey} (${content.substring(0, 50)}...)`);
        return memory;
    }

    async recall(agentId: string, query: string, options: SearchOptions = {}): Promise<ScoredMemory[]> {
        console.log(`🔍 Enhanced recall for agent "${agentId}" with query: "${query}"`);

        let searchResults: ScoredMemory[] = [];

        // Search own memories first
        const ownResults = await this.enhancedRecall(agentId, query, options);
        searchResults.push(...ownResults);

        // If enabled and not enough results, search across agents
        if (options.includeOtherAgents && searchResults.length < (options.limit || 10)) {
            console.log(`🌐 Searching across other agents for additional results...`);

            for (const [otherAgentId, memories] of this.memories.entries()) {
                if (otherAgentId !== agentId && memories.length > 0) {
                    const crossAgentResults = await this.enhancedRecall(otherAgentId, query, {
                        ...options,
                        limit: Math.max(3, (options.limit || 10) - searchResults.length)
                    });

                    // Mark as cross-agent memories
                    crossAgentResults.forEach(memory => {
                        memory.crossAgent = true;
                        memory.sourceAgent = otherAgentId;
                        // Slightly reduce relevance for cross-agent memories
                        if (memory.relevanceScore) {
                            memory.relevanceScore *= 0.9;
                        }
                    });

                    searchResults.push(...crossAgentResults);

                    // Break if we have enough results
                    if (searchResults.length >= (options.limit || 10)) {
                        break;
                    }
                }
            }
        }

        // Final sort and limit
        const finalResults = searchResults
            .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
            .slice(0, options.limit || 10);

        console.log(`📊 Found ${finalResults.length} memories (${finalResults.filter(r => r.crossAgent).length} cross-agent)`);

        return finalResults;
    }

    private async enhancedRecall(agentId: string, query: string, options: SearchOptions = {}): Promise<ScoredMemory[]> {
        const agentMemories = this.memories.get(agentId) || [];

        if (agentMemories.length === 0) {
            return [];
        }

        // Apply basic filters first
        let candidateMemories = agentMemories;

        // Apply importance filter
        if (options.minImportance && options.minImportance > 0) {
            candidateMemories = candidateMemories.filter(memory =>
                (memory.metadata?.importance || 5) >= options.minImportance!
            );
        }

        // Apply project filter
        if (options.project) {
            candidateMemories = candidateMemories.filter(memory =>
                memory.metadata?.project === options.project
            );
        }

        // Apply session filter
        if (options.session) {
            candidateMemories = candidateMemories.filter(memory =>
                memory.metadata?.session === options.session
            );
        }

        // Phase 2: Generate query embedding for semantic search
        const queryEmbedding = await this.generateEmbedding(query);

        console.error(`[MemorAI] Phase 2 Search: ${queryEmbedding ? 'Vector + Keyword' : 'Keyword only'} search`);

        // Hybrid search implementation (Phase 2)
        const scoredResults = candidateMemories.map(memory => {
            // Calculate keyword-based relevance score (Phase 1)
            const keywordScore = this.calculateRelevanceScore(memory, query);

            // Calculate vector similarity score (Phase 2)
            let vectorScore = 0;
            if (queryEmbedding && memory.embeddings && memory.embeddings.length > 0) {
                vectorScore = this.cosineSimilarity(queryEmbedding, memory.embeddings);
            }

            // Hybrid scoring: combine vector and keyword scores
            const hybridScore = queryEmbedding && memory.embeddings
                ? (vectorScore * 0.7) + (keywordScore * 0.3) // Prefer vector similarity
                : keywordScore; // Fallback to keyword-only

            return {
                ...memory,
                relevanceScore: hybridScore,
                hybridScore: hybridScore,
                scoreBreakdown: {
                    vectorScore,
                    keywordScore,
                    importanceScore: (memory.metadata.importance || 5) / 10
                }
            } as ScoredMemory;
        });

        // Filter out very low relevance results
        const relevantResults = scoredResults.filter(result => (result.relevanceScore || 0) > 0.1);

        // Sort by relevance and importance
        return relevantResults.sort((a, b) => {
            const scoreA = (a.relevanceScore || 0) + ((a.metadata.importance || 5) / 100);
            const scoreB = (b.relevanceScore || 0) + ((b.metadata.importance || 5) / 100);
            return scoreB - scoreA;
        });
    }

    private calculateRelevanceScore(memory: StoredMemory, query: string): number {
        // Handle empty query
        if (!query || query.trim().length === 0) {
            return 0;
        }

        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
        const contentLower = memory.content.toLowerCase();
        const contentWords = contentLower.split(/\s+/);

        let totalScore = 0;
        const weights = {
            exactPhrase: 0.4,
            wordMatch: 0.3,
            fuzzyMatch: 0.2,
            metadata: 0.1
        };

        // 1. Exact phrase matching (highest weight)
        if (contentLower.includes(queryLower)) {
            totalScore += weights.exactPhrase;
        }

        // 2. Individual word matching with position bonus
        let wordMatchScore = 0;
        let matchedWords = 0;

        for (const queryWord of queryWords) {
            let bestMatch = 0;

            // Exact word match
            if (contentWords.some(word => word === queryWord)) {
                bestMatch = 1.0;
            }
            // Substring match
            else if (contentWords.some(word => word.includes(queryWord) || queryWord.includes(word))) {
                bestMatch = 0.8;
            }
            // Fuzzy match using simple edit distance
            else {
                for (const contentWord of contentWords) {
                    const similarity = this.fuzzyMatchScore(queryWord, contentWord);
                    if (similarity > 0.7) {
                        bestMatch = Math.max(bestMatch, similarity * 0.6);
                    }
                }
            }

            if (bestMatch > 0) {
                matchedWords++;
                wordMatchScore += bestMatch;
            }
        }

        // Normalize word match score
        if (queryWords.length > 0) {
            wordMatchScore = (wordMatchScore / queryWords.length) * (matchedWords / queryWords.length);
            totalScore += wordMatchScore * weights.wordMatch;
        }

        // 3. Fuzzy matching for compound words and technical terms
        let fuzzyScore = 0;
        const queryTerms = queryLower.split(/[-_\s]+/);
        const contentTerms = contentLower.split(/[-_\s]+/);

        for (const queryTerm of queryTerms) {
            if (queryTerm.length > 3) {
                for (const contentTerm of contentTerms) {
                    const similarity = this.fuzzyMatchScore(queryTerm, contentTerm);
                    if (similarity > 0.6) {
                        fuzzyScore = Math.max(fuzzyScore, similarity);
                    }
                }
            }
        }
        totalScore += fuzzyScore * weights.fuzzyMatch;

        // 4. Metadata matching
        let metadataScore = 0;
        const metadataText = JSON.stringify(memory.metadata).toLowerCase();

        for (const queryWord of queryWords) {
            if (metadataText.includes(queryWord)) {
                metadataScore += 0.5;
            }

            // Check tags specifically
            if (memory.metadata.tags?.some(tag =>
                tag.toLowerCase().includes(queryWord) || queryWord.includes(tag.toLowerCase())
            )) {
                metadataScore += 0.8;
            }
        }

        metadataScore = Math.min(metadataScore, 1.0); // Cap at 1.0
        totalScore += metadataScore * weights.metadata;

        return Math.min(totalScore, 1.0); // Cap final score at 1.0
    }

    private fuzzyMatchScore(str1: string, str2: string): number {
        if (str1 === str2) return 1.0;
        if (str1.length < 3 || str2.length < 3) return 0;

        const maxLen = Math.max(str1.length, str2.length);
        const distance = this.levenshteinDistance(str1, str2);

        return 1 - (distance / maxLen);
    }

    private levenshteinDistance(str1: string, str2: string): number {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,     // deletion
                    matrix[j - 1][i] + 1,     // insertion
                    matrix[j - 1][i - 1] + indicator  // substitution
                );
            }
        }

        return matrix[str2.length][str1.length];
    }

    async forget(agentId: string, structuredKey: string): Promise<boolean> {
        const agentMemories = this.memories.get(agentId) || [];
        const memoryIndex = agentMemories.findIndex(memory => memory.structuredKey === structuredKey);

        if (memoryIndex === -1) {
            return false;
        }

        const memory = agentMemories[memoryIndex];

        // Remove from embeddings
        if (memory.id && this.embeddings.has(memory.id)) {
            this.embeddings.delete(memory.id);
        }

        // Remove from memories
        agentMemories.splice(memoryIndex, 1);
        this.memories.set(agentId, agentMemories);

        console.log(`🗑️ Memory deleted: ${structuredKey}`);
        return true;
    }

    async getContext(agentId: string, contextSize: number = 5): Promise<StoredMemory[]> {
        const agentMemories = this.memories.get(agentId) || [];

        // Get most recent memories
        const sortedMemories = agentMemories.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return sortedMemories.slice(0, contextSize);
    }

    // Azure OpenAI embedding generation (Phase 2)
    private async generateEmbedding(text: string): Promise<number[] | null> {
        try {
            if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
                console.error('[MemorAI] Azure OpenAI credentials not configured, falling back to keyword search');
                return null;
            }

            // Trim text to stay within token limits (8,192 tokens max for text-embedding-3-large)
            const trimmedText = text.length > 30000 ? text.substring(0, 30000) + '...' : text;

            const response = await this.azureClient.embeddings.create({
                model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'text-embedding-3-large',
                input: trimmedText,
                encoding_format: 'float',
            });

            if (response.data && response.data.length > 0) {
                const embedding = response.data[0].embedding;
                console.error(`[MemorAI] Generated embedding: ${embedding.length} dimensions`);
                return embedding;
            }

            console.error('[MemorAI] No embedding data returned from Azure OpenAI');
            return null;

        } catch (error: any) {
            console.error('[MemorAI] Azure OpenAI embedding error:', error.message);
            return null;
        }
    }

    // Cosine similarity calculation for vector embeddings
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        if (vecA.length !== vecB.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Debug methods for testing
    getAllMemories(): Map<string, StoredMemory[]> {
        return this.memories;
    }

    getMemoryCount(agentId?: string): number {
        if (agentId) {
            return this.memories.get(agentId)?.length || 0;
        }

        let total = 0;
        for (const memories of this.memories.values()) {
            total += memories.length;
        }
        return total;
    }

    listAgents(): string[] {
        return Array.from(this.memories.keys());
    }

    // ============================================================================
    // PHASE 4: ADVANCED FEATURES
    // ============================================================================

    /**
     * Cluster memories using advanced analytics
     */
    async clusterMemories(agentId: string, clusterCount?: number): Promise<MemoryCluster[]> {
        const memories = this.memories.get(agentId) || [];
        if (memories.length === 0) return [];

        console.log(`🧠 Clustering ${memories.length} memories for agent ${agentId}`);
        return await this.analytics.clusterMemories(memories, clusterCount);
    }

    /**
     * Analyze temporal patterns in agent's memories
     */
    async analyzeTemporalPatterns(agentId: string): Promise<TemporalPattern[]> {
        const memories = this.memories.get(agentId) || [];
        if (memories.length === 0) return [];

        console.log(`📊 Analyzing temporal patterns for agent ${agentId}`);
        return await this.analytics.analyzeTemporalPatterns(memories);
    }

    /**
     * Apply importance decay to memories
     */
    async applyImportanceDecay(agentId: string, decayRate?: number): Promise<{ updated: number, results: StoredMemory[] }> {
        const memories = this.memories.get(agentId) || [];
        if (memories.length === 0) return { updated: 0, results: [] };

        console.log(`⏳ Applying importance decay to ${memories.length} memories for agent ${agentId}`);
        const decayedMemories = this.analytics.applyImportanceDecay(memories, decayRate);

        // Update stored memories
        this.memories.set(agentId, decayedMemories);

        return { updated: decayedMemories.length, results: decayedMemories };
    }

    /**
     * Generate intelligent insights about agent's memories
     */
    async generateInsights(agentId: string): Promise<MemoryInsight[]> {
        const memories = this.memories.get(agentId) || [];
        if (memories.length === 0) return [];

        console.log(`💡 Generating insights for agent ${agentId}`);
        return await this.analytics.generateInsights(agentId, memories);
    }

    /**
     * Perform automated memory lifecycle management
     */
    async performLifecycleManagement(agentId: string): Promise<{
        toArchive: StoredMemory[];
        toCompress: StoredMemory[];
        toDelete: StoredMemory[];
        suggestions: string[];
        executed?: {
            archived: number;
            compressed: number;
            deleted: number;
        };
    }> {
        const memories = this.memories.get(agentId) || [];
        if (memories.length === 0) {
            return { toArchive: [], toCompress: [], toDelete: [], suggestions: [] };
        }

        console.log(`🔄 Performing lifecycle management for agent ${agentId}`);
        const management = await this.analytics.performMemoryLifecycleManagement(memories);

        // Auto-execute lifecycle actions (configurable)
        const autoExecute = process.env.MEMORAI_AUTO_LIFECYCLE === 'true';
        let executed: { archived: number; compressed: number; deleted: number } | undefined;

        if (autoExecute) {
            // Delete old, low-importance memories
            const remainingMemories = memories.filter(m =>
                !management.toDelete.some(del => del.id === m.id)
            );

            // Compress large memories (simplified - just truncate for now)
            const compressedMemories = remainingMemories.map(m => {
                if (management.toCompress.some(comp => comp.id === m.id)) {
                    return {
                        ...m,
                        content: m.content.substring(0, 500) + '... [compressed]',
                        metadata: { ...m.metadata, compressed: true }
                    };
                }
                return m;
            });

            this.memories.set(agentId, compressedMemories);

            executed = {
                archived: 0, // Archive functionality would need external storage
                compressed: management.toCompress.length,
                deleted: management.toDelete.length
            };

            console.log(`✅ Lifecycle management executed: ${executed.deleted} deleted, ${executed.compressed} compressed`);
        }

        return { ...management, executed };
    }

    /**
     * Summarize a group of memories
     */
    async summarizeMemories(
        memories: StoredMemory[],
        options?: SummarizationOptions
    ): Promise<SummarizedMemory> {
        console.log(`📝 Summarizing ${memories.length} memories`);
        return await this.summarization.summarizeMemories(memories, options);
    }

    /**
     * Batch summarize memory groups
     */
    async batchSummarize(
        memoryGroups: StoredMemory[][],
        options?: SummarizationOptions
    ): Promise<SummarizedMemory[]> {
        console.log(`📝 Batch summarizing ${memoryGroups.length} memory groups`);
        return await this.summarization.batchSummarize(memoryGroups, options);
    }

    /**
     * Compress memories for storage efficiency
     */
    async compressMemories(agentId: string): Promise<{
        compressed: SummarizedMemory[];
        savings: {
            originalSize: number;
            compressedSize: number;
            compressionRatio: number;
            spaceSaved: number;
        };
    }> {
        const memories = this.memories.get(agentId) || [];
        if (memories.length === 0) {
            return {
                compressed: [],
                savings: { originalSize: 0, compressedSize: 0, compressionRatio: 0, spaceSaved: 0 }
            };
        }

        console.log(`🗜️ Compressing memories for agent ${agentId}`);
        const result = await this.summarization.compressMemories(memories);

        // Optionally replace original memories with compressed versions
        const replaceOriginals = process.env.MEMORAI_AUTO_COMPRESS === 'true';
        if (replaceOriginals) {
            // Convert SummarizedMemory back to StoredMemory format
            const compressedAsStored: StoredMemory[] = result.compressed.map(s => ({
                id: s.id,
                agentId: s.agentId,
                content: s.content,
                metadata: s.metadata,
                structuredKey: s.structuredKey,
                timestamp: s.timestamp,
                embeddings: s.embeddings,
                crossAgent: false
            }));

            this.memories.set(agentId, compressedAsStored);
            console.log(`✅ Replaced original memories with ${compressedAsStored.length} compressed versions`);
        }

        return result;
    }

    /**
     * Create progressive summary with different detail levels
     */
    async createProgressiveSummary(memories: StoredMemory[]): Promise<{
        brief: string;
        standard: string;
        detailed: string;
        keyPoints: string[];
        timeline: string[];
    }> {
        console.log(`📋 Creating progressive summary for ${memories.length} memories`);
        return await this.summarization.createProgressiveSummary(memories);
    }

    /**
     * Check cross-agent access permissions
     */
    async checkPermission(request: AccessRequest): Promise<AccessResult> {
        return await this.permissions.checkPermission(request);
    }

    /**
     * Add a permission rule
     */
    addPermissionRule(rule: Omit<PermissionRule, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): PermissionRule {
        return this.permissions.addRule(rule);
    }

    /**
     * Get all permission rules
     */
    getPermissionRules(): PermissionRule[] {
        return this.permissions.getRules();
    }

    /**
     * Get permission audit log
     */
    getPermissionAuditLog(limit?: number, agentFilter?: string): MemoryAuditLog[] {
        return this.permissions.getAuditLog(limit, agentFilter);
    }

    /**
     * Get permission system analytics
     */
    getPermissionAnalytics() {
        return this.permissions.getPermissionAnalytics();
    }

    /**
     * Enhanced cross-agent recall with permission checking
     */
    async secureRecall(
        requestingAgent: string,
        targetAgent: string,
        query: string,
        options: SearchOptions = {}
    ): Promise<ScoredMemory[]> {
        console.log(`🔒 Secure recall: ${requestingAgent} → ${targetAgent}`);

        // If requesting own memories, use regular recall
        if (requestingAgent === targetAgent) {
            return await this.recall(requestingAgent, query, options);
        }

        // Get target agent memories
        const targetMemories = this.memories.get(targetAgent) || [];
        if (targetMemories.length === 0) return [];

        // Check permissions for each memory
        const allowedMemories: StoredMemory[] = [];

        for (const memory of targetMemories) {
            const request: AccessRequest = {
                requestingAgent,
                targetAgent,
                memoryId: memory.id,
                memory,
                accessType: 'read'
            };

            const result = await this.checkPermission(request);
            if (result.granted) {
                allowedMemories.push(memory);
            }
        }

        if (allowedMemories.length === 0) {
            console.log(`❌ No permissions granted for ${requestingAgent} → ${targetAgent}`);
            return [];
        }

        // Perform search on allowed memories only
        console.log(`✅ Access granted to ${allowedMemories.length}/${targetMemories.length} memories`);

        // Use existing search logic on filtered memories
        const searchResults = await this.searchMemories(allowedMemories, query, options);

        // Mark as cross-agent
        searchResults.forEach(memory => {
            memory.crossAgent = true;
            memory.sourceAgent = targetAgent;
        });

        return searchResults;
    }

    /**
     * Get comprehensive memory analytics dashboard
     */
    async getAnalyticsDashboard(agentId: string): Promise<{
        overview: {
            totalMemories: number;
            averageImportance: number;
            oldestMemory: string;
            newestMemory: string;
            storageSize: number;
        };
        clusters: MemoryCluster[];
        temporalPatterns: TemporalPattern[];
        insights: MemoryInsight[];
        permissions: any;
        lifecycle: {
            toArchive: number;
            toCompress: number;
            toDelete: number;
            suggestions: string[];
        };
    }> {
        const memories = this.memories.get(agentId) || [];

        console.log(`📊 Generating analytics dashboard for agent ${agentId}`);

        const [clusters, temporalPatterns, insights, lifecycle] = await Promise.all([
            this.clusterMemories(agentId, 5),
            this.analyzeTemporalPatterns(agentId),
            this.generateInsights(agentId),
            this.performLifecycleManagement(agentId)
        ]);

        const timestamps = memories.map(m => new Date(m.timestamp).getTime());
        const importances = memories.map(m => m.metadata.importance || 5);

        return {
            overview: {
                totalMemories: memories.length,
                averageImportance: importances.length > 0 ? importances.reduce((a, b) => a + b, 0) / importances.length : 0,
                oldestMemory: timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : '',
                newestMemory: timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : '',
                storageSize: memories.reduce((sum, m) => sum + m.content.length, 0)
            },
            clusters,
            temporalPatterns,
            insights,
            permissions: this.getPermissionAnalytics(),
            lifecycle: {
                toArchive: lifecycle.toArchive.length,
                toCompress: lifecycle.toCompress.length,
                toDelete: lifecycle.toDelete.length,
                suggestions: lifecycle.suggestions
            }
        };
    }

    /**
     * Helper method for secure recall (private)
     */
    private async searchMemories(memories: StoredMemory[], query: string, options: SearchOptions = {}): Promise<ScoredMemory[]> {
        // Generate query embedding for semantic search
        const queryEmbedding = await this.generateEmbedding(query);

        // Score and search memories
        const scoredResults = memories.map(memory => {
            const keywordScore = this.calculateRelevanceScore(memory, query);

            let vectorScore = 0;
            if (queryEmbedding && memory.embeddings && memory.embeddings.length > 0) {
                vectorScore = this.cosineSimilarity(queryEmbedding, memory.embeddings);
            }

            const hybridScore = queryEmbedding && memory.embeddings
                ? (vectorScore * 0.7) + (keywordScore * 0.3)
                : keywordScore;

            return {
                ...memory,
                relevanceScore: hybridScore,
                hybridScore: hybridScore,
                scoreBreakdown: {
                    vectorScore,
                    keywordScore,
                    importanceScore: (memory.metadata.importance || 5) / 10
                }
            } as ScoredMemory;
        });

        // Filter and sort results
        const relevantResults = scoredResults.filter(result => (result.relevanceScore || 0) > 0.1);

        return relevantResults.sort((a, b) => {
            const scoreA = (a.relevanceScore || 0) + ((a.metadata.importance || 5) / 100);
            const scoreB = (b.relevanceScore || 0) + ((b.metadata.importance || 5) / 100);
            return scoreB - scoreA;
        }).slice(0, options.limit || 10);
    }
}

// Export for testing
export { StoredMemory, MemoryMetadata, SearchOptions, ScoredMemory };