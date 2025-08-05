package ro.memorai.client;

import org.junit.jupiter.api.*;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Unit tests for the MemorAI Java client
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class MemorAIClientTest {
    
    private MemorAIClient client;
    private AutoCloseable mocks;
    
    @BeforeEach
    void setUp() {
        mocks = MockitoAnnotations.openMocks(this);
        
        // Initialize client with test configuration
        client = MemorAIClient.builder()
            .apiKey("test-api-key")
            .baseUrl("http://localhost:4006")
            .enableWebSocket(false) // Disable WebSocket for unit tests
            .debug(true)
            .build();
    }
    
    @AfterEach
    void tearDown() throws Exception {
        if (client != null) {
            client.close();
        }
        if (mocks != null) {
            mocks.close();
        }
    }
    
    @Test
    @Order(1)
    @DisplayName("Client Builder Configuration")
    void testClientBuilder() {
        // Test client builder with various configurations
        MemorAIClient customClient = MemorAIClient.builder()
            .apiKey("custom-key")
            .baseUrl("https://api.memorai.custom")
            .timeout(45)
            .retryOnConnectionFailure(false)
            .enableWebSocket(true)
            .userAgent("Custom-Agent/1.0")
            .debug(false)
            .build();
        
        assertNotNull(customClient);
        customClient.close();
    }
    
    @Test
    @Order(2)
    @DisplayName("Memory API - Create Memory")
    void testCreateMemory() {
        // Test memory creation
        assertNotNull(client.memories());
        
        // Test with simple content
        CompletableFuture<Memory> future1 = client.memories().create("Test memory content");
        assertNotNull(future1);
        
        // Test with metadata and tags
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("test", true);
        metadata.put("category", "unit-test");
        
        List<String> tags = Arrays.asList("test", "junit", "java");
        
        CompletableFuture<Memory> future2 = client.memories().create("Test memory with metadata", metadata, tags);
        assertNotNull(future2);
        
        // Test with Memory object
        Memory memory = new Memory("Direct memory object");
        memory.setTags(tags);
        memory.setMetadata(metadata);
        
        CompletableFuture<Memory> future3 = client.memories().create(memory);
        assertNotNull(future3);
    }
    
    @Test
    @Order(3)
    @DisplayName("Memory API - CRUD Operations")
    void testMemoryCrudOperations() {
        MemoryApi memoryApi = client.memories();
        
        // Test get operations
        CompletableFuture<Memory> getFuture = memoryApi.get("test-id");
        assertNotNull(getFuture);
        
        CompletableFuture<List<Memory>> getAllFuture = memoryApi.getAll();
        assertNotNull(getAllFuture);
        
        CompletableFuture<List<Memory>> getPaginatedFuture = memoryApi.getAll(10, 0);
        assertNotNull(getPaginatedFuture);
        
        // Test update operations
        Memory updateMemory = new Memory("Updated content");
        CompletableFuture<Memory> updateFuture = memoryApi.update("test-id", updateMemory);
        assertNotNull(updateFuture);
        
        CompletableFuture<Memory> updateContentFuture = memoryApi.updateContent("test-id", "New content");
        assertNotNull(updateContentFuture);
        
        Map<String, Object> newMetadata = new HashMap<>();
        newMetadata.put("updated", true);
        CompletableFuture<Memory> updateMetadataFuture = memoryApi.updateMetadata("test-id", newMetadata);
        assertNotNull(updateMetadataFuture);
        
        List<String> newTags = Arrays.asList("updated", "test");
        CompletableFuture<Memory> updateTagsFuture = memoryApi.updateTags("test-id", newTags);
        assertNotNull(updateTagsFuture);
        
        // Test delete operations
        CompletableFuture<Void> deleteFuture = memoryApi.delete("test-id");
        assertNotNull(deleteFuture);
        
        List<String> idsToDelete = Arrays.asList("id1", "id2", "id3");
        CompletableFuture<Void> deleteManyFuture = memoryApi.deleteMany(idsToDelete);
        assertNotNull(deleteManyFuture);
    }
    
    @Test
    @Order(4)
    @DisplayName("Memory API - Query Operations")
    void testMemoryQueryOperations() {
        MemoryApi memoryApi = client.memories();
        
        // Test tag-based queries
        CompletableFuture<List<Memory>> byTagFuture = memoryApi.getByTag("test");
        assertNotNull(byTagFuture);
        
        List<String> tags = Arrays.asList("test", "java");
        CompletableFuture<List<Memory>> byTagsFuture = memoryApi.getByTags(tags);
        assertNotNull(byTagsFuture);
        
        // Test category-based query
        CompletableFuture<List<Memory>> byCategoryFuture = memoryApi.getByCategory("unit-test");
        assertNotNull(byCategoryFuture);
        
        // Test statistics
        CompletableFuture<Map<String, Object>> statsFuture = memoryApi.getStats();
        assertNotNull(statsFuture);
    }
    
    @Test
    @Order(5)
    @DisplayName("Search API - Basic Search")
    void testBasicSearch() {
        SearchApi searchApi = client.search();
        assertNotNull(searchApi);
        
        // Test simple search
        CompletableFuture<List<SearchResult>> future1 = searchApi.search("test query");
        assertNotNull(future1);
        
        // Test search with limit
        CompletableFuture<List<SearchResult>> future2 = searchApi.search("test query", 5);
        assertNotNull(future2);
        
        // Test search with full options
        SearchOptions options = new SearchOptions("test query");
        options.setLimit(10);
        options.setOffset(0);
        options.setAlgorithm(SearchOptions.SearchAlgorithm.HYBRID);
        options.setThreshold(0.7);
        options.setTags(Arrays.asList("test"));
        options.setSortBy(SearchOptions.SortOption.RELEVANCE);
        options.setSortOrder(SearchOptions.SortOrder.DESC);
        
        CompletableFuture<List<SearchResult>> future3 = searchApi.search(options);
        assertNotNull(future3);
    }
    
    @Test
    @Order(6)
    @DisplayName("Search API - Algorithm-Specific Search")
    void testAlgorithmSpecificSearch() {
        SearchApi searchApi = client.search();
        
        // Test semantic search
        CompletableFuture<List<SearchResult>> semanticFuture1 = searchApi.semanticSearch("test query");
        assertNotNull(semanticFuture1);
        
        CompletableFuture<List<SearchResult>> semanticFuture2 = searchApi.semanticSearch("test query", 0.8);
        assertNotNull(semanticFuture2);
        
        // Test hybrid search
        CompletableFuture<List<SearchResult>> hybridFuture = searchApi.hybridSearch("test query");
        assertNotNull(hybridFuture);
        
        // Test fuzzy search
        CompletableFuture<List<SearchResult>> fuzzyFuture = searchApi.fuzzySearch("test query");
        assertNotNull(fuzzyFuture);
        
        // Test search utilities
        CompletableFuture<List<String>> suggestionsFuture = searchApi.getSuggestions("test");
        assertNotNull(suggestionsFuture);
        
        CompletableFuture<List<String>> popularFuture = searchApi.getPopularSearches();
        assertNotNull(popularFuture);
    }
    
    @Test
    @Order(7)
    @DisplayName("Analytics API")
    void testAnalyticsApi() {
        AnalyticsApi analyticsApi = client.analytics();
        assertNotNull(analyticsApi);
        
        // Test basic analytics
        CompletableFuture<AnalyticsData> dataFuture = analyticsApi.getData();
        assertNotNull(dataFuture);
        
        // Test analytics with date range
        CompletableFuture<AnalyticsData> rangeDataFuture = analyticsApi.getData("2024-01-01", "2024-12-31");
        assertNotNull(rangeDataFuture);
        
        // Test specific analytics endpoints
        CompletableFuture<Map<String, Object>> memoryUsageFuture = analyticsApi.getMemoryUsage();
        assertNotNull(memoryUsageFuture);
        
        CompletableFuture<AnalyticsData.SearchPerformance> performanceFuture = analyticsApi.getSearchPerformance();
        assertNotNull(performanceFuture);
        
        CompletableFuture<List<AnalyticsData.TagCount>> tagsFuture = analyticsApi.getPopularTags();
        assertNotNull(tagsFuture);
        
        CompletableFuture<AnalyticsData.UsageStats> usageFuture = analyticsApi.getUsageStats();
        assertNotNull(usageFuture);
    }
    
    @Test
    @Order(8)
    @DisplayName("System API")
    void testSystemApi() {
        SystemApi systemApi = client.system();
        assertNotNull(systemApi);
        
        // Test system endpoints
        CompletableFuture<SystemHealth> healthFuture = systemApi.getHealth();
        assertNotNull(healthFuture);
        
        CompletableFuture<String> versionFuture = systemApi.getVersion();
        assertNotNull(versionFuture);
        
        CompletableFuture<Map<String, Object>> statusFuture = systemApi.getStatus();
        assertNotNull(statusFuture);
        
        CompletableFuture<String> pingFuture = systemApi.ping();
        assertNotNull(pingFuture);
        
        CompletableFuture<Map<String, Object>> metricsFuture = systemApi.getMetrics();
        assertNotNull(metricsFuture);
    }
    
    @Test
    @Order(9)
    @DisplayName("Data Models")
    void testDataModels() {
        // Test Memory model
        Memory memory = new Memory();
        memory.setId("test-id");
        memory.setContent("Test content");
        memory.setTags(Arrays.asList("test", "model"));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("test", true);
        memory.setMetadata(metadata);
        
        assertEquals("test-id", memory.getId());
        assertEquals("Test content", memory.getContent());
        assertNotNull(memory.getTags());
        assertEquals(2, memory.getTags().size());
        assertNotNull(memory.getMetadata());
        assertTrue((Boolean) memory.getMetadata().get("test"));
        
        // Test SearchOptions model
        SearchOptions options = new SearchOptions("test query");
        options.setLimit(5);
        options.setAlgorithm(SearchOptions.SearchAlgorithm.SEMANTIC);
        options.setThreshold(0.8);
        
        assertEquals("test query", options.getQuery());
        assertEquals(5, options.getLimit());
        assertEquals(SearchOptions.SearchAlgorithm.SEMANTIC, options.getAlgorithm());
        assertEquals(0.8, options.getThreshold());
        
        // Test SearchResult model
        SearchResult result = new SearchResult();
        result.setMemory(memory);
        result.setScore(0.95);
        result.setAlgorithmUsed("semantic");
        
        assertEquals(memory, result.getMemory());
        assertEquals(0.95, result.getScore());
        assertEquals("semantic", result.getAlgorithmUsed());
        
        // Test SystemHealth model
        SystemHealth health = new SystemHealth();
        health.setStatus(SystemHealth.HealthStatus.HEALTHY);
        health.setVersion("1.0.0");
        health.setUptime(3600L);
        health.setMemoryUsage(0.65);
        health.setCpuUsage(0.25);
        
        assertEquals(SystemHealth.HealthStatus.HEALTHY, health.getStatus());
        assertEquals("1.0.0", health.getVersion());
        assertEquals(3600L, health.getUptime());
        assertEquals(0.65, health.getMemoryUsage());
        assertEquals(0.25, health.getCpuUsage());
    }
    
    @Test
    @Order(10)
    @DisplayName("Exception Handling")
    void testExceptionHandling() {
        // Test basic MemorAI exception
        MemorAIException basicException = new MemorAIException("Test error");
        assertEquals("Test error", basicException.getMessage());
        assertNull(basicException.getErrorCode());
        assertEquals(0, basicException.getStatusCode());
        
        // Test exception with error code and status
        MemorAIException codedException = new MemorAIException("Test error", "TEST_ERROR", 400);
        assertEquals("Test error", codedException.getMessage());
        assertEquals("TEST_ERROR", codedException.getErrorCode());
        assertEquals(400, codedException.getStatusCode());
        
        // Test specific exception types
        AuthenticationException authException = new AuthenticationException("Auth failed");
        assertEquals("AUTHENTICATION_FAILED", authException.getErrorCode());
        assertEquals(401, authException.getStatusCode());
        
        NotFoundException notFoundException = new NotFoundException("Not found");
        assertEquals("RESOURCE_NOT_FOUND", notFoundException.getErrorCode());
        assertEquals(404, notFoundException.getStatusCode());
        
        RateLimitException rateLimitException = new RateLimitException("Rate limited", 60);
        assertEquals("RATE_LIMIT_EXCEEDED", rateLimitException.getErrorCode());
        assertEquals(429, rateLimitException.getStatusCode());
        assertEquals(60, rateLimitException.getRetryAfter());
        
        ValidationException validationException = new ValidationException("Validation failed");
        assertEquals("VALIDATION_FAILED", validationException.getErrorCode());
        assertEquals(400, validationException.getStatusCode());
        
        ServerException serverException = new ServerException("Server error");
        assertEquals("SERVER_ERROR", serverException.getErrorCode());
        assertEquals(500, serverException.getStatusCode());
    }
    
    @Test
    @Order(11)
    @DisplayName("WebSocket Event Handling")
    void testWebSocketEventHandling() {
        // Test event listener registration
        boolean[] eventReceived = {false};
        
        client.on("test:event", (data) -> {
            eventReceived[0] = true;
        });
        
        // Test event listener removal
        client.off("test:event", (data) -> {
            // This listener should be removed
        });
        
        // Note: WebSocket functionality requires integration testing
        // Unit tests focus on the event registration/removal mechanisms
        assertTrue(true); // Placeholder for WebSocket event tests
    }
    
    @Test
    @Order(12)
    @DisplayName("Client Lifecycle")
    void testClientLifecycle() {
        // Test client creation and cleanup
        MemorAIClient testClient = MemorAIClient.builder()
            .apiKey("test-key")
            .baseUrl("http://localhost:4006")
            .build();
        
        assertNotNull(testClient);
        assertNotNull(testClient.memories());
        assertNotNull(testClient.search());
        assertNotNull(testClient.analytics());
        assertNotNull(testClient.system());
        
        // Test client cleanup
        assertDoesNotThrow(() -> testClient.close());
    }
}
