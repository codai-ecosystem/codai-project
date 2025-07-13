import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        service: 'AIDE - AI Development Environment',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            chat: '/api/chat',
            projects: '/api/projects',
            status: '/api/status',
            health: '/health'
        }
    })
}
