/**
 * CBD Client - CND Compatibility Layer with Full METU Support
 * 
 * Provides CND-compatible interface using CBD Universal Service backend
 * Maintains backward compatibility while leveraging CBD's multi-paradigm capabilities
 * Includes full METU device management, conversation tracking, and message handling
 */

import { EventEmitter } from 'events';

export interface CBDClientConfig {
    name?: string;
    cbd?: {
        host?: string;
        port?: number;
        database?: string;
        memory?: {
            maxMemory?: number;
            persistenceInterval?: number;
        };
    };
    enterprise?: {
        authentication?: {
            enabled?: boolean;
            jwtSecret?: string;
            tokenExpiry?: string;
        };
        serviceDiscovery?: {
            enabled?: boolean;
            port?: number;
            healthCheckInterval?: number;
        };
        auditLog?: {
            enabled?: boolean;
            logLevel?: string;
            includeRequestData?: boolean;
        };
        metrics?: {
            enabled?: boolean;
            prometheusPort?: number;
            customMetrics?: string[];
        };
        security?: {
            encryption?: {
                enabled?: boolean;
                algorithm?: string;
            };
            rateLimit?: {
                enabled?: boolean;
                windowMs?: number;
                maxRequests?: number;
            };
        };
    };
    auth?: {
        enabled?: boolean;
        provider?: string;
        config?: {
            secret?: string;
        };
    };
    serviceDiscovery?: {
        enabled?: boolean;
        serviceName?: string;
        tags?: string[];
        healthCheckInterval?: number;
    };
    security?: {
        audit?: {
            enabled?: boolean;
            logLevel?: string;
            storage?: string;
            retentionDays?: number;
        };
    };
}

export interface CBDQueryResult {
    data?: any[];
    rows?: any[];
    insertId?: number;
    affectedRows?: number;
    error?: string;
}

// METU-specific interfaces for full compatibility
export interface MetuDevice {
    id?: string;
    name: string;
    type: string;
    status: 'active' | 'inactive' | 'maintenance' | 'error';
    lastSeen: Date;
    metadata?: Record<string, any>;
    version?: string;
    location?: string;
    capabilities?: string[];
    configuration?: Record<string, any>;
    healthScore?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MetuConversation {
    id?: string;
    deviceId: string;
    title?: string;
    status: 'active' | 'completed' | 'archived';
    participants?: string[];
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
    lastActivity?: Date;
    messageCount?: number;
}

export interface MetuMessage {
    id?: string;
    conversationId: string;
    deviceId: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'system' | 'error' | 'command';
    sender?: string;
    metadata?: Record<string, any>;
    createdAt?: Date;
    processed?: boolean;
    responseTime?: number;
}

export class CBDClient extends EventEmitter {
    private baseUrl: string;
    private connected: boolean = false;
    private healthCheckInterval?: NodeJS.Timeout;
    private config: CBDClientConfig;
    private currentDevices: Map<string, MetuDevice> = new Map();
    private currentConversations: Map<string, MetuConversation> = new Map();
    private isCleaningUp: boolean = false;

    constructor(config: CBDClientConfig = {}) {
        super();
        this.config = config;
        const host = config.cbd?.host || process.env.CBD_HOST || 'localhost';
        const port = config.cbd?.port || parseInt(process.env.CBD_PORT || '4180');
        this.baseUrl = `http://${host}:${port}`;

        // Set up event emitter
        this.setMaxListeners(50);

        // Initialize schema on connection
        this.on('connected', () => this.initializeSchema());
    }

    /**
     * Connect to CBD Universal Service
     * Replaces CND connect() method
     */
    async connect(): Promise<void> {
        try {
            // Test connection to CBD Universal Service
            const response = await fetch(`${this.baseUrl}/health`);
            if (!response.ok) {
                throw new Error(`CBD Universal Service not available: ${response.status}`);
            }

            const health = await response.json();
            console.log(`✅ Connected to CBD Universal Service: ${health.service || 'CBD'}`);
            this.connected = true;

            // Emit connected event
            this.emit('connected');

            // Start health monitoring
            this.startHealthMonitoring();

        } catch (error) {
            console.error('❌ Failed to connect to CBD Universal Service:', error);
            this.emit('error', error);
            throw new Error(`CBD connection failed: ${error}`);
        }
    }

