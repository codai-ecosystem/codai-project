// API route for storing memories
import { NextRequest, NextResponse } from 'next/server';
import { MemoryService } from '@/services/MemoryService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, content, type, title, tags, metadata } = body;

    if (!agentId || !content || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, content, and type' },
        { status: 400 }
      );
    }

    const memoryService = MemoryService.getInstance();
    const response = await memoryService.remember({
      agentId,
      content,
      type,
      title,
      tags: tags || [],
      metadata: metadata || {},
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Memory storage error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
