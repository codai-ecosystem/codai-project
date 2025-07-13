import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { env } from '../config/env';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface ProjectMetrics {
  activeUsers: number;
  tasksCompleted: number;
  aiInteractions: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  lastUpdated: number;
}

export class WebSocketService {
  private io: SocketIOServer | null = null;
  private server: HTTPServer | null = null;
  private connections: Map<string, any> = new Map();

  initialize(server: HTTPServer): void {
    this.server = server;
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.connections.set(socket.id, socket);

      // Join user-specific room
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined room`);
      });

      // Join project-specific room
      socket.on('join-project-room', (projectId: string) => {
        socket.join(`project:${projectId}`);
        console.log(`Joined project room: ${projectId}`);
      });

      // Handle AI interaction events
      socket.on('ai-interaction', (data) => {
        this.broadcastToProject(data.projectId, 'ai-activity', {
          type: 'interaction',
          userId: data.userId,
          timestamp: Date.now()
        });
      });

      // Handle system events
      socket.on('system-event', (data) => {
        this.broadcast('system-update', data);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connections.delete(socket.id);
      });
    });
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, {
      ...data,
      timestamp: Date.now()
    });
  }

  // Broadcast to specific user
  broadcastToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: Date.now()
    });
  }

  // Broadcast to specific project
  broadcastToProject(projectId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`project:${projectId}`).emit(event, {
      ...data,
      timestamp: Date.now()
    });
  }

  // Send real-time metrics update
  broadcastMetrics(metrics: ProjectMetrics): void {
    this.broadcast('metrics-update', metrics);
  }

  // Send AI response stream
  streamAIResponse(sessionId: string, chunk: string, isComplete: boolean = false): void {
    this.broadcast('ai-stream', {
      sessionId,
      chunk,
      isComplete,
      timestamp: Date.now()
    });
  }

  // Send system health update
  broadcastSystemHealth(health: any): void {
    this.broadcast('system-health', {
      ...health,
      timestamp: Date.now()
    });
  }

  // Get connected clients count
  getConnectionCount(): number {
    return this.connections.size;
  }

  // Get connected clients for a room
  getClientCount(room: string): Promise<number> {
    return new Promise((resolve) => {
      if (!this.io) {
        resolve(0);
        return;
      }
      this.io.in(room).allSockets().then(sockets => {
        resolve(sockets.size);
      });
    });
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();

// Client-side WebSocket helper
export class WebSocketClient {
  private socket: any = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string = env.WEBSOCKET_URL): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Note: This would need socket.io-client on the client side
        // For now, this is a placeholder for the client implementation
        console.log(`Connecting to WebSocket: ${url}`);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  joinUserRoom(userId: string): void {
    this.emit('join-user-room', userId);
  }

  joinProjectRoom(projectId: string): void {
    this.emit('join-project-room', projectId);
  }
}

export default webSocketService;
