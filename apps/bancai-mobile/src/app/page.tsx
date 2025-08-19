'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Smartphone,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Plus,
  Send,
  QrCode,
  Bell,
  Settings,
  User,
  TrendingUp,
  DollarSign,
  Wallet,
  PiggyBank,
  Shield,
  Activity,
  ChevronRight,
  Star,
  Clock,
  Zap,
  Home,
  BarChart3,
  Menu
} from 'lucide-react'

// TypeScript interfaces for BancAI Mobile banking platform
interface BankingMetrics {
  totalBalance: number
  savingsBalance: number
  creditAvailable: number
  monthlySpending: number
  pendingTransactions: number
  rewardPoints: number
  creditScore: number
  investments: number
}

interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  currency: string
  accountNumber: string
  status: 'active' | 'pending' | 'locked'
}

interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  description: string
  amount: number
  date: string
  category: string
  status: 'completed' | 'pending' | 'failed'
}

interface QuickAction {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  action: string
}

export default function BancAIMobileDashboard() {
  const [showBalance, setShowBalance] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [metrics, setMetrics] = useState<BankingMetrics>({
    totalBalance: 15847.32,
    savingsBalance: 8945.67,
    creditAvailable: 12500.00,
    monthlySpending: 3247.89,
    pendingTransactions: 3,
    rewardPoints: 2847,
    creditScore: 785,
    investments: 45678.90
  })

  const [accounts] = useState<Account[]>([
    {
      id: '1',
      name: 'Primary Checking',
      type: 'checking',
      balance: 6901.65,
      currency: 'USD',
      accountNumber: '****1234',
      status: 'active'
    },
    {
      id: '2',
      name: 'High-Yield Savings',
      type: 'savings',
      balance: 8945.67,
      currency: 'USD',
      accountNumber: '****5678',
      status: 'active'
    },
    {
      id: '3',
      name: 'Rewards Credit Card',
      type: 'credit',
      balance: -1247.89,
      currency: 'USD',
      accountNumber: '****9012',
      status: 'active'
    }
  ])

  const [recentTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'expense',
      description: 'Starbucks Coffee',
      amount: -5.47,
      date: '2 hours ago',
      category: 'Food & Dining',
      status: 'completed'
    },
    {
      id: '2',
      type: 'income',
      description: 'Direct Deposit - Salary',
      amount: 3200.00,
      date: 'Yesterday',
      category: 'Income',
      status: 'completed'
    },
    {
      id: '3',
      type: 'expense',
      description: 'Amazon Purchase',
      amount: -89.99,
      date: '2 days ago',
      category: 'Shopping',
      status: 'completed'
    },
    {
      id: '4',
      type: 'transfer',
      description: 'Transfer to Savings',
      amount: -500.00,
      date: '3 days ago',
      category: 'Transfer',
      status: 'completed'
    }
  ])

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Send Money',
      icon: <Send className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600',
      action: 'send'
    },
    {
      id: '2',
      title: 'Pay Bills',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600',
      action: 'pay'
    },
    {
      id: '3',
      title: 'Scan QR',
      icon: <QrCode className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600',
      action: 'scan'
    },
    {
      id: '4',
      title: 'Add Money',
      icon: <Plus className="w-6 h-6" />,
      color: 'bg-emerald-100 text-emerald-600',
      action: 'deposit'
    }
  ]

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalBalance: prev.totalBalance + (Math.random() - 0.5) * 10,
        rewardPoints: prev.rewardPoints + Math.floor(Math.random() * 3)
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-green-600'
      case 'expense': return 'text-red-600'
      case 'transfer': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'checking': return <Wallet className="w-5 h-5 text-blue-600" />
      case 'savings': return <PiggyBank className="w-5 h-5 text-green-600" />
      case 'credit': return <CreditCard className="w-5 h-5 text-purple-600" />
      case 'investment': return <TrendingUp className="w-5 h-5 text-orange-600" />
      default: return <DollarSign className="w-5 h-5 text-gray-600" />
    }
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
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">BancAI Mobile</h1>
              <p className="text-green-100 text-sm">AI-Powered Mobile Banking</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm relative">
              <Bell className="w-5 h-5" />
              {metrics.pendingTransactions > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {metrics.pendingTransactions}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
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
              <Link href="/accounts" className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl text-green-700 hover:bg-green-100 transition-colors">
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Accounts</span>
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
              <Link href="/cards" className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-xl text-indigo-700 hover:bg-indigo-100 transition-colors">
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Cards</span>
              </Link>
              <Link href="/investments" className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl text-yellow-700 hover:bg-yellow-100 transition-colors">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Investments</span>
              </Link>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Link href="/settings" className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </motion.header>

      <div className="px-4 py-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Total Balance</h2>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {showBalance ? `$${metrics.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>+2.3% this month</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-sm text-gray-600">Savings</div>
              <div className="text-lg font-semibold text-green-600">
                {showBalance ? `$${metrics.savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="text-sm text-gray-600">Credit Available</div>
              <div className="text-lg font-semibold text-blue-600">
                {showBalance ? `$${metrics.creditAvailable.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg"
              >
                <div className={`p-3 rounded-full ${action.color} mb-2`}>
                  {action.icon}
                </div>
                <span className="text-xs font-medium text-gray-700">{action.title}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Accounts Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Accounts</h3>
            <button className="text-green-600 text-sm font-medium flex items-center">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            {accounts.map((account) => (
              <motion.div
                key={account.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {getAccountTypeIcon(account.type)}
                    <div>
                      <div className="font-medium text-gray-900">{account.name}</div>
                      <div className="text-sm text-gray-600">{account.accountNumber}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {showBalance ? `$${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
                    </div>
                    <div className={`text-sm capitalize ${account.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {account.status}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-green-600 text-sm font-medium flex items-center">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
            {recentTransactions.map((transaction, index) => (
              <div key={transaction.id} className={`p-4 ${index !== recentTransactions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' :
                      transaction.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                      {transaction.type === 'income' ? <ArrowDownLeft className="w-4 h-4 text-green-600" /> :
                        transaction.type === 'expense' ? <ArrowUpRight className="w-4 h-4 text-red-600" /> :
                          <Activity className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {transaction.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">{transaction.category}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Insights & Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">AI Financial Insights</div>
                <div className="text-sm text-green-100">You're spending 15% less this month!</div>
              </div>
              <Zap className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Reward Points</div>
                  <div className="text-xl font-bold text-yellow-600">{metrics.rewardPoints}</div>
                </div>
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Credit Score</div>
                  <div className="text-xl font-bold text-purple-600">{metrics.creditScore}</div>
                </div>
                <Shield className="w-6 h-6 text-purple-500" />
              </div>
            </div>
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
          <Link href="/" className="flex flex-col items-center p-2 text-green-600">
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium mt-1">Home</span>
          </Link>
          <Link href="/accounts" className="flex flex-col items-center p-2 text-gray-500">
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
