# MemorAI System Documentation

## System Overview
MemorAI is a comprehensive intelligent memory management platform built on modern web technologies, providing users with advanced memory storage, retrieval, and analytics capabilities through a sophisticated multi-algorithm search system and real-time collaboration features.

## Architecture Documentation

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                        MemorAI Platform                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Layer (Next.js 15.4.1 + React 19.1.0)             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Memory    │ │   Search    │ │  Analytics  │              │
│  │ Dashboard   │ │ Interface   │ │ Dashboard   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  API Layer (REST + WebSocket)                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Memory    │ │   Search    │ │Performance  │              │
│  │    API      │ │    API      │ │    API      │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Search    │ │  Analytics  │ │    Cache    │              │
│  │   Engine    │ │   Engine    │ │   Manager   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer (CBD Universal Database)                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │  Document   │ │   Vector    │ │ Key-Value   │              │
│  │  Storage    │ │  Storage    │ │  Storage    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack Details

#### Frontend Technologies
- **Next.js 15.4.1**: React framework with App Router
- **React 19.1.0**: UI library with concurrent features
- **TypeScript 5.0+**: Type-safe development
- **Tailwind CSS**: Utility-first styling framework
- **Socket.io-client**: Real-time communication
- **NextAuth.js**: Authentication framework

#### Backend Technologies
- **Node.js 18+**: Server runtime environment
- **CBD Universal Database**: Multi-paradigm database system
- **Socket.io**: WebSocket server for real-time features
- **NextAuth.js**: Authentication and session management
- **Zod**: Runtime type validation

#### Development Tools
- **pnpm**: Package management
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Playwright**: End-to-end testing
- **Vitest**: Unit testing framework

### Component Architecture

#### Core Components Hierarchy
```
App Layout
├── Authentication Layer (NextAuth.js)
├── Navigation & Layout
│   ├── Dashboard Layout
│   ├── Notification Provider
│   └── Connection Status
├── Memory Management
│   ├── Memory Dashboard
│   ├── Memory Editor
│   ├── Memory Viewer
│   └── Memory Timeline
├── Search System
│   ├── Advanced Search Interface
│   ├── Search Results
│   └── Search Filters
├── Analytics & Monitoring
│   ├── Analytics Dashboard
│   ├── Performance Charts
│   └── Performance Monitoring
└── Collaboration Features
    ├── Real-time Sync
    ├── User Presence
    └── Activity Feed
```

## Database Schema & Design

### CBD Universal Database Integration
The system leverages CBD's multi-paradigm approach:

#### Document Paradigm (Primary Storage)
```json
{
  "collection": "memories",
  "schema": {
    "id": "string (UUID)",
    "title": "string (1-200 chars)",
    "content": "string (1-50000 chars)",
    "category": "string (1-50 chars)",
    "tags": "array<string> (max 10 items)",
    "userId": "string (UUID)",
    "metadata": "object (flexible schema)",
    "createdAt": "ISO8601 datetime",
    "updatedAt": "ISO8601 datetime",
    "version": "integer"
  }
}
```

#### Vector Paradigm (Semantic Search)
```json
{
  "collection": "memory_vectors",
  "schema": {
    "id": "string (UUID)",
    "memoryId": "string (UUID, foreign key)",
    "vector": "array<float> (1536 dimensions)",
    "content": "string (source text)",
    "algorithm": "string (embedding model)",
    "createdAt": "ISO8601 datetime"
  }
}
```

#### Key-Value Paradigm (Caching)
```json
{
  "collection": "cache_entries",
  "schema": {
    "key": "string (cache key)",
    "value": "any (serialized data)",
    "ttl": "integer (seconds)",
    "createdAt": "ISO8601 datetime",
    "expiresAt": "ISO8601 datetime"
  }
}
```

