#!/usr/bin/env node

/**
 * Memorai MCP HTTP Server
 * Clean, working implementation
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

class MemoraiHttpMcpServer {
    private app: express.Application;
    private httpServer: any;
    private wsServer: WebSocketServer;
    private port: number;
    private memoryStore = new Map<string, Map<string, any>>();

    constructor(port: number = 8002) {
        this.port = port;
        this.app = express();
        this.httpServer = createServer(this.app);
        this.wsServer = new WebSocketServer({ server: this.httpServer });

        this.setupRoutes();
        this.setupWebSocket();
    }

    private setupRoutes(): void {
        this.app.use(express.json());

        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'memorai-mcp',
                version: '7.0.2',
                timestamp: new Date().toISOString()
            });
        });
    }

    private setupWebSocket(): void {
        this.wsServer.on('connection', (ws) => {
            console.log('WebSocket connection established');

            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });
        });
    }

    async start(): Promise<void> {
        return new Promise((resolve) => {
            this.httpServer.listen(this.port, () => {
                console.log(`Memorai MCP HTTP Server running on port ${this.port}`);
                resolve();
            });
        });
    }

    async stop(): Promise<void> {
        this.wsServer.close();
        this.httpServer.close();
        console.log('Memorai MCP HTTP Server stopped');
    }
}

export default MemoraiHttpMcpServer;

if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new MemoraiHttpMcpServer();
    server.start().catch(console.error);

    process.on('SIGINT', async () => {
        console.log('Shutting down...');
        await server.stop();
        process.exit(0);
    });
}
