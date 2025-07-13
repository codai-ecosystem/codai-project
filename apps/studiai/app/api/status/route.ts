import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      service: 'StudiAI',
      description: 'AI Education Platform',
      port: 4038,
      type: 'education',
      category: 'learning',
      timestamp: new Date().toISOString(),
      features: {
        courses: 'available',
        ai_tutoring: 'enabled',
        progress_tracking: 'active',
        adaptive_learning: 'available'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Service unhealthy' },
      { status: 500 }
    );
  }
}
