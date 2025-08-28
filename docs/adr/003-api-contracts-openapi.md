# ADR 003: API Contracts and OpenAPI Specification

## Status
Accepted

## Context
CODAI essential services need standardized API contracts to ensure consistent integration, clear service boundaries, and comprehensive testing. Current services expose REST endpoints but lack formal API specifications.

## Decision
We will implement OpenAPI 3.0 specifications for all essential services with contract-first development approach.

## API Contract Standards

### 1. Identity Service API Contract

```yaml
openapi: 3.0.3
info:
  title: CODAI Identity Service API
  description: Authentication and user management service
  version: 1.0.0
  contact:
    name: CODAI Team
    email: tech@codai.com

servers:
  - url: http://localhost:8100/api/v1
    description: Development server
  - url: https://api.codai.com/identity/v1
    description: Production server

paths:
  /health:
    get:
      summary: Health check endpoint
      operationId: getHealth
      tags: [System]
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthStatus'

  /auth/login:
    post:
      summary: User authentication
      operationId: loginUser
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoginResponse'
        '401':
          description: Invalid credentials
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /auth/register:
    post:
      summary: User registration
      operationId: registerUser
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: Registration successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '400':
          description: Invalid input
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /users/me:
    get:
      summary: Get current user profile
      operationId: getCurrentUser
      tags: [Users]
      security:
        - BearerAuth: []
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  schemas:
    HealthStatus:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        service:
          type: string
          example: "CODAI Identity Service"
        version:
          type: string
          example: "1.0.0"
        timestamp:
          type: string
          format: date-time
        uptime:
          type: number
          description: Service uptime in seconds

    LoginRequest:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          format: email
          example: "user@codai.com"
        password:
          type: string
          minLength: 8
          example: "securePassword123"

    LoginResponse:
      type: object
      properties:
        accessToken:
          type: string
          description: JWT access token
        refreshToken:
          type: string
          description: JWT refresh token
        user:
          $ref: '#/components/schemas/UserResponse'
        expiresIn:
          type: number
          description: Access token expiry in seconds

    RegisterRequest:
      type: object
      required: [email, password, firstName, lastName]
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        firstName:
          type: string
          maxLength: 100
        lastName:
          type: string
          maxLength: 100

    UserResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        firstName:
          type: string
        lastName:
          type: string
        role:
          type: string
          enum: [user, admin, service]
        emailVerified:
          type: boolean
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
              example: "INVALID_CREDENTIALS"
            message:
              type: string
              example: "Invalid email or password"
            details:
              type: object
              additionalProperties: true
        requestId:
          type: string
          format: uuid
        timestamp:
          type: string
          format: date-time

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### 2. API Gateway Contract

```yaml
openapi: 3.0.3
info:
  title: CODAI API Gateway
  description: Central API orchestration and routing
  version: 1.0.0

servers:
  - url: http://localhost:8010/api/v1
    description: Development server

paths:
  /health:
    get:
      summary: Gateway health check
      operationId: getGatewayHealth
      responses:
        '200':
          description: Gateway is healthy
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/HealthStatus'
                  - type: object
                    properties:
                      upstreamServices:
                        type: object
                        properties:
                          identity:
                            $ref: '#/components/schemas/ServiceHealth'
                          hub:
                            $ref: '#/components/schemas/ServiceHealth'
                          memorai:
                            $ref: '#/components/schemas/ServiceHealth'

  /routes:
    get:
      summary: Get available service routes
      operationId: getRoutes
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Available routes
          content:
            application/json:
              schema:
                type: object
                properties:
                  routes:
                    type: array
                    items:
                      $ref: '#/components/schemas/ServiceRoute'

components:
  schemas:
    HealthStatus:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        service:
          type: string
        version:
          type: string
        timestamp:
          type: string
          format: date-time

    ServiceHealth:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        responseTime:
          type: number
          description: Average response time in milliseconds
        lastCheck:
          type: string
          format: date-time

    ServiceRoute:
      type: object
      properties:
        path:
          type: string
          example: "/identity/*"
        service:
          type: string
          example: "identity-service"
        target:
          type: string
          example: "http://identity-service:4004"
        methods:
          type: array
          items:
            type: string
            enum: [GET, POST, PUT, PATCH, DELETE]
        authenticated:
          type: boolean
        rateLimit:
          type: object
          properties:
            requests:
              type: number
            window:
              type: string
              example: "1h"

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### 3. MemorAI MCP Contract

```yaml
openapi: 3.0.3
info:
  title: MemorAI MCP Service API
  description: Memory Context Protocol server for AI operations
  version: 1.0.0

servers:
  - url: http://localhost:4950
    description: Development server

paths:
  /health:
    get:
      summary: MCP service health check
      operationId: getMCPHealth
      responses:
        '200':
          description: MCP service is healthy
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/HealthStatus'
                  - type: object
                    properties:
                      memoryStats:
                        $ref: '#/components/schemas/MemoryStats'

  /mcp:
    post:
      summary: MCP protocol endpoint
      operationId: handleMCPRequest
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MCPRequest'
      responses:
        '200':
          description: MCP response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MCPResponse'

components:
  schemas:
    HealthStatus:
      type: object
      properties:
        status:
          type: string
          enum: [healthy, degraded, unhealthy]
        service:
          type: string
        version:
          type: string
        timestamp:
          type: string
          format: date-time

    MemoryStats:
      type: object
      properties:
        totalMemories:
          type: number
        activeAgents:
          type: number
        memoryUsage:
          type: object
          properties:
            used:
              type: number
            total:
              type: number
            percentage:
              type: number

    MCPRequest:
      type: object
      properties:
        jsonrpc:
          type: string
          example: "2.0"
        method:
          type: string
          example: "tools/list"
        params:
          type: object
          additionalProperties: true
        id:
          oneOf:
            - type: string
            - type: number

    MCPResponse:
      type: object
      properties:
        jsonrpc:
          type: string
          example: "2.0"
        result:
          type: object
          additionalProperties: true
        error:
          type: object
          properties:
            code:
              type: number
            message:
              type: string
        id:
          oneOf:
            - type: string
            - type: number
```

## Contract Testing Strategy

### 1. Contract Generation
- OpenAPI specs stored in `/contracts/` directory
- Automated generation of TypeScript types from schemas
- Server stub generation for rapid development
- Client SDK generation for service integration

### 2. Contract Tests
```typescript
// Example contract test
describe('Identity Service Contract', () => {
  it('should conform to OpenAPI specification', async () => {
    const spec = await loadOpenAPISpec('/contracts/identity-service.yaml');
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@codai.com', password: 'password123' });
    
    expect(response).toMatchOpenAPISchema(spec, '/auth/login', 'post', '200');
  });
});
```

### 3. Mock Services
- Auto-generated mock servers from OpenAPI specs
- Realistic test data generation
- Service virtualization for integration testing

## Implementation Plan
1. **Phase 1**: Create OpenAPI specs for Identity and Gateway services
2. **Phase 2**: Generate TypeScript types and client SDKs
3. **Phase 3**: Implement contract tests for all services
4. **Phase 4**: Set up mock service infrastructure
5. **Phase 5**: Integrate contract validation into CI/CD pipeline

## Versioning Strategy
- Semantic versioning for API contracts (v1.0.0, v1.1.0, v2.0.0)
- Backward compatibility requirements for minor versions
- Deprecation notices for breaking changes (6-month notice period)
- API versioning via URL path (/api/v1/, /api/v2/)