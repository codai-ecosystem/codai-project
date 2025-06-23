/**
 * Memory Context API Route
 * Gets contextual memory summary
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemorAIService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contextSize = parseInt(searchParams.get('size') || '5');

    const memoraiService = getMemorAIService();
    const result = await memoraiService.getContext(contextSize);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Memory context error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
