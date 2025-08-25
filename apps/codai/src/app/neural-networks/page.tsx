'use client';

import React, { useState } from 'react';
import {
    Brain,
    Layers,
    Network,
    Cpu,
    Zap,
    Activity,
    TrendingUp,
    BarChart3,
    Settings,
    Play,
    Pause,
    Square,
    RotateCcw,
    Download,
    Upload,
    Eye,
    Edit3,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Target,
    Workflow,
    Code2,
    Database,
    Monitor,
    Gauge,
    LineChart,
    PieChart,
    ArrowRight,
    ArrowDown,
    Circle,
    Square as SquareIcon,
    Triangle,
    Hexagon
} from 'lucide-react';

interface NeuralNetwork {
    id: string;
    name: string;
    architecture: 'CNN' | 'RNN' | 'LSTM' | 'GRU' | 'Transformer' | 'GAN' | 'VAE' | 'DQN';
    status: 'training' | 'deployed' | 'idle' | 'failed' | 'validating';
    accuracy: number;
    loss: number;
    learningRate: number;
    batchSize: number;
    epochs: number;
    currentEpoch: number;
    layers: number;
    parameters: number;
    trainingTime: number;
    lastTrained: Date;
    dataset: string;
    version: string;
    description: string;
}

interface Layer {
    id: string;
    type: 'input' | 'dense' | 'conv2d' | 'lstm' | 'dropout' | 'pooling' | 'activation' | 'output';
    name: string;
    neurons: number;
    activationFunction?: string;
    parameters: Record<string, any>;
    position: { x: number; y: number };
}

const networks: NeuralNetwork[] = [
    {
        id: '1',
        name: 'Code Pattern Recognition CNN',
        architecture: 'CNN',
        status: 'training',
        accuracy: 91.7,
        loss: 0.142,
        learningRate: 0.001,
        batchSize: 32,
        epochs: 100,
        currentEpoch: 67,
        layers: 12,
        parameters: 2845000,
        trainingTime: 180,
        lastTrained: new Date(Date.now() - 2 * 60 * 60 * 1000),
        dataset: 'GitHub Code Repository Dataset',
        version: 'v2.3.1',
        description: 'Convolutional neural network for identifying code patterns and anti-patterns'
    },
    {
        id: '2',
        name: 'Sequence-to-Sequence Code Translator',
        architecture: 'Transformer',
        status: 'deployed',
        accuracy: 87.3,
        loss: 0.089,
        learningRate: 0.0001,
        batchSize: 16,
        epochs: 200,
        currentEpoch: 200,
        layers: 24,
        parameters: 15600000,
        trainingTime: 720,
        lastTrained: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        dataset: 'Multi-Language Code Corpus',
        version: 'v1.8.5',
        description: 'Transformer model for translating code between programming languages'
    },
    {
        id: '3',
        name: 'Bug Detection LSTM',
        architecture: 'LSTM',
        status: 'deployed',
        accuracy: 93.8,
        loss: 0.065,
        learningRate: 0.002,
        batchSize: 64,
        epochs: 150,
        currentEpoch: 150,
        layers: 8,
        parameters: 1250000,
        trainingTime: 240,
        lastTrained: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dataset: 'Vulnerability Database',
        version: 'v3.1.2',
        description: 'LSTM network for detecting potential bugs and security vulnerabilities'
    },
    {
        id: '4',
        name: 'Code Generation GAN',
        architecture: 'GAN',
        status: 'validating',
        accuracy: 78.5,
        loss: 0.234,
        learningRate: 0.0002,
        batchSize: 128,
        epochs: 300,
        currentEpoch: 145,
        layers: 16,
        parameters: 8900000,
        trainingTime: 480,
        lastTrained: new Date(Date.now() - 12 * 60 * 60 * 1000),
        dataset: 'Clean Code Examples',
        version: 'v0.9.3',
        description: 'Generative adversarial network for creating new code snippets'
    },
    {
        id: '5',
        name: 'Performance Prediction DQN',
        architecture: 'DQN',
        status: 'idle',
        accuracy: 85.2,
        loss: 0.178,
        learningRate: 0.001,
        batchSize: 32,
        epochs: 500,
        currentEpoch: 500,
        layers: 6,
        parameters: 750000,
        trainingTime: 360,
        lastTrained: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        dataset: 'Performance Benchmarks',
        version: 'v2.0.1',
        description: 'Deep Q-Network for optimizing application performance'
    }
];

