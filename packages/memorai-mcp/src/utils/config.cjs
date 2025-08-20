/**
 * 🧠 MemorAI MCP - Centralized Configuration
 * Consolidated configuration for all MemorAI MCP phases and components
 */

const os = require('os');

const CONFIG = {
    // Server Ports Configuration
    PORTS: {
        PHASE_2_CBD: process.env.MEMORAI_PHASE2_PORT || 8002,
        PHASE_3_INTELLIGENCE: process.env.MEMORAI_PHASE3_PORT || 8003,
        PHASE_4_ENTERPRISE: process.env.MEMORAI_PHASE4_PORT || 8004,
        PHASE_5_PERFORMANCE: process.env.MEMORAI_PHASE5_PORT || 8005,
        PHASE_6_REALTIME: process.env.MEMORAI_PHASE6_PORT || 8006,
        PHASE_6_WEBSOCKET: process.env.MEMORAI_PHASE6_WS_PORT || 9006,
        PHASE_7_AI: process.env.MEMORAI_PHASE7_PORT || 8007,
        PHASE_7_AI_PROCESSING: process.env.MEMORAI_PHASE7_AI_PROCESSING_PORT || 8008,
        PHASE_8_PRODUCTION: process.env.MEMORAI_PHASE8_PORT || 8009,
        PHASE_8_MONITORING: process.env.MEMORAI_PHASE8_MONITORING_PORT || 8010,
        PHASE_9_OBSERVABILITY: process.env.MEMORAI_PHASE9_PORT || 8011,
        PHASE_10_INTEGRATION: process.env.MEMORAI_PHASE10_PORT || 8012
    },

    // Authentication & Security
    SECURITY: {
        API_KEY: process.env.MEMORAI_API_KEY || 'memorai-dev-key-2025',
        ENCRYPTION_KEY: process.env.MEMORAI_ENCRYPTION_KEY || 'memorai-encryption-key-2025',
        JWT_SECRET: process.env.MEMORAI_JWT_SECRET || 'memorai-jwt-secret-2025',
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
            'http://localhost:3000',
            'http://localhost:4000',
            'http://localhost:4006',
            'http://localhost:8000'
        ]
    },

    // AI Configuration
    AI: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'openai-key-placeholder',
        MODEL: process.env.MEMORAI_AI_MODEL || 'gpt-4',
        EMBEDDING_MODEL: process.env.MEMORAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
        MAX_CONCURRENT: parseInt(process.env.MEMORAI_MAX_AI_CONCURRENT) || 100,
        LEARNING_RATE: parseFloat(process.env.MEMORAI_LEARNING_RATE) || 0.001,
        BATCH_SIZE: parseInt(process.env.MEMORAI_BATCH_SIZE) || 32,
        MAX_CONTEXT_LENGTH: parseInt(process.env.MEMORAI_MAX_CONTEXT_LENGTH) || 8192,
        CACHE_SIZE: parseInt(process.env.MEMORAI_AI_CACHE_SIZE) || 10000
    },

    // Performance Configuration
    PERFORMANCE: {
        MAX_SHARDS: parseInt(process.env.MEMORAI_MAX_SHARDS) || 256,
        CLUSTER_SIZE: parseInt(process.env.MEMORAI_CLUSTER_SIZE) || 4,
        LOAD_BALANCER_STRATEGIES: ['round_robin', 'least_connections', 'weighted_round_robin', 'resource_based'],
        CACHE_TTL: parseInt(process.env.MEMORAI_CACHE_TTL) || 3600000, // 1 hour
        MAX_CONCURRENT_CONNECTIONS: parseInt(process.env.MEMORAI_MAX_CONNECTIONS) || 1000,
        VECTOR_DIMENSIONS: parseInt(process.env.MEMORAI_VECTOR_DIMENSIONS) || 1536
    },

    // Database Configuration
    DATABASE: {
        CBD_URL: process.env.CBD_URL || 'http://localhost:4180',
        MAX_POOL_SIZE: parseInt(process.env.MEMORAI_DB_POOL_SIZE) || 20,
        CONNECTION_TIMEOUT: parseInt(process.env.MEMORAI_DB_TIMEOUT) || 30000,
        MAX_RETRIES: parseInt(process.env.MEMORAI_DB_RETRIES) || 3
    },

    // Real-time Configuration
    REALTIME: {
        MAX_CONNECTIONS: parseInt(process.env.MEMORAI_RT_MAX_CONNECTIONS) || 1000,
        HEARTBEAT_INTERVAL: parseInt(process.env.MEMORAI_RT_HEARTBEAT) || 30000,
        MESSAGE_BUFFER_SIZE: parseInt(process.env.MEMORAI_RT_BUFFER_SIZE) || 1000,
        SYNC_INTERVAL: parseInt(process.env.MEMORAI_RT_SYNC_INTERVAL) || 5000
    },

    // System Configuration
    SYSTEM: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        LOG_LEVEL: process.env.LOG_LEVEL || 'info',
        NODE_ID: process.env.MEMORAI_NODE_ID || `memorai-${os.hostname()}-${Date.now()}`,
        HOSTNAME: os.hostname(),
        PLATFORM: os.platform(),
        ARCH: os.arch(),
        NODE_VERSION: process.version
    },

    // Monitoring & Observability
    MONITORING: {
        METRICS_INTERVAL: parseInt(process.env.MEMORAI_METRICS_INTERVAL) || 60000,
        HEALTH_CHECK_TIMEOUT: parseInt(process.env.MEMORAI_HEALTH_TIMEOUT) || 5000,
        LOG_RETENTION_DAYS: parseInt(process.env.MEMORAI_LOG_RETENTION) || 30,
        ALERT_THRESHOLDS: {
            CPU_USAGE: parseFloat(process.env.MEMORAI_CPU_THRESHOLD) || 80,
            MEMORY_USAGE: parseFloat(process.env.MEMORAI_MEMORY_THRESHOLD) || 85,
            RESPONSE_TIME: parseInt(process.env.MEMORAI_RESPONSE_THRESHOLD) || 5000,
            ERROR_RATE: parseFloat(process.env.MEMORAI_ERROR_THRESHOLD) || 5
        }
    }
};

// Helper functions
CONFIG.getPhasePort = (phase) => {
    const portKey = `PHASE_${phase}_PORT`;
    return CONFIG.PORTS[portKey] || (8000 + phase);
};

CONFIG.isProduction = () => CONFIG.SYSTEM.NODE_ENV === 'production';
CONFIG.isDevelopment = () => CONFIG.SYSTEM.NODE_ENV === 'development';

// Validation
CONFIG.validate = () => {
    const required = [
        'SECURITY.API_KEY',
        'SYSTEM.NODE_ENV'
    ];

    for (const key of required) {
        const value = key.split('.').reduce((obj, k) => obj?.[k], CONFIG);
        if (!value) {
            throw new Error(`Missing required configuration: ${key}`);
        }
    }

    return true;
};

module.exports = CONFIG;
