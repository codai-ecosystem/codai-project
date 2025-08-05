package ro.memorai.client;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Memory management API
 */
public class MemoryApi {
    private final MemorAIClient client;
    
    public MemoryApi(MemorAIClient client) {
        this.client = client;
    }
    
    /**
     * Create a new memory
     */
    public CompletableFuture<Memory> create(String content) {
        Memory memory = new Memory(content);
        return client.makeRequest("POST", "/api/memories", memory, Memory.class);
    }
    
    /**
     * Create a new memory with metadata and tags
     */
    public CompletableFuture<Memory> create(String content, Map<String, Object> metadata, List<String> tags) {
        Memory memory = new Memory(content, metadata, tags);
        return client.makeRequest("POST", "/api/memories", memory, Memory.class);
    }
    
    /**
     * Create a new memory from object
     */
    public CompletableFuture<Memory> create(Memory memory) {
        return client.makeRequest("POST", "/api/memories", memory, Memory.class);
    }
    
    /**
     * Get memory by ID
     */
    public CompletableFuture<Memory> get(String id) {
        return client.makeRequest("GET", "/api/memories/" + id, null, Memory.class);
    }
    
    /**
     * Get all memories
     */
    public CompletableFuture<List<Memory>> getAll() {
        return client.makeRequest("GET", "/api/memories", null, 
            client.getObjectMapper().getTypeFactory().constructCollectionType(List.class, Memory.class));
    }
    
    /**
     * Get memories with pagination
     */
    public CompletableFuture<List<Memory>> getAll(int limit, int offset) {
        String endpoint = String.format("/api/memories?limit=%d&offset=%d", limit, offset);
        return client.makeRequest("GET", endpoint, null,
            client.getObjectMapper().getTypeFactory().constructCollectionType(List.class, Memory.class));
    }
    
    /**
     * Update memory
     */
    public CompletableFuture<Memory> update(String id, Memory memory) {
        return client.makeRequest("PUT", "/api/memories/" + id, memory, Memory.class);
    }
    
    /**
     * Update memory content
     */
    public CompletableFuture<Memory> updateContent(String id, String content) {
        Memory memory = new Memory();
        memory.setContent(content);
        return client.makeRequest("PATCH", "/api/memories/" + id, memory, Memory.class);
    }
    
    /**
     * Update memory metadata
     */
    public CompletableFuture<Memory> updateMetadata(String id, Map<String, Object> metadata) {
        Memory memory = new Memory();
        memory.setMetadata(metadata);
        return client.makeRequest("PATCH", "/api/memories/" + id, memory, Memory.class);
    }
    
    /**
     * Update memory tags
     */
    public CompletableFuture<Memory> updateTags(String id, List<String> tags) {
        Memory memory = new Memory();
        memory.setTags(tags);
        return client.makeRequest("PATCH", "/api/memories/" + id, memory, Memory.class);
    }
    
    /**
     * Delete memory
     */
    public CompletableFuture<Void> delete(String id) {
        return client.makeRequest("DELETE", "/api/memories/" + id, null, Void.class);
    }
    
    /**
     * Delete multiple memories
     */
    public CompletableFuture<Void> deleteMany(List<String> ids) {
        Map<String, List<String>> body = Map.of("ids", ids);
        return client.makeRequest("DELETE", "/api/memories", body, Void.class);
    }
    
    /**
     * Get memories by tag
     */
    public CompletableFuture<List<Memory>> getByTag(String tag) {
        String endpoint = "/api/memories?tag=" + tag;
        return client.makeRequest("GET", endpoint, null,
            client.getObjectMapper().getTypeFactory().constructCollectionType(List.class, Memory.class));
    }
    
    /**
     * Get memories by multiple tags
     */
    public CompletableFuture<List<Memory>> getByTags(List<String> tags) {
        String tagsParam = String.join(",", tags);
        String endpoint = "/api/memories?tags=" + tagsParam;
        return client.makeRequest("GET", endpoint, null,
            client.getObjectMapper().getTypeFactory().constructCollectionType(List.class, Memory.class));
    }
    
    /**
     * Get memories by category
     */
    public CompletableFuture<List<Memory>> getByCategory(String category) {
        String endpoint = "/api/memories?category=" + category;
        return client.makeRequest("GET", endpoint, null,
            client.getObjectMapper().getTypeFactory().constructCollectionType(List.class, Memory.class));
    }
    
    /**
     * Get memory statistics
     */
    public CompletableFuture<Map<String, Object>> getStats() {
        return client.makeRequest("GET", "/api/memories/stats", null,
            client.getObjectMapper().getTypeFactory().constructMapType(Map.class, String.class, Object.class));
    }
}

/**
 * Search API
 */
public class SearchApi {
    private final MemorAIClient client;
    
    public SearchApi(MemorAIClient client) {
        this.client = client;
    }
    
    /**
     * Search memories with query string
     */
    public CompletableFuture<List<SearchResult>> search(String query) {
        SearchOptions options = new SearchOptions(query);
        return search(options);
    }
    
    /**
     * Search memories with query and limit
     */
    public CompletableFuture<List<SearchResult>> search(String query, int limit) {
        SearchOptions options = new SearchOptions(query, limit);
        return search(options);
    }
    
