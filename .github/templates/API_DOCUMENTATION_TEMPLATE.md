# 🔌 [SERVICE_NAME] API DOCUMENTATION

**API Version**: v[X.Y.Z]  
**Base URL**: `https://api.codai.example.com/v1/[service]` (Production) | `https://staging-api.codai.example.com/v1/[service]` (Staging)  
**Status**: ✅ PRODUCTION READY | 🔧 DEVELOPMENT | ⚠️ MAINTENANCE  
**Authentication**: [Bearer Token | API Key | OAuth 2.0]  
**Rate Limits**: [X] requests per [time period]  
**Last Updated**: [Date]

---

## 🎯 API Overview

[2-3 sentences describing the API purpose, main functionality, and integration value]

### API Capabilities:
- ✅ [Primary capability 1]
- ✅ [Primary capability 2]
- ✅ [Primary capability 3]
- ✅ [Additional capabilities as needed]

### Endpoints Summary:
| Method | Endpoint | Description | Auth Required | Rate Limited |
|--------|----------|-------------|---------------|--------------|
| GET | `/health` | Health check | No | No |
| GET | `/[resource]` | List resources | Yes | Yes |
| POST | `/[resource]` | Create resource | Yes | Yes |
| GET | `/[resource]/{id}` | Get specific resource | Yes | Yes |
| PUT | `/[resource]/{id}` | Update resource | Yes | Yes |
| DELETE | `/[resource]/{id}` | Delete resource | Yes | Yes |

---

## 🔐 Authentication and Authorization

### Authentication Methods:

#### Bearer Token (Recommended)
```bash
curl -H "Authorization: Bearer [your-token]" \
     -H "Content-Type: application/json" \
     https://api.codai.example.com/v1/[service]/[endpoint]
```

#### API Key Authentication
```bash
curl -H "X-API-Key: [your-api-key]" \
     -H "Content-Type: application/json" \
     https://api.codai.example.com/v1/[service]/[endpoint]
```

#### OAuth 2.0 Flow (Enterprise)
```javascript
// OAuth 2.0 Authorization Code Flow
const authUrl = `https://auth.codai.example.com/oauth/authorize?
  client_id=[client-id]&
  redirect_uri=[redirect-uri]&
  response_type=code&
  scope=[required-scopes]`;

// Exchange code for token
const tokenResponse = await fetch('https://auth.codai.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: '[client-id]',
    client_secret: '[client-secret]',
    code: '[authorization-code]',
    redirect_uri: '[redirect-uri]'
  })
});
```

### Authorization Scopes:
| Scope | Description | Required For |
|-------|-------------|--------------|
| `[service]:read` | Read access to resources | GET endpoints |
| `[service]:write` | Create and update resources | POST, PUT endpoints |
| `[service]:delete` | Delete resources | DELETE endpoints |
| `[service]:admin` | Administrative access | Admin endpoints |

### Token Management:
```javascript
// Token validation
const validateToken = async (token) => {
  const response = await fetch('/auth/validate', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.ok;
};

// Token refresh
const refreshToken = async (refreshToken) => {
  const response = await fetch('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  return response.json();
};
```

---

## 📊 Rate Limiting and Quotas

### Rate Limits:
| Tier | Requests per Minute | Requests per Hour | Requests per Day |
|------|-------------------|-------------------|------------------|
| Free | [X] | [X] | [X] |
| Professional | [X] | [X] | [X] |
| Enterprise | [X] | [X] | [X] |

### Rate Limit Headers:
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
X-RateLimit-Retry-After: 60
```

### Rate Limit Handling:
```javascript
const makeAPICall = async (endpoint, options = {}) => {
  const response = await fetch(endpoint, options);
  
  // Check for rate limit
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('X-RateLimit-Retry-After'));
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
    return makeAPICall(endpoint, options); // Retry after waiting
  }
  
  return response;
};
```

### Quota Management:
```bash
# Check current quota usage
curl -H "Authorization: Bearer [token]" \
     https://api.codai.example.com/v1/quota

