# MemorAI Platform API Documentation

## Overview

The MemorAI Platform provides a comprehensive set of APIs for memory management, monitoring, and observability. This documentation covers all available endpoints, authentication methods, and integration examples.

**Base URLs:**
- MemorAI MCP Server: `http://localhost:4950`
- CBD Database: `http://localhost:4180`
- MemorAI App: `http://localhost:4006`
- GraphQL Server: `http://localhost:4500`

## Authentication

All API endpoints use Bearer token authentication:

```bash
curl -H "Authorization: Bearer memorai-dev-key-2025" \
     https://api.memorai.com/v1/memories
```

## Core APIs

### 1. Memory Management API

#### Store Memory
**POST** `/api/v1/memories`

Store a new memory with metadata and vector embeddings.

**Request:**
```json
{
  "agentId": "github-copilot",
  "content": "User prefers TypeScript over JavaScript for new projects",
  "metadata": {
    "entityType": "user_preference",
    "priority": "high",
    "project": "codai-project",
    "tags": ["typescript", "preference", "development"]
  }
}
```

**Response:**
```json
{
  "id": "mem_1234567890",
  "agentId": "github-copilot",
  "content": "User prefers TypeScript over JavaScript for new projects",
  "metadata": {
    "entityType": "user_preference",
    "priority": "high",
    "project": "codai-project",
    "tags": ["typescript", "preference", "development"]
  },
  "structuredKey": "user_preference_typescript_1234567890",
  "embedding": [0.123, 0.456, ...],
  "createdAt": "2025-01-20T10:30:00Z",
  "updatedAt": "2025-01-20T10:30:00Z"
}
```

#### Search Memories
**POST** `/api/v1/memories/search`

Search memories using hybrid search (vector + keyword + fuzzy matching).

**Request:**
```json
{
  "agentId": "github-copilot",
  "query": "TypeScript project preferences",
  "limit": 10,
  "minRelevanceScore": 0.7,
  "filters": {
    "project": "codai-project",
    "entityType": "user_preference"
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "memory": {
        "id": "mem_1234567890",
        "content": "User prefers TypeScript over JavaScript for new projects",
        "metadata": { /* ... */ },
        "structuredKey": "user_preference_typescript_1234567890",
        "createdAt": "2025-01-20T10:30:00Z"
      },
      "relevanceScore": 0.95,
      "searchType": "vector",
      "explanation": "High semantic similarity to query"
    }
  ],
  "totalCount": 1,
  "searchDuration": 15,
  "cacheHit": false
}
```

#### Get Memory by ID
**GET** `/api/v1/memories/{memoryId}`

**Response:**
```json
{
  "id": "mem_1234567890",
  "agentId": "github-copilot",
  "content": "User prefers TypeScript over JavaScript for new projects",
  "metadata": { /* ... */ },
  "structuredKey": "user_preference_typescript_1234567890",
  "createdAt": "2025-01-20T10:30:00Z",
  "updatedAt": "2025-01-20T10:30:00Z"
}
```

#### Delete Memory
**DELETE** `/api/v1/memories/{memoryId}`

**Response:**
```json
{
  "success": true,
  "message": "Memory deleted successfully",
  "deletedId": "mem_1234567890"
}
```

#### Get Agent Context
**GET** `/api/v1/memories/context/{agentId}`

Get recent context for an agent with intelligent summarization.

**Query Parameters:**
- `contextSize`: Number of recent memories (default: 5)
- `includeMetadata`: Include full metadata (default: true)

**Response:**
```json
{
  "agentId": "github-copilot",
  "contextSize": 5,
  "memories": [
    {
      "content": "User prefers TypeScript over JavaScript",
      "relevanceScore": 0.95,
      "age": "2 hours ago",
      "importance": "high"
    }
  ],
  "summary": "Recent context shows user preference for TypeScript in development projects.",
  "totalMemories": 156,
  "lastActivity": "2025-01-20T10:30:00Z"
}
```

### 2. Health and Monitoring API

#### Health Check
**GET** `/health`

Basic health status for all services.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:30:00Z",
  "uptime": 86400,
  "version": "2.0.0-enterprise-rust",
  "services": [
    {
      "name": "cbd-database",
      "status": "healthy",
      "responseTime": 12,
      "lastCheck": "2025-01-20T10:29:55Z"
    },
    {
      "name": "memorai-mcp",
      "status": "healthy",
      "responseTime": 8,
      "lastCheck": "2025-01-20T10:29:55Z"
    }
  ]
}
```

#### Detailed Health Check
**GET** `/health/detailed`

Comprehensive health information including system metrics.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:30:00Z",
  "uptime": 86400,
  "version": "2.0.0-enterprise-rust",
  "services": [/* ... */],
  "system": {
    "cpu": {
      "usage": 15.2,
      "cores": 8
    },
    "memory": {
      "usage": 65.8,
      "total": 16777216000,
      "free": 5726044160
    },
    "disk": {
      "usage": 45.2,
      "total": 1000000000000,
      "free": 548000000000
    }
  },
  "performance": {
    "averageResponseTime": 25,
    "errorRate": 0.1,
    "requestCount": 15420
  },
  "alerts": {
    "active": 0,
    "critical": 0,
    "warnings": 0
  }
}
```

