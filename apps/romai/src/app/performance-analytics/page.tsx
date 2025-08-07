'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  Memory,
  Zap,
  Clock,
  Target,
  Brain,
  Flag,
  Globe,
  Users,
  MessageSquare,
  Eye,
  Mic,
  FileText,
  Search,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  Gauge,
  LineChart,
  PieChart,
  BarChart,
  Monitor,
  Server,
  Database,
  Network,
  Shield,
  Rocket,
  Layers,
  Code,
  Fingerprint,
  Headphones,
  Image,
  Video
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  icon: React.ElementType;
  description: string;
  historical_data: number[];
}

interface SystemMetric {
  name: string;
  current: number;
  average: number;
  peak: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface CapabilityPerformance {
  capability: string;
  accuracy: number;
  speed: number;
  cultural_accuracy: number;
  usage_count: number;
  satisfaction: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
}

interface BenchmarkComparison {
  metric: string;
  romai_score: number;
  industry_average: number;
  best_in_class: number;
  unit: string;
  ranking: number;
  total_competitors: number;
}

export default function PerformanceAnalytics() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [realTimeData, setRealTimeData] = useState(true);

  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'overall_performance',
      name: 'Overall Performance',
      value: 94.8,
      unit: '%',
      change: 2.3,
      trend: 'up',
      target: 95.0,
      status: 'excellent',
      icon: Brain,
      description: 'Comprehensive AI performance across all capabilities',
      historical_data: [92.1, 92.8, 93.4, 94.1, 94.8]
    },
    {
      id: 'romanian_accuracy',
      name: 'Romanian Processing Accuracy',
      value: 97.2,
      unit: '%',
      change: 0.8,
      trend: 'up',
      target: 97.0,
      status: 'excellent',
      icon: Flag,
      description: 'Accuracy in Romanian language understanding and generation',
      historical_data: [96.1, 96.4, 96.7, 96.9, 97.2]
    },
    {
      id: 'response_time',
      name: 'Average Response Time',
      value: 1.3,
      unit: 'ms',
      change: -0.2,
      trend: 'down',
      target: 1.5,
      status: 'excellent',
      icon: Zap,
      description: 'Average response time for AI queries',
      historical_data: [1.7, 1.6, 1.5, 1.4, 1.3]
    },
    {
      id: 'cultural_intelligence',
      name: 'Cultural Intelligence Score',
      value: 96.8,
      unit: '%',
      change: 1.2,
      trend: 'up',
      target: 96.0,
      status: 'excellent',
      icon: Flag,
      description: 'Understanding of Romanian cultural context and nuances',
      historical_data: [94.8, 95.3, 95.8, 96.3, 96.8]
    },
    {
      id: 'throughput',
      name: 'Query Throughput',
      value: 15847,
      unit: 'req/min',
      change: 847,
      trend: 'up',
      target: 15000,
      status: 'excellent',
      icon: Activity,
      description: 'Number of queries processed per minute',
      historical_data: [14200, 14600, 15000, 15400, 15847]
    },
    {
      id: 'availability',
      name: 'System Availability',
      value: 99.97,
      unit: '%',
      change: 0.02,
      trend: 'up',
      target: 99.95,
      status: 'excellent',
      icon: CheckCircle,
      description: 'System uptime and availability',
      historical_data: [99.93, 99.94, 99.95, 99.96, 99.97]
    }
  ];

  const systemMetrics: SystemMetric[] = [
    {
      name: 'CPU Usage',
      current: 67.3,
      average: 72.1,
      peak: 89.4,
      unit: '%',
      status: 'healthy',
      trend: 'stable'
    },
    {
      name: 'Memory Usage',
      current: 78.6,
      average: 76.2,
      peak: 91.8,
      unit: '%',
      status: 'healthy',
      trend: 'up'
    },
    {
      name: 'GPU Utilization',
      current: 84.2,
      average: 81.7,
      peak: 96.3,
      unit: '%',
      status: 'healthy',
      trend: 'up'
    },
    {
      name: 'Network I/O',
      current: 245.8,
      average: 198.4,
      peak: 367.2,
      unit: 'MB/s',
      status: 'healthy',
      trend: 'up'
    },
    {
      name: 'Disk I/O',
      current: 156.3,
      average: 142.7,
      peak: 289.1,
      unit: 'MB/s',
      status: 'healthy',
      trend: 'stable'
    },
    {
      name: 'Active Connections',
      current: 2847,
      average: 2654,
      peak: 4231,
      unit: 'connections',
      status: 'healthy',
      trend: 'up'
    }
  ];

  const capabilityPerformance: CapabilityPerformance[] = [
    {
      capability: 'Romanian NLP',
      accuracy: 97.2,
      speed: 98.5,
      cultural_accuracy: 96.8,
      usage_count: 45623,
      satisfaction: 96.7,
      trend: 'up',
      icon: Flag
    },
    {
      capability: 'Translation',
      accuracy: 95.8,
      speed: 97.1,
      cultural_accuracy: 94.2,
      usage_count: 32184,
      satisfaction: 94.9,
      trend: 'up',
      icon: Globe
    },
    {
      capability: 'Conversation',
      accuracy: 94.6,
      speed: 96.8,
      cultural_accuracy: 93.1,
      usage_count: 67892,
      satisfaction: 95.3,
      trend: 'up',
      icon: MessageSquare
    },
    {
      capability: 'Vision Processing',
      accuracy: 92.3,
      speed: 91.8,
      cultural_accuracy: 89.7,
      usage_count: 18453,
      satisfaction: 91.2,
      trend: 'stable',
      icon: Eye
    },
    {
      capability: 'Audio Processing',
      accuracy: 95.1,
      speed: 94.2,
      cultural_accuracy: 93.4,
      usage_count: 12876,
      satisfaction: 93.8,
      trend: 'up',
      icon: Mic
    },
    {
      capability: 'Code Generation',
      accuracy: 91.8,
      speed: 96.3,
      cultural_accuracy: 88.4,
      usage_count: 9234,
      satisfaction: 89.7,
      trend: 'up',
      icon: Code
    }
  ];

  const benchmarkComparisons: BenchmarkComparison[] = [
    {
      metric: 'Romanian Language Accuracy',
      romai_score: 97.2,
      industry_average: 78.4,
      best_in_class: 89.3,
      unit: '%',
      ranking: 1,
      total_competitors: 12
    },
    {
      metric: 'Cultural Understanding',
      romai_score: 96.8,
      industry_average: 62.1,
      best_in_class: 74.8,
      unit: '%',
      ranking: 1,
      total_competitors: 8
    },
    {
      metric: 'Response Time',
      romai_score: 1.3,
      industry_average: 4.7,
      best_in_class: 2.1,
      unit: 'ms',
      ranking: 1,
      total_competitors: 15
    },
    {
      metric: 'Multi-modal Integration',
      romai_score: 89.4,
      industry_average: 71.2,
      best_in_class: 84.6,
      unit: '%',
      ranking: 1,
      total_competitors: 10
    },
    {
      metric: 'System Availability',
      romai_score: 99.97,
      industry_average: 99.2,
      best_in_class: 99.8,
      unit: '%',
      ranking: 1,
      total_competitors: 20
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Performance Overview', icon: BarChart3 },
    { id: 'realtime', label: 'Real-time Monitoring', icon: Activity },
    { id: 'capabilities', label: 'Capability Performance', icon: Brain },
    { id: 'system', label: 'System Metrics', icon: Server },
    { id: 'benchmarks', label: 'Benchmarks', icon: Target },
    { id: 'optimization', label: 'Optimization Insights', icon: Rocket }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string, change?: number) => {
    const isNegativeGood = change !== undefined && change < 0;
    switch (trend) {
      case 'up': 
        return <ArrowUp className={`w-4 h-4 ${isNegativeGood ? 'text-red-500' : 'text-green-500'}`} />;
      case 'down': 
        return <ArrowDown className={`w-4 h-4 ${isNegativeGood ? 'text-green-500' : 'text-red-500'}`} />;
      default: 
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      {/* Enhanced Header */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm border-b border-red-200/50 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                  Performance Analytics
                </h1>
                <p className="text-sm text-gray-600">Real-time Romanian AI Performance Monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">94.8% Performance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">1.3ms Response</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">99.97% Uptime</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 bg-white"
                >
                  <option value="1h">Last 1 hour</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
                
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabbed Navigation */}
      <div className="bg-white/50 backdrop-blur-sm border-b border-red-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {selectedTab === 'overview' && (
            <>
              {/* Performance Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {performanceMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <motion.div
                      key={metric.id}
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                          {metric.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-3xl font-bold text-gray-900">
                            {metric.name === 'Query Throughput' ? metric.value.toLocaleString() : metric.value}
                          </span>
                          <span className="text-lg text-gray-600">{metric.unit}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {getTrendIcon(metric.trend, metric.change)}
                          <span className={`text-sm ${
                            (metric.trend === 'up' && metric.change > 0) || (metric.trend === 'down' && metric.change < 0)
                              ? 'text-green-600' : metric.trend === 'stable' 
                              ? 'text-gray-600' : 'text-red-600'
                          }`}>
                            {metric.change > 0 ? '+' : ''}{metric.change}{metric.unit} vs last period
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{metric.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Target: {metric.target}{metric.unit}</span>
                          <span className={`font-medium ${
                            metric.value >= metric.target ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {metric.value >= metric.target ? 'Target Met' : 'Below Target'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min((metric.value / (metric.target * 1.1)) * 100, 100)}%` 
                            }}
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${Math.min((metric.value / (metric.target * 1.1)) * 100, 100)}%` 
                            }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Performance Trends Chart */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors">
                      Overall Performance
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors">
                      Romanian Accuracy
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors">
                      Response Time
                    </button>
                  </div>
                </div>
                
                <div className="h-64 bg-gradient-to-br from-red-50 to-yellow-50 rounded-lg border border-red-200 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="w-12 h-12 text-red-600 mx-auto mb-2" />
                    <p className="text-red-800 font-semibold">Performance Trends Chart</p>
                    <p className="text-red-600 text-sm">Real-time performance visualization</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Flag className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">97.2%</h4>
                  <p className="text-sm text-gray-600">Romanian Accuracy</p>
                </motion.div>

                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200/50 shadow-sm text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">1.3ms</h4>
                  <p className="text-sm text-gray-600">Response Time</p>
                </motion.div>

                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-200/50 shadow-sm text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">15,847</h4>
                  <p className="text-sm text-gray-600">Queries/Min</p>
                </motion.div>

                <motion.div
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">99.97%</h4>
                  <p className="text-sm text-gray-600">Uptime</p>
                </motion.div>
              </div>
            </>
          )}

          {selectedTab === 'capabilities' && (
            <>
              {/* Capability Performance Analysis */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Capability Performance Analysis</h3>
                
                <div className="space-y-6">
                  {capabilityPerformance.map((capability, index) => {
                    const Icon = capability.icon;
                    return (
                      <motion.div
                        key={capability.capability}
                        className="border border-gray-200 rounded-lg p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900">{capability.capability}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(capability.trend)}
                            <span className="text-sm text-gray-600">{capability.usage_count.toLocaleString()} uses</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Accuracy</p>
                            <p className="text-2xl font-bold text-gray-900">{capability.accuracy}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <motion.div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${capability.accuracy}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${capability.accuracy}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-gray-600">Speed</p>
                            <p className="text-2xl font-bold text-gray-900">{capability.speed}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <motion.div
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{ width: `${capability.speed}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${capability.speed}%` }}
                                transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                              />
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-gray-600">Cultural</p>
                            <p className="text-2xl font-bold text-gray-900">{capability.cultural_accuracy}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <motion.div
                                className="bg-orange-500 h-2 rounded-full"
                                style={{ width: `${capability.cultural_accuracy}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${capability.cultural_accuracy}%` }}
                                transition={{ duration: 1, delay: index * 0.1 + 0.4 }}
                              />
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-gray-600">Satisfaction</p>
                            <p className="text-2xl font-bold text-gray-900">{capability.satisfaction}%</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <motion.div
                                className="bg-red-600 h-2 rounded-full"
                                style={{ width: `${capability.satisfaction}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${capability.satisfaction}%` }}
                                transition={{ duration: 1, delay: index * 0.1 + 0.6 }}
                              />
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-gray-600">Usage</p>
                            <p className="text-2xl font-bold text-gray-900">{(capability.usage_count / 1000).toFixed(0)}K</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <motion.div
                                className="bg-gradient-to-r from-red-500 to-yellow-500 h-2 rounded-full"
                                style={{ width: `${Math.min((capability.usage_count / 70000) * 100, 100)}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((capability.usage_count / 70000) * 100, 100)}%` }}
                                transition={{ duration: 1, delay: index * 0.1 + 0.8 }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {selectedTab === 'system' && (
            <>
              {/* System Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.name}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                      <span className={`text-sm font-medium ${getSystemStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current</span>
                        <span className="font-semibold text-gray-900">
                          {metric.name === 'Active Connections' ? metric.current.toLocaleString() : metric.current}{metric.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Average</span>
                        <span className="font-semibold text-gray-700">
                          {metric.name === 'Active Connections' ? metric.average.toLocaleString() : metric.average}{metric.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Peak</span>
                        <span className="font-semibold text-gray-700">
                          {metric.name === 'Active Connections' ? metric.peak.toLocaleString() : metric.peak}{metric.unit}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Usage Level</span>
                        <span className="text-xs text-gray-600">{metric.current}{metric.unit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                          className={`h-3 rounded-full ${
                            metric.current / metric.peak <= 0.7 ? 'bg-green-500' :
                            metric.current / metric.peak <= 0.85 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(metric.current / metric.peak) * 100}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(metric.current / metric.peak) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* System Health Overview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">Healthy</h4>
                    <p className="text-sm text-gray-600">System Status</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Server className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">8</h4>
                    <p className="text-sm text-gray-600">Active Servers</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Database className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">3</h4>
                    <p className="text-sm text-gray-600">Database Clusters</p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">100%</h4>
                    <p className="text-sm text-gray-600">Security Score</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {selectedTab === 'benchmarks' && (
            <>
              {/* Benchmark Comparisons */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200/50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Industry Benchmark Comparisons</h3>
                
                <div className="space-y-6">
                  {benchmarkComparisons.map((benchmark, index) => (
                    <motion.div
                      key={benchmark.metric}
                      className="border border-gray-200 rounded-lg p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">{benchmark.metric}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-medium">
                            #{benchmark.ranking} of {benchmark.total_competitors}
                          </span>
                          <span className="text-sm text-gray-600">competitors</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">RomAI Score</h5>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-red-600">
                              {benchmark.metric === 'Response Time' ? benchmark.romai_score : benchmark.romai_score}
                            </span>
                            <span className="text-gray-600">{benchmark.unit}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <motion.div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ 
                                width: benchmark.metric === 'Response Time' 
                                  ? `${Math.max(100 - (benchmark.romai_score / benchmark.best_in_class) * 100, 10)}%`
                                  : `${(benchmark.romai_score / Math.max(benchmark.romai_score, benchmark.best_in_class)) * 100}%`
                              }}
                              initial={{ width: 0 }}
                              animate={{ 
                                width: benchmark.metric === 'Response Time' 
                                  ? `${Math.max(100 - (benchmark.romai_score / benchmark.best_in_class) * 100, 10)}%`
                                  : `${(benchmark.romai_score / Math.max(benchmark.romai_score, benchmark.best_in_class)) * 100}%`
                              }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Industry Average</h5>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-600">{benchmark.industry_average}</span>
                            <span className="text-gray-600">{benchmark.unit}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <motion.div
                              className="bg-gray-400 h-2 rounded-full"
                              style={{ 
                                width: benchmark.metric === 'Response Time' 
                                  ? `${Math.max(100 - (benchmark.industry_average / benchmark.best_in_class) * 100, 10)}%`
                                  : `${(benchmark.industry_average / Math.max(benchmark.romai_score, benchmark.best_in_class)) * 100}%`
                              }}
                              initial={{ width: 0 }}
                              animate={{ 
                                width: benchmark.metric === 'Response Time' 
                                  ? `${Math.max(100 - (benchmark.industry_average / benchmark.best_in_class) * 100, 10)}%`
                                  : `${(benchmark.industry_average / Math.max(benchmark.romai_score, benchmark.best_in_class)) * 100}%`
                              }}
                              transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                            />
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Best in Class</h5>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-yellow-600">{benchmark.best_in_class}</span>
                            <span className="text-gray-600">{benchmark.unit}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <motion.div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ 
                                width: benchmark.metric === 'Response Time' 
                                  ? `${Math.max(100 - (benchmark.best_in_class / benchmark.best_in_class) * 100, 10)}%`
                                  : `${(benchmark.best_in_class / Math.max(benchmark.romai_score, benchmark.best_in_class)) * 100}%`
                              }}
                              initial={{ width: 0 }}
                              animate={{ 
                                width: benchmark.metric === 'Response Time' 
                                  ? `${Math.max(100 - (benchmark.best_in_class / benchmark.best_in_class) * 100, 10)}%`
                                  : `${(benchmark.best_in_class / Math.max(benchmark.romai_score, benchmark.best_in_class)) * 100}%`
                              }}
                              transition={{ duration: 1, delay: index * 0.1 + 0.4 }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          <strong>RomAI Advantage:</strong> 
                          {benchmark.metric === 'Response Time' 
                            ? ` ${((benchmark.industry_average - benchmark.romai_score) / benchmark.industry_average * 100).toFixed(1)}% faster than industry average`
                            : ` ${((benchmark.romai_score - benchmark.industry_average) / benchmark.industry_average * 100).toFixed(1)}% better than industry average`
                          }
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Other tabs content will be implemented in subsequent updates */}
          {!['overview', 'capabilities', 'system', 'benchmarks'].includes(selectedTab) && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-red-200/50 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {tabs.find(tab => tab.id === selectedTab)?.label} Features
              </h3>
              <p className="text-gray-600 mb-4">
                Advanced {tabs.find(tab => tab.id === selectedTab)?.label.toLowerCase()} capabilities coming soon.
              </p>
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto">
                {React.createElement(tabs.find(tab => tab.id === selectedTab)?.icon || BarChart3, { 
                  className: "w-8 h-8 text-white" 
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        className="bg-white/80 backdrop-blur-sm border-t border-red-200/50 mt-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
              <BarChart3 className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="font-semibold text-red-900 mb-2">Real-time Analytics</h3>
              <p className="text-red-700 text-sm">Comprehensive performance monitoring with real-time metrics, trends analysis, and predictive insights.</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
              <Target className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-semibold text-yellow-900 mb-2">Industry Leading</h3>
              <p className="text-yellow-700 text-sm">Consistently outperforming industry benchmarks across all key metrics with world-class Romanian AI capabilities.</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
              <Rocket className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-orange-900 mb-2">Continuous Optimization</h3>
              <p className="text-orange-700 text-sm">Advanced optimization algorithms and performance tuning for maximum efficiency and cultural accuracy.</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
