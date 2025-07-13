'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Lock,
  Unlock,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
  Zap
} from 'lucide-react'

interface Card {
  id: string
  type: 'debit' | 'credit' | 'prepaid' | 'business'
  name: string
  last4: string
  expiryDate: string
  cardHolder: string
  status: 'active' | 'blocked' | 'expired' | 'pending'
  balance?: number
  creditLimit?: number
  currency: string
  issuer: 'visa' | 'mastercard' | 'bancai'
  features: string[]
  monthlySpent: number
  linkedAccount: string
}

const mockCards: Card[] = [
  {
    id: 'card-001',
    type: 'debit',
    name: 'BancAI Platinum Debit',
    last4: '4567',
    expiryDate: '12/27',
    cardHolder: 'ALEXANDRU POPESCU',
    status: 'active',
    balance: 24567.89,
    currency: 'RON',
    issuer: 'visa',
    features: ['Contactless', 'Online Shopping', 'ATM Worldwide', 'Mobile Pay'],
    monthlySpent: 3456.78,
    linkedAccount: 'Main Checking Account'
  },
  {
    id: 'card-002',
    type: 'credit',
    name: 'BancAI Gold Credit',
    last4: '8901',
    expiryDate: '08/26',
    cardHolder: 'ALEXANDRU POPESCU',
    status: 'active',
    creditLimit: 50000.00,
    currency: 'RON',
    issuer: 'mastercard',
    features: ['Cashback 2%', 'Travel Insurance', 'Airport Lounge', 'Fraud Protection'],
    monthlySpent: 8934.21,
    linkedAccount: 'Main Checking Account'
  },
  {
    id: 'card-003',
    type: 'business',
    name: 'BancAI Business Premium',
    last4: '2345',
    expiryDate: '03/28',
    cardHolder: 'CODAI PLATFORM SRL',
    status: 'active',
    creditLimit: 150000.00,
    currency: 'EUR',
    issuer: 'bancai',
    features: ['Expense Management', 'Multi-Currency', 'Analytics', 'Team Cards'],
    monthlySpent: 12567.43,
    linkedAccount: 'BancAI Business Account'
  },
  {
    id: 'card-004',
    type: 'prepaid',
    name: 'BancAI Travel Card',
    last4: '6789',
    expiryDate: '06/25',
    cardHolder: 'ALEXANDRU POPESCU',
    status: 'blocked',
    balance: 1500.00,
    currency: 'EUR',
    issuer: 'visa',
    features: ['Multi-Currency', 'No Foreign Fees', 'Travel Insurance', 'Load Anytime'],
    monthlySpent: 456.78,
    linkedAccount: 'Emergency Fund'
  }
]

