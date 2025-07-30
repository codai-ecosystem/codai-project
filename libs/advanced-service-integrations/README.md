# CODAI Advanced Service Integrations

A comprehensive, enterprise-grade service integration and orchestration system for modern distributed applications. This package provides a unified interface for managing API gateways, real-time communication, message queues, service meshes, event systems, and workflow orchestration.

## 🚀 Features

### Core Integration Engine
- **Service Discovery & Registration** - Automatic service discovery with health monitoring
- **Load Balancing** - Multiple algorithms with failover and circuit breaker patterns
- **Security** - Authentication, authorization, encryption, and input sanitization  
- **Monitoring** - Comprehensive metrics, tracing, logging, and alerting
- **Caching** - Multi-tier caching with intelligent invalidation strategies
- **Retry Logic** - Configurable retry policies with backoff strategies

### API Gateway
- **Intelligent Routing** - Path-based, header-based, weighted, and canary routing
- **Rate Limiting** - Global, per-service, per-route, and per-user rate limiting
- **Request/Response Transformation** - Headers, body, and query parameter transformation
- **Security** - JWT, OAuth2, API key authentication with RBAC authorization
- **Circuit Breaker** - Automatic failure detection with fallback responses
- **Compression** - Gzip, deflate, and Brotli compression support

### Real-time Communication
- **WebSocket Server** - Scalable WebSocket server with room support
- **Authentication** - JWT, token, session, and custom authentication
- **Rate Limiting** - Message-level rate limiting with burst support
- **Heartbeat** - Automatic connection health monitoring
- **Message History** - Configurable message persistence per room
- **Broadcasting** - Room, user, and global message broadcasting

### Message Queue System
- **Multi-Protocol Support** - RabbitMQ, Kafka, Redis, SQS, Service Bus, NATS
- **Dead Letter Queues** - Automatic failed message handling
- **Message Routing** - Exchange-based routing with flexible bindings
- **Consumer Groups** - Parallel processing with load distribution
- **Monitoring** - Queue length, throughput, and error rate monitoring
- **Reliability** - Message persistence, acknowledgments, and retry logic

### Service Mesh Integration
- **Traffic Management** - Canary deployments, circuit breakers, timeouts
- **Security** - Mutual TLS, RBAC policies, certificate management
- **Observability** - Distributed tracing, metrics collection, topology visualization
- **Load Balancing** - Multiple algorithms with health-based routing
- **Policy Enforcement** - Authentication, authorization, and security policies

### Event-Driven Architecture
- **Event Sourcing** - Complete event store with projections and snapshots
- **CQRS Support** - Command and query separation with read models
- **Saga Orchestration** - Long-running workflow management with compensation
- **Event Bus** - Multi-protocol event distribution and routing
- **Stream Processing** - Real-time event processing and transformation

## 📦 Installation

```bash
npm install @codai/advanced-service-integrations
```

## 🎯 Quick Start

### Basic Service Integration

```typescript
import { ServiceIntegrationEngine } from '@codai/advanced-service-integrations';

const engine = new ServiceIntegrationEngine({
  discovery: { enabled: true },
  monitoring: { enabled: true },
  security: { enabled: true }
});

await engine.initialize();

// Register a service
await engine.registerService({
  serviceId: 'user-service',
  name: 'User Management Service',
  version: '1.0.0',
  baseUrl: 'http://user-service:3000',
  protocol: 'https',
  authentication: {
    type: 'jwt',
    credentials: { token: 'your-jwt-token' }
  },
  healthCheck: {
    enabled: true,
    endpoint: '/health',
    method: 'GET',
    interval: 30000,
    timeout: 5000,
    expectedStatus: [200]
  },
  monitoring: {
    enabled: true,
    metrics: { enabled: true, provider: 'prometheus' },
    tracing: { enabled: true, provider: 'jaeger' },
    logging: { enabled: true, level: 'info' }
  }
});

// Make service calls
const result = await engine.callService('user-service', '/api/users/123', {
  method: 'GET',
  headers: { 'Accept': 'application/json' }
});
```

