import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminIntegrationService } from '@/lib/services/adminIntegrationService';
import { z } from 'zod';

const integrationSchema = z.object({
  action: z.enum(['initialize', 'healthCheck', 'configure', 'test']),
  integration: z.string().optional(),
  config: z.record(z.any()).optional()
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'healthCheck':
        const health = await adminIntegrationService.healthCheckIntegrations();
        return NextResponse.json(health);
        
      case 'initialize':
        const initResult = await adminIntegrationService.initializeAllIntegrations();
        return NextResponse.json(initResult);
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Integration API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = integrationSchema.parse(body);

    const result = await adminIntegrationService.initializeAllIntegrations();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Integration API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}