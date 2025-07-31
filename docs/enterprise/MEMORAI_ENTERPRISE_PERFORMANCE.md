# MemorAI Enterprise Performance Optimization Guide

This document provides comprehensive performance optimization strategies for the MemorAI enterprise deployment.

## Performance Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Performance Optimization Stack                │
├─────────────────────────────────────────────────────────────────┤
│  Application Layer                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Connection    │  │     Caching     │  │   Query Opt     │ │
│  │    Pooling      │  │    Strategy     │  │   & Indexing    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Infrastructure Layer                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Auto Scaling   │  │ Load Balancing  │  │   Resource      │ │
│  │   & Capacity    │  │   & Traffic     │  │  Optimization   │ │
│  │    Planning     │  │  Distribution   │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Vector Store   │  │   Database      │  │    Storage      │ │
│  │  Optimization   │  │  Performance    │  │   Efficiency    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Vector Database Optimization

### CBD Vector Store Performance Tuning

#### 1. FAISS Index Optimization

```rust
use faiss::{Index, IndexFlat, IndexIVFFlat, IndexHNSW};
use std::sync::Arc;

pub struct OptimizedVectorStore {
    primary_index: Arc<dyn Index>,
    backup_indices: Vec<Arc<dyn Index>>,
    index_type: IndexType,
    dimension: usize,
}

impl OptimizedVectorStore {
    pub fn new_optimized(dimension: usize, expected_size: usize) -> Result<Self, Box<dyn Error>> {
        let index_type = match expected_size {
            0..=10_000 => IndexType::Flat,           // Exact search for small datasets
            10_001..=100_000 => IndexType::IVF,      // IVF for medium datasets
            _ => IndexType::HNSW,                    // HNSW for large datasets
        };

        let primary_index = match index_type {
            IndexType::Flat => {
                Arc::new(IndexFlat::new(dimension, faiss::MetricType::L2)?)
            },
            IndexType::IVF => {
                let quantizer = IndexFlat::new(dimension, faiss::MetricType::L2)?;
                let nlist = (expected_size as f32).sqrt() as usize; // √n clusters
                Arc::new(IndexIVFFlat::new(&quantizer, dimension, nlist, faiss::MetricType::L2)?)
            },
            IndexType::HNSW => {
                let mut index = IndexHNSW::new(dimension, 32, faiss::MetricType::L2)?; // M=32 connections
                index.hnsw.set_ef(40); // ef=40 for search
                index.hnsw.set_ef_construction(200); // ef_construction=200 for build
                Arc::new(index)
            }
        };

        Ok(Self {
            primary_index,
            backup_indices: Vec::new(),
            index_type,
            dimension,
        })
    }

    // Batch insert optimization
    pub async fn batch_insert(&mut self, vectors: Vec<Vec<f32>>, ids: Vec<i64>) -> Result<(), Box<dyn Error>> {
        let batch_size = match self.index_type {
            IndexType::Flat => 10_000,    // Large batches for flat index
            IndexType::IVF => 5_000,      // Medium batches for IVF
            IndexType::HNSW => 1_000,     // Smaller batches for HNSW
        };

        for chunk in vectors.chunks(batch_size).zip(ids.chunks(batch_size)) {
            let (vector_chunk, id_chunk) = chunk;
            self.primary_index.add_with_ids(vector_chunk, id_chunk)?;
        }

        // Train IVF index after batch insert
        if matches!(self.index_type, IndexType::IVF) {
            let training_data: Vec<f32> = vectors.into_iter().flatten().collect();
            self.primary_index.train(&training_data)?;
        }

        Ok(())
    }

    // Optimized search with adaptive parameters
    pub async fn search_optimized(&self, query: &[f32], k: usize) -> Result<SearchResult, Box<dyn Error>> {
        let search_params = match self.index_type {
            IndexType::Flat => SearchParams::default(),
            IndexType::IVF => SearchParams {
                nprobe: (k as f32 * 1.5) as usize, // Adaptive nprobe
                ..Default::default()
            },
            IndexType::HNSW => SearchParams {
                ef: (k * 2).max(16), // Adaptive ef
                ..Default::default()
            }
        };

        let start = std::time::Instant::now();
        let (distances, labels) = self.primary_index.search(query, k)?;
        let duration = start.elapsed();

        // Performance metrics
        self.record_search_metrics(duration, k, query.len());

        Ok(SearchResult {
            distances: distances.to_vec(),
            ids: labels.to_vec(),
            search_time: duration,
        })
    }
}
```

