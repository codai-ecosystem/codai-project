/**
 * ROMAI Real-time Analytics Integration Service
 * TypeScript implementation for integrating ROMAI services with real-time monitoring
 */

import { EventEmitter } from 'events';
import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, format, transports, Logger } from 'winston';

interface RomaiService {
  name: string;
  url: string;
  healthEndpoint: string;
  enabled: boolean;
}

interface HealthData {
  service: string;
  status: 'healthy' | 'unhealthy' | 'timeout' | 'error';
  response_time_ms: number;
  timestamp: string;
  details?: Record<string, any>;
  error?: string;
}

interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  service: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface MetricData {
  service: string;
  metric_name: string;
  metric_value: number;
  metric_type: 'counter' | 'gauge' | 'histogram' | 'summary';
  timestamp: string;
  tags?: Record<string, string>;
}

interface AnalyticsConfig {
  services: RomaiService[];
  monitoring: {
    health_check_interval_ms: number;
    metrics_collection_interval_ms: number;
    log_aggregation_interval_ms: number;
    retention_days: number;
  };
  websocket: {
    url: string;
    reconnect_interval_ms: number;
    max_reconnect_attempts: number;
  };
  storage: {
    type: 'memory' | 'file' | 'database';
    max_entries: number;
    file_path?: string;
  };
}

export class RomaiAnalyticsIntegration extends EventEmitter {
  private logger!: Logger;
  private httpClient!: AxiosInstance;
  private config: AnalyticsConfig;
  private isRunning = false;
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private logAggregationInterval?: NodeJS.Timeout;
  private websocketConnection?: WebSocket;
  private reconnectAttempts = 0;

  // In-memory storage (replace with persistent storage as needed)
  private healthData: HealthData[] = [];
  private logEntries: LogEntry[] = [];
  private metrics: MetricData[] = [];

  constructor(config?: Partial<AnalyticsConfig>) {
    super();

    this.config = {
      services: [
        {
          name: 'romai-api',
          url: 'http://localhost:3001',
          healthEndpoint: '/health',
          enabled: true
        },
        {
          name: 'romai-dashboard',
          url: 'http://localhost:3000',
          healthEndpoint: '/api/health',
          enabled: true
        },
        {
          name: 'romai-mcp',
          url: 'http://localhost:3002',
          healthEndpoint: '/health',
          enabled: true
        }
      ],
      monitoring: {
        health_check_interval_ms: 10000, // 10 seconds
        metrics_collection_interval_ms: 5000, // 5 seconds
        log_aggregation_interval_ms: 2000, // 2 seconds
        retention_days: 7
      },
      websocket: {
        url: 'ws://localhost:8765',
        reconnect_interval_ms: 5000,
        max_reconnect_attempts: 10
      },
      storage: {
        type: 'memory',
        max_entries: 10000
      },
      ...config
    };

    this.setupLogger();
    this.setupHttpClient();
  }

