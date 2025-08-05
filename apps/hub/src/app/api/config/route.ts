import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Basic input validation
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        // Validate and sanitize query parameters
        const validatedParams: Record<string, string> = {};
        for (const [key, value] of searchParams.entries()) {
            // Basic input sanitization
            if (typeof key === 'string' && typeof value === 'string') {
                const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
                const sanitizedValue = value.replace(/[<>'"&]/g, '');
                validatedParams[sanitizedKey] = sanitizedValue;
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Hub configuration retrieved successfully',
            data: {
                version: '1.0.0',
                services: [
                    { id: 'admin', name: 'Admin Dashboard', port: 4007, status: 'healthy' },
                    { id: 'id', name: 'ID Service', port: 4004, status: 'healthy' },
                    { id: 'gateway', name: 'API Gateway', port: 4003, status: 'healthy' },
                    { id: 'cbd', name: 'CBD Database', port: 4180, status: 'healthy' },
                    { id: 'hub', name: 'Hub Service', port: 4008, status: 'healthy' }
                ],
                queryParams: validatedParams
            }
        });
    } catch (error) {
        console.error('Hub config API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Configuration Error',
            message: 'Failed to retrieve hub configuration'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    return NextResponse.json({
        success: false,
        error: 'Method Not Allowed',
        message: 'POST method not supported for config endpoint'
    }, { status: 405 });
}
