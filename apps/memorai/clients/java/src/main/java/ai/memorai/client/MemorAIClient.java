package ai.memorai.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * MemorAI Java Client Library
 * Official Java client for the MemorAI platform
 */
public class MemorAIClient {
    
    private final String baseUrl;
    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final List<PerformanceMetric> performanceMetrics;
    private final boolean debug;
    
    // Configuration
    public static class Config {
        private String baseUrl = "http://localhost:4006";
        private String apiKey = null;
        private Duration timeout = Duration.ofSeconds(30);
        private int maxRetries = 3;
        private boolean debug = false;
        
        public Config baseUrl(String baseUrl) { this.baseUrl = baseUrl; return this; }
        public Config apiKey(String apiKey) { this.apiKey = apiKey; return this; }
        public Config timeout(Duration timeout) { this.timeout = timeout; return this; }
        public Config maxRetries(int maxRetries) { this.maxRetries = maxRetries; return this; }
        public Config debug(boolean debug) { this.debug = debug; return this; }
        
        public String getBaseUrl() { return baseUrl; }
        public String getApiKey() { return apiKey; }
        public Duration getTimeout() { return timeout; }
        public int getMaxRetries() { return maxRetries; }
        public boolean isDebug() { return debug; }
    }
    
    // Data classes
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class Memory {
        @JsonProperty("id")
        public String id;
        
        @JsonProperty("content")
        public String content;
        
        @JsonProperty("category")
        public String category;
        
        @JsonProperty("tags")
        public List<String> tags;
        
        @JsonProperty("metadata")
        public Map<String, Object> metadata;
        
        @JsonProperty("created_at")
        public String createdAt;
        
        @JsonProperty("updated_at")
        public String updatedAt;
        
        public Memory() {}
        
        public Memory(String content, String category, List<String> tags) {
            this.content = content;
            this.category = category;
            this.tags = tags;
            this.metadata = new HashMap<>();
        }
    }
    
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class SearchRequest {
        @JsonProperty("query")
        public String query;
        
        @JsonProperty("algorithm")
        public String algorithm = "semantic";
        
        @JsonProperty("limit")
        public int limit = 20;
        
        @JsonProperty("threshold")
        public Double threshold;
        
        @JsonProperty("sort_by")
        public String sortBy;
        
        public SearchRequest() {}
        
        public SearchRequest(String query) {
            this.query = query;
        }
    }
    
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class SearchResult {
        @JsonProperty("memories")
        public List<Memory> memories;
        
        @JsonProperty("total")
        public int total;
        
        @JsonProperty("query_time")
        public double queryTime;
        
        @JsonProperty("algorithm_used")
        public String algorithmUsed;
    }
    
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class ApiResponse<T> {
        @JsonProperty("success")
        public boolean success;
        
        @JsonProperty("data")
        public T data;
        
        @JsonProperty("message")
        public String message;
        
        @JsonProperty("error")
        public String error;
    }
    
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class HealthResponse {
        @JsonProperty("status")
        public String status;
        
        @JsonProperty("version")
        public String version;
        
        @JsonProperty("uptime")
        public long uptime;
        
        @JsonProperty("memory_usage")
        public Map<String, Object> memoryUsage;
    }
    
    public static class PerformanceMetric {
        private final String method;
        private final String url;
        private final long duration;
        private final int statusCode;
        private final Instant timestamp;
        
        public PerformanceMetric(String method, String url, long duration, int statusCode) {
            this.method = method;
            this.url = url;
            this.duration = duration;
            this.statusCode = statusCode;
            this.timestamp = Instant.now();
        }
        
        public String getMethod() { return method; }
        public String getUrl() { return url; }
        public long getDuration() { return duration; }
        public int getStatusCode() { return statusCode; }
        public Instant getTimestamp() { return timestamp; }
    }
    
    public MemorAIClient(Config config) {
        this.baseUrl = config.getBaseUrl();
        this.apiKey = config.getApiKey();
        this.debug = config.isDebug();
        this.performanceMetrics = Collections.synchronizedList(new ArrayList<>());
        
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(config.getTimeout())
            .build();
            
        this.objectMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
    }
    
    public MemorAIClient() {
        this(new Config());
    }
    
    // Memory operations
    public CompletableFuture<Memory> createMemory(Memory memory) {
        return makeRequest("POST", "/api/memories", memory, Memory.class);
    }
    
