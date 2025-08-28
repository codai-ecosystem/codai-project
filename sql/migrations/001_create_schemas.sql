-- CODAI Essential Services - Database Schema Migration 001
-- Create initial schemas for all essential services
-- Date: 2025-08-27
-- Version: 1.0.0

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Note: vector extension will be installed separately if needed for embeddings

-- Create schemas for essential services
CREATE SCHEMA IF NOT EXISTS codai_auth;
CREATE SCHEMA IF NOT EXISTS codai_main; 
CREATE SCHEMA IF NOT EXISTS codai_bancai;
CREATE SCHEMA IF NOT EXISTS codai_analytics;
CREATE SCHEMA IF NOT EXISTS codai_memorai;

-- Grant permissions
GRANT USAGE ON SCHEMA codai_auth TO codai_user;
GRANT USAGE ON SCHEMA codai_main TO codai_user;
GRANT USAGE ON SCHEMA codai_bancai TO codai_user;
GRANT USAGE ON SCHEMA codai_analytics TO codai_user;
GRANT USAGE ON SCHEMA codai_memorai TO codai_user;

GRANT CREATE ON SCHEMA codai_auth TO codai_user;
GRANT CREATE ON SCHEMA codai_main TO codai_user;
GRANT CREATE ON SCHEMA codai_bancai TO codai_user;
GRANT CREATE ON SCHEMA codai_analytics TO codai_user;
GRANT CREATE ON SCHEMA codai_memorai TO codai_user;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA codai_auth GRANT ALL ON TABLES TO codai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA codai_main GRANT ALL ON TABLES TO codai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA codai_bancai GRANT ALL ON TABLES TO codai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA codai_analytics GRANT ALL ON TABLES TO codai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA codai_memorai GRANT ALL ON TABLES TO codai_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA codai_auth GRANT ALL ON SEQUENCES TO codai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA codai_main GRANT ALL ON SEQUENCES TO codai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA codai_bancai GRANT ALL ON SEQUENCES TO codai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA codai_analytics GRANT ALL ON SEQUENCES TO codai_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA codai_memorai GRANT ALL ON SEQUENCES TO codai_user;

-- Insert migration record
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('001', 'create_schemas', NOW())
ON CONFLICT (version) DO NOTHING;

-- Success message
SELECT 'Schema creation completed successfully' as status;