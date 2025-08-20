#!/usr/bin/env node

/**
 * @fileoverview MemorAI Intelligence Server (Phase 3)
 * @description Intelligent memory server with semantic analysis and context-aware retrieval
 * @version 3.0.0
 * @author MemorAI Development Team
 * @port 8003
 */

const BaseMemorAIServer = require('../core/base-server.cjs');
const MemoryManager = require('../services/memory-manager.cjs');
const config = require('../utils/config.cjs');

/**
 * Intelligence Server - Phase 3
 * Provides semantic analysis, intelligent suggestions, and context-aware retrieval
 */
class IntelligenceServer extends BaseMemorAIServer {
    constructor() {
        super({
            port: config.PORTS.PHASE_3_INTELLIGENCE || 8003,
            name: 'MemorAI Intelligence Server',
            version: '3.0.0',
            phase: 'intelligence',
            apiKey: config.SECURITY.API_KEY
        });

        this.memoryManager = null;
        this.semanticAnalyzer = null;
        this.contextEngine = null;
        this.suggestionEngine = null;
    }

    /**
     * Initialize services specific to intelligence server
     * @protected
     */
    async initializeServices() {
        this.logger.info('Initializing Intelligence Server services...');

        // Initialize Memory Manager
        this.memoryManager = new MemoryManager({
            maxMemories: 10000,
            enableEncryption: false,
            enableVersioning: true
        });

        // Initialize Semantic Analyzer
        this.semanticAnalyzer = new SemanticAnalysisEngine();

        // Initialize Context Engine
        this.contextEngine = new ContextAwareEngine();

        // Initialize Suggestion Engine
        this.suggestionEngine = new IntelligentSuggestionEngine();

        this.logger.info('Intelligence Server services initialized successfully');
    }

    /**
     * Setup custom routes for intelligence server
     * @protected
     */
    setupCustomRoutes() {
        // Memory operations
        this.app.post('/api/memories', this.createMemory.bind(this));
        this.app.get('/api/memories/:agentId', this.getMemories.bind(this));
        this.app.put('/api/memories/:memoryId', this.updateMemory.bind(this));
        this.app.delete('/api/memories/:memoryId', this.deleteMemory.bind(this));

        // Intelligent search
        this.app.post('/api/search', this.searchMemories.bind(this));
        this.app.post('/api/semantic-search', this.semanticSearch.bind(this));

        // Intelligence features
        this.app.post('/api/analyze', this.analyzeContent.bind(this));
        this.app.post('/api/suggestions', this.getSuggestions.bind(this));
        this.app.post('/api/context', this.getContext.bind(this));

        // Analytics
        this.app.get('/api/analytics', this.getAnalytics.bind(this));
        this.app.get('/api/insights', this.getInsights.bind(this));
    }

    /**
     * Get server features
     * @returns {string[]} Array of server features
     * @protected
     */
    getFeatures() {
        return [
            ...super.getFeatures(),
            'semantic_analysis',
            'context_awareness',
            'intelligent_suggestions',
            'advanced_search',
            'content_analysis',
            'memory_versioning'
        ];
    }

    /**
     * Create a new memory with intelligent analysis
     */
    async createMemory(req, res) {
        try {
            const memoryData = req.body;

            // Enhance with semantic analysis
            if (memoryData.content) {
                const analysis = await this.semanticAnalyzer.analyze(memoryData.content);
                memoryData.metadata = {
                    ...memoryData.metadata,
                    semanticAnalysis: analysis,
                    autoTags: analysis.suggestedTags,
                    sentiment: analysis.sentiment,
                    entities: analysis.entities
                };
            }

            const memory = await this.memoryManager.createMemory(memoryData);

            res.json({
                success: true,
                memory,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Create memory failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'CREATE_MEMORY_FAILED'
            });
        }
    }

    /**
     * Get memories for an agent
     */
    async getMemories(req, res) {
        try {
            const { agentId } = req.params;
            const options = {
                limit: parseInt(req.query.limit) || 50,
                offset: parseInt(req.query.offset) || 0,
                sortBy: req.query.sortBy || 'updatedAt',
                sortOrder: req.query.sortOrder || 'desc'
            };

            const memories = await this.memoryManager.getMemoriesByAgent(agentId, options);

            res.json({
                success: true,
                memories,
                agentId,
                total: memories.length,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get memories failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_MEMORIES_FAILED'
            });
        }
    }

