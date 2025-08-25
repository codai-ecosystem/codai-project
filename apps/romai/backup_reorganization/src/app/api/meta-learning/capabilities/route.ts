import { NextRequest, NextResponse } from 'next/server';

/**
 * 🚀 RomAI Meta-Learning Capabilities API Endpoint
 * Provides detailed information about meta-learning and few-shot learning capabilities
 */

interface MetaLearningCapabilities {
    available: boolean;
    meta_learning: {
        supported_tasks: Record<string, string>;
        performance_metrics: {
            total_tasks: number;
            successful_adaptations: number;
            average_adaptation_time: number;
            cultural_accuracy: number;
        };
        model_parameters: number;
        task_history_count: number;
        meta_learning_active: boolean;
        romanian_specialization: boolean;
        cultural_intelligence: boolean;
        few_shot_capable: boolean;
    };
    few_shot_learning: {
        romanian_capabilities: Record<string, boolean>;
        supported_task_types: string[];
        performance_metrics: {
            total_adaptations: number;
            successful_adaptations: number;
            average_examples_needed: number;
            cultural_accuracy: number;
            linguistic_accuracy: number;
        };
        prompt_templates_available: number;
        adaptation_history_count: number;
        linguistic_patterns: number;
        cultural_intelligence: boolean;
        adaptive_learning: boolean;
        meta_learning_integration: boolean;
    };
    integration_features: {
        api_endpoints: number;
        romanian_specialization: boolean;
        cultural_intelligence: boolean;
        adaptive_learning: boolean;
        real_time_processing: boolean;
        performance_tracking: boolean;
    };
    supported_romanian_tasks: Record<string, string>;
    performance_metrics: {
        meta_learning: Record<string, any>;
        few_shot_learning: Record<string, any>;
    };
    timestamp: string;
}

export async function GET(request: NextRequest) {
    try {
        // Construct comprehensive capabilities response
        const capabilities: MetaLearningCapabilities = {
            available: true,
            meta_learning: {
                supported_tasks: {
                    'dialect_adaptation': 'Adapt to regional Romanian dialects',
                    'cultural_context': 'Understand cultural references and context',
                    'formal_informal': 'Switch between formal and informal Romanian',
                    'historical_context': 'Incorporate historical Romanian knowledge',
                    'business_context': 'Adapt to Romanian business communication',
                    'literary_analysis': 'Analyze Romanian literature and poetry'
                },
                performance_metrics: {
                    total_tasks: 0,
                    successful_adaptations: 0,
                    average_adaptation_time: 0.0,
                    cultural_accuracy: 0.0
                },
                model_parameters: 771968, // From our actual implementation
                task_history_count: 0,
                meta_learning_active: true,
                romanian_specialization: true,
                cultural_intelligence: true,
                few_shot_capable: true
            },
            few_shot_learning: {
                romanian_capabilities: {
                    'dialect_adaptation': true,
                    'cultural_context_learning': true,
                    'formality_adjustment': true,
                    'regional_specialization': true,
                    'literary_analysis': true,
                    'business_communication': true,
                    'historical_context': true
                },
                supported_task_types: [
                    'translation',
                    'cultural_adaptation',
                    'dialect_conversion',
                    'sentiment_analysis'
                ],
                performance_metrics: {
                    total_adaptations: 0,
                    successful_adaptations: 0,
                    average_examples_needed: 0.0,
                    cultural_accuracy: 0.0,
                    linguistic_accuracy: 0.0
                },
                prompt_templates_available: 4, // translation, cultural_adaptation, dialect_conversion, sentiment_analysis
                adaptation_history_count: 0,
                linguistic_patterns: 5, // formal_pronouns, informal_pronouns, cultural_markers, regional_markers, polite_expressions
                cultural_intelligence: true,
                adaptive_learning: true,
                meta_learning_integration: true
            },
            integration_features: {
                api_endpoints: 5, // status, adapt, capabilities, performance, learn
                romanian_specialization: true,
                cultural_intelligence: true,
                adaptive_learning: true,
                real_time_processing: true,
                performance_tracking: true
            },
            supported_romanian_tasks: {
                'dialect_adaptation': 'Adapt between Romanian dialects',
                'cultural_context': 'Understand Romanian cultural references',
                'formal_informal': 'Convert between formal and informal Romanian',
                'business_communication': 'Adapt to Romanian business contexts',
                'literary_analysis': 'Analyze Romanian literature and poetry',
                'historical_context': 'Incorporate Romanian historical knowledge'
            },
            performance_metrics: {
                meta_learning: {
                    total_tasks: 0,
                    successful_adaptations: 0,
                    average_adaptation_time: 0.0,
                    cultural_accuracy: 0.0
                },
                few_shot_learning: {
                    total_adaptations: 0,
                    successful_adaptations: 0,
                    average_examples_needed: 0.0,
                    cultural_accuracy: 0.0,
                    linguistic_accuracy: 0.0
                }
            },
            timestamp: new Date().toISOString()
        };

        return NextResponse.json(capabilities);

    } catch (error) {
        console.error('Meta-learning capabilities error:', error);

        return NextResponse.json(
            {
                available: false,
                message: 'Meta-learning capabilities not available',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
