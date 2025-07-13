/**
 * ROMAI Enhanced Real-time Server with Advanced Analytics - Day 19
 * Integrates comprehensive analytics, trends, alerts, and predictions
 */

import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';
import { randomBytes } from 'crypto';
import { AdvancedAnalyticsEngine, AnalyticsData, AlertRule, DashboardWidget } from './advanced-analytics';

interface StreamMessage {
  type: 'analytics' | 'trend' | 'alert' | 'prediction' | 'dashboard';
  data: any;
  timestamp: string;
  id: string;
}

interface ClientSubscription {
  analytics: boolean;
  trends: boolean;
  alerts: boolean;
  predictions: boolean;
  dashboards: boolean;
}

interface EnhancedClient {
  id: string;
  websocket: WebSocket;
  subscriptions: ClientSubscription;
  connectedAt: Date;
  lastActivity: Date;
}

export class EnhancedRomaiServer {
  private server: WebSocketServer;
  private httpServer: any;
  private clients: Map<string, EnhancedClient> = new Map();
  private analytics: AdvancedAnalyticsEngine;
  private isRunning = false;
  private dataGenerationInterval?: NodeJS.Timeout;
  private analyticsInterval?: NodeJS.Timeout;

  constructor(private port: number = 8766, private host: string = 'localhost') {
    this.httpServer = createServer();
    this.server = new WebSocketServer({ server: this.httpServer });
    this.analytics = new AdvancedAnalyticsEngine();
    this.setupServer();
    this.setupAnalytics();
  }

  private setupServer(): void {
    this.server.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    this.server.on('error', (error: Error) => {
      console.error('❌ WebSocket server error:', error);
    });
  }

