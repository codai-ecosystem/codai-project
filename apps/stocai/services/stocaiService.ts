// StocAI Service - AI Stock Trading Platform Service Layer

// StocAI-specific types for stock trading platform
export interface Stock {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  pe: number
  eps: number
  dividend: number
  yield: number
  sector: string
  industry: string
  exchange: string
  currency: string
  lastUpdated: Date
  aiScore: number
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
}

export interface Portfolio {
  id: string
  userId: string
  name: string
  positions: Position[]
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  cash: number
  createdAt: Date
  updatedAt: Date
}

export interface Position {
  id: string
  portfolioId: string
  symbol: string
  shares: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
  lastUpdated: Date
}

export interface TradingOrder {
  id: string
  userId: string
  portfolioId: string
  symbol: string
  type: 'market' | 'limit' | 'stop' | 'stop_limit'
  side: 'buy' | 'sell'
  quantity: number
  price?: number
  stopPrice?: number
  status: 'pending' | 'filled' | 'cancelled' | 'rejected'
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok'
  createdAt: Date
  filledAt?: Date
  filledPrice?: number
  filledQuantity?: number
}

export interface MarketAnalysis {
  date: Date
  marketSentiment: 'extremely_bearish' | 'bearish' | 'neutral' | 'bullish' | 'extremely_bullish'
  vixLevel: number
  sectorPerformance: SectorPerformance[]
  marketTrends: MarketTrend[]
  aiInsights: string[]
  predictions: MarketPrediction[]
}

export interface SectorPerformance {
  sector: string
  change: number
  changePercent: number
  volume: number
  marketCap: number
  topPerformers: string[]
  worstPerformers: string[]
}

export interface MarketTrend {
  trend: string
  strength: number
  duration: string
  probability: number
  description: string
  impact: 'positive' | 'negative' | 'neutral'
}

export interface MarketPrediction {
  timeframe: '1d' | '1w' | '1m' | '3m' | '6m' | '1y'
  prediction: string
  confidence: number
  factors: string[]
  targetRange: { min: number; max: number }
}

export interface TradingSignal {
  id: string
  symbol: string
  type: 'buy' | 'sell' | 'hold'
  strength: number
  confidence: number
  reasoning: string[]
  technicalIndicators: TechnicalIndicator[]
  priceTarget: number
  stopLoss: number
  timeframe: string
  createdAt: Date
  expiresAt: Date
}

export interface TechnicalIndicator {
  name: string
  value: number
  signal: 'bullish' | 'bearish' | 'neutral'
  description: string
}

export interface StockNews {
  id: string
  title: string
  summary: string
  content: string
  source: string
  author: string
  publishedAt: Date
  symbols: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  impact: 'high' | 'medium' | 'low'
  url: string
}

export interface Watchlist {
  id: string
  userId: string
  name: string
  stocks: string[]
  alerts: PriceAlert[]
  createdAt: Date
  updatedAt: Date
}

export interface PriceAlert {
  id: string
  symbol: string
  condition: 'above' | 'below' | 'change_percent'
  targetValue: number
  isActive: boolean
  triggered: boolean
  triggeredAt?: Date
  createdAt: Date
}

// Mock data for development
const mockStocks: Stock[] = [
  {
    id: 'stock-001',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 185.92,
    change: 2.34,
    changePercent: 1.28,
    volume: 45234567,
    marketCap: 2890000000000,
    pe: 28.5,
    eps: 6.52,
    dividend: 0.24,
    yield: 0.52,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    exchange: 'NASDAQ',
    currency: 'USD',
    lastUpdated: new Date(),
    aiScore: 8.7,
    riskLevel: 'medium',
    recommendation: 'buy'
  },
  {
    id: 'stock-002',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 421.56,
    change: -1.23,
    changePercent: -0.29,
    volume: 23456789,
    marketCap: 3130000000000,
    pe: 32.1,
    eps: 13.14,
    dividend: 0.75,
    yield: 0.71,
    sector: 'Technology',
    industry: 'Software',
    exchange: 'NASDAQ',
    currency: 'USD',
    lastUpdated: new Date(),
    aiScore: 9.1,
    riskLevel: 'low',
    recommendation: 'strong_buy'
  },
  {
    id: 'stock-003',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.32,
    change: 23.45,
    changePercent: 2.75,
    volume: 67890123,
    marketCap: 2160000000000,
    pe: 65.8,
    eps: 13.31,
    dividend: 0.16,
    yield: 0.02,
    sector: 'Technology',
    industry: 'Semiconductors',
    exchange: 'NASDAQ',
    currency: 'USD',
    lastUpdated: new Date(),
    aiScore: 9.4,
    riskLevel: 'high',
    recommendation: 'strong_buy'
  }
]

