import { NextRequest, NextResponse } from 'next/server'

interface InvestmentProfile {
  investor: {
    age: number
    income: number
    netWorth: number
    investmentExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    riskTolerance: 'conservative' | 'moderate' | 'aggressive' | 'very_aggressive'
    investmentHorizon: number // years
    liquidityNeeds: 'low' | 'medium' | 'high'
  }
  goals: {
    primary: 'retirement' | 'wealth_building' | 'income' | 'preservation' | 'education' | 'emergency'
    timeframe: number // years
    targetAmount?: number
    priority: 'high' | 'medium' | 'low'
  }[]
  currentPortfolio: {
    cash: number
    stocks: number
    bonds: number
    realEstate: number
    alternatives: number
    crypto?: number
  }
  preferences: {
    esgInvesting: boolean
    internationalExposure: boolean
    activeTradingInterest: boolean
    taxOptimization: boolean
    dividendFocus: boolean
  }
}

interface MarketData {
  sp500: { price: number; change: number }
  nasdaq: { price: number; change: number }
  bonds: { yield: number; change: number }
  gold: { price: number; change: number }
  vix: number
}

export async function POST(request: NextRequest) {
  try {
    const profile: InvestmentProfile = await request.json()

    if (!profile.investor || !profile.goals || !profile.currentPortfolio) {
      return NextResponse.json(
        { error: 'Complete investment profile is required' },
        { status: 400 }
      )
    }

    // Generate investment advisory
    const advisory = await generateInvestmentAdvisory(profile)

    return NextResponse.json(advisory, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Investment advisory generation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return market overview and general investment insights
    const marketOverview = await getMarketOverview()
    return NextResponse.json(marketOverview, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Market overview retrieval failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function generateInvestmentAdvisory(profile: InvestmentProfile) {
  // Calculate current allocation
  const totalPortfolio = Object.values(profile.currentPortfolio).reduce((sum, value) => sum + value, 0)
  const currentAllocation = calculateAllocationPercentages(profile.currentPortfolio, totalPortfolio)

  // Generate recommended allocation
  const recommendedAllocation = generateRecommendedAllocation(profile)

  // Calculate rebalancing needs
  const rebalancing = calculateRebalancing(currentAllocation, recommendedAllocation, totalPortfolio)

  // Generate investment recommendations
  const recommendations = generateInvestmentRecommendations(profile, recommendedAllocation)

  // Risk assessment
  const riskAssessment = assessInvestmentRisk(profile, recommendedAllocation)

  try {
    // Try to enhance with AI insights
    const aiEnhancedAdvisory = await enhanceWithAI(profile, {
      currentAllocation,
      recommendedAllocation,
      rebalancing,
      recommendations,
      riskAssessment
    })
    return aiEnhancedAdvisory
  } catch (error) {
    // Fallback to rule-based advisory
    return {
      profileSummary: generateProfileSummary(profile),
      currentAllocation,
      recommendedAllocation,
      rebalancing,
      recommendations,
      riskAssessment,
      marketContext: await getMarketContext(),
      actionPlan: generateActionPlan(rebalancing, recommendations),
      monitoring: generateMonitoringPlan(profile),
      timestamp: new Date().toISOString(),
      advisoryType: 'rule_based'
    }
  }
}

async function enhanceWithAI(profile: InvestmentProfile, baseAdvisory: any) {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || process.env.AZURE_AI_FOUNDRY_ENDPOINT
  const azureApiKey = process.env.AZURE_OPENAI_KEY || process.env.AZURE_AI_FOUNDRY_KEY
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview'

  if (!azureEndpoint || !azureApiKey) {
    throw new Error('Azure OpenAI credentials not configured')
  }

  const prompt = `As a senior investment advisor with CFA credentials, please review this client profile and provide strategic investment guidance:

Client Profile:
- Age: ${profile.investor.age}
- Income: $${profile.investor.income.toLocaleString()}
- Net Worth: $${profile.investor.netWorth.toLocaleString()}
- Experience: ${profile.investor.investmentExperience}
- Risk Tolerance: ${profile.investor.riskTolerance}
- Investment Horizon: ${profile.investor.investmentHorizon} years

Primary Goals:
${profile.goals.map(goal => `- ${goal.primary}: ${goal.timeframe} years, ${goal.priority} priority`).join('\n')}

Current Portfolio Allocation:
${Object.entries(baseAdvisory.currentAllocation).map(([asset, pct]) => `- ${asset}: ${pct}%`).join('\n')}

Recommended Allocation:
${Object.entries(baseAdvisory.recommendedAllocation).map(([asset, pct]) => `- ${asset}: ${pct}%`).join('\n')}

Current Market Environment: ${await getMarketSentiment()}

Please provide:
1. Strategic assessment of the recommended allocation
2. Market timing considerations
3. Tax optimization strategies
4. Alternative investment opportunities
5. Risk mitigation techniques
6. Timeline for implementation
7. Key performance metrics to monitor`

  const deploymentName = 'gpt-4o'
  const url = `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`

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
          content: 'You are a senior investment advisor with CFA credentials and 15+ years of experience managing portfolios for high-net-worth individuals. Provide detailed, professional investment advice with specific actionable recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      top_p: 0.9,
    }),
  })

  if (!response.ok) {
    throw new Error(`Azure OpenAI API error: ${response.status}`)
  }

  const aiResponse = await response.json()
  const aiAnalysis = aiResponse.choices[0]?.message?.content || ''

  return {
    ...baseAdvisory,
    aiStrategicAnalysis: aiAnalysis,
    enhancedRecommendations: extractInvestmentRecommendations(aiAnalysis),
    strategicInsights: extractStrategicInsights(aiAnalysis),
    advisoryType: 'ai_enhanced',
    metadata: {
      tokens_used: aiResponse.usage?.total_tokens || 0,
      deployment: deploymentName
    }
  }
}

