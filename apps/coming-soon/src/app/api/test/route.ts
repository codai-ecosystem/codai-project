import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'CODAI Coming Soon API is working!',
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
}