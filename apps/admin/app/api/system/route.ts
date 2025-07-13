import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '../../../src/services/adminService';

const adminService = new AdminService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const result = await adminService.getById(id);
      return NextResponse.json(result);
    } else {
      const results = await adminService.getAll();
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('system GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch system' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await adminService.create(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('system POST error:', error);
    return NextResponse.json({ error: 'Failed to create system' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for update' }, { status: 400 });
    }
    
    const result = await adminService.update(id, data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('system PUT error:', error);
    return NextResponse.json({ error: 'Failed to update system' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required for deletion' }, { status: 400 });
    }
    
    await adminService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('system DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete system' }, { status: 500 });
  }
}