'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  BarChart3,
  PieChart,
  DollarSign,
  Target,
  Star,
  AlertTriangle,
  Info,
  Calendar,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpDown,
  Settings,
  RefreshCw,
  Users,
  Briefcase,
  Banknote,
  Globe,
  Heart,
  BookOpen,
  CheckCircle,
  Activity,
  Award,
  Zap,
  Calculator,
  Bell,
  Layers,
  SortDesc,
  Camera,
  MessageSquare,
  HelpCircle,
  FileText,
  Smartphone,
  Shield,
  Lock,
  Unlock,
  Archive,
  Map as MapIcon,
  PiggyBank,
  HandCoins,
  CalendarDays,
  Landmark,
  MapPin,
  LineChart,
  Edit,
  Copy,
  ExternalLink,
  TrendingUpIcon,
  Percent,
  Building2,
  Wallet,
  CreditCard
} from 'lucide-react';

interface InvestmentHolding {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'mutual_fund' | 'bond';
  shares: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  dividendYield?: number;
}

interface InvestmentAccount {
  id: string;
  name: string;
  type: 'brokerage' | 'ira' | 'roth_ira' | '401k';
  totalValue: number;
  cashBalance: number;
  investedAmount: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: InvestmentHolding[];
}

const mockInvestmentAccounts: InvestmentAccount[] = [
  {
    id: '1',
    name: 'Individual Brokerage',
    type: 'brokerage',
    totalValue: 125430.75,
    cashBalance: 5430.75,
    investedAmount: 120000,
    gainLoss: 8430.75,
    gainLossPercent: 7.02,
    dayChange: 1247.82,
    dayChangePercent: 1.01,
    holdings: [
      {
        id: '1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        shares: 100,
        averageCost: 175.50,
        currentPrice: 182.25,
        marketValue: 18225,
        gainLoss: 675,
        gainLossPercent: 3.84,
        dayChange: 125,
        dayChangePercent: 0.69,
        dividendYield: 0.47
      },
      {
        id: '2',
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        type: 'stock',
        shares: 75,
        averageCost: 320.00,
        currentPrice: 335.80,
        marketValue: 25185,
        gainLoss: 1185,
        gainLossPercent: 4.94,
        dayChange: 385,
        dayChangePercent: 1.55,
        dividendYield: 0.68
      },
      {
        id: '3',
        symbol: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        type: 'etf',
        shares: 200,
        averageCost: 425.00,
        currentPrice: 440.50,
        marketValue: 88100,
        gainLoss: 3100,
        gainLossPercent: 3.65,
        dayChange: 780,
        dayChangePercent: 0.89,
        dividendYield: 1.25
      }
    ]
  },
  {
    id: '2',
    name: 'Traditional IRA',
    type: 'ira',
    totalValue: 85620.50,
    cashBalance: 1520.50,
    investedAmount: 80000,
    gainLoss: 4100,
    gainLossPercent: 5.12,
    dayChange: 425.30,
    dayChangePercent: 0.50,
    holdings: [
      {
        id: '4',
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        type: 'etf',
        shares: 300,
        averageCost: 220.00,
        currentPrice: 235.80,
        marketValue: 70740,
        gainLoss: 4740,
        gainLossPercent: 7.18,
        dayChange: 315,
        dayChangePercent: 0.45,
        dividendYield: 1.35
      },
      {
        id: '5',
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        type: 'etf',
        shares: 150,
        averageCost: 85.00,
        currentPrice: 88.40,
        marketValue: 13260,
        gainLoss: 510,
        gainLossPercent: 4.00,
        dayChange: 85,
        dayChangePercent: 0.65,
        dividendYield: 3.45
      }
    ]
  }
];

