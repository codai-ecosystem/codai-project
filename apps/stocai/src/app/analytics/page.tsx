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
  PieChart,
  Target,
  Filter,
  Download,
  Calendar,
  Globe,
  Percent,
  Volume2,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingFlat,
  LineChart,
  Calculator,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'

interface PerformanceMetric {
  period: string
  portfolioReturn: number
  marketReturn: number
  alpha: number
  beta: number
  sharpeRatio: number
  maxDrawdown: number
  winRate: number
}

interface SectorAllocation {
  sector: string
  allocation: number
  value: number
  return: number
  count: number
  color: string
}

interface TopPerformer {
  symbol: string
  name: string
  return: number
  value: number
  contribution: number
  sector: string
}

interface RiskMetric {
  metric: string
  value: number
  benchmark: number
  status: 'good' | 'warning' | 'risk'
  description: string
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('1Y')
  const [benchmarkIndex, setBenchmarkIndex] = useState('SPY')

  const [performanceData] = useState<PerformanceMetric[]>([
    {
      period: '1M',
      portfolioReturn: 3.2,
      marketReturn: 2.1,
      alpha: 1.1,
      beta: 1.15,
      sharpeRatio: 1.8,
      maxDrawdown: -2.1,
      winRate: 68
    },
    {
      period: '3M',
      portfolioReturn: 8.7,
      marketReturn: 6.2,
      alpha: 2.5,
      beta: 1.12,
      sharpeRatio: 1.9,
      maxDrawdown: -4.3,
      winRate: 71
    },
    {
      period: '6M',
      portfolioReturn: 15.4,
      marketReturn: 12.1,
      alpha: 3.3,
      beta: 1.18,
      sharpeRatio: 2.1,
      maxDrawdown: -6.8,
      winRate: 69
    },
    {
      period: '1Y',
      portfolioReturn: 24.8,
      marketReturn: 18.5,
      alpha: 6.3,
      beta: 1.16,
      sharpeRatio: 2.3,
      maxDrawdown: -8.9,
      winRate: 72
    },
    {
      period: '3Y',
      portfolioReturn: 78.2,
      marketReturn: 52.1,
      alpha: 26.1,
      beta: 1.14,
      sharpeRatio: 2.0,
      maxDrawdown: -15.2,
      winRate: 70
    }
  ])

  const [sectorAllocation] = useState<SectorAllocation[]>([
    {
      sector: 'Technology',
      allocation: 45.2,
      value: 220150.00,
      return: 28.5,
      count: 4,
      color: '#3B82F6'
    },
    {
      sector: 'Healthcare',
      allocation: 18.3,
      value: 89145.00,
      return: 15.2,
      count: 2,
      color: '#10B981'
    },
    {
      sector: 'Financial',
      allocation: 15.7,
      value: 76480.00,
      return: 12.8,
      count: 3,
      color: '#F59E0B'
    },
    {
      sector: 'Consumer',
      allocation: 12.4,
      value: 60415.00,
      return: 22.1,
      count: 2,
      color: '#EF4444'
    },
    {
      sector: 'Energy',
      allocation: 5.2,
      value: 25335.00,
      return: 8.9,
      count: 1,
      color: '#8B5CF6'
    },
    {
      sector: 'Cash',
      allocation: 3.2,
      value: 15580.00,
      return: 0.0,
      count: 0,
      color: '#6B7280'
    }
  ])

