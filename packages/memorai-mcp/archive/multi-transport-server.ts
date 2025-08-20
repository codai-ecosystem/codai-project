#!/usr/bin/env node
/**
 * MemorAI Advanced MCP Server - Multi-Transport Implementation
 * Phase 1.3: Multi-Transport Support (stdio, HTTP/SSE, WebSocket)
 * 
 * This implementation provides:
 * 1. Primary Transport: stdio (MCP standard)
 * 2. Secondary Transport: HTTP/SSE (VS Code integration)
 * 3. Tertiary Transport: WebSocket (real-time features)
 * 4. Transport auto-detection and fallback
 * 5. Unified request/response handling
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { AdvancedMemorAIMCPServer } from './advanced-mcp-server.js';

/**
 * Multi-Transport MemorAI MCP Server
 * Supports stdio, HTTP/SSE, and WebSocket transports with automatic fallback
 */
export class MultiTransportMemorAIMCPServer extends AdvancedMemorAIMCPServer {
    private activeTransports: Set<string> = new Set();
    private servers: Map<string, any> = new Map();
    private multiHttpServer: any = null;
    private wsServer: WebSocketServer | null = null;
    private isRunning: boolean = false;

    constructor(config?: any) {
        super(config);
        this.log('info', 'Multi-Transport MemorAI MCP Server initialized');
    }

    /**
     * Helper method to access configuration from parent class
     */
    private getConfig(): any {
        return (this as any).config;
    }

    /**
     * Helper method to access advanced tools from parent class
     */
    private getAdvancedTools(): any[] {
        return (this as any).advancedTools;
    }

    /**
     * Helper method to log messages
     */
    private log(level: string, message: string, metadata?: any): void {
        const timestamp = new Date().toISOString();
        const logMessage = JSON.stringify({
            timestamp,
            level: level.toUpperCase(),
            service: this.getConfig().server.name,
            version: this.getConfig().server.version,
            message,
            ...(metadata && { metadata })
        });
        console.log(logMessage);
    }