    /**
     * Search memories with full options
     */
    public CompletableFuture<List<SearchResult>> search(SearchOptions options) {
        return client.makeRequest("POST", "/api/search", options,
            client.getObjectMapper().getTypeFactory().constructCollectionType(List.class, SearchResult.class));
    }
    
    /**
     * Semantic search using embeddings
     */
    public CompletableFuture<List<SearchResult>> semanticSearch(String query) {
        SearchOptions options = new SearchOptions(query);
        options.setAlgorithm(SearchOptions.SearchAlgorithm.SEMANTIC);
        return search(options);
    }
    
    /**
     * Semantic search with threshold
     */
    public CompletableFuture<List<SearchResult>> semanticSearch(String query, double threshold) {
        SearchOptions options = new SearchOptions(query);
        options.setAlgorithm(SearchOptions.SearchAlgorithm.SEMANTIC);
        options.setThreshold(threshold);
        return search(options);
    }
    
    /**
     * Hybrid search combining multiple algorithms
     */
    public CompletableFuture<List<SearchResult>> hybridSearch(String query) {
        SearchOptions options = new SearchOptions(query);
        options.setAlgorithm(SearchOptions.SearchAlgorithm.HYBRID);
        return search(options);
    }
    
    /**
     * Fuzzy search for approximate matching
     */
    public CompletableFuture<List<SearchResult>> fuzzySearch(String query) {
        SearchOptions options = new SearchOptions(query);
        options.setAlgorithm(SearchOptions.SearchAlgorithm.FUZZY);
        return search(options);
    }
    
    /**
     * Get search suggestions
     */
    public CompletableFuture<List<String>> getSuggestions(String partial) {
        String endpoint = "/api/search/suggestions?q=" + partial;
        return client.makeRequest("GET", endpoint, null,
            client.getObjectMapper().getTypeFactory().constructCollectionType(List.class, String.class));
    }
    
    /**
     * Get popular search terms
     */
    public CompletableFuture<List<String>> getPopularSearches() {
        return client.makeRequest("GET", "/api/search/popular", null,
            client.getObjectMapper().getTypeFactory().constructCollectionType(List.class, String.class));
    }
}

/**
 * Analytics API
 */
public class AnalyticsApi {
    private final MemorAIClient client;
    
    public AnalyticsApi(MemorAIClient client) {
        this.client = client;
    }
    
    /**
     * Get analytics data
     */
    public CompletableFuture<AnalyticsData> getData() {
        return client.makeRequest("GET", "/api/analytics", null, AnalyticsData.class);
    }
    
    /**
     * Get analytics for date range
     */
    public CompletableFuture<AnalyticsData> getData(String startDate, String endDate) {
        String endpoint = String.format("/api/analytics?start=%s&end=%s", startDate, endDate);
        return client.makeRequest("GET", endpoint, null, AnalyticsData.class);
    }
    
    /**
     * Get memory usage statistics
     */
    public CompletableFuture<Map<String, Object>> getMemoryUsage() {
        return client.makeRequest("GET", "/api/analytics/memory-usage", null,
            client.getObjectMapper().getTypeFactory().constructMapType(Map.class, String.class, Object.class));
    }
    
    /**
     * Get search performance metrics
     */
    public CompletableFuture<AnalyticsData.SearchPerformance> getSearchPerformance() {
        return client.makeRequest("GET", "/api/analytics/search-performance", null, AnalyticsData.SearchPerformance.class);
    }
    
    /**
     * Get popular tags
     */
    public CompletableFuture<List<AnalyticsData.TagCount>> getPopularTags() {
        return client.makeRequest("GET", "/api/analytics/popular-tags", null,
            client.getObjectMapper().getTypeFactory().constructCollectionType(List.class, AnalyticsData.TagCount.class));
    }
    
    /**
     * Get usage statistics
     */
    public CompletableFuture<AnalyticsData.UsageStats> getUsageStats() {
        return client.makeRequest("GET", "/api/analytics/usage-stats", null, AnalyticsData.UsageStats.class);
    }
}

/**
 * System API
 */
public class SystemApi {
    private final MemorAIClient client;
    
    public SystemApi(MemorAIClient client) {
        this.client = client;
    }
    
    /**
     * Get system health
     */
    public CompletableFuture<SystemHealth> getHealth() {
        return client.makeRequest("GET", "/api/health", null, SystemHealth.class);
    }
    
    /**
     * Get system version
     */
    public CompletableFuture<String> getVersion() {
        return client.makeRequest("GET", "/api/version", null, String.class);
    }
    
    /**
     * Get system status
     */
    public CompletableFuture<Map<String, Object>> getStatus() {
        return client.makeRequest("GET", "/api/status", null,
            client.getObjectMapper().getTypeFactory().constructMapType(Map.class, String.class, Object.class));
    }
    
    /**
     * Ping the system
     */
    public CompletableFuture<String> ping() {
        return client.makeRequest("GET", "/api/ping", null, String.class);
    }
    
    /**
     * Get system metrics
     */
    public CompletableFuture<Map<String, Object>> getMetrics() {
        return client.makeRequest("GET", "/api/metrics", null,
            client.getObjectMapper().getTypeFactory().constructMapType(Map.class, String.class, Object.class));
    }
}
