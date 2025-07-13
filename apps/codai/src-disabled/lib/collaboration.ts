import React from 'react';

// Real-time collaboration service using WebSocket
export class CollaborationService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private eventListeners: Map<string, Function[]> = new Map();

    constructor(private workspaceId: string, private userId: string, private userToken: string) { }

    // Connect to collaboration server
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
                const url = `${wsUrl}/collaboration/${this.workspaceId}?userId=${this.userId}&token=${this.userToken}`;

                this.ws = new WebSocket(url);

                this.ws.onopen = () => {
                    console.log('✅ Collaboration WebSocket connected');
                    this.reconnectAttempts = 0;
                    this.startHeartbeat();
                    this.emit('connected', { workspaceId: this.workspaceId });
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('❌ Failed to parse WebSocket message:', error);
                    }
                };

                this.ws.onclose = (event) => {
                    console.log('🔌 Collaboration WebSocket disconnected:', event.code);
                    this.stopHeartbeat();
                    this.emit('disconnected', { code: event.code, reason: event.reason });

                    // Attempt to reconnect unless it was a clean close
                    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.scheduleReconnect();
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('❌ Collaboration WebSocket error:', error);
                    this.emit('error', error);
                    reject(error);
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    // Disconnect from collaboration server
    disconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        this.stopHeartbeat();

        if (this.ws) {
            this.ws.close(1000, 'User disconnected');
            this.ws = null;
        }
    }

    // Send real-time edit to other collaborators
    sendEdit(edit: {
        fileId: string;
        type: 'insert' | 'delete' | 'replace';
        position: { line: number; column: number };
        content: string;
        timestamp: Date;
    }): void {
        this.send('edit', {
            ...edit,
            userId: this.userId,
            workspaceId: this.workspaceId
        });
    }

    // Send cursor position update
    sendCursorUpdate(cursor: {
        fileId: string;
        position: { line: number; column: number };
    }): void {
        this.send('cursor', {
            ...cursor,
            userId: this.userId,
            workspaceId: this.workspaceId,
            timestamp: new Date()
        });
    }

    // Send file selection update
    sendFileSelection(fileId: string): void {
        this.send('file_selection', {
            fileId,
            userId: this.userId,
            workspaceId: this.workspaceId,
            timestamp: new Date()
        });
    }

    // Send user status update
    sendStatusUpdate(status: 'online' | 'away' | 'offline'): void {
        this.send('status', {
            status,
            userId: this.userId,
            workspaceId: this.workspaceId,
            timestamp: new Date()
        });
    }

    // Request workspace sync
    requestSync(): void {
        this.send('sync_request', {
            userId: this.userId,
            workspaceId: this.workspaceId,
            timestamp: new Date()
        });
    }

    // Save file collaboratively
    saveFile(fileId: string, content: string): void {
        this.send('file_save', {
            fileId,
            content,
            userId: this.userId,
            workspaceId: this.workspaceId,
            timestamp: new Date()
        });
    }

    // Start screen sharing session
    startScreenShare(): void {
        this.send('screen_share_start', {
            userId: this.userId,
            workspaceId: this.workspaceId,
            timestamp: new Date()
        });
    }

    // Stop screen sharing session
    stopScreenShare(): void {
        this.send('screen_share_stop', {
            userId: this.userId,
            workspaceId: this.workspaceId,
            timestamp: new Date()
        });
    }

    // Start voice chat
    startVoiceChat(): void {
        this.send('voice_start', {
            userId: this.userId,
            workspaceId: this.workspaceId,
            timestamp: new Date()
        });
    }

    // Stop voice chat
    stopVoiceChat(): void {
        this.send('voice_stop', {
            userId: this.userId,
            workspaceId: this.workspaceId,
            timestamp: new Date()
        });
    }

    // Event listener management
    on(event: string, callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(callback);
    }

    off(event: string, callback: Function): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    private emit(event: string, data: any): void {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    private send(type: string, data: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify({ type, data }));
            } catch (error) {
                console.error('❌ Failed to send WebSocket message:', error);
            }
        } else {
            console.warn('⚠️ WebSocket not connected, message queued');
            // In production, implement message queuing
        }
    }

    private handleMessage(message: { type: string; data: any }): void {
        const { type, data } = message;

        switch (type) {
            case 'edit':
                this.emit('edit_received', data);
                break;

            case 'cursor':
                this.emit('cursor_update', data);
                break;

            case 'file_selection':
                this.emit('file_selection_update', data);
                break;

            case 'status':
                this.emit('user_status_update', data);
                break;

            case 'user_joined':
                this.emit('user_joined', data);
                break;

            case 'user_left':
                this.emit('user_left', data);
                break;

            case 'workspace_sync':
                this.emit('workspace_sync', data);
                break;

            case 'file_saved':
                this.emit('file_saved', data);
                break;

            case 'screen_share_started':
                this.emit('screen_share_started', data);
                break;

            case 'screen_share_stopped':
                this.emit('screen_share_stopped', data);
                break;

            case 'voice_started':
                this.emit('voice_started', data);
                break;

            case 'voice_stopped':
                this.emit('voice_stopped', data);
                break;

            case 'error':
                this.emit('collaboration_error', data);
                break;

            case 'pong':
                // Heartbeat response - connection is alive
                break;

            default:
                console.warn('⚠️ Unknown message type:', type);
        }
    }

    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.send('ping', { timestamp: new Date() });
            }
        }, 30000); // 30 seconds
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private scheduleReconnect(): void {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff, max 30s
        this.reconnectAttempts++;

        console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

        this.reconnectTimeout = setTimeout(() => {
            console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect().catch(error => {
                console.error('❌ Reconnect failed:', error);
            });
        }, delay);
    }

    // Check if connected
    isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    // Get connection state
    getConnectionState(): 'connecting' | 'open' | 'closing' | 'closed' {
        if (!this.ws) return 'closed';

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING: return 'connecting';
            case WebSocket.OPEN: return 'open';
            case WebSocket.CLOSING: return 'closing';
            case WebSocket.CLOSED: return 'closed';
            default: return 'closed';
        }
    }
}

