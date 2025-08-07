'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Home,
  Car,
  GraduationCap,
  Building2,
  CreditCard,
  Plus,
  Calendar,
  DollarSign,
  Percent,
  Download,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Phone,
  ChevronRight,
  Info,
  TrendingDown,
  Target,
  Search,
  Filter,
  BarChart3,
  ArrowUpDown,
  Settings,
  RefreshCw,
  Users,
  Briefcase,
  Banknote,
  PiggyBank,
  Shield,
  Star,
  HandCoins,
  CalendarDays,
  Landmark,
  MapPin,
  Award,
  LineChart,
  Activity,
  Zap,
  Bell,
  MessageSquare,
  Eye,
  Edit,
  Copy,
  ExternalLink
} from 'lucide-react';

interface LoanData {
  id: string;
  type: 'mortgage' | 'auto' | 'personal' | 'student' | 'business' | 'home_equity';
  lenderName: string;
  accountNumber: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  nextPaymentDate: string;
  paymentsDue: number;
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  status: 'current' | 'past_due' | 'paid_off' | 'in_default';
  autopay: boolean;
  remainingTermMonths: number;
  payoffDate: string;
  property?: {
    address: string;
    value: number;
    type: 'primary' | 'rental' | 'vacation';
  };
  vehicle?: {
    year: number;
    make: string;
    model: string;
    vin: string;
  };
}

const mockLoans: LoanData[] = [
  {
    id: '1',
    type: 'mortgage',
    lenderName: 'BancAI Mortgage',
    accountNumber: '****2847',
    originalAmount: 450000,
    currentBalance: 387450,
    interestRate: 3.25,
    termYears: 30,
    monthlyPayment: 1958.45,
    nextPaymentDate: '2025-09-01',
    paymentsDue: 0,
    totalPaid: 125840,
    principalPaid: 62550,
    interestPaid: 63290,
    status: 'current',
    autopay: true,
    remainingTermMonths: 312,
    payoffDate: '2051-08-01',
    property: {
      address: '123 Oak Street, Austin, TX 78701',
      value: 520000,
      type: 'primary'
    }
  },
  {
    id: '2',
    type: 'auto',
    lenderName: 'BancAI Auto Finance',
    accountNumber: '****5692',
    originalAmount: 35000,
    currentBalance: 22150,
    interestRate: 4.99,
    termYears: 5,
    monthlyPayment: 659.78,
    nextPaymentDate: '2025-09-15',
    paymentsDue: 0,
    totalPaid: 19830,
    principalPaid: 12850,
    interestPaid: 6980,
    status: 'current',
    autopay: true,
    remainingTermMonths: 34,
    payoffDate: '2028-06-15',
    vehicle: {
      year: 2023,
      make: 'Tesla',
      model: 'Model 3',
      vin: '5YJ3E1EA*********'
    }
  },
  {
    id: '3',
    type: 'personal',
    lenderName: 'BancAI Personal Lending',
    accountNumber: '****1234',
    originalAmount: 15000,
    currentBalance: 8750,
    interestRate: 8.99,
    termYears: 3,
    monthlyPayment: 478.92,
    nextPaymentDate: '2025-09-10',
    paymentsDue: 0,
    totalPaid: 7250,
    principalPaid: 6250,
    interestPaid: 1000,
    status: 'current',
    autopay: false,
    remainingTermMonths: 19,
    payoffDate: '2027-04-10'
  },
  {
    id: '4',
    type: 'student',
    lenderName: 'Federal Student Aid',
    accountNumber: '****7890',
    originalAmount: 45000,
    currentBalance: 28500,
    interestRate: 5.50,
    termYears: 10,
    monthlyPayment: 485.32,
    nextPaymentDate: '2025-09-01',
    paymentsDue: 1,
    totalPaid: 18650,
    principalPaid: 16500,
    interestPaid: 2150,
    status: 'past_due',
    autopay: false,
    remainingTermMonths: 60,
    payoffDate: '2030-08-01'
  }
];

