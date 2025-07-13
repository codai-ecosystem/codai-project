export interface ServiceConfig {
  /** Unique service identifier */
  name: string;
  /** Service version */
  version: string;
  /** Primary endpoint URL */
  endpoint: string;
  /** Health check endpoint path */
  healthPath?: string;
  /** Service capabilities and features */
  capabilities: string[];
  /** Service metadata */
  metadata?: Record<string, any>;
  /** Load balancing weight (1-100) */
  weight?: number;
  /** Service tags for categorization */
  tags?: string[];
  /** Required dependencies */
  dependencies?: string[];
}

export interface ServiceEndpoint {
  /** Service identifier */
  serviceName: string;
  /** Endpoint URL */
  url: string;
  /** Endpoint weight for load balancing */
  weight: number;
  /** Last health check timestamp */
  lastHealthCheck?: Date;
  /** Health status */
  healthy: boolean;
  /** Response time in ms */
  responseTime?: number;
  /** Additional endpoint metadata */
  metadata?: Record<string, any>;
}

export interface HealthStatus {
  /** Service name */
  serviceName: string;
  /** Overall health status */
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  /** Last check timestamp */
  timestamp: Date;
  /** Response time in milliseconds */
  responseTime: number;
  /** Health check details */
  details: {
    /** CPU usage percentage */
    cpu?: number;
    /** Memory usage in MB */
    memory?: number;
    /** Active connections */
    connections?: number;
    /** Custom health metrics */
    custom?: Record<string, any>;
  };
  /** Error message if unhealthy */
  error?: string;
  /** Service version */
  version: string;
  /** Service uptime in seconds */
  uptime?: number;
}

export interface ServiceRegistryConfig {
  /** Redis connection options */
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  /** Health check interval in seconds */
  healthCheckInterval?: number;
  /** Service TTL in seconds */
  serviceTTL?: number;
  /** Enable automatic cleanup of stale services */
  autoCleanup?: boolean;
  /** Load balancing strategy */
  loadBalancingStrategy?: 'round-robin' | 'weighted' | 'least-connections' | 'random';
}

export interface LoadBalancingStrategy {
  /** Select next endpoint for the service */
  select(endpoints: ServiceEndpoint[]): ServiceEndpoint | null;
  /** Update endpoint with new metrics */
  updateMetrics(serviceName: string, endpoint: string, responseTime: number): void;
}

export interface ServiceDiscoveryOptions {
  /** Filter services by tags */
  tags?: string[];
  /** Filter services by capabilities */
  capabilities?: string[];
  /** Only return healthy services */
  healthyOnly?: boolean;
  /** Include service metadata in response */
  includeMetadata?: boolean;
}

export interface ServiceRegistrationEvent {
  /** Event type */
  type: 'registered' | 'unregistered' | 'health-changed' | 'endpoint-updated';
  /** Service name */
  serviceName: string;
  /** Event timestamp */
  timestamp: Date;
  /** Event data */
  data: any;
}

export interface ServiceMetrics {
  /** Total number of registered services */
  totalServices: number;
  /** Number of healthy services */
  healthyServices: number;
  /** Number of unhealthy services */
  unhealthyServices: number;
  /** Average response time across all services */
  averageResponseTime: number;
  /** Service uptime statistics */
  uptimeStats: Record<string, number>;
  /** Most recent health check timestamp */
  lastHealthCheck: Date;
}

export type ServiceEventCallback = (event: ServiceRegistrationEvent) => void;

export interface ServiceRegistryError extends Error {
  code: string;
  serviceName?: string;
  details?: Record<string, any>;
}