#### 2. Memory-Mapped Storage

```rust
use memmap2::{Mmap, MmapOptions};
use std::fs::File;

pub struct MmapVectorStorage {
    mmap: Mmap,
    dimension: usize,
    count: usize,
}

impl MmapVectorStorage {
    pub fn new(file_path: &str, dimension: usize) -> Result<Self, Box<dyn Error>> {
        let file = File::open(file_path)?;
        let mmap = unsafe { MmapOptions::new().map(&file)? };

        let count = mmap.len() / (dimension * std::mem::size_of::<f32>());

        Ok(Self {
            mmap,
            dimension,
            count,
        })
    }

    pub fn get_vector(&self, index: usize) -> &[f32] {
        let start = index * self.dimension;
        let end = start + self.dimension;

        unsafe {
            let ptr = self.mmap.as_ptr().add(start * std::mem::size_of::<f32>()) as *const f32;
            std::slice::from_raw_parts(ptr, self.dimension)
        }
    }

    // Prefetch optimization
    pub fn prefetch_range(&self, start: usize, count: usize) {
        let byte_start = start * self.dimension * std::mem::size_of::<f32>();
        let byte_len = count * self.dimension * std::mem::size_of::<f32>();

        unsafe {
            libc::madvise(
                self.mmap.as_ptr().add(byte_start) as *mut libc::c_void,
                byte_len,
                libc::MADV_WILLNEED,
            );
        }
    }
}
```

### Database Performance Optimization

#### 1. PostgreSQL Configuration

```sql
-- High-performance PostgreSQL configuration for MemorAI
-- postgresql.conf optimizations

-- Memory settings
shared_buffers = '4GB'                    -- 25% of total RAM
effective_cache_size = '12GB'             -- 75% of total RAM
work_mem = '256MB'                        -- Per connection working memory
maintenance_work_mem = '1GB'              -- For maintenance operations

-- Connection settings
max_connections = 200
superuser_reserved_connections = 3
shared_preload_libraries = 'pg_stat_statements,auto_explain'

-- Write-ahead logging
wal_buffers = '64MB'
checkpoint_completion_target = 0.9
checkpoint_timeout = '15min'
max_wal_size = '4GB'
min_wal_size = '1GB'

-- Query optimization
random_page_cost = 1.1                    -- SSD-optimized
effective_io_concurrency = 200            -- NVMe SSD optimization
default_statistics_target = 100           -- Better query planning

-- Logging for performance analysis
log_min_duration_statement = 1000         -- Log slow queries (>1s)
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
```

#### 2. Optimized Schema Design

```sql
-- Optimized table structure for MemorAI metadata
CREATE TABLE memorai_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content_hash BYTEA NOT NULL,
    vector_id BIGINT NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Partitioning key
    partition_date DATE GENERATED ALWAYS AS (created_at::date) STORED
) PARTITION BY RANGE (partition_date);

-- Create partitions for current and future months
CREATE TABLE memorai_entries_2024_01 PARTITION OF memorai_entries
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Optimized indexes
CREATE INDEX CONCURRENTLY idx_memorai_entries_user_id
    ON memorai_entries USING BTREE (user_id);

CREATE INDEX CONCURRENTLY idx_memorai_entries_vector_id
    ON memorai_entries USING BTREE (vector_id);

CREATE INDEX CONCURRENTLY idx_memorai_entries_content_hash
    ON memorai_entries USING HASH (content_hash);

CREATE INDEX CONCURRENTLY idx_memorai_entries_metadata_gin
    ON memorai_entries USING GIN (metadata);

-- Partial index for recent entries
CREATE INDEX CONCURRENTLY idx_memorai_entries_recent
    ON memorai_entries (created_at DESC)
    WHERE created_at > NOW() - INTERVAL '30 days';

-- Function-based index for text search
CREATE INDEX CONCURRENTLY idx_memorai_entries_text_search
    ON memorai_entries USING GIN (to_tsvector('english', metadata->>'content'));
```

