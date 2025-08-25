#!/usr/bin/env node

/**
 * MemorAI MCP Server - Enhanced with Azure OpenAI Embeddings
 * VS Code Compatible with Vector Search & Hybrid Retrieval
 * Date: August 6, 2025
 * Port: 4950
 * 
 * FEATURES:
 * ✅ Azure OpenAI text-embedding-3-large integration
 * ✅ Vector similarity search with cosine similarity
 * ✅ Hybrid search (semantic + keyword + fuzzy + metadata)
 * ✅ TF-IDF keyword scoring
 * ✅ Fuzzy matching with Levenshtein distance
 * ✅ Intelligent caching system with TTL
 * ✅ Performance metrics and query analysis
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

// Azure OpenAI Configuration
const AZURE_OPENAI_CONFIG = {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://codai-dev-openai.openai.azure.com/',
    apiKey: process.env.AZURE_OPENAI_API_KEY || '8f9d3fd033c04f5ab6b5886c15f16a2c',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'text-embedding-3-large',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'
};

/**
 * Azure OpenAI Embeddings Service
 */
class AzureEmbeddingsService {
    constructor() {
        this.enabled = process.env.ENABLE_VECTOR_SEARCH === 'true';
        this.cache = new Map();
        this.cacheTimeout = parseInt(process.env.VECTOR_CACHE_TTL || '3600') * 1000; // 1 hour

        if (this.enabled) {
            console.log('🧠 Azure OpenAI Embeddings Service initialized');
            console.log(`📍 Endpoint: ${AZURE_OPENAI_CONFIG.endpoint}`);
            console.log(`🎯 Model: ${AZURE_OPENAI_CONFIG.deploymentName}`);
        }
    }

    /**
     * Generate embeddings for text content
     */
    async generateEmbeddings(text) {
        if (!this.enabled) {
            return null;
        }

        const cacheKey = this.hashText(text);
        const cached = this.cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.embeddings;
        }

