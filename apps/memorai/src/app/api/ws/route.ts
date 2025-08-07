/**
 * MemorAI WebSocket API Route
 * Handles real-time communication for memory updates and collaborative features
 */

import { NextRequest } from 'next/server';
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

interface ExtendedWebSocket extends WebSocket {
    userId?: string;
    isAlive?: boolean;
}

interface WebSocketMessage {
    type: 'memory_created' | 'memory_updated' | 'memory_deleted' | 'search_results' | 'user_activity' | 'ping' | 'pong';
    data?: any;
    userId?: string;
    timestamp: string;
}

class MemorAIWebSocketServer {
    private wss: WebSocketServer | null = null;
    private clients: Set<ExtendedWebSocket> = new Set();
    private pingInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.initializeServer();
    }

    private initializeServer() {
        if (typeof global !== 'undefined' && !global.memoraiWebSocketServer) {
            console.log('🚀 Initializing MemorAI WebSocket Server');

            // Use a unique port to avoid conflicts - default to 4087
            const wsPort = parseInt(process.env.MEMORAI_WS_PORT || '4087');

            try {
                this.wss = new WebSocketServer({
                    port: wsPort,
                    perMessageDeflate: false,
                    clientTracking: true
                });

                this.wss.on('connection', (ws: ExtendedWebSocket, request: IncomingMessage) => {
                    this.handleConnection(ws, request);
                });

                this.wss.on('error', (error: Error) => {
                    console.error(`❌ WebSocket Server Error on port ${wsPort}:`, error.message);
                    // Don't crash the build process, just log the error
                });

                this.startPingInterval();
                global.memoraiWebSocketServer = this;

                console.log(`✅ MemorAI WebSocket Server running on port ${wsPort}`);
            } catch (error: any) {
                console.warn(`⚠️ Could not start WebSocket server on port ${wsPort}: ${error.message}`);
                console.log('🔄 WebSocket functionality will be limited during build process');
                // Don't set global instance if server failed to start
                return null;
            }
        } else if (global.memoraiWebSocketServer) {
            return global.memoraiWebSocketServer;
        }
    }

    private handleConnection(ws: ExtendedWebSocket, request: IncomingMessage) {
        // Extract userId from query parameters
        const parsedUrl = parse(request.url || '', true);
        const userId = parsedUrl.query.userId as string;

        ws.userId = userId;
        ws.isAlive = true;
        this.clients.add(ws);

        console.log(`🔌 New WebSocket connection: ${userId || 'anonymous'} (${this.clients.size} total)`);

        // Handle incoming messages
        ws.on('message', (data: Buffer) => {
            try {
                const message: WebSocketMessage = JSON.parse(data.toString());
                this.handleMessage(ws, message);
            } catch (error) {
                console.error('❌ Error parsing WebSocket message:', error);
            }
        });

        // Handle pong responses
        ws.on('pong', () => {
            ws.isAlive = true;
        });

        // Handle connection close
        ws.on('close', () => {
            console.log(`🔌 WebSocket disconnected: ${ws.userId || 'anonymous'}`);
            this.clients.delete(ws);
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error('❌ WebSocket error:', error);
            this.clients.delete(ws);
        });

        // Send welcome message
        this.sendToClient(ws, {
            type: 'user_activity',
            data: {
                message: 'Connected to MemorAI real-time updates',
                clientsConnected: this.clients.size
            },
            timestamp: new Date().toISOString()
        });
    }

    private handleMessage(ws: ExtendedWebSocket, message: WebSocketMessage) {
        switch (message.type) {
            case 'ping':
                this.sendToClient(ws, {
                    type: 'pong',
                    timestamp: new Date().toISOString()
                });
                break;

            case 'memory_created':
            case 'memory_updated':
            case 'memory_deleted':
                // Broadcast memory changes to all clients except sender
                this.broadcastToOthers(ws, message);
                break;

            case 'search_results':
                // Handle real-time search - for now, just echo back
                // In production, this would trigger actual search and return results
                setTimeout(() => {
                    this.sendToClient(ws, {
                        type: 'search_results',
                        data: {
                            query: message.data?.query,
                            results: [],
                            message: 'Real-time search functionality ready'
                        },
                        timestamp: new Date().toISOString()
                    });
                }, 100);
                break;

            case 'user_activity':
                // Broadcast user activity to other users
                this.broadcastToOthers(ws, {
                    ...message,
                    userId: ws.userId
                });
                break;

            default:
                console.log(`📨 Received unknown message type: ${message.type}`);
        }
    }

    private sendToClient(ws: ExtendedWebSocket, message: WebSocketMessage) {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('❌ Error sending message to client:', error);
            }
        }
    }

    private broadcastToAll(message: WebSocketMessage) {
        this.clients.forEach(client => {
            this.sendToClient(client, message);
        });
    }

    private broadcastToOthers(sender: ExtendedWebSocket, message: WebSocketMessage) {
        this.clients.forEach(client => {
            if (client !== sender) {
                this.sendToClient(client, message);
            }
        });
    }

    private startPingInterval() {
        this.pingInterval = setInterval(() => {
            this.clients.forEach(ws => {
                if (ws.isAlive === false) {
                    console.log(`🔌 Terminating inactive WebSocket: ${ws.userId || 'anonymous'}`);
                    ws.terminate();
                    this.clients.delete(ws);
                    return;
                }

                ws.isAlive = false;
                ws.ping();
            });
        }, 30000); // Ping every 30 seconds
    }

    // Public methods for triggering events from API routes
    public broadcastMemoryCreated(memory: any, userId?: string) {
        this.broadcastToAll({
            type: 'memory_created',
            data: memory,
            userId,
            timestamp: new Date().toISOString()
        });
    }

    public broadcastMemoryUpdated(memory: any, userId?: string) {
        this.broadcastToAll({
            type: 'memory_updated',
            data: memory,
            userId,
            timestamp: new Date().toISOString()
        });
    }

    public broadcastMemoryDeleted(memoryId: string, userId?: string) {
        this.broadcastToAll({
            type: 'memory_deleted',
            data: memoryId,
            userId,
            timestamp: new Date().toISOString()
        });
    }

    public getConnectedClients(): number {
        return this.clients.size;
    }

    public cleanup() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }

        this.clients.forEach(client => {
            client.close();
        });

        if (this.wss) {
            this.wss.close();
        }
    }
}