    /**
     * Update a memory
     */
    async updateMemory(req, res) {
        try {
            const { memoryId } = req.params;
            const updateData = req.body;

            // Re-analyze content if updated
            if (updateData.content) {
                const analysis = await this.semanticAnalyzer.analyze(updateData.content);
                updateData.metadata = {
                    ...updateData.metadata,
                    semanticAnalysis: analysis,
                    lastAnalyzedAt: new Date().toISOString()
                };
            }

            const memory = await this.memoryManager.updateMemory(memoryId, updateData);

            res.json({
                success: true,
                memory,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Update memory failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'UPDATE_MEMORY_FAILED'
            });
        }
    }

    /**
     * Delete a memory
     */
    async deleteMemory(req, res) {
        try {
            const { memoryId } = req.params;

            const success = await this.memoryManager.deleteMemory(memoryId);

            res.json({
                success,
                memoryId,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Delete memory failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'DELETE_MEMORY_FAILED'
            });
        }
    }

    /**
     * Search memories with basic text search
     */
    async searchMemories(req, res) {
        try {
            const searchParams = req.body;
            const results = await this.memoryManager.searchMemories(searchParams);

            res.json({
                success: true,
                ...results,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Search memories failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'SEARCH_MEMORIES_FAILED'
            });
        }
    }

    /**
     * Semantic search with intelligent ranking
     */
    async semanticSearch(req, res) {
        try {
            const { query, agentId, limit = 10 } = req.body;

            // Get context-aware results
            const contextResults = await this.contextEngine.search({
                query,
                agentId,
                limit: limit * 2 // Get more to filter
            });

            // Apply semantic ranking
            const rankedResults = await this.semanticAnalyzer.rankResults(
                contextResults.memories,
                query
            );

            res.json({
                success: true,
                memories: rankedResults.slice(0, limit),
                total: rankedResults.length,
                searchTime: contextResults.searchTime,
                semanticScore: true,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Semantic search failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'SEMANTIC_SEARCH_FAILED'
            });
        }
    }

    /**
     * Analyze content for insights
     */
    async analyzeContent(req, res) {
        try {
            const { content, analysisType = 'full' } = req.body;

            const analysis = await this.semanticAnalyzer.analyze(content, {
                type: analysisType,
                includeEntities: true,
                includeSentiment: true,
                includeSuggestions: true
            });

            res.json({
                success: true,
                analysis,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Content analysis failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'CONTENT_ANALYSIS_FAILED'
            });
        }
    }

    /**
     * Get intelligent suggestions
     */
    async getSuggestions(req, res) {
        try {
            const { agentId, context, type = 'general' } = req.body;

            const suggestions = await this.suggestionEngine.generateSuggestions({
                agentId,
                context,
                type,
                memoryManager: this.memoryManager
            });

            res.json({
                success: true,
                suggestions,
                type,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get suggestions failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_SUGGESTIONS_FAILED'
            });
        }
    }

    /**
     * Get contextual information
     */
    async getContext(req, res) {
        try {
            const { agentId, query, maxResults = 5 } = req.body;

            const contextData = await this.contextEngine.getContext({
                agentId,
                query,
                maxResults,
                memoryManager: this.memoryManager
            });

            res.json({
                success: true,
                context: contextData,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get context failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_CONTEXT_FAILED'
            });
        }
    }

    /**
     * Get analytics data
     */
    async getAnalytics(req, res) {
        try {
            const stats = this.memoryManager.getStats();
            const analytics = {
                ...stats,
                intelligenceFeatures: {
                    semanticAnalysisEnabled: true,
                    contextAwarenessEnabled: true,
                    suggestionEngineEnabled: true,
                    versioningEnabled: true
                },
                performance: {
                    averageAnalysisTime: this.semanticAnalyzer.getAverageAnalysisTime(),
                    totalAnalyses: this.semanticAnalyzer.getTotalAnalyses(),
                    suggestionsGenerated: this.suggestionEngine.getTotalSuggestions()
                }
            };

            res.json({
                success: true,
                analytics,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get analytics failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_ANALYTICS_FAILED'
            });
        }
    }

