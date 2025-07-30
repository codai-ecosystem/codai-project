/**
 * Advanced Performance Monitoring System
 * 
 * Provides comprehensive performance monitoring for the CODAI ecosystem with:
 * - Real-time metrics collection and analysis
 * - Advanced alerting and threshold management
 * - Performance optimization recommendations
 * - System resource monitoring and profiling
 * - Application performance insights and analytics
 * - Automated performance regression detection
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import axios from 'axios';
import prom from 'prom-client';
import EventEmitter from 'eventemitter3';
import chalk from 'chalk';
import ora from 'ora';
import _ from 'lodash';
import moment from 'moment';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import si from 'systeminformation';
import osUtils from 'node-os-utils';
import pidusage from 'pidusage';
import { createServer } from 'http';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Advanced Performance Monitoring Engine
 * 
 * Monitors CODAI ecosystem performance with intelligent analytics,
 * real-time alerting, and automated optimization recommendations.
 */
export class PerformanceMonitoring extends EventEmitter {
    constructor(options = {}) {
        super();

        // Configuration
        this.config = {
            port: options.port || 4008,
            host: options.host || 'localhost',
            redis: {
                url: options.redisUrl || 'redis://localhost:6379',
                keyPrefix: 'codai:performance:'
            },
            websocket: {
                enabled: options.enableWebSocket !== false,
                port: 4009,
                maxConnections: 1000
            },
            monitoring: {
                interval: options.interval || 5000,
                retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
                alertCheckInterval: 30000, // 30 seconds
                systemMetricsInterval: 10000, // 10 seconds
                detailedMetricsInterval: 60000 // 1 minute
            },
            services: {
                gateway: { url: 'http://localhost:4000', name: 'Gateway Service' },
                codai: { url: 'http://localhost:4001', name: 'CODAI Service' },
                admin: { url: 'http://localhost:4002', name: 'Admin Service' },
                hub: { url: 'http://localhost:4003', name: 'Hub Service' },
                id: { url: 'http://localhost:4004', name: 'ID Service' },
                bancai: { url: 'http://localhost:4005', name: 'BancAI Service' },
                memorai: { url: 'http://localhost:4006', name: 'MemorAI Service' },
                cbd: { url: 'http://localhost:4007', name: 'CBD Engine Service' }
            },
            thresholds: {
                responseTime: {
                    warning: 1000,
                    critical: 5000
                },
                errorRate: {
                    warning: 5,
                    critical: 15
                },
                cpuUsage: {
                    warning: 70,
                    critical: 90
                },
                memoryUsage: {
                    warning: 80,
                    critical: 95
                },
                diskUsage: {
                    warning: 85,
                    critical: 95
                }
            },
            optimization: {
                autoOptimize: options.autoOptimize !== false,
                recommendationEngine: true,
                performanceBaseline: true,
                regressionDetection: true
            }
        };

        // Core components
        this.app = express();
        this.server = null;
        this.wsServer = null;
        this.redis = null;

        // Prometheus metrics registry
        this.prometheusRegistry = new prom.Registry();
        prom.collectDefaultMetrics({ register: this.prometheusRegistry });

        // Custom metrics
        this.metrics = {
            // HTTP metrics
            httpRequestDuration: new prom.Histogram({
                name: 'codai_http_request_duration_seconds',
                help: 'Duration of HTTP requests in seconds',
                labelNames: ['service', 'method', 'status_code', 'endpoint'],
                buckets: [0.1, 0.5, 1, 2, 5, 10]
            }),
            httpRequestTotal: new prom.Counter({
                name: 'codai_http_requests_total',
                help: 'Total number of HTTP requests',
                labelNames: ['service', 'method', 'status_code', 'endpoint']
            }),

            // Service metrics
            serviceHealth: new prom.Gauge({
                name: 'codai_service_health',
                help: 'Service health status (1 = healthy, 0 = unhealthy)',
                labelNames: ['service']
            }),
            serviceResponseTime: new prom.Gauge({
                name: 'codai_service_response_time_ms',
                help: 'Service response time in milliseconds',
                labelNames: ['service']
            }),

            // System metrics
            systemCpuUsage: new prom.Gauge({
                name: 'codai_system_cpu_usage_percent',
                help: 'System CPU usage percentage'
            }),
            systemMemoryUsage: new prom.Gauge({
                name: 'codai_system_memory_usage_percent',
                help: 'System memory usage percentage'
            }),
            systemDiskUsage: new prom.Gauge({
                name: 'codai_system_disk_usage_percent',
                help: 'System disk usage percentage'
            }),

            // Application metrics
            activeConnections: new prom.Gauge({
                name: 'codai_active_connections',
                help: 'Number of active connections'
            }),
            memoryHeapUsed: new prom.Gauge({
                name: 'codai_memory_heap_used_bytes',
                help: 'Memory heap used in bytes'
            }),
            eventLoopLag: new prom.Gauge({
                name: 'codai_event_loop_lag_seconds',
                help: 'Event loop lag in seconds'
            })
        };

        // Register custom metrics
        Object.values(this.metrics).forEach(metric => {
            this.prometheusRegistry.register(metric);
        });

        // Performance data storage
        this.performanceData = {
            services: new Map(),
            system: new Map(),
            alerts: new Map(),
            baselines: new Map(),
            trends: new Map()
        };

        // Alert system
        this.alertSystem = {
            activeAlerts: new Map(),
            alertHistory: [],
            suppressedAlerts: new Set(),
            escalationRules: new Map()
        };

        // Optimization engine
        this.optimizationEngine = {
            recommendations: new Map(),
            appliedOptimizations: new Map(),
            performanceImprovements: new Map()
        };

        // Connected clients
        this.connectedClients = new Set();

        // Initialize spinner
        this.spinner = ora('Performance Monitoring initializing...').start();

        this.logger = this.createLogger();
    }

