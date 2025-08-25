import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Connect to actual RomAI AGI server for real safety metrics
        const ROMAI_AGI_BASE_URL = process.env.ROMAI_AGI_URL || 'http://localhost:6101';

        try {
            const response = await fetch(`${ROMAI_AGI_BASE_URL}/safety/metrics`);
            if (response.ok) {
                const realData = await response.json();
                return NextResponse.json({
                    success: true,
                    data: realData,
                    timestamp: new Date().toISOString(),
                    source: 'RomAI AGI Server'
                });
            }
        } catch (error) {
            console.warn('AGI server unavailable for safety metrics');
        }

        // Return minimal real data if AGI server unavailable
        return NextResponse.json({
            success: false,
            error: 'AGI server unavailable - no safety metrics available',
            timestamp: new Date().toISOString(),
            note: 'Please ensure RomAI AGI server is running on port 6101'
        }, { status: 503 });

    } catch (error) {
        console.error('Safety metrics API error:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to fetch safety metrics',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
