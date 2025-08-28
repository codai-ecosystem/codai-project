# ADR-002: API Contract Standards

**Status**: Accepted  
**Date**: 2025-08-27  
**Deciders**: Engineering Team  
**Technical Story**: Establish contract-first API development for microservices

## Context and Problem Statement

CODAI microservices require:
- Standardized API contracts for 20+ services
- Contract-first development workflow
- Automated contract testing and validation
- Cross-service communication standards
- API versioning strategy

## Decision Drivers

- **Developer Experience**: Auto-generated clients and documentation
- **Quality**: Contract tests prevent integration failures
- **Versioning**: Backward compatibility and graceful evolution
- **Performance**: Efficient serialization and validation
- **Security**: Input validation and API authentication

## API Contract Standards

### OpenAPI 3.1 Specification

```yaml
# Example: Gateway Service API Contract
openapi: 3.1.0
info:
  title: CODAI Gateway API
  version: 1.0.0
  description: Central API orchestration for CODAI ecosystem

paths:
  /api/health:
    get:
      summary: Health check endpoint
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'

components:
  schemas:
    HealthResponse:
      type: object
      required: [status, service, version, timestamp]
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        service:
          type: string
          example: "gateway"
        version:
          type: string
          pattern: '^\d+\.\d+\.\d+$'
        timestamp:
          type: string
          format: date-time
        dependencies:
          type: array
          items:
            $ref: '#/components/schemas/DependencyStatus'
    
    DependencyStatus:
      type: object
      required: [name, status]
      properties:
        name:
          type: string
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        responseTime:
          type: integer
          description: Response time in milliseconds
```

### JSON Schema for Data Models

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User Profile",
  "type": "object",
  "required": ["id", "email", "createdAt"],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique user identifier"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "User email address"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "role": {
      "type": "string",
      "enum": ["user", "admin", "developer"],
      "default": "user"
    },
    "preferences": {
      "type": "object",
      "properties": {
        "theme": {"enum": ["light", "dark", "auto"]},
        "language": {"type": "string", "pattern": "^[a-z]{2}$"}
      }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

## API Versioning Strategy

### URL Versioning
```
/api/v1/users
/api/v2/users
```

### Header Versioning (Preferred)
```
Accept: application/vnd.codai.v1+json
Content-Type: application/vnd.codai.v1+json
```

### Backward Compatibility Rules
1. **Additive Changes**: New fields, endpoints are non-breaking
2. **Deprecation Period**: 6 months notice for breaking changes
3. **Version Support**: Support N and N-1 versions simultaneously

## Contract Testing Strategy

### Consumer-Driven Contracts (Pact)

```typescript
// Consumer test (Frontend)
import { PactV3, MatchersV3 } from '@pact-foundation/pact';

const provider = new PactV3({
  consumer: 'codai-frontend',
  provider: 'gateway-api'
});

describe('Gateway API', () => {
  test('should get health status', async () => {
    await provider
      .given('service is healthy')
      .uponReceiving('health check request')
      .withRequest({
        method: 'GET',
        path: '/api/health'
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          status: 'healthy',
          service: 'gateway',
          version: MatchersV3.regex('\\d+\\.\\d+\\.\\d+', '1.0.0'),
          timestamp: MatchersV3.iso8601DateTime()
        }
      });

    const response = await fetch('/api/health');
    const data = await response.json();
    
    expect(data.status).toBe('healthy');
  });
});
```

### Provider Verification

```typescript
// Provider test (Backend)
import { Verifier } from '@pact-foundation/pact';

const verifier = new Verifier({
  provider: 'gateway-api',
  providerBaseUrl: 'http://localhost:4003',
  pactUrls: ['./pacts/codai-frontend-gateway-api.json'],
  stateHandlers: {
    'service is healthy': () => {
      // Setup test state
    }
  }
});

verifier.verifyProvider();
```

## Security Standards

### Authentication Headers
```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

security:
  - BearerAuth: []
  - ApiKeyAuth: []
```

### Request Validation
- All inputs validated against JSON Schema
- Rate limiting: 1000 req/min per user
- CORS configured for known origins only
- Request size limits: 10MB max

## Performance Requirements

| Endpoint Type | Response Time | Throughput |
|---------------|---------------|------------|
| Health Checks | <50ms | 10,000 req/min |
| CRUD Operations | <200ms | 5,000 req/min |
| AI Processing | <3000ms | 100 req/min |
| File Upload | <5000ms | 10 req/min |

## Implementation Tooling

### Code Generation
```bash
# Generate TypeScript clients
openapi-generator generate \
  -i api-spec.yaml \
  -g typescript-fetch \
  -o ./src/generated/clients

# Generate server stubs
openapi-generator generate \
  -i api-spec.yaml \
  -g nodejs-express-server \
  -o ./generated/server
```

### Contract Testing Pipeline
```yaml
# .github/workflows/contract-tests.yml
name: Contract Tests
on: [push, pull_request]
jobs:
  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Pact Tests
        run: |
          pnpm test:contract
          pact-broker publish ./pacts
```

## Monitoring and Observability

### API Metrics
- Request rate, error rate, duration (RED)
- Status code distribution
- Contract compliance violations
- Schema validation failures

### Health Check Standards
```json
{
  "status": "healthy|degraded|unhealthy",
  "version": "1.0.0",
  "timestamp": "2025-08-27T10:30:00Z",
  "dependencies": [
    {"name": "postgresql", "status": "healthy", "responseTime": 5},
    {"name": "redis", "status": "healthy", "responseTime": 2}
  ],
  "checks": {
    "database": {"status": "healthy", "details": "Connection pool: 8/10"},
    "memory": {"status": "healthy", "details": "Usage: 65%"}
  }
}
```

## Links

- [Architecture Decision](./001-architecture-decision.md)
- [Security Posture](./003-security-posture.md)
- [Contract Specifications](../contracts/)