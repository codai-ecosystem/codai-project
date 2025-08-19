'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  DollarSign,
  Wallet,
  Target,
  AlertCircle,
  Plus,
  Minus,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Filter,
  Search,
  Grid,
  List,
  Star,
  BookmarkIcon as Bookmark,
  Share2,
  MoreHorizontal,
  Activity,
  TrendingUpIcon,
  TrendingDownIcon,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'

interface Portfolio {
  totalValue: number
  totalInvested: number
  totalGainLoss: number
  totalGainLossPercent: number
  todaysChange: number
  todaysChangePercent: number
  availableCash: number
  buyingPower: number
  marginUsed: number
  maintenanceMargin: number
}

interface Position {
  id: string
  symbol: string
  name: string
  type: 'stock' | 'crypto' | 'forex' | 'commodity' | 'bond'
  quantity: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  gainLoss: number
  gainLossPercent: number
  todaysChange: number
  todaysChangePercent: number
  allocation: number
  lastUpdated: string
  exchange: string
  sector?: string
  beta?: number
  dividend?: number
  pe?: number
  marketCap?: string
}

interface Transaction {
  id: string
  symbol: string
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'dividend'
  quantity: number
  price: number
  value: number
  fee: number
  date: string
  status: 'completed' | 'pending' | 'cancelled'
}

interface PerformanceMetric {
  period: string
  portfolioReturn: number
  marketReturn: number
  alpha: number
  beta: number
  sharpeRatio: number
  volatility: number
}

