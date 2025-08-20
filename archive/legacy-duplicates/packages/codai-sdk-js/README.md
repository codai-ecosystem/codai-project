# CODAI SDK for JavaScript/TypeScript

Official JavaScript/TypeScript SDK for the CODAI Ecosystem, providing comprehensive access to all CODAI services including Authentication, Admin Dashboard, Hub Services, and the CBD Universal Database.

## 🚀 Quick Start

### Installation

```bash
npm install @codai/sdk-js
# or
yarn add @codai/sdk-js
# or
pnpm add @codai/sdk-js
```

### Basic Usage

```typescript
import { createClient } from '@codai/sdk-js';

// Create client instance
const codai = createClient({
  baseUrl: 'http://localhost:4003', // Gateway URL
  timeout: 30000
});

// Test connection
const isConnected = await codai.testConnection();
console.log('Connected to CODAI:', isConnected);

// Check Gateway health
const health = await codai.gateway.getHealth();
console.log('Gateway status:', health.status);
```

## 🔧 Configuration

```typescript
import { CodeaiClient } from '@codai/sdk-js';

const client = new CodeaiClient({
  baseUrl: 'https://api.codai.dev',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  apiKey: 'your-api-key', // Optional
  headers: {
    'Custom-Header': 'value'
  }
});
```

## 🔐 Authentication

### Login & Registration

```typescript
// Register new user
const session = await codai.id.register({
  email: 'user@example.com',
  password: 'secure-password',
  name: 'John Doe'
});

// Login
const session = await codai.id.login({
  email: 'user@example.com',
  password: 'secure-password'
});

// Access user info
console.log('User:', session.user);
console.log('Token:', session.token);

// Check if authenticated
console.log('Authenticated:', codai.isAuthenticated());
```

### Token Management

```typescript
// Set token manually
codai.setAuthToken('your-jwt-token');

// Refresh token
const newToken = await codai.id.refreshToken({
  refreshToken: 'your-refresh-token'
});

// Logout
await codai.id.logout();
```

## 📊 Admin Operations

```typescript
// Get dashboard data
const dashboard = await codai.admin.getDashboardData();

// Get system metrics
const metrics = await codai.admin.getSystemMetrics();

// Get alerts
const alerts = await codai.admin.getAlerts();

// Get logs
const logs = await codai.admin.getLogs(100, 'gateway');

// Restart service
await codai.admin.restartService('gateway');
```

## 🌐 Hub & Service Discovery

```typescript
// Get registered services
const services = await codai.hub.getServices();

// Register new service
await codai.hub.registerService({
  name: 'my-service',
  url: 'http://localhost:8080',
  port: 8080,
  healthPath: '/health'
});

// Manage routes
const routes = await codai.hub.getRoutes();

const newRoute = await codai.hub.createRoute({
  path: '/api/v1/my-service/*',
  method: 'GET',
  target: 'http://localhost:8080',
  enabled: true
});
```

## 🗄️ CBD Universal Database

### Document Operations

```typescript
// Insert document
const doc = await codai.cbd.insertDocument({
  collection: 'users',
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  }
});

// Get document
const user = await codai.cbd.getDocument('users', doc.id);

// Query documents
const results = await codai.cbd.queryDocuments({
  collection: 'users',
  filter: { age: { $gte: 18 } },
  sort: { name: 1 },
  limit: 10
});

// Update document
await codai.cbd.updateDocument('users', doc.id, {
  data: { age: 31 }
});
```

### Vector Operations

```typescript
// Insert vector
await codai.cbd.insertVector('embeddings', [0.1, 0.2, 0.3], {
  text: 'sample text',
  category: 'documents'
});

// Search similar vectors
const similar = await codai.cbd.searchVectors({
  vector: [0.1, 0.2, 0.3],
  topK: 5,
  filter: { category: 'documents' }
});
```

### Graph Operations

```typescript
// Create nodes
const user = await codai.cbd.createNode('User', {
  name: 'John Doe',
  email: 'john@example.com'
});

const company = await codai.cbd.createNode('Company', {
  name: 'ACME Corp'
});

// Create relationship
await codai.cbd.createRelationship(
  user.id,
  company.id,
  'WORKS_FOR',
  { since: '2020-01-01' }
);

// Cypher query
const results = await codai.cbd.cypherQuery(
  'MATCH (u:User)-[:WORKS_FOR]->(c:Company) RETURN u, c'
);
```

### Key-Value Operations

```typescript
// Set key-value
await codai.cbd.setKeyValue('user:123:session', {
  token: 'abc123',
  expires: Date.now() + 3600000
}, 3600); // TTL in seconds

// Get value
const session = await codai.cbd.getValue('user:123:session');

// Check existence
const exists = await codai.cbd.keyExists('user:123:session');
```

### Time-Series Operations

