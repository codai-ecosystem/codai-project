/**
 * Semantic Search Engine
 * Advanced search with TF-IDF scoring and vector embeddings
 * Date: August 6, 2025
 */

import { Memory, SearchResult, SearchRequest, VectorSearchResult } from '../../core/types.js';
import { Logger } from '../../utils/logger.js';
import { config } from '../../core/config-manager.js';
import OpenAI from 'openai';

export interface TfIdfDocument {
    id: string;
    content: string;
    tokens: string[];
    termFrequencies: Map<string, number>;
}

export interface TfIdfScores {
    documentId: string;
    score: number;
    matchedTerms: string[];
}

export class SemanticSearchEngine {
    private logger: Logger;
    private openai: OpenAI | null;
    private documents: Map<string, TfIdfDocument>;
    private vocabulary: Set<string>;
    private idf: Map<string, number>;
    private isInitialized: boolean;

    constructor() {
        this.logger = new Logger('SemanticSearch');
        this.documents = new Map();
        this.vocabulary = new Set();
        this.idf = new Map();
        this.isInitialized = false;

        // Initialize OpenAI client if API key is available
        const aiConfig = config.getOpenAIConfig();
        if (aiConfig.apiKey) {
            this.openai = new OpenAI({ apiKey: aiConfig.apiKey });
            this.logger.info('OpenAI client initialized for vector search');
        } else {
            this.openai = null;
            this.logger.warn('OpenAI API key not found. Vector search disabled.');
        }
    }

    /**
     * Initialize the search engine with existing memories
     */
    public async initialize(memories: Memory[]): Promise<void> {
        this.logger.info(`Initializing semantic search with ${memories.length} memories`);

        // Build TF-IDF index
        await this.buildTfIdfIndex(memories);

        this.isInitialized = true;
        this.logger.info('Semantic search engine initialized successfully');
    }

    /**
     * Add a memory to the search index
     */
    public async addToIndex(memory: Memory): Promise<void> {
        const document = this.createDocument(memory);
        this.documents.set(memory.id, document);

        // Update vocabulary and recalculate IDF
        document.tokens.forEach(token => this.vocabulary.add(token));
        await this.calculateIdf();

        this.logger.debug(`Added memory to search index: ${memory.id}`);
    }

    /**
     * Remove a memory from the search index
     */
    public removeFromIndex(memoryId: string): void {
        if (this.documents.has(memoryId)) {
            this.documents.delete(memoryId);
            // Note: We don't recalculate IDF here for performance
            // It will be recalculated on the next full reindex
            this.logger.debug(`Removed memory from search index: ${memoryId}`);
        }
    }

    /**
     * Perform semantic search with hybrid scoring
     */
    public async search(request: SearchRequest): Promise<SearchResult[]> {
        if (!this.isInitialized) {
            throw new Error('Search engine not initialized');
        }

        const results: SearchResult[] = [];

        // Perform TF-IDF search
        const tfIdfResults = await this.performTfIdfSearch(request.query, request.limit || 10);

        // Perform vector search if enabled
        let vectorResults: VectorSearchResult[] = [];
        if (this.openai && request.useSemanticSearch !== false) {
            vectorResults = await this.performVectorSearch(request.query, request.limit || 10);
        }

        // Combine and rank results
        const combinedResults = await this.combineSearchResults(
            tfIdfResults,
            vectorResults,
            request
        );

        return combinedResults.slice(0, request.limit || 10);
    }

    /**
     * Build TF-IDF index from memories
     */
    private async buildTfIdfIndex(memories: Memory[]): Promise<void> {
        this.documents.clear();
        this.vocabulary.clear();

        // Create documents and build vocabulary
        for (const memory of memories) {
            const document = this.createDocument(memory);
            this.documents.set(memory.id, document);

            // Add tokens to vocabulary
            document.tokens.forEach(token => this.vocabulary.add(token));
        }

        // Calculate IDF scores
        await this.calculateIdf();

        this.logger.info(`Built TF-IDF index: ${this.documents.size} documents, ${this.vocabulary.size} terms`);
    }

    /**
     * Create a document for TF-IDF analysis
     */
    private createDocument(memory: Memory): TfIdfDocument {
        const content = `${memory.content} ${JSON.stringify(memory.metadata)}`;
        const tokens = this.tokenize(content);
        const termFrequencies = this.calculateTermFrequencies(tokens);

        return {
            id: memory.id,
            content: memory.content,
            tokens,
            termFrequencies
        };
    }

