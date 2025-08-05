package ro.memorai.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Core data models for the MemorAI Java client
 */

/**
 * Memory entity representing a stored memory
 */
public class Memory {
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("content")
    private String content;
    
    @JsonProperty("embedding")
    private List<Double> embedding;
    
    @JsonProperty("metadata")
    private Map<String, Object> metadata;
    
    @JsonProperty("tags")
    private List<String> tags;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    
    @JsonProperty("accessed_at")
    private LocalDateTime accessedAt;
    
    @JsonProperty("access_count")
    private Integer accessCount = 0;
    
    @JsonProperty("importance_score")
    private Double importanceScore = 0.0;
    
    @JsonProperty("category")
    private String category;
    
    // Constructors
    public Memory() {}
    
    public Memory(String content) {
        this.content = content;
    }
    
    public Memory(String content, Map<String, Object> metadata, List<String> tags) {
        this.content = content;
        this.metadata = metadata;
        this.tags = tags;
    }
    
    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public List<Double> getEmbedding() { return embedding; }
    public void setEmbedding(List<Double> embedding) { this.embedding = embedding; }
    
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getAccessedAt() { return accessedAt; }
    public void setAccessedAt(LocalDateTime accessedAt) { this.accessedAt = accessedAt; }
    
    public Integer getAccessCount() { return accessCount; }
    public void setAccessCount(Integer accessCount) { this.accessCount = accessCount; }
    
    public Double getImportanceScore() { return importanceScore; }
    public void setImportanceScore(Double importanceScore) { this.importanceScore = importanceScore; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}

/**
 * Search options for memory queries
 */
public class SearchOptions {
    @JsonProperty("query")
    private String query;
    
    @JsonProperty("limit")
    private Integer limit = 10;
    
    @JsonProperty("offset")
    private Integer offset = 0;
    
    @JsonProperty("algorithm")
    private SearchAlgorithm algorithm = SearchAlgorithm.HYBRID;
    
    @JsonProperty("threshold")
    private Double threshold = 0.7;
    
    @JsonProperty("tags")
    private List<String> tags;
    
    @JsonProperty("metadata_filters")
    private Map<String, Object> metadataFilters;
    
    @JsonProperty("include_embeddings")
    private Boolean includeEmbeddings = false;
    
    @JsonProperty("sort_by")
    private SortOption sortBy = SortOption.RELEVANCE;
    
    @JsonProperty("sort_order")
    private SortOrder sortOrder = SortOrder.DESC;
    
    public enum SearchAlgorithm {
        @JsonProperty("exact") EXACT,
        @JsonProperty("semantic") SEMANTIC,
        @JsonProperty("hybrid") HYBRID,
        @JsonProperty("fuzzy") FUZZY
    }
    
    public enum SortOption {
        @JsonProperty("relevance") RELEVANCE,
        @JsonProperty("created_at") CREATED_AT,
        @JsonProperty("updated_at") UPDATED_AT,
        @JsonProperty("importance_score") IMPORTANCE_SCORE
    }
    
    public enum SortOrder {
        @JsonProperty("asc") ASC,
        @JsonProperty("desc") DESC
    }
    
    // Constructors
    public SearchOptions() {}
    
    public SearchOptions(String query) {
        this.query = query;
    }
    
    public SearchOptions(String query, Integer limit) {
        this.query = query;
        this.limit = limit;
    }
    
    // Getters and setters
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    
    public Integer getLimit() { return limit; }
    public void setLimit(Integer limit) { this.limit = limit; }
    
    public Integer getOffset() { return offset; }
    public void setOffset(Integer offset) { this.offset = offset; }
    
    public SearchAlgorithm getAlgorithm() { return algorithm; }
    public void setAlgorithm(SearchAlgorithm algorithm) { this.algorithm = algorithm; }
    
    public Double getThreshold() { return threshold; }
    public void setThreshold(Double threshold) { this.threshold = threshold; }
    
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    
    public Map<String, Object> getMetadataFilters() { return metadataFilters; }
    public void setMetadataFilters(Map<String, Object> metadataFilters) { this.metadataFilters = metadataFilters; }
    
