/**
 * CODAI Advanced Service Integrations - Type Definitions
 * Comprehensive type system for enterprise service integration and orchestration
 */

// ==================== CORE INTEGRATION TYPES ====================

export interface ServiceIntegrationConfig {
    serviceId: string;
    name: string;
    description?: string;
    version: string;
    baseUrl: string;
    protocol: 'http' | 'https' | 'grpc' | 'websocket' | 'mqtt' | 'kafka';
    authentication: AuthenticationConfig;
    healthCheck: HealthCheckConfig;
    retry: RetryConfig;
    timeout: TimeoutConfig;
    rateLimiting?: RateLimitingConfig;
    caching?: CachingConfig;
    monitoring: MonitoringConfig;
    metadata?: Record<string, any>;
}

export interface AuthenticationConfig {
    type: 'none' | 'basic' | 'bearer' | 'jwt' | 'oauth2' | 'api-key' | 'mutual-tls';
    credentials?: {
        username?: string;
        password?: string;
        token?: string;
        apiKey?: string;
        clientId?: string;
        clientSecret?: string;
        keyPath?: string;
        certPath?: string;
    };
    refreshToken?: {
        enabled: boolean;
        endpoint?: string;
        interval?: number;
    };
}

export interface HealthCheckConfig {
    enabled: boolean;
    endpoint: string;
    method: 'GET' | 'POST' | 'HEAD';
    interval: number;
    timeout: number;
    retryAttempts: number;
    expectedStatus: number[];
    expectedResponse?: {
        type: 'json' | 'text' | 'regex';
        pattern: string;
    };
    failureThreshold: number;
    recoveryThreshold: number;
}

export interface RetryConfig {
    enabled: boolean;
    maxAttempts: number;
    backoffStrategy: 'linear' | 'exponential' | 'fixed';
    initialDelay: number;
    maxDelay: number;
    multiplier?: number;
    jitter?: boolean;
    retryableErrors: string[];
}

export interface TimeoutConfig {
    connection: number;
    request: number;
    response: number;
    idle?: number;
}

export interface RateLimitingConfig {
    enabled: boolean;
    requestsPerSecond: number;
    burstSize: number;
    strategy: 'token-bucket' | 'sliding-window' | 'fixed-window';
    queueSize?: number;
    priority?: 'fifo' | 'lifo' | 'priority';
}

export interface CachingConfig {
    enabled: boolean;
    type: 'memory' | 'redis' | 'distributed';
    ttl: number;
    maxSize: number;
    keyGenerator?: (request: any) => string;
    invalidationStrategy: 'ttl' | 'lru' | 'manual';
    compression?: boolean;
}

export interface MonitoringConfig {
    enabled: boolean;
    metrics: MetricsConfig;
    tracing: TracingConfig;
    logging: LoggingConfig;
    alerting?: AlertingConfig;
}

export interface MetricsConfig {
    enabled: boolean;
    provider: 'prometheus' | 'statsd' | 'cloudwatch' | 'datadog';
    prefix: string;
    labels?: Record<string, string>;
    customMetrics?: CustomMetric[];
}

export interface CustomMetric {
    name: string;
    type: 'counter' | 'gauge' | 'histogram' | 'summary';
    description: string;
    labels?: string[];
}

export interface TracingConfig {
    enabled: boolean;
    provider: 'jaeger' | 'zipkin' | 'opentelemetry' | 'x-ray';
    samplingRate: number;
    serviceName: string;
    tags?: Record<string, string>;
}

export interface LoggingConfig {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text' | 'structured';
    destination: 'console' | 'file' | 'elastic' | 'cloudwatch';
    includeRequestBody?: boolean;
    includeResponseBody?: boolean;
    sanitizeFields?: string[];
}

export interface AlertingConfig {
    enabled: boolean;
    channels: AlertChannel[];
    rules: AlertRule[];
}

