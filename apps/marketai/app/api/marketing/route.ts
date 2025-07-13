import { NextRequest, NextResponse } from 'next/server';
import { MarketaiService } from '../../../src/services/marketaiService';

const marketaiService = new MarketaiService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const result = await marketaiService.getById(id);
      return NextResponse.json(result);
    } else {
      const results = await marketaiService.getAll();
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('marketing GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch marketing' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await marketaiService.create(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('marketing POST error:', error);
    return NextResponse.json({ error: 'Failed to create marketing' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for update' }, { status: 400 });
    }
    
    const result = await marketaiService.update(id, data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('marketing PUT error:', error);
    return NextResponse.json({ error: 'Failed to update marketing' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for deletion' }, { status: 400 });
    }
    
    await marketaiService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('marketing DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete marketing' }, { status: 500 });
  }
}