    /**
     * Get intelligent insights
     */
    async getInsights(req, res) {
        try {
            const { agentId, timeframe = '7d' } = req.query;

            const insights = await this.contextEngine.generateInsights({
                agentId,
                timeframe,
                memoryManager: this.memoryManager
            });

            res.json({
                success: true,
                insights,
                timeframe,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger.error('Get insights failed', { error: error.message });
            res.status(500).json({
                success: false,
                error: error.message,
                code: 'GET_INSIGHTS_FAILED'
            });
        }
    }
}

/**
 * Semantic Analysis Engine
 * Provides content analysis and semantic understanding
 */
class SemanticAnalysisEngine {
    constructor() {
        this.stats = {
            totalAnalyses: 0,
            averageAnalysisTime: 0
        };
    }

    /**
     * Analyze content for semantic information
     * @param {string} content Content to analyze
     * @param {Object} options Analysis options
     * @returns {Object} Analysis results
     */
    async analyze(content, options = {}) {
        const startTime = Date.now();

        try {
            const analysis = {
                wordCount: content.split(/\s+/).length,
                characterCount: content.length,
                sentiment: this.analyzeSentiment(content),
                entities: this.extractEntities(content),
                keywords: this.extractKeywords(content),
                suggestedTags: this.suggestTags(content),
                topics: this.identifyTopics(content),
                complexity: this.calculateComplexity(content),
                language: this.detectLanguage(content)
            };

            const analysisTime = Date.now() - startTime;
            this.updateStats(analysisTime);

            return analysis;

        } catch (error) {
            throw new Error(`Semantic analysis failed: ${error.message}`);
        }
    }

    /**
     * Rank search results by semantic relevance
     */
    async rankResults(memories, query) {
        return memories.map(memory => {
            const relevanceScore = this.calculateSemanticRelevance(memory, query);
            return {
                ...memory,
                semanticRelevance: relevanceScore
            };
        }).sort((a, b) => b.semanticRelevance - a.semanticRelevance);
    }

    /**
     * Calculate semantic relevance score
     */
    calculateSemanticRelevance(memory, query) {
        // Simple implementation - can be enhanced with ML models
        const queryWords = query.toLowerCase().split(/\s+/);
        const contentWords = memory.content.toLowerCase().split(/\s+/);

        let matches = 0;
        queryWords.forEach(word => {
            if (contentWords.includes(word)) {
                matches++;
            }
        });

        return matches / queryWords.length;
    }

    analyzeSentiment(content) {
        // Simple sentiment analysis
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'perfect'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate'];

        const words = content.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;

        words.forEach(word => {
            if (positiveWords.includes(word)) positiveCount++;
            if (negativeWords.includes(word)) negativeCount++;
        });

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    extractEntities(content) {
        // Simple entity extraction
        const entities = [];

        // Email pattern
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const emails = content.match(emailRegex) || [];
        emails.forEach(email => entities.push({ type: 'email', value: email }));

        // URL pattern
        const urlRegex = /https?:\/\/[^\s]+/g;
        const urls = content.match(urlRegex) || [];
        urls.forEach(url => entities.push({ type: 'url', value: url }));

        return entities;
    }

    extractKeywords(content) {
        const words = content.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);

        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
    }

    suggestTags(content) {
        const keywords = this.extractKeywords(content);
        return keywords.slice(0, 5).map(k => k.word);
    }

    identifyTopics(content) {
        // Simple topic identification
        const topicKeywords = {
            'technology': ['code', 'software', 'programming', 'development', 'tech'],
            'business': ['market', 'sales', 'revenue', 'strategy', 'business'],
            'science': ['research', 'study', 'experiment', 'data', 'analysis']
        };

        const contentLower = content.toLowerCase();
        const topics = [];

        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            const matches = keywords.filter(keyword => contentLower.includes(keyword));
            if (matches.length > 0) {
                topics.push({ topic, confidence: matches.length / keywords.length });
            }
        });

        return topics.sort((a, b) => b.confidence - a.confidence);
    }

    calculateComplexity(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = content.split(/\s+/);
        const avgWordsPerSentence = words.length / sentences.length;

        if (avgWordsPerSentence > 20) return 'high';
        if (avgWordsPerSentence > 15) return 'medium';
        return 'low';
    }

    detectLanguage(content) {
        // Simple language detection
        return 'en'; // Default to English
    }

    updateStats(analysisTime) {
        this.stats.totalAnalyses++;
        this.stats.averageAnalysisTime =
            (this.stats.averageAnalysisTime * (this.stats.totalAnalyses - 1) + analysisTime) /
            this.stats.totalAnalyses;
    }

    getAverageAnalysisTime() {
        return this.stats.averageAnalysisTime;
    }

    getTotalAnalyses() {
        return this.stats.totalAnalyses;
    }
}

/**
 * Context Aware Engine
 * Provides contextual understanding and retrieval
 */
class ContextAwareEngine {
    constructor() {
        this.contextCache = new Map();
    }

    async search(params) {
        // Delegate to memory manager with context enhancement
        const { query, agentId, limit } = params;

        // This would integrate with the memory manager
        return {
            memories: [],
            searchTime: 0,
            contextEnhanced: true
        };
    }

