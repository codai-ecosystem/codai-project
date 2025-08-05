# MemorAI Python Client

Official Python client library for the MemorAI platform - Advanced AI memory management and vector search.

## Installation

```bash
pip install memorai-client
```

Or install from source:

```bash
git clone https://github.com/codai-org/memorai-python-client.git
cd memorai-python-client
pip install -e .
```

## Quick Start

```python
from memorai import MemorAI

# Initialize client
client = MemorAI(
    api_key="your-api-key",  # Optional for local development
    base_url="https://api.memorai.ro"  # Or http://localhost:4006 for local
)

# Create a memory
memory = client.memories.create(
    content="Machine learning is a subset of artificial intelligence.",
    title="ML Definition",
    category="education",
    tags=["ai", "ml", "definition"]
)

print(f"Created memory: {memory.id}")

# Search memories
results = client.search.query(
    query="artificial intelligence",
    algorithm="semantic",
    limit=10
)

print(f"Found {len(results.memories)} memories")
for memory in results.memories:
    print(f"- {memory.title}: {memory.content[:100]}...")
```

## Features

### 🧠 Memory Management
- **CRUD Operations**: Create, read, update, delete memories
- **Batch Operations**: Process multiple memories efficiently
- **Metadata Support**: Rich metadata and tagging system
- **Categories**: Organize memories by categories

### 🔍 Advanced Search
- **Semantic Search**: AI-powered semantic understanding
- **Full-text Search**: Traditional text-based search
- **Exact Match**: Precise string matching
- **Fuzzy Search**: Approximate string matching 
- **Hybrid Search**: Combined search algorithms

### 📊 Analytics & Insights
- **Usage Statistics**: Track memory usage patterns
- **Performance Metrics**: Monitor search performance
- **Category Analytics**: Analyze memory distribution
- **Search Analytics**: Understand search behavior

### ⚡ Real-time Features
- **WebSocket Support**: Real-time memory updates
- **Event Callbacks**: React to memory events
- **Live Synchronization**: Multi-client sync

### 🛡️ Enterprise Features
- **Authentication**: API key and OAuth support
- **Rate Limiting**: Automatic rate limit handling
- **Retry Logic**: Robust error handling with backoff
- **Performance Tracking**: Built-in performance monitoring

## Usage Examples

### Memory Operations

```python
# Create memory with metadata
memory = client.memories.create(
    content="Python is a versatile programming language",
    title="Python Overview",
    category="programming",
    tags=["python", "programming", "language"],
    metadata={
        "difficulty": "beginner",
        "source": "documentation",
        "author": "user123"
    }
)

# Update memory
updated = client.memories.update(
    memory.id,
    content="Python is a versatile, high-level programming language",
    tags=["python", "programming", "language", "high-level"]
)

# Get memory by ID
retrieved = client.memories.get(memory.id)

# List memories with filtering
memories = client.memories.list(
    limit=50,
    category="programming",
    tags=["python"]
)

# Delete memory
success = client.memories.delete(memory.id)
```

### Advanced Search

```python
# Semantic search
results = client.search.query(
    query="machine learning algorithms",
    algorithm="semantic",
    limit=20,
    categories=["ai", "programming"],
    min_similarity=0.7
)

# Search with date filtering
from datetime import datetime, timedelta

results = client.search.query(
    query="python tutorial",
    algorithm="hybrid",
    date_from=datetime.now() - timedelta(days=30),
    date_to=datetime.now()
)

# Find similar memories
similar = client.search.similar(memory_id="mem_123", limit=5)
```

### Batch Operations

```python
from memorai.models import BatchOperation

# Batch create memories
operations = [
    BatchOperation(
        operation="create",
        data={
            "content": "JavaScript is a dynamic programming language",
            "title": "JavaScript Basics",
            "category": "programming",
            "tags": ["javascript", "web"]
        }
    ),
    BatchOperation(
        operation="create", 
        data={
            "content": "React is a JavaScript library for building UIs",
            "title": "React Overview",
            "category": "frameworks",
            "tags": ["react", "javascript", "ui"]
        }
    )
]

result = client.memories.batch(operations)
print(f"Processed: {result.total_processed}, Success: {result.success_count}")
```

### Real-time Updates

