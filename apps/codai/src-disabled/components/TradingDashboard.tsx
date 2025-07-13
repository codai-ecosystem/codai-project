'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Percent,
  Zap
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import FinancialEcosystemService, { TradingAnalytics, TradingPosition, UnifiedPortfolioSummary } from '../../../../packages/core/src/services/financialEcosystemService'

const financialService = new FinancialEcosystemService()

const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

const formatPercentage = (value: number) => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

const AssetTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'stock':
      return <BarChart3 className="w-4 h-4 text-blue-500" />
    case 'crypto':
      return <Activity className="w-4 h-4 text-orange-500" />
    case 'forex':
      return <TrendingUp className="w-4 h-4 text-green-500" />
    case 'commodity':
      return <Target className="w-4 h-4 text-yellow-500" />
    case 'option':
      return <Zap className="w-4 h-4 text-purple-500" />
    default:
      return <BarChart3 className="w-4 h-4 text-gray-500" />
  }
}

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#F97316']

export default function TradingDashboard() {
  const [tradingData, setTradingData] = useState<TradingAnalytics | null>(null)
  const [unifiedPortfolio, setUnifiedPortfolio] = useState<UnifiedPortfolioSummary | null>(null)
  const [showBalances, setShowBalances] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<TradingPosition | null>(null)

  useEffect(() => {
    loadTradingData()
  }, [])

  const loadTradingData = async () => {
    try {
      setLoading(true)
      const [trading, unified] = await Promise.all([
        financialService.getTradingPortfolio('user_001'),
        financialService.getUnifiedPortfolioWithTrading('user_001')
      ])

      setTradingData(trading)
      setUnifiedPortfolio(unified)
    } catch (error) {
      console.error('Error loading trading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadTradingData()
    setRefreshing(false)
  }

  const openXTradingPlatform = () => {
    window.open('http://localhost:4039', '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!tradingData || !unifiedPortfolio) {
    return (
      <div className="text-center text-slate-400">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
        <p>Unable to load trading data</p>
      </div>
    )
  }

  const allocationData = Object.entries(tradingData.assetAllocation).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value as number,
    amount: (tradingData.totalPortfolioValue * (value as number)) / 100
  }))

  const performanceData = [
    { name: 'Jan', value: 35000 },
    { name: 'Feb', value: 38000 },
    { name: 'Mar', value: 35500 },
    { name: 'Apr', value: 40000 },
    { name: 'May', value: 42000 },
    { name: 'Jun', value: tradingData.totalPortfolioValue }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Trading Dashboard</span>
          </h1>
          <p className="text-xl text-slate-300">AI-Powered Trading & Portfolio Management</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 glass-card hover:bg-white/20 transition-colors"
          >
            {showBalances ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          <button
            onClick={handleRefresh}
            className={`p-2 glass-card hover:bg-white/20 transition-colors ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={openXTradingPlatform}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open X Trading</span>
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="data-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Portfolio Value</div>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">
            {showBalances ? formatCurrency(tradingData.totalPortfolioValue) : '••••••'}
          </div>
          <div className={`text-sm flex items-center ${tradingData.dayChangePercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {tradingData.dayChangePercentage >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownLeft className="w-4 h-4 mr-1" />}
            {formatPercentage(tradingData.dayChangePercentage)} today
          </div>
        </motion.div>

        <motion.div
          className="data-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Total P&L</div>
            <Percent className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold">
            {showBalances ? formatCurrency(tradingData.totalPnl) : '••••••'}
          </div>
          <div className={`text-sm ${tradingData.totalPnlPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatPercentage(tradingData.totalPnlPercentage)} return
          </div>
        </motion.div>

        <motion.div
          className="data-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Positions</div>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold">{tradingData.positions.length}</div>
          <div className="text-sm text-slate-400">Active trades</div>
        </motion.div>

        <motion.div
          className="data-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Risk Score</div>
            <Target className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold">{tradingData.riskMetrics.riskScore}/10</div>
          <div className="text-sm text-slate-400">Moderate risk</div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Portfolio Performance Chart */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-3 text-blue-400" />
            Portfolio Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={(value: any) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fill="url(#colorGradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Asset Allocation */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <PieChart className="w-5 h-5 mr-3 text-purple-400" />
            Asset Allocation
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }: any) => `${name}: ${value.toFixed(1)}%`}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}%`,
                    name
                  ]}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Positions Table */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-3 text-green-400" />
          Current Positions
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-700">
              <tr className="text-left text-slate-400 text-sm">
                <th className="pb-3">Asset</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Avg Price</th>
                <th className="pb-3">Current Price</th>
                <th className="pb-3">Market Value</th>
                <th className="pb-3">P&L</th>
                <th className="pb-3">P&L %</th>
              </tr>
            </thead>
            <tbody>
              {tradingData.positions.map((position: TradingPosition, index: number) => (
                <motion.tr
                  key={position.id}
                  className="border-b border-slate-800 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => setSelectedPosition(position)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <AssetTypeIcon type={position.assetType} />
                      <div>
                        <div className="font-medium">{position.symbol}</div>
                        <div className="text-sm text-slate-400">{position.exchange}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-slate-700 rounded text-xs capitalize">
                      {position.assetType}
                    </span>
                  </td>
                  <td className="py-4">{position.quantity}</td>
                  <td className="py-4">{formatCurrency(position.averagePrice)}</td>
                  <td className="py-4">{formatCurrency(position.currentPrice)}</td>
                  <td className="py-4 font-medium">
                    {showBalances ? formatCurrency(position.marketValue) : '••••••'}
                  </td>
                  <td className={`py-4 font-medium ${position.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {showBalances ? formatCurrency(position.unrealizedPnl) : '••••••'}
                  </td>
                  <td className={`py-4 font-medium ${position.unrealizedPnlPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatPercentage(position.unrealizedPnlPercentage)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Risk Metrics */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3 text-orange-400" />
          Risk Metrics & Analytics
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{tradingData.riskMetrics.volatility}%</div>
            <div className="text-sm text-slate-400">Volatility</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{tradingData.riskMetrics.sharpeRatio}</div>
            <div className="text-sm text-slate-400">Sharpe Ratio</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{tradingData.riskMetrics.maxDrawdown}%</div>
            <div className="text-sm text-slate-400">Max Drawdown</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{tradingData.riskMetrics.riskScore}/10</div>
            <div className="text-sm text-slate-400">Risk Score</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
