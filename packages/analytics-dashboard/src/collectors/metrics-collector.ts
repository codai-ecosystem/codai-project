// Real-time Metrics Collector for Essential CodAI Services
import axios from 'axios';
import { Client as PgClient } from 'pg';
import Redis from 'ioredis';
import {
  MetricsCollector,
  SystemPerformance,
  ServiceHealth,
  UserActivity,
  BusinessMetrics,
  AnalyticsConfig
} from '../types.js';

export class CodAIMetricsCollector implements MetricsCollector {
  private postgres: PgClient;
  private redis: Redis;
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.postgres = new PgClient({
      host: config.database.postgres.host,
      port: config.database.postgres.port,
      database: config.database.postgres.database,
      user: config.database.postgres.username,
      password: config.database.postgres.password,
    });
    this.redis = new Redis({
      host: config.database.redis.host,
      port: config.database.redis.port,
      password: config.database.redis.password || undefined,
      keyPrefix: config.database.redis.keyPrefix,
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.postgres.connect();
      console.log('📊 Connected to PostgreSQL for analytics');

      // Test Redis connection
      await this.redis.ping();
      console.log('📊 Connected to Redis for analytics cache');

      // Initialize metrics tables if needed
      await this.initializeMetricsTables();
    } catch (error) {
      console.error('❌ Failed to initialize metrics collector:', error);
      throw error;
    }
  }

