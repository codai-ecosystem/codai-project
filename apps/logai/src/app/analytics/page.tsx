'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, LineChart, PieChart, TrendingUp, TrendingDown,
  Activity, Monitor, Server, Database, Globe, Users,
  Clock, Calendar, Hash, Filter, Download, RefreshCw,
  ArrowUp, ArrowDown, ArrowRight, MoreHorizontal,
  AlertTriangle, CheckCircle, XCircle, Info, Zap,
  Target, Award, Star, Heart, Eye, EyeOff, Search,
  Settings, Bell, Play, Pause, Square, Plus, Edit,
  Trash2, Copy, Share2, ExternalLink, Bookmark,
  FileText, Code, Terminal, Network, HardDrive,
  Cpu, Shield, Lock, Unlock, Key, Tag, Layers,
  Grid3X3, List, SortAsc, ChevronDown, ChevronRight,
  Gauge, Radar, Scatter, Map, Calendar as CalendarIcon,
  TrendingDown as TrendDown, BarChart2, DoughnutChart
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number | string;
  previousValue: number | string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  category: 'performance' | 'errors' | 'traffic' | 'system';
  icon: any;
  color: string;
}

interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

interface ServiceAnalytics {
  service: string;
  totalLogs: number;
  errorCount: number;
  errorRate: number;
  avgResponseTime: number;
  throughput: number;
  availability: number;
  lastActive: string;
  trend: 'up' | 'down' | 'stable';
}

interface LogLevelDistribution {
  level: string;
  count: number;
  percentage: number;
  color: string;
}