    public Boolean getIncludeEmbeddings() { return includeEmbeddings; }
    public void setIncludeEmbeddings(Boolean includeEmbeddings) { this.includeEmbeddings = includeEmbeddings; }
    
    public SortOption getSortBy() { return sortBy; }
    public void setSortBy(SortOption sortBy) { this.sortBy = sortBy; }
    
    public SortOrder getSortOrder() { return sortOrder; }
    public void setSortOrder(SortOrder sortOrder) { this.sortOrder = sortOrder; }
}

/**
 * Search result containing memory and relevance score
 */
public class SearchResult {
    @JsonProperty("memory")
    private Memory memory;
    
    @JsonProperty("score")
    private Double score;
    
    @JsonProperty("algorithm_used")
    private String algorithmUsed;
    
    @JsonProperty("matched_fields")
    private List<String> matchedFields;
    
    @JsonProperty("highlights")
    private Map<String, String> highlights;
    
    // Constructors
    public SearchResult() {}
    
    public SearchResult(Memory memory, Double score) {
        this.memory = memory;
        this.score = score;
    }
    
    // Getters and setters
    public Memory getMemory() { return memory; }
    public void setMemory(Memory memory) { this.memory = memory; }
    
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    
    public String getAlgorithmUsed() { return algorithmUsed; }
    public void setAlgorithmUsed(String algorithmUsed) { this.algorithmUsed = algorithmUsed; }
    
    public List<String> getMatchedFields() { return matchedFields; }
    public void setMatchedFields(List<String> matchedFields) { this.matchedFields = matchedFields; }
    
    public Map<String, String> getHighlights() { return highlights; }
    public void setHighlights(Map<String, String> highlights) { this.highlights = highlights; }
}

/**
 * Analytics data model
 */
public class AnalyticsData {
    @JsonProperty("total_memories")
    private Long totalMemories;
    
    @JsonProperty("total_searches")
    private Long totalSearches;
    
    @JsonProperty("popular_tags")
    private List<TagCount> popularTags;
    
    @JsonProperty("memory_distribution")
    private Map<String, Integer> memoryDistribution;
    
    @JsonProperty("search_performance")
    private SearchPerformance searchPerformance;
    
    @JsonProperty("usage_stats")
    private UsageStats usageStats;
    
    // Nested classes
    public static class TagCount {
        @JsonProperty("tag")
        private String tag;
        
        @JsonProperty("count")
        private Integer count;
        
        // Getters and setters
        public String getTag() { return tag; }
        public void setTag(String tag) { this.tag = tag; }
        
        public Integer getCount() { return count; }
        public void setCount(Integer count) { this.count = count; }
    }
    
    public static class SearchPerformance {
        @JsonProperty("average_response_time")
        private Double averageResponseTime;
        
        @JsonProperty("cache_hit_rate")
        private Double cacheHitRate;
        
        @JsonProperty("total_queries")
        private Long totalQueries;
        
        // Getters and setters
        public Double getAverageResponseTime() { return averageResponseTime; }
        public void setAverageResponseTime(Double averageResponseTime) { this.averageResponseTime = averageResponseTime; }
        
        public Double getCacheHitRate() { return cacheHitRate; }
        public void setCacheHitRate(Double cacheHitRate) { this.cacheHitRate = cacheHitRate; }
        
        public Long getTotalQueries() { return totalQueries; }
        public void setTotalQueries(Long totalQueries) { this.totalQueries = totalQueries; }
    }
    
    public static class UsageStats {
        @JsonProperty("daily_active_users")
        private Integer dailyActiveUsers;
        
        @JsonProperty("monthly_active_users")
        private Integer monthlyActiveUsers;
        
        @JsonProperty("peak_usage_time")
        private String peakUsageTime;
        
        // Getters and setters
        public Integer getDailyActiveUsers() { return dailyActiveUsers; }
        public void setDailyActiveUsers(Integer dailyActiveUsers) { this.dailyActiveUsers = dailyActiveUsers; }
        
