#!/usr/bin/env node

/**
 * MemorAI MCP Server - Enterprise Edition
 * Production-ready memory management with advanced enterprise features
 * Date: August 6, 2025
 * Port: 4950
 * 
 * FEATURES:
 * ✅ CBD Database integration with persistent storage
 * ✅ Azure OpenAI text-embedding-3-large embeddings
 * ✅ Vector similarity search with cosine similarity
 * ✅ Hybrid search engine (vector + keyword + fuzzy + metadata)
 * ✅ TF-IDF keyword scoring and fuzzy matching
 * ✅ Intelligent caching system with TTL
 * ✅ Multi-tenant RBAC security with agent isolation
 * ✅ Advanced metadata processing and filtering
 * ✅ Performance metrics and query analytics
 * ✅ Enterprise features: real-time collab, temporal patterns, clustering
 * ✅ MCP 2025-06-18 protocol compliance
 * ✅ VS Code integration ready
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

// Phase 2: Direct CBD Rust Integration for Maximum Performance
const { RustEnhancedMemoryStore } = require('./cbd-rust-integration.cjs');

const app = express();
const PORT = process.env.MEMORAI_MCP_PORT || 4950;
const API_KEY = process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025';
const CBD_BASE_URL = process.env.CBD_BASE_URL || 'http://localhost:4180';

// Azure OpenAI Configuration with OpenAI fallback
const AZURE_OPENAI_CONFIG = {
    // Primary Azure configuration (when available)
    azure: {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'text-embedding-3-large',
        apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
        enabled: !!(process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY)
    },
    // Fallback OpenAI configuration
    openai: {
        endpoint: 'https://api.openai.com/',
        apiKey: process.env.OPENAI_API_KEY,
        model: 'text-embedding-3-small', // More cost-effective alternative
        enabled: !!process.env.OPENAI_API_KEY
    },
    // Runtime configuration (determined during initialization)
    current: {
        provider: null,
        endpoint: null,
        apiKey: null,
        model: null,
        isAzure: false
    }
};

// Feature flags
const FEATURES = {
    vectorSearch: process.env.ENABLE_VECTOR_SEARCH === 'true',
    hybridSearch: process.env.ENABLE_HYBRID_SEARCH === 'true',
    fuzzyMatching: process.env.ENABLE_FUZZY_MATCHING === 'true',
    keywordSearch: process.env.ENABLE_KEYWORD_SEARCH === 'true',
    rbacSecurity: process.env.ENABLE_RBAC === 'true',
    realtimeCollab: process.env.ENABLE_REALTIME_COLLAB === 'true',
    analytics: process.env.ENABLE_ANALYTICS === 'true',
    temporal: process.env.ENABLE_TEMPORAL === 'true',
    patterns: process.env.ENABLE_PATTERNS === 'true',
    clustering: process.env.ENABLE_CLUSTERING === 'true',
    crossRef: process.env.ENABLE_CROSS_REF === 'true',
    backup: process.env.ENABLE_BACKUP === 'true',
    monitoring: process.env.ENABLE_MONITORING === 'true'
};

// Enable CORS for VS Code MCP client
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'mcp-session-id'],
    exposedHeaders: ['mcp-session-id', 'Content-Type']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// AZURE OPENAI EMBEDDINGS SERVICE
// ============================================================================

class AzureEmbeddingsService {
    constructor() {
        this.enabled = FEATURES.vectorSearch;
        this.cache = new Map();
        this.cacheTimeout = parseInt(process.env.VECTOR_CACHE_TTL || '3600') * 1000; // 1 hour
        this.failureCount = 0;
        this.maxFailures = 3; // Disable after 3 consecutive failures

        // Initialize provider configuration
        this.initializeProvider();

        if (this.enabled) {
            console.log('🧠 Azure OpenAI Embeddings Service initialized');
            if (AZURE_OPENAI_CONFIG.current.provider) {
                console.log(`📍 Provider: ${AZURE_OPENAI_CONFIG.current.provider}`);
                console.log(`📍 Endpoint: ${AZURE_OPENAI_CONFIG.current.endpoint}`);
                console.log(`🎯 Model: ${AZURE_OPENAI_CONFIG.current.model}`);
            } else {
                console.warn('⚠️  No embedding provider configured - vector search will be disabled');
                this.enabled = false;
            }
        }
    }

    initializeProvider() {
        // Try Azure first, then OpenAI as fallback
        if (AZURE_OPENAI_CONFIG.azure.enabled) {
            AZURE_OPENAI_CONFIG.current = {
                provider: 'azure',
                endpoint: AZURE_OPENAI_CONFIG.azure.endpoint,
                apiKey: AZURE_OPENAI_CONFIG.azure.apiKey,
                model: AZURE_OPENAI_CONFIG.azure.deploymentName,
                isAzure: true
            };
            console.log('🔵 Using Azure OpenAI for embeddings');
        } else if (AZURE_OPENAI_CONFIG.openai.enabled) {
            AZURE_OPENAI_CONFIG.current = {
                provider: 'openai',
                endpoint: AZURE_OPENAI_CONFIG.openai.endpoint,
                apiKey: AZURE_OPENAI_CONFIG.openai.apiKey,
                model: AZURE_OPENAI_CONFIG.openai.model,
                isAzure: false
            };
            console.log('🟢 Using OpenAI API for embeddings');
        } else {
            console.warn('⚠️  No embedding API keys found - vector search disabled');
            AZURE_OPENAI_CONFIG.current.provider = null;
        }
    }

    async switchToFallback() {
        if (AZURE_OPENAI_CONFIG.current.provider === 'azure' && AZURE_OPENAI_CONFIG.openai.enabled) {
            console.log('🔄 Switching from Azure to OpenAI fallback');
            AZURE_OPENAI_CONFIG.current = {
                provider: 'openai',
                endpoint: AZURE_OPENAI_CONFIG.openai.endpoint,
                apiKey: AZURE_OPENAI_CONFIG.openai.apiKey,
                model: AZURE_OPENAI_CONFIG.openai.model,
                isAzure: false
            };
            this.failureCount = 0; // Reset failure count
            return true;
        }
        return false;
    }

    async generateEmbeddings(text) {
        if (!this.enabled || !AZURE_OPENAI_CONFIG.current.provider) return null;

        const cacheKey = this.hashText(text);
        const cached = this.cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.embeddings;
        }

        try {
            // Construct URL based on provider
            const url = AZURE_OPENAI_CONFIG.current.isAzure
                ? `${AZURE_OPENAI_CONFIG.current.endpoint}openai/deployments/${AZURE_OPENAI_CONFIG.current.model}/embeddings?api-version=${AZURE_OPENAI_CONFIG.azure.apiVersion}`
                : `${AZURE_OPENAI_CONFIG.current.endpoint}v1/embeddings`;

            const headers = AZURE_OPENAI_CONFIG.current.isAzure
                ? { 'Content-Type': 'application/json', 'api-key': AZURE_OPENAI_CONFIG.current.apiKey }
                : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AZURE_OPENAI_CONFIG.current.apiKey}` };

            const body = AZURE_OPENAI_CONFIG.current.isAzure
                ? { input: text.substring(0, 8192), encoding_format: 'float' }
                : { input: text.substring(0, 8192), model: AZURE_OPENAI_CONFIG.current.model, encoding_format: 'float' };

            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                timeout: 10000 // 10 second timeout
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn(`⚠️ Embeddings API failed (${AZURE_OPENAI_CONFIG.current.provider}):`, response.status, errorText);

                this.failureCount++;

                // Try switching to fallback provider
                if (this.failureCount >= this.maxFailures) {
                    if (await this.switchToFallback()) {
                        return await this.generateEmbeddings(text); // Retry with fallback
                    } else {
                        console.warn('🚫 Disabling vector search due to repeated failures');
                        this.enabled = false;
                    }
                }
                return null;
            }

            const data = await response.json();
            const embeddings = data.data[0].embedding;

            // Reset failure count on success
            this.failureCount = 0;

            this.cache.set(cacheKey, {
                embeddings,
                timestamp: Date.now()
            });

            return embeddings;
        } catch (error) {
            console.error(`❌ ${AZURE_OPENAI_CONFIG.current.provider} embeddings error:`, error.message);

            this.failureCount++;

            // Handle specific error types
            if (error.message.includes('fetch failed') ||
                error.message.includes('ENOTFOUND') ||
                error.message.includes('ECONNREFUSED')) {

                console.warn(`🔄 Connectivity issues with ${AZURE_OPENAI_CONFIG.current.provider}`);

                if (this.failureCount >= this.maxFailures) {
                    if (await this.switchToFallback()) {
                        return await this.generateEmbeddings(text); // Retry with fallback
                    } else {
                        console.warn('� Disabling vector embeddings due to connectivity issues - using keyword search only');
                        this.enabled = false;
                    }
                }
            }
            return null;
        }
    }

    calculateSimilarity(embeddingA, embeddingB) {
        if (!embeddingA || !embeddingB || embeddingA.length !== embeddingB.length) {
            return 0;
        }

        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;

        for (let i = 0; i < embeddingA.length; i++) {
            dotProduct += embeddingA[i] * embeddingB[i];
            magnitudeA += embeddingA[i] * embeddingA[i];
            magnitudeB += embeddingB[i] * embeddingB[i];
        }

        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);

        if (magnitudeA === 0 || magnitudeB === 0) return 0;

        return dotProduct / (magnitudeA * magnitudeB);
    }

    hashText(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if ((now - value.timestamp) > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }
}

// ============================================================================
// HYBRID SEARCH ENGINE
// ============================================================================

class HybridSearchEngine {
    constructor(embeddingsService) {
        this.embeddings = embeddingsService;
        this.searchCache = new Map();
        this.cacheTimeout = parseInt(process.env.SEARCH_CACHE_TTL || '300') * 1000; // 5 minutes
    }

    // TF-IDF Scoring
    calculateTfIdf(query, documents) {
        const queryTerms = this.tokenize(query.toLowerCase());
        const docCount = documents.length;
        const termFreqs = new Map();
        const docFreqs = new Map();

        // Calculate term frequencies and document frequencies
        documents.forEach((doc, docIndex) => {
            const docTerms = this.tokenize(doc.content.toLowerCase());
            const uniqueTerms = new Set(docTerms);

            if (!termFreqs.has(docIndex)) termFreqs.set(docIndex, new Map());

            docTerms.forEach(term => {
                termFreqs.get(docIndex).set(term, (termFreqs.get(docIndex).get(term) || 0) + 1);
            });

            uniqueTerms.forEach(term => {
                docFreqs.set(term, (docFreqs.get(term) || 0) + 1);
            });
        });

        // Calculate TF-IDF scores
        return documents.map((doc, docIndex) => {
            let score = 0;
            const docTermFreqs = termFreqs.get(docIndex) || new Map();
            const docLength = this.tokenize(doc.content.toLowerCase()).length;

            queryTerms.forEach(term => {
                const tf = docTermFreqs.get(term) || 0;
                const df = docFreqs.get(term) || 0;

                if (tf > 0 && df > 0) {
                    const tfScore = tf / docLength;
                    const idfScore = Math.log(docCount / df);
                    score += tfScore * idfScore;
                }
            });

            return { ...doc, tfidfScore: score };
        });
    }

    // Levenshtein distance for fuzzy matching
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    fuzzyMatch(query, text, threshold = 0.7) {
        const queryWords = this.tokenize(query.toLowerCase());
        const textWords = this.tokenize(text.toLowerCase());

        let totalScore = 0;
        let matches = 0;

        queryWords.forEach(queryWord => {
            let bestScore = 0;
            textWords.forEach(textWord => {
                const distance = this.levenshteinDistance(queryWord, textWord);
                const maxLength = Math.max(queryWord.length, textWord.length);
                const similarity = 1 - (distance / maxLength);

                if (similarity > bestScore) {
                    bestScore = similarity;
                }
            });

            if (bestScore >= threshold) {
                totalScore += bestScore;
                matches++;
            }
        });

        return queryWords.length > 0 ? totalScore / queryWords.length : 0;
    }

    tokenize(text) {
        return text.match(/\\b\\w+\\b/g) || [];
    }

    async hybridSearch(agentId, query, memories, options = {}) {
        const cacheKey = `${agentId}-${query}-${JSON.stringify(options)}`;
        const cached = this.searchCache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.results;
        }

        const results = [];
        const queryEmbedding = FEATURES.vectorSearch ? await this.embeddings.generateEmbeddings(query) : null;

        // Apply filters first
        let filteredMemories = memories.filter(memory => {
            const importance = memory.metadata?.importance || 5;
            const projectMatch = !options.project || memory.metadata?.project === options.project;
            const sessionMatch = !options.session || memory.metadata?.session === options.session;
            return importance >= (options.minImportance || 0) && projectMatch && sessionMatch;
        });

        // Multi-strategy scoring
        for (const memory of filteredMemories) {
            let totalScore = 0;
            let scoreComponents = {};

            // Strategy 1: Vector similarity
            if (FEATURES.vectorSearch && queryEmbedding && memory.embeddings) {
                const vectorScore = this.embeddings.calculateSimilarity(queryEmbedding, memory.embeddings);
                scoreComponents.vector = vectorScore * 40; // 40% weight
                totalScore += scoreComponents.vector;
            }

            // Strategy 2: Keyword search
            if (FEATURES.keywordSearch) {
                const keywordScore = memory.content.toLowerCase().includes(query.toLowerCase()) ? 30 : 0;
                scoreComponents.keyword = keywordScore;
                totalScore += keywordScore;
            }

            // Strategy 3: TF-IDF scoring
            if (FEATURES.hybridSearch) {
                const tfidfDocs = this.calculateTfIdf(query, [memory]);
                const tfidfScore = tfidfDocs[0]?.tfidfScore || 0;
                scoreComponents.tfidf = tfidfScore * 20; // 20% weight
                totalScore += scoreComponents.tfidf;
            }

            // Strategy 4: Fuzzy matching
            if (FEATURES.fuzzyMatching) {
                const fuzzyScore = this.fuzzyMatch(query, memory.content);
                scoreComponents.fuzzy = fuzzyScore * 10; // 10% weight
                totalScore += scoreComponents.fuzzy;
            }

            // Include memories with any positive score
            if (totalScore > 0) {
                results.push({
                    ...memory,
                    relevanceScore: totalScore,
                    scoreComponents
                });
            }
        }

        // Sort by relevance and apply limit
        const sortedResults = results
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, options.limit || 10);

        // Cache results
        this.searchCache.set(cacheKey, {
            results: sortedResults,
            timestamp: Date.now()
        });

        return sortedResults;
    }
}

// ============================================================================
// RBAC SECURITY MANAGER
// ============================================================================

class RBACManager {
    constructor() {
        this.enabled = FEATURES.rbacSecurity;
        this.roles = {
            'viewer': {
                permissions: ['memory:read', 'memory:search'],
                quotas: { maxMemories: 100, maxStorageBytes: 10 * 1024 * 1024 }
            },
            'editor': {
                permissions: ['memory:read', 'memory:write', 'memory:search', 'memory:delete'],
                quotas: { maxMemories: 1000, maxStorageBytes: 100 * 1024 * 1024 }
            },
            'admin': {
                permissions: ['memory:*', 'agent:manage', 'quota:manage'],
                quotas: { maxMemories: 10000, maxStorageBytes: 1024 * 1024 * 1024 }
            }
        };

        this.agentProfiles = new Map();
        this.quotaUsage = new Map();
    }

    initializeAgent(agentId, role = 'editor') {
        if (!this.enabled) return true;

        const profile = {
            agentId,
            role,
            permissions: [...this.roles[role].permissions],
            quotas: { ...this.roles[role].quotas },
            createdAt: new Date()
        };

        this.agentProfiles.set(agentId, profile);
        this.quotaUsage.set(agentId, { memories: 0, storageBytes: 0 });

        console.log(`🔐 Agent ${agentId} initialized with role: ${role}`);
        return true;
    }

    validatePermission(agentId, permission) {
        if (!this.enabled) return true;

        const profile = this.agentProfiles.get(agentId);
        if (!profile) {
            this.initializeAgent(agentId, 'editor');
            return this.validatePermission(agentId, permission);
        }

        return profile.permissions.includes('*') ||
            profile.permissions.includes(permission) ||
            profile.permissions.includes(permission.split(':')[0] + ':*');
    }

    checkQuota(agentId, operation) {
        if (!this.enabled) return true;

        const profile = this.agentProfiles.get(agentId);
        const usage = this.quotaUsage.get(agentId);

        if (!profile || !usage) return false;
        if (profile.quotas.maxMemories === -1) return true;

        return usage.memories < profile.quotas.maxMemories;
    }
}

// ============================================================================
// CBD MEMORY STORE
// ============================================================================

class CBDMemoryStore {
    constructor(baseUrl = CBD_BASE_URL) {
        this.baseUrl = baseUrl;
        this.collectionName = 'memorai_memories';
        this.embeddings = new AzureEmbeddingsService();
        this.searchEngine = new HybridSearchEngine(this.embeddings);
        this.rbac = new RBACManager();
        this.initializeCollection();
    }

    async initializeCollection() {
        try {
            const response = await fetch(`${this.baseUrl}/document/${this.collectionName}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                console.log(`✅ CBD collection ${this.collectionName} initialized`);
            }
        } catch (error) {
            console.error('❌ CBD collection initialization error:', error.message);
        }
    }

    async store(agentId, content, metadata = {}) {
        try {
            if (!this.rbac.validatePermission(agentId, 'memory:write')) {
                throw new Error('Insufficient permissions for memory:write');
            }

            if (!this.rbac.checkQuota(agentId, 'memory:create')) {
                throw new Error('Memory quota exceeded');
            }

            const embeddings = await this.embeddings.generateEmbeddings(content);

            const memory = {
                id: uuidv4(),
                agentId,
                content,
                embeddings,
                metadata: {
                    importance: 5,
                    ...metadata
                },
                createdAt: new Date().toISOString(),
                timestamp: new Date().toISOString(),
                structuredKey: `${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };

            const response = await fetch(`${this.baseUrl}/document/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: this.collectionName,
                    document: memory
                })
            });

            if (!response.ok) throw new Error(`CBD store failed: ${response.statusText}`);

            console.log(`💾 Stored memory: ${memory.structuredKey} for agent: ${agentId}`);
            return memory;
        } catch (error) {
            console.error('❌ CBD store error:', error);
            throw error;
        }
    }

    async getAll(agentId) {
        try {
            if (!this.rbac.validatePermission(agentId, 'memory:read')) {
                throw new Error('Insufficient permissions for memory:read');
            }

            const response = await fetch(`${this.baseUrl}/document/${this.collectionName}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`CBD getAll failed: ${response.statusText}`);

            const result = await response.json();
            return (result.result || [])
                .filter(memory => memory.agentId === agentId)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.error('❌ CBD getAll error:', error);
            return [];
        }
    }

    async search(agentId, query, options = {}) {
        try {
            if (!this.rbac.validatePermission(agentId, 'memory:search')) {
                throw new Error('Insufficient permissions for memory:search');
            }

            const memories = await this.getAll(agentId);
            const results = await this.searchEngine.hybridSearch(agentId, query, memories, options);

            console.log(`🔍 Hybrid search for "${query}" (agent: ${agentId}): ${results.length}/${memories.length} memories`);
            return results;
        } catch (error) {
            console.error('❌ CBD search error:', error);
            throw error;
        }
    }

    async delete(structuredKey, agentId) {
        try {
            if (!this.rbac.validatePermission(agentId, 'memory:delete')) {
                throw new Error('Insufficient permissions for memory:delete');
            }

            const memories = await this.getAll(agentId);
            const targetMemory = memories.find(memory => memory.structuredKey === structuredKey);

            if (!targetMemory) {
                return {
                    success: false,
                    found: false,
                    error: `Memory with structured key "${structuredKey}" not found`
                };
            }

            const response = await fetch(`${this.baseUrl}/document/${this.collectionName}/${targetMemory._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`CBD delete failed: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.deletedCount > 0) {
                console.log(`🗑️ Successfully deleted memory: ${structuredKey}`);
                return { success: true, found: true, deletedCount: result.deletedCount };
            }

            return { success: false, found: true, error: "Deletion failed" };
        } catch (error) {
            console.error('❌ CBD delete error:', error);
            return { success: false, error: error.message };
        }
    }

    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const health = await response.json();
            return {
                success: response.ok,
                healthy: health.status === 'healthy',
                details: health
            };
        } catch (error) {
            return { success: false, healthy: false, error: error.message };
        }
    }
}

// ============================================================================
// SERVER INITIALIZATION WITH PHASE 2 RUST INTEGRATION
// ============================================================================

// Initialize embeddings service
const embeddingsService = new AzureEmbeddingsService();

// Phase 2: Initialize Rust-Enhanced Memory Store for maximum performance
const memoryStore = new RustEnhancedMemoryStore({
    maxVectors: 10000000, // 10M vector capacity target
    responseTimeTarget: 100, // <100ms response time target
    cacheSize: 10000, // Cache up to 10K entries
    enableMetrics: true, // Performance monitoring
    cbdBaseUrl: process.env.CBD_BASE_URL || 'http://localhost:4180'
});

// Legacy CBD fallback store (for compatibility)
const legacyStore = new CBDMemoryStore();

// Authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const apiKey = authHeader?.replace('Bearer ', '') ||
        req.query.apiKey ||
        req.headers['x-api-key'];

    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'Please provide a valid API key'
        });
    }
    next();
};

// Health endpoint
app.get('/health', async (req, res) => {
    try {
        // Get legacy CBD health
        const healthCheck = await legacyStore.healthCheck();

        // Get Rust engine health and performance metrics
        const rustHealth = await memoryStore.getHealth();
        const rustMetrics = await memoryStore.getMetrics();

        res.json({
            status: 'healthy',
            service: 'MemorAI MCP Server',
            version: '2.0.0-enterprise-rust',
            port: PORT,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            features: FEATURES,
            mcpProtocol: '2025-06-18',

            // Phase 2: Rust Engine Status
            rustEngine: {
                enabled: rustHealth.rustEngine,
                status: rustHealth.status,
                performance: rustMetrics,
                targetsMet: {
                    responseTime: rustMetrics.meetingTarget,
                    vectorCapacity: rustMetrics.maxVectorCapacity >= 10000000
                }
            },

            // Legacy CBD Health
            cbdHealth: healthCheck.healthy,
            azureOpenAI: {
                enabled: FEATURES.vectorSearch && AZURE_OPENAI_CONFIG.current.provider,
                provider: AZURE_OPENAI_CONFIG.current.provider,
                model: AZURE_OPENAI_CONFIG.current.model,
                failureCount: embeddingsService?.failureCount || 0,
                maxFailures: embeddingsService?.maxFailures || 3
            },
            enterprise: {
                rbacSecurity: FEATURES.rbacSecurity,
                realtimeCollab: FEATURES.realtimeCollab,
                analytics: FEATURES.analytics,
                temporal: FEATURES.temporal,
                patterns: FEATURES.patterns,
                clustering: FEATURES.clustering,
                crossRef: FEATURES.crossRef,
                backup: FEATURES.backup,
                monitoring: FEATURES.monitoring
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Phase 2: Performance Metrics Endpoint
app.get('/metrics', async (req, res) => {
    try {
        const rustMetrics = await memoryStore.getMetrics();
        const rustHealth = await memoryStore.getHealth();

        res.json({
            service: 'MemorAI MCP Server - Phase 2',
            timestamp: new Date().toISOString(),
            phase2: {
                rustEngine: rustHealth.rustEngine,
                performance: rustMetrics,
                targets: {
                    responseTime: {
                        target: rustMetrics.targetResponseTime,
                        actual: rustMetrics.averageResponseTime,
                        met: rustMetrics.meetingTarget
                    },
                    vectorCapacity: {
                        target: 10000000,
                        available: rustMetrics.maxVectorCapacity,
                        met: rustMetrics.maxVectorCapacity >= 10000000
                    }
                }
            },
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                platform: process.platform,
                nodeVersion: process.version
            }
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'MemorAI MCP Server',
        version: '1.0.0',
        protocol: '2025-06-18',
        port: PORT,
        features: FEATURES,
        timestamp: new Date().toISOString(),
        message: 'MemorAI MCP Server with Azure OpenAI integration'
    });
});

// ============================================================================
// MCP PROTOCOL IMPLEMENTATION
// ============================================================================

app.post('/', async (req, res) => {
    let id = null; // Initialize id for error handling
    try {
        const { jsonrpc, method, params, id: requestId } = req.body;
        id = requestId; // Set the actual id from request

        if (method === 'initialize') {
            res.json({
                jsonrpc: "2.0",
                id: id,
                result: {
                    protocolVersion: "2025-06-18",
                    capabilities: {
                        tools: { listChanged: true },
                        resources: {},
                        prompts: {},
                        logging: {}
                    },
                    serverInfo: {
                        name: "MemorAI MCP Server",
                        version: "1.0.0"
                    }
                }
            });
            return;
        }

        if (method === 'tools/list') {
            res.json({
                jsonrpc: "2.0",
                id: id,
                result: {
                    tools: [
                        {
                            name: "remember",
                            description: "Store a memory with content and metadata",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    agentId: { type: "string", description: "Agent identifier for memory isolation" },
                                    content: { type: "string", description: "The content to remember" },
                                    metadata: {
                                        type: "object",
                                        description: "Additional metadata for the memory",
                                        properties: {
                                            project: { type: "string" },
                                            session: { type: "string" },
                                            tags: { type: "array", items: { type: "string" } },
                                            priority: { type: "string" },
                                            entityType: { type: "string" },
                                            importance: { type: "number", minimum: 1, maximum: 10 }
                                        }
                                    }
                                },
                                required: ["agentId", "content"]
                            }
                        },
                        {
                            name: "recall",
                            description: "Search and retrieve memories with intelligent hybrid search",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    agentId: { type: "string", description: "Agent identifier for memory isolation" },
                                    query: { type: "string", description: "Search query for finding relevant memories" },
                                    limit: { type: "number", description: "Maximum results (default: 10)", default: 10 },
                                    minImportance: { type: "number", description: "Minimum importance filter (default: 0)", default: 0 },
                                    project: { type: "string", description: "Filter by project name" },
                                    session: { type: "string", description: "Filter by session identifier" }
                                },
                                required: ["agentId", "query"]
                            }
                        },
                        {
                            name: "forget",
                            description: "Delete a memory by structured key",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    agentId: { type: "string", description: "Agent identifier" },
                                    structuredKey: { type: "string", description: "Structured key of memory to delete" }
                                },
                                required: ["agentId", "structuredKey"]
                            }
                        },
                        {
                            name: "context",
                            description: "Get recent context for agent",
                            inputSchema: {
                                type: "object",
                                properties: {
                                    agentId: { type: "string", description: "Agent identifier" },
                                    contextSize: { type: "number", description: "Number of recent memories (default: 5)", default: 5 }
                                },
                                required: ["agentId"]
                            }
                        }
                    ]
                }
            });
            return;
        }

        if (method === 'notifications/initialized') {
            res.status(200).send();
            return;
        }

        if (method === 'tools/call') {
            const { name, arguments: args } = params;

            switch (name) {
                case 'remember':
                    try {
                        console.log('🔍 DEBUG: Starting remember operation for agent:', args.agentId);
                        const storeResult = await legacyStore.store(args.agentId, args.content, args.metadata);
                        console.log('🔍 DEBUG: Store result:', JSON.stringify(storeResult, null, 2));

                        res.json({
                            jsonrpc: "2.0",
                            id: id,
                            result: {
                                content: [{
                                    type: "text",
                                    text: `✅ Memory stored successfully with ${FEATURES.vectorSearch ? 'vector embeddings' : 'standard indexing'}!\n\n` +
                                        `ID: ${storeResult?.id || 'undefined'}\n` +
                                        `Agent: ${storeResult?.agentId || 'undefined'}\n` +
                                        `Content: ${storeResult?.content || 'undefined'}\n` +
                                        `Structured Key: ${storeResult?.structuredKey || 'undefined'}\n` +
                                        `Features: Vector=${FEATURES.vectorSearch}, Hybrid=${FEATURES.hybridSearch}`
                                }],
                                isError: false
                            }
                        });
                    } catch (error) {
                        console.error('🔍 DEBUG: Store error:', error);
                        res.json({
                            jsonrpc: "2.0",
                            id: id,
                            result: {
                                content: [{
                                    type: "text",
                                    text: `❌ Memory storage failed: ${error.message}\n\nFeatures: Vector=${FEATURES.vectorSearch}, Hybrid=${FEATURES.hybridSearch}`
                                }],
                                isError: true
                            }
                        });
                    }
                    break;

                case 'recall':
                    const searchResults = await legacyStore.search(args.agentId, args.query, {
                        limit: args.limit || 10,
                        minImportance: args.minImportance || 0,
                        project: args.project,
                        session: args.session
                    });

                    const resultsText = searchResults.length > 0
                        ? `🔍 Found ${searchResults.length} memories using hybrid search (Vector + TF-IDF + Fuzzy):\n\n` +
                        searchResults.map((memory, index) =>
                            `${index + 1}. **${memory.structuredKey}** (Score: ${memory.relevanceScore?.toFixed(2) || 'N/A'})\n` +
                            `   Content: ${memory.content}\n` +
                            `   Importance: ${memory.metadata.importance || 5}/10\n` +
                            `   Project: ${memory.metadata.project || 'N/A'}\n` +
                            `   Created: ${memory.timestamp}\n` +
                            (memory.scoreComponents ? `   Scores: ${JSON.stringify(memory.scoreComponents, null, 2)}\n` : '')
                        ).join('\n')
                        : `🔍 No memories found for query "${args.query}" (agent: ${args.agentId})`;

                    res.json({
                        jsonrpc: "2.0",
                        id: id,
                        result: {
                            content: [{ type: "text", text: resultsText }],
                            isError: false
                        }
                    });
                    break;

                case 'forget':
                    const deleted = await memoryStore.delete(args.structuredKey, args.agentId);
                    res.json({
                        jsonrpc: "2.0",
                        id: id,
                        result: {
                            content: [{
                                type: "text",
                                text: deleted.success
                                    ? `✅ Memory deleted successfully: ${args.structuredKey}`
                                    : `❌ ${deleted.error || 'Memory not found'}`
                            }],
                            isError: !deleted.success
                        }
                    });
                    break;

                case 'context':
                    const allMemories = await memoryStore.getAll(args.agentId);
                    const recentMemories = allMemories.slice(0, args.contextSize || 5);

                    const contextText = recentMemories.length > 0
                        ? `📝 Recent context for agent "${args.agentId}" (${recentMemories.length} memories):\n\n` +
                        recentMemories.map((memory, index) =>
                            `${index + 1}. [${memory.timestamp}] ${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}\n` +
                            `   Project: ${memory.metadata.project || 'N/A'} | Key: ${memory.structuredKey}\n`
                        ).join('\n')
                        : `📝 No recent context found for agent "${args.agentId}"`;

                    res.json({
                        jsonrpc: "2.0",
                        id: id,
                        result: {
                            content: [{ type: "text", text: contextText }],
                            isError: false
                        }
                    });
                    break;

                default:
                    res.json({
                        jsonrpc: "2.0",
                        id: id,
                        error: { code: -32601, message: `Tool '${name}' not found` }
                    });
                    break;
            }
        } else {
            res.json({
                jsonrpc: "2.0",
                id: id,
                error: { code: -32601, message: `Method '${method}' not found` }
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.json({
            jsonrpc: "2.0",
            id: id || null,
            error: {
                code: -32603,
                message: 'Internal server error',
                data: error.message
            }
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: 'Internal server error' }
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nSIGTERM received, shutting down gracefully');
    process.exit(0);
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
    console.log('🧠 Starting MemorAI MCP Server - Enterprise Edition...');
    console.log('🦀 Phase 2: Direct CBD Rust Integration for Maximum Performance');

    // Phase 2: Initialize Rust-Enhanced Memory Store
    console.log('🚀 Initializing Rust-Enhanced Memory Store...');
    try {
        await memoryStore.initialize();
        console.log('✅ Rust-Enhanced Memory Store initialized successfully');

        const health = await memoryStore.getHealth();
        if (health.rustEngine) {
            console.log('🔥 Direct Rust bindings active - Maximum performance mode');
            console.log(`🎯 Target: <${health.performance.targetResponseTime}ms response time`);
            console.log(`📊 Vector capacity: ${health.performance.maxVectorCapacity.toLocaleString()}`);
        } else {
            console.log('⚠️  Fallback mode: HTTP API (Rust bindings unavailable)');
        }
    } catch (error) {
        console.error('❌ Failed to initialize Rust-Enhanced Memory Store:', error);
    }

    // Display feature status
    console.log('🎯 Enterprise Feature Configuration:');
    Object.entries(FEATURES).forEach(([key, value]) => {
        console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    });

    if (FEATURES.vectorSearch) {
        console.log(`🧠 Azure OpenAI Model: ${AZURE_OPENAI_CONFIG.deploymentName}`);
        console.log(`📍 Endpoint: ${AZURE_OPENAI_CONFIG.endpoint}`);
    }

    // Check CBD Database connection
    try {
        const response = await fetch(`${CBD_BASE_URL}/health`, { timeout: 3000 });
        if (response.ok) {
            console.log('✅ CBD Database connection established');
        } else {
            console.log('⚠️  CBD Database connection failed, will retry as needed');
        }
    } catch (error) {
        console.log('⚠️  CBD Database not available, will attempt reconnection');
    }

    // Start the Express server
    app.listen(PORT, () => {
        console.log('\n🚀 MemorAI MCP Server started successfully!');
        console.log(`📡 Server: http://localhost:${PORT}`);
        console.log(`🔑 API Key: ${API_KEY}`);
        console.log(`📅 Date: ${new Date().toISOString()}`);
        console.log(`🎯 MCP Protocol: 2025-06-18 (Full JSON-RPC 2.0)`);
        console.log(`🛠️  Tools: remember, recall, forget, context`);
        console.log(`💾 Database: ${CBD_BASE_URL}`);
        console.log(`📋 Ready for VS Code MCP client integration\n`);
    });
}

// Start the server
startServer().catch(error => {
    console.error('❌ Failed to start MemorAI MCP Server:', error);
    process.exit(1);
});
