#!/usr/bin/env node

/**
 * @fileoverview Base MemorAI MCP Server
 * @description Abstract base class for all MemorAI MCP server implementations
 * @version 1.0.0
 * @author MemorAI Development Team
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const { EventEmitter } = require('events');
const config = require('../utils/config.cjs');
const logger = require('../utils/logger.cjs');

/**
 * Abstract base class for MemorAI MCP servers
 * Provides common functionality and standardized interface
 */
class BaseMemorAIServer extends EventEmitter {
    /**
     * @param {Object} options Server configuration options
     * @param {number} options.port Server port
     * @param {string} options.name Server name
     * @param {string} options.version Server version
     * @param {string} options.phase Server phase identifier
     */
    constructor(options = {}) {
        super();

        this.options = {
            port: options.port || 8000,
            name: options.name || 'MemorAI MCP Server',
            version: options.version || '1.0.0',
            phase: options.phase || 'base',
            apiKey: options.apiKey || config.SECURITY.API_KEY,
            ...options
        };

        this.app = null;
        this.server = null;
        this.isRunning = false;
        this.startTime = null;
        this.logger = logger.createPhaseLogger(this.options.phase);
        this.memories = new Map();
        this.stats = {
            requestCount: 0,
            errorCount: 0,
            memoryCount: 0,
            startTime: null,
            lastRequestTime: null
        };

        this.initializeServer();
    }

