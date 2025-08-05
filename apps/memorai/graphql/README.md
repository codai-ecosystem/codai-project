# MemorAI GraphQL API

A comprehensive GraphQL API for the MemorAI platform, providing powerful querying capabilities for memory management, search operations, analytics, and system administration.

## 🚀 Quick Start

### Start the GraphQL Server

```bash
cd apps/memorai/graphql
npm install
npm start
```

The GraphQL server will be available at:
- **GraphQL Endpoint**: `http://localhost:4500/graphql`
- **GraphQL Playground**: `http://localhost:4500/graphql` (browser)

### Using the GraphQL Client

```javascript
const MemorAIGraphQLClient = require('./memorai-graphql-client');

const client = new MemorAIGraphQLClient({
  endpoint: 'http://localhost:4500/graphql',
  apiKey: 'your-api-key' // optional
});

// Create a memory
const memory = await client.createMemory({
  content: 'My first GraphQL memory',
  category: 'personal',
  tags: ['important', 'graphql']
});

// Search memories
const results = await client.search('GraphQL memory', {
  algorithm: 'SEMANTIC',
  limit: 10
});

console.log(results);
```

## 📊 API Overview

### Core Features

- **Memory Management**: Create, read, update, delete memories
- **Advanced Search**: Multiple search algorithms (semantic, exact, fuzzy, full-text, hybrid)
- **Analytics**: Comprehensive analytics and insights
- **Batch Operations**: Bulk import/export and batch processing
- **Real-time Subscriptions**: Live updates for memory changes
- **System Operations**: Health monitoring, cache management, database optimization

### GraphQL Schema Highlights

#### Memory Type
```graphql
type Memory {
  id: ID!
  content: String!
  category: String
  tags: [String!]
  metadata: JSON
  createdAt: Date
  updatedAt: Date
  embedding: [Float!]
  similarity: Float
  version: Int
}
```

#### Search Operations
```graphql
type Query {
  search(query: String!, options: SearchOptions): SearchResult!
  similarMemories(memoryId: ID!, limit: Int = 10): [Memory!]!
}

type SearchResult {
  memories: [Memory!]!
  total: Int!
  queryTime: Float!
  algorithmUsed: String!
  facets: SearchFacets
}
```

#### Analytics
```graphql
type Analytics {
  totalMemories: Int!
  totalSearches: Int!
  averageQueryTime: Float!
  memoryGrowthRate: Float!
  categories: [CategoryStat!]!
  tags: [TagStat!]!
  searchPatterns: [SearchPattern!]!
  performanceMetrics: PerformanceMetrics!
}
```

## 🔧 Usage Examples

### Basic Operations

#### Create a Memory
```graphql
mutation {
  createMemory(input: {
    content: "GraphQL makes API interactions more efficient"
    category: "technology"
    tags: ["graphql", "api", "efficiency"]
    metadata: { importance: "high" }
  }) {
    id
    content
    tags
    createdAt
  }
}
```

#### Search Memories
```graphql
query {
  search(
    query: "GraphQL API"
    options: {
      algorithm: SEMANTIC
      limit: 5
      sortBy: RELEVANCE
    }
  ) {
    memories {
      id
      content
      similarity
      tags
    }
    total
    queryTime
    algorithmUsed
  }
}
```

#### Get Analytics
```graphql
query {
  analytics {
    totalMemories
    totalSearches
    categories {
      category
      count
      percentage
    }
    performanceMetrics {
      averageResponseTime
      throughput
      cacheHitRate
    }
  }
}
```

### Advanced Operations

#### Batch Import
```graphql
mutation {
  importMemories(memories: [
    {
      content: "First batch memory"
      category: "batch"
      tags: ["import", "test"]
    },
    {
      content: "Second batch memory"
      category: "batch"
      tags: ["import", "test"]
    }
  ]) {
    success
    processed
    errors {
      index
      error
    }
    results {
      id
      content
    }
  }
}
```

#### Advanced Search with Facets
```graphql
query {
  search(
    query: "technology"
    options: {
      algorithm: HYBRID
      categories: ["tech", "programming"]
      tags: ["important"]
      dateFrom: "2024-01-01"
      limit: 20
    }
  ) {
    memories {
      id
      content
      category
      tags
      similarity
    }
    facets {
      categories {
        category
        count
      }
      tags {
        tag
        count
      }
      dateRanges {
        range
        count
      }
    }
  }
}
```

