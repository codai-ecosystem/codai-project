'use client';

import React, { useState } from 'react';
import {
  Brain,
  Zap,
  TrendingUp,
  Eye,
  Target,
  Layers,
  BarChart3,
  PieChart,
  Activity,
  Cpu,
  Network,
  Database,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Filter,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingDown,
  Gauge,
  Bot,
  Lightbulb,
  Workflow,
  Code2,
  FileText,
  MessageSquare
} from 'lucide-react';

interface IntelligenceModel {
  id: string;
  name: string;
  type: 'classification' | 'prediction' | 'recommendation' | 'analysis';
  status: 'active' | 'training' | 'idle' | 'error';
  accuracy: number;
  lastTrained: Date;
  predictions: number;
  confidence: number;
  version: string;
  description: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timestamp: Date;
  data: any;
}

const models: IntelligenceModel[] = [
  {
    id: '1',
    name: 'Code Quality Analyzer',
    type: 'analysis',
    status: 'active',
    accuracy: 94.2,
    lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    predictions: 15847,
    confidence: 0.91,
    version: 'v2.1.0',
    description: 'Analyzes code quality, complexity, and maintainability metrics'
  },
  {
    id: '2',
    name: 'Bug Prediction Engine',
    type: 'prediction',
    status: 'active',
    accuracy: 87.8,
    lastTrained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    predictions: 3892,
    confidence: 0.85,
    version: 'v1.8.2',
    description: 'Predicts potential bugs and vulnerabilities in code'
  },
  {
    id: '3',
    name: 'Performance Optimizer',
    type: 'recommendation',
    status: 'training',
    accuracy: 91.5,
    lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    predictions: 7234,
    confidence: 0.88,
    version: 'v3.0.1',
    description: 'Recommends performance optimizations for applications'
  },
  {
    id: '4',
    name: 'Security Classifier',
    type: 'classification',
    status: 'active',
    accuracy: 96.1,
    lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    predictions: 12456,
    confidence: 0.93,
    version: 'v2.5.0',
    description: 'Classifies security vulnerabilities and threat levels'
  },
  {
    id: '5',
    name: 'User Behavior Analytics',
    type: 'analysis',
    status: 'idle',
    accuracy: 89.3,
    lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    predictions: 9876,
    confidence: 0.82,
    version: 'v1.4.5',
    description: 'Analyzes user interaction patterns and behaviors'
  }
];

const insights: Insight[] = [
  {
    id: '1',
    title: 'Code Complexity Trend Increasing',
    description: 'Average cyclomatic complexity has increased by 15% over the last month',
    type: 'trend',
    confidence: 0.89,
    impact: 'medium',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    data: { change: 15, period: '30 days' }
  },
  {
    id: '2',
    title: 'Anomalous API Response Times',
    description: 'User authentication endpoints showing 3x normal response times',
    type: 'anomaly',
    confidence: 0.95,
    impact: 'high',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    data: { endpoint: '/api/auth', multiplier: 3 }
  },
  {
    id: '3',
    title: 'Recommended Database Optimization',
    description: 'Query optimization could improve performance by 40%',
    type: 'recommendation',
    confidence: 0.82,
    impact: 'high',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    data: { improvement: 40, queries: 15 }
  }
];

const performanceMetrics = [
  { name: 'Model Accuracy', value: 92.4, change: 2.1, trend: 'up' },
  { name: 'Prediction Speed', value: 156, change: -8.3, trend: 'down', unit: 'ms' },
  { name: 'Data Quality', value: 97.8, change: 1.2, trend: 'up' },
  { name: 'Confidence Score', value: 89.1, change: 0.8, trend: 'up' }
];

export default function IntelligencePage() {
  const [selectedModel, setSelectedModel] = useState<IntelligenceModel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showInsights, setShowInsights] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || model.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || model.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'training': return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'idle': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'idle': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'classification': return <Target className="w-4 h-4" />;
      case 'prediction': return <TrendingUp className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'analysis': return <BarChart3 className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ml-80">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Intelligence</h1>
              <p className="text-gray-600 mt-2">Advanced AI models and intelligent insights for your development workflow</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Brain className="w-4 h-4" />
                <span>Train Model</span>
              </button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{metric.name}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}{metric.unit || '%'}
                    </p>
                    <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {metric.trend === 'up' ?
                        <TrendingUp className="w-3 h-3 mr-1" /> :
                        <TrendingDown className="w-3 h-3 mr-1" />
                      }
                      <span>{Math.abs(metric.change)}%</span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Gauge className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Models */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search models..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                    />
                  </div>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="classification">Classification</option>
                    <option value="prediction">Prediction</option>
                    <option value="recommendation">Recommendation</option>
                    <option value="analysis">Analysis</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="training">Training</option>
                    <option value="idle">Idle</option>
                    <option value="error">Error</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Models Grid */}
            <div className="space-y-4">
              {filteredModels.map((model) => (
                <div
                  key={model.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTypeIcon(model.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                          <p className="text-sm text-gray-600">{model.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(model.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                            {model.status}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">v{model.version}</span>
                        <span className="text-sm text-gray-600 capitalize">{model.type}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Accuracy</p>
                          <p className="font-semibold text-gray-900">{model.accuracy}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Confidence</p>
                          <p className="font-semibold text-gray-900">{Math.round(model.confidence * 100)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Predictions</p>
                          <p className="font-semibold text-gray-900">{model.predictions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Last Trained</p>
                          <p className="font-semibold text-gray-900">
                            {Math.floor((Date.now() - model.lastTrained.getTime()) / (1000 * 60 * 60 * 24))}d ago
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Sidebar */}
          <div className="space-y-6">
            {/* Intelligence Insights */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                <button
                  onClick={() => setShowInsights(!showInsights)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {showInsights && (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${insight.type === 'anomaly' || insight.type === 'alert'
                            ? 'bg-red-100 text-red-600'
                            : insight.type === 'recommendation'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-green-100 text-green-600'
                          }`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                              {insight.impact}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                            <span>{Math.floor((Date.now() - insight.timestamp.getTime()) / (1000 * 60))}m ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Model Details */}
            {selectedModel && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Details</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedModel.name}</h4>
                    <p className="text-sm text-gray-600">{selectedModel.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium capitalize">{selectedModel.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Version</p>
                      <p className="font-medium">v{selectedModel.version}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(selectedModel.status)}
                        <span className="font-medium capitalize">{selectedModel.status}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Accuracy</p>
                      <p className="font-medium">{selectedModel.accuracy}%</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-col space-y-2">
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Play className="w-4 h-4" />
                        <span>Run Prediction</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        <RotateCcw className="w-4 h-4" />
                        <span>Retrain Model</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Deploy New Model</p>
                    <p className="text-sm text-gray-500">Create and deploy a new AI model</p>
                  </div>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">View Analytics</p>
                    <p className="text-sm text-gray-500">Analyze model performance metrics</p>
                  </div>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Manage Data</p>
                    <p className="text-sm text-gray-500">Configure training datasets</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
