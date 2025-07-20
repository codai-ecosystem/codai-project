# 🔗 Integration Guides

**Step-by-step tutorials and best practices for integrating with the CODAI ecosystem.**

## 📋 Overview

This section provides comprehensive integration guides for:
- **New Application Integration**: How to integrate new applications into the CODAI ecosystem
- **Legacy System Migration**: Migrating existing systems to CODAI standards
- **Best Practices**: Development patterns and architectural guidelines
- **Troubleshooting**: Common issues and solutions
- **Performance Optimization**: Scaling and performance tuning

## 🚀 Quick Start Integration

### 1. New Application Integration

#### Prerequisites
- Node.js 18+ or compatible runtime
- CODAI CLI installed globally
- Authentication credentials

#### Step-by-Step Process

```bash
# 1. Install CODAI CLI
npm install -g @codai/cli

# 2. Authenticate
codai auth login

# 3. Initialize new project
codai init my-new-app
# Follow interactive prompts

# 4. Install core dependencies
cd my-new-app
npm install @codai/auth @codai/memorai @codai/shared-services

# 5. Configure authentication
codai config set auth.provider codai-auth
codai config set database.provider memorai

# 6. Generate boilerplate code
codai generate app --template full-stack-typescript

# 7. Test integration
codai test integration

# 8. Deploy to development
codai deploy development
```

#### Application Structure

```
my-new-app/
├── src/
│   ├── components/          # React/Vue components
│   ├── pages/              # Application pages
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── app.ts             # Main application entry
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
├── config/
│   ├── auth.config.js     # Authentication configuration
│   ├── database.config.js # Database configuration
│   └── app.config.js      # Application configuration
├── docs/                  # Application documentation
├── codai.config.json     # CODAI integration config
├── package.json
└── README.md
```

### 2. Legacy System Migration

#### Assessment Phase

```bash
# Analyze existing system
codai analyze legacy --path /path/to/legacy/system
# Generates migration report

# Review migration recommendations
codai migration plan --input analysis-report.json
```

#### Migration Strategy

```typescript
// migration-strategy.ts
export interface MigrationPlan {
  phases: MigrationPhase[];
  dependencies: ServiceDependency[];
  timeline: Timeline;
  risks: RiskAssessment[];
}

export const createMigrationPlan = async (legacySystem: LegacySystemAnalysis) => {
  return {
    phases: [
      {
        name: 'Authentication Migration',
        duration: '2 weeks',
        tasks: [
          'Implement CODAI auth integration',
          'Migrate user accounts',
          'Test authentication flows'
        ]
      },
      {
        name: 'Database Migration', 
        duration: '4 weeks',
        tasks: [
          'Schema mapping to MEMORAI format',
          'Data migration scripts',
          'Validation and testing'
        ]
      },
      {
        name: 'API Standardization',
        duration: '3 weeks', 
        tasks: [
          'Implement REST API standards',
          'Add OpenAPI documentation',
          'Client SDK generation'
        ]
      }
    ]
  };
};
```

#### Data Migration

```bash
# Generate migration scripts
codai migration generate --source mysql --target memorai

# Test migration with sample data
codai migration test --dry-run --sample-size 1000

# Execute migration
codai migration execute --batch-size 5000 --verify
```

## 🔧 Technical Integration Patterns

### Authentication Integration

#### Express.js Integration

```typescript
// auth-middleware.ts
import { AuthMiddleware } from '@codai/auth';
import express from 'express';

const app = express();

// Global authentication middleware
app.use(AuthMiddleware({
  jwtSecret: process.env.JWT_SECRET,
  publicRoutes: ['/health', '/docs'],
  onError: (error, req, res, next) => {
    res.status(401).json({ error: 'Authentication required' });
  }
}));

// Protected route example
app.get('/api/profile', (req, res) => {
  const { user } = req; // Populated by auth middleware
  res.json({ profile: user });
});

export default app;
```

#### Next.js Integration

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import { CodeaiProvider } from '@codai/auth/nextauth';

