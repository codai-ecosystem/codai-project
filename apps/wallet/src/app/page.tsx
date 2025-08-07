'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  QrCode,
  Copy,
  ExternalLink,
  Shield,
  Zap,
  Gift,
  Clock,
  Star,
  DollarSign,
  Bitcoin,
  Coins,
  Banknote,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Activity,
  BarChart3,
  Filter,
  Search,
  Download,
  Upload,
  Settings,
  Bell,
  Users,
  Globe
} from 'lucide-react'
import Link from 'next/link'

// TypeScript Interfaces
interface CryptoAsset {
  id: string
  symbol: string
  name: string
  balance: number
  price: number
  change24h: number
  value: number
  icon: string
}

interface Transaction {
  id: string
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake'
  asset: string
  amount: number
  value: number
  fee: number
  status: 'completed' | 'pending' | 'failed'
  hash: string
  timestamp: string
  from?: string
  to?: string
}

interface WalletMetrics {
  totalBalance: number
  totalChange24h: number
  totalChangePercent: number
  totalAssets: number
  activeStaking: number
  pendingTransactions: number
  nftCollection: number
  rewards: number
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  color: string
  href: string
}

interface DeFiPosition {
  id: string
  protocol: string
  type: string
  asset: string
  amount: number
  apy: number
  rewards: number
  status: string
}