// Hook for using collaboration service in React components
export function useCollaboration(workspaceId: string, userId: string, userToken: string) {
    const [service] = React.useState(() => new CollaborationService(workspaceId, userId, userToken));
    const [isConnected, setIsConnected] = React.useState(false);
    const [connectionState, setConnectionState] = React.useState<'connecting' | 'open' | 'closing' | 'closed'>('closed');

    React.useEffect(() => {
        const handleConnected = () => {
            setIsConnected(true);
            setConnectionState('open');
        };

        const handleDisconnected = () => {
            setIsConnected(false);
            setConnectionState('closed');
        };

        service.on('connected', handleConnected);
        service.on('disconnected', handleDisconnected);

        // Connect on mount
        service.connect().catch(error => {
            console.error('❌ Failed to connect to collaboration service:', error);
        });

        // Cleanup on unmount
        return () => {
            service.off('connected', handleConnected);
            service.off('disconnected', handleDisconnected);
            service.disconnect();
        };
    }, [service]);

    return {
        service,
        isConnected,
        connectionState
    };
}

// Utility function to generate workspace share URLs
export function generateShareUrl(workspaceId: string, permissions: 'read' | 'write' = 'read'): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://codai.ro';
    const shareToken = btoa(`${workspaceId}:${permissions}:${Date.now()}`);
    return `${baseUrl}/workspace/join/${shareToken}`;
}

// Utility function to parse share URLs
export function parseShareUrl(shareToken: string): { workspaceId: string; permissions: 'read' | 'write'; timestamp: number } | null {
    try {
        const decoded = atob(shareToken);
        const [workspaceId, permissions, timestamp] = decoded.split(':');
        return {
            workspaceId,
            permissions: permissions as 'read' | 'write',
            timestamp: parseInt(timestamp)
        };
    } catch (error) {
        console.error('❌ Failed to parse share URL:', error);
        return null;
    }
}

export default CollaborationService;
