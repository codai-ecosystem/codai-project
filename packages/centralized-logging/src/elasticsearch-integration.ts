import { Client } from '@elastic/elasticsearch';
import { LogEntry, LogQuery, LogAggregation, LoggingConfig } from './types.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Elasticsearch Integration for Log Search and Analytics
 * Provides search, indexing, and aggregation capabilities
 */

export class ElasticsearchIntegration {
  private client: Client;
  private config: LoggingConfig;
  private indexName: string;

  constructor(config: LoggingConfig) {
    this.config = config;
    this.indexName = config.elasticsearch.index;

    this.client = new Client({
      node: config.elasticsearch.node,
      maxRetries: config.elasticsearch.maxRetries,
      requestTimeout: config.elasticsearch.requestTimeout,
      sniffOnStart: config.elasticsearch.sniffOnStart,
    });
  }

  /**
   * Initialize Elasticsearch index with proper mapping
   */
  async initialize(): Promise<void> {
    try {
      // Check if index exists
      const indexExists = await this.client.indices.exists({
        index: this.indexName,
      });

      if (!indexExists) {
        // Create index with mapping
        await this.client.indices.create({
          index: this.indexName,
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0,
              'index.max_result_window': 50000,
              analysis: {
                analyzer: {
                  log_analyzer: {
                    tokenizer: 'standard',
                    filter: ['lowercase', 'stop'],
                  },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                timestamp: { type: 'date' },
                level: { type: 'keyword' },
                message: {
                  type: 'text',
                  analyzer: 'log_analyzer',
                  fields: {
                    keyword: { type: 'keyword', ignore_above: 256 },
                  },
                },
                service: { type: 'keyword' },
                correlationId: { type: 'keyword' },
                traceId: { type: 'keyword' },
                spanId: { type: 'keyword' },
                userId: { type: 'keyword' },
                sessionId: { type: 'keyword' },
                requestId: { type: 'keyword' },
                metadata: { type: 'object', enabled: true },
                context: {
                  type: 'object',
                  properties: {
                    environment: { type: 'keyword' },
                    version: { type: 'keyword' },
                    hostname: { type: 'keyword' },
                    pid: { type: 'integer' },
                    memory: {
                      type: 'object',
                      properties: {
                        heapUsed: { type: 'long' },
                        heapTotal: { type: 'long' },
                        external: { type: 'long' },
                        rss: { type: 'long' },
                      },
                    },
                    uptime: { type: 'float' },
                  },
                },
              },
            },
          },
        });

        console.log(`Created Elasticsearch index: ${this.indexName}`);
      }

      // Create index template for future indices
      await this.createIndexTemplate();

    } catch (error) {
      console.error('Failed to initialize Elasticsearch:', error);
      throw error;
    }
  }

  /**
   * Create index template for log rotation
   */
  private async createIndexTemplate(): Promise<void> {
    const templateName = `${this.indexName}-template`;

    await this.client.indices.putTemplate({
      name: templateName,
      body: {
        index_patterns: [`${this.indexName}-*`],
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
          'index.max_result_window': 50000,
        },
        mappings: {
          properties: {
            id: { type: 'keyword' },
            timestamp: { type: 'date' },
            level: { type: 'keyword' },
            message: { type: 'text', analyzer: 'standard' },
            service: { type: 'keyword' },
            correlationId: { type: 'keyword' },
            traceId: { type: 'keyword' },
            metadata: { type: 'object' },
            context: { type: 'object' },
          },
        },
      },
    });
  }

  /**
   * Index a single log entry
   */
  async indexLog(entry: LogEntry): Promise<void> {
    try {
      await this.client.index({
        index: this.indexName,
        id: entry.id,
        body: entry,
      });
    } catch (error) {
      console.error('Failed to index log entry:', error);
      throw error;
    }
  }

  /**
   * Bulk index multiple log entries
   */
  async bulkIndexLogs(entries: LogEntry[]): Promise<void> {
    if (entries.length === 0) return;

    const body: any[] = [];

    for (const entry of entries) {
      body.push({
        index: {
          _index: this.indexName,
          _id: entry.id,
        },
      });
      body.push(entry);
    }

    try {
      const response = await this.client.bulk({
        body,
        refresh: 'wait_for',
      });

      if (response.errors) {
        console.error('Bulk indexing errors:', response.items);
      }
    } catch (error) {
      console.error('Failed to bulk index log entries:', error);
      throw error;
    }
  }

  /**
   * Search logs based on query parameters
   */
  async searchLogs(query: LogQuery): Promise<{ entries: LogEntry[]; total: number }> {
    try {
      const searchBody = this.buildSearchQuery(query);

      const response = await this.client.search({
        index: this.indexName,
        body: searchBody,
      });

      const entries: LogEntry[] = response.hits.hits.map((hit: any) => hit._source);
      const total = typeof response.hits.total === 'object'
        ? response.hits.total.value
        : response.hits.total;

      return { entries, total };
    } catch (error) {
      console.error('Failed to search logs:', error);
      throw error;
    }
  }

  /**
   * Build Elasticsearch query from LogQuery parameters
   */
  private buildSearchQuery(query: LogQuery): any {
    const must: any[] = [];
    const filter: any[] = [];

    // Service filter
    if (query.services && query.services.length > 0) {
      filter.push({
        terms: { service: query.services },
      });
    }

    // Level filter
    if (query.levels && query.levels.length > 0) {
      filter.push({
        terms: { level: query.levels },
      });
    }

    // Time range filter
    if (query.startTime || query.endTime) {
      const timeRange: any = {};
      if (query.startTime) timeRange.gte = query.startTime.toISOString();
      if (query.endTime) timeRange.lte = query.endTime.toISOString();

      filter.push({
        range: { timestamp: timeRange },
      });
    }

    // Correlation ID filter
    if (query.correlationId) {
      filter.push({
        term: { correlationId: query.correlationId },
      });
    }

    // Trace ID filter
    if (query.traceId) {
      filter.push({
        term: { traceId: query.traceId },
      });
    }

    // User ID filter
    if (query.userId) {
      filter.push({
        term: { userId: query.userId },
      });
    }

    // Search text
    if (query.searchText) {
      must.push({
        multi_match: {
          query: query.searchText,
          fields: ['message', 'metadata.*'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Build final query
    const searchQuery: any = {
      bool: {
        must: must.length > 0 ? must : undefined,
        filter: filter.length > 0 ? filter : undefined,
      },
    };

    // Sort
    const sort = [];
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'desc';
    sort.push({ [sortBy]: { order: sortOrder } });

    return {
      query: searchQuery,
      sort,
      size: query.limit || 100,
      from: query.offset || 0,
    };
  }

  /**
   * Get log aggregations
   */
  async aggregateLogs(field: string, query: LogQuery): Promise<LogAggregation[]> {
    try {
      const searchBody = {
        query: this.buildSearchQuery(query).query,
        size: 0,
        aggs: {
          field_aggregation: {
            terms: {
              field,
              size: 100,
            },
          },
        },
      };

      // Add date histogram for time-based aggregations
      if (query.startTime && query.endTime && field === 'timestamp') {
        const interval = this.calculateInterval(query.startTime, query.endTime);
        searchBody.aggs = {
          time_aggregation: {
            date_histogram: {
              field: 'timestamp',
              interval,
              min_doc_count: 0,
              extended_bounds: {
                min: query.startTime.toISOString(),
                max: query.endTime.toISOString(),
              },
            },
          },
        };
      }

      const response = await this.client.search({
        index: this.indexName,
        body: searchBody,
      });

      const aggregations: LogAggregation[] = [];

      if (response.aggregations?.field_aggregation?.buckets) {
        for (const bucket of response.aggregations.field_aggregation.buckets) {
          aggregations.push({
            field,
            value: bucket.key,
            count: bucket.doc_count,
          });
        }
      }

      if (response.aggregations?.time_aggregation?.buckets) {
        for (const bucket of response.aggregations.time_aggregation.buckets) {
          aggregations.push({
            field: 'timestamp',
            timestamp: new Date(bucket.key),
            count: bucket.doc_count,
          });
        }
      }

      return aggregations;
    } catch (error) {
      console.error('Failed to aggregate logs:', error);
      throw error;
    }
  }

  /**
   * Calculate appropriate interval for date histogram
   */
  private calculateInterval(startTime: Date, endTime: Date): string {
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours <= 1) return '1m';
    if (diffHours <= 24) return '1h';
    if (diffHours <= 168) return '1d'; // 1 week
    return '1w';
  }

  /**
   * Delete old log entries based on retention policy
   */
  async deleteOldLogs(cutoffDate: Date): Promise<number> {
    try {
      const response = await this.client.deleteByQuery({
        index: this.indexName,
        body: {
          query: {
            range: {
              timestamp: {
                lt: cutoffDate.toISOString(),
              },
            },
          },
        },
      });

      return response.deleted || 0;
    } catch (error) {
      console.error('Failed to delete old logs:', error);
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<any> {
    try {
      const response = await this.client.indices.stats({
        index: this.indexName,
      });

      return response.indices[this.indexName];
    } catch (error) {
      console.error('Failed to get index stats:', error);
      throw error;
    }
  }

  /**
   * Check Elasticsearch cluster health
   */
  async checkHealth(): Promise<any> {
    try {
      const health = await this.client.cluster.health();
      const info = await this.client.info();

      return {
        cluster: health,
        version: info.version.number,
        status: health.status,
      };
    } catch (error) {
      console.error('Failed to check Elasticsearch health:', error);
      throw error;
    }
  }

  /**
   * Close Elasticsearch client
   */
  async close(): Promise<void> {
    try {
      await this.client.close();
    } catch (error) {
      console.error('Failed to close Elasticsearch client:', error);
    }
  }
}

/**
 * Create Elasticsearch integration instance
 */
export const createElasticsearchIntegration = (config: LoggingConfig): ElasticsearchIntegration => {
  return new ElasticsearchIntegration(config);
};