# Cautai: Comprehensive Testing Strategy

## Executive Summary

This document outlines the comprehensive testing strategy for Cautai, an AI-first search engine with MCP integration. Our testing approach ensures reliability, performance, security, and accessibility across all components while maintaining strict quality gates.

**Testing Philosophy:**
- **Test-Driven Development**: Write tests before implementation
- **Pyramid Strategy**: Many unit tests, some integration tests, few E2E tests
- **Golden Files**: Deterministic testing for no-AI basic mode
- **Performance-First**: Every test includes performance assertions
- **Security-by-Design**: Security tests integrated into all layers

## Testing Matrix Overview

| Component | Unit Tests | Integration Tests | E2E Tests | Performance Tests | Security Tests |
|-----------|------------|------------------|-----------|-------------------|----------------|
| cautai-mcp | ✅ Tools, Resources | ✅ stdio/HTTP transport | ✅ VS Code integration | ✅ Latency benchmarks | ✅ Input validation |
| cautai-cli | ✅ Commands, Config | ✅ File I/O, Network | ✅ TUI interactions | ✅ Memory usage | ✅ Command injection |
| cautai-server | ✅ API endpoints | ✅ Database, Cache | ✅ Load testing | ✅ Rate limiting | ✅ Authentication |
| romcp-web | ✅ Components, Hooks | ✅ API integration | ✅ User journeys | ✅ Lighthouse CI | ✅ XSS prevention |
| cautai-vscode | ✅ Commands, Config | ✅ MCP registration | ✅ Extension workflow | ✅ Activation time | ✅ Permission model |

## Quality Gates (Non-Negotiable)

### Build-Time Gates
- ✅ **Zero TypeScript Errors**: `pnpm typecheck` must pass
- ✅ **Code Quality**: ESLint score ≥ 9.5/10, Prettier formatting
- ✅ **Dependency Security**: No high/critical vulnerabilities in `pnpm audit`
- ✅ **Bundle Size**: Web bundle < 500KB gzipped
- ✅ **Tree Shaking**: No unused exports in production builds

### Test Coverage Gates
- ✅ **Unit Test Coverage**: ≥ 85% line coverage for all packages
- ✅ **Integration Test Coverage**: All API endpoints and MCP tools tested
- ✅ **E2E Test Coverage**: Critical user journeys covered
- ✅ **Performance Tests**: P95 latency targets met
- ✅ **I18n Coverage**: 100% translation coverage for EN/RO

### Production Readiness Gates
- ✅ **Lighthouse Scores**: Performance ≥90, Accessibility ≥95, SEO ≥95
- ✅ **Security Scan**: OWASP ZAP baseline scan passes
- ✅ **Load Testing**: System handles 1000 concurrent requests
- ✅ **Privacy Compliance**: No user tracking, GDPR-compliant data handling
- ✅ **MCP Protocol Compliance**: Full specification adherence validated

## Testing Tools & Framework Selection

### Unit Testing: Vitest
**Rationale**: Fast, TypeScript-first, ESM support, excellent VS Code integration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.d.ts', '**/node_modules/**'],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },
    setupFiles: ['./test/setup.ts'],
    testTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './test')
    }
  }
});
```

### Integration Testing: Vitest + Testcontainers
**Rationale**: Same test runner for consistency, Docker containers for realistic dependencies

### E2E Testing: Playwright
**Rationale**: Cross-browser support, excellent debugging, built-in waiting strategies

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
});
```

### Performance Testing: Artillery + Custom Metrics
**Rationale**: HTTP load testing with custom MCP protocol testing

### Security Testing: OWASP ZAP + Custom Scripts
**Rationale**: Industry standard security scanner plus custom validation

## Test Environment Strategy

### Local Development Environment
```bash
# Environment setup
export NODE_ENV=test
export CAUTAI_TEST_MODE=true
export CAUTAI_NO_TELEMETRY=true
export CAUTAI_CACHE_DIR=/tmp/cautai-test-cache
export CAUTAI_LOG_LEVEL=debug

# Database setup (in-memory for speed)
export CAUTAI_DB_URL=sqlite:///:memory:
export CAUTAI_REDIS_URL=redis://localhost:6379/15

# API keys for integration tests (test tokens)
export OPENAI_API_KEY=sk-test-mock-key-for-integration-tests
export ANTHROPIC_API_KEY=sk-ant-test-mock-key
```

### CI/CD Testing Environment
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test-matrix:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 21]
        include:
          - os: ubuntu-latest
            node: 20
            coverage: true

    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      
      - run: pnpm build
      
      - run: pnpm test:unit
        env:
          NODE_ENV: test
          CAUTAI_TEST_MODE: true
          
      - run: pnpm test:integration
        if: matrix.os == 'ubuntu-latest'
        
      - name: Upload coverage
        if: matrix.coverage
        uses: codecov/codecov-action@v3
```

## Golden Files for No-AI Basic Mode

### Purpose
Golden files ensure deterministic, reproducible testing for the no-AI basic mode, allowing us to validate core search functionality without external API dependencies.

### Structure
```
tests/fixtures/golden/
├── basic-search/
│   ├── typescript-query.json
│   ├── romanian-culture-query.json
│   └── academic-search-query.json
├── extraction/
│   ├── html-article.json
│   ├── pdf-document.json
│   └── markdown-content.json
└── ranking/
    ├── bm25-scores.json
    ├── freshness-boost.json
    └── domain-authority.json
```

### Sample Golden File
```json
{
  "metadata": {
    "version": "1.0.0",
    "created": "2025-08-28T10:00:00Z",
    "description": "TypeScript programming language basic search",
    "mode": "no-ai-basic",
    "deterministic": true
  },
  "input": {
    "query": "TypeScript programming language",
    "sources": ["web"],
    "depth": 5,
    "language": "en",
    "safe_mode": true
  },
  "expected": {
    "total": 5,
    "processingTime": "< 200ms",
    "results": [
      {
        "title": "TypeScript - JavaScript That Scales",
        "url": "https://www.typescriptlang.org/",
        "snippet": "TypeScript is a strongly typed programming language that builds on JavaScript...",
        "score": 0.95,
        "metadata": {
          "wordCount": 450,
          "language": "en",
          "contentType": "text/html"
        },
        "provenance": {
          "sourceAdapter": "WebSearchAdapter",
          "rank": 1,
          "retrievalMethod": "direct_fetch"
        }
      }
    ],
    "citations": [
      {
        "url": "https://www.typescriptlang.org/",
        "title": "TypeScript - JavaScript That Scales",
        "timestamp": "2025-08-28T10:00:00Z",
        "contentHash": "sha256:abc123...",
        "accessible": true
      }
    ]
  }
}
```

## Detailed Testing Strategies by Component

This concludes the first part of the test plan. The document will continue with detailed component-specific testing strategies in subsequent sections.

---

*Generated: August 28, 2025*