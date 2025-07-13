import { NextRequest, NextResponse } from 'next/server';
import { analizaiService } from '@/lib/services/analizaiService';

export async function GET() {
  try {
    const health = await analizaiService.healthCheck();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await analizaiService.createItem(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}