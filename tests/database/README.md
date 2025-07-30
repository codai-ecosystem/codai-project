# 📊 CODAI Ecosystem Database/Storage Testing Suite

## Overview

Comprehensive testing suite for database and storage operations across all CODAI applications, ensuring robust data management, file handling, caching, and real-time synchronization capabilities.

## 🎯 Test Coverage

### MEMORAI Operations Testing
- **CRUD Operations**: Create, Read, Update, Delete across 13 services
- **Search Functionality**: Full-text and semantic search capabilities
- **Bulk Operations**: Batch processing and transaction handling
- **Error Handling**: Invalid IDs, malformed data, edge cases
- **Performance**: Concurrent operations, large datasets, response times

### File Operations Testing
- **File Upload/Download**: Multiple file types and sizes (1KB - 100MB)
- **File Metadata**: Preservation of file properties and attributes
- **Concurrent Uploads**: Multiple file operations simultaneously
- **Size Limits**: Testing upload limits and error handling
- **File Integrity**: Content verification through upload/download cycle

### Cache Operations Testing
- **Data Types**: String, Number, Object, Array caching
- **TTL (Time To Live)**: Expiration testing and cleanup
- **Large Values**: Performance with large cached objects
- **Concurrent Access**: Multiple clients accessing cache simultaneously
- **Error Handling**: Invalid keys, expired data, edge cases

### Real-time Synchronization Testing
- **WebSocket Connections**: Connection establishment and management
- **Message Exchange**: Bi-directional communication testing
- **Multi-Client Sync**: Data synchronization between multiple clients
- **Connection Resilience**: Reconnection and error recovery
- **Performance**: High-volume messaging and latency testing
- **Data Ordering**: Message sequence preservation

### Performance Testing
- **Load Testing**: Sustained request volumes and response times
- **Stress Testing**: Large data volumes and memory pressure
- **Concurrency**: Simultaneous operations and race conditions
- **Scalability**: Performance under increasing loads
- **Data Consistency**: Integrity under concurrent operations

## 🏗️ Test Architecture

```
tests/database/
├── specs/                          # Test specification files
│   ├── memorai-operations.spec.ts  # MEMORAI CRUD and search tests
│   ├── file-operations.spec.ts     # File upload/download tests
│   ├── cache-operations.spec.ts    # Caching functionality tests
│   ├── realtime-sync.spec.ts       # Real-time sync tests
│   └── performance.spec.ts         # Load and performance tests
├── database-storage-helpers.ts     # Test utilities and helpers
├── global-setup.ts                 # Test environment initialization
├── global-teardown.ts             # Test cleanup and reporting
├── playwright.config.ts           # Playwright configuration
└── package.json                   # Dependencies and scripts
```

## 🔧 Test Services

### Applications Under Test (13 Services)
- **MEMORAI**: Memory operations, search, bulk processing
- **HUB**: Central coordination, caching, real-time sync
- **CODAI**: Code analysis, project data storage
- **ADMIN**: Administrative operations, user management
- **LOGAI**: Logging, audit trails, data archival
- **ANALIZAI**: Analytics data processing and storage
- **MARKETAI**: Market data, analysis storage
- **CUMPARAI**: Shopping data, transaction storage
- **BANCAI**: Financial data, secure transactions
- **FABRICAI**: Manufacturing data, process storage
- **PUBLICAI**: Public content, social data storage
- **STUDIAI**: Educational data, progress tracking
- **PREZENTAI**: Presentation data, media storage

## 📋 Test Categories

### 1. Basic Operations (40+ tests)
- CRUD operations across all services
- Data type handling and validation
- Error scenarios and edge cases
- Response time and basic performance

### 2. Advanced Features (30+ tests)
- Bulk operations and transactions
- Search and filtering capabilities
- File metadata and integrity
- Cache TTL and expiration

### 3. Concurrency & Performance (25+ tests)
- Concurrent operations testing
- Load testing with realistic scenarios
- Memory pressure and large datasets
- Scaling and throughput analysis

### 4. Real-time Features (20+ tests)
- WebSocket connection management
- Multi-client synchronization
- Message ordering and delivery
- Connection resilience testing

