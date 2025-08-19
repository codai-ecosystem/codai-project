'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Target,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Settings,
  Filter,
  Search,
  Grid3X3,
  List,
  Calendar,
  Clock,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Equal,
  Bitcoin,
  Coins,
  CreditCard,
  LineChart,
  Activity,
  Gem,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Info,
  Award,
  Percent,
  Calculator,
  Bookmark,
  Share2,
  ExternalLink,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

// TypeScript Interfaces
interface Asset {
  id: string
  symbol: string
  name: string
  icon: string
  balance: number
  value: number
  price: number
  change24h: number
  change7d: number
  change30d: number
  marketCap: number
  volume24h: number
  allocation: number
  profit: number
  profitPercentage: number
  rank: number
  network: string
  stakingApy?: number
  isStaked: boolean
  stakingRewards?: number
  lastUpdated: string
  category: 'currency' | 'defi' | 'nft' | 'gaming' | 'metaverse' | 'ai'
  riskLevel: 'low' | 'medium' | 'high'
  watchlisted: boolean
  locked: boolean
  yieldFarming?: boolean
}

interface PortfolioMetrics {
  totalValue: number
  totalChange24h: number
  totalChange7d: number
  totalChange30d: number
  totalProfit: number
  totalProfitPercentage: number
  totalAssets: number
  stakingRewards: number
  stakingValue: number
  defiValue: number
  nftValue: number
  diversificationScore: number
  riskScore: number
  performanceScore: number
}

interface AssetAllocation {
  category: string
  value: number
  percentage: number
  color: string
  assets: number
}

interface PerformanceData {
  period: string
  value: number
  change: number
  timestamp: string
}

interface PriceAlert {
  id: string
  asset: string
  type: 'above' | 'below'
  price: number
  currentPrice: number
  active: boolean
  created: string
}

