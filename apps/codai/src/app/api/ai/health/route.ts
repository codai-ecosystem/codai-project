/**
 * AI Service Health API Route - CND Enhanced
 * Provides comprehensive health monitoring for AI service
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCNDAIService } from '../../../../services/cnd-ai';

export async function GET(request: NextRequest) {
  try {
    const aiService = getCNDAIService();
    await aiService.initialize();

    const healthStatus = await aiService.getHealthStatus();
    const metrics = await aiService.getServiceMetrics();

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      service: 'codai-ai-service',
      version: '1.0.0',
      status: healthStatus.status || 'healthy',
      cnd: {
        connected: true,
        enterprise: {
          enabled: true,
          features: [
            'serviceDiscovery',
            'authentication',
            'authorization',
            'audit',
            'monitoring'
          ]
        }
      },
      database: {
        connected: true,
        tables: [
          'ai_models',
          'conversations',
          'training_data',
          'conversation_embeddings'
        ]
      },
      ai: {
        capabilities: [
          'modelStorage',
          'conversationManagement',
          'vectorSearch',
          'trainingData'
        ],
        metrics: metrics.aiMetrics || {
          activeModels: 0,
          activeConversations: 0,
          trainingDataPoints: 0
        }
      },
      performance: metrics || {},
      uptime: process.uptime()
    };

    // Set appropriate HTTP status based on health
    const httpStatus = healthStatus.status === 'critical' ? 503 : 200;

    return NextResponse.json(response, { status: httpStatus });

  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      service: 'codai-ai-service',
      status: 'unhealthy',
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
