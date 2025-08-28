package com.memorai.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import okhttp3.*;
import okhttp3.logging.HttpLoggingInterceptor;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Official Java client library for the MemorAI MCP Server.
 * 
 * Provides a comprehensive, type-safe interface for all memory operations
 * with both synchronous and asynchronous support.
 * 
 * @author MemorAI Team
 * @version 1.5.0
 */
public class MemorAIClient {
    
    private static final String DEFAULT_BASE_URL = "https://api.memorai.com/v1";
    private static final String USER_AGENT = "MemorAI-Java-Client/1.5.0";
    
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final boolean debug;
    
    // ========================================================================
    // Configuration Classes
    // ========================================================================
    
    public static class Config {
        private String apiKey;
        private String baseUrl = DEFAULT_BASE_URL;
        private int timeoutSeconds = 30;
        private int maxRetries = 3;
        private boolean debug = false;
        private Map<String, String> headers = new HashMap<>();
        
        public Config(String apiKey) {
            this.apiKey = apiKey;
        }
        
        // Builder-style setters
        public Config baseUrl(String baseUrl) { this.baseUrl = baseUrl; return this; }
        public Config timeout(int timeoutSeconds) { this.timeoutSeconds = timeoutSeconds; return this; }
        public Config maxRetries(int maxRetries) { this.maxRetries = maxRetries; return this; }
        public Config debug(boolean debug) { this.debug = debug; return this; }
        public Config header(String key, String value) { this.headers.put(key, value); return this; }
        
        // Getters
        public String getApiKey() { return apiKey; }
        public String getBaseUrl() { return baseUrl; }
        public int getTimeoutSeconds() { return timeoutSeconds; }
        public int getMaxRetries() { return maxRetries; }
        public boolean isDebug() { return debug; }
        public Map<String, String> getHeaders() { return headers; }
    }
    
    // ========================================================================
    // Data Classes
    // ========================================================================
    
    public static class MemoryMetadata {
        @JsonProperty("importance")
        private Integer importance;
        
        @JsonProperty("tags")
        private List<String> tags;
        
        @JsonProperty("project")
        private String project;
        
        @JsonProperty("session")
        private String session;
        
        @JsonProperty("entityType")
        private String entityType;
        
        @JsonProperty("priority")
        private String priority;
        
        // Constructors
        public MemoryMetadata() {}
        
        public MemoryMetadata(Integer importance, List<String> tags, String project, 
                             String session, String entityType, String priority) {
            this.importance = importance;
            this.tags = tags;
            this.project = project;
            this.session = session;
            this.entityType = entityType;
            this.priority = priority;
        }
        
        // Builder-style setters
        public MemoryMetadata importance(Integer importance) { this.importance = importance; return this; }
        public MemoryMetadata tags(List<String> tags) { this.tags = tags; return this; }
        public MemoryMetadata project(String project) { this.project = project; return this; }
        public MemoryMetadata session(String session) { this.session = session; return this; }
        public MemoryMetadata entityType(String entityType) { this.entityType = entityType; return this; }
        public MemoryMetadata priority(String priority) { this.priority = priority; return this; }
        
        // Getters
        public Integer getImportance() { return importance; }
        public List<String> getTags() { return tags; }
        public String getProject() { return project; }
        public String getSession() { return session; }
        public String getEntityType() { return entityType; }
        public String getPriority() { return priority; }
    }
    
    public static class Memory {
        @JsonProperty("memoryId")
        private String memoryId;
        
        @JsonProperty("structuredKey")
        private String structuredKey;
        
        @JsonProperty("content")
        private String content;
        
        @JsonProperty("metadata")
        private MemoryMetadata metadata;
        
        @JsonProperty("relevanceScore")
        private Double relevanceScore;
        
        @JsonProperty("timestamp")
        private String timestamp;
        
        // Constructors
        public Memory() {}
        
        // Getters
        public String getMemoryId() { return memoryId; }
        public String getStructuredKey() { return structuredKey; }
        public String getContent() { return content; }
        public MemoryMetadata getMetadata() { return metadata; }
        public Double getRelevanceScore() { return relevanceScore; }
        public String getTimestamp() { return timestamp; }
        
