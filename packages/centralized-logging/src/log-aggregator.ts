import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import cors from '@fastify/cors';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { WinstonLogger } from './winston-logger.js';
import { ElasticsearchIntegration } from './elasticsearch-integration.js';
import { LogCorrelationEngine } from './correlation-engine.js';
import { LogEntry, LogQuery, LogStream, LoggingConfig, LogDashboardData } from './types.js';
import { createLoggingConfig } from './config.js';
import cron from 'node-cron';

/**
 * Log Aggregator Service
 * Central service for collecting, processing, and streaming logs
 */

export class LogAggregatorService {
  private fastify: ReturnType<typeof Fastify>;
  private logger: WinstonLogger;
  private elasticsearch: ElasticsearchIntegration;
  private correlationEngine: LogCorrelationEngine;
  private redis: Redis;
  private postgres: Pool;
  private config: LoggingConfig;
  private activeStreams: Map<string, LogStream> = new Map();
  private logBuffer: LogEntry[] = [];
  private bufferFlushInterval: NodeJS.Timeout | null = null;

  constructor(config?: LoggingConfig) {
    this.config = config || createLoggingConfig();
    this.fastify = Fastify({
      logger: false,
      trustProxy: true,
      requestIdHeader: 'x-correlation-id',
    });

    this.logger = new WinstonLogger(this.config);
    this.elasticsearch = new ElasticsearchIntegration(this.config);
    this.correlationEngine = new LogCorrelationEngine(5000, 30 * 60 * 1000);

    // Initialize connections
    // Initialize Redis with correct options
    this.redis = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password,
      keyPrefix: this.config.redis.keyPrefix,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.postgres = new Pool({
      host: this.config.database.postgres.host,
      port: this.config.database.postgres.port,
      database: this.config.database.postgres.database,
      user: this.config.database.postgres.username,
      password: this.config.database.postgres.password,
      max: 20,
      idleTimeoutMillis: 30000,
    });
  }

  /**
   * Initialize the log aggregator service
   */
  async initialize(): Promise<void> {
    try {
      // Register plugins
      await this.fastify.register(websocket);
      await this.fastify.register(cors, {
        origin: this.config.server.corsOrigins,
        credentials: true,
      });

      // Setup routes
      this.setupRoutes();
      this.setupWebSocketHandlers();

      // Initialize external services
      await this.elasticsearch.initialize();

      // Test database connections
      await this.testConnections();

      // Setup buffer flushing
      this.setupBufferFlushing();

      // Setup scheduled tasks
      this.setupScheduledTasks();

      console.log('Log Aggregator Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Log Aggregator Service:', error);
      throw error;
    }
  }

  /**
   * Setup HTTP routes
   */
  private setupRoutes(): void {
    // Health check
    this.fastify.get('/health', async (request, reply) => {
      const health = {
        status: 'healthy',
        service: 'codai-log-aggregator',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        connections: {
          elasticsearch: await this.checkElasticsearchHealth(),
          redis: await this.checkRedisHealth(),
          postgres: await this.checkPostgresHealth(),
        },
      };
      return health;
    });

    // Ingest single log entry
    this.fastify.post('/api/logs', async (request, reply) => {
      try {
        const entry = this.validateLogEntry(request.body);
        await this.ingestLog(entry);
        return { success: true, id: entry.id };
      } catch (error: any) {
        reply.status(400);
        return { error: error.message };
      }
    });

    // Ingest multiple log entries
    this.fastify.post('/api/logs/batch', async (request, reply) => {
      try {
        const entries = (request.body as any[]).map(entry => this.validateLogEntry(entry));
        await this.ingestLogsBatch(entries);
        return { success: true, count: entries.length };
      } catch (error: any) {
        reply.status(400);
        return { error: error.message };
      }
    });

    // Search logs
    this.fastify.post('/api/logs/search', async (request, reply) => {
      try {
        const query = request.body as LogQuery;
        const result = await this.searchLogs(query);
        return result;
      } catch (error: any) {
        reply.status(500);
        return { error: error.message };
      }
    });

    // Get correlation
    this.fastify.get('/api/logs/correlation/:id', async (request, reply) => {
      try {
        const correlationId = (request.params as any).id;
        const correlation = await this.correlationEngine.correlateById(correlationId);
        if (!correlation) {
          reply.status(404);
          return { error: 'Correlation not found' };
        }
        return correlation;
      } catch (error: any) {
        reply.status(500);
        return { error: error.message };
      }
    });

    // Get trace
    this.fastify.get('/api/logs/trace/:id', async (request, reply) => {
      try {
        const traceId = (request.params as any).id;
        const correlation = await this.correlationEngine.correlateByTrace(traceId);
        if (!correlation) {
          reply.status(404);
          return { error: 'Trace not found' };
        }
        return correlation;
      } catch (error: any) {
        reply.status(500);
        return { error: error.message };
      }
    });

    // Get dashboard data
    this.fastify.get('/api/dashboard', async (request, reply) => {
      try {
        const data = await this.getDashboardData();
        return data;
      } catch (error: any) {
        reply.status(500);
        return { error: error.message };
      }
    });

    // Get aggregations
    this.fastify.post('/api/logs/aggregate', async (request, reply) => {
      try {
        const { field, query } = request.body as { field: string; query: LogQuery };
        const aggregations = await this.elasticsearch.aggregateLogs(field, query);
        return { aggregations };
      } catch (error: any) {
        reply.status(500);
        return { error: error.message };
      }
    });
  }

