/**
 * ROMAI Real-time WebSocket Streaming Server
 * TypeScript implementation for real-time analytics and monitoring
 */

import WebSocket from 'ws';
import { createServer } from 'http';
import { EventEmitter } from 'events';
import { randomBytes } from 'crypto';

interface StreamData {
  stream_type: 'logs' | 'metrics' | 'performance' | 'security' | 'health';
  service: string;
  data: Record<string, any>;
  timestamp: string;
}

interface ClientMessage {
  type: 'ping' | 'subscribe' | 'unsubscribe' | 'get_status';
  streams?: string[];
  data?: Record<string, any>;
}

interface ConnectedClient {
  id: string;
  websocket: WebSocket;
  subscriptions: Set<string>;
  connectedAt: Date;
  lastActivity: Date;
}

export class RomaiStreamingServer extends EventEmitter {
  private server: WebSocket.Server;
  private httpServer: any;
  private clients: Map<string, ConnectedClient> = new Map();
  private isRunning = false;
  private dataGenerators: Map<string, NodeJS.Timeout> = new Map();

  constructor(private port: number = 8765, private host: string = 'localhost') {
    super();
    this.setupServer();
  }

  private setupServer(): void {
    // Create HTTP server for WebSocket upgrade
    this.httpServer = createServer();

    // Create WebSocket server
    this.server = new WebSocket.Server({
      server: this.httpServer,
      perMessageDeflate: false
    });

    this.server.on('connection', this.handleConnection.bind(this));
    this.server.on('error', this.handleServerError.bind(this));
  }

  private handleConnection(ws: WebSocket, request: any): void {
    const clientId = this.generateClientId();
    const client: ConnectedClient = {
      id: clientId,
      websocket: ws,
      subscriptions: new Set(),
      connectedAt: new Date(),
      lastActivity: new Date()
    };

    this.clients.set(clientId, client);

    console.log(`✅ Client connected: ${clientId} (${this.clients.size} total clients)`);

    // Send welcome message
    this.sendToClient(client, {
      type: 'connection_established',
      message: 'Connected to ROMAI Real-time Analytics',
      timestamp: new Date().toISOString(),
      client_id: clientId,
      client_count: this.clients.size
    });

    // Setup message handlers
    ws.on('message', (data: WebSocket.Data) => {
      this.handleClientMessage(client, data);
    });

    ws.on('close', () => {
      this.handleClientDisconnection(client);
    });

    ws.on('error', (error: Error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.handleClientDisconnection(client);
    });

    ws.on('pong', () => {
      client.lastActivity = new Date();
    });
  }

  private handleClientMessage(client: ConnectedClient, data: WebSocket.Data): void {
    try {
      const message: ClientMessage = JSON.parse(data.toString());
      client.lastActivity = new Date();

      switch (message.type) {
        case 'ping':
          this.handlePing(client);
          break;
        case 'subscribe':
          this.handleSubscription(client, message.streams || []);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(client, message.streams || []);
          break;
        case 'get_status':
          this.handleStatusRequest(client);
          break;
        default:
          this.sendToClient(client, {
            type: 'error',
            message: `Unknown message type: ${message.type}`
          });
      }
    } catch (error) {
      console.error(`Error parsing client message:`, error);
      this.sendToClient(client, {
        type: 'error',
        message: 'Invalid JSON format'
      });
    }
  }

  private handlePing(client: ConnectedClient): void {
    this.sendToClient(client, {
      type: 'pong',
      timestamp: new Date().toISOString(),
      server_time: Date.now()
    });
  }

  private handleSubscription(client: ConnectedClient, streams: string[]): void {
    streams.forEach(stream => client.subscriptions.add(stream));

    this.sendToClient(client, {
      type: 'subscription_confirmed',
      streams: Array.from(client.subscriptions),
      timestamp: new Date().toISOString(),
      message: `Subscribed to ${streams.length} streams`
    });

    console.log(`Client ${client.id} subscribed to:`, streams);
  }

  private handleUnsubscription(client: ConnectedClient, streams: string[]): void {
    streams.forEach(stream => client.subscriptions.delete(stream));

    this.sendToClient(client, {
      type: 'unsubscription_confirmed',
      streams: Array.from(client.subscriptions),
      timestamp: new Date().toISOString()
    });
  }

  private handleStatusRequest(client: ConnectedClient): void {
    const uptime = Date.now() - (this.server as any).startTime;

    this.sendToClient(client, {
      type: 'status',
      connected_clients: this.clients.size,
      server_uptime_ms: uptime,
      client_subscriptions: Array.from(client.subscriptions),
      timestamp: new Date().toISOString()
    });
  }

