'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Zap,
  Filter,
  Search,
  Download,
  Upload,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Hash,
  MapPin,
  User,
  CreditCard,
  Coins,
  DollarSign,
  Bitcoin,
  Settings,
  Info,
  Star,
  Shield
} from 'lucide-react'
import Link from 'next/link'

// TypeScript Interfaces
interface Transaction {
  id: string
  hash: string
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'deposit' | 'withdraw' | 'buy' | 'sell'
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  asset: string
  assetIcon: string
  amount: number
  value: number
  fee: number
  feeAsset: string
  timestamp: string
  confirmations: number
  requiredConfirmations: number
  from?: string
  to?: string
  network: string
  gasPrice?: number
  gasUsed?: number
  blockNumber?: number
  description?: string
  tags: string[]
}

interface TransactionFilters {
  type: string
  status: string
  asset: string
  dateRange: string
  network: string
  minAmount: number
  maxAmount: number
}

interface TransactionsMetrics {
  totalTransactions: number
  completedTransactions: number
  pendingTransactions: number
  failedTransactions: number
  totalVolume: number
  totalFees: number
  averageTransactionValue: number
  transactionsToday: number
}

interface NetworkInfo {
  id: string
  name: string
  symbol: string
  color: string
  gasPrice: number
  blockTime: number
}

const WalletTransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [hideAmounts, setHideAmounts] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount' | 'status'>('timestamp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    status: 'all',
    asset: 'all',
    dateRange: 'all',
    network: 'all',
    minAmount: 0,
    maxAmount: 1000000
  })

  const [metrics] = useState<TransactionsMetrics>({
    totalTransactions: 1247,
    completedTransactions: 1186,
    pendingTransactions: 8,
    failedTransactions: 53,
    totalVolume: 2847592.34,
    totalFees: 1247.89,
    averageTransactionValue: 2284.67,
    transactionsToday: 23
  })

  const networks: NetworkInfo[] = [
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: 'from-blue-500 to-indigo-600', gasPrice: 25, blockTime: 12 },
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', color: 'from-orange-500 to-yellow-600', gasPrice: 15, blockTime: 600 },
    { id: 'solana', name: 'Solana', symbol: 'SOL', color: 'from-purple-500 to-pink-600', gasPrice: 0.0001, blockTime: 1 },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC', color: 'from-indigo-500 to-purple-600', gasPrice: 2, blockTime: 2 },
    { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', color: 'from-red-500 to-pink-600', gasPrice: 5, blockTime: 3 },
    { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', color: 'from-blue-400 to-cyan-500', gasPrice: 1, blockTime: 1 }
  ]

  // Sample transaction data
  useEffect(() => {
    const sampleTransactions: Transaction[] = [
      {
        id: '1',
        hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
        type: 'receive',
        status: 'completed',
        asset: 'BTC',
        assetIcon: '₿',
        amount: 0.0245,
        value: 1647.23,
        fee: 0.00012,
        feeAsset: 'BTC',
        timestamp: '2025-08-07T14:30:00Z',
        confirmations: 6,
        requiredConfirmations: 6,
        from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        network: 'bitcoin',
        blockNumber: 812345,
        description: 'Payment from exchange',
        tags: ['exchange', 'verified']
      },
      {
        id: '2',
        hash: '0x2b3c4d5e6f7a8901bcdef2345678901bcdef2345678901bcdef2345678901b',
        type: 'send',
        status: 'pending',
        asset: 'ETH',
        assetIcon: 'Ξ',
        amount: 0.5,
        value: 1728.39,
        fee: 0.0045,
        feeAsset: 'ETH',
        timestamp: '2025-08-07T13:45:00Z',
        confirmations: 2,
        requiredConfirmations: 12,
        to: '0x742d35Cc6635C0532925a3b8D0897dBF7BDF3Ac7',
        network: 'ethereum',
        gasPrice: 25,
        gasUsed: 21000,
        blockNumber: 19123456,
        description: 'Transfer to cold wallet',
        tags: ['security', 'cold-storage']
      },
      {
        id: '3',
        hash: '0x3c4d5e6f7a8b9012cdef3456789012cdef3456789012cdef3456789012cd',
        type: 'stake',
        status: 'completed',
        asset: 'ADA',
        assetIcon: '₳',
        amount: 500,
        value: 242.50,
        fee: 2.17,
        feeAsset: 'ADA',
        timestamp: '2025-08-07T12:15:00Z',
        confirmations: 20,
        requiredConfirmations: 5,
        network: 'cardano',
        description: 'Staking delegation to pool',
        tags: ['staking', 'delegation']
      },
      {
        id: '4',
        hash: '0x4d5e6f7a8b9c0123def4567890123def4567890123def4567890123de',
        type: 'swap',
        status: 'completed',
        asset: 'SOL',
        assetIcon: '◎',
        amount: 10,
        value: 1872.30,
        fee: 0.25,
        feeAsset: 'SOL',
        timestamp: '2025-08-07T11:30:00Z',
        confirmations: 32,
        requiredConfirmations: 32,
        network: 'solana',
        description: 'USDC → SOL swap on Jupiter',
        tags: ['swap', 'jupiter', 'defi']
      },
      {
        id: '5',
        hash: '0x5e6f7a8b9c0d1234ef5678901234ef5678901234ef5678901234ef',
        type: 'buy',
        status: 'completed',
        asset: 'MATIC',
        assetIcon: '⬢',
        amount: 150,
        value: 131.40,
        fee: 2.50,
        feeAsset: 'USD',
        timestamp: '2025-08-07T10:20:00Z',
        confirmations: 64,
        requiredConfirmations: 64,
        network: 'polygon',
        description: 'Credit card purchase',
        tags: ['purchase', 'fiat', 'credit-card']
      },
      {
        id: '6',
        hash: '0x6f7a8b9c0d1e2345f6789012345f6789012345f6789012345f6',
        type: 'withdraw',
        status: 'failed',
        asset: 'AVAX',
        assetIcon: '🔺',
        amount: 25,
        value: 687.50,
        fee: 0.01,
        feeAsset: 'AVAX',
        timestamp: '2025-08-07T09:45:00Z',
        confirmations: 0,
        requiredConfirmations: 1,
        network: 'avalanche',
        description: 'Failed withdrawal - insufficient gas',
        tags: ['failed', 'gas-error']
      }
    ]

    setTransactions(sampleTransactions)
    setFilteredTransactions(sampleTransactions)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatCrypto = (amount: number, decimals: number = 4) => {
    return amount.toFixed(decimals)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return ArrowUpRight
      case 'receive': return ArrowDownLeft
      case 'swap': return RefreshCw
      case 'stake': return Zap
      case 'unstake': return Zap
      case 'buy': return Upload
      case 'sell': return Download
      case 'deposit': return ArrowDownLeft
      case 'withdraw': return ArrowUpRight
      default: return Activity
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'pending': return Loader
      case 'failed': return XCircle
      case 'cancelled': return AlertCircle
      default: return Clock
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      case 'cancelled': return 'text-gray-400'
      default: return 'text-blue-400'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'send': return 'from-red-500 to-pink-600'
      case 'receive': return 'from-green-500 to-emerald-600'
      case 'swap': return 'from-blue-500 to-cyan-600'
      case 'stake': return 'from-purple-500 to-violet-600'
      case 'buy': return 'from-emerald-500 to-teal-600'
      case 'sell': return 'from-orange-500 to-red-600'
      default: return 'from-gray-500 to-slate-600'
    }
  }

  const getNetworkInfo = (networkId: string) => {
    return networks.find(n => n.id === networkId) || networks[0]
  }

  const copyTransactionHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    // Show toast notification (simplified)
    alert('Transaction hash copied to clipboard!')
  }

  const exportTransactions = () => {
    const csvContent = filteredTransactions.map(tx => [
      tx.timestamp,
      tx.type,
      tx.asset,
      tx.amount,
      tx.value,
      tx.fee,
      tx.status,
      tx.hash
    ].join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wallet-transactions.csv'
    a.click()
  }

  const handleSort = (field: 'timestamp' | 'amount' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }

    const sorted = [...filteredTransactions].sort((a, b) => {
      let aValue, bValue

      switch (field) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
          break
        case 'amount':
          aValue = a.value
          bValue = b.value
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTransactions(sorted)
  }

  const refreshTransactions = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Enhanced Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-slate-400" />
                Transactions
              </h1>
              <p className="text-slate-300 mt-1">Track and manage your crypto transactions</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{metrics.totalTransactions.toLocaleString()}</p>
                  <p className="text-slate-300">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{metrics.completedTransactions.toLocaleString()}</p>
                  <p className="text-slate-300">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{metrics.pendingTransactions}</p>
                  <p className="text-slate-300">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{metrics.failedTransactions}</p>
                  <p className="text-slate-300">Failed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Transaction Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Total Volume</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {hideAmounts ? '••••••••' : formatCurrency(metrics.totalVolume)}
            </p>
            <p className="text-sm text-slate-300 mt-1">All-time transaction volume</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Total Fees</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {hideAmounts ? '••••••••' : formatCurrency(metrics.totalFees)}
            </p>
            <p className="text-sm text-slate-300 mt-1">Network fees paid</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Average Value</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {hideAmounts ? '••••••••' : formatCurrency(metrics.averageTransactionValue)}
            </p>
            <p className="text-sm text-slate-300 mt-1">Per transaction</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Today</h3>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.transactionsToday}</p>
            <p className="text-sm text-slate-300 mt-1">Transactions today</p>
          </div>
        </motion.div>

        {/* Controls & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-500/20 hover:bg-slate-500/30 border border-slate-400/30 rounded-xl text-slate-300 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </motion.button>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setHideAmounts(!hideAmounts)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-xl text-purple-300 transition-colors"
              >
                {hideAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {hideAmounts ? 'Show' : 'Hide'} Amounts
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshTransactions}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl text-blue-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportTransactions}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-xl text-green-300 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-white/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="send">Send</option>
                  <option value="receive">Receive</option>
                  <option value="swap">Swap</option>
                  <option value="stake">Stake</option>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={filters.asset}
                  onChange={(e) => setFilters({ ...filters, asset: e.target.value })}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Assets</option>
                  <option value="BTC">Bitcoin</option>
                  <option value="ETH">Ethereum</option>
                  <option value="ADA">Cardano</option>
                  <option value="SOL">Solana</option>
                  <option value="MATIC">Polygon</option>
                  <option value="AVAX">Avalanche</option>
                </select>

                <select
                  value={filters.network}
                  onChange={(e) => setFilters({ ...filters, network: e.target.value })}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Networks</option>
                  {networks.map(network => (
                    <option key={network.id} value={network.id}>{network.name}</option>
                  ))}
                </select>

                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilters({
                    type: 'all',
                    status: 'all',
                    asset: 'all',
                    dateRange: 'all',
                    network: 'all',
                    minAmount: 0,
                    maxAmount: 1000000
                  })}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-300 transition-colors"
                >
                  Clear Filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="bg-white/5 border-b border-white/20 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Transaction History</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-300">Sort by:</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSort('timestamp')}
                  className={`px-3 py-1 rounded-lg transition-colors ${sortBy === 'timestamp' ? 'bg-purple-500/30 text-purple-300' : 'text-slate-300 hover:bg-white/10'
                    }`}
                >
                  Date {sortBy === 'timestamp' && (sortOrder === 'desc' ? '↓' : '↑')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSort('amount')}
                  className={`px-3 py-1 rounded-lg transition-colors ${sortBy === 'amount' ? 'bg-purple-500/30 text-purple-300' : 'text-slate-300 hover:bg-white/10'
                    }`}
                >
                  Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSort('status')}
                  className={`px-3 py-1 rounded-lg transition-colors ${sortBy === 'status' ? 'bg-purple-500/30 text-purple-300' : 'text-slate-300 hover:bg-white/10'
                    }`}
                >
                  Status {sortBy === 'status' && (sortOrder === 'desc' ? '↓' : '↑')}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="divide-y divide-white/10">
            {filteredTransactions.map((transaction) => {
              const TransactionIcon = getTransactionIcon(transaction.type)
              const StatusIcon = getStatusIcon(transaction.status)
              const networkInfo = getNetworkInfo(transaction.network)

              return (
                <motion.div
                  key={transaction.id}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                  className="p-6 cursor-pointer transition-colors"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Transaction Icon */}
                      <div className={`w-12 h-12 bg-gradient-to-r ${getTypeColor(transaction.type)} rounded-xl flex items-center justify-center`}>
                        <TransactionIcon className="w-6 h-6 text-white" />
                      </div>

                      {/* Transaction Details */}
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-white capitalize">{transaction.type} {transaction.asset}</h4>
                          <div className="flex items-center gap-1">
                            <div className={`w-3 h-3 bg-gradient-to-r ${networkInfo.color} rounded-full`}></div>
                            <span className="text-xs text-slate-300">{networkInfo.name}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            {transaction.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-slate-500/20 text-slate-300 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-300">
                          <span>{new Date(transaction.timestamp).toLocaleString()}</span>
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono">{transaction.hash.substring(0, 10)}...</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                copyTransactionHash(transaction.hash)
                              }}
                              className="text-slate-400 hover:text-white"
                            >
                              <Copy className="w-3 h-3" />
                            </motion.button>
                          </div>
                          {transaction.confirmations !== undefined && (
                            <span>{transaction.confirmations}/{transaction.requiredConfirmations} confirmations</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Transaction Amount & Status */}
                    <div className="text-right">
                      <div className="flex items-center gap-3 mb-1">
                        <div>
                          <p className="font-semibold text-white">
                            {transaction.type === 'send' || transaction.type === 'sell' ? '-' : '+'}
                            {hideAmounts ? '••••••' : formatCrypto(transaction.amount)} {transaction.asset}
                          </p>
                          <p className="text-sm text-slate-300">
                            {hideAmounts ? '••••••' : formatCurrency(transaction.value)}
                          </p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <StatusIcon className={`w-5 h-5 ${getStatusColor(transaction.status)} ${transaction.status === 'pending' ? 'animate-spin' : ''}`} />
                          <span className={`text-xs capitalize ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        Fee: {hideAmounts ? '••••' : formatCrypto(transaction.fee, 6)} {transaction.feeAsset}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Load More */}
          <div className="p-6 text-center border-t border-white/20">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl text-white font-medium transition-all"
            >
              Load More Transactions
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Modern Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 backdrop-blur-sm border-t border-white/10 mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Activity className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Tracking</h3>
              <p className="text-slate-300">Monitor all your transactions across multiple blockchains with instant updates and confirmations.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Shield className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Advanced Security</h3>
              <p className="text-slate-300">Transaction verification, multi-signature support, and comprehensive audit trails for all operations.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Download className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Export & Analytics</h3>
              <p className="text-slate-300">Export transaction data for tax reporting and analyze your crypto activity with advanced filters.</p>
            </motion.div>
          </div>

          <div className="text-center text-slate-300 mt-8 pt-8 border-t border-white/10">
            <p>&copy; 2025 Wallet Platform. All rights reserved. | Transactions v2.0.0</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default WalletTransactionsPage
