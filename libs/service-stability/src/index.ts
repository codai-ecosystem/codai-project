/**
 * CODAI Service Stability System
 * 
 * Comprehensive service stability and integration framework for CODAI ecosystem
 * Provides health monitoring, load balancing, failover, and inter-service communication
 * 
 * @version 1.0.0
 * @author CODAI Service Team
 */

// Core stability components
export { ServiceHealthManager } from './health';
export { GatewayOptimizer } from './gateway';
export { CommunicationProtocol } from './communication';
export { SystemMonitor } from './monitoring';

// Health monitoring exports
export type {
  HealthCheck,
  HealthStatus,
  ServiceHealth,
  HealthMetrics,
  HealthThreshold,
  AlertRule,
  MonitoringConfig
} from './health';

// Gateway optimization exports
export type {
  GatewayConfig,
  LoadBalancerConfig,
  RouteConfig,
  FailoverConfig,
  ProxyRule,
  CircuitBreakerConfig,
  RateLimitConfig
} from './gateway';

// Communication protocol exports
export type {
  CommunicationConfig,
  MessageProtocol,
  ServiceEndpoint,
  MessageQueue,
  PubSubConfig,
  RPCConfig,
  WebSocketConfig
} from './communication';

// System monitoring exports
export type {
  SystemMetrics,
  PerformanceMetrics,
  ResourceUsage,
  AlertConfig,
  DashboardConfig,
  MonitoringEvent,
  MetricThreshold
} from './monitoring';

// Main stability system class
export class ServiceStabilitySystem {
  private healthManager: ServiceHealthManager;
  private gatewayOptimizer: GatewayOptimizer;
  private communicationProtocol: CommunicationProtocol;
  private systemMonitor: SystemMonitor;
  private initialized: boolean = false;

  constructor(config: ServiceStabilityConfig) {
    this.initializeComponents(config);
  }

  private async initializeComponents(config: ServiceStabilityConfig): Promise<void> {
    try {
      // Initialize health monitoring
      this.healthManager = new ServiceHealthManager({
        checkInterval: config.health?.checkInterval || 30000,
        thresholds: config.health?.thresholds || {
          cpu: 80,
          memory: 85,
          disk: 90,
          responseTime: 5000
        },
        alerting: config.health?.alerting || {
          enabled: true,
          channels: ['console', 'webhook']
        }
      });

      // Initialize gateway optimization
      this.gatewayOptimizer = new GatewayOptimizer({
        port: config.gateway?.port || 8080,
        loadBalancing: config.gateway?.loadBalancing || {
          algorithm: 'round-robin',
          healthCheckEnabled: true,
          retryAttempts: 3
        },
        circuitBreaker: config.gateway?.circuitBreaker || {
          threshold: 50,
          timeout: 60000,
          resetTimeout: 30000
        },
        rateLimit: config.gateway?.rateLimit || {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 1000, // requests per window
          standardHeaders: true,
          legacyHeaders: false
        }
      });

      // Initialize communication protocols
      this.communicationProtocol = new CommunicationProtocol({
        protocols: config.communication?.protocols || ['http', 'websocket', 'grpc'],
        messageQueue: config.communication?.messageQueue || {
          type: 'redis',
          connection: {
            host: 'localhost',
            port: 6379
          }
        },
        serviceDiscovery: config.communication?.serviceDiscovery || {
          type: 'consul',
          connection: {
            host: 'localhost',
            port: 8500
          }
        }
      });

      // Initialize system monitoring
      this.systemMonitor = new SystemMonitor({
        metricsInterval: config.monitoring?.metricsInterval || 10000,
        retention: config.monitoring?.retention || '7d',
        dashboard: config.monitoring?.dashboard || {
          enabled: true,
          port: 9090
        },
        alerts: config.monitoring?.alerts || {
          enabled: true,
          rules: [
            {
              metric: 'cpu_usage',
              threshold: 80,
              severity: 'warning',
              duration: '5m'
            },
            {
              metric: 'memory_usage',
              threshold: 90,
              severity: 'critical',
              duration: '2m'
            }
          ]
        }
      });

      // Start all components
      await this.startComponents();

      this.initialized = true;
      console.log('✅ CODAI Service Stability System initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Service Stability System:', error);
      throw error;
    }
  }

  private async startComponents(): Promise<void> {
    // Start health monitoring
    await this.healthManager.start();

    // Start gateway optimizer
    await this.gatewayOptimizer.start();

    // Start communication protocols
    await this.communicationProtocol.start();

    // Start system monitoring
    await this.systemMonitor.start();

    console.log('🚀 All service stability components started successfully');
  }

