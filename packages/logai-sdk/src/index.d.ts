/**
 * LogAI SDK - Universal logging client for CODAI ecosystem
 * Provides seamless integration with LogAI service for all ecosystem apps
 */
export interface LogEntry {
    level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
    message: string;
    metadata?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    traceId?: string;
}
export interface LogAIConfig {
    apiKey?: string;
    baseUrl?: string;
    service: string;
    environment?: 'development' | 'staging' | 'production';
    enableConsole?: boolean;
    batchSize?: number;
    flushInterval?: number;
}
export interface LogResponse {
    success: boolean;
    processed: number;
    errors?: string[];
}
export interface LogAnalytics {
    timeRange: {
        start: string;
        end: string;
    };
    totalLogs: number;
    logsByLevel: Record<string, number>;
    logsByService: Record<string, number>;
    errorRate: number;
    topErrors: Array<{
        message: string;
        count: number;
        service: string;
    }>;
    logVelocity: Array<{
        timestamp: string;
        count: number;
    }>;
}
export declare class LogAIClient {
    private config;
    private logQueue;
    private flushTimer?;
    constructor(config: LogAIConfig);
    /**
     * Log a debug message
     */
    debug(message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>): Promise<{
        success: boolean;
        processed: number;
    }>;
    /**
     * Log an info message
     */
    info(message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>): Promise<{
        success: boolean;
        processed: number;
    }>;
    /**
     * Log a warning message
     */
    warn(message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>): Promise<{
        success: boolean;
        processed: number;
    }>;
    /**
     * Log an error message
     */
    error(message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>): Promise<{
        success: boolean;
        processed: number;
    }>;
    /**
     * Log a critical message (will flush immediately)
     */
    critical(message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>): Promise<LogResponse>;
    /**
     * Log with custom level
     */
    log(level: LogEntry['level'], message: string, metadata?: Record<string, any>, options?: Partial<LogEntry>): Promise<{
        success: boolean;
        processed: number;
    }>;
    /**
     * Flush all queued logs to LogAI service
     */
    flush(): Promise<LogResponse>;
    /**
     * Get analytics from LogAI service
     */
    getAnalytics(options?: {
        service?: string;
        timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
    }): Promise<LogAnalytics | null>;
    /**
     * Get AI insights about logs
     */
    getAIInsights(query: string, filters?: Record<string, any>): Promise<any>;
    /**
     * Clean up resources
     */
    destroy(): Promise<LogResponse>;
    private startFlushTimer;
    private logToConsole;
    private generateTraceId;
}
/**
 * Default LogAI instance for quick usage
 */
export declare const createLogAIClient: (config: LogAIConfig) => LogAIClient;
/**
 * Environment-aware configuration helper
 */
export declare const getLogAIConfig: (service: string) => LogAIConfig;
//# sourceMappingURL=index.d.ts.map