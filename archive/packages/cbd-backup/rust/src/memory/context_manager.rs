// CBD Enterprise Engine - Context Manager
// 
// This module manages intelligent context handling, session tracking,
// and contextual memory operations for enhanced AI agent coordination.

use crate::error::{CBDError, Result};
use crate::memory::{MemoryEntry, MemoryMetadata, MemoryPriority, ContextInfo};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tracing::{debug, info, warn};
use serde::{Deserialize, Serialize};

/// Session context tracking information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionContext {
    pub session_id: String,
    pub agent_id: String,
    pub project_id: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub last_activity: chrono::DateTime<chrono::Utc>,
    pub total_interactions: u64,
    pub context_size: usize,
    pub active_memories: Vec<String>,
    pub session_summary: String,
    pub tags: Vec<String>,
    pub metadata: HashMap<String, serde_json::Value>,
}

/// Context priority levels for memory importance
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ContextPriority {
    Immediate,    // Current task context
    Session,      // Current session context
    Project,      // Project-wide context
    Historical,   // Long-term historical context
}

/// Context memory entry with enhanced metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextMemoryEntry {
    pub memory: MemoryEntry,
    pub context_priority: ContextPriority,
    pub relevance_score: f32,
    pub recency_score: f32,
    pub importance_score: f32,
    pub combined_score: f32,
    pub context_tags: Vec<String>,
    pub relationships: Vec<String>,
}

/// Context analysis result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContextAnalysis {
    pub context_summary: String,
    pub key_topics: Vec<String>,
    pub important_entities: HashMap<String, f32>,
    pub temporal_patterns: Vec<String>,
    pub suggested_actions: Vec<String>,
    pub context_gaps: Vec<String>,
    pub confidence_score: f32,
}

/// Context manager for intelligent memory operations
pub struct ContextManager {
    sessions: Arc<RwLock<HashMap<String, SessionContext>>>,
    context_cache: Arc<RwLock<HashMap<String, ContextInfo>>>,
    cache_ttl: std::time::Duration,
    max_context_size: usize,
    context_analysis_threshold: f32,
}

