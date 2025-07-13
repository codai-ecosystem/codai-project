import { NextRequest, NextResponse } from 'next/server';
import { XService } from '../../../src/services/xService';

const xService = new XService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const result = await xService.getById(id);
      return NextResponse.json(result);
    } else {
      const results = await xService.getAll();
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await xService.create(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('analytics POST error:', error);
    return NextResponse.json({ error: 'Failed to create analytics' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for update' }, { status: 400 });
    }
    
    const result = await xService.update(id, data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('analytics PUT error:', error);
    return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for deletion' }, { status: 400 });
    }
    
    await xService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('analytics DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete analytics' }, { status: 500 });
  }
}