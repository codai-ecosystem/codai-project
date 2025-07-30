"use strict";
/**
 * LogAI SDK - Universal logging client for CODAI ecosystem
 * Provides seamless integration with LogAI service for all ecosystem apps
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogAIConfig = exports.createLogAIClient = exports.LogAIClient = void 0;
class LogAIClient {
    constructor(config) {
        var _a;
        this.logQueue = [];
        this.config = {
            apiKey: config.apiKey || process.env.LOGAI_API_KEY || '',
            baseUrl: config.baseUrl || process.env.LOGAI_BASE_URL || 'http://localhost:4032',
            service: config.service,
            environment: config.environment || process.env.NODE_ENV || 'development',
            enableConsole: (_a = config.enableConsole) !== null && _a !== void 0 ? _a : true,
            batchSize: config.batchSize || 10,
            flushInterval: config.flushInterval || 5000 // 5 seconds
        };
        // Auto-flush logs periodically
        this.startFlushTimer();
    }
    /**
     * Log a debug message
     */
    debug(message, metadata, options) {
        return this.log('debug', message, metadata, options);
    }
    /**
     * Log an info message
     */
    info(message, metadata, options) {
        return this.log('info', message, metadata, options);
    }
    /**
     * Log a warning message
     */
    warn(message, metadata, options) {
        return this.log('warn', message, metadata, options);
    }
    /**
     * Log an error message
     */
    error(message, metadata, options) {
        return this.log('error', message, metadata, options);
    }
    /**
     * Log a critical message (will flush immediately)
     */
    critical(message, metadata, options) {
        this.log('critical', message, metadata, options);
        return this.flush(); // Critical logs are sent immediately
    }
    /**
     * Log with custom level
     */
    log(level, message, metadata, options) {
        const entry = {
            level,
            message,
            metadata: { ...metadata, ...options === null || options === void 0 ? void 0 : options.metadata },
            userId: options === null || options === void 0 ? void 0 : options.userId,
            sessionId: options === null || options === void 0 ? void 0 : options.sessionId,
            traceId: (options === null || options === void 0 ? void 0 : options.traceId) || this.generateTraceId()
        };
        // Console output if enabled
        if (this.config.enableConsole) {
            this.logToConsole(entry);
        }
        // Add to queue
        this.logQueue.push(entry);
        // Flush if queue is full or if critical
        if (this.logQueue.length >= this.config.batchSize || level === 'critical') {
            return this.flush();
        }
        return Promise.resolve({ success: true, processed: 1 });
    }
    /**
     * Flush all queued logs to LogAI service
     */
    async flush() {
        if (this.logQueue.length === 0) {
            return { success: true, processed: 0 };
        }
        const logsToSend = [...this.logQueue];
        this.logQueue = [];
        try {
            const response = await fetch(`${this.config.baseUrl}/api/logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
                },
                body: JSON.stringify({
                    entries: logsToSend.map(entry => ({
                        ...entry,
                        service: this.config.service,
                        environment: this.config.environment,
                        timestamp: new Date().toISOString()
                    }))
                })
            });
            if (!response.ok) {
                throw new Error(`LogAI API error: ${response.status} ${response.statusText}`);
            }
            const result = await response.json();
            return result;
        }
        catch (error) {
            // On error, add logs back to queue (with deduplication)
            this.logQueue.unshift(...logsToSend);
            console.error('LogAI flush error:', error);
            return {
                success: false,
                processed: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    /**
     * Get analytics from LogAI service
     */
    async getAnalytics(options) {
        try {
            const params = new URLSearchParams();
            if (options === null || options === void 0 ? void 0 : options.service)
                params.set('service', options.service);
            if (options === null || options === void 0 ? void 0 : options.timeRange)
                params.set('timeRange', options.timeRange);
            const response = await fetch(`${this.config.baseUrl}/api/analytics?${params}`, {
                headers: {
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
                }
            });
            if (!response.ok) {
                throw new Error(`LogAI Analytics API error: ${response.status}`);
            }
            const result = await response.json();
            return result.analytics;
        }
        catch (error) {
            console.error('LogAI analytics error:', error);
            return null;
        }
    }
    /**
     * Get AI insights about logs
     */
    async getAIInsights(query, filters) {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/analytics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
                },
                body: JSON.stringify({ query, filters })
            });
            if (!response.ok) {
                throw new Error(`LogAI AI Insights API error: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('LogAI AI insights error:', error);
            return null;
        }
    }
    /**
     * Clean up resources
     */
    destroy() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        return this.flush(); // Final flush
    }
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            if (this.logQueue.length > 0) {
                this.flush().catch(console.error);
            }
        }, this.config.flushInterval);
    }
    logToConsole(entry) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${this.config.service.toUpperCase()}] [${entry.level.toUpperCase()}]`;
        const logMethod = entry.level === 'error' || entry.level === 'critical' ? 'error' :
            entry.level === 'warn' ? 'warn' : 'log';
        console[logMethod](`${prefix} ${entry.message}`, entry.metadata || '');
    }
    generateTraceId() {
        return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.LogAIClient = LogAIClient;
/**
 * Default LogAI instance for quick usage
 */
const createLogAIClient = (config) => {
    return new LogAIClient(config);
};
exports.createLogAIClient = createLogAIClient;
/**
 * Environment-aware configuration helper
 */
const getLogAIConfig = (service) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        service,
        environment: isDevelopment ? 'development' : isProduction ? 'production' : 'staging',
        baseUrl: isDevelopment
            ? 'http://localhost:4032'
            : process.env.LOGAI_PRODUCTION_URL || 'https://logai.ro',
        apiKey: isDevelopment
            ? process.env.LOGAI_DEV_API_KEY
            : process.env.LOGAI_PRODUCTION_API_KEY,
        enableConsole: isDevelopment,
        batchSize: isDevelopment ? 5 : 20,
        flushInterval: isDevelopment ? 3000 : 10000
    };
};
exports.getLogAIConfig = getLogAIConfig;
