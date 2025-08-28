# MemorAI Python Client

Official Python client library for the MemorAI MCP Server. Provides both synchronous and asynchronous interfaces for all memory operations with comprehensive type safety and error handling.

## Installation

```bash
pip install memorai-client
```

Or for development:

```bash
pip install memorai-client[dev]
```

## Quick Start

### Synchronous Usage

```python
from memorai_client import create_client, MemoryMetadata, RememberRequest, RecallRequest

# Initialize client
client = create_client(
    api_key="your-api-key-here",
    base_url="https://api.memorai.com/v1",  # Optional
    debug=True  # Enable debug logging
)

# Health check
health = client.health_check()
print(f"Service status: {health.status}")

# Store a memory
remember_request = RememberRequest(
    agent_id="user-123",
    content="I learned that Python is great for AI development",
    metadata=MemoryMetadata(
        importance=8,
        tags=["programming", "ai", "learning"],
        project="ai-study",
        entity_type="learning_note"
    )
)

result = client.remember_memory(remember_request)
print(f"Stored memory: {result.memory_id}")

# Search memories
recall_request = RecallRequest(
    agent_id="user-123",
    query="Python programming",
    limit=10,
    min_importance=5
)

memories = client.recall_memories(recall_request)
print(f"Found {len(memories.memories)} memories")

for memory in memories.memories:
    print(f"- {memory.content} (Score: {memory.relevance_score})")
```

### Asynchronous Usage

```python
import asyncio
from memorai_client import create_async_client, MemoryMetadata, RememberRequest

async def main():
    # Initialize async client
    client = create_async_client(
        api_key="your-api-key-here",
        debug=True
    )
    
    # Health check
    health = await client.health_check()
    print(f"Service status: {health.status}")
    
    # Store memory asynchronously
    remember_request = RememberRequest(
        agent_id="user-123",
        content="Async programming is powerful in Python",
        metadata=MemoryMetadata(
            importance=9,
            tags=["async", "python", "programming"],
            session="learning-session-1"
        )
    )
    
    result = await client.remember_memory(remember_request)
    print(f"Stored memory: {result.memory_id}")

# Run async example
asyncio.run(main())
```

## Features

### Complete API Coverage

- ✅ **Memory Operations**: Remember, recall, forget, context
- ✅ **Analytics**: Dashboard, insights, temporal patterns
- ✅ **Health Monitoring**: System status and diagnostics
- ✅ **Batch Operations**: Efficient bulk memory storage
- ✅ **Real-time Updates**: WebSocket support for live synchronization

### Advanced Capabilities

- 🔒 **Type Safety**: Full type hints and dataclass support
- ⚡ **Async Support**: Both sync and async client implementations  
- 🚀 **Performance**: Automatic retry logic and connection pooling
- 📊 **Comprehensive Logging**: Debug mode with detailed request/response logging
- 🛡️ **Error Handling**: Detailed error types with context information
- 🔄 **WebSocket Integration**: Real-time memory synchronization

## Configuration

```python
from memorai_client import MemorAIClientConfig, MemorAIClient

config = MemorAIClientConfig(
    api_key="your-api-key",
    base_url="https://api.memorai.com/v1",  # Default
    timeout=30,  # Request timeout in seconds
    max_retries=3,  # Maximum retry attempts
    debug=False,  # Enable debug logging
    headers={"Custom-Header": "value"}  # Additional headers
)

client = MemorAIClient(config)
```

## Memory Metadata

Enrich your memories with structured metadata:

```python
from memorai_client import MemoryMetadata

metadata = MemoryMetadata(
    importance=8,  # 1-10 importance score
    tags=["ai", "learning", "python"],  # Searchable tags
    project="ai-research",  # Project grouping
    session="session-1",  # Session identifier
    entity_type="code_snippet",  # Entity classification
    priority="high"  # Priority level
)
```

## Analytics and Insights

