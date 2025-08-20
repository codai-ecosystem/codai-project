# CBD - Codai Better Database (Enterprise Edition)

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/codai-project/cbd)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)](https://www.rust-lang.org/)

**CBD Enterprise** is a revolutionary high-performance vector memory system with enterprise-grade features including clustering, security, and gRPC server capabilities. Built with TypeScript and Rust for maximum performance and reliability.

## 🚀 **Enterprise Features**

### **🧠 Core Database**

- **Vector Memory System**: HPKV-inspired architecture with semantic search
- **Multiple Storage Backends**: SQLite, CBD-Native, and enterprise storage
- **Embedding Models**: OpenAI, local models, and custom embeddings
- **MCP Server**: Model Context Protocol server for AI integrations

### **🏢 Enterprise Architecture**

- **🔗 Clustering**: Raft consensus-based distributed clustering
- **🔒 Security**: JWT authentication, OAuth2, LDAP, and encryption
- **⚡ High-Performance Server**: gRPC and REST APIs with monitoring
- **📊 Metrics & Monitoring**: Prometheus metrics and health checks
- **🛡️ Enterprise Security**: AES-256-GCM encryption and audit logging

## 📦 **Installation**

```bash
# Install from npm
npm install @codai/cbd

# Or with pnpm
pnpm add @codai/cbd

# Or with yarn
yarn add @codai/cbd
```

## 🚀 **Quick Start**

### **Basic Usage**

```typescript
import { createCBDEngine, CBDEnterprise } from '@codai/cbd';

// Create basic CBD engine
const cbd = createCBDEngine({
  storage: {
    type: 'cbd-native',
    dataPath: './cbd-data',
  },
  embedding: {
    model: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
  },
});

// Store and search memories
await cbd.storeMemory('user-pref', 'User prefers dark mode', metadata);
const results = await cbd.searchMemories('dark theme preference');
```

### **Enterprise Setup**

```typescript
import { CBDEnterprise } from '@codai/cbd';

// Create enterprise instance
const enterprise = new CBDEnterprise();

// Initialize with enterprise features
await enterprise.initialize({
  security: {
    jwtSecret: 'your-secret',
    sessionTimeout: 3600,
    enableOAuth2: true,
    encryptionKey: 'your-encryption-key',
    requireTLS: true,
  },
  cluster: {
    nodeId: 'cbd-node-1',
    bindAddress: '0.0.0.0:8080',
    clusterPeers: ['cbd-node-2:8080', 'cbd-node-3:8080'],
    enableRaft: true,
    dataDir: './cluster-data',
  },
  server: {
    grpcPort: 8080,
    restPort: 8081,
    adminPort: 8082,
    bindAddress: '0.0.0.0',
    maxConnections: 1000,
    enableTLS: true,
    enableMetrics: true,
  },
});

// Start enterprise services
await enterprise.start();
```

## 🏗️ **Architecture**

### **Modular Design**

```
CBD Enterprise
├── Core Database (TypeScript)
│   ├── Memory Engine
│   ├── Vector Store (Faiss)
│   ├── Storage Adapters
│   └── MCP Server
├── Enterprise Modules (Rust)
│   ├── cbd-core (Core traits)
│   ├── cbd-vector (HNSW index)
│   ├── cbd-storage (RocksDB)
│   ├── cbd-cluster (Raft consensus)
│   ├── cbd-security (JWT, encryption)
│   └── cbd-server (gRPC/REST)
└── TypeScript Interfaces
    ├── Cluster Manager
    ├── Security Manager
    └── Enterprise Server
```

### **Technology Stack**

- **TypeScript**: Application logic and interfaces
- **Rust**: High-performance enterprise modules
- **RocksDB**: Enterprise storage backend
- **Faiss**: Vector similarity search
- **gRPC/tonic**: High-performance RPC
- **JWT/OAuth2**: Authentication and authorization
- **Raft**: Distributed consensus

## 🔧 **Configuration**

### **Basic Configuration**

```typescript
const config = {
  storage: {
    type: 'cbd-native', // 'sqlite' | 'cbd-native'
    dataPath: './cbd-data',
  },
  embedding: {
    model: 'openai', // 'openai' | 'local'
    apiKey: process.env.OPENAI_API_KEY,
    modelName: 'text-embedding-ada-002',
    dimensions: 1536,
  },
  vector: {
    indexType: 'faiss', // 'faiss' | 'inmemory'
    dimensions: 1536,
    similarityMetric: 'cosine',
  },
};
```

### **Enterprise Configuration**

```typescript
const enterpriseConfig = {
  cluster: {
    nodeId: 'cbd-node-1',
    bindAddress: '0.0.0.0:8080',
    clusterPeers: ['node-2:8080', 'node-3:8080'],
    enableRaft: true,
    dataDir: './cluster-data',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET,
    sessionTimeout: 3600, // seconds
    enableOAuth2: true,
    enableLDAP: false,
    encryptionKey: process.env.ENCRYPTION_KEY,
    requireTLS: true,
  },
  server: {
    grpcPort: 8080,
    restPort: 8081,
    adminPort: 8082,
    bindAddress: '0.0.0.0',
    maxConnections: 1000,
    enableTLS: true,
    certFile: './certs/server.crt',
    keyFile: './certs/server.key',
    enableMetrics: true,
    enableTracing: true,
  },
};
```

## 📊 **API Reference**

### **Basic Operations**

```typescript
// Memory operations
await cbd.storeMemory(key, content, metadata);
await cbd.searchMemories(query, options);
await cbd.getMemory(key);
await cbd.deleteMemory(key);

// Vector operations
await cbd.storeVector(id, vector, metadata);
await cbd.searchVectors(queryVector, options);

// Statistics
const stats = await cbd.getStats();
```

### **Enterprise Operations**

```typescript
// Cluster management
const state = await enterprise.cluster.getClusterState();
const isLeader = await enterprise.cluster.isLeader();
await enterprise.cluster.joinCluster(leaderAddress);

// Security operations
const token = await enterprise.security.authenticate(username, password);
const context = await enterprise.security.validateToken(token);
const hasPermission = await enterprise.security.hasPermission(context, 'write');

// Server operations
const stats = await enterprise.server.getStats();
const health = await enterprise.server.healthCheck();
const metrics = await enterprise.server.getMetrics();
```

## 🔐 **Security Features**

### **Authentication**

- JWT tokens with configurable expiration
- OAuth2 integration for enterprise SSO
- LDAP support for directory services
- API key authentication for service-to-service

### **Authorization**

- Role-based access control (RBAC)
- Permission-based authorization
- Context-aware security policies
- Audit logging for compliance

### **Encryption**

- AES-256-GCM encryption at rest
- TLS 1.3 encryption in transit
- Key rotation and management
- Secure key derivation

## 📈 **Performance & Monitoring**

### **Metrics**

- Request throughput and latency
- Memory and CPU usage
- Error rates and success rates
- Cluster health and performance

### **Health Checks**

- Database connectivity
- Cluster consensus status
- Security service health
- Resource utilization

### **Prometheus Integration**

```bash
# Get metrics endpoint
curl http://localhost:8082/metrics

# Sample metrics
cbd_total_requests 1500
cbd_active_connections 25
cbd_requests_per_second 150
cbd_average_response_time 45
cbd_error_rate 0.02
```

## 🛠️ **Development**

### **Build Commands**

```bash
# Install dependencies
pnpm install

# Build TypeScript and Rust
pnpm build

# Build only Rust workspace
pnpm build:rust:workspace

# Build enterprise features
pnpm build:enterprise

# Run tests
pnpm test
pnpm test:enterprise

# Start development server
pnpm dev

# Start enterprise server
pnpm server:enterprise
```

### **Project Structure**

```
packages/cbd/
├── src/
│   ├── memory/           # Core memory engine
│   ├── vector/           # Vector operations
│   ├── storage/          # Storage adapters
│   ├── embedding/        # Embedding models
│   ├── mcp/             # MCP server
│   ├── enterprise/      # Enterprise TypeScript interfaces
│   └── types/           # Type definitions
├── cbd-core/            # Rust core traits
├── cbd-vector/          # Rust vector operations
├── cbd-storage/         # Rust storage backend
├── cbd-cluster/         # Rust clustering
├── cbd-security/        # Rust security
├── cbd-server/          # Rust gRPC/REST server
├── tests/               # Test suites
└── docs/                # Documentation
```

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 **Acknowledgments**

- Built with [Rust](https://www.rust-lang.org/) for performance and safety
- Powered by [TypeScript](https://www.typescriptlang.org/) for developer experience
- Vector search with [Faiss](https://github.com/facebookresearch/faiss)
- Storage with [RocksDB](https://rocksdb.org/)
- Clustering with [Raft consensus](https://raft.github.io/)
- gRPC with [tonic](https://github.com/hyperium/tonic)

---

**CBD Enterprise** - The world-class vector database for the AI era. 🚀

_Built by the CODAI Ecosystem team_
