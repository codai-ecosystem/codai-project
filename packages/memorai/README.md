# @codai/memorai

**Universal Database & Storage Service for the CODAI Ecosystem**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/CODAI-Inc/codai-project)
[![TypeScript](https://img.shields.io/badge/typescript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/status-production--ready-green.svg)](https://github.com/CODAI-Inc/codai-project)

## 🌟 Overview

MEMORAI is the universal data foundation for the CODAI ecosystem, providing a unified interface for database operations, file storage, AI memory management, caching, synchronization, and analytics across all 32 applications.

## ✨ Key Features

### 🗄️ Universal Database Operations
- **Multi-Database Support**: PostgreSQL, SQLite, MongoDB, and more
- **Type-Safe Queries**: Full TypeScript support with schema validation
- **CRUD Operations**: Create, read, update, delete with advanced filtering
- **Relationship Management**: Join queries and foreign key constraints
- **Migration System**: Database schema versioning and updates

### 📁 Multi-Provider File Storage
- **AWS S3**: Enterprise-grade object storage
- **Cloudflare R2**: High-performance edge storage
- **Supabase Storage**: PostgreSQL-integrated file storage
- **Vercel Blob**: Serverless blob storage
- **Local Storage**: Development and on-premise deployment

### 🧠 AI Memory & Semantic Search
- **Vector Databases**: Pinecone, Weaviate, Qdrant, ChromaDB
- **Embedding Generation**: OpenAI, Anthropic AI integration
- **Semantic Search**: Natural language query processing
- **Knowledge Graphs**: Entity relationships and context mapping
- **Memory Types**: Episodic, semantic, and procedural memory

### ⚡ Advanced Caching
- **Multi-Layer Caching**: Memory + Redis with intelligent fallback
- **TTL Support**: Configurable time-to-live for cache entries
- **Cache Invalidation**: Smart cache busting and refresh strategies
- **Compression**: Automatic data compression for large values
- **Distributed Caching**: Cross-instance cache synchronization

### 🔄 Real-Time Synchronization
- **Cross-App Sync**: Data synchronization between ecosystem apps
- **Conflict Resolution**: Intelligent merge strategies for concurrent updates
- **Event Broadcasting**: Real-time updates via WebSocket/SSE
- **Offline Support**: Offline-first with sync on reconnection
- **Version Control**: Data versioning and rollback capabilities

### 📊 Analytics & Monitoring
- **Event Tracking**: User actions and system events
- **Performance Metrics**: Query times, storage usage, cache hit rates
- **Business Intelligence**: Custom analytics and reporting
- **Health Monitoring**: Service uptime and error tracking
- **Alerting**: Configurable thresholds and notifications

## 🚀 Quick Start

### Installation

```bash
pnpm add @codai/memorai
# or
npm install @codai/memorai
```

### Basic Setup

```typescript
import { MemoraiService } from '@codai/memorai'

// Initialize with configuration
const memorai = new MemoraiService({
  database: {
    type: 'sqlite',
    url: 'file:./data/app.db'
  },
  storage: {
    provider: 'local',
    local: { basePath: './uploads' }
  },
  cache: {
    provider: 'memory',
    redis: { url: process.env.REDIS_URL }
  }
})

await memorai.initialize()
```

### Database Operations

```typescript
// Create data
const user = await memorai.insert('users', {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'developer'
})

// Find data
const users = await memorai.find('users', {
  role: 'developer',
  createdAt: { $gte: new Date('2024-01-01') }
})

// Update data
await memorai.update('users', user.id, {
  lastLoginAt: new Date()
})

// Delete data
await memorai.delete('users', user.id)

// Advanced queries with joins
const results = await memorai.query({
  table: 'users',
  joins: [
    { table: 'profiles', on: 'users.id = profiles.userId' }
  ],
  where: { 'profiles.verified': true },
  orderBy: { createdAt: 'desc' },
  limit: 50
})
```

### File Storage

```typescript
// Upload file
const file = await memorai.uploadFile(
  fileBuffer,
  'document.pdf',
  'user123',
  {
    contentType: 'application/pdf',
    metadata: { category: 'documents' }
  }
)

// Download file
const fileData = await memorai.downloadFile(file.id, 'user123')

// Delete file
await memorai.deleteFile(file.id, 'user123')

// List user files
const userFiles = await memorai.listFiles('user123', {
  contentType: 'image/*',
  limit: 20
})
```

### AI Memory Management

```typescript
// Store memory
await memorai.storeMemory({
  content: 'User completed React.js tutorial',
  type: 'episodic',
  importance: 0.8,
  userId: 'user123',
  tags: ['learning', 'react', 'tutorial'],
  metadata: { course: 'advanced-react', progress: 0.75 }
})

// Search memories
const memories = await memorai.searchMemories({
  text: 'React tutorial progress',
  userId: 'user123',
  type: 'episodic',
  minImportance: 0.5,
  limit: 10
})

// Get memory insights
const insights = await memorai.getMemoryInsights('user123', {
  timeframe: '30d',
  categories: ['learning', 'projects']
})
```

### Caching Operations

```typescript
// Set cache with TTL
await memorai.cacheSet('user:123:profile', userData, {
  ttl: 3600, // 1 hour
  compress: true
})

// Get cached data
const cachedData = await memorai.cacheGet('user:123:profile')

// Delete cached data
await memorai.cacheDel('user:123:profile')

// Cache with tags for bulk invalidation
await memorai.cacheSet('product:456', productData, {
  ttl: 1800,
  tags: ['products', 'electronics']
})

// Invalidate by tags
await memorai.cacheInvalidateByTags(['products'])
```

### Real-Time Synchronization

```typescript
// Subscribe to data changes
memorai.onDataChange('users', (event) => {
  console.log(`User ${event.operation}: ${event.data.id}`)
})

// Synchronize data across apps
await memorai.syncData({
  table: 'projects',
  source: 'codai-app',
  target: 'admin-app',
  filters: { ownerId: currentUserId }
})

// Handle sync conflicts
memorai.onSyncConflict((conflict) => {
  // Custom conflict resolution logic
  return conflict.resolveWithServerVersion()
})
```

## 🛠️ Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/memorai"
DATABASE_TYPE="postgresql"

# Storage
STORAGE_PROVIDER="aws-s3"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket"
AWS_S3_REGION="us-east-1"

# Cache
CACHE_PROVIDER="redis"
REDIS_URL="redis://localhost:6379"

# AI Services
OPENAI_API_KEY="your-openai-key"
PINECONE_API_KEY="your-pinecone-key"
PINECONE_ENVIRONMENT="your-pinecone-env"

# Analytics
ANALYTICS_ENABLED="true"
ANALYTICS_ENDPOINT="https://analytics.codai.ro"
```

### Configuration Object

```typescript
import { MemoraiConfig } from '@codai/memorai'

const config: MemoraiConfig = {
  database: {
    type: 'postgresql',
    url: process.env.DATABASE_URL!,
    pool: { min: 2, max: 10 },
    migrations: { directory: './migrations' }
  },
  storage: {
    provider: 'aws-s3',
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      bucket: process.env.AWS_S3_BUCKET!,
      region: process.env.AWS_S3_REGION!
    },
    local: {
      basePath: './uploads'
    }
  },
  memory: {
    provider: 'pinecone',
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
      indexName: 'memorai-index'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'text-embedding-3-small'
    }
  },
  cache: {
    provider: 'redis',
    redis: {
      url: process.env.REDIS_URL!,
      retryAttempts: 3,
      connectTimeout: 5000
    },
    memory: {
      maxSize: 100 * 1024 * 1024 // 100MB
    }
  },
  sync: {
    enabled: true,
    conflictResolution: 'last-write-wins',
    batchSize: 100,
    retryAttempts: 3
  },
  analytics: {
    enabled: true,
    endpoint: process.env.ANALYTICS_ENDPOINT,
    bufferSize: 50,
    flushInterval: 5000
  }
}
```

## 📚 Integration with CODAI Ecosystem

MEMORAI integrates seamlessly with the CODAI ecosystem through the `@codai/shared-services` package:

```typescript
import { memoryService } from '@codai/shared-services'

