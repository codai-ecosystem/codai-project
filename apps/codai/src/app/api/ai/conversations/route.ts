/**
 * Conversations API Route - CND Enhanced
 * Manages AI conversations using CND database and vector search
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCNDAIService } from '../../../../services/cnd-ai';
import { z } from 'zod';

const CreateConversationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required'),
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.string().transform(str => new Date(str)),
    metadata: z.record(z.string(), z.any()).optional()
  })),
  modelId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isArchived: z.boolean().default(false)
});

const SearchConversationsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  userId: z.string().min(1, 'User ID is required'),
  limit: z.number().min(1).max(100).default(10)
});

export async function GET(request: NextRequest) {
  try {
    const aiService = getCNDAIService();
    await aiService.initialize();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required'
        },
        { status: 400 }
      );
    }

    let conversations;

    if (query) {
      // Perform search
      conversations = await aiService.searchConversations(query, userId, limit);
    } else {
      // Get user conversations
      conversations = await aiService.getUserConversations(userId, limit);
    }

    return NextResponse.json({
      success: true,
      data: conversations,
      count: conversations.length
    });

  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const aiService = getCNDAIService();
    await aiService.initialize();

    const body = await request.json();

    // Handle search request
    if (body.action === 'search') {
      const validatedSearch = SearchConversationsSchema.parse(body);
      const conversations = await aiService.searchConversations(
        validatedSearch.query,
        validatedSearch.userId,
        validatedSearch.limit
      );

      return NextResponse.json({
        success: true,
        data: conversations,
        query: validatedSearch.query,
        count: conversations.length
      });
    }

    // Handle create conversation request
    const validatedData = CreateConversationSchema.parse(body);
    const conversation = await aiService.createConversation(validatedData);

    return NextResponse.json({
      success: true,
      data: conversation,
      message: 'Conversation created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to process conversation request:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process conversation request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
