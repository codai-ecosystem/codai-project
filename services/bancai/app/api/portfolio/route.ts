import { NextRequest, NextResponse } from 'next/server';

// Mock database - in production, this would connect to your financial data provider
const mockPortfolioData = {
  id: 'portfolio-1',
  userId: 'user-123',
  name: 'AI-Optimized Growth Portfolio',
  totalValue: 125840.5,
  dayChange: 2341.25,
  dayChangePercent: 1.89,
  totalReturn: 25840.5,
  totalReturnPercent: 25.84,
  riskScore: 7.2,
  diversificationScore: 8.5,
  holdings: [
    {
      id: 'hold-1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 50,
      currentPrice: 185.42,
      totalValue: 9271.0,
      dayChange: 123.5,
      dayChangePercent: 1.35,
      allocationPercent: 7.36,
      sector: 'Technology',
      assetType: 'stock',
    },
    {
      id: 'hold-2',
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      shares: 25,
      currentPrice: 485.2,
      totalValue: 12130.0,
      dayChange: 582.75,
      dayChangePercent: 5.05,
      allocationPercent: 9.64,
      sector: 'Technology',
      assetType: 'stock',
    },
    {
      id: 'hold-3',
      symbol: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      shares: 200,
      currentPrice: 245.8,
      totalValue: 49160.0,
      dayChange: 492.0,
      dayChangePercent: 1.01,
      allocationPercent: 39.06,
      sector: 'Diversified',
      assetType: 'etf',
    },
    {
      id: 'hold-4',
      symbol: 'BTC',
      name: 'Bitcoin',
      shares: 0.5,
      currentPrice: 67890.0,
      totalValue: 33945.0,
      dayChange: 1698.25,
      dayChangePercent: 5.26,
      allocationPercent: 26.98,
      sector: 'Cryptocurrency',
      assetType: 'crypto',
    },
  ],
  performance: {
    oneDay: 1.89,
    oneWeek: 3.24,
    oneMonth: 8.12,
    threeMonth: 12.45,
    sixMonth: 18.76,
    oneYear: 25.84,
    inception: 25.84,
  },
  allocation: {
    stocks: 55.4,
    etfs: 39.1,
    crypto: 27.0,
    bonds: 0.0,
    cash: 5.5,
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const portfolioId = searchParams.get('portfolioId');

    // Simulate authentication check
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    // Simulate database lookup
    if (portfolioId && portfolioId !== mockPortfolioData.id) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Add some real-time price variations
    const portfolioWithUpdates = {
      ...mockPortfolioData,
      holdings: mockPortfolioData.holdings.map(holding => ({
        ...holding,
        currentPrice: holding.currentPrice + (Math.random() - 0.5) * 2,
        dayChange: holding.dayChange + (Math.random() - 0.5) * 50,
        dayChangePercent: holding.dayChangePercent + (Math.random() - 0.5) * 1,
      })),
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: portfolioWithUpdates,
    });
  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, symbol, quantity, price, orderType } = body;

    // Simulate authentication check
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    // Validate required fields
    if (!action || !symbol || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields: action, symbol, quantity' },
        { status: 400 }
      );
    }

    // Simulate order processing
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Mock order response
    const orderResponse = {
      orderId,
      userId,
      symbol,
      action,
      quantity,
      orderType: orderType || 'market',
      price: price || null,
      status: 'pending',
      timestamp,
      estimatedTotal: quantity * (price || 185.42), // Use current market price if no price specified
      message: `${action.toUpperCase()} order for ${quantity} shares of ${symbol} has been placed`,
    };

    // Simulate order execution delay
    setTimeout(() => {
      console.log(`Order ${orderId} executed successfully`);
    }, 2000);

    return NextResponse.json({
      success: true,
      data: orderResponse,
    });
  } catch (error) {
    console.error('Portfolio POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, portfolioId, rebalanceStrategy } = body;

    // Simulate authentication check
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    // Simulate rebalancing
    const rebalanceResult = {
      portfolioId,
      strategy: rebalanceStrategy || 'target_allocation',
      status: 'completed',
      trades: [
        {
          symbol: 'AAPL',
          action: 'sell',
          quantity: 10,
          reason: 'Reduce overweight position',
        },
        {
          symbol: 'VTI',
          action: 'buy',
          quantity: 20,
          reason: 'Increase diversification',
        },
      ],
      timestamp: new Date().toISOString(),
      message: 'Portfolio rebalancing completed successfully',
    };

    return NextResponse.json({
      success: true,
      data: rebalanceResult,
    });
  } catch (error) {
    console.error('Portfolio PUT API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
