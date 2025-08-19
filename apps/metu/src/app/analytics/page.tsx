'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Calendar,
  Target,
  Award,
  Zap,
  Brain,
  Mic,
  Volume2,
  Eye,
  Gauge,
  Speaker,
  Waves,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Star,
  ThumbsUp,
  ThumbsDown,
  ArrowUp,
  ArrowDown,
  Equal,
  Filter,
  Download,
  Share2,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Info,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  MoreHorizontal,
  Search,
  Calendar as CalendarIcon,
  Timer,
  Flame,
  Trophy,
  BookOpen,
  MessageSquare,
  Headphones,
  Radio,
  FileText,
  Database,
  Cloud,
  Cpu,
  HardDrive,
  Wifi,
  Signal,
  Battery,
  Power
} from 'lucide-react';

interface AnalyticsData {
  period: string;
  totalSessions: number;
  totalDuration: string;
  averageAccuracy: number;
  improvementRate: number;
  completedModules: number;
  activeStreaks: number;
  qualityScore: number;
}

interface PerformanceMetric {
  name: string;
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target: number;
  icon: any;
  color: string;
}

interface UsagePattern {
  day: string;
  sessions: number;
  duration: number;
  accuracy: number;
}

interface DeviceAnalytics {
  device: string;
  sessions: number;
  percentage: number;
  avgDuration: string;
  quality: number;
  icon: any;
}

interface CategoryProgress {
  category: string;
  progress: number;
  sessions: number;
  improvement: number;
  color: string;
  icon: any;
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const analyticsOverview: AnalyticsData = {
    period: '7 days',
    totalSessions: 47,
    totalDuration: '8h 23m',
    averageAccuracy: 84.7,
    improvementRate: 12.3,
    completedModules: 3,
    activeStreaks: 5,
    qualityScore: 4.6
  };

  const performanceMetrics: PerformanceMetric[] = [
    {
      name: 'Voice Clarity',
      current: 87.5,
      previous: 82.1,
      change: 5.4,
      trend: 'up',
      target: 90,
      icon: Eye,
      color: 'blue'
    },
    {
      name: 'Pronunciation',
      current: 82.3,
      previous: 79.8,
      change: 2.5,
      trend: 'up',
      target: 85,
      icon: Volume2,
      color: 'green'
    },
    {
      name: 'Speech Fluency',
      current: 79.8,
      previous: 81.2,
      change: -1.4,
      trend: 'down',
      target: 85,
      icon: Waves,
      color: 'purple'
    },
    {
      name: 'Speaking Pace',
      current: 85.2,
      previous: 84.9,
      change: 0.3,
      trend: 'stable',
      target: 88,
      icon: Gauge,
      color: 'orange'
    },
    {
      name: 'Volume Control',
      current: 91.4,
      previous: 89.7,
      change: 1.7,
      trend: 'up',
      target: 92,
      icon: Speaker,
      color: 'red'
    },
    {
      name: 'Confidence Level',
      current: 76.9,
      previous: 74.2,
      change: 2.7,
      trend: 'up',
      target: 80,
      icon: Brain,
      color: 'indigo'
    }
  ];

  const weeklyUsage: UsagePattern[] = [
    { day: 'Monday', sessions: 8, duration: 95, accuracy: 82.1 },
    { day: 'Tuesday', sessions: 6, duration: 78, accuracy: 84.3 },
    { day: 'Wednesday', sessions: 9, duration: 112, accuracy: 86.7 },
    { day: 'Thursday', sessions: 7, duration: 89, accuracy: 83.9 },
    { day: 'Friday', sessions: 5, duration: 67, accuracy: 85.2 },
    { day: 'Saturday', sessions: 4, duration: 52, accuracy: 87.1 },
    { day: 'Sunday', sessions: 8, duration: 98, accuracy: 84.8 }
  ];

  const deviceAnalytics: DeviceAnalytics[] = [
    {
      device: 'Desktop',
      sessions: 28,
      percentage: 59.6,
      avgDuration: '12m 30s',
      quality: 4.7,
      icon: Monitor
    },
    {
      device: 'Mobile',
      sessions: 15,
      percentage: 31.9,
      avgDuration: '8m 15s',
      quality: 4.2,
      icon: Smartphone
    },
    {
      device: 'Tablet',
      sessions: 4,
      percentage: 8.5,
      avgDuration: '6m 45s',
      quality: 4.4,
      icon: Tablet
    }
  ];

