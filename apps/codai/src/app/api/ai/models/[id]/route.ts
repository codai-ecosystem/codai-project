/**
 * AI Model by ID API Route - CND Enhanced
 * Manages individual AI model operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCNDAIService } from '../../../../../services/cnd-ai';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const aiService = getCNDAIService();
    await aiService.initialize();

    const model = await aiService.getAIModel(params.id);

    if (!model) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI model not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: model
    });

  } catch (error) {
    console.error('Failed to fetch AI model:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch AI model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