```typescript
// Insert metric
await codai.cbd.insertTimeSeries(
  'cpu_usage',
  85.5,
  Date.now(),
  { server: 'web-01', region: 'us-east' }
);

// Query metrics
const metrics = await codai.cbd.queryTimeSeries(
  'cpu_usage',
  Date.now() - 3600000, // 1 hour ago
  Date.now(),
  'avg' // aggregation
);
```

## 🤖 AI-Powered Features

```typescript
// Get AI capabilities
const capabilities = await codai.cbd.getAiCapabilities();

// Optimize query
const optimized = await codai.cbd.optimizeQuery({
  collection: 'users',
  filter: { age: { $gte: 18 } }
});

// Get recommendations
const recommendations = await codai.cbd.getQueryRecommendations({
  collection: 'users',
  operation: 'find'
});
```

## 🛡️ Error Handling

```typescript
import { 
  CodeaiError, 
  AuthenticationError, 
  ValidationError,
  NotFoundError 
} from '@codai/sdk-js';

try {
  const user = await codai.id.getProfile();
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.log('Please login first');
    // Redirect to login
  } else if (error instanceof ValidationError) {
    console.log('Invalid data:', error.details);
  } else if (error instanceof NotFoundError) {
    console.log('Resource not found');
  } else if (error instanceof CodeaiError) {
    console.log('CODAI Error:', error.message, error.status);
  } else {
    console.log('Unknown error:', error);
  }
}
```

## 📝 TypeScript Support

The SDK is written in TypeScript and provides full type safety:

```typescript
import { AuthUser, CbdDocument, HealthStatus } from '@codai/sdk-js';

// Fully typed responses
const user: AuthUser = await codai.id.getProfile();
const health: HealthStatus = await codai.gateway.getHealth();

// Type-safe operations
const doc: CbdDocument = await codai.cbd.insertDocument({
  collection: 'products',
  data: {
    name: 'Laptop',
    price: 999.99,
    category: 'Electronics'
  }
});
```

## 🧪 Testing

```typescript
import { createClient } from '@codai/sdk-js';

// Mock client for testing
const mockClient = createClient({
  baseUrl: 'http://localhost:4003'
});

// Test connection
describe('CODAI SDK', () => {
  it('should connect to services', async () => {
    const connected = await mockClient.testConnection();
    expect(connected).toBe(true);
  });

  it('should authenticate user', async () => {
    const session = await mockClient.id.login({
      email: 'test@example.com',
      password: 'password'
    });
    
    expect(session.isAuthenticated).toBe(true);
    expect(session.user.email).toBe('test@example.com');
  });
});
```

## 🔄 Advanced Usage

### Custom HTTP Client Configuration

```typescript
const client = new CodeaiClient({
  baseUrl: 'https://api.codai.dev',
  timeout: 15000,
  retries: 5,
  retryDelay: 2000,
  validateStatus: (status) => status < 500, // Custom validation
  headers: {
    'User-Agent': 'MyApp/1.0',
    'X-Client-Version': '1.0.0'
  }
});
```

### Pagination

```typescript
// Paginated queries
const page1 = await codai.cbd.queryDocuments(
  { collection: 'users' },
  { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }
);

console.log('Total users:', page1.pagination.total);
console.log('Has next page:', page1.pagination.hasNext);

// Load next page
if (page1.pagination.hasNext) {
  const page2 = await codai.cbd.queryDocuments(
    { collection: 'users' },
    { page: 2, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }
  );
}
```

### Session Management

```typescript
// Get current session
const session = codai.getSession();

// Update session
codai.setSession({
  user: updatedUser,
  token: newToken,
  isAuthenticated: true
});

// Clear session
codai.clearAuthToken();
```

## 📖 API Reference

### Core Classes

- `CodeaiClient` - Main client class
- `GatewayService` - Gateway operations
- `IdService` - Authentication & identity
- `AdminService` - Administrative operations  
- `HubService` - Service discovery & routing
- `CbdService` - Universal database operations

### Error Classes

- `CodeaiError` - Base error class
- `AuthenticationError` - Authentication failures
- `AuthorizationError` - Authorization failures
- `ValidationError` - Validation failures
- `NotFoundError` - Resource not found
- `NetworkError` - Network issues
- `TimeoutError` - Request timeouts
- `RateLimitError` - Rate limiting
- `ServiceUnavailableError` - Service unavailable

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [CODAI Ecosystem](https://codai.dev)
- [Documentation](https://docs.codai.dev)
- [API Reference](https://api.codai.dev/docs)
- [GitHub Repository](https://github.com/codai-ecosystem/codai-project)

## 📞 Support

- Email: support@codai.dev
- Discord: [CODAI Community](https://discord.gg/codai)
- GitHub Issues: [Report Issues](https://github.com/codai-ecosystem/codai-project/issues)

---

Made with ❤️ by the CODAI Ecosystem Team
