'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Download,
  Phone,
  AlertTriangle,
  Gift,
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingBag,
  Star,
  ChevronRight,
  Settings,
  MoreHorizontal,
  Search,
  Filter,
  ArrowUpDown,
  X,
  Target,
  BarChart3,
  PieChart,
  Calculator,
  BookOpen,
  Shield,
  Zap,
  Wallet,
  Receipt,
  Award,
  ChevronDown,
  CheckCircle2,
  Info,
  TrendingDown,
  Users,
  Clock,
  FileText,
  CreditCard as CreditCardIcon
} from 'lucide-react';

interface CreditCardData {
  id: string;
  cardNumber: string;
  cardType: 'visa' | 'mastercard' | 'amex' | 'discover';
  cardName: string;
  expiryDate: string;
  creditLimit: number;
  availableCredit: number;
  currentBalance: number;
  minimumPayment: number;
  dueDate: string;
  interestRate: number;
  rewardsBalance: number;
  rewardsType: 'cashback' | 'points' | 'miles';
  status: 'active' | 'inactive' | 'frozen';
  lastPayment: {
    amount: number;
    date: string;
  };
}

const mockCreditCards: CreditCardData[] = [
  {
    id: '1',
    cardNumber: '**** **** **** 4521',
    cardType: 'visa',
    cardName: 'BancAI Rewards Plus',
    expiryDate: '12/28',
    creditLimit: 15000,
    availableCredit: 12450,
    currentBalance: 2550,
    minimumPayment: 85,
    dueDate: '2025-08-15',
    interestRate: 18.99,
    rewardsBalance: 24670,
    rewardsType: 'points',
    status: 'active',
    lastPayment: {
      amount: 125,
      date: '2025-07-15'
    }
  },
  {
    id: '2',
    cardNumber: '**** **** **** 8934',
    cardType: 'mastercard',
    cardName: 'BancAI Cashback Elite',
    expiryDate: '09/27',
    creditLimit: 25000,
    availableCredit: 23200,
    currentBalance: 1800,
    minimumPayment: 60,
    dueDate: '2025-08-20',
    interestRate: 16.99,
    rewardsBalance: 387.50,
    rewardsType: 'cashback',
    status: 'active',
    lastPayment: {
      amount: 450,
      date: '2025-07-20'
    }
  },
  {
    id: '3',
    cardNumber: '**** **** **** 2156',
    cardType: 'amex',
    cardName: 'BancAI Business Platinum',
    expiryDate: '06/26',
    creditLimit: 50000,
    availableCredit: 47500,
    currentBalance: 2500,
    minimumPayment: 125,
    dueDate: '2025-08-10',
    interestRate: 21.99,
    rewardsBalance: 125000,
    rewardsType: 'points',
    status: 'active',
    lastPayment: {
      amount: 800,
      date: '2025-07-10'
    }
  }
];

