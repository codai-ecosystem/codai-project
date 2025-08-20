# CBD MCP Server

A **Model Context Protocol (MCP) server** for **CBD (Codai Better Database)** - providing direct vector database operations and memory management through the MCP ecosystem.

## 🎯 Overview

CBD MCP Server bridges CBD's high-performance vector database with MCP clients, offering:

- **Direct Vector Operations**: Store, search, and manage vectors
- **Memory Management**: Conversation history and semantic search
- **Performance Monitoring**: Health checks and server statistics
- **MCP Compliance**: Full compatibility with VS Code and other MCP clients

## 🛠️ Installation

```bash
# Install the CBD package
npm install @codai/cbd
# or
pnpm add @codai/cbd
```

## 🚀 Usage

### Command Line Interface

```bash
# Start the MCP server
cbd-mcp

# With environment configuration
export CBD_DATABASE_PATH=./my-data
export CBD_LOG_LEVEL=debug
cbd-mcp
```

### MCP Client Integration

Add to your MCP client configuration (e.g., VS Code):

```json
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

### Programmatic Usage

```typescript
import { CBDMCPServer } from '@codai/cbd/mcp';

const server = new CBDMCPServer({
  database: {
    path: './cbd-data',
    memory: false,
    dimension: 1536
  },
  logging: {
    level: 'info',
    enabled: true
  }
});

await server.start();
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CBD_DATABASE_PATH` | `./cbd-mcp-data` | Database storage path |
| `CBD_DATABASE_MEMORY` | `false` | Use in-memory database |
| `CBD_LOG_LEVEL` | `info` | Logging level (debug, info, warn, error) |
| `CBD_LOG_ENABLED` | `true` | Enable/disable logging |
| `CBD_MAX_VECTORS` | `1000000` | Maximum vectors in database |
| `CBD_VECTOR_DIMENSION` | `1536` | Vector embedding dimension |
| `CBD_BATCH_SIZE` | `1000` | Batch processing size |
| `CBD_CACHE_SIZE` | `10000` | Memory cache size |

### Configuration Object

```typescript
interface CBDMCPConfig {
  server: {
    name: string;           // Server name
    version: string;        // Server version  
    maxConnections: number; // Max concurrent connections
    timeout: number;        // Request timeout (ms)
  };
  database: {
    path?: string;          // Storage path
    memory?: boolean;       // In-memory mode
    maxVectors?: number;    // Vector limit
    dimension?: number;     // Embedding dimension
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    enabled: boolean;
  };
  performance: {
    batchSize: number;      // Batch processing size
    cacheSize: number;      // Cache size
    indexOptimizeThreshold: number;
  };
}
```

## 🔍 Available Tools

### 1. Health Check (`health_check`)

Monitor server health and dependencies.

```json
{
  "name": "health_check",
  "arguments": {
    "detailed": false
  }
}
```

**Returns:** Health status with system checks, memory usage, and database connectivity.

### 2. Server Statistics (`get_server_stats`)

Get performance metrics and system information.

```json
{
  "name": "get_server_stats", 
  "arguments": {
    "detailed": true
  }
}
```

**Returns:** Uptime, memory usage, performance metrics, and optional detailed stats.

### 3. Vector Search (`vector_search`)

Perform semantic search using natural language queries.

```json
{
  "name": "vector_search",
  "arguments": {
    "query": "machine learning algorithms",
    "limit": 10,
    "threshold": 0.7
  }
}
```

**Returns:** Ranked search results with similarity scores and metadata.

### 4. Vector Store (`vector_store`)

Store new content in the vector database.

```json
{
  "name": "vector_store",
  "arguments": {
    "content": "Information about neural networks",
    "project": "ai-research", 
    "session": "study-session-1",
    "metadata": {"topic": "deep-learning"}
  }
}
```

**Returns:** Structured key and storage confirmation.

### 5. Search Memory (`search_memory`)

Search conversation history and memories.

```json
{
  "name": "search_memory",
  "arguments": {
    "query": "previous discussion about APIs",
    "limit": 5
  }
}
```

**Returns:** Conversation exchanges with relevance scores and AI-generated summary.

### 6. Get Memory (`get_memory`)

Retrieve specific memory by structured key.

```json
{
  "name": "get_memory",
  "arguments": {
    "key": "project_2025-07-22_session_001"
  }
}
```

**Returns:** Complete conversation exchange details.

## 🏗️ Architecture

### Component Overview

```
CBD MCP Server
├── Server (MCP Protocol Handler)
├── Tools/ 
│   ├── monitoring/ (health, stats)
│   ├── vector/ (search, store) 
│   └── memory/ (conversation management)
├── Config (Environment & Validation)
└── CBD Engine (Vector Database Backend)
```

### Integration with CBD Ecosystem

- **CBD Memory Engine**: Core vector operations and embedding generation
- **FAISS Vector Store**: High-performance similarity search
- **CBD Native Storage**: Persistent conversation storage
- **OpenAI/Local Embeddings**: Configurable embedding models

## 🔗 Relationship to Other MCPs

### Enhanced MemoraiMCP vs CBD MCP

| Feature | Enhanced MemoraiMCP | CBD MCP Server |
|---------|-------------------|----------------|
| **Purpose** | Memory management abstraction | Direct database operations |
| **Target Users** | AI agents, memory systems | Database developers, integrators |
| **Operations** | remember, recall, forget | vector_store, vector_search, get_stats |
| **Level** | High-level (semantic memory) | Low-level (database operations) |
| **Use Cases** | Agent memory, context management | Performance tuning, direct DB access |

### Complementary Usage

Both servers can run simultaneously:
- **Enhanced MemoraiMCP**: For agent memory management
- **CBD MCP**: For database administration and optimization

## 🧪 Development & Testing

### Local Development

```bash
# Clone and install
git clone <repo>
cd packages/cbd
pnpm install

