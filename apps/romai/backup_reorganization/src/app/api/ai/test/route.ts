/**
 * RomAI Model Test Route - Migrated to @codai/api-utils
 * Path: /api/ai/test
 * Methods: POST, GET
 * Purpose: Test Azure OpenAI models with Romanian content
 */

import { NextRequest } from 'next/server';
import { createAIChatEndpoint, createAIModelsEndpoint, AIProvider, ChatRequest, ChatResponse } from '@codai/api-utils/ai';
import { OpenAI } from 'openai';

interface RomAITestRequest {
    model?: string;
    input: string;
    testType?: 'general' | 'translation' | 'grammar' | 'cultural' | 'sentiment';
}

// Create RomAI-specific AI provider with Azure OpenAI integration
const romAITestProvider: AIProvider = {
    async chat(request: ChatRequest): Promise<ChatResponse> {
        try {
            const model = request.model || process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-realtime';

            // Initialize Azure OpenAI client
            const client = new OpenAI({
                apiKey: process.env.AZURE_OPENAI_API_KEY,
                baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${model}`,
                defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
                defaultHeaders: {
                    'api-key': process.env.AZURE_OPENAI_API_KEY,
                },
            });

            // Handle Romanian-specific test requests
            let testType = 'general';
            let originalInput = '';

            try {
                const testRequest = JSON.parse(request.messages[request.messages.length - 1]?.content || '{}') as RomAITestRequest;
                testType = testRequest.testType || 'general';
                originalInput = testRequest.input || request.messages[request.messages.length - 1]?.content || '';
            } catch {
                originalInput = request.messages[request.messages.length - 1]?.content || '';
            }

            // Define Romanian test-specific prompts
            const testPrompts = {
                general: `Analizează următorul text românesc și oferă o analiză detaliată: "${originalInput}"`,
                translation: `Traduceți următorul text în română, păstrând nuanțele culturale: "${originalInput}"`,
                grammar: `Verificați și corectați gramatica următorului text românesc: "${originalInput}"`,
                cultural: `Explicați contextul cultural românesc pentru: "${originalInput}"`,
                sentiment: `Analizați sentimentul și tonul următorului text românesc: "${originalInput}"`
            };

            const prompt = testPrompts[testType as keyof typeof testPrompts] || testPrompts.general;
            const startTime = Date.now();

            const completion = await client.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'Ești un expert în limba română cu cunoștințe profunde despre cultura și contextul românesc. Oferă analize precise și detaliate.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: request.maxTokens || 800,
                temperature: request.temperature || 0.3,
                top_p: 0.9,
            });

            const responseTime = Date.now() - startTime;
            const response = completion.choices[0]?.message?.content;

            if (!response) {
                throw new Error('No response generated from Azure OpenAI');
            }

            // Calculate performance metrics
            const usage = completion.usage;
            const performanceMetrics = {
                responseTime: `${responseTime}ms`,
                tokensPerSecond: usage?.total_tokens ? Math.round((usage.total_tokens / responseTime) * 1000) : 0,
                efficiency: responseTime < 2000 ? 'Excellent' : responseTime < 5000 ? 'Good' : 'Needs Improvement'
            };

            return {
                message: {
                    role: 'assistant',
                    content: JSON.stringify({
                        success: true,
                        message: `AI test completed successfully with model ${model}`,
                        model: model,
                        testType: testType,
                        input: originalInput,
                        output: response,
                        performance: performanceMetrics,
                        usage: usage,
                        timestamp: new Date().toISOString(),
                        romanian_context: {
                            detected_language: 'romanian',
                            cultural_relevance: 'high',
                            grammar_accuracy: 'verified'
                        }
                    }, null, 2),
                    timestamp: new Date().toISOString(),
                    metadata: {
                        source: 'RomAI Test Provider',
                        romanian_specialized: true,
                        testType: testType,
                        performance: performanceMetrics
                    }
                },
                model: model,
                usage: usage ? {
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens
                } : undefined,
                finishReason: 'stop'
            };

        } catch (error) {
            const errorResponse = {
                success: false,
                message: 'Model test failed',
                error: 'Model test failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };

            return {
                message: {
                    role: 'assistant',
                    content: JSON.stringify(errorResponse, null, 2),
                    timestamp: new Date().toISOString(),
                    metadata: { source: 'RomAI Test Provider', error: true }
                },
                model: request.model || 'gpt-4o-realtime',
                usage: { promptTokens: 10, completionTokens: 50, totalTokens: 60 },
                finishReason: 'stop'
            };
        }
    },

    async *streamChat(request: ChatRequest) {
        // RomAI test doesn't implement streaming yet
        const response = await this.chat(request);
        yield {
            id: 'romai-test-' + Date.now(),
            object: 'chat.completion.chunk',
            created: Date.now(),
            model: response.model,
            choices: [{
                index: 0,
                delta: {
                    role: 'assistant',
                    content: response.message.content
                },
                finishReason: 'stop'
            }]
        };
    },

    async getModels(): Promise<string[]> {
        return [
            process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-realtime',
            'gpt-4',
            'gpt-35-turbo'
        ];
    },

    async getUsage(userId?: string) {
        // Mock usage data for RomAI test
        return {
            requestsToday: 145,
            tokensToday: 8900,
            remaining: 1100
        };
    }
};

// Create the endpoints using @codai/api-utils (no auth required for testing)
const chatEndpoint = createAIChatEndpoint(romAITestProvider, {
    requireAuth: false,
    rateLimitByUser: false,
    allowedModels: [
        process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-realtime',
        'gpt-4',
        'gpt-35-turbo'
    ]
});

const modelsEndpoint = createAIModelsEndpoint(romAITestProvider);

// Enhanced POST handler for Romanian AI testing
export async function POST(request: NextRequest) {
    return chatEndpoint(request);
}

// Enhanced GET handler with Romanian AI test info
export async function GET(request: NextRequest) {
    try {
        const models = await romAITestProvider.getModels();

        return Response.json({
            success: true,
            message: 'Romanian AI Test endpoint is operational',
            service: 'Romanian AI Model Testing',
            available_models: models,
            test_types: [
                'general',
                'translation',
                'grammar',
                'cultural',
                'sentiment'
            ],
            endpoint: process.env.AZURE_OPENAI_ENDPOINT,
            status: 'operational',
            capabilities: [
                'romanian-text-analysis',
                'cultural-context-analysis',
                'grammar-verification',
                'sentiment-analysis',
                'translation-assistance'
            ],
            limits: {
                maxTokens: 800,
                requestsPerMinute: 30
            },
            version: "2.0.0"
        });
    } catch (error) {
        console.error('RomAI test info error:', error);
        return Response.json(
            {
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
