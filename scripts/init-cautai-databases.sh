#!/bin/bash
# Initialize multiple databases for Cautai System
# This script creates separate databases for different Cautai components

set -e
set -u

# Main database creation function
function create_user_and_database() {
    local database=$1
    local owner=$2
    echo "Creating database '$database' with owner '$owner'..."
    
    # Create database if it doesn't exist
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        SELECT 'CREATE DATABASE $database OWNER $owner'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec
        
        -- Grant permissions
        GRANT ALL PRIVILEGES ON DATABASE $database TO $owner;
        
        -- Connect to the new database and create extensions
        \c $database;
        
        -- Enable UUID extension for unique identifiers
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        
        -- Enable full-text search capabilities
        CREATE EXTENSION IF NOT EXISTS "unaccent";
        CREATE EXTENSION IF NOT EXISTS "pg_trgm";
        
        -- Create schema for search functionality
        CREATE SCHEMA IF NOT EXISTS search AUTHORIZATION $owner;
        CREATE SCHEMA IF NOT EXISTS analytics AUTHORIZATION $owner;
        CREATE SCHEMA IF NOT EXISTS cache AUTHORIZATION $owner;
        
        -- Grant schema permissions
        GRANT ALL ON SCHEMA search TO $owner;
        GRANT ALL ON SCHEMA analytics TO $owner;
        GRANT ALL ON SCHEMA cache TO $owner;
        
        -- Create basic tables for Cautai
        CREATE TABLE IF NOT EXISTS search.queries (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            query_text TEXT NOT NULL,
            user_id VARCHAR(255),
            session_id VARCHAR(255),
            language VARCHAR(10) DEFAULT 'en',
            results_count INTEGER,
            response_time_ms INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            metadata JSONB
        );
        
        CREATE TABLE IF NOT EXISTS search.results (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            query_id UUID REFERENCES search.queries(id) ON DELETE CASCADE,
            url TEXT NOT NULL,
            title TEXT,
            description TEXT,
            content TEXT,
            rank_position INTEGER,
            relevance_score FLOAT,
            source VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            metadata JSONB
        );
        
        CREATE TABLE IF NOT EXISTS analytics.events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            event_type VARCHAR(100) NOT NULL,
            user_id VARCHAR(255),
            session_id VARCHAR(255),
            component VARCHAR(100),
            event_data JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS cache.search_cache (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            cache_key VARCHAR(500) NOT NULL UNIQUE,
            cache_value JSONB NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            accessed_count INTEGER DEFAULT 0,
            last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_queries_created_at ON search.queries(created_at);
        CREATE INDEX IF NOT EXISTS idx_queries_user_id ON search.queries(user_id);
        CREATE INDEX IF NOT EXISTS idx_queries_text_gin ON search.queries USING gin(to_tsvector('english', query_text));
        
        CREATE INDEX IF NOT EXISTS idx_results_query_id ON search.results(query_id);
        CREATE INDEX IF NOT EXISTS idx_results_url ON search.results(url);
        CREATE INDEX IF NOT EXISTS idx_results_title_gin ON search.results USING gin(to_tsvector('english', title));
        
        CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics.events(event_type);
        CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics.events(created_at);
        CREATE INDEX IF NOT EXISTS idx_analytics_events_component ON analytics.events(component);
        
        CREATE INDEX IF NOT EXISTS idx_cache_key ON cache.search_cache(cache_key);
        CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache.search_cache(expires_at);
        
        -- Create function for cache cleanup
        CREATE OR REPLACE FUNCTION cache.cleanup_expired_cache()
        RETURNS INTEGER AS \$\$
        DECLARE
            deleted_count INTEGER;
        BEGIN
            DELETE FROM cache.search_cache WHERE expires_at < NOW();
            GET DIAGNOSTICS deleted_count = ROW_COUNT;
            RETURN deleted_count;
        END;
        \$\$ LANGUAGE plpgsql;
        
        -- Create function for search analytics
        CREATE OR REPLACE FUNCTION analytics.record_search_event(
            p_event_type VARCHAR(100),
            p_user_id VARCHAR(255) DEFAULT NULL,
            p_session_id VARCHAR(255) DEFAULT NULL,
            p_component VARCHAR(100) DEFAULT 'cautai-search',
            p_event_data JSONB DEFAULT '{}'::jsonb
        )
        RETURNS UUID AS \$\$
        DECLARE
            event_id UUID;
        BEGIN
            INSERT INTO analytics.events (event_type, user_id, session_id, component, event_data)
            VALUES (p_event_type, p_user_id, p_session_id, p_component, p_event_data)
            RETURNING id INTO event_id;
            RETURN event_id;
        END;
        \$\$ LANGUAGE plpgsql;
        
        COMMENT ON DATABASE $database IS 'Cautai system database for $database services';
EOSQL
    
    echo "Database '$database' created successfully!"
}

# Create databases if POSTGRES_MULTIPLE_DATABASES is set
if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
    echo "Creating multiple databases: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_user_and_database "$db" "$POSTGRES_USER"
    done
    echo "Multiple databases created successfully!"
else
    echo "POSTGRES_MULTIPLE_DATABASES not set, skipping database creation"
fi

echo "Cautai database initialization complete!"