# 🗄️ Universal Database & Storage Documentation

**Complete guide to the CODAI ecosystem's universal database and storage system powered by MEMORAI.**

## 📋 Overview

The CODAI ecosystem uses a centralized database and storage system where:
- **MEMORAI service** handles all database operations
- **PostgreSQL** provides ACID-compliant relational data storage
- **Redis** delivers high-performance caching and session management
- **File Storage** manages uploads, downloads, and media assets
- **@codai/memorai package** provides seamless database integration
- **Real-time sync** ensures data consistency across all applications

## 🏗️ Database Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │────│  MEMORAI API    │────│   PostgreSQL    │
│   (Any CODAI    │    │   Port 4002     │    │   (Primary DB)  │
│    Service)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ @codai/memorai  │    │     Redis       │    │  File Storage   │
│   Package       │    │   (Cache)       │    │   (S3/Local)    │
│   (Client SDK)  │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### For New Applications

1. **Install the MEMORAI package**:
```bash
npm install @codai/memorai
```

2. **Initialize the database client**:
```javascript
import { MemoraiClient } from '@codai/memorai';

const memorai = new MemoraiClient({
  apiUrl: process.env.MEMORAI_API_URL || 'http://localhost:4002',
  apiKey: process.env.MEMORAI_API_KEY,
  cache: true, // Enable Redis caching
  realTimeSync: true // Enable WebSocket sync
});
```

3. **Perform database operations**:
```javascript
// Create a record
const user = await memorai.users.create({
  name: 'John Doe',
  email: 'john@example.com',
  metadata: { source: 'registration' }
});

// Query records
const users = await memorai.users.findMany({
  where: { active: true },
  orderBy: { createdAt: 'desc' },
  limit: 10
});

// Update a record
const updatedUser = await memorai.users.update(user.id, {
  lastLogin: new Date(),
  loginCount: user.loginCount + 1
});
```

## 📊 Data Models

### Core Data Structure

```javascript
// Universal data structure for all CODAI entities
interface BaseEntity {
  id: string;           // UUID primary key
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last modification timestamp
  version: number;      // Optimistic locking version
  metadata: object;     // Flexible metadata storage
  tags: string[];       // Searchable tags
  userId?: string;      // Associated user (if applicable)
  organizationId?: string; // Multi-tenant support
}

// Example: User entity
interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  preferences: object;
  roles: string[];
  status: 'active' | 'inactive' | 'suspended';
}

// Example: Content entity (for FABRICAI, STUDIAI, etc.)
interface Content extends BaseEntity {
  title: string;
  body: string;
  type: 'article' | 'video' | 'course' | 'document';
  status: 'draft' | 'published' | 'archived';
  author: string;
  categories: string[];
  fileAttachments?: string[];
}
```

### Database Schema

```sql
-- Core tables structure
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    user_id UUID REFERENCES entities(id),
    organization_id UUID REFERENCES entities(id),
    tags TEXT[],
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(data->>'title', '') || ' ' || coalesce(data->>'body', ''))
    ) STORED
);

-- Indexes for performance
CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_user ON entities(user_id);
CREATE INDEX idx_entities_org ON entities(organization_id);
CREATE INDEX idx_entities_tags ON entities USING GIN(tags);
CREATE INDEX idx_entities_search ON entities USING GIN(search_vector);
CREATE INDEX idx_entities_created ON entities(created_at);

-- Relations table for entity relationships
CREATE TABLE entity_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    to_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(from_entity_id, to_entity_id, relation_type)
);

-- File storage metadata
CREATE TABLE file_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    entity_id UUID REFERENCES entities(id),
    uploaded_by UUID REFERENCES entities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);
```

## 🔧 MEMORAI Client SDK

### Basic Operations

