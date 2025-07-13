/**
 * ExplorerDashboard - Advanced Blockchain Analytics Dashboard
 * Comprehensive blockchain exploration with real-time data, DeFi tracking, and MEV analysis
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Database,
  Clock,
  Blocks,
  FileText,
  Wallet,
  Coins,
  Eye,
  AlertTriangle,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Download,
  Share,
  MoreHorizontal,
  ChevronRight,
  Users,
  Globe,
  Layers,
  PieChart,
  BarChart3,
  LineChart,
  Timer,
  Target,
  Flame,
  Lock,
  Unlock,
  Search,
  Star,
  ExternalLink
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface DashboardMetric {
  id: string
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  icon: React.ReactNode
  color: string
  subtitle?: string
  action?: () => void
}

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  gasUsed: string
  gasPrice: string
  status: 'success' | 'failed' | 'pending'
  type: 'transfer' | 'contract' | 'defi' | 'mev'
  timestamp: Date
  blockNumber: number
}

interface Block {
  number: number
  hash: string
  timestamp: Date
  transactions: number
  gasUsed: string
  gasLimit: string
  miner: string
  difficulty: string
  size: string
}

interface DeFiProtocol {
  name: string
  tvl: number
  volume24h: number
  change24h: number
  category: string
  logo: string
  transactions: number
}

interface MEVData {
  type: 'arbitrage' | 'liquidation' | 'sandwich' | 'frontrun'
  profit: number
  volume: number
  transactions: number
  timestamp: Date
}

interface AlertConfig {
  type: 'gas' | 'price' | 'volume' | 'mev' | 'defi'
  condition: 'above' | 'below' | 'change'
  value: number
  enabled: boolean
}

const ExplorerDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h')
  const [selectedMetrics, setSelectedMetrics] = useState(new Set(['all']))
  const [liveUpdates, setLiveUpdates] = useState(true)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [realtimeData, setRealtimeData] = useState<any>(null)
  const [transactionData, setTransactionData] = useState<Transaction[]>([])
  const [blockData, setBlockData] = useState<Block[]>([])
  const [defiData, setDefiData] = useState<DeFiProtocol[]>([])
  const [mevData, setMevData] = useState<MEVData[]>([])
  const [alerts, setAlerts] = useState<AlertConfig[]>([])

  // Generate mock data
  useEffect(() => {
    const generateMockData = () => {
      // Mock realtime metrics
      setRealtimeData({
        blockHeight: 18500000 + Math.floor(Math.random() * 1000),
        gasPrice: 20 + Math.random() * 50,
        tps: 12 + Math.random() * 8,
        pendingTxs: 2500 + Math.floor(Math.random() * 1000),
        marketPrice: 2400 + Math.random() * 200,
        change24h: (Math.random() - 0.5) * 10,
        totalAddresses: 250000000 + Math.floor(Math.random() * 1000000),
        dailyTransactions: 1200000 + Math.floor(Math.random() * 100000),
        networkHashrate: '180 TH/s',
        totalSupply: '120,373,863 ETH'
      })

      // Mock transactions
      const mockTransactions: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
        hash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
        from: `0x${Math.random().toString(16).slice(2).padStart(40, '0')}`,
        to: `0x${Math.random().toString(16).slice(2).padStart(40, '0')}`,
        value: (Math.random() * 100).toFixed(4),
        gasUsed: (Math.random() * 100000).toFixed(0),
        gasPrice: (Math.random() * 100).toFixed(0),
        status: Math.random() > 0.1 ? 'success' : Math.random() > 0.5 ? 'failed' : 'pending',
        type: ['transfer', 'contract', 'defi', 'mev'][Math.floor(Math.random() * 4)] as any,
        timestamp: new Date(Date.now() - Math.random() * 3600000),
        blockNumber: 18500000 + Math.floor(Math.random() * 100)
      }))
      setTransactionData(mockTransactions)

      // Mock blocks
      const mockBlocks: Block[] = Array.from({ length: 10 }, (_, i) => ({
        number: 18500000 - i,
        hash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`,
        timestamp: new Date(Date.now() - i * 12000),
        transactions: Math.floor(Math.random() * 300) + 50,
        gasUsed: (Math.random() * 30000000).toFixed(0),
        gasLimit: '30000000',
        miner: `0x${Math.random().toString(16).slice(2).padStart(40, '0')}`,
        difficulty: (Math.random() * 1000).toFixed(2) + ' TH',
        size: (Math.random() * 100).toFixed(1) + ' KB'
      }))
      setBlockData(mockBlocks)

      // Mock DeFi protocols
      const defiProtocols: DeFiProtocol[] = [
        {
          name: 'Uniswap V3',
          tvl: 3200000000,
          volume24h: 1500000000,
          change24h: 5.2,
          category: 'DEX',
          logo: '🦄',
          transactions: 45000
        },
        {
          name: 'Aave',
          tvl: 8900000000,
          volume24h: 890000000,
          change24h: -2.1,
          category: 'Lending',
          logo: '👻',
          transactions: 23000
        },
        {
          name: 'Compound',
          tvl: 2100000000,
          volume24h: 450000000,
          change24h: 3.8,
          category: 'Lending',
          logo: '🏛️',
          transactions: 18000
        },
        {
          name: 'Curve',
          tvl: 4500000000,
          volume24h: 320000000,
          change24h: 1.2,
          category: 'DEX',
          logo: '〰️',
          transactions: 12000
        }
      ]
      setDefiData(defiProtocols)

      // Mock MEV data
      const mockMevData: MEVData[] = Array.from({ length: 50 }, (_, i) => ({
        type: ['arbitrage', 'liquidation', 'sandwich', 'frontrun'][Math.floor(Math.random() * 4)] as any,
        profit: Math.random() * 10000,
        volume: Math.random() * 1000000,
        transactions: Math.floor(Math.random() * 20) + 1,
        timestamp: new Date(Date.now() - Math.random() * 86400000)
      }))
      setMevData(mockMevData)
    }

    generateMockData()

    if (liveUpdates) {
      const interval = setInterval(generateMockData, 5000)
      return () => clearInterval(interval)
    }
  }, [liveUpdates])

  // Dashboard metrics
  const metrics: DashboardMetric[] = [
    {
      id: 'blockHeight',
      title: 'Latest Block',
      value: realtimeData?.blockHeight?.toLocaleString() || '---',
      icon: <Blocks className="w-5 h-5" />,
      color: 'blue',
      subtitle: 'Current block height'
    },
    {
      id: 'gasPrice',
      title: 'Gas Price',
      value: `${realtimeData?.gasPrice?.toFixed(0) || 0} gwei`,
      change: Math.random() > 0.5 ? 15.2 : -8.7,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      icon: <Zap className="w-5 h-5" />,
      color: 'yellow',
      subtitle: 'Standard gas price'
    },
    {
      id: 'tps',
      title: 'Transactions/sec',
      value: realtimeData?.tps?.toFixed(1) || '0.0',
      change: 12.5,
      trend: 'up',
      icon: <Activity className="w-5 h-5" />,
      color: 'green',
      subtitle: 'Network throughput'
    },
    {
      id: 'pendingTxs',
      title: 'Pending Txs',
      value: realtimeData?.pendingTxs?.toLocaleString() || '---',
      icon: <Clock className="w-5 h-5" />,
      color: 'orange',
      subtitle: 'Mempool transactions'
    },
    {
      id: 'ethPrice',
      title: 'ETH Price',
      value: `$${realtimeData?.marketPrice?.toFixed(0) || 0}`,
      change: realtimeData?.change24h || 0,
      trend: (realtimeData?.change24h || 0) >= 0 ? 'up' : 'down',
      icon: <Coins className="w-5 h-5" />,
      color: 'purple',
      subtitle: '24h change'
    },
    {
      id: 'totalAddresses',
      title: 'Total Addresses',
      value: realtimeData?.totalAddresses?.toLocaleString() || '---',
      icon: <Users className="w-5 h-5" />,
      color: 'indigo',
      subtitle: 'Unique addresses'
    },
    {
      id: 'dailyTxs',
      title: 'Daily Transactions',
      value: realtimeData?.dailyTransactions?.toLocaleString() || '---',
      change: 8.3,
      trend: 'up',
      icon: <FileText className="w-5 h-5" />,
      color: 'cyan',
      subtitle: 'Last 24 hours'
    },
    {
      id: 'hashrate',
      title: 'Network Hashrate',
      value: realtimeData?.networkHashrate || '---',
      icon: <Shield className="w-5 h-5" />,
      color: 'red',
      subtitle: 'Security level'
    }
  ]

  // Chart data for price and gas
  const priceChartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${23 - i}h`,
    price: 2400 + Math.random() * 200,
    volume: Math.random() * 1000000000,
    gasPrice: 20 + Math.random() * 50
  }))

  // Transaction type distribution
  const txTypeData = [
    { name: 'Transfers', value: 65, color: '#3B82F6' },
    { name: 'Contract', value: 20, color: '#10B981' },
    { name: 'DeFi', value: 12, color: '#8B5CF6' },
    { name: 'MEV', value: 3, color: '#F59E0B' }
  ]

  // Block time chart
  const blockTimeData = Array.from({ length: 20 }, (_, i) => ({
    block: 18500000 - i,
    time: 10 + Math.random() * 8,
    transactions: Math.floor(Math.random() * 300) + 50,
    gasUsed: Math.random() * 30000000
  }))

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  const formatAddress = (address: string, chars = 6): string => {
    if (!address || address.length < 10) return address
    return `${address.slice(0, chars)}...${address.slice(-chars)}`
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
    }
  }

  const getTxTypeColor = (type: string): string => {
    switch (type) {
      case 'transfer': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'contract': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'defi': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
      case 'mev': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blockchain Explorer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time blockchain analytics and monitoring
          </p>
        </div>

        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Timeframe Selector */}
          <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            {(['1h', '24h', '7d', '30d'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedTimeframe === timeframe
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                {timeframe}
              </button>
            ))}
          </div>

          {/* Live Updates Toggle */}
          <button
            onClick={() => setLiveUpdates(!liveUpdates)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${liveUpdates
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${liveUpdates ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span>Live</span>
          </button>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {metrics.map((metric) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={metric.action}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}>
                <div className={`text-${metric.color}-600 dark:text-${metric.color}-400`}>
                  {metric.icon}
                </div>
              </div>
              {metric.trend && (
                <div className={`flex items-center space-x-1 ${metric.trend === 'up' ? 'text-green-600' :
                    metric.trend === 'down' ? 'text-red-600' :
                      'text-gray-600'
                  }`}>
                  {metric.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {metric.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  {metric.change && (
                    <span className="text-xs font-medium">
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {metric.title}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ETH Price & Volume
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">24h</span>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="time"
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={12}
                />
                <YAxis
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gas Price Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Gas Price Trends
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">24h</span>
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="time"
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={12}
                />
                <YAxis
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="gasPrice"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={false}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Types */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transaction Types
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">Last 24h</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={txTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {txTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Block Times */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Block Times
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">Recent blocks</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={blockTimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="block"
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={10}
                />
                <YAxis
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="time" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Transactions
            </h3>
            <a
              href="/explorer/transactions"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Hash
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Age
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactionData.slice(0, 10).map((tx) => (
                  <tr key={tx.hash} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <a
                          href={`/explorer/tx/${tx.hash}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-mono text-sm"
                        >
                          {formatAddress(tx.hash, 8)}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTxTypeColor(tx.type)}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                      {tx.value} ETH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {Math.floor((Date.now() - tx.timestamp.getTime()) / 60000)}m ago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Blocks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Blocks
            </h3>
            <a
              href="/explorer/blocks"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Block
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Txs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Gas Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Miner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Age
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {blockData.map((block) => (
                  <tr key={block.number} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Blocks className="w-4 h-4 text-gray-400" />
                        <a
                          href={`/explorer/block/${block.number}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-mono text-sm"
                        >
                          {block.number.toLocaleString()}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {block.transactions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                      {formatNumber(parseInt(block.gasUsed))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/explorer/address/${block.miner}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-mono text-sm"
                      >
                        {formatAddress(block.miner)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {Math.floor((Date.now() - block.timestamp.getTime()) / 1000)}s ago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DeFi & MEV Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top DeFi Protocols */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top DeFi Protocols
            </h3>
            <a
              href="/explorer/defi"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {defiData.map((protocol) => (
                <div key={protocol.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{protocol.logo}</div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {protocol.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {protocol.category} • {formatNumber(protocol.transactions)} txs
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${formatNumber(protocol.tvl)}
                    </div>
                    <div className={`text-xs ${protocol.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {protocol.change24h >= 0 ? '+' : ''}{protocol.change24h.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MEV Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              MEV Activity
            </h3>
            <a
              href="/explorer/mev"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${formatNumber(mevData.reduce((sum, item) => sum + item.profit, 0))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total MEV Extracted</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {mevData.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">MEV Transactions</div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { type: 'arbitrage', count: mevData.filter(m => m.type === 'arbitrage').length, color: 'blue' },
                { type: 'sandwich', count: mevData.filter(m => m.type === 'sandwich').length, color: 'purple' },
                { type: 'liquidation', count: mevData.filter(m => m.type === 'liquidation').length, color: 'green' },
                { type: 'frontrun', count: mevData.filter(m => m.type === 'frontrun').length, color: 'red' }
              ].map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full bg-${item.color}-500`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExplorerDashboard
