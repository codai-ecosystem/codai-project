'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Database,
  Clock,
  Target,
  Zap,
  Brain,
  Search,
  Eye,
  Download,
  Share2,
  Filter,
  Calendar,
  Globe,
  Tag,
  FileText,
  Image,
  Video,
  Music,
  Code,
  Link,
  Layers,
  Network,
  Cpu,
  HardDrive,
  Wifi,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock3,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  RefreshCw,
  Settings,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Info,
  Star,
  Bookmark,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface UsageData {
  date: string;
  memories: number;
  searches: number;
  collections: number;
  users: number;
  apiCalls: number;
  storage: number;
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  trend: number[];
  unit: string;
}

interface UserAnalytics {
  id: string;
  name: string;
  email: string;
  role: string;
  memoriesCreated: number;
  searchesPerformed: number;
  collectionsManaged: number;
  lastActive: string;
  engagement: number;
  storageUsed: number;
}

interface ContentAnalytics {
  type: string;
  count: number;
  percentage: number;
  growth: number;
  averageSize: number;
  totalSize: number;
  popularTags: string[];
}

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetricCategory, setSelectedMetricCategory] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  // Mock analytics data - in real app would come from API
  const analyticsMetrics: AnalyticsMetric[] = [
    {
      id: 'total-memories',
      name: 'Total Memories',
      value: 45623,
      previousValue: 42156,
      change: 8.22,
      changeType: 'increase',
      unit: '',
      icon: <Database className="w-5 h-5" />,
      color: 'blue',
      description: 'Total number of memories stored in the system'
    },
    {
      id: 'active-users',
      name: 'Active Users',
      value: 1247,
      previousValue: 1189,
      change: 4.88,
      changeType: 'increase',
      unit: '',
      icon: <Users className="w-5 h-5" />,
      color: 'green',
      description: 'Users who accessed the system in the selected period'
    },
    {
      id: 'searches-performed',
      name: 'Searches Performed',
      value: 23891,
      previousValue: 21045,
      change: 13.52,
      changeType: 'increase',
      unit: '',
      icon: <Search className="w-5 h-5" />,
      color: 'purple',
      description: 'Total number of search queries executed'
    },
    {
      id: 'avg-response-time',
      name: 'Avg Response Time',
      value: 187,
      previousValue: 234,
      change: -20.09,
      changeType: 'decrease',
      unit: 'ms',
      icon: <Zap className="w-5 h-5" />,
      color: 'yellow',
      description: 'Average API response time across all endpoints'
    },
    {
      id: 'storage-used',
      name: 'Storage Used',
      value: 2.45,
      previousValue: 2.31,
      change: 6.06,
      changeType: 'increase',
      unit: 'TB',
      icon: <HardDrive className="w-5 h-5" />,
      color: 'red',
      description: 'Total storage space consumed by memories and metadata'
    },
    {
      id: 'api-success-rate',
      name: 'API Success Rate',
      value: 99.87,
      previousValue: 99.42,
      change: 0.45,
      changeType: 'increase',
      unit: '%',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'emerald',
      description: 'Percentage of successful API requests'
    }
  ];

  const usageData: UsageData[] = [
    { date: '2024-01-01', memories: 1200, searches: 450, collections: 89, users: 234, apiCalls: 5670, storage: 1.2 },
    { date: '2024-01-02', memories: 1350, searches: 523, collections: 92, users: 267, apiCalls: 6234, storage: 1.3 },
    { date: '2024-01-03', memories: 1580, searches: 687, collections: 98, users: 298, apiCalls: 7123, storage: 1.4 },
    { date: '2024-01-04', memories: 1723, searches: 734, collections: 103, users: 325, apiCalls: 7892, storage: 1.5 },
    { date: '2024-01-05', memories: 1934, searches: 856, collections: 108, users: 356, apiCalls: 8456, storage: 1.7 },
    { date: '2024-01-06', memories: 2145, searches: 923, collections: 115, users: 389, apiCalls: 9234, storage: 1.9 },
    { date: '2024-01-07', memories: 2387, searches: 1034, collections: 122, users: 423, apiCalls: 10123, storage: 2.1 }
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'cpu-usage',
      name: 'CPU Usage',
      value: 67.3,
      threshold: 80,
      status: 'good',
      trend: [45, 52, 61, 58, 67, 72, 67],
      unit: '%'
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      value: 78.9,
      threshold: 85,
      status: 'warning',
      trend: [65, 68, 72, 75, 79, 81, 79],
      unit: '%'
    },
    {
      id: 'disk-io',
      name: 'Disk I/O',
      value: 234.7,
      threshold: 500,
      status: 'good',
      trend: [180, 195, 210, 225, 240, 255, 235],
      unit: 'MB/s'
    },
    {
      id: 'network-throughput',
      name: 'Network Throughput',
      value: 456.2,
      threshold: 800,
      status: 'good',
      trend: [320, 345, 380, 420, 450, 470, 456],
      unit: 'Mbps'
    }
  ];

  const userAnalytics: UserAnalytics[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@company.com',
      role: 'Data Scientist',
      memoriesCreated: 1247,
      searchesPerformed: 3456,
      collectionsManaged: 23,
      lastActive: '2024-01-16T09:15:00Z',
      engagement: 94,
      storageUsed: 156.7
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@company.com',
      role: 'Developer',
      memoriesCreated: 892,
      searchesPerformed: 2134,
      collectionsManaged: 18,
      lastActive: '2024-01-16T08:45:00Z',
      engagement: 87,
      storageUsed: 98.3
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@company.com',
      role: 'Research Manager',
      memoriesCreated: 2156,
      searchesPerformed: 4567,
      collectionsManaged: 34,
      lastActive: '2024-01-16T10:30:00Z',
      engagement: 96,
      storageUsed: 234.5
    }
  ];

  const contentAnalytics: ContentAnalytics[] = [
    {
      type: 'text',
      count: 28456,
      percentage: 62.3,
      growth: 8.5,
      averageSize: 12.4,
      totalSize: 353.2,
      popularTags: ['documentation', 'notes', 'research', 'meeting', 'summary']
    },
    {
      type: 'code',
      count: 8923,
      percentage: 19.5,
      growth: 15.2,
      averageSize: 45.7,
      totalSize: 407.8,
      popularTags: ['javascript', 'python', 'react', 'api', 'function']
    },
    {
      type: 'image',
      count: 4567,
      percentage: 10.0,
      growth: 5.7,
      averageSize: 234.6,
      totalSize: 1071.2,
      popularTags: ['diagram', 'screenshot', 'design', 'chart', 'wireframe']
    },
    {
      type: 'video',
      count: 2145,
      percentage: 4.7,
      growth: 12.3,
      averageSize: 1567.8,
      totalSize: 3363.4,
      popularTags: ['demo', 'tutorial', 'presentation', 'recording', 'training']
    },
    {
      type: 'audio',
      count: 1234,
      percentage: 2.7,
      growth: 7.8,
      averageSize: 890.2,
      totalSize: 1098.9,
      popularTags: ['meeting', 'interview', 'podcast', 'note', 'discussion']
    },
    {
      type: 'file',
      count: 387,
      percentage: 0.8,
      growth: 3.2,
      averageSize: 456.3,
      totalSize: 176.6,
      popularTags: ['document', 'spreadsheet', 'pdf', 'report', 'template']
    }
  ];

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'decrease': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMetricColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
      emerald: 'bg-emerald-100 text-emerald-600'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getPerformanceStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'code': return <Code className="w-4 h-4 text-orange-600" />;
      case 'image': return <Image className="w-4 h-4 text-green-600" />;
      case 'video': return <Video className="w-4 h-4 text-red-600" />;
      case 'audio': return <Music className="w-4 h-4 text-purple-600" />;
      case 'file': return <FileText className="w-4 h-4 text-gray-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number, decimals: number = 0) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Data would be refreshed from API
    } catch (error) {
      console.error('Failed to refresh analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights and performance metrics for your memory management system
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsMetrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getMetricColor(metric.color)}`}>
                {metric.icon}
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-2">
              <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.name}</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatNumber(metric.value, metric.unit === 'ms' || metric.unit === '%' ? 1 : 0)}
                  <span className="text-lg font-normal text-gray-600 ml-1">{metric.unit}</span>
                </span>
                <div className={`flex items-center text-sm ${getChangeColor(metric.changeType)}`}>
                  {getChangeIcon(metric.changeType)}
                  <span className="ml-1">{Math.abs(metric.change).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Usage Trends Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Usage Trends</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedChart('memories')}
              className={`px-3 py-1 text-sm rounded ${selectedChart === 'memories' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Memories
            </button>
            <button
              onClick={() => setSelectedChart('searches')}
              className={`px-3 py-1 text-sm rounded ${selectedChart === 'searches' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Searches
            </button>
            <button
              onClick={() => setSelectedChart('users')}
              className={`px-3 py-1 text-sm rounded ${selectedChart === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Users
            </button>
          </div>
        </div>

        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Interactive chart would be rendered here</p>
            <p className="text-sm text-gray-500 mt-1">
              Showing {selectedChart || 'all metrics'} over {selectedTimeRange}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">System Performance</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric) => (
            <div key={metric.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">{metric.name}</h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPerformanceStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-gray-900">
                  {metric.value.toFixed(1)}
                </span>
                <span className="text-sm text-gray-600">{metric.unit}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${metric.status === 'good' ? 'bg-green-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${(metric.value / metric.threshold) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>0</span>
                <span>{metric.threshold}{metric.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Content Analytics</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Distribution */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-4">Content Type Distribution</h3>
            <div className="space-y-3">
              {contentAnalytics.map((content) => (
                <div key={content.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getContentTypeIcon(content.type)}
                    <div>
                      <span className="font-medium text-gray-900 capitalize">{content.type}</span>
                      <div className="text-xs text-gray-600">
                        {formatNumber(content.count)} items ({content.percentage}%)
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${content.growth > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {content.growth > 0 ? '+' : ''}{content.growth}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(content.totalSize, 1)} GB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-4">Popular Tags by Content Type</h3>
            <div className="space-y-4">
              {contentAnalytics.slice(0, 3).map((content) => (
                <div key={content.type} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {getContentTypeIcon(content.type)}
                    <span className="font-medium text-gray-900 capitalize">{content.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {content.popularTags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Top Users</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
            View All Users
            <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Memories</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Searches</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Collections</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Engagement</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Storage</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userAnalytics.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatNumber(user.memoriesCreated)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatNumber(user.searchesPerformed)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {user.collectionsManaged}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-green-500 rounded-full"
                          style={{ width: `${user.engagement}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.engagement}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {user.storageUsed.toFixed(1)} MB
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(user.lastActive)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100">
            <Download className="w-5 h-5 mr-2" />
            Export Report
          </button>
          <button className="flex items-center justify-center p-4 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100">
            <Settings className="w-5 h-5 mr-2" />
            Configure Alerts
          </button>
          <button className="flex items-center justify-center p-4 text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100">
            <Share2 className="w-5 h-5 mr-2" />
            Share Dashboard
          </button>
          <button className="flex items-center justify-center p-4 text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  );
}
