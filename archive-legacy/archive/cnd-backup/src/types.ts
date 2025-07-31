// Core CND Types and Interfaces
import { Observable } from 'rxjs';

// Main CND Configuration with Enterprise Features
export interface CNDConfig {
  cbd: {
    host: string;
    port: number;
    database: string;
    auth?: {
      username?: string;
      password?: string;
      token?: string;
    };
  };
  // Enterprise Features
  enterprise?: {
    enabled: boolean;
    features: {
      serviceDiscovery?: boolean;
      authentication?: boolean;
      authorization?: boolean;
      encryption?: boolean;
      audit?: boolean;
      monitoring?: boolean;
      backup?: boolean;
      clustering?: boolean;
    };
  };
  // Service Discovery Integration
  serviceDiscovery?: {
    enabled: boolean;
    registryUrl?: string;
    serviceName?: string;
    healthCheckInterval?: number;
    tags?: string[];
  };
  // Authentication & Authorization
  auth?: {
    enabled: boolean;
    provider: 'internal' | 'oauth2' | 'jwt' | 'saml' | 'ldap';
    config: {
      secret?: string;
      issuer?: string;
      audience?: string;
      algorithms?: string[];
      publicKey?: string;
      privateKey?: string;
    };
    rbac?: {
      enabled: boolean;
      roles: Record<string, string[]>;
      permissions: Record<string, string[]>;
    };
  };
  // Security & Encryption
  security?: {
    encryption?: {
      enabled: boolean;
      algorithm: 'aes-256-gcm' | 'aes-192-gcm' | 'aes-128-gcm';
      keyRotation?: {
        enabled: boolean;
        interval: number; // days
      };
    };
    audit?: {
      enabled: boolean;
      storage: 'database' | 'file' | 'external';
      retention: number; // days
    };
    rateLimit?: {
      enabled: boolean;
      windowMs: number;
      maxRequests: number;
    };
  };
  realtime?: {
    enabled: boolean;
    websocketPort?: number;
  };
  cache?: {
    enabled: boolean;
    ttl?: number;
    distributed?: boolean;
    redis?: {
      host: string;
      port: number;
      password?: string;
    };
  };
  // Performance & Monitoring
  performance?: {
    monitoring?: {
      enabled: boolean;
      metricsPort?: number;
      healthCheckPath?: string;
    };
    clustering?: {
      enabled: boolean;
      nodes: string[];
      replicationFactor: number;
    };
    backup?: {
      enabled: boolean;
      schedule: string; // cron expression
      storage: 's3' | 'gcs' | 'azure' | 'local';
      retention: number; // days
    };
  };
  logging?: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    structured?: boolean;
    destination?: 'console' | 'file' | 'elasticsearch' | 'splunk';
  };
}

// Enterprise Service Types
export interface ServiceDiscoveryConfig {
  enabled: boolean;
  registryUrl: string;
  serviceName: string;
  serviceId: string;
  version: string;
  tags: string[];
  healthCheck: {
    path: string;
    interval: number;
    timeout: number;
  };
  metadata: Record<string, any>;
}

export interface AuthenticationContext {
  userId: string;
  sessionId: string;
  permissions: string[];
  roles: string[];
  tenant?: string;
  expiresAt: Date;
  metadata: Record<string, any>;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  operation: string;
  resource: string;
  details: Record<string, any>;
  result: 'success' | 'failure' | 'partial';
  duration: number;
  metadata: Record<string, any>;
}

export interface MetricsData {
  timestamp: Date;
  service: string;
  operation: string;
  duration: number;
  status: 'success' | 'error';
  metadata: Record<string, any>;
}

// Schema Definition Types
export interface SchemaDefinition {
  [tableName: string]: TableSchema;
}

export interface TableSchema {
  [fieldName: string]: FieldDefinition | RelationDefinition;
}

export interface FieldDefinition {
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'text' | 'uuid';
  primary?: boolean;
  unique?: boolean;
  required?: boolean;
  default?: any;
  references?: string; // "table.field"
}

export interface RelationDefinition {
  name: string;
  type: 'hasOne' | 'hasMany' | 'belongsTo' | 'manyToMany';
  table: string;
  foreignKey?: string;
  pivotTable?: string;
  fieldName?: string;
}

