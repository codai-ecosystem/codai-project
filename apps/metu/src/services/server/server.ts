/**
 * METU Backend Server - Main Server Implementation
 * 
 * Standalone backend server that provides:
 * - REST API for METU desktop app
 * - WebSocket support for real-time communication
 * - Database management and synchronization
 * - Cross-platform communication (Desktop, Web, Mobile)
 * - Authentication and session management
 */

import express, { Application, Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { MetuServerDatabaseService } from '../database/server-database';
import { UserSettings, ConversationMessage, ConversationSession } from '../database/schema';

export interface ServerConfig {
    port: number;
    host: string;
    corsOrigins: string[];
    enableWebSocket: boolean;
    enableRateLimit: boolean;
    maxRequestsPerWindow: number;
    windowMs: number;
}

export interface ClientConnection {
    id: string;
    type: 'desktop' | 'web' | 'mobile';
    userId: string;
    deviceInfo: {
        platform: string;
        version: string;
        userAgent?: string;
    };
    connectedAt: Date;
    lastActivity: Date;
}

export class MetuBackendServer {
    private app: Application;
    private server: any;
    private io: SocketIOServer | null = null;
    private database: MetuServerDatabaseService;
    private config: ServerConfig;
    private connectedClients: Map<string, ClientConnection> = new Map();

    constructor(config: Partial<ServerConfig> = {}) {
        this.config = {
            port: 4402,
            host: 'localhost',
            corsOrigins: [
                'http://localhost:3000',  // Next.js dev
                'http://localhost:4400',  // METU web app
                'http://localhost:6388',  // Electron renderer
                'file://',                // Electron file protocol
            ],
            enableWebSocket: true,
            enableRateLimit: true,
            maxRequestsPerWindow: 100,
            windowMs: 15 * 60 * 1000, // 15 minutes
            ...config,
        };

        this.app = express();
        this.database = new MetuServerDatabaseService();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeWebSocket();
    }

    /**
     * Initialize Express middleware
     */
    private initializeMiddleware(): void {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: false, // Disable for development
            crossOriginEmbedderPolicy: false,
        }));

        // CORS configuration
        this.app.use(cors({
            origin: this.config.corsOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Type', 'X-Device-Info'],
        }));

        // Rate limiting
        if (this.config.enableRateLimit) {
            const limiter = rateLimit({
                windowMs: this.config.windowMs,
                max: this.config.maxRequestsPerWindow,
                message: 'Too many requests, please try again later.',
                standardHeaders: true,
                legacyHeaders: false,
            });
            this.app.use('/api/', limiter as any);
        }

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`📡 ${req.method} ${req.path} - ${req.ip}`);
            next();
        });
    }

    /**
     * Initialize API routes
     */
    private initializeRoutes(): void {
        // Health check
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                uptime: process.uptime(),
                connections: this.connectedClients.size,
            });
        });

        // API routes
        this.setupUserRoutes();
        this.setupConversationRoutes();
        this.setupSettingsRoutes();
        this.setupSyncRoutes();

        // 404 handler
        this.app.use('*', (req: Request, res: Response) => {
            res.status(404).json({
                error: 'Endpoint not found',
                path: req.path,
                method: req.method,
            });
        });

        // Error handler
        this.app.use((error: any, req: Request, res: Response, next: any) => {
            console.error('Server error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error.message,
                timestamp: new Date().toISOString(),
            });
        });
    }

    /**
     * User management routes
     */
    private setupUserRoutes(): void {
        const router = express.Router();

        // Get user settings
        router.get('/users/:userId/settings', (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const settings = this.database.getUserSettings(userId);

                if (!settings) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.json(settings);
            } catch (error) {
                console.error('Get user settings error:', error);
                res.status(500).json({ error: 'Failed to get user settings' });
            }
        });

        // Update user settings
        router.put('/users/:userId/settings', (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const updates = req.body;

                const success = this.database.updateUserSettings(userId, updates);

                if (!success) {
                    return res.status(400).json({ error: 'Failed to update settings' });
                }

                const updatedSettings = this.database.getUserSettings(userId);

                // Broadcast settings update to connected clients
                this.broadcastToUserClients(userId, 'settingsUpdated', updatedSettings);

                res.json(updatedSettings);
            } catch (error) {
                console.error('Update user settings error:', error);
                res.status(500).json({ error: 'Failed to update user settings' });
            }
        });

        // Export user data
        router.get('/users/:userId/export', (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const userData = this.database.exportUserData(userId);

                if (!userData) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="metu-data-${userId}.json"`);
                res.json(userData);
            } catch (error) {
                console.error('Export user data error:', error);
                res.status(500).json({ error: 'Failed to export user data' });
            }
        });

        this.app.use('/api', router);
    }

    /**
     * Conversation management routes
     */
    private setupConversationRoutes(): void {
        const router = express.Router();

        // Get user conversations
        router.get('/users/:userId/conversations', (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const conversations = this.database.getUserConversations(userId);
                res.json(conversations);
            } catch (error) {
                console.error('Get conversations error:', error);
                res.status(500).json({ error: 'Failed to get conversations' });
            }
        });

        // Get conversation messages
        router.get('/conversations/:conversationId/messages', (req: Request, res: Response) => {
            try {
                const { conversationId } = req.params;
                const messages = this.database.getConversationMessages(conversationId);
                res.json(messages);
            } catch (error) {
                console.error('Get messages error:', error);
                res.status(500).json({ error: 'Failed to get messages' });
            }
        });

        // Save new message
        router.post('/conversations/:conversationId/messages', (req: Request, res: Response) => {
            try {
                const { conversationId } = req.params;
                const messageData = req.body;

                const message: ConversationMessage = {
                    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    conversationId,
                    ...messageData,
                    timestamp: new Date(),
                };

                const success = this.database.saveMessage(message);

                if (!success) {
                    return res.status(400).json({ error: 'Failed to save message' });
                }

                // Broadcast new message to connected clients
                this.broadcastToConversationClients(conversationId, 'newMessage', message);

                res.status(201).json(message);
            } catch (error) {
                console.error('Save message error:', error);
                res.status(500).json({ error: 'Failed to save message' });
            }
        });

        this.app.use('/api', router);
    }

    /**
     * Settings synchronization routes
     */
    private setupSettingsRoutes(): void {
        const router = express.Router();

        // Sync settings across devices
        router.post('/sync/settings/:userId', (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const { deviceId, settings } = req.body;

                // Update settings
                const success = this.database.updateUserSettings(userId, settings);

                if (!success) {
                    return res.status(400).json({ error: 'Failed to sync settings' });
                }

                // Broadcast to other devices (exclude sender)
                this.broadcastToUserClients(userId, 'settingsSync', settings, deviceId);

                res.json({ success: true, timestamp: new Date().toISOString() });
            } catch (error) {
                console.error('Sync settings error:', error);
                res.status(500).json({ error: 'Failed to sync settings' });
            }
        });

        this.app.use('/api', router);
    }

    /**
     * Real-time synchronization routes
     */
    private setupSyncRoutes(): void {
        const router = express.Router();

        // Get server statistics
        router.get('/sync/stats', (req: Request, res: Response) => {
            res.json({
                connectedClients: this.connectedClients.size,
                databaseStats: this.database.getDatabaseStats(),
                serverUptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
            });
        });

        this.app.use('/api', router);
    }

    /**
     * Initialize WebSocket server
     */
    private initializeWebSocket(): void {
        if (!this.config.enableWebSocket) return;

        this.server = createServer(this.app);
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: this.config.corsOrigins,
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        this.io.on('connection', (socket) => {
            console.log(`🔌 WebSocket client connected: ${socket.id}`);

            // Handle client registration
            socket.on('register', (data: { userId: string; clientType: string; deviceInfo: any }) => {
                const connection: ClientConnection = {
                    id: socket.id,
                    type: data.clientType as 'desktop' | 'web' | 'mobile',
                    userId: data.userId,
                    deviceInfo: data.deviceInfo,
                    connectedAt: new Date(),
                    lastActivity: new Date(),
                };

                this.connectedClients.set(socket.id, connection);
                socket.join(`user_${data.userId}`);

                console.log(`👤 Client registered: ${data.clientType} for user ${data.userId}`);
            });

            // Handle client disconnection
            socket.on('disconnect', () => {
                const connection = this.connectedClients.get(socket.id);
                if (connection) {
                    console.log(`🔌 Client disconnected: ${connection.type} for user ${connection.userId}`);
                    this.connectedClients.delete(socket.id);
                }
            });

            // Handle activity updates
            socket.on('activity', () => {
                const connection = this.connectedClients.get(socket.id);
                if (connection) {
                    connection.lastActivity = new Date();
                }
            });
        });
    }

    /**
     * Broadcast message to all clients of a specific user
     */
    private broadcastToUserClients(userId: string, event: string, data: any, excludeDeviceId?: string): void {
        if (!this.io) return;

        this.io.to(`user_${userId}`).emit(event, data);
    }

    /**
     * Broadcast message to clients in a conversation
     */
    private broadcastToConversationClients(conversationId: string, event: string, data: any): void {
        if (!this.io) return;

        this.io.to(`conversation_${conversationId}`).emit(event, data);
    }

    /**
     * Start the server
     */
    public async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const server = this.config.enableWebSocket ? this.server : this.app;

                server.listen(this.config.port, this.config.host, () => {
                    console.log(`🚀 METU Backend Server started successfully!`);
                    console.log(`📡 HTTP Server: http://${this.config.host}:${this.config.port}`);

                    if (this.config.enableWebSocket) {
                        console.log(`🔌 WebSocket Server: ws://${this.config.host}:${this.config.port}`);
                    }

                    console.log(`🗄️ Database: LocalStorage-based (CND integration planned)`);
                    console.log(`🌐 CORS Origins: ${this.config.corsOrigins.join(', ')}`);

                    resolve();
                });
            } catch (error) {
                console.error('Failed to start server:', error);
                reject(error);
            }
        });
    }

    /**
     * Stop the server
     */
    public async stop(): Promise<void> {
        return new Promise((resolve) => {
            if (this.io) {
                this.io.close();
            }

            const server = this.config.enableWebSocket ? this.server : this.app;
            if (server && server.close) {
                server.close(() => {
                    console.log('🛑 METU Backend Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// Export server instance factory
export const createMetuServer = (config?: Partial<ServerConfig>): MetuBackendServer => {
    return new MetuBackendServer(config);
};
