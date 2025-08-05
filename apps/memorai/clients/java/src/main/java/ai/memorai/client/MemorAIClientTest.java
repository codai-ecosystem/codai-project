package ai.memorai.client;

import java.util.Arrays;
import java.util.concurrent.CompletableFuture;

/**
 * Test suite for MemorAI Java Client
 */
public class MemorAIClientTest {
    
    public static void main(String[] args) {
        System.out.println("☕ MemorAI Java Client Test Suite");
        System.out.println("==================================");
        
        MemorAIClient client = new MemorAIClient(
            new MemorAIClient.Config()
                .baseUrl("http://localhost:4006")
                .debug(true)
        );
        
        runTests(client);
    }
    
    private static void runTests(MemorAIClient client) {
        try {
            // Test 1: Health Check
            System.out.println("\n1. Health Check:");
            MemorAIClient.HealthResponse health = client.getHealth().get();
            System.out.println("✅ Health check passed: " + health.status);
            
            // Test 2: System Stats
            System.out.println("\n2. System Stats:");
            try {
                var stats = client.getSystemStats().get();
                System.out.println("✅ System stats retrieved");
            } catch (Exception e) {
                System.out.println("⚠️  System stats not available: " + e.getMessage());
            }
            
            // Test 3: Memory Creation
            System.out.println("\n3. Memory Creation:");
            MemorAIClient.Memory newMemory = new MemorAIClient.Memory(
                "Java client test memory",
                "test",
                Arrays.asList("java", "client", "test")
            );
            
            MemorAIClient.Memory createdMemory = client.createMemory(newMemory).get();
            System.out.println("✅ Memory created: " + createdMemory.id);
            
            // Test 4: Memory Retrieval
            System.out.println("\n4. Memory Retrieval:");
            MemorAIClient.Memory retrievedMemory = client.getMemory(createdMemory.id).get();
            System.out.println("✅ Memory retrieved: " + retrievedMemory.content);
            
            // Test 5: Search Test
            System.out.println("\n5. Search Test:");
            MemorAIClient.SearchResult searchResult = client.searchMemories("java").get();
            int resultCount = searchResult.memories != null ? searchResult.memories.size() : 0;
            System.out.println("✅ Search completed, found: " + resultCount + " results");
            
            // Test 6: Analytics Test
            System.out.println("\n6. Analytics Test:");
            try {
                var analytics = client.getAnalytics().get();
                System.out.println("✅ Analytics retrieved");
            } catch (Exception e) {
                System.out.println("⚠️  Analytics not available: " + e.getMessage());
            }
            
            // Test 7: Performance Metrics
            System.out.println("\n7. Performance Metrics:");
            var metrics = client.getPerformanceMetrics();
            double avgDuration = client.getAverageRequestTime();
            System.out.printf("✅ Average request time: %.2fms for %d requests%n", avgDuration, metrics.size());
            
            System.out.println("\n✅ All Java client tests completed successfully!");
            
        } catch (Exception e) {
            System.err.println("❌ Test failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