#### 3. Connection Pooling

```typescript
import { Pool, PoolConfig } from 'pg';
import { createHash } from 'crypto';

export class OptimizedConnectionPool {
  private pools: Map<string, Pool> = new Map();
  private readonly defaultConfig: PoolConfig = {
    max: 20, // Maximum connections per pool
    min: 5, // Minimum connections to maintain
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // 2s connection timeout
    acquireTimeoutMillis: 10000, // 10s acquire timeout
    statement_timeout: 30000, // 30s statement timeout
    query_timeout: 30000, // 30s query timeout
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.DB_CA_CERT,
    },
  };

  getPool(config: PoolConfig): Pool {
    const key = this.getPoolKey(config);

    if (!this.pools.has(key)) {
      const poolConfig = { ...this.defaultConfig, ...config };
      const pool = new Pool(poolConfig);

      // Pool event handlers for monitoring
      pool.on('connect', client => {
        console.log('Database connection established');
        // Set session parameters for performance
        client.query(`
          SET statement_timeout = '30s';
          SET lock_timeout = '5s';
          SET idle_in_transaction_session_timeout = '60s';
        `);
      });

      pool.on('error', err => {
        console.error('Database pool error:', err);
      });

      this.pools.set(key, pool);
    }

    return this.pools.get(key)!;
  }

  private getPoolKey(config: PoolConfig): string {
    const keyData = JSON.stringify({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
    });
    return createHash('md5').update(keyData).digest('hex');
  }

  async executeOptimized<T>(pool: Pool, query: string, params: any[] = []): Promise<T[]> {
    const client = await pool.connect();

    try {
      // Enable parallel query execution for complex queries
      if (query.toLowerCase().includes('join') || query.toLowerCase().includes('aggregate')) {
        await client.query('SET max_parallel_workers_per_gather = 4');
      }

      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }
}
```

## Caching Strategy

### Multi-Layer Caching Architecture

```typescript
export class MultiLayerCache {
  private l1Cache: LRUCache<string, any>; // In-memory L1 cache
  private l2Cache: RedisClient; // Redis L2 cache
  private l3Cache: S3Client; // S3 L3 cache for large objects

  constructor() {
    // L1 Cache: Fast in-memory cache for hot data
    this.l1Cache = new LRUCache({
      max: 10000, // 10k items
      maxSize: 100 * 1024 * 1024, // 100MB
      ttl: 5 * 60 * 1000, // 5 minutes TTL
      sizeCalculation: value => JSON.stringify(value).length,
    });

    // L2 Cache: Redis for shared cache across instances
    this.l2Cache = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      // Optimized for performance
      compression: 'gzip',
      enableAutoPipelining: true,
      maxRetriesPerRequest: 3,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.generateCacheKey(key);

    // Try L1 cache first
    const l1Result = this.l1Cache.get(cacheKey);
    if (l1Result !== undefined) {
      this.recordCacheHit('L1', key);
      return l1Result;
    }

    // Try L2 cache (Redis)
    const l2Result = await this.l2Cache.get(cacheKey);
    if (l2Result) {
      const parsed = JSON.parse(l2Result);
      // Promote to L1 cache
      this.l1Cache.set(cacheKey, parsed);
      this.recordCacheHit('L2', key);
      return parsed;
    }

    // Try L3 cache (S3) for large objects
    if (this.isLargeObjectKey(key)) {
      const l3Result = await this.getFromS3(cacheKey);
      if (l3Result) {
        // Don't promote large objects to L1/L2
        this.recordCacheHit('L3', key);
        return l3Result;
      }
    }

    this.recordCacheMiss(key);
    return null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const cacheKey = this.generateCacheKey(key);
    const serialized = JSON.stringify(value);
    const size = serialized.length;

    // Choose storage tier based on size
    if (size > 10 * 1024 * 1024) {
      // > 10MB goes to S3
      await this.setInS3(cacheKey, value, ttl);
    } else if (size > 1024 * 1024) {
      // > 1MB goes to Redis only
      await this.l2Cache.setex(cacheKey, ttl || 3600, serialized);
    } else {
      // Small objects go to both L1 and L2
      this.l1Cache.set(cacheKey, value, { ttl: ttl ? ttl * 1000 : undefined });
      await this.l2Cache.setex(cacheKey, ttl || 3600, serialized);
    }
  }

  // Cache warming strategy
  async warmCache(keys: string[]): Promise<void> {
    const batchSize = 100;
    const batches = [];

    for (let i = 0; i < keys.length; i += batchSize) {
      batches.push(keys.slice(i, i + batchSize));
    }

    await Promise.all(batches.map(batch => this.warmCacheBatch(batch)));
  }

  private async warmCacheBatch(keys: string[]): Promise<void> {
    const pipeline = this.l2Cache.pipeline();
    keys.forEach(key => pipeline.get(this.generateCacheKey(key)));

    const results = await pipeline.exec();
    results?.forEach((result, index) => {
      if (result[1]) {
        const value = JSON.parse(result[1] as string);
        this.l1Cache.set(this.generateCacheKey(keys[index]), value);
      }
    });
  }
}
```