### API Gateway Setup

```typescript
import { APIGatewayManager } from '@codai/advanced-service-integrations';

const gateway = new APIGatewayManager({
  gatewayId: 'main-gateway',
  name: 'Main API Gateway',
  port: 8080,
  host: '0.0.0.0',
  protocol: 'https',
  ssl: {
    enabled: true,
    keyPath: '/path/to/private.key',
    certPath: '/path/to/certificate.crt'
  },
  routing: {
    strategy: 'path-based',
    routes: [
      {
        id: 'user-route',
        path: '/api/users/*',
        method: 'GET',
        targetService: 'user-service',
        targetPath: '/users',
        enabled: true,
        transformation: {
          request: {
            headers: [
              { action: 'add', name: 'X-Gateway-Version', value: '1.0' }
            ]
          }
        },
        validation: {
          enabled: true,
          headers: [
            { name: 'Authorization', required: true, type: 'string' }
          ]
        }
      }
    ]
  },
  security: {
    authentication: [
      {
        name: 'jwt-auth',
        type: 'jwt',
        enabled: true,
        order: 1,
        configuration: {
          secret: 'your-jwt-secret',
          algorithms: ['HS256']
        }
      }
    ],
    authorization: {
      enabled: true,
      type: 'rbac',
      rules: [
        {
          id: 'admin-rule',
          name: 'Admin Access',
          condition: 'user.role === "admin"',
          action: 'allow',
          resources: ['/api/admin/*'],
          roles: ['admin']
        }
      ]
    }
  },
  rateLimit: {
    enabled: true,
    global: {
      requestsPerSecond: 1000,
      burstSize: 2000,
      windowSize: 60
    }
  }
}, { securityManager, loadBalancerManager, rateLimitManager, monitoringManager });

await gateway.start();
```

### WebSocket Real-time Communication

```typescript
import { WebSocketManager } from '@codai/advanced-service-integrations';

const wsManager = new WebSocketManager({
  serverId: 'chat-server',
  port: 8081,
  path: '/socket.io',
  authentication: {
    enabled: true,
    type: 'jwt',
    extractUser: async (token: string) => {
      // Verify JWT and return user
      return jwt.verify(token, 'your-secret');
    }
  },
  rooms: [
    {
      name: 'public-chat',
      maxUsers: 1000,
      persistence: true,
      messageHistory: 100,
      adminOnly: false,
      permissions: [
        {
          role: 'user',
          actions: ['join', 'leave', 'send']
        },
        {
          role: 'moderator', 
          actions: ['join', 'leave', 'send', 'moderate']
        }
      ]
    }
  ],
  rateLimit: {
    enabled: true,
    messagesPerSecond: 10,
    burstSize: 20,
    windowSize: 60
  },
  heartbeat: {
    enabled: true,
    interval: 30000,
    timeout: 5000,
    maxFailures: 3
  }
}, { securityManager, rateLimitManager, monitoringManager });

await wsManager.start();

// Send message to room
wsManager.sendToRoom('public-chat', 'message', {
  text: 'Hello everyone!',
  timestamp: new Date(),
  sender: 'user123'
});

// Send to specific user
wsManager.sendToUser('user456', 'notification', {
  type: 'friend-request',
  from: 'user123'
});
```

### Message Queue Integration

