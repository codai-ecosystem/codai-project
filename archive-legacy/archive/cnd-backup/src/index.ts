// Main CND Class - The primary entry point with Enterprise Features
import { Observable } from 'rxjs';
import { CBDAdapter } from './cbd-adapter.js';
import { SQLApi } from './apis/sql.js';
import { DocumentAPI } from './apis/document.js';
import { GraphAPI } from './apis/graph.js';
import { VectorAPI } from './apis/vector.js';
import { TimeSeriesAPI } from './apis/timeseries.js';
import { CacheAPI } from './apis/cache.js';
import { SchemaManager } from './schema.js';
import { MigrationManager } from './migration.js';
import { RealtimeEngine } from './realtime.js';

// Enterprise Components
import { AuthenticationManager } from './enterprise/authentication.js';
import { ServiceDiscoveryManager } from './enterprise/service-discovery.js';
import { AuditLogger } from './enterprise/audit-logger.js';
import { MetricsManager } from './enterprise/metrics.js';

import {
  CNDConfig,
  SchemaDefinition,
  Transaction,
  AdminConfig,
  AuthenticationContext,
  ServiceDiscoveryConfig
} from './types.js';

export class CND {
  private cbdAdapter: CBDAdapter;
  private sqlApi: SQLApi;
  private schemaManager: SchemaManager;
  private migrationManager: MigrationManager;
  private realtimeEngine: RealtimeEngine;
  private config: CNDConfig;

  // Enterprise Managers
  private authManager?: AuthenticationManager;
  private serviceDiscovery?: ServiceDiscoveryManager;
  private auditLogger?: AuditLogger;
  private metricsManager?: MetricsManager;

  // Public APIs
  public cache: CacheAPI;

  constructor(config: CNDConfig) {
    this.config = config;
    this.cbdAdapter = new CBDAdapter(config.cbd);

    // Initialize API layers
    this.sqlApi = new SQLApi(this.cbdAdapter);
    this.schemaManager = new SchemaManager(this.cbdAdapter);
    this.migrationManager = new MigrationManager(this.cbdAdapter);
    this.realtimeEngine = new RealtimeEngine(this.cbdAdapter, config.realtime);
    this.cache = new CacheAPI(this.cbdAdapter, config.cache);

    // Initialize Enterprise Components
    this.initializeEnterpriseFeatures();
  }

