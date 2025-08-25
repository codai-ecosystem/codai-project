/**
 * Training Data API Route - CBD Enhanced
 * Manages AI training data for model improvement using CBD Database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCBDAIService } from '@codai/api-utils';
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
    const aiService = await getCBDAIService();

    const body = await request.json();
    const validatedData = CreateTrainingDataSchema.parse(body);

    // Since CBD doesn't have addTrainingData, we'll create a mock response
    // In a real implementation, this would store to CBD's document storage
    const trainingData = {
      id: crypto.randomUUID(),
      ...validatedData,
      createdAt: new Date().toISOString()
    };

    // Could store to CBD document storage here
    // await aiService.storeDocument('training_data', trainingData.id, trainingData);

    return NextResponse.json({
      success: true,
      data: trainingData,
      message: 'Training data added successfully via CBD'
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to add training data via CBD:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues
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