#### Time-Series Paradigm (Analytics)
```json
{
  "collection": "analytics_events",
  "schema": {
    "timestamp": "ISO8601 datetime",
    "userId": "string (UUID)",
    "eventType": "string (enum)",
    "eventData": "object (event-specific)",
    "sessionId": "string (UUID)",
    "metadata": "object (flexible)"
  }
}
```

### Data Relationships
```
Users (1) ──────── (N) Memories
                      │
                      ├── (1) Vector Embeddings
                      ├── (N) Tags
                      └── (N) Analytics Events

Categories (1) ─── (N) Memories
Cache Entries ──── Independent
Performance Metrics ── Time-Series
```

### Indexing Strategy
- **Primary Indexes**: id, userId, createdAt
- **Search Indexes**: title, content (full-text), category
- **Vector Indexes**: vector embeddings (HNSW algorithm)
- **Composite Indexes**: userId + createdAt, category + userId

## Search Engine Architecture

### Multi-Algorithm Search System
The search engine implements four distinct algorithms:

#### 1. Exact Search Algorithm
```typescript
interface ExactSearchConfig {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
}

class ExactSearchAlgorithm {
  async search(query: string, config: ExactSearchConfig): Promise<SearchResult[]> {
    // Implementation uses exact string matching
    // Fastest algorithm with 100% precision for exact matches
  }
}
```

#### 2. Full-Text Search Algorithm
```typescript
interface FullTextSearchConfig {
  stemming: boolean;
  synonyms: boolean;
  booleanOperators: boolean;
  fieldWeights: Record<string, number>;
}

class FullTextSearchAlgorithm {
  private tfidfScorer: TFIDFScorer;
  
  async search(query: string, config: FullTextSearchConfig): Promise<SearchResult[]> {
    // Implementation uses TF-IDF scoring with advanced text analysis
    // Supports boolean operators, stemming, and synonym expansion
  }
}
```

#### 3. Semantic Search Algorithm
```typescript
interface SemanticSearchConfig {
  threshold: number;
  model: string;
  dimensions: number;
}

class SemanticSearchAlgorithm {
  private embeddingModel: EmbeddingModel;
  
  async search(query: string, config: SemanticSearchConfig): Promise<SearchResult[]> {
    // Implementation uses vector similarity search
    // Understands context and meaning beyond exact words
  }
}
```

#### 4. Fuzzy Search Algorithm
```typescript
interface FuzzySearchConfig {
  maxDistance: number;
  algorithm: 'levenshtein' | 'damerau' | 'jaro-winkler';
  threshold: number;
}

class FuzzySearchAlgorithm {
  async search(query: string, config: FuzzySearchConfig): Promise<SearchResult[]> {
    // Implementation uses edit distance algorithms
    // Tolerates typos and spelling variations
  }
}
```

### Search Performance Optimization
- **Caching Layer**: 5-minute TTL for search results
- **Index Optimization**: Pre-computed indexes for common queries
- **Query Preprocessing**: Normalization and tokenization
- **Result Ranking**: Multi-factor scoring algorithm

## Performance Architecture

### Caching Strategy
```typescript
interface CacheLayer {
  L1: MemoryCache;    // In-process cache (100ms access)
  L2: RedisCache;     // Distributed cache (5ms access)
  L3: DatabaseCache;  // Persistent cache (50ms access)
}

class CacheManager {
  async get(key: string): Promise<any> {
    // Try L1 → L2 → L3 → Source
    // 96% hit rate achieved in production
  }
  
  async set(key: string, value: any, ttl: number): Promise<void> {
    // Write-through to all layers
    // Invalidation cascades appropriately
  }
}
```

### Performance Monitoring System
```typescript
interface PerformanceMetrics {
  responseTime: {
    current: number;
    average: number;
    p95: number;
    p99: number;
  };
  throughput: {
    current: number;
    average: number;
    peak: number;
  };
  resources: {
    memory: number;
    cpu: number;
    disk: number;
  };
  errors: {
    rate: number;
    count: number;
    types: Record<string, number>;
  };
}
```