    /**
     * Initialize the performance monitoring system
     */
    async initialize() {
        try {
            this.logger('📊 Initializing Performance Monitoring System...');

            // Initialize Redis for data persistence
            await this.initializeRedis();

            // Setup Express server
            await this.setupExpressServer();

            // Initialize WebSocket server
            if (this.config.websocket.enabled) {
                await this.initializeWebSocket();
            }

            // Start monitoring loops
            await this.startMonitoring();

            // Initialize alert system
            await this.initializeAlertSystem();

            // Setup optimization engine
            await this.initializeOptimizationEngine();

            // Load historical baselines
            await this.loadPerformanceBaselines();

            // Start the server
            await this.start();

            this.spinner.succeed('Performance Monitoring initialized successfully');
            this.logger('✅ Performance Monitoring ready for comprehensive analysis');

            // Emit initialization complete event
            this.emit('initialized', {
                services: Object.keys(this.config.services).length,
                metricsCollected: Object.keys(this.metrics).length,
                websocket: this.config.websocket.enabled
            });

            return {
                status: 'success',
                message: 'Performance Monitoring initialized successfully',
                features: [
                    'real_time_metrics',
                    'service_health_monitoring',
                    'system_resource_tracking',
                    'automated_alerting',
                    'performance_optimization',
                    'regression_detection',
                    'prometheus_integration'
                ]
            };

        } catch (error) {
            this.spinner.fail('Performance Monitoring initialization failed');
            this.logger(`❌ Initialization error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Initialize Redis for data persistence
     */
    async initializeRedis() {
        try {
            this.redis = createClient({ url: this.config.redis.url });

            this.redis.on('error', (error) => {
                this.logger(`❌ Redis error: ${error.message}`);
            });

            await this.redis.connect();
            this.logger('✅ Redis connection established');

        } catch (error) {
            this.logger(`⚠️ Redis connection failed: ${error.message}`);
        }
    }

    /**
     * Setup Express server with monitoring endpoints
     */
    async setupExpressServer() {
        // Middleware
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(compression());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request timing middleware
        this.app.use((req, res, next) => {
            req.startTime = Date.now();
            req.requestId = uuidv4();

            res.on('finish', () => {
                const duration = Date.now() - req.startTime;

                // Record metrics
                this.metrics.httpRequestDuration.observe(
                    { service: 'monitoring', method: req.method, status_code: res.statusCode, endpoint: req.route?.path || req.path },
                    duration / 1000
                );

                this.metrics.httpRequestTotal.inc({
                    service: 'monitoring',
                    method: req.method,
                    status_code: res.statusCode,
                    endpoint: req.route?.path || req.path
                });
            });

            next();
        });

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: Object.keys(this.config.services).length,
                activeAlerts: this.alertSystem.activeAlerts.size,
                uptime: process.uptime()
            });
        });

        // Metrics endpoint (Prometheus format)
        this.app.get('/metrics', async (req, res) => {
            try {
                res.set('Content-Type', this.prometheusRegistry.contentType);
                res.end(await this.prometheusRegistry.metrics());
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Performance dashboard endpoint
        this.app.get('/dashboard', async (req, res) => {
            try {
                const dashboard = await this.generateDashboard();
                res.json(dashboard);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Service metrics endpoint
        this.app.get('/services/:serviceId/metrics', async (req, res) => {
            try {
                const metrics = await this.getServiceMetrics(req.params.serviceId);
                res.json(metrics);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Alerts endpoint
        this.app.get('/alerts', (req, res) => {
            const alerts = Array.from(this.alertSystem.activeAlerts.values());
            res.json({ alerts, count: alerts.length });
        });

        // Optimization recommendations endpoint
        this.app.get('/recommendations', async (req, res) => {
            try {
                const recommendations = await this.generateOptimizationRecommendations();
                res.json(recommendations);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Performance trend analysis endpoint
        this.app.get('/trends/:metric', async (req, res) => {
            try {
                const trend = await this.analyzeTrend(req.params.metric, req.query);
                res.json(trend);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.logger('✅ Express server configured with monitoring endpoints');
    }

    /**
     * Initialize WebSocket server for real-time updates
     */
    async initializeWebSocket() {
        this.server = createServer(this.app);

        this.wsServer = new WebSocketServer({
            server: this.server,
            path: '/monitoring'
        });

        this.wsServer.on('connection', (ws, req) => {
            this.connectedClients.add(ws);
            this.metrics.activeConnections.set(this.connectedClients.size);

            this.logger(`📊 New monitoring client connected (${this.connectedClients.size} total)`);

            // Send welcome message with current status
            ws.send(JSON.stringify({
                type: 'connected',
                message: 'Connected to Performance Monitoring',
                timestamp: new Date().toISOString(),
                services: Object.keys(this.config.services).length,
                activeAlerts: this.alertSystem.activeAlerts.size
            }));

            // Handle messages
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.handleWebSocketMessage(ws, data);
                } catch (error) {
                    this.logger(`❌ Invalid WebSocket message: ${error.message}`);
                }
            });

            // Handle disconnection
            ws.on('close', () => {
                this.connectedClients.delete(ws);
                this.metrics.activeConnections.set(this.connectedClients.size);
                this.logger(`📊 Monitoring client disconnected`);
            });
        });

        this.logger('✅ WebSocket server initialized for real-time monitoring');
    }

    /**
     * Start monitoring loops
     */
    async startMonitoring() {
        // Service health monitoring
        setInterval(async () => {
            await this.monitorServices();
        }, this.config.monitoring.interval);

        // System metrics monitoring
        setInterval(async () => {
            await this.monitorSystemMetrics();
        }, this.config.monitoring.systemMetricsInterval);

        // Detailed metrics collection
        setInterval(async () => {
            await this.collectDetailedMetrics();
        }, this.config.monitoring.detailedMetricsInterval);

        // Data cleanup
        cron.schedule('0 0 * * *', async () => {
            await this.cleanupOldData();
        });

        this.logger('✅ Monitoring loops started');
    }

    /**
     * Monitor service health and performance
     */
    async monitorServices() {
        const servicePromises = Object.entries(this.config.services).map(async ([serviceId, serviceConfig]) => {
            const startTime = Date.now();

            try {
                const response = await axios.get(`${serviceConfig.url}/health`, {
                    timeout: 10000,
                    headers: { 'X-Monitor-Request': 'true' }
                });

                const responseTime = Date.now() - startTime;

                // Update metrics
                this.metrics.serviceHealth.set({ service: serviceId }, 1);
                this.metrics.serviceResponseTime.set({ service: serviceId }, responseTime);

                // Store performance data
                const performanceData = {
                    serviceId,
                    timestamp: new Date(),
                    responseTime,
                    status: 'healthy',
                    statusCode: response.status,
                    data: response.data
                };

                this.performanceData.services.set(`${serviceId}:${Date.now()}`, performanceData);

                // Check thresholds
                await this.checkServiceThresholds(serviceId, performanceData);

                // Broadcast to WebSocket clients
                this.broadcast({
                    type: 'service_update',
                    service: serviceId,
                    status: 'healthy',
                    responseTime,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                const responseTime = Date.now() - startTime;

                // Update metrics
                this.metrics.serviceHealth.set({ service: serviceId }, 0);
                this.metrics.serviceResponseTime.set({ service: serviceId }, responseTime);

                // Store error data
                const errorData = {
                    serviceId,
                    timestamp: new Date(),
                    responseTime,
                    status: 'unhealthy',
                    error: error.message,
                    statusCode: error.response?.status || 0
                };

                this.performanceData.services.set(`${serviceId}:${Date.now()}`, errorData);

                // Trigger alert
                await this.triggerAlert('service_down', {
                    service: serviceId,
                    error: error.message,
                    responseTime
                });

                // Broadcast to WebSocket clients
                this.broadcast({
                    type: 'service_error',
                    service: serviceId,
                    status: 'unhealthy',
                    error: error.message,
                    responseTime,
                    timestamp: new Date().toISOString()
                });

                this.logger(`❌ Service ${serviceId} health check failed: ${error.message}`);
            }
        });

        await Promise.allSettled(servicePromises);
    }

    /**
     * Monitor system metrics
     */
    async monitorSystemMetrics() {
        try {
            // CPU usage
            const cpu = await si.currentLoad();
            this.metrics.systemCpuUsage.set(cpu.currentLoad);

            // Memory usage
            const memory = await si.mem();
            const memoryUsagePercent = (memory.used / memory.total) * 100;
            this.metrics.systemMemoryUsage.set(memoryUsagePercent);

            // Disk usage
            const disk = await si.fsSize();
            if (disk.length > 0) {
                const diskUsagePercent = (disk[0].used / disk[0].size) * 100;
                this.metrics.systemDiskUsage.set(diskUsagePercent);
            }

            // Process metrics
            const processStats = await pidusage(process.pid);
            this.metrics.memoryHeapUsed.set(processStats.memory);

            // Event loop lag
            const start = process.hrtime.bigint();
            setImmediate(() => {
                const lag = Number(process.hrtime.bigint() - start) / 1e9;
                this.metrics.eventLoopLag.set(lag);
            });

            // Store system metrics
            const systemMetrics = {
                timestamp: new Date(),
                cpu: cpu.currentLoad,
                memory: memoryUsagePercent,
                disk: disk.length > 0 ? (disk[0].used / disk[0].size) * 100 : 0,
                processMemory: processStats.memory,
                processCpu: processStats.cpu
            };

            this.performanceData.system.set(Date.now(), systemMetrics);

            // Check system thresholds
            await this.checkSystemThresholds(systemMetrics);

            // Broadcast system metrics
            this.broadcast({
                type: 'system_metrics',
                metrics: systemMetrics,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.logger(`❌ System metrics collection failed: ${error.message}`);
        }
    }

    /**
     * Collect detailed application metrics
     */
    async collectDetailedMetrics() {
        try {
            const memoryUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();

            const detailedMetrics = {
                timestamp: new Date(),
                memory: {
                    rss: memoryUsage.rss,
                    heapTotal: memoryUsage.heapTotal,
                    heapUsed: memoryUsage.heapUsed,
                    external: memoryUsage.external,
                    arrayBuffers: memoryUsage.arrayBuffers
                },
                cpu: {
                    user: cpuUsage.user,
                    system: cpuUsage.system
                },
                uptime: process.uptime(),
                activeHandles: process._getActiveHandles().length,
                activeRequests: process._getActiveRequests().length
            };

            // Store detailed metrics
            if (this.redis) {
                const key = `${this.config.redis.keyPrefix}detailed:${Date.now()}`;
                await this.redis.setex(key, 3600, JSON.stringify(detailedMetrics));
            }

            // Analyze for anomalies
            await this.analyzeForAnomalies(detailedMetrics);

        } catch (error) {
            this.logger(`❌ Detailed metrics collection failed: ${error.message}`);
        }
    }

    /**
     * Check service performance thresholds
     */
    async checkServiceThresholds(serviceId, performanceData) {
        const thresholds = this.config.thresholds;

        // Response time check
        if (performanceData.responseTime > thresholds.responseTime.critical) {
            await this.triggerAlert('response_time_critical', {
                service: serviceId,
                responseTime: performanceData.responseTime,
                threshold: thresholds.responseTime.critical
            });
        } else if (performanceData.responseTime > thresholds.responseTime.warning) {
            await this.triggerAlert('response_time_warning', {
                service: serviceId,
                responseTime: performanceData.responseTime,
                threshold: thresholds.responseTime.warning
            });
        }
    }

    /**
     * Check system performance thresholds
     */
    async checkSystemThresholds(systemMetrics) {
        const thresholds = this.config.thresholds;

        // CPU usage check
        if (systemMetrics.cpu > thresholds.cpuUsage.critical) {
            await this.triggerAlert('cpu_usage_critical', {
                cpu: systemMetrics.cpu,
                threshold: thresholds.cpuUsage.critical
            });
        } else if (systemMetrics.cpu > thresholds.cpuUsage.warning) {
            await this.triggerAlert('cpu_usage_warning', {
                cpu: systemMetrics.cpu,
                threshold: thresholds.cpuUsage.warning
            });
        }

        // Memory usage check
        if (systemMetrics.memory > thresholds.memoryUsage.critical) {
            await this.triggerAlert('memory_usage_critical', {
                memory: systemMetrics.memory,
                threshold: thresholds.memoryUsage.critical
            });
        } else if (systemMetrics.memory > thresholds.memoryUsage.warning) {
            await this.triggerAlert('memory_usage_warning', {
                memory: systemMetrics.memory,
                threshold: thresholds.memoryUsage.warning
            });
        }
    }

    /**
     * Initialize alert system
     */
    async initializeAlertSystem() {
        // Alert check interval
        setInterval(async () => {
            await this.processAlerts();
        }, this.config.monitoring.alertCheckInterval);

        // Load alert rules
        await this.loadAlertRules();

        this.logger('✅ Alert system initialized');
    }

    /**
     * Trigger an alert
     */
    async triggerAlert(alertType, context) {
        const alertId = uuidv4();
        const alert = {
            id: alertId,
            type: alertType,
            context,
            timestamp: new Date(),
            status: 'active',
            severity: this.getAlertSeverity(alertType),
            count: 1
        };

        // Check if similar alert exists
        const existingAlert = Array.from(this.alertSystem.activeAlerts.values())
            .find(a => a.type === alertType && JSON.stringify(a.context) === JSON.stringify(context));

        if (existingAlert) {
            existingAlert.count++;
            existingAlert.timestamp = new Date();
            return;
        }

        this.alertSystem.activeAlerts.set(alertId, alert);
        this.alertSystem.alertHistory.push(alert);

        // Store in Redis
        if (this.redis) {
            await this.redis.setex(
                `${this.config.redis.keyPrefix}alert:${alertId}`,
                86400, // 24 hours
                JSON.stringify(alert)
            );
        }

        // Broadcast alert
        this.broadcast({
            type: 'alert_triggered',
            alert,
            timestamp: new Date().toISOString()
        });

        this.logger(`🚨 Alert triggered: ${alertType} - ${JSON.stringify(context)}`);

        // Emit alert event
        this.emit('alert', alert);
    }

    /**
     * Get alert severity level
     */
    getAlertSeverity(alertType) {
        const severityMap = {
            service_down: 'critical',
            response_time_critical: 'critical',
            cpu_usage_critical: 'critical',
            memory_usage_critical: 'critical',
            response_time_warning: 'warning',
            cpu_usage_warning: 'warning',
            memory_usage_warning: 'warning'
        };

        return severityMap[alertType] || 'info';
    }

    /**
     * Initialize optimization engine
     */
    async initializeOptimizationEngine() {
        if (!this.config.optimization.autoOptimize) {
            this.logger('⚠️ Auto-optimization disabled');
            return;
        }

        // Performance analysis interval
        setInterval(async () => {
            await this.analyzePerformance();
        }, 60000); // Every minute

        // Optimization recommendations
        setInterval(async () => {
            await this.generateOptimizationRecommendations();
        }, 300000); // Every 5 minutes

        this.logger('✅ Optimization engine initialized');
    }

    /**
     * Analyze performance for optimization opportunities
     */
    async analyzePerformance() {
        try {
            // Analyze service performance patterns
            for (const [serviceId, serviceConfig] of Object.entries(this.config.services)) {
                const recentMetrics = await this.getRecentServiceMetrics(serviceId);
                const analysis = this.analyzeServicePerformance(serviceId, recentMetrics);

                if (analysis.optimizations.length > 0) {
                    this.optimizationEngine.recommendations.set(serviceId, analysis.optimizations);
                }
            }

            // Analyze system performance
            const systemAnalysis = await this.analyzeSystemPerformance();
            if (systemAnalysis.recommendations.length > 0) {
                this.optimizationEngine.recommendations.set('system', systemAnalysis.recommendations);
            }

        } catch (error) {
            this.logger(`❌ Performance analysis failed: ${error.message}`);
        }
    }

    /**
     * Generate dashboard data
     */
    async generateDashboard() {
        const services = await Promise.all(
            Object.keys(this.config.services).map(async (serviceId) => {
                const metrics = await this.getServiceMetrics(serviceId);
                return { serviceId, ...metrics };
            })
        );

        const systemMetrics = Array.from(this.performanceData.system.values())
            .slice(-10); // Last 10 data points

        const alerts = Array.from(this.alertSystem.activeAlerts.values());

        return {
            timestamp: new Date().toISOString(),
            services,
            systemMetrics,
            alerts: alerts.length,
            uptime: process.uptime(),
            connectedClients: this.connectedClients.size
        };
    }

    /**
     * Get service metrics
     */
    async getServiceMetrics(serviceId) {
        const recentData = Array.from(this.performanceData.services.entries())
            .filter(([key, data]) => key.startsWith(serviceId))
            .slice(-10)
            .map(([key, data]) => data);

        if (recentData.length === 0) {
            return { status: 'unknown', responseTime: 0, availability: 0 };
        }

        const avgResponseTime = recentData.reduce((sum, data) => sum + data.responseTime, 0) / recentData.length;
        const healthyCount = recentData.filter(data => data.status === 'healthy').length;
        const availability = (healthyCount / recentData.length) * 100;

        return {
            status: recentData[recentData.length - 1].status,
            responseTime: Math.round(avgResponseTime),
            availability: Math.round(availability * 100) / 100,
            dataPoints: recentData.length
        };
    }

    /**
     * Broadcast message to WebSocket clients
     */
    broadcast(message, filter = null) {
        if (this.connectedClients.size === 0) return;

        const messageStr = JSON.stringify(message);

        this.connectedClients.forEach(ws => {
            if (ws.readyState === ws.OPEN) {
                if (filter && !filter(ws)) return;

                ws.send(messageStr);
            }
        });
    }

    /**
     * Handle WebSocket messages
     */
    handleWebSocketMessage(ws, data) {
        switch (data.type) {
            case 'subscribe':
                ws.subscriptions = ws.subscriptions || new Set();
                ws.subscriptions.add(data.topic);
                break;

            case 'unsubscribe':
                if (ws.subscriptions) {
                    ws.subscriptions.delete(data.topic);
                }
                break;

            case 'get_dashboard':
                this.generateDashboard()
                    .then(dashboard => {
                        ws.send(JSON.stringify({
                            type: 'dashboard_data',
                            data: dashboard,
                            timestamp: new Date().toISOString()
                        }));
                    })
                    .catch(error => {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: error.message,
                            timestamp: new Date().toISOString()
                        }));
                    });
                break;

            default:
                this.logger(`⚠️ Unknown WebSocket message type: ${data.type}`);
        }
    }

    /**
     * Cleanup old performance data
     */
    async cleanupOldData() {
        const cutoffTime = Date.now() - this.config.monitoring.retentionPeriod;

        // Clean service data
        for (const [key, data] of this.performanceData.services.entries()) {
            if (data.timestamp.getTime() < cutoffTime) {
                this.performanceData.services.delete(key);
            }
        }

        // Clean system data
        for (const [timestamp, data] of this.performanceData.system.entries()) {
            if (timestamp < cutoffTime) {
                this.performanceData.system.delete(timestamp);
            }
        }

        // Clean Redis data
        if (this.redis) {
            const keys = await this.redis.keys(`${this.config.redis.keyPrefix}*`);
            const oldKeys = keys.filter(key => {
                const timestamp = parseInt(key.split(':').pop());
                return timestamp && timestamp < cutoffTime;
            });

            if (oldKeys.length > 0) {
                await this.redis.del(...oldKeys);
            }
        }

        this.logger(`🧹 Cleaned up ${this.performanceData.services.size} service records`);
    }

    /**
     * Load performance baselines
     */
    async loadPerformanceBaselines() {
        if (!this.redis) return;

        try {
            const baselinesJson = await this.redis.get(`${this.config.redis.keyPrefix}baselines`);
            if (baselinesJson) {
                const baselines = JSON.parse(baselinesJson);
                this.performanceData.baselines = new Map(Object.entries(baselines));
                this.logger('✅ Performance baselines loaded');
            }
        } catch (error) {
            this.logger(`⚠️ Failed to load baselines: ${error.message}`);
        }
    }

    /**
     * Start the performance monitoring server
     */
    async start() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.listen(this.config.port, this.config.host, () => {
                    this.logger(`📊 Performance Monitoring listening on http://${this.config.host}:${this.config.port}`);
                    resolve();
                });
            } else {
                this.app.listen(this.config.port, this.config.host, () => {
                    this.logger(`📊 Performance Monitoring listening on http://${this.config.host}:${this.config.port}`);
                    resolve();
                });
            }
        });
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        this.logger('🔄 Shutting down Performance Monitoring...');

        try {
            // Close WebSocket connections
            if (this.wsServer) {
                this.connectedClients.forEach(ws => {
                    ws.close(1000, 'Server shutting down');
                });
                this.wsServer.close();
            }

            // Save performance baselines
            if (this.redis && this.performanceData.baselines.size > 0) {
                const baselinesObj = Object.fromEntries(this.performanceData.baselines);
                await this.redis.set(
                    `${this.config.redis.keyPrefix}baselines`,
                    JSON.stringify(baselinesObj)
                );
            }

            // Close Redis connection
            if (this.redis) {
                await this.redis.quit();
            }

            // Close HTTP server
            if (this.server) {
                this.server.close();
            }

            this.logger('✅ Performance Monitoring shutdown complete');

        } catch (error) {
            this.logger(`❌ Shutdown error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create logger function
     */
    createLogger() {
        return (message) => {
            const timestamp = new Date().toISOString();
            console.log(chalk.blue(`[${timestamp}] 📊 Performance: ${message}`));
        };
    }
}

/**
 * Standalone mode execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log(chalk.cyan('📊 Performance Monitoring - Standalone Mode'));

    const monitoring = new PerformanceMonitoring();

    // Initialize and start
    monitoring.initialize().catch(error => {
        console.error(chalk.red('❌ Failed to initialize Performance Monitoring:'), error);
        process.exit(1);
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n⚠️ Received SIGINT, shutting down gracefully...'));
        await monitoring.shutdown();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log(chalk.yellow('\n⚠️ Received SIGTERM, shutting down gracefully...'));
        await monitoring.shutdown();
        process.exit(0);
    });
}

export default PerformanceMonitoring;
