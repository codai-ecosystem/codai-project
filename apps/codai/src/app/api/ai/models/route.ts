/**
 * AI Models API Route - CND Enhanced
 * Manages AI models using CND database and enterprise features
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCNDAIService } from '../../../../services/cnd-ai';
import { z } from 'zod';

const CreateModelSchema = z.object({
  name: z.string().min(1, 'Model name is required'),
  version: z.string().min(1, 'Version is required'),
  type: z.enum(['llm', 'vision', 'embedding', 'classification', 'generation']),
  provider: z.string().min(1, 'Provider is required'),
  modelPath: z.string().optional(),
  parameters: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});

export async function GET(request: NextRequest) {
  try {
    const aiService = getCNDAIService();
    await aiService.initialize();

    const models = await aiService.getActiveAIModels();

    return NextResponse.json({
      success: true,
      data: models,
      count: models.length
    });

  } catch (error) {
    console.error('Failed to fetch AI models:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch AI models',
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
    const validatedData = CreateModelSchema.parse(body);

    const model = await aiService.createAIModel(validatedData);

    return NextResponse.json({
      success: true,
      data: model,
      message: 'AI model created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create AI model:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create AI model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
