/**
 * Enhanced METU Backend Server - Azure OpenAI + MCP Integration
 * 
 * This enhanced server provides:
 * - Azure OpenAI GPT-4o Realtime API integration for voice conversations
 * - Comprehensive MCP tools coordination (Glass, Memorai, Playwright, etc.)
 * - Real-time WebSocket communication for audio streaming
 * - Advanced voice command processing and intent recognition
 * - Safety permissions and tool execution management
 * - Performance monitoring and analytics
 */

import express, { Application, Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { MetuServerDatabaseService } from '../database/server-database';
import AzureOpenAIRealtimeService from '../voice/AzureOpenAIRealtimeService';
import MCPManager from '../mcp/MCPManager';
import PerformanceOptimizer from '../performance/PerformanceOptimizer';
// DISABLED: RomAI AGI Service disabled - using Azure OpenAI directly
import { RomAIAGIService } from '../romai/RomAIAGIService';
import PerformanceMonitor from '../monitoring/PerformanceMonitor';
import { AdvancedVoiceFeatures, defaultAdvancedVoiceConfig } from '../voice/AdvancedVoiceFeatures.js';
import { SystemIntegrationService, defaultSystemIntegrationConfig } from '../integration/SystemIntegrationService.js';
import { FinalPolishTestingService, defaultTestingConfig } from '../testing/FinalPolishTestingService.js';

// PHASE 1: New Enhanced Services
import { MetuServiceDiscovery } from '../discovery/ServiceDiscovery';
import { EnhancedAzureOpenAIRealtimeService } from '../voice/EnhancedAzureOpenAIRealtimeService';
import { EnhancedAudioDeviceManager } from '../audio/EnhancedAudioDeviceManager';
import { EnhancedCnDService } from '../database/EnhancedCnDService';
import { UserSettings, ConversationMessage, ConversationSession } from '../database/schema';

export interface EnhancedServerConfig {
    port: number;
    host: string;
    corsOrigins: string[];
    enableWebSocket: boolean;
    enableRateLimit: boolean;
    maxRequestsPerWindow: number;
    windowMs: number;
    azure: {
        apiKey: string;
        endpoint: string;
        deploymentName: string;
        apiVersion: string;
        // Additional Azure AI services
        foundryEndpoint?: string;
        foundryKey?: string;
        searchEndpoint?: string;
        searchKey?: string;
        whisperDeployment?: string;
        embeddingDeployment?: string;
    };
}

export interface VoiceSession {
    id: string;
    userId: string;
    azureSessionId: string;
    socketId: string;
    isActive: boolean;
    startTime: Date;
    lastActivity: Date;
}

export interface AudioMessage {
    sessionId: string;
    audioData: ArrayBuffer;
    timestamp: number;
    direction: 'input' | 'output';
}

export class EnhancedMetuBackendServer {
    private app: Application;
    private server: any;
    private io: SocketIOServer | null = null;
    private database: MetuServerDatabaseService;
    private azureOpenAI: AzureOpenAIRealtimeService;
    private mcpManager: MCPManager;
    private performanceOptimizer: PerformanceOptimizer;
    // DISABLED: RomAI AGI Service disabled - using Azure OpenAI directly
    private romaiAGI: RomAIAGIService;
    private performanceMonitor: PerformanceMonitor;
    private advancedVoiceFeatures: AdvancedVoiceFeatures;
    private systemIntegration: SystemIntegrationService;
    private finalPolishTesting: FinalPolishTestingService;
    private config: EnhancedServerConfig;
    private connectedClients: Map<string, any> = new Map();
    private voiceSessions: Map<string, VoiceSession> = new Map();

    // PHASE 1: Enhanced Services
    private serviceDiscovery: MetuServiceDiscovery;
    private enhancedAzureOpenAI: EnhancedAzureOpenAIRealtimeService;
    private audioDeviceManager: EnhancedAudioDeviceManager;
    private cndService: EnhancedCnDService;

    constructor(config: Partial<EnhancedServerConfig> = {}) {
        this.config = {
            port: parseInt(process.env.METU_SERVER_PORT || process.env.PORT || '4402'),
            host: 'localhost',
            corsOrigins: [
                'http://localhost:4001',  // CODAI Main App
                'http://localhost:4400',  // METU web app
                'http://localhost:6388',  // Electron renderer
                'file://',                // Electron file protocol
            ],
            enableWebSocket: true,
            enableRateLimit: true,
            maxRequestsPerWindow: 100,
            windowMs: 15 * 60 * 1000, // 15 minutes
            azure: {
                apiKey: process.env.AZURE_OPENAI_API_KEY || '',
                endpoint: process.env.AZURE_OPENAI_ENDPOINT?.replace(/"/g, '') || '',
                deploymentName: process.env.AZURE_OPENAI_GPT4O_DEPLOYMENT || 'gpt-4o-realtime',
                apiVersion: '2024-12-01-preview', // Updated to latest realtime API version
            },
            ...config,
        };

        this.app = express();
        this.database = new MetuServerDatabaseService();
        this.azureOpenAI = new AzureOpenAIRealtimeService(this.config.azure);
        this.mcpManager = new MCPManager();

        // Initialize Phase 4 services
        this.performanceOptimizer = new PerformanceOptimizer({
            audioLatency: 100,
            responseTime: 500,
            textStreaming: 50,
            animationFPS: 60,
            cacheSize: 1000,
            connectionPoolSize: 10,
            predictivePreload: true
        });

        // Initialize RomAI AGI Service (disabled but instantiated)
        this.romaiAGI = new RomAIAGIService({
            baseUrl: process.env.ROMAI_AGI_ENDPOINT,
            apiKey: process.env.ROMAI_AGI_API_KEY
        });

        this.performanceMonitor = new PerformanceMonitor(
            this.performanceOptimizer,
            this.romaiAGI
        );

        // Initialize Phase 5 services
        this.advancedVoiceFeatures = new AdvancedVoiceFeatures(defaultAdvancedVoiceConfig);
        this.systemIntegration = new SystemIntegrationService(defaultSystemIntegrationConfig);
        this.finalPolishTesting = new FinalPolishTestingService(defaultTestingConfig);

        // PHASE 1: Initialize Enhanced Services
        this.serviceDiscovery = new MetuServiceDiscovery({
            serviceName: 'METU-AI-Assistant',
            serviceType: '_metu-ai._tcp',
            port: this.config.port,
            txtRecord: {
                version: '1.0.0',
                capabilities: 'voice-conversation,azure-openai-gpt4o,mcp-tools,real-time-audio,system-integration,ai-assistant'
            }
        });

        this.enhancedAzureOpenAI = new EnhancedAzureOpenAIRealtimeService({
            apiKey: this.config.azure.apiKey,
            endpoint: this.config.azure.endpoint,
            deployment: this.config.azure.deploymentName,
            apiVersion: this.config.azure.apiVersion
        });

        this.audioDeviceManager = new EnhancedAudioDeviceManager();

        this.cndService = new EnhancedCnDService();

        this.initializeServices();
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeWebSocket();
    }

    /**
     * Initialize enhanced services
     */
    private async initializeServices(): Promise<void> {
        // Setup Azure OpenAI event handlers
        this.azureOpenAI.on('connected', () => {
            console.log('✅ Azure OpenAI Realtime API connected');
        });

        this.azureOpenAI.on('audioResponse', (response: any) => {
            this.handleAIAudioResponse(response);
        });

        this.azureOpenAI.on('transcriptionCompleted', (transcription: any) => {
            this.handleTranscriptionCompleted(transcription);
        });

        this.azureOpenAI.on('mcpToolCall', (toolCall: any) => {
            this.handleMCPToolCall(toolCall);
        });

        this.azureOpenAI.on('error', (error: any) => {
            console.error('Azure OpenAI error:', error);
            this.broadcastToAll('azureOpenAIError', { error: error.message });
        });

        // Setup MCP Manager event handlers
        this.mcpManager.on('toolExecuted', ({ toolCall, response }) => {
            console.log(`🔧 Tool executed: ${toolCall.toolName}:${toolCall.action}`);
            this.azureOpenAI.sendMCPToolResponse(toolCall.correlationId, response.result);
        });

        this.mcpManager.on('toolFailed', ({ toolCall, response, error }) => {
            console.error(`❌ Tool failed: ${toolCall.toolName}:${toolCall.action}`, error);
            this.azureOpenAI.sendMCPToolResponse(toolCall.correlationId, { error: response.error });
        });

        this.mcpManager.on('permissionRequest', ({ userId, permissionRequest }) => {
            this.handlePermissionRequest(userId, permissionRequest);
        });

        // Setup Phase 4 Performance Optimization event handlers
        this.performanceOptimizer.on('optimization-applied', (strategyId: string, data: any) => {
            console.log(`⚡ Performance optimization applied: ${strategyId}`, data);
            this.broadcastToAll('performanceOptimization', { type: 'applied', strategyId, data });
        });

        this.performanceOptimizer.on('optimization-rollback', (strategyId: string) => {
            console.log(`🔄 Performance optimization rolled back: ${strategyId}`);
            this.broadcastToAll('performanceOptimization', { type: 'rollback', strategyId });
        });

        this.performanceOptimizer.on('performance-warning', (warning: any) => {
            console.log(`⚠️ Performance warning: ${warning.type}`, warning);
            this.broadcastToAll('performanceWarning', warning);
        });

        // DISABLED: RomAI AGI event handlers - using Azure OpenAI directly
        // this.romaiAGI.on('connected', (data: any) => {
        //     console.log('🧠 RomAI AGI Service connected', data.capabilities);
        //     this.broadcastToAll('romaiConnected', data);
        // });

        // this.romaiAGI.on('fallback-mode', (data: any) => {
        //     console.log('⚠️ RomAI AGI running in fallback mode', data.capabilities);
        //     this.broadcastToAll('romaiFallback', data);
        // });

        // this.romaiAGI.on('request-processed', (data: any) => {
        //     // Record latency for performance monitoring
        //     this.performanceOptimizer.recordLatency(data.response.processingTime);
        // });

        // Setup Performance Monitor event handlers
        this.performanceMonitor.on('system-metrics-update', (metrics: any) => {
            this.broadcastToAll('systemMetrics', metrics);
        });

        this.performanceMonitor.on('user-experience-update', (metrics: any) => {
            this.broadcastToAll('userExperienceMetrics', metrics);
        });

        this.performanceMonitor.on('alert-created', (alert: any) => {
            console.log(`🚨 ${alert.severity.toUpperCase()} Alert: ${alert.title}`);
            this.broadcastToAll('performanceAlert', alert);
        });

        this.performanceMonitor.on('monitoring-started', (data: any) => {
            console.log('📊 Performance monitoring started', data);
            this.broadcastToAll('monitoringStatus', { status: 'started', ...data });
        });

        // Connect to Azure OpenAI
        try {
            await this.azureOpenAI.connect();
            console.log('🎤 Azure OpenAI Realtime service initialized');
        } catch (error) {
            console.error('Failed to initialize Azure OpenAI:', error);
        }

        // Start Phase 4 services
        try {
            console.log('🚀 Starting Phase 4 Performance Optimization...');
            await this.performanceOptimizer.startOptimization();
            console.log('⚡ Performance optimization started');

            // Start performance monitoring
            this.performanceMonitor.startMonitoring(5000); // 5-second intervals
            console.log('📊 Performance monitoring started');

            console.log('✅ Phase 4 services initialized successfully');
        } catch (error) {
            console.error('❌ Failed to start Phase 4 services:', error);
        }

        // Start Phase 5 services
        try {
            console.log('🚀 Starting Phase 5 Advanced Features...');

            await this.advancedVoiceFeatures.startAdvancedFeatures();
            console.log('🎤 Advanced voice features started');

            await this.systemIntegration.startSystemIntegration();
            console.log('🔧 System integration started');

            await this.finalPolishTesting.startTesting();
            console.log('🧪 Testing service started');

            console.log('✅ Phase 5 services initialized successfully');
        } catch (error) {
            console.error('❌ Failed to start Phase 5 services:', error);
        }

        // PHASE 1: Initialize Enhanced Services
        try {
            console.log('🚀 Starting Phase 1 Enhanced Services...');

            // Initialize audio device manager
            await this.audioDeviceManager.initialize();
            console.log('🎧 Enhanced Audio Device Manager initialized');

            // Initialize CND database service
            await this.cndService.initialize();
            console.log('💾 Enhanced CND Database Service initialized');

            // Enhanced Azure OpenAI service is ready (no async initialization needed)
            console.log('🧠 Enhanced Azure OpenAI Realtime Service ready');

            // Start service discovery (advertising)
            await this.serviceDiscovery.startAdvertising();
            console.log('📡 Service Discovery advertising started');

            // Start service discovery (browsing for other METU instances)
            await this.serviceDiscovery.startBrowsing();
            console.log('🔍 Service Discovery browsing started');

            console.log('✅ Phase 1 Enhanced Services initialized successfully');
        } catch (error) {
            console.error('❌ Failed to start Phase 1 Enhanced Services:', error);
        }

        console.log('🔧 MCP Manager initialized with available tools');
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
            // Skip logging for health check HEAD requests to reduce noise
            if (!(req.method === 'HEAD' && req.path === '/')) {
                console.log(`📡 ${req.method} ${req.path} - ${req.ip}`);
            }
            next();
        });
    }

    /**
     * Initialize enhanced API routes
     */
    private initializeRoutes(): void {
        // Health check with enhanced status
        this.app.get('/health', (req: Request, res: Response) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                uptime: process.uptime(),
                connections: this.connectedClients.size,
                voiceSessions: this.voiceSessions.size,
                services: {
                    azureOpenAI: this.azureOpenAI.getStatus(),
                    mcpManager: {
                        availableTools: this.mcpManager.getAvailableTools('default').length,
                        activeToolCalls: this.mcpManager.getActiveToolCalls().length,
                        usageStats: this.mcpManager.getUsageStats(),
                    },
                    // Phase 4 services status
                    performanceOptimizer: this.performanceOptimizer.getPerformanceReport(),
                    romaiAGI: { status: 'disabled', message: 'RomAI AGI Service disabled - using Azure OpenAI directly' },
                    performanceMonitor: this.performanceMonitor.getStatus(),
                },
            });
        });

        // Voice session management routes
        this.setupVoiceRoutes();

        // MCP tools management routes
        this.setupMCPRoutes();

        // Phase 4: Performance and RomAI routes
        this.setupPhase4Routes();
        this.setupPhase5Routes();

        // PHASE 1: Enhanced Services routes
        this.setupPhase1Routes();

        // Original routes
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
     * Voice session management routes
     */
    private setupVoiceRoutes(): void {
        const router = express.Router();

        // Start voice session
        router.post('/voice/session/start', async (req: Request, res: Response) => {
            try {
                const { userId, options = {} } = req.body;

                // Create Azure OpenAI session
                const azureSessionId = await this.azureOpenAI.createSession(userId, options);

                const voiceSession: VoiceSession = {
                    id: `voice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userId,
                    azureSessionId,
                    socketId: '', // Will be set when WebSocket connects
                    isActive: true,
                    startTime: new Date(),
                    lastActivity: new Date(),
                };

                this.voiceSessions.set(voiceSession.id, voiceSession);

                console.log(`🎤 Started voice session: ${voiceSession.id} for user: ${userId}`);

                res.json({
                    sessionId: voiceSession.id,
                    azureSessionId,
                    status: 'active',
                    startTime: voiceSession.startTime,
                });

            } catch (error: any) {
                console.error('Start voice session error:', error);
                res.status(500).json({ error: 'Failed to start voice session' });
            }
        });

        // End voice session
        router.post('/voice/session/:sessionId/end', async (req: Request, res: Response) => {
            try {
                const { sessionId } = req.params;
                const voiceSession = this.voiceSessions.get(sessionId);

                if (!voiceSession) {
                    return res.status(404).json({ error: 'Voice session not found' });
                }

                // End Azure OpenAI session
                await this.azureOpenAI.endSession(voiceSession.azureSessionId);

                // Clean up local session
                voiceSession.isActive = false;
                this.voiceSessions.delete(sessionId);

                console.log(`🛑 Ended voice session: ${sessionId}`);

                res.json({
                    sessionId,
                    status: 'ended',
                    duration: Date.now() - voiceSession.startTime.getTime(),
                });

            } catch (error: any) {
                console.error('End voice session error:', error);
                res.status(500).json({ error: 'Failed to end voice session' });
            }
        });

        // Get voice session status
        router.get('/voice/session/:sessionId', (req: Request, res: Response) => {
            try {
                const { sessionId } = req.params;
                const voiceSession = this.voiceSessions.get(sessionId);

                if (!voiceSession) {
                    return res.status(404).json({ error: 'Voice session not found' });
                }

                res.json({
                    sessionId: voiceSession.id,
                    userId: voiceSession.userId,
                    isActive: voiceSession.isActive,
                    startTime: voiceSession.startTime,
                    lastActivity: voiceSession.lastActivity,
                    duration: Date.now() - voiceSession.startTime.getTime(),
                });

            } catch (error: any) {
                console.error('Get voice session error:', error);
                res.status(500).json({ error: 'Failed to get voice session' });
            }
        });

        this.app.use('/api', router);
    }

    /**
     * MCP tools management routes
     */
    private setupMCPRoutes(): void {
        const router = express.Router();

        // Get available tools
        router.get('/mcp/tools/:userId', (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const tools = this.mcpManager.getAvailableTools(userId);

                res.json({
                    tools,
                    usageStats: this.mcpManager.getUsageStats(),
                    activeToolCalls: this.mcpManager.getActiveToolCalls().length,
                });

            } catch (error: any) {
                console.error('Get MCP tools error:', error);
                res.status(500).json({ error: 'Failed to get MCP tools' });
            }
        });

        // Grant tool permission
        router.post('/mcp/permissions/:userId/grant', (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const { toolName } = req.body;

                this.mcpManager.grantPermission(userId, toolName);

                res.json({
                    success: true,
                    message: `Permission granted for ${toolName}`,
                    timestamp: new Date().toISOString(),
                });

            } catch (error: any) {
                console.error('Grant MCP permission error:', error);
                res.status(500).json({ error: 'Failed to grant permission' });
            }
        });

        // Execute tool directly (for testing)
        router.post('/mcp/execute', async (req: Request, res: Response) => {
            try {
                const { toolName, action, parameters, userId } = req.body;

                const toolCall = {
                    toolName,
                    action,
                    parameters,
                    correlationId: `test_${Date.now()}`,
                    userId,
                    timestamp: new Date(),
                };

                const response = await this.mcpManager.executeTool(toolCall);

                res.json(response);

            } catch (error: any) {
                console.error('Execute MCP tool error:', error);
                res.status(500).json({ error: 'Failed to execute tool' });
            }
        });

        this.app.use('/api', router);
    }

    /**
     * Original server routes (maintaining compatibility)
     */
    private setupUserRoutes(): void {
        const router = express.Router();

        router.get('/users/:userId/settings', (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const settings = this.database.getUserSettings(userId);
                res.json(settings || { userId, language: 'en', theme: 'dark' });
            } catch (error) {
                console.error('Get user settings error:', error);
                res.status(500).json({ error: 'Failed to get user settings' });
            }
        });

        router.put('/users/:userId/settings', (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const updates = req.body;
                const success = this.database.updateUserSettings(userId, updates);

                if (!success) {
                    return res.status(400).json({ error: 'Failed to update settings' });
                }

                const updatedSettings = this.database.getUserSettings(userId);
                this.broadcastToUserClients(userId, 'settingsUpdated', updatedSettings);
                res.json(updatedSettings);
            } catch (error) {
                console.error('Update user settings error:', error);
                res.status(500).json({ error: 'Failed to update user settings' });
            }
        });

        this.app.use('/api', router);
    }

    private setupConversationRoutes(): void {
        const router = express.Router();

        router.get('/users/:userId/conversations', (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const conversations = this.database.getUserConversations(userId);
                res.json(conversations || []);
            } catch (error) {
                console.error('Get conversations error:', error);
                res.status(500).json({ error: 'Failed to get conversations' });
            }
        });

        this.app.use('/api', router);
    }

    private setupSettingsRoutes(): void {
        const router = express.Router();

        router.post('/sync/settings/:userId', (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const { settings } = req.body;

                const success = this.database.updateUserSettings(userId, settings);
                if (!success) {
                    return res.status(400).json({ error: 'Failed to sync settings' });
                }

                this.broadcastToUserClients(userId, 'settingsSync', settings);
                res.json({ success: true, timestamp: new Date().toISOString() });
            } catch (error) {
                console.error('Sync settings error:', error);
                res.status(500).json({ error: 'Failed to sync settings' });
            }
        });

        this.app.use('/api', router);
    }

    private setupSyncRoutes(): void {
        const router = express.Router();

        router.get('/sync/stats', (req: Request, res: Response) => {
            res.json({
                connectedClients: this.connectedClients.size,
                voiceSessions: this.voiceSessions.size,
                databaseStats: this.database.getDatabaseStats(),
                serverUptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                services: {
                    azureOpenAI: this.azureOpenAI.getStatus(),
                    mcpManager: {
                        availableTools: this.mcpManager.getAvailableTools('default').length,
                        usageStats: this.mcpManager.getUsageStats(),
                    },
                },
            });
        });

        this.app.use('/api', router);
    }

    /**
     * Phase 4: Performance Optimization & RomAI AGI Routes
     */
    private setupPhase4Routes(): void {
        const router = express.Router();

        // Performance Optimizer routes
        router.get('/performance/status', (req: Request, res: Response) => {
            try {
                const report = this.performanceOptimizer.getPerformanceReport();
                res.json(report);
            } catch (error) {
                console.error('Get performance status error:', error);
                res.status(500).json({ error: 'Failed to get performance status' });
            }
        });

        router.post('/performance/optimize', (req: Request, res: Response) => {
            try {
                this.performanceOptimizer.startOptimization();
                res.json({ success: true, message: 'Performance optimization started' });
            } catch (error) {
                console.error('Start optimization error:', error);
                res.status(500).json({ error: 'Failed to start optimization' });
            }
        });

        router.post('/performance/stop', (req: Request, res: Response) => {
            try {
                this.performanceOptimizer.stopOptimization();
                res.json({ success: true, message: 'Performance optimization stopped' });
            } catch (error) {
                console.error('Stop optimization error:', error);
                res.status(500).json({ error: 'Failed to stop optimization' });
            }
        });

        router.put('/performance/config', (req: Request, res: Response) => {
            try {
                const config = req.body;
                this.performanceOptimizer.updateConfig(config);
                res.json({ success: true, message: 'Performance configuration updated' });
            } catch (error) {
                console.error('Update performance config error:', error);
                res.status(500).json({ error: 'Failed to update configuration' });
            }
        });

        router.post('/performance/strategy/:strategyId/toggle', (req: Request, res: Response) => {
            try {
                const { strategyId } = req.params;
                const { enabled } = req.body;
                this.performanceOptimizer.toggleStrategy(strategyId, enabled);
                res.json({ success: true, message: `Strategy ${strategyId} ${enabled ? 'enabled' : 'disabled'}` });
            } catch (error) {
                console.error('Toggle strategy error:', error);
                res.status(500).json({ error: 'Failed to toggle strategy' });
            }
        });

        // RomAI AGI routes
        router.get('/romai/status', (req: Request, res: Response) => {
            try {
                const status = this.romaiAGI.getStatus();
                res.json(status);
            } catch (error) {
                console.error('Get RomAI status error:', error);
                res.status(500).json({ error: 'Failed to get RomAI status' });
            }
        });

        router.post('/romai/reasoning', async (req: Request, res: Response) => {
            try {
                const { input, type, context, language, priority } = req.body;
                const request = {
                    id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: type || 'reasoning',
                    input,
                    context,
                    language,
                    priority: priority || 'medium'
                };

                const response = await this.romaiAGI.processReasoning(request);
                res.json(response);
            } catch (error) {
                console.error('RomAI reasoning error:', error);
                res.status(500).json({ error: 'Failed to process reasoning request' });
            }
        });

        router.post('/romai/test', async (req: Request, res: Response) => {
            try {
                const testResult = await this.romaiAGI.testRomAI();
                res.json(testResult);
            } catch (error) {
                console.error('RomAI test error:', error);
                res.status(500).json({ error: 'Failed to test RomAI' });
            }
        });

        router.put('/romai/context/:sessionId', (req: Request, res: Response) => {
            try {
                const { sessionId } = req.params;
                const context = req.body;
                this.romaiAGI.updateContext(sessionId, context);
                res.json({ success: true, message: 'Context updated' });
            } catch (error) {
                console.error('Update RomAI context error:', error);
                res.status(500).json({ error: 'Failed to update context' });
            }
        });

        router.get('/romai/context/:sessionId', (req: Request, res: Response) => {
            try {
                const { sessionId } = req.params;
                const context = this.romaiAGI.getContext(sessionId);
                res.json(context);
            } catch (error) {
                console.error('Get RomAI context error:', error);
                res.status(500).json({ error: 'Failed to get context' });
            }
        });

        // Performance Monitor routes
        router.get('/monitoring/status', (req: Request, res: Response) => {
            try {
                const status = this.performanceMonitor.getStatus();
                res.json(status);
            } catch (error) {
                console.error('Get monitoring status error:', error);
                res.status(500).json({ error: 'Failed to get monitoring status' });
            }
        });

        router.get('/monitoring/metrics', (req: Request, res: Response) => {
            try {
                const count = parseInt(req.query.count as string) || 10;
                const metrics = this.performanceMonitor.getRecentMetrics(count);
                res.json(metrics);
            } catch (error) {
                console.error('Get monitoring metrics error:', error);
                res.status(500).json({ error: 'Failed to get metrics' });
            }
        });

        router.get('/monitoring/report', (req: Request, res: Response) => {
            try {
                const hours = parseInt(req.query.hours as string) || 24;
                const report = this.performanceMonitor.generateAnalyticsReport(hours);
                res.json(report);
            } catch (error) {
                console.error('Generate monitoring report error:', error);
                res.status(500).json({ error: 'Failed to generate report' });
            }
        });

        router.post('/monitoring/start', (req: Request, res: Response) => {
            try {
                const interval = parseInt(req.body.interval) || 5000;
                this.performanceMonitor.startMonitoring(interval);
                res.json({ success: true, message: 'Monitoring started' });
            } catch (error) {
                console.error('Start monitoring error:', error);
                res.status(500).json({ error: 'Failed to start monitoring' });
            }
        });

        router.post('/monitoring/stop', (req: Request, res: Response) => {
            try {
                this.performanceMonitor.stopMonitoring();
                res.json({ success: true, message: 'Monitoring stopped' });
            } catch (error) {
                console.error('Stop monitoring error:', error);
                res.status(500).json({ error: 'Failed to stop monitoring' });
            }
        });

        this.app.use('/api', router);
    }

    /**
     * Initialize enhanced WebSocket server
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
                const connection = {
                    id: socket.id,
                    type: data.clientType,
                    userId: data.userId,
                    deviceInfo: data.deviceInfo,
                    connectedAt: new Date(),
                    lastActivity: new Date(),
                };

                this.connectedClients.set(socket.id, connection);
                socket.join(`user_${data.userId}`);

                console.log(`👤 Client registered: ${data.clientType} for user ${data.userId}`);
            });

            // Handle voice session binding
            socket.on('bindVoiceSession', (data: { sessionId: string; userId: string }) => {
                const voiceSession = this.voiceSessions.get(data.sessionId);
                if (voiceSession && voiceSession.userId === data.userId) {
                    voiceSession.socketId = socket.id;
                    socket.join(`voice_${data.sessionId}`);
                    console.log(`🎤 Voice session bound: ${data.sessionId} to socket ${socket.id}`);
                }
            });

            // Handle audio streaming
            socket.on('audioChunk', async (data: { sessionId: string; audioData: ArrayBuffer }) => {
                try {
                    await this.azureOpenAI.sendAudio(data.sessionId, data.audioData);
                } catch (error) {
                    console.error('Error sending audio chunk:', error);
                    socket.emit('audioError', { error: 'Failed to process audio' });
                }
            });

            // Handle audio commit (end of speech)
            socket.on('audioCommit', async (data: { sessionId: string }) => {
                try {
                    await this.azureOpenAI.commitAudio(data.sessionId);
                } catch (error) {
                    console.error('Error committing audio:', error);
                    socket.emit('audioError', { error: 'Failed to commit audio' });
                }
            });

            // Handle voice commands
            socket.on('voiceCommand', async (data: { text: string; userId: string }) => {
                try {
                    const command = this.mcpManager.parseVoiceCommand(data.text, data.userId);
                    if (command) {
                        console.log(`🎯 Voice command parsed:`, command);
                        socket.emit('commandParsed', command);

                        // Execute command if it's a direct MCP action
                        if (command.entities.toolName && command.entities.actionName) {
                            const toolCall = {
                                toolName: command.entities.toolName,
                                action: command.entities.actionName,
                                parameters: command.entities.parameters,
                                correlationId: `voice_${Date.now()}`,
                                userId: data.userId,
                                timestamp: new Date(),
                            };

                            const response = await this.mcpManager.executeTool(toolCall);
                            socket.emit('toolResult', { command, response });
                        }
                    } else {
                        socket.emit('commandNotRecognized', { text: data.text });
                    }
                } catch (error) {
                    console.error('Voice command error:', error);
                    socket.emit('voiceCommandError', { error: 'Failed to process voice command' });
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                const connection = this.connectedClients.get(socket.id);
                if (connection) {
                    console.log(`🔌 Client disconnected: ${connection.type} for user ${connection.userId}`);
                    this.connectedClients.delete(socket.id);

                    // Clean up voice sessions
                    for (const [sessionId, voiceSession] of this.voiceSessions.entries()) {
                        if (voiceSession.socketId === socket.id) {
                            this.azureOpenAI.endSession(voiceSession.azureSessionId);
                            this.voiceSessions.delete(sessionId);
                            console.log(`🛑 Cleaned up voice session: ${sessionId}`);
                        }
                    }
                }
            });
        });
    }

    /**
     * Handle AI audio response
     */
    private handleAIAudioResponse(response: any): void {
        // Broadcast audio response to appropriate voice session
        if (this.io) {
            this.io.to(`voice_${response.sessionId}`).emit('aiAudioResponse', {
                audioData: response.audioData,
                responseId: response.responseId,
                timestamp: Date.now(),
            });
        }
    }

    /**
     * Handle transcription completion
     */
    private handleTranscriptionCompleted(transcription: any): void {
        if (this.io) {
            this.io.emit('transcriptionCompleted', {
                text: transcription.text,
                itemId: transcription.itemId,
                timestamp: Date.now(),
            });
        }
    }

    /**
     * Handle MCP tool calls from Azure OpenAI
     */
    private async handleMCPToolCall(toolCall: any): Promise<void> {
        try {
            // Map Azure OpenAI function names to MCPManager tool names
            const toolNameMapping: Record<string, string> = {
                'glass_mcp_action': 'glass_mcp',
                'memorai_mcp_action': 'memorai_mcp',
                'playwright_mcp_action': 'playwright_mcp',
                'microsoft_docs_mcp_action': 'microsoft_docs_mcp'
            };

            const mappedToolName = toolNameMapping[toolCall.toolName] || toolCall.toolName;

            const mcpToolCall = {
                toolName: mappedToolName,
                action: toolCall.parameters.action || 'execute',
                parameters: toolCall.parameters.parameters || toolCall.parameters,
                correlationId: toolCall.correlationId,
                userId: 'voice_user', // TODO: Get from session context
                timestamp: new Date(),
            };

            console.log(`🔧 Processing MCP tool call: ${mappedToolName}:${mcpToolCall.action}`);

            // Execute tool through MCP Manager
            const response = await this.mcpManager.executeTool(mcpToolCall);

            // Send response back to Azure OpenAI
            if (response.success) {
                await this.azureOpenAI.sendMCPToolResponse(toolCall.correlationId, response.result);
                console.log(`✅ MCP tool executed successfully: ${mappedToolName}:${mcpToolCall.action}`);
            } else {
                await this.azureOpenAI.sendMCPToolResponse(toolCall.correlationId, { error: response.error });
                console.error(`❌ MCP tool execution failed: ${response.error}`);
            }

        } catch (error) {
            console.error('Error handling MCP tool call:', error);
            await this.azureOpenAI.sendMCPToolResponse(toolCall.correlationId, { error: 'Tool execution failed' });
        }
    }

    /**
     * Handle permission requests
     */
    private handlePermissionRequest(userId: string, permissionRequest: any): void {
        if (this.io) {
            this.io.to(`user_${userId}`).emit('permissionRequest', {
                request: permissionRequest,
                timestamp: Date.now(),
            });
        }
    }

    /**
     * Broadcast message to all clients
     */
    private broadcastToAll(event: string, data: any): void {
        if (this.io) {
            this.io.emit(event, data);
        }
    }

    /**
     * Broadcast message to user clients
     */
    private broadcastToUserClients(userId: string, event: string, data: any): void {
        if (this.io) {
            this.io.to(`user_${userId}`).emit(event, data);
        }
    }

    /**
     * Start the enhanced server
     */
    public async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const server = this.config.enableWebSocket ? this.server : this.app;

                server.listen(this.config.port, this.config.host, () => {
                    console.log(`🚀 Enhanced METU Backend Server started successfully!`);
                    console.log(`📡 HTTP Server: http://${this.config.host}:${this.config.port}`);

                    if (this.config.enableWebSocket) {
                        console.log(`🔌 WebSocket Server: ws://${this.config.host}:${this.config.port}`);
                    }

                    console.log(`🎤 Azure OpenAI: ${this.config.azure.endpoint} (${this.config.azure.deploymentName})`);
                    console.log(`🔧 MCP Tools: ${this.mcpManager.getAvailableTools('default').length} available`);
                    console.log(`🗄️ Database: LocalStorage-based (CND integration planned)`);
                    console.log(`🌐 CORS Origins: ${this.config.corsOrigins.join(', ')}`);

                    resolve();
                });
            } catch (error) {
                console.error('Failed to start enhanced server:', error);
                reject(error);
            }
        });
    }

    /**
     * Setup Phase 5 Advanced Features & Polish API routes
     */
    private setupPhase5Routes(): void {
        console.log('🌟 Setting up Phase 5 routes...');

        // Advanced Voice Features Routes
        this.app.get('/api/voice/languages', async (req: Request, res: Response) => {
            const status = this.advancedVoiceFeatures.getStatus();
            res.json({
                supportedLanguages: status.supportedLanguages,
                registeredCommands: status.registeredCommands,
                activeSessions: status.activeSessions
            });
        });

        this.app.post('/api/voice/session', async (req: Request, res: Response) => {
            try {
                const { userId, language } = req.body;
                const sessionId = await this.advancedVoiceFeatures.createSession(userId, language);
                res.json({ sessionId, success: true });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/voice/command', async (req: Request, res: Response) => {
            try {
                const { sessionId, transcript } = req.body;
                const result = await this.advancedVoiceFeatures.processVoiceCommand(sessionId, transcript);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/voice/macro', async (req: Request, res: Response) => {
            try {
                const { sessionId, name, commands } = req.body;
                const macro = await this.advancedVoiceFeatures.createMacro(sessionId, name, commands);
                res.json(macro);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        // System Integration Routes
        this.app.get('/api/system/status', async (req: Request, res: Response) => {
            const status = await this.systemIntegration.getSystemStatus();
            res.json(status);
        });

        this.app.post('/api/system/file', async (req: Request, res: Response) => {
            try {
                const operation = req.body;
                const result = await this.systemIntegration.executeFileOperation(operation);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/system/development', async (req: Request, res: Response) => {
            try {
                const action = req.body;
                const result = await this.systemIntegration.executeDevelopmentAction(action);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        // Testing & Quality Assurance Routes
        this.app.get('/api/testing/status', async (req: Request, res: Response) => {
            const status = this.finalPolishTesting.getStatus();
            res.json(status);
        });

        this.app.post('/api/testing/e2e', async (req: Request, res: Response) => {
            try {
                const results = await this.finalPolishTesting.runEndToEndTests();
                res.json(results);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/testing/performance', async (req: Request, res: Response) => {
            try {
                const results = await this.finalPolishTesting.runPerformanceBenchmarks();
                res.json(results);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/testing/security', async (req: Request, res: Response) => {
            try {
                const results = await this.finalPolishTesting.conductSecurityAudit();
                res.json(results);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/testing/uat', async (req: Request, res: Response) => {
            try {
                const { scenario, steps, expectedResult, tester } = req.body;
                const test = await this.finalPolishTesting.createUserAcceptanceTest(
                    scenario, steps, expectedResult, tester
                );
                res.json(test);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/testing/polish', async (req: Request, res: Response) => {
            try {
                const results = await this.finalPolishTesting.performFinalPolish();
                res.json(results);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.get('/api/testing/documentation', async (req: Request, res: Response) => {
            try {
                const docs = await this.finalPolishTesting.generateDocumentation();
                res.json(docs);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        console.log('✅ Phase 5 routes setup complete - 12 endpoints configured');
    }

    /**
     * Setup Phase 1 Enhanced Services API routes
     */
    private setupPhase1Routes(): void {
        console.log('🚀 Setting up Phase 1 Enhanced Services routes...');

        // Service Discovery Routes
        this.app.get('/api/discovery/services', async (req: Request, res: Response) => {
            try {
                const services = Array.from(this.serviceDiscovery.getDiscoveredServices().values());
                res.json({
                    discoveredServices: services,
                    isAdvertising: this.serviceDiscovery.getStatus().advertising,
                    isBrowsing: this.serviceDiscovery.getStatus().browsing
                });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/discovery/advertise', async (req: Request, res: Response) => {
            try {
                await this.serviceDiscovery.startAdvertising();
                res.json({ success: true, message: 'Service advertising started' });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.delete('/api/discovery/advertise', async (req: Request, res: Response) => {
            try {
                await this.serviceDiscovery.stopAdvertising();
                res.json({ success: true, message: 'Service advertising stopped' });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        // Enhanced Audio Device Management Routes
        this.app.get('/api/audio/devices', async (req: Request, res: Response) => {
            try {
                const devices = await this.audioDeviceManager.discoverDevices();
                const currentInput = this.audioDeviceManager.getCurrentInputDevice();
                const currentOutput = this.audioDeviceManager.getCurrentOutputDevice();

                res.json({
                    devices,
                    currentInput,
                    currentOutput,
                    isInitialized: this.audioDeviceManager.getStatus().isInitialized
                });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/audio/devices/input', async (req: Request, res: Response) => {
            try {
                const { deviceId } = req.body;
                await this.audioDeviceManager.selectInputDevice(deviceId);
                res.json({ success: true, selectedDevice: deviceId });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/audio/devices/output', async (req: Request, res: Response) => {
            try {
                const { deviceId } = req.body;
                await this.audioDeviceManager.selectOutputDevice(deviceId);
                res.json({ success: true, selectedDevice: deviceId });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.get('/api/audio/status', async (req: Request, res: Response) => {
            try {
                const status = this.audioDeviceManager.getStatus();
                res.json(status);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        // Enhanced Azure OpenAI Realtime Routes
        this.app.post('/api/voice/session/enhanced', async (req: Request, res: Response) => {
            try {
                const { userId, options = {} } = req.body;
                const sessionId = await this.enhancedAzureOpenAI.createSession(userId, options);
                res.json({ sessionId, success: true });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/voice/audio/send', async (req: Request, res: Response) => {
            try {
                const { sessionId, audioData } = req.body;
                const audioBuffer = Buffer.from(audioData, 'base64').buffer;
                await this.enhancedAzureOpenAI.sendAudio(sessionId, audioBuffer);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/voice/audio/commit', async (req: Request, res: Response) => {
            try {
                const { sessionId } = req.body;
                const response = await this.enhancedAzureOpenAI.commitAudio(sessionId);
                res.json(response);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.get('/api/voice/sessions/:sessionId/status', async (req: Request, res: Response) => {
            try {
                const { sessionId } = req.params;
                // Get all active sessions and find the specific one
                const activeSessions = this.enhancedAzureOpenAI.getActiveSessions();
                const session = activeSessions.find(s => s.id === sessionId);
                res.json(session || { error: 'Session not found' });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        // Enhanced CND Database Routes
        this.app.get('/api/db/user/:userId/profile', async (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const profile = await this.cndService.getUserProfile(userId);
                res.json(profile);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/db/user/profile', async (req: Request, res: Response) => {
            try {
                const userProfile = req.body;
                await this.cndService.saveUserProfile(userProfile);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.get('/api/db/conversations/:userId', async (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const conversations = await this.cndService.getUserConversations(userId);
                res.json(conversations);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.post('/api/db/conversation', async (req: Request, res: Response) => {
            try {
                const conversationData = req.body;
                await this.cndService.saveConversationHistory(conversationData);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        this.app.get('/api/db/mcp/usage/:userId', async (req: Request, res: Response) => {
            try {
                const { userId } = req.params;
                const usage = await this.cndService.getMCPUsageStats(userId);
                res.json(usage);
            } catch (error) {
                res.status(500).json({ error: (error as Error).message });
            }
        });

        console.log('✅ Phase 1 Enhanced Services routes setup complete - 15 endpoints configured');
    }

    /**
     * Stop the enhanced server
     */
    public async stop(): Promise<void> {
        return new Promise(async (resolve) => {
            // Disconnect Azure OpenAI
            await this.azureOpenAI.disconnect();

            // Close WebSocket connections
            if (this.io) {
                this.io.close();
            }

            // Close HTTP server
            const server = this.config.enableWebSocket ? this.server : this.app;
            if (server && server.close) {
                server.close(() => {
                    console.log('🛑 Enhanced METU Backend Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// Export enhanced server instance factory
export const createEnhancedMetuServer = (config?: Partial<EnhancedServerConfig>): EnhancedMetuBackendServer => {
    return new EnhancedMetuBackendServer(config);
};

export default EnhancedMetuBackendServer;
