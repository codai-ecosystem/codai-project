'use client'

import React, { useState, useEffect } from 'react'
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
  Eye,
  PieChart,
  Target
} from 'lucide-react'
import Link from 'next/link'

interface Stock {
  symbol: string
  price: number
  change: number
  changePercent: number
}

interface MarketIndex {
  name: string
  value: number
  change: number
  changePercent: number
}

export default function StocAIDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')

  const [marketData] = useState<MarketIndex[]>([
    { name: 'S&P 500', value: 4731.23, change: 12.45, changePercent: 0.26 },
    { name: 'DOW JONES', value: 36585.06, change: -89.22, changePercent: -0.24 },
    { name: 'NASDAQ', value: 14689.3, change: 156.78, changePercent: 1.08 }
  ])

  const [portfolio] = useState({
    totalValue: 487234.50,
    todayGain: 2845.67,
    todayGainPercent: 0.59,
    positions: 42,
    cashAvailable: 15670.30
  })

  const [watchlist] = useState<Stock[]>([
    { symbol: 'AAPL', price: 182.41, change: 2.34, changePercent: 1.3 },
    { symbol: 'GOOGL', price: 138.21, change: -1.45, changePercent: -1.04 },
    { symbol: 'MSFT', price: 374.58, change: 5.67, changePercent: 1.54 },
    { symbol: 'AMZN', price: 153.37, change: -2.1, changePercent: -1.35 },
    { symbol: 'TSLA', price: 238.45, change: 12.34, changePercent: 5.46 }
  ])

  const [aiInsights] = useState([
    {
      type: 'opportunity',
      confidence: 92,
      text: 'Technology stocks showing strong momentum for Q4 - consider increasing allocation'
    },
    {
      type: 'warning',
      confidence: 87,
      text: 'High volatility detected in TSLA - recommend setting stop-loss orders'
    },
    {
      type: 'strategy',
      confidence: 89,
      text: 'Energy sector presenting oversold opportunities in current market cycle'
    }
  ])

  const [recentTrades] = useState([
    { symbol: 'AAPL', action: 'BUY', shares: 50, price: 180.00, time: '10:30 AM' },
    { symbol: 'MSFT', action: 'SELL', shares: 25, price: 372.15, time: '09:45 AM' },
    { symbol: 'GOOGL', action: 'BUY', shares: 10, price: 140.50, time: '09:15 AM' }
  ])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'portfolio', label: 'My Portfolio', icon: Briefcase },
    { id: 'ai-insights', label: 'AI Insights', icon: Bot },
    { id: 'watchlist', label: 'Watchlist', icon: Eye },
    { id: 'activity', label: 'Recent Activity', icon: Activity }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">StocAI Dashboard</h1>
                  <p className="text-sm text-gray-500">AI-Powered Trading Intelligence</p>
                </div>
              </div>
            </div>

            {/* Header Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{formatCurrency(portfolio.totalValue)}</div>
                <div className="text-xs text-gray-500">Portfolio Value</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{formatPercent(portfolio.todayGainPercent)}</div>
                <div className="text-xs text-gray-500">Today's Return</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{portfolio.positions}</div>
                <div className="text-xs text-gray-500">Active Positions</div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 font-medium">Markets Open</span>
                <span className="text-gray-400">{currentTime.toLocaleTimeString()}</span>
              </div>
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

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio.totalValue)}</p>
                    <p className="text-sm text-green-600">+{formatPercent(portfolio.todayGainPercent)} today</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Gain</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(portfolio.todayGain)}</p>
                    <p className="text-sm text-gray-500">Net change</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Positions</p>
                    <p className="text-2xl font-bold text-gray-900">{portfolio.positions}</p>
                    <p className="text-sm text-gray-500">Holdings</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cash Available</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio.cashAvailable)}</p>
                    <p className="text-sm text-gray-500">Buying power</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Link href="/portfolio" className="group p-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105">
                  <Briefcase className="h-6 w-6 mb-2" />
                  <div className="text-sm font-medium">Portfolio</div>
                </Link>

                <Link href="/watchlist" className="group p-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105">
                  <Eye className="h-6 w-6 mb-2" />
                  <div className="text-sm font-medium">Watchlist</div>
                </Link>

                <Link href="/analytics" className="group p-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105">
                  <PieChart className="h-6 w-6 mb-2" />
                  <div className="text-sm font-medium">Analytics</div>
                </Link>

                <Link href="/ai-trading" className="group p-4 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105">
                  <Bot className="h-6 w-6 mb-2" />
                  <div className="text-sm font-medium">AI Trading</div>
                </Link>

                <Link href="/settings" className="group p-4 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105">
                  <Settings className="h-6 w-6 mb-2" />
                  <div className="text-sm font-medium">Settings</div>
                </Link>

                <button className="group p-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105">
                  <Target className="h-6 w-6 mb-2" />
                  <div className="text-sm font-medium">Trade Now</div>
                </button>
              </div>
            </div>

            {/* Market Indices and AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Market Indices */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Market Indices</h3>
                <div className="space-y-4">
                  {marketData.map((index) => (
                    <div key={index.name} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div>
                        <div className="font-semibold text-gray-900">{index.name}</div>
                        <div className="text-lg font-bold text-gray-900">{index.value.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {index.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span className="font-semibold">{formatPercent(index.changePercent)}</span>
                        </div>
                        <div className={`text-sm ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">AI Trading Insights</h3>
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="p-4 rounded-lg border border-purple-100 bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${insight.type === 'opportunity' ? 'bg-green-100 text-green-800' :
                            insight.type === 'warning' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                          }`}>
                          {insight.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                      </div>
                      <p className="text-sm text-gray-700">{insight.text}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                  Get More AI Insights
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other tabs would show relevant content */}
        {activeTab !== 'overview' && (
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
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <BarChart3 className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Advanced Portfolio Analytics</h3>
              <p className="text-blue-100 text-sm mb-4">Deep insights into your investment performance with AI-powered recommendations.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Explore Analytics <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <Bot className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">AI Trading Assistant</h3>
              <p className="text-green-100 text-sm mb-4">Let our AI help you make smarter trading decisions with real-time market analysis.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Start AI Trading <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <Target className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Smart Risk Management</h3>
              <p className="text-purple-100 text-sm mb-4">Protect your investments with intelligent risk assessment and automated alerts.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Manage Risk <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

