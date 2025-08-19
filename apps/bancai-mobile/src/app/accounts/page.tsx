'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Plus,
  Eye,
  EyeOff,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  Activity,
  Home,
  Investment,
  DollarSign,
  Shield,
  Smartphone,
  Bell,
  Menu,
  ChevronRight,
  Send,
  Calendar,
  BarChart3,
  Clock,
  Star
} from 'lucide-react'

// TypeScript interfaces for account management
interface DetailedAccount {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  currency: string
  accountNumber: string
  routingNumber: string
  status: 'active' | 'pending' | 'locked'
  interestRate?: number
  creditLimit?: number
  minimumBalance?: number
  monthlyFee?: number
  lastTransaction: string
  transactionCount: number
  rewards?: {
    type: string
    rate: number
    earned: number
  }
}

interface AccountActivity {
  id: string
  accountId: string
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment'
  amount: number
  description: string
  date: string
  balance: number
  category: string
}

interface AccountMetrics {
  totalBalance: number
  totalAccounts: number
  monthlyIncome: number
  monthlyExpenses: number
  netWorth: number
  savingsGoal: number
  savingsProgress: number
}

export default function AccountsPage() {
  const [showBalances, setShowBalances] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [metrics, setMetrics] = useState<AccountMetrics>({
    totalBalance: 23893.56,
    totalAccounts: 4,
    monthlyIncome: 5200.00,
    monthlyExpenses: 3247.89,
    netWorth: 67545.23,
    savingsGoal: 50000.00,
    savingsProgress: 35.7
  })

  const [accounts, setAccounts] = useState<DetailedAccount[]>([
    {
      id: '1',
      name: 'Primary Checking',
      type: 'checking',
      balance: 6901.65,
      currency: 'USD',
      accountNumber: '****1234',
      routingNumber: '021000021',
      status: 'active',
      minimumBalance: 500,
      monthlyFee: 0,
      lastTransaction: '2 hours ago',
      transactionCount: 47,
      rewards: {
        type: 'Cashback',
        rate: 1.5,
        earned: 89.50
      }
    },
    {
      id: '2',
      name: 'High-Yield Savings',
      type: 'savings',
      balance: 8945.67,
      currency: 'USD',
      accountNumber: '****5678',
      routingNumber: '021000021',
      status: 'active',
      interestRate: 4.25,
      minimumBalance: 1000,
      monthlyFee: 0,
      lastTransaction: '1 day ago',
      transactionCount: 12
    },
    {
      id: '3',
      name: 'Rewards Credit Card',
      type: 'credit',
      balance: -1247.89,
      currency: 'USD',
      accountNumber: '****9012',
      routingNumber: 'N/A',
      status: 'active',
      creditLimit: 15000,
      interestRate: 18.99,
      lastTransaction: '3 hours ago',
      transactionCount: 23,
      rewards: {
        type: 'Points',
        rate: 2.0,
        earned: 2847
      }
    },
    {
      id: '4',
      name: 'Investment Portfolio',
      type: 'investment',
      balance: 45678.90,
      currency: 'USD',
      accountNumber: '****3456',
      routingNumber: 'N/A',
      status: 'active',
      lastTransaction: '5 hours ago',
      transactionCount: 8,
      rewards: {
        type: 'Returns',
        rate: 12.4,
        earned: 5234.78
      }
    }
  ])

  const [recentActivity, setRecentActivity] = useState<AccountActivity[]>([
    {
      id: '1',
      accountId: '1',
      type: 'payment',
      amount: -5.47,
      description: 'Starbucks Coffee',
      date: '2 hours ago',
      balance: 6901.65,
      category: 'Food & Dining'
    },
    {
      id: '2',
      accountId: '1',
      type: 'deposit',
      amount: 3200.00,
      description: 'Direct Deposit - Salary',
      date: 'Yesterday',
      balance: 6907.12,
      category: 'Income'
    },
    {
      id: '3',
      accountId: '3',
      type: 'payment',
      amount: -89.99,
      description: 'Amazon Purchase',
      date: '2 days ago',
      balance: -1157.90,
      category: 'Shopping'
    }
  ])

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalBalance: prev.totalBalance + (Math.random() - 0.5) * 50,
        savingsProgress: Math.min(100, prev.savingsProgress + (Math.random() * 0.1))
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return <Wallet className="w-6 h-6 text-blue-600" />
      case 'savings': return <PiggyBank className="w-6 h-6 text-green-600" />
      case 'credit': return <CreditCard className="w-6 h-6 text-purple-600" />
      case 'investment': return <TrendingUp className="w-6 h-6 text-orange-600" />
      default: return <DollarSign className="w-6 h-6 text-gray-600" />
    }
  }

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking': return 'from-blue-500 to-blue-600'
      case 'savings': return 'from-green-500 to-green-600'
      case 'credit': return 'from-purple-500 to-purple-600'
      case 'investment': return 'from-orange-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-50">
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white py-4 px-4 shadow-xl"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">My Accounts</h1>
              <p className="text-green-100 text-sm">Manage all your accounts</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
            >
              {showBalances ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-4 flex justify-between text-center">
          <div>
            <div className="text-xs text-green-200">Total Balance</div>
            <div className="text-lg font-bold">
              {showBalances ? formatCurrency(metrics.totalBalance) : '••••••'}
            </div>
          </div>
          <div>
            <div className="text-xs text-green-200">Accounts</div>
            <div className="text-lg font-bold">{metrics.totalAccounts}</div>
          </div>
          <div>
            <div className="text-xs text-green-200">Net Worth</div>
            <div className="text-lg font-bold">
              {showBalances ? formatCurrency(metrics.netWorth) : '••••••'}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm shadow-xl rounded-b-2xl p-4 z-50"
          >
            <div className="grid grid-cols-2 gap-3">
              <Link href="/" className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl text-green-700 hover:bg-green-100 transition-colors">
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link href="/transactions" className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Transactions</span>
              </Link>
              <Link href="/transfers" className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl text-purple-700 hover:bg-purple-100 transition-colors">
                <Send className="w-5 h-5" />
                <span className="font-medium">Transfers</span>
              </Link>
              <Link href="/payments" className="flex items-center space-x-3 p-3 bg-orange-50 rounded-xl text-orange-700 hover:bg-orange-100 transition-colors">
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Payments</span>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.header>

      <div className="px-4 py-6">
        {/* View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-between items-center mb-6"
        >
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Activity className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </motion.div>

        {/* Accounts Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-6' : 'space-y-4 mb-6'}
        >
          {accounts.map((account) => (
            <motion.div
              key={account.id}
              whileHover={{ scale: 1.02 }}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl ${
                selectedAccount === account.id ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  {getAccountIcon(account.type)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-600">{account.accountNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    account.status === 'active' ? 'bg-green-100 text-green-600' : 
                    account.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-red-100 text-red-600'
                  }`}>
                    {account.status}
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">
                  {account.type === 'credit' ? 'Available Credit' : 'Balance'}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {showBalances ? (
                    account.type === 'credit' ? 
                      formatCurrency((account.creditLimit || 0) + account.balance) :
                      formatCurrency(account.balance)
                  ) : '••••••'}
                </div>
                {account.type === 'credit' && (
                  <div className="text-sm text-gray-600">
                    Used: {showBalances ? formatCurrency(Math.abs(account.balance)) : '••••••'}
                  </div>
                )}
              </div>

              {/* Account Details */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Activity</span>
                  <span className="text-gray-900">{account.lastTransaction}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transactions</span>
                  <span className="text-gray-900">{account.transactionCount} this month</span>
                </div>
                {account.interestRate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="text-green-600">{account.interestRate}% APY</span>
                  </div>
                )}
                {account.rewards && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{account.rewards.type}</span>
                    <span className="text-orange-600">
                      {account.rewards.type === 'Points' ? 
                        `${account.rewards.earned} pts` : 
                        formatCurrency(account.rewards.earned)
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {selectedAccount === account.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 py-2 rounded-lg">
                      <Activity className="w-4 h-4" />
                      <span>View Activity</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-green-50 text-green-600 py-2 rounded-lg">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Routing Number</span>
                      <span className="text-gray-900">{account.routingNumber}</span>
                    </div>
                    {account.minimumBalance && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minimum Balance</span>
                        <span className="text-gray-900">{formatCurrency(account.minimumBalance)}</span>
                      </div>
                    )}
                    {account.monthlyFee !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Fee</span>
                        <span className="text-gray-900">
                          {account.monthlyFee === 0 ? 'Free' : formatCurrency(account.monthlyFee)}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Savings Goal Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Savings Goal Progress</h3>
              <p className="text-green-100 text-sm">Emergency Fund Target</p>
            </div>
            <Star className="w-8 h-8 text-green-200" />
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{metrics.savingsProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${metrics.savingsProgress}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span>Current: {showBalances ? formatCurrency(metrics.savingsProgress * metrics.savingsGoal / 100) : '••••••'}</span>
            <span>Goal: {showBalances ? formatCurrency(metrics.savingsGoal) : '••••••'}</span>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link href="/transactions" className="text-green-600 text-sm font-medium flex items-center">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'deposit' ? 'bg-green-100' :
                    activity.type === 'withdrawal' || activity.type === 'payment' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {activity.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4 text-green-600" /> :
                     activity.type === 'withdrawal' || activity.type === 'payment' ? <ArrowUpRight className="w-4 h-4 text-red-600" /> :
                     <Send className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{activity.description}</div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.amount > 0 ? '+' : ''}{formatCurrency(activity.amount)}
                  </div>
                  <div className="text-xs text-gray-500">{activity.category}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-2"
      >
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center p-2 text-gray-500">
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium mt-1">Home</span>
          </Link>
          <Link href="/accounts" className="flex flex-col items-center p-2 text-green-600">
            <Wallet className="w-5 h-5" />
            <span className="text-xs font-medium mt-1">Accounts</span>
          </Link>
          <Link href="/transactions" className="flex flex-col items-center p-2 text-gray-500">
            <Activity className="w-5 h-5" />
            <span className="text-xs font-medium mt-1">Activity</span>
          </Link>
          <Link href="/investments" className="flex flex-col items-center p-2 text-gray-500">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-medium mt-1">Invest</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center p-2 text-gray-500">
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium mt-1">Settings</span>
          </Link>
        </div>
      </motion.div>

      {/* Padding for bottom navigation */}
      <div className="h-20"></div>
    </div>
  )
}