  private setupAnalytics(): void {
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

  private handleConnection(ws: WebSocket): void {
    const clientId = this.generateClientId();
    const client: EnhancedClient = {
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

    ws.on('message', (data: any) => {
      this.handleClientMessage(client, data);
    });

    ws.on('close', () => {
      this.clients.delete(clientId);
      console.log(`❌ Enhanced client disconnected: ${clientId} (${this.clients.size} total)`);
    });

    ws.on('error', (error: Error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.clients.delete(clientId);
    });
  }

  private handleClientMessage(client: EnhancedClient, data: any): void {
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
    } catch (error) {
      console.error('Error parsing client message:', error);
      this.sendToClient(client, {
        type: 'error',
        message: 'Invalid JSON format'
      });
    }
  }

  private handleSubscription(client: EnhancedClient, message: any): void {
    if (message.subscriptions) {
      Object.keys(message.subscriptions).forEach(key => {
        if (key in client.subscriptions) {
          (client.subscriptions as any)[key] = message.subscriptions[key];
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

  private sendAnalyticsSummary(client: EnhancedClient, timeframe: string): void {
    const services = ['romai-api', 'romai-dashboard', 'romai-mcp', 'romai-memory'];
    const summary = this.analytics.getAggregatedMetrics(services, timeframe);

    this.sendToClient(client, {
      type: 'analytics_summary',
      data: summary,
      timeframe: timeframe,
      timestamp: new Date().toISOString()
    });
  }

  private sendTrendAnalysis(client: EnhancedClient, metric: string, timeframe: string): void {
    const trend = this.analytics.getTrendAnalysis(metric, timeframe);

    this.sendToClient(client, {
      type: 'trend_analysis',
      metric: metric,
      data: trend,
      timestamp: new Date().toISOString()
    });
  }

  private sendPredictions(client: EnhancedClient, service: string, metric: string): void {
    const predictions = this.analytics.getPredictions(service, metric);

    this.sendToClient(client, {
      type: 'predictions',
      service: service,
      metric: metric,
      data: predictions,
      timestamp: new Date().toISOString()
    });
  }

  private createAlert(client: EnhancedClient, rule: AlertRule): void {
    this.analytics.createAlert(rule);

    this.sendToClient(client, {
      type: 'alert_created',
      rule: rule,
      timestamp: new Date().toISOString(),
      message: `Alert rule '${rule.name}' created successfully`
    });
  }

  private sendActiveAlerts(client: EnhancedClient): void {
    const alerts = this.analytics.getActiveAlerts();

    this.sendToClient(client, {
      type: 'active_alerts',
      data: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  }

  private createDashboard(client: EnhancedClient, widgets: DashboardWidget[]): void {
    const dashboardId = this.analytics.createDashboard(widgets);

    this.sendToClient(client, {
      type: 'dashboard_created',
      dashboard_id: dashboardId,
      widgets: widgets,
      timestamp: new Date().toISOString(),
      message: `Dashboard created with ID: ${dashboardId}`
    });
  }

  private sendServiceHealth(client: EnhancedClient, service: string, timeframe: string): void {
    const metrics = this.analytics.getServiceMetrics(service, timeframe);

    this.sendToClient(client, {
      type: 'service_health',
      service: service,
      data: metrics,
      timeframe: timeframe,
      timestamp: new Date().toISOString()
    });
  }

  private broadcastAnalytics(event: any): void {
    const message: StreamMessage = {
      type: 'analytics',
      data: event,
      timestamp: new Date().toISOString(),
      id: this.generateMessageId()
    };

    this.broadcastToSubscribers('analytics', message);
  }

  private broadcastServiceAnalysis(event: any): void {
    const message: StreamMessage = {
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

  private broadcastTrend(event: any): void {
    const message: StreamMessage = {
      type: 'trend',
      data: event,
      timestamp: new Date().toISOString(),
      id: this.generateMessageId()
    };

    this.broadcastToSubscribers('trends', message);
  }

  private broadcastToSubscribers(subscriptionType: keyof ClientSubscription, message: any): void {
    this.clients.forEach(client => {
      if (client.subscriptions[subscriptionType] &&
        client.websocket.readyState === WebSocket.OPEN) {
        try {
          client.websocket.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Broadcast error to client ${client.id}:`, error);
        }
      }
    });
  }

  private sendToClient(client: EnhancedClient, data: any): void {
    if (client.websocket.readyState === WebSocket.OPEN) {
      try {
        client.websocket.send(JSON.stringify(data));
      } catch (error) {
        console.error(`Error sending to client ${client.id}:`, error);
      }
    }
  }

  private generateClientId(): string {
    return `enhanced_${randomBytes(4).toString('hex')}`;
  }

  private generateMessageId(): string {
    return `msg_${randomBytes(4).toString('hex')}`;
  }

  private startDataGeneration(): void {
    // Generate synthetic analytics data
    this.dataGenerationInterval = setInterval(() => {
      this.generateSyntheticData();
    }, 2000); // Every 2 seconds

    // Start analytics processing
    this.analyticsInterval = setInterval(() => {
      this.processAnalytics();
    }, 10000); // Every 10 seconds
  }

  private generateSyntheticData(): void {
    const services = ['romai-api', 'romai-dashboard', 'romai-mcp', 'romai-memory'];

    services.forEach(service => {
      const data: AnalyticsData = {
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
            level: ['INFO', 'WARN', 'ERROR', 'DEBUG'][Math.floor(Math.random() * 4)] as any,
            message: `Service ${service} operation completed`,
            count: Math.floor(Math.random() * 10) + 1
          }
        ],
        health: {
          status: Math.random() > 0.1 ? 'healthy' : 'degraded' as any,
          uptime: Math.floor(Math.random() * 86400),
          lastCheck: new Date()
        }
      };

      this.analytics.ingestData(data);
    });
  }

  private processAnalytics(): void {
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

  private broadcastPrediction(service: string, metric: string, prediction: any): void {
    const message: StreamMessage = {
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

  private createDefaultAlerts(): void {
    const defaultRules: AlertRule[] = [
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

  public async start(): Promise<void> {
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

      this.httpServer.on('error', (error: Error) => {
        console.error('Server startup error:', error);
        reject(error);
      });
    });
  }

  public async stop(): Promise<void> {
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
        if (client.websocket.readyState === WebSocket.OPEN) {
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

  public getStats(): any {
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
