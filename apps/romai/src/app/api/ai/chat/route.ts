/**
 * Azure OpenAI Chat API Route
 * Path: /api/ai/chat
 * Methods: POST
 * Purpose: Romanian AI chat integration with Azure OpenAI
 */

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize Azure OpenAI client
const client = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-chat'}`,
    defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview' },
    defaultHeaders: {
        'api-key': process.env.AZURE_OPENAI_API_KEY,
    },
});

export async function POST(request: NextRequest) {
    try {
        const { message, model = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-chat', context = 'romanian' } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({
                error: 'Message is required and must be a string'
            }, { status: 400 });
        }

        // Romanian AI system prompt
        const systemPrompt = `Ești RomAI, un asistent AI specializat pentru limba română și cultura românească. 

OBIECTIVELE TALE:
- Răspunde întotdeauna în română (cu excepția cazurilor în care ești solicitat explicit să folosești altă limbă)
- Oferă informații precise și utile despre România, cultura română, limba română
- Ajută cu traduceri, explicații gramaticale și context cultural românesc
- Menține un ton prietenos și profesional
- Adaptează răspunsurile la nivelul utilizatorului

COMPETENȚELE TALE SPECIALE:
- Analiza lingvistică română (gramatică, semantică, etimologie)
- Cunoștințe despre istoria și cultura României
- Informații despre piața și reglementările românești
- Traduceri de înaltă calitate RO ↔ EN
- Context cultural și social românesc

Răspunde natural și util la următoarea întrebare sau cerere.`;

        const completion = await client.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1,
        });

        const response = completion.choices[0]?.message?.content;

        if (!response) {
            throw new Error('No response generated from Azure OpenAI');
        }

        // Log usage for analytics
        const usage = completion.usage;
        console.log('Azure OpenAI Usage:', {
            model,
            promptTokens: usage?.prompt_tokens,
            completionTokens: usage?.completion_tokens,
            totalTokens: usage?.total_tokens,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            response: response,
            model: model,
            usage: usage,
            timestamp: new Date().toISOString(),
            responseTime: `${Date.now() - Date.now()}ms`
        });

    } catch (error) {
        console.error('Azure OpenAI Chat Error:', error);

        // Handle specific Azure OpenAI errors
        if (error instanceof Error) {
            if (error.message.includes('rate limit')) {
                return NextResponse.json({
                    error: 'Rate limit exceeded. Please try again in a moment.',
                    code: 'RATE_LIMIT_EXCEEDED'
                }, { status: 429 });
            }

            if (error.message.includes('unauthorized')) {
                return NextResponse.json({
                    error: 'Authentication failed. Please check API configuration.',
                    code: 'AUTHENTICATION_ERROR'
                }, { status: 401 });
            }
        }

        return NextResponse.json({
            error: 'Failed to generate AI response. Please try again.',
            code: 'AI_SERVICE_ERROR',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        // Return available models and status
        return NextResponse.json({
            service: 'Romanian AI Chat',
            status: 'operational',
            models: [
                {
                    id: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-chat',
                    name: 'GPT-4o Chat',
                    context: '128k tokens',
                    capabilities: ['Romanian text', 'Cultural context', 'Translation', 'Chat completions']
                },
                {
                    id: 'gpt-4o',
                    name: 'GPT-4o',
                    context: '128k tokens',
                    capabilities: ['Romanian text', 'Cultural context', 'Translation']
                },
                {
                    id: 'gpt-4o-mini',
                    name: 'GPT-4o Mini',
                    context: '128k tokens',
                    capabilities: ['Romanian text', 'Quick responses']
                },
                {
                    id: 'gpt-4-turbo',
                    name: 'GPT-4 Turbo',
                    context: '128k tokens',
                    capabilities: ['Romanian text', 'Complex analysis']
                }
            ],
            endpoint: process.env.AZURE_OPENAI_ENDPOINT,
            region: 'Sweden Central',
            version: process.env.AZURE_OPENAI_API_VERSION
        });
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to get service information'
        }, { status: 500 });
    }
}
