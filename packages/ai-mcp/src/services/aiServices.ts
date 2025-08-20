import { OpenAI } from 'openai';
// Note: Additional AI providers will be added when their packages are available
import { Decimal } from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export interface AIProvider {
    id: string;
    name: string;
    type: 'openai' | 'azure' | 'anthropic' | 'huggingface' | 'ollama';
    status: 'active' | 'inactive' | 'error';
    models: string[];
    endpoint?: string;
    apiKey?: string;
    lastHealthCheck: Date;
}

export interface ModelInfo {
    id: string;
    name: string;
    provider: string;
    type: 'chat' | 'completion' | 'embedding' | 'image' | 'audio';
    contextLength: number;
    inputCost: Decimal;
    outputCost: Decimal;
    capabilities: string[];
    isEnabled: boolean;
}

export interface InferenceRequest {
    modelId: string;
    prompt: string;
    messages?: Array<{ role: string; content: string }> | undefined;
    maxTokens?: number | undefined;
    temperature?: number | undefined;
    topP?: number | undefined;
    frequencyPenalty?: number | undefined;
    presencePenalty?: number | undefined;
    systemPrompt?: string | undefined;
    streaming?: boolean | undefined;
}

export interface InferenceResult {
    id: string;
    modelId: string;
    prompt: string;
    response: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        cost: Decimal;
    };
    metadata: {
        provider: string;
        duration: number;
        timestamp: Date;
        requestId: string;
    };
}

export interface ModelPerformance {
    modelId: string;
    totalRequests: number;
    totalTokens: number;
    totalCost: Decimal;
    averageResponseTime: number;
    errorRate: number;
    lastUsed: Date;
}

export class AIServices {
    private providers: Map<string, AIProvider> = new Map();
    private models: Map<string, ModelInfo> = new Map();
    private clients: Map<string, any> = new Map();
    private performance: Map<string, ModelPerformance> = new Map();
    private cache: Map<string, any> = new Map();

    constructor() {
        this.initializeProviders();
        this.initializeHealthMonitoring();
        this.loadModels();
        logger.info('AI Services initialized successfully');
    }

    private initializeProviders(): void {
        // Azure OpenAI Provider (primary)
        if (config.azure?.endpoint && config.azure?.apiKey) {
            const azureOpenAI = new OpenAI({
                apiKey: config.azure.apiKey,
                baseURL: `${config.azure.endpoint}/openai/deployments`,
                defaultQuery: { 'api-version': config.azure.apiVersion || '2024-12-01-preview' },
                defaultHeaders: {
                    'api-key': config.azure.apiKey,
                },
            });

            this.clients.set('azure', azureOpenAI);
            this.providers.set('azure', {
                id: 'azure',
                name: 'Azure OpenAI',
                type: 'azure',
                status: 'active',
                models: config.azure.deployments || ['gpt-4', 'gpt-4-turbo', 'gpt-35-turbo'],
                endpoint: config.azure.endpoint,
                lastHealthCheck: new Date(),
            });
            logger.info('Azure OpenAI provider initialized');
        }

        // OpenAI Provider (fallback)
        if (config.openai?.apiKey) {
            const openai = new OpenAI({
                apiKey: config.openai.apiKey,
                baseURL: config.openai.baseUrl,
            });

            this.clients.set('openai', openai);
            this.providers.set('openai', {
                id: 'openai',
                name: 'OpenAI',
                type: 'openai',
                status: 'active',
                models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'text-embedding-ada-002'],
                lastHealthCheck: new Date(),
            });
            logger.info('OpenAI provider initialized');
        }

        // Note: Other providers (Anthropic, etc.) can be added when packages are installed
        // For now, we'll focus on Azure OpenAI as the primary provider

