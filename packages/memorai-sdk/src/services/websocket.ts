/**
 * MemorAI SDK - WebSocket Service
 * 
 * Real-time WebSocket communication for memory events
 */

import WebSocket from 'ws';
import { EventEmitter } from 'eventemitter3';
import {
    SubscriptionOptions,
    MemoryNotification,
    WebSocketMessage,
    MemorAIError
} from '../types/index.js';

export class WebSocketService extends EventEmitter {
    private ws?: WebSocket;
    private url: string;
    private apiKey: string;
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000; // Start with 1 second
    private heartbeatInterval?: NodeJS.Timeout | null;
    private heartbeatTimeout?: NodeJS.Timeout | null;

    constructor(url: string, apiKey: string) {
        super();
        this.url = url;
        this.apiKey = apiKey;
    }

    /**
     * Connect to WebSocket server
     */
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve();
                return;
            }

            try {
                this.ws = new WebSocket(this.url, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'User-Agent': '@memorai/sdk@1.0.0'
                    }
                });

                this.ws.on('open', () => {
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000;
                    this.startHeartbeat();
                    this.emit('connected');
                    resolve();
                });

                this.ws.on('message', (data: WebSocket.Data) => {
                    try {
                        const message: WebSocketMessage = JSON.parse(data.toString());
                        this.handleMessage(message);
                    } catch (error: unknown) {
                        this.emit('error', {
                            code: 'WEBSOCKET_PARSE_ERROR',
                            message: 'Failed to parse WebSocket message',
                            details: { error: error instanceof Error ? error.message : String(error) },
                            timestamp: new Date()
                        } as MemorAIError);
                    }
                });

                this.ws.on('close', (code: number, reason: Buffer) => {
                    this.isConnected = false;
                    this.stopHeartbeat();
                    this.emit('disconnected', { code, reason: reason.toString() });

                    // Attempt reconnection if not explicitly closed
                    if (code !== 1000) {
                        this.attemptReconnect();
                    }
                });

                this.ws.on('error', (error: Error) => {
                    this.emit('error', {
                        code: 'WEBSOCKET_CONNECTION_ERROR',
                        message: 'WebSocket connection error',
                        details: { error: error.message },
                        timestamp: new Date()
                    } as MemorAIError);
                    reject(error);
                });

                // Connection timeout
                setTimeout(() => {
                    if (!this.isConnected) {
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, 10000);

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    async disconnect(): Promise<void> {
        if (this.ws && this.isConnected) {
            this.stopHeartbeat();
            this.ws.close(1000, 'Client disconnect');
            this.isConnected = false;
        }
    }

    /**
     * Subscribe to memory events
     */
    async subscribe(options: SubscriptionOptions): Promise<void> {
        if (!this.isConnected) {
            throw new Error('WebSocket not connected');
        }

        const message: WebSocketMessage = {
            type: 'subscribe',
            payload: options,
            timestamp: Date.now()
        };

        this.send(message);
    }

    /**
     * Unsubscribe from memory events
     */
    async unsubscribe(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        const message: WebSocketMessage = {
            type: 'unsubscribe',
            payload: null,
            timestamp: Date.now()
        };

        this.send(message);
    }

    /**
     * Send message to WebSocket server
     */
    private send(message: WebSocketMessage): void {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify(message));
        }
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleMessage(message: WebSocketMessage): void {
        switch (message.type) {
            case 'notification':
                this.emit('notification', message.payload as MemoryNotification);
                break;

            case 'pong':
                this.handlePong();
                break;

            case 'error':
                this.emit('error', message.payload as MemorAIError);
                break;

            case 'subscribed':
                this.emit('subscribed', message.payload);
                break;

            case 'unsubscribed':
                this.emit('unsubscribed', message.payload);
                break;

            default:
                console.warn('Unknown WebSocket message type:', message.type);
        }
    }

    /**
     * Start heartbeat to keep connection alive
     */
    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                const pingMessage: WebSocketMessage = {
                    type: 'ping',
                    payload: null,
                    timestamp: Date.now()
                };
                this.send(pingMessage);

                // Set timeout for pong response
                this.heartbeatTimeout = setTimeout(() => {
                    if (this.isConnected) {
                        this.ws?.close(1006, 'Heartbeat timeout');
                    }
                }, 5000);
            }
        }, 30000); // Send ping every 30 seconds
    }

    /**
     * Stop heartbeat
     */
    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    /**
     * Handle pong response from server
     */
    private handlePong(): void {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    /**
     * Attempt to reconnect with exponential backoff
     */
    private attemptReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.emit('error', {
                code: 'WEBSOCKET_MAX_RECONNECT_ATTEMPTS',
                message: 'Maximum reconnection attempts reached',
                details: { attempts: this.reconnectAttempts },
                timestamp: new Date()
            } as MemorAIError);
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        setTimeout(async () => {
            try {
                await this.connect();
            } catch (error) {
                // Will trigger another reconnect attempt
            }
        }, delay);
    }

    /**
     * Get connection status
     */
    isConnectedToServer(): boolean {
        return this.isConnected;
    }

    /**
     * Get reconnection attempts
     */
    getReconnectAttempts(): number {
        return this.reconnectAttempts;
    }
}
