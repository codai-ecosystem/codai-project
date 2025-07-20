# CODAI API Gateway

Central API gateway for the CODAI ecosystem, providing unified access, authentication, routing, and monitoring for all CODAI services.

## Features

- **Unified API Access**: Single entry point for all CODAI services
- **JWT Authentication**: Centralized authentication for all protected routes
- **Service Discovery**: Automatic service registration and health monitoring
- **Load Balancing**: Round-robin load balancing for service instances
- **Rate Limiting**: Configurable rate limiting per service and globally
- **Health Monitoring**: Real-time health checks for all services
- **API Documentation**: Combined OpenAPI documentation for all services
- **Request Routing**: Intelligent request routing to appropriate services
- **Error Handling**: Standardized error responses across all services

## Architecture

The gateway routes requests to the following services:

### Core Services
- **ID Service** (Port 4001): Authentication and user management
- **MEMORAI Service** (Port 4002): Memory storage and recall
- **HUB Service** (Port 4003): Service discovery and routing
- **LOGAI Service** (Port 4004): Logging and analytics
- **ADMIN Service** (Port 4005): User and system administration

### Business Platform Services
- **CODAI Service** (Port 4006): Platform and project management
- **BANCAI Service** (Port 4007): Financial services and banking
- **CUMPARAI Service** (Port 4008): E-commerce and product catalog
- **WALLET Service** (Port 4009): Payment processing and transactions
- **MARKETAI Service** (Port 4010): Marketing automation and campaigns
- **FABRICAI Service** (Port 4011): Content creation and templates

## API Routes

All services are accessible through the gateway using the pattern:
```
http://localhost:4000/api/v1/{service-id}/{endpoint}
```

### Gateway Management Endpoints

- `GET /api/gateway/health` - Gateway and services health status
- `GET /api/gateway/services` - List all registered services (requires auth)
- `GET /api/gateway/metrics` - Gateway and system metrics (requires auth)
- `GET /api/gateway/discover/{serviceId}` - Service discovery information

### Service Endpoints

Each service is accessible at `/api/v1/{service-id}/*`:

- `/api/v1/id/*` - ID Service endpoints
- `/api/v1/memorai/*` - MEMORAI Service endpoints  
- `/api/v1/hub/*` - HUB Service endpoints
- `/api/v1/logai/*` - LOGAI Service endpoints
- `/api/v1/admin/*` - ADMIN Service endpoints
- `/api/v1/codai/*` - CODAI Service endpoints
- `/api/v1/bancai/*` - BANCAI Service endpoints
- `/api/v1/cumparai/*` - CUMPARAI Service endpoints
- `/api/v1/wallet/*` - WALLET Service endpoints
- `/api/v1/marketai/*` - MARKETAI Service endpoints
- `/api/v1/fabricai/*` - FABRICAI Service endpoints

## Authentication

The gateway uses JWT (JSON Web Tokens) for authentication:

1. Obtain a JWT token from the ID service
2. Include the token in the Authorization header: `Bearer {token}`
3. The gateway validates the token and forwards authenticated requests

### Public Endpoints (No Authentication Required)

- Health check endpoints: `/api/v1/{service}/health`
- Readiness endpoints: `/api/v1/{service}/ready`
- API documentation: `/api/v1/{service}/docs`
- Gateway management: `/api/gateway/health`

### Protected Endpoints (Authentication Required)

All other endpoints require a valid JWT token.

## Configuration

### Environment Variables

```bash
# Gateway Configuration
GATEWAY_PORT=4000
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000,https://codai.ro

# Service URLs (auto-configured, can be overridden)
ID_SERVICE_URL=http://localhost:4001
MEMORAI_SERVICE_URL=http://localhost:4002
HUB_SERVICE_URL=http://localhost:4003
# ... etc for all services
```

### Service Registration

Services are automatically registered in the gateway's service registry with:

- Health monitoring (30-second intervals)
- Load balancing support
- Automatic failover
- Service metadata and versioning

## Usage

### Development

```bash
# Install dependencies
pnpm install

# Start in development mode
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Docker

```bash
# Build the gateway image
docker build -t codai/gateway .

# Run the gateway
docker run -p 4000:4000 \
  -e JWT_SECRET=your-secret-key \
  -e ALLOWED_ORIGINS=http://localhost:3000 \
  codai/gateway
```

## Health Monitoring

The gateway provides comprehensive health monitoring:

### Gateway Health
```bash
curl http://localhost:4000/api/gateway/health
```

### Service Discovery
```bash
curl http://localhost:4000/api/gateway/services \
  -H "Authorization: Bearer {token}"
```

### System Metrics
```bash
curl http://localhost:4000/api/gateway/metrics \
  -H "Authorization: Bearer {token}"
```

## Rate Limiting

Default rate limits:
- **Global**: 1000 requests per 15 minutes per IP
- **Per Service**: Configurable based on service requirements

## Security Features

- **Helmet.js**: Security headers for all responses
- **CORS**: Configurable cross-origin resource sharing
- **Compression**: Gzip compression for responses
- **JWT Validation**: Secure token validation
- **Request Logging**: Comprehensive request/response logging

## API Documentation

The gateway provides combined API documentation for all services:

- **Gateway Docs**: http://localhost:4000/docs
- **Service Docs**: http://localhost:4000/api/v1/{service}/docs

## Load Balancing

The gateway supports multiple instances of each service:

- Round-robin load balancing
- Health-based routing (unhealthy instances are skipped)
- Automatic failover to healthy instances

## Error Handling

Standardized error responses across all services:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "service": "service-id",
  "requestId": "req-12345"
}
```

## Monitoring and Logging

- Request/response logging with correlation IDs
- Performance metrics collection
- Error tracking and aggregation
- Health status monitoring
- Service availability metrics

## Development

### Adding New Services

1. Add service configuration to the `serviceRegistry`
2. Update port allocation
3. Add service to load balancer
4. Update documentation

### Testing

```bash
# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm type-check
```

## Production Deployment

The gateway is designed for production use with:

- Horizontal scaling support
- Health check endpoints for load balancers  
- Graceful shutdown handling
- Comprehensive error handling
- Performance monitoring
- Security best practices

## Contributing

1. Follow the CODAI development standards
2. Add tests for new features
3. Update documentation
4. Ensure all services are properly registered

## License

MIT License - see LICENSE file for details.