        public Integer getMonthlyActiveUsers() { return monthlyActiveUsers; }
        public void setMonthlyActiveUsers(Integer monthlyActiveUsers) { this.monthlyActiveUsers = monthlyActiveUsers; }
        
        public String getPeakUsageTime() { return peakUsageTime; }
        public void setPeakUsageTime(String peakUsageTime) { this.peakUsageTime = peakUsageTime; }
    }
    
    // Getters and setters
    public Long getTotalMemories() { return totalMemories; }
    public void setTotalMemories(Long totalMemories) { this.totalMemories = totalMemories; }
    
    public Long getTotalSearches() { return totalSearches; }
    public void setTotalSearches(Long totalSearches) { this.totalSearches = totalSearches; }
    
    public List<TagCount> getPopularTags() { return popularTags; }
    public void setPopularTags(List<TagCount> popularTags) { this.popularTags = popularTags; }
    
    public Map<String, Integer> getMemoryDistribution() { return memoryDistribution; }
    public void setMemoryDistribution(Map<String, Integer> memoryDistribution) { this.memoryDistribution = memoryDistribution; }
    
    public SearchPerformance getSearchPerformance() { return searchPerformance; }
    public void setSearchPerformance(SearchPerformance searchPerformance) { this.searchPerformance = searchPerformance; }
    
    public UsageStats getUsageStats() { return usageStats; }
    public void setUsageStats(UsageStats usageStats) { this.usageStats = usageStats; }
}

/**
 * System health information
 */
public class SystemHealth {
    @JsonProperty("status")
    private HealthStatus status;
    
    @JsonProperty("version")
    private String version;
    
    @JsonProperty("uptime")
    private Long uptime;
    
    @JsonProperty("database_status")
    private String databaseStatus;
    
    @JsonProperty("memory_usage")
    private Double memoryUsage;
    
    @JsonProperty("cpu_usage")
    private Double cpuUsage;
    
    @JsonProperty("active_connections")
    private Integer activeConnections;
    
    public enum HealthStatus {
        @JsonProperty("healthy") HEALTHY,
        @JsonProperty("degraded") DEGRADED,
        @JsonProperty("unhealthy") UNHEALTHY
    }
    
    // Getters and setters
    public HealthStatus getStatus() { return status; }
    public void setStatus(HealthStatus status) { this.status = status; }
    
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    
    public Long getUptime() { return uptime; }
    public void setUptime(Long uptime) { this.uptime = uptime; }
    
    public String getDatabaseStatus() { return databaseStatus; }
    public void setDatabaseStatus(String databaseStatus) { this.databaseStatus = databaseStatus; }
    
    public Double getMemoryUsage() { return memoryUsage; }
    public void setMemoryUsage(Double memoryUsage) { this.memoryUsage = memoryUsage; }
    
    public Double getCpuUsage() { return cpuUsage; }
    public void setCpuUsage(Double cpuUsage) { this.cpuUsage = cpuUsage; }
    
    public Integer getActiveConnections() { return activeConnections; }
    public void setActiveConnections(Integer activeConnections) { this.activeConnections = activeConnections; }
}

/**
 * Generic API response wrapper
 */
public class ApiResponse {
    @JsonProperty("success")
    private Boolean success;
    
    @JsonProperty("data")
    private Object data;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("error")
    private String error;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    // Constructors
    public ApiResponse() {}
    
    public ApiResponse(Boolean success, Object data, String message) {
        this.success = success;
        this.data = data;
        this.message = message;
    }
    
    // Getters and setters
    public Boolean isSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }
    
    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

/**
 * WebSocket message model
 */
public class WebSocketMessage {
    @JsonProperty("type")
    private String type;
    
    @JsonProperty("event")
    private String event;
    
    @JsonProperty("data")
    private Object data;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    // Getters and setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }
    
    public Object getData() { return data; }
    public void setData(Object data) { this.data = data; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