function calculateAllocationPercentages(portfolio: any, total: number) {
  const allocation: { [key: string]: number } = {}
  for (const [asset, value] of Object.entries(portfolio)) {
    allocation[asset] = total > 0 ? Number(((value as number / total) * 100).toFixed(1)) : 0
  }
  return allocation
}

function generateRecommendedAllocation(profile: InvestmentProfile) {
  const age = profile.investor.age
  const riskTolerance = profile.investor.riskTolerance
  const horizon = profile.investor.investmentHorizon

  // Base allocation using age-based rule (100 - age = stock allocation)
  let stockAllocation = Math.min(90, Math.max(20, 100 - age))
  let bondAllocation = 100 - stockAllocation

  // Adjust for risk tolerance
  switch (riskTolerance) {
    case 'conservative':
      stockAllocation = Math.max(20, stockAllocation - 20)
      break
    case 'moderate':
      // Keep base allocation
      break
    case 'aggressive':
      stockAllocation = Math.min(90, stockAllocation + 15)
      break
    case 'very_aggressive':
      stockAllocation = Math.min(95, stockAllocation + 25)
      break
  }

  // Adjust for investment horizon
  if (horizon > 20) {
    stockAllocation = Math.min(95, stockAllocation + 10)
  } else if (horizon < 5) {
    stockAllocation = Math.max(20, stockAllocation - 15)
  }

  bondAllocation = 100 - stockAllocation

  // Break down stocks and add alternatives
  const domesticStocks = Math.round(stockAllocation * 0.7)
  const internationalStocks = Math.round(stockAllocation * 0.3)
  const bonds = Math.round(bondAllocation * 0.8)
  const cash = Math.min(10, Math.round(bondAllocation * 0.2))
  const realEstate = profile.investor.netWorth > 100000 ? 5 : 0
  const alternatives = profile.investor.netWorth > 500000 && riskTolerance !== 'conservative' ? 5 : 0

  // Adjust if total doesn't equal 100
  const total = domesticStocks + internationalStocks + bonds + cash + realEstate + alternatives
  const adjustment = 100 - total

  return {
    domesticStocks: domesticStocks + Math.round(adjustment * 0.5),
    internationalStocks: internationalStocks + Math.round(adjustment * 0.3),
    bonds: bonds + Math.round(adjustment * 0.2),
    cash,
    realEstate,
    alternatives
  }
}

function calculateRebalancing(current: any, recommended: any, totalValue: number) {
  const rebalancing = []
  const threshold = 5 // 5% threshold for rebalancing

  for (const [asset, recommendedPct] of Object.entries(recommended)) {
    const currentPct = current[asset] || 0
    const difference = (recommendedPct as number) - currentPct

    if (Math.abs(difference) > threshold) {
      const dollarAmount = (difference / 100) * totalValue
      rebalancing.push({
        asset,
        currentPct,
        recommendedPct,
        difference,
        action: difference > 0 ? 'buy' : 'sell',
        amount: Math.abs(dollarAmount)
      })
    }
  }

  return rebalancing
}

