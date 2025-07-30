/**
 * CODAI Advanced Service Integrations - Message Queue Manager
 * Multi-protocol message queue system with monitoring and reliability
 */

import { EventEmitter } from 'events';
import amqp, { Connection as AMQPConnection, Channel, Message } from 'amqplib';
import Redis from 'ioredis';
import { Kafka, Producer as KafkaProducer, Consumer as KafkaConsumer, EachMessagePayload } from 'kafkajs';
import Bull, { Queue as BullQueue, Job } from 'bull';

import {
    MessageQueueConfig,
    QueueMessage,
    QueueDefinition,
    ExchangeConfig,
    TopicConfig,
    DeadLetterQueueConfig,
    IntegrationError
} from './types';

/**
 * Message Queue Manager
 * Provides unified interface for multiple message queue systems
 */
export class MessageQueueManager extends EventEmitter {
    private config: MessageQueueConfig;
    private connection: any;
    private channels: Map<string, any> = new Map();
    private queues: Map<string, QueueState> = new Map();
    private producers: Map<string, any> = new Map();
    private consumers: Map<string, any> = new Map();
    private deadLetterQueue?: DeadLetterQueueState;
    private bullQueues: Map<string, BullQueue> = new Map();
    private processingStats: Map<string, ProcessingStats> = new Map();
    private managers: {
        monitoringManager: any;
        securityManager: any;
    };

    constructor(config: MessageQueueConfig, managers: any) {
        super();
        this.config = config;
        this.managers = managers;
    }

    /**
     * Start the message queue system
     */
    async start(): Promise<void> {
        try {
            this.emit('queue:starting');

            // Initialize connection based on queue type
            await this.initializeConnection();

            // Setup exchanges (for RabbitMQ)
            if (this.config.exchanges) {
                await this.setupExchanges();
            }

            // Setup queues
            await this.setupQueues();

            // Setup topics (for Kafka)
            if (this.config.topics) {
                await this.setupTopics();
            }

            // Setup dead letter queue
            if (this.config.deadLetterQueue?.enabled) {
                await this.setupDeadLetterQueue();
            }

            // Start monitoring
            if (this.config.monitoring.enabled) {
                await this.startMonitoring();
            }

            this.emit('queue:started');

        } catch (error) {
            this.emit('queue:error', error);
            throw new IntegrationError(
                'QUEUE_START_FAILED',
                `Failed to start message queue: ${error.message}`,
                { error },
                false,
                'server'
            );
        }
    }

    /**
     * Stop the message queue system
     */
    async stop(): Promise<void> {
        try {
            this.emit('queue:stopping');

            // Close consumers
            for (const [queueName, consumer] of this.consumers) {
                await this.stopConsumer(queueName);
            }

            // Close producers
            for (const [name, producer] of this.producers) {
                if (producer.disconnect) {
                    await producer.disconnect();
                }
            }

            // Close Bull queues
            for (const [name, queue] of this.bullQueues) {
                await queue.close();
            }

            // Close channels
            for (const [name, channel] of this.channels) {
                if (channel.close) {
                    await channel.close();
                }
            }

            // Close connection
            if (this.connection) {
                if (this.connection.close) {
                    await this.connection.close();
                } else if (this.connection.disconnect) {
                    await this.connection.disconnect();
                }
            }

            // Clear state
            this.channels.clear();
            this.queues.clear();
            this.producers.clear();
            this.consumers.clear();
            this.bullQueues.clear();
            this.processingStats.clear();

            this.emit('queue:stopped');

        } catch (error) {
            this.emit('queue:error', error);
            throw error;
        }
    }