  const [topPerformers] = useState<TopPerformer[]>([
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      return: 42.8,
      value: 128085.00,
      contribution: 2.4,
      sector: 'Technology'
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      return: 28.5,
      value: 273615.00,
      contribution: 1.8,
      sector: 'Technology'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      return: 24.2,
      value: 280935.00,
      contribution: 1.6,
      sector: 'Technology'
    },
    {
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      return: 35.7,
      value: 98745.00,
      contribution: 1.2,
      sector: 'Technology'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      return: 18.9,
      value: 95380.00,
      contribution: 0.8,
      sector: 'Automotive'
    }
  ])

  const [riskMetrics] = useState<RiskMetric[]>([
    {
      metric: 'Portfolio Beta',
      value: 1.16,
      benchmark: 1.00,
      status: 'warning',
      description: 'Higher volatility than market'
    },
    {
      metric: 'Sharpe Ratio',
      value: 2.3,
      benchmark: 1.5,
      status: 'good',
      description: 'Excellent risk-adjusted returns'
    },
    {
      metric: 'Max Drawdown',
      value: -8.9,
      benchmark: -12.0,
      status: 'good',
      description: 'Lower than market drawdown'
    },
    {
      metric: 'Value at Risk (95%)',
      value: -3.2,
      benchmark: -4.1,
      status: 'good',
      description: 'Conservative risk exposure'
    },
    {
      metric: 'Correlation to S&P 500',
      value: 0.82,
      benchmark: 0.85,
      status: 'good',
      description: 'Moderate diversification'
    }
  ])

  const timeRanges = ['1M', '3M', '6M', '1Y', '3Y', '5Y']
  const benchmarks = ['SPY', 'QQQ', 'IWM', 'VTI']

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'risk': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Performance Overview', icon: BarChart3 },
    { id: 'allocation', label: 'Asset Allocation', icon: PieChart },
    { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
    { id: 'attribution', label: 'Performance Attribution', icon: Target },
    { id: 'comparison', label: 'Benchmark Comparison', icon: TrendingUp },
    { id: 'reports', label: 'Custom Reports', icon: Download }
  ]

  const currentPerformance = performanceData.find(p => p.period === timeRange) || performanceData[3]

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
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Portfolio Analytics</h1>
                  <p className="text-sm text-gray-500">Advanced performance insights</p>
                </div>
              </Link>
            </div>

            {/* Header Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-lg font-bold ${currentPerformance.portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(currentPerformance.portfolioReturn)}
                </div>
                <div className="text-xs text-gray-500">Portfolio Return</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-bold ${currentPerformance.alpha >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(currentPerformance.alpha)}
                </div>
                <div className="text-xs text-gray-500">Alpha</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{currentPerformance.sharpeRatio.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Sharpe Ratio</div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {timeRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
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
        {/* Performance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Return</p>
                <p className={`text-2xl font-bold ${currentPerformance.portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(currentPerformance.portfolioReturn)}
                </p>
                <p className="text-sm text-gray-500">{timeRange} period</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                {currentPerformance.portfolioReturn >= 0 ? 
                  <TrendingUp className="h-6 w-6 text-green-600" /> :
                  <TrendingDown className="h-6 w-6 text-green-600" />
                }
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alpha</p>
                <p className={`text-2xl font-bold ${currentPerformance.alpha >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(currentPerformance.alpha)}
                </p>
                <p className="text-sm text-gray-500">vs {benchmarkIndex}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-gray-900">{currentPerformance.sharpeRatio.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Risk-adjusted</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Max Drawdown</p>
                <p className="text-2xl font-bold text-red-600">{formatPercent(currentPerformance.maxDrawdown)}</p>
                <p className="text-sm text-gray-500">Peak to trough</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900">{currentPerformance.winRate}%</p>
                <p className="text-sm text-gray-500">Winning trades</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-indigo-600" />
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
            {/* Performance Comparison Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Performance Comparison</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={benchmarkIndex}
                    onChange={(e) => setBenchmarkIndex(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {benchmarks.map(benchmark => (
                      <option key={benchmark} value={benchmark}>{benchmark}</option>
                    ))}
                  </select>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
              
              {/* Performance Chart Placeholder */}
              <div className="h-64 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">Interactive Performance Chart</h4>
                  <p className="text-gray-500">Portfolio vs Benchmark Performance Over Time</p>
                </div>
              </div>
            </div>

            {/* Performance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics by Period</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolio Return</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Return</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alpha</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beta</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sharpe Ratio</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Drawdown</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {performanceData.map((period) => (
                      <tr key={period.period} className={`hover:bg-gray-50 ${period.period === timeRange ? 'bg-green-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.period}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${period.portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(period.portfolioReturn)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${period.marketReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(period.marketReturn)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${period.alpha >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(period.alpha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{period.beta.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{period.sharpeRatio.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatPercent(period.maxDrawdown)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{period.winRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Performers and Risk Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Performers */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performers</h3>
                <div className="space-y-4">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.symbol} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{performer.symbol}</div>
                          <div className="text-sm text-gray-500">{performer.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">{formatPercent(performer.return)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(performer.value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Metrics */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Assessment</h3>
                <div className="space-y-4">
                  {riskMetrics.map((metric) => (
                    <div key={metric.metric} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{metric.metric}</div>
                        <div className="text-sm text-gray-500">{metric.description}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {metric.metric.includes('%') || metric.metric.includes('Ratio') || metric.metric.includes('Correlation') ? 
                              metric.value.toFixed(2) : 
                              formatPercent(metric.value)
                            }
                          </div>
                          <div className="text-xs text-gray-500">
                            vs {metric.metric.includes('%') || metric.metric.includes('Ratio') || metric.metric.includes('Correlation') ? 
                              metric.benchmark.toFixed(2) : 
                              formatPercent(metric.benchmark)
                            }
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                          {metric.status === 'good' ? <CheckCircle className="w-3 h-3 mr-1" /> : 
                           metric.status === 'warning' ? <AlertTriangle className="w-3 h-3 mr-1" /> :
                           <TrendingDown className="w-3 h-3 mr-1" />}
                          {metric.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Other tabs placeholder */}
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
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <BarChart3 className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-green-100 text-sm mb-4">Deep-dive into portfolio performance with institutional-grade analytics.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Explore Analytics <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <Target className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Performance Attribution</h3>
              <p className="text-blue-100 text-sm mb-4">Understand what's driving your portfolio performance at the security level.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                View Attribution <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <Calculator className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Risk Management</h3>
              <p className="text-purple-100 text-sm mb-4">Comprehensive risk analysis and stress testing for your investments.</p>
              <button className="text-white text-sm font-medium hover:underline flex items-center">
                Assess Risk <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