  const categoryProgress: CategoryProgress[] = [
    {
      category: 'Pronunciation',
      progress: 78,
      sessions: 18,
      improvement: 12.5,
      color: 'blue',
      icon: Volume2
    },
    {
      category: 'Accent Training',
      progress: 45,
      sessions: 12,
      improvement: 8.3,
      color: 'green',
      icon: Globe
    },
    {
      category: 'Speech Clarity',
      progress: 92,
      sessions: 8,
      improvement: 15.7,
      color: 'purple',
      icon: Eye
    },
    {
      category: 'Vocabulary',
      progress: 23,
      sessions: 6,
      improvement: 5.2,
      color: 'orange',
      icon: BookOpen
    },
    {
      category: 'Conversation',
      progress: 8,
      sessions: 3,
      improvement: 2.1,
      color: 'red',
      icon: MessageSquare
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Equal className="w-4 h-4 text-yellow-500" />;
      default: return <Equal className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMetricColor = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'red': return 'text-red-600 bg-red-100';
      case 'indigo': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const maxSessions = Math.max(...weeklyUsage.map(d => d.sessions));
  const maxDuration = Math.max(...weeklyUsage.map(d => d.duration));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Voice Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Track your voice improvement progress and performance metrics
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 3 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              <button className="bg-white/70 backdrop-blur-sm border border-blue-200 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-blue-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { name: 'Dashboard', href: '/metu', current: false },
              { name: 'Conversations', href: '/metu/conversations', current: false },
              { name: 'Training', href: '/metu/training', current: false },
              { name: 'Analytics', href: '/metu/analytics', current: true },
              { name: 'Personality', href: '/metu/personality', current: false },
              { name: 'Integrations', href: '/metu/integrations', current: false },
              { name: 'Settings', href: '/metu/settings', current: false },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${tab.current
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsOverview.totalSessions}</p>
                <p className="text-sm text-green-600 flex items-center space-x-1">
                  <ArrowUp className="w-3 h-3" />
                  <span>+15% from last period</span>
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Training Time</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsOverview.totalDuration}</p>
                <p className="text-sm text-green-600 flex items-center space-x-1">
                  <ArrowUp className="w-3 h-3" />
                  <span>+8% from last period</span>
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsOverview.averageAccuracy}%</p>
                <p className="text-sm text-green-600 flex items-center space-x-1">
                  <ArrowUp className="w-3 h-3" />
                  <span>+{analyticsOverview.improvementRate}% improvement</span>
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quality Score</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsOverview.qualityScore}/5</p>
                <p className="text-sm text-blue-600 flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span>Excellent rating</span>
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Performance Metrics</span>
            </h2>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span className="text-sm">Advanced View</span>
              <ChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceMetrics.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <div key={metric.name} className="p-4 bg-white/50 rounded-lg border border-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${getMetricColor(metric.color)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{metric.name}</span>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">{metric.current}%</span>
                      <span className={`text-sm font-medium ${metric.change > 0 ? 'text-green-600' :
                          metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${metric.color}-500`}
                        style={{ width: `${(metric.current / 100) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Previous: {metric.previous}%</span>
                      <span>Target: {metric.target}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100"
            >
              <h3 className="font-semibold text-gray-900 mb-3">Advanced Performance Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Top Performing Areas:</strong>
                  <ul className="mt-1 space-y-1 text-gray-600">
                    <li>• Volume Control (91.4% - Above target)</li>
                    <li>• Voice Clarity (87.5% - Near target)</li>
                    <li>• Speaking Pace (85.2% - Steady progress)</li>
                  </ul>
                </div>
                <div>
                  <strong>Focus Areas:</strong>
                  <ul className="mt-1 space-y-1 text-gray-600">
                    <li>• Confidence Level (76.9% - Needs improvement)</li>
                    <li>• Speech Fluency (79.8% - Slight decline)</li>
                    <li>• Pronunciation (82.3% - Below target)</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Usage Patterns and Device Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Weekly Usage Patterns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <LineChart className="w-5 h-5 text-blue-600" />
              <span>Weekly Usage Patterns</span>
            </h2>

            <div className="space-y-4">
              {weeklyUsage.map((day) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{day.day}</span>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <span>{day.sessions} sessions</span>
                      <span>{day.duration}m</span>
                      <span>{day.accuracy}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Sessions</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(day.sessions / maxSessions) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${(day.duration / maxDuration) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500">Accuracy</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${day.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Weekly Insights</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Most active day: Wednesday (9 sessions)</li>
                <li>• Best accuracy: Saturday (87.1%)</li>
                <li>• Longest training: Wednesday (112 minutes)</li>
                <li>• Improvement trend: +2.4% week-over-week</li>
              </ul>
            </div>
          </motion.div>

          {/* Device Analytics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <span>Device Usage Analytics</span>
            </h2>

            <div className="space-y-4 mb-6">
              {deviceAnalytics.map((device) => {
                const IconComponent = device.icon;
                return (
                  <div key={device.device} className="p-4 bg-white/50 rounded-lg border border-blue-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{device.device}</h3>
                          <p className="text-sm text-gray-600">{device.sessions} sessions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{device.percentage}%</div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{device.quality}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Avg Duration: {device.avgDuration}</span>
                        <span>Quality: {device.quality}/5</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Device Recommendations</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Desktop provides best audio quality</li>
                <li>• Mobile sessions are shorter but frequent</li>
                <li>• Consider using headphones for better results</li>
                <li>• Tablet sessions show room for improvement</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Category Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Category Progress Analysis</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryProgress.map((category) => {
              const IconComponent = category.icon;
              return (
                <div key={category.category} className="p-4 bg-white/50 rounded-lg border border-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${getMetricColor(category.color)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{category.category}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{category.progress}%</span>
                  </div>

                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full bg-${category.color}-500`}
                        style={{ width: `${category.progress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Sessions:</span>
                        <br />
                        <span className="font-medium text-gray-900">{category.sessions}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Improvement:</span>
                        <br />
                        <span className="font-medium text-green-600">+{category.improvement}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              <span>Personalized Recommendations</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <ul className="space-y-1">
                <li>• Continue focus on Speech Clarity (92% complete)</li>
                <li>• Increase Pronunciation practice sessions</li>
                <li>• Schedule regular Accent Training sessions</li>
              </ul>
              <ul className="space-y-1">
                <li>• Begin Vocabulary expansion modules</li>
                <li>• Practice Conversation skills more frequently</li>
                <li>• Set daily practice reminders</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modern Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">METU Analytics</h3>
              <p className="text-blue-200 mb-6 max-w-md">
                Comprehensive voice performance analytics and insights.
                Track your progress, identify patterns, and optimize your voice training journey.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <TrendingUp className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Target className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Analytics Features</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Performance Metrics</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Usage Patterns</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Progress Tracking</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Device Analytics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Insights & Reports</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Weekly Reports</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Improvement Trends</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Category Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Custom Dashboards</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm">
              © 2025 METU Analytics. Data-driven voice improvement insights.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                📊 {analyticsOverview.totalSessions} Sessions Analyzed
              </span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
