/**
 * METU CND Database Client - Simplified Version
 * 
 * Comprehensive CND database integration for METU device server
 */

import { EventEmitter } from 'events';
import { CND, CNDConfig } from '@codai/cnd';

// Helper function to normalize query results
function normalizeQueryResult<T>(result: any): T[] {
    if (Array.isArray(result)) {
        return result;
    }
    if (result && typeof result === 'object') {
        if (result.rows && Array.isArray(result.rows)) {
            return result.rows;
        }
        if (result.data && Array.isArray(result.data)) {
            return result.data;
        }
        if (result.results && Array.isArray(result.results)) {
            return result.results;
        }
    }
    return [];
}

// METU-specific types
export interface MetuDevice {
    id: string;
    name: string;
    type: 'metu-server' | 'web-client' | 'mobile-client' | 'desktop-client';
    status: 'online' | 'offline' | 'maintenance' | 'error';
    capabilities: string[];
    configuration: Record<string, any>;
    networkInfo: Record<string, any>;
    lastSeen: Date;
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, any>;
}

export interface MetuConversation {
    id: string;
    deviceId: string;
    sessionId: string;
    userId?: string;
    startTime: Date;
    endTime?: Date;
    status: 'active' | 'completed' | 'aborted';
    metadata: Record<string, any>;
}

export interface MetuMessage {
    id: string;
    conversationId: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata: Record<string, any>;
}

/**
 * Simplified METU CND Database Client
 */
export class MetuCNDClient extends EventEmitter {
    private cnd: CND;
    private isConnected: boolean = false;

    constructor(config: CNDConfig) {
        super();
        this.cnd = new CND(config);
    }

