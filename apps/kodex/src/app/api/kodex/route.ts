import { NextRequest, NextResponse } from 'next/server';
import { kodexService } from '@/lib/services/kodexService';

export async function GET() {
  try {
    const health = await kodexService.healthCheck();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await kodexService.createItem(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}