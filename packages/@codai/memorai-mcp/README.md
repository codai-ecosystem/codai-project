# @codai/memorai-mcp

**High-Performance Vector Memory System for Model Context Protocol (MCP)**

A production-ready MCP server that provides advanced memory capabilities using CBD (Codai Better Database) architecture, designed for AI agents and applications requiring persistent, searchable memory.

## Features

🚀 **High-Performance Architecture**
- CBD-based vector memory storage with HPKV architecture
- OpenAI embeddings integration for semantic search
- Production-ready error handling and recovery
- Zero data loss and corruption protection

🧠 **Advanced Memory Operations**
- Store memories with rich metadata and context
- Semantic search across stored memories
- Agent-isolated memory management
- Structured key-based memory organization
- Vector similarity search for memory keys

🔧 **Easy Integration**
- Compatible with VS Code MCP configuration
- Environment-based configuration
- Supports custom .env file paths
- Graceful shutdown and error handling
- Comprehensive logging and monitoring

## Quick Start

### Using with VS Code MCP

Add to your VS Code MCP configuration (`mcp.json`):

```json
{
  "mcpServers": {
    "memorai": {
      "command": "npx",
      "args": ["-y", "@codai/memorai-mcp@latest"],
      "env": {
        "DOTENV_CONFIG_PATH": "E:\\GitHub\\workspace-ai\\.env"
      }
    }
  }
}
```

### Environment Configuration

Create a `.env` file with:

```env
# Required
OPENAI_API_KEY=your-openai-api-key

# Optional
MEMORAI_CBD_PATH=./memorai-cbd-data
MEMORAI_LOG_LEVEL=info
MEMORAI_CACHE_SIZE=10000
MEMORAI_DIMENSIONS=1536
MEMORAI_EMBEDDING_MODEL=text-embedding-ada-002
MEMORAI_MAX_MEMORIES=100000
```

### Direct Usage

```bash
# Install and run
npx -y @codai/memorai-mcp@latest

# With custom environment
DOTENV_CONFIG_PATH="/path/to/.env" npx @codai/memorai-mcp@latest

# With custom CBD path
MEMORAI_CBD_PATH="/path/to/data" npx @codai/memorai-mcp@latest
```

## MCP Tools

The server provides the following MCP tools:

### `mcp_memoraimcp_remember`
Store a new memory with metadata.

**Parameters:**
- `agentId` (string, required): Agent identifier for memory isolation
- `content` (string, required): Memory content to store
- `metadata` (object, optional): Additional metadata
  - `entityType`: Type of entity (e.g., 'plan', 'task', 'prompt')
  - `priority`: Priority level ('low', 'medium', 'high', 'critical')
  - `project`: Project name for organization
  - `session`: Session identifier
  - `tags`: Array of tags for categorization

**Example:**
```json
{
  "name": "mcp_memoraimcp_remember",
  "arguments": {
    "agentId": "copilot-agent",
    "content": "User prefers TypeScript over JavaScript for new projects",
    "metadata": {
      "entityType": "preference",
      "priority": "medium",
      "project": "codai-ecosystem",
      "tags": ["typescript", "preferences"]
    }
  }
}
```

### `mcp_memoraimcp_recall`
Search and retrieve stored memories.

**Parameters:**
- `agentId` (string, required): Agent identifier
- `query` (string, required): Search query
- `limit` (number, optional): Maximum results (default: 10)
- `minImportance` (number, optional): Minimum importance score (default: 0)
- `project` (string, optional): Filter by project
- `session` (string, optional): Filter by session

**Example:**
```json
{
  "name": "mcp_memoraimcp_recall",
  "arguments": {
    "agentId": "copilot-agent",
    "query": "typescript preferences",
    "limit": 5,
    "project": "codai-ecosystem"
  }
}
```

### `mcp_memoraimcp_forget`
Delete a memory by structured key.

**Parameters:**
- `agentId` (string, required): Agent identifier
- `structuredKey` (string, required): Structured key of memory to delete

### `mcp_memoraimcp_context`
Get recent context for an agent.

**Parameters:**
- `agentId` (string, required): Agent identifier
- `contextSize` (number, optional): Number of recent memories (default: 5)

