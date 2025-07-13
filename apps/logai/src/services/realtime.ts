import { io, Socket } from 'socket.io-client';

interface AuthEvent {
  type: 'login' | 'logout' | 'register' | 'permission_update' | 'session_expire';
  userId: string;
  data: any;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

interface SecurityEvent {
  type: 'suspicious_activity' | 'failed_login' | 'rate_limit' | 'security_breach';
  userId?: string;
  data: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

class LogaiRealtimeService {
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
          console.log('🔐 LOGAI Real-time connection established');
          this.isConnected = true;
          
          // Join LOGAI-specific channels
          this.joinChannel('logai-global');
          this.joinChannel('auth-events');
          this.joinChannel('security-alerts');
          
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          console.error('❌ LOGAI Real-time connection failed:', error);
          this.isConnected = false;
          reject(error);
        });
      });
    } catch (error) {
      console.error('❌ Failed to initialize LOGAI real-time connection:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 LOGAI disconnected:', reason);
      this.isConnected = false;
      this.emit('connection:lost', { reason });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 LOGAI reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.emit('connection:restored', { attemptNumber });
    });

    // Authentication events
    this.socket.on('auth:login', (data: AuthEvent) => {
      this.handleAuthEvent('login', data);
    });

    this.socket.on('auth:logout', (data: AuthEvent) => {
      this.handleAuthEvent('logout', data);
    });

    this.socket.on('auth:register', (data: AuthEvent) => {
      this.handleAuthEvent('register', data);
    });

    this.socket.on('auth:permission_update', (data: AuthEvent) => {
      this.handleAuthEvent('permission_update', data);
    });

    this.socket.on('auth:session_expire', (data: AuthEvent) => {
      this.handleAuthEvent('session_expire', data);
    });

    // Security events
    this.socket.on('security:alert', (data: SecurityEvent) => {
      this.handleSecurityEvent(data);
    });

    this.socket.on('security:breach', (data: SecurityEvent) => {
      this.handleSecurityEvent(data);
    });

    // System events
    this.socket.on('system:status', (data) => {
      this.emit('system:status', data);
    });

    this.socket.on('error', (error) => {
      console.error('❌ LOGAI Real-time error:', error);
      this.emit('error', error);
    });
  }

  private handleAuthEvent(eventType: string, data: AuthEvent): void {
    this.emit(`auth:${eventType}`, data);
    this.emit('auth:change', { type: eventType, ...data });
    
    // Emit user-specific events
    if (data.userId) {
      this.emit(`user:${data.userId}:auth`, { type: eventType, ...data });
    }
  }

  private handleSecurityEvent(data: SecurityEvent): void {
    this.emit(`security:${data.type}`, data);
    this.emit('security:alert', data);
    
    // Emit severity-specific events
    this.emit(`security:${data.severity}`, data);
    
    // Emit user-specific security events
    if (data.userId) {
      this.emit(`user:${data.userId}:security`, data);
    }
  }

  // Authentication operations
  broadcastLogin(userId: string, sessionData: any, metadata?: any): void {
    this.sendMessage('auth:login', {
      userId,
      sessionData,
      metadata,
      timestamp: Date.now(),
    });
  }

  broadcastLogout(userId: string, reason?: string): void {
    this.sendMessage('auth:logout', {
      userId,
      reason,
      timestamp: Date.now(),
    });
  }

  broadcastRegistration(userId: string, userData: any): void {
    this.sendMessage('auth:register', {
      userId,
      userData,
      timestamp: Date.now(),
    });
  }

  broadcastPermissionUpdate(userId: string, permissions: string[], roles: string[]): void {
    this.sendMessage('auth:permission_update', {
      userId,
      permissions,
      roles,
      timestamp: Date.now(),
    });
  }

  broadcastSessionExpiry(userId: string, sessionId: string): void {
    this.sendMessage('auth:session_expire', {
      userId,
      sessionId,
      timestamp: Date.now(),
    });
  }

  // Security operations
  broadcastSecurityAlert(type: SecurityEvent['type'], severity: SecurityEvent['severity'], data: any, userId?: string): void {
    this.sendMessage('security:alert', {
      type,
      severity,
      data,
      userId,
      timestamp: Date.now(),
    });
  }

  broadcastFailedLogin(userId: string, ipAddress: string, reason: string): void {
    this.broadcastSecurityAlert('failed_login', 'medium', {
      userId,
      ipAddress,
      reason,
    }, userId);
  }

  broadcastSuspiciousActivity(userId: string, activity: string, details: any): void {
    this.broadcastSecurityAlert('suspicious_activity', 'high', {
      activity,
      details,
    }, userId);
  }

  broadcastRateLimit(ipAddress: string, endpoint: string): void {
    this.broadcastSecurityAlert('rate_limit', 'low', {
      ipAddress,
      endpoint,
    });
  }

  broadcastSecurityBreach(type: string, details: any): void {
    this.broadcastSecurityAlert('security_breach', 'critical', {
      type,
      details,
    });
  }

  // Session management
  broadcastActiveSession(userId: string, sessionData: any): void {
    this.sendMessage('session:active', {
      userId,
      sessionData,
      timestamp: Date.now(),
    });
  }

  broadcastSessionUpdate(userId: string, sessionId: string, updates: any): void {
    this.sendMessage('session:update', {
      userId,
      sessionId,
      updates,
      timestamp: Date.now(),
    });
  }

  // User management
  joinUserRoom(userId: string): void {
    if (!this.socket) return;
    this.socket.emit('joinRoom', { roomId: `user:${userId}` });
  }

  leaveUserRoom(userId: string): void {
    if (!this.socket) return;
    this.socket.emit('leaveRoom', { roomId: `user:${userId}` });
  }

  // Admin operations
  broadcastAdminAction(adminUserId: string, action: string, targetUserId?: string, details?: any): void {
    this.sendMessage('admin:action', {
      adminUserId,
      action,
      targetUserId,
      details,
      timestamp: Date.now(),
    });
  }

  // System status
  broadcastSystemStatus(status: 'healthy' | 'degraded' | 'down', details?: string): void {
    this.sendMessage('system:status', {
      status,
      details,
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

  // Message sending
  private sendMessage(type: string, payload: any): void {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ Cannot send LOGAI message: not connected to real-time server');
      return;
    }

    this.socket.emit('message', {
      type,
      payload,
      channel: 'logai-global',
      priority: payload.severity === 'critical' ? 'critical' : 'normal',
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
          console.error(`Error in LOGAI event listener for ${event}:`, error);
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
export const logaiRealtimeService = new LogaiRealtimeService();

// Export types
export type { AuthEvent, SecurityEvent };