  private initializeEnterpriseFeatures(): void {
    if (this.config.enterprise?.enabled) {
      console.log('Initializing enterprise features...');

      // Authentication Manager
      if (this.config.auth?.enabled) {
        this.authManager = new AuthenticationManager(this.config.auth);
      }

      // Service Discovery
      if (this.config.serviceDiscovery?.enabled) {
        const serviceConfig: ServiceDiscoveryConfig = {
          enabled: true,
          registryUrl: this.config.serviceDiscovery.registryUrl || 'http://localhost:8500',
          serviceName: this.config.serviceDiscovery.serviceName || 'cnd-service',
          serviceId: `cnd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          version: '1.0.0',
          tags: this.config.serviceDiscovery.tags || ['database', 'cnd'],
          healthCheck: {
            path: '/health',
            interval: this.config.serviceDiscovery.healthCheckInterval || 30000,
            timeout: 5000
          },
          metadata: {
            startTime: new Date(),
            features: Object.keys(this.config.enterprise.features).filter(
              key => this.config.enterprise!.features[key as keyof typeof this.config.enterprise.features]
            )
          }
        };
        this.serviceDiscovery = new ServiceDiscoveryManager(serviceConfig);
      }

      // Audit Logger
      if (this.config.security?.audit?.enabled) {
        this.auditLogger = new AuditLogger(this.config.security);
      }

      // Metrics Manager
      if (this.config.performance?.monitoring?.enabled) {
        this.metricsManager = new MetricsManager(this.config.performance);
      }
    }
  }

  // Connection Management with Enterprise Features
  async connect(): Promise<void> {
    console.log('Connecting to CND with enterprise features...');

    // Start metrics collection first
    if (this.metricsManager) {
      await this.metricsManager.start();
      this.metricsManager.recordAPIRequest('connect', Date.now(), 'success');
    }

    await this.cbdAdapter.connect();

    if (this.config.realtime?.enabled) {
      await this.realtimeEngine.start();
    }

    // Start enterprise services
    if (this.serviceDiscovery) {
      await this.serviceDiscovery.start();
    }

    console.log('CND enterprise connection established');
  }

  async disconnect(): Promise<void> {
    console.log('Disconnecting from CND...');

    // Stop enterprise services first
    if (this.serviceDiscovery) {
      await this.serviceDiscovery.stop();
    }

    if (this.metricsManager) {
      await this.metricsManager.stop();
    }

    if (this.config.realtime?.enabled) {
      await this.realtimeEngine.stop();
    }

    await this.cbdAdapter.disconnect();
    console.log('CND disconnected');
  }

  // SQL API
  sql(): SQLApi;
  sql<T = any>(query: TemplateStringsArray, ...values: any[]): Promise<T[]>;
  sql<T = any>(query?: TemplateStringsArray, ...values: any[]): SQLApi | Promise<T[]> {
    if (query === undefined) {
      // Return the SQL API instance for method chaining
      return this.sqlApi;
    } else {
      // Execute template string query
      return this.sqlApi.sql<T>(query, ...values);
    }
  }

  // Document API
  collection(name: string): DocumentAPI {
    return new DocumentAPI(name, this.cbdAdapter);
  }

  // Graph API
  get graph(): GraphAPI {
    return new GraphAPI(this.cbdAdapter);
  }

  // Vector API
  vector(collection: string): VectorAPI {
    return new VectorAPI(collection, this.cbdAdapter);
  }

  // Time Series API
  timeseries(metric: string): TimeSeriesAPI {
    return new TimeSeriesAPI(metric, this.cbdAdapter);
  }

  // Schema Management
  schema(definition: SchemaDefinition): SchemaManager {
    this.schemaManager.define(definition);
    return this.schemaManager;
  }

  // Transaction Support
  async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    const transactionId = await this.cbdAdapter.beginTransaction();

    const tx: Transaction = {
      sql: <T>(query: TemplateStringsArray, ...values: any[]) =>
        this.sqlApi.sql<T>(query, ...values),
      collection: (name: string) => new DocumentAPI(name, this.cbdAdapter),
      commit: () => this.cbdAdapter.commitTransaction(transactionId),
      rollback: () => this.cbdAdapter.rollbackTransaction(transactionId)
    };

    try {
      const result = await callback(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  // Migration Support
  get migrate(): MigrationManager {
    return this.migrationManager;
  }

  // Real-time Subscriptions
  live<T>(query: string): Observable<T[]> {
    return this.realtimeEngine.subscribe<T>(query);
  }

  // Admin UI Generation
  admin(config: AdminConfig): any {
    // In real implementation, this would generate admin UI components
    return {
      routes: this.generateAdminRoutes(config),
      components: this.generateAdminComponents(config),
      permissions: this.setupAdminPermissions(config)
    };
  }

  // Enterprise Authentication Methods
  async authenticate(username: string, password: string): Promise<AuthenticationContext | null> {
    if (!this.authManager) {
      throw new Error('Authentication is not enabled');
    }

    const startTime = Date.now();
    try {
      const context = await this.authManager.authenticate(username, password);

      if (this.auditLogger && context) {
        await this.auditLogger.logAuthentication('LOGIN', context.userId, {
          sessionId: context.sessionId,
          method: 'password'
        }, 'success');
      }

      if (this.metricsManager) {
        this.metricsManager.recordAPIRequest('authenticate', Date.now() - startTime, 'success');
      }

      return context;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (this.auditLogger) {
        await this.auditLogger.logAuthentication('LOGIN', username, {
          method: 'password',
          error: errorMessage
        }, 'failure');
      }

      if (this.metricsManager) {
        this.metricsManager.recordAPIRequest('authenticate', Date.now() - startTime, 'error');
      }

      throw error;
    }
  }

  async authenticateToken(token: string): Promise<AuthenticationContext | null> {
    if (!this.authManager) {
      throw new Error('Authentication is not enabled');
    }

    const startTime = Date.now();
    try {
      const context = await this.authManager.authenticateToken(token);

      if (this.metricsManager) {
        this.metricsManager.recordAPIRequest('authenticateToken', Date.now() - startTime, 'success');
      }

      return context;
    } catch (error) {
      if (this.metricsManager) {
        this.metricsManager.recordAPIRequest('authenticateToken', Date.now() - startTime, 'error');
      }

      throw error;
    }
  }

  async validateSession(sessionId: string): Promise<AuthenticationContext | null> {
    if (!this.authManager) {
      throw new Error('Authentication is not enabled');
    }

    return await this.authManager.validateSession(sessionId);
  }

  async logout(sessionId: string): Promise<boolean> {
    if (!this.authManager) {
      throw new Error('Authentication is not enabled');
    }

    const result = await this.authManager.logout(sessionId);

    if (this.auditLogger) {
      await this.auditLogger.logAuthentication('LOGOUT', 'unknown', {
        sessionId
      }, result ? 'success' : 'failure');
    }

    return result;
  }

  // Service Discovery Methods
  findServices(name: string) {
    return this.serviceDiscovery?.findServices(name) || [];
  }

  findServicesByTag(tag: string) {
    return this.serviceDiscovery?.findServicesByTag(tag) || [];
  }

  getNextInstance(serviceName: string) {
    return this.serviceDiscovery?.getNextInstance(serviceName) || null;
  }

  // Metrics and Monitoring Methods
  getHealthStatus() {
    return this.metricsManager?.getHealthStatus() || {
      status: 'unknown' as const,
      checks: {}
    };
  }

  getCurrentMetrics() {
    return this.metricsManager?.getCurrentMetrics();
  }

  getMetricsHistory(startDate?: Date, endDate?: Date, limit?: number) {
    return this.metricsManager?.getMetricsHistory(startDate, endDate, limit) || [];
  }

  exportPrometheusMetrics(): string {
    return this.metricsManager?.exportPrometheusMetrics() || '';
  }

  // Audit Methods
  async getUserAuditLogs(userId: string, startDate?: Date, endDate?: Date, limit?: number) {
    return this.auditLogger?.getUserAuditLogs(userId, startDate, endDate, limit) || [];
  }

  async getResourceAuditLogs(resource: string, startDate?: Date, endDate?: Date, limit?: number) {
    return this.auditLogger?.getResourceAuditLogs(resource, startDate, endDate, limit) || [];
  }

  async getAuditStats(startDate?: Date, endDate?: Date) {
    return this.auditLogger?.getAuditStats(startDate, endDate);
  }

  // Enterprise Configuration Methods
  isEnterpriseEnabled(): boolean {
    return !!this.config.enterprise?.enabled;
  }

  getEnabledFeatures(): string[] {
    if (!this.config.enterprise?.enabled) {
      return [];
    }

    return Object.keys(this.config.enterprise.features).filter(
      key => this.config.enterprise!.features[key as keyof typeof this.config.enterprise.features]
    );
  }

  // Health Check Endpoint for Service Discovery
  async getHealthCheck() {
    const health = this.getHealthStatus();
    const metrics = this.getCurrentMetrics();

    return {
      status: health.status,
      timestamp: new Date(),
      version: '1.0.0',
      uptime: process.uptime(),
      checks: health.checks,
      metrics: metrics ? {
        memory: metrics.memory,
        api: metrics.api,
        database: metrics.database,
        cache: metrics.cache
      } : undefined,
      features: this.getEnabledFeatures()
    };
  }

  // Health Check
  async health(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, any>;
    uptime: number;
  }> {
    const startTime = Date.now();

    const cbdHealth = await this.cbdAdapter.healthCheck();
    const realtimeHealth = this.realtimeEngine.healthCheck();

    const services = {
      cbd: cbdHealth,
      realtime: realtimeHealth
    };

    const allHealthy = Object.values(services).every(s => s.status === 'healthy');
    const anyHealthy = Object.values(services).some(s => s.status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : anyHealthy ? 'degraded' : 'unhealthy',
      services,
      uptime: Date.now() - startTime
    };
  }

  // Utility Methods
  private generateAdminRoutes(config: AdminConfig): any[] {
    // Generate admin routes based on schema and permissions
    return [];
  }

  private generateAdminComponents(config: AdminConfig): any[] {
    // Generate admin UI components
    return [];
  }

  private setupAdminPermissions(config: AdminConfig): any {
    // Setup role-based permissions
    return config.tables || {};
  }

  // Static Factory Methods
  static async create(config: CNDConfig): Promise<CND> {
    const cnd = new CND(config);
    await cnd.connect();
    return cnd;
  }

  static async createFromEnv(): Promise<CND> {
    const config: CNDConfig = {
      cbd: {
        host: process.env.CBD_HOST || 'localhost',
        port: parseInt(process.env.CBD_PORT || '8080'),
        database: process.env.CBD_DATABASE || 'default',
        auth: process.env.CBD_TOKEN ? {
          token: process.env.CBD_TOKEN
        } : undefined
      },
      realtime: {
        enabled: process.env.CND_REALTIME === 'true',
        websocketPort: parseInt(process.env.CND_REALTIME_PORT || '8081')
      },
      cache: {
        enabled: process.env.CND_CACHE === 'true',
        ttl: parseInt(process.env.CND_CACHE_TTL || '3600')
      },
      logging: {
        enabled: process.env.CND_LOGGING !== 'false',
        level: (process.env.CND_LOG_LEVEL as any) || 'info'
      }
    };

    return CND.create(config);
  }
}

// Export everything for convenience
export * from './types.js';
export * from './cbd-adapter.js';
export { SchemaManager } from './schema.js';
export { MigrationManager } from './migration.js';
export { CND };
