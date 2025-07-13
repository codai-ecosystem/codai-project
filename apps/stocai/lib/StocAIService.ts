/**
 * StocAI Service - Stock Market & Investment AI Platform
 * AI-powered stock analysis, portfolio management, and investment insights
 */

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio?: number;
  eps?: number;
  sector: string;
  exchange: string;
  lastUpdated: Date;
}

interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description: string;
  totalValue: number;
  totalReturn: number;
  returnPercent: number;
  holdings: Array<{
    symbol: string;
    quantity: number;
    avgCost: number;
    currentValue: number;
    returnAmount: number;
    returnPercent: number;
    weight: number; // percentage of portfolio
  }>;
  allocation: {
    byStock: Record<string, number>;
    bySector: Record<string, number>;
    byRegion: Record<string, number>;
  };
  riskMetrics: {
    beta: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AIAnalysis {
  id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-1
  targetPrice: number;
  timeHorizon: '1d' | '1w' | '1m' | '3m' | '6m' | '1y';
  reasoning: string[];
  technicalSignals: {
    trend: 'bullish' | 'bearish' | 'neutral';
    momentum: number; // -1 to 1
    support: number;
    resistance: number;
    rsi: number;
    macd: { signal: 'buy' | 'sell' | 'neutral'; value: number };
  };
  fundamentalMetrics: {
    score: number; // 0-100
    factors: Array<{
      name: string;
      value: number;
      weight: number;
      impact: 'positive' | 'negative' | 'neutral';
    }>;
  };
  sentiment: {
    overall: number; // -1 to 1
    news: number;
    social: number;
    analyst: number;
  };
  risks: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  createdAt: Date;
  validUntil: Date;
}

interface MarketAlert {
  id: string;
  userId: string;
  symbol: string;
  type: 'price' | 'volume' | 'news' | 'technical' | 'ai_signal';
  condition: {
    operator: 'above' | 'below' | 'crosses_above' | 'crosses_below';
    value: number;
    timeframe?: string;
  };
  status: 'active' | 'triggered' | 'expired';
  triggeredAt?: Date;
  message: string;
  channels: Array<'email' | 'push' | 'sms'>;
  createdAt: Date;
  expiresAt?: Date;
}

interface WatchList {
  id: string;
  userId: string;
  name: string;
  symbols: string[];
  isPublic: boolean;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

class StocAIService {
  private stocks: Map<string, StockData> = new Map();
  private portfolios: Map<string, Portfolio> = new Map();
  private analyses: Map<string, AIAnalysis> = new Map();
  private alerts: Map<string, MarketAlert> = new Map();
  private watchLists: Map<string, WatchList> = new Map();

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    console.log('📈 Initializing StocAI Service - Stock Market & Investment AI Platform');

    this.createSampleStocks();
    this.createSamplePortfolios();
    this.createSampleAnalyses();
    this.createSampleAlerts();
    this.createSampleWatchLists();

    console.log('✅ StocAI Service initialized successfully');
  }

  private createSampleStocks(): void {
    const sampleStocks = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 189.50,
        change: 2.15,
        changePercent: 1.15,
        volume: 45678901,
        marketCap: 2890000000000,
        peRatio: 28.5,
        eps: 6.64,
        sector: 'Technology',
        exchange: 'NASDAQ'
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 412.30,
        change: -1.85,
        changePercent: -0.45,
        volume: 23456789,
        marketCap: 3060000000000,
        peRatio: 32.1,
        eps: 12.84,
        sector: 'Technology',
        exchange: 'NASDAQ'
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 138.75,
        change: 3.42,
        changePercent: 2.53,
        volume: 34567890,
        marketCap: 1740000000000,
        peRatio: 24.8,
        eps: 5.59,
        sector: 'Technology',
        exchange: 'NASDAQ'
      },
      {
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        price: 245.60,
        change: -8.90,
        changePercent: -3.50,
        volume: 67890123,
        marketCap: 780000000000,
        peRatio: 45.2,
        eps: 5.44,
        sector: 'Consumer Cyclical',
        exchange: 'NASDAQ'
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        price: 456.78,
        change: 12.34,
        changePercent: 2.78,
        volume: 56789012,
        marketCap: 1120000000000,
        peRatio: 65.3,
        eps: 6.99,
        sector: 'Technology',
        exchange: 'NASDAQ'
      }
    ];

    sampleStocks.forEach(stockData => {
      const stock: StockData = {
        ...stockData,
        lastUpdated: new Date()
      };
      this.stocks.set(stock.symbol, stock);
    });
  }

  private createSamplePortfolios(): void {
    const samplePortfolios = [
      {
        id: 'portfolio-001',
        userId: 'user-investor-001',
        name: 'Tech Growth Portfolio',
        description: 'Focused on high-growth technology companies',
        totalValue: 125000,
        totalReturn: 18750,
        returnPercent: 17.65,
        holdings: [
          {
            symbol: 'AAPL',
            quantity: 100,
            avgCost: 165.50,
            currentValue: 18950,
            returnAmount: 2400,
            returnPercent: 14.5,
            weight: 15.16
          },
          {
            symbol: 'MSFT',
            quantity: 75,
            avgCost: 385.20,
            currentValue: 30922.50,
            returnAmount: 2032.50,
            returnPercent: 7.0,
            weight: 24.74
          },
          {
            symbol: 'NVDA',
            quantity: 50,
            avgCost: 420.00,
            currentValue: 22839,
            returnAmount: 1839,
            returnPercent: 8.74,
            weight: 18.27
          }
        ]
      }
    ];

    samplePortfolios.forEach(portfolioData => {
      const portfolio: Portfolio = {
        ...portfolioData,
        allocation: {
          byStock: this.calculateStockAllocation(portfolioData.holdings),
          bySector: { 'Technology': 85.5, 'Consumer Cyclical': 14.5 },
          byRegion: { 'North America': 100 }
        },
        riskMetrics: {
          beta: 1.15,
          volatility: 0.24,
          sharpeRatio: 1.45,
          maxDrawdown: -0.18
        },
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
      this.portfolios.set(portfolio.id, portfolio);
    });
  }

  private calculateStockAllocation(holdings: Portfolio['holdings']): Record<string, number> {
    const allocation: Record<string, number> = {};
    holdings.forEach(holding => {
      allocation[holding.symbol] = holding.weight;
    });
    return allocation;
  }

  private createSampleAnalyses(): void {
    const sampleAnalyses = [
      {
        symbol: 'AAPL',
        type: 'buy' as const,
        confidence: 0.82,
        targetPrice: 205.00,
        timeHorizon: '3m' as const,
        reasoning: [
          'Strong iPhone 16 sales momentum',
          'AI integration driving services growth',
          'Solid balance sheet with $165B cash',
          'Technical breakout above $185 resistance'
        ]
      },
      {
        symbol: 'TSLA',
        type: 'hold' as const,
        confidence: 0.65,
        targetPrice: 260.00,
        timeHorizon: '6m' as const,
        reasoning: [
          'Cybertruck production ramping up',
          'FSD improvements showing progress',
          'High valuation despite growth',
          'Competition intensifying in EV market'
        ]
      },
      {
        symbol: 'NVDA',
        type: 'buy' as const,
        confidence: 0.89,
        targetPrice: 520.00,
        timeHorizon: '1y' as const,
        reasoning: [
          'AI demand remains extremely strong',
          'Data center revenue growing 200%+',
          'New H100 chips outperforming',
          'Minimal competition in high-end AI chips'
        ]
      }
    ];

    sampleAnalyses.forEach((analysisData, index) => {
      const analysis: AIAnalysis = {
        id: `analysis-${Date.now()}-${index}`,
        ...analysisData,
        technicalSignals: {
          trend: analysisData.type === 'buy' ? 'bullish' : analysisData.type === 'hold' ? 'neutral' : 'bearish',
          momentum: analysisData.type === 'buy' ? 0.7 : analysisData.type === 'hold' ? 0.1 : -0.7,
          support: analysisData.targetPrice * 0.9,
          resistance: analysisData.targetPrice * 1.1,
          rsi: Math.random() * 100,
          macd: {
            signal: analysisData.type === 'buy' ? 'buy' : analysisData.type === 'hold' ? 'neutral' : 'sell',
            value: Math.random() * 10 - 5
          }
        },
        fundamentalMetrics: {
          score: analysisData.confidence * 100,
          factors: [
            { name: 'Revenue Growth', value: 0.85, weight: 0.25, impact: 'positive' as const },
            { name: 'Profit Margins', value: 0.72, weight: 0.20, impact: 'positive' as const },
            { name: 'Debt Levels', value: 0.65, weight: 0.15, impact: 'neutral' as const },
            { name: 'Market Position', value: 0.90, weight: 0.40, impact: 'positive' as const }
          ]
        },
        sentiment: {
          overall: analysisData.confidence * (analysisData.type === 'buy' ? 1 : analysisData.type === 'hold' ? 0 : -1),
          news: Math.random() * 2 - 1,
          social: Math.random() * 2 - 1,
          analyst: Math.random() * 2 - 1
        },
        risks: [
          {
            type: 'Market Risk',
            severity: 'medium' as const,
            description: 'General market volatility could impact stock price'
          },
          {
            type: 'Sector Risk',
            severity: 'low' as const,
            description: 'Technology sector regulatory concerns'
          }
        ],
        createdAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      this.analyses.set(analysis.id, analysis);
    });
  }

  private createSampleAlerts(): void {
    const sampleAlerts = [
      {
        id: 'alert-001',
        userId: 'user-investor-001',
        symbol: 'AAPL',
        type: 'price' as const,
        condition: {
          operator: 'above' as const,
          value: 190.00
        },
        status: 'active' as const,
        message: 'AAPL has crossed above $190',
        channels: ['email' as const, 'push' as const]
      },
      {
        id: 'alert-002',
        userId: 'user-investor-001',
        symbol: 'TSLA',
        type: 'ai_signal' as const,
        condition: {
          operator: 'above' as const,
          value: 0.8
        },
        status: 'active' as const,
        message: 'Strong AI buy signal detected for TSLA',
        channels: ['push' as const]
      }
    ];

    sampleAlerts.forEach(alertData => {
      const alert: MarketAlert = {
        ...alertData,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };
      this.alerts.set(alert.id, alert);
    });
  }

  private createSampleWatchLists(): void {
    const sampleWatchLists = [
      {
        id: 'watchlist-001',
        userId: 'user-investor-001',
        name: 'AI & Tech Giants',
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META'],
        isPublic: false,
        description: 'Major technology companies with AI focus',
        tags: ['technology', 'ai', 'large-cap']
      },
      {
        id: 'watchlist-002',
        userId: 'user-investor-001',
        name: 'EV Revolution',
        symbols: ['TSLA', 'RIVN', 'LCID', 'NIO', 'XPEV'],
        isPublic: true,
        description: 'Electric vehicle companies and suppliers',
        tags: ['electric-vehicles', 'growth', 'sustainable']
      }
    ];

    sampleWatchLists.forEach(watchListData => {
      const watchList: WatchList = {
        ...watchListData,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      };
      this.watchLists.set(watchList.id, watchList);
    });
  }

  // Public API Methods

  async getStock(symbol: string): Promise<StockData | undefined> {
    return this.stocks.get(symbol.toUpperCase());
  }

  async searchStocks(query: string, limit: number = 10): Promise<StockData[]> {
    const queryLower = query.toLowerCase();
    return Array.from(this.stocks.values())
      .filter(stock =>
        stock.symbol.toLowerCase().includes(queryLower) ||
        stock.name.toLowerCase().includes(queryLower)
      )
      .slice(0, limit);
  }

  async getPortfolio(portfolioId: string): Promise<Portfolio | undefined> {
    return this.portfolios.get(portfolioId);
  }

  async getUserPortfolios(userId: string): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values())
      .filter(portfolio => portfolio.userId === userId);
  }

  async getAIAnalysis(symbol: string): Promise<AIAnalysis | undefined> {
    return Array.from(this.analyses.values())
      .find(analysis =>
        analysis.symbol === symbol.toUpperCase() &&
        analysis.validUntil > new Date()
      );
  }

  async getMarketOverview(): Promise<{
    indices: Array<{ name: string; value: number; change: number; changePercent: number }>;
    topGainers: StockData[];
    topLosers: StockData[];
    mostActive: StockData[];
    aiRecommendations: AIAnalysis[];
  }> {
    const stocks = Array.from(this.stocks.values());

    return {
      indices: [
        { name: 'S&P 500', value: 4567.89, change: 12.34, changePercent: 0.27 },
        { name: 'NASDAQ', value: 14234.56, change: -23.45, changePercent: -0.16 },
        { name: 'Dow Jones', value: 34567.12, change: 45.67, changePercent: 0.13 }
      ],
      topGainers: stocks
        .filter(s => s.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 5),
      topLosers: stocks
        .filter(s => s.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, 5),
      mostActive: stocks
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 5),
      aiRecommendations: Array.from(this.analyses.values())
        .filter(a => a.validUntil > new Date())
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5)
    };
  }

  async createAlert(alertData: Partial<MarketAlert>): Promise<MarketAlert> {
    const alertId = `alert-${Date.now()}`;

    const alert: MarketAlert = {
      id: alertId,
      userId: alertData.userId!,
      symbol: alertData.symbol!.toUpperCase(),
      type: alertData.type || 'price',
      condition: alertData.condition!,
      status: 'active',
      message: alertData.message || `Alert for ${alertData.symbol}`,
      channels: alertData.channels || ['email'],
      createdAt: new Date(),
      expiresAt: alertData.expiresAt
    };

    this.alerts.set(alertId, alert);
    return alert;
  }

  async getUserAlerts(userId: string): Promise<MarketAlert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createWatchList(watchListData: Partial<WatchList>): Promise<WatchList> {
    const watchListId = `watchlist-${Date.now()}`;

    const watchList: WatchList = {
      id: watchListId,
      userId: watchListData.userId!,
      name: watchListData.name || 'My Watch List',
      symbols: watchListData.symbols || [],
      isPublic: watchListData.isPublic || false,
      description: watchListData.description,
      tags: watchListData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.watchLists.set(watchListId, watchList);
    return watchList;
  }

  async getUserWatchLists(userId: string): Promise<WatchList[]> {
    return Array.from(this.watchLists.values())
      .filter(watchList => watchList.userId === userId);
  }

  async getMarketSentiment(): Promise<{
    overall: { score: number; label: string };
    sectors: Record<string, { score: number; trend: string }>;
    fearGreedIndex: number;
    volatilityIndex: number;
  }> {
    return {
      overall: { score: 0.65, label: 'Bullish' },
      sectors: {
        'Technology': { score: 0.72, trend: 'up' },
        'Healthcare': { score: 0.58, trend: 'stable' },
        'Energy': { score: 0.45, trend: 'down' },
        'Financial': { score: 0.62, trend: 'up' }
      },
      fearGreedIndex: 68, // 0-100, higher = more greed
      volatilityIndex: 18.5 // VIX-like index
    };
  }

  async generatePortfolioAnalysis(portfolioId: string): Promise<{
    performance: {
      returns: { '1d': number; '1w': number; '1m': number; '3m': number; '1y': number };
      benchmark: { '1d': number; '1w': number; '1m': number; '3m': number; '1y': number };
    };
    recommendations: Array<{
      action: 'buy' | 'sell' | 'rebalance';
      symbol?: string;
      reasoning: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    riskAnalysis: {
      score: number; // 0-100, higher = more risk
      factors: string[];
      diversification: number; // 0-1, higher = more diversified
    };
  }> {
    return {
      performance: {
        returns: { '1d': 0.5, '1w': 2.1, '1m': 5.8, '3m': 12.4, '1y': 18.7 },
        benchmark: { '1d': 0.3, '1w': 1.8, '1m': 4.2, '3m': 10.1, '1y': 15.2 }
      },
      recommendations: [
        {
          action: 'rebalance',
          reasoning: 'Technology allocation is 85% - consider diversifying into other sectors',
          priority: 'medium'
        },
        {
          action: 'buy',
          symbol: 'JPM',
          reasoning: 'Add financial sector exposure for better diversification',
          priority: 'low'
        }
      ],
      riskAnalysis: {
        score: 72,
        factors: ['High sector concentration', 'Above-average volatility', 'Strong fundamentals'],
        diversification: 0.35
      }
    };
  }
}

export default StocAIService;
