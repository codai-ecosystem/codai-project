import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const healthData = {
            status: 'healthy',
            service: 'ANALIZAI',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024),
            },
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            port: 5003,
            features: {
                analytics: true,
                dataProcessing: true,
                visualizations: true,
                reporting: true,
                aiInsights: true
            }
        };

        return NextResponse.json(healthData, {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json({
            status: 'unhealthy',
            service: 'ANALIZAI',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500,
            headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json'
            }
        });
    }
}
