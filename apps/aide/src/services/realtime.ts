import { io, Socket } from 'socket.io-client';

interface RealtimeMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  sender: string;
  target?: string;
  channel?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

interface CollaborationData {
  type: 'cursor' | 'selection' | 'edit' | 'file_change';
  data: any;
  userId: string;
  timestamp: number;
}

interface RealtimeConfig {
  url: string;
  token?: string;
  autoConnect?: boolean;
}

class AideRealtimeService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventListeners: Map<string, Set<Function>> = new Map();

  // Connection Management
  async connect(config: RealtimeConfig): Promise<void> {
    try {
      this.socket = io(config.url, {
        autoConnect: config.autoConnect !== false,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000,
        transports: ['websocket', 'polling'],
        auth: config.token ? { token: config.token } : undefined,
      });

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        this.socket!.on('connect', () => {
          console.log('🔗 AIDE Real-time connection established');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Join AIDE-specific channels
          this.joinChannel('aide-global');
          this.joinChannel('development');
          
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          console.error('❌ AIDE Real-time connection failed:', error);
          this.isConnected = false;
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Failed to initialize AIDE real-time connection:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 AIDE disconnected from real-time server:', reason);
      this.isConnected = false;
      this.emit('connection:lost', { reason });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 AIDE reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.emit('connection:restored', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 AIDE reconnection attempt', attemptNumber);
      this.reconnectAttempts = attemptNumber;
      this.emit('connection:attempting', { attemptNumber });
    });

    // Message handling
    this.socket.on('message', (message: RealtimeMessage) => {
      this.handleMessage(message);
    });

    // Collaboration events
    this.socket.on('collaboration', (data: CollaborationData) => {
      this.handleCollaboration(data);
    });

    // System events
    this.socket.on('system:status', (data) => {
      this.emit('system:status', data);
    });

    this.socket.on('error', (error) => {
      console.error('❌ AIDE Real-time error:', error);
      this.emit('error', error);
    });
  }

  // Message Handling
  private handleMessage(message: RealtimeMessage): void {
    // Emit to specific message type listeners
    this.emit(`message:${message.type}`, message);
    
    // Emit to general message listeners
    this.emit('message', message);

    // Handle AIDE-specific message types
    switch (message.type) {
      case 'code:change':
        this.handleCodeChange(message);
        break;
      case 'file:update':
        this.handleFileUpdate(message);
        break;
      case 'terminal:output':
        this.handleTerminalOutput(message);
        break;
      case 'project:status':
        this.handleProjectStatus(message);
        break;
      case 'build:result':
        this.handleBuildResult(message);
        break;
    }
  }

  private handleCollaboration(data: CollaborationData): void {
    this.emit('collaboration', data);
    this.emit(`collaboration:${data.type}`, data);

    switch (data.type) {
      case 'cursor':
        this.emit('cursor:move', data);
        break;
      case 'selection':
        this.emit('selection:change', data);
        break;
      case 'edit':
        this.emit('edit:apply', data);
        break;
      case 'file_change':
        this.emit('file:change', data);
        break;
    }
  }

  // AIDE-Specific Message Handlers
  private handleCodeChange(message: RealtimeMessage): void {
    this.emit('code:change', {
      file: message.payload.file,
      changes: message.payload.changes,
      author: message.sender,
      timestamp: message.timestamp,
    });
  }

  private handleFileUpdate(message: RealtimeMessage): void {
    this.emit('file:update', {
      path: message.payload.path,
      content: message.payload.content,
      operation: message.payload.operation, // 'create', 'update', 'delete'
      author: message.sender,
      timestamp: message.timestamp,
    });
  }

  private handleTerminalOutput(message: RealtimeMessage): void {
    this.emit('terminal:output', {
      output: message.payload.output,
      command: message.payload.command,
      sessionId: message.payload.sessionId,
      timestamp: message.timestamp,
    });
  }

  private handleProjectStatus(message: RealtimeMessage): void {
    this.emit('project:status', {
      status: message.payload.status, // 'building', 'ready', 'error'
      details: message.payload.details,
      timestamp: message.timestamp,
    });
  }

  private handleBuildResult(message: RealtimeMessage): void {
    this.emit('build:result', {
      success: message.payload.success,
      output: message.payload.output,
      errors: message.payload.errors,
      warnings: message.payload.warnings,
      timestamp: message.timestamp,
    });
  }

  // Sending Messages
  sendMessage(type: string, payload: any, target?: string, priority: 'low' | 'normal' | 'high' | 'critical' = 'normal'): void {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot send message: not connected to real-time server');
      return;
    }

    const message: Omit<RealtimeMessage, 'id' | 'timestamp' | 'sender'> = {
      type,
      payload,
      target,
      channel: 'aide-global',
      priority,
    };

    this.socket.emit('message', message);
  }

  // Collaboration Methods
  broadcastCodeChange(file: string, changes: any): void {
    this.sendMessage('code:change', { file, changes }, undefined, 'high');
  }

  broadcastFileUpdate(path: string, content: string, operation: 'create' | 'update' | 'delete'): void {
    this.sendMessage('file:update', { path, content, operation }, undefined, 'high');
  }

  broadcastCursorPosition(file: string, position: { line: number; column: number }): void {
    this.sendCollaboration('cursor', { file, position });
  }

  broadcastSelection(file: string, selection: { start: any; end: any }): void {
    this.sendCollaboration('selection', { file, selection });
  }

  private sendCollaboration(type: CollaborationData['type'], data: any): void {
    if (!this.isConnected || !this.socket) return;

    this.socket.emit('collaboration', {
      type,
      data,
      userId: 'current-user', // Should be replaced with actual user ID
      timestamp: Date.now(),
    });
  }

  // Terminal Integration
  shareTerminalOutput(command: string, output: string, sessionId: string): void {
    this.sendMessage('terminal:output', { command, output, sessionId }, undefined, 'normal');
  }

  // Project Status
  updateProjectStatus(status: 'building' | 'ready' | 'error', details?: string): void {
    this.sendMessage('project:status', { status, details }, undefined, 'high');
  }

  // Build Results
  broadcastBuildResult(success: boolean, output: string, errors?: string[], warnings?: string[]): void {
    this.sendMessage('build:result', { success, output, errors, warnings }, undefined, 'high');
  }

  // Channel Management
  joinChannel(channel: string): void {
    if (!this.socket) return;
    this.socket.emit('subscribe', { channels: [channel] });
  }

  leaveChannel(channel: string): void {
    if (!this.socket) return;
    this.socket.emit('unsubscribe', { channels: [channel] });
  }

  // Room Management for Projects
  joinProject(projectId: string): void {
    if (!this.socket) return;
    this.socket.emit('joinRoom', { roomId: `project:${projectId}` });
  }

  leaveProject(projectId: string): void {
    if (!this.socket) return;
    this.socket.emit('leaveRoom', { roomId: `project:${projectId}` });
  }

  // Event Management
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
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Utility Methods
  getConnectionStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  getLatency(): Promise<number> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve(-1);
        return;
      }

      const start = Date.now();
      this.socket.emit('ping');
      this.socket.once('pong', () => {
        resolve(Date.now() - start);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
  }
}

// Export singleton instance
export const aideRealtimeService = new AideRealtimeService();

// Export types for use in components
export type { RealtimeMessage, CollaborationData, RealtimeConfig };
