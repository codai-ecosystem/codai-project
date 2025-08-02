/**
 * ROMAI Simple Real-time WebSocket Streaming Server
 * Simplified TypeScript implementation for real-time analytics
 */

import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';
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
}

export class SimpleRomaiServer {
  private server: WebSocketServer;
  private httpServer: any;
  private clients: Map<string, ConnectedClient> = new Map();
  private isRunning = false;
  private dataInterval?: NodeJS.Timeout;

  constructor(private port: number = 8765, private host: string = 'localhost') {
    this.httpServer = createServer();
    this.server = new WebSocketServer({ server: this.httpServer });
    this.setupServer();
  }

  private setupServer(): void {
    this.server.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    this.server.on('error', (error: Error) => {
      console.error('WebSocket server error:', error);
    });
  }

  private handleConnection(ws: WebSocket): void {
    const clientId = this.generateClientId();
    const client: ConnectedClient = {
      id: clientId,
      websocket: ws,
      subscriptions: new Set(),
      connectedAt: new Date()
    };

    this.clients.set(clientId, client);
    console.log(`✅ Client connected: ${clientId} (${this.clients.size} total)`);

    // Send welcome message
    this.sendToClient(client, {
      type: 'connection_established',
      message: 'Connected to ROMAI Real-time Analytics',
      timestamp: new Date().toISOString(),
      client_id: clientId,
      client_count: this.clients.size
    });

    ws.on('message', (data: any) => {
      this.handleClientMessage(client, data);
    });

    ws.on('close', () => {
      this.clients.delete(clientId);
      console.log(`❌ Client disconnected: ${clientId} (${this.clients.size} total)`);
    });

    ws.on('error', (error: Error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.clients.delete(clientId);
    });
  }

  private handleClientMessage(client: ConnectedClient, data: any): void {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'ping':
          this.sendToClient(client, {
            type: 'pong',
            timestamp: new Date().toISOString(),
            server_time: Date.now()
          });
          break;
        case 'subscribe':
          if (message.streams) {
            message.streams.forEach(stream => client.subscriptions.add(stream));
            this.sendToClient(client, {
              type: 'subscription_confirmed',
              streams: Array.from(client.subscriptions),
              timestamp: new Date().toISOString(),
              message: `Subscribed to ${message.streams.length} streams`
            });
            console.log(`Client ${client.id} subscribed to:`, message.streams);
          }
          break;
        case 'get_status':
          this.sendToClient(client, {
            type: 'status',
            connected_clients: this.clients.size,
            timestamp: new Date().toISOString()
          });
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

  private generateClientId(): string {
    return `client_${randomBytes(4).toString('hex')}`;
  }

  private startDataGeneration(): void {
    this.dataInterval = setInterval(() => {
      this.generateAndBroadcastData();
    }, 1000 + Math.random() * 2000);
  }

  private generateAndBroadcastData(): void {
    if (this.clients.size === 0) return;

    const generators = [
      () => this.generateLogData(),
      () => this.generateMetricsData(),
      () => this.generatePerformanceData(),
      () => this.generateHealthData()
    ];

    // Generate 1-2 data points
    const count = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < count; i++) {
      const generator = generators[Math.floor(Math.random() * generators.length)];
      if (generator) {
        const data = generator();
        this.broadcast(data);
      }
    }
  }

  private generateLogData(): StreamData {
    const services = ['romai-api', 'romai-dashboard', 'romai-mcp', 'romai-memory'];
    const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];

    return {
      stream_type: 'logs',
      service: services[Math.floor(Math.random() * services.length)] || 'romai-api',
      data: {
        level: levels[Math.floor(Math.random() * levels.length)] || 'INFO',
        message: 'Sample log message from TypeScript server',
        response_time_ms: Math.floor(Math.random() * 500) + 10,
        user_id: `user_${Math.floor(Math.random() * 100) + 1}`
      },
      timestamp: new Date().toISOString()
    };
  }

  private generateMetricsData(): StreamData {
    return {
      stream_type: 'metrics',
      service: 'romai-system',
      data: {
        cpu_usage_percent: Math.round((Math.random() * 80 + 10) * 100) / 100,
        memory_usage_mb: Math.floor(Math.random() * 2048) + 512,
        active_connections: this.clients.size,
        requests_per_second: Math.round((Math.random() * 50 + 5) * 100) / 100
      },
      timestamp: new Date().toISOString()
    };
  }

  private generatePerformanceData(): StreamData {
    const services = ['romai-api', 'romai-dashboard', 'romai-mcp'];

    return {
      stream_type: 'performance',
      service: services[Math.floor(Math.random() * services.length)] || 'romai-api',
      data: {
        response_time_ms: Math.floor(Math.random() * 300) + 20,
        throughput_rps: Math.round((Math.random() * 100 + 10) * 100) / 100,
        error_rate_percent: Math.round((Math.random() * 5) * 100) / 100
      },
      timestamp: new Date().toISOString()
    };
  }

  private generateHealthData(): StreamData {
    const services = ['romai-api', 'romai-dashboard', 'romai-mcp'];

    return {
      stream_type: 'health',
      service: services[Math.floor(Math.random() * services.length)] || 'romai-api',
      data: {
        status: Math.random() > 0.1 ? 'healthy' : 'unhealthy',
        response_time_ms: Math.floor(Math.random() * 100) + 5,
        uptime_seconds: Math.floor(Math.random() * 86400)
      },
      timestamp: new Date().toISOString()
    };
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.listen(this.port, this.host, () => {
        this.isRunning = true;
        console.log(`🚀 ROMAI Real-time Streaming Server (TypeScript)`);
        console.log(`📡 WebSocket server listening on ws://${this.host}:${this.port}`);
        console.log(`🎯 Ready to accept connections...`);

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
      console.log('🛑 Stopping server...');

      if (this.dataInterval) {
        clearInterval(this.dataInterval);
      }

      this.clients.forEach(client => {
        if (client.websocket.readyState === WebSocket.OPEN) {
          client.websocket.close();
        }
      });

      this.server.close(() => {
        this.httpServer.close(() => {
          console.log('✅ Server stopped');
          resolve();
        });
      });
    });
  }

  public getStats(): Record<string, any> {
    return {
      connected_clients: this.clients.size,
      is_running: this.isRunning,
      server_host: this.host,
      server_port: this.port,
      timestamp: new Date().toISOString()
    };
  }
}

// CLI execution
if (require.main === module) {
  const server = new SimpleRomaiServer();

  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down...');
    await server.stop();
    process.exit(0);
  });

  server.start().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
}
