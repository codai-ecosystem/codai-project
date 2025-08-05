import { NextRequest, NextResponse } from 'next/server';

/**
 * 🧠 RomAI Meta-Learning API Status Endpoint
 * Provides status information for meta-learning and few-shot learning capabilities
 */

interface MetaLearningStatus {
    status: string;
    engines_available: boolean;
    meta_learning: {
        active: boolean;
        supported_tasks: number;
        total_tasks_completed: number;
        model_parameters: number;
    };
    few_shot_learning: {
        active: boolean;
        supported_task_types: number;
        total_adaptations: number;
        success_rate: number;
    };
    romanian_specialization: boolean;
    cultural_intelligence: boolean;
    timestamp: string;
}

export async function GET(request: NextRequest) {
    try {
        // Simulate meta-learning engine status (in production, this would check actual engines)
        const metaLearningStatus: MetaLearningStatus = {
            status: 'active',
            engines_available: true,
            meta_learning: {
                active: true,
                supported_tasks: 6, // dialect_adaptation, cultural_context, formal_informal, historical_context, business_context, literary_analysis
                total_tasks_completed: 0,
                model_parameters: 771968 // From our actual meta-learning model
            },
            few_shot_learning: {
                active: true,
                supported_task_types: 4, // translation, cultural_adaptation, dialect_conversion, sentiment_analysis
                total_adaptations: 0,
                success_rate: 0.0
            },
            romanian_specialization: true,
            cultural_intelligence: true,
            timestamp: new Date().toISOString()
        };

        return NextResponse.json(metaLearningStatus);

    } catch (error) {
        console.error('Meta-learning status error:', error);

        return NextResponse.json(
            {
                status: 'error',
                engines_available: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