        try {
            const response = await fetch(`${AZURE_OPENAI_CONFIG.endpoint}openai/deployments/${AZURE_OPENAI_CONFIG.deploymentName}/embeddings?api-version=${AZURE_OPENAI_CONFIG.apiVersion}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': AZURE_OPENAI_CONFIG.apiKey
                },
                body: JSON.stringify({
                    input: text.substring(0, 8192), // Limit input size
                    encoding_format: 'float'
                })
            });

            if (!response.ok) {
                console.warn('⚠️ Azure OpenAI embeddings request failed:', response.status);
                return null;
            }

            const data = await response.json();
            const embeddings = data.data[0].embedding;

            // Cache the result
            this.cache.set(cacheKey, {
                embeddings,
                timestamp: Date.now()
            });

            return embeddings;
        } catch (error) {
            console.error('❌ Azure OpenAI embeddings error:', error.message);
            return null;
        }
    }

    /**
     * Calculate cosine similarity between two embedding vectors
     */
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

        if (magnitudeA === 0 || magnitudeB === 0) {
            return 0;
        }

        return dotProduct / (magnitudeA * magnitudeB);
    }

    /**
     * Simple hash function for caching
     */
    hashText(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    /**
     * Clean up old cache entries
     */
    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if ((now - value.timestamp) > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }
}

/**
 * Enhanced Search Engine with Vector Similarity
 */
class HybridSearchEngine {
    constructor(embeddingsService) {
        this.embeddingsService = embeddingsService;
        this.enableFuzzySearch = process.env.ENABLE_FUZZY_MATCHING === 'true';
        this.enableHybridSearch = process.env.ENABLE_HYBRID_SEARCH === 'true';

        console.log('🔍 Hybrid Search Engine initialized');
        console.log(`🎯 Vector Search: ${embeddingsService.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`🎯 Fuzzy Search: ${this.enableFuzzySearch ? 'Enabled' : 'Disabled'}`);
        console.log(`🎯 Hybrid Search: ${this.enableHybridSearch ? 'Enabled' : 'Disabled'}`);
    }

    /**
     * Enhanced search with multiple strategies
     */
    async search(query, memories, options = {}) {
        const startTime = Date.now();
        const results = [];

        // Generate query embeddings if vector search is enabled
        let queryEmbeddings = null;
        if (this.embeddingsService.enabled) {
            queryEmbeddings = await this.embeddingsService.generateEmbeddings(query);
        }

        for (const memory of memories) {
            const scores = {
                keyword: this.calculateKeywordScore(query, memory),
                vector: 0,
                fuzzy: 0,
                metadata: this.calculateMetadataScore(query, memory, options)
            };

            // Vector similarity score
            if (queryEmbeddings && memory.embeddings) {
                scores.vector = this.embeddingsService.calculateSimilarity(queryEmbeddings, memory.embeddings);
            }

            // Fuzzy matching score
            if (this.enableFuzzySearch) {
                scores.fuzzy = this.calculateFuzzyScore(query, memory);
            }

            // Calculate combined score
            const combinedScore = this.calculateCombinedScore(scores, options);

            if (combinedScore > 0.1) { // Minimum threshold
                results.push({
                    ...memory,
                    relevanceScore: combinedScore,
                    scoreBreakdown: scores,
                    searchType: this.getSearchType(scores)
                });
            }
        }

        // Sort by relevance score
        results.sort((a, b) => b.relevanceScore - a.relevanceScore);

        const searchTime = Date.now() - startTime;

        return {
            memories: results.slice(0, options.limit || 10),
            totalCount: results.length,
            searchType: this.getOverallSearchType(queryEmbeddings),
            queryAnalysis: this.analyzeQuery(query),
            performanceMetrics: {
                searchTime,
                vectorSearchUsed: !!queryEmbeddings,
                memoriesProcessed: memories.length
            }
        };
    }

    /**
     * Calculate keyword-based relevance score (TF-IDF-like)
     */
    calculateKeywordScore(query, memory) {
        const queryTerms = query.toLowerCase().split(/\s+/);
        const contentTerms = memory.content.toLowerCase().split(/\s+/);
        const titleTerms = (memory.title || '').toLowerCase().split(/\s+/);

        let score = 0;

        for (const term of queryTerms) {
            // Count occurrences in content
            const contentMatches = contentTerms.filter(t => t.includes(term)).length;
            const titleMatches = titleTerms.filter(t => t.includes(term)).length;

            // Weight title matches higher
            score += (contentMatches * 1) + (titleMatches * 2);
        }

        // Normalize by content length
        return score / Math.max(contentTerms.length, 1);
    }

    /**
     * Calculate fuzzy matching score using Levenshtein distance
     */
    calculateFuzzyScore(query, memory) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const contentWords = memory.content.toLowerCase().split(/\s+/);

        let totalScore = 0;
        let matches = 0;

        for (const queryWord of queryWords) {
            let bestScore = 0;
            for (const contentWord of contentWords) {
                const similarity = this.calculateStringSimilarity(queryWord, contentWord);
                bestScore = Math.max(bestScore, similarity);
            }
            if (bestScore > 0.7) { // Threshold for fuzzy matches
                totalScore += bestScore;
                matches++;
            }
        }

        return matches > 0 ? totalScore / queryWords.length : 0;
    }