    public CompletableFuture<Memory> getMemory(String id) {
        return makeRequest("GET", "/api/memories/" + id, null, Memory.class);
    }
    
    public CompletableFuture<Memory> updateMemory(String id, Memory updates) {
        return makeRequest("PUT", "/api/memories/" + id, updates, Memory.class);
    }
    
    public CompletableFuture<Void> deleteMemory(String id) {
        return makeRequest("DELETE", "/api/memories/" + id, null, Void.class);
    }
    
    public CompletableFuture<List<Memory>> listMemories(int limit, int offset) {
        String url = String.format("/api/memories?limit=%d&offset=%d", limit, offset);
        return makeRequest("GET", url, null, List.class);
    }
    
    // Search operations
    public CompletableFuture<SearchResult> searchMemories(String query) {
        return searchMemories(new SearchRequest(query));
    }
    
    public CompletableFuture<SearchResult> searchMemories(SearchRequest request) {
        return makeRequest("POST", "/api/search", request, SearchResult.class);
    }
    
    public CompletableFuture<List<Memory>> findSimilarMemories(String memoryId, int limit) {
        String url = String.format("/api/memories/%s/similar?limit=%d", memoryId, limit);
        return makeRequest("GET", url, null, List.class);
    }
    
    // System operations
    public CompletableFuture<HealthResponse> getHealth() {
        return makeRequest("GET", "/api/health", null, HealthResponse.class);
    }
    
    public CompletableFuture<Map<String, Object>> getSystemStats() {
        return makeRequest("GET", "/api/stats", null, Map.class);
    }
    
    public CompletableFuture<Map<String, Object>> getAnalytics() {
        return makeRequest("GET", "/api/analytics", null, Map.class);
    }
    
    // Generic request method
    private <T> CompletableFuture<T> makeRequest(String method, String path, Object body, Class<T> responseType) {
        return CompletableFuture.supplyAsync(() -> {
            long startTime = System.currentTimeMillis();
            
            try {
                HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + path))
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("User-Agent", "MemorAI-Java-Client/1.0.0")
                    .timeout(Duration.ofSeconds(30));
                
                if (apiKey != null) {
                    requestBuilder.header("Authorization", "Bearer " + apiKey);
                }
                
                switch (method.toUpperCase()) {
                    case "GET":
                        requestBuilder.GET();
                        break;
                    case "POST":
                        String json = body != null ? objectMapper.writeValueAsString(body) : "{}";
                        requestBuilder.POST(HttpRequest.BodyPublishers.ofString(json));
                        break;
                    case "PUT":
                        String putJson = body != null ? objectMapper.writeValueAsString(body) : "{}";
                        requestBuilder.PUT(HttpRequest.BodyPublishers.ofString(putJson));
                        break;
                    case "DELETE":
                        requestBuilder.DELETE();
                        break;
                    default:
                        throw new IllegalArgumentException("Unsupported HTTP method: " + method);
                }
                
                HttpRequest request = requestBuilder.build();
                
                if (debug) {
                    System.out.println("[MemorAI] " + method + " " + path);
                }
                
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                
                long duration = System.currentTimeMillis() - startTime;
                performanceMetrics.add(new PerformanceMetric(method, path, duration, response.statusCode()));
                
                // Keep only last 100 metrics
                if (performanceMetrics.size() > 100) {
                    performanceMetrics.subList(0, performanceMetrics.size() - 100).clear();
                }
                
                if (debug) {
                    System.out.println("[MemorAI] " + response.statusCode() + " " + method + " " + path + " (" + duration + "ms)");
                }
                
                if (response.statusCode() >= 400) {
                    throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());
                }
                
                if (responseType == Void.class) {
                    return null;
                }
                
                if (response.body().isEmpty()) {
                    return null;
                }
                
                return objectMapper.readValue(response.body(), responseType);
                
            } catch (IOException | InterruptedException e) {
                throw new RuntimeException("Request failed: " + e.getMessage(), e);
            }
        });
    }
    
    // Utility methods
    public List<PerformanceMetric> getPerformanceMetrics() {
        return new ArrayList<>(performanceMetrics);
    }
    
    public void clearPerformanceMetrics() {
        performanceMetrics.clear();
    }
    
    public double getAverageRequestTime() {
        if (performanceMetrics.isEmpty()) {
            return 0.0;
        }
        return performanceMetrics.stream()
            .mapToLong(PerformanceMetric::getDuration)
            .average()
            .orElse(0.0);
    }
}
