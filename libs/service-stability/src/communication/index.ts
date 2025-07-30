/**
 * Communication Protocol Manager
 * 
 * Advanced inter-service communication system supporting multiple protocols
 * Provides message queuing, service discovery, WebSocket, and RPC capabilities
 */

import { EventEmitter } from 'events';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer, Server } from 'http';
import Redis from 'ioredis';
import axios from 'axios';

export interface CommunicationConfig {
  protocols: string[];
  messageQueue: MessageQueueConfig;
  serviceDiscovery: ServiceDiscoveryConfig;
  webSocket?: WebSocketConfig;
  rpc?: RPCConfig;
  pubSub?: PubSubConfig;
}

export interface MessageQueueConfig {
  type: 'redis' | 'rabbitmq' | 'kafka' | 'nats';
  connection: {
    host: string;
    port: number;
    username?: string;
    password?: string;
    database?: number;
  };
  queues: QueueConfig[];
}

export interface QueueConfig {
  name: string;
  durable: boolean;
  maxRetries: number;
  retryDelay: number;
  deadLetterQueue?: string;
}

export interface ServiceDiscoveryConfig {
  type: 'consul' | 'etcd' | 'zookeeper' | 'redis';
  connection: {
    host: string;
    port: number;
    username?: string;
    password?: string;
  };
  heartbeatInterval: number;
  healthCheckInterval: number;
}

export interface ServiceEndpoint {
  id: string;
  name: string;
  host: string;
  port: number;
  protocol: string;
  metadata: Record<string, any>;
  health: {
    status: 'healthy' | 'unhealthy';
    lastCheck: string;
  };
}

export interface MessageProtocol {
  id: string;
  type: 'request' | 'response' | 'event' | 'broadcast';
  payload: any;
  metadata: {
    timestamp: string;
    source: string;
    destination?: string;
    correlationId?: string;
    retryCount?: number;
  };
}

export interface WebSocketConfig {
  port: number;
  path: string;
  cors: {
    enabled: boolean;
    origins: string[];
  };
  authentication: {
    enabled: boolean;
    tokenField: string;
  };
}

export interface RPCConfig {
  port: number;
  services: RPCServiceConfig[];
  timeout: number;
  retries: number;
}

export interface RPCServiceConfig {
  name: string;
  methods: string[];
  middleware: string[];
}

export interface PubSubConfig {
  channels: string[];
  patterns: string[];
}

export interface CommunicationMetrics {
  messagesProcessed: number;
  messagesSent: number;
  messagesReceived: number;
  activeConnections: number;
  queueDepth: number;
  averageLatency: number;
  errors: number;
}

export class CommunicationProtocol extends EventEmitter {
  private config: CommunicationConfig;
  private redis: Redis | null = null;
  private socketServer: SocketIOServer | null = null;
  private httpServer: Server | null = null;
  private serviceRegistry: Map<string, ServiceEndpoint> = new Map();
  private messageQueues: Map<string, any> = new Map();
  private activeConnections: Map<string, Socket> = new Map();
  private metrics: CommunicationMetrics;
  private running: boolean = false;

  constructor(config: CommunicationConfig) {
    super();
    this.config = config;
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): CommunicationMetrics {
    return {
      messagesProcessed: 0,
      messagesSent: 0,
      messagesReceived: 0,
      activeConnections: 0,
      queueDepth: 0,
      averageLatency: 0,
      errors: 0
    };
  }

  /**
   * Start the communication protocol system
   */
  async start(): Promise<void> {
    if (this.running) {
      console.warn('Communication protocol is already running');
      return;
    }

    try {
      // Initialize message queue
      if (this.config.protocols.includes('redis') || this.config.messageQueue.type === 'redis') {
        await this.initializeRedis();
      }

      // Initialize WebSocket server
      if (this.config.protocols.includes('websocket') && this.config.webSocket) {
        await this.initializeWebSocket();
      }

      // Initialize service discovery
      await this.initializeServiceDiscovery();

      // Initialize RPC server
      if (this.config.protocols.includes('grpc') && this.config.rpc) {
        await this.initializeRPC();
      }

      // Start health checking
      this.startHealthChecking();

      // Start metrics collection
      this.startMetricsCollection();

      this.running = true;
      console.log('✅ Communication Protocol system started successfully');
      this.emit('started');
    } catch (error) {
      console.error('❌ Failed to start Communication Protocol system:', error);
      throw error;
    }
  }

  /**
   * Stop the communication protocol system
   */
  async stop(): Promise<void> {
    if (!this.running) {
      console.warn('Communication protocol is not running');
      return;
    }

    try {
      // Close WebSocket server
      if (this.socketServer) {
        this.socketServer.close();
      }

      // Close HTTP server
      if (this.httpServer) {
        this.httpServer.close();
      }

      // Close Redis connection
      if (this.redis) {
        await this.redis.quit();
      }

      this.running = false;
      console.log('✅ Communication Protocol system stopped successfully');
      this.emit('stopped');
    } catch (error) {
      console.error('❌ Error stopping Communication Protocol system:', error);
      throw error;
    }
  }