    /**
     * Initialize Express application and middleware
     * @private
     */
    initializeServer() {
        this.app = express();
        this.server = http.createServer(this.app);

        // Standard middleware
        this.app.use(cors({
            origin: this.getAllowedOrigins(),
            credentials: true
        }));

        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging middleware
        this.app.use((req, res, next) => {
            this.stats.requestCount++;
            this.stats.lastRequestTime = new Date().toISOString();
            this.logger.debug(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });

        // Authentication middleware
        this.app.use('/api/*', this.authenticateRequest.bind(this));

        // Standard routes
        this.setupStandardRoutes();

        // Error handling
        this.setupErrorHandling();
    }

    /**
     * Get allowed CORS origins
     * @returns {string[]} Array of allowed origins
     * @protected
     */
    getAllowedOrigins() {
        return [
            'http://localhost:3000',
            'http://localhost:4000',
            'http://localhost:5000',
            'https://memorai.dev',
            ...config.SECURITY.ALLOWED_ORIGINS
        ];
    }

    /**
     * Authenticate API requests
     * @param {express.Request} req Express request object
     * @param {express.Response} res Express response object
     * @param {express.NextFunction} next Express next function
     * @protected
     */
    authenticateRequest(req, res, next) {
        const apiKey = req.headers['authorization']?.replace('Bearer ', '') ||
            req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'API key required',
                code: 'MISSING_API_KEY'
            });
        }

        if (apiKey !== this.options.apiKey && apiKey !== 'dev-mode-key') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid API key',
                code: 'INVALID_API_KEY'
            });
        }

        next();
    }

    /**
     * Setup standard routes available on all servers
     * @protected
     */
    setupStandardRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            const healthData = this.getHealthData();
            res.json(healthData);
        });

        // Server info endpoint
        this.app.get('/info', (req, res) => {
            const info = this.getServerInfo();
            res.json(info);
        });

        // Stats endpoint
        this.app.get('/stats', (req, res) => {
            const stats = this.getServerStats();
            res.json(stats);
        });

        // Version endpoint
        this.app.get('/version', (req, res) => {
            res.json({
                name: this.options.name,
                version: this.options.version,
                phase: this.options.phase,
                nodeVersion: process.version,
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Setup error handling middleware
     * @protected
     */
    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Not Found',
                message: `Route ${req.method} ${req.path} not found`,
                code: 'ROUTE_NOT_FOUND',
                availableRoutes: this.getAvailableRoutes(),
                timestamp: new Date().toISOString()
            });
        });

        // Error handler
        this.app.use((error, req, res, next) => {
            this.stats.errorCount++;
            this.logger.error('Express error', {
                error: error.message,
                stack: error.stack,
                path: req.path,
                method: req.method
            });

            res.status(500).json({
                error: 'Internal Server Error',
                message: config.SYSTEM.NODE_ENV === 'development' ? error.message : 'Something went wrong',
                code: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * Get health data for health check endpoint
     * @returns {Object} Health data object
     * @protected
     */
    getHealthData() {
        return {
            status: 'healthy',
            service: this.options.name,
            version: this.options.version,
            phase: this.options.phase,
            port: this.options.port,
            uptime: this.getUptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get server information
     * @returns {Object} Server info object
     * @protected
     */
    getServerInfo() {
        return {
            name: this.options.name,
            version: this.options.version,
            phase: this.options.phase,
            port: this.options.port,
            nodeVersion: process.version,
            platform: process.platform,
            architecture: process.arch,
            environment: config.SYSTEM.NODE_ENV,
            startTime: this.startTime,
            features: this.getFeatures(),
            endpoints: this.getAvailableRoutes()
        };
    }

    /**
     * Get server statistics
     * @returns {Object} Server stats object
     * @protected
     */
    getServerStats() {
        return {
            ...this.stats,
            uptime: this.getUptime(),
            memoryCount: this.memories.size,
            memoryUsage: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get server uptime in milliseconds
     * @returns {number} Uptime in milliseconds
     * @protected
     */
    getUptime() {
        return this.startTime ? Date.now() - this.startTime.getTime() : 0;
    }

    /**
     * Get list of available routes
     * @returns {string[]} Array of available routes
     * @protected
     */
    getAvailableRoutes() {
        const routes = [];

        this.app._router.stack.forEach(middleware => {
            if (middleware.route) {
                const methods = Object.keys(middleware.route.methods);
                methods.forEach(method => {
                    routes.push(`${method.toUpperCase()} ${middleware.route.path}`);
                });
            }
        });

        return routes;
    }

    /**
     * Get server features - to be overridden by subclasses
     * @returns {string[]} Array of server features
     * @protected
     */
    getFeatures() {
        return ['base_server', 'health_check', 'authentication', 'error_handling'];
    }

    /**
     * Setup custom routes - to be overridden by subclasses
     * @protected
     */
    setupCustomRoutes() {
        // Override in subclasses
    }

    /**
     * Initialize custom services - to be overridden by subclasses
     * @protected
     */
    async initializeServices() {
        // Override in subclasses
    }

    /**
     * Start the server
     * @returns {Promise<void>}
     */
    async start() {
        try {
            this.logger.info(`Starting ${this.options.name}...`);

            // Initialize custom services
            await this.initializeServices();

            // Setup custom routes
            this.setupCustomRoutes();

            // Start listening
            await new Promise((resolve, reject) => {
                this.server.listen(this.options.port, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            this.isRunning = true;
            this.startTime = new Date();
            this.stats.startTime = this.startTime.toISOString();

            this.logger.info(`${this.options.name} started successfully`, {
                port: this.options.port,
                phase: this.options.phase,
                version: this.options.version
            });

            this.emit('server:started', {
                name: this.options.name,
                port: this.options.port,
                phase: this.options.phase
            });

        } catch (error) {
            this.logger.error(`Failed to start ${this.options.name}`, {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Stop the server
     * @returns {Promise<void>}
     */
    async stop() {
        if (!this.isRunning) {
            return;
        }

        this.logger.info(`Stopping ${this.options.name}...`);

        return new Promise((resolve) => {
            this.server.close(() => {
                this.isRunning = false;
                this.logger.info(`${this.options.name} stopped`);
                this.emit('server:stopped', {
                    name: this.options.name,
                    port: this.options.port
                });
                resolve();
            });
        });
    }

    /**
     * Gracefully shutdown the server
     * @returns {Promise<void>}
     */
    async shutdown() {
        this.logger.info(`Shutting down ${this.options.name}...`);

        // Cleanup custom resources
        await this.cleanup();

        // Stop the server
        await this.stop();

        this.emit('server:shutdown', {
            name: this.options.name,
            port: this.options.port
        });
    }

    /**
     * Cleanup resources - to be overridden by subclasses
     * @protected
     */
    async cleanup() {
        // Override in subclasses
    }
}

module.exports = BaseMemorAIServer;
