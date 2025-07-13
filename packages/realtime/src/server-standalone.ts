import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';

interface RealtimeServerConfig {
  port: number;
  host: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  auth: {
    secret: string;
  };
}

interface ServiceConnection {
  id: string;
  appId: string;
  userId?: string;
  roles: string[];
  connectedAt: number;
  lastActivity: number;
}

interface RealtimeMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  sender: string;
  target?: string;
  channel?: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

class CodaiRealtimeServer {
  private httpServer: HTTPServer;
  private io: SocketIOServer;
  private redis?: Redis;
  private connections: Map<string, ServiceConnection> = new Map();
  private messageQueue: RealtimeMessage[] = [];
  private config: RealtimeServerConfig;

  constructor(config: RealtimeServerConfig) {
    this.config = config;
    this.httpServer = new HTTPServer();
    this.io = new SocketIOServer(this.httpServer, {
      cors: config.cors,
      transports: ['websocket', 'polling'],
      allowEIO3: true,
    });

    // Initialize Redis if configured
    if (config.redis) {
      this.redis = new Redis(config.redis);
    }

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`🔗 New real-time connection: ${socket.id}`);

      // Initialize connection
      const connection: ServiceConnection = {
        id: socket.id,
        appId: 'unknown',
        roles: [],
        connectedAt: Date.now(),
        lastActivity: Date.now(),
      };

      this.connections.set(socket.id, connection);

      // Handle authentication
      socket.on('authenticate', async (data) => {
        try {
          const { token } = data;
          const decoded = jwt.verify(token, this.config.auth.secret) as any;
          
          connection.userId = decoded.sub || decoded.userId;
          connection.roles = decoded.roles || [];
          connection.appId = decoded.appId || 'unknown';

          this.connections.set(socket.id, connection);
          
          // Join app-specific room
          socket.join(`app:${connection.appId}`);
          
          // Join user-specific room if authenticated
          if (connection.userId) {
            socket.join(`user:${connection.userId}`);
          }

          socket.emit('connected', { connectionId: socket.id });
          
          console.log(`✅ Authenticated connection: ${socket.id} (${connection.appId})`);

        } catch (error) {
          console.error('❌ Authentication failed:', error);
          socket.emit('error', { message: 'Authentication failed', code: 'AUTH_FAILED' });
        }
      });