    /**
     * Initialize database schema for METU compatibility
     */
    private async initializeSchema(): Promise<void> {
        try {
            // Initialize METU device schema
            await this.sql().query(`
                CREATE TABLE IF NOT EXISTS metu_devices (
                    id VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    type VARCHAR(100) NOT NULL,
                    status VARCHAR(50) DEFAULT 'inactive',
                    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT,
                    version VARCHAR(50),
                    location VARCHAR(255),
                    capabilities TEXT,
                    configuration TEXT,
                    health_score INTEGER DEFAULT 100,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Initialize METU conversation schema
            await this.sql().query(`
                CREATE TABLE IF NOT EXISTS metu_conversations (
                    id VARCHAR(255) PRIMARY KEY,
                    device_id VARCHAR(255) NOT NULL,
                    title VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'active',
                    participants TEXT,
                    metadata TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
                    message_count INTEGER DEFAULT 0,
                    FOREIGN KEY (device_id) REFERENCES metu_devices(id) ON DELETE CASCADE
                )
            `);

            // Initialize METU message schema
            await this.sql().query(`
                CREATE TABLE IF NOT EXISTS metu_messages (
                    id VARCHAR(255) PRIMARY KEY,
                    conversation_id VARCHAR(255) NOT NULL,
                    device_id VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    type VARCHAR(50) DEFAULT 'text',
                    sender VARCHAR(255),
                    metadata TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    processed BOOLEAN DEFAULT FALSE,
                    response_time INTEGER,
                    FOREIGN KEY (conversation_id) REFERENCES metu_conversations(id) ON DELETE CASCADE,
                    FOREIGN KEY (device_id) REFERENCES metu_devices(id) ON DELETE CASCADE
                )
            `);

            console.log('✅ METU schema initialized successfully');
            this.emit('schema_initialized');
        } catch (error) {
            console.error('❌ Failed to initialize METU schema:', error);
            this.emit('error', error);
        }
    }

    /**
     * Start health monitoring for the CBD connection
     */
    private startHealthMonitoring(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.healthCheckInterval = setInterval(async () => {
            try {
                const health = await this.getHealthStatus();
                this.emit('health_check', health);

                if (health.status !== 'healthy' && health.status !== 'ok') {
                    console.warn('⚠️ CBD health check warning:', health);
                    this.emit('health_warning', health);
                }
            } catch (error) {
                console.error('❌ Health check failed:', error);
                this.emit('health_error', error);
            }
        }, 30000); // Check every 30 seconds
    }

    // ==============================================
    // METU DEVICE MANAGEMENT METHODS
    // ==============================================

    /**
     * Create a new METU device
     */
    async createDevice(device: Omit<MetuDevice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const deviceId = `metu_device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const deviceData: MetuDevice = {
            ...device,
            id: deviceId,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSeen: device.lastSeen || new Date(),
            healthScore: device.healthScore || 100
        };

        try {
            await this.sql().query(
                `INSERT INTO metu_devices (id, name, type, status, last_seen, metadata, version, location, capabilities, configuration, health_score, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    deviceData.id,
                    deviceData.name,
                    deviceData.type,
                    deviceData.status,
                    deviceData.lastSeen?.toISOString(),
                    JSON.stringify(deviceData.metadata || {}),
                    deviceData.version,
                    deviceData.location,
                    JSON.stringify(deviceData.capabilities || []),
                    JSON.stringify(deviceData.configuration || {}),
                    deviceData.healthScore,
                    deviceData.createdAt?.toISOString(),
                    deviceData.updatedAt?.toISOString()
                ]
            );

            this.currentDevices.set(deviceId, deviceData);
            this.emit('device_created', deviceData);

            console.log(`✅ METU device created: ${deviceData.name} (${deviceId})`);
            return deviceId;
        } catch (error) {
            console.error('❌ Failed to create METU device:', error);
            throw new Error(`Device creation failed: ${error}`);
        }
    }

    /**
     * Get METU device by ID
     */
    async getDevice(deviceId: string): Promise<MetuDevice | null> {
        try {
            const result = await this.sql().query(
                'SELECT * FROM metu_devices WHERE id = ?',
                [deviceId]
            );

            if (!result.data || result.data.length === 0) {
                return null;
            }

            const deviceData = this.parseDeviceFromDB(result.data[0]);
            this.currentDevices.set(deviceId, deviceData);
            return deviceData;
        } catch (error) {
            console.error(`❌ Failed to get device ${deviceId}:`, error);
            return null;
        }
    }

    /**
     * Get all METU devices
     */
    async getAllDevices(): Promise<MetuDevice[]> {
        try {
            const result = await this.sql().query('SELECT * FROM metu_devices ORDER BY created_at DESC');

            if (!result.data) {
                return [];
            }

            const devices = result.data.map(row => this.parseDeviceFromDB(row));

            // Update current devices cache
            devices.forEach(device => {
                if (device.id) {
                    this.currentDevices.set(device.id, device);
                }
            });

            return devices;
        } catch (error) {
            console.error('❌ Failed to get all devices:', error);
            return [];
        }
    }

    /**
     * Update METU device
     */
    async updateDevice(deviceId: string, updates: Partial<MetuDevice>): Promise<boolean> {
        try {
            const currentDevice = await this.getDevice(deviceId);
            if (!currentDevice) {
                throw new Error(`Device ${deviceId} not found`);
            }

            const updatedDevice: MetuDevice = {
                ...currentDevice,
                ...updates,
                id: deviceId,
                updatedAt: new Date()
            };

            await this.sql().query(
                `UPDATE metu_devices SET 
                 name = ?, type = ?, status = ?, last_seen = ?, metadata = ?, 
                 version = ?, location = ?, capabilities = ?, configuration = ?, 
                 health_score = ?, updated_at = ?
                 WHERE id = ?`,
                [
                    updatedDevice.name,
                    updatedDevice.type,
                    updatedDevice.status,
                    updatedDevice.lastSeen?.toISOString(),
                    JSON.stringify(updatedDevice.metadata || {}),
                    updatedDevice.version,
                    updatedDevice.location,
                    JSON.stringify(updatedDevice.capabilities || []),
                    JSON.stringify(updatedDevice.configuration || {}),
                    updatedDevice.healthScore,
                    updatedDevice.updatedAt?.toISOString(),
                    deviceId
                ]
            );

            this.currentDevices.set(deviceId, updatedDevice);
            this.emit('device_updated', updatedDevice);

            console.log(`✅ METU device updated: ${updatedDevice.name} (${deviceId})`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to update device ${deviceId}:`, error);
            throw new Error(`Device update failed: ${error}`);
        }
    }

    /**
     * Delete METU device
     */
    async deleteDevice(deviceId: string): Promise<boolean> {
        try {
            const device = await this.getDevice(deviceId);
            if (!device) {
                console.warn(`Device ${deviceId} not found for deletion`);
                return false;
            }

            await this.sql().query('DELETE FROM metu_devices WHERE id = ?', [deviceId]);

            this.currentDevices.delete(deviceId);
            this.emit('device_deleted', { id: deviceId, device });

            console.log(`✅ METU device deleted: ${device.name} (${deviceId})`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to delete device ${deviceId}:`, error);
            throw new Error(`Device deletion failed: ${error}`);
        }
    }

    // ==============================================
    // METU CONVERSATION MANAGEMENT METHODS
    // ==============================================

    /**
     * Create a new conversation for a device
     */
    async createConversation(deviceId: string, title?: string, metadata?: Record<string, any>): Promise<string> {
        const conversationId = `metu_conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const conversationData: MetuConversation = {
            id: conversationId,
            deviceId,
            title: title || `Conversation with ${deviceId}`,
            status: 'active',
            metadata: metadata || {},
            createdAt: new Date(),
            updatedAt: new Date(),
            lastActivity: new Date(),
            messageCount: 0
        };

        try {
            await this.sql().query(
                `INSERT INTO metu_conversations (id, device_id, title, status, participants, metadata, created_at, updated_at, last_activity, message_count) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    conversationData.id,
                    conversationData.deviceId,
                    conversationData.title,
                    conversationData.status,
                    JSON.stringify(conversationData.participants || []),
                    JSON.stringify(conversationData.metadata),
                    conversationData.createdAt?.toISOString(),
                    conversationData.updatedAt?.toISOString(),
                    conversationData.lastActivity?.toISOString(),
                    conversationData.messageCount
                ]
            );

            this.currentConversations.set(conversationId, conversationData);
            this.emit('conversation_created', conversationData);

            console.log(`✅ METU conversation created: ${conversationData.title} (${conversationId})`);
            return conversationId;
        } catch (error) {
            console.error('❌ Failed to create METU conversation:', error);
            throw new Error(`Conversation creation failed: ${error}`);
        }
    }

    /**
     * Get conversation by ID
     */
    async getConversation(conversationId: string): Promise<MetuConversation | null> {
        try {
            const result = await this.sql().query(
                'SELECT * FROM metu_conversations WHERE id = ?',
                [conversationId]
            );

            if (!result.data || result.data.length === 0) {
                return null;
            }

            const conversationData = this.parseConversationFromDB(result.data[0]);
            this.currentConversations.set(conversationId, conversationData);
            return conversationData;
        } catch (error) {
            console.error(`❌ Failed to get conversation ${conversationId}:`, error);
            return null;
        }
    }

    /**
     * Get all conversations for a device
     */
    async getDeviceConversations(deviceId: string): Promise<MetuConversation[]> {
        try {
            const result = await this.sql().query(
                'SELECT * FROM metu_conversations WHERE device_id = ? ORDER BY last_activity DESC',
                [deviceId]
            );

            if (!result.data) {
                return [];
            }

            const conversations = result.data.map(row => this.parseConversationFromDB(row));

            // Update cache
            conversations.forEach(conv => {
                if (conv.id) {
                    this.currentConversations.set(conv.id, conv);
                }
            });

            return conversations;
        } catch (error) {
            console.error(`❌ Failed to get conversations for device ${deviceId}:`, error);
            return [];
        }
    }

    /**
     * Update conversation
     */
    async updateConversation(conversationId: string, updates: Partial<MetuConversation>): Promise<boolean> {
        try {
            const currentConv = await this.getConversation(conversationId);
            if (!currentConv) {
                throw new Error(`Conversation ${conversationId} not found`);
            }

            const updatedConv: MetuConversation = {
                ...currentConv,
                ...updates,
                id: conversationId,
                updatedAt: new Date()
            };

            await this.sql().query(
                `UPDATE metu_conversations SET 
                 title = ?, status = ?, participants = ?, metadata = ?, 
                 updated_at = ?, last_activity = ?, message_count = ?
                 WHERE id = ?`,
                [
                    updatedConv.title,
                    updatedConv.status,
                    JSON.stringify(updatedConv.participants || []),
                    JSON.stringify(updatedConv.metadata || {}),
                    updatedConv.updatedAt?.toISOString(),
                    updatedConv.lastActivity?.toISOString(),
                    updatedConv.messageCount,
                    conversationId
                ]
            );

            this.currentConversations.set(conversationId, updatedConv);
            this.emit('conversation_updated', updatedConv);

            return true;
        } catch (error) {
            console.error(`❌ Failed to update conversation ${conversationId}:`, error);
            throw new Error(`Conversation update failed: ${error}`);
        }
    }

    // ==============================================
    // METU MESSAGE MANAGEMENT METHODS
    // ==============================================

    /**
     * Create a new message in a conversation
     */
    async createMessage(message: Omit<MetuMessage, 'id' | 'createdAt'>): Promise<string> {
        const messageId = `metu_msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const messageData: MetuMessage = {
            ...message,
            id: messageId,
            createdAt: new Date(),
            processed: false
        };

        try {
            await this.sql().query(
                `INSERT INTO metu_messages (id, conversation_id, device_id, content, type, sender, metadata, created_at, processed, response_time) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    messageData.id,
                    messageData.conversationId,
                    messageData.deviceId,
                    messageData.content,
                    messageData.type || 'text',
                    messageData.sender,
                    JSON.stringify(messageData.metadata || {}),
                    messageData.createdAt?.toISOString(),
                    messageData.processed ? 1 : 0,
                    messageData.responseTime
                ]
            );

            // Update conversation message count and last activity
            await this.sql().query(
                `UPDATE metu_conversations SET 
                 message_count = message_count + 1, 
                 last_activity = ?, 
                 updated_at = ?
                 WHERE id = ?`,
                [
                    messageData.createdAt?.toISOString(),
                    messageData.createdAt?.toISOString(),
                    messageData.conversationId
                ]
            );

            // Update device last seen
            await this.updateDeviceLastSeen(messageData.deviceId);

            this.emit('message_created', messageData);

            console.log(`✅ METU message created in conversation ${messageData.conversationId} (${messageId})`);
            return messageId;
        } catch (error) {
            console.error('❌ Failed to create METU message:', error);
            throw new Error(`Message creation failed: ${error}`);
        }
    }

    /**
     * Get message by ID
     */
    async getMessage(messageId: string): Promise<MetuMessage | null> {
        try {
            const result = await this.sql().query(
                'SELECT * FROM metu_messages WHERE id = ?',
                [messageId]
            );

            if (!result.data || result.data.length === 0) {
                return null;
            }

            return this.parseMessageFromDB(result.data[0]);
        } catch (error) {
            console.error(`❌ Failed to get message ${messageId}:`, error);
            return null;
        }
    }

    /**
     * Get all messages in a conversation
     */
    async getConversationMessages(conversationId: string, limit: number = 100, offset: number = 0): Promise<MetuMessage[]> {
        try {
            const result = await this.sql().query(
                'SELECT * FROM metu_messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ? OFFSET ?',
                [conversationId, limit, offset]
            );

            if (!result.data) {
                return [];
            }

            return result.data.map(row => this.parseMessageFromDB(row));
        } catch (error) {
            console.error(`❌ Failed to get messages for conversation ${conversationId}:`, error);
            return [];
        }
    }

    /**
     * Get recent messages for a device
     */
    async getDeviceMessages(deviceId: string, limit: number = 50): Promise<MetuMessage[]> {
        try {
            const result = await this.sql().query(
                'SELECT * FROM metu_messages WHERE device_id = ? ORDER BY created_at DESC LIMIT ?',
                [deviceId, limit]
            );

            if (!result.data) {
                return [];
            }

            return result.data.map(row => this.parseMessageFromDB(row));
        } catch (error) {
            console.error(`❌ Failed to get messages for device ${deviceId}:`, error);
            return [];
        }
    }

    /**
     * Update message (mark as processed, add response time, etc.)
     */
    async updateMessage(messageId: string, updates: Partial<MetuMessage>): Promise<boolean> {
        try {
            const current = await this.getMessage(messageId);
            if (!current) {
                throw new Error(`Message ${messageId} not found`);
            }

            const updated: MetuMessage = {
                ...current,
                ...updates,
                id: messageId
            };

            await this.sql().query(
                `UPDATE metu_messages SET 
                 content = ?, type = ?, sender = ?, metadata = ?, 
                 processed = ?, response_time = ?
                 WHERE id = ?`,
                [
                    updated.content,
                    updated.type,
                    updated.sender,
                    JSON.stringify(updated.metadata || {}),
                    updated.processed ? 1 : 0,
                    updated.responseTime,
                    messageId
                ]
            );

            this.emit('message_updated', updated);
            return true;
        } catch (error) {
            console.error(`❌ Failed to update message ${messageId}:`, error);
            throw new Error(`Message update failed: ${error}`);
        }
    }

    // ==============================================
    // UTILITY AND PARSER METHODS
    // ==============================================

    /**
     * Parse device data from database row
     */
    private parseDeviceFromDB(row: any): MetuDevice {
        return {
            id: row.id,
            name: row.name,
            type: row.type,
            status: row.status,
            lastSeen: row.last_seen ? new Date(row.last_seen) : new Date(),
            metadata: row.metadata ? JSON.parse(row.metadata) : {},
            version: row.version,
            location: row.location,
            capabilities: row.capabilities ? JSON.parse(row.capabilities) : [],
            configuration: row.configuration ? JSON.parse(row.configuration) : {},
            healthScore: row.health_score || 100,
            createdAt: row.created_at ? new Date(row.created_at) : new Date(),
            updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
        };
    }

    /**
     * Parse conversation data from database row
     */
    private parseConversationFromDB(row: any): MetuConversation {
        return {
            id: row.id,
            deviceId: row.device_id,
            title: row.title,
            status: row.status,
            participants: row.participants ? JSON.parse(row.participants) : [],
            metadata: row.metadata ? JSON.parse(row.metadata) : {},
            createdAt: row.created_at ? new Date(row.created_at) : new Date(),
            updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
            lastActivity: row.last_activity ? new Date(row.last_activity) : new Date(),
            messageCount: row.message_count || 0
        };
    }

    /**
     * Parse message data from database row
     */
    private parseMessageFromDB(row: any): MetuMessage {
        return {
            id: row.id,
            conversationId: row.conversation_id,
            deviceId: row.device_id,
            content: row.content,
            type: row.type || 'text',
            sender: row.sender,
            metadata: row.metadata ? JSON.parse(row.metadata) : {},
            createdAt: row.created_at ? new Date(row.created_at) : new Date(),
            processed: Boolean(row.processed),
            responseTime: row.response_time
        };
    }

    /**
     * Get device statistics
     */
    async getDeviceStats(deviceId: string): Promise<any> {
        try {
            const result = await this.sql().query(`
                SELECT 
                    COUNT(DISTINCT c.id) as conversation_count,
                    COUNT(m.id) as message_count,
                    MAX(m.created_at) as last_message_time,
                    AVG(m.response_time) as avg_response_time
                FROM metu_devices d
                LEFT JOIN metu_conversations c ON d.id = c.device_id
                LEFT JOIN metu_messages m ON c.id = m.conversation_id
                WHERE d.id = ?
                GROUP BY d.id
            `, [deviceId]);

            return result.data?.[0] || {
                conversation_count: 0,
                message_count: 0,
                last_message_time: null,
                avg_response_time: null
            };
        } catch (error) {
            console.error(`❌ Failed to get stats for device ${deviceId}:`, error);
            return null;
        }
    }

    /**
     * Cleanup old data (messages older than specified days)
     */
    async cleanup(olderThanDays: number = 30): Promise<{ deletedMessages: number; deletedConversations: number }> {
        if (this.isCleaningUp) {
            console.log('⚠️ Cleanup already in progress');
            return { deletedMessages: 0, deletedConversations: 0 };
        }

        this.isCleaningUp = true;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        try {
            console.log(`🧹 Starting cleanup of data older than ${olderThanDays} days (before ${cutoffDate.toISOString()})`);

            // Delete old messages
            const messageResult = await this.sql().query(
                'DELETE FROM metu_messages WHERE created_at < ?',
                [cutoffDate.toISOString()]
            );

            // Delete conversations with no messages
            const conversationResult = await this.sql().query(`
                DELETE FROM metu_conversations 
                WHERE id NOT IN (
                    SELECT DISTINCT conversation_id 
                    FROM metu_messages 
                    WHERE conversation_id IS NOT NULL
                )
            `);

            const deletedMessages = messageResult.affectedRows || 0;
            const deletedConversations = conversationResult.affectedRows || 0;

            console.log(`✅ Cleanup completed: ${deletedMessages} messages, ${deletedConversations} conversations deleted`);

            this.emit('cleanup_completed', {
                deletedMessages,
                deletedConversations,
                cutoffDate
            });

            return { deletedMessages, deletedConversations };
        } catch (error) {
            console.error('❌ Cleanup failed:', error);
            this.emit('cleanup_error', error);
            throw new Error(`Cleanup failed: ${error}`);
        } finally {
            this.isCleaningUp = false;
        }
    }

    /**
     * Get comprehensive analytics for METU system
     */
    async getAnalytics(): Promise<any> {
        try {
            const [deviceStats, conversationStats, messageStats] = await Promise.all([
                this.sql().query(`
                    SELECT 
                        COUNT(*) as total_devices,
                        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_devices,
                        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_devices,
                        AVG(health_score) as avg_health_score
                    FROM metu_devices
                `),
                this.sql().query(`
                    SELECT 
                        COUNT(*) as total_conversations,
                        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_conversations,
                        AVG(message_count) as avg_messages_per_conversation
                    FROM metu_conversations
                `),
                this.sql().query(`
                    SELECT 
                        COUNT(*) as total_messages,
                        COUNT(CASE WHEN processed = 1 THEN 1 END) as processed_messages,
                        AVG(response_time) as avg_response_time,
                        COUNT(CASE WHEN type = 'error' THEN 1 END) as error_messages
                    FROM metu_messages
                `)
            ]);

            return {
                devices: deviceStats.data?.[0] || {},
                conversations: conversationStats.data?.[0] || {},
                messages: messageStats.data?.[0] || {},
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('❌ Failed to get analytics:', error);
            return null;
        }
    }

    // ==============================================
    // SQL INTERFACE AND CORE METHODS
    // ==============================================

    /**
     * SQL interface that maps to CBD document operations
     * Maintains CND compatibility while using CBD backend
     */
    sql() {
        return {
            query: async (sql: string, params: any[] = []): Promise<CBDQueryResult> => {
                if (!this.connected) {
                    throw new Error('CBD client not connected. Call connect() first.');
                }

                try {
                    // Parse SQL to determine operation type
                    const operation = this.parseSQLOperation(sql);

                    switch (operation.type) {
                        case 'CREATE_TABLE':
                            return await this.handleCreateTable(operation, params);
                        case 'INSERT':
                            return await this.handleInsert(operation, params);
                        case 'SELECT':
                            return await this.handleSelect(operation, params);
                        case 'UPDATE':
                            return await this.handleUpdate(operation, params);
                        case 'DELETE':
                            return await this.handleDelete(operation, params);
                        default:
                            console.warn(`Unsupported SQL operation: ${sql}`);
                            return { data: [], affectedRows: 0 };
                    }
                } catch (error) {
                    console.error('CBD Query Error:', error);
                    return { error: `Query failed: ${error}` };
                }
            }
        };
    }

    /**
     * Parse SQL to determine operation and extract table/collection info
     */
    private parseSQLOperation(sql: string): any {
        const normalizedSQL = sql.trim().toUpperCase();

        if (normalizedSQL.startsWith('CREATE TABLE')) {
            const tableMatch = sql.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i);
            return {
                type: 'CREATE_TABLE',
                table: tableMatch?.[1] || 'unknown',
                sql: sql
            };
        }

        if (normalizedSQL.startsWith('INSERT')) {
            const tableMatch = sql.match(/INSERT INTO (\w+)/i);
            return {
                type: 'INSERT',
                table: tableMatch?.[1] || 'unknown',
                sql: sql
            };
        }

        if (normalizedSQL.startsWith('SELECT')) {
            const tableMatch = sql.match(/FROM (\w+)/i);
            return {
                type: 'SELECT',
                table: tableMatch?.[1] || 'unknown',
                sql: sql
            };
        }

        if (normalizedSQL.startsWith('UPDATE')) {
            const tableMatch = sql.match(/UPDATE (\w+)/i);
            return {
                type: 'UPDATE',
                table: tableMatch?.[1] || 'unknown',
                sql: sql
            };
        }

        if (normalizedSQL.startsWith('DELETE')) {
            const tableMatch = sql.match(/FROM (\w+)/i);
            return {
                type: 'DELETE',
                table: tableMatch?.[1] || 'unknown',
                sql: sql
            };
        }

        return { type: 'UNKNOWN', sql: sql };
    }

    /**
     * Handle CREATE TABLE by creating a CBD document collection
     */
    private async handleCreateTable(operation: any, _params: any[]): Promise<CBDQueryResult> {
        // For CREATE TABLE, we just acknowledge it since CBD collections are created on-demand
        console.log(`📝 CBD: Table '${operation.table}' schema noted (collections created on-demand)`);
        return { data: [], affectedRows: 0 };
    }

    /**
     * Handle INSERT by adding document to CBD collection
     */
    private async handleInsert(operation: any, params: any[]): Promise<CBDQueryResult> {
        try {
            // Extract values from INSERT statement and params
            const insertData = this.extractInsertData(operation.sql, params);

            const response = await fetch(`${this.baseUrl}/document/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collection: operation.table,
                    document: insertData
                })
            });

            if (!response.ok) {
                throw new Error(`Insert failed: ${response.status}`);
            }

            const result = await response.json();
            return {
                data: [{ insertId: result.id || 1 }],
                insertId: result.id || 1,
                affectedRows: 1
            };
        } catch (error) {
            throw new Error(`CBD Insert Error: ${error}`);
        }
    }

    /**
     * Handle SELECT by querying CBD document collection
     */
    private async handleSelect(operation: any, params: any[]): Promise<CBDQueryResult> {
        try {
            // Enhanced SELECT handling with WHERE clause support
            const whereClause = this.extractWhereClause(operation.sql, params);

            let url = `${this.baseUrl}/document/?collection=${operation.table}`;

            // Add query parameters if WHERE clause exists
            if (whereClause.field && whereClause.value) {
                url += `&${whereClause.field}=${encodeURIComponent(whereClause.value)}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Select failed: ${response.status}`);
            }

            const result = await response.json();
            let documents = result.documents || [];

            // Apply additional filtering for complex WHERE clauses
            if (whereClause.operator && whereClause.operator !== '=') {
                documents = this.filterDocuments(documents, whereClause);
            }

            // Apply LIMIT and OFFSET
            const limitOffset = this.extractLimitOffset(operation.sql);
            if (limitOffset.limit) {
                const start = limitOffset.offset || 0;
                const end = start + limitOffset.limit;
                documents = documents.slice(start, end);
            }

            return {
                data: documents,
                rows: documents
            };
        } catch (error) {
            throw new Error(`CBD Select Error: ${error}`);
        }
    }

    /**
     * Handle UPDATE by updating CBD document
     */
    private async handleUpdate(operation: any, params: any[]): Promise<CBDQueryResult> {
        try {
            const updateData = this.extractUpdateData(operation.sql, params);
            const whereClause = this.extractWhereClause(operation.sql, params);

            // First, find documents to update
            const selectResult = await this.handleSelect({
                type: 'SELECT',
                table: operation.table,
                sql: `SELECT * FROM ${operation.table} WHERE ${whereClause.field} = ?`
            }, [whereClause.value]);

            let affectedRows = 0;

            if (selectResult.data && selectResult.data.length > 0) {
                for (const doc of selectResult.data) {
                    const updatedDoc = { ...doc, ...updateData };

                    const response = await fetch(`${this.baseUrl}/document/${doc.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            collection: operation.table,
                            document: updatedDoc
                        })
                    });

                    if (response.ok) {
                        affectedRows++;
                    }
                }
            }

            return { data: [], affectedRows };
        } catch (error) {
            throw new Error(`CBD Update Error: ${error}`);
        }
    }

    /**
     * Handle DELETE by removing CBD document
     */
    private async handleDelete(operation: any, params: any[]): Promise<CBDQueryResult> {
        try {
            const whereClause = this.extractWhereClause(operation.sql, params);

            // First, find documents to delete
            const selectResult = await this.handleSelect({
                type: 'SELECT',
                table: operation.table,
                sql: `SELECT * FROM ${operation.table} WHERE ${whereClause.field} = ?`
            }, [whereClause.value]);

            let affectedRows = 0;

            if (selectResult.data && selectResult.data.length > 0) {
                for (const doc of selectResult.data) {
                    const response = await fetch(`${this.baseUrl}/document/${doc.id}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        affectedRows++;
                    }
                }
            }

            return { data: [], affectedRows };
        } catch (error) {
            throw new Error(`CBD Delete Error: ${error}`);
        }
    }

    /**
     * Update device last seen timestamp
     */
    async updateDeviceLastSeen(deviceId: string): Promise<void> {
        try {
            const now = new Date();
            await this.sql().query(
                "UPDATE metu_devices SET last_seen = ?, updated_at = ? WHERE id = ?",
                [now.toISOString(), now.toISOString(), deviceId]
            );

            // Update cache
            const cachedDevice = this.currentDevices.get(deviceId);
            if (cachedDevice) {
                cachedDevice.lastSeen = now;
                cachedDevice.updatedAt = now;
                this.emit("device_activity", { deviceId, lastSeen: now });
            }
        } catch (error) {
            console.error(`❌ Failed to update last seen for device ${deviceId}:`, error);
        }
    }

    /**
     * Extract insert data from SQL and parameters
     */
    private extractInsertData(sql: string, params: any[]): any {
        // Enhanced extraction for METU-specific data
        const document: any = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            sql_source: sql
        };

        // Try to parse column names from INSERT statement
        const columnsMatch = sql.match(/INSERT INTO \w+\s*\((.*?)\)/i);
        if (columnsMatch && params.length > 0) {
            const columns = columnsMatch[1].split(',').map(col => col.trim().replace(/['"]/g, ''));
            columns.forEach((column, index) => {
                if (index < params.length) {
                    document[column] = params[index];
                }
            });
        } else {
            // Fallback: map parameters as indexed fields
            params.forEach((param, index) => {
                document[`param_${index}`] = param;
            });
        }

        return document;
    }

    /**
     * Extract WHERE clause from SQL
     */
    private extractWhereClause(sql: string, params: any[]): any {
        const whereMatch = sql.match(/WHERE\s+(\w+)\s*(=|!=|<|>|<=|>=|LIKE)\s*\?/i);
        if (whereMatch && params.length > 0) {
            return {
                field: whereMatch[1],
                operator: whereMatch[2],
                value: params[0]
            };
        }
        return {};
    }

    /**
     * Extract LIMIT and OFFSET from SQL
     */
    private extractLimitOffset(sql: string): { limit?: number; offset?: number } {
        const limitMatch = sql.match(/LIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?/i);
        if (limitMatch) {
            return {
                limit: parseInt(limitMatch[1]),
                offset: limitMatch[2] ? parseInt(limitMatch[2]) : undefined
            };
        }
        return {};
    }

    /**
     * Extract UPDATE data from SQL
     */
    private extractUpdateData(sql: string, params: any[]): any {
        const setMatch = sql.match(/SET\s+(.*?)\s+WHERE/i);
        if (setMatch) {
            const setPairs = setMatch[1].split(',');
            const updateData: any = {};
            let paramIndex = 0;

            setPairs.forEach(pair => {
                const [field] = pair.split('=').map(p => p.trim());
                if (paramIndex < params.length) {
                    updateData[field] = params[paramIndex++];
                }
            });

            return updateData;
        }
        return {};
    }

    /**
     * Filter documents based on WHERE clause operators
     */
    private filterDocuments(documents: any[], whereClause: any): any[] {
        if (!whereClause.field || !whereClause.operator) {
            return documents;
        }

        return documents.filter(doc => {
            const fieldValue = doc[whereClause.field];
            const compareValue = whereClause.value;

            switch (whereClause.operator.toUpperCase()) {
                case '!=':
                case '<>':
                    return fieldValue !== compareValue;
                case '<':
                    return fieldValue < compareValue;
                case '>':
                    return fieldValue > compareValue;
                case '<=':
                    return fieldValue <= compareValue;
                case '>=':
                    return fieldValue >= compareValue;
                case 'LIKE':
                    return String(fieldValue).includes(String(compareValue).replace(/%/g, ''));
                default:
                    return fieldValue === compareValue;
            }
        });
    }

    /**
     * Get health status (replaces CND health methods)
     */
    async getHealthStatus(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            const health = await response.json();

            // Add METU-specific health info
            const analytics = await this.getAnalytics();

            return {
                ...health,
                metu: {
                    devices: analytics?.devices || {},
                    conversations: analytics?.conversations || {},
                    messages: analytics?.messages || {},
                    caches: {
                        devices: this.currentDevices.size,
                        conversations: this.currentConversations.size
                    }
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: String(error),
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Backward compatibility alias
export const CND = CBDClient;

/**
 * Factory function for easy CBD client creation
 */
export function createCBDClient(config: CBDClientConfig = {}): CBDClient {
    return new CBDClient(config);
}

/**
 * Create METU-compatible CBD client (replaces MetuCNDClient)
 */
export function createMetuCBDClient(config: CBDClientConfig = {}): CBDClient {
    return new CBDClient({
        ...config,
        name: "METU-CBD-Client"
    });
}

