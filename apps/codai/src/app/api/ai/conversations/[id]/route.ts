/**
 * Conversation by ID API Route - CND Enhanced
 * Manages individual conversation operations
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

    const conversation = await aiService.getConversation(params.id);

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversation not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation
    });

  } catch (error) {
    console.error('Failed to fetch conversation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
