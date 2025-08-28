/**
 * GDPR Logger
 * Specialized logging for GDPR compliance events with structured data and Elasticsearch integration
 */

import { createLogger, Logger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { v4 as uuidv4 } from 'uuid';
import { GdprComplianceConfig } from './types';

export interface GdprLogEntry {
  timestamp: Date;
  level: string;
  message: string;
  serviceId?: string;
  dataSubjectId?: string;
  eventType?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export class GdprLogger {
  private config: GdprComplianceConfig;
  private logger: Logger;
  private elasticsearchClient?: ElasticsearchClient;
  private logBuffer: GdprLogEntry[] = [];
  private flushInterval?: NodeJS.Timeout;

  constructor(config: GdprComplianceConfig) {
    this.config = config;
    this.initializeLogger();
    this.initializeElasticsearch();
    this.startBufferFlush();
  }

  private initializeLogger(): void {
    const logFormat = format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.json(),
      format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          ...meta
        });
      })
    );

    this.logger = createLogger({
      level: process.env.GDPR_LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'gdpr-compliance' },
      transports: [
        // Console transport
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        }),

        // Daily rotate file transport
        new DailyRotateFile({
          filename: 'logs/gdpr-compliance-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '30d',
          createSymlink: true,
          symlinkName: 'gdpr-compliance.log'
        }),

        // Error log file
        new DailyRotateFile({
          filename: 'logs/gdpr-compliance-errors-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '100m',
          maxFiles: '90d'
        }),

        // Audit log file
        new DailyRotateFile({
          filename: 'logs/gdpr-audit-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '7y' // 7 years retention for audit logs
        })
      ]
    });
  }

  private initializeElasticsearch(): void {
    const elasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

    try {
      this.elasticsearchClient = new ElasticsearchClient({
        node: elasticsearchUrl
      });
    } catch (error) {
      this.logger.warn('Failed to initialize Elasticsearch client', { error });
    }
  }

  private startBufferFlush(): void {
    if (this.elasticsearchClient) {
      this.flushInterval = setInterval(() => {
        this.flushToElasticsearch();
      }, 30000); // Flush every 30 seconds
    }
  }

  private async flushToElasticsearch(): Promise<void> {
    if (!this.elasticsearchClient || this.logBuffer.length === 0) {
      return;
    }

    try {
      const body = this.logBuffer.flatMap(doc => [
        { index: { _index: `gdpr-logs-${new Date().toISOString().split('T')[0]}` } },
        doc
      ]);

      await this.elasticsearchClient.bulk({
        body,
        refresh: true
      });

      this.logBuffer = [];
    } catch (error) {
      this.logger.error('Failed to flush logs to Elasticsearch', { error });
    }
  }

  private logEntry(level: string, message: string, meta: Record<string, any> = {}): void {
    const entry: GdprLogEntry = {
      timestamp: new Date(),
      level,
      message,
      correlationId: meta.correlationId || uuidv4(),
      ...meta
    };

    // Log to Winston
    this.logger.log(level, message, meta);

    // Buffer for Elasticsearch
    if (this.elasticsearchClient) {
      this.logBuffer.push(entry);
    }
  }

  info(message: string, meta: Record<string, any> = {}): void {
    this.logEntry('info', message, meta);
  }

  warn(message: string, meta: Record<string, any> = {}): void {
    this.logEntry('warn', message, meta);
  }

  error(message: string, meta: Record<string, any> = {}): void {
    this.logEntry('error', message, meta);
  }

  debug(message: string, meta: Record<string, any> = {}): void {
    this.logEntry('debug', message, meta);
  }

  audit(message: string, meta: Record<string, any> = {}): void {
    this.logEntry('audit', message, { ...meta, eventType: 'audit' });
  }

  compliance(message: string, meta: Record<string, any> = {}): void {
    this.logEntry('compliance', message, { ...meta, eventType: 'compliance' });
  }

  async cleanup(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    // Final flush
    await this.flushToElasticsearch();

    // Close logger
    this.logger.end();
  }
}