# Response
{
  "quota": {
    "limit": 10000,
    "used": 1250,
    "remaining": 8750,
    "reset_date": "2025-08-01T00:00:00Z"
  }
}
```

---

## 🔍 Core Endpoints

### Health and Status

#### `GET /health`
**Description**: Check API health and status

**Parameters**: None

**Request Example**:
```bash
curl https://api.codai.example.com/v1/[service]/health
```

**Success Response (200)**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-07-22T10:00:00Z",
  "uptime": "24h 15m 30s",
  "dependencies": {
    "database": "healthy",
    "cache": "healthy",
    "external_apis": "healthy"
  }
}
```

**Error Responses**:
```json
// Service Degraded (200 with warnings)
{
  "status": "degraded",
  "version": "1.0.0",
  "timestamp": "2025-07-22T10:00:00Z",
  "warnings": [
    "High response times detected",
    "External API slowness"
  ]
}

// Service Unhealthy (503)
{
  "status": "unhealthy", 
  "version": "1.0.0",
  "timestamp": "2025-07-22T10:00:00Z",
  "errors": [
    "Database connection failed",
    "Cache unavailable"
  ]
}
```

---

### Resource Management

#### `GET /[resource]`
**Description**: Retrieve a list of resources with filtering and pagination

**Parameters**:
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `limit` | integer | No | Number of results per page (1-100) | 20 |
| `offset` | integer | No | Number of results to skip | 0 |
| `sort` | string | No | Sort field and order (field:asc/desc) | created_at:desc |
| `filter` | string | No | Filter criteria (see filtering guide) | - |
| `fields` | string | No | Comma-separated fields to include | all |

**Request Examples**:
```bash
# Basic list request
curl -H "Authorization: Bearer [token]" \
     https://api.codai.example.com/v1/[service]/[resource]

# With pagination and sorting
curl -H "Authorization: Bearer [token]" \
     "https://api.codai.example.com/v1/[service]/[resource]?limit=50&offset=100&sort=name:asc"

# With filtering
curl -H "Authorization: Bearer [token]" \
     "https://api.codai.example.com/v1/[service]/[resource]?filter=status:active,created_at:>2025-01-01"

# With field selection
curl -H "Authorization: Bearer [token]" \
     "https://api.codai.example.com/v1/[service]/[resource]?fields=id,name,status,created_at"
```

**Success Response (200)**:
```json
{
  "data": [
    {
      "id": "12345",
      "name": "Example Resource",
      "status": "active",
      "created_at": "2025-07-22T10:00:00Z",
      "updated_at": "2025-07-22T10:00:00Z",
      "metadata": {
        "category": "example",
        "priority": "high"
      }
    }
  ],
  "pagination": {
    "total": 1500,
    "limit": 20,
    "offset": 0,
    "pages": 75,
    "current_page": 1,
    "has_next": true,
    "has_previous": false,
    "next_url": "/v1/[service]/[resource]?limit=20&offset=20",
    "previous_url": null
  },
  "meta": {
    "query_time": 0.045,
    "cached": false
  }
}
```

#### `POST /[resource]`
**Description**: Create a new resource

**Parameters**:
| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| `name` | string | Yes | Resource name | 3-100 characters |
| `description` | string | No | Resource description | Max 500 characters |
| `status` | string | No | Resource status | active/inactive/pending |
| `metadata` | object | No | Additional metadata | Max 10 key-value pairs |
| `tags` | array | No | Resource tags | Max 20 tags |

**Request Example**:
```bash
curl -X POST \
     -H "Authorization: Bearer [token]" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "New Resource",
       "description": "Description of the new resource",
       "status": "active",
       "metadata": {
         "category": "example",
         "priority": "high"
       },
       "tags": ["important", "example"]
     }' \
     https://api.codai.example.com/v1/[service]/[resource]
```

