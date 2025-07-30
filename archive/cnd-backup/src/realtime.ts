// Real-time Engine for live queries and subscriptions
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { CBDAdapter } from './cbd-adapter.js';
import { RealtimeSubscription, CNDError } from './types.js';
import WebSocket from 'ws';

export class RealtimeEngine {
  private isRunning: boolean = false;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private querySubjects: Map<string, Subject<any>> = new Map();
  private websocketServer?: WebSocket.Server;
  private connectedClients: Set<WebSocket> = new Set();

  constructor(
    private adapter: CBDAdapter,
    private config?: { enabled?: boolean; websocketPort?: number }
  ) { }

  async start(): Promise<void> {
    if (!this.config?.enabled) {
      console.log('Realtime Engine: Disabled in configuration');
      return;
    }

    try {
      const port = this.config.websocketPort || 8081;
      this.websocketServer = new WebSocket.Server({ port });

      this.websocketServer.on('connection', (ws) => {
        this.handleClientConnection(ws);
      });

      this.isRunning = true;
      console.log(`Realtime Engine: Started on port ${port}`);
    } catch (error) {
      throw new CNDError(
        `Failed to start realtime engine: ${error}`,
        'REALTIME_START_ERROR',
        { config: this.config }
      );
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.websocketServer) {
        this.websocketServer.close();
        this.websocketServer = undefined;
      }

      // Close all subscriptions
      for (const subscription of this.subscriptions.values()) {
        subscription.unsubscribe();
      }

      this.subscriptions.clear();
      this.querySubjects.clear();
      this.connectedClients.clear();
      this.isRunning = false;

      console.log('Realtime Engine: Stopped');
    } catch (error) {
      throw new CNDError(
        `Failed to stop realtime engine: ${error}`,
        'REALTIME_STOP_ERROR'
      );
    }
  }

  subscribe<T>(query: string): Observable<T[]> {
    try {
      const queryHash = this.hashQuery(query);

      // Return existing observable if already subscribed
      if (this.querySubjects.has(queryHash)) {
        return this.querySubjects.get(queryHash)!.asObservable();
      }

      // Create new subscription
      const subject = new BehaviorSubject<T[]>([]);
      this.querySubjects.set(queryHash, subject);

      const subscription: RealtimeSubscription = {
        id: queryHash,
        query,
        callback: (data: T[]) => subject.next(data),
        unsubscribe: () => {
          this.subscriptions.delete(queryHash);
          this.querySubjects.delete(queryHash);
          subject.complete();
        }
      };

      this.subscriptions.set(queryHash, subscription);

      // Start monitoring the query
      this.startQueryMonitoring(subscription);

      return subject.asObservable();
    } catch (error) {
      throw new CNDError(
        `Failed to create subscription: ${error}`,
        'REALTIME_SUBSCRIBE_ERROR',
        { query }
      );
    }
  }

  unsubscribe(queryOrId: string): boolean {
    const queryHash = this.isQueryHash(queryOrId) ? queryOrId : this.hashQuery(queryOrId);
    const subscription = this.subscriptions.get(queryHash);

    if (subscription) {
      subscription.unsubscribe();
      return true;
    }

    return false;
  }

  // Broadcast data changes to all subscribed clients
  broadcast(channel: string, data: any): void {
    if (!this.isRunning) return;

    const message = JSON.stringify({
      type: 'broadcast',
      channel,
      data,
      timestamp: new Date().toISOString()
    });

    this.connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Notify specific query subscribers
  notifyQuery(query: string, data: any): void {
    const queryHash = this.hashQuery(query);
    const subscription = this.subscriptions.get(queryHash);

    if (subscription) {
      subscription.callback(data);
    }

    // Also broadcast to WebSocket clients
    this.broadcast(`query:${queryHash}`, data);
  }

  // Get subscription statistics
  getStats(): {
    isRunning: boolean;
    subscriptions: number;
    connectedClients: number;
    port?: number;
  } {
    return {
      isRunning: this.isRunning,
      subscriptions: this.subscriptions.size,
      connectedClients: this.connectedClients.size,
      port: this.config?.websocketPort
    };
  }

  healthCheck(): { status: string; details: any } {
    return {
      status: this.isRunning ? 'healthy' : 'stopped',
      details: this.getStats()
    };
  }

  // Advanced real-time features
  createRoom(roomId: string): RealtimeRoom {
    return new RealtimeRoom(roomId, this);
  }

  // Private methods
  private handleClientConnection(ws: WebSocket): void {
    console.log('Realtime Engine: Client connected');
    this.connectedClients.add(ws);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        this.handleClientMessage(ws, data);
      } catch (error) {
        console.error('Realtime Engine: Invalid message format:', error);
      }
    });

    ws.on('close', () => {
      console.log('Realtime Engine: Client disconnected');
      this.connectedClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('Realtime Engine: WebSocket error:', error);
      this.connectedClients.delete(ws);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      timestamp: new Date().toISOString()
    }));
  }

  private handleClientMessage(ws: WebSocket, message: any): void {
    switch (message.type) {
      case 'subscribe':
        this.handleClientSubscribe(ws, message);
        break;
      case 'unsubscribe':
        this.handleClientUnsubscribe(ws, message);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
      default:
        console.warn('Realtime Engine: Unknown message type:', message.type);
    }
  }

  private handleClientSubscribe(ws: WebSocket, message: any): void {
    const { query, queryId } = message;
    if (!query) return;

    const queryHash = queryId || this.hashQuery(query);

    // Add client to subscription
    (ws as any).subscriptions = (ws as any).subscriptions || new Set();
    (ws as any).subscriptions.add(queryHash);

    // Create subscription if it doesn't exist
    if (!this.subscriptions.has(queryHash)) {
      this.subscribe(query);
    }

    ws.send(JSON.stringify({
      type: 'subscribed',
      queryId: queryHash,
      query
    }));
  }

  private handleClientUnsubscribe(ws: WebSocket, message: any): void {
    const { queryId } = message;
    if (!queryId) return;

    if ((ws as any).subscriptions) {
      (ws as any).subscriptions.delete(queryId);
    }

    ws.send(JSON.stringify({
      type: 'unsubscribed',
      queryId
    }));
  }

  private startQueryMonitoring(subscription: RealtimeSubscription): void {
    // In real implementation, this would:
    // 1. Set up triggers or polling for the query
    // 2. Monitor CBD Engine for changes affecting the query
    // 3. Execute the query when changes are detected
    // 4. Call the subscription callback with new data

    console.log(`Realtime Engine: Started monitoring query ${subscription.id}`);

    // Simulate initial data fetch
    setTimeout(() => {
      // In real implementation, execute the actual query
      subscription.callback([]);
    }, 100);
  }

  private hashQuery(query: string): string {
    // Simple hash function for demo purposes
    // In real implementation, use a proper hash function
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private isQueryHash(str: string): boolean {
    // Check if string looks like a query hash
    return /^[a-z0-9]+$/.test(str) && str.length < 20;
  }
}

// Real-time room for collaborative features
export class RealtimeRoom {
  private members: Set<string> = new Set();
  private data: Map<string, any> = new Map();

  constructor(
    private roomId: string,
    private engine: RealtimeEngine
  ) { }

  join(userId: string): void {
    this.members.add(userId);
    this.engine.broadcast(`room:${this.roomId}:join`, { userId });
  }

  leave(userId: string): void {
    this.members.delete(userId);
    this.engine.broadcast(`room:${this.roomId}:leave`, { userId });
  }

  broadcast(event: string, data: any): void {
    this.engine.broadcast(`room:${this.roomId}:${event}`, data);
  }

  setData(key: string, value: any): void {
    this.data.set(key, value);
    this.engine.broadcast(`room:${this.roomId}:data`, { key, value });
  }

  getData(key: string): any {
    return this.data.get(key);
  }

  getMembers(): string[] {
    return Array.from(this.members);
  }

  getMemberCount(): number {
    return this.members.size;
  }
}