      // Handle messages
      socket.on('message', (data) => {
        try {
          const message: RealtimeMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: data.type,
            payload: data.payload,
            timestamp: Date.now(),
            sender: connection.userId || socket.id,
            target: data.target,
            channel: data.channel,
            priority: data.priority || 'normal',
          };

          // Add to message queue for analytics
          this.messageQueue.push(message);
          if (this.messageQueue.length > 1000) {
            this.messageQueue = this.messageQueue.slice(-1000);
          }

          // Route message based on type and target
          this.routeMessage(socket, message);

          // Update connection activity
          connection.lastActivity = Date.now();

        } catch (error) {
          console.error('❌ Message handling error:', error);
          socket.emit('error', { message: 'Message processing failed', code: 'MESSAGE_FAILED' });
        }
      });

      // Handle channel subscriptions
      socket.on('subscribe', (data) => {
        const { channels } = data;
        channels.forEach((channel: string) => {
          socket.join(`channel:${channel}`);
          console.log(`📢 ${socket.id} subscribed to channel: ${channel}`);
        });
      });

      socket.on('unsubscribe', (data) => {
        const { channels } = data;
        channels.forEach((channel: string) => {
          socket.leave(`channel:${channel}`);
          console.log(`📵 ${socket.id} unsubscribed from channel: ${channel}`);
        });
      });

      // Handle room operations
      socket.on('joinRoom', (data) => {
        const { roomId } = data;
        socket.join(`room:${roomId}`);
        socket.to(`room:${roomId}`).emit('join', { roomId, userId: connection.userId });
        console.log(`🏠 ${socket.id} joined room: ${roomId}`);
      });

      socket.on('leaveRoom', (data) => {
        const { roomId } = data;
        socket.leave(`room:${roomId}`);
        socket.to(`room:${roomId}`).emit('leave', { roomId, userId: connection.userId });
        console.log(`🚪 ${socket.id} left room: ${roomId}`);
      });

      // Handle ping for latency measurement
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`🔌 Connection ${socket.id} disconnected: ${reason}`);
        this.connections.delete(socket.id);
        
        // Broadcast disconnection to relevant rooms
        if (connection.userId) {
          this.io.to(`user:${connection.userId}`).emit('user:disconnected', {
            userId: connection.userId,
            reason,
          });
        }
      });

      // Update activity on any event
      socket.onAny(() => {
        connection.lastActivity = Date.now();
      });
    });
  }

  private routeMessage(socket: any, message: RealtimeMessage): void {
    // Route to specific target
    if (message.target) {
      this.io.to(`user:${message.target}`).emit('message', message);
      return;
    }

    // Route to specific channel
    if (message.channel) {
      this.io.to(`channel:${message.channel}`).emit('message', message);
      return;
    }

    // Route based on message type
    switch (message.type) {
      // AIDE messages
      case 'code:change':
      case 'file:update':
      case 'terminal:output':
      case 'project:status':
      case 'build:result':
        this.io.to('app:aide').emit('message', message);
        break;

      // MEMORAI messages
      case 'memory:create':
      case 'memory:update':
      case 'memory:delete':
      case 'memory:search':
      case 'search:results':
      case 'agent:register':
      case 'agent:unregister':
      case 'analytics:usage':
        this.io.to('app:memorai').emit('message', message);
        break;

      // LOGAI messages
      case 'auth:login':
      case 'auth:logout':
      case 'auth:register':
      case 'auth:permission_update':
      case 'auth:session_expire':
      case 'security:alert':
      case 'security:breach':
      case 'admin:action':
        this.io.to('app:logai').emit('message', message);
        // Also broadcast high-priority auth events to all apps
        if (message.priority === 'high' || message.priority === 'critical') {
          this.io.emit('auth:broadcast', message);
        }
        break;

      // BANCAI messages
      case 'transaction:new':
      case 'balance:update':
      case 'fraud:alert':
      case 'market:update':
        this.io.to('app:bancai').emit('message', message);
        break;

      // STOCAI messages
      case 'data:update':
      case 'analytics:report':
      case 'insight:generated':
        this.io.to('app:stocai').emit('message', message);
        break;

      // STUDIAI messages
      case 'progress:update':
      case 'assignment:submitted':
      case 'feedback:received':
      case 'collaboration:active':
        this.io.to('app:studiai').emit('message', message);
        break;

      // System-wide messages
      case 'system:status':
      case 'system:maintenance':
      case 'system:alert':
        this.io.emit('system', message);
        break;

      // Default: broadcast to sender's app
      default:
        const connection = this.connections.get(socket.id);
        if (connection) {
          this.io.to(`app:${connection.appId}`).emit('message', message);
        }
        break;
    }
  }

  // Public API methods
  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(this.config.port, this.config.host, () => {
        console.log(`🚀 CODAI Real-time Server listening on ${this.config.host}:${this.config.port}`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.io.close(() => {
        this.httpServer.close(() => {
          if (this.redis) {
            this.redis.disconnect();
          }
          resolve();
        });
      });
    });
  }

  // Analytics and monitoring
  public getStats() {
    const now = Date.now();
    const activeConnections = Array.from(this.connections.values()).filter(
      conn => now - conn.lastActivity < 5 * 60 * 1000 // Active in last 5 minutes
    );

    const connectionsByApp = activeConnections.reduce((acc, conn) => {
      acc[conn.appId] = (acc[conn.appId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalConnections: this.connections.size,
      activeConnections: activeConnections.length,
      connectionsByApp,
      messageQueueSize: this.messageQueue.length,
      recentMessages: this.messageQueue.slice(-10),
    };
  }

  public broadcastToApp(appId: string, type: string, payload: any): void {
    const message: RealtimeMessage = {
      id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      sender: 'system',
      priority: 'normal',
    };

    this.io.to(`app:${appId}`).emit('message', message);
  }

  public broadcastToAll(type: string, payload: any, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    const message: RealtimeMessage = {
      id: `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      sender: 'system',
      priority,
    };

    this.io.emit('message', message);
  }
}

// Factory function
export function createRealtimeServer(config: RealtimeServerConfig): CodaiRealtimeServer {
  return new CodaiRealtimeServer(config);
}

// Default configuration
export const defaultRealtimeConfig: RealtimeServerConfig = {
  port: 3001,
  host: '0.0.0.0',
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:4000', 'https://*.codai.ro'],
    credentials: true,
  },
  auth: {
    secret: process.env.JWT_SECRET || 'codai-realtime-secret-key',
  },
};

export type { RealtimeServerConfig, ServiceConnection, RealtimeMessage };
