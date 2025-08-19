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
  Briefcase,
  PieChart,
  Target,
  Filter,
  Download,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Globe,
  Percent
} from 'lucide-react'
import Link from 'next/link'

interface Position {
  symbol: string
  name: string
  shares: number
  avgCost: number
  currentPrice: number
  marketValue: number
  dayChange: number
  dayChangePercent: number
  totalReturn: number
  totalReturnPercent: number
  sector: string
  aiScore: number
  risk: 'Low' | 'Medium' | 'High'
}

interface PortfolioStats {
  totalValue: number
  totalCost: number
  totalReturn: number
  totalReturnPercent: number
  dayChange: number
  dayChangePercent: number
  cashBalance: number
  dividendYield: number
  beta: number
}

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState('positions')
  const [filterSector, setFilterSector] = useState('all')
  const [sortBy, setSortBy] = useState('marketValue')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [portfolioStats] = useState<PortfolioStats>({
    totalValue: 487234.50,
    totalCost: 445670.25,
    totalReturn: 41564.25,
    totalReturnPercent: 9.32,
    dayChange: 2845.67,
    dayChangePercent: 0.59,
    cashBalance: 15670.30,
    dividendYield: 2.4,
    beta: 1.15
  })

  const [positions] = useState<Position[]>([
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 150,
      avgCost: 165.50,
      currentPrice: 182.41,
      marketValue: 27361.50,
      dayChange: 351.00,
      dayChangePercent: 1.30,
      totalReturn: 2536.50,
      totalReturnPercent: 10.21,
      sector: 'Technology',
      aiScore: 92,
      risk: 'Medium'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      shares: 75,
      avgCost: 340.25,
      currentPrice: 374.58,
      marketValue: 28093.50,
      dayChange: 425.25,
      dayChangePercent: 1.54,
      totalReturn: 2574.75,
      totalReturnPercent: 10.09,
      sector: 'Technology',
      aiScore: 89,
      risk: 'Low'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 50,
      avgCost: 142.80,
      currentPrice: 138.21,
      marketValue: 6910.50,
      dayChange: -72.50,
      dayChangePercent: -1.04,
      totalReturn: -229.50,
      totalReturnPercent: -3.21,
      sector: 'Technology',
      aiScore: 85,
      risk: 'Medium'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      shares: 40,
      avgCost: 220.15,
      currentPrice: 238.45,
      marketValue: 9538.00,
      dayChange: 493.60,
      dayChangePercent: 5.46,
      totalReturn: 732.00,
      totalReturnPercent: 8.31,
      sector: 'Automotive',
      aiScore: 78,
      risk: 'High'
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      shares: 60,
      avgCost: 158.90,
      currentPrice: 153.37,
      marketValue: 9202.20,
      dayChange: -126.00,
      dayChangePercent: -1.35,
      totalReturn: -331.80,
      totalReturnPercent: -3.48,
      sector: 'E-commerce',
      aiScore: 81,
      risk: 'Medium'
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      shares: 25,
      avgCost: 480.50,
      currentPrice: 512.34,
      marketValue: 12808.50,
      dayChange: 89.25,
      dayChangePercent: 0.70,
      totalReturn: 796.00,
      totalReturnPercent: 6.62,
      sector: 'Technology',
      aiScore: 94,
      risk: 'High'
    }
  ])

  const [performanceHistory] = useState([
    { date: '2025-08-01', value: 475234.50 },
    { date: '2025-08-02', value: 478891.25 },
    { date: '2025-08-03', value: 472156.80 },
    { date: '2025-08-04', value: 485267.90 },
    { date: '2025-08-05', value: 482945.60 },
    { date: '2025-08-06', value: 484388.83 },
    { date: '2025-08-07', value: 487234.50 }
  ])

  const sectors = ['all', 'Technology', 'Automotive', 'E-commerce', 'Healthcare', 'Finance']

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  const filteredPositions = positions
    .filter(position => filterSector === 'all' || position.sector === filterSector)
    .sort((a, b) => {
      const aValue = a[sortBy as keyof Position]
      const bValue = b[sortBy as keyof Position]
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })

  const tabs = [
    { id: 'positions', label: 'Positions', icon: Briefcase },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'allocation', label: 'Allocation', icon: PieChart },
    { id: 'analysis', label: 'AI Analysis', icon: Bot },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'High': return 'text-red-600 bg-red-100'
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
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Portfolio Management</h1>
                  <p className="text-sm text-gray-500">Track & optimize your investments</p>
                </div>
              </Link>
            </div>

            {/* Header Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{formatCurrency(portfolioStats.totalValue)}</div>
                <div className="text-xs text-gray-500">Total Value</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${portfolioStats.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(portfolioStats.totalReturnPercent)}
                </div>
                <div className="text-xs text-gray-500">Total Return</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${portfolioStats.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(portfolioStats.dayChangePercent)}
                </div>
                <div className="text-xs text-gray-500">Today's Change</div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <Link href="/settings" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioStats.totalValue)}</p>
                <p className={`text-sm ${portfolioStats.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(portfolioStats.dayChangePercent)} today
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Return</p>
                <p className={`text-2xl font-bold ${portfolioStats.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(portfolioStats.totalReturn)}
                </p>
                <p className="text-sm text-gray-500">{formatPercent(portfolioStats.totalReturnPercent)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                {portfolioStats.totalReturn >= 0 ?
                  <TrendingUp className="h-6 w-6 text-blue-600" /> :
                  <TrendingDown className="h-6 w-6 text-blue-600" />
                }
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cash Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolioStats.cashBalance)}</p>
                <p className="text-sm text-gray-500">Available to invest</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Beta</p>
                <p className="text-2xl font-bold text-gray-900">{portfolioStats.beta}</p>
                <p className="text-sm text-gray-500">{portfolioStats.dividendYield}% div yield</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

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
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className={`mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Positions Tab Content */}
        {activeTab === 'positions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Filters and Controls */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
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
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="marketValue">Market Value</option>
                      <option value="totalReturnPercent">Total Return %</option>
                      <option value="dayChangePercent">Day Change %</option>
                      <option value="aiScore">AI Score</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span>Add Position</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Positions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day Change</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Return</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Score</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPositions.map((position) => (
                      <tr key={position.symbol} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-bold text-gray-900">{position.symbol}</div>
                            <div className="text-sm text-gray-500">{position.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{position.shares}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(position.avgCost)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(position.currentPrice)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(position.marketValue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${position.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(position.dayChange)}
                          </div>
                          <div className={`text-xs ${position.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercent(position.dayChangePercent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${position.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(position.totalReturn)}
                          </div>
                          <div className={`text-xs ${position.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercent(position.totalReturnPercent)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAIScoreColor(position.aiScore)}`}>
                            {position.aiScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(position.risk)}`}>
                            {position.risk}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-green-600 hover:text-green-900">
                              <Plus className="h-4 w-4" />
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
          </motion.div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== 'positions' && (
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
              <PieChart className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Portfolio Optimization</h3>
              <p className="text-green-100 text-sm mb-4">AI-powered portfolio rebalancing and optimization recommendations.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Optimize Portfolio <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <Bot className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">AI Investment Advisor</h3>
              <p className="text-blue-100 text-sm mb-4">Get personalized investment recommendations based on your risk profile.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Get AI Advice <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <Target className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Risk Analytics</h3>
              <p className="text-purple-100 text-sm mb-4">Advanced risk assessment and stress testing for your portfolio.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Analyze Risk <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