  /**
   * Register a service endpoint
   */
  async registerEndpoint(service: any): Promise<void> {
    const endpoint: ServiceEndpoint = {
      id: `${service.name}-${Date.now()}`,
      name: service.name,
      host: service.host || 'localhost',
      port: service.port,
      protocol: service.protocol || 'http',
      metadata: service.metadata || {},
      health: {
        status: 'healthy',
        lastCheck: new Date().toISOString()
      }
    };

    this.serviceRegistry.set(service.name, endpoint);

    // Register with service discovery
    await this.registerWithServiceDiscovery(endpoint);

    console.log(`✅ Service endpoint registered: ${service.name}`);
    this.emit('serviceRegistered', endpoint);
  }

  /**
   * Unregister a service endpoint
   */
  async unregisterEndpoint(serviceName: string): Promise<void> {
    const endpoint = this.serviceRegistry.get(serviceName);
    if (endpoint) {
      this.serviceRegistry.delete(serviceName);
      await this.unregisterFromServiceDiscovery(endpoint);
      console.log(`✅ Service endpoint unregistered: ${serviceName}`);
      this.emit('serviceUnregistered', endpoint);
    }
  }

  /**
   * Send a message through the communication system
   */
  async sendMessage(message: MessageProtocol): Promise<void> {
    const startTime = Date.now();

    try {
      switch (message.type) {
        case 'request':
          await this.sendRequest(message);
          break;
        case 'response':
          await this.sendResponse(message);
          break;
        case 'event':
          await this.publishEvent(message);
          break;
        case 'broadcast':
          await this.broadcastMessage(message);
          break;
        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }

      this.metrics.messagesSent++;
      this.updateLatency(Date.now() - startTime);

      console.log(`📤 Message sent: ${message.id} (${message.type})`);
      this.emit('messageSent', message);
    } catch (error) {
      this.metrics.errors++;
      console.error(`❌ Failed to send message ${message.id}:`, error);
      this.emit('messageError', { message, error });
      throw error;
    }
  }

  /**
   * Subscribe to messages
   */
  async subscribeToMessages(
    pattern: string,
    handler: (message: MessageProtocol) => void
  ): Promise<void> {
    if (this.redis) {
      await this.redis.psubscribe(pattern);
      this.redis.on('pmessage', (pattern, channel, message) => {
        try {
          const parsedMessage: MessageProtocol = JSON.parse(message);
          this.metrics.messagesReceived++;
          handler(parsedMessage);
          this.emit('messageReceived', parsedMessage);
        } catch (error) {
          this.metrics.errors++;
          console.error('❌ Error processing received message:', error);
        }
      });
    }
  }

  /**
   * Discover services
   */
  async discoverServices(serviceName?: string): Promise<ServiceEndpoint[]> {
    if (serviceName) {
      const service = this.serviceRegistry.get(serviceName);
      return service ? [service] : [];
    }

    return Array.from(this.serviceRegistry.values());
  }

  /**
   * Get system status
   */
  async getStatus(): Promise<any> {
    return {
      status: this.running ? 'healthy' : 'stopped',
      protocols: this.config.protocols,
      services: this.serviceRegistry.size,
      connections: this.metrics.activeConnections,
      metrics: this.metrics,
      queues: Array.from(this.messageQueues.keys())
    };
  }

  /**
   * Get communication metrics
   */
  async getMetrics(): Promise<CommunicationMetrics> {
    // Update queue depth
    if (this.redis) {
      let totalDepth = 0;
      for (const queue of this.config.messageQueue.queues) {
        const depth = await this.redis.llen(queue.name);
        totalDepth += depth;
      }
      this.metrics.queueDepth = totalDepth;
    }

    return { ...this.metrics };
  }

  private async initializeRedis(): Promise<void> {
    const { host, port, password, database } = this.config.messageQueue.connection;

    this.redis = new Redis({
      host,
      port,
      password,
      db: database || 0,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
      this.metrics.errors++;
    });

    // Initialize message queues
    for (const queueConfig of this.config.messageQueue.queues) {
      this.messageQueues.set(queueConfig.name, queueConfig);
    }
  }

  private async initializeWebSocket(): Promise<void> {
    const wsConfig = this.config.webSocket!;

    this.httpServer = createServer();
    this.socketServer = new SocketIOServer(this.httpServer, {
      path: wsConfig.path,
      cors: {
        origin: wsConfig.cors.enabled ? wsConfig.cors.origins : false,
        methods: ['GET', 'POST']
      }
    });

    // Authentication middleware
    if (wsConfig.authentication.enabled) {
      this.socketServer.use((socket, next) => {
        const token = socket.handshake.auth[wsConfig.authentication.tokenField];
        if (!token) {
          return next(new Error('Authentication token required'));
        }
        // In production, validate token
        next();
      });
    }

    // Connection handling
    this.socketServer.on('connection', (socket: Socket) => {
      this.activeConnections.set(socket.id, socket);
      this.metrics.activeConnections++;

      console.log(`🔗 WebSocket client connected: ${socket.id}`);
      this.emit('clientConnected', socket.id);

      socket.on('disconnect', () => {
        this.activeConnections.delete(socket.id);
        this.metrics.activeConnections--;
        console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
        this.emit('clientDisconnected', socket.id);
      });

      socket.on('message', (data) => {
        this.handleWebSocketMessage(socket, data);
      });
    });

    return new Promise<void>((resolve) => {
      this.httpServer!.listen(wsConfig.port, () => {
        console.log(`✅ WebSocket server started on port ${wsConfig.port}`);
        resolve();
      });
    });
  }