const WalletPortfolioPage = () => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [hideAmounts, setHideAmounts] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'allocation' | 'name'>('value')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | '1y'>('1d')

  const [metrics] = useState<PortfolioMetrics>({
    totalValue: 87429.67,
    totalChange24h: 2847.23,
    totalChange7d: -1234.56,
    totalChange30d: 12847.89,
    totalProfit: 24567.89,
    totalProfitPercentage: 39.2,
    totalAssets: 12,
    stakingRewards: 1247.89,
    stakingValue: 15432.10,
    defiValue: 23456.78,
    nftValue: 8765.43,
    diversificationScore: 8.2,
    riskScore: 6.5,
    performanceScore: 7.8
  })

  const allocations: AssetAllocation[] = [
    { category: 'Currency', value: 52647.23, percentage: 60.2, color: 'from-blue-500 to-cyan-600', assets: 6 },
    { category: 'DeFi', value: 17486.34, percentage: 20.0, color: 'from-purple-500 to-pink-600', assets: 3 },
    { category: 'NFT', value: 8765.43, percentage: 10.0, color: 'from-green-500 to-emerald-600', assets: 2 },
    { category: 'Gaming', value: 5247.89, percentage: 6.0, color: 'from-orange-500 to-red-600', assets: 2 },
    { category: 'AI', value: 2634.78, percentage: 3.0, color: 'from-indigo-500 to-purple-600', assets: 1 },
    { category: 'Metaverse', value: 648.00, percentage: 0.8, color: 'from-pink-500 to-rose-600', assets: 1 }
  ]

  const performanceData: PerformanceData[] = [
    { period: '1D', value: 87429.67, change: 2847.23, timestamp: '2025-08-07T14:30:00Z' },
    { period: '7D', value: 86195.11, change: -1234.56, timestamp: '2025-08-01T14:30:00Z' },
    { period: '30D', value: 74581.78, change: 12847.89, timestamp: '2025-07-08T14:30:00Z' },
    { period: '1Y', value: 45678.90, change: 41750.77, timestamp: '2024-08-07T14:30:00Z' }
  ]

  // Sample asset data
  useEffect(() => {
    const sampleAssets: Asset[] = [
      {
        id: '1',
        symbol: 'BTC',
        name: 'Bitcoin',
        icon: '₿',
        balance: 0.7845,
        value: 52674.23,
        price: 67145.89,
        change24h: 3.2,
        change7d: -1.8,
        change30d: 12.4,
        marketCap: 1340000000000,
        volume24h: 28000000000,
        allocation: 60.2,
        profit: 14567.89,
        profitPercentage: 38.2,
        rank: 1,
        network: 'bitcoin',
        isStaked: false,
        lastUpdated: '2025-08-07T14:30:00Z',
        category: 'currency',
        riskLevel: 'medium',
        watchlisted: true,
        locked: false
      },
      {
        id: '2',
        symbol: 'ETH',
        name: 'Ethereum',
        icon: 'Ξ',
        balance: 5.2347,
        value: 18096.45,
        price: 3456.78,
        change24h: 2.8,
        change7d: -2.3,
        change30d: 8.7,
        marketCap: 416000000000,
        volume24h: 15000000000,
        allocation: 20.7,
        profit: 5234.67,
        profitPercentage: 40.7,
        rank: 2,
        network: 'ethereum',
        isStaked: true,
        stakingApy: 4.2,
        stakingRewards: 234.89,
        lastUpdated: '2025-08-07T14:30:00Z',
        category: 'currency',
        riskLevel: 'medium',
        watchlisted: true,
        locked: false,
        yieldFarming: true
      },
      {
        id: '3',
        symbol: 'SOL',
        name: 'Solana',
        icon: '◎',
        balance: 47.8923,
        value: 7845.67,
        price: 163.89,
        change24h: 5.7,
        change7d: 12.3,
        change30d: -4.2,
        marketCap: 77000000000,
        volume24h: 2800000000,
        allocation: 9.0,
        profit: 2345.89,
        profitPercentage: 42.6,
        rank: 5,
        network: 'solana',
        isStaked: true,
        stakingApy: 6.8,
        stakingRewards: 187.34,
        lastUpdated: '2025-08-07T14:30:00Z',
        category: 'currency',
        riskLevel: 'high',
        watchlisted: false,
        locked: false
      },
      {
        id: '4',
        symbol: 'UNI',
        name: 'Uniswap',
        icon: '🦄',
        balance: 234.67,
        value: 2847.89,
        price: 12.13,
        change24h: -1.2,
        change7d: 8.4,
        change30d: 15.7,
        marketCap: 9200000000,
        volume24h: 180000000,
        allocation: 3.3,
        profit: 847.23,
        profitPercentage: 42.3,
        rank: 18,
        network: 'ethereum',
        isStaked: false,
        lastUpdated: '2025-08-07T14:30:00Z',
        category: 'defi',
        riskLevel: 'high',
        watchlisted: true,
        locked: false,
        yieldFarming: true
      },
      {
        id: '5',
        symbol: 'LINK',
        name: 'Chainlink',
        icon: '🔗',
        balance: 89.45,
        value: 1456.78,
        price: 16.28,
        change24h: 0.8,
        change7d: -3.2,
        change30d: 7.9,
        marketCap: 10800000000,
        volume24h: 420000000,
        allocation: 1.7,
        profit: 378.92,
        profitPercentage: 35.1,
        rank: 12,
        network: 'ethereum',
        isStaked: false,
        lastUpdated: '2025-08-07T14:30:00Z',
        category: 'defi',
        riskLevel: 'medium',
        watchlisted: false,
        locked: false
      },
      {
        id: '6',
        symbol: 'MATIC',
        name: 'Polygon',
        icon: '⬢',
        balance: 567.89,
        value: 978.45,
        price: 1.72,
        change24h: 4.3,
        change7d: -1.7,
        change30d: 11.2,
        marketCap: 16000000000,
        volume24h: 890000000,
        allocation: 1.1,
        profit: 234.67,
        profitPercentage: 31.5,
        rank: 9,
        network: 'polygon',
        isStaked: true,
        stakingApy: 5.4,
        stakingRewards: 45.78,
        lastUpdated: '2025-08-07T14:30:00Z',
        category: 'currency',
        riskLevel: 'medium',
        watchlisted: true,
        locked: false
      }
    ]

    setAssets(sampleAssets)
    setFilteredAssets(sampleAssets)
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

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`
  }

  const formatNumber = (number: number, decimals: number = 2) => {
    if (number >= 1e9) {
      return `${(number / 1e9).toFixed(decimals)}B`
    } else if (number >= 1e6) {
      return `${(number / 1e6).toFixed(decimals)}M`
    } else if (number >= 1e3) {
      return `${(number / 1e3).toFixed(decimals)}K`
    }
    return number.toFixed(decimals)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'currency': return Bitcoin
      case 'defi': return Zap
      case 'nft': return Gem
      case 'gaming': return Activity
      case 'metaverse': return Globe
      case 'ai': return Shield
      default: return Coins
    }
  }

  const handleSort = (field: 'value' | 'change' | 'allocation' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }

    const sorted = [...filteredAssets].sort((a, b) => {
      let aValue, bValue

      switch (field) {
        case 'value':
          aValue = a.value
          bValue = b.value
          break
        case 'change':
          aValue = a.change24h
          bValue = b.change24h
          break
        case 'allocation':
          aValue = a.allocation
          bValue = b.allocation
          break
        case 'name':
          aValue = a.name
          bValue = b.name
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

    setFilteredAssets(sorted)
  }

  const refreshPortfolio = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const exportPortfolio = () => {
    const csvContent = assets.map(asset => [
      asset.symbol,
      asset.name,
      asset.balance,
      asset.value,
      asset.price,
      asset.change24h,
      asset.allocation,
      asset.profit,
      asset.profitPercentage
    ].join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'portfolio-assets.csv'
    a.click()
  }

  const toggleWatchlist = (assetId: string) => {
    setAssets(prev => prev.map(asset =>
      asset.id === assetId
        ? { ...asset, watchlisted: !asset.watchlisted }
        : asset
    ))
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
                <PieChart className="w-8 h-8 text-slate-400" />
                Portfolio
              </h1>
              <p className="text-slate-300 mt-1">Comprehensive asset allocation and performance tracking</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-8 text-sm">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {hideAmounts ? '••••••••' : formatCurrency(metrics.totalValue)}
                  </p>
                  <p className="text-slate-300">Total Value</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${metrics.totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {hideAmounts ? '••••••' : formatPercentage(metrics.totalChange24h / metrics.totalValue * 100)}
                  </p>
                  <p className="text-slate-300">24h Change</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{metrics.totalAssets}</p>
                  <p className="text-slate-300">Assets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{metrics.diversificationScore}/10</p>
                  <p className="text-slate-300">Diversification</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          {/* Portfolio Value Card */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Portfolio Performance</h3>
              <div className="flex items-center gap-2">
                {['1D', '7D', '30D', '1Y'].map((period) => (
                  <motion.button
                    key={period}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTimeframe(period.toLowerCase() as any)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${timeframe === period.toLowerCase()
                        ? 'bg-purple-500/30 text-purple-300'
                        : 'text-slate-300 hover:bg-white/10'
                      }`}
                  >
                    {period}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-3xl font-bold text-white mb-2">
                  {hideAmounts ? '••••••••' : formatCurrency(metrics.totalValue)}
                </p>
                <div className="flex items-center gap-2">
                  {metrics.totalChange24h >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`font-semibold ${metrics.totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {hideAmounts ? '••••••' : formatCurrency(Math.abs(metrics.totalChange24h))} ({formatPercentage(metrics.totalChange24h / metrics.totalValue * 100)})
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1">24h Change</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-green-400 mb-2">
                  {hideAmounts ? '••••••••' : formatCurrency(metrics.totalProfit)}
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="font-semibold text-green-400">
                    {formatPercentage(metrics.totalProfitPercentage)}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1">Total Profit</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-400">
                    {hideAmounts ? '••••••' : formatCurrency(metrics.stakingValue)}
                  </p>
                  <p className="text-sm text-slate-300">Staking</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-400">
                    {hideAmounts ? '••••••' : formatCurrency(metrics.defiValue)}
                  </p>
                  <p className="text-sm text-slate-300">DeFi</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-400">
                    {hideAmounts ? '••••••' : formatCurrency(metrics.nftValue)}
                  </p>
                  <p className="text-sm text-slate-300">NFTs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Asset Allocation</h3>
            <div className="space-y-4">
              {allocations.map((allocation, index) => (
                <motion.div
                  key={allocation.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 bg-gradient-to-r ${allocation.color} rounded-full`}></div>
                    <div>
                      <p className="font-semibold text-white">{allocation.category}</p>
                      <p className="text-sm text-slate-300">{allocation.assets} assets</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {hideAmounts ? '••••••' : formatCurrency(allocation.value)}
                    </p>
                    <p className="text-sm text-slate-300">{allocation.percentage}%</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-yellow-400">{metrics.riskScore}/10</p>
                  <p className="text-sm text-slate-300">Risk Score</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-400">{metrics.performanceScore}/10</p>
                  <p className="text-sm text-slate-300">Performance</p>
                </div>
              </div>
            </div>
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
                  placeholder="Search assets..."
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

              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl p-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-500/30 text-purple-300' : 'text-slate-300 hover:bg-white/10'
                    }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-500/30 text-purple-300' : 'text-slate-300 hover:bg-white/10'
                    }`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
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
                onClick={refreshPortfolio}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl text-blue-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportPortfolio}
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Categories</option>
                  <option value="currency">Currency</option>
                  <option value="defi">DeFi</option>
                  <option value="nft">NFT</option>
                  <option value="gaming">Gaming</option>
                  <option value="metaverse">Metaverse</option>
                  <option value="ai">AI</option>
                </select>

                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="value">Sort by Value</option>
                  <option value="change">Sort by Change</option>
                  <option value="allocation">Sort by Allocation</option>
                  <option value="name">Sort by Name</option>
                </select>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedRiskLevel('all')
                    setSortBy('value')
                    setSortOrder('desc')
                    setSearchTerm('')
                  }}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-300 transition-colors"
                >
                  Clear Filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Assets Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
        >
          <div className="bg-white/5 border-b border-white/20 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Asset Holdings</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-300">Sort by:</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSort('value')}
                  className={`px-3 py-1 rounded-lg transition-colors ${sortBy === 'value' ? 'bg-purple-500/30 text-purple-300' : 'text-slate-300 hover:bg-white/10'
                    }`}
                >
                  Value {sortBy === 'value' && (sortOrder === 'desc' ? '↓' : '↑')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSort('change')}
                  className={`px-3 py-1 rounded-lg transition-colors ${sortBy === 'change' ? 'bg-purple-500/30 text-purple-300' : 'text-slate-300 hover:bg-white/10'
                    }`}
                >
                  Change {sortBy === 'change' && (sortOrder === 'desc' ? '↓' : '↑')}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSort('allocation')}
                  className={`px-3 py-1 rounded-lg transition-colors ${sortBy === 'allocation' ? 'bg-purple-500/30 text-purple-300' : 'text-slate-300 hover:bg-white/10'
                    }`}
                >
                  Allocation {sortBy === 'allocation' && (sortOrder === 'desc' ? '↓' : '↑')}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Assets Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredAssets.map((asset, index) => {
                const CategoryIcon = getCategoryIcon(asset.category)

                return (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                          {asset.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{asset.symbol}</h4>
                          <p className="text-sm text-slate-300">{asset.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleWatchlist(asset.id)
                          }}
                          className={`p-1 rounded-lg transition-colors ${asset.watchlisted ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
                            }`}
                        >
                          <Star className={`w-4 h-4 ${asset.watchlisted ? 'fill-current' : ''}`} />
                        </motion.button>
                        <CategoryIcon className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Balance</span>
                        <span className="font-semibold text-white">
                          {hideAmounts ? '••••••' : formatCrypto(asset.balance)} {asset.symbol}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Value</span>
                        <span className="font-bold text-white">
                          {hideAmounts ? '••••••••' : formatCurrency(asset.value)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">24h Change</span>
                        <span className={`font-semibold ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(asset.change24h)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">Allocation</span>
                        <span className="font-semibold text-purple-300">{asset.allocation}%</span>
                      </div>

                      {asset.isStaked && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-slate-300">Staking APY</span>
                          </div>
                          <span className="text-xs font-semibold text-yellow-400">{asset.stakingApy}%</span>
                        </div>
                      )}

                      <div className={`text-xs ${getRiskColor(asset.riskLevel)} flex items-center gap-1`}>
                        <AlertTriangle className="w-3 h-3" />
                        {asset.riskLevel.toUpperCase()} RISK
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredAssets.map((asset, index) => {
                const CategoryIcon = getCategoryIcon(asset.category)

                return (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    className="p-6 cursor-pointer transition-colors"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                          {asset.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-white">{asset.symbol}</h4>
                            <span className="text-sm text-slate-300">{asset.name}</span>
                            <div className="flex items-center gap-1">
                              <CategoryIcon className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-300 capitalize">{asset.category}</span>
                            </div>
                            <span className={`text-xs ${getRiskColor(asset.riskLevel)} font-semibold`}>
                              {asset.riskLevel.toUpperCase()}
                            </span>
                            {asset.isStaked && (
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-yellow-400" />
                                <span className="text-xs text-yellow-400">{asset.stakingApy}% APY</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-300">
                            <span>Rank #{asset.rank}</span>
                            <span>MCap: {formatNumber(asset.marketCap)}</span>
                            <span>Vol: {formatNumber(asset.volume24h)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="font-bold text-white">
                              {hideAmounts ? '••••••' : formatCrypto(asset.balance)} {asset.symbol}
                            </p>
                            <p className="text-sm text-slate-300">
                              {hideAmounts ? '••••••••' : formatCurrency(asset.value)}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{formatCurrency(asset.price)}</p>
                            <p className={`text-sm ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatPercentage(asset.change24h)}
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-purple-300">{asset.allocation}%</p>
                            <p className="text-sm text-slate-300">Portfolio</p>
                          </div>
                          <div>
                            <p className={`font-semibold ${asset.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {hideAmounts ? '••••••' : formatCurrency(asset.profit)}
                            </p>
                            <p className={`text-sm ${asset.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatPercentage(asset.profitPercentage)}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleWatchlist(asset.id)
                            }}
                            className={`p-2 rounded-lg transition-colors ${asset.watchlisted ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'
                              }`}
                          >
                            <Star className={`w-4 h-4 ${asset.watchlisted ? 'fill-current' : ''}`} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
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
              <PieChart className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Smart Analytics</h3>
              <p className="text-slate-300">AI-powered portfolio analysis with risk assessment and optimization recommendations.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Target className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Goal Tracking</h3>
              <p className="text-slate-300">Set investment goals and track progress with automated rebalancing suggestions.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Award className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Performance Metrics</h3>
              <p className="text-slate-300">Comprehensive performance tracking with benchmarking and detailed analytics.</p>
            </motion.div>
          </div>

          <div className="text-center text-slate-300 mt-8 pt-8 border-t border-white/10">
            <p>&copy; 2025 Wallet Platform. All rights reserved. | Portfolio v2.0.0</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default WalletPortfolioPage
