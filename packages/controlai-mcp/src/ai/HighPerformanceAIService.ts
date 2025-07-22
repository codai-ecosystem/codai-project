import { OpenAI } from 'openai';
import { PlanAnalysis, AgentSuggestion, AgentType, AgentCapability } from '../types/index.js';
import NodeCache from 'node-cache';

interface AIServiceConfig {
    endpoint: string;
    apiKey: string;
    deploymentName: string;
    apiVersion?: string;
    maxRetries?: number;
    timeout?: number;
}

interface RetryConfig {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    backoffFactor: number;
}

export class HighPerformanceAIService {
    private client: OpenAI;
    private cache: NodeCache;
    private config: AIServiceConfig;
    private retryConfig: RetryConfig;
    private requestQueue: Map<string, Promise<any>> = new Map();
    private rateLimiter: {
        requests: number;
        resetTime: number;
        maxRequests: number;
        windowMs: number;
    };

    constructor() {
        // Load configuration with enhanced defaults
        this.config = {
            endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
            apiKey: process.env.AZURE_OPENAI_KEY || '',
            deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
            apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
            maxRetries: parseInt(process.env.AZURE_OPENAI_MAX_RETRIES || '3'),
            timeout: parseInt(process.env.AZURE_OPENAI_TIMEOUT || '30000')
        };

        // Initialize Azure OpenAI client with optimized settings
        this.client = new OpenAI({
            apiKey: this.config.apiKey,
            baseURL: `${this.config.endpoint}/openai/deployments/${this.config.deploymentName}`,
            defaultQuery: { 'api-version': this.config.apiVersion },
            defaultHeaders: {
                'api-key': this.config.apiKey,
            },
            timeout: this.config.timeout,
            maxRetries: this.config.maxRetries
        });

        // High-performance cache with smart TTL
        this.cache = new NodeCache({
            stdTTL: 1800, // 30 minutes default
            checkperiod: 300, // Check every 5 minutes
            useClones: false, // Better performance
            maxKeys: 5000, // Prevent memory overflow
            deleteOnExpire: true
        });

        // Retry configuration with exponential backoff
        this.retryConfig = {
            maxAttempts: 3,
            baseDelay: 1000, // 1 second
            maxDelay: 30000, // 30 seconds max
            backoffFactor: 2
        };

        // Rate limiting (Azure OpenAI has limits)
        this.rateLimiter = {
            requests: 0,
            resetTime: Date.now() + 60000, // 1 minute window
            maxRequests: 100, // Conservative limit
            windowMs: 60000
        };
    }

    private generateCacheKey(method: string, params: any): string {
        const serialized = JSON.stringify(params, Object.keys(params).sort());
        return `ai:${method}:${Buffer.from(serialized).toString('base64').slice(0, 32)}`;
    }

    private async checkRateLimit(): Promise<void> {
        const now = Date.now();

        if (now > this.rateLimiter.resetTime) {
            // Reset window
            this.rateLimiter.requests = 0;
            this.rateLimiter.resetTime = now + this.rateLimiter.windowMs;
        }

        if (this.rateLimiter.requests >= this.rateLimiter.maxRequests) {
            const waitTime = this.rateLimiter.resetTime - now;
            console.warn(`Rate limit reached. Waiting ${waitTime}ms before next request.`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.rateLimiter.requests = 0;
            this.rateLimiter.resetTime = Date.now() + this.rateLimiter.windowMs;
        }

        this.rateLimiter.requests++;
    }

    private async retryOperation<T>(
        operation: () => Promise<T>,
        context: string
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error as Error;

                if (attempt === this.retryConfig.maxAttempts) {
                    console.error(`${context} failed after ${attempt} attempts:`, lastError);
                    throw lastError;
                }

                // Calculate backoff delay
                const delay = Math.min(
                    this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt - 1),
                    this.retryConfig.maxDelay
                );

                console.warn(`${context} attempt ${attempt} failed. Retrying in ${delay}ms...`, lastError.message);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }

    private async deduplicateRequest<T>(
        key: string,
        operation: () => Promise<T>
    ): Promise<T> {
        // Check if same request is already in progress
        if (this.requestQueue.has(key)) {
            return this.requestQueue.get(key) as Promise<T>;
        }

        // Start new request
        const promise = operation().finally(() => {
            this.requestQueue.delete(key);
        });

        this.requestQueue.set(key, promise);
        return promise;
    }

