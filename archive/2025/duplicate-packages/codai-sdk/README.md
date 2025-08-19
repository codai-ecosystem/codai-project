# CODAI SDK - TypeScript/JavaScript

Official SDK for interacting with the CODAI ecosystem. Provides unified access to all CODAI services including Gateway, CBD Universal Database, Admin Dashboard, Authentication, Hub, ControlAI, RomAI, BancAI, MemorAI, and the main CODAI App.

## 🚀 Quick Start

### Installation

```bash
npm install @codai/sdk
# or
yarn add @codai/sdk
# or
pnpm add @codai/sdk
```

### Basic Usage

```typescript
import { CODAI } from '@codai/sdk';

// Initialize with default configuration
const codai = new CODAI();

// Initialize with custom configuration
const codai = new CODAI({
  gatewayUrl: 'https://api.codai.com',
  endpoints: {
    gateway: 'https://gateway.codai.com',
    cbd: 'https://cbd.codai.com',
    // ... other endpoints
  },
  auth: {
    apiKey: 'your-api-key',
    // or
    token: 'your-jwt-token'
  }
});

// Check health of all services
const health = await codai.healthCheck();
console.log(`Services healthy: ${health.data.overall.percentage}%`);
```

## 📚 Service Clients

The SDK provides dedicated clients for each CODAI service:

### Gateway Service (`codai.gateway`)

Central routing and service management:

```typescript
// Get service statuses
const statuses = await codai.gateway.getServiceStatuses();

// Get service statistics
const stats = await codai.gateway.getStats();

// Proxy request to any service
const response = await codai.gateway.proxyRequest('cbd', '/documents', {
  method: 'GET'
});
```

### CBD Universal Database (`codai.cbd`)

Multi-paradigm database supporting 6 paradigms:

```typescript
// Document operations
await codai.cbd.insertDocument({
  collection: 'users',
  document: { name: 'John', email: 'john@example.com' }
});

const docs = await codai.cbd.queryDocuments({
  collection: 'users',
  query: { name: 'John' }
});

// Vector operations
await codai.cbd.insertVector({
  collection: 'embeddings',
  vector: [0.1, 0.2, 0.3],
  metadata: { type: 'text' }
});

const similar = await codai.cbd.searchSimilarVectors({
  collection: 'embeddings',
  vector: [0.1, 0.2, 0.3],
  limit: 10
});

// Graph operations
await codai.cbd.insertGraphNode({
  collection: 'social',
  node: { id: 'user1', properties: { name: 'John' } }
});

await codai.cbd.insertGraphEdge({
  collection: 'social',
  edge: { from: 'user1', to: 'user2', type: 'follows' }
});

// Key-Value operations
await codai.cbd.setKeyValue('cache', 'user:123', { data: 'value' });
const value = await codai.cbd.getKeyValue('cache', 'user:123');

// Time series operations
await codai.cbd.insertTimeSeries({
  collection: 'metrics',
  timestamp: Date.now(),
  tags: { server: 'web1' },
  values: { cpu: 80, memory: 60 }
});

// File storage operations
const uploadUrl = await codai.cbd.uploadFile('documents', 'file.pdf', fileBuffer);
```

### CODAI App (`codai.app`)

Main application features:

```typescript
// Project management
const projects = await codai.app.getProjects();

const newProject = await codai.app.createProject({
  name: 'My Web App',
  description: 'A modern web application',
  type: 'web',
  technologies: ['React', 'Node.js', 'TypeScript']
});

// AI assistance
const codeGeneration = await codai.app.generateCode({
  projectId: 'project-123',
  prompt: 'Create a React component for user authentication',
  language: 'typescript',
  framework: 'react'
});

const codeReview = await codai.app.reviewCode({
  projectId: 'project-123',
  code: 'function add(a, b) { return a + b; }',
  language: 'javascript',
  focus: ['security', 'performance']
});

// Chat with AI
const chat = await codai.app.createChat('project-123', 'Development Chat');
const aiResponse = await codai.app.sendMessage(chat.data.id, 'How can I optimize this component?');
```

### Authentication (`codai.id`)

User identity and authentication:

```typescript
// Authentication
const loginResult = await codai.id.login({
  email: 'user@example.com',
  password: 'password'
});

const user = await codai.id.register({
  email: 'new@example.com',
  password: 'password',
  name: 'New User'
});

// Profile management
const profile = await codai.id.getProfile();
await codai.id.updateProfile({ name: 'Updated Name' });

// Session management
const sessions = await codai.id.getActiveSessions();
await codai.id.revokeSession('session-id');
```

### MemorAI (`codai.memorai`)

AI memory and knowledge systems:

```typescript
// Memory management
const memory = await codai.memorai.createMemory({
  content: 'Important project information',
  tags: ['project', 'notes'],
  metadata: { priority: 'high' }
});

const memories = await codai.memorai.searchMemories({
  query: 'project information',
  limit: 10
});

// Collections
const collection = await codai.memorai.createCollection({
  name: 'Project Notes',
  description: 'All project-related memories'
});

await codai.memorai.addMemoryToCollection(memory.data.id, collection.data.id);
```

### ControlAI (`codai.controlai`)

Project coordination and AI orchestration:

```typescript
// Project management
const project = await codai.controlai.createProject({
  name: 'Website Redesign',
  description: 'Complete website overhaul',
  priority: 'high',
  tags: ['frontend', 'design']
});

// Task management
const task = await codai.controlai.createTask(project.data.id, {
  title: 'Create wireframes',
  description: 'Design initial wireframes for main pages',
  priority: 'medium',
  estimated_hours: 8
});

// Agent coordination
const agents = await codai.controlai.getAvailableAgents();
await codai.controlai.assignTask(task.data.id, agents.data[0].id);
```

