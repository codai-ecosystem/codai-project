/**
 * ID AI Chat Endpoint - Migrated to @codai/api-utils
 */

import { NextRequest } from "next/server";
import { createAIChatEndpoint, createAIModelsEndpoint, AIProvider, ChatRequest, ChatResponse } from '@codai/api-utils/ai';

/**
 * ID AI Chat Endpoint - Migrated to Centralized RomAI
 */

import { NextRequest } from "next/server";
import { createIDRomAIProvider } from '@codai/api-utils/romai';
import { getCBDClient, createDevice, createConversation, createMessage } from '@codai/api-utils/cbd';
import { getServerSession } from "next-auth/next";

// Enhanced POST handler for ID Platform
export async function POST(request: NextRequest) {
  try {
    // Get user session for tracking
    const session = await getServerSession();

    // Initialize CBD database tracking
    const cbdClient = getCBDClient();
    let deviceId: string | null = null;
    let conversationId: string | null = null;

    try {
      // Create device for ID Platform tracking
      deviceId = await createDevice(cbdClient, {
        name: 'ID-Platform-Identity-Assistant',
        type: 'identity_management',
        status: 'active',
        lastSeen: new Date(),
        metadata: {
          platform: 'ID Platform',
          features: ['identity_management', 'authentication', 'security', 'compliance']
        },
        capabilities: ['identity-verification', 'access-control', 'security-protocols', 'compliance-guidance']
      });

      // Create conversation for this request
      conversationId = await createConversation(cbdClient, deviceId, 'ID Platform Identity Session', {
        type: 'identity_management',
        platform: 'ID',
        userId: session?.user?.email || 'anonymous'
      });
    } catch (error) {
      console.warn('CBD tracking setup failed:', error);
    }

    // Parse request body
    const body = await request.json();

    // Log incoming message to CBD
    if (deviceId && conversationId) {
      try {
        await createMessage(cbdClient, {
          conversationId,
          deviceId,
          content: JSON.stringify(body),
          type: 'command',
          sender: session?.user?.email || 'anonymous',
          metadata: { platform: 'ID', direction: 'incoming' },
          processed: false
        });
      } catch (error) {
        console.warn('CBD message logging failed:', error);
      }
    }

    // Create ID RomAI provider with identity-specific context
    const romaiProvider = createIDRomAIProvider();

    // Process with RomAI
    const response = await romaiProvider.chat({
      messages: body.messages || [{
        role: 'user',
        content: body.message || 'Hello'
      }],
      model: 'id-platform-v1',
      stream: false,
      temperature: 0.3, // Lower temperature for security-focused responses
      max_tokens: 1000
    });

    // Log response to CBD
    if (deviceId && conversationId) {
      try {
        await createMessage(cbdClient, {
          conversationId,
          deviceId,
          content: response.message.content,
          type: 'text',
          sender: 'ID-RomAI',
          metadata: {
            platform: 'ID',
            direction: 'outgoing',
            romai_used: true,
            model: response.model,
            usage: response.usage
          },
          processed: true
        });
      } catch (error) {
        console.warn('CBD response logging failed:', error);
      }
    }

    return Response.json(response);
  } catch (error) {
    console.error('ID Platform endpoint error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Enhanced GET handler  
export async function GET(request: NextRequest) {
  // Return both models and capabilities for ID using RomAI
  try {
    const romaiProvider = createIDRomAIProvider();
    const models = await romaiProvider.getModels();

    return Response.json({
      models,
      capabilities: [
        "identity-management",
        "authentication-assistance",
        "security-protocols",
        "user-verification",
        "access-control",
        "compliance-guidance",
        "romanian-identity-context"
      ],
      limits: {
        maxTokens: 4000,
        requestsPerMinute: 60
      },
      service: "ID Platform AI Assistant with Romanian AGI",
      version: "3.0.0-romai",
      phase: "Phase 2 - RomAI Integration",
      status: "Production implementation with centralized Romanian AGI",
      romai_integration: true
    });
  } catch (error) {
    console.error("ID AI info error:", error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