const sampleLayers: Layer[] = [
    { id: '1', type: 'input', name: 'Input Layer', neurons: 784, parameters: {}, position: { x: 50, y: 100 } },
    { id: '2', type: 'conv2d', name: 'Conv2D', neurons: 32, activationFunction: 'ReLU', parameters: { filters: 32, kernel_size: 3 }, position: { x: 200, y: 80 } },
    { id: '3', type: 'pooling', name: 'MaxPooling2D', neurons: 0, parameters: { pool_size: 2 }, position: { x: 350, y: 80 } },
    { id: '4', type: 'conv2d', name: 'Conv2D', neurons: 64, activationFunction: 'ReLU', parameters: { filters: 64, kernel_size: 3 }, position: { x: 500, y: 80 } },
    { id: '5', type: 'pooling', name: 'MaxPooling2D', neurons: 0, parameters: { pool_size: 2 }, position: { x: 650, y: 80 } },
    { id: '6', type: 'dense', name: 'Dense', neurons: 128, activationFunction: 'ReLU', parameters: {}, position: { x: 800, y: 100 } },
    { id: '7', type: 'dropout', name: 'Dropout', neurons: 0, parameters: { rate: 0.5 }, position: { x: 950, y: 100 } },
    { id: '8', type: 'output', name: 'Output Layer', neurons: 10, activationFunction: 'Softmax', parameters: {}, position: { x: 1100, y: 100 } }
];

const architectureMetrics = [
    { name: 'Total Networks', value: 5, change: 1, trend: 'up' },
    { name: 'Active Training', value: 2, change: 0, trend: 'stable' },
    { name: 'Avg Accuracy', value: 87.3, change: 2.4, trend: 'up' },
    { name: 'Total Parameters', value: '29.3M', change: 15.2, trend: 'up' }
];