```python
# Register event callbacks
def on_memory_created(data):
    print(f"New memory created: {data['id']}")

def on_memory_updated(data):
    print(f"Memory updated: {data['id']}")

client.on("memory:created", on_memory_created)
client.on("memory:updated", on_memory_updated)

# Keep connection alive for real-time updates
# client._ws.run_forever()  # In production, use proper threading
```

### Analytics

```python
# Get comprehensive analytics
analytics = client.analytics.get()

print(f"Total memories: {analytics.total_memories}")
print("Memories by category:")
for category, count in analytics.memories_by_category.items():
    print(f"  {category}: {count}")

print("Performance metrics:")
for metric, value in analytics.performance_metrics.items():
    print(f"  {metric}: {value}")
```

### System Health

```python
# Check system health
health = client.system.health()
print(f"System status: {health.status}")
print(f"Services: {health.services}")

# Get API version
version = client.system.version()
print(f"API Version: {version['version']}")
```

### Error Handling

```python
from memorai.exceptions import (
    MemorAIError,
    MemorAIAPIError, 
    MemorAIAuthError,
    MemorAIRateLimitError
)

try:
    memory = client.memories.create(
        content="Test memory",
        title="Test"
    )
except MemorAIAuthError:
    print("Authentication failed - check your API key")
except MemorAIRateLimitError as e:
    print(f"Rate limit exceeded. Retry after: {e.retry_after} seconds")
except MemorAIAPIError as e:
    print(f"API error {e.status_code}: {e.message}")
except MemorAIError as e:
    print(f"MemorAI error: {e.message}")
```

### Configuration

```python
# Advanced client configuration
client = MemorAI(
    api_key="your-api-key",
    base_url="https://api.memorai.ro",
    timeout=60.0,           # Request timeout
    max_retries=5,          # Max retry attempts
    retry_delay=2.0,        # Delay between retries
    enable_websocket=True,  # Real-time features
    debug=True             # Debug logging
)

# Check rate limiting
rate_limit = client.get_rate_limit_info()
if rate_limit:
    print(f"Rate limit: {rate_limit.remaining}/{rate_limit.limit}")

# Get performance metrics
metrics = client.get_performance_metrics()
avg_time = sum(m['execution_time_ms'] for m in metrics) / len(metrics)
print(f"Average request time: {avg_time:.1f}ms")
```

## API Reference

### Client Classes

- **`MemorAI`**: Main client class
- **`MemoryAPI`**: Memory management operations  
- **`SearchAPI`**: Search and similarity operations
- **`AnalyticsAPI`**: Analytics and insights
- **`SystemAPI`**: System health and version info

### Data Models

- **`Memory`**: Memory data model
- **`SearchResult`**: Search results container
- **`SearchOptions`**: Search configuration
- **`AnalyticsData`**: Analytics data model
- **`SystemHealth`**: System health status
- **`BatchOperation`**: Batch operation definition
- **`BatchResult`**: Batch operation results

### Exceptions

- **`MemorAIError`**: Base exception class
- **`MemorAIAPIError`**: API-related errors
- **`MemorAIAuthError`**: Authentication errors
- **`MemorAIRateLimitError`**: Rate limiting errors
- **`MemorAIConnectionError`**: Connection errors
- **`MemorAITimeoutError`**: Timeout errors
- **`MemorAIWebSocketError`**: WebSocket errors

## Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/codai-org/memorai-python-client.git
cd memorai-python-client

# Install in development mode
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black memorai/

# Type checking
mypy memorai/

# Linting
flake8 memorai/
```

### Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=memorai --cov-report=html

# Run specific test file
pytest tests/test_client.py

# Run with debugging
pytest -v -s tests/test_search.py
```

## Requirements

- Python 3.8+
- requests>=2.28.0
- websocket-client>=1.4.0
- pydantic>=2.0.0
- backoff>=2.2.0

## License

MIT License - see LICENSE file for details.

## Support

- 📖 [Documentation](https://docs.memorai.ro/python)
- 🐛 [Bug Reports](https://github.com/codai-org/memorai-python-client/issues)  
- 💬 [Discussions](https://github.com/codai-org/memorai-python-client/discussions)
- 📧 [Email Support](mailto:support@memorai.ro)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**MemorAI** - Advanced AI Memory Management Platform  
Made with ❤️ by the [CODAI Team](https://codai.ro)
