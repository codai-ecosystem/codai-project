'use client'

import React from 'react'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import {
  Building2,
  CreditCard,
  PiggyBank,
  Banknote,
  TrendingUp,
  Shield,
  Handshake,
  Calculator,
  FileText,
  Users,
  ChevronRight,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  X,
  Eye,
  EyeOff,
  Target,
  BarChart3,
  PieChart,
  DollarSign,
  Receipt,
  Briefcase,
  TrendingDown,
  Award,
  Info,
  Zap,
  Building,
  CreditCard as CreditCardIcon,
  Wallet,
  Calendar,
  Globe,
  PhoneCall,
  Mail,
  MapPin,
  Truck,
  ShoppingCart,
  Factory,
  Settings
} from 'lucide-react'

interface BusinessAccountData {
  accountNumber: string
  accountName: string
  balance: number
  type: 'checking' | 'savings' | 'money_market' | 'cd'
  lastTransaction: string
  interestRate?: number
  minimumBalance?: number
  monthlyFee?: number
}

interface BusinessServiceData {
  id: string
  name: string
  description: string
  icon: any
  status: 'active' | 'pending' | 'available'
  monthlyFee?: number
  features: string[]
}

export default function BusinessBankingPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showBalance, setShowBalance] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedServiceType, setSelectedServiceType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2, count: null },
    { id: 'accounts', label: 'Accounts', icon: PiggyBank, count: businessAccounts.length },
    { id: 'services', label: 'Services', icon: Handshake, count: businessServices.length },
    { id: 'financing', label: 'Financing', icon: Banknote, count: 5 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, count: null },
    { id: 'tools', label: 'Tools', icon: Calculator, count: 8 }
  ]

  // Quick actions configuration
  const quickActions = [
    { id: 'transfer', label: 'Transfer Funds', icon: DollarSign, color: 'green', href: '/business/transfers' },
    { id: 'payroll', label: 'Run Payroll', icon: Users, color: 'blue', href: '/business/payroll' },
    { id: 'invoice', label: 'Create Invoice', icon: Receipt, color: 'purple', href: '/business/invoicing' },
    { id: 'loans', label: 'Apply for Loan', icon: Banknote, color: 'orange', href: '/business/loans' },
    { id: 'merchant', label: 'Merchant Services', icon: CreditCardIcon, color: 'indigo', href: '/business/merchant' },
    { id: 'analytics', label: 'View Analytics', icon: BarChart3, color: 'teal', href: '/business/analytics' },
    { id: 'taxes', label: 'Tax Center', icon: FileText, color: 'rose', href: '/business/taxes' },
    { id: 'support', label: 'Business Support', icon: PhoneCall, color: 'gray', href: '/business/support' }
  ]

  // Business health metrics
  const businessMetrics = {
    totalRevenue: 549287.50,
    monthlyGrowth: 12.5,
    cashFlow: 85623.45,
    employees: 24,
    avgTransactionSize: 1875.50,
    creditScore: 785
  }

  const businessAccounts: BusinessAccountData[] = [
    {
      accountNumber: '****5678',
      accountName: 'Business Checking',
      balance: 125847.32,
      type: 'checking',
      lastTransaction: '2025-01-24',
      monthlyFee: 15
    },
    {
      accountNumber: '****9012',
      accountName: 'Business Savings',
      balance: 485692.15,
      type: 'savings',
      lastTransaction: '2025-01-23',
      interestRate: 2.25,
      minimumBalance: 2500
    },
    {
      accountNumber: '****3456',
      accountName: 'Money Market',
      balance: 275000.00,
      type: 'money_market',
      lastTransaction: '2025-01-22',
      interestRate: 3.15,
      minimumBalance: 25000
    }
  ]

  const businessServices: BusinessServiceData[] = [
    {
      id: 'merchant_services',
      name: 'Merchant Services',
      description: 'Accept credit card payments with competitive rates',
      icon: CreditCard,
      status: 'active',
      monthlyFee: 29.95,
      features: ['2.9% + $0.30 per transaction', '24/7 Support', 'EMV Chip Readers', 'Online Portal']
    },
    {
      id: 'payroll_services',
      name: 'Payroll Services',
      description: 'Automated payroll processing and tax filing',
      icon: Users,
      status: 'active',
      monthlyFee: 49.95,
      features: ['Automated Tax Filing', 'Direct Deposit', 'Employee Self-Service', 'Compliance Management']
    },
    {
      id: 'business_loans',
      name: 'Business Loans',
      description: 'Working capital and equipment financing',
      icon: Banknote,
      status: 'available',
      features: ['$5K - $500K', 'Fast Approval', 'Competitive Rates', 'Equipment Financing']
    },
    {
      id: 'cash_management',
      name: 'Cash Management',
      description: 'Optimize cash flow with sweep accounts',
      icon: TrendingUp,
      status: 'pending',
      features: ['Auto Sweep', 'Zero Balance Accounts', 'Concentration Banking', 'Investment Options']
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient Design */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Business Banking</h1>
                  <p className="text-white/80 mt-1">Comprehensive banking solutions for your business success</p>
                </div>
              </div>
            </div>

            {/* Business Analytics Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatCurrency(businessMetrics.totalRevenue).replace('$', '$').slice(0, -3)}K</div>
                <div className="text-white/80 text-sm">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center">
                  +{businessMetrics.monthlyGrowth}%
                  <TrendingUp className="h-4 w-4 ml-1" />
                </div>
                <div className="text-white/80 text-sm">Monthly Growth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{businessAccounts.length}</div>
                <div className="text-white/80 text-sm">Business Accounts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {showBalance ? `${formatCurrency(businessAccounts.reduce((sum, acc) => sum + acc.balance, 0)).slice(1, -3)}K` : '••••••'}
                </div>
                <div className="text-white/80 text-sm flex items-center justify-center">
                  Total Balance
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="ml-2 text-white/60 hover:text-white"
                  >
                    {showBalance ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Tabbed Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`p-3 rounded-lg bg-${action.color}-100 text-${action.color}-600 group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-900 mt-2 text-center leading-tight">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Comprehensive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <PiggyBank className="h-6 w-6" />
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-white/80 hover:text-white"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Total Deposits</p>
              <p className="text-2xl font-bold">
                {showBalance ? formatCurrency(businessAccounts.reduce((sum, acc) => sum + acc.balance, 0)) : '••••••••••'}
              </p>
              <p className="text-white/60 text-sm">{businessAccounts.length} business accounts</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="flex items-center text-white/80">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+{businessMetrics.monthlyGrowth}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold">
                {showBalance ? formatCurrency(businessMetrics.totalRevenue / 12) : '••••••••'}
              </p>
              <p className="text-white/60 text-sm">Avg. monthly income</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <CheckCircle2 className="h-5 w-5 text-white/80" />
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Active Employees</p>
              <p className="text-2xl font-bold">{businessMetrics.employees}</p>
              <p className="text-white/60 text-sm">Payroll managed</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="h-6 w-6" />
              </div>
              <Info className="h-5 w-5 text-white/80" />
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Cash Flow</p>
              <p className="text-2xl font-bold">
                {showBalance ? formatCurrency(businessMetrics.cashFlow) : '••••••••'}
              </p>
              <p className="text-white/60 text-sm">Monthly net flow</p>
            </div>
          </div>
        </div>
        {/* Advanced Filtering System */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search business services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Services</option>
                  <option value="payment">Payment Services</option>
                  <option value="payroll">Payroll Services</option>
                  <option value="lending">Lending Services</option>
                  <option value="cash_management">Cash Management</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="available">Available</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg border transition-colors ${showFilters
                      ? 'border-blue-300 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Filter className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'accounts' && renderAccounts()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'financing' && renderFinancing()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'tools' && renderTools()}
      </div>
    </div>
  )

  function renderOverview() {
    return (
      <div className="space-y-8">
        {/* Enhanced Business Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <PiggyBank className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {showBalance ? formatCurrency(businessAccounts.reduce((sum, acc) => sum + acc.balance, 0)) : '••••••••••'}
                </div>
                <div className="text-sm text-green-700">Total Deposits</div>
              </div>
            </div>
            <div className="text-xs text-green-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +2.5% this month
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {showBalance ? formatCurrency(businessMetrics.totalRevenue / 12) : '••••••••'}
                </div>
                <div className="text-sm text-blue-700">Monthly Revenue</div>
              </div>
            </div>
            <div className="text-xs text-blue-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{businessMetrics.monthlyGrowth}% growth
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">{businessMetrics.employees}</div>
                <div className="text-sm text-purple-700">Employees</div>
              </div>
            </div>
            <div className="text-xs text-purple-600">
              <CheckCircle2 className="h-3 w-3 inline mr-1" />
              Payroll active
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">+{businessMetrics.monthlyGrowth}%</div>
                <div className="text-sm text-orange-700">Growth Rate</div>
              </div>
            </div>
            <div className="text-xs text-orange-600">
              <Target className="h-3 w-3 inline mr-1" />
              Above target
            </div>
          </div>
        </div>

        {/* Enhanced Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Recent Business Activity
            </h3>
            <Link href="/business/activity" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All Activity
            </Link>
          </div>
          <div className="space-y-4">
            {[
              {
                type: 'deposit',
                amount: 12500.00,
                description: 'ACH Deposit - Customer Payments',
                date: '2025-01-24',
                status: 'completed',
                icon: DollarSign,
                color: 'green'
              },
              {
                type: 'payroll',
                amount: -8450.00,
                description: 'Payroll Processing - 24 Employees',
                date: '2025-01-23',
                status: 'completed',
                icon: Users,
                color: 'blue'
              },
              {
                type: 'transfer',
                amount: -2500.00,
                description: 'Transfer to Business Savings',
                date: '2025-01-23',
                status: 'completed',
                icon: ArrowUpDown,
                color: 'purple'
              },
              {
                type: 'merchant',
                amount: 875.50,
                description: 'Credit Card Processing - 24 Transactions',
                date: '2025-01-22',
                status: 'pending',
                icon: CreditCardIcon,
                color: 'orange'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg bg-${activity.color}-100`}>
                    <activity.icon className={`h-5 w-5 text-${activity.color}-600`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm text-gray-600">{new Date(activity.date).toLocaleDateString()}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${activity.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-lg ${activity.amount > 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                    {activity.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(activity.amount))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.amount > 0 ? 'Credit' : 'Debit'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function renderAccounts() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <PiggyBank className="h-5 w-5 mr-2 text-blue-600" />
            Business Accounts
          </h3>
          <Link
            href="/business/accounts/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Building className="h-4 w-4" />
            <span>Open New Account</span>
          </Link>
        </div>

        <div className="grid gap-6">
          {businessAccounts.map((account, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
                    <PiggyBank className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{account.accountName}</h4>
                    <p className="text-gray-600 font-mono">{account.accountNumber}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      ACTIVE
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    {showBalance ? formatCurrency(account.balance) : '••••••••••'}
                  </p>
                  <p className="text-sm text-gray-600">Available Balance</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {account.interestRate && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                    <p className="text-sm text-green-700 font-medium">Interest Rate</p>
                    <p className="font-bold text-green-600">{account.interestRate}% APY</p>
                  </div>
                )}
                {account.minimumBalance && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-sm text-blue-700 font-medium">Minimum Balance</p>
                    <p className="font-bold text-blue-600">{formatCurrency(account.minimumBalance)}</p>
                  </div>
                )}
                {account.monthlyFee && (
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-100">
                    <p className="text-sm text-orange-700 font-medium">Monthly Fee</p>
                    <p className="font-bold text-orange-600">{formatCurrency(account.monthlyFee)}</p>
                  </div>
                )}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-100">
                  <p className="text-sm text-purple-700 font-medium">Last Transaction</p>
                  <p className="font-bold text-purple-600">{new Date(account.lastTransaction).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Link
                  href={`/business/accounts/${account.accountNumber}/statements`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
                >
                  View Statements
                </Link>
                <Link
                  href={`/business/transfers?from=${account.accountNumber}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                >
                  Transfer Funds
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderServices() {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <Handshake className="h-5 w-5 mr-2 text-blue-600" />
            Business Services
          </h3>
          <Link
            href="/business/services/marketplace"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Globe className="h-4 w-4" />
            <span>Explore Services</span>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {businessServices.map((service) => (
            <div key={service.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className={`p-4 rounded-xl ${service.status === 'active' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' :
                    service.status === 'pending' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
                      'bg-gradient-to-br from-gray-500 to-gray-600 text-white'
                  }`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="font-semibold text-lg text-gray-900">{service.name}</h4>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${service.status === 'active' ? 'bg-green-100 text-green-700' :
                        service.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                      {service.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  {service.monthlyFee && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm font-semibold text-blue-800">
                        {formatCurrency(service.monthlyFee)}/month
                      </p>
                    </div>
                  )}
                  <div className="space-y-2 mb-4">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/business/services/${service.id}`}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-center block ${service.status === 'active'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                          service.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                            'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {service.status === 'active' ? 'Manage Service' :
                        service.status === 'pending' ? 'View Status' : 'Get Started'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderFinancing() {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white inline-block mb-4">
            <Banknote className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Financing</h3>
          <p className="text-gray-600 mb-6">Access working capital, equipment loans, and lines of credit</p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/business/loans/apply"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply for Loan
            </Link>
            <Link
              href="/business/financing/calculator"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Loan Calculator
            </Link>
          </div>
        </div>
      </div>
    )
  }

  function renderAnalytics() {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white inline-block mb-4">
            <BarChart3 className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Analytics</h3>
          <p className="text-gray-600 mb-6">Advanced analytics and reporting for your business performance</p>
          <Link
            href="/business/analytics/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            View Analytics Dashboard
          </Link>
        </div>
      </div>
    )
  }

  function renderTools() {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white inline-block mb-4">
            <Calculator className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Tools</h3>
          <p className="text-gray-600 mb-6">Financial calculators and planning tools for your business</p>
          <Link
            href="/business/tools/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Access Business Tools
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      {renderEnhancedHeader()}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Advanced Tabbed Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap flex items-center space-x-2 transition-all ${activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
                {tab.count && (
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'accounts' && renderAccounts()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'financing' && renderFinancing()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'tools' && renderTools()}

        {/* Modern Footer with Gradient Action Cards */}
        <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Grow Your Business</h2>
            <p className="text-gray-600">Explore comprehensive business banking solutions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/business/financing/loans"
              className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Briefcase className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Business Loans</h3>
              <p className="text-blue-100 text-sm">Access funding to grow your business with competitive rates</p>
            </Link>

            <Link
              href="/business/analytics/dashboard"
              className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Business Analytics</h3>
              <p className="text-purple-100 text-sm">Track performance and make data-driven decisions</p>
            </Link>

            <Link
              href="/business/support"
              className="group relative bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Headphones className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Business Support</h3>
              <p className="text-green-100 text-sm">Get expert guidance from our business banking specialists</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