        // Setters
        public void setMemoryId(String memoryId) { this.memoryId = memoryId; }
        public void setStructuredKey(String structuredKey) { this.structuredKey = structuredKey; }
        public void setContent(String content) { this.content = content; }
        public void setMetadata(MemoryMetadata metadata) { this.metadata = metadata; }
        public void setRelevanceScore(Double relevanceScore) { this.relevanceScore = relevanceScore; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }
    
    public static class RememberRequest {
        @JsonProperty("agentId")
        private String agentId;
        
        @JsonProperty("content")
        private String content;
        
        @JsonProperty("metadata")
        private MemoryMetadata metadata;
        
        public RememberRequest(String agentId, String content, MemoryMetadata metadata) {
            this.agentId = agentId;
            this.content = content;
            this.metadata = metadata;
        }
        
        // Getters
        public String getAgentId() { return agentId; }
        public String getContent() { return content; }
        public MemoryMetadata getMetadata() { return metadata; }
    }
    
    public static class RememberResponse {
        @JsonProperty("success")
        private boolean success;
        
        @JsonProperty("memoryId")
        private String memoryId;
        
        @JsonProperty("structuredKey")
        private String structuredKey;
        
        @JsonProperty("importance")
        private int importance;
        
        @JsonProperty("embeddings_generated")
        private boolean embeddingsGenerated;
        
        @JsonProperty("entities_extracted")
        private List<String> entitiesExtracted;
        
        @JsonProperty("timestamp")
        private String timestamp;
        
        // Getters
        public boolean isSuccess() { return success; }
        public String getMemoryId() { return memoryId; }
        public String getStructuredKey() { return structuredKey; }
        public int getImportance() { return importance; }
        public boolean isEmbeddingsGenerated() { return embeddingsGenerated; }
        public List<String> getEntitiesExtracted() { return entitiesExtracted; }
        public String getTimestamp() { return timestamp; }
    }
    
    public static class RecallRequest {
        private String agentId;
        private String query;
        private Integer limit;
        private Integer minImportance;
        private String project;
        private String session;
        private Boolean includeOtherAgents;
        
        public RecallRequest(String agentId, String query) {
            this.agentId = agentId;
            this.query = query;
        }
        
        // Builder-style setters
        public RecallRequest limit(Integer limit) { this.limit = limit; return this; }
        public RecallRequest minImportance(Integer minImportance) { this.minImportance = minImportance; return this; }
        public RecallRequest project(String project) { this.project = project; return this; }
        public RecallRequest session(String session) { this.session = session; return this; }
        public RecallRequest includeOtherAgents(Boolean includeOtherAgents) { this.includeOtherAgents = includeOtherAgents; return this; }
        
        // Getters
        public String getAgentId() { return agentId; }
        public String getQuery() { return query; }
        public Integer getLimit() { return limit; }
        public Integer getMinImportance() { return minImportance; }
        public String getProject() { return project; }
        public String getSession() { return session; }
        public Boolean getIncludeOtherAgents() { return includeOtherAgents; }
    }
    
    public static class RecallResponse {
        @JsonProperty("success")
        private boolean success;
        
        @JsonProperty("memories")
        private List<Memory> memories;
        
        @JsonProperty("totalResults")
        private int totalResults;
        
        @JsonProperty("searchTime")
        private double searchTime;
        
        @JsonProperty("query")
        private String query;
        
        // Getters
        public boolean isSuccess() { return success; }
        public List<Memory> getMemories() { return memories; }
        public int getTotalResults() { return totalResults; }
        public double getSearchTime() { return searchTime; }
        public String getQuery() { return query; }
    }
    
    public static class HealthResponse {
        @JsonProperty("status")
        private String status;
        
        @JsonProperty("service")
        private String service;
        
        @JsonProperty("version")
        private String version;
        
        @JsonProperty("uptime")
        private long uptime;
        
        @JsonProperty("timestamp")
        private String timestamp;
        
        @JsonProperty("dependencies")
        private Map<String, String> dependencies;
        
