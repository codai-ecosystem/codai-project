/**
 * ROMAI Week 3 Integration Server
 * Day 21: Real-time integration monitoring and testing server
 */

const WebSocket = require('ws');
const { createServer } = require('http');
const { Week3IntegrationCoordinator } = require('./week3-integration');

class Week3IntegrationServer {
    constructor(port = 8768) {
        this.port = port;
        this.clients = new Map();
        this.coordinator = new Week3IntegrationCoordinator();

        // Create HTTP server for WebSocket upgrade
        this.httpServer = createServer();

        // Create WebSocket server
        this.server = new WebSocket.Server({
            server: this.httpServer,
            path: '/integration'
        });

        this.setupWebSocketHandlers();
        this.setupCoordinatorEvents();
    }

    setupWebSocketHandlers() {
        this.server.on('connection', (ws) => {
            const clientId = this.generateClientId();
            const client = {
                id: clientId,
                ws: ws,
                subscriptions: {},
                lastSeen: new Date()
            };

            this.clients.set(clientId, client);
            console.log(`🔌 Integration client connected: ${clientId} (${this.clients.size} total)`);

            // Send welcome message
            this.sendToClient(client, {
                type: 'connection_established',
                message: 'Connected to ROMAI Week 3 Integration Server',
                timestamp: new Date().toISOString(),
                client_id: clientId,
                capabilities: [
                    'system_monitoring',
                    'integration_testing',
                    'health_checks',
                    'component_status',
                    'test_execution'
                ],
                client_count: this.clients.size
            });

            // Handle messages
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleClientMessage(client, message);
                } catch (error) {
                    this.sendToClient(client, {
                        type: 'error',
                        message: 'Invalid JSON message format',
                        timestamp: new Date().toISOString()
                    });
                }
            });

            // Handle disconnect
            ws.on('close', () => {
                this.clients.delete(clientId);
                console.log(`🔌 Integration client disconnected: ${clientId} (${this.clients.size} remaining)`);
            });

            ws.on('error', (error) => {
                console.error(`WebSocket error for client ${clientId}:`, error);
                this.clients.delete(clientId);
            });
        });
    }

    setupCoordinatorEvents() {
        this.coordinator.on('health-update', (data) => {
            this.broadcastToSubscribers('health', {
                type: 'health_update',
                data: data,
                timestamp: new Date().toISOString()
            });
        });

        this.coordinator.on('test-completed', (test) => {
            this.broadcastToSubscribers('tests', {
                type: 'test_completed',
                data: test,
                timestamp: new Date().toISOString()
            });
        });

        this.coordinator.on('integration-completed', (summary) => {
            this.broadcastToAll({
                type: 'integration_completed',
                data: summary,
                timestamp: new Date().toISOString()
            });
        });

        this.coordinator.on('integration-report', (report) => {
            this.broadcastToAll({
                type: 'integration_report',
                data: report,
                timestamp: new Date().toISOString()
            });
        });
    }

    handleClientMessage(client, message) {
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
                        timestamp: new Date().toISOString()
                    });
                }
                break;

            case 'start_integration':
                this.coordinator.startIntegration();
                this.sendToClient(client, {
                    type: 'integration_started',
                    timestamp: new Date().toISOString(),
                    message: 'Week 3 integration testing started'
                });
                break;

            case 'stop_integration':
                this.coordinator.stopIntegration();
                this.sendToClient(client, {
                    type: 'integration_stopped',
                    timestamp: new Date().toISOString(),
                    message: 'Week 3 integration testing stopped'
                });
                break;

            case 'get_system_overview':
                const overview = this.coordinator.getSystemOverview();
                this.sendToClient(client, {
                    type: 'system_overview',
                    data: overview,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'get_test_summary':
                const summary = this.coordinator.getTestSummary();
                this.sendToClient(client, {
                    type: 'test_summary',
                    data: summary,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'get_integration_report':
                const report = this.coordinator.generateIntegrationReport();
                this.sendToClient(client, {
                    type: 'integration_report',
                    data: report,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'get_status':
                this.sendToClient(client, {
                    type: 'server_status',
                    data: {
                        running: this.coordinator.isRunning(),
                        connected_clients: this.clients.size,
                        uptime: process.uptime(),
                        memory_usage: process.memoryUsage()
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

    sendToClient(client, message) {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
        }
    }

    broadcastToSubscribers(subscription, message) {
        for (const client of this.clients.values()) {
            if (client.subscriptions[subscription] && client.ws.readyState === WebSocket.OPEN) {
                this.sendToClient(client, message);
            }
        }
    }

    broadcastToAll(message) {
        for (const client of this.clients.values()) {
            if (client.ws.readyState === WebSocket.OPEN) {
                this.sendToClient(client, message);
            }
        }
    }

    generateClientId() {
        return `int_${Math.random().toString(36).substr(2, 9)}`;
    }

    start() {
        this.httpServer.listen(this.port, () => {
            console.log(`🚀 ROMAI Week 3 Integration Server started on port ${this.port}`);
            console.log(`🔗 WebSocket endpoint: ws://localhost:${this.port}/integration`);
            console.log(`🧪 Integration testing and monitoring ready`);
        });
    }

    stop() {
        console.log('🛑 Stopping Week 3 Integration Server...');

        this.coordinator.stopIntegration();

        for (const client of this.clients.values()) {
            client.ws.close();
        }
        this.clients.clear();

        this.server.close();
        this.httpServer.close();

        console.log('✅ Week 3 Integration Server stopped');
    }
}

// Start server if run directly
if (require.main === module) {
    const server = new Week3IntegrationServer(8768);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        server.stop();
        process.exit(0);
    });

    server.start();

    // Auto-start integration after 3 seconds
    setTimeout(() => {
        console.log('🚀 Auto-starting Week 3 integration...');
        server.coordinator.startIntegration();
    }, 3000);
}

module.exports = Week3IntegrationServer;