  /**
   * Setup WebSocket handlers
   */
  private setupWebSocketHandlers(): void {
    this.fastify.register(async function (fastify) {
      fastify.get('/ws/logs', { websocket: true }, (connection, request) => {
        const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const stream: LogStream = {
          id: streamId,
          query: {}, // Default query - all logs
          socket: connection.socket,
          lastActivity: new Date(),
          filters: [],
        };

        this.activeStreams.set(streamId, stream);

        // Handle incoming messages (stream configuration)
        connection.socket.on('message', (message) => {
          try {
            const data = JSON.parse(message.toString());

            if (data.type === 'configure') {
              stream.query = data.query || {};
              stream.filters = data.filters || [];
              this.logger.info('Stream configured', 'log-aggregator', { streamId, query: stream.query });
            } else if (data.type === 'ping') {
              connection.socket.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
            }
          } catch (error) {
            console.error('WebSocket message error:', error);
          }
        });

        // Handle disconnect
        connection.socket.on('close', () => {
          this.activeStreams.delete(streamId);
          this.logger.info('Stream disconnected', 'log-aggregator', { streamId });
        });

        // Send initial connection confirmation
        connection.socket.send(JSON.stringify({
          type: 'connected',
          streamId,
          timestamp: new Date(),
        }));

        this.logger.info('New log stream connected', 'log-aggregator', { streamId });
      });
    });
  }

  /**
   * Ingest a single log entry
   */
  async ingestLog(entry: LogEntry): Promise<void> {
    // Add to correlation tracking
    this.correlationEngine.addLogEntry(entry);

    // Add to buffer for batch processing
    this.logBuffer.push(entry);

    // Stream to connected WebSocket clients
    await this.streamToClients(entry);

    // Cache recent entries in Redis
    await this.cacheLogEntry(entry);
  }

  /**
   * Ingest multiple log entries
   */
  async ingestLogsBatch(entries: LogEntry[]): Promise<void> {
    for (const entry of entries) {
      this.correlationEngine.addLogEntry(entry);
      await this.cacheLogEntry(entry);
    }

    this.logBuffer.push(...entries);

    // Stream to clients
    for (const entry of entries) {
      await this.streamToClients(entry);
    }
  }

  /**
   * Search logs using Elasticsearch
   */
  async searchLogs(query: LogQuery): Promise<{ entries: LogEntry[]; total: number }> {
    return await this.elasticsearch.searchLogs(query);
  }

