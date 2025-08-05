import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        return NextResponse.json({
            message: 'MemorAI API is working!',
            timestamp: new Date().toISOString(),
            status: 'healthy'
        });
    } catch (error) {
        console.error('Test API error:', error);
        return NextResponse.json(
            { error: 'Test API failed' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        return NextResponse.json({
            message: 'POST received successfully',
            receivedData: body,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test POST API error:', error);
        return NextResponse.json(
            { error: 'Test POST API failed' },
            { status: 500 }
        );
    }
}
