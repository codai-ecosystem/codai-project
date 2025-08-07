import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    useAGITrainingMetrics,
    useCapabilityScores,
    useLearningProgress,
    useSafetyMetrics
} from '../../../hooks/useAGIMetrics';
import { BrainVisualization } from './BrainVisualization';
import { TrainingProgressChart } from './TrainingProgressChart';
import { CapabilityRadar } from './CapabilityRadar';
import { SafetyMonitor } from './SafetyMonitor';

interface AGITrainingMetrics {
    currentEpoch: number;
    lossTrajectory: number[];
    convergenceRate: number;
    computeUtilization: {
        gpuUtilization: number;
        memoryUsage: number;
        networkBandwidth: number;
        powerConsumption: number;
    };
    dataIngestionRate: number;
}

interface CapabilityScores {
    reasoning: number;
    creativity: number;
    multimodal: number;
    autonomy: number;
    alignment: number;
    romanian_fluency: number;
}

export default function AGITrainingDashboard() {
    const trainingMetrics = useAGITrainingMetrics();
    const capabilityScores = useCapabilityScores();
    const learningProgress = useLearningProgress();
    const safetyMetrics = useSafetyMetrics();
    const [selectedView, setSelectedView] = useState('overview');

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold gradient-text">AGI Training Control Center</h2>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Training Active
                        </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Epoch {trainingMetrics.currentEpoch} / 1000
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="flex space-x-1">
                    {[
                        { id: 'overview', name: 'Overview', icon: '🧠' },
                        { id: 'training', name: 'Training Progress', icon: '📈' },
                        { id: 'capabilities', name: 'Capabilities', icon: '⚡' },
                        { id: 'architecture', name: 'Neural Architecture', icon: '🏗️' },
                        { id: 'safety', name: 'Safety & Alignment', icon: '🛡️' },
                        { id: 'control', name: 'Training Control', icon: '🎛️' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedView(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedView === tab.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="min-h-[600px]">
                {selectedView === 'overview' && <AGIOverview />}
                {selectedView === 'training' && <TrainingProgress />}
                {selectedView === 'capabilities' && <CapabilitiesView />}
                {selectedView === 'architecture' && <ArchitectureView />}
                {selectedView === 'safety' && <SafetyView />}
                {selectedView === 'control' && <TrainingControlView />}
            </div>
        </div>
    );
}

function AGIOverview() {
    const trainingMetrics = useAGITrainingMetrics();
    const capabilityScores = useCapabilityScores();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* AGI Status Overview */}
            <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🧠 AGI Core Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {trainingMetrics.currentEpoch}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Current Epoch</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            {capabilityScores.reasoning}%
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Reasoning Score</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {trainingMetrics.computeUtilization.gpuUtilization}%
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">GPU Utilization</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                            {trainingMetrics.dataIngestionRate}TB/h
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Data Ingestion</div>
                    </div>
                </div>
            </div>

            {/* Training Progress */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    📈 Training Progress
                </h3>
                <TrainingProgressChart data={trainingMetrics.lossTrajectory} />
            </div>

            {/* Capability Scores */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    ⚡ Capability Radar
                </h3>
                <CapabilityRadar scores={capabilityScores} />
            </div>

            {/* Compute Resources */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    💻 Compute Cluster
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">GPU Utilization</span>
                        <span className="text-sm font-medium">{trainingMetrics.computeUtilization.gpuUtilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${trainingMetrics.computeUtilization.gpuUtilization}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                        <span className="text-sm font-medium">{trainingMetrics.computeUtilization.memoryUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${trainingMetrics.computeUtilization.memoryUsage}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Network I/O</span>
                        <span className="text-sm font-medium">{trainingMetrics.computeUtilization.networkBandwidth}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${trainingMetrics.computeUtilization.networkBandwidth}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Emergent Capabilities */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🌟 Recent Breakthroughs
                </h3>
                <div className="space-y-3">
                    {[
                        { capability: 'Autonomous Code Refactoring', emergence: '2 hours ago', confidence: 98.5 },
                        { capability: 'Romanian Poetry Generation', emergence: '6 hours ago', confidence: 97.2 },
                        { capability: 'Multi-step Mathematical Proofs', emergence: '1 day ago', confidence: 96.8 },
                        { capability: 'Cross-modal Reasoning', emergence: '2 days ago', confidence: 95.1 }
                    ].map((item, index) => (
                        <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="font-medium text-gray-900 dark:text-white">{item.capability}</span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.emergence}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-green-600">{item.confidence}%</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Confidence</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function TrainingProgress() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Loss Landscape Visualization */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🏔️ Loss Landscape Evolution
                    </h3>
                    <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">3D Loss Landscape Visualization</span>
                    </div>
                </div>

                {/* Training Phases */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🎯 Training Phases
                    </h3>
                    <div className="space-y-4">
                        {[
                            { phase: 'Foundation Training', progress: 100, status: 'completed', duration: '180 days' },
                            { phase: 'Capability Enhancement', progress: 85, status: 'active', duration: '120 days' },
                            { phase: 'AGI Emergence', progress: 0, status: 'pending', duration: '90 days' },
                            { phase: 'Continuous Learning', progress: 0, status: 'pending', duration: 'Ongoing' }
                        ].map((phase, index) => (
                            <div key={index} className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-900 dark:text-white">{phase.phase}</span>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${phase.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                            phase.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                            }`}>
                                            {phase.status}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{phase.duration}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${phase.status === 'completed' ? 'bg-green-600' :
                                            phase.status === 'active' ? 'bg-blue-600' : 'bg-gray-400'
                                            }`}
                                        style={{ width: `${phase.progress}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Training Metrics */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    📊 Detailed Training Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">2.847</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Current Loss</div>
                        <div className="text-xs text-green-600 mt-1">↓ -0.023 from last epoch</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">1.2M</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Tokens/second</div>
                        <div className="text-xs text-blue-600 mt-1">↑ +50K from yesterday</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">47.3TB</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Data Processed</div>
                        <div className="text-xs text-gray-600 mt-1">out of 50TB total</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">15.7h</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ETA Next Phase</div>
                        <div className="text-xs text-gray-600 mt-1">Based on current rate</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CapabilitiesView() {
    const capabilityScores = useCapabilityScores();

    return (
        <div className="space-y-6">
            {/* Capability Matrix */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🎯 Capability Development Matrix
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(capabilityScores).map(([capability, score]) => (
                        <div key={capability} className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-medium text-gray-900 dark:text-white capitalize">
                                    {capability.replace('_', ' ')}
                                </span>
                                <span className="text-lg font-bold text-blue-600">{score}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                                <div
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-1000"
                                    style={{ width: `${score}%` }}
                                />
                            </div>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Target: 95% | Current: {score}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Benchmark Results */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🏆 AGI Benchmark Results
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-slate-600">
                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Benchmark</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">RomAI Score</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">GPT-4 Score</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Claude 3</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { benchmark: 'MMLU (Romanian)', romai: 94.2, gpt4: 86.4, claude: 88.7, status: 'leading' },
                                { benchmark: 'ARC Challenge', romai: 91.8, gpt4: 85.2, claude: 87.1, status: 'leading' },
                                { benchmark: 'HellaSwag', romai: 89.7, gpt4: 95.3, claude: 92.8, status: 'improving' },
                                { benchmark: 'HumanEval (Code)', romai: 87.3, gpt4: 84.1, claude: 82.9, status: 'leading' },
                                { benchmark: 'Romanian Cultural Knowledge', romai: 96.8, gpt4: 67.2, claude: 71.4, status: 'leading' },
                                { benchmark: 'Mathematical Reasoning', romai: 85.9, gpt4: 89.6, claude: 87.2, status: 'improving' }
                            ].map((row, index) => (
                                <tr key={index} className="border-b border-gray-100 dark:border-slate-700">
                                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{row.benchmark}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="font-bold text-blue-600">{row.romai}%</span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{row.gpt4}%</td>
                                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">{row.claude}%</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 text-xs rounded-full ${row.status === 'leading'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ArchitectureView() {
    return (
        <div className="space-y-6">
            {/* Neural Architecture Visualization */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    🧠 Neural Architecture Map
                </h3>
                <BrainVisualization />
            </div>

            {/* Architecture Components */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🏗️ Core Components
                    </h3>
                    <div className="space-y-4">
                        {[
                            { component: 'Transformer-Mamba Hybrid', params: '500B', utilization: 87, status: 'active' },
                            { component: 'Mixture of Experts (64)', params: '2.1T', utilization: 73, status: 'active' },
                            { component: 'Multimodal Fusion Network', params: '15B', utilization: 91, status: 'active' },
                            { component: 'Memory Management System', params: '8B', utilization: 65, status: 'active' },
                            { component: 'Meta-Learning Controller', params: '3B', utilization: 82, status: 'active' }
                        ].map((comp, index) => (
                            <div key={index} className="p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-gray-900 dark:text-white">{comp.component}</span>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{comp.params} params</span>
                                        <span className="text-sm font-medium text-blue-600">{comp.utilization}%</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${comp.utilization}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ⚡ Expert Routing Activity
                    </h3>
                    <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">Real-time Expert Routing Heatmap</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SafetyView() {
    const safetyMetrics = useSafetyMetrics();

    return (
        <div className="space-y-6">
            <SafetyMonitor metrics={safetyMetrics} />
        </div>
    );
}

function TrainingControlView() {
    const [isTrainingPaused, setIsTrainingPaused] = useState(false);
    const [learningRate, setLearningRate] = useState(0.0001);

    return (
        <div className="space-y-6">
            {/* Emergency Controls */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
                    🚨 Emergency Training Controls
                </h3>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setIsTrainingPaused(!isTrainingPaused)}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${isTrainingPaused
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        {isTrainingPaused ? '▶️ Resume Training' : '⏸️ Pause Training'}
                    </button>
                    <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors">
                        🔄 Rollback to Last Checkpoint
                    </button>
                    <button className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
                        💾 Create Emergency Checkpoint
                    </button>
                </div>
            </div>

            {/* Training Parameters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ⚙️ Training Parameters
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Learning Rate
                            </label>
                            <input
                                type="number"
                                value={learningRate}
                                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                                step="0.0001"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Batch Size
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                                <option value="512">512</option>
                                <option value="1024">1024</option>
                                <option value="2048">2048</option>
                            </select>
                        </div>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Apply Changes
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🔬 Capability Testing
                    </h3>
                    <div className="space-y-3">
                        {[
                            'Run Romanian Language Test',
                            'Execute Reasoning Benchmark',
                            'Test Multimodal Capabilities',
                            'Validate Safety Alignment',
                            'Benchmark Against GPT-4'
                        ].map((test, index) => (
                            <button
                                key={index}
                                className="w-full px-4 py-2 text-left bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                            >
                                {test}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