    async connect(): Promise<void> {
        try {
            await this.cnd.connect();
            await this.initializeSchemas();
            this.isConnected = true;
            this.emit('connected');
            console.log('✅ METU CND Client connected successfully');
        } catch (error) {
            console.error('❌ Failed to connect to CND:', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            await this.cnd.disconnect();
            this.isConnected = false;
            this.emit('disconnected');
            console.log('✅ METU CND Client disconnected');
        } catch (error) {
            console.error('❌ Failed to disconnect from CND:', error);
            throw error;
        }
    }

    private async initializeSchemas(): Promise<void> {
        try {
            // Create devices table
            await this.cnd.sql().query(`
                CREATE TABLE IF NOT EXISTS metu_devices (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'offline',
                    capabilities TEXT DEFAULT '[]',
                    configuration TEXT DEFAULT '{}',
                    network_info TEXT DEFAULT '{}',
                    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT DEFAULT '{}'
                )
            `);

            // Create conversations table
            await this.cnd.sql().query(`
                CREATE TABLE IF NOT EXISTS metu_conversations (
                    id TEXT PRIMARY KEY,
                    device_id TEXT NOT NULL,
                    session_id TEXT NOT NULL,
                    user_id TEXT,
                    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    end_time DATETIME,
                    status TEXT NOT NULL DEFAULT 'active',
                    metadata TEXT DEFAULT '{}'
                )
            `);

            // Create messages table
            await this.cnd.sql().query(`
                CREATE TABLE IF NOT EXISTS metu_messages (
                    id TEXT PRIMARY KEY,
                    conversation_id TEXT NOT NULL,
                    type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT DEFAULT '{}'
                )
            `);

            // Create indexes
            await this.cnd.sql().query('CREATE INDEX IF NOT EXISTS idx_devices_status ON metu_devices(status)');
            await this.cnd.sql().query('CREATE INDEX IF NOT EXISTS idx_devices_type ON metu_devices(type)');
            await this.cnd.sql().query('CREATE INDEX IF NOT EXISTS idx_conversations_device ON metu_conversations(device_id)');
            await this.cnd.sql().query('CREATE INDEX IF NOT EXISTS idx_messages_conversation ON metu_messages(conversation_id)');

            console.log('✅ METU database schemas initialized');
        } catch (error) {
            console.error('❌ Failed to initialize schemas:', error);
            throw error;
        }
    }

    // ==================== DEVICE OPERATIONS ====================

    async createDevice(device: Omit<MetuDevice, 'createdAt' | 'updatedAt'>): Promise<MetuDevice> {
        try {
            const now = new Date();
            const fullDevice: MetuDevice = {
                ...device,
                createdAt: now,
                updatedAt: now
            };

            await this.cnd.sql().query(`
                INSERT INTO metu_devices (
                    id, name, type, status, capabilities, configuration,
                    network_info, last_seen, created_at, updated_at, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                fullDevice.id,
                fullDevice.name,
                fullDevice.type,
                fullDevice.status,
                JSON.stringify(fullDevice.capabilities),
                JSON.stringify(fullDevice.configuration),
                JSON.stringify(fullDevice.networkInfo),
                fullDevice.lastSeen.toISOString(),
                fullDevice.createdAt.toISOString(),
                fullDevice.updatedAt.toISOString(),
                JSON.stringify(fullDevice.metadata)
            ]);

            this.emit('device:created', fullDevice);
            return fullDevice;
        } catch (error) {
            console.error('❌ Failed to create device:', error);
            throw error;
        }
    }

    async getDevice(id: string): Promise<MetuDevice | null> {
        try {
            const queryResult = await this.cnd.sql().query<any>(
                'SELECT * FROM metu_devices WHERE id = ?',
                [id]
            );

            const results = normalizeQueryResult<any>(queryResult);

            if (results.length === 0) {
                return null;
            }

            return this.parseDeviceRecord(results[0]);
        } catch (error) {
            console.error('❌ Failed to get device:', error);
            throw error;
        }
    }

    async updateDevice(id: string, updates: Partial<MetuDevice>): Promise<MetuDevice> {
        try {
            const current = await this.getDevice(id);
            if (!current) {
                throw new Error(`Device ${id} not found`);
            }

            const updated = { ...current, ...updates, updatedAt: new Date() };

            await this.cnd.sql().query(`
                UPDATE metu_devices SET
                    name = ?, type = ?, status = ?, capabilities = ?,
                    configuration = ?, network_info = ?, last_seen = ?,
                    updated_at = ?, metadata = ?
                WHERE id = ?
            `, [
                updated.name,
                updated.type,
                updated.status,
                JSON.stringify(updated.capabilities),
                JSON.stringify(updated.configuration),
                JSON.stringify(updated.networkInfo),
                updated.lastSeen.toISOString(),
                updated.updatedAt.toISOString(),
                JSON.stringify(updated.metadata),
                id
            ]);

            this.emit('device:updated', updated);
            return updated;
        } catch (error) {
            console.error('❌ Failed to update device:', error);
            throw error;
        }
    }

    async deleteDevice(id: string): Promise<boolean> {
        try {
            const result = await this.cnd.sql().query(
                'DELETE FROM metu_devices WHERE id = ?',
                [id]
            );

            const deleted = (result as any).changes > 0;
            if (deleted) {
                this.emit('device:deleted', id);
            }

            return deleted;
        } catch (error) {
            console.error('❌ Failed to delete device:', error);
            throw error;
        }
    }

    async listDevices(options: {
        type?: string;
        status?: string;
        limit?: number;
        offset?: number;
    } = {}): Promise<MetuDevice[]> {
        try {
            let query = 'SELECT * FROM metu_devices WHERE 1=1';
            const params: any[] = [];

            if (options.type) {
                query += ' AND type = ?';
                params.push(options.type);
            }

            if (options.status) {
                query += ' AND status = ?';
                params.push(options.status);
            }

            query += ' ORDER BY last_seen DESC';

            if (options.limit) {
                query += ' LIMIT ?';
                params.push(options.limit);
            }

            if (options.offset) {
                query += ' OFFSET ?';
                params.push(options.offset);
            }

            const queryResult = await this.cnd.sql().query<any>(query, params);
            const results = normalizeQueryResult<any>(queryResult);
            return results.map((record: any) => this.parseDeviceRecord(record));
        } catch (error) {
            console.error('❌ Failed to list devices:', error);
            throw error;
        }
    }

    private parseDeviceRecord(record: any): MetuDevice {
        return {
            id: record.id,
            name: record.name,
            type: record.type,
            status: record.status,
            capabilities: JSON.parse(record.capabilities || '[]'),
            configuration: JSON.parse(record.configuration || '{}'),
            networkInfo: JSON.parse(record.network_info || '{}'),
            lastSeen: new Date(record.last_seen),
            createdAt: new Date(record.created_at),
            updatedAt: new Date(record.updated_at),
            metadata: JSON.parse(record.metadata || '{}')
        };
    }

    // ==================== CONVERSATION OPERATIONS ====================

    async createConversation(conversation: Omit<MetuConversation, 'startTime'>): Promise<MetuConversation> {
        try {
            const fullConversation: MetuConversation = {
                ...conversation,
                startTime: new Date()
            };

            await this.cnd.sql().query(`
                INSERT INTO metu_conversations (
                    id, device_id, session_id, user_id, start_time, 
                    end_time, status, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                fullConversation.id,
                fullConversation.deviceId,
                fullConversation.sessionId,
                fullConversation.userId || null,
                fullConversation.startTime.toISOString(),
                fullConversation.endTime?.toISOString() || null,
                fullConversation.status,
                JSON.stringify(fullConversation.metadata)
            ]);

            this.emit('conversation:created', fullConversation);
            return fullConversation;
        } catch (error) {
            console.error('❌ Failed to create conversation:', error);
            throw error;
        }
    }

    async getConversation(id: string): Promise<MetuConversation | null> {
        try {
            const queryResult = await this.cnd.sql().query<any>(
                'SELECT * FROM metu_conversations WHERE id = ?',
                [id]
            );

            const results = normalizeQueryResult<any>(queryResult);

            if (results.length === 0) {
                return null;
            }

            const record = results[0];
            return {
                id: record.id,
                deviceId: record.device_id,
                sessionId: record.session_id,
                userId: record.user_id,
                startTime: new Date(record.start_time),
                endTime: record.end_time ? new Date(record.end_time) : undefined,
                status: record.status,
                metadata: JSON.parse(record.metadata || '{}')
            };
        } catch (error) {
            console.error('❌ Failed to get conversation:', error);
            throw error;
        }
    }

    async addMessage(message: MetuMessage): Promise<MetuMessage> {
        try {
            await this.cnd.sql().query(`
                INSERT INTO metu_messages (
                    id, conversation_id, type, content, timestamp, metadata
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                message.id,
                message.conversationId,
                message.type,
                message.content,
                message.timestamp.toISOString(),
                JSON.stringify(message.metadata)
            ]);

            this.emit('message:added', message);
            return message;
        } catch (error) {
            console.error('❌ Failed to add message:', error);
            throw error;
        }
    }

    async getMessages(conversationId: string): Promise<MetuMessage[]> {
        try {
            const queryResult = await this.cnd.sql().query<any>(
                'SELECT * FROM metu_messages WHERE conversation_id = ? ORDER BY timestamp ASC',
                [conversationId]
            );

            const results = normalizeQueryResult<any>(queryResult);
            return results.map((record: any) => ({
                id: record.id,
                conversationId: record.conversation_id,
                type: record.type,
                content: record.content,
                timestamp: new Date(record.timestamp),
                metadata: JSON.parse(record.metadata || '{}')
            }));
        } catch (error) {
            console.error('❌ Failed to get messages:', error);
            throw error;
        }
    }

    // ==================== HEALTH & MONITORING ====================

    async getHealthStatus(): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        details: Record<string, any>;
    }> {
        try {
            const deviceResults = normalizeQueryResult<any>(await this.cnd.sql().query<any>('SELECT COUNT(*) as count FROM metu_devices'));
            const activeDeviceResults = normalizeQueryResult<any>(await this.cnd.sql().query<any>('SELECT COUNT(*) as count FROM metu_devices WHERE status = ?', ['online']));
            const conversationResults = normalizeQueryResult<any>(await this.cnd.sql().query<any>('SELECT COUNT(*) as count FROM metu_conversations'));

            const totalDevices = deviceResults[0]?.count || 0;
            const activeDevices = activeDeviceResults[0]?.count || 0;
            const totalConversations = conversationResults[0]?.count || 0;

            const details = {
                connected: this.isConnected,
                totalDevices,
                activeDevices,
                totalConversations
            };

            let status: 'healthy' | 'warning' | 'critical' = 'healthy';

            if (!this.isConnected) {
                status = 'critical';
            } else if (activeDevices === 0) {
                status = 'warning';
            }

            return { status, details };
        } catch (error) {
            console.error('❌ Failed to get health status:', error);
            return {
                status: 'critical',
                details: { error: (error as Error).message }
            };
        }
    }

    // ==================== UTILITY METHODS ====================

    isHealthy(): boolean {
        return this.isConnected;
    }

    async cleanup(): Promise<void> {
        try {
            // Clean up old conversations
            await this.cnd.sql().query(`
                DELETE FROM metu_conversations 
                WHERE end_time IS NOT NULL 
                AND end_time < datetime('now', '-30 days')
            `);

            // Clean up orphaned messages
            await this.cnd.sql().query(`
                DELETE FROM metu_messages 
                WHERE conversation_id NOT IN (
                    SELECT id FROM metu_conversations
                )
            `);

            console.log('✅ Database cleanup completed');
        } catch (error) {
            console.error('❌ Database cleanup failed:', error);
            throw error;
        }
    }
}

export default MetuCNDClient;
