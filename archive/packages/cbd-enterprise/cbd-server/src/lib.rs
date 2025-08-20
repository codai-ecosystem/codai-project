/*!
 * CBD Enterprise Server
 * High-performance gRPC and REST server for the CBD database
 */

use cbd_core::*;
use cbd_storage::RocksDBStorageEngine;
use cbd_vector::HNSWVectorIndex;
use cbd_cluster::RaftClusterCoordinator;
use cbd_security::EnterpriseSecurityManager;

use anyhow::{Result, Context};
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use tokio::net::TcpListener;
use tokio::sync::RwLock;
use tonic::{transport::Server, Request, Response, Status};
use tower_http::cors::CorsLayer;
use tracing::{info, error, debug};
use uuid::Uuid;

/// CBD Enterprise Server
pub struct CBDEnterpriseServer {
    engine: Arc<CBDEngine>,
    config: ServerConfig,
    metrics: Arc<ServerMetrics>,
    health_checker: Arc<HealthChecker>,
}

/// Server configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    pub server: NetworkConfig,
    pub database: CBDConfig,
    pub grpc: GrpcConfig,
    pub rest: RestConfig,
    pub monitoring: MonitoringConfig,
}

/// Network configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    pub bind_address: String,
    pub grpc_port: u16,
    pub rest_port: u16,
    pub admin_port: u16,
    pub max_connections: usize,
    pub connection_timeout_secs: u64,
    pub read_timeout_secs: u64,
    pub write_timeout_secs: u64,
}

/// gRPC configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrpcConfig {
    pub max_message_size: usize,
    pub max_concurrent_streams: u32,
    pub keepalive_interval_secs: u64,
    pub keepalive_timeout_secs: u64,
    pub enable_reflection: bool,
    pub enable_health_check: bool,
}

/// REST configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestConfig {
    pub max_request_size: usize,
    pub enable_cors: bool,
    pub cors_origins: Vec<String>,
    pub enable_swagger: bool,
    pub rate_limit_requests_per_minute: u32,
}

/// Monitoring configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringConfig {
    pub enable_metrics: bool,
    pub metrics_path: String,
    pub enable_tracing: bool,
    pub jaeger_endpoint: Option<String>,
    pub log_level: String,
}

/// Server metrics
#[derive(Debug, Default)]
pub struct ServerMetrics {
    pub total_requests: Arc<RwLock<u64>>,
    pub successful_requests: Arc<RwLock<u64>>,
    pub failed_requests: Arc<RwLock<u64>>,
    pub avg_response_time_ms: Arc<RwLock<f64>>,
    pub active_connections: Arc<RwLock<u32>>,
    pub memory_usage_bytes: Arc<RwLock<u64>>,
    pub storage_size_bytes: Arc<RwLock<u64>>,
    pub vector_count: Arc<RwLock<u64>>,
}

/// Health checker
pub struct HealthChecker {
    engine: Arc<CBDEngine>,
    cluster_coordinator: Option<Arc<RaftClusterCoordinator>>,
}

/// Health status
#[derive(Debug, Serialize, Deserialize)]
pub struct HealthStatus {
    pub status: String,
    pub version: String,
    pub uptime_seconds: u64,
    pub components: std::collections::HashMap<String, ComponentHealth>,
}

/// Component health
#[derive(Debug, Serialize, Deserialize)]
pub struct ComponentHealth {
    pub status: String,
    pub last_check: String,
    pub details: Option<String>,
}

// gRPC service definitions
pub mod cbd_service {
    use super::*;
    
    tonic::include_proto!("cbd");
    
    /// CBD gRPC service implementation
    pub struct CBDService {
        engine: Arc<CBDEngine>,
        security: Arc<EnterpriseSecurityManager>,
        metrics: Arc<ServerMetrics>,
    }
    
    impl CBDService {
        pub fn new(
            engine: Arc<CBDEngine>,
            security: Arc<EnterpriseSecurityManager>,
            metrics: Arc<ServerMetrics>,
        ) -> Self {
            Self {
                engine,
                security,
                metrics,
            }
        }
        
        /// Authenticate request
        async fn authenticate_request(&self, request: &Request<impl std::fmt::Debug>) -> Result<User, Status> {
            let token = request
                .metadata()
                .get("authorization")
                .and_then(|t| t.to_str().ok())
                .and_then(|t| t.strip_prefix("Bearer "))
                .ok_or_else(|| Status::unauthenticated("Missing or invalid authorization token"))?;
            
            self.security
                .get_user_from_session(token)
                .await
                .map_err(|e| Status::internal(format!("Authentication error: {}", e)))?
                .ok_or_else(|| Status::unauthenticated("Invalid or expired token"))
        }
        
