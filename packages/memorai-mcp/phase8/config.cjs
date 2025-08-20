/**
 * 🚀 MemorAI MCP Phase 8: Production Deployment & DevOps - Configuration
 * 
 * Centralized configuration management for production deployment
 */

const os = require('os');

const CONFIG = {
    // Server Configuration
    PORT: process.env.MEMORAI_PROD_PORT || 8008,
    API_KEY: process.env.MEMORAI_API_KEY || 'memorai-prod-key-2025',
    NODE_ENV: process.env.NODE_ENV || 'production',
    NODE_ID: process.env.MEMORAI_NODE_ID || `memorai-prod-${os.hostname()}-${Date.now()}`,

    // Production Settings
    CLUSTER_SIZE: parseInt(process.env.MEMORAI_CLUSTER_SIZE) || os.cpus().length,
    MAX_MEMORY: process.env.MEMORAI_MAX_MEMORY || '4GB',
    HEALTH_CHECK_INTERVAL: parseInt(process.env.MEMORAI_HEALTH_INTERVAL) || 30000,

    // Docker Configuration
    DOCKER: {
        IMAGE_NAME: 'memorai-mcp-prod',
        TAG: process.env.MEMORAI_VERSION || 'latest',
        REGISTRY: process.env.DOCKER_REGISTRY || 'docker.io',
        NETWORK: 'memorai-network',
        VOLUME: 'memorai-data'
    },

    // Kubernetes Configuration
    K8S: {
        NAMESPACE: 'memorai-prod',
        SERVICE_NAME: 'memorai-mcp-service',
        DEPLOYMENT_NAME: 'memorai-mcp-deployment',
        REPLICAS: parseInt(process.env.K8S_REPLICAS) || 3,
        CPU_LIMIT: process.env.K8S_CPU_LIMIT || '2000m',
        MEMORY_LIMIT: process.env.K8S_MEMORY_LIMIT || '4Gi'
    },

    // CI/CD Configuration
    CI_CD: {
        GITHUB_ACTIONS: true,
        BUILD_TIMEOUT: 600, // 10 minutes
        TEST_TIMEOUT: 300,  // 5 minutes
        DEPLOY_TIMEOUT: 900, // 15 minutes
        ENVIRONMENTS: ['development', 'staging', 'production']
    },

    // Monitoring Configuration
    MONITORING: {
        PROMETHEUS_PORT: 9090,
        GRAFANA_PORT: 3000,
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        METRICS_INTERVAL: 15000,
        ALERT_WEBHOOK: process.env.ALERT_WEBHOOK_URL
    },

    // Security Configuration
    SECURITY: {
        TLS_ENABLED: process.env.TLS_ENABLED === 'true',
        CERT_PATH: process.env.CERT_PATH || '/certs',
        JWT_SECRET: process.env.JWT_SECRET || 'memorai-jwt-secret-2025',
        RATE_LIMIT: parseInt(process.env.RATE_LIMIT) || 1000,
        CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['https://memorai.dev']
    },

    // Database Configuration
    DATABASE: {
        CONNECTION_POOL_SIZE: parseInt(process.env.DB_POOL_SIZE) || 20,
        CONNECTION_TIMEOUT: parseInt(process.env.DB_TIMEOUT) || 30000,
        RETRY_ATTEMPTS: parseInt(process.env.DB_RETRY_ATTEMPTS) || 3,
        BACKUP_INTERVAL: parseInt(process.env.BACKUP_INTERVAL) || 3600000 // 1 hour
    }
};

module.exports = CONFIG;
