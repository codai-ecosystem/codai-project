/**
 * @fileoverview Secure API Route Example
 * @description Example of a secure API route with comprehensive protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAPIProtection } from '../../middleware/api-security-middleware';

// Example protected API route
async function handler(req: NextRequest): Promise<NextResponse> {
    try {
        switch (req.method) {
            case 'GET':
                return NextResponse.json({ 
                    message: 'Secure GET endpoint', 
                    timestamp: new Date().toISOString() 
                });
            case 'POST':
                const body = await req.json();
                return NextResponse.json({ 
                    message: 'Secure POST endpoint', 
                    data: body 
                });
            case 'PUT':
                return NextResponse.json({ message: 'Secure PUT endpoint' });
            case 'DELETE':
                return NextResponse.json({ message: 'Secure DELETE endpoint' });
            default:
                return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
        }
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            requestId: req.headers.get('x-request-id') || 'unknown'
        }, { status: 500 });
    }
}

// Apply security middleware
export default withAPIProtection(
    handler,
    {
        rateLimit: {
            windowMs: 15 * 60 * 1000,
            maxRequests: 100
        },
        requireAuth: true,
        enableCSRFProtection: true,
        maxBodySize: 1024 * 1024 // 1MB
    }
);