  private setupLogger(): void {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      defaultMeta: { service: 'romai-analytics-integration' },
      transports: [
        new transports.File({
          filename: 'logs/analytics-error.log',
          level: 'error'
        }),
        new transports.File({
          filename: 'logs/analytics-combined.log'
        }),
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          )
        })
      ]
    });
  }

  private setupHttpClient(): void {
    this.httpClient = axios.create({
      timeout: 5000,
      headers: {
        'User-Agent': 'ROMAI-Analytics-Integration/1.0.0',
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.httpClient.interceptors.request.use(
      (config) => {
        // Store start time in a map using config as key
        (config as any)._startTime = Date.now();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.httpClient.interceptors.response.use(
      (response) => {
        const duration = Date.now() - ((response.config as any)._startTime || 0);
        this.logger.debug(`HTTP ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
        return response;
      },
      (error) => {
        const duration = error.config ? Date.now() - error.config.metadata.startTime : 0;
        this.logger.error(`HTTP ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error (${duration}ms)`, { error: error.message });
        return Promise.reject(error);
      }
    );
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Analytics integration is already running');
      return;
    }

    this.logger.info('🚀 Starting ROMAI Analytics Integration...');

    try {
      // Connect to WebSocket server
      await this.connectWebSocket();

      // Start monitoring intervals
      this.startHealthChecks();
      this.startMetricsCollection();
      this.startLogAggregation();

      this.isRunning = true;
      this.logger.info('✅ ROMAI Analytics Integration started successfully');

      this.emit('started');

    } catch (error) {
      this.logger.error('❌ Failed to start analytics integration:', error);
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Analytics integration is not running');
      return;
    }

    this.logger.info('🛑 Stopping ROMAI Analytics Integration...');

    this.isRunning = false;

    // Clear intervals
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    if (this.metricsInterval) clearInterval(this.metricsInterval);
    if (this.logAggregationInterval) clearInterval(this.logAggregationInterval);

    // Close WebSocket connection
    if (this.websocketConnection) {
      this.websocketConnection.close();
    }

    this.logger.info('✅ Analytics integration stopped');
    this.emit('stopped');
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.websocketConnection = new WebSocket(this.config.websocket.url);

        this.websocketConnection.onopen = () => {
          this.logger.info(`✅ Connected to WebSocket server at ${this.config.websocket.url}`);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.websocketConnection.onclose = () => {
          this.logger.warn('❌ WebSocket connection closed');
          if (this.isRunning) {
            this.scheduleReconnect();
          }
        };

        this.websocketConnection.onerror = (error) => {
          this.logger.error('WebSocket error:', error);
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };

        this.websocketConnection.onmessage = (event) => {
          this.handleWebSocketMessage(event.data);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.websocket.max_reconnect_attempts) {
      this.logger.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.logger.info(`⏳ Attempting to reconnect (${this.reconnectAttempts}/${this.config.websocket.max_reconnect_attempts})...`);

    setTimeout(() => {
      this.connectWebSocket().catch((error) => {
        this.logger.error('Reconnection failed:', error);
      });
    }, this.config.websocket.reconnect_interval_ms);
  }

  private handleWebSocketMessage(data: any): void {
    try {
      const message = JSON.parse(data);
      this.emit('websocket_message', message);
    } catch (error) {
      this.logger.error('Failed to parse WebSocket message:', error);
    }
  }

  private sendWebSocketMessage(data: any): void {
    if (this.websocketConnection && this.websocketConnection.readyState === WebSocket.OPEN) {
      try {
        this.websocketConnection.send(JSON.stringify(data));
      } catch (error) {
        this.logger.error('Failed to send WebSocket message:', error);
      }
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.monitoring.health_check_interval_ms);

    // Perform initial health check
    this.performHealthChecks();
  }

  private async performHealthChecks(): Promise<void> {
    const healthPromises = this.config.services
      .filter(service => service.enabled)
      .map(service => this.checkServiceHealth(service));

    const healthResults = await Promise.allSettled(healthPromises);

    healthResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.storeHealthData(result.value);
        this.broadcastHealthData(result.value);
      } else {
        const service = this.config.services[index];
        const errorHealth: HealthData = {
          service: service.name,
          status: 'error',
          response_time_ms: 0,
          timestamp: new Date().toISOString(),
          error: result.reason?.message || 'Unknown error'
        };
        this.storeHealthData(errorHealth);
        this.broadcastHealthData(errorHealth);
      }
    });
  }

  private async checkServiceHealth(service: RomaiService): Promise<HealthData> {
    const startTime = Date.now();

    try {
      const response = await this.httpClient.get(`${service.url}${service.healthEndpoint}`);
      const responseTime = Date.now() - startTime;

      return {
        service: service.name,
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        response_time_ms: responseTime,
        timestamp: new Date().toISOString(),
        details: response.data
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;

      if (error.code === 'ECONNABORTED') {
        return {
          service: service.name,
          status: 'timeout',
          response_time_ms: responseTime,
          timestamp: new Date().toISOString(),
          error: 'Request timeout'
        };
      }

      return {
        service: service.name,
        status: 'error',
        response_time_ms: responseTime,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  private storeHealthData(health: HealthData): void {
    this.healthData.push(health);

    // Maintain storage limit
    if (this.healthData.length > this.config.storage.max_entries) {
      this.healthData = this.healthData.slice(-this.config.storage.max_entries);
    }
  }

  private broadcastHealthData(health: HealthData): void {
    this.sendWebSocketMessage({
      stream_type: 'health',
      service: health.service,
      data: health,
      timestamp: health.timestamp
    });

    this.emit('health_data', health);
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.monitoring.metrics_collection_interval_ms);

    // Collect initial metrics
    this.collectMetrics();
  }

  private collectMetrics(): void {
    // System metrics
    const systemMetrics = this.generateSystemMetrics();
    systemMetrics.forEach(metric => {
      this.storeMetric(metric);
      this.broadcastMetric(metric);
    });

    // Service-specific metrics
    this.config.services.forEach(service => {
      if (service.enabled) {
        const serviceMetrics = this.generateServiceMetrics(service.name);
        serviceMetrics.forEach(metric => {
          this.storeMetric(metric);
          this.broadcastMetric(metric);
        });
      }
    });
  }

  private generateSystemMetrics(): MetricData[] {
    const timestamp = new Date().toISOString();

    return [
      {
        service: 'romai-system',
        metric_name: 'cpu_usage_percent',
        metric_value: Math.round((Math.random() * 80 + 10) * 100) / 100,
        metric_type: 'gauge',
        timestamp,
        tags: { host: 'localhost', environment: 'development' }
      },
      {
        service: 'romai-system',
        metric_name: 'memory_usage_mb',
        metric_value: Math.floor(Math.random() * 3584) + 512,
        metric_type: 'gauge',
        timestamp,
        tags: { host: 'localhost', environment: 'development' }
      },
      {
        service: 'romai-system',
        metric_name: 'active_connections',
        metric_value: Math.floor(Math.random() * 100) + 10,
        metric_type: 'gauge',
        timestamp,
        tags: { host: 'localhost', environment: 'development' }
      }
    ];
  }

  private generateServiceMetrics(serviceName: string): MetricData[] {
    const timestamp = new Date().toISOString();

    return [
      {
        service: serviceName,
        metric_name: 'requests_per_second',
        metric_value: Math.round((Math.random() * 50 + 5) * 100) / 100,
        metric_type: 'counter',
        timestamp,
        tags: { service: serviceName }
      },
      {
        service: serviceName,
        metric_name: 'response_time_ms',
        metric_value: Math.floor(Math.random() * 300) + 20,
        metric_type: 'histogram',
        timestamp,
        tags: { service: serviceName }
      }
    ];
  }

  private storeMetric(metric: MetricData): void {
    this.metrics.push(metric);

    // Maintain storage limit
    if (this.metrics.length > this.config.storage.max_entries) {
      this.metrics = this.metrics.slice(-this.config.storage.max_entries);
    }
  }

  private broadcastMetric(metric: MetricData): void {
    this.sendWebSocketMessage({
      stream_type: 'metrics',
      service: metric.service,
      data: metric,
      timestamp: metric.timestamp
    });

    this.emit('metric_data', metric);
  }

  private startLogAggregation(): void {
    this.logAggregationInterval = setInterval(() => {
      this.aggregateLogs();
    }, this.config.monitoring.log_aggregation_interval_ms);
  }

  private aggregateLogs(): void {
    // Generate sample log entries
    const logEntries = this.generateSampleLogs();

    logEntries.forEach(log => {
      this.storeLogEntry(log);
      this.broadcastLogEntry(log);
    });
  }

  private generateSampleLogs(): LogEntry[] {
    const services = this.config.services.map(s => s.name);
    const levels: Array<'info' | 'warn' | 'error' | 'debug'> = ['info', 'warn', 'error', 'debug'];
    const messages = [
      'User authentication successful',
      'API request processed',
      'Database query executed',
      'Cache hit for user data',
      'Session created',
      'File upload completed',
      'Configuration updated',
      'Health check passed'
    ];

    const logs: LogEntry[] = [];

    // Generate 1-3 log entries per interval
    const count = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < count; i++) {
      logs.push({
        level: levels[Math.floor(Math.random() * levels.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        service: services[Math.floor(Math.random() * services.length)],
        timestamp: new Date().toISOString(),
        metadata: {
          request_id: uuidv4(),
          user_id: `user_${Math.floor(Math.random() * 100) + 1}`,
          session_id: `session_${Math.floor(Math.random() * 50) + 1}`
        }
      });
    }

    return logs;
  }

  private storeLogEntry(log: LogEntry): void {
    this.logEntries.push(log);

    // Maintain storage limit
    if (this.logEntries.length > this.config.storage.max_entries) {
      this.logEntries = this.logEntries.slice(-this.config.storage.max_entries);
    }
  }

  private broadcastLogEntry(log: LogEntry): void {
    this.sendWebSocketMessage({
      stream_type: 'logs',
      service: log.service,
      data: log,
      timestamp: log.timestamp
    });

    this.emit('log_entry', log);
  }

  // Public API methods
  public getHealthData(service?: string): HealthData[] {
    if (service) {
      return this.healthData.filter(h => h.service === service);
    }
    return [...this.healthData];
  }

  public getMetrics(service?: string): MetricData[] {
    if (service) {
      return this.metrics.filter(m => m.service === service);
    }
    return [...this.metrics];
  }

  public getLogEntries(service?: string): LogEntry[] {
    if (service) {
      return this.logEntries.filter(l => l.service === service);
    }
    return [...this.logEntries];
  }

  public getStatus(): Record<string, any> {
    return {
      is_running: this.isRunning,
      websocket_connected: this.websocketConnection?.readyState === WebSocket.OPEN,
      services_monitored: this.config.services.filter(s => s.enabled).length,
      data_points: {
        health_entries: this.healthData.length,
        metric_entries: this.metrics.length,
        log_entries: this.logEntries.length
      },
      last_activity: new Date().toISOString()
    };
  }
}

// CLI execution
if (require.main === module) {
  const integration = new RomaiAnalyticsIntegration();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await integration.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await integration.stop();
    process.exit(0);
  });

  // Start integration
  integration.start().catch((error) => {
    console.error('❌ Failed to start integration:', error);
    process.exit(1);
  });
}
