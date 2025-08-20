import { z } from 'zod';
import { EventBus } from '../event-bus';

export const RealtimeServiceSchema = z.object({
  enabled: z.boolean().default(true),
  provider: z.enum(['websocket', 'sse', 'socket.io']).default('websocket'),
  config: z.object({
    port: z.number().default(3001),
    cors: z.object({
      origin: z.array(z.string()).default(['http://localhost:3000']),
      credentials: z.boolean().default(true),
    }),
    heartbeat: z.object({
      interval: z.number().default(30000), // 30 seconds
      timeout: z.number().default(60000), // 60 seconds
    }),
  }),
});

export type RealtimeServiceConfig = z.infer<typeof RealtimeServiceSchema>;

export interface RealtimeClient {
  id: string;
  userId?: string;
  projectId?: string;
  connectedAt: Date;
  lastPing: Date;
  metadata: Record<string, any>;
}

export interface RealtimeMessage {
  type: string;
  payload: any;
  from?: string;
  to?: string;
  broadcast?: boolean;
  timestamp: Date;
}

export interface RealtimeRoom {
  id: string;
  name: string;
  type: 'project' | 'team' | 'global';
  clients: Set<string>;
  createdAt: Date;
  metadata: Record<string, any>;
}

export type RealtimeEventHandler = (message: RealtimeMessage, client: RealtimeClient) => void | Promise<void>;

export class RealtimeService {
  private eventBus: EventBus;
  private config: RealtimeServiceConfig;
  private initialized = false;
  private clients = new Map<string, RealtimeClient>();
  private rooms = new Map<string, RealtimeRoom>();
  private eventHandlers = new Map<string, RealtimeEventHandler[]>();
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(config: RealtimeServiceConfig, eventBus: EventBus) {
    this.config = RealtimeServiceSchema.parse(config);
    this.eventBus = eventBus;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('⚡ Initializing Realtime Service...');

    // Start WebSocket server or initialize provider
    await this.initializeProvider();

    // Setup heartbeat monitoring
    this.setupHeartbeat();

    // Create default rooms
    this.createRoom('global', 'Global Chat', 'global');

    this.initialized = true;
    console.log('✅ Realtime Service initialized');

    await this.eventBus.emit({
      eventType: 'performance',
      timestamp: new Date(),
      data: {
        action: 'realtime_service_initialized',
        provider: this.config.provider,
        port: this.config.config.port,
      },
    });
  }

  private async initializeProvider(): Promise<void> {
    console.log(`Initializing ${this.config.provider} realtime provider...`);
    // Provider-specific initialization would go here
  }

  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const timeout = this.config.config.heartbeat.timeout;

