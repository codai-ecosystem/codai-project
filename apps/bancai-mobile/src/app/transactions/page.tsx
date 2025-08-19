'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Activity,
  Search,
  Filter,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  CreditCard,
  Smartphone,
  TrendingUp,
  Settings,
  Home,
  Wallet,
  Eye,
  EyeOff,
  Menu,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  Star,
  Tag,
  Receipt,
  RefreshCw
} from 'lucide-react'

// TypeScript interfaces for transaction management
interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  subtype: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'fee' | 'interest'
  description: string
  merchant?: string
  amount: number
  date: string
  time: string
  category: string
  subcategory?: string
  account: string
  accountId: string
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  location?: string
  paymentMethod?: string
  confirmationNumber?: string
  note?: string
  tags?: string[]
  isRecurring?: boolean
  originalAmount?: number
  exchangeRate?: number
  currency: string
}

interface TransactionFilters {
  dateRange: 'all' | 'today' | 'week' | 'month' | '3months' | 'year' | 'custom'
  type: 'all' | 'income' | 'expense' | 'transfer'
  category: string
  account: string
  status: 'all' | 'completed' | 'pending' | 'failed'
  amountMin?: number
  amountMax?: number
  searchQuery: string
}

interface TransactionSummary {
  totalIncome: number
  totalExpenses: number
  netAmount: number
  transactionCount: number
  avgTransactionAmount: number
  topCategory: string
  pendingCount: number
}

