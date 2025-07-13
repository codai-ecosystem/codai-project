import { NextRequest, NextResponse } from 'next/server';
import { AideService } from '../../../src/services/aideService';

const aideService = new AideService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const result = await aideService.getById(id);
      return NextResponse.json(result);
    } else {
      const results = await aideService.getAll();
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('tools GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await aideService.create(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('tools POST error:', error);
    return NextResponse.json({ error: 'Failed to create tools' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for update' }, { status: 400 });
    }
    
    const result = await aideService.update(id, data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('tools PUT error:', error);
    return NextResponse.json({ error: 'Failed to update tools' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for deletion' }, { status: 400 });
    }
    
    await aideService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('tools DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete tools' }, { status: 500 });
  }
}