export default function InvestmentsPage() {
  // Enhanced State Management
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [showBalances, setShowBalances] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('value');
  const [viewMode, setViewMode] = useState<'holdings' | 'performance' | 'analytics'>('holdings');
  const [activeTab, setActiveTab] = useState<'portfolio' | 'holdings' | 'research' | 'goals' | 'analytics' | 'watchlist'>('portfolio');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1D');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');

  // Enhanced Filters and Features
  const [filters, setFilters] = useState({
    assetType: 'all' as 'all' | 'stocks' | 'bonds' | 'etfs' | 'mutual_funds' | 'crypto',
    performance: 'all' as 'all' | 'gainers' | 'losers' | 'neutral',
    riskLevel: 'all' as 'all' | 'low' | 'medium' | 'high',
    dividendYield: 'all' as 'all' | 'high' | 'medium' | 'low' | 'none'
  });

  // Investment Analytics and Goals
  const [investmentAnalytics, setInvestmentAnalytics] = useState({
    totalValue: 0,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    dayChange: 0,
    dayChangePercent: 0,
    totalHoldings: 0,
    diversificationScore: 0,
    riskScore: 0,
    performanceScore: 0
  });

  // Advanced Investment Features
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [investmentGoals, setInvestmentGoals] = useState([]);
  const [rebalanceMode, setRebalanceMode] = useState(false);
  const [researchMode, setResearchMode] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Enhanced calculations
  const totalPortfolioValue = mockInvestmentAccounts.reduce((sum, account) => sum + account.totalValue, 0);
  const totalCashBalance = mockInvestmentAccounts.reduce((sum, account) => sum + account.cashBalance, 0);
  const totalInvestedAmount = mockInvestmentAccounts.reduce((sum, account) => sum + account.investedAmount, 0);
  const totalGainLoss = mockInvestmentAccounts.reduce((sum, account) => sum + account.gainLoss, 0);
  const totalGainLossPercent = (totalGainLoss / (totalPortfolioValue - totalGainLoss)) * 100;
  const totalDayChange = mockInvestmentAccounts.reduce((sum, account) => sum + account.dayChange, 0);
  const totalDayChangePercent = (totalDayChange / totalPortfolioValue) * 100;
  const totalHoldings = mockInvestmentAccounts.reduce((sum, account) => sum + account.holdings.length, 0);
  const averageReturn = totalGainLossPercent;

  // Analytics Update Effect
  useEffect(() => {
    const updateAnalytics = () => {
      setInvestmentAnalytics({
        totalValue: totalPortfolioValue,
        totalGainLoss: totalGainLoss,
        totalGainLossPercent: totalGainLossPercent,
        dayChange: totalDayChange,
        dayChangePercent: totalDayChangePercent,
        totalHoldings: totalHoldings,
        diversificationScore: Math.min(95, totalHoldings * 5 + Math.random() * 20),
        riskScore: Math.max(15, 45 + Math.random() * 30),
        performanceScore: Math.max(60, 80 + Math.random() * 20)
      });
    };

    updateAnalytics();
    const interval = setInterval(updateAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [totalPortfolioValue, totalGainLoss, totalGainLossPercent, totalDayChange, totalDayChangePercent, totalHoldings]);

  // Enhanced Filtering Logic
  const filteredHoldings = useMemo(() => {
    let allHoldings = mockInvestmentAccounts.flatMap(account =>
      account.holdings.map(holding => ({ ...holding, accountId: account.id }))
    );

    // Apply filters
    if (filters.assetType !== 'all') {
      allHoldings = allHoldings.filter(holding => holding.type.toLowerCase() === filters.assetType);
    }

    if (filters.performance !== 'all') {
      allHoldings = allHoldings.filter(holding => {
        const changePercent = holding.changePercent || 0;
        if (filters.performance === 'gainers') return changePercent > 0;
        if (filters.performance === 'losers') return changePercent < 0;
        return Math.abs(changePercent) < 0.5;
      });
    }

    // Search filter
    if (searchQuery) {
      allHoldings = allHoldings.filter(holding =>
        holding.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        holding.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    allHoldings.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.value - a.value;
        case 'change':
          return (b.changePercent || 0) - (a.changePercent || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return allHoldings;
  }, [searchQuery, sortBy, filters]);

  // Enhanced Utility Functions
  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const resetFilters = () => {
    setFilters({
      assetType: 'all',
      performance: 'all',
      riskLevel: 'all',
      dividendYield: 'all'
    });
    setSearchQuery('');
    setSortBy('value');
  };
  const portfolioAllocation = {
    stocks: 65.2,
    etfs: 28.5,
    bonds: 4.8,
    cash: 1.5
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const allHoldings = mockInvestmentAccounts.flatMap(account =>
    account.holdings.map(holding => ({ ...holding, accountName: account.name }))
  );

  const filteredHoldings = allHoldings.filter(holding =>
    holding.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    holding.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-3">
                Investments & Portfolio
              </h1>
              <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                Track your portfolio performance, research investments, and manage your financial goals with comprehensive analytics
              </p>
            </div>

            {/* Investment Analytics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <DollarSign className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {showBalances ? formatCurrency(investmentAnalytics.totalValue) : '••••••'}
                </div>
                <div className="text-sm text-white/80">Portfolio Value</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <TrendingUp className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {showBalances ? formatPercent(investmentAnalytics.totalGainLossPercent) : '••••'}
                </div>
                <div className="text-sm text-white/80">Total Return</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Activity className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {showBalances ? formatPercent(investmentAnalytics.dayChangePercent) : '••••'}
                </div>
                <div className="text-sm text-white/80">Today's Change</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <PieChart className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{investmentAnalytics.totalHoldings}</div>
                <div className="text-sm text-white/80">Holdings</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Target className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{investmentAnalytics.diversificationScore.toFixed(0)}%</div>
                <div className="text-sm text-white/80">Diversification</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Award className="h-6 w-6 text-white/80 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{investmentAnalytics.performanceScore.toFixed(0)}%</div>
                <div className="text-sm text-white/80">Performance</div>
              </div>
            </div>

            {/* Enhanced Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                { id: 'portfolio', label: 'Portfolio Overview', icon: PieChart, count: totalHoldings },
                { id: 'holdings', label: 'Holdings', icon: BarChart3, count: filteredHoldings.length },
                { id: 'research', label: 'Research', icon: BookOpen, count: 0 },
                { id: 'goals', label: 'Goals', icon: Target, count: investmentGoals.length },
                { id: 'analytics', label: 'Analytics', icon: Activity, count: 0 },
                { id: 'watchlist', label: 'Watchlist', icon: Heart, count: watchlist.length }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/10 text-white/90 hover:bg-white/20'
                      }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                {showBalances ? <EyeOff className="h-4 w-4 text-gray-600" /> : <Eye className="h-4 w-4 text-gray-600" />}
                <span>{showBalances ? 'Hide' : 'Show'} Balances</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <Calculator className="h-4 w-4 text-purple-600" />
                <span>Investment Calculator</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-sm">
                <Plus className="h-4 w-4" />
                <span>Buy Securities</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-6 border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { id: 'portfolio', label: 'Portfolio', icon: PieChart, count: totalHoldings },
            { id: 'research', label: 'Research', icon: BarChart3 },
            { id: 'goals', label: 'Goals', icon: Target, count: 3 },
            { id: 'analytics', label: 'Analytics', icon: LineChart },
            { id: 'watchlist', label: 'Watchlist', icon: Star, count: 12 }
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

        {/* Enhanced Portfolio Summary */ }
  {
    activeTab === 'portfolio' && (
      <>
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {showBalances ? formatCurrency(totalPortfolioValue) : '••••••'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalHoldings} holdings • {mockInvestmentAccounts.length} accounts
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                  <PieChart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
                  <p className={`text-2xl font-bold ${getChangeColor(totalGainLoss)}`}>
                    {showBalances ? formatCurrency(totalGainLoss) : '••••••'}
                  </p>
                  <p className={`text-xs ${getChangeColor(totalGainLoss)} font-medium`}>
                    {showBalances ? formatPercent(totalGainLossPercent) : '••••'} overall return
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${totalGainLoss >= 0 ? 'bg-gradient-to-br from-green-100 to-green-200' : 'bg-gradient-to-br from-red-100 to-red-200'}`}>
                  <TrendingUp className={`h-6 w-6 ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Change</p>
                  <p className={`text-2xl font-bold ${getChangeColor(totalDayChange)}`}>
                    {showBalances ? formatCurrency(totalDayChange) : '••••••'}
                  </p>
                  <p className={`text-xs ${getChangeColor(totalDayChange)} font-medium`}>
                    {showBalances ? formatPercent(totalDayChangePercent) : '••••'} today
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${totalDayChange >= 0 ? 'bg-gradient-to-br from-emerald-100 to-emerald-200' : 'bg-gradient-to-br from-orange-100 to-orange-200'}`}>
                  {totalDayChange >= 0 ? (
                    <ArrowUpRight className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-6 w-6 text-orange-600" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Cash</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {showBalances ? formatCurrency(totalCashBalance) : '••••••'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {((totalCashBalance / totalPortfolioValue) * 100).toFixed(1)}% of portfolio
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                  <Wallet className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Allocation */}
          <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Portfolio Allocation
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Stocks', value: portfolioAllocation.stocks, color: 'bg-blue-500', textColor: 'text-blue-600' },
                { label: 'ETFs', value: portfolioAllocation.etfs, color: 'bg-green-500', textColor: 'text-green-600' },
                { label: 'Bonds', value: portfolioAllocation.bonds, color: 'bg-purple-500', textColor: 'text-purple-600' },
                { label: 'Cash', value: portfolioAllocation.cash, color: 'bg-gray-500', textColor: 'text-gray-600' }
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 mx-auto rounded-full border-4 border-gray-200 flex items-center justify-center">
                      <span className={`text-sm font-bold ${item.textColor}`}>{item.value}%</span>
                    </div>
                    <div
                      className={`absolute inset-0 rounded-full ${item.color} opacity-20`}
                      style={{ clipPath: `polygon(50% 50%, 50% 0%, ${50 + (item.value / 100) * 50}% 0%, 50% 50%)` }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">
                    {showBalances ? formatCurrency((totalPortfolioValue * item.value) / 100) : '••••••'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { icon: Plus, label: 'Buy', color: 'blue', action: () => { } },
              { icon: TrendingDown, label: 'Sell', color: 'red', action: () => { } },
              { icon: Calculator, label: 'Calculate', color: 'green', action: () => { } },
              { icon: BarChart3, label: 'Research', color: 'purple', action: () => setActiveTab('research') },
              { icon: Target, label: 'Goals', color: 'indigo', action: () => setActiveTab('goals') },
              { icon: Star, label: 'Watchlist', color: 'orange', action: () => setActiveTab('watchlist') },
              { icon: Download, label: 'Export', color: 'gray', action: () => { } },
              { icon: Bell, label: 'Alerts', color: 'teal', action: () => { } }
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
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search holdings by symbol, name, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="stock">Stocks</option>
                <option value="etf">ETFs</option>
                <option value="mutual_fund">Mutual Funds</option>
                <option value="bond">Bonds</option>
              </select>

              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Accounts</option>
                {mockInvestmentAccounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="value">Sort by Value</option>
                <option value="gainLoss">Sort by Gain/Loss</option>
                <option value="dayChange">Sort by Day Change</option>
                <option value="symbol">Sort by Symbol</option>
              </select>

              <button
                onClick={() => setViewMode(viewMode === 'holdings' ? 'performance' : 'holdings')}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>{viewMode === 'holdings' ? 'Performance' : 'Holdings'}</span>
              </button>

              <button className="px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Advanced</span>
              </button>
            </div>
          </div>

          {/* Filter Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {filterType !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                Type: {filterType.replace('_', ' ')}
                <button
                  onClick={() => setFilterType('all')}
                  className="ml-2 hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            )}
            {selectedAccount !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                Account: {mockInvestmentAccounts.find(a => a.id === selectedAccount)?.name}
                <button
                  onClick={() => setSelectedAccount('all')}
                  className="ml-2 hover:text-green-600"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 hover:text-purple-600"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Enhanced Holdings Display */}
        {viewMode === 'holdings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Holdings Overview
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredHoldings.length} securities)
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Security
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shares
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Day Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Gain/Loss
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yield
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHoldings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {holding.symbol.slice(0, 2)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <div className="text-sm font-medium text-gray-900">{holding.symbol}</div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${holding.type === 'stock' ? 'bg-blue-100 text-blue-800' :
                                    holding.type === 'etf' ? 'bg-green-100 text-green-800' :
                                      holding.type === 'mutual_fund' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                  }`}>
                                  {holding.type.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{holding.name}</div>
                              <div className="text-xs text-gray-400">{(holding as any).accountName}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {holding.shares.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">shares</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {showBalances ? formatCurrency(holding.currentPrice) : '••••'}
                        </div>
                        <div className="text-xs text-gray-500">current</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {showBalances ? formatCurrency(holding.marketValue) : '••••••'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {((holding.marketValue / totalPortfolioValue) * 100).toFixed(1)}% of portfolio
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center ${getChangeColor(holding.dayChange)}`}>
                          {getChangeIcon(holding.dayChange)}
                          <div className="ml-1">
                            <div className="text-sm font-medium">
                              {showBalances ? formatCurrency(holding.dayChange) : '••••'}
                            </div>
                            <div className="text-xs">
                              ({showBalances ? formatPercent(holding.dayChangePercent) : '••••'})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center ${getChangeColor(holding.gainLoss)}`}>
                          {getChangeIcon(holding.gainLoss)}
                          <div className="ml-1">
                            <div className="text-sm font-medium">
                              {showBalances ? formatCurrency(holding.gainLoss) : '••••'}
                            </div>
                            <div className="text-xs">
                              ({showBalances ? formatPercent(holding.gainLossPercent) : '••••'})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {holding.dividendYield ? `${holding.dividendYield.toFixed(2)}%` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">dividend</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-green-600 hover:text-green-900 px-3 py-1 text-sm font-medium border border-green-300 rounded hover:bg-green-50 transition-colors">
                            Buy
                          </button>
                          <button className="text-red-600 hover:text-red-900 px-3 py-1 text-sm font-medium border border-red-300 rounded hover:bg-red-50 transition-colors">
                            Sell
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enhanced Performance View */}
        {viewMode === 'performance' && (
          <div className="space-y-6">
            {mockInvestmentAccounts.map((account) => (
              <div key={account.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                        {account.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize mt-1">
                        {account.type.replace('_', ' ')} Account
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {showBalances ? formatCurrency(account.totalValue) : '••••••'}
                      </p>
                      <div className={`flex items-center justify-end ${getChangeColor(account.gainLoss)}`}>
                        {getChangeIcon(account.gainLoss)}
                        <span className="text-sm font-medium ml-1">
                          {showBalances ? formatCurrency(account.gainLoss) : '••••'}
                        </span>
                        <span className="text-sm ml-1">
                          ({showBalances ? formatPercent(account.gainLossPercent) : '••••'})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900">Cash Balance</p>
                      <p className="text-xl font-bold text-blue-900 mt-1">
                        {showBalances ? formatCurrency(account.cashBalance) : '••••••'}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">Available to invest</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-900">Invested Amount</p>
                      <p className="text-xl font-bold text-green-900 mt-1">
                        {showBalances ? formatCurrency(account.investedAmount) : '••••••'}
                      </p>
                      <p className="text-xs text-green-700 mt-1">Cost basis</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                      <p className="text-sm font-medium text-orange-900">Today's Change</p>
                      <div className={`${getChangeColor(account.dayChange)} mt-1`}>
                        <p className="text-xl font-bold">
                          {showBalances ? formatCurrency(account.dayChange) : '••••••'}
                        </p>
                        <p className="text-xs mt-1">
                          ({showBalances ? formatPercent(account.dayChangePercent) : '••••'})
                        </p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                      <p className="text-sm font-medium text-purple-900">Holdings</p>
                      <p className="text-xl font-bold text-purple-900 mt-1">{account.holdings.length}</p>
                      <p className="text-xs text-purple-700 mt-1">Securities</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  {/* Modern Footer with Investment Actions */ }
  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <ChevronRight className="h-5 w-5 opacity-70" />
        </div>
        <h3 className="text-lg font-bold mb-2">Market Research</h3>
        <p className="text-blue-100 text-sm mb-4">
          Get insights on market trends and investment opportunities
        </p>
        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Explore Markets
        </button>
      </div>
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
    </div>

    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Target className="h-6 w-6" />
          </div>
          <ChevronRight className="h-5 w-5 opacity-70" />
        </div>
        <h3 className="text-lg font-bold mb-2">Investment Goals</h3>
        <p className="text-green-100 text-sm mb-4">
          Set and track your financial goals with AI-powered recommendations
        </p>
        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Set Goals
        </button>
      </div>
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
    </div>

    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Calculator className="h-6 w-6" />
          </div>
          <ChevronRight className="h-5 w-5 opacity-70" />
        </div>
        <h3 className="text-lg font-bold mb-2">Portfolio Analysis</h3>
        <p className="text-purple-100 text-sm mb-4">
          Advanced analytics and risk assessment for your portfolio
        </p>
        <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Analyze Portfolio
        </button>
      </div>
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full"></div>
    </div>
  </div>
      </div >
    </div >
  );
}
