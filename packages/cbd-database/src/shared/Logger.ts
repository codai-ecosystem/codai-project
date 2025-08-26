/**
 * Simple Logger implementation for CBD components
 */
export interface LogLevel {
  ERROR: number;
  WARN: number;
  INFO: number;
  DEBUG: number;
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

export class Logger {
  private component: string;
  private level: number = LOG_LEVELS.INFO;

  constructor(component: string, level?: number) {
    this.component = component;
    if (level !== undefined) {
      this.level = level;
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(`[${new Date().toISOString()}] [ERROR] [${this.component}] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(`[${new Date().toISOString()}] [WARN] [${this.component}] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level >= LOG_LEVELS.INFO) {
      console.info(`[${new Date().toISOString()}] [INFO] [${this.component}] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.debug(`[${new Date().toISOString()}] [DEBUG] [${this.component}] ${message}`, ...args);
    }
  }

  setLevel(level: number): void {
    this.level = level;
  }

  getLevel(): number {
    return this.level;
  }
}

export default Logger;