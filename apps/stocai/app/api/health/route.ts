import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test environment variables
    const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasPinecone = !!process.env.PINECONE_API_KEY;

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'StocAI',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      dependencies: {
        supabase: hasSupabase ? 'configured' : 'missing',
        openai: hasOpenAI ? 'configured' : 'missing',
        pinecone: hasPinecone ? 'configured' : 'missing'
      },
      port: 4063
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        service: 'StocAI'
      },
      { status: 500 }
    );
  }
}