    /**
     * Send message to queue
     */
    async sendMessage(queueName: string, message: any, options: SendMessageOptions = {}): Promise<string> {
        try {
            const messageId = this.generateMessageId();
            const queueMessage: QueueMessage = {
                messageId,
                body: message,
                headers: options.headers,
                timestamp: new Date(),
                deliveryCount: 0
            };

            switch (this.config.type) {
                case 'rabbitmq':
                    await this.sendRabbitMQMessage(queueName, queueMessage, options);
                    break;
                case 'kafka':
                    await this.sendKafkaMessage(queueName, queueMessage, options);
                    break;
                case 'redis':
                    await this.sendRedisMessage(queueName, queueMessage, options);
                    break;
                case 'sqs':
                    await this.sendSQSMessage(queueName, queueMessage, options);
                    break;
                case 'servicebus':
                    await this.sendServiceBusMessage(queueName, queueMessage, options);
                    break;
                case 'nats':
                    await this.sendNATSMessage(queueName, queueMessage, options);
                    break;
                default:
                    throw new IntegrationError(
                        'UNSUPPORTED_QUEUE_TYPE',
                        `Queue type ${this.config.type} not supported`,
                        { type: this.config.type },
                        false,
                        'client'
                    );
            }

            // Update stats
            this.updateProcessingStats(queueName, 'sent', 1);

            this.emit('message:sent', {
                queueName,
                messageId,
                messageSize: JSON.stringify(message).length,
                timestamp: new Date()
            });

            return messageId;

        } catch (error) {
            this.emit('message:error', { queueName, operation: 'send', error });
            throw error;
        }
    }

    /**
     * Start consuming messages from queue
     */
    async startConsumer(
        queueName: string,
        handler: MessageHandler,
        options: ConsumerOptions = {}
    ): Promise<void> {
        try {
            if (this.consumers.has(queueName)) {
                throw new IntegrationError(
                    'CONSUMER_EXISTS',
                    `Consumer for queue ${queueName} already exists`,
                    { queueName },
                    false,
                    'client'
                );
            }

            switch (this.config.type) {
                case 'rabbitmq':
                    await this.startRabbitMQConsumer(queueName, handler, options);
                    break;
                case 'kafka':
                    await this.startKafkaConsumer(queueName, handler, options);
                    break;
                case 'redis':
                    await this.startRedisConsumer(queueName, handler, options);
                    break;
                case 'sqs':
                    await this.startSQSConsumer(queueName, handler, options);
                    break;
                case 'servicebus':
                    await this.startServiceBusConsumer(queueName, handler, options);
                    break;
                case 'nats':
                    await this.startNATSConsumer(queueName, handler, options);
                    break;
                default:
                    throw new IntegrationError(
                        'UNSUPPORTED_QUEUE_TYPE',
                        `Queue type ${this.config.type} not supported`,
                        { type: this.config.type },
                        false,
                        'client'
                    );
            }

            this.emit('consumer:started', { queueName, options });

        } catch (error) {
            this.emit('consumer:error', { queueName, operation: 'start', error });
            throw error;
        }
    }

    /**
     * Stop consumer for queue
     */
    async stopConsumer(queueName: string): Promise<void> {
        try {
            const consumer = this.consumers.get(queueName);
            if (!consumer) {
                throw new IntegrationError(
                    'CONSUMER_NOT_FOUND',
                    `Consumer for queue ${queueName} not found`,
                    { queueName },
                    false,
                    'client'
                );
            }

            // Stop consumer based on type
            if (consumer.disconnect) {
                await consumer.disconnect();
            } else if (consumer.close) {
                await consumer.close();
            } else if (consumer.stop) {
                await consumer.stop();
            }

            this.consumers.delete(queueName);

            this.emit('consumer:stopped', { queueName });

        } catch (error) {
            this.emit('consumer:error', { queueName, operation: 'stop', error });
            throw error;
        }
    }

    /**
     * Get queue metrics
     */
    async getQueueMetrics(queueName: string): Promise<QueueMetrics> {
        try {
            const stats = this.processingStats.get(queueName) || {
                messagesSent: 0,
                messagesReceived: 0,
                messagesProcessed: 0,
                messagesFailed: 0,
                averageProcessingTime: 0,
                lastActivity: new Date()
            };

            let queueLength = 0;
            let consumerCount = 0;

            // Get queue-specific metrics based on type
            switch (this.config.type) {
                case 'rabbitmq':
                    const queueInfo = await this.getRabbitMQQueueInfo(queueName);
                    queueLength = queueInfo.messageCount;
                    consumerCount = queueInfo.consumerCount;
                    break;
                case 'redis':
                    const bullQueue = this.bullQueues.get(queueName);
                    if (bullQueue) {
                        queueLength = await bullQueue.count();
                    }
                    break;
                // Add other queue types as needed
            }

            return {
                queueName,
                queueLength,
                consumerCount,
                messagesSent: stats.messagesSent,
                messagesReceived: stats.messagesReceived,
                messagesProcessed: stats.messagesProcessed,
                messagesFailed: stats.messagesFailed,
                averageProcessingTime: stats.averageProcessingTime,
                errorRate: stats.messagesReceived > 0
                    ? (stats.messagesFailed / stats.messagesReceived) * 100
                    : 0,
                lastActivity: stats.lastActivity,
                timestamp: new Date()
            };

        } catch (error) {
            this.emit('metrics:error', { queueName, error });
            throw error;
        }
    }

