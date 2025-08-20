// CBD Enterprise Engine - MemoraiMCP Client Interface
// 
// This module provides a robust HTTP client interface for communicating with
// the MemoraiMCP server, handling authentication, retries, and error recovery.

use crate::error::{CBDError, Result};
use crate::memory::{MemoryEntry, MemoryQuery, MemorySearchResult, ContextInfo, MemoryStats};
use reqwest::{Client, ClientBuilder};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::timeout;
use tracing::{debug, error, info, warn};

/// MemoraiMCP API request format
#[derive(Debug, Serialize)]
struct MemoraiRequest {
    method: String,
    params: serde_json::Value,
    id: String,
}

/// MemoraiMCP API response format
#[derive(Debug, Deserialize)]
struct MemoraiResponse {
    result: Option<serde_json::Value>,
    error: Option<MemoraiError>,
    id: String,
}

/// MemoraiMCP error structure
#[derive(Debug, Deserialize)]
struct MemoraiError {
    code: i32,
    message: String,
    data: Option<serde_json::Value>,
}

/// MemoraiMCP client configuration
#[derive(Debug, Clone)]
pub struct MemoraiClientConfig {
    pub endpoint: String,
    pub timeout: Duration,
    pub max_retries: u32,
    pub retry_delay: Duration,
    pub connection_pool_size: usize,
    pub enable_compression: bool,
    pub api_key: Option<String>,
}

impl Default for MemoraiClientConfig {
    fn default() -> Self {
        Self {
            endpoint: "http://localhost:8002".to_string(),
            timeout: Duration::from_secs(30),
            max_retries: 3,
            retry_delay: Duration::from_millis(500),
            connection_pool_size: 10,
            enable_compression: true,
            api_key: None,
        }
    }
}

/// MemoraiMCP client for HTTP communication
pub struct MemoraiClient {
    client: Client,
    config: MemoraiClientConfig,
    request_counter: std::sync::atomic::AtomicU64,
}

impl MemoraiClient {
    /// Create a new MemoraiMCP client
    pub fn new(config: MemoraiClientConfig) -> Result<Self> {
        let mut client_builder = ClientBuilder::new()
            .timeout(config.timeout)
            .pool_max_idle_per_host(config.connection_pool_size)
            .pool_idle_timeout(Duration::from_secs(60));
        
        if config.enable_compression {
            // Note: Compression is handled automatically by reqwest in newer versions
        }
        
        let client = client_builder
            .build()
            .map_err(|e| CBDError::Network(format!("Failed to create HTTP client: {}", e)))?;
        
        Ok(Self {
            client,
            config,
            request_counter: std::sync::atomic::AtomicU64::new(0),
        })
    }
    
    /// Test connectivity to MemoraiMCP server
    pub async fn health_check(&self) -> Result<bool> {
        debug!("Performing MemoraiMCP health check");
        
        let health_url = format!("{}/health", self.config.endpoint);
        
        match timeout(self.config.timeout, self.client.get(&health_url).send()).await {
            Ok(Ok(response)) => {
                let is_healthy = response.status().is_success();
                if is_healthy {
                    info!("MemoraiMCP server is healthy");
                } else {
                    warn!("MemoraiMCP server returned status: {}", response.status());
                }
                Ok(is_healthy)
            }
            Ok(Err(e)) => {
                error!("MemoraiMCP health check failed: {}", e);
                Ok(false)
            }
            Err(_) => {
                error!("MemoraiMCP health check timed out");
                Ok(false)
            }
        }
    }
    
