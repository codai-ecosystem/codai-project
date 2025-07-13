"use strict";
/**
 * ROMAI Enhanced Real-time Server with Advanced Analytics - Day 19
 * Integrates comprehensive analytics, trends, alerts, and predictions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedRomaiServer = void 0;
const ws_1 = require("ws");
const http_1 = require("http");
const crypto_1 = require("crypto");
const advanced_analytics_1 = require("./advanced-analytics");
class EnhancedRomaiServer {
    constructor(port = 8766, host = 'localhost') {
        this.port = port;
        this.host = host;
        this.clients = new Map();
        this.isRunning = false;
        this.httpServer = (0, http_1.createServer)();
        this.server = new ws_1.WebSocketServer({ server: this.httpServer });
        this.analytics = new advanced_analytics_1.AdvancedAnalyticsEngine();
        this.setupServer();
        this.setupAnalytics();
    }
    setupServer() {
        this.server.on('connection', (ws) => {
            this.handleConnection(ws);
        });
        this.server.on('error', (error) => {
            console.error('❌ WebSocket server error:', error);
        });
    }
    setupAnalytics() {
        // Listen to analytics events
        this.analytics.on('dataIngested', (event) => {
            this.broadcastAnalytics(event);
        });
        this.analytics.on('serviceAnalysis', (event) => {
            this.broadcastServiceAnalysis(event);
        });
        this.analytics.on('trendUpdate', (event) => {
            this.broadcastTrend(event);
        });
        // Setup default alert rules
        this.createDefaultAlerts();
    }
    handleConnection(ws) {
        const clientId = this.generateClientId();
        const client = {
            id: clientId,
            websocket: ws,
            subscriptions: {
                analytics: false,
                trends: false,
                alerts: false,
                predictions: false,
                dashboards: false
            },
            connectedAt: new Date(),
            lastActivity: new Date()
        };
        this.clients.set(clientId, client);
        console.log(`✅ Enhanced client connected: ${clientId} (${this.clients.size} total)`);
        // Send welcome message with capabilities
        this.sendToClient(client, {
            type: 'connection_established',
            message: 'Connected to ROMAI Enhanced Analytics Server',
            timestamp: new Date().toISOString(),
            client_id: clientId,
            capabilities: ['analytics', 'trends', 'alerts', 'predictions', 'dashboards'],
            client_count: this.clients.size
        });
        ws.on('message', (data) => {
            this.handleClientMessage(client, data);
        });
        ws.on('close', () => {
            this.clients.delete(clientId);
            console.log(`❌ Enhanced client disconnected: ${clientId} (${this.clients.size} total)`);
        });
        ws.on('error', (error) => {
            console.error(`WebSocket error for client ${clientId}:`, error);
            this.clients.delete(clientId);
        });
    }
    handleClientMessage(client, data) {
        try {
            const message = JSON.parse(data.toString());
            client.lastActivity = new Date();
            switch (message.type) {
                case 'ping':
                    this.sendToClient(client, {
                        type: 'pong',
                        timestamp: new Date().toISOString(),
                        server_time: Date.now()
                    });
                    break;
                case 'subscribe':
                    this.handleSubscription(client, message);
                    break;
                case 'get_analytics':
                    this.sendAnalyticsSummary(client, message.timeframe || '1h');
                    break;
                case 'get_trends':
                    this.sendTrendAnalysis(client, message.metric, message.timeframe || '1h');
                    break;
                case 'get_predictions':
                    this.sendPredictions(client, message.service, message.metric);
                    break;
                case 'create_alert':
                    this.createAlert(client, message.rule);
                    break;
                case 'get_alerts':
                    this.sendActiveAlerts(client);
                    break;
                case 'create_dashboard':
                    this.createDashboard(client, message.widgets);
                    break;
                case 'get_service_health':
                    this.sendServiceHealth(client, message.service, message.timeframe || '1h');
                    break;
                default:
                    this.sendToClient(client, {
                        type: 'error',
                        message: `Unknown message type: ${message.type}`
                    });
            }
        }
        catch (error) {
            console.error('Error parsing client message:', error);
            this.sendToClient(client, {
                type: 'error',
                message: 'Invalid JSON format'
            });
        }
    }
    handleSubscription(client, message) {
        if (message.subscriptions) {
            Object.keys(message.subscriptions).forEach(key => {
                if (key in client.subscriptions) {
                    client.subscriptions[key] = message.subscriptions[key];
                }
            });
            this.sendToClient(client, {
                type: 'subscription_confirmed',
                subscriptions: client.subscriptions,
                timestamp: new Date().toISOString(),
                message: 'Enhanced subscriptions updated'
            });
            console.log(`Client ${client.id} updated subscriptions:`, client.subscriptions);
        }
    }
    sendAnalyticsSummary(client, timeframe) {
        const services = ['romai-api', 'romai-dashboard', 'romai-mcp', 'romai-memory'];
        const summary = this.analytics.getAggregatedMetrics(services, timeframe);
        this.sendToClient(client, {
            type: 'analytics_summary',
            data: summary,
            timeframe: timeframe,
            timestamp: new Date().toISOString()
        });
    }
    sendTrendAnalysis(client, metric, timeframe) {
        const trend = this.analytics.getTrendAnalysis(metric, timeframe);
        this.sendToClient(client, {
            type: 'trend_analysis',
            metric: metric,
            data: trend,
            timestamp: new Date().toISOString()
        });
    }
    sendPredictions(client, service, metric) {
        const predictions = this.analytics.getPredictions(service, metric);
        this.sendToClient(client, {
            type: 'predictions',
            service: service,
            metric: metric,
            data: predictions,
            timestamp: new Date().toISOString()
        });
    }
    createAlert(client, rule) {
        this.analytics.createAlert(rule);
        this.sendToClient(client, {
            type: 'alert_created',
            rule: rule,
            timestamp: new Date().toISOString(),
            message: `Alert rule '${rule.name}' created successfully`
        });
    }
    sendActiveAlerts(client) {
        const alerts = this.analytics.getActiveAlerts();
        this.sendToClient(client, {
            type: 'active_alerts',
            data: alerts,
            count: alerts.length,
            timestamp: new Date().toISOString()
        });
    }
    createDashboard(client, widgets) {
        const dashboardId = this.analytics.createDashboard(widgets);
        this.sendToClient(client, {
            type: 'dashboard_created',
            dashboard_id: dashboardId,
            widgets: widgets,
            timestamp: new Date().toISOString(),
            message: `Dashboard created with ID: ${dashboardId}`
        });
    }
    sendServiceHealth(client, service, timeframe) {
        const metrics = this.analytics.getServiceMetrics(service, timeframe);
        this.sendToClient(client, {
            type: 'service_health',
            service: service,
            data: metrics,
            timeframe: timeframe,
            timestamp: new Date().toISOString()
        });
    }
    broadcastAnalytics(event) {
        const message = {
            type: 'analytics',
            data: event,
            timestamp: new Date().toISOString(),
            id: this.generateMessageId()
        };
        this.broadcastToSubscribers('analytics', message);
    }
    broadcastServiceAnalysis(event) {
        const message = {
            type: 'analytics',
            data: {
                type: 'service_analysis',
                ...event
            },
            timestamp: new Date().toISOString(),
            id: this.generateMessageId()
        };
        this.broadcastToSubscribers('analytics', message);
    }
    broadcastTrend(event) {
        const message = {
            type: 'trend',
            data: event,
            timestamp: new Date().toISOString(),
            id: this.generateMessageId()
        };
        this.broadcastToSubscribers('trends', message);
    }
    broadcastToSubscribers(subscriptionType, message) {
        this.clients.forEach(client => {
            if (client.subscriptions[subscriptionType] &&
                client.websocket.readyState === ws_1.WebSocket.OPEN) {
                try {
                    client.websocket.send(JSON.stringify(message));
                }
                catch (error) {
                    console.error(`Broadcast error to client ${client.id}:`, error);
                }
            }
        });
    }
    sendToClient(client, data) {
        if (client.websocket.readyState === ws_1.WebSocket.OPEN) {
            try {
                client.websocket.send(JSON.stringify(data));
            }
            catch (error) {
                console.error(`Error sending to client ${client.id}:`, error);
            }
        }
    }
    generateClientId() {
        return `enhanced_${(0, crypto_1.randomBytes)(4).toString('hex')}`;
    }
    generateMessageId() {
        return `msg_${(0, crypto_1.randomBytes)(4).toString('hex')}`;
    }
    startDataGeneration() {
        // Generate synthetic analytics data
        this.dataGenerationInterval = setInterval(() => {
            this.generateSyntheticData();
        }, 2000); // Every 2 seconds
        // Start analytics processing
        this.analyticsInterval = setInterval(() => {
            this.processAnalytics();
        }, 10000); // Every 10 seconds
    }
    generateSyntheticData() {
        const services = ['romai-api', 'romai-dashboard', 'romai-mcp', 'romai-memory'];
        services.forEach(service => {
            const data = {
                timestamp: new Date(),
                service: service,
                metrics: {
                    responseTime: Math.floor(Math.random() * 300) + 50,
                    cpuUsage: Math.round((Math.random() * 80 + 10) * 100) / 100,
                    memoryUsage: Math.round((Math.random() * 80 + 10) * 100) / 100,
                    errorRate: Math.round((Math.random() * 5) * 100) / 100,
                    throughput: Math.round((Math.random() * 100 + 10) * 100) / 100,
                    activeConnections: Math.floor(Math.random() * 50) + 1
                },
                logs: [
                    {
                        level: ['INFO', 'WARN', 'ERROR', 'DEBUG'][Math.floor(Math.random() * 4)],
                        message: `Service ${service} operation completed`,
                        count: Math.floor(Math.random() * 10) + 1
                    }
                ],
                health: {
                    status: Math.random() > 0.1 ? 'healthy' : 'degraded',
                    uptime: Math.floor(Math.random() * 86400),
                    lastCheck: new Date()
                }
            };
            this.analytics.ingestData(data);
        });
    }
    processAnalytics() {
        // Trigger analytics processing
        console.log('📊 Processing analytics data...');
        // Check predictions for all services
        const services = ['romai-api', 'romai-dashboard', 'romai-mcp', 'romai-memory'];
        const metrics = ['responseTime', 'cpuUsage', 'memoryUsage'];
        services.forEach(service => {
            metrics.forEach(metric => {
                const prediction = this.analytics.getPredictions(service, metric);
                if (prediction) {
                    this.broadcastPrediction(service, metric, prediction);
                }
            });
        });
    }
    broadcastPrediction(service, metric, prediction) {
        const message = {
            type: 'prediction',
            data: {
                service,
                metric,
                prediction
            },
            timestamp: new Date().toISOString(),
            id: this.generateMessageId()
        };
        this.broadcastToSubscribers('predictions', message);
    }
    createDefaultAlerts() {
        const defaultRules = [
            {
                id: 'high_response_time',
                name: 'High Response Time',
                metric: 'responseTime',
                condition: 'gt',
                threshold: 1000,
                severity: 'high',
                enabled: true
            },
            {
                id: 'high_cpu_usage',
                name: 'High CPU Usage',
                metric: 'cpuUsage',
                condition: 'gt',
                threshold: 80,
                severity: 'critical',
                enabled: true
            },
            {
                id: 'high_memory_usage',
                name: 'High Memory Usage',
                metric: 'memoryUsage',
                condition: 'gt',
                threshold: 85,
                severity: 'high',
                enabled: true
            },
            {
                id: 'high_error_rate',
                name: 'High Error Rate',
                metric: 'errorRate',
                condition: 'gt',
                threshold: 5,
                severity: 'critical',
                enabled: true
            }
        ];
        defaultRules.forEach(rule => {
            this.analytics.createAlert(rule);
        });
        console.log(`✅ Created ${defaultRules.length} default alert rules`);
    }
    async start() {
        return new Promise((resolve, reject) => {
            this.httpServer.listen(this.port, this.host, () => {
                this.isRunning = true;
                console.log(`🚀 ROMAI Enhanced Analytics Server (Day 19)`);
                console.log(`📡 WebSocket server listening on ws://${this.host}:${this.port}`);
                console.log(`🎯 Advanced Analytics: ✅ Trends: ✅ Alerts: ✅ Predictions: ✅`);
                console.log(`🔥 Ready for enhanced analytics connections...`);
                this.startDataGeneration();
                resolve();
            });
            this.httpServer.on('error', (error) => {
                console.error('Server startup error:', error);
                reject(error);
            });
        });
    }
    async stop() {
        return new Promise((resolve) => {
            this.isRunning = false;
            console.log('🛑 Stopping enhanced server...');
            if (this.dataGenerationInterval) {
                clearInterval(this.dataGenerationInterval);
            }
            if (this.analyticsInterval) {
                clearInterval(this.analyticsInterval);
            }
            this.clients.forEach(client => {
                if (client.websocket.readyState === ws_1.WebSocket.OPEN) {
                    client.websocket.close();
                }
            });
            this.server.close(() => {
                this.httpServer.close(() => {
                    console.log('✅ Enhanced server stopped');
                    resolve();
                });
            });
        });
    }
    getStats() {
        return {
            connected_clients: this.clients.size,
            is_running: this.isRunning,
            server_host: this.host,
            server_port: this.port,
            analytics_enabled: true,
            features: ['trends', 'alerts', 'predictions', 'dashboards'],
            active_alerts: this.analytics.getActiveAlerts().length,
            timestamp: new Date().toISOString()
        };
    }
}
exports.EnhancedRomaiServer = EnhancedRomaiServer;
// CLI execution
if (require.main === module) {
    const server = new EnhancedRomaiServer();
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received SIGINT, shutting down enhanced server...');
        await server.stop();
        process.exit(0);
    });
    server.start().catch((error) => {
        console.error('❌ Failed to start enhanced server:', error);
        process.exit(1);
    });
}