        // Getters
        public String getStatus() { return status; }
        public String getService() { return service; }
        public String getVersion() { return version; }
        public long getUptime() { return uptime; }
        public String getTimestamp() { return timestamp; }
        public Map<String, String> getDependencies() { return dependencies; }
    }
    
    public static class ContextResponse {
        @JsonProperty("agentId")
        private String agentId;
        
        @JsonProperty("contextSize")
        private int contextSize;
        
        @JsonProperty("memories")
        private List<Memory> memories;
        
        @JsonProperty("summary")
        private String summary;
        
        @JsonProperty("timestamp")
        private String timestamp;
        
        // Getters
        public String getAgentId() { return agentId; }
        public int getContextSize() { return contextSize; }
        public List<Memory> getMemories() { return memories; }
        public String getSummary() { return summary; }
        public String getTimestamp() { return timestamp; }
    }
    
    // ========================================================================
    // Exception Classes
    // ========================================================================
    
    public static class MemorAIException extends RuntimeException {
        private final String code;
        private final int statusCode;
        private final String requestId;
        private final Object details;
        
        public MemorAIException(String code, String message, int statusCode, String requestId, Object details) {
            super(message);
            this.code = code;
            this.statusCode = statusCode;
            this.requestId = requestId;
            this.details = details;
        }
        
        public String getCode() { return code; }
        public int getStatusCode() { return statusCode; }
        public String getRequestId() { return requestId; }
        public Object getDetails() { return details; }
    }
    
    // ========================================================================
    // Constructor and Initialization
    // ========================================================================
    
    public MemorAIClient(Config config) {
        this.baseUrl = config.getBaseUrl();
        this.debug = config.isDebug();
        this.objectMapper = createObjectMapper();
        
        OkHttpClient.Builder httpClientBuilder = new OkHttpClient.Builder()
            .connectTimeout(config.getTimeoutSeconds(), TimeUnit.SECONDS)
            .writeTimeout(config.getTimeoutSeconds(), TimeUnit.SECONDS)
            .readTimeout(config.getTimeoutSeconds(), TimeUnit.SECONDS)
            .addInterceptor(createAuthInterceptor(config.getApiKey()))
            .addInterceptor(createUserAgentInterceptor())
            .addInterceptor(createCustomHeadersInterceptor(config.getHeaders()))
            .retryOnConnectionFailure(true);
        
        if (config.isDebug()) {
            HttpLoggingInterceptor loggingInterceptor = new HttpLoggingInterceptor();
            loggingInterceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
            httpClientBuilder.addInterceptor(loggingInterceptor);
        }
        
        this.httpClient = httpClientBuilder.build();
    }
    
    private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
    
    private Interceptor createAuthInterceptor(String apiKey) {
        return chain -> {
            Request original = chain.request();
            Request.Builder requestBuilder = original.newBuilder()
                .header("Authorization", "Bearer " + apiKey);
            return chain.proceed(requestBuilder.build());
        };
    }
    
    private Interceptor createUserAgentInterceptor() {
        return chain -> {
            Request original = chain.request();
            Request.Builder requestBuilder = original.newBuilder()
                .header("User-Agent", USER_AGENT);
            return chain.proceed(requestBuilder.build());
        };
    }
    
    private Interceptor createCustomHeadersInterceptor(Map<String, String> headers) {
        return chain -> {
            Request original = chain.request();
            Request.Builder requestBuilder = original.newBuilder();
            
            for (Map.Entry<String, String> header : headers.entrySet()) {
                requestBuilder.header(header.getKey(), header.getValue());
            }
            
            return chain.proceed(requestBuilder.build());
        };
    }
    
    // ========================================================================
    // HTTP Request Helpers
    // ========================================================================
    