### Vector Search Result Caching

```typescript
export class VectorSearchCache {
  private cache: MultiLayerCache;
  private hashingService: HashingService;

  async getCachedSearch(
    query: number[],
    k: number,
    filters?: Record<string, any>
  ): Promise<SearchResult | null> {
    const cacheKey = this.generateSearchKey(query, k, filters);
    return await this.cache.get<SearchResult>(cacheKey);
  }

  async setCachedSearch(
    query: number[],
    k: number,
    result: SearchResult,
    filters?: Record<string, any>
  ): Promise<void> {
    const cacheKey = this.generateSearchKey(query, k, filters);
    // Cache search results for 1 hour
    await this.cache.set(cacheKey, result, 3600);
  }

  private generateSearchKey(query: number[], k: number, filters?: Record<string, any>): string {
    // Create deterministic hash of search parameters
    const queryHash = this.hashingService.hashVector(query);
    const filterHash = filters ? this.hashingService.hashObject(filters) : '';
    return `search:${queryHash}:${k}:${filterHash}`;
  }

  // Approximate cache for similar queries
  async findSimilarCachedSearch(
    query: number[],
    k: number,
    similarity_threshold: number = 0.95
  ): Promise<SearchResult | null> {
    const queryHash = this.hashingService.hashVector(query);

    // Use LSH (Locality Sensitive Hashing) to find similar cached queries
    const similarKeys = await this.findSimilarKeys(queryHash, similarity_threshold);

    for (const key of similarKeys) {
      const cachedResult = await this.cache.get<SearchResult>(key);
      if (cachedResult) {
        // Adjust results based on actual query
        return this.adjustSearchResults(cachedResult, query);
      }
    }

    return null;
  }
}
```

## Auto-Scaling Configuration

### Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: memorai-mcp-hpa
  namespace: memorai-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: memorai-mcp
  minReplicas: 3
  maxReplicas: 50
  metrics:
    # CPU-based scaling
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    # Memory-based scaling
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    # Custom metrics scaling
    - type: Pods
      pods:
        metric:
          name: vector_search_queue_length
        target:
          type: AverageValue
          averageValue: '10'
    - type: Object
      object:
        metric:
          name: active_connections
        describedObject:
          apiVersion: v1
          kind: Service
          name: memorai-mcp-service
        target:
          type: Value
          value: '100'
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300 # 5 minutes stabilization
      policies:
        - type: Percent
          value: 25 # Max 25% scale down per period
          periodSeconds: 60
        - type: Pods
          value: 2 # Max 2 pods scale down per period
          periodSeconds: 60
      selectPolicy: Min
    scaleUp:
      stabilizationWindowSeconds: 60 # 1 minute stabilization
      policies:
        - type: Percent
          value: 50 # Max 50% scale up per period
          periodSeconds: 30
        - type: Pods
          value: 5 # Max 5 pods scale up per period
          periodSeconds: 30
      selectPolicy: Max
