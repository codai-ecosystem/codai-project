/**
 * CBD Memory Engine
 * Core engine for conversation exchange management and semantic search
 */

import {
    ConversationExchange,
    MemorySearchResult,
    MemorySummary,
    CBDConfig
} from '../types/index.js';
import { FaissVectorStore } from '../vector/VectorStore.js';
import { OpenAIEmbeddingModel, LocalEmbeddingModel } from '../embedding/EmbeddingService.js';
import { CBDNativeStorageAdapter } from '../storage/CBDNativeStorageAdapter.js';

export class CBDMemoryEngine {
    private vectorStore: FaissVectorStore;
    private embeddingModel: OpenAIEmbeddingModel | LocalEmbeddingModel;
    private storageAdapter: CBDNativeStorageAdapter;
    private config: CBDConfig;
    private initialized = false;

    constructor(config: CBDConfig) {
        this.config = config;
        this.vectorStore = new FaissVectorStore(config.vector.dimensions);
        this.storageAdapter = new CBDNativeStorageAdapter(config.storage.dataPath || './cbd-data');

        // Initialize embedding model based on config
        if (config.embedding.model === 'openai') {
            this.embeddingModel = new OpenAIEmbeddingModel(
                config.embedding.apiKey!,
                config.embedding.modelName
            );
        } else {
            this.embeddingModel = new LocalEmbeddingModel(
                config.embedding.modelName || 'sentence-transformers/all-MiniLM-L6-v2'
            );
        }
    }

    /**
     * Initialize the CBD engine
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            await this.vectorStore.initialize();
            await this.storageAdapter.connect();

            console.log('🚀 CBD Memory Engine initialized successfully');
            this.initialized = true;
        } catch (error) {
            throw new Error(`Failed to initialize CBD Memory Engine: ${error}`);
        }
    }

    /**
     * HPKV API: Store a conversation exchange
     */
    async store_memory(
        userRequest: string,
        assistantResponse: string,
        metadata: {
            projectName: string;
            sessionName: string;
            agentId: string;
            sequenceNumber?: number;
            [key: string]: any;
        }
    ): Promise<string> {
        await this.ensureInitialized();

        try {
            // Generate structured key
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const sequence = metadata.sequenceNumber || await this.getNextSequenceNumber(
                metadata.projectName,
                metadata.sessionName
            );

            const structuredKey = `${metadata.projectName}_${dateStr}_${metadata.sessionName}_${sequence}`;

            // Create conversation exchange
            const exchange: ConversationExchange = {
                structuredKey,
                projectName: metadata.projectName,
                sessionName: metadata.sessionName,
                sequenceNumber: sequence,
                agentId: metadata.agentId,
                userRequest,
                assistantResponse,
                conversationContext: this.buildConversationContext(userRequest, assistantResponse),
                metadata,
                confidenceScore: 0.8, // Default confidence
                createdAt: now,
                updatedAt: now
            };

            // Generate embedding for the combined content
            const combinedContent = `${userRequest} ${assistantResponse}`;
            const embedding = await this.embeddingModel.generateEmbedding(combinedContent);
            exchange.vectorEmbedding = embedding;

            // Store in vector index
            await this.vectorStore.addVector(structuredKey, embedding, {
                projectName: metadata.projectName,
                sessionName: metadata.sessionName,
                agentId: metadata.agentId,
                confidence: exchange.confidenceScore,
                timestamp: now.getTime()
            });

            // Store in persistent storage
            await this.storageAdapter.storeConversation(exchange);

            console.log(`💾 Stored conversation: ${structuredKey}`);
            return structuredKey;

        } catch (error) {
            throw new Error(`Failed to store memory: ${error}`);
        }
    }

    /**
     * HPKV API: Semantic search with AI-powered summarization
     */
    async search_memory(
        query: string,
        limit: number = 10,
        confidenceThreshold: number = 0.5
    ): Promise<{
        summary: MemorySummary;
        memories: MemorySearchResult[];
    }> {
        await this.ensureInitialized();

        try {
            // Generate query embedding
            const queryEmbedding = await this.embeddingModel.generateEmbedding(query);

            // Search similar vectors
            const vectorResults = await this.vectorStore.searchSimilar(queryEmbedding, {
                topK: limit * 2, // Get more candidates for filtering
                minScore: confidenceThreshold,
                includeMetadata: true
            });

            // Retrieve full conversation exchanges
            const memories: MemorySearchResult[] = [];

            for (const result of vectorResults.slice(0, limit)) {
                const exchange = await this.storageAdapter.getConversation(result.id);
                if (exchange) {
                    memories.push({
                        memory: exchange,
                        relevanceScore: result.score,
                        confidence: exchange.confidenceScore
                    });
                }
            }

            // Generate AI-powered summary
            const summary = await this.generateMemorySummary(query, memories);

            return { summary, memories };

        } catch (error) {
            throw new Error(`Memory search failed: ${error}`);
        }
    }

    /**
     * HPKV API: Search for memory keys using vector similarity
     */
    async search_keys(
        query: string,
        topK: number = 10,
        minScore: number = 0.3
    ): Promise<{ key: string; score: number; metadata?: any }[]> {
        await this.ensureInitialized();

        try {
            const queryEmbedding = await this.embeddingModel.generateEmbedding(query);
            const results = await this.vectorStore.searchSimilar(queryEmbedding, {
                topK,
                minScore,
                includeMetadata: true
            });

            return results.map(r => ({
                key: r.id,
                score: r.score,
                metadata: r.metadata
            }));

        } catch (error) {
            throw new Error(`Key search failed: ${error}`);
        }
    }