const mockPortfolio: Portfolio = {
  id: 'portfolio-001',
  userId: 'user-001',
  name: 'Main Portfolio',
  positions: [
    {
      id: 'pos-001',
      portfolioId: 'portfolio-001',
      symbol: 'AAPL',
      shares: 50,
      averagePrice: 180.00,
      currentPrice: 185.92,
      totalValue: 9296.00,
      gainLoss: 296.00,
      gainLossPercent: 3.29,
      lastUpdated: new Date()
    },
    {
      id: 'pos-002',
      portfolioId: 'portfolio-001',
      symbol: 'MSFT',
      shares: 25,
      averagePrice: 400.00,
      currentPrice: 421.56,
      totalValue: 10539.00,
      gainLoss: 539.00,
      gainLossPercent: 5.39,
      lastUpdated: new Date()
    }
  ],
  totalValue: 29835.00,
  totalGainLoss: 835.00,
  totalGainLossPercent: 2.88,
  cash: 10000.00,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date()
}

const mockTradingSignals: TradingSignal[] = [
  {
    id: 'signal-001',
    symbol: 'AAPL',
    type: 'buy',
    strength: 8.5,
    confidence: 0.87,
    reasoning: [
      'Strong Q4 earnings momentum',
      'AI integration driving growth',
      'Technical breakout above resistance'
    ],
    technicalIndicators: [
      {
        name: 'RSI',
        value: 65.4,
        signal: 'bullish',
        description: 'RSI showing strong momentum without being overbought'
      },
      {
        name: 'MACD',
        value: 2.34,
        signal: 'bullish',
        description: 'MACD line crossing above signal line'
      }
    ],
    priceTarget: 195.00,
    stopLoss: 175.00,
    timeframe: '1-3 months',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
]

export class StocAIService {
  private static instance: StocAIService

  static getInstance(): StocAIService {
    if (!StocAIService.instance) {
      StocAIService.instance = new StocAIService()
    }
    return StocAIService.instance
  }

  private constructor() { }

  // Stock Data
  async getStock(symbol: string): Promise<Stock | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockStocks.find(stock => stock.symbol === symbol) || null
  }

  async getStocks(symbols?: string[]): Promise<Stock[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    if (symbols && symbols.length > 0) {
      return mockStocks.filter(stock => symbols.includes(stock.symbol))
    }
    return mockStocks
  }

  async searchStocks(query: string): Promise<Stock[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const lowerQuery = query.toLowerCase()
    return mockStocks.filter(stock =>
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.name.toLowerCase().includes(lowerQuery)
    )
  }

  async getTopPerformers(limit = 10): Promise<Stock[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return [...mockStocks]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, limit)
  }

  async getTopLosers(limit = 10): Promise<Stock[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return [...mockStocks]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, limit)
  }

  // Portfolio Management
  async getPortfolio(userId: string): Promise<Portfolio | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockPortfolio
  }

  async getPositions(portfolioId: string): Promise<Position[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockPortfolio.positions
  }

  // Trading Orders
  async createOrder(order: Omit<TradingOrder, 'id' | 'createdAt' | 'status'>): Promise<TradingOrder> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const newOrder: TradingOrder = {
      ...order,
      id: `order-${Date.now()}`,
      status: 'pending',
      createdAt: new Date()
    }

    return newOrder
  }

  async getOrders(userId: string): Promise<TradingOrder[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    return [
      {
        id: 'order-001',
        userId,
        portfolioId: 'portfolio-001',
        symbol: 'AAPL',
        type: 'limit',
        side: 'buy',
        quantity: 10,
        price: 180.00,
        status: 'filled',
        timeInForce: 'day',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        filledAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        filledPrice: 181.50,
        filledQuantity: 10
      }
    ]
  }

  // Market Analysis
  async getMarketAnalysis(): Promise<MarketAnalysis> {
    await new Promise(resolve => setTimeout(resolve, 600))

    return {
      date: new Date(),
      marketSentiment: 'bullish',
      vixLevel: 16.8,
      sectorPerformance: [
        {
          sector: 'Technology',
          change: 15.2,
          changePercent: 1.8,
          volume: 234567890,
          marketCap: 12000000000000,
          topPerformers: ['NVDA', 'MSFT', 'AAPL'],
          worstPerformers: ['META']
        },
        {
          sector: 'Healthcare',
          change: -3.4,
          changePercent: -0.4,
          volume: 123456789,
          marketCap: 8000000000000,
          topPerformers: ['JNJ'],
          worstPerformers: ['PFE', 'MRK']
        }
      ],
      marketTrends: [
        {
          trend: 'AI Revolution Continues',
          strength: 9.2,
          duration: '6-12 months',
          probability: 0.85,
          description: 'AI companies showing sustained growth with strong fundamentals',
          impact: 'positive'
        },
        {
          trend: 'Interest Rate Stabilization',
          strength: 7.5,
          duration: '3-6 months',
          probability: 0.78,
          description: 'Fed likely to pause rate hikes, benefiting growth stocks',
          impact: 'positive'
        }
      ],
      aiInsights: [
        'Technology sector showing strong momentum with AI adoption',
        'Market volatility expected to decrease as earnings season concludes',
        'Quality growth stocks preferred over speculative plays'
      ],
      predictions: [
        {
          timeframe: '1m',
          prediction: 'Continued upward momentum in tech sector',
          confidence: 0.82,
          factors: ['Strong earnings', 'AI adoption', 'Fed pause'],
          targetRange: { min: 5200, max: 5400 }
        }
      ]
    }
  }

  // Trading Signals
  async getTradingSignals(symbols?: string[]): Promise<TradingSignal[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    if (symbols && symbols.length > 0) {
      return mockTradingSignals.filter(signal => symbols.includes(signal.symbol))
    }
    return mockTradingSignals
  }

  // Watchlist Management
  async getWatchlists(userId: string): Promise<Watchlist[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    return [
      {
        id: 'watchlist-001',
        userId,
        name: 'Tech Stocks',
        stocks: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN'],
        alerts: [
          {
            id: 'alert-001',
            symbol: 'AAPL',
            condition: 'above',
            targetValue: 190.00,
            isActive: true,
            triggered: false,
            createdAt: new Date()
          }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      }
    ]
  }

  async createWatchlist(watchlist: Omit<Watchlist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Watchlist> {
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      ...watchlist,
      id: `watchlist-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // News and Research
  async getStockNews(symbol?: string): Promise<StockNews[]> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const mockNews: StockNews[] = [
      {
        id: 'news-001',
        title: 'Apple Reports Strong Q4 Earnings Driven by AI Integration',
        summary: 'Apple exceeded expectations with AI-powered features driving iPhone sales',
        content: 'Apple Inc. reported stronger-than-expected Q4 earnings...',
        source: 'Financial Times',
        author: 'Sarah Johnson',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        symbols: ['AAPL'],
        sentiment: 'positive',
        impact: 'high',
        url: 'https://example.com/news/1'
      },
      {
        id: 'news-002',
        title: 'Microsoft Azure Growth Accelerates in Cloud Computing Race',
        summary: 'Microsoft continues to gain market share in cloud infrastructure',
        content: 'Microsoft Corporation announced record Azure growth...',
        source: 'Reuters',
        author: 'Mike Chen',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        symbols: ['MSFT'],
        sentiment: 'positive',
        impact: 'medium',
        url: 'https://example.com/news/2'
      }
    ]

    if (symbol) {
      return mockNews.filter(news => news.symbols.includes(symbol))
    }

    return mockNews
  }
}

export const stocaiService = StocAIService.getInstance()
