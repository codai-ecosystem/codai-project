/**
 * CBD SQLite Storage Adapter
 * Persistent storage implementation using SQLite
 */

import Database from 'better-sqlite3';
import {
    ConversationExchange,
    StorageAdapter,
    SearchQuery,
    DatabaseStats
} from '../types/index.js';

export class SQLiteStorageAdapter implements StorageAdapter {
    private db: Database.Database | null = null;
    private databasePath: string;

    constructor(databasePath: string) {
        this.databasePath = databasePath;
    }

    async connect(): Promise<void> {
        try {
            this.db = new Database(this.databasePath);

            // Enable WAL mode for better concurrency
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('synchronous = NORMAL');
            this.db.pragma('temp_store = memory');

            // Create table if it doesn't exist
            this.createTables();

            console.log(`📁 Connected to SQLite database: ${this.databasePath}`);
        } catch (error) {
            throw new Error(`Failed to connect to database: ${error}`);
        }
    }

    async disconnect(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
            console.log('📁 Database connection closed');
        }
    }

    private createTables(): void {
        if (!this.db) throw new Error('Database not connected');

        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS conversation_exchanges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        structured_key TEXT UNIQUE NOT NULL,
        project_name TEXT NOT NULL,
        session_name TEXT NOT NULL,
        sequence_number INTEGER NOT NULL,
        agent_id TEXT NOT NULL,
        user_request TEXT NOT NULL,
        assistant_response TEXT NOT NULL,
        conversation_context TEXT,
        metadata TEXT DEFAULT '{}',
        vector_embedding BLOB,
        confidence_score REAL DEFAULT 0.5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

        const createIndexes = [
            'CREATE INDEX IF NOT EXISTS idx_structured_key ON conversation_exchanges(structured_key)',
            'CREATE INDEX IF NOT EXISTS idx_project_session ON conversation_exchanges(project_name, session_name)',
            'CREATE INDEX IF NOT EXISTS idx_agent_id ON conversation_exchanges(agent_id)',
            'CREATE INDEX IF NOT EXISTS idx_created_at ON conversation_exchanges(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_confidence_score ON conversation_exchanges(confidence_score)',
            'CREATE INDEX IF NOT EXISTS idx_sequence ON conversation_exchanges(project_name, session_name, sequence_number)'
        ];

        this.db.exec(createTableSQL);
        createIndexes.forEach(sql => this.db!.exec(sql));
    }

    async storeConversation(exchange: ConversationExchange): Promise<string> {
        if (!this.db) throw new Error('Database not connected');

        const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO conversation_exchanges (
        structured_key, project_name, session_name, sequence_number,
        agent_id, user_request, assistant_response, conversation_context,
        metadata, vector_embedding, confidence_score, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        try {
            const vectorBlob = exchange.vectorEmbedding ?
                Buffer.from(exchange.vectorEmbedding.buffer) : null;

            stmt.run(
                exchange.structuredKey,
                exchange.projectName,
                exchange.sessionName,
                exchange.sequenceNumber,
                exchange.agentId,
                exchange.userRequest,
                exchange.assistantResponse,
                exchange.conversationContext,
                JSON.stringify(exchange.metadata),
                vectorBlob,
                exchange.confidenceScore,
                exchange.createdAt.toISOString(),
                exchange.updatedAt.toISOString()
            );

            return exchange.structuredKey;
        } catch (error) {
            throw new Error(`Failed to store conversation: ${error}`);
        }
    }

    async getConversation(structuredKey: string): Promise<ConversationExchange | null> {
        if (!this.db) throw new Error('Database not connected');

        const stmt = this.db.prepare(`
      SELECT * FROM conversation_exchanges WHERE structured_key = ?
    `);

        try {
            const row = stmt.get(structuredKey) as any;
            if (!row) return null;

            return this.mapRowToExchange(row);
        } catch (error) {
            throw new Error(`Failed to get conversation: ${error}`);
        }
    }

    async searchConversations(query: SearchQuery): Promise<ConversationExchange[]> {
        if (!this.db) throw new Error('Database not connected');

        let sql = 'SELECT * FROM conversation_exchanges WHERE 1=1';
        const params: any[] = [];

        // Build dynamic query based on search criteria
        if (query.projectFilter) {
            sql += ' AND project_name = ?';
            params.push(query.projectFilter);
        }

        if (query.sessionFilter) {
            sql += ' AND session_name = ?';
            params.push(query.sessionFilter);
        }

        if (query.agentFilter) {
            sql += ' AND agent_id = ?';
            params.push(query.agentFilter);
        }

        if (query.confidenceThreshold) {
            sql += ' AND confidence_score >= ?';
            params.push(query.confidenceThreshold);
        }

        if (query.timeRange) {
            sql += ' AND created_at BETWEEN ? AND ?';
            params.push(query.timeRange.start.toISOString(), query.timeRange.end.toISOString());
        }

        // Text search in content
        if (query.query) {
            sql += ' AND (user_request LIKE ? OR assistant_response LIKE ?)';
            const searchTerm = `%${query.query}%`;
            params.push(searchTerm, searchTerm);
        }

        sql += ' ORDER BY created_at DESC';

        if (query.limit) {
            sql += ' LIMIT ?';
            params.push(query.limit);
        }

        try {
            const stmt = this.db.prepare(sql);
            const rows = stmt.all(...params) as any[];

            return rows.map(row => this.mapRowToExchange(row));
        } catch (error) {
            throw new Error(`Failed to search conversations: ${error}`);
        }
    }

    async updateConversation(structuredKey: string, updates: Partial<ConversationExchange>): Promise<boolean> {
        if (!this.db) throw new Error('Database not connected');

        const updateFields: string[] = [];
        const params: any[] = [];

        // Build dynamic update query
        Object.entries(updates).forEach(([key, value]) => {
            switch (key) {
                case 'userRequest':
                    updateFields.push('user_request = ?');
                    params.push(value);
                    break;
                case 'assistantResponse':
                    updateFields.push('assistant_response = ?');
                    params.push(value);
                    break;
                case 'conversationContext':
                    updateFields.push('conversation_context = ?');
                    params.push(value);
                    break;
                case 'metadata':
                    updateFields.push('metadata = ?');
                    params.push(JSON.stringify(value));
                    break;
                case 'confidenceScore':
                    updateFields.push('confidence_score = ?');
                    params.push(value);
                    break;
                case 'vectorEmbedding':
                    updateFields.push('vector_embedding = ?');
                    params.push(value ? Buffer.from((value as Float32Array).buffer) : null);
                    break;
            }
        });

        if (updateFields.length === 0) return false;

        updateFields.push('updated_at = ?');
        params.push(new Date().toISOString());
        params.push(structuredKey);

        const sql = `UPDATE conversation_exchanges SET ${updateFields.join(', ')} WHERE structured_key = ?`;

        try {
            const stmt = this.db.prepare(sql);
            const result = stmt.run(...params);
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Failed to update conversation: ${error}`);
        }
    }

    async deleteConversation(structuredKey: string): Promise<boolean> {
        if (!this.db) throw new Error('Database not connected');

        const stmt = this.db.prepare('DELETE FROM conversation_exchanges WHERE structured_key = ?');

        try {
            const result = stmt.run(structuredKey);
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Failed to delete conversation: ${error}`);
        }
    }

    async getStats(): Promise<DatabaseStats> {
        if (!this.db) throw new Error('Database not connected');

        try {
            const totalMemories = this.db.prepare('SELECT COUNT(*) as count FROM conversation_exchanges').get() as any;
            const uniqueAgents = this.db.prepare('SELECT COUNT(DISTINCT agent_id) as count FROM conversation_exchanges').get() as any;
            const uniqueProjects = this.db.prepare('SELECT COUNT(DISTINCT project_name) as count FROM conversation_exchanges').get() as any;
            const uniqueSessions = this.db.prepare('SELECT COUNT(DISTINCT session_name) as count FROM conversation_exchanges').get() as any;
            const avgConfidence = this.db.prepare('SELECT AVG(confidence_score) as avg FROM conversation_exchanges').get() as any;

            return {
                totalMemories: totalMemories.count,
                uniqueAgents: uniqueAgents.count,
                uniqueProjects: uniqueProjects.count,
                uniqueSessions: uniqueSessions.count,
                averageConfidence: avgConfidence.avg || 0,
                databaseSize: 0, // Would need file system access to get actual size
                lastUpdated: new Date()
            };
        } catch (error) {
            throw new Error(`Failed to get database stats: ${error}`);
        }
    }

    /**
     * Get the next sequence number for a project/session combination
     */
    async getNextSequenceNumber(projectName: string, sessionName: string): Promise<number> {
        if (!this.db) throw new Error('Database not connected');

        const stmt = this.db.prepare(`
      SELECT MAX(sequence_number) as max_seq 
      FROM conversation_exchanges 
      WHERE project_name = ? AND session_name = ?
    `);

        try {
            const result = stmt.get(projectName, sessionName) as any;
            return (result?.max_seq || 0) + 1;
        } catch (error) {
            throw new Error(`Failed to get next sequence number: ${error}`);
        }
    }

    private mapRowToExchange(row: any): ConversationExchange {
        const vectorEmbedding = row.vector_embedding ?
            new Float32Array(row.vector_embedding) : undefined;

        return {
            id: row.id?.toString(),
            structuredKey: row.structured_key,
            projectName: row.project_name,
            sessionName: row.session_name,
            sequenceNumber: row.sequence_number,
            agentId: row.agent_id,
            userRequest: row.user_request,
            assistantResponse: row.assistant_response,
            conversationContext: row.conversation_context || undefined,
            metadata: JSON.parse(row.metadata || '{}'),
            vectorEmbedding,
            confidenceScore: row.confidence_score,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
