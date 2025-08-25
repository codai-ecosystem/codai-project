/**
 * PublicAI Chat Endpoint - Centralized RomAI Integration
 * Path: /api/ai
 * Methods: POST, GET
 * Purpose: Public AI chat using centralized Romanian intelligence (no auth required)
 */

import { NextRequest } from 'next/server';
import { createAIChatEndpoint, createAIModelsEndpoint } from '@codai/api-utils/ai';
import { createPublicAIRomAIProvider, getRomAIServiceInfo } from '@codai/api-utils/romai';
import { createAIServiceDevice, trackAIConversation, logAIMessage } from '@codai/api-utils/cbd';

// Create centralized RomAI provider for PublicAI
const publicaiRomAIProvider = createPublicAIRomAIProvider();

// Initialize PublicAI device in CBD on startup
let publicaiDeviceId: string | null = null;

async function initializePublicAIDevice() {
  if (!publicaiDeviceId) {
    try {
      publicaiDeviceId = await createAIServiceDevice(
        'PublicAI',
        ['public-ai', 'romanian-cultural-awareness', 'general-assistance'],
        {
          provider: 'RomAI AGI',
          models: ['romai-agi-v7', 'romanian-cultural-intelligence'],
          streaming: false,
          public_access: true,
          cultural_context: 'romanian'
        }
      );
      console.log('✅ PublicAI device initialized in CBD:', publicaiDeviceId);
    } catch (error) {
      console.error('❌ Failed to initialize PublicAI device:', error);
    }
  }
  return publicaiDeviceId;
}

// Enhanced PublicAI chat endpoint with RomAI integration (no auth required)
const publicaiChatEndpoint = createAIChatEndpoint(publicaiRomAIProvider, {
  requireAuth: false, // Public access
  rateLimitByUser: false,
  allowedModels: ['romai-agi-v7', 'romanian-cultural-intelligence'],
  onChatStart: async (request) => {
    const deviceId = await initializePublicAIDevice();
    if (deviceId) {
      try {
        const conversationId = await trackAIConversation(
          deviceId,
          'PublicAI Anonymous Session',
          {
            session_type: 'public_chat',
            app_source: 'PublicAI',
            public_access: true
          }
        );
        return { deviceId, conversationId };
      } catch (error) {
        console.error('Failed to track PublicAI conversation:', error);
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
            app_source: 'PublicAI',
            public_access: true,
            cultural_analysis: message.metadata?.cultural_analysis
          }
        );
      } catch (error) {
        console.error('Failed to log PublicAI message:', error);
      }
    }
  }
});

// POST handler (no auth required for public access)
export async function POST(request: NextRequest) {
  return publicaiChatEndpoint(request);
}

// GET handler with PublicAI service status
export async function GET(request: NextRequest) {
  try {
    const romaiInfo = await getRomAIServiceInfo();
    const models = await publicaiRomAIProvider.getModels();

    return Response.json({
      service: 'PublicAI - Romanian Public Intelligence',
      status: romaiInfo.status.available ? 'operational' : 'limited',
      timestamp: new Date().toISOString(),
      version: '3.0.0',

      romai_integration: {
        centralized_service: true,
        agi_server: romaiInfo.status,
        cultural_context: 'romanian_public'
      },

      public_features: [
        'Romanian Cultural Awareness',
        'General Public Assistance',
        'Cultural Sensitivity',
        'No Authentication Required',
        'Community-Focused Responses'
      ],

      models,

      capabilities: [
        'general-assistance',
        'cultural-awareness',
        'public-information',
        'romanian-context',
        'community-support'
      ],

      authentication: {
        required: false,
        public_access: true,
        rate_limited: false
      },

      benefits: [
        'Free Romanian AI access',
        'Cultural awareness',
        'Public service focus',
        'No barriers to entry'
      ],

      limits: {
        maxTokens: 1000,
        requestsPerMinute: 100, // Higher for public use
        public_priority: true
      }
    });

  } catch (error) {
    console.error('PublicAI service status error:', error);
    return Response.json({
      service: 'PublicAI - Romanian Public Intelligence',
      status: 'error',
      error: 'Failed to get PublicAI service information'
    }, { status: 500 });
  }
}

async * streamChat(request: ChatRequest) {
  // PublicAI doesn't implement streaming yet
  const response = await this.chat(request);
    yield {
    id: 'publicai-' + Date.now(),
      object: 'chat.completion.chunk',
        created: Date.now(),
          model: response.model,
            choices: [{
              index: 0,
              delta: {
                role: 'assistant',
                content: response.message.content
              },
              finishReason: 'stop'
            }]
  };
},

  async getModels(): Promise < string[] > {
  return [
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4-turbo"
  ];
},

  async getUsage(userId ?: string) {
  // Mock usage data for PublicAI (no limits for public API)
  return {
    requestsToday: 0,
    tokensToday: 0,
    remaining: 9999
  };
}
};

// Create the endpoints using @codai/api-utils (no auth required for PublicAI)
const chatEndpoint = createAIChatEndpoint(publicaiAIProvider, {
  requireAuth: false, // Public API
  rateLimitByUser: false,
  allowedModels: ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"]
});

const modelsEndpoint = createAIModelsEndpoint(publicaiAIProvider);

// Export the handlers
export async function POST(request: NextRequest) {
  return chatEndpoint(request);
}

export async function GET(request: NextRequest) {
  // Return both models and capabilities for PublicAI
  try {
    const models = await publicaiAIProvider.getModels();

    return Response.json({
      models,
      capabilities: [
        "text-completion",
        "code-generation",
        "analysis",
        "translation",
        "public-demo"
      ],
      limits: {
        maxTokens: 4000,
        requestsPerMinute: 60
      },
      service: "PublicAI Demo Service",
      version: "2.0.0",
      note: "This is a demo service with mock responses"
    });
  } catch (error) {
    console.error("PublicAI info error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