# Build
pnpm run build

# Test
node test-mcp.mjs
```

### Testing Tools

```bash
# Test health check
echo '{"method":"tools/call","params":{"name":"health_check","arguments":{}}}' | cbd-mcp

# Test vector search
echo '{"method":"tools/call","params":{"name":"vector_search","arguments":{"query":"test"}}}' | cbd-mcp
```

## 📊 Performance

### Benchmarks

- **Search Latency**: <100ms for typical queries
- **Storage Throughput**: 1000+ vectors/second
- **Memory Usage**: ~50MB baseline + vector data
- **Concurrent Clients**: Up to 10 simultaneous connections

### Optimization

- Configure `batchSize` for bulk operations
- Adjust `cacheSize` based on available memory
- Use `indexOptimizeThreshold` for automatic optimization
- Set appropriate `dimension` for your embedding model

## 🐛 Troubleshooting

### Common Issues

**Server won't start:**
```bash
# Check configuration
CBD_LOG_LEVEL=debug cbd-mcp

# Verify dependencies
npm ls @modelcontextprotocol/sdk
```

**Connection errors:**
```bash
# Test basic connectivity
echo '{"method":"tools/list"}' | cbd-mcp
```

**Performance issues:**
```bash
# Check server stats
echo '{"method":"tools/call","params":{"name":"get_server_stats","arguments":{"detailed":true}}}' | cbd-mcp
```

### Debug Mode

```bash
export CBD_LOG_LEVEL=debug
export CBD_LOG_FORMAT=json
cbd-mcp
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests  
4. Submit a pull request

## 🔗 Links

- [Model Context Protocol](https://modelcontextprotocol.com/)
- [CBD Vector Database](../README.md)
- [CODAI Ecosystem](../../README.md)
- [Enhanced MemoraiMCP](../src/server/enhanced-memorai-server.ts)

---

**CBD MCP Server - Bridging high-performance vector databases with the MCP ecosystem** 🚀
