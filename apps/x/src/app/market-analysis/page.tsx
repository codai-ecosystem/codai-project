'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  LineChart,
  CandlestickChart,
  TrendingUp,
  TrendingDown,
  Globe,
  DollarSign,
  Activity,
  AlertCircle,
  Eye,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Clock,
  Target,
  Zap,
  Gauge,
  PieChart,
  AreaChart,
  Monitor,
  Wifi,
  WifiOff,
  Play,
  Pause,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Star,
  Bookmark,
  Share2,
  Download,
  Upload,
  Maximize,
  Minimize
} from 'lucide-react'

interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: string
  high24h: number
  low24h: number
  high52w?: number
  low52w?: number
  pe?: number
  beta?: number
  dividend?: number
  sector?: string
  exchange: string
  lastUpdated: string
  volatility: number
  rsi: number
  sma20: number
  sma50: number
  support: number
  resistance: number
}

interface MarketIndex {
  name: string
  value: number
  change: number
  changePercent: number
  high: number
  low: number
  volume: string
  status: 'open' | 'closed' | 'pre-market' | 'after-hours'
}

interface SectorPerformance {
  sector: string
  change: number
  marketCap: string
  stocks: number
  topGainer: string
  topLoser: string
  momentum: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish'
}

interface MarketNews {
  id: string
  headline: string
  summary: string
  source: string
  impact: 'high' | 'medium' | 'low'
  sentiment: 'positive' | 'negative' | 'neutral'
  affectedSymbols: string[]
  publishedAt: string
  category: 'earnings' | 'economic' | 'company' | 'crypto' | 'geopolitical'
}

interface EconomicIndicator {
  name: string
  value: string
  change: string
  impact: 'positive' | 'negative' | 'neutral'
  nextRelease: string
  importance: 'high' | 'medium' | 'low'
}

