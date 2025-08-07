/**
 * Native RomAI AGI Chat API Route
 * Path: /api/ai/chat
 * Methods: POST
 * Purpose: Native Romanian AGI intelligence chat integration
 */

import { NextRequest, NextResponse } from 'next/server';

// Native RomAI AGI server configuration
const ROMAI_AGI_BASE_URL = process.env.ROMAI_AGI_URL || 'http://localhost:6101';
const ROMAI_AGI_CHAT_ENDPOINT = `${ROMAI_AGI_BASE_URL}/api/v1/romanian-intelligence/chat`;

export async function POST(request: NextRequest) {
    try {
        const { message, context = 'romanian' } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({
                error: 'Message is required and must be a string'
            }, { status: 400 });
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

        return NextResponse.json({
            success: true,
            response: agiData.response,
            system: 'RomAI Native AGI',
            version: agiData.agi_metadata?.version || '7.0.0',
            cultural_analysis: agiData.cultural_analysis,
            agi_metadata: agiData.agi_metadata,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('RomAI AGI Chat Error:', error);

        // Handle specific RomAI AGI errors
        if (error instanceof Error) {
            if (error.message.includes('ECONNREFUSED')) {
                return NextResponse.json({
                    error: 'RomAI AGI server is not available. Please ensure the AGI server is running on port 6101.',
                    code: 'AGI_SERVER_UNAVAILABLE'
                }, { status: 503 });
            }

            if (error.message.includes('timeout')) {
                return NextResponse.json({
                    error: 'RomAI AGI processing timeout. Please try again.',
                    code: 'AGI_PROCESSING_TIMEOUT'
                }, { status: 408 });
            }
        }

        return NextResponse.json({
            error: 'Failed to generate Romanian AGI response. Please try again.',
            code: 'NATIVE_AGI_ERROR',
            details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        }, { status: 500 });
    }
}

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

        return NextResponse.json({
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
            endpoint: ROMAI_AGI_CHAT_ENDPOINT
        });
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to get RomAI AGI service information',
            status: 'unavailable'
        }, { status: 500 });
    }
}
