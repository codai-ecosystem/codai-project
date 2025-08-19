'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Send,
  Plus,
  Search,
  Clock,
  Globe,
  User,
  Smartphone,
  Settings,
  Home,
  Wallet,
  Activity,
  TrendingUp,
  Menu,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Star,
  Shield,
  CreditCard,
  Building,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  QrCode,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

// TypeScript interfaces for transfer management
interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  bankName?: string
  accountNumber?: string
  routingNumber?: string
  type: 'internal' | 'external' | 'international'
  profileImage?: string
  isFavorite: boolean
  lastTransfer?: string
  totalTransferred?: number
  isVerified: boolean
  nickname?: string
}

interface Transfer {
  id: string
  type: 'send' | 'receive' | 'request'
  status: 'completed' | 'pending' | 'failed' | 'scheduled'
  amount: number
  currency: string
  fromAccount: string
  toAccount: string
  recipient: string
  recipientId: string
  description: string
  date: string
  scheduledDate?: string
  fees?: number
  exchangeRate?: number
  originalAmount?: number
  originalCurrency?: string
  confirmationNumber: string
  estimatedArrival?: string
  transferMethod: 'instant' | 'standard' | 'wire' | 'international'
  isRecurring?: boolean
  frequency?: string
}

interface TransferLimits {
  dailyLimit: number
  monthlyLimit: number
  dailyUsed: number
  monthlyUsed: number
  instantLimit: number
  internationalLimit: number
}

interface NewTransfer {
  recipientId: string
  amount: number
  currency: string
  fromAccount: string
  description: string
  transferMethod: 'instant' | 'standard' | 'wire'
  scheduledDate?: string
  isRecurring: boolean
  frequency?: string
}

