/**
 * Advanced logger with detailed timestamps and contextual information.
 * This utility provides a clean and structured way to log messages
 * with timing information, severity levels, and contextual data.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  module?: string;
  context?: Record<string, unknown>;
  timestamp?: boolean;
  traceId?: string;
  sessionId?: string;
}

class Logger {
  private static instance: Logger | undefined;
  private isEnabled: boolean;
  private minLevel: LogLevel;
  private readonly levels: { [key in LogLevel]: number } = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private constructor() {
    this.isEnabled = process.env['NODE_ENV'] !== 'production';
    this.minLevel =
      (process.env['NEXT_PUBLIC_LOG_LEVEL'] as LogLevel | undefined) ?? 'info';
  }

  public static getInstance(): Logger {
    if (Logger.instance === undefined) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Format the current time as a detailed timestamp
   */
  private getTimeStamp(): string {
    const now = new Date();
    return `${now.toISOString()} [${now.getTime()}]`;
  }

  /**
   * Check if the given log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return this.isEnabled && this.levels[level] >= this.levels[this.minLevel];
  }

  /**
   * Format log message with context
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    options: LogOptions = {}
  ): string {
    const parts = [];

    if (options.timestamp !== false) {
      parts.push(this.getTimeStamp());
    }

    parts.push(`[${level.toUpperCase()}]`);

    if (options.module != null && options.module !== '') {
      parts.push(`[${options.module}]`);
    }

    if (options.traceId != null && options.traceId !== '') {
      parts.push(`[trace:${options.traceId}]`);
    }

    if (options.sessionId != null && options.sessionId !== '') {
      parts.push(`[session:${options.sessionId}]`);
    }

    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Log a debug message
   */
  public debug(message: string, options: LogOptions = {}): void {
    if (!this.shouldLog('debug')) return;

    // eslint-disable-next-line no-console
    console.debug(
      this.formatMessage('debug', message, options),
      options.context ?? ''
    );
  }

  /**
   * Log an info message
   */
  public info(message: string, options: LogOptions = {}): void {
    if (!this.shouldLog('info')) return;

    // eslint-disable-next-line no-console
    console.info(
      this.formatMessage('info', message, options),
      options.context ?? ''
    );
  }

  /**
   * Log a warning message
   */
  public warn(message: string, options: LogOptions = {}): void {
    if (!this.shouldLog('warn')) return;

    console.warn(
      this.formatMessage('warn', message, options),
      options.context ?? ''
    );
  } /**
   * Log an error message
   */
  public error(
    message: string,
    error?: Error | unknown,
    options: LogOptions = {}
  ): void {
    if (!this.shouldLog('error')) return;

    console.error(
      this.formatMessage('error', message, options),
      (error ?? '').toString(),
      options.context ?? ''
    );
  }

  /**
   * Log the time taken for an operation
   */
  public time(label: string, options: LogOptions = {}): () => void {
    if (!this.shouldLog('debug')) {
      return () => {};
    }
    const start = performance.now();
    const moduleName = options.module ?? 'Timer';
    return () => {
      const end = performance.now();
      const duration = end - start;
      this.debug(`${label} completed in ${duration.toFixed(2)}ms`, {
        ...options,
        module: moduleName,
        context: { ...options.context, duration },
      });
    };
  }

  /**
   * Create a scoped logger for a specific module
   */
  public createScope(
    module: string
  ): Pick<Logger, 'debug' | 'info' | 'warn' | 'error' | 'time'> {
    return {
      debug: (message: string, options: Omit<LogOptions, 'module'> = {}) =>
        this.debug(message, { ...options, module }),
      info: (message: string, options: Omit<LogOptions, 'module'> = {}) =>
        this.info(message, { ...options, module }),
      warn: (message: string, options: Omit<LogOptions, 'module'> = {}) =>
        this.warn(message, { ...options, module }),
      error: (
        message: string,
        error?: Error | unknown,
        options: Omit<LogOptions, 'module'> = {}
      ) => this.error(message, error, { ...options, module }),
      time: (label: string, options: Omit<LogOptions, 'module'> = {}) =>
        this.time(label, { ...options, module }),
    };
  }

  /**
   * Enable or disable logging
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set the minimum log level
   */
  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }
}

export const logger = Logger.getInstance();
