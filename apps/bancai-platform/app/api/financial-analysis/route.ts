import { NextRequest, NextResponse } from 'next/server'

interface FinancialAnalysisRequest {
  type: 'portfolio' | 'risk' | 'market' | 'performance'
  data: {
    assets?: Array<{
      symbol: string
      quantity: number
      currentPrice: number
      purchasePrice?: number
    }>
    timeframe?: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y'
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive'
    investmentGoals?: string[]
  }
  options?: {
    includeRecommendations?: boolean
    detailedAnalysis?: boolean
    marketComparison?: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: FinancialAnalysisRequest = await request.json()
    const { type, data, options = {} } = body

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Analysis type and data are required' },
        { status: 400 }
      )
    }

    // Try Azure OpenAI integration first, fallback to demo if not configured
    let analysisResult
    try {
      analysisResult = await generateFinancialAnalysisWithAI(type, data, options)
    } catch (azureError) {
      // Fallback to demo analysis if Azure OpenAI is not configured
      console.warn('Azure OpenAI not available, using demo analysis:', azureError)
      analysisResult = generateDemoFinancialAnalysis(type, data, options)
    }

    return NextResponse.json(analysisResult, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Financial analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function generateFinancialAnalysisWithAI(
  type: string,
  data: any,
  options: any
) {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.AZURE_AI_FOUNDRY_ENDPOINT
  const azureApiKey = process.env.AZURE_OPENAI_KEY || process.env.AZURE_AI_FOUNDRY_KEY
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview'

  if (!azureEndpoint || !azureApiKey) {
    throw new Error('Azure OpenAI credentials not configured')
  }

  const deploymentName = 'gpt-4o'
  const url = `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`

  const prompt = generateFinancialAnalysisPrompt(type, data, options)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': azureApiKey,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a senior financial analyst and investment advisor with expertise in portfolio analysis, risk assessment, and market predictions. Provide detailed, actionable financial analysis and recommendations based on the data provided.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      top_p: 0.95,
    }),
  })

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`)
  }

  const aiResponse = await response.json()
  const analysis = aiResponse.choices[0]?.message?.content || ''

  return {
    id: `analysis_${Date.now()}`,
    type,
    analysis,
    recommendations: extractRecommendations(analysis),
    risk_score: calculateRiskScore(data),
    confidence_level: 0.85,
    timestamp: new Date().toISOString(),
    metadata: {
      tokens_used: aiResponse.usage?.total_tokens || 0,
      mode: 'azure_openai',
      deployment: deploymentName
    }
  }
}

function generateDemoFinancialAnalysis(type: string, data: any, options: any) {
  const demoAnalyses = {
    portfolio: {
      analysis: `Portfolio Analysis Summary:

Your portfolio shows a balanced mix of assets with moderate risk exposure. Based on the current allocation:

• **Diversification Score**: 7.5/10 - Good spread across sectors
• **Risk Level**: Moderate - Suitable for long-term growth
• **Expected Annual Return**: 8-12% based on historical performance
• **Volatility**: 15-20% - Within acceptable range for growth portfolio

**Key Observations:**
- Technology sector allocation (35%) provides growth potential
- Financial sector exposure (25%) offers stability and dividends
- International diversification (20%) reduces domestic market risk
- Bond allocation (20%) provides portfolio stability

**Performance Metrics:**
- Sharpe Ratio: 1.2 (Above average risk-adjusted returns)
- Beta: 1.05 (Slightly more volatile than market)
- Alpha: 2.3% (Outperforming market by 2.3% annually)`,
      recommendations: [
        'Consider increasing international exposure to 25-30%',
        'Rebalance quarterly to maintain target allocations',
        'Review bond duration given current interest rate environment',
        'Add ESG-focused investments for sustainable growth'
      ]
    },
    risk: {
      analysis: `Risk Assessment Report:

**Overall Risk Profile**: MODERATE

**Risk Breakdown:**
• **Market Risk**: 65% - Normal exposure to market fluctuations
• **Credit Risk**: 15% - Low exposure through high-grade bonds
• **Liquidity Risk**: 10% - Most holdings easily tradeable
• **Concentration Risk**: 10% - Well diversified across sectors

**Stress Test Results:**
- 10% market decline: Portfolio expected loss of 8-9%
- Economic recession scenario: Maximum drawdown of 25%
- Interest rate increase (+2%): Bond portfolio impact of -5%