  /**
   * Get comprehensive system health status
   */
  async getSystemHealth(): Promise<SystemHealthReport> {
    const healthStatus = await this.healthManager.getOverallHealth();
    const gatewayStatus = await this.gatewayOptimizer.getStatus();
    const communicationStatus = await this.communicationProtocol.getStatus();
    const monitoringStatus = await this.systemMonitor.getStatus();

    return {
      overall: {
        status: this.calculateOverallStatus([
          healthStatus.status,
          gatewayStatus.status,
          communicationStatus.status,
          monitoringStatus.status
        ]),
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      },
      components: {
        health: healthStatus,
        gateway: gatewayStatus,
        communication: communicationStatus,
        monitoring: monitoringStatus
      },
      metrics: await this.systemMonitor.getCurrentMetrics(),
      alerts: await this.healthManager.getActiveAlerts()
    };
  }

  /**
   * Register a new service for monitoring
   */
  async registerService(service: ServiceRegistration): Promise<void> {
    await this.healthManager.registerService(service);
    await this.gatewayOptimizer.addRoute(service);
    await this.communicationProtocol.registerEndpoint(service);

    console.log(`✅ Service ${service.name} registered successfully`);
  }

  /**
   * Unregister a service
   */
  async unregisterService(serviceName: string): Promise<void> {
    await this.healthManager.unregisterService(serviceName);
    await this.gatewayOptimizer.removeRoute(serviceName);
    await this.communicationProtocol.unregisterEndpoint(serviceName);

    console.log(`✅ Service ${serviceName} unregistered successfully`);
  }

  /**
   * Perform emergency failover for a service
   */
  async performFailover(serviceName: string, reason: string): Promise<void> {
    console.log(`🚨 Performing emergency failover for ${serviceName}: ${reason}`);

    // Mark service as unhealthy
    await this.healthManager.markServiceUnhealthy(serviceName, reason);

    // Redirect traffic to backup instances
    await this.gatewayOptimizer.activateFailover(serviceName);

    // Notify monitoring system
    await this.systemMonitor.recordFailoverEvent(serviceName, reason);

    console.log(`✅ Failover completed for ${serviceName}`);
  }

  /**
   * Get real-time system metrics
   */
  async getMetrics(): Promise<ServiceStabilityMetrics> {
    return {
      health: await this.healthManager.getMetrics(),
      gateway: await this.gatewayOptimizer.getMetrics(),
      communication: await this.communicationProtocol.getMetrics(),
      system: await this.systemMonitor.getMetrics(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Shutdown the stability system gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down Service Stability System...');

    await this.systemMonitor.stop();
    await this.communicationProtocol.stop();
    await this.gatewayOptimizer.stop();
    await this.healthManager.stop();

    this.initialized = false;
    console.log('✅ Service Stability System shut down successfully');
  }

  private calculateOverallStatus(statuses: string[]): 'healthy' | 'degraded' | 'unhealthy' {
    if (statuses.every(status => status === 'healthy')) return 'healthy';
    if (statuses.some(status => status === 'unhealthy')) return 'unhealthy';
    return 'degraded';
  }
}

// Configuration interfaces
export interface ServiceStabilityConfig {
  health?: {
    checkInterval?: number;
    thresholds?: {
      cpu: number;
      memory: number;
      disk: number;
      responseTime: number;
    };
    alerting?: {
      enabled: boolean;
      channels: string[];
    };
  };
  gateway?: {
    port?: number;
    loadBalancing?: {
      algorithm: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
      healthCheckEnabled: boolean;
      retryAttempts: number;
    };
    circuitBreaker?: {
      threshold: number;
      timeout: number;
      resetTimeout: number;
    };
    rateLimit?: {
      windowMs: number;
      max: number;
      standardHeaders: boolean;
      legacyHeaders: boolean;
    };
  };
  communication?: {
    protocols?: string[];
    messageQueue?: {
      type: 'redis' | 'rabbitmq' | 'kafka' | 'nats';
      connection: any;
    };
    serviceDiscovery?: {
      type: 'consul' | 'etcd' | 'zookeeper';
      connection: any;
    };
  };
  monitoring?: {
    metricsInterval?: number;
    retention?: string;
    dashboard?: {
      enabled: boolean;
      port: number;
    };
    alerts?: {
      enabled: boolean;
      rules: any[];
    };
  };
}

export interface ServiceRegistration {
  name: string;
  url: string;
  healthCheckPath: string;
  port: number;
  version: string;
  metadata?: Record<string, any>;
}

export interface SystemHealthReport {
  overall: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
  };
  components: Record<string, any>;
  metrics: any;
  alerts: any[];
}

export interface ServiceStabilityMetrics {
  health: any;
  gateway: any;
  communication: any;
  system: any;
  timestamp: string;
}

// Export default for convenience
export default ServiceStabilitySystem;
