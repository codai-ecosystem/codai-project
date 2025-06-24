import { NextRequest, NextResponse } from 'next/server';

// Mock AI recommendations and signals
const mockAIRecommendations = [
    {
        id: 'rec-1',
        symbol: 'AAPL',
        signal: 'buy',
        confidence: 0.78,
        reasoning: 'Strong momentum with volume confirmation. Technical indicators suggest continuation of uptrend. AI sentiment analysis shows positive outlook for next earnings.',
        targetPrice: 195.00,
        stopLoss: 180.00,
        timeframe: '1-2 weeks',
        riskReward: 3.2,
        aiScore: 8.5,
        fundamentalScore: 7.8,
        technicalScore: 8.9,
        sentimentScore: 8.2,
        catalysts: ['Earnings beat expected', 'iPhone sales strong', 'Services growth'],
        risks: ['Market volatility', 'Supply chain concerns'],
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'rec-2',
        symbol: 'NVDA',
        signal: 'strong_buy',
        confidence: 0.85,
        reasoning: 'AI sector momentum accelerating. Earnings revision cycle turning positive. Data center demand exceeding expectations.',
        targetPrice: 520.00,
        stopLoss: 470.00,
        timeframe: '2-4 weeks',
        riskReward: 2.3,
        aiScore: 9.2,
        fundamentalScore: 9.5,
        technicalScore: 8.8,
        sentimentScore: 9.0,
        catalysts: ['AI chip demand surge', 'Data center expansion', 'Gaming recovery'],
        risks: ['Regulatory concerns', 'Competition increase'],
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'rec-3',
        symbol: 'TSLA',
        signal: 'hold',
        confidence: 0.65,
        reasoning: 'Mixed signals from technical and fundamental analysis. Waiting for clearer direction before recommending action.',
        targetPrice: 250.00,
        stopLoss: 235.00,
        timeframe: '1-3 weeks',
        riskReward: 1.8,
        aiScore: 6.5,
        fundamentalScore: 6.2,
        technicalScore: 6.8,
        sentimentScore: 6.5,
        catalysts: ['Model Y refresh', 'Charging network expansion'],
        risks: ['Production challenges', 'CEO distraction', 'Competition'],
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'rec-4',
        symbol: 'VTI',
        signal: 'buy',
        confidence: 0.72,
        reasoning: 'Broad market exposure with low fees. Dollar-cost averaging opportunity in current market conditions.',
        targetPrice: 255.00,
        stopLoss: 240.00,
        timeframe: '3-6 months',
        riskReward: 2.1,
        aiScore: 7.8,
        fundamentalScore: 8.0,
        technicalScore: 7.5,
        sentimentScore: 7.9,
        catalysts: ['Diversification benefits', 'Low expense ratio', 'Market recovery'],
        risks: ['Market downturn', 'Economic recession'],
        lastUpdated: new Date().toISOString()
    }
];