```javascript
import { MemoraiClient } from '@codai/memorai';

const client = new MemoraiClient({
  apiUrl: 'http://localhost:4002',
  apiKey: process.env.MEMORAI_API_KEY
});

// Create entity
const entity = await client.create('users', {
  name: 'John Doe',
  email: 'john@example.com',
  preferences: { theme: 'dark', language: 'en' }
});

// Find entities
const users = await client.findMany('users', {
  where: { 
    status: 'active',
    tags: { contains: ['premium'] }
  },
  orderBy: { createdAt: 'desc' },
  limit: 20,
  offset: 0
});

// Update entity
const updated = await client.update('users', entity.id, {
  lastLogin: new Date(),
  preferences: { ...entity.preferences, theme: 'light' }
});

// Delete entity
await client.delete('users', entity.id);

// Advanced search
const searchResults = await client.search('users', {
  query: 'john premium user',
  entityTypes: ['users'],
  filters: { status: 'active' },
  limit: 10
});
```

### Relationship Management

```javascript
// Create relationships between entities
await client.createRelation(userId, courseId, 'enrolled', {
  enrolledAt: new Date(),
  progress: 0
});

// Find related entities
const userCourses = await client.findRelated(userId, 'enrolled', {
  targetType: 'courses',
  includeMetadata: true
});

// Update relationship metadata
await client.updateRelation(userId, courseId, 'enrolled', {
  progress: 45,
  lastAccessedAt: new Date()
});

// Delete relationship
await client.deleteRelation(userId, courseId, 'enrolled');
```

### Batch Operations

```javascript
// Batch create
const newUsers = await client.batchCreate('users', [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' }
]);

// Batch update
const updates = users.map(user => ({
  id: user.id,
  data: { lastNotifiedAt: new Date() }
}));
await client.batchUpdate('users', updates);

// Batch delete
await client.batchDelete('users', userIds);
```

## 📁 File Storage

### Upload Files

```javascript
// Upload single file
const fileUpload = await client.files.upload(file, {
  entityId: userId,
  entityType: 'users',
  field: 'avatar',
  metadata: { purpose: 'profile_picture' }
});

// Upload multiple files
const files = await client.files.uploadMultiple(fileList, {
  entityId: projectId,
  entityType: 'projects',
  field: 'attachments'
});

// Upload with progress tracking
const upload = client.files.upload(largeFile, {
  onProgress: (progress) => {
    console.log(`Upload progress: ${progress}%`);
  }
});
```

### Download Files

```javascript
// Download file by ID
const fileStream = await client.files.download(fileId);

// Get file metadata
const metadata = await client.files.getMetadata(fileId);

// Generate signed URL for direct access
const signedUrl = await client.files.getSignedUrl(fileId, {
  expiresIn: '1h',
  action: 'read'
});

// Download file as buffer
const buffer = await client.files.downloadBuffer(fileId);
```

### File Management

```javascript
// List files for an entity
const entityFiles = await client.files.listForEntity(entityId, {
  entityType: 'projects',
  field: 'attachments'
});

// Delete file
await client.files.delete(fileId);

// Update file metadata
await client.files.updateMetadata(fileId, {
  description: 'Updated project document',
  tags: ['important', 'v2.0']
});
```

## ⚡ Caching Strategy

### Redis Cache Integration

```javascript
// Enable caching for queries
const users = await client.findMany('users', {
  where: { status: 'active' },
  cache: {
    ttl: 300, // 5 minutes
    key: 'active_users',
    invalidateOn: ['users:create', 'users:update', 'users:delete']
  }
});

// Manual cache operations
await client.cache.set('user_stats', statistics, 3600); // 1 hour TTL
const stats = await client.cache.get('user_stats');
await client.cache.delete('user_stats');

// Cache invalidation
await client.cache.invalidate(['users:*', 'stats:*']);
```

### Cache Strategies

```javascript
// Write-through cache
await client.update('users', userId, userData, {
  cache: { strategy: 'write-through' }
});

// Write-behind cache
await client.create('logs', logEntry, {
  cache: { strategy: 'write-behind', delay: 5000 }
});

// Cache warming
await client.cache.warm([
  { type: 'users', query: { status: 'active' } },
  { type: 'courses', query: { featured: true } }
]);
```

## 🔄 Real-Time Synchronization

### WebSocket Events