```

### Vertical Pod Autoscaler (VPA)

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: memorai-mcp-vpa
  namespace: memorai-system
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: memorai-mcp
  updatePolicy:
    updateMode: 'Auto' # Automatically apply recommendations
  resourcePolicy:
    containerPolicies:
      - containerName: memorai-mcp
        maxAllowed:
          cpu: '4'
          memory: '8Gi'
        minAllowed:
          cpu: '100m'
          memory: '128Mi'
        controlledResources: ['cpu', 'memory']
        controlledValues: RequestsAndLimits
```

### Custom Metrics for Scaling

```typescript
export class CustomMetricsExporter {
  private prometheusRegistry: Registry;
  private vectorSearchQueueGauge: Gauge<string>;
  private activeConnectionsGauge: Gauge<string>;
  private processingLatencyHistogram: Histogram<string>;

  constructor() {
    this.prometheusRegistry = new Registry();

    this.vectorSearchQueueGauge = new Gauge({
      name: 'vector_search_queue_length',
      help: 'Number of vector search requests in queue',
      labelNames: ['instance'],
      registers: [this.prometheusRegistry],
    });

    this.activeConnectionsGauge = new Gauge({
      name: 'active_connections',
      help: 'Number of active WebSocket connections',
      labelNames: ['service'],
      registers: [this.prometheusRegistry],
    });

    this.processingLatencyHistogram = new Histogram({
      name: 'request_processing_duration_seconds',
      help: 'Request processing latency',
      labelNames: ['method', 'endpoint'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.prometheusRegistry],
    });
  }

  updateQueueLength(queueLength: number): void {
    this.vectorSearchQueueGauge.set({ instance: process.env.HOSTNAME || 'unknown' }, queueLength);
  }

  updateActiveConnections(connectionCount: number): void {
    this.activeConnectionsGauge.set({ service: 'memorai-mcp' }, connectionCount);
  }

  recordProcessingTime(method: string, endpoint: string, duration: number): void {
    this.processingLatencyHistogram.observe({ method, endpoint }, duration);
  }

  getMetrics(): string {
    return this.prometheusRegistry.metrics();
  }
}

// Integration with application
export class PerformanceOptimizedServer {
  private metricsExporter: CustomMetricsExporter;
  private requestQueue: Queue<Request>;
  private activeConnections: Set<WebSocket>;

  constructor() {
    this.metricsExporter = new CustomMetricsExporter();
    this.requestQueue = new Queue<Request>();
    this.activeConnections = new Set();

    // Update metrics every 10 seconds
    setInterval(() => {
      this.metricsExporter.updateQueueLength(this.requestQueue.size);
      this.metricsExporter.updateActiveConnections(this.activeConnections.size);
    }, 10000);
  }

  async processRequest(request: Request): Promise<Response> {
    const startTime = Date.now();

    try {
      // Add to queue for processing
      this.requestQueue.enqueue(request);

      // Process the request
      const response = await this.handleRequest(request);

      return response;
    } finally {
      // Record processing time
      const duration = (Date.now() - startTime) / 1000;
      this.metricsExporter.recordProcessingTime(request.method, request.path, duration);
    }
  }
}
```

## Load Balancing and Traffic Distribution

### Istio Traffic Management

```yaml
# Virtual Service for intelligent traffic routing
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: memorai-traffic-management
  namespace: memorai-system
spec:
  hosts:
    - memorai-mcp-service
  http:
    # Canary deployment with traffic splitting
    - match:
        - headers:
            canary:
              exact: 'true'
      route:
        - destination:
            host: memorai-mcp-service
            subset: canary
          weight: 100
    # Load balancing based on request characteristics
    - match:
        - uri:
            prefix: '/api/v1/vector/search'
      route:
        - destination:
            host: memorai-mcp-service
            subset: search-optimized
          weight: 70
        - destination:
            host: memorai-mcp-service
            subset: general
          weight: 30
      timeout: 30s
      retries:
        attempts: 3
        perTryTimeout: 10s
        retryOn: 5xx,reset,connect-failure,refused-stream
    # Default routing
    - route:
        - destination:
            host: memorai-mcp-service
            subset: general
          weight: 100
      fault:
        delay:
          percentage:
            value: 0.1
          fixedDelay: 5s # Chaos engineering for resilience testing
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: memorai-destination-rule
  namespace: memorai-system
spec:
  host: memorai-mcp-service
  trafficPolicy:
    loadBalancer:
      consistentHash:
        httpHeaderName: 'user-id' # Session affinity
    connectionPool:
      tcp:
        maxConnections: 100
        connectTimeout: 30s
        tcpKeepalive:
          time: 7200s
          interval: 75s
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
        maxRequestsPerConnection: 10
        maxRetries: 3
        consecutiveGatewayErrors: 5
        interval: 30s
        baseEjectionTime: 30s
        maxEjectionPercent: 50
    circuitBreaker:
      consecutiveGatewayErrors: 5
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
      minHealthPercent: 50
  subsets:
    - name: general
      labels:
        version: stable
      trafficPolicy:
        loadBalancer:
          simple: LEAST_CONN
    - name: search-optimized
      labels:
        workload: search-heavy
      trafficPolicy:
        loadBalancer:
          simple: ROUND_ROBIN
    - name: canary
      labels:
        version: canary
      trafficPolicy:
        loadBalancer:
          simple: RANDOM
```

