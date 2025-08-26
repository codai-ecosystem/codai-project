// Logger utility for CODAI application
export class Logger {
    private context: string;

    constructor(context: string = 'CODAI') {
        this.context = context;
    }

    private formatMessage(level: string, message: string, meta?: any) {
        const timestamp = new Date().toISOString();
        const metaString = meta ? JSON.stringify(meta) : '';
        return `[${timestamp}] [${level}] [${this.context}] ${message} ${metaString}`;
    }

    info(message: string, meta?: any) {
        // eslint-disable-next-line no-console
        console.log(this.formatMessage('INFO', message, meta));
    }

    error(message: string, meta?: any) {
        // eslint-disable-next-line no-console
        console.error(this.formatMessage('ERROR', message, meta));
    }

    warn(message: string, meta?: any) {
        // eslint-disable-next-line no-console
        console.warn(this.formatMessage('WARN', message, meta));
    }

    debug(message: string, meta?: any) {
        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.debug(this.formatMessage('DEBUG', message, meta));
        }
    }

    log(message: string, meta?: any) {
        // eslint-disable-next-line no-console
        console.log(this.formatMessage('LOG', message, meta));
    }
}

// Export singleton logger instance
export const logger = new Logger('CODAI');

// Export factory function for creating contextual loggers
export function createLogger(context: string) {
    return new Logger(context);
}
