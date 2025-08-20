/*!
 * CBD Enterprise Vector Index
 * High-performance HNSW-based vector search with enterprise features
 */

use anyhow::Result;
use cbd_core::{VectorIndex, VectorSearchResult, VectorStats};
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

/// HNSW Vector Index implementation
pub struct HNSWVectorIndex {
    index: Arc<RwLock<InnerIndex>>,
    config: HNSWConfig,
    statistics: Arc<RwLock<IndexStatistics>>,
}

/// Inner index structure
struct InnerIndex {
    dimensions: usize,
    vectors: std::collections::HashMap<String, VectorEntry>,
    graph: HNSWGraph,
    distance_function: DistanceFunction,
}

/// Vector entry with metadata
#[derive(Debug, Clone)]
struct VectorEntry {
    id: String,
    vector: Vec<f32>,
    metadata: Option<Vec<u8>>,
    level: usize,
    connections: std::collections::HashMap<usize, Vec<String>>,
    created_at: std::time::SystemTime,
    updated_at: std::time::SystemTime,
}

/// HNSW graph structure
#[derive(Debug)]
struct HNSWGraph {
    entry_point: Option<String>,
    max_level: usize,
    levels: Vec<GraphLevel>,
}

/// Graph level structure
#[derive(Debug)]
struct GraphLevel {
    level: usize,
    nodes: std::collections::HashMap<String, GraphNode>,
}

/// Graph node
#[derive(Debug, Clone)]
struct GraphNode {
    id: String,
    connections: Vec<Connection>,
    is_entry_point: bool,
}

/// Connection between nodes
#[derive(Debug, Clone)]
struct Connection {
    target_id: String,
    distance: f32,
    weight: f32,
}

/// HNSW configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HNSWConfig {
    pub dimensions: usize,
    pub max_connections: usize,
    pub max_connections_level0: usize,
    pub ef_construction: usize,
    pub ef_search: usize,
    pub ml: f32,
    pub distance_metric: DistanceMetric,
    pub enable_pruning: bool,
    pub enable_caching: bool,
    pub cache_size: usize,
    pub parallel_search: bool,
    pub max_search_threads: usize,
}

/// Distance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DistanceMetric {
    Euclidean,
    Cosine,
    InnerProduct,
    Manhattan,
    Hamming,
}

/// Distance function type
type DistanceFunction = fn(&[f32], &[f32]) -> f32;

/// Index statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
struct IndexStatistics {
    total_vectors: u64,
    dimensions: usize,
    index_size_bytes: u64,
    memory_usage_bytes: u64,
    search_requests: u64,
    insert_requests: u64,
    update_requests: u64,
    delete_requests: u64,
    avg_search_time_ms: f64,
    avg_insert_time_ms: f64,
    cache_hits: u64,
    cache_misses: u64,
    index_created_at: std::time::SystemTime,
    last_updated_at: std::time::SystemTime,
}

/// Search result cache
#[derive(Debug)]
#[allow(dead_code)]
struct SearchCache {
    cache: std::collections::HashMap<SearchCacheKey, CachedResult>,
    max_size: usize,
    hits: u64,
    misses: u64,
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
#[allow(dead_code)]
struct SearchCacheKey {
    query_hash: u64,
    k: usize,
    threshold: u32, // f32 as u32 for hashing
}

#[derive(Debug, Clone)]
#[allow(dead_code)]
struct CachedResult {
    results: Vec<VectorSearchResult>,
    timestamp: std::time::SystemTime,
    ttl: std::time::Duration,
}

impl HNSWVectorIndex {
    /// Create new HNSW vector index
    pub fn new(config: HNSWConfig) -> Self {
        let distance_function = match config.distance_metric {
            DistanceMetric::Euclidean => euclidean_distance,
            DistanceMetric::Cosine => cosine_distance,
            DistanceMetric::InnerProduct => inner_product_distance,
            DistanceMetric::Manhattan => manhattan_distance,
            DistanceMetric::Hamming => hamming_distance,
        };

        let inner_index = InnerIndex {
            dimensions: config.dimensions,
            vectors: std::collections::HashMap::new(),
            graph: HNSWGraph {
                entry_point: None,
                max_level: 0,
                levels: Vec::new(),
            },
            distance_function,
        };

        let statistics = IndexStatistics {
            total_vectors: 0,
            dimensions: config.dimensions,
            index_size_bytes: 0,
            memory_usage_bytes: 0,
            search_requests: 0,
            insert_requests: 0,
            update_requests: 0,
            delete_requests: 0,
            avg_search_time_ms: 0.0,
            avg_insert_time_ms: 0.0,
            cache_hits: 0,
            cache_misses: 0,
            index_created_at: std::time::SystemTime::now(),
            last_updated_at: std::time::SystemTime::now(),
        };

        Self {
            index: Arc::new(RwLock::new(inner_index)),
            config,
            statistics: Arc::new(RwLock::new(statistics)),
        }
    }