```javascript
// Subscribe to entity changes
client.subscribe('users', {
  events: ['create', 'update', 'delete'],
  filter: { organizationId: currentOrgId },
  callback: (event) => {
    console.log('User event:', event);
    // Update UI accordingly
  }
});

// Subscribe to specific entity
client.subscribeToEntity(userId, {
  events: ['update'],
  callback: (event) => {
    console.log('User updated:', event.data);
  }
});

// Unsubscribe
client.unsubscribe('users');
client.unsubscribeFromEntity(userId);
```

### Real-Time Queries

```javascript
// Live query that updates automatically
const liveQuery = client.createLiveQuery('users', {
  where: { status: 'online' },
  orderBy: { lastActive: 'desc' }
});

liveQuery.on('change', (results) => {
  console.log('Online users updated:', results);
});

liveQuery.on('error', (error) => {
  console.error('Live query error:', error);
});

// Stop live query
liveQuery.stop();
```

## 🔧 Configuration

### Environment Variables

```bash
# MEMORAI Service Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/codai_memorai
REDIS_URL=redis://localhost:6379
MEMORAI_API_KEY=your-secure-api-key

# File Storage Configuration
FILE_STORAGE_TYPE=s3  # or 'local'
AWS_S3_BUCKET=codai-files
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Local file storage (if FILE_STORAGE_TYPE=local)
LOCAL_STORAGE_PATH=/var/codai/uploads
LOCAL_STORAGE_URL_PREFIX=https://files.codai.ro

# Performance Configuration
CONNECTION_POOL_SIZE=20
QUERY_TIMEOUT=30000
CACHE_DEFAULT_TTL=300
MAX_FILE_SIZE=100MB
```

### Database Configuration

```javascript
// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'codai_memorai',
  username: process.env.DB_USER || 'codai',
  password: process.env.DB_PASS,
  pool: {
    min: 5,
    max: 20,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV === 'development'
};
```

## 🔌 API Endpoints

### MEMORAI Service Endpoints

#### Entity Operations

```http
POST /api/entities/{type}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "John Doe",
  "email": "john@example.com",
  "metadata": { "source": "api" }
}

Response:
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "entityType": "users",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "metadata": { "source": "api" }
  },
  "createdAt": "2025-07-19T12:00:00Z",
  "version": 1
}
```

```http
GET /api/entities/{type}
Authorization: Bearer <token>

Query Parameters:
- where: JSON filter conditions
- orderBy: Sorting specification  
- limit: Number of results (max 100)
- offset: Pagination offset
- include: Related entities to include

Response:
{
  "data": [...],
  "total": 250,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

#### Search Operations

```http
POST /api/search
Content-Type: application/json
Authorization: Bearer <token>

{
  "query": "john premium user",
  "entityTypes": ["users"],
  "filters": { "status": "active" },
  "limit": 10
}

Response:
{
  "results": [...],
  "total": 5,
  "query": "john premium user",
  "executionTime": 45
}
```

#### File Operations

```http
POST /api/files/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: <file>
- entityId: "123e4567..."
- entityType: "users"
- field: "avatar"
- metadata: {"purpose": "profile"}

Response:
{
  "id": "456e7890-e89b-12d3-a456-426614174000",
  "filename": "avatar_123.jpg",
  "originalName": "profile.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 245760,
  "url": "https://files.codai.ro/456e7890.jpg"
}
```

```http
GET /api/files/{fileId}
Authorization: Bearer <token>

Response: File stream with appropriate headers
```

## 🧪 Testing

### Unit Tests

```javascript
// tests/memorai.test.js
const { MemoraiClient } = require('@codai/memorai');