    async analyzePlan(plan: string, projectId: string): Promise<PlanAnalysis> {
        const cacheKey = this.generateCacheKey('analyzePlan', { plan, projectId });

        // Check cache first
        const cached = this.cache.get<PlanAnalysis>(cacheKey);
        if (cached) {
            console.log('Cache hit for plan analysis');
            return cached;
        }

        // Deduplicate concurrent requests
        return this.deduplicateRequest(cacheKey, async () => {
            await this.checkRateLimit();

            return this.retryOperation(async () => {
                console.log('Analyzing plan with Azure OpenAI...');

                const completion = await this.client.chat.completions.create({
                    model: this.config.deploymentName,
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert AI project manager. Analyze the project plan and provide structured analysis.

Return a JSON object with this exact structure:
{
  "tasks": [
    {
      "complexity": 0-100,
      "estimatedHours": number,
      "suggestedCategory": "development|testing|documentation|research|planning|deployment|maintenance|review",
      "suggestedPriority": "low|medium|high|critical",
      "requiredCapabilities": ["programming", "javascript", "typescript", "react", "node_js", "python", "testing", "deployment", "analysis", "design", "research", "security", "ui_ux", "devops", "databases", "machine_learning", "documentation", "code_review", "project_management"],
      "potentialRisks": ["risk1", "risk2"],
      "dependencies": ["dependency1", "dependency2"],
      "confidence": 0-100
    }
  ],
  "suggestedTasks": [
    {
      "title": "Task Title",
      "description": "Detailed description",
      "priority": "low|medium|high|critical",
      "category": "development|testing|documentation|research|planning|deployment|maintenance|review",
      "estimatedHours": number,
      "tags": ["tag1", "tag2"],
      "confidence": 0-100
    }
  ],
  "projectComplexity": 0-100,
  "estimatedDuration": number,
  "suggestedAgents": ["senior_developer", "qa_engineer", "devops_engineer", "ux_designer", "security_engineer", "project_manager", "data_scientist"],
  "riskAssessment": ["risk1", "risk2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`
                        },
                        {
                            role: 'user',
                            content: `Analyze this project plan and break it down into tasks:\n\n${plan}`
                        }
                    ],
                    temperature: 0.3, // Lower temperature for more consistent results
                    max_tokens: 4000,
                    response_format: { type: "json_object" }
                });

                const content = completion.choices[0]?.message?.content;
                if (!content) {
                    throw new Error('No response content from Azure OpenAI');
                }

                try {
                    const analysis = JSON.parse(content) as PlanAnalysis;

                    // Validate and set defaults
                    const validatedAnalysis: PlanAnalysis = {
                        tasks: analysis.tasks || [],
                        suggestedTasks: analysis.suggestedTasks || [],
                        projectComplexity: Math.max(0, Math.min(100, analysis.projectComplexity || 50)),
                        estimatedDuration: Math.max(1, analysis.estimatedDuration || 1),
                        suggestedAgents: analysis.suggestedAgents || [],
                        riskAssessment: analysis.riskAssessment || ['Analyze project requirements thoroughly'],
                        recommendations: analysis.recommendations || ['Break down complex tasks', 'Establish clear dependencies']
                    };

                    // Cache result with smart TTL based on complexity
                    const cacheTTL = validatedAnalysis.projectComplexity > 80 ? 900 : 1800; // 15min for complex, 30min for simple
                    this.cache.set(cacheKey, validatedAnalysis, cacheTTL);

                    console.log(`Plan analysis completed. Complexity: ${validatedAnalysis.projectComplexity}, Tasks: ${validatedAnalysis.tasks.length}`);
                    return validatedAnalysis;
                } catch (parseError) {
                    console.error('Failed to parse AI response:', parseError);
                    console.error('Raw response:', content);

                    // Return fallback analysis
                    return {
                        tasks: [],
                        suggestedTasks: [],
                        projectComplexity: 50,
                        estimatedDuration: 4,
                        suggestedAgents: [AgentType.SENIOR_DEVELOPER],
                        riskAssessment: ['Unable to parse AI analysis - manual review required'],
                        recommendations: ['Review project requirements manually', 'Break down into smaller components']
                    };
                }
            }, 'Plan Analysis');
        });
    }