    /// Initialize the index
    pub async fn initialize(&self) -> Result<()> {
        tracing::info!(
            "Initializing HNSW vector index with {} dimensions",
            self.config.dimensions
        );

        // Initialize graph levels
        let mut index = self.index.write().await;
        for level in 0..=16 {
            // Maximum 16 levels
            index.graph.levels.push(GraphLevel {
                level,
                nodes: std::collections::HashMap::new(),
            });
        }

        tracing::info!("HNSW vector index initialized successfully");
        Ok(())
    }

    /// Select level for new node
    fn select_level(&self) -> usize {
        let mut rng = rand::thread_rng();
        let level = (-rng.gen::<f32>().ln() * self.config.ml) as usize;
        level.min(15) // Cap at level 15
    }

    /// Get M connections for level
    fn get_m(&self, level: usize) -> usize {
        if level == 0 {
            self.config.max_connections_level0
        } else {
            self.config.max_connections
        }
    }

    /// Search for entry points at level
    async fn search_layer(
        &self,
        query: &[f32],
        entry_points: Vec<String>,
        num_closest: usize,
        level: usize,
    ) -> Result<Vec<(String, f32)>> {
        let index = self.index.read().await;
        let mut visited = std::collections::HashSet::new();
        let mut candidates = std::collections::BinaryHeap::new();
        let mut result = std::collections::BinaryHeap::new();

        // Initialize with entry points
        for ep in entry_points {
            if let Some(entry) = index.vectors.get(&ep) {
                let distance = (index.distance_function)(query, &entry.vector);
                candidates.push(std::cmp::Reverse((
                    ordered_float::OrderedFloat(distance),
                    ep.clone(),
                )));
                result.push((ordered_float::OrderedFloat(distance), ep.clone()));
                visited.insert(ep);
            }
        }

        while let Some(std::cmp::Reverse((current_dist, current_id))) = candidates.pop() {
            // If current distance is farther than the worst in result, break
            if result.len() >= num_closest {
                if let Some((worst_dist, _)) = result.peek() {
                    if current_dist > *worst_dist {
                        break;
                    }
                }
            }

            // Explore neighbors
            if let Some(current_entry) = index.vectors.get(&current_id) {
                if let Some(connections) = current_entry.connections.get(&level) {
                    for neighbor_id in connections {
                        if !visited.contains(neighbor_id) {
                            visited.insert(neighbor_id.clone());

                            if let Some(neighbor) = index.vectors.get(neighbor_id) {
                                let distance = (index.distance_function)(query, &neighbor.vector);
                                let dist_f = ordered_float::OrderedFloat(distance);

                                if result.len() < num_closest {
                                    candidates
                                        .push(std::cmp::Reverse((dist_f, neighbor_id.clone())));
                                    result.push((dist_f, neighbor_id.clone()));
                                } else if let Some((worst_dist, _)) = result.peek() {
                                    if dist_f < *worst_dist {
                                        result.pop();
                                        result.push((dist_f, neighbor_id.clone()));
                                        candidates
                                            .push(std::cmp::Reverse((dist_f, neighbor_id.clone())));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Convert result to sorted vector
        let mut sorted_result: Vec<_> = result
            .into_iter()
            .map(|(dist, id)| (id, dist.into_inner()))
            .collect();
        sorted_result.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));

        Ok(sorted_result)
    }

    /// Select neighbors using heuristic
    fn select_neighbors_heuristic(&self, candidates: Vec<(String, f32)>, m: usize) -> Vec<String> {
        if candidates.len() <= m {
            return candidates.into_iter().map(|(id, _)| id).collect();
        }

        // Simple heuristic: select M closest
        let mut sorted = candidates;
        sorted.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
        sorted.into_iter().take(m).map(|(id, _)| id).collect()
    }

    /// Prune connections if enabled
    async fn prune_connections(&self, node_id: &str, level: usize) -> Result<()> {
        if !self.config.enable_pruning {
            return Ok(());
        }

        let mut index = self.index.write().await;
        let m = self.get_m(level);

        // Get the query vector first
        let query_vector = if let Some(node) = index.vectors.get(node_id) {
            node.vector.clone()
        } else {
            return Ok(());
        };

        // Get connection IDs to avoid borrowing conflict
        let connection_ids = if let Some(node) = index.vectors.get(node_id) {
            if let Some(connections) = node.connections.get(&level) {
                if connections.len() > m {
                    connections.clone()
                } else {
                    return Ok(()); // Nothing to prune
                }
            } else {
                return Ok(());
            }
        } else {
            return Ok(());
        };

        // Calculate distances without holding mutable reference
        let mut connection_distances: Vec<_> = connection_ids
            .iter()
            .filter_map(|conn_id| {
                index.vectors.get(conn_id).map(|conn_node| {
                    let distance = (index.distance_function)(&query_vector, &conn_node.vector);
                    (conn_id.clone(), distance)
                })
            })
            .collect();

        connection_distances
            .sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));

        // Now update the connections
        if let Some(node) = index.vectors.get_mut(node_id) {
            if let Some(connections) = node.connections.get_mut(&level) {
                *connections = connection_distances
                    .into_iter()
                    .take(m)
                    .map(|(id, _)| id)
                    .collect();
            }
        }

        Ok(())
    }
}

#[async_trait::async_trait]
impl VectorIndex for HNSWVectorIndex {
    async fn initialize(&self) -> Result<()> {
        // Initialize the index structure
        let mut index = self.index.write().await;

        // Verify dimensions are valid
        if index.dimensions == 0 {
            return Err(anyhow::anyhow!("Invalid vector dimensions"));
        }

        // Initialize graph levels
        index.graph.levels = (0..16)
            .map(|level| GraphLevel {
                level,
                nodes: std::collections::HashMap::new(),
            })
            .collect();

        // Initialize statistics
        let mut stats = self.statistics.write().await;
        stats.index_created_at = std::time::SystemTime::now();
        stats.last_updated_at = std::time::SystemTime::now();

        Ok(())
    }

    async fn add_vector(&self, id: &str, vector: &[f32], metadata: Option<&[u8]>) -> Result<()> {
        let start_time = std::time::Instant::now();

        if vector.len() != self.config.dimensions {
            return Err(anyhow::anyhow!(
                "Vector dimension mismatch: expected {}, got {}",
                self.config.dimensions,
                vector.len()
            ));
        }

        let level = self.select_level();
        let entry = VectorEntry {
            id: id.to_string(),
            vector: vector.to_vec(),
            metadata: metadata.map(|m| m.to_vec()),
            level,
            connections: std::collections::HashMap::new(),
            created_at: std::time::SystemTime::now(),
            updated_at: std::time::SystemTime::now(),
        };

        // Insert vector
        {
            let mut index = self.index.write().await;

            // Initialize connections for all levels
            for l in 0..=level {
                index
                    .vectors
                    .entry(id.to_string())
                    .or_insert_with(|| entry.clone())
                    .connections
                    .insert(l, Vec::new());
            }

            // If this is the first vector, make it the entry point
            if index.graph.entry_point.is_none() {
                index.graph.entry_point = Some(id.to_string());
                index.graph.max_level = level;
            }

            index.vectors.insert(id.to_string(), entry);
        }

        // Connect to graph
        self.connect_to_graph(id, level).await?;

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.total_vectors += 1;
            stats.insert_requests += 1;
            stats.avg_insert_time_ms = (stats.avg_insert_time_ms
                * (stats.insert_requests - 1) as f64
                + start_time.elapsed().as_millis() as f64)
                / stats.insert_requests as f64;
        }

        tracing::debug!("Added vector {} at level {}", id, level);
        Ok(())
    }

    async fn search(
        &self,
        query: &[f32],
        k: usize,
        threshold: f32,
    ) -> Result<Vec<VectorSearchResult>> {
        let start_time = std::time::Instant::now();

        if query.len() != self.config.dimensions {
            return Err(anyhow::anyhow!(
                "Query dimension mismatch: expected {}, got {}",
                self.config.dimensions,
                query.len()
            ));
        }

        // Check cache if enabled
        if self.config.enable_caching {
            // TODO: Implement search cache
        }

        let entry_point = {
            let index = self.index.read().await;
            match &index.graph.entry_point {
                Some(ep) => ep.clone(),
                None => return Ok(Vec::new()), // Empty index
            }
        };

        // Search from top level down to level 1
        let mut current_closest = vec![entry_point];
        let max_level = {
            let index = self.index.read().await;
            index.graph.max_level
        };

        for level in (1..=max_level).rev() {
            current_closest = self
                .search_layer(query, current_closest, 1, level)
                .await?
                .into_iter()
                .map(|(id, _)| id)
                .collect();
        }

        // Search at level 0 with ef
        let candidates = self
            .search_layer(query, current_closest, self.config.ef_search.max(k), 0)
            .await?;

        // Filter by threshold and return top k
        let mut results = Vec::new();
        for (id, distance) in candidates.into_iter().take(k) {
            if distance <= threshold {
                let index = self.index.read().await;
                if let Some(entry) = index.vectors.get(&id) {
                    results.push(VectorSearchResult {
                        id,
                        distance,
                        metadata: entry.metadata.clone(),
                    });
                }
            }
        }

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            stats.search_requests += 1;
            stats.avg_search_time_ms = (stats.avg_search_time_ms
                * (stats.search_requests - 1) as f64
                + start_time.elapsed().as_millis() as f64)
                / stats.search_requests as f64;
        }

        tracing::debug!(
            "Search completed: {} results in {:?}",
            results.len(),
            start_time.elapsed()
        );
        Ok(results)
    }

    async fn remove_vector(&self, id: &str) -> Result<()> {
        let mut index = self.index.write().await;

        // Remove connections to this vector from other vectors
        let levels_to_clean: Vec<usize> = if let Some(entry) = index.vectors.get(id) {
            entry.connections.keys().cloned().collect()
        } else {
            return Ok(()); // Vector doesn't exist
        };

        for level in levels_to_clean {
            let connections_to_update: Vec<String> = index
                .vectors
                .iter()
                .filter_map(|(other_id, other_entry)| {
                    if other_id != id {
                        if let Some(connections) = other_entry.connections.get(&level) {
                            if connections.contains(&id.to_string()) {
                                return Some(other_id.clone());
                            }
                        }
                    }
                    None
                })
                .collect();

            for other_id in connections_to_update {
                if let Some(other_entry) = index.vectors.get_mut(&other_id) {
                    if let Some(connections) = other_entry.connections.get_mut(&level) {
                        connections.retain(|conn_id| conn_id != id);
                    }
                }
            }
        }

        // Update entry point if necessary
        if index.graph.entry_point.as_ref() == Some(&id.to_string()) {
            // Find new entry point
            index.graph.entry_point = index
                .vectors
                .keys()
                .find(|&key| key != id)
                .cloned();
        }

        // Remove the vector
        index.vectors.remove(id);

        // Update statistics
        {
            let mut stats = self.statistics.write().await;
            if stats.total_vectors > 0 {
                stats.total_vectors -= 1;
            }
            stats.delete_requests += 1;
        }

        tracing::debug!("Removed vector {}", id);
        Ok(())
    }

    async fn update_vector(&self, id: &str, vector: &[f32], metadata: Option<&[u8]>) -> Result<()> {
        // Remove old vector and add new one
        self.remove_vector(id).await?;
        self.add_vector(id, vector, metadata).await?;

        let mut stats = self.statistics.write().await;
        stats.update_requests += 1;

        Ok(())
    }

    async fn get_stats(&self) -> Result<VectorStats> {
        let stats = self.statistics.read().await;

        Ok(VectorStats {
            total_vectors: stats.total_vectors,
            dimensions: stats.dimensions,
            index_size_bytes: stats.index_size_bytes,
            memory_usage_bytes: stats.memory_usage_bytes,
        })
    }
}

impl HNSWVectorIndex {
    /// Connect new vector to the graph
    async fn connect_to_graph(&self, id: &str, level: usize) -> Result<()> {
        let index = self.index.read().await;
        let entry_points = match &index.graph.entry_point {
            Some(ep) => vec![ep.clone()],
            None => return Ok(()),
        };
        drop(index);

        // Connect at each level from top down to 0
        for lev in (0..=level).rev() {
            let m = self.get_m(lev);
            let candidates = self
                .search_layer(
                    &{
                        let index = self.index.read().await;
                        index.vectors.get(id).unwrap().vector.clone()
                    },
                    entry_points.clone(),
                    self.config.ef_construction,
                    lev,
                )
                .await?;

            let neighbors = self.select_neighbors_heuristic(candidates, m);
            let neighbors_clone = neighbors.clone();

            // Add bidirectional connections
            {
                let mut index = self.index.write().await;

                // Add connections from new node to neighbors
                if let Some(entry) = index.vectors.get_mut(id) {
                    entry.connections.insert(lev, neighbors);
                }

                // Add connections from neighbors to new node
                for neighbor_id in &neighbors_clone {
                    if let Some(neighbor) = index.vectors.get_mut(neighbor_id) {
                        if let Some(neighbor_connections) = neighbor.connections.get_mut(&lev) {
                            neighbor_connections.push(id.to_string());
                        }
                    }
                }
            }

            // Prune connections if necessary
            self.prune_connections(id, lev).await?;
            for neighbor_id in &neighbors_clone {
                self.prune_connections(neighbor_id, lev).await?;
            }
        }

        Ok(())
    }
}

// Distance functions
fn euclidean_distance(a: &[f32], b: &[f32]) -> f32 {
    a.iter()
        .zip(b.iter())
        .map(|(x, y)| (x - y).powi(2))
        .sum::<f32>()
        .sqrt()
}

fn cosine_distance(a: &[f32], b: &[f32]) -> f32 {
    let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x.powi(2)).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x.powi(2)).sum::<f32>().sqrt();