export default function XPortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    totalValue: 487234.50,
    totalInvested: 450000.00,
    totalGainLoss: 37234.50,
    totalGainLossPercent: 8.27,
    todaysChange: 2845.67,
    todaysChangePercent: 0.59,
    availableCash: 15670.30,
    buyingPower: 31340.60,
    marginUsed: 12500.00,
    maintenanceMargin: 8750.00
  })

  const [positions, setPositions] = useState<Position[]>([
    {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      type: 'crypto',
      quantity: 2.5,
      averagePrice: 45000,
      currentPrice: 67500,
      marketValue: 168750,
      gainLoss: 56250,
      gainLossPercent: 50.0,
      todaysChange: 1350,
      todaysChangePercent: 2.0,
      allocation: 34.6,
      lastUpdated: '2 min ago',
      exchange: 'Binance'
    },
    {
      id: '2',
      symbol: 'ETH',
      name: 'Ethereum',
      type: 'crypto',
      quantity: 15.0,
      averagePrice: 2800,
      currentPrice: 3750,
      marketValue: 56250,
      gainLoss: 14250,
      gainLossPercent: 33.93,
      todaysChange: 562.5,
      todaysChangePercent: 1.5,
      allocation: 11.5,
      lastUpdated: '2 min ago',
      exchange: 'Coinbase'
    },
    {
      id: '3',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      type: 'stock',
      quantity: 100,
      averagePrice: 175,
      currentPrice: 192.50,
      marketValue: 19250,
      gainLoss: 1750,
      gainLossPercent: 10.0,
      todaysChange: 192.5,
      todaysChangePercent: 1.0,
      allocation: 3.9,
      lastUpdated: '5 min ago',
      exchange: 'NASDAQ',
      sector: 'Technology',
      beta: 1.2,
      dividend: 0.91,
      pe: 28.5,
      marketCap: '$2.98T'
    },
    {
      id: '4',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      type: 'stock',
      quantity: 50,
      averagePrice: 250,
      currentPrice: 268.75,
      marketValue: 13437.5,
      gainLoss: 937.5,
      gainLossPercent: 7.5,
      todaysChange: -134.38,
      todaysChangePercent: -0.5,
      allocation: 2.8,
      lastUpdated: '5 min ago',
      exchange: 'NASDAQ',
      sector: 'Technology',
      beta: 2.1,
      pe: 45.2,
      marketCap: '$855B'
    },
    {
      id: '5',
      symbol: 'EURUSD',
      name: 'Euro / US Dollar',
      type: 'forex',
      quantity: 50000,
      averagePrice: 1.085,
      currentPrice: 1.092,
      marketValue: 54600,
      gainLoss: 350,
      gainLossPercent: 0.65,
      todaysChange: 109.2,
      todaysChangePercent: 0.2,
      allocation: 11.2,
      lastUpdated: '1 min ago',
      exchange: 'eToro'
    }
  ])

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      symbol: 'BTC',
      type: 'buy',
      quantity: 0.5,
      price: 67500,
      value: 33750,
      fee: 25.31,
      date: '2025-08-07T14:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      symbol: 'ETH',
      type: 'sell',
      quantity: 2.0,
      price: 3750,
      value: 7500,
      fee: 11.25,
      date: '2025-08-07T12:15:00Z',
      status: 'completed'
    },
    {
      id: '3',
      symbol: 'AAPL',
      type: 'buy',
      quantity: 25,
      price: 192.50,
      value: 4812.5,
      fee: 7.22,
      date: '2025-08-07T10:45:00Z',
      status: 'completed'
    }
  ])

  const [performanceMetrics] = useState<PerformanceMetric[]>([
    {
      period: '1M',
      portfolioReturn: 3.2,
      marketReturn: 2.1,
      alpha: 1.1,
      beta: 1.15,
      sharpeRatio: 1.8,
      volatility: 12.5
    },
    {
      period: '3M',
      portfolioReturn: 8.7,
      marketReturn: 5.9,
      alpha: 2.8,
      beta: 1.12,
      sharpeRatio: 1.9,
      volatility: 14.2
    },
    {
      period: '6M',
      portfolioReturn: 15.3,
      marketReturn: 11.2,
      alpha: 4.1,
      beta: 1.08,
      sharpeRatio: 2.1,
      volatility: 13.8
    },
    {
      period: '1Y',
      portfolioReturn: 28.4,
      marketReturn: 18.7,
      alpha: 9.7,
      beta: 1.05,
      sharpeRatio: 2.3,
      volatility: 15.1
    }
  ])

  const [selectedTab, setSelectedTab] = useState<'overview' | 'positions' | 'performance' | 'transactions' | 'analysis'>('overview')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showValues, setShowValues] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'stock' | 'crypto' | 'forex' | 'commodity' | 'bond'>('all')
  const [sortBy, setSortBy] = useState<'value' | 'gainloss' | 'allocation' | 'symbol'>('value')
  const [searchTerm, setSearchTerm] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  const filteredPositions = positions.filter(position => {
    const matchesSearch = position.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || position.type === filterType
    return matchesSearch && matchesType
  }).sort((a, b) => {
    switch (sortBy) {
      case 'value':
        return b.marketValue - a.marketValue
      case 'gainloss':
        return b.gainLossPercent - a.gainLossPercent
      case 'allocation':
        return b.allocation - a.allocation
      case 'symbol':
        return a.symbol.localeCompare(b.symbol)
      default:
        return 0
    }
  })

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
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Portfolio Management</h1>
                  <p className="text-red-300">Track and manage your trading positions</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-bold text-xl">{formatCurrency(portfolio.totalValue)}</p>
                <div className="flex items-center">
                  {portfolio.todaysChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${portfolio.todaysChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercent(portfolio.todaysChangePercent)} today
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowValues(!showValues)}
                  className="p-2 text-red-300 hover:text-white hover:bg-red-800/50 rounded-lg transition-colors"
                  title={showValues ? 'Hide values' : 'Show values'}
                >
                  {showValues ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
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
            {(['overview', 'positions', 'performance', 'transactions', 'analysis'] as const).map((tab) => (
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
                {tab}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Portfolio Overview */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Portfolio Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-400 text-sm font-medium">+{formatPercent(portfolio.totalGainLossPercent)}</span>
                </div>
                <h3 className="text-red-300 text-sm font-medium mb-1">Total Portfolio Value</h3>
                <p className="text-white text-2xl font-bold">{showValues ? formatCurrency(portfolio.totalValue) : '••••••'}</p>
                <p className="text-red-300 text-sm mt-1">Invested: {showValues ? formatCurrency(portfolio.totalInvested) : '••••••'}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-green-400 text-sm font-medium">Today</span>
                </div>
                <h3 className="text-red-300 text-sm font-medium mb-1">Total Gain/Loss</h3>
                <p className={`text-2xl font-bold ${portfolio.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {showValues ? formatCurrency(portfolio.totalGainLoss) : '••••••'}
                </p>
                <p className="text-red-300 text-sm mt-1">
                  Today: {showValues ? formatCurrency(portfolio.todaysChange) : '••••••'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-blue-400 text-sm font-medium">Available</span>
                </div>
                <h3 className="text-red-300 text-sm font-medium mb-1">Cash Balance</h3>
                <p className="text-white text-2xl font-bold">{showValues ? formatCurrency(portfolio.availableCash) : '••••••'}</p>
                <p className="text-red-300 text-sm mt-1">Buying Power: {showValues ? formatCurrency(portfolio.buyingPower) : '••••••'}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-yellow-400 text-sm font-medium">Used</span>
                </div>
                <h3 className="text-red-300 text-sm font-medium mb-1">Margin</h3>
                <p className="text-white text-2xl font-bold">{showValues ? formatCurrency(portfolio.marginUsed) : '••••••'}</p>
                <p className="text-red-300 text-sm mt-1">Maintenance: {showValues ? formatCurrency(portfolio.maintenanceMargin) : '••••••'}</p>
              </motion.div>
            </div>

            {/* Top Holdings */}
            <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">Top Holdings</h3>
                <button className="text-red-400 hover:text-white transition-colors text-sm">
                  View All Positions
                </button>
              </div>
              <div className="space-y-4">
                {positions.slice(0, 5).map((position, index) => (
                  <div key={position.id} className="flex items-center justify-between py-3 border-b border-red-800/30 last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{position.symbol}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{position.symbol}</p>
                        <p className="text-red-300 text-sm">{position.name}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">{showValues ? formatCurrency(position.marketValue) : '••••••'}</p>
                      <p className="text-red-300 text-sm">{position.allocation}% allocation</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        {position.gainLoss >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${position.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercent(position.gainLossPercent)}
                        </span>
                      </div>
                      <p className="text-red-300 text-xs">{position.lastUpdated}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Positions Tab - Will be completed modularly */}
        {selectedTab === 'positions' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-5 h-5 text-red-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search positions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-white placeholder-red-300 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="all">All Types</option>
                    <option value="stock">Stocks</option>
                    <option value="crypto">Crypto</option>
                    <option value="forex">Forex</option>
                    <option value="commodity">Commodities</option>
                    <option value="bond">Bonds</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="value">Sort by Value</option>
                    <option value="gainloss">Sort by Gain/Loss</option>
                    <option value="allocation">Sort by Allocation</option>
                    <option value="symbol">Sort by Symbol</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                        ? 'bg-red-800/50 text-white'
                        : 'text-red-400 hover:text-white hover:bg-red-800/30'
                      }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                        ? 'bg-red-800/50 text-white'
                        : 'text-red-400 hover:text-white hover:bg-red-800/30'
                      }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Positions Display */}
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
              {filteredPositions.map((position, index) => (
                <motion.div
                  key={position.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6 ${viewMode === 'list' ? 'flex items-center justify-between' : ''
                    }`}
                >
                  <div className={`${viewMode === 'list' ? 'flex items-center space-x-4' : 'mb-4'}`}>
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{position.symbol}</span>
                    </div>
                    <div className={viewMode === 'list' ? '' : 'mt-3'}>
                      <h4 className="text-white font-semibold">{position.symbol}</h4>
                      <p className="text-red-300 text-sm">{position.name}</p>
                      <p className="text-red-400 text-xs">{position.exchange}</p>
                    </div>
                  </div>

                  <div className={`${viewMode === 'list' ? 'text-center' : 'space-y-2'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-red-300 text-sm">Quantity:</span>
                      <span className="text-white font-medium">{position.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-red-300 text-sm">Value:</span>
                      <span className="text-white font-semibold">
                        {showValues ? formatCurrency(position.marketValue) : '••••••'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-red-300 text-sm">Gain/Loss:</span>
                      <span className={`font-semibold ${position.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {showValues ? formatCurrency(position.gainLoss) : '••••••'} ({formatPercent(position.gainLossPercent)})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-red-300 text-sm">Today:</span>
                      <span className={`font-medium ${position.todaysChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(position.todaysChangePercent)}
                      </span>
                    </div>
                  </div>

                  <div className={`${viewMode === 'list' ? 'flex items-center space-x-2' : 'mt-4 flex justify-between'}`}>
                    <button className="p-2 text-red-400 hover:text-white hover:bg-red-800/30 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-400 hover:text-white hover:bg-red-800/30 rounded-lg transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-400 hover:text-white hover:bg-red-800/30 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs will be implemented in subsequent modular updates */}
        {selectedTab === 'performance' && (
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Performance Analytics</h3>
              <p className="text-red-300">Coming in next update...</p>
            </div>
          </div>
        )}

        {selectedTab === 'transactions' && (
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Transaction History</h3>
              <p className="text-red-300">Coming in next update...</p>
            </div>
          </div>
        )}

        {selectedTab === 'analysis' && (
          <div className="bg-red-950/50 backdrop-blur-sm border border-red-700/50 rounded-xl p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">Portfolio Analysis</h3>
              <p className="text-red-300">Coming in next update...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
