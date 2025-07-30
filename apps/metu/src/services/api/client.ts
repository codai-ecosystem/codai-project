/**
 * METU API Client - Frontend Service
 * 
 * Client-side service for communicating with the METU backend server.
 * Handles REST API calls and Socket.IO connections for real-time sync.
 */

import { io, Socket } from 'socket.io-client';
import { UserSettings, ConversationMessage, ConversationSession } from '../database/schema';

export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    message?: string;
    timestamp?: string;
}

export interface SocketMessage {
    event: string;
    data: any;
    timestamp: string;
}

export class MetuApiClient {
    private baseUrl: string;
    private socket: Socket | null = null;
    private wsReconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private eventListeners: Map<string, Function[]> = new Map();

    constructor(baseUrl: string = 'http://localhost:4402') {
        this.baseUrl = baseUrl;
        console.log(`🔌 METU API Client initialized with base URL: ${baseUrl}`);
    }

    /**
     * Initialize Socket.IO connection
     */
    public initializeWebSocket(userId: string, clientType: 'desktop' | 'web' = 'desktop'): void {
        try {
            this.socket = io(this.baseUrl, {
                transports: ['websocket', 'polling'],
                timeout: 20000,
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
            });

            this.socket.on('connect', () => {
                console.log('🔌 Socket.IO connected to METU server');
                this.wsReconnectAttempts = 0;

                // Register client with server
                this.socket?.emit('register', {
                    userId,
                    clientType,
                    deviceInfo: {
                        platform: navigator.platform,
                        userAgent: navigator.userAgent,
                        version: '1.0.0',
                    },
                });
            });

            this.socket.on('disconnect', (reason) => {
                console.log('🔌 Socket.IO disconnected from METU server:', reason);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket.IO connection error:', error);
            });

            // Handle custom events
            this.socket.on('settings_updated', (data) => {
                this.handleSocketMessage({ event: 'settings_updated', data, timestamp: new Date().toISOString() });
            });

            this.socket.on('new_message', (data) => {
                this.handleSocketMessage({ event: 'new_message', data, timestamp: new Date().toISOString() });
            });

            this.socket.on('activity', (data) => {
                this.handleSocketMessage({ event: 'activity', data, timestamp: new Date().toISOString() });
            });

        } catch (error) {
            console.error('Failed to initialize Socket.IO:', error);
        }
    }

    /**
     * Attempt to reconnect WebSocket
     */
    private attemptReconnect(userId: string, clientType: 'desktop' | 'web'): void {
        if (this.wsReconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max WebSocket reconnect attempts reached');
            return;
        }

        this.wsReconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.wsReconnectAttempts - 1);

        console.log(`🔄 Attempting WebSocket reconnect (${this.wsReconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

        setTimeout(() => {
            this.initializeWebSocket(userId, clientType);
        }, delay);
    }

    /**
     * Send Socket.IO message
     */
    private sendWebSocketMessage(event: string, data: any): void {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        }
    }

    /**
     * Handle incoming Socket.IO messages
     */
    private handleSocketMessage(message: SocketMessage): void {
        const listeners = this.eventListeners.get(message.event) || [];
        listeners.forEach(listener => {
            try {
                listener(message.data);
            } catch (error) {
                console.error(`Error in Socket.IO event listener for ${message.event}:`, error);
            }
        });
    }

    /**
     * Add WebSocket event listener
     */
    public on(event: string, listener: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(listener);
    }

    /**
     * Remove WebSocket event listener
     */
    public off(event: string, listener: Function): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Generic API request method
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const defaultHeaders = {
                'Content-Type': 'application/json',
                'X-Client-Type': 'desktop',
            };

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return {
                    error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
                    message: errorData.message,
                };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            return {
                error: 'Network error occurred',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * User Settings API
     */
    public async getUserSettings(userId: string): Promise<ApiResponse<UserSettings>> {
        return this.request<UserSettings>(`/api/users/${userId}/settings`);
    }

    public async updateUserSettings(
        userId: string,
        settings: Partial<UserSettings>
    ): Promise<ApiResponse<UserSettings>> {
        return this.request<UserSettings>(`/api/users/${userId}/settings`, {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    }

    public async exportUserData(userId: string): Promise<ApiResponse<any>> {
        return this.request<any>(`/api/users/${userId}/export`);
    }

    /**
     * Conversation API
     */
    public async getUserConversations(userId: string): Promise<ApiResponse<ConversationSession[]>> {
        return this.request<ConversationSession[]>(`/api/users/${userId}/conversations`);
    }

    public async getConversationMessages(conversationId: string): Promise<ApiResponse<ConversationMessage[]>> {
        return this.request<ConversationMessage[]>(`/api/conversations/${conversationId}/messages`);
    }

    public async saveMessage(
        conversationId: string,
        messageData: Partial<ConversationMessage>
    ): Promise<ApiResponse<ConversationMessage>> {
        return this.request<ConversationMessage>(`/api/conversations/${conversationId}/messages`, {
            method: 'POST',
            body: JSON.stringify(messageData),
        });
    }

    /**
     * Sync API
     */
    public async syncSettings(
        userId: string,
        deviceId: string,
        settings: Partial<UserSettings>
    ): Promise<ApiResponse<{ success: boolean; timestamp: string }>> {
        return this.request<{ success: boolean; timestamp: string }>(`/api/sync/settings/${userId}`, {
            method: 'POST',
            body: JSON.stringify({ deviceId, settings }),
        });
    }

    public async getServerStats(): Promise<ApiResponse<any>> {
        return this.request<any>('/api/sync/stats');
    }

    /**
     * Health check
     */
    public async healthCheck(): Promise<ApiResponse<any>> {
        return this.request<any>('/health');
    }

    /**
     * Close Socket.IO connection
     */
    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.eventListeners.clear();
    }

    /**
     * Send activity ping to server
     */
    public sendActivity(): void {
        this.sendWebSocketMessage('activity', {});
    }

    /**
     * Get connection status
     */
    public isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

// Export singleton instance
export const apiClient = new MetuApiClient();
