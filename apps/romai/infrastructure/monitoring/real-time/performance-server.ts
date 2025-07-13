/**
 * ROMAI Performance Optimization Server
 * Day 20: Advanced Performance Monitoring and Auto-Optimization
 * 
 * Integrates with enhanced analytics for real-time performance optimization
 */

import WebSocket from 'ws';
import { createServer } from 'http';
import { PerformanceOptimizer } from './performance-optimizer';

interface ClientConnection {
    id: string;
    ws: WebSocket;
    subscriptions: {
        performance?: boolean;
        optimizations?: boolean;
        trends?: boolean;
        reports?: boolean;
    };
    lastSeen: Date;
}

class PerformanceOptimizationServer {
    private server: WebSocket.Server;
    private httpServer: any;
    private clients: Map<string, ClientConnection> = new Map();
    private optimizer: PerformanceOptimizer;
    private port: number;
    private running: boolean = false;

    constructor(port: number = 8767) {
        this.port = port;

        // Create HTTP server for WebSocket upgrade
        this.httpServer = createServer();

        // Create WebSocket server
        this.server = new WebSocket.Server({
            server: this.httpServer,
            path: '/performance'
        });

        // Initialize performance optimizer
        this.optimizer = new PerformanceOptimizer({
            cpu: { maxUsage: 75, scaleThreshold: 85, cooldownPeriod: 300 },
            memory: { maxUsage: 80, gcThreshold: 90, leakDetection: true },
            network: { maxLatency: 150, compressionEnabled: true, keepAliveTimeout: 30000 },
            application: { maxResponseTime: 250, maxConcurrency: 500, autoscaling: true }
        });

        this.setupWebSocketHandlers();
        this.setupOptimizerEvents();
    }

