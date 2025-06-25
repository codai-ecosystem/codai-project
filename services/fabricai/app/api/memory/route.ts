/**
 * Memory API Routes
 * Handles memory operations with MemorAI service
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemorAIService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const { content, metadata } = await request.json();

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    const memoraiService = getMemorAIService();
    const result = await memoraiService.remember(content, metadata);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Memory store error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const memoraiService = getMemorAIService();
    const result = await memoraiService.recall(query, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Memory search error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
