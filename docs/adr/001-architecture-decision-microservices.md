# ADR 001: Microservices Architecture for CODAI Essential Services

## Status
Accepted

## Context
CODAI ecosystem requires a scalable, maintainable architecture to support 10 essential services including identity management, API gateway, memory management, and banking AI services. Current analysis shows all services are operational but need formal architectural governance.

## Decision
We will adopt a microservices architecture pattern with the following principles:

### Service Boundaries
- **Identity Service** (Port 8100): Authentication, authorization, JWT management
- **API Gateway** (Port 8010): Request routing, rate limiting, authentication
- **Hub Service** (Port 8110): Central coordination and service discovery
- **BancAI Service** (Port 8120): Financial operations and Stripe integration
- **MemorAI MCP** (Port 4950): Memory Context Protocol server
- **MemorAI GraphQL** (Port 4500): GraphQL API interface
- **MemorAI Frontend** (Port 8006): User interface for memory management
- **CBD Database** (Port 8180): Custom Brain Database for AI operations
- **PostgreSQL** (Port 4300): Primary data persistence
- **Redis** (Port 8020): Caching and session management

### Technology Stack
- **Runtime**: Node.js 18+, TypeScript 5.8+
- **Web Framework**: Next.js 15.5 for full-stack applications
- **Database**: PostgreSQL 15 for persistence, Redis 7.2 for caching
- **Container Orchestration**: Docker Compose with health checks
- **API Standards**: REST with OpenAPI 3.0, GraphQL for complex queries
- **Authentication**: JWT with refresh tokens, OAuth 2.0 integration
- **Monitoring**: Health endpoints, centralized logging

## Consequences

### Positive
- Clear service boundaries and responsibilities
- Independent deployment and scaling
- Technology diversity where appropriate
- Strong observability foundation
- Production-ready health monitoring

### Negative
- Increased operational complexity
- Network latency between services
- Distributed system challenges (consistency, availability)
- More complex testing scenarios

### Risks & Mitigations
- **Service Discovery**: Mitigated by Docker networking and service names
- **Data Consistency**: Mitigated by careful transaction boundaries
- **Performance**: Mitigated by Redis caching and connection pooling
- **Security**: Mitigated by JWT validation and service-to-service auth

## Trade-offs Evaluation

| Aspect | Monolith | Microservices | Decision |
|--------|----------|---------------|-----------|
| Development Speed | ✅ Fast initial | ❌ Slower setup | Microservices (long-term benefit) |
| Scalability | ❌ Limited | ✅ Horizontal | Microservices |
| Operational Complexity | ✅ Simple | ❌ Complex | Microservices (necessary for scale) |
| Team Independence | ❌ Conflicts | ✅ Autonomous | Microservices |
| Technology Diversity | ❌ Locked-in | ✅ Flexible | Microservices |

## Implementation Notes
- All services must expose `/api/health` endpoints
- Service-to-service communication via REST APIs
- Centralized configuration via environment variables
- Docker networking for service discovery
- Shared utilities via workspace packages (@codai/shared-ui, @codai/api-utils)