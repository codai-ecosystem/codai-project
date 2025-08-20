# MemorAI MCP Server - Consolidated Production Version

## Overview

The **MemorAI MCP Server** is a production-ready, enterprise-grade memory management system that provides persistent storage and intelligent retrieval for AI agents. This consolidated version incorporates the best features from all previous implementations into a single, well-organized server file.

## Features

### ✅ Core Features
- **CBD Database Integration**: Persistent storage using CODAI Better Database
- **MCP 2025-06-18 Protocol**: Full JSON-RPC 2.0 compliance for VS Code integration
- **Agent Isolation**: Multi-tenant memory management with agent-specific storage
- **RESTful API**: HTTP endpoints for health checks and statistics

### ✅ Enhanced Search Capabilities
- **Azure OpenAI Embeddings**: Vector embeddings using text-embedding-3-large model
- **Vector Similarity Search**: Cosine similarity-based semantic search
- **Hybrid Search Engine**: 4-strategy approach (Vector + TF-IDF + Fuzzy + Keyword)
- **TF-IDF Scoring**: Term frequency-inverse document frequency ranking
- **Fuzzy Matching**: Levenshtein distance-based approximate matching
- **Intelligent Caching**: TTL-based caching for embeddings and search results

### ✅ Enterprise-Ready Components
- **RBAC Security**: Role-based access control (configurable)
- **Quota Management**: Memory and storage limits per agent
- **Performance Metrics**: Real-time performance monitoring
- **Advanced Metadata**: Rich metadata processing and filtering
- **Feature Flags**: Environment-based feature enablement

## Architecture

### File Structure
```
memorai-mcp-server.cjs          # Main consolidated server (single file)
├── AzureEmbeddingsService      # Azure OpenAI integration
├── HybridSearchEngine          # Multi-strategy search
├── RBACManager                 # Security and access control
├── CBDMemoryStore              # Database integration
└── Express Server              # HTTP/MCP protocol handling
```

### Archive Directory
```
archive/                        # Historical implementations
├── memorai-mcp-enhanced.cjs    # Phase 1 implementation
├── memorai-mcp-phase2.cjs      # Phase 2 with RBAC (had crypto issues)
├── memorai-mcp-vscode.cjs      # Original VS Code version
└── [other legacy files]        # Various experimental versions
```

## Configuration

### Environment Variables
```bash
# Server Configuration
MEMORAI_MCP_PORT=4950
MEMORAI_API_KEY=memorai-dev-key-2025
CBD_BASE_URL=http://localhost:4180

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://codai-dev-openai.openai.azure.com/
AZURE_OPENAI_API_KEY=8f9d3fd033c04f5ab6b5886c15f16a2c
AZURE_OPENAI_DEPLOYMENT_NAME=text-embedding-3-large
AZURE_OPENAI_API_VERSION=2024-02-01

# Feature Flags
ENABLE_VECTOR_SEARCH=true
ENABLE_HYBRID_SEARCH=true
ENABLE_FUZZY_MATCHING=true
ENABLE_KEYWORD_SEARCH=true
ENABLE_RBAC=false

# Cache Configuration
VECTOR_CACHE_TTL=3600           # 1 hour
SEARCH_CACHE_TTL=300            # 5 minutes
```

### VS Code Tasks Integration
The server is integrated with VS Code tasks in `.vscode/tasks.json`:
- **Start MemorAI MCP Server**: Runs the consolidated server
- **Test MemorAI MCP Health**: Health check endpoint test
- **Cleanup MemorAI MCP Port**: Port cleanup utility

## MCP Tools

### 1. remember
Store a memory with content and metadata
```json
{
  "agentId": "string",
  "content": "string",
  "metadata": {
    "importance": 1-10,
    "project": "string",
    "session": "string",
    "tags": ["array"],
    "entityType": "string"
  }
}
```

### 2. recall
Search and retrieve memories with intelligent hybrid search
```json
{
  "agentId": "string",
  "query": "string",
  "limit": 10,
  "minImportance": 0,
  "project": "string",
  "session": "string"
}
```

### 3. forget
Delete a memory by structured key
```json
{
  "agentId": "string",
  "structuredKey": "string"
}
```

### 4. context
Get recent context for agent
```json
{
  "agentId": "string",
  "contextSize": 5
}
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status, features, CBD health, and Azure OpenAI configuration.

### Statistics
```
GET /stats (requires authentication)
```
Returns memory statistics, agent information, and server metrics.

### MCP Protocol
```
POST /
```
Main MCP JSON-RPC 2.0 endpoint for tool calls and protocol communication.

## Search Engine Details

### Hybrid Search Strategy
1. **Vector Search (40% weight)**: Semantic similarity using Azure OpenAI embeddings
2. **Keyword Search (30% weight)**: Direct text matching
3. **TF-IDF Scoring (20% weight)**: Term frequency analysis
4. **Fuzzy Matching (10% weight)**: Approximate string matching

### Performance Optimizations
- **Embedding Caching**: Cached embeddings with TTL expiration
- **Search Result Caching**: Cached search results for repeated queries
- **Batch Processing**: Efficient batch operations for multiple memories
- **Connection Pooling**: Optimized database connections

## Deployment

### Development Mode
```bash
node memorai-mcp-server.cjs
```

### Production Considerations
- Ensure CBD Database is running on port 4180
- Configure Azure OpenAI credentials securely
- Enable appropriate feature flags based on requirements
- Monitor memory usage and performance metrics
- Set up proper logging and error handling

## Migration from Legacy Versions

### From Enhanced Version
All Azure OpenAI features are preserved and enhanced in the consolidated version.

### From Phase 2 Version
RBAC security features are available but disabled by default (set `ENABLE_RBAC=true` to enable).

### From VS Code Version
All VS Code integration features are maintained with additional enhancements.

## Troubleshooting

### Common Issues
1. **CBD Connection Failed**: Ensure CBD Database is running on port 4180
2. **Azure OpenAI Errors**: Verify API key and endpoint configuration
3. **Memory Quota Exceeded**: Check RBAC settings and quota limits
4. **Port Already in Use**: Use cleanup script to free port 4950

### Debug Mode
Set `DEBUG=memorai:*` for detailed logging output.

## Performance Metrics

### Expected Performance
- **Memory Storage**: Sub-100ms response time
- **Vector Search**: Sub-500ms for semantic queries
- **Hybrid Search**: Sub-1000ms for complex queries
- **Health Checks**: Sub-50ms response time

### Scalability
- **Memory Capacity**: Limited by CBD Database storage
- **Concurrent Agents**: Supports multiple simultaneous agents
- **Search Performance**: Scales with embedding cache hit rate

## Version History

- **v1.0.0**: Consolidated production version with all features
- **v9.9.0-enhanced**: Azure OpenAI integration (archived)
- **v10.0.0-phase2**: RBAC and enterprise features (archived)
- **v1.0.0-vscode**: Original VS Code integration (archived)

## Support

For issues, improvements, or questions:
1. Check the health endpoint for system status
2. Review logs for error details
3. Verify environment configuration
4. Test with minimal configuration first

---

**File Organization Complete**: All duplicate and phase-named files have been moved to the `archive/` directory, leaving only the single, properly-named `memorai-mcp-server.cjs` file as the production server.
