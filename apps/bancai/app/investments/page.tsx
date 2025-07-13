'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  Calendar,
  Download,
  Filter,
  Search,
  Building2,
  Globe,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface Investment {
  id: string
  type: 'stocks' | 'bonds' | 'etf' | 'crypto' | 'real_estate' | 'commodities'
  symbol: string
  name: string
  shares: number
  currentPrice: number
  totalValue: number
  dailyChange: number
  dailyChangePercent: number
  totalReturn: number
  totalReturnPercent: number
  currency: string
  exchange: string
  sector?: string
}

interface Portfolio {
  totalValue: number
  totalReturn: number
  totalReturnPercent: number
  dailyChange: number
  dailyChangePercent: number
  allocation: {
    stocks: number
    bonds: number
    etf: number
    crypto: number
    real_estate: number
    commodities: number
  }
}

const mockInvestments: Investment[] = [
  {
    id: 'inv-001',
    type: 'stocks',
    symbol: 'TLV',
    name: 'Banca Transilvania',
    shares: 500,
    currentPrice: 28.50,
    totalValue: 14250.00,
    dailyChange: 425.00,
    dailyChangePercent: 3.08,
    totalReturn: 2850.00,
    totalReturnPercent: 25.0,
    currency: 'RON',
    exchange: 'BVB',
    sector: 'Financial Services'
  },
  {
    id: 'inv-002',
    type: 'etf',
    symbol: 'BET-TR',
    name: 'BET Total Return ETF',
    shares: 100,
    currentPrice: 156.80,
    totalValue: 15680.00,
    dailyChange: -234.00,
    dailyChangePercent: -1.47,
    totalReturn: 1680.00,
    totalReturnPercent: 12.0,
    currency: 'RON',
    exchange: 'BVB',
    sector: 'Diversified'
  },
  {
    id: 'inv-003',
    type: 'crypto',
    symbol: 'BTC',
    name: 'Bitcoin',
    shares: 0.25,
    currentPrice: 185000.00,
    totalValue: 46250.00,
    dailyChange: 1850.00,
    dailyChangePercent: 4.17,
    totalReturn: 21250.00,
    totalReturnPercent: 85.0,
    currency: 'RON',
    exchange: 'Crypto',
    sector: 'Cryptocurrency'
  },
  {
    id: 'inv-004',
    type: 'bonds',
    symbol: 'ROM-25',
    name: 'Romanian Government Bonds 2025',
    shares: 50,
    currentPrice: 1020.00,
    totalValue: 51000.00,
    dailyChange: 50.00,
    dailyChangePercent: 0.10,
    totalReturn: 1000.00,
    totalReturnPercent: 2.0,
    currency: 'RON',
    exchange: 'BVB',
    sector: 'Government Bonds'
  },
  {
    id: 'inv-005',
    type: 'stocks',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 25,
    currentPrice: 750.00,
    totalValue: 18750.00,
    dailyChange: -375.00,
    dailyChangePercent: -1.96,
    totalReturn: 3750.00,
    totalReturnPercent: 25.0,
    currency: 'RON',
    exchange: 'NASDAQ',
    sector: 'Technology'
  },
  {
    id: 'inv-006',
    type: 'real_estate',
    symbol: 'REIT-1',
    name: 'Romanian Real Estate Fund',
    shares: 200,
    currentPrice: 85.50,
    totalValue: 17100.00,
    dailyChange: 171.00,
    dailyChangePercent: 1.01,
    totalReturn: 1100.00,
    totalReturnPercent: 6.9,
    currency: 'RON',
    exchange: 'BVB',
    sector: 'Real Estate'
  }
]

const portfolio: Portfolio = {
  totalValue: mockInvestments.reduce((sum, inv) => sum + inv.totalValue, 0),
  totalReturn: mockInvestments.reduce((sum, inv) => sum + inv.totalReturn, 0),
  totalReturnPercent: 28.5,
  dailyChange: mockInvestments.reduce((sum, inv) => sum + inv.dailyChange, 0),
  dailyChangePercent: 1.25,
  allocation: {
    stocks: 32.5,
    bonds: 20.1,
    etf: 9.8,
    crypto: 28.9,
    real_estate: 6.7,
    commodities: 2.0
  }
}

