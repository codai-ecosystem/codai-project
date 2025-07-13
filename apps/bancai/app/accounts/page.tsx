'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Wallet,
  Building2,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  ArrowUpRight,
  MoreHorizontal,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

interface Account {
  id: string
  type: 'checking' | 'savings' | 'business' | 'escrow'
  name: string
  balance: number
  currency: string
  iban: string
  status: 'active' | 'blocked' | 'pending'
  lastActivity: string
  monthlyChange: number
}

const mockAccounts: Account[] = [
  {
    id: 'acc-001',
    type: 'checking',
    name: 'Main Checking Account',
    balance: 24567.89,
    currency: 'RON',
    iban: 'RO49AAAA1B31007593840000',
    status: 'active',
    lastActivity: '2025-01-05',
    monthlyChange: 5.2
  },
  {
    id: 'acc-002',
    type: 'savings',
    name: 'Emergency Fund',
    balance: 85432.10,
    currency: 'RON',
    iban: 'RO49AAAA1B31007593840001',
    status: 'active',
    lastActivity: '2025-01-03',
    monthlyChange: 2.8
  },
  {
    id: 'acc-003',
    type: 'business',
    name: 'BancAI Business Account',
    balance: 156789.45,
    currency: 'EUR',
    iban: 'RO49AAAA1B31007593840002',
    status: 'active',
    lastActivity: '2025-01-04',
    monthlyChange: -1.2
  },
  {
    id: 'acc-004',
    type: 'escrow',
    name: 'Investment Escrow',
    balance: 45000.00,
    currency: 'RON',
    iban: 'RO49AAAA1B31007593840003',
    status: 'active',
    lastActivity: '2025-01-01',
    monthlyChange: 12.5
  }
]

export default function AccountsPage() {
  const [showBalances, setShowBalances] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return <Wallet className="w-6 h-6" />
      case 'savings': return <Building2 className="w-6 h-6" />
      case 'business': return <CreditCard className="w-6 h-6" />
      case 'escrow': return <DollarSign className="w-6 h-6" />
      default: return <Wallet className="w-6 h-6" />
    }
  }

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking': return 'from-blue-500 to-blue-600'
      case 'savings': return 'from-emerald-500 to-emerald-600'
      case 'business': return 'from-purple-500 to-purple-600'
      case 'escrow': return 'from-yellow-500 to-yellow-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400'
      case 'blocked': return 'bg-red-500/20 text-red-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const totalBalance = mockAccounts.reduce((sum, acc) => {
    if (acc.currency === 'EUR') return sum + (acc.balance * 4.97)
    return sum + acc.balance
  }, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Accounts</h1>
          <p className="text-blue-200 mt-2">Manage your banking accounts</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {showBalances ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            Add Account
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
          <h3 className="text-blue-200 text-sm font-medium">Total Balance</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {showBalances ? `${totalBalance.toLocaleString('ro-RO')} RON` : '••••••••'}
          </p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+3.2% this month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-blue-200 text-sm font-medium">Active Accounts</h3>
          <p className="text-3xl font-bold text-white mt-2">{mockAccounts.filter(acc => acc.status === 'active').length}</p>
          <p className="text-blue-200 text-sm mt-2">All accounts operational</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-blue-200 text-sm font-medium">Best Performing</h3>
          <p className="text-xl font-bold text-white mt-2">Investment Escrow</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+12.5% growth</span>
          </div>
        </motion.div>
      </div>

      {/* Accounts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {mockAccounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all cursor-pointer ${selectedAccount === account.id ? 'ring-2 ring-blue-500' : ''
              }`}
            onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
          >
            {/* Account Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${getAccountColor(account.type)} rounded-lg flex items-center justify-center text-white`}>
                  {getAccountIcon(account.type)}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{account.name}</h3>
                  <p className="text-blue-200 text-sm capitalize">{account.type} Account</p>
                </div>
              </div>
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <MoreHorizontal className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Balance */}
            <div className="mb-4">
              <p className="text-blue-200 text-sm">Current Balance</p>
              <p className="text-2xl font-bold text-white">
                {showBalances ? `${account.balance.toLocaleString('ro-RO')} ${account.currency}` : '••••••••'}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {account.monthlyChange >= 0 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm">+{account.monthlyChange}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">{account.monthlyChange}%</span>
                  </>
                )}
                <span className="text-blue-200 text-sm ml-1">this month</span>
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-200 text-sm">IBAN</span>
                <span className="text-white text-sm font-mono">{account.iban}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200 text-sm">Status</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(account.status)}`}>
                  {account.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200 text-sm">Last Activity</span>
                <span className="text-white text-sm">{account.lastActivity}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm">Transfer</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                <span className="text-sm">View Details</span>
              </button>
            </div>

            {/* Expanded Details */}
            {selectedAccount === account.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/20"
              >
                <h4 className="text-white font-medium mb-3">Account Features</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-200">Interest Rate</span>
                    <p className="text-white">
                      {account.type === 'savings' ? '2.5% APY' :
                        account.type === 'escrow' ? '4.2% APY' : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-200">Monthly Fee</span>
                    <p className="text-white">
                      {account.type === 'business' ? '25 RON' : 'Free'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-200">Card Linked</span>
                    <p className="text-white">
                      {account.type !== 'escrow' ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-200">Online Banking</span>
                    <p className="text-white">Enabled</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Add New Account CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Ready to open a new account?</h3>
        <p className="text-blue-200 mb-6">Choose from our range of accounts designed for your financial goals</p>
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Open New Account
        </button>
      </motion.div>
    </div>
  )
}