      // Check for timed out clients
      for (const [clientId, client] of this.clients.entries()) {
        if (now.getTime() - client.lastPing.getTime() > timeout) {
          console.log(`Client ${clientId} timed out, disconnecting...`);
          this.disconnectClient(clientId);
        }
      }
    }, this.config.config.heartbeat.interval);
  }

  async connectClient(clientData: Omit<RealtimeClient, 'id' | 'connectedAt' | 'lastPing'>): Promise<RealtimeClient> {
    const client: RealtimeClient = {
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      connectedAt: new Date(),
      lastPing: new Date(),
      ...clientData,
    };

    this.clients.set(client.id, client);

    // Join global room by default
    await this.joinRoom(client.id, 'global');

    console.log(`Client connected: ${client.id} (User: ${client.userId || 'anonymous'})`);

    await this.eventBus.emit({
      eventType: 'user_action',
      timestamp: new Date(),
      userId: client.userId,
      data: {
        action: 'realtime_connected',
        clientId: client.id,
      },
    });

    return client;
  }

  async disconnectClient(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from all rooms
    for (const room of this.rooms.values()) {
      room.clients.delete(clientId);
    }

    this.clients.delete(clientId);

    console.log(`Client disconnected: ${clientId}`);

    await this.eventBus.emit({
      eventType: 'user_action',
      timestamp: new Date(),
      userId: client.userId,
      data: {
        action: 'realtime_disconnected',
        clientId,
      },
    });
  }

  async sendMessage(message: RealtimeMessage, clientId?: string): Promise<void> {
    if (clientId) {
      // Send to specific client
      const client = this.clients.get(clientId);
      if (client) {
        await this.deliverMessage(message, client);
      }
    } else if (message.to) {
      // Send to specific recipient
      const recipient = this.clients.get(message.to);
      if (recipient) {
        await this.deliverMessage(message, recipient);
      }
    } else if (message.broadcast) {
      // Broadcast to all clients
      for (const client of this.clients.values()) {
        await this.deliverMessage(message, client);
      }
    }

    await this.eventBus.emit({
      eventType: 'performance',
      timestamp: new Date(),
      data: {
        action: 'realtime_message_sent',
        type: message.type,
        broadcast: message.broadcast,
      },
    });
  }

  private async deliverMessage(message: RealtimeMessage, client: RealtimeClient): Promise<void> {
    // In a real implementation, this would send the message through WebSocket
    console.log(`Delivering message to ${client.id}:`, message.type);
  }

  async createRoom(id: string, name: string, type: RealtimeRoom['type']): Promise<RealtimeRoom> {
    const room: RealtimeRoom = {
      id,
      name,
      type,
      clients: new Set(),
      createdAt: new Date(),
      metadata: {},
    };

    this.rooms.set(id, room);
    console.log(`Created room: ${name} (${type})`);

    return room;
  }

  async joinRoom(clientId: string, roomId: string): Promise<boolean> {
    const client = this.clients.get(clientId);
    const room = this.rooms.get(roomId);

    if (!client || !room) return false;

    room.clients.add(clientId);
    console.log(`Client ${clientId} joined room ${roomId}`);

    // Notify other clients in the room
    await this.sendToRoom(roomId, {
      type: 'user_joined',
      payload: { userId: client.userId, clientId },
      timestamp: new Date(),
    }, clientId);

    return true;
  }

  async leaveRoom(clientId: string, roomId: string): Promise<boolean> {
    const client = this.clients.get(clientId);
    const room = this.rooms.get(roomId);

    if (!client || !room) return false;

    room.clients.delete(clientId);
    console.log(`Client ${clientId} left room ${roomId}`);

    // Notify other clients in the room
    await this.sendToRoom(roomId, {
      type: 'user_left',
      payload: { userId: client.userId, clientId },
      timestamp: new Date(),
    }, clientId);

    return true;
  }

  async sendToRoom(roomId: string, message: RealtimeMessage, excludeClient?: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const clientId of room.clients) {
      if (excludeClient && clientId === excludeClient) continue;

      const client = this.clients.get(clientId);
      if (client) {
        await this.deliverMessage(message, client);
      }
    }
  }

  on(eventType: string, handler: RealtimeEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  async emit(eventType: string, message: RealtimeMessage, client: RealtimeClient): Promise<void> {
    const handlers = this.eventHandlers.get(eventType) || [];
    for (const handler of handlers) {
      try {
        await handler(message, client);
      } catch (error) {
        console.error(`Error in realtime event handler for ${eventType}:`, error);
      }
    }
  }

  async ping(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastPing = new Date();
    }
  }

  getConnectedClients(): RealtimeClient[] {
    return Array.from(this.clients.values());
  }

  getRooms(): RealtimeRoom[] {
    return Array.from(this.rooms.values());
  }

  getClientsByRoom(roomId: string): RealtimeClient[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.clients)
      .map(clientId => this.clients.get(clientId))
      .filter(client => client !== undefined) as RealtimeClient[];
  }

  async cleanup(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.clients.clear();
    this.rooms.clear();
    this.eventHandlers.clear();
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getConfig(): RealtimeServiceConfig {
    return this.config;
  }
}

export default RealtimeService;
