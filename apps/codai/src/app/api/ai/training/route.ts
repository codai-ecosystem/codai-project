/**
 * Training Data API Route - CND Enhanced
 * Manages AI training data for model improvement
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCNDAIService } from '../../../../services/cnd-ai';
import { z } from 'zod';

const CreateTrainingDataSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  modelId: z.string().min(1, 'Model ID is required'),
  inputText: z.string().min(1, 'Input text is required'),
  expectedOutput: z.string().min(1, 'Expected output is required'),
  actualOutput: z.string().optional(),
  feedback: z.enum(['positive', 'negative', 'neutral']).optional(),
  tags: z.array(z.string()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const aiService = getCNDAIService();
    await aiService.initialize();

    const body = await request.json();
    const validatedData = CreateTrainingDataSchema.parse(body);

    const trainingData = await aiService.addTrainingData(validatedData);

    return NextResponse.json({
      success: true,
      data: trainingData,
      message: 'Training data added successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to add training data:', error);

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
        error: 'Failed to add training data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
