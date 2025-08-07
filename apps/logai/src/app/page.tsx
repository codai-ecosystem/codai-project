'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, AlertTriangle, Shield, Activity,
  Search, Filter, RefreshCw, Download, Settings, Bell,
  Play, Pause, Square, Circle, Eye, EyeOff, ChevronDown,
  Server, Database, Monitor, Cpu, HardDrive, Network,
  Clock, Calendar, Hash, FileText, Code, Terminal,
  Zap, CheckCircle, XCircle, AlertCircle, Info,
  Users, Globe, Lock, Unlock, Key, Star, Heart,
  ArrowUp, ArrowDown, ArrowRight, MoreHorizontal,
  Grid3X3, List, SortAsc, Plus, Edit, Trash2, Copy,
  Target, Award, Layers, Bookmark, Tag, Link,
  PieChart, LineChart, Gauge, TrendingDown,
  ExternalLink, Share2, Archive, FolderOpen,
  Send, MessageSquare, Phone, Mail, HelpCircle
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  service: string;
  message: string;
  source: string;
  userId?: string;
  metadata?: Record<string, any>;
  tags: string[];
  environment: 'development' | 'staging' | 'production';
}

interface SystemMetric {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  change: number;
  icon: any;
}

interface Alert {
  id: string;
  title: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  service: string;
  count: number;
}