    private setupWebSocketHandlers(): void {
        this.server.on('connection', (ws: WebSocket) => {
            const clientId = this.generateClientId();
            const client: ClientConnection = {
                id: clientId,
                ws,
                subscriptions: {},
                lastSeen: new Date()
            };

            this.clients.set(clientId, client);
            console.log(`🔌 Performance client connected: ${clientId} (${this.clients.size} total)`);

            // Send welcome message
            this.sendToClient(client, {
                type: 'connection_established',
                message: 'Connected to ROMAI Performance Optimization Server',
                timestamp: new Date().toISOString(),
                client_id: clientId,
                capabilities: [
                    'performance_monitoring',
                    'auto_optimization',
                    'trend_analysis',
                    'bottleneck_detection',
                    'performance_reports'
                ],
                client_count: this.clients.size
            });

            // Handle messages
            ws.on('message', (data: WebSocket.RawData) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleClientMessage(client, message);
                } catch (error) {
                    console.error('Invalid message received:', error);
                    this.sendToClient(client, {
                        type: 'error',
                        message: 'Invalid JSON message format',
                        timestamp: new Date().toISOString()
                    });
                }
            });

            // Handle client disconnect
            ws.on('close', () => {
                this.clients.delete(clientId);
                console.log(`🔌 Performance client disconnected: ${clientId} (${this.clients.size} remaining)`);
            });

            // Handle errors
            ws.on('error', (error) => {
                console.error(`WebSocket error for client ${clientId}:`, error);
                this.clients.delete(clientId);
            });
        });
    }

    private setupOptimizerEvents(): void {
        // Performance metrics
        this.optimizer.on('metrics', (metrics) => {
            this.broadcastToSubscribers('performance', {
                type: 'performance_metrics',
                data: metrics,
                timestamp: new Date().toISOString(),
                id: this.generateMessageId()
            });
        });

        // Bottlenecks detected
        this.optimizer.on('bottlenecks', (reports) => {
            this.broadcastToSubscribers('performance', {
                type: 'bottlenecks_detected',
                data: reports,
                timestamp: new Date().toISOString(),
                id: this.generateMessageId(),
                severity: reports.reduce((max: string, r: any) =>
                    r.severity === 'critical' ? 'critical' :
                        max === 'critical' ? 'critical' :
                            r.severity === 'high' ? 'high' : max, 'low')
            });
        });

        // Optimization completed
        this.optimizer.on('optimization-completed', (result) => {
            this.broadcastToSubscribers('optimizations', {
                type: 'optimization_completed',
                data: result,
                timestamp: new Date().toISOString(),
                id: this.generateMessageId()
            });
        });

        // Optimization failed
        this.optimizer.on('optimization-failed', (result) => {
            this.broadcastToSubscribers('optimizations', {
                type: 'optimization_failed',
                data: result,
                timestamp: new Date().toISOString(),
                id: this.generateMessageId()
            });
        });

        // Performance trends
        this.optimizer.on('performance-trends', (trends) => {
            this.broadcastToSubscribers('trends', {
                type: 'performance_trends',
                data: trends,
                timestamp: new Date().toISOString(),
                id: this.generateMessageId()
            });
        });

        // Optimizer started/stopped
        this.optimizer.on('started', () => {
            this.broadcastToAll({
                type: 'optimizer_started',
                message: 'Performance optimizer is now active',
                timestamp: new Date().toISOString()
            });
        });

        this.optimizer.on('stopped', () => {
            this.broadcastToAll({
                type: 'optimizer_stopped',
                message: 'Performance optimizer has been stopped',
                timestamp: new Date().toISOString()
            });
        });
    }

    private handleClientMessage(client: ClientConnection, message: any): void {
        client.lastSeen = new Date();

        switch (message.type) {
            case 'ping':
                this.sendToClient(client, {
                    type: 'pong',
                    timestamp: new Date().toISOString(),
                    server_time: Date.now()
                });
                break;

            case 'subscribe':
                if (message.subscriptions) {
                    client.subscriptions = { ...client.subscriptions, ...message.subscriptions };
                    this.sendToClient(client, {
                        type: 'subscription_confirmed',
                        subscriptions: client.subscriptions,
                        timestamp: new Date().toISOString(),
                        message: 'Performance subscriptions updated'
                    });
                }
                break;

            case 'get_performance_report':
                const report = this.optimizer.getReport();
                this.sendToClient(client, {
                    type: 'performance_report',
                    data: report,
                    timestamp: new Date().toISOString(),
                    id: this.generateMessageId()
                });
                break;

            case 'get_configuration':
                const config = this.optimizer.getConfiguration();
                this.sendToClient(client, {
                    type: 'optimizer_configuration',
                    data: config,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'update_configuration':
                if (message.config) {
                    this.optimizer.updateConfiguration(message.config);
                    this.sendToClient(client, {
                        type: 'configuration_updated',
                        data: this.optimizer.getConfiguration(),
                        timestamp: new Date().toISOString(),
                        message: 'Configuration updated successfully'
                    });
                }
                break;

            case 'force_optimization':
                if (message.target && ['cpu', 'memory', 'network', 'application'].includes(message.target)) {
                    this.optimizer.forceOptimization(message.target);
                    this.sendToClient(client, {
                        type: 'optimization_triggered',
                        target: message.target,
                        timestamp: new Date().toISOString(),
                        message: `Forced optimization triggered for ${message.target}`
                    });
                } else {
                    this.sendToClient(client, {
                        type: 'error',
                        message: 'Invalid optimization target. Use: cpu, memory, network, application',
                        timestamp: new Date().toISOString()
                    });
                }
                break;

            case 'trigger_gc':
                this.optimizer.triggerGarbageCollection();
                this.sendToClient(client, {
                    type: 'gc_triggered',
                    timestamp: new Date().toISOString(),
                    message: 'Garbage collection triggered'
                });
                break;

            case 'get_status':
                this.sendToClient(client, {
                    type: 'server_status',
                    data: {
                        running: this.running,
                        optimizer_running: this.optimizer.isRunning(),
                        connected_clients: this.clients.size,
                        uptime: process.uptime(),
                        memory_usage: process.memoryUsage(),
                        server_version: '1.0.0'
                    },
                    timestamp: new Date().toISOString()
                });
                break;

            default:
                this.sendToClient(client, {
                    type: 'error',
                    message: `Unknown message type: ${message.type}`,
                    timestamp: new Date().toISOString()
                });
        }
    }

    private sendToClient(client: ClientConnection, message: any): void {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    }

    private broadcastToSubscribers(subscription: keyof ClientConnection['subscriptions'], message: any): void {
        for (const client of this.clients.values()) {
            if (client.subscriptions[subscription] && client.ws.readyState === WebSocket.OPEN) {
                this.sendToClient(client, message);
            }
        }
    }

    private broadcastToAll(message: any): void {
        for (const client of this.clients.values()) {
            if (client.ws.readyState === WebSocket.OPEN) {
                this.sendToClient(client, message);
            }
        }
    }

    private generateClientId(): string {
        return `perf_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateMessageId(): string {
        return `msg_${Math.random().toString(36).substr(2, 8)}`;
    }

    public start(): void {
        if (this.running) {
            console.log('⚠️ Performance server already running');
            return;
        }

        this.httpServer.listen(this.port, () => {
            console.log(`🚀 ROMAI Performance Optimization Server started on port ${this.port}`);
            console.log(`📊 WebSocket endpoint: ws://localhost:${this.port}/performance`);
            console.log(`🔧 Auto-optimization enabled with intelligent thresholds`);

            this.running = true;

            // Start the performance optimizer
            this.optimizer.start();

            // Send periodic status updates
            setInterval(() => {
                this.broadcastToAll({
                    type: 'server_heartbeat',
                    timestamp: new Date().toISOString(),
                    clients: this.clients.size,
                    uptime: process.uptime()
                });
            }, 30000); // Every 30 seconds
        });
    }

    public stop(): void {
        if (!this.running) return;

        console.log('🛑 Stopping Performance Optimization Server...');

        // Stop optimizer
        this.optimizer.stop();

        // Close all client connections
        for (const client of this.clients.values()) {
            client.ws.close();
        }
        this.clients.clear();

        // Close servers
        this.server.close();
        this.httpServer.close();

        this.running = false;
        console.log('✅ Performance Optimization Server stopped');
    }

    public getStats(): any {
        return {
            running: this.running,
            port: this.port,
            clients: this.clients.size,
            optimizer_running: this.optimizer.isRunning(),
            uptime: process.uptime(),
            memory_usage: process.memoryUsage()
        };
    }
}

// Create and start server if run directly
if (require.main === module) {
    const server = new PerformanceOptimizationServer(8767);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        server.stop();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        server.stop();
        process.exit(0);
    });

    // Start the server
    server.start();
}

export default PerformanceOptimizationServer;