        /// Authorize request
        async fn authorize_request(&self, user: &User, resource: &str, action: &str) -> Result<(), Status> {
            let session_token = ""; // Get from request context
            let authorized = self.security
                .authorize(session_token, resource, action)
                .await
                .map_err(|e| Status::internal(format!("Authorization error: {}", e)))?;
            
            if !authorized {
                return Err(Status::permission_denied("Insufficient permissions"));
            }
            
            Ok(())
        }
        
        /// Update metrics
        async fn update_metrics(&self, start_time: std::time::Instant, success: bool) {
            let duration = start_time.elapsed().as_millis() as f64;
            
            {
                let mut total = self.metrics.total_requests.write().await;
                *total += 1;
                
                if success {
                    let mut successful = self.metrics.successful_requests.write().await;
                    *successful += 1;
                } else {
                    let mut failed = self.metrics.failed_requests.write().await;
                    *failed += 1;
                }
                
                let mut avg_time = self.metrics.avg_response_time_ms.write().await;
                *avg_time = (*avg_time * (*total as f64 - 1.0) + duration) / *total as f64;
            }
        }
    }
    
    #[tonic::async_trait]
    impl cbd_server::Cbd for CBDService {
        /// Store memory
        async fn store_memory(
            &self,
            request: Request<StoreMemoryRequest>,
        ) -> Result<Response<StoreMemoryResponse>, Status> {
            let start_time = std::time::Instant::now();
            let req = request.get_ref();
            
            // Authenticate and authorize
            let user = self.authenticate_request(&request).await?;
            self.authorize_request(&user, "memories", "write").await?;
            
            // Store memory
            let result = self
                .engine
                .store_memory(&req.key, &req.content, &req.vector, req.metadata.as_deref())
                .await;
            
            let success = result.is_ok();
            self.update_metrics(start_time, success).await;
            
            match result {
                Ok(()) => Ok(Response::new(StoreMemoryResponse {
                    success: true,
                    message: "Memory stored successfully".to_string(),
                })),
                Err(e) => Err(Status::internal(format!("Failed to store memory: {}", e))),
            }
        }
        
        /// Search memories
        async fn search_memories(
            &self,
            request: Request<SearchMemoriesRequest>,
        ) -> Result<Response<SearchMemoriesResponse>, Status> {
            let start_time = std::time::Instant::now();
            let req = request.get_ref();
            
            // Authenticate and authorize
            let user = self.authenticate_request(&request).await?;
            self.authorize_request(&user, "memories", "read").await?;
            
            // Search memories
            let result = self
                .engine
                .search_memories(&req.query_vector, req.limit as usize, req.threshold)
                .await;
            
            let success = result.is_ok();
            self.update_metrics(start_time, success).await;
            
            match result {
                Ok(memories) => {
                    let results = memories
                        .into_iter()
                        .map(|m| MemoryResult {
                            key: m.key,
                            content: m.content,
                            distance: m.distance,
                            metadata: m.metadata.unwrap_or_default(),
                        })
                        .collect();
                    
                    Ok(Response::new(SearchMemoriesResponse {
                        results,
                        total_found: results.len() as u32,
                    }))
                }
                Err(e) => Err(Status::internal(format!("Failed to search memories: {}", e))),
            }
        }
        
        /// Get engine stats
        async fn get_stats(
            &self,
            request: Request<GetStatsRequest>,
        ) -> Result<Response<GetStatsResponse>, Status> {
            let start_time = std::time::Instant::now();
            
            // Authenticate and authorize
            let user = self.authenticate_request(&request).await?;
            self.authorize_request(&user, "system", "read").await?;
            
            // Get stats
            let result = self.engine.get_stats().await;
            
            let success = result.is_ok();
            self.update_metrics(start_time, success).await;
            
            match result {
                Ok(stats) => Ok(Response::new(GetStatsResponse {
                    node_id: stats.node_id.to_string(),
                    cluster_role: format!("{:?}", stats.cluster_role),
                    total_operations: stats.total_operations,
                    active_transactions: stats.active_transactions,
                    total_vectors: stats.vector_stats.total_vectors,
                    index_size_bytes: stats.vector_stats.index_size_bytes,
                })),
                Err(e) => Err(Status::internal(format!("Failed to get stats: {}", e))),
            }
        }
        
