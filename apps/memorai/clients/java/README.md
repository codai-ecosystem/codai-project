# MemorAI Java Client

The official Java client library for the MemorAI platform, providing comprehensive access to memory management, advanced search capabilities, real-time updates, analytics, and system monitoring.

## 🚀 Features

- **Complete API Coverage**: Full access to all MemorAI endpoints
- **Type Safety**: Comprehensive data models with Jackson serialization
- **Async Operations**: CompletableFuture-based API for non-blocking operations
- **Real-time Updates**: WebSocket integration for live event streaming
- **Advanced Search**: Multiple search algorithms (semantic, hybrid, fuzzy)
- **Performance Monitoring**: Built-in analytics and performance tracking
- **Error Handling**: Robust exception hierarchy with detailed error information
- **Connection Management**: Automatic retry logic and connection pooling
- **Flexible Configuration**: Builder pattern with extensive customization options

## 📦 Installation

### Maven

Add the following dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>ro.memorai</groupId>
    <artifactId>memorai-java-client</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle

Add the following to your `build.gradle`:

```gradle
implementation 'ro.memorai:memorai-java-client:1.0.0'
```

## 🔧 Quick Start

### Basic Usage

```java
import ro.memorai.client.*;
import java.util.*;
import java.util.concurrent.CompletableFuture;

// Initialize the client
MemorAIClient client = MemorAIClient.builder()
    .apiKey("your-api-key-here")
    .baseUrl("https://api.memorai.ro")
    .build();

// Create a memory
CompletableFuture<Memory> future = client.memories().create(
    "Java is a powerful object-oriented programming language"
);
Memory memory = future.get();
System.out.println("Created memory: " + memory.getId());

// Search memories
CompletableFuture<List<SearchResult>> searchFuture = client.search().search("Java programming");
List<SearchResult> results = searchFuture.get();
System.out.println("Found " + results.size() + " results");

// Get analytics
CompletableFuture<AnalyticsData> analyticsFuture = client.analytics().getData();
AnalyticsData analytics = analyticsFuture.get();
System.out.println("Total memories: " + analytics.getTotalMemories());

// Clean up
client.close();
```

### Advanced Configuration

```java
MemorAIClient client = MemorAIClient.builder()
    .apiKey("your-api-key")
    .baseUrl("https://api.memorai.ro")
    .timeout(60) // 60 seconds timeout
    .enableWebSocket(true) // Enable real-time events
    .retryOnConnectionFailure(true)
    .userAgent("MyApp/1.0.0")
    .debug(true) // Enable debug logging
    .build();
```

## 🧠 Memory Management

### Creating Memories

```java
// Simple memory creation
CompletableFuture<Memory> future1 = client.memories().create("Memory content");

// Memory with metadata and tags
Map<String, Object> metadata = new HashMap<>();
metadata.put("author", "John Doe");
metadata.put("category", "programming");

List<String> tags = Arrays.asList("java", "tutorial", "basics");

CompletableFuture<Memory> future2 = client.memories().create(
    "Advanced Java concepts and patterns",
    metadata,
    tags
);

// Using Memory object
Memory memory = new Memory("Direct memory creation");
memory.setTags(Arrays.asList("direct", "object"));
memory.setCategory("example");

CompletableFuture<Memory> future3 = client.memories().create(memory);
```

### Retrieving Memories

```java
// Get by ID
CompletableFuture<Memory> memory = client.memories().get("memory-id");

// Get all memories
CompletableFuture<List<Memory>> allMemories = client.memories().getAll();

// Get with pagination
CompletableFuture<List<Memory>> pagedMemories = client.memories().getAll(10, 0);

// Get by tag
CompletableFuture<List<Memory>> taggedMemories = client.memories().getByTag("java");

// Get by multiple tags
List<String> tags = Arrays.asList("java", "programming");
CompletableFuture<List<Memory>> multiTagMemories = client.memories().getByTags(tags);

// Get by category
CompletableFuture<List<Memory>> categoryMemories = client.memories().getByCategory("tutorial");
```

### Updating Memories

```java
// Update entire memory
Memory updatedMemory = new Memory("Updated content");
CompletableFuture<Memory> future1 = client.memories().update("memory-id", updatedMemory);

// Update only content
CompletableFuture<Memory> future2 = client.memories().updateContent("memory-id", "New content");

// Update metadata
Map<String, Object> newMetadata = new HashMap<>();
newMetadata.put("updated", true);
CompletableFuture<Memory> future3 = client.memories().updateMetadata("memory-id", newMetadata);

// Update tags
List<String> newTags = Arrays.asList("updated", "modified");
CompletableFuture<Memory> future4 = client.memories().updateTags("memory-id", newTags);
```

### Deleting Memories

```java
// Delete single memory
CompletableFuture<Void> future1 = client.memories().delete("memory-id");

// Delete multiple memories
List<String> idsToDelete = Arrays.asList("id1", "id2", "id3");
CompletableFuture<Void> future2 = client.memories().deleteMany(idsToDelete);
```

## 🔍 Advanced Search

### Search Algorithms

