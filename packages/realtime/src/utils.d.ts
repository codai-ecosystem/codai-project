export declare function generateId(): string;
export declare function createTimestamp(): number;
export declare function calculateChecksum(data: any): string;
export declare function isValidMessage(message: any): boolean;
export declare function sanitizeMessage(message: any): any;
export declare function validateChannel(channel: string): boolean;
export declare function validateUserId(userId: string): boolean;
export declare function rateLimitKey(userId: string, action: string): string;
export declare function parseAuthToken(token: string): {
    userId?: string;
    roles?: string[];
    error?: string;
};
export declare function createAuthToken(userId: string, roles?: string[], expiresIn?: number): string;
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
export declare function retry<T>(operation: () => Promise<T>, maxAttempts?: number, delay?: number): Promise<T>;
export declare function formatLatency(ms: number): string;
export declare function formatBytes(bytes: number): string;
export declare function getNetworkLatency(): Promise<number>;
export declare class CircularBuffer<T> {
    private buffer;
    private size;
    private index;
    private count;
    constructor(size: number);
    push(item: T): void;
    getAll(): T[];
    clear(): void;
    isFull(): boolean;
    getSize(): number;
}
export declare class RateLimiter {
    private requests;
    private readonly windowSize;
    private readonly maxRequests;
    constructor(maxRequests: number, windowSizeMs: number);
    isAllowed(key: string): boolean;
    getRemainingRequests(key: string): number;
    getResetTime(key: string): number;
    clear(key?: string): void;
}
//# sourceMappingURL=utils.d.ts.map