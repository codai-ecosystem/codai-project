/**
 * Kodex AI Chat Endpoint - Centralized RomAI Integration
 * Path: /api/ai
 * Methods: POST, GET
 * Purpose: Developer-focused AI chat using centralized Romanian intelligence
 */

import { NextRequest } from 'next/server';
import { createAIChatEndpoint, createAIModelsEndpoint } from '@codai/api-utils/ai';
import { createKodexRomAIProvider, getRomAIServiceInfo } from '@codai/api-utils/romai';
import { getCBDAIService, trackAIConversation, logAIMessage, createAIServiceDevice } from '@codai/api-utils/cbd';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create centralized RomAI provider for Kodex
const kodexRomAIProvider = createKodexRomAIProvider();

// Initialize Kodex device in CBD on startup
let kodexDeviceId: string | null = null;

async function initializeKodexDevice() {
  if (!kodexDeviceId) {
    try {
      kodexDeviceId = await createAIServiceDevice(
        'Kodex',
        ['code-generation', 'debugging-assistance', 'architecture-design', 'romanian-dev-context'],
        {
          provider: 'RomAI AGI',
          models: ['romai-agi-v7', 'romanian-cultural-intelligence'],
          streaming: false,
          developer_focus: true,
          cultural_context: 'mixed'
        }
      );
      console.log('✅ Kodex device initialized in CBD:', kodexDeviceId);
    } catch (error) {
      console.error('❌ Failed to initialize Kodex device:', error);
    }
  }
  return kodexDeviceId;
}

// Enhanced Kodex chat endpoint with RomAI integration
const kodexChatEndpoint = createAIChatEndpoint(kodexRomAIProvider, {
  requireAuth: true,
  rateLimitByUser: true,
  allowedModels: ['romai-agi-v7', 'romanian-cultural-intelligence', 'native-romanian-agi'],
  onChatStart: async (request, session) => {
    // Initialize device and track conversation
    const deviceId = await initializeKodexDevice();
    if (deviceId && session?.user?.email) {
      try {
        const conversationId = await trackAIConversation(
          deviceId,
          `Kodex Session - ${session.user.email}`,
          {
            user_email: session.user.email,
            user_name: session.user.name,
            session_type: 'developer_chat',
            app_source: 'Kodex'
          }
        );
        return { deviceId, conversationId };
      } catch (error) {
        console.error('Failed to track Kodex conversation:', error);
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
            app_source: 'Kodex',
            developer_context: true,
            cultural_analysis: message.metadata?.cultural_analysis
          }
        );
      } catch (error) {
        console.error('Failed to log Kodex message:', error);
      }
    }
  }
});

const modelsEndpoint = createAIModelsEndpoint(kodexRomAIProvider);

// Authentication helper
async function checkKodexAuth(request: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

// POST handler with enhanced Kodex integration
export async function POST(request: NextRequest) {
  // Check authentication first
  if (!(await checkKodexAuth(request))) {
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

  return kodexChatEndpoint(requestWithHeaders);
}

// GET handler with Kodex service status
export async function GET(request: NextRequest) {
  try {
    // Check authentication first
    if (!(await checkKodexAuth(request))) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await getServerSession(authOptions);
    const romaiInfo = await getRomAIServiceInfo();
    const models = await kodexRomAIProvider.getModels();

    return Response.json({
      service: 'KodexAI - Romanian Developer Intelligence',
      status: romaiInfo.status.available ? 'operational' : 'limited',
      timestamp: new Date().toISOString(),
      version: '3.0.0',

      // RomAI Integration Status
      romai_integration: {
        centralized_service: true,
        agi_server: romaiInfo.status,
        endpoints: romaiInfo.endpoints,
        cultural_context: 'mixed_romanian_dev'
      },

      // Developer Features
      developer_features: [
        'Romanian-Aware Code Generation',
        'Cultural Context in Code Comments',
        'Architecture Design with Romanian Context',
        'Code Review with Cultural Sensitivity',
        'Technical Documentation in Romanian',
        'Romanian Development Best Practices'
      ],

      // Available Models
      models,

      // Service Capabilities
      capabilities: [
        'code-generation',
        'debugging-assistance',
        'architecture-design',
        'code-review',
        'technical-documentation',
        'api-design',
        'romanian-dev-context',
        'cultural-code-comments'
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
        'Enhanced cultural development context',
        'Consistent developer experience',
        'Advanced conversation tracking',
        'Romanian-aware technical solutions'
      ],

      // CBD Integration
      database: {
        service: 'CBD Universal Service',
        device_tracking: 'enabled',
        conversation_analytics: 'active',
        message_logging: 'comprehensive'
      },

      limits: {
        maxTokens: 4000,
        requestsPerMinute: 60,
        developer_priority: true
      }
    });

  } catch (error) {
    console.error('Kodex service status error:', error);
    return Response.json({
      service: 'KodexAI - Romanian Developer Intelligence',
      status: 'error',
      error: 'Failed to get Kodex service information',
      details: error instanceof Error ? error.message : 'Unknown error',
      fallback_available: true
    }, { status: 500 });
  }
}