#### Readiness Check
**GET** `/ready`

Kubernetes-style readiness probe.

**Response:**
```json
{
  "ready": true,
  "timestamp": "2025-01-20T10:30:00Z",
  "status": "healthy",
  "services": [
    {
      "name": "cbd-database",
      "ready": true
    }
  ]
}
```

#### Liveness Check
**GET** `/live`

Kubernetes-style liveness probe.

**Response:**
```json
{
  "alive": true,
  "timestamp": "2025-01-20T10:30:00Z",
  "uptime": 86400,
  "pid": 12345
}
```

### 3. Performance Metrics API

#### Get Performance Metrics
**GET** `/api/v1/metrics`

Get comprehensive performance metrics.

**Response:**
```json
{
  "timestamp": "2025-01-20T10:30:00Z",
  "api": {
    "totalRequests": 15420,
    "averageResponseTime": 25,
    "p95ResponseTime": 45,
    "p99ResponseTime": 78,
    "errorRate": 0.1,
    "requestsPerSecond": 12.5
  },
  "database": {
    "totalQueries": 45230,
    "averageQueryTime": 8,
    "cacheHitRate": 85.2,
    "activeConnections": 12,
    "slowQueries": 3
  },
  "system": {
    "cpuUsage": 15.2,
    "memoryUsage": 65.8,
    "diskUsage": 45.2,
    "networkIn": 1024000,
    "networkOut": 768000
  }
}
```

#### Get Prometheus Metrics
**GET** `/metrics`

Prometheus-formatted metrics for monitoring systems.

**Response:**
```
# HELP memorai_cpu_usage CPU usage percentage
# TYPE memorai_cpu_usage gauge
memorai_cpu_usage 15.2

# HELP memorai_memory_usage Memory usage percentage
# TYPE memorai_memory_usage gauge
memorai_memory_usage 65.8

# HELP memorai_request_duration_seconds Request duration in seconds
# TYPE memorai_request_duration_seconds histogram
memorai_request_duration_seconds_bucket{le="0.1"} 12450
memorai_request_duration_seconds_bucket{le="0.5"} 14890
memorai_request_duration_seconds_bucket{le="1.0"} 15380
memorai_request_duration_seconds_bucket{le="+Inf"} 15420
memorai_request_duration_seconds_sum 385.75
memorai_request_duration_seconds_count 15420
```

### 4. Alert Management API

#### Get Active Alerts
**GET** `/api/v1/alerts`

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert_1234567890",
      "level": "warning",
      "title": "High CPU Usage",
      "description": "CPU usage is 82.5%",
      "service": "SystemMonitor",
      "timestamp": "2025-01-20T10:25:00Z",
      "resolved": false,
      "metadata": {
        "cpuUsage": 82.5
      }
    }
  ],
  "totalActive": 1,
  "lastUpdate": "2025-01-20T10:25:00Z"
}
```

#### Create Custom Alert
**POST** `/api/v1/alerts`

**Request:**
```json
{
  "level": "warning",
  "title": "Custom Alert",
  "description": "Custom alert description",
  "service": "UserService",
  "metadata": {
    "customData": "value"
  }
}
```

**Response:**
```json
{
  "id": "alert_1234567891",
  "level": "warning",
  "title": "Custom Alert",
  "description": "Custom alert description",
  "service": "UserService",
  "timestamp": "2025-01-20T10:30:00Z",
  "resolved": false,
  "metadata": {
    "customData": "value"
  }
}
```

#### Resolve Alert
**POST** `/api/v1/alerts/{alertId}/resolve`

**Response:**
```json
{
  "success": true,
  "alertId": "alert_1234567890",
  "resolvedAt": "2025-01-20T10:30:00Z",
  "duration": 300000
}
```

### 5. Database API (CBD)

#### Get Database Status
**GET** `/api/v1/database/status`

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.10",
  "uptime": 86400,
  "connections": {
    "active": 12,
    "idle": 8,
    "total": 20
  },
  "queries": {
    "total": 45230,
    "slow": 3,
    "failed": 2
  },
  "cache": {
    "hitRate": 85.2,
    "size": "256MB",
    "entries": 15420
  }
}
```