function generateInvestmentRecommendations(profile: InvestmentProfile, allocation: any) {
  const recommendations = []

  // Specific fund/ETF recommendations based on allocation
  if (allocation.domesticStocks > 0) {
    recommendations.push({
      category: 'Domestic Stocks',
      allocation: allocation.domesticStocks,
      instruments: [
        { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', reason: 'Broad market exposure, low fees' },
        { symbol: 'SPY', name: 'SPDR S&P 500 ETF', reason: 'Large-cap exposure, high liquidity' },
        { symbol: 'QQQ', name: 'Invesco QQQ Trust', reason: 'Technology growth exposure' }
      ]
    })
  }

  if (allocation.internationalStocks > 0) {
    recommendations.push({
      category: 'International Stocks',
      allocation: allocation.internationalStocks,
      instruments: [
        { symbol: 'VTIAX', name: 'Vanguard Total International Stock Index', reason: 'Global diversification' },
        { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', reason: 'Developed market exposure' },
        { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', reason: 'Emerging market growth' }
      ]
    })
  }

  if (allocation.bonds > 0) {
    recommendations.push({
      category: 'Bonds',
      allocation: allocation.bonds,
      instruments: [
        { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', reason: 'Broad bond exposure' },
        { symbol: 'VGIT', name: 'Vanguard Intermediate-Term Treasury ETF', reason: 'Government bond stability' },
        { symbol: 'TIP', name: 'iShares TIPS Bond ETF', reason: 'Inflation protection' }
      ]
    })
  }

  if (allocation.realEstate > 0) {
    recommendations.push({
      category: 'Real Estate',
      allocation: allocation.realEstate,
      instruments: [
        { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', reason: 'REIT diversification' },
        { symbol: 'SCHH', name: 'Schwab US REIT ETF', reason: 'Low-cost real estate exposure' }
      ]
    })
  }

  return recommendations
}

function assessInvestmentRisk(profile: InvestmentProfile, allocation: any) {
  const stockAllocation = (allocation.domesticStocks || 0) + (allocation.internationalStocks || 0)
  const volatilityAssets = stockAllocation + (allocation.alternatives || 0)

  let riskLevel = 'moderate'
  if (volatilityAssets > 80) riskLevel = 'high'
  else if (volatilityAssets < 40) riskLevel = 'low'

  const riskFactors = []
  if (stockAllocation > 90) riskFactors.push('Very high equity exposure')
  if (allocation.alternatives > 10) riskFactors.push('Significant alternative investments')
  if (profile.investor.investmentHorizon < 5) riskFactors.push('Short investment horizon')
  if (profile.investor.liquidityNeeds === 'high') riskFactors.push('High liquidity requirements')

  return {
    level: riskLevel,
    score: Math.round(volatilityAssets / 10), // 1-10 scale
    factors: riskFactors,
    mitigation: generateRiskMitigation(riskFactors, profile)
  }
}

function generateRiskMitigation(riskFactors: string[], profile: InvestmentProfile) {
  const mitigation = []

  if (riskFactors.includes('Very high equity exposure')) {
    mitigation.push('Consider increasing bond allocation for stability')
    mitigation.push('Implement systematic rebalancing to manage volatility')
  }

  if (riskFactors.includes('Short investment horizon')) {
    mitigation.push('Increase cash and short-term bond allocation')
    mitigation.push('Avoid volatile growth investments')
  }

  if (riskFactors.includes('High liquidity requirements')) {
    mitigation.push('Maintain higher cash reserves')
    mitigation.push('Focus on liquid ETFs and avoid illiquid alternatives')
  }

  mitigation.push('Regular portfolio review and rebalancing')
  mitigation.push('Dollar-cost averaging for new investments')

  return mitigation
}

function generateProfileSummary(profile: InvestmentProfile) {
  const primaryGoal = profile.goals.find(g => g.priority === 'high') || profile.goals[0]
  const totalPortfolio = Object.values(profile.currentPortfolio).reduce((sum, value) => sum + value, 0)

  return {
    investorType: determineInvestorType(profile),
    primaryGoal: primaryGoal.primary,
    timeHorizon: primaryGoal.timeframe,
    currentPortfolioValue: totalPortfolio,
    riskProfile: `${profile.investor.riskTolerance} (${profile.investor.investmentExperience} experience)`,
    keyCharacteristics: extractKeyCharacteristics(profile)
  }
}

function determineInvestorType(profile: InvestmentProfile): string {
  const age = profile.investor.age
  const experience = profile.investor.investmentExperience
  const riskTolerance = profile.investor.riskTolerance

  if (age < 35 && riskTolerance === 'aggressive') return 'Growth-Oriented Young Investor'
  if (age > 55 && riskTolerance === 'conservative') return 'Conservative Pre-Retiree'
  if (experience === 'expert' && riskTolerance === 'very_aggressive') return 'Sophisticated Active Investor'
  if (profile.goals.some(g => g.primary === 'income')) return 'Income-Focused Investor'
  if (profile.goals.some(g => g.primary === 'retirement')) return 'Retirement-Focused Investor'

  return 'Balanced Long-Term Investor'
}

function extractKeyCharacteristics(profile: InvestmentProfile): string[] {
  const characteristics = []

  if (profile.preferences.esgInvesting) characteristics.push('ESG-focused investing')
  if (profile.preferences.dividendFocus) characteristics.push('Dividend income preference')
  if (profile.preferences.taxOptimization) characteristics.push('Tax optimization priority')
  if (profile.preferences.internationalExposure) characteristics.push('Global diversification interest')
  if (profile.investor.liquidityNeeds === 'low') characteristics.push('Long-term commitment capability')

  return characteristics
}

async function getMarketOverview() {
  // Mock market data - in production, this would fetch real market data
  const marketData: MarketData = {
    sp500: { price: 4200, change: 0.5 },
    nasdaq: { price: 13000, change: 0.8 },
    bonds: { yield: 4.2, change: -0.1 },
    gold: { price: 2000, change: -0.3 },
    vix: 18.5
  }

  return {
    marketData,
    sentiment: await getMarketSentiment(),
    keyTrends: [
      'Technology sector showing strong momentum',
      'Bond yields stabilizing after recent volatility',
      'International markets presenting value opportunities',
      'Inflation concerns moderating'
    ],
    outlook: 'Cautiously optimistic with selective opportunities',
    timestamp: new Date().toISOString()
  }
}

async function getMarketContext() {
  return {
    environment: 'Mixed signals with selective opportunities',
    keyDrivers: ['Federal Reserve policy', 'Inflation trends', 'Corporate earnings', 'Geopolitical events'],
    opportunities: ['Value stocks', 'International diversification', 'Fixed income normalization'],
    risks: ['Interest rate volatility', 'Economic uncertainty', 'Market concentration']
  }
}

async function getMarketSentiment(): Promise<string> {
  // In production, this would analyze real market sentiment indicators
  const sentiments = ['Cautiously Optimistic', 'Neutral', 'Risk-On', 'Risk-Off', 'Uncertainty']
  return sentiments[Math.floor(Math.random() * sentiments.length)]
}

function generateActionPlan(rebalancing: any[], recommendations: any[]) {
  const actions = []

  // Immediate actions
  if (rebalancing.length > 0) {
    actions.push({
      priority: 'immediate',
      action: 'Portfolio Rebalancing',
      description: `Rebalance ${rebalancing.length} asset classes to target allocation`,
      timeline: '1-2 weeks'
    })
  }

  // Short-term actions
  actions.push({
    priority: 'short-term',
    action: 'Investment Implementation',
    description: 'Implement recommended investment selections',
    timeline: '1 month'
  })

  // Ongoing actions
  actions.push({
    priority: 'ongoing',
    action: 'Monitoring and Review',
    description: 'Quarterly portfolio review and annual strategy assessment',
    timeline: 'Quarterly'
  })

  return actions
}

function generateMonitoringPlan(profile: InvestmentProfile) {
  return {
    frequency: 'Monthly review, quarterly rebalancing assessment',
    keyMetrics: [
      'Portfolio performance vs. benchmarks',
      'Asset allocation drift',
      'Dividend income (if applicable)',
      'Tax-loss harvesting opportunities'
    ],
    triggers: [
      'Asset allocation drift > 5%',
      'Life event changes',
      'Market volatility > 25%',
      'Goal timeline changes'
    ],
    nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }
}

function extractInvestmentRecommendations(analysis: string): string[] {
  const lines = analysis.split('\n')
  const recommendations: string[] = []

  for (const line of lines) {
    if (line.includes('recommend') || line.includes('suggest') || line.includes('consider') || line.includes('allocate')) {
      const cleaned = line.replace(/^[•\-\d\.]\s*/, '').trim()
      if (cleaned.length > 15) {
        recommendations.push(cleaned)
      }
    }
  }

  return recommendations.slice(0, 6)
}

function extractStrategicInsights(analysis: string): string[] {
  const insights: string[] = []
  const sections = analysis.split(/\d+\./g)

  for (const section of sections) {
    if (section.trim().length > 50) {
      const insight = section.trim().split('\n')[0]
      if (insight.length > 20) {
        insights.push(insight)
      }
    }
  }

  return insights.slice(0, 5)
}