### Admin Dashboard (`codai.admin`)

System monitoring and management:

```typescript
// System overview
const overview = await codai.admin.getSystemOverview();

// Service metrics
const metrics = await codai.admin.getServiceMetrics('cbd', '24h');

// User management
const users = await codai.admin.getUsers();
await codai.admin.updateUser('user-id', { role: 'admin' });

// Alerts
const alerts = await codai.admin.getAlerts();
await codai.admin.acknowledgeAlert('alert-id');
```

### Hub Service (`codai.hub`)

Integrations and marketplace:

```typescript
// Service registry
const services = await codai.hub.getRegisteredServices();
await codai.hub.registerService({
  name: 'Custom Service',
  endpoint: 'https://my-service.com',
  description: 'My custom integration'
});

// Marketplace
const integrations = await codai.hub.browseIntegrations();
await codai.hub.installIntegration('integration-id');

// Templates
const templates = await codai.hub.getTemplates();
```

### RomAI (`codai.romai`)

Romanian AI services:

```typescript
// AI intelligence
const response = await codai.romai.query({
  question: 'Care sunt cele mai mari orașe din România?',
  language: 'ro',
  region: 'București'
});

// Translation
const translation = await codai.romai.translate({
  text: 'Hello, how are you?',
  targetLanguage: 'ro',
  formality: 'formal'
});

// Market intelligence
const marketData = await codai.romai.getMarketIntelligence({
  sector: 'technology',
  region: 'București'
});
```

### BancAI (`codai.bancai`)

Financial AI services:

```typescript
// Account management
const accounts = await codai.bancai.getAccounts();
const account = await codai.bancai.createAccount({
  type: 'checking',
  currency: 'USD',
  initialBalance: 1000
});

// Transactions
const transactions = await codai.bancai.getTransactions('account-id');
await codai.bancai.createTransaction({
  fromAccount: 'account-1',
  toAccount: 'account-2',
  amount: 100,
  description: 'Payment'
});

// Financial insights
const insights = await codai.bancai.getFinancialInsights('account-id');
const advice = await codai.bancai.getAIAdvice('account-id', 'budgeting');
```

## 🔧 Configuration

### Default Configuration

```typescript
const defaultConfig = {
  gatewayUrl: 'http://localhost:4003',
  endpoints: {
    gateway: 'http://localhost:4003',
    cbd: 'http://localhost:4180',
    admin: 'http://localhost:4007',
    id: 'http://localhost:4004',
    hub: 'http://localhost:4008',
    controlai: 'http://localhost:4200',
    romai: 'http://localhost:6100',
    bancai: 'http://localhost:4005',
    memorai: 'http://localhost:4006',
    codai: 'http://localhost:4001'
  },
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
};
```

### Authentication

The SDK supports multiple authentication methods:

```typescript
// API Key
const codai = new CODAI({
  auth: {
    apiKey: 'your-api-key'
  }
});

// JWT Token
const codai = new CODAI({
  auth: {
    token: 'your-jwt-token'
  }
});

// Custom headers
const codai = new CODAI({
  auth: {
    headers: {
      'Authorization': 'Bearer your-token',
      'X-API-Key': 'your-key'
    }
  }
});

// Update authentication later
codai.setAuth({
  token: 'new-jwt-token'
});
```

### Error Handling

```typescript
try {
  const projects = await codai.app.getProjects();
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('API Error:', error.response.status, error.response.data);
  } else if (error.request) {
    // Request was made but no response received
    console.error('Network Error:', error.message);
  } else {
    // Something else happened
    console.error('Error:', error.message);
  }
}
```

### Retry Configuration

```typescript
const codai = new CODAI({
  retries: 5,
  retryDelay: 2000,
  retryCondition: (error) => {
    // Custom retry logic
    return error.response?.status >= 500;
  }
});
```

## 📖 TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions:

```typescript
import type { 
  CODAIProject, 
  Memory, 
  BancAIAccount,
  ApiResponse 
} from '@codai/sdk';

// All responses are typed
const response: ApiResponse<CODAIProject[]> = await codai.app.getProjects();

// Type-safe configuration
const config: CODAIConfig = {
  gatewayUrl: 'https://api.codai.com',
  auth: {
    apiKey: 'key'
  }
};
```

## 🧪 Testing

```typescript
import { CODAI } from '@codai/sdk';

// Use mock endpoints for testing
const testCodai = new CODAI({
  endpoints: {
    gateway: 'http://localhost:3001',
    cbd: 'http://localhost:3002',
    // ... other test endpoints
  }
});

// Health check for testing
const health = await testCodai.healthCheck();
expect(health.data.overall.healthy).toBeGreaterThan(8);
```

## 📝 Examples

Check out the `/examples` directory for complete usage examples:

- [Basic Usage](./examples/basic-usage.ts)
- [Project Management](./examples/project-management.ts)
- [AI Code Generation](./examples/ai-code-generation.ts)
- [Database Operations](./examples/database-operations.ts)
- [Authentication Flow](./examples/authentication.ts)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🔗 Links

- [Documentation](https://docs.codai.com)
- [API Reference](https://api.codai.com/docs)
- [GitHub Repository](https://github.com/codai-platform/sdk)
- [Support](https://support.codai.com)

## 🆚 Version

Current version: **1.0.0**

```typescript
import { CODAI } from '@codai/sdk';

console.log(CODAI.getVersion()); // "1.0.0"
```
