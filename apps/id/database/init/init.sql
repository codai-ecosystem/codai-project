-- CODAI ID Database Initialization
-- Creates necessary users, databases, and extensions

-- Create Keycloak database and user
CREATE DATABASE keycloak;
CREATE USER keycloak_user WITH ENCRYPTED PASSWORD 'your_keycloak_db_password_here';
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak_user;

-- Create replication user
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'your_replication_password_here';

-- Install extensions for main database
\c codai_id;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_hash ON users USING hash(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone_hash ON users USING hash(phone_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp_desc ON audit_logs (timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expires ON sessions (expires);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Grant permissions
GRANT CONNECT ON DATABASE codai_id TO codai_user;
GRANT USAGE ON SCHEMA public TO codai_user;
GRANT CREATE ON SCHEMA public TO codai_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO codai_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO codai_user;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO codai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO codai_user;

-- Create audit log function
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id TEXT,
    p_action TEXT,
    p_resource TEXT,
    p_resource_id TEXT,
    p_ip_address TEXT,
    p_user_agent TEXT,
    p_details JSONB,
    p_outcome TEXT
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id, action, resource, resource_id,
        ip_address, user_agent, details, outcome
    ) VALUES (
        p_user_id, p_action, p_resource, p_resource_id,
        p_ip_address, p_user_agent, p_details, p_outcome
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql;
