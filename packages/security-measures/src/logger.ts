import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Client } from '@elastic/elasticsearch';
import { SecurityLoggingConfig, SecurityEvent } from './types';

export class SecurityLogger {
  private logger: winston.Logger;
  private elasticClient?: Client;

  constructor(config: SecurityLoggingConfig) {
    this.logger = this.createLogger(config);

    if (config.destination === 'elasticsearch' || config.destination === 'both') {
      this.initializeElasticsearch();
    }
  }

  private createLogger(config: SecurityLoggingConfig): winston.Logger {
    const transports: winston.transport[] = [];

    // File transport with rotation
    if (config.destination === 'file' || config.destination === 'both') {
      transports.push(
        new DailyRotateFile({
          filename: 'logs/security/security-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: config.compression,
          maxSize: '20m',
          maxFiles: `${config.retention}d`,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );

      // Separate transport for error logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/security/security-error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: config.compression,
          maxSize: '20m',
          maxFiles: `${config.retention}d`,
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );
    }

    // Console transport for development
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
            })
          )
        })
      );
    }

    return winston.createLogger({
      level: config.level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        config.format === 'json' ? winston.format.json() : winston.format.simple()
      ),
      transports,
      exitOnError: false
    });
  }

  private async initializeElasticsearch(): Promise<void> {
    try {
      this.elasticClient = new Client({
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD ? {
          username: process.env.ELASTICSEARCH_USERNAME,
          password: process.env.ELASTICSEARCH_PASSWORD
        } : undefined
      });

      // Create security index if it doesn't exist
      await this.ensureSecurityIndex();

      this.logger.info('Elasticsearch client initialized for security logging');
    } catch (error) {
      this.logger.error('Failed to initialize Elasticsearch client:', error);
    }
  }

  private async ensureSecurityIndex(): Promise<void> {
    if (!this.elasticClient) return;

    const indexName = 'codai-security-events';

    try {
      const indexExists = await this.elasticClient.indices.exists({
        index: indexName
      });

      if (!indexExists) {
        await this.elasticClient.indices.create({
          index: indexName,
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                timestamp: { type: 'date' },
                type: { type: 'keyword' },
                severity: { type: 'keyword' },
                source: { type: 'ip' },
                target: { type: 'keyword' },
                description: { type: 'text' },
                metadata: { type: 'object' },
                correlationId: { type: 'keyword' },
                service: { type: 'keyword' },
                environment: { type: 'keyword' }
              }
            },
            settings: {
              number_of_shards: 1,
              number_of_replicas: 1,
              'index.lifecycle.name': 'codai-security-policy',
              'index.lifecycle.rollover_alias': 'codai-security-events'
            }
          }
        });

        this.logger.info(`Created Elasticsearch index: ${indexName}`);
      }
    } catch (error) {
      this.logger.error('Failed to ensure security index exists:', error);
    }
  }

  public logSecurityEvent(event: SecurityEvent): void {
    const logData = {
      ...event,
      service: process.env.SERVICE_NAME || 'unknown',
      environment: process.env.NODE_ENV || 'development'
    };

    // Log to Winston
    this.logger.log(this.mapSeverityToLevel(event.severity), 'Security Event', logData);

    // Log to Elasticsearch if available
    if (this.elasticClient) {
      this.logToElasticsearch(logData);
    }
  }

  private async logToElasticsearch(event: SecurityEvent & { service: string; environment: string }): Promise<void> {
    if (!this.elasticClient) return;

    try {
      await this.elasticClient.index({
        index: 'codai-security-events',
        body: event
      });
    } catch (error) {
      this.logger.error('Failed to log security event to Elasticsearch:', error);
    }
  }

  private mapSeverityToLevel(severity: string): string {
    const mapping: Record<string, string> = {
      'low': 'info',
      'medium': 'warn',
      'high': 'error',
      'critical': 'error'
    };

    return mapping[severity] || 'info';
  }

  public debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  public error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  public async searchSecurityEvents(query: {
    from?: Date;
    to?: Date;
    severity?: string[];
    type?: string[];
    source?: string;
    size?: number;
  }): Promise<SecurityEvent[]> {
    if (!this.elasticClient) {
      throw new Error('Elasticsearch client not available');
    }

    const must: any[] = [];

    if (query.from || query.to) {
      const range: any = {};
      if (query.from) range.gte = query.from.toISOString();
      if (query.to) range.lte = query.to.toISOString();
      must.push({ range: { timestamp: range } });
    }

    if (query.severity && query.severity.length > 0) {
      must.push({ terms: { severity: query.severity } });
    }

    if (query.type && query.type.length > 0) {
      must.push({ terms: { type: query.type } });
    }

    if (query.source) {
      must.push({ term: { source: query.source } });
    }

    try {
      const response = await this.elasticClient.search({
        index: 'codai-security-events',
        body: {
          query: must.length > 0 ? { bool: { must } } : { match_all: {} },
          sort: [{ timestamp: { order: 'desc' } }],
          size: query.size || 100
        }
      });

      return response.body.hits.hits.map((hit: any) => hit._source);
    } catch (error) {
      this.logger.error('Failed to search security events in Elasticsearch:', error);
      throw error;
    }
  }

  public async getSecurityMetrics(timeRange: { from: Date; to: Date }): Promise<{
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    eventsByType: Record<string, number>;
    topSources: Array<{ source: string; count: number }>;
  }> {
    if (!this.elasticClient) {
      throw new Error('Elasticsearch client not available');
    }

    try {
      const response = await this.elasticClient.search({
        index: 'codai-security-events',
        body: {
          query: {
            range: {
              timestamp: {
                gte: timeRange.from.toISOString(),
                lte: timeRange.to.toISOString()
              }
            }
          },
          size: 0,
          aggs: {
            total_events: { value_count: { field: 'id' } },
            events_by_severity: { terms: { field: 'severity' } },
            events_by_type: { terms: { field: 'type' } },
            top_sources: { terms: { field: 'source', size: 10 } }
          }
        }
      });

      const aggs = response.body.aggregations;

      return {
        totalEvents: aggs.total_events.value,
        eventsBySeverity: aggs.events_by_severity.buckets.reduce((acc: any, bucket: any) => {
          acc[bucket.key] = bucket.doc_count;
          return acc;
        }, {}),
        eventsByType: aggs.events_by_type.buckets.reduce((acc: any, bucket: any) => {
          acc[bucket.key] = bucket.doc_count;
          return acc;
        }, {}),
        topSources: aggs.top_sources.buckets.map((bucket: any) => ({
          source: bucket.key,
          count: bucket.doc_count
        }))
      };
    } catch (error) {
      this.logger.error('Failed to get security metrics from Elasticsearch:', error);
      throw error;
    }
  }

  public async cleanup(): Promise<void> {
    if (this.elasticClient) {
      await this.elasticClient.close();
    }
  }
}