### Performance Benchmarks
- **API Response Time**: < 100ms average, < 200ms P95
- **Search Performance**: < 50ms average across all algorithms
- **Memory Usage**: < 512MB baseline, < 1GB under load
- **Cache Hit Rate**: > 90% for frequently accessed data
- **Uptime Target**: > 99.9% availability

## Security Architecture

### Authentication & Authorization
```typescript
interface SecurityConfig {
  authentication: {
    provider: 'CODAI';
    sessionDuration: '24h';
    tokenRotation: boolean;
    mfa: boolean;
  };
  authorization: {
    rbac: boolean;
    userIsolation: boolean;
    resourcePermissions: string[];
  };
  dataProtection: {
    encryption: 'AES-256';
    hashing: 'bcrypt';
    sanitization: boolean;
  };
}
```

### Security Layers
1. **Network Security**: HTTPS, CORS, rate limiting
2. **Application Security**: Input validation, output encoding
3. **Data Security**: Encryption at rest and in transit
4. **Access Control**: Role-based permissions, user isolation

### Threat Mitigation
- **SQL Injection**: Parameterized queries, input validation
- **XSS Prevention**: Output encoding, CSP headers
- **CSRF Protection**: CSRF tokens, SameSite cookies
- **Rate Limiting**: Per-user and per-endpoint limits

## Deployment Architecture

### Production Deployment Stack
```yaml
# Production Environment
Kubernetes Cluster:
  - Frontend Pods: 3 replicas (Next.js)
  - API Pods: 5 replicas (Node.js)
  - Database: CBD cluster (3 nodes)
  - Cache: Redis cluster (3 nodes)
  - Load Balancer: NGINX Ingress
  - Monitoring: Prometheus + Grafana
  - Logging: ELK Stack
```

### Scaling Strategy
- **Horizontal Scaling**: Auto-scaling based on CPU/memory
- **Database Scaling**: Read replicas for search operations
- **Cache Scaling**: Distributed Redis with sharding
- **CDN Integration**: Static asset distribution

### Monitoring & Observability
```typescript
interface MonitoringStack {
  metrics: {
    application: 'Prometheus';
    infrastructure: 'Node Exporter';
    custom: 'Custom collectors';
  };
  logging: {
    application: 'Winston';
    aggregation: 'ELK Stack';
    alerting: 'ElastAlert';
  };
  tracing: {
    distributed: 'Jaeger';
    performance: 'Web Vitals';
    errors: 'Sentry';
  };
}
```

### Backup & Disaster Recovery
- **Database Backups**: Daily full + hourly incremental
- **Cross-Region Replication**: Primary + DR regions
- **Recovery Time Objective**: < 4 hours
- **Recovery Point Objective**: < 1 hour
- **Automated Failover**: Health check triggered

## API Documentation Architecture

### RESTful API Design
```
Base URL: https://api.memorai.com/v1

Authentication: Bearer token or session cookie
Rate Limiting: 100 req/min (standard), 30 req/min (search)
Content Type: application/json
Versioning: URL path versioning (/v1/)
```

### API Endpoints Structure
```
/memories              # Memory CRUD operations
  GET    /memories     # List memories (paginated)
  POST   /memories     # Create memory
  GET    /memories/:id # Get memory by ID
  PUT    /memories/:id # Update memory
  DELETE /memories/:id # Delete memory

/search               # Search operations
  POST /search/exact    # Exact text search
  POST /search/fulltext # Full-text search
  POST /search/semantic # Semantic search
  POST /search/fuzzy    # Fuzzy search

/analytics            # Analytics data
  GET /analytics        # Comprehensive analytics
  GET /analytics/trends # Trend analysis
  GET /analytics/usage  # Usage statistics

/performance          # Performance monitoring
  GET /performance      # Real-time metrics
  GET /performance/history # Historical data
  POST /performance/alerts # Alert configuration
```