    private <T> T makeRequest(String method, String endpoint, Object requestBody, 
                             TypeReference<T> responseType) throws MemorAIException {
        try {
            String url = baseUrl + endpoint;
            Request.Builder requestBuilder = new Request.Builder().url(url);
            
            if ("GET".equals(method)) {
                requestBuilder.get();
            } else if ("POST".equals(method)) {
                RequestBody body = RequestBody.create(
                    objectMapper.writeValueAsString(requestBody), 
                    MediaType.get("application/json")
                );
                requestBuilder.post(body);
            } else if ("DELETE".equals(method)) {
                requestBuilder.delete();
            }
            
            Response response = httpClient.newCall(requestBuilder.build()).execute();
            
            if (!response.isSuccessful()) {
                handleErrorResponse(response);
            }
            
            String responseBody = response.body().string();
            return objectMapper.readValue(responseBody, responseType);
            
        } catch (IOException e) {
            throw new MemorAIException("REQUEST_ERROR", e.getMessage(), -1, null, null);
        }
    }
    
    private <T> T makeGetRequest(String endpoint, Map<String, String> params, 
                                TypeReference<T> responseType) throws MemorAIException {
        try {
            HttpUrl.Builder urlBuilder = HttpUrl.parse(baseUrl + endpoint).newBuilder();
            
            if (params != null) {
                for (Map.Entry<String, String> param : params.entrySet()) {
                    if (param.getValue() != null) {
                        urlBuilder.addQueryParameter(param.getKey(), param.getValue());
                    }
                }
            }
            
            Request request = new Request.Builder()
                .url(urlBuilder.build())
                .get()
                .build();
            
            Response response = httpClient.newCall(request).execute();
            
            if (!response.isSuccessful()) {
                handleErrorResponse(response);
            }
            
            String responseBody = response.body().string();
            return objectMapper.readValue(responseBody, responseType);
            
        } catch (IOException e) {
            throw new MemorAIException("REQUEST_ERROR", e.getMessage(), -1, null, null);
        }
    }
    
    private void handleErrorResponse(Response response) throws MemorAIException, IOException {
        String errorBody = response.body() != null ? response.body().string() : "";
        
        try {
            Map<String, Object> errorData = objectMapper.readValue(errorBody, 
                new TypeReference<Map<String, Object>>() {});
            
            if (errorData.containsKey("error")) {
                Map<String, Object> errorInfo = (Map<String, Object>) errorData.get("error");
                throw new MemorAIException(
                    (String) errorInfo.get("code"),
                    (String) errorInfo.get("message"),
                    response.code(),
                    (String) errorInfo.get("request_id"),
                    errorInfo.get("details")
                );
            }
        } catch (IOException ignored) {
            // Fallback to generic error
        }
        
        throw new MemorAIException(
            "HTTP_ERROR", 
            "HTTP " + response.code() + ": " + response.message(),
            response.code(),
            null,
            null
        );
    }
    
    // ========================================================================
    // Public API Methods
    // ========================================================================
    
    /**
     * Check the health status of the MemorAI MCP Server.
     */
    public HealthResponse healthCheck() throws MemorAIException {
        return makeGetRequest("/health", null, new TypeReference<HealthResponse>() {});
    }
    
    /**
     * Store a new memory with content and metadata.
     */
    public RememberResponse rememberMemory(RememberRequest request) throws MemorAIException {
        return makeRequest("POST", "/api/memory/remember", request, 
                         new TypeReference<RememberResponse>() {});
    }
    
    /**
     * Search and retrieve memories using advanced hybrid search.
     */
    public RecallResponse recallMemories(RecallRequest request) throws MemorAIException {
        Map<String, String> params = new HashMap<>();
        params.put("agentId", request.getAgentId());
        params.put("query", request.getQuery());
        
        if (request.getLimit() != null) {
            params.put("limit", request.getLimit().toString());
        }
        if (request.getMinImportance() != null) {
            params.put("minImportance", request.getMinImportance().toString());
        }
        if (request.getProject() != null) {
            params.put("project", request.getProject());
        }
        if (request.getSession() != null) {
            params.put("session", request.getSession());
        }
        if (request.getIncludeOtherAgents() != null) {
            params.put("includeOtherAgents", request.getIncludeOtherAgents().toString());
        }
        
        return makeGetRequest("/api/memory/recall", params, new TypeReference<RecallResponse>() {});
    }
    