const mockPortfolioAnalysis = {
    overallScore: 7.6,
    riskLevel: 'moderate',
    recommendations: [
        {
            type: 'rebalance',
            priority: 'high',
            description: 'Tech sector overweight at 35%, consider reducing to target 25%',
            action: 'Sell 20% of NVDA position and diversify into bonds or international ETFs',
            impact: 'Reduce portfolio risk by 15%'
        },
        {
            type: 'opportunity',
            priority: 'medium',
            description: 'Emerging markets underweight, potential for higher returns',
            action: 'Consider adding 5-10% allocation to emerging market ETF (VWO)',
            impact: 'Increase diversification and growth potential'
        },
        {
            type: 'risk',
            priority: 'medium',
            description: 'High correlation between holdings during market stress',
            action: 'Add defensive assets like REITs or commodities',
            impact: 'Improve portfolio resilience during downturns'
        }
    ],
    marketOutlook: {
        shortTerm: 'neutral',
        mediumTerm: 'bullish',
        longTerm: 'bullish',
        keyFactors: [
            'Federal Reserve policy pivot',
            'Corporate earnings growth',
            'AI technology adoption',
            'Economic indicators improving'
        ]
    },
    sectorAnalysis: {
        technology: { allocation: 35, target: 25, recommendation: 'reduce' },
        healthcare: { allocation: 8, target: 12, recommendation: 'increase' },
        financials: { allocation: 10, target: 15, recommendation: 'increase' },
        energy: { allocation: 0, target: 5, recommendation: 'add' },
        utilities: { allocation: 2, target: 5, recommendation: 'increase' }
    }
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'recommendations' | 'portfolio-analysis' | 'signals'
        const symbol = searchParams.get('symbol');
        const userId = searchParams.get('userId');

        // Simulate authentication check
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 401 }
            );
        }

        let data;

        switch (type) {
            case 'recommendations':
                if (symbol) {
                    data = mockAIRecommendations.filter(rec =>
                        rec.symbol.toLowerCase() === symbol.toLowerCase()
                    );
                } else {
                    data = mockAIRecommendations;
                }
                break;

            case 'portfolio-analysis':
                data = {
                    ...mockPortfolioAnalysis,
                    analysisDate: new Date().toISOString(),
                    portfolioId: searchParams.get('portfolioId') || 'portfolio-1'
                };
                break;

            case 'signals':
                // Real-time trading signals
                data = mockAIRecommendations.map(rec => {
                    // Add some randomness to simulate real-time updates
                    const confidence = Math.max(0.1, Math.min(0.95, rec.confidence + (Math.random() - 0.5) * 0.1));
                    const aiScore = Math.max(1, Math.min(10, rec.aiScore + (Math.random() - 0.5) * 0.5));

                    return {
                        ...rec,
                        confidence,
                        aiScore,
                        lastUpdated: new Date().toISOString(),
                        isActive: confidence > 0.6
                    };
                }).filter(signal => signal.isActive);
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid type parameter. Use: recommendations, portfolio-analysis, or signals' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            data,
            metadata: {
                type,
                timestamp: new Date().toISOString(),
                count: Array.isArray(data) ? data.length : 1
            }
        });

    } catch (error) {
        console.error('AI API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, action, data: requestData } = body;

        // Simulate authentication check
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 401 }
            );
        }

        let response;

        switch (action) {
            case 'analyze-portfolio':
                const { holdings, preferences } = requestData;
                if (!holdings || !Array.isArray(holdings)) {
                    return NextResponse.json(
                        { error: 'Holdings array is required for portfolio analysis' },
                        { status: 400 }
                    );
                }

                // Simulate AI portfolio analysis
                response = {
                    analysisId: `analysis-${Date.now()}`,
                    portfolioScore: 7.8,
                    riskLevel: 'moderate-high',
                    recommendations: [
                        {
                            type: 'diversification',
                            priority: 'high',
                            description: 'Portfolio concentration in top 3 holdings exceeds 60%',
                            suggestedAction: 'Consider reducing largest positions and adding small-cap exposure'
                        }
                    ],
                    timestamp: new Date().toISOString()
                };
                break;

            case 'generate-signals':
                const { symbols, timeframe } = requestData;
                if (!symbols || !Array.isArray(symbols)) {
                    return NextResponse.json(
                        { error: 'Symbols array is required for signal generation' },
                        { status: 400 }
                    );
                }

                // Simulate AI signal generation
                response = {
                    signalId: `signals-${Date.now()}`,
                    symbols,
                    timeframe: timeframe || '1D',
                    signals: symbols.map((symbol: string) => ({
                        symbol,
                        signal: ['buy', 'sell', 'hold'][Math.floor(Math.random() * 3)],
                        confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
                        reasoning: `AI analysis suggests ${symbol} shows strong momentum indicators`,
                        timestamp: new Date().toISOString()
                    }))
                };
                break;

            case 'update-preferences':
                const { preferences: newPreferences } = requestData;

                response = {
                    userId,
                    preferences: newPreferences,
                    updated: new Date().toISOString(),
                    message: 'AI preferences updated successfully'
                };
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: analyze-portfolio, generate-signals, or update-preferences' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('AI POST API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