describe('MemoraiClient', () => {
  let client;
  
  beforeAll(() => {
    client = new MemoraiClient({
      apiUrl: 'http://localhost:4002',
      apiKey: process.env.TEST_API_KEY
    });
  });

  it('should create and retrieve entities', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com'
    };

    const user = await client.create('users', userData);
    expect(user.id).toBeDefined();
    expect(user.data.name).toBe(userData.name);

    const retrieved = await client.findOne('users', user.id);
    expect(retrieved.data.email).toBe(userData.email);
  });

  it('should handle relationships correctly', async () => {
    const user = await client.create('users', { name: 'User' });
    const course = await client.create('courses', { title: 'Course' });

    await client.createRelation(user.id, course.id, 'enrolled', {
      enrolledAt: new Date()
    });

    const related = await client.findRelated(user.id, 'enrolled');
    expect(related).toHaveLength(1);
    expect(related[0].id).toBe(course.id);
  });
});
```

### Integration Tests

```javascript
// tests/integration/database-flow.test.js
describe('Complete Database Flow', () => {
  it('should handle complete CRUD operations with caching', async () => {
    // Create
    const user = await client.create('users', {
      name: 'Integration Test User',
      email: 'integration@test.com'
    });

    // Read with caching
    const cached = await client.findOne('users', user.id, {
      cache: { ttl: 60 }
    });
    expect(cached.id).toBe(user.id);

    // Update
    const updated = await client.update('users', user.id, {
      name: 'Updated Name'
    });
    expect(updated.data.name).toBe('Updated Name');

    // Delete
    await client.delete('users', user.id);
    
    // Verify deletion
    const deleted = await client.findOne('users', user.id);
    expect(deleted).toBeNull();
  });
});
```

## 📊 Monitoring

### Performance Metrics

- **Query Response Time**: Average time for database queries
- **Cache Hit Rate**: Percentage of requests served from cache
- **File Upload/Download Speed**: Transfer rates for file operations
- **Connection Pool Usage**: Database connection utilization
- **Storage Usage**: Database and file storage consumption

### Health Check Endpoints

```http
GET /api/health
Response:
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "responseTime": 15,
    "activeConnections": 8
  },
  "cache": {
    "status": "connected",
    "memoryUsage": "45MB",
    "hitRate": 0.89
  },
  "fileStorage": {
    "status": "available",
    "freeSpace": "2.5TB"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Pool Exhaustion

**Problem**: "Pool is destroyed" or connection timeout errors
**Solution**: 
- Increase pool size
- Review query patterns for inefficient operations
- Implement proper connection cleanup

```javascript
// Monitor connection pool
client.on('connectionPoolStats', (stats) => {
  console.log('Pool stats:', {
    total: stats.total,
    used: stats.used,
    waiting: stats.waiting
  });
});
```

#### 2. Cache Miss Issues

**Problem**: High cache miss rates affecting performance
**Solution**:
- Review cache TTL settings
- Implement cache warming strategies  
- Optimize cache invalidation logic

#### 3. File Upload Failures

**Problem**: File uploads timing out or failing
**Solution**:
- Check file size limits
- Verify storage configuration
- Implement retry logic with exponential backoff

### Debugging Tools

```javascript
// Enable debug logging
process.env.DEBUG = 'codai:memorai';

// Query performance monitoring
client.on('query', (query) => {
  console.log('Query executed:', {
    sql: query.sql,
    duration: query.duration,
    rowCount: query.rowCount
  });
});

// Error tracking
client.on('error', (error) => {
  console.error('MEMORAI error:', error);
});
```

## 🚀 Performance Optimization

### Query Optimization

```javascript
// Use proper indexing
const users = await client.findMany('users', {
  where: { status: 'active' }, // Indexed field
  orderBy: { createdAt: 'desc' }, // Indexed field
  limit: 20 // Limit results
});

// Avoid N+1 queries with includes
const postsWithAuthors = await client.findMany('posts', {
  include: { author: true },
  where: { published: true }
});

// Use batch operations for multiple updates
await client.batchUpdate('users', updates);
```

### Caching Best Practices

```javascript
// Cache expensive queries
const popularPosts = await client.findMany('posts', {
  where: { featured: true },
  orderBy: { views: 'desc' },
  cache: { ttl: 3600, key: 'popular_posts' }
});

// Cache user sessions
await client.cache.set(`session:${userId}`, sessionData, 1800);
```

---

**Last Updated**: July 19, 2025  
**Database System Version**: 2.0.0  
**Status**: Production Ready ✅
