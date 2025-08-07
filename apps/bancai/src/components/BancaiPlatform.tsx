import React from 'react'
/**
 * BancAI - AI-Powered Banking Platform
 * Full-featured banking application with AI insights, account management, 
 * transactions, payments, investments, and financial analytics
 */

'use client';

import { useAuth } from '../lib/auth';
import { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  Send,
  PlusCircle,
  BarChart3,
  Shield,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Users,
  Globe,
  Smartphone,
  Bell,
  Settings,
  Lock,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Brain
} from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  balance: number;
  currency: string;
  accountNumber: string;
  isHidden: boolean;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  account: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Investment {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  purchasePrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface AIInsight {
  id: string;
  type: 'spending' | 'saving' | 'investment' | 'security';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function BancaiPlatform() {
  const { authState, logout, hasRole, isAdmin } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBalances, setShowBalances] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in production, this would come from APIs
  const [accounts] = useState<Account[]>([
    {
      id: 'acc-1',
      name: 'Primary Checking',
      type: 'checking',
      balance: 15420.75,
      currency: 'USD',
      accountNumber: '****1234',
      isHidden: false
    },
    {
      id: 'acc-2',
      name: 'High-Yield Savings',
      type: 'savings',
      balance: 45800.00,
      currency: 'USD',
      accountNumber: '****5678',
      isHidden: false
    },
    {
      id: 'acc-3',
      name: 'Investment Portfolio',
      type: 'investment',
      balance: 127350.25,
      currency: 'USD',
      accountNumber: '****9012',
      isHidden: false
    },
    {
      id: 'acc-4',
      name: 'Business Credit',
      type: 'credit',
      balance: -2450.00,
      currency: 'USD',
      accountNumber: '****3456',
      isHidden: false
    }
  ]);

  const [recentTransactions] = useState<Transaction[]>([
    {
      id: 'txn-1',
      date: '2025-08-06',
      description: 'Coffee Shop - Downtown',
      amount: -15.67,
      type: 'debit',
      category: 'Food & Dining',
      account: 'acc-1',
      status: 'completed'
    },
    {
      id: 'txn-2',
      date: '2025-08-05',
      description: 'Salary Deposit',
      amount: 4500.00,
      type: 'credit',
      category: 'Income',
      account: 'acc-1',
      status: 'completed'
    },
    {
      id: 'txn-3',
      date: '2025-08-05',
      description: 'Electric Bill Payment',
      amount: -125.43,
      type: 'debit',
      category: 'Utilities',
      account: 'acc-1',
      status: 'completed'
    },
    {
      id: 'txn-4',
      date: '2025-08-04',
      description: 'Investment Purchase - AAPL',
      amount: -1250.00,
      type: 'debit',
      category: 'Investment',
      account: 'acc-3',
      status: 'completed'
    },
    {
      id: 'txn-5',
      date: '2025-08-04',
      description: 'Transfer to Savings',
      amount: -1000.00,
      type: 'debit',
      category: 'Transfer',
      account: 'acc-1',
      status: 'completed'
    }
  ]);

  const [investments] = useState<Investment[]>([
    {
      id: 'inv-1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 50,
      currentPrice: 184.25,
      purchasePrice: 175.00,
      totalValue: 9212.50,
      gainLoss: 462.50,
      gainLossPercent: 5.29
    },
    {
      id: 'inv-2',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      shares: 75,
      currentPrice: 335.50,
      purchasePrice: 320.00,
      totalValue: 25162.50,
      gainLoss: 1162.50,
      gainLossPercent: 4.84
    },
    {
      id: 'inv-3',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 25,
      currentPrice: 142.80,
      purchasePrice: 150.00,
      totalValue: 3570.00,
      gainLoss: -180.00,
      gainLossPercent: -4.80
    },
    {
      id: 'inv-4',
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      shares: 30,
      currentPrice: 248.75,
      purchasePrice: 245.00,
      totalValue: 7462.50,
      gainLoss: 112.50,
      gainLossPercent: 1.53
    }
  ]);

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: 'ai-1',
      type: 'spending',
      title: 'Optimize Food Spending',
      description: 'You spent 23% more on dining out this month. Consider setting a $400 budget.',
      action: 'Set Budget',
      priority: 'medium'
    },
    {
      id: 'ai-2',
      type: 'saving',
      title: 'Savings Opportunity',
      description: 'Based on your income, you could save an additional $500/month.',
      action: 'Auto-Save',
      priority: 'high'
    },
    {
      id: 'ai-3',
      type: 'investment',
      title: 'Portfolio Rebalancing',
      description: 'Your tech allocation is 70%. Consider diversifying into other sectors.',
      action: 'Rebalance',
      priority: 'medium'
    },
    {
      id: 'ai-4',
      type: 'security',
      title: 'Security Alert',
      description: 'Unusual login detected from new device. Please verify if this was you.',
      action: 'Review',
      priority: 'high'
    }
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading BancAI Platform...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <CreditCard className="h-12 w-12 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">BancAI</h1>
            </div>
            <p className="text-gray-600 mb-8">AI-powered banking platform for intelligent financial management</p>

            <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-6">
              <h3 className="font-semibold text-green-900 mb-3">🏦 Banking Features</h3>
              <ul className="text-sm text-green-700 space-y-2 text-left">
                <li>• AI-driven financial insights and recommendations</li>
                <li>• Multi-account management with real-time balances</li>
                <li>• Investment portfolio tracking and analytics</li>
                <li>• Secure transactions and payment processing</li>
                <li>• Advanced fraud detection and security</li>
              </ul>
            </div>

            <button
              onClick={() => window.location.href = 'http://localhost:4004/auth/signin?returnTo=' + encodeURIComponent(window.location.href)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In to BancAI
            </button>

            <div className="mt-4 text-sm text-gray-500">
              Secure banking via CODAI Identity
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalNetWorth = accounts.reduce((sum, account) => sum + account.balance, 0);
  const totalInvestments = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalGainLoss = investments.reduce((sum, inv) => sum + inv.gainLoss, 0);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'checking': return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'savings': return <Target className="h-5 w-5 text-green-500" />;
      case 'investment': return <TrendingUp className="h-5 w-5 text-purple-500" />;
      case 'credit': return <CreditCard className="h-5 w-5 text-orange-500" />;
      default: return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-900';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-900';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-900';
      default: return 'border-gray-200 bg-gray-50 text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">BancAI</h1>
                <p className="text-xs text-gray-600">AI-Powered Banking</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {[
                { key: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
                { key: 'accounts', name: 'Accounts', icon: <Wallet className="h-4 w-4" /> },
                { key: 'transactions', name: 'Transactions', icon: <ArrowUpRight className="h-4 w-4" /> },
                { key: 'investments', name: 'Investments', icon: <TrendingUp className="h-4 w-4" /> },
                { key: 'payments', name: 'Payments', icon: <Send className="h-4 w-4" /> },
                { key: 'insights', name: 'AI Insights', icon: <Brain className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowBalances(!showBalances)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    <span>{showBalances ? 'Hide' : 'Show'} Balances</span>
                  </button>
                </div>
              </div>
              <p className="text-gray-600">Your financial overview and AI-powered insights</p>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Net Worth</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {showBalances ? formatCurrency(totalNetWorth) : '••••••'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+2.4%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Investments</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {showBalances ? formatCurrency(totalInvestments) : '••••••'}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500 font-medium">+{((totalGainLoss / (totalInvestments - totalGainLoss)) * 100).toFixed(2)}%</span>
                  <span className="text-gray-500 ml-1">total return</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Spending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {showBalances ? formatCurrency(3247.89) : '••••••'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ArrowDownLeft className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <ArrowDownLeft className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-red-500 font-medium">+8.2%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Savings Goal</p>
                    <p className="text-2xl font-bold text-gray-900">78%</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Target className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">$15,600 of $20,000 goal</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-center">
                  <Send className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-blue-900">Send Money</span>
                </button>
                <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors text-center">
                  <PlusCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-green-900">Add Account</span>
                </button>
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors text-center">
                  <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-purple-900">Invest</span>
                </button>
                <button className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors text-center">
                  <BarChart3 className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <span className="text-sm font-medium text-yellow-900">Analytics</span>
                </button>
              </div>
            </div>

            {/* Recent Transactions and AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                </div>
                <div className="space-y-4">
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.type === 'credit' ?
                            <ArrowUpRight className="h-4 w-4 text-green-600" /> :
                            <ArrowDownLeft className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {showBalances ? formatCurrency(Math.abs(transaction.amount)) : '••••'}
                        </p>
                        <p className="text-sm text-gray-500">{transaction.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">🤖 AI Insights</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">See All</button>
                </div>
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <div key={insight.id} className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${insight.priority === 'high' ? 'bg-red-200 text-red-800' :
                            insight.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-blue-200 text-blue-800'
                          }`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{insight.description}</p>
                      {insight.action && (
                        <button className="text-sm bg-white border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 transition-colors">
                          {insight.action}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Account Management</h2>
                <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <PlusCircle className="h-5 w-5" />
                  <span>Add Account</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {accounts.map((account) => (
                  <div key={account.id} className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getAccountTypeIcon(account.type)}
                        <div>
                          <h3 className="font-semibold text-lg">{account.name}</h3>
                          <p className="text-blue-100 text-sm">{account.type.toUpperCase()}</p>
                        </div>
                      </div>
                      <button className="text-white/80 hover:text-white">
                        <Settings className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <p className="text-blue-100 text-sm">Available Balance</p>
                      <p className="text-3xl font-bold">
                        {showBalances ? formatCurrency(account.balance, account.currency) : '••••••••'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-blue-100 text-sm">Account {account.accountNumber}</p>
                      <div className="flex items-center space-x-2">
                        <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-sm transition-colors">
                          Transfer
                        </button>
                        <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md text-sm transition-colors">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly with full banking features */}
        {activeTab !== 'dashboard' && activeTab !== 'accounts' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
              </h3>
              <p className="text-gray-600 mb-6">
                Full-featured {activeTab} management coming soon with AI-powered insights and advanced functionality.
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Zap className="h-5 w-5" />
                <span className="font-medium">Under Development</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2025 BancAI. All rights reserved. | FDIC Insured | PCI DSS Compliant
            </div>
            <div className="text-sm text-gray-600">
              AI-Powered Banking • {user?.email}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