#### Memory Management
```graphql
mutation {
  archiveMemory(id: "memory-id") {
    id
    content
    metadata
    updatedAt
  }
}

mutation {
  duplicateMemory(id: "memory-id") {
    id
    content
    tags
    createdAt
  }
}
```

### Real-time Subscriptions

#### Listen for New Memories
```graphql
subscription {
  memoryCreated {
    id
    content
    category
    tags
    createdAt
  }
}
```

#### Monitor Search Activity
```graphql
subscription {
  searchPerformed {
    query
    algorithm
    resultCount
    queryTime
    timestamp
  }
}
```

#### System Alerts
```graphql
subscription {
  systemAlert {
    level
    message
    timestamp
    metadata
  }
}
```

## 🛠️ Configuration

### Environment Variables

```bash
# GraphQL Server Configuration
GRAPHQL_PORT=4500
GRAPHQL_ENDPOINT=/graphql
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true

# MemorAI API Configuration
MEMORAI_API_URL=http://localhost:4006
MEMORAI_API_KEY=your-api-key

# Authentication
AUTH_ENABLED=false
JWT_SECRET=your-jwt-secret

# Caching
CACHE_ENABLED=true
CACHE_TTL=300

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

### Client Configuration

```javascript
const client = new MemorAIGraphQLClient({
  endpoint: 'http://localhost:4500/graphql',
  apiKey: 'your-api-key',
  timeout: 30000,
  retries: 3,
  cache: true
});
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Integration Tests
```bash
npm run test:integration
```

### Example Test
```javascript
describe('MemorAI GraphQL API', () => {
  test('should create and retrieve memory', async () => {
    const client = new MemorAIGraphQLClient();
    
    const memory = await client.createMemory({
      content: 'Test memory',
      category: 'test',
      tags: ['testing']
    });
    
    expect(memory.id).toBeDefined();
    
    const retrieved = await client.getMemory(memory.id);
    expect(retrieved.content).toBe('Test memory');
  });
});
```

## 📈 Performance

### Query Optimization
- Use field selection to limit data transfer
- Implement query depth limiting
- Use DataLoader for N+1 query prevention
- Cache frequently accessed data

### Best Practices
```graphql
# Good: Select only needed fields
query {
  memories(limit: 10) {
    id
    content
    tags
  }
}

# Avoid: Selecting unnecessary data
query {
  memories(limit: 10) {
    id
    content
    tags
    metadata
    embedding  # Large field, only select when needed
    createdAt
    updatedAt
  }
}
```

### Caching Strategy
- Query-level caching for expensive operations
- Field-level caching for computed values
- Redis integration for distributed caching
- Automatic cache invalidation

## 🔒 Security

### Authentication
```javascript
const client = new MemorAIGraphQLClient({
  endpoint: 'http://localhost:4500/graphql',
  apiKey: 'Bearer your-jwt-token'
});
```

### Authorization
- Role-based access control
- Field-level permissions
- Query complexity analysis
- Rate limiting per user

### Input Validation
- Schema-level validation
- Custom scalar validation
- Sanitization of user inputs
- SQL injection prevention

## 📚 Schema Documentation

### Available Operations

#### Queries
- `memory(id)` - Get single memory by ID
- `memories(options)` - List memories with filtering
- `search(query, options)` - Search memories
- `similarMemories(memoryId, limit)` - Find similar memories
- `analytics` - Get comprehensive analytics
- `systemInfo` - Get system information

#### Mutations
- `createMemory(input)` - Create new memory
- `updateMemory(id, input)` - Update existing memory
- `deleteMemory(id)` - Delete memory
- `batchMemories(operations)` - Batch operations
- `importMemories(memories)` - Bulk import
- `exportMemories(options)` - Bulk export

#### Subscriptions
- `memoryCreated` - New memory notifications
- `memoryUpdated` - Memory update notifications
- `memoryDeleted` - Memory deletion notifications
- `searchPerformed` - Search activity monitoring
- `systemAlert` - System alerts and warnings

### Input Types
- `MemoryInput` - Memory creation data
- `MemoryUpdateInput` - Memory update data
- `SearchOptions` - Search configuration
- `BatchMemoryInput` - Batch operation data

### Enums
- `SearchAlgorithm` - Available search algorithms
- `SortField` - Sorting options
- `SortOrder` - Sort direction
- `BatchOperation` - Batch operation types

## 🚀 Deployment

### Production Setup
```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 4500

CMD ["npm", "start"]
```

### Health Checks
```bash
# GraphQL health check
curl -X POST http://localhost:4500/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ health { status version } }"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
