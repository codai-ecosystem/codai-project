/**
 * Basic Test API Route
 */

import { NextRequest, NextResponse } from 'next/server';

// GET /api/basic - Ultra basic test
export async function GET(request: NextRequest) {
    return NextResponse.json({
        success: true,
        message: 'Basic test working',
        timestamp: new Date().toISOString(),
    });
}
