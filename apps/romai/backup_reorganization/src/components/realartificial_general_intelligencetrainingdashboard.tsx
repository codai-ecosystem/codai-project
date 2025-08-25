/**
 * Real AGI Training Dashboard - ZERO FAKE/HARDCODED DATA
 * Shows only REAL data from RomAI AGI Server
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    useRealAGITrainingMetrics,
    useRealCapabilityScores,
    useRealTrainingStatus,
    useRealHealthStatus,
    useRealAGIIntelligenceTest
} from '@/hooks/userealartificial_general_intelligencemetrics';

// Real Progress Bar Component
const RealProgressBar = ({ value, max, label, unit = '%' }: { value: number; max: number; label: string; unit?: string }) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>{label}</span>
                <span>{value.toFixed(2)}{unit}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};

// Real Metric Card Component
const RealMetricCard = ({ title, value, unit = '', color = 'blue', isLoading = false }: {
    title: string;
    value: number | string;
    unit?: string;
    color?: string;
    isLoading?: boolean;
}) => {
    const colorMap = {
        blue: 'from-blue-600 to-blue-800',
        green: 'from-green-600 to-green-800',
        purple: 'from-purple-600 to-purple-800',
        red: 'from-red-600 to-red-800',
        yellow: 'from-yellow-600 to-yellow-800'
    };

    return (
        <motion.div
            className={`p-4 rounded-lg bg-gradient-to-r ${colorMap[color as keyof typeof colorMap]} text-white`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <h3 className="text-sm font-medium opacity-90">{title}</h3>
            {isLoading ? (
                <div className="animate-pulse">
                    <div className="h-8 bg-white/20 rounded mt-2"></div>
                </div>
            ) : (
                <p className="text-2xl font-bold mt-1">
                    {typeof value === 'number' ? value.toFixed(2) : value}{unit}
                </p>
            )}
        </motion.div>
    );
};

// Real Training Dashboard Component
export default function RealAGITrainingDashboard() {
    const { metrics: trainingMetrics, loading: trainingLoading, error: trainingError } = useRealAGITrainingMetrics();
    const { capabilities, loading: capabilitiesLoading, error: capabilitiesError } = useRealCapabilityScores();
    const { status: trainingStatus, loading: statusLoading, error: statusError } = useRealTrainingStatus();
    const { health, loading: healthLoading, error: healthError } = useRealHealthStatus();
    const { testResult, loading: testLoading, error: testError, runTest } = useRealAGIIntelligenceTest();

    const [activeTab, setActiveTab] = useState<'training' | 'capabilities' | 'status' | 'health'>('training');

    const hasErrors = trainingError || capabilitiesError || statusError || healthError;
    const isLoading = trainingLoading || capabilitiesLoading || statusLoading || healthLoading;

    if (hasErrors) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-red-400 mb-4">AGI Server Connection Error</h2>
                        <div className="space-y-2 text-red-300">
                            {trainingError && <p>Training Metrics: {trainingError}</p>}
                            {capabilitiesError && <p>Capabilities: {capabilitiesError}</p>}
                            {statusError && <p>Status: {statusError}</p>}
                            {healthError && <p>Health: {healthError}</p>}
                        </div>
                        <p className="mt-4 text-gray-300">
                            Make sure the RomAI AGI Model Server is running on port 6101
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        RomAI AGI Training Dashboard
                    </h1>
                    <p className="text-gray-300 mt-2">
                        Real-time monitoring of autonomous Romanian AGI development
                    </p>
                    <div className="flex items-center mt-4 space-x-4 text-sm">
                        <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span>AGI Server: {health?.status || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${trainingStatus?.is_training ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></div>
                            <span>Training: {trainingStatus?.is_training ? 'Active' : 'Idle'}</span>
                        </div>
                        <div className="text-gray-400">
                            Uptime: {health?.uptime_seconds ? Math.floor(health.uptime_seconds / 3600) : 0}h
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-6xl mx-auto px-6">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'training', label: 'Training Metrics', icon: '🧠' },
                            { id: 'capabilities', label: 'AGI Capabilities', icon: '⚡' },
                            { id: 'status', label: 'Training Status', icon: '📊' },
                            { id: 'health', label: 'System Health', icon: '❤️' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 px-2 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-300 hover:text-white'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto p-6">
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <span className="ml-4 text-gray-300">Loading real AGI data...</span>
                    </div>
                )}

                {/* Training Metrics Tab */}
                {activeTab === 'training' && trainingMetrics && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <RealMetricCard
                                title="Epochs Completed"
                                value={trainingMetrics.epochs_completed}
                                color="blue"
                            />
                            <RealMetricCard
                                title="Current Loss"
                                value={trainingMetrics.current_loss}
                                color="red"
                            />
                            <RealMetricCard
                                title="Best Loss"
                                value={trainingMetrics.best_loss}
                                color="green"
                            />
                            <RealMetricCard
                                title="Validation Accuracy"
                                value={trainingMetrics.validation_accuracy}
                                unit="%"
                                color="purple"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-xl font-semibold mb-4">Training Progress</h3>
                                <RealProgressBar
                                    value={trainingMetrics.validation_accuracy}
                                    max={100}
                                    label="Validation Accuracy"
                                    unit="%"
                                />
                                <RealProgressBar
                                    value={trainingMetrics.cultural_accuracy}
                                    max={100}
                                    label="Cultural Understanding"
                                    unit="%"
                                />
                                <RealProgressBar
                                    value={trainingMetrics.reasoning_score}
                                    max={100}
                                    label="Reasoning Score"
                                    unit="%"
                                />
                            </div>

                            <div className="bg-gray-800 p-6 rounded-lg">
                                <h3 className="text-xl font-semibold mb-4">Model Parameters</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Total Parameters:</span>
                                        <span className="font-mono">{(trainingMetrics.model_parameters / 1000000).toFixed(1)}M</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Training Samples:</span>
                                        <span className="font-mono">{trainingMetrics.training_samples.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Learning Rate:</span>
                                        <span className="font-mono">{trainingMetrics.learning_rate.toExponential(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Training Time:</span>
                                        <span className="font-mono">{trainingMetrics.training_time_hours.toFixed(1)}h</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Capabilities Tab */}
                {activeTab === 'capabilities' && capabilities && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <RealMetricCard
                                title="Overall AGI Score"
                                value={capabilities.overall_agi_score}
                                unit="%"
                                color="purple"
                            />
                            <RealMetricCard
                                title="Romanian Language"
                                value={capabilities.romanian_language_processing}
                                unit="%"
                                color="blue"
                            />
                            <RealMetricCard
                                title="Cultural Understanding"
                                value={capabilities.cultural_understanding}
                                unit="%"
                                color="green"
                            />
                        </div>

                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">Capability Breakdown</h3>
                            <div className="space-y-4">
                                <RealProgressBar
                                    value={capabilities.romanian_language_processing}
                                    max={100}
                                    label="Romanian Language Processing"
                                />
                                <RealProgressBar
                                    value={capabilities.cultural_understanding}
                                    max={100}
                                    label="Cultural Understanding"
                                />
                                <RealProgressBar
                                    value={capabilities.advanced_reasoning}
                                    max={100}
                                    label="Advanced Reasoning"
                                />
                                <RealProgressBar
                                    value={capabilities.multi_dimensional_intelligence}
                                    max={100}
                                    label="Multi-Dimensional Intelligence"
                                />
                                <RealProgressBar
                                    value={capabilities.meta_learning}
                                    max={100}
                                    label="Meta Learning"
                                />
                                <RealProgressBar
                                    value={capabilities.autonomous_problem_solving}
                                    max={100}
                                    label="Autonomous Problem Solving"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">Intelligence Testing</h3>
                            <div className="flex space-x-4 mb-4">
                                <button
                                    onClick={() => runTest('romanian_reasoning')}
                                    disabled={testLoading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
                                >
                                    {testLoading ? 'Testing...' : 'Test Romanian Reasoning'}
                                </button>
                                <button
                                    onClick={() => runTest('cultural_understanding')}
                                    disabled={testLoading}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg transition-colors"
                                >
                                    {testLoading ? 'Testing...' : 'Test Cultural Understanding'}
                                </button>
                            </div>
                            {testResult && (
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">Test Result:</h4>
                                    <pre className="text-sm text-gray-300 overflow-x-auto">
                                        {JSON.stringify(testResult, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {testError && (
                                <div className="bg-red-900/20 border border-red-500 p-4 rounded-lg">
                                    <p className="text-red-300">Test Error: {testError}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Status Tab */}
                {activeTab === 'status' && trainingStatus && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">Current Training Status</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Training Active:</span>
                                        <span className={`font-semibold ${trainingStatus.is_training ? 'text-green-400' : 'text-gray-400'}`}>
                                            {trainingStatus.is_training ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Current Epoch:</span>
                                        <span className="font-mono">{trainingStatus.current_epoch}/{trainingStatus.total_epochs}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Current Step:</span>
                                        <span className="font-mono">{trainingStatus.current_step}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Current Loss:</span>
                                        <span className="font-mono">{trainingStatus.current_loss.toFixed(6)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Best Loss:</span>
                                        <span className="font-mono">{trainingStatus.best_loss.toFixed(6)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">ETA:</span>
                                        <span className="font-mono">
                                            {trainingStatus.eta_minutes ? `${trainingStatus.eta_minutes}min` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {trainingStatus.message && (
                                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500 rounded-lg">
                                    <p className="text-blue-300">{trainingStatus.message}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Health Tab */}
                {activeTab === 'health' && health && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <RealMetricCard
                                title="Server Status"
                                value={health.status}
                                color={health.status === 'healthy' ? 'green' : 'red'}
                            />
                            <RealMetricCard
                                title="Uptime"
                                value={Math.floor(health.uptime_seconds / 3600)}
                                unit="h"
                                color="blue"
                            />
                            <RealMetricCard
                                title="Models Loaded"
                                value={health.models_loaded}
                                color="purple"
                            />
                            <RealMetricCard
                                title="Total Inferences"
                                value={health.total_inferences}
                                color="yellow"
                            />
                        </div>

                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4">System Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Server Version:</span>
                                    <span className="font-mono">{health.server_version}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Last Updated:</span>
                                    <span className="font-mono">{new Date(health.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Uptime (seconds):</span>
                                    <span className="font-mono">{health.uptime_seconds.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
