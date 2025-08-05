# MemorAI Developer Documentation

## Overview
This guide provides comprehensive technical documentation for developers working with the MemorAI platform, including architecture details, development setup, API integration, and contribution guidelines.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Codebase Structure](#codebase-structure)
4. [API Integration](#api-integration)
5. [Database Schema](#database-schema)
6. [Search Engine](#search-engine)
7. [Performance Optimization](#performance-optimization)
8. [Testing Framework](#testing-framework)
9. [Security Implementation](#security-implementation)
10. [Deployment Guide](#deployment-guide)
11. [Contributing Guidelines](#contributing-guidelines)

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.4.1, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS, Custom CSS animations
- **Authentication**: NextAuth.js with CODAI provider
- **Database**: CBD Universal Database (Multi-paradigm)
- **Search**: Multi-algorithm engine (Exact, Full-text, Semantic, Fuzzy)
- **WebSocket**: Socket.io for real-time collaboration
- **Performance**: Advanced caching with 96% hit rate
- **Monitoring**: Real-time performance and analytics tracking

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (REST/WS)     │◄──►│   (CBD)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   Search        │              │
         └──────────────►│   Engine        │◄─────────────┘
                        │   (Multi-algo)  │
                        └─────────────────┘
```

### Key Components
- **Memory Management**: CRUD operations with validation
- **Search Engine**: Multi-algorithm search with caching
- **Analytics Engine**: Comprehensive metrics and insights
- **Performance Monitor**: Real-time system monitoring
- **Collaboration System**: WebSocket-based real-time features
- **Security Framework**: Authentication, authorization, input validation

## Development Setup

### Prerequisites
- Node.js 18+ with pnpm
- TypeScript 5.0+
- Git for version control
- VS Code with recommended extensions

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/memorai
cd memorai/apps/memorai

# Install dependencies
pnpm install

# Environment setup
cp .env.example .env.local
# Configure environment variables (see .env.example)

# Start development server
pnpm dev
```

### Environment Variables
```bash
# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:4006
CODAI_CLIENT_ID=your-codai-client-id
CODAI_CLIENT_SECRET=your-codai-client-secret

# Database
CBD_URL=http://localhost:4180
CBD_DATABASE=memorai

# Search & Analytics
ENABLE_VECTOR_SEARCH=true
ENABLE_ANALYTICS=true
CACHE_TTL=300

# Performance
NODE_OPTIONS=--max-old-space-size=4096
```

### Development Scripts
```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build production bundle
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking

# Testing
pnpm test             # Run unit tests
pnpm test:e2e         # Run end-to-end tests
pnpm test:performance # Run performance tests
pnpm test:security    # Run security validation

# Utilities
pnpm analyze          # Bundle analyzer
pnpm clean            # Clean build artifacts
```

## Codebase Structure

```
apps/memorai/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── api/               # API routes
│   │   │   ├── memories/      # Memory CRUD operations
│   │   │   ├── search/        # Search endpoints
│   │   │   ├── analytics/     # Analytics API
│   │   │   └── performance/   # Performance monitoring
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main dashboard
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # Basic UI components
│   │   ├── memory/           # Memory-specific components
│   │   ├── search/           # Search interface
│   │   ├── analytics/        # Analytics dashboard
│   │   ├── performance/      # Performance monitoring
│   │   └── notifications/    # Notification system
│   ├── lib/                  # Core business logic
│   │   ├── cbd-client.ts     # Database client
│   │   ├── search-engine.ts  # Multi-algorithm search
│   │   ├── analytics-engine.ts # Analytics processing
│   │   ├── cache.ts          # Caching system
│   │   ├── validation.ts     # Input validation
│   │   └── utils.ts          # Utility functions
│   ├── types/                # TypeScript definitions
│   └── middleware.ts         # Next.js middleware
├── docs/                     # Documentation
├── tests/                    # Test files
├── public/                   # Static assets
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS config
└── package.json             # Dependencies
```

### Core Files Explanation

#### API Routes (`src/app/api/`)
- **memories/route.ts**: CRUD operations for memories
- **search/**: Multiple search algorithm endpoints
- **analytics/route.ts**: Comprehensive analytics data
- **performance/route.ts**: Real-time performance metrics

#### Components (`src/components/`)
- **memory-dashboard.tsx**: Main memory management interface
- **advanced-search-interface.tsx**: Multi-algorithm search UI
- **analytics-dashboard.tsx**: Visual analytics and charts
- **performance-monitoring.tsx**: Real-time monitoring interface

#### Business Logic (`src/lib/`)
- **cbd-client.ts**: Database abstraction layer
- **search-engine.ts**: AdvancedSearchEngine class
- **analytics-engine.ts**: MemoryAnalyticsEngine class
- **performance-testing.ts**: Performance testing utilities

## API Integration

### Memory API Client
```typescript
class MemoryAPIClient {
  private baseURL = '/api';

  async createMemory(memory: CreateMemoryRequest): Promise<Memory> {
    const response = await fetch(`${this.baseURL}/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memory)
    });
    return response.json();
  }

  async searchMemories(query: SearchRequest): Promise<SearchResult> {
    const response = await fetch(`${this.baseURL}/search/semantic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });
    return response.json();
  }
}
```

### WebSocket Integration
```typescript
import { io, Socket } from 'socket.io-client';

class CollaborationClient {
  private socket: Socket;

  constructor() {
    this.socket = io();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.socket.on('memory:updated', (data) => {
      this.handleMemoryUpdate(data);
    });

    this.socket.on('user:joined', (user) => {
      this.handleUserJoined(user);
    });
  }

  joinMemory(memoryId: string) {
    this.socket.emit('join:memory', memoryId);
  }
}
```

## Database Schema

### CBD Universal Database Integration
The application uses CBD (CodAI Database) which supports multiple paradigms:

#### Document Storage
```typescript
interface MemoryDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  userId: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Vector Storage (for Semantic Search)
```typescript
interface VectorDocument {
  id: string;
  memoryId: string;
  vector: number[];
  content: string;
  metadata: {
    algorithm: 'semantic';
    model: string;
    dimensions: number;
  };
}
```

#### Key-Value Storage (for Caching)
```typescript
interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
}
```

### Database Operations
```typescript
class CBDClient {
  async storeMemory(memory: Memory): Promise<string> {
    // Store in document paradigm
    const docResult = await this.cbd.document.insert(
      'memories', 
      memory
    );

    // Generate and store vector for semantic search
    const vector = await this.generateVector(memory.content);
    await this.cbd.vector.insert('memory_vectors', {
      memoryId: docResult.id,
      vector,
      content: memory.content
    });

    return docResult.id;
  }

  async semanticSearch(query: string, limit: number): Promise<SearchResult[]> {
    const queryVector = await this.generateVector(query);
    
    const results = await this.cbd.vector.search(
      'memory_vectors',
      queryVector,
      limit
    );

    return results.map(r => ({
      memoryId: r.metadata.memoryId,
      score: r.score,
      content: r.content
    }));
  }
}
```

## Search Engine

### Multi-Algorithm Search System
```typescript
class AdvancedSearchEngine {
  private algorithms = {
    exact: new ExactSearchAlgorithm(),
    fulltext: new FullTextSearchAlgorithm(),
    semantic: new SemanticSearchAlgorithm(),
    fuzzy: new FuzzySearchAlgorithm()
  };

  async search(query: string, algorithm: SearchAlgorithm): Promise<SearchResult[]> {
    const cacheKey = `search:${algorithm}:${query}`;
    
    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // Execute search
    const results = await this.algorithms[algorithm].search(query);
    
    // Cache results
    await this.cache.set(cacheKey, results, 300); // 5 min TTL
    
    return results;
  }
}
```

### Fuzzy Search Implementation
```typescript
class FuzzySearchAlgorithm {
  private levenshteinDistance(a: string, b: string): number {
    const matrix = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }

  async search(query: string, maxDistance = 2): Promise<SearchResult[]> {
    // Implementation details...
  }
}
```

## Performance Optimization

### Caching Strategy
```typescript
class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private redis?: RedisClient; // Optional Redis integration

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && !this.isExpired(memEntry)) {
      return memEntry.value;
    }

    // Check Redis if available
    if (this.redis) {
      const redisValue = await this.redis.get(key);
      if (redisValue) {
        return JSON.parse(redisValue);
      }
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    const entry: CacheEntry = {
      value,
      ttl,
      createdAt: new Date()
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);

    // Store in Redis if available
    if (this.redis) {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    }
  }
}
```

### Performance Monitoring
```typescript
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    responseTime: new CircularBuffer(100),
    throughput: new CircularBuffer(100),
    errors: new CircularBuffer(100)
  };

  startRequest(): string {
    const requestId = generateId();
    this.activeRequests.set(requestId, Date.now());
    return requestId;
  }

  endRequest(requestId: string, success: boolean) {
    const startTime = this.activeRequests.get(requestId);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.metrics.responseTime.push(duration);
    
    if (!success) {
      this.metrics.errors.push(1);
    }

    this.activeRequests.delete(requestId);
    this.updateThroughput();
  }

  getMetrics(): PerformanceSnapshot {
    return {
      responseTime: {
        current: this.metrics.responseTime.last(),
        average: this.metrics.responseTime.average(),
        p95: this.metrics.responseTime.percentile(95),
        p99: this.metrics.responseTime.percentile(99)
      },
      throughput: this.calculateThroughput(),
      errorRate: this.calculateErrorRate()
    };
  }
}
```

## Testing Framework

### Unit Testing
```typescript
// tests/lib/search-engine.test.ts
import { AdvancedSearchEngine } from '@/lib/search-engine';

describe('AdvancedSearchEngine', () => {
  let engine: AdvancedSearchEngine;

  beforeEach(() => {
    engine = new AdvancedSearchEngine();
  });

  test('exact search returns precise matches', async () => {
    const results = await engine.search('project deadline', 'exact');
    
    expect(results).toHaveLength(2);
    expect(results[0].score).toBe(1.0);
    expect(results[0].memory.title).toContain('project deadline');
  });

  test('fuzzy search handles typos', async () => {
    const results = await engine.search('projct deadlin', 'fuzzy');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].score).toBeGreaterThan(0.8);
  });
});
```

### Integration Testing
```typescript
// tests/api/memories.test.ts
import { POST } from '@/app/api/memories/route';

describe('/api/memories', () => {
  test('creates memory successfully', async () => {
    const request = new Request('http://localhost/api/memories', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Test Memory',
        content: 'Test content',
        category: 'Test'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.memory.title).toBe('Test Memory');
  });
});
```

### End-to-End Testing
```typescript
// tests/e2e/memory-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('complete memory workflow', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Create memory
  await page.click('[data-testid="new-memory-button"]');
  await page.fill('[data-testid="memory-title"]', 'E2E Test Memory');
  await page.fill('[data-testid="memory-content"]', 'This is test content');
  await page.click('[data-testid="save-memory"]');
  
  // Verify creation
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  
  // Search for memory
  await page.fill('[data-testid="search-input"]', 'E2E Test');
  await page.click('[data-testid="search-button"]');
  
  // Verify search results
  await expect(page.locator('[data-testid="search-results"]')).toContainText('E2E Test Memory');
});
```

## Security Implementation

### Authentication Middleware
```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // User isolation
    const userId = req.nextauth.token?.sub;
    req.headers.set('x-user-id', userId);
    
    // Rate limiting
    const key = `${req.ip}-${req.nextUrl.pathname}`;
    if (isRateLimited(key)) {
      return new Response('Rate limited', { status: 429 });
    }
    
    // Input validation for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return validateAPIRequest(req);
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        return !!token || isPublicRoute(req.nextUrl.pathname);
      }
    }
  }
);
```

### Input Validation
```typescript
// src/lib/validation.ts
import { z } from 'zod';

export const CreateMemorySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  category: z.string().min(1).max(50),
  tags: z.array(z.string().max(30)).max(10),
  metadata: z.record(z.any()).optional()
});

export const SearchQuerySchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  algorithm: z.enum(['exact', 'fulltext', 'semantic', 'fuzzy']).default('semantic')
});

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors);
    }
    throw error;
  }
}
```

### Data Sanitization
```typescript
// src/lib/sanitization.ts
import DOMPurify from 'isomorphic-dompurify';

export class DataSanitizer {
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
  }

  static sanitizeSearchQuery(query: string): string {
    // Remove SQL injection patterns
    return query.replace(/[';\\x00-\\x1f\\x7f-\\x9f]/g, '');
  }

  static escapeOutput(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
}
```

## Deployment Guide

### Production Build
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build application
pnpm build

# Start production server
pnpm start
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build
COPY . .
RUN pnpm build

# Production
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./

EXPOSE 4006
CMD ["pnpm", "start"]
```

### Environment Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  memorai:
    build: .
    ports:
      - "4006:4006"
    environment:
      - NODE_ENV=production
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - CBD_URL=http://cbd:4180
    depends_on:
      - cbd
      
  cbd:
    image: codai/cbd:latest
    ports:
      - "4180:4180"
    volumes:
      - cbd_data:/data
      
volumes:
  cbd_data:
```

### Performance Monitoring in Production
```typescript
// src/lib/monitoring.ts
import { createPrometheusMetrics } from './prometheus';

class ProductionMonitor {
  private metrics = createPrometheusMetrics();

  trackRequest(method: string, path: string, duration: number, status: number) {
    this.metrics.httpRequestDuration
      .labels(method, path, status.toString())
      .observe(duration / 1000);
      
    this.metrics.httpRequestsTotal
      .labels(method, path, status.toString())
      .inc();
  }

  trackMemoryUsage() {
    const usage = process.memoryUsage();
    this.metrics.memoryUsage.set(usage.heapUsed);
    this.metrics.memoryTotal.set(usage.heapTotal);
  }

  trackSearchPerformance(algorithm: string, duration: number, results: number) {
    this.metrics.searchDuration
      .labels(algorithm)
      .observe(duration / 1000);
      
    this.metrics.searchResults
      .labels(algorithm)
      .observe(results);
  }
}
```

## Contributing Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **Linting**: ESLint with custom rules
- **Formatting**: Prettier with 2-space indentation
- **Naming**: camelCase for variables, PascalCase for components

### Git Workflow
```bash
# Feature development
git checkout -b feature/memory-search-enhancement
git commit -m "feat: add fuzzy search algorithm"
git push origin feature/memory-search-enhancement

# Create pull request with:
# - Clear description
# - Test coverage report
# - Performance impact analysis
# - Security review checklist
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Performance tests pass

## Security
- [ ] Input validation added
- [ ] SQL injection prevention
- [ ] XSS protection verified
- [ ] Authentication/authorization checked

## Performance
- [ ] No performance regression
- [ ] Memory usage optimized
- [ ] Database queries optimized
- [ ] Caching implemented where appropriate
```

### Development Best Practices
1. **Test-Driven Development**: Write tests before implementation
2. **Performance First**: Consider performance impact of all changes
3. **Security by Design**: Security considerations in every feature
4. **Documentation**: Update docs with every change
5. **Code Reviews**: All changes require peer review

### Architecture Decisions
Document significant architectural decisions using ADR format:

```markdown
# ADR-001: Multi-Algorithm Search System

## Status
Accepted

## Context
Users need flexible search capabilities with different precision/recall tradeoffs.

## Decision
Implement four search algorithms: exact, full-text, semantic, and fuzzy.

## Consequences
- Increased complexity but better user experience
- Higher resource usage but improved search relevance
- Requires careful performance optimization
```

---

For additional technical details, see the individual component documentation in the `/docs` directory.
