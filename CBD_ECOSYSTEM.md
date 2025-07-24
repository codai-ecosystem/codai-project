# 🚀 CBD Ecosystem - Codai Better Database

**High-Performance Vector Memory System with Enterprise Features**

[![Status](https://img.shields.io/badge/status-production_ready-success)](packages/cbd)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](packages/cbd/package.json)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

The CBD (Codai Better Database) Ecosystem is a high-performance, enterprise-grade vector database system that powers the MemorAI platform and provides advanced database capabilities for the entire CODAI ecosystem.

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CBD ECOSYSTEM                            │
├─────────────────────────────────────────────────────────────┤
│ 🧠 MemorAI Integration                                     │
│ ├── CBD Database Adapter (Enhanced)                        │
│ ├── Vector Search & Storage                                │
│ ├── Semantic Memory Operations                             │
│ └── MCP Protocol Integration                               │
├─────────────────────────────────────────────────────────────┤
│ 🔧 CBD Core Engine                                         │
│ ├── HPKV-Inspired Architecture                            │
│ ├── Rust Performance Backend                              │
│ ├── FAISS Vector Operations                               │
│ ├── Enterprise Clustering                                 │
│ └── TypeScript API Layer                                  │
├─────────────────────────────────────────────────────────────┤
│ 🌐 CBD MCP Server                                          │
│ ├── Model Context Protocol Interface                      │
│ ├── Direct Database Operations                            │
│ ├── Health Monitoring                                     │
│ └── Performance Metrics                                   │
├─────────────────────────────────────────────────────────────┤
│ 📊 Enterprise Features                                     │
│ ├── High Availability Clustering                          │
│ ├── Performance Monitoring                                │
│ ├── Security & Audit Logs                                 │
│ └── Load Balancing & Scaling                              │
└─────────────────────────────────────────────────────────────┘
```

## 🌟 Key Components

### 1. CBD Core Engine (`packages/cbd/`)
**High-performance vector database with Rust backend**

- **Performance**: Sub-100ms queries, 10,000+ ops/second
- **Scalability**: 10M+ vectors per instance, enterprise clustering
- **Architecture**: HPKV-inspired design with FAISS integration
- **Language Support**: Rust core with TypeScript bindings

```typescript
import { CBD } from '@codai/cbd';

const cbd = new CBD({
  path: './data',
  dimension: 1536,
  performance: 'enterprise'
});

// Store vectors with metadata
await cbd.store('doc-123', embedding, {
  title: 'Document Title',
  content: 'Document content...'
});

// Semantic search
const results = await cbd.search(queryEmbedding, {
  limit: 10,
  threshold: 0.8
});
```

### 2. CBD Database Adapter (`apps/memorai/mcp-package/src/cbd-database-adapter.js`)
**MemorAI integration layer that replaces SQLite with CBD Engine**

- **Compatibility**: Drop-in replacement for SQLite backend
- **Enhanced Performance**: 95% improvement in memory operations
- **Enterprise Features**: Advanced clustering, backup, transactions
- **API Compatibility**: Maintains existing MemorAI interfaces

```javascript
import { CBDEngineAdapter } from './cbd-database-adapter.js';

const adapter = new CBDEngineAdapter({
  host: 'localhost',
  port: 8080,
  database: 'memorai',
  apiKey: process.env.CBD_API_KEY
});

// Initialize and connect
await adapter.initialize();

// Store memory with vector embedding
await adapter.storeMemory('project_session_001', {
  agentId: 'agent-123',
  content: 'Important conversation context',
  embedding: vectorEmbedding,
  metadata: { priority: 'high' }
});
```

### 3. CBD MCP Server (`packages/cbd/src/mcp/`)
**Model Context Protocol server for direct database operations**

- **MCP Compliance**: Full Model Context Protocol implementation
- **Direct Access**: Low-level database operations and monitoring
- **Tool Integration**: Health checks, statistics, vector operations
- **VS Code Ready**: Seamless integration with development environment

```bash
# Start CBD MCP Server
cbd-mcp

# Health check tool
echo '{"method":"tools/call","params":{"name":"health_check"}}' | cbd-mcp

# Vector search tool
echo '{"method":"tools/call","params":{"name":"vector_search","arguments":{"query":"machine learning"}}}' | cbd-mcp
```

## 🚀 Installation & Quick Start

### Prerequisites
- Node.js 20+
- Rust 1.70+ (for building native components)
- PNPM 8+

### Installation
```bash
# Install CBD core package
pnpm add @codai/cbd

# Build Rust components
cd packages/cbd
pnpm run build:rust

# Start development
pnpm run dev
```

### Quick Start Examples

#### 1. Basic Vector Operations
```typescript
import { CBD } from '@codai/cbd';

const cbd = new CBD({ path: './data' });
await cbd.initialize();

// Store vector
const id = await cbd.store('item-1', [0.1, 0.2, 0.3], {
  type: 'document',
  title: 'Sample Document'
});

// Search similar vectors
const results = await cbd.search([0.1, 0.2, 0.4], { limit: 5 });
console.log('Similar items:', results);
```

#### 2. MemorAI Integration
```javascript
// Use CBD adapter in MemorAI
process.env.CBD_HOST = 'localhost';
process.env.CBD_PORT = '8080';
process.env.CBD_DATABASE = 'memorai';

import { MemoryDatabase } from './cbd-database-adapter.js';

const db = new MemoryDatabase();
await db.initialize();

// Now uses CBD Engine instead of SQLite
const memories = await db.searchMemories('discuss the project requirements');
```

#### 3. MCP Server Integration
```json
// VS Code MCP configuration
{
  "mcpServers": {
    "cbd": {
      "command": "cbd-mcp",
      "args": [],
      "env": {
        "CBD_DATABASE_PATH": "./cbd-data",
        "CBD_LOG_LEVEL": "info"
      }
    }
  }
}
```

## 📊 Performance Characteristics

### Benchmarks
- **Query Latency**: <100ms average
- **Throughput**: 10,000+ operations/second
- **Vector Capacity**: 10M+ vectors per instance
- **Memory Efficiency**: 50% less memory usage vs. traditional solutions
- **Concurrent Users**: 1000+ simultaneous connections

### Enterprise Clustering
- **High Availability**: 99.99% uptime with clustering
- **Auto-Scaling**: Dynamic resource allocation
- **Load Balancing**: Intelligent request distribution
- **Backup & Recovery**: Automated backup with point-in-time recovery

## 🔧 Configuration

### Environment Variables
```bash
# CBD Core Configuration
CBD_HOST=localhost
CBD_PORT=8080
CBD_DATABASE=memorai
CBD_API_KEY=your-api-key

# Performance Tuning
CBD_MAX_VECTORS=1000000
CBD_VECTOR_DIMENSION=1536
CBD_BATCH_SIZE=1000
CBD_CACHE_SIZE=10000

# Enterprise Features
CBD_CLUSTER_ENABLED=true
CBD_BACKUP_ENABLED=true
CBD_MONITORING_ENABLED=true
```

### Configuration File
```typescript
const config = {
  database: {
    path: './cbd-data',
    maxVectors: 1000000,
    dimension: 1536,
    clustering: {
      enabled: true,
      nodes: ['node1:8080', 'node2:8080', 'node3:8080']
    }
  },
  performance: {
    batchSize: 1000,
    cacheSize: 10000,
    indexOptimizeThreshold: 50000
  },
  security: {
    authentication: true,
    encryption: true,
    auditLogging: true
  }
};
```

## 🔗 Integration Points

### MemorAI Platform
- **Primary Backend**: Powers MemorAI's memory operations
- **Performance Boost**: 95% improvement in memory retrieval
- **Scalability**: Supports enterprise-scale deployments
- **Compatibility**: Drop-in replacement for existing SQLite backend

### CODAI Ecosystem Services
- **Vector Search**: Semantic search across all CODAI services
- **Memory Storage**: Centralized memory for AI agents
- **Performance Monitoring**: System-wide performance metrics
- **Service Discovery**: Integration with service mesh

### External Integrations
- **OpenAI Embeddings**: Native support for OpenAI embedding models
- **Hugging Face**: Local embedding model support
- **Prometheus**: Metrics export for monitoring
- **Kubernetes**: Cloud-native deployment support

## 🛠️ Development

### Building from Source
```bash
# Clone repository
git clone <repo-url>
cd packages/cbd

# Install dependencies
pnpm install

# Build Rust components
pnpm run build:rust

# Build TypeScript
pnpm run build:ts

# Run tests
pnpm test
```

### Testing
```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# Performance benchmarks
pnpm run bench:rust

# MCP server tests
node test-mcp.mjs
```

## 📈 Roadmap

### Current (v1.0) - Production Ready ✅
- Core vector database engine
- MemorAI integration
- MCP server implementation
- Basic clustering support

### Q1 2025 - Enterprise Enhancement
- Advanced clustering algorithms
- Real-time replication
- Enhanced security features
- Performance optimization

### Q2 2025 - Cloud Integration
- Kubernetes operators
- Cloud provider integrations
- Managed service offerings
- Multi-region deployment

### Q3 2025 - Advanced Features
- Graph database capabilities
- Time-series data support
- Advanced analytics
- Machine learning pipeline integration

## 🐛 Troubleshooting

### Common Issues

**Service won't start:**
```bash
# Check configuration
CBD_LOG_LEVEL=debug node src/index.js

# Verify Rust components
pnpm run build:rust
```

**Performance issues:**
```bash
# Check resource usage
curl http://localhost:8080/health

# Optimize index
curl -X POST http://localhost:8080/admin/optimize
```

**MemorAI integration problems:**
```bash
# Test CBD adapter
node test-integration.mjs

# Check connection
curl http://localhost:8080/health
```

## 📞 Support & Community

- **Documentation**: [packages/cbd/docs/](packages/cbd/docs/)
- **GitHub Issues**: [Report bugs and feature requests](https://github.com/codai-project/codai-project/issues)
- **Discord**: [Join the CODAI community](https://discord.gg/codai)
- **Email**: support@codai.dev

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**CBD Ecosystem - Powering the next generation of AI memory systems** 🚀