```typescript
import { MessageQueueManager } from '@codai/advanced-service-integrations';

const queueManager = new MessageQueueManager({
  queueId: 'main-queue',
  name: 'Main Message Queue',
  type: 'rabbitmq',
  connection: {
    host: 'localhost',
    port: 5672,
    protocol: 'amqp',
    credentials: {
      username: 'admin',
      password: 'password'
    }
  },
  exchanges: [
    {
      name: 'user-events',
      type: 'topic',
      durable: true,
      autoDelete: false
    }
  ],
  queues: [
    {
      name: 'user-registration',
      durable: true,
      exclusive: false,
      autoDelete: false,
      bindings: [
        {
          exchange: 'user-events',
          routingKey: 'user.registered'
        }
      ]
    },
    {
      name: 'email-notifications',
      durable: true,
      exclusive: false,
      autoDelete: false,
      bindings: [
        {
          exchange: 'user-events', 
          routingKey: 'user.*'
        }
      ]
    }
  ],
  deadLetterQueue: {
    enabled: true,
    queueName: 'failed-messages',
    maxRetries: 3,
    retryDelay: 5000
  },
  monitoring: {
    enabled: true,
    metrics: {
      enabled: true,
      interval: 30,
      metrics: ['queue-length', 'message-rate', 'error-rate']
    }
  }
}, { monitoringManager, securityManager });

await queueManager.start();

// Send message
await queueManager.sendMessage('user-registration', {
  userId: '12345',
  email: 'user@example.com',
  registrationDate: new Date()
}, {
  headers: { 'content-type': 'application/json' },
  priority: 5
});

// Start consumer
await queueManager.startConsumer('user-registration', async (message) => {
  try {
    console.log('Processing registration:', message.body);
    
    // Process the registration
    await processUserRegistration(message.body);
    
    return 'ack'; // Acknowledge successful processing
  } catch (error) {
    console.error('Failed to process registration:', error);
    return 'nack'; // Negative acknowledgment - send to DLQ
  }
}, {
  concurrency: 5,
  autoAck: false
});
```

## 📊 Monitoring & Observability

### Metrics Collection

```typescript
// Get service metrics
const serviceMetrics = engine.getServiceMetrics('user-service');
console.log('Service Metrics:', {
  requestCount: serviceMetrics[0]?.requestCount,
  errorCount: serviceMetrics[0]?.errorCount,
  averageResponseTime: serviceMetrics[0]?.averageResponseTime,
  availability: serviceMetrics[0]?.availability
});

// Get aggregated metrics
const aggregatedMetrics = engine.getAggregatedMetrics();
console.log('System Metrics:', {
  totalRequests: aggregatedMetrics.totalRequests,
  errorRate: aggregatedMetrics.errorRate,
  averageResponseTime: aggregatedMetrics.averageResponseTime,
  availability: aggregatedMetrics.availability
});

// Get gateway metrics
const gatewayMetrics = gateway.getMetrics();
console.log('Gateway Metrics:', {
  totalRequests: gatewayMetrics.totalRequests,
  activeRoutes: gatewayMetrics.activeRoutes,
  errorRate: gatewayMetrics.errorRate,
  uptime: gatewayMetrics.uptime
});

// Get WebSocket metrics
const wsMetrics = wsManager.getMetrics();
console.log('WebSocket Metrics:', {
  totalConnections: wsMetrics.totalConnections,
  totalRooms: wsMetrics.totalRooms,
  totalMessages: wsMetrics.totalMessages
});

// Get queue metrics
const queueMetrics = await queueManager.getQueueMetrics('user-registration');
console.log('Queue Metrics:', {
  queueLength: queueMetrics.queueLength,
  messagesSent: queueMetrics.messagesSent,
  messagesProcessed: queueMetrics.messagesProcessed,
  errorRate: queueMetrics.errorRate
});
```

### Health Monitoring

```typescript
// Check service health
const serviceHealth = engine.getServiceHealth('user-service');
console.log('Service Health:', {
  status: serviceHealth?.status,
  responseTime: serviceHealth?.responseTime,
  errorCount: serviceHealth?.errorCount,
  lastCheck: serviceHealth?.lastCheck
});

// Get overall system health
const allServiceHealth = engine.getAllServiceHealth();
const healthyServices = allServiceHealth.filter(h => h.status === 'healthy').length;
console.log(`System Health: ${healthyServices}/${allServiceHealth.length} services healthy`);

// Get gateway health
const gatewayHealth = gateway.getHealthStatus();
console.log('Gateway Health:', gatewayHealth);

// Get WebSocket health
const wsHealth = wsManager.getHealthStatus();
console.log('WebSocket Health:', wsHealth);

// Get queue health
const queueHealth = queueManager.getHealthStatus();
console.log('Queue Health:', queueHealth);
```

