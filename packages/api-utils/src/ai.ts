import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * AI request/response interfaces
 */
export interface AIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp?: string;
    metadata?: Record<string, any>;
}

export interface ChatRequest {
    messages: AIMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    context?: Record<string, any>;
}

export interface ChatResponse {
    message: AIMessage;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    model: string;
    finishReason?: 'stop' | 'length' | 'content_filter';
    metadata?: Record<string, any>;
}

export interface StreamingChatResponse {
    id: string;
    object: 'chat.completion.chunk';
    created: number;
    model: string;
    choices: Array<{
        index: number;
        delta: {
            role?: string;
            content?: string;
        };
        finishReason?: string;
    }>;
}

/**
 * AI configuration
 */
export interface AIConfig {
    provider: 'openai' | 'anthropic' | 'azure' | 'custom';
    apiKey?: string;
    baseUrl?: string;
    defaultModel?: string;
    defaultTemperature?: number;
    defaultMaxTokens?: number;
    rateLimits?: {
        requestsPerMinute: number;
        tokensPerMinute: number;
    };
}

/**
 * Validation schemas
 */
export const chatRequestSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string().min(1, 'Message content is required'),
        timestamp: z.string().optional(),
        metadata: z.record(z.any()).optional()
    })).min(1, 'At least one message is required'),
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(4096).optional(),
    stream: z.boolean().default(false),
    context: z.record(z.any()).optional()
});

/**
 * AI provider interface for dependency injection
 */
export interface AIProvider {
    chat(request: ChatRequest): Promise<ChatResponse>;
    streamChat(request: ChatRequest): AsyncIterable<StreamingChatResponse>;
    getModels(): Promise<string[]>;
    getUsage(userId?: string): Promise<{
        requestsToday: number;
        tokensToday: number;
        remaining: number;
    }>;
}

/**
 * Create POST /api/ai/chat endpoint
 */
export function createAIChatEndpoint(aiProvider: AIProvider, config?: {
    requireAuth?: boolean;
    rateLimitByUser?: boolean;
    allowedModels?: string[];
}) {
    return async function POST(request: NextRequest): Promise<NextResponse> {
        try {
            // Check authentication if required
            if (config?.requireAuth !== false) {
                const userId = request.headers.get('x-user-id');
                if (!userId) {
                    return NextResponse.json(
                        { error: 'Authentication required' },
                        { status: 401 }
                    );
                }
            }

            const body = await request.json();

            // Validate request
            const validationResult = chatRequestSchema.safeParse(body);
            if (!validationResult.success) {
                return NextResponse.json(
                    {
                        error: 'Validation failed',
                        details: validationResult.error.issues
                    },
                    { status: 400 }
                );
            }

            const chatRequest = validationResult.data;

            // Check model restrictions
            if (config?.allowedModels && chatRequest.model) {
                if (!config.allowedModels.includes(chatRequest.model)) {
                    return NextResponse.json(
                        { error: 'Model not allowed' },
                        { status: 400 }
                    );
                }
            }

            // Check rate limits
            if (config?.rateLimitByUser) {
                const userId = request.headers.get('x-user-id');
                if (userId) {
                    const usage = await aiProvider.getUsage(userId);
                    if (usage.remaining <= 0) {
                        return NextResponse.json(
                            { error: 'Rate limit exceeded' },
                            { status: 429 }
                        );
                    }
                }
            }

            // Handle streaming
            if (chatRequest.stream) {
                const stream = new ReadableStream({
                    async start(controller) {
                        try {
                            for await (const chunk of aiProvider.streamChat(chatRequest)) {
                                const data = `data: ${JSON.stringify(chunk)}\n\n`;
                                controller.enqueue(new TextEncoder().encode(data));
                            }
                            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                        } catch (error) {
                            console.error('AI streaming error:', error);
                            controller.error(error);
                        } finally {
                            controller.close();
                        }
                    }
                });

                return new NextResponse(stream, {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
                    }
                });
            }

            // Handle regular chat
            const response = await aiProvider.chat(chatRequest);
            return NextResponse.json(response);

        } catch (error) {
            console.error('AI chat error:', error);

            if (error instanceof Error) {
                // Handle specific AI provider errors
                if (error.message.includes('rate limit')) {
                    return NextResponse.json(
                        { error: 'Rate limit exceeded' },
                        { status: 429 }
                    );
                }
                if (error.message.includes('quota')) {
                    return NextResponse.json(
                        { error: 'API quota exceeded' },
                        { status: 429 }
                    );
                }
                if (error.message.includes('content filter')) {
                    return NextResponse.json(
                        { error: 'Content filtered by AI provider' },
                        { status: 400 }
                    );
                }
            }

            return NextResponse.json(
                { error: 'AI service unavailable' },
                { status: 503 }
            );
        }
    };
}

/**
 * Create GET /api/ai/models endpoint
 */
export function createAIModelsEndpoint(aiProvider: AIProvider) {
    return async function GET(request: NextRequest): Promise<NextResponse> {
        try {
            const models = await aiProvider.getModels();
            return NextResponse.json({ models });
        } catch (error) {
            console.error('Get AI models error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch models' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create GET /api/ai/usage endpoint
 */
export function createAIUsageEndpoint(aiProvider: AIProvider) {
    return async function GET(request: NextRequest): Promise<NextResponse> {
        try {
            const userId = request.headers.get('x-user-id');
            const usage = await aiProvider.getUsage(userId || undefined);
            return NextResponse.json({ usage });
        } catch (error) {
            console.error('Get AI usage error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch usage' },
                { status: 500 }
            );
        }
    };
}

/**
 * AI utilities
 */
export const aiUtils = {
    /**
     * Sanitize AI messages for logging
     */
    sanitizeMessages(messages: AIMessage[]): AIMessage[] {
        return messages.map(msg => ({
            ...msg,
            content: msg.content.length > 500
                ? msg.content.substring(0, 500) + '...'
                : msg.content
        }));
    },

    /**
     * Count tokens in text (rough estimation)
     */
    estimateTokens(text: string): number {
        // Rough estimation: 1 token ≈ 4 characters for English
        return Math.ceil(text.length / 4);
    },

    /**
     * Prepare system message
     */
    createSystemMessage(content: string, metadata?: Record<string, any>): AIMessage {
        return {
            role: 'system',
            content,
            timestamp: new Date().toISOString(),
            metadata
        };
    },

    /**
     * Prepare user message
     */
    createUserMessage(content: string, metadata?: Record<string, any>): AIMessage {
        return {
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
            metadata
        };
    },

    /**
     * Validate message length
     */
    validateMessageLength(content: string, maxLength = 10000): boolean {
        return content.length <= maxLength;
    },

    /**
     * Create conversation context
     */
    createContext(userId?: string, sessionId?: string, metadata?: Record<string, any>): Record<string, any> {
        return {
            userId,
            sessionId,
            timestamp: new Date().toISOString(),
            ...metadata
        };
    }
};