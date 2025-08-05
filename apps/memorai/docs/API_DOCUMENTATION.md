# MemorAI API Documentation

## Overview
The MemorAI API provides comprehensive memory management capabilities with advanced search, analytics, and performance monitoring features.

**Base URL**: `http://localhost:4006/api`
**Authentication**: NextAuth.js with CODAI provider
**Content Type**: `application/json`

## Core API Endpoints

### Memory Management

#### GET /api/memories
Retrieve all memories with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `category` (optional): Filter by category
- `tag` (optional): Filter by tag

**Response:**
```json
{
  "memories": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "category": "string",
      "tags": ["string"],
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601",
      "userId": "string",
      "metadata": {}
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### POST /api/memories
Create a new memory.

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "category": "string",
  "tags": ["string"],
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "memory": {
    "id": "string",
    "title": "string",
    "content": "string",
    "category": "string",
    "tags": ["string"],
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "userId": "string",
    "metadata": {}
  }
}
```

#### PUT /api/memories/[id]
Update an existing memory.

**Parameters:**
- `id`: Memory ID

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "category": "string",
  "tags": ["string"],
  "metadata": {}
}
```

#### DELETE /api/memories/[id]
Delete a memory.

**Parameters:**
- `id`: Memory ID

**Response:**
```json
{
  "success": true,
  "message": "Memory deleted successfully"
}
```

### Search API

#### POST /api/search/exact
Exact text search with precise matching.

**Request Body:**
```json
{
  "query": "string",
  "limit": 10,
  "offset": 0
}
```

#### POST /api/search/fulltext
Full-text search with advanced text analysis.

**Request Body:**
```json
{
  "query": "string",
  "limit": 10,
  "offset": 0,
  "options": {
    "includeContent": true,
    "includeMetadata": false
  }
}
```

#### POST /api/search/semantic
Semantic search using vector embeddings.

**Request Body:**
```json
{
  "query": "string",
  "limit": 10,
  "threshold": 0.7
}
```

#### POST /api/search/fuzzy
Fuzzy search with typo tolerance.

**Request Body:**
```json
{
  "query": "string",
  "limit": 10,
  "maxDistance": 2
}
```

**Search Response Format:**
```json
{
  "results": [
    {
      "memory": {
        "id": "string",
        "title": "string",
        "content": "string",
        "category": "string",
        "tags": ["string"],
        "createdAt": "ISO8601"
      },
      "score": 0.95,
      "matchType": "exact|fuzzy|semantic|fulltext",
      "highlights": ["matched text"]
    }
  ],
  "total": 25,
  "searchTime": 45,
  "algorithm": "exact|fuzzy|semantic|fulltext"
}
```

### Categories API

#### GET /api/categories
Get all available categories with memory counts.

**Response:**
```json
{
  "categories": [
    {
      "name": "Work",
      "count": 15,
      "color": "#3B82F6"
    },
    {
      "name": "Personal",
      "count": 8,
      "color": "#10B981"
    }
  ]
}
```

### Analytics API

#### GET /api/analytics
Get comprehensive memory analytics.

**Response:**
```json
{
  "overview": {
    "totalMemories": 50,
    "totalCategories": 5,
    "totalTags": 25,
    "avgMemoryLength": 150
  },
  "categoryDistribution": [
    {
      "category": "Work",
      "count": 15,
      "percentage": 30
    }
  ],
  "tagFrequency": [
    {
      "tag": "important",
      "count": 10,
      "percentage": 20
    }
  ],
  "temporalData": [
    {
      "date": "2024-01-01",
      "count": 5
    }
  ],
  "searchPatterns": [
    {
      "query": "project",
      "count": 8,
      "avgScore": 0.85
    }
  ],
  "performance": {
    "avgSearchTime": 45,
    "avgResponseTime": 120,
    "cacheHitRate": 0.85
  }
}
```

### Performance API

#### GET /api/performance
Get real-time performance metrics.

**Response:**
```json
{
  "timestamp": "ISO8601",
  "metrics": {
    "responseTime": {
      "current": 45,
      "average": 52,
      "p95": 89,
      "p99": 156
    },
    "throughput": {
      "current": 15.5,
      "average": 12.8
    },
    "memory": {
      "used": 512,
      "total": 1024,
      "percentage": 50
    },
    "cpu": {
      "percentage": 25.5
    },
    "errors": {
      "rate": 0.01,
      "count": 2
    }
  },
  "health": "good|warning|critical"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Error Codes:**
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **Standard endpoints**: 100 requests per minute
- **Search endpoints**: 30 requests per minute
- **Analytics endpoints**: 20 requests per minute
- **Performance endpoints**: 60 requests per minute

## Authentication

### Session-based Authentication
The API uses NextAuth.js with session-based authentication. Include the session cookie in requests.

### API Key Authentication (Future)
```http
Authorization: Bearer your-api-key
```

## WebSocket API

### Connection
```javascript
const socket = io('http://localhost:4006');
```

### Events

#### Memory Events
- `memory:created` - New memory created
- `memory:updated` - Memory updated
- `memory:deleted` - Memory deleted

#### Collaboration Events
- `user:joined` - User joined session
- `user:left` - User left session
- `cursor:move` - User cursor movement

#### Performance Events
- `performance:alert` - Performance threshold exceeded
- `performance:update` - Real-time metrics update

## SDK Usage Examples

### JavaScript/TypeScript
```javascript
// Create memory
const memory = await fetch('/api/memories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Meeting Notes',
    content: 'Discussed Q4 goals...',
    category: 'Work',
    tags: ['meeting', 'goals']
  })
});

// Search memories
const results = await fetch('/api/search/semantic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'project deadlines',
    limit: 10
  })
});
```

### cURL Examples
```bash
# Create memory
curl -X POST http://localhost:4006/api/memories \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Important Note",
    "content": "Remember to...",
    "category": "Personal",
    "tags": ["reminder"]
  }'

# Search memories
curl -X POST http://localhost:4006/api/search/fuzzy \
  -H "Content-Type: application/json" \
  -d '{
    "query": "projct deadlins",
    "limit": 5,
    "maxDistance": 2
  }'
```

## Performance Considerations

### Caching
- **Memory cache**: 96% hit rate for frequently accessed memories
- **Search cache**: Results cached for 5 minutes
- **Analytics cache**: Metrics cached for 1 minute

### Optimization
- **Vector search**: Optimized with FAISS indexing
- **Full-text search**: Elasticsearch-compatible indexing
- **Database queries**: Optimized with proper indexing

### Monitoring
- **Response times**: Average < 100ms
- **Error rates**: < 1%
- **Uptime**: > 99.9%

## Changelog

### v1.0.0 (Current)
- Complete memory management API
- Multi-algorithm search system
- Real-time analytics dashboard
- Performance monitoring
- WebSocket collaboration
- Security validation framework