// Query Types
export interface QueryResult<T = any> {
  data: T[];
  count: number;
  executionTime: number;
  query: string;
}

export interface QueryBuilder<T = any> {
  select(fields?: string[]): QueryBuilder<T>;
  where(conditions: Record<string, any>): QueryBuilder<T>;
  orderBy(field: string, direction?: 'asc' | 'desc'): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  include(relations: string[]): QueryBuilder<T>;
  execute(): Promise<QueryResult<T>>;
  first(): Promise<T | null>;
  live(): Observable<T[]>;
}

// Document API Types
export interface DocumentQuery<T = any> {
  find(query?: Record<string, any>): Promise<T[]>;
  findOne(query?: Record<string, any>): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  create(document: Partial<T>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(query?: Record<string, any>): Promise<number>;
  search(text: string, fields?: string[]): Promise<T[]>;
}

// Graph API Types
export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  type: string;
  startNode: string;
  endNode: string;
  properties: Record<string, any>;
}

export interface GraphQuery {
  match(pattern: string): GraphQuery;
  where(conditions: Record<string, any>): GraphQuery;
  return(fields: string[]): Promise<any[]>;
  create(node: Partial<GraphNode>): Promise<GraphNode>;
  relate(from: string, to: string, type: string, properties?: Record<string, any>): Promise<GraphRelationship>;
}

// Vector API Types
export interface VectorQuery {
  insert(id: string, vector: number[], metadata?: Record<string, any>): Promise<void>;
  similarity(vector: number[], options?: { threshold?: number; limit?: number }): Promise<VectorResult[]>;
  delete(id: string): Promise<boolean>;
  update(id: string, vector: number[], metadata?: Record<string, any>): Promise<void>;
}

export interface VectorResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

// Time Series API Types
export interface TimeSeriesQuery {
  insert(timestamp: Date, value: number, tags?: Record<string, string>): Promise<void>;
  range(start: Date, end: Date): TimeSeriesQuery;
  where(tags: Record<string, string>): TimeSeriesQuery;
  aggregate(func: 'avg' | 'sum' | 'min' | 'max' | 'count', interval?: string): Promise<TimeSeriesPoint[]>;
  latest(): Promise<TimeSeriesPoint | null>;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  tags: Record<string, string>;
}

// Cache API Types
export interface CacheAPI {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, options?: { ttl?: number }): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<boolean>;
  keys(pattern?: string): Promise<string[]>;
  flush(): Promise<void>;
}

// Migration Types
export interface MigrationOptions {
  tables?: string[];
  collections?: string[];
  transform?: Record<string, (data: any) => any>;
  batchSize?: number;
  dryRun?: boolean;
}

export interface MigrationResult {
  source: string;
  tablesProcessed: string[];
  recordsProcessed: number;
  errors: string[];
  duration: number;
}

// Real-time Types
export interface RealtimeSubscription {
  id: string;
  query: string;
  callback: (data: any) => void;
  unsubscribe: () => void;
}

// Transaction Types
export interface Transaction {
  sql<T>(query: TemplateStringsArray, ...values: any[]): Promise<T[]>;
  collection(name: string): DocumentQuery;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

// Admin Types
export interface AdminConfig {
  auth?: {
    provider: 'keycloak' | 'auth0' | 'custom';
    config: Record<string, any>;
  };
  tables?: Record<string, {
    permissions: ('read' | 'create' | 'update' | 'delete')[];
    fields?: Record<string, {
      editable?: boolean;
      filterable?: boolean;
      sortable?: boolean;
    }>;
  }>;
  customPages?: Record<string, {
    component: string;
    route: string;
  }>;
}

// Error Types
export class CNDError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'CNDError';
  }
}

export class CNDValidationError extends CNDError {
  constructor(message: string, public field: string, public value: any) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'CNDValidationError';
  }
}

export class CNDConnectionError extends CNDError {
  constructor(message: string, public host: string, public port: number) {
    super(message, 'CONNECTION_ERROR', { host, port });
    this.name = 'CNDConnectionError';
  }
}
