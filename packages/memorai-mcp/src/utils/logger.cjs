/**
 * 🧠 MemorAI MCP - Centralized Logging Utility
 * Comprehensive logging system for all MemorAI MCP components
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('./config.cjs');

class Logger {
    constructor() {
        this.logLevel = config.SYSTEM.LOG_LEVEL;
        this.logLevels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };
        this.colors = {
            error: '\x1b[31m', // Red
            warn: '\x1b[33m',  // Yellow
            info: '\x1b[36m',  // Cyan
            debug: '\x1b[35m', // Magenta
            trace: '\x1b[37m', // White
            reset: '\x1b[0m'
        };
        this.logHistory = [];
        this.maxHistorySize = 1000;
    }

    shouldLog(level) {
        return this.logLevels[level] <= this.logLevels[this.logLevel];
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const nodeId = config.SYSTEM.NODE_ID;
        const phase = meta.phase || 'SYSTEM';

        return {
            timestamp,
            level: level.toUpperCase(),
            nodeId,
            phase,
            message,
            meta
        };
    }

    log(level, message, meta = {}) {
        if (!this.shouldLog(level)) return;

        const logEntry = this.formatMessage(level, message, meta);

        // Console output with colors
        const color = this.colors[level] || this.colors.reset;
        const resetColor = this.colors.reset;

        const consoleMessage = `${color}[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.phase}] ${logEntry.message}${resetColor}`;

        if (level === 'error') {
            console.error(consoleMessage);
        } else if (level === 'warn') {
            console.warn(consoleMessage);
        } else {
            console.log(consoleMessage);
        }

        // Add to history
        this.logHistory.push(logEntry);
        if (this.logHistory.length > this.maxHistorySize) {
            this.logHistory = this.logHistory.slice(-this.maxHistorySize / 2);
        }

        // Async file logging (fire and forget)
        this.writeToFile(logEntry).catch(err => {
            console.error('Failed to write log to file:', err.message);
        });
    }

    async writeToFile(logEntry) {
        try {
            const logDir = path.join(__dirname, '../../logs');
            await fs.mkdir(logDir, { recursive: true });

            const logFile = path.join(logDir, `memorai-mcp-${new Date().toISOString().split('T')[0]}.log`);
            const logLine = JSON.stringify(logEntry) + '\n';

            await fs.appendFile(logFile, logLine);
        } catch (error) {
            // Silently fail - don't want logging to break the app
        }
    }

    // Convenience methods
    error(message, meta = {}) {
        this.log('error', message, meta);
    }

    warn(message, meta = {}) {
        this.log('warn', message, meta);
    }

    info(message, meta = {}) {
        this.log('info', message, meta);
    }

    debug(message, meta = {}) {
        this.log('debug', message, meta);
    }

    trace(message, meta = {}) {
        this.log('trace', message, meta);
    }

    // Phase-specific loggers
    phase(phaseNumber, level, message, meta = {}) {
        this.log(level, message, { ...meta, phase: `PHASE_${phaseNumber}` });
    }

    // Performance logging
    performance(operation, duration, meta = {}) {
        this.info(`Performance: ${operation} completed in ${duration}ms`, {
            ...meta,
            operation,
            duration,
            type: 'performance'
        });
    }

    // API request logging
    apiRequest(method, path, status, duration, meta = {}) {
        const level = status >= 400 ? 'warn' : 'info';
        this.log(level, `API ${method} ${path} - ${status} (${duration}ms)`, {
            ...meta,
            method,
            path,
            status,
            duration,
            type: 'api_request'
        });
    }

    // Error logging with stack trace
    errorWithStack(message, error, meta = {}) {
        this.error(message, {
            ...meta,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            }
        });
    }

    // Get recent logs
    getRecentLogs(limit = 100, level = null) {
        let logs = this.logHistory;

        if (level) {
            logs = logs.filter(log => log.level.toLowerCase() === level.toLowerCase());
        }

        return logs.slice(-limit);
    }

    // Clear old logs
    async clearOldLogs(daysToKeep = 30) {
        try {
            const logDir = path.join(__dirname, '../../logs');
            const files = await fs.readdir(logDir);

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            for (const file of files) {
                if (file.startsWith('memorai-mcp-') && file.endsWith('.log')) {
                    const filePath = path.join(logDir, file);
                    const stats = await fs.stat(filePath);

                    if (stats.mtime < cutoffDate) {
                        await fs.unlink(filePath);
                        this.info(`Deleted old log file: ${file}`);
                    }
                }
            }
        } catch (error) {
            this.error('Failed to clear old logs:', error);
        }
    }

    // Get log statistics
    getStats() {
        const stats = {
            total: this.logHistory.length,
            byLevel: {},
            byPhase: {},
            recentErrors: 0,
            recentWarnings: 0
        };

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        for (const log of this.logHistory) {
            // Count by level
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

            // Count by phase
            stats.byPhase[log.phase] = (stats.byPhase[log.phase] || 0) + 1;

            // Count recent errors and warnings
            const logTime = new Date(log.timestamp);
            if (logTime > oneHourAgo) {
                if (log.level === 'ERROR') stats.recentErrors++;
                if (log.level === 'WARN') stats.recentWarnings++;
            }
        }

        return stats;
    }
}

// Create singleton instance
const logger = new Logger();

// Helper function for phase-specific logging
logger.createPhaseLogger = (phaseNumber) => {
    return {
        error: (message, meta = {}) => logger.phase(phaseNumber, 'error', message, meta),
        warn: (message, meta = {}) => logger.phase(phaseNumber, 'warn', message, meta),
        info: (message, meta = {}) => logger.phase(phaseNumber, 'info', message, meta),
        debug: (message, meta = {}) => logger.phase(phaseNumber, 'debug', message, meta),
        trace: (message, meta = {}) => logger.phase(phaseNumber, 'trace', message, meta)
    };
};

module.exports = logger;
