/**
 * MetuCBDClient - Drop-in replacement for MetuCNDClient
 * Provides 100% API compatibility while using the modern CBD Universal Database
 * 
 * This class serves as a compatibility layer between legacy CND API calls
 * and the new enhanced CBDClient functionality.
 */

import { CBDClient, type CBDClientConfig } from '@codai/cbd';
import { EventEmitter } from 'events';

// Re-export types for compatibility
export interface MetuDevice {
    id: string;
    name: string;
    type: string;
    status: 'online' | 'offline' | 'connecting';
    ip?: string;
    port?: number;
    platform?: string;
    version?: string;
    capabilities?: string[];
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
    last_seen: string;
}

export interface MetuConversation {
    id: string;
    device_id: string;
    title?: string;
    type: 'chat' | 'command' | 'file_transfer' | 'screen_share';
    status: 'active' | 'paused' | 'completed' | 'error';
    participants?: string[];
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface MetuMessage {
    id: string;
    conversation_id: string;
    device_id: string;
    content: string;
    type: 'text' | 'file' | 'image' | 'command' | 'system';
    sender: 'user' | 'device' | 'system';
    status: 'sent' | 'delivered' | 'read' | 'error';
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface CBDQueryResult {
    success: boolean;
    data?: any;
    error?: string;
    rowCount?: number;
    metadata?: Record<string, any>;
}

/**
 * MetuCBDClient - Exact API replacement for MetuCNDClient
 * 
 * Maintains 100% compatibility with existing code while leveraging
 * the enhanced CBD Universal Database backend.
 */
export class MetuCBDClient extends EventEmitter {
    private cbdClient: CBDClient;
    private isConnected: boolean = false;
    private healthCheckInterval?: NodeJS.Timeout;

    constructor(config: CBDClientConfig = {}) {
        super();

        // Initialize enhanced CBD client with METU-specific configuration
        this.cbdClient = new CBDClient({
            ...config,
            name: 'METU-CBD-Client',
            enableCache: true,
            enableEvents: true
        });

        // Forward all CBD events to maintain compatibility
        this.setupEventForwarding();
    }

    /**
     * Forward CBD client events to maintain CND API compatibility
     */
    private setupEventForwarding(): void {
        // Forward all CBD events
        this.cbdClient.on('connected', () => {
            this.isConnected = true;
            this.emit('connected');
        });

        this.cbdClient.on('disconnected', () => {
            this.isConnected = false;
            this.emit('disconnected');
        });

        this.cbdClient.on('error', (error) => {
            this.emit('error', error);
        });

        // Forward device events
        this.cbdClient.on('device_created', (device) => {
            this.emit('device_created', device);
        });

        this.cbdClient.on('device_updated', (device) => {
            this.emit('device_updated', device);
        });

        this.cbdClient.on('device_activity', (activity) => {
            this.emit('device_activity', activity);
        });

        // Forward conversation events
        this.cbdClient.on('conversation_created', (conversation) => {
            this.emit('conversation_created', conversation);
        });

        this.cbdClient.on('conversation_updated', (conversation) => {
            this.emit('conversation_updated', conversation);
        });

        // Forward message events
        this.cbdClient.on('message_created', (message) => {
            this.emit('message_created', message);
        });

        this.cbdClient.on('message_updated', (message) => {
            this.emit('message_updated', message);
        });

        // Forward health events
        this.cbdClient.on('health_check', (status) => {
            this.emit('health_check', status);
        });
    }

    // ================================
    // CONNECTION MANAGEMENT (CND API)
    // ================================

    async connect(): Promise<void> {
        try {
            await this.cbdClient.connect();
            this.isConnected = true;
            this.emit('connected');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.healthCheckInterval) {
                clearInterval(this.healthCheckInterval);
                this.healthCheckInterval = undefined;
            }

            await this.cbdClient.disconnect();
            this.isConnected = false;
            this.emit('disconnected');
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }

    // ================================
    // DATABASE INITIALIZATION (CND API)
    // ================================

    async initializeDatabase(): Promise<void> {
        try {
            // Initialize CBD collections for METU data
            await this.cbdClient.initializeSchema();

            // Ensure required collections exist
            const collections = ['devices', 'conversations', 'messages'];
            for (const collection of collections) {
                try {
                    await this.cbdClient.createCollection(collection);
                } catch (error) {
                    // Collection might already exist, ignore error
                    console.log(`Collection ${collection} already exists or created`);
                }
            }
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    // ================================
    // DEVICE MANAGEMENT (CND API)
    // ================================

    async createDevice(deviceData: Partial<MetuDevice>): Promise<MetuDevice> {
        try {
            const device = await this.cbdClient.createDevice(deviceData);
            this.emit('device_created', device);
            return device;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async getDevice(deviceId: string): Promise<MetuDevice | null> {
        try {
            return await this.cbdClient.getDevice(deviceId);
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async getAllDevices(): Promise<MetuDevice[]> {
        try {
            return await this.cbdClient.getAllDevices();
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async updateDevice(deviceId: string, updates: Partial<MetuDevice>): Promise<MetuDevice> {
        try {
            const device = await this.cbdClient.updateDevice(deviceId, updates);
            this.emit('device_updated', device);
            return device;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async deleteDevice(deviceId: string): Promise<boolean> {
        try {
            const result = await this.cbdClient.deleteDevice(deviceId);
            if (result) {
                this.emit('device_deleted', { id: deviceId });
            }
            return result;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async updateDeviceLastSeen(deviceId: string): Promise<void> {
        try {
            await this.cbdClient.updateDeviceLastSeen(deviceId);
            this.emit('device_activity', { deviceId, action: 'last_seen_updated', timestamp: new Date().toISOString() });
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    // ================================
    // CONVERSATION MANAGEMENT (CND API)
    // ================================

    async createConversation(conversationData: Partial<MetuConversation>): Promise<MetuConversation> {
        try {
            const conversation = await this.cbdClient.createConversation(conversationData);
            this.emit('conversation_created', conversation);
            return conversation;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async getConversation(conversationId: string): Promise<MetuConversation | null> {
        try {
            return await this.cbdClient.getConversation(conversationId);
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async getDeviceConversations(deviceId: string): Promise<MetuConversation[]> {
        try {
            return await this.cbdClient.getDeviceConversations(deviceId);
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async updateConversation(conversationId: string, updates: Partial<MetuConversation>): Promise<MetuConversation> {
        try {
            const conversation = await this.cbdClient.updateConversation(conversationId, updates);
            this.emit('conversation_updated', conversation);
            return conversation;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async deleteConversation(conversationId: string): Promise<boolean> {
        try {
            const result = await this.cbdClient.deleteConversation(conversationId);
            if (result) {
                this.emit('conversation_deleted', { id: conversationId });
            }
            return result;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    // ================================
    // MESSAGE MANAGEMENT (CND API)
    // ================================

    async createMessage(messageData: Partial<MetuMessage>): Promise<MetuMessage> {
        try {
            const message = await this.cbdClient.createMessage(messageData);
            this.emit('message_created', message);
            return message;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async getMessage(messageId: string): Promise<MetuMessage | null> {
        try {
            return await this.cbdClient.getMessage(messageId);
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async getConversationMessages(conversationId: string): Promise<MetuMessage[]> {
        try {
            return await this.cbdClient.getConversationMessages(conversationId);
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async getDeviceMessages(deviceId: string): Promise<MetuMessage[]> {
        try {
            return await this.cbdClient.getDeviceMessages(deviceId);
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async updateMessage(messageId: string, updates: Partial<MetuMessage>): Promise<MetuMessage> {
        try {
            const message = await this.cbdClient.updateMessage(messageId, updates);
            this.emit('message_updated', message);
            return message;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async deleteMessage(messageId: string): Promise<boolean> {
        try {
            const result = await this.cbdClient.deleteMessage(messageId);
            if (result) {
                this.emit('message_deleted', { id: messageId });
            }
            return result;
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    // ================================
    // SQL INTERFACE (CND API)
    // ================================

    sql() {
        return {
            query: async (sql: string, params: any[] = []): Promise<CBDQueryResult> => {
                try {
                    return await this.cbdClient.sql().query(sql, params);
                } catch (error) {
                    this.emit('error', error);
                    throw error;
                }
            }
        };
    }

    // ================================
    // HEALTH AND MONITORING (CND API)
    // ================================

    async getHealthStatus(): Promise<any> {
        try {
            return await this.cbdClient.getHealthStatus();
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async getCurrentMetrics(): Promise<any> {
        try {
            return await this.cbdClient.getCurrentMetrics();
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    async getAnalytics(): Promise<any> {
        try {
            return await this.cbdClient.getAnalytics();
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    startHealthMonitoring(interval: number = 30000): void {
        try {
            // Stop existing monitoring if running
            if (this.healthCheckInterval) {
                clearInterval(this.healthCheckInterval);
            }

            // Start CBD health monitoring
            this.cbdClient.startHealthMonitoring(interval);

            // Start local health check interval for compatibility
            this.healthCheckInterval = setInterval(async () => {
                try {
                    const status = await this.getHealthStatus();
                    this.emit('health_check', status);
                } catch (error) {
                    this.emit('error', error);
                }
            }, interval);
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    stopHealthMonitoring(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }
    }

    // ================================
    // LEGACY COMPATIBILITY METHODS
    // ================================

    /**
     * Legacy method for backward compatibility
     * @deprecated Use getConnectionStatus() instead
     */
    isConnected(): boolean {
        return this.getConnectionStatus();
    }

    /**
     * Legacy method for backward compatibility
     * @deprecated Use getAnalytics() instead
     */
    async getStats(): Promise<any> {
        return this.getAnalytics();
    }

    /**
     * Legacy method for backward compatibility
     * @deprecated Use getCurrentMetrics() instead
     */
    async getMetrics(): Promise<any> {
        return this.getCurrentMetrics();
    }

    // ================================
    // UTILITY METHODS
    // ================================

    /**
     * Get the underlying CBD client instance for advanced operations
     */
    getCBDClient(): CBDClient {
        return this.cbdClient;
    }

    /**
     * Perform cleanup operations
     */
    async cleanup(): Promise<void> {
        try {
            this.stopHealthMonitoring();
            await this.disconnect();
            this.removeAllListeners();
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }

    /**
     * Check if CBD backend is available
     */
    async ping(): Promise<boolean> {
        try {
            const status = await this.getHealthStatus();
            return status?.healthy === true;
        } catch (error) {
            return false;
        }
    }
}

// ================================
// FACTORY FUNCTIONS FOR COMPATIBILITY
// ================================

/**
 * Create a new MetuCBDClient instance
 * Drop-in replacement for createMetuCNDClient()
 */
export function createMetuCBDClient(config: CBDClientConfig = {}): MetuCBDClient {
    return new MetuCBDClient(config);
}

/**
 * Legacy factory function for backward compatibility
 * @deprecated Use createMetuCBDClient() instead
 */
export function createMetuCNDClient(config: CBDClientConfig = {}): MetuCBDClient {
    console.warn('createMetuCNDClient() is deprecated. Use createMetuCBDClient() instead.');
    return createMetuCBDClient(config);
}

// ================================
// DEFAULT EXPORT FOR COMPATIBILITY
// ================================

export default MetuCBDClient;