### `mcp_memoraimcp_get_memory`
Get memory by exact structured key.

**Parameters:**
- `structuredKey` (string, required): Exact structured key

### `mcp_memoraimcp_search_keys`
Vector similarity search for memory keys.

**Parameters:**
- `query` (string, required): Query for finding similar keys
- `limit` (number, optional): Maximum keys to return (default: 10)
- `minScore` (number, optional): Minimum similarity score (default: 0.7)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key (required) | - |
| `DOTENV_CONFIG_PATH` | Path to .env file | `.env` |
| `MEMORAI_CBD_PATH` | CBD data directory | `./memorai-cbd-data` |
| `MEMORAI_LOG_LEVEL` | Log level | `info` |
| `MEMORAI_CACHE_SIZE` | Memory cache size | `10000` |
| `MEMORAI_DIMENSIONS` | Embedding dimensions | `1536` |
| `MEMORAI_EMBEDDING_MODEL` | OpenAI embedding model | `text-embedding-ada-002` |
| `MEMORAI_MAX_MEMORIES` | Maximum memories stored | `100000` |

### VS Code MCP Configuration

The server is designed to work seamlessly with VS Code MCP configurations:

```json
{
  "mcpServers": {
    "memorai": {
      "command": "npx",
      "args": ["-y", "@codai/memorai-mcp@latest"],
      "env": {
        "DOTENV_CONFIG_PATH": "/absolute/path/to/.env"
      }
    }
  }
}
```

## Architecture

### CBD (Codai Better Database) Integration

The server uses CBD architecture for:
- High-performance vector storage
- FAISS-based similarity search
- Efficient memory indexing
- Production-ready reliability

### Memory Structure

Memories are stored with the following structure:

```typescript
interface Memory {
  id: string;                    // Unique identifier
  content: string;               // Memory content
  metadata: {
    agentId: string;             // Agent identifier
    timestamp: string;           // ISO timestamp
    importance: number;          // Importance score (0-1)
    project?: string;            // Project name
    session?: string;            // Session identifier
    tags?: string[];             // Tags array
    entityType?: string;         // Entity type
    priority?: string;           // Priority level
  };
  structuredKey: string;         // Structured key for organization
  embedding?: number[];          // Vector embedding
}
```

### Structured Keys

Memories use structured keys for organization:
```
{project}_{date}_{session}_{sequence}
```

Example: `codai-ecosystem_20241220_copilot-agent_001`

## Error Handling

The server includes comprehensive error handling:

- **Environment Validation**: Checks for required environment variables
- **Graceful Shutdown**: Handles SIGINT/SIGTERM signals
- **Data Persistence**: Automatic memory saving on shutdown
- **Recovery**: Loads existing memories on startup
- **Logging**: Comprehensive logging for debugging

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY is required"**
   - Ensure `OPENAI_API_KEY` is set in your environment or .env file

2. **"Environment file not found"**
   - Check that `DOTENV_CONFIG_PATH` points to a valid .env file
   - Ensure the file exists and is readable

3. **"No memories found"**
   - Check that memories are being stored with correct `agentId`
   - Verify search query matches stored content
   - Check memory metadata filters

4. **"Failed to start server"**
   - Verify all dependencies are installed
   - Check CBD data directory permissions
   - Review environment variable configuration

### Debug Mode

Enable debug logging:

```bash
MEMORAI_LOG_LEVEL=debug npx @codai/memorai-mcp@latest
```

## Development

### Building from Source

```bash
# Clone and install dependencies
git clone <repository>
cd packages/@codai/memorai-mcp
npm install

# Build the package
npm run build

# Test the package
npm test

# Run locally
npm start
```

### Package Scripts

- `npm run build`: Build TypeScript to JavaScript
- `npm test`: Run package tests
- `npm start`: Start server locally
- `npm run clean`: Clean build artifacts

## Version History

### 8.0.0-cbd
- Initial CBD-based implementation
- Full MCP tool compatibility
- Production-ready architecture
- VS Code MCP integration
- Comprehensive error handling

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review environment configuration
3. Enable debug logging
4. Check VS Code MCP server logs

---

**Note**: This package is part of the CODAI ecosystem and uses CBD (Codai Better Database) for high-performance memory operations.