  /**
   * Stream log entry to connected WebSocket clients
   */
  private async streamToClients(entry: LogEntry): Promise<void> {
    const message = JSON.stringify({
      type: 'log',
      entry,
      timestamp: new Date(),
    });

    for (const [streamId, stream] of this.activeStreams.entries()) {
      try {
        // Check if entry matches stream filters
        if (this.entryMatchesStream(entry, stream)) {
          stream.socket.send(message);
          stream.lastActivity = new Date();
        }
      } catch (error) {
        console.error(`Failed to send to stream ${streamId}:`, error);
        // Remove broken connections
        this.activeStreams.delete(streamId);
      }
    }
  }

  /**
   * Check if log entry matches stream configuration
   */
  private entryMatchesStream(entry: LogEntry, stream: LogStream): boolean {
    // Check service filter
    if (stream.query.services && !stream.query.services.includes(entry.service)) {
      return false;
    }

    // Check level filter
    if (stream.query.levels && !stream.query.levels.includes(entry.level)) {
      return false;
    }

    // Check correlation ID filter
    if (stream.query.correlationId && entry.correlationId !== stream.query.correlationId) {
      return false;
    }

    // Check user ID filter
    if (stream.query.userId && entry.userId !== stream.query.userId) {
      return false;
    }

    // Check search text
    if (stream.query.searchText) {
      const searchText = stream.query.searchText.toLowerCase();
      const messageMatch = entry.message.toLowerCase().includes(searchText);
      const metadataMatch = JSON.stringify(entry.metadata).toLowerCase().includes(searchText);
      if (!messageMatch && !metadataMatch) {
        return false;
      }
    }

    return true;
  }

  /**
   * Cache log entry in Redis
   */
  private async cacheLogEntry(entry: LogEntry): Promise<void> {
    try {
      const key = `recent:${entry.service}:${entry.level}`;
      await this.redis.lpush(key, JSON.stringify(entry));
      await this.redis.ltrim(key, 0, 99); // Keep only 100 recent entries
      await this.redis.expire(key, 3600); // 1 hour TTL
    } catch (error) {
      console.error('Failed to cache log entry:', error);
    }
  }

  /**
   * Setup buffer flushing to Elasticsearch
   */
  private setupBufferFlushing(): void {
    this.bufferFlushInterval = setInterval(async () => {
      if (this.logBuffer.length > 0) {
        const entries = this.logBuffer.splice(0);
        try {
          await this.elasticsearch.bulkIndexLogs(entries);
          this.logger.debug(`Flushed ${entries.length} log entries to Elasticsearch`, 'log-aggregator');
        } catch (error) {
          console.error('Failed to flush logs to Elasticsearch:', error);
          // Put entries back in buffer for retry
          this.logBuffer.unshift(...entries);
        }
      }
    }, 5000); // Flush every 5 seconds
  }

  /**
   * Setup scheduled tasks
   */
  private setupScheduledTasks(): void {
    // Cleanup old logs based on retention policy
    cron.schedule('0 2 * * *', async () => { // Daily at 2 AM
      this.logger.info('Starting log retention cleanup', 'log-aggregator');
      await this.performRetentionCleanup();
    });

    // Clean up inactive WebSocket streams
    cron.schedule('*/5 * * * *', () => { // Every 5 minutes
      const now = new Date();
      const inactiveThreshold = 10 * 60 * 1000; // 10 minutes

      for (const [streamId, stream] of this.activeStreams.entries()) {
        if (now.getTime() - stream.lastActivity.getTime() > inactiveThreshold) {
          stream.socket.close();
          this.activeStreams.delete(streamId);
          this.logger.info('Cleaned up inactive stream', 'log-aggregator', { streamId });
        }
      }
    });
  }