    /**
     * Get all queue metrics
     */
    async getAllQueueMetrics(): Promise<QueueMetrics[]> {
        const metrics: QueueMetrics[] = [];

        for (const queueName of this.queues.keys()) {
            try {
                const queueMetrics = await this.getQueueMetrics(queueName);
                metrics.push(queueMetrics);
            } catch (error) {
                this.emit('metrics:error', { queueName, error });
            }
        }

        return metrics;
    }

    /**
     * Get system health status
     */
    getHealthStatus(): QueueHealthStatus {
        const totalQueues = this.queues.size;
        const activeConsumers = this.consumers.size;
        const totalStats = Array.from(this.processingStats.values());

        const totalMessages = totalStats.reduce((sum, stats) =>
            sum + stats.messagesSent + stats.messagesReceived, 0);

        const totalErrors = totalStats.reduce((sum, stats) =>
            sum + stats.messagesFailed, 0);

        return {
            status: this.connection ? 'healthy' : 'unhealthy',
            totalQueues,
            activeConsumers,
            totalMessages,
            totalErrors,
            errorRate: totalMessages > 0 ? (totalErrors / totalMessages) * 100 : 0,
            uptime: process.uptime(),
            lastCheck: new Date()
        };
    }

    // ==================== PRIVATE METHODS ====================

    private async initializeConnection(): Promise<void> {
        const connConfig = this.config.connection;

        switch (this.config.type) {
            case 'rabbitmq':
                const amqpUrl = `amqp://${connConfig.credentials.username}:${connConfig.credentials.password}@${connConfig.host}:${connConfig.port}`;
                this.connection = await amqp.connect(amqpUrl);
                break;

            case 'kafka':
                this.connection = new Kafka({
                    clientId: this.config.queueId,
                    brokers: [`${connConfig.host}:${connConfig.port}`],
                    ssl: connConfig.ssl?.enabled,
                    sasl: connConfig.credentials.username ? {
                        mechanism: 'plain',
                        username: connConfig.credentials.username,
                        password: connConfig.credentials.password!
                    } : undefined
                });
                break;

            case 'redis':
                this.connection = new Redis({
                    host: connConfig.host,
                    port: connConfig.port,
                    password: connConfig.credentials.password,
                    connectTimeout: 10000,
                    retryDelayOnFailover: 100
                });
                break;

            default:
                throw new IntegrationError(
                    'UNSUPPORTED_QUEUE_TYPE',
                    `Queue type ${this.config.type} not supported`,
                    { type: this.config.type },
                    false,
                    'client'
                );
        }
    }

    private async setupExchanges(): Promise<void> {
        if (this.config.type !== 'rabbitmq' || !this.config.exchanges) {
            return;
        }

        const channel = await this.connection.createChannel();

        for (const exchange of this.config.exchanges) {
            await channel.assertExchange(
                exchange.name,
                exchange.type,
                {
                    durable: exchange.durable,
                    autoDelete: exchange.autoDelete,
                    arguments: exchange.arguments
                }
            );
        }

        await channel.close();
    }

    private async setupQueues(): Promise<void> {
        for (const queueDef of this.config.queues) {
            await this.setupQueue(queueDef);
        }
    }

    private async setupQueue(queueDef: QueueDefinition): Promise<void> {
        switch (this.config.type) {
            case 'rabbitmq':
                await this.setupRabbitMQQueue(queueDef);
                break;
            case 'redis':
                await this.setupRedisQueue(queueDef);
                break;
            // Add other queue types as needed
        }

        const queueState: QueueState = {
            definition: queueDef,
            created: new Date(),
            lastActivity: new Date()
        };

        this.queues.set(queueDef.name, queueState);
        this.processingStats.set(queueDef.name, {
            messagesSent: 0,
            messagesReceived: 0,
            messagesProcessed: 0,
            messagesFailed: 0,
            averageProcessingTime: 0,
            lastActivity: new Date()
        });
    }