export default function TransactionsPage() {
  const [showAmounts, setShowAmounts] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: 'month',
    type: 'all',
    category: 'all',
    account: 'all',
    status: 'all',
    searchQuery: ''
  })

  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 5200.00,
    totalExpenses: 3247.89,
    netAmount: 1952.11,
    transactionCount: 47,
    avgTransactionAmount: 125.34,
    topCategory: 'Food & Dining',
    pendingCount: 3
  })

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'expense',
      subtype: 'payment',
      description: 'Starbucks Coffee',
      merchant: 'Starbucks Corporation',
      amount: -5.47,
      date: '2025-08-09',
      time: '09:15 AM',
      category: 'Food & Dining',
      subcategory: 'Coffee',
      account: 'Primary Checking',
      accountId: '1',
      status: 'completed',
      location: 'Seattle, WA',
      paymentMethod: 'Contactless',
      confirmationNumber: 'SB789456123',
      tags: ['coffee', 'morning'],
      currency: 'USD'
    },
    {
      id: '2',
      type: 'income',
      subtype: 'deposit',
      description: 'Direct Deposit - Salary',
      merchant: 'TechCorp Inc.',
      amount: 3200.00,
      date: '2025-08-08',
      time: '06:00 AM',
      category: 'Income',
      subcategory: 'Salary',
      account: 'Primary Checking',
      accountId: '1',
      status: 'completed',
      paymentMethod: 'ACH Transfer',
      confirmationNumber: 'DD456789012',
      isRecurring: true,
      currency: 'USD'
    },
    {
      id: '3',
      type: 'expense',
      subtype: 'payment',
      description: 'Amazon Purchase',
      merchant: 'Amazon.com',
      amount: -89.99,
      date: '2025-08-07',
      time: '02:30 PM',
      category: 'Shopping',
      subcategory: 'Electronics',
      account: 'Rewards Credit Card',
      accountId: '3',
      status: 'completed',
      paymentMethod: 'Credit Card',
      confirmationNumber: 'AMZ789123456',
      note: 'Wireless headphones',
      tags: ['electronics', 'music'],
      currency: 'USD'
    },
    {
      id: '4',
      type: 'transfer',
      subtype: 'transfer',
      description: 'Transfer to Savings',
      amount: -500.00,
      date: '2025-08-06',
      time: '11:45 AM',
      category: 'Transfer',
      account: 'Primary Checking → High-Yield Savings',
      accountId: '1',
      status: 'completed',
      paymentMethod: 'Internal Transfer',
      confirmationNumber: 'TXF123789456',
      isRecurring: true,
      currency: 'USD'
    },
    {
      id: '5',
      type: 'expense',
      subtype: 'payment',
      description: 'Gas Station',
      merchant: 'Shell Oil',
      amount: -45.20,
      date: '2025-08-06',
      time: '07:20 AM',
      category: 'Transportation',
      subcategory: 'Gas',
      account: 'Primary Checking',
      accountId: '1',
      status: 'pending',
      location: 'Portland, OR',
      paymentMethod: 'Debit Card',
      tags: ['gas', 'commute'],
      currency: 'USD'
    },
    {
      id: '6',
      type: 'income',
      subtype: 'interest',
      description: 'Savings Interest',
      amount: 12.47,
      date: '2025-08-05',
      time: '11:59 PM',
      category: 'Income',
      subcategory: 'Interest',
      account: 'High-Yield Savings',
      accountId: '2',
      status: 'completed',
      paymentMethod: 'Interest Credit',
      confirmationNumber: 'INT456123789',
      currency: 'USD'
    }
  ])

  const categories = [
    'All Categories', 'Food & Dining', 'Shopping', 'Transportation', 'Income', 
    'Transfer', 'Entertainment', 'Healthcare', 'Utilities', 'Education', 'Travel'
  ]

  const accounts = [
    'All Accounts', 'Primary Checking', 'High-Yield Savings', 'Rewards Credit Card', 'Investment Portfolio'
  ]

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSummary(prev => ({
        ...prev,
        netAmount: prev.netAmount + (Math.random() - 0.5) * 10
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  const getTransactionIcon = (type: string, subtype: string) => {
    if (type === 'income') return <ArrowDownLeft className="w-5 h-5 text-green-600" />
    if (type === 'transfer') return <Send className="w-5 h-5 text-blue-600" />
    if (subtype === 'payment') return <CreditCard className="w-5 h-5 text-red-600" />
    return <ArrowUpRight className="w-5 h-5 text-red-600" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount))
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.type !== 'all' && transaction.type !== filters.type) return false
    if (filters.category !== 'all' && filters.category !== 'All Categories' && transaction.category !== filters.category) return false
    if (filters.account !== 'all' && filters.account !== 'All Accounts' && transaction.account !== filters.account) return false
    if (filters.status !== 'all' && transaction.status !== filters.status) return false
    if (filters.searchQuery && !transaction.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false
    return true
  })

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
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Transactions</h1>
              <p className="text-green-100 text-sm">Track your spending</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAmounts(!showAmounts)}
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
            >
              {showAmounts ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-green-200">Income</div>
            <div className="text-lg font-bold text-green-100">
              {showAmounts ? `+${formatCurrency(summary.totalIncome)}` : '••••••'}
            </div>
          </div>
          <div>
            <div className="text-xs text-green-200">Expenses</div>
            <div className="text-lg font-bold text-red-200">
              {showAmounts ? `-${formatCurrency(summary.totalExpenses)}` : '••••••'}
            </div>
          </div>
          <div>
            <div className="text-xs text-green-200">Net</div>
            <div className={`text-lg font-bold ${summary.netAmount >= 0 ? 'text-green-100' : 'text-red-200'}`}>
              {showAmounts ? formatCurrency(summary.netAmount) : '••••••'}
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
              <Link href="/accounts" className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 transition-colors">
                <Wallet className="w-5 h-5" />
                <span className="font-medium">Accounts</span>
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
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl mb-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 bg-green-100 text-green-600 rounded-lg"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Download className="w-4 h-4" />
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 pt-3 border-t border-gray-200"
            >
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                  className="p-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expenses</option>
                  <option value="transfer">Transfers</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
                  className="p-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Transactions</div>
                <div className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</div>
              </div>
              <Receipt className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">{summary.pendingCount}</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {filteredTransactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              whileHover={{ scale: 1.01 }}
              className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg ${
                selectedTransaction === transaction.id ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => setSelectedTransaction(selectedTransaction === transaction.id ? null : transaction.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {getTransactionIcon(transaction.type, transaction.subtype)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span>{transaction.merchant || transaction.account}</span>
                      {transaction.location && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {transaction.location}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{transaction.date} at {transaction.time}</span>
                      {transaction.isRecurring && (
                        <span className="flex items-center">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Recurring
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {showAmounts ? (
                      `${transaction.amount > 0 ? '+' : ''}${formatCurrency(transaction.amount)}`
                    ) : '••••••'}
                  </div>
                  <div className="text-sm text-gray-600">{transaction.category}</div>
                  {transaction.tags && transaction.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {transaction.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="inline-flex items-center px-1 py-0.5 bg-gray-100 rounded text-xs">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedTransaction === transaction.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="ml-2 font-medium">{transaction.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Account:</span>
                      <span className="ml-2 font-medium">{transaction.account}</span>
                    </div>
                    {transaction.confirmationNumber && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Confirmation:</span>
                        <span className="ml-2 font-medium">{transaction.confirmationNumber}</span>
                      </div>
                    )}
                    {transaction.note && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Note:</span>
                        <span className="ml-2 font-medium">{transaction.note}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 bg-green-50 text-green-600 py-2 px-4 rounded-lg text-sm font-medium">
                      View Receipt
                    </button>
                    <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium">
                      Categorize
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        )}
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
          <Link href="/accounts" className="flex flex-col items-center p-2 text-gray-500">
            <Wallet className="w-5 h-5" />
            <span className="text-xs font-medium mt-1">Accounts</span>
          </Link>
          <Link href="/transactions" className="flex flex-col items-center p-2 text-green-600">
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
