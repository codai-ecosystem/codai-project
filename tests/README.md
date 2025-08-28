# Cautai Testing Framework

This directory contains the comprehensive testing framework for the Cautai AI search engine project.

## Testing Architecture

### Test Categories

1. **Unit Tests** (`tests/unit/`)
   - Individual component and function testing
   - Isolated testing with mocks and stubs
   - Fast execution, high coverage
   - Technologies: Vitest, Jest DOM

2. **Integration Tests** (`tests/integration/`)
   - Component interaction testing
   - API endpoint testing
   - Database integration testing
   - Technologies: Vitest, Supertest

3. **End-to-End Tests** (`tests/e2e/`)
   - Complete user workflow testing
   - Browser automation testing
   - Cross-platform compatibility
   - Technologies: Playwright

4. **Performance Tests** (`tests/performance/`)
   - Load testing and stress testing
   - Response time benchmarking
   - Throughput measurement
   - Technologies: Artillery, k6

5. **Security Tests** (`tests/security/`)
   - Vulnerability scanning
   - Authentication testing
   - Input validation testing
   - Technologies: OWASP ZAP, Custom scripts

## Test Organization

```
tests/
├── README.md                          # This file
├── helpers/                           # Test utilities and mocks
│   ├── mocks/
│   │   ├── search-engine.ts          # MockSearchEngine for testing
│   │   ├── mcp-client.ts             # MockMCPClient for testing
│   │   └── http-client.ts            # MockHttpClient for testing
│   ├── fixtures/                     # Test data and fixtures
│   └── utils/                        # Test utility functions
├── unit/                             # Unit tests
│   ├── mcp/
│   │   ├── server.test.ts           # MCP server tests
│   │   └── tools.test.ts            # MCP tools tests
│   ├── cli/
│   │   ├── components.test.tsx      # CLI component tests
│   │   └── commands.test.ts         # CLI command tests
│   ├── http/
│   │   ├── server.test.ts           # HTTP server tests
│   │   ├── routes.test.ts           # Route handler tests
│   │   └── middleware.test.ts       # Middleware tests
│   ├── search/
│   │   ├── engine.test.ts           # Search engine tests
│   │   ├── ranking.test.ts          # Ranking algorithm tests
│   │   └── adapters.test.ts         # Search adapter tests
│   └── ui/
│       ├── components.test.tsx      # UI component tests
│       └── hooks.test.ts            # React hooks tests
├── integration/                      # Integration tests
│   ├── api/                         # API integration tests
│   ├── database/                    # Database integration tests
│   └── mcp-integration/             # MCP integration tests
├── e2e/                             # End-to-end tests
│   ├── web-application.spec.ts      # Web app E2E tests
│   ├── cli-workflows.spec.ts        # CLI workflow tests
│   └── vscode-extension.spec.ts     # VS Code extension tests
├── performance/                      # Performance tests
│   ├── load-test.yml                # Artillery load test config
│   ├── load-test-processor.js       # Load test utilities
│   └── benchmarks/                  # Performance benchmarks
└── security/                        # Security tests
    ├── auth-security.test.ts        # Authentication security
    ├── input-validation.test.ts     # Input validation
    └── vulnerability-scan.sh        # Security scanning
```

## Running Tests

### Prerequisites

Ensure all dependencies are installed:

```bash
pnpm install
```

### Unit Tests

Run all unit tests:
```bash
pnpm test:unit
```

Run specific unit test suite:
```bash
pnpm test:unit mcp/server
pnpm test:unit cli/components
```

Run with coverage:
```bash
pnpm test:unit --coverage
```

### Integration Tests

Run all integration tests:
```bash
pnpm test:integration
```

Run with database setup:
```bash
pnpm test:integration:db
```

### End-to-End Tests

Run all E2E tests:
```bash
pnpm test:e2e
```

Run in headed mode (with browser):
```bash
pnpm test:e2e:headed
```

Run specific browser:
```bash
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit
```

### Performance Tests

Run load tests:
```bash
pnpm test:performance
```

Run specific load test scenario:
```bash
artillery run tests/performance/load-test.yml --target http://localhost:3000
```

