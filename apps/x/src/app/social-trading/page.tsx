"use client";

import React, { useState } from 'react';
import {
  Users,
  Star,
  Copy,
  TrendingUp,
  TrendingDown,
  Eye,
  DollarSign,
  Target,
  Activity,
  Award,
  Filter,
  Search,
  ChevronDown,
  UserPlus,
  UserMinus,
  MessageCircle,
  Heart,
  Share2,
  BarChart3,
  Calendar,
  Clock,
  Zap,
  Shield,
  Crown,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Flag,
  Settings
} from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  rank: number;
  followers: number;
  following: number;
  totalReturn: number;
  monthlyReturn: number;
  winRate: number;
  totalTrades: number;
  avgHoldTime: string;
  riskScore: number;
  copiers: number;
  aum: number; // Assets Under Management
  joinDate: string;
  lastActive: string;
  badges: string[];
  bio: string;
  strategy: string;
  minCopyAmount: number;
  maxCopyAmount: number;
  status: 'online' | 'offline';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface Trade {
  id: string;
  traderId: string;
  traderName: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  profit: number;
  profitPercent: number;
  timestamp: string;
  status: 'open' | 'closed';
  likes: number;
  comments: number;
}

interface CopyPosition {
  id: string;
  traderId: string;
  traderName: string;
  allocation: number;
  profit: number;
  profitPercent: number;
  startDate: string;
  status: 'active' | 'paused' | 'stopped';
  trades: number;
}

const SocialTradingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discover' | 'following' | 'copy-trading' | 'leaderboard' | 'feed'>('discover');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterReturn, setFilterReturn] = useState<'all' | '1m' | '3m' | '6m' | '1y'>('all');
  const [sortBy, setSortBy] = useState<'return' | 'followers' | 'winrate' | 'aum'>('return');

  // Mock data for top traders
  const topTraders: Trader[] = [
    {
      id: 'trader-1',
      name: 'Alex Chen',
      username: '@alexchen',
      avatar: '👨‍💼',
      verified: true,
      rank: 1,
      followers: 15420,
      following: 234,
      totalReturn: 287.5,
      monthlyReturn: 23.8,
      winRate: 78.5,
      totalTrades: 1247,
      avgHoldTime: '3.2 days',
      riskScore: 6.8,
      copiers: 892,
      aum: 2450000,
      joinDate: '2023-01-15',
      lastActive: '2 minutes ago',
      badges: ['Top Performer', 'Verified Trader', 'AI Expert'],
      bio: 'Professional trader specializing in tech stocks and crypto. 5+ years experience.',
      strategy: 'Growth + Technical Analysis',
      minCopyAmount: 100,
      maxCopyAmount: 50000,
      status: 'online',
      tier: 'platinum'
    },
    {
      id: 'trader-2',
      name: 'Sarah Johnson',
      username: '@sarahj',
      avatar: '👩‍💼',
      verified: true,
      rank: 2,
      followers: 12890,
      following: 189,
      totalReturn: 234.7,
      monthlyReturn: 18.2,
      winRate: 82.1,
      totalTrades: 896,
      avgHoldTime: '5.7 days',
      riskScore: 4.2,
      copiers: 743,
      aum: 1890000,
      joinDate: '2023-03-22',
      lastActive: '15 minutes ago',
      badges: ['Conservative Pro', 'Verified Trader', 'Risk Manager'],
      bio: 'Conservative investor focused on sustainable long-term growth.',
      strategy: 'Value Investing + Risk Management',
      minCopyAmount: 250,
      maxCopyAmount: 25000,
      status: 'online',
      tier: 'gold'
    },
    {
      id: 'trader-3',
      name: 'Mike Rodriguez',
      username: '@mikerod',
      avatar: '👨‍💻',
      verified: false,
      rank: 3,
      followers: 8945,
      following: 312,
      totalReturn: 189.3,
      monthlyReturn: 15.6,
      winRate: 74.3,
      totalTrades: 2156,
      avgHoldTime: '1.8 days',
      riskScore: 8.1,
      copiers: 567,
      aum: 1240000,
      joinDate: '2023-06-10',
      lastActive: '1 hour ago',
      badges: ['Day Trader', 'High Volume'],
      bio: 'Active day trader focusing on momentum and volatility strategies.',
      strategy: 'Momentum + Scalping',
      minCopyAmount: 500,
      maxCopyAmount: 10000,
      status: 'offline',
      tier: 'silver'
    }
  ];

  // Mock data for recent trades
  const recentTrades: Trade[] = [
    {
      id: 'trade-1',
      traderId: 'trader-1',
      traderName: 'Alex Chen',
      symbol: 'NVDA',
      type: 'buy',
      amount: 1500,
      price: 1247.80,
      profit: 245.67,
      profitPercent: 16.4,
      timestamp: '2 minutes ago',
      status: 'open',
      likes: 24,
      comments: 8
    },
    {
      id: 'trade-2',
      traderId: 'trader-2',
      traderName: 'Sarah Johnson',
      symbol: 'AAPL',
      type: 'sell',
      amount: 2000,
      price: 185.45,
      profit: 89.23,
      profitPercent: 4.8,
      timestamp: '15 minutes ago',
      status: 'closed',
      likes: 18,
      comments: 5
    },
    {
      id: 'trade-3',
      traderId: 'trader-3',
      traderName: 'Mike Rodriguez',
      symbol: 'TSLA',
      type: 'buy',
      amount: 800,
      price: 267.90,
      profit: -23.45,
      profitPercent: -2.9,
      timestamp: '45 minutes ago',
      status: 'open',
      likes: 12,
      comments: 3
    }
  ];

  // Mock data for copy positions
  const copyPositions: CopyPosition[] = [
    {
      id: 'copy-1',
      traderId: 'trader-1',
      traderName: 'Alex Chen',
      allocation: 5000,
      profit: 845.67,
      profitPercent: 16.9,
      startDate: '2024-01-15',
      status: 'active',
      trades: 23
    },
    {
      id: 'copy-2',
      traderId: 'trader-2',
      traderName: 'Sarah Johnson',
      allocation: 3000,
      profit: 267.89,
      profitPercent: 8.9,
      startDate: '2024-02-01',
      status: 'active',
      trades: 15
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'from-purple-500 to-pink-500';
      case 'gold': return 'from-yellow-500 to-orange-500';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'bronze': return 'from-orange-600 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="w-4 h-4" />;
      case 'gold': return <Award className="w-4 h-4" />;
      case 'silver': return <Star className="w-4 h-4" />;
      case 'bronze': return <Shield className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const renderDiscoverTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search traders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value as any)}
              className="appearance-none bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
            >
              <option value="all">All Risk</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
            <select
              value={filterReturn}
              onChange={(e) => setFilterReturn(e.target.value as any)}
              className="appearance-none bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
            >
              <option value="all">All Time</option>
              <option value="1m">1 Month</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-pink-500/50"
            >
              <option value="return">Sort by Return</option>
              <option value="followers">Sort by Followers</option>
              <option value="winrate">Sort by Win Rate</option>
              <option value="aum">Sort by AUM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Traders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {topTraders.map((trader) => (
          <div
            key={trader.id}
            className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center text-2xl">
                    {trader.avatar}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${trader.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-medium">{trader.name}</h3>
                    {trader.verified && <CheckCircle className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-sm text-gray-400">{trader.username}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r ${getTierColor(trader.tier)}`}>
                {getTierIcon(trader.tier)}
                <span className="text-xs font-medium text-white capitalize">{trader.tier}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400">Total Return</p>
                <p className="text-lg font-bold text-green-400">+{trader.totalReturn}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Monthly Return</p>
                <p className="text-lg font-bold text-green-400">+{trader.monthlyReturn}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Win Rate</p>
                <p className="text-lg font-bold text-white">{trader.winRate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Followers</p>
                <p className="text-lg font-bold text-white">{trader.followers.toLocaleString()}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">AUM</span>
                <span className="text-white">${(trader.aum / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Copiers</span>
                <span className="text-white">{trader.copiers.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Risk Score</span>
                <span className={`${trader.riskScore < 5 ? 'text-green-400' : trader.riskScore < 7 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {trader.riskScore}/10
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1 mb-4">
              {trader.badges.slice(0, 2).map((badge, index) => (
                <span key={index} className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded-full">
                  {badge}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 py-2 px-4 rounded-lg text-white font-medium transition-all duration-200">
                <Copy className="w-4 h-4 inline mr-2" />
                Copy Trader
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
                <UserPlus className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
                <MessageCircle className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeedTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Trading Feed</h2>

      <div className="space-y-4">
        {recentTrades.map((trade) => (
          <div
            key={trade.id}
            className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{trade.traderName}</h3>
                  <p className="text-sm text-gray-400">{trade.timestamp}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${trade.type === 'buy' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                }`}>
                {trade.type === 'buy' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span className="text-xs font-medium uppercase">{trade.type}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400">Symbol</p>
                <p className="text-lg font-bold text-white">{trade.symbol}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Amount</p>
                <p className="text-lg font-bold text-white">${trade.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Price</p>
                <p className="text-lg font-bold text-white">${trade.price}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">P&L</p>
                <p className={`text-lg font-bold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                </p>
                <p className={`text-xs ${trade.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({trade.profitPercent >= 0 ? '+' : ''}{trade.profitPercent}%)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-gray-400 hover:text-pink-400 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{trade.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{trade.comments}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-400 hover:text-green-400 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${trade.status === 'open'
                  ? 'bg-blue-400/10 text-blue-400'
                  : 'bg-gray-400/10 text-gray-400'
                }`}>
                {trade.status.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCopyTradingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">My Copy Trading</h2>
        <button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200">
          Find Traders
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Copy className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400">Active Copies</span>
          </div>
          <p className="text-2xl font-bold text-white">{copyPositions.length}</p>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-gray-400">Total Allocated</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${copyPositions.reduce((sum, pos) => sum + pos.allocation, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400">Total P&L</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            +${copyPositions.reduce((sum, pos) => sum + pos.profit, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Copy Positions */}
      <div className="space-y-4">
        {copyPositions.map((position) => (
          <div
            key={position.id}
            className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{position.traderName}</h3>
                  <p className="text-sm text-gray-400">Started {position.startDate}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${position.status === 'active' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                }`}>
                {position.status.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400">Allocation</p>
                <p className="text-lg font-bold text-white">${position.allocation.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">P&L</p>
                <p className={`text-lg font-bold ${position.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {position.profit >= 0 ? '+' : ''}${position.profit.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Return</p>
                <p className={`text-lg font-bold ${position.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {position.profitPercent >= 0 ? '+' : ''}{position.profitPercent}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Trades</p>
                <p className="text-lg font-bold text-white">{position.trades}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors duration-200">
                Pause
              </button>
              <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200">
                Stop
              </button>
              <button className="px-4 py-2 hover:bg-white/10 text-gray-400 rounded-lg transition-colors duration-200">
                Settings
              </button>
              <button className="px-4 py-2 hover:bg-white/10 text-gray-400 rounded-lg transition-colors duration-200">
                View Trader
              </button>
            </div>
          </div>
        ))}
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
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Social Trading
              </h1>
              <p className="text-gray-400">Copy successful traders and build your network</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-black/20 p-1 rounded-xl w-fit">
          {[
            { id: 'discover', label: 'Discover', icon: Globe },
            { id: 'following', label: 'Following', icon: UserPlus },
            { id: 'copy-trading', label: 'Copy Trading', icon: Copy },
            { id: 'leaderboard', label: 'Leaderboard', icon: Award },
            { id: 'feed', label: 'Feed', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === tab.id
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
        {activeTab === 'discover' && renderDiscoverTab()}
        {activeTab === 'following' && (
          <div className="text-center py-12">
            <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Following</h3>
            <p className="text-gray-400">Traders you follow will appear here</p>
          </div>
        )}
        {activeTab === 'copy-trading' && renderCopyTradingTab()}
        {activeTab === 'leaderboard' && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Leaderboard</h3>
            <p className="text-gray-400">Top trader rankings coming soon</p>
          </div>
        )}
        {activeTab === 'feed' && renderFeedTab()}
      </div>
    </div>
  );
};

export default SocialTradingPage;