**Success Response (201)**:
```json
{
  "data": {
    "id": "67890",
    "name": "New Resource",
    "description": "Description of the new resource",
    "status": "active",
    "created_at": "2025-07-22T10:00:00Z",
    "updated_at": "2025-07-22T10:00:00Z",
    "metadata": {
      "category": "example",
      "priority": "high"
    },
    "tags": ["important", "example"]
  },
  "meta": {
    "processing_time": 0.125
  }
}
```

#### `GET /[resource]/{id}`
**Description**: Retrieve a specific resource by ID

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Resource unique identifier |

**Query Parameters**:
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `include` | string | No | Related resources to include | - |
| `fields` | string | No | Specific fields to return | all |

**Request Examples**:
```bash
# Basic resource retrieval
curl -H "Authorization: Bearer [token]" \
     https://api.codai.example.com/v1/[service]/[resource]/12345

# With related resources
curl -H "Authorization: Bearer [token]" \
     https://api.codai.example.com/v1/[service]/[resource]/12345?include=related,statistics

# With field selection
curl -H "Authorization: Bearer [token]" \
     https://api.codai.example.com/v1/[service]/[resource]/12345?fields=id,name,status
```

**Success Response (200)**:
```json
{
  "data": {
    "id": "12345",
    "name": "Example Resource",
    "description": "Detailed description of the resource",
    "status": "active",
    "created_at": "2025-07-22T10:00:00Z",
    "updated_at": "2025-07-22T10:00:00Z",
    "metadata": {
      "category": "example",
      "priority": "high",
      "version": "1.2.0"
    },
    "tags": ["important", "example"],
    "statistics": {
      "views": 1250,
      "interactions": 45,
      "last_accessed": "2025-07-22T09:30:00Z"
    }
  },
  "meta": {
    "etag": "W/\"abc123def456\"",
    "cached": true,
    "cache_expires": "2025-07-22T10:05:00Z"
  }
}
```

#### `PUT /[resource]/{id}`
**Description**: Update a resource (full update)

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Resource unique identifier |

**Request Body**: Same structure as POST endpoint

**Request Example**:
```bash
curl -X PUT \
     -H "Authorization: Bearer [token]" \
     -H "Content-Type: application/json" \
     -H "If-Match: W/\"abc123def456\"" \
     -d '{
       "name": "Updated Resource Name",
       "description": "Updated description",
       "status": "active",
       "metadata": {
         "category": "updated",
         "priority": "medium"
       },
       "tags": ["updated", "example"]
     }' \
     https://api.codai.example.com/v1/[service]/[resource]/12345
```

**Success Response (200)**:
```json
{
  "data": {
    "id": "12345",
    "name": "Updated Resource Name",
    "description": "Updated description",
    "status": "active",
    "created_at": "2025-07-22T10:00:00Z",
    "updated_at": "2025-07-22T11:00:00Z",
    "metadata": {
      "category": "updated",
      "priority": "medium"
    },
    "tags": ["updated", "example"]
  },
  "meta": {
    "etag": "W/\"def456ghi789\"",
    "processing_time": 0.089
  }
}
```

#### `PATCH /[resource]/{id}`
**Description**: Partially update a resource

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Resource unique identifier |

**Request Body**: JSON object with only fields to update

**Request Example**:
```bash
curl -X PATCH \
     -H "Authorization: Bearer [token]" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "inactive",
       "metadata": {
         "priority": "low"
       }
     }' \
     https://api.codai.example.com/v1/[service]/[resource]/12345
```

#### `DELETE /[resource]/{id}`
**Description**: Delete a resource

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Resource unique identifier |

**Query Parameters**:
| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `force` | boolean | No | Force delete even with dependencies | false |

**Request Example**:
```bash
curl -X DELETE \
     -H "Authorization: Bearer [token]" \
     https://api.codai.example.com/v1/[service]/[resource]/12345
```

**Success Response (204)**:
```
HTTP/1.1 204 No Content
```

**Success Response with Confirmation (200)**:
```json
{
  "message": "Resource deleted successfully",
  "deleted_id": "12345",
  "deleted_at": "2025-07-22T11:00:00Z"
}
```