#### Execute Database Query
**POST** `/api/v1/database/query`

**Request:**
```json
{
  "query": "SELECT * FROM memories WHERE agent_id = $1 LIMIT 10",
  "params": ["github-copilot"],
  "options": {
    "useCache": true,
    "cacheTTL": 300
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "mem_1234567890",
      "agent_id": "github-copilot",
      "content": "User prefers TypeScript",
      "created_at": "2025-01-20T10:30:00Z"
    }
  ],
  "rowCount": 1,
  "executionTime": 8,
  "fromCache": false
}
```

## GraphQL API

### Endpoint
**POST** `/graphql`

### Schema Overview

```graphql
type Query {
  # Memory operations
  memory(id: ID!): Memory
  memories(agentId: String!, limit: Int, offset: Int): [Memory!]!
  searchMemories(input: SearchInput!): SearchResult!
  
  # Health and monitoring
  health: HealthStatus!
  metrics: SystemMetrics!
  alerts: [Alert!]!
  
  # Database operations
  databaseStatus: DatabaseStatus!
}

type Mutation {
  # Memory operations
  createMemory(input: CreateMemoryInput!): Memory!
  updateMemory(id: ID!, input: UpdateMemoryInput!): Memory!
  deleteMemory(id: ID!): Boolean!
  
  # Alert operations
  createAlert(input: CreateAlertInput!): Alert!
  resolveAlert(id: ID!): Boolean!
}

type Subscription {
  # Real-time updates
  memoryCreated(agentId: String): Memory!
  alertCreated: Alert!
  healthStatusChanged: HealthStatus!
  metricsUpdated: SystemMetrics!
}
```

### Example Queries

#### Search Memories
```graphql
query SearchMemories($agentId: String!, $query: String!) {
  searchMemories(input: {
    agentId: $agentId
    query: $query
    limit: 10
    minRelevanceScore: 0.7
  }) {
    results {
      memory {
        id
        content
        metadata
        createdAt
      }
      relevanceScore
      searchType
    }
    totalCount
    searchDuration
  }
}
```

#### Create Memory
```graphql
mutation CreateMemory($input: CreateMemoryInput!) {
  createMemory(input: $input) {
    id
    content
    structuredKey
    createdAt
  }
}
```

#### Subscribe to Alerts
```graphql
subscription AlertCreated {
  alertCreated {
    id
    level
    title
    description
    service
    timestamp
  }
}
```

## WebSocket API

### Connection
**WS** `/ws`

### Authentication
```javascript
const ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'memorai-dev-key-2025'
  }));
};
```

### Real-time Events

#### Alert Events
```json
{
  "type": "alert",
  "data": {
    "id": "alert_1234567890",
    "level": "warning",
    "title": "High CPU Usage",
    "description": "CPU usage is 82.5%",
    "service": "SystemMonitor",
    "timestamp": "2025-01-20T10:25:00Z"
  }
}
```

#### Memory Events
```json
{
  "type": "memory",
  "action": "created",
  "data": {
    "id": "mem_1234567890",
    "agentId": "github-copilot",
    "content": "New memory created",
    "timestamp": "2025-01-20T10:30:00Z"
  }
}
```

#### Health Status Events
```json
{
  "type": "health",
  "data": {
    "overall": "healthy",
    "services": [
      {
        "name": "cbd-database",
        "status": "healthy",
        "responseTime": 12
      }
    ],
    "timestamp": "2025-01-20T10:30:00Z"
  }
}
```

## SDK Integration Examples

### Node.js SDK

```javascript
import { MemorAIClient } from '@memorai/sdk';

const client = new MemorAIClient({
  baseUrl: 'http://localhost:4950',
  apiKey: 'memorai-dev-key-2025'
});

// Store memory
const memory = await client.memories.create({
  agentId: 'github-copilot',
  content: 'User prefers TypeScript over JavaScript',
  metadata: {
    entityType: 'user_preference',
    priority: 'high'
  }
});

// Search memories
const results = await client.memories.search({
  agentId: 'github-copilot',
  query: 'TypeScript preferences',
  limit: 10
});

// Real-time alerts
client.alerts.onAlert((alert) => {
  console.log('New alert:', alert);
});
```

### Python SDK

```python
from memorai import MemorAIClient

client = MemorAIClient(
    base_url='http://localhost:4950',
    api_key='memorai-dev-key-2025'
)

# Store memory
memory = client.memories.create(
    agent_id='github-copilot',
    content='User prefers TypeScript over JavaScript',
    metadata={
        'entity_type': 'user_preference',
        'priority': 'high'
    }
)

# Search memories
results = client.memories.search(
    agent_id='github-copilot',
    query='TypeScript preferences',
    limit=10
)

# Health monitoring
health = client.health.get_status()
print(f"System status: {health.status}")
```

