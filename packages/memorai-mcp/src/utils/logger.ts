/**
 * Logger Utility
 * Structured logging for MemorAI MCP with different log levels
 * Date: August 6, 2025
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
    level: LogLevel;
    timestamp: Date;
    component: string;
    message: string;
    data?: any;
}

export class Logger {
    private component: string;
    private logLevel: LogLevel;

    constructor(component: string, logLevel: LogLevel = 'info') {
        this.component = component;
        this.logLevel = logLevel;
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: Record<LogLevel, number> = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };

        return levels[level] >= levels[this.logLevel];
    }

    private formatMessage(level: LogLevel, message: string, data?: any): string {
        const timestamp = new Date().toISOString();
        const levelUpper = level.toUpperCase().padEnd(5);
        const component = this.component.padEnd(15);

        let formatted = `[${timestamp}] ${levelUpper} [${component}] ${message}`;

        if (data !== undefined) {
            if (typeof data === 'object') {
                formatted += ` ${JSON.stringify(data, null, 2)}`;
            } else {
                formatted += ` ${data}`;
            }
        }

        return formatted;
    }

    private log(level: LogLevel, message: string, data?: any): void {
        if (!this.shouldLog(level)) return;

        const formatted = this.formatMessage(level, message, data);

        switch (level) {
            case 'debug':
                console.debug(formatted);
                break;
            case 'info':
                console.info(formatted);
                break;
            case 'warn':
                console.warn(formatted);
                break;
            case 'error':
                console.error(formatted);
                break;
        }
    }

    public debug(message: string, data?: any): void {
        this.log('debug', message, data);
    }

    public info(message: string, data?: any): void {
        this.log('info', message, data);
    }

    public warn(message: string, data?: any): void {
        this.log('warn', message, data);
    }

    public error(message: string, data?: any): void {
        this.log('error', message, data);
    }

    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    public getLogLevel(): LogLevel {
        return this.logLevel;
    }

    public getComponent(): string {
        return this.component;
    }

    // Static methods for quick logging without creating instances
    public static debug(component: string, message: string, data?: any): void {
        new Logger(component, 'debug').debug(message, data);
    }

    public static info(component: string, message: string, data?: any): void {
        new Logger(component, 'info').info(message, data);
    }

    public static warn(component: string, message: string, data?: any): void {
        new Logger(component, 'warn').warn(message, data);
    }

    public static error(component: string, message: string, data?: any): void {
        new Logger(component, 'error').error(message, data);
    }
}

// Global logger instance
export const globalLogger = new Logger('Global');