### Security Tests

Run security test suite:
```bash
pnpm test:security
```

Run vulnerability scan:
```bash
./tests/security/vulnerability-scan.sh
```

### All Tests

Run complete test suite:
```bash
pnpm test:all
```

## Test Configuration

### Environment Setup

Tests require specific environment variables:

```bash
# Test environment
NODE_ENV=test

# Test database
TEST_DB_URL=postgresql://test:test@localhost:5432/cautai_test

# Test Redis
TEST_REDIS_URL=redis://localhost:6379/1

# Test search engine
TEST_SEARCH_ENGINE=mock

# Performance test targets
PERF_TEST_TARGET=http://localhost:3000
PERF_TEST_DURATION=60s
```

### Test Data

Test fixtures are located in `tests/helpers/fixtures/`:

- `search-results.json` - Mock search results
- `user-queries.json` - Test search queries
- `api-responses.json` - Mock API responses

### Mocking Strategy

The testing framework uses comprehensive mocking:

1. **MockSearchEngine** - Isolated search engine testing
2. **MockMCPClient** - MCP protocol testing
3. **MockHttpClient** - HTTP request testing
4. **Test Fixtures** - Consistent test data

## Coverage Requirements

### Minimum Coverage Targets

- **Unit Tests**: 90% statement coverage
- **Integration Tests**: 80% path coverage
- **E2E Tests**: 100% critical user flows
- **Performance Tests**: All major endpoints
- **Security Tests**: All attack vectors

### Coverage Reporting

Generate coverage reports:
```bash
pnpm test:coverage
```

View coverage report:
```bash
open coverage/index.html
```

## Continuous Integration

### GitHub Actions

The testing pipeline runs on every PR and push:

1. **Unit & Integration Tests** - Fast feedback
2. **E2E Tests** - Cross-browser validation
3. **Performance Tests** - Performance regression detection
4. **Security Tests** - Vulnerability scanning
5. **Coverage Reporting** - Coverage tracking

### Quality Gates

All tests must pass for:
- Pull request approval
- Main branch deployment
- Release tagging

## Best Practices

### Writing Tests

1. **Descriptive Names** - Test names should describe behavior
2. **Arrange-Act-Assert** - Clear test structure
3. **Single Responsibility** - One assertion per test
4. **Fast Execution** - Unit tests < 1s, Integration tests < 5s
5. **Deterministic** - No flaky tests, consistent results

### Test Data Management

1. **Fixtures** - Use consistent test data
2. **Cleanup** - Clean state between tests
3. **Isolation** - Tests don't depend on each other
4. **Realistic Data** - Test data matches production patterns

### Performance Testing

1. **Baseline Metrics** - Establish performance baselines
2. **Regression Detection** - Alert on performance degradation
3. **Load Patterns** - Test realistic load patterns
4. **Resource Monitoring** - Track CPU, memory, network usage

### Security Testing

1. **Input Validation** - Test all input boundaries
2. **Authentication** - Verify auth/authz flows
3. **Data Protection** - Test data encryption/masking
4. **Vulnerability Scanning** - Regular security scans

## Troubleshooting

### Common Issues

1. **Test Timeouts** - Increase timeout for async operations
2. **Port Conflicts** - Use dynamic port allocation
3. **Database Connections** - Properly close connections
4. **Mock Cleanup** - Reset mocks between tests

### Debugging Tests

Enable debug mode:
```bash
DEBUG=cautai:test pnpm test:unit
```

Run single test with debugging:
```bash
pnpm test:unit --inspect-brk mcp/server.test.ts
```

### Performance Issues

Profile test execution:
```bash
pnpm test:unit --reporter=verbose --profile
```

## Contributing

When adding new features:

1. **Add Unit Tests** - Test individual components
2. **Add Integration Tests** - Test component interactions
3. **Update E2E Tests** - Test user workflows
4. **Performance Impact** - Measure performance impact
5. **Security Review** - Consider security implications

See `CONTRIBUTING.md` for detailed contribution guidelines.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Artillery Documentation](https://artillery.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Security Testing Guide](https://owasp.org/www-guide-testing/)