export default function LoansPage() {
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'applications' | 'calculator' | 'analytics'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'balance' | 'payment' | 'rate' | 'term'>('balance');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getLoanIcon = (type: string) => {
    switch (type) {
      case 'mortgage': return Home;
      case 'auto': return Car;
      case 'student': return GraduationCap;
      case 'business': return Building2;
      case 'personal': return CreditCard;
      case 'home_equity': return Home;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'past_due': return 'bg-red-100 text-red-800';
      case 'paid_off': return 'bg-blue-100 text-blue-800';
      case 'in_default': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current': return CheckCircle;
      case 'past_due': return AlertTriangle;
      case 'paid_off': return CheckCircle;
      case 'in_default': return AlertTriangle;
      default: return Clock;
    }
  };

  // Enhanced analytics calculations
  const totalCurrentBalance = mockLoans.reduce((sum, loan) => sum + loan.currentBalance, 0);
  const totalOriginalAmount = mockLoans.reduce((sum, loan) => sum + loan.originalAmount, 0);
  const totalMonthlyPayments = mockLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  const totalInterestPaid = mockLoans.reduce((sum, loan) => sum + loan.interestPaid, 0);
  const pastDueLoans = mockLoans.filter(loan => loan.status === 'past_due').length;
  const averageInterestRate = mockLoans.reduce((sum, loan) => sum + loan.interestRate, 0) / mockLoans.length;
  const totalPaidToDate = mockLoans.reduce((sum, loan) => sum + loan.totalPaid, 0);
  const payoffProgress = ((totalOriginalAmount - totalCurrentBalance) / totalOriginalAmount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Loans & Credit
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Manage your loans, track payments, optimize payoff strategies, and explore refinancing opportunities
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCalculator(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Calculator className="h-4 w-4 text-blue-600" />
                <span>Loan Calculator</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-sm">
                <Plus className="h-4 w-4" />
                <span>Apply for Loan</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <RefreshCw className="h-4 w-4 text-purple-600" />
                <span>Refinance Options</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'all', label: 'All Loans', icon: FileText, count: mockLoans.length },
                { id: 'active', label: 'Active Loans', icon: CheckCircle, count: mockLoans.filter(l => l.status === 'current').length },
                { id: 'applications', label: 'Applications', icon: Clock, count: 2 },
                { id: 'calculator', label: 'Calculator', icon: Calculator },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                  >
                    <Icon className={`${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      } -ml-0.5 mr-2 h-5 w-5`} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`${activeTab === tab.id
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-900'
                        } ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCurrentBalance)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {payoffProgress.toFixed(1)}% paid off
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${payoffProgress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Payments</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalMonthlyPayments)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((totalMonthlyPayments / (totalCurrentBalance / 100)) * 12).toFixed(1)}% annual rate
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interest Paid</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalInterestPaid)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg rate: {averageInterestRate.toFixed(2)}%
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                  <Percent className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Loan Health</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {pastDueLoans === 0 ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-lg font-bold text-green-600">Excellent</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span className="text-lg font-bold text-red-600">{pastDueLoans} Past Due</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {mockLoans.length} active loans
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { icon: Plus, label: 'Apply', color: 'blue', action: () => { } },
              { icon: Calculator, label: 'Calculate', color: 'green', action: () => setShowCalculator(true) },
              { icon: RefreshCw, label: 'Refinance', color: 'purple', action: () => { } },
              { icon: Target, label: 'Payoff', color: 'orange', action: () => { } },
              { icon: BarChart3, label: 'Analytics', color: 'indigo', action: () => setActiveTab('analytics') },
              { icon: Download, label: 'Export', color: 'gray', action: () => { } },
              { icon: Bell, label: 'Alerts', color: 'red', action: () => { } },
              { icon: MessageSquare, label: 'Support', color: 'teal', action: () => { } }
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all group`}
                >
                  <Icon className={`h-6 w-6 text-${action.color}-600 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{action.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Filtering and Search */}
        {activeTab === 'all' && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search loans by lender, account, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="mortgage">Mortgage</option>
                  <option value="auto">Auto</option>
                  <option value="personal">Personal</option>
                  <option value="student">Student</option>
                  <option value="business">Business</option>
                  <option value="home_equity">Home Equity</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="current">Current</option>
                  <option value="past_due">Past Due</option>
                  <option value="paid_off">Paid Off</option>
                  <option value="in_default">In Default</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="balance">Sort by Balance</option>
                  <option value="payment">Sort by Payment</option>
                  <option value="rate">Sort by Interest Rate</option>
                  <option value="term">Sort by Term</option>
                </select>

                <button
                  onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span>{viewMode === 'cards' ? 'Table' : 'Cards'}</span>
                </button>

                <button className="px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Advanced</span>
                </button>
              </div>
            </div>

            {/* Filter Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedType !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Type: {selectedType}
                  <button
                    onClick={() => setSelectedType('all')}
                    className="ml-2 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedStatus !== 'all' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Status: {selectedStatus}
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className="ml-2 hover:text-green-600"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:text-purple-600"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
        {/* Enhanced Loans List */}
        {activeTab === 'all' && (
          <div className="space-y-6">
            {mockLoans.map((loan) => {
              const LoanIcon = getLoanIcon(loan.type);
              const StatusIcon = getStatusIcon(loan.status);
              const progressPercent = ((loan.originalAmount - loan.currentBalance) / loan.originalAmount) * 100;

              return (
                <div key={loan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Enhanced Loan Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                          <LoanIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 capitalize">
                            {loan.type.replace('_', ' ')} Loan
                          </h3>
                          <p className="text-gray-600">{loan.lenderName} • {loan.accountNumber}</p>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {loan.status.replace('_', ' ').toUpperCase()}
                            </span>
                            {loan.autopay && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Zap className="h-3 w-3 mr-1" />
                                AUTOPAY
                              </span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Star className="h-3 w-3 mr-1" />
                              {loan.interestRate}% APR
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {loan.status === 'past_due' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium text-red-800">Payment Overdue</span>
                            </div>
                            <p className="text-xs text-red-600 mt-1">{loan.paymentsDue} payment(s) past due</p>
                          </div>
                        )}

                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Settings className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Loan Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Balance & Progress Info */}
                      <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Current Balance Card */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-semibold text-blue-900">Current Balance</h4>
                              <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-blue-900">{formatCurrency(loan.currentBalance)}</p>
                            <p className="text-sm text-blue-700 mt-1">
                              of {formatCurrency(loan.originalAmount)} original
                            </p>

                            {/* Enhanced Progress Bar */}
                            <div className="mt-6">
                              <div className="flex justify-between text-sm text-blue-700 mb-2">
                                <span>Loan Progress</span>
                                <span className="font-semibold">{progressPercent.toFixed(1)}% paid</span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-1000 shadow-sm"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-blue-600 mt-1">
                                <span>{formatCurrency(loan.originalAmount - loan.currentBalance)} paid</span>
                                <span>{formatCurrency(loan.currentBalance)} remaining</span>
                              </div>
                            </div>
                          </div>

                          {/* Next Payment Card */}
                          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-semibold text-orange-900">Next Payment</h4>
                              <Calendar className="h-5 w-5 text-orange-600" />
                            </div>
                            <p className="text-3xl font-bold text-orange-900">{formatCurrency(loan.monthlyPayment)}</p>
                            <p className="text-sm text-orange-700 mt-1">Due {loan.nextPaymentDate}</p>

                            <div className="mt-6 space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-orange-700">Interest Rate</span>
                                <span className="font-semibold text-orange-900">{loan.interestRate}% APR</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-orange-700">Remaining Term</span>
                                <span className="font-semibold text-orange-900">{Math.floor(loan.remainingTermMonths / 12)}y {loan.remainingTermMonths % 12}m</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-orange-700">Payoff Date</span>
                                <span className="font-semibold text-orange-900">{loan.payoffDate}</span>
                              </div>
                            </div>
                          </div>

                          {/* Payment History Card */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-semibold text-green-900">Payment History</h4>
                              <Activity className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-green-700">Total Paid</span>
                                <span className="font-semibold text-green-900">{formatCurrency(loan.totalPaid)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-green-700">Principal Paid</span>
                                <span className="font-semibold text-green-900">{formatCurrency(loan.principalPaid)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-green-700">Interest Paid</span>
                                <span className="font-semibold text-green-900">{formatCurrency(loan.interestPaid)}</span>
                              </div>
                              <div className="pt-3 border-t border-green-200">
                                <div className="flex justify-between text-sm">
                                  <span className="text-green-700">Interest Savings</span>
                                  <span className="font-semibold text-green-900">Calculate ↗</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Loan Analytics Card */}
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-semibold text-purple-900">Loan Analytics</h4>
                              <LineChart className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-purple-700">Monthly P&I</span>
                                <span className="font-semibold text-purple-900">{formatCurrency(loan.monthlyPayment)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-purple-700">Years Remaining</span>
                                <span className="font-semibold text-purple-900">{(loan.remainingTermMonths / 12).toFixed(1)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-purple-700">LTV Ratio</span>
                                <span className="font-semibold text-purple-900">
                                  {loan.property ? ((loan.currentBalance / loan.property.value) * 100).toFixed(1) + '%' : 'N/A'}
                                </span>
                              </div>
                              <div className="pt-3 border-t border-purple-200">
                                <button className="text-xs text-purple-700 hover:text-purple-900 font-medium">
                                  View Full Analytics ↗
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Quick Actions */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                          <Zap className="h-4 w-4 mr-2 text-blue-600" />
                          Quick Actions
                        </h4>
                        <div className="space-y-3">
                          <Link
                            href={`/loans/payment?loan=${loan.id}`}
                            className={`group flex items-center justify-between p-4 border-2 rounded-xl transition-all ${loan.status === 'past_due'
                              ? 'border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${loan.status === 'past_due' ? 'bg-red-100' : 'bg-green-100'}`}>
                                <DollarSign className={`h-5 w-5 ${loan.status === 'past_due' ? 'text-red-600' : 'text-green-600'}`} />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-gray-900">Make Payment</span>
                                <p className="text-xs text-gray-500">Pay {formatCurrency(loan.monthlyPayment)}</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                          </Link>

                          <Link
                            href={`/loans/statements?loan=${loan.id}`}
                            className="group flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Download className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-gray-900">Statements</span>
                                <p className="text-xs text-gray-500">Download or view</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                          </Link>

                          <Link
                            href={`/loans/payoff?loan=${loan.id}`}
                            className="group flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Target className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-gray-900">Payoff Quote</span>
                                <p className="text-xs text-gray-500">Get current quote</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                          </Link>

                          <Link
                            href={`/loans/extra-payments?loan=${loan.id}`}
                            className="group flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingDown className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-gray-900">Extra Payments</span>
                                <p className="text-xs text-gray-500">Reduce term & interest</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                          </Link>

                          <Link
                            href={`/loans/refinance?loan=${loan.id}`}
                            className="group flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-indigo-100 rounded-lg">
                                <RefreshCw className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-gray-900">Refinance Options</span>
                                <p className="text-xs text-gray-500">Check rates & save</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                          </Link>

                          <button className="group flex items-center justify-between w-full p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <Phone className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-gray-900">Contact Lender</span>
                                <p className="text-xs text-gray-500">Get help & support</p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                          </button>

                          {/* Additional Actions */}
                          <div className="pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-2">
                              <button className="flex items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <Copy className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-xs font-medium text-gray-600">Copy #</span>
                              </button>
                              <button className="flex items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <ExternalLink className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-xs font-medium text-gray-600">Open</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Collateral Information */}
                    {(loan.property || loan.vehicle) && (
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-purple-600" />
                          Collateral & Asset Information
                        </h4>

                        {loan.property && (
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 mb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-3">
                                  <div className="p-2 bg-blue-100 rounded-lg">
                                    <Home className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <span className="text-sm font-semibold text-blue-900">Property Details</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${loan.property.type === 'primary' ? 'bg-green-100 text-green-800' :
                                      loan.property.type === 'rental' ? 'bg-orange-100 text-orange-800' :
                                        'bg-purple-100 text-purple-800'
                                    }`}>
                                    {loan.property.type.replace('_', ' ').toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-sm text-blue-800 mb-4">{loan.property.address}</p>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-xs text-blue-700">Estimated Value</span>
                                    <p className="text-lg font-bold text-blue-900">{formatCurrency(loan.property.value)}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-blue-700">Loan-to-Value</span>
                                    <p className="text-lg font-bold text-blue-900">
                                      {((loan.currentBalance / loan.property.value) * 100).toFixed(1)}%
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-blue-700">Equity</span>
                                    <p className="text-lg font-bold text-green-700">
                                      {formatCurrency(loan.property.value - loan.currentBalance)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-blue-700">Appreciation</span>
                                    <p className="text-lg font-bold text-green-700">+12.3%</p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col space-y-2 ml-4">
                                <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                                  <MapPin className="h-4 w-4 text-blue-600" />
                                </button>
                                <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </button>
                                <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                                  <Calculator className="h-4 w-4 text-blue-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {loan.vehicle && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-3">
                                  <div className="p-2 bg-green-100 rounded-lg">
                                    <Car className="h-5 w-5 text-green-600" />
                                  </div>
                                  <span className="text-sm font-semibold text-green-900">Vehicle Details</span>
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                    COLLATERAL
                                  </span>
                                </div>
                                <p className="text-lg font-semibold text-green-800 mb-4">
                                  {loan.vehicle.year} {loan.vehicle.make} {loan.vehicle.model}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-xs text-green-700">VIN Number</span>
                                    <p className="text-sm font-mono text-green-900">{loan.vehicle.vin}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-green-700">Estimated Value</span>
                                    <p className="text-sm font-bold text-green-900">$28,500</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-green-700">Loan Balance</span>
                                    <p className="text-sm font-bold text-green-900">{formatCurrency(loan.currentBalance)}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs text-green-700">Equity</span>
                                    <p className="text-sm font-bold text-green-900">$6,350</p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col space-y-2 ml-4">
                                <button className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                                  <Eye className="h-4 w-4 text-green-600" />
                                </button>
                                <button className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                                  <Calculator className="h-4 w-4 text-green-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enhanced Footer Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Loan Calculator</h3>
            </div>
            <p className="text-blue-700 mb-4 text-sm">
              Calculate payments for new loans or refinancing options with our advanced calculator
            </p>
            <button
              onClick={() => setShowCalculator(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm font-medium"
            >
              Open Calculator
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Landmark className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-green-900">Apply for Loan</h3>
            </div>
            <p className="text-green-700 mb-4 text-sm">
              Get pre-approved for a new loan with competitive rates and flexible terms
            </p>
            <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm font-medium">
              Start Application
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-purple-900">Need Help?</h3>
            </div>
            <p className="text-purple-700 mb-4 text-sm">
              Contact our loan specialists for personalized assistance and expert advice
            </p>
            <div className="flex space-x-3">
              <button className="flex-1 bg-white border border-purple-300 text-purple-700 py-2 px-3 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium">
                Chat Support
              </button>
              <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium">
                Call Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