export interface AlertChannel {
    id: string;
    type: 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
    configuration: Record<string, any>;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertRule {
    id: string;
    name: string;
    condition: string;
    threshold: number;
    duration: number;
    severity: 'warning' | 'error' | 'critical';
    channels: string[];
    message: string;
}

// ==================== API GATEWAY TYPES ====================

export interface APIGatewayConfig {
    gatewayId: string;
    name: string;
    port: number;
    host: string;
    protocol: 'http' | 'https';
    middleware: MiddlewareConfig[];
    routing: RoutingConfig;
    security: SecurityConfig;
    cors: CORSConfig;
    compression: CompressionConfig;
    rateLimit: GlobalRateLimitConfig;
    loadBalancing: LoadBalancingConfig;
    circuitBreaker: CircuitBreakerConfig;
    ssl?: SSLConfig;
}

export interface MiddlewareConfig {
    name: string;
    order: number;
    enabled: boolean;
    configuration: Record<string, any>;
}

export interface RoutingConfig {
    strategy: 'path-based' | 'header-based' | 'weighted' | 'canary';
    routes: RouteDefinition[];
    defaultTarget?: string;
    fallbackBehavior: 'error' | 'redirect' | 'static';
}

export interface RouteDefinition {
    id: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | '*';
    targetService: string;
    targetPath?: string;
    weight?: number;
    enabled: boolean;
    middleware?: string[];
    transformation?: RequestTransformation;
    validation?: RequestValidation;
    metadata?: Record<string, any>;
}

export interface RequestTransformation {
    request?: {
        headers?: HeaderTransformation[];
        body?: BodyTransformation;
        queryParams?: QueryParamTransformation[];
    };
    response?: {
        headers?: HeaderTransformation[];
        body?: BodyTransformation;
        statusCode?: number;
    };
}

export interface HeaderTransformation {
    action: 'add' | 'remove' | 'replace' | 'rename';
    name: string;
    value?: string;
    newName?: string;
}

export interface BodyTransformation {
    type: 'json' | 'xml' | 'text' | 'binary';
    transformation: string; // JSONPath, XPath, or regex
    template?: string;
}

export interface QueryParamTransformation {
    action: 'add' | 'remove' | 'replace' | 'rename';
    name: string;
    value?: string;
    newName?: string;
}

export interface RequestValidation {
    enabled: boolean;
    schema?: ValidationSchema;
    headers?: HeaderValidation[];
    queryParams?: QueryParamValidation[];
    body?: BodyValidation;
}

export interface ValidationSchema {
    type: 'json-schema' | 'openapi' | 'custom';
    schema: any;
}

export interface HeaderValidation {
    name: string;
    required: boolean;
    type: 'string' | 'number' | 'boolean' | 'array';
    pattern?: string;
    values?: string[];
}

export interface QueryParamValidation {
    name: string;
    required: boolean;
    type: 'string' | 'number' | 'boolean' | 'array';
    pattern?: string;
    values?: string[];
}

export interface BodyValidation {
    required: boolean;
    maxSize: number;
    contentType: string[];
    schema?: any;
}

export interface SecurityConfig {
    authentication: AuthenticationStrategy[];
    authorization: AuthorizationConfig;
    encryption: EncryptionConfig;
    inputSanitization: InputSanitizationConfig;
}

export interface AuthenticationStrategy {
    name: string;
    type: 'jwt' | 'oauth2' | 'api-key' | 'basic' | 'custom';
    enabled: boolean;
    configuration: Record<string, any>;
    order: number;
}

export interface AuthorizationConfig {
    enabled: boolean;
    type: 'rbac' | 'abac' | 'acl' | 'custom';
    rules: AuthorizationRule[];
    defaultAction: 'allow' | 'deny';
}

export interface AuthorizationRule {
    id: string;
    name: string;
    condition: string;
    action: 'allow' | 'deny';
    resources: string[];
    roles?: string[];
    permissions?: string[];
}

export interface EncryptionConfig {
    enabled: boolean;
    algorithm: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
    keyRotation: KeyRotationConfig;
    fieldLevelEncryption?: FieldEncryptionConfig[];
}

export interface KeyRotationConfig {
    enabled: boolean;
    interval: number;
    algorithm: 'automatic' | 'manual';
    keyVersions: number;
}

export interface FieldEncryptionConfig {
    field: string;
    algorithm: string;
    keyId: string;
}

export interface InputSanitizationConfig {
    enabled: boolean;
    rules: SanitizationRule[];
    defaultAction: 'sanitize' | 'reject' | 'log';
}

export interface SanitizationRule {
    field: string;
    type: 'xss' | 'sql-injection' | 'script-injection' | 'path-traversal' | 'custom';
    action: 'sanitize' | 'reject' | 'log';
    pattern?: string;
}

export interface CORSConfig {
    enabled: boolean;
    origins: string[];
    methods: string[];
    headers: string[];
    credentials: boolean;
    maxAge: number;
    preflightContinue: boolean;
}

export interface CompressionConfig {
    enabled: boolean;
    algorithm: 'gzip' | 'deflate' | 'br';
    threshold: number;
    level: number;
    chunkSize: number;
}

export interface GlobalRateLimitConfig {
    enabled: boolean;
    global: RateLimitRule;
    perService: Record<string, RateLimitRule>;
    perRoute: Record<string, RateLimitRule>;
    perUser: RateLimitRule;
}

export interface RateLimitRule {
    requestsPerSecond: number;
    burstSize: number;
    windowSize: number;
    keyGenerator?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}

export interface LoadBalancingConfig {
    algorithm: 'round-robin' | 'weighted-round-robin' | 'least-connections' | 'ip-hash' | 'random';
    healthCheck: boolean;
    stickySession?: StickySessionConfig;
    failover: FailoverConfig;
}

export interface StickySessionConfig {
    enabled: boolean;
    cookieName: string;
    httpOnly: boolean;
    secure: boolean;
    maxAge: number;
}

export interface FailoverConfig {
    enabled: boolean;
    maxFailures: number;
    recoveryTime: number;
    fallbackService?: string;
}

export interface CircuitBreakerConfig {
    enabled: boolean;
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringPeriod: number;
    expectedExceptionTypes?: string[];
    fallbackResponse?: FallbackResponse;
}

export interface FallbackResponse {
    statusCode: number;
    headers?: Record<string, string>;
    body?: any;
}

export interface SSLConfig {
    enabled: boolean;
    keyPath: string;
    certPath: string;
    caPath?: string;
    protocols: string[];
    ciphers: string[];
    honorCipherOrder: boolean;
    requestCert: boolean;
    rejectUnauthorized: boolean;
}

// ==================== REAL-TIME COMMUNICATION TYPES ====================

export interface WebSocketConfig {
    serverId: string;
    port: number;
    path: string;
    authentication: WSAuthenticationConfig;
    rooms: RoomConfig[];
    middleware: WSMiddleware[];
    rateLimit: WSRateLimitConfig;
    heartbeat: HeartbeatConfig;
    compression: WSCompressionConfig;
    cors: WSCORSConfig;
}

export interface WSAuthenticationConfig {
    enabled: boolean;
    type: 'jwt' | 'token' | 'session' | 'custom';
    verifyConnection?: (info: any) => Promise<boolean>;
    extractUser?: (token: string) => Promise<any>;
}

export interface RoomConfig {
    name: string;
    maxUsers: number;
    persistence: boolean;
    messageHistory: number;
    adminOnly: boolean;
    permissions: RoomPermission[];
}

export interface RoomPermission {
    role: string;
    actions: ('join' | 'leave' | 'send' | 'broadcast' | 'moderate')[];
}

export interface WSMiddleware {
    name: string;
    type: 'connection' | 'message' | 'disconnection';
    handler: string;
    order: number;
}

export interface WSRateLimitConfig {
    enabled: boolean;
    messagesPerSecond: number;
    burstSize: number;
    windowSize: number;
}

export interface HeartbeatConfig {
    enabled: boolean;
    interval: number;
    timeout: number;
    maxFailures: number;
}

export interface WSCompressionConfig {
    enabled: boolean;
    threshold: number;
    algorithm: 'deflate' | 'permessage-deflate';
}

export interface WSCORSConfig {
    enabled: boolean;
    origins: string[];
    credentials: boolean;
}

// ==================== MESSAGE QUEUE TYPES ====================

export interface MessageQueueConfig {
    queueId: string;
    name: string;
    type: 'rabbitmq' | 'kafka' | 'redis' | 'sqs' | 'servicebus' | 'nats';
    connection: QueueConnectionConfig;
    exchanges?: ExchangeConfig[];
    queues: QueueDefinition[];
    topics?: TopicConfig[];
    deadLetterQueue?: DeadLetterQueueConfig;
    monitoring: QueueMonitoringConfig;
}

export interface QueueConnectionConfig {
    host: string;
    port: number;
    protocol: string;
    credentials: {
        username?: string;
        password?: string;
        accessKey?: string;
        secretKey?: string;
        token?: string;
    };
    ssl?: {
        enabled: boolean;
        keyPath?: string;
        certPath?: string;
        caPath?: string;
    };
    pooling?: {
        min: number;
        max: number;
        idle: number;
    };
}

export interface ExchangeConfig {
    name: string;
    type: 'direct' | 'topic' | 'fanout' | 'headers';
    durable: boolean;
    autoDelete: boolean;
    arguments?: Record<string, any>;
}

export interface QueueDefinition {
    name: string;
    durable: boolean;
    exclusive: boolean;
    autoDelete: boolean;
    maxLength?: number;
    messageTtl?: number;
    arguments?: Record<string, any>;
    bindings?: QueueBinding[];
}

export interface QueueBinding {
    exchange: string;
    routingKey: string;
    arguments?: Record<string, any>;
}

export interface TopicConfig {
    name: string;
    partitions: number;
    replicationFactor: number;
    retention: number;
    compaction: boolean;
    compression: 'none' | 'gzip' | 'snappy' | 'lz4' | 'zstd';
}

export interface DeadLetterQueueConfig {
    enabled: boolean;
    queueName: string;
    maxRetries: number;
    retryDelay: number;
    ttl?: number;
}

export interface QueueMonitoringConfig {
    enabled: boolean;
    metrics: QueueMetricsConfig;
    alerting: QueueAlertingConfig;
}

export interface QueueMetricsConfig {
    enabled: boolean;
    interval: number;
    metrics: ('queue-length' | 'message-rate' | 'consumer-count' | 'error-rate')[];
}

export interface QueueAlertingConfig {
    enabled: boolean;
    rules: QueueAlertRule[];
}

export interface QueueAlertRule {
    metric: string;
    threshold: number;
    comparison: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    duration: number;
    severity: 'info' | 'warning' | 'error' | 'critical';
}

// ==================== SERVICE MESH TYPES ====================

export interface ServiceMeshConfig {
    meshId: string;
    name: string;
    type: 'istio' | 'linkerd' | 'consul-connect' | 'custom';
    services: ServiceMeshService[];
    policies: ServiceMeshPolicy[];
    security: ServiceMeshSecurity;
    observability: ServiceMeshObservability;
    traffic: TrafficManagement;
}

export interface ServiceMeshService {
    serviceId: string;
    name: string;
    namespace: string;
    version: string;
    endpoints: ServiceEndpoint[];
    sidecar: SidecarConfig;
    virtualService?: VirtualServiceConfig;
    destinationRule?: DestinationRuleConfig;
}

export interface ServiceEndpoint {
    name: string;
    port: number;
    protocol: 'http' | 'https' | 'grpc' | 'tcp' | 'udp';
    path?: string;
    healthCheck?: EndpointHealthCheck;
}

export interface EndpointHealthCheck {
    enabled: boolean;
    path?: string;
    interval: number;
    timeout: number;
    healthyThreshold: number;
    unhealthyThreshold: number;
}

export interface SidecarConfig {
    enabled: boolean;
    image: string;
    resources: {
        cpu: string;
        memory: string;
    };
    env?: Record<string, string>;
    logging: {
        level: string;
        format: string;
    };
}

export interface VirtualServiceConfig {
    hosts: string[];
    gateways?: string[];
    routes: RouteRule[];
}

export interface RouteRule {
    match: RouteMatch[];
    route: RouteDestination[];
    redirect?: RouteRedirect;
    rewrite?: RouteRewrite;
    timeout?: string;
    retries?: RouteRetries;
    fault?: RouteFault;
}

export interface RouteMatch {
    uri?: StringMatch;
    headers?: Record<string, StringMatch>;
    queryParams?: Record<string, StringMatch>;
    method?: StringMatch;
}

export interface StringMatch {
    exact?: string;
    prefix?: string;
    regex?: string;
}

export interface RouteDestination {
    destination: Destination;
    weight?: number;
    headers?: HeaderOperations;
}

export interface Destination {
    host: string;
    subset?: string;
    port?: PortSelector;
}

export interface PortSelector {
    number?: number;
    name?: string;
}

export interface HeaderOperations {
    set?: Record<string, string>;
    add?: Record<string, string>;
    remove?: string[];
}

export interface RouteRedirect {
    uri?: string;
    authority?: string;
    redirectCode?: number;
}

export interface RouteRewrite {
    uri?: string;
    authority?: string;
}

export interface RouteRetries {
    attempts: number;
    perTryTimeout?: string;
    retryOn?: string;
    retryRemoteLocalities?: boolean;
}

export interface RouteFault {
    delay?: FaultDelay;
    abort?: FaultAbort;
}

export interface FaultDelay {
    percentage?: {
        value: number;
    };
    fixedDelay?: string;
    exponentialDelay?: string;
}

export interface FaultAbort {
    percentage?: {
        value: number;
    };
    httpStatus?: number;
    grpcStatus?: string;
}

export interface DestinationRuleConfig {
    host: string;
    trafficPolicy?: TrafficPolicy;
    subsets?: Subset[];
    exportTo?: string[];
}

export interface TrafficPolicy {
    loadBalancer?: LoadBalancerSettings;
    connectionPool?: ConnectionPoolSettings;
    outlierDetection?: OutlierDetection;
    tls?: ClientTLSSettings;
}

export interface LoadBalancerSettings {
    simple?: 'ROUND_ROBIN' | 'LEAST_CONN' | 'RANDOM' | 'PASSTHROUGH';
    consistentHash?: ConsistentHashLB;
}

export interface ConsistentHashLB {
    httpHeaderName?: string;
    httpCookie?: HTTPCookie;
    useSourceIp?: boolean;
    ringHash?: {
        minimumRingSize?: number;
        maximumRingSize?: number;
    };
}

export interface HTTPCookie {
    name: string;
    path?: string;
    ttl?: string;
}

export interface ConnectionPoolSettings {
    tcp?: TCPSettings;
    http?: HTTPSettings;
}

export interface TCPSettings {
    maxConnections?: number;
    connectTimeout?: string;
    tcpNoDelay?: boolean;
    keepAlive?: TCPKeepalive;
}

export interface TCPKeepalive {
    time?: string;
    interval?: string;
    probes?: number;
}

export interface HTTPSettings {
    http1MaxPendingRequests?: number;
    http2MaxRequests?: number;
    maxRequestsPerConnection?: number;
    maxRetries?: number;
    idleTimeout?: string;
    h2UpgradePolicy?: 'UPGRADE' | 'DO_NOT_UPGRADE';
}

export interface OutlierDetection {
    consecutiveGatewayErrors?: number;
    consecutive5xxErrors?: number;
    interval?: string;
    baseEjectionTime?: string;
    maxEjectionPercent?: number;
    minHealthPercent?: number;
    splitExternalLocalOriginErrors?: boolean;
}

export interface ClientTLSSettings {
    mode: 'DISABLE' | 'SIMPLE' | 'MUTUAL' | 'ISTIO_MUTUAL';
    clientCertificate?: string;
    privateKey?: string;
    caCertificates?: string;
    credentialName?: string;
    subjectAltNames?: string[];
    sni?: string;
}

export interface Subset {
    name: string;
    labels: Record<string, string>;
    trafficPolicy?: TrafficPolicy;
}

export interface ServiceMeshPolicy {
    policyId: string;
    name: string;
    type: 'authentication' | 'authorization' | 'security' | 'traffic';
    target: PolicyTarget;
    rules: PolicyRule[];
}

export interface PolicyTarget {
    services?: string[];
    namespaces?: string[];
    labels?: Record<string, string>;
}

export interface PolicyRule {
    action: 'ALLOW' | 'DENY' | 'REQUIRE';
    conditions?: PolicyCondition[];
}

export interface PolicyCondition {
    key: string;
    operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'EXISTS' | 'NOT_EXISTS';
    values?: string[];
}

export interface ServiceMeshSecurity {
    mtls: MTLSConfig;
    certificates: CertificateConfig;
    rbac: RBACConfig;
}

export interface MTLSConfig {
    enabled: boolean;
    mode: 'STRICT' | 'PERMISSIVE' | 'DISABLE';
    certificateAuthority: string;
    certificateRotation: {
        enabled: boolean;
        frequency: string;
    };
}

export interface CertificateConfig {
    provider: 'istiod' | 'external' | 'vault';
    rootCA: string;
    intermediateCA?: string;
    workloadCertTTL: string;
}

export interface RBACConfig {
    enabled: boolean;
    defaultAction: 'ALLOW' | 'DENY';
    policies: RBACPolicy[];
}

export interface RBACPolicy {
    name: string;
    namespace?: string;
    rules: RBACRule[];
}

export interface RBACRule {
    from?: RBACFrom[];
    to?: RBACTo[];
    when?: RBACCondition[];
}

export interface RBACFrom {
    principals?: string[];
    requestPrincipals?: string[];
    namespaces?: string[];
    ipBlocks?: string[];
}

export interface RBACTo {
    operations?: RBACOperation[];
}

export interface RBACOperation {
    methods?: string[];
    hosts?: string[];
    ports?: string[];
    paths?: string[];
}

export interface RBACCondition {
    key: string;
    values: string[];
    notValues?: string[];
}

export interface ServiceMeshObservability {
    metrics: MeshMetricsConfig;
    tracing: MeshTracingConfig;
    logging: MeshLoggingConfig;
    topology: MeshTopologyConfig;
}

export interface MeshMetricsConfig {
    enabled: boolean;
    providers: string[];
    defaultMetrics: boolean;
    customMetrics?: CustomMeshMetric[];
}

export interface CustomMeshMetric {
    name: string;
    dimensions: Record<string, string>;
    value: string;
    unit?: string;
}

export interface MeshTracingConfig {
    enabled: boolean;
    provider: string;
    sampling: number;
    zipkinAddress?: string;
    jaegerAddress?: string;
}

export interface MeshLoggingConfig {
    enabled: boolean;
    level: string;
    format: string;
    accessLogs: boolean;
}

export interface MeshTopologyConfig {
    enabled: boolean;
    updateInterval: number;
    visualization: {
        enabled: boolean;
        ui: string;
    };
}

export interface TrafficManagement {
    canary: CanaryDeployment;
    circuitBreaker: MeshCircuitBreaker;
    timeout: TimeoutPolicy;
    retry: RetryPolicy;
    rateLimit: RateLimitPolicy;
}

export interface CanaryDeployment {
    enabled: boolean;
    strategy: 'percentage' | 'header' | 'cookie';
    percentage?: number;
    headerMatch?: HeaderMatch;
    cookieMatch?: CookieMatch;
    duration: string;
    metrics: CanaryMetrics;
}

export interface HeaderMatch {
    name: string;
    value: string;
}

export interface CookieMatch {
    name: string;
    value: string;
}

export interface CanaryMetrics {
    successRate: number;
    latency: string;
    errorRate: number;
}

export interface MeshCircuitBreaker {
    enabled: boolean;
    thresholds: {
        maxConnections: number;
        maxPendingRequests: number;
        maxRequests: number;
        maxRetries: number;
    };
    interval: string;
    baseEjectionTime: string;
    maxEjectionPercent: number;
}

export interface TimeoutPolicy {
    enabled: boolean;
    global: string;
    perService: Record<string, string>;
    perRoute: Record<string, string>;
}

export interface RetryPolicy {
    enabled: boolean;
    attempts: number;
    perTryTimeout: string;
    retryOn: string[];
    backoff: {
        baseInterval: string;
        maxInterval: string;
    };
}

export interface RateLimitPolicy {
    enabled: boolean;
    global: RateLimitRule;
    perService: Record<string, RateLimitRule>;
    perUser: RateLimitRule;
}

// ==================== EVENT SYSTEM TYPES ====================

export interface EventSystemConfig {
    systemId: string;
    name: string;
    type: 'event-bus' | 'event-sourcing' | 'cqrs' | 'saga';
    eventStore: EventStoreConfig;
    eventBus: EventBusConfig;
    projections?: ProjectionConfig[];
    sagas?: SagaConfig[];
    snapshots?: SnapshotConfig;
}

export interface EventStoreConfig {
    type: 'mongodb' | 'postgresql' | 'cosmosdb' | 'dynamodb' | 'memory';
    connection: EventStoreConnection;
    partitioning: PartitioningConfig;
    retention: RetentionConfig;
    encryption: EventEncryptionConfig;
}

export interface EventStoreConnection {
    connectionString: string;
    database: string;
    collection?: string;
    table?: string;
    poolSize?: number;
    timeout?: number;
}

export interface PartitioningConfig {
    enabled: boolean;
    strategy: 'by-stream' | 'by-time' | 'by-hash' | 'custom';
    partitionCount?: number;
    partitionKey?: string;
}

export interface RetentionConfig {
    enabled: boolean;
    strategy: 'time-based' | 'count-based' | 'size-based';
    value: number;
    unit: 'days' | 'events' | 'bytes';
}

export interface EventEncryptionConfig {
    enabled: boolean;
    algorithm: string;
    keyId: string;
    fields?: string[];
}

export interface EventBusConfig {
    type: 'in-memory' | 'redis' | 'rabbitmq' | 'kafka' | 'nats';
    connection: EventBusConnection;
    topics: EventTopic[];
    deadLetterQueue: EventDeadLetterConfig;
}

export interface EventBusConnection {
    connectionString: string;
    options?: Record<string, any>;
}

export interface EventTopic {
    name: string;
    partitions?: number;
    replication?: number;
    retention?: number;
    serialization: 'json' | 'avro' | 'protobuf';
}

export interface EventDeadLetterConfig {
    enabled: boolean;
    topicName: string;
    maxRetries: number;
    retryDelay: number;
}

export interface ProjectionConfig {
    projectionId: string;
    name: string;
    type: 'read-model' | 'materialized-view' | 'index';
    eventTypes: string[];
    projector: string;
    storage: ProjectionStorage;
    checkpoint: CheckpointConfig;
}

export interface ProjectionStorage {
    type: 'mongodb' | 'postgresql' | 'redis' | 'elasticsearch';
    connection: any;
    collection?: string;
    table?: string;
    index?: string;
}

export interface CheckpointConfig {
    enabled: boolean;
    interval: number;
    storage: 'database' | 'file' | 'memory';
}

export interface SagaConfig {
    sagaId: string;
    name: string;
    type: 'orchestration' | 'choreography';
    definition: SagaDefinition;
    compensation: CompensationConfig;
    timeout: SagaTimeoutConfig;
}

export interface SagaDefinition {
    steps: SagaStep[];
    compensations: CompensationStep[];
}

export interface SagaStep {
    stepId: string;
    name: string;
    command: string;
    service: string;
    timeout?: number;
    retry?: SagaRetryConfig;
}

export interface CompensationStep {
    stepId: string;
    compensationCommand: string;
    service: string;
    order: number;
}

export interface CompensationConfig {
    enabled: boolean;
    strategy: 'reverse-order' | 'parallel' | 'custom';
    timeout: number;
}

export interface SagaTimeoutConfig {
    enabled: boolean;
    duration: number;
    action: 'compensate' | 'retry' | 'fail';
}

export interface SagaRetryConfig {
    enabled: boolean;
    maxAttempts: number;
    backoff: string;
}

export interface SnapshotConfig {
    enabled: boolean;
    frequency: number;
    type: 'count-based' | 'time-based';
    compression: boolean;
    storage: SnapshotStorage;
}

export interface SnapshotStorage {
    type: 'database' | 'file' | 'blob';
    connection: any;
    retention: number;
}

// ==================== ORCHESTRATION TYPES ====================

export interface ServiceOrchestrationConfig {
    orchestratorId: string;
    name: string;
    type: 'workflow' | 'state-machine' | 'bpm' | 'serverless';
    engine: OrchestrationEngine;
    workflows: WorkflowDefinition[];
    scheduling: SchedulingConfig;
    monitoring: OrchestrationMonitoring;
}

export interface OrchestrationEngine {
    type: 'zeebe' | 'temporal' | 'cadence' | 'airflow' | 'custom';
    connection: EngineConnection;
    workers: WorkerConfig[];
}

export interface EngineConnection {
    endpoint: string;
    credentials?: {
        username?: string;
        password?: string;
        token?: string;
    };
    ssl?: boolean;
    timeout?: number;
}

export interface WorkerConfig {
    workerId: string;
    name: string;
    taskType: string;
    handler: string;
    concurrency: number;
    timeout: number;
    retry: WorkerRetryConfig;
}

export interface WorkerRetryConfig {
    maxAttempts: number;
    backoff: string;
    jitter: boolean;
}

export interface WorkflowDefinition {
    workflowId: string;
    name: string;
    version: string;
    definition: string; // BPMN, workflow DSL, or JSON
    variables?: WorkflowVariable[];
    timeouts?: WorkflowTimeout[];
}

export interface WorkflowVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    defaultValue?: any;
}

