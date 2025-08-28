-- CODAI Identity Service Schema - Migration 002
-- Create user management and authentication tables
-- Date: 2025-08-27
-- Version: 1.0.0

-- Users table for identity management
CREATE TABLE codai_auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL for OAuth-only accounts
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- OAuth accounts for external authentication
CREATE TABLE codai_auth.oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES codai_auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('google', 'github', 'microsoft')),
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    provider_data JSONB DEFAULT '{}',
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

-- User sessions for JWT tracking
CREATE TABLE codai_auth.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES codai_auth.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User roles and permissions
CREATE TABLE codai_auth.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User role assignments
CREATE TABLE codai_auth.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES codai_auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES codai_auth.roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES codai_auth.users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- Audit log for authentication events
CREATE TABLE codai_auth.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES codai_auth.users(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON codai_auth.users(email);
CREATE INDEX idx_users_email_verified ON codai_auth.users(email_verified);
CREATE INDEX idx_users_status ON codai_auth.users(status);
CREATE INDEX idx_users_created_at ON codai_auth.users(created_at);

CREATE INDEX idx_oauth_accounts_user_id ON codai_auth.oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON codai_auth.oauth_accounts(provider);

CREATE INDEX idx_user_sessions_user_id ON codai_auth.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON codai_auth.user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON codai_auth.user_sessions(expires_at);
CREATE INDEX idx_user_sessions_is_active ON codai_auth.user_sessions(is_active);

CREATE INDEX idx_user_roles_user_id ON codai_auth.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON codai_auth.user_roles(role_id);

CREATE INDEX idx_audit_log_user_id ON codai_auth.audit_log(user_id);
CREATE INDEX idx_audit_log_event_type ON codai_auth.audit_log(event_type);
CREATE INDEX idx_audit_log_timestamp ON codai_auth.audit_log(timestamp);

-- Create default roles
INSERT INTO codai_auth.roles (name, description, permissions, is_system_role) VALUES
('super_admin', 'Super Administrator with full system access', '["*"]', true),
('admin', 'Administrator with management permissions', '["users:read", "users:write", "services:read", "services:write"]', true),
('user', 'Standard user with basic permissions', '["profile:read", "profile:write", "services:read"]', true),
('service', 'Service account for inter-service communication', '["services:read", "services:write"]', true);

-- Update trigger function
CREATE OR REPLACE FUNCTION codai_auth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON codai_auth.users
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

CREATE TRIGGER update_oauth_accounts_updated_at BEFORE UPDATE ON codai_auth.oauth_accounts
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON codai_auth.user_sessions
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON codai_auth.roles
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

-- Insert migration record
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('002', 'create_identity_tables', NOW())
ON CONFLICT (version) DO NOTHING;

-- Success message
SELECT 'Identity service schema created successfully' as status;