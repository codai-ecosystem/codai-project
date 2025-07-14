import { NextRequest, NextResponse } from 'next/server';
import AideAIService from '../../../lib/ai-service';

const aiService = new AideAIService();

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  message?: string; // Legacy support
  context?: {
    projectPath?: string;
    openFiles?: string[];
    currentFile?: string;
    language?: string;
    framework?: string;
    errors?: string[];
  };
  conversationId?: string;
  projectId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    // Support both new messages format and legacy message format
    let messages: ChatMessage[] = [];
    
    if (body.messages && Array.isArray(body.messages)) {
      messages = body.messages;
    } else if (body.message) {
      // Legacy format support
      messages = [{ role: 'user', content: body.message }];
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Messages array or message is required' },
        { status: 400 }
      );
    }

    // Enhance context with additional information
    const enhancedContext = {
      projectPath: body.context?.projectPath,
      openFiles: body.context?.openFiles,
      currentFile: body.context?.currentFile,
      language: body.context?.language,
      framework: body.context?.framework,
      errors: body.context?.errors,
      conversationId: body.conversationId,
      projectId: body.projectId
    };

    // Generate AI response using real OpenAI service
    const response = await aiService.generateResponse(messages, enhancedContext);

    // Return in both new and legacy formats for compatibility
    return NextResponse.json({
      success: true,
      message: response, // Legacy format
      response: response, // New format
      conversationId: body.conversationId,
      timestamp: new Date().toISOString(),
      metadata: {
        service: 'AIDE AI Assistant',
        model: 'gpt-4',
        context: enhancedContext.currentFile ? 'with-context' : 'no-context',
        messageCount: messages.length
      }
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Provide detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isOpenAIError = errorMessage.includes('openai') || errorMessage.includes('API');
    
    return NextResponse.json(
      { 
        success: false, 
        error: isOpenAIError ? 'AI service temporarily unavailable' : 'Failed to process chat request',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        fallback: isOpenAIError ? 'Using fallback responses' : undefined
      },
      { status: isOpenAIError ? 503 : 500 }
    );
  }
}

// Enhanced health check endpoint
export async function GET() {
  try {
    const startTime = Date.now();
    const isAIHealthy = await aiService.healthCheck();
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      status: isAIHealthy ? 'healthy' : 'degraded',
      service: 'AIDE Chat API',
      version: '2.0.0',
      ai_service: isAIHealthy ? 'connected' : 'fallback',
      response_time_ms: responseTime,
      timestamp: new Date().toISOString(),
      capabilities: [
        'Code Generation',
        'Debugging Assistance', 
        'Concept Explanation',
        'Testing Support',
        'Romanian Development Context',
        'Codai Ecosystem Integration'
      ]
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        service: 'AIDE Chat API',
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
