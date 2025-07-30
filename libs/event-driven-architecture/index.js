/**
 * Event-Driven Architecture System
 * 
 * Provides comprehensive event-driven architecture capabilities for reactive
 * microservice patterns with distributed messaging, event streaming, and
 * advanced event processing patterns.
 */

import EventEmitter from 'eventemitter3';
import { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import chalk from 'chalk';
import ora from 'ora';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import cron from 'node-cron';
import Ajv from 'ajv';
import Queue from 'bull';
import amqp from 'amqplib';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Event-Driven Architecture Engine
 * 
 * Manages distributed event processing with multiple messaging patterns,
 * event streaming, saga orchestration, and comprehensive event monitoring.
 */
export class EventDrivenArchitecture extends EventEmitter {
    constructor(options = {}) {
        super();

        // Configuration
        this.config = {
            redis: {
                url: options.redisUrl || 'redis://localhost:6379',
                keyPrefix: 'codai:events:'
            },
            websocket: {
                enabled: options.enableWebSocket !== false,
                port: options.wsPort || 4002,
                maxConnections: 1000
            },
            rabbitmq: {
                url: options.rabbitmqUrl || 'amqp://localhost',
                exchangePrefix: 'codai.events'
            },
            eventStore: {
                retention: 7 * 24 * 60 * 60 * 1000, // 7 days
                maxEvents: 100000,
                batchSize: 1000
            },
            saga: {
                timeout: 5 * 60 * 1000, // 5 minutes
                maxRetries: 3,
                backoffStrategy: 'exponential'
            },
            monitoring: {
                metricsInterval: 5000,
                alertThresholds: {
                    eventBacklog: 1000,
                    processingDelay: 5000,
                    errorRate: 10
                }
            }
        };

        // Core components
        this.eventBus = new EventEmitter();
        this.eventStore = new Map();
        this.eventStreams = new Map();
        this.eventHandlers = new Map();
        this.eventSchemas = new Map();

        // Messaging infrastructure
        this.redis = null;
        this.wsServer = null;
        this.rabbitmq = null;
        this.messageQueues = new Map();

        // Saga orchestration
        this.activesSagas = new Map();
        this.sagaDefinitions = new Map();
        this.sagaState = new Map();

        // Event processing
        this.eventProcessors = new Map();
        this.eventFilters = new Map();
        this.eventTransformers = new Map();

        // Monitoring and metrics
        this.metrics = {
            eventsPublished: 0,
            eventsProcessed: 0,
            eventsSkipped: 0,
            eventsFailed: 0,
            sagasStarted: 0,
            sagasCompleted: 0,
            sagasFailed: 0,
            averageProcessingTime: 0,
            totalProcessingTime: 0
        };

        // Connected clients
        this.connectedClients = new Set();

        // Schema validator
        this.ajv = new Ajv({ allErrors: true });

        // Initialize spinner
        this.spinner = ora('Event-Driven Architecture initializing...').start();

        this.logger = this.createLogger();
    }

    /**
     * Initialize the event-driven architecture system
     */
    async initialize() {
        try {
            this.logger('🚀 Initializing Event-Driven Architecture...');

            // Initialize Redis for event persistence
            await this.initializeRedis();

            // Initialize RabbitMQ for distributed messaging
            await this.initializeRabbitMQ();

            // Setup WebSocket server for real-time events
            if (this.config.websocket.enabled) {
                await this.initializeWebSocket();
            }

            // Initialize event store and streams
            await this.initializeEventStore();

            // Setup default event handlers
            await this.setupDefaultHandlers();

            // Initialize saga orchestrator
            await this.initializeSagaOrchestrator();

            // Setup monitoring
            await this.setupMonitoring();

            // Register built-in event schemas
            await this.registerBuiltInSchemas();

            this.spinner.succeed('Event-Driven Architecture initialized successfully');
            this.logger('✅ Event-Driven Architecture ready for reactive microservices');

            // Emit initialization complete event
            this.emit('initialized', {
                eventStreams: this.eventStreams.size,
                eventHandlers: this.eventHandlers.size,
                sagaDefinitions: this.sagaDefinitions.size,
                websocket: this.config.websocket.enabled
            });

            return {
                status: 'success',
                message: 'Event-Driven Architecture initialized successfully',
                features: [
                    'event_streaming',
                    'distributed_messaging',
                    'saga_orchestration',
                    'event_sourcing',
                    'real_time_websockets',
                    'event_validation',
                    'message_queuing',
                    'event_replay'
                ]
            };

        } catch (error) {
            this.spinner.fail('Event-Driven Architecture initialization failed');
            this.logger(`❌ Initialization error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Initialize Redis for event persistence and caching
     */
    async initializeRedis() {
        try {
            this.redis = createClient({ url: this.config.redis.url });

            this.redis.on('error', (error) => {
                this.logger(`❌ Redis error: ${error.message}`);
            });

            this.redis.on('connect', () => {
                this.logger('🔗 Connected to Redis for event persistence');
            });

            await this.redis.connect();
            this.logger('✅ Redis connection established');

        } catch (error) {
            this.logger(`⚠️ Redis connection failed: ${error.message}`);
            // Continue without Redis if not available
        }
    }

    /**
     * Initialize RabbitMQ for distributed messaging
     */
    async initializeRabbitMQ() {
        try {
            this.rabbitmq = await amqp.connect(this.config.rabbitmq.url);

            this.rabbitmq.on('error', (error) => {
                this.logger(`❌ RabbitMQ error: ${error.message}`);
            });

            this.rabbitmq.on('close', () => {
                this.logger('⚠️ RabbitMQ connection closed');
            });

            // Create channel
            this.rabbitmqChannel = await this.rabbitmq.createChannel();

            // Setup exchanges
            await this.setupRabbitMQExchanges();

            this.logger('✅ RabbitMQ connection established');

        } catch (error) {
            this.logger(`⚠️ RabbitMQ connection failed: ${error.message}`);
            // Continue without RabbitMQ if not available
        }
    }

    /**
     * Setup RabbitMQ exchanges for different event patterns
     */
    async setupRabbitMQExchanges() {
        if (!this.rabbitmqChannel) return;

        const exchanges = [
            { name: `${this.config.rabbitmq.exchangePrefix}.direct`, type: 'direct' },
            { name: `${this.config.rabbitmq.exchangePrefix}.topic`, type: 'topic' },
            { name: `${this.config.rabbitmq.exchangePrefix}.fanout`, type: 'fanout' },
            { name: `${this.config.rabbitmq.exchangePrefix}.headers`, type: 'headers' }
        ];

        for (const exchange of exchanges) {
            await this.rabbitmqChannel.assertExchange(exchange.name, exchange.type, {
                durable: true,
                autoDelete: false
            });

            this.logger(`📡 Created RabbitMQ exchange: ${exchange.name} (${exchange.type})`);
        }
    }

    /**
     * Initialize WebSocket server for real-time events
     */
    async initializeWebSocket() {
        this.wsServer = new WebSocketServer({
            port: this.config.websocket.port,
            path: '/events'
        });

        this.wsServer.on('connection', (ws, req) => {
            this.connectedClients.add(ws);

            this.logger(`🔌 New event client connected (${this.connectedClients.size} total)`);

            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connected',
                message: 'Connected to Event-Driven Architecture',
                timestamp: new Date().toISOString(),
                availableStreams: Array.from(this.eventStreams.keys())
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
                this.logger(`🔌 Event client disconnected (${this.connectedClients.size} remaining)`);
            });

            // Handle errors
            ws.on('error', (error) => {
                this.logger(`❌ WebSocket error: ${error.message}`);
                this.connectedClients.delete(ws);
            });
        });

        this.logger(`✅ WebSocket server initialized on port ${this.config.websocket.port}`);
    }

    /**
     * Handle WebSocket messages
     */
    handleWebSocketMessage(ws, data) {
        switch (data.type) {
            case 'subscribe':
                // Subscribe to event stream
                if (data.stream && this.eventStreams.has(data.stream)) {
                    ws.subscribedStreams = ws.subscribedStreams || new Set();
                    ws.subscribedStreams.add(data.stream);

                    ws.send(JSON.stringify({
                        type: 'subscribed',
                        stream: data.stream,
                        timestamp: new Date().toISOString()
                    }));
                }
                break;

            case 'unsubscribe':
                // Unsubscribe from event stream
                if (ws.subscribedStreams) {
                    ws.subscribedStreams.delete(data.stream);
                }
                break;

            case 'publish':
                // Publish event through WebSocket
                if (data.event) {
                    this.publishEvent(data.event.type, data.event.payload, {
                        source: 'websocket',
                        ...data.event.metadata
                    });
                }
                break;

            case 'replay':
                // Replay events from stream
                if (data.stream && data.fromTimestamp) {
                    this.replayEvents(data.stream, data.fromTimestamp, ws);
                }
                break;

            default:
                this.logger(`⚠️ Unknown WebSocket message type: ${data.type}`);
        }
    }

    /**
     * Initialize event store for event sourcing
     */
    async initializeEventStore() {
        // Create default event streams
        const defaultStreams = [
            'system.events',
            'user.events',
            'service.events',
            'saga.events',
            'error.events'
        ];

        for (const streamName of defaultStreams) {
            this.eventStreams.set(streamName, {
                name: streamName,
                events: [],
                subscribers: new Set(),
                createdAt: new Date(),
                lastEventAt: null
            });
        }

        // Setup event cleanup job
        this.setupEventCleanup();

        this.logger(`✅ Event store initialized with ${this.eventStreams.size} streams`);
    }

    /**
     * Setup default event handlers
     */
    async setupDefaultHandlers() {
        // System event handlers
        this.registerEventHandler('system.startup', async (event) => {
            this.logger(`🚀 System startup event: ${event.payload.service}`);
        });

        this.registerEventHandler('system.shutdown', async (event) => {
            this.logger(`🔄 System shutdown event: ${event.payload.service}`);
        });

        this.registerEventHandler('service.health.changed', async (event) => {
            this.logger(`🏥 Service health changed: ${event.payload.service} -> ${event.payload.status}`);

            // Broadcast to WebSocket clients
            this.broadcastEvent({
                type: 'service_health_update',
                payload: event.payload,
                timestamp: new Date().toISOString()
            });
        });

        // Error event handler
        this.registerEventHandler('error.occurred', async (event) => {
            this.logger(`❌ Error occurred: ${event.payload.message}`);
            this.metrics.eventsFailed++;
        });

        this.logger('✅ Default event handlers registered');
    }

    /**
     * Initialize saga orchestrator
     */
    async initializeSagaOrchestrator() {
        // Register built-in saga patterns
        this.registerSaga('user.registration', {
            steps: [
                { service: 'id', action: 'create_user', compensate: 'delete_user' },
                { service: 'email', action: 'send_welcome', compensate: 'send_cancellation' },
                { service: 'analytics', action: 'track_signup', compensate: 'track_cancellation' }
            ],
            timeout: this.config.saga.timeout
        });

        this.registerSaga('payment.processing', {
            steps: [
                { service: 'bancai', action: 'validate_payment', compensate: 'void_validation' },
                { service: 'bancai', action: 'charge_payment', compensate: 'refund_payment' },
                { service: 'order', action: 'confirm_order', compensate: 'cancel_order' },
                { service: 'inventory', action: 'reserve_items', compensate: 'release_items' }
            ],
            timeout: this.config.saga.timeout
        });

        this.logger(`✅ Saga orchestrator initialized with ${this.sagaDefinitions.size} patterns`);
    }

    /**
     * Setup monitoring and metrics collection
     */
    async setupMonitoring() {
        // Metrics collection
        setInterval(() => {
            this.collectMetrics();
        }, this.config.monitoring.metricsInterval);

        // Event cleanup
        setInterval(() => {
            this.cleanupEvents();
        }, 60 * 60 * 1000); // Every hour

        this.logger('✅ Event monitoring and cleanup configured');
    }

    /**
     * Register built-in event schemas
     */
    async registerBuiltInSchemas() {
        const schemas = {
            'system.startup': {
                type: 'object',
                properties: {
                    service: { type: 'string' },
                    version: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' }
                },
                required: ['service', 'version']
            },
            'service.health.changed': {
                type: 'object',
                properties: {
                    service: { type: 'string' },
                    status: { type: 'string', enum: ['healthy', 'unhealthy', 'degraded'] },
                    previousStatus: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' }
                },
                required: ['service', 'status']
            },
            'user.action': {
                type: 'object',
                properties: {
                    userId: { type: 'string' },
                    action: { type: 'string' },
                    metadata: { type: 'object' },
                    timestamp: { type: 'string', format: 'date-time' }
                },
                required: ['userId', 'action']
            }
        };

        for (const [eventType, schema] of Object.entries(schemas)) {
            this.registerEventSchema(eventType, schema);
        }

        this.logger(`✅ Built-in event schemas registered (${Object.keys(schemas).length} schemas)`);
    }

    /**
     * Publish an event to the event bus
     */
    async publishEvent(eventType, payload, metadata = {}) {
        const event = {
            id: uuidv4(),
            type: eventType,
            payload,
            metadata: {
                timestamp: new Date().toISOString(),
                source: metadata.source || 'unknown',
                correlationId: metadata.correlationId || uuidv4(),
                ...metadata
            }
        };

        try {
            // Validate event schema if available
            if (this.eventSchemas.has(eventType)) {
                const isValid = this.validateEvent(event);
                if (!isValid) {
                    throw new Error(`Invalid event schema for ${eventType}`);
                }
            }

            // Store event in event store
            await this.storeEvent(event);

            // Publish to local event bus
            this.eventBus.emit(eventType, event);
            this.eventBus.emit('*', event); // Wildcard listener

            // Publish to Redis if available
            if (this.redis) {
                await this.redis.publish(
                    `${this.config.redis.keyPrefix}${eventType}`,
                    JSON.stringify(event)
                );
            }

            // Publish to RabbitMQ if available
            if (this.rabbitmqChannel) {
                await this.publishToRabbitMQ(event);
            }

            // Broadcast to WebSocket clients
            this.broadcastEvent(event);

            // Update metrics
            this.metrics.eventsPublished++;

            this.logger(`📤 Event published: ${eventType} [${event.id}]`);

            return event;

        } catch (error) {
            this.logger(`❌ Failed to publish event ${eventType}: ${error.message}`);
            this.metrics.eventsFailed++;
            throw error;
        }
    }

    /**
     * Store event in the event store
     */
    async storeEvent(event) {
        // Determine stream name
        const streamName = this.getStreamForEvent(event.type);

        // Get or create stream
        let stream = this.eventStreams.get(streamName);
        if (!stream) {
            stream = {
                name: streamName,
                events: [],
                subscribers: new Set(),
                createdAt: new Date(),
                lastEventAt: null
            };
            this.eventStreams.set(streamName, stream);
        }

        // Add event to stream
        stream.events.push(event);
        stream.lastEventAt = new Date();

        // Store in Redis if available
        if (this.redis) {
            const key = `${this.config.redis.keyPrefix}stream:${streamName}`;
            await this.redis.lpush(key, JSON.stringify(event));

            // Set expiration
            await this.redis.expire(key, Math.floor(this.config.eventStore.retention / 1000));
        }

        // Enforce stream size limits
        if (stream.events.length > this.config.eventStore.maxEvents) {
            stream.events = stream.events.slice(-this.config.eventStore.maxEvents);
        }
    }

    /**
     * Get stream name for an event type
     */
    getStreamForEvent(eventType) {
        const parts = eventType.split('.');
        if (parts.length >= 2) {
            return `${parts[0]}.events`;
        }
        return 'system.events';
    }

    /**
     * Publish event to RabbitMQ
     */
    async publishToRabbitMQ(event) {
        if (!this.rabbitmqChannel) return;

        const exchange = `${this.config.rabbitmq.exchangePrefix}.topic`;
        const routingKey = event.type;

        await this.rabbitmqChannel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(event)),
            {
                persistent: true,
                timestamp: Date.now(),
                messageId: event.id,
                correlationId: event.metadata.correlationId
            }
        );
    }

    /**
     * Register an event handler
     */
    registerEventHandler(eventType, handler, options = {}) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }

        const handlerInfo = {
            id: uuidv4(),
            handler,
            options: {
                priority: options.priority || 0,
                async: options.async !== false,
                retries: options.retries || 0,
                timeout: options.timeout || 30000
            }
        };

        this.eventHandlers.get(eventType).push(handlerInfo);

        // Register with local event bus
        this.eventBus.on(eventType, async (event) => {
            await this.executeHandler(handlerInfo, event);
        });

        this.logger(`📝 Event handler registered: ${eventType}`);

        return handlerInfo.id;
    }

    /**
     * Execute an event handler
     */
    async executeHandler(handlerInfo, event) {
        const startTime = Date.now();

        try {
            if (handlerInfo.options.async) {
                // Execute asynchronously
                setImmediate(async () => {
                    await handlerInfo.handler(event);
                });
            } else {
                // Execute synchronously with timeout
                await Promise.race([
                    handlerInfo.handler(event),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Handler timeout')), handlerInfo.options.timeout)
                    )
                ]);
            }

            const processingTime = Date.now() - startTime;
            this.metrics.eventsProcessed++;
            this.metrics.totalProcessingTime += processingTime;
            this.metrics.averageProcessingTime = this.metrics.totalProcessingTime / this.metrics.eventsProcessed;

        } catch (error) {
            this.logger(`❌ Event handler error for ${event.type}: ${error.message}`);
            this.metrics.eventsFailed++;

            // Emit error event
            this.publishEvent('error.occurred', {
                eventType: event.type,
                eventId: event.id,
                handlerId: handlerInfo.id,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Register an event schema for validation
     */
    registerEventSchema(eventType, schema) {
        const validator = this.ajv.compile(schema);
        this.eventSchemas.set(eventType, validator);

        this.logger(`📋 Event schema registered: ${eventType}`);
    }

    /**
     * Validate an event against its schema
     */
    validateEvent(event) {
        const validator = this.eventSchemas.get(event.type);
        if (!validator) return true;

        const isValid = validator(event.payload);
        if (!isValid) {
            this.logger(`❌ Event validation failed for ${event.type}: ${JSON.stringify(validator.errors)}`);
        }

        return isValid;
    }

    /**
     * Register a saga definition
     */
    registerSaga(sagaType, definition) {
        this.sagaDefinitions.set(sagaType, {
            ...definition,
            id: uuidv4(),
            registeredAt: new Date()
        });

        this.logger(`🔄 Saga registered: ${sagaType}`);
    }

    /**
     * Start a saga execution
     */
    async startSaga(sagaType, payload, metadata = {}) {
        const sagaDefinition = this.sagaDefinitions.get(sagaType);
        if (!sagaDefinition) {
            throw new Error(`Saga definition not found: ${sagaType}`);
        }

        const sagaId = uuidv4();
        const saga = {
            id: sagaId,
            type: sagaType,
            payload,
            metadata,
            definition: sagaDefinition,
            state: 'started',
            currentStep: 0,
            completedSteps: [],
            failedSteps: [],
            startedAt: new Date(),
            updatedAt: new Date()
        };

        this.activesSagas.set(sagaId, saga);
        this.metrics.sagasStarted++;

        // Publish saga started event
        await this.publishEvent('saga.started', {
            sagaId,
            sagaType,
            payload
        });

        // Execute first step
        await this.executeSagaStep(sagaId);

        this.logger(`🔄 Saga started: ${sagaType} [${sagaId}]`);

        return sagaId;
    }

    /**
     * Execute a saga step
     */
    async executeSagaStep(sagaId) {
        const saga = this.activesSagas.get(sagaId);
        if (!saga) return;

        if (saga.currentStep >= saga.definition.steps.length) {
            // Saga completed
            saga.state = 'completed';
            saga.completedAt = new Date();
            this.metrics.sagasCompleted++;

            await this.publishEvent('saga.completed', {
                sagaId,
                sagaType: saga.type,
                completedSteps: saga.completedSteps.length
            });

            this.activesSagas.delete(sagaId);
            return;
        }

        const step = saga.definition.steps[saga.currentStep];

        try {
            // Execute step (simulated)
            await this.executeStep(step, saga.payload);

            saga.completedSteps.push({
                stepIndex: saga.currentStep,
                step,
                completedAt: new Date()
            });

            saga.currentStep++;
            saga.updatedAt = new Date();

            // Continue to next step
            await this.executeSagaStep(sagaId);

        } catch (error) {
            this.logger(`❌ Saga step failed: ${saga.type}[${sagaId}] step ${saga.currentStep}`);

            saga.failedSteps.push({
                stepIndex: saga.currentStep,
                step,
                error: error.message,
                failedAt: new Date()
            });

            // Start compensation
            await this.compensateSaga(sagaId);
        }
    }

    /**
     * Execute a single saga step (simulated)
     */
    async executeStep(step, payload) {
        // This would normally make an HTTP call to the service
        // For now, we'll simulate success/failure
        const success = Math.random() > 0.1; // 90% success rate

        if (!success) {
            throw new Error(`Step execution failed: ${step.service}.${step.action}`);
        }

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Compensate a failed saga
     */
    async compensateSaga(sagaId) {
        const saga = this.activesSagas.get(sagaId);
        if (!saga) return;

        saga.state = 'compensating';
        this.metrics.sagasFailed++;

        // Execute compensation steps in reverse order
        for (let i = saga.completedSteps.length - 1; i >= 0; i--) {
            const completedStep = saga.completedSteps[i];
            const compensationAction = completedStep.step.compensate;

            if (compensationAction) {
                try {
                    await this.executeStep({
                        service: completedStep.step.service,
                        action: compensationAction
                    }, saga.payload);

                    this.logger(`🔄 Compensated step: ${completedStep.step.service}.${compensationAction}`);

                } catch (error) {
                    this.logger(`❌ Compensation failed: ${completedStep.step.service}.${compensationAction}`);
                }
            }
        }

        saga.state = 'compensated';
        saga.compensatedAt = new Date();

        await this.publishEvent('saga.compensated', {
            sagaId,
            sagaType: saga.type,
            reason: 'Step execution failed'
        });

        this.activesSagas.delete(sagaId);
    }

    /**
     * Broadcast event to WebSocket clients
     */
    broadcastEvent(event, filter = null) {
        if (!this.wsServer || this.connectedClients.size === 0) return;

        const message = JSON.stringify({
            type: 'event',
            event: event,
            timestamp: new Date().toISOString()
        });

        this.connectedClients.forEach(ws => {
            if (ws.readyState === ws.OPEN) {
                // Apply filter if provided
                if (filter && !filter(ws)) return;

                // Check if client is subscribed to the event stream
                const streamName = this.getStreamForEvent(event.type);
                if (ws.subscribedStreams && !ws.subscribedStreams.has(streamName)) {
                    return;
                }

                ws.send(message);
            }
        });
    }

    /**
     * Replay events from a stream
     */
    async replayEvents(streamName, fromTimestamp, client = null) {
        const stream = this.eventStreams.get(streamName);
        if (!stream) return;

        const fromDate = new Date(fromTimestamp);
        const eventsToReplay = stream.events.filter(event =>
            new Date(event.metadata.timestamp) >= fromDate
        );

        this.logger(`🔄 Replaying ${eventsToReplay.length} events from ${streamName}`);

        for (const event of eventsToReplay) {
            if (client && client.readyState === client.OPEN) {
                client.send(JSON.stringify({
                    type: 'replay',
                    event: event,
                    timestamp: new Date().toISOString()
                }));
            } else {
                // Re-emit to local event bus
                this.eventBus.emit(event.type, event);
            }

            // Small delay to prevent overwhelming
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * Collect metrics
     */
    collectMetrics() {
        const currentMetrics = {
            ...this.metrics,
            activeConnections: this.connectedClients.size,
            activeSagas: this.activesSagas.size,
            eventStreams: this.eventStreams.size,
            eventHandlers: this.eventHandlers.size,
            timestamp: new Date().toISOString()
        };

        // Broadcast metrics to subscribers
        this.broadcastEvent({
            type: 'metrics.updated',
            payload: currentMetrics,
            metadata: { source: 'event-architecture' }
        });

        // Store metrics in Redis if available
        if (this.redis) {
            const key = `${this.config.redis.keyPrefix}metrics:${Date.now()}`;
            this.redis.setex(key, 3600, JSON.stringify(currentMetrics));
        }
    }

    /**
     * Setup event cleanup
     */
    setupEventCleanup() {
        // Cleanup old events every hour
        cron.schedule('0 * * * *', () => {
            this.cleanupEvents();
        });
    }

    /**
     * Cleanup old events
     */
    cleanupEvents() {
        const now = Date.now();
        const retentionPeriod = this.config.eventStore.retention;

        for (const [streamName, stream] of this.eventStreams.entries()) {
            const originalLength = stream.events.length;

            stream.events = stream.events.filter(event => {
                const eventTime = new Date(event.metadata.timestamp).getTime();
                return (now - eventTime) < retentionPeriod;
            });

            const removed = originalLength - stream.events.length;
            if (removed > 0) {
                this.logger(`🧹 Cleaned up ${removed} old events from ${streamName}`);
            }
        }
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        this.logger('🔄 Shutting down Event-Driven Architecture...');

        try {
            // Close WebSocket connections
            if (this.wsServer) {
                this.connectedClients.forEach(ws => {
                    ws.close(1000, 'Server shutting down');
                });
                this.wsServer.close();
            }

            // Close RabbitMQ connection
            if (this.rabbitmq) {
                await this.rabbitmq.close();
            }

            // Close Redis connection
            if (this.redis) {
                await this.redis.quit();
            }

            // Cancel active sagas
            for (const [sagaId, saga] of this.activesSagas.entries()) {
                saga.state = 'cancelled';
                await this.publishEvent('saga.cancelled', {
                    sagaId,
                    sagaType: saga.type,
                    reason: 'System shutdown'
                });
            }

            this.logger('✅ Event-Driven Architecture shutdown complete');

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
            console.log(chalk.blue(`[${timestamp}] 🔄 EDA: ${message}`));
        };
    }
}

/**
 * Standalone mode execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log(chalk.cyan('🔄 Event-Driven Architecture - Standalone Mode'));

    const eda = new EventDrivenArchitecture();

    // Initialize and start
    eda.initialize().catch(error => {
        console.error(chalk.red('❌ Failed to initialize Event-Driven Architecture:'), error);
        process.exit(1);
    });

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n⚠️ Received SIGINT, shutting down gracefully...'));
        await eda.shutdown();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log(chalk.yellow('\n⚠️ Received SIGTERM, shutting down gracefully...'));
        await eda.shutdown();
        process.exit(0);
    });
}

export default EventDrivenArchitecture;