  /**
   * Perform retention cleanup based on policy
   */
  private async performRetentionCleanup(): Promise<void> {
    for (const policy of this.config.retention) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

      try {
        const deletedCount = await this.elasticsearch.deleteOldLogs(cutoffDate);
        this.logger.info(
          `Deleted ${deletedCount} logs for service ${policy.service} level ${policy.level}`,
          'log-aggregator',
          { service: policy.service, level: policy.level, retentionDays: policy.retentionDays }
        );
      } catch (error) {
        this.logger.error(
          `Failed retention cleanup for ${policy.service}:${policy.level}`,
          'log-aggregator',
          { error: error.message }
        );
      }
    }
  }

  /**
   * Get dashboard data
   */
  private async getDashboardData(): Promise<LogDashboardData> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const query: LogQuery = {
      startTime: oneHourAgo,
      endTime: now,
      limit: 1000,
    };

    const searchResult = await this.elasticsearch.searchLogs(query);
    const entries = searchResult.entries;

    // Calculate overview metrics
    const totalLogs = searchResult.total;
    const errorLogs = entries.filter(e => e.level === 'error').length;
    const errorRate = totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0;
    const services = new Set(entries.map(e => e.service)).size;

    // Get correlation stats
    const correlationStats = this.correlationEngine.getCorrelationStats();

    return {
      overview: {
        totalLogs,
        errorRate,
        services,
        alerts: 0, // Will be implemented with alert manager
      },
      timeSeries: [], // Will be populated by aggregation query
      topServices: [], // Will be populated by aggregation query
      recentErrors: entries.filter(e => e.level === 'error').slice(0, 10),
      activeAlerts: [], // Will be implemented with alert manager
      correlations: [], // Will be populated from correlation engine
    };
  }

  /**
   * Validate log entry format
   */
  private validateLogEntry(data: any): LogEntry {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid log entry: must be an object');
    }

    const required = ['level', 'message', 'service'];
    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Invalid log entry: missing required field '${field}'`);
      }
    }

    return {
      id: data.id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      level: data.level,
      message: data.message,
      service: data.service,
      correlationId: data.correlationId,
      traceId: data.traceId,
      spanId: data.spanId,
      userId: data.userId,
      sessionId: data.sessionId,
      requestId: data.requestId,
      metadata: data.metadata || {},
      context: data.context || {},
    };
  }

  /**
   * Test database connections
   */
  private async testConnections(): Promise<void> {
    // Test PostgreSQL
    try {
      const client = await this.postgres.connect();
      await client.query('SELECT 1');
      client.release();
    } catch (error) {
      throw new Error(`PostgreSQL connection failed: ${error.message}`);
    }

    // Test Redis
    try {
      await this.redis.ping();
    } catch (error) {
      throw new Error(`Redis connection failed: ${error.message}`);
    }
  }

  /**
   * Health check methods
   */
  private async checkElasticsearchHealth(): Promise<string> {
    try {
      const health = await this.elasticsearch.checkHealth();
      return health.status;
    } catch {
      return 'unhealthy';
    }
  }

  private async checkRedisHealth(): Promise<string> {
    try {
      const response = await this.redis.ping();
      return response === 'PONG' ? 'healthy' : 'unhealthy';
    } catch {
      return 'unhealthy';
    }
  }

  private async checkPostgresHealth(): Promise<string> {
    try {
      const client = await this.postgres.connect();
      await client.query('SELECT 1');
      client.release();
      return 'healthy';
    } catch {
      return 'unhealthy';
    }
  }

  /**
   * Start the service
   */
  async start(): Promise<void> {
    await this.initialize();

    const port = this.config.server.port;
    const host = this.config.server.host;

    try {
      await this.fastify.listen({ port, host });
      console.log(`🚀 Log Aggregator Service running at http://${host}:${port}`);
    } catch (error) {
      console.error('Failed to start Log Aggregator Service:', error);
      throw error;
    }
  }

  /**
   * Stop the service
   */
  async stop(): Promise<void> {
    try {
      // Clear buffer flush interval
      if (this.bufferFlushInterval) {
        clearInterval(this.bufferFlushInterval);
      }

      // Flush remaining logs
      if (this.logBuffer.length > 0) {
        await this.elasticsearch.bulkIndexLogs(this.logBuffer);
      }

      // Close connections
      await this.fastify.close();
      await this.redis.quit();
      await this.postgres.end();
      await this.elasticsearch.close();
      await this.logger.close();

      console.log('Log Aggregator Service stopped');
    } catch (error) {
      console.error('Error stopping Log Aggregator Service:', error);
    }
  }
}

/**
 * Create and start log aggregator service
 */
export const createLogAggregatorService = (config?: LoggingConfig): LogAggregatorService => {
  return new LogAggregatorService(config);
};