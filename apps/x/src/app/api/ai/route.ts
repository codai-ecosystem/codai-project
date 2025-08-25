/**
 * X Platform AI Chat Endpoint - Centralized RomAI Integration
 * Path: /api/ai
 * Methods: POST, GET
 * Purpose: Social media AI chat using centralized Romanian intelligence
 */

import { NextRequest } from 'next/server';
import { createAIChatEndpoint, createAIModelsEndpoint } from '@codai/api-utils/ai';
import { createXRomAIProvider, getRomAIServiceInfo } from '@codai/api-utils/romai';
import { createAIServiceDevice, trackAIConversation, logAIMessage } from '@codai/api-utils/cbd';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create centralized RomAI provider for X Platform
const xRomAIProvider = createXRomAIProvider();

// Initialize X Platform device in CBD on startup
let xDeviceId: string | null = null;

async function initializeXDevice() {
  if (!xDeviceId) {
    try {
      xDeviceId = await createAIServiceDevice(
        'X Platform',
        ['social-media-ai', 'romanian-cultural-trends', 'content-generation'],
        {
          provider: 'RomAI AGI',
          models: ['romai-agi-v7', 'romanian-cultural-intelligence'],
          streaming: false,
          social_focus: true,
          cultural_context: 'romanian'
        }
      );
      console.log('✅ X Platform device initialized in CBD:', xDeviceId);
    } catch (error) {
      console.error('❌ Failed to initialize X Platform device:', error);
    }
  }
  return xDeviceId;
}

// Enhanced X Platform chat endpoint with RomAI integration  
const xChatEndpoint = createAIChatEndpoint(xRomAIProvider, {
  requireAuth: true,
  rateLimitByUser: true,
  allowedModels: ['romai-agi-v7', 'romanian-cultural-intelligence'],
  onChatStart: async (request, session) => {
    const deviceId = await initializeXDevice();
    if (deviceId && session?.user?.email) {
      try {
        const conversationId = await trackAIConversation(
          deviceId,
          `X Platform Session - ${session.user.email}`,
          {
            user_email: session.user.email,
            user_name: session.user.name,
            session_type: 'social_media_chat',
            app_source: 'X Platform'
          }
        );
        return { deviceId, conversationId };
      } catch (error) {
        console.error('Failed to track X Platform conversation:', error);
      }
    }
  },
  onChatMessage: async (message, context) => {
    if (context?.deviceId && context?.conversationId) {
      try {
        await logAIMessage(
          context.conversationId,
          context.deviceId,
          message.content,
          message.role === 'assistant' ? 'assistant' : 'user',
          {
            app_source: 'X Platform',
            social_context: true,
            cultural_analysis: message.metadata?.cultural_analysis
          }
        );
      } catch (error) {
        console.error('Failed to log X Platform message:', error);
      }
    }
  }
});

// Authentication helper
async function checkXAuth(request: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

// POST handler
export async function POST(request: NextRequest) {
  if (!(await checkXAuth(request))) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const session = await getServerSession(authOptions);
  const headers = new Headers(request.headers);
  headers.set('x-user-id', session?.user?.id || 'anonymous');

  const requestWithHeaders = new NextRequest(request.url, {
    method: request.method,
    headers,
    body: request.body
  });

  return xChatEndpoint(requestWithHeaders);
}

// GET handler with X Platform service status
export async function GET(request: NextRequest) {
  try {
    if (!(await checkXAuth(request))) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const session = await getServerSession(authOptions);
    const romaiInfo = await getRomAIServiceInfo();
    const models = await xRomAIProvider.getModels();

    return Response.json({
      service: 'X Platform - Romanian Social Intelligence',
      status: romaiInfo.status.available ? 'operational' : 'limited',
      timestamp: new Date().toISOString(),
      version: '3.0.0',

      romai_integration: {
        centralized_service: true,
        agi_server: romaiInfo.status,
        cultural_context: 'romanian_social_media'
      },

      social_features: [
        'Romanian Cultural Trend Analysis',
        'Social Media Content Generation',
        'Community Engagement Insights',
        'Platform-Aware Responses',
        'Cultural Sensitivity in Social Context'
      ],

      models,

      capabilities: [
        'social-media-content',
        'trend-analysis',
        'community-engagement',
        'cultural-insights',
        'romanian-social-context'
      ],

      authentication: {
        required: true,
        user_authenticated: !!session,
        user_email: session?.user?.email
      },

      limits: {
        maxTokens: 280, // Twitter-like limit
        requestsPerMinute: 30,
        social_priority: true
      }
    });

  } catch (error) {
    console.error('X Platform service status error:', error);
    return Response.json({
      service: 'X Platform - Romanian Social Intelligence',
      status: 'error',
      error: 'Failed to get X Platform service information'
    }, { status: 500 });
  }
}

// Authentication helper
async function checkXAuth(request: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

// Create the endpoints using @codai/api-utils
const chatEndpoint = createAIChatEndpoint(xRomAIProvider, {
  requireAuth: true,
  rateLimitByUser: true,
  allowedModels: ["romai-agi-v7", "romanian-cultural-intelligence"]
});

const modelsEndpoint = createAIModelsEndpoint(xRomAIProvider);

// Enhanced POST handler with X auth
export async function POST(request: NextRequest) {
  // Check authentication first
  if (!(await checkXAuth(request))) {
    return Response.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  // Add user ID header for the AI provider
  const session = await getServerSession(authOptions);
  const headers = new Headers(request.headers);
  headers.set('x-user-id', session?.user?.id || 'anonymous');

  const requestWithHeaders = new NextRequest(request.url, {
    method: request.method,
    headers,
    body: request.body
  });

  return chatEndpoint(requestWithHeaders);
}

// Enhanced GET handler  
export async function GET(request: NextRequest) {
  // Check authentication first
  if (!(await checkXAuth(request))) {
    return Response.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  // Return both models and capabilities for X
  try {
    const models = await xAIProvider.getModels();

    return Response.json({
      models,
      capabilities: [
        "social-content",
        "trend-analysis",
        "engagement-optimization",
        "hashtag-suggestions",
        "viral-content-creation",
        "community-insights"
      ],
      limits: {
        maxTokens: 4000,
        requestsPerMinute: 60
      },
      service: "XAI Social Platform Assistant",
      version: "2.0.0"
    });
  } catch (error) {
    console.error("X AI info error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
