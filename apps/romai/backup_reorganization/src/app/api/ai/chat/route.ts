/**
 * RomAI AGI Chat API Route - Migrated to @codai/api-utils
 * Path: /api/ai/chat
 * Methods: POST, GET
 * Purpose: Native Romanian AGI intelligence chat integration
 */

import { NextRequest } from 'next/server';
import { createAIChatEndpoint, createAIModelsEndpoint, AIProvider, ChatRequest, ChatResponse } from '@codai/api-utils/ai';

// Native RomAI AGI server configuration
const ROMAI_AGI_BASE_URL = process.env.ROMAI_AGI_URL || 'http://localhost:6101';
const ROMAI_AGI_CHAT_ENDPOINT = `${ROMAI_AGI_BASE_URL}/api/v1/romanian-intelligence/chat`;

// Create RomAI-specific AI provider with native AGI integration
const romAIAGIProvider: AIProvider = {
    async chat(request: ChatRequest): Promise<ChatResponse> {
        try {
            const lastMessage = request.messages[request.messages.length - 1];
            const message = lastMessage?.content;
            const context = 'romanian'; // Default Romanian context

            if (!message || typeof message !== 'string') {
                throw new Error('Message is required and must be a string');
            }

            console.log('🧠 Processing with native RomAI AGI:', message.substring(0, 50));

            // Call the native RomAI AGI server
            const agiResponse = await fetch(ROMAI_AGI_CHAT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: context
                }),
            });

            if (!agiResponse.ok) {
                throw new Error(`RomAI AGI server error: ${agiResponse.status} ${agiResponse.statusText}`);
            }

            const agiData = await agiResponse.json();

            if (!agiData.success || !agiData.response) {
                throw new Error('Invalid response from RomAI AGI server');
            }

            // Log usage for analytics
            console.log('Native RomAI AGI Usage:', {
                system: 'RomAI Native AGI',
                cultural_relevance: agiData.cultural_analysis?.relevance,
                processing_method: 'native_romanian_intelligence',
                timestamp: new Date().toISOString()
            });

            return {
                message: {
                    role: 'assistant',
                    content: agiData.response,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        source: 'RomAI Native AGI',
                        system: 'RomAI Native AGI',
                        version: agiData.agi_metadata?.version || '7.0.0',
                        cultural_analysis: agiData.cultural_analysis,
                        agi_metadata: agiData.agi_metadata,
                        processing_method: 'native_romanian_intelligence'
                    }
                },
                model: 'romai-agi-v7',
                usage: {
                    promptTokens: message.length,
                    completionTokens: agiData.response?.length || 0,
                    totalTokens: message.length + (agiData.response?.length || 0)
                },
                finishReason: 'stop'
            };

        } catch (error) {
            console.error('RomAI AGI Chat Error:', error);

            let errorMessage = 'Failed to generate Romanian AGI response. Please try again.';
            let errorCode = 'NATIVE_AGI_ERROR';

            // Handle specific RomAI AGI errors
            if (error instanceof Error) {
                if (error.message.includes('ECONNREFUSED')) {
                    errorMessage = 'RomAI AGI server is not available. Please ensure the AGI server is running on port 6101.';
                    errorCode = 'AGI_SERVER_UNAVAILABLE';
                } else if (error.message.includes('timeout')) {
                    errorMessage = 'RomAI AGI processing timeout. Please try again.';
                    errorCode = 'AGI_PROCESSING_TIMEOUT';
                }
            }

            // Return error as chat response
            return {
                message: {
                    role: 'assistant',
                    content: JSON.stringify({
                        error: errorMessage,
                        code: errorCode,
                        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
                        timestamp: new Date().toISOString()
                    }, null, 2),
                    timestamp: new Date().toISOString(),
                    metadata: { source: 'RomAI Native AGI', error: true, errorCode }
                },
                model: 'romai-agi-v7',
                usage: { promptTokens: 10, completionTokens: 50, totalTokens: 60 },
                finishReason: 'stop'
            };
        }
    },

    async *streamChat(request: ChatRequest) {
        // RomAI AGI doesn't implement streaming yet
        const response = await this.chat(request);
        yield {
            id: 'romai-agi-' + Date.now(),
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
            'romai-agi-v7',
            'romanian-cultural-intelligence',
            'native-romanian-agi'
        ];
    },

    async getUsage(userId?: string) {
        // Mock usage data for RomAI AGI
        return {
            requestsToday: 89,
            tokensToday: 12400,
            remaining: 7600
        };
    }
};

// Create the endpoints using @codai/api-utils (no auth required for AGI)
const chatEndpoint = createAIChatEndpoint(romAIAGIProvider, {
    requireAuth: false,
    rateLimitByUser: false,
    allowedModels: ['romai-agi-v7', 'romanian-cultural-intelligence', 'native-romanian-agi']
});

const modelsEndpoint = createAIModelsEndpoint(romAIAGIProvider);

// Enhanced POST handler for RomAI AGI
export async function POST(request: NextRequest) {
    return chatEndpoint(request);
}

// Enhanced GET handler with AGI server status
export async function GET(request: NextRequest) {
    try {
        // Check RomAI AGI server status
        const statusResponse = await fetch(`${ROMAI_AGI_BASE_URL}/api/v1/status`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!statusResponse.ok) {
            throw new Error('RomAI AGI server unavailable');
        }

        const statusData = await statusResponse.json();
        const models = await romAIAGIProvider.getModels();

        return Response.json({
            models,
            service: 'Native Romanian AGI Intelligence',
            status: 'operational',
            agi_server: {
                version: statusData.version || '7.0.0',
                phase: statusData.phase || 'Production',
                capabilities: statusData.systems || {},
                readiness: statusData.readiness || 'AGI Ready'
            },
            intelligence_features: [
                'Native Romanian Cultural Intelligence',
                'Advanced Romanian Language Processing',
                'Cultural Context Analysis',
                'Historical and Contemporary Knowledge',
                'Regional Dialect Understanding',
                'Authentic Romanian Content Generation'
            ],
            advantages: [
                'No external API dependencies',
                'Culturally aware responses',
                'Romanian-first intelligence',
                'Real-time AGI processing',
                'Privacy-focused local processing'
            ],
            server_url: ROMAI_AGI_BASE_URL,
            endpoint: ROMAI_AGI_CHAT_ENDPOINT,
            capabilities: [
                "romanian-cultural-intelligence",
                "advanced-romanian-nlp",
                "cultural-context-analysis",
                "historical-knowledge",
                "dialect-understanding",
                "authentic-content-generation"
            ],
            limits: {
                maxTokens: 2000,
                requestsPerMinute: 20
            },
            version: "2.0.0"
        });
    } catch (error) {
        console.error('RomAI AGI status error:', error);
        return Response.json({
            error: 'Failed to get RomAI AGI service information',
            status: 'unavailable',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
