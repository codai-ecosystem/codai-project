'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Mail, Share2, Target, BarChart3,
  Rocket, Calendar, DollarSign, Eye, MessageSquare,
  Heart, ArrowUpRight, Filter, RefreshCw, Download,
  Play, Pause, Settings, Bell, Search, Plus
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'ads' | 'content';
  status: 'active' | 'paused' | 'completed' | 'draft';
  reach: number;
  engagement: number;
  conversions: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
}

interface Metric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
}

export default function MarketAIDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCampaigns([
        {
          id: '1',
          name: 'Summer Product Launch',
          type: 'email',
          status: 'active',
          reach: 45000,
          engagement: 12.5,
          conversions: 890,
          budget: 15000,
          spent: 8750,
          startDate: '2024-01-15',
          endDate: '2024-02-15'
        },
        {
          id: '2',
          name: 'Social Media Boost',
          type: 'social',
          status: 'active',
          reach: 125000,
          engagement: 8.3,
          conversions: 2150,
          budget: 25000,
          spent: 18500,
          startDate: '2024-01-10',
          endDate: '2024-02-10'
        },
        {
          id: '3',
          name: 'Google Ads Campaign',
          type: 'ads',
          status: 'paused',
          reach: 89000,
          engagement: 15.2,
          conversions: 1750,
          budget: 30000,
          spent: 22100,
          startDate: '2024-01-05',
          endDate: '2024-02-05'
        },
        {
          id: '4',
          name: 'Content Marketing Series',
          type: 'content',
          status: 'draft',
          reach: 0,
          engagement: 0,
          conversions: 0,
          budget: 12000,
          spent: 0,
          startDate: '2024-02-01',
          endDate: '2024-03-01'
        }
      ]);

      setLoading(false);
    };

    loadData();
  }, [timeRange]);

  const metrics: Metric[] = [
    {
      label: 'Total Reach',
      value: '259K',
      change: '+15.3%',
      trend: 'up',
      icon: Users
    },
    {
      label: 'Engagement Rate',
      value: '12.1%',
      change: '+2.4%',
      trend: 'up',
      icon: Heart
    },
    {
      label: 'Conversions',
      value: '4,790',
      change: '+8.7%',
      trend: 'up',
      icon: Target
    },
    {
      label: 'Revenue',
      value: '$125.4K',
      change: '+12.8%',
      trend: 'up',
      icon: DollarSign
    },
    {
      label: 'ROI',
      value: '3.8x',
      change: '+0.5x',
      trend: 'up',
      icon: TrendingUp
    },
    {
      label: 'Click Rate',
      value: '6.3%',
      change: '-0.2%',
      trend: 'down',
      icon: Eye
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'campaigns', label: 'Campaigns', icon: Rocket, href: '/campaigns' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/analytics' },
    { id: 'audience', label: 'Audience', icon: Users, href: '/audience' },
    { id: 'content', label: 'Content', icon: MessageSquare, href: '/content' },
    { id: 'automation', label: 'Automation', icon: Settings, href: '/automation' }
  ];

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: Campaign['type']) => {
    switch (type) {
      case 'email': return Mail;
      case 'social': return Share2;
      case 'ads': return Target;
      case 'content': return MessageSquare;
      default: return Rocket;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-purple-100/50 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    MarketAI
                  </h1>
                  <p className="text-sm text-gray-600">Marketing Automation Platform</p>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-2 ml-8">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50"
                />
              </div>

              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              {/* Action Buttons */}
              <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Campaign</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-1 mt-6 bg-gray-100/50 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedTab === tab.id;

              if (tab.href) {
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${isActive
                        ? 'bg-white text-purple-600 shadow-md'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${isActive
                      ? 'bg-white text-purple-600 shadow-md'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-purple-100/50 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.trend === 'up' ? 'from-green-500 to-emerald-600' :
                          metric.trend === 'down' ? 'from-red-500 to-rose-600' :
                            'from-gray-500 to-slate-600'
                        } flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className={`flex items-center space-x-1 text-sm ${metric.trend === 'up' ? 'text-green-600' :
                          metric.trend === 'down' ? 'text-red-600' :
                            'text-gray-600'
                        }`}>
                        <ArrowUpRight className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''
                          }`} />
                        <span>{metric.change}</span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                    <p className="text-sm text-gray-600">{metric.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Active Campaigns */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50">
              <div className="p-6 border-b border-purple-100/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Active Campaigns</h2>
                    <p className="text-sm text-gray-600 mt-1">Manage your marketing campaigns</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign, index) => {
                      const Icon = getTypeIcon(campaign.type);
                      return (
                        <motion.div
                          key={campaign.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                                <Icon className="w-6 h-6 text-purple-600" />
                              </div>

                              <div>
                                <div className="flex items-center space-x-3">
                                  <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(campaign.status)}`}></div>
                                  <span className="text-sm text-gray-600 capitalize">{campaign.status}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {campaign.startDate} - {campaign.endDate}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6">
                              <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">
                                  {campaign.reach.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600">Reach</p>
                              </div>

                              <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">
                                  {campaign.engagement}%
                                </p>
                                <p className="text-xs text-gray-600">Engagement</p>
                              </div>

                              <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">
                                  {campaign.conversions.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600">Conversions</p>
                              </div>

                              <div className="text-center">
                                <p className="text-lg font-bold text-gray-900">
                                  ${campaign.spent.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-600">Spent</p>
                              </div>

                              <div className="flex items-center space-x-2">
                                {campaign.status === 'active' ? (
                                  <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                                    <Pause className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                    <Play className="w-4 h-4" />
                                  </button>
                                )}
                                <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                  <Settings className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation to other sections */}
        {selectedTab === 'campaigns' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Campaign Management</h3>
            <p className="text-gray-600 mb-4">
              Create, manage, and optimize your marketing campaigns with advanced analytics.
            </p>
            <a
              href="/campaigns"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <Rocket className="w-5 h-5" />
              <span>Go to Campaigns</span>
            </a>
          </div>
        )}

        {selectedTab === 'analytics' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Marketing Analytics</h3>
            <p className="text-gray-600 mb-4">
              Comprehensive analytics dashboard with performance insights and data visualization.
            </p>
            <a
              href="/analytics"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Go to Analytics</span>
            </a>
          </div>
        )}

        {/* Other tab content will be added in subsequent pages */}
        {selectedTab !== 'overview' && selectedTab !== 'campaigns' && selectedTab !== 'analytics' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100/50 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {tabs.find(tab => tab.id === selectedTab)?.label} Section
            </h3>
            <p className="text-gray-600 mb-4">
              This section will be implemented in the next development phase.
            </p>
            <p className="text-sm text-gray-500">
              Coming soon with comprehensive {selectedTab} management features.
            </p>
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-white/70 backdrop-blur-sm border-t border-purple-100/50 mt-12">
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <span className="font-bold text-gray-900">MarketAI</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Intelligent marketing automation platform powered by AI for modern businesses.
              </p>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-purple-600 transition-colors">Campaign Management</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Analytics & Insights</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Audience Targeting</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Content Creation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-purple-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Best Practices</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Case Studies</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-purple-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Status Page</a></li>
                <li><a href="#" className="hover:text-purple-600 transition-colors">Community</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-100/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 MarketAI by CODAI. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Terms</a>
              <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}