### 5. Integration & End-to-End (15+ tests)
- Cross-service data consistency
- File and cache integration
- Real-time data updates
- Complete workflow validation

## 🚀 Getting Started

### Prerequisites
```bash
# Ensure CODAI ecosystem is running
cd apps/gateway && npm run dev  # API Gateway on port 4000
# Start required services on ports 4001-4011
```

### Installation
```bash
cd tests/database
pnpm install
npx playwright install
```

### Running Tests
```bash
# Run all database/storage tests
pnpm test

# Run specific test categories
pnpm run test:memorai      # MEMORAI operations only
pnpm run test:files        # File operations only
pnpm run test:cache        # Cache operations only
pnpm run test:sync         # Real-time sync only
pnpm run test:performance  # Performance tests only

# Run tests with UI
pnpm run test:ui

# Run tests in headed mode
pnpm run test:headed

# Generate and view reports
pnpm run report
```

### Test Configuration

#### Test Projects
- **memorai-operations**: CRUD, search, bulk operations
- **file-operations**: Upload, download, metadata testing
- **cache-operations**: Caching, TTL, performance
- **realtime-sync**: WebSocket, multi-client sync
- **performance-tests**: Load, stress, scalability
- **firefox**: Cross-browser compatibility
- **mobile**: Mobile-specific scenarios

#### Environment Variables
```bash
# Test configuration
TEST_MODE=database-storage-testing
BASE_URL=http://localhost:4000  # API Gateway
TEST_TIMEOUT=120000             # 2 minutes per test
CONCURRENCY_LIMIT=5             # Concurrent operations
```

## 📊 Success Criteria

### Performance Benchmarks
- **Response Time**: < 2 seconds average for CRUD operations
- **Throughput**: > 10 requests/second under load
- **Success Rate**: > 85% for all operations
- **File Upload**: Support files up to 50MB
- **Cache Performance**: < 100ms for cache operations
- **Real-time Latency**: < 500ms for message delivery

### Quality Gates
- **Data Integrity**: 100% for all operations
- **Error Handling**: Proper error codes and messages
- **Concurrent Operations**: 80%+ success rate
- **File Integrity**: 100% content preservation
- **Cache Consistency**: 95%+ data consistency
- **WebSocket Stability**: 90%+ connection success

### Coverage Requirements
- **Service Coverage**: All 13 services tested
- **Operation Coverage**: All CRUD operations
- **File Type Coverage**: Text, binary, JSON formats
- **Data Size Coverage**: 1KB to 100MB files
- **Concurrency Coverage**: 1-50 concurrent operations

## 🔍 Test Reporting

### Generated Reports
- **HTML Report**: Detailed test results with screenshots
- **JSON Report**: Machine-readable results for CI/CD
- **JUnit Report**: Integration with test management tools
- **Performance Metrics**: Response times, throughput data

### Success Metrics Tracked
- **Overall Success Rate**: Percentage of passing tests
- **Service-Specific Success**: Per-service performance
- **Operation Success Rates**: CRUD, file, cache, sync success
- **Performance Metrics**: Response times, throughput
- **Error Analysis**: Common failures and patterns

## 🐛 Troubleshooting

### Common Issues
1. **Connection Failures**: Ensure API Gateway and services are running
2. **Timeout Errors**: Increase test timeout for slower operations
3. **Memory Issues**: Reduce concurrent operations for large datasets
4. **File Upload Failures**: Check file size limits and permissions
5. **WebSocket Issues**: Verify real-time service capabilities

### Debug Mode
```bash
# Enable debug logging
DEBUG=* pnpm test

# Run single test for debugging
npx playwright test memorai-operations.spec.ts --debug
```

## 🎯 Next Steps

After completing Phase 6.2, the test results will inform:
- **Phase 6.3**: SDK/CLI/API Testing
- **Phase 6.4**: Integration Testing
- **Production Deployment**: Performance optimization
- **Monitoring Setup**: Real-time performance tracking

---

This comprehensive testing suite ensures the CODAI ecosystem's database and storage operations are production-ready, performant, and reliable across all applications and use cases.