        /// Health check
        async fn health_check(
            &self,
            _request: Request<HealthCheckRequest>,
        ) -> Result<Response<HealthCheckResponse>, Status> {
            Ok(Response::new(HealthCheckResponse {
                status: "SERVING".to_string(),
                message: "CBD Enterprise is healthy".to_string(),
            }))
        }
    }
}

// REST API handlers
pub mod rest_handlers {
    use super::*;
    use axum::{
        extract::{Path, Query, State},
        http::StatusCode,
        response::Json,
        routing::{get, post, delete},
        Router,
    };
    
    /// Application state
    #[derive(Clone)]
    pub struct AppState {
        pub engine: Arc<CBDEngine>,
        pub security: Arc<EnterpriseSecurityManager>,
        pub metrics: Arc<ServerMetrics>,
    }
    
    /// Create REST router
    pub fn create_router(state: AppState) -> Router {
        Router::new()
            .route("/api/v1/memories", post(store_memory))
            .route("/api/v1/memories/search", post(search_memories))
            .route("/api/v1/memories/:key", get(get_memory))
            .route("/api/v1/memories/:key", delete(delete_memory))
            .route("/api/v1/stats", get(get_stats))
            .route("/api/v1/health", get(health_check))
            .route("/metrics", get(get_metrics))
            .with_state(state)
    }
    
    /// Store memory endpoint
    async fn store_memory(
        State(state): State<AppState>,
        Json(payload): Json<StoreMemoryRequest>,
    ) -> Result<Json<StoreMemoryResponse>, (StatusCode, String)> {
        let result = state
            .engine
            .store_memory(&payload.key, &payload.content, &payload.vector, payload.metadata.as_deref())
            .await;
        
        match result {
            Ok(()) => Ok(Json(StoreMemoryResponse {
                success: true,
                message: "Memory stored successfully".to_string(),
            })),
            Err(e) => Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to store memory: {}", e),
            )),
        }
    }
    
    /// Search memories endpoint
    async fn search_memories(
        State(state): State<AppState>,
        Json(payload): Json<SearchMemoriesRequest>,
    ) -> Result<Json<SearchMemoriesResponse>, (StatusCode, String)> {
        let result = state
            .engine
            .search_memories(&payload.query_vector, payload.limit as usize, payload.threshold)
            .await;
        
        match result {
            Ok(memories) => {
                let results = memories
                    .into_iter()
                    .map(|m| MemoryResult {
                        key: m.key,
                        content: m.content,
                        distance: m.distance,
                        metadata: m.metadata.unwrap_or_default(),
                    })
                    .collect();
                
                Ok(Json(SearchMemoriesResponse {
                    results,
                    total_found: results.len() as u32,
                }))
            }
            Err(e) => Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to search memories: {}", e),
            )),
        }
    }
    
    /// Get memory endpoint
    async fn get_memory(
        State(_state): State<AppState>,
        Path(_key): Path<String>,
    ) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
        // TODO: Implement get memory
        Err((StatusCode::NOT_IMPLEMENTED, "Not implemented yet".to_string()))
    }
    
    /// Delete memory endpoint
    async fn delete_memory(
        State(_state): State<AppState>,
        Path(_key): Path<String>,
    ) -> Result<Json<serde_json::Value>, (StatusCode, String)> {
        // TODO: Implement delete memory
        Err((StatusCode::NOT_IMPLEMENTED, "Not implemented yet".to_string()))
    }
    
    /// Get stats endpoint
    async fn get_stats(
        State(state): State<AppState>,
    ) -> Result<Json<GetStatsResponse>, (StatusCode, String)> {
        let result = state.engine.get_stats().await;
        
        match result {
            Ok(stats) => Ok(Json(GetStatsResponse {
                node_id: stats.node_id.to_string(),
                cluster_role: format!("{:?}", stats.cluster_role),
                total_operations: stats.total_operations,
                active_transactions: stats.active_transactions,
                total_vectors: stats.vector_stats.total_vectors,
                index_size_bytes: stats.vector_stats.index_size_bytes,
            })),
            Err(e) => Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to get stats: {}", e),
            )),
        }
    }
    
    /// Health check endpoint
    async fn health_check(
        State(_state): State<AppState>,
    ) -> Result<Json<HealthCheckResponse>, (StatusCode, String)> {
        Ok(Json(HealthCheckResponse {
            status: "SERVING".to_string(),
            message: "CBD Enterprise is healthy".to_string(),
        }))
    }
    
    /// Metrics endpoint
    async fn get_metrics(
        State(state): State<AppState>,
    ) -> Result<String, (StatusCode, String)> {
        let metrics = &state.metrics;
        
        let total_requests = *metrics.total_requests.read().await;
        let successful_requests = *metrics.successful_requests.read().await;
        let failed_requests = *metrics.failed_requests.read().await;
        let avg_response_time = *metrics.avg_response_time_ms.read().await;
        let active_connections = *metrics.active_connections.read().await;
        let memory_usage = *metrics.memory_usage_bytes.read().await;
        let storage_size = *metrics.storage_size_bytes.read().await;
        let vector_count = *metrics.vector_count.read().await;
        
        let prometheus_metrics = format!(
            r#"# HELP cbd_total_requests Total number of requests
# TYPE cbd_total_requests counter
cbd_total_requests {{}} {}

# HELP cbd_successful_requests Total number of successful requests
# TYPE cbd_successful_requests counter
cbd_successful_requests {{}} {}

# HELP cbd_failed_requests Total number of failed requests
# TYPE cbd_failed_requests counter
cbd_failed_requests {{}} {}

# HELP cbd_avg_response_time_ms Average response time in milliseconds
# TYPE cbd_avg_response_time_ms gauge
cbd_avg_response_time_ms {{}} {}

# HELP cbd_active_connections Number of active connections
# TYPE cbd_active_connections gauge
cbd_active_connections {{}} {}

# HELP cbd_memory_usage_bytes Memory usage in bytes
# TYPE cbd_memory_usage_bytes gauge
cbd_memory_usage_bytes {{}} {}

# HELP cbd_storage_size_bytes Storage size in bytes
# TYPE cbd_storage_size_bytes gauge
cbd_storage_size_bytes {{}} {}

# HELP cbd_vector_count Total number of vectors
# TYPE cbd_vector_count gauge
cbd_vector_count {{}} {}
"#,
            total_requests,
            successful_requests,
            failed_requests,
            avg_response_time,
            active_connections,
            memory_usage,
            storage_size,
            vector_count
        );
        
        Ok(prometheus_metrics)
    }
}

