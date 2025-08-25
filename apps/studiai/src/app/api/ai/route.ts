/**
 * StudiAI Chat API Route - Centralized RomAI Integration
 * Path: /api/ai
 * Methods: POST
 * Purpose: Educational AI chat using centralized Romanian intelligence
 */

import { NextRequest } from 'next/server';
import { createAIChatEndpoint, createAIModelsEndpoint } from '@codai/api-utils/ai';
import { createStudiAIRomAIProvider, getRomAIServiceInfo } from '@codai/api-utils/romai';
import { getCBDAIService, trackAIConversation, logAIMessage, createAIServiceDevice } from '@codai/api-utils/cbd';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create centralized RomAI provider for StudiAI
const studiaiRomAIProvider = createStudiAIRomAIProvider();

// Initialize StudiAI device in CBD on startup
let studiaiDeviceId: string | null = null;

async function initializeStudiAIDevice() {
  if (!studiaiDeviceId) {
    try {
      studiaiDeviceId = await createAIServiceDevice(
        'StudiAI',
        ['educational-ai', 'romanian-cultural-learning', 'student-assistance'],
        {
          provider: 'RomAI AGI',
          models: ['romai-agi-v7', 'romanian-cultural-intelligence'],
          streaming: false,
          educational_focus: true,
          cultural_context: 'romanian'
        }
      );
      console.log('✅ StudiAI device initialized in CBD:', studiaiDeviceId);
    } catch (error) {
      console.error('❌ Failed to initialize StudiAI device:', error);
    }
  }
  return studiaiDeviceId;
}

// Enhanced StudiAI chat endpoint with RomAI integration
const studiaiChatEndpoint = createAIChatEndpoint(studiaiRomAIProvider, {
  requireAuth: true,
  rateLimitByUser: true,
  allowedModels: ['romai-agi-v7', 'romanian-cultural-intelligence', 'native-romanian-agi'],
  onChatStart: async (request, session) => {
    // Initialize device and track conversation
    const deviceId = await initializeStudiAIDevice();
    if (deviceId && session?.user?.email) {
      try {
        const conversationId = await trackAIConversation(
          deviceId,
          `StudiAI Session - ${session.user.email}`,
          {
            user_email: session.user.email,
            user_name: session.user.name,
            session_type: 'educational_chat',
            app_source: 'StudiAI'
          }
        );
        return { deviceId, conversationId };
      } catch (error) {
        console.error('Failed to track StudiAI conversation:', error);
      }
    }
  },
  onChatMessage: async (message, context) => {
    // Log messages to CBD for analytics
    if (context?.deviceId && context?.conversationId) {
      try {
        await logAIMessage(
          context.conversationId,
          context.deviceId,
          message.content,
          message.role === 'assistant' ? 'assistant' : 'user',
          {
            app_source: 'StudiAI',
            educational_context: true,
            cultural_analysis: message.metadata?.cultural_analysis
          }
        );
      } catch (error) {
        console.error('Failed to log StudiAI message:', error);
      }
    }
  }
});

const modelsEndpoint = createAIModelsEndpoint(studiaiRomAIProvider);

// Authentication helper
async function checkStudiAIAuth(request: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

// POST handler with enhanced StudiAI integration
export async function POST(request: NextRequest) {
  // Check authentication first
  if (!(await checkStudiAIAuth(request))) {
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

  return studiaiChatEndpoint(requestWithHeaders);
}

// GET handler with StudiAI service status
export async function GET(request: NextRequest) {
  try {
    // Check authentication first
    if (!(await checkStudiAIAuth(request))) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await getServerSession(authOptions);
    const romaiInfo = await getRomAIServiceInfo();
    const models = await studiaiRomAIProvider.getModels();

    return Response.json({
      service: 'StudiAI - Romanian Educational Intelligence',
      status: romaiInfo.status.available ? 'operational' : 'limited',
      timestamp: new Date().toISOString(),
      version: '3.0.0',

      // RomAI Integration Status
      romai_integration: {
        centralized_service: true,
        agi_server: romaiInfo.status,
        endpoints: romaiInfo.endpoints,
        cultural_context: 'romanian_educational'
      },

      // Educational Features
      educational_features: [
        'Romanian Cultural Learning',
        'Educational Content Generation',
        'Student Progress Tracking',
        'Cultural Context Analysis',
        'Academic Writing Assistance',
        'Romanian Language Support'
      ],

      // Available Models
      models,

      // Service Capabilities
      capabilities: [
        'educational-ai-chat',
        'romanian-cultural-intelligence',
        'student-assistance',
        'academic-writing',
        'cultural-learning',
        'conversation-tracking'
      ],

      // Authentication Status
      authentication: {
        required: true,
        user_authenticated: !!session,
        user_email: session?.user?.email
      },

      // Integration Benefits
      benefits: [
        'Centralized Romanian AI intelligence',
        'Enhanced cultural learning context',
        'Consistent educational experience',
        'Advanced conversation tracking',
        'Improved response quality'
      ],

      // CBD Integration
      database: {
        service: 'CBD Universal Service',
        device_tracking: 'enabled',
        conversation_analytics: 'active',
        message_logging: 'comprehensive'
      },

      limits: {
        maxTokens: 2000,
        requestsPerMinute: 15,
        educational_priority: true
      }
    });

  } catch (error) {
    console.error('StudiAI service status error:', error);
    return Response.json({
      service: 'StudiAI - Romanian Educational Intelligence',
      status: 'error',
      error: 'Failed to get StudiAI service information',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback_available: true
    }, { status: 500 });
  }
}
