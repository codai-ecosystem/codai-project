import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { randomUUID } from 'crypto';
import cluster from 'cluster';
import os from 'os';

import { getConfig } from '../../config/app';
import { databaseService } from '../database/DatabaseService';
import { translationService } from '../translation/TranslationService';

interface ServerOptions {
    port?: number;
    host?: string;
    enableClustering?: boolean;
    corsOrigins?: string[];
}

interface ClientSession {
    id: string;
    userId: string;
    deviceId: string;
    deviceType: 'android' | 'windows' | 'web';
    language: string;
    connectedAt: Date;
    lastActivity: Date;
    socket?: Socket;
}

interface ApiRequest extends Request {
    session?: ClientSession;
    rateLimitInfo?: {
        limit: number;
        remaining: number;
        reset: Date;
    };
}

interface ApiError {
    code: string;
    message: string;
    details?: any;
}

export class ServerService {
    private app: express.Application;
    private server: any;
    private io: SocketIOServer;
    private config: any;
    private sessions: Map<string, ClientSession> = new Map();
    private isRunning = false;

    constructor(options: ServerOptions = {}) {
        this.config = getConfig();
        this.app = express();
        this.server = createServer(this.app);
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: options.corsOrigins || ["http://localhost:4400", "http://localhost:4001"],
                methods: ["GET", "POST", "PUT", "DELETE"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.setupErrorHandling();
    }

    private setupMiddleware(): void {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: false, // Allow Electron to work
            crossOriginEmbedderPolicy: false
        }));

        // CORS
        this.app.use(cors({
            origin: (origin, callback) => {
                // Allow Electron and localhost origins
                if (!origin || origin.startsWith('http://localhost') || origin === 'app://metu') {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                this.sendError(res as any, {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many requests, please slow down'
                }, 429);
            }
        });
        this.app.use('/api/', limiter as any);

        // Body parsing and compression
        this.app.use(compression() as any);
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req: ApiRequest, res: Response, next: NextFunction) => {
            const start = Date.now();

            res.on('finish', () => {
                const duration = Date.now() - start;
                console.log(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
            });

            next();
        });

        // Session middleware
        this.app.use('/api', this.sessionMiddleware.bind(this));
    }

    private setupRoutes(): void {
        // Health check
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                sessions: this.sessions.size
            });
        });

        // API Routes
        this.setupUserRoutes();
        this.setupConversationRoutes();
        this.setupAssistantRoutes();
        this.setupVoiceRoutes();
        this.setupSessionRoutes();

        // 404 handler
        this.app.use((req: Request, res: Response) => {
            this.sendError(res, {
                code: 'NOT_FOUND',
                message: `Route ${req.method} ${req.url} not found`
            }, 404);
        });
    }

    private setupUserRoutes(): void {
        const router = express.Router();

        // Get user settings
        router.get('/settings', async (req: ApiRequest, res: Response) => {
            try {
                const userId = req.session?.userId || 'default-user';
                const settings = await databaseService.getUserSettings(userId);

                if (!settings) {
                    return this.sendError(res, {
                        code: 'SETTINGS_NOT_FOUND',
                        message: 'User settings not found'
                    }, 404);
                }

                this.sendSuccess(res, settings);
            } catch (error) {
                this.sendError(res, {
                    code: 'SETTINGS_FETCH_ERROR',
                    message: 'Failed to fetch user settings',
                    details: error
                });
            }
        });

        // Update user settings
        router.put('/settings', async (req: ApiRequest, res: Response) => {
            try {
                const userId = req.session?.userId || 'default-user';
                const updates = { ...req.body, id: userId };

                const settings = await databaseService.updateUserSettings(userId, updates);        // Broadcast settings update to connected clients
                this.broadcastToUser(userId, 'settings:updated', settings);

                this.sendSuccess(res, settings);
            } catch (error) {
                this.sendError(res, {
                    code: 'SETTINGS_UPDATE_ERROR',
                    message: 'Failed to update user settings',
                    details: error
                });
            }
        });

        this.app.use('/api/user', router);
    }

    private setupConversationRoutes(): void {
        const router = express.Router();

        // Create new conversation
        router.post('/', async (req: ApiRequest, res: Response) => {
            try {
                const userId = req.session?.userId || 'default-user';
                const language = req.body.language || req.session?.language || 'en';

                const conversation = await databaseService.createConversation(userId);
                this.sendSuccess(res, conversation, 201);
            } catch (error) {
                this.sendError(res, {
                    code: 'CONVERSATION_CREATE_ERROR',
                    message: 'Failed to create conversation',
                    details: error
                });
            }
        });

        // Get conversation by ID
        router.get('/:id', async (req: ApiRequest, res: Response) => {
            try {
                const conversation = await databaseService.getConversation(req.params.id);

                if (!conversation) {
                    return this.sendError(res, {
                        code: 'CONVERSATION_NOT_FOUND',
                        message: 'Conversation not found'
                    }, 404);
                }

                this.sendSuccess(res, conversation);
            } catch (error) {
                this.sendError(res, {
                    code: 'CONVERSATION_FETCH_ERROR',
                    message: 'Failed to fetch conversation',
                    details: error
                });
            }
        });

        // Get conversation messages
        router.get('/:id/messages', async (req: ApiRequest, res: Response) => {
            try {
                const messages = await databaseService.getConversationMessages(req.params.id);
                this.sendSuccess(res, messages);
            } catch (error) {
                this.sendError(res, {
                    code: 'MESSAGES_FETCH_ERROR',
                    message: 'Failed to fetch messages',
                    details: error
                });
            }
        });

        // Add message to conversation
        router.post('/:id/messages', async (req: ApiRequest, res: Response) => {
            try {
                const messageData = {
                    conversationId: req.params.id,
                    ...req.body
                };

                const message = await databaseService.addMessage(messageData);

                // Broadcast message to connected clients
                this.broadcastToConversation(req.params.id, 'message:new', message);

                this.sendSuccess(res, message, 201);
            } catch (error) {
                this.sendError(res, {
                    code: 'MESSAGE_CREATE_ERROR',
                    message: 'Failed to create message',
                    details: error
                });
            }
        });

        // Get recent conversations
        router.get('/', async (req: ApiRequest, res: Response) => {
            try {
                const userId = req.session?.userId || 'default-user';
                const limit = parseInt(req.query.limit as string) || 10;

                const conversations = await databaseService.getConversations(userId, limit);
                this.sendSuccess(res, conversations);
            } catch (error) {
                this.sendError(res, {
                    code: 'CONVERSATIONS_FETCH_ERROR',
                    message: 'Failed to fetch conversations',
                    details: error
                });
            }
        });

        // End conversation
        router.put('/:id/end', async (req: ApiRequest, res: Response) => {
            try {
                await databaseService.deleteConversation(req.params.id);

                // Broadcast conversation end to connected clients
                this.broadcastToConversation(req.params.id, 'conversation:ended', { id: req.params.id }); this.sendSuccess(res, { message: 'Conversation ended successfully' });
            } catch (error) {
                this.sendError(res, {
                    code: 'CONVERSATION_END_ERROR',
                    message: 'Failed to end conversation',
                    details: error
                });
            }
        });

        this.app.use('/api/conversations', router);
    }

    private setupAssistantRoutes(): void {
        const router = express.Router();

        // Get assistant configuration
        router.get('/config', async (req: ApiRequest, res: Response) => {
            try {
                const userId = req.session?.userId || 'default-user';
                const config = await databaseService.getAssistantConfig(userId);

                if (!config) {
                    return this.sendError(res, {
                        code: 'CONFIG_NOT_FOUND',
                        message: 'Assistant configuration not found'
                    }, 404);
                }

                this.sendSuccess(res, config);
            } catch (error) {
                this.sendError(res, {
                    code: 'CONFIG_FETCH_ERROR',
                    message: 'Failed to fetch assistant configuration',
                    details: error
                });
            }
        });

        // Update assistant configuration
        router.put('/config', async (req: ApiRequest, res: Response) => {
            try {
                const userId = req.session?.userId || 'default-user';
                const updates = { ...req.body, userId };

                const config = await databaseService.saveAssistantConfig(updates);

                // Broadcast config update to connected clients
                this.broadcastToUser(userId, 'assistant:config:updated', config); this.sendSuccess(res, config);
            } catch (error) {
                this.sendError(res, {
                    code: 'CONFIG_UPDATE_ERROR',
                    message: 'Failed to update assistant configuration',
                    details: error
                });
            }
        });

        this.app.use('/api/assistant', router);
    }

    private setupVoiceRoutes(): void {
        const router = express.Router();

        // Get voice profile
        router.get('/profile/:name', async (req: ApiRequest, res: Response) => {
            try {
                const userId = req.session?.userId || 'default-user';
                const profiles = await databaseService.getVoiceProfiles(userId, req.params.name);
                const profile = profiles.length > 0 ? profiles[0] : null;

                if (!profile) {
                    return this.sendError(res, {
                        code: 'VOICE_PROFILE_NOT_FOUND',
                        message: 'Voice profile not found'
                    }, 404);
                }

                this.sendSuccess(res, profile);
            } catch (error) {
                this.sendError(res, {
                    code: 'VOICE_PROFILE_FETCH_ERROR',
                    message: 'Failed to fetch voice profile',
                    details: error
                });
            }
        });

        // Create voice profile
        router.post('/profile', async (req: ApiRequest, res: Response) => {
            try {
                const userId = req.session?.userId || 'default-user';
                const profileData = { ...req.body, userId };

                const profile = await databaseService.createVoiceProfile(profileData);
                this.sendSuccess(res, profile, 201);
            } catch (error) {
                this.sendError(res, {
                    code: 'VOICE_PROFILE_CREATE_ERROR',
                    message: 'Failed to create voice profile',
                    details: error
                });
            }
        });

        this.app.use('/api/voice', router);
    }

    private setupSessionRoutes(): void {
        const router = express.Router();

        // Get active sessions
        router.get('/', (req: ApiRequest, res: Response) => {
            const sessions = Array.from(this.sessions.values()).map(session => ({
                id: session.id,
                userId: session.userId,
                deviceId: session.deviceId,
                deviceType: session.deviceType,
                language: session.language,
                connectedAt: session.connectedAt,
                lastActivity: session.lastActivity
            }));

            this.sendSuccess(res, sessions);
        });

        // End session
        router.delete('/:id', async (req: ApiRequest, res: Response) => {
            try {
                const sessionId = req.params.id;
                const session = this.sessions.get(sessionId);

                if (session) {
                    await databaseService.endServerSession(sessionId);
                    this.sessions.delete(sessionId);

                    if (session.socket) {
                        session.socket.disconnect();
                    }
                }

                this.sendSuccess(res, { message: 'Session ended successfully' });
            } catch (error) {
                this.sendError(res, {
                    code: 'SESSION_END_ERROR',
                    message: 'Failed to end session',
                    details: error
                });
            }
        });

        this.app.use('/api/sessions', router);
    }

    private setupWebSocket(): void {
        this.io.on('connection', (socket: Socket) => {
            console.log(`WebSocket client connected: ${socket.id}`);

            socket.on('session:register', async (data: {
                userId: string;
                deviceId: string;
                deviceType: 'android' | 'windows' | 'web';
                language?: string;
            }) => {
                try {
                    const session: ClientSession = {
                        id: socket.id,
                        userId: data.userId || 'default-user',
                        deviceId: data.deviceId || randomUUID(),
                        deviceType: data.deviceType || 'web',
                        language: data.language || 'en',
                        connectedAt: new Date(),
                        lastActivity: new Date(),
                        socket
                    };

                    this.sessions.set(socket.id, session);

                    // Create database session
                    const mappedDeviceType = session.deviceType === 'android' ? 'mobile' :
                        session.deviceType === 'windows' ? 'desktop' :
                            session.deviceType as 'desktop' | 'mobile' | 'web';

                    await databaseService.createServerSession({
                        id: socket.id,
                        userId: session.userId,
                        deviceId: session.deviceId,
                        deviceType: mappedDeviceType,
                        deviceInfo: {},
                        ipAddress: socket.request.socket.remoteAddress || 'unknown',
                        userAgent: socket.request.headers['user-agent'] || 'unknown',
                        startTime: new Date(),
                        lastActivity: new Date(),
                        isActive: true,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                    });

                    socket.emit('session:registered', session);
                    console.log(`Session registered: ${session.userId}@${session.deviceType}`);
                } catch (error) {
                    socket.emit('error', {
                        code: 'SESSION_REGISTER_ERROR',
                        message: 'Failed to register session',
                        details: error
                    });
                }
            });

            socket.on('ping', () => {
                const session = this.sessions.get(socket.id);
                if (session) {
                    session.lastActivity = new Date();
                    socket.emit('pong');
                }
            });

            socket.on('disconnect', async () => {
                const session = this.sessions.get(socket.id);
                if (session) {
                    await databaseService.endServerSession(session.id);
                    this.sessions.delete(socket.id);
                    console.log(`Session disconnected: ${session.userId}@${session.deviceType}`);
                }
            });

            // Voice-related events
            socket.on('voice:start', (data) => {
                socket.broadcast.emit('voice:started', data);
            });

            socket.on('voice:stop', (data) => {
                socket.broadcast.emit('voice:stopped', data);
            });

            socket.on('voice:data', (data) => {
                socket.broadcast.emit('voice:data', data);
            });
        });
    }

    private setupErrorHandling(): void {
        this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
            console.error('Server error:', error);

            this.sendError(res, {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An internal server error occurred',
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            }, 500);
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception thrown:', error);
            process.exit(1);
        });
    }

    private sessionMiddleware(req: ApiRequest, res: Response, next: NextFunction): void {
        const sessionId = req.headers['x-session-id'] as string;

        if (sessionId && this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId)!;
            session.lastActivity = new Date();
            req.session = session;
        }

        next();
    }

    private sendSuccess(res: Response, data: any, status: number = 200): void {
        res.status(status).json({
            success: true,
            data,
            timestamp: new Date().toISOString()
        });
    }

    private sendError(res: Response, error: ApiError, status: number = 500): void {
        res.status(status).json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details
            },
            timestamp: new Date().toISOString()
        });
    }

    private broadcastToUser(userId: string, event: string, data: any): void {
        for (const session of this.sessions.values()) {
            if (session.userId === userId && session.socket) {
                session.socket.emit(event, data);
            }
        }
    }

    private broadcastToConversation(conversationId: string, event: string, data: any): void {
        // For now, broadcast to all sessions - in a real implementation,
        // you might want to track which sessions are in which conversations
        this.io.emit(event, data);
    }

    async start(port?: number): Promise<void> {
        if (this.isRunning) {
            console.log('Server is already running');
            return;
        }

        const serverPort = port || this.config.server.port;
        const serverHost = this.config.server.host;

        // Initialize database
        await databaseService.initialize();

        return new Promise((resolve, reject) => {
            this.server.listen(serverPort, serverHost, () => {
                this.isRunning = true;
                console.log(`METU Server running on http://${serverHost}:${serverPort}`);
                console.log(`WebSocket server ready for connections`);
                resolve();
            });

            this.server.on('error', (error: Error) => {
                reject(error);
            });
        });
    }

    async stop(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        return new Promise((resolve) => {
            // Close all socket connections
            for (const session of this.sessions.values()) {
                if (session.socket) {
                    session.socket.disconnect();
                }
            }
            this.sessions.clear();

            // Close server
            this.server.close(() => {
                this.isRunning = false;
                console.log('METU Server stopped');
                resolve();
            });
        });
    }

    getConnectedSessions(): ClientSession[] {
        return Array.from(this.sessions.values());
    }

    isSessionActive(sessionId: string): boolean {
        return this.sessions.has(sessionId);
    }

    getSessionCount(): number {
        return this.sessions.size;
    }
}

// Clustering support
export function startServerWithClustering(options: ServerOptions = {}): void {
    const numCPUs = os.cpus().length;

    if (options.enableClustering && cluster.isPrimary) {
        console.log(`Master ${process.pid} is running`);

        // Fork workers
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
            cluster.fork();
        });
    } else {
        // Worker process
        const server = new ServerService(options);
        server.start().catch(console.error);
    }
}

export default ServerService;