---

## 🔧 Advanced Features

### Bulk Operations

#### `POST /[resource]/bulk`
**Description**: Create multiple resources in a single request

**Request Body**:
```json
{
  "resources": [
    {
      "name": "Resource 1",
      "status": "active"
    },
    {
      "name": "Resource 2", 
      "status": "pending"
    }
  ],
  "options": {
    "validate_all": true,
    "stop_on_error": false
  }
}
```

**Success Response (207 Multi-Status)**:
```json
{
  "results": [
    {
      "index": 0,
      "status": 201,
      "data": {
        "id": "11111",
        "name": "Resource 1",
        "status": "active"
      }
    },
    {
      "index": 1,
      "status": 422,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Name already exists"
      }
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1
  }
}
```

### Search and Filtering

#### `GET /[resource]/search`
**Description**: Advanced search with full-text search and complex filters

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Full-text search query |
| `filters` | object | No | Complex filter criteria |
| `facets` | array | No | Fields to generate facets for |
| `highlight` | boolean | No | Enable search result highlighting |

**Request Example**:
```bash
curl -H "Authorization: Bearer [token]" \
     -G \
     --data-urlencode 'q=example search term' \
     --data-urlencode 'filters[status]=active,pending' \
     --data-urlencode 'filters[created_at][gte]=2025-01-01' \
     --data-urlencode 'facets[]=status' \
     --data-urlencode 'facets[]=category' \
     --data-urlencode 'highlight=true' \
     https://api.codai.example.com/v1/[service]/[resource]/search
```

**Success Response (200)**:
```json
{
  "data": [
    {
      "id": "12345",
      "name": "Example Resource",
      "status": "active",
      "highlight": {
        "name": ["<em>Example</em> Resource"],
        "description": ["This is an <em>example</em> description"]
      },
      "score": 0.95
    }
  ],
  "facets": {
    "status": [
      {"value": "active", "count": 150},
      {"value": "pending", "count": 25}
    ],
    "category": [
      {"value": "example", "count": 100},
      {"value": "test", "count": 75}
    ]
  },
  "search_meta": {
    "query": "example search term",
    "total_matches": 175,
    "search_time": 0.023,
    "suggestions": ["example", "sample", "demo"]
  }
}
```

### Batch Processing

#### `POST /[resource]/batch/{operation}`
**Description**: Execute batch operations on multiple resources

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | string | Yes | Batch operation (update, delete, archive) |

**Request Body**:
```json
{
  "resource_ids": ["12345", "67890", "11111"],
  "operation_data": {
    "status": "archived",
    "archived_reason": "Batch archival"
  },
  "options": {
    "async": false,
    "notify": true
  }
}
```

---

## 📨 Webhooks and Events

### Webhook Configuration

#### `POST /webhooks`
**Description**: Create a new webhook subscription

**Request Body**:
```json
{
  "url": "https://your-app.com/webhook-handler",
  "events": [
    "[resource].created",
    "[resource].updated",
    "[resource].deleted"
  ],
  "secret": "your-webhook-secret",
  "active": true,
  "filters": {
    "status": ["active", "pending"]
  }
}
```

### Webhook Events:
| Event | Description | Payload |
|-------|-------------|---------|
| `[resource].created` | Resource created | Full resource object |
| `[resource].updated` | Resource updated | Updated resource object |
| `[resource].deleted` | Resource deleted | Resource ID and metadata |
| `[resource].status_changed` | Status changed | Old and new status |

### Webhook Payload Example:
```json
{
  "event": "[resource].created",
  "timestamp": "2025-07-22T10:00:00Z",
  "webhook_id": "webhook_123",
  "data": {
    "id": "12345",
    "name": "New Resource",
    "status": "active",
    "created_at": "2025-07-22T10:00:00Z"
  },
  "previous_data": null
}
```

---

## 🚨 Error Handling