export default function InvestmentsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stocks': return <TrendingUp className="w-4 h-4" />
      case 'bonds': return <Shield className="w-4 h-4" />
      case 'etf': return <PieChart className="w-4 h-4" />
      case 'crypto': return <Zap className="w-4 h-4" />
      case 'real_estate': return <Building2 className="w-4 h-4" />
      case 'commodities': return <Globe className="w-4 h-4" />
      default: return <DollarSign className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stocks': return 'bg-blue-500/20 text-blue-400'
      case 'bonds': return 'bg-emerald-500/20 text-emerald-400'
      case 'etf': return 'bg-purple-500/20 text-purple-400'
      case 'crypto': return 'bg-yellow-500/20 text-yellow-400'
      case 'real_estate': return 'bg-orange-500/20 text-orange-400'
      case 'commodities': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const filteredInvestments = mockInvestments.filter(investment => {
    const matchesFilter = selectedFilter === 'all' || investment.type === selectedFilter
    const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investment.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const types = ['all', 'stocks', 'bonds', 'etf', 'crypto', 'real_estate', 'commodities']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Investments</h1>
          <p className="text-blue-200 mt-2">Track your investment portfolio</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            <Calendar className="w-5 h-5" />
            Portfolio Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            New Investment
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-blue-200 text-sm font-medium">Total Portfolio Value</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {portfolio.totalValue.toLocaleString('ro-RO')} RON
          </p>
          <div className={`flex items-center gap-1 mt-2 ${portfolio.dailyChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
            {portfolio.dailyChangePercent >= 0 ?
              <TrendingUp className="w-4 h-4" /> :
              <TrendingDown className="w-4 h-4" />
            }
            <span className="text-sm">
              {portfolio.dailyChangePercent >= 0 ? '+' : ''}
              {portfolio.dailyChange.toLocaleString('ro-RO')} RON ({portfolio.dailyChangePercent}%)
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-blue-200 text-sm font-medium">Total Return</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-2">
            +{portfolio.totalReturn.toLocaleString('ro-RO')} RON
          </p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+{portfolio.totalReturnPercent}% overall</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-blue-200 text-sm font-medium">Active Investments</h3>
          <p className="text-3xl font-bold text-white mt-2">{mockInvestments.length}</p>
          <p className="text-blue-200 text-sm mt-2">Across {types.length - 1} asset classes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-blue-200 text-sm font-medium">Best Performer</h3>
          <p className="text-xl font-bold text-white mt-2">Bitcoin</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+85% return</span>
          </div>
        </motion.div>
      </div>

      {/* Allocation Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Portfolio Allocation</h3>
        <div className="grid md:grid-cols-6 gap-4">
          {Object.entries({
            'Stocks': { value: 32.5, color: 'bg-blue-500' },
            'Crypto': { value: 28.9, color: 'bg-yellow-500' },
            'Bonds': { value: 20.1, color: 'bg-emerald-500' },
            'ETFs': { value: 9.8, color: 'bg-purple-500' },
            'Real Estate': { value: 6.7, color: 'bg-orange-500' },
            'Cash': { value: 2.0, color: 'bg-gray-500' }
          }).map(([name, data]) => (
            <div key={name} className="text-center">
              <div className={`h-2 ${data.color} rounded-full mb-2`} style={{ width: `${data.value * 2}%` }}></div>
              <p className="text-white text-sm font-medium">{name}</p>
              <p className="text-blue-200 text-xs">{data.value}%</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
              <input
                type="text"
                placeholder="Search investments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 flex-wrap">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFilter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                  }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white">Holdings</h3>
          <p className="text-blue-200 text-sm mt-1">
            {filteredInvestments.length} investment{filteredInvestments.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="divide-y divide-white/10">
          {filteredInvestments.map((investment, index) => (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Investment Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(investment.type)}`}>
                    {getTypeIcon(investment.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-white font-semibold">{investment.name}</h4>
                      <span className="text-blue-200 font-mono text-sm">{investment.symbol}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(investment.type)}`}>
                        {investment.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-blue-200 text-sm">{investment.shares} shares</p>
                      <span className="text-blue-200">•</span>
                      <p className="text-blue-200 text-sm">{investment.exchange}</p>
                      {investment.sector && (
                        <>
                          <span className="text-blue-200">•</span>
                          <p className="text-blue-200 text-sm">{investment.sector}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price and Performance */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">
                    {investment.totalValue.toLocaleString('ro-RO')} {investment.currency}
                  </p>
                  <p className="text-blue-200 text-sm">
                    @ {investment.currentPrice.toLocaleString('ro-RO')} {investment.currency}
                  </p>
                  <div className="flex items-center gap-4 mt-2 justify-end">
                    <div className={`flex items-center gap-1 ${investment.dailyChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                      {investment.dailyChangePercent >= 0 ?
                        <ArrowUpRight className="w-4 h-4" /> :
                        <ArrowDownLeft className="w-4 h-4" />
                      }
                      <span className="text-sm">
                        {investment.dailyChangePercent >= 0 ? '+' : ''}
                        {investment.dailyChangePercent}%
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 ${investment.totalReturnPercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                      <Target className="w-4 h-4" />
                      <span className="text-sm">
                        {investment.totalReturnPercent >= 0 ? '+' : ''}
                        {investment.totalReturnPercent}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="p-6 border-t border-white/20 text-center">
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            Load More Holdings
          </button>
        </div>
      </div>

      {/* Investment Tools */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 backdrop-blur-md rounded-xl p-8 border border-white/20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Portfolio Analytics</h3>
              <p className="text-blue-200">Deep insights and performance analysis</p>
            </div>
          </div>
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            View Analytics
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-purple-600/20 to-yellow-600/20 backdrop-blur-md rounded-xl p-8 border border-white/20"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Investment Advisor</h3>
              <p className="text-blue-200">AI-powered investment recommendations</p>
            </div>
          </div>
          <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
            Get Advice
          </button>
        </motion.div>
      </div>
    </div>
  )
}
