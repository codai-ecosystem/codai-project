/**
 * Advanced Microservice Orchestration System
 * 
 * Provides comprehensive microservice orchestration capabilities with:
 * - Intelligent service mesh management and coordination
 * - Advanced workflow orchestration with dependency resolution
 * - Dynamic service discovery and health monitoring
 * - Distributed transaction coordination and compensation
 * - Performance optimization and load balancing
 * - Circuit breaker patterns and resilience mechanisms
 */

import express from 'express';
import axios from 'axios';
import { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import chalk from 'chalk';
import ora from 'ora';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import cron from 'node-cron';
import EventEmitter from 'eventemitter3';
import consul from 'consul';
import { EtcdApi } from 'etcd3';
import yaml from 'yaml';
import Ajv from 'ajv';
import CircuitBreaker from 'circuit-breaker';
import retry from 'retry';
import { promises as fs } from 'fs';
import path from 'path';
import { createServer } from 'http';

/**
 * Advanced Microservice Orchestration Engine
 * 
 * Manages complex microservice workflows with intelligent service mesh
 * coordination, dynamic service discovery, and comprehensive orchestration patterns.
 */
export class MicroserviceOrchestration extends EventEmitter {
    constructor(options = {}) {
        super();

        // Configuration
        this.config = {
            port: options.port || 4003,
            host: options.host || 'localhost',
            redis: {
                url: options.redisUrl || 'redis://localhost:6379',
                keyPrefix: 'codai:orchestration:'
            },
            consul: {
                host: options.consulHost || 'localhost',
                port: options.consulPort || 8500,
                enabled: options.enableConsul !== false
            },
            etcd: {
                hosts: options.etcdHosts || ['localhost:2379'],
                enabled: options.enableEtcd !== false
            },
            websocket: {
                enabled: options.enableWebSocket !== false,
                port: 4004,
                maxConnections: 500
            },
            orchestration: {
                maxConcurrentWorkflows: 100,
                workflowTimeout: 10 * 60 * 1000, // 10 minutes
                stepTimeout: 2 * 60 * 1000, // 2 minutes
                retryStrategy: {
                    attempts: 3,
                    factor: 2,
                    minTimeout: 1000,
                    maxTimeout: 10000
                }
            },
            serviceMesh: {
                healthCheckInterval: 10000,
                loadBalancingStrategy: 'round-robin',
                circuitBreaker: {
                    failureThreshold: 5,
                    resetTimeout: 30000,
                    monitoringPeriod: 10000
                }
            },
            monitoring: {
                metricsInterval: 5000,
                performanceThresholds: {
                    responseTime: 5000,
                    errorRate: 10,
                    throughput: 1000
                }
            }
        };

        // Core components
        this.app = express();
        this.server = null;
        this.wsServer = null;
        this.redis = null;
        this.consul = null;
        this.etcd = null;

        // Service mesh management
        this.serviceRegistry = new Map();
        this.serviceInstances = new Map();
        this.serviceHealth = new Map();
        this.loadBalancers = new Map();
        this.circuitBreakers = new Map();

        // Workflow orchestration
        this.workflowDefinitions = new Map();
        this.activeWorkflows = new Map();
        this.workflowHistory = new Map();
        this.workflowTemplates = new Map();

        // Service mesh coordination
        this.serviceDependencies = new Map();
        this.serviceCapabilities = new Map();
        this.serviceContracts = new Map();

        // Performance monitoring
        this.metrics = {
            workflowsStarted: 0,
            workflowsCompleted: 0,
            workflowsFailed: 0,
            servicesDiscovered: 0,
            serviceCallsSuccess: 0,
            serviceCallsFailure: 0,
            totalResponseTime: 0,
            averageResponseTime: 0
        };

        // Connected clients
        this.connectedClients = new Set();

        // Schema validator
        this.ajv = new Ajv({ allErrors: true });

        // Initialize spinner
        this.spinner = ora('Microservice Orchestration initializing...').start();

        this.logger = this.createLogger();
    }

    /**
     * Initialize the microservice orchestration system
     */
    async initialize() {
        try {
            this.logger('🚀 Initializing Microservice Orchestration...');

            // Initialize Redis for state management
            await this.initializeRedis();

            // Initialize service discovery backends
            await this.initializeServiceDiscovery();

            // Setup Express server
            await this.setupExpressServer();

            // Initialize WebSocket server
            if (this.config.websocket.enabled) {
                await this.initializeWebSocket();
            }

            // Setup service mesh
            await this.initializeServiceMesh();

            // Register default workflow templates
            await this.registerDefaultWorkflows();

            // Setup monitoring and health checks
            await this.setupMonitoring();

            // Start the server
            await this.start();

            this.spinner.succeed('Microservice Orchestration initialized successfully');
            this.logger('✅ Microservice Orchestration ready for complex workflows');

            // Emit initialization complete event
            this.emit('initialized', {
                services: this.serviceRegistry.size,
                workflows: this.workflowDefinitions.size,
                websocket: this.config.websocket.enabled
            });

            return {
                status: 'success',
                message: 'Microservice Orchestration initialized successfully',
                features: [
                    'service_mesh_management',
                    'workflow_orchestration',
                    'service_discovery',
                    'load_balancing',
                    'circuit_breakers',
                    'health_monitoring',
                    'performance_optimization',
                    'distributed_transactions'
                ]
            };

        } catch (error) {
            this.spinner.fail('Microservice Orchestration initialization failed');
            this.logger(`❌ Initialization error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Initialize Redis for state management
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
     * Initialize service discovery backends
     */
    async initializeServiceDiscovery() {
        // Initialize Consul
        if (this.config.consul.enabled) {
            try {
                this.consul = consul({
                    host: this.config.consul.host,
                    port: this.config.consul.port,
                    promisify: true
                });

                // Test connection
                await this.consul.agent.self();
                this.logger('✅ Consul service discovery connected');

            } catch (error) {
                this.logger(`⚠️ Consul connection failed: ${error.message}`);
            }
        }

        // Initialize etcd
        if (this.config.etcd.enabled) {
            try {
                this.etcd = new EtcdApi({
                    hosts: this.config.etcd.hosts
                });

                // Test connection
                await this.etcd.get('health');
                this.logger('✅ etcd service discovery connected');

            } catch (error) {
                this.logger(`⚠️ etcd connection failed: ${error.message}`);
            }
        }
    }

    /**
     * Setup Express server with middleware
     */
    async setupExpressServer() {
        // Middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req, res, next) => {
            req.requestId = uuidv4();
            this.logger(`📨 ${req.method} ${req.url} [${req.requestId}]`);
            next();
        });

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                services: this.serviceRegistry.size,
                activeWorkflows: this.activeWorkflows.size,
                metrics: this.metrics
            });
        });

        // Service registry endpoints
        this.app.get('/services', (req, res) => {
            const services = Array.from(this.serviceRegistry.entries()).map(([id, service]) => ({
                id,
                name: service.name,
                instances: service.instances?.length || 0,
                health: this.serviceHealth.get(id)?.status || 'unknown',
                capabilities: service.capabilities || []
            }));

            res.json({ services });
        });

        // Workflow management endpoints
        this.app.post('/workflows/:type/start', async (req, res) => {
            try {
                const workflowId = await this.startWorkflow(req.params.type, req.body);
                res.json({ workflowId, status: 'started' });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        this.app.get('/workflows/:id', (req, res) => {
            const workflow = this.activeWorkflows.get(req.params.id);
            if (!workflow) {
                return res.status(404).json({ error: 'Workflow not found' });
            }

            res.json(workflow);
        });

        this.app.delete('/workflows/:id', async (req, res) => {
            try {
                await this.cancelWorkflow(req.params.id);
                res.json({ status: 'cancelled' });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        // Service mesh endpoints
        this.app.post('/services/register', async (req, res) => {
            try {
                await this.registerService(req.body);
                res.json({ status: 'registered' });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        this.app.delete('/services/:id', async (req, res) => {
            try {
                await this.deregisterService(req.params.id);
                res.json({ status: 'deregistered' });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });

        this.logger('✅ Express server configured');
    }

    /**
     * Initialize WebSocket server
     */
    async initializeWebSocket() {
        this.server = createServer(this.app);

        this.wsServer = new WebSocketServer({
            server: this.server,
            path: '/orchestration'
        });

        this.wsServer.on('connection', (ws, req) => {
            this.connectedClients.add(ws);

            this.logger(`🔌 New orchestration client connected (${this.connectedClients.size} total)`);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connected',
                message: 'Connected to Microservice Orchestration',
                timestamp: new Date().toISOString(),
                services: this.serviceRegistry.size,
                workflows: this.workflowDefinitions.size
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
                this.logger(`🔌 Orchestration client disconnected`);
            });
        });

        this.logger('✅ WebSocket server initialized');
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

            case 'workflow_start':
                this.startWorkflow(data.workflowType, data.payload)
                    .then(workflowId => {
                        ws.send(JSON.stringify({
                            type: 'workflow_started',
                            workflowId,
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
     * Initialize service mesh
     */
    async initializeServiceMesh() {
        // Register CODAI ecosystem services
        const codaiServices = this.getDefaultCODAIServices();

        for (const service of codaiServices) {
            await this.registerService(service);
        }

        // Start health monitoring
        this.startHealthMonitoring();

        this.logger(`✅ Service mesh initialized with ${this.serviceRegistry.size} services`);
    }

    /**
     * Get default CODAI services configuration
     */
    getDefaultCODAIServices() {
        return [
            {
                id: 'gateway',
                name: 'Gateway Service',
                instances: [{ host: 'localhost', port: 4000 }],
                healthCheck: '/health',
                capabilities: ['routing', 'load_balancing', 'rate_limiting'],
                dependencies: []
            },
            {
                id: 'codai',
                name: 'CODAI Service',
                instances: [{ host: 'localhost', port: 4001 }],
                healthCheck: '/api/health',
                capabilities: ['ai_processing', 'code_analysis', 'chat'],
                dependencies: ['memorai', 'bancai']
            },
            {
                id: 'admin',
                name: 'Admin Service',
                instances: [{ host: 'localhost', port: 4002 }],
                healthCheck: '/api/health',
                capabilities: ['user_management', 'system_administration'],
                dependencies: ['id']
            },
            {
                id: 'hub',
                name: 'Hub Service',
                instances: [{ host: 'localhost', port: 4003 }],
                healthCheck: '/api/health',
                capabilities: ['project_management', 'collaboration'],
                dependencies: ['id', 'codai']
            },
            {
                id: 'id',
                name: 'ID Service',
                instances: [{ host: 'localhost', port: 4004 }],
                healthCheck: '/api/health',
                capabilities: ['authentication', 'authorization', 'user_identity'],
                dependencies: []
            },
            {
                id: 'bancai',
                name: 'BancAI Service',
                instances: [{ host: 'localhost', port: 4005 }],
                healthCheck: '/api/health',
                capabilities: ['financial_analysis', 'banking_ai', 'risk_assessment'],
                dependencies: ['memorai']
            },
            {
                id: 'memorai',
                name: 'MemorAI Service',
                instances: [{ host: 'localhost', port: 4006 }],
                healthCheck: '/api/health',
                capabilities: ['memory_management', 'data_persistence', 'caching'],
                dependencies: []
            },
            {
                id: 'cbd',
                name: 'CBD Engine Service',
                instances: [{ host: 'localhost', port: 4007 }],
                healthCheck: '/api/health',
                capabilities: ['blockchain', 'smart_contracts', 'distributed_ledger'],
                dependencies: ['memorai']
            }
        ];
    }

    /**
     * Register a service in the mesh
     */
    async registerService(serviceConfig) {
        const serviceId = serviceConfig.id;

        // Validate service configuration
        if (!serviceId || !serviceConfig.name || !serviceConfig.instances) {
            throw new Error('Invalid service configuration');
        }

        // Register in local registry
        this.serviceRegistry.set(serviceId, {
            ...serviceConfig,
            registeredAt: new Date(),
            status: 'registered'
        });

        // Initialize health status
        this.serviceHealth.set(serviceId, {
            status: 'unknown',
            lastCheck: null,
            consecutiveFailures: 0,
            responseTime: 0
        });

        // Setup load balancer
        this.loadBalancers.set(serviceId, {
            strategy: this.config.serviceMesh.loadBalancingStrategy,
            instances: [...serviceConfig.instances],
            currentIndex: 0,
            weights: serviceConfig.instances.map(i => i.weight || 1)
        });

        // Setup circuit breaker
        this.circuitBreakers.set(serviceId, new CircuitBreaker({
            threshold: this.config.serviceMesh.circuitBreaker.failureThreshold,
            timeout: this.config.serviceMesh.circuitBreaker.resetTimeout,
            monitor: this.config.serviceMesh.circuitBreaker.monitoringPeriod
        }));

        // Register with external service discovery
        if (this.consul) {
            try {
                await this.consul.agent.service.register({
                    id: serviceId,
                    name: serviceConfig.name,
                    address: serviceConfig.instances[0].host,
                    port: serviceConfig.instances[0].port,
                    check: {
                        http: `http://${serviceConfig.instances[0].host}:${serviceConfig.instances[0].port}${serviceConfig.healthCheck}`,
                        interval: '10s'
                    }
                });
            } catch (error) {
                this.logger(`⚠️ Failed to register ${serviceId} with Consul: ${error.message}`);
            }
        }

        this.metrics.servicesDiscovered++;
        this.logger(`📋 Service registered: ${serviceConfig.name} (${serviceId})`);

        // Broadcast service registration
        this.broadcast({
            type: 'service_registered',
            service: { id: serviceId, name: serviceConfig.name },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Start health monitoring
     */
    startHealthMonitoring() {
        setInterval(async () => {
            for (const [serviceId, service] of this.serviceRegistry.entries()) {
                await this.performHealthCheck(serviceId, service);
            }
        }, this.config.serviceMesh.healthCheckInterval);

        this.logger('✅ Health monitoring started');
    }

    /**
     * Perform health check for a service
     */
    async performHealthCheck(serviceId, service) {
        const health = this.serviceHealth.get(serviceId);
        const startTime = Date.now();

        try {
            // Check primary instance
            const instance = service.instances[0];
            const url = `http://${instance.host}:${instance.port}${service.healthCheck}`;

            const response = await axios.get(url, { timeout: 5000 });
            const responseTime = Date.now() - startTime;

            if (response.status === 200) {
                health.status = 'healthy';
                health.consecutiveFailures = 0;
                health.responseTime = responseTime;

                // Reset circuit breaker if healthy
                const circuitBreaker = this.circuitBreakers.get(serviceId);
                if (circuitBreaker) {
                    circuitBreaker.reset();
                }
            } else {
                throw new Error(`Health check failed with status: ${response.status}`);
            }

        } catch (error) {
            health.status = 'unhealthy';
            health.consecutiveFailures++;

            this.logger(`❌ Health check failed for ${serviceId}: ${error.message}`);

            // Trip circuit breaker
            const circuitBreaker = this.circuitBreakers.get(serviceId);
            if (circuitBreaker) {
                circuitBreaker.trip();
            }
        }

        health.lastCheck = new Date();

        // Broadcast health status
        this.broadcast({
            type: 'service_health',
            service: serviceId,
            status: health.status,
            responseTime: health.responseTime
        });
    }

    /**
     * Register default workflow templates
     */
    async registerDefaultWorkflows() {
        // User onboarding workflow
        this.registerWorkflowTemplate('user_onboarding', {
            name: 'User Onboarding Workflow',
            description: 'Complete user registration and setup process',
            steps: [
                {
                    id: 'validate_user',
                    service: 'id',
                    action: 'validate_user_data',
                    timeout: 5000,
                    retries: 2
                },
                {
                    id: 'create_account',
                    service: 'id',
                    action: 'create_user_account',
                    timeout: 10000,
                    retries: 1,
                    depends_on: ['validate_user']
                },
                {
                    id: 'setup_workspace',
                    service: 'hub',
                    action: 'create_workspace',
                    timeout: 15000,
                    retries: 1,
                    depends_on: ['create_account']
                },
                {
                    id: 'initialize_ai',
                    service: 'codai',
                    action: 'initialize_user_ai',
                    timeout: 20000,
                    retries: 2,
                    depends_on: ['create_account']
                }
            ],
            compensation: [
                {
                    step: 'create_account',
                    action: 'delete_user_account'
                },
                {
                    step: 'setup_workspace',
                    action: 'delete_workspace'
                }
            ]
        });

        // Project deployment workflow
        this.registerWorkflowTemplate('project_deployment', {
            name: 'Project Deployment Workflow',
            description: 'Deploy a project through the CODAI ecosystem',
            steps: [
                {
                    id: 'validate_project',
                    service: 'codai',
                    action: 'validate_project',
                    timeout: 30000,
                    retries: 1
                },
                {
                    id: 'build_project',
                    service: 'codai',
                    action: 'build_project',
                    timeout: 300000, // 5 minutes
                    retries: 2,
                    depends_on: ['validate_project']
                },
                {
                    id: 'run_tests',
                    service: 'codai',
                    action: 'run_tests',
                    timeout: 180000, // 3 minutes
                    retries: 1,
                    depends_on: ['build_project']
                },
                {
                    id: 'deploy_to_staging',
                    service: 'hub',
                    action: 'deploy_staging',
                    timeout: 120000, // 2 minutes
                    retries: 2,
                    depends_on: ['run_tests']
                },
                {
                    id: 'notify_completion',
                    service: 'admin',
                    action: 'send_deployment_notification',
                    timeout: 10000,
                    retries: 3,
                    depends_on: ['deploy_to_staging']
                }
            ]
        });

        this.logger(`✅ Default workflow templates registered (${this.workflowDefinitions.size} templates)`);
    }

    /**
     * Register a workflow template
     */
    registerWorkflowTemplate(type, definition) {
        this.workflowDefinitions.set(type, {
            ...definition,
            id: uuidv4(),
            registeredAt: new Date()
        });

        this.logger(`📋 Workflow template registered: ${type}`);
    }

    /**
     * Start a workflow execution
     */
    async startWorkflow(workflowType, payload, metadata = {}) {
        const definition = this.workflowDefinitions.get(workflowType);
        if (!definition) {
            throw new Error(`Workflow definition not found: ${workflowType}`);
        }

        const workflowId = uuidv4();
        const workflow = {
            id: workflowId,
            type: workflowType,
            definition,
            payload,
            metadata,
            status: 'started',
            currentStep: null,
            completedSteps: [],
            failedSteps: [],
            stepResults: new Map(),
            startedAt: new Date(),
            updatedAt: new Date()
        };

        this.activeWorkflows.set(workflowId, workflow);
        this.metrics.workflowsStarted++;

        // Store in Redis if available
        if (this.redis) {
            await this.redis.setex(
                `${this.config.redis.keyPrefix}workflow:${workflowId}`,
                3600, // 1 hour TTL
                JSON.stringify(workflow)
            );
        }

        // Start workflow execution
        setImmediate(() => {
            this.executeWorkflow(workflowId);
        });

        this.logger(`🔄 Workflow started: ${workflowType} [${workflowId}]`);

        // Broadcast workflow started
        this.broadcast({
            type: 'workflow_started',
            workflowId,
            workflowType,
            timestamp: new Date().toISOString()
        });

        return workflowId;
    }

    /**
     * Execute a workflow
     */
    async executeWorkflow(workflowId) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) return;

        try {
            // Build dependency graph
            const dependencyGraph = this.buildDependencyGraph(workflow.definition.steps);

            // Execute steps in dependency order
            const executionPlan = this.createExecutionPlan(dependencyGraph);

            for (const batch of executionPlan) {
                // Execute steps in parallel within each batch
                const promises = batch.map(step => this.executeWorkflowStep(workflowId, step));
                await Promise.all(promises);
            }

            // Workflow completed successfully
            workflow.status = 'completed';
            workflow.completedAt = new Date();
            this.metrics.workflowsCompleted++;

            this.logger(`✅ Workflow completed: ${workflow.type} [${workflowId}]`);

            // Broadcast completion
            this.broadcast({
                type: 'workflow_completed',
                workflowId,
                workflowType: workflow.type,
                duration: workflow.completedAt - workflow.startedAt,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            // Workflow failed
            workflow.status = 'failed';
            workflow.error = error.message;
            workflow.failedAt = new Date();
            this.metrics.workflowsFailed++;

            this.logger(`❌ Workflow failed: ${workflow.type} [${workflowId}] - ${error.message}`);

            // Execute compensation if defined
            if (workflow.definition.compensation) {
                await this.executeCompensation(workflowId);
            }

            // Broadcast failure
            this.broadcast({
                type: 'workflow_failed',
                workflowId,
                workflowType: workflow.type,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        } finally {
            // Move to history
            setTimeout(() => {
                this.workflowHistory.set(workflowId, workflow);
                this.activeWorkflows.delete(workflowId);
            }, 60000); // Keep active for 1 minute
        }
    }

    /**
     * Build dependency graph for workflow steps
     */
    buildDependencyGraph(steps) {
        const graph = new Map();

        for (const step of steps) {
            graph.set(step.id, {
                ...step,
                dependencies: step.depends_on || [],
                dependents: []
            });
        }

        // Build reverse dependencies
        for (const [stepId, step] of graph.entries()) {
            for (const depId of step.dependencies) {
                const dependency = graph.get(depId);
                if (dependency) {
                    dependency.dependents.push(stepId);
                }
            }
        }

        return graph;
    }

    /**
     * Create execution plan with dependency resolution
     */
    createExecutionPlan(dependencyGraph) {
        const executionPlan = [];
        const completed = new Set();
        const remaining = new Set(dependencyGraph.keys());

        while (remaining.size > 0) {
            const batch = [];

            // Find steps with no pending dependencies
            for (const stepId of remaining) {
                const step = dependencyGraph.get(stepId);
                const pendingDeps = step.dependencies.filter(dep => !completed.has(dep));

                if (pendingDeps.length === 0) {
                    batch.push(step);
                }
            }

            if (batch.length === 0) {
                throw new Error('Circular dependency detected in workflow');
            }

            // Add batch to execution plan
            executionPlan.push(batch);

            // Mark steps as completed
            for (const step of batch) {
                completed.add(step.id);
                remaining.delete(step.id);
            }
        }

        return executionPlan;
    }

    /**
     * Execute a single workflow step
     */
    async executeWorkflowStep(workflowId, step) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) return;

        workflow.currentStep = step.id;
        workflow.updatedAt = new Date();

        const startTime = Date.now();

        try {
            // Get service instance
            const serviceInstance = this.getServiceInstance(step.service);
            if (!serviceInstance) {
                throw new Error(`Service not available: ${step.service}`);
            }

            // Check circuit breaker
            const circuitBreaker = this.circuitBreakers.get(step.service);
            if (circuitBreaker && circuitBreaker.isOpen()) {
                throw new Error(`Circuit breaker open for service: ${step.service}`);
            }

            // Execute step with retry logic
            const result = await this.executeServiceCall(
                serviceInstance,
                step,
                workflow.payload
            );

            // Store result
            workflow.stepResults.set(step.id, result);
            workflow.completedSteps.push({
                stepId: step.id,
                result,
                completedAt: new Date(),
                duration: Date.now() - startTime
            });

            this.metrics.serviceCallsSuccess++;

            this.logger(`✅ Step completed: ${step.id} in workflow ${workflowId}`);

        } catch (error) {
            workflow.failedSteps.push({
                stepId: step.id,
                error: error.message,
                failedAt: new Date(),
                duration: Date.now() - startTime
            });

            this.metrics.serviceCallsFailure++;

            this.logger(`❌ Step failed: ${step.id} in workflow ${workflowId} - ${error.message}`);

            throw error;
        }
    }

    /**
     * Get service instance using load balancing
     */
    getServiceInstance(serviceId) {
        const service = this.serviceRegistry.get(serviceId);
        if (!service) return null;

        const loadBalancer = this.loadBalancers.get(serviceId);
        if (!loadBalancer || loadBalancer.instances.length === 0) return null;

        // Simple round-robin load balancing
        const instance = loadBalancer.instances[loadBalancer.currentIndex];
        loadBalancer.currentIndex = (loadBalancer.currentIndex + 1) % loadBalancer.instances.length;

        return {
            ...instance,
            serviceId,
            baseUrl: `http://${instance.host}:${instance.port}`
        };
    }

    /**
     * Execute service call with retry logic
     */
    async executeServiceCall(serviceInstance, step, payload) {
        const operation = retry.operation({
            retries: step.retries || this.config.orchestration.retryStrategy.attempts,
            factor: this.config.orchestration.retryStrategy.factor,
            minTimeout: this.config.orchestration.retryStrategy.minTimeout,
            maxTimeout: this.config.orchestration.retryStrategy.maxTimeout
        });

        return new Promise((resolve, reject) => {
            operation.attempt(async (currentAttempt) => {
                try {
                    const response = await axios.post(
                        `${serviceInstance.baseUrl}/api/${step.action}`,
                        payload,
                        {
                            timeout: step.timeout || this.config.orchestration.stepTimeout,
                            headers: {
                                'X-Workflow-ID': step.workflowId,
                                'X-Step-ID': step.id,
                                'X-Service-ID': serviceInstance.serviceId
                            }
                        }
                    );

                    resolve(response.data);

                } catch (error) {
                    if (operation.retry(error)) {
                        this.logger(`⚠️ Retrying step ${step.id}, attempt ${currentAttempt}`);
                        return;
                    }

                    reject(operation.mainError());
                }
            });
        });
    }

    /**
     * Execute compensation steps
     */
    async executeCompensation(workflowId) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow || !workflow.definition.compensation) return;

        this.logger(`🔄 Executing compensation for workflow ${workflowId}`);

        // Execute compensation steps in reverse order
        const completedSteps = workflow.completedSteps.reverse();

        for (const completedStep of completedSteps) {
            const compensation = workflow.definition.compensation.find(
                comp => comp.step === completedStep.stepId
            );

            if (compensation) {
                try {
                    const serviceInstance = this.getServiceInstance(compensation.service || completedStep.service);
                    if (serviceInstance) {
                        await axios.post(
                            `${serviceInstance.baseUrl}/api/${compensation.action}`,
                            workflow.payload,
                            { timeout: 30000 }
                        );

                        this.logger(`✅ Compensation executed: ${compensation.action} for step ${completedStep.stepId}`);
                    }
                } catch (error) {
                    this.logger(`❌ Compensation failed: ${compensation.action} - ${error.message}`);
                }
            }
        }
    }

    /**
     * Setup monitoring
     */
    async setupMonitoring() {
        // Metrics collection
        setInterval(() => {
            this.collectMetrics();
        }, this.config.monitoring.metricsInterval);

        this.logger('✅ Monitoring and metrics collection configured');
    }

    /**
     * Collect performance metrics
     */
    collectMetrics() {
        const currentMetrics = {
            ...this.metrics,
            activeConnections: this.connectedClients.size,
            activeWorkflows: this.activeWorkflows.size,
            registeredServices: this.serviceRegistry.size,
            healthyServices: Array.from(this.serviceHealth.values()).filter(h => h.status === 'healthy').length,
            timestamp: new Date().toISOString()
        };

        // Calculate average response time
        if (this.metrics.serviceCallsSuccess > 0) {
            currentMetrics.averageResponseTime = Math.round(
                this.metrics.totalResponseTime / this.metrics.serviceCallsSuccess
            );
        }

        // Broadcast metrics
        this.broadcast({
            type: 'metrics_updated',
            metrics: currentMetrics,
            timestamp: new Date().toISOString()
        });

        // Store in Redis if available
        if (this.redis) {
            const key = `${this.config.redis.keyPrefix}metrics:${Date.now()}`;
            this.redis.setex(key, 3600, JSON.stringify(currentMetrics));
        }
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
     * Start the orchestration server
     */
    async start() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.listen(this.config.port, this.config.host, () => {
                    this.logger(`🌐 Microservice Orchestration listening on http://${this.config.host}:${this.config.port}`);
                    resolve();
                });
            } else {
                this.app.listen(this.config.port, this.config.host, () => {
                    this.logger(`🌐 Microservice Orchestration listening on http://${this.config.host}:${this.config.port}`);
                    resolve();
                });
            }
        });
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        this.logger('🔄 Shutting down Microservice Orchestration...');

        try {
            // Cancel active workflows
            for (const [workflowId, workflow] of this.activeWorkflows.entries()) {
                workflow.status = 'cancelled';
                await this.executeCompensation(workflowId);
            }

            // Close WebSocket connections
            if (this.wsServer) {
                this.connectedClients.forEach(ws => {
                    ws.close(1000, 'Server shutting down');
                });
                this.wsServer.close();
            }

            // Deregister from service discovery
            if (this.consul) {
                for (const serviceId of this.serviceRegistry.keys()) {
                    try {
                        await this.consul.agent.service.deregister(serviceId);
                    } catch (error) {
                        this.logger(`⚠️ Failed to deregister ${serviceId}: ${error.message}`);
                    }
                }
            }

            // Close Redis connection
            if (this.redis) {
                await this.redis.quit();
            }

            // Close HTTP server
            if (this.server) {
                this.server.close();
            }

            this.logger('✅ Microservice Orchestration shutdown complete');

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
            console.log(chalk.blue(`[${timestamp}] 🎼 Orchestration: ${message}`));
        };
    }
}

/**
 * Standalone mode execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log(chalk.cyan('🎼 Microservice Orchestration - Standalone Mode'));

    const orchestration = new MicroserviceOrchestration();

    // Initialize and start
    orchestration.initialize().catch(error => {
        console.error(chalk.red('❌ Failed to initialize Microservice Orchestration:'), error);
        process.exit(1);
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n⚠️ Received SIGINT, shutting down gracefully...'));
        await orchestration.shutdown();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log(chalk.yellow('\n⚠️ Received SIGTERM, shutting down gracefully...'));
        await orchestration.shutdown();
        process.exit(0);
    });
}

export default MicroserviceOrchestration;