export default function CardsPage() {
  const [showCardNumbers, setShowCardNumbers] = useState(false)
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const getCardGradient = (type: string, issuer: string) => {
    if (issuer === 'bancai') return 'from-purple-600 via-blue-600 to-emerald-600'

    switch (type) {
      case 'debit': return 'from-blue-600 to-blue-800'
      case 'credit': return 'from-yellow-500 via-yellow-600 to-yellow-700'
      case 'business': return 'from-gray-700 via-gray-800 to-black'
      case 'prepaid': return 'from-emerald-500 to-emerald-700'
      default: return 'from-gray-600 to-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400'
      case 'blocked': return 'bg-red-500/20 text-red-400'
      case 'expired': return 'bg-gray-500/20 text-gray-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getIssuerLogo = (issuer: string) => {
    switch (issuer) {
      case 'visa': return 'VISA'
      case 'mastercard': return 'Mastercard'
      case 'bancai': return 'BancAI'
      default: return issuer.toUpperCase()
    }
  }

  const formatCardNumber = (last4: string) => {
    return showCardNumbers ? `•••• •••• •••• ${last4}` : `•••• ••••`
  }

  const totalSpent = mockCards.reduce((sum, card) => sum + card.monthlySpent, 0)
  const activeCards = mockCards.filter(card => card.status === 'active').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Cards</h1>
          <p className="text-blue-200 mt-2">Manage your payment cards</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCardNumbers(!showCardNumbers)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {showCardNumbers ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
            Request Card
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
          <h3 className="text-blue-200 text-sm font-medium">Active Cards</h3>
          <p className="text-3xl font-bold text-white mt-2">{activeCards}</p>
          <p className="text-blue-200 text-sm mt-2">Out of {mockCards.length} total cards</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-blue-200 text-sm font-medium">Monthly Spending</h3>
          <p className="text-3xl font-bold text-white mt-2">{totalSpent.toLocaleString('ro-RO')} RON</p>
          <div className="flex items-center gap-1 mt-2 text-red-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+15.2% from last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-blue-200 text-sm font-medium">Security Score</h3>
          <p className="text-3xl font-bold text-emerald-400 mt-2">98%</p>
          <div className="flex items-center gap-1 mt-2 text-emerald-400">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Excellent security</span>
          </div>
        </motion.div>
      </div>

      {/* Cards Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {mockCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="space-y-4"
          >
            {/* Card Visual */}
            <div
              className={`relative w-full h-56 bg-gradient-to-br ${getCardGradient(card.type, card.issuer)} rounded-2xl p-6 text-white shadow-2xl cursor-pointer transition-all hover:scale-105`}
              onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm opacity-80">{card.type.charAt(0).toUpperCase() + card.type.slice(1)} Card</p>
                  <p className="text-lg font-semibold">{card.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{getIssuerLogo(card.issuer)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(card.status)}`}>
                    {card.status}
                  </span>
                </div>
              </div>

              {/* Card Number */}
              <div className="mb-6">
                <p className="text-2xl font-mono tracking-wider">
                  {formatCardNumber(card.last4)}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-60">CARD HOLDER</p>
                  <p className="text-sm font-medium">{card.cardHolder}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60">EXPIRES</p>
                  <p className="text-sm font-medium">{card.expiryDate}</p>
                </div>
              </div>

              {/* Card Chip */}
              <div className="absolute top-20 left-6 w-12 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-lg opacity-80"></div>
            </div>

            {/* Card Details */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">Card Details</h3>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <Copy className="w-4 h-4 text-white" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <Settings className="w-4 h-4 text-white" />
                  </button>
                  <button className={`p-2 rounded-lg transition-colors ${card.status === 'active'
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                    }`}>
                    {card.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Balance/Limit Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-blue-200 text-sm">
                    {card.type === 'credit' || card.type === 'business' ? 'Credit Limit' : 'Available Balance'}
                  </p>
                  <p className="text-xl font-bold text-white">
                    {card.creditLimit
                      ? `${card.creditLimit.toLocaleString('ro-RO')} ${card.currency}`
                      : `${card.balance?.toLocaleString('ro-RO')} ${card.currency}`
                    }
                  </p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Monthly Spent</p>
                  <p className="text-xl font-bold text-white">
                    {card.monthlySpent.toLocaleString('ro-RO')} {card.currency}
                  </p>
                </div>
              </div>

              {/* Linked Account */}
              <div className="mb-4">
                <p className="text-blue-200 text-sm">Linked Account</p>
                <p className="text-white font-medium">{card.linkedAccount}</p>
              </div>

              {/* Features */}
              <div className="mb-6">
                <p className="text-blue-200 text-sm mb-2">Card Features</p>
                <div className="flex flex-wrap gap-2">
                  {card.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Statements</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
              </div>

              {/* Expanded Details */}
              {selectedCard === card.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-white/20"
                >
                  <h4 className="text-white font-medium mb-4">Advanced Features</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white">Mobile Payments</p>
                        <p className="text-blue-200">Apple Pay, Google Pay</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-white">International</p>
                        <p className="text-blue-200">Worldwide acceptance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white">Security</p>
                        <p className="text-blue-200">3D Secure, Fraud alerts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-white">Instant</p>
                        <p className="text-blue-200">Real-time notifications</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add New Card CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Need a new card?</h3>
        <p className="text-blue-200 mb-6">Choose from our range of cards designed for your lifestyle</p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Request Credit Card
          </button>
          <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
            Request Debit Card
          </button>
        </div>
      </motion.div>
    </div>
  )
}