  private async initializeMetricsTables(): Promise<void> {
    const tables = [
      `
        CREATE TABLE IF NOT EXISTS analytics_metrics (
          id SERIAL PRIMARY KEY,
          metric_name VARCHAR(255) NOT NULL,
          service VARCHAR(100) NOT NULL,
          value NUMERIC NOT NULL,
          unit VARCHAR(50),
          category VARCHAR(50),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          metadata JSONB,
          CONSTRAINT unique_metric_service_timestamp UNIQUE (metric_name, service, timestamp)
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS service_health_history (
          id SERIAL PRIMARY KEY,
          service VARCHAR(100) NOT NULL,
          status VARCHAR(20) NOT NULL,
          uptime NUMERIC,
          response_time NUMERIC,
          error_rate NUMERIC,
          throughput NUMERIC,
          details JSONB,
          checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS user_activity_log (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255),
          session_id VARCHAR(255),
          action VARCHAR(255) NOT NULL,
          service VARCHAR(100),
          path VARCHAR(500),
          metadata JSONB,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      `
        CREATE INDEX IF NOT EXISTS idx_analytics_metrics_timestamp 
        ON analytics_metrics (timestamp DESC)
      `,
      `
        CREATE INDEX IF NOT EXISTS idx_analytics_metrics_service 
        ON analytics_metrics (service, timestamp DESC)
      `,
      `
        CREATE INDEX IF NOT EXISTS idx_service_health_timestamp 
        ON service_health_history (checked_at DESC)
      `,
      `
        CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp 
        ON user_activity_log (timestamp DESC)
      `,
    ];

    for (const table of tables) {
      await this.postgres.query(table);
    }
  }

  async collectSystemMetrics(): Promise<SystemPerformance> {
    const key = 'system_metrics';
    const cached = await this.redis.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    // Collect system metrics (simplified for demo)
    const metrics: SystemPerformance = {
      cpu: {
        usage: Math.random() * 100, // Replace with actual CPU monitoring
        cores: 8,
      },
      memory: {
        used: Math.random() * 8 * 1024 * 1024 * 1024, // 0-8GB
        total: 8 * 1024 * 1024 * 1024, // 8GB
        usage: Math.random() * 100,
      },
      disk: {
        used: Math.random() * 500 * 1024 * 1024 * 1024, // 0-500GB
        total: 1024 * 1024 * 1024 * 1024, // 1TB
        usage: Math.random() * 100,
      },
      network: {
        bytesIn: Math.floor(Math.random() * 1000000),
        bytesOut: Math.floor(Math.random() * 1000000),
        packetsIn: Math.floor(Math.random() * 10000),
        packetsOut: Math.floor(Math.random() * 10000),
      },
    };

    // Cache for 30 seconds
    await this.redis.setex(key, 30, JSON.stringify(metrics));
    return metrics;
  }

  async collectServiceHealth(service: string): Promise<ServiceHealth> {
    const serviceUrl = this.getServiceUrl(service);
    if (!serviceUrl) {
      return {
        service,
        status: 'unknown',
        uptime: 0,
        responseTime: 0,
        errorRate: 100,
        throughput: 0,
        lastChecked: new Date(),
      };
    }

    try {
      const startTime = Date.now();
      const response = await axios.get(`${serviceUrl}/health`, {
        timeout: 5000,
      });
      const responseTime = Date.now() - startTime;

      const health: ServiceHealth = {
        service,
        status: response.status === 200 ? 'healthy' : 'degraded',
        uptime: 99.9, // Calculate actual uptime from database
        responseTime,
        errorRate: 0, // Calculate from logs
        throughput: Math.floor(Math.random() * 100), // Calculate from metrics
        lastChecked: new Date(),
        details: response.data,
      };

      // Store health history
      await this.postgres.query(
        `INSERT INTO service_health_history 
         (service, status, uptime, response_time, error_rate, throughput, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          health.service,
          health.status,
          health.uptime,
          health.responseTime,
          health.errorRate,
          health.throughput,
          JSON.stringify(health.details),
        ]
      );

      return health;
    } catch (error) {
      const health: ServiceHealth = {
        service,
        status: 'unhealthy',
        uptime: 0,
        responseTime: 0,
        errorRate: 100,
        throughput: 0,
        lastChecked: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };

      // Store failure
      await this.postgres.query(
        `INSERT INTO service_health_history 
         (service, status, uptime, response_time, error_rate, throughput, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          health.service,
          health.status,
          health.uptime,
          health.responseTime,
          health.errorRate,
          health.throughput,
          JSON.stringify(health.details),
        ]
      );

      return health;
    }
  }

  async collectUserActivity(): Promise<UserActivity> {
    try {
      // Collect user activity from database
      const result = await this.postgres.query(`
        SELECT 
          COUNT(DISTINCT user_id) as active_users,
          COUNT(DISTINCT session_id) as sessions_today,
          AVG(EXTRACT(EPOCH FROM (
            MAX(timestamp) - MIN(timestamp)
          ))) / 60 as avg_session_duration
        FROM user_activity_log 
        WHERE timestamp >= CURRENT_DATE
      `);

      const topPages = await this.postgres.query(`
        SELECT 
          path,
          COUNT(*) as views,
          COUNT(DISTINCT user_id) as unique_visitors
        FROM user_activity_log 
        WHERE timestamp >= CURRENT_DATE 
          AND path IS NOT NULL
        GROUP BY path 
        ORDER BY views DESC 
        LIMIT 10
      `);

      const userActions = await this.postgres.query(`
        SELECT 
          action,
          service,
          COUNT(*) as count
        FROM user_activity_log 
        WHERE timestamp >= CURRENT_DATE
        GROUP BY action, service 
        ORDER BY count DESC 
        LIMIT 20
      `);

      const stats = result.rows[0];

      return {
        activeUsers: parseInt(stats.active_users) || 0,
        sessionsToday: parseInt(stats.sessions_today) || 0,
        averageSessionDuration: parseFloat(stats.avg_session_duration) || 0,
        topPages: topPages.rows,
        userActions: userActions.rows,
      };
    } catch (error) {
      console.error('Error collecting user activity:', error);
      return {
        activeUsers: 0,
        sessionsToday: 0,
        averageSessionDuration: 0,
        topPages: [],
        userActions: [],
      };
    }
  }

  async collectBusinessMetrics(): Promise<BusinessMetrics> {
    // For demo purposes, generate sample business metrics
    // In production, this would connect to actual business databases
    return {
      revenue: {
        total: Math.floor(Math.random() * 100000),
        growth: (Math.random() - 0.5) * 20, // -10% to +10%
        trend: Math.random() > 0.5 ? 'up' : 'down',
      },
      conversions: {
        rate: Math.random() * 10, // 0-10%
        count: Math.floor(Math.random() * 1000),
        value: Math.floor(Math.random() * 50000),
      },
      customerMetrics: {
        totalCustomers: Math.floor(Math.random() * 10000),
        newCustomers: Math.floor(Math.random() * 100),
        churnRate: Math.random() * 5, // 0-5%
        ltv: Math.floor(Math.random() * 1000),
      },
    };
  }

  async collectAllServicesHealth(): Promise<ServiceHealth[]> {
    const services = [
      'identity-api',
      'api-gateway',
      'hub-api',
      'memorai-mcp',
      'cbd-database',
      'memorai-frontend',
    ];

    const healthPromises = services.map(service =>
      this.collectServiceHealth(service)
    );

    return Promise.all(healthPromises);
  }

  private getServiceUrl(service: string): string | null {
    const serviceMap: Record<string, string> = {
      'identity-api': this.config.services.identityApi,
      'api-gateway': this.config.services.apiGateway,
      'hub-api': this.config.services.hubApi,
      'memorai-mcp': this.config.services.memoraiMcp,
      'cbd-database': this.config.services.cbdDatabase,
      'memorai-frontend': this.config.services.memoraiFrontend,
    };

    return serviceMap[service] || null;
  }

  async recordMetric(
    metricName: string,
    service: string,
    value: number,
    unit = '',
    category = 'system',
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      await this.postgres.query(
        `INSERT INTO analytics_metrics 
         (metric_name, service, value, unit, category, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (metric_name, service, timestamp) 
         DO UPDATE SET value = EXCLUDED.value, metadata = EXCLUDED.metadata`,
        [metricName, service, value, unit, category, JSON.stringify(metadata)]
      );

      // Also cache recent metrics in Redis
      const key = `metric:${service}:${metricName}`;
      await this.redis.lpush(key, JSON.stringify({
        value,
        timestamp: new Date().toISOString(),
        metadata,
      }));

      // Keep only last 100 entries
      await this.redis.ltrim(key, 0, 99);
    } catch (error) {
      console.error('Error recording metric:', error);
    }
  }

  async getMetricHistory(
    metricName: string,
    service: string,
    hours = 24
  ): Promise<Array<{ timestamp: Date; value: number }>> {
    try {
      const result = await this.postgres.query(
        `SELECT timestamp, value 
         FROM analytics_metrics 
         WHERE metric_name = $1 AND service = $2 
           AND timestamp >= NOW() - INTERVAL '${hours} hours'
         ORDER BY timestamp ASC`,
        [metricName, service]
      );

      return result.rows.map(row => ({
        timestamp: new Date(row.timestamp),
        value: parseFloat(row.value),
      }));
    } catch (error) {
      console.error('Error getting metric history:', error);
      return [];
    }
  }

  async cleanup(): Promise<void> {
    await this.postgres.end();
    await this.redis.quit();
  }
}