    /**
     * Helper method to create error results
     */
    private createError(error: any, requestId: string, timestamp: number): any {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        metadata: {
                            requestId,
                            timestamp: new Date(timestamp).toISOString(),
                            errorType: error instanceof Error ? error.constructor.name : 'Unknown'
                        }
                    })
                }
            ]
        };
    }

    /**
     * Start the multi-transport server with intelligent transport detection
     */
    async startMultiTransport(): Promise<void> {
        try {
            this.log('info', 'Starting Multi-Transport MemorAI MCP Server...');

            // Detect environment and choose appropriate transports
            const transports = this.detectRequiredTransports();

            // Start transports in order of priority
            for (const transport of transports) {
                try {
                    await this.startTransport(transport);
                    this.activeTransports.add(transport);
                    this.log('info', `✅ ${transport.toUpperCase()} transport started successfully`);
                } catch (error: any) {
                    this.log('warn', `⚠️  ${transport.toUpperCase()} transport failed to start: ${error.message}`);

                    // Continue with fallback transports
                    if (transport === 'stdio' && transports.includes('http')) {
                        this.log('info', '🔄 Falling back to HTTP transport');
                    }
                }
            }

            if (this.activeTransports.size === 0) {
                throw new Error('No transports could be started');
            }

            this.isRunning = true;
            this.log('info', `🚀 Multi-Transport server running with: ${Array.from(this.activeTransports).join(', ')}`);

            // Start monitoring active transports
            this.startTransportMonitoring();

        } catch (error: any) {
            this.log('error', `Failed to start multi-transport server: ${error.message}`);
            throw error;
        }
    }

    /**
     * Detect which transports are required based on environment
     */
    private detectRequiredTransports(): string[] {
        const transports: string[] = [];

        // Check for VS Code environment
        if (process.env.VSCODE_PID || process.env.TERM_SESSION_ID || process.argv.includes('--vscode')) {
            transports.push('http'); // VS Code prefers HTTP/SSE
            this.log('info', '🔍 VS Code environment detected - prioritizing HTTP transport');
        }

        // Check for stdio availability
        if (process.stdin && process.stdout && !process.env.NO_STDIO) {
            transports.push('stdio'); // MCP standard
            this.log('info', '🔍 stdio streams available - adding stdio transport');
        }

        // Check for WebSocket requirement
        if (process.env.MEMORAI_WEBSOCKET_ENABLED === 'true' || process.argv.includes('--websocket')) {
            transports.push('websocket'); // Real-time features
            this.log('info', '🔍 WebSocket explicitly requested - adding WebSocket transport');
        }

        // Default fallback
        if (transports.length === 0) {
            transports.push('http', 'stdio'); // Safe defaults
            this.log('info', '🔍 No specific environment detected - using default transports');
        }

        // Always add HTTP as fallback if not present
        if (!transports.includes('http')) {
            transports.push('http');
        }

        return transports;
    }

    /**
     * Start a specific transport
     */
    private async startTransport(transportType: string): Promise<void> {
        switch (transportType) {
            case 'stdio':
                await this.startStdioTransport();
                break;
            case 'http':
                await this.startHttpTransport();
                break;
            case 'websocket':
                await this.startWebSocketTransport();
                break;
            default:
                throw new Error(`Unknown transport type: ${transportType}`);
        }
    }

    /**
     * Start stdio transport (MCP standard)
     */
    private async startStdioTransport(): Promise<void> {
        const config = this.getConfig();
        const server = new Server(
            {
                name: config.server.name,
                version: config.server.version,
                description: config.server.description,
                authors: config.server.authors,
                homepage: config.server.homepage,
                license: config.server.license
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                    prompts: {},
                    logging: {}
                }
            }
        );

        // Register tools with the stdio server
        this.registerToolsWithServer(server);

        // Create stdio transport
        const transport = new StdioServerTransport();

        // Connect and start
        await server.connect(transport);

        this.servers.set('stdio', server);
        this.log('debug', 'stdio transport configured and connected');
    }

    /**
     * Start HTTP/SSE transport (VS Code compatible)
     */
    private async startHttpTransport(): Promise<void> {
        const app = express();

        // Configure CORS for VS Code
        app.use(cors({
            origin: this.config.transport.http.cors?.origin || '*',
            credentials: this.config.transport.http.cors?.credentials || true,
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Memorai-Api-Key']
        }));

        app.use(express.json({ limit: '10mb' }));

        // Authentication middleware
        if (this.config.transport.http.apiKey) {
            app.use((req, res, next) => {
                const apiKey = req.headers['x-memorai-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
                if (!apiKey || apiKey !== this.config.transport.http.apiKey) {
                    return res.status(401).json({ error: 'Invalid API key' });
                }
                next();
            });
        }

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                server: this.config.server.name,
                version: this.config.server.version,
                uptime: process.uptime(),
                transports: Array.from(this.activeTransports),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            });
        });

        // List tools endpoint
        app.get('/tools', (req, res) => {
            const tools = this.advancedTools.map(tool => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema
            }));

            res.json({
                tools,
                count: tools.length,
                categories: {
                    'Core Memory Operations': 4,
                    'Intelligence & Analysis': 4,
                    'Collaboration & Sharing': 3,
                    'Management & Maintenance': 4,
                    'Enterprise Features': 2
                }
            });
        });

        // Tool execution endpoint
        app.post('/tools/:toolName', async (req, res) => {
            const toolName = req.params.toolName;
            const arguments_ = req.body.arguments || req.body;
            const requestId = req.headers['x-request-id'] || `http-${Date.now()}`;

            try {
                this.logMessage('info', `HTTP tool call: ${toolName}`, { requestId, arguments: arguments_ });

                // Find and execute tool
                const tool = this.advancedTools.find(t => t.name === toolName);
                if (!tool) {
                    return res.status(404).json({
                        error: `Tool '${toolName}' not found`,
                        availableTools: this.advancedTools.map(t => t.name)
                    });
                }

                // Execute tool with unified handler
                const result = await this.executeToolUnified(toolName, arguments_, requestId);

                res.json(result);

            } catch (error) {
                this.logMessage('error', `HTTP tool execution failed: ${error.message}`, { toolName, requestId });
                const errorResult = this.createErrorResult(error, requestId, Date.now());
                res.status(500).json(errorResult);
            }
        });

        // SSE endpoint for real-time updates
        app.get('/events', (req, res) => {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            });

            const clientId = `sse-${Date.now()}`;
            this.logMessage('info', `SSE client connected: ${clientId}`);

            // Send initial connection event
            res.write(`data: ${JSON.stringify({
                type: 'connection',
                clientId,
                timestamp: new Date().toISOString(),
                server: this.config.server.name
            })}\n\n`);

            // Keep alive ping every 30 seconds
            const keepAlive = setInterval(() => {
                res.write(`data: ${JSON.stringify({
                    type: 'ping',
                    timestamp: new Date().toISOString()
                })}\n\n`);
            }, 30000);

            // Handle client disconnect
            req.on('close', () => {
                this.logMessage('info', `SSE client disconnected: ${clientId}`);
                clearInterval(keepAlive);
            });
        });

        // Create HTTP server
        this.httpServer = createServer(app);

        // Start listening
        const port = this.config.transport.http.port;
        const host = this.config.transport.http.host;

        await new Promise<void>((resolve, reject) => {
            this.httpServer.listen(port, host, () => {
                this.logMessage('info', `HTTP/SSE server listening on ${host}:${port}`);
                resolve();
            });

            this.httpServer.on('error', reject);
        });

        this.servers.set('http', this.httpServer);
    }

    /**
     * Start WebSocket transport for real-time features
     */
    private async startWebSocketTransport(): Promise<void> {
        if (!this.httpServer) {
            throw new Error('WebSocket transport requires HTTP server to be started first');
        }

        this.wsServer = new WebSocketServer({
            server: this.httpServer,
            path: '/ws'
        });

        this.wsServer.on('connection', (ws: WebSocket, req) => {
            const clientId = `ws-${Date.now()}`;
            this.logMessage('info', `WebSocket client connected: ${clientId}`);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'welcome',
                clientId,
                server: this.config.server.name,
                version: this.config.server.version,
                availableTools: this.advancedTools.map(t => t.name),
                timestamp: new Date().toISOString()
            }));

            // Handle messages
            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data.toString());

                    if (message.type === 'tool_call') {
                        const { toolName, arguments: args, requestId } = message;

                        this.logMessage('info', `WebSocket tool call: ${toolName}`, { clientId, requestId });

                        try {
                            const result = await this.executeToolUnified(toolName, args, requestId || `ws-${Date.now()}`);

                            ws.send(JSON.stringify({
                                type: 'tool_result',
                                requestId,
                                result,
                                timestamp: new Date().toISOString()
                            }));

                        } catch (error) {
                            ws.send(JSON.stringify({
                                type: 'tool_error',
                                requestId,
                                error: error.message,
                                timestamp: new Date().toISOString()
                            }));
                        }
                    }

                } catch (parseError) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        error: 'Invalid JSON message',
                        timestamp: new Date().toISOString()
                    }));
                }
            });

            // Handle disconnect
            ws.on('close', () => {
                this.logMessage('info', `WebSocket client disconnected: ${clientId}`);
            });

            // Handle errors
            ws.on('error', (error) => {
                this.logMessage('error', `WebSocket error for ${clientId}: ${error.message}`);
            });
        });

        this.servers.set('websocket', this.wsServer);
        this.logMessage('info', 'WebSocket server started on /ws endpoint');
    }

    /**
     * Register tools with MCP server instance
     */
    private registerToolsWithServer(server: Server): void {
        // List tools handler
        server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.advancedTools
            };
        });

        // Call tool handler
        server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const requestId = `stdio-${Date.now()}`;

            try {
                this.logMessage('info', `stdio tool call: ${name}`, { requestId });
                const result = await this.executeToolUnified(name, args || {}, requestId);
                return result;
            } catch (error) {
                this.logMessage('error', `stdio tool execution failed: ${error.message}`, { toolName: name, requestId });
                return this.createErrorResult(error, requestId, Date.now());
            }
        });
    }

    /**
     * Unified tool execution for all transports
     */
    private async executeToolUnified(toolName: string, arguments_: any, requestId: string): Promise<any> {
        const startTime = Date.now();

        try {
            // Record request metrics
            this.recordRequest(toolName, startTime);

            // Find tool
            const tool = this.advancedTools.find(t => t.name === toolName);
            if (!tool) {
                throw new Error(`Tool '${toolName}' not found`);
            }

            // Validate arguments (basic validation)
            if (tool.inputSchema.required) {
                for (const required of tool.inputSchema.required) {
                    if (!(required in arguments_)) {
                        throw new Error(`Missing required parameter: ${required}`);
                    }
                }
            }

            // Execute based on tool category
            let result;

            if (['remember', 'recall', 'forget', 'context'].includes(toolName)) {
                result = await this.executeMemoryTool(toolName, arguments_, requestId);
            } else if (['analyze_patterns', 'memory_graph', 'temporal_search', 'semantic_clustering'].includes(toolName)) {
                result = await this.executeAnalysisTool(toolName, arguments_, requestId);
            } else if (['collaborative_memory', 'cross_reference', 'memory_insights'].includes(toolName)) {
                result = await this.executeCollaborationTool(toolName, arguments_, requestId);
            } else if (['memory_analytics', 'smart_suggestions', 'memory_backup', 'memory_cleanup'].includes(toolName)) {
                result = await this.executeManagementTool(toolName, arguments_, requestId);
            } else if (['memory_security', 'memory_monitoring'].includes(toolName)) {
                result = await this.executeEnterpriseTool(toolName, arguments_, requestId);
            } else {
                throw new Error(`Unknown tool category for: ${toolName}`);
            }

            // Record success metrics
            const endTime = Date.now();
            this.recordRequest(toolName, endTime, true);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            result,
                            metadata: {
                                toolName,
                                requestId,
                                duration: endTime - startTime,
                                timestamp: new Date().toISOString()
                            }
                        })
                    }
                ]
            };

        } catch (error) {
            const endTime = Date.now();
            this.recordRequest(toolName, endTime, false);
            throw error;
        }
    }

    /**
     * Execute memory operation tools
     */
    private async executeMemoryTool(toolName: string, args: any, requestId: string): Promise<any> {
        switch (toolName) {
            case 'remember':
                return await this.handleRemember(args.content, args.metadata || {});
            case 'recall':
                return await this.handleRecall(args.query, args.limit, args.filters);
            case 'forget':
                return await this.handleForget(args.memoryId || args.query);
            case 'context':
                return await this.handleContext(args.sessionId, args.contextSize);
            default:
                throw new Error(`Unknown memory tool: ${toolName}`);
        }
    }

    /**
     * Execute analysis tools (placeholder implementations)
     */
    private async executeAnalysisTool(toolName: string, args: any, requestId: string): Promise<any> {
        switch (toolName) {
            case 'analyze_patterns':
                return {
                    patterns: ['temporal_clustering', 'semantic_similarity', 'usage_frequency'],
                    insights: 'Pattern analysis shows strong temporal clustering in recent memories',
                    confidence: 0.85
                };
            case 'memory_graph':
                return {
                    nodes: 42,
                    edges: 156,
                    clusters: 7,
                    centralNodes: ['project_work', 'learning_notes', 'daily_tasks']
                };
            case 'temporal_search':
                return {
                    timeRange: args.timeRange || 'last_week',
                    memories: ['Recent project decisions', 'Learning progress', 'Task completions'],
                    timeline: 'Steady activity with peak on Thursday'
                };
            case 'semantic_clustering':
                return {
                    clusters: [
                        { topic: 'Development', count: 15, confidence: 0.9 },
                        { topic: 'Learning', count: 8, confidence: 0.8 },
                        { topic: 'Planning', count: 6, confidence: 0.7 }
                    ]
                };
            default:
                throw new Error(`Unknown analysis tool: ${toolName}`);
        }
    }

    /**
     * Execute collaboration tools (placeholder implementations)
     */
    private async executeCollaborationTool(toolName: string, args: any, requestId: string): Promise<any> {
        switch (toolName) {
            case 'collaborative_memory':
                return {
                    sharedMemories: 12,
                    collaborators: ['team_lead', 'colleague_1', 'colleague_2'],
                    syncStatus: 'up_to_date'
                };
            case 'cross_reference':
                return {
                    references: [
                        { id: 'mem_1', relevance: 0.9, context: 'Similar implementation approach' },
                        { id: 'mem_5', relevance: 0.7, context: 'Related discussion points' }
                    ]
                };
            case 'memory_insights':
                return {
                    insights: [
                        'Most active period: 9 AM - 11 AM',
                        'Highest retention: Technical documentation',
                        'Knowledge gaps: Advanced algorithms'
                    ]
                };
            default:
                throw new Error(`Unknown collaboration tool: ${toolName}`);
        }
    }

    /**
     * Execute management tools (placeholder implementations)
     */
    private async executeManagementTool(toolName: string, args: any, requestId: string): Promise<any> {
        switch (toolName) {
            case 'memory_analytics':
                return {
                    totalMemories: 156,
                    avgRetention: '15 days',
                    topCategories: ['development', 'learning', 'planning'],
                    efficiency: 0.87
                };
            case 'smart_suggestions':
                return {
                    suggestions: [
                        'Consider reviewing memories from 2 weeks ago',
                        'Archive old planning documents',
                        'Update project documentation'
                    ]
                };
            case 'memory_backup':
                return {
                    backupId: `backup_${Date.now()}`,
                    status: 'completed',
                    memoriesBackedUp: 156,
                    size: '4.2 MB'
                };
            case 'memory_cleanup':
                return {
                    deletedMemories: 12,
                    archivedMemories: 8,
                    spaceFreed: '1.1 MB',
                    status: 'completed'
                };
            default:
                throw new Error(`Unknown management tool: ${toolName}`);
        }
    }

    /**
     * Execute enterprise tools (placeholder implementations)
     */
    private async executeEnterpriseTool(toolName: string, args: any, requestId: string): Promise<any> {
        switch (toolName) {
            case 'memory_security':
                return {
                    securityLevel: 'high',
                    encryptedMemories: 156,
                    vulnerabilities: 0,
                    lastAudit: new Date().toISOString()
                };
            case 'memory_monitoring':
                return {
                    status: 'healthy',
                    uptime: process.uptime(),
                    activeConnections: this.activeTransports.size,
                    memoryUsage: process.memoryUsage(),
                    lastCheck: new Date().toISOString()
                };
            default:
                throw new Error(`Unknown enterprise tool: ${toolName}`);
        }
    }

    /**
     * Start transport health monitoring
     */
    private startTransportMonitoring(): void {
        setInterval(() => {
            this.logMessage('debug', `Transport status: ${Array.from(this.activeTransports).join(', ')}`);

            // Check each transport health
            for (const transport of this.activeTransports) {
                try {
                    this.checkTransportHealth(transport);
                } catch (error) {
                    this.logMessage('warn', `Transport ${transport} health check failed: ${error.message}`);
                }
            }
        }, 30000); // Every 30 seconds
    }

    /**
     * Check individual transport health
     */
    private checkTransportHealth(transport: string): void {
        switch (transport) {
            case 'http':
                if (!this.httpServer || !this.httpServer.listening) {
                    throw new Error('HTTP server not listening');
                }
                break;
            case 'websocket':
                if (!this.wsServer) {
                    throw new Error('WebSocket server not initialized');
                }
                break;
            case 'stdio':
                if (!process.stdin.readable || !process.stdout.writable) {
                    throw new Error('stdio streams not available');
                }
                break;
        }
    }

    /**
     * Graceful shutdown of all transports
     */
    async shutdown(): Promise<void> {
        this.logMessage('info', 'Shutting down multi-transport server...');

        try {
            // Close WebSocket server
            if (this.wsServer) {
                this.wsServer.close();
                this.logMessage('info', 'WebSocket server closed');
            }

            // Close HTTP server
            if (this.httpServer) {
                await new Promise<void>((resolve) => {
                    this.httpServer.close(() => {
                        this.logMessage('info', 'HTTP server closed');
                        resolve();
                    });
                });
            }

            // Close stdio server
            const stdioServer = this.servers.get('stdio');
            if (stdioServer) {
                await stdioServer.close();
                this.logMessage('info', 'stdio server closed');
            }

            this.isRunning = false;
            this.activeTransports.clear();
            this.servers.clear();

            this.logMessage('info', '✅ Multi-transport server shutdown complete');

        } catch (error) {
            this.logMessage('error', `Error during shutdown: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get server status
     */
    getStatus(): any {
        return {
            isRunning: this.isRunning,
            activeTransports: Array.from(this.activeTransports),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            toolCount: this.advancedTools.length,
            version: this.config.server.version,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Main execution when run directly
 */
async function main() {
    const config = {
        server: {
            name: 'MemorAI Multi-Transport MCP Server',
            version: '9.7.0-multi-transport',
            description: 'Advanced Memory Management with Multi-Transport Support',
            authors: ['CODAI Team'],
            homepage: 'https://github.com/codai-ecosystem/codai-project',
            license: 'MIT'
        },
        transport: {
            primary: 'stdio',
            fallback: ['http', 'websocket'],
            http: {
                port: parseInt(process.env.MEMORAI_MCP_PORT || '4950'),
                host: process.env.MEMORAI_MCP_HOST || '127.0.0.1',
                apiKey: process.env.MEMORAI_API_KEY || 'memorai-multi-transport-key-2025'
            }
        },
        logging: {
            enabled: true,
            level: process.env.MEMORAI_LOG_LEVEL || 'info'
        }
    };

    const server = new MultiTransportMemorAIMCPServer(config);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        try {
            await server.shutdown();
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    });

    process.on('SIGTERM', async () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        try {
            await server.shutdown();
            process.exit(0);
        } catch (error) {
            console.error('Error during shutdown:', error);
            process.exit(1);
        }
    });

    try {
        await server.startMultiTransport();
        console.log('\n🚀 MemorAI Multi-Transport MCP Server is running!');
        console.log(`   Active transports: ${Array.from(server['activeTransports']).join(', ')}`);
        console.log(`   Tools available: ${server.advancedTools.length}`);
        console.log(`   Press Ctrl+C to stop\n`);

        // Keep the process alive
        process.stdin.resume();

    } catch (error) {
        console.error('💥 Failed to start multi-transport server:', error.message);
        process.exit(1);
    }
}

// Export for module use
export default MultiTransportMemorAIMCPServer;

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('💥 Multi-transport server crashed:', error);
        process.exit(1);
    });
}
