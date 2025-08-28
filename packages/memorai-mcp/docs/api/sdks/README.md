# MemorAI MCP Server - SDK Generation

This directory contains generated Software Development Kits (SDKs) for multiple programming languages, providing easy integration with the MemorAI MCP Server API.

## 🚀 Available SDKs

### JavaScript/TypeScript SDK
- **Package**: `@memorai/mcp-client`
- **Location**: [`./javascript/`](./javascript/)
- **Features**:
  - Full TypeScript support with type definitions
  - Promise-based async/await API
  - Built-in retry logic and error handling
  - Browser and Node.js compatibility
  - Comprehensive documentation and examples

### Python SDK
- **Package**: `memorai-mcp-client`
- **Location**: [`./python/`](./python/)
- **Features**:
  - Async/await support with aiohttp
  - Synchronous API with requests
  - Type hints for better IDE support
  - Pydantic models for validation
  - Comprehensive error handling

### Java SDK
- **Package**: `com.memorai.mcp.client`
- **Location**: [`./java/`](./java/)
- **Features**:
  - Spring Boot integration
  - Reactive programming support
  - Built-in connection pooling
  - Jackson serialization
  - Comprehensive unit tests

### Go SDK
- **Package**: `github.com/memorai/mcp-go-client`
- **Location**: [`./go/`](./go/)
- **Features**:
  - Context-aware operations
  - Built-in retry mechanisms
  - Structured logging
  - Idiomatic Go patterns
  - Comprehensive error handling

### C# SDK
- **Package**: `MemorAI.MCP.Client`
- **Location**: [`./csharp/`](./csharp/)
- **Features**:
  - .NET Standard 2.0 compatibility
  - Async/await patterns
  - Dependency injection support
  - Strong typing with generics
  - NuGet package distribution

## 📦 SDK Generation

SDKs are automatically generated from the [OpenAPI specification](../openapi.yaml) using industry-standard tools:

