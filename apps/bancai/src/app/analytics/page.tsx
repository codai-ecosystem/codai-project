'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, PieChart,
  Calendar, Filter, Download, RefreshCw, ArrowUpRight, ArrowDownLeft,
  Target, AlertCircle, CheckCircle, Info, Eye, EyeOff,
  CreditCard, Wallet, PiggyBank, Building, Clock, Search,
  Share2, Settings, Bell, Award, Zap, Users, FileText,
  ArrowRight, Star, Heart, Grid3X3, Activity, Bookmark,
  TrendingDown as TrendDown, LineChart, Calculator, Headphones
} from 'lucide-react';
import { useAuth } from '../lib/auth';

interface AnalyticsData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  topCategories: { name: string; amount: number; percentage: number; color: string }[];
  monthlyTrend: { month: string; income: number; expenses: number; savings: number }[];
  goals: { id: string; name: string; target: number; current: number; deadline: string }[];
  insights: { type: 'success' | 'warning' | 'info'; title: string; description: string }[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('12');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProjections, setShowProjections] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('amount');
  const [showFilterTags, setShowFilterTags] = useState(false);

  // Enhanced tabs configuration
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3, count: '12' },
    { id: 'spending', name: 'Spending', icon: TrendDown, count: '7' },
    { id: 'income', name: 'Income', icon: TrendingUp, count: '5' },
    { id: 'goals', name: 'Goals', icon: Target, count: '4' },
    { id: 'trends', name: 'Trends', icon: LineChart, count: '8' },
    { id: 'reports', name: 'Reports', icon: FileText, count: '15' }
  ];

  // Enhanced quick actions
  const quickActions = [
    { name: 'Export Data', icon: Download, color: 'blue', href: '/analytics/export' },
    { name: 'Set Goals', icon: Target, color: 'green', href: '/analytics/goals' },
    { name: 'Budget Planner', icon: Calculator, color: 'purple', href: '/analytics/budget' },
    { name: 'Spending Insights', icon: PieChart, color: 'orange', href: '/analytics/insights' },
    { name: 'Trend Analysis', icon: TrendingUp, color: 'pink', href: '/analytics/trends' },
    { name: 'Custom Reports', icon: FileText, color: 'indigo', href: '/analytics/reports' },
    { name: 'Forecasting', icon: Activity, color: 'emerald', href: '/analytics/forecast' },
    { name: 'Analytics Settings', icon: Settings, color: 'red', href: '/analytics/settings' }
  ];

  const analyticsData: AnalyticsData = {
    totalBalance: 106278.46,
    monthlyIncome: 7500.00,
    monthlyExpenses: 4850.00,
    savingsRate: 35.3,
    topCategories: [
      { name: 'Housing', amount: 1800, percentage: 37.1, color: 'bg-blue-500' },
      { name: 'Food & Dining', amount: 650, percentage: 13.4, color: 'bg-green-500' },
      { name: 'Transportation', amount: 450, percentage: 9.3, color: 'bg-yellow-500' },
      { name: 'Entertainment', amount: 380, percentage: 7.8, color: 'bg-purple-500' },
      { name: 'Healthcare', amount: 320, percentage: 6.6, color: 'bg-red-500' },
      { name: 'Shopping', amount: 280, percentage: 5.8, color: 'bg-indigo-500' },
      { name: 'Other', amount: 970, percentage: 20.0, color: 'bg-gray-500' }
    ],
    monthlyTrend: [
      { month: 'Jan', income: 7200, expenses: 4500, savings: 2700 },
      { month: 'Feb', income: 7200, expenses: 4650, savings: 2550 },
      { month: 'Mar', income: 7500, expenses: 4800, savings: 2700 },
      { month: 'Apr', income: 7500, expenses: 4950, savings: 2550 },
      { month: 'May', income: 7800, expenses: 4750, savings: 3050 },
      { month: 'Jun', income: 7800, expenses: 4900, savings: 2900 },
      { month: 'Jul', income: 7500, expenses: 4850, savings: 2650 },
      { month: 'Aug', income: 7500, expenses: 4850, savings: 2650 }
    ],
    goals: [
      { id: '1', name: 'Emergency Fund', target: 30000, current: 25890, deadline: '2025-12-31' },
      { id: '2', name: 'Vacation Fund', target: 5000, current: 2340, deadline: '2025-06-01' },
      { id: '3', name: 'New Car', target: 25000, current: 8750, deadline: '2026-03-15' },
      { id: '4', name: 'Investment Portfolio', target: 100000, current: 67890, deadline: '2026-12-31' }
    ],
    insights: [
      {
        type: 'success',
        title: 'Great Savings Progress!',
        description: 'You\'re saving 35.3% of your income, well above the recommended 20%.'
      },
      {
        type: 'warning',
        title: 'Dining Out Trending Up',
        description: 'Your food & dining expenses increased by 15% this month. Consider meal planning.'
      },
      {
        type: 'info',
        title: 'Investment Opportunity',
        description: 'Based on your savings rate, you could increase your investment portfolio by $500/month.'
      }
    ]
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Enhanced header component
  function renderEnhancedHeader() {
    return (
      <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Financial Analytics Dashboard</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Comprehensive insights and analytics to understand and optimize your financial health
            </p>
          </div>

          {/* Enhanced Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-200" />
                </div>
                <TrendingUp className="h-5 w-5 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{formatCurrency(analyticsData.totalBalance)}</h3>
              <p className="text-green-100 text-sm">Total Assets</p>
              <div className="mt-2 flex items-center text-xs text-green-200">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>+12.4% this year</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <PieChart className="h-6 w-6 text-green-200" />
                </div>
                <Target className="h-5 w-5 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{formatPercentage(analyticsData.savingsRate)}</h3>
              <p className="text-green-100 text-sm">Savings Rate</p>
              <div className="mt-2 flex items-center text-xs text-green-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Above recommended 20%</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-purple-200" />
                </div>
                <Activity className="h-5 w-5 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">A+</h3>
              <p className="text-green-100 text-sm">Financial Health</p>
              <div className="mt-2 flex items-center text-xs text-green-200">
                <Award className="h-3 w-3 mr-1" />
                <span>Top 15% performers</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-orange-200" />
                </div>
                <Bell className="h-5 w-5 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{analyticsData.insights.length}</h3>
              <p className="text-green-100 text-sm">Active Insights</p>
              <div className="mt-2 flex items-center text-xs text-green-200">
                <Info className="h-3 w-3 mr-1" />
                <span>2 actions needed</span>
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
    const netWorth = analyticsData.totalBalance
    const monthlyNet = analyticsData.monthlyIncome - analyticsData.monthlyExpenses

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-5 w-5 opacity-80" />
          </div>
          <h3 className="text-2xl font-bold mb-1">{formatCurrency(analyticsData.monthlyIncome)}</h3>
          <p className="text-blue-100 text-sm mb-2">Monthly Income</p>
          <div className="flex items-center text-xs text-blue-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+8.2% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendDown className="h-6 w-6" />
            </div>
            <ArrowDownLeft className="h-5 w-5 opacity-80" />
          </div>
          <h3 className="text-2xl font-bold mb-1">{formatCurrency(analyticsData.monthlyExpenses)}</h3>
          <p className="text-red-100 text-sm mb-2">Monthly Expenses</p>
          <div className="flex items-center text-xs text-red-200">
            <TrendDown className="h-3 w-3 mr-1" />
            <span>-2.1% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <PiggyBank className="h-6 w-6" />
            </div>
            <Star className="h-5 w-5 opacity-80" />
          </div>
          <h3 className="text-2xl font-bold mb-1">{formatCurrency(monthlyNet)}</h3>
          <p className="text-green-100 text-sm mb-2">Monthly Savings</p>
          <div className="flex items-center text-xs text-green-200">
            <Target className="h-3 w-3 mr-1" />
            <span>{formatPercentage(analyticsData.savingsRate)} savings rate</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Target className="h-6 w-6" />
            </div>
            <CheckCircle className="h-5 w-5 opacity-80" />
          </div>
          <h3 className="text-2xl font-bold mb-1">{analyticsData.goals.length}</h3>
          <p className="text-purple-100 text-sm mb-2">Active Goals</p>
          <div className="flex items-center text-xs text-purple-200">
            <Award className="h-3 w-3 mr-1" />
            <span>3 on track, 1 behind</span>
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
              placeholder="Search analytics data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1">Last Month</option>
              <option value="3">Last 3 Months</option>
              <option value="6">Last 6 Months</option>
              <option value="12">Last Year</option>
              <option value="24">Last 2 Years</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="income">Income</option>
              <option value="expenses">Expenses</option>
              <option value="savings">Savings</option>
              <option value="investments">Investments</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="amount">Sort by Amount</option>
              <option value="date">Sort by Date</option>
              <option value="category">Sort by Category</option>
              <option value="percentage">Sort by Percentage</option>
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
            {['High Priority', 'Trending', 'Goals', 'Budgets', 'Investments', 'Subscriptions', 'One-time', 'Recurring'].map((tag) => (
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getGoalProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getGoalStatusColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600 bg-green-100';
    if (progress >= 70) return 'text-yellow-600 bg-yellow-100';
    if (progress >= 50) return 'text-blue-600 bg-blue-100';
    return 'text-red-600 bg-red-100';
  };

  // Tab-specific render functions
  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <LineChart className="h-5 w-5 mr-2 text-blue-600" />
          Monthly Spending Trend
        </h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Spending trend chart would go here</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-green-600" />
          Financial Health Score
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Overall Score</span>
            <span className="text-lg font-semibold text-green-600">87/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '87%' }}></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">6.2x</div>
              <div className="text-xs text-gray-500">Savings Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">94%</div>
              <div className="text-xs text-gray-500">Budget Adherence</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpending = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { category: 'Food & Dining', amount: '$1,234', percentage: '32%', color: 'bg-red-500' },
            { category: 'Transportation', amount: '$856', percentage: '22%', color: 'bg-blue-500' },
            { category: 'Shopping', amount: '$642', percentage: '16%', color: 'bg-yellow-500' },
            { category: 'Entertainment', amount: '$428', percentage: '11%', color: 'bg-purple-500' },
            { category: 'Bills & Utilities', amount: '$385', percentage: '10%', color: 'bg-green-500' },
            { category: 'Other', amount: '$342', percentage: '9%', color: 'bg-gray-500' }
          ].map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm font-medium text-gray-600">{item.percentage}</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">{item.amount}</div>
              <div className="text-sm text-gray-500">{item.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIncome = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Sources</h3>
        <div className="space-y-4">
          {[
            { source: 'Primary Salary', amount: '$5,200', growth: '+3.2%', trend: 'up' },
            { source: 'Freelance Work', amount: '$1,850', growth: '+12.5%', trend: 'up' },
            { source: 'Investment Returns', amount: '$420', growth: '-2.1%', trend: 'down' },
            { source: 'Side Business', amount: '$280', growth: '+8.9%', trend: 'up' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{item.source}</div>
                <div className="text-sm text-gray-500">Monthly average</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{item.amount}</div>
                <div className={`text-sm ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {item.growth}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Goals Progress</h3>
        <div className="space-y-6">
          {[
            { goal: 'Emergency Fund', target: '$15,000', current: '$12,800', percentage: 85 },
            { goal: 'Vacation Fund', target: '$5,000', current: '$3,200', percentage: 64 },
            { goal: 'New Car', target: '$25,000', current: '$8,500', percentage: 34 },
            { goal: 'Home Down Payment', target: '$50,000', current: '$18,900', percentage: 38 }
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{item.goal}</span>
                <span className="text-sm text-gray-500">{item.current} / {item.target}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{item.percentage}% complete</span>
                <span>{100 - item.percentage}% remaining</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Trends Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Monthly Trends</h4>
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Monthly trends chart</p>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Category Trends</h4>
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Category trends chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Monthly Summary', type: 'PDF', size: '2.4 MB', date: '2024-01-15' },
            { name: 'Tax Report 2023', type: 'PDF', size: '1.8 MB', date: '2024-01-10' },
            { name: 'Investment Analysis', type: 'XLSX', size: '856 KB', date: '2024-01-08' },
            { name: 'Spending Breakdown', type: 'PDF', size: '1.2 MB', date: '2024-01-05' },
            { name: 'Budget vs Actual', type: 'XLSX', size: '642 KB', date: '2024-01-03' },
            { name: 'Annual Review', type: 'PDF', size: '3.1 MB', date: '2024-01-01' }
          ].map((report, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="text-xs text-gray-500">{report.type}</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{report.name}</h4>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Size: {report.size}</div>
                <div>Date: {report.date}</div>
              </div>
              <button className="mt-3 w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                Download Report
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'spending' && renderSpending()}
        {activeTab === 'income' && renderIncome()}
        {activeTab === 'goals' && renderGoals()}
        {activeTab === 'trends' && renderTrends()}
        {activeTab === 'reports' && renderReports()}

        {/* Modern Footer with Gradient Action Cards */}
        <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Analytics Tools</h2>
            <p className="text-gray-600">Explore comprehensive financial analysis features</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/analytics/forecasting"
              className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Activity className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Forecasting Tools</h3>
              <p className="text-blue-100 text-sm">Predict future financial trends with AI-powered analytics</p>
            </Link>

            <Link
              href="/analytics/reports"
              className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <FileText className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Custom Reports</h3>
              <p className="text-purple-100 text-sm">Generate detailed financial reports and insights</p>
            </Link>

            <Link
              href="/analytics/support"
              className="group relative bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Headphones className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Analytics Support</h3>
              <p className="text-green-100 text-sm">Get expert help with financial analysis and insights</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Key Metrics */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Wallet className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Total Balance</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatCurrency(analyticsData.totalBalance)}
          </p>
          <p className="text-sm text-green-600">+5.2% from last month</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <ArrowDownLeft className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Monthly Income</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatCurrency(analyticsData.monthlyIncome)}
          </p>
          <p className="text-sm text-green-600">+2.1% from last month</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <ArrowUpRight className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Monthly Expenses</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatCurrency(analyticsData.monthlyExpenses)}
          </p>
          <p className="text-sm text-red-600">+3.4% from last month</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <PiggyBank className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Savings Rate</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatPercentage(analyticsData.savingsRate)}
          </p>
          <p className="text-sm text-green-600">Above target (20%)</p>
        </div>
      </div>
    </div>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
    {/* Spending by Category */}
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Spending by Category</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800">
            View Details
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {analyticsData.topCategories.map((category, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedCategory === category.name ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50'
                }`}
              onClick={() => setSelectedCategory(
                selectedCategory === category.name ? null : category.name
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${category.color} mr-3`}></div>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(category.amount)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatPercentage(category.percentage)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${category.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Monthly Trend Chart */}
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Monthly Trend</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Income</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Expenses</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Savings</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="h-64 flex items-end justify-between space-x-2">
          {analyticsData.monthlyTrend.map((month, index) => {
            const maxValue = Math.max(...analyticsData.monthlyTrend.map(m => m.income));
            const incomeHeight = (month.income / maxValue) * 100;
            const expensesHeight = (month.expenses / maxValue) * 100;
            const savingsHeight = (month.savings / maxValue) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-16 flex justify-center space-x-1 mb-2">
                  <div
                    className="bg-green-500 rounded-t w-3"
                    style={{ height: `${incomeHeight * 0.8}px` }}
                    title={`Income: ${formatCurrency(month.income)}`}
                  ></div>
                  <div
                    className="bg-red-500 rounded-t w-3"
                    style={{ height: `${expensesHeight * 0.8}px` }}
                    title={`Expenses: ${formatCurrency(month.expenses)}`}
                  ></div>
                  <div
                    className="bg-blue-500 rounded-t w-3"
                    style={{ height: `${savingsHeight * 0.8}px` }}
                    title={`Savings: ${formatCurrency(month.savings)}`}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">{month.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>

  {/* Financial Goals */}
  <div className="bg-white rounded-lg shadow mb-8">
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Financial Goals</h3>
        <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Target className="h-4 w-4 mr-2" />
          Add Goal
        </button>
      </div>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analyticsData.goals.map((goal) => {
          const progress = getGoalProgress(goal.current, goal.target);
          const remaining = goal.target - goal.current;
          const deadline = new Date(goal.deadline);
          const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{goal.name}</h4>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getGoalStatusColor(progress)}`}>
                  {formatPercentage(progress)}
                </span>
              </div>

              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {formatCurrency(remaining)} remaining
                </span>
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {daysLeft} days left
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>

  {/* Insights & Recommendations */}
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">AI Insights & Recommendations</h3>
    </div>
    <div className="p-6">
      <div className="space-y-4">
        {analyticsData.insights.map((insight, index) => (
          <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            {getInsightIcon(insight.type)}
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap">
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
    </div >
  );
}
