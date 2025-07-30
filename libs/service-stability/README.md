# Service Stability System

Enterprise-grade service stability and integration framework for the CODAI ecosystem. Provides comprehensive health monitoring, load balancing, failover capabilities, and inter-service communication protocols.

## Features

### 🏥 Health Monitoring
- **Real-time Health Checks**: HTTP, TCP, and custom health checks
- **System Resource Monitoring**: CPU, memory, disk, and network usage
- **Service Health Tracking**: Individual service status and metrics
- **Intelligent Alerting**: Configurable thresholds and notification channels
- **Health History**: Trend analysis and health pattern recognition

### 🌐 Gateway Optimization
- **Advanced Load Balancing**: Round-robin, least-connections, weighted, and IP-hash algorithms
- **Circuit Breaker Pattern**: Automatic failover and recovery mechanisms
- **Rate Limiting**: Configurable request rate limits with burst handling
- **Intelligent Routing**: Dynamic route configuration and path rewriting
- **Performance Monitoring**: Response time tracking and bottleneck identification

### 📡 Communication Protocols
- **Multi-Protocol Support**: HTTP, WebSocket, gRPC, and message queues
- **Service Discovery**: Automatic service registration and discovery
- **Message Queuing**: Redis, RabbitMQ, Kafka, and NATS support
- **Real-time Communication**: WebSocket connections and event broadcasting
- **RPC Framework**: Remote procedure calls with timeout and retry logic

### 📊 System Monitoring
- **Comprehensive Metrics**: System performance and application metrics
- **Real-time Dashboards**: Live monitoring and visualization
- **Predictive Analytics**: Trend analysis and anomaly detection
- **Custom Metrics**: Application-specific metric collection
- **Alert Management**: Configurable alerts and notification actions

## Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test
```

### Basic Usage

```typescript
import { ServiceStabilitySystem } from '@codai/service-stability';

// Initialize the stability system
const stabilitySystem = new ServiceStabilitySystem({
  health: {
    checkInterval: 30000,
    thresholds: {
      cpu: 80,
      memory: 85,
      disk: 90,
      responseTime: 5000
    },
    alerting: {
      enabled: true,
      channels: ['console', 'webhook']
    }
  },
  gateway: {
    port: 8080,
    loadBalancing: {
      algorithm: 'round-robin',
      healthCheckEnabled: true,
      retryAttempts: 3
    },
    circuitBreaker: {
      threshold: 50,
      timeout: 60000,
      resetTimeout: 30000
    }
  },
  communication: {
    protocols: ['http', 'websocket', 'redis'],
    messageQueue: {
      type: 'redis',
      connection: {
        host: 'localhost',
        port: 6379
      }
    }
  },
  monitoring: {
    metricsInterval: 10000,
    retention: '7d',
    dashboard: {
      enabled: true,
      port: 9090
    },
    alerts: {
      enabled: true,
      rules: [
        {
          id: 'high-cpu',
          name: 'High CPU Usage',
          metric: 'cpu.usage',
          threshold: { warning: 70, critical: 90 },
          condition: 'greater_than',
          duration: 300000,
          enabled: true,
          actions: [
            { type: 'console', config: {} },
            { type: 'webhook', config: { url: 'https://alerts.example.com/webhook' } }
          ]
        }
      ]
    }
  }
});

// Start the system
await stabilitySystem.start();

// Register a service
await stabilitySystem.registerService({
  name: 'user-service',
  url: 'http://localhost:3001',
  healthCheckPath: '/health',
  port: 3001,
  version: '1.0.0',
  metadata: {
    team: 'backend',
    environment: 'production'
  }
});

// Get system health
const health = await stabilitySystem.getSystemHealth();
console.log('System Health:', health);

