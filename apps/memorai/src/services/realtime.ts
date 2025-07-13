import { io, Socket } from 'socket.io-client';

interface MemoryEvent {
  type: 'create' | 'update' | 'delete' | 'search' | 'sync';
  data: any;
  agentId?: string;
  memoryId?: string;
  timestamp: number;
}

interface RealtimeQuery {
  id: string;
  query: string;
  results: any[];
  timestamp: number;
  agentId: string;
}

class MemoraiRealtimeService {
  private socket: Socket | null = null;
  private isConnected = false;
  private eventListeners: Map<string, Set<Function>> = new Map();

  async connect(config: { url: string; token?: string }): Promise<void> {
    try {
      this.socket = io(config.url, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
        auth: config.token ? { token: config.token } : undefined,
      });

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        this.socket!.on('connect', () => {
          console.log('🧠 MEMORAI Real-time connection established');
          this.isConnected = true;
          
          // Join MEMORAI-specific channels
          this.joinChannel('memorai-global');
          this.joinChannel('memory-updates');
          this.joinChannel('search-results');
          
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          console.error('❌ MEMORAI Real-time connection failed:', error);
          this.isConnected = false;
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Failed to initialize MEMORAI real-time connection:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 MEMORAI disconnected:', reason);
      this.isConnected = false;
      this.emit('connection:lost', { reason });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 MEMORAI reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.emit('connection:restored', { attemptNumber });
    });

    // Memory events
    this.socket.on('memory:created', (data: MemoryEvent) => {
      this.handleMemoryEvent('created', data);
    });

    this.socket.on('memory:updated', (data: MemoryEvent) => {
      this.handleMemoryEvent('updated', data);
    });

    this.socket.on('memory:deleted', (data: MemoryEvent) => {
      this.handleMemoryEvent('deleted', data);
    });

    this.socket.on('memory:searched', (data: RealtimeQuery) => {
      this.handleSearchEvent(data);
    });

    this.socket.on('memory:synced', (data: MemoryEvent) => {
      this.handleMemoryEvent('synced', data);
    });

    // Agent events
    this.socket.on('agent:connected', (data) => {
      this.emit('agent:connected', data);
    });

    this.socket.on('agent:disconnected', (data) => {
      this.emit('agent:disconnected', data);
    });

    // System events
    this.socket.on('system:status', (data) => {
      this.emit('system:status', data);
    });

    this.socket.on('error', (error) => {
      console.error('❌ MEMORAI Real-time error:', error);
      this.emit('error', error);
    });
  }

  private handleMemoryEvent(eventType: string, data: MemoryEvent): void {
    this.emit(`memory:${eventType}`, data);
    this.emit('memory:change', { type: eventType, ...data });
    
    // Emit agent-specific events
    if (data.agentId) {
      this.emit(`agent:${data.agentId}:memory:${eventType}`, data);
    }
  }

  private handleSearchEvent(data: RealtimeQuery): void {
    this.emit('search:completed', data);
    this.emit(`search:${data.id}`, data);
    
    // Emit agent-specific search events
    if (data.agentId) {
      this.emit(`agent:${data.agentId}:search`, data);
    }
  }

  // Memory operations
  broadcastMemoryCreated(agentId: string, memoryId: string, content: string, metadata?: any): void {
    this.sendMessage('memory:create', {
      agentId,
      memoryId,
      content,
      metadata,
      timestamp: Date.now(),
    });
  }

  broadcastMemoryUpdated(agentId: string, memoryId: string, content: string, metadata?: any): void {
    this.sendMessage('memory:update', {
      agentId,
      memoryId,
      content,
      metadata,
      timestamp: Date.now(),
    });
  }

  broadcastMemoryDeleted(agentId: string, memoryId: string): void {
    this.sendMessage('memory:delete', {
      agentId,
      memoryId,
      timestamp: Date.now(),
    });
  }

  // Search operations
  broadcastSearch(agentId: string, query: string, queryId: string): void {
    this.sendMessage('memory:search', {
      agentId,
      query,
      queryId,
      timestamp: Date.now(),
    });
  }

  broadcastSearchResults(queryId: string, results: any[], agentId: string): void {
    this.sendMessage('search:results', {
      queryId,
      results,
      agentId,
      timestamp: Date.now(),
    });
  }

  // Context operations
  broadcastContextUpdate(agentId: string, context: any): void {
    this.sendMessage('context:update', {
      agentId,
      context,
      timestamp: Date.now(),
    });
  }

  // Analytics operations
  broadcastUsageMetrics(agentId: string, metrics: any): void {
    this.sendMessage('analytics:usage', {
      agentId,
      metrics,
      timestamp: Date.now(),
    });
  }

  // Agent management
  registerAgent(agentId: string, metadata: any): void {
    this.sendMessage('agent:register', {
      agentId,
      metadata,
      timestamp: Date.now(),
    });
  }

  unregisterAgent(agentId: string): void {
    this.sendMessage('agent:unregister', {
      agentId,
      timestamp: Date.now(),
    });
  }

  // Channel management
  private joinChannel(channel: string): void {
    if (!this.socket) return;
    this.socket.emit('subscribe', { channels: [channel] });
  }

  private leaveChannel(channel: string): void {
    if (!this.socket) return;
    this.socket.emit('unsubscribe', { channels: [channel] });
  }

  // Room management for agents
  joinAgentRoom(agentId: string): void {
    if (!this.socket) return;
    this.socket.emit('joinRoom', { roomId: `agent:${agentId}` });
  }

  leaveAgentRoom(agentId: string): void {
    if (!this.socket) return;
    this.socket.emit('leaveRoom', { roomId: `agent:${agentId}` });
  }

  // Message sending
  private sendMessage(type: string, payload: any): void {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot send MEMORAI message: not connected to real-time server');
      return;
    }

    this.socket.emit('message', {
      type,
      payload,
      channel: 'memorai-global',
      priority: 'normal',
    });
  }

  // Event management
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in MEMORAI event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  getConnectionStatus(): { connected: boolean } {
    return { connected: this.isConnected };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const memoraiRealtimeService = new MemoraiRealtimeService();

// Export types
export type { MemoryEvent, RealtimeQuery };
