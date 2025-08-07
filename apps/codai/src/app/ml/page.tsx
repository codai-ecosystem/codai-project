'use client';

import React, { useState } from 'react';
import {
  Brain,
  Cpu,
  Database,
  BarChart3,
  TrendingUp,
  Settings,
  Play,
  Pause,
  Square,
  RotateCcw,
  Download,
  Upload,
  FileText,
  Code2,
  Layers,
  Network,
  Zap,
  Eye,
  Target,
  Gauge,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Calendar,
  LineChart,
  PieChart,
  BarChart,
  Workflow,
  Bot,
  TestTube,
  Microscope,
  Beaker
} from 'lucide-react';

interface MLModel {
  id: string;
  name: string;
  type: 'supervised' | 'unsupervised' | 'reinforcement' | 'deep_learning';
  algorithm: string;
  status: 'training' | 'deployed' | 'idle' | 'failed';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingProgress: number;
  epochs: number;
  currentEpoch: number;
  lastTrained: Date;
  datasetSize: number;
  version: string;
  description: string;
}

interface Experiment {
  id: string;
  name: string;
  model: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  startTime: Date;
  duration: number;
  parameters: Record<string, any>;
  results: Record<string, number>;
}

const models: MLModel[] = [
  {
    id: '1',
    name: 'Code Classification Model',
    type: 'supervised',
    algorithm: 'Random Forest',
    status: 'deployed',
    accuracy: 94.2,
    precision: 93.8,
    recall: 94.6,
    f1Score: 94.2,
    trainingProgress: 100,
    epochs: 50,
    currentEpoch: 50,
    lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    datasetSize: 125000,
    version: 'v2.1.0',
    description: 'Classifies code snippets by programming language and complexity'
  },
  {
    id: '2',
    name: 'Bug Detection Neural Network',
    type: 'deep_learning',
    algorithm: 'CNN + LSTM',
    status: 'training',
    accuracy: 87.5,
    precision: 86.2,
    recall: 88.9,
    f1Score: 87.5,
    trainingProgress: 73,
    epochs: 100,
    currentEpoch: 73,
    lastTrained: new Date(Date.now() - 6 * 60 * 60 * 1000),
    datasetSize: 89000,
    version: 'v1.8.3',
    description: 'Deep learning model for detecting potential bugs in source code'
  },
  {
    id: '3',
    name: 'Performance Predictor',
    type: 'supervised',
    algorithm: 'Gradient Boosting',
    status: 'deployed',
    accuracy: 91.8,
    precision: 90.5,
    recall: 93.1,
    f1Score: 91.8,
    trainingProgress: 100,
    epochs: 200,
    currentEpoch: 200,
    lastTrained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    datasetSize: 67000,
    version: 'v3.2.1',
    description: 'Predicts application performance based on code metrics'
  },
  {
    id: '4',
    name: 'Code Style Clustering',
    type: 'unsupervised',
    algorithm: 'K-Means',
    status: 'idle',
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
    trainingProgress: 100,
    epochs: 1,
    currentEpoch: 1,
    lastTrained: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    datasetSize: 45000,
    version: 'v1.0.5',
    description: 'Clusters code by style patterns and conventions'
  }
];

const experiments: Experiment[] = [
  {
    id: '1',
    name: 'Hyperparameter Tuning - Learning Rate',
    model: 'Bug Detection Neural Network',
    status: 'running',
    progress: 67,
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    duration: 180,
    parameters: { learning_rate: 0.001, batch_size: 32, dropout: 0.3 },
    results: { accuracy: 87.8, loss: 0.234 }
  },
  {
    id: '2',
    name: 'Feature Selection Analysis',
    model: 'Performance Predictor',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: 120,
    parameters: { features: 15, selection_method: 'recursive' },
    results: { accuracy: 93.2, feature_importance: 0.78 }
  },
  {
    id: '3',
    name: 'Architecture Comparison',
    model: 'Code Classification Model',
    status: 'queued',
    progress: 0,
    startTime: new Date(),
    duration: 0,
    parameters: { architectures: ['rf', 'svm', 'xgb'] },
    results: {}
  }
];

const trainingMetrics = [
  { name: 'Training Loss', value: 0.125, change: -12.5, trend: 'down' },
  { name: 'Validation Accuracy', value: 94.2, change: 2.1, trend: 'up' },
  { name: 'Learning Rate', value: 0.001, change: 0, trend: 'stable' },
  { name: 'Batch Size', value: 32, change: 0, trend: 'stable' }
];