### WebSocket API Structure
```
Connection: ws://localhost:4006
Authentication: Query parameter or handshake auth

Events:
  # Memory events
  memory:created    # Memory created by user
  memory:updated    # Memory updated by user
  memory:deleted    # Memory deleted by user
  
  # Collaboration events
  user:joined       # User joined session
  user:left         # User left session
  cursor:move       # User cursor movement
  
  # System events
  performance:alert # Performance threshold exceeded
  system:maintenance # Maintenance notifications
```

## Integration Points

### External Service Integration
```typescript
interface ExternalIntegrations {
  authentication: {
    provider: 'CODAI';
    protocol: 'OAuth 2.0';
    scopes: ['read', 'write'];
  };
  embedding: {
    provider: 'OpenAI' | 'Local';
    model: 'text-embedding-ada-002';
    dimensions: 1536;
  };
  analytics: {
    provider: 'Google Analytics';
    events: ['memory_created', 'search_performed'];
  };
  monitoring: {
    provider: 'DataDog';
    metrics: ['response_time', 'error_rate'];
  };
}
```

### CBD Database Integration
```typescript
class CBDIntegration {
  // Multi-paradigm database operations
  async document(): Promise<DocumentAPI> {
    // Document storage operations
  }
  
  async vector(): Promise<VectorAPI> {
    // Vector similarity search operations
  }
  
  async keyvalue(): Promise<KeyValueAPI> {
    // Cache and session storage
  }
  
  async timeseries(): Promise<TimeSeriesAPI> {
    // Analytics and metrics storage
  }
  
  async graph(): Promise<GraphAPI> {
    // Relationship and connection data
  }
  
  async file(): Promise<FileAPI> {
    // Binary file storage operations
  }
}
```

## Maintenance & Operations

### Routine Maintenance Tasks
```yaml
Daily:
  - Health check monitoring
  - Performance metrics review
  - Error log analysis
  - Backup verification

Weekly:
  - Security audit logs
  - Performance trend analysis
  - Capacity planning review
  - Dependency updates

Monthly:
  - Full security scan
  - Performance optimization
  - Database maintenance
  - Documentation updates

Quarterly:
  - Architecture review
  - Technology stack evaluation
  - Disaster recovery testing
  - Security penetration testing
```

### Troubleshooting Guide
```markdown
Common Issues:
1. High Response Times
   - Check cache hit rates
   - Review database query performance
   - Analyze search algorithm efficiency

2. Memory Usage Spikes
   - Review cache configuration
   - Check for memory leaks
   - Analyze garbage collection patterns

3. Search Performance Issues
   - Rebuild search indexes
   - Optimize vector embeddings
   - Review query patterns

4. Authentication Failures
   - Verify CODAI integration
   - Check session configuration
   - Review token expiration
```

### Capacity Planning
```typescript
interface CapacityPlanning {
  users: {
    current: 1000;
    projected: 10000;
    growth_rate: '20%/month';
  };
  storage: {
    current: '100GB';
    projected: '1TB';
    growth_rate: '15%/month';
  };
  performance: {
    target_response_time: '100ms';
    target_throughput: '1000 req/s';
    target_availability: '99.9%';
  };
}
```

## Future Architecture Considerations

### Scalability Roadmap
1. **Phase 1**: Microservices decomposition
2. **Phase 2**: Multi-region deployment
3. **Phase 3**: Edge computing integration
4. **Phase 4**: AI/ML pipeline optimization

### Technology Evolution
- **Database**: Transition to distributed CBD cluster
- **Search**: Advanced AI-powered semantic search
- **Frontend**: Progressive Web App (PWA) capabilities
- **Mobile**: Native mobile applications
- **AI Integration**: Advanced natural language processing

---

This system documentation provides a comprehensive overview of the MemorAI platform architecture, serving as a reference for development, deployment, and maintenance operations.
