import { NextRequest, NextResponse } from 'next/server';
import { StudiaiService } from '../../../src/services/studiaiService';

const studiaiService = new StudiaiService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const result = await studiaiService.getById(id);
      return NextResponse.json(result);
    } else {
      const results = await studiaiService.getAll();
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('lessons GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await studiaiService.create(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('lessons POST error:', error);
    return NextResponse.json({ error: 'Failed to create lessons' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for update' }, { status: 400 });
    }
    
    const result = await studiaiService.update(id, data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('lessons PUT error:', error);
    return NextResponse.json({ error: 'Failed to update lessons' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for deletion' }, { status: 400 });
    }
    
    await studiaiService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('lessons DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete lessons' }, { status: 500 });
  }
}