    if norm_a == 0.0 || norm_b == 0.0 {
        1.0 // Maximum distance
    } else {
        1.0 - (dot_product / (norm_a * norm_b))
    }
}

fn inner_product_distance(a: &[f32], b: &[f32]) -> f32 {
    -a.iter().zip(b.iter()).map(|(x, y)| x * y).sum::<f32>()
}

fn manhattan_distance(a: &[f32], b: &[f32]) -> f32 {
    a.iter().zip(b.iter()).map(|(x, y)| (x - y).abs()).sum()
}

fn hamming_distance(a: &[f32], b: &[f32]) -> f32 {
    a.iter()
        .zip(b.iter())
        .map(|(x, y)| if x != y { 1.0 } else { 0.0 })
        .sum()
}

impl HNSWVectorIndex {
    /// Get vector entry details for debugging/monitoring
    pub async fn get_vector_details(&self, id: &str) -> Result<Option<(String, usize, std::time::SystemTime, std::time::SystemTime)>> {
        let index = self.index.read().await;
        if let Some(entry) = index.vectors.get(id) {
            Ok(Some((entry.id.clone(), entry.level, entry.created_at, entry.updated_at)))
        } else {
            Ok(None)
        }
    }

    /// Get graph level statistics for monitoring
    pub async fn get_level_stats(&self, level: usize) -> Result<Option<(usize, usize)>> {
        let index = self.index.read().await;
        if level < index.graph.levels.len() {
            let graph_level = &index.graph.levels[level];
            Ok(Some((graph_level.level, graph_level.nodes.len())))
        } else {
            Ok(None)
        }
    }

