'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Filter,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity,
  Users,
  Globe,
  Smartphone
} from 'lucide-react'

interface ChartData {
  period: string
  income: number
  expenses: number
  investments: number
  savings: number
}

interface CategorySpending {
  category: string
  amount: number
  percentage: number
  change: number
  icon: React.ReactNode
  color: string
}

interface FinancialGoal {
  id: string
  title: string
  target: number
  current: number
  deadline: string
  category: string
  priority: 'high' | 'medium' | 'low'
}

const mockChartData: ChartData[] = [
  { period: 'Jan', income: 15000, expenses: 8500, investments: 3000, savings: 3500 },
  { period: 'Feb', income: 16200, expenses: 9200, investments: 3500, savings: 3500 },
  { period: 'Mar', income: 15800, expenses: 8900, investments: 2900, savings: 4000 },
  { period: 'Apr', income: 17500, expenses: 9800, investments: 4000, savings: 3700 },
  { period: 'May', income: 16800, expenses: 9100, investments: 3700, savings: 4000 },
  { period: 'Jun', income: 18000, expenses: 10200, investments: 4200, savings: 3600 },
]

const categorySpending: CategorySpending[] = [
  {
    category: 'Food & Dining',
    amount: 2450,
    percentage: 24.5,
    change: 8.2,
    icon: <DollarSign className="w-4 h-4" />,
    color: 'from-orange-500 to-orange-600'
  },
  {
    category: 'Shopping',
    amount: 1890,
    percentage: 18.9,
    change: -12.5,
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'from-pink-500 to-pink-600'
  },
  {
    category: 'Transportation',
    amount: 1450,
    percentage: 14.5,
    change: 5.3,
    icon: <Activity className="w-4 h-4" />,
    color: 'from-blue-500 to-blue-600'
  },
  {
    category: 'Utilities & Bills',
    amount: 1230,
    percentage: 12.3,
    change: 2.1,
    icon: <Zap className="w-4 h-4" />,
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    category: 'Entertainment',
    amount: 980,
    percentage: 9.8,
    change: 22.8,
    icon: <Users className="w-4 h-4" />,
    color: 'from-purple-500 to-purple-600'
  },
  {
    category: 'Healthcare',
    amount: 650,
    percentage: 6.5,
    change: -5.2,
    icon: <Target className="w-4 h-4" />,
    color: 'from-red-500 to-red-600'
  },
  {
    category: 'Technology',
    amount: 520,
    percentage: 5.2,
    change: 15.7,
    icon: <Smartphone className="w-4 h-4" />,
    color: 'from-green-500 to-green-600'
  },
  {
    category: 'Other',
    amount: 830,
    percentage: 8.3,
    change: -2.1,
    icon: <Globe className="w-4 h-4" />,
    color: 'from-gray-500 to-gray-600'
  },
]

