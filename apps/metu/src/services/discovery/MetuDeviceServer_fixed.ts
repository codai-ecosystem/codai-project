/**
 * METU Device Server
 * 
 * A discoverable device server that can be controlled by multiple client applications.
 * Implements Bonjour/mDNS service discovery and provides comprehensive device control
 * capabilities through various communication protocols.
 */

import express, { Express, Request, Response } from 'express';
import { createServer, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import bonjourService, { Service } from 'bonjour-service';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { hostname } from 'os';
import { AzureRealtimeClient, RealtimeConfig } from '../audio/AzureRealtimeClient';
import { audioDeviceManager } from '../audio/AudioDeviceManager';
import { metuGlassMCPController, DeviceAutomationRequest } from '../mcp/MetuGlassMCPController';
import { MetuCBDClient, MetuDevice, MetuConversation, MetuMessage } from '../database/MetuCBDClient';

export interface DeviceServerConfig {
    port: number;
    host: string;
    serviceName: string;
    serviceType: string;
    domain?: string;
    corsOrigins: string[];
    enableRateLimit: boolean;
    maxRequestsPerWindow: number;
    windowMs: number;
    azure: {
        apiKey: string;
        endpoint: string;
        deployment?: string;
        apiVersion?: string;
        voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
    };
}

export interface ClientConnection {
    id: string;
    ws: WebSocket;
    metadata: {
        userAgent?: string;
        clientType?: 'web' | 'mobile' | 'desktop';
        capabilities?: string[];
        connectedAt: Date;
        lastActivity: Date;
    };
}

export interface DeviceCapabilities {
    audio: {
        input: boolean;
        output: boolean;
        realtime: boolean;
        formats: string[];
    };
    automation: {
        windowControl: boolean;
        screenCapture: boolean;
        fileSystem: boolean;
        systemCommands: boolean;
    };
    ai: {
        voiceAssistant: boolean;
        textProcessing: boolean;
        imageAnalysis: boolean;
        automation: boolean;
    };
    networking: {
        discovery: boolean;
        remoteControl: boolean;
        fileSharing: boolean;
        streaming: boolean;
    };
}

export class MetuDeviceServer extends EventEmitter {
    private app: Express;
    private server: Server;
    private wsServer: WebSocketServer;
    private bonjourService: any;
    private publishedService: Service | null = null;
    private clients: Map<string, ClientConnection> = new Map();
    private azureClient: AzureRealtimeClient | null = null;
    private metuCBDClient: MetuCBDClient;
    private isRunning = false;
    private config: DeviceServerConfig;
    private capabilities: DeviceCapabilities;

constructor(config: DeviceServerConfig) {
    super();
    this.config = config;
    this.app = express();
    this.server = createServer(this.app);
    this.wsServer = new WebSocketServer({ server: this.server });
    this.bonjourService = new (bonjourService as any).Bonjour();

    // Initialize MetuCBDClient
    this.metuCBDClient = new MetuCBDClient({
        url: 'http://localhost:4180',
        name: 'METU-Device-Server',
        enableCache: true,
        enableEvents: true
    });

    this.capabilities = {
        audio: {
            input: true,
            output: true,
            realtime: true,
            formats: ['pcm16', 'mp3', 'ogg']
        },
        automation: {
            windowControl: true,
            screenCapture: true,
            fileSystem: false, // Security: disabled by default
            systemCommands: false // Security: disabled by default
        },
        ai: {
            voiceAssistant: true,
            textProcessing: true,
            imageAnalysis: false,
            automation: true
        },
        networking: {
            discovery: true,
            remoteControl: true,
            fileSharing: false, // Security: disabled by default
            streaming: true
        }
    };

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocketHandlers();
}

    /**
     * Setup Express middleware
     */
    private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", "ws:", "wss:"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"]
            }
        }
    }));

    // CORS configuration
    this.app.use(cors({
        origin: (origin, callback) => {
            if (!origin || this.config.corsOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    }));

    // Rate limiting
    if(this.config.enableRateLimit) {
    const limiter = rateLimit({
        windowMs: this.config.windowMs,
        max: this.config.maxRequestsPerWindow,
        message: {
            error: 'Too many requests from this IP'
        }
    });
    this.app.use(limiter as any);
}

// JSON parsing
this.app.use(express.json({ limit: '10mb' }));
this.app.use(express.urlencoded({ extended: true }));
    }

    /**
     * Setup REST API routes
     */
    private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '2.0.0',
            capabilities: this.capabilities,
            clients: this.clients.size
        });
    });

    // Device info
    this.app.get('/api/device/info', (req: Request, res: Response) => {
        res.json({
            id: this.generateDeviceId(),
            name: this.config.serviceName,
            type: 'metu-ai-assistant',
            capabilities: this.capabilities,
            status: {
                isRunning: this.isRunning,
                connectedClients: this.clients.size,
                audioDevices: audioDeviceManager.getDeviceStatus(),
                azureConnection: this.azureClient?.getStatus() || null
            },
            network: {
                host: this.config.host,
                port: this.config.port,
                serviceType: this.config.serviceType
            }
        });
    });

    // Audio devices
    this.app.get('/api/audio/devices', async (req: Request, res: Response) => {
        try {
            const inputDevices = await audioDeviceManager.getInputDevices();
            const outputDevices = await audioDeviceManager.getOutputDevices();

            res.json({
                input: inputDevices,
                output: outputDevices,
                status: audioDeviceManager.getDeviceStatus()
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get audio devices' });
        }
    });

    // Set audio device
    this.app.post('/api/audio/devices/select', async (req: Request, res: Response) => {
        try {
            const { type, deviceId, constraints } = req.body;

            let success = false;
            if (type === 'input') {
                success = await audioDeviceManager.setInputDevice(deviceId, constraints);
            } else if (type === 'output') {
                success = await audioDeviceManager.setOutputDevice(deviceId);
            } else {
                return res.status(400).json({ error: 'Invalid device type' });
            }

            if (success) {
                res.json({ success: true, selectedDevice: deviceId });
            } else {
                res.status(500).json({ error: 'Failed to select device' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to select audio device' });
        }
    });

    // Voice command
    this.app.post('/api/voice/command', async (req: Request, res: Response) => {
        try {
            const { text, language = 'en-US' } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            // Process voice command
            const result = await this.processVoiceCommand(text, language);

            res.json({
                success: true,
                command: text,
                result: result
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to process voice command' });
        }
    });

    // Start/stop voice session
    this.app.post('/api/voice/session/:action', async (req: Request, res: Response) => {
        try {
            const { action } = req.params;

            if (action === 'start') {
                await this.startVoiceSession();
                res.json({ success: true, session: 'started' });
            } else if (action === 'stop') {
                await this.stopVoiceSession();
                res.json({ success: true, session: 'stopped' });
            } else {
                res.status(400).json({ error: 'Invalid action' });
            }
        } catch (error) {
            res.status(500).json({ error: `Failed to ${req.params.action} voice session` });
        }
    });

    // Connected clients
    this.app.get('/api/clients', (req: Request, res: Response) => {
        const clientInfo = Array.from(this.clients.values()).map(client => ({
            id: client.id,
            metadata: client.metadata,
            isConnected: client.ws.readyState === WebSocket.OPEN
        }));

        res.json({ clients: clientInfo, total: this.clients.size });
    });

    // Glass MCP Automation Endpoints
    this.setupGlassMCPEndpoints();

    // CBD Database Endpoints
    this.setupCBDDatabaseEndpoints();

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
        res.status(404).json({ error: 'Endpoint not found' });
    });
}

    /**
     * Setup WebSocket handlers
     */
    private setupWebSocketHandlers(): void {
    this.wsServer.on('connection', (ws: WebSocket, request) => {
        const clientId = uuidv4();
        const client: ClientConnection = {
            id: clientId,
            ws: ws,
            metadata: {
                userAgent: request.headers['user-agent'],
                clientType: this.detectClientType(request.headers['user-agent'] || ''),
                capabilities: [],
                connectedAt: new Date(),
                lastActivity: new Date()
            }
        };

        this.clients.set(clientId, client);

        console.log(`📱 Client connected: ${clientId} (${client.metadata.clientType})`);
        this.emit('client-connected', client);

        // Send welcome message
        this.sendToClient(clientId, {
            type: 'connection-established',
            clientId: clientId,
            serverInfo: {
                name: this.config.serviceName,
                capabilities: this.capabilities,
                version: '2.0.0'
            }
        });

        // Handle messages
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                await this.handleClientMessage(clientId, message);
            } catch (error) {
                console.error(`❌ Error handling message from ${clientId}:`, error);
                this.sendToClient(clientId, {
                    type: 'error',
                    error: 'Invalid message format'
                });
            }
        });

        // Handle disconnect
        ws.on('close', () => {
            this.clients.delete(clientId);
            console.log(`📱 Client disconnected: ${clientId}`);
            this.emit('client-disconnected', clientId);
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error(`❌ WebSocket error for client ${clientId}:`, error);
            this.clients.delete(clientId);
        });
    });
}

    /**
     * Handle client messages
     */
    private async handleClientMessage(clientId: string, message: any): Promise < void> {
    const client = this.clients.get(clientId);
    if(!client) return;

    // Update last activity
    client.metadata.lastActivity = new Date();

    console.log(`📨 Message from ${clientId}:`, message.type);

    switch(message.type) {
            case 'voice-command':
    await this.handleVoiceCommand(clientId, message);
    break;

            case 'audio-stream':
    await this.handleAudioStream(clientId, message);
    break;

            case 'device-control':
    await this.handleDeviceControl(clientId, message);
    break;

            case 'get-status':
    await this.handleGetStatus(clientId, message);
    break;

            case 'subscribe-events':
    await this.handleSubscribeEvents(clientId, message);
    break;

            default:
    this.sendToClient(clientId, {
        type: 'error',
        error: `Unknown message type: ${message.type}`
    });
}
    }

    /**
     * Handle voice command from client
     */
    private async handleVoiceCommand(clientId: string, message: any): Promise < void> {
    try {
        const { text, language = 'en-US' } = message;

        if(!text) {
            throw new Error('Text is required');
        }

            const result = await this.processVoiceCommand(text, language);

        this.sendToClient(clientId, {
            type: 'voice-command-result',
            requestId: message.requestId,
            success: true,
            result: result
        });

    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.sendToClient(clientId, {
            type: 'voice-command-result',
            requestId: message.requestId,
            success: false,
            error: errorMessage
        });
    }
}

    /**
     * Handle audio stream from client
     */
    private async handleAudioStream(clientId: string, message: any): Promise < void> {
    try {
        const { audioData, format = 'pcm16' } = message;

        if(!audioData) {
            throw new Error('Audio data is required');
        }

            // Process audio with Azure OpenAI if available
            if(this.azureClient) {
    // Forward audio to Azure OpenAI
    // Implementation would depend on the Azure client's streaming capabilities
    console.log(`🎵 Processing audio stream from ${clientId}`);
}

this.sendToClient(clientId, {
    type: 'audio-stream-ack',
    requestId: message.requestId,
    success: true
});

        } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    this.sendToClient(clientId, {
        type: 'audio-stream-ack',
        requestId: message.requestId,
        success: false,
        error: errorMessage
    });
}
    }

    /**
     * Handle device control request
     */
    private async handleDeviceControl(clientId: string, message: any): Promise < void> {
    try {
        const { action, target, parameters } = message;

        if(!action || !target) {
    throw new Error('Action and target are required');
}

// This would integrate with Glass MCP for device control
const result = await this.executeDeviceControl(action, target, parameters);

this.sendToClient(clientId, {
    type: 'device-control-result',
    requestId: message.requestId,
    success: true,
    result: result
});

        } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    this.sendToClient(clientId, {
        type: 'device-control-result',
        requestId: message.requestId,
        success: false,
        error: errorMessage
    });
}
    }

    /**
     * Handle status request
     */
    private async handleGetStatus(clientId: string, message: any): Promise < void> {
    const status = {
        server: {
            isRunning: this.isRunning,
            uptime: process.uptime(),
            connectedClients: this.clients.size
        },
        audio: audioDeviceManager.getDeviceStatus(),
        azure: this.azureClient?.getStatus() || null,
        capabilities: this.capabilities
    };

    this.sendToClient(clientId, {
        type: 'status-response',
        requestId: message.requestId,
        status: status
    });
}

    /**
     * Setup Glass MCP automation endpoints
     */
    private setupGlassMCPEndpoints(): void {
    // Get Glass MCP status
    this.app.get('/api/mcp/status', async (req: Request, res: Response) => {
        try {
            const status = metuGlassMCPController.getStatus();
            res.json({
                success: true,
                data: status,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Get device windows
    this.app.get('/api/mcp/windows', async (req: Request, res: Response) => {
        try {
            const deviceId = req.query.deviceId as string || 'local';
            const result = await metuGlassMCPController.getDeviceWindows(deviceId);

            res.json({
                success: result.success,
                data: result.result && 'data' in result.result ? result.result.data : [],
                timestamp: result.timestamp,
                executionTime: result.executionTime
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Focus window
    this.app.post('/api/mcp/window/focus', async (req: Request, res: Response) => {
        try {
            const { deviceId = 'local', windowTitle, exact = false } = req.body;

            if (!windowTitle) {
                return res.status(400).json({
                    success: false,
                    error: 'windowTitle is required',
                    timestamp: Date.now()
                });
            }

            const result = await metuGlassMCPController.focusDeviceWindow(deviceId, windowTitle, exact);

            res.json({
                success: result.success,
                data: result.result && 'data' in result.result ? result.result.data : null,
                error: result.error,
                timestamp: result.timestamp,
                executionTime: result.executionTime
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Send text to window
    this.app.post('/api/mcp/window/send-text', async (req: Request, res: Response) => {
        try {
            const { deviceId = 'local', windowTitle, text, exact = false } = req.body;

            if (!windowTitle || !text) {
                return res.status(400).json({
                    success: false,
                    error: 'windowTitle and text are required',
                    timestamp: Date.now()
                });
            }

            const result = await metuGlassMCPController.sendTextToDeviceWindow(deviceId, windowTitle, text, exact);

            res.json({
                success: result.success,
                data: result.result && 'data' in result.result ? result.result.data : null,
                error: result.error,
                timestamp: result.timestamp,
                executionTime: result.executionTime
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Extract text from window
    this.app.post('/api/mcp/window/extract-text', async (req: Request, res: Response) => {
        try {
            const { deviceId = 'local', windowTitle, exact = false } = req.body;

            if (!windowTitle) {
                return res.status(400).json({
                    success: false,
                    error: 'windowTitle is required',
                    timestamp: Date.now()
                });
            }

            const result = await metuGlassMCPController.extractTextFromDeviceWindow(deviceId, windowTitle, exact);

            res.json({
                success: result.success,
                data: result.result && 'data' in result.result ? result.result.data : null,
                error: result.error,
                timestamp: result.timestamp,
                executionTime: result.executionTime
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Get clipboard content
    this.app.get('/api/mcp/clipboard', async (req: Request, res: Response) => {
        try {
            const deviceId = req.query.deviceId as string || 'local';
            const result = await metuGlassMCPController.getDeviceClipboard(deviceId);

            res.json({
                success: result.success,
                data: result.result && 'data' in result.result ? result.result.data : null,
                error: result.error,
                timestamp: result.timestamp,
                executionTime: result.executionTime
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Set clipboard content
    this.app.post('/api/mcp/clipboard', async (req: Request, res: Response) => {
        try {
            const { deviceId = 'local', text } = req.body;

            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'text is required',
                    timestamp: Date.now()
                });
            }

            const result = await metuGlassMCPController.setDeviceClipboard(deviceId, text);

            res.json({
                success: result.success,
                data: result.result && 'data' in result.result ? result.result.data : null,
                error: result.error,
                timestamp: result.timestamp,
                executionTime: result.executionTime
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Execute predefined workflow
    this.app.post('/api/mcp/workflow', async (req: Request, res: Response) => {
        try {
            const { deviceId = 'local', workflowName, parameters = {} } = req.body;

            if (!workflowName) {
                return res.status(400).json({
                    success: false,
                    error: 'workflowName is required',
                    timestamp: Date.now()
                });
            }

            const result = await metuGlassMCPController.executeWorkflow(deviceId, workflowName, parameters);

            res.json({
                success: result.success,
                data: result.result,
                error: result.error,
                timestamp: result.timestamp,
                executionTime: result.executionTime
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Execute custom workflow
    this.app.post('/api/mcp/workflow/custom', async (req: Request, res: Response) => {
        try {
            const { deviceId = 'local', workflow } = req.body;

            if (!workflow) {
                return res.status(400).json({
                    success: false,
                    error: 'workflow is required',
                    timestamp: Date.now()
                });
            }

            const result = await metuGlassMCPController.createCustomWorkflow(deviceId, workflow);

            res.json({
                success: result.success,
                data: result.result,
                error: result.error,
                timestamp: result.timestamp,
                executionTime: result.executionTime
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Stop all automations
    this.app.post('/api/mcp/automation/stop-all', async (req: Request, res: Response) => {
        try {
            await metuGlassMCPController.stopAllAutomations();

            res.json({
                success: true,
                message: 'All automations stopped successfully',
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });
}

    /**
     * Setup CBD Database endpoints
     */
    private setupCBDDatabaseEndpoints(): void {
    // Database health status
    this.app.get('/api/database/health', async (req: Request, res: Response) => {
        try {
            const health = await this.metuCBDClient.getHealthStatus();
            const ping = await this.metuCBDClient.ping();

            res.json({
                success: true,
                health,
                ready: ping,
                connected: this.metuCBDClient.getConnectionStatus(),
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Get all registered devices
    this.app.get('/api/database/devices', async (req: Request, res: Response) => {
        try {
            const devices = await this.metuCBDClient.getAllDevices();

            res.json({
                success: true,
                devices,
                count: devices.length,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Get specific device
    this.app.get('/api/database/devices/:deviceId', async (req: Request, res: Response) => {
        try {
            const { deviceId } = req.params;
            const device = await this.metuCBDClient.getDevice(deviceId);

            if (!device) {
                return res.status(404).json({
                    success: false,
                    error: 'Device not found',
                    timestamp: Date.now()
                });
            }

            res.json({
                success: true,
                device,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Get device conversations
    this.app.get('/api/database/devices/:deviceId/conversations', async (req: Request, res: Response) => {
        try {
            const { deviceId } = req.params;
            const { limit } = req.query;
            const conversations = await this.metuCBDClient.getDeviceConversations(
                deviceId,
                limit ? parseInt(limit as string) : undefined
            );

            res.json({
                success: true,
                conversations,
                count: conversations.length,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Get specific conversation with messages
    this.app.get('/api/database/conversations/:conversationId', async (req: Request, res: Response) => {
        try {
            const { conversationId } = req.params;
            const conversation = await this.metuCBDClient.getConversation(conversationId);

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    error: 'Conversation not found',
                    timestamp: Date.now()
                });
            }

            res.json({
                success: true,
                conversation,
                messageCount: conversation.messages.length,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Start new conversation
    this.app.post('/api/database/conversations', async (req: Request, res: Response) => {
        try {
            const { deviceId, sessionId, userId, metadata = {} } = req.body;

            if (!deviceId || !sessionId) {
                return res.status(400).json({
                    success: false,
                    error: 'deviceId and sessionId are required',
                    timestamp: Date.now()
                });
            }

            const conversation = await this.metuCBDClient.startConversation({
                deviceId,
                sessionId,
                userId,
                metadata
            });

            res.json({
                success: true,
                conversation,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Add message to conversation
    this.app.post('/api/database/conversations/:conversationId/messages', async (req: Request, res: Response) => {
        try {
            const { conversationId } = req.params;
            const { role, type, content, audioData, functionCall, processingTime, confidence, metadata = {} } = req.body;

            if (!role || !type || !content) {
                return res.status(400).json({
                    success: false,
                    error: 'role, type, and content are required',
                    timestamp: Date.now()
                });
            }

            const message = await this.metuCBDClient.addMessage({
                conversationId,
                role,
                type,
                content,
                audioData,
                functionCall,
                processingTime,
                confidence,
                metadata
            });

            res.json({
                success: true,
                message,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // End conversation
    this.app.post('/api/database/conversations/:conversationId/end', async (req: Request, res: Response) => {
        try {
            const { conversationId } = req.params;
            const { summary } = req.body;

            await this.metuCBDClient.endConversation(conversationId, summary);

            res.json({
                success: true,
                message: 'Conversation ended successfully',
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Get user profile
    this.app.get('/api/database/users/:userId', async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const profile = await this.metuCBDClient.getUserProfile(userId);

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    error: 'User profile not found',
                    timestamp: Date.now()
                });
            }

            res.json({
                success: true,
                profile,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Update user preferences
    this.app.patch('/api/database/users/:userId/preferences', async (req: Request, res: Response) => {
        try {
            const { userId } = req.params;
            const preferences = req.body;

            await this.metuCBDClient.updateUserPreferences(userId, preferences);

            res.json({
                success: true,
                message: 'User preferences updated successfully',
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Get system state
    this.app.get('/api/database/system-state/:key', async (req: Request, res: Response) => {
        try {
            const { key } = req.params;
            const { scope = 'global', deviceId, userId, sessionId } = req.query;

            const value = await this.metuCBDClient.getSystemState(key, scope as any, {
                deviceId: deviceId as string,
                userId: userId as string,
                sessionId: sessionId as string
            });

            res.json({
                success: true,
                key,
                value,
                found: value !== null,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Set system state
    this.app.post('/api/database/system-state/:key', async (req: Request, res: Response) => {
        try {
            const { key } = req.params;
            const { value, category, scope = 'global', deviceId, userId, sessionId, expiresAt } = req.body;

            if (!category) {
                return res.status(400).json({
                    success: false,
                    error: 'category is required',
                    timestamp: Date.now()
                });
            }

            await this.metuCBDClient.setSystemState(key, value, category, scope, {
                deviceId,
                userId,
                sessionId,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined
            });

            res.json({
                success: true,
                message: 'System state updated successfully',
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Track analytics event
    this.app.post('/api/database/analytics/track', async (req: Request, res: Response) => {
        try {
            const { deviceId, event, category, properties = {}, userId, sessionId, duration } = req.body;

            if (!deviceId || !event || !category) {
                return res.status(400).json({
                    success: false,
                    error: 'deviceId, event, and category are required',
                    timestamp: Date.now()
                });
            }

            await this.metuCBDClient.trackEvent(deviceId, event, category, properties, {
                userId,
                sessionId,
                duration
            });

            res.json({
                success: true,
                message: 'Event tracked successfully',
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Get analytics data
    this.app.get('/api/database/analytics', async (req: Request, res: Response) => {
        try {
            const { deviceId, userId, category, startDate, endDate, limit } = req.query;

            const analytics = await this.metuCBDClient.getAnalytics({
                deviceId: deviceId as string,
                userId: userId as string,
                category: category as any,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined
            });

            res.json({
                success: true,
                analytics,
                count: analytics.length,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Database cleanup
    this.app.post('/api/database/cleanup', async (req: Request, res: Response) => {
        try {
            const { olderThanDays, categories } = req.body;

            await this.metuCBDClient.cleanup({ olderThanDays, categories });

            res.json({
                success: true,
                message: 'Database cleanup completed successfully',
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });

    // Backup database
    this.app.post('/api/database/backup', async (req: Request, res: Response) => {
        try {
            const { filepath } = req.body;

            const backupPath = await this.metuCBDClient.backup(filepath);

            res.json({
                success: true,
                message: 'Database backup created successfully',
                backupPath,
                timestamp: Date.now()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
        }
    });
}

    /**
     * Handle event subscription
     */
    private async handleSubscribeEvents(clientId: string, message: any): Promise < void> {
    const client = this.clients.get(clientId);
    if(!client) return;

    const { events =[] } = message;
    client.metadata.capabilities = events;

    this.sendToClient(clientId, {
        type: 'subscribe-events-ack',
        requestId: message.requestId,
        subscribedEvents: events
    });
}

    /**
     * Send message to specific client
     */
    private sendToClient(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if(client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
}
    }

    /**
     * Broadcast message to all clients
     */
    private broadcastToClients(message: any, filter ?: (client: ClientConnection) => boolean): void {
    for(const client of this.clients.values()) {
    if (client.ws.readyState === WebSocket.OPEN) {
        if (!filter || filter(client)) {
            client.ws.send(JSON.stringify(message));
        }
    }
}
    }

    /**
     * Process voice command using Azure OpenAI
     */
    private async processVoiceCommand(text: string, language: string): Promise < any > {
    if(!this.azureClient) {
    throw new Error('Azure OpenAI client not initialized');
}

console.log(`🗣️ Processing voice command: "${text}"`);

// Send text to Azure OpenAI
await this.azureClient.sendText(text);

// Return a placeholder result
// In practice, this would wait for the Azure response
return {
    transcript: text,
    language: language,
    intent: 'general_query',
    confidence: 0.95,
    response: 'Command processed successfully'
};
    }

    /**
     * Execute device control command
     */
    private async executeDeviceControl(action: string, target: string, parameters ?: any): Promise < any > {
    console.log(`🎮 Executing device control: ${action} on ${target}`);

    // This would integrate with Glass MCP
    // For now, return a mock result
    return {
        action: action,
        target: target,
        parameters: parameters,
        success: true,
        timestamp: new Date().toISOString()
    };
}

    /**
     * Start voice session with Azure OpenAI
     */
    private async startVoiceSession(): Promise < void> {
    if(!this.azureClient) {
    const realtimeConfig: RealtimeConfig = {
        apiKey: this.config.azure.apiKey,
        endpoint: this.config.azure.endpoint,
        deployment: this.config.azure.deployment,
        apiVersion: this.config.azure.apiVersion,
        voice: this.config.azure.voice
    };

    this.azureClient = new AzureRealtimeClient(realtimeConfig);

    // Setup event handlers
    this.azureClient.on('transcription', (transcript) => {
        this.broadcastToClients({
            type: 'voice-transcription',
            transcript: transcript
        });
    });

    this.azureClient.on('audio-delta', (audioBuffer) => {
        this.broadcastToClients({
            type: 'voice-audio-delta',
            audioData: this.arrayBufferToBase64(audioBuffer)
        });
    });

    this.azureClient.on('response-complete', (response) => {
        this.broadcastToClients({
            type: 'voice-response-complete',
            response: response
        });
    });

    await this.azureClient.connect();
    await this.azureClient.initializeAudio();
    await this.azureClient.configureSession();
}

await this.azureClient.startConversation();

console.log('🎤 Voice session started');
    }

    /**
     * Stop voice session
     */
    private async stopVoiceSession(): Promise < void> {
    if(this.azureClient) {
    await this.azureClient.disconnect();
    this.azureClient = null;
}

console.log('🎤 Voice session stopped');
    }

    /**
     * Start the device server
     */
    async start(): Promise < void> {
    try {
        // Start HTTP server
        await new Promise<void>((resolve, reject) => {
            this.server.listen(this.config.port, this.config.host, () => {
                console.log(`🌐 METU Device Server listening on ${this.config.host}:${this.config.port}`);
                resolve();
            });

            this.server.on('error', reject);
        });

        // Publish service via Bonjour/mDNS
        await this.publishService();

        // Initialize audio device manager
        await this.initializeAudioDevices();

        // Initialize Glass MCP controller
        await this.initializeGlassMCP();

        // Initialize CND database client
        await this.initializeCNDClient();

        this.isRunning = true;
        this.emit('server-started');

        console.log('✅ METU Device Server started successfully');

    } catch(error) {
        console.error('❌ Failed to start METU Device Server:', error);
        throw error;
    }
}

    /**
     * Stop the device server
     */
    async stop(): Promise < void> {
    try {
        // Stop voice session
        await this.stopVoiceSession();

        // Unpublish service
        if(this.publishedService) {
    this.publishedService.stop();
    this.publishedService = null;
}

// Close all client connections
for (const client of this.clients.values()) {
    client.ws.close();
}
this.clients.clear();

// Close WebSocket server
this.wsServer.close();

// Close HTTP server
await new Promise<void>((resolve) => {
    this.server.close(() => resolve());
});

// Cleanup Bonjour
this.bonjourService.destroy();

// Cleanup audio device manager
audioDeviceManager.cleanup();

// Cleanup Glass MCP controller
await metuGlassMCPController.shutdown();

// Close CND database client
await this.metuCBDClient.close();

this.isRunning = false;
this.emit('server-stopped');

console.log('✅ METU Device Server stopped');

        } catch (error) {
    console.error('❌ Error stopping METU Device Server:', error);
    throw error;
}
    }

    /**
     * Publish service via Bonjour/mDNS
     */
    private async publishService(): Promise < void> {
    const serviceInfo = {
        name: this.config.serviceName,
        type: this.config.serviceType,
        protocol: 'tcp' as const,
        port: this.config.port,
        host: this.config.host,
        txt: {
            version: '2.0.0',
            capabilities: JSON.stringify(Object.keys(this.capabilities)),
            platform: process.platform,
            arch: process.arch,
            deviceId: this.generateDeviceId()
        }
    };

    this.publishedService = this.bonjourService.publish(serviceInfo);

    this.publishedService.on('up', () => {
        console.log(`📡 Service published: ${serviceInfo.name} on ${serviceInfo.host}:${serviceInfo.port}`);
    });

    this.publishedService.on('error', (error) => {
        console.error('❌ Service publication error:', error);
    });
}

    /**
     * Initialize audio devices
     */
    private async initializeAudioDevices(): Promise < void> {
    try {
        // Get recommended devices
        const inputDevice = await audioDeviceManager.getRecommendedInputDevice();
        const outputDevice = await audioDeviceManager.getRecommendedOutputDevice();

        // Set recommended devices
        if(inputDevice) {
            await audioDeviceManager.setInputDevice(inputDevice.deviceId);
            console.log(`🎤 Default input device: ${inputDevice.label}`);
        }

            if(outputDevice) {
            await audioDeviceManager.setOutputDevice(outputDevice.deviceId);
            console.log(`🔊 Default output device: ${outputDevice.label}`);
        }

    } catch(error) {
        console.warn('⚠️ Could not initialize audio devices:', error);
    }
}

    /**
     * Initialize Glass MCP controller
     */
    private async initializeGlassMCP(): Promise < void> {
    try {
        console.log('🔧 Initializing Glass MCP Controller...');
        const initialized = await metuGlassMCPController.initialize();

        if(initialized) {
            console.log('✅ Glass MCP Controller initialized successfully');

            // Setup event listeners for Glass MCP events
            metuGlassMCPController.on('commandExecuted', (data) => {
                console.log(`🔧 Glass MCP command executed: ${data.command?.action} for device ${data.deviceId}`);
            });

            metuGlassMCPController.on('workflowCompleted', (data) => {
                console.log(`🔧 Glass MCP workflow completed: ${data.workflowResult.workflowId} for device ${data.deviceId}`);
            });

            metuGlassMCPController.on('error', (error) => {
                console.error('❌ Glass MCP error:', error);
            });

        } else {
            console.warn('⚠️ Glass MCP Controller initialization failed - automation features will be limited');
        }

    } catch(error) {
        console.error('❌ Failed to initialize Glass MCP Controller:', error);
    }
}

    /**
     * Initialize CND database client
     */
    private async initializeCNDClient(): Promise < void> {
    try {
        console.log('🗄️ Initializing CND Database Client...');

        if(!this.metuCBDClient.isReady()) {
    await this.metuCBDClient.initialize();
}

// Register this device server in the database
const deviceId = `metu-server-${hostname()}-${this.config.port}`;
const currentDevice: Omit<MetuDevice, 'createdAt' | 'updatedAt' | 'lastSeen'> = {
    id: deviceId,
    name: `METU Server (${hostname()})`,
    type: 'metu-server',
    status: 'online',
    capabilities: [
        'voice-assistant',
        'azure-realtime',
        'device-discovery',
        'glass-mcp',
        'audio-processing',
        'websocket-control',
        'rest-api'
    ],
    configuration: {
        audioDevices: {
            // These will be populated when audio devices are initialized
        },
        mcpServices: ['glass', 'memorai', 'playwright', 'romai'],
        features: ['realtime-audio', 'interruption-handling', 'function-calling']
    },
    networkInfo: {
        ipAddress: this.config.host,
        port: this.config.port,
        hostname: hostname(),
        macAddress: undefined // Could be populated if needed
    },
    metadata: {
        version: '1.0.0',
        serverCapabilities: this.capabilities,
        environment: process.env.NODE_ENV || 'development',
        startedAt: new Date().toISOString()
    }
};

await this.metuCBDClient.registerDevice(currentDevice);

// Setup CND event listeners
this.metuCBDClient.on('deviceRegistered', (device) => {
    console.log(`📱 Device registered: ${device.name} (${device.id})`);
});

this.metuCBDClient.on('conversationStarted', (conversation) => {
    console.log(`💬 Conversation started: ${conversation.id} on device ${conversation.deviceId}`);
});

this.metuCBDClient.on('messageAdded', (message) => {
    console.log(`📝 Message added to conversation ${message.conversationId}: ${message.type} from ${message.role}`);
});

this.metuCBDClient.on('eventTracked', (event) => {
    console.log(`📊 Analytics event tracked: ${event.category}/${event.event} for device ${event.deviceId}`);
});

console.log('✅ CND Database Client initialized successfully');
            
        } catch (error) {
    console.error('❌ Failed to initialize CND Database Client:', error);
    console.warn('⚠️ Continuing without database persistence - some features will be limited');
}
    }

    /**
     * Detect client type from user agent
     */
    private detectClientType(userAgent: string): 'web' | 'mobile' | 'desktop' {
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
        return 'mobile';
    } else if (/Electron/.test(userAgent)) {
        return 'desktop';
    } else {
        return 'web';
    }
}

    /**
     * Generate unique device ID
     */
    private generateDeviceId(): string {
    const deviceHostname = hostname();
    const platform = process.platform;
    return `metu-${platform}-${deviceHostname}-${Date.now()}`;
}

    /**
     * Utility: Convert ArrayBuffer to base64
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Get server status
 */
getStatus() {
    return {
        isRunning: this.isRunning,
        config: {
            host: this.config.host,
            port: this.config.port,
            serviceName: this.config.serviceName
        },
        clients: this.clients.size,
        capabilities: this.capabilities,
        audio: audioDeviceManager.getDeviceStatus(),
        azure: this.azureClient?.getStatus() || null
    };
}
}