## 🔧 Configuration Options

### Service Integration Engine

```typescript
const engineConfig = {
  discovery: {
    enabled: true,
    interval: 30000,
    timeout: 5000,
    strategies: ['consul', 'etcd', 'kubernetes']
  },
  monitoring: {
    enabled: true,
    metrics: {
      enabled: true,
      provider: 'prometheus',
      port: 9090,
      prefix: 'codai_integration'
    },
    tracing: {
      enabled: true,
      provider: 'jaeger',
      endpoint: 'http://jaeger:14268/api/traces',
      samplingRate: 0.1
    },
    logging: {
      enabled: true,
      level: 'info',
      format: 'json',
      destination: 'console'
    }
  },
  security: {
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotation: { enabled: true, interval: 86400000 }
    },
    authentication: {
      providers: ['jwt', 'oauth2', 'api-key'],
      jwt: {
        secret: 'your-secret',
        algorithms: ['HS256', 'RS256'],
        expiresIn: '1h'
      }
    }
  },
  loadBalancing: {
    algorithm: 'round-robin',
    healthCheck: true,
    stickySession: { enabled: false },
    failover: { enabled: true, maxFailures: 3, recoveryTime: 30000 }
  },
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    recoveryTimeout: 60000,
    monitoringPeriod: 10000
  },
  rateLimit: {
    enabled: true,
    global: { requestsPerSecond: 1000, burstSize: 2000 },
    perService: { requestsPerSecond: 100, burstSize: 200 },
    perUser: { requestsPerSecond: 10, burstSize: 20 }
  },
  caching: {
    enabled: true,
    type: 'redis',
    ttl: 300000,
    maxSize: 1000,
    compression: true
  }
};
```

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                Service Integration Engine                │
├─────────────────────────────────────────────────────────┤
│  Discovery  │  Security  │ Load Balancer │ Circuit Breaker │
│   Manager   │  Manager   │    Manager    │    Manager      │
├─────────────────────────────────────────────────────────┤
│ Rate Limit  │  Caching   │    Retry      │   Tracing       │
│  Manager    │  Manager   │   Manager     │   Manager       │
├─────────────────────────────────────────────────────────┤
│              Monitoring & Alerting Manager              │
└─────────────────────────────────────────────────────────┘
           │                    │                    │
    ┌──────▼──────┐    ┌────────▼────────┐    ┌─────▼─────┐
    │ API Gateway │    │ WebSocket Server │    │ Message   │
    │  Manager    │    │    Manager       │    │  Queue    │
    └─────────────┘    └─────────────────┘    │ Manager   │  
                                              └───────────┘
```

### Data Flow

```
Client Request
     │
     ▼
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ API Gateway  │───▶│ Load        │───▶│ Target       │
│ (Routing,    │    │ Balancer    │    │ Service      │
│  Security,   │    │ (Service    │    │ (Business    │
│  Rate Limit) │    │  Selection) │    │  Logic)      │
└──────────────┘    └─────────────┘    └──────────────┘
     │                      │                  │
     ▼                      ▼                  ▼
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ Monitoring   │    │ Circuit     │    │ Caching      │
│ (Metrics,    │    │ Breaker     │    │ (Response    │
│  Tracing,    │    │ (Failure    │    │  Storage)    │
│  Logging)    │    │  Detection) │    │              │
└──────────────┘    └─────────────┘    └──────────────┘
```

## 🔐 Security Features

### Authentication & Authorization

- **Multi-Provider Support** - JWT, OAuth2, API Keys, mTLS
- **Role-Based Access Control (RBAC)** - Fine-grained permissions
- **Attribute-Based Access Control (ABAC)** - Dynamic authorization
- **Token Validation** - Automatic token verification and refresh
- **Session Management** - Secure session handling and expiration

### Data Protection

- **Field-Level Encryption** - Sensitive data encryption
- **Transport Security** - TLS/SSL with certificate management
- **Input Sanitization** - XSS, SQL injection, and CSRF protection
- **Rate Limiting** - DDoS protection and abuse prevention
- **Audit Logging** - Comprehensive security event logging

### Compliance

- **GDPR Ready** - Data privacy and protection features
- **SOX Compliance** - Financial data handling standards
- **HIPAA Support** - Healthcare data protection
- **PCI DSS** - Payment card data security standards

## 🚀 Performance Optimization

### Caching Strategies

- **Multi-Tier Caching** - Memory, Redis, and distributed caching
- **Smart Invalidation** - TTL, LRU, and event-based invalidation
- **Cache Warming** - Proactive cache population
- **Compression** - Automatic response compression
- **CDN Integration** - Static asset optimization

### Load Balancing

- **Multiple Algorithms** - Round-robin, weighted, least connections, IP hash
- **Health-Based Routing** - Automatic unhealthy service exclusion
- **Sticky Sessions** - Session affinity support
- **Geographic Routing** - Location-based service selection
- **Auto-Scaling Integration** - Dynamic capacity adjustment

### Connection Management

- **Connection Pooling** - Efficient resource utilization  
- **Keep-Alive** - Persistent connection management
- **Request Multiplexing** - HTTP/2 and HTTP/3 support
- **Compression** - Automatic request/response compression
- **Streaming** - Large data transfer optimization

## 📈 Scalability

### Horizontal Scaling

- **Stateless Design** - Scale any component independently
- **Service Discovery** - Automatic service registration and discovery
- **Load Distribution** - Even request distribution across instances
- **Session Clustering** - Shared session state across instances
- **Database Sharding** - Distributed data storage strategies

### Performance Monitoring

- **Real-time Metrics** - Live performance dashboards
- **Predictive Analytics** - Capacity planning and forecasting
- **Bottleneck Detection** - Automated performance issue identification
- **Auto-scaling Triggers** - Threshold-based scaling decisions
- **Cost Optimization** - Resource usage analysis and recommendations

## 🛠️ Development & Testing

### Testing Support

```typescript
import { createTestEngine } from '@codai/advanced-service-integrations/testing';

const testEngine = createTestEngine({
  mockServices: true,
  recordRequests: true,
  validateResponses: true
});

// Mock service responses
testEngine.mockService('user-service', {
  '/api/users/123': { id: '123', name: 'Test User' }
});

// Test service integration
const result = await testEngine.callService('user-service', '/api/users/123');
expect(result.success).toBe(true);
expect(result.data.name).toBe('Test User');

// Verify request patterns
const requests = testEngine.getRecordedRequests('user-service');
expect(requests).toHaveLength(1);
expect(requests[0].endpoint).toBe('/api/users/123');
```

### Development Tools

- **Configuration Validation** - Schema-based config validation
- **Health Check Dashboard** - Visual service health monitoring
- **Request/Response Logging** - Detailed interaction tracing
- **Performance Profiling** - Request timing and resource usage
- **Mock Service Support** - Development and testing utilities

## 🔧 Advanced Configuration

### Custom Middleware

```typescript
// Create custom middleware
const customAuthMiddleware = {
  name: 'custom-auth',
  order: 1,
  enabled: true,
  configuration: {
    provider: 'custom',
    validateToken: async (token: string) => {
      // Custom token validation logic
      return await validateCustomToken(token);
    }
  }
};

// Add to gateway configuration
const gatewayConfig = {
  middleware: [customAuthMiddleware],
  // ... other config
};
```

### Plugin System

```typescript
// Create custom plugin
class CustomMetricsPlugin {
  async initialize(engine: ServiceIntegrationEngine) {
    engine.on('request:completed', (data) => {
      // Custom metrics logic
      this.recordCustomMetric(data);
    });
  }
  
  private recordCustomMetric(data: any) {
    // Implementation
  }
}

// Register plugin
engine.registerPlugin(new CustomMetricsPlugin());
```

### Event System

```typescript
// Listen to system events
engine.on('service:registered', (event) => {
  console.log('Service registered:', event.serviceId);
});

