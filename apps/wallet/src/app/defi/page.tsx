'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
  Clock,
  Shield,
  Award,
  Lightning,
  Layers,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Info,
  ExternalLink,
  Plus,
  Minus,
  Calculator,
  Lock,
  Unlock,
  Star,
  CheckCircle,
  AlertTriangle,
  Activity,
  Coins,
  Gem,
  Globe,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react'

// TypeScript Interfaces
interface StakingPool {
  id: string
  name: string
  protocol: string
  asset: string
  apy: number
  tvl: number
  minStake: number
  lockPeriod: number
  userStaked: number
  rewards: number
  status: 'active' | 'paused' | 'ended'
  riskLevel: 'low' | 'medium' | 'high'
  type: 'staking' | 'liquidity' | 'lending' | 'farming'
  icon: string
  network: string
}

interface DeFiPosition {
  id: string
  protocol: string
  type: 'staking' | 'lending' | 'liquidity' | 'farming'
  asset: string
  amount: number
  value: number
  apy: number
  rewards: number
  startDate: string
  endDate?: string
  autoCompound: boolean
  locked: boolean
  icon: string
  network: string
}

interface DeFiMetrics {
  totalStaked: number
  totalRewards: number
  activePositions: number
  averageApy: number
  portfolioWeight: number
  monthlyRewards: number
  totalValue: number
  riskScore: number
}

interface Protocol {
  id: string
  name: string
  icon: string
  tvl: number
  pools: number
  maxApy: number
  network: string
  verified: boolean
  category: 'staking' | 'lending' | 'dex' | 'farming'
}