impl ContextManager {
    /// Create a new context manager
    pub fn new(max_context_size: usize, cache_ttl_secs: u64) -> Self {
        Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            context_cache: Arc::new(RwLock::new(HashMap::new())),
            cache_ttl: std::time::Duration::from_secs(cache_ttl_secs),
            max_context_size,
            context_analysis_threshold: 0.7,
        }
    }
    
    /// Start or resume a session
    pub async fn start_session(&self, session_id: &str, agent_id: &str, project_id: Option<String>) -> Result<()> {
        debug!("Starting session: {} for agent: {}", session_id, agent_id);
        
        let mut sessions = self.sessions.write().await;
        
        match sessions.get_mut(session_id) {
            Some(session) => {
                // Resume existing session
                session.last_activity = chrono::Utc::now();
                session.total_interactions += 1;
                info!("Resumed session: {} (interactions: {})", session_id, session.total_interactions);
            }
            None => {
                // Create new session
                let session = SessionContext {
                    session_id: session_id.to_string(),
                    agent_id: agent_id.to_string(),
                    project_id,
                    created_at: chrono::Utc::now(),
                    last_activity: chrono::Utc::now(),
                    total_interactions: 1,
                    context_size: 0,
                    active_memories: Vec::new(),
                    session_summary: String::new(),
                    tags: Vec::new(),
                    metadata: HashMap::new(),
                };
                
                sessions.insert(session_id.to_string(), session);
                info!("Created new session: {}", session_id);
            }
        }
        
        Ok(())
    }
    
    /// End a session and perform cleanup
    pub async fn end_session(&self, session_id: &str) -> Result<SessionContext> {
        debug!("Ending session: {}", session_id);
        
        let mut sessions = self.sessions.write().await;
        let session = sessions.remove(session_id)
            .ok_or_else(|| CBDError::NotFound(format!("Session not found: {}", session_id)))?;
        
        // Clear session from cache
        let mut cache = self.context_cache.write().await;
        cache.remove(session_id);
        
        info!("Ended session: {} (duration: {:?}, interactions: {})", 
               session_id, 
               chrono::Utc::now() - session.created_at,
               session.total_interactions);
        
        Ok(session)
    }
    
    /// Get session information
    pub async fn get_session(&self, session_id: &str) -> Result<SessionContext> {
        let sessions = self.sessions.read().await;
        sessions.get(session_id)
            .cloned()
            .ok_or_else(|| CBDError::NotFound(format!("Session not found: {}", session_id)))
    }
    
    /// Update session context
    pub async fn update_session_context(&self, session_id: &str, memories: Vec<String>, summary: Option<String>) -> Result<()> {
        debug!("Updating session context: {}", session_id);
        
        let mut sessions = self.sessions.write().await;
        let session = sessions.get_mut(session_id)
            .ok_or_else(|| CBDError::NotFound(format!("Session not found: {}", session_id)))?;
        
        session.active_memories = memories;
        session.context_size = session.active_memories.len();
        session.last_activity = chrono::Utc::now();
        
        if let Some(summary) = summary {
            session.session_summary = summary;
        }
        
        // Invalidate cache for this session
        let mut cache = self.context_cache.write().await;
        cache.remove(session_id);
        
        Ok(())
    }
    
    /// Build intelligent context from memories
    pub async fn build_context(&self, memories: Vec<MemoryEntry>, agent_id: &str, session_id: Option<&str>) -> Result<ContextInfo> {
        debug!("Building context from {} memories", memories.len());
        
        // Check cache first
        if let Some(session_id) = session_id {
            let cache_key = format!("{}:{}", session_id, memories.len());
            let cache = self.context_cache.read().await;
            if let Some(cached_context) = cache.get(&cache_key) {
                debug!("Returning cached context for session: {}", session_id);
                return Ok(cached_context.clone());
            }
        }
        
        // Enhance memories with context scoring
        let mut context_memories = Vec::new();
        for memory in memories {
            let context_memory = self.enhance_memory_with_context(memory, agent_id).await?;
            context_memories.push(context_memory);
        }
        
        // Sort by combined score (descending)
        context_memories.sort_by(|a, b| b.combined_score.partial_cmp(&a.combined_score).unwrap());
        
        // Limit context size
        context_memories.truncate(self.max_context_size);
        
        // Extract base memories
        let base_memories: Vec<MemoryEntry> = context_memories.iter()
            .map(|cm| cm.memory.clone())
            .collect();
        
        // Generate context analysis
        let analysis = self.analyze_context(&context_memories).await?;
        
        // Build context info
        let context = ContextInfo {
            memories: base_memories,
            summary: analysis.context_summary,
            key_insights: analysis.important_entities.keys().cloned().collect(),
            relevant_entities: self.extract_entities(&context_memories).await?,
            session_context: self.build_session_metadata(&context_memories, session_id).await?,
            recommendations: analysis.suggested_actions,
        };
        
        // Cache the context
        if let Some(session_id) = session_id {
            let cache_key = format!("{}:{}", session_id, context.memories.len());
            let mut cache = self.context_cache.write().await;
            cache.insert(cache_key, context.clone());
            
            // Clean up old cache entries
            self.cleanup_cache(&mut cache).await;
        }
        
        info!("Built context with {} memories and {} insights", 
               context.memories.len(), context.key_insights.len());
        
        Ok(context)
    }
    
    /// Enhance memory with context-aware scoring
    async fn enhance_memory_with_context(&self, memory: MemoryEntry, agent_id: &str) -> Result<ContextMemoryEntry> {
        let now = chrono::Utc::now();
        
        // Calculate recency score (newer = higher score)
        let age_hours = (now - memory.created_at).num_hours() as f32;
        let recency_score = 1.0 / (1.0 + age_hours / 24.0); // Decay over days
        
        // Calculate importance score from metadata
        let importance_score = memory.metadata.importance;
        
        // Calculate relevance score based on access patterns
        let access_factor = (memory.access_count as f32).ln_1p() / 10.0;
        let relevance_score = (importance_score + access_factor).min(1.0);
        
        // Determine context priority
        let context_priority = if memory.metadata.session_id.is_some() {
            ContextPriority::Session
        } else if memory.metadata.project_id.is_some() {
            ContextPriority::Project
        } else {
            ContextPriority::Historical
        };
        
        // Calculate combined score
        let priority_weight = match context_priority {
            ContextPriority::Immediate => 1.0,
            ContextPriority::Session => 0.8,
            ContextPriority::Project => 0.6,
            ContextPriority::Historical => 0.4,
        };
        
        let combined_score = (relevance_score * 0.4 + recency_score * 0.3 + importance_score * 0.3) * priority_weight;
        
        // Extract context tags
        let context_tags = self.extract_context_tags(&memory).await?;
        
        // Find relationships
        let relationships = self.find_memory_relationships(&memory).await?;
        
        Ok(ContextMemoryEntry {
            memory,
            context_priority,
            relevance_score,
            recency_score,
            importance_score,
            combined_score,
            context_tags,
            relationships,
        })
    }
    
    /// Analyze context and generate insights
    async fn analyze_context(&self, context_memories: &[ContextMemoryEntry]) -> Result<ContextAnalysis> {
        debug!("Analyzing context from {} memories", context_memories.len());
        
        // Extract key topics from memory content and tags
        let mut topic_frequency: HashMap<String, u32> = HashMap::new();
        let mut entity_importance: HashMap<String, f32> = HashMap::new();
        
        for context_memory in context_memories {
            // Count topic frequency from tags
            for tag in &context_memory.memory.metadata.tags {
                *topic_frequency.entry(tag.clone()).or_insert(0) += 1;
            }
            
            // Weight entities by memory importance
            let entity_key = context_memory.memory.metadata.entity_type.clone();
            let current_importance = entity_importance.get(&entity_key).unwrap_or(&0.0);
            entity_importance.insert(entity_key, current_importance + context_memory.importance_score);
        }
        
        // Extract top topics
        let mut key_topics: Vec<_> = topic_frequency.into_iter().collect();
        key_topics.sort_by(|a, b| b.1.cmp(&a.1));
        key_topics.truncate(10);
        let key_topics: Vec<String> = key_topics.into_iter().map(|(topic, _)| topic).collect();
        
        // Generate context summary
        let context_summary = self.generate_context_summary(context_memories, &key_topics).await?;
        
        // Identify temporal patterns
        let temporal_patterns = self.identify_temporal_patterns(context_memories).await?;
        
        // Generate suggested actions
        let suggested_actions = self.generate_suggested_actions(context_memories, &key_topics).await?;
        
        // Identify context gaps
        let context_gaps = self.identify_context_gaps(context_memories).await?;
        
        // Calculate confidence score
        let confidence_score = self.calculate_confidence_score(context_memories).await?;
        
        Ok(ContextAnalysis {
            context_summary,
            key_topics,
            important_entities: entity_importance,
            temporal_patterns,
            suggested_actions,
            context_gaps,
            confidence_score,
        })
    }
    
    /// Extract entities and their relationships
    async fn extract_entities(&self, context_memories: &[ContextMemoryEntry]) -> Result<HashMap<String, Vec<String>>> {
        let mut entities: HashMap<String, Vec<String>> = HashMap::new();
        
        for context_memory in context_memories {
            let entity_type = &context_memory.memory.metadata.entity_type;
            let memory_id = &context_memory.memory.id;
            
            entities.entry(entity_type.clone())
                .or_insert_with(Vec::new)
                .push(memory_id.clone());
        }
        
        Ok(entities)
    }
    
    /// Build session-specific metadata
    async fn build_session_metadata(&self, context_memories: &[ContextMemoryEntry], session_id: Option<&str>) -> Result<HashMap<String, serde_json::Value>> {
        let mut metadata = HashMap::new();
        
        if let Some(session_id) = session_id {
            metadata.insert("session_id".to_string(), serde_json::Value::String(session_id.to_string()));
            
            // Add session statistics
            let session_memories: Vec<_> = context_memories.iter()
                .filter(|cm| cm.memory.metadata.session_id.as_ref() == Some(&session_id.to_string()))
                .collect();
            
            metadata.insert("session_memory_count".to_string(), serde_json::Value::Number(session_memories.len().into()));
            
            if let Ok(session) = self.get_session(session_id).await {
                metadata.insert("session_duration".to_string(), 
                    serde_json::Value::String(format!("{:?}", chrono::Utc::now() - session.created_at)));
                metadata.insert("total_interactions".to_string(), 
                    serde_json::Value::Number(session.total_interactions.into()));
            }
        }
        
        // Add context statistics
        metadata.insert("context_size".to_string(), serde_json::Value::Number(context_memories.len().into()));
        metadata.insert("generated_at".to_string(), 
            serde_json::Value::String(chrono::Utc::now().to_rfc3339()));
        
        Ok(metadata)
    }
    
    /// Helper methods for context analysis
    async fn extract_context_tags(&self, memory: &MemoryEntry) -> Result<Vec<String>> {
        let mut tags = memory.metadata.tags.clone();
        
        // Add dynamic context tags based on content analysis
        if memory.content.len() > 1000 {
            tags.push("long_content".to_string());
        }
        
        if memory.access_count > 10 {
            tags.push("frequently_accessed".to_string());
        }
        
        if memory.metadata.importance > 0.8 {
            tags.push("high_importance".to_string());
        }
        
        Ok(tags)
    }
    
    async fn find_memory_relationships(&self, _memory: &MemoryEntry) -> Result<Vec<String>> {
        // Placeholder for relationship analysis
        // In a full implementation, this would analyze memory content
        // and find semantic relationships with other memories
        Ok(Vec::new())
    }
    
    async fn generate_context_summary(&self, context_memories: &[ContextMemoryEntry], key_topics: &[String]) -> Result<String> {
        let memory_count = context_memories.len();
        let topic_summary = if key_topics.is_empty() {
            "various topics".to_string()
        } else {
            key_topics.join(", ")
        };
        
        Ok(format!("Context contains {} memories covering {}. Recent activity focuses on high-priority items with emphasis on current session relevance.", 
                   memory_count, topic_summary))
    }
    
    async fn identify_temporal_patterns(&self, context_memories: &[ContextMemoryEntry]) -> Result<Vec<String>> {
        let mut patterns = Vec::new();
        
        // Analyze creation time patterns
        let recent_count = context_memories.iter()
            .filter(|cm| (chrono::Utc::now() - cm.memory.created_at).num_hours() < 24)
            .count();
        
        if recent_count > context_memories.len() / 2 {
            patterns.push("High recent activity detected".to_string());
        }
        
        // Analyze access patterns
        let frequently_accessed = context_memories.iter()
            .filter(|cm| cm.memory.access_count > 5)
            .count();
        
        if frequently_accessed > 0 {
            patterns.push(format!("{} frequently accessed memories", frequently_accessed));
        }
        
        Ok(patterns)
    }
    
    async fn generate_suggested_actions(&self, context_memories: &[ContextMemoryEntry], key_topics: &[String]) -> Result<Vec<String>> {
        let mut actions = Vec::new();
        
        // Suggest based on high-importance memories
        let high_importance_count = context_memories.iter()
            .filter(|cm| cm.importance_score > 0.8)
            .count();
        
        if high_importance_count > 0 {
            actions.push(format!("Review {} high-importance memories for critical insights", high_importance_count));
        }
        
        // Suggest based on key topics
        if !key_topics.is_empty() {
            actions.push(format!("Focus on key topics: {}", key_topics.join(", ")));
        }
        
        // Suggest memory optimization
        if context_memories.len() > self.max_context_size * 2 / 3 {
            actions.push("Consider memory cleanup to improve performance".to_string());
        }
        
        Ok(actions)
    }
    
    async fn identify_context_gaps(&self, context_memories: &[ContextMemoryEntry]) -> Result<Vec<String>> {
        let mut gaps = Vec::new();
        
        // Check for temporal gaps
        if context_memories.len() > 1 {
            let oldest = context_memories.iter().min_by_key(|cm| cm.memory.created_at).unwrap();
            let newest = context_memories.iter().max_by_key(|cm| cm.memory.created_at).unwrap();
            
            let time_span = newest.memory.created_at - oldest.memory.created_at;
            if time_span.num_days() > 7 && context_memories.len() < 10 {
                gaps.push("Limited memory coverage over extended time period".to_string());
            }
        }
        
        // Check for entity type diversity
        let entity_types: std::collections::HashSet<_> = context_memories.iter()
            .map(|cm| &cm.memory.metadata.entity_type)
            .collect();
        
        if entity_types.len() < 3 && context_memories.len() > 5 {
            gaps.push("Limited diversity in memory types".to_string());
        }
        
        Ok(gaps)
    }
    
    async fn calculate_confidence_score(&self, context_memories: &[ContextMemoryEntry]) -> Result<f32> {
        if context_memories.is_empty() {
            return Ok(0.0);
        }
        
        // Base confidence on memory quality and diversity
        let avg_importance = context_memories.iter()
            .map(|cm| cm.importance_score)
            .sum::<f32>() / context_memories.len() as f32;
        
        let avg_relevance = context_memories.iter()
            .map(|cm| cm.relevance_score)
            .sum::<f32>() / context_memories.len() as f32;
        
        let confidence = (avg_importance + avg_relevance) / 2.0;
        Ok(confidence.clamp(0.0, 1.0))
    }
    
    /// Cleanup expired cache entries
    async fn cleanup_cache(&self, cache: &mut HashMap<String, ContextInfo>) {
        let _now = std::time::Instant::now();
        let cache_len = {
            let cache = self.context_cache.read().await;
            cache.len()
        };
        
        if cache_len >= 100 {
            let mut cache = self.context_cache.write().await;
            // Simple cleanup: remove oldest entries
            if cache.len() >= 100 {
                let keys_to_remove: Vec<_> = cache.keys().take(cache.len() - 50).cloned().collect();
                for key in keys_to_remove {
                    cache.remove(&key);
                }
            }
        }
    }
    
    /// Get all active sessions
    pub async fn get_active_sessions(&self) -> Vec<String> {
        let sessions = self.sessions.read().await;
        sessions.keys().cloned().collect()
    }
    
    /// Clean up inactive sessions
    pub async fn cleanup_inactive_sessions(&self, max_idle_hours: u64) -> Result<usize> {
        let cutoff = chrono::Utc::now() - chrono::Duration::hours(max_idle_hours as i64);
        let mut sessions = self.sessions.write().await;
        
        let initial_count = sessions.len();
        sessions.retain(|_, session| session.last_activity > cutoff);
        let cleaned_count = initial_count - sessions.len();
        
        if cleaned_count > 0 {
            info!("Cleaned up {} inactive sessions", cleaned_count);
        }
        
        Ok(cleaned_count)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;
    
    fn create_test_memory(content: &str, agent_id: &str, entity_type: &str) -> MemoryEntry {
        MemoryEntry {
            id: Uuid::new_v4().to_string(),
            content: content.to_string(),
            metadata: MemoryMetadata {
                entity_type: entity_type.to_string(),
                priority: MemoryPriority::Medium,
                tags: vec!["test".to_string()],
                session_id: None,
                project_id: None,
                agent_id: agent_id.to_string(),
                timestamp: chrono::Utc::now(),
                importance: 0.5,
                context: HashMap::new(),
            },
            embedding: None,
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
            access_count: 1,
            last_accessed: Some(chrono::Utc::now()),
        }
    }
    
    #[tokio::test]
    async fn test_context_manager_creation() {
        let manager = ContextManager::new(50, 300);
        assert!(manager.get_active_sessions().await.is_empty());
    }
    
    #[tokio::test]
    async fn test_session_management() {
        let manager = ContextManager::new(50, 300);
        
        // Start session
        manager.start_session("test_session", "test_agent", None).await.unwrap();
        let sessions = manager.get_active_sessions().await;
        assert_eq!(sessions.len(), 1);
        assert_eq!(sessions[0], "test_session");
        
        // Get session
        let session = manager.get_session("test_session").await.unwrap();
        assert_eq!(session.session_id, "test_session");
        assert_eq!(session.agent_id, "test_agent");
        
        // End session
        let ended_session = manager.end_session("test_session").await.unwrap();
        assert_eq!(ended_session.session_id, "test_session");
        assert!(manager.get_active_sessions().await.is_empty());
    }
    
    #[tokio::test]
    async fn test_context_building() {
        let manager = ContextManager::new(10, 300);
        
        let memories = vec![
            create_test_memory("First memory", "test_agent", "task"),
            create_test_memory("Second memory", "test_agent", "note"),
            create_test_memory("Third memory", "test_agent", "decision"),
        ];
        
        let context = manager.build_context(memories, "test_agent", None).await.unwrap();
        assert_eq!(context.memories.len(), 3);
        assert!(!context.summary.is_empty());
        assert!(!context.relevant_entities.is_empty());
    }
}
