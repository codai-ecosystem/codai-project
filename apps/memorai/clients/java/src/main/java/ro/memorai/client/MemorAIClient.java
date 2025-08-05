package ro.memorai.client;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import okhttp3.*;
import okhttp3.ws.WebSocket;
import okhttp3.ws.WebSocketCall;
import okhttp3.ws.WebSocketListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

/**
 * Official Java client for the MemorAI platform
 * 
 * Provides comprehensive access to MemorAI features including:
 * - Memory management (CRUD operations)
 * - Advanced search capabilities
 * - Real-time updates via WebSocket
 * - Analytics and insights
 * - System health monitoring
 */
public class MemorAIClient {
    private static final Logger logger = LoggerFactory.getLogger(MemorAIClient.class);
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    
    private final String apiKey;
    private final String baseUrl;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String userAgent;
    private final boolean debug;
    
    // WebSocket support
    private WebSocket webSocket;
    private final Map<String, List<Consumer<Object>>> eventListeners = new ConcurrentHashMap<>();
    
    // API sections
    private final MemoryApi memoryApi;
    private final SearchApi searchApi;
    private final AnalyticsApi analyticsApi;
    private final SystemApi systemApi;
    
    /**
     * Create a new MemorAI client
     * 
     * @param builder Configuration builder
     */
    private MemorAIClient(Builder builder) {
        this.apiKey = builder.apiKey;
        this.baseUrl = builder.baseUrl.endsWith("/") ? builder.baseUrl.substring(0, builder.baseUrl.length() - 1) : builder.baseUrl;
        this.userAgent = builder.userAgent;
        this.debug = builder.debug;
        
        // Configure HTTP client
        OkHttpClient.Builder httpBuilder = new OkHttpClient.Builder()
            .connectTimeout(Duration.ofSeconds(30))
            .readTimeout(Duration.ofSeconds(builder.timeoutSeconds))
            .writeTimeout(Duration.ofSeconds(30));
            
        if (builder.retryOnConnectionFailure) {
            httpBuilder.retryOnConnectionFailure(true);
        }
        
        this.httpClient = httpBuilder.build();
        
        // Configure JSON mapper
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        
        // Initialize API sections
        this.memoryApi = new MemoryApi(this);
        this.searchApi = new SearchApi(this);
        this.analyticsApi = new AnalyticsApi(this);
        this.systemApi = new SystemApi(this);
        
        // Connect WebSocket if enabled
        if (builder.enableWebSocket) {
            connectWebSocket();
        }
    }
    
    /**
     * Builder for MemorAI client configuration
     */
    public static class Builder {
        private String apiKey;
        private String baseUrl = "https://api.memorai.ro";
        private long timeoutSeconds = 30;
        private boolean retryOnConnectionFailure = true;
        private boolean enableWebSocket = true;
        private String userAgent = "MemorAI-Java-Client/1.0.0";
        private boolean debug = false;
        
        public Builder apiKey(String apiKey) {
            this.apiKey = apiKey;
            return this;
        }
        
        public Builder baseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
            return this;
        }
        
        public Builder timeout(long seconds) {
            this.timeoutSeconds = seconds;
            return this;
        }
        
        public Builder retryOnConnectionFailure(boolean retry) {
            this.retryOnConnectionFailure = retry;
            return this;
        }
        
        public Builder enableWebSocket(boolean enable) {
            this.enableWebSocket = enable;
            return this;
        }
        
        public Builder userAgent(String userAgent) {
            this.userAgent = userAgent;
            return this;
        }
        
        public Builder debug(boolean debug) {
            this.debug = debug;
            return this;
        }
        
