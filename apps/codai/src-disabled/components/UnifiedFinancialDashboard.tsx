'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  CreditCard,
  Coins,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Send,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import FinancialEcosystemService, { PortfolioSummary, UnifiedTransaction, FinancialInsight } from '../../../packages/core/src/services/financialEcosystemService'

const financialService = new FinancialEcosystemService()

const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const TransactionIcon = ({ platform, type }: { platform: string, type: string }) => {
  if (platform === 'bancai') {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-blue-500" />
      case 'transfer':
        return <ArrowUpDown className="w-4 h-4 text-green-500" />
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />
      default:
        return <PiggyBank className="w-4 h-4 text-blue-500" />
    }
  } else {
    switch (type) {
      case 'swap':
        return <ArrowUpDown className="w-4 h-4 text-purple-500" />
      case 'stake':
        return <Target className="w-4 h-4 text-orange-500" />
      case 'nft':
        return <Activity className="w-4 h-4 text-pink-500" />
      default:
        return <Coins className="w-4 h-4 text-yellow-500" />
    }
  }
}

const InsightIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'investment_opportunity':
      return <TrendingUp className="w-5 h-5 text-green-500" />
    case 'risk_alert':
      return <AlertTriangle className="w-5 h-5 text-red-500" />
    case 'savings_goal':
      return <Target className="w-5 h-5 text-blue-500" />
    case 'spending_pattern':
      return <BarChart3 className="w-5 h-5 text-orange-500" />
    default:
      return <Activity className="w-5 h-5 text-gray-500" />
  }
}