engine.on('service:health-changed', (event) => {
  if (event.status === 'unhealthy') {
    console.log('Service unhealthy:', event.serviceId);
    // Trigger alerts or recovery actions
  }
});

engine.on('circuit-breaker:opened', (serviceId) => {
  console.log('Circuit breaker opened for:', serviceId);
  // Implement fallback logic
});

engine.on('rate-limit:exceeded', (data) => {
  console.log('Rate limit exceeded:', data);
  // Log security event
});
```

## 📚 API Reference

### ServiceIntegrationEngine

#### Methods
- `initialize()` - Initialize the integration engine
- `registerService(config)` - Register a service for integration
- `unregisterService(serviceId)` - Remove service registration
- `callService(serviceId, endpoint, options)` - Make service call
- `getServiceHealth(serviceId)` - Get service health status
- `getAllServiceHealth()` - Get all service health statuses
- `getServiceMetrics(serviceId)` - Get service metrics
- `getAggregatedMetrics()` - Get system-wide metrics
- `shutdown()` - Gracefully shutdown the engine

#### Events
- `engine:initialized` - Engine initialization complete
- `service:registered` - Service successfully registered
- `service:unregistered` - Service removed
- `service:health-changed` - Service health status changed
- `service:metrics` - New service metrics available
- `circuit-breaker:opened` - Circuit breaker activated
- `rate-limit:exceeded` - Rate limit threshold exceeded
- `alert:triggered` - System alert triggered

### APIGatewayManager

#### Methods
- `start()` - Start the API gateway
- `stop()` - Stop the API gateway
- `addRoute(route)` - Add new route
- `removeRoute(routeId)` - Remove existing route
- `updateRoute(routeId, updates)` - Update route configuration
- `getMetrics()` - Get gateway metrics
- `getHealthStatus()` - Get gateway health status

#### Events
- `gateway:started` - Gateway started successfully
- `gateway:stopped` - Gateway stopped
- `route:added` - New route added
- `route:removed` - Route removed
- `request:received` - New request received
- `request:proxied` - Request forwarded to service
- `response:received` - Response received from service

### WebSocketManager

#### Methods
- `start()` - Start WebSocket server
- `stop()` - Stop WebSocket server
- `sendToSocket(socketId, event, data)` - Send to specific socket
- `sendToRoom(room, event, data)` - Send to room
- `sendToUser(userId, event, data)` - Send to user
- `broadcast(event, data)` - Broadcast to all
- `getRoomInfo(room)` - Get room information
- `getAllRooms()` - Get all rooms
- `getMetrics()` - Get WebSocket metrics
- `getHealthStatus()` - Get server health status

#### Events
- `websocket:started` - Server started
- `connection:established` - New connection
- `connection:disconnected` - Connection closed
- `room:joined` - User joined room
- `room:left` - User left room
- `message:received` - Message received
- `message:sent` - Message sent

### MessageQueueManager

#### Methods
- `start()` - Start message queue system
- `stop()` - Stop message queue system
- `sendMessage(queue, message, options)` - Send message
- `startConsumer(queue, handler, options)` - Start consumer
- `stopConsumer(queue)` - Stop consumer
- `getQueueMetrics(queue)` - Get queue metrics
- `getAllQueueMetrics()` - Get all queue metrics
- `getHealthStatus()` - Get system health

#### Events
- `queue:started` - Queue system started
- `message:sent` - Message sent successfully
- `message:received` - Message received
- `consumer:started` - Consumer started
- `consumer:stopped` - Consumer stopped
- `metrics:collected` - Metrics collected

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/codai/advanced-service-integrations.git
cd advanced-service-integrations

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build

# Start development server
npm run dev
```

### Testing

```bash
# Run unit tests
npm run test:unit

# Run integration tests  
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern TypeScript and Node.js best practices
- Inspired by enterprise service mesh architectures  
- Leverages battle-tested open source libraries
- Designed for cloud-native and microservice environments

---

**CODAI Advanced Service Integrations** - Enterprise-grade service integration made simple.

For more examples and detailed documentation, visit our [Documentation Site](https://docs.codai.dev/service-integrations).
