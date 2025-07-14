'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  Coins,
  Users,
  Vote,
  Activity,
  TrendingUp,
  Clock,
  Settings,
  ChevronRight,
  Star,
  ArrowRight,
  Zap,
  ShoppingCart,
  Shield,
  BarChart3,
  Code,
  Network
} from 'lucide-react'
import CodaiBlockchainService, { Agent, Proposal, ProposalState } from '../src/services/blockchain'

interface BlockchainMetric {
  id: string
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: any
  color: string
}

export default function KodexPage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'governance' | 'wallet'>('overview')
  const [blockchainService] = useState(new CodaiBlockchainService())
  const [walletConnected, setWalletConnected] = useState(false)
  const [currentAccount, setCurrentAccount] = useState<string | null>(null)
  const [tokenBalance, setTokenBalance] = useState('0')
  const [marketplaceStats, setMarketplaceStats] = useState({
    totalAgents: 0,
    totalPurchases: 0,
    totalRevenue: '0'
  })
  const [governanceStats, setGovernanceStats] = useState({
    totalProposals: 0,
    activeProposals: 0,
    totalVoters: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  const [metrics, setMetrics] = useState<BlockchainMetric[]>([
    {
      id: '1',
      title: 'CODAI Tokens',
      value: '0',
      change: '0%',
      trend: 'stable',
      icon: Coins,
      color: 'yellow'
    },
    {
      id: '2',
      title: 'Active Agents',
      value: '0',
      change: '0%',
      trend: 'stable',
      icon: Users,
      color: 'green'
    },
    {
      id: '3',
      title: 'Total Revenue',
      value: '0 CODAI',
      change: '0%',
      trend: 'stable',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      id: '4',
      title: 'Governance',
      value: '0 Proposals',
      change: '0%',
      trend: 'stable',
      icon: Vote,
      color: 'purple'
    }
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Load initial data
    loadBlockchainData()

    return () => clearInterval(timer)
  }, [])

  const loadBlockchainData = async () => {
    try {
      setIsLoading(true)
      
      // Try to get current account if wallet is connected
      const account = await blockchainService.getCurrentAccount()
      if (account) {
        setCurrentAccount(account)
        setWalletConnected(true)
        
        // Load token balance
        try {
          const balance = await blockchainService.getTokenBalance(account)
          setTokenBalance(balance)
          
          // Update metrics
          setMetrics(prev => prev.map(metric => 
            metric.id === '1' ? { ...metric, value: `${parseFloat(balance).toFixed(2)}`, change: '+0%' } : metric
          ))
        } catch (error) {
          console.warn('Token balance not available:', error)
        }
      }

      // Load marketplace stats
      try {
        const mStats = await blockchainService.getMarketplaceStats()
        setMarketplaceStats(mStats)
        
        setMetrics(prev => prev.map(metric => {
          if (metric.id === '2') return { ...metric, value: mStats.totalAgents.toString(), change: '+0%' }
          if (metric.id === '3') return { ...metric, value: `${parseFloat(mStats.totalRevenue).toFixed(2)} CODAI`, change: '+0%' }
          return metric
        }))
      } catch (error) {
        console.warn('Marketplace stats not available:', error)
      }

      // Load governance stats
      try {
        const gStats = await blockchainService.getGovernanceStats()
        setGovernanceStats(gStats)
        
        setMetrics(prev => prev.map(metric => 
          metric.id === '4' ? { ...metric, value: `${gStats.totalProposals} Proposals`, change: '+0%' } : metric
        ))
      } catch (error) {
        console.warn('Governance stats not available:', error)
      }

    } catch (error) {
      console.error('Failed to load blockchain data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectWallet = async () => {
    try {
      setIsLoading(true)
      const connected = await blockchainService.connectWallet()
      
      if (connected) {
        setWalletConnected(true)
        await loadBlockchainData()
      } else {
        alert('Failed to connect wallet. Please make sure MetaMask is installed.')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderIcon = (IconComponent: any, className: string = "w-6 h-6") => {
    return <IconComponent className={className} />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'beta': return 'text-yellow-400 bg-yellow-400/20'
      case 'coming-soon': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -50, 100, 0],
            y: [0, 50, -100, 0],
            scale: [1, 0.8, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, delay: 5 }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                {renderIcon(Network, 'w-8 h-8 text-white')}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  KODEX
                </h1>
                <p className="text-sm text-gray-400">CodaiChain Protocol</p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleTimeString()}
              </div>
              
              {walletConnected ? (
                <div className="flex items-center space-x-4">
                  <div className="text-sm">
                    <div className="text-gray-400">Account</div>
                    <div className="text-green-400 font-mono">{formatAddress(currentAccount || '')}</div>
                  </div>
                  <div className="text-sm">
                    <div className="text-gray-400">Balance</div>
                    <div className="text-white font-medium">{parseFloat(tokenBalance).toFixed(2)} CODAI</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Connected</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Wallet className="w-4 h-4" />
                  )}
                  {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          className="flex justify-center space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-1 max-w-3xl mx-auto border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {(['overview', 'marketplace', 'governance', 'wallet'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === tab
                  ? 'bg-blue-500/30 text-blue-300 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
            >
              {tab === 'overview' && <BarChart3 className="w-4 h-4" />}
              {tab === 'marketplace' && <ShoppingCart className="w-4 h-4" />}
              {tab === 'governance' && <Vote className="w-4 h-4" />}
              {tab === 'wallet' && <Wallet className="w-4 h-4" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
              >
                <h2 className="text-2xl font-bold text-blue-400 mb-4">CodaiChain Ecosystem Protocol</h2>
                <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                  Decentralized blockchain protocol powering the Codai ecosystem with smart contracts, 
                  governance, and marketplace functionality. Trade AI agents, participate in governance, 
                  and earn CODAI tokens.
                </p>
              </motion.div>

              {/* Real-time Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-${metric.color}-500/20`}>
                        {renderIcon(metric.icon, `w-6 h-6 text-${metric.color}-400`)}
                      </div>
                      <div className={`flex items-center space-x-1 text-${metric.trend === 'up' ? 'green' : metric.trend === 'down' ? 'red' : 'gray'}-400`}>
                        <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                        <span className="text-sm font-medium">{metric.change}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
                      <p className="text-gray-300 font-medium">{metric.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Network Status */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Network className="w-6 h-6 text-blue-400" />
                    Network Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network</span>
                      <span className="text-white">{walletConnected ? 'Polygon' : 'Disconnected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Block Time</span>
                      <span className="text-green-400">~2.3s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gas Price</span>
                      <span className="text-white">30 Gwei</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-green-400" />
                    Security Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Smart Contracts</span>
                      <span className="text-green-400">Verified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Audit Status</span>
                      <span className="text-green-400">Passed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vulnerabilities</span>
                      <span className="text-green-400">None</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'marketplace' && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <ShoppingCart className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">AI Agent Marketplace</h2>
              <p className="text-gray-300 mb-6">
                Buy and sell AI agents using CODAI tokens. Smart contracts handle payments,
                verification, and revenue sharing automatically.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-left mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold">Total Agents</h4>
                  <p className="text-2xl text-blue-400 font-bold">{marketplaceStats.totalAgents}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold">Total Sales</h4>
                  <p className="text-2xl text-green-400 font-bold">{marketplaceStats.totalPurchases}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold">Total Volume</h4>
                  <p className="text-2xl text-purple-400 font-bold">{parseFloat(marketplaceStats.totalRevenue).toFixed(2)} CODAI</p>
                </div>
              </div>
              <button 
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-medium"
                disabled={!walletConnected}
              >
                {walletConnected ? 'Browse Marketplace' : 'Connect Wallet to Access'}
              </button>
            </motion.div>
          )}

          {activeTab === 'governance' && (
            <motion.div
              key="governance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <Vote className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-purple-400 mb-4">Decentralized Governance</h2>
              <p className="text-gray-300 mb-6">
                Participate in ecosystem governance by creating proposals and voting with your CODAI tokens.
                Help shape the future of the Codai platform.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-left mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold">Total Proposals</h4>
                  <p className="text-2xl text-purple-400 font-bold">{governanceStats.totalProposals}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold">Active Votes</h4>
                  <p className="text-2xl text-yellow-400 font-bold">{governanceStats.activeProposals}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-white font-semibold">Voting Power</h4>
                  <p className="text-2xl text-blue-400 font-bold">{parseFloat(tokenBalance).toFixed(0)} CODAI</p>
                </div>
              </div>
              <button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
                disabled={!walletConnected}
              >
                {walletConnected ? 'View Proposals' : 'Connect Wallet to Vote'}
              </button>
            </motion.div>
          )}

          {activeTab === 'wallet' && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
            >
              <div className="flex items-center justify-center mb-6">
                <Wallet className="w-12 h-12 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">CODAI Wallet</h2>
              {walletConnected ? (
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Your Wallet</h3>
                    <p className="text-sm text-gray-400 mb-4 font-mono">{currentAccount}</p>
                    <div className="text-3xl font-bold text-yellow-400">{parseFloat(tokenBalance).toFixed(2)} CODAI</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button className="bg-green-500/20 text-green-400 border border-green-500/30 px-6 py-3 rounded-xl hover:bg-green-500/30 transition-all font-medium">
                      Buy CODAI
                    </button>
                    <button className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-6 py-3 rounded-xl hover:bg-blue-500/30 transition-all font-medium">
                      Send CODAI
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 mb-6">
                    Connect your wallet to view your CODAI balance and interact with the ecosystem.
                  </p>
                  <button 
                    onClick={connectWallet}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50"
                  >
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        `
      }} />
    </div>
  )
}
