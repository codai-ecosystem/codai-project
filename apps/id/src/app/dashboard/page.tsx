'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Chrome,
  Firefox,
  Safari,
  AlertCircle,
  Info,
  XCircle,
  Bell,
  MoreVertical,
  ExternalLink
} from 'lucide-react';

interface IdentityStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  activeSessions: number;
  failedLogins: number;
  securityAlerts: number;
  authenticationRate: number;
  sessionDuration: string;
}

interface RecentActivity {
  id: string;
  type: 'login' | 'logout' | 'registration' | 'password_change' | 'security_alert' | 'session_timeout';
  user: string;
  timestamp: string;
  location: string;
  device: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'warning';
}

interface SecurityMetric {
  name: string;
  value: number;
  change: number;
  status: 'good' | 'warning' | 'critical';
}

export default function IDDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);

  const identityStats: IdentityStats = {
    totalUsers: 125429,
    activeUsers: 89341,
    newUsersToday: 247,
    activeSessions: 12543,
    failedLogins: 89,
    securityAlerts: 3,
    authenticationRate: 98.7,
    sessionDuration: '24m 15s'
  };

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'login',
      user: 'john.doe@company.com',
      timestamp: '2 minutes ago',
      location: 'San Francisco, CA',
      device: 'Chrome on Windows',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      type: 'security_alert',
      user: 'alice.smith@company.com',
      timestamp: '5 minutes ago',
      location: 'New York, NY',
      device: 'Safari on iPhone',
      ipAddress: '10.0.0.50',
      status: 'warning'
    },
    {
      id: '3',
      type: 'registration',
      user: 'bob.wilson@company.com',
      timestamp: '12 minutes ago',
      location: 'London, UK',
      device: 'Firefox on MacOS',
      ipAddress: '172.16.0.25',
      status: 'success'
    },
    {
      id: '4',
      type: 'password_change',
      user: 'sarah.jones@company.com',
      timestamp: '18 minutes ago',
      location: 'Tokyo, Japan',
      device: 'Chrome on Android',
      ipAddress: '192.168.2.75',
      status: 'success'
    },
    {
      id: '5',
      type: 'login',
      user: 'mike.brown@company.com',
      timestamp: '25 minutes ago',
      location: 'Sydney, Australia',
      device: 'Edge on Windows',
      ipAddress: '10.1.1.200',
      status: 'failed'
    }
  ];

  const securityMetrics: SecurityMetric[] = [
    { name: 'Password Strength', value: 94, change: 2.1, status: 'good' },
    { name: 'MFA Adoption', value: 87, change: 5.3, status: 'good' },
    { name: 'Suspicious Activities', value: 3, change: -1.2, status: 'good' },
    { name: 'Policy Compliance', value: 96, change: 1.8, status: 'good' },
    { name: 'Session Security', value: 99, change: 0.5, status: 'good' },
    { name: 'Access Violations', value: 2, change: -0.8, status: 'good' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <Shield className="w-4 h-4 text-green-600" />;
      case 'logout': return <Shield className="w-4 h-4 text-gray-600" />;
      case 'registration': return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'password_change': return <Lock className="w-4 h-4 text-yellow-600" />;
      case 'security_alert': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'session_timeout': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) return <Smartphone className="w-4 h-4" />;
    if (device.includes('iPad') || device.includes('Tablet')) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Identity Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage your identity and authentication services
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{identityStats.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600">+{identityStats.newUsersToday} today</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{identityStats.activeUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">
              {((identityStats.activeUsers / identityStats.totalUsers) * 100).toFixed(1)}% of total
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{identityStats.activeSessions.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Active Sessions</div>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-600">Avg: {identityStats.sessionDuration}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{identityStats.authenticationRate}%</div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-sm text-green-600">Excellent</span>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      {identityStats.securityAlerts > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {identityStats.securityAlerts} Security Alert{identityStats.securityAlerts > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-600 mt-1">
                Suspicious login attempts detected. Please review the security logs.
              </p>
            </div>
            <button className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
              Review Alerts
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.user}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 capitalize">
                      {activity.type.replace('_', ' ')} • {activity.timestamp}
                    </p>

                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {activity.location}
                      </div>
                      <div className="flex items-center">
                        {getDeviceIcon(activity.device)}
                        <span className="ml-1">{activity.device}</span>
                      </div>
                      <span>{activity.ipAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Security Metrics</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Detailed Report
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {securityMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">{metric.value}%</span>
                        <div className={`flex items-center text-xs ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {metric.change >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {Math.abs(metric.change)}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${metric.status === 'good' ? 'bg-green-600' :
                            metric.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Failed Login Attempts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Failed Logins</h3>
          </div>
          <div className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{identityStats.failedLogins}</div>
              <div className="text-sm text-gray-500 mt-1">Last 24 hours</div>
              <div className="mt-4">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Locations</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {[
                { location: 'United States', users: 45230, percentage: 36 },
                { location: 'United Kingdom', users: 23451, percentage: 19 },
                { location: 'Germany', users: 18923, percentage: 15 },
                { location: 'Canada', users: 12034, percentage: 10 },
                { location: 'Australia', users: 8765, percentage: 7 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{item.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.users.toLocaleString()}</span>
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {[
                { service: 'Authentication API', status: 'operational', uptime: '99.9%' },
                { service: 'User Database', status: 'operational', uptime: '99.8%' },
                { service: 'Session Service', status: 'operational', uptime: '99.7%' },
                { service: 'Security Scanner', status: 'operational', uptime: '99.9%' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm text-gray-900">{item.service}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-600 font-medium capitalize">{item.status}</div>
                    <div className="text-xs text-gray-500">{item.uptime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
