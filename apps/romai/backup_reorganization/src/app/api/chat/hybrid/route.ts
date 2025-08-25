/**
 * Hybrid Chat API Route - Week 1 Day 3
 * Uses the new Hybrid Orchestrator for intelligent query routing
 */

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

interface ChatRequest {
  message: string;
  userId?: string;
  sessionId?: string;
  preferences?: Record<string, any>;
  context?: Record<string, any>;
}

interface HybridResponse {
  response: string;
  processing_path: string;
  processing_time: number;
  cultural_context: Record<string, any>;
  performance_metrics: Record<string, any>;
  confidence: number;
  cost_estimate: number;
  status: string;
  suggestions: string[];
  cache_hit: boolean;
  error_message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message is required and must be a string'
      }, { status: 400 });
    }

    // Prepare the request for the hybrid orchestrator
    const hybridRequest = {
      query: body.message,
      user_id: body.userId || 'anonymous',
      session_id: body.sessionId || `session_${Date.now()}`,
      preferences: body.preferences || {},
      context: body.context || {},
      timestamp: Date.now() / 1000
    };

    // Call the hybrid orchestrator via Python
    const hybridResponse = await callHybridOrchestrator(hybridRequest);

    return NextResponse.json({
      success: true,
      data: {
        message: hybridResponse.response,
        processing_path: hybridResponse.processing_path,
        processing_time: hybridResponse.processing_time,
        confidence: hybridResponse.confidence,
        cultural_context: hybridResponse.cultural_context,
        performance_metrics: hybridResponse.performance_metrics,
        cost_estimate: hybridResponse.cost_estimate,
        suggestions: hybridResponse.suggestions,
        cache_hit: hybridResponse.cache_hit,
        status: hybridResponse.status
      },
      metadata: {
        timestamp: new Date().toISOString(),
        api_version: '1.0.0-hybrid',
        processing_type: 'hybrid_orchestrator'
      }
    });

  } catch (error) {
    console.error('Hybrid chat API error:', error);

    return NextResponse.json({
      success: false,
      error: 'Internal server error during hybrid processing',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function callHybridOrchestrator(request: any): Promise<HybridResponse> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'src', 'ml', 'orchestration', 'hybrid_api_client.py');

    const python = spawn('python', [scriptPath], {
      cwd: process.cwd(),
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    // Send request data to Python script
    python.stdin.write(JSON.stringify(request));
    python.stdin.end();

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python hybrid orchestrator error:', errorOutput);
        reject(new Error(`Hybrid orchestrator failed with code ${code}: ${errorOutput}`));
        return;
      }

      try {
        const result = JSON.parse(output.trim());
        resolve(result);
      } catch (parseError) {
        console.error('Failed to parse hybrid orchestrator response:', output);
        reject(new Error('Invalid response from hybrid orchestrator'));
      }
    });

    python.on('error', (error) => {
      console.error('Failed to start hybrid orchestrator:', error);
      reject(error);
    });

    // Set timeout for the request
    setTimeout(() => {
      python.kill();
      reject(new Error('Hybrid orchestrator request timeout'));
    }, 30000); // 30 second timeout
  });
}