const WalletDashboard = () => {
  const [hideBalance, setHideBalance] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [metrics] = useState<WalletMetrics>({
    totalBalance: 45782.34,
    totalChange24h: 2347.89,
    totalChangePercent: 5.42,
    totalAssets: 12,
    activeStaking: 8,
    pendingTransactions: 3,
    nftCollection: 47,
    rewards: 234.56
  })

  const [cryptoAssets] = useState<CryptoAsset[]>([
    {
      id: '1',
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: 0.5432,
      price: 67234.56,
      change24h: 3.24,
      value: 36523.45,
      icon: '₿'
    },
    {
      id: '2',
      symbol: 'ETH',
      name: 'Ethereum',
      balance: 2.8765,
      price: 3456.78,
      change24h: -1.23,
      value: 9945.12,
      icon: 'Ξ'
    },
    {
      id: '3',
      symbol: 'ADA',
      name: 'Cardano',
      balance: 1250.00,
      price: 0.485,
      change24h: 8.56,
      value: 606.25,
      icon: '₳'
    },
    {
      id: '4',
      symbol: 'SOL',
      name: 'Solana',
      balance: 45.67,
      price: 187.23,
      change24h: 12.34,
      value: 8549.45,
      icon: '◎'
    },
    {
      id: '5',
      symbol: 'DOT',
      name: 'Polkadot',
      balance: 123.45,
      price: 7.89,
      change24h: -2.67,
      value: 974.42,
      icon: '●'
    },
    {
      id: '6',
      symbol: 'MATIC',
      name: 'Polygon',
      balance: 890.12,
      price: 0.876,
      change24h: 4.56,
      value: 779.34,
      icon: '⬢'
    }
  ])

  const [recentTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'receive',
      asset: 'BTC',
      amount: 0.0245,
      value: 1647.23,
      fee: 0.00012,
      status: 'completed',
      hash: '0x1a2b3c4d5e6f...',
      timestamp: '2025-08-07T14:30:00Z',
      from: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
    },
    {
      id: '2',
      type: 'send',
      asset: 'ETH',
      amount: 0.5,
      value: 1728.39,
      fee: 0.0045,
      status: 'pending',
      hash: '0x2b3c4d5e6f7a...',
      timestamp: '2025-08-07T13:45:00Z',
      to: '0x742d35Cc6635C0532925a3b8D0897dBF7BDF3Ac7'
    },
    {
      id: '3',
      type: 'stake',
      asset: 'ADA',
      amount: 500,
      value: 242.50,
      fee: 2.17,
      status: 'completed',
      hash: '0x3c4d5e6f7a8b...',
      timestamp: '2025-08-07T12:15:00Z'
    },
    {
      id: '4',
      type: 'swap',
      asset: 'SOL',
      amount: 10,
      value: 1872.30,
      fee: 0.25,
      status: 'completed',
      hash: '0x4d5e6f7a8b9c...',
      timestamp: '2025-08-07T11:30:00Z'
    }
  ])

  const [defiPositions] = useState<DeFiPosition[]>([
    {
      id: '1',
      protocol: 'Aave',
      type: 'Lending',
      asset: 'USDC',
      amount: 5000,
      apy: 4.25,
      rewards: 45.67,
      status: 'Active'
    },
    {
      id: '2',
      protocol: 'Uniswap',
      type: 'Liquidity Pool',
      asset: 'ETH/USDC',
      amount: 2500,
      apy: 12.34,
      rewards: 78.90,
      status: 'Active'
    },
    {
      id: '3',
      protocol: 'Compound',
      type: 'Lending',
      asset: 'DAI',
      amount: 1800,
      apy: 3.67,
      rewards: 23.45,
      status: 'Active'
    }
  ])

  const quickActions: QuickAction[] = [
    {
      id: 'send',
      title: 'Send',
      description: 'Transfer crypto to another wallet',
      icon: ArrowUpRight,
      color: 'from-red-500 to-pink-600',
      href: '/send'
    },
    {
      id: 'receive',
      title: 'Receive',
      description: 'Get crypto from another wallet',
      icon: ArrowDownLeft,
      color: 'from-green-500 to-emerald-600',
      href: '/receive'
    },
    {
      id: 'swap',
      title: 'Swap',
      description: 'Exchange one crypto for another',
      icon: RefreshCw,
      color: 'from-blue-500 to-cyan-600',
      href: '/swap'
    },
    {
      id: 'stake',
      title: 'Stake',
      description: 'Earn rewards by staking crypto',
      icon: Zap,
      color: 'from-purple-500 to-violet-600',
      href: '/stake'
    },
    {
      id: 'nft',
      title: 'NFTs',
      description: 'Manage your NFT collection',
      icon: Star,
      color: 'from-orange-500 to-amber-600',
      href: '/nfts'
    },
    {
      id: 'defi',
      title: 'DeFi',
      description: 'Access decentralized finance',
      icon: Coins,
      color: 'from-indigo-500 to-purple-600',
      href: '/defi'
    }
  ]

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const copyAddress = () => {
    navigator.clipboard.writeText('0x742d35Cc6635C0532925a3b8D0897dBF7BDF3Ac7')
    // Show toast notification (simplified)
    alert('Address copied to clipboard!')
  }

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
      default: return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
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
                <Wallet className="w-8 h-8 text-purple-400" />
                Wallet Dashboard
              </h1>
              <p className="text-purple-300 mt-1">Manage your digital assets and DeFi positions</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{metrics.totalAssets}</p>
                  <p className="text-purple-300">Assets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{metrics.activeStaking}</p>
                  <p className="text-purple-300">Staking</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{metrics.nftCollection}</p>
                  <p className="text-purple-300">NFTs</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-xl text-purple-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </motion.button>

                <Link href="/settings">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Balance Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Portfolio Balance
              </h2>
              <p className="text-purple-300 mt-1">Your total crypto holdings</p>
            </div>
            
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setHideBalance(!hideBalance)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-xl text-purple-300 transition-colors"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {hideBalance ? 'Show' : 'Hide'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyAddress}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl text-blue-300 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <div className="text-center md:text-left">
                <p className="text-4xl font-bold text-white mb-2">
                  {hideBalance ? '••••••••' : formatCurrency(metrics.totalBalance)}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className={`flex items-center gap-1 ${metrics.totalChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.totalChangePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {hideBalance ? '••••' : `${Math.abs(metrics.totalChangePercent).toFixed(2)}%`}
                  </span>
                  <span className={`${metrics.totalChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({hideBalance ? '••••••' : formatCurrency(Math.abs(metrics.totalChange24h))})
                  </span>
                  <span className="text-purple-300">24h</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Staking Rewards</span>
              </div>
              <p className="text-xl font-bold text-white">{hideBalance ? '••••••' : formatCurrency(metrics.rewards)}</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Pending</span>
              </div>
              <p className="text-xl font-bold text-white">{metrics.pendingTransactions} transactions</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center cursor-pointer transition-all hover:border-white/40"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">{action.title}</h4>
                  <p className="text-sm text-purple-300">{action.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Crypto Assets */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-400" />
                Your Assets
              </h3>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <Link href="/portfolio">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-xl text-purple-300 transition-colors text-sm"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {cryptoAssets.slice(0, 6).map((asset) => (
                <motion.div
                  key={asset.id}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                      {asset.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{asset.symbol}</p>
                      <p className="text-sm text-purple-300">{asset.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {hideBalance ? '••••••' : formatCurrency(asset.value)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-purple-300">
                        {hideBalance ? '••••' : formatCrypto(asset.balance)} {asset.symbol}
                      </p>
                      <span className={`text-sm flex items-center gap-1 ${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(asset.change24h).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Recent Activity
              </h3>
              
              <Link href="/transactions">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-xl text-purple-300 transition-colors text-sm"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>

            <div className="space-y-4">
              {recentTransactions.map((tx) => {
                const TransactionIcon = getTransactionIcon(tx.type)
                return (
                  <motion.div
                    key={tx.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'send' ? 'bg-red-500/20 text-red-400' :
                        tx.type === 'receive' ? 'bg-green-500/20 text-green-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        <TransactionIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white capitalize">{tx.type} {tx.asset}</p>
                        <p className="text-sm text-purple-300">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {tx.type === 'send' ? '-' : '+'}{formatCrypto(tx.amount)} {tx.asset}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-purple-300">{formatCurrency(tx.value)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* DeFi Positions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              DeFi Positions
            </h3>
            
            <Link href="/defi">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 rounded-xl text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Position
              </motion.button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {defiPositions.map((position) => (
              <motion.div
                key={position.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer transition-all hover:border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-white">{position.protocol}</p>
                    <p className="text-sm text-purple-300">{position.type}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    {position.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-purple-300">Asset:</span>
                    <span className="text-white font-medium">{position.asset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Amount:</span>
                    <span className="text-white font-medium">{formatCurrency(position.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">APY:</span>
                    <span className="text-green-400 font-medium">{position.apy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300">Rewards:</span>
                    <span className="text-yellow-400 font-medium">{formatCurrency(position.rewards)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
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
              <Shield className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Bank-Grade Security</h3>
              <p className="text-purple-300">Multi-signature wallets, hardware security modules, and advanced encryption protect your assets.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Globe className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Chain Support</h3>
              <p className="text-purple-300">Access Bitcoin, Ethereum, Solana, and 50+ blockchain networks from one wallet.</p>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
            >
              <Zap className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">DeFi Integration</h3>
              <p className="text-purple-300">Stake, lend, borrow, and provide liquidity across top DeFi protocols seamlessly.</p>
            </motion.div>
          </div>

          <div className="text-center text-purple-300 mt-8 pt-8 border-t border-white/10">
            <p>&copy; 2025 Wallet Platform. All rights reserved. | Dashboard v2.0.0</p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default WalletDashboard