    async suggestTaskAssignment(
        taskDescription: string,
        availableAgents: Array<{ id: string, name: string, type: AgentType, capabilities: AgentCapability[] }>
    ): Promise<AgentSuggestion[]> {
        const cacheKey = this.generateCacheKey('suggestTaskAssignment', {
            taskDescription,
            agentIds: availableAgents.map(a => a.id).sort()
        });

        const cached = this.cache.get<AgentSuggestion[]>(cacheKey);
        if (cached) {
            console.log('Cache hit for task assignment suggestion');
            return cached;
        }

        return this.deduplicateRequest(cacheKey, async () => {
            await this.checkRateLimit();

            return this.retryOperation(async () => {
                const completion = await this.client.chat.completions.create({
                    model: this.config.deploymentName,
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert AI project coordinator. Analyze the task and suggest the best agent assignment.

Return a JSON array of agent suggestions:
[
  {
    "agentId": "agent-id",
    "agentName": "Agent Name",
    "confidence": 0-100,
    "reasoning": "Why this agent is suitable for this task"
  }
]

Consider agent capabilities, workload, and task requirements. Rank by suitability.`
                        },
                        {
                            role: 'user',
                            content: `Task: ${taskDescription}

Available Agents:
${availableAgents.map(agent => `
- ${agent.name} (${agent.type})
  ID: ${agent.id}
  Capabilities: ${agent.capabilities.join(', ')}
`).join('')}

Suggest the best agent(s) for this task.`
                        }
                    ],
                    temperature: 0.2,
                    max_tokens: 2000,
                    response_format: { type: "json_object" }
                });

                const content = completion.choices[0]?.message?.content;
                if (!content) {
                    throw new Error('No response content from Azure OpenAI');
                }

                try {
                    const parsed = JSON.parse(content);
                    const suggestions = parsed.suggestions || parsed || [];

                    const validatedSuggestions: AgentSuggestion[] = suggestions
                        .filter((s: any) => s.agentId && availableAgents.some(a => a.id === s.agentId))
                        .map((s: any) => ({
                            agentId: s.agentId,
                            agentName: s.agentName || availableAgents.find(a => a.id === s.agentId)?.name || 'Unknown',
                            confidence: Math.max(0, Math.min(100, s.confidence || 50)),
                            reasoning: s.reasoning || 'AI recommendation based on capabilities'
                        }))
                        .sort((a: AgentSuggestion, b: AgentSuggestion) => b.confidence - a.confidence);

                    // Cache with shorter TTL since agents change frequently
                    this.cache.set(cacheKey, validatedSuggestions, 600); // 10 minutes

                    return validatedSuggestions;
                } catch (parseError) {
                    console.error('Failed to parse task assignment response:', parseError);

                    // Fallback: return first available agent
                    if (availableAgents.length > 0) {
                        return [{
                            agentId: availableAgents[0].id,
                            agentName: availableAgents[0].name,
                            confidence: 50,
                            reasoning: 'Fallback assignment - AI parsing failed'
                        }];
                    }

                    return [];
                }
            }, 'Task Assignment Suggestion');
        });
    }

    async generateTaskRecommendations(projectContext: string, currentTasks: string[]): Promise<string[]> {
        const cacheKey = this.generateCacheKey('generateTaskRecommendations', { projectContext, currentTasks });

        const cached = this.cache.get<string[]>(cacheKey);
        if (cached) {
            console.log('Cache hit for task recommendations');
            return cached;
        }

        return this.deduplicateRequest(cacheKey, async () => {
            await this.checkRateLimit();

            return this.retryOperation(async () => {
                const completion = await this.client.chat.completions.create({
                    model: this.config.deploymentName,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert project manager. Based on the project context and current tasks, suggest 3-5 additional tasks that would be valuable. Return a JSON array of task titles.'
                        },
                        {
                            role: 'user',
                            content: `Project: ${projectContext}

Current Tasks:
${currentTasks.map(task => `- ${task}`).join('\n')}

Suggest additional tasks that would improve this project:`
                        }
                    ],
                    temperature: 0.4,
                    max_tokens: 1000,
                    response_format: { type: "json_object" }
                });

                const content = completion.choices[0]?.message?.content;
                if (!content) {
                    throw new Error('No response content from Azure OpenAI');
                }

                try {
                    const parsed = JSON.parse(content);
                    const recommendations = parsed.recommendations || parsed.tasks || [];

                    const validatedRecommendations = Array.isArray(recommendations)
                        ? recommendations.filter(r => typeof r === 'string' && r.trim().length > 0)
                        : [];

                    // Cache for 20 minutes
                    this.cache.set(cacheKey, validatedRecommendations, 1200);

                    return validatedRecommendations;
                } catch (parseError) {
                    console.error('Failed to parse task recommendations:', parseError);
                    return [
                        'Review and refine requirements',
                        'Add comprehensive testing',
                        'Create deployment documentation',
                        'Plan post-launch monitoring'
                    ];
                }
            }, 'Task Recommendations');
        });
    }

    // Performance monitoring methods
    getCacheStats() {
        return {
            keys: this.cache.keys().length,
            hits: this.cache.getStats().hits,
            misses: this.cache.getStats().misses,
            hitRate: this.cache.getStats().hits / (this.cache.getStats().hits + this.cache.getStats().misses) || 0,
            queueSize: this.requestQueue.size,
            rateLimitInfo: {
                requests: this.rateLimiter.requests,
                maxRequests: this.rateLimiter.maxRequests,
                resetTime: new Date(this.rateLimiter.resetTime).toISOString()
            }
        };
    }

    // Health check
    async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy', details: any }> {
        try {
            const startTime = Date.now();

            // Simple test request
            await this.client.chat.completions.create({
                model: this.config.deploymentName,
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 5
            });

            const responseTime = Date.now() - startTime;

            return {
                status: responseTime < 5000 ? 'healthy' : 'degraded',
                details: {
                    responseTime,
                    cacheStats: this.getCacheStats(),
                    connectionStatus: 'connected',
                    lastCheck: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    error: (error as Error).message,
                    lastCheck: new Date().toISOString()
                }
            };
        }
    }

    // Cleanup method
    async shutdown(): Promise<void> {
        this.cache.flushAll();
        this.requestQueue.clear();
        console.log('AI Service shut down gracefully');
    }
}
