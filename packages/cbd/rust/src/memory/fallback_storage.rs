// CBD Enterprise Engine - Fallback Memory Storage
// 
// This module provides local SQLite-based memory storage as a fallback
// when MemoraiMCP is unavailable, ensuring uninterrupted memory operations.

use crate::error::{CBDError, Result};
use crate::memory::{MemoryEntry, MemoryMetadata, MemoryQuery, MemorySearchResult, ContextInfo, MemoryStats, MemoryPriority};
use rusqlite::{params, Connection, Result as SqliteResult, Row};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, error, info, warn};
use serde_json;
use uuid::Uuid;

/// SQLite-based fallback storage for memory operations
pub struct FallbackStorage {
    db_path: PathBuf,
    connection: Arc<RwLock<Connection>>,
    max_memories: usize,
    memory_count: Arc<RwLock<usize>>,
}

impl FallbackStorage {
    /// Create a new fallback storage instance
    pub async fn new(storage_path: &str, max_memories: usize) -> Result<Self> {
        info!("Initializing fallback storage at: {}", storage_path);
        
        let db_path = Path::new(storage_path);
        
        // Create directory if it doesn't exist
        if let Some(parent) = db_path.parent() {
            tokio::fs::create_dir_all(parent).await
                .map_err(|e| CBDError::Storage(format!("Failed to create storage directory: {}", e)))?;
        }
        
        let db_file = db_path.join("cbd_memory.db");
        let connection = Connection::open(&db_file)
            .map_err(|e| CBDError::Storage(format!("Failed to open database: {}", e)))?;
        
        let storage = Self {
            db_path: db_file,
            connection: Arc::new(RwLock::new(connection)),
            max_memories,
            memory_count: Arc::new(RwLock::new(0)),
        };
        
        // Initialize database schema
        storage.initialize_schema().await?;
        
        // Update memory count
        storage.update_memory_count().await?;
        
        info!("Fallback storage initialized with {} existing memories", 
               *storage.memory_count.read().await);
        
        Ok(storage)
    }
    