    private async setupRabbitMQQueue(queueDef: QueueDefinition): Promise<void> {
        const channel = await this.connection.createChannel();

        await channel.assertQueue(queueDef.name, {
            durable: queueDef.durable,
            exclusive: queueDef.exclusive,
            autoDelete: queueDef.autoDelete,
            arguments: {
                'x-max-length': queueDef.maxLength,
                'x-message-ttl': queueDef.messageTtl,
                ...queueDef.arguments
            }
        });

        // Setup bindings
        if (queueDef.bindings) {
            for (const binding of queueDef.bindings) {
                await channel.bindQueue(
                    queueDef.name,
                    binding.exchange,
                    binding.routingKey,
                    binding.arguments
                );
            }
        }

        this.channels.set(queueDef.name, channel);
    }

    private async setupRedisQueue(queueDef: QueueDefinition): Promise<void> {
        const queue = new Bull(queueDef.name, {
            redis: {
                host: this.config.connection.host,
                port: this.config.connection.port,
                password: this.config.connection.credentials.password
            },
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
                attempts: 3,
                backoff: 'exponential'
            }
        });

        this.bullQueues.set(queueDef.name, queue);
    }

    private async setupTopics(): Promise<void> {
        if (this.config.type !== 'kafka' || !this.config.topics) {
            return;
        }

        const admin = this.connection.admin();
        await admin.connect();

        const existingTopics = await admin.listTopics();
        const topicsToCreate = this.config.topics.filter(
            topic => !existingTopics.includes(topic.name)
        );

        if (topicsToCreate.length > 0) {
            await admin.createTopics({
                topics: topicsToCreate.map(topic => ({
                    topic: topic.name,
                    numPartitions: topic.partitions,
                    replicationFactor: topic.replicationFactor,
                    configEntries: [
                        { name: 'retention.ms', value: topic.retention.toString() },
                        { name: 'cleanup.policy', value: topic.compaction ? 'compact' : 'delete' },
                        { name: 'compression.type', value: topic.compression }
                    ]
                }))
            });
        }

        await admin.disconnect();
    }

    private async setupDeadLetterQueue(): Promise<void> {
        if (!this.config.deadLetterQueue?.enabled) {
            return;
        }

        const dlqConfig = this.config.deadLetterQueue;

        switch (this.config.type) {
            case 'rabbitmq':
                const channel = await this.connection.createChannel();
                await channel.assertQueue(dlqConfig.queueName, {
                    durable: true,
                    arguments: dlqConfig.ttl ? { 'x-message-ttl': dlqConfig.ttl } : undefined
                });
                break;

            case 'redis':
                const dlQueue = new Bull(dlqConfig.queueName, {
                    redis: {
                        host: this.config.connection.host,
                        port: this.config.connection.port,
                        password: this.config.connection.credentials.password
                    }
                });
                this.bullQueues.set(dlqConfig.queueName, dlQueue);
                break;
        }

        this.deadLetterQueue = {
            config: dlqConfig,
            messageCount: 0
        };
    }

    private async startMonitoring(): Promise<void> {
        // Start periodic metrics collection
        setInterval(async () => {
            try {
                const metrics = await this.getAllQueueMetrics();
                this.emit('metrics:collected', { metrics, timestamp: new Date() });

                // Send to monitoring manager
                if (this.managers.monitoringManager) {
                    await this.managers.monitoringManager.recordQueueMetrics(metrics);
                }
            } catch (error) {
                this.emit('monitoring:error', error);
            }
        }, this.config.monitoring.metrics.interval * 1000);
    }

    // RabbitMQ specific methods
    private async sendRabbitMQMessage(queueName: string, message: QueueMessage, options: SendMessageOptions): Promise<void> {
        const channel = this.channels.get(queueName);
        if (!channel) {
            throw new IntegrationError(
                'CHANNEL_NOT_FOUND',
                `Channel for queue ${queueName} not found`,
                { queueName },
                false,
                'client'
            );
        }

        const messageBuffer = Buffer.from(JSON.stringify(message));

        await channel.sendToQueue(queueName, messageBuffer, {
            persistent: true,
            messageId: message.messageId,
            timestamp: message.timestamp.getTime(),
            headers: message.headers,
            priority: options.priority || 0,
            expiration: options.ttl
        });
    }

    private async startRabbitMQConsumer(queueName: string, handler: MessageHandler, options: ConsumerOptions): Promise<void> {
        const channel = this.channels.get(queueName);
        if (!channel) {
            throw new IntegrationError(
                'CHANNEL_NOT_FOUND',
                `Channel for queue ${queueName} not found`,
                { queueName },
                false,
                'client'
            );
        }

        await channel.prefetch(options.concurrency || 1);

        const consumer = await channel.consume(queueName, async (msg: Message | null) => {
            if (!msg) return;

            const startTime = Date.now();

            try {
                const queueMessage: QueueMessage = JSON.parse(msg.content.toString());
                queueMessage.deliveryCount = (msg.fields.deliveryTag || 0) + 1;
                queueMessage.receiptHandle = msg.fields.deliveryTag.toString();

                this.updateProcessingStats(queueName, 'received', 1);

                const result = await handler(queueMessage);

                if (result === 'ack') {
                    channel.ack(msg);
                    this.updateProcessingStats(queueName, 'processed', 1, Date.now() - startTime);
                } else if (result === 'nack') {
                    channel.nack(msg, false, false);
                    this.updateProcessingStats(queueName, 'failed', 1);
                } else if (result === 'retry') {
                    channel.nack(msg, false, true);
                }

            } catch (error) {
                channel.nack(msg, false, false);
                this.updateProcessingStats(queueName, 'failed', 1);
                this.emit('message:processing-error', { queueName, error });
            }
        }, {
            noAck: false
        });

        this.consumers.set(queueName, consumer);
    }

    // Redis specific methods
    private async sendRedisMessage(queueName: string, message: QueueMessage, options: SendMessageOptions): Promise<void> {
        const queue = this.bullQueues.get(queueName);
        if (!queue) {
            throw new IntegrationError(
                'QUEUE_NOT_FOUND',
                `Redis queue ${queueName} not found`,
                { queueName },
                false,
                'client'
            );
        }

        await queue.add(message.messageId, message, {
            priority: options.priority || 0,
            delay: options.delay || 0,
            attempts: options.maxRetries || 3,
            removeOnComplete: true,
            removeOnFail: false
        });
    }

    private async startRedisConsumer(queueName: string, handler: MessageHandler, options: ConsumerOptions): Promise<void> {
        const queue = this.bullQueues.get(queueName);
        if (!queue) {
            throw new IntegrationError(
                'QUEUE_NOT_FOUND',
                `Redis queue ${queueName} not found`,
                { queueName },
                false,
                'client'
            );
        }

        queue.process(options.concurrency || 1, async (job: Job) => {
            const startTime = Date.now();

            try {
                const queueMessage = job.data as QueueMessage;
                this.updateProcessingStats(queueName, 'received', 1);

                const result = await handler(queueMessage);

                if (result === 'ack') {
                    this.updateProcessingStats(queueName, 'processed', 1, Date.now() - startTime);
                    return Promise.resolve();
                } else {
                    this.updateProcessingStats(queueName, 'failed', 1);
                    return Promise.reject(new Error('Message processing failed'));
                }

            } catch (error) {
                this.updateProcessingStats(queueName, 'failed', 1);
                this.emit('message:processing-error', { queueName, error });
                return Promise.reject(error);
            }
        });

        this.consumers.set(queueName, queue);
    }

    // Kafka specific methods
    private async sendKafkaMessage(queueName: string, message: QueueMessage, options: SendMessageOptions): Promise<void> {
        let producer = this.producers.get('kafka');

        if (!producer) {
            producer = this.connection.producer();
            await producer.connect();
            this.producers.set('kafka', producer);
        }

        await producer.send({
            topic: queueName,
            messages: [{
                key: options.key,
                value: JSON.stringify(message),
                headers: message.headers,
                timestamp: message.timestamp.getTime().toString()
            }]
        });
    }

    private async startKafkaConsumer(queueName: string, handler: MessageHandler, options: ConsumerOptions): Promise<void> {
        const consumer = this.connection.consumer({
            groupId: options.groupId || `${this.config.queueId}-${queueName}`
        });

        await consumer.connect();
        await consumer.subscribe({ topic: queueName });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
                const startTime = Date.now();

                try {
                    const queueMessage: QueueMessage = JSON.parse(message.value!.toString());
                    queueMessage.deliveryCount = 1; // Kafka doesn't track delivery count per se

                    this.updateProcessingStats(queueName, 'received', 1);

                    const result = await handler(queueMessage);

                    if (result === 'ack') {
                        this.updateProcessingStats(queueName, 'processed', 1, Date.now() - startTime);
                    } else {
                        this.updateProcessingStats(queueName, 'failed', 1);
                    }

                } catch (error) {
                    this.updateProcessingStats(queueName, 'failed', 1);
                    this.emit('message:processing-error', { queueName, error });
                }
            }
        });

        this.consumers.set(queueName, consumer);
    }

    // Placeholder methods for other queue types
    private async sendSQSMessage(queueName: string, message: QueueMessage, options: SendMessageOptions): Promise<void> {
        // SQS implementation would go here
        throw new IntegrationError('NOT_IMPLEMENTED', 'SQS not implemented yet', {}, false, 'server');
    }

    private async startSQSConsumer(queueName: string, handler: MessageHandler, options: ConsumerOptions): Promise<void> {
        // SQS consumer implementation would go here
        throw new IntegrationError('NOT_IMPLEMENTED', 'SQS consumer not implemented yet', {}, false, 'server');
    }

    private async sendServiceBusMessage(queueName: string, message: QueueMessage, options: SendMessageOptions): Promise<void> {
        // Service Bus implementation would go here
        throw new IntegrationError('NOT_IMPLEMENTED', 'Service Bus not implemented yet', {}, false, 'server');
    }

    private async startServiceBusConsumer(queueName: string, handler: MessageHandler, options: ConsumerOptions): Promise<void> {
        // Service Bus consumer implementation would go here
        throw new IntegrationError('NOT_IMPLEMENTED', 'Service Bus consumer not implemented yet', {}, false, 'server');
    }

    private async sendNATSMessage(queueName: string, message: QueueMessage, options: SendMessageOptions): Promise<void> {
        // NATS implementation would go here
        throw new IntegrationError('NOT_IMPLEMENTED', 'NATS not implemented yet', {}, false, 'server');
    }

    private async startNATSConsumer(queueName: string, handler: MessageHandler, options: ConsumerOptions): Promise<void> {
        // NATS consumer implementation would go here
        throw new IntegrationError('NOT_IMPLEMENTED', 'NATS consumer not implemented yet', {}, false, 'server');
    }

    private async getRabbitMQQueueInfo(queueName: string): Promise<{ messageCount: number; consumerCount: number }> {
        // This would typically use RabbitMQ Management API
        // For now, return placeholder values
        return { messageCount: 0, consumerCount: 0 };
    }

    private updateProcessingStats(queueName: string, operation: string, count: number, processingTime?: number): void {
        const stats = this.processingStats.get(queueName);
        if (!stats) return;

        switch (operation) {
            case 'sent':
                stats.messagesSent += count;
                break;
            case 'received':
                stats.messagesReceived += count;
                break;
            case 'processed':
                stats.messagesProcessed += count;
                if (processingTime) {
                    stats.averageProcessingTime =
                        (stats.averageProcessingTime * (stats.messagesProcessed - count) + processingTime) / stats.messagesProcessed;
                }
                break;
            case 'failed':
                stats.messagesFailed += count;
                break;
        }

        stats.lastActivity = new Date();
        this.processingStats.set(queueName, stats);
    }

    private generateMessageId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    }
}

