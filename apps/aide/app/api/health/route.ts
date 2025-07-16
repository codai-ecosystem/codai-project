export async function GET() {
    return Response.json({
        status: 'healthy',
        service: 'aide',
        description: 'AI Development Environment',
        timestamp: new Date().toISOString(),
        port: 4051,
        type: 'development',
        category: 'ai-tools',
        version: '1.0.0'
    })
}