    /**
     * Tokenize text into terms
     */
    private tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 2)
            .filter(token => !this.isStopWord(token));
    }

    /**
     * Check if a word is a stop word
     */
    private isStopWord(word: string): boolean {
        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
            'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their'
        ]);
        return stopWords.has(word);
    }

    /**
     * Calculate term frequencies for a document
     */
    private calculateTermFrequencies(tokens: string[]): Map<string, number> {
        const frequencies = new Map<string, number>();

        for (const token of tokens) {
            frequencies.set(token, (frequencies.get(token) || 0) + 1);
        }

        // Normalize by document length
        const totalTerms = tokens.length;
        for (const [term, freq] of frequencies) {
            frequencies.set(term, freq / totalTerms);
        }

        return frequencies;
    }

    /**
     * Calculate IDF scores for all terms
     */
    private async calculateIdf(): Promise<void> {
        const totalDocuments = this.documents.size;

        for (const term of this.vocabulary) {
            const documentsWithTerm = Array.from(this.documents.values())
                .filter(doc => doc.termFrequencies.has(term)).length;

            const idf = Math.log(totalDocuments / (documentsWithTerm || 1));
            this.idf.set(term, idf);
        }
    }

    /**
     * Perform TF-IDF search
     */
    private async performTfIdfSearch(query: string, limit: number): Promise<TfIdfScores[]> {
        const queryTokens = this.tokenize(query);
        const results: TfIdfScores[] = [];

        for (const [docId, document] of this.documents) {
            let score = 0;
            const matchedTerms: string[] = [];

            for (const queryToken of queryTokens) {
                const tf = document.termFrequencies.get(queryToken) || 0;
                const idf = this.idf.get(queryToken) || 0;

                if (tf > 0) {
                    score += tf * idf;
                    matchedTerms.push(queryToken);
                }
            }

            if (score > 0) {
                results.push({ documentId: docId, score, matchedTerms });
            }
        }

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * Perform vector search using OpenAI embeddings
     */
    private async performVectorSearch(query: string, limit: number): Promise<VectorSearchResult[]> {
        if (!this.openai) {
            return [];
        }

        try {
            // Get query embedding
            const aiConfig = config.getOpenAIConfig();
            const queryEmbeddingResponse = await this.openai.embeddings.create({
                model: aiConfig.model,
                input: query,
                dimensions: aiConfig.dimensions
            });

            const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

            // Calculate similarities with stored embeddings
            const results: VectorSearchResult[] = [];

            // Note: In a full implementation, we would store and retrieve embeddings from database
            // For now, we'll return empty array until embeddings are stored
            this.logger.debug('Vector search performed (embeddings storage pending)');

            return results.slice(0, limit);
        } catch (error) {
            this.logger.error('Vector search failed:', error);
            return [];
        }
    }

    /**
     * Combine TF-IDF and vector search results
     */
    private async combineSearchResults(
        tfIdfResults: TfIdfScores[],
        vectorResults: VectorSearchResult[],
        request: SearchRequest
    ): Promise<SearchResult[]> {
        const combinedResults: SearchResult[] = [];
        const processedIds = new Set<string>();

        // Process TF-IDF results (weight: 70%)
        for (const tfIdfResult of tfIdfResults) {
            const document = this.documents.get(tfIdfResult.documentId);
            if (document && !processedIds.has(tfIdfResult.documentId)) {
                const memory = await this.getMemoryFromDocument(document, request.agentId);
                if (memory && this.matchesFilters(memory, request)) {
                    combinedResults.push({
                        memory,
                        relevanceScore: tfIdfResult.score * 0.7,
                        matchType: 'hybrid',
                        highlights: tfIdfResult.matchedTerms
                    });
                    processedIds.add(tfIdfResult.documentId);
                }
            }
        }

        // Process vector results (weight: 30%)
        for (const vectorResult of vectorResults) {
            if (!processedIds.has(vectorResult.id)) {
                const memory = await this.getMemoryById(vectorResult.id, request.agentId);
                if (memory && this.matchesFilters(memory, request)) {
                    combinedResults.push({
                        memory,
                        relevanceScore: vectorResult.similarity * 0.3,
                        matchType: 'semantic',
                        highlights: []
                    });
                    processedIds.add(vectorResult.id);
                }
            }
        }

        // Sort by combined relevance score
        return combinedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    /**
     * Check if memory matches search filters
     */
    private matchesFilters(memory: Memory, request: SearchRequest): boolean {
        if (request.minImportance && memory.metadata.importance < request.minImportance) {
            return false;
        }

        if (request.project && memory.metadata.project !== request.project) {
            return false;
        }

        if (request.session && memory.metadata.session !== request.session) {
            return false;
        }

        if (request.entityType && memory.metadata.entityType !== request.entityType) {
            return false;
        }

        return true;
    }

    /**
     * Get memory from document (placeholder - would integrate with database)
     */
    private async getMemoryFromDocument(document: TfIdfDocument, agentId: string): Promise<Memory | null> {
        // This would integrate with the database manager to get the full memory
        // For now, return null as this requires full database integration
        return null;
    }

    /**
     * Get memory by ID (placeholder - would integrate with database)
     */
    private async getMemoryById(id: string, agentId: string): Promise<Memory | null> {
        // This would integrate with the database manager to get the memory
        return null;
    }

    /**
     * Get search engine statistics
     */
    public getStats() {
        return {
            documentsIndexed: this.documents.size,
            vocabularySize: this.vocabulary.size,
            isInitialized: this.isInitialized,
            vectorSearchEnabled: !!this.openai
        };
    }
}