// Uses @codai/memorai if available, falls back to API
const data = await memoryService.find('users', { active: true })
const file = await memoryService.uploadFile(buffer, 'image.jpg', userId)
const cached = await memoryService.cacheGet('user:profile:123')
```

### Supported Applications

MEMORAI provides universal data services for all CODAI ecosystem applications:

- **CODAI Platform**: Project management and code generation
- **ADMIN**: Administrative dashboard and user management
- **MEMORAI**: AI memory management and knowledge graphs
- **BANCAI**: Financial services and transaction processing
- **CUMPARAI**: E-commerce and product management
- **FABRICAI**: Content creation and document management
- **ROMAI**: Romanian market intelligence and localization
- **And 25+ more applications**

## 🔧 Advanced Usage

### Custom Storage Providers

```typescript
import { StorageProvider } from '@codai/memorai'

class CustomStorageProvider extends StorageProvider {
  async uploadFile(file: Buffer, filename: string): Promise<string> {
    // Custom upload logic
  }
  
  async downloadFile(fileId: string): Promise<Buffer> {
    // Custom download logic
  }
}

// Register custom provider
memorai.registerStorageProvider('custom', new CustomStorageProvider())
```

### Database Migrations

```typescript
// Create migration
await memorai.createMigration('add-user-preferences', {
  up: async (db) => {
    await db.schema.createTable('user_preferences', (table) => {
      table.increments('id')
      table.integer('userId').references('users.id')
      table.json('preferences')
      table.timestamps()
    })
  },
  down: async (db) => {
    await db.schema.dropTable('user_preferences')
  }
})