const financialGoals: FinancialGoal[] = [
  {
    id: 'goal-1',
    title: 'Emergency Fund',
    target: 50000,
    current: 35000,
    deadline: '2025-12-31',
    category: 'Savings',
    priority: 'high'
  },
  {
    id: 'goal-2',
    title: 'House Down Payment',
    target: 200000,
    current: 125000,
    deadline: '2026-06-30',
    category: 'Real Estate',
    priority: 'high'
  },
  {
    id: 'goal-3',
    title: 'Vacation Fund',
    target: 15000,
    current: 8500,
    deadline: '2025-07-01',
    category: 'Travel',
    priority: 'medium'
  },
  {
    id: 'goal-4',
    title: 'Retirement Portfolio',
    target: 500000,
    current: 180000,
    deadline: '2040-12-31',
    category: 'Investment',
    priority: 'high'
  }
]

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6M')
  const [selectedMetric, setSelectedMetric] = useState('all')

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'low': return 'bg-green-500/20 text-green-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const totalIncome = mockChartData.reduce((sum, data) => sum + data.income, 0)
  const totalExpenses = mockChartData.reduce((sum, data) => sum + data.expenses, 0)
  const totalInvestments = mockChartData.reduce((sum, data) => sum + data.investments, 0)
  const totalSavings = mockChartData.reduce((sum, data) => sum + data.savings, 0)

  const savingsRate = ((totalSavings + totalInvestments) / totalIncome) * 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-blue-200 mt-2">Financial insights and performance tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1M">Last Month</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="1Y">Last Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-200 text-sm font-medium">Total Income</h3>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            {totalIncome.toLocaleString('ro-RO')} RON
          </p>
          <div className="flex items-center gap-1 text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm">+12.5% vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-200 text-sm font-medium">Total Expenses</h3>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            {totalExpenses.toLocaleString('ro-RO')} RON
          </p>
          <div className="flex items-center gap-1 text-red-400">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm">+8.2% vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-200 text-sm font-medium">Savings Rate</h3>
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            {savingsRate.toFixed(1)}%
          </p>
          <div className="flex items-center gap-1 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Above target (20%)</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-200 text-sm font-medium">Net Worth Growth</h3>
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            +{(totalIncome - totalExpenses).toLocaleString('ro-RO')} RON
          </p>
          <div className="flex items-center gap-1 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">+28.3% portfolio growth</span>
          </div>
        </motion.div>
      </div>

      {/* Cash Flow Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Cash Flow Analysis</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-blue-200 text-sm">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-blue-200 text-sm">Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-blue-200 text-sm">Investments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-blue-200 text-sm">Savings</span>
            </div>
          </div>
        </div>

        {/* Simple Bar Chart Representation */}
        <div className="space-y-4">
          {mockChartData.map((data, index) => (
            <div key={data.period} className="flex items-center gap-4">
              <div className="w-12 text-blue-200 text-sm font-medium">{data.period}</div>
              <div className="flex-1 relative">
                <div className="flex items-center gap-1 h-8">
                  <div
                    className="h-full bg-emerald-500 rounded-l"
                    style={{ width: `${(data.income / 20000) * 100}%` }}
                  ></div>
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${(data.expenses / 20000) * 100}%` }}
                  ></div>
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(data.investments / 20000) * 100}%` }}
                  ></div>
                  <div
                    className="h-full bg-purple-500 rounded-r"
                    style={{ width: `${(data.savings / 20000) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-20 text-white text-sm text-right">
                {(data.income - data.expenses).toLocaleString('ro-RO')}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Spending Categories and Goals */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Spending by Category</h3>
          <div className="space-y-4">
            {categorySpending.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-white`}>
                    {category.icon}
                  </div>
                  <div>
                    <p className="text-white font-medium">{category.category}</p>
                    <p className="text-blue-200 text-sm">{category.percentage}% of total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">
                    {category.amount.toLocaleString('ro-RO')} RON
                  </p>
                  <div className={`flex items-center gap-1 text-sm ${category.change >= 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                    {category.change >= 0 ?
                      <ArrowUpRight className="w-3 h-3" /> :
                      <ArrowDownLeft className="w-3 h-3" />
                    }
                    <span>{Math.abs(category.change)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Financial Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Financial Goals</h3>
          <div className="space-y-6">
            {financialGoals.map((goal) => {
              const progress = (goal.current / goal.target) * 100
              return (
                <div key={goal.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{goal.title}</h4>
                      <p className="text-blue-200 text-sm">{goal.category} • Due {goal.deadline}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-200">
                        {goal.current.toLocaleString('ro-RO')} RON
                      </span>
                      <span className="text-white">
                        {goal.target.toLocaleString('ro-RO')} RON
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-white text-sm mt-1">{progress.toFixed(1)}% complete</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Financial Health Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 backdrop-blur-md rounded-xl p-8 border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Financial Health Score</h3>
            <p className="text-blue-200 mt-2">Based on your spending, saving, and investment patterns</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mb-2">
              <span className="text-3xl font-bold text-white">92</span>
            </div>
            <p className="text-emerald-400 font-medium">Excellent</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-white font-semibold">Savings Rate</h4>
            <p className="text-emerald-400 text-sm">Above target</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-white font-semibold">Investment Diversification</h4>
            <p className="text-blue-400 text-sm">Well balanced</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <h4 className="text-white font-semibold">Expense Control</h4>
            <p className="text-yellow-400 text-sm">Room for improvement</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="text-white font-semibold">Goal Progress</h4>
            <p className="text-emerald-400 text-sm">On track</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
