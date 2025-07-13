import { NextRequest, NextResponse } from 'next/server';
import { DocsService } from '../../../src/services/docsService';

const docsService = new DocsService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const result = await docsService.getById(id);
      return NextResponse.json(result);
    } else {
      const results = await docsService.getAll();
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('documents GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await docsService.create(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('documents POST error:', error);
    return NextResponse.json({ error: 'Failed to create documents' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for update' }, { status: 400 });
    }
    
    const result = await docsService.update(id, data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('documents PUT error:', error);
    return NextResponse.json({ error: 'Failed to update documents' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for deletion' }, { status: 400 });
    }
    
    await docsService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('documents DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete documents' }, { status: 500 });
  }
}