**Risk Mitigation Strategies:**
- Current stop-loss levels appropriately set at -15%
- Hedging positions cover 30% of equity exposure
- Cash reserves at 5% of portfolio value`,
      recommendations: [
        'Implement dynamic hedging strategy',
        'Increase cash position to 10% during volatile periods',
        'Consider protective put options for largest positions',
        'Set up automated rebalancing triggers'
      ]
    },
    market: {
      analysis: `Market Analysis & Outlook:

**Current Market Environment**: NEUTRAL-POSITIVE

**Key Market Indicators:**
• **S&P 500**: Currently at resistance levels, potential for breakout
• **VIX**: At 18, indicating moderate market anxiety
• **Interest Rates**: Fed policy supportive of continued growth
• **Economic Indicators**: GDP growth at 2.5%, inflation under control

**Sector Analysis:**
- Technology: Overvalued but strong earnings growth continues
- Healthcare: Attractive valuations with demographic tailwinds
- Energy: Cyclical opportunities emerging
- Utilities: Defensive play as rates stabilize

**Technical Analysis:**
- Market breadth improving with 60% of stocks above 200-day MA
- Momentum indicators suggest continued upward trend
- Support levels well established around current prices`,
      recommendations: [
        'Gradual increase in equity allocation over next 3 months',
        'Focus on quality companies with strong balance sheets',
        'Consider value opportunities in energy and financial sectors',
        'Maintain defensive positions in healthcare and consumer staples'
      ]
    }
  }

  const selectedAnalysis = demoAnalyses[type as keyof typeof demoAnalyses] || demoAnalyses.portfolio

  return {
    id: `analysis_${Date.now()}`,
    type,
    analysis: selectedAnalysis.analysis,
    recommendations: selectedAnalysis.recommendations,
    risk_score: Math.floor(Math.random() * 30) + 40, // 40-70 range
    confidence_level: 0.78,
    timestamp: new Date().toISOString(),
    metadata: {
      tokens_used: Math.floor(Math.random() * 500) + 300,
      mode: 'demo'
    }
  }
}

function generateFinancialAnalysisPrompt(type: string, data: any, options: any): string {
  let prompt = `Please provide a comprehensive ${type} analysis based on the following data:\n\n`

  if (data.assets) {
    prompt += `Portfolio Assets:\n`
    data.assets.forEach((asset: any, index: number) => {
      prompt += `${index + 1}. ${asset.symbol}: ${asset.quantity} shares at $${asset.currentPrice}`
      if (asset.purchasePrice) {
        prompt += ` (purchased at $${asset.purchasePrice})`
      }
      prompt += `\n`
    })
  }

  if (data.timeframe) {
    prompt += `\nAnalysis Timeframe: ${data.timeframe}\n`
  }

  if (data.riskTolerance) {
    prompt += `Risk Tolerance: ${data.riskTolerance}\n`
  }

  if (data.investmentGoals) {
    prompt += `Investment Goals: ${data.investmentGoals.join(', ')}\n`
  }

  prompt += `\nPlease provide:\n`
  prompt += `1. Detailed analysis of the current situation\n`
  prompt += `2. Risk assessment and key metrics\n`
  prompt += `3. Specific actionable recommendations\n`
  prompt += `4. Market outlook and considerations\n`

  if (options.includeRecommendations) {
    prompt += `5. Specific buy/sell/hold recommendations\n`
  }

  return prompt
}

function extractRecommendations(analysis: string): string[] {
  // Simple extraction of recommendations from AI analysis
  const lines = analysis.split('\n')
  const recommendations: string[] = []

  let inRecommendationSection = false
  for (const line of lines) {
    if (line.toLowerCase().includes('recommendation') || line.toLowerCase().includes('suggest')) {
      inRecommendationSection = true
    }

    if (inRecommendationSection && (line.startsWith('•') || line.startsWith('-') || line.match(/^\d+\./))) {
      recommendations.push(line.replace(/^[•\-\d\.]\s*/, '').trim())
    }
  }

  return recommendations.length > 0 ? recommendations : [
    'Review portfolio allocation quarterly',
    'Consider rebalancing based on risk tolerance',
    'Monitor market conditions for opportunities'
  ]
}

function calculateRiskScore(data: any): number {
  // Simple risk scoring algorithm
  let score = 50 // Base moderate risk

  if (data.riskTolerance === 'conservative') score -= 20
  if (data.riskTolerance === 'aggressive') score += 20

  if (data.assets && data.assets.length > 0) {
    const concentration = 100 / data.assets.length
    if (concentration > 20) score += 10 // Concentration risk
  }

  return Math.max(10, Math.min(90, score))
}
