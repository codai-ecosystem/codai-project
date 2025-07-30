# ⚡ Universal SDK Documentation

**Complete developer guide for all CODAI ecosystem SDKs - TypeScript/JavaScript libraries for seamless integration.**

## 📋 Overview

The CODAI ecosystem provides comprehensive SDKs for all services:
- **Universal Interface**: Consistent API across all services
- **TypeScript Support**: Full type safety and IntelliSense
- **Authentication Integration**: Automatic authentication handling
- **Error Handling**: Robust error handling and retry logic
- **Real-time Support**: WebSocket integration for live updates
- **Caching**: Built-in caching for optimal performance

## 🏗️ SDK Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your App      │────│   CODAI SDK     │────│  CODAI Service  │
│   (Frontend/    │    │   (@codai/*)    │    │   (REST API)    │
│    Backend)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Type Safety     │    │ Authentication  │    │  WebSocket      │
│ IntelliSense    │    │ Error Handling  │    │  Real-time      │
│ Auto-complete   │    │ Retry Logic     │    │  Updates        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 Available SDKs

### Core SDKs

| SDK Package | Service | Description |
|-------------|---------|-------------|
| `@codai/auth` | ID Service | Authentication and user management |
| `@codai/memorai` | MEMORAI | Database and storage operations |
| `@codai/hub` | HUB | Service discovery and routing |
| `@codai/logai` | LOGAI | Logging and analytics |

### Business SDKs

| SDK Package | Service | Description |
|-------------|---------|-------------|
| `@codai/codai` | CODAI | Main development platform |
| `@codai/bancai` | BANCAI | Financial services |
| `@codai/cumparai` | CUMPARAI | E-commerce platform |
| `@codai/wallet` | WALLET | Payment processing |
| `@codai/marketai` | MARKETAI | Marketing automation |
| `@codai/fabricai` | FABRICAI | Content creation |
| `@codai/analizai` | ANALIZAI | Analytics and insights |
| `@codai/romai` | ROMAI | Romanian intelligence |

### Specialized SDKs

| SDK Package | Service | Description |
|-------------|---------|-------------|
| `@codai/studiai` | STUDIAI | Learning management |
| `@codai/sociai` | SOCIAI | Social platform |
| `@codai/publicai` | PUBLICAI | Publishing platform |
| `@codai/acasai` | ACASAI | Home automation |
| `@codai/aide` | AIDE | AI assistance |
| `@codai/curtai` | CURTAI | Legal services |
| `@codai/dexai` | DEXAI | DEX trading |
| `@codai/stocai` | STOCAI | Stock trading |
| `@codai/muzicai` | MUZICAI | Music platform |

## 🚀 Quick Start

### Installation

```bash
# Install core SDKs
npm install @codai/auth @codai/memorai @codai/hub

# Install business SDKs
npm install @codai/codai @codai/bancai @codai/wallet

# Install all SDKs
npm install @codai/sdk # Meta package containing all SDKs
```

### Basic Setup

```typescript
import { AuthClient } from '@codai/auth';
import { MemoraiClient } from '@codai/memorai';
import { CodeaiClient } from '@codai/codai';

// Initialize clients
const auth = new AuthClient({
  baseUrl: 'https://id.codai.ro',
  apiKey: process.env.CODAI_API_KEY
});

const memorai = new MemoraiClient({
  baseUrl: 'https://memorai.codai.ro',
  authClient: auth, // Automatic authentication
  cache: true
});

const codai = new CodeaiClient({
  baseUrl: 'https://codai.ro',
  authClient: auth,
  realTime: true // Enable WebSocket updates
});
```

### First API Call

```typescript
// Authenticate user
const user = await auth.login({
  email: 'user@example.com',
  password: 'secure-password'
});

// Store user data
const profile = await memorai.users.create({
  name: user.name,
  email: user.email,
  preferences: { theme: 'dark' }
});

// Create a project
const project = await codai.projects.create({
  name: 'My First Project',
  description: 'Built with CODAI SDK',
  template: 'react-typescript'
});

console.log('Project created:', project.id);
```

## 🔧 Universal SDK Interface

### Standard Client Configuration

```typescript
interface SDKClientConfig {
  baseUrl: string;           // Service base URL
  apiKey?: string;           // API key for authentication
  authClient?: AuthClient;   // Shared auth client
  timeout?: number;          // Request timeout (default: 30000)
  retries?: number;          // Retry attempts (default: 3)
  cache?: boolean;           // Enable caching (default: false)
  realTime?: boolean;        // Enable WebSocket (default: false)
  debug?: boolean;           // Debug logging (default: false)
}

// Example configuration
const client = new ServiceClient({
  baseUrl: 'https://service.codai.ro',
  authClient: auth,
  timeout: 30000,
  retries: 3,
  cache: true,
  realTime: true,
  debug: process.env.NODE_ENV === 'development'
});
```

### Standard CRUD Operations

```typescript
// All SDKs provide consistent CRUD operations
interface CRUDOperations<T> {
  // Create
  create(data: Partial<T>): Promise<T>;
  createMany(data: Partial<T>[]): Promise<T[]>;
  
  // Read
  findById(id: string): Promise<T | null>;
  findMany(options?: FindOptions): Promise<T[]>;
  search(query: string, options?: SearchOptions): Promise<T[]>;
  
  // Update
  update(id: string, data: Partial<T>): Promise<T>;
  updateMany(ids: string[], data: Partial<T>): Promise<T[]>;
  
  // Delete
  delete(id: string): Promise<boolean>;
  deleteMany(ids: string[]): Promise<boolean>;
}

// Usage example
const users = await client.users.findMany({
  where: { active: true },
  orderBy: { createdAt: 'desc' },
  limit: 10
});
```

### Error Handling

```typescript
import { CodeaiError, ErrorCode } from '@codai/codai';

try {
  const project = await codai.projects.create({
    name: 'New Project'
  });
} catch (error) {
  if (error instanceof CodeaiError) {
    switch (error.code) {
      case ErrorCode.UNAUTHORIZED:
        console.error('Authentication required');
        break;
      case ErrorCode.VALIDATION_ERROR:
        console.error('Validation failed:', error.details);
        break;
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        console.error('Rate limit exceeded, retry after:', error.retryAfter);
        break;
      default:
        console.error('API error:', error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 🔐 Authentication Integration

### Automatic Authentication

```typescript
import { AuthClient } from '@codai/auth';
import { MemoraiClient } from '@codai/memorai';

// Set up authentication
const auth = new AuthClient({
  baseUrl: 'https://id.codai.ro'
});

// Login
await auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Other clients automatically use authentication
const memorai = new MemoraiClient({
  baseUrl: 'https://memorai.codai.ro',
  authClient: auth // Automatic token management
});

// All requests will include authentication headers
const data = await memorai.users.findMany(); // Authenticated request
```

### Token Management

```typescript
// Check authentication status
const isAuthenticated = auth.isAuthenticated();
const currentUser = auth.getCurrentUser();

// Refresh token automatically
auth.on('tokenRefresh', (newToken) => {
  console.log('Token refreshed automatically');
});

// Handle authentication errors
auth.on('authError', (error) => {
  console.error('Authentication error:', error);
  // Redirect to login
});

// Logout
await auth.logout();
```

## 📊 Service-Specific SDK Examples

### @codai/codai - Main Development Platform

```typescript
import { CodeaiClient } from '@codai/codai';

const codai = new CodeaiClient({
  baseUrl: 'https://codai.ro',
  authClient: auth
});

// Project management
const project = await codai.projects.create({
  name: 'E-commerce App',
  template: 'next-js-typescript',
  features: ['auth', 'database', 'payments'],
  deployment: {
    platform: 'vercel',
    domain: 'myapp.com'
  }
});

// Code generation
const component = await codai.ai.generateComponent({
  type: 'react',
  description: 'User profile card with avatar and stats',
  style: 'tailwind',
  typescript: true
});

// Deploy project
const deployment = await codai.deployments.create(project.id, {
  environment: 'production',
  config: { NODE_ENV: 'production' }
});
```

### @codai/bancai - Financial Services

```typescript
import { BancaiClient } from '@codai/bancai';

const bancai = new BancaiClient({
  baseUrl: 'https://bancai.codai.ro',
  authClient: auth
});

// Account management
const account = await bancai.accounts.create({
  type: 'checking',
  currency: 'USD',
  initialDeposit: 1000
});

// Transaction processing
const transaction = await bancai.transactions.create({
  fromAccountId: account.id,
  toAccountId: 'recipient-account-id',
  amount: 250.00,
  currency: 'USD',
  description: 'Payment for services'
});

// Get account balance
const balance = await bancai.accounts.getBalance(account.id);
console.log(`Current balance: ${balance.amount} ${balance.currency}`);
```

### @codai/studiai - Learning Management

```typescript
import { StudiaiClient } from '@codai/studiai';

const studiai = new StudiaiClient({
  baseUrl: 'https://studiai.codai.ro',
  authClient: auth,
  realTime: true
});

// Course creation
const course = await studiai.courses.create({
  title: 'Advanced TypeScript',
  description: 'Master TypeScript for enterprise applications',
  duration: '40 hours',
  level: 'advanced',
  modules: [
    {
      title: 'Generic Programming',
      lessons: [
        { title: 'Introduction to Generics', duration: '30 min' },
        { title: 'Advanced Generic Patterns', duration: '45 min' }
      ]
    }
  ]
});

// Student enrollment
const enrollment = await studiai.enrollments.create({
  courseId: course.id,
  studentId: currentUser.id,
  startDate: new Date()
});

// Progress tracking
studiai.progress.subscribe(enrollment.id, (progress) => {
  console.log(`Course progress: ${progress.completionPercentage}%`);
});
```

### @codai/fabricai - Content Creation

```typescript
import { FabricaiClient } from '@codai/fabricai';

const fabricai = new FabricaiClient({
  baseUrl: 'https://fabricai.codai.ro',
  authClient: auth
});

// AI content generation
const article = await fabricai.ai.generateArticle({
  topic: 'The Future of Web Development',
  tone: 'professional',
  length: 'medium',
  keywords: ['AI', 'automation', 'productivity'],
  targetAudience: 'developers'
});

// Image generation
const image = await fabricai.ai.generateImage({
  prompt: 'Modern web development workspace',
  style: 'photography',
  dimensions: { width: 1920, height: 1080 },
  quality: 'high'
});

// Content publishing
const post = await fabricai.content.publish({
  title: article.title,
  body: article.content,
  featuredImage: image.url,
  tags: ['web-development', 'ai'],
  status: 'published'
});
```

## 🔄 Real-Time Features

### WebSocket Integration

```typescript
// Enable real-time updates
const client = new ServiceClient({
  baseUrl: 'https://service.codai.ro',
  authClient: auth,
  realTime: true
});

// Subscribe to entity updates
client.subscribe('projects', {
  events: ['create', 'update', 'delete'],
  filter: { userId: currentUser.id },
  callback: (event) => {
    console.log('Project update:', event);
    // Update UI automatically
  }
});

// Subscribe to specific entity
client.subscribeToEntity('projects', projectId, (event) => {
  console.log('Project changed:', event);
});

// Real-time collaboration
client.collaboration.join('document-123', {
  onCursorMove: (cursor) => console.log('Cursor moved:', cursor),
  onTextChange: (change) => console.log('Text changed:', change),
  onUserJoin: (user) => console.log('User joined:', user.name)
});
```

### Live Queries

```typescript
// Create live query
const liveProjects = client.projects.createLiveQuery({
  where: { status: 'active' },
  orderBy: { updatedAt: 'desc' }
});

// Listen for updates
liveProjects.on('data', (projects) => {
  console.log('Projects updated:', projects.length);
  updateUI(projects);
});

// Handle errors
liveProjects.on('error', (error) => {
  console.error('Live query error:', error);
});

// Stop live query
liveProjects.stop();
```

## 📱 Frontend Integration

### React Hooks

```typescript
// Custom React hooks for CODAI SDKs
import { useCodeai, useAuth } from '@codai/react';

function ProjectList() {
  const { user } = useAuth();
  const { 
    projects, 
    loading, 
    error, 
    createProject, 
    updateProject 
  } = useCodeai();

  const handleCreateProject = async () => {
    const project = await createProject({
      name: 'New Project',
      template: 'react-typescript'
    });
    console.log('Project created:', project);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <button onClick={handleCreateProject}>
        Create Project
      </button>
    </div>
  );
}
```

### Vue.js Composition API

```typescript
// Vue.js composables for CODAI SDKs
import { useCodeai } from '@codai/vue';

export default {
  setup() {
    const { 
      projects, 
      loading, 
      error, 
      createProject 
    } = useCodeai();

    const handleCreate = async () => {
      const project = await createProject({
        name: 'Vue Project',
        template: 'vue-typescript'
      });
    };

    return {
      projects,
      loading,
      error,
      handleCreate
    };
  }
};
```

## 🧪 Testing

### Unit Testing

```typescript
// Mock SDK for testing
import { createMockCodeaiClient } from '@codai/codai/testing';

describe('Project Service', () => {
  let codai: CodeaiClient;

  beforeEach(() => {
    codai = createMockCodeaiClient({
      projects: {
        create: jest.fn().mockResolvedValue({
          id: 'test-project-id',
          name: 'Test Project'
        })
      }
    });
  });

  it('should create a project', async () => {
    const project = await codai.projects.create({
      name: 'Test Project'
    });

    expect(project.id).toBe('test-project-id');
    expect(codai.projects.create).toHaveBeenCalledWith({
      name: 'Test Project'
    });
  });
});
```

### Integration Testing

```typescript
// Integration tests with real APIs
describe('CODAI SDK Integration', () => {
  let auth: AuthClient;
  let codai: CodeaiClient;

  beforeAll(async () => {
    auth = new AuthClient({
      baseUrl: process.env.TEST_AUTH_URL
    });

    await auth.login({
      email: process.env.TEST_EMAIL,
      password: process.env.TEST_PASSWORD
    });

    codai = new CodeaiClient({
      baseUrl: process.env.TEST_CODAI_URL,
      authClient: auth
    });
  });

  it('should create and retrieve project', async () => {
    const project = await codai.projects.create({
      name: 'Integration Test Project'
    });

    const retrieved = await codai.projects.findById(project.id);
    expect(retrieved.name).toBe('Integration Test Project');

    // Cleanup
    await codai.projects.delete(project.id);
  });
});
```

## 📊 Performance & Monitoring

### Request Monitoring

```typescript
// Enable request monitoring
const client = new CodeaiClient({
  baseUrl: 'https://codai.ro',
  authClient: auth,
  debug: true
});

// Listen to request events
client.on('request:start', (request) => {
  console.log('Request started:', request.method, request.url);
});

client.on('request:complete', (request, response, duration) => {
  console.log(`Request completed in ${duration}ms:`, response.status);
});

client.on('request:error', (request, error) => {
  console.error('Request failed:', error.message);
});
```

### Caching Performance

```typescript
// Configure caching
const client = new CodeaiClient({
  baseUrl: 'https://codai.ro',
  authClient: auth,
  cache: {
    ttl: 300, // 5 minutes default TTL
    maxSize: 100, // Max 100 cached items
    strategy: 'lru' // Least Recently Used
  }
});

// Cache-aware queries
const projects = await client.projects.findMany({
  cache: {
    key: 'user-projects',
    ttl: 600, // 10 minutes for this query
    tags: ['projects', `user:${userId}`] // For cache invalidation
  }
});

// Cache invalidation
await client.cache.invalidate(['projects', `user:${userId}`]);
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Authentication Errors

```typescript
// Check authentication status
if (!auth.isAuthenticated()) {
  console.log('User not authenticated');
  await auth.login(credentials);
}

// Handle expired tokens
auth.on('tokenExpired', async () => {
  console.log('Token expired, refreshing...');
  await auth.refresh();
});
```

#### 2. Network Issues

```typescript
// Configure retries
const client = new CodeaiClient({
  baseUrl: 'https://codai.ro',
  retries: 5, // Retry up to 5 times
  retryDelay: (attempt) => Math.pow(2, attempt) * 1000, // Exponential backoff
  retryCondition: (error) => {
    // Retry on network errors and 5xx responses
    return !error.response || error.response.status >= 500;
  }
});
```

#### 3. Rate Limiting

```typescript
// Handle rate limits
client.on('rateLimitExceeded', (error) => {
  const retryAfter = error.retryAfter; // Seconds to wait
  console.log(`Rate limited, retry after ${retryAfter} seconds`);
  
  // Automatically retry after delay
  setTimeout(() => {
    // Retry the failed request
  }, retryAfter * 1000);
});
```

### Debug Mode

```typescript
// Enable debug mode
process.env.DEBUG = 'codai:*';

// Or per client
const client = new CodeaiClient({
  debug: true,
  logLevel: 'verbose'
});

// Custom logging
client.on('debug', (message, data) => {
  console.log(`[DEBUG] ${message}`, data);
});
```

## 📚 TypeScript Support

### Type Definitions

```typescript
// All SDKs include comprehensive TypeScript definitions
import { 
  Project, 
  ProjectCreateInput, 
  ProjectUpdateInput,
  ProjectQueryOptions 
} from '@codai/codai';

// Type-safe API calls
const project: Project = await codai.projects.create({
  name: 'Typed Project', // TypeScript validates this
  template: 'react-typescript' // Autocomplete available
});

// Generic query options
const projects: Project[] = await codai.projects.findMany({
  where: { status: 'active' }, // Type-safe filtering
  orderBy: { createdAt: 'desc' }, // Type-safe ordering
  include: { owner: true } // Type-safe relations
});
```

### Custom Types

```typescript
// Extend SDK types for your application
interface CustomProject extends Project {
  customField: string;
  metadata: {
    environment: 'development' | 'staging' | 'production';
    features: string[];
  };
}

// Use with SDK
const customClient = codai as CodeaiClient<CustomProject>;
```

## 🚀 Advanced Features

### Middleware

```typescript
// Add custom middleware
client.use(async (request, next) => {
  // Pre-request logic
  console.log('Making request to:', request.url);
  
  const response = await next(request);
  
  // Post-request logic
  console.log('Response status:', response.status);
  
  return response;
});
```

### Custom Adapters

```typescript
// Custom HTTP adapter
import { HttpAdapter } from '@codai/core';

class CustomHttpAdapter extends HttpAdapter {
  async request(config) {
    // Custom request logic
    return super.request({
      ...config,
      headers: {
        ...config.headers,
        'Custom-Header': 'custom-value'
      }
    });
  }
}

const client = new CodeaiClient({
  httpAdapter: new CustomHttpAdapter()
});
```

---

**Last Updated**: July 19, 2025  
**SDK Version**: 2.0.0  
**Status**: Production Ready ✅
