import type { ServiceName } from './types';
export declare function generateId(): string;
export declare function formatTimestamp(date?: Date): string;
export declare function createApiResponse<T>(data: T, success?: boolean): {
    success: boolean;
    data: T;
    timestamp: string;
};
export declare function createErrorResponse(error: string): {
    success: boolean;
    error: string;
    timestamp: string;
};
export declare function isValidEmail(email: string): boolean;
export declare function isValidUrl(url: string): boolean;
export declare function getServiceUrl(serviceName: ServiceName, path?: string): string;
export declare function sanitizeInput(input: string): string;
export declare function sleep(ms: number): Promise<void>;
export declare function retry<T>(fn: () => Promise<T>, maxAttempts?: number, delay?: number): Promise<T>;
//# sourceMappingURL=utils.d.ts.map