const DeFiStakingPage = () => {
  const [hideAmounts, setHideAmounts] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'stake' | 'positions'>('overview')
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null)
  const [stakeAmount, setStakeAmount] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'rewards'>('apy')

  const [metrics] = useState<DeFiMetrics>({
    totalStaked: 45672.89,
    totalRewards: 2847.56,
    activePositions: 8,
    averageApy: 12.4,
    portfolioWeight: 34.7,
    monthlyRewards: 486.23,
    totalValue: 48520.45,
    riskScore: 6.8
  })

  const [positions] = useState<DeFiPosition[]>([
    {
      id: '1',
      protocol: 'Lido',
      type: 'staking',
      asset: 'ETH',
      amount: 5.2347,
      value: 18096.45,
      apy: 4.2,
      rewards: 234.89,
      startDate: '2025-07-15T10:00:00Z',
      autoCompound: true,
      locked: false,
      icon: 'Ξ',
      network: 'ethereum'
    },
    {
      id: '2',
      protocol: 'Aave',
      type: 'lending',
      asset: 'USDC',
      amount: 12500,
      value: 12500,
      apy: 5.8,
      rewards: 187.34,
      startDate: '2025-07-20T14:30:00Z',
      autoCompound: false,
      locked: false,
      icon: '$',
      network: 'ethereum'
    },
    {
      id: '3',
      protocol: 'Uniswap V3',
      type: 'liquidity',
      asset: 'ETH/USDC',
      amount: 2.1,
      value: 7258.90,
      apy: 18.7,
      rewards: 425.67,
      startDate: '2025-08-01T09:15:00Z',
      autoCompound: false,
      locked: false,
      icon: '🦄',
      network: 'ethereum'
    },
    {
      id: '4',
      protocol: 'Marinade',
      type: 'staking',
      asset: 'SOL',
      amount: 47.8923,
      value: 7845.67,
      apy: 6.8,
      rewards: 187.34,
      startDate: '2025-07-25T16:45:00Z',
      autoCompound: true,
      locked: true,
      icon: '◎',
      network: 'solana'
    }
  ])

  const [stakingPools] = useState<StakingPool[]>([
    {
      id: '1',
      name: 'Ethereum 2.0 Staking',
      protocol: 'Lido',
      asset: 'ETH',
      apy: 4.2,
      tvl: 15600000000,
      minStake: 0.01,
      lockPeriod: 0,
      userStaked: 5.2347,
      rewards: 234.89,
      status: 'active',
      riskLevel: 'low',
      type: 'staking',
      icon: 'Ξ',
      network: 'ethereum'
    },
    {
      id: '2',
      name: 'USDC Lending',
      protocol: 'Aave',
      asset: 'USDC',
      apy: 5.8,
      tvl: 8900000000,
      minStake: 100,
      lockPeriod: 0,
      userStaked: 12500,
      rewards: 187.34,
      status: 'active',
      riskLevel: 'low',
      type: 'lending',
      icon: '$',
      network: 'ethereum'
    },
    {
      id: '3',
      name: 'ETH/USDC LP',
      protocol: 'Uniswap V3',
      asset: 'ETH/USDC',
      apy: 18.7,
      tvl: 2400000000,
      minStake: 0.1,
      lockPeriod: 0,
      userStaked: 2.1,
      rewards: 425.67,
      status: 'active',
      riskLevel: 'medium',
      type: 'liquidity',
      icon: '🦄',
      network: 'ethereum'
    },
    {
      id: '4',
      name: 'Solana Staking',
      protocol: 'Marinade',
      asset: 'SOL',
      apy: 6.8,
      tvl: 1200000000,
      minStake: 1,
      lockPeriod: 2,
      userStaked: 47.8923,
      rewards: 187.34,
      status: 'active',
      riskLevel: 'medium',
      type: 'staking',
      icon: '◎',
      network: 'solana'
    },
    {
      id: '5',
      name: 'Compound USDT',
      protocol: 'Compound',
      asset: 'USDT',
      apy: 4.5,
      tvl: 3200000000,
      minStake: 50,
      lockPeriod: 0,
      userStaked: 0,
      rewards: 0,
      status: 'active',
      riskLevel: 'low',
      type: 'lending',
      icon: '₮',
      network: 'ethereum'
    },
    {
      id: '6',
      name: 'Jupiter Farming',
      protocol: 'Jupiter',
      asset: 'JUP',
      apy: 24.3,
      tvl: 450000000,
      minStake: 10,
      lockPeriod: 7,
      userStaked: 0,
      rewards: 0,
      status: 'active',
      riskLevel: 'high',
      type: 'farming',
      icon: '🪐',
      network: 'solana'
    }
  ])

  const protocols: Protocol[] = [
    { id: '1', name: 'Lido', icon: '🌊', tvl: 15600000000, pools: 8, maxApy: 4.2, network: 'ethereum', verified: true, category: 'staking' },
    { id: '2', name: 'Aave', icon: '👻', tvl: 8900000000, pools: 15, maxApy: 12.5, network: 'ethereum', verified: true, category: 'lending' },
    { id: '3', name: 'Uniswap', icon: '🦄', tvl: 2400000000, pools: 25, maxApy: 35.8, network: 'ethereum', verified: true, category: 'dex' },
    { id: '4', name: 'Compound', icon: '🏛️', tvl: 3200000000, pools: 12, maxApy: 8.7, network: 'ethereum', verified: true, category: 'lending' },
    { id: '5', name: 'Marinade', icon: '🥩', tvl: 1200000000, pools: 6, maxApy: 6.8, network: 'solana', verified: true, category: 'staking' },
    { id: '6', name: 'Jupiter', icon: '🪐', tvl: 450000000, pools: 18, maxApy: 28.4, network: 'solana', verified: true, category: 'farming' }
  ]

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'staking': return Zap
      case 'lending': return DollarSign
      case 'liquidity': return Layers
      case 'farming': return Target
      default: return Coins
    }
  }

  const handleStake = (pool: StakingPool) => {
    setSelectedPool(pool)
    setSelectedTab('stake')
  }

  const calculateRewards = (amount: number, apy: number, days: number = 30) => {
    return (amount * (apy / 100) * days) / 365
  }

  const TabButton = ({ id, children, isActive, onClick }: any) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-xl font-medium transition-all ${
        isActive
          ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
          : 'text-slate-300 hover:bg-white/10'
      }`}
    >
      {children}
    </motion.button>
  )

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
                <Zap className="w-8 h-8 text-slate-400" />
                DeFi & Staking
              </h1>
              <p className="text-slate-300 mt-1">Earn rewards through decentralized finance protocols</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {hideAmounts ? '••••••••' : formatCurrency(metrics.totalValue)}
                  </p>
                  <p className="text-slate-300">Total Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{metrics.averageApy}%</p>
                  <p className="text-slate-300">Avg APY</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{metrics.activePositions}</p>
                  <p className="text-slate-300">Positions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {hideAmounts ? '••••••' : formatCurrency(metrics.monthlyRewards)}
                  </p>
                  <p className="text-slate-300">Monthly</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setHideAmounts(!hideAmounts)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-xl text-purple-300 transition-colors"
              >
                {hideAmounts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {hideAmounts ? 'Show' : 'Hide'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2">
            <div className="flex items-center gap-2">
              <TabButton id="overview" isActive={selectedTab === 'overview'} onClick={setSelectedTab}>
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Overview
              </TabButton>
              <TabButton id="stake" isActive={selectedTab === 'stake'} onClick={setSelectedTab}>
                <Plus className="w-4 h-4 inline mr-2" />
                Stake
              </TabButton>
              <TabButton id="positions" isActive={selectedTab === 'positions'} onClick={setSelectedTab}>
                <Layers className="w-4 h-4 inline mr-2" />
                My Positions
              </TabButton>
            </div>
          </div>
        </motion.div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Total Staked</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  {hideAmounts ? '••••••••' : formatCurrency(metrics.totalStaked)}
                </p>
                <p className="text-sm text-slate-300 mt-1">{metrics.portfolioWeight}% of portfolio</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">Total Rewards</h3>
                </div>
                <p className="text-2xl font-bold text-white">
                  {hideAmounts ? '••••••••' : formatCurrency(metrics.totalRewards)}
                </p>
                <p className="text-sm text-slate-300 mt-1">All-time earnings</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Percent className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Average APY</h3>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.averageApy}%</p>
                <p className="text-sm text-slate-300 mt-1">Weighted average</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Risk Score</h3>
                </div>
                <p className="text-2xl font-bold text-white">{metrics.riskScore}/10</p>
                <p className="text-sm text-slate-300 mt-1">Portfolio risk level</p>
              </div>
            </motion.div>

            {/* Top Protocols */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6">Top DeFi Protocols</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {protocols.map((protocol, index) => (
                  <motion.div
                    key={protocol.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{protocol.icon}</div>
                      <div>
                        <h4 className="font-bold text-white flex items-center gap-2">
                          {protocol.name}
                          {protocol.verified && <CheckCircle className="w-4 h-4 text-green-400" />}
                        </h4>
                        <p className="text-sm text-slate-300 capitalize">{protocol.category}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-300">TVL</span>
                        <span className="text-white font-medium">${formatNumber(protocol.tvl)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Max APY</span>
                        <span className="text-green-400 font-medium">{protocol.maxApy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Pools</span>
                        <span className="text-white font-medium">{protocol.pools}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Stake Tab */}
        {selectedTab === 'stake' && (
          <div className="space-y-8">
            {/* Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search pools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="staking">Staking</option>
                  <option value="lending">Lending</option>
                  <option value="liquidity">Liquidity</option>
                  <option value="farming">Farming</option>
                </select>

                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
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
                  <option value="apy">Sort by APY</option>
                  <option value="tvl">Sort by TVL</option>
                  <option value="rewards">Sort by Rewards</option>
                </select>
              </div>
            </motion.div>

            {/* Staking Pools */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
            >
              <div className="bg-white/5 border-b border-white/20 p-6">
                <h3 className="text-xl font-bold text-white">Available Staking Pools</h3>
              </div>
              
              <div className="divide-y divide-white/10">
                {stakingPools.map((pool, index) => {
                  const TypeIcon = getTypeIcon(pool.type)
                  
                  return (
                    <motion.div
                      key={pool.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                            {pool.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-bold text-white">{pool.name}</h4>
                              <span className="px-2 py-1 bg-slate-500/20 text-slate-300 rounded-full text-xs capitalize">
                                {pool.type}
                              </span>
                              <span className={`text-xs font-semibold ${getRiskColor(pool.riskLevel)}`}>
                                {pool.riskLevel.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-300">
                              <span>{pool.protocol}</span>
                              <span>TVL: ${formatNumber(pool.tvl)}</span>
                              <span>Min: {pool.minStake} {pool.asset}</span>
                              {pool.lockPeriod > 0 && <span>Lock: {pool.lockPeriod} days</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-400">{pool.apy}%</p>
                            <p className="text-sm text-slate-300">APY</p>
                          </div>
                          
                          {pool.userStaked > 0 ? (
                            <div className="text-right">
                              <p className="font-bold text-white">
                                {hideAmounts ? '••••••' : formatCrypto(pool.userStaked)} {pool.asset}
                              </p>
                              <p className="text-sm text-green-400">
                                Rewards: {hideAmounts ? '••••' : formatCrypto(pool.rewards, 2)}
                              </p>
                            </div>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStake(pool)}
                              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl text-white font-medium transition-all"
                            >
                              Stake Now
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* Positions Tab */}
        {selectedTab === 'positions' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden"
          >
            <div className="bg-white/5 border-b border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">My DeFi Positions</h3>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <span>Total Value: </span>
                  <span className="font-bold text-white">
                    {hideAmounts ? '••••••••' : formatCurrency(metrics.totalValue)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-white/10">
              {positions.map((position, index) => {
                const TypeIcon = getTypeIcon(position.type)
                const daysStaked = Math.floor((new Date().getTime() - new Date(position.startDate).getTime()) / (1000 * 60 * 60 * 24))
                
                return (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                          {position.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-white">{position.protocol}</h4>
                            <span className="px-2 py-1 bg-slate-500/20 text-slate-300 rounded-full text-xs capitalize">
                              {position.type}
                            </span>
                            {position.locked && <Lock className="w-4 h-4 text-orange-400" />}
                            {position.autoCompound && <RefreshCw className="w-4 h-4 text-green-400" />}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-300">
                            <span>{position.asset}</span>
                            <span>Staked {daysStaked} days ago</span>
                            <span className="capitalize">{position.network}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-white">
                            {hideAmounts ? '••••••' : formatCrypto(position.amount)} {position.asset.split('/')[0]}
                          </p>
                          <p className="text-sm text-slate-300">
                            {hideAmounts ? '••••••••' : formatCurrency(position.value)}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">{position.apy}%</p>
                          <p className="text-sm text-slate-300">APY</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-yellow-400">
                            {hideAmounts ? '••••' : formatCrypto(position.rewards, 2)}
                          </p>
                          <p className="text-sm text-slate-300">Rewards</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
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
              <Zap className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">High Yield Staking</h3>
              <p className="text-slate-300">Earn competitive rewards through validated staking protocols with automated compounding.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Shield className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Risk Management</h3>
              <p className="text-slate-300">Advanced risk assessment with diversified protocol selection and safety scoring.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Lightning className="w-8 h-8 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">DeFi Integration</h3>
              <p className="text-slate-300">Seamless integration with top DeFi protocols for liquidity provision and yield farming.</p>
            </motion.div>
          </div>

          <div className="text-center text-slate-300 mt-8 pt-8 border-t border-white/10">
            <p>&copy; 2025 Wallet Platform. All rights reserved. | DeFi & Staking v2.0.0</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default DeFiStakingPage
