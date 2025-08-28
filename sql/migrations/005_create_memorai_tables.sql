-- CODAI MemorAI Service Schema - Migration 005
-- Create memory storage and context management tables
-- Date: 2025-08-27  
-- Version: 1.0.0

-- Memories table with vector embeddings for semantic search
CREATE TABLE codai_memorai.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) NOT NULL,
    user_id UUID, -- Optional reference to codai_auth.users(id)
    content TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for deduplication
    embedding TEXT, -- JSON string for embedding vector (will migrate to VECTOR type when pgvector available)
    category VARCHAR(100),
    importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
    context_type VARCHAR(50) DEFAULT 'general' CHECK (context_type IN ('general', 'task', 'conversation', 'system', 'error', 'success')),
    session_id VARCHAR(255),
    parent_memory_id UUID REFERENCES codai_memorai.memories(id),
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    compressed BOOLEAN DEFAULT FALSE,
    compression_ratio DECIMAL(5,2),
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Memory relationships for graph-like connections
CREATE TABLE codai_memorai.memory_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_memory_id UUID NOT NULL REFERENCES codai_memorai.memories(id) ON DELETE CASCADE,
    to_memory_id UUID NOT NULL REFERENCES codai_memorai.memories(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('related', 'follows', 'contradicts', 'references', 'extends', 'summarizes')),
    strength DECIMAL(3,2) DEFAULT 0.5 CHECK (strength >= 0.0 AND strength <= 1.0),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(from_memory_id, to_memory_id, relationship_type)
);

-- Memory categories for organization
CREATE TABLE codai_memorai.memory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES codai_memorai.memory_categories(id),
    color VARCHAR(7) DEFAULT '#6366f1', -- Hex color for UI
    icon VARCHAR(50),
    auto_assign_rules JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent contexts for memory isolation
CREATE TABLE codai_memorai.agent_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) UNIQUE NOT NULL,
    agent_name VARCHAR(200),
    agent_type VARCHAR(50) DEFAULT 'general',
    description TEXT,
    memory_limit INTEGER DEFAULT 10000, -- Max memories per agent
    retention_policy JSONB DEFAULT '{"max_age_days": 365, "auto_compress": true}',
    permissions JSONB DEFAULT '{"read": true, "write": true, "delete": false}',
    settings JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Memory access logs for analytics
CREATE TABLE codai_memorai.memory_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES codai_memorai.memories(id) ON DELETE CASCADE,
    agent_id VARCHAR(100) NOT NULL,
    user_id UUID, -- Optional reference to codai_auth.users(id)
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('read', 'write', 'delete', 'search')),
    query_text TEXT, -- For search operations
    similarity_score DECIMAL(5,4), -- For vector search results
    response_time_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    accessed_at TIMESTAMP DEFAULT NOW()
);

-- Search queries cache for performance
CREATE TABLE codai_memorai.search_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash VARCHAR(64) NOT NULL, -- Hash of search parameters
    query_embedding TEXT, -- JSON string for embedding vector
    agent_id VARCHAR(100) NOT NULL,
    parameters JSONB NOT NULL, -- Search parameters
    results_ids UUID[] NOT NULL, -- Array of memory IDs
    result_count INTEGER NOT NULL,
    cache_hit_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 hour',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Compression jobs for memory optimization
CREATE TABLE codai_memorai.compression_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) NOT NULL,
    job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('compress', 'decompress', 'cleanup')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    parameters JSONB DEFAULT '{}',
    processed_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    compression_ratio DECIMAL(5,2),
    space_saved_bytes BIGINT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics summary tables
CREATE TABLE codai_memorai.analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    memories_created INTEGER DEFAULT 0,
    memories_accessed INTEGER DEFAULT 0,
    memories_deleted INTEGER DEFAULT 0,
    total_memories INTEGER DEFAULT 0,
    avg_importance DECIMAL(3,2),
    top_categories JSONB DEFAULT '[]',
    search_queries INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    storage_used_bytes BIGINT DEFAULT 0,
    UNIQUE(agent_id, date)
);

-- Indexes for performance optimization
CREATE INDEX idx_memories_agent_id ON codai_memorai.memories(agent_id);
CREATE INDEX idx_memories_user_id ON codai_memorai.memories(user_id);
CREATE INDEX idx_memories_category ON codai_memorai.memories(category);
CREATE INDEX idx_memories_importance ON codai_memorai.memories(importance);
CREATE INDEX idx_memories_context_type ON codai_memorai.memories(context_type);
CREATE INDEX idx_memories_session_id ON codai_memorai.memories(session_id);
CREATE INDEX idx_memories_created_at ON codai_memorai.memories(created_at);
CREATE INDEX idx_memories_content_hash ON codai_memorai.memories(content_hash);
CREATE INDEX idx_memories_tags ON codai_memorai.memories USING GIN(tags);
CREATE INDEX idx_memories_metadata ON codai_memorai.memories USING GIN(metadata);

