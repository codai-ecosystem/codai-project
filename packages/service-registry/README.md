# @codai/service-registry

Service discovery and registration system for the CODAI ecosystem.

## Features

- Service registration and discovery
- Health monitoring
- Load balancing
- Real-time service events
- Redis-backed persistence (planned)
- Multi-strategy load balancing (planned)

## Quick Start

```typescript
import { ServiceRegistry } from '@codai/service-registry';

// Initialize registry
const registry = new ServiceRegistry();
await registry.initialize();

// Register a service
await registry.register({
  name: 'logai',
  version: '1.0.0',
  endpoint: 'https://logai.ro/api',
  capabilities: ['logging', 'analytics'],
  tags: ['core', 'logging'],
});

// Discover services
const endpoints = await registry.discover('logai');
console.log('LogAI endpoints:', endpoints);

// Get health status
const health = await registry.getHealth('logai');
console.log('LogAI health:', health);

// Load balance requests
const endpoint = await registry.loadBalance('logai');
if (endpoint) {
  console.log('Using endpoint:', endpoint.url);
}
```

## API Reference

### ServiceRegistry

#### Methods

- `initialize()` - Initialize the registry
- `register(config)` - Register a service
- `discover(serviceName?)` - Discover services
- `getHealth(serviceName?)` - Get health status
- `loadBalance(serviceName)` - Get load-balanced endpoint
- `updateEndpoint(serviceName, endpoint)` - Update service endpoint
- `unregister(serviceName)` - Unregister a service
- `getMetrics()` - Get registry metrics
- `shutdown()` - Gracefully shutdown

### Interfaces

#### ServiceConfig
```typescript
interface ServiceConfig {
  name: string;
  version: string;
  endpoint: string;
  healthPath?: string;
  capabilities: string[];
  metadata?: Record<string, any>;
  weight?: number;
  tags?: string[];
  dependencies?: string[];
}
```

#### ServiceEndpoint
```typescript
interface ServiceEndpoint {
  serviceName: string;
  url: string;
  weight: number;
  healthy: boolean;
  lastHealthCheck?: Date;
  responseTime?: number;
  metadata?: Record<string, any>;
}
```

## Development Status

This is currently a basic implementation. Full Redis integration, health monitoring, and advanced load balancing features will be added as the CODAI ecosystem evolves.

## License

MIT