  private handleClientDisconnection(client: ConnectedClient): void {
    this.clients.delete(client.id);
    console.log(`❌ Client disconnected: ${client.id} (${this.clients.size} total clients)`);
  }

  private handleServerError(error: Error): void {
    console.error('WebSocket server error:', error);
    this.emit('error', error);
  }

  private generateClientId(): string {
    return `client_${randomBytes(8).toString('hex')}`;
  }

  private sendToClient(client: ConnectedClient, data: Record<string, any>): void {
    if (client.websocket.readyState === WebSocket.OPEN) {
      try {
        client.websocket.send(JSON.stringify(data));
      } catch (error) {
        console.error(`Error sending to client ${client.id}:`, error);
      }
    }
  }

  private broadcast(data: StreamData): void {
    const message = JSON.stringify(data);

    this.clients.forEach(client => {
      if (client.websocket.readyState === WebSocket.OPEN &&
        client.subscriptions.has(data.stream_type)) {
        try {
          client.websocket.send(message);
        } catch (error) {
          console.error(`Broadcast error to client ${client.id}:`, error);
        }
      }
    });
  }

  private startDataGenerators(): void {
    // Log data generator
    this.dataGenerators.set('logs', setInterval(() => {
      this.generateLogData();
    }, 1000 + Math.random() * 2000));

    // Metrics data generator
    this.dataGenerators.set('metrics', setInterval(() => {
      this.generateMetricsData();
    }, 2000 + Math.random() * 3000));

    // Performance data generator
    this.dataGenerators.set('performance', setInterval(() => {
      this.generatePerformanceData();
    }, 1500 + Math.random() * 2500));

    // Security data generator
    this.dataGenerators.set('security', setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        this.generateSecurityData();
      }
    }, 5000 + Math.random() * 10000));

    // Health data generator
    this.dataGenerators.set('health', setInterval(() => {
      this.generateHealthData();
    }, 3000 + Math.random() * 2000));
  }

  private generateLogData(): void {
    const services = ['romai-api', 'romai-dashboard', 'romai-mcp', 'romai-memory', 'romai-core'];
    const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const endpoints = ['/api/chat', '/api/auth', '/api/users', '/api/health', '/api/analytics'];

    const service = services[Math.floor(Math.random() * services.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];

    this.broadcast({
      stream_type: 'logs',
      service,
      data: {
        level,
        message: `${level} message from ${service}: Operation completed successfully`,
        response_time_ms: Math.floor(Math.random() * 500) + 10,
        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
        method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
        status_code: level === 'ERROR' ? [400, 401, 403, 404, 500][Math.floor(Math.random() * 5)] : 200,
        user_id: `user_${Math.floor(Math.random() * 100) + 1}`,
        session_id: `session_${Math.floor(Math.random() * 50) + 1}`,
        client_ip: `192.168.1.${Math.floor(Math.random() * 255) + 1}`
      },
      timestamp: new Date().toISOString()
    });
  }

  private generateMetricsData(): void {
    this.broadcast({
      stream_type: 'metrics',
      service: 'romai-system',
      data: {
        cpu_usage_percent: Math.round((Math.random() * 80 + 10) * 100) / 100,
        memory_usage_mb: Math.floor(Math.random() * 3584) + 512,
        memory_usage_percent: Math.round((Math.random() * 55 + 30) * 100) / 100,
        requests_per_second: Math.round((Math.random() * 45 + 5) * 100) / 100,
        active_connections: this.clients.size,
        response_time_avg: Math.floor(Math.random() * 250) + 50,
        disk_usage_percent: Math.round((Math.random() * 40 + 40) * 100) / 100,
        network_in_mbps: Math.round((Math.random() * 100) * 100) / 100,
        network_out_mbps: Math.round((Math.random() * 50) * 100) / 100
      },
      timestamp: new Date().toISOString()
    });
  }

  private generatePerformanceData(): void {
    const services = ['romai-api', 'romai-dashboard', 'romai-mcp'];
    const service = services[Math.floor(Math.random() * services.length)];

    this.broadcast({
      stream_type: 'performance',
      service,
      data: {
        response_time_ms: Math.floor(Math.random() * 780) + 20,
        throughput_rps: Math.round((Math.random() * 90 + 10) * 100) / 100,
        error_rate_percent: Math.round((Math.random() * 5) * 100) / 100,
        concurrent_users: Math.floor(Math.random() * 95) + 5,
        database_query_time_ms: Math.floor(Math.random() * 49) + 1,
        cache_hit_rate_percent: Math.round((Math.random() * 25 + 70) * 100) / 100,
        queue_size: Math.floor(Math.random() * 20),
        processing_time_ms: Math.floor(Math.random() * 200) + 10
      },
      timestamp: new Date().toISOString()
    });
  }

  private generateSecurityData(): void {
    const eventTypes = ['login_attempt', 'api_access', 'failed_login', 'suspicious_activity', 'rate_limit_exceeded'];
    const threatLevels = ['low', 'medium', 'high'];

    this.broadcast({
      stream_type: 'security',
      service: 'romai-security',
      data: {
        event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        threat_level: threatLevels[Math.floor(Math.random() * threatLevels.length)],
        client_ip: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
        user_id: `user_${Math.floor(Math.random() * 100) + 1}`,
        blocked: Math.random() > 0.8,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        details: {
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          endpoint: '/api/auth/login',
          method: 'POST',
          attempts: Math.floor(Math.random() * 5) + 1
        },
        geolocation: {
          country: ['US', 'GB', 'DE', 'FR', 'CA'][Math.floor(Math.random() * 5)],
          city: ['New York', 'London', 'Berlin', 'Paris', 'Toronto'][Math.floor(Math.random() * 5)]
        }
      },
      timestamp: new Date().toISOString()
    });
  }

  private generateHealthData(): void {
    const services = ['romai-api', 'romai-dashboard', 'romai-mcp', 'romai-memory', 'romai-core'];
    const service = services[Math.floor(Math.random() * services.length)];

    this.broadcast({
      stream_type: 'health',
      service,
      data: {
        status: Math.random() > 0.1 ? 'healthy' : 'unhealthy',
        response_time_ms: Math.floor(Math.random() * 100) + 5,
        uptime_seconds: Math.floor(Math.random() * 86400) + 3600,
        memory_usage_mb: Math.floor(Math.random() * 512) + 128,
        cpu_usage_percent: Math.round((Math.random() * 50 + 10) * 100) / 100,
        disk_usage_percent: Math.round((Math.random() * 30 + 40) * 100) / 100,
        last_check: new Date().toISOString(),
        version: '1.0.0',
        environment: 'production'
      },
      timestamp: new Date().toISOString()
    });
  }

  private stopDataGenerators(): void {
    this.dataGenerators.forEach((timer, name) => {
      clearInterval(timer);
      console.log(`Stopped ${name} data generator`);
    });
    this.dataGenerators.clear();
  }

  private startHeartbeat(): void {
    setInterval(() => {
      this.clients.forEach(client => {
        if (client.websocket.readyState === WebSocket.OPEN) {
          try {
            client.websocket.ping();
          } catch (error) {
            console.error(`Heartbeat error for client ${client.id}:`, error);
          }
        }
      });
    }, 30000); // Every 30 seconds
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.listen(this.port, this.host, () => {
        this.isRunning = true;
        (this.server as any).startTime = Date.now();

        console.log(`🚀 ROMAI Real-time Streaming Server started`);
        console.log(`📡 WebSocket server listening on ws://${this.host}:${this.port}`);
        console.log(`🎯 Ready to accept connections...`);

        this.startDataGenerators();
        this.startHeartbeat();

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

      console.log('🛑 Stopping ROMAI Real-time Streaming Server...');

      // Stop data generators
      this.stopDataGenerators();

      // Close all client connections
      this.clients.forEach(client => {
        if (client.websocket.readyState === WebSocket.OPEN) {
          client.websocket.close(1000, 'Server shutting down');
        }
      });

      // Close WebSocket server
      this.server.close(() => {
        console.log('✅ WebSocket server closed');

        // Close HTTP server
        this.httpServer.close(() => {
          console.log('✅ HTTP server closed');
          console.log('✅ Server shutdown complete');
          resolve();
        });
      });
    });
  }

  public getStats(): Record<string, any> {
    const uptime = Date.now() - (this.server as any).startTime;

    return {
      connected_clients: this.clients.size,
      server_uptime_ms: uptime,
      server_uptime_human: this.formatUptime(uptime),
      data_generators_active: this.dataGenerators.size,
      server_host: this.host,
      server_port: this.port,
      is_running: this.isRunning,
      timestamp: new Date().toISOString()
    };
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

// CLI execution
if (require.main === module) {
  const server = new RomaiStreamingServer();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  // Start server
  server.start().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}
