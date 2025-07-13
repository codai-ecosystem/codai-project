import { RealtimeConfig, ConnectionInfo, Room, RealtimeMetrics } from './types';
export declare class RealtimeServer {
    private io;
    private httpServer;
    private redis?;
    private eventBus;
    private synchronizer;
    private connections;
    private rooms;
    private rateLimiter;
    private metrics;
    private config;
    constructor(config: RealtimeConfig);
    private initializeServer;
    private setupEventHandlers;
    private canJoinRoom;
    private createRoom;
    private addToRoom;
    private removeFromRoom;
    private updateMetrics;
    start(): Promise<void>;
    stop(): Promise<void>;
    getMetrics(): RealtimeMetrics;
    getConnections(): ConnectionInfo[];
    getRooms(): Room[];
    broadcastToApp(appId: string, type: string, payload: any): void;
    broadcastToUser(userId: string, type: string, payload: any): void;
    broadcastToChannel(channel: string, type: string, payload: any): void;
    broadcastSystemMessage(type: string, payload: any): void;
}
export declare function createRealtimeServer(config: RealtimeConfig): RealtimeServer;
//# sourceMappingURL=server.d.ts.map