### React Hooks

```jsx
import { useMemorAI } from '@memorai/react';

function MemoryComponent() {
  const { memories, createMemory, isLoading } = useMemorAI({
    agentId: 'github-copilot'
  });

  const handleCreateMemory = async () => {
    await createMemory({
      content: 'User interaction logged',
      metadata: {
        entityType: 'user_interaction',
        component: 'MemoryComponent'
      }
    });
  };

  return (
    <div>
      <button onClick={handleCreateMemory}>
        Store Memory
      </button>
      {memories.map(memory => (
        <div key={memory.id}>
          {memory.content}
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "agentId",
      "reason": "Required field missing"
    },
    "timestamp": "2025-01-20T10:30:00Z",
    "requestId": "req_1234567890"
  }
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid request parameters | 400 |
| `AUTHENTICATION_ERROR` | Invalid or missing API key | 401 |
| `PERMISSION_DENIED` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable | 503 |

## Rate Limiting

All APIs are rate-limited to ensure system stability:

- **Memory API**: 1000 requests/minute per API key
- **Search API**: 100 requests/minute per API key
- **Health API**: No limit (monitoring purposes)
- **Alert API**: 50 requests/minute per API key

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642679400
```

## Deployment and Configuration

### Environment Variables

```bash
# MemorAI MCP Server
MEMORAI_API_KEY=memorai-dev-key-2025
MEMORAI_MCP_PORT=4950
CBD_BASE_URL=http://localhost:4180
NODE_ENV=production

# CBD Database
PORT=4180
CBD_LOG_LEVEL=info

# Monitoring
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@memorai.com
SMTP_PASS=your-password
WEBHOOK_URL=https://hooks.slack.com/your-webhook
WEBSOCKET_PORT=8080

# Azure OpenAI (for embeddings)
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=text-embedding-3-large
```

### Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'
services:
  memorai-mcp:
    image: memorai/mcp-server:latest
    ports:
      - "4950:4950"
    environment:
      - MEMORAI_API_KEY=memorai-dev-key-2025
      - CBD_BASE_URL=http://cbd:4180
    depends_on:
      - cbd

  cbd:
    image: memorai/cbd:latest
    ports:
      - "4180:4180"
    environment:
      - NODE_ENV=production
    volumes:
      - cbd_data:/app/data

volumes:
  cbd_data:
```

### Kubernetes Deployment

```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: memorai-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: memorai-platform
  template:
    metadata:
      labels:
        app: memorai-platform
    spec:
      containers:
      - name: memorai-mcp
        image: memorai/mcp-server:latest
        ports:
        - containerPort: 4950
        env:
        - name: MEMORAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: memorai-secrets
              key: api-key
        livenessProbe:
          httpGet:
            path: /live
            port: 4950
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 4950
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Testing

### Health Check Test
```bash
curl -f http://localhost:4950/health || exit 1
```

### API Integration Test
```bash
# Store memory
curl -X POST http://localhost:4950/api/v1/memories \
  -H "Authorization: Bearer memorai-dev-key-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "test-agent",
    "content": "Test memory content",
    "metadata": {"test": true}
  }'

# Search memories
curl -X POST http://localhost:4950/api/v1/memories/search \
  -H "Authorization: Bearer memorai-dev-key-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "test-agent",
    "query": "test content",
    "limit": 5
  }'
```

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 -H "Authorization: Bearer memorai-dev-key-2025" \
   http://localhost:4950/health

# Using wrk
wrk -t12 -c400 -d30s --header "Authorization: Bearer memorai-dev-key-2025" \
    http://localhost:4950/api/v1/metrics
```

## Support and Troubleshooting

### Common Issues

1. **Connection Refused**
   - Verify services are running: `curl http://localhost:4950/health`
   - Check port availability: `netstat -tulpn | grep 4950`

2. **Authentication Errors**
   - Verify API key is correct
   - Check Authorization header format: `Bearer token`

3. **Slow Response Times**
   - Check system metrics: `GET /api/v1/metrics`
   - Review database performance: `GET /api/v1/database/status`

4. **Memory Search Issues**
   - Verify embedding service is running
   - Check vector cache status
   - Review search parameters

### Debug Mode

Enable debug logging:
```bash
export DEBUG=memorai:*
export MEMORAI_LOG_LEVEL=debug
```

### Monitoring Dashboard

Access the monitoring dashboard at:
- Health: `http://localhost:4950/health/detailed`
- Metrics: `http://localhost:4950/metrics`
- Alerts: `http://localhost:4950/api/v1/alerts`

For additional support, contact: support@memorai.com