impl CBDEnterpriseServer {
    /// Create new CBD Enterprise Server
    pub async fn new(config: ServerConfig) -> Result<Self> {
        info!("Initializing CBD Enterprise Server...");
        
        // Create CBD engine
        let engine = Arc::new(CBDEngine::new(config.database.clone()));
        engine.initialize().await?;
        
        // Create metrics
        let metrics = Arc::new(ServerMetrics::default());
        
        // Create health checker
        let health_checker = Arc::new(HealthChecker::new(Arc::clone(&engine), None));
        
        Ok(Self {
            engine,
            config,
            metrics,
            health_checker,
        })
    }
    
    /// Start the server
    pub async fn start(self) -> Result<()> {
        info!("Starting CBD Enterprise Server...");
        
        let server = Arc::new(self);
        
        // Start gRPC server
        let grpc_server = server.clone();
        let grpc_handle = tokio::spawn(async move {
            if let Err(e) = grpc_server.start_grpc_server().await {
                error!("gRPC server error: {}", e);
            }
        });
        
        // Start REST server
        let rest_server = server.clone();
        let rest_handle = tokio::spawn(async move {
            if let Err(e) = rest_server.start_rest_server().await {
                error!("REST server error: {}", e);
            }
        });
        
        // Start admin server
        let admin_server = server.clone();
        let admin_handle = tokio::spawn(async move {
            if let Err(e) = admin_server.start_admin_server().await {
                error!("Admin server error: {}", e);
            }
        });
        
        // Start health checker
        let health_server = server.clone();
        let health_handle = tokio::spawn(async move {
            health_server.start_health_checker().await;
        });
        
        info!("CBD Enterprise Server started successfully");
        info!("gRPC server listening on {}:{}", server.config.server.bind_address, server.config.server.grpc_port);
        info!("REST server listening on {}:{}", server.config.server.bind_address, server.config.server.rest_port);
        info!("Admin server listening on {}:{}", server.config.server.bind_address, server.config.server.admin_port);
        
        // Wait for all servers
        let _ = tokio::try_join!(grpc_handle, rest_handle, admin_handle, health_handle);
        
        Ok(())
    }
    