export interface WorkflowTimeout {
    type: 'workflow' | 'activity' | 'user-task';
    duration: string;
    action: 'fail' | 'retry' | 'escalate';
}

export interface SchedulingConfig {
    enabled: boolean;
    scheduler: 'cron' | 'interval' | 'event-driven';
    timezone: string;
    schedules: Schedule[];
}

export interface Schedule {
    scheduleId: string;
    name: string;
    workflowId: string;
    trigger: ScheduleTrigger;
    enabled: boolean;
}

export interface ScheduleTrigger {
    type: 'cron' | 'interval' | 'event';
    expression?: string;
    interval?: number;
    event?: string;
}

export interface OrchestrationMonitoring {
    enabled: boolean;
    metrics: OrchestrationMetrics;
    tracing: boolean;
    logging: OrchestrationLogging;
}

export interface OrchestrationMetrics {
    enabled: boolean;
    provider: string;
    customMetrics: string[];
}

export interface OrchestrationLogging {
    enabled: boolean;
    level: string;
    includeWorkflowData: boolean;
    includeVariables: boolean;
}

// ==================== INTEGRATION RESULT TYPES ====================

export interface ServiceHealthStatus {
    serviceId: string;
    status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
    lastCheck: Date;
    responseTime: number;
    errorCount: number;
    message?: string;
    details?: Record<string, any>;
}

