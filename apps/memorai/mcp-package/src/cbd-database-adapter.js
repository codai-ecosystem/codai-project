/**
 * CBD Engine Database Adapter for MemoraiMCP
 * Replaces SQLite backend with enterprise-grade CBD Engine
 * Maintains API compatibility while leveraging CBD's advanced features
 */

import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class CBDEngineAdapter {
    constructor(options = {}) {
        this.host = options.host || process.env.CBD_HOST || 'localhost';
        this.port = options.port || process.env.CBD_PORT || 8080;
        this.database = options.database || process.env.CBD_DATABASE || 'memorai';
        this.apiKey = options.apiKey || process.env.CBD_API_KEY;
        this.baseUrl = `http://${this.host}:${this.port}`;

        // HTTP client configuration
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'X-Database': this.database,
                ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
            }
        });

        this.isInitialized = false;
        this.startupTime = Date.now();

        // Performance tracking
        this.metrics = {
            totalOperations: 0,
            averageResponseTime: 0,
            operationsPerSecond: 0,
            connectionPool: 0
        };

        console.error('🔗 CBD Engine Adapter initialized');
        console.error(`📊 Target: ${this.baseUrl}, Database: ${this.database}`);
    }

    async initialize() {
        try {
            // Test connectivity to CBD Engine
            const response = await this.client.get('/health');
            if (response.status !== 200) {
                throw new Error(`CBD Engine health check failed: ${response.status}`);
            }

            // Create database if it doesn't exist
            await this.client.post('/api/admin/database', {
                name: this.database,
                config: {
                    engine: 'cbd-enterprise',
                    features: ['memory-storage', 'vector-search', 'full-text-search']
                }
            });

            // Initialize schema
            await this.createSchema();

            this.isInitialized = true;
            console.error('🧠 CBD Engine Database Adapter v1.0.0 initialized successfully');
            console.error(`✅ Connected to CBD Engine at ${this.baseUrl}`);

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize CBD Engine connection:', error.message);
            throw error;
        }
    }

    async createSchema() {
        const schema = {
            tables: {
                memories: {
                    columns: {
                        id: { type: 'INTEGER', primary: true, autoIncrement: true },
                        structured_key: { type: 'TEXT', unique: true, notNull: true },
                        project_name: { type: 'TEXT', notNull: true },
                        session_name: { type: 'TEXT', notNull: true },
                        sequence_number: { type: 'INTEGER', notNull: true },
                        agent_id: { type: 'TEXT', notNull: true },
                        content: { type: 'TEXT', notNull: true },
                        content_hash: { type: 'TEXT', notNull: true },
                        metadata: { type: 'JSONB', default: '{}' },
                        embedding_summary: { type: 'TEXT' },
                        timestamp: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
                        last_accessed: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
                        access_count: { type: 'INTEGER', default: 0 },
                        importance_score: { type: 'REAL', default: 0.5 },
                        created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
                        updated_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
                    },
                    indexes: [
                        { name: 'idx_structured_key', columns: ['structured_key'] },
                        { name: 'idx_project_session', columns: ['project_name', 'session_name'] },
                        { name: 'idx_agent_id', columns: ['agent_id'] },
                        { name: 'idx_timestamp', columns: ['timestamp'] },
                        { name: 'idx_content_hash', columns: ['content_hash'] },
                        { name: 'idx_importance_score', columns: ['importance_score'] },
                        { name: 'idx_last_accessed', columns: ['last_accessed'] }
                    ]
                },
                memory_embeddings: {
                    columns: {
                        id: { type: 'INTEGER', primary: true, autoIncrement: true },
                        memory_id: { type: 'INTEGER', notNull: true },
                        embedding_data: { type: 'VECTOR', dimensions: 384 }, // Use CBD's vector type
                        embedding_model: { type: 'TEXT', default: 'xenova/all-MiniLM-L6-v2' },
                        created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
                    },
                    foreignKeys: [
                        {
                            column: 'memory_id',
                            references: { table: 'memories', column: 'id' },
                            onDelete: 'CASCADE'
                        }
                    ],
                    indexes: [
                        { name: 'idx_memory_embeddings_memory_id', columns: ['memory_id'] },
                        { name: 'idx_embedding_vector', columns: ['embedding_data'], type: 'HNSW' }
                    ]
                },
                semantic_search_cache: {
                    columns: {
                        id: { type: 'INTEGER', primary: true, autoIncrement: true },
                        query_hash: { type: 'TEXT', unique: true, notNull: true },
                        query_text: { type: 'TEXT', notNull: true },
                        results_json: { type: 'JSONB', notNull: true },
                        created_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
                        last_used: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' },
                        use_count: { type: 'INTEGER', default: 1 }
                    },
                    indexes: [
                        { name: 'idx_semantic_cache_query_hash', columns: ['query_hash'] },
                        { name: 'idx_semantic_cache_last_used', columns: ['last_used'] }
                    ]
                },
                database_info: {
                    columns: {
                        key: { type: 'TEXT', primary: true },
                        value: { type: 'TEXT', notNull: true },
                        updated_at: { type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' }
                    }
                }
            }
        };

        try {
            await this.client.post('/api/schema/create', schema);

            // Initialize database info
            await this.client.post('/api/data/memories/database_info', {
                records: [
                    { key: 'version', value: '7.0.0' },
                    { key: 'schema_version', value: '1.0.0' },
                    { key: 'engine', value: 'cbd-enterprise' },
                    { key: 'created_at', value: new Date().toISOString() }
                ]
            });

            console.error('✅ CBD Engine schema created successfully');
        } catch (error) {
            if (error.response?.status === 409) {
                console.error('📋 CBD Engine schema already exists, continuing...');
            } else {
                console.error('❌ Failed to create CBD Engine schema:', error.message);
                throw error;
            }
        }
    }

    async storeMemory(structuredKey, data) {
        const startTime = Date.now();

        try {
            const contentHash = crypto.createHash('sha256').update(data.content).digest('hex');

            const memoryRecord = {
                structured_key: structuredKey,
                project_name: data.project || 'default',
                session_name: data.session || 'default',
                sequence_number: data.sequence || 1,
                agent_id: data.agentId,
                content: data.content,
                content_hash: contentHash,
                metadata: JSON.stringify(data.metadata || {}),
                embedding_summary: data.embeddingSummary,
                importance_score: data.importance || 0.5,
                timestamp: new Date().toISOString()
            };

            const response = await this.client.post('/api/data/memories', {
                records: [memoryRecord]
            });

            // Store vector embedding if provided
            if (data.embedding && response.data.insertedIds?.length > 0) {
                await this.storeEmbedding(response.data.insertedIds[0], data.embedding, data.model);
            }

            this.updateMetrics(Date.now() - startTime);
            return response.data.insertedIds[0];

        } catch (error) {
            console.error('❌ Failed to store memory in CBD Engine:', error.message);
            throw error;
        }
    }

    async storeEmbedding(memoryId, embeddingData, model = 'xenova/all-MiniLM-L6-v2') {
        try {
            await this.client.post('/api/data/memory_embeddings', {
                records: [{
                    memory_id: memoryId,
                    embedding_data: embeddingData, // CBD Engine handles vector serialization
                    embedding_model: model,
                    created_at: new Date().toISOString()
                }]
            });
        } catch (error) {
            console.error('❌ Failed to store embedding:', error.message);
            throw error;
        }
    }

    async searchMemories(query, options = {}) {
        const startTime = Date.now();

        try {
            const searchParams = {
                query: query,
                limit: options.limit || 10,
                agentId: options.agentId,
                project: options.project,
                session: options.session,
                minImportance: options.minImportance || 0.0,
                searchType: 'semantic' // Use CBD's semantic search
            };

            const response = await this.client.post('/api/search/memories', searchParams);

            this.updateMetrics(Date.now() - startTime);
            return response.data.results || [];

        } catch (error) {
            console.error('❌ Failed to search memories:', error.message);
            throw error;
        }
    }

    async vectorSearch(embedding, options = {}) {
        const startTime = Date.now();

        try {
            const searchParams = {
                vector: embedding,
                limit: options.limit || 20,
                threshold: options.minScore || 0.0,
                table: 'memory_embeddings',
                vectorColumn: 'embedding_data'
            };

            const response = await this.client.post('/api/vector/search', searchParams);

            this.updateMetrics(Date.now() - startTime);
            return response.data.results || [];

        } catch (error) {
            console.error('❌ Failed to perform vector search:', error.message);
            throw error;
        }
    }

    async getMemoryByKey(structuredKey) {
        const startTime = Date.now();

        try {
            const response = await this.client.get(`/api/data/memories`, {
                params: {
                    filter: `structured_key = '${structuredKey}'`,
                    limit: 1
                }
            });

            // Update access tracking
            if (response.data.records?.length > 0) {
                const memory = response.data.records[0];
                await this.client.patch(`/api/data/memories/${memory.id}`, {
                    last_accessed: new Date().toISOString(),
                    access_count: (memory.access_count || 0) + 1
                });
            }

            this.updateMetrics(Date.now() - startTime);
            return response.data.records?.[0] || null;

        } catch (error) {
            console.error('❌ Failed to get memory by key:', error.message);
            throw error;
        }
    }

    async deleteMemory(agentId, structuredKey) {
        const startTime = Date.now();

        try {
            const response = await this.client.delete('/api/data/memories', {
                params: {
                    filter: `agent_id = '${agentId}' AND structured_key = '${structuredKey}'`
                }
            });

            this.updateMetrics(Date.now() - startTime);
            return response.data.deletedCount > 0;

        } catch (error) {
            console.error('❌ Failed to delete memory:', error.message);
            throw error;
        }
    }

    async getRecentMemories(agentId, options = {}) {
        const startTime = Date.now();

        try {
            const response = await this.client.get('/api/data/memories', {
                params: {
                    filter: agentId ? `agent_id = '${agentId}'` : undefined,
                    orderBy: 'timestamp DESC',
                    limit: options.contextSize || 5,
                    project: options.project,
                    session: options.session
                }
            });

            this.updateMetrics(Date.now() - startTime);
            return response.data.records || [];

        } catch (error) {
            console.error('❌ Failed to get recent memories:', error.message);
            throw error;
        }
    }

    async getStatistics() {
        try {
            const response = await this.client.get('/api/admin/statistics');

            return {
                ...response.data,
                ...this.metrics,
                uptime: Date.now() - this.startupTime,
                isConnected: true,
                engine: 'cbd-enterprise'
            };

        } catch (error) {
            console.error('❌ Failed to get statistics:', error.message);
            return {
                ...this.metrics,
                uptime: Date.now() - this.startupTime,
                isConnected: false,
                engine: 'cbd-enterprise',
                error: error.message
            };
        }
    }

    updateMetrics(responseTime) {
        this.metrics.totalOperations++;

        // Calculate rolling average response time
        if (this.metrics.totalOperations === 1) {
            this.metrics.averageResponseTime = responseTime;
        } else {
            this.metrics.averageResponseTime =
                (this.metrics.averageResponseTime * 0.9) + (responseTime * 0.1);
        }

        // Calculate operations per second
        const uptimeSeconds = (Date.now() - this.startupTime) / 1000;
        this.metrics.operationsPerSecond = this.metrics.totalOperations / uptimeSeconds;
    }

    async close() {
        // CBD Engine uses stateless HTTP, no explicit connection to close
        console.error('🔌 CBD Engine Adapter connection closed');
    }

    // Transaction support using CBD Engine's transaction API
    async transaction(operations) {
        const startTime = Date.now();

        try {
            const response = await this.client.post('/api/transaction/execute', {
                operations: operations
            });

            this.updateMetrics(Date.now() - startTime);
            return response.data;

        } catch (error) {
            console.error('❌ Failed to execute transaction:', error.message);
            throw error;
        }
    }

    // Backup functionality using CBD Engine's backup API
    async createBackup(path) {
        try {
            const response = await this.client.post('/api/admin/backup', {
                database: this.database,
                path: path,
                format: 'cbd-native'
            });

            return response.data;

        } catch (error) {
            console.error('❌ Failed to create backup:', error.message);
            throw error;
        }
    }
}

