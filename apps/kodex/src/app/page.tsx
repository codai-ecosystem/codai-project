'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Blocks,
  Cpu,
  Zap,
  Activity,
  Shield,
  Coins,
  TrendingUp,
  Network,
  ArrowRight,
  BarChart3,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  Server,
  Eye,
  Settings,
  Globe,
  Timer,
  PieChart
} from 'lucide-react'

interface BlockchainStats {
  totalBlocks: number
  networkHashrate: string
  activeNodes: number
  blockTime: number
  totalSupply: number
  marketCap: number
  stakingRewards: number
  tvl: number
}

interface NetworkMetric {
  name: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  icon: React.ElementType
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  href: string
  color: string
}

interface RecentActivity {
  id: string
  type: 'block' | 'transaction' | 'validator' | 'protocol'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'pending' | 'warning'
}

export default function KodexDashboard() {
  const [stats] = useState<BlockchainStats>({
    totalBlocks: 2847392,
    networkHashrate: '2.4 EH/s',
    activeNodes: 15672,
    blockTime: 6.2,
    totalSupply: 21000000,
    marketCap: 156.7,
    stakingRewards: 8.5,
    tvl: 89.2
  })

  const coreMetrics: NetworkMetric[] = [
    { name: 'Total Blocks', value: stats.totalBlocks.toLocaleString(), change: '+2.4%', trend: 'up', icon: Blocks },
    { name: 'Network Hashrate', value: stats.networkHashrate, change: '+12%', trend: 'up', icon: Zap },
    { name: 'Active Nodes', value: stats.activeNodes.toLocaleString(), change: '+5%', trend: 'up', icon: Network },
    { name: 'Market Cap', value: `$${stats.marketCap}M`, change: '+18%', trend: 'up', icon: DollarSign }
  ]

  const protocolMetrics = [
    { name: 'Network Security', value: '99.98%', change: '+0.02%', trend: 'up', icon: Shield },
    { name: 'Transaction Speed', value: '~3,500 TPS', change: '+12%', trend: 'up', icon: Zap },
    { name: 'AI Compute Used', value: '67%', change: '+5%', trend: 'up', icon: Cpu },
    { name: 'Protocol Revenue', value: '$2.4M', change: '+18%', trend: 'up', icon: DollarSign }
  ]

  const quickActions: QuickAction[] = [
    {
      id: 'network',
      title: 'Network Monitor',
      description: 'Monitor network health and performance',
      icon: Network,
      href: '/network',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'transactions',
      title: 'Transaction Explorer',
      description: 'Explore blockchain transactions',
      icon: Activity,
      href: '/transactions',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'protocols',
      title: 'AI Protocols',
      description: 'Manage AI consensus protocols',
      icon: Cpu,
      href: '/protocols',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'economics',
      title: 'Token Economics',
      description: 'View economic metrics and staking',
      icon: Coins,
      href: '/economics',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'nodes',
      title: 'Node Management',
      description: 'Manage validators and miners',
      icon: Server,
      href: '/nodes',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'security',
      title: 'Security Center',
      description: 'Monitor security and threats',
      icon: Shield,
      href: '/security',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'explorer',
      title: 'Block Explorer',
      description: 'Explore blocks and transactions',
      icon: Eye,
      href: '/explorer',
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'block',
      title: 'New Block Mined',
      description: 'Block #2,847,392 validated with 1,247 transactions',
      timestamp: '12s ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'protocol',
      title: 'AI Protocol Updated',
      description: 'Neural Consensus protocol v2.1.0 activated',
      timestamp: '2m ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'validator',
      title: 'Validator Joined',
      description: 'New validator node active with 50,000 KODEX stake',
      timestamp: '5m ago',
      status: 'success'
    },
    {
      id: '4',
      type: 'transaction',
      title: 'Large Transaction',
      description: '500,000 KODEX transfer in progress',
      timestamp: '8m ago',
      status: 'pending'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'block': return <Blocks className="w-4 h-4" />
      case 'transaction': return <ArrowRight className="w-4 h-4" />
      case 'validator': return <Users className="w-4 h-4" />
      case 'protocol': return <Cpu className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'block': return 'bg-blue-100 text-blue-600'
      case 'transaction': return 'bg-green-100 text-green-600'
      case 'validator': return 'bg-purple-100 text-purple-600'
      case 'protocol': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'warning': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white py-6 px-6 shadow-xl"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Blocks className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">KODEX</h1>
                <p className="text-indigo-100">CodaiChain Core Protocol & AI Economic Layer</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 bg-green-500/20 rounded-lg flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Network Online</span>
              </div>
              <div className="px-3 py-1 bg-white/20 rounded-lg">
                <span className="text-sm">Block #{stats.totalBlocks.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Core Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {coreMetrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-indigo-100 text-indigo-600`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{metric.change}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.name}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Protocol Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {protocolMetrics.map((metric, index) => (
            <div
              key={metric.name}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-purple-100 text-purple-600`}>
                  <metric.icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{metric.change}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.name}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Protocol Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity & System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <span className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* System Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Network Status</p>
                    <p className="text-sm text-gray-600">All systems operational</p>
                  </div>
                </div>
                <span className="text-green-600 font-semibold">Healthy</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Timer className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Block Time</p>
                    <p className="text-sm text-gray-600">Average confirmation time</p>
                  </div>
                </div>
                <span className="text-blue-600 font-semibold">{stats.blockTime}s</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <PieChart className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Staking APY</p>
                    <p className="text-sm text-gray-600">Current staking rewards</p>
                  </div>
                </div>
                <span className="text-purple-600 font-semibold">{stats.stakingRewards}%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Globe className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Total Value Locked</p>
                    <p className="text-sm text-gray-600">Protocol liquidity</p>
                  </div>
                </div>
                <span className="text-yellow-600 font-semibold">${stats.tvl}M</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 pt-8 border-t border-gray-200"
        >
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>KODEX - CodaiChain Core Protocol & AI Economic Layer</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Protocol Active</span>
              </div>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'KODEX - CodaiChain Core Protocol',
  description: 'CodaiChain Core Protocol & AI Economic Layer - Advanced blockchain infrastructure for AI-powered applications',
}