    /**
     * HPKV API: Get memory by exact structured key
     */
    async get_memory(structuredKey: string): Promise<ConversationExchange | null> {
        await this.ensureInitialized();

        try {
            return await this.storageAdapter.getConversation(structuredKey);
        } catch (error) {
            throw new Error(`Failed to get memory ${structuredKey}: ${error}`);
        }
    }

    /**
     * Migration utility: Import existing memories with vector generation
     */
    async migrateFromLegacy(legacyMemories: any[]): Promise<void> {
        await this.ensureInitialized();

        console.log(`🔄 Migrating ${legacyMemories.length} legacy memories to CBD...`);

        for (const [index, memory] of legacyMemories.entries()) {
            try {
                // Extract or reconstruct conversation parts
                const userRequest = memory.user_request || memory.content || '';
                const assistantResponse = memory.assistant_response || memory.response || '';

                // Extract metadata from structured key if available
                const keyParts = memory.structured_key?.split('_') || [];
                const metadata = {
                    projectName: keyParts[0] || 'legacy',
                    sessionName: keyParts[2] || 'imported',
                    agentId: memory.agent_id || 'system',
                    sequenceNumber: parseInt(keyParts[3]) || index + 1,
                    importedFrom: 'legacy',
                    originalKey: memory.structured_key
                };

                if (userRequest && assistantResponse) {
                    await this.store_memory(userRequest, assistantResponse, metadata);
                }

            } catch (error) {
                console.error(`Failed to migrate memory ${memory.structured_key || index}:`, error);
            }
        }

        console.log('✅ Legacy memory migration completed');
    }

    /**
     * Private helper methods
     */
    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    private async getNextSequenceNumber(projectName: string, sessionName: string): Promise<number> {
        // Use storage adapter to get the next sequence number
        return await this.storageAdapter.getNextSequenceNumber(projectName, sessionName);
    }

    private buildConversationContext(userRequest: string, assistantResponse: string): string {
        return `User: ${userRequest}\n\nAssistant: ${assistantResponse}`;
    }

    private async generateMemorySummary(
        query: string,
        memories: MemorySearchResult[]
    ): Promise<MemorySummary> {
        if (memories.length === 0) {
            return {
                summary: 'No relevant memories found.',
                sourceMemories: [],
                confidenceScore: 0.0,
                relevantTopics: []
            };
        }

        try {
            // Extract content from memories
            const memoryContents = memories.map(m =>
                `${m.memory.userRequest}\n${m.memory.assistantResponse}`
            ).join('\n\n---\n\n');

            // Generate summary using OpenAI (if available) or simple extraction
            let summary: string;
            if (this.config.embedding.model === 'openai' && this.config.embedding.apiKey) {
                summary = await this.generateAISummary(query, memoryContents);
            } else {
                summary = this.generateSimpleSummary(memories);
            }

            return {
                summary,
                sourceMemories: memories.map(m => m.memory.structuredKey),
                confidenceScore: memories.reduce((acc, m) => acc + m.relevanceScore, 0) / memories.length,
                relevantTopics: this.extractTopics(memories)
            };

        } catch (error) {
            console.error('Failed to generate memory summary:', error);
            return {
                summary: `Found ${memories.length} relevant memories related to: ${query}`,
                sourceMemories: memories.map(m => m.memory.structuredKey),
                confidenceScore: 0.5,
                relevantTopics: []
            };
        }
    }

    private async generateAISummary(query: string, content: string): Promise<string> {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.embedding.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a memory summarization assistant. Create concise, relevant summaries of conversation memories based on user queries.'
                        },
                        {
                            role: 'user',
                            content: `Query: "${query}"\n\nRelevant memories:\n${content}\n\nProvide a concise summary of the most relevant information from these memories that answers or relates to the query.`
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || 'Summary generation failed.';

        } catch (error) {
            console.error('AI summary generation failed:', error);
            return `Summary of ${query}: Multiple relevant memories found covering related topics and discussions.`;
        }
    }

    private generateSimpleSummary(memories: MemorySearchResult[]): string {
        const topics = this.extractTopics(memories);
        const projects = [...new Set(memories.map(m => m.memory.projectName))];

        return `Found ${memories.length} relevant memories across ${projects.length} project(s). Key topics include: ${topics.join(', ')}.`;
    }

    private extractTopics(memories: MemorySearchResult[]): string[] {
        // Simple topic extraction - in a real implementation, this could use NLP
        const allText = memories.map(m =>
            `${m.memory.userRequest} ${m.memory.assistantResponse}`
        ).join(' ').toLowerCase();

        const commonWords = ['function', 'class', 'method', 'variable', 'code', 'implementation',
            'database', 'api', 'service', 'component', 'system', 'error', 'bug'];

        return commonWords.filter(word => allText.includes(word)).slice(0, 5);
    }

    /**
     * Cleanup and shutdown
     */
    async shutdown(): Promise<void> {
        if (this.storageAdapter) {
            await this.storageAdapter.disconnect();
        }
        this.initialized = false;
        console.log('🛑 CBD Memory Engine shut down');
    }
}