        public MemorAIClient build() {
            return new MemorAIClient(this);
        }
    }
    
    /**
     * Create a new builder instance
     */
    public static Builder builder() {
        return new Builder();
    }
    
    /**
     * Get memory management API
     */
    public MemoryApi memories() {
        return memoryApi;
    }
    
    /**
     * Get search API
     */
    public SearchApi search() {
        return searchApi;
    }
    
    /**
     * Get analytics API
     */
    public AnalyticsApi analytics() {
        return analyticsApi;
    }
    
    /**
     * Get system API
     */
    public SystemApi system() {
        return systemApi;
    }
    
    /**
     * Make HTTP request to the API
     */
    protected <T> CompletableFuture<T> makeRequest(String method, String endpoint, Object body, Class<T> responseType) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String url = baseUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
                
                Request.Builder requestBuilder = new Request.Builder()
                    .url(url)
                    .header("User-Agent", userAgent)
                    .header("Accept", "application/json");
                
                if (apiKey != null && !apiKey.isEmpty()) {
                    requestBuilder.header("Authorization", "Bearer " + apiKey);
                }
                
                if (body != null) {
                    String json = objectMapper.writeValueAsString(body);
                    RequestBody requestBody = RequestBody.create(json, JSON);
                    
                    switch (method.toUpperCase()) {
                        case "POST":
                            requestBuilder.post(requestBody);
                            break;
                        case "PUT":
                            requestBuilder.put(requestBody);
                            break;
                        case "PATCH":
                            requestBuilder.patch(requestBody);
                            break;
                        default:
                            throw new IllegalArgumentException("Unsupported method with body: " + method);
                    }
                } else {
                    switch (method.toUpperCase()) {
                        case "GET":
                            requestBuilder.get();
                            break;
                        case "DELETE":
                            requestBuilder.delete();
                            break;
                        case "POST":
                            requestBuilder.post(RequestBody.create("", JSON));
                            break;
                        default:
                            throw new IllegalArgumentException("Unsupported method: " + method);
                    }
                }
                
                Request request = requestBuilder.build();
                
                if (debug) {
                    logger.debug("Making request: {} {}", method, url);
                    if (body != null) {
                        logger.debug("Request body: {}", objectMapper.writeValueAsString(body));
                    }
                }
                
                try (Response response = httpClient.newCall(request).execute()) {
                    String responseBody = response.body() != null ? response.body().string() : "";
                    
                    if (debug) {
                        logger.debug("Response: {} {}", response.code(), responseBody);
                    }
                    
                    if (!response.isSuccessful()) {
                        throw new MemorAIException("API request failed: " + response.code() + " " + responseBody);
                    }
                    
                    if (responseBody.isEmpty()) {
                        return null;
                    }
                    
                    // Parse API response wrapper
                    ApiResponse apiResponse = objectMapper.readValue(responseBody, ApiResponse.class);
                    
                    if (!apiResponse.isSuccess()) {
                        throw new MemorAIException("API returned error: " + apiResponse.getMessage());
                    }
                    
                    if (apiResponse.getData() == null) {
                        return null;
                    }
                    
                    // Convert data to target type
                    String dataJson = objectMapper.writeValueAsString(apiResponse.getData());
                    return objectMapper.readValue(dataJson, responseType);
                }
                
            } catch (IOException e) {
                throw new MemorAIException("Request failed: " + e.getMessage(), e);
            }
        });
    }
    
    /**
     * Connect to WebSocket for real-time updates
     */
    private void connectWebSocket() {
        if (baseUrl == null) return;
        
        String wsUrl = baseUrl.replace("http://", "ws://").replace("https://", "wss://");
        
        Request request = new Request.Builder()
            .url(wsUrl)
            .build();
        
        WebSocketCall call = WebSocketCall.create(httpClient, request);
        
        call.enqueue(new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                MemorAIClient.this.webSocket = webSocket;
                logger.info("WebSocket connected");
            }
            
            @Override
            public void onMessage(ResponseBody message) throws IOException {
                try {
                    String text = message.string();
                    if (debug) {
                        logger.debug("WebSocket message: {}", text);
                    }
                    
                    WebSocketMessage wsMessage = objectMapper.readValue(text, WebSocketMessage.class);
                    handleWebSocketMessage(wsMessage);
                } catch (Exception e) {
                    logger.error("Error processing WebSocket message", e);
                }
            }
            
            @Override
            public void onFailure(IOException e, Response response) {
                logger.error("WebSocket connection failed", e);
            }
            
            @Override
            public void onPong(Buffer payload) {
                // Handle pong if needed
            }
            
            @Override
            public void onClose(int code, String reason) {
                logger.info("WebSocket closed: {} - {}", code, reason);
                webSocket = null;
            }
        });
    }
    
    /**
     * Handle incoming WebSocket messages
     */
    private void handleWebSocketMessage(WebSocketMessage message) {
        String eventKey = message.getType() + ":" + message.getEvent();
        List<Consumer<Object>> listeners = eventListeners.get(eventKey);
        
        if (listeners != null) {
            for (Consumer<Object> listener : listeners) {
                try {
                    listener.accept(message.getData());
                } catch (Exception e) {
                    logger.error("Error in WebSocket event listener", e);
                }
            }
        }
    }
    
    /**
     * Register WebSocket event listener
     */
    public void on(String event, Consumer<Object> listener) {
        eventListeners.computeIfAbsent(event, k -> new ArrayList<>()).add(listener);
    }
    
    /**
     * Unregister WebSocket event listener
     */
    public void off(String event, Consumer<Object> listener) {
        List<Consumer<Object>> listeners = eventListeners.get(event);
        if (listeners != null) {
            listeners.remove(listener);
            if (listeners.isEmpty()) {
                eventListeners.remove(event);
            }
        }
    }
    
    /**
     * Close client and cleanup resources
     */
    public void close() {
        if (webSocket != null) {
            webSocket.close(1000, "Client closing");
        }
        httpClient.dispatcher().executorService().shutdown();
        httpClient.connectionPool().evictAll();
    }
    
    /**
     * Get the configured object mapper
     */
    protected ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}
