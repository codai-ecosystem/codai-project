'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Users,
  Smartphone,
  MoreHorizontal,
  ChevronDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  category: 'transfer' | 'food' | 'shopping' | 'transport' | 'bills' | 'social' | 'technology' | 'salary' | 'investment'
  description: string
  amount: number
  currency: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  merchant?: string
  account: string
  reference?: string
}

const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    type: 'income',
    category: 'salary',
    description: 'Monthly Salary - CodAI Platform',
    amount: 15000.00,
    currency: 'RON',
    date: '2025-01-05T09:00:00Z',
    status: 'completed',
    account: 'Main Checking',
    reference: 'SAL-2025-01'
  },
  {
    id: 'tx-002',
    type: 'expense',
    category: 'shopping',
    description: 'Groceries - Carrefour',
    amount: 347.82,
    currency: 'RON',
    date: '2025-01-04T14:30:00Z',
    status: 'completed',
    merchant: 'Carrefour',
    account: 'Main Checking'
  },
  {
    id: 'tx-003',
    type: 'expense',
    category: 'food',
    description: 'Coffee & Pastry - Starbucks',
    amount: 28.50,
    currency: 'RON',
    date: '2025-01-04T08:15:00Z',
    status: 'completed',
    merchant: 'Starbucks',
    account: 'Main Checking'
  },
  {
    id: 'tx-004',
    type: 'expense',
    category: 'transport',
    description: 'Uber Ride',
    amount: 45.30,
    currency: 'RON',
    date: '2025-01-03T18:45:00Z',
    status: 'completed',
    merchant: 'Uber',
    account: 'Main Checking'
  },
  {
    id: 'tx-005',
    type: 'expense',
    category: 'bills',
    description: 'Internet & TV - RCS & RDS',
    amount: 89.99,
    currency: 'RON',
    date: '2025-01-03T10:00:00Z',
    status: 'completed',
    merchant: 'RCS & RDS',
    account: 'Main Checking'
  },
  {
    id: 'tx-006',
    type: 'income',
    category: 'investment',
    description: 'Dividend Payment - BVB Stocks',
    amount: 1250.00,
    currency: 'RON',
    date: '2025-01-02T11:30:00Z',
    status: 'completed',
    account: 'Investment Escrow'
  },
  {
    id: 'tx-007',
    type: 'expense',
    category: 'technology',
    description: 'Netflix Subscription',
    amount: 29.99,
    currency: 'RON',
    date: '2025-01-01T12:00:00Z',
    status: 'completed',
    merchant: 'Netflix',
    account: 'Main Checking'
  },
  {
    id: 'tx-008',
    type: 'expense',
    category: 'social',
    description: 'Dinner with Friends - Restaurant',
    amount: 185.60,
    currency: 'RON',
    date: '2024-12-31T19:30:00Z',
    status: 'completed',
    merchant: 'Casa Doina',
    account: 'Main Checking'
  }
]

export default function TransactionsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('This Month')

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return <Coffee className="w-4 h-4" />
      case 'shopping': return <ShoppingBag className="w-4 h-4" />
      case 'transport': return <Car className="w-4 h-4" />
      case 'bills': return <Home className="w-4 h-4" />
      case 'social': return <Users className="w-4 h-4" />
      case 'technology': return <Smartphone className="w-4 h-4" />
      case 'salary': return <TrendingUp className="w-4 h-4" />
      case 'investment': return <TrendingUp className="w-4 h-4" />
      case 'transfer': return <ArrowUpRight className="w-4 h-4" />
      default: return <MoreHorizontal className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-orange-500/20 text-orange-400'
      case 'shopping': return 'bg-pink-500/20 text-pink-400'
      case 'transport': return 'bg-blue-500/20 text-blue-400'
      case 'bills': return 'bg-red-500/20 text-red-400'
      case 'social': return 'bg-purple-500/20 text-purple-400'
      case 'technology': return 'bg-green-500/20 text-green-400'
      case 'salary': return 'bg-emerald-500/20 text-emerald-400'
      case 'investment': return 'bg-yellow-500/20 text-yellow-400'
      case 'transfer': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'failed': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'income' && transaction.type === 'income') ||
      (selectedFilter === 'expense' && transaction.type === 'expense') ||
      (selectedFilter === transaction.category)

    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const totalIncome = mockTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const totalExpenses = mockTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0)

  const categories = ['all', 'income', 'expense', 'food', 'shopping', 'transport', 'bills', 'social', 'technology', 'salary', 'investment']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="text-blue-200 mt-2">Track your financial activity</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            <Calendar className="w-5 h-5" />
            {selectedPeriod}
            <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-blue-200 text-sm font-medium">Total Income</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-2">
            +{totalIncome.toLocaleString('ro-RO')} RON
          </p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+12.5% from last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-blue-200 text-sm font-medium">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-400 mt-2">
            -{totalExpenses.toLocaleString('ro-RO')} RON
          </p>
          <div className="flex items-center gap-1 mt-2 text-red-400">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">+8.2% from last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-blue-200 text-sm font-medium">Net Balance</h3>
          <p className="text-3xl font-bold text-white mt-2">
            +{(totalIncome - totalExpenses).toLocaleString('ro-RO')} RON
          </p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Positive cash flow</span>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedFilter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                  }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <p className="text-blue-200 text-sm mt-1">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="divide-y divide-white/10">
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="p-6 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Transaction Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{transaction.description}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-blue-200 text-sm">{formatDate(transaction.date)}</p>
                      {transaction.merchant && (
                        <>
                          <span className="text-blue-200">•</span>
                          <p className="text-blue-200 text-sm">{transaction.merchant}</p>
                        </>
                      )}
                      <span className="text-blue-200">•</span>
                      <p className="text-blue-200 text-sm">{transaction.account}</p>
                    </div>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="text-right">
                  <p className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-white'
                    }`}>
                    {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('ro-RO')} {transaction.currency}
                  </p>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                    {transaction.type === 'income' ? (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Reference */}
              {transaction.reference && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-blue-200 text-sm">
                    Reference: <span className="text-white font-mono">{transaction.reference}</span>
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="p-6 border-t border-white/20 text-center">
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
            Load More Transactions
          </button>
        </div>
      </div>
    </div>
  )
}