        logger.info(`Initialized ${this.providers.size} AI providers`);
    }

    private loadModels(): void {
        // Load model configurations
        const modelConfigs = [
            // Azure OpenAI Models (Primary)
            {
                id: 'gpt-4',
                name: 'GPT-4 (Azure)',
                provider: 'azure',
                type: 'chat' as const,
                contextLength: 8192,
                inputCost: new Decimal('0.03'),
                outputCost: new Decimal('0.06'),
                capabilities: ['chat', 'reasoning', 'analysis', 'coding'],
                isEnabled: true,
            },
            {
                id: 'gpt-4-turbo',
                name: 'GPT-4 Turbo (Azure)',
                provider: 'azure',
                type: 'chat' as const,
                contextLength: 128000,
                inputCost: new Decimal('0.01'),
                outputCost: new Decimal('0.03'),
                capabilities: ['chat', 'reasoning', 'analysis', 'coding', 'vision'],
                isEnabled: true,
            },
            {
                id: 'gpt-35-turbo',
                name: 'GPT-3.5 Turbo (Azure)',
                provider: 'azure',
                type: 'chat' as const,
                contextLength: 16385,
                inputCost: new Decimal('0.0015'),
                outputCost: new Decimal('0.002'),
                capabilities: ['chat', 'reasoning', 'coding'],
                isEnabled: true,
            },
            {
                id: 'text-embedding-ada-002',
                name: 'Text Embedding Ada 002 (Azure)',
                provider: 'azure',
                type: 'embedding' as const,
                contextLength: 8191,
                inputCost: new Decimal('0.0001'),
                outputCost: new Decimal('0'),
                capabilities: ['embedding', 'similarity', 'search'],
                isEnabled: true,
            },
            // OpenAI Models (Fallback)
            {
                id: 'openai-gpt-4',
                name: 'GPT-4 (OpenAI)',
                provider: 'openai',
                type: 'chat' as const,
                contextLength: 8192,
                inputCost: new Decimal('0.03'),
                outputCost: new Decimal('0.06'),
                capabilities: ['chat', 'reasoning', 'analysis', 'coding'],
                isEnabled: config.openai?.apiKey ? true : false,
            },
            {
                id: 'openai-gpt-4-turbo',
                name: 'GPT-4 Turbo (OpenAI)',
                provider: 'openai',
                type: 'chat' as const,
                contextLength: 128000,
                inputCost: new Decimal('0.01'),
                outputCost: new Decimal('0.03'),
                capabilities: ['chat', 'reasoning', 'analysis', 'coding', 'vision'],
                isEnabled: config.openai?.apiKey ? true : false,
            },
            {
                id: 'openai-gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo (OpenAI)',
                provider: 'openai',
                type: 'chat' as const,
                contextLength: 16385,
                inputCost: new Decimal('0.0015'),
                outputCost: new Decimal('0.002'),
                capabilities: ['chat', 'reasoning', 'coding'],
                isEnabled: config.openai?.apiKey ? true : false,
            },
        ];

        modelConfigs.forEach(model => {
            this.models.set(model.id, model);
            this.performance.set(model.id, {
                modelId: model.id,
                totalRequests: 0,
                totalTokens: 0,
                totalCost: new Decimal(0),
                averageResponseTime: 0,
                errorRate: 0,
                lastUsed: new Date(),
            });
        });

        logger.info(`Loaded ${modelConfigs.length} AI models`);
    }

    private initializeHealthMonitoring(): void {
        // Run health checks every 5 minutes
        cron.schedule('*/5 * * * *', async () => {
            await this.performHealthChecks();
        });

        // Clear cache every hour
        cron.schedule('0 * * * *', () => {
            this.cache.clear();
            logger.info('AI services cache cleared');
        });
    }

    private async performHealthChecks(): Promise<void> {
        logger.info('Performing AI provider health checks');

        for (const [providerId, provider] of this.providers.entries()) {
            try {
                const client = this.clients.get(providerId);
                if (!client) continue;

                let isHealthy = false;

                switch (provider.type) {
                    case 'azure':
                    case 'openai':
                        try {
                            await client.models.list();
                            isHealthy = true;
                        } catch (error) {
                            logger.warn(`${provider.name} health check failed: ${error}`);
                        }
                        break;

                    default:
                        // For future providers
                        isHealthy = true;
                        break;
                }

                provider.status = isHealthy ? 'active' : 'error';
                provider.lastHealthCheck = new Date();

                logger.info(`Provider ${providerId} health: ${provider.status}`);
            } catch (error) {
                logger.error(`Health check error for provider ${providerId}: ${error}`);
                provider.status = 'error';
                provider.lastHealthCheck = new Date();
            }
        }
    }

    async listProviders(): Promise<AIProvider[]> {
        return Array.from(this.providers.values());
    }

    async listModels(providerId?: string): Promise<ModelInfo[]> {
        const models = Array.from(this.models.values());

        if (providerId) {
            return models.filter(model => model.provider === providerId);
        }

        return models;
    }

    async getModelInfo(modelId: string): Promise<ModelInfo | null> {
        return this.models.get(modelId) || null;
    }

    async generateCompletion(request: InferenceRequest): Promise<InferenceResult> {
        const startTime = Date.now();
        const requestId = uuidv4();

        logger.info(`Starting inference request ${requestId} for model ${request.modelId}`);

        const model = this.models.get(request.modelId);
        if (!model) {
            throw new Error(`Model ${request.modelId} not found`);
        }

        const provider = this.providers.get(model.provider);
        if (!provider || provider.status !== 'active') {
            throw new Error(`Provider ${model.provider} is not available`);
        }

        const client = this.clients.get(model.provider);
        if (!client) {
            throw new Error(`Client for provider ${model.provider} not initialized`);
        }

        try {
            let response: string;
            let usage = {
                promptTokens: 0,
                completionTokens: 0,
                totalTokens: 0,
            };

            switch (provider.type) {
                case 'azure':
                case 'openai':
                    if (model.type === 'embedding') {
                        // Handle embedding requests
                        const embeddingResponse = await client.embeddings.create({
                            model: request.modelId.replace('openai-', ''), // Remove openai- prefix for fallback models
                            input: request.prompt,
                        });

                        response = JSON.stringify(embeddingResponse.data[0]?.embedding || []);
                        usage = {
                            promptTokens: embeddingResponse.usage?.prompt_tokens || 0,
                            completionTokens: 0,
                            totalTokens: embeddingResponse.usage?.total_tokens || 0,
                        };
                    } else {
                        // Handle chat completions
                        const messages = request.messages || [{ role: 'user', content: request.prompt }];
                        if (request.systemPrompt) {
                            messages.unshift({ role: 'system', content: request.systemPrompt });
                        }

                        const modelName = request.modelId.replace('openai-', ''); // Remove openai- prefix for fallback models
                        const completion = await client.chat.completions.create({
                            model: modelName,
                            messages: messages,
                            max_tokens: request.maxTokens || 1000,
                            temperature: request.temperature || 0.7,
                            top_p: request.topP || 1,
                            frequency_penalty: request.frequencyPenalty || 0,
                            presence_penalty: request.presencePenalty || 0,
                        });

                        response = completion.choices[0]?.message?.content || '';
                        usage = {
                            promptTokens: completion.usage?.prompt_tokens || 0,
                            completionTokens: completion.usage?.completion_tokens || 0,
                            totalTokens: completion.usage?.total_tokens || 0,
                        };
                    }
                    break;

                default:
                    throw new Error(`Unsupported provider type: ${provider.type}`);
            }

            const duration = Date.now() - startTime;
            const cost = this.calculateCost(model, usage.promptTokens, usage.completionTokens);

            // Update performance metrics
            this.updatePerformanceMetrics(request.modelId, usage.totalTokens, cost, duration);

            const result: InferenceResult = {
                id: requestId,
                modelId: request.modelId,
                prompt: request.prompt,
                response,
                usage: {
                    ...usage,
                    cost,
                },
                metadata: {
                    provider: model.provider,
                    duration,
                    timestamp: new Date(),
                    requestId,
                },
            };

            logger.info(`Inference request ${requestId} completed in ${duration}ms`);
            return result;

        } catch (error) {
            const duration = Date.now() - startTime;
            this.updateErrorRate(request.modelId);

            logger.error(`Inference request ${requestId} failed after ${duration}ms: ${error}`);
            throw new Error(`Inference failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private calculateCost(model: ModelInfo, promptTokens: number, completionTokens: number): Decimal {
        const inputCost = model.inputCost.mul(promptTokens).div(1000);
        const outputCost = model.outputCost.mul(completionTokens).div(1000);
        return inputCost.plus(outputCost);
    }

    private updatePerformanceMetrics(modelId: string, tokens: number, cost: Decimal, duration: number): void {
        const perf = this.performance.get(modelId);
        if (!perf) return;

        perf.totalRequests++;
        perf.totalTokens += tokens;
        perf.totalCost = perf.totalCost.plus(cost);
        perf.averageResponseTime = (perf.averageResponseTime * (perf.totalRequests - 1) + duration) / perf.totalRequests;
        perf.lastUsed = new Date();

        this.performance.set(modelId, perf);
    }

    private updateErrorRate(modelId: string): void {
        const perf = this.performance.get(modelId);
        if (!perf) return;

        perf.totalRequests++;
        perf.errorRate = (perf.errorRate * (perf.totalRequests - 1) + 1) / perf.totalRequests;

        this.performance.set(modelId, perf);
    }

    async getModelPerformance(modelId?: string): Promise<ModelPerformance[]> {
        if (modelId) {
            const perf = this.performance.get(modelId);
            return perf ? [perf] : [];
        }

        return Array.from(this.performance.values());
    }

    async optimizeModelSelection(capabilities: string[] = []): Promise<string> {
        const availableModels = Array.from(this.models.values())
            .filter(model => {
                const provider = this.providers.get(model.provider);
                return model.isEnabled && provider?.status === 'active';
            });

        if (availableModels.length === 0) {
            throw new Error('No available models found');
        }

        // Simple optimization based on capabilities and cost
        let bestModel = availableModels[0];
        let bestScore = 0;

        for (const model of availableModels) {
            let score = 0;

            // Check capability match
            const capabilityMatch = capabilities.length === 0 ||
                capabilities.some(cap => model.capabilities.includes(cap));

            if (capabilityMatch) {
                score += 10;
            }

            // Consider cost (lower cost = higher score)
            const avgCost = model.inputCost.plus(model.outputCost).div(2);
            score += (1 / avgCost.toNumber()) * 100;

            // Consider performance metrics
            const perf = this.performance.get(model.id);
            if (perf) {
                score += (1 - perf.errorRate) * 5;
                score -= perf.averageResponseTime / 1000; // Penalize slow models
            }

            if (score > bestScore) {
                bestScore = score;
                bestModel = model;
            }
        }

        if (!bestModel) {
            throw new Error('Could not determine optimal model');
        }

        logger.info(`Optimized model selection: ${bestModel.id} (score: ${bestScore.toFixed(2)})`);
        return bestModel.id;
    }

    async clearCache(): Promise<void> {
        this.cache.clear();
        logger.info('AI services cache cleared manually');
    }

    async getSystemStatus(): Promise<{
        providers: AIProvider[];
        totalModels: number;
        activeModels: number;
        totalRequests: number;
        totalCost: string;
        uptime: string;
    }> {
        const providers = Array.from(this.providers.values());
        const models = Array.from(this.models.values());
        const performance = Array.from(this.performance.values());

        const activeModels = models.filter(model => {
            const provider = this.providers.get(model.provider);
            return model.isEnabled && provider?.status === 'active';
        }).length;

        const totalRequests = performance.reduce((sum, perf) => sum + perf.totalRequests, 0);
        const totalCost = performance.reduce((sum, perf) => sum.plus(perf.totalCost), new Decimal(0));

        return {
            providers,
            totalModels: models.length,
            activeModels,
            totalRequests,
            totalCost: totalCost.toFixed(4),
            uptime: formatDistanceToNow(new Date(Date.now() - process.uptime() * 1000)),
        };
    }
}
