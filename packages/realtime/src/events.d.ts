import { EventEmitter } from 'events';
import { Message } from './types';
export declare class RealtimeEventBus extends EventEmitter {
    private messageHistory;
    private maxHistorySize;
    constructor(maxHistorySize?: number);
    emitEvent(type: string, data: any, source: string, metadata?: Record<string, any>): void;
    sendMessage(type: string, payload: any, sender: string, target?: string, channel?: string, priority?: 'low' | 'normal' | 'high' | 'critical'): string;
    broadcast(type: string, payload: any, sender: string, priority?: 'low' | 'normal' | 'high' | 'critical'): void;
    toChannel(channel: string, type: string, payload: any, sender: string): void;
    toUser(userId: string, type: string, payload: any, sender: string): void;
    getMessageHistory(limit?: number): Message[];
    getChannelHistory(channel: string, limit?: number): Message[];
    clearHistory(): void;
    private addToHistory;
    cleanupOldMessages(maxAge?: number): void;
    getStats(): {
        messageCount: number;
        oldestMessage: number | null;
        newestMessage: number | null;
        channelDistribution: Record<string, number>;
    };
}
export declare const globalEventBus: RealtimeEventBus;
export declare const CODAI_EVENTS: {
    readonly USER_CONNECTED: "user:connected";
    readonly USER_DISCONNECTED: "user:disconnected";
    readonly USER_AUTHENTICATED: "user:authenticated";
    readonly DATA_CREATED: "data:created";
    readonly DATA_UPDATED: "data:updated";
    readonly DATA_DELETED: "data:deleted";
    readonly DATA_SYNCED: "data:synced";
    readonly COLLAB_JOIN: "collaboration:join";
    readonly COLLAB_LEAVE: "collaboration:leave";
    readonly COLLAB_CURSOR: "collaboration:cursor";
    readonly COLLAB_SELECTION: "collaboration:selection";
    readonly COLLAB_EDIT: "collaboration:edit";
    readonly SYSTEM_STATUS: "system:status";
    readonly SYSTEM_ERROR: "system:error";
    readonly SYSTEM_MAINTENANCE: "system:maintenance";
    readonly APP_LAUNCHED: "app:launched";
    readonly APP_CLOSED: "app:closed";
    readonly APP_ERROR: "app:error";
    readonly NOTIFICATION_SEND: "notification:send";
    readonly NOTIFICATION_READ: "notification:read";
    readonly NOTIFICATION_CLEAR: "notification:clear";
};
export type CodaiEventType = typeof CODAI_EVENTS[keyof typeof CODAI_EVENTS];
//# sourceMappingURL=events.d.ts.map