    /**
     * Get recent context for an agent.
     */
    public ContextResponse getContext(String agentId, int contextSize) throws MemorAIException {
        Map<String, String> params = new HashMap<>();
        params.put("agentId", agentId);
        params.put("contextSize", String.valueOf(contextSize));
        
        return makeGetRequest("/api/memory/context", params, new TypeReference<ContextResponse>() {});
    }
    
    /**
     * Delete a memory by structured key.
     */
    public boolean forgetMemory(String agentId, String structuredKey) throws MemorAIException {
        Map<String, String> params = new HashMap<>();
        params.put("agentId", agentId);
        params.put("structuredKey", structuredKey);
        
        Map<String, Boolean> response = makeGetRequest("/api/memory/forget", params, 
            new TypeReference<Map<String, Boolean>>() {});
        return response.get("success");
    }
    
    // ========================================================================
    // Utility Methods
    // ========================================================================
    
    /**
     * Batch store multiple memories.
     */
    public List<RememberResponse> batchRememberMemories(String agentId, 
                                                       List<Map<String, Object>> memories) {
        List<RememberResponse> results = new ArrayList<>();
        
        for (Map<String, Object> memory : memories) {
            try {
                String content = (String) memory.get("content");
                Map<String, Object> metadataMap = (Map<String, Object>) memory.get("metadata");
                
                MemoryMetadata metadata = new MemoryMetadata();
                if (metadataMap != null) {
                    if (metadataMap.containsKey("importance")) {
                        metadata.importance((Integer) metadataMap.get("importance"));
                    }
                    if (metadataMap.containsKey("tags")) {
                        metadata.tags((List<String>) metadataMap.get("tags"));
                    }
                    if (metadataMap.containsKey("project")) {
                        metadata.project((String) metadataMap.get("project"));
                    }
                    if (metadataMap.containsKey("session")) {
                        metadata.session((String) metadataMap.get("session"));
                    }
                    if (metadataMap.containsKey("entityType")) {
                        metadata.entityType((String) metadataMap.get("entityType"));
                    }
                }
                
                RememberRequest request = new RememberRequest(agentId, content, metadata);
                RememberResponse response = rememberMemory(request);
                results.add(response);
                
            } catch (Exception e) {
                System.err.println("Failed to store memory: " + e.getMessage());
                // Could add null or error response to results if needed
            }
        }
        
        return results;
    }
    
    // ========================================================================
    // Asynchronous Methods
    // ========================================================================
    
    /**
     * Asynchronous version of healthCheck().
     */
    public CompletableFuture<HealthResponse> healthCheckAsync() {
        return CompletableFuture.supplyAsync(() -> healthCheck());
    }
    
    /**
     * Asynchronous version of rememberMemory().
     */
    public CompletableFuture<RememberResponse> rememberMemoryAsync(RememberRequest request) {
        return CompletableFuture.supplyAsync(() -> rememberMemory(request));
    }
    
    /**
     * Asynchronous version of recallMemories().
     */
    public CompletableFuture<RecallResponse> recallMemoriesAsync(RecallRequest request) {
        return CompletableFuture.supplyAsync(() -> recallMemories(request));
    }
    
    /**
     * Asynchronous version of getContext().
     */
    public CompletableFuture<ContextResponse> getContextAsync(String agentId, int contextSize) {
        return CompletableFuture.supplyAsync(() -> getContext(agentId, contextSize));
    }
    
    // ========================================================================
    // Resource Management
    // ========================================================================
    
    /**
     * Close the HTTP client and release resources.
     */
    public void close() {
        httpClient.dispatcher().executorService().shutdown();
        httpClient.connectionPool().evictAll();
    }
    
    // ========================================================================
    // Builder and Factory Methods
    // ========================================================================
    
    /**
     * Create a new MemorAI client with the given API key.
     */
    public static MemorAIClient create(String apiKey) {
        return new MemorAIClient(new Config(apiKey));
    }
    
    /**
     * Create a new MemorAI client with custom configuration.
     */
    public static MemorAIClient create(Config config) {
        return new MemorAIClient(config);
    }
}