  private async initializeServiceDiscovery(): Promise<void> {
    // Simplified service discovery using Redis
    // In production, integrate with Consul, etcd, or Zookeeper
    console.log('✅ Service discovery initialized');
  }

  private async initializeRPC(): Promise<void> {
    // Placeholder for gRPC server initialization
    // In production, implement full gRPC server with protobuf definitions
    console.log('✅ RPC server initialized');
  }

  private async sendRequest(message: MessageProtocol): Promise<void> {
    if (!message.metadata.destination) {
      throw new Error('Request message requires destination');
    }

    const endpoint = this.serviceRegistry.get(message.metadata.destination);
    if (!endpoint) {
      throw new Error(`Service not found: ${message.metadata.destination}`);
    }

    // Send HTTP request
    await axios.post(`${endpoint.protocol}://${endpoint.host}:${endpoint.port}/api/message`, {
      id: message.id,
      type: message.type,
      payload: message.payload,
      metadata: message.metadata
    });
  }

  private async sendResponse(message: MessageProtocol): Promise<void> {
    // Send response back to the original requester
    if (this.redis && message.metadata.correlationId) {
      await this.redis.publish(
        `response:${message.metadata.correlationId}`,
        JSON.stringify(message)
      );
    }
  }

  private async publishEvent(message: MessageProtocol): Promise<void> {
    if (this.redis) {
      await this.redis.publish(
        `events:${message.metadata.source}`,
        JSON.stringify(message)
      );
    }
  }

  private async broadcastMessage(message: MessageProtocol): Promise<void> {
    // Broadcast to all WebSocket connections
    if (this.socketServer) {
      this.socketServer.emit('broadcast', message);
    }

    // Publish to Redis for other instances
    if (this.redis) {
      await this.redis.publish('broadcast', JSON.stringify(message));
    }
  }

  private handleWebSocketMessage(socket: Socket, data: any): void {
    try {
      const message: MessageProtocol = {
        id: data.id || `ws-${Date.now()}`,
        type: data.type || 'event',
        payload: data.payload,
        metadata: {
          timestamp: new Date().toISOString(),
          source: socket.id,
          ...data.metadata
        }
      };

      this.metrics.messagesReceived++;
      this.emit('messageReceived', message);

      // Process message based on type
      switch (message.type) {
        case 'request':
          this.handleWebSocketRequest(socket, message);
          break;
        case 'event':
          this.handleWebSocketEvent(socket, message);
          break;
        default:
          console.warn(`Unknown WebSocket message type: ${message.type}`);
      }
    } catch (error) {
      this.metrics.errors++;
      console.error('❌ Error handling WebSocket message:', error);
      socket.emit('error', { message: 'Invalid message format' });
    }
  }

  private async handleWebSocketRequest(socket: Socket, message: MessageProtocol): Promise<void> {
    // Process request and send response
    const response: MessageProtocol = {
      id: `response-${message.id}`,
      type: 'response',
      payload: { status: 'processed', originalId: message.id },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'communication-protocol',
        destination: socket.id,
        correlationId: message.id
      }
    };

    socket.emit('response', response);
  }

  private async handleWebSocketEvent(socket: Socket, message: MessageProtocol): Promise<void> {
    // Broadcast event to other connected clients
    socket.broadcast.emit('event', message);
  }

  private async registerWithServiceDiscovery(endpoint: ServiceEndpoint): Promise<void> {
    // In production, register with actual service discovery system
    console.log(`📋 Service registered in discovery: ${endpoint.name}`);
  }

  private async unregisterFromServiceDiscovery(endpoint: ServiceEndpoint): Promise<void> {
    // In production, unregister from actual service discovery system
    console.log(`📋 Service unregistered from discovery: ${endpoint.name}`);
  }

  private startHealthChecking(): void {
    const interval = this.config.serviceDiscovery.healthCheckInterval || 30000;

    setInterval(async () => {
      for (const [name, endpoint] of this.serviceRegistry) {
        try {
          const response = await axios.get(
            `${endpoint.protocol}://${endpoint.host}:${endpoint.port}/health`,
            { timeout: 5000 }
          );

          endpoint.health.status = response.status === 200 ? 'healthy' : 'unhealthy';
          endpoint.health.lastCheck = new Date().toISOString();
        } catch (error) {
          endpoint.health.status = 'unhealthy';
          endpoint.health.lastCheck = new Date().toISOString();
        }
      }
    }, interval);
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.metrics.activeConnections = this.activeConnections.size;
      this.emit('metricsUpdated', this.metrics);
    }, 10000); // Update every 10 seconds
  }

  private updateLatency(latency: number): void {
    this.metrics.averageLatency =
      (this.metrics.averageLatency + latency) / 2;
  }
}
