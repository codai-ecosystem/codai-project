# MemorAI Java Client

Official Java client library for the MemorAI MCP Server. Provides a comprehensive, type-safe interface for all memory operations with both synchronous and asynchronous support.

## Installation

### Maven

Add this dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>com.memorai</groupId>
    <artifactId>memorai-client</artifactId>
    <version>1.5.0</version>
</dependency>
```

### Gradle

Add this dependency to your `build.gradle`:

```gradle
implementation 'com.memorai:memorai-client:1.5.0'
```

## Quick Start

### Basic Usage

```java
import com.memorai.client.MemorAIClient;
import com.memorai.client.MemorAIClient.*;

// Initialize client
MemorAIClient client = MemorAIClient.create("your-api-key-here");

// Health check
try {
    HealthResponse health = client.healthCheck();
    System.out.println("Service status: " + health.getStatus());
} catch (MemorAIException e) {
    System.err.println("Health check failed: " + e.getMessage());
}

// Store a memory
MemoryMetadata metadata = new MemoryMetadata()
    .importance(8)
    .tags(Arrays.asList("programming", "ai", "learning"))
    .project("ai-study")
    .entityType("learning_note");

RememberRequest rememberRequest = new RememberRequest(
    "user-123",
    "I learned that Java is excellent for enterprise applications",
    metadata
);

try {
    RememberResponse result = client.rememberMemory(rememberRequest);
    System.out.println("Stored memory: " + result.getMemoryId());
} catch (MemorAIException e) {
    System.err.println("Failed to store memory: " + e.getMessage());
}

// Search memories
RecallRequest recallRequest = new RecallRequest("user-123", "Java programming")
    .limit(10)
    .minImportance(5);

try {
    RecallResponse memories = client.recallMemories(recallRequest);
    System.out.println("Found " + memories.getMemories().size() + " memories");
    
    for (Memory memory : memories.getMemories()) {
        System.out.println("- " + memory.getContent() + 
                         " (Score: " + memory.getRelevanceScore() + ")");
    }
} catch (MemorAIException e) {
    System.err.println("Failed to recall memories: " + e.getMessage());
}

// Always close the client to release resources
client.close();
```

### Asynchronous Usage

```java
import java.util.concurrent.CompletableFuture;

// Create client
MemorAIClient client = MemorAIClient.create("your-api-key-here");

// Asynchronous operations
CompletableFuture<HealthResponse> healthFuture = client.healthCheckAsync();
CompletableFuture<RememberResponse> rememberFuture = client.rememberMemoryAsync(rememberRequest);
CompletableFuture<RecallResponse> recallFuture = client.recallMemoriesAsync(recallRequest);

// Handle results
healthFuture
    .thenAccept(health -> System.out.println("Health: " + health.getStatus()))
    .exceptionally(throwable -> {
        System.err.println("Health check failed: " + throwable.getMessage());
        return null;
    });

// Combine multiple async operations
CompletableFuture<String> combinedFuture = rememberFuture
    .thenCompose(rememberResult -> {
        System.out.println("Stored: " + rememberResult.getMemoryId());
        return recallFuture;
    })
    .thenApply(recallResult -> {
        return "Found " + recallResult.getMemories().size() + " memories";
    });

// Wait for completion
try {
    String result = combinedFuture.get();
    System.out.println(result);
} catch (Exception e) {
    System.err.println("Async operation failed: " + e.getMessage());
} finally {
    client.close();
}
```

## Features

### Complete API Coverage

- ✅ **Memory Operations**: Remember, recall, forget, context
- ✅ **Health Monitoring**: System status and diagnostics
- ✅ **Batch Operations**: Efficient bulk memory storage
- ✅ **Async Support**: CompletableFuture-based asynchronous operations

### Advanced Capabilities

- 🔒 **Type Safety**: Full type safety with comprehensive POJOs
- ⚡ **Async Support**: CompletableFuture-based async operations
- 🚀 **Performance**: Automatic retry logic with OkHttp
- 📊 **Comprehensive Logging**: Debug mode with HTTP request/response logging
- 🛡️ **Error Handling**: Detailed exception types with context information
- 🔄 **Resource Management**: Proper connection pooling and cleanup

## Configuration

```java
import com.memorai.client.MemorAIClient.Config;

// Create custom configuration
Config config = new Config("your-api-key")
    .baseUrl("https://api.memorai.com/v1")  // Default
    .timeout(30)  // Request timeout in seconds
    .maxRetries(3)  // Maximum retry attempts
    .debug(true)  // Enable debug logging
    .header("Custom-Header", "value");  // Additional headers

MemorAIClient client = MemorAIClient.create(config);
```

## Memory Metadata

Enrich your memories with structured metadata:

```java
MemoryMetadata metadata = new MemoryMetadata()
    .importance(8)  // 1-10 importance score
    .tags(Arrays.asList("ai", "learning", "java"))  // Searchable tags
    .project("ai-research")  // Project grouping
    .session("session-1")  // Session identifier
    .entityType("code_snippet")  // Entity classification
    .priority("high");  // Priority level
```

## Batch Operations

Efficiently store multiple memories:

```java
List<Map<String, Object>> memoriesToStore = Arrays.asList(
    Map.of(
        "content", "First learning note",
        "metadata", Map.of(
            "importance", 7,
            "tags", Arrays.asList("learning")
        )
    ),
    Map.of(
        "content", "Second learning note",
        "metadata", Map.of(
            "importance", 8,
            "tags", Arrays.asList("advanced")
        )
    )
);

List<RememberResponse> results = client.batchRememberMemories("user-123", memoriesToStore);
long successfulStores = results.stream().filter(Objects::nonNull).count();
System.out.println("Successfully stored " + successfulStores + " memories");
```

## Error Handling

```java
import com.memorai.client.MemorAIClient.MemorAIException;