// Global instance
declare global {
    var memoraiWebSocketServer: MemorAIWebSocketServer | undefined;
}

// Initialize WebSocket server
const wsServer = new MemorAIWebSocketServer();

// Export the WebSocket server instance for use in other API routes
export const getWebSocketServer = (): MemorAIWebSocketServer | null => {
    return global.memoraiWebSocketServer || null;
};

// Next.js API route handlers
export async function GET(request: NextRequest) {
    const wsPort = parseInt(process.env.MEMORAI_WS_PORT || '4087');
    const server = getWebSocketServer();

    return new Response(JSON.stringify({
        status: 'WebSocket server running',
        port: wsPort,
        connectedClients: server ? server.getConnectedClients() : 0,
        endpoints: {
            websocket: `ws://localhost:${wsPort}`,
            info: '/api/ws'
        }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data, userId } = body;

        const server = getWebSocketServer();

        if (!server) {
            return new Response(JSON.stringify({
                error: 'WebSocket server not available during build process',
                success: false
            }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        switch (type) {
            case 'memory_created':
                server.broadcastMemoryCreated(data, userId);
                break;
            case 'memory_updated':
                server.broadcastMemoryUpdated(data, userId);
                break;
            case 'memory_deleted':
                server.broadcastMemoryDeleted(data, userId);
                break;
            default:
                return new Response(JSON.stringify({ error: 'Unknown message type' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Broadcasted ${type} to ${server.getConnectedClients()} clients`
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('❌ WebSocket POST error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