export default NextAuth({
  providers: [
    CodeaiProvider({
      clientId: process.env.CODAI_CLIENT_ID,
      clientSecret: process.env.CODAI_CLIENT_SECRET,
      authUrl: process.env.CODAI_AUTH_URL
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.codaiToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.codaiToken = token.codaiToken;
      return session;
    }
  }
});
```

#### React Frontend Integration

```typescript
// hooks/useAuth.tsx
import { useContext, createContext, useEffect, useState } from 'react';
import { AuthClient } from '@codai/auth';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authClient = new AuthClient();

  useEffect(() => {
    // Check existing session
    const initAuth = async () => {
      try {
        const currentUser = await authClient.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.log('No active session');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authClient.login(credentials);
    setUser(response.user);
  };

  const logout = async () => {
    await authClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Database Integration

#### Service Layer Pattern

```typescript
// services/BaseService.ts
import { MemoraiClient } from '@codai/memorai';

export abstract class BaseService<T> {
  protected memorai: MemoraiClient;
  protected entityType: string;

  constructor(entityType: string) {
    this.entityType = entityType;
    this.memorai = new MemoraiClient({
      apiUrl: process.env.MEMORAI_API_URL,
      cache: true,
      realTimeSync: true
    });
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.memorai.findMany(this.entityType, options);
  }

  async findById(id: string): Promise<T | null> {
    return this.memorai.findOne(this.entityType, id);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.memorai.create(this.entityType, data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.memorai.update(this.entityType, id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.memorai.delete(this.entityType, id);
  }
}

// services/UserService.ts
export class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.findAll({ 
      where: { email },
      limit: 1 
    });
    return users[0] || null;
  }

  async updateProfile(id: string, profile: UserProfile): Promise<User> {
    return this.update(id, { profile });
  }
}
```

#### Repository Pattern

```typescript
// repositories/Repository.ts
import { MemoraiClient, Entity, FindOptions } from '@codai/memorai';

export interface Repository<T extends Entity> {
  findAll(options?: FindOptions): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: Partial<T>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export class MemoraiRepository<T extends Entity> implements Repository<T> {
  constructor(
    private memorai: MemoraiClient,
    private entityType: string
  ) {}

  async findAll(options?: FindOptions): Promise<T[]> {
    return this.memorai.entities.findMany(this.entityType, options);
  }

  async findById(id: string): Promise<T | null> {
    return this.memorai.entities.findOne(this.entityType, id);
  }

  async create(entity: Partial<T>): Promise<T> {
    return this.memorai.entities.create(this.entityType, entity);
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    return this.memorai.entities.update(this.entityType, id, updates);
  }

  async delete(id: string): Promise<boolean> {
    return this.memorai.entities.delete(this.entityType, id);
  }
}
```

### Real-Time Integration

#### WebSocket Integration

```typescript
// services/RealtimeService.ts
import { WebSocketManager } from '@codai/realtime';

export class RealtimeService {
  private ws: WebSocketManager;

  constructor() {
    this.ws = new WebSocketManager({
      url: process.env.CODAI_WS_URL,
      auth: { type: 'jwt', token: this.getAuthToken() }
    });
  }

  subscribeToEntity(entityType: string, entityId: string, callback: (event) => void) {
    this.ws.subscribe(`${entityType}:${entityId}`, callback);
  }

  subscribeToUserUpdates(userId: string, callback: (event) => void) {
    this.ws.subscribe(`user:${userId}`, callback);
  }

  broadcastUpdate(channel: string, data: any) {
    this.ws.publish(channel, data);
  }

  private getAuthToken(): string {
    return localStorage.getItem('codai_auth_token') || '';
  }
}

// React component using real-time updates
export const LiveDataComponent: React.FC = () => {
  const [data, setData] = useState([]);
  const realtimeService = new RealtimeService();

  useEffect(() => {
    realtimeService.subscribeToEntity('projects', 'project-123', (event) => {
      if (event.type === 'update') {
        setData(prevData => 
          prevData.map(item => 
            item.id === event.data.id ? event.data : item
          )
        );
      }
    });

    return () => {
      realtimeService.disconnect();
    };
  }, []);

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

## 🏗️ Architecture Patterns

### Microservices Integration

#### Service Communication

```typescript
// services/ServiceClient.ts
import { HttpClient } from '@codai/http';
import { ServiceDiscovery } from '@codai/hub';

export class ServiceClient {
  private http: HttpClient;
  private discovery: ServiceDiscovery;

  constructor() {
    this.discovery = new ServiceDiscovery();
    this.http = new HttpClient({
      timeout: 30000,
      retries: 3
    });
  }

  async callService(serviceName: string, endpoint: string, data?: any): Promise<any> {
    const serviceUrl = await this.discovery.getServiceUrl(serviceName);
    
    return this.http.post(`${serviceUrl}${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'X-Service-Name': process.env.SERVICE_NAME
      }
    });
  }

  private getAuthToken(): string {
    // Implement token retrieval logic
    return process.env.SERVICE_AUTH_TOKEN || '';
  }
}

// Usage example
const serviceClient = new ServiceClient();

// Call another service
const userProfile = await serviceClient.callService('user-service', '/profile', {
  userId: '123'
});
```

#### Event-Driven Architecture

```typescript
// events/EventBus.ts
import { EventEmitter } from 'events';
import { RedisClient } from '@codai/redis';

export class EventBus extends EventEmitter {
  private redis: RedisClient;

  constructor() {
    super();
    this.redis = new RedisClient({
      url: process.env.REDIS_URL
    });
    this.setupEventHandling();
  }

  async publish(event: string, data: any): Promise<void> {
    // Local event emission
    this.emit(event, data);
    
    // Redis pub/sub for distributed events
    await this.redis.publish(`codai:events:${event}`, JSON.stringify(data));
  }

  async subscribe(pattern: string, handler: (data: any) => void): Promise<void> {
    // Local subscription
    this.on(pattern, handler);
    
    // Redis subscription for distributed events
    await this.redis.psubscribe(`codai:events:${pattern}`, (message, channel) => {
      const data = JSON.parse(message);
      handler(data);
    });
  }

  private setupEventHandling(): void {
    // Setup Redis event handling
    this.redis.on('pmessage', (pattern, channel, message) => {
      const eventName = channel.replace('codai:events:', '');
      const data = JSON.parse(message);
      this.emit(eventName, data);
    });
  }
}

// Usage in services
export class UserService {
  private eventBus: EventBus;

  constructor() {
    this.eventBus = new EventBus();
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const user = await this.repository.create(userData);
    
    // Publish user created event
    await this.eventBus.publish('user.created', {
      userId: user.id,
      email: user.email,
      timestamp: new Date()
    });

    return user;
  }
}
```

### API Gateway Integration

#### Route Configuration

```typescript
// config/routes.config.ts
export const routeConfig = {
  '/api/v1/auth/*': {
    target: 'http://id-service:4001',
    auth: false,
    rateLimit: {
      windowMs: 60000,
      max: 10
    }
  },
  '/api/v1/data/*': {
    target: 'http://memorai-service:4002',
    auth: true,
    rateLimit: {
      windowMs: 60000,
      max: 100
    }
  },
  '/api/v1/projects/*': {
    target: 'http://codai-service:4003',
    auth: true,
    transform: {
      request: (req) => {
        // Add service-specific headers
        req.headers['X-Service-Context'] = 'codai-projects';
        return req;
      }
    }
  }
};
```

#### Gateway Middleware

```typescript
// middleware/gateway.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

export const createGatewayMiddleware = (config: RouteConfig) => {
  return createProxyMiddleware({
    target: config.target,
    changeOrigin: true,
    pathRewrite: config.pathRewrite || {},
    
    onProxyReq: (proxyReq, req, res) => {
      // Add authentication headers
      if (config.auth && req.user) {
        proxyReq.setHeader('X-User-ID', req.user.id);
        proxyReq.setHeader('X-User-Roles', req.user.roles.join(','));
      }
      
      // Custom transformations
      if (config.transform?.request) {
        config.transform.request(proxyReq);
      }
    },
    
    onProxyRes: (proxyRes, req, res) => {
      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      
      // Custom response transformations
      if (config.transform?.response) {
        config.transform.response(proxyRes);
      }
    },
    
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(502).json({
        error: 'Service unavailable',
        message: 'The requested service is temporarily unavailable'
      });
    }
  });
};
```

## 🧪 Testing Integration

### Integration Test Setup

```typescript
// tests/setup/integration.setup.ts
import { TestEnvironment } from '@codai/testing';
import { AuthClient } from '@codai/auth';
import { MemoraiClient } from '@codai/memorai';

export class IntegrationTestSetup {
  public auth: AuthClient;
  public memorai: MemoraiClient;
  public testEnv: TestEnvironment;

  async setup(): Promise<void> {
    // Start test environment
    this.testEnv = new TestEnvironment({
      services: ['auth', 'memorai', 'hub'],
      database: 'test'
    });
    await this.testEnv.start();

    // Initialize clients
    this.auth = new AuthClient({
      baseUrl: this.testEnv.getServiceUrl('auth')
    });

    this.memorai = new MemoraiClient({
      baseUrl: this.testEnv.getServiceUrl('memorai'),
      authClient: this.auth
    });

    // Authenticate test user
    await this.auth.login({
      email: 'test@example.com',
      password: 'testpassword'
    });
  }

  async teardown(): Promise<void> {
    await this.testEnv.stop();
  }

  async createTestData(): Promise<TestData> {
    const user = await this.memorai.create('users', {
      name: 'Test User',
      email: 'test@example.com'
    });

    const project = await this.memorai.create('projects', {
      name: 'Test Project',
      userId: user.id
    });

    return { user, project };
  }
}
```

### End-to-End Testing

```typescript
// tests/e2e/user-flow.test.ts
import { test, expect } from '@playwright/test';
import { IntegrationTestSetup } from '../setup/integration.setup';

test.describe('User Flow Integration', () => {
  let testSetup: IntegrationTestSetup;

  test.beforeAll(async () => {
    testSetup = new IntegrationTestSetup();
    await testSetup.setup();
  });

  test.afterAll(async () => {
    await testSetup.teardown();
  });

  test('complete user registration and project creation flow', async ({ page }) => {
    // Navigate to application
    await page.goto(testSetup.testEnv.getAppUrl());

    // Register new user
    await page.click('[data-testid="register-button"]');
    await page.fill('[data-testid="name-input"]', 'Integration Test User');
    await page.fill('[data-testid="email-input"]', 'integration@test.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="submit-registration"]');

    // Verify successful registration
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();

    // Create project
    await page.click('[data-testid="create-project-button"]');
    await page.fill('[data-testid="project-name"]', 'Integration Test Project');
    await page.selectOption('[data-testid="project-template"]', 'react-typescript');
    await page.click('[data-testid="create-project-submit"]');

    // Verify project creation
    await expect(page.locator('[data-testid="project-success"]')).toBeVisible();
    
    // Verify project appears in dashboard
    await page.goto(testSetup.testEnv.getAppUrl('/dashboard'));
    await expect(page.locator('text=Integration Test Project')).toBeVisible();
  });

  test('authentication persistence across page reloads', async ({ page }) => {
    // Login
    await page.goto(testSetup.testEnv.getAppUrl('/login'));
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'testpassword');
    await page.click('[data-testid="login-submit"]');

    // Verify login success
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Reload page
    await page.reload();

    // Verify authentication persisted
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});
```

## 📊 Performance Optimization

### Caching Strategies

```typescript
// services/CacheService.ts
import { RedisClient } from '@codai/redis';
import { LRUCache } from 'lru-cache';

export class CacheService {
  private redis: RedisClient;
  private localCache: LRUCache<string, any>;

  constructor() {
    this.redis = new RedisClient({ url: process.env.REDIS_URL });
    this.localCache = new LRUCache({
      max: 1000,
      ttl: 300000 // 5 minutes
    });
  }

  async get(key: string): Promise<any> {
    // Try local cache first
    const localValue = this.localCache.get(key);
    if (localValue !== undefined) {
      return localValue;
    }

    // Try Redis cache
    const redisValue = await this.redis.get(key);
    if (redisValue) {
      const parsedValue = JSON.parse(redisValue);
      this.localCache.set(key, parsedValue);
      return parsedValue;
    }

    return null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    const serializedValue = JSON.stringify(value);
    
    // Set in both caches
    this.localCache.set(key, value);
    await this.redis.setex(key, ttl, serializedValue);
  }

  async invalidate(pattern: string): Promise<void> {
    // Clear matching keys from local cache
    for (const key of this.localCache.keys()) {
      if (key.includes(pattern)) {
        this.localCache.delete(key);
      }
    }

    // Clear from Redis
    const keys = await this.redis.keys(`*${pattern}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### Database Optimization

```typescript
// services/OptimizedDataService.ts
import { MemoraiClient } from '@codai/memorai';
import { CacheService } from './CacheService';

export class OptimizedDataService {
  private memorai: MemoraiClient;
  private cache: CacheService;

  constructor() {
    this.memorai = new MemoraiClient({
      connectionPool: {
        min: 5,
        max: 20,
        acquireTimeoutMillis: 30000
      }
    });
    this.cache = new CacheService();
  }

  async getEntity(type: string, id: string): Promise<any> {
    const cacheKey = `entity:${type}:${id}`;
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const entity = await this.memorai.findOne(type, id);
    if (entity) {
      await this.cache.set(cacheKey, entity, 300); // 5 minutes
    }

    return entity;
  }

  async getEntitiesWithRelations(type: string, options: any): Promise<any[]> {
    const cacheKey = `entities:${type}:${this.hashOptions(options)}`;
    
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Use batch loading for related entities
    const entities = await this.memorai.findMany(type, {
      ...options,
      include: options.include || []
    });

    await this.cache.set(cacheKey, entities, 180); // 3 minutes
    return entities;
  }

  private hashOptions(options: any): string {
    return Buffer.from(JSON.stringify(options)).toString('base64');
  }
}
```

## 🚀 Deployment Integration

### CI/CD Pipeline

```yaml
# .github/workflows/codai-integration.yml
name: CODAI Integration Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install CODAI CLI
        run: npm install -g @codai/cli

      - name: Setup CODAI environment
        run: |
          codai auth login --api-key ${{ secrets.CODAI_API_KEY }}
          codai config set environment test
        env:
          CODAI_API_KEY: ${{ secrets.CODAI_API_KEY }}

      - name: Run tests
        run: |
          npm run test:unit
          npm run test:integration
          npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Build application
        run: npm run build

      - name: Deploy to staging
        if: github.ref == 'refs/heads/develop'
        run: codai deploy staging --wait
        env:
          CODAI_API_KEY: ${{ secrets.CODAI_API_KEY }}

      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: codai deploy production --wait
        env:
          CODAI_API_KEY: ${{ secrets.CODAI_API_KEY }}
```

### Docker Integration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install CODAI CLI
RUN npm install -g @codai/cli

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Setup CODAI configuration
COPY codai.config.json ./
RUN codai config init

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD codai health check || exit 1

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-codai-app
  labels:
    app: my-codai-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-codai-app
  template:
    metadata:
      labels:
        app: my-codai-app
    spec:
      containers:
      - name: app
        image: my-codai-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: CODAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: codai-secrets
              key: api-key
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: codai-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
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

## 🐛 Troubleshooting Guide

### Common Integration Issues

#### Authentication Problems

```typescript
// debug/auth-debug.ts
export class AuthDebugger {
  static async diagnoseAuthIssue(): Promise<void> {
    console.log('🔍 Diagnosing authentication issues...');

    // Check token validity
    const token = localStorage.getItem('codai_auth_token');
    if (!token) {
      console.error('❌ No authentication token found');
      return;
    }

    // Decode and check token
    try {
      const decoded = this.decodeJWT(token);
      console.log('✅ Token decoded successfully:', decoded);

      if (Date.now() >= decoded.exp * 1000) {
        console.error('❌ Token has expired');
        return;
      }

      // Test API call
      const response = await fetch('/api/auth/validate', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        console.log('✅ Token validation successful');
      } else {
        console.error('❌ Token validation failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Token decoding failed:', error);
    }
  }

  private static decodeJWT(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }
}
```

#### Database Connection Issues

```typescript
// debug/database-debug.ts
export class DatabaseDebugger {
  static async diagnoseDatabaseIssue(memoraiClient: MemoraiClient): Promise<void> {
    console.log('🔍 Diagnosing database connection issues...');

    try {
      // Test basic connectivity
      const health = await memoraiClient.health.check();
      console.log('✅ Database health check:', health);

      // Test query execution
      const testQuery = await memoraiClient.findMany('users', { limit: 1 });
      console.log('✅ Test query successful:', testQuery.length, 'results');

      // Check connection pool
      const poolStats = await memoraiClient.getConnectionPoolStats();
      console.log('📊 Connection pool stats:', poolStats);

    } catch (error) {
      console.error('❌ Database diagnostics failed:', error);
      
      // Provide specific guidance based on error
      if (error.code === 'ECONNREFUSED') {
        console.log('💡 Suggestion: Check if MEMORAI service is running');
      } else if (error.code === 'TIMEOUT') {
        console.log('💡 Suggestion: Increase connection timeout or check network');
      }
    }
  }
}
```

### Performance Monitoring

```typescript
// monitoring/performance-monitor.ts
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTiming(operation: string): () => number {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
      return duration;
    };
  }

  recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(value);
  }

  getStatistics(operation: string): PerformanceStats | null {
    const values = this.metrics.get(operation);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      average: values.reduce((a, b) => a + b) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  async generateReport(): Promise<string> {
    let report = '📊 Performance Report\n';
    report += '='.repeat(50) + '\n\n';

    for (const [operation, values] of this.metrics) {
      const stats = this.getStatistics(operation);
      if (stats) {
        report += `Operation: ${operation}\n`;
        report += `  Count: ${stats.count}\n`;
        report += `  Average: ${stats.average.toFixed(2)}ms\n`;
        report += `  Median: ${stats.median.toFixed(2)}ms\n`;
        report += `  95th percentile: ${stats.p95.toFixed(2)}ms\n`;
        report += `  99th percentile: ${stats.p99.toFixed(2)}ms\n`;
        report += `  Min: ${stats.min.toFixed(2)}ms\n`;
        report += `  Max: ${stats.max.toFixed(2)}ms\n\n`;
      }
    }

    return report;
  }
}

// Usage in application
const monitor = new PerformanceMonitor();

// Monitor API calls
const endTiming = monitor.startTiming('api_call_users_list');
const users = await api.users.list();
endTiming();

// Monitor database queries
const endDbTiming = monitor.startTiming('db_query_user_profile');
const profile = await db.users.findById(userId);
endDbTiming();
```

### Health Check Integration

```typescript
// health/health-checker.ts
export class HealthChecker {
  private checks: HealthCheck[] = [];

  addCheck(name: string, checkFn: () => Promise<HealthStatus>): void {
    this.checks.push({ name, checkFn });
  }

  async runAllChecks(): Promise<SystemHealth> {
    const results: HealthCheckResult[] = [];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    for (const check of this.checks) {
      try {
        const startTime = Date.now();
        const status = await Promise.race([
          check.checkFn(),
          new Promise<HealthStatus>((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 5000)
          )
        ]);
        const duration = Date.now() - startTime;

        results.push({
          name: check.name,
          status: status.status,
          message: status.message,
          duration,
          timestamp: new Date().toISOString()
        });

        if (status.status !== 'healthy') {
          overallStatus = status.status === 'unhealthy' ? 'unhealthy' : 'degraded';
        }
      } catch (error) {
        results.push({
          name: check.name,
          status: 'unhealthy',
          message: error.message,
          duration: 5000,
          timestamp: new Date().toISOString()
        });
        overallStatus = 'unhealthy';
      }
    }

    return {
      status: overallStatus,
      checks: results,
      timestamp: new Date().toISOString()
    };
  }
}

// Setup health checks
const healthChecker = new HealthChecker();

// Add database health check
healthChecker.addCheck('database', async () => {
  try {
    await memorai.health.check();
    return { status: 'healthy', message: 'Database connection successful' };
  } catch (error) {
    return { status: 'unhealthy', message: `Database error: ${error.message}` };
  }
});

// Add authentication health check
healthChecker.addCheck('authentication', async () => {
  try {
    const response = await fetch('/api/auth/health');
    if (response.ok) {
      return { status: 'healthy', message: 'Authentication service operational' };
    }
    return { status: 'degraded', message: 'Authentication service slow' };
  } catch (error) {
    return { status: 'unhealthy', message: 'Authentication service unavailable' };
  }
});

// Express health endpoint
app.get('/health', async (req, res) => {
  const health = await healthChecker.runAllChecks();
  const statusCode = health.status === 'healthy' ? 200 : 
                    health.status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

**Last Updated**: July 19, 2025  
**Integration Guide Version**: 2.0.0  
**Status**: Production Ready ✅