```java
// Basic search
CompletableFuture<List<SearchResult>> results1 = client.search().search("Java programming");

// Semantic search (using AI embeddings)
CompletableFuture<List<SearchResult>> results2 = client.search().semanticSearch("OOP concepts");

// Semantic search with threshold
CompletableFuture<List<SearchResult>> results3 = client.search().semanticSearch("design patterns", 0.8);

// Hybrid search (combines multiple algorithms)
CompletableFuture<List<SearchResult>> results4 = client.search().hybridSearch("Java frameworks");

// Fuzzy search (approximate matching)
CompletableFuture<List<SearchResult>> results5 = client.search().fuzzySearch("Java framwork"); // Note the typo
```

### Advanced Search Options

```java
SearchOptions options = new SearchOptions("Java programming");
options.setLimit(20);
options.setOffset(0);
options.setAlgorithm(SearchOptions.SearchAlgorithm.HYBRID);
options.setThreshold(0.7);
options.setTags(Arrays.asList("java", "programming"));

// Metadata filters
Map<String, Object> filters = new HashMap<>();
filters.put("category", "tutorial");
filters.put("difficulty", "intermediate");
options.setMetadataFilters(filters);

// Sorting
options.setSortBy(SearchOptions.SortOption.RELEVANCE);
options.setSortOrder(SearchOptions.SortOrder.DESC);
options.setIncludeEmbeddings(false);

CompletableFuture<List<SearchResult>> results = client.search().search(options);
```

### Search Utilities

```java
// Get search suggestions
CompletableFuture<List<String>> suggestions = client.search().getSuggestions("Jav");

// Get popular searches
CompletableFuture<List<String>> popular = client.search().getPopularSearches();
```

## 📊 Analytics & Monitoring

### Analytics Data

```java
// Get comprehensive analytics
CompletableFuture<AnalyticsData> analytics = client.analytics().getData();

// Get analytics for date range
CompletableFuture<AnalyticsData> rangeAnalytics = client.analytics().getData("2024-01-01", "2024-12-31");

// Specific analytics endpoints
CompletableFuture<Map<String, Object>> memoryUsage = client.analytics().getMemoryUsage();
CompletableFuture<AnalyticsData.SearchPerformance> searchPerf = client.analytics().getSearchPerformance();
CompletableFuture<List<AnalyticsData.TagCount>> popularTags = client.analytics().getPopularTags();
CompletableFuture<AnalyticsData.UsageStats> usageStats = client.analytics().getUsageStats();
```

### System Health

```java
// System health check
CompletableFuture<SystemHealth> health = client.system().getHealth();

// System information
CompletableFuture<String> version = client.system().getVersion();
CompletableFuture<Map<String, Object>> status = client.system().getStatus();
CompletableFuture<String> ping = client.system().ping();
CompletableFuture<Map<String, Object>> metrics = client.system().getMetrics();
```

## 🔄 Real-time Events

### WebSocket Integration

```java
// Register event listeners
client.on("memory:created", (data) -> {
    System.out.println("New memory created: " + data);
});

client.on("memory:updated", (data) -> {
    System.out.println("Memory updated: " + data);
});

client.on("search:performed", (data) -> {
    System.out.println("Search performed: " + data);
});

client.on("system:alert", (data) -> {
    System.out.println("System alert: " + data);
});

// Remove event listeners
client.off("memory:created", existingListener);
```

## 🛡️ Error Handling

### Exception Types

The client provides a comprehensive exception hierarchy:

```java
try {
    CompletableFuture<Memory> future = client.memories().get("invalid-id");
    Memory memory = future.get();
} catch (NotFoundException e) {
    System.err.println("Memory not found: " + e.getMessage());
    System.err.println("Error code: " + e.getErrorCode());
    System.err.println("Status code: " + e.getStatusCode());
} catch (AuthenticationException e) {
    System.err.println("Authentication failed: " + e.getMessage());
} catch (AuthorizationException e) {
    System.err.println("Access denied: " + e.getMessage());
} catch (RateLimitException e) {
    System.err.println("Rate limit exceeded, retry after: " + e.getRetryAfter() + "s");
} catch (ValidationException e) {
    System.err.println("Validation error: " + e.getMessage());
} catch (ServerException e) {
    System.err.println("Server error: " + e.getMessage());
} catch (MemorAIException e) {
    System.err.println("General MemorAI error: " + e.getMessage());
}
```

## ⚡ Performance & Best Practices

### Concurrent Operations

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

// Process multiple operations concurrently
ExecutorService executor = Executors.newFixedThreadPool(10);
List<CompletableFuture<Memory>> futures = new ArrayList<>();

