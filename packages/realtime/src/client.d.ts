import { SyncData } from './types';
export interface RealtimeClientConfig {
    url: string;
    auth?: {
        token: string;
    };
    options?: {
        autoConnect?: boolean;
        reconnection?: boolean;
        reconnectionDelay?: number;
        reconnectionAttempts?: number;
        timeout?: number;
    };
}
export declare class RealtimeClient {
    private socket;
    private eventBus;
    private config;
    private connectionState;
    private subscriptions;
    private rooms;
    private messageQueue;
    private pingInterval?;
    private latency;
    constructor(config: RealtimeClientConfig);
    private setupEventHandlers;
    authenticate(token: string): void;
    connect(): void;
    disconnect(): void;
    isConnected(): boolean;
    getConnectionState(): string;
    getLatency(): number;
    sendMessage(type: string, payload: any, target?: string, channel?: string, priority?: 'low' | 'normal' | 'high' | 'critical'): void;
    broadcast(type: string, payload: any): void;
    sendToChannel(channel: string, type: string, payload: any): void;
    sendToUser(userId: string, type: string, payload: any): void;
    subscribe(channels: string[]): void;
    unsubscribe(channels: string[]): void;
    getSubscriptions(): string[];
    joinRoom(roomId: string): void;
    leaveRoom(roomId: string): void;
    getRooms(): string[];
    sync(data: Omit<SyncData, 'timestamp'>): void;
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
    once(event: string, listener: (...args: any[]) => void): void;
    private processMessageQueue;
    private lastPingTime;
    private startPingMonitoring;
    private stopPingMonitoring;
    enableDebugMode(): void;
    getStats(): {
        connectionState: string;
        latency: number;
        subscriptions: number;
        rooms: number;
        queuedMessages: number;
    };
    destroy(): void;
}
export declare function createRealtimeClient(config: RealtimeClientConfig): RealtimeClient;
export declare function useRealtimeClient(config: RealtimeClientConfig): RealtimeClient;
//# sourceMappingURL=client.d.ts.map