export default function LogAIPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('1h');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadSystemData();
  }, []);

  useEffect(() => {
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        loadSystemData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [realTimeEnabled]);

  const loadSystemData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    setMetrics([
      {
        id: '1',
        name: 'Total Logs',
        value: '2.4M',
        unit: 'entries',
        trend: 'up',
        status: 'healthy',
        change: 12.5,
        icon: FileText
      },
      {
        id: '2',
        name: 'Error Rate',
        value: '0.8%',
        unit: 'rate',
        trend: 'down',
        status: 'healthy',
        change: -2.1,
        icon: AlertTriangle
      },
      {
        id: '3',
        name: 'Response Time',
        value: '245ms',
        unit: 'avg',
        trend: 'stable',
        status: 'healthy',
        change: 0.3,
        icon: Clock
      },
      {
        id: '4',
        name: 'Active Services',
        value: '47',
        unit: 'services',
        trend: 'up',
        status: 'healthy',
        change: 5.2,
        icon: Server
      },
      {
        id: '5',
        name: 'Storage Used',
        value: '342GB',
        unit: 'total',
        trend: 'up',
        status: 'warning',
        change: 8.7,
        icon: Database
      },
      {
        id: '6',
        name: 'Throughput',
        value: '15.2K',
        unit: 'logs/min',
        trend: 'up',
        status: 'healthy',
        change: 23.4,
        icon: Activity
      }
    ]);

    setAlerts([
      {
        id: '1',
        title: 'High Error Rate in Payment Service',
        level: 'high',
        message: 'Payment service experiencing elevated error rates (4.2%)',
        timestamp: '2024-01-25T14:30:00Z',
        acknowledged: false,
        service: 'payment-service',
        count: 127
      },
      {
        id: '2',
        title: 'Database Connection Pool Warning',
        level: 'medium',
        message: 'Database connection pool utilization at 85%',
        timestamp: '2024-01-25T14:25:00Z',
        acknowledged: false,
        service: 'database-pool',
        count: 15
      },
      {
        id: '3',
        title: 'API Rate Limit Approaching',
        level: 'low',
        message: 'External API rate limit at 78% of daily quota',
        timestamp: '2024-01-25T14:20:00Z',
        acknowledged: true,
        service: 'external-api',
        count: 1
      }
    ]);

    setLogs([
      {
        id: '1',
        timestamp: '2024-01-25T14:30:25.123Z',
        level: 'ERROR',
        service: 'payment-service',
        message: 'Payment processing failed: Connection timeout to payment gateway',
        source: 'payment-processor.js:142',
        userId: 'user_12345',
        metadata: {
          transactionId: 'tx_789012',
          amount: 99.99,
          currency: 'USD',
          gateway: 'stripe'
        },
        tags: ['payment', 'timeout', 'gateway'],
        environment: 'production'
      },
      {
        id: '2',
        timestamp: '2024-01-25T14:30:20.891Z',
        level: 'INFO',
        service: 'auth-service',
        message: 'User login successful',
        source: 'auth-controller.js:67',
        userId: 'user_67890',
        metadata: {
          sessionId: 'sess_456789',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        },
        tags: ['auth', 'login', 'success'],
        environment: 'production'
      },
      {
        id: '3',
        timestamp: '2024-01-25T14:30:18.456Z',
        level: 'WARN',
        service: 'database-service',
        message: 'Query execution took longer than expected: 2.5s',
        source: 'db-query-executor.js:234',
        metadata: {
          query: 'SELECT * FROM orders WHERE...',
          executionTime: 2534,
          rowCount: 15420
        },
        tags: ['database', 'performance', 'slow-query'],
        environment: 'production'
      },
      {
        id: '4',
        timestamp: '2024-01-25T14:30:15.789Z',
        level: 'DEBUG',
        service: 'cache-service',
        message: 'Cache miss for key: user_profile_12345',
        source: 'redis-cache.js:89',
        metadata: {
          key: 'user_profile_12345',
          ttl: 3600
        },
        tags: ['cache', 'miss', 'redis'],
        environment: 'production'
      },
      {
        id: '5',
        timestamp: '2024-01-25T14:30:12.345Z',
        level: 'INFO',
        service: 'api-gateway',
        message: 'API request processed successfully',
        source: 'gateway.js:156',
        metadata: {
          endpoint: '/api/v1/users',
          method: 'GET',
          responseTime: 145,
          statusCode: 200
        },
        tags: ['api', 'gateway', 'success'],
        environment: 'production'
      },
      {
        id: '6',
        timestamp: '2024-01-25T14:30:08.912Z',
        level: 'FATAL',
        service: 'background-worker',
        message: 'Critical system failure: Out of memory',
        source: 'worker-process.js:45',
        metadata: {
          memoryUsage: '95%',
          availableMemory: '256MB',
          processId: 'worker_001'
        },
        tags: ['system', 'memory', 'fatal'],
        environment: 'production'
      }
    ]);

    setLoading(false);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'DEBUG': return 'text-gray-600 bg-gray-100';
      case 'INFO': return 'text-blue-600 bg-blue-100';
      case 'WARN': return 'text-yellow-600 bg-yellow-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      case 'FATAL': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (level: Alert['level']) => {
    switch (level) {
      case 'low': return 'border-blue-200 bg-blue-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: SystemMetric['trend']) => {
    switch (trend) {
      case 'up': return ArrowUp;
      case 'down': return ArrowDown;
      case 'stable': return ArrowRight;
      default: return ArrowRight;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesService = serviceFilter === 'all' || log.service === serviceFilter;

    return matchesSearch && matchesLevel && matchesService;
  });

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    const aValue = a[sortBy as keyof LogEntry];
    const bValue = b[sortBy as keyof LogEntry];

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const toggleLogSelection = (logId: string) => {
    setSelectedLogs(prev =>
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const selectAllLogs = () => {
    if (selectedLogs.length === sortedLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(sortedLogs.map(log => log.id));
    }
  };

  const totalLogs = logs.length;
  const errorCount = logs.filter(log => log.level === 'ERROR' || log.level === 'FATAL').length;
  const warningCount = logs.filter(log => log.level === 'WARN').length;
  const activeServices = new Set(logs.map(log => log.service)).size;
  const errorRate = totalLogs > 0 ? ((errorCount / totalLogs) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-blue-100/50 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    LogAI
                  </h1>
                  <p className="text-sm text-gray-600">Professional Logging & Analytics Platform</p>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-6 ml-8">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{totalLogs}</p>
                  <p className="text-xs text-gray-600">Total Logs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{errorCount}</p>
                  <p className="text-xs text-gray-600">Errors</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{activeServices}</p>
                  <p className="text-xs text-gray-600">Services</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{errorRate}%</p>
                  <p className="text-xs text-gray-600">Error Rate</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${realTimeEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {realTimeEnabled ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span className="text-sm">{realTimeEnabled ? 'Live' : 'Paused'}</span>
              </button>

              <button
                onClick={loadSystemData}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-1 bg-gray-100/50 rounded-xl p-1">
            {[
              { id: 'overview', label: 'Overview', icon: Monitor, href: null },
              { id: 'logs', label: 'Logs', icon: FileText, href: '/logs' },
              { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle, href: '/alerts' },
              { id: 'services', label: 'Services', icon: Server, href: '/services' },
              { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' }
            ].map((tab) => {
              const Icon = tab.icon;
              const Component = tab.href ? 'a' : 'button';
              return (
                <Component
                  key={tab.id}
                  {...(tab.href ? { href: tab.href } : { onClick: () => setSelectedTab(tab.id) })}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${selectedTab === tab.id
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Component>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* System Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                const TrendIcon = getTrendIcon(metric.trend);

                return (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                          <p className="text-xs text-gray-500">{metric.unit}</p>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <TrendIcon className={`w-3 h-3 ${metric.trend === 'up' ? 'text-green-600' :
                              metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                          <span className={`text-xs ${metric.change > 0 ? 'text-green-600' :
                              metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Recent Alerts */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <span>Active Alerts ({alerts.filter(a => !a.acknowledged).length})</span>
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getAlertColor(alert.level)} ${alert.acknowledged ? 'opacity-60' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full uppercase ${alert.level === 'critical' ? 'bg-red-100 text-red-700' :
                              alert.level === 'high' ? 'bg-orange-100 text-orange-700' :
                                alert.level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                            }`}>
                            {alert.level}
                          </span>
                          <span className="text-xs text-gray-500">{alert.service}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{alert.title}</h4>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-xs text-gray-500">×{alert.count}</span>
                        {!alert.acknowledged && (
                          <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Logs Preview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Recent Logs</span>
                </h2>
                <button
                  onClick={() => setSelectedTab('logs')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Logs
                </button>
              </div>

              <div className="space-y-2">
                {logs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className={`px-2 py-1 text-xs font-mono rounded ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="text-xs text-gray-500 font-mono w-20">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {log.service}
                    </span>
                    <span className="text-sm text-gray-900 flex-1 truncate">
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {selectedTab !== 'overview' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Feature
            </h3>
            <p className="text-gray-600 mb-4">
              Advanced {selectedTab} functionality will be implemented in the next phase.
            </p>
            <p className="text-sm text-gray-500">
              Coming soon with comprehensive logging and analytics tools.
            </p>
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-white/70 backdrop-blur-sm border-t border-blue-100/50 mt-12">
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-gray-900">LogAI</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Professional logging and analytics platform for monitoring, debugging, and optimizing your applications.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Logging</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Real-time Logs</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Log Search</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Log Analytics</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Log Storage</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Monitoring</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">System Metrics</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Alerts & Notifications</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Performance Tracking</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Service Health</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-100/50 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 LogAI Professional Logging Platform by CODAI. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
