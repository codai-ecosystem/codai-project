package ro.memorai.client.examples;

import ro.memorai.client.*;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Basic usage examples for the MemorAI Java client
 */
public class BasicUsageExample {
    
    public static void main(String[] args) {
        try {
            // Initialize client
            MemorAIClient client = MemorAIClient.builder()
                .apiKey("your-api-key-here")
                .baseUrl("http://localhost:4006")
                .debug(true)
                .build();
            
            System.out.println("🧠 MemorAI Java Client - Basic Usage Examples");
            System.out.println("=============================================");
            
            // Example 1: Create a memory
            createMemoryExample(client);
            
            // Example 2: Search memories
            searchMemoriesExample(client);
            
            // Example 3: Get analytics
            getAnalyticsExample(client);
            
            // Example 4: System health check
            systemHealthExample(client);
            
            // Clean up
            client.close();
            
        } catch (Exception e) {
            System.err.println("Error running examples: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Example 1: Create a memory
     */
    public static void createMemoryExample(MemorAIClient client) {
        System.out.println("\n📝 Example 1: Creating a Memory");
        System.out.println("--------------------------------");
        
        try {
            // Create a simple memory
            CompletableFuture<Memory> future = client.memories().create(
                "Java programming is a powerful object-oriented language"
            );
            
            Memory memory = future.get();
            System.out.println("✅ Memory created successfully!");
            System.out.println("ID: " + memory.getId());
            System.out.println("Content: " + memory.getContent());
            System.out.println("Created: " + memory.getCreatedAt());
            
            // Create memory with metadata and tags
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("author", "Java Developer");
            metadata.put("language", "java");
            metadata.put("difficulty", "beginner");
            
            List<String> tags = Arrays.asList("programming", "java", "oop");
            
            CompletableFuture<Memory> future2 = client.memories().create(
                "Classes and objects are fundamental concepts in Java OOP",
                metadata,
                tags
            );
            
            Memory memory2 = future2.get();
            System.out.println("✅ Memory with metadata created!");
            System.out.println("ID: " + memory2.getId());
            System.out.println("Tags: " + memory2.getTags());
            System.out.println("Metadata: " + memory2.getMetadata());
            
        } catch (Exception e) {
            System.err.println("❌ Error creating memory: " + e.getMessage());
        }
    }
    
    /**
     * Example 2: Search memories
     */
    public static void searchMemoriesExample(MemorAIClient client) {
        System.out.println("\n🔍 Example 2: Searching Memories");
        System.out.println("--------------------------------");
        
        try {
            // Simple search
            CompletableFuture<List<SearchResult>> future = client.search().search("Java programming");
            List<SearchResult> results = future.get();
            
            System.out.println("✅ Search completed!");
            System.out.println("Found " + results.size() + " results:");
            
            for (SearchResult result : results) {
                System.out.printf("- Score: %.3f | Content: %s\n", 
                    result.getScore(), 
                    result.getMemory().getContent());
            }
            
            // Semantic search with threshold
            System.out.println("\n🔍 Semantic Search Example:");
            CompletableFuture<List<SearchResult>> semanticFuture = client.search().semanticSearch("OOP concepts", 0.8);
            List<SearchResult> semanticResults = semanticFuture.get();
            
            System.out.println("Found " + semanticResults.size() + " semantic results:");
            for (SearchResult result : semanticResults) {
                System.out.printf("- Algorithm: %s | Score: %.3f | Content: %s\n",
                    result.getAlgorithmUsed(),
                    result.getScore(),
                    result.getMemory().getContent());
            }
            
            // Advanced search with options
            SearchOptions options = new SearchOptions("Java");
            options.setLimit(5);
            options.setAlgorithm(SearchOptions.SearchAlgorithm.HYBRID);
            options.setThreshold(0.7);
            options.setTags(Arrays.asList("programming"));
            
            CompletableFuture<List<SearchResult>> advancedFuture = client.search().search(options);
            List<SearchResult> advancedResults = advancedFuture.get();
            
            System.out.println("\n🔍 Advanced Search Results:");
            System.out.println("Found " + advancedResults.size() + " advanced results");
            
        } catch (Exception e) {
            System.err.println("❌ Error searching memories: " + e.getMessage());
        }
    }
    
    /**
     * Example 3: Get analytics
     */
    public static void getAnalyticsExample(MemorAIClient client) {
        System.out.println("\n📊 Example 3: Analytics Data");
        System.out.println("----------------------------");
        
        try {
            CompletableFuture<AnalyticsData> future = client.analytics().getData();
            AnalyticsData analytics = future.get();
            
            System.out.println("✅ Analytics retrieved!");
            System.out.println("Total memories: " + analytics.getTotalMemories());
            System.out.println("Total searches: " + analytics.getTotalSearches());
            
            if (analytics.getPopularTags() != null) {
                System.out.println("Popular tags:");
                for (AnalyticsData.TagCount tagCount : analytics.getPopularTags()) {
                    System.out.printf("  - %s: %d\n", tagCount.getTag(), tagCount.getCount());
                }
            }
            
            if (analytics.getSearchPerformance() != null) {
                AnalyticsData.SearchPerformance perf = analytics.getSearchPerformance();
                System.out.printf("Search performance: %.2fms avg, %.1f%% cache hit rate\n",
                    perf.getAverageResponseTime(),
                    perf.getCacheHitRate() * 100);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error getting analytics: " + e.getMessage());
        }
    }
    
    /**
     * Example 4: System health check
     */
    public static void systemHealthExample(MemorAIClient client) {
        System.out.println("\n🏥 Example 4: System Health");
        System.out.println("---------------------------");
        
        try {
            CompletableFuture<SystemHealth> future = client.system().getHealth();
            SystemHealth health = future.get();
            
            System.out.println("✅ System health retrieved!");
            System.out.println("Status: " + health.getStatus());
            System.out.println("Version: " + health.getVersion());
            System.out.println("Uptime: " + health.getUptime() + "s");
            System.out.println("Database: " + health.getDatabaseStatus());
            System.out.printf("Memory usage: %.1f%%\n", health.getMemoryUsage() * 100);
            System.out.printf("CPU usage: %.1f%%\n", health.getCpuUsage() * 100);
            System.out.println("Active connections: " + health.getActiveConnections());
            
            // Test ping
            CompletableFuture<String> pingFuture = client.system().ping();
            String pingResult = pingFuture.get();
            System.out.println("Ping: " + pingResult);
            
        } catch (Exception e) {
            System.err.println("❌ Error checking system health: " + e.getMessage());
        }
    }
}
