import { NextRequest, NextResponse } from 'next/server';
import { hubService } from '@/lib/services/hubService';

export async function GET() {
  try {
    const health = await hubService.getHealth();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await hubService.createResource(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}