// Get metrics
const metrics = await stabilitySystem.getMetrics();
console.log('System Metrics:', metrics);
```

## Configuration

### Health Monitoring Configuration

```typescript
interface HealthConfig {
  checkInterval: number; // Health check interval in milliseconds
  thresholds: {
    cpu: number;        // CPU usage threshold (%)
    memory: number;     // Memory usage threshold (%)
    disk: number;       // Disk usage threshold (%)
    responseTime: number; // Response time threshold (ms)
  };
  alerting: {
    enabled: boolean;
    channels: string[]; // ['console', 'webhook', 'email', 'slack']
    webhooks?: string[];
  };
}
```

### Gateway Configuration

```typescript
interface GatewayConfig {
  port: number;
  loadBalancing: {
    algorithm: 'round-robin' | 'least-connections' | 'weighted' | 'ip-hash';
    healthCheckEnabled: boolean;
    retryAttempts: number;
  };
  circuitBreaker: {
    threshold: number;    // Failure threshold
    timeout: number;      // Circuit open timeout
    resetTimeout: number; // Reset attempt timeout
  };
  rateLimit: {
    windowMs: number;     // Time window
    max: number;          // Max requests per window
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
}
```

### Communication Configuration

```typescript
interface CommunicationConfig {
  protocols: string[]; // ['http', 'websocket', 'grpc', 'redis']
  messageQueue: {
    type: 'redis' | 'rabbitmq' | 'kafka' | 'nats';
    connection: {
      host: string;
      port: number;
      username?: string;
      password?: string;
    };
  };
  serviceDiscovery: {
    type: 'consul' | 'etcd' | 'zookeeper' | 'redis';
    connection: any;
  };
}
```

### Monitoring Configuration

```typescript
interface MonitoringConfig {
  metricsInterval: number; // Metrics collection interval
  retention: string;       // Data retention period ('7d', '30d', etc.)
  dashboard: {
    enabled: boolean;
    port: number;
  };
  alerts: {
    enabled: boolean;
    rules: AlertConfig[];
  };
}
```

## API Reference

### ServiceStabilitySystem

#### Methods

- `start()`: Start the stability system
- `shutdown()`: Gracefully shutdown the system
- `registerService(service)`: Register a service for monitoring
- `unregisterService(serviceName)`: Unregister a service
- `getSystemHealth()`: Get overall system health status
- `getMetrics()`: Get current system metrics
- `performFailover(serviceName, reason)`: Perform emergency failover

### ServiceHealthManager

#### Methods

- `start()`: Start health monitoring
- `stop()`: Stop health monitoring
- `registerService(service)`: Register service for health checks
- `addHealthCheck(check)`: Add custom health check
- `getOverallHealth()`: Get system health overview
- `getActiveAlerts()`: Get current active alerts

### GatewayOptimizer

#### Methods

- `start()`: Start the gateway server
- `stop()`: Stop the gateway server
- `addRoute(service)`: Add service route
- `removeRoute(serviceName)`: Remove service route
- `activateFailover(serviceName)`: Activate failover for service
- `getStatus()`: Get gateway status and metrics

### CommunicationProtocol

#### Methods

- `start()`: Start communication system
- `stop()`: Stop communication system
- `registerEndpoint(service)`: Register service endpoint
- `sendMessage(message)`: Send message through system
- `subscribeToMessages(pattern, handler)`: Subscribe to messages
- `discoverServices(serviceName?)`: Discover available services

### SystemMonitor

#### Methods

- `start()`: Start monitoring system
- `stop()`: Stop monitoring system
- `recordResponseTime(time)`: Record response time metric
- `recordError(type)`: Record error occurrence
- `recordCustomMetric(name, value)`: Record custom metric
- `addAlertRule(config)`: Add alert rule
- `getActiveAlerts()`: Get active alerts

## Advanced Features

### Custom Health Checks

```typescript
// Add custom health check
healthManager.addHealthCheck({
  id: 'database-connection',
  name: 'Database Connection Check',
  type: 'custom',
  config: {
    check: async () => {
      try {
        await database.ping();
        return {
          status: 'healthy',
          message: 'Database connection is healthy',
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          message: `Database connection failed: ${error.message}`,
          timestamp: new Date().toISOString()
        };
      }
    }
  },
  interval: 30000,
  timeout: 5000,
  retries: 3
});
```

### Custom Load Balancing

```typescript
// Implement custom load balancing algorithm
class CustomLoadBalancer {
  selectTarget(targets, request) {
    // Custom logic for target selection
    return targets.find(target => 
      target.metadata.region === request.headers['x-region']
    ) || targets[0];
  }
}
```

### Message Queue Integration

```typescript
// Subscribe to service events
await communicationProtocol.subscribeToMessages(
  'events:*',
  (message) => {
    console.log('Received event:', message);
    // Process event
  }
);

// Send service request
await communicationProtocol.sendMessage({
  id: 'req-12345',
  type: 'request',
  payload: { action: 'process', data: {...} },
  metadata: {
    timestamp: new Date().toISOString(),
    source: 'api-service',
    destination: 'worker-service'
  }
});
```

### Custom Monitoring Metrics

```typescript
// Record business metrics
systemMonitor.recordCustomMetric('orders_processed', 150);
systemMonitor.recordCustomMetric('revenue_generated', 25000);

// Add custom alert rules
systemMonitor.addAlertRule({
  id: 'low-orders',
  name: 'Low Order Volume',
  metric: 'custom.orders_processed',
  threshold: { warning: 50, critical: 20 },
  condition: 'less_than',
  duration: 300000,
  enabled: true,
  actions: [
    { type: 'slack', config: { channel: '#alerts' } }
  ]
});
```

## Integration Examples

### Express.js Integration

```typescript
import express from 'express';
import { ServiceStabilitySystem } from '@codai/service-stability';

const app = express();
const stability = new ServiceStabilitySystem(config);

// Middleware for response time tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    stability.systemMonitor.recordResponseTime(responseTime);
  });
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = await stability.getSystemHealth();
  res.status(health.overall.status === 'healthy' ? 200 : 503).json(health);
});

app.listen(3000, async () => {
  await stability.start();
  console.log('Server started with stability monitoring');
});
```

### Docker Integration

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["node", "index.js"]
```

### Kubernetes Integration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: service-with-stability
spec:
  template:
    spec:
      containers:
      - name: app
        image: your-app:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Performance Considerations

### Memory Usage
- Metrics are automatically cleaned up based on retention policy
- Connection pools are managed automatically
- Circuit breakers prevent resource exhaustion

### CPU Usage
- Health checks are distributed across time windows
- Metrics collection is optimized for minimal overhead
- Load balancing algorithms are highly efficient

### Network Usage
- Service discovery uses efficient polling intervals
- Message queuing provides reliable delivery with minimal overhead
- WebSocket connections are managed with automatic reconnection

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check metrics retention settings
   - Monitor active connection counts
   - Review health check intervals

2. **Circuit Breaker False Positives**
   - Adjust threshold settings
   - Review timeout configurations
   - Check service health check reliability

3. **Load Balancing Issues**
   - Verify service health status
   - Check target availability
   - Review algorithm selection

### Debug Mode

```typescript
const stability = new ServiceStabilitySystem({
  ...config,
  debug: true // Enable debug logging
});
```

### Logging

The system uses structured logging with the following levels:
- `ERROR`: System errors and failures
- `WARN`: Warnings and degraded performance
- `INFO`: General system information
- `DEBUG`: Detailed debugging information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- GitHub Issues: [Report bugs and request features](https://github.com/codai/service-stability/issues)
- Documentation: [Full API documentation](https://docs.codai.dev/service-stability)
- Community: [Join our Discord](https://discord.gg/codai)