    /// Store a memory in MemoraiMCP
    pub async fn remember(&self, content: &str, agent_id: &str, metadata: Option<serde_json::Value>) -> Result<String> {
        debug!("Storing memory for agent: {}", agent_id);
        
        let mut params = serde_json::json!({
            "content": content,
            "agentId": agent_id
        });
        
        if let Some(meta) = metadata {
            params["metadata"] = meta;
        }
        
        let response = self.send_request("mcp_memoraimcp_remember", params).await?;
        
        response
            .get("memory_id")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| CBDError::Api("Invalid remember response: missing memory_id".to_string()))
    }
    
    /// Recall memories based on a query
    pub async fn recall(&self, query: &str, agent_id: &str, limit: Option<usize>) -> Result<Vec<MemorySearchResult>> {
        debug!("Recalling memories for query: {} (agent: {})", query, agent_id);
        
        let mut params = serde_json::json!({
            "query": query,
            "agentId": agent_id
        });
        
        if let Some(l) = limit {
            params["limit"] = serde_json::Value::Number(l.into());
        }
        
        let response = self.send_request("mcp_memoraimcp_recall", params).await?;
        
        let memories = response
            .get("memories")
            .and_then(|v| v.as_array())
            .ok_or_else(|| CBDError::Api("Invalid recall response: missing memories array".to_string()))?;
        
        let mut results = Vec::new();
        for memory_value in memories {
            if let Ok(result) = serde_json::from_value::<MemorySearchResult>(memory_value.clone()) {
                results.push(result);
            } else {
                warn!("Failed to deserialize memory search result: {:?}", memory_value);
            }
        }
        
        info!("Recalled {} memories for query", results.len());
        Ok(results)
    }
    
    /// Get context information for an agent
    pub async fn get_context(&self, agent_id: &str, context_size: Option<usize>) -> Result<ContextInfo> {
        debug!("Getting context for agent: {}", agent_id);
        
        let mut params = serde_json::json!({
            "agentId": agent_id
        });
        
        if let Some(size) = context_size {
            params["contextSize"] = serde_json::Value::Number(size.into());
        }
        
        let response = self.send_request("mcp_memoraimcp_context", params).await?;
        
        serde_json::from_value(response)
            .map_err(|e| CBDError::Api(format!("Invalid context response: {}", e)))
    }
    
    /// Delete a specific memory
    pub async fn forget(&self, memory_id: &str, agent_id: &str) -> Result<bool> {
        debug!("Forgetting memory: {} (agent: {})", memory_id, agent_id);
        
        let params = serde_json::json!({
            "structuredKey": memory_id,
            "agentId": agent_id
        });
        
        let response = self.send_request("mcp_memoraimcp_forget", params).await?;
        
        response
            .get("success")
            .and_then(|v| v.as_bool())
            .unwrap_or(false)
            .then_some(true)
            .ok_or_else(|| CBDError::Api("Failed to delete memory".to_string()))
    }
    
    /// Search memories with advanced parameters
    pub async fn search_memories(&self, query: &MemoryQuery) -> Result<Vec<MemorySearchResult>> {
        debug!("Searching memories with advanced query for agent: {}", query.agent_id);
        
        let params = serde_json::to_value(query)
            .map_err(|e| CBDError::Serialization(format!("Failed to serialize query: {}", e)))?;
        
        let response = self.send_request("mcp_memoraimcp_recall", params).await?;
        
        let memories = response
            .get("memories")
            .and_then(|v| v.as_array())
            .ok_or_else(|| CBDError::Api("Invalid search response: missing memories array".to_string()))?;
        
        let mut results = Vec::new();
        for memory_value in memories {
            if let Ok(result) = serde_json::from_value::<MemorySearchResult>(memory_value.clone()) {
                results.push(result);
            }
        }
        
        info!("Found {} memories for advanced search", results.len());
        Ok(results)
    }
    
    /// Get memory statistics
    pub async fn get_stats(&self, agent_id: &str) -> Result<MemoryStats> {
        debug!("Getting memory statistics for agent: {}", agent_id);
        
        let params = serde_json::json!({
            "agentId": agent_id
        });
        
        // Note: This assumes a stats endpoint exists in MemoraiMCP
        // If not available, we'll need to gather stats from other endpoints
        match self.send_request("mcp_memoraimcp_stats", params).await {
            Ok(response) => {
                serde_json::from_value(response)
                    .map_err(|e| CBDError::Api(format!("Invalid stats response: {}", e)))
            }
            Err(_) => {
                // Fallback: create basic stats from context
                warn!("Stats endpoint not available, using fallback stats");
                let context = self.get_context(agent_id, Some(1000)).await?;
                let stats = MemoryStats {
                    total_memories: context.memories.len() as u64,
                    memories_by_priority: std::collections::HashMap::new(),
                    memories_by_entity_type: std::collections::HashMap::new(),
                    average_access_count: 0.0,
                    storage_size_bytes: 0,
                    last_optimization: None,
                    performance_metrics: std::collections::HashMap::new(),
                };
                Ok(stats)
            }
        }
    }
    
    /// Send a request to MemoraiMCP server with retry logic
    async fn send_request(&self, method: &str, params: serde_json::Value) -> Result<serde_json::Value> {
        let request_id = self.request_counter.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        
        let request = MemoraiRequest {
            method: method.to_string(),
            params,
            id: format!("cbd_{}_{}", request_id, chrono::Utc::now().timestamp_millis()),
        };
        
        let mut last_error = None;
        
        for attempt in 0..=self.config.max_retries {
            if attempt > 0 {
                debug!("Retry attempt {} for method: {}", attempt, method);
                tokio::time::sleep(self.config.retry_delay * attempt).await;
            }
            
            let mut request_builder = self.client
                .post(&format!("{}/mcp", self.config.endpoint))
                .json(&request)
                .header("Content-Type", "application/json");
            
            if let Some(ref api_key) = self.config.api_key {
                request_builder = request_builder.header("Authorization", format!("Bearer {}", api_key));
            }
            
            match timeout(self.config.timeout, request_builder.send()).await {
                Ok(Ok(response)) => {
                    let status = response.status();
                    
                    if status.is_success() {
                        match response.json::<MemoraiResponse>().await {
                            Ok(memorai_response) => {
                                if let Some(error) = memorai_response.error {
                                    last_error = Some(CBDError::Api(format!("MemoraiMCP error {}: {}", error.code, error.message)));
                                } else if let Some(result) = memorai_response.result {
                                    debug!("Successfully completed request: {}", method);
                                    return Ok(result);
                                } else {
                                    last_error = Some(CBDError::Api("Empty response from MemoraiMCP".to_string()));
                                }
                            }
                            Err(e) => {
                                last_error = Some(CBDError::Api(format!("Failed to parse MemoraiMCP response: {}", e)));
                            }
                        }
                    } else {
                        last_error = Some(CBDError::Network(format!("HTTP error {}: {}", status.as_u16(), status.canonical_reason().unwrap_or("Unknown"))));
                    }
                }
                Ok(Err(e)) => {
                    last_error = Some(CBDError::Network(format!("Request failed: {}", e)));
                }
                Err(_) => {
                    last_error = Some(CBDError::Timeout("Request timed out".to_string()));
                }
            }
        }
        
        error!("All retry attempts failed for method: {}", method);
        Err(last_error.unwrap_or_else(|| CBDError::Api("Unknown error occurred".to_string())))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio;
    
    #[tokio::test]
    async fn test_memorai_client_creation() {
        let config = MemoraiClientConfig::default();
        let client = MemoraiClient::new(config);
        assert!(client.is_ok());
    }
    
    #[tokio::test]
    async fn test_memorai_client_config() {
        let mut config = MemoraiClientConfig::default();
        config.endpoint = "http://localhost:8080".to_string();
        config.timeout = Duration::from_secs(60);
        config.max_retries = 5;
        
        assert_eq!(config.endpoint, "http://localhost:8080");
        assert_eq!(config.timeout, Duration::from_secs(60));
        assert_eq!(config.max_retries, 5);
    }
    
    #[test]
    fn test_memorai_request_serialization() {
        let request = MemoraiRequest {
            method: "test_method".to_string(),
            params: serde_json::json!({"key": "value"}),
            id: "test_id".to_string(),
        };
        
        let serialized = serde_json::to_string(&request);
        assert!(serialized.is_ok());
        
        let json = serialized.unwrap();
        assert!(json.contains("test_method"));
        assert!(json.contains("test_id"));
    }
}