// ==================== INTERFACE DEFINITIONS ====================

interface QueueState {
    definition: QueueDefinition;
    created: Date;
    lastActivity: Date;
}

interface DeadLetterQueueState {
    config: DeadLetterQueueConfig;
    messageCount: number;
}

interface ProcessingStats {
    messagesSent: number;
    messagesReceived: number;
    messagesProcessed: number;
    messagesFailed: number;
    averageProcessingTime: number;
    lastActivity: Date;
}

export interface SendMessageOptions {
    headers?: Record<string, string>;
    priority?: number;
    ttl?: number;
    delay?: number;
    key?: string;
    maxRetries?: number;
}

export interface ConsumerOptions {
    concurrency?: number;
    groupId?: string;
    autoAck?: boolean;
    visibilityTimeout?: number;
}

export type MessageHandler = (message: QueueMessage) => Promise<'ack' | 'nack' | 'retry'>;

export interface QueueMetrics {
    queueName: string;
    queueLength: number;
    consumerCount: number;
    messagesSent: number;
    messagesReceived: number;
    messagesProcessed: number;
    messagesFailed: number;
    averageProcessingTime: number;
    errorRate: number;
    lastActivity: Date;
    timestamp: Date;
}

export interface QueueHealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    totalQueues: number;
    activeConsumers: number;
    totalMessages: number;
    totalErrors: number;
    errorRate: number;
    uptime: number;
    lastCheck: Date;
}
