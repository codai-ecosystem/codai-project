'use client'

import React from 'react'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import {
  Calculator,
  TrendingUp,
  Home,
  Car,
  DollarSign,
  PiggyBank,
  CreditCard,
  BarChart3,
  Target,
  Percent,
  Calendar,
  Building,
  Banknote,
  LineChart,
  PieChart,
  ArrowRightLeft,
  Coins,
  Wallet,
  Plus,
  Minus,
  Equal,
  RotateCcw,
  Download,
  Share2,
  BookOpen,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Star,
  Clock,
  Grid3X3,
  Filter,
  Search,
  Heart,
  ArrowRight,
  Bookmark,
  History,
  Settings,
  Zap,
  Users,
  Eye,
  TrendingDown,
  Award,
  Headphones
} from 'lucide-react'

interface FinancialTool {
  id: string
  name: string
  description: string
  category: string
  icon: any
  color: string
  popular: boolean
}

interface CalculationResult {
  monthlyPayment?: number
  totalInterest?: number
  totalAmount?: number
  savings?: number
  timeToGoal?: number
  roi?: number
  futureValue?: number
  breakEven?: number
}

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState('all-tools')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [calculationResults, setCalculationResults] = useState<CalculationResult>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFilterTags, setShowFilterTags] = useState(false)

  // Enhanced tabs configuration
  const tabs = [
    { id: 'all-tools', name: 'All Tools', icon: Grid3X3, count: '25+' },
    { id: 'calculators', name: 'Calculators', icon: Calculator, count: '12' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, count: '8' },
    { id: 'planning', name: 'Planning', icon: Target, count: '5' },
    { id: 'favorites', name: 'Favorites', icon: Heart, count: favorites.length.toString() },
    { id: 'recent', name: 'Recent', icon: Clock, count: '6' }
  ]

  // Enhanced quick actions
  const quickActions = [
    { name: 'Mortgage Calculator', icon: Home, color: 'blue', href: '/tools/mortgage' },
    { name: 'Investment Planner', icon: TrendingUp, color: 'green', href: '/tools/investment' },
    { name: 'Budget Tracker', icon: Wallet, color: 'purple', href: '/tools/budget' },
    { name: 'Loan Comparison', icon: BarChart3, color: 'orange', href: '/tools/loans' },
    { name: 'Savings Goals', icon: Target, color: 'pink', href: '/tools/savings' },
    { name: 'Tax Calculator', icon: Calculator, color: 'indigo', href: '/tools/tax' },
    { name: 'Retirement Planner', icon: PiggyBank, color: 'emerald', href: '/tools/retirement' },
    { name: 'Credit Tools', icon: CreditCard, color: 'red', href: '/tools/credit' }
  ]

  // Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(250000)
  const [loanRate, setLoanRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState(30)

  // Savings Calculator State
  const [initialAmount, setInitialAmount] = useState(10000)
  const [monthlyContribution, setMonthlyContribution] = useState(500)
  const [savingsRate, setSavingsRate] = useState(4.0)
  const [savingsYears, setSavingsYears] = useState(10)

  // Investment Calculator State
  const [investmentAmount, setInvestmentAmount] = useState(50000)
  const [expectedReturn, setExpectedReturn] = useState(7.0)
  const [investmentYears, setInvestmentYears] = useState(15)

  // Enhanced header component
  function renderEnhancedHeader() {
    return (
      <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Financial Tools & Calculators</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Comprehensive suite of banking and financial planning tools to help you make informed decisions
            </p>
          </div>

          {/* Enhanced Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Calculator className="h-6 w-6 text-blue-200" />
                </div>
                <Eye className="h-5 w-5 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">25+</h3>
              <p className="text-green-100 text-sm">Financial Tools</p>
              <div className="mt-2 flex items-center text-xs text-green-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>12 most popular</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-200" />
                </div>
                <Bookmark className="h-5 w-5 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{favorites.length}</h3>
              <p className="text-green-100 text-sm">Favorite Tools</p>
              <div className="mt-2 flex items-center text-xs text-green-200">
                <Star className="h-3 w-3 mr-1" />
                <span>Quick access</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-green-200" />
                </div>
                <History className="h-5 w-5 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">6</h3>
              <p className="text-green-100 text-sm">Recent Tools</p>
              <div className="mt-2 flex items-center text-xs text-green-200">
                <Users className="h-3 w-3 mr-1" />
                <span>Last 7 days</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Award className="h-6 w-6 text-orange-200" />
                </div>
                <Settings className="h-5 w-5 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">4</h3>
              <p className="text-green-100 text-sm">Categories</p>
              <div className="mt-2 flex items-center text-xs text-green-200">
                <Grid3X3 className="h-3 w-3 mr-1" />
                <span>All tools covered</span>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Actions Grid */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className="group bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${action.color}-500/20 text-${action.color}-200 mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-medium text-white group-hover:text-green-100 transition-colors">{action.name}</h4>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Summary Cards
  function renderSummaryCards() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Calculator className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </div>
          <h3 className="text-2xl font-bold mb-1">25+</h3>
          <p className="text-blue-100 text-sm mb-2">Available Tools</p>
          <div className="flex items-center text-xs text-blue-200">
            <Zap className="h-3 w-3 mr-1" />
            <span>12 calculators, 8 analytics, 5 planning</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            <Star className="h-5 w-5 opacity-80" />
          </div>
          <h3 className="text-2xl font-bold mb-1">98%</h3>
          <p className="text-green-100 text-sm mb-2">User Satisfaction</p>
          <div className="flex items-center text-xs text-green-200">
            <Award className="h-3 w-3 mr-1" />
            <span>Based on 2.5k+ reviews</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <BarChart3 className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </div>
          <h3 className="text-2xl font-bold mb-1">15K+</h3>
          <p className="text-purple-100 text-sm mb-2">Calculations Today</p>
          <div className="flex items-center text-xs text-purple-200">
            <Clock className="h-3 w-3 mr-1" />
            <span>Average 8.2 per user</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Target className="h-6 w-6" />
            </div>
            <CheckCircle2 className="h-5 w-5 opacity-80" />
          </div>
          <h3 className="text-2xl font-bold mb-1">92%</h3>
          <p className="text-orange-100 text-sm mb-2">Goal Achievement</p>
          <div className="flex items-center text-xs text-orange-200">
            <PiggyBank className="h-3 w-3 mr-1" />
            <span>Using planning tools</span>
          </div>
        </div>
      </div>
    )
  }

  // Advanced Filtering System
  function renderFilteringSystem() {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search financial tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="calculators">Calculators</option>
              <option value="analytics">Analytics</option>
              <option value="planning">Planning</option>
              <option value="education">Education</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Used</option>
              <option value="category">By Category</option>
            </select>

            <button
              onClick={() => setShowFilterTags(!showFilterTags)}
              className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Tags */}
        {showFilterTags && (
          <div className="mt-4 flex flex-wrap gap-2">
            {['Popular', 'New', 'Advanced', 'Simple', 'Real Estate', 'Investment', 'Debt', 'Savings'].map((tag) => (
              <button
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const financialTools: FinancialTool[] = [
    {
      id: 'mortgage',
      name: 'Mortgage Calculator',
      description: 'Calculate monthly payments, total interest, and amortization schedules',
      category: 'loans',
      icon: Home,
      color: 'bg-blue-500',
      popular: true
    },
    {
      id: 'loan',
      name: 'Loan Calculator',
      description: 'Analyze auto loans, personal loans, and other financing options',
      category: 'loans',
      icon: Car,
      color: 'bg-green-500',
      popular: true
    },
    {
      id: 'savings',
      name: 'Savings Calculator',
      description: 'Plan your savings goals and track compound interest growth',
      category: 'savings',
      icon: PiggyBank,
      color: 'bg-purple-500',
      popular: true
    },
    {
      id: 'investment',
      name: 'Investment Calculator',
      description: 'Project investment returns and portfolio growth over time',
      category: 'investments',
      icon: TrendingUp,
      color: 'bg-orange-500',
      popular: true
    },
    {
      id: 'retirement',
      name: 'Retirement Planner',
      description: 'Calculate how much you need to save for retirement',
      category: 'planning',
      icon: Target,
      color: 'bg-indigo-500',
      popular: false
    },
    {
      id: 'credit_card',
      name: 'Credit Card Payoff',
      description: 'Find the fastest way to pay off credit card debt',
      category: 'debt',
      icon: CreditCard,
      color: 'bg-red-500',
      popular: false
    },
    {
      id: 'budget',
      name: 'Budget Planner',
      description: 'Create and manage your monthly budget effectively',
      category: 'planning',
      icon: BarChart3,
      color: 'bg-teal-500',
      popular: false
    },
    {
      id: 'currency',
      name: 'Currency Converter',
      description: 'Convert between different currencies with live rates',
      category: 'utilities',
      icon: ArrowRightLeft,
      color: 'bg-yellow-500',
      popular: false
    },
    {
      id: 'tax',
      name: 'Tax Calculator',
      description: 'Estimate your tax liability and plan accordingly',
      category: 'planning',
      icon: Calculator,
      color: 'bg-gray-500',
      popular: false
    },
    {
      id: 'refinance',
      name: 'Refinance Calculator',
      description: 'Determine if refinancing your loan makes financial sense',
      category: 'loans',
      icon: Building,
      color: 'bg-pink-500',
      popular: false
    },
    {
      id: 'compound',
      name: 'Compound Interest',
      description: 'See the power of compound interest over time',
      category: 'investments',
      icon: Coins,
      color: 'bg-emerald-500',
      popular: false
    },
    {
      id: 'debt_payoff',
      name: 'Debt Payoff Planner',
      description: 'Create a strategy to eliminate all your debts',
      category: 'debt',
      icon: Banknote,
      color: 'bg-violet-500',
      popular: false
    }
  ]

  const categories = [
    { id: 'all', name: 'All Tools', count: financialTools.length },
    { id: 'loans', name: 'Loans & Mortgages', count: 3 },
    { id: 'savings', name: 'Savings & Goals', count: 1 },
    { id: 'investments', name: 'Investments', count: 2 },
    { id: 'planning', name: 'Financial Planning', count: 3 },
    { id: 'debt', name: 'Debt Management', count: 2 },
    { id: 'utilities', name: 'Utilities', count: 1 }
  ]

  const calculateMortgage = () => {
    const monthlyRate = (loanRate / 100) / 12
    const numPayments = loanTerm * 12

    const monthlyPayment = loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)

    const totalAmount = monthlyPayment * numPayments
    const totalInterest = totalAmount - loanAmount

    setCalculationResults({
      monthlyPayment,
      totalInterest,
      totalAmount
    })
  }

  const calculateSavings = () => {
    const monthlyRate = (savingsRate / 100) / 12
    const numMonths = savingsYears * 12

    // Future value of initial amount
    const futureValueInitial = initialAmount * Math.pow(1 + monthlyRate, numMonths)

    // Future value of monthly contributions (annuity)
    const futureValueContributions = monthlyContribution *
      ((Math.pow(1 + monthlyRate, numMonths) - 1) / monthlyRate)

    const futureValue = futureValueInitial + futureValueContributions
    const totalContributions = initialAmount + (monthlyContribution * numMonths)
    const totalInterest = futureValue - totalContributions

    setCalculationResults({
      futureValue,
      totalInterest,
      totalAmount: totalContributions
    })
  }

  const calculateInvestment = () => {
    const annualRate = expectedReturn / 100
    const futureValue = investmentAmount * Math.pow(1 + annualRate, investmentYears)
    const totalGain = futureValue - investmentAmount
    const roi = ((futureValue - investmentAmount) / investmentAmount) * 100

    setCalculationResults({
      futureValue,
      totalInterest: totalGain,
      roi
    })
  }

  const filteredTools = activeCategory === 'all'
    ? financialTools
    : financialTools.filter(tool => tool.category === activeCategory)

  const renderToolGrid = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredTools.map((tool) => (
        <Card
          key={tool.id}
          className={`p-6 hover:shadow-lg transition-all cursor-pointer ${selectedTool === tool.id ? 'ring-2 ring-blue-500 border-blue-500' : ''
            }`}
          onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 ${tool.color} rounded-lg`}>
              <tool.icon className="h-6 w-6 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                {tool.popular && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Open Calculator
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )

  const renderMortgageCalculator = () => (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Mortgage Calculator</h3>
        <button
          onClick={() => setSelectedTool(null)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="250,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (%)
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.1"
                value={loanRate}
                onChange={(e) => setLoanRate(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="6.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Term (Years)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30"
              />
            </div>
          </div>

          <button
            onClick={calculateMortgage}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Calculate Payment
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Calculation Results</h4>

          {calculationResults.monthlyPayment && (
            <>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Payment</span>
                  <span className="font-semibold text-blue-600">
                    ${calculationResults.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Interest</span>
                  <span className="font-semibold">
                    ${calculationResults.totalInterest?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold">
                    ${calculationResults.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </>
          )}

          {!calculationResults.monthlyPayment && (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="h-8 w-8 mx-auto mb-2" />
              <p>Enter values and click calculate to see results</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )

  const renderSavingsCalculator = () => (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Savings Calculator</h3>
        <button
          onClick={() => setSelectedTool(null)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={initialAmount}
                onChange={(e) => setInitialAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Contribution
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Interest Rate (%)
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.1"
                value={savingsRate}
                onChange={(e) => setSavingsRate(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period (Years)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={savingsYears}
                onChange={(e) => setSavingsYears(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={calculateSavings}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Calculate Savings
          </button>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Projection Results</h4>

          {calculationResults.futureValue && (
            <>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Future Value</span>
                  <span className="font-semibold text-purple-600">
                    ${calculationResults.futureValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Contributions</span>
                  <span className="font-semibold">
                    ${calculationResults.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Interest Earned</span>
                  <span className="font-semibold text-green-600">
                    ${calculationResults.totalInterest?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  )

  // Enhanced render functions for tabs
  function renderAllTools() {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financialTools.map((tool) => (
            <div
              key={tool.id}
              className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${tool.color} text-white`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <button
                  onClick={() => setFavorites(prev =>
                    prev.includes(tool.id)
                      ? prev.filter(id => id !== tool.id)
                      : [...prev, tool.id]
                  )}
                  className={`p-2 rounded-full transition-colors ${favorites.includes(tool.id)
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-400 hover:text-red-500'
                    }`}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(tool.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                  {tool.category}
                </span>
                <button
                  onClick={() => setSelectedTool(tool.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Use Tool
                </button>
              </div>
              {tool.popular && (
                <div className="mt-3 flex items-center text-xs text-yellow-600">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  <span>Popular</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderCalculators() {
    const calculatorTools = financialTools.filter(tool => tool.category === 'loans' || tool.category === 'investment' || tool.category === 'savings')
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white inline-block mb-4">
            <Calculator className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Calculators</h3>
          <p className="text-gray-600 mb-6">Comprehensive calculation tools for all your financial needs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculatorTools.map((tool) => (
            <div key={tool.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all">
              <div className={`p-3 rounded-lg ${tool.color} text-white mb-4 inline-block`}>
                <tool.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
              <button
                onClick={() => setSelectedTool(tool.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Calculator
              </button>
            </div>
          ))}
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Analytics</h3>
          <p className="text-gray-600 mb-6">Advanced analysis tools to track and optimize your finances</p>
          <Link
            href="/tools/analytics/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            View Analytics Dashboard
          </Link>
        </div>
      </div>
    )
  }

  function renderPlanning() {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white inline-block mb-4">
            <Target className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Financial Planning</h3>
          <p className="text-gray-600 mb-6">Comprehensive planning tools for your financial goals</p>
          <Link
            href="/tools/planning/goals"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Start Planning
          </Link>
        </div>
      </div>
    )
  }

  function renderFavorites() {
    const favoriteTools = financialTools.filter(tool => favorites.includes(tool.id))
    return (
      <div className="space-y-6">
        {favoriteTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteTools.map((tool) => (
              <div key={tool.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all">
                <div className={`p-3 rounded-lg ${tool.color} text-white mb-4 inline-block`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                <button
                  onClick={() => setSelectedTool(tool.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Use Tool
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favorite Tools Yet</h3>
            <p className="text-gray-600">Click the heart icon on any tool to add it to your favorites</p>
          </div>
        )}
      </div>
    )
  }

  function renderRecent() {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white inline-block mb-4">
            <Clock className="h-12 w-12" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Recent Tools</h3>
          <p className="text-gray-600 mb-6">Your recently used financial calculation tools</p>
          <Link
            href="/tools/history"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            View Full History
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

        {/* Enhanced Summary Cards */}
        {renderSummaryCards()}

        {/* Advanced Filtering System */}
        {renderFilteringSystem()}

        {/* Content based on active tab */}
        {activeTab === 'all-tools' && renderAllTools()}
        {activeTab === 'calculators' && renderCalculators()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'planning' && renderPlanning()}
        {activeTab === 'favorites' && renderFavorites()}
        {activeTab === 'recent' && renderRecent()}

        {/* Modern Footer with Gradient Action Cards */}
        <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Master Your Finances</h2>
            <p className="text-gray-600">Explore comprehensive financial planning resources</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/tools/advanced"
              className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Calculator className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced Calculators</h3>
              <p className="text-blue-100 text-sm">Access professional-grade financial calculation tools</p>
            </Link>

            <Link
              href="/tools/analytics"
              className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Financial Analytics</h3>
              <p className="text-purple-100 text-sm">Analyze your financial data with powerful insights</p>
            </Link>

            <Link
              href="/tools/support"
              className="group relative bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Headphones className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Tools Support</h3>
              <p className="text-green-100 text-sm">Get expert help with using our financial tools</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
    <>
  {
    filteredTools.filter(tool => tool.popular).length > 0 && (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Tools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.filter(tool => tool.popular).map((tool) => (
            <Card
              key={tool.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedTool(tool.id)}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 ${tool.color} rounded-lg`}>
                  <tool.icon className="h-6 w-6 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      Popular
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Open Calculator
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  <div>
    <h2 className="text-xl font-semibold text-gray-900 mb-4">All Tools</h2>
    {renderToolGrid()}
  </div>
            </>
          )
}

{
  filteredTools.length === 0 && (
    <div className="text-center py-12">
      <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No tools found</h3>
      <p className="text-gray-600">No financial tools available in this category</p>
    </div>
  )
}
        </div >
      </div >
    </div >
  )
}