for (String content : memoryContents) {
    CompletableFuture<Memory> future = CompletableFuture.supplyAsync(() -> {
        try {
            return client.memories().create(content).get();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }, executor);
    futures.add(future);
}

// Wait for all operations to complete
CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get();
```

### Resource Management

```java
// Always close the client to cleanup resources
try (MemorAIClient client = MemorAIClient.builder()
    .apiKey("api-key")
    .build()) {
    
    // Use the client...
    
} // Automatically closed here
```

### Performance Monitoring

```java
// Monitor API performance
long startTime = System.currentTimeMillis();

CompletableFuture<List<SearchResult>> future = client.search().search("query");
List<SearchResult> results = future.get();

long duration = System.currentTimeMillis() - startTime;
System.out.println("Search completed in " + duration + "ms");

// Get search performance metrics
CompletableFuture<AnalyticsData.SearchPerformance> perfFuture = client.analytics().getSearchPerformance();
AnalyticsData.SearchPerformance performance = perfFuture.get();

System.out.printf("Average response time: %.2fms\n", performance.getAverageResponseTime());
System.out.printf("Cache hit rate: %.1f%%\n", performance.getCacheHitRate() * 100);
```

## 🧪 Testing

The client includes comprehensive unit tests and examples:

```bash
# Run tests
mvn test

# Run with coverage
mvn test jacoco:report
```

### Test Examples

```java
@Test
void testMemoryCreation() {
    MemorAIClient client = MemorAIClient.builder()
        .apiKey("test-key")
        .baseUrl("http://localhost:4006")
        .build();
    
    CompletableFuture<Memory> future = client.memories().create("Test memory");
    assertNotNull(future);
    
    client.close();
}
```

## 🏗️ Building from Source

```bash
# Clone the repository
git clone https://github.com/memorai/memorai-java-client.git
cd memorai-java-client

# Build the project
mvn clean compile

# Run tests
mvn test

# Package JAR
mvn package

# Install to local repository
mvn install
```

## 📚 Examples

### Complete Example Application

```java
import ro.memorai.client.*;
import java.util.*;
import java.util.concurrent.CompletableFuture;

public class MemorAIExample {
    public static void main(String[] args) {
        // Initialize client
        MemorAIClient client = MemorAIClient.builder()
            .apiKey(System.getenv("MEMORAI_API_KEY"))
            .baseUrl("https://api.memorai.ro")
            .enableWebSocket(true)
            .debug(false)
            .build();
        
        try {
            // Create memories
            List<String> contents = Arrays.asList(
                "Java is a versatile programming language",
                "Spring Boot simplifies Java web development",
                "Maven manages Java project dependencies",
                "JUnit provides testing framework for Java"
            );
            
            System.out.println("Creating memories...");
            List<CompletableFuture<Memory>> createFutures = new ArrayList<>();
            
            for (String content : contents) {
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("language", "java");
                metadata.put("category", "programming");
                
                List<String> tags = Arrays.asList("java", "programming", "development");
                
                CompletableFuture<Memory> future = client.memories().create(content, metadata, tags);
                createFutures.add(future);
            }
            
            // Wait for all memories to be created
            CompletableFuture.allOf(createFutures.toArray(new CompletableFuture[0])).get();
            System.out.println("✅ Created " + contents.size() + " memories");
            
            // Search for Java-related memories
            System.out.println("\nSearching for Java programming concepts...");
            CompletableFuture<List<SearchResult>> searchFuture = client.search().hybridSearch("Java programming frameworks");
            List<SearchResult> results = searchFuture.get();
            
            System.out.println("Found " + results.size() + " results:");
            for (SearchResult result : results) {
                System.out.printf("- [%.3f] %s\n", result.getScore(), result.getMemory().getContent());
            }
            
            // Get analytics
            System.out.println("\nGetting analytics...");
            CompletableFuture<AnalyticsData> analyticsFuture = client.analytics().getData();
            AnalyticsData analytics = analyticsFuture.get();
            
            System.out.println("📊 Analytics Summary:");
            System.out.println("Total memories: " + analytics.getTotalMemories());
            System.out.println("Total searches: " + analytics.getTotalSearches());
            
            if (analytics.getPopularTags() != null) {
                System.out.println("Popular tags:");
                for (AnalyticsData.TagCount tagCount : analytics.getPopularTags()) {
                    System.out.println("  - " + tagCount.getTag() + ": " + tagCount.getCount());
                }
            }
            
            // Check system health
            System.out.println("\nChecking system health...");
            CompletableFuture<SystemHealth> healthFuture = client.system().getHealth();
            SystemHealth health = healthFuture.get();
            
            System.out.println("🏥 System Status: " + health.getStatus());
            System.out.println("Version: " + health.getVersion());
            System.out.printf("Memory usage: %.1f%%\n", health.getMemoryUsage() * 100);
            System.out.printf("CPU usage: %.1f%%\n", health.getCpuUsage() * 100);
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // Always close the client
            client.close();
            System.out.println("\n✅ Client closed successfully");
        }
    }
}
```

## 🔗 Links

- [MemorAI Platform](https://memorai.ro)
- [API Documentation](https://docs.memorai.ro)
- [GitHub Repository](https://github.com/memorai/memorai-java-client)
- [Issue Tracker](https://github.com/memorai/memorai-java-client/issues)
- [Maven Central](https://search.maven.org/artifact/ro.memorai/memorai-java-client)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📞 Support

- **Documentation**: [https://docs.memorai.ro](https://docs.memorai.ro)
- **Email**: support@memorai.ro
- **GitHub Issues**: [Create an issue](https://github.com/memorai/memorai-java-client/issues)

---

Made with ❤️ by the MemorAI team
