package ro.memorai.client.examples;

import ro.memorai.client.*;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Advanced usage examples demonstrating sophisticated MemorAI features
 */
public class AdvancedUsageExample {
    
    public static void main(String[] args) {
        try {
            // Initialize client with advanced configuration
            MemorAIClient client = MemorAIClient.builder()
                .apiKey("your-api-key-here")
                .baseUrl("http://localhost:4006")
                .timeout(60)
                .enableWebSocket(true)
                .debug(true)
                .build();
            
            System.out.println("🚀 MemorAI Java Client - Advanced Usage Examples");
            System.out.println("=================================================");
            
            // Example 1: Batch memory operations
            batchOperationsExample(client);
            
            // Example 2: Advanced search with filtering
            advancedSearchExample(client);
            
            // Example 3: Real-time WebSocket events
            webSocketExample(client);
            
            // Example 4: Performance monitoring
            performanceMonitoringExample(client);
            
            // Example 5: Error handling patterns
            errorHandlingExample(client);
            
            // Clean up
            client.close();
            
        } catch (Exception e) {
            System.err.println("Error running advanced examples: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Example 1: Batch operations for efficient processing
     */
    public static void batchOperationsExample(MemorAIClient client) {
        System.out.println("\n📦 Example 1: Batch Operations");
        System.out.println("------------------------------");
        
        try {
            // Create multiple memories concurrently
            List<CompletableFuture<Memory>> futures = new ArrayList<>();
            String[] contents = {
                "Spring Boot is a Java framework for building web applications",
                "Hibernate is an ORM framework for Java applications",
                "Maven is a build automation tool for Java projects",
                "JUnit is a testing framework for Java applications",
                "Docker containerizes Java applications for deployment"
            };
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("category", "java-frameworks");
            metadata.put("source", "advanced-example");
            
            List<String> tags = Arrays.asList("java", "framework", "development");
            
            for (String content : contents) {
                CompletableFuture<Memory> future = client.memories().create(content, metadata, tags);
                futures.add(future);
            }
            
            // Wait for all memories to be created
            List<Memory> memories = new ArrayList<>();
            for (CompletableFuture<Memory> future : futures) {
                memories.add(future.get());
            }
            
            System.out.println("✅ Created " + memories.size() + " memories in batch");
            
            // Batch search with different algorithms
            String[] queries = {"Spring framework", "testing tools", "deployment solutions"};
            SearchOptions.SearchAlgorithm[] algorithms = {
                SearchOptions.SearchAlgorithm.SEMANTIC,
                SearchOptions.SearchAlgorithm.HYBRID,
                SearchOptions.SearchAlgorithm.FUZZY
            };
            
            for (int i = 0; i < queries.length; i++) {
                SearchOptions options = new SearchOptions(queries[i]);
                options.setAlgorithm(algorithms[i]);
                options.setLimit(3);
                
                CompletableFuture<List<SearchResult>> searchFuture = client.search().search(options);
                List<SearchResult> results = searchFuture.get();
                
                System.out.printf("🔍 %s search for '%s': %d results\n", 
                    algorithms[i], queries[i], results.size());
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error in batch operations: " + e.getMessage());
        }
    }
    
    /**
     * Example 2: Advanced search with complex filtering
     */
    public static void advancedSearchExample(MemorAIClient client) {
        System.out.println("\n🔬 Example 2: Advanced Search");
        System.out.println("-----------------------------");
        
        try {
            // Complex search with metadata filters
            SearchOptions options = new SearchOptions("Java framework");
            options.setLimit(10);
            options.setAlgorithm(SearchOptions.SearchAlgorithm.HYBRID);
            options.setThreshold(0.6);
            options.setTags(Arrays.asList("java", "framework"));
            
            Map<String, Object> metadataFilters = new HashMap<>();
            metadataFilters.put("category", "java-frameworks");
            metadataFilters.put("source", "advanced-example");
            options.setMetadataFilters(metadataFilters);
            
            options.setSortBy(SearchOptions.SortOption.RELEVANCE);
            options.setSortOrder(SearchOptions.SortOrder.DESC);
            options.setIncludeEmbeddings(false);
            
            CompletableFuture<List<SearchResult>> future = client.search().search(options);
            List<SearchResult> results = future.get();
            
            System.out.println("✅ Advanced search completed!");
            System.out.println("Results with complex filtering:");
            
            for (SearchResult result : results) {
                Memory memory = result.getMemory();
                System.out.printf("- [%.3f] %s\n", result.getScore(), memory.getContent());
                System.out.printf("  Tags: %s\n", memory.getTags());
                System.out.printf("  Category: %s\n", memory.getMetadata().get("category"));
                System.out.printf("  Algorithm: %s\n", result.getAlgorithmUsed());
                System.out.println();
            }
            
            // Get search suggestions
            CompletableFuture<List<String>> suggestionsFuture = client.search().getSuggestions("Spr");
            List<String> suggestions = suggestionsFuture.get();
            System.out.println("Search suggestions for 'Spr': " + suggestions);
            
            // Get popular searches
            CompletableFuture<List<String>> popularFuture = client.search().getPopularSearches();
            List<String> popular = popularFuture.get();
            System.out.println("Popular searches: " + popular);
            
        } catch (Exception e) {
            System.err.println("❌ Error in advanced search: " + e.getMessage());
        }
    }
    
    /**
     * Example 3: Real-time WebSocket events
     */
    public static void webSocketExample(MemorAIClient client) {
        System.out.println("\n🔄 Example 3: WebSocket Events");
        System.out.println("------------------------------");
        
        try {
            // Register event listeners
            client.on("memory:created", (data) -> {
                System.out.println("📝 Memory created event received: " + data);
            });
            
            client.on("memory:updated", (data) -> {
                System.out.println("✏️  Memory updated event received: " + data);
            });
            
            client.on("search:performed", (data) -> {
                System.out.println("🔍 Search performed event received: " + data);
            });
            
            System.out.println("✅ WebSocket event listeners registered");
            System.out.println("Creating a memory to trigger events...");
            
            // Create a memory to trigger WebSocket events
            CompletableFuture<Memory> future = client.memories().create(
                "WebSocket integration enables real-time updates in MemorAI"
            );
            Memory memory = future.get();
            System.out.println("Memory created: " + memory.getId());
            
            // Update the memory to trigger update event
            Thread.sleep(1000); // Wait a bit for the creation event
            CompletableFuture<Memory> updateFuture = client.memories().updateContent(
                memory.getId(), 
                "WebSocket integration provides real-time synchronization across clients"
            );
            updateFuture.get();
            System.out.println("Memory updated");
            
            // Perform a search to trigger search event
            Thread.sleep(1000); // Wait a bit for the update event
            CompletableFuture<List<SearchResult>> searchFuture = client.search().search("WebSocket real-time");
            searchFuture.get();
            System.out.println("Search performed");
            
            // Wait for events to be processed
            Thread.sleep(2000);
            
        } catch (Exception e) {
            System.err.println("❌ Error in WebSocket example: " + e.getMessage());
        }
    }
    
    /**
     * Example 4: Performance monitoring and optimization
     */
    public static void performanceMonitoringExample(MemorAIClient client) {
        System.out.println("\n⚡ Example 4: Performance Monitoring");
        System.out.println("------------------------------------");
        
        try {
            // Monitor search performance
            long startTime = System.currentTimeMillis();
            
            CompletableFuture<AnalyticsData.SearchPerformance> perfFuture = client.analytics().getSearchPerformance();
            AnalyticsData.SearchPerformance performance = perfFuture.get();
            
            long endTime = System.currentTimeMillis();
            long requestTime = endTime - startTime;
            
            System.out.println("✅ Performance metrics retrieved in " + requestTime + "ms");
            System.out.printf("Average response time: %.2fms\n", performance.getAverageResponseTime());
            System.out.printf("Cache hit rate: %.1f%%\n", performance.getCacheHitRate() * 100);
            System.out.println("Total queries: " + performance.getTotalQueries());
            
            // Test concurrent operations for performance
            System.out.println("\n🔄 Testing concurrent operations...");
            ExecutorService executor = Executors.newFixedThreadPool(10);
            List<CompletableFuture<List<SearchResult>>> concurrentSearches = new ArrayList<>();
            
            startTime = System.currentTimeMillis();
            
            for (int i = 0; i < 20; i++) {
                CompletableFuture<List<SearchResult>> future = CompletableFuture.supplyAsync(() -> {
                    try {
                        return client.search().search("Java framework concurrent test").get();
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }, executor);
                concurrentSearches.add(future);
            }
            
            // Wait for all concurrent searches to complete
            CompletableFuture.allOf(concurrentSearches.toArray(new CompletableFuture[0])).get();
            
            endTime = System.currentTimeMillis();
            long totalTime = endTime - startTime;
            
            System.out.println("✅ 20 concurrent searches completed in " + totalTime + "ms");
            System.out.printf("Average per search: %.2fms\n", (double) totalTime / 20);
            
            executor.shutdown();
            executor.awaitTermination(5, TimeUnit.SECONDS);
            
        } catch (Exception e) {
            System.err.println("❌ Error in performance monitoring: " + e.getMessage());
        }
    }
    
    /**
     * Example 5: Error handling patterns
     */
    public static void errorHandlingExample(MemorAIClient client) {
        System.out.println("\n🛡️  Example 5: Error Handling");
        System.out.println("-----------------------------");
        
        try {
            // Test invalid memory ID
            System.out.println("Testing invalid memory ID...");
            try {
                CompletableFuture<Memory> future = client.memories().get("invalid-id-12345");
                Memory memory = future.get();
                System.out.println("Unexpected success: " + memory);
            } catch (Exception e) {
                System.out.println("✅ Correctly handled invalid ID error: " + e.getMessage());
            }
            
            // Test invalid search parameters
            System.out.println("\nTesting invalid search parameters...");
            try {
                SearchOptions options = new SearchOptions("");
                options.setLimit(-1); // Invalid limit
                options.setThreshold(2.0); // Invalid threshold
                
                CompletableFuture<List<SearchResult>> future = client.search().search(options);
                List<SearchResult> results = future.get();
                System.out.println("Unexpected success: " + results.size() + " results");
            } catch (Exception e) {
                System.out.println("✅ Correctly handled invalid search parameters: " + e.getMessage());
            }
            
            // Test network timeout simulation
            System.out.println("\nTesting robust error recovery...");
            try {
                // This might fail due to network issues, but client should handle gracefully
                CompletableFuture<SystemHealth> healthFuture = client.system().getHealth();
                SystemHealth health = healthFuture.get();
                System.out.println("✅ System health check successful: " + health.getStatus());
            } catch (Exception e) {
                System.out.println("⚠️  Network error handled gracefully: " + e.getMessage());
            }
            
            System.out.println("\n✅ Error handling examples completed");
            
        } catch (Exception e) {
            System.err.println("❌ Error in error handling example: " + e.getMessage());
        }
    }
}
