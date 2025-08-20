"use strict";
/*!
 * CBD MCP Server Configuration
 * Manages configuration for the CBD Model Context Protocol server
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
exports.validateConfig = validateConfig;
var DEFAULT_CONFIG = {
    server: {
        name: 'cbd-mcp-server',
        version: '1.0.0',
        maxConnections: 10,
        timeout: 30000, // 30 seconds
    },
    database: {
        memory: false,
        maxVectors: 1000000,
        dimension: 1536, // OpenAI embedding dimension
        options: {
            indexType: 'hnsw',
            metric: 'cosine',
        },
    },
    logging: {
        level: 'info',
        format: 'json',
        enabled: true,
    },
    performance: {
        batchSize: 1000,
        cacheSize: 10000,
        indexOptimizeThreshold: 10000,
    },
};
/**
 * Get CBD MCP server configuration with environment variable overrides
 */
function getConfig() {
    var config = __assign({}, DEFAULT_CONFIG);
    // Server configuration overrides
    if (process.env.CBD_MCP_SERVER_NAME) {
        config.server.name = process.env.CBD_MCP_SERVER_NAME;
    }
    if (process.env.CBD_MCP_MAX_CONNECTIONS) {
        config.server.maxConnections = parseInt(process.env.CBD_MCP_MAX_CONNECTIONS, 10);
    }
    if (process.env.CBD_MCP_TIMEOUT) {
        config.server.timeout = parseInt(process.env.CBD_MCP_TIMEOUT, 10);
    }
    // Database configuration overrides
    if (process.env.CBD_DATABASE_PATH) {
        config.database.path = process.env.CBD_DATABASE_PATH;
    }
    if (process.env.CBD_DATABASE_MEMORY === 'true') {
        config.database.memory = true;
    }
    if (process.env.CBD_MAX_VECTORS) {
        config.database.maxVectors = parseInt(process.env.CBD_MAX_VECTORS, 10);
    }
    if (process.env.CBD_VECTOR_DIMENSION) {
        config.database.dimension = parseInt(process.env.CBD_VECTOR_DIMENSION, 10);
    }
    // Logging configuration overrides
    if (process.env.CBD_LOG_LEVEL) {
        config.logging.level = process.env.CBD_LOG_LEVEL;
    }
    if (process.env.CBD_LOG_FORMAT) {
        config.logging.format = process.env.CBD_LOG_FORMAT;
    }
    if (process.env.CBD_LOG_ENABLED === 'false') {
        config.logging.enabled = false;
    }
    // Performance configuration overrides
    if (process.env.CBD_BATCH_SIZE) {
        config.performance.batchSize = parseInt(process.env.CBD_BATCH_SIZE, 10);
    }
    if (process.env.CBD_CACHE_SIZE) {
        config.performance.cacheSize = parseInt(process.env.CBD_CACHE_SIZE, 10);
    }
    if (process.env.CBD_OPTIMIZE_THRESHOLD) {
        config.performance.indexOptimizeThreshold = parseInt(process.env.CBD_OPTIMIZE_THRESHOLD, 10);
    }
    return config;
}
/**
 * Validate configuration values
 */
function validateConfig(config) {
    var errors = [];
    if (config.server.maxConnections <= 0) {
        errors.push('server.maxConnections must be positive');
    }
    if (config.server.timeout <= 0) {
        errors.push('server.timeout must be positive');
    }
    if (config.database.maxVectors && config.database.maxVectors <= 0) {
        errors.push('database.maxVectors must be positive');
    }
    if (config.database.dimension && config.database.dimension <= 0) {
        errors.push('database.dimension must be positive');
    }
    if (config.performance.batchSize <= 0) {
        errors.push('performance.batchSize must be positive');
    }
    if (config.performance.cacheSize <= 0) {
        errors.push('performance.cacheSize must be positive');
    }
    return errors;
}