export default function UnifiedFinancialDashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([])
  const [insights, setInsights] = useState<FinancialInsight[]>([])
  const [showBalances, setShowBalances] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setRefreshing(true)
      const userId = 'demo-user-1'

      // For demo purposes, use demo data
      const demoData = await financialService.getDemoData(userId)

      setPortfolio(demoData.unifiedPortfolio)
      setTransactions(demoData.recentTransactions as any)
      setInsights(demoData.insights as any)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Generate chart data
  const portfolioDistribution = portfolio ? [
    {
      name: 'Traditional Assets',
      value: portfolio.traditionalAssets.totalValue,
      percentage: (portfolio.traditionalAssets.totalValue / portfolio.totalValue) * 100,
      color: '#3B82F6'
    },
    {
      name: 'Digital Assets',
      value: portfolio.digitalAssets.totalValue,
      percentage: (portfolio.digitalAssets.totalValue / portfolio.totalValue) * 100,
      color: '#F59E0B'
    }
  ] : []

  const performanceData = [
    { period: '1D', change: portfolio?.performance.dayChange || 0 },
    { period: '1W', change: portfolio?.performance.weekChange || 0 },
    { period: '1M', change: portfolio?.performance.monthChange || 0 },
    { period: '1Y', change: portfolio?.performance.yearChange || 0 }
  ]

  const balanceHistory = [
    { date: 'Jan', traditional: 12000, digital: 25000, total: 37000 },
    { date: 'Feb', traditional: 13500, digital: 27000, total: 40500 },
    { date: 'Mar', traditional: 14200, digital: 26500, total: 40700 },
    { date: 'Apr', traditional: 14800, digital: 29000, total: 43800 },
    { date: 'May', traditional: 15100, digital: 30200, total: 45300 },
    { date: 'Jun', traditional: 15234, digital: 30444, total: 45678 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Financial Ecosystem</h1>
              <p className="text-blue-100 mt-1">Unified Traditional & Digital Finance Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDashboardData}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg border border-white/20 transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 text-white ${refreshing ? 'animate-spin' : ''}`} />
                <span className="text-white text-sm">Refresh</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Portfolio</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-white">
                    {showBalances && portfolio ? formatCurrency(portfolio.totalValue) : '••••••'}
                  </p>
                  <button
                    onClick={() => setShowBalances(!showBalances)}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className={`text-sm font-medium ${portfolio && portfolio.performance.dayChange >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {portfolio && portfolio.performance.dayChange >= 0 ? '+' : ''}{portfolio?.performance.dayChange.toFixed(2)}% (24h)
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-300" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Traditional Assets</p>
                <p className="text-2xl font-bold text-white">
                  {showBalances && portfolio ? formatCurrency(portfolio.traditionalAssets.totalValue) : '••••••'}
                </p>
                <p className="text-blue-300 text-sm">
                  {portfolio?.traditionalAssets.bankAccounts} accounts
                </p>
              </div>
              <PiggyBank className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Digital Assets</p>
                <p className="text-2xl font-bold text-white">
                  {showBalances && portfolio ? formatCurrency(portfolio.digitalAssets.totalValue) : '••••••'}
                </p>
                <p className="text-yellow-300 text-sm">
                  {portfolio?.digitalAssets.cryptocurrencies} cryptocurrencies
                </p>
              </div>
              <Wallet className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Monthly Performance</p>
                <p className={`text-2xl font-bold ${portfolio && portfolio.performance.monthChange >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {portfolio && portfolio.performance.monthChange >= 0 ? '+' : ''}{portfolio?.performance.monthChange.toFixed(1)}%
                </p>
                <p className="text-blue-300 text-sm">vs last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Portfolio Balance History</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={balanceHistory}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#DBEAFE" />
                <YAxis stroke="#DBEAFE" />
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Line type="monotone" dataKey="traditional" stroke="#60A5FA" strokeWidth={2} />
                <Line type="monotone" dataKey="digital" stroke="#F59E0B" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={portfolioDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {portfolioDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-blue-100">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Financial Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Financial Insights</h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`bg-white/5 rounded-lg p-4 border-l-4 ${insight.priority === 'high' ? 'border-red-500' :
                      insight.priority === 'medium' ? 'border-yellow-500' :
                        'border-blue-500'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <InsightIcon type={insight.type} />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{insight.title}</h4>
                      <p className="text-blue-200 text-sm mt-1">{insight.description}</p>
                      {insight.actionable && (
                        <button className="text-blue-400 text-sm font-medium mt-2 hover:text-blue-300 transition-colors">
                          Take Action →
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <div className="flex items-center space-x-2">
              <span className="text-blue-300 text-sm">Across all platforms</span>
            </div>
          </div>
          <div className="space-y-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TransactionIcon platform={transaction.platform} type={transaction.type} />
                    <div>
                      <p className="text-white font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.platform === 'bancai'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                          {transaction.platform === 'bancai' ? 'BANCAI' : 'WALLET'}
                        </span>
                        <p className="text-blue-200 text-sm">{formatDate(transaction.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === 'deposit' ? 'text-green-400' :
                        transaction.type === 'withdrawal' || transaction.type === 'payment' ? 'text-red-400' :
                          'text-blue-400'
                      }`}>
                      {transaction.type === 'deposit' ? '+' :
                        transaction.type === 'withdrawal' || transaction.type === 'payment' ? '-' : ''}
                      {transaction.amount} {transaction.currency}
                    </p>
                    <p className={`text-xs font-medium ${transaction.status === 'confirmed' ? 'text-green-400' :
                        transaction.status === 'pending' ? 'text-yellow-400' :
                          'text-red-400'
                      }`}>
                      {transaction.status.toUpperCase()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-white/10 hover:bg-white/20 rounded-lg p-4 border border-white/20 transition-all duration-200 hover:scale-105 group">
              <PiggyBank className="w-6 h-6 text-blue-300 mx-auto mb-2 group-hover:text-white transition-colors" />
              <p className="text-blue-100 text-sm group-hover:text-white transition-colors">Open BANCAI</p>
            </button>
            <button className="bg-white/10 hover:bg-white/20 rounded-lg p-4 border border-white/20 transition-all duration-200 hover:scale-105 group">
              <Wallet className="w-6 h-6 text-yellow-300 mx-auto mb-2 group-hover:text-white transition-colors" />
              <p className="text-blue-100 text-sm group-hover:text-white transition-colors">Open WALLET</p>
            </button>
            <button className="bg-white/10 hover:bg-white/20 rounded-lg p-4 border border-white/20 transition-all duration-200 hover:scale-105 group">
              <ArrowUpDown className="w-6 h-6 text-green-300 mx-auto mb-2 group-hover:text-white transition-colors" />
              <p className="text-blue-100 text-sm group-hover:text-white transition-colors">Cross Transfer</p>
            </button>
            <button className="bg-white/10 hover:bg-white/20 rounded-lg p-4 border border-white/20 transition-all duration-200 hover:scale-105 group">
              <BarChart3 className="w-6 h-6 text-purple-300 mx-auto mb-2 group-hover:text-white transition-colors" />
              <p className="text-blue-100 text-sm group-hover:text-white transition-colors">Analytics</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
