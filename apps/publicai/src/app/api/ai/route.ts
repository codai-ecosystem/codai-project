import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Simplified without auth for now
    const body = await request.json();
    const { message, model = "gpt-3.5-turbo", maxTokens = 150 } = body;

    if (!message) {
      return NextResponse.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    // Mock AI response for demo purposes
    const response = `AI response to: ${message}`;

    return NextResponse.json({
      response,
      model,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("AI API error:", error);

    return NextResponse.json(
      { message: "AI service error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return available AI models and capabilities
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
      }
    });

  } catch (error) {
    console.error("AI info error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