    /// Initialize database schema
    async fn initialize_schema(&self) -> Result<()> {
        debug!("Initializing database schema");
        
        let conn = self.connection.write().await;
        
        // Create memories table
        conn.execute(
            r#"
            CREATE TABLE IF NOT EXISTS memories (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                priority INTEGER NOT NULL,
                importance REAL NOT NULL,
                tags TEXT, -- JSON array
                session_id TEXT,
                project_id TEXT,
                context TEXT, -- JSON object
                embedding BLOB,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                access_count INTEGER DEFAULT 0,
                last_accessed TEXT
            )
            "#,
            [],
        ).map_err(|e| CBDError::Storage(format!("Failed to create memories table: {}", e)))?;
        
        // Create indexes for better performance
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_memories_agent_id ON memories(agent_id)",
            [],
        ).map_err(|e| CBDError::Storage(format!("Failed to create agent_id index: {}", e)))?;
        
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_memories_entity_type ON memories(entity_type)",
            [],
        ).map_err(|e| CBDError::Storage(format!("Failed to create entity_type index: {}", e)))?;
        
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at)",
            [],
        ).map_err(|e| CBDError::Storage(format!("Failed to create created_at index: {}", e)))?;
        
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_memories_session_id ON memories(session_id)",
            [],
        ).map_err(|e| CBDError::Storage(format!("Failed to create session_id index: {}", e)))?;
        
        // Create full-text search index for content
        conn.execute(
            r#"
            CREATE VIRTUAL TABLE IF NOT EXISTS memories_fts USING fts5(
                id UNINDEXED,
                content,
                tags,
                content='memories',
                content_rowid='rowid'
            )
            "#,
            [],
        ).map_err(|e| CBDError::Storage(format!("Failed to create FTS index: {}", e)))?;
        
        // Create trigger to keep FTS index updated
        conn.execute(
            r#"
            CREATE TRIGGER IF NOT EXISTS memories_fts_insert AFTER INSERT ON memories
            BEGIN
                INSERT INTO memories_fts(rowid, id, content, tags)
                VALUES (new.rowid, new.id, new.content, new.tags);
            END
            "#,
            [],
        ).map_err(|e| CBDError::Storage(format!("Failed to create FTS insert trigger: {}", e)))?;
        
        conn.execute(
            r#"
            CREATE TRIGGER IF NOT EXISTS memories_fts_delete AFTER DELETE ON memories
            BEGIN
                DELETE FROM memories_fts WHERE rowid = old.rowid;
            END
            "#,
            [],
        ).map_err(|e| CBDError::Storage(format!("Failed to create FTS delete trigger: {}", e)))?;
        
        conn.execute(
            r#"
            CREATE TRIGGER IF NOT EXISTS memories_fts_update AFTER UPDATE ON memories
            BEGIN
                DELETE FROM memories_fts WHERE rowid = old.rowid;
                INSERT INTO memories_fts(rowid, id, content, tags)
                VALUES (new.rowid, new.id, new.content, new.tags);
            END
            "#,
            [],
        ).map_err(|e| CBDError::Storage(format!("Failed to create FTS update trigger: {}", e)))?;
        
        info!("Database schema initialized successfully");
        Ok(())
    }
    
    /// Update memory count cache
    async fn update_memory_count(&self) -> Result<()> {
        let conn = self.connection.read().await;
        let count: usize = conn.query_row(
            "SELECT COUNT(*) FROM memories",
            [],
            |row| Ok(row.get(0)?),
        ).map_err(|e| CBDError::Storage(format!("Failed to count memories: {}", e)))?;
        
        *self.memory_count.write().await = count;
        Ok(())
    }
    
    /// Store a memory entry
    pub async fn store_memory(&self, content: &str, agent_id: &str, metadata: MemoryMetadata) -> Result<String> {
        debug!("Storing memory for agent: {} (content length: {})", agent_id, content.len());
        
        // Check if we need to make space
        let current_count = *self.memory_count.read().await;
        if current_count >= self.max_memories {
            self.cleanup_old_memories().await?;
        }
        
        let memory_id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now();
        
        let tags_json = serde_json::to_string(&metadata.tags)
            .map_err(|e| CBDError::Serialization(format!("Failed to serialize tags: {}", e)))?;
        
        let context_json = serde_json::to_string(&metadata.context)
            .map_err(|e| CBDError::Serialization(format!("Failed to serialize context: {}", e)))?;
        
        let priority_value = match metadata.priority {
            MemoryPriority::Low => 1,
            MemoryPriority::Medium => 2,
            MemoryPriority::High => 3,
            MemoryPriority::Critical => 4,
        };
        
        {
            let conn = self.connection.write().await;
            conn.execute(
                r#"
                INSERT INTO memories (
                    id, content, agent_id, entity_type, priority, importance,
                    tags, session_id, project_id, context, created_at, updated_at
                ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
                "#,
                params![
                    memory_id,
                    content,
                    agent_id,
                    metadata.entity_type,
                    priority_value,
                    metadata.importance,
                    tags_json,
                    metadata.session_id,
                    metadata.project_id,
                    context_json,
                    now.to_rfc3339(),
                    now.to_rfc3339()
                ],
            ).map_err(|e| CBDError::Storage(format!("Failed to insert memory: {}", e)))?;
        }
        
        // Update memory count
        *self.memory_count.write().await += 1;
        
        info!("Memory stored successfully: {}", memory_id);
        Ok(memory_id)
    }
    
    /// Search memories by content and metadata
    pub async fn search_memories(&self, query: &str, agent_id: &str, limit: Option<usize>) -> Result<Vec<MemorySearchResult>> {
        debug!("Searching memories for query: '{}' (agent: {})", query, agent_id);
        
        let limit = limit.unwrap_or(50).min(500); // Cap at 500 results
        
        let conn = self.connection.read().await;
        
        // Use FTS for content search
        let mut stmt = conn.prepare(
            r#"
            SELECT m.*, snippet(memories_fts, 1, '<b>', '</b>', '...', 10) as snippet,
                   bm25(memories_fts) as rank
            FROM memories_fts
            JOIN memories m ON memories_fts.rowid = m.rowid
            WHERE memories_fts MATCH ?1 AND m.agent_id = ?2
            ORDER BY rank
            LIMIT ?3
            "#,
        ).map_err(|e| CBDError::Storage(format!("Failed to prepare search query: {}", e)))?;
        
        let memory_rows = stmt.query_map(params![query, agent_id, limit], |row| {
            Ok(self.row_to_memory_result(row))
        }).map_err(|e| CBDError::Storage(format!("Failed to execute search: {}", e)))?;
        
        let mut results = Vec::new();
        for row_result in memory_rows {
            match row_result {
                Ok(Ok(memory_result)) => results.push(memory_result),
                Ok(Err(e)) => {
                    warn!("Failed to parse memory result: {}", e);
                }
                Err(e) => {
                    error!("Database error during search: {}", e);
                }
            }
        }
        
        info!("Found {} memories for search query", results.len());
        Ok(results)
    }
    
    /// Advanced search with query parameters
    pub async fn advanced_search(&self, query: &MemoryQuery) -> Result<Vec<MemorySearchResult>> {
        debug!("Performing advanced search for agent: {}", query.agent_id);
        
        let limit = query.limit.unwrap_or(50).min(500);
        
        // Build dynamic query
        let mut sql = String::from(
            r#"
            SELECT m.*, 0.5 as similarity_score
            FROM memories m
            WHERE m.agent_id = ?1
            "#
        );
        
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(query.agent_id.clone())];
        let mut param_index = 2;
        
        // Add content search if query is not empty
        if !query.query.trim().is_empty() {
            sql.push_str(&format!(
                " AND EXISTS (SELECT 1 FROM memories_fts WHERE memories_fts.rowid = m.rowid AND memories_fts MATCH ?{})",
                param_index
            ));
            params.push(Box::new(query.query.clone()));
            param_index += 1;
        }
        
        // Add project filter
        if let Some(ref project_id) = query.project_id {
            sql.push_str(&format!(" AND m.project_id = ?{}", param_index));
            params.push(Box::new(project_id.clone()));
            param_index += 1;
        }
        
        // Add session filter
        if let Some(ref session_id) = query.session_id {
            sql.push_str(&format!(" AND m.session_id = ?{}", param_index));
            params.push(Box::new(session_id.clone()));
            param_index += 1;
        }
        
        // Add entity type filter
        if let Some(ref entity_type) = query.entity_type {
            sql.push_str(&format!(" AND m.entity_type = ?{}", param_index));
            params.push(Box::new(entity_type.clone()));
            param_index += 1;
        }
        
        // Add priority filter
        if let Some(ref priority) = query.priority {
            let priority_value = match priority {
                MemoryPriority::Low => 1,
                MemoryPriority::Medium => 2,
                MemoryPriority::High => 3,
                MemoryPriority::Critical => 4,
            };
            sql.push_str(&format!(" AND m.priority >= ?{}", param_index));
            params.push(Box::new(priority_value));
            param_index += 1;
        }
        
        // Add time range filter
        if let Some((start_time, end_time)) = &query.time_range {
            sql.push_str(&format!(" AND m.created_at >= ?{} AND m.created_at <= ?{}", param_index, param_index + 1));
            params.push(Box::new(start_time.to_rfc3339()));
            params.push(Box::new(end_time.to_rfc3339()));
            param_index += 2;
        }
        
        // Add ordering and limit
        sql.push_str(" ORDER BY m.importance DESC, m.created_at DESC");
        sql.push_str(&format!(" LIMIT ?{}", param_index));
        params.push(Box::new(limit));
        
        let conn = self.connection.read().await;
        let mut stmt = conn.prepare(&sql)
            .map_err(|e| CBDError::Storage(format!("Failed to prepare advanced search: {}", e)))?;
        
        // Convert params to references
        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();
        
        let memory_rows = stmt.query_map(&param_refs[..], |row| {
            Ok(self.row_to_memory_result(row))
        }).map_err(|e| CBDError::Storage(format!("Failed to execute advanced search: {}", e)))?;
        
        let mut results = Vec::new();
        for row_result in memory_rows {
            match row_result {
                Ok(Ok(memory_result)) => results.push(memory_result),
                Ok(Err(e)) => {
                    warn!("Failed to parse memory result: {}", e);
                }
                Err(e) => {
                    error!("Database error during advanced search: {}", e);
                }
            }
        }
        
        info!("Advanced search found {} memories", results.len());
        Ok(results)
    }
    
    /// Get context information for an agent
    pub async fn get_context(&self, agent_id: &str, context_size: Option<usize>) -> Result<ContextInfo> {
        debug!("Getting context for agent: {}", agent_id);
        
        let limit = context_size.unwrap_or(50).min(200);
        
        let conn = self.connection.read().await;
        let mut stmt = conn.prepare(
            r#"
            SELECT * FROM memories
            WHERE agent_id = ?1
            ORDER BY importance DESC, created_at DESC
            LIMIT ?2
            "#,
        ).map_err(|e| CBDError::Storage(format!("Failed to prepare context query: {}", e)))?;
        
        let memory_rows = stmt.query_map(params![agent_id, limit], |row| {
            Ok(self.row_to_memory_entry(row))
        }).map_err(|e| CBDError::Storage(format!("Failed to execute context query: {}", e)))?;
        
        let mut memories = Vec::new();
        for row_result in memory_rows {
            match row_result {
                Ok(Ok(memory)) => memories.push(memory),
                Ok(Err(e)) => {
                    warn!("Failed to parse memory entry: {}", e);
                }
                Err(e) => {
                    error!("Database error during context query: {}", e);
                }
            }
        }
        
        // Build context info
        let key_insights = self.extract_key_insights(&memories).await?;
        let relevant_entities = self.extract_relevant_entities(&memories).await?;
        let session_context = self.build_session_context(&memories).await?;
        let summary = format!("Context contains {} memories for agent {}", memories.len(), agent_id);
        
        let context = ContextInfo {
            memories,
            summary,
            key_insights,
            relevant_entities,
            session_context,
            recommendations: vec![
                "Review recent high-priority memories".to_string(),
                "Consider archiving old memories".to_string(),
            ],
        };
        
        info!("Built context with {} memories", context.memories.len());
        Ok(context)
    }
    
    /// Delete a memory
    pub async fn delete_memory(&self, memory_id: &str, agent_id: &str) -> Result<bool> {
        debug!("Deleting memory: {} (agent: {})", memory_id, agent_id);
        
        let conn = self.connection.write().await;
        let rows_affected = conn.execute(
            "DELETE FROM memories WHERE id = ?1 AND agent_id = ?2",
            params![memory_id, agent_id],
        ).map_err(|e| CBDError::Storage(format!("Failed to delete memory: {}", e)))?;
        
        if rows_affected > 0 {
            *self.memory_count.write().await -= 1;
            info!("Memory deleted successfully: {}", memory_id);
            Ok(true)
        } else {
            warn!("Memory not found or not owned by agent: {}", memory_id);
            Ok(false)
        }
    }
    
    /// Get memory statistics
    pub async fn get_statistics(&self, agent_id: &str) -> Result<MemoryStats> {
        debug!("Getting statistics for agent: {}", agent_id);
        
        let conn = self.connection.read().await;
        
        // Get total count
        let total_memories: u64 = conn.query_row(
            "SELECT COUNT(*) FROM memories WHERE agent_id = ?1",
            params![agent_id],
            |row| Ok(row.get(0)?),
        ).map_err(|e| CBDError::Storage(format!("Failed to count memories: {}", e)))?;
        
        // Get priorities distribution
        let mut priorities: HashMap<MemoryPriority, u64> = HashMap::new();
        let mut stmt = conn.prepare(
            "SELECT priority, COUNT(*) FROM memories WHERE agent_id = ?1 GROUP BY priority"
        ).map_err(|e| CBDError::Storage(format!("Failed to prepare priority query: {}", e)))?;
        
        let priority_rows = stmt.query_map(params![agent_id], |row| {
            let priority_val: i32 = row.get(0)?;
            let count: u64 = row.get(1)?;
            let priority = match priority_val {
                1 => MemoryPriority::Low,
                2 => MemoryPriority::Medium,
                3 => MemoryPriority::High,
                4 => MemoryPriority::Critical,
                _ => MemoryPriority::Medium,
            };
            Ok((priority, count))
        }).map_err(|e| CBDError::Storage(format!("Failed to execute priority query: {}", e)))?;
        
        for row_result in priority_rows {
            if let Ok((priority, count)) = row_result {
                priorities.insert(priority, count);
            }
        }
        
        // Get entity types distribution
        let mut entity_types: HashMap<String, u64> = HashMap::new();
        let mut stmt = conn.prepare(
            "SELECT entity_type, COUNT(*) FROM memories WHERE agent_id = ?1 GROUP BY entity_type"
        ).map_err(|e| CBDError::Storage(format!("Failed to prepare entity query: {}", e)))?;
        
        let entity_rows = stmt.query_map(params![agent_id], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, u64>(1)?))
        }).map_err(|e| CBDError::Storage(format!("Failed to execute entity query: {}", e)))?;
        
        for row_result in entity_rows {
            if let Ok((entity_type, count)) = row_result {
                entity_types.insert(entity_type, count);
            }
        }
        
        // Get average access count
        let avg_access: f32 = conn.query_row(
            "SELECT AVG(access_count) FROM memories WHERE agent_id = ?1",
            params![agent_id],
            |row| Ok(row.get(0).unwrap_or(0.0)),
        ).map_err(|e| CBDError::Storage(format!("Failed to calculate average access: {}", e)))?;
        
        let stats = MemoryStats {
            total_memories,
            memories_by_priority: priorities,
            memories_by_entity_type: entity_types,
            average_access_count: avg_access,
            storage_size_bytes: 0, // Would need filesystem operations to calculate
            last_optimization: None,
            performance_metrics: HashMap::new(),
        };
        
        info!("Generated statistics for agent: {} ({} memories)", agent_id, total_memories);
        Ok(stats)
    }
    
    /// Optimize storage by cleaning up old memories
    pub async fn optimize(&self) -> Result<()> {
        info!("Starting storage optimization");
        
        // Remove oldest memories if we're over the limit
        let current_count = *self.memory_count.read().await;
        if current_count > self.max_memories {
            let excess = current_count - self.max_memories;
            self.cleanup_old_memories_with_count(excess).await?;
        }
        
        // Vacuum database
        let conn = self.connection.write().await;
        conn.execute("VACUUM", [])
            .map_err(|e| CBDError::Storage(format!("Failed to vacuum database: {}", e)))?;
        
        // Rebuild FTS index
        conn.execute("INSERT INTO memories_fts(memories_fts) VALUES('rebuild')", [])
            .map_err(|e| CBDError::Storage(format!("Failed to rebuild FTS index: {}", e)))?;
        
        info!("Storage optimization completed");
        Ok(())
    }
    
    /// Helper methods
    fn row_to_memory_entry(&self, row: &Row) -> Result<MemoryEntry> {
        let tags_json: String = row.get("tags").unwrap_or_default();
        let tags: Vec<String> = serde_json::from_str(&tags_json).unwrap_or_default();
        
        let context_json: String = row.get("context").unwrap_or_default();
        let context: HashMap<String, serde_json::Value> = serde_json::from_str(&context_json).unwrap_or_default();
        
        let priority_val: i32 = row.get("priority")?;
        let priority = match priority_val {
            1 => MemoryPriority::Low,
            2 => MemoryPriority::Medium,
            3 => MemoryPriority::High,
            4 => MemoryPriority::Critical,
            _ => MemoryPriority::Medium,
        };
        
        let created_at_str: String = row.get("created_at")?;
        let updated_at_str: String = row.get("updated_at")?;
        
        let created_at = chrono::DateTime::parse_from_rfc3339(&created_at_str)
            .map_err(|e| CBDError::Parsing(format!("Invalid created_at timestamp: {}", e)))?
            .with_timezone(&chrono::Utc);
        
        let updated_at = chrono::DateTime::parse_from_rfc3339(&updated_at_str)
            .map_err(|e| CBDError::Parsing(format!("Invalid updated_at timestamp: {}", e)))?
            .with_timezone(&chrono::Utc);
        
        let last_accessed = row.get::<_, Option<String>>("last_accessed")
            .ok()
            .flatten()
            .and_then(|s| chrono::DateTime::parse_from_rfc3339(&s).ok())
            .map(|dt| dt.with_timezone(&chrono::Utc));
        
        let metadata = MemoryMetadata {
            entity_type: row.get("entity_type")?,
            priority,
            tags,
            session_id: row.get("session_id")?,
            project_id: row.get("project_id")?,
            agent_id: row.get("agent_id")?,
            timestamp: created_at,
            importance: row.get("importance")?,
            context,
        };
        
        Ok(MemoryEntry {
            id: row.get("id")?,
            content: row.get("content")?,
            metadata,
            embedding: None, // Not stored in fallback
            created_at,
            updated_at,
            access_count: row.get("access_count").unwrap_or(0),
            last_accessed,
        })
    }
    
    fn row_to_memory_result(&self, row: &Row) -> Result<MemorySearchResult> {
        let memory = self.row_to_memory_entry(row)?;
        let similarity_score: f32 = row.get("similarity_score").unwrap_or(0.5);
        
        Ok(MemorySearchResult {
            memory,
            similarity_score,
            relevance_score: similarity_score,
            context_match: true,
            reason: "Content match".to_string(),
        })
    }
    
    async fn extract_key_insights(&self, memories: &[MemoryEntry]) -> Result<Vec<String>> {
        let mut insights = Vec::new();
        
        // Extract unique entity types
        let entity_types: std::collections::HashSet<_> = memories.iter()
            .map(|m| &m.metadata.entity_type)
            .collect();
        
        if entity_types.len() > 1 {
            insights.push(format!("Covers {} different entity types", entity_types.len()));
        }
        
        // Count high-importance memories
        let high_importance = memories.iter()
            .filter(|m| m.metadata.importance > 0.7)
            .count();
        
        if high_importance > 0 {
            insights.push(format!("{} high-importance memories", high_importance));
        }
        
        Ok(insights)
    }
    
    async fn extract_relevant_entities(&self, memories: &[MemoryEntry]) -> Result<HashMap<String, Vec<String>>> {
        let mut entities: HashMap<String, Vec<String>> = HashMap::new();
        
        for memory in memories {
            entities.entry(memory.metadata.entity_type.clone())
                .or_insert_with(Vec::new)
                .push(memory.id.clone());
        }
        
        Ok(entities)
    }
    
    async fn build_session_context(&self, memories: &[MemoryEntry]) -> Result<HashMap<String, serde_json::Value>> {
        let mut context = HashMap::new();
        
        // Count memories by session
        let mut session_counts: HashMap<String, usize> = HashMap::new();
        for memory in memories {
            if let Some(ref session_id) = memory.metadata.session_id {
                *session_counts.entry(session_id.clone()).or_insert(0) += 1;
            }
        }
        
        if !session_counts.is_empty() {
            context.insert("session_distribution".to_string(), serde_json::to_value(session_counts)?);
        }
        
        context.insert("total_memories".to_string(), serde_json::Value::Number(memories.len().into()));
        context.insert("generated_at".to_string(), 
                      serde_json::Value::String(chrono::Utc::now().to_rfc3339()));
        
        Ok(context)
    }
    
    async fn cleanup_old_memories(&self) -> Result<()> {
        self.cleanup_old_memories_with_count(100).await
    }
    
    async fn cleanup_old_memories_with_count(&self, count: usize) -> Result<()> {
        debug!("Cleaning up {} old memories", count);
        
        let conn = self.connection.write().await;
        let deleted = conn.execute(
            r#"
            DELETE FROM memories WHERE id IN (
                SELECT id FROM memories 
                ORDER BY importance ASC, access_count ASC, created_at ASC 
                LIMIT ?1
            )
            "#,
            params![count],
        ).map_err(|e| CBDError::Storage(format!("Failed to cleanup old memories: {}", e)))?;
        
        if deleted > 0 {
            *self.memory_count.write().await -= deleted;
            info!("Cleaned up {} old memories", deleted);
        }
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;
    
    async fn create_test_storage() -> (FallbackStorage, TempDir) {
        let temp_dir = TempDir::new().unwrap();
        let storage = FallbackStorage::new(temp_dir.path().to_str().unwrap(), 1000).await.unwrap();
        (storage, temp_dir)
    }
    
    fn create_test_metadata(agent_id: &str) -> MemoryMetadata {
        MemoryMetadata {
            entity_type: "test".to_string(),
            priority: MemoryPriority::Medium,
            tags: vec!["test".to_string()],
            session_id: None,
            project_id: None,
            agent_id: agent_id.to_string(),
            timestamp: chrono::Utc::now(),
            importance: 0.5,
            context: HashMap::new(),
        }
    }
    
    #[tokio::test]
    async fn test_fallback_storage_creation() {
        let (storage, _temp_dir) = create_test_storage().await;
        assert_eq!(*storage.memory_count.read().await, 0);
    }
    
    #[tokio::test]
    async fn test_memory_operations() {
        let (storage, _temp_dir) = create_test_storage().await;
        
        // Store memory
        let metadata = create_test_metadata("test_agent");
        let memory_id = storage.store_memory("Test content", "test_agent", metadata).await.unwrap();
        assert!(!memory_id.is_empty());
        assert_eq!(*storage.memory_count.read().await, 1);
        
        // Search memory
        let results = storage.search_memories("test", "test_agent", None).await.unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].memory.content, "Test content");
        
        // Delete memory
        let deleted = storage.delete_memory(&memory_id, "test_agent").await.unwrap();
        assert!(deleted);
        assert_eq!(*storage.memory_count.read().await, 0);
    }
    
    #[tokio::test]
    async fn test_context_operations() {
        let (storage, _temp_dir) = create_test_storage().await;
        
        // Store multiple memories
        for i in 0..5 {
            let metadata = create_test_metadata("test_agent");
            storage.store_memory(&format!("Content {}", i), "test_agent", metadata).await.unwrap();
        }
        
        // Get context
        let context = storage.get_context("test_agent", Some(3)).await.unwrap();
        assert_eq!(context.memories.len(), 3);
        assert!(!context.summary.is_empty());
        
        // Get statistics
        let stats = storage.get_statistics("test_agent").await.unwrap();
        assert_eq!(stats.total_memories, 5);
    }
}
