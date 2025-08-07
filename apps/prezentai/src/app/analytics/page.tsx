'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Clock, 
  Calendar,
  Download,
  Share2,
  Filter,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Globe,
  MousePointer,
  Play,
  Pause,
  MessageSquare,
  Heart,
  Star,
  Award,
  PieChart,
  LineChart,
  Activity,
  Database,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface PresentationAnalytics {
  id: string;
  title: string;
  views: number;
  engagement: number;
  shares: number;
  avgTime: string;
  completionRate: number;
  feedback: number;
  lastViewed: string;
  trend: 'up' | 'down' | 'stable';
}

interface AudienceData {
  location: string;
  visitors: number;
  percentage: number;
  engagement: number;
  color: string;
}

interface DeviceData {
  device: string;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [isRealTime, setIsRealTime] = useState(true);
  const [showComparisons, setShowComparisons] = useState(false);

  const overviewMetrics: AnalyticsMetric[] = [
    {
      id: 'total-views',
      name: 'Total Views',
      value: '156.2K',
      change: 12.5,
      trend: 'up',
      icon: <Eye className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'avg-engagement',
      name: 'Avg Engagement',
      value: '87.3%',
      change: 5.8,
      trend: 'up',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'total-shares',
      name: 'Total Shares',
      value: '3.4K',
      change: -2.1,
      trend: 'down',
      icon: <Share2 className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'avg-time',
      name: 'Avg View Time',
      value: '4m 32s',
      change: 8.7,
      trend: 'up',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 'completion-rate',
      name: 'Completion Rate',
      value: '78.9%',
      change: 3.4,
      trend: 'up',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 'audience-reach',
      name: 'Unique Viewers',
      value: '89.1K',
      change: 15.2,
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  const topPresentations: PresentationAnalytics[] = [
    {
      id: '1',
      title: 'Q3 Business Review',
      views: 24680,
      engagement: 92.4,
      shares: 456,
      avgTime: '6m 45s',
      completionRate: 89.2,
      feedback: 4.8,
      lastViewed: '2 hours ago',
      trend: 'up'
    },
    {
      id: '2',
      title: 'Product Launch Strategy',
      views: 18950,
      engagement: 87.6,
      shares: 378,
      avgTime: '5m 12s',
      completionRate: 82.5,
      feedback: 4.6,
      lastViewed: '4 hours ago',
      trend: 'up'
    },
    {
      id: '3',
      title: 'Marketing Campaign Results',
      views: 15420,
      engagement: 84.1,
      shares: 289,
      avgTime: '4m 38s',
      completionRate: 76.8,
      feedback: 4.4,
      lastViewed: '6 hours ago',
      trend: 'stable'
    },
    {
      id: '4',
      title: 'Team Training Workshop',
      views: 12340,
      engagement: 79.3,
      shares: 234,
      avgTime: '8m 15s',
      completionRate: 94.1,
      feedback: 4.7,
      lastViewed: '1 day ago',
      trend: 'up'
    },
    {
      id: '5',
      title: 'Financial Overview 2025',
      views: 9870,
      engagement: 71.2,
      shares: 156,
      avgTime: '3m 52s',
      completionRate: 68.4,
      feedback: 4.2,
      lastViewed: '2 days ago',
      trend: 'down'
    }
  ];

  const audienceData: AudienceData[] = [
    { location: 'United States', visitors: 45680, percentage: 35.2, engagement: 89.4, color: 'bg-blue-500' },
    { location: 'United Kingdom', visitors: 28950, percentage: 22.3, engagement: 85.7, color: 'bg-green-500' },
    { location: 'Germany', visitors: 19340, percentage: 14.9, engagement: 82.1, color: 'bg-purple-500' },
    { location: 'France', visitors: 15680, percentage: 12.1, engagement: 87.3, color: 'bg-orange-500' },
    { location: 'Canada', visitors: 12450, percentage: 9.6, engagement: 91.2, color: 'bg-pink-500' },
    { location: 'Others', visitors: 7890, percentage: 5.9, engagement: 78.6, color: 'bg-gray-500' }
  ];

  const deviceData: DeviceData[] = [
    { device: 'Desktop', percentage: 52.3, icon: <Monitor className="w-5 h-5" />, color: 'bg-blue-500' },
    { device: 'Mobile', percentage: 31.7, icon: <Smartphone className="w-5 h-5" />, color: 'bg-green-500' },
    { device: 'Tablet', percentage: 16.0, icon: <Tablet className="w-5 h-5" />, color: 'bg-purple-500' }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Presentation Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Track performance and engagement across all your presentations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsRealTime(!isRealTime)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isRealTime 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">{isRealTime ? 'Live' : 'Paused'}</span>
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
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
        className="bg-white/60 backdrop-blur-sm border-b border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { name: 'Overview', href: '/prezentai', current: false },
              { name: 'Presentations', href: '/prezentai/presentations', current: false },
              { name: 'Templates', href: '/prezentai/templates', current: false },
              { name: 'Media Library', href: '/prezentai/media', current: false },
              { name: 'Analytics', href: '/prezentai/analytics', current: true },
              { name: 'Settings', href: '/prezentai/settings', current: false },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  tab.current
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Overview Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
        >
          {overviewMetrics.map((metric) => (
            <div key={metric.id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  {metric.icon}
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : 
                   metric.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : 
                   <div className="w-4 h-4" />}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                <p className="text-sm text-gray-600">{metric.name}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Top Presentations */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Presentations</h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowComparisons(!showComparisons)}
                    className={`text-sm px-3 py-1 rounded-lg transition-colors duration-200 ${
                      showComparisons ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Compare
                  </button>
                  <RefreshCw className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors duration-200" />
                </div>
              </div>
              
              <div className="space-y-4">
                {topPresentations.map((presentation, index) => (
                  <div key={presentation.id} className="p-4 bg-white/50 rounded-lg border border-purple-50 hover:bg-white/70 transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{presentation.title}</h4>
                          <p className="text-sm text-gray-500">Last viewed {presentation.lastViewed}</p>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-1 text-sm ${
                        presentation.trend === 'up' ? 'text-green-600' : 
                        presentation.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {presentation.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                         presentation.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                         <div className="w-4 h-4" />}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Views</p>
                        <p className="font-semibold text-gray-900">{formatNumber(presentation.views)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Engagement</p>
                        <p className="font-semibold text-gray-900">{presentation.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Time</p>
                        <p className="font-semibold text-gray-900">{presentation.avgTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Rating</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="font-semibold text-gray-900">{presentation.feedback}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Completion Rate Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-500">Completion Rate</span>
                        <span className="font-medium text-gray-900">{presentation.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${presentation.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            
            {/* Audience Geography */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience by Location</h3>
              <div className="space-y-3">
                {audienceData.map((location) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${location.color}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{location.location}</p>
                        <p className="text-xs text-gray-500">{formatNumber(location.visitors)} visitors</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{location.percentage}%</p>
                      <p className="text-xs text-gray-500">{location.engagement}% engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
              <div className="space-y-3">
                {deviceData.map((device) => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${device.color} text-white`}>
                        {device.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{device.device}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${device.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${device.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-12">{device.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">This Week</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">+24.3%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Award className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Top Performer</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">Q3 Review</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Zap className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">Peak Hour</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">2-3 PM</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">PrezentAI Analytics</h3>
              <p className="text-purple-200 mb-6 max-w-md">
                Gain deep insights into your presentation performance with advanced analytics. 
                Track engagement, audience behavior, and optimize your content for maximum impact.
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
              <ul className="space-y-2 text-purple-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Real-time Tracking</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Audience Insights</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Engagement Metrics</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Performance Reports</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Data Export</h4>
              <ul className="space-y-2 text-purple-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">CSV Reports</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">PDF Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">API Access</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Custom Dashboards</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-purple-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-purple-200 text-sm">
              © 2025 PrezentAI Analytics. Transform data into actionable insights.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                📊 156.2K Total Views Tracked
              </span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
