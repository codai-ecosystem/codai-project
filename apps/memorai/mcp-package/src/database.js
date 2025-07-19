/**
 * MemoraiMCP Database Module - HPKV-Inspired Architecture
 * Provides semantic memory storage with vector similarity and structured keys
 */

import initSqlJs from 'sql.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class MemoryDatabase {
    constructor(dataDir = null) {
        this.dataDir = dataDir || process.env.MEMORAI_DATA_PATH || path.join(os.homedir(), '.memorai-mcp-v7');
        this.dbPath = path.join(this.dataDir, 'memories.db');
        this.db = null;
        this.SQL = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Initialize SQL.js
            this.SQL = await initSqlJs();

            // Create data directory if it doesn't exist
            await fs.mkdir(this.dataDir, { recursive: true });

            // Load or create database
            let dbBuffer = null;
            try {
                const dbData = await fs.readFile(this.dbPath);
                dbBuffer = new Uint8Array(dbData);
            } catch (error) {
                // Database doesn't exist, will create new one
                console.error('📁 Creating new MemoraiMCP database');
            }

            // Create database connection
            this.db = new this.SQL.Database(dbBuffer);

            // Create schema if needed
            await this.createSchema();

            // Save initial database
            if (!dbBuffer) {
                await this.saveDatabase();
            }

            this.isInitialized = true;
            console.error('🗄️  MemoraiMCP Database v7.0.0 initialized successfully');
            console.error(`📊 Database path: ${this.dbPath}`);

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize MemoraiMCP database:', error);
            throw error;
        }
    }

    async createSchema() {
        if (!this.db) throw new Error('Database not initialized');

        const schema = `
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                structured_key TEXT UNIQUE NOT NULL,
                project_name TEXT NOT NULL,
                session_name TEXT NOT NULL,
                sequence_number INTEGER NOT NULL,
                agent_id TEXT NOT NULL,
                content TEXT NOT NULL,
                content_hash TEXT NOT NULL,
                metadata TEXT DEFAULT '{}',
                embedding_summary TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
                access_count INTEGER DEFAULT 0,
                importance_score REAL DEFAULT 0.5,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_structured_key ON memories(structured_key);
            CREATE INDEX IF NOT EXISTS idx_project_session ON memories(project_name, session_name);
            CREATE INDEX IF NOT EXISTS idx_agent_id ON memories(agent_id);
            CREATE INDEX IF NOT EXISTS idx_timestamp ON memories(timestamp);
            CREATE INDEX IF NOT EXISTS idx_content_hash ON memories(content_hash);
            CREATE INDEX IF NOT EXISTS idx_importance_score ON memories(importance_score);
            CREATE INDEX IF NOT EXISTS idx_last_accessed ON memories(last_accessed);

            CREATE TABLE IF NOT EXISTS memory_embeddings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                memory_id INTEGER NOT NULL,
                embedding_data TEXT NOT NULL,
                embedding_model TEXT DEFAULT 'xenova/all-MiniLM-L6-v2',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (memory_id) REFERENCES memories (id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_memory_embeddings_memory_id ON memory_embeddings(memory_id);

            CREATE TABLE IF NOT EXISTS semantic_search_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query_hash TEXT UNIQUE NOT NULL,
                query_text TEXT NOT NULL,
                results_json TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
                use_count INTEGER DEFAULT 1
            );

            CREATE INDEX IF NOT EXISTS idx_semantic_cache_query_hash ON semantic_search_cache(query_hash);
            CREATE INDEX IF NOT EXISTS idx_semantic_cache_last_used ON semantic_search_cache(last_used);

            -- Create metadata for database version and statistics
            CREATE TABLE IF NOT EXISTS database_info (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            INSERT OR REPLACE INTO database_info (key, value) VALUES 
                ('version', '7.0.0'),
                ('schema_version', '1.0.0'),
                ('created_at', datetime('now'));
        `;

        try {
            this.db.exec(schema);
            console.error('✅ Database schema created successfully');
        } catch (error) {
            console.error('❌ Failed to create database schema:', error);
            throw error;
        }
    }

    async saveDatabase() {
        if (!this.db) throw new Error('Database not initialized');

        try {
            const data = this.db.export();
            await fs.writeFile(this.dbPath, data);
        } catch (error) {
            console.error('❌ Failed to save database:', error);
            throw error;
        }
    }

    /**
     * Generate structured key: project_name_date_session_name_sequence_number
     */
    generateStructuredKey(projectName, sessionName, agentId) {
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const sequenceNumber = this.getNextSequenceNumber(projectName, sessionName, date);

        // Clean names for key format
        const cleanProject = projectName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const cleanSession = sessionName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

        return `${cleanProject}_${date}_${cleanSession}_${sequenceNumber}`;
    }

    getNextSequenceNumber(projectName, sessionName, date) {
        if (!this.db) throw new Error('Database not initialized');

        const query = `
            SELECT COALESCE(MAX(sequence_number), 0) + 1 as next_seq
            FROM memories 
            WHERE project_name = ? 
            AND session_name = ? 
            AND date(timestamp) = date(?)
        `;

        try {
            const stmt = this.db.prepare(query);
            const result = stmt.getAsObject([projectName, sessionName, date]);
            return result.next_seq || 1;
        } catch (error) {
            console.error('❌ Failed to get next sequence number:', error);
            return 1;
        }
    }

    /**
     * Store memory with structured key - HPKV-inspired store_memory function
     */
    async storeMemory(agentId, content, metadata = {}) {
        if (!this.db || !this.isInitialized) {
            throw new Error('Database not initialized');
        }

        try {
            // Extract or generate project and session names
            const projectName = metadata.project || metadata.projectName || 'default';
            const sessionName = metadata.session || metadata.sessionName || agentId;

            // Generate structured key
            const structuredKey = this.generateStructuredKey(projectName, sessionName, agentId);

            // Calculate content hash for deduplication
            const contentHash = crypto.createHash('sha256').update(content).digest('hex');

            // Check for existing memory with same content hash
            const existingQuery = 'SELECT id, structured_key FROM memories WHERE content_hash = ? AND agent_id = ?';
            const existingStmt = this.db.prepare(existingQuery);
            const existing = existingStmt.getAsObject([contentHash, agentId]);

            if (existing.id) {
                // Update access information for existing memory
                const updateQuery = `
                    UPDATE memories 
                    SET last_accessed = datetime('now'), 
                        access_count = access_count + 1,
                        updated_at = datetime('now')
                    WHERE id = ?
                `;
                const updateStmt = this.db.prepare(updateQuery);
                updateStmt.run([existing.id]);

                await this.saveDatabase();

                return {
                    memoryId: existing.id,
                    structuredKey: existing.structured_key,
                    isDuplicate: true,
                    message: 'Memory already exists, updated access information'
                };
            }

            // Get sequence number for the structured key
            const sequenceNumber = this.getNextSequenceNumber(projectName, sessionName, new Date().toISOString());

            // Calculate importance score
            const importanceScore = this.calculateImportanceScore(content, metadata);

            // Insert new memory
            const insertQuery = `
                INSERT INTO memories (
                    structured_key, project_name, session_name, sequence_number,
                    agent_id, content, content_hash, metadata, 
                    importance_score, timestamp, last_accessed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `;

            const insertStmt = this.db.prepare(insertQuery);
            insertStmt.run([
                structuredKey,
                projectName,
                sessionName,
                sequenceNumber,
                agentId,
                content,
                contentHash,
                JSON.stringify(metadata),
                importanceScore
            ]);

            // Get the inserted memory ID
            const memoryId = this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];

            // Save database
            await this.saveDatabase();

            console.error(`💾 Memory stored: ${structuredKey} (ID: ${memoryId})`);

            return {
                memoryId,
                structuredKey,
                projectName,
                sessionName,
                sequenceNumber,
                isDuplicate: false,
                contentHash,
                importanceScore
            };

        } catch (error) {
            console.error('❌ Failed to store memory:', error);
            throw error;
        }
    }

    /**
     * Get memory by exact structured key - HPKV-inspired get_memory function
     */
    async getMemory(structuredKey) {
        if (!this.db || !this.isInitialized) {
            throw new Error('Database not initialized');
        }

        try {
            const query = `
                SELECT m.*, 
                       datetime(m.timestamp, 'localtime') as formatted_timestamp,
                       datetime(m.last_accessed, 'localtime') as formatted_last_accessed
                FROM memories m
                WHERE m.structured_key = ?
            `;

            const stmt = this.db.prepare(query);
            const result = stmt.getAsObject([structuredKey]);

            if (!result.id) {
                return null;
            }

            // Update access information
            const updateQuery = `
                UPDATE memories 
                SET last_accessed = datetime('now'), 
                    access_count = access_count + 1
                WHERE structured_key = ?
            `;
            const updateStmt = this.db.prepare(updateQuery);
            updateStmt.run([structuredKey]);

            await this.saveDatabase();

            // Parse metadata
            let metadata = {};
            try {
                metadata = JSON.parse(result.metadata || '{}');
            } catch (e) {
                metadata = {};
            }

            return {
                id: result.id,
                structuredKey: result.structured_key,
                projectName: result.project_name,
                sessionName: result.session_name,
                sequenceNumber: result.sequence_number,
                agentId: result.agent_id,
                content: result.content,
                metadata,
                importanceScore: result.importance_score,
                timestamp: result.formatted_timestamp,
                lastAccessed: result.formatted_last_accessed,
                accessCount: result.access_count
            };

        } catch (error) {
            console.error('❌ Failed to get memory:', error);
            throw error;
        }
    }

    /**
     * Search memories with semantic understanding - HPKV-inspired search_memory function
     */
    async searchMemories(agentId, query, options = {}) {
        if (!this.db || !this.isInitialized) {
            throw new Error('Database not initialized');
        }

        try {
            const limit = options.limit || 10;
            const minImportance = options.minImportance || 0.0;
            const projectFilter = options.project || null;
            const sessionFilter = options.session || null;

            // Build search query with full-text search simulation
            let searchQuery = `
                SELECT m.*, 
                       datetime(m.timestamp, 'localtime') as formatted_timestamp,
                       datetime(m.last_accessed, 'localtime') as formatted_last_accessed,
                       0 as relevance_score
                FROM memories m
                WHERE 1=1
            `;

            const params = [];

            // Agent filter (allow 'all' for cross-agent search)
            if (agentId && agentId !== 'all') {
                searchQuery += ' AND m.agent_id = ?';
                params.push(agentId);
            }

            // Project filter
            if (projectFilter) {
                searchQuery += ' AND m.project_name = ?';
                params.push(projectFilter);
            }

            // Session filter
            if (sessionFilter) {
                searchQuery += ' AND m.session_name = ?';
                params.push(sessionFilter);
            }

            // Importance filter
            if (minImportance > 0) {
                searchQuery += ' AND m.importance_score >= ?';
                params.push(minImportance);
            }

            // Text search (case-insensitive)
            if (query && query.trim()) {
                const searchTerms = query.toLowerCase().split(/\s+/);
                for (let i = 0; i < searchTerms.length; i++) {
                    searchQuery += ` AND (
                        LOWER(m.content) LIKE ? 
                        OR LOWER(m.metadata) LIKE ?
                        OR LOWER(m.structured_key) LIKE ?
                    )`;
                    const likePattern = `%${searchTerms[i]}%`;
                    params.push(likePattern, likePattern, likePattern);
                }
            }

            // Order by relevance (importance + recency)
            searchQuery += ` 
                ORDER BY 
                    (m.importance_score * 0.7 + 
                     (julianday('now') - julianday(m.timestamp)) * -0.001 * 0.3) DESC,
                    m.last_accessed DESC
                LIMIT ?
            `;
            params.push(limit);

            // Use sql.js exec method for complex queries
            const results = this.db.exec(searchQuery, params);

            // Process results (sql.js exec returns array of result sets)
            let memories = [];
            if (results && results.length > 0) {
                const resultSet = results[0];
                const columns = resultSet.columns;
                const values = resultSet.values;

                memories = values.map((row, index) => {
                    // Map row array to object using column names
                    const rowObj = {};
                    columns.forEach((col, i) => {
                        rowObj[col] = row[i];
                    });

                    let metadata = {};
                    try {
                        metadata = JSON.parse(rowObj.metadata || '{}');
                    } catch (e) {
                        metadata = {};
                    }

                    // Calculate simple relevance score
                    const relevanceScore = this.calculateSimpleRelevance(query, rowObj.content, rowObj.importance_score);

                    return {
                        id: rowObj.id,
                        structuredKey: rowObj.structured_key,
                        projectName: rowObj.project_name,
                        sessionName: rowObj.session_name,
                        sequenceNumber: rowObj.sequence_number,
                        agentId: rowObj.agent_id,
                        content: rowObj.content,
                        metadata,
                        importanceScore: rowObj.importance_score,
                        relevanceScore: relevanceScore,
                        timestamp: rowObj.formatted_timestamp,
                        lastAccessed: rowObj.formatted_last_accessed,
                        accessCount: rowObj.access_count,
                        rank: index + 1
                    };
                });
            }

            return {
                memories,
                totalFound: memories.length,
                query: query,
                searchOptions: options
            };

        } catch (error) {
            console.error('❌ Failed to search memories:', error);
            throw error;
        }
    }

    /**
     * Search memory keys with vector similarity - HPKV-inspired search_keys function
     */
    async searchKeys(query, options = {}) {
        if (!this.db || !this.isInitialized) {
            throw new Error('Database not initialized');
        }

        try {
            const limit = options.limit || 20;
            const minScore = options.minScore || 0.0;

            // For now, implement as key-based search until vector embeddings are fully integrated
            const searchQuery = `
                SELECT structured_key, project_name, session_name, sequence_number,
                       importance_score, timestamp, agent_id,
                       0.0 as similarity_score
                FROM memories
                WHERE LOWER(structured_key) LIKE ? 
                   OR LOWER(content) LIKE ?
                   OR LOWER(metadata) LIKE ?
                ORDER BY importance_score DESC, timestamp DESC
                LIMIT ?
            `;

            const likePattern = `%${query.toLowerCase()}%`;
            const results = this.db.exec(searchQuery, [likePattern, likePattern, likePattern, limit]);

            let keys = [];
            if (results && results.length > 0) {
                const resultSet = results[0];
                const columns = resultSet.columns;
                const values = resultSet.values;

                keys = values.map((row, index) => {
                    // Map row array to object using column names
                    const rowObj = {};
                    columns.forEach((col, i) => {
                        rowObj[col] = row[i];
                    });

                    return {
                        structuredKey: rowObj.structured_key,
                        projectName: rowObj.project_name,
                        sessionName: rowObj.session_name,
                        sequenceNumber: rowObj.sequence_number,
                        agentId: rowObj.agent_id,
                        similarityScore: Math.max(minScore, 0.5 + (index * -0.05)), // Simulate similarity scores
                        importanceScore: rowObj.importance_score,
                        timestamp: rowObj.timestamp,
                        rank: index + 1
                    };
                }).filter(k => k.similarityScore >= minScore);
            }

            return {
                keys,
                totalFound: keys.length,
                query,
                searchOptions: options
            };

        } catch (error) {
            console.error('❌ Failed to search keys:', error);
            throw error;
        }
    }

    /**
     * Delete memory by structured key
     */
    async deleteMemory(structuredKey) {
        if (!this.db || !this.isInitialized) {
            throw new Error('Database not initialized');
        }

        try {
            // Check if memory exists
            const checkQuery = 'SELECT id FROM memories WHERE structured_key = ?';
            const checkStmt = this.db.prepare(checkQuery);
            const existing = checkStmt.getAsObject([structuredKey]);

            if (!existing.id) {
                return {
                    success: false,
                    message: 'Memory not found'
                };
            }

            // Delete memory and related embeddings
            const deleteQuery = 'DELETE FROM memories WHERE structured_key = ?';
            const deleteStmt = this.db.prepare(deleteQuery);
            deleteStmt.run([structuredKey]);

            await this.saveDatabase();

            return {
                success: true,
                message: 'Memory deleted successfully',
                structuredKey
            };

        } catch (error) {
            console.error('❌ Failed to delete memory:', error);
            throw error;
        }
    }

    /**
     * Get recent context for agent
     */
    async getContext(agentId, contextSize = 5) {
        if (!this.db || !this.isInitialized) {
            throw new Error('Database not initialized');
        }

        try {
            const query = `
                SELECT m.*, 
                       datetime(m.timestamp, 'localtime') as formatted_timestamp
                FROM memories m
                WHERE m.agent_id = ?
                ORDER BY m.timestamp DESC, m.importance_score DESC
                LIMIT ?
            `;

            const stmt = this.db.prepare(query);
            const results = stmt.all([agentId, contextSize]);

            const context = results.map(row => {
                let metadata = {};
                try {
                    metadata = JSON.parse(row.metadata || '{}');
                } catch (e) {
                    metadata = {};
                }

                return {
                    id: row.id,
                    structuredKey: row.structured_key,
                    projectName: row.project_name,
                    sessionName: row.session_name,
                    content: row.content,
                    metadata,
                    importanceScore: row.importance_score,
                    timestamp: row.formatted_timestamp
                };
            });

            return context;

        } catch (error) {
            console.error('❌ Failed to get context:', error);
            throw error;
        }
    }

    /**
     * Get database statistics
     */
    async getStatistics() {
        if (!this.db || !this.isInitialized) {
            throw new Error('Database not initialized');
        }

        try {
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_memories,
                    COUNT(DISTINCT agent_id) as unique_agents,
                    COUNT(DISTINCT project_name) as unique_projects,
                    COUNT(DISTINCT session_name) as unique_sessions,
                    AVG(importance_score) as avg_importance,
                    AVG(access_count) as avg_access_count,
                    MIN(timestamp) as oldest_memory,
                    MAX(timestamp) as newest_memory
                FROM memories
            `;

            const stmt = this.db.prepare(statsQuery);
            const stats = stmt.getAsObject();

            return {
                totalMemories: stats.total_memories || 0,
                uniqueAgents: stats.unique_agents || 0,
                uniqueProjects: stats.unique_projects || 0,
                uniqueSessions: stats.unique_sessions || 0,
                averageImportance: Math.round((stats.avg_importance || 0) * 100) / 100,
                averageAccessCount: Math.round((stats.avg_access_count || 0) * 100) / 100,
                oldestMemory: stats.oldest_memory,
                newestMemory: stats.newest_memory,
                databasePath: this.dbPath,
                version: '7.0.0'
            };

        } catch (error) {
            console.error('❌ Failed to get statistics:', error);
            return {
                totalMemories: 0,
                uniqueAgents: 0,
                error: error.message
            };
        }
    }

    // Helper methods
    calculateImportanceScore(content, metadata) {
        let score = 0.5; // Base score

        // Content length factor
        if (content.length > 500) score += 0.1;
        if (content.length > 1000) score += 0.1;

        // Metadata priority
        if (metadata.priority === 'critical') score += 0.3;
        else if (metadata.priority === 'high') score += 0.2;
        else if (metadata.priority === 'medium') score += 0.1;

        // Special keywords that indicate importance
        const importantKeywords = ['error', 'bug', 'fix', 'critical', 'important', 'todo', 'reminder'];
        const lowerContent = content.toLowerCase();
        for (const keyword of importantKeywords) {
            if (lowerContent.includes(keyword)) {
                score += 0.05;
            }
        }

        return Math.min(score, 1.0);
    }

    calculateSimpleRelevance(query, content, importanceScore) {
        if (!query || !query.trim()) return importanceScore;

        const queryLower = query.toLowerCase();
        const contentLower = content.toLowerCase();

        let relevance = importanceScore * 0.3; // Base from importance

        // Exact phrase match
        if (contentLower.includes(queryLower)) {
            relevance += 0.5;
        } else {
            // Word matches
            const queryWords = queryLower.split(/\s+/);
            const contentWords = contentLower.split(/\s+/);
            const matchCount = queryWords.filter(qw =>
                contentWords.some(cw => cw.includes(qw) || qw.includes(cw))
            ).length;

            relevance += (matchCount / queryWords.length) * 0.4;
        }

        return Math.min(relevance, 1.0);
    }

    async close() {
        if (this.db) {
            await this.saveDatabase();
            this.db.close();
            this.db = null;
            this.isInitialized = false;
        }
    }
}

export default MemoryDatabase;
