import { NextRequest, NextResponse } from 'next/server';

// Model server configuration
const MODEL_SERVER_URL = process.env.MODEL_SERVER_URL || 'http://localhost:8000';

interface InferenceRequest {
    text: string;
    task_type?: string;
    language?: string;
    include_cultural_context?: boolean;
    max_tokens?: number;
    temperature?: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: InferenceRequest = await request.json();

        // Validate request
        if (!body.text) {
            return NextResponse.json({
                success: false,
                error: 'Text input is required'
            }, { status: 400 });
        }

        // Prepare request for model server
        const inferenceRequest = {
            text: body.text,
            task_type: body.task_type || 'general',
            language: body.language || 'ro',
            include_cultural_context: body.include_cultural_context !== false,
            max_tokens: body.max_tokens || 512,
            temperature: body.temperature || 0.7
        };

        // Connect to model server
        const response = await fetch(`${MODEL_SERVER_URL}/inference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inferenceRequest),
            signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!response.ok) {
            // Fallback response if model server unavailable
            return NextResponse.json({
                success: true,
                data: {
                    response: `Răspuns AGI (fallback): ${body.text}`,
                    confidence: 0.5,
                    processing_time_ms: 100,
                    model_used: 'fallback',
                    cultural_context: null,
                    reasoning_steps: null,
                    model_server_connected: false
                },
                timestamp: new Date().toISOString(),
                source: 'fallback',
                warning: 'Model server unavailable - using fallback response'
            });
        }

        const inferenceResult = await response.json();

        return NextResponse.json({
            success: true,
            data: {
                response: inferenceResult.response,
                confidence: inferenceResult.confidence,
                processing_time_ms: inferenceResult.processing_time_ms,
                model_used: inferenceResult.model_used,
                cultural_context: inferenceResult.cultural_context,
                reasoning_steps: inferenceResult.reasoning_steps,
                model_server_connected: true
            },
            timestamp: new Date().toISOString(),
            source: 'model_server'
        });

    } catch (error) {
        console.error('AGI inference API error:', error);

        return NextResponse.json({
            success: false,
            error: 'AGI inference failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    // Support GET requests with query parameters
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');

    if (!text) {
        return NextResponse.json({
            success: false,
            error: 'Text parameter is required',
            usage: 'GET /api/agi/inference?text=your_text&task_type=romanian&language=ro'
        }, { status: 400 });
    }

    // Convert GET to POST request
    const inferenceRequest = {
        text,
        task_type: searchParams.get('task_type') || 'general',
        language: searchParams.get('language') || 'ro',
        include_cultural_context: searchParams.get('include_cultural_context') !== 'false',
        max_tokens: parseInt(searchParams.get('max_tokens') || '512'),
        temperature: parseFloat(searchParams.get('temperature') || '0.7')
    };

    // Reuse POST logic
    const mockRequest = {
        json: async () => inferenceRequest
    } as NextRequest;

    return POST(mockRequest);
}