-- Vector similarity search index - Skip if pgvector not available
-- CREATE INDEX idx_memories_embedding ON codai_memorai.memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Other indexes
CREATE INDEX idx_memory_relationships_from ON codai_memorai.memory_relationships(from_memory_id);
CREATE INDEX idx_memory_relationships_to ON codai_memorai.memory_relationships(to_memory_id);
CREATE INDEX idx_memory_relationships_type ON codai_memorai.memory_relationships(relationship_type);

CREATE INDEX idx_memory_categories_parent ON codai_memorai.memory_categories(parent_category_id);

CREATE INDEX idx_agent_contexts_agent_id ON codai_memorai.agent_contexts(agent_id);
CREATE INDEX idx_agent_contexts_active ON codai_memorai.agent_contexts(active);

CREATE INDEX idx_memory_access_log_memory_id ON codai_memorai.memory_access_log(memory_id);
CREATE INDEX idx_memory_access_log_agent_id ON codai_memorai.memory_access_log(agent_id);
CREATE INDEX idx_memory_access_log_accessed_at ON codai_memorai.memory_access_log(accessed_at);

CREATE INDEX idx_search_cache_query_hash ON codai_memorai.search_cache(query_hash);
CREATE INDEX idx_search_cache_agent_id ON codai_memorai.search_cache(agent_id);
CREATE INDEX idx_search_cache_expires_at ON codai_memorai.search_cache(expires_at);

CREATE INDEX idx_compression_jobs_agent_id ON codai_memorai.compression_jobs(agent_id);
CREATE INDEX idx_compression_jobs_status ON codai_memorai.compression_jobs(status);

CREATE INDEX idx_analytics_daily_agent_date ON codai_memorai.analytics_daily(agent_id, date);

-- Create partitioned tables for time-series data - Skip if TimescaleDB not available
-- SELECT create_hypertable('codai_memorai.memory_access_log', 'accessed_at', chunk_time_interval => INTERVAL '1 week');
-- SELECT create_hypertable('codai_memorai.analytics_daily', 'date', chunk_time_interval => INTERVAL '1 month');

-- Update triggers
CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON codai_memorai.memories
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

CREATE TRIGGER update_memory_categories_updated_at BEFORE UPDATE ON codai_memorai.memory_categories
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

CREATE TRIGGER update_agent_contexts_updated_at BEFORE UPDATE ON codai_memorai.agent_contexts
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

-- Function to update memory access statistics
CREATE OR REPLACE FUNCTION codai_memorai.update_memory_access_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update access count and last accessed time
    UPDATE codai_memorai.memories 
    SET 
        access_count = access_count + 1,
        last_accessed_at = NOW()
    WHERE id = NEW.memory_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update access stats
CREATE TRIGGER trigger_update_memory_access_stats
    AFTER INSERT ON codai_memorai.memory_access_log
    FOR EACH ROW 
    EXECUTE FUNCTION codai_memorai.update_memory_access_stats();

-- Function for memory cleanup
CREATE OR REPLACE FUNCTION codai_memorai.cleanup_expired_memories()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired memories
    DELETE FROM codai_memorai.memories 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up expired search cache
    DELETE FROM codai_memorai.search_cache WHERE expires_at < NOW();
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default categories
INSERT INTO codai_memorai.memory_categories (name, description, color, icon) VALUES
('General', 'General purpose memories', '#6366f1', 'brain'),
('Tasks', 'Task-related memories', '#10b981', 'check-circle'),
('Conversations', 'Conversation histories', '#f59e0b', 'chat'),
('System', 'System-generated memories', '#6b7280', 'cpu'),
('Errors', 'Error and debugging information', '#ef4444', 'x-circle'),
('Learning', 'Learning and knowledge memories', '#8b5cf6', 'book-open'),
('Context', 'Contextual information', '#06b6d4', 'layers');

-- Insert default agent context
INSERT INTO codai_memorai.agent_contexts (agent_id, agent_name, description) VALUES
('default', 'Default Agent', 'Default agent context for general purpose use'),
('system', 'System Agent', 'System agent for internal operations'),
('test', 'Test Agent', 'Agent context for testing purposes');

-- Insert migration record
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('005', 'create_memorai_tables', NOW())
ON CONFLICT (version) DO NOTHING;

-- Success message
SELECT 'MemorAI service schema created successfully' as status;