import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const PORT = process.env.WS_PORT || 4900;
const JWT_SECRET = process.env.JWT_SECRET || 'codai-websocket-secret-key';
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4003';

// Types
interface WebSocketClient {
  id: string;
  socket: WebSocket;
  userId?: string;
  services: string[];
  lastPing: number;
}

interface WebSocketMessage {
  type: 'service_event' | 'user_message' | 'system_notification' | 'ping' | 'pong';
  data: any;
  timestamp: number;
  source?: string;
  target?: string;
}

// WebSocket Service Class
class WebSocketService {
  private app: express.Application;
  private server: any;
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();

  constructor() {
    this.app = express();
    this.setupExpress();
    this.server = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });
    this.setupWebSocket();
    this.startHealthMonitoring();
  }

  private setupExpress(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'CODAI WebSocket Service',
        version: '1.0.0',
        port: PORT,
        clients: this.clients.size,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // WebSocket stats endpoint
    this.app.get('/stats', (req, res) => {
      res.json({
        totalConnections: this.clients.size,
        activeConnections: Array.from(this.clients.values()).filter(
          client => client.socket.readyState === WebSocket.OPEN
        ).length,
        services: this.getActiveServices(),
        timestamp: new Date().toISOString()
      });
    });

    // Service event broadcast endpoint
    this.app.post('/broadcast', (req, res) => {
      try {
        const { type, data, target } = req.body;
        this.broadcastMessage({
          type: type || 'service_event',
          data,
          timestamp: Date.now(),
          target
        });
        res.json({ success: true, message: 'Message broadcasted' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to broadcast message' });
      }
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (socket: WebSocket, request: any) => {
      const clientId = uuidv4();
      const client: WebSocketClient = {
        id: clientId,
        socket,
        services: [],
        lastPing: Date.now()
      };

      this.clients.set(clientId, client);
      console.log(`🔌 Client connected: ${clientId} (Total: ${this.clients.size})`);

      // Send welcome message
      this.sendMessage(socket, {
        type: 'system_notification',
        data: {
          message: 'Connected to CODAI WebSocket Service',
          clientId,
          services: this.getAvailableServices()
        },
        timestamp: Date.now()
      });

      // Handle incoming messages
      socket.on('message', (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Handle connection close
      socket.on('close', () => {
        this.clients.delete(clientId);
        console.log(`🔌 Client disconnected: ${clientId} (Total: ${this.clients.size})`);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });
  }

  private handleMessage(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'ping':
        client.lastPing = Date.now();
        this.sendMessage(client.socket, {
          type: 'pong',
          data: { timestamp: Date.now() },
          timestamp: Date.now()
        });
        break;

      case 'service_event':
        // Broadcast service events to interested clients
        this.broadcastServiceEvent(message, clientId);
        break;

      case 'user_message':
        // Handle user-to-user messages
        this.handleUserMessage(message, clientId);
        break;

      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  }

  private sendMessage(socket: WebSocket, message: WebSocketMessage): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  private broadcastMessage(message: WebSocketMessage): void {
    const targetClients = message.target
      ? Array.from(this.clients.values()).filter(client =>
        client.services.includes(message.target!)
      )
      : Array.from(this.clients.values());

    targetClients.forEach(client => {
      this.sendMessage(client.socket, message);
    });
  }

  private broadcastServiceEvent(message: WebSocketMessage, senderId: string): void {
    const senderClient = this.clients.get(senderId);
    if (!senderClient) return;

    // Broadcast to all clients except sender
    this.clients.forEach((client, clientId) => {
      if (clientId !== senderId && client.socket.readyState === WebSocket.OPEN) {
        this.sendMessage(client.socket, {
          ...message,
          source: senderId
        });
      }
    });
  }

  private handleUserMessage(message: WebSocketMessage, senderId: string): void {
    const { target } = message.data;

    if (target && this.clients.has(target)) {
      const targetClient = this.clients.get(target)!;
      this.sendMessage(targetClient.socket, {
        ...message,
        source: senderId
      });
    }
  }

  private getActiveServices(): string[] {
    const services = new Set<string>();
    this.clients.forEach(client => {
      client.services.forEach(service => services.add(service));
    });
    return Array.from(services);
  }

  private async getAvailableServices(): Promise<string[]> {
    try {
      const response = await axios.get(`${GATEWAY_URL}/api/gateway/services`);
      return response.data.services?.map((s: any) => s.name) || [];
    } catch (error) {
      console.error('Failed to fetch services from Gateway:', error);
      return ['admin', 'id', 'hub', 'codai', 'bancai', 'memorai', 'cbd'];
    }
  }

  private startHealthMonitoring(): void {
    setInterval(() => {
      const now = Date.now();
      const staleClients: string[] = [];

      this.clients.forEach((client, clientId) => {
        // Remove clients that haven't pinged in 60 seconds
        if (now - client.lastPing > 60000) {
          staleClients.push(clientId);
        }
      });

      staleClients.forEach(clientId => {
        const client = this.clients.get(clientId);
        if (client) {
          client.socket.terminate();
          this.clients.delete(clientId);
          console.log(`🧹 Removed stale client: ${clientId}`);
        }
      });
    }, 30000); // Check every 30 seconds
  }

  public start(): void {
    this.server.listen(PORT, () => {
      console.log(`🚀 CODAI WebSocket Service running on port ${PORT}`);
      console.log(`📡 WebSocket: ws://localhost:${PORT}`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log(`📊 Stats: http://localhost:${PORT}/stats`);
      console.log(`📡 Broadcast API: POST http://localhost:${PORT}/broadcast`);
      console.log(`🔄 Real-time features ready!`);
    });
  }
}

// Start the service
if (require.main === module) {
  const wsService = new WebSocketService();
  wsService.start();
}

export default WebSocketService;
