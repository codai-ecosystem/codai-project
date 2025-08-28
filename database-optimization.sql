-- CodAI Database Optimization Script
-- Generated: 08/27/2025 12:16:50
-- Purpose: Create indexes and optimize tables for Essential CodAI Services

-- Database performance analysis
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname LIKE 'codai_%' 
ORDER BY schemaname, tablename, attname;

-- Index creation (CONCURRENTLY to avoid blocking)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_unique ON codai_auth.users (email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_created ON codai_auth.users (is_active, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_expires ON codai_auth.sessions (user_id, expires_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_registry_name_active ON codai_gateway.service_registry (service_name, is_active, last_health_check DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_type_created ON codai_hub.events (event_type, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_status_created ON codai_bancai.transactions (user_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entities_type_created ON codai_cbd.entities (entity_type, created_at DESC);

-- Table maintenance
VACUUM ANALYZE codai_auth.users;
VACUUM ANALYZE codai_auth.sessions;
VACUUM ANALYZE codai_gateway.service_registry;
VACUUM ANALYZE codai_hub.events;
VACUUM ANALYZE codai_bancai.transactions;
VACUUM ANALYZE codai_cbd.entities;

-- Query to check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname LIKE 'codai_%'
ORDER BY idx_scan DESC;

-- Query to identify slow queries (requires pg_stat_statements extension)
-- SELECT query, total_time, mean_time, calls 
-- FROM pg_stat_statements 
-- WHERE query LIKE '%codai_%' 
-- ORDER BY mean_time DESC 
-- LIMIT 10;