- **JavaScript/TypeScript**: [OpenAPI Generator](https://openapi-generator.tech/)
- **Python**: [OpenAPI Generator](https://openapi-generator.tech/) + Custom templates
- **Java**: [OpenAPI Generator](https://openapi-generator.tech/) with Spring Boot templates
- **Go**: [oapi-codegen](https://github.com/deepmap/oapi-codegen)
- **C#**: [NSwag](https://github.com/RicoSuter/NSwag)

### Regenerating SDKs

To regenerate all SDKs after OpenAPI specification updates:

```bash
# Install dependencies
npm install -g @openapitools/openapi-generator-cli

# Generate all SDKs
npm run generate-sdks

# Or generate specific SDK
npm run generate-sdk:javascript
npm run generate-sdk:python
npm run generate-sdk:java
npm run generate-sdk:go
npm run generate-sdk:csharp
```

## 🔧 SDK Features

All generated SDKs include:

### Core Features
- **Complete API Coverage**: All endpoints and operations
- **Authentication**: API key and Bearer token support
- **Error Handling**: Comprehensive error types and handling
- **Rate Limiting**: Automatic rate limit detection and handling
- **Retry Logic**: Configurable retry mechanisms
- **Timeout Handling**: Configurable request timeouts

### Advanced Features
- **Pagination**: Automatic pagination handling
- **Caching**: Optional response caching
- **Logging**: Structured logging integration
- **Metrics**: Optional metrics collection
- **Validation**: Request/response validation
- **Serialization**: Automatic JSON serialization/deserialization

### Developer Experience
- **Type Safety**: Strong typing in applicable languages
- **Documentation**: Comprehensive inline documentation
- **Examples**: Working code examples for all operations
- **Testing**: Unit tests and integration tests
- **IDE Support**: IntelliSense/autocomplete support

## 📚 Usage Examples

### JavaScript/TypeScript
```typescript
import { MemorAIClient } from '@memorai/mcp-client';

const client = new MemorAIClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.memorai.com/v1'
});

const memory = await client.rememberMemory({
  agentId: 'agent-123',
  content: 'Important information to remember',
  metadata: { importance: 8, tags: ['important'] }
});
```

### Python
```python
from memorai_mcp_client import MemorAIClient

client = MemorAIClient(api_key='your-api-key')

memory = await client.remember_memory(
    agent_id='agent-123',
    content='Important information to remember',
    metadata={'importance': 8, 'tags': ['important']}
)
```

### Java
```java
import com.memorai.mcp.client.MemorAIClient;
import com.memorai.mcp.client.model.RememberRequest;

MemorAIClient client = new MemorAIClient("your-api-key");

RememberRequest request = RememberRequest.builder()
    .agentId("agent-123")
    .content("Important information to remember")
    .metadata(Map.of("importance", 8, "tags", List.of("important")))
    .build();

Memory memory = client.rememberMemory(request);
```

### Go
```go
import "github.com/memorai/mcp-go-client"

client := memorai.NewClient("your-api-key")

memory, err := client.RememberMemory(ctx, &memorai.RememberRequest{
    AgentID: "agent-123",
    Content: "Important information to remember",
    Metadata: map[string]interface{}{
        "importance": 8,
        "tags": []string{"important"},
    },
})
```

### C#
```csharp
using MemorAI.MCP.Client;

var client = new MemorAIClient("your-api-key");

var memory = await client.RememberMemoryAsync(new RememberRequest
{
    AgentId = "agent-123",
    Content = "Important information to remember",
    Metadata = new Dictionary<string, object>
    {
        ["importance"] = 8,
        ["tags"] = new[] { "important" }
    }
});
```

## 🔄 Versioning

SDKs follow semantic versioning (SemVer) and are versioned independently:

- **Major Version**: Breaking API changes
- **Minor Version**: New features, backward compatible
- **Patch Version**: Bug fixes, backward compatible

### Version Matrix

| API Version | JS/TS SDK | Python SDK | Java SDK | Go SDK | C# SDK |
|-------------|-----------|------------|----------|---------|---------|
| 9.5.0       | 1.5.0     | 1.5.0      | 1.5.0    | 1.5.0   | 1.5.0   |
| 9.4.0       | 1.4.0     | 1.4.0      | 1.4.0    | 1.4.0   | 1.4.0   |
| 9.3.0       | 1.3.0     | 1.3.0      | 1.3.0    | 1.3.0   | 1.3.0   |

## 📋 Installation Instructions

### JavaScript/TypeScript
```bash
npm install @memorai/mcp-client
# or
yarn add @memorai/mcp-client
```

### Python
```bash
pip install memorai-mcp-client
# or
poetry add memorai-mcp-client
```

### Java
```xml
<dependency>
    <groupId>com.memorai</groupId>
    <artifactId>mcp-client</artifactId>
    <version>1.5.0</version>
</dependency>
```

### Go
```bash
go get github.com/memorai/mcp-go-client
```

### C#
```bash
dotnet add package MemorAI.MCP.Client
# or via Package Manager
Install-Package MemorAI.MCP.Client
```

## 🛠️ SDK Development

### Contributing to SDKs

1. **Make OpenAPI Changes**: Update the [OpenAPI specification](../openapi.yaml)
2. **Generate SDKs**: Run `npm run generate-sdks`
3. **Update Templates**: Modify generator templates if needed
4. **Test Changes**: Run SDK-specific tests
5. **Update Documentation**: Update SDK documentation and examples
6. **Version Bump**: Update SDK versions appropriately

### Custom Templates

Each SDK uses customizable templates located in:
- `./templates/javascript/`
- `./templates/python/`
- `./templates/java/`
- `./templates/go/`
- `./templates/csharp/`

### Testing

Each SDK includes comprehensive testing:
- **Unit Tests**: Individual method testing
- **Integration Tests**: Full API integration testing
- **Mock Tests**: Testing with mock servers
- **Performance Tests**: Load and stress testing

## 📞 Support

For SDK-specific support:
- **General Issues**: [GitHub Issues](https://github.com/memorai/mcp-server/issues)
- **JavaScript/TypeScript**: [JS SDK Issues](https://github.com/memorai/mcp-client-js/issues)
- **Python**: [Python SDK Issues](https://github.com/memorai/mcp-client-python/issues)
- **Java**: [Java SDK Issues](https://github.com/memorai/mcp-client-java/issues)
- **Go**: [Go SDK Issues](https://github.com/memorai/mcp-client-go/issues)
- **C#**: [C# SDK Issues](https://github.com/memorai/mcp-client-csharp/issues)

## 📖 Documentation Links

- [API Documentation](../openapi.yaml)
- [Integration Examples](../examples/)
- [Best Practices Guide](../guides/best-practices.md)
- [Authentication Guide](../guides/authentication.md)
- [Rate Limiting Guide](../guides/rate-limiting.md)