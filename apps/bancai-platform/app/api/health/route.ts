import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'bancai-platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      financial_analysis: '/api/financial-analysis',
      loan_processing: '/api/loan-processing',
      fraud_detection: '/api/fraud-detection',
      investment_advice: '/api/investment-advice',
      compliance_check: '/api/compliance-check'
    },
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
}

export async function POST() {
  return NextResponse.json({
    message: 'BancAI Financial AI Platform is operational',
    status: 'healthy',
    capabilities: [
      'Real-time financial analysis',
      'Automated loan processing',
      'AI-powered fraud detection',
      'Investment advisory services',
      'Regulatory compliance monitoring'
    ]
  })
}