interface AlertMetric {
  id: string;
  type: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: number;
  lastTriggered: string;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalytics[]>([]);
  const [logLevelDistribution, setLogLevelDistribution] = useState<LogLevelDistribution[]>([]);
  const [alertMetrics, setAlertMetrics] = useState<AlertMetric[]>([]);
  const [topErrors, setTopErrors] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange, selectedService]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAnalyticsData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedTimeRange, selectedService]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Sample Analytics Metrics
    const sampleMetrics: AnalyticsMetric[] = [
      {
        id: '1',
        name: 'Total Logs',
        value: '2.4M',
        previousValue: '2.1M',
        change: 14.3,
        trend: 'up',
        unit: 'logs',
        category: 'traffic',
        icon: FileText,
        color: 'blue'
      },
      {
        id: '2',
        name: 'Error Rate',
        value: '0.8%',
        previousValue: '1.2%',
        change: -33.3,
        trend: 'down',
        unit: '%',
        category: 'errors',
        icon: XCircle,
        color: 'red'
      },
      {
        id: '3',
        name: 'Avg Response Time',
        value: '245ms',
        previousValue: '289ms',
        change: -15.2,
        trend: 'down',
        unit: 'ms',
        category: 'performance',
        icon: Clock,
        color: 'green'
      },
      {
        id: '4',
        name: 'Active Services',
        value: 47,
        previousValue: 43,
        change: 9.3,
        trend: 'up',
        unit: 'services',
        category: 'system',
        icon: Server,
        color: 'purple'
      },
      {
        id: '5',
        name: 'Throughput',
        value: '15.2K',
        previousValue: '13.8K',
        change: 10.1,
        trend: 'up',
        unit: 'req/min',
        category: 'traffic',
        icon: Activity,
        color: 'indigo'
      },
      {
        id: '6',
        name: 'System Availability',
        value: '99.97%',
        previousValue: '99.94%',
        change: 0.03,
        trend: 'up',
        unit: '%',
        category: 'system',
        icon: Shield,
        color: 'emerald'
      },
      {
        id: '7',
        name: 'Storage Used',
        value: '342GB',
        previousValue: '318GB',
        change: 7.5,
        trend: 'up',
        unit: 'GB',
        category: 'system',
        icon: HardDrive,
        color: 'yellow'
      },
      {
        id: '8',
        name: 'Alert Count',
        value: 23,
        previousValue: 31,
        change: -25.8,
        trend: 'down',
        unit: 'alerts',
        category: 'errors',
        icon: AlertTriangle,
        color: 'orange'
      }
    ];

    // Sample Time Series Data
    const sampleTimeSeriesData: TimeSeriesData[] = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      value: Math.floor(Math.random() * 1000) + 500,
      label: `${23 - i}:00`
    }));

    // Sample Service Analytics
    const sampleServiceAnalytics: ServiceAnalytics[] = [
      {
        service: 'payment-service',
        totalLogs: 450000,
        errorCount: 3600,
        errorRate: 0.8,
        avgResponseTime: 245,
        throughput: 2800,
        availability: 99.95,
        lastActive: '2024-01-25T14:30:00Z',
        trend: 'up'
      },
      {
        service: 'auth-service',
        totalLogs: 380000,
        errorCount: 1900,
        errorRate: 0.5,
        avgResponseTime: 180,
        throughput: 3200,
        availability: 99.98,
        lastActive: '2024-01-25T14:29:45Z',
        trend: 'stable'
      },
      {
        service: 'api-gateway',
        totalLogs: 620000,
        errorCount: 6200,
        errorRate: 1.0,
        avgResponseTime: 320,
        throughput: 4500,
        availability: 99.92,
        lastActive: '2024-01-25T14:30:15Z',
        trend: 'down'
      },
      {
        service: 'database-service',
        totalLogs: 290000,
        errorCount: 870,
        errorRate: 0.3,
        avgResponseTime: 89,
        throughput: 1800,
        availability: 99.99,
        lastActive: '2024-01-25T14:30:30Z',
        trend: 'up'
      },
      {
        service: 'notification-service',
        totalLogs: 180000,
        errorCount: 720,
        errorRate: 0.4,
        avgResponseTime: 456,
        throughput: 1200,
        availability: 99.94,
        lastActive: '2024-01-25T14:29:20Z',
        trend: 'stable'
      }
    ];

    // Sample Log Level Distribution
    const sampleLogDistribution: LogLevelDistribution[] = [
      { level: 'INFO', count: 1680000, percentage: 70.0, color: '#3B82F6' },
      { level: 'DEBUG', count: 480000, percentage: 20.0, color: '#6B7280' },
      { level: 'WARN', count: 168000, percentage: 7.0, color: '#F59E0B' },
      { level: 'ERROR', count: 60000, percentage: 2.5, color: '#EF4444' },
      { level: 'FATAL', count: 12000, percentage: 0.5, color: '#7C3AED' }
    ];

    // Sample Alert Metrics
    const sampleAlertMetrics: AlertMetric[] = [
      {
        id: '1',
        type: 'High Error Rate',
        count: 8,
        severity: 'high',
        trend: -20,
        lastTriggered: '2024-01-25T14:15:00Z'
      },
      {
        id: '2',
        type: 'Slow Response Time',
        count: 12,
        severity: 'medium',
        trend: 15,
        lastTriggered: '2024-01-25T14:20:00Z'
      },
      {
        id: '3',
        type: 'Service Down',
        count: 2,
        severity: 'critical',
        trend: -50,
        lastTriggered: '2024-01-25T13:45:00Z'
      },
      {
        id: '4',
        type: 'Memory Usage High',
        count: 5,
        severity: 'medium',
        trend: 25,
        lastTriggered: '2024-01-25T14:25:00Z'
      }
    ];

    // Sample Top Errors
    const sampleTopErrors = [
      {
        id: '1',
        message: 'Connection timeout to payment gateway',
        count: 145,
        service: 'payment-service',
        firstSeen: '2024-01-25T10:00:00Z',
        lastSeen: '2024-01-25T14:30:00Z',
        trend: 'up'
      },
      {
        id: '2',
        message: 'Database connection pool exhausted',
        count: 89,
        service: 'database-service',
        firstSeen: '2024-01-25T11:30:00Z',
        lastSeen: '2024-01-25T14:15:00Z',
        trend: 'down'
      },
      {
        id: '3',
        message: 'JWT token validation failed',
        count: 67,
        service: 'auth-service',
        firstSeen: '2024-01-25T09:15:00Z',
        lastSeen: '2024-01-25T14:20:00Z',
        trend: 'stable'
      },
      {
        id: '4',
        message: 'Rate limit exceeded',
        count: 56,
        service: 'api-gateway',
        firstSeen: '2024-01-25T12:45:00Z',
        lastSeen: '2024-01-25T14:28:00Z',
        trend: 'up'
      }
    ];

    // Sample Performance Data
    const samplePerformanceData = [
      { time: '00:00', cpu: 45, memory: 62, disk: 78, network: 34 },
      { time: '04:00', cpu: 38, memory: 58, disk: 81, network: 29 },
      { time: '08:00', cpu: 72, memory: 79, disk: 85, network: 67 },
      { time: '12:00', cpu: 89, memory: 91, disk: 88, network: 84 },
      { time: '16:00', cpu: 95, memory: 94, disk: 92, network: 91 },
      { time: '20:00', cpu: 67, memory: 71, disk: 86, network: 58 }
    ];

    setMetrics(sampleMetrics);
    setTimeSeriesData(sampleTimeSeriesData);
    setServiceAnalytics(sampleServiceAnalytics);
    setLogLevelDistribution(sampleLogDistribution);
    setAlertMetrics(sampleAlertMetrics);
    setTopErrors(sampleTopErrors);
    setPerformanceData(samplePerformanceData);
    setLoading(false);
  };

  const getMetricColor = (category: string) => {
    switch (category) {
      case 'performance': return 'from-green-500 to-emerald-500';
      case 'errors': return 'from-red-500 to-rose-500';
      case 'traffic': return 'from-blue-500 to-indigo-500';
      case 'system': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowUp;
      case 'down': return ArrowDown;
      case 'stable': return ArrowRight;
      default: return ArrowRight;
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'stable') return 'text-gray-600';
    if (change > 0) return trend === 'up' ? 'text-green-600' : 'text-red-600';
    if (change < 0) return trend === 'down' ? 'text-green-600' : 'text-red-600';
    return 'text-gray-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredMetrics = selectedMetric === 'all'
    ? metrics
    : metrics.filter(metric => metric.category === selectedMetric);

  const filteredServices = selectedService === 'all'
    ? serviceAnalytics
    : serviceAnalytics.filter(service => service.service === selectedService);

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
                    Log Analytics
                  </h1>
                  <p className="text-sm text-gray-600">Advanced insights and performance metrics</p>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-6 ml-8">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{metrics.length}</p>
                  <p className="text-xs text-gray-600">Metrics</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{serviceAnalytics.length}</p>
                  <p className="text-xs text-gray-600">Services</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{alertMetrics.length}</p>
                  <p className="text-xs text-gray-600">Alert Types</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedTimeRange}</p>
                  <p className="text-xs text-gray-600">Time Range</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${autoRefresh
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {autoRefresh ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span className="text-sm">{autoRefresh ? 'Auto' : 'Manual'}</span>
              </button>

              <button
                onClick={loadAnalyticsData}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
            >
              <option value="all">All Metrics</option>
              <option value="performance">Performance</option>
              <option value="errors">Errors</option>
              <option value="traffic">Traffic</option>
              <option value="system">System</option>
            </select>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70"
            >
              <option value="all">All Services</option>
              {serviceAnalytics.map(service => (
                <option key={service.service} value={service.service}>
                  {service.service}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white/70 rounded-xl p-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMetrics.map((metric, index) => {
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
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getMetricColor(metric.category)} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend, metric.change)}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{Math.abs(metric.change)}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <p className="text-xs text-gray-500">
                        Previous: {metric.previousValue} {metric.unit}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time Series Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Log Volume Trend</h3>
                  <div className="flex items-center space-x-2">
                    <LineChart className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">24 hours</span>
                  </div>
                </div>

                <div className="h-64 flex items-end justify-between space-x-1">
                  {timeSeriesData.slice(0, 12).map((data, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-8 bg-gradient-to-t from-blue-600 to-indigo-600 rounded-t-sm"
                        style={{ height: `${(data.value / 1000) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">
                        {data.label?.split(':')[0]}h
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Log Level Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Log Level Distribution</h3>
                  <PieChart className="w-5 h-5 text-blue-600" />
                </div>

                <div className="space-y-4">
                  {logLevelDistribution.map((level) => (
                    <div key={level.level} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: level.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">{level.level}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{level.count.toLocaleString()}</span>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {level.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Service Analytics Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50"
            >
              <div className="p-6 border-b border-blue-100/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Service Performance</h3>
                  <div className="flex items-center space-x-2">
                    <Server className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">{filteredServices.length} services</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Logs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Error Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Response
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Throughput
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Availability
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {filteredServices.map((service) => {
                      const TrendIcon = getTrendIcon(service.trend);
                      return (
                        <tr key={service.service} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Server className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{service.service}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {service.totalLogs.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${service.errorRate < 0.5 ? 'text-green-600 bg-green-100' :
                                service.errorRate < 1.0 ? 'text-yellow-600 bg-yellow-100' :
                                  'text-red-600 bg-red-100'
                              }`}>
                              {service.errorRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {service.avgResponseTime}ms
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {service.throughput.toLocaleString()}/min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${service.availability >= 99.95 ? 'text-green-600 bg-green-100' :
                                service.availability >= 99.9 ? 'text-yellow-600 bg-yellow-100' :
                                  'text-red-600 bg-red-100'
                              }`}>
                              {service.availability}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center space-x-1 ${getTrendColor(service.trend, 0)}`}>
                              <TrendIcon className="w-4 h-4" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Bottom Row - Alerts and Top Errors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Alert Metrics */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Alert Summary</h3>
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>

                <div className="space-y-4">
                  {alertMetrics.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{alert.type}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{alert.count}</span>
                        <div className={`flex items-center space-x-1 ${alert.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {alert.trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          <span className="text-xs">{Math.abs(alert.trend)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top Errors */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/70 backdrop-blur-sm rounded-xl border border-blue-100/50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Top Errors</h3>
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>

                <div className="space-y-4">
                  {topErrors.map((error) => {
                    const TrendIcon = getTrendIcon(error.trend);
                    return (
                      <div key={error.id} className="p-4 bg-gray-50/50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                              {error.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{error.service}</span>
                              <span>{error.count} occurrences</span>
                            </div>
                          </div>
                          <div className={`flex items-center space-x-1 ml-4 ${getTrendColor(error.trend, 0)}`}>
                            <TrendIcon className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-white/70 backdrop-blur-sm border-t border-blue-100/50 mt-12">
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Advanced Analytics</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Deep insights into your application performance and behavior patterns.
              </p>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Explore Metrics →
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Performance Optimization</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Identify bottlenecks and optimize your system performance.
              </p>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                View Recommendations →
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Custom Dashboards</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Create personalized dashboards tailored to your specific needs.
              </p>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                Build Dashboard →
              </button>
            </div>
          </div>

          <div className="border-t border-blue-100/50 mt-8 pt-6 text-center">
            <p className="text-sm text-gray-600">
              © 2024 LogAI Professional Analytics Platform by CODAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
