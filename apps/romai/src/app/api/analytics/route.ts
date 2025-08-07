/**
 * Analytics API Route - REAL RomAI AGI Integration ONLY
 * Path: /api/analytics
 * Methods: GET, POST
 * Purpose: 100% Real-time analytics from native RomAI AGI server - NO FAKE DATA
 */

import { NextRequest, NextResponse } from 'next/server';

// Native RomAI AGI server configuration
const ROMAI_AGI_BASE_URL = process.env.ROMAI_AGI_URL || 'http://localhost:6101';

interface RealAGIMetrics {
    health: any;
    training: any;
    capabilities: any;
    status: any;
}

async function fetchRealAGIData(): Promise<RealAGIMetrics> {
    // Fetch ONLY real data from AGI server - no fallbacks, no fake data
    const [healthResponse, trainingResponse, capabilitiesResponse, statusResponse] = await Promise.allSettled([
        fetch(`${ROMAI_AGI_BASE_URL}/health`),
        fetch(`${ROMAI_AGI_BASE_URL}/training/metrics`),
        fetch(`${ROMAI_AGI_BASE_URL}/capabilities/scores`),
        fetch(`${ROMAI_AGI_BASE_URL}/training/status`)
    ]);

    // Extract real data or null - NO FAKE FALLBACKS
    const healthData = healthResponse.status === 'fulfilled' && healthResponse.value.ok
        ? await healthResponse.value.json()
        : null;

    const trainingData = trainingResponse.status === 'fulfilled' && trainingResponse.value.ok
        ? await trainingResponse.value.json()
        : null;

    const capabilitiesData = capabilitiesResponse.status === 'fulfilled' && capabilitiesResponse.value.ok
        ? await capabilitiesResponse.value.json()
        : null;

    const statusData = statusResponse.status === 'fulfilled' && statusResponse.value.ok
        ? await statusResponse.value.json()
        : null;

    return {
        health: healthData,
        training: trainingData,
        capabilities: capabilitiesData,
        status: statusData
    };
}

export async function GET(request: NextRequest) {
    try {
        const realData = await fetchRealAGIData();

        // Check if we have any real data
        if (!realData.health && !realData.training && !realData.capabilities && !realData.status) {
            throw new Error('AGI server completely unavailable');
        }

        // Build response with ONLY real data - no simulation
        const analyticsResponse = {
            server_status: realData.health?.status || 'unknown',
            server_uptime: realData.health?.uptime_seconds || 0,
            models_loaded: realData.health?.models_loaded || 0,
            total_inferences: realData.health?.total_inferences || 0,
            server_version: realData.health?.server_version || null,

            // Training metrics - real only
            training_metrics: realData.training ? {
                epochs_completed: realData.training.epochs_completed,
                current_loss: realData.training.current_loss,
                best_loss: realData.training.best_loss,
                learning_rate: realData.training.learning_rate,
                batch_size: realData.training.batch_size,
                model_parameters: realData.training.model_parameters,
                training_samples: realData.training.training_samples,
                validation_accuracy: realData.training.validation_accuracy,
                cultural_accuracy: realData.training.cultural_accuracy,
                reasoning_score: realData.training.reasoning_score,
                training_time_hours: realData.training.training_time_hours,
                last_updated: realData.training.last_updated
            } : null,

            // Capability scores - real only
            capabilities: realData.capabilities ? {
                romanian_language_processing: realData.capabilities.romanian_language_processing,
                cultural_understanding: realData.capabilities.cultural_understanding,
                advanced_reasoning: realData.capabilities.advanced_reasoning,
                multi_dimensional_intelligence: realData.capabilities.multi_dimensional_intelligence,
                meta_learning: realData.capabilities.meta_learning,
                autonomous_problem_solving: realData.capabilities.autonomous_problem_solving,
                overall_agi_score: realData.capabilities.overall_agi_score,
                confidence_interval: realData.capabilities.confidence_interval,
                last_evaluated: realData.capabilities.last_evaluated
            } : null,

            // Training status - real only
            training_status: realData.status ? {
                is_training: realData.status.is_training,
                current_epoch: realData.status.current_epoch,
                total_epochs: realData.status.total_epochs,
                current_step: realData.status.current_step,
                current_loss: realData.status.current_loss,
                best_loss: realData.status.best_loss,
                learning_rate: realData.status.learning_rate,
                eta_minutes: realData.status.eta_minutes,
                message: realData.status.message
            } : null,

            data_source: 'real_agi_server',
            timestamp: new Date().toISOString(),
            available_endpoints: {
                health: !!realData.health,
                training_metrics: !!realData.training,
                capabilities: !!realData.capabilities,
                training_status: !!realData.status
            }
        };

        return NextResponse.json(analyticsResponse);

    } catch (error) {
        console.error('Real AGI Analytics Error:', error);

        // Return proper error - NO FAKE DATA FALLBACK
        return NextResponse.json({
            error: 'AGI server connection failed',
            message: 'Cannot provide analytics without real AGI server connection',
            agi_server_url: ROMAI_AGI_BASE_URL,
            required_action: 'Ensure RomAI AGI server is running on port 6101',
            timestamp: new Date().toISOString(),
            data_source: 'error_state'
        }, { status: 503 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { event, data } = await request.json();

        // Log real events only - no fake processing
        console.log('🧠 Real AGI Analytics Event:', {
            event,
            data,
            timestamp: new Date().toISOString(),
            source: 'real_romai_frontend'
        });

        return NextResponse.json({
            success: true,
            event_logged: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Real AGI Event Error:', error);
        return NextResponse.json({
            error: 'Event logging failed',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
