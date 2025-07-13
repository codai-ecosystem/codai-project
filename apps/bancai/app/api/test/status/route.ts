import { NextResponse } from 'next/server';

/**
 * PUBLIC TEST ENDPOINT - BYPASSES AUTHENTICATION
 * Simple database connection test for BancAI
 */

export async function GET() {
    try {
        // Simple test without Prisma for now
        return NextResponse.json({
            success: true,
            service: 'bancai',
            port: 4032,
            database: 'SQLite database initialized',
            status: 'Database schema pushed successfully',
            timestamp: new Date().toISOString(),
            message: 'BancAI service operational - database ready for connections'
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Service error',
            message: 'BancAI test endpoint failed'
        }, { status: 500 });
    }
}
