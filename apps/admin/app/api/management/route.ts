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
    console.error('management GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch management' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await adminService.create(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('management POST error:', error);
    return NextResponse.json({ error: 'Failed to create management' }, { status: 500 });
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
    console.error('management PUT error:', error);
    return NextResponse.json({ error: 'Failed to update management' }, { status: 500 });
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
    console.error('management DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete management' }, { status: 500 });
  }
}