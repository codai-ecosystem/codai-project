-- CODAI Hub Service Schema - Migration 003  
-- Create service orchestration and monitoring tables
-- Date: 2025-08-27
-- Version: 1.0.0

-- Service registry for microservices
CREATE TABLE codai_main.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    version VARCHAR(20) NOT NULL,
    description TEXT,
    endpoint VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    protocol VARCHAR(10) DEFAULT 'http' CHECK (protocol IN ('http', 'https', 'grpc')),
    health_check_path VARCHAR(255) DEFAULT '/health',
    health_check_interval INTEGER DEFAULT 30, -- seconds
    health_check_timeout INTEGER DEFAULT 5,   -- seconds
    healthy BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'starting' CHECK (status IN ('starting', 'running', 'stopping', 'stopped', 'error')),
    instance_count INTEGER DEFAULT 1,
    load_balancer_config JSONB DEFAULT '{"algorithm": "round-robin"}',
    circuit_breaker_config JSONB DEFAULT '{"enabled": true, "failure_threshold": 5, "reset_timeout": 60}',
    metadata JSONB DEFAULT '{}',
    registered_at TIMESTAMP DEFAULT NOW(),
    last_heartbeat TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Service instances for load balancing
CREATE TABLE codai_main.service_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES codai_main.services(id) ON DELETE CASCADE,
    instance_id VARCHAR(100) NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    ip_address INET,
    healthy BOOLEAN DEFAULT TRUE,
    weight INTEGER DEFAULT 1,
    current_load INTEGER DEFAULT 0,
    max_load INTEGER DEFAULT 100,
    last_health_check TIMESTAMP,
    health_check_failures INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    registered_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_id, instance_id)
);

-- Events for service orchestration
CREATE TABLE codai_main.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    service_name VARCHAR(100),
    instance_id VARCHAR(100),
    payload JSONB DEFAULT '{}',
    source VARCHAR(100),
    correlation_id UUID,
    parent_event_id UUID REFERENCES codai_main.events(id),
    status VARCHAR(20) DEFAULT 'created' CHECK (status IN ('created', 'processing', 'completed', 'failed', 'cancelled')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_for TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Health check history
CREATE TABLE codai_main.health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES codai_main.services(id) ON DELETE CASCADE,
    instance_id UUID REFERENCES codai_main.service_instances(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'unhealthy', 'timeout', 'error')),
    response_time_ms INTEGER,
    status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    checked_at TIMESTAMP DEFAULT NOW()
);

-- Service dependencies for orchestration
CREATE TABLE codai_main.service_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES codai_main.services(id) ON DELETE CASCADE,
    depends_on_service_id UUID NOT NULL REFERENCES codai_main.services(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'required' CHECK (dependency_type IN ('required', 'optional', 'conditional')),
    condition JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_id, depends_on_service_id)
);

-- Deployment history
CREATE TABLE codai_main.deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES codai_main.services(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    image_tag VARCHAR(255),
    config_hash VARCHAR(64),
    deployment_strategy VARCHAR(50) DEFAULT 'rolling',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'deploying', 'deployed', 'failed', 'rolled_back')),
    deployed_by VARCHAR(100),
    deployment_notes TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    rollback_deployment_id UUID REFERENCES codai_main.deployments(id)
);

-- Metrics for monitoring
CREATE TABLE codai_main.service_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES codai_main.services(id) ON DELETE CASCADE,
    instance_id UUID REFERENCES codai_main.service_instances(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20,8) NOT NULL,
    metric_type VARCHAR(20) DEFAULT 'gauge' CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'summary')),
    labels JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_services_name ON codai_main.services(name);
CREATE INDEX idx_services_status ON codai_main.services(status);
CREATE INDEX idx_services_healthy ON codai_main.services(healthy);
CREATE INDEX idx_services_last_heartbeat ON codai_main.services(last_heartbeat);

CREATE INDEX idx_service_instances_service_id ON codai_main.service_instances(service_id);
CREATE INDEX idx_service_instances_healthy ON codai_main.service_instances(healthy);
CREATE INDEX idx_service_instances_last_health_check ON codai_main.service_instances(last_health_check);

CREATE INDEX idx_events_event_type ON codai_main.events(event_type);
CREATE INDEX idx_events_service_name ON codai_main.events(service_name);
CREATE INDEX idx_events_status ON codai_main.events(status);
CREATE INDEX idx_events_correlation_id ON codai_main.events(correlation_id);
CREATE INDEX idx_events_created_at ON codai_main.events(created_at);
CREATE INDEX idx_events_scheduled_for ON codai_main.events(scheduled_for);

CREATE INDEX idx_health_checks_service_id ON codai_main.health_checks(service_id);
CREATE INDEX idx_health_checks_status ON codai_main.health_checks(status);
CREATE INDEX idx_health_checks_checked_at ON codai_main.health_checks(checked_at);

CREATE INDEX idx_service_dependencies_service_id ON codai_main.service_dependencies(service_id);
CREATE INDEX idx_service_dependencies_depends_on ON codai_main.service_dependencies(depends_on_service_id);

CREATE INDEX idx_deployments_service_id ON codai_main.deployments(service_id);
CREATE INDEX idx_deployments_status ON codai_main.deployments(status);
CREATE INDEX idx_deployments_started_at ON codai_main.deployments(started_at);

CREATE INDEX idx_service_metrics_service_id ON codai_main.service_metrics(service_id);
CREATE INDEX idx_service_metrics_metric_name ON codai_main.service_metrics(metric_name);
CREATE INDEX idx_service_metrics_timestamp ON codai_main.service_metrics(timestamp);

-- Create partitioned table for metrics (by day) - Skip if TimescaleDB not available
-- SELECT create_hypertable('codai_main.service_metrics', 'timestamp', chunk_time_interval => INTERVAL '1 day');

-- Update trigger
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON codai_main.services
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

CREATE TRIGGER update_service_instances_updated_at BEFORE UPDATE ON codai_main.service_instances
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

-- Insert default services
INSERT INTO codai_main.services (name, display_name, version, endpoint, port, description) VALUES
('identity-api', 'Identity API', '1.0.0', 'http://localhost:8100', 8100, 'User authentication and authorization service'),
('api-gateway', 'API Gateway', '1.0.0', 'http://localhost:8010', 8010, 'Main API gateway for routing and load balancing'),
('hub-api', 'Hub API', '1.0.0', 'http://localhost:8110', 8110, 'Service orchestration and monitoring hub'),
('memorai-mcp', 'MemorAI MCP', '1.0.0', 'http://localhost:4950', 4950, 'Memory Context Protocol server'),
('memorai-graphql', 'MemorAI GraphQL', '1.0.0', 'http://localhost:4500', 4500, 'MemorAI GraphQL API'),
('memorai-frontend', 'MemorAI Frontend', '1.0.0', 'http://localhost:8006', 8006, 'MemorAI web interface'),
('bancai-service', 'BancAI Service', '1.0.0', 'http://localhost:8120', 8120, 'Financial services and wallet management'),
('cbd-database', 'CBD Database', '1.0.0', 'http://localhost:8180', 8180, 'Graph database service');

-- Insert migration record
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('003', 'create_hub_service_tables', NOW())
ON CONFLICT (version) DO NOTHING;

-- Success message
SELECT 'Hub service schema created successfully' as status;