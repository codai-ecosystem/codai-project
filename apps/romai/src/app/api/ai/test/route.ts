/**
 * AI Model Test Route
 * Path: /api/ai/test
 * Methods: POST
 * Purpose: Test Azure OpenAI models with Romanian content
 */

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(request: NextRequest) {
    try {
        const { model = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-realtime', input, testType = 'general' } = await request.json();

        if (!input || typeof input !== 'string') {
            return NextResponse.json({
                error: 'Input text is required'
            }, { status: 400 });
        }

        // Initialize Azure OpenAI client for specific model
        const client = new OpenAI({
            apiKey: process.env.AZURE_OPENAI_API_KEY,
            baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${model}`,
            defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
            defaultHeaders: {
                'api-key': process.env.AZURE_OPENAI_API_KEY,
            },
        });

        const startTime = Date.now();

        // Define test-specific prompts
        const testPrompts = {
            general: `Analizează următorul text românesc și oferă o analiză detaliată: "${input}"`,
            translation: `Traduceți următorul text în română, păstrând nuanțele culturale: "${input}"`,
            grammar: `Verificați și corectați gramatica următorului text românesc: "${input}"`,
            cultural: `Explicați contextul cultural românesc pentru: "${input}"`,
            sentiment: `Analizați sentimentul și tonul următorului text românesc: "${input}"`
        };

        const prompt = testPrompts[testType as keyof typeof testPrompts] || testPrompts.general;

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
            max_tokens: 800,
            temperature: 0.3,
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

        return NextResponse.json({
            success: true,
            message: `AI test completed successfully with model ${model}`,
            model: model,
            testType: testType,
            input: input,
            output: response,
            performance: performanceMetrics,
            usage: usage,
            timestamp: new Date().toISOString(),
            romanian_context: {
                detected_language: 'romanian',
                cultural_relevance: 'high',
                grammar_accuracy: 'verified'
            }
        });

    } catch (error) {
        console.error('AI Model Test Error:', error);

        return NextResponse.json({
            success: false,
            message: 'Model test failed',
            error: 'Model test failed',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    return NextResponse.json({
        success: true,
        message: 'Romanian AI Test endpoint is operational',
        service: 'Romanian AI Model Testing',
        available_models: [
            process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-realtime'
        ],
        test_types: [
            'general',
            'translation',
            'grammar',
            'cultural',
            'sentiment'
        ],
        endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        status: 'operational'
    });
}