export interface IntegrationMetrics {
    serviceId: string;
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
    timestamp: Date;
}

export interface ServiceDiscoveryResult {
    services: DiscoveredService[];
    lastDiscovery: Date;
    discoverySource: string;
}

export interface DiscoveredService {
    serviceId: string;
    name: string;
    version: string;
    endpoints: string[];
    metadata: Record<string, any>;
    health: ServiceHealthStatus;
}

export interface IntegrationResult<T = any> {
    success: boolean;
    data?: T;
    error?: IntegrationError;
    metadata: {
        serviceId: string;
        timestamp: Date;
        duration: number;
        retryCount?: number;
        cached?: boolean;
    };
}

export interface IntegrationError {
    code: string;
    message: string;
    details?: Record<string, any>;
    retryable: boolean;
    category: 'network' | 'authentication' | 'authorization' | 'validation' | 'timeout' | 'server' | 'client';
}

export interface WebSocketMessage {
    id: string;
    type: string;
    payload: any;
    timestamp: Date;
    sender?: string;
    room?: string;
    metadata?: Record<string, any>;
}

export interface QueueMessage {
    messageId: string;
    body: any;
    headers?: Record<string, string>;
    timestamp: Date;
    deliveryCount: number;
    visibilityTimeout?: Date;
    receiptHandle?: string;
}

export interface EventMessage {
    eventId: string;
    eventType: string;
    aggregateId: string;
    aggregateType: string;
    version: number;
    data: any;
    metadata: EventMetadata;
    timestamp: Date;
}

export interface EventMetadata {
    correlationId?: string;
    causationId?: string;
    userId?: string;
    source?: string;
    [key: string]: any;
}
