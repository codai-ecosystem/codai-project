'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Bot,
  Search,
  Bell,
  Settings,
  ChevronRight,
  Eye,
  Plus,
  Minus,
  Star,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Globe,
  Percent,
  Volume2,
  Clock,
  Target,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface WatchlistStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number
  sector: string
  aiScore: number
  aiRating: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
  confidence: number
  priceTarget: number
  resistance: number
  support: number
  avgVolume: number
  volatility: number
  momentum: 'Bullish' | 'Bearish' | 'Neutral'
  alerts: number
  inPortfolio: boolean
}

interface MarketAlert {
  id: string
  symbol: string
  type: 'price' | 'volume' | 'ai' | 'news'
  message: string
  priority: 'high' | 'medium' | 'low'
  timestamp: string
  triggered: boolean
}

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState('watchlist')
  const [filterSector, setFilterSector] = useState('all')
  const [filterRating, setFilterRating] = useState('all')
  const [sortBy, setSortBy] = useState('aiScore')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const [watchlistStocks] = useState<WatchlistStock[]>([
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 182.41,
      change: 2.34,
      changePercent: 1.30,
      volume: 64500000,
      marketCap: 2850000000000,
      peRatio: 28.5,
      sector: 'Technology',
      aiScore: 92,
      aiRating: 'Strong Buy',
      confidence: 94,
      priceTarget: 195.00,
      resistance: 185.50,
      support: 178.20,
      avgVolume: 58200000,
      volatility: 0.28,
      momentum: 'Bullish',
      alerts: 2,
      inPortfolio: true
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 138.21,
      change: -1.45,
      changePercent: -1.04,
      volume: 32100000,
      marketCap: 1720000000000,
      peRatio: 24.8,
      sector: 'Technology',
      aiScore: 88,
      aiRating: 'Buy',
      confidence: 87,
      priceTarget: 155.00,
      resistance: 142.80,
      support: 135.00,
      avgVolume: 29800000,
      volatility: 0.32,
      momentum: 'Neutral',
      alerts: 1,
      inPortfolio: true
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      price: 238.45,
      change: 12.34,
      changePercent: 5.46,
      volume: 89200000,
      marketCap: 760000000000,
      peRatio: 45.2,
      sector: 'Automotive',
      aiScore: 75,
      aiRating: 'Hold',
      confidence: 68,
      priceTarget: 250.00,
      resistance: 245.00,
      support: 220.00,
      avgVolume: 72500000,
      volatility: 0.48,
      momentum: 'Bullish',
      alerts: 3,
      inPortfolio: true
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      price: 512.34,
      change: 8.67,
      changePercent: 1.72,
      volume: 45600000,
      marketCap: 1260000000000,
      peRatio: 62.1,
      sector: 'Technology',
      aiScore: 95,
      aiRating: 'Strong Buy',
      confidence: 96,
      priceTarget: 580.00,
      resistance: 520.00,
      support: 495.00,
      avgVolume: 41200000,
      volatility: 0.35,
      momentum: 'Bullish',
      alerts: 1,
      inPortfolio: true
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 153.37,
      change: -2.10,
      changePercent: -1.35,
      volume: 38900000,
      marketCap: 1580000000000,
      peRatio: 52.3,
      sector: 'E-commerce',
      aiScore: 82,
      aiRating: 'Buy',
      confidence: 79,
      priceTarget: 170.00,
      resistance: 158.00,
      support: 148.50,
      avgVolume: 42100000,
      volatility: 0.29,
      momentum: 'Neutral',
      alerts: 0,
      inPortfolio: true
    },
    {
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      price: 325.89,
      change: 4.56,
      changePercent: 1.42,
      volume: 28700000,
      marketCap: 820000000000,
      peRatio: 22.4,
      sector: 'Technology',
      aiScore: 86,
      aiRating: 'Buy',
      confidence: 83,
      priceTarget: 350.00,
      resistance: 330.00,
      support: 315.00,
      avgVolume: 25600000,
      volatility: 0.31,
      momentum: 'Bullish',
      alerts: 2,
      inPortfolio: false
    },
    {
      symbol: 'AMD',
      name: 'Advanced Micro Devices',
      price: 118.45,
      change: -3.21,
      changePercent: -2.64,
      volume: 52300000,
      marketCap: 191000000000,
      peRatio: 18.7,
      sector: 'Technology',
      aiScore: 79,
      aiRating: 'Hold',
      confidence: 72,
      priceTarget: 125.00,
      resistance: 122.00,
      support: 115.00,
      avgVolume: 48900000,
      volatility: 0.42,
      momentum: 'Bearish',
      alerts: 1,
      inPortfolio: false
    }
  ])

  const [marketAlerts] = useState<MarketAlert[]>([
    {
      id: '1',
      symbol: 'AAPL',
      type: 'ai',
      message: 'AI detected strong bullish pattern - consider increasing position',
      priority: 'high',
      timestamp: '10:30 AM',
      triggered: true
    },
    {
      id: '2',
      symbol: 'TSLA',
      type: 'price',
      message: 'Price approaching resistance level at $245.00',
      priority: 'medium',
      timestamp: '09:45 AM',
      triggered: true
    },
    {
      id: '3',
      symbol: 'NVDA',
      type: 'volume',
      message: 'Unusual volume spike detected - 20% above average',
      priority: 'high',
      timestamp: '09:15 AM',
      triggered: true
    }
  ])

  const sectors = ['all', 'Technology', 'Automotive', 'E-commerce', 'Healthcare', 'Finance']
  const ratings = ['all', 'Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell']

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(2)}T`
    }
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`
    }
    return `$${marketCap.toFixed(0)}M`
  }

  const filteredStocks = watchlistStocks
    .filter(stock => filterSector === 'all' || stock.sector === filterSector)
    .filter(stock => filterRating === 'all' || stock.aiRating === filterRating)
    .sort((a, b) => {
      const aValue = a[sortBy as keyof WatchlistStock]
      const bValue = b[sortBy as keyof WatchlistStock]
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })

  const tabs = [
    { id: 'watchlist', label: 'My Watchlist', icon: Eye },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'analysis', label: 'AI Analysis', icon: Bot },
    { id: 'screener', label: 'Stock Screener', icon: Filter },
    { id: 'news', label: 'Market News', icon: Globe }
  ]

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Strong Buy': return 'text-green-600 bg-green-100'
      case 'Buy': return 'text-emerald-600 bg-emerald-100'
      case 'Hold': return 'text-yellow-600 bg-yellow-100'
      case 'Sell': return 'text-orange-600 bg-orange-100'
      case 'Strong Sell': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'Bullish': return 'text-green-600 bg-green-100'
      case 'Bearish': return 'text-red-600 bg-red-100'
      case 'Neutral': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Smart Watchlist</h1>
                  <p className="text-sm text-gray-500">AI-powered stock monitoring</p>
                </div>
              </Link>
            </div>

            {/* Header Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{watchlistStocks.length}</div>
                <div className="text-xs text-gray-500">Tracked Stocks</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{marketAlerts.filter(a => a.triggered).length}</div>
                <div className="text-xs text-gray-500">Active Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(watchlistStocks.reduce((sum, stock) => sum + stock.aiScore, 0) / watchlistStocks.length)}
                </div>
                <div className="text-xs text-gray-500">Avg AI Score</div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
                {marketAlerts.filter(a => a.triggered).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {marketAlerts.filter(a => a.triggered).length}
                  </span>
                )}
              </button>
              <Link href="/settings" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {tab.label}
                    {tab.id === 'alerts' && marketAlerts.filter(a => a.triggered).length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {marketAlerts.filter(a => a.triggered).length}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Watchlist Tab Content */}
        {activeTab === 'watchlist' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Filters and Controls */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                      value={filterSector}
                      onChange={(e) => setFilterSector(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>
                          {sector === 'all' ? 'All Sectors' : sector}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Rating:</span>
                    <select
                      value={filterRating}
                      onChange={(e) => setFilterRating(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {ratings.map(rating => (
                        <option key={rating} value={rating}>
                          {rating === 'all' ? 'All Ratings' : rating}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="aiScore">AI Score</option>
                      <option value="changePercent">Day Change %</option>
                      <option value="volume">Volume</option>
                      <option value="marketCap">Market Cap</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-2 rounded-lg ${viewMode === 'cards' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Target className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span>Add Stock</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Watchlist Content */}
            {viewMode === 'table' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Score</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Momentum</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alerts</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStocks.map((stock) => (
                        <tr key={stock.symbol} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-bold text-gray-900">{stock.symbol}</div>
                                  {stock.inPortfolio && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">{stock.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(stock.price)}</div>
                            <div className="text-xs text-gray-500">Target: {formatCurrency(stock.priceTarget)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium flex items-center ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stock.change >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                              {formatPercent(stock.changePercent)}
                            </div>
                            <div className={`text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(stock.change)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatVolume(stock.volume)}</div>
                            <div className="text-xs text-gray-500">Avg: {formatVolume(stock.avgVolume)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAIScoreColor(stock.aiScore)}`}>
                              {stock.aiScore}
                            </span>
                            <div className="text-xs text-gray-500">{stock.confidence}% conf</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingColor(stock.aiRating)}`}>
                              {stock.aiRating}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMomentumColor(stock.momentum)}`}>
                              {stock.momentum}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {stock.alerts > 0 ? (
                              <div className="flex items-center text-red-600">
                                <Bell className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">{stock.alerts}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-green-600 hover:text-green-900">
                                <Plus className="h-4 w-4" />
                              </button>
                              <button className="text-yellow-600 hover:text-yellow-900">
                                <Star className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Minus className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStocks.map((stock) => (
                  <div key={stock.symbol} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-gray-900">{stock.symbol}</h3>
                            {stock.inPortfolio && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </div>
                          <p className="text-sm text-gray-500">{stock.name}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAIScoreColor(stock.aiScore)}`}>
                        {stock.aiScore}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">{formatCurrency(stock.price)}</span>
                        <div className={`text-right ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <div className="flex items-center text-sm font-medium">
                            {stock.change >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                            {formatPercent(stock.changePercent)}
                          </div>
                          <div className="text-xs">{formatCurrency(stock.change)}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Volume:</span>
                          <div className="font-medium">{formatVolume(stock.volume)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Target:</span>
                          <div className="font-medium">{formatCurrency(stock.priceTarget)}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingColor(stock.aiRating)}`}>
                          {stock.aiRating}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMomentumColor(stock.momentum)}`}>
                          {stock.momentum}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Plus className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                            <Star className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                        {stock.alerts > 0 && (
                          <div className="flex items-center text-red-600">
                            <Bell className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">{stock.alerts}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== 'watchlist' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center"
          >
            <div className="text-gray-500 mb-4">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p>This section will be available in the full implementation.</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modern Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <Bot className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">AI Stock Screener</h3>
              <p className="text-green-100 text-sm mb-4">Discover investment opportunities with AI-powered stock screening and analysis.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Start Screening <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <Zap className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Smart Alerts</h3>
              <p className="text-blue-100 text-sm mb-4">Never miss important market movements with intelligent price and volume alerts.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Configure Alerts <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <Target className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Market Intelligence</h3>
              <p className="text-purple-100 text-sm mb-4">Access real-time market insights and professional-grade analysis tools.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Explore Insights <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