    /// Start gRPC server
    async fn start_grpc_server(&self) -> Result<()> {
        use cbd_service::*;
        
        let addr = format!("{}:{}", self.config.server.bind_address, self.config.server.grpc_port)
            .parse()
            .context("Invalid gRPC server address")?;
        
        // Create security manager with default config
        let security = Arc::new(
            EnterpriseSecurityManager::new(cbd_security::SecurityConfig::default())?
        );
        
        let service = CBDService::new(
            Arc::clone(&self.engine),
            security,
            Arc::clone(&self.metrics),
        );
        
        let svc = cbd_server::CbdServer::new(service)
            .max_decoding_message_size(self.config.grpc.max_message_size)
            .max_encoding_message_size(self.config.grpc.max_message_size);
        
        info!("Starting gRPC server on {}", addr);
        
        Server::builder()
            .add_service(svc)
            .serve(addr)
            .await
            .context("Failed to start gRPC server")?;
        
        Ok(())
    }
    
    /// Start REST server
    async fn start_rest_server(&self) -> Result<()> {
        use rest_handlers::*;
        
        let addr = format!("{}:{}", self.config.server.bind_address, self.config.server.rest_port);
        let listener = TcpListener::bind(&addr).await
            .context("Failed to bind REST server")?;
        
        // Create security manager with default config
        let security = Arc::new(
            EnterpriseSecurityManager::new(cbd_security::SecurityConfig::default())?
        );
        
        let state = AppState {
            engine: Arc::clone(&self.engine),
            security,
            metrics: Arc::clone(&self.metrics),
        };
        
        let app = create_router(state);
        
        info!("Starting REST server on {}", addr);
        
        axum::serve(listener, app)
            .await
            .context("Failed to start REST server")?;
        
        Ok(())
    }
    
    /// Start admin server
    async fn start_admin_server(&self) -> Result<()> {
        let addr = format!("{}:{}", self.config.server.bind_address, self.config.server.admin_port);
        let listener = TcpListener::bind(&addr).await
            .context("Failed to bind admin server")?;
        
        let health_checker = Arc::clone(&self.health_checker);
        
        let app = Router::new()
            .route("/admin/health", get({
                let health_checker = Arc::clone(&health_checker);
                move || async move {
                    match health_checker.check_health().await {
                        Ok(status) => (StatusCode::OK, Json(status)),
                        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({
                            "error": format!("Health check failed: {}", e)
                        }))),
                    }
                }
            }))
            .route("/admin/shutdown", post(|| async {
                // TODO: Implement graceful shutdown
                (StatusCode::OK, Json(serde_json::json!({"message": "Shutdown initiated"})))
            }));
        
        info!("Starting admin server on {}", addr);
        
        axum::serve(listener, app)
            .await
            .context("Failed to start admin server")?;
        
        Ok(())
    }
    
    /// Start health checker
    async fn start_health_checker(&self) {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(30));
        
        loop {
            interval.tick().await;
            
            if let Err(e) = self.health_checker.check_health().await {
                error!("Health check failed: {}", e);
            }
        }
    }
}

impl HealthChecker {
    fn new(engine: Arc<CBDEngine>, cluster_coordinator: Option<Arc<RaftClusterCoordinator>>) -> Self {
        Self {
            engine,
            cluster_coordinator,
        }
    }
    
    async fn check_health(&self) -> Result<HealthStatus> {
        let mut components = std::collections::HashMap::new();
        
        // Check engine health
        match self.engine.get_stats().await {
            Ok(_) => {
                components.insert("engine".to_string(), ComponentHealth {
                    status: "healthy".to_string(),
                    last_check: chrono::Utc::now().to_rfc3339(),
                    details: None,
                });
            }
            Err(e) => {
                components.insert("engine".to_string(), ComponentHealth {
                    status: "unhealthy".to_string(),
                    last_check: chrono::Utc::now().to_rfc3339(),
                    details: Some(e.to_string()),
                });
            }
        }
        
        // Check cluster health if enabled
        if let Some(cluster) = &self.cluster_coordinator {
            let cluster_state = cluster.get_cluster_state().await;
            components.insert("cluster".to_string(), ComponentHealth {
                status: if cluster_state.leader.is_some() { "healthy" } else { "degraded" }.to_string(),
                last_check: chrono::Utc::now().to_rfc3339(),
                details: Some(format!("Leader: {:?}, Term: {}", cluster_state.leader, cluster_state.term)),
            });
        }
        
        let overall_status = if components.values().all(|c| c.status == "healthy") {
            "healthy"
        } else if components.values().any(|c| c.status == "unhealthy") {
            "unhealthy"
        } else {
            "degraded"
        };
        
        Ok(HealthStatus {
            status: overall_status.to_string(),
            version: env!("CARGO_PKG_VERSION").to_string(),
            uptime_seconds: 0, // TODO: Calculate actual uptime
            components,
        })
    }
}