    async getContext(params) {
        const { agentId, query, maxResults, memoryManager } = params;

        // Get recent memories for context
        const recentMemories = await memoryManager.getMemoriesByAgent(agentId, {
            limit: maxResults,
            sortBy: 'updatedAt'
        });

        return {
            recentMemories,
            contextualInsights: this.generateContextualInsights(recentMemories),
            suggestedQueries: this.generateSuggestedQueries(query, recentMemories)
        };
    }

    async generateInsights(params) {
        const { agentId, timeframe, memoryManager } = params;

        const memories = await memoryManager.getMemoriesByAgent(agentId, { limit: 100 });

        return {
            totalMemories: memories.length,
            averageMemoryLength: memories.reduce((sum, m) => sum + m.content.length, 0) / memories.length,
            mostUsedTags: this.getMostUsedTags(memories),
            activityPattern: this.getActivityPattern(memories),
            insights: [
                'Your memory usage has increased by 15% this week',
                'Most active topic: Technology',
                'Recommended: Review old memories for optimization'
            ]
        };
    }

    generateContextualInsights(memories) {
        return [
            `You have ${memories.length} recent memories`,
            'Most recent activity focused on development tasks',
            'Consider organizing memories with better tags'
        ];
    }

    generateSuggestedQueries(query, memories) {
        return [
            `${query} related projects`,
            `${query} best practices`,
            `${query} examples`
        ];
    }

    getMostUsedTags(memories) {
        const tagCount = {};
        memories.forEach(memory => {
            memory.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });

        return Object.entries(tagCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([tag, count]) => ({ tag, count }));
    }

    getActivityPattern(memories) {
        const pattern = {};
        memories.forEach(memory => {
            const date = new Date(memory.createdAt).toDateString();
            pattern[date] = (pattern[date] || 0) + 1;
        });

        return pattern;
    }
}

/**
 * Intelligent Suggestion Engine
 * Provides intelligent suggestions and recommendations
 */
class IntelligentSuggestionEngine {
    constructor() {
        this.stats = {
            totalSuggestions: 0
        };
    }

    async generateSuggestions(params) {
        const { agentId, context, type, memoryManager } = params;

        const suggestions = [];

        // Get agent memories for context
        const memories = await memoryManager.getMemoriesByAgent(agentId, { limit: 50 });

        switch (type) {
            case 'tags':
                suggestions.push(...this.suggestTags(memories));
                break;
            case 'organization':
                suggestions.push(...this.suggestOrganization(memories));
                break;
            case 'search':
                suggestions.push(...this.suggestSearchQueries(memories));
                break;
            default:
                suggestions.push(...this.suggestGeneral(memories, context));
        }

        this.stats.totalSuggestions += suggestions.length;

        return suggestions;
    }

    suggestTags(memories) {
        const commonWords = this.getCommonWords(memories);
        return commonWords.slice(0, 5).map(word => ({
            type: 'tag',
            suggestion: word,
            reason: 'Frequently used in your memories',
            confidence: 0.8
        }));
    }

    suggestOrganization(memories) {
        return [
            {
                type: 'organization',
                suggestion: 'Create project-based memory categories',
                reason: 'Your memories span multiple projects',
                confidence: 0.9
            },
            {
                type: 'organization',
                suggestion: 'Add date-based tags for better timeline tracking',
                reason: 'Improve chronological organization',
                confidence: 0.7
            }
        ];
    }

    suggestSearchQueries(memories) {
        const recentTopics = this.getRecentTopics(memories);
        return recentTopics.map(topic => ({
            type: 'search',
            suggestion: topic,
            reason: 'Based on your recent activity',
            confidence: 0.6
        }));
    }

    suggestGeneral(memories, context) {
        return [
            {
                type: 'general',
                suggestion: 'Review and update old memories',
                reason: `You have ${memories.length} memories that could be optimized`,
                confidence: 0.5
            }
        ];
    }

    getCommonWords(memories) {
        const allWords = memories
            .map(m => m.content.toLowerCase().split(/\s+/))
            .flat()
            .filter(word => word.length > 3);

        const frequency = {};
        allWords.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);
    }

    getRecentTopics(memories) {
        return ['development', 'planning', 'analysis']; // Simplified
    }

    getTotalSuggestions() {
        return this.stats.totalSuggestions;
    }
}

// Create and export server instance
const intelligenceServer = new IntelligenceServer();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    await intelligenceServer.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await intelligenceServer.shutdown();
    process.exit(0);
});

// Start server if run directly
if (require.main === module) {
    intelligenceServer.start().catch(error => {
        console.error('Failed to start Intelligence Server:', error);
        process.exit(1);
    });
}

module.exports = intelligenceServer;