export default function TransfersPage() {
  const [showAmounts, setShowAmounts] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<'send' | 'request' | 'history'>('send')
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [showNewTransfer, setShowNewTransfer] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [limits, setLimits] = useState<TransferLimits>({
    dailyLimit: 5000,
    monthlyLimit: 25000,
    dailyUsed: 750,
    monthlyUsed: 3200,
    instantLimit: 1000,
    internationalLimit: 10000
  })

  const [newTransfer, setNewTransfer] = useState<NewTransfer>({
    recipientId: '',
    amount: 0,
    currency: 'USD',
    fromAccount: '1',
    description: '',
    transferMethod: 'standard',
    isRecurring: false
  })

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@email.com',
      phone: '+1 (555) 123-4567',
      type: 'internal',
      isFavorite: true,
      lastTransfer: '2 days ago',
      totalTransferred: 2500.00,
      isVerified: true,
      nickname: 'Emma'
    },
    {
      id: '2',
      name: 'Sofia Chen',
      email: 'sofia.chen@email.com',
      bankName: 'Chase Bank',
      accountNumber: '****5678',
      routingNumber: '021000021',
      type: 'external',
      isFavorite: true,
      lastTransfer: '1 week ago',
      totalTransferred: 1200.00,
      isVerified: true
    },
    {
      id: '3',
      name: 'Ana Popescu',
      email: 'ana.popescu@email.com',
      phone: '+40 123 456 789',
      bankName: 'BCR Romania',
      type: 'international',
      isFavorite: false,
      lastTransfer: '2 weeks ago',
      totalTransferred: 800.00,
      isVerified: true
    },
    {
      id: '4',
      name: 'Maria Ionescu',
      phone: '+1 (555) 987-6543',
      type: 'internal',
      isFavorite: false,
      isVerified: false,
      nickname: 'Maria'
    }
  ])

  const [recentTransfers, setRecentTransfers] = useState<Transfer[]>([
    {
      id: '1',
      type: 'send',
      status: 'completed',
      amount: 250.00,
      currency: 'USD',
      fromAccount: 'Primary Checking',
      toAccount: 'Emma Rodriguez',
      recipient: 'Emma Rodriguez',
      recipientId: '1',
      description: 'Dinner split',
      date: '2025-08-09',
      confirmationNumber: 'TXF123456789',
      transferMethod: 'instant',
      estimatedArrival: 'Instant'
    },
    {
      id: '2',
      type: 'receive',
      status: 'completed',
      amount: 500.00,
      currency: 'USD',
      fromAccount: 'Sofia Chen',
      toAccount: 'Primary Checking',
      recipient: 'Sofia Chen',
      recipientId: '2',
      description: 'Rent payment',
      date: '2025-08-08',
      confirmationNumber: 'TXF987654321',
      transferMethod: 'standard',
      estimatedArrival: '1-2 business days'
    },
    {
      id: '3',
      type: 'send',
      status: 'pending',
      amount: 150.00,
      currency: 'USD',
      fromAccount: 'Primary Checking',
      toAccount: 'Ana Popescu',
      recipient: 'Ana Popescu',
      recipientId: '3',
      description: 'Gift money',
      date: '2025-08-09',
      scheduledDate: '2025-08-10',
      confirmationNumber: 'TXF456789123',
      transferMethod: 'wire',
      estimatedArrival: '3-5 business days',
      fees: 15.00,
      exchangeRate: 4.65,
      originalAmount: 697.50,
      originalCurrency: 'RON'
    },
    {
      id: '4',
      type: 'send',
      status: 'scheduled',
      amount: 1000.00,
      currency: 'USD',
      fromAccount: 'High-Yield Savings',
      toAccount: 'Primary Checking',
      recipient: 'Internal Transfer',
      recipientId: 'internal',
      description: 'Monthly savings transfer',
      date: '2025-08-15',
      scheduledDate: '2025-08-15',
      confirmationNumber: 'TXF789123456',
      transferMethod: 'standard',
      isRecurring: true,
      frequency: 'Monthly'
    }
  ])

  const accounts = [
    { id: '1', name: 'Primary Checking', balance: 6901.65 },
    { id: '2', name: 'High-Yield Savings', balance: 8945.67 },
    { id: '3', name: 'Rewards Credit Card', balance: -1247.89 }
  ]

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLimits(prev => ({
        ...prev,
        dailyUsed: prev.dailyUsed + (Math.random() * 10)
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'internal': return <User className="w-5 h-5 text-green-600" />
      case 'external': return <Building className="w-5 h-5 text-blue-600" />
      case 'international': return <Globe className="w-5 h-5 text-purple-600" />
      default: return <User className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'scheduled': return <Calendar className="w-4 h-4 text-blue-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const handleSendTransfer = () => {
    if (!newTransfer.recipientId || !newTransfer.amount) return

    const transfer: Transfer = {
      id: Date.now().toString(),
      type: 'send',
      status: newTransfer.transferMethod === 'instant' ? 'completed' : 'pending',
      amount: newTransfer.amount,
      currency: newTransfer.currency,
      fromAccount: accounts.find(a => a.id === newTransfer.fromAccount)?.name || '',
      toAccount: contacts.find(c => c.id === newTransfer.recipientId)?.name || '',
      recipient: contacts.find(c => c.id === newTransfer.recipientId)?.name || '',
      recipientId: newTransfer.recipientId,
      description: newTransfer.description,
      date: new Date().toISOString().split('T')[0],
      scheduledDate: newTransfer.scheduledDate,
      confirmationNumber: `TXF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      transferMethod: newTransfer.transferMethod,
      estimatedArrival: newTransfer.transferMethod === 'instant' ? 'Instant' : '1-2 business days',
      isRecurring: newTransfer.isRecurring,
      frequency: newTransfer.frequency
    }

    setRecentTransfers(prev => [transfer, ...prev])
    setNewTransfer({
      recipientId: '',
      amount: 0,
      currency: 'USD',
      fromAccount: '1',
      description: '',
      transferMethod: 'standard',
      isRecurring: false
    })
    setShowNewTransfer(false)
    setActiveTab('history')
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
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Transfers</h1>
              <p className="text-green-100 text-sm">Send & receive money</p>
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
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transfer Limits */}
        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-green-100">Daily Limit</span>
            <span className="text-sm font-medium">
              {showAmounts ? formatCurrency(limits.dailyUsed) : '••••••'} / {showAmounts ? formatCurrency(limits.dailyLimit) : '••••••'}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${(limits.dailyUsed / limits.dailyLimit) * 100}%` }}
            ></div>
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
              <Link href="/transactions" className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl text-purple-700 hover:bg-purple-100 transition-colors">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Transactions</span>
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
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl mb-6"
        >
          <div className="flex space-x-1">
            {[
              { id: 'send', label: 'Send Money', icon: <ArrowUpRight className="w-4 h-4" /> },
              { id: 'request', label: 'Request', icon: <ArrowDownLeft className="w-4 h-4" /> },
              { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <button
            onClick={() => {
              setActiveTab('send')
              setShowNewTransfer(true)
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-lg flex flex-col items-center"
          >
            <Send className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Quick Send</span>
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl shadow-lg flex flex-col items-center">
            <QrCode className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">Scan QR</span>
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg flex flex-col items-center">
            <Globe className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">International</span>
          </button>
        </motion.div>

        {/* Content based on active tab */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'send' && (
            <div className="space-y-6">
              {/* New Transfer Form */}
              {showNewTransfer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Send Money</h3>
                    <button
                      onClick={() => setShowNewTransfer(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                      <select
                        value={newTransfer.recipientId}
                        onChange={(e) => setNewTransfer(prev => ({ ...prev, recipientId: e.target.value }))}
                        className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <option value="">Select recipient</option>
                        {contacts.map(contact => (
                          <option key={contact.id} value={contact.id}>{contact.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                      <input
                        type="number"
                        value={newTransfer.amount || ''}
                        onChange={(e) => setNewTransfer(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                        className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">From Account</label>
                      <select
                        value={newTransfer.fromAccount}
                        onChange={(e) => setNewTransfer(prev => ({ ...prev, fromAccount: e.target.value }))}
                        className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.name} ({showAmounts ? formatCurrency(account.balance) : '••••••'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={newTransfer.description}
                        onChange={(e) => setNewTransfer(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="What's this for?"
                        className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Speed</label>
                      <div className="space-y-2">
                        {[
                          { value: 'instant', label: 'Instant', time: 'Within minutes', fee: '$2.99' },
                          { value: 'standard', label: 'Standard', time: '1-2 business days', fee: 'Free' },
                          { value: 'wire', label: 'Wire Transfer', time: 'Same day', fee: '$15.00' }
                        ].map(option => (
                          <label key={option.value} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                            <input
                              type="radio"
                              name="transferMethod"
                              value={option.value}
                              checked={newTransfer.transferMethod === option.value}
                              onChange={(e) => setNewTransfer(prev => ({ ...prev, transferMethod: e.target.value as any }))}
                              className="mr-3"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-gray-600">{option.time} • {option.fee}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSendTransfer}
                      disabled={!newTransfer.recipientId || !newTransfer.amount}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send {showAmounts && newTransfer.amount > 0 ? formatCurrency(newTransfer.amount) : 'Money'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Frequent Contacts */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Frequent Contacts</h3>
                  <button className="flex items-center space-x-2 text-green-600">
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
                  />
                </div>

                <div className="space-y-3">
                  {filteredContacts.map(contact => (
                    <motion.div
                      key={contact.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                            {getContactIcon(contact.type)}
                          </div>
                          {contact.isFavorite && (
                            <Star className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          {contact.isVerified && (
                            <Shield className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 fill-current" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-600 flex items-center space-x-2">
                            <span>{contact.type}</span>
                            {contact.lastTransfer && (
                              <>
                                <span>•</span>
                                <span>Last: {contact.lastTransfer}</span>
                              </>
                            )}
                          </div>
                          {contact.totalTransferred && (
                            <div className="text-xs text-green-600">
                              Total: {showAmounts ? formatCurrency(contact.totalTransferred) : '••••••'}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setNewTransfer(prev => ({ ...prev, recipientId: contact.id }))
                          setShowNewTransfer(true)
                        }}
                        className="bg-green-100 text-green-600 p-2 rounded-lg"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'request' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl text-center">
              <ArrowDownLeft className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Request Money</h3>
              <p className="text-gray-600 mb-4">Send payment requests to friends and family</p>
              <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-medium">
                Create Request
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Transfer History</h3>
                <button className="text-green-600 text-sm font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {recentTransfers.map(transfer => (
                  <motion.div
                    key={transfer.id}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        {getStatusIcon(transfer.status)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>{transfer.type === 'send' ? 'To' : 'From'} {transfer.recipient}</span>
                          {transfer.isRecurring && (
                            <RefreshCw className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{transfer.description}</div>
                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                          <span>{transfer.date}</span>
                          <span>•</span>
                          <span>{transfer.transferMethod}</span>
                          {transfer.estimatedArrival && (
                            <>
                              <span>•</span>
                              <span>{transfer.estimatedArrival}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        transfer.type === 'send' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transfer.type === 'send' ? '-' : '+'}
                        {showAmounts ? formatCurrency(transfer.amount) : '••••••'}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">{transfer.status}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
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
