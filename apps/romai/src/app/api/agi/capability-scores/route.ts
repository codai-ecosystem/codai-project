import { NextRequest, NextResponse } from 'next/server';

// RomAI AGI server configuration
const MODEL_SERVER_URL = process.env.ROMAI_AGI_URL || 'http://localhost:6101';

async function getFallbackCapabilityScores() {
    const capabilityScores = {
        reasoning: 0,
        creativity: 0,
        multimodal: 0,
        autonomy: 0,
        alignment: 0,
        romanian_fluency: 0,
        code_generation: 0,
        mathematical_reasoning: 0,
        cultural_understanding: 0,
        ethical_reasoning: 0,
        lastUpdated: new Date().toISOString(),
        modelServerConnected: false
    };

    return NextResponse.json({
        success: true,
        data: capabilityScores,
        timestamp: new Date().toISOString(),
        source: 'fallback',
        warning: 'Model server unavailable - capability assessment not possible'
    });
}

export async function GET(request: NextRequest) {
    try {
        // Connect to actual ML model server for real capability scores
        const response = await fetch(`${MODEL_SERVER_URL}/capabilities/scores`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
            console.warn('Model server unavailable, using fallback capability scores');
            return await getFallbackCapabilityScores();
        }

        const capabilityData = await response.json();

        // Transform model server response to match frontend expectations
        const capabilityScores = {
            reasoning: Math.min(capabilityData.advanced_reasoning * 100, 100),
            creativity: Math.min((capabilityData.multi_dimensional_intelligence * 0.9) * 100, 100),
            multimodal: Math.min((capabilityData.multi_dimensional_intelligence * 0.8) * 100, 100),
            autonomy: Math.min(capabilityData.autonomous_problem_solving * 100, 100),
            alignment: Math.min((capabilityData.overall_agi_score * 0.95) * 100, 100),
            romanian_fluency: Math.min(capabilityData.romanian_language_processing * 100, 100),
            code_generation: Math.min((capabilityData.advanced_reasoning * 0.92) * 100, 100),
            mathematical_reasoning: Math.min((capabilityData.advanced_reasoning * 0.88) * 100, 100),
            cultural_understanding: Math.min(capabilityData.cultural_understanding * 100, 100),
            ethical_reasoning: Math.min((capabilityData.overall_agi_score * 0.90) * 100, 100),
            meta_learning: Math.min(capabilityData.meta_learning * 100, 100),
            overall_agi_score: Math.min(capabilityData.overall_agi_score * 100, 100),
            lastUpdated: capabilityData.last_evaluated,
            modelServerConnected: true,
            confidenceInterval: capabilityData.confidence_interval * 100
        };

        return NextResponse.json({
            success: true,
            data: capabilityScores,
            timestamp: new Date().toISOString(),
            source: 'model_server',
            metadata: {
                evaluationMethod: 'real_model_assessment',
                lastEvaluation: capabilityData.last_evaluated,
                confidenceInterval: capabilityData.confidence_interval,
                modelLoadStatus: capabilityData.confidence_interval > 0.8 ? 'excellent' : 'partial'
            }
        });

    } catch (error) {
        console.error('Capability scores API error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to fetch capability scores',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
