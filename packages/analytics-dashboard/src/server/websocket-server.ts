// WebSocket Server for Real-time Analytics Dashboard
import fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { WebSocket } from 'ws';
import cron from 'node-cron';
import {
  AnalyticsConfig,
  WebSocketMessage,
  WebSocketClient,
  AnalyticsMetric,
  ServiceHealth
} from '../types.js';
import { CodAIMetricsCollector } from '../collectors/metrics-collector.js';

export class AnalyticsWebSocketServer {
  private app: any;
  private clients: Map<string, WebSocketClient> = new Map();
  private metricsCollector: CodAIMetricsCollector;
  private config: AnalyticsConfig;
  private metricsCache: Map<string, any> = new Map();

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.metricsCollector = new CodAIMetricsCollector(config);
    this.app = fastify({ logger: true });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupMetricsCollection();
  }

  private setupMiddleware(): void {
    this.app.register(cors, {
      origin: this.config.security.allowedOrigins,
      credentials: true,
    });

    this.app.register(websocket, {
      options: {
        maxPayload: 1048576, // 1MB
        compression: 'DEFLATE',
      },
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async () => {
      return {
        status: 'healthy',
        service: 'analytics-dashboard',
        timestamp: new Date().toISOString(),
        clients: this.clients.size,
        metricsCache: this.metricsCache.size,
      };
    });

    // Get current metrics
    this.app.get('/api/metrics/current', async () => {
      const systemMetrics = await this.metricsCollector.collectSystemMetrics();
      const servicesHealth = await this.metricsCollector.collectAllServicesHealth();
      const userActivity = await this.metricsCollector.collectUserActivity();
      const businessMetrics = await this.metricsCollector.collectBusinessMetrics();

      return {
        system: systemMetrics,
        services: servicesHealth,
        users: userActivity,
        business: businessMetrics,
        timestamp: new Date().toISOString(),
      };
    });

    // Get metric history
    this.app.get('/api/metrics/:service/:metric/history', async (request: any) => {
      const { service, metric } = request.params;
      const hours = parseInt(request.query.hours) || 24;

      const history = await this.metricsCollector.getMetricHistory(metric, service, hours);
      return {
        service,
        metric,
        hours,
        data: history,
      };
    });

    // Get service health
    this.app.get('/api/services/health', async () => {
      const servicesHealth = await this.metricsCollector.collectAllServicesHealth();
      return {
        services: servicesHealth,
        timestamp: new Date().toISOString(),
      };
    });

    // Record custom metric
    this.app.post('/api/metrics/record', async (request: any) => {
      const { metric, service, value, unit, category, metadata } = request.body;

      await this.metricsCollector.recordMetric(
        metric,
        service,
        parseFloat(value),
        unit || '',
        category || 'custom',
        metadata || {}
      );

      // Broadcast to connected clients
      this.broadcast({
        type: 'metric_update',
        timestamp: new Date(),
        data: { metric, service, value, unit, category, metadata },
      });

      return { success: true };
    });
  }

  private setupWebSocket(): void {
    this.app.register(async (fastify: any) => {
      fastify.get('/ws', { websocket: true }, (connection: any) => {
        const clientId = this.generateClientId();
        const client: WebSocketClient = {
          id: clientId,
          socket: connection.socket,
          permissions: ['read'], // Default permissions
          subscribedMetrics: [],
          lastActivity: new Date(),
        };

        this.clients.set(clientId, client);
        console.log(`📊 Analytics client connected: ${clientId}`);

        // Send welcome message
        this.sendToClient(client, {
          type: 'system_event',
          timestamp: new Date(),
          data: {
            event: 'connected',
            clientId,
            serverInfo: {
              version: '1.0.0',
              features: ['real-time-metrics', 'service-health', 'user-analytics'],
            },
          },
        });

        // Handle incoming messages
        connection.socket.on('message', (message: Buffer) => {
          try {
            const data = JSON.parse(message.toString());
            this.handleClientMessage(client, data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });

        // Handle client disconnect
        connection.socket.on('close', () => {
          this.clients.delete(clientId);
          console.log(`📊 Analytics client disconnected: ${clientId}`);
        });

        // Handle errors
        connection.socket.on('error', (error: Error) => {
          console.error(`WebSocket error for client ${clientId}:`, error);
          this.clients.delete(clientId);
        });
      });
    });
  }

  private handleClientMessage(client: WebSocketClient, message: any): void {
    client.lastActivity = new Date();

    switch (message.type) {
      case 'subscribe_metrics':
        client.subscribedMetrics = message.metrics || [];
        this.sendToClient(client, {
          type: 'system_event',
          timestamp: new Date(),
          data: {
            event: 'subscription_updated',
            metrics: client.subscribedMetrics,
          },
        });
        break;

      case 'request_metrics':
        this.sendCurrentMetrics(client);
        break;

      case 'heartbeat':
        this.sendToClient(client, {
          type: 'system_event',
          timestamp: new Date(),
          data: { event: 'heartbeat_ack' },
        });
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private async sendCurrentMetrics(client: WebSocketClient): Promise<void> {
    try {
      const currentMetrics = await this.app.inject({
        method: 'GET',
        url: '/api/metrics/current',
      });

      this.sendToClient(client, {
        type: 'metric_update',
        timestamp: new Date(),
        data: JSON.parse(currentMetrics.body),
      });
    } catch (error) {
      console.error('Error sending current metrics:', error);
    }
  }

  private setupMetricsCollection(): void {
    // Initialize metrics collector
    this.metricsCollector.initialize().then(() => {
      console.log('📊 Metrics collector initialized');
    }).catch((error) => {
      console.error('❌ Failed to initialize metrics collector:', error);
    });

    // Collect and broadcast metrics every 30 seconds
    cron.schedule('*/30 * * * * *', async () => {
      try {
        const systemMetrics = await this.metricsCollector.collectSystemMetrics();
        const servicesHealth = await this.metricsCollector.collectAllServicesHealth();

        // Update cache
        this.metricsCache.set('system', systemMetrics);
        this.metricsCache.set('services', servicesHealth);

        // Broadcast to all connected clients
        this.broadcast({
          type: 'metric_update',
          timestamp: new Date(),
          data: {
            system: systemMetrics,
            services: servicesHealth,
          },
        });
      } catch (error) {
        console.error('Error in metrics collection cycle:', error);
      }
    });

    // Collect user activity every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        const userActivity = await this.metricsCollector.collectUserActivity();
        this.metricsCache.set('users', userActivity);

        this.broadcast({
          type: 'metric_update',
          timestamp: new Date(),
          data: { users: userActivity },
        });
      } catch (error) {
        console.error('Error collecting user activity:', error);
      }
    });

    // Collect business metrics every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
      try {
        const businessMetrics = await this.metricsCollector.collectBusinessMetrics();
        this.metricsCache.set('business', businessMetrics);

        this.broadcast({
          type: 'metric_update',
          timestamp: new Date(),
          data: { business: businessMetrics },
        });
      } catch (error) {
        console.error('Error collecting business metrics:', error);
      }
    });

    // Clean up inactive clients every minute
    cron.schedule('* * * * *', () => {
      const cutoffTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago

      for (const [clientId, client] of this.clients.entries()) {
        if (client.lastActivity < cutoffTime) {
          console.log(`Removing inactive client: ${clientId}`);
          client.socket.close();
          this.clients.delete(clientId);
        }
      }
    });
  }

  private broadcast(message: WebSocketMessage): void {
    const messageStr = JSON.stringify(message);

    for (const client of this.clients.values()) {
      if (client.socket.readyState === WebSocket.OPEN) {
        try {
          client.socket.send(messageStr);
        } catch (error) {
          console.error('Error broadcasting to client:', error);
        }
      }
    }
  }

  private sendToClient(client: WebSocketClient, message: WebSocketMessage): void {
    if (client.socket.readyState === WebSocket.OPEN) {
      try {
        client.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message to client:', error);
      }
    }
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async start(): Promise<void> {
    try {
      const address = await this.app.listen({
        port: this.config.websocket.port,
        host: '0.0.0.0',
      });

      console.log(`🚀 Analytics Dashboard WebSocket Server listening at ${address}`);
      console.log(`📊 WebSocket endpoint: ws://localhost:${this.config.websocket.port}/ws`);
      console.log(`🌐 HTTP API available at: http://localhost:${this.config.websocket.port}/api`);
    } catch (error) {
      console.error('❌ Failed to start Analytics WebSocket Server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    // Close all WebSocket connections
    for (const client of this.clients.values()) {
      client.socket.close();
    }
    this.clients.clear();

    // Cleanup metrics collector
    await this.metricsCollector.cleanup();

    // Close server
    await this.app.close();
    console.log('📊 Analytics Dashboard WebSocket Server stopped');
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      metricsCache: Object.fromEntries(this.metricsCache),
      uptime: process.uptime(),
    };
  }
}