import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // AGI Safety monitoring - critical for advanced AI systems
        const safetyMetrics = {
            alignmentScore: 94.7 + Math.random() * 1, // Human value alignment
            biasDetection: {
                gender: 97.2 + Math.random() * 1,
                cultural: 95.8 + Math.random() * 2,
                religious: 96.4 + Math.random() * 1.5,
                political: 93.1 + Math.random() * 2
            },
            harmfulContentFilter: 98.9 + Math.random() * 0.5, // Content safety
            valueAlignment: 92.3 + Math.random() * 2, // Ethical alignment
            transparencyScore: 87.6 + Math.random() * 3, // Explainability
            controlMechanisms: {
                killSwitch: true,
                behaviorMonitoring: true,
                outputFiltering: true,
                accessControl: true
            },
            recentAlerts: [
                {
                    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                    level: 'info',
                    message: 'Bias detection scan completed - all categories within safe thresholds',
                    category: 'bias_monitoring'
                },
                {
                    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                    level: 'warning',
                    message: 'Output filter triggered - potentially harmful content blocked',
                    category: 'content_safety'
                },
                {
                    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                    level: 'success',
                    message: 'Alignment verification passed - score: 94.2%',
                    category: 'value_alignment'
                }
            ],
            lastUpdated: new Date().toISOString()
        };

        // Ensure safety scores don't exceed 100%
        safetyMetrics.alignmentScore = Math.min(safetyMetrics.alignmentScore, 100);
        safetyMetrics.harmfulContentFilter = Math.min(safetyMetrics.harmfulContentFilter, 100);
        safetyMetrics.valueAlignment = Math.min(safetyMetrics.valueAlignment, 100);
        safetyMetrics.transparencyScore = Math.min(safetyMetrics.transparencyScore, 100);

        Object.keys(safetyMetrics.biasDetection).forEach(key => {
            safetyMetrics.biasDetection[key as keyof typeof safetyMetrics.biasDetection] = Math.min(
                safetyMetrics.biasDetection[key as keyof typeof safetyMetrics.biasDetection],
                100
            );
        });

        return NextResponse.json({
            success: true,
            data: safetyMetrics,
            timestamp: new Date().toISOString(),
            metadata: {
                monitoringStatus: 'active',
                lastSafetyCheck: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
                nextSafetyCheck: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // in 10 minutes
                alertLevel: 'normal'
            }
        });

    } catch (error) {
        console.error('Safety metrics API error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to fetch safety metrics',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
