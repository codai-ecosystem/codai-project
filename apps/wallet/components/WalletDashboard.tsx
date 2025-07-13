'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Send,
  ArrowDownToLine,
  Coins,
  Gem,
  Shield,
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Plus,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Search
} from 'lucide-react'
import WalletService from '../lib/wallet-service'

interface AssetCardProps {
  asset: {
    symbol: string
    name: string
    balance: number
    balanceUSD: number
    price: number
    priceChange24h: number
    logoUrl?: string
  }
}

const AssetCard = ({ asset }: AssetCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center">
          <Coins className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{asset.symbol}</h3>
          <p className="text-sm text-gray-400">{asset.name}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-white">${asset.balanceUSD.toLocaleString()}</p>
        <div className="flex items-center space-x-1">
          {asset.priceChange24h >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <p className={`text-sm ${asset.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-white/10">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Balance:</span>
        <span className="text-white">{asset.balance.toFixed(6)} {asset.symbol}</span>
      </div>
      <div className="flex justify-between text-sm mt-1">
        <span className="text-gray-400">Price:</span>
        <span className="text-white">${asset.price.toLocaleString()}</span>
      </div>
    </div>
  </motion.div>
)

interface TransactionItemProps {
  transaction: {
    id: string
    type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake'
    amount: number
    asset: string
    timestamp: Date
    status: 'pending' | 'confirmed' | 'failed'
    hash: string
  }
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const getStatusIcon = () => {
    switch (transaction.status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeIcon = () => {
    switch (transaction.type) {
      case 'send':
        return <Send className="w-4 h-4 text-red-400" />
      case 'receive':
        return <ArrowDownToLine className="w-4 h-4 text-green-400" />
      case 'swap':
        return <ArrowUpDown className="w-4 h-4 text-blue-400" />
      default:
        return <Wallet className="w-4 h-4 text-purple-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          {getTypeIcon()}
        </div>
        <div>
          <p className="text-sm font-medium text-white capitalize">
            {transaction.type} {transaction.asset}
          </p>
          <p className="text-xs text-gray-400">
            {transaction.timestamp.toLocaleDateString()} {transaction.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <p className="text-sm font-medium text-white">
            {transaction.type === 'send' ? '-' : '+'}{transaction.amount} {transaction.asset}
          </p>
          <div className="flex items-center space-x-1">
            {getStatusIcon()}
            <span className="text-xs text-gray-400 capitalize">{transaction.status}</span>
          </div>
        </div>
        <button className="p-1 text-gray-400 hover:text-white transition-colors">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default function WalletDashboard() {
  const [walletService] = useState(() => WalletService)
  const [metrics, setMetrics] = useState<any>(null)
  const [assets, setAssets] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [nfts, setNfts] = useState<any[]>([])
  const [defiPositions, setDefiPositions] = useState<any[]>([])
  const [isBalanceHidden, setIsBalanceHidden] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  useEffect(() => {
    loadWalletData()
  }, [])

  const loadWalletData = async () => {
    setIsLoading(true)
    try {
      const [metricsData, assetsData, transactionsData, nftsData, defiData] = await Promise.all([
        walletService.getWalletMetrics(),
        walletService.getAssets(),
        walletService.getTransactions(5),
        walletService.getNFTs(),
        walletService.getDeFiPositions()
      ])

      setMetrics(metricsData)
      setAssets(assetsData)
      setTransactions(transactionsData)
      setNfts(nftsData)
      setDefiPositions(defiData)
    } catch (error) {
      console.error('Failed to load wallet data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatBalance = (amount: number) => {
    if (isBalanceHidden) return '****'
    return `$${amount.toLocaleString()}`
  }

  const quickActions = [
    {
      icon: <Send className="w-5 h-5" />,
      label: 'Send',
      color: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30',
      textColor: 'text-red-400'
    },
    {
      icon: <ArrowDownToLine className="w-5 h-5" />,
      label: 'Receive',
      color: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/30',
      textColor: 'text-green-400'
    },
    {
      icon: <ArrowUpDown className="w-5 h-5" />,
      label: 'Swap',
      color: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30',
      textColor: 'text-blue-400'
    },
    {
      icon: <Plus className="w-5 h-5" />,
      label: 'Buy',
      color: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30',
      textColor: 'text-purple-400'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Total Portfolio Value</p>
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl font-bold text-white">
                  {formatBalance(metrics?.totalBalanceUSD || 0)}
                </h2>
                <button
                  onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isBalanceHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1">
                {metrics?.portfolioChangePercent24h >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
                <span className={`text-lg font-semibold ${metrics?.portfolioChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {metrics?.portfolioChangePercent24h >= 0 ? '+' : ''}
                  {metrics?.portfolioChangePercent24h?.toFixed(2)}%
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {formatBalance(metrics?.portfolioChange24h || 0)} today
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${action.color} rounded-xl p-4 border transition-all duration-200 flex flex-col items-center space-y-2`}
              >
                <div className={action.textColor}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-white">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Account Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Account</h3>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Main Wallet</p>
                  <p className="text-xs text-gray-400">0x742d...9D4C</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Assets</span>
                <span className="text-sm text-white">{assets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">NFTs</span>
                <span className="text-sm text-white">{nfts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">DeFi Positions</span>
                <span className="text-sm text-white">{defiPositions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Transactions</span>
                <span className="text-sm text-white">{metrics?.totalTransactions}</span>
              </div>
            </div>

            <button
              onClick={loadWalletData}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg border border-purple-500/30 text-purple-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Assets and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Top Assets</h3>
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-white transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {assets.slice(0, 4).map((asset, index) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>

          <button className="w-full mt-4 py-2 text-center text-purple-400 hover:text-purple-300 transition-colors">
            View All Assets
          </button>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-2">
            {transactions.map((transaction, index) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">No transactions yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* DeFi and NFT Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DeFi Positions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">DeFi Positions</h3>
            <span className="text-sm text-gray-400">${defiPositions.reduce((sum, pos) => sum + pos.valueUSD, 0).toLocaleString()}</span>
          </div>

          <div className="space-y-4">
            {defiPositions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="font-medium text-white">{position.protocol}</p>
                  <p className="text-sm text-gray-400">{position.type} • {position.asset}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">${position.valueUSD.toLocaleString()}</p>
                  <p className="text-sm text-green-400">+{position.apy.toFixed(2)}% APY</p>
                </div>
              </motion.div>
            ))}
          </div>

          {defiPositions.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No DeFi positions</p>
              <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                Explore DeFi
              </button>
            </div>
          )}
        </motion.div>

        {/* NFT Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">NFT Collection</h3>
            <span className="text-sm text-gray-400">{nfts.length} items</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {nfts.slice(0, 4).map((nft, index) => (
              <motion.div
                key={nft.id}
                whileHover={{ scale: 1.05 }}
                className="aspect-square bg-white/5 rounded-lg border border-white/10 p-3 cursor-pointer"
              >
                <div className="w-full h-24 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg mb-2"></div>
                <p className="text-xs font-medium text-white truncate">{nft.name}</p>
                <p className="text-xs text-gray-400 truncate">{nft.collection}</p>
              </motion.div>
            ))}
          </div>

          {nfts.length === 0 && (
            <div className="text-center py-8">
              <Gem className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">No NFTs yet</p>
              <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                Explore NFTs
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Security Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Wallet Security</h3>
              <p className="text-sm text-gray-400">Your wallet is secure and protected</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
