import { NextRequest, NextResponse } from 'next/server';

// Mock market data - in production, this would connect to real market data providers
const mockMarketData = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 185.42,
    change: 2.34,
    changePercent: 1.28,
    volume: 45678923,
    marketCap: 2854000000000,
    bid: 185.4,
    ask: 185.44,
    spread: 0.04,
    dayHigh: 186.12,
    dayLow: 183.45,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 164.08,
    pe: 28.5,
    eps: 6.51,
    dividend: 0.24,
    dividendYield: 0.52,
    beta: 1.24,
    lastUpdate: new Date().toISOString(),
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 485.2,
    change: 12.45,
    changePercent: 2.63,
    volume: 78234567,
    marketCap: 1200000000000,
    bid: 485.15,
    ask: 485.25,
    spread: 0.1,
    dayHigh: 487.8,
    dayLow: 480.2,
    fiftyTwoWeekHigh: 502.66,
    fiftyTwoWeekLow: 180.96,
    pe: 65.2,
    eps: 7.44,
    dividend: 0.16,
    dividendYield: 0.033,
    beta: 1.68,
    lastUpdate: new Date().toISOString(),
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 242.68,
    change: -3.21,
    changePercent: -1.31,
    volume: 34567890,
    marketCap: 775000000000,
    bid: 242.65,
    ask: 242.7,
    spread: 0.05,
    dayHigh: 246.5,
    dayLow: 241.8,
    fiftyTwoWeekHigh: 299.29,
    fiftyTwoWeekLow: 138.8,
    pe: 45.8,
    eps: 5.3,
    dividend: 0.0,
    dividendYield: 0.0,
    beta: 2.34,
    lastUpdate: new Date().toISOString(),
  },
  VTI: {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    price: 245.8,
    change: 2.1,
    changePercent: 0.86,
    volume: 2456789,
    marketCap: 0, // ETF doesn't have market cap
    bid: 245.78,
    ask: 245.82,
    spread: 0.04,
    dayHigh: 246.2,
    dayLow: 244.5,
    fiftyTwoWeekHigh: 252.8,
    fiftyTwoWeekLow: 195.0,
    pe: 0,
    eps: 0,
    dividend: 0.82,
    dividendYield: 1.33,
    beta: 1.0,
    lastUpdate: new Date().toISOString(),
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67890.0,
    change: 1698.25,
    changePercent: 2.57,
    volume: 28567834,
    marketCap: 1340000000000,
    bid: 67885.0,
    ask: 67895.0,
    spread: 10.0,
    dayHigh: 68950.0,
    dayLow: 66200.0,
    fiftyTwoWeekHigh: 73750.07,
    fiftyTwoWeekLow: 15460.0,
    pe: 0,
    eps: 0,
    dividend: 0,
    dividendYield: 0,
    beta: 0, // Crypto doesn't have beta relative to stock market
    lastUpdate: new Date().toISOString(),
  },
};

const mockOrderBook = {
  AAPL: {
    bids: [
      { price: 185.4, quantity: 250, total: 46350 },
      { price: 185.39, quantity: 180, total: 33370.2 },
      { price: 185.38, quantity: 320, total: 59321.6 },
      { price: 185.37, quantity: 150, total: 27805.5 },
      { price: 185.36, quantity: 400, total: 74144 },
    ],
    asks: [
      { price: 185.44, quantity: 200, total: 37088 },
      { price: 185.45, quantity: 175, total: 32453.75 },
      { price: 185.46, quantity: 300, total: 55638 },
      { price: 185.47, quantity: 125, total: 23183.75 },
      { price: 185.48, quantity: 350, total: 64918 },
    ],
  },
  NVDA: {
    bids: [
      { price: 485.15, quantity: 150, total: 72772.5 },
      { price: 485.1, quantity: 200, total: 97020 },
      { price: 485.05, quantity: 300, total: 145515 },
      { price: 485.0, quantity: 250, total: 121250 },
      { price: 484.95, quantity: 400, total: 193980 },
    ],
    asks: [
      { price: 485.25, quantity: 180, total: 87345 },
      { price: 485.3, quantity: 220, total: 106766 },
      { price: 485.35, quantity: 160, total: 77656 },
      { price: 485.4, quantity: 300, total: 145620 },
      { price: 485.45, quantity: 275, total: 133498.75 },
    ],
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const symbols = searchParams.get('symbols')?.split(',');
    const includeOrderBook = searchParams.get('includeOrderBook') === 'true';

    let data;

    if (symbol) {
      // Single symbol request
      const symbolData =
        mockMarketData[symbol.toUpperCase() as keyof typeof mockMarketData];
      if (!symbolData) {
        return NextResponse.json(
          { error: `Symbol ${symbol} not found` },
          { status: 404 }
        );
      }

      // Add some real-time price variation
      const updatedData = {
        ...symbolData,
        price: symbolData.price + (Math.random() - 0.5) * 2,
        change: symbolData.change + (Math.random() - 0.5) * 0.5,
        lastUpdate: new Date().toISOString(),
      };

      data = updatedData;

      // Include order book if requested
      if (
        includeOrderBook &&
        mockOrderBook[symbol.toUpperCase() as keyof typeof mockOrderBook]
      ) {
        data = {
          ...data,
          orderBook:
            mockOrderBook[symbol.toUpperCase() as keyof typeof mockOrderBook],
        };
      }
    } else if (symbols) {
      // Multiple symbols request
      data = symbols
        .map(sym => {
          const symbolData =
            mockMarketData[sym.toUpperCase() as keyof typeof mockMarketData];
          if (!symbolData) return null;

          return {
            ...symbolData,
            price: symbolData.price + (Math.random() - 0.5) * 2,
            change: symbolData.change + (Math.random() - 0.5) * 0.5,
            lastUpdate: new Date().toISOString(),
          };
        })
        .filter(Boolean);
    } else {
      // All symbols request
      data = Object.values(mockMarketData).map(symbolData => ({
        ...symbolData,
        price: symbolData.price + (Math.random() - 0.5) * 2,
        change: symbolData.change + (Math.random() - 0.5) * 0.5,
        lastUpdate: new Date().toISOString(),
      }));
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols, preferences } = body;

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      );
    }

    // Simulate creating a watchlist or subscription
    const watchlistId = `watchlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const watchlist = {
      id: watchlistId,
      symbols,
      preferences: preferences || {
        realTimeUpdates: true,
        priceAlerts: true,
        newsAlerts: false,
      },
      created: new Date().toISOString(),
      status: 'active',
    };

    return NextResponse.json({
      success: true,
      data: watchlist,
      message: 'Watchlist created successfully',
    });
  } catch (error) {
    console.error('Market data POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