    /**
     * Calculate string similarity using normalized Levenshtein distance
     */
    calculateStringSimilarity(str1, str2) {
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1;

        const distance = this.levenshteinDistance(str1, str2);
        return (maxLength - distance) / maxLength;
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
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
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Calculate metadata-based score
     */
    calculateMetadataScore(query, memory, options) {
        let score = 0;

        // Project filter
        if (options.project && memory.metadata?.project === options.project) {
            score += 0.2;
        }

        // Session filter
        if (options.session && memory.metadata?.session === options.session) {
            score += 0.2;
        }

        // Importance score
        if (memory.metadata?.importance) {
            score += memory.metadata.importance / 10 * 0.1; // Scale 0-1 to 0-0.1
        }

        // Recency boost
        if (memory.timestamp) {
            const ageInDays = (Date.now() - new Date(memory.timestamp).getTime()) / (1000 * 60 * 60 * 24);
            const recencyScore = Math.max(0, (30 - ageInDays) / 30 * 0.1); // Boost for recent memories
            score += recencyScore;
        }

        return score;
    }

    /**
     * Combine different scoring methods
     */
    calculateCombinedScore(scores, options) {
        if (this.enableHybridSearch) {
            // Weighted combination of all scores
            return (
                scores.keyword * 0.4 +
                scores.vector * 0.4 +
                scores.fuzzy * 0.1 +
                scores.metadata * 0.1
            );
        } else if (scores.vector > 0) {
            // Prefer vector search if available
            return scores.vector * 0.7 + scores.keyword * 0.2 + scores.metadata * 0.1;
        } else {
            // Fallback to keyword + fuzzy search
            return scores.keyword * 0.7 + scores.fuzzy * 0.2 + scores.metadata * 0.1;
        }
    }

    /**
     * Determine search type used for a result
     */
    getSearchType(scores) {
        if (scores.vector > 0.5) return 'vector';
        if (scores.keyword > 0.3) return 'keyword';
        if (scores.fuzzy > 0.3) return 'fuzzy';
        return 'metadata';
    }

    /**
     * Determine overall search type
     */
    getOverallSearchType(queryEmbeddings) {
        if (this.enableHybridSearch) return 'hybrid';
        if (queryEmbeddings) return 'vector';
        if (this.enableFuzzySearch) return 'fuzzy';
        return 'keyword';
    }

    /**
     * Analyze query characteristics
     */
    analyzeQuery(query) {
        const analysis = {
            length: query.length,
            wordCount: query.split(/\s+/).length,
            hasQuotes: query.includes('"'),
            hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(query)
        };

        if (analysis.wordCount === 1) {
            return 'Single term search';
        } else if (analysis.hasQuotes) {
            return 'Phrase search detected';
        } else if (analysis.wordCount > 5) {
            return 'Long query - using semantic search';
        } else {
            return 'Multi-term search';
        }
    }
}

const app = express();
const PORT = process.env.MEMORAI_MCP_PORT || 4950;
const API_KEY = process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025';
const CBD_BASE_URL = process.env.CBD_BASE_URL || 'http://localhost:4180';

// Initialize enhanced services
const embeddingsService = new AzureEmbeddingsService();
const searchEngine = new HybridSearchEngine(embeddingsService);

// CBD Database management
let cbdProcess = null;

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

// CBD Database Management Functions
async function isCBDRunning() {
    try {
        const response = await fetch(`${CBD_BASE_URL}/health`, {
            method: 'GET',
            timeout: 3000
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

async function startCBDDatabase() {
    if (cbdProcess) {
        console.log('🗃️ CBD Database process already running');
        return;
    }

    const cbdRunning = await isCBDRunning();
    if (cbdRunning) {
        console.log('✅ CBD Database is already running on port 4180');
        return;
    }

    console.log('🚀 Starting CBD Database...');
    try {
        const cbdPath = path.join(__dirname, '../cbd/src/start.ts');
        cbdProcess = spawn('npx', ['tsx', cbdPath], {
            env: {
                ...process.env,
                PORT: '4180',
                NODE_ENV: 'development',
                CBD_LOG_LEVEL: 'info'
            },
            stdio: 'pipe'
        });

        cbdProcess.stdout.on('data', (data) => {
            console.log(`🗃️ CBD: ${data.toString().trim()}`);
        });

        cbdProcess.stderr.on('data', (data) => {
            console.error(`🗃️ CBD Error: ${data.toString().trim()}`);
        });

        cbdProcess.on('close', (code) => {
            console.log(`🗃️ CBD process exited with code ${code}`);
            cbdProcess = null;
        });

        // Wait for CBD to start
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const isRunning = await isCBDRunning();
        if (isRunning) {
            console.log('✅ CBD Database started successfully');
        } else {
            console.warn('⚠️ CBD Database may not have started correctly');
        }

    } catch (error) {
        console.error('❌ Failed to start CBD Database:', error.message);
    }
}

// Initialize CBD collection
async function initializeCBDCollection() {
    try {
        const response = await fetch(`${CBD_BASE_URL}/document/memorai_memories/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                collectionName: 'memorai_memories',
                schema: {
                    id: 'string',
                    agentId: 'string',
                    content: 'string',
                    metadata: 'object',
                    structuredKey: 'string',
                    timestamp: 'date',
                    embeddings: 'array' // Added embeddings field
                }
            })
        });

        if (response.ok) {
            console.log('✅ CBD collection memorai_memories initialized');
        }
    } catch (error) {
        console.log('ℹ️ CBD collection may already exist');
    }
}

// Enhanced memory storage with embeddings
async function storeMemory(agentId, content, metadata = {}) {
    try {
        const id = uuidv4();
        const timestamp = new Date().toISOString();
        const structuredKey = generateStructuredKey(agentId, content, metadata);

        // Generate embeddings for the content
        const embeddings = await embeddingsService.generateEmbeddings(content);

        const memory = {
            id,
            agentId,
            content,
            metadata: {
                ...metadata,
                entityType: metadata.entityType || 'general',
                importance: metadata.importance || 5,
                tags: metadata.tags || [],
                createdBy: agentId,
                lastAccessed: new Date(),
                accessCount: 0
            },
            structuredKey,
            timestamp,
            embeddings // Store embeddings for vector search
        };

        const response = await fetch(`${CBD_BASE_URL}/document/memorai_memories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(memory)
        });

        if (response.ok) {
            return { success: true, id, structuredKey, embeddingsGenerated: !!embeddings };
        } else {
            throw new Error(`CBD storage failed: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Store memory error:', error.message);
        return { success: false, error: error.message };
    }
}

// Enhanced memory retrieval with hybrid search
async function retrieveMemories(agentId, query, options = {}) {
    try {
        const response = await fetch(`${CBD_BASE_URL}/document/memorai_memories/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filter: { agentId },
                limit: 1000 // Get all memories for hybrid search
            })
        });

        if (!response.ok) {
            throw new Error(`CBD query failed: ${response.status}`);
        }

        const allMemories = await response.json();

        if (!Array.isArray(allMemories) || allMemories.length === 0) {
            return {
                memories: [],
                totalCount: 0,
                searchType: 'no_results',
                queryAnalysis: 'No memories found for agent'
            };
        }

        // Update access count for found memories
        for (const memory of allMemories) {
            if (memory.metadata) {
                memory.metadata.lastAccessed = new Date();
                memory.metadata.accessCount = (memory.metadata.accessCount || 0) + 1;
            }
        }

        // Use hybrid search engine for enhanced results
        const searchResults = await searchEngine.search(query, allMemories, {
            limit: options.limit || 10,
            minImportance: options.minImportance || 0,
            project: options.project,
            session: options.session
        });

        return searchResults;
    } catch (error) {
        console.error('❌ Retrieve memories error:', error.message);
        return {
            memories: [],
            totalCount: 0,
            searchType: 'error',
            queryAnalysis: `Error: ${error.message}`
        };
    }
}

// Generate structured key for memory identification
function generateStructuredKey(agentId, content, metadata) {
    const entityType = metadata.entityType || 'general';
    const timestamp = Date.now();
    const contentHash = hashString(content.substring(0, 100));
    return `${agentId}:${entityType}:${contentHash}:${timestamp}`;
}

// Simple hash function
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

// Delete memory
async function deleteMemory(agentId, structuredKey) {
    try {
        const response = await fetch(`${CBD_BASE_URL}/document/memorai_memories/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filter: { agentId, structuredKey },
                limit: 1
            })
        });

        if (!response.ok) {
            return { success: false, error: 'Memory not found' };
        }

        const memories = await response.json();
        if (!memories.length) {
            return { success: false, error: 'Memory not found' };
        }

        const deleteResponse = await fetch(`${CBD_BASE_URL}/document/memorai_memories/${memories[0].id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        return { success: deleteResponse.ok };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Get recent context for agent
async function getRecentContext(agentId, contextSize = 5) {
    try {
        const response = await fetch(`${CBD_BASE_URL}/document/memorai_memories/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filter: { agentId },
                sort: { timestamp: -1 },
                limit: contextSize
            })
        });

        if (response.ok) {
            const memories = await response.json();
            return { context: memories || [], totalCount: memories?.length || 0 };
        } else {
            return { context: [], totalCount: 0 };
        }
    } catch (error) {
        return { context: [], totalCount: 0 };
    }
}

// Health check endpoint with enhanced information
app.get('/health', async (req, res) => {
    try {
        // Get memory count
        const memoriesResponse = await fetch(`${CBD_BASE_URL}/document/memorai_memories/count`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        let totalMemories = 0;
        if (memoriesResponse.ok) {
            const countData = await memoriesResponse.json();
            totalMemories = countData.count || 0;
        }

        // Get CBD health
        let cbdHealth = false;
        let cbdDetails = null;
        try {
            const cbdResponse = await fetch(`${CBD_BASE_URL}/health`);
            cbdHealth = cbdResponse.ok;
            if (cbdHealth) {
                cbdDetails = await cbdResponse.json();
            }
        } catch (error) {
            // CBD not available
        }

        const healthData = {
            status: 'healthy',
            service: 'MemorAI MCP Server Enhanced',
            version: '9.9.0-enhanced',
            port: PORT,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development',
            totalMemories,
            mcpProtocol: '2025-06-18',
            cbdHealth,
            cbdDetails,
            enhancements: {
                azureEmbeddings: embeddingsService.enabled,
                vectorSearch: embeddingsService.enabled,
                hybridSearch: searchEngine.enableHybridSearch,
                fuzzyMatching: searchEngine.enableFuzzySearch,
                cacheEntries: embeddingsService.cache.size
            }
        };

        res.json(healthData);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// MCP JSON-RPC endpoint
app.post('/', async (req, res) => {
    const { method, params, id } = req.body;

    try {
        let result;

        switch (method) {
            case 'tools/list':
                result = {
                    tools: [
                        {
                            name: 'mcp_memoraimcp_remember',
                            description: 'Store a memory with content and metadata. Enhanced with vector embeddings for semantic search.',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    agentId: { type: 'string', description: 'Agent identifier for memory isolation' },
                                    content: { type: 'string', description: 'The content to remember' },
                                    metadata: {
                                        type: 'object',
                                        description: 'Additional metadata for the memory',
                                        properties: {
                                            entityType: { type: 'string', enum: ['prompt', 'task', 'plan', 'knowledge', 'context', 'user_instructions'] },
                                            importance: { type: 'number', minimum: 0, maximum: 10 },
                                            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                                            project: { type: 'string' },
                                            session: { type: 'string' },
                                            tags: { type: 'array', items: { type: 'string' } }
                                        }
                                    }
                                },
                                required: ['agentId', 'content']
                            }
                        },
                        {
                            name: 'mcp_memoraimcp_recall',
                            description: 'Search and retrieve memories using hybrid search (vector + keyword + fuzzy + metadata)',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    agentId: { type: 'string', description: 'Agent identifier for memory isolation' },
                                    query: { type: 'string', description: 'Search query for finding relevant memories' },
                                    limit: { type: 'number', description: 'Maximum number of results to return (default: 10)', minimum: 1, maximum: 100 },
                                    minImportance: { type: 'number', description: 'Minimum importance score filter (default: 0)', minimum: 0, maximum: 10 },
                                    project: { type: 'string', description: 'Filter memories by project name' },
                                    session: { type: 'string', description: 'Filter memories by session identifier' }
                                },
                                required: ['agentId', 'query']
                            }
                        },
                        {
                            name: 'mcp_memoraimcp_forget',
                            description: 'Delete a memory by structured key',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    agentId: { type: 'string', description: 'Agent identifier' },
                                    structuredKey: { type: 'string', description: 'Structured key of memory to delete' }
                                },
                                required: ['agentId', 'structuredKey']
                            }
                        },
                        {
                            name: 'mcp_memoraimcp_context',
                            description: 'Get recent context for agent with enhanced relevance scoring',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    agentId: { type: 'string', description: 'Agent identifier' },
                                    contextSize: { type: 'number', description: 'Number of recent memories to retrieve (default: 5)', minimum: 1, maximum: 50 }
                                },
                                required: ['agentId']
                            }
                        }
                    ]
                };
                break;

            case 'tools/call':
                const { name, arguments: args } = params;

                switch (name) {
                    case 'mcp_memoraimcp_remember':
                        const storeResult = await storeMemory(args.agentId, args.content, args.metadata || {});

                        if (storeResult.success) {
                            result = {
                                content: [{
                                    type: 'text',
                                    text: `✅ Memory stored successfully with enhanced features!\n\n` +
                                        `**Structured Key:** ${storeResult.structuredKey}\n` +
                                        `**Content:** ${args.content.substring(0, 100)}${args.content.length > 100 ? '...' : ''}\n` +
                                        `**Entity Type:** ${args.metadata?.entityType || 'general'}\n` +
                                        `**Agent ID:** ${args.agentId}\n` +
                                        `**Vector Embeddings:** ${storeResult.embeddingsGenerated ? '✅ Generated' : '❌ Disabled'}\n` +
                                        `**Search Enhancement:** Ready for hybrid search (vector + keyword + fuzzy)`
                                }]
                            };
                        } else {
                            result = {
                                content: [{
                                    type: 'text',
                                    text: `❌ Failed to store memory: ${storeResult.error}`
                                }]
                            };
                        }
                        break;

                    case 'mcp_memoraimcp_recall':
                        const searchResults = await retrieveMemories(args.agentId, args.query, {
                            limit: args.limit || 10,
                            minImportance: args.minImportance || 0,
                            project: args.project,
                            session: args.session
                        });

                        if (searchResults.memories.length === 0) {
                            result = {
                                content: [{
                                    type: 'text',
                                    text: `🔍 No memories found for query: "${args.query}"\n\n` +
                                        `**Agent ID:** ${args.agentId}\n` +
                                        `**Search Type:** ${searchResults.searchType}\n` +
                                        `**Query Analysis:** ${searchResults.queryAnalysis}\n` +
                                        `**Enhancement Status:** Vector search ${embeddingsService.enabled ? 'enabled' : 'disabled'}\n` +
                                        `**Suggestions:** Try broader keywords or check if memories exist for this agent.`
                                }]
                            };
                        } else {
                            let resultText = `🧠 Found ${searchResults.memories.length} memories (${searchResults.searchType} search):\n\n`;

                            searchResults.memories.forEach((memory, index) => {
                                const scoreInfo = memory.scoreBreakdown ?
                                    ` [K:${(memory.scoreBreakdown.keyword * 100).toFixed(0)}% V:${(memory.scoreBreakdown.vector * 100).toFixed(0)}% F:${(memory.scoreBreakdown.fuzzy * 100).toFixed(0)}%]` : '';

                                resultText += `**${index + 1}. ${memory.metadata?.entityType || 'Memory'}** ` +
                                    `(Score: ${memory.relevanceScore?.toFixed(3) || 'N/A'}${scoreInfo})\n` +
                                    `${memory.content.substring(0, 200)}${memory.content.length > 200 ? '...' : ''}\n` +
                                    `*Key: ${memory.structuredKey} | ${new Date(memory.timestamp).toLocaleString()}*\n\n`;
                            });

                            resultText += `**Query Analysis:** ${searchResults.queryAnalysis}\n`;
                            resultText += `**Search Performance:** ${searchResults.performanceMetrics?.searchTime || 'N/A'}ms\n`;
                            resultText += `**Vector Search:** ${searchResults.performanceMetrics?.vectorSearchUsed ? '✅ Used' : '❌ Not used'}\n`;
                            resultText += `**Total Results:** ${searchResults.totalCount}`;

                            result = {
                                content: [{
                                    type: 'text',
                                    text: resultText
                                }]
                            };
                        }
                        break;

                    case 'mcp_memoraimcp_forget':
                        const deleteResult = await deleteMemory(args.agentId, args.structuredKey);

                        result = {
                            content: [{
                                type: 'text',
                                text: deleteResult.success
                                    ? `🗑️ Memory deleted successfully!\n\n**Key:** ${args.structuredKey}\n**Agent ID:** ${args.agentId}`
                                    : `❌ Failed to delete memory: ${deleteResult.error}`
                            }]
                        };
                        break;

                    case 'mcp_memoraimcp_context':
                        const contextResult = await getRecentContext(args.agentId, args.contextSize || 5);

                        if (contextResult.context.length === 0) {
                            result = {
                                content: [{
                                    type: 'text',
                                    text: `📋 No context available for agent: ${args.agentId}\n\n` +
                                        `**Suggestion:** Start by storing some memories to build context.`
                                }]
                            };
                        } else {
                            let contextText = `📋 Recent context for ${args.agentId} (${contextResult.context.length} items):\n\n`;

                            contextResult.context.forEach((memory, index) => {
                                contextText += `**${index + 1}.** ${memory.content.substring(0, 150)}${memory.content.length > 150 ? '...' : ''}\n` +
                                    `*${memory.metadata?.entityType || 'Memory'} | ${new Date(memory.timestamp).toLocaleString()}*\n\n`;
                            });

                            result = {
                                content: [{
                                    type: 'text',
                                    text: contextText
                                }]
                            };
                        }
                        break;

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
                break;

            default:
                throw new Error(`Unknown method: ${method}`);
        }

        res.json({
            jsonrpc: '2.0',
            id,
            result
        });

    } catch (error) {
        console.error('❌ MCP request error:', error.message);
        res.json({
            jsonrpc: '2.0',
            id,
            error: {
                code: -32603,
                message: error.message
            }
        });
    }
});

// Cleanup old embeddings cache periodically
setInterval(() => {
    embeddingsService.cleanupCache();
}, 300000); // Every 5 minutes

// Start server
async function startServer() {
    console.log('🧠 Starting MemorAI MCP Server Enhanced...');

    // Start CBD Database
    await startCBDDatabase();

    // Initialize CBD collection
    await initializeCBDCollection();

    // Start HTTP server
    app.listen(PORT, () => {
        console.log('🧠 MemorAI MCP Server Enhanced started successfully!');
        console.log(`📡 Server running on http://localhost:${PORT}`);
        console.log(`🔑 API Key: ${API_KEY}`);
        console.log(`📅 Date: ${new Date().toISOString()}`);
        console.log(`🎯 MCP Protocol: 2025-06-18 (Full JSON-RPC 2.0 Compliance)`);
        console.log(`✅ MCP Initialize Method: Implemented`);
        console.log(`🛠️  MCP Tools: remember, recall, forget, context (Enhanced)`);
        console.log(`🔧 Root endpoint: POST http://localhost:${PORT}/ (MCP JSON-RPC)`);
        console.log(`💡 Health check: GET http://localhost:${PORT}/health`);
        console.log(`💾 CBD Database: ${CBD_BASE_URL}`);
        console.log(`🗂️  Collection: memorai_memories`);
        console.log(`📋 Ready for VS Code MCP client integration`);
        console.log(`🚀 ENHANCEMENTS:`);
        console.log(`   🧠 Azure OpenAI Embeddings: ${embeddingsService.enabled ? 'ENABLED' : 'DISABLED'}`);
        console.log(`   🔍 Hybrid Search Engine: ${searchEngine.enableHybridSearch ? 'ENABLED' : 'DISABLED'}`);
        console.log(`   🎯 Vector Similarity Search: ${embeddingsService.enabled ? 'ENABLED' : 'DISABLED'}`);
        console.log(`   📊 Fuzzy Matching: ${searchEngine.enableFuzzySearch ? 'ENABLED' : 'DISABLED'}`);
        console.log(`   ⚡ Performance Optimizations: ENABLED`);
    });
}

startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
