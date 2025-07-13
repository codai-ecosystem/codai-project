# JUCAI API Documentation

## Overview

The jucai service is a supporting service in the Codai ecosystem, providing essential functionality for the platform.

## Base URL

- **Development**: `http://localhost:4009`
- **Production**: `https://jucai.codai.dev`

## Authentication

All API endpoints require authentication via JWT tokens or API keys.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-API-Key: <api_key>
```

## Health Checks

### GET /health

Returns the health status of the service.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0",
  "uptime": 12345,
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "external_apis": "healthy"
  }
}
```

### GET /metrics

Returns Prometheus metrics for monitoring.

## API Endpoints

### Core Endpoints

#### GET /api/v1/jucai

Get jucai data.

**Parameters:**

- `limit` (optional): Number of items to return (default: 10)
- `offset` (optional): Number of items to skip (default: 0)

**Response:**

```json
{
  "data": [],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 100
  }
}
```

#### POST /api/v1/jucai

Create new jucai record.

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "metadata": {}
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "metadata": {},
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### GET /api/v1/jucai/:id

Get specific jucai record by ID.

**Response:**

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "metadata": {},
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /api/v1/jucai/:id

Update specific jucai record.

#### DELETE /api/v1/jucai/:id

Delete specific jucai record.

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00.000Z",
    "request_id": "uuid"
  }
}
```

### Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

- 100 requests per minute per API key
- 1000 requests per hour per API key
- Burst capacity: 200 requests

## SDK Examples

### JavaScript/TypeScript

```typescript
import { CodaiClient } from '@codai/sdk';

const client = new CodaiClient({
  baseURL: 'https://jucai.codai.dev',
  apiKey: 'your-api-key',
});

// Get jucai data
const data = await client.jucai.list({ limit: 20 });

// Create new record
const newRecord = await client.jucai.create({
  name: 'Example',
  description: 'Example description',
});
```

### Python

```python
from codai_sdk import CodaiClient

client = CodaiClient(
    base_url='https://jucai.codai.dev',
    api_key='your-api-key'
)

# Get jucai data
data = client.jucai.list(limit=20)

# Create new record
new_record = client.jucai.create({
    'name': 'Example',
    'description': 'Example description'
})
```

## Webhooks

The jucai service supports webhooks for real-time notifications.

### Webhook Events

- `jucai.created`
- `jucai.updated`
- `jucai.deleted`

### Webhook Payload

```json
{
  "event": "jucai.created",
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "webhook_id": "uuid"
}
```

## Environment Variables

| Variable         | Description            | Required | Default |
| ---------------- | ---------------------- | -------- | ------- |
| `PORT`           | Service port           | No       | 4009    |
| `NODE_ENV`       | Environment            | Yes      | -       |
| `DATABASE_URL`   | Database connection    | Yes      | -       |
| `REDIS_URL`      | Redis connection       | Yes      | -       |
| `JWT_SECRET`     | JWT signing secret     | Yes      | -       |
| `API_KEY_SECRET` | API key signing secret | Yes      | -       |

## Monitoring

### Metrics

The service exposes the following metrics:

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration histogram
- `jucai_operations_total` - Service-specific operations
- `jucai_errors_total` - Service-specific errors

### Logs

Structured JSON logs are available in Elasticsearch:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "service": "jucai",
  "message": "Request processed",
  "request_id": "uuid",
  "user_id": "uuid",
  "duration": 123
}
```

### Tracing

Distributed tracing is available via Jaeger with the following tags:

- `service.name`: jucai
- `service.version`: 2.0.0
- `environment`: production

## Support

For support and questions:

- Documentation: https://docs.codai.dev/jucai
- GitHub Issues: https://github.com/codai-project/jucai/issues
- Email: support@codai.dev
