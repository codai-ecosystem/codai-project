'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Calendar,
  DollarSign,
  Repeat,
  History,
  Plus,
  Settings,
  Download,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  Target,
  Users,
  MapPin,
  Star,
  Shield,
  Bookmark,
  Share2,
  ExternalLink
} from 'lucide-react'

// Import modular components
import { DonationOverviewCards } from './components/DonationOverviewCards'
import { RecentDonations } from './components/RecentDonations'
import { RecurringDonations } from './components/RecurringDonations'
import { PaymentMethods } from './components/PaymentMethods'
import { DonationHistory } from './components/DonationHistory'
import { QuickDonateModal } from './components/QuickDonateModal'

// TypeScript interfaces
interface Donation {
  id: string
  amount: number
  currency: string
  campaignId: string
  campaignTitle: string
  organization: string
  date: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  paymentMethod: string
  type: 'one-time' | 'recurring'
  frequency?: 'monthly' | 'quarterly' | 'yearly'
  nextPayment?: string
  receiptUrl: string
  taxDeductible: boolean
  anonymous: boolean
  message?: string
  category: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank' | 'paypal' | 'crypto'
  name: string
  last4?: string
  expiry?: string
  isDefault: boolean
  verified: boolean
}

export default function DonationManagementPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showQuickDonate, setShowQuickDonate] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateRange, setDateRange] = useState('30')

  // Mock data
  const [donations] = useState<Donation[]>([
    {
      id: 'don1',
      amount: 250,
      currency: 'RON',
      campaignId: 'camp1',
      campaignTitle: 'Emergency Relief for Flood Victims in Teleorman',
      organization: 'Red Cross Romania',
      date: '2025-08-06',
      status: 'completed',
      paymentMethod: 'Visa ****4532',
      type: 'one-time',
      receiptUrl: '/receipts/don1.pdf',
      taxDeductible: true,
      anonymous: false,
      message: 'Hope this helps the affected families',
      category: 'emergency'
    },
    {
      id: 'don2',
      amount: 100,
      currency: 'RON',
      campaignId: 'camp2',
      campaignTitle: 'Build Schools for Rural Children in Maramureș',
      organization: 'Children\'s Future Foundation',
      date: '2025-08-01',
      status: 'completed',
      paymentMethod: 'PayPal',
      type: 'recurring',
      frequency: 'monthly',
      nextPayment: '2025-09-01',
      receiptUrl: '/receipts/don2.pdf',
      taxDeductible: true,
      anonymous: false,
      category: 'education'
    },
    {
      id: 'don3',
      amount: 500,
      currency: 'RON',
      campaignId: 'camp3',
      campaignTitle: 'Medical Equipment for Rural Hospital',
      organization: 'Healthcare Heroes',
      date: '2025-07-28',
      status: 'completed',
      paymentMethod: 'Mastercard ****8901',
      type: 'one-time',
      receiptUrl: '/receipts/don3.pdf',
      taxDeductible: true,
      anonymous: true,
      category: 'healthcare'
    }
  ])

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm1',
      type: 'card',
      name: 'Visa ending in 4532',
      last4: '4532',
      expiry: '12/26',
      isDefault: true,
      verified: true
    },
    {
      id: 'pm2',
      type: 'card',
      name: 'Mastercard ending in 8901',
      last4: '8901',
      expiry: '08/27',
      isDefault: false,
      verified: true
    },
    {
      id: 'pm3',
      type: 'paypal',
      name: 'PayPal Account',
      isDefault: false,
      verified: true
    }
  ])

  // Tab navigation
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'history', name: 'History', icon: History },
    { id: 'recurring', name: 'Recurring', icon: Repeat },
    { id: 'payments', name: 'Payment Methods', icon: CreditCard },
    { id: 'receipts', name: 'Receipts', icon: Download }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 shadow-sm sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                    Donation Management
                  </h1>
                  <p className="text-sm text-gray-500">Track and manage your donations</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQuickDonate(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                <span className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Quick Donate</span>
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-green-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <DonationOverviewCards donations={donations} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentDonations donations={donations.slice(0, 5)} />
                <RecurringDonations donations={donations.filter(d => d.type === 'recurring')} />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <DonationHistory
              donations={donations}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringDonations
              donations={donations.filter(d => d.type === 'recurring')}
              expanded={true}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentMethods paymentMethods={paymentMethods} />
          )}

          {activeTab === 'receipts' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-green-100">
              <div className="text-center">
                <Download className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Receipt Management</h3>
                <p className="text-gray-600 mb-6">Download and manage your donation receipts and tax documents.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Download All Receipts
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Donate Modal */}
      {showQuickDonate && (
        <QuickDonateModal onClose={() => setShowQuickDonate(false)} />
      )}
    </div>
  )
}