```python
# Get comprehensive analytics
dashboard = client.get_analytics_dashboard("user-123")
print(f"Total memories: {dashboard.total_memories}")
print(f"Average importance: {dashboard.average_importance}")
print(f"Top tags: {dashboard.top_tags}")

# Generate insights
insights = client.generate_insights("user-123")
print("AI-generated insights:", insights)

# Memory statistics
stats = client.get_memory_stats("user-123")
print(f"Memory span: {stats['oldest_memory']} to {stats['newest_memory']}")
```

## Batch Operations

Efficiently store multiple memories:

```python
memories_to_store = [
    {
        "content": "First learning note",
        "metadata": {"importance": 7, "tags": ["learning"]}
    },
    {
        "content": "Second learning note", 
        "metadata": {"importance": 8, "tags": ["advanced"]}
    }
]

results = client.batch_remember_memories("user-123", memories_to_store)
successful_stores = [r for r in results if r is not None]
print(f"Successfully stored {len(successful_stores)} memories")
```

## WebSocket Real-time Updates

```python
import asyncio
from memorai_client import create_async_client

async def listen_to_updates():
    client = create_async_client(api_key="your-api-key")
    
    async for message in client.create_websocket_connection("user-123"):
        print(f"Real-time update: {message}")

asyncio.run(listen_to_updates())
```

## Error Handling

```python
from memorai_client import MemorAIError, create_client

client = create_client(api_key="your-api-key")

try:
    result = client.remember_memory(request)
except MemorAIError as e:
    print(f"API Error: {e.code} - {e.message}")
    print(f"Status Code: {e.status_code}")
    print(f"Request ID: {e.request_id}")
    if e.details:
        print(f"Details: {e.details}")
```

## Development

### Setup Development Environment

```bash
git clone https://github.com/memorai/memorai-mcp.git
cd memorai-mcp/packages/memorai-mcp/docs/api/sdks/python

# Install in development mode
pip install -e ".[dev]"

# Run tests
pytest

# Code formatting
black memorai_client/
isort memorai_client/

# Type checking
mypy memorai_client/
```

### Running Examples

```bash
# Set your API key
export MEMORAI_API_KEY="your-api-key-here"

# Run basic example
python examples/basic_usage.py

# Run async example
python examples/async_usage.py

# Run analytics example
python examples/analytics_demo.py
```

## API Reference

### MemorAIClient

**Constructor**
- `MemorAIClient(config: MemorAIClientConfig)`

**Memory Operations**
- `health_check() -> HealthResponse`
- `remember_memory(request: RememberRequest) -> RememberResponse`
- `recall_memories(request: RecallRequest) -> RecallResponse`
- `get_context(agent_id: str, context_size: int = 5) -> ContextResponse`
- `forget_memory(agent_id: str, structured_key: str) -> bool`

**Analytics Operations**
- `get_analytics_dashboard(agent_id: str) -> AnalyticsDashboard`
- `generate_insights(agent_id: str) -> Dict[str, Any]`
- `analyze_temporal_patterns(agent_id: str) -> Dict[str, Any]`

**Utility Methods**
- `batch_remember_memories(agent_id: str, memories: List[Dict]) -> List[Optional[RememberResponse]]`
- `get_memory_stats(agent_id: str) -> Dict[str, Any]`

### AsyncMemorAIClient

Same interface as `MemorAIClient` but with `async`/`await` support:

- `async health_check() -> HealthResponse`
- `async remember_memory(request: RememberRequest) -> RememberResponse`
- `async recall_memories(request: RecallRequest) -> RecallResponse`
- `async create_websocket_connection(agent_id: str) -> AsyncIterator[Dict[str, Any]]`

## Support

- 📖 **Documentation**: [https://memorai.github.io/memorai-mcp](https://memorai.github.io/memorai-mcp)
- 🐛 **Issues**: [GitHub Issues](https://github.com/memorai/memorai-mcp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/memorai/memorai-mcp/discussions)
- ✉️ **Email**: [team@memorai.com](mailto:team@memorai.com)

## License

MIT License. See [LICENSE](LICENSE) for details.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**MemorAI Python Client** - Enterprise-grade memory management for AI applications.