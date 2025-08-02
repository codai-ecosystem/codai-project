import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model = "gpt-3.5-turbo", maxTokens = 150 } = body;

    if (!message) {
      return NextResponse.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    // Phase 1 Implementation - Mock AI Response
    return NextResponse.json({
      response: `This is a Phase 1 mock response to: "${message}". AI functionality will be fully implemented in Phase 2.`,
      model,
      usage: {
        prompt_tokens: 10,
        completion_tokens: 25,
        total_tokens: 35
      },
      timestamp: new Date().toISOString(),
      phase: "Phase 1 - Service Ready"
    });

  } catch (error: any) {
    console.error("AI API error:", error);

    return NextResponse.json(
      { message: "AI service error - Phase 1 implementation" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return available AI models and capabilities for Phase 1
    return NextResponse.json({
      models: [
        "gpt-3.5-turbo",
        "gpt-4",
        "gpt-4-turbo"
      ],
      capabilities: [
        "text-completion",
        "code-generation",
        "analysis",
        "translation"
      ],
      limits: {
        maxTokens: 4000,
        requestsPerMinute: 60
      },
      phase: "Phase 1 - Service Ready",
      status: "Mock implementation"
    });

  } catch (error) {
    console.error("AI info error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