// Protocol buffer definitions (would normally be in a separate .proto file)
/*
syntax = "proto3";

package cbd;

service Cbd {
  rpc StoreMemory(StoreMemoryRequest) returns (StoreMemoryResponse);
  rpc SearchMemories(SearchMemoriesRequest) returns (SearchMemoriesResponse);
  rpc GetStats(GetStatsRequest) returns (GetStatsResponse);
  rpc HealthCheck(HealthCheckRequest) returns (HealthCheckResponse);
}

message StoreMemoryRequest {
  string key = 1;
  string content = 2;
  repeated float vector = 3;
  optional string metadata = 4;
}

message StoreMemoryResponse {
  bool success = 1;
  string message = 2;
}

message SearchMemoriesRequest {
  repeated float query_vector = 1;
  uint32 limit = 2;
  float threshold = 3;
}

message SearchMemoriesResponse {
  repeated MemoryResult results = 1;
  uint32 total_found = 2;
}

message MemoryResult {
  string key = 1;
  string content = 2;
  float distance = 3;
  string metadata = 4;
}

message GetStatsRequest {}

message GetStatsResponse {
  string node_id = 1;
  string cluster_role = 2;
  uint64 total_operations = 3;
  uint64 active_transactions = 4;
  uint64 total_vectors = 5;
  uint64 index_size_bytes = 6;
}

message HealthCheckRequest {}

message HealthCheckResponse {
  string status = 1;
  string message = 2;
}
*/

// Request/Response types for REST and gRPC compatibility
#[derive(Debug, Serialize, Deserialize)]
pub struct StoreMemoryRequest {
    pub key: String,
    pub content: String,
    pub vector: Vec<f32>,
    pub metadata: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StoreMemoryResponse {
    pub success: bool,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchMemoriesRequest {
    pub query_vector: Vec<f32>,
    pub limit: u32,
    pub threshold: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchMemoriesResponse {
    pub results: Vec<MemoryResult>,
    pub total_found: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MemoryResult {
    pub key: String,
    pub content: String,
    pub distance: f32,
    pub metadata: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetStatsRequest {}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetStatsResponse {
    pub node_id: String,
    pub cluster_role: String,
    pub total_operations: u64,
    pub active_transactions: u64,
    pub total_vectors: u64,
    pub index_size_bytes: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthCheckRequest {}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthCheckResponse {
    pub status: String,
    pub message: String,
}

impl Default for ServerConfig {
    fn default() -> Self {
        Self {
            server: NetworkConfig::default(),
            database: CBDConfig::default(),
            grpc: GrpcConfig::default(),
            rest: RestConfig::default(),
            monitoring: MonitoringConfig::default(),
        }
    }
}

impl Default for NetworkConfig {
    fn default() -> Self {
        Self {
            bind_address: "0.0.0.0".to_string(),
            grpc_port: 8080,
            rest_port: 8081,
            admin_port: 8082,
            max_connections: 1000,
            connection_timeout_secs: 30,
            read_timeout_secs: 30,
            write_timeout_secs: 30,
        }
    }
}

impl Default for GrpcConfig {
    fn default() -> Self {
        Self {
            max_message_size: 16 * 1024 * 1024, // 16MB
            max_concurrent_streams: 100,
            keepalive_interval_secs: 30,
            keepalive_timeout_secs: 5,
            enable_reflection: true,
            enable_health_check: true,
        }
    }
}

impl Default for RestConfig {
    fn default() -> Self {
        Self {
            max_request_size: 16 * 1024 * 1024, // 16MB
            enable_cors: true,
            cors_origins: vec!["*".to_string()],
            enable_swagger: true,
            rate_limit_requests_per_minute: 1000,
        }
    }
}

impl Default for MonitoringConfig {
    fn default() -> Self {
        Self {
            enable_metrics: true,
            metrics_path: "/metrics".to_string(),
            enable_tracing: true,
            jaeger_endpoint: None,
            log_level: "info".to_string(),
        }
    }
}