### Standard Error Response:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "specific_field",
      "issue": "validation_failed",
      "expected": "string",
      "received": "number"
    },
    "request_id": "req_12345abcdef",
    "timestamp": "2025-07-22T10:00:00Z"
  }
}
```

### HTTP Status Codes:
| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH requests |
| 201 | Created | Successful POST requests |
| 204 | No Content | Successful DELETE requests |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists or conflict |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary service unavailable |

### Error Codes and Messages:
| Error Code | HTTP Status | Description | Resolution |
|------------|-------------|-------------|------------|
| `INVALID_REQUEST` | 400 | Request format is invalid | Check request structure |
| `MISSING_PARAMETER` | 400 | Required parameter missing | Include required parameter |
| `INVALID_PARAMETER` | 400 | Parameter value is invalid | Check parameter format |
| `AUTHENTICATION_REQUIRED` | 401 | No authentication provided | Include API key or token |
| `INVALID_TOKEN` | 401 | Token is invalid or expired | Refresh or obtain new token |
| `INSUFFICIENT_PERMISSIONS` | 403 | Missing required permissions | Contact admin for access |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found | Check resource ID |
| `RESOURCE_CONFLICT` | 409 | Resource already exists | Use different identifier |
| `VALIDATION_ERROR` | 422 | Request data validation failed | Fix validation errors |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Wait before retrying |
| `INTERNAL_ERROR` | 500 | Internal server error | Contact support |

### Error Handling Best Practices:
```javascript
const handleAPIError = (error, response) => {
  switch (response.status) {
    case 400:
      console.error('Bad Request:', error.message);
      // Fix request parameters
      break;
    case 401:
      console.error('Unauthorized:', error.message);
      // Refresh token or re-authenticate
      break;
    case 403:
      console.error('Forbidden:', error.message);
      // Request additional permissions
      break;
    case 404:
      console.error('Not Found:', error.message);
      // Check resource exists
      break;
    case 429:
      console.error('Rate Limited:', error.message);
      // Implement exponential backoff
      const retryAfter = response.headers.get('Retry-After');
      setTimeout(() => retryRequest(), retryAfter * 1000);
      break;
    case 500:
      console.error('Server Error:', error.message);
      // Log error and contact support
      break;
    default:
      console.error('Unknown Error:', error);
  }
};
```

---

## 📊 Performance and Monitoring

### Performance Metrics:
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Average Response Time | [X]ms | <200ms | ✅ Met |
| 95th Percentile Response Time | [X]ms | <500ms | ✅ Met |
| API Uptime | [X]% | >99.9% | ✅ Met |
| Error Rate | [X]% | <0.1% | ✅ Met |
| Throughput | [X] RPS | >[Y] RPS | ✅ Met |

### Monitoring Endpoints:
```bash
# Health check
curl https://api.codai.example.com/v1/[service]/health

# Metrics (Prometheus format)
curl https://api.codai.example.com/v1/[service]/metrics

# Status page
curl https://api.codai.example.com/v1/status
```

### Performance Optimization:
- **Caching**: Response caching with ETags and conditional requests
- **Compression**: Gzip compression for response bodies
- **CDN**: Global CDN for static assets and cached responses
- **Database**: Optimized queries with proper indexing
- **Connection Pooling**: Efficient database connection management

---

## 🔧 SDKs and Client Libraries

### Official SDKs:

#### JavaScript/TypeScript SDK
```bash
npm install @codai/[service]-sdk
```

```javascript
import { ServiceClient } from '@codai/[service]-sdk';

const client = new ServiceClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.codai.example.com/v1/[service]'
});

// Create resource
const resource = await client.resources.create({
  name: 'New Resource',
  status: 'active'
});

// List resources
const resources = await client.resources.list({
  limit: 50,
  filter: 'status:active'
});

// Get specific resource
const resource = await client.resources.get('12345');
```

#### Python SDK
```bash
pip install codai-[service]-sdk
```

```python
from codai_service import ServiceClient

