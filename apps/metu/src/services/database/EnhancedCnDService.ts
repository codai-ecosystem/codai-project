/**
 * Enhanced CND Database Integration Service
 * 
 * Provides comprehensive data persistence using the CND (CodAI Neural Database)
 * for user profiles, conversation history, settings, and system state.
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';

// Import CND types (these would come from @codai/cnd package)
interface CnDConnection {
    query(sql: string, params?: any[]): Promise<any[]>;
    execute(sql: string, params?: any[]): Promise<void>;
    transaction(callback: (conn: CnDConnection) => Promise<void>): Promise<void>;
    close(): Promise<void>;
}

export interface UserProfile {
    id: string;
    username: string;
    email?: string;
    preferences: UserPreferences;
    createdAt: Date;
    updatedAt: Date;
    lastActivity: Date;
}

export interface UserPreferences {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    voiceSettings: {
        inputDeviceId?: string;
        outputDeviceId?: string;
        volume: number;
        speed: number;
        pitch: number;
        voice: string;
        autoStartListening: boolean;
        wakeWordEnabled: boolean;
        wakeWord: string;
    };
    mcpSettings: {
        glass: { enabled: boolean; permissions: string[] };
        memorai: { enabled: boolean; agentId: string; contextSize: number };
        playwright: { enabled: boolean; headless: boolean };
    };
    systemSettings: {
        startOnBoot: boolean;
        minimizeToTray: boolean;
        enableNotifications: boolean;
        logLevel: string;
    };
}

export interface ConversationHistory {
    id: string;
    userId: string;
    sessionId: string;
    messages: ConversationMessage[];
    startTime: Date;
    endTime?: Date;
    summary?: string;
    metadata: Record<string, any>;
}

export interface ConversationMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    type: 'text' | 'audio' | 'function_call' | 'function_result';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export interface SystemState {
    id: string;
    key: string;
    value: any;
    userId?: string;
    sessionId?: string;
    category: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface DatabaseConfig {
    dbPath: string;
    enableWAL: boolean;
    enableSync: boolean;
    backupInterval: number; // minutes
    retentionPeriod: number; // days
    encryptionKey?: string;
}

export class EnhancedCnDService extends EventEmitter {
    private connection: CnDConnection | null = null;
    private config: DatabaseConfig;
    private isInitialized = false;
    private backupTimer: NodeJS.Timeout | null = null;
    private cleanupTimer: NodeJS.Timeout | null = null;

    constructor(config: Partial<DatabaseConfig> = {}) {
        super();

        this.config = {
            dbPath: process.env.CND_DATABASE_PATH || './data/metu.cnd',
            enableWAL: true,
            enableSync: process.env.CND_ENABLE_SYNC === 'true',
            backupInterval: 60, // 1 hour
            retentionPeriod: 30, // 30 days
            ...config
        };
    }

    /**
     * Initialize the CND database service
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.log('⚠️ CND service already initialized');
            return;
        }

        try {
            // Ensure database directory exists
            const dbDir = path.dirname(this.config.dbPath);
            await fs.mkdir(dbDir, { recursive: true });

            // Initialize CND connection (mock implementation for now)
            this.connection = await this.createCnDConnection();

            // Create database schema
            await this.createSchema();

            // Start background tasks
            this.startBackgroundTasks();

            this.isInitialized = true;
            console.log('✅ CND database service initialized');
            this.emit('initialized', { dbPath: this.config.dbPath });

        } catch (error) {
            console.error('❌ Failed to initialize CND service:', error);
            throw error;
        }
    }

    /**
     * Create CND database connection
     */
    private async createCnDConnection(): Promise<CnDConnection> {
        // This is a mock implementation
        // In production, this would use the actual @codai/cnd package

        return {
            query: async (sql: string, params?: any[]) => {
                console.log(`📊 CND Query: ${sql}`, params);
                return [];
            },
            execute: async (sql: string, params?: any[]) => {
                console.log(`🔧 CND Execute: ${sql}`, params);
            },
            transaction: async (callback: (conn: CnDConnection) => Promise<void>) => {
                await callback(this.connection!);
            },
            close: async () => {
                console.log('🔌 CND connection closed');
            }
        };
    }

    /**
     * Create database schema
     */
    private async createSchema(): Promise<void> {
        if (!this.connection) throw new Error('Database not connected');

        const schemas = [
            // User profiles table
            `
            CREATE TABLE IF NOT EXISTS user_profiles (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT,
                preferences TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                last_activity TEXT NOT NULL
            )
            `,

            // Conversation history table
            `
            CREATE TABLE IF NOT EXISTS conversation_history (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                session_id TEXT NOT NULL,
                messages TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT,
                summary TEXT,
                metadata TEXT,
                FOREIGN KEY (user_id) REFERENCES user_profiles (id)
            )
            `,

            // System state table
            `
            CREATE TABLE IF NOT EXISTS system_state (
                id TEXT PRIMARY KEY,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                user_id TEXT,
                session_id TEXT,
                category TEXT NOT NULL,
                expires_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user_profiles (id)
            )
            `,

            // Audio device preferences
            `
            CREATE TABLE IF NOT EXISTS audio_devices (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                device_id TEXT NOT NULL,
                device_type TEXT NOT NULL,
                label TEXT NOT NULL,
                is_preferred BOOLEAN DEFAULT FALSE,
                settings TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user_profiles (id)
            )
            `,

            // MCP tool usage tracking
            `
            CREATE TABLE IF NOT EXISTS mcp_usage (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                tool_name TEXT NOT NULL,
                action TEXT NOT NULL,
                parameters TEXT,
                result TEXT,
                success BOOLEAN NOT NULL,
                execution_time INTEGER,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user_profiles (id)
            )
            `
        ];

        for (const schema of schemas) {
            await this.connection.execute(schema);
        }

        // Create indexes
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_conversation_user ON conversation_history(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_conversation_session ON conversation_history(session_id)',
            'CREATE INDEX IF NOT EXISTS idx_system_state_key ON system_state(key)',
            'CREATE INDEX IF NOT EXISTS idx_system_state_category ON system_state(category)',
            'CREATE INDEX IF NOT EXISTS idx_mcp_usage_user ON mcp_usage(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_mcp_usage_tool ON mcp_usage(tool_name)'
        ];

        for (const index of indexes) {
            await this.connection.execute(index);
        }

        console.log('📋 Database schema created');
    }

    /**
     * Start background tasks
     */
    private startBackgroundTasks(): void {
        // Auto-backup timer
        if (this.config.backupInterval > 0) {
            this.backupTimer = setInterval(() => {
                this.createBackup().catch(error => {
                    console.error('❌ Backup failed:', error);
                    this.emit('backupError', error);
                });
            }, this.config.backupInterval * 60 * 1000);
        }

        // Cleanup timer
        this.cleanupTimer = setInterval(() => {
            this.cleanupExpiredData().catch(error => {
                console.error('❌ Cleanup failed:', error);
            });
        }, 24 * 60 * 60 * 1000); // Daily cleanup

        console.log('⏰ Background tasks started');
    }

    /**
     * Create or update user profile
     */
    async saveUserProfile(profile: UserProfile): Promise<void> {
        if (!this.connection) throw new Error('Database not connected');

        const now = new Date().toISOString();

        await this.connection.execute(`
            INSERT OR REPLACE INTO user_profiles (
                id, username, email, preferences, created_at, updated_at, last_activity
            ) VALUES (?, ?, ?, ?, 
                COALESCE((SELECT created_at FROM user_profiles WHERE id = ?), ?),
                ?, ?
            )
        `, [
            profile.id,
            profile.username,
            profile.email,
            JSON.stringify(profile.preferences),
            profile.id, // for COALESCE check
            now, // fallback created_at
            now, // updated_at
            now  // last_activity
        ]);

        this.emit('userProfileSaved', profile);
        console.log(`💾 User profile saved: ${profile.username}`);
    }

    /**
     * Get user profile by ID
     */
    async getUserProfile(userId: string): Promise<UserProfile | null> {
        if (!this.connection) throw new Error('Database not connected');

        const results = await this.connection.query(
            'SELECT * FROM user_profiles WHERE id = ?',
            [userId]
        );

        if (results.length === 0) return null;

        const row = results[0];
        return {
            id: row.id,
            username: row.username,
            email: row.email,
            preferences: JSON.parse(row.preferences),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            lastActivity: new Date(row.last_activity)
        };
    }

    /**
     * Update user preferences
     */
    async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
        if (!this.connection) throw new Error('Database not connected');

        const profile = await this.getUserProfile(userId);
        if (!profile) {
            throw new Error(`User profile not found: ${userId}`);
        }

        const updatedPreferences = { ...profile.preferences, ...preferences };
        profile.preferences = updatedPreferences;
        profile.updatedAt = new Date();

        await this.saveUserProfile(profile);
        this.emit('userPreferencesUpdated', { userId, preferences: updatedPreferences });
    }

    /**
     * Save conversation history
     */
    async saveConversationHistory(conversation: ConversationHistory): Promise<void> {
        if (!this.connection) throw new Error('Database not connected');

        await this.connection.execute(`
            INSERT OR REPLACE INTO conversation_history (
                id, user_id, session_id, messages, start_time, end_time, summary, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            conversation.id,
            conversation.userId,
            conversation.sessionId,
            JSON.stringify(conversation.messages),
            conversation.startTime.toISOString(),
            conversation.endTime?.toISOString(),
            conversation.summary,
            JSON.stringify(conversation.metadata)
        ]);

        this.emit('conversationSaved', conversation);
        console.log(`💬 Conversation saved: ${conversation.id} (${conversation.messages.length} messages)`);
    }

    /**
     * Get conversation history for user
     */
    async getUserConversations(userId: string, limit: number = 50): Promise<ConversationHistory[]> {
        if (!this.connection) throw new Error('Database not connected');

        const results = await this.connection.query(`
            SELECT * FROM conversation_history 
            WHERE user_id = ? 
            ORDER BY start_time DESC 
            LIMIT ?
        `, [userId, limit]);

        return results.map(row => ({
            id: row.id,
            userId: row.user_id,
            sessionId: row.session_id,
            messages: JSON.parse(row.messages),
            startTime: new Date(row.start_time),
            endTime: row.end_time ? new Date(row.end_time) : undefined,
            summary: row.summary,
            metadata: JSON.parse(row.metadata || '{}')
        }));
    }

    /**
     * Set system state
     */
    async setSystemState(key: string, value: any, options: {
        userId?: string;
        sessionId?: string;
        category?: string;
        expiresAt?: Date;
    } = {}): Promise<void> {
        if (!this.connection) throw new Error('Database not connected');

        const id = `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        await this.connection.execute(`
            INSERT OR REPLACE INTO system_state (
                id, key, value, user_id, session_id, category, expires_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            key,
            JSON.stringify(value),
            options.userId,
            options.sessionId,
            options.category || 'general',
            options.expiresAt?.toISOString(),
            now,
            now
        ]);

        this.emit('systemStateSet', { key, value, options });
    }

    /**
     * Get system state
     */
    async getSystemState(key: string, options: {
        userId?: string;
        sessionId?: string;
        category?: string;
    } = {}): Promise<any> {
        if (!this.connection) throw new Error('Database not connected');

        let sql = 'SELECT * FROM system_state WHERE key = ?';
        const params = [key];

        if (options.userId) {
            sql += ' AND user_id = ?';
            params.push(options.userId);
        }

        if (options.sessionId) {
            sql += ' AND session_id = ?';
            params.push(options.sessionId);
        }

        if (options.category) {
            sql += ' AND category = ?';
            params.push(options.category);
        }

        sql += ' AND (expires_at IS NULL OR expires_at > ?)';
        params.push(new Date().toISOString());

        sql += ' ORDER BY updated_at DESC LIMIT 1';

        const results = await this.connection.query(sql, params);

        if (results.length === 0) return null;

        return JSON.parse(results[0].value);
    }

    /**
     * Track MCP tool usage
     */
    async trackMCPUsage(data: {
        userId: string;
        toolName: string;
        action: string;
        parameters?: any;
        result?: any;
        success: boolean;
        executionTime?: number;
    }): Promise<void> {
        if (!this.connection) throw new Error('Database not connected');

        const id = `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await this.connection.execute(`
            INSERT INTO mcp_usage (
                id, user_id, tool_name, action, parameters, result, 
                success, execution_time, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            data.userId,
            data.toolName,
            data.action,
            JSON.stringify(data.parameters),
            JSON.stringify(data.result),
            data.success,
            data.executionTime,
            new Date().toISOString()
        ]);

        this.emit('mcpUsageTracked', data);
    }

    /**
     * Get MCP usage statistics
     */
    async getMCPUsageStats(userId: string, days: number = 7): Promise<any> {
        if (!this.connection) throw new Error('Database not connected');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const results = await this.connection.query(`
            SELECT 
                tool_name,
                action,
                COUNT(*) as usage_count,
                AVG(execution_time) as avg_execution_time,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count
            FROM mcp_usage 
            WHERE user_id = ? AND timestamp >= ?
            GROUP BY tool_name, action
            ORDER BY usage_count DESC
        `, [userId, startDate.toISOString()]);

        return results;
    }

    /**
     * Create database backup
     */
    private async createBackup(): Promise<void> {
        if (!this.connection) return;

        const backupDir = path.join(path.dirname(this.config.dbPath), 'backups');
        await fs.mkdir(backupDir, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `metu-backup-${timestamp}.cnd`);

        // This would use CND's backup functionality
        console.log(`💾 Creating backup: ${backupPath}`);
        this.emit('backupCreated', { backupPath });
    }

    /**
     * Cleanup expired data
     */
    private async cleanupExpiredData(): Promise<void> {
        if (!this.connection) return;

        const now = new Date().toISOString();
        const retentionDate = new Date();
        retentionDate.setDate(retentionDate.getDate() - this.config.retentionPeriod);

        // Clean expired system state
        await this.connection.execute(
            'DELETE FROM system_state WHERE expires_at IS NOT NULL AND expires_at < ?',
            [now]
        );

        // Clean old conversation history (based on retention period)
        await this.connection.execute(
            'DELETE FROM conversation_history WHERE start_time < ?',
            [retentionDate.toISOString()]
        );

        // Clean old MCP usage data
        await this.connection.execute(
            'DELETE FROM mcp_usage WHERE timestamp < ?',
            [retentionDate.toISOString()]
        );

        console.log('🧹 Expired data cleaned up');
        this.emit('dataCleanupCompleted');
    }

    /**
     * Get database statistics
     */
    async getDatabaseStats(): Promise<any> {
        if (!this.connection) return {};

        const stats = {
            users: 0,
            conversations: 0,
            systemStates: 0,
            mcpUsages: 0,
            lastBackup: null,
            dbSize: 0
        };

        try {
            // Count records in each table
            const userCount = await this.connection.query('SELECT COUNT(*) as count FROM user_profiles');
            stats.users = userCount[0]?.count || 0;

            const convCount = await this.connection.query('SELECT COUNT(*) as count FROM conversation_history');
            stats.conversations = convCount[0]?.count || 0;

            const stateCount = await this.connection.query('SELECT COUNT(*) as count FROM system_state');
            stats.systemStates = stateCount[0]?.count || 0;

            const mcpCount = await this.connection.query('SELECT COUNT(*) as count FROM mcp_usage');
            stats.mcpUsages = mcpCount[0]?.count || 0;

            // Get database file size
            try {
                const dbStats = await fs.stat(this.config.dbPath);
                stats.dbSize = dbStats.size;
            } catch {
                // File might not exist yet
            }

        } catch (error) {
            console.error('❌ Error getting database stats:', error);
        }

        return stats;
    }

    /**
     * Get service status
     */
    getStatus(): {
        isInitialized: boolean;
        dbPath: string;
        config: DatabaseConfig;
        hasConnection: boolean;
    } {
        return {
            isInitialized: this.isInitialized,
            dbPath: this.config.dbPath,
            config: this.config,
            hasConnection: this.connection !== null
        };
    }

    /**
     * Cleanup and close database connection
     */
    async dispose(): Promise<void> {
        // Clear timers
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = null;
        }

        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }

        // Close database connection
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }

        this.isInitialized = false;
        this.removeAllListeners();
        console.log('🧹 CND service disposed');
    }
}

// Export CND service events interface
export interface CnDServiceEvents {
    'initialized': (data: { dbPath: string }) => void;
    'userProfileSaved': (profile: UserProfile) => void;
    'userPreferencesUpdated': (data: { userId: string; preferences: UserPreferences }) => void;
    'conversationSaved': (conversation: ConversationHistory) => void;
    'systemStateSet': (data: { key: string; value: any; options: any }) => void;
    'mcpUsageTracked': (data: any) => void;
    'backupCreated': (data: { backupPath: string }) => void;
    'backupError': (error: Error) => void;
    'dataCleanupCompleted': () => void;
    'databaseError': (error: Error) => void;
}

// Typed event emitter
export interface EnhancedCnDService {
    on<K extends keyof CnDServiceEvents>(event: K, listener: CnDServiceEvents[K]): this;
    emit<K extends keyof CnDServiceEvents>(event: K, ...args: Parameters<CnDServiceEvents[K]>): boolean;
}