// Compatibility wrapper to maintain existing MemoryDatabase interface
export class MemoryDatabase {
    constructor(dataDir = null) {
        // Initialize CBD Engine adapter instead of SQLite
        this.adapter = new CBDEngineAdapter({
            host: process.env.CBD_HOST,
            port: process.env.CBD_PORT,
            database: process.env.CBD_DATABASE || 'memorai',
            apiKey: process.env.CBD_API_KEY
        });

        this.isInitialized = false;
        console.error('🔄 MemoryDatabase using CBD Engine backend');
    }

    async initialize() {
        await this.adapter.initialize();
        this.isInitialized = true;
        console.error('✅ MemoryDatabase with CBD Engine backend initialized');
        return true;
    }

    // Maintain existing interface while delegating to CBD Engine
    async storeMemory(structuredKey, data) {
        return await this.adapter.storeMemory(structuredKey, data);
    }

    async searchMemories(query, options) {
        return await this.adapter.searchMemories(query, options);
    }

    async getMemoryByKey(structuredKey) {
        return await this.adapter.getMemoryByKey(structuredKey);
    }

    async deleteMemory(agentId, structuredKey) {
        return await this.adapter.deleteMemory(agentId, structuredKey);
    }

    async getRecentMemories(agentId, options) {
        return await this.adapter.getRecentMemories(agentId, options);
    }

    async getStatistics() {
        return await this.adapter.getStatistics();
    }

    async saveDatabase() {
        // CBD Engine handles persistence automatically
        console.error('💾 CBD Engine handles persistence automatically');
    }

    async close() {
        await this.adapter.close();
    }
}
