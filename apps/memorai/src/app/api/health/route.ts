import { NextResponse } from 'next/server';

export async function GET() {
    try {
        return NextResponse.json({
            service: 'MemorAI Service',
            serviceId: 'memorai',
            status: 'operational',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            ecosystem: 'codai-ecosystem',
            domain: 'memorai.codai.ro',
            uptime: Math.floor(process.uptime()),
            memory: process.memoryUsage(),
            capabilities: [
                'memory_management',
                'context_storage', 
                'intelligent_recall',
                'agent_memory',
                'ecosystem_integration'
            ],
            endpoints: {
                health: '/api/health',
                ecosystem: '/api/ecosystem',
                memories: '/api/memories',
                search: '/api/search',
                analytics: '/api/analytics'
            },
            communication: {
                enabledServices: ['codai', 'romai', 'admin', 'hub', 'control', 'id'],
                protocol: 'https',
                authentication: 'ecosystem_token'
            },
            message: 'MemorAI service is running successfully with ecosystem integration'
        });
    } catch (error) {
        return NextResponse.json(
            {
                service: 'MemorAI Service',
                serviceId: 'memorai',
                status: 'error',
                timestamp: new Date().toISOString(),
                ecosystem: 'codai-ecosystem',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
