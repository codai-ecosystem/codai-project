/**
 * Conversations API Route - CBD Enhanced
 * Manages AI conversations using CBD database and vector search
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCBDAIService } from '@codai/api-utils';
import { z } from 'zod';
import { randomUUID } from 'crypto';

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
    const aiService = await getCBDAIService();

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

    // Mock conversations data - in a real implementation, this would query CBD database
    const mockConversations = [
      {
        id: randomUUID(),
        userId,
        title: 'Sample Conversation 1',
        messages: [
          {
            id: randomUUID(),
            role: 'user',
            content: 'Hello, can you help me?',
            timestamp: new Date().toISOString()
          },
          {
            id: randomUUID(),
            role: 'assistant',
            content: 'Of course! How can I assist you today?',
            timestamp: new Date().toISOString()
          }
        ],
        modelId: 'romai-agi-v7',
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Filter by query if provided
    const conversations = query
      ? mockConversations.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.messages.some(m => m.content.toLowerCase().includes(query.toLowerCase()))
      )
      : mockConversations;

    return NextResponse.json({
      success: true,
      data: conversations.slice(0, limit),
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
    const aiService = await getCBDAIService();

    const body = await request.json();

    // Handle search request with mock data
    if (body.action === 'search') {
      const validatedSearch = SearchConversationsSchema.parse(body);

      // Mock search results - in real implementation would use CBD vector search
      const mockSearchResults = [
        {
          id: randomUUID(),
          userId: validatedSearch.userId,
          title: `Search Result for "${validatedSearch.query}"`,
          messages: [
            {
              id: randomUUID(),
              role: 'user',
              content: validatedSearch.query,
              timestamp: new Date().toISOString()
            },
            {
              id: randomUUID(),
              role: 'assistant',
              content: `Here's information related to: ${validatedSearch.query}`,
              timestamp: new Date().toISOString()
            }
          ],
          modelId: 'romai-agi-v7',
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockSearchResults.slice(0, validatedSearch.limit),
        query: validatedSearch.query,
        count: mockSearchResults.length
      });
    }

    // Handle create conversation request using CBD createConversation method
    const validatedData = CreateConversationSchema.parse(body);

    // Create conversation using CBD database - createConversation expects deviceId string
    const conversationId = await aiService.createConversation(
      validatedData.userId, // use userId as deviceId for now
      validatedData.title
    );

    const conversation = {
      id: conversationId,
      userId: validatedData.userId,
      title: validatedData.title,
      modelId: validatedData.modelId || 'romai-agi-v7',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create initial messages if provided
    for (const message of validatedData.messages) {
      const messageData = {
        conversationId: conversationId,
        deviceId: validatedData.userId, // use userId as deviceId
        content: message.content,
        type: 'text' as const,
        sender: message.role,
        metadata: message.metadata,
        createdAt: new Date(message.timestamp),
        processed: false
      };

      await aiService.createMessage(messageData);
    }

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
