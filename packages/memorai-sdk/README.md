# MemorAI SDK

Official TypeScript SDK for MemorAI - AI Memory Infrastructure Platform

## Installation

```bash
npm install @memorai/sdk
# or
pnpm add @memorai/sdk
# or
yarn add @memorai/sdk
```

## Quick Start

```typescript
import { createMemorAIClient } from '@memorai/sdk';

// Create client
const memorai = createMemorAIClient({
  apiUrl: 'https://api.memorai.ro/api',
  apiKey: 'your-api-key-here'
});

// Create a memory
const memory = await memorai.createMemory({
  content: 'This is an important piece of information',
  tags: ['important', 'project-alpha'],
  agentId: 'my-agent',
  priority: 'high'
});

// Search memories
const results = await memorai.searchMemories({
  query: 'important information',
  limit: 10
});

// Get specific memory
const specificMemory = await memorai.getMemory({
  id: memory.memory.id
});

// Update memory
await memorai.updateMemory({
  id: memory.memory.id,
  content: 'Updated important information',
  priority: 'critical'
});

// Delete memory
await memorai.deleteMemory({
  id: memory.memory.id,
  reason: 'No longer needed'
});
```

## Environment-Specific Clients

```typescript
import { 
  createProductionClient,
  createStagingClient,
  createDevelopmentClient 
} from '@memorai/sdk';

// Production client (optimized for performance)
const prodClient = createProductionClient('your-api-key');

// Staging client (with debug enabled)
const stagingClient = createStagingClient('your-api-key');

// Development client (local development)
const devClient = createDevelopmentClient('your-api-key');
```

## Real-time Events

```typescript
// Subscribe to memory events
await memorai.subscribe({
  agentId: 'my-agent',
  eventTypes: ['created', 'updated', 'deleted']
});

// Listen for events
memorai.on('memoryEvent', (notification) => {
  console.log('Memory event:', notification.type, notification.memory);
});

// Handle errors
memorai.on('error', (error) => {
  console.error('MemorAI error:', error);
});
```

## Advanced Usage

### Custom Configuration

```typescript
import { MemorAIClient } from '@memorai/sdk';

const client = new MemorAIClient({
  apiUrl: 'https://api.memorai.ro/api',
  apiKey: 'your-api-key',
  timeout: 30000,
  maxRetries: 3,
  debug: true,
  headers: {
    'X-Custom-Header': 'custom-value'
  }
});
```

### Bulk Operations

```typescript
// Bulk delete memories
await memorai.bulkDeleteMemories({
  ids: ['memory-id-1', 'memory-id-2', 'memory-id-3'],
  reason: 'Cleanup old memories'
});
```

### Health Monitoring

```typescript
// Check service health
const health = await memorai.healthCheck();
console.log('Service status:', health.status);

// Get service statistics
const stats = await memorai.getStats();
console.log('Total memories:', stats.totalMemories);
```

## API Reference

### MemorAIClient

#### Methods

- `createMemory(request)` - Create a new memory
- `searchMemories(request)` - Search memories semantically
- `getMemory(request)` - Get specific memory by ID
- `listMemories(request)` - List memories with pagination
- `updateMemory(request)` - Update existing memory
- `deleteMemory(request)` - Delete specific memory
- `bulkDeleteMemories(request)` - Delete multiple memories
- `subscribe(options)` - Subscribe to real-time events
- `unsubscribe()` - Unsubscribe from events
- `disconnect()` - Disconnect WebSocket
- `healthCheck()` - Check service health
- `getStats()` - Get service statistics
- `testConnection()` - Test API connectivity

#### Events

- `memoryEvent` - Emitted when memory events occur
- `error` - Emitted when errors occur
- `connected` - Emitted when WebSocket connects
- `disconnected` - Emitted when WebSocket disconnects

### Types

```typescript
interface CreateMemoryRequest {
  content: string;
  metadata?: MemoryMetadata;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  entityType?: string;
  agentId?: string;
  generateEmbeddings?: boolean;
}

interface SearchMemoriesRequest {
  query: string;
  limit?: number;
  agentId?: string;
  tags?: string[];
  entityType?: string;
  includeEmbeddings?: boolean;
}

interface Memory {
  id: string;
  content: string;
  metadata: MemoryMetadata;
  tags: string[];
  priority: MemoryPriority;
  entityType: string;
  agentId: string;
  createdAt: Date;
  updatedAt: Date;
  embedding?: number[];
  score?: number;
}
```

## Error Handling

The SDK provides structured error handling:

```typescript
try {
  const memory = await memorai.createMemory({
    content: 'Test memory'
  });
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Validation failed:', error.message);
  } else if (error.code === 'RATE_LIMITED') {
    console.error('Rate limited, retry after:', error.details.retryAfter);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests: `pnpm test`
4. Commit your changes
5. Push to the branch
6. Create a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- Documentation: https://docs.memorai.ro
- GitHub Issues: https://github.com/codai-ecosystem/codai-project/issues
- Email: support@memorai.ro

---

Built with ❤️ by [CODAI Ecosystem](https://codai.ro)
