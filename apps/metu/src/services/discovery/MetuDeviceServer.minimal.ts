/**
 * MINIMAL METU Device Server for Production Build
 * 
 * Simplified version with minimal TypeScript issues for production deployment
 */

import express, { Express, Request, Response } from 'express';
import { createServer, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { EventEmitter } from 'events';

export interface DeviceServerConfig {
    port: number;
    host: string;
    serviceName: string;
    serviceType: string;
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

export class MetuDeviceServer extends EventEmitter {
    private app: Express;
    private server: Server;
    private wsServer: WebSocketServer;
    private config: DeviceServerConfig;
    private isRunning: boolean = false;

    constructor(config: DeviceServerConfig) {
        super();
        this.config = config;
        this.app = express();
        this.server = createServer(this.app);
        this.wsServer = new WebSocketServer({ server: this.server });

        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }

    private setupMiddleware(): void {
        // CORS
        this.app.use(cors({
            origin: this.config.corsOrigins.includes('*') ? true : this.config.corsOrigins,
            credentials: true
        }));

        // JSON parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
    }

    private setupRoutes(): void {
        // Health check
        this.app.get('/api/health', (req: Request, res: Response) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        });

        // Audio devices
        this.app.get('/api/audio/devices', (req: Request, res: Response) => {
            res.json({ devices: [] });
        });

        // Device info
        this.app.get('/api/device/info', (req: Request, res: Response) => {
            res.json({
                id: 'metu-device-minimal',
                name: 'METU Device Server',
                type: 'metu-device',
                version: '1.0.0',
                capabilities: {
                    audio: { input: true, output: true, realtime: true },
                    automation: { windowControl: false },
                    database: { enabled: false }
                }
            });
        });

        // Placeholder endpoints for compatibility
        const endpoints = [
            '/api/audio/start',
            '/api/audio/stop',
            '/api/mcp/windows',
            '/api/mcp/automation',
            '/api/database/devices',
            '/api/database/conversations'
        ];

        endpoints.forEach(endpoint => {
            this.app.post(endpoint, (req: Request, res: Response) => {
                res.json({ success: true, message: 'Minimal implementation' });
            });

            this.app.get(endpoint, (req: Request, res: Response) => {
                res.json({ success: true, data: [], message: 'Minimal implementation' });
            });
        });

        // Catch all
        this.app.use('*', (req: Request, res: Response) => {
            res.status(404).json({ error: 'Endpoint not found' });
        });
    }

    private setupWebSocket(): void {
        this.wsServer.on('connection', (ws: WebSocket) => {
            console.log('WebSocket connection established');

            ws.on('message', (data: any) => {
                try {
                    const message = JSON.parse(data.toString());
                    ws.send(JSON.stringify({
                        type: 'ack',
                        requestId: message.requestId || 'unknown',
                        success: true
                    }));
                } catch (error) {
                    ws.send(JSON.stringify({ error: 'Invalid message format' }));
                }
            });

            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });
        });
    }

    async start(): Promise<void> {
        if (this.isRunning) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.server.listen(this.config.port, this.config.host, () => {
                this.isRunning = true;
                console.log(`✅ METU Device Server (Minimal) started on ${this.config.host}:${this.config.port}`);
                resolve();
            });

            this.server.on('error', (error: any) => {
                reject(error);
            });
        });
    }

    async stop(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        return new Promise((resolve) => {
            this.server.close(() => {
                this.isRunning = false;
                console.log('🔌 METU Device Server stopped');
                resolve();
            });
        });
    }

    isHealthy(): boolean {
        return this.isRunning;
    }

    getStatus(): any {
        return {
            running: this.isRunning,
            connections: 0,
            uptime: 0
        };
    }

    getConnections(): any[] {
        return [];
    }

    broadcastToClients(message: any): void {
        // Minimal implementation
    }
}