export default function CreditCardsPage() {
  const [showCardNumbers, setShowCardNumbers] = useState<Record<string, boolean>>({});
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', count: mockCreditCards.length },
    { id: 'cards', label: 'Cards', count: mockCreditCards.length },
    { id: 'payments', label: 'Payments', count: 12 },
    { id: 'rewards', label: 'Rewards', count: 3 },
    { id: 'credit-score', label: 'Credit Score', count: null },
    { id: 'tools', label: 'Tools', count: 6 }
  ];

  // Quick actions configuration
  const quickActions = [
    { id: 'make-payment', label: 'Make Payment', icon: DollarSign, color: 'green', href: '/credit/payment' },
    { id: 'apply-card', label: 'Apply for Card', icon: Plus, color: 'blue', href: '/credit/apply' },
    { id: 'check-score', label: 'Check Credit Score', icon: Target, color: 'purple', href: '/credit/score' },
    { id: 'rewards', label: 'Redeem Rewards', icon: Gift, color: 'orange', href: '/credit/rewards' },
    { id: 'statements', label: 'View Statements', icon: FileText, color: 'gray', href: '/credit/statements' },
    { id: 'analytics', label: 'Spending Analytics', icon: BarChart3, color: 'indigo', href: '/credit/analytics' },
    { id: 'calculator', label: 'Payment Calculator', icon: Calculator, color: 'teal', href: '/credit/calculator' },
    { id: 'education', label: 'Credit Education', icon: BookOpen, color: 'rose', href: '/credit/education' }
  ];

  // Credit health metrics
  const creditHealthMetrics = {
    creditScore: 742,
    creditScoreChange: 12,
    creditUtilization: 17.3,
    onTimePayments: 98.5,
    creditAge: 8.5,
    creditMix: 'Good'
  };

  const toggleCardNumber = (cardId: string) => {
    setShowCardNumbers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatRewards = (amount: number, type: string) => {
    if (type === 'cashback') {
      return formatCurrency(amount);
    } else {
      return `${amount.toLocaleString()} ${type}`;
    }
  };

  const getCardIcon = (type: string) => {
    const cardIcons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳'
    };
    return cardIcons[type as keyof typeof cardIcons] || '💳';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 30) return 'text-green-600 bg-green-100';
    if (utilization < 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient Design */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CreditCardIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Credit Management</h1>
                  <p className="text-white/80 mt-1">Manage cards, payments, rewards, and credit health</p>
                </div>
              </div>
            </div>

            {/* Credit Analytics Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{mockCreditCards.length}</div>
                <div className="text-white/80 text-sm">Active Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{creditHealthMetrics.creditScore}</div>
                <div className="text-white/80 text-sm flex items-center justify-center">
                  Credit Score
                  <TrendingUp className="h-3 w-3 ml-1" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{creditHealthMetrics.creditUtilization}%</div>
                <div className="text-white/80 text-sm">Utilization</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {showBalance ? formatCurrency(mockCreditCards.reduce((sum, card) => sum + card.availableCredit, 0)) : '••••••'}
                </div>
                <div className="text-white/80 text-sm flex items-center justify-center">
                  Available Credit
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
                <Wallet className="h-6 w-6" />
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-white/80 hover:text-white"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Total Credit Limit</p>
              <p className="text-2xl font-bold">
                {showBalance ? formatCurrency(mockCreditCards.reduce((sum, card) => sum + card.creditLimit, 0)) : '••••••'}
              </p>
              <p className="text-white/60 text-sm">{mockCreditCards.length} active cards</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <CheckCircle2 className="h-5 w-5 text-white/80" />
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Available Credit</p>
              <p className="text-2xl font-bold">
                {showBalance ? formatCurrency(mockCreditCards.reduce((sum, card) => sum + card.availableCredit, 0)) : '••••••'}
              </p>
              <p className="text-white/60 text-sm">
                {((mockCreditCards.reduce((sum, card) => sum + card.availableCredit, 0) /
                  mockCreditCards.reduce((sum, card) => sum + card.creditLimit, 0)) * 100).toFixed(1)}% available
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Award className="h-6 w-6" />
              </div>
              <Info className="h-5 w-5 text-white/80" />
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Total Rewards</p>
              <p className="text-2xl font-bold">Mixed</p>
              <p className="text-white/60 text-sm">3 reward programs</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Target className="h-6 w-6" />
              </div>
              <div className="flex items-center text-white/80">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+{creditHealthMetrics.creditScoreChange}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white/80 text-sm">Credit Score</p>
              <p className="text-2xl font-bold">{creditHealthMetrics.creditScore}</p>
              <p className="text-white/60 text-sm">Excellent range</p>
            </div>
          </div>
        </div>

        {/* Advanced Filtering System */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search credit cards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
                <option value="discover">Discover</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="frozen">Frozen</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="balance">Sort by Balance</option>
                <option value="limit">Sort by Credit Limit</option>
                <option value="utilization">Sort by Utilization</option>
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

          {/* Filter Tags */}
          {(searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || sortBy !== 'name') && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-2">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedType !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Type: {selectedType}
                  <button onClick={() => setSelectedType('all')} className="ml-2">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Status: {selectedStatus}
                  <button onClick={() => setSelectedStatus('all')} className="ml-2">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {sortBy !== 'name' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                  Sort: {sortBy}
                  <button onClick={() => setSortBy('name')} className="ml-2">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
        {/* Enhanced Credit Cards List */}
        <div className="space-y-6">
          {mockCreditCards.map((card) => {
            const utilization = ((card.currentBalance / card.creditLimit) * 100);
            const utilizationColor = getUtilizationColor(utilization);

            return (
              <div key={card.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Enhanced Card Header with Gradient */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl text-white text-2xl shadow-lg">
                        {getCardIcon(card.cardType)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{card.cardName}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-gray-600 font-mono">
                            {showCardNumbers[card.id] ? card.cardNumber.replace(/\*/g, '4') : card.cardNumber}
                          </span>
                          <button
                            onClick={() => toggleCardNumber(card.id)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                          >
                            {showCardNumbers[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">Expires {card.expiryDate}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${card.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : card.status === 'frozen'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {card.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">APR: {card.interestRate}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Settings className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Card Content with Gradient Cards */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Balance & Progress Card */}
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Current Balance</h4>
                            <Receipt className="h-4 w-4 text-red-600" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(card.currentBalance)}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Credit Utilization</span>
                              <span className="font-medium">{utilization.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${utilization < 30 ? 'bg-green-500' :
                                    utilization < 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              {utilization < 30 ? 'Excellent utilization' :
                                utilization < 70 ? 'Good utilization' : 'High utilization'}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Available Credit</h4>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-2xl font-bold text-green-600 mb-2">{formatCurrency(card.availableCredit)}</p>
                          <p className="text-sm text-gray-600">
                            of {formatCurrency(card.creditLimit)} limit
                          </p>
                          <div className="mt-2 flex items-center text-xs text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {((card.availableCredit / card.creditLimit) * 100).toFixed(1)}% available
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Next Payment</h4>
                            <Calendar className="h-4 w-4 text-blue-600" />
                          </div>
                          <p className="text-2xl font-bold text-blue-600 mb-1">{formatCurrency(card.minimumPayment)}</p>
                          <p className="text-sm text-gray-600">Due {new Date(card.dueDate).toLocaleDateString()}</p>
                          <div className="mt-2 flex items-center text-xs text-blue-700">
                            <Clock className="h-3 w-3 mr-1" />
                            {Math.ceil((new Date(card.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Rewards Balance</h4>
                            <Award className="h-4 w-4 text-purple-600" />
                          </div>
                          <p className="text-2xl font-bold text-purple-600 mb-1">
                            {formatRewards(card.rewardsBalance, card.rewardsType)}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">{card.rewardsType} program</p>
                          <div className="mt-2 flex items-center text-xs text-purple-700">
                            <Star className="h-3 w-3 mr-1" />
                            Redeem anytime
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Quick Actions Sidebar */}
                    <div className="lg:col-span-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-blue-600" />
                        Quick Actions
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                          href={`/credit/payment?card=${card.id}`}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                              <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Make Payment</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
                        </Link>

                        <Link
                          href={`/credit/transactions?card=${card.id}`}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                              <ShoppingBag className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Transactions</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                        </Link>

                        <Link
                          href={`/credit/rewards?card=${card.id}`}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                              <Star className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Redeem Rewards</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                        </Link>

                        <Link
                          href={`/credit/statements?card=${card.id}`}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                              <Download className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Statements</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                        </Link>

                        <button className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:border-yellow-300 hover:shadow-sm transition-all group">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                              <Lock className="h-4 w-4 text-yellow-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Freeze Card</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-yellow-600" />
                        </button>

                        <Link
                          href={`/credit/analytics?card=${card.id}`}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg hover:border-teal-300 hover:shadow-sm transition-all group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                              <BarChart3 className="h-4 w-4 text-teal-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Analytics</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-teal-600" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Last Payment Info */}
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-600">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                        Last payment: {formatCurrency(card.lastPayment.amount)} on {new Date(card.lastPayment.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Info className="h-4 w-4 mr-2 text-blue-600" />
                        APR: {card.interestRate}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${card.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {card.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Footer with Gradient Action Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Calculator className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-white/80" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Credit Calculator</h3>
          <p className="text-white/80 text-sm mb-4">Calculate payments, interest, and payoff timelines</p>
          <Link
            href="/credit/calculator"
            className="inline-flex items-center text-white hover:text-white/80 text-sm font-medium"
          >
            Calculate Now
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Target className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-white/80" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Credit Score Center</h3>
          <p className="text-white/80 text-sm mb-4">Monitor your credit score and get improvement tips</p>
          <Link
            href="/credit/score"
            className="inline-flex items-center text-white hover:text-white/80 text-sm font-medium"
          >
            Check Score
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <BookOpen className="h-6 w-6" />
            </div>
            <ChevronRight className="h-5 w-5 text-white/80" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Credit Education</h3>
          <p className="text-white/80 text-sm mb-4">Learn how to improve your credit and manage debt</p>
          <Link
            href="/credit/education"
            className="inline-flex items-center text-white hover:text-white/80 text-sm font-medium"
          >
            Learn More
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
    </div >
  );
}
