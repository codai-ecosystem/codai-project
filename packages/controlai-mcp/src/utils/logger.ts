/**
 * Logging utility for ControlAI MCP Server
 * Uses stderr for logging to avoid interfering with MCP protocol on stdout
 */

export class Logger {
    private static isMCPMode = process.argv.includes('--stdio') ||
        process.argv[0].includes('npx') ||
        process.env.npm_lifecycle_event === 'start';

    static log(...args: any[]): void {
        if (Logger.isMCPMode) {
            // In MCP mode, use stderr to avoid interfering with protocol messages on stdout
            console.error('[LOG]', ...args);
        } else {
            console.log(...args);
        }
    }

    static warn(...args: any[]): void {
        if (Logger.isMCPMode) {
            console.error('[WARN]', ...args);
        } else {
            console.warn(...args);
        }
    }

    static error(...args: any[]): void {
        console.error('[ERROR]', ...args);
    }

    static info(...args: any[]): void {
        if (Logger.isMCPMode) {
            console.error('[INFO]', ...args);
        } else {
            console.log('[INFO]', ...args);
        }
    }

    static debug(...args: any[]): void {
        if (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development') {
            if (Logger.isMCPMode) {
                console.error('[DEBUG]', ...args);
            } else {
                console.log('[DEBUG]', ...args);
            }
        }
    }

    static setMCPMode(enabled: boolean): void {
        Logger.isMCPMode = enabled;
    }
}
