"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity, 
  Calendar,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  PieChart,
  LineChart,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Percent,
  Calculator,
  Gauge,
  Award,
  TrendingUp as Growth,
  Users,
  Globe
} from 'lucide-react';

interface PortfolioMetrics {
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  weekChange: number;
  weekChangePercent: number;
  monthChange: number;
  monthChangePercent: number;
  yearChange: number;
  yearChangePercent: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}

interface AssetAllocation {
  asset: string;
  category: string;
  value: number;
  percentage: number;
  change: number;
  changePercent: number;
}

interface TradingActivity {
  date: string;
  trades: number;
  volume: number;
  pnl: number;
  winRate: number;
}

interface RiskMetrics {
  currentRisk: number;
  maxRisk: number;
  volatility: number;
  beta: number;
  var: number; // Value at Risk
  exposure: number;
}

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'risk' | 'allocation' | 'activity' | 'reports'>('overview');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M');
  const [showValues, setShowValues] = useState(true);

  // Mock data for portfolio metrics
  const portfolioMetrics: PortfolioMetrics = {
    totalValue: 487234.50,
    totalReturn: 89234.50,
    totalReturnPercent: 22.4,
    dayChange: 2845.67,
    dayChangePercent: 0.58,
    weekChange: 8967.23,
    weekChangePercent: 1.84,
    monthChange: 15432.89,
    monthChangePercent: 3.17,
    yearChange: 67891.45,
    yearChangePercent: 16.2,
    maxDrawdown: -8.7,
    sharpeRatio: 1.84,
    winRate: 73.5,
    totalTrades: 247,
    avgWin: 892.34,
    avgLoss: -456.78,
    profitFactor: 1.95
  };

  // Mock data for asset allocation
  const assetAllocation: AssetAllocation[] = [
    {
      asset: 'Bitcoin (BTC)',
      category: 'Crypto',
      value: 145670.25,
      percentage: 29.9,
      change: 4567.89,
      changePercent: 3.24
    },
    {
      asset: 'Apple (AAPL)',
      category: 'Tech Stocks',
      value: 97834.50,
      percentage: 20.1,
      change: 1234.56,
      changePercent: 1.28
    },
    {
      asset: 'Ethereum (ETH)',
      category: 'Crypto',
      value: 87456.75,
      percentage: 17.9,
      change: 2345.67,
      changePercent: 2.76
    },
    {
      asset: 'Tesla (TSLA)',
      category: 'Tech Stocks',
      value: 68234.90,
      percentage: 14.0,
      change: -789.12,
      changePercent: -1.14
    },
    {
      asset: 'NVIDIA (NVDA)',
      category: 'Tech Stocks',
      value: 54789.30,
      percentage: 11.2,
      change: 3456.78,
      changePercent: 6.74
    },
    {
      asset: 'Cash & Others',
      category: 'Cash',
      value: 33248.80,
      percentage: 6.9,
      change: 0,
      changePercent: 0
    }
  ];

  // Mock data for trading activity
  const tradingActivity: TradingActivity[] = [
    { date: '2024-08-07', trades: 12, volume: 45670, pnl: 1234.56, winRate: 75.0 },
    { date: '2024-08-06', trades: 8, volume: 32450, pnl: 567.89, winRate: 62.5 },
    { date: '2024-08-05', trades: 15, volume: 67890, pnl: 2345.67, winRate: 80.0 },
    { date: '2024-08-04', trades: 6, volume: 23450, pnl: -456.78, winRate: 33.3 },
    { date: '2024-08-03', trades: 10, volume: 54320, pnl: 1789.23, winRate: 70.0 },
    { date: '2024-08-02', trades: 18, volume: 78900, pnl: 3456.78, winRate: 83.3 },
    { date: '2024-08-01', trades: 14, volume: 56780, pnl: 987.65, winRate: 64.3 }
  ];

  // Mock data for risk metrics
  const riskMetrics: RiskMetrics = {
    currentRisk: 6.2,
    maxRisk: 8.5,
    volatility: 18.7,
    beta: 1.23,
    var: 12450.89,
    exposure: 85.4
  };

  const formatCurrency = (value: number, hideValue = false) => {
    if (hideValue) return '****';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getRiskColor = (risk: number) => {
    if (risk < 4) return 'text-green-400';
    if (risk < 7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400">Portfolio Value</span>
            </div>
            <button
              onClick={() => setShowValues(!showValues)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              {showValues ? <Eye className="w-4 h-4 text-gray-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(portfolioMetrics.totalValue, !showValues)}
          </p>
          <p className={`text-sm ${getChangeColor(portfolioMetrics.dayChangePercent)}`}>
            {formatPercent(portfolioMetrics.dayChangePercent)} today
          </p>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-gray-400">Total Return</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {showValues ? formatCurrency(portfolioMetrics.totalReturn) : '****'}
          </p>
          <p className="text-sm text-green-400">
            {formatPercent(portfolioMetrics.totalReturnPercent)} all time
          </p>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400">Win Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">{portfolioMetrics.winRate}%</p>
          <p className="text-sm text-gray-400">{portfolioMetrics.totalTrades} trades</p>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Gauge className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-400">Sharpe Ratio</span>
          </div>
          <p className="text-2xl font-bold text-white">{portfolioMetrics.sharpeRatio}</p>
          <p className="text-sm text-gray-400">Risk-adjusted return</p>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Portfolio Performance</h3>
          <div className="flex items-center space-x-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-pink-500/50"
            >
              <option value="1D">1D</option>
              <option value="1W">1W</option>
              <option value="1M">1M</option>
              <option value="3M">3M</option>
              <option value="1Y">1Y</option>
              <option value="ALL">ALL</option>
            </select>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg">
          <div className="text-center">
            <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Performance chart visualization</p>
            <p className="text-sm text-gray-500">Chart component will be implemented here</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <h4 className="text-white font-medium mb-4">Period Returns</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">1 Day</span>
              <span className={getChangeColor(portfolioMetrics.dayChangePercent)}>
                {formatPercent(portfolioMetrics.dayChangePercent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">1 Week</span>
              <span className={getChangeColor(portfolioMetrics.weekChangePercent)}>
                {formatPercent(portfolioMetrics.weekChangePercent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">1 Month</span>
              <span className={getChangeColor(portfolioMetrics.monthChangePercent)}>
                {formatPercent(portfolioMetrics.monthChangePercent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">1 Year</span>
              <span className={getChangeColor(portfolioMetrics.yearChangePercent)}>
                {formatPercent(portfolioMetrics.yearChangePercent)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <h4 className="text-white font-medium mb-4">Risk Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Risk</span>
              <span className={getRiskColor(riskMetrics.currentRisk)}>
                {riskMetrics.currentRisk}/10
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Drawdown</span>
              <span className="text-red-400">{formatPercent(portfolioMetrics.maxDrawdown)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Volatility</span>
              <span className="text-white">{riskMetrics.volatility}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Beta</span>
              <span className="text-white">{riskMetrics.beta}</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <h4 className="text-white font-medium mb-4">Trading Stats</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Win</span>
              <span className="text-green-400">{formatCurrency(portfolioMetrics.avgWin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Loss</span>
              <span className="text-red-400">{formatCurrency(portfolioMetrics.avgLoss)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Profit Factor</span>
              <span className="text-white">{portfolioMetrics.profitFactor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Trades</span>
              <span className="text-white">{portfolioMetrics.totalTrades}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAllocationTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Asset Allocation</h2>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Download className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Allocation Chart Placeholder */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg">
          <div className="text-center">
            <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Asset allocation pie chart</p>
            <p className="text-sm text-gray-500">Chart component will be implemented here</p>
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Holdings Breakdown</h3>
        <div className="space-y-4">
          {assetAllocation.map((asset, index) => (
            <div key={index} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{asset.asset}</h4>
                  <p className="text-sm text-gray-400">{asset.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">
                  {showValues ? formatCurrency(asset.value) : '****'}
                </p>
                <p className="text-sm text-gray-400">{asset.percentage}%</p>
              </div>
              <div className="text-right min-w-[80px]">
                <p className={`font-medium ${getChangeColor(asset.changePercent)}`}>
                  {formatPercent(asset.changePercent)}
                </p>
                <p className={`text-sm ${getChangeColor(asset.change)}`}>
                  {asset.change >= 0 ? '+' : ''}{formatCurrency(asset.change)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Trading Activity</h2>
        <div className="flex items-center space-x-2">
          <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-pink-500/50">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Activity Chart Placeholder */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Trading Volume</h3>
        <div className="h-64 flex items-center justify-center border border-white/10 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Trading activity chart</p>
            <p className="text-sm text-gray-500">Chart component will be implemented here</p>
          </div>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 font-medium py-3">Date</th>
                <th className="text-left text-gray-400 font-medium py-3">Trades</th>
                <th className="text-left text-gray-400 font-medium py-3">Volume</th>
                <th className="text-left text-gray-400 font-medium py-3">P&L</th>
                <th className="text-left text-gray-400 font-medium py-3">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {tradingActivity.map((activity, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 text-white">{activity.date}</td>
                  <td className="py-3 text-white">{activity.trades}</td>
                  <td className="py-3 text-white">${activity.volume.toLocaleString()}</td>
                  <td className={`py-3 font-medium ${getChangeColor(activity.pnl)}`}>
                    {activity.pnl >= 0 ? '+' : ''}{formatCurrency(activity.pnl)}
                  </td>
                  <td className="py-3 text-white">{activity.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-gray-400">Comprehensive trading performance analysis</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-black/20 p-1 rounded-xl w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'risk', label: 'Risk', icon: Shield },
            { id: 'allocation', label: 'Allocation', icon: PieChart },
            { id: 'activity', label: 'Activity', icon: BarChart3 },
            { id: 'reports', label: 'Reports', icon: Download }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'performance' && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Performance Analysis</h3>
            <p className="text-gray-400">Detailed performance metrics coming soon</p>
          </div>
        )}
        {activeTab === 'risk' && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Risk Analysis</h3>
            <p className="text-gray-400">Risk management tools coming soon</p>
          </div>
        )}
        {activeTab === 'allocation' && renderAllocationTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Reports</h3>
            <p className="text-gray-400">Generate and download detailed reports</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
