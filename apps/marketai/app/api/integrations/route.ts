// marketai Integration API Routes
// Auto-generated for 110% Power Achievement

import { NextRequest, NextResponse } from 'next/server';
import { MarketaiIntegrationManager } from '../../../src/lib/integrations/marketai';

const integrationManager = new MarketaiIntegrationManager();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    
    if (!service) {
      return NextResponse.json({ error: 'Service parameter required' }, { status: 400 });
    }

    const isConnected = await integrationManager.getService(service)?.connect();
    
    return NextResponse.json({
      service,
      connected: isConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Integration GET error:', error);
    return NextResponse.json({ error: 'Integration check failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, data } = body;

    if (!service || !data) {
      return NextResponse.json({ error: 'Service and data required' }, { status: 400 });
    }

    const result = await integrationManager.processIntegrationRequest(service, data);
    
    return NextResponse.json({
      success: true,
      service,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Integration POST error:', error);
    return NextResponse.json({ error: 'Integration processing failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const connectionStatus = await integrationManager.connectAll();
    
    return NextResponse.json({
      allConnected: connectionStatus,
      services: Array.from(integrationManager['services'].keys()),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Integration PUT error:', error);
    return NextResponse.json({ error: 'Integration connection failed' }, { status: 500 });
  }
}