export default function XMarketAnalysisPage() {
  const [marketData, setMarketData] = useState<MarketData[]>([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 67500,
      change: 1350,
      changePercent: 2.04,
      volume: '$24.8B',
      marketCap: '$1.33T',
      high24h: 68200,
      low24h: 65800,
      exchange: 'Binance',
      lastUpdated: '2 min ago',
      volatility: 3.8,
      rsi: 68,
      sma20: 65200,
      sma50: 62100,
      support: 63000,
      resistance: 70000
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3750,
      change: 95,
      changePercent: 2.6,
      volume: '$12.4B',
      marketCap: '$451B',
      high24h: 3820,
      low24h: 3650,
      exchange: 'Coinbase',
      lastUpdated: '2 min ago',
      volatility: 4.2,
      rsi: 62,
      sma20: 3680,
      sma50: 3520,
      support: 3500,
      resistance: 4000
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 192.50,
      change: -2.85,
      changePercent: -1.46,
      volume: '$45.2M',
      marketCap: '$2.98T',
      high24h: 195.30,
      low24h: 191.80,
      high52w: 198.23,
      low52w: 164.08,
      pe: 28.5,
      beta: 1.2,
      dividend: 0.91,
      sector: 'Technology',
      exchange: 'NASDAQ',
      lastUpdated: '5 min ago',
      volatility: 2.1,
      rsi: 78,
      sma20: 188.40,
      sma50: 182.30,
      support: 185.00,
      resistance: 200.00
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 268.75,
      change: -1.35,
      changePercent: -0.5,
      volume: '$28.7M',
      marketCap: '$855B',
      high24h: 272.10,
      low24h: 266.50,
      high52w: 299.29,
      low52w: 138.80,
      pe: 45.2,
      beta: 2.1,
      sector: 'Technology',
      exchange: 'NASDAQ',
      lastUpdated: '5 min ago',
      volatility: 5.8,
      rsi: 48,
      sma20: 272.30,
      sma50: 245.80,
      support: 250.00,
      resistance: 285.00
    },
    {
      symbol: 'EURUSD',
      name: 'Euro / US Dollar',
      price: 1.092,
      change: 0.002,
      changePercent: 0.18,
      volume: '$127B',
      marketCap: 'N/A',
      high24h: 1.095,
      low24h: 1.088,
      exchange: 'eToro',
      lastUpdated: '1 min ago',
      volatility: 0.8,
      rsi: 58,
      sma20: 1.089,
      sma50: 1.085,
      support: 1.085,
      resistance: 1.105
    }
  ])

  const [marketIndices] = useState<MarketIndex[]>([
    {
      name: 'S&P 500',
      value: 4731.23,
      change: 12.45,
      changePercent: 0.26,
      high: 4745.67,
      low: 4718.92,
      volume: '$89.5B',
      status: 'open'
    },
    {
      name: 'Dow Jones',
      value: 36585.06,
      change: -87.33,
      changePercent: -0.24,
      high: 36692.15,
      low: 36543.78,
      volume: '$45.2B',
      status: 'open'
    },
    {
      name: 'NASDAQ',
      value: 14689.30,
      change: 158.42,
      changePercent: 1.09,
      high: 14712.88,
      low: 14612.55,
      volume: '$78.9B',
      status: 'open'
    },
    {
      name: 'Russell 2000',
      value: 2089.45,
      change: 8.92,
      changePercent: 0.43,
      high: 2095.23,
      low: 2081.67,
      volume: '$23.4B',
      status: 'open'
    }
  ])

  const [sectorPerformance] = useState<SectorPerformance[]>([
    {
      sector: 'Technology',
      change: 2.3,
      marketCap: '$11.2T',
      stocks: 142,
      topGainer: 'NVDA (+4.8%)',
      topLoser: 'META (-1.2%)',
      momentum: 'bullish'
    },
    {
      sector: 'Healthcare',
      change: 0.8,
      marketCap: '$5.8T',
      stocks: 89,
      topGainer: 'JNJ (+2.1%)',
      topLoser: 'PFE (-0.9%)',
      momentum: 'neutral'
    },
    {
      sector: 'Financial',
      change: -0.5,
      marketCap: '$3.9T',
      stocks: 67,
      topGainer: 'GS (+1.5%)',
      topLoser: 'BAC (-2.1%)',
      momentum: 'bearish'
    },
    {
      sector: 'Energy',
      change: 1.7,
      marketCap: '$2.1T',
      stocks: 34,
      topGainer: 'XOM (+3.2%)',
      topLoser: 'CVX (-0.8%)',
      momentum: 'bullish'
    },
    {
      sector: 'Consumer Discretionary',
      change: -1.2,
      marketCap: '$4.6T',
      stocks: 78,
      topGainer: 'AMZN (+1.8%)',
      topLoser: 'TSLA (-2.4%)',
      momentum: 'bearish'
    }
  ])

  const [marketNews] = useState<MarketNews[]>([
    {
      id: '1',
      headline: 'Federal Reserve Signals Potential Rate Cut in Q4',
      summary: 'Fed Chairman suggests monetary policy may ease if inflation continues declining trend',
      source: 'Reuters',
      impact: 'high',
      sentiment: 'positive',
      affectedSymbols: ['SPY', 'QQQ', 'BTC', 'EURUSD'],
      publishedAt: '2025-08-07T14:30:00Z',
      category: 'economic'
    },
    {
      id: '2',
      headline: 'Apple Reports Strong iPhone 16 Sales in Q3',
      summary: 'Cupertino giant beats expectations with 15% YoY growth in smartphone segment',
      source: 'Bloomberg',
      impact: 'medium',
      sentiment: 'positive',
      affectedSymbols: ['AAPL'],
      publishedAt: '2025-08-07T13:45:00Z',
      category: 'earnings'
    },
    {
      id: '3',
      headline: 'Bitcoin ETF Approval Drives Institutional Adoption',
      summary: 'SEC approves three new Bitcoin ETFs, sparking institutional investment surge',
      source: 'CoinDesk',
      impact: 'high',
      sentiment: 'positive',
      affectedSymbols: ['BTC', 'ETH'],
      publishedAt: '2025-08-07T12:20:00Z',
      category: 'crypto'
    }
  ])

  const [economicIndicators] = useState<EconomicIndicator[]>([
    {
      name: 'GDP Growth Rate',
      value: '2.4%',
      change: '+0.2%',
      impact: 'positive',
      nextRelease: 'Aug 30',
      importance: 'high'
    },
    {
      name: 'Unemployment Rate',
      value: '3.7%',
      change: '-0.1%',
      impact: 'positive',
      nextRelease: 'Sep 6',
      importance: 'high'
    },
    {
      name: 'Inflation (CPI)',
      value: '3.2%',
      change: '-0.3%',
      impact: 'positive',
      nextRelease: 'Sep 13',
      importance: 'high'
    },
    {
      name: 'Interest Rate',
      value: '5.25%',
      change: '0.0%',
      impact: 'neutral',
      nextRelease: 'Sep 20',
      importance: 'high'
    }
  ])

  const [selectedTab, setSelectedTab] = useState<'overview' | 'indices' | 'sectors' | 'news' | 'economic' | 'technical'>('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [liveData, setLiveData] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'strong_bullish': return 'text-green-400'
      case 'bullish': return 'text-green-300'
      case 'neutral': return 'text-yellow-400'
      case 'bearish': return 'text-red-300'
      case 'strong_bearish': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-900/30 border-red-700/50'
      case 'medium': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700/50'
      case 'low': return 'text-green-400 bg-green-900/30 border-green-700/50'
      default: return 'text-gray-400 bg-gray-900/30 border-gray-700/50'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400'
      case 'negative': return 'text-red-400'
      case 'neutral': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const filteredMarketData = marketData.filter(item =>
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-950/50 backdrop-blur-sm border-b border-red-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Market Analysis</h1>
                  <p className="text-red-300">Real-time market data and comprehensive analysis</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  {liveData ? (
                    <>
                      <Wifi className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-bold">LIVE</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-bold">OFFLINE</span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-blue-400">Markets: Open</span>
                  <span className="text-yellow-400">Last Update: 2min ago</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLiveData(!liveData)}
                  className={`p-2 rounded-lg transition-colors ${liveData
                      ? 'bg-green-800/50 text-green-400'
                      : 'text-red-400 hover:text-white hover:bg-red-800/50'
                    }`}
                  title={liveData ? 'Live data ON' : 'Live data OFF'}
                >
                  {liveData ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                </button>
                <button className="p-2 text-red-300 hover:text-white hover:bg-red-800/50 rounded-lg transition-colors">
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button className="p-2 text-red-300 hover:text-white hover:bg-red-800/50 rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 text-red-300 hover:text-white hover:bg-red-800/50 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-950/30 backdrop-blur-sm border border-red-700/50 rounded-xl mb-6">
          <div className="flex border-b border-red-800/30">
            {(['overview', 'indices', 'sectors', 'news', 'economic', 'technical'] as const).map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-4 px-6 font-medium capitalize transition-colors ${selectedTab === tab
                    ? 'text-white border-b-2 border-red-400 bg-red-900/30'
                    : 'text-red-300 hover:text-white hover:bg-red-900/20'
                  }`}
              >
                {tab === 'overview' && <Monitor className="w-4 h-4 mr-2" />}
                {tab === 'indices' && <BarChart3 className="w-4 h-4 mr-2" />}
                {tab === 'sectors' && <PieChart className="w-4 h-4 mr-2" />}
                {tab === 'news' && <Globe className="w-4 h-4 mr-2" />}
                {tab === 'economic' && <DollarSign className="w-4 h-4 mr-2" />}
                {tab === 'technical' && <LineChart className="w-4 h-4 mr-2" />}
                {tab}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Market Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-5 h-5 text-red-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search markets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-white placeholder-red-300 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    {(['1D', '1W', '1M', '3M', '1Y'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimeframe(period)}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${timeframe === period
                            ? 'bg-red-600 text-white'
                            : 'text-red-300 hover:text-white hover:bg-red-800/30'
                          }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-red-300 text-sm">{filteredMarketData.length} assets</span>
                </div>
              </div>
            </div>

            {/* Market Data Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMarketData.map((asset, index) => (
                <motion.div
                  key={asset.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6"
                >
                  {/* Asset Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{asset.symbol}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{asset.symbol}</h4>
                        <p className="text-red-300 text-sm">{asset.name}</p>
                        <p className="text-red-400 text-xs">{asset.exchange}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xl font-bold">{formatCurrency(asset.price)}</p>
                      <div className="flex items-center">
                        {asset.change >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${getChangeColor(asset.change)}`}>
                          {formatPercent(asset.changePercent)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Data */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-red-300 text-xs">24h High</p>
                      <p className="text-white text-sm font-medium">{formatCurrency(asset.high24h)}</p>
                    </div>
                    <div>
                      <p className="text-red-300 text-xs">24h Low</p>
                      <p className="text-white text-sm font-medium">{formatCurrency(asset.low24h)}</p>
                    </div>
                    <div>
                      <p className="text-red-300 text-xs">Volume</p>
                      <p className="text-white text-sm font-medium">{asset.volume}</p>
                    </div>
                    <div>
                      <p className="text-red-300 text-xs">Market Cap</p>
                      <p className="text-white text-sm font-medium">{asset.marketCap}</p>
                    </div>
                  </div>

                  {/* Technical Indicators */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-red-400 text-xs">RSI</p>
                      <p className="text-white text-sm font-medium">{asset.rsi}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 text-xs">Volatility</p>
                      <p className="text-white text-sm font-medium">{asset.volatility}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-400 text-xs">Support</p>
                      <p className="text-white text-sm font-medium">{formatCurrency(asset.support)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-red-800/30">
                    <div className="flex items-center space-x-2 text-xs text-red-300">
                      <Clock className="w-3 h-3" />
                      <span>{asset.lastUpdated}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-red-400 hover:text-white hover:bg-red-800/30 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-400 hover:text-white hover:bg-red-800/30 rounded-lg transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-400 hover:text-white hover:bg-red-800/30 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Market Indices Tab */}
        {selectedTab === 'indices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {marketIndices.map((index, idx) => (
                <motion.div
                  key={index.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-semibold">{index.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${index.status === 'open' ? 'bg-green-900/30 text-green-400' : 'bg-gray-900/30 text-gray-400'
                      }`}>
                      {index.status}
                    </span>
                  </div>
                  <p className="text-white text-2xl font-bold mb-2">{index.value.toLocaleString()}</p>
                  <div className="flex items-center mb-4">
                    {index.change >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${getChangeColor(index.change)}`}>
                      {formatPercent(index.changePercent)} ({index.change >= 0 ? '+' : ''}{index.change.toFixed(2)})
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-red-300">High:</span>
                      <span className="text-white">{index.high.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-300">Low:</span>
                      <span className="text-white">{index.low.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-300">Volume:</span>
                      <span className="text-white">{index.volume}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs placeholder - to be implemented modularly */}
        {selectedTab === 'sectors' && (
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="text-center py-12">
              <PieChart className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Sector Performance</h3>
              <p className="text-red-300">Coming in next update...</p>
            </div>
          </div>
        )}

        {selectedTab === 'news' && (
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Market News</h3>
              <p className="text-red-300">Coming in next update...</p>
            </div>
          </div>
        )}

        {selectedTab === 'economic' && (
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Economic Indicators</h3>
              <p className="text-red-300">Coming in next update...</p>
            </div>
          </div>
        )}

        {selectedTab === 'technical' && (
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="text-center py-12">
              <LineChart className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Technical Analysis</h3>
              <p className="text-red-300">Coming in next update...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