## Performance Monitoring and Alerting

### Performance SLIs and SLOs

```yaml
# Service Level Indicators (SLIs) and Objectives (SLOs)
apiVersion: v1
kind: ConfigMap
metadata:
  name: memorai-slo-config
  namespace: memorai-system
data:
  slo-config.yaml: |
    slos:
      - name: memorai-availability
        description: "MemorAI service availability"
        sli:
          query: 'sum(rate(http_requests_total{job="memorai-mcp",code!~"5.."}[5m])) / sum(rate(http_requests_total{job="memorai-mcp"}[5m]))'
        objective:
          target: 0.999  # 99.9% availability
          window: 30d
      
      - name: memorai-latency
        description: "95th percentile latency"
        sli:
          query: 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job="memorai-mcp"}[5m])) by (le))'
        objective:
          target: 0.2    # 200ms
          window: 7d
      
      - name: vector-search-performance
        description: "Vector search latency"
        sli:
          query: 'histogram_quantile(0.95, sum(rate(vector_search_duration_seconds_bucket[5m])) by (le))'
        objective:
          target: 0.1    # 100ms
          window: 7d
      
      - name: error-budget
        description: "Error budget consumption"
        sli:
          query: 'sum(rate(http_requests_total{job="memorai-mcp",code=~"5.."}[5m])) / sum(rate(http_requests_total{job="memorai-mcp"}[5m]))'
        objective:
          target: 0.001  # 0.1% error rate
          window: 30d
```

### Performance Alerting Rules

```yaml
groups:
  - name: memorai.performance
    rules:
      - alert: HighLatency
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job="memorai-mcp"}[5m])) by (le)) > 0.5
        for: 5m
        labels:
          severity: warning
          service: memorai-mcp
        annotations:
          summary: 'High latency detected'
          description: '95th percentile latency is {{ $value }}s, above 500ms threshold'
          runbook_url: 'https://runbooks.memorai.com/high-latency'

      - alert: VectorSearchSlowdown
        expr: histogram_quantile(0.95, sum(rate(vector_search_duration_seconds_bucket[5m])) by (le)) > 0.2
        for: 3m
        labels:
          severity: warning
          service: vector-search
        annotations:
          summary: 'Vector search performance degradation'
          description: 'Vector search 95th percentile latency is {{ $value }}s'

      - alert: MemoryPressure
        expr: (container_memory_usage_bytes{container="memorai-mcp"} / container_spec_memory_limit_bytes{container="memorai-mcp"}) > 0.9
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: 'High memory usage'
          description: 'Memory usage is {{ $value | humanizePercentage }}'

      - alert: ErrorBudgetExhaustion
        expr: (sum(rate(http_requests_total{job="memorai-mcp",code=~"5.."}[1h])) / sum(rate(http_requests_total{job="memorai-mcp"}[1h]))) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: 'Error budget being exhausted'
          description: 'Current error rate is {{ $value | humanizePercentage }}, exceeding 1% threshold'
```

This comprehensive performance optimization guide ensures that the MemorAI enterprise deployment achieves maximum efficiency, scalability, and reliability while maintaining optimal resource utilization.