    /// Get node connection details for debugging
    pub async fn get_node_details(&self, id: &str, level: usize) -> Result<Option<(String, usize, bool)>> {
        let index = self.index.read().await;
        if level < index.graph.levels.len() {
            if let Some(node) = index.graph.levels[level].nodes.get(id) {
                Ok(Some((node.id.clone(), node.connections.len(), node.is_entry_point)))
            } else {
                Ok(None)
            }
        } else {
            Ok(None)
        }
    }

    /// Get connection details between nodes
    pub async fn get_connection_info(&self, id: &str, level: usize) -> Result<Vec<(String, f32, f32)>> {
        let index = self.index.read().await;
        if level < index.graph.levels.len() {
            if let Some(node) = index.graph.levels[level].nodes.get(id) {
                let connections = node.connections.iter()
                    .map(|conn| (conn.target_id.clone(), conn.distance, conn.weight))
                    .collect();
                return Ok(connections);
            }
        }
        Ok(vec![])
    }
}

impl Default for HNSWConfig {
    fn default() -> Self {
        Self {
            dimensions: 1536, // OpenAI embedding dimensions
            max_connections: 16,
            max_connections_level0: 32,
            ef_construction: 200,
            ef_search: 50,
            ml: 1.0 / (2.0_f32.ln()),
            distance_metric: DistanceMetric::Cosine,
            enable_pruning: true,
            enable_caching: true,
            cache_size: 10000,
            parallel_search: true,
            max_search_threads: num_cpus::get(),
        }
    }
}