client = ServiceClient(
    api_key='your-api-key',
    base_url='https://api.codai.example.com/v1/[service]'
)

# Create resource
resource = client.resources.create(
    name='New Resource',
    status='active'
)

# List resources
resources = client.resources.list(
    limit=50,
    filter='status:active'
)
```

### HTTP Clients Examples:

#### cURL Examples
```bash
# Set common variables
API_BASE="https://api.codai.example.com/v1/[service]"
TOKEN="your-bearer-token"

# Create resource
curl -X POST "$API_BASE/[resource]" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Example", "status": "active"}'

# List resources
curl "$API_BASE/[resource]?limit=20&sort=created_at:desc" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Testing and Development

### API Testing:
```javascript
// Jest test example
describe('API Integration Tests', () => {
  let client;
  
  beforeAll(() => {
    client = new ServiceClient({
      apiKey: process.env.TEST_API_KEY,
      baseUrl: process.env.TEST_API_URL
    });
  });
  
  test('should create and retrieve resource', async () => {
    // Create resource
    const created = await client.resources.create({
      name: 'Test Resource',
      status: 'active'
    });
    
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Test Resource');
    
    // Retrieve resource
    const retrieved = await client.resources.get(created.id);
    expect(retrieved.name).toBe(created.name);
    
    // Cleanup
    await client.resources.delete(created.id);
  });
});
```

### Postman Collection:
```json
{
  "info": {
    "name": "[Service] API Collection",
    "description": "Complete API collection for testing"
  },
  "auth": {
    "type": "bearer",
    "bearer": [{"key": "token", "value": "{{bearerToken}}"}]
  },
  "variable": [
    {"key": "baseUrl", "value": "https://api.codai.example.com/v1/[service]"}
  ]
}
```

---

## 📚 Migration and Versioning

### API Versioning:
- **URL Versioning**: `/v1/`, `/v2/` in the URL path
- **Header Versioning**: `API-Version: 2025-07-22` header
- **Backward Compatibility**: Maintain support for N-1 versions

### Migration Guide:

#### From v1.0 to v2.0:
```json
// v1.0 Response Format
{
  "id": "12345",
  "name": "Resource",
  "created": "2025-07-22T10:00:00Z"
}

// v2.0 Response Format  
{
  "data": {
    "id": "12345",
    "name": "Resource", 
    "created_at": "2025-07-22T10:00:00Z"
  },
  "meta": {
    "version": "2.0"
  }
}
```

### Breaking Changes:
- **Field Renames**: `created` → `created_at`
- **Response Wrapper**: All responses wrapped in `data` object
- **Error Format**: Standardized error response format

---

## 📋 API Documentation Checklist

### Essential Content:
- [ ] Authentication methods documented with examples
- [ ] All endpoints documented with parameters and responses
- [ ] Error handling with complete error code reference
- [ ] Rate limiting information with examples
- [ ] Performance metrics and SLA information
- [ ] SDKs and client libraries with usage examples

### Technical Accuracy:
- [ ] All API endpoints tested and validated
- [ ] Request/response examples are working and current
- [ ] Error responses match actual API behavior
- [ ] Rate limiting values are accurate
- [ ] Authentication examples tested

### Developer Experience:
- [ ] Clear getting started guide with working examples
- [ ] Comprehensive error handling guidance
- [ ] Performance optimization recommendations
- [ ] Migration guides for version changes
- [ ] Interactive examples (Postman, curl)

### Review and Approval:
- [ ] API team technical review completed
- [ ] Developer experience review completed
- [ ] Security team approval for auth documentation
- [ ] Final approval and publication

---

**Status**: 📋 TEMPLATE - Ready for Implementation  
**Template Version**: 1.0.0  
**Created**: July 22, 2025  
**API Version Compatibility**: v1.0+  
**Next Review**: [Schedule review date]

*This template provides comprehensive structure for documenting CODAI ecosystem APIs. Ensure all endpoints are thoroughly tested and examples are working.*