// Run migrations
await memorai.runMigrations()
```

### Performance Monitoring

```typescript
// Monitor performance
memorai.onMetric((metric) => {
  console.log(`${metric.name}: ${metric.value}${metric.unit}`)
})

// Get performance stats
const stats = await memorai.getPerformanceStats()
console.log({
  averageQueryTime: stats.database.averageQueryTime,
  cacheHitRate: stats.cache.hitRate,
  storageUsage: stats.storage.totalUsed
})
```

## 🔍 API Reference

### MemoraiService

The main service class that orchestrates all MEMORAI functionality.

#### Constructor
```typescript
constructor(config: MemoraiConfig)
```

#### Methods

##### Database Operations
- `insert(table: string, data: Record<string, any>): Promise<any>`
- `find(table: string, conditions?: Record<string, any>): Promise<any[]>`
- `update(table: string, id: string, data: Record<string, any>): Promise<any>`
- `delete(table: string, id: string): Promise<void>`
- `query(query: DatabaseQuery): Promise<any[]>`

##### File Storage
- `uploadFile(buffer: Buffer, filename: string, userId?: string, options?: UploadOptions): Promise<StorageFile>`
- `downloadFile(fileId: string, userId?: string): Promise<Buffer>`
- `deleteFile(fileId: string, userId?: string): Promise<void>`
- `listFiles(userId?: string, options?: ListOptions): Promise<StorageFile[]>`

##### Memory Management
- `storeMemory(memory: Partial<Memory>): Promise<Memory>`
- `searchMemories(query: MemoryQuery): Promise<Memory[]>`
- `getMemoryInsights(userId?: string, options?: InsightOptions): Promise<MemoryInsights>`

##### Caching
- `cacheSet(key: string, value: any, options?: CacheOptions): Promise<void>`
- `cacheGet(key: string): Promise<any>`
- `cacheDel(key: string): Promise<void>`

##### Health & Monitoring
- `getHealth(): Promise<HealthStatus>`
- `getMetrics(): Promise<ServiceMetrics>`

## 📖 Examples

See the [examples directory](./examples) for complete integration examples:

- [Basic Setup](./examples/basic-setup.ts)
- [E-commerce Integration](./examples/ecommerce.ts)
- [Content Management](./examples/content-management.ts)
- [AI Memory System](./examples/ai-memory.ts)
- [Real-time Sync](./examples/realtime-sync.ts)

## 🤝 Contributing

MEMORAI is part of the CODAI ecosystem. For contributions, please:

1. Follow the [CODAI Development Guidelines](../../../docs/development-guidelines.md)
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Ensure TypeScript compilation passes
5. Test integration with ecosystem applications

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🆘 Support

For support and questions:

- 📧 Email: support@codai.ro
- 🐛 Issues: [GitHub Issues](https://github.com/CODAI-Inc/codai-project/issues)
- 📖 Documentation: [CODAI Docs](https://docs.codai.ro)

---

**MEMORAI** - *The Universal Data Foundation for Intelligent Applications*