try {
    RememberResponse result = client.rememberMemory(request);
    System.out.println("Success: " + result.getMemoryId());
} catch (MemorAIException e) {
    System.err.println("API Error: " + e.getCode() + " - " + e.getMessage());
    System.err.println("Status Code: " + e.getStatusCode());
    System.err.println("Request ID: " + e.getRequestId());
    if (e.getDetails() != null) {
        System.err.println("Details: " + e.getDetails());
    }
}
```

## Thread Safety

The `MemorAIClient` is thread-safe and can be used concurrently from multiple threads. It uses OkHttp's built-in connection pooling for optimal performance.

```java
// Shared client instance
MemorAIClient client = MemorAIClient.create("your-api-key");

// Use from multiple threads
ExecutorService executor = Executors.newFixedThreadPool(10);

for (int i = 0; i < 100; i++) {
    final int index = i;
    executor.submit(() -> {
        try {
            RememberRequest request = new RememberRequest(
                "user-" + index,
                "Memory content " + index,
                new MemoryMetadata().importance(5)
            );
            RememberResponse response = client.rememberMemory(request);
            System.out.println("Thread " + index + ": " + response.getMemoryId());
        } catch (Exception e) {
            System.err.println("Thread " + index + " failed: " + e.getMessage());
        }
    });
}

executor.shutdown();
```

## Spring Framework Integration

### Configuration

```java
@Configuration
public class MemorAIConfig {
    
    @Value("${memorai.api.key}")
    private String apiKey;
    
    @Value("${memorai.api.base-url:https://api.memorai.com/v1}")
    private String baseUrl;
    
    @Bean
    public MemorAIClient memorAIClient() {
        Config config = new Config(apiKey)
            .baseUrl(baseUrl)
            .debug(false);
        return MemorAIClient.create(config);
    }
    
    @PreDestroy
    public void cleanup() {
        memorAIClient().close();
    }
}
```

### Service Usage

```java
@Service
public class MemoryService {
    
    private final MemorAIClient memorAIClient;
    
    public MemoryService(MemorAIClient memorAIClient) {
        this.memorAIClient = memorAIClient;
    }
    
    public String storeUserLearning(String userId, String content, List<String> tags) {
        MemoryMetadata metadata = new MemoryMetadata()
            .importance(7)
            .tags(tags)
            .entityType("user_learning");
            
        RememberRequest request = new RememberRequest(userId, content, metadata);
        
        try {
            RememberResponse response = memorAIClient.rememberMemory(request);
            return response.getMemoryId();
        } catch (MemorAIException e) {
            throw new RuntimeException("Failed to store memory", e);
        }
    }
    
    public List<Memory> searchUserMemories(String userId, String query) {
        RecallRequest request = new RecallRequest(userId, query).limit(20);
        
        try {
            RecallResponse response = memorAIClient.recallMemories(request);
            return response.getMemories();
        } catch (MemorAIException e) {
            throw new RuntimeException("Failed to search memories", e);
        }
    }
}
```

## Development

### Building from Source

```bash
git clone https://github.com/memorai/memorai-mcp.git
cd memorai-mcp/packages/memorai-mcp/docs/api/sdks/java

# Build the project
mvn clean compile

# Run tests
mvn test

# Run integration tests
mvn verify

# Package
mvn package

# Install to local repository
mvn install
```

### Running Tests

```bash
# Unit tests only
mvn test

# Integration tests (requires running MemorAI server)
export MEMORAI_TEST_API_KEY="your-test-api-key"
export MEMORAI_TEST_BASE_URL="http://localhost:4950"
mvn verify
```

### Code Quality

```bash
# Code coverage
mvn jacoco:report

# Static analysis
mvn spotbugs:check

# Checkstyle
mvn checkstyle:check

# All quality checks
mvn clean verify -Pdev
```

## API Reference

### MemorAIClient

**Factory Methods**
- `MemorAIClient.create(String apiKey)`
- `MemorAIClient.create(Config config)`

**Memory Operations**
- `HealthResponse healthCheck()`
- `RememberResponse rememberMemory(RememberRequest request)`
- `RecallResponse recallMemories(RecallRequest request)`
- `ContextResponse getContext(String agentId, int contextSize)`
- `boolean forgetMemory(String agentId, String structuredKey)`

**Utility Methods**
- `List<RememberResponse> batchRememberMemories(String agentId, List<Map<String, Object>> memories)`

**Asynchronous Operations**
- `CompletableFuture<HealthResponse> healthCheckAsync()`
- `CompletableFuture<RememberResponse> rememberMemoryAsync(RememberRequest request)`
- `CompletableFuture<RecallResponse> recallMemoriesAsync(RecallRequest request)`
- `CompletableFuture<ContextResponse> getContextAsync(String agentId, int contextSize)`

**Resource Management**
- `void close()`

### Data Classes

**MemoryMetadata**
- Builder-style setters: `importance()`, `tags()`, `project()`, `session()`, `entityType()`, `priority()`

**RememberRequest**
- Constructor: `RememberRequest(String agentId, String content, MemoryMetadata metadata)`

**RecallRequest**
- Constructor: `RecallRequest(String agentId, String query)`
- Builder-style setters: `limit()`, `minImportance()`, `project()`, `session()`, `includeOtherAgents()`

## Requirements

- **Java**: 11 or higher
- **Dependencies**: OkHttp 4.12+, Jackson 2.16+
- **Build Tool**: Maven 3.6+ or Gradle 7.0+

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

**MemorAI Java Client** - Enterprise-grade memory management for AI applications.