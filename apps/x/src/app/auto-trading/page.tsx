"use client";

import React, { useState } from 'react';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Clock, 
  DollarSign, 
  Target, 
  Shield, 
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  Copy,
  BarChart3,
  Activity,
  Brain,
  Filter,
  Search,
  ChevronDown,
  Info,
  RotateCcw,
  CheckCircle,
  XCircle,
  Pause as PauseIcon
} from 'lucide-react';

interface TradingBot {
  id: string;
  name: string;
  strategy: string;
  status: 'active' | 'paused' | 'stopped';
  profit: number;
  profitPercent: number;
  trades: number;
  winRate: number;
  balance: number;
  created: string;
  lastTrade: string;
  riskLevel: 'low' | 'medium' | 'high';
  exchange: string;
  pairs: string[];
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'grid' | 'dca' | 'scalping' | 'swing' | 'arbitrage' | 'ai';
  riskLevel: 'low' | 'medium' | 'high';
  minBalance: number;
  avgReturn: number;
  timeframe: string;
  popularity: number;
}

const AutoTradingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bots' | 'strategies' | 'performance' | 'settings'>('bots');
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'stopped'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateBot, setShowCreateBot] = useState(false);

  // Mock data for trading bots
  const tradingBots: TradingBot[] = [
    {
      id: 'bot-1',
      name: 'BTC Grid Trader',
      strategy: 'Grid Trading',
      status: 'active',
      profit: 2847.50,
      profitPercent: 15.2,
      trades: 147,
      winRate: 73.5,
      balance: 21500.00,
      created: '2024-01-15',
      lastTrade: '2 minutes ago',
      riskLevel: 'medium',
      exchange: 'Binance',
      pairs: ['BTC/USDT']
    },
    {
      id: 'bot-2',
      name: 'AI Signal Hunter',
      strategy: 'AI Signals',
      status: 'active',
      profit: 1432.80,
      profitPercent: 8.7,
      trades: 89,
      winRate: 81.2,
      balance: 17950.00,
      created: '2024-01-20',
      lastTrade: '15 minutes ago',
      riskLevel: 'low',
      exchange: 'Coinbase',
      pairs: ['ETH/USD', 'BTC/USD']
    },
    {
      id: 'bot-3',
      name: 'DCA Accumulator',
      strategy: 'Dollar Cost Average',
      status: 'paused',
      profit: -124.30,
      profitPercent: -1.2,
      trades: 45,
      winRate: 68.9,
      balance: 9876.70,
      created: '2024-02-01',
      lastTrade: '2 hours ago',
      riskLevel: 'low',
      exchange: 'Binance',
      pairs: ['ETH/USDT', 'ADA/USDT']
    },
    {
      id: 'bot-4',
      name: 'Scalping Master',
      strategy: 'Scalping',
      status: 'active',
      profit: 892.40,
      profitPercent: 22.3,
      trades: 324,
      winRate: 59.3,
      balance: 4892.40,
      created: '2024-02-10',
      lastTrade: '30 seconds ago',
      riskLevel: 'high',
      exchange: 'eToro',
      pairs: ['EUR/USD', 'GBP/USD']
    }
  ];

  // Mock data for strategies
  const strategies: Strategy[] = [
    {
      id: 'strategy-1',
      name: 'Grid Trading Pro',
      description: 'Advanced grid trading with dynamic range adjustment',
      type: 'grid',
      riskLevel: 'medium',
      minBalance: 1000,
      avgReturn: 12.5,
      timeframe: '24/7',
      popularity: 85
    },
    {
      id: 'strategy-2',
      name: 'AI Pattern Detection',
      description: 'Machine learning powered pattern recognition and trading',
      type: 'ai',
      riskLevel: 'low',
      minBalance: 5000,
      avgReturn: 18.3,
      timeframe: '24/7',
      popularity: 92
    },
    {
      id: 'strategy-3',
      name: 'DCA Smart Buy',
      description: 'Dollar cost averaging with market timing optimization',
      type: 'dca',
      riskLevel: 'low',
      minBalance: 500,
      avgReturn: 8.7,
      timeframe: 'Daily',
      popularity: 78
    },
    {
      id: 'strategy-4',
      name: 'High-Frequency Scalp',
      description: 'Ultra-fast scalping for experienced traders',
      type: 'scalping',
      riskLevel: 'high',
      minBalance: 2000,
      avgReturn: 25.1,
      timeframe: 'Seconds',
      popularity: 67
    }
  ];

  const filteredBots = tradingBots.filter(bot => {
    const matchesStatus = filterStatus === 'all' || bot.status === filterStatus;
    const matchesSearch = bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bot.strategy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10';
      case 'paused': return 'text-yellow-400 bg-yellow-400/10';
      case 'stopped': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />;
      case 'paused': return <PauseIcon className="w-3 h-3" />;
      case 'stopped': return <XCircle className="w-3 h-3" />;
      default: return <XCircle className="w-3 h-3" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const renderBotsTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="appearance-none bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="stopped">Stopped</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>
        <button
          onClick={() => setShowCreateBot(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Create Bot</span>
        </button>
      </div>

      {/* Bot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBots.map((bot) => (
          <div
            key={bot.id}
            className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg">
                  <Bot className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{bot.name}</h3>
                  <p className="text-sm text-gray-400">{bot.strategy}</p>
                </div>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getStatusColor(bot.status)}`}>
                {getStatusIcon(bot.status)}
                <span className="text-xs font-medium capitalize">{bot.status}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400">Profit</p>
                <p className={`text-lg font-bold ${bot.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${bot.profit.toLocaleString()}
                </p>
                <p className={`text-xs ${bot.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {bot.profitPercent >= 0 ? '+' : ''}{bot.profitPercent}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Win Rate</p>
                <p className="text-lg font-bold text-white">{bot.winRate}%</p>
                <p className="text-xs text-gray-400">{bot.trades} trades</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Balance</span>
                <span className="text-white">${bot.balance.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Exchange</span>
                <span className="text-white">{bot.exchange}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Risk Level</span>
                <span className={`px-2 py-1 rounded ${getRiskColor(bot.riskLevel)} text-xs font-medium capitalize`}>
                  {bot.riskLevel}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Last Trade</span>
                <span className="text-white">{bot.lastTrade}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {bot.status === 'active' ? (
                <button className="flex-1 flex items-center justify-center space-x-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2 px-3 rounded-lg transition-colors duration-200">
                  <Pause className="w-4 h-4" />
                  <span className="text-sm">Pause</span>
                </button>
              ) : (
                <button className="flex-1 flex items-center justify-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-3 rounded-lg transition-colors duration-200">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Start</span>
                </button>
              )}
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
                <BarChart3 className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
                <Copy className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-gray-400">Active Bots</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {tradingBots.filter(bot => bot.status === 'active').length}
          </p>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400">Total Profit</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            ${tradingBots.reduce((sum, bot) => sum + bot.profit, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400">Avg Win Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {(tradingBots.reduce((sum, bot) => sum + bot.winRate, 0) / tradingBots.length).toFixed(1)}%
          </p>
        </div>
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-5 h-5 text-pink-400" />
            <span className="text-gray-400">Total Trades</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {tradingBots.reduce((sum, bot) => sum + bot.trades, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );

  const renderStrategiesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Available Strategies</h2>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200">
          <Plus className="w-4 h-4" />
          <span>Create Strategy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg">
                  <Brain className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{strategy.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">{strategy.type} Strategy</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded ${getRiskColor(strategy.riskLevel)} text-xs font-medium capitalize`}>
                {strategy.riskLevel} Risk
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4">{strategy.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-400">Avg Return</p>
                <p className="text-lg font-bold text-green-400">{strategy.avgReturn}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Min Balance</p>
                <p className="text-lg font-bold text-white">${strategy.minBalance.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Timeframe</span>
                <span className="text-white">{strategy.timeframe}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Popularity</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                      style={{ width: `${strategy.popularity}%` }}
                    />
                  </div>
                  <span className="text-white">{strategy.popularity}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 py-2 px-4 rounded-lg text-white font-medium transition-all duration-200">
                Use Strategy
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
                <Info className="w-4 h-4 text-gray-400" />
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
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                Auto Trading
              </h1>
              <p className="text-gray-400">Automated trading bots and strategies</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-black/20 p-1 rounded-xl w-fit">
          {[
            { id: 'bots', label: 'Trading Bots', icon: Bot },
            { id: 'strategies', label: 'Strategies', icon: Brain },
            { id: 'performance', label: 'Performance', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
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
        {activeTab === 'bots' && renderBotsTab()}
        {activeTab === 'strategies' && renderStrategiesTab()}
        {activeTab === 'performance' && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Performance Analytics</h3>
            <p className="text-gray-400">Detailed performance analytics coming soon</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Auto Trading Settings</h3>
            <p className="text-gray-400">Configure your automated trading preferences</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoTradingPage;
