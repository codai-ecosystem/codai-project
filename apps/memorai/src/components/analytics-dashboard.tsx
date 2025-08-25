// Analytics Dashboard Component - Visual analytics and insights interface
// Comprehensive dashboard with charts, metrics, and actionable insights

'use client';

import React, { useState, useEffect } from 'react';
import {
  SimpleBarChart,
  SimpleLineChart,
  SimplePieChart,
  MetricCard
} from './analytics-charts';
import {
  Calendar, TrendingUp, Search, Database, Clock, Target,
  Download, Filter, RefreshCw, AlertCircle, CheckCircle,
  Activity, Users, Zap
} from 'lucide-react';

interface AnalyticsDashboardProps {
  className?: string;
}

interface MemoryAnalytics {
  totalMemories: number;
  memoriesThisWeek: number;
  memoriesThisMonth: number;
  averageMemorySize: number;
  totalStorageUsed: number;
  categoriesDistribution: Array<{ category: string; count: number; percentage: number }>;
  tagsDistribution: Array<{ tag: string; count: number; percentage: number }>;
  creationTrends: Array<{ date: string; count: number }>;
  searchPatterns: Array<{ query: string; frequency: number; lastUsed: Date }>;
  performanceMetrics: {
    averageResponseTime: number;
    cacheHitRate: number;
    searchSuccessRate: number;
    apiUsage: Array<{ endpoint: string; calls: number; averageTime: number }>;
  };
  userBehavior: {
    activeHours: Array<{ hour: number; activity: number }>;
    preferredCategories: string[];
    searchFrequency: 'Low' | 'Medium' | 'High';
    engagementScore: number;
  };
  insights: Array<{
    type: 'trend' | 'recommendation' | 'alert' | 'achievement';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    actionable: boolean;
  }>;
}

interface RealTimeMetrics {
  activeMemories: number;
  recentSearches: number;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  currentResponseTime: number;
  todayStats: {
    memoriesCreated: number;
    searchesPerformed: number;
    apiCalls: number;
  };
}


export function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<MemoryAnalytics | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'performance' | 'insights'>('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [analyticsResponse, realtimeResponse] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/analytics?realtime=true')
      ]);

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.data);
      }

      if (realtimeResponse.ok) {
        const realtimeData = await realtimeResponse.json();
        setRealtimeMetrics(realtimeData.data);
      }

      setError(null);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchAnalytics();

    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, dateRange]);

  // Export analytics data
  const handleExport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/analytics?export=${format}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `memorai-analytics-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Get health color
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !analytics) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Analytics Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Memory Analytics
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Insights and performance metrics for your memory system
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${autoRefresh
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm border-0 focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <Calendar className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <button className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Download className="h-4 w-4 mr-2 inline" />
                Export
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 hidden group-hover:block">
                <button
                  onClick={() => handleExport('json')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mt-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'performance', label: 'Performance', icon: Zap },
            { id: 'insights', label: 'Insights', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Metrics Bar */}
      {realtimeMetrics && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {realtimeMetrics.activeMemories}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active Memories</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {realtimeMetrics.recentSearches}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Recent Searches</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${getHealthColor(realtimeMetrics.systemHealth)}`}>
                {realtimeMetrics.systemHealth}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">System Health</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {realtimeMetrics.currentResponseTime}ms
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {realtimeMetrics.todayStats.memoriesCreated}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Created Today</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {realtimeMetrics.todayStats.searchesPerformed}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Searches Today</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{formatNumber(analytics.totalMemories)}</div>
                    <div className="text-blue-100">Total Memories</div>
                  </div>
                  <Database className="h-8 w-8 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{analytics.memoriesThisWeek}</div>
                    <div className="text-green-100">This Week</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{formatFileSize(analytics.totalStorageUsed)}</div>
                    <div className="text-purple-100">Storage Used</div>
                  </div>
                  <Activity className="h-8 w-8 text-purple-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{analytics.userBehavior.engagementScore}%</div>
                    <div className="text-orange-100">Engagement</div>
                  </div>
                  <Target className="h-8 w-8 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Categories Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Categories Distribution
                </h3>
                <SimplePieChart
                  data={analytics.categoriesDistribution.map(item => ({
                    name: item.category,
                    value: item.count
                  }))}
                  title="Categories Distribution"
                  width={400}
                  height={300}
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top Tags
                </h3>
                <div className="space-y-3">
                  {analytics.tagsDistribution.slice(0, 8).map((tag, index) => (
                    <div key={tag.tag} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: `hsl(${(index * 360) / analytics.tagsDistribution.length}, 70%, 50%)` }}
                        />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {tag.tag}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 dark:text-white font-semibold">
                          {tag.count}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {tag.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && analytics && (
          <div className="space-y-6">
            {/* Memory Creation Trends */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Memory Creation Trends
              </h3>
              <SimpleLineChart
                data={analytics.creationTrends.map(item => ({
                  name: new Date(item.date).toLocaleDateString(),
                  value: item.count,
                  color: '#8b5cf6'
                }))}
                title="Memory Creation Trends"
                width={800}
                height={400}
              />
            </div>

            {/* Activity Patterns */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Daily Activity Patterns
              </h3>
              <SimpleBarChart
                data={analytics.userBehavior.activeHours.map(item => ({
                  name: `${item.hour}:00`,
                  value: item.activity,
                  color: '#06b6d4'
                }))}
                title="Daily Activity Patterns"
                width={800}
                height={300}
              />
            </div>
          </div>
        )}

        {activeTab === 'performance' && analytics && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-center">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.performanceMetrics.averageResponseTime}ms
                </div>
                <div className="text-gray-600 dark:text-gray-400">Avg Response Time</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-center">
                <Zap className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.performanceMetrics.cacheHitRate}%
                </div>
                <div className="text-gray-600 dark:text-gray-400">Cache Hit Rate</div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-center">
                <Search className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.performanceMetrics.searchSuccessRate.toFixed(1)}%
                </div>
                <div className="text-gray-600 dark:text-gray-400">Search Success Rate</div>
              </div>
            </div>

            {/* API Usage */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                API Usage
              </h3>
              <SimpleBarChart
                data={analytics.performanceMetrics.apiUsage.map(item => ({
                  name: item.endpoint,
                  value: item.calls,
                  color: '#8b5cf6'
                }))}
                title="API Usage (Calls)"
                width={800}
                height={300}
              />
            </div>
          </div>
        )}

        {activeTab === 'insights' && analytics && (
          <div className="space-y-6">
            {/* Insights */}
            <div className="space-y-4">
              {analytics.insights.map((insight, index) => {
                const getInsightIcon = () => {
                  switch (insight.type) {
                    case 'trend': return TrendingUp;
                    case 'recommendation': return Target;
                    case 'alert': return AlertCircle;
                    case 'achievement': return CheckCircle;
                    default: return Activity;
                  }
                };

                const getInsightColor = () => {
                  switch (insight.priority) {
                    case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20';
                    case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20';
                    case 'low': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20';
                    default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20';
                  }
                };

                const Icon = getInsightIcon();

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getInsightColor()}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {insight.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${insight.priority === 'high'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : insight.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}>
                              {insight.priority}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${insight.type === 'alert'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : insight.type === 'achievement'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                              }`}>
                              {insight.type}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {insight.description}
                        </p>
                        {insight.actionable && (
                          <div className="mt-3">
                            <button className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors">
                              Take Action
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