export default function NeuralNetworksPage() {
    const [selectedNetwork, setSelectedNetwork] = useState<NeuralNetwork | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'architecture'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArchitecture, setSelectedArchitecture] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showLayerDetails, setShowLayerDetails] = useState(false);

    const filteredNetworks = networks.filter(network => {
        const matchesSearch = network.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            network.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesArchitecture = selectedArchitecture === 'all' || network.architecture === selectedArchitecture;
        const matchesStatus = selectedStatus === 'all' || network.status === selectedStatus;
        return matchesSearch && matchesArchitecture && matchesStatus;
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'training': return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
            case 'deployed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'validating': return <Eye className="w-4 h-4 text-orange-600" />;
            case 'idle': return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            default: return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'training': return 'bg-blue-100 text-blue-800';
            case 'deployed': return 'bg-green-100 text-green-800';
            case 'validating': return 'bg-orange-100 text-orange-800';
            case 'idle': return 'bg-yellow-100 text-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getArchitectureIcon = (architecture: string) => {
        switch (architecture) {
            case 'CNN': return <Layers className="w-4 h-4" />;
            case 'RNN': return <Network className="w-4 h-4" />;
            case 'LSTM': return <Activity className="w-4 h-4" />;
            case 'GRU': return <Workflow className="w-4 h-4" />;
            case 'Transformer': return <Zap className="w-4 h-4" />;
            case 'GAN': return <Target className="w-4 h-4" />;
            case 'VAE': return <Brain className="w-4 h-4" />;
            case 'DQN': return <Cpu className="w-4 h-4" />;
            default: return <Brain className="w-4 h-4" />;
        }
    };

    const getLayerIcon = (type: string) => {
        switch (type) {
            case 'input': return <Circle className="w-6 h-6 text-green-600" />;
            case 'dense': return <SquareIcon className="w-6 h-6 text-blue-600" />;
            case 'conv2d': return <Hexagon className="w-6 h-6 text-purple-600" />;
            case 'lstm': return <Activity className="w-6 h-6 text-orange-600" />;
            case 'dropout': return <Triangle className="w-6 h-6 text-gray-600" />;
            case 'pooling': return <SquareIcon className="w-6 h-6 text-indigo-600" />;
            case 'activation': return <Zap className="w-6 h-6 text-yellow-600" />;
            case 'output': return <Circle className="w-6 h-6 text-red-600" />;
            default: return <Circle className="w-6 h-6 text-gray-600" />;
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    return (
        <div className="min-h-screen bg-gray-50 ml-80">
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Neural Networks</h1>
                            <p className="text-gray-600 mt-2">Design, train, and deploy deep learning neural networks</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    List View
                                </button>
                                <button
                                    onClick={() => setViewMode('architecture')}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'architecture' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Architecture
                                </button>
                            </div>
                            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                <Plus className="w-4 h-4" />
                                <span>New Network</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {architectureMetrics.map((metric, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm">{metric.name}</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                        {metric.change !== 0 && (
                                            <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' :
                                                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                {metric.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                                                {metric.trend === 'down' && <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                                                <span>{Math.abs(metric.change)}{typeof metric.value === 'string' ? '' : '%'}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {viewMode === 'list' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Networks List */}
                        <div className="lg:col-span-2">
                            {/* Filters */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search networks..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                                            />
                                        </div>

                                        <select
                                            value={selectedArchitecture}
                                            onChange={(e) => setSelectedArchitecture(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">All Architectures</option>
                                            <option value="CNN">CNN</option>
                                            <option value="RNN">RNN</option>
                                            <option value="LSTM">LSTM</option>
                                            <option value="GRU">GRU</option>
                                            <option value="Transformer">Transformer</option>
                                            <option value="GAN">GAN</option>
                                            <option value="VAE">VAE</option>
                                            <option value="DQN">DQN</option>
                                        </select>

                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="training">Training</option>
                                            <option value="deployed">Deployed</option>
                                            <option value="validating">Validating</option>
                                            <option value="idle">Idle</option>
                                            <option value="failed">Failed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Networks Grid */}
                            <div className="space-y-4">
                                {filteredNetworks.map((network) => (
                                    <div
                                        key={network.id}
                                        className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => setSelectedNetwork(network)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <div className="p-2 bg-purple-100 rounded-lg">
                                                        {getArchitectureIcon(network.architecture)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{network.name}</h3>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-sm text-gray-600">{network.architecture}</span>
                                                            <span className="text-sm text-gray-400">•</span>
                                                            <span className="text-sm text-gray-600">v{network.version}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-gray-600 mb-4">{network.description}</p>

                                                <div className="flex items-center space-x-4 mb-4">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(network.status)}
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(network.status)}`}>
                                                            {network.status}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-600">{network.layers} layers</span>
                                                    <span className="text-sm text-gray-600">{formatNumber(network.parameters)} params</span>
                                                </div>

                                                {network.status === 'training' && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                                            <span>Training Progress</span>
                                                            <span>{Math.round((network.currentEpoch / network.epochs) * 100)}% ({network.currentEpoch}/{network.epochs} epochs)</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${(network.currentEpoch / network.epochs) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-4 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Accuracy</p>
                                                        <p className="font-semibold text-gray-900">{network.accuracy}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Loss</p>
                                                        <p className="font-semibold text-gray-900">{network.loss.toFixed(3)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Learning Rate</p>
                                                        <p className="font-semibold text-gray-900">{network.learningRate}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Batch Size</p>
                                                        <p className="font-semibold text-gray-900">{network.batchSize}</p>
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
                        </div>

                        {/* Network Details Sidebar */}
                        <div className="space-y-6">
                            {selectedNetwork && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Details</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{selectedNetwork.name}</h4>
                                            <p className="text-sm text-gray-600">{selectedNetwork.description}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Architecture</p>
                                                <p className="font-medium">{selectedNetwork.architecture}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Version</p>
                                                <p className="font-medium">v{selectedNetwork.version}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Status</p>
                                                <div className="flex items-center space-x-1">
                                                    {getStatusIcon(selectedNetwork.status)}
                                                    <span className="font-medium capitalize">{selectedNetwork.status}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Layers</p>
                                                <p className="font-medium">{selectedNetwork.layers}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Parameters</p>
                                                    <p className="font-medium">{formatNumber(selectedNetwork.parameters)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Dataset</p>
                                                    <p className="font-medium text-xs">{selectedNetwork.dataset}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Training Time</p>
                                                    <p className="font-medium">{Math.floor(selectedNetwork.trainingTime / 60)}h {selectedNetwork.trainingTime % 60}m</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Last Trained</p>
                                                    <p className="font-medium">
                                                        {Math.floor((Date.now() - selectedNetwork.lastTrained.getTime()) / (1000 * 60 * 60 * 24))}d ago
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex flex-col space-y-2">
                                                <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                    <Play className="w-4 h-4" />
                                                    <span>Start Training</span>
                                                </button>
                                                <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                                                    <Eye className="w-4 h-4" />
                                                    <span>View Architecture</span>
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
                                            <p className="font-medium">Create Network</p>
                                            <p className="text-sm text-gray-500">Start a new neural network</p>
                                        </div>
                                    </button>

                                    <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                        <Upload className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Import Model</p>
                                            <p className="text-sm text-gray-500">Load existing network</p>
                                        </div>
                                    </button>

                                    <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                        <BarChart3 className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">View Analytics</p>
                                            <p className="text-sm text-gray-500">Training performance metrics</p>
                                        </div>
                                    </button>

                                    <button className="w-full flex items-center space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                                        <Database className="w-5 h-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Manage Datasets</p>
                                            <p className="text-sm text-gray-500">Configure training data</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Architecture View */
                    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-semibold text-gray-900">Network Architecture Visualization</h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowLayerDetails(!showLayerDetails)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    {showLayerDetails ? 'Hide Details' : 'Show Details'}
                                </button>
                                <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Edit Architecture
                                </button>
                            </div>
                        </div>

                        {/* Architecture Diagram */}
                        <div className="relative overflow-x-auto">
                            <div className="flex items-center justify-center min-w-max p-8">
                                <svg width="1200" height="300" className="border border-gray-200 rounded-lg bg-gray-50">
                                    {/* Connection lines */}
                                    {sampleLayers.slice(0, -1).map((layer, index) => {
                                        const nextLayer = sampleLayers[index + 1];
                                        return (
                                            <line
                                                key={`line-${layer.id}`}
                                                x1={layer.position.x + 50}
                                                y1={layer.position.y + 25}
                                                x2={nextLayer.position.x}
                                                y2={nextLayer.position.y + 25}
                                                stroke="#6b7280"
                                                strokeWidth="2"
                                                markerEnd="url(#arrowhead)"
                                            />
                                        );
                                    })}

                                    {/* Arrow marker */}
                                    <defs>
                                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                                        </marker>
                                    </defs>

                                    {/* Layer nodes */}
                                    {sampleLayers.map((layer) => (
                                        <g key={layer.id}>
                                            <rect
                                                x={layer.position.x}
                                                y={layer.position.y}
                                                width="100"
                                                height="50"
                                                rx="8"
                                                fill={
                                                    layer.type === 'input' ? '#10b981' :
                                                        layer.type === 'output' ? '#ef4444' :
                                                            layer.type === 'conv2d' ? '#8b5cf6' :
                                                                layer.type === 'dense' ? '#3b82f6' :
                                                                    layer.type === 'lstm' ? '#f59e0b' :
                                                                        '#6b7280'
                                                }
                                                fillOpacity="0.1"
                                                stroke={
                                                    layer.type === 'input' ? '#10b981' :
                                                        layer.type === 'output' ? '#ef4444' :
                                                            layer.type === 'conv2d' ? '#8b5cf6' :
                                                                layer.type === 'dense' ? '#3b82f6' :
                                                                    layer.type === 'lstm' ? '#f59e0b' :
                                                                        '#6b7280'
                                                }
                                                strokeWidth="2"
                                                className="cursor-pointer hover:fill-opacity-20 transition-all"
                                            />
                                            <text
                                                x={layer.position.x + 50}
                                                y={layer.position.y + 25}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="text-xs font-medium fill-gray-900"
                                            >
                                                {layer.name}
                                            </text>
                                            {layer.neurons > 0 && (
                                                <text
                                                    x={layer.position.x + 50}
                                                    y={layer.position.y + 40}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="text-xs fill-gray-600"
                                                >
                                                    {layer.neurons} neurons
                                                </text>
                                            )}
                                        </g>
                                    ))}
                                </svg>
                            </div>
                        </div>

                        {/* Layer Details */}
                        {showLayerDetails && (
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {sampleLayers.map((layer) => (
                                    <div key={layer.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            {getLayerIcon(layer.type)}
                                            <h4 className="font-medium text-gray-900">{layer.name}</h4>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Type:</span>
                                                <span className="font-medium capitalize">{layer.type}</span>
                                            </div>
                                            {layer.neurons > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Neurons:</span>
                                                    <span className="font-medium">{layer.neurons}</span>
                                                </div>
                                            )}
                                            {layer.activationFunction && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Activation:</span>
                                                    <span className="font-medium">{layer.activationFunction}</span>
                                                </div>
                                            )}
                                            {Object.keys(layer.parameters).length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                    {Object.entries(layer.parameters).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between">
                                                            <span className="text-gray-500">{key}:</span>
                                                            <span className="font-medium">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