export default function MLPage() {
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [activeTab, setActiveTab] = useState('models');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showMetrics, setShowMetrics] = useState(true);

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.algorithm.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || model.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || model.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'training': return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'deployed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'idle': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'supervised': return <Target className="w-4 h-4" />;
      case 'unsupervised': return <Network className="w-4 h-4" />;
      case 'reinforcement': return <Bot className="w-4 h-4" />;
      case 'deep_learning': return <Layers className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getExperimentStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'queued': return 'bg-yellow-100 text-yellow-800';
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
              <h1 className="text-3xl font-bold text-gray-900">Machine Learning</h1>
              <p className="text-gray-600 mt-2">Train, deploy, and manage machine learning models</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <TestTube className="w-4 h-4" />
                <span>Experiment</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                <span>New Model</span>
              </button>
            </div>
          </div>
        </div>

        {/* Training Metrics */}
        {showMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {trainingMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    {metric.change !== 0 && (
                      <div className={`flex items-center text-sm mt-1 ${metric.trend === 'up' ? 'text-green-600' :
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {metric.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                        {metric.trend === 'down' && <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                        <span>{Math.abs(metric.change)}%</span>
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('models')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'models'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Models
              </button>
              <button
                onClick={() => setActiveTab('experiments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'experiments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Experiments
              </button>
              <button
                onClick={() => setActiveTab('datasets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'datasets'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Datasets
              </button>
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'models' && (
              <>
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
                        <option value="supervised">Supervised</option>
                        <option value="unsupervised">Unsupervised</option>
                        <option value="reinforcement">Reinforcement</option>
                        <option value="deep_learning">Deep Learning</option>
                      </select>

                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Status</option>
                        <option value="training">Training</option>
                        <option value="deployed">Deployed</option>
                        <option value="idle">Idle</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Models List */}
                <div className="space-y-4">
                  {filteredModels.map((model) => (
                    <div
                      key={model.id}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedModel(model)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              {getTypeIcon(model.type)}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-600">{model.algorithm}</span>
                                <span className="text-sm text-gray-400">•</span>
                                <span className="text-sm text-gray-600">v{model.version}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-4">{model.description}</p>

                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(model.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                                {model.status}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600 capitalize">{model.type.replace('_', ' ')}</span>
                          </div>

                          {model.status === 'training' && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>Training Progress</span>
                                <span>{model.trainingProgress}% ({model.currentEpoch}/{model.epochs} epochs)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${model.trainingProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Accuracy</p>
                              <p className="font-semibold text-gray-900">{model.accuracy}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Precision</p>
                              <p className="font-semibold text-gray-900">{model.precision}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Recall</p>
                              <p className="font-semibold text-gray-900">{model.recall}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">F1 Score</p>
                              <p className="font-semibold text-gray-900">{model.f1Score}%</p>
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
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'experiments' && (
              <div className="space-y-4">
                {experiments.map((experiment) => (
                  <div key={experiment.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Beaker className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{experiment.name}</h3>
                            <p className="text-sm text-gray-600">Model: {experiment.model}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getExperimentStatusColor(experiment.status)}`}>
                            {experiment.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            Duration: {Math.floor(experiment.duration / 60)}h {experiment.duration % 60}m
                          </span>
                        </div>

                        {experiment.status === 'running' && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{experiment.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${experiment.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Parameters</p>
                            <div className="space-y-1">
                              {Object.entries(experiment.parameters).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{key.replace('_', ' ')}</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Results</p>
                            <div className="space-y-1">
                              {Object.entries(experiment.results).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{key}</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {experiment.status === 'running' && (
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                      <p className="text-gray-500">Algorithm</p>
                      <p className="font-medium">{selectedModel.algorithm}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium capitalize">{selectedModel.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(selectedModel.status)}
                        <span className="font-medium capitalize">{selectedModel.status}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Version</p>
                      <p className="font-medium">v{selectedModel.version}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Dataset Size</p>
                        <p className="font-medium">{selectedModel.datasetSize.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Trained</p>
                        <p className="font-medium">
                          {Math.floor((Date.now() - selectedModel.lastTrained.getTime()) / (1000 * 60 * 60 * 24))}d ago
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-col space-y-2">
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Play className="w-4 h-4" />
                        <span>Deploy Model</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        <RotateCcw className="w-4 h-4" />
                        <span>Retrain</span>
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
                  <Brain className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Create Model</p>
                    <p className="text-sm text-gray-500">Start a new ML model</p>
                  </div>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                  <TestTube className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Run Experiment</p>
                    <p className="text-sm text-gray-500">Test model variations</p>
                  </div>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Upload Dataset</p>
                    <p className="text-sm text-gray-500">Add training data</p>
                  </div>
                </button>

                <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">View Analytics</p>
                    <p className="text-sm text-gray-500">Model performance metrics</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Training Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Status</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Active Training Jobs</span>
                    <span className="font-semibold text-blue-600">2</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Queued Jobs</span>
                    <span className="font-semibold text-yellow-600">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed Today</span>
                    <span className="font-semibold text-green-600">5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
